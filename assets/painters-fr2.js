/* ============================================================
 * data-painters-fr2.js —— 法国：印象派到野兽派
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-FR12", status:"written",  zh:"爱德华·马奈", en:"Edouard Manet", life:"1832-1883", mv:"现代性开端", mvId:"M-11", region:"法国",
  F:{ medium:["oil on canvas"], brush:["flat rapid touches"], color:["black with strong accents"], light:["front studio-like light"], space:["shallow flattened stages"], motif:["olympia","bar at the folies-bergere"], spirit:["cool modernity"] },
  sty:["edouard manet","modern life painting"], tags:["flat-decoration","hard-edge","flat-print","muted-grey"],
  desc:"现代绘画的第一记耳光：明暗被压平，画中人的目光毫无歉意。",
  note:"中间调尽量少，黑色要敢用，一加过渡就退回沙龙。" },

{ id:"P-FR13", status:"written",  zh:"克劳德·莫奈", en:"Claude Monet", life:"1840-1926", mv:"印象派", mvId:"M-11", region:"法国",
  F:{ medium:["oil on light ground"], brush:["broken dry touch"], color:["violet shadow no black"], light:["observed changing daylight"], space:["no horizon line"], motif:["haystacks series","water lilies pond"], spirit:["optical immediacy"] },
  sty:["claude monet","impressionism"], tags:["painterly-stroke","no-outline","flat-decoration","natural-daylight"],
  desc:"同一个草垛画三十次：他要画的不是草垛，是光。",
  note:"黑色与灰色应当退场，暗部改用紫色来承担。" },

{ id:"P-FR14", status:"written",  zh:"皮埃尔-奥古斯特·雷诺阿", en:"Pierre-Auguste Renoir", life:"1841-1919", mv:"印象派", mvId:"M-11", region:"法国",
  F:{ medium:["oil on canvas"], brush:["soft iridescent touches"], color:["warm skin against blue shadow"], light:["dappled sunlight"], space:["happy crowded closeness"], motif:["moulin de la galette","bathers"], spirit:["sensual pleasure"] },
  sty:["pierre-auguste renoir","impressionism"], tags:["painterly-stroke","wet-blending","natural-daylight","saturated-clash"],
  desc:"光斑落在皮肤与裙子上：他把印象派转向甜美、肉感与愉悦。",
  note:"要保留笔触的柔软，一旦画平就失去皮肤的呼吸。" },

{ id:"P-FR15", status:"written",  zh:"埃德加·德加", en:"Edgar Degas", life:"1834-1917", mv:"印象派别支", mvId:"M-11", region:"法国",
  F:{ medium:["oil pastel monotype"], brush:["drawn tense line"], color:["theatre artificial light"], light:["footlights and side windows"], space:["japanese influenced cropping"], motif:["dancer rehearsing","milliners","absinthe drinkers"], spirit:["disenchanted observation"] },
  sty:["edgar degas","modern figure"], tags:["flat-decoration","cropped-depth","line-primary","hard-edge"],
  desc:"他讨厌画户外：把人物放在舞台与阁楼中，用版画的裁切冷眼观看。",
  note:"构图可以切得很难看，这是刻意的观察方式。" },

{ id:"P-FR16", status:"written",  zh:"保罗·塞尚", en:"Paul Cezanne", life:"1839-1906", mv:"后印象派", mvId:"M-13", region:"法国",
  F:{ medium:["oil on canvas"], brush:["constructive parallel strokes"], color:["modulated local planes"], light:["colour builds volume"], space:["tilted multi-viewpoint"], motif:["mont sainte-victoire","bowl and apples"], spirit:["structural patience"] },
  sty:["paul cezanne","post-impressionism"], tags:["hard-edge","perspective-flat","flat-decoration","natural-daylight"],
  desc:"用一小片一小片的颜色把自然重新建成建筑：透视可以歪，结构必须稳。",
  note:"每一笔都要有方向，乱摆的笔触会破坏结构。" },

{ id:"P-FR17", status:"written",  zh:"乔治·修拉", en:"Georges Seurat", life:"1859-1891", mv:"新印象派", mvId:"M-12", region:"法国",
  F:{ medium:["oil on canvas"], brush:["regular dot touches"], color:["scientific complement grid"], light:["luminance without black"], space:["measured intervals"], motif:["sunday afternoon island","circus parade"], spirit:["methodical calm"] },
  sty:["georges seurat","pointillism"], tags:["tiny-detail","hard-edge","flat-print","natural-daylight"],
  desc:"把看热闹的人群画成庄严的浮雕：每一个点都预先算过。",
  note:"点必须服从密度节奏，散乱的点只会糊成噪点。" },

{ id:"P-FR18", status:"written",  zh:"保罗·高更", en:"Paul Gauguin", life:"1848-1903", mv:"后印象派", mvId:"M-13", region:"法国",
  F:{ medium:["oil on coarse canvas"], brush:["flat closed colour areas"], color:["arbitrary symbolist hue"], light:["no modelled shadow"], space:["flattened cloisonne planes"], motif:["breton calvary","tahitian figures"], spirit:["exotic escape"] },
  sty:["paul gauguin","synthetism"], tags:["flat-decoration","hard-edge","saturated-clash","perspective-flat"],
  desc:"用色块圈住形状：颜色不再解释可见世界，只服务情绪与象征。",
  note:"暗跃的粗黑轮廓是必需；一加体积就失去了那份原始感。" },

{ id:"P-FR19", status:"written",  zh:"亨利·德·图卢兹-劳特累克", en:"Henri de Toulouse-Lautrec", life:"1864-1901", mv:"海报与夜生活", mvId:"M-15", region:"法国",
  F:{ medium:["oil on cardboard poster lithograph"], brush:["loose vermiculated line"], color:["gaslight artificial palette"], light:["night club lighting"], space:["poster flatness with cropped figures"], motif:["moulin rouge dancer","cabaret singer"], spirit:["blase compassion"] },
  sty:["toulouse-lautrec","poster art"], tags:["line-primary","flat-print","commercial-poster","hard-edge"],
  desc:"把蒙马特的夜生活做成海报：扭动的线条加苍白的人工灯光。",
  note:"版画的错版感可以留着，太精致反而失真。" },

{ id:"P-FR20", status:"written",  zh:"奥迪隆·雷东", en:"Odilon Redon", life:"1840-1916", mv:"象征主义", mvId:"M-14", region:"法国",
  F:{ medium:["charcoal and pastel later oil"], brush:["soft blurred edge"], color:["black ground with jewel pastel"], light:["inner glow from nowhere"], space:["floating dream ground"], motif:["closed eye balloon","cyclops"], spirit:["silent nightmare"] },
  sty:["odilon redon","symbolism"], tags:["flat-decoration","minimal-empty","muted-grey","no-outline"],
  desc:"从黑色时期的木炭画到晚年粉色的梦：闭着的眼睛浮在空中。",
  note:"光源不许解释清楚，一落实就变成奇幻插画。" },

{ id:"P-FR21", status:"written",  zh:"亨利·卢梭", en:"Henri Rousseau", life:"1844-1910", mv:"素人艺术", mvId:"M-23", region:"法国",
  F:{ medium:["oil on canvas"], brush:["flat naive layering"], color:["quiet green and tropical tones"], light:["equal illumination everywhere"], space:["stacked leaf-by-leaf depth"], motif:["sleeping gypsy","jungle with tiger"], spirit:["ingenuous wonder"] },
  sty:["henri rousseau","naive art"], tags:["flat-decoration","hyper-ornament","perspective-flat","polychrome-full"],
  desc:"一位关税员自学出来的丛林：每一片叶子都被认真描出来，比真的更密。",
  note:"透视与比例都可以不准，那种郑重其事的认真才是核心。" },

{ id:"P-FR22", status:"written",  zh:"亨利·马蒂斯", en:"Henri Matisse", life:"1869-1954", mv:"野兽派", mvId:"M-18", region:"法国",
  F:{ medium:["oil later gouache cut outs"], brush:["confident sweeping stroke"], color:["pure expression over description"], light:["colour supplies light"], space:["flat decorative arabesque"], motif:["open window collioure","dance","paper cut blue nude"], spirit:["joyful equilibrium"] },
  sty:["henri matisse","fauvism"], tags:["flat-decoration","saturated-clash","hard-edge","perspective-flat"],
  desc:"颜色彻底从再现中解放：房间与女孩主要靠阿拉伯纹样的节奏组织。",
  note:"雕塑性阴影必须去掉，体积一出现就回到古典。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
