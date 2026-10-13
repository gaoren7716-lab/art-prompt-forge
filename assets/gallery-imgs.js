/* ============================================================
 * gallery-imgs.js —— 画廊配图清单（纯 UI 数据，不是词条数据）
 *
 * ★ 本文件是**自动生成的派生物，不要手改** ——
 *   node tools/build_standalone.js 会扫 gallery/ 目录，按文件名重写下面这段。
 *
 * 配图方式：把图片放进 gallery/，文件名 = **卡片编码**，
 * 扩展名随意（png / jpg / jpeg / webp，大小写不敏感）：
 *     gallery/G-01.png    ->  签名卡 G-01「古典室内肖像」
 *     gallery/VAR-03.jpg  ->  组合变奏 VAR-03（基于 G-02 的「明暗神话」）
 *   跑一次同步就自动进画廊，不用改任何代码。卡面左上角那个编号就是这里的编码，
 *   而且卡面编号能点（点一下复制「VAR-01.png」），不必手抄。
 *
 *   另有两种历史命名仍认，但请勿新用：页面序号（G-26.png = 第 26 张 = VAR-01）
 *   与库内规范编码（SG-001.png = G-01）。序号命名是当年静默失败的源头 ——
 *   卡面显示序号、清单只认编码，图放进去毫无反应。跑
 *   `node tools/gallery_sync.js --rename` 可把这类文件名就地改成卡片编码。
 *
 * 编码既不是卡片编号、也超出序号范围（如 G-99）时，同步会明确报出来，
 * 不会静默丢图。文件名解析的真源是 tools/gallery_sync.js，本文件只是产物。
 * 下划线开头的文件（_master_*.png 等）视为母版与临时产物，不参与同步。
 *
 * 登记后三件事自动发生：
 *   1. 卡片色卡区自动换成实图（编号与状态徽章浮在图上）
 *   2. 详情浮层顶部出现整幅大图
 *   3. 筛选行出现「全部 · 有图 N」chip，N 现算
 * 暂无任何登记时「有图」筛选不出现 —— 不摆一个点了是空的筛选。
 * standalone 单文件版由 build_standalone.js 把图片转 base64 注入，
 * 不依赖 gallery/ 目录跟随拷贝。
 * ============================================================ */
var GALLERY_IMGS = {
  "G-01": "gallery/G-01.jpg",
  "G-02": "gallery/G-02.jpg",
  "G-03": "gallery/G-03.jpg",
  "G-04": "gallery/G-04.jpg",
  "G-05": "gallery/G-05.jpg",
  "G-06": "gallery/G-06.jpg",
  "G-07": "gallery/G-07.jpg",
  "G-08": "gallery/G-08.jpg",
  "G-09": "gallery/G-09.jpg",
  "G-10": "gallery/G-10.jpg",
  "G-11": "gallery/G-11.jpg",
  "G-12": "gallery/G-12.jpg",
  "G-13": "gallery/G-13.jpg",
  "G-14": "gallery/G-14.jpg",
  "G-15": "gallery/G-15.jpg",
  "G-16": "gallery/G-16.jpg",
  "G-17": "gallery/G-17.jpg",
  "G-18": "gallery/G-18.jpg",
  "G-19": "gallery/G-19.jpg",
  "G-20": "gallery/G-20.jpg",
  "G-21": "gallery/G-21.jpg",
  "G-23": "gallery/G-23.jpg",
  "G-24": "gallery/G-24.jpg",
  "G-25": "gallery/G-25.jpg",
  "VAR-01": "gallery/VAR-01.jpg",
  "VAR-02": "gallery/VAR-02.jpg",
  "VAR-03": "gallery/VAR-03.jpg",
  "VAR-04": "gallery/VAR-04.jpg",
  "VAR-05": "gallery/VAR-05.jpg",
  "VAR-06": "gallery/VAR-06.jpg",
  "VAR-07": "gallery/VAR-07.jpg",
  "VAR-08": "gallery/VAR-08.jpg",
  "VAR-09": "gallery/VAR-09.jpg",
  "VAR-10": "gallery/VAR-10.jpg",
  "VAR-11": "gallery/VAR-11.jpg",
  "VAR-12": "gallery/VAR-12.jpg",
  "VAR-13": "gallery/VAR-13.jpg",
  "VAR-14": "gallery/VAR-14.jpg",
  "VAR-15": "gallery/VAR-15.jpg"
};
var GALLERY_UNCLAIMED = [];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { GALLERY_IMGS: GALLERY_IMGS, GALLERY_UNCLAIMED: GALLERY_UNCLAIMED };
}
