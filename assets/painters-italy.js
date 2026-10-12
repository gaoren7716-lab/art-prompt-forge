/* ============================================================
 * data-painters-italy.js —— 意大利：中世纪末至二十世纪
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-IT01", status:"written",  zh:"乔托", en:"Giotto", life:"1267-1337", mv:"前文艺复兴", mvId:"M-01", region:"意大利",
  F:{ medium:["buon fresco"], brush:["solid economical modelling","few decisive shapes"], color:["lapis blue and rose"], light:["single diffuse source"], space:["shallow stage box"], motif:["lamentation","life of saint francis"], spirit:["new human weight"] },
  sty:["giotto","trecento fresco"], tags:["flat-print","hard-edge","line-primary","aged-decay"],
  desc:"人第一次有了重量：身体结实地坐进地面，衣褶顺着真实的重力垂下。",
  note:"要有墙体与颜料的粉质感，画成布面油画就失去了壁画的强度。" },

{ id:"P-IT02", status:"written",  zh:"马萨乔", en:"Masaccio", life:"1401-1428", mv:"早期文艺复兴", mvId:"M-01", region:"意大利",
  F:{ medium:["fresco with bold preparatory"], brush:["broad sculptural modelling"], color:["austere local colour"], light:["single directed wall light"], space:["consistent perspectival box"], motif:["tribute money","expulsion from eden"], spirit:["gravity and shame"] },
  sty:["masaccio","quattrocento fresco"], tags:["chiaroscuro-volume","perspective-linear","line-primary","aged-decay"],
  desc:"透视第一次被彻底解决：人站进统一的空间，光源只有一个。",
  note:"光源必须统一，多个光源会立刻取消他的空间成就。" },

{ id:"P-IT03", status:"written",  zh:"皮耶罗·德拉·弗兰切斯卡", en:"Piero della Francesca", life:"约1415-1492", mv:"早期文艺复兴", mvId:"M-01", region:"意大利",
  F:{ medium:["tempera and oil on panel"], brush:["immaculate flat planes","suppressed gesture"], color:["pale dawn geometry"], light:["even mathematical clarity"], space:["perfectly measured geometric space"], motif:["resurrection","flagellation","ducal portrait"], spirit:["silent rational order"] },
  sty:["piero della francesca","geometrical renaissance"], tags:["perspective-linear","hard-edge","flat-decoration","muted-grey"],
  desc:"绘画像一份几何答卷：每块空间都被算过，人物静得像凝固住的。",
  note:"表情越少越对，煽情会毁掉那份数学般的宁静。" },

{ id:"P-IT04", status:"written",  zh:"波提切利", en:"Sandro Botticelli", life:"1445-1510", mv:"佛罗伦萨盛期", mvId:"M-02", region:"意大利",
  F:{ medium:["tempera on panel"], brush:["linear arabesque contour","translucent thin drapery"], color:["pale gold and sea green"], light:["no shadow, even glow"], space:["decorative frontal plane"], motif:["birth of venus","primavera","madonna of the pomegranate"], spirit:["melancholy grace"] },
  sty:["botticelli","florentine linear"], tags:["line-primary","flat-decoration","gold-ground","perspective-flat"],
  desc:"线条被组织成音乐：轮廓的流动承担全部美感，几乎不塑造体积。",
  note:"平面与线的优先，加了重投影就把画作向六十年后。" },

{ id:"P-IT05", status:"written",  zh:"曼特尼亚", en:"Andrea Mantegna", life:"约1431-1506", mv:"文艺复兴", mvId:"M-01", region:"意大利",
  F:{ medium:["tempera and fresco"], brush:["hard chiselled modelling","archaeological detail"], color:["stone-like restricted hue"], light:["cool exact light"], space:["extreme foreshortened depth"], motif:["dead christ","camera degli sposi"], spirit:["antiquarian rigor"] },
  sty:["andrea mantegna","paduan"], tags:["hard-edge","perspective-linear","tiny-detail","fine-art-depth"],
  desc:"像雕塑家一样画画：透视压缩到极端，一切都像被凿出来的石头。",
  note:"边缘与细节必须硬朗，过早柔化会失去石刻味。" },

{ id:"P-IT06", status:"written",  zh:"乔瓦尼·贝利尼", en:"Giovanni Bellini", life:"约1430-1516", mv:"威尼斯画派", mvId:"M-03", region:"意大利",
  F:{ medium:["oil on canvas"], brush:["soft fused transition","warm luminous touch"], color:["clear Venetian saturation"], light:["dawn reflected light"], space:["open calm horizon"], motif:["doge portrait","sacred conversation","madonna of the meadow"], spirit:["devotional warmth"] },
  sty:["giovanni bellini","venetian colourito"], tags:["wet-blending","fine-art-depth","natural-daylight","polychrome-full"],
  desc:"威尼斯的色彩从这里开始：油媒能让颜色像被光浸透一样发亮。",
  note:"边缘要柔但不能糊，结构始终要立得住。" },

{ id:"P-IT07", status:"written",  zh:"达·芬奇", en:"Leonardo da Vinci", life:"1452-1519", mv:"盛期文艺复兴", mvId:"M-02", region:"意大利",
  F:{ medium:["oil on panel","experimental varnish"], brush:["sfumato imperceptible transition"], color:["cool restrained glazes"], light:["soft omnidirectional veil"], space:["geological depth with haze"], motif:["last supper","mona lisa","rocky landscape"], spirit:["relentless inquiry"] },
  sty:["leonardo da vinci","high renaissance"], tags:["wet-blending","no-outline","fine-art-depth","muted-grey","atmospheric-distance"],
  desc:"把轮廓交给空气：人从雾里长出来，地质与水流的知识也一起被画进去。",
  note:"笔触必须消失，能看见笔痕就已经不是达·芬奇。" },

{ id:"P-IT08", status:"written",  zh:"米开朗基罗", en:"Michelangelo", life:"1475-1564", mv:"盛期文艺复兴", mvId:"M-02", region:"意大利",
  F:{ medium:["fresco on vault"], brush:["sculptural modelling of the body"], color:["cool resculpted drapery"], light:["even clarity for the anatomies"], space:["architectural bodily grouping"], motif:["creation of adam","last judgement"], spirit:["terrible physicality"] },
  sty:["michelangelo","sistine chapel"], tags:["chiaroscuro-volume","tiny-detail","fine-art-depth","aged-decay"],
  desc:"人不是被画的，是被凿出来的：肌肉的团块组合成建筑。",
  note:"体块优先于色彩，画面一艳就失去那种雕刻的重量。" },

{ id:"P-IT09", status:"written",  zh:"拉斐尔", en:"Raphael", life:"1483-1520", mv:"盛期文艺复兴", mvId:"M-02", region:"意大利",
  F:{ medium:["oil and fresco"], brush:["graceful invisible blending"], color:["harmonious cool and warm"], light:["clear balanced daylight"], space:["stable pyramidal grouping"], motif:["school of athens","sistine madonna"], spirit:["effortless harmony"] },
  sty:["raphael","high renaissance grace"], tags:["wet-blending","perspective-linear","no-outline","polychrome-full"],
  desc:"把一切都摆到恰好的位置：难的东西他画起来像不费力，这是后来学院派的源头。",
  note:"“容易”是最高级的假象，画面出现生硬 x 就失去了这份教养。" },

{ id:"P-IT10", status:"written",  zh:"提香", en:"Titian", life:"约1488-1576", mv:"威尼斯画派", mvId:"M-03", region:"意大利",
  F:{ medium:["oil on canvas","later open painterly layers"], brush:["loaded broken brush","scumbled glow"], color:["golden Venetian saturation"], light:["warm reflected radiance"], space:["loose atmospheric depth"], motif:["bacchanal","penitent mary","late poesie"], spirit:["sensuous mastery"] },
  sty:["titian","late titian"], tags:["painterly-stroke","oil-impasto","fine-art-depth","saturated-clash","atmospheric-distance"],
  desc:"晚年的笔已经松到近乎抽象：颜色在布上互相让位，形体被光吃掉一半。",
  note:"那种“未完成”的松动是最高阶段，别替他补成光滑。" },

{ id:"P-IT11", status:"written",  zh:"丁托列托", en:"Tintoretto", life:"1518-1594", mv:"威尼斯样式主义", mvId:"M-04", region:"意大利",
  F:{ medium:["oil on huge canvas"], brush:["rapid energetic stroke","diagonal torch trajectory"], color:["dark ground with sudden highlights"], light:["supernatural darting sources"], space:["vertiginous deep plunge"], motif:["last supper","finding of the body of mark"], spirit:["theatrical velocity"] },
  sty:["tintoretto","venetian mannerism"], tags:["chiaroscuro-volume","broad-gesture","fine-art-depth","perspective-linear"],
  desc:"把提香的颜色和米开朗基罗的形体推进急速之中：光在乱跑，空间在倾斜。",
  note:"速度感是关键，笔一慢就变成空洞的巨制。" },

{ id:"P-IT12", status:"written",  zh:"帕尔米贾尼诺", en:"Parmigianino", life:"1503-1540", mv:"样式主义", mvId:"M-04", region:"意大利",
  F:{ medium:["oil on panel"], brush:["elongated elegant contour","porcelain surface"], color:["cool iridescent schemes"], light:["soft multiple raking"], space:["compressed distorted space"], motif:["madonna with the long neck","portrait of a young woman"], spirit:["precious artificiality"] },
  sty:["parmigianino","mannerist elegance"], tags:["line-primary","hard-edge","flat-decoration","perspective-flat"],
  desc:"故意把完美比例拉长：脖子、手指、空间都被拉成优雅到不自然的样子。",
  note:"不自然是刻意的，按现实比例修正等于没看懂。" },

{ id:"P-IT13", status:"written",  zh:"布隆齐诺", en:"Bronzino", life:"1503-1572", mv:"佛罗伦萨样式主义", mvId:"M-04", region:"意大利",
  F:{ medium:["oil on panel"], brush:["enamel finished surface","hairline detail"], color:["acid off-key court hues"], light:["cold even illumination"], space:["shallow courtly box"], motif:["eleonora of toledo","allegory of love"], spirit:["courtly impassivity"] },
  sty:["bronzino","florentine court portrait"], tags:["tiny-detail","hard-edge","no-outline","muted-grey"],
  desc:"美第奇宫廷的冷光：脸像瓷，华服与箴言都是冷冰冰的权力道具。",
  note:"冷淡就是内容，加一点温情就失去那种距离感。" },

{ id:"P-IT14", status:"written",  zh:"卡拉瓦乔", en:"Caravaggio", life:"1571-1610", mv:"巴洛克", mvId:"M-05", region:"意大利",
  F:{ medium:["oil on canvas","dark bituminous ground"], brush:["direct loaded modelling","few embossed highlights"], color:["earth ground with one hot accent"], light:["single raking cell light"], space:["shallow table-top depth"], motif:["calling of matthew","doubting thomas","boy with fruit"], spirit:["brutal physical truth"] },
  sty:["caravaggio","tenebrism"], tags:["chiaroscuro-volume","oil-impasto","fine-art-depth","hard-edge"],
  desc:"光是从地窖上方斜插进来的：圣徒和乞丐用同一双手，被光照到就无法隐藏。",
  note:"暗部必须暗到底，中间灰一多就退回普通学院派。" },

{ id:"P-IT15", status:"written",  zh:"提埃波罗", en:"Giovanni Battista Tiepolo", life:"1696-1770", mv:"洛可可巨制", mvId:"M-07", region:"意大利",
  F:{ medium:["fresco on ceiling"], brush:["airy silvery stroke","sky-filled licensing"], color:["pastel celestial palette"], light:["open sky illumination"], space:["di sotto in su illusion"], motif:["allegory fresco","Antony and Cleopatra ceilings"], spirit:["grandiose lightness"] },
  sty:["giovanni battista tiepolo","roof fresco"], tags:["wet-blending","muted-grey","fine-art-depth","flat-decoration"],
  desc:"最后一次伟大的天花板幻觉：一切都浮在淡蓝的天上，轻得像不费力。",
  note:"仰角透视必须存在，否则那整片天空就塌到地面。" },

{ id:"P-IT16", status:"written",  zh:"莫兰迪", en:"Giorgio Morandi", life:"1890-1964", mv:"现代静物", mvId:"M-30", region:"意大利",
  F:{ medium:["oil on canvas","delicate thin layers"], brush:["almost invisible hesitation","dusty softened edge"], color:["greyed earth tone harmonies"], light:["diffuse quiet light"], space:["bottles clustered like skyline"], motif:["bottles and vessels","repeated still life"], spirit:["monastic repetition"] },
  sty:["giorgio morandi","metaphysical still life"], tags:["muted-grey","flat-decoration","minimal-empty","tiny-detail"],
  desc:"一辈子画那几个瓶子：纯度全体下调，靠微小的差别撑起一整个世界。",
  note:"灰要有温度，画脏或画冷都不是他那层柔尘。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
