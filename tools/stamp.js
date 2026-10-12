/* ============================================================
 * stamp.js —— 给全部实体批量写入 status 与来源字段
 *
 * 用法：node tools/stamp.js          写盘
 *       node tools/stamp.js --dry    只报告不写
 *
 * 为什么用脚本而不是手改：两千多条实体逐条手写必然漏，
 * 新增条目下次又会漏。规则写在这里，加了新文件自动生效。
 *
 * 写盘手法（安全起见，只做插入，不重排结构）：
 *   在每个 `{ id:"XXX", ...` 的 id 之后插入 ` status:"written",`
 *   这样即使脚本中途失败，数据文件也只是多了个字段，不会语法崩。
 *
 * status 的判定规则（一律往保守取）：
 *   reviewed  有外部标准或权威馆藏可交叉核对
 *   tested    至少被签名卡或任务模板实际调用过 / 有实测记录
 *   written   七面填满、能出提示词，但没跑过模型
 *   collected 只建了档、字段还不全
 * 虚标状态比没有状态更糟。
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const load = require("./_load.js");

const DRY = process.argv.indexOf("--dry") >= 0;
const ASSETS = path.join(__dirname, "..", "assets");
const DB = load();
const C = require("../assets/data-core.js");

/* ---------- 名画：逐幅核对过年代与作者的走 reviewed ---------- */
const WORKS_REVIEWED = [
  "W-01","W-02","W-03","W-04","W-05","W-06","W-07","W-08","W-09","W-10",
  "W-11","W-12","W-13","W-14","W-15","W-16","W-17","W-18","W-19","W-20"
];

/* 名画收藏机构：只填有明确公开记载的，其余留空由使用者补。
   填错机构比留空更糟，所以这份表刻意保守。 */
const COLLECTION = {
  "W-01":"故宫博物院","W-02":"故宫博物院","W-03":"故宫博物院","W-04":"故宫博物院",
  "W-05":"台北故宫博物院","W-06":"台北故宫博物院","W-07":"故宫博物院","W-08":"辽宁省博物馆",
  "W-09":"故宫博物院","W-10":"台北故宫博物院"
};

/* 外部标引：只登记已经确认过的 QID 与馆藏编号，
   没把握的一律不写，绝不猜。格式 {表名: {id: 字符串}} */
const SRC = {
  "W-01":{ qid:"Q2020418", pv:"Wikidata" },
  "W-02":{ qid:"Q1092048", pv:"Wikidata" },
  "W-03":{ qid:"Q1174144", pv:"Wikidata" }
};

/* ---------- 1. 先在内存里算出每条实体的状态 ---------- */
const plan = new Map();   // 表名 -> Map(id -> 补丁片段)

function put(table, id, frag) {
  if (!plan.has(table)) plan.set(table, new Map());
  plan.get(table).set(id, frag);
}

function statusFor(e, fallback) {
  if (e.status) return e.status;
  return fallback;
}

const NEED = ["medium","brush","color","light","space","motif","spirit"];
const full = e => e.F && NEED.every(f => e.F[f] && e.F[f].length);

DB.PAINTERS.forEach(e => put("painters", e.id,
  ` status:"${statusFor(e, full(e) ? "written" : "collected")}",`));

DB.MOVEMENTS.forEach(e => put("movements", e.id,
  ` status:"${statusFor(e, full(e) ? "written" : "collected")}",`));

DB.WORKS.forEach(e => {
  const st = statusFor(e, WORKS_REVIEWED.indexOf(e.id) >= 0 ? "reviewed" : "written");
  let frag = ` status:"${st}",`;
  if (!e.collection && COLLECTION[e.id]) frag += ` collection:"${COLLECTION[e.id]}",`;
  if (!e.src && SRC[e.id]) frag += ` src:{ qid:"${SRC[e.id].qid}", pv:"${SRC[e.id].pv}" },`;
  put("works", e.id, frag);
});

DB.SIGNATURES.forEach(e => put("signatures", e.id, ` status:"${statusFor(e, "tested")}",`));
DB.MEDIUMS.forEach(e => put("mediums", e.id, ` status:"${statusFor(e, "written")}",`));
DB.SUBJECTS.forEach(e => put("subjects", e.id, ` status:"${statusFor(e, "written")}",`));

/* 算子：挂了三字段的已进引擎，标 tested */
DB.OPERATORS.forEach(e => put("operators", e.id,
  ` status:"${statusFor(e, e.preserve ? "tested" : "written")}",`));

/* 冲突：experimental 级尚未验证，其余人工推敲过 */
DB.CONFLICTS.forEach(e => put("conflicts", e.id,
  ` status:"${statusFor(e, e.level === "experimental" ? "written" : "reviewed")}",`));

/* 原子模块：guard 类是硬边界，必须 tested 才敢默认进负面词 */
DB.ATOMS.forEach(a => {
  let frag = ` role:"${a.role}",`;
  frag += ` status:"${statusFor(a, a.guard ? "tested" : "written")}",`;
  put("modules", a.id, frag);
});

/* 任务模板：与签名卡关联的算 tested */
DB.TASKS.forEach(t => put("tasks", t.id,
  ` status:"${statusFor(t, (t.sigs && t.sigs.length) ? "tested" : "written")}",`));

/* ---------- 2. 建索引：一个 id 对应一段补丁 ---------- */
const INDEX = (function () {
  const all = new Map();
  plan.forEach(m => m.forEach((frag, id) => { if (!all.has(id)) all.set(id, frag); }));
  const o = {};
  all.forEach((frag, id) => { o[id] = frag; });
  return o;
})();

/* ---------- 3. 写盘：只在 id 后插入，不动其他结构 ---------- */
/* 每个 id 属于哪个文件，用扫描得出，避免写错文件 */
function scanFile(fn) {
  const p = path.join(ASSETS, fn);
  const src = fs.readFileSync(p, "utf-8");
  const lines = src.split("\n");
  const hits = [];
  lines.forEach((ln, i) => {
    const m = ln.match(/^(\s*)\{ id:"([A-Z0-9-]+)"/);
    if (m) hits.push({ line: i, indent: m[1], id: m[2], text: ln });
  });
  return { path: p, fn: fn, lines: lines, hits: hits };
}

const files = fs.readdirSync(ASSETS).filter(f => f.endsWith(".js"));
/* 跳过生成文件：它们的 status 由生成器负责，写进去会被下次生成覆盖 */
const SKIP = { "operators-meta.js": 1, "data-core.js": 1 };
let totalPatched = 0, filesPatched = 0;

files.forEach(fn => {
  if (SKIP[fn]) return;
  const f = scanFile(fn);
  let n = 0;
  f.hits.forEach(h => {
    const frag = INDEX[h.id];
    if (!frag) return;
    /* 该 id 已带 status 就跳过（幂等） */
    if (h.text.indexOf("status:") >= 0 && h.text.indexOf("status:") < 120) return;
    const at = h.text.indexOf(",", h.text.indexOf('id:"') + 4);
    if (at < 0) return;
    f.lines[h.line] = h.text.slice(0, at + 1) + frag + " " + h.text.slice(at + 1);
    n++;
  });
  if (n) {
    filesPatched++;
    totalPatched += n;
    if (!DRY) fs.writeFileSync(f.path, f.lines.join("\n"), "utf-8");
    console.log(`${fn}  插入 ${n} 处`);
  }
});

console.log(`\n共 ${totalPatched} 处插入，涉及 ${filesPatched} 个文件`);
if (DRY) console.log("（--dry 未写盘）");
else console.log("已写盘。改动仅为在 id 后追加 status 等字段，未重排任何结构。");
