# 已验收局部修复同步原型

日期：2026-11-20。用户已明确要求将本地实现的局部修复一并更新到GitHub Pages原型。目标为本仓库的`main`和 https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/ ，不是产品测试站或boseekai.com官网。

本轮之前的原型提交为`2636e4a53bb234fdcbb09c385b5458adab533306`；对照AROS开发分支已验收代码`a0bac30d8e43aa73a042bf58e0eca2b730528251`。本记录随原型修复提交，发布成功以GitHub Actions部署回执和公网实测为准。

## 同步内容

- `TaskReadingWorkspace`和`CandidateResearchDemo`的任务列表改用当前页路由导航，覆盖展开、收起、手机抽屉；手机选择后关闭抽屉。不改变新建任务、业务资产、原始来源的新标签规则。
- 公共`Icon`通过lucide-react 0.468.0新增`maximize2 / minimize2`，与AROS使用同一库版本和图形。图谱全屏/退出全屏用对角展开/收起，自适应保留四角框。内容、审核、历史的全屏入口共用新图标，自适应和内容全屏复用公共`TooltipText`。
- 图谱拖动重设父节点时，坐标、parent与edges通过同一次`setPages`提交，复用原位置避让及样例关系逻辑。节点与连线从同一状态生成，不使用延迟任务换线。
- 原型没有远端图谱保存接口，因此不复制生产实现的待保存回执、部分成功与失败回读机制，也不宣称完成后台联调。静态种子图谱仍遵循原有刷新重置边界；已发布到本地存储的图谱保持既有保存流程，本轮不扩展存储能力。
- 只修改上述原型代码、对应测试、公共组件说明及本记录；不修改AROS产品代码、后台、SDK、数据库、服务器、网站内容、手机底栏或其他已验收交互。

## 验证

1. Playwright覆盖6个文件、128个用例：首轮126项通过；另外2项是新测试的预期问题，修正后对9项新用例定点复验全部通过，7项与首轮通过用例重叠，不相加。第一处错误排除了候选人演示可以正常切换的目标任务；第二处误把静态种子样例当成已落盘图谱要求刷新保留，已改为检查同一图谱视图切换保留结果，没有为测试扩大持久化范围。
2. 新测试覆盖两个任务工作区的展开/收起/390px抽屉，同页导航无新窗口且手机抽屉关闭；既有自然语言、来源新标签、计划、分栏、工具栏及图谱管理回归通过。
3. 1440/390px图谱工具提示、全屏/退出、自适应、Escape通过；真实拖动后从首帧起连续8帧，新线存在、旧父线消失，节点与两端连线的最大像素误差不超过0.5px。
4. 与AROS本地1420在1440/390px分别用独立合成上下文复查并截图：任务同页切换、手机抽屉关闭、图谱图标区分和全屏/自适应/Escape均通过；原型与实现的两种图标路径完全一致。所有API读取由合成回执拦截，无外部请求或业务写入，无脚本/控制台错误。手机底栏66/56px、原型提示与账号资料等既有差异保留，不新增无关修复。
5. 生产构建通过；`node scripts/verify-pages-artifact.mjs`通过，改版官网293个允许发布的文件与产物匹配，未夹带后台或私人文件。既有Vite大包警告保留。改动目标的静态设计检查无新增命中，`git diff --check`通过。

原型用例：`tests/stage2/task-inline-navigation.spec.js`、`tests/stage4/graph-sync.spec.js`；候选人演示的旧新标签预期已更新为本次批准的同页规则，来源新标签用例保留。

## 截图证据

以下均为虚构样例，不含真实账号资料。双侧截图用于核对本轮改动，不宣称整个产品所有状态像素一致。

- [桌面原型任务页](evidence/task-navigation-graph-sync-20261120/prototype-task-1440.png) / [桌面本地实现](evidence/task-navigation-graph-sync-20261120/implementation-task-1440.png)
- [手机原型任务页](evidence/task-navigation-graph-sync-20261120/prototype-task-390.png) / [手机本地实现](evidence/task-navigation-graph-sync-20261120/implementation-task-390.png)
- [原型图谱工具栏](evidence/task-navigation-graph-sync-20261120/prototype-toolbar-390.png) / [本地实现图谱工具栏](evidence/task-navigation-graph-sync-20261120/implementation-toolbar-390.png)
- [节点与新连线](evidence/task-navigation-graph-sync-20261120/reparented.png)
- [双侧行为检查结果](evidence/task-navigation-graph-sync-20261120/comparison.json)

## 发布边界

验证后按用户授权快进推送原型`main`，使用既有`pages.yml`部署；不改构建工作流或Pages权限。原工作目录有其他未提交开发工作，继续保留，不切换、不清理、不强推。本轮不更新AROS产品发布主线，不打产品标签，不部署产品前后端。

历史文档中“原型未同步/仍新标签”为此前阶段记录；本轮之后，以上三个局部行为以本文件和对应代码为准。研发仍按AROS的B01–B24对接真实合同，前端与原型同步不等于这些缺口关闭。
