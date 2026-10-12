/* ============================================================
 * data-painters-jp.js —— 日本 · 朝鲜
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-JP01", status:"written",  zh:"雪舟", en:"Sesshu Toyo", life:"1420-1506", mv:"室町水墨", mvId:"M-55", region:"日本",
  F:{ medium:["ink on paper and silk"], brush:["angular decisive stroke","broken dry slash"], color:["ink monochrome"], light:["mist band after rain"], space:["sharp diagonal recession"], motif:["long landscape scroll","wintry harbor"], spirit:["zen-trained severity"] },
  sty:["sesshu toyo","japanese suibokuga"], tags:["monochrome-ink","hard-edge","broad-gesture","minimal-empty"],
  desc:"日本水墨里最能见刀锋的一笔：笔势凌厉，墨色干湿分明。",
  note:"干笔与浓淡的控制必须凌厉，软化的处理不符合他的修养。" },

{ id:"P-JP02", status:"written",  zh:"狩野永德", en:"Kano Eitoku", life:"1543-1590", mv:"狩野派", mvId:"M-53", region:"日本",
  F:{ medium:["gold leaf and mineral colour on folding screens"], brush:["bold ink contour","large sweeping wash"], color:["gold ground with mineral green"], light:["none"], space:["wall-filling monumental scale"], motif:["cypress screen","tiger and dragon"], spirit:["warrior patronage grandeur"] },
  sty:["kano eitoku","shohekiga screens"], tags:["gold-ground","hyper-ornament","broad-gesture","line-primary"],
  desc:"把画画到整个房间那么大的一代：巨大的松树贴在金云之上，看的人是被包围的。",
  note:"金地与留白的对照是重点，把主体缩成小图就失去气势。" },

{ id:"P-JP03", status:"written",  zh:"俵屋宗达", en:"Tawaraya Sotatsu", life:"约1570-1643", mv:"琳派", mvId:"M-54", region:"日本",
  F:{ medium:["ink and mineral colour on gold paper"], brush:["boneless pooled silhouette","wet-in-wet pooling"], color:["indigo against gold"], light:["no shadow"], space:["pattern-like flat field"], motif:["iris screen","wind and thunder gods"], spirit:["decorative invention"] },
  sty:["tawaraya sotatsu","rimpa"], tags:["flat-decoration","gold-ground","ink-aqueous","minimal-empty"],
  desc:"琳派的开山：形体压成剪影，颜色彼此洇开成一片。",
  note:"必须平到底，任何体积塑造都破坏他的设计感。" },

{ id:"P-JP04", status:"written",  zh:"尾形光琳", en:"Ogata Korin", life:"1658-1716", mv:"琳派", mvId:"M-54", region:"日本",
  F:{ medium:["mineral colour on gold and lacquer"], brush:["crisp boneless edge","tailored simple form"], color:["indigo white and gold"], light:["none"], space:["bold asymmetric placement"], motif:["red and white plum trees","irises at yatsuhashi"], spirit:["aristocratic daring"] },
  sty:["ogata korin","rimpa master"], tags:["flat-decoration","gold-ground","hard-edge","minimal-empty"],
  desc:"把宗达的方案推到极致：更少的东西、更准的曲线、更贵气的手感。",
  note:"取舍比技巧重要，多添一枝反而不如少画一株。" },

{ id:"P-JP05", status:"written",  zh:"葛饰北斋", en:"Katsushika Hokusai", life:"1760-1849", mv:"浮世绘", mvId:"M-52", region:"日本",
  F:{ medium:["woodblock print on washi"], brush:["energetic sweeping contour","prussian blue gradient"], color:["prussian blue and vermilion"], light:["no shadow"], space:["radical cropping and oversized foreground"], motif:["great wave","red fuji","daily life sketches"], spirit:["obsessive curiosity","tumultuous vitality"] },
  sty:["katsushika hokusai","ukiyo-e master"], tags:["flat-print","line-primary","flat-decoration","hard-edge"],
  desc:"把一切都画进木版：浪、山、漫画般的速写，晚年自称画狂。",
  note:"重点在轮廓线的运动，浪爪与富士的斜边都要画得有劲。" },

{ id:"P-JP06", status:"written",  zh:"歌川广重", en:"Utagawa Hiroshige", life:"1797-1858", mv:"浮世绘", mvId:"M-52", region:"日本",
  F:{ medium:["woodblock print with fine bokashi"], brush:["delicate mist gradient","softened rain line"], color:["melancholy blue-grey"], light:["weather-driven light"], space:["intimate vertical travel views"], motif:["rain on the bridge","sudden shower","fifty-three stations"], spirit:["travel-weary lyrical mood"] },
  sty:["utagawa hiroshige","famous views picture"], tags:["flat-print","wet-blending","muted-grey","flat-decoration"],
  desc:"把雨、雪、黄昏做成名胜绘：画面很平，气氛却是真的湿。",
  note:"渐晕与雨丝是他的签名，配色太艳就没了那种旅愁。" },

{ id:"P-JP07", status:"written",  zh:"喜多川歌麿", en:"Kitagawa Utamaro", life:"约1753-1806", mv:"浮世绘", mvId:"M-52", region:"日本",
  F:{ medium:["woodblock print with mica ground"], brush:["sensuous contour line","abbreviated drapery"], color:["shimmering mica grey"], light:["no shadow"], space:["close-up bust cropping"], motif:["beauties of the green houses","mother and child"], spirit:["psychological observation"] },
  sty:["kitagawa utamaro","bijin-ga"], tags:["flat-print","line-primary","flat-decoration","muted-grey"],
  desc:"把美人画到半身放大：云母底的微光与极细的神态差别构成全部趣味。",
  note:"云母底的细闪容易丢，画面上要有那一层微尘般的光。" },

{ id:"P-JP08", status:"written",  zh:"东洲斋写乐", en:"Toshusai Sharaku", life:"活动于1794-1795", mv:"浮世绘", mvId:"M-52", region:"日本",
  F:{ medium:["woodblock print with darkened ground"], brush:["caricatural contour","exaggerated mouth and eye"], color:["dark mica-black ground"], light:["none"], space:["aggressive close-up"], motif:["kabuki actor portraits"], spirit:["merciless disclosure"] },
  sty:["toshusai sharaku","actor print"], tags:["flat-print","line-primary","hard-edge","flat-decoration"],
  desc:"十个月画出漫画般的役者绘：故意夸张五官，把演员的表演拆穿给人看。",
  note:"夸张要带着狠劲，脸画得太好看就失去了揭露感。" },

{ id:"P-JP09", status:"written",  zh:"圆山应举", en:"Maruyama Okyo", life:"1733-1795", mv:"写生画", mvId:"M-56", region:"日本",
  F:{ medium:["ink and light colour on silk"], brush:["observed sketch line","light wash texture"], color:["restrained naturalistic"], light:["gentle directional light"], space:["partly western recession with japanese flatness"], motif:["pine and snow","ghost studies"], spirit:["empirical exactness"] },
  sty:["maruyama okyo","shasei realism"], tags:["tiny-detail","fine-art-depth","line-primary","wet-blending"],
  desc:"写生先练进骨子里，画面再安静下来：雪压在枝上的重量是真的。",
  note:"写生的准确度不能被设计感拿走。" },

{ id:"P-JP10", status:"written",  zh:"池大雅", en:"Ike no Taiga", life:"1723-1776", mv:"日本南画", mvId:"M-55", region:"日本",
  F:{ medium:["ink and light colour on paper and screens"], brush:["playful dotted brush loops","carefree long lines"], color:["light mineral tint"], light:["none"], space:["airy open reformulation"], motif:["mountain villagers","literati gatherings"], spirit:["boyish delight","unforced freedom"] },
  sty:["ike no taiga","bunjinga"], tags:["line-primary","flat-decoration","minimal-empty","monochrome-ink"],
  desc:"文人画里最松弛的一个：点来点去就长成一片山村，快乐几乎看得见。",
  note:"那股轻松是从极熟练来的，装出来的随意一眼就看穿。" },

{ id:"P-JP11", status:"written",  zh:"与谢芜村", en:"Yosa Buson", life:"1716-1784", mv:"日本南画", mvId:"M-55", region:"日本",
  F:{ medium:["ink and pale colour on paper"], brush:["poet's calligraphic line","delicate atmospheric wash"], color:["pale poetic tint"], light:["diffused seasonal haze"], space:["quiet lofty distance"], motif:["night snow village","willow and swallow"], spirit:["haiku ellipsis"] },
  sty:["yosa buson","haiku painter"], tags:["monochrome-ink","wet-blending","minimal-empty","line-primary"],
  desc:"俳句与画同源：只给几个词，剩下的让看的人自己补出整个黄昏。",
  note:"诗意靠删减，交代太多的细节会把味道赶走。" },

{ id:"P-JP12", status:"written",  zh:"曾我萧白", en:"Soga Shohaku", life:"1730-1781", mv:"奇想派", mvId:"M-55", region:"日本",
  F:{ medium:["ink on paper and sliding panels"], brush:["wild ink splatter","jagged angular pines"], color:["harsh black ink"], light:["none"], space:["off-balance menacing space"], motif:["cranes and demonic figures","mountain Taoist"], spirit:["deliberate shock and satire"] },
  sty:["soga shohaku","kiso painter"], tags:["broad-gesture","hard-edge","monochrome-ink","minimal-empty"],
  desc:"故意让人不舒服：狂笔、怪巅、不祥的气氛，江户最“难相处”的画家。",
  note:"夸张与粗糙都是武器，画得太文明就没有他的锋利。" },

{ id:"P-JP13", status:"written",  zh:"横山大观", en:"Yokoyama Taikan", life:"1868-1958", mv:"日本画", mvId:"M-57", region:"日本",
  F:{ medium:["mineral pigment on silk"], brush:["mushin colour-based no-outline","diffused atmospheric wash"], color:["soft luminous earth tones"], light:["almost no shadow"], space:["flattened hazy depth"], motif:["mountains in mist","cherry blossom night"], spirit:["national modern dignity"] },
  sty:["yokoyama taikan","nihonga modern"], tags:["polychrome-full","flat-decoration","wet-blending","fine-art-depth"],
  desc:"新日本画的旗手：用矿物颜料和雾一般的空气感画出日本的山。",
  note:"朦胧体要靠无线铺色，别留下看得见的笔触。" },

{ id:"P-JP14", status:"written",  zh:"菱田春草", en:"Hishida Shunso", life:"1874-1911", mv:"日本画", mvId:"M-57", region:"日本",
  F:{ medium:["colour washes on silk without outline"], brush:["no-line flat application","soft soluble edge"], color:["delicate fading tints"], light:["no shadow"], space:["soft indefinite space"], motif:["black cat","fallen leaves"], spirit:["decorative melancholy"] },
  sty:["hishida shunso","morotai style"], tags:["flat-decoration","wet-blending","muted-grey","minimal-empty"],
  desc:"完全去掉轮廓线，只靠颜色的接缝说话：柔、淡、有点孤单。",
  note:"边缘要柔而不糊，颜色边界必须清楚。" },

{ id:"P-JP15", status:"written",  zh:"东山魁夷", en:"Kaii Higashiyama", life:"1908-1999", mv:"日本画", mvId:"M-57", region:"日本",
  F:{ medium:["mineral pigment on paper"], brush:["flat layered mineral colour"], color:["deep blue-green and grey"], light:["even quiet illumination"], space:["symmetric meditative emptiness"], motif:["white horse grove","northern sea cliffs"], spirit:["contemplative stillness"] },
  sty:["kaii higashiyama","modern nihonga"], tags:["flat-decoration","muted-grey","minimal-empty","gold-ground"],
  desc:"风景被反复提纯成可以入定的几何：一匹白马、一片青岚、一道海雾。",
  note:"配色讲究分寸，柔和过度就会失去那份清冷。" },

{ id:"P-JP16", status:"written",  zh:"加山又造", en:"Kayama Matazo", life:"1927-2004", mv:"现代日本画", mvId:"M-57", region:"日本",
  F:{ medium:["mineral pigment with gold and silver"], brush:["delicate line combined with flat mineral"], color:["cobalt and gold interplay"], light:["decorative metallic reflection"], space:["symmetric decorated field"], motif:["cranes in snow","female nude on gold screen"], spirit:["modern decorative refinement"] },
  sty:["kayama matazo","decorative nihonga"], tags:["gold-ground","flat-decoration","hard-edge","polychrome-full"],
  desc:"把琳派的金与西方人体同时接上电：装饰性被推到危险的边缘仍然好看。",
  note:"线要极细极准，装饰一多就俗气。" },

{ id:"P-JP17", status:"written",  zh:"郑敾", en:"Jeong Seon", life:"1676-1759", mv:"朝鲜真景", mvId:"M-58", region:"朝鲜",
  F:{ medium:["ink and light colour on paper"], brush:["short tapping rock texture","actual-place observation"], color:["pale ink with ochre"], light:["soft seasonal"] , space:["actual specific viewpoint"], motif:["diamond mountains","han river scenery"], spirit:["love of one's own land"] },
  sty:["jeong seon","jingyeong sansu"], tags:["monochrome-ink","line-primary","fine-art-depth","perspective-flat"],
  desc:"朝鲜山水第一次画真山：金刚山的石肌被他点成密密的短皴。",
  note:"实地点位要具体，画成通用山水就失去“真景”的意义。" },

{ id:"P-JP18", status:"written",  zh:"金弘道", en:"Kim Hong-do", life:"1745-约1806", mv:"朝鲜风俗画", mvId:"M-58", region:"朝鲜",
  F:{ medium:["ink and light colour on paper"], brush:["lively rounded line","humorous shorthand figure"], color:["light local tint"], light:["even unmodelled"], space:["busy village clusters"], motif:["tiger hunt scene","blacksmith at work"], spirit:["commoner humour"] },
  sty:["kim hong-do","danwon pungsokdo"], tags:["flat-decoration","line-primary","minimal-empty","polychrome-full"],
  desc:"把朝鲜的日常画成喜剧：打铁、摔跤、聊天，一个个都带着动作与表情。",
  note:"幽默来自姿态的生动，画成木讷就只剩资料性。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
