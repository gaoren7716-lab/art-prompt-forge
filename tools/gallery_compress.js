#!/usr/bin/env node
/* 画廊配图转码：1200px 的 PNG 单张 3MB 上下，40 张就是 108MB，
 * 整个仓库因此推不上 GitHub（本机 git 走代理实测几 MB 就要几十分钟）。
 *
 * 为什么是 JPEG 而不是「更好的 PNG」：这些图是 1200px 的照片类图像，
 * 无损重压缩实测只能省 0%（原图已经是 PNG level 9 的水平），
 * 也就是说 PNG 这条路上根本没有余量，只有换编码才有量级差。
 * q88 + mozjpeg 下 3.3MB → 0.55MB（-83%），画廊展示尺寸看不出差别。
 *
 * 为什么敢改格式：同步器按**文件名**（去掉扩展名）认卡片，
 * 扩展名 png / jpg / jpeg / webp 一视同仁，改编码不影响自动同步。
 *
 * 原图不丢：转码前把 PNG 原样移进 gallery/_png_backup/。
 * 下划线开头 = 母版与临时产物，同步器本来就不收，也不进版本库。
 *
 * 用法：
 *   node tools/gallery_compress.js           转码（先备份再换）
 *   node tools/gallery_compress.js --check   只看能省多少，不动文件
 *   node tools/gallery_compress.js --restore 把备份的 PNG 搬回来（换回原图）
 *
 * 需要 sharp：NODE_PATH=<sharp 所在 node_modules> node tools/gallery_compress.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "gallery");
const BACKUP = path.join(DIR, "_png_backup");
const QUALITY = 88;

let sharp;
try { sharp = require("sharp"); }
catch (e) {
  console.error("需要 sharp。用 NODE_PATH 指到装了 sharp 的 node_modules 再跑：\n"
    + '  NODE_PATH="C:/Users/A/.workbuddy/binaries/node/workspace/node_modules" node tools/gallery_compress.js');
  process.exit(2);
}

/* 只收参与同步的图：下划线开头的是母版/临时产物，不碰 */
function listPngs() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR)
    .filter(n => !n.startsWith("_") && !n.startsWith("."))
    .filter(n => /\.png$/i.test(n))
    .sort();
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const restore = process.argv.includes("--restore");

  if (restore) {
    if (!fs.existsSync(BACKUP)) { console.log("没有备份可还原（" + BACKUP + " 不存在）"); return; }
    let n = 0;
    for (const f of fs.readdirSync(BACKUP)) {
      if (!/\.png$/i.test(f)) continue;
      const src = path.join(BACKUP, f);
      const dst = path.join(DIR, f);
      const jpg = path.join(DIR, f.replace(/\.png$/i, ".jpg"));
      if (fs.existsSync(jpg)) fs.unlinkSync(jpg);   /* 同名 jpg 会让同步器抢同一张卡 */
      fs.renameSync(src, dst);
      n++;
    }
    console.log("已还原 " + n + " 张 PNG 原图，同名 .jpg 已删除。跑一次同步让清单跟上。");
    return;
  }

  const files = listPngs();
  if (!files.length) { console.log("gallery/ 里没有待转码的 PNG。"); return; }

  let before = 0, after = 0, done = 0, skipped = 0;
  console.log((checkOnly ? "体积预估（不动文件）" : "转码中") + "：q" + QUALITY + " mozjpeg\n");

  for (const f of files) {
    const src = path.join(DIR, f);
    const buf = fs.readFileSync(src);
    const out = await sharp(buf).jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    before += buf.length; after += out.length;
    const cut = Math.round((1 - out.length / buf.length) * 100);
    if (checkOnly) {
      console.log("  " + f.padEnd(12) + (buf.length / 1048576).toFixed(2) + "MB -> "
        + (out.length / 1048576).toFixed(2) + "MB  (-" + cut + "%)");
      continue;
    }
    /* 转完反而更大（极小图或纯色图）就不动，免得又损画质又没省空间 */
    if (out.length >= buf.length) {
      console.log("  跳过 " + f + "（转码后没变小，保留 PNG）");
      skipped++;
      after -= out.length - buf.length;
      continue;
    }
    if (!fs.existsSync(BACKUP)) fs.mkdirSync(BACKUP, { recursive: true });
    fs.renameSync(src, path.join(BACKUP, f));       /* 先搬走原图，再写新文件 */
    fs.writeFileSync(path.join(DIR, f.replace(/\.png$/i, ".jpg")), out);
    done++;
  }

  const mb = b => (b / 1048576).toFixed(1) + "MB";
  console.log("\n" + (checkOnly ? "预估" : "实际") + "：" + files.length + " 张  "
    + mb(before) + " -> " + mb(after)
    + "（省 " + (before ? Math.round((1 - after / before) * 100) : 0) + "%）");
  if (!checkOnly) {
    console.log("转码 " + done + " 张，跳过 " + skipped + " 张；PNG 原图在 " + BACKUP);
    console.log("下一步：node tools/gallery_sync.js 让清单认下 .jpg，再重建 standalone。");
  }
}

main().catch(e => { console.error("转码失败：" + (e && e.message ? e.message : e)); process.exit(1); });
