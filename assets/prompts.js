/* ============================================================
 * prompts.js —— 每条编码对应的那一段提示词
 * ============================================================
 * 用户的原话：「每一个名称或是编码对应的提示词怎么没有？web UI 也没有？」
 *
 * 之前只有「组合才出词」这一条路：
 *   输入一串编码 → toSpec() → 引擎出 tags/neg/gpt
 *   但单独问一句「PA-125 到底是几段词」，库里答不出来。
 *   编码工作台给的是 spec JSON，那是给引擎吃的中间态，
 *   不是能粘进 SD/MJ 的提示词 —— 用户要的是后者。
 *
 * 所以这一层做的事只有一件：给库里每一条登记条目，
 * 单独把它放进引擎跑一次，产出这段提示词本身。
 *
 * 三档完整性（必须标出来，否则用户会误用）：
 *   full  可直接出图。题材 / 画家 / 流派 / 名画 / 媒介 / 签名卡 / 任务模板
 *         ——它们自带主体或主体足够明确，单独拿出来就是一条完整提示词。
 *   part  只是零件。原子模块 / 光学词条 / 算子 ——它们改的是别人的画面，
 *         单独跑只会得到一句孤零零的约束词。
 *         所以额外给一份 withBase：挂在一个写明的演示基底上跑通，
 *         让人看到它正常怎么用。基底是写死的演示件，不是推荐配方。
 *   none  不进提示词。来源许可 / 模型实测 / 冲突规则 / 光学分组 / 关系边
 *         ——它们是查证与流程用的，硬塞进提示词只会得到莫名其妙的结果。
 *
 * 两条硬约定：
 *   1. 这一层只做「取词」，不新增任何创作判断。
 *      提示词全部由 FORGE.compose 产出，本文件不拼一个词。
 *      一旦这里手写词面，它就会和引擎的裁决逻辑各说各话。
 *   2. 不缓存到磁盘。提示词是引擎的派生物，引擎一改就得全量重算；
 *      写死一份 JSON 就会漂移。导出交给 tools/build_prompts.js 现算。
 * ============================================================ */
var PROMPTS = (function () {

  /* ---------- 依赖：两端拿法不同 ----------
     浏览器：全部由 <script> 挂到 window。
     Node：CommonJS 里 var 是模块作用域，必须显式 require。
     取全局容器时统一走 (typeof window !== "undefined" ? window : globalThis)
     而不是裸标识符 —— 裸标识符在这里会撞上同名的 getter 函数自己。 */
  var _FORGE = null, _REG = null, _RES = null;
  function g(name) {
    var w = (typeof window !== "undefined" ? window
           : (typeof globalThis !== "undefined" ? globalThis : null));
    return (w && w[name]) || null;
  }
  function getForge() {
    if (!_FORGE) _FORGE = g("FORGE") ||
      (typeof require !== "undefined" ? require("./forge-kit.js").FORGE : null);
    return _FORGE;
  }
  function getReg() {
    if (!_REG) _REG = g("REGISTRY") ||
      (typeof require !== "undefined" ? require("./registry.js").REGISTRY : null);
    return _REG;
  }
  function getRes() {
    if (!_RES) _RES = g("RESOLVER") ||
      (typeof require !== "undefined" ? require("./resolver.js").RESOLVER : null);
    return _RES;
  }

  /* ---------- 零件的演示基底 ----------
     写死并且公开写明，是因为「零件单独不能出图」这件事必须可见：
     如果偷偷给它配一个基底，用户会以为原子模块本身就是完整配方。 */
  var DEMO_BASE = { subjects: ["S-01"], strength: 1.0, platform: "sd" };
  var DEMO_BASE_ZH = "单人肖像（题材里最中性的一条）";

  /* ---------- 各类条目怎么变成一份 spec ----------
     这里只做「引用形状」的翻译，不加任何风格判断。
     optic 例外：词条在数据里没有独立 id，引擎认的是「组号.裸词」。 */
  function specOf(kind, e) {
    var o = e.obj || {};
    switch (kind) {
      case "painter":   return { painters: [o.id] };
      case "movement":  return { movements: [o.id] };
      case "medium":    return { mediums: [o.id] };
      case "subject":   return { subjects: [o.id] };
      case "work":      return { works: [o.id] };
      case "operator":  return { operators: [o.id] };
      case "atom":      return { atoms: [o.id] };
      case "optic":     return { optics: [o.groupId + "." + o.t] };
      /* 签名卡与任务模板本来就带着一整套配好或建议好的 spec，
         直接取用；没有 spec 的（如任务模板只给了 default）落到下面兜底。 */
      case "signature": return o.spec ? clone(o.spec) : null;
      case "task":      return o.default ? clone(o.default) : null;
      default:          return null;
    }
  }

  /* 完整度：能直接出图 / 只是零件 / 不进提示词 */
  var GRADE = {
    painter: "full", movement: "full", medium: "full",
    subject: "full", work: "full",
    signature: "full", task: "full",
    operator: "part", atom: "part", optic: "part",
    opticGroup: "none", conflict: "none", provenance: "none", model: "none"
  };

  var GRADE_ZH = {
    full: "可直接出图",
    part: "零件，需搭配基底",
    none: "不进提示词"
  };

  /* 元层条目为什么不能当零件用 —— 与 REGISTRY.META_KINDS 同一套理由，
     这里给的是「用户视角的一句话」，META_KINDS 给的是引擎视角的标签。 */
  var NONE_WHY = {
    opticGroup: "这是一个分组，用它下面的词条（OP-004 这样）而不是它本身",
    conflict:  "这是引擎自动执行的裁决规则，提示词里不该出现规则本身",
    provenance:"这是来源与授权登记，用来判断能不能商用，不是画面内容",
    model:     "这是模型实测记录（语法、CFG、步数、失败类型），换模型前查证用",
    relation:  "这是一条关系事实（师承、收藏、影响），说明实体之间关系，不是视觉零件"
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- 中文对照与效果说明 ----------
     两条硬规则：

     1. explain = 引擎产出的效果说明，一句中文说清「这条词面会怎样」。
        全部由 compose 结果派生（成分、负面强制、画质档、警告），不手写一句。
        它是转述的最低配：任何把提示词转述给别人的场合必须带上它。

     2. zhGpt = 中文对照正文。词条级中文来自数据源（原子模块 / 光学词条
        都有 zh 字段，题材 / 媒介 / 流派 / 名画都有中文名）；
        画家的七面细节词面只有英文，用画家的中文简介（desc）概括，
        **不做逐词硬译** —— 数据里没有的东西不编。

     为什么不是手写中文版：779 条手写中文正文是两处维护，
     引擎一改英文词面，中文版立刻漂移 —— 而且漂移看起来完全正常。
     派生版永远跟着引擎走。 */
  var IDX = null;
  function entryBy(reg, kind, id) {
    /* byKind 是计数表不是条目表 —— 拿它当列表用会得到
       「list.filter is not a function」。条目真身在 RESOLVER.entries，
       这里按 kind+oldId 建一次性索引（登记只发生一次，索引不会过期）。 */
    if (!IDX) {
      IDX = {};
      var res = getRes();
      (res ? res.entries : []).forEach(function (e) {
        IDX[e.kind + "|" + e.oldId] = e;
      });
    }
    return IDX[kind + "|" + id] || null;
  }

  function explainOf(hit, solo, spec) {
    if (!solo || solo.error) return "";
    var bits = [];
    var names = [];
    function push(kind, ids) {
      (ids || []).forEach(function (id) {
        var e = entryBy(getReg(), kind, id);
        if (e) names.push(e.zh + "（" + (getReg().KIND_ZH[kind] || kind) + "）");
      });
    }
    /* 光学词条的 spec 写法是 O-01.chiaroscuro，登记记录按 oldId 存 */
    (spec.optics || []).forEach(function (o) {
      var e = entryBy(getReg(), "optic", o.split(".")[0]);
      if (e) names.push(e.zh + "（光学词条）");
    });
    push("painter", spec.painters); push("movement", spec.movements);
    push("medium", spec.mediums); push("subject", spec.subjects);
    push("work", spec.works); push("operator", spec.operators);
    push("atom", spec.atoms); push("signature", spec.signatures);
    if (names.length) bits.push("由 " + names.length + " 个成分驱动：" + names.join("＋"));
    if (solo.guardAtoms && solo.guardAtoms.length) {
      bits.push(solo.guardAtoms.length + " 条硬约束强制进负面");
    }
    if (solo.usedOps && solo.usedOps.length) {
      bits.push("生效算子：" + solo.usedOps.length + " 个");
    }
    if (solo.regionAtoms && solo.regionAtoms.length) {
      bits.push("局部模块 " + solo.regionAtoms.length + " 条需配遮罩");
    }
    /* 画作标题隔离：这些词是具体画作不是题材，进 tags 会复刻名画。
       说明必须写进 explain —— 用户看到「达·芬奇的常见题材少了
       两幅画」时，答案在这里，不在他本人的猜测里。 */
    if (solo.isolatedMotif && solo.isolatedMotif.length) {
      bits.push(solo.isolatedMotif.length + " 个代表性题材是具体画作标题（" +
        solo.isolatedMotif.map(function (x) { return x.zh; }).join("、") +
        "），已移至垫图参考区，不进构图词面");
    }
    /* 在世艺术家的姓名不进词面（NAME_POLICY）。不写出来，
       用户会以为库漏了风格锚定 —— 而这是有意的纪律。 */
    if (solo.aliveSources && solo.aliveSources.length) {
      bits.push(solo.aliveSources.map(function (x) { return x.zh; }).join("、") +
        " 为在世艺术家，姓名按约定不进词面，以七面锚定画风");
    }
    /* 原话追加：用户自己的句子不在任何一面里，只追加在词面末尾 */
    if (solo.freeText && solo.freeText.length) {
      bits.push("含 " + solo.freeText.length + " 句作者原话（" +
        solo.freeText.join("、") + "），追加在词面末尾，不参与冲突裁决");
    }
    bits.push("画质档 " + solo.tier);
    if (solo.warnings && solo.warnings.length) {
      bits.push("警告 " + solo.warnings.length + " 条（含" +
        (solo.experimental ? "未验证的实验性配对" : "冲突提示") + "）");
    }
    return bits.join("；") + "。";
  }

  function zhGptOf(hit, spec) {
    var reg = getReg();
    if (!reg) return "";
    var s = [];
    function zhList(kind, ids) {
      var out = [];
      (ids || []).forEach(function (id) {
        var e = entryBy(reg, kind, id);
        if (e) out.push(e.zh);
      });
      return out;
    }
    /* 主体：题材有中文名与中文提醒（desc/note 是创作提醒，不是词面，不混入） */
    var subj = zhList("subject", spec.subjects);
    if (spec.subjectFree) subj = [spec.subjectFree];
    s.push("画面主体：" + (subj.join("、") || "单一清晰主体") + "。");
    /* 画家：名字激活 + 中文简介概括风格（七面词面只有英文，不硬译） */
    (spec.painters || []).forEach(function (id) {
      var e = entryBy(reg, "painter", id);
      if (!e) return;
      var o = e.obj || {};
      /* desc 自带句号，去重 —— 不处理就是「长出来。。」这种双句号 */
      var d = (o.desc || "").replace(/。$/, "");
      s.push("以" + e.zh + "的方式绘制" + (d ? "：" + d + "。" : "。"));
    });
    (spec.movements || []).forEach(function (id) {
      var e = entryBy(reg, "movement", id);
      if (e) s.push("整体处于" + e.zh + "的语言之中。");
    });
    /* 原子 / 光学：词条级中文直接可用 */
    (spec.atoms || []).forEach(function (id) {
      var e = entryBy(reg, "atom", id);
      if (e && e.obj) s.push(e.obj.slot === "light" ? "光线：" : "约束：");
      if (e && e.obj) s[s.length - 1] += e.obj.zh + " — " + (e.obj.c || "") + "。";
    });
    (spec.optics || []).forEach(function (o) {
      var e = entryBy(reg, "optic", o.split(".")[0]);
      if (e && e.obj) s.push(e.zh + "（" + e.obj.groupZh + "）：" + (e.obj.c || "") + "。");
    });
    (spec.mediums || []).forEach(function (id) {
      var e = entryBy(reg, "medium", id);
      if (e) s.push("媒介：" + e.zh + "。");
    });
    (spec.works || []).forEach(function (id) {
      var e = entryBy(reg, "work", id);
      if (e) s.push("参考作品：" + e.zh + "。");
    });
    (spec.operators || []).forEach(function (id) {
      var e = entryBy(reg, "operator", id);
      if (e) s.push("变形：" + e.zh + "。");
    });
    s.push("不要文字、不要标志、不要水印。");
    s.push("（中文对照为派生说明：词条级中文来自数据源，画家的细节词面以中文简介概括，"
      + "出图请以英文词面为准。）");
    return s.join("");
  }

  /* ---------- 缓存 ----------
     同一编码在 Web UI 里会被反复点（渲染一次就要一次）。
     compose 是纯函数（除引擎内部那个 decided 变量外没有副作用），
     所以按「编码 + 平台 + 强度」缓存是安全的。 */
  var cache = {};
  function cached(key, fn) {
    if (cache[key]) return cache[key];
    var v = fn();
    cache[key] = v;
    return v;
  }
  function clearCache() { cache = {}; }

  function run(spec) {
    var f = getForge();
    if (!f || !spec) return null;
    try {
      var r = f.compose(spec);
      return {
        tags: r.tags, neg: r.neg, gpt: r.gpt,
        tier: r.tier, words: r.counts ? r.counts.words : 0,
        warnings: r.warnings || [], changes: r.changes || [],
        experimental: !!r.experimental,
        usedOps: r.usedOps || [], usedAtoms: r.usedAtoms || [],
        guardAtoms: r.guardAtoms || [], regionAtoms: r.regionAtoms || [],
        /* 画作标题隔离与在世姓名纪律的结果要原样带出来：
           explain 与面板都靠这两个字段说话。漏带的后果是
           纪律生效了但界面上看不出，用户以为库漏数据。 */
        isolatedMotif: r.isolatedMotif || [],
        aliveSources: r.aliveSources || [],
        freeText: r.freeText || []
      };
    } catch (e) {
      return { error: String(e && e.message || e) };
    }
  }

  /* ---------- 主入口：查一条编码对应的提示词 ---------- */
  /* 走 RESOLVER.resolve 而不是 reg.byCode：
     后者只认规范码，用户手里已有的 P-IT07 / AM-101 / AM-A-001
     会查不到 —— 而这三种写法在界面上都是被鼓励的输入方式。
     解析器已经把八种写法收敛到同一条目，这里只取结果。 */
  function of(code, opt) {
    opt = opt || {};
    var reg = getReg(), res = getRes();
    if (!reg || !res) return null;
    var r = res.resolve(code);
    if (r.ok) return ofEntry(r.hits[0], opt);
    /* 关系边不在 RESOLVER 里（它们不是可引用零件），
       但仍然要答得出「RL-001 有没有提示词」——答案是没有，附原因。 */
    var rel = (reg.relations || []).filter(function (x) {
      return x.code === String(code || "").toUpperCase();
    })[0];
    return rel ? relationNote(rel) : null;
  }

  /* 直接给一条已登记的条目（工作台按 code 拿得到 hit 时走这条，省一次查表） */
  function ofEntry(hit, opt) {
    opt = opt || {};
    var e = hit;
    var grade = GRADE[e.kind] || "none";
    var base = { code: e.code, oldId: e.oldId, kind: e.kind,
                 kindZh: (getReg().KIND_ZH || {})[e.kind] || e.kind,
                 zh: e.zh, en: e.en, note: e.note || "",
                 grade: grade, gradeZh: GRADE_ZH[grade] };

    if (grade === "none") {
      base.why = NONE_WHY[e.kind] ||
        ((getReg().META_KINDS || {})[e.kind]) || "这一层是查证与流程用的，不进提示词";
      return base;
    }

    var platform = opt.platform || "sd";
    var strength = opt.strength != null ? opt.strength : 1.0;
    var spec = specOf(e.kind, hit);
    if (!spec) {
      base.grade = "none";
      base.why = "这一条没有可用的 spec（数据缺字段），不是「不进提示词」而是真的取不到词";
      return base;
    }
    spec.platform = platform;
    spec.strength = strength;

    base.spec = spec;
    base.platform = platform;
    base.strength = strength;
    base.solo = cached("solo|" + e.code + "|" + platform + "|" + strength,
      function () { return run(spec); });

    /* explain 是转述的最低配（anime 库硬规则的继承）：
       任何把这段词面转述给别人的场合必须带上它。 */
    base.explain = explainOf(hit, base.solo, spec);
    /* 中文对照：词条级派生，不是逐词翻译，出图以英文词面为准 */
    base.zhGpt = zhGptOf(hit, spec);

    /* 零件额外给一份「挂在演示基底上」的可用版本 */
    if (grade === "part") {
      var wspec = clone(spec);
      (wspec.subjects || []).forEach(function (s) { wspec.subjects = [s]; });
      wspec.subjects = DEMO_BASE.subjects.slice();
      wspec.platform = platform;
      wspec.strength = strength;
      base.withBase = cached("wb|" + e.code + "|" + platform + "|" + strength,
        function () { return run(wspec); });
      base.baseSpec = clone(DEMO_BASE);
      base.baseZh = DEMO_BASE_ZH;
    }
    return base;
  }

  /* ---------- 批量：全库一次性出表，供导出与测试用 ---------- */
  function all(opt) {
    var reg = getReg(), res = getRes();
    if (!reg || !res) return [];
    return res.entries.map(function (hit) { return ofEntry(hit, opt); })
      .filter(Boolean);
  }

  /* 关系边没有 code→RESOLVER 通路（它们不是可引用零件），单独给一条说明。
   注意边的字段名是 from / to，不是 src / dst —— 写错的话
   「R-001 → undefined」会显示给用户看。 */
  function relationNote(r) {
    return {
      code: r.code, kind: "relation", kindZh: r.kindZh || "关系",
      zh: r.from + " → " + r.to, grade: "none", gradeZh: GRADE_ZH.none,
      why: NONE_WHY.relation,
      note: r.note || ""
    };
  }

  /* ---------- 任意 spec 的入口：组合区与抽卡区共用 ----------
     of() 只回答「单条编码是什么」，组合串和抽卡拿到的是整个 spec，
     它们同样需要 explain 与中文对照 —— 而且必须与单条同源派生，
     两套写法迟早漂移。 */
  function ofSpec(spec, opt) {
    opt = opt || {};
    var s = clone(spec || {});
    s.platform = opt.platform || "sd";
    s.strength = opt.strength != null ? opt.strength : 1.0;
    var solo = run(s);
    return {
      spec: s, solo: solo,
      explain: solo && !solo.error ? explainOf(null, solo, s) : "",
      zhGpt: solo && !solo.error ? zhGptOf(null, s) : ""
    };
  }

  return {
    of: of, ofEntry: ofEntry, ofSpec: ofSpec, all: all, relationNote: relationNote,
    specOf: specOf, GRADE: GRADE, GRADE_ZH: GRADE_ZH,
    DEMO_BASE: DEMO_BASE, DEMO_BASE_ZH: DEMO_BASE_ZH,
    clearCache: clearCache
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { PROMPTS: PROMPTS };