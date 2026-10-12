/* ============================================================
 * tasks.js —— 任务模板：使用者带着什么诉求来
 *
 * 为什么需要这一层：以前的签名卡按「题材 + 画家」分类，
 * 但使用者真正的入口是「我要做一张海报」或「我要把这段改成油画」，
 * 不是「我要一张风景」。按任务组织，才对得上实际工作流。
 *
 * 每个任务模板给四样东西：
 *   ask     使用者通常怎么开口（原始诉求）
 *   slots   这类任务必须填满的槽位，缺一个就出不了好图
 *   default 建议的起始配方
 *   check   出图后必须自己看一眼的地方（验收清单）
 *
 * 九类任务覆盖了从「直接可用」到「组合构成」再到「无限变形」的全过程。
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) {
  var _TC = require("./data-core.js");
  var TASKS = _TC.TASKS;
}

/* 任务类型字典：按使用者开口方式来分，不按画面风格分 */
var TASK_CATS = [
  { n: 1, zh: "直接复现", desc: "心里已有一张图或一位画家，要一张能直接用的成品" },
  { n: 2, zh: "风格借用", desc: "要某位画家的感觉，但题材是自己的" },
  { n: 3, zh: "定向变形", desc: "把已有画面整体换成另一个年代或媒介" },
  { n: 4, zh: "局部改造", desc: "只改某几个面，其余必须原封不动" },
  { n: 5, zh: "多源融合", desc: "两三位画家的语言捏在一起，各占一部分" },
  { n: 6, zh: "系列延展", desc: "同一套语言做一组，得保证组内一致" },
  { n: 7, zh: "对照实验", desc: "同时跑几个版本，用来比较哪种更好" },
  { n: 8, zh: "交付适配", desc: "图已经有了，要改到符合用途与平台" },
  { n: 9, zh: "教学拆解", desc: "要讲清一个风格是怎么组成的" }
];
if (typeof module !== "undefined" && module.exports) _TC.TASK_CATS = TASK_CATS;

TASKS.push(
{ id:"T-01", cat:1, zh:"一键成品", en:"One-click Output", status:"tested",
  ask:"给我一张梵高风格的向日葵",
  goal:"不填任何参数，点一下就得到一段能用的提示词",
  slots:["painter","subject"],
  default:{ subjects:["S-12"], painters:["P-NE06"], strength:1.0, platform:"sd" },
  check:["画面里有没有出现不该有的现代物件","笔法是否可辨，而不是只有色调像"],
  why:"这条路最省事，但也是最容易出问题的：模型很容易只学到画家的色调，把笔法丢掉。",
  how:"先看 FORGE.ready(pid) 的输出，确认七面都进去了；如果只有色彩在，优先检查该画家的 tags 是否带了冲突标签被误静音。",
  sigs:["G-01","G-07","G-12"] },

{ id:"T-02", cat:2, zh:"换题材借风格", en:"Own Subject, Borrowed Style", status:"tested",
  ask:"用莫兰迪的灰调画我家的猫",
  goal:"保留某位画家的色彩与气质关系，题材完全替换",
  slots:["painter","subject","motif"],
  default:{ subjects:["S-18"], painters:[{ id:"P-IT11", w:1 }], strength:0.9, platform:"sd" },
  check:["新题材的固有色有没有被画家的旧题材色压掉","画家的母题有没有偷偷跟进来"],
  why:"风格绑定的是七面整体，而题材往往也带自己的色彩与母题，两边会打架。",
  how:"用 OP-D 类算子只取 color 与 spirit 两面，其余静音，题材色就压不过来了。",
  sigs:["G-07","G-18"] },

{ id:"T-03", cat:3, zh:"整体时代迁移", en:"Era Migration", status:"tested",
  ask:"把这个题材改成宋代山水的感觉",
  goal:"保留笔法与色彩，把媒介与空间换到另一个年代",
  slots:["operator-era","subject"],
  default:{ subjects:["S-12"], operators:["OP-E-04"], strength:1.0, platform:"sd" },
  check:["年代痕迹是否到位（纸绢、印章、装裱）","有没有混进另一个年代的东西"],
  why:"迁移类算子内部已写好 preserve 与 forbid，但如果你自己又挂了别的年代算子，两者的 forbid 会互相打架。",
  how:"一次只挂一个时代迁移算子。需要叠加就先后出两版再选，不要混在一个 spec 里。",
  sigs:["G-15","G-21"] },

{ id:"T-04", cat:3, zh:"媒介重铸", en:"Medium Re-forge", status:"tested",
  ask:"把油画改成湿壁画",
  goal:"把画面承载的物质整体换掉，构图与题材不动",
  slots:["operator-medium","painter"],
  default:{ subjects:["S-12"], painters:["P-IT01"], operators:["OP-M-01"], strength:1.1, platform:"sd" },
  check:["原媒介的痕迹有没有残留（画布纹、笔毛痕）","新媒介的典型特征在不在（盐霜、接缝）"],
  why:"媒介迁移必须同时做减法与加法：只加新媒介词不够，旧媒介词还在就会互相污染。",
  how:"算子的 neg 字段已经写好了要去掉的旧痕迹，别手动再补一遍负面词，重复堆负面词反而会拉低画面。",
  sigs:["G-16","G-22"] },

{ id:"T-05", cat:4, zh:"只取某一面", en:"Single-facet Extraction", status:"tested",
  ask:"只借莫兰迪的灰调，其他都别要",
  goal:"从某位画家身上摘出一个零件，其余全面静音",
  slots:["operator-decon","painter"],
  default:{ subjects:["S-18"], painters:["P-IT11"], operators:["OP-D-02"], strength:0.8, platform:"sd" },
  check:["出来的画面是否确实只剩一种倾向","是否因为信息太少而变成平庸的通用图"],
  why:"只取一面时容易丢掉全部个性，因为个性往往藏在被静音的那些面里。",
  how:"取一面之后，至少再加一个光学模块（AM 类）补细节，否则画面会很空。",
  sigs:["G-20"] },

{ id:"T-06", cat:4, zh:"区域改造", en:"Regional Overhaul", status:"written",
  ask:"天空换成日落，其他都不动",
  goal:"只改画面某一块，其余保持原状",
  slots:["atom-light","painter"],
  default:{ subjects:["S-12"], painters:["P-NE04"], atoms:["AM-201"], strength:1.0, platform:"sd" },
  check:["被改的区域与未改区域的光是否接得上","交界处有没有明显的缝"],
  why:"分区改动在单张出图里很难做干净，因为模型没有分区输入的通道。",
  how:"优先用图生图加遮罩做分区，而不是靠提示词。若必须纯文本，把强度压到 0.6 以下并只加局部模块。",
  sigs:[] },

{ id:"T-07", cat:5, zh:"双画家融合", en:"Two-hand Fusion", status:"tested",
  ask:"用梵高的笔法配莫兰迪的颜色",
  goal:"两位画家各出一个面，角色分明",
  slots:["painter-lead","painter-support"],
  default:{ subjects:["S-12"], painters:[{ id:"P-NE06", w:1.1 }, { id:"P-IT11", w:0.7 }], strength:1.1, platform:"sd" },
  check:["两位画家的痕迹是不是都能认出来","有没有变成四不像的中间态"],
  why:"融合失败通常不是权重配错，而是两位的语义标签正好互斥，被冲突规则静音了一方。",
  how:"打开变更清单看谁被静音了。如果被静音的是你想要的那位，把它的权重提到 1.3 以上重试。",
  sigs:["G-23"] },

{ id:"T-08", cat:6, zh:"系列延展", en:"Series Extension", status:"written",
  ask:"用这套风格做一组四张",
  goal:"同一套语言做多张，组内必须像同一个人画的",
  slots:["painter","signature"],
  default:{ painters:["P-CN11"], strength:1.0, platform:"sd" },
  check:["组内各张的色彩关系是否一致","母题是否同源（不能一张山水一张静物）"],
  why:"系列最容易出的问题是每张只保住了色调，七面各张漂移。",
  how:"固定一份 spec 只改 subjects 与 atoms，不要每张重调权重。打包码 AFX1 就是为这件事准备的。",
  sigs:[] },

{ id:"T-09", cat:7, zh:"对照实验", en:"A/B Comparison", status:"written",
  ask:"同一张图跑三个版本，选最好的",
  goal:"只改一个变量，看差别在哪",
  slots:["one-variable"],
  default:{ subjects:["S-01"], painters:["P-NE14"], strength:1.0, platform:"sd" },
  check:["三版之间是否真的只差一个变量","差别是否肉眼可见"],
  why:"一次改两个变量就分不清是谁的作用，这一步没做，对照实验就白做。",
  how:"只动强度、平台、或者某一个算子，其余全部锁死。导出时把每版的 spec 一起存下来。",
  sigs:[] },

{ id:"T-10", cat:8, zh:"平台适配", en:"Platform Adaptation", status:"tested",
  ask:"这串词给 Flux 用要怎么改",
  goal:"同一套语义换到另一代模型上还能用",
  slots:["platform"],
  default:{ painters:["P-NE06"], platform:"flux" },
  check:["权重语法是否被目标模型识别","自然语言模型上是否还堆着大量权重括号"],
  why:"SD 系与 MJ 系认权重语法，Flux 与新一代自然语言模型基本忽略括号，改用重复与位置强调。",
  how:"在 forge-kit 的平台方言里加一个 flux 选项：把权重词就地重复两遍，并把最重要的概念挪到句首。",
  sigs:[] },

{ id:"T-11", cat:8, zh:"用途适配", en:"Output-purpose Fit", status:"written",
  ask:"这张要做成竖版海报",
  goal:"按最终用途调整画幅、留白与信息密度",
  slots:["atom-purpose","painter"],
  default:{ subjects:["S-04"], painters:["P-IT14"], atoms:["AM-C01","AM-C10"], strength:1.0, platform:"sd" },
  check:["标题区是否留出来了","主体有没有被安全区切掉"],
  why:"用途决定构图，不定用途就出图，后期裁切通常救不回来。",
  how:"先选 AM-C 类的用途模块，再定构图。不要先出图再裁。",
  sigs:[] },

{ id:"T-12", cat:9, zh:"风格拆解讲解", en:"Style Breakdown", status:"written",
  ask:"梵高的风格到底由哪几样东西组成",
  goal:"把一个风格拆成可讲、可教、可复现的零件",
  slots:["painter","facets"],
  default:{ painters:["P-NE06"] },
  check:["每一面是否都能落到具体可见的词上","讲解里有没有把解释当成事实"],
  why:"拆解时最容易把创作解释讲成历史事实，例如把某个用色说成他本人明确说过。",
  how:"讲解时按信息分类标注：哪些是看画能看到的（视觉观察），哪些是后人解释的（创作解释），哪些有出处（历史事实）。",
  sigs:[] },

{ id:"T-13", cat:9, zh:"复现校准", en:"Reproduction Calibration", status:"written",
  ask:"我要让出图尽量接近某张真迹",
  goal:"把一张具体名画拆成可复现的配方",
  slots:["work","painter"],
  default:{ works:["W-01"], strength:1.0, platform:"sd" },
  check:["年代痕迹是否保留","是否被模型自作主张地补全了"],
  why:"名画自带的约束（未修复、禁止现代物件）如果没挂上，模型会把残缺补成完好的新画。",
  how:"名画的 src 字段若带许可信息，导出时一并输出，避免误用受限制的图像。",
  sigs:[] }
);

if (typeof module !== "undefined" && module.exports) module.exports = { TASKS, TASK_CATS };
