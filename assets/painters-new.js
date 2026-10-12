/* ============================================================
 * data-painters-new.js —— 俄国 · 美国 · 拉美
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-RU01", status:"written",  zh:"伊利亚·列宾", en:"Ilya Repin", life:"1844-1930", mv:"巡回展览画派", mvId:"M-10", region:"俄国",
  F:{ medium:["oil on canvas"], brush:["animated descriptive touch"], color:["earthy Russian palette"], light:["direct daylight or interior glare"], space:["theatrical crowd staging"], motif:["barge haulers","religious procession","zaporozhian letter"], spirit:["social conscience"] },
  sty:["ilya repin","peredvizhniki"], tags:["fine-art-depth","painterly-stroke","natural-daylight","tiny-detail"],
  desc:"把一整群人的性格同时画出来：拉纤者的脸各自不同，负担却是一样的。",
  note:"群像的个体差别是关键，画成通用面孔就失去批判力。" },

{ id:"P-RU02", status:"written",  zh:"瓦西里·康定斯基", en:"Wassily Kandinsky", life:"1866-1944", mv:"抽象开端", mvId:"M-17", region:"俄国",
  F:{ medium:["oil on canvas"], brush:["loose improvisational line"], color:["music-like dissonant hue"], light:["none"], space:["floating non-object field"], motif:["improvisation series","composition with circles"], spirit:["spiritual necessity"] },
  sty:["wassily kandinsky","abstract pioneer"], tags:["broad-gesture","flat-decoration","polychrome-full","minimal-empty"],
  desc:"画必须发出声音：颜色与形状像乐器一样互相碰撞，不解释任何对象。",
  note:"可以乱但不能杂，每个形体的方向都要有内在理由。" },

{ id:"P-RU03", status:"written",  zh:"卡济米尔·马列维奇", en:"Kazimir Malevich", life:"1879-1935", mv:"至上主义", mvId:"M-20", region:"俄国",
  F:{ medium:["oil on canvas"], brush:["absolute flat fill"], color:["red black white doctrine"], light:["none"], space:["tilted levitating geometry"], motif:["black square","white on white"], spirit:["zero point of painting"] },
  sty:["kazimir malevich","suprematism"], tags:["minimal-empty","flat-decoration","hard-edge","perspective-flat"],
  desc:"绘画减到最后：一块方块飘浮在白底上，对象被彻底取消。",
  note:"任何阴影与厚度都会把它拖回错觉世界。" },

{ id:"P-RU04", status:"written",  zh:"马克·夏加尔", en:"Marc Chagall", life:"1887-1985", mv:"梦幻现代主义", mvId:"M-23", region:"俄国",
  F:{ medium:["oil and gouache on canvas"], brush:["dreamy floating line"], color:["saturated fauvist blue"], light:["no fixed source"], space:["floating village signs"], motif:["fiddler on the roof","lovers above the shtetl"], spirit:["nostalgic wonder"] },
  sty:["marc chagall","dream modernism"], tags:["flat-decoration","saturated-clash","line-primary","perspective-flat"],
  desc:"人、牛、小提琴一起飞在故乡上空：不合理的一切都带着深情。",
  note:"漂浮感不能被重力拉回来，一写实就失去深情。" },

{ id:"P-US01", status:"written",  zh:"温斯洛·霍默", en:"Winslow Homer", life:"1836-1910", mv:"美国写实", mvId:"M-10", region:"美国",
  F:{ medium:["oil and later watercolour"], brush:["direct plain handling"], color:["sea slate and sunburnt flesh"], light:["clear atlantic light"], space:["human against the elements"], motif:["gulf stream","northeaster"], spirit:["laconic confrontation"] },
  sty:["winslow homer","american realist"], tags:["painterly-stroke","natural-daylight","fine-art-depth","muted-grey"],
  desc:"不多说一句的姿态：人与自然的关系被压缩成一个正在发生的动作。",
  note:"叙事要精简到极点，故事讲多了就不是他。" },

{ id:"P-US02", status:"written",  zh:"约翰·辛格·萨金特", en:"John Singer Sargent", life:"1856-1925", mv:"美国沙龙肖像", mvId:"M-24", region:"美国",
  F:{ medium:["oil on canvas"], brush:["virtuoso loaded stroke"], color:["black satin and flesh rose"], light:["controlled single highlight"], space:["dark absorbed interior"], motif:["madame x","portly business portrait"], spirit:["society spectacle"] },
  sty:["john singer sargent","grand manner portrait"], tags:["painterly-stroke","fine-art-depth","tiny-detail","chiaroscuro-volume"],
  desc:"一笔是一笔的炫耀：绸缎的高光、手的松弛，全部画得毫无费力感。",
  note:"运笔的速度感要留着，反复涂改会变得笨重。" },

{ id:"P-US03", status:"written",  zh:"乔治亚·奥基弗", en:"Georgia O'Keeffe", life:"1887-1986", mv:"美国现代主义", mvId:"M-30", region:"美国",
  F:{ medium:["oil on canvas"], brush:["seamless flat modelling"], color:["bone white and desert rose"], light:["clean southwestern sun"], space:["extreme close-up scale"], motif:["jack-in-the-pulpit","pelvis bone series"], spirit:["quiet eroticism"] },
  sty:["georgia okeeffe","modernist close-up"], tags:["flat-decoration","minimal-empty","hard-edge","muted-grey"],
  desc:"把一朵花放大到占满画面：边界被切断之后，观看变成了身体性的事件。",
  note:"边缘必须干净，含糊会失去那种纯粹。" },

{ id:"P-US04", status:"written",  zh:"杰克逊·波洛克", en:"Jackson Pollock", life:"1912-1956", mv:"抽象表现主义", mvId:"M-24", region:"美国",
  F:{ medium:["industrial enamel on raw canvas"], brush:["poured flung line"], color:["all over web of black and grey"], light:["none"], space:["no centre no edge"], motif:["number series drips"], spirit:["heroic urgency"] },
  sty:["jackson pollock","action painting"], tags:["broad-gesture","minimal-empty","flat-decoration","hard-edge"],
  desc:"画布铺在地上：颜料被甩出去，重力与速度记录下来了整个过程。",
  note:"线条必须流畅连贯，短促的点和停会让整体碎掉。" },

{ id:"P-US05", status:"written",  zh:"安德鲁·怀斯", en:"Andrew Wyeth", life:"1917-2009", mv:"美国写实", mvId:"M-40", region:"美国",
  F:{ medium:["tempera and drybrush watercolour"], brush:["fine scratchy drybrush"], color:["winter ochre and slate"], light:["low cold window light"], space:["quiet domestic isolation"], motif:["christina's world","pennsylvania farm"], spirit:["silent longing"] },
  sty:["andrew wyeth","american realist"], tags:["tiny-detail","muted-grey","natural-daylight","embossed-relief"],
  desc:"用蛋彩一遍遍薄涂出干枯的草与冷窗的光：孤独被画得很具体。",
  note:"干笔要细到极致，笔一粗就失去那层脆薄。" },

{ id:"P-US06", status:"written",  zh:"安迪·沃霍尔", en:"Andy Warhol", life:"1928-1987", mv:"波普艺术", mvId:"M-26", region:"美国",
  F:{ medium:["screenprint and acrylic on canvas"], brush:["squeegee flat field"], color:["garish commercial clash"], light:["none"], space:["grid repetition"], motif:["marilyn diptych","campbell soup"], spirit:["deadpan celebrity critique"] },
  sty:["andy warhol","pop art"], tags:["flat-print","flat-decoration","commercial-poster","saturated-clash"],
  desc:"同一张脸重复成网格：手艺被工厂取消，只剩下品牌的冷感。",
  note:"千万别去修补套印的错位，那是画面里唯一的手感。" },

{ id:"P-LA01", status:"written",  zh:"迭戈·里维拉", en:"Diego Rivera", life:"1886-1957", mv:"墨西哥壁画", mvId:"M-34", region:"墨西哥",
  F:{ medium:["fresco on monumental wall"], brush:["heavy social contour"], color:["earth red and pre-hispanic blue"], light:["no single source"], space:["stacked public narrative"], motif:["apple industry mural","revolution history"], spirit:["didactic people's art"] },
  sty:["diego rivera","mexican muralism"], tags:["flat-decoration","line-primary","hyper-ornament","perspective-flat"],
  desc:"整面墙的人民史：没有孤单的主角，一切都服从集体的节奏。",
  note:"壁画必须有建筑的尺度，缩成小图就失去说服力。" },

{ id:"P-LA02", status:"written",  zh:"弗里达·卡罗", en:"Frida Kahlo", life:"1907-1954", mv:"墨西哥现代", mvId:"M-35", region:"墨西哥",
  F:{ medium:["oil on small panel or metal"], brush:["precise folk-plain rendering"], color:["tehuana folk bright"], light:["flat none-explained"], space:["surreal shallow symbolic"], motif:["self portrait with thorn necklace","the two fridas"], spirit:["pain made legible"] },
  sty:["frida kahlo","mexican modernism"], tags:["flat-decoration","tiny-detail","polychrome-full","perspective-flat"],
  desc:"把身体的痛直接画成图像：绝不允许隐喻被温柔地包裹起来。",
  note:"痛苦要具体到生理层面，装饰过度就变成消费图案。" },

{ id:"P-LA03", status:"written",  zh:"华金·托雷斯-加西亚", en:"Joaquin Torres-Garcia", life:"1874-1949", mv:"拉美构成", mvId:"M-21", region:"乌拉圭",
  F:{ medium:["oil on board with carved grid"], brush:["flat schematic symbols"], color:["earthy primary blocks"], light:["none"], space:["strict universal grid"], motif:["constructive city symbol","inverted america map"], spirit:["autonomous american modernism"] },
  sty:["joaquin torres-garcia","constructive universalism"], tags:["flat-decoration","hard-edge","minimal-empty","perspective-flat"],
  desc:"把构成主义的格子和前哥伦布时代的符号放进同一张网里。",
  note:"格子必须方正；一旦加了透视或体积就完全错了。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
