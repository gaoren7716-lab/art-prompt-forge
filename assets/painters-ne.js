/* ============================================================
 * data-painters-ne.js —— 尼德兰 · 佛兰德斯 · 德语地区（文艺复兴至巴洛克）
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-NE01", status:"written",  zh:"扬·凡·艾克", en:"Jan van Eyck", life:"约1390-1441", mv:"北方文艺复兴", mvId:"M-01", region:"尼德兰",
  F:{ medium:["oil glazes on oak panel"], brush:["microscopic blending","glazed optical depth"], color:["saturated symbolic local colour"], light:["diffuse clear daylight"], space:["measured interior perspective"], motif:["arnolfini double portrait","ghent altarpiece"], spirit:["witnessed material truth"] },
  sty:["jan van eyck","northern renaissance"], tags:["tiny-detail","wet-blending","fine-art-depth","perspective-linear"],
  desc:"油画的第一座高峰：每一件器物的物质都被交代到能辨认材质的地步。",
  note:"细节要密而清，画糊失去了他那层玻璃般的罩染。" },

{ id:"P-NE02", status:"written",  zh:"罗希尔·范德魏登", en:"Rogier van der Weyden", life:"约1400-1464", mv:"北方文艺复兴", mvId:"M-01", region:"尼德兰",
  F:{ medium:["oil on oak panel"], brush:["tense linear contour","sharp modelling"], color:["deep restricted reds and blues"], light:["even unshadowed clarity"], space:["shallow relief-like stage"], motif:["descent from the cross","donor portraits"], spirit:["intensified grief"] },
  sty:["rogier van der weyden","flemish primitives"], tags:["line-primary","hard-edge","flat-decoration","perspective-flat"],
  desc:"把宗教情感压到最紧：人物像浅浮雕一样被推到画面最前面。",
  note:"情绪体现在线条的紧绷，光怪陆离的环境会分散注意力。" },

{ id:"P-NE03", status:"written",  zh:"汉斯·梅姆林", en:"Hans Memling", life:"约1430-1494", mv:"北方文艺复兴", mvId:"M-01", region:"尼德兰",
  F:{ medium:["oil on panel"], brush:["serene smooth modelling"], color:["gentle harmonised hues"], light:["soft even light"], space:["balanced quiet depth"], motif:["virgin among the saints","portrait against landscape"], spirit:["calm devotional order"] },
  sty:["hans memling","flemish primitives"], tags:["wet-blending","tiny-detail","muted-grey","fine-art-depth"],
  desc:"范德魏登的紧张在他手里被抚平：一样的精细，情绪却安静得多。",
  note:"宁可与克制是关键词，夸张的处理会立刻失真。" },

{ id:"P-NE04", status:"written",  zh:"希罗尼穆斯·博斯", en:"Hieronymus Bosch", life:"约1450-1516", mv:"北方奇想", mvId:"M-23", region:"尼德兰",
  F:{ medium:["oil on panel"], brush:["fine scurrying detail","thin oil layers"], color:["sickly jewel hues"], light:["uneven fires and strange glows"], space:["panoramic crowded hellscape"], motif:["garden of earthly delights","hybrid monsters","temptation of antony"], spirit:["moral panic and wit"] },
  sty:["hieronymus bosch","hellscape painting"], tags:["tiny-detail","hyper-ornament","fine-art-depth","saturated-clash"],
  desc:"把生物全部杂交成通往地狱的图景：一句解说也没有，寓意只能靠细节读出来。",
  note:"细节密度等于寓意密度，简化会把整套符号系统读没了。" },

{ id:"P-NE05", status:"written",  zh:"老彼得·勃鲁盖尔", en:"Pieter Bruegel the Elder", life:"约1525-1569", mv:"北方风俗", mvId:"M-10", region:"尼德兰",
  F:{ medium:["oil on panel"], brush:["small evenly dotted touch"], color:["earth palette with one red"], light:["high cold winter light"], space:["raised panoramic viewpoint"], motif:["hunters in the snow","peasant wedding","tower of babel"], spirit:["proverb made visible"] },
  sty:["pieter bruegel the elder","genre panorama"], tags:["tiny-detail","fine-art-depth","natural-daylight","line-primary"],
  desc:"俯视整个村子：前景被人世的一切填满，忍耐与笑话同时存在。",
  note:"俯视角是必要条件，画面一平就失去那种“世界地图”的观感。" },

{ id:"P-NE06", status:"written",  zh:"阿尔布雷希特·丢勒", en:"Albrecht Durer", life:"1471-1528", mv:"德国文艺复兴", mvId:"M-01", region:"德国",
  F:{ medium:["oil panel and burin engraving"], brush:["precise engraved hatch","gothic linear control"], color:["sober northern palette"], light:["clear directional"], space:["theoretically constructed"], motif:["self portrait","knight death and devil","melancholia"], spirit:["northern self-scrutiny"] },
  sty:["albrecht durer","northern printmaker"], tags:["line-primary","tiny-detail","hard-edge","monochrome-ink"],
  desc:"把意大利的人体比例带过阿尔卑斯：北方版画式的精密加上哥特式的不安。",
  note:"结构性线痕要保留，过度柔和会失去他的冷峻。" },

{ id:"P-NE07", status:"written",  zh:"马蒂亚斯·格吕内瓦尔德", en:"Matthias Grunewald", life:"约1470-1528", mv:"德国晚期哥特", mvId:"M-05", region:"德国",
  F:{ medium:["oil on panel"], brush:["distorted gothic line","acid expressionist colour"], color:["poisonous green and crimson"], light:["supernatural multiple sources"], space:["flat hieratic scale"], motif:["isenheim altarpiece crucifixion"], spirit:["physicalised suffering"] },
  sty:["matthias grunewald","late gothic"], tags:["chiaroscuro-volume","saturated-clash","hard-edge","perspective-flat"],
  desc:"最德国的德国画：基督的身体是被病痛啃过的，颜色也带着毒。",
  note:"痛苦必须是生理意义上的真实，美化就完全错了。" },

{ id:"P-NE08", status:"written",  zh:"小汉斯·荷尔拜因", en:"Hans Holbein the Younger", life:"约1497-1543", mv:"北方肖像", mvId:"M-01", region:"德国",
  F:{ medium:["oil on panel"], brush:["immovable precise contour","enamel finish"], color:["restrained court blacks and greens"], light:["even daylight falloff"], space:["shallow authoritative space"], motif:["henry viii portrait","ambassadors","the dance of death"], spirit:["detached factual report"] },
  sty:["hans holbein the younger","court portrait"], tags:["tiny-detail","hard-edge","no-outline","flat-decoration"],
  desc:"把一个人记录到不可辩驳：织物、象征物、相貌都精确到像判决书。",
  note:"冷静到近乎无情，加任何气氛渲染都会弱化成第二等级。" },

{ id:"P-NE09", status:"written",  zh:"老卢卡斯·克拉纳赫", en:"Lucas Cranach the Elder", life:"1472-1553", mv:"德国宗教改革", mvId:"M-01", region:"德国",
  F:{ medium:["oil on panel"], brush:["precious thin line","flat enamelled modelling"], color:["acid local and black ground"], light:["even frontal"], space:["narrow courtly stage"], motif:["activating nude with elongated body","reformation allegory"], spirit:["ironic moralising"] },
  sty:["lucas cranach the elder","reformation painter"], tags:["line-primary","hard-edge","flat-decoration","perspective-flat"],
  desc:"细线上的冷艳裸女与宗教改革讽刺同时出自他的工作室——商业与信仰兼具。",
  note:"那种略带冷淡的挑逗要靠纤细的线，别加体积。" },

{ id:"P-NE10", status:"written",  zh:"彼得·保罗·鲁本斯", en:"Peter Paul Rubens", life:"1577-1640", mv:"巴洛克", mvId:"M-05", region:"佛兰德斯",
  F:{ medium:["oil on canvas with pale ground"], brush:["sweeping fluent flesh modelling","iridescent touch"], color:["warm rose and bluish shadow"], light:["multi-source radiant"], space:["diagonal baroque whirl"], motif:["descent from the cross","hunt scenes","allegory of war"], spirit:["generous physical energy"] },
  sty:["peter paul rubens","flemish baroque"], tags:["oil-impasto","broad-gesture","fine-art-depth","saturated-clash"],
  desc:"一切都在转动、撬动、撞动：身体是有温度的，颜色在皮上流动。",
  note:"重量与动势是关键，瘦和静都不是他的语言。" },

{ id:"P-NE11", status:"written",  zh:"安东尼·凡·代克", en:"Anthony van Dyck", life:"1599-1641", mv:"巴洛克肖像", mvId:"M-05", region:"佛兰德斯",
  F:{ medium:["oil on canvas"], brush:["fluent long drapery stroke","elegant abbreviated hand"], color:["silvery grey and rich silk"], light:["soft directed court light"], space:["raised viewpoint from below"], motif:["charles i hunting","genoese nobility"], spirit:["aristocratic nonchalance"] },
  sty:["anthony van dyck","courtly baroque portrait"], tags:["painterly-stroke","fine-art-depth","muted-grey","wet-blending"],
  desc:"英国贵族肖像的标准由此确立：略高的视角、垂落的绸缎、冷淡的优雅。",
  note:"姿态的松弛是精心算过的，衣纹的运笔必须流畅。" },

{ id:"P-NE12", status:"written",  zh:"伦勃朗", en:"Rembrandt van Rijn", life:"1606-1669", mv:"荷兰黄金时代", mvId:"M-06", region:"尼德兰",
  F:{ medium:["oil on canvas","rough loaded impasto later"], brush:["thick embossed highlight","scratched dark with brush handle"], color:["golden brown and lead white"], light:["single sourced golden darkness"], space:["shallow stage with dark void"], motif:["night watch","self portraits","prodigal son return"], spirit:["interior fragility"] },
  sty:["rembrandt","dutch golden age"], tags:["chiaroscuro-volume","oil-impasto","embossed-relief","fine-art-depth"],
  desc:"光从黑暗里把人捞出来：晚年的颜料厚到可以用指甲刻出手指的高光。",
  note:"暗部要有空气，涂成死黑就失去他那层金色的呼吸。" },

{ id:"P-NE13", status:"written",  zh:"弗兰斯·哈尔斯", en:"Frans Hals", life:"约1582-1666", mv:"荷兰黄金时代", mvId:"M-06", region:"尼德兰",
  F:{ medium:["oil on canvas"], brush:["loose rapid wet-in-wet","unblended decisive marks"], color:["black white with civic accents"], light:["window light from one side"], space:["close informal framing"], motif:["laughing cavalier","civic guard group","fisherboy"], spirit:["civic immediacy"] },
  sty:["frans hals","loose portrait"], tags:["painterly-stroke","broad-gesture","fine-art-depth","hard-edge"],
  desc:"在颜料还没干的时候一挥而就：笑容只存在一瞬间，笔必须快到抓得住。",
  note:"笔要留痕才够奔放，修补平整之后就失去那份生动。" },

{ id:"P-NE14", status:"written",  zh:"约翰内斯·维米尔", en:"Johannes Vermeer", life:"1632-1675", mv:"荷兰黄金时代", mvId:"M-06", region:"尼德兰",
  F:{ medium:["oil on canvas on thin ground"], brush:["pointille light dabs","suppressed transitions"], color:["lapis and lead-tin yellow","warm-cool balance"], light:["window light with pearly glow"], space:["ordered domestic box"], motif:["milkmaid","girl with a pearl earring","allegory of painting"], spirit:["suspended stillness"] },
  sty:["johannes vermeer","delft interior"], tags:["photographic","natural-daylight","tiny-detail","flat-decoration"],
  desc:"黄蓝两色加上窗边的柔光：连时间一起被保存下来的房间。",
  note:"高光的珍珠点与整体的静谧缺一不可，笔一跳就散。" },

{ id:"P-NE15", status:"written",  zh:"雅各布·范·雷斯达尔", en:"Jacob van Ruisdael", life:"约1628-1682", mv:"荷兰风景", mvId:"M-06", region:"尼德兰",
  F:{ medium:["oil on canvas"], brush:["leafy detailed touch","broad cloud modelling"], color:["green earth and silver sky"], light:["low light breaking through clouds"], space:["horizon pushed low under huge sky"], motif:["windmill on the river","jewish cemetery","waterfall"], spirit:["melancholy grandeur"] },
  sty:["jacob van ruisdael","dutch landscape"], tags:["fine-art-depth","natural-daylight","tiny-detail","muted-grey"],
  desc:"三分之二的画面留给天空：云的移动与时间感取代了故事。",
  note:"天空比地面重要，构图时别把地平线抬高。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
