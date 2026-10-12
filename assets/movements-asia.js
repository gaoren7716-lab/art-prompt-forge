/* ============================================================
 * data-movements-asia.js —— 流派与运动（朝鲜 · 波斯 · 印度 · 东南亚 · 藏地）
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var MOVEMENTS = require("./data-core.js").MOVEMENTS;

MOVEMENTS.push(
{ id:"M-53", status:"written",  zh:"狩野派", en:"Kano School", era:"十五至十九世纪", region:"日本",
  F:{ medium:["ink and gold on sliding door panels"], brush:["bold structural contour","large scale ink wash"], color:["gold ground and mineral green"], light:["no single source"], space:["wall-filling gorgeous depth"], motif:["pine and crane screen","tiger in landscape"], spirit:["feudal authority","decorative monumentality"] },
  sty:["kano school","shohekiga"], tags:["gold-ground","line-primary","hyper-ornament","perspective-flat"],
  desc:"画在城郭与寺院的大屏风上：金云浮起空间，松鹤占满整面墙。",
  note:"这是建筑的一部分，裁成方形小图就失去它的野心。" },

{ id:"M-54", status:"written",  zh:"琳派", en:"Rimpa School", era:"十七至十九世纪", region:"日本",
  F:{ medium:["ink and mineral colour on gold paper"], brush:["flat boneless silhouette","tarashikomi pooling"], color:["indigo against gold ground"], light:["no shadow"], space:["flat repeated pattern field"], motif:["iris screen","red and white plum","flowing water curve"], spirit:["decorative intelligence","elegant understatement"] },
  sty:["rimpa","ogata korin style"], tags:["flat-decoration","gold-ground","minimal-empty","perspective-flat"],
  desc:"设计感最强的日本传统：形体被压成剪影，曲线反复复沓，形成节拍般的装饰。",
  note:"绝对平面是铁律：一加体积和投影就完全不是琳派了。" },

{ id:"M-55", status:"written",  zh:"日本南画", en:"Nanga & Bunjinga", era:"十八至十九世纪", region:"日本",
  F:{ medium:["ink and light colour on paper"], brush:["calligraphic literati stroke","individualist shorthand"], color:["ink monochrome with restrained tint"], light:["shadow ignored entirely"], space:["sparse scholarly void"], motif:["mountain retreat","chrysanthemum fence"], spirit:["amateur ideal","recluse bravado"] },
  sty:["nanga","bunjinga"], tags:["monochrome-ink","line-primary","minimal-empty","perspective-flat"],
  desc:"日本人对中国文人画的追慕：用笔必须有书法味，题材必须是隐逸。",
  note:"“业余”是刻意的姿态，过于专业就会失去那份松弛。" },

{ id:"M-56", status:"written",  zh:"写生折衷派", en:"Maruyama-Shijo School", era:"十八至十九世纪", region:"日本",
  F:{ medium:["ink and light colour on silk"], brush:["observed sketch line","minimal calligraphic economy"], color:["restrained naturalistic hue"], light:["soft directional observation"], space:["partial western recession"], motif:["fish and shell study","seasonal plant sketch"], spirit:["empirical curiosity","quiet accuracy"] },
  sty:["maruyama shijo school","shasei"], tags:["line-primary","fine-art-depth","tiny-detail","wet-blending"],
  desc:"把写生引进日本绘画：先对实物画稿，再把它变成画面。",
  note:"准确度是它的美学，太夸张的变形会偏离这条线。" },

{ id:"M-57", status:"written",  zh:"日本画", en:"Nihonga", era:"十九世纪末至今", region:"日本",
  F:{ medium:["mineral pigment and glue on silk"], brush:["no visible brushstroke","layered tablet ground"], color:["soft luminous mineral tone","silver and gold accent"], light:["almost no cast shadow"], space:["flattened atmospheric depth"], motif:["seasonal flower","veiled female figure"], spirit:["modern national style","quiet refinement"] },
  sty:["nihonga"], tags:["polychrome-full","flat-decoration","fine-art-depth","gold-ground"],
  desc:"国民国家时代的日本绘画：矿物颜料加一点点西方空气感，笔痕被彻底抹掉。",
  note:"表面不能有笔触，任何看得见的笔触都违反这条规矩。" },

{ id:"M-58", status:"written",  zh:"朝鲜真景与民画", en:"Korean True-View & Folk Painting", era:"十七至十九世纪", region:"朝鲜",
  F:{ medium:["ink and light colour on paper"], brush:["texture-rich rock strokes","folk flat naivety"], color:["ochre and muted mineral"], light:["even unmodelled light"], space:["actual place viewpoint","folk symmetry"], motif:["diamond mountains","tiger and magpie"], spirit:["love of specific place","commoner humour"] },
  sty:["jingyeong sansu","minhwa"], tags:["line-primary","flat-decoration","polychrome-full","perspective-flat"],
  desc:"一边是实地画下来的真山真水，一边是画在纸门上的老虎与喜鹊。",
  note:"民画的幽默来自夸张比例，不要修正它。" },

{ id:"M-59", status:"written",  zh:"波斯细密画", en:"Persian Miniature", era:"十三至十七世纪", region:"波斯",
  F:{ medium:["opaque watercolour and gold on paper","burnished surface"], brush:["hair-fine detail","flat unmodelled colour"], color:["lapis and gold dominance","rose and verdigris"], light:["no shadow at all"], space:["multiple viewpoint stacking","simultaneous interior-exterior"], motif:["garden carpet scene","legendary hunt","calligraphy frame"], spirit:["poetic idealisation","court refinement"] },
  sty:["persian miniature","safavid painting"], tags:["tiny-detail","gold-ground","flat-decoration","perspective-flat","hyper-ornament"],
  desc:"在一张手掌大的纸上同时看见花园、宫殿与打猎：鸟儿视角惯性与现实并存。",
  note:"这套语言拒绝投影与透视，加上去就是失败。" },

{ id:"M-60", status:"written",  zh:"莫卧儿细密画", en:"Mughal Miniature", era:"十六至十八世纪", region:"印度",
  F:{ medium:["opaque watercolour with gold on paper"], brush:["observed portrait naturalism","minute textile rendering"], color:["warm indian palette","lapis and gold"], light:["subtle modelling rare"], space:["deep receding court perspective"], motif:["emperor portrait","dynastic court scene","animal study"], spirit:["dynastic self-documentation","cosmopolitan empire"] },
  sty:["mughal painting","mughal miniature"], tags:["tiny-detail","fine-art-depth","gold-ground","polychrome-full"],
  desc:"比波斯多了一点欧洲的体积与心理：皇帝要能被认出来，织锦要能数出线。",
  note:"肖像的个性是这一层的核心，别画成通用面孔。" },

{ id:"M-61", status:"written",  zh:"奥斯曼插图", en:"Ottoman & Islamic Manuscript Art", era:"十四至十八世纪", region:"土耳其·阿拉伯",
  F:{ medium:["opaque watercolour and gold on polished paper"], brush:["flat precise contour","pattern billowing"], color:["deep red and lapis","gold illumination"], light:["none"], space:["stacked narrative registers"], motif:["sultan procession","calligraphy panel","city plan"], spirit:["imperial recording","geometric devotion"] },
  sty:["ottoman miniature","islamic manuscript"], tags:["flat-decoration","hyper-ornament","gold-ground","perspective-flat"],
  desc:"书法、几何纹与叙事插图共处：尺度可以很小，工具要极讲究。",
  note:"几何的准确性是信仰的一部分，图案不能随手变形。" },

{ id:"M-62", status:"written",  zh:"孟加拉复兴", en:"Bengal Renaissance Painting", era:"二十世纪初", region:"印度",
  F:{ medium:["watercolour on paper","Japanese wash influence"], brush:["sweeping linear grace","airy thin wash"], color:["earth ochre and muted rose"], light:["soft symbolic glow"], space:["flattened stage-like space"], motif:["woman with lamp","mythic female figure"], spirit:["national revival","anti-colonial swadeshi"] },
  sty:["bengal school of art"], tags:["line-primary","wet-blending","muted-grey","flat-decoration"],
  desc:"用日本画的洗练与美国式的柔焦，画出印度自己的现代想象。",
  note:"线的柔美与薄洗掏出来的气氛是它的标志，松弛不等于软弱。" },

{ id:"M-63", status:"written",  zh:"东南亚传统壁画", en:"Southeast Asian Traditional Painting", era:"十四至二十世纪", region:"泰国·爪哇·巴厘",
  F:{ medium:["tempera on wall","palm leaf manuscript"], brush:["strong outline and flat local colour","gold stencil"], color:["primary red gold and jade"], light:["none"], space:["stacked narrative bands"], motif:["jataka tale","wayang puppet figure","temple guardian"], spirit:["communal teaching","craft lineage"] },
  sty:["thai mural painting","balinese painting","wayang style"], tags:["flat-decoration","line-primary","hyper-ornament","gold-ground","perspective-flat"],
  desc:"故事是一层层横带读过去的：护法像与皮影人物的侧影来自同一个形体库。",
  note:"叙事连续性与道具的准确性优先，不要引入单点透视。" },

{ id:"M-64", status:"written",  zh:"藏传唐卡", en:"Tibetan Thangka", era:"十一世纪至今", region:"西藏",
  F:{ medium:["mineral pigment on cotton with silk mount"], brush:["measured iconometric grid","outlined flat colour"], color:["deep lapis and cinnabar","gold thread"], light:["radiating halo not cast shadow"], space:["symmetrical mandala order"], motif:["wrathful protector","mandala palace","lineage tree"], spirit:["iconographic precision","devotional clarity"] },
  sty:["thangka painting","tibetan buddhist art"], tags:["flat-decoration","gold-ground","hyper-ornament","polychrome-full","perspective-flat"],
  desc:"比例必须合造像度量经：神的位置、手势、持物都有规矩，绘画是修的一部分。",
  note:"构图对称而严谨，随意发挥会让它失去宗教效力。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { MOVEMENTS };
