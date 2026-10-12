/* ============================================================
 * inventory.js —— 多维盘点
 *
 * 回答两类问题：
 *   1. 现在有什么（按地域、流派、状态、模块类别、模型家族分别列出）
 *   2. 还缺什么（哪些流派没人、哪些标签没人用、哪些规则引用了空集）
 *
 * 第二版起加了状态维度。原因是「有 205 位画家」这个数字本身没有信息量，
 * 有信息量的是「205 位里多少是已复核的、多少连名画都没配」。
 *
 * 用法：node tools/inventory.js
 * ============================================================ */
const load = require("./_load.js");
const db = load();
const CORE = require("../assets/data-core.js");

const F = CORE.FACETS.map(f => f.k);
const S_ZH = {}; CORE.STATUS.forEach(s => { S_ZH[s.k] = s.zh; });

function head(t) { console.log("\n---------------- " + t + " ----------------"); }
/* 画一条比例条。宽度是上限，必须双向裁剪：
   只裁下界会在数值超过宽度时算出负数，String.repeat 直接抛错。 */
function bar(n, max, w) {
  const W = w || 24;
  const k = Math.max(0, Math.min(W, max ? Math.round(n / max * W) : 0));
  return "█".repeat(k) + "·".repeat(W - k);
}

console.log("================ 库存总览 ================");
const s = load.stats(db);
Object.keys(s).forEach(k => console.log("  " + k.padEnd(12) + String(s[k]).padStart(5) + " 条"));
console.log("  " + "RELATIONS".padEnd(12) + String(db.RELATIONS.length).padStart(5) + " 条");

/* ---------- 状态分布：这是第二版最该看的一张表 ---------- */
head("验证状态分布（可信度结构）");
function dist(list) {
  const m = {}; CORE.STATUS_KEYS.forEach(k => { m[k] = 0; });
  list.forEach(e => { const st = e.status || "written"; if (m[st] != null) m[st]++; });
  return m;
}
const TABLES = [
  ["画家", db.PAINTERS], ["流派", db.MOVEMENTS], ["名画", db.WORKS],
  ["媒介", db.MEDIUMS], ["题材", db.SUBJECTS],
  ["原子模块", db.ATOMS], ["算子", db.OPERATORS], ["冲突规则", db.CONFLICTS],
  ["签名卡", db.SIGNATURES], ["任务模板", db.TASKS],
  ["来源登记", db.PROVENANCE], ["模型实测", db.TESTS]
];
const allMax = Math.max(...TABLES.map(([, l]) => l.length));
console.log("  " + "表".padEnd(10) + "条数".padStart(6) + "  " +
  CORE.STATUS.map(k => S_ZH[k.k]).join(" "));
TABLES.forEach(([name, list]) => {
  const d = dist(list);
  console.log("  " + name.padEnd(10) + String(list.length).padStart(6) + "  " +
    CORE.STATUS_KEYS.map(k => String(d[k]).padStart(4)).join(" "));
});

head("画家：地域分布");
const reg = {};
db.PAINTERS.forEach(p => { (reg[p.region] = reg[p.region] || []).push(p); });
const regMax = Math.max(...Object.values(reg).map(v => v.length));
Object.keys(reg).sort((a, b) => reg[b].length - reg[a].length).forEach(r => {
  console.log("  " + r.padEnd(10) + String(reg[r].length).padStart(4) + " " +
    bar(reg[r].length, regMax) + "  " + reg[r].map(p => p.zh).join("、"));
});

head("画家：所属流派");
const mv = {};
db.PAINTERS.forEach(p => { mv[p.mv] = (mv[p.mv] || 0) + 1; });
/* 注意：Object.values(mv)[0] 不是最大值——键的插入顺序来自画家表顺序，
   拿它当分母会让几乎所有流派都画成满格。必须显式求 max。 */
const mvMax = Math.max(...Object.values(mv));
Object.keys(mv).sort((a, b) => mv[b] - mv[a]).forEach(m => {
  console.log("  " + m.padEnd(16) + String(mv[m]).padStart(4) + " " + bar(mv[m], mvMax));
});

head("名画：作者分布（前 12）");
const wcount = {};
const pmap = {};
db.PAINTERS.forEach(p => { pmap[p.id] = p.zh; });
db.WORKS.forEach(w => { wcount[w.pid] = (wcount[w.pid] || 0) + 1; });
Object.keys(wcount).sort((a, b) => wcount[b] - wcount[a]).slice(0, 12).forEach(pid => {
  console.log("  " + (pmap[pid] || pid).padEnd(14) + String(wcount[pid]).padStart(3) + " 幅");
});

/* ---------- 第二版新增的四个维度 ---------- */
head("原子模块：12 类 × 4 角色");
const ROLE_ZH = {}; CORE.ROLES.forEach(r => { ROLE_ZH[r.k] = r.zh; });
console.log("  " + "类别".padEnd(14) + "默认面".padEnd(8) + "条数".padStart(5) +
  "  主导 辅助 局部 约束");
db.MODULE_CATS.forEach(c => {
  const list = db.ATOMS.filter(a => a.cat === c.n);
  const r = { lead: 0, support: 0, region: 0, guard: 0 };
  list.forEach(a => { if (r[a.role] != null) r[a.role]++; });
  console.log("  " + (c.n + " " + c.zh).padEnd(14) + String(c.slot).padEnd(8) +
    String(list.length).padStart(5) + "  " +
    CORE.ROLE_KEYS.map(k => String(r[k]).padStart(4)).join(" "));
});
const noRegion = db.MODULE_CATS.filter(c => !db.ATOMS.some(a => a.cat === c.n && a.role === "region"));
console.log("  · 没有任何局部角色的类别（分区策略在这些类别上落不了地）：" +
  (noRegion.map(c => c.n + " " + c.zh).join("、") || "无"));

head("冲突规则：四级分布");
const lv = {};
db.CONFLICTS.forEach(c => { lv[c.level] = (lv[c.level] || 0) + 1; });
CORE.CONFLICT_LEVELS.forEach(l => {
  console.log("  " + (l.k + " " + l.zh).padEnd(18) + String(lv[l.k] || 0).padStart(3) +
    "  动作 " + l.action);
});

head("模型实测：家族覆盖");
const fam = {};
db.TESTS.forEach(t => { (fam[t.family] = fam[t.family] || []).push(t); });
Object.keys(fam).forEach(f => {
  console.log("  " + f.padEnd(12) + String(fam[f].length).padStart(3) + "  " +
    fam[f].map(t => t.model).join("、"));
});
const untested = db.TESTS.filter(t => (t.status || "") !== "tested");
console.log("  · 未实测的模型（只有文字整理，用前请自己先验）：" +
  (untested.map(t => t.model).join("、") || "无"));

head("关系图：边的类型");
const rk = {};
db.RELATIONS.forEach(r => { rk[r.kind] = (rk[r.kind] || 0) + 1; });
Object.keys(rk).sort((a, b) => rk[b] - rk[a]).forEach(k => {
  console.log("  " + k.padEnd(14) + String(rk[k]).padStart(4));
});

head("来源登记：可商用性");
db.PROVENANCE.filter(p => p.cat === "museum").forEach(p => {
  console.log("  " + (p.commercial ? "可商用" : "禁商用") + "  " +
    p.zh.padEnd(22) + String(p.license).padEnd(22) + (p.key ? "需 key" : ""));
});

/* ---------- 编码层盘点 ---------- */
head("编码层：段码与可组合性");
{
  const { REGISTRY } = require("../assets/registry.js");
  const W = 20;
  console.log("  可引用条目 " + REGISTRY.total + " / 段码 " + REGISTRY.SEGMENTS.length +
              " / 关系边 " + REGISTRY.relations.length);
  console.log();
  REGISTRY.SEGMENTS.forEach(s => {
    const usable = REGISTRY.composableCount(s.code);
    const k = Math.round(s.count / Math.max(...REGISTRY.SEGMENTS.map(x => x.count)) * W);
    console.log("  " + s.code.padEnd(4) + s.zh.padEnd(12) +
      String(s.count).padStart(4) + " " + "█".repeat(k) +
      (s.code === "R" ? "  —（事实说明，不进提示词）"
                       : "  " + usable + " 条可组合"));
  });

  /* 编码层的三个真问题：漏编、同层重名、缺中文名。
     这三项都会让「按编码或中文名组合」在某个条目上失效，
     所以放进盘点而不是只放在 check_codes 里 ——
     盘点是定期看的，体检是提交前跑的。 */
  const noZh = REGISTRY.resolver.entries.filter(e => !e.zh);
  const ambPairs = {};
  let amb = 0, shadowed = 0;
  REGISTRY.resolver.entries.forEach(e => {
    const r = REGISTRY.resolver.resolve(e.zh);
    if (r.shadowed) shadowed++;
    if (r.ambiguous) {
      amb++;
      const k = r.cand.map(c => c.kind).sort().join("+");
      ambPairs[k] = (ambPairs[k] || 0) + 1;
    }
  });
  console.log();
  console.log("  · 缺中文名（用户只能靠背编码找它）：" +
    (noZh.length ? noZh.length + " 条 → " + noZh.slice(0, 6).map(e => e.code).join("、")
                 : "无"));
  const sameKind = Object.keys(ambPairs).filter(k => k.indexOf("+") < 0);
  console.log("  · 同层重名（数据缺陷，会让用户看到两个一模一样的选项）：" +
    (sameKind.length ? JSON.stringify(ambPairs) : "无"));
  console.log("  · 跨层同名已按层级收敛：" + shadowed +
    " 条（原子模块 ↔ 光学词条，属已知冗余不是缺陷）");
}

/* ---------- 缺失提示 ---------- */
head("缺失提示");
const byMvId = {};
db.PAINTERS.forEach(p => { if (p.mvId) byMvId[p.mvId] = (byMvId[p.mvId] || 0) + 1; });
const lonely = db.MOVEMENTS.filter(m => !byMvId[m.id]);
console.log("  · 没有任何画家的流派（" + lonely.length + " 个）：" + (lonely.map(m => m.zh + "(" + m.id + ")").join("、") || "无"));

const noWork = db.PAINTERS.filter(p => !db.WORKS.some(w => w.pid === p.id));
console.log("  · 还没配名画的画家（" + noWork.length + " 位）：" + noWork.slice(0, 24).map(p => p.zh).join("、") + (noWork.length > 24 ? " …" : ""));

/* 面上的词条数要分两种情况看，混在一起会误报：
   「空面」是缺陷（这条风格体根本没描述这一面）；
   「单值面」多数不是缺陷——像 light 只写 "no shadow at all" 这种
   否定式表述，一个词就是完整信息，硬凑成两个反而会稀释语义。 */
const emptyFace = {}, singleFace = {};
db.PAINTERS.forEach(p => F.forEach(f => {
  const n = (p.F[f] || []).length;
  if (n === 0) (emptyFace[f] = emptyFace[f] || []).push(p.zh);
  else if (n === 1) (singleFace[f] = singleFace[f] || []).push(p.zh);
}));
const emptyTotal = Object.values(emptyFace).reduce((a, b) => a + b.length, 0);
console.log("  · 有空面的画家（真缺陷，共 " + emptyTotal + " 处）：" +
  (Object.keys(emptyFace).length
    ? Object.keys(emptyFace).map(f => f + " 面 " + emptyFace[f].length + " 位").join("，")
    : "无"));
console.log("  · 各面只有 1 个词的画家（多为否定式表述，不一定是缺陷）：");
F.forEach(f => {
  const l = singleFace[f] || [];
  if (l.length) console.log("      " + f.padEnd(8) + String(l.length).padStart(4) + " 位");
});

const noRel = db.PAINTERS.filter(p => !db.RELATIONS.some(r => r.kind === "influenced" && r.from === p.id) &&
  !db.RELATIONS.some(r => r.kind === "student_of" && r.from === p.id));
console.log("  · 关系表里没有任何影响或师承边的画家（" + noRel.length + " 位）：" +
  noRel.slice(0, 16).map(p => p.zh).join("、") + (noRel.length > 16 ? " …" : ""));

const badPair = db.ATOMS.filter(a => a.role === "region" && a.region &&
  !db.ATOMS.some(x => x.id === a.region.pairWith));
console.log("  · 局部模块配对断裂（会永远静默失效）：" +
  (badPair.map(a => a.id + "→" + a.region.pairWith).join("、") || "无"));

head("语义标签使用频次");
const tg = {};
["PAINTERS", "MOVEMENTS", "WORKS", "MEDIUMS", "SUBJECTS"].forEach(k => {
  db[k].forEach(e => (e.tags || []).forEach(t => { tg[t] = (tg[t] || 0) + 1; }));
});
Object.keys(tg).sort((a, b) => tg[b] - tg[a]).forEach(t => {
  console.log("  " + t.padEnd(20) + String(tg[t]).padStart(4) + " " + bar(tg[t], Object.values(tg)[0], 16));
});
const unused = db.CONFLICTS.reduce((acc, c) => {
  [c.a, c.b].forEach(t => { if (!tg[t]) acc.push(t); });
  return acc;
}, []);
console.log("  · 冲突规则引用了但库里没人用的标签（" + unused.length + " 个，这些规则永远不会触发）：" + (unused.join(", ") || "无"));

const orphanPv = db.RELATIONS.filter(r => r.kind === "aligned_with").map(r => r.to)
  .filter(id => !db.PROVENANCE.some(p => p.id === id));
console.log("  · 指向不存在的来源条目（悬空边）：" + (orphanPv.join(", ") || "无"));
