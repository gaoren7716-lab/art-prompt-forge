/* ============================================================
 * modules-d.js —— 局部（region）角色模块
 *
 * 为什么单独一个文件：region 是四种角色里唯一「不作用于整张图」的角色。
 * 它的正确用法必须成对出现——一条给主体区，一条给背景区，
 * 中间还要有过渡。散落在其它 11 类里会看不出这个配对关系，
 * 所以集中放在这里，并在 read 里写明它该跟谁配对。
 *
 * 引擎对 region 的处理（见 forge-kit.js 的 compose）：
 *   不直接进任何一面，也不进负面词，而是归集到返回值的 regionAtoms，
 *   由界面提示「这两条需要用遮罩落实」。不给遮罩就等于没生效。
 *
 * 与冲突裁决的关系：region 是 CF 规则 regional 级的落地手段。
 * 判为 regional 的冲突，光给建议没用，得能指出「哪条给主体、哪条给背景」。
 * ============================================================ */
var ATOMS = (typeof module !== "undefined" && module.exports)
  ? require("./data-core.js").ATOMS
  : (typeof window !== "undefined" ? window : this).ATOMS;

ATOMS.push(
/* ---------- 主体区：可以被更细的语言接管的那一块 ---------- */
{ id:"AM-D01", role:"region", status:"tested", cat:4, slot:"space", t:"foreground subject in focus", zh:"前景主体实焦",
  c:"画面近处的主体清晰结实，占据视觉重心",
  alt:["sharp detailed foreground subject","crisp focal subject in near field"],
  read:"分区方案里给主体区用。与 AM-D05 的背景处理配对，两者同时上才成立。",
  region:{ zone:"foreground", pairWith:"AM-D05" } },
{ id:"AM-D02", role:"region", status:"tested", cat:8, slot:"brush", t:"figure rendered in full detail", zh:"人物满细节",
  c:"人物部分画到接近插画的精度，衣料与手部都不省略",
  alt:["highly detailed figure rendering","illustration level figure detail"],
  read:"当背景要往后退时，人物区必须顶上来，否则画面会整体发空。配 AM-D06。",
  region:{ zone:"figure", pairWith:"AM-D06" } },
{ id:"AM-D03", role:"region", status:"tested", cat:6, slot:"brush", t:"impasto build up on accents", zh:"重色堆积处厚涂",
  c:"只在最亮的几个高光处把颜料堆起来，其余保持薄",
  alt:["thick impasto only at highlights","selective heavy paint accents"],
  read:"配 AM-D07。厚涂一旦铺满全图，暗部会跟着变脏，务必只给高光。",
  region:{ zone:"accents", pairWith:"AM-D07" } },
{ id:"AM-D04", role:"region", status:"tested", cat:5, slot:"color", t:"saturated accent passages", zh:"局部高纯度色块",
  c:"只在一小块地方用足纯度，其余全部压低",
  alt:["small area of saturated colour","isolated vivid colour passage"],
  read:"这是 CF-06（灰调对撞高饱和）的标准解法：主体铺灰，只留这一小块跳色。",
  region:{ zone:"accent", pairWith:"AM-D08" } },

/* ---------- 背景区：与主体区相反的一套 ---------- */
{ id:"AM-D05", role:"region", status:"tested", cat:3, slot:"space", t:"background falling soft", zh:"背景退虚",
  c:"背景整体虚化并压低对比，只交代气氛不交代细节",
  alt:["soft out of focus background","low contrast defocused backdrop"],
  read:"与 AM-D01 配对。单用这一条会变成景深虚化片，单用 AM-D01 会变成合影。",
  region:{ zone:"background", pairWith:"AM-D01" } },
{ id:"AM-D06", role:"region", status:"tested", cat:8, slot:"brush", t:"background reduced to mass", zh:"背景概括成面",
  c:"背景只交代大形与明度，不画细节与质感",
  alt:["background simplified to masses","broad background shapes only"],
  read:"与 AM-D02 配对。这是把一幅画画得「有空气」最省力的一招。",
  region:{ zone:"background", pairWith:"AM-D02" } },
{ id:"AM-D07", role:"region", status:"tested", cat:6, slot:"brush", t:"thin flat passages elsewhere", zh:"其余薄涂平铺",
  c:"除高光外全部薄涂平铺，不留笔触堆积",
  alt:["thin flat paint elsewhere","smooth thin glazing pass"],
  read:"与 AM-D03 配对。这一对是控制油画质感的关键：厚薄分配本身就是构图。",
  region:{ zone:"field", pairWith:"AM-D03" } },
{ id:"AM-D08", role:"region", status:"tested", cat:5, slot:"color", t:"muted low saturation field", zh:"低纯度大色域",
  c:"大面积颜色一律压到中低纯度，作为高纯度色块的底",
  alt:["large muted colour field","desaturated background colour"],
  read:"与 AM-D04 配对。CF-06 的完整解法就是这一对，别只上其中一条。",
  region:{ zone:"field", pairWith:"AM-D04" } },

/* ---------- 天空与远景：第三种区域，两侧都要退 ---------- */
{ id:"AM-D09", role:"region", status:"tested", cat:2, slot:"light", t:"open sky with no detail", zh:"素净天空",
  c:"天空只留渐变，不放云的结构也不放任何剪影",
  alt:["plain gradient sky","empty unadorned sky"],
  read:"给宋元一路的山水用。天空一旦有细节，整幅画立刻掉价。",
  region:{ zone:"sky", pairWith:"AM-D10" } },
{ id:"AM-D10", role:"region", status:"tested", cat:1, slot:"light", t:"distant range fading into haze", zh:"远山没入雾中",
  c:"最远的一层山只留一条淡影，边界要化开",
  alt:["distant mountains fading into mist","far range dissolved in haze"],
  read:"与 AM-D09 配对。空气透视的关键不在近景，而在最远那一层给不给。",
  region:{ zone:"far", pairWith:"AM-D09" } },

/* ---------- 光源区：把光限定在画面某一段 ---------- */
{ id:"AM-D11", role:"region", status:"tested", cat:1, slot:"light", t:"light falling from one side only", zh:"单侧受光",
  c:"光只从画面一侧进来，背光面全部沉下去",
  alt:["light from a single side","one sided illumination"],
  read:"分区布光的第一条。暗面不是画暗，是让光进不去。",
  region:{ zone:"lit", pairWith:"AM-D12" } },
{ id:"AM-D12", role:"region", status:"tested", cat:1, slot:"light", t:"shadow side merging into ground", zh:"暗面并入地面",
  c:"背光区域与地面暗部连成一片，不留交界线",
  alt:["shadow side merges into ground tone","continuous shadow and ground"],
  read:"与 AM-D11 配对。这一对能造出比任何滤镜都可信的厚重感。",
  region:{ zone:"shadow", pairWith:"AM-D11" } },

/* ---------- 边缘区：留给版面与装裱 ---------- */
{ id:"AM-D13", role:"region", status:"tested", cat:4, slot:"space", t:"clear margin band on top", zh:"上方留标题带",
  c:"画面上方留出一条不画内容的横带，供后期压字",
  alt:["blank band across the top for titling","reserved top margin strip"],
  read:"封面与海报必用。只写「留白」模型不会保证留够位置，必须指定在「上方」。",
  region:{ zone:"top", pairWith:"AM-D14" } },
{ id:"AM-D14", role:"region", status:"tested", cat:4, slot:"space", t:"lower area carrying the main mass", zh:"下压主体量",
  c:"主要的内容量压在下三分之二，上方只留轻的量",
  alt:["visual weight anchored in lower area","heavier bottom composition"],
  read:"与 AM-D13 配对。留白不只是空出来，还要让下面的量足够压得住。",
  region:{ zone:"bottom", pairWith:"AM-D13" } }
);

if (typeof module !== "undefined" && module.exports) module.exports = { ATOMS };
