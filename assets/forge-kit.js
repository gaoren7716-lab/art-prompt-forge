/* ============================================================
 * forge-kit.js —— 组合引擎（浏览器 / Node 双用）
 *
 * 三件事：
 *   1. 「直接调用」——任何一位画家都能凭其七个面，自动派生一段可直接出图的提示词
 *   2. 「模块组合」——按黄金词序把 题材 / 空间 / 光 / 媒介 / 笔法 / 色彩 / 署名 拼起来
 *   3. 「受控变形」——算子 Worker 只做声明式变换，冲突由裁决器自动 mute 低权重一方
 *
 * 双用约定：浏览器里 <script src>（须在 data-*.js 之后）；Node 里 require
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) {
  var _C = require("./data-core.js");
  var PAINTERS = _C.PAINTERS, MOVEMENTS = _C.MOVEMENTS, MEDIUMS = _C.MEDIUMS,
      SUBJECTS = _C.SUBJECTS, OPTICS = _C.OPTICS, WORKS = _C.WORKS,
      OPERATORS = _C.OPERATORS, CONFLICTS = _C.CONFLICTS, SIGNATURES = _C.SIGNATURES,
      ATOMS = _C.ATOMS,
      FACETS = _C.FACETS, FACET_GROUPS = _C.FACET_GROUPS,
      ROLES = _C.ROLES, ROLE_KEYS = _C.ROLE_KEYS, CONFLICT_LEVELS = _C.CONFLICT_LEVELS;
}

var FORGE = (function () {

  const K = FACETS.map(f => f.k);
  let decided = { warnings: [], muted: new Map(), changes: [] };
  const CAP = { medium: 4, brush: 5, color: 5, light: 4, space: 4, motif: 4, spirit: 3 };
  const PRI = { work: 40, movement: 50, painter: 60, medium: 80, subj: 85, op: 100 };

  /* ---------- 模块角色：不是所有模块都该同等说话 ----------
   * guard（约束）是硬边界，任何权重都压不掉，直接进负面词；
   * region（局部）只声明作用面，不参与主画面词面的争抢；
   * lead / support 按权重正常参与裁决。
   */
  const ROLE = {};
  ROLES.forEach(r => { ROLE[r.k] = r; });
  const ROLE_DEFAULT = { lead: 1.0, support: 0.7, region: 0.6, guard: 1.0 };

  /* guard 模块强制进负面词的清单：把约束写进提示词是无效的，
     模型对「不要什么」在正向文本里的响应远弱于负面通道 */
  const GUARD_NEG = ATOMS.filter(a => a.guard).map(a => a.t);

  /* ---------- 画质档：决定收尾词 ---------- *
   * 关键例外：retro 档刻意避开 high resolution / ultra-detailed，
   * 这些词会把龟裂、泛黄、胶片颗粒一起「修」掉，年代感就没了。
   */
  const QUALITY = {
    canvas:  "masterpiece, best quality, oil on canvas, fine brushwork, gallery grade, high resolution, ultra-detailed",
    trad:    "masterpiece, best quality, traditional hand-ground pigment, museum-grade painting, high resolution, ultra-detailed",
    retro:   "period-authentic palette, aged varnish patina, craquelure, unrestored museum scan, dust accumulation",
    photo:   "photographic, shallow depth of field, film grain, high fidelity rendering, subtle chromatic aberration",
    digital: "digital painting, 8k, crisp rendered edges, layered digital workflow, concept art finish"
  };

  const NEG_BASE = "lowres, bad anatomy, bad proportions, extra digits, deformed hands, mutated limbs, blurry, jpeg artifacts, watermark, signature, cropped, frame border, duplicate subjects, plastic texture";

  const NEG_EXTRA = {
    canvas:  "airbrush smoothness, vector flatness, gaudy oversaturation",
    trad:    "western photograph texture, synthetic gloss, airbrush smoothness",
    retro:   "pristine digital surface, hdr bloom, oversaturated neon, modern stainless hardware",
    photo:   "visible brushstroke, canvas weave, painted texture",
    digital: "canvas weave, paint cracking, oily brush texture"
  };

  /* ---------- 小工具 ---------- */
  const has = (a, x) => a.indexOf(x) >= 0;
  function uniq(arr) {
    const s = new Set(), out = [];
    (arr || []).forEach(t => { if (!t) return; const k = String(t).toLowerCase().trim(); if (s.has(k)) return; s.add(k); out.push(String(t).trim()); });
    return out;
  }
  const take = (arr, n) => (arr || []).slice(0, Math.max(0, n | 0));
  function oxford(a) {
    a = uniq(a);
    if (!a.length) return "";
    if (a.length === 1) return a[0];
    return a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
  }

  /* ---------- 算子自带的语义标签 ---------- *
   * 算子表达的是「用户的明确意图」，所以它必须参与冲突裁决且永不输
   * （arbitrate 里对 op 跳过静音处理）。没有这张表，算子就只能替换词、
   * 却无法与画家的原生媒介形成「谁服从谁」的判断。
   */
  const OP_TAGS = {
    "OP-E-01": ["perspective-linear", "natural-daylight", "line-primary"],
    "OP-E-02": ["chiaroscuro-volume", "perspective-linear", "oil-impasto"],
    "OP-E-03": ["flat-decoration", "perspective-flat", "line-primary", "flat-print"],
    "OP-E-04": ["monochrome-ink", "perspective-flat", "ink-aqueous", "minimal-empty"],
    "OP-E-05": ["gold-ground", "hyper-ornament", "flat-decoration"],
    "OP-E-06": ["commercial-poster", "flat-decoration", "aged-decay"],
    "OP-E-07": ["aged-decay", "hard-edge", "flat-print"],
    "OP-M-01": ["flat-print", "hard-edge"],
    "OP-M-02": ["line-primary", "hard-edge"],
    "OP-M-03": ["flat-print", "hard-edge", "flat-decoration", "line-primary"],
    "OP-M-04": ["commercial-poster", "hard-edge"],
    "OP-M-05": ["flat-print", "hard-edge", "flat-decoration"],
    "OP-M-06": ["flat-print", "line-primary", "monochrome-ink"],
    "OP-M-07": ["photographic", "no-outline", "natural-daylight"],
    "OP-M-08": ["polychrome-full", "embossed-relief"],
    "OP-M-09": ["digital-clean", "fine-art-depth"],
    "OP-M-10": ["flat-print", "hard-edge"],
    "OP-P-02": ["aged-decay"],
    "OP-P-04": ["tiny-detail", "embossed-relief"]
  };

  /* ---------- 索引 ---------- */
  function PrebuildDB() {
    const map = new Map();
    const push = (arr, kind) => (arr || []).forEach(x => { if (x && x.id) map.set(x.id, { e: x, kind: kind }); });
    push(PAINTERS, "painter"); push(MOVEMENTS, "movement"); push(MEDIUMS, "medium");
    push(SUBJECTS, "subject"); push(WORKS, "work"); push(OPERATORS, "op");
    push(ATOMS, "atom");
    return map;
  }
  let DB = null;
  function db() { if (!DB) DB = PrebuildDB(); return DB; }
  function find(id) { return db().get(id); }

  /* 用户的 optics 选择可能是一串裸词，也可能是 "{gid}.{term}" */
  function findOptic(t) {
    let out = null;
    OPTICS.forEach(g => (g.items || []).forEach(i => { if (i.t === t || (g.id + "." + i.t) === t) out = { g: g, i: i }; }));
    return out;
  }
  const OPTIC_SLOT = {
    "光影": "light", "空间透视": "space", "构图取景": "space", "色彩关系": "color",
    "肌理与呈现": "medium", "笔触控制": "brush", "气氛情绪": "spirit", "时间与天候": "light"
  };

  /* ---------- 画质档判定：看全局 tags 与最终词面 ---------- */
  function tierOf(tags, allWords) {
    const t = (tags || []).join(" ").toLowerCase();
    const w = (allWords || []).join(" ").toLowerCase();
    if (/digital|3d|matte painting|concept art|cg /.test(t + " " + w)) return "digital";
    if (/photographic|silver gelatin|large format|hyperreal|daguerreotype/.test(t + " " + w)) return "photo";
    if (/aged|craquelure|vintage|sepia|unrestored|daguerreotype|yellowed/.test(t + " " + w)) return "retro";
    if (/mineral|silk|washi|tempera|fresco|woodblock|ink|gouache|aqueous|scroll|pigment/.test(t + " " + w)) return "trad";
    return "canvas";
  }

  /* ---------- 收集参与本次拼装的「源」 ---------- */
  function collect(spec) {
    const srcs = [];
    const add = (ref, fallbackKind) => {
      const id = typeof ref === "string" ? ref : ref.id;
      const hit = find(id);
      if (!hit) return null;
      const kind = hit.kind || fallbackKind;
      let w = typeof ref === "object" && ref.w != null ? Number(ref.w) : 1;
      /* 原子模块的权重由 role 决定：辅助类天生就该弱一些。
         用户显式给了 w 就以用户为准（role 只在未指定时生效）。 */
      const role = hit.e.role;
      if (!(typeof ref === "object" && ref.w != null) && role && ROLE_DEFAULT[role] != null) {
        w = ROLE_DEFAULT[role];
      }
      const s = { id: id, kind: kind, e: hit.e, w: w, role: role || null,
                  pri: PRI[kind] != null ? PRI[kind] : 50 };
      srcs.push(s);
      return s;
    };
    (spec.subjects || []).forEach(r => add(r, "subj"));
    (spec.works || []).forEach(r => add(r, "work"));
    (spec.movements || []).forEach(r => add(r, "movement"));
    (spec.painters || []).forEach(r => add(r, "painter"));
    (spec.mediums || []).forEach(r => add(r, "medium"));
    (spec.atoms || []).forEach(r => add(r, "atom"));
    return srcs;
  }

  /* ---------- 算子：keep / only 掩码 ---------- */
  function maskOf(ops) {
    let mask = null;
    const keeps = ops.filter(o => o.keep);
    const onlys = ops.filter(o => o.only);
    if (keeps.length) { const s = new Set(); keeps.forEach(o => o.keep.forEach(k => s.add(k))); mask = s; }
    if (onlys.length) { const s = new Set(); onlys.forEach(o => o.only.forEach(k => s.add(k)));
      mask = mask ? new Set(Array.from(mask).filter(x => s.has(x))) : s; }
    return mask;
  }

  /* ---------- 冲突裁决 ----------
   * 每个源带一组 tags；同一条规则的两侧 tags 同时出现时按 level 分四种处理：
   *   hard        低权重一方在 scope 波及的面（含成组连带）上被静音
   *   regional    不静音，给出分区建议（aSide / bSide / seam）
   *   soft        只出提示，允许共存
   *   experimental 允许组合但标注未验证
   * 裁决同时产出变更清单 changes[]：谁被静音、静音了哪几个面、为什么。
   */
  function arbitrate(srcs) {
    const warnings = [];
    const muted = new Map();   // srcIndex -> Set(facetKeys)
    const changes = [];
    const sideOf = (tag) => srcs.filter(s => has(s.e.tags || [], tag));

    CONFLICTS.forEach(cf => {
      const A = sideOf(cf.a), B = sideOf(cf.b);
      if (!A.length || !B.length) return;
      const maxA = Math.max.apply(null, A.map(s => s.pri + s.w * 10));
      const maxB = Math.max.apply(null, B.map(s => s.pri + s.w * 10));
      const losers = maxA >= maxB ? B : A;
      const winners = maxA >= maxB ? A : B;
      const winnerName = winners.map(s => s.e.zh || s.e.en).join(" + ");
      const loserName = losers.map(s => s.e.zh || s.e.en).join(" + ");
      const base = { id: cf.id, level: cf.level, msg: cf.msg, fix: cf.fix, winner: winnerName, loser: loserName };

      if (cf.level === "hard") {
        const hitFacets = new Set();
        losers.forEach(s => {
          if (s.kind === "op") return;                    // 算子意图明确，不参与让位
          const set = muted.get(s._i) || new Set();
          cf.scope.forEach(f => { const grp = FACET_GROUPS[f] || [f]; grp.forEach(x => { set.add(x); hitFacets.add(x); }); });
          muted.set(s._i, set);
          changes.push({
            type: "mute", level: "hard", id: cf.id, target: s.id,
            targetName: s.e.zh || s.e.en, by: winnerName,
            facets: Array.from(set), why: cf.msg, fix: cf.fix
          });
        });
        warnings.push(Object.assign({ action: "ask" }, base));
      } else if (cf.level === "regional") {
        warnings.push(Object.assign({ action: "split", region: cf.region || null }, base));
        changes.push({
          type: "split", level: "regional", id: cf.id,
          a: A.map(s => s.e.zh || s.e.en).join(" + "),
          b: B.map(s => s.e.zh || s.e.en).join(" + "),
          region: cf.region || null, why: cf.msg, fix: cf.fix
        });
      } else if (cf.level === "experimental") {
        warnings.push(Object.assign({ action: "allow", verified: false }, base));
        changes.push({
          type: "unverified", level: "experimental", id: cf.id,
          a: A.map(s => s.e.zh || s.e.en).join(" + "),
          b: B.map(s => s.e.zh || s.e.en).join(" + "),
          why: cf.msg, fix: cf.fix
        });
      } else {
        warnings.push(Object.assign({ action: "warn" }, base));
      }
    });
    return { warnings: warnings, muted: muted, changes: changes };
  }

  /* ---------- 合并七个面 ---------- */
  function mergeFacets(srcs, ops, optics, atomsByFacet) {
    const F = {}; K.forEach(k => F[k] = []);
    const opInject = {};
    ops.forEach(o => { Object.keys(o.inject || {}).forEach(f => { (opInject[f] = opInject[f] || []).push.apply(opInject[f], o.inject[f]); }); });

    K.forEach(f => {
      const cap = CAP[f] || 4;
      if (opInject[f]) { F[f] = F[f].concat(opInject[f]); }
      /* 高权重先填，权重不足者分到的名额少 */
      const order = srcs.filter(s => s.e.F && s.e.F[f]).sort((a, b) => (b.pri + b.w * 10) - (a.pri + a.w * 10));
      order.forEach(s => {
        const m = decided.muted.get(s._i);
        if (m && m.has(f)) return;
        const words = s.e.F[f] || [];
        const quota = s.w >= 1 ? words.length : Math.max(1, Math.round(words.length * s.w));
        F[f] = F[f].concat(take(words, quota));
      });
      /* 原子模块按 slot 投放面，落在哪个面就排到哪个面 */
      if (atomsByFacet && atomsByFacet[f]) F[f] = F[f].concat(atomsByFacet[f]);
      /* optics 由用户勾选，永远追加在最后且不被截断 */
      if (optics[f]) F[f] = F[f].concat(optics[f]);
      F[f] = uniq(F[f]).slice(0, Math.max(cap, (opInject[f] ? opInject[f].length : 0) + 2));
    });
    return F;
  }

  /* ---------- 自然语言正文里每个面的引导语 ---------- */
  const LEAD = {
    medium: "Executed in ", brush: "The surface carries ", color: "Colour is organised around ",
    light: "Light behaves as ", space: "Space is organised by ", motif: "The recurring elements are ",
    spirit: "The prevailing mood is "
  };

  /* ---------- 画作标题隔离集 ----------
   * motif 面（画家的常见题材）里混着具体画作标题：mona lisa、
   * last supper、black square…… 写进 tags 的后果不是报错，是复刻 ——
   * tags 是构图指令，模型看到 "mona lisa" 就去画蒙娜丽莎，
   * 而用户要的是「达·芬奇式画风的原创构图」，拿到的是仿作。
   * 这些词的正确位置是垫图参考区（那里有隔离指令兜底）。
   *
   * 隔离只做「可证明安全」的精确匹配：WORKS 表登记的标题。
   * 未登记的标题（如 moulin de la galette）不猜 —— 猜错的代价是把
   * 一个正常题材词也隔离掉，而那是不可证明的猜测。
   * 数据不动（详情抽屉仍显示完整 motif），只是出词时换位置。 */
  let _WORK_TITLES = null;
  /* 标题归一化：WORKS 登记名常带冠词与首字母大写（"The Last Supper"），
     motif 里存的是无冠词小写（"last supper"）。不归一化就会漏匹配 ——
     而漏匹配不报错，只是那幅画照样进词面。 */
  function normTitle(s) {
    return String(s || "").toLowerCase().trim()
      .replace(/^(the|a|an)\s+/, "");
  }
  function workTitleSet() {
    if (!_WORK_TITLES) {
      _WORK_TITLES = {};
      (WORKS || []).forEach(w => {
        if (w.en) _WORK_TITLES[normTitle(w.en)] = w;
      });
    }
    return _WORK_TITLES;
  }
  function splitMotif(words) {
    const keep = [], iso = [];
    (words || []).forEach(w => {
      const hit = workTitleSet()[normTitle(w)];
      if (hit) iso.push({ word: w, workId: hit.id, zh: hit.zh, en: hit.en });
      else keep.push(w);
    });
    return { keep: keep, iso: iso };
  }

  /* ---------- 姓名纪律 ----------
   * 在世艺术家的姓名不进词面。三条理由：
   *   1. 风格引用绑到具体在世创作者的身份上，商业产出可能以假乱真；
   *   2. 库会被长期复用，姓名泄漏是累积的 —— 每次用都在漏；
   *   3. 模型对在世者姓名的「风格响应」常被训练数据里的具体作品带偏。
   * 已故大师的姓名引用保留："in the style of 已故大师" 是画风库的
   * 标准锚定手段，风格本身不受著作权保护，删了七面锚定反而变弱。
   *
   * 判据只有一条：life 字段有没有卒年（"1937-" 即在世）。
   * 数据不用为这条纪律改任何东西 —— 补进新的在世艺术家时自动生效。
   *
   * 剔除方式：sty 数组第一项与 en 名归一化相同才算姓名。
   * 不能「第一个词一律当姓名删」—— 万一数据里 sty[0] 不是姓名，
   * 删掉的是一个正常风格词，而那是不可证明的猜测。 */
  const NAME_POLICY = { aliveNames: false };
  function normName(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, "");
  }
  function isAlive(e) {
    return /^\d{3,4}\s*[-–—]\s*$/.test(String((e && e.life) || "").trim());
  }
  /* 返回该源可用的词面名单词（在世者已剔除姓名） */
  function styleWordsOf(s) {
    const st = (s.e.sty || []).slice();
    if (NAME_POLICY.aliveNames) return st;
    if (s.kind === "painter" && isAlive(s.e) && st.length) {
      const en = normName(s.e.en);
      if (en && normName(st[0]) === en) st.shift();
    }
    return st;
  }

  /* ============================================================
   * 主入口：把 spec 变成三种成品提示词
   * ============================================================ */
  function compose(spec, parent) {
    spec = spec || {};
    const strength = spec.strength != null ? Math.min(1.6, Math.max(0.2, Number(spec.strength))) : 1.0;
    const platform = spec.platform || "sd";

    const ops = (spec.operators || []).map(r => {
      const id = typeof r === "string" ? r : r.id;
      const hit = find(id);
      return hit && hit.kind === "op" ? hit.e : null;
    }).filter(Boolean);
    ops.forEach(o => { o.pri = PRI.op; });

    const srcs = collect(spec);
    srcs.forEach((s, i) => s._i = i);

    /* 把算子也登记成「源」：它参与裁决但永不退让 */
    ops.forEach(o => {
      const tags = (OP_TAGS[o.id] || []).concat(o.tags || []);
      const s = { id: o.id, kind: "op", w: 1, pri: PRI.op, e: { id: o.id, zh: o.zh, en: o.en, tags: tags } };
      s._i = srcs.length; srcs.push(s); o._i = s._i;
    });

    /* 1) 算子掩码：只保留允许的面向 */
    const mask = maskOf(ops);
    if (mask) srcs.forEach(s => { if (!s.e.F) return; const kept = {}; Object.keys(s.e.F).forEach(f => { if (mask.has(f)) kept[f] = s.e.F[f]; }); s.e = Object.assign({}, s.e, { F: kept }); });

    decided = arbitrate(srcs);

    /* 2) optics 分槽 */
    const optics = {};
    (spec.optics || []).forEach(t => {
      const o = findOptic(t);
      if (!o) return;
      const slot = OPTIC_SLOT[o.g.zh] || o.g.slot || "space";
      (optics[slot] = optics[slot] || []).push(o.i.t);
    });

    /* 2b) 原子模块分槽：guard 进负面，region 单独归集，其余按 slot 投放到面 */
    const atomsByFacet = {};
    const guardAtoms = [], regionAtoms = [], usedAtoms = [];
    (spec.atoms || []).forEach(ref => {
      const id = typeof ref === "string" ? ref : ref.id;
      const hit = find(id);
      if (!hit || hit.kind !== "atom") return;
      const a = hit.e;
      usedAtoms.push(a.id);
      if (a.guard) { guardAtoms.push(a.t); return; }
      if (a.role === "region") { regionAtoms.push({ id: a.id, t: a.t, zh: a.zh }); return; }
      const slot = a.slot || "space";
      (atomsByFacet[slot] = atomsByFacet[slot] || []).push(a.t);
    });

    /* 3) 合并面 */
    const F = mergeFacets(srcs, ops, optics, atomsByFacet);

    /* 3b) 画作标题隔离：命中 WORKS 登记标题的 motif 词移出词面，
           收进 isolatedMotif 供垫图参考区与 explain 使用。
           隔离点在合并之后、拼装之前 —— 早一步晚一步都会漏：
           早于合并，算子 inject 进来的标题混进来；
           晚于拼装，得从成品 tags 里往回切，而那是字符串猜测。 */
    const motifSplit = splitMotif(F.motif || []);
    F.motif = motifSplit.keep;
    const isolatedMotif = motifSplit.iso;

    /* 4) 题材主体 */
    const subjectWords = [];
    (spec.subjects || []).forEach(ref => {
      const id = typeof ref === "string" ? ref : ref.id;
      const hit = find(id);
      if (!hit) return;
      subjectWords.push.apply(subjectWords, hit.e.kw || []);
      /* 题材的面要排在最前（题材优先级最高），且必须去重，
         否则题材与画家都写了同一句话时会重复出现在词面里 */
      if (hit.e.F) { K.forEach(f => { if (hit.e.F[f]) F[f] = uniq(hit.e.F[f].concat(F[f])); }); }
    });
    if (spec.subjectFree) subjectWords.unshift(spec.subjectFree);
    /* 原话通道：用户自己写的句子（"清晨薄雾、孤独感"）。两条纪律：
       ① 追加在词面末尾，不占任何面的位置 —— 它不参与冲突裁决，
          「我要一张悲伤的图」不该去改画家的任何一面；
       ② 不进 gpt 的成面句子，单独一行 Additional intent ——
          混进七面引导句里会被当成该面的描述，而它是用户的意图。 */
    const freeText = (spec.freeText || []).map(t => String(t).trim()).filter(Boolean);

    /* 5) 署名层与 bench */
    const styleWords = [];
    const aliveSources = [];   /* 在世画家：姓名已剔除，需在 explain 说明 */
    srcs.slice().sort((a, b) => (b.pri + b.w * 10) - (a.pri + a.w * 10)).forEach(s => {
      const st = styleWordsOf(s);   /* 在世者已剔除姓名（见姓名纪律） */
      if (s.kind === "painter" && isAlive(s.e) && !NAME_POLICY.aliveNames) aliveSources.push(s);
      const n = s.w >= 1 ? st.length : Math.max(1, Math.round(st.length * s.w));
      styleWords.push.apply(styleWords, take(st, n));
    });
    const opAdd = []; ops.forEach(o => (o.add || []).forEach(x => opAdd.push(x)));

    /* 6) 强度与平台方言 */
    const wTxt = n => (Math.round(n * 100) / 100).toFixed(2);
    let weightFn = null;
    if (platform === "mj")        weightFn = t => t + "::" + wTxt(strength);
    else if (platform === "sd")   weightFn = t => "(" + t + ":" + wTxt(strength) + ")";
    else if (platform === "flux") weightFn = t => t + " " + t;  /* 重复即强调，不加括号 */
    else                          weightFn = t => t;

    const appliedStyle = styleWords.length ? styleWords.map(weightFn) : [];
    let brushOut = F.brush;
    let extraQuality = [];
    if (strength < 0.6) {
      brushOut = take(F.brush, 2);
      K.forEach(f => { if (f !== "brush" && F[f]) F[f] = take(F[f], 2); });
      extraQuality.push("subtle stylistic influence", "retains natural material structure");
    } else if (strength >= 1.15) {
      extraQuality.push("uncompromising stylisation", "no photographic residue");
    }

    /* 7) 词序拼装：题材 → 空间 → 光 → 媒介 → 笔法 → 色彩 → 气质 → 署名 → 算子散词 → 画质 */
    const blocks = [];
    blocks.push({ k: "subject", v: uniq(subjectWords.concat(F.motif)) });
    blocks.push({ k: "space",   v: F.space });
    blocks.push({ k: "light",   v: F.light });
    blocks.push({ k: "medium",  v: F.medium });
    blocks.push({ k: "brush",   v: brushOut });
    blocks.push({ k: "color",   v: F.color });
    blocks.push({ k: "spirit",  v: F.spirit });

    const allWords = [];
    blocks.forEach(b => allWords.push.apply(allWords, b.v));
    allWords.push.apply(allWords, opAdd);
    const tagsAll = srcs.reduce((a, s) => a.concat(s.e.tags || []), []);

    const tier = tierOf(tagsAll, allWords.concat(appliedStyle).concat(opAdd));
    const quality = uniq(QUALITY[tier].split(", ").concat(extraQuality));

    const tagParts = [];
    blocks.forEach(b => { if (b.v.length) tagParts.push(b.v.join(", ")); });
    if (appliedStyle.length) tagParts.push(appliedStyle.join(", "));
    if (opAdd.length) tagParts.push(uniq(opAdd).join(", "));
    tagParts.push(quality.join(", "));
    /* 原话追加在质量词之后：它优先级最低，但必须出现。
       放在质量词之前会让 SD 把它当画面主体描述 ——
       而它往往只是情绪与氛围。 */
    if (freeText.length) tagParts.push(freeText.join(", "));
    let tags = tagParts.join(", ").replace(/\s+,/g, ",").replace(/\s+/g, " ").trim();

    /* 8) 负面词：基础 + 画质档 + 各源 avoid + 算子 neg + guard 模块 */
    let negWords = NEG_BASE.split(", ");
    negWords = negWords.concat((NEG_EXTRA[tier] || "").split(", ").filter(Boolean));
    srcs.forEach(s => { negWords = negWords.concat(s.e.avoid || []); });
    ops.forEach(o => { negWords = negWords.concat(o.neg || []); negWords = negWords.concat(o.forbid || []); });
    if (strength >= 1.15) negWords.push("photographic finish");
    /* guard 模块是硬约束，强制进负面 */
    negWords = negWords.concat(guardAtoms);
    const neg = uniq(negWords).join(", ").replace(/\s+/g, " ").trim();

    /* 9) 自然语言正文（GPT 系） */
    const subjSentence = spec.subjectFree
      ? spec.subjectFree
      : (uniq(subjectWords).join(", ") || "a single clearly readable subject");
    /* 正文署名同样守姓名纪律：在世者只写画风不写人名。
       注意这里不能用 styleWordsOf 的中间结果直接拼 —— 那已经按权重
       截断过，拼出来是半截名单。按源逐个判断才准。 */
    const styleName = srcs.filter(s => s.kind === "painter")
      .map(s => (isAlive(s.e) && !NAME_POLICY.aliveNames) ? styleWordsOf(s).join(" and ") : s.e.en)
      .filter(Boolean).join(" fused with ");
    const mvName = srcs.filter(s => s.kind === "movement").map(s => s.e.en).join(" and ");

    const lines = [];
    lines.push("A painting of " + subjSentence + ".");
    K.forEach(f => {
      if (!F[f] || !F[f].length) return;
      lines.push(LEAD[f] + oxford(F[f]) + ".");
    });
    if (styleName || mvName) {
      lines.push("Rendered in the manner of " + [styleName, mvName].filter(Boolean).join(", ") +
        (strength >= 1.15 ? ", pushed to full stylistic intensity" : (strength < 0.6 ? ", kept as a restrained undercurrent" : "")) + ".");
    }
    if (opAdd.length) lines.push("Additional directives: " + oxford(opAdd) + ".");
    /* 原话单独一行：它是用户的意图，不是任何一面的描述 */
    if (freeText.length) lines.push("Additional intent (author's own words, not a style directive): " + freeText.join("; ") + ".");
    lines.push(tier === "retro"
      ? "Surface must stay consistent with the chosen ageing; no modern restoration artifacts. No text, no logos, no watermark."
      : "Keep the surface consistent with the chosen medium. No text, no logos, no watermark.");

    /* 实验性组合必须在正文里显式标注未验证，不能让使用者误以为是已验证配方 */
    const hasExperimental = decided.warnings.some(w => w.level === "experimental");
    if (hasExperimental) {
      lines.push("Note: this combination contains untested experimental pairings; results are not verified.");
    }

    const gpt = lines.join(" ").replace(/\s+/g, " ").trim();

    /* 10) 变更清单：这一版相对基础版改了什么 */
    const changes = decided.changes.slice();
    ops.forEach(o => {
      (o.preserve || []).forEach(f => {
        changes.push({ type: "preserve", id: o.id, facet: f, why: "算子 " + o.zh + " 声明保留此面" });
      });
    });
    /* 区域模块单独标注，提示使用者用遮罩落实 */
    regionAtoms.forEach(r => {
      changes.push({ type: "region", id: r.id, term: r.t, why: "局部模块需配合遮罩或区域提示使用" });
    });

    /* 11) 继承关系：本次输出派生自哪些实体与操作 */
    const parentInfo = {
      sources: srcs.filter(s => s.kind !== "op").map(s => ({ id: s.id, kind: s.kind, w: s.w, role: s.role })),
      operators: ops.map(o => o.id),
      from: parent || null
    };

    return {
      tier: tier, tags: tags, neg: neg, gpt: gpt,
      parts: blocks.reduce((o, b) => (o[b.k] = b.v, o), {}),
      style: appliedStyle, addon: uniq(opAdd), quality: quality,
      warnings: decided.warnings, changes: changes,
      usedOps: ops.map(o => o.id), usedAtoms: usedAtoms,
      guardAtoms: guardAtoms, regionAtoms: regionAtoms,
      experimental: hasExperimental,
      isolatedMotif: isolatedMotif,
      /* 原话追加的结果：用户自己的句子，追加在词面末尾、不参与裁决。
         带出来供 explain 与面板说明「哪几句是你自己加的」。 */
      freeText: freeText,
      /* 在世画家清单：姓名已从词面剔除。界面要显示「在世艺术家，
         词面不含姓名」—— 不显示的话，用户会以为库漏了风格锚定。 */
      aliveSources: aliveSources.map(s => ({ id: s.e.id, zh: s.e.zh, en: s.e.en })),
      parent: parentInfo,
      platform: platform, strength: strength,
      counts: { src: srcs.length, words: uniq(tags.split(", ")).length }
    };
  }

  /* ---------- 快照：把配方压成一段可粘贴的短码 ---------- */
  function b64enc(s) {
    try {
      if (typeof Buffer !== "undefined") return Buffer.from(s, "utf8").toString("base64");
      return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(s)));
    } catch (e) { return null; }
  }
  function b64dec(s) {
    try {
      if (typeof Buffer !== "undefined") return Buffer.from(s, "base64").toString("utf8");
      const bin = atob(s);
      return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
    } catch (e) { return null; }
  }
  function pack(spec) {
    const s = b64enc(JSON.stringify(spec));
    return s == null ? "" : "AFX1." + s.replace(/=+$/, "");
  }
  function unpack(code) {
    code = String(code || "").trim();
    if (code.indexOf("AFX1.") !== 0) return null;
    try { return JSON.parse(b64dec(code.slice(5) + "====".slice(0, (4 - code.slice(5).length % 4) % 4))); }
    catch (e) { return null; }
  }

  /* ---------- 单个画家的「一键提示词」：不指定题材时的默认成品 ---------- */
  function ready(pid, opt) {
    opt = opt || {};
    return compose({
      subjects: opt.subjects || ["S-01"],
      painters: [{ id: pid, w: 1 }],
      operators: opt.operators || [],
      atoms: opt.atoms || [],
      strength: opt.strength || 1.0,
      platform: opt.platform || "sd"
    });
  }

  /* ---------- 派生：从一张签名卡或旧配方长出新配方，并留继承痕迹 ---------- *
   * 为什么要显式记录派生关系：一串提示词被改过很多次之后，
   * 就没人知道它是从哪张卡改来的、有没有被人验证过。
   * 派生时把父级 id 记进结果，改动过程才有迹可循。
   */
  function derive(baseSpec, patch, note) {
    const spec = Object.assign({}, baseSpec, patch || {});
    const out = compose(spec, note ? { note: note, patch: patch } : (patch || null));
    out.derivedFrom = baseSpec && baseSpec._from ? baseSpec._from : null;
    return out;
  }

  return {
    compose, ready, derive, pack, unpack, find, findOptic, tierOf,
    QUALITY, NEG_BASE, NEG_EXTRA, uniq,
    ROLE, ROLE_DEFAULT, GUARD_NEG, CONFLICT_LEVELS,
    NAME_POLICY, isAlive, styleWordsOf, splitMotif
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { FORGE };
