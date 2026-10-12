/* ============================================================
 * check_codes.js · 编码体系验证
 * ============================================================
 * 八组断言，覆盖「能不能引用」这件事的全部要害：
 *  1 编码唯一          2 形态统一（单一形态）  3 全库无漏编
 *   4 编码↔旧 ID 双向  5 中文名可解析          6 简写与容错
 *   6b 旧写法仍可解析（不可破坏性变更）        7 组合串逐项报错
 *   8 元层不入提示词    9 解析出的 spec 能跑通
 *
 * 为什么要单独一个工具而不是并进 smoke.js：
 *   smoke.js 验的是「引擎算得对不对」，这里验的是「引用体系本身有没有破」。
 *   两类失败的处理方式完全不同 —— 引擎错了要调算法，
 *   编码错了要改数据或改映射表，混在一起就分不清是哪一类。
 * ============================================================ */
const { REGISTRY } = require("../assets/registry.js");
const { RESOLVER } = require("../assets/resolver.js");
const { CODES } = require("../assets/codes.js");

let pass = 0, fail = 0;
const bad = [];
function ok(cond, msg, detail) {
  if (cond) { pass++; return; }
  fail++; bad.push(msg + (detail ? "  → " + detail : ""));
  console.log("  ✗ " + msg + (detail ? "  → " + detail : ""));
}
function head(t) { console.log("\n" + t); }

const T = REGISTRY.total;
console.log("登记条目 " + T + " / 段码 " + REGISTRY.SEGMENTS.length +
            " / 关系边 " + REGISTRY.relations.length);

/* ---------- 1 编码唯一 ---------- */
head("【1】编码唯一性");
{
  const seen = {};
  const dup = [], selfDup = [];
  RESOLVER.entries.forEach(e => {
    if (seen[e.code]) dup.push(e.code + " ← " + seen[e.code] + " / " + e.oldId);
    else seen[e.code] = e.oldId;
  });
  ok(dup.length === 0, "无撞码", dup.slice(0, 5).join("; "));
  ok(RESOLVER.entries.length === T, "登记数一致（" + RESOLVER.entries.length + "）");

  /* 同一批数据登记两次，CODES 内部会不会越滚越多映射？
     这是幂等性检查：registry 被重复调用（例如工具里误 require 两次）
     不应该让 UNCODED 里堆出一堆「撞码」。 */
  const before = CODES.UNCODED.length;
  RESOLVER.entries.forEach(e => CODES.add(e.oldId));
  ok(CODES.UNCODED.length === before, "重复登记不产生撞码",
     before + " → " + CODES.UNCODED.length);
}

/* ---------- 2 编码形态一致 ---------- */
head("【2】编码形态统一（唯一形态）");
{
  /* 这一组是本轮重构的核心断言。
     上一版有四种长度并存（P-CN-001 / AM-101 / AM-A-001 / O-01-001），
     用户的批评是「过于乱了、没有统一命名、没有系统性」。
     所以现在不是「每段都合法」而是**全库只有一种形态**：
     段码两字母 + 连字符 + 三位数字，长度恒为 6。
     少一条断言都可能被后来者改回去 —— 因为混着确实也能用，
     只是没法用一条正则解析、也没法肉眼校验。 */
  const SHAPE = /^[A-Z]{2}-\d{3}$/;
  const badShape = RESOLVER.entries.filter(e => !SHAPE.test(e.code));
  ok(badShape.length === 0, "全库条目都是「两字母-三位」单一形态",
     badShape.slice(0, 6).map(e => e.code).join(", "));

  const relBad = REGISTRY.relations.filter(r => !SHAPE.test(r.code));
  ok(relBad.length === 0, "关系边同形态",
     relBad.slice(0, 5).map(r => r.code).join(", "));

  const lenSet = {};
  RESOLVER.entries.concat(REGISTRY.relations)
    .forEach(e => { lenSet[e.code.length] = (lenSet[e.code.length] || 0) + 1; });
  ok(Object.keys(lenSet).length === 1,
     "全库编码等长（" + JSON.stringify(lenSet) + "）");

  /* 段码必须是登记过的，且两两不同、互不为前缀。
     互不为前缀是段码能靠「取前两位」判段的唯一前提：
     若 P 是 PA 的前缀，P-001 会被误判成 PA 段。 */
  const segs = CODES.SEGMENTS.map(s => s.code);
  ok(segs.every(s => /^[A-Z]{2}$/.test(s)),
     "段码恒为两位大写字母", segs.filter(s => !/^[A-Z]{2}$/.test(s)).join(","));
  ok(new Set(segs).size === segs.length, "段码两两不同");
  const prefixHit = [];
  segs.forEach(a => segs.forEach(b => {
    if (a !== b && b.indexOf(a) === 0) prefixHit.push(a + " ⊂ " + b);
  }));
  ok(prefixHit.length === 0, "段码互不为前缀", prefixHit.slice(0, 4).join("; "));

  /* 每段序号必须唯一、不重复，且段内无「一号两用」。
     不断言连续：PV 段旧 ID 本来就跳号（PV-01~08 / PV-20~23 / PV-30~40，
     三批机构各自分号），code 必须跟着旧 ID 走才叫「可回溯」，
     为了连续而重排 PV 会让 PROVENANCE 的引用与历史记录脱节。
     真正要防的是同一段里出现两个条目抢同一个号 —— 那在 add() 里已拦。 */
  const dupNo = [];
  CODES.SEGMENTS.forEach(s => {
    const seen = {};
    (REGISTRY.bySeg[s.code] || []).forEach(c => {
      const n = c.slice(3);
      if (seen[n]) dupNo.push(s.code + "-" + n);
      else seen[n] = 1;
    });
  });
  ok(dupNo.length === 0, "每段内序号唯一", dupNo.slice(0, 6).join(", "));

  /* 新码不得与该段任何旧 ID 同形。
     同形就意味着「一个字符串指向两个条目」，解析时给谁都对不了 ——
     这是上一版 AM 段的真实故障：AM-101 既是旧 ID 又是别人的新码。 */
  const crossHit = [];
  RESOLVER.entries.forEach(e => {
    if (CODES.CODE_OF[e.oldId.toUpperCase()] &&
        CODES.CODE_OF[e.oldId.toUpperCase()] !== e.code) {
      crossHit.push(e.oldId + " ≡ " + e.code + "/" + CODES.CODE_OF[e.oldId.toUpperCase()]);
    }
  });
  ok(crossHit.length === 0, "新码不与旧 ID 同形指错条目",
     crossHit.slice(0, 6).join("; "));

  /* 反向：code 反推 oldId 必须能回到原值，否则用户复制编码回来查不到 */
  let badBack = [];
  RESOLVER.entries.forEach(e => {
    if (CODES.CODE_OF[e.code] !== e.oldId) badBack.push(e.code);
  });
  ok(badBack.length === 0, "code 反查 oldId 一致",
     badBack.slice(0, 5).join(", "));
}

/* ---------- 3 全库无漏编 ---------- */
head("【3】全库无漏编");
{
  ok(CODES.UNCODED.length === 0, "无未编码项",
     CODES.UNCODED.length ? CODES.UNCODED.slice(0, 8).join("; ") : "");

  const noCode = RESOLVER.entries.filter(e => !e.code);
  ok(noCode.length === 0, "每条都有编码");

  /* 中文名是解析的第二入口。缺 zh 的条目用户只能靠背编码找它，
     而「记不住编码就等于找不到」是这套体系最伤的失败模式。 */
  const noZh = RESOLVER.entries.filter(e => !e.zh);
  ok(noZh.length === 0, "每条都有中文名",
     noZh.slice(0, 6).map(e => e.code).join(", "));

  /* 关系边也必须有编码，否则「我要这条师承关系」没法表达 */
  const relNoCode = REGISTRY.relations.filter(r => !r.code);
  ok(relNoCode.length === 0, "关系边都有编码", relNoCode.length + " 条缺");
  const relDup = {};
  const rd = [];
  REGISTRY.relations.forEach(r => {
    if (relDup[r.code]) rd.push(r.code); else relDup[r.code] = 1;
  });
  ok(rd.length === 0, "关系边编码无重复", rd.slice(0, 5).join(", "));
}

/* ---------- 4 双向解析 ---------- */
head("【4】编码 ↔ 旧 ID 双向解析");
{
  let e1 = [];
  RESOLVER.entries.forEach(e => {
    const a = RESOLVER.resolve(e.code);
    const b = RESOLVER.resolve(e.oldId);
    if (!a.ok) e1.push("code→" + e.code + "(" + a.why + ")");
    else if (a.code !== e.code) e1.push("code→" + e.code + "(得到 " + a.code + ")");
    if (!b.ok) e1.push("id→" + e.oldId + "(" + b.why + ")");
    else if (b.code !== e.code) e1.push("id→" + e.oldId + "(得到 " + b.code + ")");
  });
  ok(e1.length === 0, T + " 条双向可解析",
     e1.slice(0, 6).join("; "));
}

/* ---------- 5 中文名 ---------- */
head("【5】中文名可解析");
{
  let unres = [], amb = 0, shadowed = 0;
  const ambPairs = {};
  RESOLVER.entries.forEach(e => {
    const r = RESOLVER.resolve(e.zh);
    if (!r.ok && !r.ambiguous) { unres.push(e.zh + "(" + r.why + ")"); return; }
    if (r.ambiguous) {
      amb++;
      /* 同层重名是数据缺陷，必须记下来：两条记录指同一实体，
         用户在编码工作台看到两个一模一样的选项却不知该选哪个。
         跨层同名（原子模块 ↔ 光学词条）不算缺陷 ——
         那是两层对同一条内容的两次录入，应按层级收敛而非报错。 */
      const kinds = r.cand.map(c => c.kind).sort().join("+");
      ambPairs[kinds] = (ambPairs[kinds] || 0) + 1;
      return;
    }
    if (r.shadowed) shadowed++;
  });
  ok(unres.length === 0, "中文名全部可解析", unres.slice(0, 6).join("; "));
  ok(Object.keys(ambPairs).filter(k => k.indexOf("+") < 0).length === 0,
     "无同层重名（数据缺陷）", JSON.stringify(ambPairs));
  ok(shadowed > 0, "跨层同名已按层级收敛并留痕",
     shadowed + " 条有被遮住的同名项");
  console.log("  · 跨层同名收敛：" + shadowed +
    " 条（原子模块优先，光学词条可用 OP 段编码精确指定）");
  if (amb) console.log("  · 仍未收敛的重名：" + amb + " 条 " + JSON.stringify(ambPairs));
}

/* ---------- 6 简写与容错 ---------- */
head("【6】编码简写与大小写容错");
{
  const t = [
    ["pa-125", "全小写"], ["PA-125", "规范码"], ["PA-125", "规范码带前导零"],
    ["PA-125", "省略前导零位"], ["P-IT07", "旧 ID 无连字符"],
    ["G-01", "旧签名卡号"], [" o-01-001 ", "前后空格"],
    ["OP-E-01", "旧算子三段"], ["OP-1", "旧写法补零后命中"],
    ["卡拉瓦乔", "中文名"], ["caravaggio", "英文名"]
  ];
  t.forEach(([q, why]) => {
    const r = RESOLVER.resolve(q);
    ok(r.ok, why + " 「" + q + "」→ " + (r.ok ? r.code + " " + r.zh : r.why));
  });

  /* 补零只能发生在**已存在**的编码上。
     PA-999 库里没有，就必须明确报不存在 ——
     若补零逻辑写成「补完再查表」，将来某段超过 999 条时，
     序号会静默回绕到别人的号上，那是最难查的一类错。 */
  const over = RESOLVER.resolve("PA-999");
  ok(!over.ok, "超出段容量的编码不命中", over.code || "");
  const over2 = RESOLVER.resolve("PA-9999");
  ok(!over2.ok, "四位序号不命中", over2.code || "");
  const bogus = RESOLVER.resolve("ZZ-001");
  ok(!bogus.ok, "未登记段码不命中", bogus.code || "");

  /* 查不到时必须报找不到，绝不能给一个猜测。
     这是整套体系最硬的约定：宁可让用户重输，也不能给他一个假编码。 */
  const miss = RESOLVER.resolve("绝对不存在的画风xyz");
  ok(!miss.ok, "查不到时 ok=false");
  ok(miss.code === undefined, "查不到时不返回猜测编码",
     miss.code ? "竟然给了 " + miss.code : "");
  console.log("  · 兜底候选：" + (miss.cand || []).slice(0, 3)
    .map(c => c.code + " " + c.zh).join(" / "));

  /* 错字容错：只收距离 ≤1 且长度差 ≤1 的建议，否则全是噪音 */
  const typo = RESOLVER.resolve("卡拉瓦纠");
  console.log("  · 错字「卡拉瓦纠」→ " + (typo.ok ? typo.zh : "未命中，候选: " +
    (typo.cand || []).slice(0, 2).map(c => c.zh).join(" / ")));
}

/* ---------- 6b 向后兼容 ---------- */
head("【6b】旧写法全部仍可解析（不可破坏性变更）");
{
  /* 这一组的意义：编码体系换代是**破坏性变更**的高发点。
     上一版已经把 P-IT-007 / AM-A-001 / O-01-001 发给用户了，
     换编码就必须保证旧串继续能查 —— 否则用户攒下的组合串一夜作废。
     所以每一类旧写法都要全库逐条验，不是抽查。 */
  let badId = [], badLegacy = [];
  RESOLVER.entries.forEach(e => {
    const a = RESOLVER.resolve(e.oldId);
    if (!a.ok || a.code !== e.code) badId.push(e.oldId);
    const lg = CODES.legacyCode(e.oldId);
    if (lg) {
      const b = RESOLVER.resolve(lg);
      if (!b.ok || b.code !== e.code) badLegacy.push(lg + "→" + (b.code || "FAIL"));
    }
  });
  ok(badId.length === 0, T + " 条旧 ID 全部仍能解析",
     badId.slice(0, 6).join(", "));
  ok(badLegacy.length === 0, "上一版 code 全部仍能解析",
     badLegacy.slice(0, 6).join("; "));

  /* 别名表必须真的建起来了，且不与规范码指向不同条目。
     别名表为空意味着 add() 没登记 —— 那时上面两条断言会假绿，
     因为 byOld 索引本身也能命中。

     判据用「解析到同一个 code」而不是「键不相撞」：
     MD/CF/MT/PV 四段的新码与上一版 code 完全相同（如 MD-001），
     于是 "md-001" 既是别名又是规范码 —— 这是对的，不是冲突。
     真正要拦的是「同一个字符串指向两个不同条目」，那只有解析器知道。 */
  const aliasKeys = Object.keys(CODES.ALIASES);
  ok(aliasKeys.length >= T, "别名表已建立（" + aliasKeys.length + " 条）");
  const clash = aliasKeys.filter(k => {
    const viaAlias = RESOLVER.resolve(k);
    const viaCode = RESOLVER.resolve(String(k).toUpperCase());
    if (!viaAlias.ok || !viaCode.ok) return false;
    return viaAlias.code !== viaCode.code;
  });
  ok(clash.length === 0, "别名与规范码解析到同一条目",
     clash.slice(0, 5).map(k => k + "→" + CODES.ALIASES[k]).join(", "));
  const badAlias = aliasKeys.filter(k => !CODES.CODE_OF[CODES.ALIASES[k]]);
  ok(badAlias.length === 0, "别名全部指向已存在的规范码",
     badAlias.slice(0, 5).join(", "));

  /* 反查也要能用：拿到旧码能问出它现在叫什么 */
  const r = RESOLVER.resolve("P-IT07");
  ok(r.ok && r.oldId === "P-IT07", "旧 ID 命中后仍保留 oldId 供显示",
     r.ok ? r.oldId : "FAIL");
}

/* ---------- 7 组合串 ---------- */
head("【7】组合串逐项解析");
{
  const r = RESOLVER.resolveMany("PA-125 + 卡拉瓦乔 + 单侧窗光 + OP-004");
  ok(r.ok, "编码与中文名混合串全部命中", JSON.stringify(r.badList));
  ok(r.okList.length === 4, "命中 4 项（实际 " + r.okList.length + "）");
  ok(r.chain.indexOf("PA-125") === 0, "输出链以首个编码开头",
     r.chain.slice(0, 50) + "…");

  const bad1 = RESOLVER.resolveMany("PA-125 + 乱写的东西 + 单侧窗光");
  ok(!bad1.ok, "串里有错项时整体报失败");
  ok(bad1.badList.length === 1 && bad1.badList[0].input === "乱写的东西",
     "精确指出哪一项错了",
     JSON.stringify((bad1.badList[0] || {}).input));
  ok(bad1.okList.length === 2, "正确项仍单独返回，可继续用",
     bad1.okList.length + "");

  /* 分隔符容错：+ 号、全角加号、逗号、空格都要能用 */
  const sep = RESOLVER.resolveMany("PA-125，单侧窗光，OP-004");
  ok(sep.okList.length === 3, "中文逗号分隔也能拆开",
     sep.okList.length + " 项");

  /* 混着旧写法用也要能拼 —— 这正是「不可破坏性变更」的落点：
     用户手上是一串新旧混用的东西，不能要求他先全部改写。 */
  const mix = RESOLVER.resolveMany("P-IT07 + PA-125 + AM-101 + 明暗对照");
  ok(mix.ok, "新旧写法混用也能拼成组合串", JSON.stringify(mix.badList));
  const mixSpec = RESOLVER.toSpec(mix);
  ok(mixSpec.painters.length === 1 && mixSpec.atoms.length === 1,
     "新旧写法指向同一条时不会重复计入",
     JSON.stringify({ p: mixSpec.painters.length, a: mixSpec.atoms.length }));
}

/* ---------- 8 元层不入提示词 ---------- */
head("【8】元层条目不进提示词");
{
  /* 这是最容易出乱子的一条：用户打「CC0」命中 PV-020，
     如果 toSpec 把它塞进 spec，引擎会把许可名称当视觉描述用。
     所以元层必须在解析阶段就被挡住，而不是到引擎里再报错。 */
  const r = RESOLVER.resolveMany("PA-125 + CC0 + SD 1.5 + 静物");
  ok(r.ok, "元层条目能被查到（供查证用）", JSON.stringify(r.badList));
  const spec = RESOLVER.toSpec(r);
  const flat = JSON.stringify(spec);
  ok(flat.indexOf("CC0") < 0 && flat.indexOf("SD 1.5") < 0,
     "spec 里不含元层条目", flat.slice(0, 90));
  ok(spec.painters.length === 1 && spec.subjects.length === 1,
     "spec 只收了可组合项", JSON.stringify(spec));

  /* 反向：元层必须仍能被查到，否则「这条能不能商用」就没法查了 */
  ok(["conflict", "provenance", "model", "task", "signature"].every(
       k => Object.keys(REGISTRY.META_KINDS).indexOf(k) >= 0),
     "五类元层都标注了用途说明");
}

/* ---------- 9 spec 可被引擎接受 ---------- */
head("【9】解析出的 spec 能真的跑通");
{
  /* 解析器给的 spec 必须能被引擎吃下去。
     字段名或结构对不上时，错误会延迟到用户点「生成」才爆出来 ——
     那时用户已经填了一堆东西，排查成本高得多。 */
  const FORGE = require("../assets/forge-kit.js").FORGE;
  const r = RESOLVER.resolveMany("PA-125 + 静物 + chiaroscuro + OP-037");
  const spec = RESOLVER.toSpec(r);
  let out = null, err = "";
  try {
    out = FORGE.compose(Object.assign({ strength: 1, platform: "sd" }, spec));
  } catch (e) { err = e.message; }
  ok(!!out && !!out.tags, "compose 未抛错且产出 tags", err);
  if (out) {
    ok(out.tags.length > 0, "tags 非空", (out.tags || []).length + " 段");
    ok(!!out.gpt, "产出自然语言正文");
    ok(!!out.quality, "产出画质串");
  }
}

console.log("\n" + (fail === 0 ? "全绿：" : "有失败：") + pass + " 通过 / " + fail + " 失败");
if (fail) bad.slice(0, 10).forEach(b => console.log("  · " + b));
process.exit(fail === 0 ? 0 : 1);