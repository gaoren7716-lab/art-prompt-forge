""" ============================================================
 * gallery_img.py —— 画廊配图后处理：水印/假签名修补 + 压缩入库
 *
 * 为什么需要它：出图平台会在右下角压半透明水印，并且模型爱在画面里
 * 画一个假签名。画廊里挂带别人 logo 的图是不能留的，但每张手工修一次
 * 很容易漏 —— 批量配图时 40 张漏 3 张就很难看。规则写在这里，一个真源。
 *
 * 用法（两步）：
 *   1. 先用引擎合成的 gpt 词面出图到 gallery/_raw/ 目录（1536x1024）
 *   2. python tools/gallery_img.py gallery/_raw/xxx.png G-01
 *
 * 产出 gallery/<编码>.png，同时把相对路径追加进 assets/gallery-imgs.js。
 *
 * 修补原理：右下角是深色木纹/墙面，纹理在同列正上方重复出现，
 * 所以从左侧等宽等高取带水平翻转后往覆盖，接缝处做羽化。
 * **右侧与底边必须全实** —— 水印贴底，底边羽化会让它重新露出来。
 *
 * 尺寸：卡片色卡区逻辑宽 354px、详情大图逻辑宽 816px，
 * 2x 屏需要 708/1632px。取 1200px 是权衡：详情页放大 1.47 倍肉眼看不出软，
 * 而 1600px 会让单文件版多背 4MB。
 *
 * 为什么是 PNG 而不是 JPEG：绘画类图像有大面积平涂色块，JPEG 的块效应
 * 与色带在暗部（维米尔的褐墙、伦勃朗的深棕）最明显。代价是体积更大，
 * 所以入库用调色板量化（P mode）压，不做无损 PNG 直存。
 * ============================================================ """
import io
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GALLERY = os.path.join(ROOT, "gallery")
MANIFEST = os.path.join(ROOT, "assets", "gallery-imgs.js")

TARGET_W = 1200   # 入库宽度
# PALETTE：2<= 调色板色数 <=256 时启用量化，0 = 不量化存无损 RGB PNG。
# 默认关闭 —— 实测 256 色在暗部（褐墙、白头巾阴影）有明显色带与噪点，
# 绘画的连续色调吃不住。无损 PNG 1200px 约 1.3MB，
# 但单文件版注入时由 sharp 转成 JPEG（见 build_standalone.js），
# 页面版直接读原 PNG 文件、无损全保 —— 两边都不亏。
PALETTE = 0
PNG_OPTS = {"optimize": True, "compress_level": 9}
PAD_X = 1380      # 修补区左界：实测水印在 x>=1408 起，往左留边
PAD_TOP = 850     # 修补区上界：模型假签名最高可到 y≈858


def is_watermarkish(r, g, b):
    # 水印与假签名都是近灰亮色，与画面里的褐/蓝/肤色明显不同。
    # 阈值靠采样定：褐色木纹 r≈65-95 且r>b，灰色水印 r≈160-175 且 r≈g≈b。
    return r > 135 and abs(r - g) < 22 and abs(g - b) < 30 and abs(r - b) < 40


def watermark_columns(im, y_from):
    # 按列密度实测水印区间。逐像素包围盒会被画面自身的灰白高光骗到
    #（实测G-01 报x=928 起，逐列一数其实 x=1408 才起），所以用列密度。
    px = im.load()
    W, H = im.size
    cols = []
    for x in range(PAD_X - 200, W, 4):
        n = 0
        for y in range(y_from, H):
            if is_watermarkish(*px[x, y][:3]):
                n += 1
        if n >= 3:
            cols.append(x)
    return (min(cols), max(cols)) if cols else None


def patch(im):
    """抹掉右下角水印与假签名。返回修补区或 None（无需修）。"""
    W, H = im.size
    cols = watermark_columns(im, PAD_TOP - 10)
    if not cols:
        return None
    print("  水印列区间: x %d-%d (画布 %dx%d)" % (cols[0], cols[1], W, H))

    # 修补区罩住实测列区间并**贴到画面底边**（水印贴底，底边羽化会露出来）
    X0 = min(PAD_X, cols[0] - 28)
    Y0 = PAD_TOP
    X1, Y1 = W, H
    bw, bh = X1 - X0, Y1 - Y0

    # 源带取**左侧等宽等高**的一块并水平翻转。
    # 试过「正上方取带 + 暖褐色温补偿」：补块明显偏亮，横向还留一道硬接缝——
    # 源带与修补区行数不同 + 该区并非纯木纹（可能是蓝袍、窗框），两种纹理
    # 硬拼必然露馅。同列左右取样颜色天然同源，翻转后走向也接得上。
    sx0 = X0 - bw
    if sx0 < 0:
        raise SystemExit("画布太窄，左边放不下等宽源带")
    src = im.crop((sx0, Y0, sx0 + bw, Y0 + bh)).transpose(Image.FLIP_LEFT_RIGHT)

    mask = Image.new("L", (bw, bh), 255)
    d = ImageDraw.Draw(mask)
    fade = 50
    for i in range(fade):
        d.line([(i, 0), (i, bh - 1)], fill=int(255 * i / fade))
        d.line([(0, i), (bw - 1, i)], fill=int(255 * i / fade))
    mask = mask.filter(ImageFilter.GaussianBlur(12))

    im.paste(src, (X0, Y0), mask)
    return (X0, Y0, X1, Y1)


def verify(im, region):
    """修补后复核：修补区里不该再有成片近灰亮像素。

    不复核等于没修 —— 羽化边界漏一行水印，肉眼在 354px 的卡面上看不出来，
    点开详情大图就露馅了。
    判据用**密度**而非包围盒：单个高光像素（衣领反光、笔触亮点）不算残余，
    连续多列都有才是。
    """
    px = im.load()
    W, H = im.size
    x0, y0, x1, y1 = region
    bad = 0
    for x in range(x0 + 8, min(x1, W)):
        n = sum(1 for y in range(y0, min(y1, H)) if is_watermarkish(*px[x, y][:3]))
        if n >= 3:
            bad += 1
    if bad:
        print("  ! 复核未过：修补区内仍有 %d 列成片近灰亮像素" % bad)
        return False
    return True


def register(code, relpath):
    """把 id → 路径登记进 assets/gallery-imgs.js（幂等：已存在则替换路径）。"""
    s = io.open(MANIFEST, encoding="utf-8").read()
    entry = '  "%s": "%s"' % (code, relpath)   # 两空格缩进，与文件既有格式一致
    if re.search(r'"%s"\s*:\s*"[^"]*"' % re.escape(code), s):
        s = re.sub(r'"%s"\s*:\s*"[^"]*"' % re.escape(code), entry, s)
    else:
        s = re.sub(r"(var GALLERY_IMGS = \{\s*)",
                   lambda m: m.group(1) + entry + "\n",
                   s, count=1)
    io.open(MANIFEST, "w", encoding="utf-8").write(s)
    print("  已登记 %s -> %s" % (code, relpath))


def save_png(im, dst):
    # 存 PNG。PALETTE=0 时是无损 RGB（默认，保住绘画连续色调）；
    # PALETTE 设成 2..256 才量化。实测无损 1312KB / 256 色 519KB，
    # 但 256 色在暗部色带明显，所以默认不用。
    # 单文件版注入时由 sharp 转 JPEG，页面版直接读这个文件 —— 两边都不亏。
    w = TARGET_W
    h = int(round(w * im.height / im.width))
    out = im.resize((w, h), Image.LANCZOS)
    # 注意：判断要写成 2 <= PALETTE <= 256。写 PALETTE < 256 会把
    # colors=256 一起跳过 —— 256 恰好是上限，条件永远不成立。
    if PALETTE and 2 <= PALETTE <= 256:
        out = out.quantize(colors=PALETTE, method=Image.MEDIANCUT, dither=Image.NONE)
    out.save(dst, "PNG", **PNG_OPTS)
    kb = os.path.getsize(dst) / 1024
    print("  入库: %s  %dx%d  %.0fKB" % (os.path.basename(dst), out.size[0], out.size[1], kb))
    return out.size


def process(src_path, code, keep_master=True):
    if not os.path.isdir(GALLERY):
        os.makedirs(GALLERY)
    im = Image.open(src_path).convert("RGB")

    region = patch(im)
    if region:
        ok = verify(im, region)
        print("  修补复核:%s" % ("通过" if ok else "未通过 —— 建议手动看图"))
        if keep_master:
            m = os.path.join(GALLERY, "_master_%s.png" % code)
            im.save(m)
            print("  母版留档: gallery/_master_%s.png（重切尺寸不必重新出图）" % code)
    else:
        print("  未检出水印/签名，按原图入库")

    dst = os.path.join(GALLERY, "%s.png" % code)
    save_png(im, dst)
    register(code, "gallery/%s.png" % code)
    return dst


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    process(sys.argv[1], sys.argv[2])