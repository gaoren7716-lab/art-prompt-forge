/* ============================================================
 * dedupe_role.js —— 清理同一对象里重复书写的 role 字段
 *
 * 起因：modules-*.js 批量生成时用了
 *   { id:"AM-801", role:"lead", status:"tested", cat:8, ..., role:"lead", ... }
 * 两处 role 的写法。JS 对象字面量允许重复键，后一个覆盖前一个，
 * 所以运行期没报错，但文件里留着就是噪声：改前一处不生效，
 * 后来的人会以为改 role 没用而怀疑引擎。
 *
 * 实现：按 `id:"..."` 把文件切成一个个对象块，
 * 块内若出现两次以上 `role:"x"`，只保留第一次。
 * 靠正则猜对象边界不可靠（嵌套数组里的字符串会干扰），所以这么做。
 *
 * 幂等：跑第二遍不会再删任何东西。
 * 用法：node tools/dedupe_role.js [--check]
 * ============================================================ */
const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..", "assets");
const CHECK = process.argv.indexOf("--check") >= 0;

const ROLE = /role:"([a-z]+)"/g;

let total = 0;
fs.readdirSync(BASE).filter(f => /^modules-/.test(f)).sort().forEach(fn => {
  const p = path.join(BASE, fn);
  const src = fs.readFileSync(p, "utf8");

  /* 以 `id:"XXX"` 为块起点；块内第一次 role 保留，其余删除 */
  let n = 0;
  let seenInBlock = false;
  const out = src.replace(/id:"([A-Z0-9-]+)"|role:"([a-z]+)"/g, (m, id, role) => {
    if (id) { seenInBlock = false; return m; }
    if (!seenInBlock) { seenInBlock = true; return m; }
    n++;
    return "";   /* 删掉第二次及以后的 role */
  });

  if (!n) return;
  /* 删除后可能留下多余空格与双逗号 */
  const tidy = out
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s*\}/g, " }");

  total += n;
  console.log(`  ${fn}  重复 role ${n} 处`);
  if (!CHECK) {
    fs.writeFileSync(p, tidy, "utf8");
    try {
      new Function(tidy);
    } catch (e) {
      fs.writeFileSync(p, src, "utf8");
      console.log(`    语法校验失败，已回滚：${e.message}`);
      total -= n;
    }
  }
});

console.log(CHECK
  ? (total ? `\n发现 ${total} 处重复 role（--check 模式未写入）` : "\n没有重复 role")
  : (total ? `\n已清理 ${total} 处重复 role` : "无需清理"));
