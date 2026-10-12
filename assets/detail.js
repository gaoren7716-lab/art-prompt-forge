/* ============================================================
 * detail.js · 条目详情抽屉
 * ============================================================
 * 用户的原话：「验证下点击对应的画家或是信息及套用，或加入，
 *   有没有反应和变化，确认可以正常运行」
 *
 * 验证结论：按钮（加入/套用）全部有效，零运行期错误。
 * 但点条目**本体**（名字那一行）没有任何反应 —— 列表项整行
 * 挂着 data-id 与 cursor:pointer，看上去可点，点了什么都不发生。
 * 这是本文件要补的缺口。
 *
 * 为什么用右侧抽屉而不是行内展开：
 *   行内展开会把下方几十条列表整体推走，用户点开一条就得重新找位置。
 *   抽屉不改变列表布局，看完关掉，视线不用重新定位。
 *
 * 抽屉要回答的问题（按用户实际会问的顺序排）：
 *   1. 这是什么            —— 名称、层、编码
 *   2. 它怎么拼            —— 七面分别填了什么，缺哪几面
 *   3. 它和谁有关系        —— 关系边，点端点可跳
 *   4. 它能出多少词        —— 提示词面板，不另起一套取词实现
 *   5. 我怎么再找到它      —— 旧 ID、别名、英文名
 *
 * 一条硬约定：**不给元层条目开空框**。
 *   签名卡/任务/冲突/来源/模型/关系边不进提示词，
 *   抽屉里就不显示空的提示词区，而是写清「为什么不进」。
 *   给个空框等于暗示「这里本来有词但被清了」，那是误导。
 * ============================================================ */
(function () {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { DETAIL: null };   /* Node 下不参与，只给浏览器用 */
    return;
  }

  var D = {
    open: false,
    cur: null,     /* 当前展示的 { key, id } */
    /* 宿主上下文。MODULES / REL_META / REL_NAME / CAT_ZH / PID_NAME
       都定义在 index.html 的 IIFE 内部，不是全局 ——
       而 detail.js 是独立 <script>，摸不到它们。
       所以由 index.html 在 ready() 时注入，不去猜全局。
       写全局变量「省事」的后果是两份数据各改一处就静默不一致。 */
    ctx: null
  };

  function ctx() {
    return D.ctx || { MODULES: [], REL_META: {}, REL_NAME: {}, CAT_ZH: {}, PID_NAME: {} };
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- 找一条记录 ---------- */
  /* 列表项带的是 data-id，而光学词条的 id 拼成 "opt:<裸词>"，
     关系边的 id 是 "rel:<序号>" —— 三种形态必须分开找，
     混在一起查就会出现「点光学词条打开了别的东西」。 */
  function find(key, id) {
    var s = String(id || "");
    if (key === "relations") {
      var i = parseInt(s.replace(/^rel:/, ""), 10);
      return { rel: RELATIONS[i] };
    }
    if (key === "optics") {
      var term = s.replace(/^opt:/, "");
      var dot = term.indexOf(".");
      var gid = dot >= 0 ? term.slice(0, dot) : null;
      var bare = dot >= 0 ? term.slice(dot + 1) : term;
      for (var g = 0; g < OPTICS.length; g++) {
        var grp = OPTICS[g];
        if (gid && grp.id !== gid) continue;
        for (var k = 0; k < (grp.items || []).length; k++) {
          if (grp.items[k].t === bare) {
            return { optic: grp.items[k], group: grp };
          }
        }
      }
      return null;
    }
    var m = ctx().MODULES.filter(function (x) { return x.key === key; })[0];
    if (!m) return null;
    var e = null;
    m.arr.forEach(function (x) { if (x.id === s) e = x; });
    return e ? { entry: e, mod: m } : null;
  }

  /* ---------- 七面 ---------- */
  /* ★ 七面在数据源里是**嵌套在 F 下**的（e.F.light），不是平铺的 e.light。
     读错层级的后果不报错，只是恒为 0/7 —— 画家明明七面都填满了，
     抽屉却显示「没有七面」，用户会以为这条数据没写完。
     所以先取 F，F 不存在才退回平铺（光学词条等没有 F 的层用平铺）。 */
  function facetsOf(e) {
    if (!e) return null;
    return e.F && typeof e.F === "object" ? e.F : e;
  }

  /* 只显示有值的面。空面不列 —— 列一排「（未填）」只会让人以为
     库里有 7 个坑要补，而实际上未填是常态。 */
  function facetRows(e) {
    var F = facetsOf(e);
    var out = "";
    FACETS.forEach(function (f) {
      var v = F ? F[f.k] : "";
      if (!v) return;
      var txt = Array.isArray(v) ? v.join("、") : v;
      out += '<div class="dt-f"><span class="dt-fk">' + esc(f.zh) + '</span>'
        + '<span class="dt-fv">' + esc(txt) + '</span></div>';
    });
    return out;
  }
  function facetCount(e) {
    var F = facetsOf(e);
    var n = 0;
    FACETS.forEach(function (f) { if (F && F[f.k] && F[f.k].length) n++; });
    return n;
  }

  /* ---------- 关系边 ---------- */
  /* 按方向分成「它指向的」与「它被指向的」两组 ——
     只列一个方向的话，用户看到「达·芬奇 师承 韦罗基奥」会不知道
     自己是学到了什么还是影响了谁。 */
  function relRows(key, id) {
    var mine = [], back = [];
    RELATIONS.forEach(function (r) {
      var other = null, dir = "";
      if (r.from === id) { other = r.to; dir = "out"; }
      else if (r.to === id) { other = r.from; dir = "in"; }
      if (!other) return;
      (dir === "out" ? mine : back).push({ r: r, other: other });
    });
    if (!mine.length && !back.length) {
      return '<div class="dt-note">这一条还没有登记关系边。'
        + '关系表只记从现有字段推不出来的边，不是每条都必须有。</div>';
    }
    var RN = ctx().REL_NAME || {};
    var nameOf2 = function (x) { return RN[x] || x; };
    /* 只有能查到的端点才给链接。
       306 条边里有 39 个端点是博物馆名（如「卢浮宫」「大都会艺术博物馆」），
       它们在 PROVENANCE 里是 org 字段而不是可引用条目 ——
       给它们挂链接点了必然打不开，那比不给链接更糟。
       所以判据是「能不能在模块库里找到」，不是「有没有名字」。 */
    function linkable(x) {
      if (RN[x] == null) return false;
      var found = false;
      ctx().MODULES.forEach(function (m) {
        if (found) return;
        m.arr.forEach(function (e) { if (e.id === x) found = true; });
      });
      return found;
    }
    function block(title, arr, dirWord) {
      if (!arr.length) return "";
      var h = '<div class="dt-sub">' + esc(title) + ' <em>' + arr.length + '</em></div>';
      h += '<div class="dt-rels">';
      arr.forEach(function (x) {
        var mt = ctx().REL_META[x.r.kind] || { zh: x.r.kind };
        var nm = esc(nameOf2(x.other));
        h += '<div class="dt-rel">'
          + '<span class="dt-rk">' + esc(mt.zh) + '</span>'
          + '<span class="dt-rd">' + esc(dirWord) + '</span>'
          + (linkable(x.other)
              ? '<b data-dt-goto="' + esc(x.other) + '">' + nm + '</b>'
              : '<b class="dt-ro">' + nm + '</b>')
          + '<span class="dt-rn">' + esc(x.r.note || "") + '</span>'
          + '</div>';
      });
      return h + '</div>';
    }
    return block("它指向", mine, "→") + block("它被指向", back, "←");
  }

  /* ---------- 主体 ---------- */
  function body(key, id) {
    var f = find(key, id);
    if (!f) {
      return '<div class="dt-none">找不到这一条（' + esc(id) + '）。'
        + '它可能已经被移除了。</div>';
    }

    if (f.rel) {
      var r = f.rel;
      var mt = ctx().REL_META[r.kind] || { zh: r.kind, tip: "" };
      var RN2 = ctx().REL_NAME || {};
      var h = '<div class="dt-h"><b>' + esc(RN2[r.from] || r.from) + '</b>'
        + '<span class="dt-arrow">' + esc(mt.zh) + '</span>'
        + '<b>' + esc(RN2[r.to] || r.to) + '</b></div>';
      /* 关系边本身是可引用的（能写进组合串说明「我要这条师承」），
         所以把两端各做成可点入口，让用户能从一条边跳到实体详情 ——
         这正是「点关系想查点什么」的最常见动作。 */
      h += '<div class="dt-ends">'
        + '<span class="dt-ends-l">两端</span>'
        + '<b data-dt-goto="' + esc(r.from) + '">' + esc(RN2[r.from] || r.from) + '</b>'
        + '<b data-dt-goto="' + esc(r.to) + '">' + esc(RN2[r.to] || r.to) + '</b>'
        + '</div>';
      h += kv([["编码", r.code], ["方向", mt.dir || "—"],
               ["说明", r.note || mt.tip || "—"], ["状态", stZh(r.status)]]);
      h += '<div class="dt-why">关系边是「这条边存在」的事实说明，'
        + '不是可拼装的零件 —— 所以它没有提示词，'
        + '写进提示词里也不会让画面发生变化。</div>';
      return h;
    }

    var e = f.entry || f.optic;
    var reg = regOf(e);

    var h = "";
    var title = e.zh || e.model || e.t || e.id;
    var sub = f.mod ? f.mod.zh : (f.group ? "光学词条 · " + f.group.zh : "光学词条");

    h += '<div class="dt-h"><b>' + esc(title) + '</b>'
      + (e.en ? '<span class="dt-en">' + esc(e.en) + '</span>' : "")
      + '</div>';
    h += '<div class="dt-sub2">' + esc(sub)
      + (reg ? ' · <code class="dt-code" data-dt-copy="' + esc(reg.code) + '">'
        + esc(reg.code) + '</code>' : "")
      + '</div>';

    /* 通用字段 */
    var rows = [];
    if (e.status) rows.push(["状态", stZh(e.status)]);
    if (reg && reg.kind) rows.push(["层级", REGISTRY.KIND_ZH[reg.kind] || reg.kind]);
    if (e.life) rows.push(["生卒", e.life]);
    if (e.region) rows.push(["地区", e.region]);
    if (e.mv) rows.push(["流派", mvName(e.mv)]);
    if (e.year) rows.push(["年份", e.year]);
    if (e.collection) rows.push(["收藏", e.collection]);
    if (e.dims) rows.push(["尺寸", e.dims]);
    if (f.optic) rows.push(["所属组", f.group.zh + "（" + f.group.id + "）"]);
    if (e.cat != null && f.mod && f.mod.key === "atoms") {
      var c = ctx().CAT_ZH["am" + e.cat];
      rows.push(["类别", c || ("第 " + e.cat + " 类")]);
    }
    if (e.role) rows.push(["角色", roleZh(e.role)]);
    if (e.guard) rows.push(["约束", "硬边界，权重对它无效，强制进负面词"]);
    if (e.slot) rows.push(["投放面", e.slot]);
    if (e.ask) rows.push(["诉求", e.ask]);
    if (e.goal) rows.push(["目标", e.goal]);
    if (e.license) rows.push(["许可", e.license + (e.commercial === false ? " · 禁止商用" : "")]);
    if (e.weightSyntax) rows.push(["权重写法", e.weightSyntax]);
    if (e.cfg) rows.push(["引导值", Array.isArray(e.cfg) ? e.cfg.join("–") : e.cfg]);
    if (e.desc) rows.push(["说明", e.desc]);
    /* sty 是引擎拼权重时用的风格词（e.sty），它进 tags 但不在七面里 ——
       不显示的话，用户看到七面齐全却不知道那些权重词从哪来。 */
    if (e.sty && e.sty.length) rows.push(["风格词", e.sty.join("、")]);
    if (e.tags && e.tags.length) rows.push(["标签", e.tags.slice(0, 8).join("、")]);
    h += kv(rows);

    /* 七面 */
    if (facetCount(e) > 0) {
      h += '<div class="dt-sub">七面 <em>' + facetCount(e) + '/7</em></div>';
      h += '<div class="dt-fs">' + facetRows(e) + '</div>';
    }

    /* 关系 */
    if (e.id) h += relRows(key, e.id);

    /* 提示词入口：元层不给空框 */
    if (reg && reg.code) {
      h += '<div class="dt-sub">提示词</div>';
      h += '<div id="dtPv"></div>';
    }

    /* 旧写法：让用户知道自己还能怎么找到它 */
    if (reg) {
      var al = [];
      if (e.id && e.id !== reg.code) al.push(e.id);
      var lg = CODES.legacyCode(e.id || "");
      if (lg && lg !== reg.code) al.push(lg);
      if (al.length) {
        h += '<div class="dt-sub">其他写法 <em>仍可解析</em></div><div class="dt-alts">'
          + al.map(function (x) {
            return '<code data-dt-copy="' + esc(x) + '">' + esc(x) + '</code>';
          }).join("") + '</div>';
      }
    }
    return h;
  }

  /* ---------- 条目 → 登记记录 ---------- */
  /* 数据源的条目只有 id（P-CN01），没有 code —— code 是编码层
     派生出来的。所以查登记记录必须拿 **id** 去查 OLD_OF，
     而不是拿 e.code（那是 undefined，于是面板整块不渲染）。
     写成一处、由 body() 与 show() 共用：
     两处各写一遍的话，改了一处另一处就会静默失效 ——
     症状是「点画家没提示词、点光学词条有」，极难定位。 */
  function regOf(e) {
    if (!e) return null;
    var R = (typeof REGISTRY !== "undefined") ? REGISTRY : null;
    if (!R) return null;
    /* 光学词条的 id 本身就是 code */
    if (e.code && R.byCode(e.code)) return R.byCode(e.code);
    var id = e.id || "";
    var code = R.codes.OLD_OF[id];
    if (code && R.byCode(code)) return R.byCode(code);
    /* 最后兜一层：让解析器按任意写法找（旧 ID / 上一版 code / 中文名） */
    var hit = RESOLVER.resolve(id || e.code || "");
    if (hit && hit.ok) return hit.hits[0];
    return null;
  }

  function mvName(id) { var P = ctx().PID_NAME || {}; return P[id] || id; }

  /* 状态与角色的中文名。STATUS 是 data-core 的全局（真源），
     ROLE_ZH 在 index.html 的 IIFE 里（经 ctx 拿）。
     都拿不到时退回原值 —— 显示英文 key 比显示空白好。 */
  function stZh(k) {
    if (!k) return "—";
    if (typeof STATUS !== "undefined" && STATUS) {
      for (var i = 0; i < STATUS.length; i++) if (STATUS[i].k === k) return STATUS[i].zh;
    }
    return k;
  }
  var ROLE_FALLBACK = { lead: "主导", support: "辅助", region: "局部", guard: "约束" };
  function roleZh(k) {
    var R = ctx().ROLE_ZH || ROLE_FALLBACK;
    return R[k] || k;
  }

  function kv(rows) {
    rows = rows.filter(function (r) { return r[1] != null && r[1] !== ""; });
    if (!rows.length) return "";
    return '<div class="dt-kv">' + rows.map(function (r) {
      return '<div class="dt-kv-r"><span class="dt-kv-k">' + esc(r[0]) + '</span>'
        + '<span class="dt-kv-v">' + esc(r[1]) + '</span></div>';
    }).join("") + '</div>';
  }

  /* ---------- 提示词区 ---------- */
  /* 复用 code-ui.js 已有的 cwPromptPanel —— 不另写一套取词。
     两处实现必然漂移：一边改了冲突裁决，另一边还按老规则显示。 */
  function fillPrompt(code) {
    var box = document.getElementById("dtPv");
    if (!box) return;
    if (typeof cwPromptPanel === "function") {
      box.innerHTML = cwPromptPanel(code);
      return;
    }
    box.innerHTML = '<div class="dt-note">提示词层未加载，'
      + '请确认 prompts.js 已在 registry.js 之后引入。</div>';
  }

  /* ---------- 开关 ---------- */
  function show(key, id) {
    D.open = true;
    D.cur = { key: key, id: id };
    var host = document.getElementById("dtPanel");
    if (!host) return;
    host.style.display = "block";
    document.getElementById("dtMask").style.display = "block";
    host.innerHTML = '<div class="dt-hd"><h3>条目详情</h3>'
      + '<button class="btn" data-dt-close="1">关闭</button></div>'
      + '<div class="dt-body">' + body(key, id) + '</div>';
    var code = null;
    try {
      var f = find(key, id);
      if (f && f.rel) code = f.rel.code;
      else {
        var r = regOf(f && (f.entry || f.optic));
        code = r ? r.code : null;
      }
    } catch (e) { code = null; }
    if (code) fillPrompt(code);
    else {
      /* 查不到条目时不留空框：给一句原因。
         空框等于暗示「这里本来有词但被清了」。 */
      var box = document.getElementById("dtPv");
      if (box) {
        box.innerHTML = '<div class="dt-note">这一条没有登记进编码表，'
          + '所以取不到它的提示词。旧 ID 是 '
          + (D.cur ? esc(D.cur.id) : "—") + '。</div>';
      }
    }
  }

  function hide() {
    D.open = false;
    var host = document.getElementById("dtPanel");
    var mask = document.getElementById("dtMask");
    if (host) { host.style.display = "none"; host.innerHTML = ""; }
    if (mask) mask.style.display = "none";
  }

  /* ---------- 复制三路（与 code-ui.js 的 cwCopy 等价，独立实现） ----------
     为什么不能「调用了 writeText 就显示已复制」：它返回 Promise，
     「调用了」不等于「写进去了」。file:// 下写入被拒时显示成功 =
     用户看到成功、剪贴板是空的、没有任何东西报错 ——
     这种失败没有症状，会被当成「库不行」。
     三路：clipboard 成功才报成功 → 回落 execCommand →
     都失败弹手动复制浮层（全文 + 全选）。 */
  function dtCopy(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = "已复制";
      setTimeout(function () { btn.textContent = old; }, 900);
    };
    var manual = function () {
      var mask = document.createElement("div");
      mask.style.cssText = "position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.4);"
        + "display:flex;align-items:center;justify-content:center;padding:24px";
      var box = document.createElement("div");
      box.style.cssText = "background:var(--bg,#fff);border:1px solid var(--line);"
        + "border-radius:12px;max-width:640px;width:100%;max-height:82vh;"
        + "display:flex;flex-direction:column;overflow:hidden;padding:14px 16px";
      box.innerHTML = '<div style="font-size:13px;margin-bottom:6px">自动复制失败 · 请手动复制</div>'
        + '<div style="font-size:11.5px;color:var(--dim2);line-height:1.7;margin-bottom:8px">'
        + '当前环境写不进剪贴板（常见于 file:// 协议或权限被拒）。'
        + '全文已在下方全选，按 Ctrl+C（macOS 用 Cmd+C）即可。</div>';
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "flex:1;min-height:180px;font-size:11.5px;line-height:1.7;"
        + "padding:10px;font-family:ui-monospace,Consolas,monospace;resize:vertical";
      var ok = document.createElement("button");
      ok.textContent = "好了";
      ok.style.cssText = "margin-top:10px;align-self:flex-end;padding:5px 16px;"
        + "border:1px solid var(--line);border-radius:8px;background:transparent;"
        + "color:var(--txt);cursor:pointer";
      ok.addEventListener("click", function () { mask.remove(); });
      mask.addEventListener("click", function (e) {
        if (e.target === mask) mask.remove();
      });
      box.appendChild(ta); box.appendChild(ok); mask.appendChild(box);
      document.body.appendChild(mask);
      ta.focus(); ta.select();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacy(); });
    } else {
      legacy();
    }
    function legacy() {
      try {
        var t = document.createElement("textarea");
        t.value = text;
        t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t);
        t.focus(); t.select();
        var okd = document.execCommand("copy");
        document.body.removeChild(t);
        if (okd) done(); else manual();
      } catch (e) { manual(); }
    }
  }

  /* ---------- 事件 ---------- */
  function bind() {
    var host = document.getElementById("dtPanel");
    if (!host || host.getAttribute("data-bound")) return;
    host.setAttribute("data-bound", "1");

    host.addEventListener("click", function (e) {
      if (e.target.closest("[data-dt-close]")) { hide(); return; }
      var cp = e.target.closest("[data-dt-copy]");
      if (cp) {
        var v = cp.getAttribute("data-dt-copy");
        /* 三路复制。抽屉是独立 <script>，摸不到 code-ui.js 的 cwCopy，
           但复制失败必须自己说失败 —— 假成功在任何一处都是假成功。
           这里自建等价的一份（第三路：手动浮层 + 全选）。 */
        dtCopy(v, cp);
        return;
      }
      /* 点关系里的另一端：换一条展示，不关抽屉 ——
         连着追溯师承链是这里最常见的用法。 */
      var gt = e.target.closest("[data-dt-goto]");
      if (gt) {
        var key = D.cur ? D.cur.key : "";
        /* 另一端可能属于不同页签（画家→机构），跨段时退回编码查询 */
        var hit = null;
        ctx().MODULES.forEach(function (m) {
          if (hit) return;
          m.arr.forEach(function (x) { if (x.id === gt.getAttribute("data-dt-goto")) hit = m.key; });
        });
        show(hit || key, gt.getAttribute("data-dt-goto"));
      }
    });

    var mask = document.getElementById("dtMask");
    if (mask) {
      mask.addEventListener("click", hide);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && D.open) hide();
    });
  }

  /* 供 index.html 在首次渲染后调用，并注入它 IIFE 内的常量 */
  function ready(context) { D.ctx = context || D.ctx; bind(); }

  var _c = (typeof window !== "undefined" ? window : this);
  _c.DETAIL = { show: show, hide: hide, ready: ready, state: D, find: find };
})();
