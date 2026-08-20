# Hunter SaaS 阶段一原型当前成果基线

> 记录日期：2026-08-21。
>
> 当前状态：原型阶段一、阶段二和阶段三均已通过人类审批。本文档用于后续产品讨论、原型设计和详细设计时统一边界，不代表生产代码已经实现。

## 一、已经审批的原型阶段

| 阶段       | 范围                 | 审批状态     | 主要交付                                                                             |
| ---------- | -------------------- | ------------ | ------------------------------------------------------------------------------------ |
| 原型阶段一 | 全局框架与工作台     | 已审批并冻结 | 桌面与移动导航、工作台、搜索、通知、用量、用户菜单、主题、基础组件和必要状态         |
| 原型阶段二 | 自动化通用交互框架   | 已审批并冻结 | 统一新建工作、业务主线对话、动态执行计划、内部任务、授权模式、支线任务和信号中心     |
| 原型阶段三 | 四类业务主线完整流程 | 已审批并冻结 | 客户开发、岗位招聘、人才摸排、候选人求职的渐进过程、分支、等待、审核、恢复和结束条件 |

## 二、已经确定的公共交互

1. 用户只通过一个自然语言入口新建工作，不在开始前选择业务主线或支线任务。Hunter 根据范围和生命周期判断直接完成、建立业务主线或创建支线任务，用户可以用自然语言纠正判断。
2. 业务主线和支线任务共用对话式工作区。用户消息使用有边界的输入块；Hunter 回复使用统一 Markdown 渲染，不要求 Agent 生成 HTML、CSS 或专用视觉组件。
3. 执行计划位于输入框上方并默认收起。每个步骤持续更新完成、运行、等待、暂停和调整状态；新信息只重做受影响范围。
4. 少量只读结果直接在对话中显示，中量结果在当前页检查区查看，大量且需要业务操作的结果使用 Hunter 受控审核组件。
5. 授权模式固定为“仅分析”“执行前确认”“自动执行”，可以在运行过程中切换，只影响尚未执行的动作，不能关闭 Hunter 的结构、安全、权限和写入门禁；用户主动添加的文件随消息直接上传，邮件发送仍需逐次确认。
6. 外部等待不显示持续运行假象，也不持续消耗 Agent 用量。页面显示等待对象、开始时间、最近检查和下一次处理安排，并支持回复或新资料回流后继续；系统邮件保留独立状态。
7. 正式写入和外部动作使用结构化业务命令。用户可以通过自然语言或受控组件表达决定，两种入口映射到同一命令和对象范围。
8. 桌面、iPad 和 iPhone 保持相同核心能力；移动端可以改变布局，但不能删减关键操作。

## 三、四类业务主线成果

### 3.1 客户开发

已覆盖信号核验、目标公司判断、公司和联系人草稿、联系方式与证据审核、邮件草稿编辑与逐次确认、等待外部回复、招聘机会回流，以及未找到可联系对象、权限受限和局部失败等分支。

### 3.2 岗位招聘

已覆盖岗位理解、云端公开来源和系统候选人检索、在本机继续、候选人批次持续合并、候选人补全与去重、人岗匹配、候选人审核、加入岗位储备、邮件草稿确认、等待回复和新简历回流。无候选人通过门禁时解释原因，不自动放宽硬门槛。

认证人才平台自动化不在云端运行。当前云端原型只覆盖本地任务准备、选择设备或下载、等待本机结果、批次返回、身份合并和增量审核；Hunter 本地助手自身原型后续单独设计。

### 3.3 人才摸排

已覆盖摸排目标清单、公司与组织、方向与角色、人物与关系、联系路径、学术脉络、人才流动、冲突和待补充信息的增量审核。

人才摸排批次审核固定使用以下三个标签：

1. 公司与组织。
2. 人物与关系。
3. 冲突与待补充。

Agent 只能把变化归入既有标签，不能动态新增、改名或排序标签。每个标签左侧显示本批次具体变化；点击变化后，右侧显示该变化影响的对象、关系、证据和确认状态。组织结构、公司生态、方向与角色、人物关系、人才流动、联系路径和学术脉络等关系投影根据变化内容动态选择，不作为平铺的独立入口。

### 3.4 候选人求职

已覆盖候选人动向信号、系统内有效岗位匹配、猎头本人联系、等待联系结果、新简历或人工补充信息回流，以及只重做受影响岗位的重新匹配。暂无合适岗位时保留候选人和提醒条件。

## 四、Agent 集成边界

当前已确认的产品方向是“Agent 发现并描述业务变化，Hunter 校验、组织数据和渲染交互”，不是让 Agent 直接生成页面。

1. Agent 输出实体、关系、变化操作、影响范围、证据、可信状态、冲突和建议聚焦对象。
2. Hunter 校验 Schema、实体引用、关系类型、方向、证据、权限、租户边界、重复和写入条件。
3. 通过门禁的数据进入固定标签和公共受控组件；关系影响图由 Hunter 根据变化数据生成。
4. Agent 不决定页面布局、SVG 坐标、颜色、按钮、授权规则或数据库写入方式。
5. 未通过门禁时由 Agent 按明确错误修正；达到重试上限后停止，不能降级写入不合法数据。

该部分目前是产品与可行性边界，不代表后端 Schema、关系存储、Agent 工具接口和运行编排已经完成技术设计。

## 五、质量基线

1. 当前已审批功能基线：`fe10795`，其前一功能提交为 `b673d0b`。
2. 构建命令：`npm run build`，当前通过。
3. 自动化命令：`npm run test:e2e -- --reporter=line`。
4. 最新完整结果：`90 passed`；新增本机交接、合并冲突、邮件草稿和文件直接上传专项测试。
5. 自动化覆盖桌面、iPad、iPhone、亮暗主题、页面状态、渐进对话、执行计划、审核、恢复、控制台错误和页面级横向溢出。
6. 关系影响审核已经完成桌面与移动端截图复核。

## 六、尚未进入完整原型的范围

以下内容没有被当前审批覆盖，不能按“已完成设计”理解：

1. 候选人、岗位、公司、联系人、招聘机会、人才版图、论文和专利的完整资产列表、详情、新建、编辑、删除、合并和关联操作。
2. 设置、通知历史、回收站及其完整管理流程。
3. 面向 Hunter 运营人员的运营端、租户支持、诊断、权益和用量管理页面。
4. 生产级数据 Schema、关系存储方案、Agent 工具协议、任务调度和并发恢复技术方案。
5. 正式 PRD、技术方案、详细设计文档和生产代码实现。
6. Hunter 本地助手的页面、设置、平台运行、候选人选择和本地清理原型。

后续阶段不能通过修改已审批公共交互来规避新问题。发现公共框架不足时，需要先记录原因、更新相应原型文档并重新审批。

## 七、权威文档

1. `docs/stage-1-plan.md`：全局框架与工作台。
2. `docs/stage-1-design-system.md`：产品级设计 Token 和基础组件。
3. `docs/stage-1-interaction-coverage.md`：阶段一交互覆盖。
4. `docs/stage-2-plan.md`：自动化通用交互框架。
5. `docs/stage-2-design-system-extension.md`：自动化交互组件扩展。
6. `docs/stage-2-interaction-coverage.md`：阶段二交互覆盖。
7. `docs/stage-3-plan.md`：四类业务主线完整剧本。
8. `docs/stage-3-component-boundary.md`：Markdown、受控组件和关系图边界。
9. `docs/stage-3-interaction-coverage.md`：阶段三交互与状态覆盖。

## 八、在线原型与验收入口

在线原型基址：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/>

### 8.1 总入口与公共页面

1. 阶段审核入口：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/review>。
2. 新建工作：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/new>。
3. 支线任务列表：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/tasks>。
4. 支线任务详情：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/tasks/task-hand-team>。
5. 信号中心：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/signals>。
6. 工作台：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/home>。
7. 公共组件：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/components>。

新建工作的目标歧义、分类中、直接完成、建立主线、创建支线、失败和权限受限状态，分别使用 `#/new?state=clarify`、`classifying`、`direct`、`mainline`、`task`、`error` 和 `limited` 验收。

### 8.2 四类业务主线

1. 客户开发：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/workstreams/client-xinglan>。专用状态包括 `waiting`、`no-contact` 和 `reply`。
2. 岗位招聘：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/workstreams/position-vla>。专用状态包括 `waiting`、`review`、`no-candidate`、`candidate-reply`、`local-waiting`、`stale-task` 和 `merge-conflict`。
3. 人才摸排：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/workstreams/mapping-embodied>。专用状态包括 `waiting`、`conflict` 和 `gaps`。
4. 候选人求职：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/workstreams/career-linhao>。专用状态包括 `waiting`、`no-position` 和 `new-resume`。

四类主线均可在对应 URL 后附加 `?state=loading`、`?state=stream-error`、`?state=limited` 或 `?state=error`，直接检查加载、流式中断、权限受限和失败状态。完整状态和操作步骤以 `docs/stage-3-interaction-coverage.md` 为准。

本轮边界变更和后续本地助手范围以 `docs/cloud-companion-transition-plan.md` 为准。在线原型中没有 Hunter 本地助手页面。
