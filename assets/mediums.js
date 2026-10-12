/* ============================================================
 * data-mediums.js —— 媒介与技法（可单独调用，也可覆盖画家的原生媒介）
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var MEDIUMS = require("./data-core.js").MEDIUMS;

MEDIUMS.push(
{ id:"MD-01", status:"written",  zh:"湿壁画", en:"Buon Fresco", cat:"壁面",
  F:{ medium:["pigment absorbed into wet lime plaster","giornata day-joint"], brush:["slaked dry touch","powdery matte finish"], light:["diffuse scattered daylight"] },
  sty:["buon fresco"], tags:["flat-print","hard-edge","aged-decay"],
  desc:"颜色是被灰泥咬进去的，干燥后自带一层粉质哑光，必须在限定时间内画完当天那一块。",
  note:"画布纹理和笔毛痕要进负面词，否则会变成画在布上的油画。" },

{ id:"MD-02", status:"written",  zh:"坦培拉蛋彩", en:"Egg Tempera", cat:"古典",
  F:{ medium:["egg tempera on gessoed panel"], brush:["fine cross-hatched strokes","thin translucent layered glazes"], light:["even luminous matte"] },
  sty:["egg tempera"], tags:["line-primary","hard-edge"],
  desc:"蛋黄调矿物色，一层层细密排线叠加出半透明的光，干燥后均匀哑光，没有油画的润。",
  note:"蛋彩永远厚不起来，画面出现厚涂凸起就是错的。" },

{ id:"MD-03", status:"written",  zh:"木板细密油画", en:"Oil on Panel", cat:"古典",
  F:{ medium:["oil on smooth prepared panel"], brush:["imperceptible fine blending","glazed depth"], light:["unified clear daylight"] },
  sty:["oil on panel"], tags:["tiny-detail","wet-blending"],
  desc:"画在硬而平的底子上，笔可以收得很细，层层罩染像玻璃一样透亮。",
  note:"这笔法靠“慢”，别加大笔触词，会立刻破功。" },

{ id:"MD-04", status:"written",  zh:"厚涂堆塑", en:"Impasto", cat:"油画",
  F:{ medium:["thick oil impasto"], brush:["palette knife ridges","loaded directional stroke"], light:["raking light catching the ridges"] },
  sty:["impasto painting"], tags:["oil-impasto","embossed-relief","broad-gesture"],
  desc:"颜料本身成为浮雕：真实厚度斜光下会投影，是少有的可以让错觉走神的媒介。",
  note:"要配斜射光，平光打不出厚度。" },

{ id:"MD-05", status:"written",  zh:"透明罩染", en:"Glazing Layers", cat:"油画",
  F:{ medium:["multiple transparent oil glazes"], brush:["no visible touch","deep layered luminosity"], light:["inner glow from pale ground"] },
  sty:["oil glazing","flemish technique"], tags:["wet-blending","tiny-detail","fine-art-depth"],
  desc:"薄而透明的色层叠在浅底上，光要穿透每一层再折回来，像有色玻璃。",
  note:"白要最后提，前面别碰白粉，一加就浑。" },

{ id:"MD-06", status:"written",  zh:"一次性画法", en:"Alla Prima", cat:"油画",
  F:{ medium:["wet into wet oil painting"], brush:["decisive single-take stroke","soft edge merger"], light:["immediate observed light"] },
  sty:["alla prima"], tags:["painterly-stroke","wet-blending","broad-gesture"],
  desc:"趁湿一口气画完，边缘彼此融合，保留第一眼的鲜活判断。",
  note:"反复涂改会失去这种“一次命中”的爽利。" },

{ id:"MD-07", status:"written",  zh:"刮刀塑造", en:"Knife Painting", cat:"油画",
  F:{ medium:["oil applied with painting knife"], brush:["flat squeegee facets","scraped back reveals"], light:["hard specular facets"] },
  sty:["palette knife painting"], tags:["hard-edge","embossed-relief","oil-impasto"],
  desc:"颜料被刀面切成小块平面，块面之间的转折像岩石一样硬。",
  note:"想软化就得改用笔，刮刀的语言是断不是续。" },

{ id:"MD-08", status:"written",  zh:"透明水彩", en:"Watercolour", cat:"水性",
  F:{ medium:["transparent watercolour on cotton paper"], brush:["wet in wet bloom","dry brush granulation"], light:["white paper reserves the light"] },
  sty:["watercolour"], tags:["ink-aqueous","no-outline","minimal-empty"],
  desc:"亮部是留出来的白纸，颜色一层层压上去，边缘的水痕记录笔的速度。",
  note:"水彩怕脏怕改，宁可留一笔空也不要反复涂。" },

{ id:"MD-09", status:"written",  zh:"纸上水粉", en:"Gouache", cat:"水性",
  F:{ medium:["opaque gouache on board"], brush:["flat velvet coverage","matte chalk finish"], light:["no optical glare"] },
  sty:["gouache painting"], tags:["flat-decoration","hard-edge"],
  desc:"覆盖力强且不反光，颜色干了以后是标准的哑光块面，最适合设计思维。",
  note:"别追求油画式通透，水粉的优势在“平而准”。" },

{ id:"MD-10", status:"written",  zh:"钢笔淡彩", en:"Ink & Wash", cat:"水性",
  F:{ medium:["pen and diluted wash"], brush:["confident persistent line","loose pooled wash"], light:["minimal tonal hint"] },
  sty:["pen and wash","ink drawing"], tags:["line-primary","minimal-empty","ink-aqueous"],
  desc:"线负责结构，淡墨或淡彩只做一点点体积暗示，剩下的交给纸白。",
  note:"线条一旦犹豫，整套就散了。" },

{ id:"MD-11", status:"written",  zh:"宣纸水墨", en:"Ink on Paper", cat:"东方水性",
  F:{ medium:["ink on absorbent xuan paper"], brush:["centre tip and side tip variation","flying white stroke"], light:["paper white as light"], space:["void as water and cloud"] },
  sty:["chinese ink painting","shuimo"], tags:["ink-aqueous","monochrome-ink","minimal-empty","line-primary"],
  desc:"一笔见浓淡干湿：中锋与侧锋的转换本身就是形体，纸的白既是水也是云。",
  note:"忌反复涂改，墨一下去就改不了，这正是它的强度来源。" },

{ id:"MD-12", status:"written",  zh:"绢本工笔重彩", en:"Gongbi on Silk", cat:"东方水性",
  F:{ medium:["fine brush and mineral colour on silk"], brush:["hair-fine contour line","dozens of back washes"], color:["layered translucent mineral hue"], light:["flat even illumination"] },
  sty:["gongbi","fine line painting"], tags:["line-primary","tiny-detail","flat-decoration","polychrome-full"],
  desc:"极细的墨线定形，背面托色正面渲色，一遍一遍染出没有笔痕的匀净。",
  note:"这是慢工，一分钟一道工序的画面感要留住，别用速写笔触。" },

{ id:"MD-13", status:"written",  zh:"矿物岩彩", en:"Mineral Pigment", cat:"东方重彩",
  F:{ medium:["ground mineral pigment bound in glue"], brush:["granular settling granulation","sanded back layers"], color:["natural stone hue","shell white base"] },
  sty:["nihonga","mineral pigment painting"], tags:["polychrome-full","embossed-relief","gold-ground"],
  desc:"天然矿石磨成粗细不同的颗粒，粗的铺底细的罩面，打磨之后露出半哑光的宝石感。",
  note:"荧光色和电脑渐变是这一层的天敌。" },

{ id:"MD-14", status:"written",  zh:"木版套色", en:"Ukiyo-e Woodblock", cat:"版画",
  F:{ medium:["cherry woodblock print on washi"], brush:["keyblock black outline","bokashi gradient wipe"], light:["no shadow at all"], space:["flat stacked planes"] },
  sty:["ukiyo-e print","woodblock print"], tags:["flat-print","flat-decoration","line-primary","hard-edge"],
  desc:"先刻主版墨线，再一色一版套印，中间的渐变靠手工擦出来的晕版。",
  note:"一旦出现真实投影或空气透视，木版的语言就破了。" },

{ id:"MD-15", status:"written",  zh:"铜版蚀刻", en:"Etching & Aquatint", cat:"版画",
  F:{ medium:["copper plate etching with aquatint"], brush:["acid bitten line","cross-hatched tonal net"], light:["darkness built by hatching density"] },
  sty:["etching","aquatint"], tags:["flat-print","line-primary","monochrome-ink"],
  desc:"一切明度由排线密度换算，酸吃出的线带着微微的粗细波动。",
  note:"给它上色或者加渐变，版画的换算逻辑就失效了。" },

{ id:"MD-16", status:"written",  zh:"麻胶版画", en:"Linocut", cat:"版画",
  F:{ medium:["linoleum relief print"], brush:["gouged bold cut","hard positive silhouette"], light:["black carries all structure"] },
  sty:["linocut print"], tags:["flat-print","hard-edge","minimal-empty"],
  desc:"刻刀推过麻胶，留下夸张而干脆的黑白关系，纸面的压痕也是签名。",
  note:"精细灰调留给水彩去做，麻胶只负责力量。" },

{ id:"MD-17", status:"written",  zh:"石版画", en:"Lithograph", cat:"版画",
  F:{ medium:["grease crayon on limestone print"], brush:["greasy crayon tooth","splatter and scrape"], light:["smooth continuous tone possible"] },
  sty:["lithograph"], tags:["flat-print","flat-decoration"],
  desc:"油性蜡笔在石面上作画，能保留手绘的柔软感又能无限复制。",
  note:"这一层可以要柔和灰调，不必像木刻那样硬。" },

{ id:"MD-18", status:"written",  zh:"丝网印刷", en:"Silkscreen", cat:"版画",
  F:{ medium:["screen print with spot ink"], brush:["hard squeegee edge","halftone dot"], color:["flat spot colour","separated cmyk dots"] },
  sty:["screen print","silkscreen"], tags:["flat-print","hard-edge","saturated-clash"],
  desc:"专色叠印加网点，颜色之间各不相让，错版反而是意外的礼物。",
  note:"不要去修补套印偏移，偏移是它的表情。" },

{ id:"MD-19", status:"written",  zh:"色粉与炭笔", en:"Pastel & Charcoal", cat:"干性",
  F:{ medium:["soft pastel and charcoal on toned paper"], brush:["dusty stroked sides","smudged dull edge"], light:["toned paper middle value"] },
  sty:["pastel drawing","charcoal"], tags:["minimal-empty","no-outline","muted-grey"],
  desc:"粉末停留在纸纹上，一部分浮着一部分陷进去，手指一抹就是云雾。",
  note:"要留住那层浮尘感，过度定色会变成铅笔画。" },

{ id:"MD-20", status:"written",  zh:"丙烯平涂", en:"Acrylic Flat", cat:"现代",
  F:{ medium:["acrylic on panel","fast drying polymer"], brush:["hard-edge masking tape block","uniform flat fill"], light:["no painterly modelling"] },
  sty:["acrylic painting","hard edge abstraction"], tags:["hard-edge","flat-decoration","flat-print"],
  desc:"干燥快、颜色硬、边缘可以用胶带切得笔直，是二十世纪之后的速度感。",
  note:"这一层不需要笔触，需要的是边界的果断。" },

{ id:"MD-21", status:"written",  zh:"喷枪渐层", en:"Airbrush", cat:"现代",
  F:{ medium:["airbrush acrylic and gouache"], brush:["atomised seamless gradient","stencil masked edge"], light:["soft continuous volume"] },
  sty:["airbrush illustration","retouched realism"], tags:["no-outline","digital-clean","wet-blending"],
  desc:"雾化到看不见笔运动的过度，配遮挡纸可以切出极硬的边缘。",
  note:"“没有笔触”是它的技术目标，别再往里面加笔法词。" },

{ id:"MD-22", status:"written",  zh:"蜡彩热固", en:"Encaustic", cat:"古代热作",
  F:{ medium:["hot wax medium with pigment"], brush:["fused wave gestures","re-heated translucent layers"], light:["depth from translucency"] },
  sty:["encaustic painting"], tags:["embossed-relief","polychrome-full"],
  desc:"熔化的蜡混着色趁热画上去再用火烤合，层与层之间永远半透明。",
  note:"要有流动感与热度感，画得像水彩就浪费了这个媒介。" },

{ id:"MD-23", status:"written",  zh:"金箔与贴金", en:"Gold Leaf", cat:"装饰性",
  F:{ medium:["gold leaf on gesso","burnished repairs"], brush:["punched decorative pattern","burnished repair patches"], light:["metallic reflection with no atmospheric depth"] },
  sty:["gold ground","gilded"], tags:["gold-ground","hyper-ornament","flat-decoration"],
  desc:"金箔不参与明暗，它自己就是光，表面的纹样是靠压印出来的。",
  note:"金不靠渐变表现，靠的是块的对比与断裂处的亮。" },

{ id:"MD-24", status:"written",  zh:"数字厚涂", en:"Digital Painterly", cat:"数字",
  F:{ medium:["digital oil simulation"], brush:["textured round brush","layered multiply and overlay"], light:["core shadow control"] },
  sty:["digital painting","painterly digital"], tags:["digital-clean","painterly-stroke","fine-art-depth"],
  desc:"用笔刷模拟油画的堆叠逻辑：先铺明暗大关系，再处理投影交界，最后收边缘。",
  note:"图层越多越容易糊，记得中途合并。" },

{ id:"MD-25", status:"written",  zh:"数字薄涂与线稿", en:"Digital Cel & Line", cat:"数字",
  F:{ medium:["clean digital line art","cell shading"], brush:["constant width line","two step shadow"], light:["designed simple falloff"] },
  sty:["digital illustration","cel shading"], tags:["digital-clean","line-primary","hard-edge","flat-decoration"],
  desc:"线稿干净、明暗只做一到两个层级，一切都让位于读图速度。",
  note:"厚涂笔刷进来会破坏这条铁律：简单优先。" },

{ id:"MD-26", status:"written",  zh:"拼贴综合", en:"Mixed Media Collage", cat:"现代",
  F:{ medium:["cut paper print and object pasted together"], brush:["torn paper edge","adhesive gloss"], space:["discontinuous overlapping planes"] },
  sty:["collage","mixed media"], tags:["flat-print","hard-edge","aged-decay"],
  desc:"撕边、错版、互不相让的材质：杂乱本身就是这一层的语法。",
  note:"要求“融合自然”会直接取消它的意义。" },

{ id:"MD-27", status:"written",  zh:"三维渲染", en:"CG Render", cat:"数字",
  F:{ medium:["physically based 3d render"], brush:["no hand stroke","subsurface scattering"], light:["global illumination bounce"] },
  sty:["3d render","octane render"], tags:["digital-clean","photographic","fine-art-depth"],
  desc:"光是被算出来的：折射、次表面散射、弹射光都要由材质参数决定。",
  note:"这是 “计算” 的语言，画面里出现手绘笔触会立刻自相矛盾。" },

{ id:"MD-28", status:"written",  zh:"摄影银盐", en:"Silver Gelatin Print", cat:"影像",
  F:{ medium:["silver gelatin darkroom print"], brush:["no marks at all","grain instead of stroke"], light:["recorded single exposure"] },
  sty:["photograph","darkroom print"], tags:["photographic","no-outline","natural-daylight"],
  desc:"一切都由一次曝光决定，颗粒替代笔触，景深替代虚实。",
  note:"任何笔触残留都会让画面卡在“油画假装照片”的位置。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { MEDIUMS };
