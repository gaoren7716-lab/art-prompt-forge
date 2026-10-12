/* ============================================================
 * check_fields.js —— 字段体检
 *
 * 四类硬伤：
 *   1. 英文面（F 的每个面 / kw / sty / en / add / neg / inject 的取值）里混进非 ASCII
 *      —— 这类污染最危险：它会直接出现在最终提示词里，模型看得懂一半看不懂一半
 *   2. 中文字段（desc / note / zh / c）里混进拉丁连续词
 *   3. 出现 U+FFFD 替换符（说明某个字符已经在传输中损坏）
 *   4. tags 落在语义标签词表之外（写错一个字符，冲突规则就永远不触发且不报错）
 *
 * 为什么有白名单：中文说明里必然出现技术术语（API、LOD、CC0、IIIF），
 * 一律报警等于让人不敢写技术说明。所以：
 *   - TECH  是允许出现在中文里的技术术语表
 *   - PROPER 是允许带变音字母的专有名词表（机构正式名称）
 *   - ENTRY 是条目 ID 正则（引用别人的 id 是正当引用）
 *
 * 用法：node tools/check_fields.js
 * ============================================================ */
const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..", "assets");
const NON_ASCII = /[^\x00-\x7F]/;

/* 合法语义标签词表：Tag 词表是冲突裁决的唯一依据 */
const TAG_VOCAB = new Set([
  "aged-decay", "atmospheric-distance", "broad-gesture", "chiaroscuro-volume",
  "commercial-poster", "cropped-depth", "digital-clean", "embossed-relief",
  "fine-art-depth", "flat-decoration", "flat-print", "gold-ground", "hard-edge",
  "hyper-ornament", "ink-aqueous", "line-primary", "minimal-empty",
  "monochrome-ink", "muted-grey", "natural-daylight", "no-outline", "oil-impasto",
  "painterly-stroke", "panel", "perspective-flat", "perspective-linear",
  "photographic", "polychrome-full", "saturated-clash", "tiny-detail",
  "wet-blending"
]);

/* 允许出现在中文说明里的技术术语（小写比较） */
const TECH = new Set([
  /* 协议 / 格式 */
  "api", "apis", "lod", "sparql", "xml", "json", "jsonld", "rdf", "csv", "url",
  "uri", "url", "http", "https", "iiif", "manifest", "openapi", "endpoint",
  "id", "ids", "qa", "uuid", "qid", "sdt", "web", "services", "service", "v1",
  "v2", "v3", "v4", "v5", "copyleft", "curatorial",
  /* 馆藏与开放数据 */
  "met", "rijksmuseum", "rijks", "artic", "cleveland", "getty", "nga", "bm", "si",
  "opencontent", "accession", "objectid", "thumbnail", "access", "point",
  "openaccess", "key", "demokey", "apikey", "apidata", "gov", "has", "image",
  "img", "tiff", "png", "jpeg", "jpg", "drm", "cc0", "cc", "ccby", "ccbysa",
  "ccbync", "ccbyncsa", "ccby", "sa", "nc", "by", "ncsa", "pdm", "rm", "cma",
  "ccbycsa", "publicdomain", "zero", "creativecommons", "org", "gov", "edu",
  "number", "numbers", "data", "datagov", "representation", "context",
  "wikidata", "ia", "vocab", "isabella", "stewart", "gardner", "motif", "src",
  "british", "museum", "online", "digitised", "qid",
  /* 艺术史 / 博物馆业务 */
  "ulan", "tgn", "aat", "linked", "art", "crm", "icom", "cidoc",
  "edm", "rights", "iif", "iconclass", "europeana", "provenance", "exif",
  "collection", "collections", "portrait", "still", "life", "graph", "oai",
  "pmh", "dc", "mets", "metsmods", "lido", "iiifmanifest",
  /* 模型与生成 */
  "ip", "adapter", "lora", "controlnet", "sdxl", "flux", "schnell", "dev",
  "cfg", "sampler", "samplers", "steps", "checkpoint", "embeddings",
  "neg", "positive", "prompt", "prompts", "token", "tokens", "weights",
  "github", "cloudflare", "demokey", "original", "en", "comfyui",
  /* 本库自身的字段名（中文里引用字段是正当引用） */
  "preserve", "forbid", "change", "role", "region", "am", "sd", "sd3", "mj",
  "gpt", "sdxl", "flux", "wan", "kling", "seed", "vae", "lcm",
  /* 生成模型产品名：中文里直接用产品名，不硬译 */
  "midjourney", "mj", "v7", "v6", "niji", "ideogram", "firefly", "dalle",
  "stable", "diffusion", "turbo", "lightning", "hyper", "civitai", "openart",
  /* 连字符复合词：切词会把它们拆开，所以整词登记 */
  "ip-adapter", "controlnet", "openaccess", "open-content",
  /* 说明性缩写 */
  "etc", "vs", "ex", "e", "g", "i", "ii", "iii", "n", "s", "w", "e",
  "kb", "mb", "gb", "px", "dpi", "rgb", "cmyk", "hsl", "hd", "uhd", "fps"
]);

/* 允许带变音字母的专有名词（值按小写比较） */
const PROPER = new Set([
  "paris musée", "paris musées", "musees", "musées"
]);

/* 条目 ID：中文里引用别人的 id 是正当引用。
   位数要同时容许两位旧 ID 与三位新编码 ——
   第二版加了 codes.js 之后，P-IT-007 / G-001 / O-01-001 都成了正式引用形式，
   只认两位会把这些全判成「中文混拉丁」。
   末段写成 {2,3} 而不是 {2}，是为了同时覆盖 P-CN01 与 P-CN-001。 */
const ENTRY_RE = /\b(?:P-[A-Z]{2}-?\d{2,3}|M-\d{2,3}|S-\d{2,3}|MD-\d{2,3}|OP-[A-Z]-\d{2,3}|W-\d{2,3}|G-\d{2,3}|O-\d{2,3}|O-\d{2}-\d{3}|AM-[0-9A-Z]-?\d{2,3}|PV-\d{2,3}|T-\d{2,3}|R-\d{2,3}|CF-\d{2,3}|MT-\d{2,3})\b/g;

/* 字段引用：中文里写 WORKS.src、PAINTERS.region、F.motif 是正当引用，
   这类全大写的表名与它后面的字段名一并剥掉 */
const FIELDREF_RE = /\b[A-Z][A-Z]{2,}(?:\.[a-zA-Z]+)?\b/g;

const files = fs.readdirSync(BASE).filter(f => f.endsWith(".js"));
let bad = 0;

function flag(kind, file, no, detail) {
  console.log(`${file}:${no}  [${kind}] ${detail}`);
  bad++;
}

/* 把中文里出现的拉丁词过滤掉白名单内的，返回真正可疑的 */
function suspects(v) {
  const stripped = v.replace(/`/g, " ")
    .replace(ENTRY_RE, " ")
    .replace(FIELDREF_RE, " ")
    .replace(/\bCC[\s-]?BY[\s-]?NC[\s-]?SA\b/gi, " ")
    .replace(/\bCC[\s-]?BY[\s-]?SA\b/gi, " ")
    .replace(/\baccess_point\b/gi, " ")
    .replace(/\bJSON[\s-]?LD\b/gi, " ")
    .replace(/\bDEMO_KEY\b/g, " ")
    .replace(/\?[\w=&]+/g, " ");
  const hits = stripped.match(/[A-Za-z][A-Za-z'_-]{1,}/g) || [];
  return hits.filter(w => {
    const k = w.toLowerCase().replace(/’/g, "'");
    return !TECH.has(k);
  });
}

function scanLine(ln, file, no) {
  if (ln.indexOf("�") >= 0) flag("坏字符", file, no, ln.trim().slice(0, 70));

  /* 1) 英文面：F:{ ... } 整段必须纯 ASCII */
  const fm = ln.match(/F:\{(.*)\}/);
  if (fm && NON_ASCII.test(fm[1])) flag("英文面混入非 ASCII", file, no, fm[1].trim().slice(0, 90));

  /* 2) 英文词字段 */
  ["kw", "sty", "en", "add", "neg", "only", "keep", "a", "b", "scope", "t", "alt"].forEach(k => {
    const mm = ln.match(new RegExp("\\b" + k + ":\\s*(\"[^\"]*\"|\\[[^\\]]*\\])"));
    if (!mm) return;
    if (NON_ASCII.test(mm[1])) {
      const v = mm[1].replace(/^\[|\]$/g, "");
      /* 专有名词白名单 */
      const clean = v.replace(/["',]/g, "").toLowerCase().trim();
      if (PROPER.has(clean) || v.split(/["']/).some(p => PROPER.has(p.toLowerCase().trim()))) return;
      flag("英文面混入非 ASCII", file, no, `${k}: ${mm[1].slice(0, 80)}`);
    }
  });

  /* inject 的值同样必须是纯 ASCII（它会进最终提示词） */
  const im = ln.match(/\binject:\{(.*)\}/);
  if (im && NON_ASCII.test(im[1])) flag("英文面混入非 ASCII", file, no, `inject: ${im[1].trim().slice(0, 90)}`);

  /* 3) 中文字段 */
  ["zh", "desc", "note", "c", "read", "fix", "msg", "seen", "fact", "test", "why", "whyNot", "check", "warningNote"].forEach(k => {
    const mm = ln.match(new RegExp("\\b" + k + ":\\s*\"((?:[^\"\\\\]|\\\\.)*)\""));
    if (!mm) return;
    /* 专有名词例外：产品与工具名本身就带拉丁字母，
       硬译反而不准（「Midjourney」没有对应的通行中文名，
       译成「中途旅程」只会让人认不出）。逐词豁免，不整条豁免 ——
       整条豁免会让「中文说明里混进一整个英文句子」也放过去。 */
    const words = mm[1].split(/[\s·、，,与和（）()]+/).filter(Boolean);
    const allProper = words.length > 0 && words.every(w => TECH.has(w) || PROPER.has(w.toLowerCase()));
    if (allProper) return;
    const hits = suspects(mm[1]);
    if (hits.length) flag("中文混拉丁", file, no, `${k}: ${hits.join(",")} | ${mm[1].slice(0, 40)}`);
  });

  /* 4) tags 词表 */
  const tm = ln.match(/\btags:\s*\[([^\]]*)\]/);
  if (tm) {
    (tm[1].match(/"([^"]*)"/g) || []).forEach(raw => {
      const t = raw.slice(1, -1);
      if (!TAG_VOCAB.has(t)) flag("非法语义标签", file, no, `"${t}" 不在词表内 —— 冲突裁决将永远不触发`);
    });
  }
}

files.forEach(fn => {
  fs.readFileSync(path.join(BASE, fn), "utf-8").split("\n")
    .forEach((ln, i) => scanLine(ln, fn, i + 1));
});

console.log(bad === 0 ? "\n字段体检通过：未发现污染" : `\n合计问题：${bad} 处`);
process.exit(bad === 0 ? 0 : 1);
