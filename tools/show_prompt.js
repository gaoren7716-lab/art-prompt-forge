/* ============================================================
 * show_prompt.js —— 命令行查「这一条编码对应几段词」
 * ============================================================
 * 用法：
 *   node tools/show_prompt.js P-IT-007
 *   node tools/show_prompt.js 达·芬奇
 *   node tools/show_prompt.js AM-101 单侧窗光      # 组合多项
 *   node tools/show_prompt.js AM-101 --platform mj
 *   node tools/show_prompt.js AM-101 --json
 *
 * 为什么不直接把 dist/prompts.json 丢给用户：
 *   那份是 1.2 MB 的全量表，没人愿意在里面翻一条。
 *   而「只查一条」这件事本来就在引擎里跑得动，不该逼人先下载全表。
 *
 * 查不到时必须说「找不到」并给最接近的候选 ——
 * 宁可让人重输，也不能给一个假编码：假编码会一路错到出图那一步才暴露。
 * ============================================================ */
const { PROMPTS } = require("../assets/prompts.js");
const { REGISTRY } = require("../assets/registry.js");
const { RESOLVER } = require("../assets/resolver.js");

const argv = process.argv.slice(2);
const flags = {};
const words = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--json") flags.json = true;
  else if (a === "--platform" || a === "-p") flags.platform = argv[++i];
  else if (a === "--strength" || a === "-s") flags.strength = Number(argv[++i]);
  else if (a === "--help" || a === "-h") flags.help = true;
  else words.push(a);
}

if (flags.help || !words.length) {
  console.log(`用法：node tools/show_prompt.js <编码|中文名|英文名> [更多项…] [选项]

选项：
  -p, --platform <sd|mj|flux|gpt>   权重写法，默认 sd
  -s, --strength <0.2-1.6>          强度，默认 1.0
      --json                       输出 JSON，便于脚本处理
  -h, --help                       显示本帮助

例子：
  node tools/show_prompt.js P-IT-007
  node tools/show_prompt.js 达·芬奇 + 明暗对照
  node tools/show_prompt.js AM-101 --platform mj`);
  process.exit(flags.help ? 0 : 1);
}

const opt = {
  platform: flags.platform || "sd",
  strength: flags.strength != null && !isNaN(flags.strength) ? flags.strength : 1.0
};

if (opt.platform && !["sd", "mj", "flux", "gpt"].includes(opt.platform)) {
  console.error(`未知平台 "${opt.platform}"，可选：sd / mj / flux / gpt`);
  process.exit(1);
}

/* ---------- 多项时按组合串处理，单项时按单条提示词处理 ----------
   两条路的产出形态完全不同，混在一起输出会看不清：
   单项是「这一条自己能出几段词」，多项是「这些加起来出几段词」。 */
if (words.length > 1) {
  const q = words.join(" + ");
  const r = RESOLVER.resolveMany(q);
  if ((r.badList || []).length || (r.ambList || []).length) {
    console.error(`组合串没能全部解析：\n`);
    (r.badList || []).forEach(x =>
      console.error(`  ✗ ${x.input} —— ${x.why}` +
        ((x.cand || []).length ? `（最接近：${x.cand.join(" / ")}）` : "")));
    (r.ambList || []).forEach(x =>
      console.error(`  ? ${x.input} —— ${x.why}` +
        ((x.cand || []).length ? `（候选：${x.cand.join(" / ")}）` : "")));
    process.exit(1);
  }
  const spec = RESOLVER.toSpec(r);
  const out = require("../assets/forge-kit.js").FORGE.compose(spec);
  if (flags.json) {
    console.log(JSON.stringify({ chain: r.chain, spec, result: out }, null, 2));
  } else {
    console.log(`组合串  ${r.chain}`);
    console.log(`配方    ${JSON.stringify(spec)}\n`);
    console.log(`tags（${out.counts.words} 词）\n${out.tags}\n`);
    console.log(`neg\n${out.neg}\n`);
    console.log(`gpt\n${out.gpt}\n`);
    if ((out.warnings || []).length) {
      console.log(`提醒`);
      out.warnings.forEach(w => console.log(`  [${w.level}] ${w.msg || w.text || JSON.stringify(w)}`));
    }
  }
  process.exit(0);
}

/* ---------- 单项 ---------- */
const key = words[0];
const r = RESOLVER.resolve(key);
if (!r.ok) {
  console.error(`「${key}」没能唯一命中：${r.why}`);
  (r.cand || []).forEach(c => {
    const s = typeof c === "string" ? c
      : `${c.code} ${c.zh}${c.kindZh ? "（" + (c.kindZh || c.kind) + "）" : ""}`;
    console.error(`  候选：${s}`);
  });
  if (!(r.cand || []).length) {
    console.error(`本库共 ${REGISTRY.total} 条可引用条目，可能是名称写法不同。`);
  }
  process.exit(1);
}
const p = PROMPTS.ofEntry(r.hits[0], opt);

if (flags.json) {
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}

const line = "─".repeat(64);
console.log(line);
console.log(`${p.code}  ${p.zh}${p.en ? "（" + p.en + "）" : ""}`);
console.log(`${p.kindZh} · ${p.gradeZh}${p.oldId && p.oldId !== p.code ? " · 旧 ID " + p.oldId : ""}`);
console.log(line);

if (p.grade === "none") {
  console.log(`\n不进提示词：${p.why}\n`);
  if (p.note) console.log(`${p.note}\n`);
  process.exit(0);
}

if (p.solo.error) {
  console.error(`\n取词失败：${p.solo.error}\n`);
  process.exit(1);
}

console.log(`\n【段落式 tags】${p.solo.words} 词 · 画质档 ${p.solo.tier}\n${p.solo.tags}\n`);
console.log(`【负面词】\n${p.solo.neg}\n`);
console.log(`【自然语言正文】\n${p.solo.gpt}\n`);

if (p.grade === "part" && p.withBase && !p.withBase.error) {
  console.log(line);
  console.log(`上面是它单独投放时的样子 —— 只有一条约束词，直接出图几乎等于没约束。`);
  console.log(`挂到演示基底「${p.baseZh}」（${JSON.stringify(p.baseSpec)}）上：\n`);
  console.log(`${p.withBase.tags}\n`);
}

const tail = [];
if (p.solo.experimental) tail.push("含未验证的实验性配对，结果不保证");
if ((p.solo.guardAtoms || []).length) tail.push("约束模块已强制进负面：" + p.solo.guardAtoms.join(", "));
if ((p.solo.regionAtoms || []).length) tail.push("局部模块需配遮罩：" + p.solo.regionAtoms.map(x => x.zh).join(", "));
if (p.note) tail.push(p.note);
if (tail.length) console.log(`${line}\n${tail.map(t => "· " + t).join("\n")}\n`);

console.log(`平台 ${p.platform} · 强度 ${Number(p.strength).toFixed(2)} · 换写法加 --platform mj|flux|gpt`);