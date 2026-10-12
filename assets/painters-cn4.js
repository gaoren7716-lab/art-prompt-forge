/* ============================================================
 * data-painters-cn4.js —— 中国：二十世纪后半叶至今
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var PAINTERS = require("./data-core.js").PAINTERS;

PAINTERS.push(
{ id:"P-CN49", status:"written",  zh:"李可染", en:"Li Keran", life:"1907-1989", mv:"现代水墨", mvId:"M-51", region:"中国",
  F:{ medium:["heavy ink on thick paper"], brush:["dense accumulated wet strokes"], color:["black with a thin warm glow"], light:["backlit glowing summits"], space:["compressed vertical mass"], motif:["guilin landscape","buffalo boy at dusk"], spirit:["rediscovered substance"] },
  sty:["li keran","modern chinese ink"], tags:["monochrome-ink","broad-gesture","minimal-empty","fine-art-depth"],
  desc:"在写生的基础上把山压得更密更黑：逆光的那一线亮是整个画面的生命。",
  note:"黑要积得深，浅浅一层染出来的黑没有分量。" },

{ id:"P-CN50", status:"written",  zh:"石鲁", en:"Shi Lu", life:"1919-1982", mv:"长安画派", mvId:"M-51", region:"中国",
  F:{ medium:["raw folk-fresh colour on paper"], brush:["knife-cut angular strokes"], color:["high temperature contrast"], light:["no soft atmospheric wash"], space:["compressed near-distance structure"], motif:["loess plateau figures","red child goat"], spirit:["defiant northern endurance"] },
  sty:["shi lu","changan school"], tags:["hard-edge","broad-gesture","polychrome-full","perspective-flat"],
  desc:"把黄土高原画得很硬：棱角分明的结构比任何湿笔都更有力气。",
  note:"要留下锋利的痕迹，画得太圆润就失去西北的那股硬。" },

{ id:"P-CN51", status:"written",  zh:"常玉", en:"Sanyu", life:"1900-1966", mv:"旅法华人现代", mvId:"M-30", region:"中国",
  F:{ medium:["oil on board later gold and pink"], brush:["thin hard linear contour"], color:["pink white black reduction"], light:["flat studio absence"], space:["extreme simplified ground"], motif:["standing female nude","gold branch pot"], spirit:["elegant loneliness"] },
  sty:["sanyu","paris chinese modern"], tags:["minimal-empty","line-primary","flat-decoration","perspective-flat"],
  desc:"线变得极简、颜色变成粉与金：巴黎派的东方人最终回到自己的含蓄。",
  note:"背景必须空，任何场景都会把他那种优雅稀释。" },

{ id:"P-CN52", status:"written",  zh:"吴冠中", en:"Wu Guanzhong", life:"1919-2010", mv:"中西融合", mvId:"M-51", region:"中国",
  F:{ medium:["ink with acrylic on paper"], brush:["calligraphic sweeping line"], color:["black white grey with bright dots"], light:["flat eastern space"], space:["formal abstraction from nature"], motif:["whitewashed jiangnan houses","roots of hometown"], spirit:["formalist lyricism"] },
  sty:["wu guanzhong","modern chinese abstraction"], tags:["line-primary","minimal-empty","flat-decoration","polychrome-full"],
  desc:"把江南的白墙黑瓦提炼成点与线的构成：一看就知道是他。",
  note:"画面同时要有油画般的厚和墨般的流动，两者缺一不可。" },

{ id:"P-CN53", status:"written",  zh:"赵无极", en:"Zao Wou-Ki", life:"1920-2013", mv:"抽象抒情", mvId:"M-24", region:"中国",
  F:{ medium:["oil on canvas huge format"], brush:["broad swirling gestural"], color:["luminous layered blue and ochre"], light:["inner glowing depth"], space:["no object, open cosmic field"], motif:["homage to ancient dynasties"], spirit:["lyrical abstraction"] },
  sty:["zao wou-ki","lyrical abstraction"], tags:["broad-gesture","minimal-empty","flat-decoration","polychrome-full"],
  desc:"把甲骨文、山水气脉与抽象表现主义压在同一片光里：不是西方也不是东方。",
  note:"空间的层次必须通透，糊成一团就变脏了。" },

{ id:"P-CN54", status:"written",  zh:"朱德群", en:"Chu Teh-Chun", life:"1920-2014", mv:"抽象抒情", mvId:"M-24", region:"中国",
  F:{ medium:["oil on canvas with lyrical layers"], brush:["calligraphic sudden strokes"], color:["deep gem blue and light burst"], light:["glowing internal illumination"], space:["dot gesture flowing field"], motif:["four seasons abstract","snow sudden sunrise"], spirit:["poetic momentum"] },
  sty:["chu teh-chun","lyrical abstraction"], tags:["broad-gesture","wet-blending","polychrome-full","minimal-empty"],
  desc:"把书法的速度和光线的层次结合：笔画在颜色里穿行。",
  note:"底色要有层次，平铺的底会让笔画变成孤立的装饰。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { PAINTERS };
