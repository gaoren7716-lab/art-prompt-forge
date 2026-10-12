/* ============================================================
 * build_md.js —— 导出 Markdown 源文档
 *
 * 用法：node tools/build_md.js
 * 产物：README.md    总览 + 三种用法
 *       docs/*.md    分表文档，可直接二次编辑
 *
 * Markdown 是给人读给人改的那一层：
 * 你看到哪条不满意，直接改 md，将来 md 也能反向回写数据。
 *
 * 第二版起每条记录都带状态徽章，因为一条写得漂亮但没在模型上
 * 跑过的提示词，和被三个模型验证过的提示词，可信度差一个量级。
 * 文档里必须让读者一眼看出自己拿到的是哪一种。
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const load = require("./_load.js");

const ROOT = path.join(__dirname, "..");
const DOC = path.join(ROOT, "docs");
const db = load();
const CORE = require(path.join(ROOT, "assets", "data-core.js"));
const FACETS = CORE.FACETS;

if (!fs.existsSync(DOC)) fs.mkdirSync(DOC, { recursive: true });

/* ---------- 状态徽章 ---------- */
const S_ZH = {};      // k -> 中文
const S_DESC = {};    // k -> 说明
CORE.STATUS.forEach(s => { S_ZH[s.k] = s.zh; S_DESC[s.k] = s.desc; });
const ROLE_ZH = {}; CORE.ROLES.forEach(r => { ROLE_ZH[r.k] = r.zh; });
const LVL_ZH = {}; const LVL_DESC = {}; const LVL_ACT = {};
CORE.CONFLICT_LEVELS.forEach(c => {
  LVL_ZH[c.k] = c.zh; LVL_DESC[c.k] = c.desc; LVL_ACT[c.k] = c.action;
});
const KIND_ZH = {};
CORE.INFO_KINDS.forEach(k => { KIND_ZH[k.k] = k.zh; });

/* 编码层：README 的段码总表与编码手册都直接取自 registry，
   不在各文档里另算一份 —— 两处各算一次就会漂移。 */
const { REGISTRY } = require(path.join(ROOT, "assets", "registry.js"));

/* ---------- 编码层辅助 ----------
   编码由 assets/codes.js 的纯函数派生，数据源里没有这个字段。
   文档生成时现算一次，避免两份真源。 */
const { CODES } = require(path.join(ROOT, "assets", "codes.js"));
function codeOf(id) { return CODES.add(id) || id; }

/* 与原子模块同名的光学词条：内容一致，原子模块多带角色。
   写进文档是为了让读者知道「为什么这两条看起来一模一样」。 */
function shadowedOptics() {
  const atomZh = {};
  db.ATOMS.forEach(a => { atomZh[a.zh] = 1; });
  const out = [];
  db.OPTICS.forEach(g => (g.items || []).forEach(i => {
    if (i.zh && atomZh[i.zh]) out.push({ optic: i, atomZh: i.zh, group: g.zh });
  }));
  return out;
}

function badge(e) {
  const s = (e && e.status) || "written";
  return `\`${s}\` ${S_ZH[s]}`;
}
function statusLine(e) {
  const s = (e && e.status) || "written";
  return `**状态** \`${s}\` ${S_ZH[s]} —— ${S_DESC[s]}`;
}

function out(name, text) {
  const p = path.join(ROOT, name);
  fs.writeFileSync(p, text.replace(/\n{3,}/g, "\n\n"), "utf8");
  console.log("  " + name.padEnd(24) + (fs.statSync(p).size / 1024).toFixed(1) + " KB");
}
function outDoc(name, text) {
  out(path.join("docs", name).replace(/\\/g, "/"), text);
}

/* ---------- 通用：把一个风格体的七面排成表 ---------- */
function facetTable(e) {
  if (!e.F) return "";
  const rows = FACETS.filter(f => e.F[f.k] && e.F[f.k].length)
    .map(f => `| ${f.zh} | \`${f.k}\` | ${e.F[f.k].map(w => "`" + w + "`").join(" / ")} |`);
  if (!rows.length) return "";
  return ["| 面 | 字段 | 词条 |", "| --- | --- | --- |"].concat(rows).join("\n");
}

function tagsOf(e) {
  return (e.tags || []).map(t => "`" + t + "`").join(" ") || "—";
}
function list(arr, sep) {
  return (arr || []).map(x => "`" + x + "`").join(sep || " / ") || "—";
}
function rng(a) {
  if (!a) return "—";
  if (Array.isArray(a)) return a[0] + " – " + a[1];
  return String(a);
}
function dist(list) {
  const m = {};
  CORE.STATUS_KEYS.forEach(k => { m[k] = 0; });
  (list || []).forEach(e => { const s = e.status || "written"; if (m[s] != null) m[s]++; });
  return m;
}
function distRow(name, list) {
  const d = dist(list);
  const cells = CORE.STATUS_KEYS.map(k => `${S_ZH[k]} ${d[k]}`).join(" · ");
  return `| ${name} | ${list.length} | ${cells} |`;
}

/* ============================================================
 * 1. README —— 总览
 * ============================================================ */
{
  const s = load.stats(db);
  /* 配图张数现算 —— 写死一个数，文档就开始说谎 */
  const galImgs = (function () {
    try {
      const man = fs.readFileSync(path.join(__dirname, "..", "assets", "gallery-imgs.js"), "utf8");
      const m = /^var GALLERY_IMGS = \{([\s\S]*?)\};/m.exec(man);
      return m ? (m[1].match(/"[A-Z][\w-]*"\s*:/g) || []).length : 0;
    } catch (e) { return 0; }
  })();
  /* 核对结论与挂账明细同样现算。这里曾经写死过「有一张标了不一致」，
     加一张图那句话立刻就成了假的 —— 而这句假话恰好写在教人怎么看配图的段落里。
     ACCEPTED 里加一条，README 就多一行，不用人记得同步。 */
  const GC = (function () { try { return require("./gallery_check.js"); } catch (e) { return null; } })();
  const galTally = GC ? GC.main({ quiet: true }).tally : { match: 0, partial: 0, unknown: 0 };
  const galOk = galTally.match;
  const galOff = galTally.partial + galTally.unknown;
  const galAcc = (function () {
    if (!GC || !GC.ACCEPTED) return [];
    /* 变奏卡的中文名只在页面定义里有，签名卡的在数据里 —— 两张表合起来查，
       否则 G-02 这类签名卡的挂账行会缺名字，读起来像没写完 */
    let zh = new Map();
    db.SIGNATURES.forEach(s => zh.set(s.id, s.zh));
    try {
      require("./gallery_sync.js").cardTable().zhById.forEach((v, k) => { if (!zh.has(k)) zh.set(k, v); });
    } catch (e) { /* 无目录时留空 */ }
    return Object.keys(GC.ACCEPTED).sort()
      .map(k => "- `" + k + "`" + (zh.get(k) ? " " + zh.get(k) : "") + "：" + GC.ACCEPTED[k]);
  })();
  const region = {};
  db.PAINTERS.forEach(p => { region[p.region] = (region[p.region] || 0) + 1; });
  const regionSorted = Object.keys(region).sort((a, b) => region[b] - region[a]);
  /* 地域分布压成一行：28 行表格对「有多少画家、集中在哪」这个问题是噪音，
     前几名 + 尾数才是有信息量的部分。 */
  const regionLine = regionSorted.slice(0, 5)
    .map(r => r + " " + region[r]).join(" · ")
    + "，其余 " + (regionSorted.length - 5) + " 个地区共 "
    + regionSorted.slice(5).reduce((n, r) => n + region[r], 0) + " 位";

  /* 画廊墙：README 顶部直接看见成品卡的实图，而不是先读一千字再决定要不要打开。
     图与编号都从清单现算 —— 写着 40 张却只有 18 张图，比不写更糟。
     GAL_HIDDEN 里的图不进墙：G-22 配方是生物机械、配图却是无关人体且属裸露内容，
     公开仓库首页不适合挂它。图仍在 gallery/ 里，换图后自动回到墙上。 */
  const GAL_HIDDEN = [
    { code: "G-03", why: "古典裸体，且画面含儿童形象" },
    { code: "G-22", why: "配方是生物机械、配图却是无关人体，待换图" }
  ];
  const hiddenCodes = GAL_HIDDEN.map(h => h.code);
  const galWall = (function () {
    try {
      const sync = require("./gallery_sync.js");
      const man = fs.readFileSync(path.join(__dirname, "..", "assets", "gallery-imgs.js"), "utf8");
      const m = /^var GALLERY_IMGS = \{([\s\S]*?)\};/m.exec(man);
      if (!m) return { html: "", shown: 0, hidden: [] };
      let entries = [...m[1].matchAll(/"([A-Z][\w-]*)"\s*:\s*"([^"]+)"/g)]
        .map(x => ({ code: x[1], rel: x[2] }));
      const zh = new Map();
      db.SIGNATURES.forEach(s => zh.set(s.id, s.zh));
      try { sync.cardTable().zhById.forEach((v, k) => { if (!zh.has(k)) zh.set(k, v); }); } catch (e) { /* 无目录 */ }
      /* 按卡片在页面上的先后排，不按文件名字典序 —— 否则 VAR 会插在 G 中间 */
      let order = [];
      try { order = sync.cardTable().all; } catch (e) { /* 无目录 */ }
      entries.sort((a, b) => {
        const ia = order.indexOf(a.code), ib = order.indexOf(b.code);
        return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
      });
      const show = entries.filter(e => hiddenCodes.indexOf(e.code) < 0);
      const hidden = GAL_HIDDEN
        .filter(h => entries.some(e => e.code === h.code))
        .map(h => h.code + "（" + h.why + "）");
      const COLS = 5;
      let html = "<table>\n";
      for (let i = 0; i < show.length; i += COLS) {
        html += "<tr>\n";
        for (let j = i; j < Math.min(i + COLS, show.length); j++) {
          const e = show[j];
          html += '<td align="center" valign="top">'
            + '<img src="' + e.rel + '" width="150" alt="' + e.code + '"><br>'
            + "<code>" + e.code + "</code><br>" + (zh.get(e.code) || "") + "</td>\n";
        }
        html += "</tr>\n";
      }
      html += "</table>";
      return { html, shown: show.length, total: entries.length, hidden };
    } catch (e) { return { html: "", shown: 0, total: 0, hidden: [] }; }
  })();

  const relKind = {};
  db.RELATIONS.forEach(r => { relKind[r.kind] = (relKind[r.kind] || 0) + 1; });

  /* 覆盖缺口：宁可说自己缺什么，也不要让人误以为已经收齐 */
  const byMvId = {};
  db.PAINTERS.forEach(p => { if (p.mvId) byMvId[p.mvId] = (byMvId[p.mvId] || 0) + 1; });
  const lonelyMv = db.MOVEMENTS.filter(m => !byMvId[m.id]);
  const noWork = db.PAINTERS.filter(p => !db.WORKS.some(w => w.pid === p.id));
  const notReviewedWorks = db.WORKS.filter(w => (w.status || "written") !== "reviewed");
  const notTestedAtoms = db.ATOMS.filter(a => (a.status || "") !== "tested");
  /* 画家目前几乎全是 written，与其让读者以为这是缺陷，不如说清原因 */
  const painterNote = dist(db.PAINTERS).reviewed === 0
    ? "画家条目目前全部为 `written`：词条按通行艺术史描述整理，但没有逐条做二手来源交叉核对，`reviewed` 只给了年代与归属有争议的一批名画与外部标准。不要把「已编写」读成「已核实」。"
    : "";

  /* 编码层：README 里的段码总表直接取自上面的 registry。 */
  const codeTotal = REGISTRY.total;
  const codeSegRow = REGISTRY.SEGMENTS.map(s => {
    const c = s.code === "RL" ? "—（事实说明）" : REGISTRY.composableCount(s.code);
    return "| `" + s.code + "` | " + s.zh + " | " + s.count + " | " + c + " |";
  }).join("\n");

  out("README.md", `
<!-- 本文件由 tools/build_md.js 生成。手改会被下次生成覆盖 —— 要改内容请改模板。
     曾经在生成后的 README 上直接改过一整段配图说明，跑一次 build_md.js 全部消失。 -->
# 画作 提示词库 · art-prompt-forge

**在线打开：** <https://gaoren7716-lab.github.io/art-prompt-forge/> —— 不用安装，不用起服务器。
（仓库：<https://github.com/gaoren7716-lab/art-prompt-forge>）

把画风拆成七个面——媒介底材 / 笔法肌理 / 色彩关系 / 光的处理 / 空间构图 / 固定母题 / 精神气质。
画风因此能当零件用：整条照搬、只取某一面、或者换世纪换媒介换题材。

- **直接抄** —— \`${s.SIGNATURES + 15}\` 张成品卡，全部配了实图，复制即用。
- **组合拼** —— 画家 / 流派 / 名画 / 媒介 / 题材 / 光学 / 原子模块任意叠，\`@\` 强度决定像到几分。
- **受控变形** —— \`${s.OPERATORS}\` 个算子改写世纪、媒介、题材，或只取某人的某一面。

## 画廊

共 \`${galWall.total}\` 张成品卡（\`${s.SIGNATURES}\` 张签名卡 + 15 张组合变奏）**全部配了实图**，
下面按卡片顺序摊开。**图下那个编号就是配图文件名，也是这张卡在在线版里的入口** ——
看中哪张，进在线版搜这个编号，或打开 \`index.html\` 点那张卡直接复制。

${galWall.html}
${galWall.hidden.length ? "\n> **上面少了 " + galWall.hidden.length + " 张，不是漏了：** " + galWall.hidden.join("；")
  + "。图仍在 \`gallery/\` 里（在线画廊能看到），只是不挂在公开仓库首页；换图后自动回来。" : ""}

## 先说清楚这不是什么

**它没有收齐全球画家**：现有 ${s.PAINTERS} 位，覆盖 ${Object.keys(region).length} 个地区。
数字会变，以本页表格为准，别引用一个固定的「全球 N 位」。

每条记录带四级验证状态，**\`written\` 是默认值** —— 看到它就意味着
「词写得通，但没人验证过它在模型上真出这个效果」。一条被验证过的和一条只在纸上成立的，
可信度差一个量级，混在一起会害你调半天参数。

| 状态 | 含义 |
| --- | --- |
| \`collected\` 已收录 | 实体已建档，事实与出处已核对，但还没写成提示词 |
| \`written\` 已编写 | 七面已填满，能直接出提示词，但没在模型上验证过 |
| \`tested\` 已测试 | 至少在一个模型上跑过并留了结果记录 |
| \`reviewed\` 已复核 | 有第二个来源交叉核对过，出处、年代、归属均无争议 |

${painterNote ? painterNote + "\n" : ""}
## 文件导航

| 文件 | 给谁用 |
| --- | --- |
| \`index.html\` | 网页配方工坊 + 编码工作台，双击即可用，完全离线 |
| \`dist/all.json\` | 结构化数据源，给写脚本的人 |
| \`dist/codes.json\` | 编码对照表（${codeTotal} 条），给要按编码批量组合的人 |
| \`dist/prompts.json\` | 每条编码对应的实际提示词（tags / neg / gpt / explain / zhGpt），不装引擎也能直接取词 |
| \`dist/model-capabilities.json\` | 12 个模型的词面策略与参数甜区决策表，附参考隔离指令 |
| \`docs/*.md\` | 源文档，给要读、要改、要补充的人 |
| \`SCHEMA.md\` | 数据契约：想新增条目就照这里写 |
| \`AGENTS.md\` | 给 AI agent 的项目规则：不可让步的约定、出词纪律、回归命令 |
| \`INDEX.md\` | 一页索引：想干的事 → 去哪里；含决策归属表（谁定 / 跟着谁走） |
| \`SKILL.md\` | 可安装技能入口：装进 agent 按这份规则用本库 |

## 按编码或中文名取用

每条都有三位编码，编码 / 中文名 / 英文名 / 旧 ID 互相都能解析：

\`\`\`
PA-125 + 明暗对照 + 单侧窗光 + OP-004
达·芬奇 + 黄金时刻 + 安静的哀伤
\`\`\`

在线版顶栏的**编码工作台**查编码、组串、看段码总表；命令行同样能取：

\`\`\`bash
node tools/show_prompt.js PA-125      # 编码、中文名、英文名都吃
node tools/show_prompt.js AT-001 --platform mj
\`\`\`

每条都标了档位：**可直接出图** / **零件需搭配基底**（原子模块、光学词条、算子 ——
单独跑只剩一句约束词，所以附一份挂在演示基底上的）/ **不进提示词**（来源许可、
模型实测、冲突规则 —— 会写明为什么）。理由见 \`docs/13-编码手册.md\`。

**段码只表示归属，不含义** —— 可读性靠中文名：

| 段码 | 名称 | 条数 | 可直接组合 |
| --- | --- | --- | --- |
${codeSegRow}

标「可组合 0」的段是**元层**：签名卡要整套套用而不是往里加词，任务模板是流程起点，
冲突规则由引擎自动裁决，来源许可与模型实测是查证用的。
把它们塞进提示词不会报错，只会让结果莫名其妙，所以解析器会挡掉并在界面上标出来。

## 六层结构

| 层 | 表 | 回答什么问题 |
| --- | --- | --- |
| 一 · 全球艺术地图 | \`PAINTERS\` \`MOVEMENTS\` \`WORKS\` | 有谁、有什么流派、有哪些具体作品 |
| 二 · 参考实体与关系 | \`MEDIUMS\` \`SUBJECTS\` \`OPTICS\` \`RELATIONS\` | 它由什么做成、画的是什么、跟谁有关系 |
| 三 · 原子视觉模块 | \`ATOMS\`（${s.ATOMS} 条 / 12 类） | 一个可独立取用的视觉单元，带角色与投放面 |
| 四 · 任务与成品模板 | \`TASKS\` \`SIGNATURES\` | 使用者带着什么诉求来，验收标准是什么 |
| 五 · 组合与变形规则 | \`OPERATORS\` \`CONFLICTS\` | 怎么改写、两种风格撞车时听谁的 |
| 六 · 模型适配与验证 | \`TESTS\` \`PROVENANCE\` | 这段词在哪个模型上怎么写、图像能不能商用 |

关系表现有 \`${db.RELATIONS.length}\` 条边：${Object.keys(relKind).map(k => k + " " + relKind[k]).join(" · ")}。

## 核心设计：七个面

每个风格体（画家、流派、名画）都被拆成同样的七个维度，这是「可解构」的前提：

${FACETS.map(f => "- **" + f.zh + "**（`" + f.k + "`）—— " + f.desc).join("\n")}

想要整条就七面全取；想要零件就只取一面；想要融合就甲的笔法 + 乙的色彩 + 丙的空间。

## 库存

| 模块 | 数量 |
| --- | --- |
| 画家 | ${s.PAINTERS} |
| 流派 / 运动 | ${s.MOVEMENTS} |
| 名画 | ${s.WORKS} |
| 媒介 / 技法 | ${s.MEDIUMS} |
| 题材 | ${s.SUBJECTS} |
| 横切光学词条 | ${s.OPTICS} 组 / ${db.OPTICS.reduce((n, g) => n + (g.items || []).length, 0)} 词 |
| 原子视觉模块 | ${s.ATOMS} |
| 变形算子 | ${s.OPERATORS} |
| 冲突规则 | ${s.CONFLICTS} |
| 签名卡 | ${s.SIGNATURES} |
| 任务模板 | ${s.TASKS} |
| 来源与许可登记 | ${s.PROVENANCE} |
| 模型实测记录 | ${s.TESTS} |
| 关系边 | ${db.RELATIONS.length} |
| **可引用条目（带编码）** | **${codeTotal}** |

### 状态分布

| 表 | 条数 | 状态构成 |
| --- | --- | --- |
${[
  distRow("画家", db.PAINTERS), distRow("流派", db.MOVEMENTS),
  distRow("名画", db.WORKS), distRow("媒介", db.MEDIUMS),
  distRow("原子模块", db.ATOMS), distRow("算子", db.OPERATORS),
  distRow("签名卡", db.SIGNATURES), distRow("任务", db.TASKS),
  distRow("来源", db.PROVENANCE), distRow("模型实测", db.TESTS)
].join("\n")}

### 画家的地域分布

${s.PAINTERS} 位画家分布在 ${Object.keys(region).length} 个地区：${regionLine}。

### 覆盖缺口（请连同上表一起读）

${[
  /* 0 条的那一行不输出 —— 「没有任何画家的流派 0 个：无」是纯噪音 */
  lonelyMv.length ? "- **没有任何画家的流派 " + lonelyMv.length + " 个**：" + lonelyMv.map(m => m.zh).join("、") : "",
  "- **还没有配名画的画家 " + noWork.length + " 位**（占 " + (noWork.length / db.PAINTERS.length * 100).toFixed(0) + "%）："
    + noWork.slice(0, 16).map(p => p.zh).join("、") + (noWork.length > 16 ? " 等" : ""),
  "- **名画里尚未复核的 " + notReviewedWorks.length + " 幅**：机构归属与年代仍需二次核对",
  "- **原子模块里未实测的 " + notTestedAtoms.length + " 条**：分区与约束类模块的实际效果还需在模型上验证"
].filter(Boolean).join("\n")}

## 四种玩法

**一、直接抄。** 打开 \`index.html\` 进「示例画廊」：${s.SIGNATURES + 15} 张成品卡，
卡面有一句话画面与成分 chips，按钮直接复制；筛选三层（主分类 / 题材 / 色调），视图可切「看图 / 扫编号」。

**二、换零件。** 抄一张卡，把画家从梵高换成谢洛夫，或用 OP-D-02 只留某位大师的笔法。每处改动立刻出词，不用重来。

**三、受控变形。** ${s.OPERATORS} 个算子做四件事：迁移世纪（OP-E）、迁移媒介（OP-M）、迁移题材（OP-S）、解构取值（OP-D）。冲突自动裁决，不用自己判断哪两种风格不能叠。

**四、写脚本。** 拿 \`dist/all.json\` 用任意语言复现这套逻辑，或直接 require \`assets/forge-kit.js\`。

## 配图怎么进画廊

**文件名 = 卡面左上角那个编号**（\`G-01.jpg\` / \`VAR-03.jpg\`），扩展名 png / jpg / webp 都收、大小写不敏感。
编号不用记 —— 它**能点**，点一下把 \`VAR-01.png\` 复制到剪贴板，拿去重命名图片即可。
\`assets/gallery-imgs.js\` 是自动生成的派生物，手改会被下次同步覆盖。

同步两条路：双击「同步画廊.bat」（会顺手把按序号命名的旧文件改成卡片编码），
或挂着「画廊守夜人.bat」。守夜人是**进程不是服务**，窗口一关就停 —— 它每 10 秒写一次心跳，
\`gallery_sync.js\` 会直接告诉你它还在不在，不用靠猜。图放进去没反应时，
**画廊页面会列出没被认领的文件名、并说清该改成什么名字**：多数人的动作是「图一丢、回来刷新页面」，
命令行里的警告根本看不到，页面上那句提示才是能拦住问题的位置。
（这段机制为什么会反复出问题、以及怎么钉住的，记在 \`AGENTS.md\`。）

**图和提示词会对不上，同步时就报。** \`gallery_check.js\` 逐张核对图与配方是否同源；
对不上只有两条路 —— 改图或改配方，或者连原因与日期写进 \`ACCEPTED\` 挂账、并给卡片加
\`imgNote\`（卡面挂「图≠配方」徽章，详情写明差在哪）。挂账之外的新出入会让脚本退出码 1。
目前 ${galImgs} 张里 ${galOk} 张一致、${galOff} 张挂账：

${galAcc.join("\n")}

**图进得去不等于两者是同一件事** —— 看着图复制提示词，两者不是一回事却不说，比没图更误导。
引擎出图的图还要清平台水印与模型自己画的假签名：\`python tools/gallery_img.py <出图png> <编码>\`。

## 出词纪律（引擎自动执行）

三条纪律在出词时自动生效，界面上会说明，不用你记：

1. **在世艺术家的姓名不进词面**（判据是生卒年字段）；已故大师的姓名引用保留。
2. **具体画作标题不进构图词面** —— 写进去模型会去画那幅画，而你要的是这个画家的画风。
3. **你自己的话原样追加在末尾**，不占任何一面、不参与冲突裁决。

## 关于图像与许可

本库的**代码与原创提示词**是本库的（见 PV-40）。
但**名画图像不是**——它们分属各馆，各馆许可不同。
\`dist/commercial-ok-sources.json\` 单独导出了可商用来源清单，
大英博物馆等非商用机构已明确排除。做商用之前先看那份清单，别把 CC0 套到作品图上。

## 命令

\`\`\`bash
node tools/check_fields.js     # 字段体检：中英串味、坏字符、非法语义标签
node tools/build_json.js       # 导出 dist/*.json（含 codes.json / prompts.json）
node tools/build_md.js         # 导出 docs/*.md 与 README
node tools/show_prompt.js      # 查单条编码对应的提示词
node tools/dedupe_role.js      # 清理重复书写的 role 字段（幂等）
node tools/gen_op_meta.js      # 由算子结构重新推导 preserve/change/forbid
node tools/stamp_zh.js         # 批量补 zh（幂等，--check 预演）

# 配图三件套：同步只管登记，核对只管对不对得上，转码只管体积
node tools/gallery_sync.js     # 同步 + 差异报告（--check 只体检 / --rename 序号名改卡片编码）
node tools/gallery_check.js    # 核对：未挂账的图/配方出入会让退出码 1
node tools/gallery_compress.js # 1200px PNG 转 JPEG q88（--check 看能省多少 / --restore 还原原图）
node tools/gallery_watch.js    # 守着 gallery/，图一落盘就自动同步 + 重建（窗口别关）
\`\`\`

改完数据跑一遍回归（四套必须全绿）：

\`\`\`bash
node tools/check_fields.js     # 字段体检
node tools/smoke.js            # 引擎逻辑冒烟
NODE_PATH=<jsdom路径> node tools/smoke-web.js   # 界面冒烟（需要 jsdom，缺了它只打印一行就退出）
node tools/check_codes.js      # 编码层体检（九组断言）
node tools/inventory.js        # 多维盘点：谁还没收、哪个标签没人用
\`\`\`

项数不写在这里 —— 加一条断言数字就变一次，写死的项数下个月就是假的。
`);
}

/* ============================================================
 * 2. 画家（按区域分册）
 * ============================================================ */
{
  const groups = {};
  db.PAINTERS.forEach(p => { (groups[p.region] = groups[p.region] || []).push(p); });
  const order = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  let md = `# 画家索引\n\n共 ${db.PAINTERS.length} 位。每条都含七面词条、语义标签与注意事项。\n\n`;
  md += `**状态分布**：${CORE.STATUS.map(k => {
    const d = dist(db.PAINTERS); return `${S_ZH[k.k]} ${d[k.k]}`;
  }).join(" · ")}\n\n`;
  md += `标 \`reviewed\` 的表示已由第二个来源交叉核对；标 \`written\` 的是默认状态——能用，但没人在模型上验证过。\n`;
  order.forEach(r => {
    md += `\n---\n\n## ${r}（${groups[r].length} 位）\n\n`;
    groups[r].forEach(p => {
      md += `\n### ${p.zh} · ${p.en}\n\n`;
      md += `**\`${p.id}\`**（编码 \`${codeOf(p.id)}\`） · ${p.life} · ${p.mv}（\`${p.mvId || "—"}\`） · ${badge(p)}\n\n`;
      md += `> ${p.desc}\n\n`;
      md += facetTable(p) + "\n\n";
      md += `- 署名：${(p.sty || []).map(x => "`" + x + "`").join(" / ")}\n`;
      md += `- 语义标签：${tagsOf(p)}\n`;
      md += `- **注意**：${p.note}\n`;
      if (p.src) md += `- 来源：${JSON.stringify(p.src)}\n`;
    });
  });
  outDoc("01-画家.md", md);
}

/* ============================================================
 * 3. 流派
 * ============================================================ */
{
  let md = `# 流派与运动\n\n共 ${db.MOVEMENTS.length} 条，覆盖六朝至今、覆盖东西方。\n`;
  db.MOVEMENTS.forEach(m => {
    md += `\n### ${m.zh} · ${m.en}\n\n`;
    md += `**\`${m.id}\`**（编码 \`${codeOf(m.id)}\`）${m.life ? " · " + m.life : ""} · ${badge(m)}\n\n`;
    if (m.desc) md += `> ${m.desc}\n\n`;
    md += facetTable(m) + "\n\n";
    md += `- 署名：${(m.sty || []).map(x => "`" + x + "`").join(" / ") || "—"}\n`;
    md += `- 语义标签：${tagsOf(m)}\n`;
    if (m.note) md += `- **注意**：${m.note}\n`;
  });
  outDoc("02-流派.md", md);
}

/* ============================================================
 * 4. 名画
 * ============================================================ */
{
  const pmap = {};
  db.PAINTERS.forEach(p => { pmap[p.id] = p; });
  /* 从关系表取机构与材料，避免同一信息两处维护 */
  const held = {}; const uses = {};
  db.RELATIONS.forEach(r => {
    if (r.kind === "held_by") (held[r.from] = held[r.from] || []).push(r.to);
    if (r.kind === "uses") (uses[r.from] = uses[r.from] || []).push(r.to);
  });
  const md2 = {};
  db.MEDIUMS.forEach(m => { md2[m.id] = m.zh + "（`" + m.id + "`）"; });

  let md = `# 名画\n\n共 ${db.WORKS.length} 幅。名画自带 pri=40，低于画家 60，所以与画家同挂时画家语言压得住它；单独挂时得到的是这一次具体的构图与母题。\n\n`;
  md += `每条另附**收藏机构**与**承载材料**（取自关系表）：机构决定这张图的图像能不能商用，材料决定它占哪个媒介面。\n`;
  db.WORKS.forEach(w => {
    const p = pmap[w.pid];
    md += `\n### ${w.zh} · ${w.en}\n\n`;
    md += `**\`${w.id}\`**（编码 \`${codeOf(w.id)}\`） · ${w.year}${p ? " · " + p.zh + "（`" + p.id + "`）" : ""}${w.mvId ? " · " + w.mvId : ""} · ${badge(w)}\n\n`;
    md += `> ${w.desc}\n\n`;
    md += facetTable(w) + "\n\n";
    if (w.collection) md += `- 收藏：${w.collection}\n`;
    if (held[w.id]) md += `- 收藏机构（关系表）：${held[w.id].join("、")}\n`;
    if (uses[w.id]) md += `- 承载材料：${uses[w.id].map(x => md2[x] || x).join("、")}\n`;
    md += `- 语义标签：${tagsOf(w)}\n`;
    if (w.src) md += `- 来源核对：${typeof w.src === "string" ? w.src : JSON.stringify(w.src)}\n`;
    md += `- **注意**：${w.note}\n`;
  });
  outDoc("03-名画.md", md);
}

/* ============================================================
 * 5. 变形算子（含 preserve / change / forbid 三字段）
 * ============================================================ */
{
  let md = `# 变形算子\n\n共 ${db.OPERATORS.length} 个。算子是数据不是代码：往 \`OPERATORS\` 里加一项，引擎一行都不用改。\n\n`;
  md += `## 字段怎么读\n\n`;
  md += `| 字段 | 作用 |\n| --- | --- |\n`;
  md += `| \`keep\` | 保留哪些面 |\n| \`only\` | 只取这几面（解构专用） |\n| \`inject\` | 往指定面塞词 |\n| \`add\` | 追加散词 |\n| \`neg\` | 追加负面词 |\n| \`tags\` | 参与冲突裁决的语义标签 |\n`;
  md += `\n## 变形三字段\n\n这是第二版加的：光说「变形」说不清变形会动什么、不能动什么，所以每个算子额外声明三件事。\n\n`;
  md += `| 字段 | 含义 | 引擎行为 |\n| --- | --- | --- |\n`;
  md += `| \`preserve\` | 必须原样保留的面，变形的底线 | 其余来源在这些面上权重再高也不覆盖 |\n`;
  md += `| \`change\` | 变形实际要改的面 | 这些面上其他来源让位给算子 |\n`;
  md += `| \`forbid\` | 绝对不能出现的特征 | 直接进负面词，不参与权重调节 |\n\n`;
  md += `三字段由 \`tools/gen_op_meta.js\` 从 \`keep\` / \`only\` / \`inject\` **推导**得出，不要手写——\n`;
  md += `手写必然出现「既保留又改」的自相矛盾。改了算子结构就重跑生成器，它会校验交集与未归类面。\n\n`;

  const byType = {};
  db.OPERATORS.forEach(o => { (byType[o.type] = byType[o.type] || []).push(o); });
  Object.keys(byType).forEach(t => {
    md += `\n---\n\n## ${t}\n`;
    byType[t].forEach(o => {
      md += `\n### ${o.zh} · \`${o.id}\` · 编码 \`${codeOf(o.id)}\`\n\n`;
      md += `${badge(o)}\n\n`;
      if (o.en) md += `${o.en}\n\n`;
      if (o.desc) md += `> ${o.desc}\n\n`;
      const f = [];
      if (o.keep) f.push("保留面：" + o.keep.map(x => "`" + x + "`").join(" "));
      if (o.only) f.push("只取面：" + o.only.map(x => "`" + x + "`").join(" "));
      if (o.inject) f.push("注入：" + Object.keys(o.inject).map(k => "`" + k + "` → " + o.inject[k].map(x => "`" + x + "`").join(" / ")).join("，"));
      if (o.add) f.push("追加词：" + o.add.map(x => "`" + x + "`").join(" "));
      if (o.neg) f.push("负面词：" + o.neg.map(x => "`" + x + "`").join(" "));
      if (o.tags) f.push("语义标签：" + o.tags.map(x => "`" + x + "`").join(" "));
      f.forEach(x => { md += "- " + x + "\n"; });
      md += "\n**变形三字段**\n\n";
      md += `- \`preserve\`：${list(o.preserve, " ")}\n`;
      md += `- \`change\`：${list(o.change, " ")}\n`;
      md += `- \`forbid\`：${list(o.forbid, " ")}\n`;
      if (o.note) md += `\n**注意**：${o.note}\n`;
    });
  });
  outDoc("04-算子.md", md);
}

/* ============================================================
 * 6. 冲突规则（四级）
 * ============================================================ */
{
  let md = `# 冲突裁决规则\n\n共 ${db.CONFLICTS.length} 条，分四级。\n\n`;
  md += `## 为什么分级\n\n`;
  md += `把所有撞车都当成「二选一」是错的。灰调和高饱和确实互斥，但它们可以分区共存；\n`;
  md += `水墨和照片质感同框则属于实验性组合——允许，但必须标注未验证。\n`;
  md += `四种处理方式对应四种不同的用户处境：\n\n`;
  md += `| 级别 | 含义 | 引擎动作 | 谁该做什么 |\n| --- | --- | --- | --- |\n`;
  md += `| \`hard\` 明确矛盾 | 两套语言在同一诉求下无法同时成立 | \`${LVL_ACT.hard}\` 静音低权重一方 | 使用者必须选一套 |\n`;
  md += `| \`regional\` 局部并存 | 整体冲突但可分配到不同区域 | \`${LVL_ACT.regional}\` 给出分区建议 | 配合遮罩落实，或改用 region 模块 |\n`;
  md += `| \`soft\` 可共存 | 只是张力，不互斥 | \`${LVL_ACT.soft}\` 仅提示 | 什么都不用做 |\n`;
  md += `| \`experimental\` 实验性混合 | 允许但尚未验证 | \`${LVL_ACT.experimental}\` 输出时标注未验证 | 知道自己在冒险即可 |\n\n`;
  md += `裁决逻辑：每条规则两侧各有一组语义标签，同一个人（或算子）同时具备两侧标签时触发。\n\n`;
  md += `\`\`\`\n得分 = 类型优先级 + 权重 × 10\n算子优先级恒定为 100，代表用户明确意图，永不退让\n\`\`\`\n\n`;
  md += `类型优先级：\`work\` 40 < \`movement\` 50 < \`painter\` 60 < \`medium\` 80 < \`subject\` 85 < \`operator\` 100。\n\n`;

  const byLevel = {};
  db.CONFLICTS.forEach(c => { (byLevel[c.level] = byLevel[c.level] || []).push(c); });
  ["hard", "regional", "soft", "experimental"].forEach(lv => {
    if (!byLevel[lv]) return;
    md += `\n---\n\n## ${LVL_ZH[lv]}（${byLevel[lv].length} 条）\n\n${LVL_DESC[lv]}\n\n`;
    md += `| 编号 | 状态 | A 侧 | B 侧 | 波及面 | 说明 | 怎么改 |\n| --- | --- | --- | --- | --- | --- | --- |\n`;
    byLevel[lv].forEach(c => {
      md += `| \`${c.id}\` | ${badge(c)} | \`${c.a}\` | \`${c.b}\` | ${list(c.scope, " ")} | ${c.msg} | ${c.fix || "—"} |\n`;
      if (lv === "regional" && c.region) {
        md += `\n  ↳ \`${c.id}\` 分区建议：${c.region.aSide} ← ${c.region.bSide}，${c.region.seam}\n`;
      }
    });
  });
  outDoc("05-冲突规则.md", md);
}

/* ============================================================
 * 7. 媒介与题材
 * ============================================================ */
{
  let md = `# 媒介与题材\n\n## 媒介 / 技法（${db.MEDIUMS.length} 条）\n\n`;
  md += `媒介的优先级是 80，高于画家（60）：挂上媒介，画家的物质层就要让位。\n\n`;
  md += `媒介还通过关系表与名画相连——\`W-57\` 用 \`MD-02\`，\`W-56\` 用 \`MD-01\`。\n`;
  db.MEDIUMS.forEach(m => {
    md += `\n### ${m.zh} · ${m.en} · \`${codeOf(m.id)}\`\n\n**\`${m.id}\`** · ${badge(m)}\n\n`;
    if (m.desc) md += `> ${m.desc}\n\n`;
    md += facetTable(m) + "\n\n";
    md += `- 语义标签：${tagsOf(m)}\n`;
    if (m.note) md += `- **注意**：${m.note}\n`;
  });

  md += `\n---\n\n## 题材（${db.SUBJECTS.length} 条）\n\n`;
  md += `题材优先级 85，低于算子（100）但高于媒介（80）：它决定画面里有什么，且附带该题材默认的构图。\n`;
  db.SUBJECTS.forEach(s => {
    md += `\n### ${s.zh} · ${s.en}\n\n**\`${s.id}\`** · ${s.cat} · ${badge(s)}\n\n`;
    if (s.desc) md += `> ${s.desc}\n\n`;
    md += `- 关键词：${list(s.kw)}\n`;
    md += facetTable(s) + "\n\n";
    if (s.note) md += `- **注意**：${s.note}\n`;
  });
  outDoc("06-媒介与题材.md", md);
}

/* ============================================================
 * 8. 光学词条
 * ============================================================ */
{
  let md = `# 横切光学词条\n\n共 ${db.OPTICS.length} 组、${db.OPTICS.reduce((n, g) => n + (g.items || []).length, 0)} 个词条。这一层是「谁都能用」的通用零件，勾选后按 slot 投进对应的面，永远追加在最后且不被截断。\n\n`;
  md += `与原子模块（\`docs/10\`）的区别：光学词条是**横向词表**，按类别组织、一次可多选；\n`;
  md += `原子模块是**带角色的单元**，一次只能指定一个角色，且约束类强制进负面。\n\n`;
  md += `每个词条都有独立编码（\`OP-004\` 这样），中文名也能直接用。\n`;
  md += `注意有 ${shadowedOptics(db).length} 处词条与原子模块同名（内容一致、原子模块多带角色），\n`;
  md += `直接写中文名时默认命中原子模块，要指定本层的词条请用它的 \`OP\` 段编码。\n\n`;
  const SLOT = { "光影": "light", "空间透视": "space", "构图取景": "space", "色彩关系": "color", "肌理与呈现": "medium", "笔触控制": "brush", "气氛情绪": "spirit", "时间与天候": "light" };
  db.OPTICS.forEach(g => {
    md += `\n## ${g.zh} \`${codeOf(g.id)}\`\n\n投放面：\`${SLOT[g.zh] || g.slot || "space"}\`\n\n`;
    /* 表头写「规范编码」而不是「编码」：这一列是派生出来的规范码，
       旧 ID（O-01-004）仍能解析但不是这一列要给的东西 ——
       两列混在一列里，读者就不知道该抄哪个进组合串。 */
    md += "| 规范编码 | 中文名 | 英文词 | 说明 |\n| --- | --- | --- | --- |\n";
    (g.items || []).forEach(i => {
      md += `| \`${codeOf(i.code)}\` | \`${i.zh || "—"}\` | \`${i.t}\` | ${i.c} |\n`;
    });
  });
  outDoc("07-光学词条.md", md);
}

/* ============================================================
 * 9. 签名卡
 * ============================================================ */
{
  const F = db.FORGE;
  let md = `# 手写大师签名卡\n\n共 ${db.SIGNATURES.length} 张。每张都是一份调好的 spec，直接喂给引擎即可出词。抄走之后还能改权重、换算子，所以它们不是终点而是起点。\n\n`;
  md += `每张卡下方都附了它派生的母版（\`derived_from\` 关系），改坏了能找回来。\n`;
  const parent = {};
  db.RELATIONS.forEach(r => { if (r.kind === "derived_from") parent[r.from] = r.to; });
  const nameOf = (() => {
    const m = {};
    [].concat(db.PAINTERS, db.WORKS, db.OPERATORS, db.ATOMS, db.SIGNATURES)
      .forEach(e => { m[e.id] = e.zh || e.id; });
    return m;
  })();

  const cats = {};
  db.SIGNATURES.forEach(g => { (cats[g.cat] = cats[g.cat] || []).push(g); });
  Object.keys(cats).forEach(c => {
    md += `\n---\n\n## ${c}\n`;
    cats[c].forEach(g => {
      md += `\n### ${g.zh} · \`${g.id}\` · 编码 \`${codeOf(g.id)}\`\n\n> ${g.desc}\n\n`;
      if (parent[g.id]) md += `派生自：\`${parent[g.id]}\` ${nameOf[parent[g.id]] || ""}\n\n`;
      try {
        const r = F.compose(JSON.parse(JSON.stringify(g.spec)));
        md += `**段落式（推荐先试）**\n\n\`\`\`\n${r.tags}\n\`\`\`\n\n`;
        md += `**负面词**\n\n\`\`\`\n${r.neg}\n\`\`\`\n\n`;
        md += `**自然语言正文**\n\n\`\`\`\n${r.gpt}\n\`\`\`\n\n`;
        if (r.warnings && r.warnings.length) {
          md += `> ⚠ ${r.warnings.map(w => w.msg).join("；")}\n\n`;
        }
        if (r.experimental) {
          md += `> ⚗ 本配方含实验性混合组合，效果未在任何模型上验证。\n\n`;
        }
      } catch (e) {
        md += `（组合失败：${e.message}）\n\n`;
      }
      md += `<details><summary>原始配方</summary>\n\n\`\`\`json\n${JSON.stringify(g.spec, null, 2)}\n\`\`\`\n\n</details>\n`;
      md += `\n**注意**：${g.note}\n`;
    });
  });
  outDoc("08-签名卡.md", md);
}

/* ============================================================
 * 10. 任务模板与原子模块
 * ============================================================ */
{
  /* ---- 任务模板 ---- */
  let md = `# 任务模板与原子模块\n\n这一篇是第三层与第四层：使用者带着诉求来，引擎把诉求拆成可填的槽位。\n\n`;
  md += `## 一、任务模板（${db.TASKS.length} 个）\n\n`;
  md += `以前签名卡按「题材 + 画家」分类，但使用者真正的入口是「我要做一张海报」或\n`;
  md += `「我要把这段改成油画」，不是「我要一张风景」。按任务组织，才对得上实际工作流。\n\n`;
  md += `每个任务给四样东西：\n\n`;
  md += `- \`ask\` 使用者通常怎么开口（原始诉求）\n- \`slots\` 这类任务必须填满的槽位，缺一个就出不了好图\n`;
  md += `- \`default\` 建议的起始配方\n- \`check\` 出图后必须自己看一眼的地方（验收清单）\n\n`;

  const byCat = {};
  db.TASKS.forEach(t => { (byCat[t.cat] = byCat[t.cat] || []).push(t); });
  Object.keys(byCat).sort((a, b) => a - b).forEach(c => {
    const meta = db.TASK_CATS.find(x => x.n === Number(c));
    md += `\n### ${meta ? meta.zh : "类别 " + c}（${byCat[c].length} 个）\n\n`;
    if (meta) md += `${meta.desc}\n\n`;
    byCat[c].forEach(t => {
      md += `\n#### ${t.zh} · \`${t.id}\` · 编码 \`${codeOf(t.id)}\` · ${badge(t)}\n\n`;
      md += `> 用户会这么说：**${t.ask}**\n\n`;
      md += `**要达到什么**：${t.goal}\n\n`;
      md += `**必填槽位**：${list(t.slots)}\n\n`;
      md += `**建议起始配方**\n\n\`\`\`json\n${JSON.stringify(t.default, null, 2)}\n\`\`\`\n\n`;
      md += `**出图后必须自己看一眼**\n\n`;
      t.check.forEach(x => { md += `- [ ] ${x}\n`; });
      md += `\n**为什么容易做砸**：${t.why}\n\n`;
      md += `**怎么做**：${t.how}\n\n`;
      if (t.sigs && t.sigs.length) md += `**可用的现成卡片**：${t.sigs.map(x => "`" + x + "`").join(" ")}\n`;
    });
  });

  /* ---- 原子模块 ---- */
  md += `\n---\n\n## 二、原子视觉模块（${db.ATOMS.length} 条 / 12 类）\n\n`;
  md += `比光学词条更细的一层：每个模块是**一个可独立取用的视觉单元**，带角色、带投放面。\n\n`;
  md += `### 角色不是可选项\n\n`;
  md += `不是所有模块都该同等说话。四种角色的区别在于**权重能不能压过别人**：\n\n`;
  md += `| 角色 | 中文 | 默认权重 | 引擎行为 |\n| --- | --- | --- | --- |\n`;
  CORE.ROLES.forEach(r => {
    const act = r.k === "guard" ? "强制进负面词，权重对它无效"
      : r.k === "region" ? "归集待遮罩落实，不直接进任何一面"
        : "按 slot 投进对应的面";
    md += `| \`${r.k}\` | ${r.zh} | ${r.w} | ${act} |\n`;
  });
  md += `\n**约束类（\`guard\`）永远压不掉。** 它不是「权重高一点的建议」，是硬边界。\n\n`;
  md += `**局部类（\`region\`）不给遮罩就等于没生效。** 引擎只把它归集到返回值的 \`regionAtoms\`\`，\n`;
  md += `并在界面上提示需要用遮罩落实。这类模块在 \`modules-d.js\` 里集中定义，并且成对出现——\n`;
  md += `一条给主体区、一条给背景区，各自的 \`region.pairWith\` 指向对方。\n\n`;

  const roleCount = {};
  db.ATOMS.forEach(a => { roleCount[a.role] = (roleCount[a.role] || 0) + 1; });
  md += `角色分布：` + CORE.ROLES.map(r => `${r.zh} ${roleCount[r.k] || 0}`).join(" · ") + "\n\n";

  const slotZh = {};
  FACETS.forEach(f => { slotZh[f.k] = f.zh; });
  const byMC = {};
  db.ATOMS.forEach(a => { (byMC[a.cat] = byMC[a.cat] || []).push(a); });
  Object.keys(byMC).sort((a, b) => a - b).forEach(c => {
    const meta = db.MODULE_CATS.find(x => x.n === Number(c));
    md += `\n---\n\n### ${meta ? c + " · " + meta.zh : "类别 " + c}（${byMC[c].length} 条）\n\n`;
    if (meta) md += `${meta.desc} · 默认投放面 \`${meta.slot}\`（${slotZh[meta.slot] || meta.slot}）\n\n`;
    md += `| 编号 | 编码 | 词条 | 角色 | 状态 | 释义 | 同义替换 |\n| --- | --- | --- | --- | --- | --- | --- |\n`;
    byMC[c].forEach(a => {
      md += `| \`${a.id}\` | \`${codeOf(a.id)}\` | \`${a.t}\` | ${ROLE_ZH[a.role]}${a.role === "guard" ? " ⚠" : ""} | ${badge(a)} | ${a.zh}：${a.c} | ${list(a.alt)} |\n`;
    });
    md += "\n";
    byMC[c].forEach(a => {
      md += `- **\`${a.id}\` \`${a.t}\`** —— ${a.read}`;
      if (a.region) {
        md += ` _（区域 \`${a.region.zone}\`，与 \`${a.region.pairWith}\` 配对）_`;
      }
      md += `\n`;
    });
  });
  outDoc("09-任务与模块.md", md);
}

/* ============================================================
 * 11. 来源与许可
 * ============================================================ */
{
  let md = `# 来源与许可\n\n共 ${db.PROVENANCE.length} 条。**这一篇回答一个具体问题：这张图能不能商用？**\n\n`;
  md += `## 为什么必须单列一张表\n\n`;
  md += `因为「库里的东西」不是一个法律主体，至少是四条独立的许可线：\n\n`;
  md += `1. **本库的代码** —— 本库的\n2. **本库的原创提示词** —— 本库的\n`;
  md += `3. **名画图像** —— 各馆的，各馆不同\n4. **外部标准本体** —— 各自机构的\n\n`;
  md += `把它们混成一句「本库采用某许可」是最常见的错误，也是最容易吃官司的错误。\n`;
  md += `所以本库自己（PV-40）的许可只覆盖前两条，明确写着不能套用到作品图上。\n\n`;
  md += `## 信息分四类\n\n`;
  md += `每条记录里的陈述按四类分栏，因为它们的可信度完全不同：\n\n`;
  md += `| 字段 | 类别 | 含义 | 可信度 |\n| --- | --- | --- | --- |\n`;
  CORE.INFO_KINDS.forEach(k => {
    md += `| \`${k.field}\` | ${KIND_ZH[k.k]} | ${k.desc} | ${k.k === "test" ? "换模型就不成立" : k.k === "read" ? "是判断，不是事实" : "可外部核验"} |\n`;
  });
  md += `\n把「模型实测有效」当成「艺术史事实」引用出去，是这套分类要防的事故。\n\n`;

  const CAT_ZH = {
    standard: "外部标准与本体", license: "许可类型释义",
    museum: "开放馆藏机构", self: "本库自身"
  };
  const byCat = {};
  db.PROVENANCE.forEach(p => { (byCat[p.cat] = byCat[p.cat] || []).push(p); });

  Object.keys(byCat).forEach(c => {
    md += `\n---\n\n## ${CAT_ZH[c] || c}（${byCat[c].length} 条）\n\n`;

    if (c === "museum") {
      md += `**这一组是商用判断的主要依据。** 图像权利与可商用性以本表为准，不要凭印象。\n\n`;
      md += `| 编号 | 机构 | 许可 | 可商用 | 需 key | 规模 / 备注 |\n| --- | --- | --- | --- | --- | --- |\n`;
      byCat[c].forEach(p => {
        md += `| \`${p.id}\` | ${p.zh} | ${p.license} | ${p.commercial ? "✅ 可" : "❌ 不可"} | ${p.key ? "需要" : "不需要"} | ${p.coverage || p.bulk || "—"} |\n`;
      });
      md += `\n`;
      byCat[c].forEach(p => {
        md += `\n#### ${p.zh} · \`${p.id}\` · ${badge(p)}\n\n`;
        md += `${p.org || ""}${p.en ? " · " + p.en : ""}\n\n`;
        md += `| 项 | 值 |\n| --- | --- |\n`;
        md += `| 许可 | ${p.license || "—"} |\n`;
        md += `| 可商用 | ${p.commercial ? "可以" : "**不可以**"} |\n`;
        md += `| 需署名 | ${p.attribution ? "需要" : "不需要"} |\n`;
        md += `| 需 key | ${p.key ? "需要" : "不需要"} |\n`;
        if (p.uri) md += `| 入口 | ${p.uri} |\n`;
        if (p.endpoint) md += `| 接口 | ${p.endpoint} |\n`;
        if (p.query) md += `| 查询方式 | ${p.query} |\n`;
        if (p.coverage) md += `| 规模 | ${p.coverage} |\n`;
        if (p.bulk) md += `| 批量数据 | ${p.bulk} |\n`;
        md += `\n`;
        if (p.fact) md += `**事实**：${p.fact}\n\n`;
        if (p.seen) md += `**观察**：${p.seen}\n\n`;
        if (p.read) md += `**用法**：${p.read}\n\n`;
        if (p.note) md += `**注意**：${p.note}\n\n`;
        if (p.warning) md += `> ⚠ **禁用提醒**：本条列入本表仅为提醒不要误用。\n\n`;
        if (p.src) md += `*出处：${p.src}${p.retrieved ? " · 检索于 " + p.retrieved : ""}*\n`;
      });
    } else if (c === "license") {
      md += `四种许可类型的确切含义。看不懂这四条，商用判断就无从谈起。\n\n`;
      md += `| 编号 | 许可 | 可商用 | 需署名 | 相同方式共享 | 可修改 |\n| --- | --- | --- | --- | --- | --- |\n`;
      byCat[c].forEach(p => {
        md += `| \`${p.id}\` | ${p.code} ${p.zh.replace(/^.*? /, "")} | ${p.commercial ? "✅" : "❌"} | ${p.attribution ? "✅" : "—"} | ${p.sharealike ? "✅" : "—"} | ${p.modify ? "✅" : "—"} |\n`;
      });
      byCat[c].forEach(p => {
        md += `\n#### ${p.zh} · \`${p.id}\`\n\n`;
        if (p.fact) md += `- **定义**：${p.fact}\n`;
        if (p.read) md += `- **用法**：${p.read}\n`;
        if (p.note) md += `- **注意**：${p.note}\n`;
        md += `\n*出处：${p.src}*\n`;
      });
    } else {
      byCat[c].forEach(p => {
        md += `\n### ${p.zh} · \`${p.id}\` · 编码 \`${codeOf(p.id)}\` · ${badge(p)}\n\n`;
        md += `${p.org || ""}${p.en ? " · " + p.en : ""}\n\n`;
        const kv = [];
        if (p.license) kv.push(`许可 ${p.license}`);
        if (p.commercial != null) kv.push(p.commercial ? "可商用" : "**不可商用**");
        if (p.scale) kv.push(p.scale);
        if (p.uri) kv.push(p.uri);
        if (p.query) kv.push(p.query);
        if (kv.length) md += `${kv.join(" · ")}\n\n`;
        if (p.fact) md += `**事实**：${p.fact}\n\n`;
        if (p.seen) md += `**观察**：${p.seen}\n\n`;
        if (p.read) md += `**用法**：${p.read}\n\n`;
        if (p.note) md += `**注意**：${p.note}\n\n`;
        if (p.src) md += `*出处：${p.src}${p.retrieved ? " · 检索于 " + p.retrieved : ""}*\n`;
      });
    }
  });

  /* 可商用清单单独列一次，因为这是最常被直接问的 */
  const ok = db.PROVENANCE.filter(p => p.commercial === true && p.cat === "museum");
  md += `\n---\n\n## 可商用来源速查（${ok.length} 家）\n\n`;
  md += `需要同题材替代图时，直接从这里找，不要退而求其次用非商用机构的图。\n\n`;
  ok.forEach(p => { md += `- ${p.zh}（\`${p.id}\`，${p.license}）\n`; });
  const no = db.PROVENANCE.filter(p => p.commercial === false && p.cat === "museum");
  if (no.length) {
    md += `\n**禁止商用**：${no.map(p => p.zh + "（`" + p.id + "`，" + p.license + "）").join("、")}\n`;
  }
  outDoc("10-来源与许可.md", md);
}

/* ============================================================
 * 12. 模型适配与验证
 * ============================================================ */
{
  let md = `# 模型适配与验证\n\n共 ${db.TESTS.length} 条。这一层存在的理由只有一个：**同一段提示词在不同模型上行为差别极大。**\n\n`;
  md += `括号权重在 SD 系有效、在 Flux 上基本被忽略；负面提示在 MJ 上要换另一种语法；\n`;
  md += `CFG 与步数的可用区间在几代模型之间整体下移。把这些记成「模型实测」，\n`;
  md += `才不会拿 SD 的经验去调 Flux，然后怀疑是自己词写得不对。\n\n`;
  md += `**这一层的所有结论都只在对应模型上成立。** 换模型请先查 \`tests\` 表，不要直接沿用。\n\n`;
  md += `## 平台方言速查\n\n`;
  md += `| 模型 | 权重语法 | 引导值 | 步数 | 负面提示 |\n| --- | --- | --- | --- | --- |\n`;
  db.TESTS.forEach(t => {
    md += `| ${t.model} | \`${t.weightSyntax || "—"}\` | ${t.cfgDefault ? "默认 " + t.cfgDefault + "，可用 " + rng(t.cfg) : "—"} | ${rng(t.steps)} | ${t.negPrompt || "—"} |\n`;
  });
  md += `\n`;
  md += `> **Flux 特别注意**：\`Flux.1 dev\` 忽略括号语法，引擎为此专门加了 \`flux\` 方言——\n`;
  md += `不输出括号，改为把权重词就地重复一次（\`t + " " + t\`）。\n`;
  md += `引导值可用区间 3.5 左右（2.5–4.5），与 SD 的 5–8 几乎不重叠。\n`;
  md += `\`Flux.1 schnell\` 引导值固定为 1、1–4 步，不要照搬 dev 的参数。\n\n`;

  const byFam = {};
  db.TESTS.forEach(t => { (byFam[t.family] = byFam[t.family] || []).push(t); });
  Object.keys(byFam).forEach(f => {
    md += `\n---\n\n## 家族：${f}（${byFam[f].length} 条）\n\n`;
    byFam[f].forEach(t => {
      md += `\n### ${t.model} · \`${t.id}\` · 编码 \`${codeOf(t.id)}\` · ${badge(t)}\n\n`;
      const kv = [];
      if (t.gen) kv.push(`| 年代 | ${t.gen} |`);
      kv.push(`| 权重语法 | \`${t.weightSyntax || "—"}\` |`);
      kv.push(`| 权重可用区间 | ${t.weightRange ? rng(t.weightRange) : "—"} |`);
      kv.push(`| 引导值 | ${t.cfgDefault ? t.cfgDefault + "（可用 " + rng(t.cfg) + "）" : "—"} |`);
      kv.push(`| 步数 | ${rng(t.steps)} |`);
      if (t.sampler) kv.push(`| 采样器 | ${t.sampler} |`);
      if (t.promptStyle) kv.push(`| 提示词形态 | ${t.promptStyle} |`);
      if (t.idealLen) kv.push(`| 建议长度 | ${rng(t.idealLen)} 词 |`);
      kv.push(`| 负面提示 | ${t.negPrompt || "—"} |`);
      kv.push(`| 自然语言正文 | ${t.naturalLang || "—"} |`);
      md += `| 项 | 值 |\n| --- | --- |\n` + kv.join("\n") + "\n\n";
      if (t.weightEffect) md += `- **权重实际效果**：${t.weightEffect}\n`;
      if (t.bracketStack) md += `- **括号叠加**：${t.bracketStack}\n`;
      if (t.fact) md += `\n**事实**：${t.fact}\n`;
      if (t.seen) md += `\n**观察**：${t.seen}\n`;
      if (t.test) md += `\n**实测**：${t.test}\n`;
      if (t.note) md += `\n**注意**：${t.note}\n`;
      if (t.failTypes && t.failTypes.length) {
        md += `\n**已知失败类型**\n\n`;
        t.failTypes.forEach(f => { md += `- ${f}\n`; });
      }
      md += `\n`;
    });
  });

  /* 未能实测的模型也要列出来，否则会有人以为没列出的不存在 */
  const untested = db.TESTS.filter(t => (t.status || "") !== "tested");
  if (untested.length) {
    md += `\n---\n\n## 尚未在模型上实测\n\n`;
    md += `以下条目只是文字整理，**未跑过模型**。用之前请自己先验一遍。\n\n`;
    untested.forEach(t => md += `- ${t.model}（\`${t.id}\`，${badge(t)}）\n`);
  }
  outDoc("11-模型适配.md", md);
}

/* ============================================================
 * 13. 关系图
 * ============================================================ */
{
  const kindName = {
    held_by: "作品 → 收藏机构", uses: "作品 → 承载材料",
    student_of: "画家 → 画家（师承）", influenced: "画家 → 画家（影响）",
    derived_from: "签名卡 → 母版", serves: "卡片 → 任务",
    realizes: "签名卡 → 原子模块", aligned_with: "实体 → 外部标准"
  };
  const nameOf = {};
  [].concat(db.PAINTERS, db.MOVEMENTS, db.MEDIUMS, db.SUBJECTS, db.WORKS,
    db.OPERATORS, db.ATOMS, db.SIGNATURES, db.TASKS)
    .forEach(e => { nameOf[e.id] = e.zh || e.id; });

  const byKind = {};
  db.RELATIONS.forEach(r => { (byKind[r.kind] = byKind[r.kind] || []).push(r); });

  let md = `# 关系图\n\n共 ${db.RELATIONS.length} 条边。\n\n`;
  md += `## 为什么需要这张表\n\n`;
  md += `画家、名画、签名卡各自的字段只能记「自己是什么」，记不住「和谁有关系」。\n`;
  md += `而提示词组合真正吃的就是关系：\n\n`;
  md += `- **创作者 → 作品 → 材料 → 机构** 回答「这句话从哪来、能不能商用」\n`;
  md += `- **流派 → 画家 → 技法** 回答「为什么这两个人能融」\n`;
  md += `- **签名卡 → 派生自 → 母版** 回答「这张卡是为谁做的、改坏了找谁」\n\n`;
  md += `边的写法刻意模仿 CIDOC CRM：谁、做了什么、对象是谁，分成独立字段而不是一句话。\n`;
  md += `因为一句话没法反向索引。\n\n`;
  md += `## 边的类型\n\n`;
  md += `| 类型 | 方向 | 条数 | 强度 |\n| --- | --- | --- | --- |\n`;
  const strength = {
    student_of: "强，可照搬", influenced: "弱，只能借鉴",
    held_by: "事实", uses: "事实", derived_from: "事实",
    serves: "推荐关系", realizes: "构成关系", aligned_with: "映射声明"
  };
  Object.keys(byKind).forEach(k => {
    md += `| \`${k}\` ${kindName[k] || k} | ${byKind[k].length} | ${strength[k] || "—"} |\n`;
  });
  md += `\n**师承与影响必须分开。** 师承可以照搬，影响只能借鉴——\n`;
  md += `两者混在一张表里，就会在融合提示词时把「借鉴」当成「传承」来用。\n\n`;

  /* 306 条边全列编码会让这张表臃肿到没法读，所以只在表头说明编码规则，
     逐条编码查 dist/relations.json（已带 code 字段）。 */
  md += `**关于边的编码**：每条边都有 \`R-001\` ~ \`R-306\` 的全局连续编码，\n`;
  md += `逐条对照见 \`dist/relations.json\`。这里不逐条列出 —— 306 行编码会让这张表没法读，\n`;
  md += `而这张表要解决的是「有哪些关系、强度如何」，不是「每条叫什么」。\n\n`;

  Object.keys(byKind).forEach(k => {
    md += `\n---\n\n## ${kindName[k] || k}（${byKind[k].length} 条）\n\n`;
    if (k === "student_of" || k === "influenced") {
      md += `| 从 | 到 | 说明 |\n| --- | --- | --- |\n`;
      byKind[k].forEach(r => {
        md += `| ${nameOf[r.from] || r.from} \`${r.from}\` | ${nameOf[r.to] || r.to} \`${r.to}\` | ${r.note || "—"} |\n`;
      });
    } else {
      md += `| 从 | 到 | 说明 |\n| --- | --- | --- |\n`;
      byKind[k].forEach(r => {
        md += `| ${nameOf[r.from] || r.from} | ${nameOf[r.to] || r.to} | ${r.note || "—"} |\n`;
      });
    }
  });
  outDoc("12-关系图.md", md);
}

/* ============================================================
 * 13. 编码手册
 * ============================================================ */
{
  /* REGISTRY 在文件顶部已加载，直接用，不要在这里再 require 一次：
     require 有缓存，同一个文件拿到的其实是同一实例，
     但重复写一遍会让人以为这里用的是另一份数据。 */
  let md = `# 编码手册\n\n`;
  md += `全库 ${REGISTRY.total} 条可引用条目、${REGISTRY.SEGMENTS.length} 个段码、${REGISTRY.relations.length} 条带编码的关系边。\n\n`;
  md += `这一层解决三件事：**要看有哪些类型**（段码总表）、**要单独取某一块**（编码或中文名）、**要组合**（编码串）。\n\n`;
  md += `打开 \`index.html\` 顶栏的「编码工作台」可以直接查、可以组，产出规范组合串与 spec。\n\n`;

  md += `## 段码总表\n\n`;
  md += `**全库只有一种编码形态**：\`段码-三位\`，段码固定两字母。\n`;
  md += `段码只表示归属（这是哪一层），不夹带国别/类别/分组 —— 理由见下一节。\n\n`;
  md += `| 段码 | 名称 | 条数 | 可直接组合 | 说明 |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  REGISTRY.SEGMENTS.forEach(s => {
    const comp = s.code === "RL" ? "—（事实说明）" : REGISTRY.composableCount(s.code);
    md += `| \`${s.code}\` | ${s.zh} | ${s.count} | ${comp} | ${s.desc} |\n`;
  });

  md += `\n**为什么区分「可直接组合」**：不是所有条目都能进提示词。\n`;
  md += `签名卡是一整套已配好的配方（该套用而非往里加词），任务模板是流程起点，\n`;
  md += `冲突规则由引擎自动裁决，来源许可与模型实测是查证用的。\n`;
  md += `把这些塞进提示词不会报错，只会让结果莫名其妙 —— 所以解析器在 `;
  md += `\`toSpec()\` 阶段就挡掉它们，并在界面上标出「不进提示词」。\n\n`;

  md += `## 为什么砍掉了分类段\n\n`;
  md += `上一版有四种长度并存：\n\n`;
  md += `| 旧形态 | 例子 | 中段的含义 |\n| --- | --- | --- |\n`;
  md += `| 三段 | \`P-IT-007\` | 画家：**国别**字母 |\n`;
  md += `| 两段 | \`AM-101\` | 原子模块：**类别**数字 |\n`;
  md += `| 三段 | \`AM-A-001\` | 原子模块：**类别**字母 |\n`;
  md += `| 三段 | \`O-01-001\` | 光学词条：**分组**号 |\n\n`;
  md += `问题不在于「多了一种」，而在于**同一个位置放了三种不同的语义**。\n`;
  md += `语法相同、含义不同，于是 \`AM-101\` 与 \`O-001\` 肉眼几乎无法区分，\n`;
  md += `而 \`AM-101\` 与 \`AM-A-001\` 又同段不同形。组合串一旦长起来，\n`;
  md += `人眼无法校验，机器也无法用一条正则解析全库。\n\n`;
  md += `现在国别/类别/分组降级为**字段**，靠界面筛选与检索取回。\n`;
  md += `理由：塞进编码会让编码长度不可控，而组合时要的是「能打出来」，\n`;
  md += `不是「能看出分组」。光学分组单列 \`OG\` 段 —— 它与词条挤在同一段时，\n`;
  md += `「OP-001 是组还是词」永远说不清。\n\n`;

  md += `### 两条硬约束\n\n`;
  md += `1. **段码与该段旧 ID 的形态必须不相交**。原子模块段用 \`AT\` 而不是 \`AM\`\n`;
  md += `   就是这个原因：旧 ID 恰好是 \`AM-101\` 这种形态，若新码也叫 \`AM-001\`，\n`;
  md += `   字符串 \`AM-101\` 会同时是「某人的旧 ID」和「别人的新码」，解析给谁都不对。\n`;
  md += `   \`check_codes\` 有一条断言专门守这个。\n`;
  md += `2. **段码互不为前缀**。若 \`P\` 是 \`PA\` 的前缀，\`P-001\` 会被误判成 PA 段。\n\n`;

  md += `### 序号\n\n`;
  md += `数字位恒为三位。画家 205 位、原子模块 126 条、关系边 306 条，\n`;
  md += `两位撑到 99 就撞号；三位可到 999，中途新增只往后追加，不会重排旧号。\n\n`;
  md += `序号**不保证连续**：\`PV\` 段就是 \`PV-001~008\`、\`PV-020~023\`、\`PV-030~040\`。\n`;
  md += `这是跟着旧 ID 走的必然结果 —— 为了连续而重排会让来源许可的引用与历史记录脱节。\n\n`;
  md += `**code 一旦发布不可改**。改它等于让用户手里的组合串失效。\n`;
  md += `改中文名不影响 code 解析 —— 解析走映射表，不读数据源的 \`zh\`。\n\n`;

  md += `## 八路解析\n\n`;
  md += `同一个条目有八个入口，都能命中：\n\n`;
  md += `| 输入 | 例子 | 说明 |\n| --- | --- | --- |\n`;
  md += `| 规范编码 | \`PA-125\` | 唯一、可排序、机器友好 |\n`;
  md += `| 旧 ID | \`P-IT07\` | 历史主键，向后兼容 |\n`;
  md += `| 上一版编码 | \`P-IT-007\` | 已对外发布过，继续能查 |\n`;
  md += `| 省略零位 | \`PA-7\` | 只在已存在的编码上生效 |\n`;
  md += `| 中文名 | \`达·芬奇\` | |\n`;
  md += `| 英文名 | \`Caravaggio\` | |\n`;
  md += `| 光学英文词 | \`chiaroscuro\` | 横切词条专有入口 |\n`;
  md += `| 常用短码 | \`CC0\` \`SD1.5\` \`MJ v7\` | |\n\n`;
  md += `**缺零位只对已存在的编码生效**：\`PA-7\` 能查到第 7 位画家，\n`;
  md += `而 \`PA-999\` 会明确报不存在 —— 不会凭空造一个号。\n`;
  md += `（若补零写成「补完再查表」，某段超过 999 条时序号会静默回绕到别人的号上。）\n\n`;
  md += `**查不出来时必须说「找不到」并给最接近的候选，绝不返回一个猜测。**\n`;
  md += `宁可让你重输，也不能给你一个假编码 —— 假编码会一路错到出图那一步才暴露。\n\n`;
  md += `**同一 code 只保留第一次出现**。写 \`P-IT07 + PA-125\` 不会重复计入，\n`;
  md += `而是在 \`dupList\` 里回传「已合并」—— 不去重的话配方里同一个零件会出现两遍，\n`;
  md += `权重被算成 2.0，效果与用户意图完全不同，而界面上看不出任何异常。\n\n`;

  md += `## 组合串\n\n`;
  md += `多项用 \`+\` 或逗号分隔，编码与中文名可混写，新旧写法也能混着写：\n\n`;
  md += `\`\`\`\nPA-125 + 明暗对照 + 单侧窗光 + OP-004\n达·芬奇 + 黄金时刻\nP-IT07 + PA-125 + 明暗对照\n\`\`\`\n\n`;
  md += `最后一行前两项指向同一位画家，会合并成一项 —— 混用旧写法不会把配方写重。\n\n`;
  md += `空格也能当分隔符，但有一处例外需要知道：本库有一批名字自带空格\n`;
  md += `（\`SD 1.5\`、\`CC0 1.0 公共领域奉献\`），解析器会做贪心回溯把它们当整体，\n`;
  md += `所以 \`PA-125 明暗对照 单侧窗光\` 能正确拆成三项。\n\n`;
  md += `串里错一项时**整体报失败**并精确指出是哪一项，同时把正确项单独返回，\n`;
  md += `你可以改掉错的那项继续用 —— 不会因为一个笔误丢掉整串。\n\n`;

  const sh = shadowedOptics();
  md += `## 已知的跨层同名\n\n`;
  md += `有 ${sh.length} 处中文名同时属于**原子模块**与**光学词条**（内容一致，原子模块多带角色与分区）。\n\n`;
  md += `直接写中文名时默认命中原子模块，界面上会标出「另有同名的光学词条」，\n`;
  md += `要指定光学词条请用 \`OP\` 段编码。\n\n`;
  if (sh.length) {
    md += `| 光学编码 | 光学中文名 | 同名的原子模块 |\n| --- | --- | --- |\n`;
    sh.forEach(x => {
      const a = db.ATOMS.filter(a => a.zh === x.atomZh)[0];
      /* 两侧都给规范码：这张表的意义是「同名的两条各在哪」，
         给旧码就等于让读者抄一个会被下一版换掉的东西进组合串。 */
      md += `| \`${codeOf(x.optic.code)}\` | ${x.atomZh} | \`${codeOf(a.id)}\` ${ROLE_ZH[a.role] || a.role} |\n`;
    });
    md += `\n这不是数据错误，是同一内容在两层的两次录入：\n`;
    md += `光学组是横切词表，原子模块是带角色的组装单元。留着两份是因为\n`;
    md += `光学组便于「一次多选横切零件」，原子模块便于「指定主导/辅助/分区/约束」。\n`;
  }

  md += `\n## 关系边的编码\n\n`;
  md += `${REGISTRY.relations.length} 条关系边也各有编码（\`RL-001\` ~ \`RL-${String(REGISTRY.relations.length).padStart(3, "0")}\`），\n`;
  md += `全局连续编号而不是按类型各起一份 —— 按类型编号会让 8 种类型互相撞码，\n`;
  md += `${REGISTRY.relations.length} 条边实际只剩 ${Math.max(...Object.values(REGISTRY.relations.reduce((m, r) => (m[r.kind] = (m[r.kind] || 0) + 1, m), {})))} 个不同编码，\`RL-001\` 指向哪条边就说不清了。\n\n`;
  md += `边的类型信息不靠编码承载，靠 \`kind\` 字段筛选。\n`;
  md += `关系边不进提示词 —— 它们是「这条边存在」的事实说明，不是可拼装的零件。\n\n`;

  /* ---------- 每条编码对应的提示词 ---------- */
  /* 这一节回答的是「PA-125 到底是几段词」，不是「PA-125 是谁」。
     后者是 codes.json 的职责；光有编码没有词，组合这件事仍然做不成。 */
  const P = require("../assets/prompts.js").PROMPTS;
  const pAll = P.all();
  const pFull = pAll.filter(x => x.grade === "full").length;
  const pPart = pAll.filter(x => x.grade === "part").length;
  const pNone = pAll.filter(x => x.grade === "none").length;

  md += `## 每条编码对应的提示词\n\n`;
  md += `**\`codes.json\` 回答「这条是谁」，\`prompts.json\` 回答「这条是什么词」。**\n`;
  md += `两份必须一起给：只有编码没有词，组合这件事仍然做不成。\n\n`;
  md += `提示词不是手写的，全部由 \`FORGE.compose()\` 现算 —— 一旦在这里手写词面，\n`;
  md += `它就会和引擎的冲突裁决各说各话，且引擎一改就全部漂移。\n\n`;

  md += `### 三档完整性\n\n`;
  md += `| 档 | 条数 | 含义 |\n| --- | --- | --- |\n`;
  md += `| \`full\` 可直接出图 | ${pFull} | 题材 / 画家 / 流派 / 名画 / 媒介 / 签名卡 / 任务模板。自带主体或主体足够明确 |\n`;
  md += `| \`part\` 零件，需搭配基底 | ${pPart} | 原子模块 / 光学词条 / 算子。它们改的是别人的画面，单独投放只剩一句约束词 |\n`;
  md += `| \`none\` 不进提示词 | ${pNone} | 来源许可 / 模型实测 / 冲突规则 / 光学分组。另有 ${REGISTRY.relations.length} 条关系边同样不进 |\n\n`;

  md += `**为什么零件要单列一档**：\`AT-001\` 单独跑出来的 \`tags\` 就是\n`;
  md += `\`chiaroscuro, masterpiece, best quality, ...\` —— 一条约束词加一堆画质词，\n`;
  md += `拿去出图几乎等于没约束。所以 \`part\` 额外给一份 \`withBase\`：\n`;
  md += `挂在写死的演示基底「${P.DEMO_BASE_ZH}」上跑通，让人看到它正常怎么用。\n`;
  md += `基底是公开写死的演示件，不是推荐配方 —— 偷偷配基底会让用户\n`;
  md += `以为原子模块本身就是完整配方。\n\n`;

  md += `**为什么 \`none\` 要写清原因**：给一个空文本框等于暗示「这里本来有词但被清了」。\n`;
  md += `所以这一档只给一句话理由，比如 PV 是授权登记、MT 是模型实测、CF 是引擎裁决规则。\n\n`;

  md += `### 界面与命令行\n\n`;
  md += `打开 \`index.html\`：\n\n`;
  md += `- 编码工作台的每条解析结果、段码总表的每一行，都带一个「看提示词」按钮\n`;
  md += `- 主界面配方盘里每个零件也带一个「词」按钮，点开直接跳到工作台并展开那一条\n`;
  md += `- 面板内可切 SD / MJ / Flux / 自然语言四种权重写法，切换只改语法不改词数\n\n`;
  md += `同一份词面在四个平台上写法不同（\`(词:1.00)\` / \`词::1.00\` / \`词 词\` / 裸词），\n`;
  md += `不标出来用户复制出去在别的平台上直接跑不通。\n\n`;
  md += `命令行查单条：\n\n`;
  md += `\`\`\`bash\n`;
  md += `node tools/show_prompt.js PA-125              # 规范编码\n`;
  md += `node tools/show_prompt.js 达·芬奇              # 中文名\n`;
  md += `node tools/show_prompt.js AT-001 --platform mj # 换平台写法\n`;
  md += `node tools/show_prompt.js PA-125 --json       # 机器可读\n`;
  md += `\`\`\`\n\n`;

  md += `## 给下游的接口\n\n`;
  md += `\`\`\`bash\nnode tools/check_codes.js     # 42 项编码体检\nnode tools/show_prompt.js      # 查单条提示词\n\`\`\`\n\n`;
  md += `导出产物：\n\n`;
  md += `| 文件 | 内容 |\n| --- | --- |\n`;
  md += `| \`dist/codes.json\` | ${REGISTRY.total} 条编码对照，含层级、是否可组合、别名 |\n`;
  md += `| \`dist/code-segments.json\` | ${REGISTRY.SEGMENTS.length} 个段码的规模与可组合数 |\n`;
  md += `| \`dist/relations.json\` | ${REGISTRY.relations.length} 条关系边，已带 \`code\` |\n`;
  md += `| \`dist/prompts.json\` | ${REGISTRY.total} 条编码对应的 \`tags\` / \`neg\` / \`gpt\`，附 \`explain\`（效果说明）与 \`zhGpt\`（中文对照），零件另附 \`withBase\` |\n`;
  md += `| \`dist/model-capabilities.json\` | 12 个模型的词面策略 / 参数甜区 / 垫图兜底建议 |\n\n`;
  md += `各单表导出（\`painters.json\` 等）的每条记录也都带 \`code\` 字段，\n`;
  md += `由 \`assets/codes.js\` 的纯函数在导出时挂上 —— 派生规则只有一个真源，不会与数据漂移。\n`;
  md += `\n\`prompts.json\` 单独成文件而不塞进 \`all.json\`：它超过 1 MB，\n`;
  md += `混进去会把 \`all.json\` 撑成人眼读不了、脚本也不必要整体加载的大文件。\n`;

  outDoc("13-编码手册.md", md);
}

console.log("\nMarkdown 文档已生成");
