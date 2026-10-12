/* ============================================================
 * gen_op_meta.js —— 为 38 个算子批量生成 preserve / change / forbid
 *
 * 用法：node tools/gen_op_meta.js
 *
 * 为什么要生成而不是手写：这三字段本质是算子结构的函数。
 *   change   = inject 触及的面 + only 之外被静音的面
 *   preserve = keep（若有）否则 全部面 减 change
 *   forbid   = neg 的语义 + 该类型算子的通用禁忌
 * 手写 38 遍必然出现前后不一致，生成则永远自洽。
 *
 * 例外清单 EXCLUDE 放在文件末尾，需要人工判断的条目写在那里，
 * 生成时优先于推导结果。
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const load = require("./_load.js");

load();
const OPS = require("../assets/data-core.js").OPERATORS;
const ALL = ["medium", "brush", "color", "light", "space", "motif", "spirit"];

/* ---------- 1. change：这个算子实际动了哪几个面 ---------- */
function changeOf(o) {
  if (o.kind === "decouple") return ALL.filter(f => !(o.only || []).includes(f));
  const inj = Object.keys(o.inject || {});
  if (inj.length) return inj;
  /* 融合与呈现类算子不碰七个面，改的是散词层 */
  return [];
}

/* ---------- 2. preserve：必须原样留住的 ---------- */
/* 原则：算子没写入的面就是保留面。keep 是一层额外限制（连没改的面
   也一并静音，属时代迁移的刻意选择），它不能把没归类的面弄丢。 */
function preserveOf(o) {
  if (o.kind === "decouple") return (o.only || []).slice();
  const ch = changeOf(o);
  if (o.keep && o.keep.length) {
    const kept = o.keep.filter(f => !ch.includes(f));
    /* 没被 inject 触及、也没写进 keep 的面（如 motif）：默认保留，
       因为时代迁移要换的是物质与空间，不是画什么 */
    const rest = ALL.filter(f => !ch.includes(f) && !o.keep.includes(f));
    return kept.concat(rest);
  }
  return ALL.filter(f => !ch.includes(f));
}

/* ---------- 3. forbid：绝对不能出现的 ---------- */
/* 每类算子的通用禁忌，来自这一类操作在实践中最常翻车的地方 */
const FORBID_COMMON = {
  era: [
    "modern lighting", "modern furniture", "electric wires", "plastic material",
    "digital gloss"
  ],
  medium: [
    "mixed incompatible physical media", "physically impossible material layering"
  ],
  subject: [
    "wrong era props", "anachronistic objects", "empty narrative scene"
  ],
  decouple: [
    "uncontrolled style bleed from muted facets"
  ],
  fuse: [
    "featureless generic output", "identity dilution between sources"
  ],
  present: [
    "text artifacts", "watermark", "signature"
  ]
};

/* 逐条算子的具体禁忌：neg 字段已经是可执行版本，
   这里写的是 neg 表达不了的那部分意图（例如「不要两种光源」） */
const FORBID_EXTRA = {
  "OP-E-01": ["multiple light sources", "oil impasto ridges"],
  "OP-E-02": ["flat even lighting", "empty minimal composition"],
  "OP-E-03": ["cast shadow", "atmospheric perspective", "photoreal skin"],
  "OP-E-04": ["linear perspective", "western horizon line", "color saturation"],
  "OP-E-05": ["bright daylight", "clean clinical surface"],
  "OP-E-06": ["heavy impasto", "harsh contrast"],
  "OP-E-07": ["led panel", "composite material", "digital glow"],
  "OP-M-01": ["canvas weave", "brush hair marks", "gloss varnish"],
  "OP-M-02": ["impasto ridges", "wet blending", "deep shadow"],
  "OP-M-03": ["soft gradient", "photographic texture", "more than three spot colours"],
  "OP-M-04": ["airbrush smooth skin", "rendered micro detail"],
  "OP-M-05": ["soft optical blending", "continuous tone gradient"],
  "OP-M-06": ["colour", "smooth gradient", "photographic depth of field"],
  "OP-M-07": ["visible brushstroke", "painted texture", "canvas weave"],
  "OP-M-08": ["synthetic fluorescent hue", "smooth digital surface"],
  "OP-M-09": ["canvas texture", "handmade irregularity", "impasto"],
  "OP-M-10": ["paper fibre", "hand drawn outline", "physical print artefact"],
  "OP-S-01": ["empty landscape without subject", "modern urban elements"],
  "OP-S-02": ["carnival crowds", "flat graphic signage"],
  "OP-S-03": ["clinical emptiness", "modern furniture"],
  "OP-S-04": ["purely abstract field", "no human presence"],
  "OP-S-05": ["wide establishing shot", "tiny distant subject"],
  "OP-S-06": ["human figure", "figurative narrative"],
  "OP-S-07": ["empty architectural shell", "absence of atmosphere"],
  "OP-S-08": ["scattered clutter", "hard edge geometric order"],
  "OP-D-01": ["impasto texture", "structural line emphasis"],
  "OP-D-02": ["flat decorative colour", "linear perspective stress"],
  "OP-D-03": ["volumetric light modelling", "surface texture emphasis"],
  "OP-D-04": ["hard edge graphic division", "flat colour blocking"],
  "OP-D-05": ["surface texture emphasis", "perspective construction"],
  "OP-F-01": ["identity dilution", "uniformly averaged output"],
  "OP-F-02": ["identity dilution", "mutually cancelling directives"],
  "OP-F-03": ["featureless generic output"],
  "OP-P-01": ["flat even lighting", "blown highlight"],
  "OP-P-02": ["pristine digital surface", "hdr bloom", "oversaturated neon"],
  "OP-P-03": ["plastic texture", "vector flatness"],
  "OP-P-04": ["shallow depth of field", "blurred fine detail"],
  "OP-P-05": ["flat even lighting", "no light hierarchy"]
};

/* 人工覆盖：推导不对的条目写这里 */
const EXCLUDE = {};

function build(o) {
  const override = EXCLUDE[o.id];
  const change  = changeOf(o);
  const preserve = preserveOf(o);
  const forbid = uniq([].concat(
    FORBID_COMMON[o.kind] || [],
    FORBID_EXTRA[o.id] || [],
    override && override.forbid || []
  ));
  return {
    id: o.id,
    preserve: preserve,
    change: change,
    forbid: forbid,
    note: override && override.note || null
  };
}

function uniq(a) {
  const s = new Set(), out = [];
  a.forEach(x => { const k = x.toLowerCase(); if (s.has(k)) return; s.add(k); out.push(x); });
  return out;
}

/* ---------- 输出为数据文件，让引擎与界面都能读到 ---------- */
const rows = OPS.map(build);
const lines = [];
lines.push("/* ============================================================");
lines.push(" * operators-meta.js —— 算子的 preserve / change / forbid 三字段");
lines.push(" *");
lines.push(" * 本文件由 tools/gen_op_meta.js 自动生成，不要手工编辑。");
lines.push(" * 改了算子结构（inject / keep / only）就重跑生成器。");
lines.push(" *");
lines.push(" * 三字段的用途：");
lines.push(" *   preserve —— 变形时必须原样保留的面，是变形的底线");
lines.push(" *   change   —— 变形实际改动的面，其余来源在这些面上让位");
lines.push(" *   forbid   —— 绝对不能出现的特征，进负面词且不参与权重调节");
lines.push(" * ============================================================ */");
lines.push('if (typeof module !== "undefined" && module.exports) var _OMC = require("./data-core.js");');
lines.push("");
lines.push("var OP_META = [");
rows.forEach((r, i) => {
  lines.push(`{ id:"${r.id}", preserve:${JSON.stringify(r.preserve)}, change:${JSON.stringify(r.change)}, forbid:${JSON.stringify(r.forbid)} }${i < rows.length - 1 ? "," : ""}`);
});
lines.push("];");
lines.push("");
lines.push('/* 把三字段挂回算子本体，引擎与界面读同一个对象，避免两份数据不一致。');
lines.push('   注意：浏览器里顶层 var 会挂到 window 上，所以要同时兼容 window.OPERATORS */');
lines.push('var _OMC = (typeof module !== "undefined" && module.exports)');
lines.push('  ? require("./data-core.js")');
lines.push('  : (typeof window !== "undefined" ? window : this);');
lines.push("OP_META.forEach(function (m) {");
lines.push("  var list = _OMC.OPERATORS || (typeof OPERATORS !== \"undefined\" ? OPERATORS : []);");
lines.push("  var o = list.filter(function (x) { return x.id === m.id; })[0];");
lines.push("  if (!o) return;");
lines.push("  o.preserve = m.preserve; o.change = m.change; o.forbid = m.forbid;");
lines.push("});");
lines.push("");
lines.push('if (typeof module !== "undefined" && module.exports) module.exports = { OP_META };');
lines.push("");

const OUT = path.join(__dirname, "..", "assets", "operators-meta.js");
fs.writeFileSync(OUT, lines.join("\n"), "utf-8");

/* 校验：preserve 与 change 不得有交集；两者合计不得缺面（解构类除外） */
let bad = 0;
rows.forEach(r => {
  const inter = r.preserve.filter(f => r.change.includes(f));
  if (inter.length) {
    console.log(`${r.id}  preserve 与 change 交集：${inter.join(",")}`);
    bad++;
  }
  const id = r.id;
  const o = OPS.filter(x => x.id === id)[0];
  if (o.kind !== "decouple" && o.kind !== "present" && o.kind !== "fuse") {
    const miss = ["medium","brush","color","light","space","motif","spirit"]
      .filter(f => !r.preserve.includes(f) && !r.change.includes(f));
    if (miss.length) { console.log(`${id}  未被归类的面：${miss.join(",")}`); bad++; }
  }
});

console.log(`已生成 ${OUT}`);
console.log(`算子 ${rows.length} 条，问题 ${bad} 处`);
process.exit(bad === 0 ? 0 : 1);
