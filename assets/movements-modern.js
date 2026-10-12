/* ============================================================
 * data-movements-modern.js —— 流派与运动（二十世纪至今）
 * ============================================================ */
if (typeof module !== "undefined" && module.exports) var MOVEMENTS = require("./data-core.js").MOVEMENTS;

MOVEMENTS.push(
{ id:"M-21", status:"written",  zh:"达达与拼贴", en:"Dada & Collage", era:"1916-1924", region:"瑞士·法国·德国",
  F:{ medium:["cut paper assemblage","found object inclusion"], brush:["torn random paper edge","deliberate anti-craft"], color:["newsprint grey and accident"], light:["no modelled light"], space:["chance meeting of fragments"], motif:["newspaper scrap","machine part","readymade label"], spirit:["ironic sabotage","anti-art refusal"] },
  sty:["dada collage","anti-art"], tags:["flat-print","hard-edge","muted-grey","minimal-empty"],
  desc:"故意把艺术当作玩笑：碎片按偶然相遇并置，材质互不相让，意义留给观众赌一把。",
  note:"别把它收拾得整洁漂亮，凌乱与错位是它的立场。" },

{ id:"M-22", status:"written",  zh:"形而上画派", en:"Pittura Metafisica", era:"1910-1920", region:"意大利",
  F:{ medium:["oil on canvas","hard enamel finish"], brush:["flat squared rendering","mannequin simplification"], color:["harsh Mediterranean light colours","acid shadow green"], light:["low raking unnatural sun","multiple conflicting shadows"], space:["infinite empty square","mannequin distances"], motif:["empty arcade","tailor dummy","lonely tower"], spirit:["uncanny stillness","foreboding nostalgia"] },
  sty:["metaphysical painting","de chirico"], tags:["hard-edge","chiaroscuro-volume","minimal-empty","perspective-linear"],
  desc:"没有人的意大利广场，斜光拉出长影子，物件被放在不该放的位置，安静得让人发慌。",
  note:"“不合常理的并置”是核心，画面一旦讲通逻辑就没有那种悬停感了。" },

{ id:"M-23", status:"written",  zh:"超现实主义", en:"Surrealism", era:"1924-1960", region:"法国·比利时·西班牙",
  F:{ medium:["oil on canvas","grattage and frottage"], brush:["illusionistic rendered surface","impossible combination"], color:["dream saturated or monochrome"], light:["impossible double sky light"], space:["melted logic space","wrong scale relation"], motif:["melting object","levitating stone","desert furniture"], spirit:["subconscious release","erotic dread"] },
  sty:["surrealism","dreamscape"], tags:["tiny-detail","fine-art-depth","saturated-clash","perspective-linear"],
  desc:"一切都画得极像真的，只是绝不可能发生：物性与手段彻底分家，梦自己会推理。",
  note:"这一层必须画得比写实更写实，粗糙的笔触会把梦境降格成涂鸦。" },

{ id:"M-24", status:"written",  zh:"抽象表现主义", en:"Abstract Expressionism", era:"1943-1965", region:"美国",
  F:{ medium:["oil on raw canvas","household enamel paint"], brush:["flung and dripped paint","all-over gesture field"], color:["scale-matched emotion","raw cadmium notes"], light:["no depicted light"], space:["all-over field without centre"], motif:["nocturnal totem","enormous gestural field"], spirit:["heroic subjectivity","scale as confrontation"] },
  sty:["abstract expressionism","action painting"], tags:["broad-gesture","oil-impasto","minimal-empty","flat-decoration"],
  desc:"画布变成战场：泼洒、滴沥、巨大的尺度，笔触本身就是作者的情绪记录仪。",
  note:"这类画面不需要中心构图，一旦出现视觉焦点反而变小。" },

{ id:"M-25", status:"written",  zh:"色域绘画", en:"Colour Field", era:"1950-1975", region:"美国",
  F:{ medium:["stained raw canvas","thinned acrylic soak"], brush:["no brush evidence","stain and pour"], color:["two or three embracing hues"], light:["luminous internally"], space:["edge-to-edge soak haze"], motif:["banded stripe","soft mist rectangle"], spirit:["contemplative silence","dissolved self"] },
  sty:["colour field painting","stain painting"], tags:["minimal-empty","flat-decoration","no-outline","wet-blending"],
  desc:"颜料直接渗进没有涂底的布里，笔痕消失，剩下大块互相吞吐的颜色。",
  note:"任何笔触、任何焦点都会破坏这种\u201c沉进去\u201d的状态。" },

{ id:"M-26", status:"written",  zh:"波普艺术", en:"Pop Art", era:"1956-1975", region:"英国·美国",
  F:{ medium:["acrylic and screenprint on canvas"], brush:["squeegee hard edge","printed dot pattern"], color:["commercial flat colour","day-glo clash"], light:["no shadow whatsoever"], space:["billboard frontal flattening"], motif:["celebrity close-up","soup can","comic panel blowup"], spirit:["ironic consumer critique","deadpan cool"] },
  sty:["pop art","ben-day dots"], tags:["flat-print","hard-edge","saturated-clash","commercial-poster","flat-decoration"],
  desc:"把消费社会的图像再放大成更大的消费图像：专色、网点、硬边，一切都平得理直气壮。",
  note:"画面里出现绘画性的笔触或柔和过渡就丢了那股冷冽劲。" },

{ id:"M-27", status:"written",  zh:"照相写实主义", en:"Photorealism", era:"1968-1985", region:"美国",
  F:{ medium:["acrylic airbrush on canvas","projected grid transfer"], brush:["zero visible stroke","flawless glide"], color:["unbiased recorded colour"], light:["harsh flash-like light","chrome reflection"], space:["camera crop perspective"], motif:["storefront window","chrome diner","urban reflection"], spirit:["cool detachment","mechanical patience"] },
  sty:["photorealism","hyperreal painting"], tags:["photographic","no-outline","hard-edge","perspective-linear"],
  desc:"比照片更像照片：所有笔触被抹掉，反光、镀铬与玻璃承担全部画面趣味。",
  note:"保留任何一点笔触，都会卡在\u201c手绘假装照片\u201d的尴尬位置。" },

{ id:"M-28", status:"written",  zh:"新表现主义", en:"Neo-Expressionism", era:"1978-1995", region:"德国·意大利·美国",
  F:{ medium:["oil on very coarse canvas","scratched and scraped surface"], brush:["violent scumbled drag","scraped into the ground"], color:["acidic dirty clash","provincial heavy earth"], light:["arbitrary red-hot accent"], space:["deliberately crude perspective"], motif:["primitive mask figure","national memory","rawness of myth"], spirit:["deliberate bad taste","confrontational guilt"] },
  sty:["neo-expressionism","bad painting"], tags:["broad-gesture","oil-impasto","saturated-clash","perspective-flat"],
  desc:"故意粗糙、故意难看、故意用力：把表现主义的焦虑重新装上七十年代的肌肉。",
  note:"精致顺滑的收尾词是这一层的毒药，画面需要脏。" },

{ id:"M-29", status:"written",  zh:"街头涂鸦", en:"Street & Urban Art", era:"1975-至今", region:"全球",
  F:{ medium:["spray paint on concrete","urban hard surface"], brush:["aerosol overspray","sharp wildcard cap line"], color:["graffiti chrome and neon"], light:["daylight over rough wall"], space:["scale of the whole train car"], motif:["tag lettering","character throw-up","cracked wall ground"], spirit:["rebellious velocity","territorial claim"] },
  sty:["graffiti art","street art mural"], tags:["hard-edge","saturated-clash","aged-decay","flat-print"],
  desc:"喷罐在粗粝墙面上留下的速度感：垂流、雾化的边缘、超出人身幅度的巨大字母。",
  note:"墙面颗粒与漆的边缘是灵魂，换成画布立刻变成胸针设计。" },

{ id:"M-30", status:"written",  zh:"极少主义", en:"Minimalism", era:"1960-1975", region:"美国",
  F:{ medium:["industrial fabrication","imperial surface finish"], brush:["no authorship trace"], color:["single industrial hue"], light:["gallery neutral raking"], space:["literal single unit"], motif:["serial repetition","gleaming monolith"], spirit:["anti-composition","one thing at a time"] },
  sty:["minimalism","monochrome object"], tags:["minimal-empty","hard-edge","flat-decoration","perspective-flat"],
  desc:"一个东西就是全部：没有起承转合，没有起伏，观众的注意力不允许被分走。",
  note:"任何装饰、任何渐变都会把它拖回 构图经营的旧世界。" },

{ id:"M-31", status:"written",  zh:"新客观主义", en:"Neue Sachlichkeit", era:"1920-1933", region:"德国",
  F:{ medium:["tempera over oil on panel","glassy thin layer"], brush:["chilled smooth detail","razor-sharp edge"], color:["cold sober palette","bilious tint"], light:["harsh frontal clinic light"], space:["tight merciless framing"], motif:["portrait with dead eyes","office machine","empty street"], spirit:["social cynicism","postwar numbness"] },
  sty:["new objectivity","verism"], tags:["tiny-detail","hard-edge","no-outline","muted-grey"],
  desc:"用最冷静的手法画最刺骨的现实：边缘像刀锋一样利落，人的内在却是空的。",
  note:"情感要藏在西班牙语式的冷处理后面，一旦煽情就破功。" },

{ id:"M-32", status:"written",  zh:"维也纳分离派", en:"Vienna Secession", era:"1897-1918", region:"奥地利",
  F:{ medium:["oil with gold leaf","casein tempera"], brush:["ornamental flat pattern","gold-dust contour"], color:["black gold and ochre","symbolist pale rose"], light:["no atmospheric depth"], space:["square format mosaic field"], motif:["kiss embrace","life and death frieze","geometric nimbus"], spirit:["decorative symbolism","fin-de-siecle eroticism"] },
  sty:["vienna secession","klimt gold phase"], tags:["gold-ground","hyper-ornament","flat-decoration","line-primary","perspective-flat"],
  desc:"写实的人脸嵌在满铺的金箔图案里，精神的那部分靠金子的奢华说出来。",
  note:"金不靠渐变来表现，靠的是块的对比与刮痕，\u201c闪\u201d不等于金。" },

{ id:"M-33", status:"written",  zh:"哈德逊河画派", en:"Hudson River School", era:"1825-1875", region:"美国",
  F:{ medium:["oil on canvas","luminist thin layering"], brush:["minute leaf detail","invisible luminous blend"], color:["pantheistic golden light"], light:["luminist interior glow","vast calm sky"], space:["deep receding valley panorama"], motif:["cathedral rock","unspoiled wilderness","settler scale figure"], spirit:["manifest destiny awe","pantheist reverence"] },
  sty:["hudson river school","luminism"], tags:["tiny-detail","fine-art-depth","natural-daylight","line-primary"],
  desc:"把新大陆画成伊甸园：巨大的全景构图，光是从画面内部自己亮起来的。",
  note:"人是点缀，不是主体；一旦人物抢戏，那种宗教感的辽阔就没了。" },

{ id:"M-34", status:"written",  zh:"墨西哥壁画运动", en:"Mexican Muralism", era:"1920-1960", region:"墨西哥",
  F:{ medium:["fresco on monumental wall"], brush:["heavy social contour","flat communal colour"], color:["earth red and pulque blue","pre-hispanic local hue"], light:["no single light source"], space:["narrative stacked wall choreography"], motif:["revolution masses","corn and industry","indigenous face"], spirit:["public pedagogy","revolutionary epic"] },
  sty:["mexican muralism","socialist realism"], tags:["line-primary","flat-decoration","hyper-ornament","perspective-flat"],
  desc:"墙上的人民史：没有哪一个人能独自当主角，一切都服从集体的叙事节奏。",
  note:" \u201c群\u201d的结构先于个人，画面中心构图会毁掉那种壁画书写。" },

{ id:"M-35", status:"written",  zh:"拉美魔幻现实主义", en:"Latin American Magical Realism", era:"1940-1980", region:"拉美",
  F:{ medium:["oil and tempera on board","dream inflected realism"], brush:["meticulous small rendering"], color:["tropical saturated local","hot arid ochre"], light:["unexplained additionallight"], space:["domestic scene with impossible intrusion"], motif:["floating object in courtyard","hybrid creature","longest rainy season"], spirit:["myth and quotidien cohabit","latin american fatalism"] },
  sty:["magical realism painting","surreal latin american"], tags:["tiny-detail","fine-art-depth","saturated-clash","flat-decoration"],
  desc:"最寻常的庭院日常里混进最不寻常的事：一切都画得很实，只是那件事不可能发生。",
  note:"越平静越好，一激动，奇迹就退化成视觉特效。" },

{ id:"M-36", status:"written",  zh:"科幻插画黄金时代", en:"Golden Age Sci-Fi Illustration", era:"1930-1970", region:"美国",
  F:{ medium:["gouache on illustration board"], brush:["designed value block","dry edge modelling"], color:["pulp cover primaries","glowing atmospheresphere"], light:["single dramatic key light"], space:["heroic foreshortening","scale by tiny figure"], motif:["rocket ascending from a strange planet","retro robot","alien cityscape"], spirit:["techno optimism","adventure pulp"] },
  sty:["retro sci-fi illustration","pulp cover art"], tags:["commercial-poster","aged-decay","saturated-clash","hard-edge"],
  desc:"杂志封面的英雄构图：巨大的机械、微小的身影、单一强光，乐观到了天真的地步。",
  note:"现代材质光泽会破坏这种居中构图，务必保住硬边。" },

{ id:"M-37", status:"written",  zh:"奇幻插画", en:"Fantasy Illustration", era:"1970-至今", region:"全球",
  F:{ medium:["oil or acrylic on board","layered glaze fantasy"], brush:["rendered digital realist stroke","luminous edge"], color:["jewel tone scheme","torch warm with cold complement"], light:["multiple magical light sources"], space:["heroic low angle"], motif:["dragon rider","ruined citadel","hooded sorcerer"], spirit:["escapist wonder","heroic romance"] },
  sty:["fantasy illustration","sword and sorcery art"], tags:["tiny-detail","fine-art-depth","saturated-clash","chiaroscuro-volume"],
  desc:"把不可能的世界画到可信为止：材质要经得起近看，光要多点且有色。",
  note:"这一层需要有“贵”的完成度，笔触要收得住，边缘要交代清楚。" },

{ id:"M-38", status:"written",  zh:"概念设计与数字绘景", en:"Concept Art & Matte Painting", era:"1990-至今", region:"全球",
  F:{ medium:["digital painting matte","photobash texture layer"], brush:["soft round digital","photographic texture brush"], color:["limited value-first scheme","atmospheric haze"], light:["volumetric god ray","depth-sorted haze"], space:["ramped depth corridor"], motif:["establishing shot","unused architecture","vehicle silhouette"], spirit:["story before beauty","production readiness"] },
  sty:["concept art","matte painting"], tags:["digital-clean","fine-art-depth","natural-daylight"],
  desc:"为叙事服务的制图学：大气透视分层清楚，边缘半实半虚，一切都说得清为什么在这儿。",
  note:"这是设计图不是作品：过度装饰会影响可读性。" },

{ id:"M-39", status:"written",  zh:"像素与低保真", en:"Pixel & Lo-Fi Digital", era:"1980-至今", region:"全球",
  F:{ medium:["indexed pixel grid","dithered low bit depth"], brush:["visible single pixel tile","dither gradient"], color:["limited eighties palette"], light:["no gradient allowed"], space:["tile-based repeating logic"], motif:["sprite character","chunky ui frame"], spirit:["retro game nostalgia","machine constraint pride"] },
  sty:["pixel art","dithered retro game"], tags:["flat-print","hard-edge","saturated-clash","digital-clean"],
  desc:"受限制而产生美感：色盘固定、过渡只能靠抖动、所有细节算得清清楚楚。",
  note:"任何抗锯齿式的柔和边缘都会立刻毁掉整套语言。" },

{ id:"M-40", status:"written",  zh:"当代超大尺幅写实", en:"Contemporary Large-Scale Realism", era:"1990-至今", region:"全球",
  F:{ medium:["oil on huge linen","smooth refined blend"], brush:["almost invisible stroke","careful edge hierarchy"], color:["photographically sourced local"], light:["single strong studio raking"], space:["extreme close or wide group"], motif:["enormous single portrait","crowd of strangers"], spirit:["monumental ordinary","cold intimacy"] },
  sty:["large scale realism","hyperreal portrait"], tags:["photographic","tiny-detail","fine-art-depth","hard-edge"],
  desc:"把一个普通人放大到纪念碑的尺度：细节纤毫毕现，情绪反而被推得更远。",
  note:"尺度要让人感到压迫，画小了就只是一张数码砂糖。" }
);

if (typeof module !== "undefined" && module.exports) module.exports = { MOVEMENTS };
