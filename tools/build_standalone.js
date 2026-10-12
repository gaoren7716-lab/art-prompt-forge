#!/usr/bin/env node
/* 打包单文件版：把 index.html 引用的全部 assets/*.js 内联成一个 standalone.html。
 *
 * 为什么要有它：index.html 依赖同目录 45 个 assets/*.js，拷走单个文件或在
 * 只加载单文件的预览面板里打开，数据全部加载不到，页面只剩导航空壳。
 * standalone.html 不依赖任何外部文件，双击即用，也可直接拖进任何预览器。
 *
 * 用法：node tools/build_standalone.js
 * 输出：standalone.html（约 0.9MB）
 *
 * 安全前提（build 前置检查，不满足就报错退出）：
 *   1. 资产内不得含 </script>（会提前终止内联 script 块）
 *   2. 资产内不得含 document.write / location.reload（内联后语义会变）
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "index.html");

/* 画廊卡片编码全集（签名卡 G-xx + 组合变奏 VAR-xx）已移到 tools/gallery_sync.js
 * 的 cardCodes() —— 同步逻辑只此一份，这里不再自己算，避免两处各算各的。 */
const OUT = path.join(ROOT, "standalone.html");

async function main() {
let html = fs.readFileSync(SRC, "utf8");

/* ---- 前置检查 ---- */
const assetsDir = path.join(ROOT, "assets");
for (const f of fs.readdirSync(assetsDir)) {
  if (!f.endsWith(".js")) continue;
  const t = fs.readFileSync(path.join(assetsDir, f), "utf8");
  if (/<\/script>/i.test(t))
    throw new Error(f + " 含 </script>，内联会截断 script 块，先改写它");
  if (/document\.write|location\.reload/.test(t))
    throw new Error(f + " 含 document.write/location.reload，内联后语义会变");
}

/* ---- 逐个内联 <script src="assets/..."> ---- */
let inlined = 0;
html = html.replace(
  /<script src="assets\/([\w.-]+\.js)"><\/script>/g,
  (m, file) => {
    const p = path.join(assetsDir, file);
    if (!fs.existsSync(p)) throw new Error("引用的资产不存在: " + file);
    inlined++;
    return (
      "<script>\n/* ==== inlined: assets/" +
      file +
      " ==== */\n" +
      fs.readFileSync(p, "utf8") +
      "\n</script>"
    );
  }
);

if (inlined < 40) throw new Error("只内联了 " + inlined + " 个脚本，数量异常，检查 index.html 的 script 标签");

/* ---- 标记单文件版，页面脚本可据此调整文案 ---- */
html = html.replace(
  "<head>",
  "<head>\n<!-- standalone 单文件版：由 tools/build_standalone.js 生成，勿手改；改 index.html 后重新构建 -->\n<script>window.APF_STANDALONE = true;</script>"
);

/* ---- 画廊配图自动同步 + 注入（有图才注入，无图零开销）----
 * gallery/ 目录里的图**按文件名自动登记**：G-01.png / SG-01.jpg 都算，
 * 扩展名 png/jpg/jpeg/webp 大小写不敏感。文件名去掉扩展名就是卡片编码，
 * 命名对得上就自动进画廊 —— 不必手改清单。
 * 登记结果写回 assets/gallery-imgs.js（清单是派生物，不是手写真源）。
 *
 * 页面版靠 gallery/ 目录跟随，standalone 必须自带，否则图全裂。
 * 做法：把每张图读成 base64 dataURI 挂到 window.APF_IMG_DATA，
 * 页面脚本 galImgSrc() 已写成优先取它。
 *
 * 注入时会把 PNG 重新编码成 JPEG：无损 PNG 单张 1.3MB，40 张 base64 就是 70MB，
 * 单文件版没法用；而单文件版的定位是「带着走」，画质压一档没人看得出来。
 * 页面版读的是原 PNG 文件本身，不受这里影响。
 */
{
  /* 扫目录、判编码、写清单这四步全在 tools/gallery_sync.js 里，**只此一份**。
     原先写在本文件，于是「只想更新清单」也必须跑一遍 6MB 打包，
     而同步是否漏掉也没有独立入口可查 —— 用户放完图只能干等后台进程。
     抽出来之后：node tools/gallery_sync.js 一秒出差异报告。 */
  const gsync = require("./gallery_sync.js");
  const { entries, report } = gsync.syncManifest({});
  gsync.print(report, false);

  /* 第四步：按清单注入。清单登记了却没文件 = 画廊断图，必须报错。
     原来只 console.log 一句就跳过，清单里还指着已删文件时构建照样
     「成功」，用户打开才发现图没了 —— 静默失败比构建失败更糟。 */
  const data = {};
  const missing = [];
  let warnedSharp = false;
  for (const { code: id, rel } of entries) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) { missing.push(id + " -> " + rel); continue; }
    const ext = (p.split(".").pop() || "").toLowerCase();
    if (ext === "png") {
      /* 尽量用 sharp；没有就退回无损原图（体积大但不会构建失败） */
      try {
        const sharp = require("sharp");
        data[id] = "data:image/jpeg;base64," +
          (await sharp(p).resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 86, mozjpeg: true }).toBuffer()).toString("base64");
      } catch (e) {
        data[id] = "data:image/png;base64," + fs.readFileSync(p).toString("base64");
        if (!warnedSharp) {
          console.log("提示：未装 sharp，PNG 将按无损注入（单文件版会偏大）");
          warnedSharp = true;
        }
      }
    } else if (ext === "webp") {
      data[id] = "data:image/webp;base64," + fs.readFileSync(p).toString("base64");
    } else {
      data[id] = "data:image/jpeg;base64," + fs.readFileSync(p).toString("base64");
    }
  }
  /* 清单里登记了却没文件 = 画廊断图，必须报错。
     原来只 console.log 一句就跳过，结果清单里还指着已删的 G-01.jpg 时，
     构建照样「成功」，用户打开才发现图没了 —— 静默失败比构建失败更糟。 */
  if (missing.length) {
    throw new Error(
      "配图清单指向不存在的文件（画廊会断图）：\n  - " + missing.join("\n  - ") +
      "\n修法：补上文件，或改 assets/gallery-imgs.js 里的路径。"
    );
  }
  /* 图进画廊了，但图与配方是不是一回事？构建时顺手核对一次 ——
     放图的那一刻就能看到出入，不用等到点开卡片才发现。
     核对逻辑在 tools/gallery_check.js，这里只调用。
     **同进程 require 而不是 execFileSync**：本机 node 的 spawn/spawnSync
     一律 EBUSY，原来那句 execFileSync 被 catch 吞掉，等于核对从未跑过 ——
     又是一处「构建成功但事情没做」。 */
  try {
    require("./gallery_check.js").main({ quiet: true });
  } catch (e) {
    console.log("配图核对跳过：" + (e && e.message ? e.message : e));
  }

  if (Object.keys(data).length) {
    html = html.replace(
      "<script>",
      "<script>\nwindow.APF_IMG_DATA = " + JSON.stringify(data) + ";",
      // 只注入一次：替换第一处<script>（即上面 APF_STANDALONE 那块）
    );
    console.log("配图注入 " + Object.keys(data).length + " 张");
  }
}

fs.writeFileSync(OUT, html);
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log("standalone.html 生成完毕：内联 " + inlined + " 个脚本，" + kb + " KB");
}

module.exports = main;

/* 直接跑才是「构建」；被 require 时只导出函数 ——
   tools/gallery_watch.js 要复用它做自动同步，不能一 require 就执行一次。 */
if (require.main === module) {
  main().catch(e => {
    console.error("构建失败：" + (e && e.message ? e.message : e));
    process.exit(1);
  });
}
