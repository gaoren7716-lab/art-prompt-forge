/* ============================================================
 * registry.js · 全库登记：把每条实体注册进编码表与解析器
 * ============================================================
 * 为什么单独一个文件：
 *   CODES 只管「编码怎么派生」，RESOLVER 只管「怎么查」，
 *   但「库里到底有哪些条目、每条属于哪一层」这件事必须有一个唯一出处。
 *   放在这里，界面、命令行、测试三处就都读同一份清单，
 *   不会出现「网页上能看到、命令行查不到」这种分裂。
 *
 * 加载顺序（写错了必然出问题）：
 *   data-core.js → 各 assets/*.js → codes.js → resolver.js → registry.js
 * registry 依赖前两者已就绪，且必须在 forge-kit.js 之后（要用 FORGE）。
 *
 * 浏览器与 Node 双跑：
 *   顶层用 var，且取全局容器时走 (typeof module !== "undefined" && module.exports)
 *   ? require(...) : (typeof window !== "undefined" ? window : this)
 *   —— Node 的 CommonJS 里 var 是模块作用域，不是全局；
 *      浏览器 <script> 顶层 var 才隐式挂 global。两者都要拿到同一批数据。
 * ============================================================ */
(function () {
  if (typeof module !== "undefined" && module.exports) {
    /* Node 路径：复用 tools/_load.js 的 ORDER，不自己抄一份文件清单。
       抄一份就等于两份维护 —— 加了数据文件只改一处的话，
       registry 会静默少登记一批条目，编码表看着全绿其实缺了一块。
       这个坑本项目已经踩过一次（ORDER 漏登记导致依赖顺序错乱）。 */
    var _L = require("../tools/_load.js");
    var DB = _L();
    var REGMETA = buildRegistry(
      {
        PAINTERS: DB.PAINTERS, MOVEMENTS: DB.MOVEMENTS, MEDIUMS: DB.MEDIUMS,
        SUBJECTS: DB.SUBJECTS, OPTICS: DB.OPTICS, WORKS: DB.WORKS,
        OPERATORS: DB.OPERATORS, CONFLICTS: DB.CONFLICTS, SIGNATURES: DB.SIGNATURES,
        PROVENANCE: DB.PROVENANCE, TASKS: DB.TASKS, ATOMS: DB.ATOMS,
        TESTS: DB.TESTS, RELATIONS: DB.RELATIONS, FORGE: DB.FORGE
      },
      require("./codes.js").CODES,
      require("./resolver.js").RESOLVER
    );
    module.exports = { REGISTRY: REGMETA };
    return;
  }

  /* 浏览器路径：所有容器已由 <script> 挂到 window */
  var _c = (typeof window !== "undefined" ? window : this);
  _c.REGISTRY = buildRegistry(_c, _c.CODES, _c.RESOLVER);
})();

/* ============================================================
 * buildRegistry —— 真正的登记逻辑，两端共用
 * ============================================================ */
function buildRegistry(D, CODES, RESOLVER) {

  /* 段码 → 层级中文名。与 codes.js 的 SEGMENTS 对应，
     这里给 UI 显示用，所以额外带上「这一层能干什么」的一句话。 */
  var KIND_ZH = {
    painter:      "画家",
    movement:     "流派",
    medium:       "媒介",
    subject:      "题材",
    work:         "名画",
    operator:     "算子",
    conflict:     "冲突规则",
    signature:    "签名卡",
    provenance:   "来源许可",
    task:         "任务模板",
    atom:         "原子模块",
    optic:        "光学词条",
    opticGroup:   "光学分组",
    model:        "模型实测"
  };

  /* 哪些层可以直接进引擎的 spec，哪些是元层。
     元层不是「没用」，是不能当零件用：
       签名卡 = 一整套已配好的 spec，应当整体套用而不是往里加词
       冲突规则 = 引擎自动执行的裁决，不进提示词
       任务模板 = 流程起点，不是视觉零件
       来源许可 / 模型实测 = 查证用，不是提示词内容
     这一层区分错了，UI 就会允许用户把 PV-020（CC0 许可）塞进提示词里。 */
  var COMPOSABLE = {
    painter: 1, movement: 1, medium: 1, subject: 1, work: 1,
    operator: 1, atom: 1, optic: 1
  };
  var META_KINDS = {
    conflict: "引擎自动裁决，不进提示词",
    signature: "一整套配方，套用而非叠加",
    task: "流程起点，不是视觉零件",
    provenance: "查证用，不是提示词内容",
    model: "查证用，不是提示词内容",
    opticGroup: "分组，用它的词条而不是它本身"
  };

  var S = {
    CODE_OF: CODES.CODE_OF,
    OLD_OF: CODES.OLD_OF,
    ALIASES: CODES.ALIASES,
    SEGMENTS: CODES.SEGMENTS,
    KIND_ZH: KIND_ZH,
    COMPOSABLE: COMPOSABLE,
    META_KINDS: META_KINDS,
    counts: {},
    bySeg: {},
    byKind: {}
  };

  /* 段码不再从 code 字符串里正则切出来 —— 那样切错一次不会报错，
     只会让条目归错段、段码统计悄悄少一条。
     改为按 kind 显式声明段码：登记时查表，多一层不变量但零猜测。
     段码与 CODES.SEGMENTS 必须一致，不一致时 reg() 会把条目拒下来
     并记进 uncoded —— 那正是它该做的：宁可少登记一条并报出来，
     也不能让两种段码同时存在于库里。 */
  var SEG_OF_KIND = {
    painter: "PA", movement: "MV", work: "WK", medium: "MD", subject: "SJ",
    atom: "AT", optic: "OP", opticGroup: "OG", task: "TK", signature: "SG",
    operator: "OR", conflict: "CF", model: "MT", provenance: "PV"
  };

  function codeOf(id) { return CODES.add(id); }
  function bump(key, n) { S.counts[key] = (S.counts[key] || 0) + (n || 1); }

  /* 常用短码表：许可与模型这两层的名称又长又带版本号，
     用户脑子里存的却是简称。全称当别名不够（「CC BY-NC-SA」
     在本库中文名里被译成「署名—非商业性使用—相同方式共享」，
     正则派生出不来），所以显式登记。
     显式表优于正则：正则会随中文名措辞变动而失效，而这张表
     一眼能看出覆盖了哪些、漏了哪些。

     键用的是「旧 ID」而不是规范 code —— 数据源里的 id 是两位
     （PV-20 / MT-01），而 code 是三位（PV-020 / MT-001）。
     早先按 code 写表，结果一条都没命中，派生出的别名又把空格
     全删了（SD 1.5 → SD15），「CC0」这种更是压根派生不出来。
     两处症状同一个原因：查表用错了键。 */
  var SHORT = {
    "PV-20": ["CC0", "CC 0", "CC0 1.0"],
    "PV-21": ["PDM", "Public Domain Mark", "公共领域标记"],
    "PV-22": ["CC BY 4.0", "CC BY", "署名 4.0"],
    "PV-23": ["CC BY-NC-SA 4.0", "CC BY-NC-SA", "NC-SA", "禁止商用许可"],
    "MT-01": ["SD 1.5", "SD1.5", "Stable Diffusion 1.5", "SD 2.x", "SD2"],
    "MT-02": ["SDXL", "SDXL 1.0", "SDXL1.0"],
    "MT-03": ["SD 3.5", "SD3.5", "Stable Diffusion 3.5"],
    "MT-04": ["Flux.1 dev", "Flux dev", "Flux1 dev", "FLUX.1-dev"],
    "MT-05": ["Flux.1 schnell", "Flux schnell", "Flux schnell", "FLUX.1-schnell"],
    "MT-06": ["Midjourney v7", "MJ v7", "MJv7", "midjourney"],
    "MT-07": ["ComfyUI", "Comfy"],
    "MT-08": ["ControlNet", "IP-Adapter", "IPAdapter"],
    "MT-09": ["LoRA", "Lora"],
    "MT-10": ["GPT 图像", "Ideogram", "Firefly", "自然语言模型"],
    "MT-11": ["Turbo", "Lightning", "Hyper", "蒸馏模型"],
    "MT-12": ["社区底模", "社区微调", "Civitai 底模"]
  };

  /* 由名字压出紧凑写法：SD 1.5 → SD1.5、Flux.1 dev → Flux1dev。
     只删空格与点号，不删斜杠 —— 「Stable Diffusion 1.5 / 2.x」
     压成「StableDiffusion15/2x」虽怪但无害，而删斜杠会造出
     「StableDiffusion152.x」这种谁也猜不到的东西。 */
  function tightForm(name) {
    var s = String(name || "").trim();
    if (!s || !/[A-Za-z]/.test(s)) return [];
    var t = s.replace(/[\s.]+/g, "");
    return (t !== s && t.length >= 3) ? [t] : [];
  }

  function shortForms(id, name) {
    var out = (SHORT[id] || []).slice();
    return out.concat(tightForm(name))
      .filter(function (v, i, a) { return v && a.indexOf(v) === i; });
  }

  /* ---------- 登记一个条目 ---------- */
  function reg(kind, oldId, zh, en, extra) {
    var code = codeOf(oldId);
    if (!code) return null;
    extra = extra || {};
    /* 形态与段码都必须对。对不上就报出来并跳过 ——
       登记一条 code 不规范的条目，等于让库里的编码体系出现第二种形态，
       而这正是本轮要消灭的东西。不能静默放行。 */
    if (!CODES.checkShape(code)) {
      BADS.push(oldId + " → " + code + "（形态不合规）");
      return null;
    }
    var seg = SEG_OF_KIND[kind];
    if (!seg || CODES.segOf(code) !== seg) {
      BADS.push(oldId + " → " + code + "（段码应为 " + seg + "，实为 " +
        CODES.segOf(code) + "）");
      return null;
    }
    RESOLVER.register(code, oldId, zh, en, {
      kw: extra.kw || [],
      alt: extra.alt || [],
      obj: extra.obj || null,
      kind: kind,
      seg: seg,
      note: extra.note || ""
    });
    bump(seg);
    S.byKind[kind] = (S.byKind[kind] || 0) + 1;
    (S.bySeg[seg] = S.bySeg[seg] || []).push(code);
    return code;
  }

  /* 登记失败的条目。绝不丢弃：一条编不出合规 code 的数据，
     用户就永远查不到它，而查不到的原因在界面上完全看不出来。 */
  var BADS = [];

  /* ---------- 一 全球艺术地图 ---------- */
  D.PAINTERS.forEach(function (p) {
    reg("painter", p.id, p.zh, p.en || "", {
      kw: (p.tags || []).slice(0, 6),
      alt: (p.alt || []).slice(0, 6),
      obj: p
    });
  });
  D.MOVEMENTS.forEach(function (m) {
    reg("movement", m.id, m.zh, m.en || "", { obj: m });
  });
  D.WORKS.forEach(function (w) {
    reg("work", w.id, w.zh, w.en || "", {
      kw: [w.pid, w.collection].filter(Boolean).slice(0, 4),
      alt: (w.alt || []).slice(0, 4),
      obj: w
    });
  });

  /* ---------- 二 参考实体与关系 ---------- */
  D.MEDIUMS.forEach(function (m) {
    reg("medium", m.id, m.zh, m.en || "", { obj: m });
  });
  D.SUBJECTS.forEach(function (s) {
    reg("subject", s.id, s.zh, s.en || "", { obj: s });
  });

  /* 光学：组与词条分两层登记。
     组也要能查（用户可能只想看「光影组有什么」），但标为 meta，
     因为把「光影」两个字塞进提示词没有任何意义。 */
  (D.OPTICS || []).forEach(function (g) {
    reg("opticGroup", g.id, g.zh, "", {
      obj: g,
      note: "含 " + (g.items || []).length + " 个词条，用词条而非组本身"
    });
    (g.items || []).forEach(function (it) {
      /* 词条的 oldId 用它自己的 code —— 它本来就是规范编码生成的，
         没有历史 ID 可回溯，直接让 code 当主键。 */
      reg("optic", it.code, it.zh, it.t, {
        obj: { id: it.code, code: it.code, zh: it.zh, t: it.t, c: it.c,
               groupId: g.id, groupZh: g.zh, slot: g.slot }
      });
    });
  });

  /* ---------- 三 原子视觉模块 ---------- */
  D.ATOMS.forEach(function (a) {
    reg("atom", a.id, a.zh, a.t, {
      kw: [a.alt].filter(Boolean).slice(0, 3),
      alt: (a.alt || []).slice(0, 4),
      obj: a,
      /* 重复中文名要写清楚差异，否则用户看到两条同名会以为是数据错了 */
      note: a.role === "guard" ? "约束角色，强制进负面词"
          : a.role === "region" ? "分区角色，需成对使用"
          : a.role === "lead" ? "主导角色" : "辅助角色"
    });
  });

  /* ---------- 四 任务与成品模板 ---------- */
  D.TASKS.forEach(function (t) {
    reg("task", t.id, t.zh, "", { obj: t, note: (t.ask || "").slice(0, 30) });
  });
  D.SIGNATURES.forEach(function (g) {
    reg("signature", g.id, g.zh, "", { obj: g });
  });

  /* ---------- 五 组合与变形规则 ---------- */
  D.OPERATORS.forEach(function (o) {
    reg("operator", o.id, o.zh, o.en || "", {
      obj: o,
      note: "保留 " + (o.preserve || []).length + " 面 / 改 " +
            (o.change || []).length + " 面 / 禁 " + (o.forbid || []).length + " 项"
    });
  });
  D.CONFLICTS.forEach(function (c) {
    reg("conflict", c.id, c.zh, "", {
      obj: c, note: c.level + " 级 · " + (c.msg || "").slice(0, 26)
    });
  });

  /* ---------- 六 模型适配与验证 ---------- */
  (D.TESTS || []).forEach(function (t) {
    reg("model", t.id, t.zh, t.model || "", {
      kw: shortForms(t.id, t.zh).concat(shortForms("", t.model || "")),
      obj: t, note: "权重写法 " + (t.weightSyntax || "—")
    });
  });
  (D.PROVENANCE || []).forEach(function (p) {
    reg("provenance", p.id, p.zh, p.name || "", {
      kw: shortForms(p.id, p.zh),
      obj: p,
      note: (p.license || "") + (p.commercial === false ? " · 禁止商用" : "")
    });
  });

  /* ---------- 关系边：没有旧 ID，直接全局编号 RL-001~RL-306 ---------- */
  /* 306 条边如果不编码，就永远没法在组合串里表达「我要这条师承关系」。
     为什么全局连续而不是按类型各起一份（held_by 从 RL-001、uses 也从 RL-001）：
     那样 8 种类型会互相撞码 —— 306 条边实际只剩 45 个不同编码，
     「RL-001」指向哪条边完全说不清，引用就失去了意义。
     类型信息不靠编码承载，靠 kind 字段；想按类型筛选用 UI 的筛选项。 */
  S.relations = (D.RELATIONS || []).map(function (r, i) {
    r.code = "RL-" + CODES.pad3(i + 1);
    r.kindZh = {
      held_by: "收藏于", uses: "使用材料", student_of: "师承",
      influenced: "受其影响", serves: "服务于任务", realizes: "构成模块",
      derived_from: "派生自", aligned_with: "对齐任务"
    }[r.kind] || r.kind;
    /* 关系边不进 RESOLVER —— 它们不是可引用的零件，
       而是「这条边存在」的事实说明。放进 bySeg 只为了让 UI 的
       段码统计显示真实的 306 条，而不是一个空的 0。 */
    (S.bySeg.RL = S.bySeg.RL || []).push(r.code);
    return r;
  });
  bump("RL", S.relations.length);

  /* ---------- 段码说明：把实际条数回填，供 UI 显示 ---------- */
  S.SEGMENTS = CODES.SEGMENTS.map(function (s) {
    var n = (S.bySeg[s.code] || []).length;
    /* 光学拆成 OP 词条与 OG 分组两段，两段各自的条数要分开说，
       否则 UI 上「光学 94」会让人以为 94 个都是可投放的词。 */
    var kindMix = {};
    if (s.code === "OP") kindMix["光学词条"] = (S.byKind.optic || 0);
    if (s.code === "OG") kindMix["光学分组"] = (S.byKind.opticGroup || 0);
    return { code: s.code, layer: s.layer, zh: s.zh, desc: s.desc,
             count: n, kindMix: kindMix };
  });

  S.total = RESOLVER.entries.length;
  S.uncoded = CODES.UNCODED.concat(BADS);
  S.resolver = RESOLVER;
  S.codes = CODES;

  /* ---------- 便捷查询 ---------- */
  S.byCode = function (c) {
    var h = RESOLVER.index.byCode[String(c || "").toLowerCase()];
    return h && h[0];
  };
  /* 列出某段全部条目，供 UI 的「查看类型」用。
     RL 段是特例：关系边不在 RESOLVER 里（它们不是可引用的零件），
     所以按对象形态分开返回，UI 那边也要分开渲染。 */
  var relByCode = {};
  (S.relations || []).forEach(function (r) { relByCode[r.code] = r; });

  S.listSeg = function (seg) {
    if (seg === "RL") {
      return (S.bySeg.RL || []).map(function (c) { return relByCode[c]; })
        .filter(Boolean);
    }
    return (S.bySeg[seg] || []).map(function (c) { return S.byCode(c); })
      .filter(Boolean);
  };
  /* 某一段里「能直接进提示词」的条目数 —— 元层条目不进 spec，
     UI 上要把这个差别显示出来，否则用户会以为随便点哪个都行。 */
  S.composableCount = function (seg) {
    if (seg === "RL") return 0;
    return (S.bySeg[seg] || []).filter(function (c) {
      var e = S.byCode(c);
      return e && COMPOSABLE[e.kind];
    }).length;
  };
  /* 旧写法 → 规范 code。给解析器与界面用：
     用户手里已有的 AM-101 / P-IT-007 / G-01 都要继续能查。 */
  S.toCode = function (input) {
    var q = String(input == null ? "" : input).trim().toLowerCase();
    if (!q) return null;
    if (CODES.CODE_OF[String(input).toUpperCase()]) {
      return String(input).toUpperCase();
    }
    return CODES.ALIASES[q] || null;
  };

  return S;
}