/* ============================================================
 * data-movements.js —— 流派与运动（西方：十五世纪到十九世纪末）
 * 每个流派同样按七个面拆，因此可以与任意画家的面互换、互拼。
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var MOVEMENTS = require("./data-core.js").MOVEMENTS;

MOVEMENTS.push(
{ id:"M-01", status:"written",  zh:"早期文艺复兴", en:"Early Renaissance", era:"1420-1495", region:"意大利",
  F:{ medium:["egg tempera on gessoed panel"], brush:["fine cross-hatching","thin translucent glazes","crisp contour"], color:["clear local colour","lapis and vermilion accents"], light:["even daylight","gentle modelling"], space:["strict linear perspective","architectural depth"], motif:["annunciation","donor portrait","frescoed chapel wall"], spirit:["measured piety","humanist order"] },
  sty:["early renaissance painting","quattrocento"], tags:["line-primary","perspective-linear","panel","natural-daylight","polychrome-full"],
  desc:"透视法刚被发明出来的兴奋期：一切都可测量、稳定，人物像建筑一样立在光线里。",
  note:"这层的透视比体积更重要，画面中出现压得很暗的明暗对比会立刻跑偏到巴洛克。" },

{ id:"M-02", status:"written",  zh:"盛期文艺复兴", en:"High Renaissance", era:"1495-1520", region:"意大利",
  F:{ medium:["oil on panel and canvas"], brush:["sfumato blending","imperceptible transitions"], color:["harmonised primaries","cool-warm balance"], light:["soft unified daylight"], space:["pyramidal figure grouping","centralised symmetry"], motif:["madonna enthroned"," idealized nude","philosopher gathering"], spirit:["ideal proportion","calm authority"] },
  sty:["high renaissance","leonardo sfumato"], tags:["wet-blending","no-outline","perspective-linear","fine-art-depth","polychrome-full"],
  desc:"把一切矛盾调停到看不见：轮廓融进空气，构图收成稳定的金字塔，理想比例压倒个性。",
  note:"这一层的笔触必须消失，一旦笔触变得看得见，画面立刻掉到样式主义。" },

{ id:"M-03", status:"written",  zh:"威尼斯画派", en:"Venetian School", era:"1500-1600", region:"意大利",
  F:{ medium:["oil on canvas","coloured Venetian ground"], brush:["loose loaded brush","scumbled highlights"], color:["colourito dominance","saturated drapery hues","golden ambient"], light:["warm reflected light","open air glow"], space:["architectural stage depth","raised viewpoint"], motif:["doge ceremony","mythological feast","lagoon light"], spirit:["sensual opulence","civic pomp"] },
  sty:["venetian school","colourito"], tags:["painterly-stroke","saturated-clash","fine-art-depth","oil-impasto"],
  desc:"威尼斯人先有颜色再有形：笔是带着颜料直接在布上调出来的，远看比近看更像真的。",
  note:"画面必须留一笔“没画完”的松动感，补得太干净反而失去那种色彩本位的润。" },

{ id:"M-04", status:"written",  zh:"样式主义", en:"Mannerism", era:"1520-1600", region:"意大利",
  F:{ medium:["oil on panel","acidic prepared ground"], brush:["elongated contour","polished enamel surface"], color:["acid off-key hues","iridescent drapery"], light:["arbitrary multiple lights"], space:["crowded tilted space","figure serpentinata"], motif:["allegorical conceit","multi figure compression"], spirit:["artificial elegance","intellectual strain"] },
  sty:["mannerism","figura serpentinata"], tags:["line-primary","saturated-clash","fine-art-depth","polychrome-full"],
  desc:"故意把文艺复兴那套完美的平衡拧歪：人体被拉长扭成蛇形，颜色故意唱反调，空间挤得不舒服。",
  note:"“不舒服”是刻意的高级，别手贱去修正它的人体比例。" },

{ id:"M-05", status:"written",  zh:"巴洛克", en:"Baroque", era:"1600-1750", region:"欧洲",
  F:{ medium:["oil on canvas","dark bituminous ground"], brush:["thick impasto highlight","energetic diagonal stroke"], color:["deep earth ground","single hot accent"], light:["raking spotlight","deep tenebrism"], space:["diagonal thrust","figures bursting the frame"], motif:["martyrdom","supper scene","still moment of revelation"], spirit:["theatrical urgency","physical weight"] },
  sty:["baroque painting","tenebrism","chiaroscuro"], tags:["chiaroscuro-volume","oil-impasto","fine-art-depth","broad-gesture"],
  desc:"一束光从斜上方劈下来，人物被推到画面边缘就要冲出去，所有情绪都停在最高潮的那一秒。",
  note:"暗部要暗到几乎没有细节，但结构转折必须清晰；中间灰太多就会变成普通学院派。" },

{ id:"M-06", status:"written",  zh:"荷兰黄金时代", en:"Dutch Golden Age", era:"1600-1700", region:"尼德兰",
  F:{ medium:["oil on panel and canvas","thin grey ground"], brush:["invisible finish","tiny reflective highlights"], color:["restrained browns and greys","single lemon accent"], light:["window light from the left","soft interior falloff"], space:["domestic box interior","open doorway depth"], motif:["domestic task","group portrait guild","breakfast table"], spirit:["bourgeois calm","quiet self-possession"] },
  sty:["dutch golden age painting","fijnschilder"], tags:["tiny-detail","line-primary","fine-art-depth","perspective-linear","muted-grey"],
  desc:"中产阶级的屋子里，左边来一扇窗的光：一切安静、干净、体面，细节经得起拿放大镜看。",
  note:"题材可以极平凡，但质感必须极讲究；道具一敷衍整套就塌了。" },

{ id:"M-07", status:"written",  zh:"洛可可", en:"Rococo", era:"1715-1780", region:"法国",
  F:{ medium:["oil on canvas","pale prepared ground"], brush:["feathery flick of the brush","thin scumbled layer"], color:["pastel pink and sky blue","powdered silver green"], light:["diffused silvery light","no deep shadow"], space:["asymmetrical S curve","garden theatre setting"], motif:["fete galante","shepherdess play","ornamental shellwork"], spirit:["playful escapism","courtly flirtation"] },
  sty:["rococo painting","fete galante"], tags:["wet-blending","muted-grey","no-outline","fine-art-depth"],
  desc:"粉蓝银灰的游乐场：笔触轻得像羽毛扫过，人物永远在恋爱、化妆或假装当牧羊人。",
  note:"这层怕重、怕脏、怕强烈对比，画面里出现深色重暗就完全不是洛可可了。" },

{ id:"M-08", status:"written",  zh:"新古典主义", en:"Neoclassicism", era:"1780-1840", region:"法国·意大利",
  F:{ medium:["oil on canvas","very smooth prepared surface"], brush:["suppressed brushwork","enamel finish"], color:["cool limited palette","local colour priority"], light:["clear stage light","sculptural modelling"], space:["frieze-like relief space","strict frontal geometry"], motif:["oath scene","ancient history","stoic sacrifice"], spirit:["civic virtue","moral clarity"] },
  sty:["neoclassicism","davidian"], tags:["no-outline","line-primary","hard-edge","fine-art-depth","muted-grey"],
  desc:"像浅浮雕一样把人物排成一列：颜色让位于线条，笔触彻底藏起来，大义凛然。",
  note:"素描准确性决定成败，形体一软整套的道德感就没了。" },

{ id:"M-09", status:"written",  zh:"浪漫主义", en:"Romanticism", era:"1800-1850", region:"欧洲",
  F:{ medium:["oil on canvas","dark energetic ground"], brush:["sweeping gusto stroke","visible emotional gesture"], color:["stormy warm-cool clash","deep crimson note"], light:["dramatic backlight","turbulent sky fire"], space:["diagonal vortex","overwhelming scale"], motif:["shipwreck","wild horse","ruined castle"], spirit:["sublime terror","individual defiance"] },
  sty:["romanticism painting","sublime"], tags:["broad-gesture","saturated-clash","chiaroscuro-volume","fine-art-depth"],
  desc:"自然不是背景而是敌人：笔要甩出来，天空要烧起来，人在里面显得既渺小又倔强。",
  note:"保留笔触的情绪价值，把边缘修干净就只剩下漂亮海报了。" },

{ id:"M-10", status:"written",  zh:"巴比松与写实主义", en:"Barbizon & Realism", era:"1830-1880", region:"法国",
  F:{ medium:["oil on canvas","primed earth tone ground"], brush:["square brush block-in","honest plain handling"], color:["earthbound honest colour","no idealisation"], light:["outdoor north light","true grey shadow"], space:["ordinary horizon","unheroic framing"], motif:["peasant labor","forest edge","gleaning field"], spirit:["social dignity","disenchanted truth"] },
  sty:["realism painting","barbizon school"], tags:["broad-gesture","muted-grey","fine-art-depth","natural-daylight"],
  desc:"拒绝美化的一代：把农民和树林按原有的体面画出来，不用神话给穷苦镀金。",
  note:"不要加理想化的美化词，这一层的力量来自“照实写”。" },

{ id:"M-11", status:"written",  zh:"印象派", en:"Impressionism", era:"1860-1890", region:"法国",
  F:{ medium:["oil on canvas","light toned ground"], brush:["broken colour stroke"," commas of paint"], color:["complementary shadow","no black","violet in shadow"], light:["open air sunlight","fleeting moment"], space:["high horizon crop","casual snapshot angle"], motif:["river terrace","haystack series","suburban leisure"], spirit:["optical immediacy","modern leisure"] },
  sty:["impressionism","plein air painting"], tags:["painterly-stroke","saturated-clash","flat-decoration","natural-daylight"],
  desc:"阴影不是黑的是紫的，笔触是分开的小笔道；画的是视网膜那一瞬间受到的刺激。",
  note:"场景里出现油污般的黑影或过分光滑的过渡，印象派的户外通透感立刻失效。" },

{ id:"M-12", status:"written",  zh:"新印象派点彩", en:"Neo-Impressionism", era:"1884-1910", region:"法国·比利时",
  F:{ medium:["oil on canvas","dry divided touch"], brush:["systematic dot","optical mixture"], color:["scientific complementary grid","pure unmixed pigment"], light:["radiating luminance","no arbitrary shadow"], space:["ordered theoretic space","measured intervals"], motif:["sunday riverside","circus parade","coastal harbor"], spirit:["methodical utopia","detached serenity"] },
  sty:["pointillism","divisionism"], tags:["tiny-detail","hard-edge","natural-daylight","saturated-clash"],
  desc:"把颜色混的任务交给眼睛：密集的小点在视网膜上重新合成，一切都预先算过。",
  note:"点要服从密度节奏，不能随机撒；散乱的点只会糊成噪点。" },

{ id:"M-13", status:"written",  zh:"后印象派", en:"Post-Impressionism", era:"1885-1905", region:"法国",
  F:{ medium:["oil on canvas","varied personal ground"], brush:["directional personal stroke","structural swirl"], color:["arbitrary emotional colour","local hue intensified"], light:["colour carries light","optional shadow"], space:["flattened deliberate distortion"], motif:["peasant portrait","provencal landscape","exotic refuge"], spirit:["subjective structure","expressive solitude"] },
  sty:["post-impressionism","expressionist colour"], tags:["painterly-stroke","oil-impasto","perspective-flat","saturated-clash"],
  desc:"印象派解决了光，这批人要解决结构：颜色可以不再是眼睛看到的，笔触开始宣告自己的存在。",
  note:"主观变形是刻意的，画面出现写实比例反而说明没到火候。" },

{ id:"M-14", status:"written",  zh:"象征主义", en:"Symbolism", era:"1885-1910", region:"法国·比利时·挪威",
  F:{ medium:["oil on canvas","dark symbolist ground"], brush:["dream flat rendering","ambiguous edge"], color:["nocturnal palette","metallic sickly tint"], light:["moonlit ambiguity","inner glow"], space:["unlocated dream space","no ground line"], motif:["masked figure","femme fatale","death allegory"], spirit:["interior dread","erotic melancholy"] },
  sty:["symbolist painting","fin de siecle"], tags:["flat-decoration","no-outline","muted-grey","gold-ground"],
  desc:"画的是念头而不是场景：悬浮的人影、摸不清光源的夜色、说不清寓意的道具。",
  note:"一旦把场景具体交代清楚（时间、地点、光源），象征的张力就泄了。" },

{ id:"M-15", status:"written",  zh:"新艺术运动", en:"Art Nouveau", era:"1890-1910", region:"欧洲",
  F:{ medium:["poster lithograph","stained glass design"], brush:["whip lash contour","flowing arabesque"], color:["soft natural palette","gold and olive"], light:["even decorative illumination"], space:["flat ornamental field","frame-integrated rhythm"], motif:["flower-hair woman","insect wing motif","organic ironwork"], spirit:["decorative total work","nature as ornament"] },
  sty:["art nouveau","mucha poster"], tags:["line-primary","flat-decoration","hyper-ornament","flat-print","perspective-flat"],
  desc:"线条先被用来装饰而不是造型：鞭形的曲线带着植物一起长满整幅画面。",
  note:"制造视错觉的纵深感要克制，一旦加出体积，整套装饰就塌了。" },

{ id:"M-16", status:"written",  zh:"纳比派", en:"Les Nabis", era:"1888-1900", region:"法国",
  F:{ medium:["oil on cardboard","matte distemper finish"], brush:["flat pattern block","unprimed absorbent drag"], color:["arbitrary decorative scheme","violet and jade"], light:["no modelled shadow","colour-shape logic"], space:["tilted domestic pattern","Japanese print crop"], motif:["interior ritual","garden screen","reading woman"], spirit:["intimate domesticity","quiet formalism"] },
  sty:["nabis painting","intimisme"], tags:["flat-decoration","line-primary","hyper-ornament","perspective-flat"],
  desc:"一群把画布当壁纸画的年轻人：图案、布料、室内角落，一切扁平而亲密。",
  note:"这是图案先行的画，一旦出现喷笔涂匀式的体积感就算失败。" },

{ id:"M-17", status:"written",  zh:"表现主义", en:"Expressionism", era:"1905-1930", region:"德国·北欧",
  F:{ medium:["oil on rough canvas","absorbent unprimed ground"], brush:["gouged sweepingstroke","violent simplification"], color:["non-local arbitrary hue","acid green and blood red"], light:["psychological not optical"], space:["tilted claustrophobic angle"], motif:["masked face","urban crowd","screaming sky"], spirit:["existential anxiety","raw confession"] },
  sty:["expressionism","die brucke","blauer reiter"], tags:["broad-gesture","saturated-clash","perspective-flat","oil-impasto"],
  desc:"颜色不从对象来，从恐惧里来：粗野的笔触与变了调的脸，是内在状态的直接导出。",
  note:"“难看”是它的语法，不要用娇柔的画质词去美化。" },

{ id:"M-18", status:"written",  zh:"立体主义", en:"Cubism", era:"1907-1920", region:"法国·西班牙",
  F:{ medium:["oil with sand admixture","collaged newspaper"], brush:["faceted plane shift","analytical grey modelling"], color:["ochre grey and olive","later brighter planes"], light:["multiple simultaneous viewpoints"], space:["shattered object facets","shallow relief depth"], motif:["tabletop guitar","still life vessel","fragmented portrait"], spirit:["intellectual analysis","multiple truth"] },
  sty:["cubism","analytic cubism"], tags:["hard-edge","perspective-flat","muted-grey","flat-print"],
  desc:"一件东西同时从六个角度看：表面被切成互相错位的小面，深度只剩一点点浅浮雕。",
  note:"后期可以回到亮色，但“多视点同时存在”这条不能破。" },

{ id:"M-19", status:"written",  zh:"未来主义", en:"Futurism", era:"1909-1918", region:"意大利",
  F:{ medium:["oil on canvas","dynamic divisionist inheritance"], brush:["repetition trail line","force line radiation"], color:["violent red and electric blue"], light:["simultaneity of flickering sources"], space:["no fixed standpoint","motion-induced collapse"], motif:["racing machine","urban construction","crowd in motion"], spirit:["machine worship","aggressive modernity"] },
  sty:["futurism","force lines"], tags:["broad-gesture","hard-edge","saturated-clash","perspective-flat"],
  desc:"用重复的残影把运动塞进静止的画面：一个物体要画出它经过的全部位置。",
  note:"静止的、居中的构图会把未来主义画死；给足方向感。" },

{ id:"M-20", status:"written",  zh:"至上主义与构成主义", en:"Suprematism & Constructivism", era:"1915-1930", region:"俄国",
  F:{ medium:["oil on canvas","agitational design board"], brush:["absolute flat Precision","machine straight edge"], color:["red black white doctrine","constructivist ochre"], light:["no modelled light"], space:["floating levitating geometry","tilted non-object field"], motif:["floating rectangle","diagonal Red Wedge","typographic agitprop"], spirit:["utopian abstraction","revolutionary clarity"] },
  sty:["suprematism","constructivism"], tags:["minimal-empty","flat-decoration","hard-edge","perspective-flat","commercial-poster"],
  desc:"把绘画减到最后的几何：一块红方块飘在白底上，宣布对象彻底退场。",
  note:"不要把几何体画出阴影或厚度，那会把它拖回错觉主义。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { MOVEMENTS };
