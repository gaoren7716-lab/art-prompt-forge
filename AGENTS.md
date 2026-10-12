# AGENTS.md · 给 AI Agent 的项目规则

> 这个文件是**给 agent 读的**，不是给用户读的。用户入口在 `README.md` 与 `INDEX.md`。
> 目的是：agent 改这个库之前，不用通读六个文件才知道「什么不能改」。
> 每条规则都标了**违反后会发生什么**——不标后果的规则会被当成建议。

## 项目定位

全球画家 / 画作提示词知识库（`art-prompt-forge`）。六层结构：
全球艺术地图（PAINTERS / MOVEMENTS / WORKS）→ 参考实体与关系（MEDIUMS / SUBJECTS /
OPTICS / RELATIONS）→ 原子视觉模块（ATOMS）→ 任务与成品模板（TASKS / SIGNATURES）→
组合与变形规则（OPERATORS / CONFLICTS）→ 模型适配与验证（TESTS / PROVENANCE）。

首页与 README 显示**实体数与覆盖缺口**，不写「全球 N 位画家」这种会过期的宣称。

## 六条不可让步的约定

1. **信息分四类**：`fact` 历史事实 / `seen` 视觉观察 / `read` 创作解释 / `test` 模型实测。
   混在一起最典型的事故是把「模型实测有效」当「艺术史事实」引用出去。
2. **来源与许可四条独立线**：本库代码 / 本库原创提示词 / 名画图像（各馆不同）/ 外部标准本体。
   混成一句「本库采用某许可」最容易吃官司。PV-40 明确写了不能套用到作品图上。
   商用前查 `dist/commercial-ok-sources.json`。
3. **算子三字段是推导的，不是填的**：`preserve` / `change` / `forbid` 由
   `tools/gen_op_meta.js` 从 `keep`/`only`/`inject` 反推。手写必然出现「既保留又改同一面」，
   而这种矛盾**运行时不报错**，只是效果不对。改算子结构必须重跑生成器。
4. **冲突分四级，不是二选一**：`hard` / `regional` / `soft` / `experimental`。
   `regional` 必须带 `region:{aSide,bSide,seam}`，否则「可以分区共存」是空话。
5. **`guard` 是硬边界**：`ROLE_DEFAULT.guard = 1.0`，权重对它无效，强制进负面词。
   `region` 不给遮罩等于没生效。`region` 模块必须成对（`region.pairWith` 互指）。
6. **师承与影响必须分开**：`student_of` 强可照搬 / `influenced` 弱只能借鉴。
   混在一张表里，融合提示词时会把「借鉴」当「传承」用。

## 编码层六条

1. **不改正 `id`，另建派生 `code`**。id 已被签名卡 spec 与 306 条关系边引用。
   code 由 `assets/codes.js` 的纯函数 `derive()` 算出，不写进数据源。
2. **`code` 一旦发布不可改**。改它等于让用户手里的组合串失效。
   新增只往后追加，永不重排旧号。改中文名不影响 code 解析。
3. **每位数字段恒为三位**。唯一例外是 `O` 段两位组号。
4. **元层不进提示词**。签名卡整套套用、任务模板是流程起点、冲突规则引擎裁决、
   来源许可与模型实测是查证用的。混进去**不报错，只会让结果莫名其妙**——
   所以在 `RESOLVER.toSpec()` 阶段就挡。
5. **跨层同名按层级收敛，不要删数据**。58 处「原子模块 ↔ 光学词条」同名。
   `ORDER_RANK` 让 atom 优先，被遮住的挂 `shadowed`。删任何一份就有一层用不了了。
6. **关系边编码必须全局连续**。按 `kind` 各起一份会让 306 条边只剩 45 个不同编码。

## 提示词层两条

1. **只取词，不新增任何创作判断**。全部由 `FORGE.compose()` 产出，这一层不拼一个词。
   同理**不落盘缓存**——词面是派生物，导出时现算。
2. **三档完整性必须标出来**：`full` 可直接出图 / `part` 零件需基底 / `none` 不进提示词。
   `part` 必须同时给 `withBase`；`none` 必须给 `why` 不能给空文本框。

## 出词纪律（引擎层，改 forge-kit.js 前必读）

1. **姓名纪律（NAME_POLICY）**：在世艺术家的姓名不进词面。判据是 `life` 字段
   有没有卒年（`1937-` 即在世）。已故大师的姓名引用保留——"in the style of 已故大师"
   是画风库的标准锚定，风格不受著作权保护。剔除方式是「sty 首项与 en 名归一化相同」，
   **不能第一个词一律当姓名删**。数据不用为这条纪律改任何东西。
2. **画作标题不进 tags**：motif 面里命中 WORKS 登记标题的词（mona lisa 这类）
   由 `splitMotif()` 移出词面，收进 `isolatedMotif` 供垫图参考区使用。
   隔离只做 WORKS 精确匹配（归一化去冠词），**未登记的标题不猜**——
   猜错的代价是把正常题材词也隔离掉。数据不动，只是出词时换位置。
3. **原话通道（freeText）**：用户自己的句子追加在词面**末尾**，不占任何面、
   不参与冲突裁决。放进七面引导句里会被当成该面描述，而它是用户意图。
4. **explain 恒带**：`PROMPTS.of()` / `ofSpec()` 输出必带 explain（compose 派生零手写）。
   转述给任何人的场合必须带上它。
5. **元层不给空提示词框**：空框等于暗示「这里本来有词但被清了」。

## 纯浏览器视图三条（新增 assets/*.js 时）

1. 无 `document` 时安静退出（Node 下提前 return）；
2. Node 下必须显式 `require`——`var` 在 CommonJS 里是模块作用域不是全局；
3. 不摸宿主 IIFE 内部变量（由 `ready(ctx)` 注入）。
4. 新文件必须登记进 `tools/_load.js` 的 `ORDER` 数组，否则被排到最后、依赖顺序错乱。

**双跑取全局必须走容器**：`g(name)` 读 `window`/`globalThis` 再 `require` 兜底。
写 `typeof FORGE !== "undefined"` 会撞上同名 getter 自己，递归到爆栈。

## UI 层约定

1. **行与按钮动作分离**：点名字开抽屉（详情），点「加入 / 套用」才改配方。
   合成一个动作的后果是误点也改了配方。
2. **复制三路**：clipboard 写入成功才报成功 → 被拒回落 `execCommand` →
   都失败弹手动复制浮层（全文 + 全选）。**不允许「调用了 writeText 就显示已复制」**——
   file:// 下写入被拒时那是假成功，没有症状，会被当成「模型不行」。
3. **七面读 `F` 之下**：`e.F.light` 不是 `e.light`。读错层级不报错，只是恒为 0/7。
4. **光学词条的 `code` 字段是旧 ID 不是规范码**，拿规范码必须过 REGISTRY。
5. **抽卡锁的重抽是整组重抽 + 回填**，不是只对没锁的槽逐个换（`GACHA.reroll`）。
6. **jsdom 端到端验证**：判据落在 DOM 可见状态上，不撬闭包变量。

## 已知边界（不掩盖）

- 105 位画家没配名画（垫图兜底对他们不可用，面板如实写「暂无收录名画」）；
- 约 170 位画家没有影响 / 师承边；
- 205 位画家全部为 `written` 状态（未做模型实测）；
- 类别 7/9/10/11/12 没有任何 `region` 角色模块（分区策略在这些类别上落不了地）；
- 39 个关系端点是博物馆名（PROVENANCE 的 `org` 字段，不是可引用条目，界面上不挂链接）；
- motif 里**未登记到 WORKS 的画作标题**（如 moulin de la galette）仍会进词面——
  这是「只隔离可证明安全的」的代价，写在这里不假装没有。

## README 与 docs 是生成物，改模板不改产物

`node tools/build_md.js` 会重写 `README.md` 与 `docs/*.md`（13 篇）。
**要改内容就改 `tools/build_md.js` 里的模板**，手改产物会被下次生成静默覆盖
—— 曾经把一整段配图说明直接写进 README，跑一次生成，59 行全没了。

模板里凡是会变的数字都要现算，不要写死：配图张数、一致/挂账张数来自
`gallery_check.js` 的 tally 与 `ACCEPTED`，加一条挂账 README 就多一行。
命令清单里不写项数（加一条断言就过期一次）。README 顶部有防呆注释。

## 回归命令

```bash
node tools/check_fields.js    # 字段体检：中英串味、坏字符、非法语义标签
node tools/build_json.js      # dist/*.json（20 个文件）
node tools/build_md.js        # README + docs/*.md（改模板，别手改产物）
node tools/gen_op_meta.js     # 重推算子三字段
node tools/smoke.js           # 引擎冒烟
node tools/check_codes.js     # 编码体检
node tools/show_prompt.js 编码  # 查单条编码对应的提示词
NODE_PATH="C:/Users/A/.workbuddy/binaries/node/workspace/node_modules" node tools/smoke-web.js
node tools/gallery_sync.js --check   # 配图同步体检（有图没登记 / 抢卡 / 野文件名 -> 退出码 1）
node tools/gallery_check.js          # 配图与配方是否对得上
```

最后一条的 NODE_PATH 是本机 jsdom 的位置（不在项目里）。该脚本缺少 jsdom 时
只打印一行「需要 jsdom」然后 **exit code 0**——看到这行就是没跑，不是绿。

改完数据跑一遍全量回归。四项（字段 / 引擎 / 编码 / 界面）必须全绿才算完。

## 发布到 GitHub

仓库 <https://github.com/gaoren7716-lab/art-prompt-forge>（public，main），
Pages <https://gaoren7716-lab.github.io/art-prompt-forge/>（main 根目录静态托管）。

推送命令（本机实测 32MB / 10 秒，不要丢后台）：

```bash
git -c credential.helper= -c credential.helper="!'/c/Program Files/GitHub CLI/gh.exe' auth git-credential" \
    -c http.proxy=http://127.0.0.1:7890 -c http.sslBackend=openssl push origin main
```

- 第一个空的 `credential.helper=` 是清空列表，否则全局 GCM 会等交互弹窗挂死。
- `http.sslBackend=openssl` 不能少：默认的 schannel 能握手但请求永不返回。
- **不要带 `-u`**：它会把带 token 的 URL 写进 `.git/config`。

**配图保持小体积**：仓库里的图是 1200px JPEG q88（40 张 14.7MB）。
PNG 无损重压缩只省 0%，这条路没有余量 —— 新放 PNG 会让仓库迅速回到 100MB+。
`node tools/gallery_compress.js` 转 JPEG 并把原图移进 `gallery/_png_backup/`
（该目录已进 .gitignore，`--restore` 可还原）。

## 配图链路的两个真源（别再加第三处）

- **同步规则**只有 `tools/gallery_sync.js`：扫 `gallery/`、把文件名解析成卡片 id、
  重写 `assets/gallery-imgs.js`。`build_standalone.js`（打包时）与
  `gallery_check.js`（核对时）都调它的 `resolveGallery()` ——
  两处各写一份，同一张 `G-26.png` 会在一边认成 VAR-01、另一边认成「无卡片」。
- **核对关系**只有 `tools/gallery_check.js` 的 `KNOWN_PAIRS`；**挂账**只有它的
  `ACCEPTED`。图与配方对不上的卡必须两处都写上：`ACCEPTED` 里连原因与日期，
  卡上加 `imgNote`（卡面出「图≠配方」徽章、详情写明差在哪）。
  只写 `ACCEPTED` 不加 `imgNote`，用户看不到 —— `smoke-web.js` 有断言钉住这一致性。

文件名解析收三种形态，优先级从高到低：卡片 id（`G-01`）→ 规范编码（`SG-001`）→
页面序号（`G-26` = 第 26 张 = `VAR-01`）。第三种是历史包袱：卡面从前显示数组序号，
第 26 张起与 id 分叉，用户照着序号命名配图会静默不显示（踩过两次）。

**根治办法是让目录里不再并存两套叫法**：跑 `node tools/gallery_sync.js --rename`
把按序号命名的文件就地改成卡片编码（目标存在则跳过、绝不覆盖）。卡面编号现在就是
配图该用的文件名，且**可点**（点一下复制 `VAR-01.png`）—— 用户不必手抄，手抄才会错。
`smoke-web.js` 里有条**闭环断言**：页面给出的每个文件名都要能被同步器解析回同一张卡，
两边再分叉测试当场红。另有一条断言要求 `gallery/` 里没有别名命名（`aliases.length === 0`）。

**未核对的图 = 必须处理**：`gallery_check.js` 只放行 `match` 与 `ACCEPTED` 里的条目，
其余（`partial` / 未看过的 `unknown`）一律**退出码 1**。不要图省事把新图塞进
`ACCEPTED` 求绿 —— 那份名单是欠账本，不是挡箭牌。

**守夜人是进程不是服务**：`gallery_watch.js` 窗口一关就停。它每 10 秒写
`.gallery-watch.log` 心跳，`gallery_sync.js` 会据此报「守夜人：已停止」——
不要凭「图没同步过来」猜原因，先看心跳。
