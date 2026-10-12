/* ============================================================
 * data-painters-north.js —— 德语地区与北欧：浪漫主义到现代
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-NO01", status:"written",  zh:"卡斯帕·大卫·弗里德里希", en:"Caspar David Friedrich", life:"1774-1840", mv:"德国浪漫主义", mvId:"M-09", region:"德国",
  F:{ medium:["oil on canvas"], brush:["thin precise application","hard silhouette edge"], color:["cold electrum palette"], light:["backlit diffused glow"], space:["figure seen from behind at edge"], motif:["wanderer above the sea of fog","abbey in the oakwood","sea of ice"], spirit:["pantheist solitude"] },
  sty:["caspar david friedrich","german romanticism"], tags:["hard-edge","flat-decoration","minimal-empty","muted-grey"],
  desc:"人的背影站在巨大的自然之前：视线被安排成与观众同一方向，庄子式的沉默。",
  note:"背影一定要小，前景一旦变成主角，那种崇高空无的感觉就消失。" },

{ id:"P-NO02", status:"written",  zh:"爱德华·蒙克", en:"Edvard Munch", life:"1863-1944", mv:"表现主义", mvId:"M-17", region:"挪威",
  F:{ medium:["oil and tempera on board"], brush:["wide wavering swaths","scraped and let it bleed"], color:["acid anxious hues"], light:["no explanation at all"], space:["tilted claustrophobic"], motif:["the scream bridge","vampire embrace","puberty"], spirit:["modern dread"] },
  sty:["edvard munch","expressionism"], tags:["broad-gesture","saturated-clash","perspective-flat","embossed-relief"],
  desc:"线条是心理的震颤：恐惧从桥那头的天空一直灌到这个人的嘴里。",
  note:"心理压力比形体准确重要得多，别纠结透视。" },

{ id:"P-NO03", status:"written",  zh:"古斯塔夫·克里姆特", en:"Gustav Klimt", life:"1862-1918", mv:"维也纳分离派", mvId:"M-32", region:"奥地利",
  F:{ medium:["oil with applied gold leaf"], brush:["ornamental flat pattern","fine modelled face and hands"], color:["black white gold with erotic rose"], light:["no atmospheric depth"], space:["square pattern-field"], motif:["the kiss golden phase","life and death","portrait of adele"], spirit:["fin-de-siecle eroticism"] },
  sty:["gustav klimt","golden phase"], tags:["gold-ground","hyper-ornament","flat-decoration","perspective-flat"],
  desc:"写实的脸与手浮在满铺的金箔图案里，精神与欲望靠材料的奢华说出来。",
  note:"金不靠渐变，靠的是块的对比与裂处的亮。" },

{ id:"P-NO04", status:"written",  zh:"埃贡·席勒", en:"Egon Schiele", life:"1890-1918", mv:"维也纳表现主义", mvId:"M-17", region:"奥地利",
  F:{ medium:["gouache watercolour and charcoal on paper"], brush:["angular line with abuse","dark oranged bruises"], color:["ochre flesh with black"], light:["none"], space:["void with forced posed figure"], motif:["self looking inward","embrace crouching couple"], spirit:["exposed shame and need"] },
  sty:["egon schiele","austrian expressionism"], tags:["line-primary","hard-edge","minimal-empty","perspective-flat"],
  desc:"用一根不漂亮的线把人钉在纸上：关节、擦伤和空白的位置都很准确。",
  note:"不美就是内容，任何柔化与美化都是背叛。" },

{ id:"P-NO05", status:"written",  zh:"保罗·克利", en:"Paul Klee", life:"1879-1940", mv:"包豪斯与现代主义", mvId:"M-21", region:"瑞士",
  F:{ medium:["oil transfer and watercolour on primed gauze"], brush:["linear child-symbol drawing","thread-like lines"], color:["layers glowing through"], light:["none"], space:["constructed non-object depth"], motif:["twittering machine","senecio geometrical face"], spirit:["childlike luminosity"] },
  sty:["paul klee","bauhaus modern"], tags:["line-primary","minimal-empty","flat-decoration","polychrome-full"],
  desc:"格局极小的结构与极淡的光：一根线会走成城市，颜色从底下透上来。",
  note:"那种手工与稚拙并存的质感要留住，粗重的厚涂会毁掉他。" },

{ id:"P-NO06", status:"written",  zh:"恩斯特·路德维希·基希纳", en:"Ernst Ludwig Kirchner", life:"1880-1938", mv:"桥社表现主义", mvId:"M-17", region:"德国",
  F:{ medium:["oil on canvas","painted carved frame"], brush:["angular cut facets","fast grounded strokes"], color:["acid combination never seen in nature"], light:["flat bright"], space:["twisting street disorientation"], motif:["street Berlin street scene","mountain nudes"], spirit:["metropolitan alienation"] },
  sty:["ernst ludwig kirchner","die brucke"], tags:["hard-edge","saturated-clash","perspective-flat","broad-gesture"],
  desc:"城市是斜的：木刻般的切面加上不自然的颜色，现代人既兴奋又令人作呕。",
  note:"颜色必须离自然很远，画得和谐就完全没有桥社的锋利。" },

{ id:"P-NO07", status:"written",  zh:"埃米尔·诺尔德", en:"Emil Nolde", life:"1867-1956", mv:"表现主义", mvId:"M-17", region:"德国",
  F:{ medium:["soaked watercolour and heavy oil"], brush:["wet pooling saturated flow"], color:["violent religious compliments"], light:["none"], space:["all-over field"], motif:["mask still life","sea storms","religious figures"], spirit:["visionary intensity"] },
  sty:["emil nolde","expressionist watercolour"], tags:["ink-aqueous","broad-gesture","saturated-clash","flat-decoration"],
  desc:"水彩被他用到了极限：颜色像不受控制地淌开，连宗教题材也在燃烧。",
  note:"水性与浓度必须同时存在，稀释过度就变成风景明信片。" },

{ id:"P-NO08", status:"written",  zh:"奥托·迪克斯", en:"Otto Dix", life:"1891-1969", mv:"新客观主义", mvId:"M-31", region:"德国",
  F:{ medium:["tempera over oil on panel","disciplined glazed layering"], brush:["shrinkingly precise old-master technique"], color:["cold bilious green"], light:["harsh frontal"], space:["tight merciless framing"], motif:["war cripples","portrait of journalist"], spirit:["cynical documentation"] },
  sty:["otto dix","neue sachlichkeit"], tags:["tiny-detail","hard-edge","no-outline","muted-grey"],
  desc:"用最地道的老技法画最难看的现实：伤残的身体与魏玛的面孔被同样冷冷地记录。",
  note:"技巧要刻意经典，画面只是丑而没有技术含量就不是他。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
