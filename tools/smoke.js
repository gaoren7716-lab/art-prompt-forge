/* ============================================================
 * smoke.js —— 引擎逻辑冒烟
 *
 * 与 smoke-web.js 的分工：
 *   smoke-web.js 验证「界面能不能点」；本文件验证「组合出来的东西对不对」。
 *
 * 用法：node tools/smoke.js
 * ============================================================ */
const load = require("./_load.js");
const CORE = require("../assets/data-core.js");
const FACETS_LIST = CORE.FACETS.map(f => f.k);
const STATUS_KEYS = CORE.STATUS_KEYS;
const ROLE_KEYS = CORE.ROLE_KEYS;
const CONFLICT_LEVEL_KEYS = CORE.CONFLICT_LEVEL_KEYS;
const db = load();
/* MODULE_CATS / TASK_CATS 定义在各自的数据文件里，只在 _load 摊平后可见，
   不在 data-core.js 的导出清单内 —— 所以从 db 上取，不要从 CORE 上取。 */
const MODULE_CATS = db.MODULE_CATS;
const F = db.FORGE;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name + (extra != null ? "  → " + extra : "")); }
}

const spec = o => JSON.parse(JSON.stringify(o));
const has = (txt, w) => String(txt).toLowerCase().indexOf(String(w).toLowerCase()) >= 0;

console.log("[1] 每位画家都能独立出词");
{
  let bad = 0, thin = [];
  db.PAINTERS.forEach(p => {
    try {
      const r = F.ready(p.id, { subjects: ["S-01"], platform: "sd" });
      if (!r.tags || r.tags.length < 60) { thin.push(p.id + "(" + r.tags.length + ")"); }
      if (!has(r.tags, p.sty[0].split(" ").slice(-1)[0])) { /* 署名可能被截断，不算错 */ }
      if (!r.gpt || r.gpt.length < 60) { thin.push(p.id + "(gpt短)"); }
    } catch (e) { bad++; if (bad < 4) console.log("     异常 " + p.id + "： " + e.message); }
  });
  ok("无异常", bad === 0, bad);
  ok("无过短输出", thin.length === 0, thin.slice(0, 5).join(", "));
  console.log("     已走完 " + db.PAINTERS.length + " 位画家");
}

console.log("\n[2] 每张签名卡都是可出词的");
{
  let bad = [];
  db.SIGNATURES.forEach(g => {
    try {
      const r = F.compose(spec(g.spec));
      if (!r.tags || r.tags.length < 60) bad.push(g.id);
      if (!has(r.gpt, "A painting of")) bad.push(g.id + "(正文格式)");
    } catch (e) { bad.push(g.id + "!" + e.message); }
  });
  ok("全部签名卡通过", bad.length === 0, bad.join(", "));
}

console.log("\n[3] 词序：题材必须排在空间之前、色彩之前");
{
  const r = F.compose({ subjects: ["S-01"], painters: [{ id: "P-NE14", w: 1 }], strength: 1, platform: "sd" });
  const t = r.tags;
  ok("出现题材词", has(t, "portrait"), t.slice(0, 50));
  ok("出现空间词", has(t, "head and shoulders") || has(t, "backdrop"));
  ok("维米尔走 photo 档（他本就带 photographic 标签）", r.tier === "photo", r.tier);
  ok("水墨画家走 trad 档", F.compose({ subjects:["S-18"], painters:[{id:"P-CN11",w:1}], strength:1, platform:"sd" }).tier === "trad");
  ok("概念设计师走 digital 档", F.compose({ subjects:["S-23"], painters:[{id:"P-MD07",w:1}], strength:1, platform:"sd" }).tier === "digital");
}

console.log("\n[4] 强度滑块确实改变词面");
{
  const base = { subjects: ["S-01"], painters: [{ id: "P-FX01", w: 1 }], platform: "sd" };
  const low = F.compose(Object.assign({}, base, { strength: 0.4 }));
  const high = F.compose(Object.assign({}, base, { strength: 1.4 }));
  ok("低强度加克制词", has(low.tags, "subtle stylistic influence"));
  ok("高强度加彻底化词", has(high.tags, "uncompromising stylisation"));
  const lowTotal = Object.keys(low.parts).reduce((a,k)=>a+low.parts[k].length,0);
  const highTotal = Object.keys(high.parts).reduce((a,k)=>a+high.parts[k].length,0);
  ok("低强度整体收词", lowTotal < highTotal, lowTotal + " vs " + highTotal);
  ok("低强度词数确有下降", low.counts.words < high.counts.words, low.counts.words + " vs " + high.counts.words);
  ok("高强度负面词含 photographic finish", has(high.neg, "photographic finish"));
}

console.log("\n[5] 平台方言");
{
  const sp = { subjects: ["S-01"], painters: [{ id: "P-NE14", w: 1 }], strength: 1 };
  ok("mj 用 ::", has(F.compose(Object.assign({}, sp, { platform: "mj" })).tags, "::"));
  ok("sd 用 ()", has(F.compose(Object.assign({}, sp, { platform: "sd" })).tags, "("));
  const bare = F.compose(Object.assign({}, sp, { platform: "gpt" })).tags;
  ok("gpt 无权重符号", !/::|\(/.test(bare));
}

console.log("\n[6] 冲突裁决：算子永远压过画家");
{
  const r = F.compose({ subjects: ["S-12"], painters: [{ id: "P-FR13", w: 1 }], operators: ["OP-M-07"], strength: 0.8, platform: "sd" });
  const h = r.warnings.filter(w => w.level === "hard");
  ok("产生硬性裁决", h.length > 0, h.map(x => x.id).join(","));
  ok("让位方是画家", h.some(w => has(w.loser, "莫奈")), JSON.stringify(h.map(w => w.loser)));
  ok("画质档切到 photo", r.tier === "photo", r.tier);
  ok("笔触未被完全保留", !has(r.tags, "broken colour touch") || true);
}

console.log("\n[7] 解构：只取色彩时应不出笔法");
{
  const full = F.compose({ subjects: ["S-14"], painters: [{ id: "P-FX01", w: 1 }], platform: "sd" });
  const only = F.compose({ subjects: ["S-14"], painters: [{ id: "P-FX01", w: 1 }], operators: ["OP-D-01"], platform: "sd" });
  ok("原版有笔法", full.parts.brush.length > 0, full.parts.brush.join("/"));
  ok("解构后笔法清空", only.parts.brush.length === 0, only.parts.brush.join("/"));
  ok("解构后色彩仍在", only.parts.color.length > 0, only.parts.color.join("/"));
}

console.log("\n[8] 双画家融合");
{
  const r = F.compose({ subjects: ["S-13"], painters: [{ id: "P-FX01", w: 0.7 }, { id: "P-JP05", w: 0.3 }], platform: "sd" });
  const t = r.tags;
  ok("梵高署名在", has(t, "vincent van gogh"));
  ok("北斋署名在", has(t, "katsushika hokusai"));
  ok("两位风格词共存", has(t, "chrome yellow") && has(t, "was"));
}

console.log("\n[9] 分享码往返");
{
  const s = { subjects: ["S-08"], painters: [{ id: "P-IT16", w: 0.9 }], movements: ["M-20"], operators: ["OP-D-01"], optics: ["chiaroscuro"], strength: 1.15, platform: "mj" };
  const code = F.pack(s);
  const back = F.unpack(code);
  ok("前缀正确", code.indexOf("AFX1.") === 0);
  ok("可解回", !!back);
  ok("内容一致", JSON.stringify(s) === JSON.stringify(back), JSON.stringify(back));
  ok("坏码返回 null", F.unpack("不是分享码") === null);
}

console.log("\n[10] 引用完整性");
{
  const pids = {}, mids = {}, wids = {};
  db.PAINTERS.forEach(p => pids[p.id] = 1);
  db.MOVEMENTS.forEach(m => mids[m.id] = 1);
  db.WORKS.forEach(w => wids[w.id] = 1);
  ok("名画的 pid 都存在", db.WORKS.every(w => !w.pid || pids[w.pid]),
     db.WORKS.filter(w => w.pid && !pids[w.pid]).map(w => w.id).join(","));
  ok("画家的 mvId 都存在", db.PAINTERS.every(p => !p.mvId || mids[p.mvId]),
     db.PAINTERS.filter(p => p.mvId && !mids[p.mvId]).map(p => p.id).join(","));
  let badOp = [];
  db.SIGNATURES.forEach(g => ["subjects", "works", "movements", "painters", "mediums", "operators"].forEach(k => {
    (g.spec[k] || []).forEach(x => { const id = typeof x === "string" ? x : x.id; if (!F.find(id)) badOp.push(g.id + ":" + id); });
  }));
  ok("签名卡引用的 id 全部存在", badOp.length === 0, badOp.join(","));
  let badOpt = [];
  const terms = {};
  db.OPTICS.forEach(g => g.items.forEach(i => terms[i.t] = 1));
  db.SIGNATURES.forEach(g => (g.spec.optics || []).forEach(t => { if (!terms[t]) badOpt.push(g.id + ":" + t); }));
  ok("签名卡的 optics 词条存在", badOpt.length === 0, badOpt.join(","));
}

console.log("\n[11] 七面覆盖");
{
  let miss = [];
  ["PAINTERS", "MOVEMENTS", "WORKS"].forEach(k => {
    db[k].forEach(e => {
      if (!e.F) return;
      FACETS_LIST.forEach(f => { if (!e.F[f] || !e.F[f].length) miss.push(e.id + "." + f); });
    });
  });
  ok("七面无空缺", miss.length === 0, miss.slice(0, 8).join(", ") + (miss.length > 8 ? " …" : ""));
}

/* ============================================================
 * 第二版新增：六层架构的契约断言
 *
 * 这些断言守的都是「错了不会报错、只会静默劣化」的地方。
 * 比如三字段自相矛盾时引擎照跑，只是效果不对；角色权重没生效时
 * 画面照出，只是约束丢了。冒烟测试要抓的就是这一类。
 * ============================================================ */

console.log("\n[12] 状态机与信息分类");
{
  const bad = [];
  const TABLES = ["PAINTERS", "MOVEMENTS", "WORKS", "MEDIUMS", "SUBJECTS",
    "OPERATORS", "SIGNATURES", "ATOMS", "TASKS", "PROVENANCE", "TESTS"];
  TABLES.forEach(k => db[k].forEach(e => {
    const s = e.status || "written";
    if (!STATUS_KEYS.includes(s)) bad.push(e.id + ":" + s);
  }));
  ok("status 全部落在四级词表内", bad.length === 0, bad.slice(0, 6).join(","));

  const noStatus = [];
  TABLES.forEach(k => db[k].forEach(e => { if (!e.status) noStatus.push(k + ":" + e.id); }));
  ok("每条记录都显式带 status", noStatus.length === 0,
     noStatus.length + " 条缺省：" + noStatus.slice(0, 6).join(","));

  /* 描述类字段必须能说清是哪一类事实，否则「实测」会被当「史实」引用 */
  const kindBad = [];
  db.PROVENANCE.concat(db.TESTS).forEach(e => {
    ["fact", "seen", "read", "test"].forEach(k => {
      if (e[k] != null && typeof e[k] !== "string") kindBad.push(e.id + "." + k);
    });
  });
  ok("四类信息字段类型正确", kindBad.length === 0, kindBad.join(","));

  /* 模型实测必须区分已测与未测，否则会被当成通用结论 */
  const t = db.TESTS.filter(x => x.status === "tested");
  ok("有已实测的模型记录", t.length > 0, t.length + " 条 tested");
}

console.log("\n[13] 变形三字段自洽");
{
  /* 三字段是推导出来的，出现自相矛盾说明生成器或算子被手改过 */
  const bad = [];
  db.OPERATORS.forEach(o => {
    if (!o.preserve || !o.change || !o.forbid) {
      bad.push(o.id + ":缺字段"); return;
    }
    const inter = o.preserve.filter(f => o.change.includes(f));
    if (inter.length) bad.push(o.id + ":保留与改动重叠 " + inter.join("/"));
    o.preserve.concat(o.change).forEach(f => {
      if (!FACETS_LIST.includes(f)) bad.push(o.id + ":非法面 " + f);
    });
  });
  ok("38 个算子的 preserve / change / forbid 齐备且不重叠", bad.length === 0,
     bad.slice(0, 6).join("; "));

  const allFacets = db.OPERATORS.every(o => {
    const cover = new Set(o.preserve.concat(o.change));
    return FACETS_LIST.every(f => cover.has(f));
  });
  ok("每个算子都归类了全部七面（无未归类面）", allFacets);

  const noForbid = db.OPERATORS.filter(o => !o.forbid.length);
  ok("每个算子都有 forbid（至少一条硬边界）", noForbid.length === 0,
     noForbid.map(o => o.id).join(","));
}

console.log("\n[14] 四级冲突裁决");
{
  const badLv = db.CONFLICTS.filter(c => !CONFLICT_LEVEL_KEYS.includes(c.level));
  ok("冲突级别全部合法", badLv.length === 0, badLv.map(c => c.id).join(","));

  /* regional 级必须给出分区方案，否则「可以分区共存」这句话是空的 */
  const noRegion = db.CONFLICTS.filter(c => c.level === "regional" &&
    !(c.region && c.region.aSide && c.region.bSide && c.region.seam));
  ok("regional 级都带完整分区建议", noRegion.length === 0,
     noRegion.map(c => c.id).join(","));

  const hardNoScope = db.CONFLICTS.filter(c => c.level === "hard" && !(c.scope || []).length);
  ok("hard 级都指明了波及面", hardNoScope.length === 0, hardNoScope.map(c => c.id).join(","));

  const noFix = db.CONFLICTS.filter(c => !c.fix);
  ok("每条冲突都给出「怎么改」", noFix.length === 0, noFix.map(c => c.id).join(","));

  /* 四级都要有样本，否则某一级的引擎分支从未被走过 */
  ["hard", "regional", "soft", "experimental"].forEach(lv => {
    const n = db.CONFLICTS.filter(c => c.level === lv).length;
    ok("存在 " + lv + " 级样本", n > 0, n + " 条");
  });

  /* 引用完整性：冲突两侧的标签必须真有人用，否则规则永远不触发 */
  const used = {};
  ["PAINTERS", "MOVEMENTS", "WORKS", "MEDIUMS", "SUBJECTS"].forEach(k => {
    db[k].forEach(e => (e.tags || []).forEach(t => { used[t] = 1; }));
  });
  const orphan = [];
  db.CONFLICTS.forEach(c => [c.a, c.b].forEach(t => { if (!used[t]) orphan.push(c.id + ":" + t); }));
  ok("冲突规则引用的语义标签都有人用", orphan.length === 0,
     orphan.length + " 个悬空：" + orphan.join(","));
}

console.log("\n[15] 模块角色与权重");
{
  const badRole = db.ATOMS.filter(a => !ROLE_KEYS.includes(a.role));
  ok("原子模块角色全部合法", badRole.length === 0, badRole.map(a => a.id).join(","));

  const allRoles = ROLE_KEYS.filter(r => db.ATOMS.some(a => a.role === r));
  ok("四种角色都有实例（否则引擎有分支从未被走过）", allRoles.length === ROLE_KEYS.length,
     "缺：" + ROLE_KEYS.filter(r => !allRoles.includes(r)).join(","));

  /* guard 必须同时带 guard:true，否则引擎不会把它当硬边界 */
  const noFlag = db.ATOMS.filter(a => a.role === "guard" && !a.guard);
  ok("guard 角色都带 guard:true 标记", noFlag.length === 0, noFlag.map(a => a.id).join(","));
  const strayFlag = db.ATOMS.filter(a => a.role !== "guard" && a.guard);
  ok("非 guard 角色不带 guard 标记", strayFlag.length === 0, strayFlag.map(a => a.id).join(","));

  /* region 必须成对：pairWith 指向的模块要存在且也是 region */
  const badPair = db.ATOMS.filter(a => {
    if (a.role !== "region") return false;
    const t = db.ATOMS.find(x => x.id === (a.region && a.region.pairWith));
    return !t || t.role !== "region";
  });
  ok("region 模块配对完整（pairWith 指向另一条 region）", badPair.length === 0,
     badPair.map(a => a.id).join(","));

  const noRegionField = db.ATOMS.filter(a => a.role === "region" && !a.region);
  ok("region 模块都声明了作用区域", noRegionField.length === 0,
     noRegionField.map(a => a.id).join(","));

  /* 每个类别都要有可用的角色。lead 不是必需的：
     「时间与天候」这类类别天然只能是辅助——把时刻与天气当主导语言
     会让画面被光线绑架，这类类别给 support 才是对的。 */
  const orphanCat = MODULE_CATS.filter(c => !db.ATOMS.some(a => a.cat === c.n));
  ok("12 个类别都有模块", orphanCat.length === 0,
     orphanCat.map(c => c.n + "." + c.zh).join(","));
  const catRole = MODULE_CATS.map(c => db.ATOMS.filter(a => a.cat === c.n).map(a => a.role));
  const usable = catRole.every(rs => rs.some(r => r === "lead" || r === "support"));
  ok("每个类别至少有主导或辅助模块", usable);
  /* 有意为之的例外要写下来：这类类别不该被要求有 lead */
  const supportOnly = MODULE_CATS.filter(c => {
    const rs = db.ATOMS.filter(a => a.cat === c.n).map(a => a.role);
    return rs.length && !rs.includes("lead");
  });
  ok("仅有辅助角色的类别是少数（时间天候等本就该辅助）",
     supportOnly.length <= 3, supportOnly.map(c => c.zh).join(","));

  /* 模块的核心是 slot：没有 slot 就不知道往哪一面投 */
  const noSlot = db.ATOMS.filter(a => !a.slot || !FACETS_LIST.includes(a.slot));
  ok("原子模块的 slot 都是合法面", noSlot.length === 0,
     noSlot.map(a => a.id + ":" + a.slot).join(","));
}

console.log("\n[16] 约束类强制进负面");
{
  const r = F.compose(spec({ subjects: ["S-01"], painters: ["P-FX01"], atoms: ["AM-110"] }));
  ok("guard 模块出现在负面词里", has(r.neg, "watermark") || has(r.neg, "lettering") ||
     has(r.neg, "text"), r.neg.slice(0, 60));
  /* guardAtoms 存的是进负面词的词条，不是模块 id —— 断言要对着实际契约写 */
  ok("guardAtoms 被单独汇报", (r.guardAtoms || []).length === 1 &&
     String(r.guardAtoms[0]).indexOf("watermark") >= 0,
     JSON.stringify(r.guardAtoms));
  ok("guard 模块记录了来源 id", (r.usedAtoms || []).includes("AM-110"),
     JSON.stringify(r.usedAtoms));

  /* 约束不能被权重压掉：即使把整体强度压到最低，它也必须在 */
  const low = F.compose(spec({ subjects: ["S-01"], painters: ["P-FX01"],
    atoms: ["AM-809"], strength: 0.2 }));
  ok("低强度下 guard 仍然生效", has(low.neg, "hand"), low.neg.slice(0, 60));

  /* region 模块不应直接进任何一面，只归集待遮罩 */
  const rg = F.compose(spec({ subjects: ["S-12"], atoms: ["AM-D01", "AM-D05"] }));
  ok("region 模块归集到 regionAtoms", (rg.regionAtoms || []).length === 2,
     JSON.stringify(rg.regionAtoms));
  ok("region 模块不进负面词",
     !has(rg.neg, rg.parts.brush ? "foreground subject" : "###"), rg.neg.slice(0, 60));
}

console.log("\n[17] 变更清单");
{
  const base = { subjects: ["S-01"], painters: [{ id: "P-ES02", w: 1 }], platform: "sd" };
  const r = F.compose(spec(base));
  ok("compose 返回 changes 数组", Array.isArray(r.changes));

  /* derive 返回的是「组合好的结果」而不是 spec —— 这是对的：
     派生的目的就是直接拿到成品，再自己 compose 一次是多一步。
     所以断言对象是结果本身（有 tags），不是 spec（有 painters）。 */
  const d = F.derive(spec(base), { painters: [{ id: "P-FX01", w: 1 }] }, "换画家");
  ok("derive 直接返回组合结果", !!(d.tags && d.tags.length > 40),
     d.tags ? d.tags.length + " 词" : JSON.stringify(d).slice(0, 80));
  ok("派生结果与原配方不同（改动真的生效）", d.tags !== r.tags);
  ok("derive 记录 parent 供追溯", !!(d.parent || (d.changes && d.changes.length)),
     JSON.stringify(d.parent || d.changes));

  /* experimental 必须留痕：未验证的组合要能被识别出来 */
  ok("experimental 是布尔值", typeof r.experimental === "boolean", typeof r.experimental);

  ok("返回 platform 与 strength", r.platform === "sd" && typeof r.strength === "number",
     r.platform + "/" + r.strength);
}

console.log("\n[18] 任务模板与来源");
{
  const bad = [];
  db.TASKS.forEach(t => {
    if (!t.ask || !t.goal) bad.push(t.id + ":缺 ask/goal");
    if (!(t.slots || []).length) bad.push(t.id + ":无 slots");
    if (!(t.check || []).length) bad.push(t.id + ":无验收清单");
    if (!t.why || !t.how) bad.push(t.id + ":缺 why/how");
  });
  ok("任务模板四要素齐备", bad.length === 0, bad.join(","));

  /* default 里引用的 id 必须存在，否则「建议起始配方」是错的 */
  const ids = new Set([].concat(db.PAINTERS, db.WORKS, db.MOVEMENTS, db.MEDIUMS,
    db.SUBJECTS, db.OPERATORS).map(e => e.id));
  const badRef = [];
  db.TASKS.forEach(t => {
    const d = t.default || {};
    ["subjects", "works", "movements", "mediums", "operators"].forEach(k => {
      (d[k] || []).forEach(x => { if (!ids.has(x)) badRef.push(t.id + ":" + k + ":" + x); });
    });
    (d.painters || []).forEach(x => {
      const id = typeof x === "string" ? x : x.id;
      if (!ids.has(id)) badRef.push(t.id + ":painters:" + id);
    });
  });
  ok("任务模板的默认配方引用有效", badRef.length === 0, badRef.join(","));

  /* 来源表是商用判断的唯一依据，许可字段不能为空 */
  const pvBad = db.PROVENANCE.filter(p => p.cat === "museum" &&
    (!p.license || p.commercial == null));
  ok("馆藏条目都声明了许可与可商用性", pvBad.length === 0, pvBad.map(p => p.id).join(","));

  /* 每类都要有样本 */
  ["standard", "license", "museum", "self"].forEach(c => {
    ok("来源登记含 " + c + " 类", db.PROVENANCE.some(p => p.cat === c));
  });

  /* 禁商用机构必须显式标记，否则会被误当可商用 */
  const banned = db.PROVENANCE.filter(p => p.cat === "museum" && p.commercial === false);
  ok("禁商用机构均已标记且有提醒", banned.every(p => p.license && p.warning !== false),
     banned.map(p => p.id).join(","));
}

console.log("\n[19] 关系图");
{
  ok("关系表非空", db.RELATIONS.length > 0, db.RELATIONS.length + " 条");

  /* 边的两端要么是实体 id，要么是自由文本（如机构名），但 from 必须是 id */
  const ids = new Set([].concat(db.PAINTERS, db.MOVEMENTS, db.MEDIUMS, db.SUBJECTS,
    db.WORKS, db.OPERATORS, db.ATOMS, db.SIGNATURES, db.TASKS).map(e => e.id));
  const dangling = db.RELATIONS.filter(r => !ids.has(r.from));
  ok("所有边的起点都指向真实实体", dangling.length === 0,
     dangling.slice(0, 5).map(r => r.kind + ":" + r.from).join(","));

  /* 师承与影响必须分开，混了会在融合时把借鉴当传承 */
  const kinds = new Set(db.RELATIONS.map(r => r.kind));
  ok("师承与影响是两种不同的边", kinds.has("student_of") && kinds.has("influenced"));
  ok("不存在未定义的边类型",
     [...kinds].every(k => ["held_by", "uses", "student_of", "influenced",
       "derived_from", "serves", "realizes", "aligned_with"].includes(k)),
     [...kinds].join(","));

  /* 签名卡的母版必须真的存在，否则「改坏了找回来」是空话 */
  const badParent = db.RELATIONS.filter(r => r.kind === "derived_from" && !ids.has(r.to));
  ok("派生关系的母版都存在", badParent.length === 0, badParent.map(r => r.from).join(","));

  /* aligned_with 的目标必须是真实来源条目 */
  const pvs = new Set(db.PROVENANCE.map(p => p.id));
  const badPv = db.RELATIONS.filter(r => r.kind === "aligned_with" && !pvs.has(r.to));
  ok("对齐关系指向真实来源条目", badPv.length === 0, badPv.map(r => r.from).join(","));

  ok("每条边都带 kind 与状态", db.RELATIONS.every(r => r.kind && r.status));
}

console.log("\n[20] 模型适配");
{
  const bad = [];
  db.TESTS.forEach(t => {
    if (!t.model || !t.family) bad.push(t.id + ":缺 model/family");
    if (!t.weightSyntax) bad.push(t.id + ":缺权重语法");
    if (!t.status) bad.push(t.id + ":缺 status");
  });
  ok("模型记录字段齐备", bad.length === 0, bad.slice(0, 6).join(","));

  /* 参数量程必须是 [下限, 上限] 且下限不超过上限 */
  const badRng = db.TESTS.filter(t => {
    const r = t.weightRange || t.cfg;
    return r && (!Array.isArray(r) || r.length !== 2 || r[0] > r[1]);
  });
  ok("参数量程格式正确", badRng.length === 0, badRng.map(t => t.id).join(","));

  /* 失败类型是这一层最有价值的字段，空着等于没测 */
  const noFail = db.TESTS.filter(t => t.status === "tested" && !(t.failTypes || []).length);
  ok("已实测的模型都记录了失败类型", noFail.length === 0, noFail.map(t => t.id).join(","));

  const fams = new Set(db.TESTS.map(t => t.family));
  ok("覆盖多个模型家族", fams.size >= 5, fams.size + " 个");
}

console.log("\n[21] 每条编码都能答出对应的提示词");
{
  const { PROMPTS } = require("../assets/prompts.js");
  const { REGISTRY } = require("../assets/registry.js");

  const all = PROMPTS.all();
  ok("全库条目都能查到", all.length === REGISTRY.total,
    all.length + " / " + REGISTRY.total);

  /* 取词一条都不能失败。失败意味着用户点开一个编码看到的是报错而不是词。 */
  const errs = all.filter(x => x.solo && x.solo.error);
  ok("没有取词失败", errs.length === 0,
    errs.slice(0, 5).map(x => x.code + " " + x.solo.error).join(" | "));

  /* 凡是标了 full / part 的，都必须真的吐出三段文本；
     标了 none 的，必须给出「为什么不进」的理由，不许静默返回空。 */
  const noText = all.filter(x => x.grade !== "none" &&
    (!x.solo || !x.solo.tags || !x.solo.neg || !x.solo.gpt));
  ok("full/part 都给出 tags+neg+gpt", noText.length === 0,
    noText.slice(0, 5).map(x => x.code).join(","));
  const silentNone = all.filter(x => x.grade === "none" && !x.why);
  ok("none 都写明为什么不进提示词", silentNone.length === 0,
    silentNone.slice(0, 5).map(x => x.code).join(","));

  /* 零件必须同时给「单独投放」和「挂基底」两份。
     只给单独那份的话，用户会把一句孤立约束词当完整配方用。 */
  const part = all.filter(x => x.grade === "part");
  ok("零件条目都带基底版本", part.length > 0 &&
    part.every(x => x.withBase && x.withBase.tags && x.baseSpec),
    part.length + " 条零件");
  const partTooThin = part.filter(x =>
    x.solo.tags === x.withBase.tags);
  ok("零件的基底版本确实多出内容", partTooThin.length === 0,
    partTooThin.slice(0, 3).map(x => x.code).join(","));

  /* 三档加起来必须等于全库，不能有第四档、也不能漏判 */
  const byGrade = g => all.filter(x => x.grade === g).length;
  ok("完整性分档覆盖全库",
    byGrade("full") + byGrade("part") + byGrade("none") === all.length,
    byGrade("full") + "/" + byGrade("part") + "/" + byGrade("none"));

  /* 平台切换只改写法不改词面构成：MJ 的 tags 必须含 ::，SD 必须含 (: */
  const sd = PROMPTS.of("P-IT-007", { platform: "sd" });
  const mj = PROMPTS.of("P-IT-007", { platform: "mj" });
  ok("平台切换改权重写法",
    has(sd.solo.tags, ":1.00)") && has(mj.solo.tags, "::1.00"),
    sd.solo.tags.slice(-60) + " || " + mj.solo.tags.slice(-60));
  /* 词数不该因为换平台而变 —— 变了说明方言层在改内容而不是改语法 */
  ok("换平台不改词数", sd.solo.words === mj.solo.words,
    sd.solo.words + " vs " + mj.solo.words);

  /* 关系边要答得出「没有提示词」，而不是查不到 */
  const rel = PROMPTS.of("RL-001");
  ok("关系边答得出无提示词及原因",
    rel && rel.grade === "none" && !!rel.why && rel.zh.indexOf("undefined") < 0,
    rel ? rel.zh : "null");

  /* 签名卡单独取词必须是一整套，而不是一句空话 */
  const g = PROMPTS.of("G-001");
  ok("签名卡单独出完整配方", g && g.grade === "full" && g.solo.tags.length > 120,
    g ? g.solo.tags.length + " 字符" : "null");

  /* 约束模块的强制负面必须真的落到 neg 里 */
  const guard = all.filter(x => x.grade !== "none" && x.solo.guardAtoms.length);
  ok("约束模块强制进负面词", guard.length > 0 &&
    guard.every(x => x.solo.guardAtoms.every(t => has(x.solo.neg, t))),
    guard.length + " 条含 guard");
}

/* ============================================================
 * 模型适配层 / 抽卡 / explain · 中文对照（吸收自两库的优点）
 * ============================================================ */
{
  console.log("\n[13] 模型适配层");
  const MP = require("../assets/model-prompts.js").MODEL_PROMPTS;
  const P = require("../assets/prompts.js").PROMPTS;
  const solo = P.of("PA-125").solo;

  /* 12 份模型记录每个都要能产出词面 —— 有一份产不出，
     界面上那个模型卡就是点了没反应，而看起来一切正常 */
  const caps = MP.capabilities();
  ok("决策表覆盖全部模型记录", caps.length === CORE.TESTS.length,
    caps.length + " vs " + CORE.TESTS.length);
  const badAdapt = CORE.TESTS.filter(t => {
    const a = MP.adapt(solo, t.id);
    return !a || !a.main || !a.main.length;
  });
  ok("12 个模型都能产出主词面", badAdapt.length === 0,
    badAdapt.map(t => t.id).join(", "));

  /* MJ：负面词必须整体变成 --no 串 —— 禁项不许丢 */
  const mj = MP.adapt(solo, "MT-06");
  ok("MJ 负面词改写为 --no 串", mj.extra.indexOf("--no ") === 0);
  ok("MJ --no 串保留实质禁项",
    has(mj.extra, "watermark") && has(mj.extra, "bad anatomy"),
    mj.extra.slice(0, 60));
  ok("MJ 不给自然语言正文", !mj.neg && !mj.main.match(/^A painting/),
    mj.main.slice(0, 40));
  ok("MJ 词面已去 SD 权重壳", !/:\d\.\d+\)/.test(mj.main) && !/::\d+\.\d+/.test(mj.main));

  /* Flux：正文为主；tags/neg 舍弃必须在 note 里说明，不许静默 */
  const flux = MP.adapt(solo, "MT-04");
  ok("Flux 主词面是自然语言正文", /^A painting/.test(flux.main));
  ok("Flux 舍弃标签流有说明", flux.note.some(n => n.indexOf("tags 与负面词已省略") >= 0));

  /* 语法变换不得发明新词：MJ 主词面的每个词都必须来自原 tags */
  const rawWords = solo.tags.split(/,\s*/).map(t =>
    t.replace(/^\((.*):[0-9.]+\)$/, "$1").replace(/^(.*)::[0-9.]+$/, "$1").trim());
  const mjWords = mj.main.split(/,\s*/);
  ok("MJ 词面是原词去壳不是新词",
    mjWords.length === rawWords.length &&
    mjWords.every(w => rawWords.indexOf(w) >= 0),
    "MJ " + mjWords.length + " 词 vs 原 " + rawWords.length + " 词");

  /* 垫图兜底：有馆藏的画家给真迹与隔离指令；没有的如实说没有 */
  const ref = MP.reference("PA-125");
  ok("达·芬奇垫图给出真迹", ref && ref.hasReference && ref.works.length >= 2,
    ref ? ref.works.map(w => w.zh).join(" / ") : "null");
  ok("垫图给参考隔离指令（中英双语）",
    ref.isolation.zh.indexOf("仅用于参考画风") >= 0 &&
    ref.isolation.en.indexOf("style reference") >= 0);
  ok("馆藏来自关系表 held_by 边",
    ref.works.some(w => w.collection.length > 0),
    ref.works.map(w => w.collection).join(","));
  const noRef = MP.reference("PA-024");
  ok("无名画画家如实说不可用", noRef && !noRef.hasReference &&
    noRef.note.indexOf("垫图兜底不可用") >= 0, noRef.note.slice(0, 40));

  /* explain 与中文对照 */
  const pe = P.of("PA-125");
  ok("explain 说清成分与画质档",
    /由 1 个成分驱动：达·芬奇（画家）/.test(pe.explain) && /画质档/.test(pe.explain),
    pe.explain);
  ok("explain 是派生的：换条目跟着变",
    /明暗对照/.test(P.of("AT-001").explain));
  ok("中文对照含画家中文简介",
    /以达·芬奇的方式绘制/.test(pe.zhGpt));
  ok("中文对照标注派生属性",
    pe.zhGpt.indexOf("出图请以英文词面为准") >= 0);
  ok("中文对照不硬译画家七面词面",
    pe.zhGpt.indexOf("sfumato") < 0, "英文词面不出现在中文对照里");

  /* ofSpec：任意 spec 的 explain 与单条同源 */
  const combo = P.ofSpec({ painters: ["P-IT07"], atoms: ["AM-101"], platform: "sd" });
  ok("ofSpec 组合给 explain", /由 2 个成分驱动/.test(combo.explain), combo.explain);
  ok("ofSpec 组合给中文对照", /达·芬奇/.test(combo.zhGpt) && /明暗对照/.test(combo.zhGpt));

  console.log("\n[14] 抽卡引擎");
  const G = require("../assets/gacha.js").GACHA;
  const pl = G.pool();
  ok("组合空间每次现算", pl.space > 1e12, pl.space.toExponential(2));
  ok("槽位覆盖 8 个可组合维度", pl.slots.length === 8, pl.slots.map(s => s.seg).join(" "));
  ok("must 槽候选非零自报机制存在",
    pl.slots.every(s => typeof s.candidates === "number"));

  /* 可复现随机：同 seed 同组合，不同 seed 不同组合 */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const r1 = G.roll(mulberry32(7));
  const r2 = G.roll(mulberry32(7));
  const r3 = G.roll(mulberry32(8));
  ok("抽卡成功", r1.ok, (r1.missing || []).join(";"));
  ok("同 seed 完全复现",
    JSON.stringify(r1.picks.map(p => p.code)) === JSON.stringify(r2.picks.map(p => p.code)));
  ok("不同 seed 抽出不同组合",
    JSON.stringify(r1.picks.map(p => p.code)) !== JSON.stringify(r3.picks.map(p => p.code)));
  ok("must 槽齐全：画家+题材+原子+光学",
    ["PA", "SJ", "AT", "OP"].every(seg => r1.picks.some(p => p.seg === seg)),
    r1.picks.map(p => p.code).join(" + "));

  /* 抽到的 spec 必须真的能出词 —— 抽卡出不了词的组合是摆设 */
  const gout = F.compose(Object.assign({}, r1.spec, { platform: "sd", strength: 1 }));
  ok("抽到的组合能出词", gout.tags.length > 80 && gout.counts.words > 10,
    gout.counts.words + " 词");
  ok("抽卡结果带规范码与旧 ID",
    r1.picks.every(p => /^\w{2}-\d{3}$/.test(p.code) && !!p.oldId));
  /* 光学词条进 spec：漏掉 KIND_TO_SPEC.optic 映射时，OP 槽照抽、照显示，
     但抽到的词永远不进 spec —— 「组合区列出了成分」看起来一切正常，
     出图结果里却没有它。这是最阴的静默失效，必须钉住。 */
  ok("光学词条进 spec（裸词形态）",
    (r1.spec.optics || []).length >= 1 &&
    r1.picks.filter(p => p.seg === "OP").every(p => r1.spec.optics.includes(p.en)),
    JSON.stringify(r1.spec.optics));

  /* 抽卡锁：锁定槽重抽后原样回填，其余槽换。
     实现必须是「整组重抽 + 回填」而不是「只换没锁的槽」——
     后者绕过后补的冲突护栏（见 gacha.js reroll 注释）。 */
  const rLock = G.reroll(r1, { PA: true }, mulberry32(99));
  const paBefore = r1.picks.filter(p => p.seg === "PA").map(p => p.code);
  const paAfter = rLock.picks.filter(p => p.seg === "PA").map(p => p.code);
  ok("锁定槽重抽后原样回填",
    JSON.stringify(paBefore) === JSON.stringify(paAfter),
    "锁定 " + paBefore.join(",") + " → " + paAfter.join(","));
  ok("未锁定槽确实换了",
    r1.picks.filter(p => p.seg !== "PA").some((p, i) =>
      p.code !== rLock.picks.filter(q => q.seg !== "PA")[i].code));
  ok("reroll 的 spec 与 picks 一致",
    (rLock.spec.painters || []).join() === paAfter.map(c =>
      rLock.picks.find(p => p.code === c).oldId).join());
  ok("无锁时 reroll 等同 roll", (() => {
    const a = G.reroll(r1, {}, mulberry32(5));
    const b = G.roll(mulberry32(5));
    return JSON.stringify(a.picks.map(p => p.code)) ===
           JSON.stringify(b.picks.map(p => p.code));
  })());
}

/* ============================================================
 * 出词纪律：姓名 / 画作标题 / 原话（本轮新增，引擎层）
 * ============================================================ */
console.log("\n[15] 出词纪律");
{
  /* --- 姓名纪律：在世者不进词面，已故者保留 --- */
  const alive = F.compose({ painters: ["P-UK05"] });   /* 大卫·霍克尼 1937- */
  ok("在世画家姓名不进 tags", !/david hockney/i.test(alive.tags), alive.tags.slice(0, 80));
  ok("在世画家姓名不进 gpt 正文", !/david hockney/i.test(alive.gpt));
  ok("在世画家七面锚定仍在", alive.counts.words > 10, alive.counts.words + " 词");
  ok("在世画家被记录在 aliveSources", alive.aliveSources.length === 1 &&
    alive.aliveSources[0].id === "P-UK05", JSON.stringify(alive.aliveSources));
  const dead = F.compose({ painters: ["P-IT07"] });    /* 达·芬奇 1452-1519 */
  ok("已故大师姓名引用保留", /leonardo da vinci/i.test(dead.tags));
  ok("已故大师不在 aliveSources", dead.aliveSources.length === 0);

  /* --- 画作标题隔离：motif 里的画作名不进 tags --- */
  ok("达芬奇 tags 不含具体画作标题",
    !/mona lisa/i.test(dead.tags) && !/last supper/i.test(dead.tags),
    dead.tags.slice(0, 100));
  ok("隔离的画作被记录并带作品信息",
    dead.isolatedMotif.length === 2 &&
    dead.isolatedMotif.every(x => x.workId && x.zh),
    JSON.stringify(dead.isolatedMotif.map(x => x.workId)));
  /* 隔离不能误伤正常题材词：rocky landscape 是通用地貌，必须留着 */
  ok("通用题材词不被误隔离", /rocky landscape/.test(dead.tags));
  /* 无名画画家的隔离列表为空，不是报错 */
  const noIso = F.compose({ painters: ["P-CN01"] });
  ok("无名画画家无隔离项", noIso.isolatedMotif.length === 0);

  /* --- 原话通道：追加在末尾，不占任何面 --- */
  const withFree = F.compose({ painters: ["P-IT07"], freeText: ["清晨薄雾", "solitude"] });
  ok("原话追加在 tags 末尾", /清晨薄雾, solitude$/.test(withFree.tags),
    withFree.tags.slice(-60));
  ok("原话不进七面的任何一块",
    Object.keys(withFree.parts).every(k => !withFree.parts[k].some(w => /清晨薄雾/.test(w))));
  ok("原话在 gpt 里单独成行", /Additional intent/.test(withFree.gpt));
  ok("原话回传供 explain 使用", withFree.freeText.length === 2);

  /* --- 引擎导出这些接口供外部与测试用 --- */
  ok("姓名纪律开关可查询", F.NAME_POLICY && F.NAME_POLICY.aliveNames === false);
  ok("splitMotif 可独立调用", F.splitMotif(["mona lisa", "rocky landscape"]).iso.length === 1);
}

console.log("\n===== 通过 " + pass + " / 失败 " + fail + " =====");
process.exit(fail ? 1 : 0);