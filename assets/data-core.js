/* ============================================================
 * data-core.js —— 全局容器、「七面」定义、状态机与信息分类
 *
 * 为什么用 var：浏览器 <script> 顶层 const 不会挂到 global object，
 * Node 的 vm 沙箱同样取不到，会报 XXX is not defined。
 * 各 data-*.js 通过 push / concat 自我注册，所以本文件必须最先加载。
 * ============================================================ */

var PAINTERS  = [];   // 画家
var MOVEMENTS = [];   // 流派 / 运动
var MEDIUMS   = [];   // 媒介 / 技法
var SUBJECTS  = [];   // 题材
var OPTICS    = [];   // 横切词条（光 / 构图 / 色彩 / 肌理 / 呈现）
var WORKS     = [];   // 名画
var OPERATORS = [];   // 变形算子
var CONFLICTS = [];   // 冲突规则
var SIGNATURES = [];  // 手写大师签名卡

/* ---- 第二版新增的六层结构容器 ---- */
var PROVENANCE = [];  // 来源与许可登记（外部标准 / 开放馆藏 / 词表授权）
var TASKS      = [];  // 任务模板（用户带着什么诉求来）
var ATOMS      = [];  // 原子视觉模块（12 类，比 OPTICS 更细且带 role）
var TESTS      = [];  // 模型实测记录（第六层：验证）
var RELATIONS  = [];  // 关系边（创作者→作品→材料→机构 等）

/* ---------- 七面：每个风格体（画家 / 流派 / 名画）都按这七个维度拆 ---------- *
 * 拆面的意义在于「可解构」：
 *   想要整条 → 七面全取，签名卡直接用
 *   想要零件 → 只取其中一面（例如只取莫兰迪的灰调、只取梵高的旋笔）
 *   想要融合 → 甲的笔法 + 乙的色彩 + 丙的空间，各自加权
 */
var FACETS = [
  { k: "medium", zh: "媒介底材", desc: "画面靠什么物质承载" },
  { k: "brush",  zh: "笔法肌理", desc: "痕迹是怎么留在画面上的" },
  { k: "color",  zh: "色彩关系", desc: "颜色之间怎么相处" },
  { k: "light",  zh: "光的处理", desc: "明暗怎么介入形体" },
  { k: "space",  zh: "空间构图", desc: "东西怎么摆、透视怎么走" },
  { k: "motif",  zh: "固定母题", desc: "这个人反复画的是什么" },
  { k: "spirit", zh: "精神气质", desc: "画面背后那口气是什么" }
];

/* 受冲突影响时会互相牵连的面：媒介与笔法是一组（都讲物质），
   空间与构图是一组（都讲摆位）。裁决时按组静音，避免一套停一半 */
var FACET_GROUPS = {
  "medium": ["medium", "brush"],
  "brush":  ["medium", "brush"],
  "space":  ["space"]
};

/* ============================================================
 * 状态机：任何「可以变成提示词」的实体都该带一个 status
 *
 * 为什么要有这个：一条写得漂亮但没在模型上跑过的提示词，
 * 和一条被三个模型验证过的提示词，可信度差一个量级。
 * 界面上必须让使用者一眼看出自己拿到的是哪一种。
 * ============================================================ */
var STATUS = [
  { k: "collected", zh: "已收录", order: 1,
    desc: "实体已建档，事实与出处已核对，但还没有写成提示词" },
  { k: "written", order: 2, zh: "已编写",
    desc: "七面已填满，能直接出提示词，但没有在模型上验证过" },
  { k: "tested", order: 3, zh: "已测试",
    desc: "至少在一个模型上跑过并留存了结果记录（见 TESTS）" },
  { k: "reviewed", order: 4, zh: "已复核",
    desc: "由第二个来源交叉核对过，出处、年代、归属均无争议" }
];
var STATUS_KEYS = STATUS.map(s => s.k);
function statusOf(e) { return (e && e.status) || "written"; }

/* ============================================================
 * 信息分类：一条描述到底是哪一种事实，必须标出来
 *
 * 混在一起会出现典型事故：把「模型实测有效」当成「 art史事实」
 * 引用出去。本库约定所有描述字段按下列四类取名，check_fields 会校验。
 * ============================================================ */
var INFO_KINDS = [
  { k: "fact",  zh: "历史事实", prefix: "fact",
    desc: "有出处的、可外部核验的客观陈述：年代、归属、材质、尺寸、收藏机构",
    field: "fact" },
  { k: "seen",  zh: "视觉观察", prefix: "seen",
    desc: "看画时能直接看见的：笔触方向、明度分布、构图位置",
    field: "seen" },
  { k: "read",  zh: "创作解释", prefix: "read",
    desc: "作者或研究者的意图推断、以及本库给出的用法建议",
    field: "read" },
  { k: "test",  zh: "模型实测", prefix: "test",
    desc: "在具体模型上跑出来的结果与失败类型，换模型可能就不成立",
    field: "test" }
];
var INFO_KIND_KEYS = INFO_KINDS.map(k => k.k);

/* ============================================================
 * 模块角色：不是所有模块都该同等说话
 *
 * 主导 lead    —— 决定画面主语言，其他模块为它让路
 * 辅助 support —— 补充质感与细节，可被权重削减
 * 局部 region  —— 只作用于画面某一块，用于分区并存
 * 约束 guard   —— 硬性边界，任何情况下不得被权重覆盖
 * ============================================================ */
var ROLES = [
  { k: "lead", zh: "主导", w: 1.0, fixed: false,
    desc: "决定画面的主语言，其他面为它让路" },
  { k: "support", zh: "辅助", w: 0.7, fixed: false,
    desc: "补充质感与氛围，权重可调低甚至归零" },
  { k: "region", zh: "局部", w: 0.6, fixed: false,
    desc: "只作用于画面某个区域，与另一套语言分区共存" },
  { k: "guard", zh: "约束", w: 1.0, fixed: true,
    desc: "硬性边界（例如不要文字、不要水印），权重对它无效" }
];
var ROLE_KEYS = ROLES.map(r => r.k);

/* 冲突三级：明确矛盾 / 局部并存 / 实验性混合 */
var CONFLICT_LEVELS = [
  { k: "hard", zh: "明确矛盾", action: "ask",
    desc: "两套语言在同一诉求下无法同时成立，必须由使用者选择保留哪一套" },
  { k: "regional", zh: "局部并存", action: "split",
    desc: "整体上冲突，但可以分配到画面不同区域共存，引擎给出分区建议" },
  { k: "soft", zh: "可共存", action: "warn",
    desc: "只是张力，不互斥，保留提示即可" },
  { k: "experimental", zh: "实验性混合", action: "allow",
    desc: "允许组合但尚未验证，输出时必须标注未验证" }
];
var CONFLICT_LEVEL_KEYS = CONFLICT_LEVELS.map(c => c.k);

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PAINTERS, MOVEMENTS, MEDIUMS, SUBJECTS, OPTICS, WORKS, OPERATORS, CONFLICTS, SIGNATURES,
    PROVENANCE, TASKS, ATOMS, TESTS, RELATIONS,
    FACETS, FACET_GROUPS,
    STATUS, STATUS_KEYS, statusOf,
    INFO_KINDS, INFO_KIND_KEYS,
    ROLES, ROLE_KEYS,
    CONFLICT_LEVELS, CONFLICT_LEVEL_KEYS
  };
}
