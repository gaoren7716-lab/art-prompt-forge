# SCHEMA · 数据契约

所有数据都在 `assets/*.js` 里，用 `var XXX = []` 声明容器、条目自我注册（`push`）。
**不要用 `const`**：浏览器 `<script>` 顶层与 Node `vm` 沙箱的 `const` 不会挂到全局，会报 `XXX is not defined`。

加载顺序很重要：`data-core.js` 必须最先，各条目文件随后，`forge-kit.js` 最后。
每个数据文件头尾这样写：

```js
if (typeof module !== "undefined" && module.exports) var WORDS = require("./data-core.js").WORDS;
WORDS.push( /* ... */ );
if (typeof module !== "undefined" && module.exports) module.exports = { WORDS };
```

---

## 通用规则（违反会被 `check_fields.js` 拦下）

| 约束 | 原因 |
| --- | --- |
| 英文面（`F.*` / `kw` / `sty` / `en` / `add` / `neg` / `inject` / `only` / `keep`）必须是纯 ASCII | 这些词会直接进最终提示词，混入非 ASCII 会让模型读懂一半 |
| 中文字段（`zh` / `desc` / `note`）必须是纯中文 | 串进英文单词会同时污染可读性与检索 |
| 中文字段里引用条目 ID（`P-CN11`、`OP-D-01`）算正当引用 | 体检脚本已对这些模式开白名单 |
| `tags` 必须落在语义标签词表内 | 写错一个字符，冲突规则就永远不触发，且不报错 |
| 不得出现 U+FFFD 替换符 | 说明字符在传输中已损坏 |

---

## 1. FACETS · 七面

每个风格体（画家 / 流派 / 名画 / 部分媒介与题材）都按同样七个维度拆。这是「可解构」的前提。

| key | 中文 | 回答什么 |
| --- | --- | --- |
| `medium` | 媒介底材 | 画面靠什么物质承载 |
| `brush` | 笔法肌理 | 痕迹是怎么留在画面上的 |
| `color` | 色彩关系 | 颜色之间怎么相处 |
| `light` | 光的处理 | 明暗怎么介入形体 |
| `space` | 空间构图 | 东西怎么摆、透视怎么走 |
| `motif` | 固定母题 | 这个人反复画的是什么 |
| `spirit` | 精神气质 | 画面背后那口气是什么 |

**FACET_GROUPS**：冲突裁决时按组静音，避免一套语言停一半。

```js
{ "medium": ["medium","brush"], "brush": ["medium","brush"], "space": ["space"] }
```

---

## 2. Painter · 画家

```js
{ id:"P-CN11", zh:"范宽", en:"Fan Kuan", life:"约950-1032", mv:"北宋全景", mvId:"M-42", region:"中国",
  F:{ medium:[…], brush:[…], color:[…], light:[…], space:[…], motif:[…], spirit:[…] },
  sty:["fan kuan","northern song monumental"],
  tags:["monochrome-ink","fine-art-depth","tiny-detail"],
  desc:"一句话讲清楚他的画到底特别在哪。",
  note:"使用时的注意事项：什么必须保留，什么一改就废。" }
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | ✓ | `P-{地区}{两位序号}`，如 `P-CN11` / `P-FR13` / `P-AS01` / `P-MD01` / `P-FX01` |
| `zh` / `en` | ✓ | 中文名纯中文，英文名纯 ASCII（不要用变音字母，`pietà` 要写成 `pieta`） |
| `life` | ✓ | 生卒年，用 `约` 表示不确定，在世用 `1952-` |
| `mv` / `mvId` | ✓ | 所属流派，`mvId` 必须能在 MOVEMENTS 里查到 |
| `region` | ✓ | 国家或地区，用于界面筛选与盘点 |
| `F` | ✓ | 七面，每面 2–3 个英文词条（多了会被 CAP 截断，少了不足以描述） |
| `sty` | ✓ | 署名层，进最终提示词的最后一段，会被加权 `()` 或 `::` |
| `tags` | ✓ | 语义标签，冲突裁决的唯一依据 |
| `desc` / `note` | ✓ | 中文。`note` 尤其重要：它写的是「什么改一下就废了」 |

---

## 3. Movement · 流派

结构与 Painter 相同，`id` 为 `M-{两位序号}`。目前 64 条，编号分区：

| 区段 | 范围 |
| --- | --- |
| 西方十五至十九世纪末 | M-01 – M-20 |
| 二十世纪至今 | M-21 – M-40 |
| 中国六朝至近现代 | M-41 – M-52 |
| 日本 · 朝鲜 | M-52 – M-58 |
| 波斯 · 印度 · 奥斯曼 · 东南亚 · 藏地 | M-59 – M-64 |

---

## 4. Work · 名画

```js
{ id:"W-10", zh:"溪山行旅图", en:"Travelers among Mountains and Streams",
  pid:"P-CN11", year:"约1000", mvId:"M-42", F:{…}, tags:[…], desc:"…", note:"…" }
```

比画家多两个字段：`pid`（作者，必须在 PAINTERS 里存在）、`year`（年代，可以是中文如 `南宋`）。

**名画的优先级是 40**，低于画家的 60：同时挂名画与画家时，画家的语言压得住名画；只挂名画时，得到的是这一次具体的构图与母题。

---

## 5. Medium · 媒介

`MD-{两位序号}`，优先级 **80**（高于画家 60）。挂上媒介，画家的物质层让位。28 条。

## 6. Subject · 题材

`S-{两位序号}`，优先级 **85**。额外字段：

| 字段 | 说明 |
| --- | --- |
| `cat` | 分类（人物 / 叙事 / 静物 / 日常 / 风景 / 东方 / 幻想 / 设计 / 生物） |
| `kw` | 关键词，作为最终提示词的第一段（题材优先） |
| `F` | 通常只给 `space`，因为题材天然带一套默认构图 |

## 7. Optic · 横切光学词条

按「组」存放，勾选时取具体的 `items[].t`。

```js
{ id:"O-01", zh:"光影", slot:"light", items:[
    { code:"O-01-001", zh:"明暗对照", t:"chiaroscuro", c:"强侧光塑造体积…" } ] }
```

**每个词条必须有 `code` 与 `zh`**，不是可选项：

- ★ `code` 字段是**旧 ID**（形如 `O-01-001`），**不是规范编码**。
  它是词条的主键，`registry.js` 拿它当 `oldId` 去 `codes.js` 派生规范码
  （`OP-001` 这样）。规范码是派生的，**不写在这里** ——
  写进来就变成两处维护，改一处必然与另一处漂移。

  读 `code` 时必须过登记表拿规范码，否则工作台按新码查不到旧码的条目，
  症状是「配方盘里有光学词条，但点「词」打不开提示词」：

  ```js
  var reg = REGISTRY.byCode(item.code);   // → OP-001
  ```

- `zh` 是人工定稿的短名，**不能从 `c` 自动截取** —— 截断结果里有「夜」「主体居中」「倦怠」
  这种不成词的片段，当检索键等于没有。

`zh` 一旦发布不可改：用户可能已经把它写进自己的提示词存档。
改了等于让那些存档失效。要改就新增一条、把旧的标 `status:"collected"` 留作历史。

**跨层同名是已知冗余，不是缺陷**：84 个词条里有 27 个与原子模块同名
（`明暗对照` 对应 `AT-001` 与 `OP-001`，连 `c` 都一字不差）。
原子模块多带 `role` 与 `slot`，能参与组装；光学词条只是一枚裸词，但便于一次多选。
解析器按层级收敛（原子模块优先），界面上标出「另有同名的光学词条」。
**不要为了消除重名去删任何一份** —— 删掉就有一层用不了了。

`OPTIC_SLOT` 把组名映射到投放面：

| 组 | 投放面 |
| --- | --- |
| 光影 / 时间与天候 | `light` |
| 空间透视 / 构图取景 | `space` |
| 色彩关系 | `color` |
| 肌理与呈现 | `medium` |
| 笔触控制 | `brush` |
| 气氛情绪 | `spirit` |

光学词永远追加在最后且不被 CAP 截断。

---

## 8. Operator · 变形算子

**算子是数据不是代码**。往 `OPERATORS` 加一项就是新增一种玩法，引擎一行都不用改。

```js
{ id:"OP-D-01", type:"解构", zh:"只取色彩关系", en:"Colour Only",
  only:["color"], add:[…], neg:[…], tags:["flat-decoration"],
  desc:"…", note:"…" }
```

| 字段 | 作用 |
| --- | --- |
| `keep` | 保留哪些面 |
| `only` | 只取这几面（解构专用，取各 `only` 的交集） |
| `inject` | 往指定面塞词（`{light:["no cast shadow"]}`） |
| `add` | 追加散词，排在署名之后、画质之前 |
| `neg` | 追加负面词 |
| `tags` | 参与冲突裁决 |

编号：`OP-{类别}-{序号}`，类别为 `E` 时代 / `M` 媒介 / `S` 题材 / `D` 解构 / `F` 融合 / `P` 呈现。

**算子的优先级恒定为 100，且裁决时永不退让** —— 它代表用户的明确意图。

### 变形三字段（preserve / change / forbid）

光说「变形」说不清变形会动什么、不能动什么，所以每个算子额外声明三件事：

| 字段 | 含义 | 引擎行为 |
| --- | --- | --- |
| `preserve` | 必须原样保留的面，变形的底线 | 其余来源在这些面上权重再高也不覆盖 |
| `change` | 变形实际要改的面 | 这些面上其他来源让位给算子 |
| `forbid` | 绝对不能出现的特征 | 直接进负面词，不参与权重调节 |

```js
// operators-meta.js（自动生成，不要手写）
{ id:"OP-E-01",
  preserve:["brush","color","spirit","motif"],
  change:["medium","light","space"],
  forbid:["modern lighting","modern furniture","electric wires","plastic material",…] }
```

**三字段是推导出来的，不是填出来的。** `tools/gen_op_meta.js` 从算子的
`keep` / `only` / `inject` 反推：不在 `inject` 里被触及的面默认归入 `preserve`，
被 `inject` 触及的归入 `change`，`neg` 归入 `forbid`。

手写必然出现「既保留又改同一面」的自相矛盾，而且这种矛盾在运行时**不报错**——
只是效果与预期不符，极难排查。所以：

- 改算子结构（`keep` / `only` / `inject`）后**必须**重跑 `node tools/gen_op_meta.js`
- 生成器会校验 `preserve` 与 `change` 零交集、每个面都被归类，校验不过直接失败
- `operators-meta.js` 头部写着「自动生成，不要手工编辑」

## 9. Conflict · 冲突规则

```js
{ id:"CF-03", level:"hard", a:"photographic", b:"painterly-stroke",
  scope:["medium","brush"], msg:"照片语言要求无笔触，绘画语言要求笔触可见", fix:"…" }
```

### 四级冲突

把所有撞车都当成「二选一」是错的。四种级别对应四种不同的用户处境：

| 级别 | 含义 | 引擎动作 | 谁该做什么 |
| --- | --- | --- | --- |
| `hard` 明确矛盾 | 无法同时成立 | 静音低权重一方 | 使用者必须选一套 |
| `regional` 局部并存 | 整体冲突但可分区共存 | 给出分区建议 | 配合遮罩落实，或改用 `region` 角色模块 |
| `soft` 可共存 | 只是张力，不互斥 | 仅提示 | 什么都不用做 |
| `experimental` 实验性混合 | 允许但尚未验证 | 输出时标注未验证 | 知道自己在冒险即可 |

`regional` 级额外带 `region` 字段，写明怎么切：

```js
{ id:"CF-06", level:"regional", a:"muted-grey", b:"saturated-clash",
  scope:["color"],
  region:{ aSide:"主体与大面积", bSide:"小面积点缀", seam:"靠中性色过渡带隔开" },
  msg:"…", fix:"…" }
```

**`experimental` 必须在输出里留下痕迹。** 引擎会把未验证标注追加到自然语言正文末尾，
否则使用者会以为这条配方和别的配方一样可靠。

裁决算法：

```text
得分 = 类型优先级(work 40 / movement 50 / painter 60 / medium 80 / subj 85 / op 100) + 权重 × 10
取两侧各自最高分的一方为胜者
level=hard          → 败方在 scope 波及的面（含成组连带）上被静音，记入 changes
level=regional      → 不静音，记入 changes 并附 region 分区建议
level=soft          → 只出提示，允许共存
level=experimental  → 允许，置 experimental 标志
```

## 10. Signature · 签名卡

`G-{两位序号}`。`spec` 字段是一份可直接喂给 `FORGE.compose()` 的完整配方：

```js
spec:{ subjects:[…], works:[…], movements:[…], painters:[{id,w}],
       mediums:[…], operators:[…], optics:[…], atoms:[{id,role?}],
       strength:1.0, platform:"sd" }
```

---

# 第二版：六层架构的新契约

前面十节是「一个风格体长什么样」。下面八节是「除了风格体之外还需要什么」。
起因是这个库要回答的不只是「怎么写提示词」，还有「这条信息可不可信、能不能商用、换模型还成不成立」。

## 11. STATUS · 四级验证状态

**任何可以变成提示词的实体都必须带 `status`。** 缺省值是 `written`。

| key | 中文 | 含义 |
| --- | --- | --- |
| `collected` | 已收录 | 实体已建档，事实与出处已核对，但还没写成提示词 |
| `written` | 已编写 | 七面已填满，能直接出提示词，但没在模型上验证过 |
| `tested` | 已测试 | 至少在一个模型上跑过并留存了结果记录（见 TESTS） |
| `reviewed` | 已复核 | 由第二个来源交叉核对过，出处、年代、归属均无争议 |

```js
function statusOf(e) { return (e && e.status) || "written"; }
```

**为什么这么较真**：一条写得漂亮但没在模型上跑过的提示词，和一条被三个模型验证过的提示词，
可信度差一个量级。混在一起会让人调半天参数，最后怀疑是模型的问题。
把状态标出来，使用者就知道自己拿到的是哪一种。

**`written` 是默认值这件事必须写在文档最显眼处**，否则读者会把「已编写」读成「已核实」。
批量打标用 `tools/stamp.js`（幂等，只在 `{ id:"XXX",` 后插入固定 token）。

## 12. INFO_KINDS · 信息分四类

一条描述到底是哪一种事实，必须标出来。混在一起会出现典型事故：
把「模型实测有效」当成「艺术史事实」引用出去。

| 字段 | 类别 | 含义 |
| --- | --- | --- |
| `fact` | 历史事实 | 有出处的、可外部核验的客观陈述：年代、归属、材质、尺寸、收藏机构 |
| `seen` | 视觉观察 | 看画时能直接看见的：笔触方向、明度分布、构图位置 |
| `read` | 创作解释 | 作者或研究者的意图推断，以及本库给出的用法建议 |
| `test` | 模型实测 | 在具体模型上跑出来的结果与失败类型，**换模型可能就不成立** |

`check_fields.js` 会校验这四个字段的使用。`read` 是判断不是事实，
`test` 只在对应模型上成立，引用时必须带上限定。

## 13. ROLES · 四种模块角色

不是所有模块都该同等说话。区别在于**权重能不能压过别人**：

| 角色 | 中文 | 默认权重 | 引擎行为 |
| --- | --- | --- | --- |
| `lead` | 主导 | 1.0 | 决定画面主语言，其他面为它让路 |
| `support` | 辅助 | 0.7 | 补充质感与氛围，权重可调低甚至归零 |
| `region` | 局部 | 0.6 | 归集到 `regionAtoms`，**不直接进任何一面** |
| `guard` | 约束 | 1.0 | 强制进负面词，**权重对它无效** |

`ROLE_DEFAULT = { lead:1.0, support:0.7, region:0.6, guard:1.0 }`。

**`guard` 不是「权重高一点的建议」，是硬边界。** 约束类模块（禁文字水印、禁手部畸变、
禁现代物件）无论谁在主导都必须生效，所以引擎对它们跳过权重调节。

**`region` 不给遮罩就等于没生效。** 引擎只把它归集到返回值的 `regionAtoms`
并在界面提示需要遮罩落实。这类模块集中在 `modules-d.js`，且**必须成对出现**——
一条给主体区、一条给背景区，各自的 `region.pairWith` 指向对方：

```js
{ id:"AM-D01", role:"region", cat:4, slot:"space",
  t:"foreground subject in focus", zh:"前景主体实焦", c:"…",
  alt:["sharp detailed foreground subject"],
  read:"分区方案里给主体区用。与 AM-D05 的背景处理配对，两者同时上才成立。",
  region:{ zone:"foreground", pairWith:"AM-D05" } }
```

配对断裂（`pairWith` 指向不存在的 id）应当在体检里报错，否则这类模块会永远静默失效。

## 14. ATOMS · 原子视觉模块

比 OPTICS 更细的一层：`OPTICS` 是**横向词表**（按类别组织、一次多选、永远追加在最后），
`ATOMS` 是**带角色的单元**（一次指定一个角色、可进负面）。

```js
{ id:"AM-101", role:"lead", status:"tested", cat:1, slot:"light",
  t:"chiaroscuro", zh:"明暗对照", c:"强侧光塑造体积，暗部吃掉一半画面",
  alt:["strong side lighting","dramatic light shadow"],
  read:"一旦画面里有第二个光源，这一条立刻失效。" }
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | ✓ | `AM-{类别}{两位序号}`，如 `AM-101` / `AM-C09` / `AM-D01`。**这是旧 ID**，规范码是 `AT-001` 这样，由 `codes.js` 派生 |
| `role` | ✓ | 四选一，决定引擎怎么处理它 |
| `cat` | ✓ | 1–12，见 `MODULE_CATS`（光影 / 时间天候 / 空间透视 / 构图取景 / 色彩关系 / 笔触肌理 / 材料年代 / 形体轮廓 / 气氛情绪 / 叙事与时间 / 镜头与密度 / 输出用途） |
| `slot` | ✓ | 投放到哪个面，与 `cat` 的默认 slot 一致 |
| `t` | ✓ | 进提示词的英文词条，纯 ASCII |
| `zh` / `c` | ✓ | 中文名与释义 |
| `alt` | | 同义替换，模型对某个词不敏感时换着试 |
| `read` | ✓ | **这条什么时候会失效**，比 `c` 更重要 |
| `guard` | | 仅 `guard` 角色需要，与 `role:"guard"` 同时出现 |
| `region` | | 仅 `region` 角色需要，含 `zone` 与 `pairWith` |

**不要在同一个对象里写两次 `role`。** JS 允许重复键、后一个覆盖前一个，运行期不报错，
但改前一处不生效，后来的人会以为引擎坏了。`tools/dedupe_role.js` 专门清这个（幂等）。

## 15. TASK · 任务模板

以前签名卡按「题材 + 画家」分类，但使用者真正的入口是「我要做一张海报」，
不是「我要一张风景」。按任务组织，才对得上实际工作流。

```js
{ id:"T-01", cat:1, status:"tested",
  zh:"一键成品", en:"One-click Output",
  ask:"给我一张梵高风格的向日葵",           // 使用者通常怎么开口
  goal:"不填任何参数，点一下就得到一段能用的提示词",
  slots:["painter","subject"],              // 缺一个就出不了好图
  default:{ subjects:["S-12"], painters:["P-NE06"], strength:1, platform:"sd" },
  check:["画面里有没有出现不该有的现代物件",
         "笔法是否可辨，而不是只有色调像"],  // 出图后必须自己看一眼
  why:"这条路最省事，但也是最容易出问题的：模型很容易只学到画家的色调，把笔法丢掉。",
  how:"先看 FORGE.ready(pid) 的输出，确认七面都进去了；如果只有色彩在，优先检查该画家的 tags 是否带了冲突标签被误静音。",
  sigs:["G-01","G-07","G-12"] }
```

`why` 与 `how` 不是可选的注释。`check` 尤其重要：**它是使用者唯一会真正执行的质检步骤**，
写清楚比写「注意质量」有用一百倍。

## 16. RELATIONS · 关系边

画家、名画、签名卡各自的字段只能记「自己是什么」，记不住「和谁有什么关系」。

```js
{ kind:"held_by", from:"W-11", to:"故宫博物院", status:"written",
  note:"图像权利与可商用性以 PROVENANCE 里对应机构的登记为准" }
```

| `kind` | 方向 | 强度 |
| --- | --- | --- |
| `held_by` | 作品 → 收藏机构 | 事实 |
| `uses` | 作品 → 承载材料 | 事实 |
| `student_of` | 画家 → 画家 | **强，可照搬** |
| `influenced` | 画家 → 画家 | **弱，只能借鉴** |
| `derived_from` | 签名卡 → 母版 | 事实 |
| `serves` | 卡片 → 任务 | 推荐关系 |
| `realizes` | 签名卡 → 原子模块 | 构成关系 |
| `aligned_with` | 实体 → 外部标准 | 映射声明 |

**师承与影响必须分成两种 `kind`，不能混。** 混在一张表里，就会在融合提示词时
把「借鉴」当成「传承」来用。方向的约定是「派生者 → 被派生者」，方便单向下钻。

边的写法刻意模仿 CIDOC CRM：谁、做了什么、对象是谁，分成独立字段而不是一句话——
因为一句话没法反向索引。

**只记不能由现有字段推出的边。** 例如作品的作者已经在 `WORKS.pid` 里，
不要再写一条 `created` 边，否则同一信息两处维护，早晚漂移。

## 17. PROVENANCE · 来源与许可

这一层回答一个具体问题：**这张图能不能商用？**

```js
// 机构
{ id:"PV-30", cat:"museum", status:"reviewed",
  zh:"大都会艺术博物馆", en:"Metropolitan Museum of Art",
  org:"The Metropolitan Museum of Art",
  uri:"https://collectionapi.metmuseum.org/",
  endpoint:"https://collectionapi.metmuseum.org/public/collection/v1",
  license:"CC0", commercial:true, attribution:false, key:false,
  bulk:"GitHub 上有公开 CSV 数据集",
  coverage:"开放获取图像约二十余万件",
  fact:"…", seen:"…", read:"…", note:"…",
  src:"Met Collection API 与开放获取项目页", retrieved:"2026-10" }

// 许可类型
{ id:"PV-20", cat:"license", code:"CC0",
  commercial:true, attribution:false, sharealike:false, modify:true, … }
```

| 字段 | 说明 |
| --- | --- |
| `cat` | `standard` 外部标准 / `license` 许可类型 / `museum` 开放馆藏 / `self` 本库自身 |
| `commercial` | **能否商用。这是商用判断的唯一依据** |
| `attribution` | 是否需署名 |
| `sharealike` / `modify` | 许可类型条目用 |
| `key` | 接口是否需要密钥 |
| `warning` | 仅列为提醒不要误用（如大英博物馆禁止商用） |
| `src` / `retrieved` | 出处与检索时间 |

**「库里的东西」不是一个法律主体，至少四条独立的许可线**：本库代码 / 本库原创提示词 /
名画图像（各馆不同）/ 外部标准本体（各机构不同）。
把它们混成一句「本库采用某许可」是最常见的错误。PV-40 明确写了不能套用到作品图上。

`dist/commercial-ok-sources.json` 单独导出可商用清单，做商用前先查那份。

## 18. TEST · 模型实测

**同一段提示词在不同模型上行为差别极大。** 括号权重在 SD 系有效、在 Flux 上基本被忽略；
CFG 与步数的可用区间在几代模型之间整体下移。记成实测数据，才不会拿 SD 的经验去调 Flux。

```js
{ id:"MT-04", model:"Flux.1 dev", family:"flux", gen:"2024", status:"tested",
  weightSyntax:"none (ignores parentheses)", weightEffect:"接近无效",
  negPrompt:"支持但效果弱",
  naturalLang:"支持良好，长句可读",
  cfg:[2.5,4.5], cfgDefault:3.5, steps:[20,30],
  promptStyle:"自然语言长句，可带从句",
  idealLen:[40,120],
  failTypes:["套用括号权重后画面与不加权重无差别"],
  fact:"…", seen:"…", test:"…", note:"…" }
```

`failTypes` 是这一层最有价值的字段：**成功案例到处都有，失败案例才决定你少走多少弯路。**

平台方言：`spec.platform` 支持 `sd` / `mj` / `gpt` / `flux`。
`flux` 方言不输出括号，改为把权重词就地重复一次（`t + " " + t`）。

---

# 第三版：编码与引用层

这一层解决三件事：**要看清库里有哪些类型**、**要单独取某一块**、**要组合**。

## 19. CODES · 统一编码表

```js
CODES.SEGMENTS   // 段码登记表
CODES.derive(id) // 旧 ID → 规范 code（纯函数）
CODES.add(id)    // 登记并返回 code，幂等
CODES.CODE_OF    // code → 旧 ID
CODES.OLD_OF     // 旧 ID → code
CODES.UNCODED    // 派生失败的条目，交人工处理
```

**为什么不直接改 `id` 加长编码**：`id` 已被签名卡 spec 与 306 条关系边引用，
改掉就砸掉所有已验证的引用。所以另建一层 `code` 专供组合引用。

### 两条不可让步的约定

1. **`code` 一旦发布不可改。** 改它等于让用户手里的组合串全部失效。
   新增条目只往后追加序号，**永不重排旧号**。
2. **`code` 是引用锚点，不是内容。** 改了中文名不影响 `code` 解析 ——
   解析走 `CODES` 的映射表 + `RESOLVER` 的索引，不读数据源的 `zh`。

### 编码形态

**全库只有一种形态**：两字母段码 + 连字符 + 三位数字，长度恒为 6。

```
^[A-Z]{2}-\d{3}$        PA-125  AT-001  OP-004  SG-001  RL-306
```

段码固定两字母，15 段两两不同且**互不为前缀**（若 `P` 是 `PA` 的前缀，
`P-001` 会被误判成 PA 段）。`check_codes.js` 逐条断言这两条。

上一版曾有四种形态并存（`P-IT-007` / `AM-101` / `AM-A-001` / `O-01-001`），
问题不在于「多了一种」，而在于**同一个位置放了三种不同的语义** ——
中段分别是国别、类别、分组。语法相同、含义不同，
`AM-101` 与 `O-001` 肉眼无法区分，组合串长了之后人眼没法校验、
机器也没法用一条正则解析。现在段码只表达「这是哪一层」，
国别/类别/分组降级为字段（`region` / `cat` / `groupId`）。

### ★ 原子模块段为什么是 `AT` 而不是 `AM`

旧 ID 恰好就是 `AM-101` 这种「AM + 数字」形态。若新码也叫 `AM-001`，
字符串 `AM-101` 会**同时是**「三层纵深的旧 ID」和「另一个条目的新码」——
解析时给哪一个都不对，给错就是静默返回别人的内容。

段码改 `AT`（Atom）后两套编码落在不同空间，零冲突。
`CODES.add()` 里有一条断言守这个约束，`check_codes` 里也有一条。

同理光学分组单列 `OG` 段：它与词条挤在同一段时，
「OP-001 是组还是词」永远说不清。

### 序号

**数字位恒为三位。** 画家 205、原子模块 126、关系边 306，
两位撑到 99 就撞号；三位可到 999，中途新增只往后追加。

**序号不保证连续**：`PV` 段是 `PV-001~008` / `PV-020~023` / `PV-030~040`，
因为旧 ID 本身分三批编号。为了连续而重排会让 PROVENANCE 的引用脱节。
真正要防的是「一号两用」，那在 `add()` 里已拦。

### 派生

`derive(oldId)` 把旧 ID 映射到新 code。它是**纯函数，不读数据源**，
所以永远不会和数据漂移。不符合任一形态时返回 `null`，
由 `add()` 汇总进 `UNCODED`，**绝不静默丢弃** ——
漏编一条就等于用户永远找不到它。

四段需要显式对照表（`PA_MAP` / `AM_MAP` / `OR_MAP` / `OP_MAP`），
其余九段只做前缀改名 + 补零。**必须显式写死而不能按注册顺序自动编号**：
自动编号意味着「在 `painters-cn2.js` 中间插一位画家，后面所有画家的 code 全部平移」，
已发出去的组合串全废。显式对照表把序号钉死，插入新条目只在段末追加。

`legacyCode(oldId)` 按**上一版的规则**重建旧 code，
`add()` 把它挂到对应条目的新 code 上（`LEGACY_OF` / `ALIASES`）——
用户手里已有的 `P-IT-007` / `AM-A-001` / `G-001` 必须继续能查。
靠「旧规则纯函数 + 新规则查表」两步，不手工维护 779 条别名 ——
手工表一定会漏。

新增旧 ID 形态时要同步改 `codes.js` 的 `derive()` 与 `tools/check_codes.js` 的断言，
否则新条目会以「未编码」的身份悄悄进来。

## 20. REGISTRY · 全库登记

```js
REGISTRY.total            // 可引用条目总数
REGISTRY.SEGMENTS         // 段码表（带 count 与 composable）
REGISTRY.byKind           // 层级分布
REGISTRY.KIND_ZH          // 层级 → 中文名
REGISTRY.COMPOSABLE       // 哪些层级能直接进提示词
REGISTRY.META_KINDS       // 元层为什么不能进
REGISTRY.relations        // 带编码的关系边
REGISTRY.byCode(code)     // code → 条目
REGISTRY.listSeg(seg)     // 某段全部条目
REGISTRY.composableCount(seg)
```

`COMPOSABLE` 区分**可组合**与**元层**：

| 层级 | 可组合 | 说明 |
| --- | --- | --- |
| 画家 / 流派 / 名画 / 媒介 / 题材 / 算子 / 原子模块 / 光学词条 | 是 | 视觉零件 |
| 签名卡 | 否 | 一整套已配好的 spec，该**套用**而非往里加词 |
| 任务模板 | 否 | 流程起点，不是视觉零件 |
| 冲突规则 | 否 | 由引擎自动裁决 |
| 来源许可 / 模型实测 | 否 | 查证用，不是提示词内容 |
| 光学分组 | 否 | 用它的词条而不是组本身 |

这个区分错了，UI 就会允许用户把 `PV-020`（CC0 许可名称）塞进提示词里 ——
**不会报错，只会让结果莫名其妙**。所以在 `toSpec()` 阶段就挡掉。

### 短码别名表

许可与模型这两层的名称又长又带版本号（`CC0 1.0 公共领域奉献`、
`Stable Diffusion 1.5 / 2.x`），而用户脑子里存的是 `CC0`、`SD1.5`。

`registry.js` 的 `SHORT` 表显式登记这些短码。**键用的是旧 ID（`PV-20` / `MT-01`）
而不是规范 code（`PV-020` / `MT-001`）** —— 早先按 code 写表，一条都没命中，
而 `tightForm()` 派生的别名又把空格全删了（`SD 1.5` → `SD15`），
症状是「`CC0` 根本查不到」。两处症状同一个原因：查表用错了键。

改这张表时记得两件事：
- 键必须是数据源里的旧 ID（两位），不是 code（三位）
- `CC BY-NC-SA` 这类要连字符的写法要整词登记，
  因为切词会把它们拆成 `CC` 和 `BY-NC-SA` 两个都查不到的碎片

## 21. RESOLVER · 八路解析

```js
RESOLVER.register(code, oldId, zh, en, opts)
RESOLVER.resolve(input)      // → { ok, code, zh, kind, shadowed, why }
RESOLVER.resolveMany(input)  // → { ok, okList, dupList, badList, ambList, chain }
RESOLVER.splitItems(str)     // 智能拆分
RESOLVER.toSpec(resolved)    // → 引擎认识的 spec
```

八条入口：

| 输入 | 例子 | 说明 |
| --- | --- | --- |
| 规范编码 | `PA-125` | 唯一、可排序、机器友好 |
| 旧 ID | `P-IT07` | 历史主键，向后兼容 |
| 上一版编码 | `P-IT-007` | 已对外发布过，继续能查 |
| 省略零位 | `PA-7` | 只在**已存在**的编码上生效 |
| 中文名 | `达·芬奇` | |
| 英文名 | `Caravaggio` | |
| 光学英文词 | `chiaroscuro` | 横切词条专有入口 |
| 常用短码 | `CC0` `SD1.5` `MJ v7` | |

`toCode()` 按「原样 → 别名表 → 缺零补齐」三步收敛，全部走映射表不猜。

**缺零必须只对已存在的编码生效。** 若写成「补完再查表」，
某段超过 999 条时序号会静默回绕到别人的号上。段码还必须是已登记的两字母段，
否则「随便一串字母加数字」都会被当编码去试，徒增歧义。

### 五条硬约定

0. **`resolveMany()` 按 code 去重。** 用户新旧写法混着写会出现
   `P-IT07 + PA-125` 这种串，两者指同一条目。不去重的话 `toSpec()` 会 push 两次，
   配方里同一个零件出现两遍，权重被算成 2.0，效果与用户意图完全不同，
   而界面上看不出任何异常。去重后回传 `dupList`，界面提示「已合并」而不是默默吞掉。

1. **查不出来必须说「找不到」并给最接近的候选，绝不返回一个猜测。**
   假编码会一路错到出图那一步才暴露，那时用户已经填了一堆东西。

2. **`register()` 必须幂等。** 同一 code 重复注册时早退，
   否则同一别名被 push 两次，解析时命中两条同一个条目，
   而 `lookup()` 的同层判定会把它报成「同层重名（数据缺陷）」——
   把一个注册 bug 误报成数据错误，排查方向会被带偏。

3. **`push()` 按 code 去重。** 中文名既走 `zhKeys()` 进 `byTerm`，
   又可能出现在 `kw` / `alt` 里（`MT-001` 的 `zh` 就是 `SD 1.5`，
   而 `kw` 里也有 `SD 1.5`），不去重就会重复登记。

4. **跨层同名按层级收敛，同层同名报数据缺陷。**
   `ORDER_RANK` 里 `atom` 排在 `optic` 之前：两者中文名常相同，
   但原子模块多了 `role` 与 `slot`，能真正参与组装。
   收敛后把被遮住的项挂到 `shadowed` 上，界面照实显示「另有同名的光学词条」。

### 组合串的拆分

```js
RESOLVER.splitItems("PA-125 明暗对照 单侧窗光")
// → ["PA-125", "明暗对照", "单侧窗光"]
```

**不能简单地把空格当分隔符**：本库有一批名字自带空格
（`MT-001` 的「SD 1.5」、`PV-020` 的「CC0 1.0 公共领域奉献」），
按空格拆会把 `SD 1.5` 变成 `SD` 和 `1.5` 两项，都查不到。

策略是「强分隔符先切，再对每段做贪心回填」：

1. 先按 `+` / 逗号 / 分号切开（这些绝不可能出现在名字里）
2. 整块能解析就直接收（快路径）
3. 否则按空格切词，贪心地往后吞并到「能解析」为止

贪心而非回溯：本库条目名最长不过十余字，回溯能解的情况贪心都能解，
而回溯会让复杂度上一个量级。

### 组合串的报错

`resolveMany()` 里错一项时**整体 `ok=false`**，同时：

- `badList` 精确指出是哪一项错了，并给最接近的候选
- `okList` 仍单独返回正确项，改掉错的那项就能继续用

**不因为一个笔误丢掉整串**，也不因为整串失败就吞掉正确项。

## 22. 关系边的编码

306 条关系边也各有 `code`（`R-001` ~ `R-306`）。

**必须全局连续编号，不能按 `kind` 各起一份。**
按类型编号会让 8 种类型互相撞码 —— 306 条边实际只剩 45 个不同编码，
「`R-001` 指向哪条边」完全说不清，引用就失去了意义。

类型信息不靠编码承载，靠 `kind` 字段筛选。

关系边**不进 `RESOLVER`**：它们不是可引用的零件，
而是「这条边存在」的事实说明。把它们放进组合串拼不出任何东西。
但它们的编码仍然导出（`dist/relations.json`），
这样「我要用这条师承关系」这句话至少能被检索到。

## 23. 加载顺序（写错必然出问题）

```
data-core.js → 各 assets/*.js → codes.js → resolver.js
→ operators-meta.js → forge-kit.js → registry.js
→ prompts.js → code-ui.js → detail.js
```

- `data-core.js` **必须最先**：各 `data-*.js` 通过 `push` 自我注册，容器得先在
- `registry.js` 必须在 `prompts.js` 之前：后者要读它建的码表来查条目
- `prompts.js` 必须在 `code-ui.js` 之前：后者渲染时要取词
- `detail.js` 必须在 `code-ui.js` 之后：它复用 `cwPromptPanel` 取词，
  顺序反了会拿到 `undefined`
- 新增 `assets/*.js` 必须做两件事：
  1. 登记进 `tools/_load.js` 的 `ORDER`（否则被排到最后，依赖顺序错乱）
  2. **在 Node 环境下显式 `require("./data-core.js")` 取容器** ——
     `var RELATIONS` 在 CommonJS 里是**模块作用域**，不是全局；
     浏览器 `<script>` 顶层 `var` 才隐式挂 global

### 纯浏览器视图的三条要求

`detail.js` 这类只在浏览器跑的视图，`_load.js` 会 `require` 它们，
所以必须同时满足：

1. **无 `document` 时安静地不做事**，不能抛错
2. **Node 下提前返回**：`if (typeof module !== "undefined" && module.exports) { ...; return; }`
3. **不要去摸 index.html 的 IIFE 内部变量**。`MODULES` / `REL_META` /
   `REL_NAME` / `CAT_ZH` / `PID_NAME` / `ROLE_ZH` 都在那个 IIFE 里，
   不是全局。由宿主在 `ready(ctx)` 时注入 —— 写全局变量「省事」的后果
   是两份数据各改一处就静默不一致。

### 跨层字段的形状不一致

同一个概念在不同层形状可能不同，读错**不报错**，只是静默失效：

| 概念 | 画家/名画等 | 光学词条 |
| --- | --- | --- |
| 七面 | `e.F.light`（**嵌套在 F 下**） | `e.light`（平铺） |

`detail.js` 的 `facetsOf()` 先取 `F`，`F` 不存在才退回平铺。
写错层级的症状是「画家明明七面都填满，抽屉却显示 0/7」——
数据没问题，是读取代码读错了层。`smoke-web.js` 有一条断言守这个。

浏览器与 Node 双跑的取值写法：

```js
var _X = (typeof module !== "undefined" && module.exports)
  ? require("./data-core.js")
  : (typeof window !== "undefined" ? window : this).X;
```

**纯浏览器视图（如 `code-ui.js`）在无 `document` 时要安静地不做事**，
不能抛错 —— `tools/_load.js` 会 `require` assets 下所有 `.js`。

`prompts.js` 是个例外：它两端都要跑，所以不直接摸全局 `FORGE`/`REGISTRY`，
而是走 `g(name)` 取容器再 `require` 兜底：

```js
function g(name) {
  var w = (typeof window !== "undefined" ? window
         : (typeof globalThis !== "undefined" ? globalThis : null));
  return (w && w[name]) || null;
}
```

裸写 `typeof FORGE !== "undefined"` 会撞上同名的 getter 函数自己，
递归到爆栈 —— 这类取全局的坑在双跑文件里踩过一次就够了。

## 24. 编码层测试

```bash
node tools/check_codes.js    # 42 项，九组断言
```

九组覆盖：编码唯一 / 形态一致 / 全库无漏编 / 双向解析 /
中文名可解析 / 简写与容错 / 组合串逐项报错 / 元层不入提示词 / spec 能真的跑通。

**它与 `smoke.js` 分工不同**：`smoke.js` 验「引擎算得对不对」，
`check_codes.js` 验「引用体系本身有没有破」。
引擎错了要调算法，编码错了要改数据或改映射表 —— 混在一起就分不清是哪一类。

## 25. PROMPTS · 每条编码对应的提示词

```js
PROMPTS.of(code, { platform, strength }) → {
  code, oldId, kind, kindZh, zh, en, note,
  grade,      // "full" 可直接出图 / "part" 零件需基底 / "none" 不进提示词
  gradeZh,
  why,        // 仅 grade=none：为什么不进提示词
  spec,       // 喂给引擎的那份
  solo,       // { tags, neg, gpt, tier, words, warnings, guardAtoms, regionAtoms }
  withBase,   // 仅 grade=part：挂在 DEMO_BASE 上的版本
  baseSpec, baseZh
}
```

### 两条不可让步的约定

**1. 这一层只取词，不新增任何创作判断。**
所有提示词由 `FORGE.compose()` 产出，本文件不拼一个词。
一旦手写词面，它就会和引擎的冲突裁决各说各话，且引擎一改就全部漂移。

**2. 三档完整性必须标出来，不许只给词。**

| 档 | 覆盖 | 为什么 |
| --- | --- | --- |
| `full` | 画家 / 流派 / 名画 / 媒介 / 题材 / 签名卡 / 任务模板 | 自带主体或主体足够明确 |
| `part` | 原子模块 / 光学词条 / 算子 | 改的是别人的画面，单独投放只剩一句约束词 |
| `none` | 来源许可 / 模型实测 / 冲突规则 / 光学分组 / 关系边 | 是查证与流程用的，不是视觉零件 |

- `part` 必须同时给 `withBase`。`AT-001` 单独跑出来是
  `chiaroscuro, masterpiece, best quality, ...` —— 一条约束词加一堆画质词，
  拿去出图几乎等于没约束。不给基底版本，用户就会把它当完整配方。
- 基底是**写死并公开写明**的演示件（`DEMO_BASE` = 单人肖像），
  不是推荐配方。偷偷配基底等于骗用户。
- `none` 必须给 `why`，不能给空文本框 —— 空框等于暗示「这里本来有词但被清了」。

### 导出

`dist/prompts.json` 由 `tools/build_json.js` **现算**，不落盘缓存。
词面是引擎的派生物，引擎一改就必须全量重算。

单独成文件而不塞进 `all.json`：它超过 1 MB，混进去会把 `all.json`
撑成人眼读不了、脚本也不必要整体加载的大文件。

`codes.json` 回答「这条是谁」，`prompts.json` 回答「这条是什么词」，
两份必须一起给 —— 只有编码没有词，组合这件事仍然做不成。

### 查询

```bash
node tools/show_prompt.js PA-125      # 编码 / 中文名 / 英文名都吃
node tools/show_prompt.js AT-001 --platform mj
node tools/show_prompt.js PA-125 --json
node tools/show_prompt.js 达·芬奇 明暗对照 单侧窗光   # 多项按组合串处理
```

单项与多项走两条不同的路：单项是「这一条自己能出几段词」，
多项是「这些加起来出几段词」。混在一起输出会看不清。

---

## 组合引擎契约

```js
FORGE.compose(spec) → {
  tier,      // 画质档：canvas / trad / retro / photo / digital
  tags,      // 段落式提示词（按 platform 方言输出）
  neg,       // 负面词
  gpt,       // 自然语言正文
  parts,     // { subject, space, light, medium, brush, color, spirit } 七段分词结果
  style,     // 署名层（已加权）
  addon,     // 算子散词
  quality,   // 画质串
  warnings,  // [{ level, id, msg, winner, loser }]

  /* --- 第二版新增 --- */
  changes,        // 变更清单 [{ type: mute|split|preserve|region|unverified, id, msg }]
                  //   mute 哪一方被静音、split 怎么分区、preserve 什么保住了、
                  //   region 分区建议、unverified 哪些组合尚未验证
  usedAtoms,      // 实际生效的原子模块 id
  guardAtoms,     // 被强制打进负面词的约束类模块
  regionAtoms,    // 待遮罩落实的局部模块（不给遮罩则不生效）
  experimental,   // true 表示含未验证组合，正文已追加标注
  parent,         // 派生来源（经 derive() 传入时）
  platform,       // 实际生效的平台方言
  strength,       // 实际生效的强度
  usedOps,        // 生效的算子 id
  counts          // { src, words }
}

FORGE.ready(pid, opt)                    // 单个画家的一键成品
FORGE.derive(baseSpec, patch, note)       // 在已有配方上派生，返回带 parent 的新配方
FORGE.pack(spec)   → "AFX1.<base64>"     // 分享码
FORGE.unpack(code) → spec | null
```

**词序即权重**：题材 → 空间 → 光 → 媒介 → 笔法 → 色彩 → 气质 → 署名 → 算子散词 → 画质。

**retro 档刻意不加 `high resolution` / `ultra-detailed`** —— 这些词会把龟裂、泛黄、胶片颗粒一起「修」掉。

### 变更清单为什么必须存在

输出一段词不等于说清楚「这一版相对上一版改了什么」。使用者调参时真正要问的是：
**为什么我换了个人物风格，画面里那一块没变？** 答案通常在 `changes` 里。

| `type` | 含义 |
| --- | --- |
| `mute` | 因 `hard` 级冲突，某一方在波及面上被静音 |
| `split` | `regional` 级冲突，给出分区建议而不是强行二选一 |
| `preserve` | 算子的 `preserve` 面保住了，其他来源没能覆盖 |
| `region` | 某模块需要遮罩才能生效 |
| `unverified` | 组合含 `experimental` 级冲突，效果未在任何模型上验证 |

## 平台方言差异

| platform | 权重写法 | 说明 |
| --- | --- | --- |
| `sd` | `(tag:1.3)` | SD 系甜区 1.1–1.4，超过 1.5 期待色带与解剖崩坏 |
| `mj` | `tag::2` | 相对权重，0.5–2 之间有效 |
| `flux` | 无括号，词就地重复 | **Flux.1 dev 忽略括号语法** |
| `gpt` | 不加权 | 自然语言模型靠位置与重复，不靠权重数值 |

引导值区间：SD 5–8（默认 7）/ SD 3.5 4–5.5 / Flux 2.5–4.5（默认 3.5）/ 蒸馏模型 1–2。

## 组合引擎契约 · 出词纪律三字段

引擎输出（`FORGE.compose` / `PROMPTS.of`）除三件套外，恒带三个纪律字段。
它们回答的是「这条词面为什么是这样」，不是画面内容：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `isolatedMotif` | `[{word, workId, zh, en}]` | 从构图词面移出的具体画作标题。命中 WORKS 登记表（归一化去冠词）的 motif 词会复刻名画，移到垫图参考区。**未登记的标题不猜** |
| `aliveSources` | `[{id, zh, en}]` | 本次组合里的在世艺术家（`life` 无卒年）。姓名已从词面剔除，以七面锚定 |
| `freeText` | `string[]` | 用户原话，追加在 tags 末尾与 gpt 的独立一行，不占任何面、不参与冲突裁决 |

三条纪律在引擎层执行，界面与 explain 负责说明——**纪律生效但界面上看不出，
用户就会以为库漏了数据**。数据源不为这些纪律改任何字段。

### spec 侧的对应用法

`spec.freeText: string[]` —— 由界面「原话」输入框或工作台「作为原话追加」按钮产生。
主界面分隔符：中英文逗号 / 分号 / 顿号 / 竖线都吃（`splitFree`）。

### NAME_POLICY

`FORGE.NAME_POLICY.aliveNames` 默认 `false`（在世者姓名不进词面）。
置 `true` 可显式放行——那是调用方的决定，不是默认值。
剔除判据：`sty` 首项与 `en` 名归一化相同。**不能第一个词一律当姓名删**——
万一数据里 `sty[0]` 不是姓名，删掉的是一个正常风格词。
