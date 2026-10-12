/* ============================================================
 * data-signatures.js —— 手写大师签名卡
 *
 * 一张卡 = 一份已经调好的 spec，直接喂给 FORGE.compose(spec)。
 * 与「自定义拼装」的关系：
 *   自定义是从零搭；签名卡是别人搭好并验过的样板，
 *   你抄走之后可以再改权重、再换算子，所以它不是终点而是起点。
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var SIGNATURES = require("./data-core.js").SIGNATURES;

SIGNATURES.push(
{ id:"G-01", status:"tested",  zh:"古典室内肖像", en:"Classical Interior Portrait", cat:"写实与古典",
  spec:{ subjects:["S-01"], painters:[{ id:"P-NE14", w:1 }], optics:["single window light"], strength:1.0, platform:"sd" },
  desc:"维米尔那套：一个人、一扇窗、一点不着急的光。",
  note:"背景一定留成空的暗面，加任何陈设都会抢掉侧脸。" },

{ id:"G-02", status:"tested",  zh:"极端明暗戏剧", en:"Tenebrist Theatre", cat:"写实与古典",
  spec:{ subjects:["S-04"], painters:[{ id:"P-IT14", w:1.2 }], operators:["OP-P-01"], strength:1.2, platform:"sd" },
  desc:"一束光从高处劈下来：暗部吃掉一半以上画面，剩下的才是重点。",
  note:"就算做了博物馆射灯，也别把暗部提亮，提亮就等于取消这张画。",
  imgNote:"本卡配图为提香《哀悼基督》，与卡内配方**不是同一件作品**：配方写的是卡拉瓦乔（P-IT14）的明暗戏剧法，图是提香（P-IT10）的宗教哀悼。两者共享「暗背景强明暗 + 宗教群像」的画法，差别在提香偏暖色与丝绸质感、卡拉瓦乔偏强烈直射光。如实标注，不假装一致。" },

{ id:"G-03", status:"tested",  zh:"学院沙龙人体", en:"Salon Academic Nude", cat:"写实与古典",
  spec:{ subjects:["S-04"], painters:[{ id:"P-FX04", w:1.1 }], strength:1.1, platform:"mj" },
  desc:"瓷釉一样的皮肤：十九世纪沙龙最受欢迎的那种毫无裂缝的完美。",
  note:"绝对不能出现笔触词，画质档要停在光洁这一层。" },

{ id:"G-04", status:"tested",  zh:"英国湿润风景", en:"English Wet Landscape", cat:"写实与古典",
  spec:{ subjects:["S-12"], painters:[{ id:"P-UK02", w:1 }], optics:["diffused skylight"], strength:0.9, platform:"sd" },
  desc:"河谷与云：看起来平凡，其实每一片云都有观测依据。",
  note:"白色亮点和青绿必须一起用，画面一平就失去雨后的湿润。" },

{ id:"G-05", status:"tested",  zh:"墨西哥壁画群像", en:"Mexican Mural Crowd", cat:"写实与古典",
  spec:{ subjects:["S-02","S-17"], painters:[{ id:"P-LA01", w:1.1 }], operators:["OP-P-03"], strength:1.1, platform:"sd" },
  desc:"把劳动、农业与历史压进同一面墙：人群排成可以读的顺序。",
  note:"要有墙的尺度感，人物不能各自为政，得像一段从左到右的叙述。" },

{ id:"G-06", status:"tested",  zh:"俄罗斯历史场面", en:"Russian Historical Scene", cat:"写实与古典",
  spec:{ subjects:["S-07"], painters:[{ id:"P-RU01", w:1 }], movements:["M-10"], strength:1.0, platform:"sd" },
  desc:"一群人在一个决定性的瞬间：表情与手势都承担着台词。",
  note:"心理刻画要压过技法，笔太漂亮反而削弱了那种沉重。" },

{ id:"G-07", status:"tested",  zh:"北宋全景山水", en:"Northern Song Monumental Landscape", cat:"东方笔墨",
  spec:{ subjects:["S-18"], painters:[{ id:"P-CN11", w:1.2 }], strength:1.2, platform:"sd" },
  desc:"主峰必须占去三分之二以上：人只有指甲大，却看得清每一匹骡子。",
  note:"要留出云雾的断层，填满了就失去那种高远。" },

{ id:"G-08", status:"tested",  zh:"元人简远小景", en:"Yuan Dynasty Sparse Retreat", cat:"东方笔墨",
  spec:{ subjects:["S-19"], painters:[{ id:"P-CN20", w:1 }], operators:["OP-D-03"], strength:1.0, platform:"sd" },
  desc:"一河两岸：中间全是水，前面只剩几棵枯树。",
  note:"墨要淡到几乎不见，浓一笔就俗；这块空才是画的主体。" },

{ id:"G-09", status:"tested",  zh:"大写意花鸟", en:"Freehand Bird and Flower", cat:"东方笔墨",
  spec:{ subjects:["S-09"], painters:[{ id:"P-CN28", w:1.2 }], strength:1.2, platform:"sd" },
  desc:"葡萄只是借口：泼墨一路砸下去，形准让位于势准。",
  note:"线可以乱，速度不能减；描得太稳就失去了那种狂。" },

{ id:"G-10", status:"tested",  zh:"唐卡式圣像", en:"Thangka Style Icon", cat:"东方笔墨",
  spec:{ subjects:["S-06"], painters:[{ id:"P-AS14", w:1.1 }], operators:["OP-M-08"], strength:1.1, platform:"sd" },
  desc:"对称、满绘、矿物色：一切都服从度量经的规定。",
  note:"不允许画师自己发挥，画面一旦偏斜整套语言就失效。" },

{ id:"G-11", status:"tested",  zh:"浮世绘风景版面", en:"Ukiyo-e Print Layout", cat:"东方笔墨",
  spec:{ subjects:["S-13"], painters:[{ id:"P-JP05", w:1.1 }], operators:["OP-E-03"], strength:1.1, platform:"sd" },
  desc:"平面色块加关键版轮廓：地平线压得很低，主体常常被远处的小山反衬。",
  note:"必须保留木纹与和纸的质感，也不要加投影。" },

{ id:"G-12", status:"tested",  zh:"新艺术海报", en:"Art Nouveau Poster", cat:"装饰与设计",
  spec:{ subjects:["S-01","S-24"], painters:[{ id:"P-MD01", w:1.1 }], operators:["OP-S-06"], strength:1.1, platform:"mj" },
  desc:"弧线从人物周围长出来，版面本身也是构图的一部分。",
  note:"装饰可以与字融合，但不要做出体积与投影。" },

{ id:"G-13", status:"tested",  zh:"俄罗斯童话插画", en:"Russian Fairy Tale Illustration", cat:"装饰与设计",
  spec:{ subjects:["S-21"], painters:[{ id:"P-MD04", w:1 }], operators:["OP-M-04"], strength:1.0, platform:"sd" },
  desc:"民间故事被画成装饰板：边框、服饰与树林都服从同一种线条。",
  note:"要有手绘水粉的平薄，不要往厚处推。" },

{ id:"G-14", status:"tested",  zh:"波斯细密画书页", en:"Persian Miniature Page", cat:"装饰与设计",
  spec:{ subjects:["S-05"], painters:[{ id:"P-AS01", w:1.1 }], strength:1.1, platform:"sd" },
  desc:"手掌大的纸上同时看得见墙里墙外：细节密到数得出每一块砖。",
  note:"拒绝投影与焦点透视，这两样一进来整套语言就失效。" },

{ id:"G-15", status:"tested",  zh:"琳派金屏风", en:"Rinpa Gold Screen", cat:"装饰与设计",
  spec:{ subjects:["S-09"], painters:[{ id:"P-JP04", w:1.2 }], strength:1.2, platform:"mj" },
  desc:"金地上的平涂：花瓣没有任何明暗，水的形状自己决定构图。",
  note:"必须保留大面积金箔的空，涂满了就失去琳派的装饰张力。" },

{ id:"G-16", status:"tested",  zh:"黑白装饰插画", en:"Black and White Decorative Line", cat:"装饰与设计",
  spec:{ subjects:["S-03"], painters:[{ id:"P-MD02", w:1.1 }], operators:["OP-M-06"], strength:1.1, platform:"sd" },
  desc:"只有黑与白：大面积的块面负责压抑，极细的线负责挑逗。",
  note:"不要加灰，也不要加网点以外的任何灰度手段。" },

{ id:"G-17", status:"tested",  zh:"超现实梦境", en:"Surrealist Dream Scene", cat:"现代与想象",
  spec:{ subjects:["S-22"], painters:[{ id:"P-ES06", w:1.2 }], strength:1.2, platform:"sd" },
  desc:"梦境比照片更清楚：远处的地平线低到不合理，所有物体保持绝对锐利。",
  note:"渲染必须细到无情，任何可见笔触都会把幻觉戳破。" },

{ id:"G-18", status:"tested",  zh:"表现主义呐喊", en:"Expressionist Cry", cat:"现代与想象",
  spec:{ subjects:["S-15"], painters:[{ id:"P-NO02", w:1.2 }], operators:["OP-D-02"], strength:1.3, platform:"sd" },
  desc:"城市也可以像尖叫：所有线条朝同一个方向奔涌。",
  note:"颜色可以有毒，不能好看；柔化了这个构图就失去力量。" },

{ id:"G-19", status:"tested",  zh:"色域沉默", en:"Colour Field Silence", cat:"现代与想象",
  spec:{ subjects:["S-24"], painters:[{ id:"P-FX08", w:1 }], operators:["OP-D-01"], strength:1.0, platform:"sd" },
  desc:"没有形象，只有两块悬着的颜色：看久了会有压力。",
  note:"边界必须虚得像呼吸，切成硬边方块就不再是罗斯科。",
  imgNote:"配图在色域色块前放了一个人形剪影——本卡配方写的是「没有形象，只有两块悬着的颜色」，画面里多了一个具象的人。色调（橙红压深褐）与「看久了会有压力」的调子对得上，色块边缘也比配方的要求硬一些。题材有出入，如实标注。" },

{ id:"G-20", status:"tested",  zh:"波普丝网海报", en:"Pop Silkscreen Poster", cat:"现代与想象",
  spec:{ subjects:["S-01","S-24"], painters:[{ id:"P-US06", w:1.1 }], operators:["OP-M-05"], strength:1.1, platform:"mj" },
  desc:"同一张脸重复几十次：印刷的错误手感是这个风格的核心。",
  note:"必须平得像机器印的，出现笔触就破功。" },

{ id:"G-21", status:"tested",  zh:"科幻概念设计", en:"Science Fiction Concept Art", cat:"现代与想象",
  spec:{ subjects:["S-23"], painters:[{ id:"P-MD07", w:1 }], operators:["OP-M-09"], strength:1.0, platform:"sd" },
  desc:"未来被画成一个可用的产品：透视干净，结构清楚，天气很真实。",
  note:"不要用脏乱的笔触掩盖结构，不清楚的设计就是失败。" },

{ id:"G-22", status:"tested",  zh:"生物机械惊悚", en:"Biomechanical Horror", cat:"现代与想象",
  spec:{ subjects:["S-04"], painters:[{ id:"P-MD08", w:1.2 }], operators:["OP-D-04"], strength:1.2, platform:"sd" },
  desc:"金属与骨头长在一起：喷枪的细腻把这个噩梦做得可信。",
  note:"必须要那种冷的金属高光，笔触一粗就不再像吉格尔。",
  imgNote:"配图与配方不是一回事：本卡配方是吉格尔（P-MD08）的生物机械——金属与骨骼长在一起、冷的金属高光；配图里没有任何生物机械结构，是一位躺在暗织物上的人体，明暗调子对得上，题材完全不对。另外这是裸露人体，与本库其他配图（画法、构图、风格）不是一类内容，放在画廊卡面上不合适 —— 建议用本卡配方自己生成一张替换掉 G-22.png。" },

{ id:"G-23", status:"tested",  zh:"双画家融合示范", en:"Two Painter Fusion Demo", cat:"变形示范",
  spec:{ subjects:["S-13"], painters:[{ id:"P-FX01", w:0.7 },{ id:"P-JP05", w:0.3 }], operators:["OP-F-01"], strength:1.0, platform:"sd" },
  desc:"梵高的旋笔占七成，北斋的木版结构占三成：主次清楚才不会打架。",
  note:"这是一张示范卡：把两个画家对调权重试试，会得到完全不同的画面。" },

{ id:"G-24", status:"tested",  zh:"只取色彩解构示范", en:"Colour Only Deconstruction Demo", cat:"变形示范",
  spec:{ subjects:["S-14"], painters:[{ id:"P-IT16", w:1 }], operators:["OP-D-01"], strength:1.0, platform:"sd" },
  desc:"只要莫兰迪的那层灰：他怎么摆瓶子、怎么处理笔都不参与。",
  note:"解构是这套系统的核心用法之一，换 OP-D-02 就拿笔法，换 OP-D-03 就拿构图。" },

{ id:"G-25", status:"tested",  zh:"媒介迁移到摄影", en:"Medium Shift to Photography", cat:"变形示范",
  spec:{ subjects:["S-12"], painters:[{ id:"P-FR13", w:1 }], operators:["OP-M-07"], strength:0.8, platform:"sd" },
  desc:"同一片风景，让印象派退回相册：笔触消失，画质档自动切到大画幅摄影。",
  note:"算子代表明确意图，冲突裁决会让它自动压过画家的笔法语；这是引擎在替你刹车。" }
);

/*__END__*/

if (typeof module !== "undefined" && module.exports) module.exports = { SIGNATURES };
