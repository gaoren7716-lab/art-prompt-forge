/* ============================================================
 * build_json.js —— 导出机器可读的 JSON 数据源
 *
 * 用法：node tools/build_json.js
 * 产物：dist/*.json    单表导出，按场景各取所需
 *       dist/all.json  全量单文件，方便整包下载
 *
 * 为什么要导出：网页工坊是给人点的，JSON 是给程序读的。
 * 别人拿到 all.json 就能自己写脚本做批量组合，不必依赖本仓库的引擎。
 *
 * 第二版起，每条记录都带 status（验证状态）与来源标注，
 * 导出时一并带出，让下游使用者知道哪些能直接用、哪些还需自行验证。
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const load = require("./_load.js");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist");
const CORE = require(path.join(__dirname, "..", "assets", "data-core.js"));

const db = load();

function write(name, obj) {
  const p = path.join(OUT, name);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
  const kb = (fs.statSync(p).size / 1024).toFixed(1);
  const n = Array.isArray(obj) ? obj.length + " 条" : "对象";
  console.log(`  ${name.padEnd(20)} ${String(n).padStart(8)}   ${kb} KB`);
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

/* 状态分布：让使用者知道这批数据的可信度结构 */
function statusDist(list) {
  const m = {};
  CORE.STATUS_KEYS.forEach(k => { m[k] = 0; });
  (list || []).forEach(e => { const s = e.status || "written"; if (m[s] != null) m[s]++; });
  return m;
}

console.log("导出 JSON 数据源到 dist/：");

/* 给每条记录挂上规范 code。
   为什么在导出时挂而不是写进数据源：
     code 是由 CODES.derive(id) 算出来的纯函数结果，
     写进数据源就得两处维护，而派生规则一旦改动、
     数据源里的 code 又忘了重算，就会出现「数据里的 code 解析不了」。
     在导出时挂一次，规则只有 codes.js 一个真源。
   CODES.add 有幂等保护，重复调用不会产生重复映射。 */
const { CODES } = require("../assets/codes.js");
function tag(list) {
  (list || []).forEach(e => { e.code = CODES.add(e.id); });
  return list;
}

write("painters.json", tag(db.PAINTERS));
write("movements.json", tag(db.MOVEMENTS));
write("mediums.json", tag(db.MEDIUMS));
write("subjects.json", tag(db.SUBJECTS));
write("optics.json", db.OPTICS);
write("atoms.json", tag(db.ATOMS));
write("works.json", tag(db.WORKS));
write("operators.json", tag(db.OPERATORS));
write("conflicts.json", tag(db.CONFLICTS));
write("signatures.json", tag(db.SIGNATURES));
write("tasks.json", tag(db.TASKS));
write("provenance.json", tag(db.PROVENANCE));
write("models.json", tag(db.TESTS));
write("facets.json", CORE.FACETS);

/* ---------- 编码层导出 ----------
   别人要按编码组合，就必须能拿到「编码 ↔ 条目」的对照表，
   否则 all.json 里的条目只是一堆孤立记录，谁也拼不起来。 */
const { REGISTRY } = require("../assets/registry.js");

/* 关系边带编码导出：RELATIONS 本身没有 code，
   是 registry 登记时按全局序号补的（tools/_load.js 复用它的加载顺序）。
   直接导出 db.RELATIONS 会丢掉编码，而边编码是「引用某条关系」的唯一入口。 */
write("relations.json", REGISTRY.relations.map(r => ({
  code: r.code, kind: r.kind, kindZh: r.kindZh,
  from: r.from, to: r.to, status: r.status, note: r.note
})));

/* 全库编码总表：一行一条，含层级、是否可组合、旧 ID、别名。
   这是外部使用者做批量组合时唯一需要的文件。

   ★ 必须带上 `legacy`（上一版发布过的编码）：
     用户手里可能有 PA-125 之外的 P-IT-007。给出这一列，
     他们就能把旧串批量映射到新码，而不用一个一个敲进工作台试。 */
const LEGACY_BY_CODE = {};
Object.keys(REGISTRY.codes.LEGACY_OF || {}).forEach(old => {
  const cur = REGISTRY.codes.LEGACY_OF[old];
  (LEGACY_BY_CODE[cur] = LEGACY_BY_CODE[cur] || []).push(old);
});

write("codes.json", REGISTRY.resolver.entries.map(e => ({
  code: e.code, oldId: e.oldId, zh: e.zh, en: e.en,
  kind: e.kind, kindZh: REGISTRY.KIND_ZH[e.kind] || e.kind,
  seg: e.seg, composable: !!REGISTRY.COMPOSABLE[e.kind],
  /* 上一版编码（若与规范码不同）。数组形态：一条可能有多个旧写法 */
  legacy: (LEGACY_BY_CODE[e.code] || []).filter(x => x !== e.code),
  kw: e.kw, note: e.note,
  shadowed: e.shadowed || null
})));

/* 段码表：各段有多少条、哪些能直接进提示词 */
write("code-segments.json", REGISTRY.SEGMENTS.map(s => ({
  code: s.code, layer: s.layer, zh: s.zh, desc: s.desc,
  count: s.count, composable: REGISTRY.composableCount(s.code)
})));

/* ---------- 单条提示词导出 ----------
   codes.json 回答「PA-125 是谁」，这一份回答「PA-125 是什么词」。
   两份必须一起给：只有编码没有词，外部使用者还是得把整库引擎跑起来才能用。

   现算，不落盘缓存 —— 词面是引擎的派生物，引擎一改就必须全量重算。
   单独成文件而不塞进 all.json：这份接近 0.8MB，混进去会把 all.json 撑成
   一个人眼读不了、脚本也不必要整体加载的大文件。 */
const { PROMPTS } = require("../assets/prompts.js");
write("prompts.json", {
  meta: {
    generatedBy: "tools/build_json.js",
    engine: "FORGE.compose",
    grades: PROMPTS.GRADE_ZH,
    demoBase: PROMPTS.DEMO_BASE,
    demoBaseZh: PROMPTS.DEMO_BASE_ZH,
    note: "grade=full 可直接出图；part 是零件，withBase 是挂在演示基底上的版本；" +
          "none 不进提示词，why 写明原因。explain 是转述最低配——" +
          "引用本库提示词时必须带上它；zhGpt 是词条级派生的中文对照，出图以英文词面为准",
    counts: ["full", "part", "none"].map(g => ({
      grade: g, n: PROMPTS.all().filter(x => x.grade === g).length
    }))
  },
  items: PROMPTS.all().map(x => ({
    code: x.code, oldId: x.oldId || null, kind: x.kind, kindZh: x.kindZh,
    zh: x.zh, en: x.en || null, grade: x.grade, gradeZh: x.gradeZh,
    why: x.why || null, note: x.note || null,
    spec: x.spec || null,
    tags: (x.solo && x.solo.tags) || null,
    neg: (x.solo && x.solo.neg) || null,
    gpt: (x.solo && x.solo.gpt) || null,
    explain: x.explain || null,
    zhGpt: x.zhGpt || null,
    tier: (x.solo && x.solo.tier) || null,
    words: (x.solo && x.solo.words) || 0,
    guardAtoms: (x.solo && x.solo.guardAtoms) || null,
    regionAtoms: (x.solo && x.solo.regionAtoms) || null,
    experimental: (x.solo && x.solo.experimental) || false,
    /* 出词纪律的三个结果：导出来，外部工具才能照着判断
       「这条词面为什么少了某幅画」「这位画家为什么没有姓名」 */
    isolatedMotif: (x.solo && x.solo.isolatedMotif) || null,
    aliveSources: (x.solo && x.solo.aliveSources) || null,
    withBase: (x.withBase && x.withBase.tags) || null,
    baseSpec: x.baseSpec || null
  }))
});

/* 单独导出一份「可商用来源」清单：做商业项目的人只需要这一份 */
write("commercial-ok-sources.json", db.PROVENANCE.filter(p => p.commercial === true));

/* 模型能力决策表：
   每个模型一行 —— 主词面策略、权重语法、参数甜区、垫图兜底建议。
   与 assets/model-prompts.js 同源派生，不另写一份。 */
const MP = require(path.join(__dirname, "..", "assets", "model-prompts.js")).MODEL_PROMPTS;
write("model-capabilities.json", {
  schema_version: 1,
  infoKind: "read",
  description: "各模型的词面策略与参数建议。依据 = TESTS 实测字段 + 公开说明，" +
    "整体保持 read；逐模型真出过图后才把对应条目升级为 test。",
  referenceIsolation: MP.ISOLATION,
  models: MP.capabilities()
});

const all = {
  meta: {
    name: "art-prompt-forge",
    zhName: "艺术提示词配方库",
    version: "2.1.0",
    generatedBy: "tools/build_json.js",
    counts: load.stats(db),
    /* 编码层的规模。total 是可引用条目数，
       relations 单独记 —— 关系边不在 RESOLVER 里（它们不是可引用的零件），
       但也有编码，混进 total 会让人以为能拿关系去拼提示词。 */
    codeTotal: REGISTRY.total,
    codeSegments: REGISTRY.SEGMENTS.length,
    codeRelations: REGISTRY.relations.length,
    statusScale: CORE.STATUS,
    infoKinds: CORE.INFO_KINDS,
    roles: CORE.ROLES,
    conflictLevels: CORE.CONFLICT_LEVELS,
    statusDistribution: {
      painters: statusDist(db.PAINTERS),
      movements: statusDist(db.MOVEMENTS),
      works: statusDist(db.WORKS),
      signatures: statusDist(db.SIGNATURES),
      operators: statusDist(db.OPERATORS),
      conflicts: statusDist(db.CONFLICTS),
      atoms: statusDist(db.ATOMS),
      tasks: statusDist(db.TASKS),
      models: statusDist(db.TESTS)
    },
    note: "七个面（medium/brush/color/light/space/motif/spirit）是每个风格体的统一拆解维度；" +
          "所有实体的 status 表示验证状态（collected / written / tested / reviewed），" +
          "越靠右越可信；provenance 单独记录来源与许可，与本库自身许可分开。"
  },
  facets: CORE.FACETS,
  facetGroups: CORE.FACET_GROUPS,
  statusScale: CORE.STATUS,
  infoKinds: CORE.INFO_KINDS,
  roles: CORE.ROLES,
  conflictLevels: CORE.CONFLICT_LEVELS,
  taskCats: db.TASK_CATS,
  moduleCats: db.MODULE_CATS,
  /* 编码段码表：每一段是什么、多少条、哪些能直接进提示词。
     composable 是关键字段 —— 分不清「能拼」与「只能查」，
     下游就会把 CC0 许可名称塞进提示词里。 */
  codeSegments: REGISTRY.SEGMENTS.map(s => ({
    code: s.code, layer: s.layer, zh: s.zh, desc: s.desc,
    count: s.count, composable: REGISTRY.composableCount(s.code)
  })),
  metaKinds: REGISTRY.META_KINDS,
  /* 关系边的类型词表：类型本身带方向与强度说明，
     不带出去的话下游只能靠猜「student_of 到底谁指向谁」。 */
  relationKinds: [
    { k: "held_by",      zh: "收藏机构", dir: "作品 → 机构", strength: "事实",
      tip: "决定这张图的图像能不能商用" },
    { k: "uses",         zh: "承载材料", dir: "作品 → 材料", strength: "事实",
      tip: "决定它占哪个媒介面" },
    { k: "student_of",   zh: "师承",     dir: "画家 → 画家", strength: "强",
      tip: "可照搬" },
    { k: "influenced",   zh: "影响",     dir: "画家 → 画家", strength: "弱",
      tip: "只能借鉴，不可当传承使用" },
    { k: "derived_from", zh: "派生自",   dir: "签名卡 → 母版", strength: "事实",
      tip: "改坏了能找回原始配方" },
    { k: "serves",       zh: "服务任务", dir: "卡片 → 任务", strength: "推荐",
      tip: "这张卡是为哪类诉求做的" },
    { k: "realizes",     zh: "用到模块", dir: "签名卡 → 模块", strength: "构成",
      tip: "这张卡真正起作用的是哪些零件" },
    { k: "aligned_with", zh: "对齐标准", dir: "实体 → 外部标准", strength: "映射",
      tip: "跨库检索与批量扩表的挂钩点" }
  ],
  tagVocabulary: (function () {
    const s = new Set();
    ["PAINTERS", "MOVEMENTS", "MEDIUMS", "SUBJECTS", "WORKS"].forEach(k => {
      db[k].forEach(x => (x.tags || []).forEach(t => s.add(t)));
    });
    return Array.from(s).sort();
  })(),
  painters: db.PAINTERS,
  movements: db.MOVEMENTS,
  mediums: db.MEDIUMS,
  subjects: db.SUBJECTS,
  optics: db.OPTICS,
  atoms: db.ATOMS,
  works: db.WORKS,
  operators: db.OPERATORS,
  conflicts: db.CONFLICTS,
  signatures: db.SIGNATURES,
  tasks: db.TASKS,
  provenance: db.PROVENANCE,
  models: db.TESTS,
  relations: db.RELATIONS
};
write("all.json", all);

const st = load.stats(db);
st.RELATIONS = db.RELATIONS.length;
console.log("\n合计 " + Object.keys(st).map(k => k + "=" + st[k]).join("  "));
console.log("状态分布（画家）：" + JSON.stringify(statusDist(db.PAINTERS)));
console.log("状态分布（名画）：" + JSON.stringify(statusDist(db.WORKS)));
