/* ============================================================
 * code-ui.js · 编码工作台视图
 * ============================================================
 * 用户的原话：「没有 Web UI 怎么查看类型？」
 *   以及「二二组合或是多个组合可以直接引用编码，或是中文名」
 *
 * 这个视图把那两句话变成可操作的东西，三个区域：
 *
 *   ① 组合输入框
 *      可以写  PA-125 + 明暗对照 + 单侧窗光 + OP-004
 *      也可以写  达·芬奇 + Caravaggio + P-IT07（旧 ID）+ chiaroscuro（英文）
 *      回车后逐项解析：命中就列规范编码 + 中文名 + 所属层
 *      没命中就把「为什么没命中」和最接近的候选一起摆出来
 *      绝不静默跳过 —— 那会让用户以为整串都对了
 *
 *   ② 段码总表
 *      回答「这个库里到底有哪些类型、各有多少条、哪些能直接进提示词」。
 *      点任一段码展开该段全部条目，编码一键复制。
 *
 *   ③ 产出区
 *      规范组合串（可粘进别的工具，也可存下来复用）
 *      解析出的 spec（能直接喂给引擎）
 *
 * 依赖全局：CODES / RESOLVER / REGISTRY（由 registry.js 登记好）
 * ============================================================ */

/* ---------- 本视图状态（独立于主界面的 cur，避免互相污染） ---------- */
var CW = {
  q: "",
  last: null,          /* 上一次 resolveMany 的结果 */
  openSeg: null,       /* 段码总表里当前展开的段 */
  browse: "",          /* 展开段内的筛选词 */
  filterKind: "all",   /* 段码总表的层级过滤 */
  /* 「这条编码对应几段词」的查看面板。
     open 为当前展开的编码，null 表示收起。
     pf   为该面板的平台 —— 同一份词面在 sd / mj / flux 上写法不同，
     不让用户自己套括号括号的话，复制出去的东西在别的平台上直接跑不通。 */
  open: null,
  pf: "sd",
  /* 抽卡结果。独立对象，不写回 CW.q —— 「填入输入框」是显式动作，
     抽卡本身绝不改用户正在编辑的组合串。 */
  gacha: null,
  /* 抽卡锁：{ 段码: true }。锁定的槽在重抽时整组重抽后回填 ——
     「只换一个槽」的正确实现（见 GACHA.reroll 注释：组合合法性是
     整体性质，单槽重抽会绕过后补上的冲突护栏）。 */
  gaLocks: {},
  /* 多组铺开的结果数组。与 gacha 独立：锁住单组不等于要清掉铺开。 */
  gachaMulti: null
};
var CW_PLATFORMS = [
  { k: "sd",   zh: "SD",   hint: "(词:1.00)" },
  { k: "mj",   zh: "MJ",   hint: "词::1.00" },
  { k: "flux", zh: "Flux", hint: "词 词（重复即强调）" },
  { k: "gpt",  zh: "自然语言", hint: "裸词" }
];

/* ---------- 渲染钩子 ----------
   code-ui 不认识主界面，也不该认识。它只管产出 HTML 与改状态，
   「重绘」这件事交给宿主用 cwRender() 接上。这样这个视图将来
   接到别的页面（比如单独的编码查询页）不用改一行。 */
function cwRender() {
  if (typeof cwHostRender === "function") cwHostRender();
}

/* ---------- 注入样式 ---------- */
/* Node 下没有 document。本文件是纯浏览器视图，工具脚本只 import 它
   用来读 cwRender 这类钩子的存在性，不需要它真的能跑起来。
   所以这里直接跳过样式注入，其余代码不碰 DOM 也就不会炸 ——
   与其在每个工具里 try/catch，不如让它在无 DOM 时安静地不做事。 */
(function injectCodeCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cw-css")) return;
  var s = document.createElement("style");
  s.id = "cw-css";
  s.textContent = [
    ".cw-in{display:flex;gap:8px;align-items:stretch;margin-bottom:10px;flex-wrap:wrap}",
    ".cw-in textarea{flex:1;min-width:240px;min-height:58px;resize:vertical;",
    "  background:var(--panel2);border:1px solid var(--line);border-radius:8px;",
    "  color:var(--txt);padding:9px 11px;font-size:12.5px;line-height:1.6;",
    "  font-family:ui-monospace,Consolas,monospace}",
    ".cw-in textarea:focus{outline:none;border-color:var(--accent)}",
    ".cw-hint{font-size:11.5px;color:var(--dim2);line-height:1.85;margin-bottom:12px}",
    ".cw-hint code{background:var(--panel2);padding:1px 6px;border-radius:4px;",
    "  font-family:ui-monospace,Consolas,monospace;font-size:11px;",
    "  border:1px solid var(--line)}",
    ".cw-hint b{color:var(--accent);cursor:pointer;font-weight:500}",
    ".cw-hint b:hover{text-decoration:underline}",
    ".cw-list{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}",
    ".cw-item{display:flex;gap:9px;align-items:flex-start;padding:8px 10px;",
    "  background:var(--panel2);border:1px solid var(--line);border-radius:8px;font-size:12.5px}",
    ".cw-code{flex:none;font-family:ui-monospace,Consolas,monospace;font-size:11px;",
    "  padding:2px 7px;border-radius:5px;white-space:nowrap;cursor:pointer;",
    "  border:1px solid var(--line);background:var(--panel)}",
    ".cw-code:hover{border-color:var(--accent)}",
    ".cw-main{flex:1;min-width:0}",
    ".cw-zh{font-weight:600;margin-bottom:2px}",
    ".cw-meta{font-size:11px;color:var(--dim2);line-height:1.7}",
    ".cw-kind{flex:none;font-size:10.5px;padding:2px 7px;border-radius:10px;white-space:nowrap;",
    "  border:1px solid var(--line);color:var(--dim)}",
    ".cw-bad{border-color:var(--warn)}",
    ".cw-bad .cw-code{color:var(--warn);cursor:default}",
    ".cw-why{font-size:11.5px;color:var(--warn);line-height:1.7}",
    ".cw-cand{margin-top:4px;font-size:11px;color:var(--dim2);line-height:1.8}",
    ".cw-cand b{font-family:ui-monospace,Consolas,monospace;cursor:pointer;",
    "  font-weight:500;margin-right:8px}",
    ".cw-cand b:hover{text-decoration:underline}",
    ".cw-shadow{margin-top:3px;font-size:10.5px;color:var(--dim2);line-height:1.7}",
    ".cw-out{background:var(--panel2);border:1px solid var(--line);border-radius:8px;",
    "  padding:9px 11px;margin-bottom:9px}",
    ".cw-out-t{font-size:10.5px;color:var(--dim2);margin-bottom:5px;letter-spacing:.04em}",
    ".cw-out textarea{width:100%;min-height:52px;background:transparent;border:0;",
    "  color:var(--txt);font-size:12px;line-height:1.75;resize:vertical;",
    "  font-family:ui-monospace,Consolas,monospace}",
    ".cw-empty{color:var(--dim2);font-size:12.5px;padding:20px 0;text-align:center;line-height:2}",
    /* 段码总表 */
    ".cw-segs{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));",
    "  gap:7px;margin-bottom:12px}",
    ".cw-seg{border:1px solid var(--line);background:var(--panel2);border-radius:8px;",
    "  padding:9px 11px;cursor:pointer;text-align:left;color:var(--txt)}",
    ".cw-seg:hover{border-color:var(--accent)}",
    ".cw-seg.on{border-color:var(--accent);background:var(--panel)}",
    ".cw-seg-h{display:flex;align-items:baseline;gap:6px;margin-bottom:3px}",
    ".cw-seg-code{font-family:ui-monospace,Consolas,monospace;font-size:11.5px;color:var(--accent)}",
    ".cw-seg-zh{font-size:12.5px;font-weight:600}",
    ".cw-seg-n{margin-left:auto;font-size:11px;color:var(--dim2)}",
    ".cw-seg-d{font-size:10.5px;color:var(--dim2);line-height:1.6}",
    ".cw-seg-k{font-size:10px;color:var(--dim2);margin-top:4px;line-height:1.6}",
    ".cw-seg-k em{font-style:normal;color:var(--ok)}",
    ".cw-rows{max-height:340px;overflow:auto;border:1px solid var(--line);",
    "  border-radius:8px;background:var(--panel2)}",
    ".cw-row{display:flex;gap:9px;align-items:center;padding:5px 10px;font-size:12px;",
    "  border-bottom:1px solid var(--line)}",
    ".cw-row:last-child{border-bottom:0}",
    ".cw-row:hover{background:var(--panel)}",
    ".cw-row .cw-code{min-width:88px;text-align:center}",
    ".cw-row-zh{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".cw-row-k{font-size:10.5px;color:var(--dim2);white-space:nowrap}",
    ".cw-sub{font-size:11px;color:var(--dim2);margin:10px 0 6px;line-height:1.7}",
    /* 单条提示词面板 */
    ".cw-pv-btn{flex:none;font-size:10.5px;padding:1px 7px;border-radius:9px;cursor:pointer;",
    "  border:1px solid var(--line);color:var(--dim);background:transparent;white-space:nowrap}",
    ".cw-pv-btn:hover{border-color:var(--accent);color:var(--accent)}",
    ".cw-pv-btn.on{border-color:var(--accent);color:var(--accent);background:var(--panel)}",
    ".cw-pv{margin:8px 0 14px;border:1px solid var(--line);border-radius:9px;",
    "  background:var(--panel2);overflow:hidden}",
    ".cw-pv-h{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:9px 11px;",
    "  border-bottom:1px solid var(--line);background:var(--panel)}",
    ".cw-pv-t{font-size:12.5px;font-weight:600}",
    ".cw-pv-g{font-size:10px;padding:1px 7px;border-radius:9px;border:1px solid var(--line);",
    "  color:var(--dim2);white-space:nowrap}",
    ".cw-pv-g.full{color:var(--ok);border-color:var(--ok)}",
    ".cw-pv-g.part{color:var(--warn);border-color:var(--warn)}",
    ".cw-pv-pf{margin-left:auto;display:flex;gap:3px}",
    ".cw-pv-pf button{font-size:10.5px;padding:2px 7px;border-radius:6px;cursor:pointer;",
    "  border:1px solid var(--line);background:transparent;color:var(--dim)}",
    ".cw-pv-pf button.on{border-color:var(--accent);color:var(--accent)}",
    ".cw-pv-b{padding:9px 11px;border-bottom:1px solid var(--line)}",
    ".cw-pv-b:last-child{border-bottom:0}",
    ".cw-pv-l{font-size:10.5px;color:var(--dim2);margin-bottom:4px;letter-spacing:.04em;",
    "  display:flex;align-items:center;gap:8px}",
    ".cw-pv-l b{font-weight:500;color:var(--txt)}",
    ".cw-pv-l em{font-style:normal;font-family:ui-monospace,Consolas,monospace}",
    ".cw-pv-x{font-size:10.5px;padding:1px 7px;border-radius:6px;cursor:pointer;",
    "  border:1px solid var(--line);color:var(--dim2);background:transparent}",
    ".cw-pv-x:hover{border-color:var(--accent);color:var(--accent)}",
    ".cw-pv textarea{width:100%;background:transparent;border:0;color:var(--txt);",
    "  font-size:11.5px;line-height:1.8;resize:vertical;",
    "  font-family:ui-monospace,Consolas,monospace}",
    ".cw-pv .cw-why{color:var(--warn)}",
    ".cw-pv-note{font-size:11px;color:var(--dim2);line-height:1.8;padding:8px 11px;",
    "  border-top:1px solid var(--line)}",
    ".cw-model-note{font-size:11px;color:var(--dim2);line-height:1.85;padding:2px 11px 6px;}",
    /* 复制三路的最后一路：手动复制浮层。只有两条自动路径都失败才出现 ——
       出现即说明环境真的写不进剪贴板，此时谎报「已复制」最贵。 */
    ".cw-cpm{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.4);",
    "  display:flex;align-items:center;justify-content:center;padding:24px}",
    ".cw-cpm>div{background:var(--bg,#fff);border:1px solid var(--line);",
    "  border-radius:12px;max-width:640px;width:100%;max-height:82vh;",
    "  display:flex;flex-direction:column;overflow:hidden}",
    ".cw-cpm h4{margin:0;padding:12px 16px;font-size:13px;font-weight:500;",
    "  border-bottom:1px solid var(--line)}",
    ".cw-cpm p{margin:0;padding:10px 16px 0;font-size:11.5px;color:var(--dim2);line-height:1.7}",
    ".cw-cpm textarea{margin:10px 16px;flex:1;min-height:180px;resize:vertical;",
    "  font-size:11.5px;line-height:1.7;padding:10px;",
    "  font-family:ui-monospace,Consolas,monospace}",
    ".cw-cpm .row{display:flex;justify-content:flex-end;gap:8px;padding:0 16px 14px}",
  ].join("");
  document.head.appendChild(s);
})();

/* ---------- 工具 ---------- */
/* 复制三路。为什么不能「调用了 writeText 就显示已复制」：
   writeText 返回 Promise，「调用了」不等于「写进去了」。
   file:// 下部分浏览器 clipboard 写入会被拒，此时显示成功 =
   用户看到成功、剪贴板里是空的、没有任何东西会报错 ——
   这种失败没有症状，会被一直当成「模型不行」。
   三路走完才说话：写入成功 → 报成功；被拒/不存在 → 回落
   execCommand（双击打开的真实路径）；两条都失败 → 弹手动
   复制浮层，全文摊开并全选好，按 Ctrl+C 即可。
   第三条不是多余的：这几百字的词是现算的，界面上本来没有全文，
   只提示「复制失败」等于让人手打。 */
function cwCopy(text, btn, okLabel) {
  var done = function () {
    if (!btn) return;
    var old = btn.textContent;
    btn.textContent = okLabel || "已复制";
    setTimeout(function () { btn.textContent = old; }, 900);
  };
  var manual = function () { cwManualCopy(text); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { legacy(); });
  } else {
    legacy();
  }
  function legacy() {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      var okd = document.execCommand("copy");
      document.body.removeChild(ta);
      if (okd) done(); else manual();
    } catch (e) { manual(); }
  }
}
/* 手动复制浮层：全文 + 自动全选。每次现建现毁，不留在 DOM 里。 */
function cwManualCopy(text) {
  var old = document.querySelector(".cw-cpm");
  if (old) old.remove();
  var mask = document.createElement("div");
  mask.className = "cw-cpm";
  mask.innerHTML = '<div><h4>自动复制失败 · 请手动复制</h4>'
    + '<p>当前环境写不进剪贴板（常见于 file:// 协议或浏览器权限被拒）。'
    + '全文已在下方全选，按 Ctrl+C（macOS 用 Cmd+C）即可。</p>'
    + '<textarea readonly></textarea>'
    + '<div class="row"><button class="cw-cpm-ok" type="button">好了</button></div></div>';
  var ta = mask.querySelector("textarea");
  ta.value = text;
  document.body.appendChild(mask);
  ta.focus(); ta.select();
  mask.querySelector(".cw-cpm-ok").addEventListener("click", function () {
    mask.remove();
  });
  mask.addEventListener("click", function (e) {
    if (e.target === mask) mask.remove();
  });
}
function cwEsc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function cwKIND(k) {
  return (REGISTRY && REGISTRY.KIND_ZH[k]) || k || "";
}
/* 段码 → 中文段名 */
function cwSegZh(seg) {
  var all = (REGISTRY && REGISTRY.SEGMENTS) || [];
  for (var i = 0; i < all.length; i++) if (all[i].code === seg) return all[i].zh;
  return "";
}

/* ============================================================
 * 单条提示词面板
 * ============================================================
 * 用户的原话：「每一个名称或是编码对应的提示词怎么没有？web UI 也没有？」
 *
 * 之前这个工作台只回答「这条是什么」，不回答「这条能出几段词」。
 * spec JSON 是给引擎吃的中间态，不是能粘进 SD 的提示词 ——
 * 用户要的是后者，所以这里直接把引擎的产物端上来。
 *
 * 面板只做展示，取词一律走 PROMPTS.of() → FORGE.compose()，
 * 本文件不拼任何一个词。理由写在 prompts.js 头部。
 * ============================================================ */

/* 平台切换条：同一份词面在四个平台上写法不同，
   不标出来用户复制出去在别的平台上直接跑不通。 */
function cwPfBar(cur) {
  return '<span class="cw-pv-pf">' + CW_PLATFORMS.map(function (p) {
    return '<button data-cw-pf="' + p.k + '" class="' + (cur === p.k ? "on" : "") +
      '" title="' + cwEsc(p.hint) + '">' + cwEsc(p.zh) + '</button>';
  }).join("") + '</span>';
}

/* 一个可复制的文本块。id 供复制按钮定位 */
function cwPvBlock(id, label, hint, text) {
  return '<div class="cw-pv-b"><div class="cw-pv-l"><b>' + cwEsc(label) + '</b>'
    + (hint ? '<em>' + cwEsc(hint) + '</em>' : '')
    + '<span class="cw-pv-x" data-cw-copy-text="' + id + '">复制</span></div>'
    + '<textarea id="' + id + '" readonly rows="3">' + cwEsc(text) + '</textarea></div>';
}

function cwPromptPanel(code) {
  if (typeof PROMPTS === "undefined" || !PROMPTS) {
    return '<div class="cw-pv"><div class="cw-pv-note">'
      + '提示词层未加载：prompts.js 需要在 registry.js 之后引入。</div></div>';
  }
  var p = PROMPTS.of(code, { platform: CW.pf });
  if (!p) {
    return '<div class="cw-pv"><div class="cw-pv-note cw-why">'
      + '库里没有编码 ' + cwEsc(code) + '。</div></div>';
  }

  var head = '<div class="cw-pv-h">'
    + '<span class="cw-code" data-cw-copy="' + cwEsc(p.code) + '" title="点击复制">'
    + cwEsc(p.code) + '</span>'
    + '<span class="cw-pv-t">' + cwEsc(p.zh) + '</span>'
    + '<span class="cw-pv-g ' + cwEsc(p.grade) + '">' + cwEsc(p.gradeZh) + '</span>'
    + '<span class="cw-pv-g">' + cwEsc(p.kindZh) + '</span>'
    + cwPfBar(CW.pf)
    + '</div>';

  /* 不进提示词的条目：给原因，不给空文本框。
     给一个空框等于说「这里本来有词但被清了」，那是误导。 */
  if (p.grade === "none") {
    return '<div class="cw-pv">' + head
      + '<div class="cw-pv-b"><div class="cw-why">' + cwEsc(p.why) + '</div></div>'
      + (p.note ? '<div class="cw-pv-note">' + cwEsc(p.note) + '</div>' : '')
      + '</div>';
  }

  if (!p.solo || p.solo.error) {
    return '<div class="cw-pv">' + head
      + '<div class="cw-pv-b"><div class="cw-why">'
      + '取词失败：' + cwEsc(p.solo && p.solo.error || "未知原因") + '</div></div></div>';
  }

  var b = "";
  /* explain 是转述的最低配：先把「这段词面会怎样」说清楚，再给词面本身。 */
  if (p.explain) {
    b += '<div class="cw-pv-b"><div class="cw-why">说明：' + cwEsc(p.explain) + '</div></div>';
  }
  b += cwPvBlock("cwPvTags", "段落式 tags", p.solo.words + " 词",
    p.solo.tags);
  b += cwPvBlock("cwPvNeg", "负面词 negative", "固定进负面通道",
    p.solo.neg);
  b += cwPvBlock("cwPvGpt", "自然语言正文", "GPT / 图像类模型",
    p.solo.gpt);

  /* ---------- 模型实测建议与词面改写（assets/model-prompts.js）----------
     平台切换只改了权重语法；各模型对三件套的取舍不同，
     不写出来用户会把 tags+neg 原样粘进 Flux，然后得出「库不行」的结论。 */
  if (typeof MODEL_PROMPTS !== "undefined" && MODEL_PROMPTS) {
    var mp = MODEL_PROMPTS.adapt(p.solo, MODEL_PROMPTS.modelOf(CW.pf));
    if (mp) {
      b += '<div class="cw-pv-b"><div class="cw-pv-l"><b>模型实测 · ' + cwEsc(mp.zh)
        + '</b><em>策略：' + cwEsc(mp.status === "tested" ? "已实测" : "未实测（written）")
        + '</em></div>'
        + '<div class="cw-model-note">' + mp.advice.map(function (a) {
            return '<div>· ' + cwEsc(a) + '</div>';
          }).join("") + '</div></div>';
      /* MJ 的负面词已经改写成 --no 串 —— 这是能直接粘的成品，值得单独给一块 */
      if (mp.extra) {
        b += cwPvBlock("cwPvMjNo", "MJ 参数串", "追加在提示词末尾", mp.extra);
      }
      mp.note.forEach(function (n) {
        b += '<div class="cw-pv-note">' + cwEsc(n) + '</div>';
      });
    }
  }

  /* ---------- 垫图兜底 -----------
     画家的名字激活不稳时，垫一张真迹是最强手段；
     但必须配隔离指令，否则模型把名画的「内容」也搬进来。 */
  if (p.kind === "painter" && typeof MODEL_PROMPTS !== "undefined" && MODEL_PROMPTS) {
    var ref = MODEL_PROMPTS.reference(p.code);
    if (ref) {
      b += '<div class="cw-pv-b"><div class="cw-pv-l"><b>垫图兜底</b><em>'
        + (ref.hasReference ? "有馆藏真迹可用" : "暂无收录名画") + '</em></div>';
      if (ref.hasReference) {
        b += '<div class="cw-model-note">' + ref.works.map(function (w) {
          return '<div>· ' + cwEsc(w.zh) + (w.en ? '（' + cwEsc(w.en) + '）' : '')
            + (w.collection ? ' — ' + cwEsc(w.collection) : '')
            + (w.url ? ' <a href="' + cwEsc(w.url) + '" target="_blank" style="color:var(--accent)">查证</a>' : '')
            + '</div>';
        }).join("") + '</div>';
      }
      b += '<div class="cw-pv-note">' + cwEsc(ref.note) + '</div>'
        + '<div class="cw-pv-note">隔离指令（垫图时必带）：' + cwEsc(ref.isolation.zh) + '</div>'
        + '</div>';
    }
  }

  /* ---------- 词面已隔离的画作标题 ----------
     画家 motif 面里的具体画作标题（mona lisa 这类）被引擎移出了
     构图词面 —— 不写出来，用户会以为库漏了数据。
     这里列出去向：它们在垫图参考区，那里才是名画的正确位置。 */
  if (p.solo && p.solo.isolatedMotif && p.solo.isolatedMotif.length) {
    b += '<div class="cw-pv-b"><div class="cw-pv-l"><b>已隔离的画作标题</b><em>'
      + p.solo.isolatedMotif.length + ' 个 · 不进构图词面</em></div>'
      + '<div class="cw-model-note">' + p.solo.isolatedMotif.map(function (x) {
          return '<div>· ' + cwEsc(x.zh) + (x.en ? '（' + cwEsc(x.en) + '）' : '')
            + ' — 它是具体画作不是题材，写进 tags 会复刻那幅画；'
            + '请在上方「垫图兜底」区按参考图使用</div>';
        }).join("") + '</div></div>';
  }

  /* ---------- 在世艺术家：姓名按约定不进词面 ----------
     不显示的话用户会以为库漏了风格锚定 —— 而这是有意的纪律。
     姓名仍可在详情抽屉查找，只是不出现在可投放词面里。 */
  if (p.solo && p.solo.aliveSources && p.solo.aliveSources.length) {
    b += '<div class="cw-pv-b"><div class="cw-pv-l"><b>在世艺术家</b><em>姓名不进词面</em></div>'
      + '<div class="cw-model-note">' + p.solo.aliveSources.map(function (x) {
          return '<div>· ' + cwEsc(x.zh) + ' — 按姓名纪律，词面以七面锚定画风，'
            + '不含姓名；姓名仍可用于查找与指代</div>';
        }).join("") + '</div></div>';
  }

  /* ---------- 中文对照：词条级派生，不是逐词翻译 ---------- */
  if (p.zhGpt) {
    b += cwPvBlock("cwPvZh", "中文对照", "派生说明 · 出图以英文词面为准", p.zhGpt);
  }

  /* 零件必须额外给「挂在基底上」的版本，否则用户会以为
     「明暗对照」这一条本身就是一个完整配方。 */
  if (p.grade === "part" && p.withBase && !p.withBase.error) {
    b += '<div class="cw-pv-note">上面是它单独投放时的样子 —— 只有一条约束词，'
      + '直接拿去出图几乎等于没约束。挂到演示基底「' + cwEsc(p.baseZh) + '」上：</div>';
    b += cwPvBlock("cwPvWb", "搭配基底后", "推荐这样用",
      p.withBase.tags);
    b += '<div class="cw-pv-b"><div class="cw-pv-l"><b>基底配方 JSON</b>'
      + '<span class="cw-pv-x" data-cw-copy-text="cwPvWbSpec">复制</span></div>'
      + '<textarea id="cwPvWbSpec" readonly rows="2">'
      + cwEsc(JSON.stringify(p.baseSpec)) + '</textarea></div>';
  }

  var tail = [];
  if (p.solo.experimental) tail.push("含未验证的实验性配对，结果不保证。");
  if (p.solo.guardAtoms && p.solo.guardAtoms.length) {
    tail.push("约束模块已强制进负面：" + p.solo.guardAtoms.join(", "));
  }
  if (p.solo.regionAtoms && p.solo.regionAtoms.length) {
    tail.push("局部模块需配遮罩使用：" +
      p.solo.regionAtoms.map(function (r) { return r.zh; }).join(", "));
  }
  if (p.note) tail.push(p.note);
  if (tail.length) b += '<div class="cw-pv-note">' + cwEsc(tail.join(" ")) + '</div>';

  return '<div class="cw-pv">' + head + b + '</div>';
}

/* ---------- 示例：从库里取真实条目，不写死字符串 ---------- */
/* 为什么要现取而不是硬编码示例：
   硬编码的示例在某天条目顺序调整后会指向不存在的东西，
   而用户是照着示例学的 —— 示例错了，错的不是示例，是用户的预期。
   取「该段第一条」而不是「第 125 条」这类具体位置，
   是为了让示例跟着数据走，改数据也不会失效。 */
function cwExample() {
  var R = (typeof REGISTRY !== "undefined") ? REGISTRY : null;
  var out = {
    code: "PA-001", oldId: "—", legacy: "—", short: "PA-1",
    zh: "达·芬奇", en: "Leonardo da Vinci", term: "chiaroscuro",
    combo: "PA-001 + 明暗对照 + 单侧窗光 + OP-001"
  };
  if (!R) return out;

  function firstOf(seg) {
    var list = R.listSeg(seg) || [];
    return list.length ? list[0] : null;
  }

  /* 主示例取画家段第一条：画家是最多人用的入口，
     而且它的旧 ID 与上一版编码形态都不同，最能说明「多种写法同一条」。 */
  var p = firstOf("PA");
  if (p) {
    out.code = p.code;
    out.oldId = p.oldId || "—";
    out.zh = p.zh || out.zh;
    out.en = p.en || out.en;
    var lg = (R.codes.LEGACY_OF || {})[p.code];
    /* LEGACY_OF 的键是旧码，值是新码，要反查 */
    if (!lg) {
      Object.keys(R.codes.LEGACY_OF || {}).forEach(function (k) {
        if (R.codes.LEGACY_OF[k] === p.code) lg = k;
      });
    }
    out.legacy = lg || "（本条无旧码）";
    var m = p.code.match(/^([A-Z]{2})-0*(\d+)$/);
    if (m && m[2].length > 1) out.short = m[1] + "-" + m[2];
  }

  var a = firstOf("AM");
  var o = firstOf("OP");
  out.combo = [out.code, a ? a.code : "AM-001", o ? o.code : "OP-001"]
    .join(" + ");
  if (o && o.en) out.term = o.en;
  return out;
}

/* ---------- 主渲染 ---------- */
function openRenderCode() {
  var q = CW.q;

  /* ---------- 区域一：组合输入 ---------- */
  /* 示例里的编码取真实条目，不写死字符串 ——
     写死的话，哪天条目顺序变了，示例就指向不存在的东西，
     而用户是照着示例学的。 */
  var EX = cwExample();

  var head = '<div class="cw-in">'
    + '<textarea id="cwQ" placeholder="' + cwEsc(EX.combo) + '&#10;支持：编码 / 旧 ID / 中文名 / 英文名，用 + 或空格分隔">' + cwEsc(q) + '</textarea>'
    + '<div style="display:flex;flex-direction:column;gap:6px">'
    + '<button class="btn p" data-cw-go="1">解析组合</button>'
    + '<button class="btn" data-cw-clear="1">清空</button>'
    + '<button class="btn" data-cw-gacha="1" title="每个槽各随机抽一条 —— 不是换 seed 看同一张图，是没见过的组合">抽一组</button>'
    + '<button class="btn" data-cw-gacha8="1" title="一次抽 8 组纵向铺开，横向对比找感觉。不影响上面的单组抽卡">抽 8 组铺开</button>'
    + '</div></div>';

  head += '<div class="cw-hint">'
    + '<b>全库编码只有一种形态</b>：<code>段码-三位</code>，段码固定两字母，共 '
    + (REGISTRY ? REGISTRY.SEGMENTS.length : 0) + ' 段。'
    + '例：<code>' + cwEsc(EX.code) + '</code> 规范编码 · '
    + '<code>' + cwEsc(EX.oldId) + '</code> 旧 ID · '
    + '<code>' + cwEsc(EX.legacy) + '</code> 上一版编码 · '
    + '<code>' + cwEsc(EX.short) + '</code> 省略零位 · '
    + '<code>' + cwEsc(EX.zh) + '</code> 中文名 · '
    + '<code>' + cwEsc(EX.en) + '</code> 英文名 · '
    + '<code>' + cwEsc(EX.term) + '</code> 光学英文词<br>'
    + '八种写法都命中同一条 <b data-cw-try="' + cwEsc(EX.code) + '">' + cwEsc(EX.code) +
      '</b>（' + cwEsc(EX.zh) + '）。缺零位只在**已存在**的编码上生效，'
    + '所以 <code>PA-7</code> 能查到第 7 位画家，而 <code>PA-999</code> 会明确报不存在，不会猜。<br>'
    + '序号恒为三位是为了给后续追加留余量：'
    + '画家到 <b data-cw-try="PA-205">PA-205</b>，'
    + '原子模块到 <b data-cw-try="AM-126">AM-126</b>，'
    + '光学词条到 <b data-cw-try="OP-084">OP-084</b>，往后加到 999 都不撞号。<br>'
    + '国别、模块类别、光学分组不再塞进编码 —— 那些是筛选维度，'
    + '塞进去会让编码长度失控，而组合时要的是「能打出来」。<br>'
    + '每条结果右边都有 <b data-cw-pv="' + cwEsc(EX.code) + '">看提示词</b>：'
    + '直接给出这一条自己的段落式 tags、负面词与自然语言正文，可一键复制，并可切 SD / MJ / Flux / 自然语言四种写法。<br>'
    + '全库共 <b>' + (REGISTRY ? REGISTRY.total : 0) + '</b> 条可引用条目，'
    + '段码总表里点任一段展开后，每一行也带同一个按钮。'
    + '</div>';

  var body = "";

  /* ---------- 区域二：解析结果 ---------- */
  if (!q.trim()) {
    body = '<div class="cw-empty">'
      + '输入编码或中文名，多项用 <code style="font-family:ui-monospace,Consolas,monospace">+</code> 连接<br>'
      + '例如：<code>' + cwEsc(EX.combo) + '</code><br>'
      + '<span style="font-size:11.5px">或者直接写中文名：<code>达·芬奇 + 黄金时刻 + 安静的哀伤</code></span>'
      + '</div>';
  } else {
    var r = RESOLVER.resolveMany(q);
    CW.last = r;

    var list = '<div class="cw-list">';
    (r.okList || []).forEach(function (x) {
      list += '<div class="cw-item">'
        + '<span class="cw-code" data-cw-copy="' + cwEsc(x.code) + '" title="点击复制">' + cwEsc(x.code) + '</span>'
        + '<div class="cw-main"><div class="cw-zh">' + cwEsc(x.zh) + '</div>'
        + '<div class="cw-meta">你写的是「' + cwEsc(x.input) + '」'
        + (x.oldId && x.oldId !== x.code ? ' · 旧 ID ' + cwEsc(x.oldId) : '')
        + (x.note ? ' · ' + cwEsc(x.note) : '') + '</div></div>'
        + '<span class="cw-kind">' + cwEsc(cwKIND(x.kind)) + '</span>'
        + '<span class="cw-pv-btn" data-cw-pv="' + cwEsc(x.code) + '" title="查看这条对应的提示词">'
        + (CW.open === x.code ? '收起词' : '看提示词') + '</span>'
        + '</div>';
      if (CW.open === x.code) list += cwPromptPanel(x.code);
    });
    (r.ambList || []).forEach(function (x) {
      list += '<div class="cw-item cw-bad">'
        + '<span class="cw-code">需指定</span>'
        + '<div class="cw-main"><div class="cw-zh">' + cwEsc(x.input) + '</div>'
        + '<div class="cw-why">' + cwEsc(x.why) + (x.hint ? '（' + cwEsc(x.hint) + '）' : '') + '</div>'
        + '<div class="cw-cand">' + (x.cand || []).map(function (c) {
            return '<b data-cw-try="' + cwEsc(c) + '">' + cwEsc(c) + '</b>';
          }).join("") + '</div></div></div>';
    });
    (r.badList || []).forEach(function (x) {
      /* 原话通道：未命中且看着像自由文本（长度≥2）的段，
         给一个「作为原话追加」按钮 —— 不猜、不静默丢弃。
         拼写错误与真文本用户自己能分辨，按钮只是把选择权还给他。
         原话不参与冲突裁决，只追加在词面末尾（见引擎 freeText）。 */
      var canFree = x.input && x.input.replace(/\s/g, "").length >= 2;
      list += '<div class="cw-item cw-bad">'
        + '<span class="cw-code">未命中</span>'
        + '<div class="cw-main"><div class="cw-zh">' + cwEsc(x.input) + '</div>'
        + '<div class="cw-why">' + cwEsc(x.why) + '</div>'
        + ((x.cand && x.cand.length)
            ? '<div class="cw-cand">最接近：' + x.cand.map(function (c) {
                return '<b data-cw-try="' + cwEsc(c) + '">' + cwEsc(c) + '</b>';
              }).join("") + '</div>'
            : '<div class="cw-cand">没有相近项。可能是名称写法不同，也可能是库里确实没有这一条。</div>')
        + (canFree
            ? '<div class="cw-cand"><b data-cw-free="' + cwEsc(x.input) + '" '
              + 'title="不作为条目解析，原样追加在词面末尾，不参与冲突裁决">'
              + '作为原话追加</b></div>'
            : '')
        + '</div></div>';
    });
    list += '</div>';
    body += list;

    /* ---------- 区域三：产出 ---------- */
    if ((r.okList || []).length) {
      var spec = RESOLVER.toSpec(r);
      var compCount = Object.keys(REGISTRY.COMPOSABLE).length;
      body += '<div class="cw-out"><div class="cw-out-t">规范组合串（可粘进别的工具，也可存下来复用）</div>'
        + '<textarea id="cwChain" readonly>' + cwEsc(r.chain) + '</textarea></div>';

      /* 只有真正能进提示词的零件才值得给 spec。
         签名卡 / 任务模板这类元层混进来会给用户一个跑不通的 spec。 */
      var composable = (r.okList || []).filter(function (x) { return REGISTRY.COMPOSABLE[x.kind]; });
      var metaHit = (r.okList || []).filter(function (x) { return !REGISTRY.COMPOSABLE[x.kind]; });
      if (composable.length) {
        body += '<div class="cw-out"><div class="cw-out-t">解析出的 spec（' +
          composable.length + ' 项可组合，可直接喂给引擎）</div>'
          + '<textarea id="cwSpec" readonly>' + cwEsc(JSON.stringify(spec)) + '</textarea></div>';
      }
      if (metaHit.length) {
        body += '<div class="cw-hint" style="margin-top:-4px">其中 ' +
          metaHit.map(function (x) {
            return '<code>' + cwEsc(x.code) + '</code> ' + cwEsc(x.zh) +
              '（' + cwEsc(REGISTRY.META_KINDS[x.kind] || "元层条目") + '）';
          }).join("、") +
          ' 不进提示词 —— 它们是流程与查证用的，不是视觉零件。</div>';
      }
    }
  }

  /* ---------- 区域三·五：抽卡结果 ----------
     独立于解析结果：抽卡不改 CW.q，这里展示的是抽到的组合本身。 */
  if (CW.gacha && CW.gacha.ok) {
    var gr = CW.gacha;
    var gp = (typeof PROMPTS !== "undefined" && PROMPTS)
      ? PROMPTS.ofSpec(gr.spec, { platform: CW.pf }) : null;
    var lockCount = Object.keys(CW.gaLocks).filter(function (k) { return CW.gaLocks[k]; }).length;
    var gh = '<div class="cw-out"><div class="cw-out-t">抽到的组合（每个槽各抽一条 · 组合空间约 '
      + cwGachaSpace() + '）'
      + ' <b data-cw-gacha="1" style="cursor:pointer;font-weight:500;color:var(--accent)">'
      + (lockCount ? '重抽（' + lockCount + ' 槽锁定）' : '再抽一组') + '</b>'
      + ' <b data-cw-gacha-fill="1" style="cursor:pointer;font-weight:500;color:var(--accent)">填入输入框</b></div>';
    gh += '<div class="cw-list" style="margin:8px 0">'
      + gr.picks.map(function (x) {
          var on = CW.gaLocks[x.seg];
          return '<div class="cw-item"><span class="cw-code">' + cwEsc(x.code) + '</span>'
            + '<div class="cw-main"><div class="cw-zh">' + cwEsc(x.zh) + '</div></div>'
            + '<button class="cw-pv-x" data-cw-ga-lock="' + cwEsc(x.seg) + '" title="'
            + (on ? '已锁定：重抽时这一槽不动（整组重抽后回填）'
                  : '锁定这一槽：重抽时其余槽换，它不动') + '">'
            + (on ? '🔒 已锁' : '🔓 锁') + '</button>'
            + '<span class="cw-kind">' + cwEsc(cwSegZh(x.seg)) + '</span></div>';
        }).join("") + '</div>';
    if (lockCount) {
      gh += '<div class="cw-pv-note">锁定的槽重抽时原样回填。注意：回填的是**整组重抽后'
        + '把不动的那几槽放回去**，不是只对没锁的槽逐个换 —— 组合成不成立是整体性质，'
        + '绕过校验单独换一槽会抽到本该被冲突规则挡掉的组合。</div>';
    }
    if (gp && gp.solo && !gp.solo.error) {
      if (gp.explain) gh += '<div class="cw-pv-note">说明：' + cwEsc(gp.explain) + '</div>';
      gh += cwPvBlock("cwGachaTags", "段落式 tags", gp.solo.words + " 词", gp.solo.tags);
      gh += cwPvBlock("cwGachaGpt", "自然语言正文", "可切平台见单条面板", gp.solo.gpt);
    } else if (gp && gp.solo && gp.solo.error) {
      gh += '<div class="cw-pv-note cw-why">出词失败：' + cwEsc(gp.solo.error) + '</div>';
    }
    gh += '</div>';
    body += gh;
  } else if (CW.gacha && !CW.gacha.ok) {
    body += '<div class="cw-out"><div class="cw-out-t">抽卡失败</div>'
      + '<div class="cw-pv-note cw-why">' + cwEsc((CW.gacha.missing || []).join("；") || "未知原因") + '</div></div>';
  }

  /* ---------- 多组铺开：一次看 8 组，横向对比找感觉 ----------
     单组抽卡适合「就要一个灵感」，铺开适合「我还不知道想要什么」。
     每组给码串与一句话说明，点「码串→输入框」把那组接进组合区细调。
     独立状态，不影响上面的单组（锁与重抽是单组区的事）。 */
  if (CW.gachaMulti && CW.gachaMulti.length) {
    body += '<div class="cw-out"><div class="cw-out-t">8 组铺开（每组各槽独立随机 · 组合空间约 '
      + cwGachaSpace() + '）'
      + ' <b data-cw-ga-clear-multi="1" style="cursor:pointer;font-weight:500;color:var(--dim2)">收起</b></div>';
    body += CW.gachaMulti.map(function (r, i) {
      if (!r || !r.ok) return "";
      var combo = r.picks.map(function (p) { return p.code + " " + p.zh; }).join(" + ");
      var expl = "";
      if (typeof PROMPTS !== "undefined" && PROMPTS) {
        var pm = PROMPTS.ofSpec(r.spec, { platform: CW.pf });
        if (pm && pm.explain) expl = pm.explain;
      }
      return '<div class="cw-pv-b" style="margin:8px 0">'
        + '<div class="cw-pv-l"><b>#' + (i + 1) + '</b>'
        + '<button class="cw-pv-x" data-cw-ga-fill-idx="' + i + '" '
        + 'title="把这组的码串填进上面的输入框细调">码串→输入框</button></div>'
        + '<div class="cw-model-note">' + cwEsc(combo) + '</div>'
        + (expl ? '<div class="cw-pv-note">' + cwEsc(expl) + '</div>' : "")
        + '</div>';
    }).join("");
    body += '</div>';
  }

  /* ---------- 区域四：段码总表（回答「有哪些类型」) ---------- */
  body += renderSegTable();

  return head + body;
}

/* ---------- 段码总表 ---------- */
function renderSegTable() {
  if (!REGISTRY) return "";
  var out = '<div class="cw-sub">全库段码总表 —— 点任一段展开它的全部条目</div>';
  out += '<div class="cw-segs">';
  REGISTRY.SEGMENTS.forEach(function (s) {
    var usable = REGISTRY.composableCount(s.code);
    var mix = Object.keys(s.kindMix || {}).map(function (k) {
      return k + " " + s.kindMix[k];
    }).join(" · ");
    out += '<button class="cw-seg' + (CW.openSeg === s.code ? " on" : "") +
      '" data-cw-seg="' + cwEsc(s.code) + '">'
      + '<div class="cw-seg-h"><span class="cw-seg-code">' + cwEsc(s.code) + '</span>'
      + '<span class="cw-seg-zh">' + cwEsc(s.zh) + '</span>'
      + '<span class="cw-seg-n">' + s.count + '</span></div>'
      + '<div class="cw-seg-d">' + cwEsc(s.desc) + '</div>'
      + (mix ? '<div class="cw-seg-k">' + cwEsc(mix) + '</div>' : '')
      + (s.code === "RL"
          ? '<div class="cw-seg-k">事实说明，不进提示词</div>'
          : '<div class="cw-seg-k"><em>' + usable + '</em> 条可直接组合</div>')
      + '</button>';
  });
  out += '</div>';

  if (CW.openSeg) {
    var seg = CW.openSeg;
    var zh = cwSegZh(seg);
    var rows = REGISTRY.listSeg(seg) || [];
    if (CW.browse) {
      var b = CW.browse.toLowerCase();
      rows = rows.filter(function (e) {
        return [e.zh, e.code, e.oldId || "", e.en || "", e.kindZh || ""].join(" ")
          .toLowerCase().indexOf(b) >= 0;
      });
    }
    out += '<div class="cw-sub">' + cwEsc(seg) + " · " + cwEsc(zh) +
      ' — 共 ' + (REGISTRY.bySeg[seg] || []).length + " 条" +
      (CW.browse ? '，筛出 ' + rows.length + ' 条' : '') +
      ' <input type="search" id="cwBrowse" placeholder="在这一段里筛选…" value="' +
      cwEsc(CW.browse) + '" style="margin-left:8px;padding:3px 8px;font-size:11.5px;' +
      'background:var(--panel2);border:1px solid var(--line);border-radius:6px;' +
      'color:var(--txt);width:150px">'
      + ' <b data-cw-close="1" style="cursor:pointer;font-weight:500">收起</b></div>';

    if (!rows.length) {
      out += '<div class="cw-empty">这一段没有匹配的条目</div>';
    } else {
      out += '<div class="cw-rows">';
      rows.forEach(function (e) {
        out += '<div class="cw-row">'
          + '<span class="cw-code" data-cw-copy="' + cwEsc(e.code) + '" title="点击复制">' +
            cwEsc(e.code) + '</span>'
          + '<span class="cw-row-zh">' + cwEsc(e.zh) + '</span>'
          + '<span class="cw-row-k">' + cwEsc(e.kindZh || cwKIND(e.kind)) + '</span>'
          /* R 段是关系边，不在 RESOLVER 里，没有可取的提示词，因此不给这个按钮。
             给一个点了只弹出「不能出词」的空面板，不如不给。 */
          + (e.kind === "relation" ? ''
              : '<span class="cw-pv-btn" data-cw-pv="' + cwEsc(e.code) + '" title="查看这条对应的提示词">'
                + (CW.open === e.code ? '收起词' : '看提示词') + '</span>')
          + '</div>';
      });
      out += '</div>';
      /* 面板挂在表格外面：表格是可滚动的，面板放进去会被裁掉。 */
      if (CW.open) {
        var openRow = rows.filter(function (e) { return e.code === CW.open; })[0];
        if (openRow) out += cwPromptPanel(CW.open);
      }
    }
  }
  return out;
}

/* ---------- 抽卡辅助：组合空间的人类可读形态 ---------- */
function cwGachaSpace() {
  if (typeof GACHA === "undefined" || !GACHA) return "—";
  var sp = GACHA.pool().space;
  if (!sp) return "—";
  if (sp >= 1e12) return (sp / 1e12).toFixed(1) + " 万亿";
  if (sp >= 1e8) return (sp / 1e8).toFixed(1) + " 亿";
  if (sp >= 1e4) return (sp / 1e4).toFixed(1) + " 万";
  return String(sp);
}

/* ---------- 事件绑定（在主界面的委托里调用） ---------- */
function codeUiClick(el) {
  if (el.hasAttribute("data-cw-go")) {
    var ta = document.getElementById("cwQ");
    CW.q = ta ? ta.value : CW.q;
    cwRender();
    return true;
  }
  if (el.hasAttribute("data-cw-clear")) {
    CW.q = ""; CW.last = null;
    cwRender();
    return true;
  }
  /* 抽卡：有锁走 reroll（整组重抽 + 锁定槽回填），无锁直接 roll。
     不改 CW.q —— 抽卡是「看看能抽出什么」，不是「替换你正在写的组合」。 */
  if (el.hasAttribute("data-cw-gacha")) {
    if (typeof GACHA !== "undefined" && GACHA) {
      var hasLock = Object.keys(CW.gaLocks).some(function (k) { return CW.gaLocks[k]; });
      CW.gacha = (hasLock && CW.gacha && CW.gacha.ok)
        ? GACHA.reroll(CW.gacha, CW.gaLocks)
        : GACHA.roll();
      cwRender();
    }
    return true;
  }
  /* 多组铺开：8 次独立 roll。单组区的锁不管这里 ——
     锁是「我要留住这一组里某个槽」，铺开是「广撒网再挑」。 */
  if (el.hasAttribute("data-cw-gacha8")) {
    if (typeof GACHA !== "undefined" && GACHA) {
      var many = [];
      for (var mi = 0; mi < 8; mi++) many.push(GACHA.roll());
      CW.gachaMulti = many;
      cwRender();
    }
    return true;
  }
  /* 收起多组铺开 */
  if (el.hasAttribute("data-cw-ga-clear-multi")) {
    CW.gachaMulti = null;
    cwRender();
    return true;
  }
  /* 把铺开里的第 N 组码串填进输入框 */
  if (el.hasAttribute("data-cw-ga-fill-idx")) {
    var gi = parseInt(el.getAttribute("data-cw-ga-fill-idx"), 10);
    var gr = CW.gachaMulti && CW.gachaMulti[gi];
    if (!gr || !gr.ok) return true;
    var gstr = gr.picks.map(function (p) { return p.code; }).join(" + ");
    var gta8 = document.getElementById("cwQ");
    if (gta8) { gta8.value = gstr; gta8.focus(); }
    CW.q = gstr;
    cwRender();
    return true;
  }
  /* 锁 / 解锁一个抽卡槽 */
  if (el.hasAttribute("data-cw-ga-lock")) {
    var lseg = el.getAttribute("data-cw-ga-lock");
    CW.gaLocks[lseg] = !CW.gaLocks[lseg];
    cwRender();
    return true;
  }
  /* 把抽到的编码填进输入框：显式动作，填的是规范码串 */
  if (el.hasAttribute("data-cw-gacha-fill")) {
    var gfill = (CW.gacha && CW.gacha.ok)
      ? CW.gacha.picks.map(function (p) { return p.code; }).join(" + ") : "";
    if (!gfill) return true;
    var gta = document.getElementById("cwQ");
    if (gta) { gta.value = gfill; gta.focus(); }
    CW.q = gfill;
    cwRender();
    return true;
  }
  if (el.hasAttribute("data-cw-try")) {
    /* 编码或中文名代填：点哪个就把哪个加进输入框 */
    var v = el.getAttribute("data-cw-try");
    /* 候选列表里的值形如 "AM-001 明暗对照"，只取编码那一段 */
    var code = String(v).split(" ")[0];
    var ta2 = document.getElementById("cwQ");
    if (ta2) {
      var cur = ta2.value.trim();
      ta2.value = cur ? cur + " + " + code : code;
      ta2.focus();
    } else {
      CW.q = CW.q ? CW.q + " + " + code : code;
    }
    cwRender();
    return true;
  }
  if (el.hasAttribute("data-cw-copy")) {
    var c = el.getAttribute("data-cw-copy");
    /* 三路复制：成功才报成功，都失败给手动浮层（见 cwCopy 注释） */
    cwCopy(c, el, "已复制 " + c);
    return true;
  }
  /* 复制整段文本：提示词面板里的 tags / neg / gpt 都用它。
     复制的是 textarea 的值而不是属性值 —— 属性里放过长的文本
     会把 HTML 撑爆，而且换行会被转义掉，粘出来是一坨。 */
  if (el.hasAttribute("data-cw-copy-text")) {
    var ta3 = document.getElementById(el.getAttribute("data-cw-copy-text"));
    if (!ta3) return true;
    /* 同样走三路。旧写法在这里只调 writeText 不接 Promise，
       写入被拒时按钮照样显示「已复制」——假成功。 */
    cwCopy(ta3.value, el, "已复制");
    return true;
  }
  /* 展开 / 收起某条编码对应的提示词 */
  if (el.hasAttribute("data-cw-pv")) {
    var pv = el.getAttribute("data-cw-pv");
    CW.open = (CW.open === pv) ? null : pv;
    cwRender();
    return true;
  }
  /* 切换平台：词面不变，只换权重写法 */
  if (el.hasAttribute("data-cw-pf")) {
    CW.pf = el.getAttribute("data-cw-pf");
    cwRender();
    return true;
  }
  if (el.hasAttribute("data-cw-seg")) {
    var s = el.getAttribute("data-cw-seg");
    CW.openSeg = (CW.openSeg === s) ? null : s;
    CW.browse = "";
    cwRender();
    return true;
  }
  if (el.hasAttribute("data-cw-close")) {
    CW.openSeg = null; CW.browse = "";
    cwRender();
    return true;
  }
  return false;
}

/* ---------- 键盘处理 ---------- */
/* 重绘会整体换掉 innerHTML，当前输入框连同焦点一起消失。
   所以每个分支都要把焦点还回去、光标放到末尾 ——
   不还的话「边打字边看筛选结果」这个用法根本用不了。 */
function cwRefocus(id) {
  setTimeout(function () {
    var el = document.getElementById(id);
    if (!el) return;
    el.focus();
    var n = el.value.length;
    if (el.setSelectionRange) el.setSelectionRange(n, n);
  }, 0);
}

function codeUiKey(el, ev) {
  /* 输入框：cwQ 回车提交解析；cwBrowse 即时筛选段内条目 */
  if (el.id === "cwQ" && ev === "Enter" && !ev.shiftKey) {
    CW.q = el.value;
    cwRender();
    cwRefocus("cwQ");
    return true;
  }
  if (el.id === "cwBrowse") {
    CW.browse = el.value;
    cwRender();
    cwRefocus("cwBrowse");
    return true;
  }
  return false;
}