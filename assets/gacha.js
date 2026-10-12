/* ============================================================
 * gacha.js —— 抽卡引擎（吸收自 anime-prompt-library 的 gacha 设计）
 * ============================================================
 * 抽卡 = 从库存里随机抽一组组合。它不是「同一提示词换 seed」
 * ——那是同一张图看六遍 —— 而是每个槽各抽一条，
 * 抽出来的才是「没见过的组合」。
 *
 * ------------------------------------------------------------ 
 * 设计目标只有一个：**库升级时抽卡不用改。**（继承 anime 库三条约定）
 *
 *   ① 槽位声明式：槽从「可组合段」声明，段码改了只改声明表；
 *      候选数、组合空间每次现算，不缓存 —— 缓存会在库升级后
 *      显示一个旧数字，而「数字停在旧规模上」看起来完全正常，只是它在说谎。
 *
 *   ② 候选为 0 的槽必须自报。少一层约束的提示词照样能出图，
 *      只是出的不是你要的东西 —— 这类「不报错、只是效果不对」
 *      的失败最难查。所以 roll() 返回 missing[]。
 *
 *   ③ 不碰全局状态。抽卡结果是一个独立对象，宿主想用
 *      「把它填进工作台」必须显式点按钮 —— 抽卡本身绝不改用户的输入框。
 *
 *   ④ rng 可注入。测试需要可复现的序列，Math.random 不可复现；
 *      roll(rng) 允许传入伪随机函数，不传则用 Math.random。
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) {
  var _GAC = require("./data-core.js");
}
var GACHA = (function () {

  function g(name) {
    var w = (typeof window !== "undefined" ? window
           : (typeof globalThis !== "undefined" ? globalThis : null));
    return (w && w[name]) || null;
  }
  function registry() {
    return g("REGISTRY") ||
      (typeof require !== "undefined" ? require("./registry.js").REGISTRY : null);
  }

  /* ---------- 槽位声明表 ----------
     must  槽抽空则整抽作废（missing[] 自报）。
     p     可选槽被抽中的概率（0-1）。
     min/max 该槽抽几条。画家库的组合常识：一个画家定调，
             一个题材定主体；光线与约束各 1-2 条让画面立起来；
             流派 / 名画 / 媒介 / 算子是调味，可抽可不抽。
     概率不是「权重评分」，是探索广度 —— 想固定组合请用编码工作台。 */
  var SLOTS = [
    { seg: "PA", zh: "画家",     must: true,  p: 1,   min: 1, max: 1 },
    { seg: "SJ", zh: "题材",     must: true,  p: 1,   min: 1, max: 1 },
    { seg: "AT", zh: "原子模块", must: true,  p: 1,   min: 1, max: 2 },
    { seg: "OP", zh: "光学词条", must: true,  p: 1,   min: 1, max: 2 },
    { seg: "MV", zh: "流派",     must: false, p: 0.35, min: 1, max: 1 },
    { seg: "WK", zh: "名画",     must: false, p: 0.2,  min: 1, max: 1 },
    { seg: "MD", zh: "媒介",     must: false, p: 0.3,  min: 1, max: 1 },
    { seg: "OR", zh: "变形算子", must: false, p: 0.25, min: 1, max: 1 }
  ];

  /* kind → spec 字段名。登记层的 kind 与引擎 spec 的键名不同，
     这里显式对照，不猜。
     光学词条的 spec 写法是裸词或「组号.裸词」，不是 oldId ——
     漏掉这个映射的后果是：OP 槽照抽、照显示、
     但抽到的词永远不进 spec，出图结果里根本没有它，
     而「组合区列出了 8 个成分」看起来一切正常。 */
  var KIND_TO_SPEC = {
    painter: "painters", movement: "movements", work: "works",
    medium: "mediums", subject: "subjects", operator: "operators",
    atom: "atoms", signature: "signatures", optic: "optics"
  };

  function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  /* 组合空间：must 槽的候选数连乘 × 可选槽的（候选+1）。
     每次现算 —— 这就是「抽卡能抽到没见过的组合」的数学边界。 */
  function pool() {
    var R = registry();
    if (!R) return { space: 0, slots: [] };
    var rows = SLOTS.map(function (s) {
      var list = (R.listSeg(s.seg) || []).filter(function (e) {
        return R.COMPOSABLE[e.kind];
      });
      return { seg: s.seg, zh: s.zh, candidates: list.length,
               must: s.must, p: s.p };
    });
    var space = 1;
    rows.forEach(function (r) {
      if (!r.candidates) return;
      space *= (r.must ? r.candidates : r.candidates + 1);
    });
    return { space: space, slots: rows };
  }

  function roll(rng) {
    rng = rng || Math.random;
    var R = registry();
    if (!R) return { ok: false, why: "登记层未加载" };
    var picks = [], missing = [], spec = {};

    SLOTS.forEach(function (s) {
      var list = (R.listSeg(s.seg) || []).filter(function (e) {
        return R.COMPOSABLE[e.kind];
      });
      if (!list.length) {
        /* 空槽自报 —— 不静默跳过 */
        if (s.must) missing.push(s.zh + "（" + s.seg + "）候选为 0");
        return;
      }
      if (!s.must && rng() >= s.p) return;   /* 可选槽按概率跳过 */
      var n = s.min + Math.floor(rng() * (s.max - s.min + 1));
      var used = {};
      var guard = 0;
      while (Object.keys(used).length < Math.min(n, list.length) && guard++ < 200) {
        var e = pick(list, rng);
        if (!e || used[e.code]) continue;   /* 无放回重抽；守卫上限防死循环 */
        used[e.code] = 1;
        picks.push({ code: e.code, oldId: e.oldId, zh: e.zh,
                     en: e.en, seg: s.seg, kind: e.kind });
        var key = KIND_TO_SPEC[e.kind];
        if (key) {
          /* 光学词条进 spec 用裸词（登记时 en 存的就是词条本词 t），
             引擎 findOptic 裸词与「组号.裸词」两种都认 */
          if (e.kind === "optic") (spec.optics = spec.optics || []).push(e.en);
          else (spec[key] = spec[key] || []).push(e.oldId);
        }
      }
    });

    if (missing.length) {
      return { ok: false, missing: missing, picks: picks };
    }
    return { ok: true, picks: picks, spec: spec, missing: [] };
  }

  /* ---------- 带锁重抽 ----------
   * 「只换一个槽」的正确实现是**整组重抽一次，再把不动的槽回填**，
   * 不是「只对那一槽重新随机」。理由：组合的合法性是**整体性质** ——
   * 本库的冲突四级裁决判的是「这套组合放一起成不成立」，单独换一个槽
   * 会绕过后补上的护栏，抽出来的可能正是被挡掉的那类组合。
   * （当前 8 槽都是视觉层、尚无语义护栏，但实现方式先对齐 ——
   *   护栏迟早要挂，届时不用回来改这里。）
   *
   * locks: { 段码: true }，如 { PA: true, OP: true }。
   * 返回结构与 roll 一致；spec 从最终 picks 重建，
   * 否则锁定项与新抽项混在一组里，spec 与 picks 必然漂移。 */
  function reroll(prev, locks, rng) {
    locks = locks || {};
    var next = roll(rng);
    if (!next.ok) return next;
    var old = (prev && prev.picks) || [];
    var lockedSegs = Object.keys(locks).filter(function (seg) {
      return locks[seg] && old.some(function (p) { return p.seg === seg; });
    });
    if (!lockedSegs.length) return next;
    var kept = old.filter(function (p) { return lockedSegs.indexOf(p.seg) >= 0; });
    var fresh = next.picks.filter(function (p) { return lockedSegs.indexOf(p.seg) < 0; });
    var order = {};
    SLOTS.forEach(function (s, i) { order[s.seg] = i; });
    /* 注意不能写 order[a.seg] || 99 —— PA 的序号是 0，falsy，
       会被当成「没有排序位」排到最后去。抽屉里第一个锁按钮
       就会变成 SJ 的，用户锁的是 PA、界面动的是 SJ。 */
    var rank = function (seg) { return order[seg] != null ? order[seg] : 99; };
    next.picks = kept.concat(fresh).sort(function (a, b) {
      return rank(a.seg) - rank(b.seg);
    });
    var spec = {};
    next.picks.forEach(function (p) {
      var key = KIND_TO_SPEC[p.kind];
      if (key) {
        if (p.kind === "optic") (spec.optics = spec.optics || []).push(p.en);
        else (spec[key] = spec[key] || []).push(p.oldId);
      }
    });
    next.spec = spec;
    next.locked = lockedSegs;
    return next;
  }

  return { roll: roll, reroll: reroll, pool: pool, SLOTS: SLOTS, KIND_TO_SPEC: KIND_TO_SPEC };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { GACHA: GACHA };
