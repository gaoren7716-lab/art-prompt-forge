/* ============================================================
 * data-painters-modern.js —— 插画 · 概念设计 · 数字当代
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-MD01", status:"written",  zh:"阿尔丰斯·穆夏", en:"Alphonse Mucha", life:"1860-1939", mv:"新艺术运动", mvId:"M-15", region:"捷克",
  F:{ medium:["poster lithograph with gold"], brush:["whip lash arabesque"], color:["soft earthy pastel with gold"], light:["even decorative"], space:["frame-integrated flat field"], motif:["theatre posters","flower crowned woman"], spirit:["ornamental idealism"] },
  sty:["alphonse mucha","art nouveau poster"], tags:["line-primary","flat-decoration","hyper-ornament","gold-ground","commercial-poster"],
  desc:"装饰首先服务于版面：曲线像烟火一样从人物周围长出来。",
  note:"厚度与光影要克制，做出浮雕感就偏离了这种印刷美学。" },

{ id:"P-MD02", status:"written",  zh:"奥布里·比亚兹莱", en:"Aubrey Beardsley", life:"1872-1898", mv:"世纪末黑白", mvId:"M-15", region:"英国",
  F:{ medium:["indian ink line art"], brush:["brutal black and white balance"], color:["black white only"], light:["masses of dark"], space:["flat symbolic stage"], motif:["salome illustrations","fallen dandy"], spirit:["decadent provocation"] },
  sty:["aubrey beardsley","fin de siecle line"], tags:["monochrome-ink","hard-edge","flat-print","minimal-empty","hyper-ornament"],
  desc:"只用黑白：大面积的黑压住极度精细的装饰线，色情与讥讽并存。",
  note:"不要上色，一旦加了颜色就失去那种刀锋般的对比。" },

{ id:"P-MD03", status:"written",  zh:"凯·尼尔森", en:"Kay Nielsen", life:"1886-1957", mv:"黄金时代童书插画", mvId:"M-15", region:"丹麦",
  F:{ medium:["watercolour with decorative line"], brush:["fine Japanese influenced line"], color:["jewel tones on pale ground"], light:["even illustration light"], space:["flat panel blocks"], motif:["east of the sun west of the moon"], spirit:["nordic fairytale"] },
  sty:["kay nielsen","golden age illustration"], tags:["line-primary","flat-decoration","polychrome-full","gold-ground"],
  desc:"日本木版的平面感，加上新艺术那套装饰线，一起搬进北欧神话里。",
  note:"平面色块与装饰线要同时存在，一旦追求体积就散了。" },

{ id:"P-MD04", status:"written",  zh:"伊万·比利宾", en:"Ivan Bilibin", life:"1876-1942", mv:"俄罗斯金银时代插画", mvId:"M-15", region:"俄国",
  F:{ medium:["watercolour with ink contour"], brush:["strict folk ornament outline"], color:["saturated folk palette"], light:["none"], space:["theatre-like patterned depth"], motif:["russian fairy tales","firebird"], spirit:["architectural folklore"] },
  sty:["ivan bilibin","russian lubok revival"], tags:["line-primary","hyper-ornament","flat-decoration","perspective-flat"],
  desc:"一切都像剪纸做的舞台：民间纹样包住每一棵树与每一座塔的轮廓。",
  note:"装饰纹样必须完整，简化会直接变成普通童话插图。" },

{ id:"P-MD05", status:"written",  zh:"弗兰克·弗雷泽塔", en:"Frank Frazetta", life:"1928-2010", mv:"奇幻插画", mvId:"M-37", region:"美国",
  F:{ medium:["oil on board"], brush:["muscular loaded modelling"], color:["hot flesh against jungle green"], light:["dramatic torch and moon"], space:["heroic dynamic diagonal"], motif:["conan covers","death dealer"], spirit:["raw physical fantasy"] },
  sty:["frank frazetta","sword and sorcery"], tags:["oil-impasto","chiaroscuro-volume","fine-art-depth","broad-gesture"],
  desc:"肌肉、皮毛与湿空气都被画得极具体：奇幻第一次有了身体的重量。",
  note:"厚重的笔法和强光源缺一不可，画平了就失去那种野性。" },

{ id:"P-MD06", status:"written",  zh:"墨比斯", en:"Moebius", life:"1938-2012", mv:"欧洲科幻线描", mvId:"M-36", region:"法国",
  F:{ medium:["ink line with flat colour"], brush:["precise hatching and clear line"], color:["desert tints and muted"], light:["flat bright honesty"], space:["endless wide horizon"], motif:["artech desert frontier","airtight garage"], spirit:["calm absurdity"] },
  sty:["moebius","metabarons fortress"], tags:["line-primary","flat-decoration","hard-edge","minimal-empty","perspective-flat"],
  desc:"干净到无可挑剔的线加上辽阔的荒原：科幻可以一点也不吵。",
  note:"排线要匀、留白要多，厚涂会立刻毁掉那种空气的透明度。" },

{ id:"P-MD07", status:"written",  zh:"西德·米德", en:"Syd Mead", life:"1933-2019", mv:"未来主义工业设计", mvId:"M-36", region:"美国",
  F:{ medium:["gouache and marker renderings"], brush:["clean industrial airbrush"], color:["optimistic metallic"], light:["hard specular highlights"], space:["heroic product perspective"], motif:["blade runner streets","future car-scale"], spirit:["retro future optimism"] },
  sty:["syd mead","futurist industrial design"], tags:["digital-clean","hard-edge","aged-decay","perspective-linear"],
  desc:"未来是被工程师画出来的：透视精确、材料可信、生活感在场。",
  note:"产品的形态逻辑优先，锈蚀与脏污要克制使用。" },

{ id:"P-MD08", status:"written",  zh:"H.R. 吉格尔", en:"H.R. Giger", life:"1940-2014", mv:"生物机械", mvId:"M-23", region:"瑞士",
  F:{ medium:["airbrush acrylic on board"], brush:["seamless biomechanoid blend"], color:["bone grey and black"], light:["cold raking highlight"], space:["claustrophobic tunnel"], motif:["necronom design"], spirit:["erotic dread"] },
  sty:["h.r. giger","biomechanical surrealism"], tags:["photographic","monochrome-ink","fine-art-depth","embossed-relief"],
  desc:"机械与骨肉同体：过渡必须光滑到看不出任何笔触。",
  note:"不能有笔触，画到像照片那样冷才成立。" },

{ id:"P-MD09", status:"written",  zh:"克雷格·穆林斯", en:"Craig Mullins", life:"1965-", mv:"概念设景", mvId:"M-38", region:"美国",
  F:{ medium:["digital painting with photo textures"], brush:["loaded painterly digital"], color:["value-first filmic palette"], light:["cinematic atmospheric depth"], space:["layered establishing shot"], motif:["stark mass futureism sand"], spirit:["production-ready atmosphere"] },
  sty:["craig mullins","concept matte painting"], tags:["digital-clean","painterly-stroke","fine-art-depth","natural-daylight"],
  desc:"先用大色块定住整体关系，再一点点把细节磨出来：一张图就是整场戏。",
  note:"大气层的层次要清楚，一味加细节会变成平庸的华丽。" },

{ id:"P-MD10", status:"written",  zh:"西蒙·斯塔伦哈格", en:"Simon Stalenhag", life:"1984-", mv:"废墟中的日常", mvId:"M-38", region:"瑞典",
  F:{ medium:["digital oil simulation"], brush:["soft naturalistic stroke"], color:["nordic dusk blue"], light:["low golden or snow-glow"], space:["ordinary space next to the enormous"], motif:["robot in the field","children and mech"], spirit:["quiet rural dystopia"] },
  sty:["simon stalenhag","nordic retro future"], tags:["digital-clean","fine-art-depth","natural-daylight","muted-grey"],
  desc:"巨大的机械停在瑞典的乡间：孩子照常骑车，天色照常变蓝。",
  note:"日常感是关键，画面太戏剧化就失去那份沉默。" },

{ id:"P-MD11", status:"written",  zh:"天野喜孝", en:"Yoshitaka Amano", life:"1952-", mv:"日式奇幻线描", mvId:"M-15", region:"日本",
  F:{ medium:["watercolour ink and later acrylic"], brush:["floating hairline and gold washes"], color:["muted pearl with gold accents"], light:["no cast shadow"], space:["weightless decorative void"], motif:["final fantasy character","vampire hunter d"], spirit:["decadent lyricism"] },
  sty:["yoshitaka amano","final fantasy art"], tags:["line-primary","flat-decoration","gold-ground","polychrome-full","perspective-flat"],
  desc:"一根线能飘很远：金色的洗、空白的背景，人物像云一样浮着。",
  note:"必须保留装饰感与平面性，画成厚实的体积就错了。" },

{ id:"P-MD12", status:"written",  zh:"空山基", en:"Hajime Sorayama", life:"1947-", mv:"超写实金属", mvId:"M-27", region:"日本",
  F:{ medium:["airbrush acrylic on board"], brush:["flawless chrome rendering"], color:["chrome on monochrome"], light:["specular reflections carry form"], space:["simple iconic silhouette"], motif:["sexy robot pin-up"], spirit:["fetishistic futurism"] },
  sty:["hajime sorayama","sex robot chrome"], tags:["photographic","no-outline","hard-edge","digital-clean"],
  desc:"镀铬的身体与环境的镜像：全部形体由反光交代。",
  note:"笔触必须为零，任何痕迹都会破坏镀铬的错觉。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
