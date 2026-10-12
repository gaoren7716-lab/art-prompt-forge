/* ============================================================
 * data-movements-east.js —— 流派与运动（中国 · 日本 · 朝鲜）
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var MOVEMENTS = require("./data-core.js").MOVEMENTS;

MOVEMENTS.push(
{ id:"M-41", status:"written",  zh:"六朝隋唐人物", en:"Early Figure Painting", era:"四至九世纪", region:"中国",
  F:{ medium:["ink and mineral colour on silk"], brush:["even continuous thread line","archaic flat wash"], color:["flat cinnabar and azurite"], light:["no shadow whatsoever"], space:["rank-based scale","processional arrangement"], motif:["court lady","lofty scholar","river deity"], spirit:["archaic restraint","narrative didacticism"] },
  sty:["classical chinese figure painting"], tags:["line-primary","flat-decoration","perspective-flat","polychrome-full"],
  desc:"线是一条匀到极致的游丝，人物按身份的大小排列，教化与鉴戒是它的任务。",
  note:"这一层没有投影、没有透视，加进去就等于把时代的语言抹掉。" },

{ id:"M-42", status:"written",  zh:"五代北宋全景山水", en:"Northern Song Monumental Landscape", era:"十至十二世纪", region:"中国",
  F:{ medium:["ink on silk with light wash"], brush:["axe-cut texture stroke","rain-drop texture stroke"], color:["ink monochrome with light ochre"], light:["mist separates distance"], space:["towering central peak","three-distance depth"], motif:["traveler on mountain path","hermit in cliff valley"], spirit:["cosmic order","monumental awe"] },
  sty:["northern song landscape","monumental landscape"], tags:["line-primary","monochrome-ink","minimal-empty","perspective-flat"],
  desc:"一座大山压在正中，皴法像雨点像斧劈，人在山里只是一枚刻度。",
  note:"注意皴法必须是山自己的结构，不是明暗交代；出现焦点透视就散了。" },

{ id:"M-43", status:"written",  zh:"南宋院体", en:"Southern Song Academy", era:"十二至十三世纪", region:"中国",
  F:{ medium:["ink on silk album leaf"], brush:["sweeping axe-cut","wet atmospheric wash"], color:["restrained ink tone"], light:["soft diffused mist"], space:["one-corner and one-side layout"], motif:["river bend at dusk","pine and moon"], spirit:["poetic ellipsis","deliberate brevity"] },
  sty:["ma-xia school","academy landscape"], tags:["line-primary","minimal-empty","wet-blending","perspective-flat"],
  desc:"画面只占一角，剩下的留给水和雾：越少说，诗意越多。",
  note:"留白要敢留，画满了就等于没懂这家语言的重点。" },

{ id:"M-44", status:"written",  zh:"元代文人画", en:"Yuan Literati Painting", era:"十三至十四世纪", region:"中国",
  F:{ medium:["ink on paper","dry corda-less handling"], brush:["calligraphic writing brush","dry restrained stroke"], color:["ink only or light ochre"], light:["no atmospheric drama"], space:["reduced sparse motif","scholarly abstraction"], motif:["bamboo and rock","empty pavilion","autumn tree"], spirit:["lofty retirement","self-cultivation"] },
  sty:["literati painting","wenren hua"], tags:["monochrome-ink","line-primary","minimal-empty","perspective-flat"],
  desc:"书法性的用笔取代了描绘性的用笔：画的是心绪，不是景色。",
  note:"必须有书写感，笔一“描”就掉到画匠那一头去了。" },

{ id:"M-45", status:"written",  zh:"青绿重彩与没骨", en:"Blue-and-Green & Boneless", era:"八至十八世纪", region:"中国",
  F:{ medium:["mineral azurite and malachite on silk"], brush:["outline-and-fill or boneless wash"], color:["saturated blue-green mineral","cinnabar counterpoint"], light:["no modelled light"], space:["layered fantastic ranges"], motif:["immortal mountain","imperial procession"], spirit:["precious rarity","archaic revival"] },
  sty:["blue and green landscape","mogu painting"], tags:["polychrome-full","flat-decoration","line-primary","perspective-flat"],
  desc:"蓝铜矿与孔雀石磨出来的贵气：要么先勾线再填色，要么干脆无线，全靠块面。",
  note:"矿物色的厚重感是关键，画成透明水彩就废了。" },

{ id:"M-46", status:"written",  zh:"明代写意花鸟", en:"Ming Expressive Flower-and-Bird", era:"十五至十七世纪", region:"中国",
  F:{ medium:["ink on absorbent paper"], brush:["splash ink abandon","single sweeping stroke"], color:["monochrome with occasional red"], light:["none required"], space:["asymmetric spray across the frame"], motif:["wild grape vine","lotus after rain","crab and reed"], spirit:["unrestrained release","martyr-like candour"] },
  sty:["xieyi painting","splash ink"], tags:["broad-gesture","ink-aqueous","monochrome-ink","minimal-empty"],
  desc:"墨泼出去就收不回来：一笔是一笔，中间不许改，情绪比形状重要。",
  note:"这是控制下的放纵，乱涂不等于写意。" },

{ id:"M-47", status:"written",  zh:"清初遗民", en:"Loyalist Masters of the Early Qing", era:"十七至十八世纪", region:"中国",
  F:{ medium:["ink on paper","dry abbreviated handling"], brush:["terse withheld stroke","withered broken stroke"], color:["ink only","pale desolated wash"], light:["shadow ignored entirely"], space:["tilted precarious mass","lonely single element"], motif:["single bird with one eye open","withered lotus","jagged cliff"], spirit:["grief and refusal","alienation as form"] },
  sty:["individualist painting","loyalist ink"], tags:["monochrome-ink","minimal-empty","ink-aqueous","perspective-flat"],
  desc:"亡国之痛变成了形式：物体被砍到最短简，构图歪着，留白像被剥夺的空间。",
  note:"“少”是被迫也是决心，画面太完整反而失去了那种冒犯感。" },

{ id:"M-48", status:"written",  zh:"扬州八怪", en:"Yangzhou Eccentrics", era:"十八世纪", region:"中国",
  F:{ medium:["ink and light colour on paper"], brush:["deliberately crude line","awkward calligraphic scrawl"], color:["sparse muted colour"], light:["none"], space:["compact scroll vertical"], motif:["orchid and bamboo","beggar and immortal"], spirit:["professional iconoclasm","deliberate vulgarity"] },
  sty:["yangzhou eccentric","eight eccentrics"], tags:["line-primary","broad-gesture","minimal-empty","aged-decay"],
  desc:"靠卖画为生的一群“怪”：故意拙、故意俗、故意用俗物写清高。",
  note:"拙是策略不是毛病，笔一圆滑就变成普通行画。" },

{ id:"M-49", status:"written",  zh:"海上画派", en:"Shanghai School", era:"十九世纪末至二十世纪初", region:"中国",
  F:{ medium:["ink and colour on paper","absorbent raw paper"], brush:["robust loaded stroke","rapid abbreviated form"], color:["bright commercial colour","vivid red and malachite"], light:["flat studio light"], space:["accessible popular framing"], motif:["peony and crane","auspicious symbol"], spirit:["urban patronage","blunt vitality"] },
  sty:["shanghai school","haipai"], tags:["broad-gesture","polychrome-full","line-primary","flat-decoration"],
  desc:"口岸商业起来的画风：颜色要亮、笔要快、寓意要吉利，画家第一次有了市场。",
  note:"雅俗之间的张力是它的看点，太雅或太俗都不成立。" },

{ id:"M-50", status:"written",  zh:"岭南画派", en:"Lingnan School", era:"二十世纪初", region:"中国",
  F:{ medium:["ink and colour with Japanese influence"], brush:["precise feather rendering of wing and petal","misty western wash"], color:["softened wash palette"], light:["atmospheric western recession"], space:["partial western perspective"], motif:["bird in rain","lion in storm"], spirit:["national reform","modern awakening"] },
  sty:["lingnan school","eclectic synthesis"], tags:["tiny-detail","wet-blending","fine-art-depth","polychrome-full"],
  desc:"用日本画的渲染加上一点点西画透视，让国画第一次学会湿答答的空气感。",
  note:"渲染要湿但清，脏了就失去那层通透。" },

{ id:"M-51", status:"written",  zh:"中国现代水墨", en:"Modern Chinese Ink", era:"二十世纪中后期至今", region:"中国",
  F:{ medium:["ink and acrylic on paper","large scale wall work"], brush:["structural ink gesture","western abstract field"], color:["monochrome plus industrial accent"], light:["no described light source"], space:["all-over abstraction with ink logic"], motif:["mountain reduced to mass","symbolic red sun"], spirit:["national reinvention","scale as statement"] },
  sty:["modern chinese ink","experimental ink"], tags:["broad-gesture","minimal-empty","monochrome-ink","ink-aqueous"],
  desc:"把水墨从册页上解放到墙上：大笔、大结构、大留白，跟国家叙事绑在一起。",
  note:"笔要有骨，光有大面积淡墨会化成雾。" },

{ id:"M-52", status:"written",  zh:"浮世绘", en:"Ukiyo-e", era:"十七至十九世纪", region:"日本",
  F:{ medium:["woodblock print on washi"], brush:["keyblock outline","flat colour planes","bokashi wipe gradient"], color:["prussian blue and vermilion"], light:["no cast shadow"], space:["bold cropping and diagonal sweep"], motif:["actor portrait","travel station","wave and wind"], spirit:["floating world pleasure","commercial wit"] },
  sty:["ukiyo-e","japanese woodblock print"], tags:["flat-print","line-primary","flat-decoration","hard-edge","perspective-flat"],
  desc:"娱乐业的图像工业：明星、旅行、名所，平面之下藏着极精的经营。",
  note:"不要投影、不要空气透视，这一层靠的是平面与裁切。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { MOVEMENTS };
