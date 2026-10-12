/* ============================================================
 * data-painters-fr1.js —— 法国：古典 · 洛可可 · 新古典 · 写实
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-FR01", status:"written",  zh:"尼古拉·普桑", en:"Nicolas Poussin", life:"1594-1665", mv:"法国古典主义", mvId:"M-08", region:"法国",
  F:{ medium:["oil on canvas"], brush:["restrained deliberate touch"], color:["clear cool scheme"], light:["even daylight"], space:["frieze-like staged depth"], motif:["et in arcadia ego","stoic antiquity"], spirit:["rational stoicism"] },
  sty:["nicolas poussin","french classicism"], tags:["perspective-linear","hard-edge","muted-grey","fine-art-depth"],
  desc:"一切都先想清楚再落笔，人像浅浮雕排开，颜色服从结构。",
  note:"激情必须让位于秩序，画面一乱就不是他。" },

{ id:"P-FR02", status:"written",  zh:"克洛德·洛兰", en:"Claude Lorrain", life:"1600-1682", mv:"古典风景", mvId:"M-08", region:"法国",
  F:{ medium:["oil on canvas"], brush:["soft atmospheric blending"], color:["golden pale distance"], light:["sun inside the picture"], space:["harbour depth receding"], motif:["seaport at sunset","roman campagna"], spirit:["pastoral ideal"] },
  sty:["claude lorrain","ideal landscape"], tags:["natural-daylight","wet-blending","fine-art-depth","muted-grey"],
  desc:"光源就放在画面中央，一切都向那道光退回去。",
  note:"逆光与空气层次是命脉，正面打光会失去那层金色。" },

{ id:"P-FR03", status:"written",  zh:"让-安托万·华托", en:"Antoine Watteau", life:"1684-1721", mv:"洛可可", mvId:"M-07", region:"法国",
  F:{ medium:["oil on red brown ground"], brush:["feathery flicked touch"], color:["silvery pastel drift"], light:["soft park dusk"], space:["clearing receding like a stage"], motif:["embarkation for cythera","costumed lovers"], spirit:["melancholy festivity"] },
  sty:["antoine watteau","fete galante"], tags:["no-outline","wet-blending","muted-grey","fine-art-depth"],
  desc:"盛装的男女在林间谈情，快乐里带着即将结束的预感。",
  note:"那份欲言又止靠灰调支撑，颜色一艳就变装饰画。" },

{ id:"P-FR04", status:"written",  zh:"弗朗索瓦·布歇", en:"Francois Boucher", life:"1703-1770", mv:"洛可可", mvId:"M-07", region:"法国",
  F:{ medium:["oil on pale ground"], brush:["soft rounded modelling"], color:["pink and sky blue"], light:["even shadowless glow"], space:["S curve arrangement"], motif:["bathing diana","court portrait"], spirit:["courtly pleasure"] },
  sty:["francois boucher","rococo"], tags:["wet-blending","no-outline","flat-decoration","fine-art-depth"],
  desc:"神话被放进卧室：皮肤像瓷，云与绸缎都是粉红的装饰。",
  note:"轻盈不如“贵而软”重要，硬边会立刻失真。" },

{ id:"P-FR05", status:"written",  zh:"让-奥诺雷·弗拉戈纳尔", en:"Jean-Honore Fragonard", life:"1732-1806", mv:"洛可可", mvId:"M-07", region:"法国",
  F:{ medium:["oil on canvas"], brush:["swift dynamic marks"], color:["rose and gold"], light:["dappled light through leaves"], space:["unstable tilted layout"], motif:["the swing","the stolen kiss"], spirit:["open frivolity"] },
  sty:["jean-honore fragonard","rococo"], tags:["broad-gesture","oil-impasto","fine-art-depth","flat-decoration"],
  desc:"洛可可的最后狂欢：笔比谁都快，画面围着一瞬的调情转。",
  note:"笔速感必须留出，画得斯文就没有那份浪荡。" },

{ id:"P-FR06", status:"written",  zh:"让·西梅翁·夏尔丹", en:"Jean Simeon Chardin", life:"1699-1779", mv:"静物与风俗", mvId:"M-10", region:"法国",
  F:{ medium:["oil with thick paste"], brush:["quiet layered buildup"], color:["grey brown sediment"], light:["single window light"], space:["minimal tabletop"], motif:["copper pot and dead rabbit","kitchen task"], spirit:["bourgeois dignity"] },
  sty:["jean simeon chardin","quiet still life"], tags:["tiny-detail","muted-grey","fine-art-depth","flat-decoration"],
  desc:"最不张扬的静物：器物被反复看，直到像有了人格。",
  note:"这里没有潇洒笔触，全是慢慢沉积出来的质感。" },

{ id:"P-FR07", status:"written",  zh:"雅克-路易·大卫", en:"Jacques-Louis David", life:"1748-1825", mv:"新古典主义", mvId:"M-08", region:"法国",
  F:{ medium:["oil on canvas"], brush:["hard sculptural edge"], color:["cold limited palette"], light:["clear stage light"], space:["shallow relief line"], motif:["oath of the horatii","death of marat"], spirit:["civic declaration"] },
  sty:["jacques-louis david","neoclassicism"], tags:["hard-edge","line-primary","no-outline","perspective-linear"],
  desc:"道德被画成建筑：线负责说服力，颜色几乎不参与讨论。",
  note:"容不下即兴笔触，一切都要收得干净。" },

{ id:"P-FR08", status:"written",  zh:"让-奥古斯特·多米尼克·安格尔", en:"Jean-Auguste-Dominique Ingres", life:"1780-1867", mv:"新古典主义", mvId:"M-08", region:"法国",
  F:{ medium:["oil with enamel finish"], brush:["line led polish"], color:["cool clarity"], light:["even sculptural light"], space:["very shallow relief"], motif:["grand odalisque","the spring"], spirit:["conservative ideal"] },
  sty:["ingres","neoclassical line"], tags:["line-primary","no-outline","tiny-detail","hard-edge"],
  desc:"线高于一切：脊椎多三节也不要紧，只要那根线走得漂亮。",
  note:"变形是被允许的，但线上的严谨必须守住。" },

{ id:"P-FR09", status:"written",  zh:"欧仁·德拉克洛瓦", en:"Eugene Delacroix", life:"1798-1863", mv:"浪漫主义", mvId:"M-09", region:"法国",
  F:{ medium:["oil on rubbed ground"], brush:["flowing energetic stroke"], color:["complementary flames"], light:["conflicting violent keys"], space:["diagonal surge"], motif:["liberty leading the people","barque of dante"], spirit:["political passion"] },
  sty:["eugene delacroix","french romanticism"], tags:["broad-gesture","saturated-clash","chiaroscuro-volume","fine-art-depth"],
  desc:"笔自己在奔跑：补色并置点燃情绪，连地面都在倾斜。",
  note:"要有力量与脏劲，干干净净就不是浪漫主义。" },

{ id:"P-FR10", status:"written",  zh:"让-弗朗索瓦·米勒", en:"Jean-Francois Millet", life:"1814-1875", mv:"巴比松与写实", mvId:"M-10", region:"法国",
  F:{ medium:["oil and later pastel"], brush:["plain square brush"], color:["earthy dark ochre"], light:["last light of dusk"], space:["horizon pressed low"], motif:["the gleaners","the angelus"], spirit:["labour dignity"] },
  sty:["jean-francois millet","barbizon realism"], tags:["broad-gesture","muted-grey","natural-daylight","fine-art-depth"],
  desc:"农民占据了宗教画的位置，弯腰的姿态被黄昏镀上纪念碑感。",
  note:"不要美化也不用怜悯，庄严来自姿势本身。" },

{ id:"P-FR11", status:"written",  zh:"让-巴蒂斯特·柯罗", en:"Jean-Baptiste-Camille Corot", life:"1796-1875", mv:"巴比松", mvId:"M-10", region:"法国",
  F:{ medium:["thinly layered oil"], brush:["feathery tree touch"], color:["silver grey harmony"], light:["morning evaporating mist"], space:["open low horizon"], motif:["fontainebleau trees","nymph at dawn"], spirit:["poetic nature"] },
  sty:["corot","barbizon"], tags:["wet-blending","muted-grey","natural-daylight","minimal-empty"],
  desc:"最会画树的银灰：轮廓泡在晨雾里，几乎是梦。",
  note:"银灰要有层次，画成普通的灰就废了。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
