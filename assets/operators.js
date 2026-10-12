/* ============================================================
 * operators.js —— 变形算子 + 冲突矩阵
 *
 * 设计原则：算子是「数据」不是「代码」。
 * 新增一种玩法只需往 OPERATORS 里加一项，引擎不需要改一行。
 * ------------------------------------------------------------------
 * keep   : 来源风格里哪些面继续生效（不给则默认全取）
 * only   : 只要这几面，其余全部静音（解构类算子专用）
 * inject : 往指定面里塞入关键词
 * add    : 追加到标签尾部的散词
 * neg    : 追加到负面词的散词
 * ============================================================ */

if (typeof module !== "undefined" && module.exports) {
  var _OC = require("./data-core.js");
  var OPERATORS = _OC.OPERATORS, CONFLICTS = _OC.CONFLICTS;
}

/* ---------- 一、时代迁移：保留笔法与色彩，把媒介与空间换到另一个年代 ---------- */
OPERATORS.push(
{ id:"OP-E-01", status:"tested",  zh:"时代迁移 · 古典重写", en:"Era Shift: Classical Panel", kind:"era",
  keep:["brush","color","spirit"],
  inject:{ medium:["egg tempera and oil glazes on gessoed panel"], light:["single high window light","deep chiaroscuro"], space:["strict linear perspective","architectural framing"] },
  add:["fifteenth century devotional panel"], neg:["led lighting","modern furniture"],
  desc:"把任何画面的承载方式退回十五至十七世纪的木板坦培拉：光线变成唯一的窗光，空间退回严谨透视线，但笔性与配色仍是本人的。",
  note:"古典重写后不要再追加现代高对比的画质词，多层罩染那种通透感会被直接洗成塑料。" },

{ id:"OP-E-02", status:"tested",  zh:"时代迁移 · 巴洛克剧场", en:"Era Shift: Baroque Theatre", kind:"era",
  keep:["brush","color","spirit"],
  inject:{ medium:["oil on canvas","thick bituminous underpainting"], light:["raking stage light","theatrical spotlight falloff"], space:["diagonal thrust composition","figures pushed to the picture plane"] },
  add:["seventeenth century altarpiece scale","dramatic tenebrism"], neg:["flat even lighting","minimalist emptiness"],
  desc:"把画面改造成十七世纪的舞台：光是一束从上斜劈下来的强光，构图走对角线，人物几乎贴着画面边缘冲出去。",
  note:"巴洛克 + 极少留白是死组合，画面会既吵又空；给足道具与褶皱。" },

{ id:"OP-E-03", status:"tested",  zh:"时代迁移 · 江户木版", en:"Era Shift: Edo Woodblock", kind:"era",
  keep:["color","motif","spirit"],
  inject:{ medium:["ukiyo-e woodblock print on washi"], brush:["keyblock outlines","flat colour planes","visible wood grain"], light:["no cast shadow","even flat illumination"], space:["flattened stacked planes","decorative cropping"], },
  add:["edo period print","bokashi gradient"], neg:["photorealistic skin","chiaroscuro"],
  desc:"把题材改写成江户浮世绘：主版墨线定形，色块平涂，中间调交给云母摺渐变，人物不再投影。",
  note:"一旦画面里出现真实投影与空气透视，浮世绘的“平面装饰感”立刻散掉。" },

{ id:"OP-E-04", status:"tested",  zh:"时代迁移 · 宋元山水", en:"Era Shift: Song-Yuan Landscape", kind:"era",
  keep:["brush","motif","spirit"],
  inject:{ medium:["ink and light washes on silk"], color:["near-monochrome ink tonalities","warm silk ground"], light:["mist separated distance","no single light source"], space:["three-distance composition","vast white voids","walking-path viewpoint"] },
  add:["classical chinese landscape","colophon inscriptions"], neg:["linear perspective","western horizon line"],
  desc:"把任何题材放进宋元山水的时空：得意忘象的散点移动视点，墨分五色，留白即是云水。",
  note:"加了焦点透视或地平线就变成风景油画，国画的那口气断在第一刀。" },

{ id:"OP-E-05", status:"tested",  zh:"时代迁移 · 世纪末颓美", en:"Era Shift: Fin de Siecle", kind:"era",
  keep:["brush","color","spirit"],
  inject:{ medium:["oil on canvas with gold ground"], light:["sickly twilight","candle-lit interior gloom"], space:["ornamental framing","elongated format"] },
  add:["symbolist ornament","decadent aesthetic","art nouveau whiplash curve"], neg:["cheerful daylight","clinical sterility"],
  desc:"十九世纪末的象征主义空气：烛光与暮色、金底与涡卷装饰、拉长的画幅，所有东西都在倦怠里。",
  note:"这类画面怕“干净的白天”，一旦打亮就变成普通装饰画。" },

{ id:"OP-E-06", status:"tested",  zh:"时代迁移 · 月份牌擦笔", en:"Era Shift: Republic-era Calendar Poster", kind:"era",
  keep:["color","motif","spirit"],
  inject:{ medium:["rubbed charcoal-retouched gouache on board"], brush:["airbrush-soft charcoal rubbing","measured watercolour wash"], light:["soft even studio halo"], space:["advertising poster layout","product framing"] },
  add:["old shanghai calendar poster","lithographic print texture"], neg:["harsh contrast","heavy impasto"],
  desc:"民国月份牌的擦笔水彩：炭精粉擦出体积，水彩薄薄罩上去，再加一层石印网点与排版留白。",
  note:"这套语言建立在“薄”之上，一旦叠厚涂就立刻失真。" },

{ id:"OP-E-07", status:"tested",  zh:"时代迁移 · 蒸汽未来考古", en:"Era Shift: Retro-Futurism", kind:"era",
  keep:["brush","color","spirit"],
  inject:{ medium:["engraved steel plate illustration"], light:["gaslight and furnace glow"], space:["heroic engineering scale","cross-section view"] },
  add:["nineteenth century vision of the future","jules verne engraving"], neg:["led panel","carbon fibre texture"],
  desc:"让十九世纪的人去想象未来：蒸汽机械、巨大工程剖面、铜版排线的黑白插图。",
  note:"现代材料词（发光屏、碳纤、注塑）一进来，年代幻觉就破了。" }
);

/* ---------- 二、媒介迁移：把已经成形的画面重铸成另一种物质 ---------- */
OPERATORS.push(
{ id:"OP-M-01", status:"tested",  zh:"媒介迁移 · 湿壁画", en:"Medium Shift: Fresco", kind:"medium",
  inject:{ medium:["buon fresco on lime plaster"], brush:["pigment absorbed into wet plaster","giornata seam"], light:["diffuse daylight","no dark underpainting"] },
  add:["salt efflorescence","plaster loss","architectural wall integration"], neg:["canvas weave","brush hair marks"],
  desc:"颜料溶进湿灰泥里，颜色是被石灰“养”出来的哑光粉质；接缝、盐霜与剥落是它的签名。",
  note:"画布纹理和笔毛痕要进负面词，否则模型会把壁画画成画在布上的油画。" },

{ id:"OP-M-02", status:"tested",  zh:"媒介迁移 · 坦培拉蛋彩", en:"Medium Shift: Egg Tempera", kind:"medium",
  inject:{ medium:["egg tempera on gessoed panel"], brush:["fine cross-hatched strokes","translucent layered glazes"], light:["no deep shadow","even luminous matte"] },
  add:["gold ground","punched halo"], neg:["impasto ridges","wet blending"],
  desc:"蛋黄调矿物色，一层层细密排线叠出半透明的光，干燥后是均匀的哑光，没有油画的润。",
  note:"蛋彩永远厚不起来，画面里出现厚涂凸起就是错的。" },

{ id:"OP-M-03", status:"tested",  zh:"媒介迁移 · 木刻套色", en:"Medium Shift: Woodcut", kind:"medium",
  inject:{ medium:["relief woodcut print"], brush:["gouged chisel marks","hard black positive shape"], color:["two or three spot colours"], light:["black carries the shadow"] },
  add:["misregistered colour block","printing ink bleed"], neg:["soft gradient","photographic texture"],
  desc:"黑色承担全部结构，一至三个专色补形；刀痕、错版与油墨外溢都是语言本身。",
  note:"给渐变和照片质感，木刻会瞬间退化成一张平涂插画。" },

{ id:"OP-M-04", status:"tested",  zh:"媒介迁移 · 杂志水粉插画", en:"Medium Shift: Mid-century Gouache", kind:"medium",
  inject:{ medium:["gouache on illustration board"], brush:["flat opaque shapes","dry brush drag"], light:["designed three-value system"] },
  add:["nineteen fifties magazine illustration","poster simplification"], neg:["airbrush smooth skin","rendered detail"],
  desc:"二十世纪中叶的商业插画：三到四个明度层级撑全图，形状优先于细节，干笔拖痕负责质感。",
  note:"这类需要“设计感”，细节渲染越多越掉价。" },

{ id:"OP-M-05", status:"tested",  zh:"媒介迁移 · 丝网版画", en:"Medium Shift: Silkscreen", kind:"medium",
  inject:{ medium:["screen print on paper"], color:["flat spot ink","halftone dot pattern"], brush:["hard squeegee edge"] },
  add:["misprint offset","cmyk separation"], neg:["soft optical blending"],
  desc:"专色叠印、半调网点、硬边刮痕，可以把照片感的东西一次性打平成波普。",
  note:"不要修补错版，偏移是它的表情。" },

{ id:"OP-M-06", status:"tested",  zh:"媒介迁移 · 铜版蚀刻", en:"Medium Shift: Etching & Aquatint", kind:"medium",
  inject:{ medium:["copper plate etching with aquatint"], brush:["bitten line","cross-hatched tonal net"], light:["hatching density builds darkness"] },
  add:["plate impression edge","laid paper texture"], neg:["colour","smooth gradient"],
  desc:"一切明度都由排线密度换算：蚀线勾形，飞尘铺调，纸张压痕框住画面。",
  note:"有色或渐变会立刻让它失去版画的换算逻辑。" },

{ id:"OP-M-07", status:"tested",  zh:"媒介迁移 · 大画幅摄影", en:"Medium Shift: Large Format Photo", kind:"medium",
  inject:{ medium:["large format silver gelatin print"], brush:["grain with no visible stroke"], light:["single soft key light","shallow depth of field"] },
  add:["optical lens rendering","analog grain"], neg:["visible brushstroke","painterly texture"],
  desc:"把绘画重铸成一张真的照片：银盐颗粒替代笔触，景深替代虚实，光源变成唯一的柔光灯。",
  note:"残留任何笔触都会让画面卡在“油画伪装照片 ”的尴尬处。" },

{ id:"OP-M-08", status:"tested",  zh:"媒介迁移 · 矿物岩彩", en:"Medium Shift: Mineral Pigment", kind:"medium",
  inject:{ medium:["ground mineral pigment with animal glue"], brush:["granular settling","layered sanding"], color:["natural stone hues","shell white underpainting"], light:["matte scattered reflection"] },
  add:["gold leaf","mineral granularity"], neg:["synthetic fluorescent hue"],
  desc:"天然矿物磨成的粗颗粒在胶里沉降，罩染后打磨出半哑光的宝石感；金箔与蛤粉负责最后那口亮。",
  note:"荧光色一进来，整套矿物色阶就崩了。" },

{ id:"OP-M-09", status:"tested",  zh:"媒介迁移 · 数字绘景", en:"Medium Shift: Digital Matte", kind:"medium",
  inject:{ medium:["digital matte painting"], brush:["photobashed texture layering","soft digital round brush"], light:["volumetric atmospheric haze"] },
  add:["concept art pipeline","8k value study"], neg:["canvas weave","paint cracking"],
  desc:"用照片拼贴加数字笔刷搭出来的概念图：大气透视浓，边缘半实半虚，表面不脏。",
  note:"把油画布纹和龟裂加进去会让数字图层逻辑自相矛盾。" },

{ id:"OP-M-10", status:"tested",  zh:"媒介迁移 · 拼贴混合媒介", en:"Medium Shift: Collage", kind:"medium",
  inject:{ medium:["cut paper and mixed media collage"], brush:["torn edge","misaligned pasted fragments"], space:["overlapping disconnected fragments"] },
  add:["found ephemera","visible adhesive"], neg:["seamless blending"],
  desc:"撕边、粘贴错位、材质互不相让：杂乱本身就是这一层的信息。",
  note:"一旦要求“融合自然”，拼贴就白做了。" }
);

/* ---------- 三、题材迁移：把已定的风格压到一个具体题材上 ---------- */
OPERATORS.push(
{ id:"OP-S-01", status:"tested",  zh:"题材迁移 · 推向崇高风景", en:"Subject Shift: Sublime Landscape", kind:"subject",
  inject:{ motif:["towering cliffs and distant horizon","tiny human figure for scale"], light:["awe-filled sky gradient"], space:["vast scale contrast"] },
  add:["panoramic aspect ratio"], neg:["close crop"],
  desc:"把大师的手压到自然崇高上：巨物与小人的体量比决定一切，画幅跟着变长。",
  note:"小人的比例越小越震撼，画大了就回到普通风景。" },

{ id:"OP-S-02", status:"tested",  zh:"题材迁移 · 推向静物", en:"Subject Shift: Still Life", kind:"subject",
  inject:{ motif:["arranged objects on a draped table"], light:["single directional light","measured cast shadow"], space:["tight tabletop framing"] },
  add:["arranged still life","vanitas objects"], neg:["crowded scene"],
  desc:"最考验材质的题材：把风格压缩到一张桌布、几个容器、一道投影上。",
  note:"静物最忌元素过多，三到五件最好看。" },

{ id:"OP-S-03", status:"tested",  zh:"题材迁移 · 推向城市夜景", en:"Subject Shift: Neon City", kind:"subject",
  inject:{ motif:["wet city street at night","neon sign reflections"], light:["multiple coloured light sources","reflection in rain"], space:["deep street perspective"] },
  add:["night cityscape"], neg:["flat daylight"],
  desc:"多光源加湿地面：霓虹把颜料的颜色逻辑打乱重建，反射承担一半的画面。",
  note:"多光源场景下光源方向词要谨慎，容易互相打架。" },

{ id:"OP-S-04", status:"tested",  zh:"题材迁移 · 推向太空奇观", en:"Subject Shift: Cosmic Scale", kind:"subject",
  inject:{ motif:["orbital planets and nebula field"], light:["star light with no atmospheric falloff"], space:["specks floating in black void"] },
  add:["space art scale","wide aspect"], neg:["grounded horizon"],
  desc:"没有地面透视、没有空气透视，只剩悬浮物的大小对比，最适合夸张笔法的流派。",
  note:"保留地平线会立刻把宇宙降格成一张夜景。" },

{ id:"OP-S-05", status:"tested",  zh:"题材迁移 · 推向祭坛神话", en:"Subject Shift: Altarpiece Myth", kind:"subject",
  inject:{ motif:["multi figure ritual scene","drapery and symbolic attribute"], light:["front-raised sacred light"], space:["hierarchical figure scale","architectural niche"] },
  add:["altarpieceFormat","gold ground"], neg:["casual snapshot angle"],
  desc:"人物按地位放大、动作示意化、道具带象征义，整套服从仪式秩序。",
  note:"随手抓拍的机位是这组的第一杀手。" },

{ id:"OP-S-06", status:"tested",  zh:"题材迁移 · 推向封面构图", en:"Subject Shift: Cover Layout", kind:"subject",
  inject:{ space:["strong central motif with breathing room","space for title"], light:["contrast readable at thumbnail size"] },
  add:["poster layout","readable silhouette"], neg:["busy background clutter"],
  desc:"为标题留出位置的版面思维：缩小到指甲盖还能读得出来才算过关。",
  note:"背景一乱，缩略图就糊成一团灰。" },

{ id:"OP-S-07", status:"tested",  zh:"题材迁移 · 推向群像仪式", en:"Subject Shift: Ceremonial Group", kind:"subject",
  inject:{ motif:["many figures in arranged formation"], space:["rhythmic repetition of heads and hands"], light:["even light across the group"] },
  add:["group portrait rhythm"], neg:["single hero focus"],
  desc:"多人的排布是节奏学：头、手、道具重复形成拍子，而不是各画各的。",
  note:"把注意力全给一个人，群像就散了。" },

{ id:"OP-S-08", status:"tested",  zh:"题材迁移 · 推向东方市集", en:"Subject Shift: Bazaar & Medina", kind:"subject",
  inject:{ motif:["arched arcade and hanging textiles","spice piles and copper vessels"], light:["filtered light through lattice","dust beam"], space:["layered arch depth"] },
  add:["orientalist architecture","intricate tile pattern"], neg:["european square"],
  desc:"拱券层层套深、格子窗过滤光线、堆放的货物制造纹理密度。",
  note:"把欧洲广场的建筑逻辑套上去会立刻穿帮。" }
);

/* ---------- 四、解构取值：把大师当零件库用 ---------- */
OPERATORS.push(
{ id:"OP-D-01", status:"tested",  zh:"解构 · 只取色彩关系", en:"Decouple: Palette Only", kind:"decouple",
  only:["color"],
  desc:"只借用这个人的配色逻辑：色相如何相邻、纯度如何收敛，其余全部自由。",
  note:"解构后要补一个自己的媒介词，否则模型会用默认油画来填。" },

{ id:"OP-D-02", status:"tested",  zh:"解构 · 只取笔法肌理", en:"Decouple: Brushwork Only", kind:"decouple",
  only:["brush"],
  desc:"只借用笔触的形态与走向：是旋、是皴、是排线，还是刮刀。",
  note:"笔法单独用时记得指定画面基调，否则会在空气里乱长。" },

{ id:"OP-D-03", status:"tested",  zh:"解构 · 只取构图空间", en:"Decouple: Composition Only", kind:"decouple",
  only:["space"],
  desc:"只借摆放关系：透视怎么走、留白怎么留、视线怎么引。",
  note:"构图算子最好配合一个具体题材使用，单独看没有画面。" },

{ id:"OP-D-04", status:"tested",  zh:"解构 · 只取光", en:"Decouple: Light Only", kind:"decouple",
  only:["light"],
  desc:"只借处理明暗的方式：是窗光、烛火、还是无影平光。",
  note:"取光时记得同时给一个场景，光要落在东西上才成立。" },

{ id:"OP-D-05", status:"tested",  zh:"解构 · 只取气质", en:"Decouple: Spirit Only", kind:"decouple",
  only:["spirit","motif"],
  desc:"只借那口气：孤独、狂喜、肃穆、倦怠，以及惯用的母题。",
  note:"气质是无形的，必须落到具体的题材上才出画面。" }
);

/* ---------- 五、融合：两位及以上同台时的权重策略 ---------- */
OPERATORS.push(
{ id:"OP-F-01", status:"tested",  zh:"融合 · 主次七三", en:"Fuse: 70 / 30 Dominance", kind:"fuse",
  desc:"七三开：主导方提供媒介、笔法、空间，从属方只渗透色彩与气质。",
  note:"这是最稳的融合比，八成以上的双画家组合都该从七三试起。" },

{ id:"OP-F-02", status:"tested",  zh:"融合 · 对等碰撞", en:"Fuse: Even Collision", kind:"fuse",
  desc:"各半：两套笔法在同一画面拉锯，冲突明显但张力最大。",
  note:"对等碰撞容易糊，建议先把媒介统一，只让笔法与色彩互撞。" },

{ id:"OP-F-03", status:"tested",  zh:"融合 · 分层渗透", en:"Fuse: Layered Seepage", kind:"fuse",
  desc:"甲方管色彩与光，乙方管媒介与笔法，空间居中调停，各自不许跨界。",
  note:"这是同时调用两位以上大师时最好用的一种，能保住两边的辨识度。" }
);

/* ---------- 六、呈现：画面之外的一层，决定你看到的是「画」还是「物」 ---------- */
OPERATORS.push(
{ id:"OP-P-01", status:"tested",  zh:"呈现 · 博物馆射灯", en:"Present: Museum Lighting", kind:"present",
  add:["gallery wall context","museum spotlight","neutral grey surround"], neg:["outdoor ground"],
  desc:"把画面当作一件实物挂在展厅里：射灯打下来，周围是中性灰墙与投影边缘。",
  note:"这是“展示画作”而不是“进入画作”，两者别混用。" },

{ id:"OP-P-02", status:"tested",  zh:"呈现 · 未修复扫瞄", en:"Present: unrestored scan", kind:"present",
  add:["craquelure","yellowed varnish","dust accumulation","unrestored museum scan"], neg:["pristine digital surface"],
  desc:"龟裂、泛黄清漆、积尘与未修复的老化状态，适合一切年代题材。",
  note:"用了这套就别再混入高清锐利类的画质词，两者会互相撕。" },

{ id:"OP-P-03", status:"tested",  zh:"呈现 · 巨幅壁画现场", en:"Present: Monumental Mural", kind:"present",
  add:["wall-filling scale","scaffold perspective","public architecture integration"], neg:["small framed canvas"],
  desc:"让画面回到建筑本身：占满整面墙，观众站在脚手架的透视里抬头看。",
  note:"巨幅必须给够仰视角，否则看不出尺度。" },

{ id:"OP-P-04", status:"tested",  zh:"呈现 · 笔触微距", en:"Present: Macro Surface", kind:"present",
  add:["extreme close-up of paint surface","raking light across texture"], neg:["wide view"],
  desc:"只给颜料的表面：厚度、边缘、刮痕在斜光下的起伏。",
  note:"微距要配盛行光，平光打不出肌理。" },

{ id:"OP-P-05", status:"tested",  zh:"呈现 · 未完成稿", en:"Present: Unfinished Study", kind:"present",
  add:["abbozzo underdrawing visible","unfinished canvas edge","loose blocking-in"], neg:["polished finish"],
  desc:"停在中途：起稿线露出、局部只铺了大关系、画布边是空的。",
  note:"“未完成”比“完成”更难画，别让它变成“画得差”。" }
);

/* ============================================================
 * 冲突矩阵：哪些东西本质上不能同时画出来
 *
 * 四级判定（从强到弱）：
 *   hard        明确矛盾 —— 同一诉求下无法同时成立，必须由使用者选择
 *                引擎自动静音低权重一方在 scope 波及的面
 *   regional    局部并存 —— 整体上冲突，但可以分配到画面不同区域共存
 *                引擎给出分区建议，由使用者在节点工作流里用遮罩落实
 *   soft        可共存   —— 只是张力，不互斥，提示即可
 *   experimental 实验性 —— 允许组合但尚未在模型上验证过
 *                输出时必须带未验证标注，不得当成已验证配方
 *
 * scope: 冲突波及哪些面（见 data-core.js 的 FACET_GROUPS）
 * region: 仅 regional 级使用，说明两块区域怎么划
 * ============================================================ */
CONFLICTS.push(
/* ---------- 明确矛盾：必须选一套 ---------- */
{ id:"CF-01", zh:"墨性渗透 对 油彩厚涂", status:"reviewed",  a:"ink-aqueous", b:"oil-impasto", level:"hard", scope:["medium","brush"],
  msg:"水性墨的渗透与油画厚涂的堆叠是互斥的物质逻辑",
  fix:"保留高权重一方的底材与肌理，另一方降级为只提供构图与色彩关系" },

{ id:"CF-02", zh:"平涂装饰 对 明暗塑形", status:"reviewed",  a:"flat-decoration", b:"chiaroscuro-volume", level:"hard", scope:["light"],
  msg:"装饰平涂要求无影均衡，明暗塑造却依赖投影与明暗交界线",
  fix:"二选一：要么接受平面，要么接受体积，不要同时要求" },

{ id:"CF-03", zh:"照片质感 对 可见笔触", status:"reviewed",  a:"photographic", b:"painterly-stroke", level:"hard", scope:["medium","brush"],
  msg:"照片语言要求无笔触，绘画语言要求笔触可见",
  fix:"弱的一方让位：谁权重低，谁就被另一方吃掉，别指望两者同时成立" },

{ id:"CF-04", zh:"数字净面 对 做旧痕迹", status:"reviewed",  a:"digital-clean", b:"aged-decay", level:"hard", scope:["medium","brush"],
  msg:"数字图层自带的干净表面与做旧材质的龟裂积尘相斥",
  fix:"做旧优先时放弃数字质感，反之放弃老化效果" },

{ id:"CF-05", zh:"线性透视 对 平面透视", status:"reviewed",  a:"perspective-linear", b:"perspective-flat", level:"hard", scope:["space"],
  msg:"焦点透视与散点平面透视无法共存于同一空间判断",
  fix:"选定一种：要么严格透视线，要么层层平铺，中间地带最糊" },

{ id:"CF-07", zh:"以线立骨 对 无线造型", status:"reviewed",  a:"line-primary", b:"no-outline", level:"hard", scope:["brush"],
  msg:"以线立骨与无线造型是两套相反的起手式",
  fix:"要么轮廓线明确承担结构，要么用块面与色彩交界承担" },

{ id:"CF-11", zh:"立体堆塑 对 平版印刷", status:"reviewed",  a:"embossed-relief", b:"flat-print", level:"hard", scope:["medium"],
  msg:"立体堆塑和平版印刷一个是物质厚度一个是绝对平面",
  fix:"选定一种承载形态" },

{ id:"CF-13", zh:"繁密装饰 对 极简留白", status:"reviewed",  a:"hyper-ornament", b:"minimal-empty", level:"hard", scope:["space","brush"],
  msg:"繁密装饰与极简留白是相反的画面密度策略",
  fix:"决定画面密度之后再谈别的" },

/* ---------- 局部并存：分区即可，不必二选一 ---------- */
{ id:"CF-06", zh:"灰调低纯度 对 高饱和对冲", status:"reviewed",  a:"muted-grey", b:"saturated-clash", level:"regional", scope:["color"],
  region:{ aSide:"主体与大面积", bSide:"小面积点缀", seam:"靠中性色过渡带隔开" },
  msg:"低纯度灰调与高饱和对冲无法同时最大化，但可以分区共存",
  fix:"主体铺灰调，只留小面积高饱和做跳色；两区之间用中性色过渡，否则会脏" },

{ id:"CF-08", zh:"精微描摹 对 阔笔写意", status:"reviewed",  a:"tiny-detail", b:"broad-gesture", level:"regional", scope:["brush"],
  region:{ aSide:"主体与近景", bSide:"背景与远景", seam:"在中景交界处让笔触逐步变粗" },
  msg:"精微描摹与阔笔写意对笔触速度的要求相反，但可以按景别分配",
  fix:"主体精微、背景阔笔；关键是让笔触粗细在交界处连续过渡，否则像拼贴" },

{ id:"CF-09", zh:"金底无空间 对 自然日光", status:"reviewed",  a:"gold-ground", b:"natural-daylight", level:"regional", scope:["light"],
  region:{ aSide:"主体所在平面", bSide:"环境与远景", seam:"用一条硬边把两个光系统切开" },
  msg:"金底的无空间光与自然日光处于两套光逻辑，但可以各占一块",
  fix:"金底只给主体，环境另给日光；两块之间要有一条明确边界，不要渐变过去" },

{ id:"CF-10", zh:"水墨单色 对 全彩", status:"reviewed",  a:"monochrome-ink", b:"polychrome-full", level:"regional", scope:["color"],
  region:{ aSide:"主画面", bSide:"局部设色区", seam:"设色面积控制在两成以内" },
  msg:"水墨单色体系与全彩体系难以同时占满画面，但可以主辅分配",
  fix:"一方主导，另一方让步至局部设色（如小青绿、浅绛），设色面积不要超过两成" },

{ id:"CF-12", zh:"商业版面 对 绘画纵深", status:"reviewed",  a:"commercial-poster", b:"fine-art-depth", level:"regional", scope:["space"],
  region:{ aSide:"版面主体区", bSide:"边缘与背景区", seam:"在版面区边界收掉纵深" },
  msg:"版面的信息层级与绘画的纵深营造互相打架，但可以分区",
  fix:"海报主体区压掉纵深保证信息可读，边缘区保留纵深撑住空间感" },

{ id:"CF-14", zh:"湿接过渡 对 硬边切断", status:"reviewed",  a:"wet-blending", b:"hard-edge", level:"regional", scope:["brush"],
  region:{ aSide:"形体内部过渡", bSide:"结构轮廓", seam:"轮廓线本身作为分界" },
  msg:"湿接的柔和过渡与硬边切断不能同时主导，但可以分工",
  fix:"让硬边负责结构轮廓，软过渡负责内部过渡；轮廓线本身天然就是那条缝" },

/* ---------- 可共存：只是张力 ---------- */
{ id:"CF-15", zh:"极特写 对 厚重笔触", status:"reviewed",  a:"tiny-detail", b:"cropped-depth", level:"soft", scope:["space"],
  msg:"极近特写与厚重笔触可以同框，但细节密度与精度要求会互相挤占",
  fix:"特写时把笔触简化，否则模型会同时给足细节与厚涂，结果两边都不到位" },

{ id:"CF-16", zh:"金底 对 水墨单色", status:"reviewed",  a:"gold-ground", b:"monochrome-ink", level:"soft", scope:["medium","color"],
  msg:"金底与水墨单色是不同年代的组合，历史上不常见但技术上不矛盾",
  fix:"想成立就要给出合理性，例如后世摹本或装饰性壁画的再创作" },

{ id:"CF-17", zh:"商业版面 对 做旧痕迹", status:"reviewed",  a:"commercial-poster", b:"aged-decay", level:"soft", scope:["medium"],
  msg:"商业印刷版面与做旧痕迹的组合需要交代它为什么旧",
  fix:"补一句年代与流通史，否则会像脏而不是旧" },

/* ---------- 实验性：允许，但必须标注未验证 ---------- */
{ id:"CF-18", zh:"照片 对 水墨", status:"written",  a:"photographic", b:"ink-aqueous", level:"experimental", scope:["medium","brush"],
  msg:"水墨与照片质感同框是实验性组合，本库尚未在任何模型上稳定复现",
  fix:"若要尝试：用遮罩分区，水墨只作用于主体区域、照片质感只作用于背景；不要指望单段提示词同时成立" },

{ id:"CF-19", zh:"极繁装饰 对 数字净面", status:"written",  a:"digital-clean", b:"hyper-ornament", level:"experimental", scope:["brush"],
  msg:"极繁装饰与数字净面同框，模型容易把繁密画成噪点",
  fix:"若要尝试：把装饰密度降到三成以下，并明确写装饰为有结构的纹样而非随机堆叠" },

{ id:"CF-20", zh:"堆塑厚度 对 空气透视", status:"written",  a:"embossed-relief", b:"atmospheric-distance", level:"experimental", scope:["space"],
  msg:"堆塑厚度与空气透视衰减同框会互相削弱，已知效果不稳定",
  fix:"若要尝试：只保留近景堆塑，远景放弃空气透视，改用明度递减" },

{ id:"CF-21", zh:"无线造型 对 极精细节", status:"written",  a:"no-outline", b:"tiny-detail", level:"experimental", scope:["brush"],
  msg:"无线造型与极精细节同框，模型常退回自动描边",
  fix:"若要尝试：把细节放在色块交界处而不是轮廓处，并显式写不要轮廓线" }
);

if (typeof module !== "undefined" && module.exports) {
  module.exports = { OPERATORS, CONFLICTS };
}
