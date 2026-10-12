/* ============================================================
 * data-painters-extra.js —— 第一轮遗漏的重要画家补录
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-FX01", status:"written",  zh:"文森特·梵高", en:"Vincent van Gogh", life:"1853-1890", mv:"后印象派", mvId:"M-13", region:"荷兰",
  F:{ medium:["oil on canvas"], brush:["direction following swirl"], color:["chrome yellow and prussian blue"], light:["self-luminous non-natural"], space:["compressed tilted room"], motif:["sunflowers","cypress flame","night cafe"], spirit:["incandescent lonely urgency"] },
  sty:["vincent van gogh","post-impressionist swirl"], tags:["oil-impasto","broad-gesture","saturated-clash","painterly-stroke"],
  desc:"笔触自己就是情绪：每一条沟壑都朝着一个方向跑，颜色亮到不需要太阳。",
  note:"厚涂的方向感绝对不能抹平，一旦平整他就不存在了。" },

{ id:"P-FX02", status:"written",  zh:"古斯塔夫·库尔贝", en:"Gustave Courbet", life:"1819-1877", mv:"巴比松与写实主义", mvId:"M-10", region:"法国",
  F:{ medium:["oil on large canvas"], brush:["palette knife loaded slab"], color:["earth brown leaden grey"], light:["honest overcast daylight"], space:["life-size monumental frieze"], motif:["stone breakers","peasant burial"], spirit:["unyielding material truth"] },
  sty:["gustave courbet","realism"], tags:["oil-impasto","fine-art-depth","muted-grey","natural-daylight"],
  desc:"把英雄的尺幅给了普通人：他要的只是「我见过的」。",
  note:"不能美化，也不能戏剧化；那种粗糙本身就是立场。" },

{ id:"P-FX03", status:"written",  zh:"让-莱昂·热罗姆", en:"Jean-Leon Gerome", life:"1824-1904", mv:"新古典主义", mvId:"M-08", region:"法国",
  F:{ medium:["oil on canvas"], brush:["invisible academic finish"], color:["desert ochre with cool tile blue"], light:["hard clear sunlight"], space:["stage-like archaeological depth"], motif:["bath house","gladiator arena","mosque interior"], spirit:["orientalist polished spectacle"] },
  sty:["jean-leon gerome","academic orientalist"], tags:["tiny-detail","fine-art-depth","photographic","natural-daylight"],
  desc:"十九世纪最精致的一双肉眼：每一个瓷砖纹样都经得起放大镜。",
  note:"笔触必须为不可见；留下痕迹就不是学院派。" },

{ id:"P-FX04", status:"written",  zh:"威廉·阿道夫·布格罗", en:"William-Adolphe Bouguereau", life:"1825-1905", mv:"新古典主义", mvId:"M-08", region:"法国",
  F:{ medium:["oil on canvas"], brush:["porcelain smooth blending"], color:["rosy flesh and sky blue"], light:["soft studio caress"], space:["idealised centred grouping"], motif:["shepherdess","cherubs","mother and child"], spirit:["sentimental academic beauty"] },
  sty:["william bouguereau","academic salon"], tags:["no-outline","wet-blending","fine-art-depth","tiny-detail"],
  desc:"把皮肤画成瓷釉：光滑得几乎没有笔，这就是为什么当年这么受欢迎。",
  note:"不能有任何笔触可见，追求「好看」是他唯一的目的。" },

{ id:"P-FX05", status:"written",  zh:"皮埃尔·博纳尔", en:"Pierre Bonnard", life:"1867-1947", mv:"纳比派", mvId:"M-16", region:"法国",
  F:{ medium:["oil on canvas"], brush:["stippled shifting key"], color:["warm yellow orange with violet"], light:["interior colour-lit"], space:["intimate tilted domestic"], motif:["bath tub","breakfast table","open window"], spirit:["domestic drowsy intimacy"] },
  sty:["pierre bonnard","intimist nabis"], tags:["painterly-stroke","saturated-clash","wet-blending","flat-decoration"],
  desc:"颜色自己发光：把日常的一角浸在一种暖得发稠的光里。",
  note:"透视要偷偷地歪一点，摆正了就丢掉那种私密感。" },

{ id:"P-FX06", status:"written",  zh:"皮特·蒙德里安", en:"Piet Mondrian", life:"1872-1944", mv:"极少主义", mvId:"M-30", region:"荷兰",
  F:{ medium:["oil on flat canvas"], brush:["hard edge without brushwork"], color:["primary red blue yellow"], light:["none"], space:["strict asymmetric grid"], motif:["black barred grid"], spirit:["universal harmonic order"] },
  sty:["piet mondrian","neoplasticism"], tags:["flat-decoration","hard-edge","minimal-empty","perspective-flat"],
  desc:"只剩下横竖与三原色：所有多余的都被他一格一格清掉了。",
  note:"笔触为零、画面绝对平；一旦出现笔触或纹理就不再是新造型主义。" },

{ id:"P-FX07", status:"written",  zh:"雷内·马格利特", en:"Rene Magritte", life:"1898-1967", mv:"超现实主义", mvId:"M-23", region:"比利时",
  F:{ medium:["oil on canvas"], brush:["deadpan commercial precision"], color:["banal blue sky and grey suit"], light:["even daylight paradox"], space:["ordinary room with impossible event"], motif:["bowler hat man","green apple","cast shadow contradiction"], spirit:["quiet philosophical sabotage"] },
  sty:["rene magritte","belgian surrealism"], tags:["photographic","flat-decoration","tiny-detail","hard-edge"],
  desc:"用最平淡的技术画最不可能的事：荒诞因为画得太认真而成立。",
  note:"技术必须毫无个性，笔触一旦「美」破坏力就没了。" },

{ id:"P-FX08", status:"written",  zh:"马克·罗斯科", en:"Mark Rothko", life:"1903-1970", mv:"色域绘画", mvId:"M-25", region:"美国",
  F:{ medium:["oil on unprimed large canvas"], brush:["thin diluted veils"], color:["maroon orange and black"], light:["inner asbestos glow"], space:["boundless floating rectangle"], motif:["stacked colour field"], spirit:["tragic sublime silence"] },
  sty:["mark rothko","colour field"], tags:["minimal-empty","wet-blending","flat-decoration","no-outline"],
  desc:"大块颜色悬在一种现代的昏暗前：没有形象，只有一种要被吞没的压力。",
  note:"边界必须虚到呼吸一样，画成硬边的方块就失去了那种浮动。" },

{ id:"P-FX09", status:"written",  zh:"罗伊·利希滕斯坦", en:"Roy Lichtenstein", life:"1923-1997", mv:"波普艺术", mvId:"M-26", region:"美国",
  F:{ medium:["oil and magna on canvas"], brush:["benday dot mechanical fill"], color:["primary red yellow with ben-day"], light:["harsh printed contrast"], space:["comic panel close crop"], motif:["weepy heroine","halftone dots","speech balloon"], spirit:["ironic commercial quotation"] },
  sty:["roy lichtenstein","pop art ben-day"], tags:["flat-print","hard-edge","commercial-poster","saturated-clash"],
  desc:"把漫画放大到墙那么大：网点全是手画的，一种故意的印刷失误。",
  note:"一切都要像印刷错误般的平与准，笔触出现就破功。" },

{ id:"P-FX10", status:"written",  zh:"安德斯·佐恩", en:"Anders Zorn", life:"1860-1920", mv:"印象派", mvId:"M-11", region:"瑞典",
  F:{ medium:["oil on canvas"], brush:["juicy wet-into-wet stroke"], color:["flesh pink with silver grey"], light:["candlelit and water reflected"], space:["three quarter conceived likeness"], motif:["nude by water","society portrait"], spirit:["bravura northern virtuosity"] },
  sty:["anders zorn","zorn palette"], tags:["painterly-stroke","wet-blending","fine-art-depth","natural-daylight"],
  desc:"湿压湿一笔成型：只用四种颜料就把皮肤的血色抓住了。",
  note:"必须保留那种一挥而就的湿润，反复堆砌就笨了。" },

{ id:"P-FX11", status:"written",  zh:"但丁·加布里埃尔·罗塞蒂", en:"Dante Gabriel Rossetti", life:"1828-1882", mv:"象征主义", mvId:"M-14", region:"英国",
  F:{ medium:["oil on canvas"], brush:["soft jewelled modelling"], color:["deep auburn and emerald"], light:["inner dreamy glow"], space:["frontal shallow crowded"], motif:["red haired muse","flower symbol"], spirit:["literary medieval longing"] },
  sty:["dante gabriel rossetti","pre-raphaelite"], tags:["tiny-detail","hyper-ornament","saturated-clash","flat-decoration"],
  desc:"文学性压倒一切：每朵花都是典故，每个女人的眼神都是一句诗。",
  note:"花草与织纹必须繁密到溢出；简化就失去了拉斐尔前派的味道。" },

{ id:"P-FX12", status:"written",  zh:"詹姆斯·惠斯勒", en:"James McNeill Whistler", life:"1834-1903", mv:"象征主义", mvId:"M-14", region:"美国",
  F:{ medium:["oil and ink thinly floated"], brush:["thin scraped veil"], color:["grey blue with mother of pearl"], light:["nocturne twilight veil"], space:["tonal atmospheric expanse"], motif:["thames night","peacock room","butterfly signature"], spirit:["aesthetic musical restraint"] },
  sty:["james whistler","tonalist nocturne"], tags:["muted-grey","minimal-empty","wet-blending","flat-decoration","atmospheric-distance"],
  desc:"用音乐的标题画画：夜曲里的灰可以细分出几十种，形象几乎消失。",
  note:"墨要薄得像水，任何厚涂都会打破那种安静。" },

{ id:"P-FX13", status:"written",  zh:"翁贝托·波丘尼", en:"Umberto Boccioni", life:"1882-1916", mv:"未来主义", mvId:"M-19", region:"意大利",
  F:{ medium:["oil on canvas"], brush:["splayed Cubo-futurist facet"], color:["acid green and hot orange"], light:["simultaneous streaked"], space:["motion penetrating form"], motif:["striding figure","charging horse","factory light"], spirit:["machine age velocity"] },
  sty:["umberto boccioni","futurism"], tags:["broad-gesture","saturated-clash","hard-edge","perspective-flat"],
  desc:"人跑起来就没有边界：身体和背景溶在一起，速度本身成了形。",
  note:"一定不能让形体静止，静止了就只是立体主义。" },

{ id:"P-FX14", status:"written",  zh:"贾科莫·巴拉", en:"Giacomo Balla", life:"1871-1958", mv:"未来主义", mvId:"M-19", region:"意大利",
  F:{ medium:["oil on canvas"], brush:["repeated wedge multiplication"], color:["divisionist bright triad"], light:["vibrating no shadow"], space:["single motion track"], motif:["dog on leash","lamp arcs","hundred legs"], spirit:["playful kinetic optimism"] },
  sty:["giacomo balla","futurist divisionism"], tags:["flat-decoration","hard-edge","saturated-clash","line-primary"],
  desc:"一条狗的腿被画成十几条：不是画错了，是把那一秒铺开了。",
  note:"重复要有节律，乱画就不是巴拉的运动逻辑。" },

{ id:"P-FX15", status:"written",  zh:"乔治·德·基里柯", en:"Giorgio de Chirico", life:"1888-1978", mv:"形而上画派", mvId:"M-22", region:"意大利",
  F:{ medium:["oil on canvas"], brush:["flat enamelled plane"], color:["Mediterranean green and brick"], light:["long metaphysic shadow"], space:["empty arcaded piazza"], motif:["tailor dummy","train on horizon","classical head"], spirit:["unsettling frozen enigma"] },
  sty:["giorgio de chirico","metaphysical painting"], tags:["flat-decoration","hard-edge","minimal-empty","perspective-linear"],
  desc:"无人的广场、不合比例的投影：日常的物件变成了凶兆。",
  note:"投影必须长且方向矛盾，这是整套恐惧感的来源。" },

{ id:"P-FX16", status:"written",  zh:"卡洛·卡拉", en:"Carlo Carra", life:"1881-1966", mv:"形而上画派", mvId:"M-22", region:"意大利",
  F:{ medium:["oil on canvas"], brush:["mannequin stiff modelling"], color:["ochre and deep marine blue"], light:["still cold stage light"], space:["bare room with shutters"], motif:["seated mannequin","toy horse","windowpane"], spirit:["stillness charged with dread"] },
  sty:["carlo carra","metaphysical"], tags:["flat-decoration","hard-edge","minimal-empty","muted-grey"],
  desc:"比基里柯更空更少：一间屋、一个人形、一扇窗，就够了。",
  note:"物体要少，布置要呆板，任何浪漫化的柔光都会泄气。" },

{ id:"P-FX17", status:"written",  zh:"凯斯·哈林", en:"Keith Haring", life:"1958-1990", mv:"街头涂鸦", mvId:"M-29", region:"美国",
  F:{ medium:["matte enamel on public surface"], brush:["single unbroken contour"], color:["flat primary against black"], light:["none"], space:["all-over of interlocking glyphs"], motif:["radiant baby","barking dog","dancing figure"], spirit:["activist joyful urgency"] },
  sty:["keith haring","street mural"], tags:["line-primary","flat-decoration","hard-edge","flat-print"],
  desc:"线条不分叉不断开：所有人都能在一秒内读懂，这是故意的。",
  note:"绝对平涂无渐变，出现明暗造型就失去了那种街头的速度。" },

{ id:"P-FX18", status:"written",  zh:"让-米歇尔·巴斯奇亚", en:"Jean-Michel Basquiat", life:"1960-1988", mv:"街头涂鸦", mvId:"M-29", region:"美国",
  F:{ medium:["acrylic and oil stick on raw canvas"], brush:["scabbed scrawl with crossed words"], color:["cadmium red and tar black"], light:["none"], space:["crowded frontal no ground"], motif:["crowned skull","anatomical scrawl","scratched text"], spirit:["raw precarious intellect"] },
  sty:["jean-michel basquiat","neo-expressionist graffiti"], tags:["broad-gesture","saturated-clash","hard-edge","flat-decoration"],
  desc:"王冠、骷髅、被划掉的词：一个人的知识构成被直接铺在画布上。",
  note:"要生猛，任何精修都会把它变成装饰画。" },

{ id:"P-FX19", status:"written",  zh:"托马斯·科尔", en:"Thomas Cole", life:"1801-1848", mv:"哈德逊河画派", mvId:"M-33", region:"美国",
  F:{ medium:["oil on canvas"], brush:["detailed blended leafage"], color:["deep green with golden haze"], light:["low apostrophic sun"], space:["vast river panorama"], motif:["wilderness gorge","storm-blasted tree"], spirit:["providential sublime"] },
  sty:["thomas cole","hudson river school"], tags:["fine-art-depth","natural-daylight","tiny-detail","polychrome-full"],
  desc:"荒野被当作教堂：太阳从画面深处照出来，人是旁注。",
  note:"光要有布道般的确信，柔化之后就只是风景写生。" },

{ id:"P-FX20", status:"written",  zh:"弗雷德里克·丘奇", en:"Frederic Edwin Church", life:"1826-1900", mv:"哈德逊河画派", mvId:"M-33", region:"美国",
  F:{ medium:["oil on large canvas"], brush:["invisible luminous glaze"], color:["spectrum-edge red and gold"], light:["volcanic and polar light"], space:["theatrical horizon sweep"], motif:["iceberg","tropical volcano","cathedral of water"], spirit:["spectacular geographic awe"] },
  sty:["frederic church","luminism"], tags:["photographic","fine-art-depth","saturated-clash","natural-daylight"],
  desc:"画幅大到需要在暗厅里打灯观看：是一场展览，不是一幅画。",
  note:"笔触必须隐去，那种透亮的密度靠一遍遍罩染叠出来。" },

{ id:"P-FX21", status:"written",  zh:"像素艺术团体", en:"eBoy Pixel Collective", life:"1997-", mv:"像素与低保真", mvId:"M-39", region:"德国",
  F:{ medium:["hard-edge pixel raster"], brush:["deliberate square-authored blocks"], color:["limited 8-bit palette"], light:["none"], space:["isometric stacked city"], motif:["pixel cityscape","toy heroin figures"], spirit:["populated retro-machine joy"] },
  sty:["eboy","pixel art isometric"], tags:["flat-print","hard-edge","flat-decoration","commercial-poster"],
  desc:"每一个像素都是手放的：等距城市里塞满了成百个小故事。",
  note:"必须保持像素方块的绝对整齐，抗锯齿一出现就变成普通插画。" },

{ id:"P-FX22", status:"written",  zh:"高剑父", en:"Gao Jianfu", life:"1879-1951", mv:"岭南画派", mvId:"M-50", region:"中国",
  F:{ medium:["ink and colour on paper"], brush:["Japanese-influenced wet brush"], color:["misty grey with warm ochre"], light:["atmospheric Japanese mist"], space:["asymmetric modern crop"], motif:["banana plant","modern aeroplane","urban rain"], spirit:["reformist eclectic patriotism"] },
  sty:["gao jianfu","lingnan school"], tags:["wet-blending","fine-art-depth","painterly-stroke","muted-grey"],
  desc:"把飞机与坦克也画进国画：折衷中西不是口号，是一次真的试验。",
  note:"渲染要多、留白要比古人少；这是有意的「不够雅」。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
