/* ============================================================
 * tools/_load.js —— 以固定顺序加载全部数据文件（浏览器加载顺序一致）
 * 用法： var DB = require("./tools/_load.js")();
 * ============================================================ */
var fs = require("fs");
var path = require("path");

var ASSETS = path.join(__dirname, "..", "assets");

// data-core 必须最先；随后是被引用的基础表，最后是画家、名画、签名与引擎
// 注意：新增文件必须登记进本数组，否则加载器会把它排到最后，
// 而它若依赖 operators-meta.js 的挂载结果就会拿到未加工的数据。
var ORDER = [
  "data-core.js",
  "operators.js", "operators-meta.js",
  "movements.js", "movements-modern.js", "movements-east.js", "movements-asia.js",
  "mediums.js", "subjects.js", "optics.js",
  "modules-a.js", "modules-b.js", "modules-c.js", "modules-d.js",
  "painters-cn1.js", "painters-cn2.js", "painters-cn3.js", "painters-cn4.js",
  "painters-jp.js", "painters-italy.js", "painters-ne.js", "painters-north.js",
  "painters-fr1.js", "painters-fr2.js", "painters-world.js", "painters-new.js",
  "painters-asia.js", "painters-modern.js", "painters-extra.js",
  "works.js", "signatures.js",
  "provenance-a.js", "provenance-b.js",
  "tasks.js", "models.js", "relations.js",
  "forge-kit.js",
  /* 模型适配与抽卡：依赖 registry / forge-kit，但都是懒取用
     （函数体内才 require / 查容器），先于 registry 加载不冲突。 */
  "model-prompts.js", "gacha.js",
  /* 纯浏览器视图。必须能被 require 而不抛错 ——
     detail.js 顶部有 typeof module 判断，Node 下直接返回空对象。 */
  "detail.js"
];

function files() {
  var list = ORDER.filter(function (f) { return fs.existsSync(path.join(ASSETS, f)); });
  fs.readdirSync(ASSETS).filter(function (f) {
    return f.endsWith(".js") && ORDER.indexOf(f) < 0;
  }).forEach(function (f) { list.push(f); });
  return list;
}

function load() {
  var core = require(path.join(ASSETS, "data-core.js"));
  files().forEach(function (f) {
    if (f === "data-core.js") return;
    try {
      require(path.join(ASSETS, f));
    } catch (e) {
      console.log("LOAD FAIL " + f + " :: " + e.message);
      throw e;
    }
  });
  // forge-kit 导出的是 { FORGE }，这里直接摊平成引擎实例
  var kit = require(path.join(ASSETS, "forge-kit.js"));
  var out = {
    PAINTERS: core.PAINTERS, MOVEMENTS: core.MOVEMENTS, MEDIUMS: core.MEDIUMS,
    SUBJECTS: core.SUBJECTS, OPTICS: core.OPTICS, WORKS: core.WORKS,
    OPERATORS: core.OPERATORS, CONFLICTS: core.CONFLICTS, SIGNATURES: core.SIGNATURES,
    PROVENANCE: core.PROVENANCE, TASKS: core.TASKS, ATOMS: core.ATOMS,
    TESTS: core.TESTS, RELATIONS: core.RELATIONS,
    TASK_CATS: core.TASK_CATS, MODULE_CATS: core.MODULE_CATS,
    _core: core,
    FORGE: kit.FORGE,
    _kit: kit,
    files: files()
  };
  return out;
}

function stats(db) {
  return {
    PAINTERS: db.PAINTERS.length, MOVEMENTS: db.MOVEMENTS.length,
    MEDIUMS: db.MEDIUMS.length, SUBJECTS: db.SUBJECTS.length,
    OPTICS: db.OPTICS.length, WORKS: db.WORKS.length,
    OPERATORS: db.OPERATORS.length, CONFLICTS: db.CONFLICTS.length,
    SIGNATURES: db.SIGNATURES.length,
    PROVENANCE: db.PROVENANCE.length, TASKS: db.TASKS.length,
    ATOMS: db.ATOMS.length, TESTS: db.TESTS.length
  };
}

module.exports = load;
module.exports.load = load;
module.exports.stats = stats;
module.exports.ORDER = ORDER;
module.exports.ASSETS = ASSETS;
