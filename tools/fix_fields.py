# -*- coding: utf-8 -*-
"""
fix_fields.py —— 按条目 ID 整体重写指定的中文字段
背景：中英混杂严重时逐词打补丁容易漏、也容易改坏结构，
      直接按 ID 整行重写 desc / note，反而又快又干净。

用法：
  python tools/fix_fields.py            # 读 tools/_fields_fix.json 修 assets 下所有文件
"""
import sys, os, io, json, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP_FILE = os.path.join(BASE, "tools", "_fields_fix.json")


def main():
    if not os.path.exists(MAP_FILE):
        print("没有待修字段映射，跳过")
        return 0
    fixes = json.load(open(MAP_FILE, encoding="utf-8"))
    d = os.path.join(BASE, "assets")
    total = 0
    for fn in sorted(x for x in os.listdir(d) if x.endswith(".js")):
        path = os.path.join(d, fn)
        lines = open(path, encoding="utf-8").read().split("\n")
        cur = None
        out = []
        hit = 0
        for ln in lines:
            m = re.search(r'id:"(P-[A-Za-z0-9]+|M-[0-9]+|S-[0-9]+|MD-[0-9]+|OP-[A-Z]-[0-9]+|W-[0-9]+)"', ln)
            if m:
                cur = m.group(1)
            f = fixes.get(cur)
            if f:
                for key in ("desc", "note", "zh"):
                    mm = re.match(r"^(\s*%s:)\"(.*)\"(.*?)$" % key, ln)
                    if mm and key in f:
                        ln = '%s"%s"%s' % (mm.group(1), f[key], mm.group(3))
                        total += 1
                        hit += 1
            out.append(ln)
        if hit:
            open(path, "w", encoding="utf-8").write("\n".join(out))
            print("==== %s 重写 %d 个字段 ====" % (fn, hit))
    print("\n合计重写：%d 个字段" % total)
    return 0


if __name__ == "__main__":
    sys.exit(main())
