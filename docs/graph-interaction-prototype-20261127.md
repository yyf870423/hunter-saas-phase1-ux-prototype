# 图谱交互原型同步

最新决定见[详情入口暂缓](./deferred-asset-sections-20261127.md)：更新与审核、版本记录、关联任务暂时隐藏，冗余的图谱内容一级标签栏移除。各资产的关联任务/处理与记录及账号的切换工作空间同时隐藏。本地原型与1420已同步，用户验收后授权仅推送GitHub原型main，AROS产品不推送；下面保留此前公网发布的历史状态。

[图谱审核变更预览](./graph-review-boundaries-prototype-20261127.md)的规则、源码及历史验证保留，当前暂缓且不开放入口，后续重新设计，不等于删除后台记录或放宽事实写入门禁。

## 范围

用户已验收本地1420的图谱调整，现授权先发布GitHub原型供公网测试。本轮只更新原型仓库，不推送产品分支、不部署产品或官网、不改后端与真实数据。基线为原型远端main 512116e；使用独立工作树，保留主工作树中其他官网工作。

## 同步内容

- 审核画布追加：从空白、节点或连线可平移只读画布，滚轮/触控板缩放使用图页的相机逻辑；补充公共缩放、100%、自适应和全屏按钮。相机调整不修改审核事实、源节点坐标或浏览器已保存图谱。审核画布高度扣除标题栏，避免可视区域被裁切。1420当前审核页只有列表、没有此画布，本次不扩大为整页重做，仅修原型，产品与后端不动。

审核追加验证：30项原型定向浏览器用例通过，包含1440/926px节点/空白拖动、普通滚轮、Ctrl-wheel连续缩放、鼠标锚点、按钮、自适应、全屏、审核目标切换、历史只读、图页及千节点旧行为回归。已核对四张审核普通/全屏截图；源节点坐标、本机图谱存储不变，网络写入为0。构建与293项既有官网产物隔离检查通过。

- 本轮验收追加：移除画布/层级表格工具栏的“全部收起/全部展开”，保留单个节点的子节点收起/展开。1420对应前端同步本地修改，产品代码与后端不推送、不部署。

本项验证：12项原型定向浏览器回归、30项1420 GraphContent测试、类型检查、原型构建与产物隔离检查通过；1440/926px两端四组截图及行为对照通过，没有真实网络写入。

- 节点单击选中、双击编辑，空白双击新增；隐藏指定工具栏和右键菜单项。
- 帮助默认收起并置于右上；自然/直角线和一次性布局命令移入工具栏。
- 悬停连线即可拖动端点；50%重叠调整层级且节点不透明。
- 当前图页20步撤销/重做，覆盖内容、位置、连接和整次布局，复用Windows/macOS快捷键。
- 撤销/重做位于左侧缩放旁，两组12px、两按钮6px，Tooltip沿用已确认短文案。
- 导入Modal复用公共FileDrop；名称为空才从文件名填入（去掉最后扩展名），不覆盖已有名称。填写值即新标签名，导入成功自适应。
- 新建图谱不预设默认图页；保持既有图页、资产和只读历史边界。
- 连续缩放与千节点平移的已验证相机/实体缓存逻辑同步。

## 组件与数据边界

复用现有Modal、FileDrop、FormField、TooltipText、IconButton、FloatingPanel和图谱存储；公共相机、历史、端点悬停和纯几何逻辑与1420对照。原型只使用示例及浏览器本机数据；文件不会上传，导入演示不等于实际格式解析已完成。审核/历史只允许阅读及临时视角调整，不编辑源数据。

公共组件与职责：

| 文件 | 职责 |
| --- | --- |
| `src/components/TopicGraphCanvas.jsx` | 知识图谱内容、审核和历史共用画布；只读上下文不能编辑源数据 |
| `src/components/GraphCameraControls.jsx` | 图页与审核画布共用缩放、100%、自适应、全屏控件，复用原有按钮和Tooltip样式 |
| `src/components/useGraphPan.js`、`useGraphWheelZoom.js` | 帧级相机平移、鼠标锚点、连续触控板和双指缩放 |
| `src/components/useGraphHistory.js`、`useGraphUndoShortcut.js`、`GraphHistoryControls.jsx` | 当前图页20步内容与布局历史，键盘和按钮共用；输入框保留原生文本撤销 |
| `src/components/useGraphEdgeHover.js`、`GraphEdgeHandles.jsx` | 悬停改接端点，离开线不常驻关系名称 |
| `src/components/GraphImportDialog.jsx` | 公共Modal/FileDrop导入交互；图页名称为空时才自动填入文件名 |
| `src/components/graph-presentation.js`、`topic-graph-geometry.js` | 布局、端口、相机适配、50%重叠与四向世界坐标 |
| `src/stage4/graph-acceptance-sample.js` | 明确虚构的7节点导入示例与1201节点压力样例，不访问产品后端 |

`RelationshipCanvas`复用相同历史、手势、控件及端点能力，保留原有资产展示、编辑和证据入口。不复制另一套UI样式，不引入新的运行依赖。

## 公网测试入口

- [普通知识图谱](https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/mappings/mapping-embodied?tab=content)：节点、连线、快捷键、撤销/重做、导入与图页切换。
- [1201节点压力图](https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/mappings/mapping-embodied?tab=content&sample=stress)：快速平移、松手、滚轮和触控板捏合；刷新还原压力样例，不覆盖已保存图谱。
- [85节点密集图](https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/mappings/mapping-embodied?tab=content&sample=dense)：两种连线样式、双侧布局和四向端口。
- [资产联系路径](https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/companies/company-xinglan/contacts/contact-chenyu?tab=contact-path)：公共资产画布的左侧历史工具组及布局。

导入验收：点击“导入图页”，选择任一支持扩展名的文件，空名称自动填入文件名（只去掉最后扩展名）；手动改名后换文件不会覆盖。导入创建同名标签页并自动适配示例节点，可点“使用示例文件”完成无真实资料演示。原型只验证交互，不验证实际文件解析。

正常图谱在浏览器本机保存演示修改；压力、密集样例不覆盖正常图谱内容。需要保留旧原型本机数据时，可用无痕窗口测试；不要清空真实产品的数据或账号。

## 验证与发布

发布前已完成：66项Playwright原型回归、14项几何单元测试、生产构建、293项既有官网产物隔离检查及git diff检查。覆盖普通/密集/千节点图、导入、内容历史、跨平台快捷键、资产入口、四类类型管理、审核/历史/任务只读边界。浏览器跟踪未发现脚本错误；演示导入不产生网络写入。

已查看1440px原型画布、导入弹窗及1420已验收截图，核对公共节点、连线、右上帮助、菜单和工具栏。原型保留自己的资产资料、搜索、视图切换及详情壳体，不把DEV验收页当作完整产品。

独立可见Chrome、DPR2、1201节点/1280连线：缩略拖动P95=16.9ms、最大17.7ms；100%拖动P95=16.8ms、最大17.4ms。各连续拖放3轮，未观察到50ms长任务。实体Windows触屏及Safari仍需对应设备复测，不把模拟事件等同于硬件验收。

定向复测命令：

```sh
node --test tests/unit/graph-presentation.test.js
PLAYWRIGHT_PORT=1425 npx playwright test tests/stage4/graph-current-interactions.spec.js tests/stage4/graph-presentation.spec.js tests/stage4/graph-sync.spec.js tests/stage4/topic-graphs.spec.js tests/stage4/graph-types-navigation.spec.js --workers=2
npm run build
node scripts/verify-pages-artifact.mjs
```

本文件与原型代码同批提交，发布提交可通过 `git log -1 -- src/components/TopicGraphCanvas.jsx` 定位。只快进远端main，由现有Pages流程发布；公网复验后才交付测试入口。需要撤回时对该次原型提交创建反向提交并正常推送，不强推或回退远端main；不会影响AROS产品或正式站。
