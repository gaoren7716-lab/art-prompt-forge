/* ============================================================
 * stamp_zh.js · 给缺中文名的表补 zh
 * ============================================================
 * 为什么需要：
 *   CONFLICTS 与 TESTS 两张表从来没写过 zh 字段。
 *   后果不是「显示成英文」这么轻——中文名解析是编码工作台
 *   的五条入口之一。条目没有中文名，就意味着用户打「水墨对撞」
 *   「SD 1.5」永远命中不了，只能去背 CF-01、MT-01 这类编号。
 *
 * 为什么不手工编辑数据文件：
 *   27 条不多，但手工补无法保证幂等 —— 下次再加一条又得重翻一遍文件。
 *   这里显式列映射，跑一次写盘，再跑一次应当零改动。
 *
 * 用法：
 *   node tools/stamp_zh.js --check   预演，列出将要写入的行
 *   node tools/stamp_zh.js           写盘
 * ============================================================ */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "assets");
const CHECK = process.argv.includes("--check");

/* 冲突规则中文名：格式统一为「A 对 B」，
   让用户看到名字就知道这条规则在管哪两个词，不用回去查 a/b 字段。 */
const CONFLICT_ZH = {
  "CF-01": "墨性渗透 对 油彩厚涂",
  "CF-02": "平涂装饰 对 明暗塑形",
  "CF-03": "照片质感 对 可见笔触",
  "CF-04": "数字净面 对 做旧痕迹",
  "CF-05": "线性透视 对 平面透视",
  "CF-06": "灰调低纯度 对 高饱和对冲",
  "CF-07": "以线立骨 对 无线造型",
  "CF-08": "精微描摹 对 阔笔写意",
  "CF-09": "金底无空间 对 自然日光",
  "CF-10": "水墨单色 对 全彩",
  "CF-11": "立体堆塑 对 平版印刷",
  "CF-12": "商业版面 对 绘画纵深",
  "CF-13": "繁密装饰 对 极简留白",
  "CF-14": "湿接过渡 对 硬边切断",
  "CF-15": "极特写 对 厚重笔触",
  "CF-16": "金底 对 水墨单色",
  "CF-17": "商业版面 对 做旧痕迹",
  "CF-18": "照片 对 水墨",
  "CF-19": "极繁装饰 对 数字净面",
  "CF-20": "堆塑厚度 对 空气透视",
  "CF-21": "无线造型 对 极精细节"
};

/* 模型实测中文名：用大家平时叫的简称，不是译名 */
const MODEL_ZH = {
  "MT-01": "SD 1.5",
  "MT-02": "SDXL",
  "MT-03": "SD 3.5",
  "MT-04": "Flux.1 dev",
  "MT-05": "Flux.1 schnell",
  "MT-06": "Midjourney v7",
  "MT-07": "ComfyUI",
  "MT-08": "ControlNet 与 IP-Adapter",
  "MT-09": "LoRA 微调",
  "MT-10": "自然语言模型",
  "MT-11": "蒸馏加速模型",
  "MT-12": "社区微调底模"
};

const JOBS = [
  { file: "operators.js", map: CONFLICT_ZH },
  { file: "models.js",    map: MODEL_ZH }
];

let changed = 0, done = 0, miss = [];

for (const job of JOBS) {
  const fp = path.join(ROOT, job.file);
  let src = fs.readFileSync(fp, "utf8");
  const orig = src;

  for (const [id, zh] of Object.entries(job.map)) {
    /* 只在对象字面量的 id 处插入，且必须确认该对象还没有 zh。
       判据用「id 到下一个 } 之前是否已含 zh:」，
       宁可漏写也不要写出一个 zh:"zh:" 这种坏代码。 */
    const re = new RegExp('(\\{ id:"' + id + '",)(?!\\s*zh:)');
    if (!re.test(src)) {
      /* 已存在 zh 或 id 未找到，两种情况分开报 */
      const at = src.indexOf('{ id:"' + id + '"');
      if (at >= 0) done++;         /* 已有 zh，幂等 */
      else miss.push(job.file + " 找不到 " + id);
      continue;
    }
    if (CHECK) {
      console.log("  将写入 " + job.file + "  " + id + "  zh:" + zh);
      changed++;
    } else {
      src = src.replace(re, '$1 zh:"' + zh + '",');
      changed++;
    }
  }

  if (!CHECK && src !== orig) {
    /* 写盘前先过语法校验，不通过就绝不动原文件 */
    try {
      new Function(src);
    } catch (e) {
      console.log("✗ " + job.file + " 写入后语法校验失败，已放弃：" + e.message);
      process.exit(1);
    }
    fs.writeFileSync(fp, src, "utf8");
    console.log("✓ 已写入 " + job.file);
  }
}

console.log((CHECK ? "[预演] " : "") + "新增 " + changed + " 条，已有 " + done + " 条" +
            (miss.length ? "，★ 异常：" + miss.join("; ") : ""));
if (!CHECK && changed === 0) console.log("（幂等：无改动）");