#!/usr/bin/env node
/* ============================================================
 * gallery_sync.js —— 画廊配图同步的**唯一真源**
 *
 * 为什么要单独抽出来：同步逻辑原先写在 build_standalone.js 里，
 * 于是「想只更新清单」得跑一遍 8MB 的单文件打包，「想知道有没有漏同步」
 * 根本没有入口 —— 用户放完图，唯一能同步的东西还挂在后台进程上，
 * 进程一没就只能干等，页面上什么变化都看不出来（已踩三次）。
 * 这个文件把同步独立出来：跑一次不到一秒，且把差异如实打出来。
 *
 * ── 命名规则（两种，都收）────────────────────────────
 *   ① 卡片编码：文件名 = 卡片 id
 *        G-01.png    -> 签名卡 001
 *        VAR-03.jpg  -> 第 3 张变奏卡
 *      扩展名 png/jpg/jpeg/webp、编码大小写都不敏感。
 *
 *   ② 页面序号：文件名 = 卡面左上角那个三位编号（旧版卡面显示的就是它）
 *        G-26.png    -> 序号 026 -> 真实卡片 VAR-01
 *      为什么要有这条：页面上签名卡与变奏卡共 40 张，卡面从前显示的是**序号**
 *      （001–040）。前 25 张序号碰巧与 id 一致（G-01..G-25），从第 26 张起
 *      分叉 —— 用户照着「026」命名成 G-26.png，清单里却只认 VAR-01，
 *      于是图放进去什么反应都没有，页面上也看不出为什么（踩过）。
 *      卡面已改为显示卡片 id，这里同时兜住老命名，不让已经出好的图白费。
 *
 *   ③ 库内规范编码：文件名 = code
 *        SG-001.png  -> 签名卡 G-01（卡面一度显示的就是这个规范编码）
 *
 *   三者指向同一张卡就都收；卡面现在显示的是 ① 的形态，也就是配图该用的名字。
 *
 *   下划线或点开头的文件（母版 / 临时产物）不参与同步。
 *
 * ── 用法 ────────────────────────────────────────────
 *   node tools/gallery_sync.js         同步 + 打印差异报告
 *   node tools/gallery_sync.js --check 只体检不同步（退出码 1 = 有异常）
 *   node tools/gallery_sync.js --rename 顺手把「序号命名」的文件改成卡片编码
 *
 * ── 为什么要有 --rename ──────────────────────────────
 *   两套叫法并存，本身就是上面那个坑的温床：目录里躺着 G-26.png，
 *   卡面写的却是 VAR-01 —— 人和脚本各记一套，下一次还是对不上。
 *   改完名之后「目录里的文件名」=「卡面编号」=「清单里的 key」，
 *   三者字面一致，用不着再靠映射表去猜。序号兜底逻辑保留着
 *   （万一还有旧文件），但正常路径不再需要它。
 *
 *   改名是动用户文件，所以不默认做：必须显式加 --rename。
 *   同名的目标文件已存在时跳过并报错，绝不覆盖已有配图。
 *
 * 退出码：0 全部对得上 / 1 有漏同步、断图、抢卡或野文件名。
 * 「构建成功但有图没进去」是这个库踩过最多次的坑，所以这里宁可报错。
 * ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "index.html");
const GALLERY_DIR = path.join(ROOT, "gallery");
const MANIFEST = path.join(ROOT, "assets", "gallery-imgs.js");
const HEARTBEAT = path.join(ROOT, ".gallery-watch.log");
const IMG_RE = /\.(png|jpe?g|webp)$/i;

/* 卡片全集与**页面同序**：签名卡（数据源顺序）+ 变奏卡（GAL_EXTRA_DEF 顺序）。
 * 顺序必须与 index.html 的 GAL_ALL 一致，否则「序号 -> 卡片」映射会整体错位 ——
 * 而错位不会报错，只会把图挂到隔壁卡上。 */
function cardTable() {
  const load = require(path.join(__dirname, "_load.js"))();
  const sigs = load.SIGNATURES.map(s => s.id);
  const txt = fs.readFileSync(SRC, "utf8");
  const vars = [...txt.matchAll(/\{ v: "(\d+)", base: "([^"]+)", sub: "[^"]*", zh: "([^"]*)"/g)]
    .map(m => ({ id: "VAR-" + m[1], base: m[2], zh: m[3] }));
  if (!vars.length && /GAL_EXTRA_DEF/.test(txt)) {
    /* 解析不到就是字段顺序被改了 —— 序号映射会整体错位，
       而错位不报错，只会把图挂到隔壁卡上，所以这里直接拦住。 */
    throw new Error("变奏卡解析失败：index.html 的 GAL_EXTRA_DEF 字段顺序变了"
      + "（需为 v / base / sub / zh），按序号的命名映射会整体错位");
  }
  const all = sigs.concat(vars.map(v => v.id));
  const zhById = new Map(vars.map(v => [v.id, v.zh]));
  const baseById = new Map(vars.map(v => [v.id, v.base]));
  return { sigs, vars, all, ids: new Set(all), zhById, baseById };
}

/* 扫目录：文件名 -> 编码 -> 相对路径。
   文件名不像卡片编码的如实收集，不猜属于哪张卡。 */
function scanDir() {
  const found = new Map();
  const weird = [];
  if (!fs.existsSync(GALLERY_DIR)) return { found, weird };
  for (const n of fs.readdirSync(GALLERY_DIR)) {
    if (n.startsWith("_") || n.startsWith(".")) continue;
    if (!IMG_RE.test(n)) continue;
    const code = n.replace(IMG_RE, "").toUpperCase();
    if (/^[A-Z][A-Z0-9-]*$/.test(code)) found.set(code, "gallery/" + n);
    else weird.push(n);
  }
  return { found, weird };
}

/* 文件名编码 -> 真实卡片 id。
   先按编码精确匹配（将来真加了签名卡 G-26，这里自动优先它），
   匹配不上再按页面序号兜（G-26 -> 第 26 张卡 = VAR-01）。 */
function resolveId(raw, table) {
  if (table.ids.has(raw)) return raw;
  /* 库内规范编码 SG-001（= 签名卡 G-01）也收：卡面一度显示的是它，
     用户照着命名完全合理，认不出来就成了「放进去没反应」。 */
  const sg = /^SG-(\d{1,3})$/.exec(raw);
  if (sg) {
    const n = parseInt(sg[1], 10);
    return (n >= 1 && n <= table.sigs.length) ? table.sigs[n - 1] : null;
  }
  const m = /^G-(\d{1,3})$/.exec(raw);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n >= 1 && n <= table.all.length) return table.all[n - 1];
  return null;
}

/* 扫一遍目录并解析成「卡片 -> 图」，同步与核对共用这一份结果。 */
function resolveGallery() {
  const table = cardTable();
  const { found, weird } = scanDir();
  const aliases = [];      /* 按序号命名而认领成功的 */
  const conflicts = [];    /* 两个文件抢同一张卡 */
  const orphans = [];      /* 编码对不上任何卡片 */
  const orphanFiles = [];  /* 同上，但记的是原文件名（报给用户看/注进页面） */
  const byId = new Map();
  for (const [raw, rel] of found) {
    const id = resolveId(raw, table);
    if (!id) {
      orphans.push(raw);
      orphanFiles.push(rel.replace(/^gallery\//, ""));
      continue;
    }
    if (id !== raw) aliases.push({ from: raw, to: id, rel });
    if (byId.has(id)) {
      conflicts.push(raw + ".png 与 " + byId.get(id).raw + ".png 都指向 " + id
        + "（前者生效，另一个被忽略）");
      continue;
    }
    byId.set(id, { code: id, raw, rel });
  }
  const entries = [...byId.values()].sort((a, b) => a.code.localeCompare(b.code));
  return { table, entries, aliases, conflicts, orphans, orphanFiles, weird, dirCount: found.size };
}

function readRegistered() {
  if (!fs.existsSync(MANIFEST)) return new Map();
  const txt = fs.readFileSync(MANIFEST, "utf8");
  const m = /^var GALLERY_IMGS = \{([\s\S]*?)\};/m.exec(txt);
  const out = new Map();
  if (m) {
    for (const e of m[1].matchAll(/"([A-Z][\w-]*)"\s*:\s*"([^"]+)"/g)) out.set(e[1], e[2]);
  }
  return out;
}

/* 同步一次，返回差异报告。
   清单是派生物，整体重建而不是局部替换 —— 早先用 replace 打补丁，
   历史遗留的第二份 `var GALLERY_IMGS` 一直没清掉，浏览器里后者覆盖前者，
   页面实际只认第二份、构建注入的却是第一份，构建还报成功。 */
function syncManifest(opts) {
  const write = !(opts && opts.checkOnly);
  const g = resolveGallery();
  const before = readRegistered();
  const entries = g.entries;

  const now = new Set(entries.map(e => e.code));
  const added = [...now].filter(c => !before.has(c)).sort();
  const removed = [...before.keys()].filter(c => !now.has(c)).sort();
  const missing = entries.filter(e => !fs.existsSync(path.join(ROOT, e.rel)));

  if (write) {
    const body = "var GALLERY_IMGS = {\n"
      + entries.map(e => "  " + JSON.stringify(e.code) + ": " + JSON.stringify(e.rel)).join(",\n")
      + (entries.length ? "\n" : "") + "};";
    /* 没被认领的图（名字不像卡片编码 / 编码超出范围）也注进清单：
       命令行里报过，但会看命令行的人本来就知道自己在放图；
       多数人是「往文件夹里一丢，回页面刷新」。所以把这件事故意带到页面上，
       让「我放的那张没进去」当场可见 —— 这正是当年最贵的一次静默失败。 */
    const unclaimed = g.weird.concat(g.orphanFiles).sort();
    const unclaimedBlock = "var GALLERY_UNCLAIMED = "
      + JSON.stringify(unclaimed) + ";";
    const prev = fs.readFileSync(MANIFEST, "utf8");
    /* 先把上一版的 GALLERY_UNCLAIMED 摘掉，稍后连同新块一起放回，
       否则每次同步都会追加一段、文件越滚越长。 */
    const stripped = prev.replace(/^\s*var GALLERY_UNCLAIMED = \[[^\]]*\];[ \t]*\n?/m, "");
    const headAt = stripped.search(/^var\s+GALLERY_IMGS\s*=\s*\{/m);
    let afterBlock = "";
    if (headAt >= 0) {
      const bodies = [...stripped.matchAll(/^var\s+GALLERY_IMGS\s*=\s*\{[\s\S]*?^\};/gm)];
      const lastBody = bodies[bodies.length - 1];
      afterBlock = lastBody
        ? stripped.slice(lastBody.index + lastBody[0].length)
        : stripped.slice(stripped.search(/^\};/m) + 3);
    }
    const next = (headAt >= 0 ? stripped.slice(0, headAt) : "") + body + "\n"
      + unclaimedBlock + afterBlock;
    if (next !== prev) fs.writeFileSync(MANIFEST, next, "utf8");

    /* 自检：重建后必须只剩一份赋值 —— 多份时浏览器取最后一份，与注入的那份错位 */
    const stillDup = (next.match(/^var\s+GALLERY_IMGS\s*=\s*\{/gm) || []).length;
    if (stillDup !== 1) {
      throw new Error("清单重建后仍有 " + stillDup + " 份 var GALLERY_IMGS："
        + "多份赋值时浏览器里后者覆盖前者，页面显示的图会与注入的图不一致");
    }
    const dupUncl = (next.match(/^var\s+GALLERY_UNCLAIMED\s*=/gm) || []).length;
    if (dupUncl !== 1) {
      throw new Error("清单重建后 GALLERY_UNCLAIMED 有 " + dupUncl + " 份，应恰好 1 份");
    }
  }

  return {
    entries,
    report: {
      dirCount: g.dirCount,
      registered: entries.length,
      added, removed, missing,
      orphans: g.orphans,
      weird: g.weird,
      conflicts: g.conflicts,
      aliases: g.aliases
    }
  };
}

/* 把「序号命名」的文件改成卡片编码名。
   目的是让目录文件名与卡面编号字面一致 —— 两套叫法并存时，
   人和脚本各记一套，下一次还是同样的错。
   目标文件已存在则跳过并记下来，绝不覆盖已有配图。 */
function renameToCodes() {
  const g = resolveGallery();
  const done = [];
  const skipped = [];
  const failed = [];
  for (const a of g.aliases) {
    const ext = path.extname(a.rel);
    const want = path.join(GALLERY_DIR, a.to + ext);
    const from = path.join(ROOT, a.rel);
    if (fs.existsSync(want) && path.resolve(want) !== path.resolve(from)) {
      skipped.push(a.to + ext + " 已存在，" + path.basename(a.rel) + " 没动（不覆盖已有配图）");
      continue;
    }
    try {
      fs.renameSync(from, want);
      done.push(path.basename(a.rel) + " -> " + a.to + ext);
    } catch (e) {
      failed.push(path.basename(a.rel) + "：" + (e && e.message ? e.message : e));
    }
  }
  return { done, skipped, failed };
}

/* 守夜人是否还活着：它每 10 秒写一次心跳文件。
   进程死了（会话结束就被收掉）这里就能看出来 —— 否则用户只看到
   「没更新过来」，根本判断不了是图没放对还是同步根本没在跑。 */
function heartbeatAge() {
  if (!fs.existsSync(HEARTBEAT)) return null;
  const st = fs.statSync(HEARTBEAT);
  return { sec: Math.round((Date.now() - st.mtimeMs) / 1000), txt: fs.readFileSync(HEARTBEAT, "utf8").trim() };
}

function print(r, quiet) {
  if (quiet) return;
  const hb = heartbeatAge();
  const L = [];
  L.push("画廊配图同步：目录 " + r.dirCount + " 张，登记 " + r.registered + " 张");
  if (r.added.length) L.push("  本次新增：" + r.added.join(", "));
  if (r.removed.length) L.push("  本次移除：" + r.removed.join(", ") + "（文件已不在 gallery/）");
  if (r.aliases.length) {
    L.push("  按页面序号认领（文件名是卡面编号，不是卡片编码）：");
    r.aliases.forEach(a => L.push("    " + a.from + " -> " + a.to));
  }
  if (r.conflicts.length) L.push("  ✗ 抢卡：" + r.conflicts.join("；"));
  if (r.missing.length) L.push("  ✗ 断图（清单登记了但文件不存在）："
    + r.missing.map(e => e.code + " -> " + e.rel).join(", "));
  if (r.orphans.length) L.push("  ✗ 有图无卡（编码既不是卡片编码、也超出页面序号范围，不会显示）："
    + r.orphans.join(", "));
  if (r.weird.length) L.push("  ✗ 文件名不像卡片编码（不猜它属于哪张卡）：" + r.weird.join(", "));
  if (!r.added.length && !r.removed.length && !r.missing.length && !r.orphans.length
    && !r.weird.length && !r.conflicts.length) {
    L.push("  与上次一致，无变化");
  }
  if (hb) {
    const alive = hb.sec <= 30;
    L.push("  守夜人：" + (alive ? "运行中" : "已停止") + "（最后心跳 " + hb.sec + " 秒前"
      + (hb.txt ? " · " + hb.txt : "")
      + (alive ? "" : "，进程不在了图不会自动同步，跑本脚本或双击「同步画廊.bat」") + "）");
  } else {
    L.push("  守夜人：从未启动过（图不会自动同步；常驻用「画廊守夜人.bat」，临时同步跑本脚本）");
  }
  console.log(L.join("\n"));
}

/* 退出码判据：体检模式（不写清单）下「有图没登记」就是漏同步，必须算异常；
   同步模式下新增是本次补上的正常结果，只有断图 / 抢卡 / 无主图 / 野文件名算异常 ——
   否则每次放图都会报「失败」，反而把真正的错误淹没掉。 */
function bad(r, checkOnly) {
  const hard = r.missing.length || r.orphans.length || r.weird.length || r.conflicts.length;
  return checkOnly ? (hard || r.added.length || r.removed.length) : hard;
}

module.exports = { syncManifest, resolveGallery, cardTable, resolveId, heartbeatAge, print, readRegistered, renameToCodes, readUnclaimed };

/* 读清单里注入的「没进画廊的文件」，测试与核对共用 */
function readUnclaimed() {
  if (!fs.existsSync(MANIFEST)) return [];
  const m = /^var GALLERY_UNCLAIMED = (\[[^\]]*\]);/m.exec(fs.readFileSync(MANIFEST, "utf8"));
  if (!m) return [];
  try { return JSON.parse(m[1]); } catch (e) { return []; }
}

if (require.main === module) {
  const checkOnly = process.argv.includes("--check");
  const doRename = process.argv.includes("--rename");
  try {
    if (doRename) {
      const r = renameToCodes();
      if (r.done.length) console.log("文件名已改成卡片编码（" + r.done.length + " 个）：\n  " + r.done.join("\n  "));
      else console.log("没有需要改名的文件 —— 目录里的文件名已经都是卡片编码了");
      if (r.skipped.length) console.log("跳过：\n  " + r.skipped.join("\n  "));
      if (r.failed.length) {
        console.error("改名失败：\n  " + r.failed.join("\n  "));
        process.exit(1);
      }
    }
    const { report } = syncManifest({ checkOnly });
    print(report, false);
    /* 同步完顺手核一遍图与配方。
       分开跑的话，用户放完图只会看到「同步成功」，
       图是不是挂错卡、有没有核对过，得再想起来跑第二个脚本才知道 ——
       等发现时已经照着错的图复制了好几次提示词。 */
    require("./gallery_check.js").main({ quiet: true });
    process.exit(bad(report, checkOnly) ? 1 : 0);
  } catch (e) {
    console.error("同步失败：" + (e && e.message ? e.message : e));
    process.exit(1);
  }
}
