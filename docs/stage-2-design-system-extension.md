# 原型阶段二公共组件扩展

> 状态：第五轮人类验收反馈已修复，生产构建、全量 `49` 项测试和关键截图复核通过，等待人类再次审批。本文只记录阶段二新增组件；基础 Token、按钮、输入、状态、Modal、Toast 和响应式壳层继续以 `stage-1-design-system.md` 为准。

## 一、自动化工作组件

| 组件                       | 职责                                         | 关键状态                                               |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `ConversationTimeline`     | 承载用户输入、Hunter Markdown 回复和过程结果 | 渐进出现、流式、停止、错误、恢复                       |
| `Composer`                 | 文字、文件、截图、粘贴链接和发送             | normal、focus、disabled、附件错误、streaming           |
| `AuthorizationSelector`    | 切换仅分析、执行前确认和自动执行             | normal、open、selected、disabled                       |
| `RuntimeBar`               | 常驻输入框上方，紧凑展示动态计划和内部任务   | collapsed、expanded、running、waiting、paused、docked  |
| `PlanList`                 | 表达计划状态并建立步骤与用户要求的对应关系   | pending、running、done、waiting-user、paused、adjusted |
| `PlanUpdate`               | 显示补充原文、受影响步骤与不变边界           | info、warning、time-stamped                            |
| `InternalTaskList`         | 查看只属于当前主线的内部任务                 | running、done、waiting、affected-paused                |
| `InspectionPanel`          | 在当前页检查单个任务、证据或中量结果         | open、close、restored、mobile-fullscreen               |
| `CandidateReviewWorkspace` | 承载大量候选人完整审核                       | filter、sort、selected、empty、disabled、mobile-detail |
| `WorkstreamHistory`        | 业务主线搜索、状态、置顶、新建和历史切换     | expanded、collapsed、active、empty                     |

## 二、独立支线与信号组件

| 组件                  | 职责                                               | 关键状态                                               |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| `TaskList`            | 只展示独立支线任务，支持状态分类、搜索、分页和删除 | normal、empty、waiting、running、failed                |
| `TaskDetailWorkspace` | 支线任务对话、计划、结果去向和信息回流             | waiting-user、paused、adjusted、resolved               |
| `SignalFeed`          | 作为次级选择列表展示信号并合并重复来源             | active、waiting、watching、converted、ignored、expired |
| `SignalInspector`     | 作为主要详情画布查看所选信号、证据和建议行动       | desktop-master-detail、mobile-fullscreen、converted    |
| `ConversionDialog`    | 将信号转为主线、支线或关联既有工作                 | open、selected、cancelled、submitted                   |

## 三、布局与显示规则

1. 用户输入采用右侧有边界容器；Hunter 回复使用无头像、无气泡的全宽 Markdown。
2. 计划和内部任务常驻输入框正上方并默认收起，不能混入对话历史或长期挤占对话主区域；展开内容设置最大高度和独立滚动。
3. 少量结果在对话内显示，中量结果打开同页检查区，大量审核临时占据主工作区。
4. 桌面端候选人审核和信号使用列表/详情并列。信号左侧使用次级背景、列表标题和选中指向，右侧使用“所选信号”标题及主画布背景；详情宽度显著大于列表。移动端详情覆盖当前工作区并提供明确返回。
5. 等待状态不使用持续动画；只有实际运行或流式生成时显示动态反馈。
6. 错误优先在失败组件附近显示，保留已有内容并提供恢复动作，不使用阻断全页的全局 Banner。
7. 所有辅助文字不低于 `12px`；状态标签、工具栏按钮和候选人关键决策信息禁止拆分换行。
8. Agent 和支线任务正文只生成 Markdown 语义内容，不生成带视觉样式的业务组件；Markdown 表格、引用和链接由统一渲染器负责显示。
9. 执行计划展开后直接显示单列步骤和必要的计划调整提示，不设置“计划依据”或其他二级切换。相关任务继续独立收起，不能与计划左右并列挤压对话区域。
10. 执行计划的折叠箭头按本产品约定显示：收起状态箭头向上，展开状态箭头向下；主线和支线任务保持一致。
11. 候选人审核底部使用全宽批量处理区。候选人勾选后直接提供“加入联系名单 / 加入岗位储备”两个业务动作；未勾选即表示本轮不处理，不再提供含义重复的“排除”动作。

## 四、复用边界

1. 阶段三四类业务主线必须组合这些组件，不为每类主线重新创建对话、计划、任务和授权控件。
2. 业务专属结果可以新增 Renderer，但必须进入公共结果协议，并提供未知只读结果的安全降级。
3. 正式业务资产页面不能直接复用内部任务状态作为资产状态；两者只通过结果去向和来源引用关联。
