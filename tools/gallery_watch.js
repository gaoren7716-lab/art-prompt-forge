/* ============================================================
 * gallery_watch.js —— 画廊配图自动同步（守着 gallery/ 目录）
 *
 * 为什么要有它：build_standalone.js 的同步是「跑一次、同步一次」，
 * 不是「文件一落盘就生效」。用户往 gallery/ 里丢图之后如果没人跑构建，
 * 页面上就什么都不会变 —— 而这件事从页面上完全看不出来。
 * 这个脚本把「跑一次」变成「一直在跑」。
 *
 * ★ 但它不是常驻服务：它是**当前进程**，窗口一关、终端一收就没了。
 *   已踩过三次「以为后台在跑，其实早停了」。所以它每 10 秒写一次心跳文件
 *   .gallery-watch.log，node tools/gallery_sync.js 会据此告诉你它还在不在：
 *     守夜人：已停止（最后心跳 812 秒前，进程不在了图不会自动同步）
 *   要常驻就双击「画廊守夜人.bat」（窗口留着别关），要临时同步双击
 *   「同步画廊.bat」或跑 node tools/gallery_sync.js。
 *
 * 用法：
 *     node tools/gallery_watch.js
 * 之后往 gallery/ 里放 G-19.png / VAR-03.jpg，两三秒内自动进画廊。
 *
 * 为什么不直接 spawn 构建脚本：本机 node 的 spawn/spawnSync 会 EBUSY，
 * 所以不能在子进程里跑构建 —— 这里是同进程 await 调用。
 * ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GALLERY_DIR = path.join(ROOT, "gallery");
const HEARTBEAT = path.join(ROOT, ".gallery-watch.log");
const INTERVAL = 2000;
const IMG_RE = /\.(png|jpe?g|webp)$/i;

const build = require("./build_standalone.js");

function snapshot() {
  if (!fs.existsSync(GALLERY_DIR)) return "";
  return fs.readdirSync(GALLERY_DIR)
    .filter(n => !n.startsWith("_") && !n.startsWith(".") && IMG_RE.test(n))
    .sort()
    .map(n => {
      const st = fs.statSync(path.join(GALLERY_DIR, n));
      /* 带上 mtime 与体积：同名的图被换成另一张也要能察觉 */
      return n + ":" + st.size + ":" + Math.round(st.mtimeMs);
    })
    .join("|");
}

function stamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}

/* 心跳：让「守夜人还活着吗」有据可查。
   没有它的时候，用户只能看到「图没同步过来」，判断不了是图放错了还是
   同步根本没在跑 —— 排查方向全靠猜。 */
let lastNote = "已启动，等待首次同步";
function beat(note) {
  if (note !== undefined) lastNote = note;
  try {
    fs.writeFileSync(HEARTBEAT, lastNote + "（" + stamp() + "）", "utf8");
  } catch (e) { /* 心跳写不进去不该弄死守夜人 */ }
}

let last = snapshot();
let running = false;
let pending = false;

async function sync(trigger) {
  if (running) { pending = true; return; }
  running = true;
  console.log("\n[" + stamp() + "] 检测到变化" + (trigger ? "（" + trigger + "）" : "") + "，开始同步…");
  try {
    await build();
    beat("上次同步成功");
  } catch (e) {
    /* 构建失败不能把守夜人一起带走：下次文件变化还要能重试 */
    console.error("[" + stamp() + "] 同步失败：" + (e && e.message ? e.message : e));
    beat("上次同步失败：" + (e && e.message ? e.message : e));
  }
  running = false;
  /* 同步过程中又有新文件落盘 -> 补跑一次，不丢 */
  if (pending) { pending = false; sync("补跑"); }
}

console.log("画廊配图守夜人已启动（这个窗口别关，关了就不自动同步了）。");
console.log("  目录：" + GALLERY_DIR);
console.log("  规则：文件名 = 卡片编码（G-19.png / VAR-03.jpg），扩展名大小写随意");
console.log("  每 " + (INTERVAL / 1000) + " 秒检查一次，图一落盘就同步并重建单文件版。");
console.log("  心跳文件：" + HEARTBEAT + "（node tools/gallery_sync.js 会读它判断死没死）");
console.log("  首次全量同步…");
beat("已启动");
sync("启动");

/* 没变化也要定期敲心跳，否则「安静」和「死了」区分不开 */
setInterval(() => beat(), 10000);

setInterval(() => {
  const now = snapshot();
  if (now !== last) {
    last = now;
    sync("");
  }
}, INTERVAL);
