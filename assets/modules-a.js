/* ============================================================
 * modules-a.js —— 原子视觉模块 · 12 类之一至三
 *
 * 原子模块与 OPTICS 的关系：OPTICS 是「勾选即投放」的横切词条，
 * 原子模块在此之上多三样东西——
 *   role   ：这个模块在本次配方里扮演什么角色（主导 / 辅助 / 局部 / 约束）
 *   guard  ：是不是硬边界（约束类，任何权重都压不掉）
 *   alt    ：同义替换，模型不认这个词时的备选
 *
 * 12 类的分工：前 7 类回答「画面长什么样」，第 8 至 10 类回答
 * 「形体与画面里发生什么」，第 11 类回答「用什么镜头看」，
 * 第 12 类回答「这张图拿去干什么」——最后这一类以前完全缺失，
 * 却直接决定尺寸、画幅与留白该怎么排。
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) {
  var _MC = require("./data-core.js");
  var ATOMS = _MC.ATOMS;
}

/* 12 类模块的注册表：cat 是分类，slot 是默认投放面 */
var MODULE_CATS = [
  { n: 1,  zh: "光影",       slot: "light",  desc: "光从哪来、怎么落、暗部怎么处理" },
  { n: 2,  zh: "时间与天候", slot: "light",  desc: "什么时刻、什么天气、什么季节" },
  { n: 3,  zh: "空间透视",   slot: "space",  desc: "纵深怎么建立、视点在哪、消失线有几个" },
  { n: 4,  zh: "构图取景",   slot: "space",  desc: "东西怎么摆、留白在哪、重心落在哪" },
  { n: 5,  zh: "色彩关系",   slot: "color",  desc: "颜色之间怎么相处、饱和度与明度怎么压" },
  { n: 6,  zh: "笔触肌理",   slot: "brush",  desc: "痕迹怎么留在画面上、边缘硬不硬" },
  { n: 7,  zh: "材料与年代", slot: "medium", desc: "画面由什么承载、年代痕迹做没做" },
  { n: 8,  zh: "形体轮廓",   slot: "brush",  desc: "体积怎么交代、轮廓线要不要、变形允许多少" },
  { n: 9,  zh: "气氛情绪",   slot: "spirit", desc: "画面背后那口气" },
  { n: 10, zh: "叙事与时间", slot: "spirit", desc: "画面里正在发生什么、之前之后发生过什么" },
  { n: 11, zh: "镜头与密度", slot: "space",  desc: "用什么镜头看、铺多满、切多近" },
  { n: 12, zh: "输出用途",   slot: "spirit", desc: "这张图最终用在哪，决定画幅与信息密度" }
];
if (typeof module !== "undefined" && module.exports) _MC.MODULE_CATS = MODULE_CATS;

ATOMS.push(
/* ---------- 1 光影 ---------- */
{ id:"AM-101", role:"lead", status:"tested",  cat:1, slot:"light", t:"chiaroscuro", zh:"明暗对照",
  c:"强侧光塑造体积，暗部吃掉一半画面",
  alt:["strong side lighting","dramatic light shadow"],
  read:"一旦画面里有第二个光源，这一条立刻失效。", status:"tested" },
{ id:"AM-102", role:"lead", status:"tested",  cat:1, slot:"light", t:"tenebrism", zh:"极端明暗",
  c:"光束像刀一样劈下来，暗部几乎全黑",
  alt:["dramatic tenebrism","single dominant light shaft"],
  read:"暗部要真黑，不能靠后期提亮；提亮就等于取消这条。", status:"tested" },
{ id:"AM-103", role:"support", status:"tested",  cat:1, slot:"light", t:"rim light", zh:"轮廓光",
  c:"主体背后被光勾出一道边",
  alt:["backlit rim","edge highlight"],
  read:"是分离主体与背景最省事的一招，比整体提亮有效。", status:"tested" },
{ id:"AM-104", role:"lead", status:"tested",  cat:1, slot:"light", t:"single window light", zh:"单侧窗光",
  c:"光只从一侧窗口进来，另一侧交给反射",
  alt:["window light from left","single light source"],
  read:"室内题材最稳的默认光；给两个窗就废了。", status:"tested" },
{ id:"AM-105", role:"lead", status:"tested",  cat:1, slot:"light", t:"diffused skylight", zh:"天顶柔光",
  c:"天顶罩下来的光，几乎不投影",
  alt:["soft overhead light","shadowless ambient light"],
  read:"阴天或北向窗的逻辑，画面会平但通透。", status:"tested" },
{ id:"AM-106", role:"support", status:"tested",  cat:1, slot:"light", t:"candlelight", zh:"烛火",
  c:"近距离火光，衰减极快，暖到发橙",
  alt:["warm candlelit glow","oil lamp light"],
  read:"光源必须在画面内，否则橙调没有理由。", status:"tested" },
{ id:"AM-107", role:"support", status:"written",  cat:1, slot:"light", t:"reflected bounce light", zh:"反跳光",
  c:"地面或墙反上来的二次光托住暗部",
  alt:["bounce fill light","indirect reflected light"],
  read:"是让暗部透气又不提亮的关键，比直接加亮度词好。", status:"written" },
{ id:"AM-108", role:"lead", status:"tested",  cat:1, slot:"light", t:"no cast shadow", zh:"取消投影",
  c:"完全取消投影，画面转向平面",
  alt:["shadowless flat lighting","no cast shadows"],
  read:"要平还是要体积，这是分水岭；和平面装饰同时用才对。", status:"tested" },
{ id:"AM-109", role:"support", status:"written",  cat:1, slot:"light", t:"dust beam volume", zh:"可见光柱",
  c:"光柱成形，悬浮尘埃在光里",
  alt:["volumetric god rays","visible light shafts with dust"],
  read:"只在有遮挡物时成立，空房间不会出光柱。", status:"written" },
{ id:"AM-110", role:"guard", status:"tested",  cat:1, slot:"light", t:"no text or watermark", zh:"禁文字水印",
  c:"画面里不得出现任何文字、签名、标识、水印",
  alt:["no lettering","clean image without text"],
  guard:true,
  read:"约束类模块，任何权重都压不掉；导出时进负面词。", status:"tested" },

/* ---------- 2 时间与天候 ---------- */
{ id:"AM-201", role:"support", status:"tested",  cat:2, slot:"light", t:"golden hour", zh:"金色时刻",
  c:"日出日落，低角度暖长影",
  alt:["sunset warm light","low angle golden light"],
  read:"影子会被拉得很长，构图上要提前给影子的位置。", status:"tested" },
{ id:"AM-202", role:"support", status:"tested",  cat:2, slot:"light", t:"blue hour", zh:"蓝调时刻",
  c:"日落后的冷调，天空比地面还亮",
  alt:["dusk blue ambient","twilight cool tone"],
  read:"天空亮、地面暗，是这张图全部的对比来源。", status:"tested" },
{ id:"AM-203", role:"support", status:"written",  cat:2, slot:"light", t:"high noon", zh:"正午顶光",
  c:"顶光，影子最短最硬",
  alt:["overhead midday sun","short hard shadow"],
  read:"顶光会在眼窝与鼻下留硬阴影，需要补一条反跳光才自然。", status:"written" },
{ id:"AM-204", role:"support", status:"tested",  cat:2, slot:"light", t:"overcast grey day", zh:"阴天",
  c:"阴天柔光，色彩发闷",
  alt:["grey overcast sky","flat dull daylight"],
  read:"是所有需要压低饱和的题材的省事开关。", status:"tested" },
{ id:"AM-205", role:"support", status:"written",  cat:2, slot:"light", t:"storm breaking light", zh:"暴雨间隙",
  c:"乌云缝隙里透出的一线冷光",
  alt:["light breaking through storm clouds","crepuscular ray through rain"],
  read:"要有云的形状才成立，平铺的灰底出不来。", status:"written" },
{ id:"AM-206", role:"support", status:"tested",  cat:2, slot:"light", t:"deep night noir", zh:"深夜",
  c:"夜，只有零星几点硬光",
  alt:["dark night scene","night with sparse hard light"],
  read:"点光源数量要控制，多了就不像夜戏了。", status:"tested" },
{ id:"AM-207", role:"support", status:"tested",  cat:2, slot:"light", t:"fog diffused light", zh:"雾中散射",
  c:"雾把对比压到最低，远景只剩轮廓",
  alt:["heavy fog low contrast","misty diffused atmosphere"],
  read:"雾是最强的深度工具，比空气透视省力。", status:"tested" },
{ id:"AM-208", role:"support", status:"written",  cat:2, slot:"light", t:"seasonal snow light", zh:"雪地反光",
  c:"雪把暗部整体抬起来",
  alt:["snow covered ground bounce","bright winter reflected light"],
  read:"物理上暗部会被抬亮，不补这句模型就不知道。", status:"written" },

/* ---------- 3 空间透视 ---------- */
{ id:"AM-301", role:"lead", status:"tested",  cat:3, slot:"space", t:"strict linear perspective", zh:"严谨焦点透视",
  c:"所有透视线收于单一灭点",
  alt:["one point perspective","scientific linear perspective"],
  read:"单灭点是西方写生的底线，用了就别再叠散点透视。", status:"tested" },
{ id:"AM-302", role:"support", status:"tested",  cat:3, slot:"space", t:"atmospheric perspective", zh:"空气透视",
  c:"越远越灰越冷越淡",
  alt:["aerial perspective","depth by value fading"],
  read:"国画里叫「远淡」，两套逻辑可以共用。", status:"tested" },
{ id:"AM-303", role:"lead", status:"tested",  cat:3, slot:"space", t:"flattened stacked planes", zh:"平铺层叠",
  c:"层层平铺，取消纵深",
  alt:["flat layered planes","stacked register planes"],
  read:"浮世绘与中世纪金底画共用这一条。", status:"tested" },
{ id:"AM-304", role:"lead", status:"tested",  cat:3, slot:"space", t:"scattered perspective", zh:"散点透视",
  c:"视点移动的多重视野",
  alt:["moving viewpoint perspective","multiple viewpoints in one image"],
  read:"中国山水的基本空间逻辑；与单灭点互斥。", status:"tested" },
{ id:"AM-305", role:"lead", status:"written",  cat:3, slot:"space", t:"three distance depth", zh:"三远法",
  c:"高远、平远、深远三段式",
  alt:["three distances composition","high level distance deep level distance"],
  read:"不只是纵深，更是三段景别的节奏编排。", status:"written" },
{ id:"AM-306", role:"support", status:"tested",  cat:3, slot:"space", t:"forced foreshortening", zh:"夸张透视",
  c:"近大远小推到极端，把观者逼进画面",
  alt:["dramatic foreshortening","extreme perspective distortion"],
  read:"前景物要给足尺度，否则夸张不出来。", status:"tested" },
{ id:"AM-307", role:"support", status:"written",  cat:3, slot:"space", t:"shallow relief depth", zh:"浅浮雕厚度",
  c:"只留一点厚度，像浮雕",
  alt:["shallow bas relief depth","slight raised relief"],
  read:"拜占庭与埃及壁画的深度感来源。", status:"written" },
{ id:"AM-308", role:"support", status:"tested",  cat:3, slot:"space", t:"isometric space", zh:"轴测空间",
  c:"平行轴测，不走灭点",
  alt:["isometric projection","parallel axonometric view"],
  read:"技术插图与游戏场景图的标准空间。", status:"tested" },
{ id:"AM-309", role:"guard", status:"tested",  cat:3, slot:"space", t:"no linear perspective", zh:"禁焦点透视",
  c:"不得出现单灭点式的写实透视",
  alt:["avoid one point perspective"],
  guard:true,
  read:"上散点透视或平铺时用这条把它钉死。", status:"tested" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { ATOMS, MODULE_CATS };
