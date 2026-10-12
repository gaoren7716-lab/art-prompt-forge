/* ============================================================
 * resolver.js · 编码解析器
 * ============================================================
 * 用户的原话：「可以直接引用编码，或是中文名」
 * 所以解析必须同时吃多种输入，且都要能命中同一条目。
 *
 * 八条入口（互为备份，见 resolve() 的 why 字段）：
 *   1. 规范编码   PA-042        唯一、可排序、机器友好，两段三位
 *   2. 缺零简写   PA-42 / PA-7  同义，位数可省
 *   3. 旧 ID      P-IT07        历史主键，向后兼容
 *   4. 上一版 code P-IT-007     已对外发布过，继续能查
 *   5. 中文名     卡拉瓦乔      人最熟悉
 *   6. 英文名     Caravaggio    跨语言场景
 *   7. 别名/译名   写实赛璐璐    容错，包括常见误写
 *   8. 光学英文词 chiaroscuro  横切词条专有入口
 *
 * 解析不出来时必须说「找不到」并列出最接近的候选，
 * 绝不返回一个猜测结果 —— 这是本项目的一条硬约定：
 * 宁可让用户重输，也不能给他一个假的 code。
 *
 * 关于重名：本库有 27 处中文名同时属于「原子模块」与「光学词条」
 *   （AM-007 与 OP-001 都叫「明暗对照」，连解释都一字不差）。
 *   这是数据层的真实冗余，不是 bug —— 原子模块多了 role 与分区角色。
 *   处理方式是不替用户选，把两条并排摆出来并标明层级与差异。
 * ============================================================ */
/* Node 下必须显式取 CODES —— CommonJS 里顶层 var 是模块作用域不是全局，
   浏览器 <script> 顶层 var 才隐式挂 global。少了这一行，
   resolve() 会在 lookup 里抛 CODES is not defined。
   用惰性 getter 而不是顶层赋值：require 本文件时 CODES 可能还没加载完。 */
var _CODES = (typeof module !== "undefined" && module.exports)
  ? require("./codes.js").CODES
  : (typeof window !== "undefined" ? window : this).CODES;

var RESOLVER = (function () {

  var entries = [];    // { code, oldId, zh, en, kw, alt, obj, kind, seg }
  var byCode = {};     // code（小写）→ [entry]
  var byOld = {};      // oldId（小写）→ [entry]
  var byZh = {};       // 中文名（小写）→ [entry]
  var byEn = {};       // 英文名/光学英文词（小写）→ [entry]
  var byTerm = {};     // 别名/译名 → [entry]

  /* 归一化只做四件事：去首尾空白、压连续空格、全小写、全角括号转半角。
     刻意不做的事：
       - 不删「·」：中文名里的间隔号是名称的一部分
         （「苏联 · 东欧手绘」删了就变成「苏联  东欧手绘」，
           用户照原样输入反而命中不了）
       - 不统一间隔号变体之外的标点：不同层括号里装的东西不同，改了会误并
     为什么要处理全角括号：输入法默认打全角，用户贴进来的常是半角，
     两种写法必须命中同一条目。 */
  function norm(s) {
    return String(s == null ? "" : s).trim().toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/（/g, "(").replace(/）/g, ")");
  }

  /* 中文名的检索键：原名、去括号注释名、末段词。
     三档由宽到窄，全都进索引，所以「苏联 · 东欧手绘」既能按全名命中，
     也能只按「东欧手绘」命中。 */
  function zhKeys(zh) {
    var base = norm(zh);
    var out = [base];
    var noParen = base.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
    if (noParen && noParen !== base) out.push(noParen);
    var tail = base.split(/[\s·\/]/).filter(Boolean);
    if (tail.length > 1) out.push(tail[tail.length - 1]);
    return out.filter(Boolean);
  }

  function push(map, key, e) {
    if (!key) return;
    var k = norm(key);
    if (!k) return;
    var list = map[k] || (map[k] = []);
    /* 同一 key 下同一 code 只登记一次。
       为什么必须去重：中文名既走 zhKeys 进 byTerm，又可能出现在 kw/alt 里
       （MT-001 的 zh 就是「SD 1.5」，而 kw 里也有「SD 1.5」）。
       不去重的话一次注册就把同一条目 push 两遍，解析时命中两条，
       而 lookup 的同层判定会把它当成「两条不同记录同名」——
       于是一个别名重复的小问题，被误报成数据缺陷。 */
    for (var i = 0; i < list.length; i++) if (list[i] === e) return;
    list.push(e);
  }

  /* ---------- 注册 ---------- */
  /* kind: "painter"/"movement"/"medium"/"subject"/"work"/"operator"
           /"conflict"/"signature"/"provenance"/"task"/"atom"/"optic"/"opticGroup"
     seg: 段码，用于 UI 分组与重名时的层级标注

     注册必须幂等。同一个 code 重复注册时，若不早退：
       - entries 会多出一条，计数与实际不符
       - 同一别名被 push 两次，之后解析「SD 1.5」会拿到两条同一个 MT-001
       - 而 lookup 的同层判定会把它报成「同层重名（数据缺陷）」，
         把一个注册 bug 误报成数据错误，排查方向会被带偏 */
  function register(code, oldId, zh, en, opts) {
    if (byCode[norm(code)] && byCode[norm(code)].length) {
      var ex = byCode[norm(code)][0];
      if (ex.code === code) return ex;
    }
    opts = opts || {};
    var e = {
      code: code, oldId: oldId, zh: zh, en: en || "",
      kw: opts.kw || [], alt: opts.alt || [], obj: opts.obj || null,
      kind: opts.kind || "entry",
      seg: opts.seg || "",
      note: opts.note || ""
    };
    entries.push(e);
    push(byCode, code, e);
    push(byOld, oldId, e);
    zhKeys(zh).forEach(function (k) { push(byZh, k, e); });
    if (en) push(byEn, en, e);
    e.kw.forEach(function (k) { push(byTerm, k, e); });
    e.alt.forEach(function (k) { push(byTerm, k, e); });
    /* 中文名也进别名表，这样「提示词里写了中文名」也能反查回条目 */
    zhKeys(zh).forEach(function (k) { push(byTerm, k, e); });
    return e;
  }

  /* 编码 → 规范 code。依次尝试三种写法，全部走映射表不猜：
       1. 原样大写           PA-042
       2. 别名表命中         P-IT07 / P-IT-007 / AM-101 → 规范 code
       3. 缺零简写补齐       PA-42 / PA-7 → PA-042 / PA-007
     第 3 步只对**已存在的规范 code** 补零，不是「补零后再查」——
     否则随便一串字母加数字都会被当成编码去试，徒增歧义。
     段码还必须是已登记的两字母段（P 与 PA 互不为前缀，已断言）。 */
  function toCode(up) {
    if (byCode[norm(up)] && byCode[norm(up)].length) return up;
    if (_CODES.CODE_OF[up]) return up;
    /* 别名表覆盖旧 ID 与上一版 code */
    var al = _CODES.ALIASES[String(up).toLowerCase()];
    if (al && byCode[norm(al)] && byCode[norm(al)].length) return al;
    /* 缺零简写：PA-7 → PA-007 */
    var m = up.match(/^([A-Z]{2})-?(\d{1,3})$/);
    if (m && _CODES.isSeg(m[1])) {
      var padded = m[1] + "-" + _CODES.pad3(parseInt(m[2], 10));
      if (byCode[norm(padded)] && byCode[norm(padded)].length) return padded;
    }
    return null;
  }

  /* ---------- 精确解析 ---------- */
  /* 「主条目」优先规则：本库有 27 处中文名同时属于原子模块与光学词条，
     逐字比对两者的 c 字段会发现它们是同一条内容的两次录入 ——
     原子模块多了 role / slot / cat，光学组没有。
     所以中文名不该让用户二选一：默认返回原子模块（信息更全、能带角色），
     同时把光学词条收进 shadowed，用户想指「就是那个裸词」时仍可用
     OP-001 或光影组内的词条编码精确指定。
     判据不能写死成「atom 优先」—— 将来若有光学组独有的词，
     它应当照常唯一命中。所以这里只处理「多候选」的情形。 */
  function lookup(input) {
    var q = norm(input);
    if (!q) return [];
    /* 编码三态：规范 / 旧 ID / 上一版 code，全部收敛到规范 code */
    var up = String(input).trim().toUpperCase();
    var d = toCode(up);
    if (d) { var hit = byCode[norm(d)]; if (hit && hit.length) return hit; }
    var exact = byCode[q] || byOld[q] || byEn[q] || byTerm[q] || byZh[q];
    if (!exact || exact.length <= 1) return exact || [];
    /* 多候选：按「可组合性 + 层级优先级」收敛。
       原子模块排在光学词条之前：两者中文名常相同，但原子模块多了
       role（主导/辅助/分区/约束）与 slot，能真正参与组装，
       而光学词条只是一枚裸词。所以默认给原子模块。
       RANK 小的优先。conflict/provenance/model/task/signature 是元层，
       它们不该因为与某个零件同名就抢走命中。 */
    var ORDER_RANK = {
      atom: 1, painter: 2, work: 2, movement: 2, medium: 2, subject: 2,
      optic: 3, operator: 3, opticGroup: 4,
      signature: 8, task: 8, conflict: 9, provenance: 9, model: 9
    };
    var ranked = exact.slice().sort(function (a, b) {
      return (ORDER_RANK[a.kind] || 5) - (ORDER_RANK[b.kind] || 5);
    });
    /* 同层仍然并列（那就是真重名，交 resolve 报「数据缺陷」）；
       跨层且高优先项存在，则只返回高优先项，低优先项挂到 shadowed 上。 */
    var top = ORDER_RANK[ranked[0].kind] || 5;
    var sameRank = ranked.filter(function (e) { return (ORDER_RANK[e.kind] || 5) === top; });
    if (sameRank.length === 1) {
      sameRank[0].shadowed = ranked.filter(function (e) { return e !== sameRank[0]; })
        .map(function (e) { return e.code + " " + e.zh + "（" + (KIND_ZH_OF(e.kind) || e.kind) + "）"; });
      return sameRank;
    }
    return ranked;
  }

  /* 层级中文名。放在这里而不是从 registry 取，是为了让 resolver
     在没有 registry 的环境（如单独跑 check_codes）下也能工作。 */
  var KIND_ZH = {
    painter: "画家", movement: "流派", medium: "媒介", subject: "题材",
    work: "名画", operator: "算子", conflict: "冲突规则", signature: "签名卡",
    provenance: "来源许可", task: "任务模板", atom: "原子模块",
    optic: "光学词条", opticGroup: "光学分组", model: "模型实测"
  };
  function KIND_ZH_OF(k) { return KIND_ZH[k] || k; }

  /* 编辑距离，带上限剪枝：超过 2 就不可能是有用的建议 */
  function dist(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 99;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur.slice();
    }
    return prev[b.length];
  }

  function candidates(q, limit) {
    q = norm(q);
    if (!q) return [];
    var out = [], seenCode = {};
    function push(e, score) {
      if (seenCode[e.code]) return;
      seenCode[e.code] = 1;
      out.push({ code: e.code, zh: e.zh, kind: e.kind, seg: e.seg, score: score });
    }
    /* 第一级：子串 */
    entries.forEach(function (e) {
      var hay = norm([e.code, e.oldId, e.zh, e.en].join(" ") + " " +
                     e.kw.join(" ") + " " + e.alt.join(" "));
      if (hay.indexOf(q) !== -1) push(e, 0);
    });
    /* 第二级：编辑距离。只在中文名之间比，且长度必须接近。
       为什么加长度约束：中文单字信息量低，距离 2 几乎必然是噪音 ——
       实测「cel shadng」会拉出「平静」「网络动画」，毫无参考价值。
       要求长度差 ≤1、距离 ≤1，才认为值得提示。 */
    if (out.length < 3) {
      var words = q.split(/\s+/).filter(function (w) { return w.length >= 2; });
      var q0 = words[0] || q;
      entries.forEach(function (e) {
        if (seenCode[e.code]) return;
        var parts = norm(e.zh).split(/[\s·\/()（）]+/).filter(Boolean);
        var best = 99;
        for (var k = 0; k < parts.length; k++) {
          if (Math.abs(parts[k].length - q0.length) > 1) continue;
          var d = dist(q0, parts[k]);
          if (d < best) best = d;
        }
        if (best <= 1) push(e, best);
      });
    }
    return out.sort(function (a, b) { return a.score - b.score; })
      .slice(0, limit || 6);
  }

  /* ---------- 对外解析 ---------- */
  /* 返回 { ok, hits, why, code, zh, ... }
     ok=false 时 hits=[] 且必带 why 与 cand，绝不猜。 */
  function resolve(input) {
    var raw = String(input == null ? "" : input).trim();
    if (!raw) return { ok: false, why: "空输入", hits: [], cand: [] };

    var hits = lookup(raw);

    if (hits.length === 1) {
      var e = hits[0];
      return {
        ok: true, hits: hits, input: raw, code: e.code, oldId: e.oldId,
        zh: e.zh, en: e.en, kind: e.kind, seg: e.seg, obj: e.obj, note: e.note,
        /* shadowed：被本条遮住的同名项。默认给了信息更全的那一条，
           但要让用户知道另一个也存在，且能按编码精确指到它。 */
        shadowed: e.shadowed || null,
        why: e.shadowed ? "命中原子模块，同名的光学词条可用其编码指定" : "唯一命中"
      };
    }

    if (hits.length > 1) {
      /* 重名与跨类命中是真实存在的（本库有 27 处原子模块与光学词条同名）。
         不替用户选，把所有候选摆出来并标出层级差异，由用户挑。
         但如果多条候选其实是同一层的重复登记，那是数据错误，
         要在 hint 里说出来而不是让用户面对两个一模一样的选项。 */
      var kinds = {};
      hits.forEach(function (h) { kinds[h.kind] = (kinds[h.kind] || 0) + 1; });
      var sameKind = Object.keys(kinds).length === 1;
      return {
        ok: false, ambiguous: true, hits: hits, input: raw,
        why: sameKind
          ? "★ 同层重名（数据缺陷，请报告）：命中 " + hits.length + " 条"
          : "命中 " + hits.length + " 条不同层级的同名项，请指定编码或层级",
        hint: sameKind ? "同层重名说明两条记录指向同一实体，应当合并或改名" : "",
        cand: hits.slice(0, 8).map(function (h) {
          return { code: h.code, zh: h.zh, kind: h.kind, seg: h.seg, note: h.note };
        })
      };
    }

    return {
      ok: false, why: "库中没有这一项", input: raw, hits: [],
      cand: candidates(raw, 6)
    };
  }

  /* 批量解析：接受数组或用分隔符连起来的串。
     逐项解析并回传每一项的结果 —— 组合串里错一项必须立刻报出来，
     不能把其余的照常拼装，让人以为整串都对。

     分隔符不能简单地把空格也算进去：本库有一批名字自带空格
     （MT-001「SD 1.5」、PV-020「CC0 1.0 公共领域奉献」），
     按空格拆会把「SD 1.5」变成「SD」和「1.5」两项，都查不到。
     所以策略是「强分隔符先切，再对每一段做贪心回填」：
     先按 + / 逗号 / 分号切开（这些绝不可能出现在名字里），
     再把含空格的片段按「最长可解析前缀」逐个吞并。
     这样「P-IT-007 + SD 1.5」能正确拆成两项，
     而「SD 1.5」仍能被当成整体命中。 */
  function splitItems(str) {
    var raw = String(str || "").split(/[+＋,，;；]+/).map(function (s) {
      return s.trim();
    }).filter(Boolean);
    /* 单块也要走贪心拆分：用户很可能只打空格分隔的组合串，
       而编码里不含空格，所以整块必然解析失败 —— 这里直接 return
       会让「P-IT-007 明暗对照」这类写法一项都命中不了。 */
    if (!raw.length) return [];

    var out = [];
    raw.forEach(function (chunk) {
      /* 整块就能解析 → 直接收，不再拆。
         这条快路径让绝大多数组合串不做任何拆分尝试。 */
      if (lookup(chunk).length) { out.push(chunk); return; }
      var toks = chunk.split(/\s+/).filter(Boolean);
      /* 只有一个词还解析不了 → 就是真的不认识，交给上层报「找不到」 */
      if (toks.length < 2) { out.push(chunk); return; }
      var i = 0;
      while (i < toks.length) {
        var acc = toks[i], j = i + 1;
        /* 贪心：一直往后吞，吞到能解析或词用完。
           为什么贪心而不是回溯：本库条目名最长不过十余字，
           回溯能解的情况贪心都能解，而回溯会让复杂度上一个量级。 */
        while (j < toks.length) {
          var next = acc + " " + toks[j];
          if (lookup(next).length) { acc = next; j++; } else break;
        }
        out.push(acc);
        i = j;
      }
    });
    return out;
  }

  function resolveMany(input) {
    var items = Array.isArray(input) ? input.slice() : splitItems(input);

    var okList = [], badList = [], ambList = [];
    /* 同一 code 只保留第一次出现。
       为什么必须去重：用户把新旧写法混着写时会出现
       「P-IT07 + PA-125」这种串 —— 两者指同一位画家。
       不去重的话 toSpec 会 push 两次，配方里同一个零件出现两遍，
       而权重会被算成 2.0，效果与用户意图完全不同，
       而且界面上看不出任何异常。 */
    var seenCode = {};
    var dupList = [];
    items.forEach(function (raw) {
      var r = resolve(raw);
      if (r.ok) {
        if (seenCode[r.code]) {
          dupList.push({ input: raw, code: r.code, zh: r.zh,
                         firstInput: seenCode[r.code] });
          return;
        }
        seenCode[r.code] = raw;
        okList.push({ input: raw, code: r.code, zh: r.zh, kind: r.kind,
                      seg: r.seg, obj: r.obj, oldId: r.oldId, note: r.note });
      } else if (r.ambiguous) {
        ambList.push({ input: raw, why: r.why, hint: r.hint || "",
                       cand: (r.cand || []).map(function (c) {
                         return c.code + " " + c.zh;
                       }) });
      } else {
        badList.push({ input: raw, why: r.why,
                       cand: (r.cand || []).map(function (c) { return c.code + " " + c.zh; }) });
      }
    });

    return {
      ok: badList.length === 0 && ambList.length === 0,
      total: items.length,
      okList: okList,
      /* 重复项不算失败：它不是用户的错，是同一东西写了两种写法。
         单独回传，让界面能提示「已合并」而不是默默吞掉。 */
      dupList: dupList,
      badList: badList,
      ambList: ambList,
      /* 拼装串：一串规范编码 + 中文名，供直接粘进别的工具 */
      chain: okList.map(function (x) { return x.code + " " + x.zh; }).join(" + ")
    };
  }

  /* 把解析结果落回引擎认识的 spec 结构。
     这是「用编码组合」真正生效的那一步 ——
     用户敲一串编码，这里把它翻译成 FORGE.compose() 能吃的 spec。 */
  function toSpec(resolved) {
    var spec = { painters: [], subjects: [], works: [], movements: [],
                 mediums: [], optics: [], atoms: [], operators: [] };
    var seenAtom = {};
    (resolved.okList || []).forEach(function (x) {
      var o = x.obj;
      switch (x.kind) {
        case "painter":      spec.painters.push({ id: o.id, w: 1 }); break;
        case "subject":      spec.subjects.push(o.id); break;
        case "work":         spec.works.push(o.id); break;
        case "movement":     spec.movements.push(o.id); break;
        case "medium":       spec.mediums.push(o.id); break;
        case "operator":     spec.operators.push(o.id); break;
        case "atom":         spec.atoms.push(o.id); break;
        case "optic":
          /* 光学词条进 spec 时用「组号.词」形式，forge-kit 的 findOptic 认这个 */
          spec.optics.push(o.groupId + "." + o.t);
          break;
        default:
          /* 签名卡 / 任务模板 / 冲突 / 来源 / 模型 不直接进 spec，
             它们是元层：用签名卡应当整个套用 spec，而不是往里加词。 */
          break;
      }
      seenAtom[x.code] = 1;
    });
    return spec;
  }

  return {
    register: register,
    resolve: resolve,
    resolveMany: resolveMany,
    splitItems: splitItems,
    toSpec: toSpec,
    entries: entries,
    /* 供测试与 UI 使用 */
    index: { byCode: byCode, byOld: byOld, byZh: byZh, byEn: byEn, byTerm: byTerm }
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { RESOLVER: RESOLVER };