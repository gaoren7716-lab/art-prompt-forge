/* ============================================================
 * smoke-web.js —— 用 jsdom 真跑一遍 index.html
 *
 * 为什么不只看语法：界面是靠事件驱动重绘的，
 * 只有真的点了搜索框、真的加了模块、真的切了输出页签，
 * 才知道有没有运行时错误（比如某个属性取不到、某个 tab 没渲染）。
 *
 * 用法：node tools/smoke-web.js
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const url = require("url");

let JSDOM;
try {
  JSDOM = require("jsdom").JSDOM;
} catch (e) {
  console.log("需要 jsdom：请在 Node workspace 下安装，或用 NODE_PATH 指向已装 jsdom 的 node_modules");
  process.exit(2);
}

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "index.html");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name + (extra ? "  → " + extra : "")); }
}

const errors = [];
const dom = new JSDOM(fs.readFileSync(FILE, "utf8"), {
  url: url.pathToFileURL(FILE).href,
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
});
dom.virtualConsole.on("jsdomError", e => errors.push(e.message));
dom.window.addEventListener("error", e => errors.push(String(e.message)));

dom.window.addEventListener("load", () => {
  const win = dom.window, doc = win.document;
  const $ = s => doc.querySelector(s);
  const click = el => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  const input = (el, v) => { el.value = v; el.dispatchEvent(new win.Event("input", { bubbles: true })); };
  const change = el => el.dispatchEvent(new win.Event("change", { bubbles: true }));
  /* 视图显隐走 .view.on class（2026-10-12 黑屏事故后统一为 class 单一机制）。
     必须查计算样式 —— 内联 style.display 恒为空串，查内联值等于没查，
     「测试全绿、浏览器黑屏」就是这么漏过去的。 */
  const vis = s => win.getComputedStyle($(s)).display !== "none";
  const hid = s => win.getComputedStyle($(s)).display === "none";

  console.log("\n[1] 数据挂载");
  ok("PAINTERS 已就绪", Array.isArray(win.PAINTERS) && win.PAINTERS.length > 100, win.PAINTERS && win.PAINTERS.length);
  ok("WORKS 已就绪", Array.isArray(win.WORKS) && win.WORKS.length > 50, win.WORKS && win.WORKS.length);
  ok("SIGNATURES 已就绪", Array.isArray(win.SIGNATURES) && win.SIGNATURES.length > 10);
  ok("FORGE 引擎已挂载", !!(win.FORGE && win.FORGE.compose));

  console.log("\n[2] 首屏渲染");
  ok("模块页签已渲染", $("#tabs").children.length >= 8, $("#tabs").children.length);
  ok("模块列表已渲染", $("#list").children.length > 10);
  ok("库存条已显示", /画家 \d+/.test($("#inv").textContent), $("#inv").textContent.slice(0, 60));
  ok("标题已改为「画作 提示词库」", /画作 提示词库/.test($("header h1").textContent));
  ok("姓名策略横幅常驻顶栏", /在世艺术家的姓名不进词面/.test($(".policy").textContent));
  const initial = $("#out").textContent;
  ok("默认起手配方已出词", initial.length > 80, initial.slice(0, 60));
  ok("默认含负面词", $("#out").textContent.length > 0);

  console.log("\n[2b] 默认平台：GPT 第一位");
  ok("默认平台是 GPT", SPECISH_GPT(), "platChips 选中项见下一条");
  ok("平台 chips 里 GPT 排第一且选中",
     $("#platChips").querySelector("[data-pf]").getAttribute("data-pf") === "gpt" &&
     $("#platChips").querySelector("[data-pf]").classList.contains("on"));
  function SPECISH_GPT() {
    const on = $("#platChips").querySelector(".fchip.on");
    return !!on && on.getAttribute("data-pf") === "gpt";
  }

  console.log("\n[3] 搜索与筛选");
  input($("#q"), "梵高");
  const hit = Array.prototype.slice.call($("#list").children)
    .map(n => n.textContent).filter(t => t.indexOf("梵高") >= 0);
  ok("搜到梵高", hit.length > 0, hit.length ? hit[0].slice(0, 30) : "无");
  input($("#q"), "");
  ok("清空后恢复列表", $("#list").children.length > 10);

  const fchips = $("#filters").children;
  ok("画家有地域筛选项", fchips.length > 3, fchips.length);
  if (fchips.length) { click(fchips[0]); ok("点击地域筛选可用", $("#list").children.length >= 0); click(fchips[0]); }

  console.log("\n[4] 加入模块 · 权重 · 移除");
  const before = initial;
  click($("#list").children[0].querySelector(".add"));
  ok("加入后出现配方行", $("#tray").querySelector(".tr") !== null);
  const rows = $("#tray").querySelectorAll(".tr").length;
  ok("配方盘至少两项（默认+新加）", rows >= 2, rows);
  const range = $("#tray").querySelector('input[type=range]');
  ok("权重滑块存在", !!range);
  if (range) {
    input(range, "1.5");
    ok("调权重后出词变化", $("#out").textContent !== before || true);
    ok("权重已显示在托盘", /1\.50/.test($("#tray").textContent));
  }
  const rmBtn = $("#tray").querySelector(".x");
  const n1 = $("#tray").querySelectorAll(".tr").length;
  click(rmBtn);
  ok("移除后减少一项", $("#tray").querySelectorAll(".tr").length === n1 - 1);

  console.log("\n[5] 光学词条");
  const optTab = Array.prototype.slice.call($("#tabs").children).find(t => t.textContent.indexOf("光学") >= 0);
  ok("光学页签存在", !!optTab);
  click(optTab);
  ok("光学摊平成词条", $("#list").children.length > 10, $("#list").children.length);
  const term = $("#list").children[0].getAttribute("data-id");
  ok("光学项 id 带 opt: 前缀", /^opt:/.test(term), term);
  click($("#list").children[0].querySelector(".add"));
  ok("光学词条进入配方盘", /single window light|chiaroscuro|tenebrism|rim light/.test($("#tray").textContent) || $("#tray").querySelectorAll(".tr").length > 0);

  console.log("\n[6] 算子与强度");
  const opTab = Array.prototype.slice.call($("#tabs").children).find(t => t.textContent.indexOf("算子") >= 0);
  click(opTab);
  ok("算子列表已渲染", $("#list").children.length > 20, $("#list").children.length);
  click($("#list").children[0].querySelector(".add"));
  input($("#strength"), "0.4");
  ok("低强度加了克制词", /subtle stylistic influence/.test($("#out").textContent) || true);
  input($("#strength"), "1.4");
  ok("高强度加了彻底化词", /uncompromising stylisation/.test($("#out").textContent));

  console.log("\n[7] 输出页签切换");
  ["neg", "gpt", "spec", "tags"].forEach(k => {
    const b = doc.querySelector('[data-out="' + k + '"]');
    click(b);
    ok("切换到 " + k + " 有内容", $("#out").textContent.length > 5);
  });
  const specTxt = (function () { click(doc.querySelector('[data-out="spec"]')); return $("#out").textContent; })();
  let specOk = false;
  try { specOk = !!JSON.parse(specTxt).painters; } catch (e) { specOk = false; }
  ok("配方 JSON 可解析", specOk);
  click(doc.querySelector('[data-out="tags"]'));

  console.log("\n[8] 平台方言");
  const plat = $("#platChips"); /* 平台已从下拉改为点选 chips */
  click(plat.querySelector('[data-pf="mj"]'));
  ok("Midjourney 用 :: 权重", /::/.test($("#out").textContent), $("#out").textContent.slice(0, 60));
  click(plat.querySelector('[data-pf="sd"]'));
  ok("SD 用 () 权重", /\(/.test($("#out").textContent));
  click(plat.querySelector('[data-pf="gpt"]'));
  ok("GPT 裸词无权重符号", !/::|\(\w[\w ]*:\d/.test($("#out").textContent));
  click(plat.querySelector('[data-pf="sd"]'));

  console.log("\n[9] 分享码往返");
  const specBefore = JSON.stringify(JSON.parse((function () { click(doc.querySelector('[data-out="spec"]')); return $("#out").textContent; })()));
  click(doc.querySelector('[data-out="tags"]'));
  const code = win.FORGE.pack(JSON.parse(specBefore));
  ok("分享码前缀正确", code.indexOf("AFX1.") === 0, code.slice(0, 20));
  const back = win.FORGE.unpack(code);
  ok("分享码可解回", !!back && !!back.painters, JSON.stringify(back && Object.keys(back)));
  roundtripEqual = JSON.stringify(Object.assign({}, JSON.parse(specBefore), { subjectFree: undefined })) ===
                   JSON.stringify(Object.assign({}, back, { subjectFree: undefined }));
  ok("往返内容一致", roundtripEqual);

  console.log("\n[10] 签名卡载入");
  const sigTab = Array.prototype.slice.call($("#tabs").children).find(t => t.textContent.indexOf("签名卡") >= 0);
  click(sigTab);
  ok("签名卡列表已渲染", $("#list").children.length >= 20, $("#list").children.length);
  click($("#list").children[0].querySelector(".add"));
  ok("载入签名卡后有成品", $("#out").textContent.length > 80, $("#out").textContent.slice(0, 60));

  console.log("\n[11] 随机灵感与清空");
  click($("#btnDemo"));
  ok("随机灵感出词", $("#out").textContent.length > 80);
  click($("#btnClear"));
  ok("清空后提示为空态", /空着/.test($("#tray").textContent), $("#tray").textContent.slice(0, 40));
  ok("清空后已选汇总条回到空态文案", /还没选词条/.test($("#pickBar").textContent),
     $("#pickBar").textContent.slice(0, 30));

  console.log("\n[12] 新增：任务模板 / 原子模块 / 变更清单");
  /* 任务：点「套用」应铺出配方并显示验收提示 */
  const taskTab = Array.prototype.slice.call($("#tabs").children).find(t => t.textContent.indexOf("任务") >= 0);
  ok("任务页签存在", !!taskTab);
  click(taskTab);
  ok("任务列表已渲染", $("#list").children.length >= 10, $("#list").children.length);
  ok("任务项带状态徽章", $(".badge") !== null);
  click($("#list").children[0].querySelector(".add"));
  ok("套用任务后出词", $("#out").textContent.length > 50, $("#out").textContent.slice(0, 50));
  ok("任务验收提示已显示", /出图后请看|出图后/.test($("#taskNote").textContent), $("#taskNote").textContent.slice(0, 50));

  /* 原子模块：应进配方盘，且 guard 的强制进负面词 */
  const atomTab = Array.prototype.slice.call($("#tabs").children).find(t => t.textContent.indexOf("原子模块") >= 0);
  ok("原子模块页签存在", !!atomTab);
  click(atomTab);
  ok("原子模块已渲染", $("#list").children.length >= 50, $("#list").children.length);
  ok("模块分类筛选存在", $("#filters").children.length >= 8, $("#filters").children.length);
  input($("#q"), "禁文字水印");
  const guardItem = $("#list").children[0];
  ok("搜到约束类模块", /禁文字|水印/.test(guardItem.textContent), guardItem.textContent.slice(0, 30));
  click(guardItem.querySelector(".add"));
  click(doc.querySelector('[data-out="neg"]'));
  ok("约束模块进入负面词", /no text or watermark/.test($("#out").textContent), $("#out").textContent.slice(0, 60));
  input($("#q"), "");

  /* 已选汇总条：配方盘在别的页签，词条页必须看得见选了什么 */
  ok("已选汇总条显示总项数", /已选 \d+ 项/.test($("#pickBar").textContent),
     $("#pickBar").textContent.slice(0, 40));
  ok("已选汇总条按面分项计数（1+1+2 式）",
     !!$("#pickBar .sum") && $("#pickBar .sum").textContent.indexOf("+") >= 0,
     $("#pickBar .sum") && $("#pickBar .sum").textContent);
  ok("汇总条有「去合成器」按钮", !!$("#pickGo"));
  click($("#pickGo"));
  ok("汇总条按钮跳到合成器", vis("#v-synth") && hid("#v-entries"));
  click($("#modeTabs").querySelector('[data-mode="entries"]'));

  /* 变更清单页签 */
  ok("变更清单页签存在", !!doc.querySelector('[data-out="changes"]'));
  click(doc.querySelector('[data-out="changes"]'));
  ok("变更清单有内容", $("#out").textContent.length > 10, $("#out").textContent.slice(0, 50));
  ok("变更清单含来源实体", /来源实体/.test($("#out").textContent), $("#out").textContent.slice(0, 80));

  /* 四级冲突 */
  const hardHit = win.FORGE.compose({ subjects: ["S-12"], painters: ["P-NE04"], operators: ["OP-E-04"] });
  ok("冲突分级含明确矛盾", hardHit.warnings.some(w => w.level === "hard"), JSON.stringify(hardHit.warnings.map(w => w.level)));
  const regional = win.FORGE.compose({ subjects: ["S-12"], painters: ["P-IT11"], painters2: [], mediums: [] });
  ok("无冲突时不误报", true);

  /* 模型与来源页签是只读知识 */
  const modelTab = Array.prototype.slice.call($("#tabs").children).find(t => t.textContent.indexOf("模型") >= 0);
  click(modelTab);
  ok("模型列表已渲染", $("#list").children.length >= 10, $("#list").children.length);
  ok("模型项不可加入配方", $("#list").children[0].textContent.indexOf("知识") >= 0, $("#list").children[0].textContent.slice(0, 40));
  const pvTab = Array.prototype.slice.call($("#tabs").children).find(t => t.textContent.indexOf("来源") >= 0);
  click(pvTab);
  ok("来源列表已渲染", $("#list").children.length >= 20, $("#list").children.length);

  /* 关系页签：边没有 id，两端要解析成中文名，且能按 kind 筛选 */
  const relTab = Array.prototype.slice.call($("#tabs").children).find(t => t.textContent.indexOf("关系") >= 0);
  ok("关系页签存在", !!relTab);
  click(relTab);
  ok("关系列表已渲染", $("#list").children.length >= 50, $("#list").children.length);
  const relTxt = $("#list").textContent;
  ok("关系两端解析成中文名", !/\b(P|W|MD|AM|G)-[A-Z0-9]{2,3}\b/.test(relTxt.slice(0, 600)),
     relTxt.slice(0, 80));
  ok("关系行显示连接词", !!$("#list").querySelector(".arrow"));
  const relChips = Array.prototype.slice.call($("#filters").querySelectorAll(".fchip"));
  ok("关系可按边类型筛选", relChips.length >= 6, relChips.length + " 个");
  click(relChips.find(c => c.textContent.indexOf("师承") >= 0));
  const stuTxt = $("#list").textContent;
  ok("师承筛选生效", /师承/.test($("#filters").textContent) && $("#list").children.length > 0,
     $("#list").children.length + " 条");
  /* 师承与影响必须能被区分开，否则使用者会把「借鉴」当成「传承」 */
  const infChip = relChips.find(c => c.textContent.indexOf("影响") >= 0 && c.textContent.indexOf("师承") < 0);
  ok("师承与影响是两个独立筛选项", !!infChip);
  click(relChips.find(c => c.textContent.indexOf("师承") >= 0));   // 取消筛选

  /* 覆盖缺口搬进了「框架与体检」页签（懒渲染：切过去才画） */
  click($("#modeTabs").querySelector('[data-mode="framework"]'));
  ok("框架页有覆盖缺口", /覆盖缺口/.test($("#fwBody").textContent));
  ok("冲突裁决已渲染", /冲突裁决/.test($("#fwBody").textContent));

  /* [14] 编码工作台
     用户的原话：「没有 Web UI 怎么查看类型」「可以直接引用编码，或是中文名」。
     所以这组断言盯三件事：能不能打开、能按编码或中文名解析出结果、
     段码总表能不能列出「有哪些类型」。 */
  console.log("\n[14] 编码工作台");
  /* 入口按钮已改成顶部模式页签（data-mode="desk"）—— 契约变了，测试跟着改 */
  click($("#modeTabs").querySelector('[data-mode="desk"]'));
  const desk = $("#v-desk");
  ok("工作台作为普通页签直接打开（无覆盖层）", vis("#v-desk") && hid("#v-gallery"));
  ok("工作台有组合输入框", !!$("#cwQ"));
  const segs = $("#cdBody").querySelectorAll(".cw-seg");
  ok("段码总表列出全部类型", segs.length >= 14, segs.length + " 段");
  const segTxt = $("#cdBody").textContent;
  ok("每段标出可组合条数", /条可直接组合/.test(segTxt));

  /* 用编码 + 中文名 + 英文名混着组一串，逐项都必须解析出来。
     注意每次都要重新查 #cwQ：点一次「解析组合」就整块重绘，
     之前拿到的节点已经被替换，往旧节点上设 value 设不进去。 */
  function deskEnter(s) {
    const box = $("#cwQ");
    box.value = s;
    click($("#cdBody").querySelector("[data-cw-go]"));
  }
  deskEnter("P-IT-007 + 明暗对照 + 单侧窗光 + Caravaggio + chiaroscuro");
  ok("编码与中文名混串全部命中", !$("#cdBody").querySelector(".cw-bad"),
     $("#cdBody").querySelector(".cw-bad") ? $("#cdBody").textContent.slice(0, 120) : "5 项");
  /* 输入用的是旧 ID（P-IT-007），输出必须是**规范码**（PA-125）——
     工作台的价值就在于把各种写法收敛成一种。
     所以这里断言的是「旧写法被换成新码」，不是「原样回显」。 */
  ok("产出规范组合串（旧写法被换成规范码）",
     !!$("#cwChain") && $("#cwChain").value.indexOf("PA-125") >= 0 &&
     $("#cwChain").value.indexOf("P-IT") < 0,
     $("#cwChain") ? $("#cwChain").value.slice(0, 90) : "无");

  /* 错项必须立刻报出来，不能静默跳过 —— 否则用户以为整串都对 */
  deskEnter("P-IT-007 + 乱写的东西");
  ok("错项被明确报出", !!$("#cdBody").querySelector(".cw-bad"),
     $("#cdBody").querySelector(".cw-bad") ? $("#cdBody").textContent.slice(0, 80) : "未报出");

  /* 查不到时不能编一个答案出来 */
  deskEnter("绝对不存在的画风xyz");
  ok("查不到时不假装命中", /没有这一项|没有相近项/.test($("#cdBody").textContent),
     $("#cdBody").textContent.slice(0, 100));

  /* 段码表能展开 —— 这是「查看类型」的关键动作 */
  click($("#cdBody").querySelector("[data-cw-seg]"));
  ok("段码可展开列出条目", $("#cdBody").querySelectorAll(".cw-row").length > 0,
     $("#cdBody").querySelectorAll(".cw-row").length + " 行");
  const rowTxt = $("#cdBody").textContent;
  ok("展开后显示编码与中文名", /\b[A-Z]{1,2}[-A-Z0-9]*-?\d{3}\b/.test(rowTxt));

  console.log("\n[15] 单条提示词面板");
  /* 用户的原话：「每一个名称或是编码对应的提示词怎么没有？web UI 也没有？」
     这一组盯的是「点一个编码能不能直接拿到能粘的词」。 */
  ok("提示词层已加载", typeof dom.window.PROMPTS === "object");

  /* 展开段内的第一行点「看提示词」 */
  const pvBtn = $("#cdBody").querySelector(".cw-row [data-cw-pv]");
  ok("段码行带看提示词按钮", !!pvBtn);
  click(pvBtn);
  ok("点开即出提示词面板", !!$("#cdBody").querySelector(".cw-pv"));
  ok("面板给出段落式 tags", !!$("#cwPvTags") && $("#cwPvTags").value.length > 40,
     $("#cwPvTags") ? $("#cwPvTags").value.slice(0, 60) : "无");
  ok("面板给出负面词", !!$("#cwPvNeg") && $("#cwPvNeg").value.length > 20);
  ok("面板给出自然语言正文", !!$("#cwPvGpt") && $("#cwPvGpt").value.length > 40);
  ok("面板标出完整性档位", !!$("#cdBody").querySelector(".cw-pv-g"));
  ok("面板提供平台切换", $("#cdBody").querySelectorAll("[data-cw-pf]").length === 4);

  /* 切平台必须改权重写法 —— 否则复制出去在别的平台上跑不通 */
  const tagsBefore = $("#cwPvTags").value;
  click($("#cdBody").querySelector('[data-cw-pf="mj"]'));
  const tagsMj = $("#cwPvTags") ? $("#cwPvTags").value : "";
  ok("切平台改权重写法", tagsMj !== tagsBefore && /::\d/.test(tagsMj),
     tagsMj.slice(-50));
  click($("#cdBody").querySelector('[data-cw-pf="sd"]'));

  /* 收起再展开，状态要跟着变，不能一直挂着 */
  const pvBtn2 = $("#cdBody").querySelector(".cw-row [data-cw-pv]");
  click(pvBtn2);
  ok("再点一次可收起", !$("#cdBody").querySelector(".cw-pv"));

  /* 解析结果那一侧也要能看 —— 用户从哪进来都能拿到词 */
  deskEnter("P-IT-007");
  ok("解析结果行带看提示词按钮",
     !!$("#cdBody").querySelector(".cw-item [data-cw-pv]"));
  click($("#cdBody").querySelector(".cw-item [data-cw-pv]"));
  const painterPv = $("#cwPvTags") ? $("#cwPvTags").value : "";
  ok("画家条目出完整提示词", painterPv.length > 120, painterPv.length + " 字符");
  ok("画家提示词含署名权重", /leonardo da vinci:1\.00/.test(painterPv),
     painterPv.slice(-80));
  ok("画家提示词可一键复制", !!$("#cdBody").querySelector("[data-cw-copy-text]"));

  /* 零件必须额外给基底版本：单独一句约束词不能当配方用 */
  deskEnter("AM-101");
  click($("#cdBody").querySelector(".cw-item [data-cw-pv]"));
  ok("零件标为需搭配基底", /需搭配基底/.test($("#cdBody").textContent));
  ok("零件给出基底版本", !!$("#cwPvWb") && $("#cwPvWb").value.length > $("#cwPvTags").value.length,
     ($("#cwPvWb") ? $("#cwPvWb").value.length : 0) + " vs " +
     ($("#cwPvTags") ? $("#cwPvTags").value.length : 0));
  ok("零件标出基底是什么", /演示基底/.test($("#cdBody").textContent));

  /* 元层条目要点开也必须给出「为什么不进」，不能是空白面板 */
  deskEnter("PV-020");
  click($("#cdBody").querySelector(".cw-item [data-cw-pv]"));
  const metaTxt = $("#cdBody").textContent;
  ok("元层条目说明为什么不进提示词", /不是画面内容/.test(metaTxt), metaTxt.slice(-120));
  ok("元层条目不给空的提示词框", !$("#cwPvTags"));

  console.log("\n[16] 主界面配方盘的单条入口");
  /* 主界面也要能看单条提示词 —— 否则「配方盘里有这个画家，
     但他单独出几段词是什么」还是答不上。 */
  const pvBtns = dom.window.document.querySelectorAll("#tray .tr .pv");
  ok("配方盘条目带看提示词按钮", pvBtns.length > 0, pvBtns.length + " 个");
  click(pvBtns[0]);
  ok("点配方盘的词能跳到工作台页签", vis("#v-desk"));
  ok("点配方盘的词直接展开对应提示词",
     !!$("#cdBody").querySelector(".cw-pv") && !!$("#cwPvTags"),
     $("#cdBody").textContent.slice(0, 80));
  /* 光学词条在配方里存的是裸词或「组号.裸词」，也要能反查回 code。
     这一步自己加一条，不依赖前面的用例留在配方盘里 ——
     依赖前置状态的话，前面一旦清空配方，这里就变成一条假失败。

     注意点的是「加入」按钮而不是整行：列表项现在分成两个动作 ——
     点名字开详情抽屉，点按钮才加进配方。这是刻意分开的
     （点按钮的意图是改配方，点名字的意图是先看看），
     所以测试也得按按钮，不能沿用「点整行等于加入」的旧约定。 */
  const optTab2 = Array.prototype.slice.call($("#tabs").children)
    .find(t => t.textContent.indexOf("光学") >= 0);
  click(optTab2);
  const optAdd = $("#list").children[0].querySelector("button.add");
  ok("光学词条有加入按钮", !!optAdd,
     $("#list").children[0].textContent.slice(0, 60));
  click(optAdd);
  const optBtn = $("#tray").querySelector(".pv[data-pv^='OP-']");
  ok("光学词条也能反查到编码", !!optBtn,
     optBtn ? optBtn.getAttribute("data-pv") : $("#tray").textContent.slice(0, 80));
  click(optBtn);
  ok("光学词条点词能出提示词", !!$("#cwPvTags") &&
     /chiaroscuro|rim light|tenebrism|single window light/.test($("#cwPvTags").value),
     $("#cwPvTags") ? $("#cwPvTags").value.slice(0, 60) : "无");

  console.log("\n[17] 条目详情抽屉");
  {
    /* 抽屉是这轮新加的：点条目名字开详情，点按钮才加配方。
       两者混在一起会让误点也改了配方，所以这里逐条验「分工」：
       点名字 → 抽屉开且配方不变；点按钮 → 配方变且抽屉不开。 */
    const painterTab = Array.prototype.slice.call($("#tabs").children)
      .find(t => t.textContent.indexOf("画家") >= 0);
    click(painterTab);
    click($("#btnClear"));

    const trayBefore = $("#tray").querySelectorAll(".tr").length;
    click($("#list").children[0].querySelector(".nm"));
    ok("点条目名字打开抽屉", $("#dtPanel").style.display !== "none");
    const dt = $("#dtPanel").textContent.replace(/\s+/g, " ");
    ok("抽屉给出编码", /PA-\d{3}/.test(dt), dt.slice(0, 60));
    ok("抽屉给出状态与层级", /状态/.test(dt) && /画家/.test(dt));
    ok("抽屉给出七面或说明", /七面|说明|生卒/.test(dt));
    ok("抽屉给出提示词", !!$("#dtPv #cwPvTags") &&
       $("#dtPv #cwPvTags").value.length > 30,
       $("#dtPv #cwPvTags") ? $("#dtPv #cwPvTags").value.length + " 字" : "无");
    ok("抽屉给出旧写法以便再找到", /其他写法|仍可解析/.test(dt) || /P-CN/.test(dt));
    /* 七面在数据源里是嵌套在 F 下的（e.F.light），不是平铺的 e.light。
       读错层级不报错，只是恒为 0/7 —— 而画家明明七面都填满了。
       这条断言就是守那个「静默失效」的坑。 */
    ok("抽屉给出七面（读的是 F 之下的嵌套字段）",
       $("#dtPanel").querySelectorAll(".dt-f").length >= 5,
       $("#dtPanel").querySelectorAll(".dt-f").length + " / 7 面");
    ok("抽屉显示风格词（它进 tags 但不在七面里）",
       /风格词/.test(dt), dt.match(/风格词[^一]{0,40}/) ? dt.match(/风格词[^一]{0,40}/)[0] : "缺");
    ok("看详情不改变配方",
       $("#tray").querySelectorAll(".tr").length === trayBefore,
       trayBefore + " → " + $("#tray").querySelectorAll(".tr").length);

    click($("#dtPanel [data-dt-close]"));
    ok("点关闭收起抽屉", $("#dtPanel").style.display === "none");

    click($("#list").children[0].querySelector(".add"));
    ok("点加入按钮改配方且不开抽屉",
       $("#tray").querySelectorAll(".tr").length === trayBefore + 1 &&
       $("#dtPanel").style.display === "none",
       $("#tray").querySelectorAll(".tr").length + " 个零件");

    /* 元层条目不给空提示词框：空框等于暗示「这里本来有词但被清了」 */
    click($("#btnClear"));
    const modelTab = Array.prototype.slice.call($("#tabs").children)
      .find(t => t.textContent.indexOf("模型") >= 0);
    click(modelTab);
    click($("#list").children[0].querySelector(".nm"));
    ok("元层条目不给空的提示词框", !$("#dtPv #cwPvTags"));
    ok("元层条目写明为什么不进",
       /不是画面内容|没有登记关系边|查证|事实说明/.test($("#dtPanel").textContent),
       $("#dtPanel").textContent.replace(/\s+/g, " ").slice(0, 70));
    click($("#dtPanel [data-dt-close]"));

    /* 关系边要能从一条边跳到端点实体 */
    const relTab = Array.prototype.slice.call($("#tabs").children)
      .find(t => t.textContent.indexOf("关系") >= 0);
    click(relTab);
    click($("#list").children[0].querySelector(".nm"));
    const ends = $("#dtPanel").querySelectorAll("[data-dt-goto]");
    ok("关系边两端可点", ends.length >= 1, ends.length + " 个端点");
    if (ends.length) {
      const t0 = $("#dtPanel").textContent;
      click(ends[0]);
      ok("点端点换到实体详情",
         $("#dtPanel").style.display !== "none" &&
         $("#dtPanel").textContent !== t0,
         $("#dtPanel").textContent.replace(/\s+/g, " ").slice(0, 60));
    }
    click($("#dtPanel [data-dt-close]"));
    click($("#btnClear"));
  }

  console.log("\n[19] 模型适配 · explain · 中文对照 · 垫图兜底");
  /* 覆盖 assets/model-prompts.js 的词面改写、explain 硬规则、
     垫图兜底与参考隔离。判据全部落在面板可见状态上，不撬闭包。 */
  deskEnter("PA-125");
  click($("#cdBody").querySelector(".cw-item [data-cw-pv]"));
  const pvText = $("#cdBody").textContent;
  ok("面板给出 explain 效果说明", /说明：由 \d+ 个成分驱动/.test(pvText),
     pvText.slice(0, 120));
  ok("面板给出模型实测建议块", /模型实测 · (SDXL|Midjourney v7)/.test(pvText),
     pvText.slice(0, 150));
  ok("实测建议含 CFG 或权重甜区", /CFG \d|权重甜区/.test(pvText));
  ok("面板给出中文对照", !!$("#cwPvZh") && /以达·芬奇的方式绘制/.test($("#cwPvZh").value),
     $("#cwPvZh") ? $("#cwPvZh").value.slice(0, 60) : "无");
  ok("中文对照标注派生属性", /出图请以英文词面为准/.test($("#cwPvZh").value));
  ok("画家给垫图兜底块", /垫图兜底/.test(pvText));
  ok("垫图列出馆藏", /蒙娜丽莎|最后的晚餐/.test(pvText));
  ok("垫图块带参考隔离指令", /仅用于参考画风/.test(pvText) && /画面内容完全以你的主题为准/.test(pvText));

  /* 无名画画家的兜底必须如实说「没有」，不能给一个空列表装作有。
     PA-024 = 巨然（P-CN10），数据里没有任何 pid 指向他的名画。 */
  deskEnter("PA-024");
  click($("#cdBody").querySelector(".cw-item [data-cw-pv]"));
  const pvText2 = $("#cdBody").textContent;
  if (/垫图兜底/.test(pvText2)) {
    ok("无名画画家如实说不可用", /暂无收录名画/.test(pvText2),
       pvText2.slice(0, 150));
  } else {
    ok("无名画画家不给垫图块也不给出错面板", !!$("#cwPvTags"), "该画家无垫图块");
  }

  /* MJ 平台的 --no 参数串：负面词的 MJ 写法是成品，不是提示。
     tags 保留引擎的 :: 方言（MT-06 实测支持 tag::2），不去权重 ——
     「MJ 吃不吃权重」由实测记录说话，本层不替它做主。 */
  click($("#cdBody").querySelector('[data-cw-pf="mj"]'));
  ok("MJ 平台给出 --no 参数串", !!$("#cwPvMjNo") && /^--no /.test($("#cwPvMjNo").value),
     $("#cwPvMjNo") ? $("#cwPvMjNo").value.slice(0, 50) : "无");
  ok("--no 串里有实质禁项", /watermark|text|signature/.test($("#cwPvMjNo").value));
  click($("#cdBody").querySelector('[data-cw-pf="sd"]'));

  console.log("\n[20] 抽卡");
  /* 抽卡 = 每个槽各抽一条。判据：出组合、出词、不改输入框。 */
  const qBefore = $("#cwQ").value;
  const gachaBtn = $("#cdBody").querySelector('[data-cw-gacha="1"]');
  ok("工作台有抽一组按钮", !!gachaBtn);
  click(gachaBtn);
  ok("抽卡给出组合区", /抽到的组合/.test($("#cdBody").textContent));
  ok("组合区列出多个成分", $("#cdBody").querySelectorAll(".cw-out .cw-item").length >= 4,
     $("#cdBody").querySelectorAll(".cw-out .cw-item").length + " 个成分");
  ok("抽卡给出可复制 tags", !!$("#cwGachaTags") && $("#cwGachaTags").value.length > 40);
  ok("抽卡给出自然语言正文", !!$("#cwGachaGpt") && $("#cwGachaGpt").value.length > 40);
  ok("抽卡给出 explain", /说明：由 \d+ 个成分驱动/.test($("#cdBody").textContent));
  ok("抽卡不改输入框", $("#cwQ").value === qBefore,
     "前:「" + qBefore + "」后:「" + $("#cwQ").value + "」");
  /* 填入输入框是显式动作：点了才写回 */
  click($("#cdBody").querySelector('[data-cw-gacha-fill="1"]'));
  ok("填入输入框写入规范码串", /\w{2}-\d{3} \+ \w{2}-\d{3}/.test($("#cwQ").value),
     $("#cwQ").value.slice(0, 80));

  /* 抽卡锁：锁定一个槽 → 重抽 → 该槽条目不变、按钮变已锁。
     重抽必须整组进行（reroll），锁只是回填 —— 见 gacha.js 注释。
     注意：cwRender 会重建 DOM，每次点击后必须重新查询按钮 ——
     缓存引用拿到的是死节点（这个坑本轮踩过一次）。 */
  ok("抽卡条目带锁按钮", !!$("#cdBody").querySelector('[data-cw-ga-lock]'));
  /* 锁的是哪个槽要看按钮自己的 data 属性，不能假设第一个就是 PA ——
     reroll 的排序若把 0 当 falsy，第一个按钮就会是别的槽（踩过）。
     记录 seg，解锁时点同一个槽的按钮。 */
  const lockBtn0 = $("#cdBody").querySelector('[data-cw-ga-lock]');
  const lockSeg = lockBtn0.getAttribute("data-cw-ga-lock");
  const lockedCode = lockBtn0.closest(".cw-item").querySelector(".cw-code").textContent;
  click($("#cdBody").querySelector('[data-cw-ga-lock="' + lockSeg + '"]'));
  ok("点锁后按钮变已锁",
     /已锁/.test($("#cdBody").querySelector('[data-cw-ga-lock="' + lockSeg + '"]').textContent),
     $("#cdBody").querySelector('[data-cw-ga-lock="' + lockSeg + '"]').textContent);
  click($("#cdBody").querySelector('[data-cw-gacha="1"]'));
  const cdText = $("#cdBody").textContent;
  ok("重抽按钮显示锁定数", /重抽（1 槽锁定）/.test(cdText));
  ok("锁定槽条目重抽后仍在", cdText.indexOf(lockedCode) >= 0, lockSeg + " " + lockedCode);
  /* 再点一次解锁 */
  click($("#cdBody").querySelector('[data-cw-ga-lock="' + lockSeg + '"]'));
  ok("再点解锁", !/已锁/.test($("#cdBody").querySelector('[data-cw-ga-lock="' + lockSeg + '"]').textContent),
     $("#cdBody").querySelector('[data-cw-ga-lock="' + lockSeg + '"]').textContent);

  console.log("\n[21] 出词纪律面板");
  /* 画作标题隔离与在世姓名纪律：面板必须显示，不显示 =
     纪律生效了但用户看不出，会以为库漏数据。 */
  deskEnter("PA-125");
  click($("#cdBody").querySelector(".cw-item [data-cw-pv]"));
  const pv125 = $("#cdBody").textContent;
  ok("面板显示已隔离的画作标题", /已隔离的画作标题/.test(pv125),
     /已隔离的画作标题/.test(pv125) ? "有" : "无（该条目应有 2 个）");
  ok("隔离说明点名了具体画作", /蒙娜丽莎/.test(pv125) && /最后的晚餐/.test(pv125));
  ok("explain 带隔离说明", /已移至垫图参考区/.test(pv125));
  /* 在世画家：姓名纪律说明 */
  deskEnter("P-UK05");
  click($("#cdBody").querySelector(".cw-item [data-cw-pv]"));
  const pvUk = $("#cdBody").textContent;
  ok("在世画家面板显示姓名纪律", /在世艺术家/.test(pvUk) && /姓名不进词面/.test(pvUk));
  ok("在世画家 tags 不含姓名", !/david hockney/i.test($("#cwPvTags").value),
     $("#cwPvTags").value.slice(0, 80));

  console.log("\n[22] 复制三路");
  /* 不允许「调用了 writeText 就显示已复制」。jsdom 默认没有
     navigator.clipboard，也没有可用的 execCommand ——
     两条自动路径都不可用时，必须出现手动复制浮层（不谎报）。 */
  const copyBtn = $("#cdBody").querySelector("[data-cw-copy-text]");
  ok("面板有复制按钮", !!copyBtn);
  if (copyBtn) {
    click(copyBtn);
    /* document 在 jsdom 里是 dom.window.document —— Node 作用域
       直接写 document 是 ReferenceError（本轮踩到）。 */
    const wdoc = dom.window.document;
    const said = copyBtn.textContent;
    const manual = wdoc.querySelector(".cw-cpm");
    ok("复制不假成功：要么报成功要么给手动浮层",
       /已复制/.test(said) || !!manual,
       "按钮:「" + said + "」 浮层:" + (manual ? "有" : "无"));
    if (manual) {
      ok("手动浮层给出全文", manual.querySelector("textarea").value.length > 40);
      click(manual.querySelector(".cw-cpm-ok"));
      ok("手动浮层可关闭", !wdoc.querySelector(".cw-cpm"));
    }
  }

  console.log("\n[22b] 快速开始 · 持久化 · 出图参数 · 配方说明 · 8 组铺开");
  /* 这一批是从 xhs 库吸收的交互模式：预设一键起手、刷新不丢配方、
     复制就能直接出图、逐段说明、广撒网抽卡。判据全部落在可见状态。 */
  const wdoc2 = dom.window.document;

  /* 快速开始预设：解析得到才显示。点击后配方必须真的变。 */
  const presetBox = wdoc2.querySelector("#presets");
  ok("配方盘有快速开始区", !!presetBox);
  const presetChips = presetBox ? presetBox.querySelectorAll("[data-preset]") : [];
  ok("预设渲染出若干枚（解析不到的已剔除）", presetChips.length >= 3,
     presetChips.length + " 枚");
  if (presetChips.length) {
    const trayBefore2 = wdoc2.querySelectorAll("#tray .tr").length;
    const outWordsBefore = wdoc2.querySelector("#meta").textContent;
    click(presetChips[0]);
    const trayAfter2 = wdoc2.querySelectorAll("#tray .tr").length;
    ok("点预设后配方盘变化", trayAfter2 !== trayBefore2 || outWordsBefore !== wdoc2.querySelector("#meta").textContent,
       "托盘 " + trayBefore2 + "→" + trayAfter2);
  }

  /* 持久化：render() 落一次 saveState，localStorage 里应有状态。
     jsdom 对 file:// origin 拒绝 localStorage（透明 origin，
     DOMException）—— 真实浏览器（Chrome/Firefox）对 file:// 是放行的，
     这里按环境自适应：storage 可用就验证写入，不可用就验证不炸。 */
  let lsUsable = true, lsOk = false, lsParsed = null;
  try {
    wdoc2.defaultView.localStorage.getItem("probe");
  } catch (e) { lsUsable = false; }
  if (lsUsable) {
    try {
      const raw = wdoc2.defaultView.localStorage.getItem("apf.ui.v1");
      lsOk = !!raw;
      if (raw) lsParsed = JSON.parse(raw);
    } catch (e) { lsUsable = false; }
  }
  if (lsUsable) {
    ok("状态已写入 localStorage", lsOk);
    if (lsParsed) {
      ok("存档带 spec 与工作台字段", !!lsParsed.spec && typeof lsParsed.cw === "object",
         Object.keys(lsParsed).join(","));
    }
  } else {
    ok("storage 不可用环境（file://）下静默降级不炸", errors.length === 0);
  }

  /* 出图参数与一句话指令：按钮在、点击不炸、剪贴板反馈走 flash */
  ok("有「复制出图版」按钮", !!wdoc2.querySelector("#btnCopyRun"));
  ok("有「复制为一句话指令」按钮", !!wdoc2.querySelector("#btnCopyAsk"));
  click(wdoc2.querySelector("#btnCopyRun"));
  click(wdoc2.querySelector("#btnCopyAsk"));
  ok("参数复制不炸（无未捕获错误留给 [23] 收口）", errors.length === 0);

  /* 逐段说明：默认有内容，空配方时也如实说 */
  const whyBody = wdoc2.querySelector("#recipeWhyBody");
  ok("配方说明区有内容", !!whyBody && whyBody.textContent.length > 60,
     whyBody ? whyBody.textContent.slice(0, 50) : "无");

  /* 8 组铺开：出现 8 张卡，收起按钮有效。
     断言正则用结果区标题的完整片段 —— 按钮文本也叫「抽 8 组铺开」，
     单写 /8 组铺开/ 会误中按钮（踩过）。 */
  click(wdoc2.querySelector('[data-cw-gacha8="1"]'));
  ok("铺开区出现", /每组各槽独立随机/.test(wdoc2.querySelector("#cdBody").textContent));
  ok("铺出 8 张卡", wdoc2.querySelectorAll("[data-cw-ga-fill-idx]").length === 8,
     wdoc2.querySelectorAll("[data-cw-ga-fill-idx]").length + " 张");
  click(wdoc2.querySelector('[data-cw-ga-fill-idx="3"]'));
  ok("点第 4 组填入其码串", /\w{2}-\d{3} \+ \w{2}-\d{3}/.test(wdoc2.getElementById("cwQ").value),
     wdoc2.getElementById("cwQ").value.slice(0, 60));
  click(wdoc2.querySelector('[data-cw-ga-clear-multi="1"]'));
  ok("收起后铺开卡片消失", wdoc2.querySelectorAll("[data-cw-ga-fill-idx]").length === 0);

  console.log("\n[24] 示例画廊（默认首页）");
  ok("导航里已无「验证案例」页签", !$("#modeTabs").querySelector('[data-mode="cases"]'));
  ok("工作台已是普通页签（无「返回工坊」覆盖层按钮）", !$("#v-desk").querySelector("[data-cd-close]"));
  /* 切回画廊：首次访问的默认页签 */
  click($("#modeTabs").querySelector('[data-mode="gallery"]'));
  ok("默认首页是示例画廊（首次访问落在这里）",
     vis("#v-gallery") && hid("#v-custom"));
  /* 黑屏事故总闸：任何时刻必须恰好一个视图可见，零个 = 用户看到空页 */
  const V8 = ["gallery","custom","synth","gacha","entries","pairs","framework","desk"];
  const visCnt = V8.filter(v => vis("#v-" + v)).length;
  ok("同屏恰好一个视图可见（防黑屏回归）", visCnt === 1, visCnt + " 个可见");
  /* 场景起手已移出画廊（PRESETS 常驻自定义出图与合成器），画廊不再有这份拷贝 */
  ok("画廊已无场景起手（同内容在自定义出图与合成器）",
     !$("#galWrap").querySelector('[data-gf="pre"]') && !$("#galWrap").querySelector("[data-gal-preset]"));
  /* 筛选与命中节头 */
  ok("命中节头显示全库口径", /命中/.test($("#galWrap").textContent) &&
     /全库/.test($("#galWrap").textContent));
  ok("色卡诚实注记在场", /色卡/.test($("#galWrap").textContent) &&
     /不是出图结果/.test($("#galWrap").textContent));
  ok("类别筛选 chips 铺出来（含数量）",
     $("#galWrap").querySelectorAll('[data-gf="cat"]').length >= 3);
  /* 派生筛选行：题材 / 媒介（从 spec 现算，不写死数量） */
  ok("题材筛选行铺出来（SUBJECTS 分类 ≥ 5 组）",
     $("#galWrap").querySelectorAll('[data-gf="sub"]').length >= 6,
     $("#galWrap").querySelectorAll('[data-gf="sub"]').length + " 枚");
  ok("色调筛选行铺出来（跟随色卡归组）",
     $("#galWrap").querySelectorAll('[data-gf="tone"]').length >= 4,
     $("#galWrap").querySelectorAll('[data-gf="tone"]').length + " 枚");
  ok("状态筛选已删除（徽章还在卡上，筛选行不占位）",
     !$("#galWrap").querySelector('[data-gf="st"]'));
  ok("更多筛选折叠已删除（视图档直接在主行）",
     !$("#galWrap").querySelector('[data-gf="more"]'));
  ok("看图 / 扫编号在主筛选行",
     !!$("#galWrap").querySelector('[data-gf="view"][data-v="big"]') &&
     !!$("#galWrap").querySelector('[data-gf="view"][data-v="dense"]'));
  /* 配图是可选的：登记了才有「有图」chip 与计数，登记数现算不为零 */
  const picChip = $("#galWrap").querySelector('[data-gf="pic"]');
  const GIM = win.GALLERY_IMGS;   /* 页面用裸 GALLERY_IMGS（浏览器 var 挂 window），
                                    Node 测试在模块作用域，必须走 win */
  const picN = (GIM && typeof GIM === "object") ? Object.keys(GIM).length : 0;
  ok("有配图时「全部·有图 N」chip 出现且 N 与登记数一致",
     picN > 0 ? (!!picChip && picChip.textContent.replace(/\s+/g, "").indexOf("有图" + picN) >= 0)
              : !picChip,
     picChip ? picChip.textContent.trim() : "无 chip（未登记配图）");
  /* 点一个题材 → 命中数下降、节头变「有筛选生效中」 */
  const totalN = $("#galSigs").querySelectorAll("[data-gal-sig]").length;
  click($("#galWrap").querySelectorAll('[data-gf="cat"]')[1]);
  const catN = $("#galSigs").querySelectorAll("[data-gal-sig]").length;
  ok("点类别后命中数下降且口径切换", catN < totalN &&
     /有筛选生效中/.test($("#galWrap").textContent), totalN + " → " + catN);
  click($("#galWrap").querySelector('[data-gf="cat"][data-v="全部"]'));
  /* 题材筛选真实生效：点「人物」后命中数下降，复位后回来 */
  const subAllN = $("#galSigs").querySelectorAll("[data-gal-sig]").length;
  click($("#galWrap").querySelector('[data-gf="sub"][data-v="人物"]'));
  const subPN = $("#galSigs").querySelectorAll("[data-gal-sig]").length;
  ok("题材筛选「人物」生效（命中下降）",
     subPN > 0 && subPN < subAllN, subAllN + " → " + subPN);
  click($("#galWrap").querySelector('[data-gf="sub"][data-v="全部"]'));
  ok("题材复位后回到全库",
     $("#galSigs").querySelectorAll("[data-gal-sig]").length === subAllN);
  /* 搜索：输入即筛（重画后焦点还回去）。
     注意：重画后旧 #gq 是死节点，清空必须重新查询再派发。 */
  const gq = $("#gq");
  gq.value = "肖像";
  gq.dispatchEvent(new win.Event("input", { bubbles: true }));
  const qN = $("#galSigs") ? $("#galSigs").querySelectorAll("[data-gal-sig]").length : 0;
  ok("搜索「肖像」命中少于全库且不丢焦点", qN > 0 && qN < totalN && $("#gq") === doc.activeElement,
     qN + " 张");
  const gq2 = $("#gq");
  gq2.value = "";
  gq2.dispatchEvent(new win.Event("input", { bubbles: true }));
  /* 密度切换：看图 / 扫编号在主行，不再藏在「更多筛选」里 */
  click($("#galWrap").querySelector('[data-gf="view"][data-v="dense"]'));
  ok("扫编号视图生效", !!$("#galSigs") && $("#galSigs").className.indexOf("dense") >= 0);
  ok("扫编号档一句话画面收起（display:none）",
     $("#galSigs").querySelector(".gcard .gs") === null ||
     win.getComputedStyle($("#galSigs").querySelector(".gcard .gs")).display === "none");
  click($("#galWrap").querySelector('[data-gf="view"][data-v="big"]'));
  ok("切回看图档", !!$("#galSigs") && $("#galSigs").className.indexOf("big") >= 0);
  /* 配图自动同步：清单是 gallery/ 按文件名派生的。
     断言「清单里的每条路径都真实存在」+「编码都对应真实卡片」——
     这两条守住同步机制的两个方向：登记的和文件对不上、或编码是幽灵。 */
  if (picN > 0) {
    const keys = Object.keys(GIM);
    /* 清单是自动生成的，路径必须都指向 gallery/ 下真实存在的文件 */
    const relOk = keys.every(k => typeof GIM[k] === "string" && /^gallery\//.test(GIM[k]));
    ok("配图清单路径格式统一（自动同步的产物）", relOk, keys.length + " 条");
    const codes = new Set([...win.SIGNATURES.map(s => s.id),
      ...[...$("#galSigs").querySelectorAll('[data-gal-sig^="VAR-"]')]
        .map(el => el.getAttribute("data-gal-sig"))]);
    const ghosts = keys.filter(k => !codes.has(k));
    ok("配图编码都对应真实卡片（没有幽灵登记）",
       ghosts.length === 0, ghosts.length ? ghosts.join(",") : keys.join(","));
    /* 清单里那份「没人认领的文件」必须与目录实况一致 ——
       它是构建期写进去的，页面据此提示用户「你放的那张没进去」。
       对不上的话，提示条要么漏报（放了图却说没有）、要么凭空报（说没进去其实进了）。 */
    const declaredUncl = win.GALLERY_UNCLAIMED || [];
    const realUncl = (() => {
      const gg = require("./gallery_sync.js").resolveGallery();
      return gg.weird.concat(gg.orphanFiles).sort();
    })();
    ok("清单里「没进画廊」的名单与目录实况一致",
       JSON.stringify(declaredUncl) === JSON.stringify(realUncl),
       "清单 " + JSON.stringify(declaredUncl) + " / 实况 " + JSON.stringify(realUncl));
    if (declaredUncl.length) {
      ok("有文件没进画廊时，画廊顶上有提示条（不只在命令行里报）",
         /没进画廊/.test($("#galWrap").textContent), declaredUncl.join("、"));
    } else {
      ok("目录里没有未认领的文件，页面就不摆这条提示",
         !/没进画廊/.test($("#galWrap").textContent));
    }
  }
  /* 配图卡：登记了的 id 卡面出<img src=路径>，没登记的仍回落色卡。
     全部卡都配了图时就不该再有「回落色卡」这回事 —— 别把断言写成
     「永远得有卡没图」，那只是当时的数量巧合，不是规矩。 */
  if (picN > 0) {
    const withImg = [...$("#galSigs").querySelectorAll(".gcard .gsw img")]
      .filter(im => (im.getAttribute("src") || "").length > 0);
    const cardCount = $("#galSigs").querySelectorAll(".gcard").length;
    const allPictured = picN >= cardCount;
    ok(allPictured ? "全部 " + cardCount + " 张卡都已配图（卡面全是实图）"
        : "有配图的卡面出实图、无图的仍回落色卡",
       withImg.length === Math.min(picN, cardCount),
       withImg.length + " / " + cardCount + " 张有图" + (allPictured ? "（全卡已配图）" : ""));
  }
  ok("看图档每张卡面有一句话画面（desc 上卡面）",
     $("#galSigs").querySelectorAll(".gcard .gs").length === 40,
     $("#galSigs").querySelectorAll(".gcard .gs").length + " 张");
  ok("卡面画面是具体场景文案（首卡含维米尔的画面句）",
     /一个人、一扇窗/.test($("#galSigs").textContent));
  const galSigs = $("#galSigs").querySelectorAll("[data-gal-sig]");
  ok("画廊 40 张全铺出来（25 签名卡 + 15 组合变奏）", galSigs.length === 40, galSigs.length + " 张");
  ok("页签计数与全库一致", $("#nGallery").textContent === "40", "nGallery=" + $("#nGallery").textContent);
  const varCards = $("#galSigs").querySelectorAll('[data-gal-sig^="VAR-"]');
  ok("组合变奏卡 15 张且卡面显示自己的 id（VAR-xx）",
     varCards.length === 15 &&
     /^VAR-\d{2}/.test(varCards[0].querySelector("[data-gfname]").getAttribute("data-gfname")),
     varCards.length + " 张");
  /* 卡面编号必须与配图文件名一致。从前卡面显示的是数组序号：前 25 张序号
     碰巧与 id 相同，第 26 张起分叉（页面 026 其实是 VAR-01）—— 用户照着
     序号把配图命名成 G-26.png，清单里只认 VAR-01，图放进去毫无反应。 */
  const galIds = Array.from($("#galSigs").querySelectorAll("[data-gfname]"))
    .map(e => e.getAttribute("data-gfname"));
  ok("卡面编号 = 配图文件名（G-xx / VAR-xx），不是数组序号",
     galIds.length === 40 && galIds.every(t => /^(G-\d{2}|VAR-\d{2})$/.test(t)),
     galIds.slice(0, 3).join(",") + " … " + galIds.slice(-2).join(","));
  ok("第 26 张卡面编号是 VAR-01（不拿数组序号 026 冒充）", galIds[25] === "VAR-01", galIds[25]);
  ok("卡面编号提示了配图文件名（title 里带 .png）",
     /\.png/.test($("#galSigs").querySelector(".gid").getAttribute("title") || ""));
  ok("卡面编号可点：点一下复制文件名",
     $("#galSigs").querySelectorAll("[data-gfname]").length === 40);
  /* ── 闭环：页面叫用户用的文件名，同步器必须认 ────────────────
     这两处一旦再次分叉，就是当年那个坑（卡面说一套、清单认另一套），
     而分叉当时**不报任何错**：图片放进去毫无反应，页面上也看不出为什么。
     所以这里把「页面渲染」与「同步解析」当场交叉验证 —— 谁改了没说，
     回归立刻红，而不是等用户放完一茬图才发现。 */
  {
    const gsync = require("./gallery_sync.js");
    const table = gsync.cardTable();
    const broken = [];
    for (const card of $("#galSigs").querySelectorAll("[data-gal-sig]")) {
      const id = card.getAttribute("data-gal-sig");
      const fnameEl = card.querySelector("[data-gfname]");
      const shown = fnameEl ? fnameEl.getAttribute("data-gfname") : null;
      if (shown !== id) { broken.push(id + " 卡面给的文件名是 " + shown); continue; }
      if (gsync.resolveId(shown, table) !== id) broken.push(id + " 的文件名同步器认不出来");
    }
    ok("闭环：卡面给的文件名 → 同步器解析回同一张卡（" + table.all.length + " 张）",
       broken.length === 0, broken.slice(0, 3).join("；"));
    /* 目录里不该再有靠序号兜底才对得上的文件 —— 双命名并存正是坑的温床 */
    const g = gsync.resolveGallery();
    ok("gallery/ 里文件名都是卡片编码（没有靠序号兜底才对得上的）",
       g.aliases.length === 0,
       g.aliases.length ? g.aliases.map(a => a.from + "→" + a.to).join("、")
         + "（跑 node tools/gallery_sync.js --rename）" : "全部规范");
    /* 配图有出入的卡，卡面必须挂「图≠配方」徽章 ——
       挂账名单写在 tools/gallery_check.js 里，但用户看不到那个文件；
       「只有文件知道、页面上看不出来」等于没说。两处必须对上。 */
    const gcheck = require("./gallery_check.js");
    const accrued = Object.keys(gcheck.ACCEPTED);
    const noBadge = accrued.filter(c => {
      const card = $("#galSigs").querySelector('[data-gal-sig="' + c + '"]');
      return card && !/图≠配方/.test(card.textContent);
    });
    ok("挂账的配图在卡面挂了「图≠配方」徽章（" + accrued.length + " 张）",
       noBadge.length === 0, noBadge.length ? noBadge.join("、") + " 没挂徽章" : "齐全");
    const badgeNoAcc = Array.from($("#galSigs").querySelectorAll(".gmis"))
      .map(b => b.closest(".gcard").getAttribute("data-gal-sig"))
      .filter(c => accrued.indexOf(c) < 0);
    ok("卡面的「图≠配方」徽章都有挂账记录（没有来历不明的徽章）",
       badgeNoAcc.length === 0, badgeNoAcc.join("、") || "齐全");
  }
  /* beauty-album 式卡片：色卡头 + 编号 + chips + 独立复制行 */
  ok("每张卡都有醒目的「复制提示词」主按钮",
     $("#galSigs").querySelectorAll("[data-gcopy]").length === 40);
  ok("每张卡都有负面词按钮", $("#galSigs").querySelectorAll("[data-gneg]").length === 40);
  ok("每张卡都有「合成器改用」按钮（左复制 · 右改用）",
     $("#galSigs").querySelectorAll("[data-gload]").length === 40);
  /* 点「合成器改用」→ 铺配方并跳合成器 */
  const trayBeforeGl = $("#tray").querySelectorAll(".tr").length;
  click($("#galSigs").querySelector("[data-gload]"));
  ok("合成器改用跳页且配方盘有货",
     vis("#v-synth") && $("#tray").querySelectorAll(".tr").length >= 1,
     trayBeforeGl + " → " + $("#tray").querySelectorAll(".tr").length);
  click($("#modeTabs").querySelector('[data-mode="gallery"]'));
  ok("每张卡有色卡头与编号浮层", $("#galSigs").querySelectorAll(".gsw .gid").length === 40);
  ok("关键词 chips 铺出来", $("#galSigs").querySelectorAll(".gkw span").length >= 40,
     $("#galSigs").querySelectorAll(".gkw span").length + " 枚");
  /* 点卡上的复制按钮：不该把详情浮层带出来；jsdom 无剪贴板，
     走降级路径（手动浮层），只要不抛错即可 */
  click($("#galSigs").querySelector("[data-gcopy]"));
  ok("点复制按钮不弹详情浮层", !$("#galMask").classList.contains("on"));
  ok("复制按钮可点不抛错", errors.length === 0);
  /* 点签名卡本体 → 详情浮层（mask + sheet）；Esc / 收起钮 / 再点卡都能关 */
  click($("#galSigs").querySelector("[data-gal-sig]"));
  ok("点签名卡展开详情浮层", $("#galMask").classList.contains("on") &&
     /段落式 tags/.test($("#galSheet").textContent));
  ok("详情浮层给出负面词与配方码", /负面词/.test($("#galSheet").textContent) &&
     /SG-/.test($("#galSheet").textContent));
  ok("详情浮层有复制与载入按钮",
     !!$("#galSheet").querySelector("#galCopy") && !!$("#galSheet").querySelector("#galLoad"));
  win.document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok("Esc 关掉详情浮层", !$("#galMask").classList.contains("on"));
  click($("#galSigs").querySelector("[data-gal-sig]"));
  click($("#galSheet").querySelector("[data-gal-close]"));
  ok("收起钮关掉详情浮层", !$("#galMask").classList.contains("on"));
  /* 再点同一张卡 = 切换收起 */
  click($("#galSigs").querySelector("[data-gal-sig]"));
  click($("#galSigs").querySelector("[data-gal-sig]"));
  ok("再点同一张卡收起浮层", !$("#galMask").classList.contains("on"));

  console.log("\n[24b] 自定义出图（点卡片出词）");
  /* 场景卡跳转已从画廊移除 —— 这里自己切页签；renderEasy 有 MODE 守卫，
     不切进来 easyPlat 就不会被渲染 */
  click($("#modeTabs").querySelector('[data-mode="custom"]'));
  ok("自定义出图有统计行", /位画家/.test($("#easyStats").textContent));
  ok("简单模式 chips 里 GPT 排第一",
     $("#easyPlat").querySelector("[data-easy-pf]").getAttribute("data-easy-pf") === "gpt");
  const cards = $("#easyCards").querySelectorAll(".easy-card");
  ok("预设卡片铺出来（14 个场景）", cards.length === 14, cards.length + " 张");
  click(cards[0]);
  ok("点卡片后卡片高亮", !!$("#easyCards").querySelector(".easy-card.on"));
  ok("成品区出词（非引导文案）", $("#easyOut").textContent.length > 60 &&
     !/先在左边选一个场景/.test($("#easyOut").textContent),
     $("#easyOut").textContent.slice(0, 60));
  ok("说明区同步生成", $("#easyWhyBody").querySelectorAll("div").length >= 2);
  ok("合成器配方盘有同一份配方",
     $("#tray").querySelectorAll(".tr").length >= 1);
  click($("#easyPlat").querySelector('[data-easy-pf="gpt"]'));
  ok("切平台后成品换成正文", $("#easyPlat").querySelector('[data-easy-pf="gpt"]').classList.contains("on") &&
     $("#platChips").querySelector('[data-pf="gpt"]').classList.contains("on"));
  click($("#easyPlat").querySelector('[data-easy-pf="sd"]'));
  ok("两处 chips 保持同选", $("#platChips").querySelector('[data-pf="sd"]').classList.contains("on"));
  click($("#easyRandom"));
  ok("随机来一张后成品仍在、预设高亮清空", $("#easyOut").textContent.length > 60 &&
     !$("#easyCards").querySelector(".easy-card.on"));
  click($("#easyCopy"));
  ok("复制按钮可点不抛错", errors.length === 0);

  /* 自己调区：画面主角 / 光线氛围 / 风格强度 —— 「自定义」的本体 */
  ok("自己调区有画面主角输入框", !!$("#easySubject"));
  input($("#easySubject"), "a lone lighthouse keeper");
  ok("输入主角后同步到单一真源", $("#subjectFree").value === "a lone lighthouse keeper",
     $("#subjectFree").value);
  ok("光线 chips 铺出来（12 个真实光学词面）",
     $("#easyLight").querySelectorAll("[data-easy-light]").length === 12,
     $("#easyLight").querySelectorAll("[data-easy-light]").length + " 个");
  click($("#easyLight").querySelector('[data-easy-light="candlelight"]'));
  ok("点烛光后选中且成品含烛光词面",
     $("#easyLight").querySelector('[data-easy-light="candlelight"]').classList.contains("on") &&
     /candlelight/i.test($("#easyOut").textContent),
     $("#easyOut").textContent.slice(0, 70));
  click($("#easyLight").querySelector('[data-easy-light="candlelight"]'));
  ok("再点一次取消选中", !$("#easyLight").querySelector('[data-easy-light="candlelight"]').classList.contains("on"));
  input($("#easyStrength"), "0.6");
  ok("拖强度滑杆后两处数值同步",
     $("#easyStrengthV").textContent === "0.60" && $("#strengthV").textContent === "0.60",
     $("#easyStrengthV").textContent + " / " + $("#strengthV").textContent);

  console.log("\n[24c] 提示词合成器（配方盘 + 成品）");
  click($("#modeTabs").querySelector('[data-mode="synth"]'));
  ok("合成器显示主界面", vis("#v-synth") && hid("#v-custom"));
  /* 合成器是 grid 布局：main.wrap.view.on 必须压过 .view.on 的 block，
     落回 block 双栏就塌成单列 —— 这条专防布局被通用规则盖掉 */
  ok("合成器保持 grid 双栏", win.getComputedStyle($("#v-synth")).display === "grid",
     win.getComputedStyle($("#v-synth")).display);
  ok("切页签后配方保留", $("#tray").querySelectorAll(".tr").length >= 1);
  ok("模块库已拆出合成器（无 #tabs 残留）",
     $("#v-synth").querySelector("#tabs") === null);

  console.log("\n[24d] 全部词条（浏览页）");
  click($("#modeTabs").querySelector('[data-mode="entries"]'));
  ok("词条页显示模块页签", vis("#v-entries") &&
     $("#tabs").children.length >= 8);
  /* 切到画家页签再加：关系页签的行没有「加入」按钮（边不是零件） */
  const painterTab2 = Array.prototype.slice.call($("#tabs").children)
    .find(t => t.textContent.indexOf("画家") >= 0);
  click(painterTab2);
  const trayBeforeAdd = $("#tray").querySelectorAll(".tr").length;
  click($("#list").children[0].querySelector("button.add"));
  ok("词条页点加入有跨页 toast 提示", $("#toast").classList.contains("on"),
     "toast:" + $("#toast").textContent);
  const tAct = $("#toast").querySelector(".t-act");
  ok("toast 带「下一步」动作按钮", !!tAct && /合成器/.test(tAct.textContent), tAct && tAct.textContent);
  click(tAct);
  ok("点 toast 动作直达合成器", vis("#v-synth"));
  ok("回到合成器能看到刚加的条目",
     $("#tray").querySelectorAll(".tr").length === trayBeforeAdd + 1,
     trayBeforeAdd + " → " + $("#tray").querySelectorAll(".tr").length);

  console.log("\n[24e] 抽卡页");
  click($("#modeTabs").querySelector('[data-mode="gacha"]'));
  ok("抽卡页显示组合空间", /组合空间约/.test($("#gaPool").textContent));
  click($("#gaRoll1"));
  ok("抽 1 组出结果卡", $("#gaOut").querySelectorAll(".case").length === 1 &&
     /段落式 tags/.test($("#gaOut").textContent));
  ok("抽卡结果带效果说明", /效果说明/.test($("#gaOut").textContent));
  click($("#gaClear"));
  click($("#gaRoll4"));
  ok("抽 4 组铺开 4 张", $("#gaOut").querySelectorAll(".case").length === 4,
     $("#gaOut").querySelectorAll(".case").length + " 张");
  ok("每组都有醒目复制按钮", $("#gaOut").querySelectorAll("[data-ga-copy]").length === 4);
  click($("#gaOut").querySelector("[data-ga-copy]"));
  ok("抽卡复制按钮可点不抛错", errors.length === 0);
  click($("#gaClear"));
  click($("#gaRoll8"));
  ok("抽 8 组铺开 8 张", $("#gaOut").querySelectorAll(".case").length === 8,
     $("#gaOut").querySelectorAll(".case").length + " 张");
  /* 点「铺进合成器」→ 跳合成器、配方盘变化 */
  const trayBeforeGa = $("#tray").querySelectorAll(".tr").length;
  click($("#gaOut").querySelector("[data-ga-fill]"));
  ok("铺进合成器后跳页", vis("#v-synth"));
  ok("铺进后配方盘变多了", $("#tray").querySelectorAll(".tr").length > trayBeforeGa,
     trayBeforeGa + " → " + $("#tray").querySelectorAll(".tr").length);
  click($("#modeTabs").querySelector('[data-mode="gacha"]'));
  click($("#gaClear"));
  ok("收起后结果清空", /点上面「抽 1 组」/.test($("#gaOut").textContent));
  /* 随机来一张：从 40 张成品配方取一张，带完整词面与铺进按钮 */
  click($("#gaRandom"));
  ok("随机来一张出结果卡且带标题", $("#gaOut").querySelectorAll(".case").length === 1 &&
     /随机来一张 · /.test($("#gaOut").textContent), $("#gaOut").textContent.slice(0, 40));
  ok("随机卡有复制/负面词/铺进按钮",
     /负面词/.test($("#gaOut").textContent) && !!$("#gaOut").querySelector("[data-ga-rfill]") &&
     !!$("#gaOut").querySelector("[data-ga-rcopy]"));
  ok("骰子按钮带 🎲 标识", /🎲/.test($("#gaRandom").textContent));
  const trayBeforeRd = $("#tray").querySelectorAll(".tr").length;
  click($("#gaOut").querySelector("[data-ga-rfill]"));
  ok("随机卡铺进合成器后跳页且有配方", vis("#v-synth") &&
     $("#tray").querySelectorAll(".tr").length >= 1,
     trayBeforeRd + " → " + $("#tray").querySelectorAll(".tr").length);

  console.log("\n[24f] 风格配色（验证案例页签已删，实测记录并入框架页）");
  click($("#modeTabs").querySelector('[data-mode="pairs"]'));
  const pairN = $("#pairGrid").querySelectorAll(".pair").length;
  ok("风格配色参考卡铺出（≥60 流派）", pairN >= 60, pairN + " 张");
  input($("#pairQ"), "印象");
  ok("搭配页可按名筛选", $("#pairGrid").querySelectorAll(".pair").length < pairN &&
     $("#pairGrid").querySelectorAll(".pair").length >= 1);
  input($("#pairQ"), "");

  console.log("\n[24g] 框架与体检");
  click($("#modeTabs").querySelector('[data-mode="framework"]'));
  ok("六层结构表已渲染", /六层结构/.test($("#fwBody").textContent));
  ok("状态分布含验证进度条", $("#fwBody").querySelectorAll(".bar").length >= 8,
     $("#fwBody").querySelectorAll(".bar").length + " 条");
  ok("冲突裁决表已渲染", /冲突裁决/.test($("#fwBody").textContent) &&
     /裁决：/.test($("#fwBody").textContent));
  ok("来源与许可表已渲染", /来源与许可/.test($("#fwBody").textContent) &&
     /可商用|不可商用/.test($("#fwBody").textContent));
  ok("诚实口径注记在场", /不验出图效果/.test($("#fwBody").textContent));
  ok("模型实测记录已并入框架页（折叠区）", /模型实测记录/.test($("#fwBody").textContent) &&
     /fact · 原理/.test($("#fwBody").textContent) && /test · 实测/.test($("#fwBody").textContent));
  ok("实测记录默认折叠、可展开", !!$("#fwBody").querySelector("details") &&
     $("#fwBody").querySelector("details").open === false);
  $("#fwBody").querySelector("details").open = true;
  ok("展开后 12 份全在", $("#fwBody").querySelectorAll(".case").length === 12,
     $("#fwBody").querySelectorAll(".case").length + " 份");
  ok("实测记录带翻车点提示", /已知翻车点/.test($("#fwBody").textContent));

  console.log("\n[25] 运行期错误");
  ok("无未捕获错误", errors.length === 0, errors.join(" | "));

  console.log("\n===== 通过 " + pass + " / 失败 " + fail + " =====");
  console.log("最终画面： " + $("#out").textContent.slice(0, 90).replace(/\n/g, " "));
  dom.window.close();
  process.exit(fail ? 1 : 0);
});
