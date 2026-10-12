#!/usr/bin/env node
/* 画廊配图核对：gallery/ 里的图与卡片配方是否对得上。
 *
 * 为什么需要：配图只要命名对就能自动进画廊（build_standalone.js 按文件名同步），
 * 但「进得去」不等于「对得上」—— 一张图挂到配方不符的卡片上，
 * 卡片复制出来的提示词与图讲的不是一回事，比没图更误导。
 * 构建只管同步，本工具只管核对，两者职责不混。
 *
 *   如果图与配方对不上，必须显式写进下面的 ACCEPTED 挂账名单（写清原因与日期），
 *   否则脚本一律算异常、退出码 1。不能靠「反正它也没报错」糊过去 ——
 *   上一条被这么糊过去的图（VAR-02 那张），卡上写的还是基底 G-01 的药剂师窗户，
 *   客户照着一张倒奶女工的图复制提示词，两边根本不是一回事。
 *
 *   名单之外出现的新出入 = 新问题，拦住；已经在名单里的 = 已知欠账，
 *   卡面有 imgNote 徽章、用户看得见，不重复报警。
 *
 * 判定分三档，如实标注不做美化：
 *   match    图与配方同题材同画家 —— 名画恰好就是这张配方的原型
 *   partial  题材对、画家不对（或反之）—— 卡片的 desc 需要加一句说明
 *   unknown  图内容无法从像素判断 —— 需要人工看一眼（人名/年份是否对得上）
 *
 * 用法：node tools/gallery_check.js         （有未挂账的出入时退出码 1）
 *      node tools/gallery_check.js --quiet  （构建流程里调用，只打印不判码）
 * 输出：逐张一行，末尾给汇总
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const db = require("./_load.js")();
const FORGE = db.FORGE;

/* 图片自身不携带作者信息，所以只能核对「题材层」——
   配方声明的 subject / painter / medium 与图里能认出的画派是否同族。
   名画同题材同画派就标 match，跨画派标 partial。 */
function specFacts(spec) {
  const painters = (spec.painters || []).map(p => {
    const r = FORGE.find(p && typeof p === "object" ? p.id : p);
    return r && r.e ? (r.e.en || r.e.zh) : "?";
  });
  const subjects = (spec.subjects || []).map(s => {
    const r = FORGE.find(s && typeof s === "object" ? s.id : s);
    return r && r.e ? (r.e.en || r.e.zh) : "?";
  });
  return { painters, subjects };
}

/* 目录扫描与「文件名 -> 卡片」解析统一走 gallery_sync.js ——
   两边各写一份的话，G-26.png 在同步那边认成 VAR-01、在核对这边认成
   「库里没有这张卡片」，同一件图两种说法。 */
const gsync = require("./gallery_sync.js");

/* 已知的「名画 ↔ 配方」对应关系。
 * 这不是猜：配方里的 recurring elements 字段本来就是从这些名画的
 * 反复出现的元素里提炼的，两者同源可比。配方改了这里要跟着复核。 */
const KNOWN_PAIRS = {
  "G-01": { verdict: "match", note: "配方 recurring 写明 milkmaid + allegory of painting（维米尔《牛奶女工》系）" },
  "G-02": { verdict: "partial", note: "配方画家是卡拉瓦乔（P-IT14），图是提香《哀悼基督》—— 同为暗背景强明暗的宗教群像，但画家不同" },
  "G-03": { verdict: "match", note: "布格罗《维纳斯的诞生》：配方 recurring 写明 cherubs + mother and child，画中即三人构图" },
  "G-04": { verdict: "match", note: "康斯特勃《戴德姆谷》：配方 recurring 写明 hay wain + dedham vale，与画中干草车、赶车人一致" },
  "G-05": { verdict: "match", note: "里维拉壁画：配方 recurring 写明 apple industry mural + revolution history，与画中苹果装箱与工厂一致" },
  "G-06": { verdict: "match", note: "列宾《伏尔加河上的纤夫》：配方 recurring 写明 barge haulers，与画中纤夫一致" },
  "G-07": { verdict: "match", note: "范宽《溪山行旅图》：三远法 + 主峰占满 + 雨点皴，与配方「massif filling the whole frame」一致" },
  "G-08": { verdict: "match", note: "倪瓒《容膝斋图》：一河两岸 + 枯树 + 茅亭，与配方「water divides two empty banks」一致" },
  "G-09": { verdict: "match", note: "徐渭《墨葡萄图》：泼墨葡萄 + 蟹 + 苇，配方 recurring 写明 wild grape vine crab and reed peony of grief" },
  "G-10": { verdict: "match", note: "唐卡护法神：配方 recurring 写明 wrathful protector，画中即蓝身金刚；矿物颜料层次与金地也对上" },
  "G-11": { verdict: "match", note: "葛饰北斋《神奈川冲浪里和富岳三十六景》：配方 recurring 写明 great wave + red fuji，画中浪与赤富士同框" },
  "G-12": { verdict: "match", note: "穆夏式海报：配方 recurring 写明 theatre posters + flower crowned woman，画中即花冠女子 + 顶部留白标题带" },
  "G-13": { verdict: "match", note: "俄国幻想插画：配方 recurring 写明 russian fairy tales + firebird，画中即火焰鸟 + 夜巡 + 鬼魂游行；画风偏早期俄式装饰（比里宾更古拙），题材同族" },
  "G-14": { verdict: "match", note: "波斯细密画（比赫扎德《春之园》一系）：配方 recurring 写明 hunting ground + building of the castle，画中即骑马狩猎与山顶城堡；青金石与金的配色照合" },
  "G-15": { verdict: "match", note: "尾形光琳《红白梅图屏风》：配方 recurring 写明 red and white plum trees + irises at yatsuhashi，画中红白梅 + 燕子花 + 金地 + 靛蓝水波全对上" },
  "G-16": { verdict: "match", note: "比亚兹莱式自画像蚀刻：配方写明 self portrait + artist facing mirror + painting tools，画中即对镜自画与画具；plate impression edge 的版画压痕边、裱纸纹理、网线暗调全对得上" },
  "G-17": { verdict: "match", note: "达利《记忆的永恒》一系：配方 recurring 写明 melting clock + door + crutches horizon，画中熔化钟挂枯枝、浮空的门、拐杖细腿支撑物、无限梦境地平线、星球与星云全对上" },
  "G-18": { verdict: "match", note: "蒙克《卡尔·约翰街的傍晚》：配方写明 boulevard street + pedestrians in motion + shop front，画中大道深透视 + 人群 + 店招 GRAND CAFE / MODES 与炽热天空全对上" },
  "G-19": { verdict: "partial", note: "配方写「没有形象，只有两块悬着的颜色」（罗斯科式色域），配图在色块前加了一个人形剪影 —— 调子对、画面多了一个具象的人，色块边缘也比配方要求的硬" },
  "G-20": { verdict: "match", note: "沃霍尔式丝网九宫格：同一张脸重复 + 平涂错版色，与配方「同一张脸重复几十次、必须平得像机器印的」一致" },
  "G-21": { verdict: "match", note: "科幻概念设计：干净透视的巨型结构 + 湿地反光 + 真实天候，与配方「未来被画成一个可用的产品」一致" },
  "G-23": { verdict: "match", note: "双画家融合：梵高旋笔（涡旋星空）+ 北斋木版结构（东方山峦、竖排题字与印章），与配方「梵高七成、北斋三成」一致" },
  "G-24": { verdict: "match", note: "解构莫兰迪（P-IT16）的灰调落到海景：低饱和灰绿、只取配色不取笔法，与配方「只要莫兰迪的那层灰」一致" },
  "G-25": { verdict: "match", note: "印象派题材（干草堆、睡莲池塘、柔光）退成摄影质感、笔触消失，与配方「让印象派退回相册、画质切大画幅」一致" },
  "G-22": { verdict: "partial", note: "配方是吉格尔（P-MD08）的生物机械：金属与骨骼长在一起、冷金属高光；配图里没有任何生物机械结构，是一位躺在暗织物上的人体（明暗调子同族，题材完全不同）。这张还是裸露人体，与画廊其他配图的类型不一致，建议换成配方生成的生物机械图" },
  "VAR-01": { verdict: "match", note: "基于 G-01 换「家居室内」：维米尔式单侧窗光 + 房间纵深 + 日常动作，与变奏题材一致" },
  "VAR-02": { verdict: "partial", note: "基于 G-01 换「静物」，配图却是窗边倒奶的室内场景、画面中央有人物 —— 窗光与器物的调子同源，题材多了一个人" },
  "VAR-03": { verdict: "partial", note: "基于 G-02 换「神话场面」，配图是卡拉瓦乔《圣马太蒙召》的博物馆实拍照片（画框/展签/玻璃反光），不是本库配方生成的画面，且馆藏影像有版权限制" },
  "VAR-04": { verdict: "match", note: "基于 G-04 换「海景」：风暴海面 + 压低的地平线 + 湿漉大气，与变奏题材一致" },
  "VAR-05": { verdict: "match", note: "基于 G-05 换「战争与历史」：里维拉式纪念碑构图 + 壁画群像，与变奏题材一致" },
  "VAR-06": { verdict: "partial", note: "基于 G-06 换「宫廷宴集」，配图是河岸码头的历史场面（纤夫拉船 + 台阶上的华服贵族 + 金顶教堂）—— 人物密度与油彩厚度同基底一脉，但不是「宴集」（宴饮席面），是码头仪式与劳役" },
  "VAR-07": { verdict: "match", note: "基于 G-07 换「北宋式荒野」：主峰占满全幅 + 雨点皴 + 悬瀑 + 山径行旅，右侧题「溪山行旅圖」—— 与基底范宽一路的北宋山水语汇完全同源" },
  "VAR-08": { verdict: "partial", note: "基于 G-09 换「大写意走兽」：徐渭语汇全在（泼墨飞白、葡萄、蟹、牡丹、红色点染、题款钤印），但画中主体是猛禽（鹰/鹭）立石，题材写的是「走兽」—— 语汇对得上、主体是禽不是兽" },
  "VAR-09": { verdict: "match", note: "基于 G-10 换「志怪护法卷」：蓝身忿怒护法居中 + 日月双悬 + 随侍群像 + 下方供养场面，与基底唐卡护法一路的矿物颜料与金地层次完全同源" },
  "VAR-10": { verdict: "match", note: "基于 G-11 换「浮世绘海浪」：北斋《神奈川冲浪里》的大浪 + 舟 + 赤富士，与基底配方 great wave + red fuji 一致" },
  "VAR-11": { verdict: "match", note: "基于 G-12 换「新艺术花卉」：穆夏 1900 巴黎装饰艺术博览会海报 —— 花冠女子 + 顶部标题带 + 城市水岸背景，与基底穆夏式海报同源" },
  "VAR-12": { verdict: "match", note: "基于 G-13 换「童话市井」：火焰鸟盘旋 + 俄式城堡群 + 集市人群 + 边饰纹样，与基底俄式幻想插画同族（画面即俄文「童话集市」标题）" },
  "VAR-13": { verdict: "match", note: "基于 G-17 换「超现实家居」：达利语汇全在（细腿拐杖、抽屉、通向无限地平线的门、石膏头像），落进一间室内，与基底达利一路一致" },
  "VAR-14": { verdict: "match", note: "基于 G-18 换「表现主义群像」：蒙克《生命之舞 / 桥上的少女》一系 —— 一列女性立于水边、落日与扭曲血色的天空、峡湾倒影与岸边白屋，与基底蒙克一路（G-18）完全同源" },
  "VAR-15": { verdict: "match", note: "基于 G-21 换「科幻深空」：巨型行星 + 星云 + 悬浮塔体 + 未来载具 + 湿地反光的平台与商业招牌（ORION），与基底科幻概念设计一路一致" }
};

/* 已确认的欠账：明确知道图与配方有出入、且当前决定先留着。
 * 名单里的卡面都挂了 imgNote 徽章，用户在画廊里看得见，不是只有这份文件知道。
 * 不在此名单的出入一律算异常（退出码 1）—— 「新增的图没核对过」正是
 * 这个库最容易悄悄发生的事：图自动进去了，没人看一眼，卡与图就各说各话。
 * 处理掉一条就删一条，别让名单变成挡箭牌。 */
const ACCEPTED = {
  "G-02": "配方卡拉瓦乔、图是提香《哀悼基督》（2026-10-13 挂账，待换图或改配方画家）",
  "G-19": "罗斯科式色域配方上多了一个人形剪影（2026-10-13 挂账）",
  "G-22": "吉格尔生物机械配方配了无关人体、且为裸露内容（2026-10-13 挂账，建议换图）",
  "VAR-02": "基底 G-01 换静物，图中多人物（2026-10-13 挂账）",
  "VAR-03": "博物馆实拍真迹照片，非本库配方生成，有版权限制（2026-10-13 挂账）",
  "VAR-06": "宫廷宴集配方配了码头劳役场面（2026-10-13 挂账）",
  "VAR-08": "卡名「走兽」配了禽鸟立石（2026-10-13 挂账；题材 S-25「动物写生」含羽毛，禽鸟不越界，卡名比题材窄）"
};

/* opts.quiet：只输出「需要处理」的部分。
 * 构建流程里调用它（同进程，不走 spawn —— 本机 spawn 一律 EBUSY），
 * 一次构建打 29 行核对明细会把别的日志淹掉，所以那边只要异常。 */
function main(opts) {
  const quiet = !!(opts && opts.quiet);
  const say = quiet ? () => {} : (s) => console.log(s);
  const g = gsync.resolveGallery();
  const imgs = g.entries;
  if (!imgs.length) {
    say("gallery/ 里还没有配图。放图方式：文件名 = 卡片编码，扩展名 png/jpg/jpeg/webp。");
    return { total: 0, tally: { match: 0, partial: 0, unknown: 0 }, notes: [] };
  }
  const zhOf = (code) => {
    const sig = db.SIGNATURES.filter(s => s.id === code)[0];
    if (sig) return sig.zh;
    const v = g.table.zhById.get(code);
    return v ? v + "（变奏）" : "（无卡片）";
  };
  say("画廊配图核对（编码 → 卡片配方 → 判定）\n");
  const tally = { match: 0, partial: 0, unknown: 0 };
  const notes = [];
  const unaccounted = [];   /* 名单之外的新出入 —— 才算异常 */
  const seen = new Set();
  for (const { code, raw } of imgs) {
    seen.add(code);
    const known = KNOWN_PAIRS[code];
    const v = known ? known.verdict : "unknown";
    tally[v]++;
    const mark = v === "match" ? "OK " : v === "partial" ? "△  " : "?  ";
    const label = zhOf(code);
    /* 文件名与卡片编码不一致时把原名带出来（按序号命名的老文件） */
    const asFile = raw === code ? "" : "   文件 " + raw + ".png";
    say("  " + mark + code.padEnd(8) + label.padEnd(18) + (known ? known.note : "未核对") + asFile);
    if (v === "match") continue;
    notes.push(code + " " + label + "：" + (known ? known.note : "未核对"));
    /* 没核对过、或核对出出入却没挂账 —— 都是必须处理的新问题。
       挂过账的只提示、不判码：已知欠账卡面有徽章写着，不重复喊。 */
    if (!ACCEPTED[code]) unaccounted.push(code);
  }
  /* 挂账名单与核对表里的条目，得真有对应的图 ——
     图被删了名单还留着，下次就分不清「已处理」还是「图没了」。 */
  const stale = Object.keys(ACCEPTED).filter(c => !seen.has(c))
    .concat(Object.keys(KNOWN_PAIRS).filter(c => !seen.has(c)));
  /* 文件名认不出来的一并报 —— 它们不在 entries 里，容易整批漏掉 */
  g.orphans.forEach(o => {
    notes.push(o + "：文件名既不是卡片编码、也超出页面序号范围，这张图不会显示");
    unaccounted.push(o);
  });
  say("\n合计 " + imgs.length + " 张：一致 " + tally.match
    + " / 有出入 " + tally.partial + " / 待核" + tally.unknown);
  if (g.aliases.length) {
    say("（其中 " + g.aliases.length + " 张文件名还是页面序号形态："
      + g.aliases.map(a => a.from + "→" + a.to).join("、")
      + " —— 跑 node tools/gallery_sync.js --rename 改成卡片编码）");
  }
  if (stale.length) {
    console.log("核对表里有 " + stale.length + " 条指向不存在的图（图删了表没删）："
      + stale.join("、"));
  }
  if (notes.length) {
    console.log("配图核对有 " + notes.length + " 条有出入（"
      + notes.length + " 条里 " + (notes.length - unaccounted.length) + " 条是已挂账的旧账）：");
    notes.forEach(n => console.log("  - " + n));
  }
  if (unaccounted.length) {
    console.log("\n其中 " + unaccounted.length + " 条未挂账 —— 这是新问题，必须处理："
      + unaccounted.join("、"));
    console.log("看过图、决定先留着的话，把它连原因和日期写进 tools/gallery_check.js 的 ACCEPTED，"
      + "并在卡片上加 imgNote（用户得在画廊里看得见，不能只有这份文件知道）。");
  } else if (imgs.length) {
    console.log("\n全部配图均已核对：一致的 " + tally.match + " 张，"
      + "另有 " + (tally.partial + tally.unknown) + " 张出入已在 ACCEPTED 挂账、卡面有徽章。");
  }
  return { total: imgs.length, tally, notes, unaccounted, stale };
}

module.exports = { main, KNOWN_PAIRS, ACCEPTED };

if (require.main === module) {
  const r = main();
  /* 有未挂账的出入就是失败 —— 否则「图自动进去了」这件事永远没人看得见 */
  process.exit(r.unaccounted && r.unaccounted.length ? 1 : 0);
}