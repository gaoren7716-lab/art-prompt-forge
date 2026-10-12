/* ============================================================
 * model-prompts.js —— 同一组合 × 12 份模型实测 = 每个模型一份词面
 * ============================================================
 * 【为什么需要这一层】（多模型词面策略，决策表由本库 12 份模型实测派生）
 *
 *   引擎 compose 已经按平台改了权重语法（mj 用 `词::1.00`、flux 重复即强调），
 *   但这只解决了「括号长什么样」。三件套（tags / neg / gpt）在不同模型上的
 *   **取舍**完全不同：
 *
 *     SD 系        三件套都吃：tags 进正向、neg 进负面通道、gpt 可选
 *     Flux         T5 编码器吃整段散文；权重与标签流低效，负面词不可靠
 *     Midjourney   只吃逗号标签 + -- 参数；负面词必须写成 --no 串，
 *                  整段正文会被当成一堆乱码词
 *     自然语言系    正文为主，标签流会把画面压平
 *
 *   把三件套原样发给所有模型，界面看不出任何异常 ——
 *   用户只会得出「这个库提示词不行」的结论。
 *
 * ------------------------------------------------------------ 
 * 【这一层的信息分类（按本库四类约定，混用会出事）】
 *
 *   下面的「各模型怎么取舍」是 **read：工程判断**。
 *   依据有二：TESTS 里 status:"tested" 的实测字段（promptStyle /
 *   naturalLang / negPrompt），以及业界公开的模型说明。
 *   只有 Sana 通道一类真出过图的结论才是 test；本层整体保持 read，
 *   将来逐模型实测后把对应条目升级为 test，**不要整张表一起升级**。
 *
 * ------------------------------------------------------------ 
 * 【两条硬约定】（继承自 anime 库 model-prompts.js 的教训）
 *
 *   ① **只做语法变换，不新增创作词。**
 *      词面全部来自 compose 产出，本层只做：去权重 / 重组负面 / 换主词面。
 *      在这里手写任何风格词，它就会和引擎的裁决各说各话。
 *
 *   ② **只读不写引擎。** adapt() 拿到的是 compose 结果的快照，
 *      只返回新对象；改传入参数会在抽卡、面板等并发使用处互相污染。
 *
 *   ③ **禁项不许丢。** 各平台的否定写法不同（否定句 / --no / 负面通道），
 *      但「不要文字、不要水印」必须以该模型的方式出现，谁都不许静默省略。
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) {
  var _MPD = require("./data-core.js");
}
var MODEL_PROMPTS = (function () {

  /* ---------- 依赖容器：与 prompts.js 同一套取法 ----------
     裸标识符会撞上同名 getter 自己（递归到爆栈），必须走容器。 */
  function g(name) {
    var w = (typeof window !== "undefined" ? window
           : (typeof globalThis !== "undefined" ? globalThis : null));
    return (w && w[name]) || null;
  }
  function tests() {
    return g("TESTS") || (_MPD && _MPD.TESTS) || [];
  }
  function works() {
    return g("WORKS") || (_MPD && _MPD.WORKS) || [];
  }
  function relations() {
    return g("RELATIONS") || (_MPD && _MPD.RELATIONS) || [];
  }
  /* REGISTRY 在 Node 下不在容器里 —— CommonJS 的 var 是模块作用域，
     必须显式 require；浏览器里由 <script> 顶层 var 挂到 window。 */
  function registry() {
    return g("REGISTRY") ||
      (typeof require !== "undefined" ? require("./registry.js").REGISTRY : null);
  }

  /* ---------- 权重语法剥离 ----------
     MJ / 自然语言系不吃 (词:1.00) 与 词::1.00，原样粘贴会变成字面字符。
     这里只删语法壳，不改词本身。 */
  function stripWeight(tag) {
    var m = tag.match(/^\((.*):[0-9.]+\)$/);
    if (m) return m[1];
    m = tag.match(/^(.*)::[0-9.]+$/);
    if (m) return m[1];
    return tag;
  }
  function stripAllWeights(tagsStr) {
    return tagsStr.split(/,\s*/).map(function (t) {
      return stripWeight(t.trim());
    }).filter(Boolean).join(", ");
  }

  /* ---------- 平台 → 默认模型 ----------
     面板按平台切换， advice 给该平台的本库基线模型：
     SD 系基线是 SDXL（models.js 明确写了「本库的建议配置以 SDXL 为基线」）。 */
  var PLATFORM_MODEL = {
    sd: "MT-02",    /* SDXL */
    mj: "MT-06",    /* Midjourney v7 */
    flux: "MT-04",  /* Flux.1 dev */
    gpt: "MT-10"    /* 自然语言模型 */
  };
  function modelOf(platform) {
    return PLATFORM_MODEL[platform] || "MT-02";
  }

  /* ---------- 从 TESTS 字段派生的参数建议 ----------
     全部来自实测记录，不手写一条新建议。 */
  function adviceOf(t) {
    var out = [];
    if (!t) return out;
    if (t.cfg) out.push("CFG " + t.cfg[0] + "-" + t.cfg[1] + "（默认 " + t.cfgDefault + "）");
    if (t.steps) out.push("步数 " + t.steps[0] + "-" + t.steps[1]);
    if (t.weightRange) out.push("权重甜区 " + t.weightRange[0] + "-" + t.weightRange[1] +
      "（" + t.weightSyntax + "）");
    if (t.promptStyle) out.push("写法：" + t.promptStyle);
    if (t.sampler) out.push("采样器：" + t.sampler);
    (t.failTypes || []).forEach(function (f) { out.push("已知坑：" + f); });
    if (t.note) out.push(t.note);
    return out;
  }

  /* ---------- 主入口：把 compose 产出改写成某个模型的词面 ----------
     solo = PROMPTS.ofEntry(...).solo（含 tags / neg / gpt）。
     返回 { main, neg, extra, advice[], note[] }，全部是纯文本变换。 */
  function adapt(solo, modelId) {
    if (!solo || solo.error) return null;
    var t = tests().filter(function (x) { return x.id === modelId; })[0];
    if (!t) return null;
    var fam = t.family;

    var out = {
      model: t.id, zh: t.zh, family: fam,
      status: t.status,                       /* tested / written —— read 的证据等级 */
      main: "", neg: "", extra: "",
      advice: adviceOf(t),
      note: []
    };

    if (fam === "midjourney") {
      /* MJ：只要标签流。权重语法剥离；负面词整体改写为 --no 串；
         正文不给 —— 整段散文会被 MJ 当成乱码词。 */
      out.main = stripAllWeights(solo.tags);
      out.neg = "";
      out.extra = "--no " + solo.neg.split(/,\s*/).join(", ");
      out.note.push("负面词已并入 --no 参数；画幅用 --ar 自行指定，本库不替你决定。");
      out.note.push("自然语言正文不适用于 MJ，已省略。");
    } else if (fam === "flux") {
      /* Flux：T5 编码器，整段散文最高效。标签流与负面词都舍弃 ——
         权重语法在这里是字面字符，负面通道不可靠（见 MT-04 实测）。 */
      out.main = solo.gpt;
      out.neg = "";
      out.extra = "";
      out.note.push("Flux 走整段正文；tags 与负面词已省略，强调靠重复关键词本身。");
    } else if (fam === "nlp") {
      /* 自然语言系（GPT-Image 类）：正文为主，附一行无权重的关键风格词。 */
      out.main = solo.gpt;
      out.neg = "";
      out.extra = stripAllWeights(solo.tags);
      out.note.push("正文为主；下方关键风格词可作为补充指令或省略。");
    } else if (fam === "classic" || fam === "sdxl" || fam === "sd3") {
      /* SD 系：三件套原样。权重甜区与 CFG 见建议区。 */
      out.main = solo.tags;
      out.neg = solo.neg;
      if (fam === "sd3") {
        out.note.push("SD 3.5 也读自然语句：正文可与 tags 并用，不必二选一。");
      }
    } else {
      /* any / distilled / community：随底层模型，给最保守的三件套。 */
      out.main = solo.tags;
      out.neg = solo.neg;
      out.note.push("该记录适用于「随底层模型」的场景（LoRA / ControlNet / 蒸馏 / 社区底模），"
        + "词面按 SD 系给出，实际行为随你的底层模型。");
    }

    /* 实验性标注必须穿透到每个模型 —— 不能在 SD 上有、到 MJ 上就丢了 */
    if (solo.experimental) out.note.push("含未验证的实验性配对，结果不保证。");
    return out;
  }

  /* ---------- 垫图兜底与参考隔离 ----------
     对画家库来说，名画就是天然的参考图：画家的名字激活不稳时，
     垫一张他的真迹是激活画风的最强手段。但垫图必须配隔离指令 ——
     否则模型会把名画的**内容**（人物、构图、故事）一起搬进来，
     用户要的是「用他的方式画我的主题」。 */
  var ISOLATION = {
    zh: "所附图片仅用于参考画风：只提取画家的笔触、光影、用色与整体视觉语言；"
      + "不要复制或延续参考图中的任何主体、人物、构图、场景或故事。"
      + "画面内容完全以你的主题为准。",
    en: "Use the attached image only as a style reference. Extract only the painter's "
      + "brushwork, lighting, palette, and overall visual language. Do not copy or carry "
      + "over any subject, figure, composition, setting, or story from the reference image. "
      + "The image content follows your theme only."
  };

  /* 查一个编码（当前按画家）名下有哪些馆藏名画可垫。
     链接只给可查端点：Wikidata QID 是稳定标识，能构造出确定有效的 URL。 */
  function reference(code) {
    var R = registry();
    var W = works();
    var pid = null, zh = "", en = "";
    if (R && R.resolver) {
      var r = R.resolver.resolve(code);
      if (r.ok && r.hits[0].kind === "painter") {
        pid = r.hits[0].oldId; zh = r.hits[0].zh; en = r.hits[0].en;
      }
    }
    if (!pid) return null;
    /* 博物馆不在 WORKS.collection 上（只有 10/104 填了），主体在关系表
       的 held_by 边里（W-59 → 卢浮宫）。两处都查，去重后合并。 */
    var held = {};
    relations().forEach(function (r) {
      if (r.kind === "held_by" && r.from && r.from.indexOf("W-") === 0) {
        held[r.from] = r.to;
      }
    });
    var list = W.filter(function (w) { return w.pid === pid; }).map(function (w) {
      return {
        zh: w.zh, en: w.en,
        collection: w.collection || held[w.id] || "",
        url: w.src && w.src.qid ? "https://www.wikidata.org/wiki/" + w.src.qid : ""
      };
    });
    return {
      painter: { id: pid, zh: zh, en: en },
      works: list,
      hasReference: list.length > 0,
      isolation: ISOLATION,
      /* 为什么不给「一定能搜到图」的承诺：馆藏开放政策不同，
         有的能直接下载、有的只能在线看。链接只保证「可查证」，不保证可下载。 */
      note: list.length
        ? "以下真迹可作垫图 / 风格参考（用低重绘幅度的 img2img 或 IP-Adapter 风格通道），务必配合隔离指令："
        : "该画家名下暂无收录名画，垫图兜底不可用 —— 请用文字激活（画家名 + 核心风格词），或自备该画家的合法图源。"
    };
  }

  /* ---------- 决策表：给导出与外部工具用 ----------
     每个模型一行：主词面用什么、负面走什么通道、何时建议垫图。
     与 adapt() 同源派生，不另写一份 —— 两份迟早漂移。 */
  function capabilities() {
    return tests().map(function (t) {
      var fam = t.family;
      var strat;
      if (fam === "midjourney")      strat = "tags-only + --no";
      else if (fam === "flux")       strat = "prose-only";
      else if (fam === "nlp")        strat = "prose-primary + traits-line";
      else if (fam === "classic" || fam === "sdxl" || fam === "sd3") strat = "tags + neg + prose";
      else                           strat = "tags + neg（随底层模型）";
      return {
        id: t.id, zh: t.zh, model: t.model, family: fam, status: t.status,
        strategy: strat,
        weightSyntax: t.weightSyntax || "",
        naturalLang: t.naturalLang || "",
        advice: adviceOf(t),
        referenceFallback: fam === "nlp" || fam === "flux"
          ? "名字激活通常足够；不稳时再垫图"
          : "建议直接垫名画 + 隔离指令"
      };
    });
  }

  return {
    adapt: adapt, adviceOf: adviceOf, modelOf: modelOf,
    reference: reference, capabilities: capabilities,
    ISOLATION: ISOLATION, stripAllWeights: stripAllWeights,
    PLATFORM_MODEL: PLATFORM_MODEL
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { MODEL_PROMPTS: MODEL_PROMPTS };
