# 原型阶段六运营端组件边界

> 状态：随运营端原型进入审批。

## 一、公共页面壳

`OperationsShell` 是运营端唯一页面壳，负责：

1. Hunter Ops 标识和六个一级模块导航。
2. 运营搜索、生产环境标识、系统告警和角色信息。
3. 桌面折叠导航、移动端导航面板和账户菜单。
4. 运营人员与系统管理员的演示角色切换。正式产品中的角色由管理员分配，不由用户自行切换。

运营端不得嵌入用户产品的导航，也不得从运营端链接进入用户业务资产正文。

## 二、运营端公共组件

| 组件                | 职责                                 | 主要状态                                  |
| ------------------- | ------------------------------------ | ----------------------------------------- |
| `OpsPageHeader`     | 页面标题、口径说明和页面级动作       | normal                                    |
| `OpsTabs`           | 模块内稳定对象切换                   | normal、active、overflow                  |
| `OpsMetric`         | 趋势指标、周期对比和下钻             | normal、hover                             |
| `OpsFilterBar`      | 搜索、单选、多选、时间范围和单项清空 | normal、open、selected、cleared           |
| `OpsTable`          | 桌面运营表格和移动端分组记录         | loading、empty、normal                    |
| `OpsPagination`     | 页码、总数和页大小                   | normal、disabled                          |
| `OpsDefinitionList` | 详情元数据                           | normal                                    |
| `OpsTimeline`       | 任务、支持、安全和审计时间线         | success、warning、danger                  |
| `OpsState`          | 页面级状态                           | loading、empty、error、permission-limited |
| `OpsInlineState`    | 局部风险、权限和恢复说明             | info、success、warning、danger            |
| `OpsStatus`         | 运营状态标签                         | neutral、info、success、warning、danger   |
| `OpsSortableList`   | 模型资源池和数据源路由顺序拖拽       | normal、dragging、drop-target、removable  |

公共 Button、IconButton、Modal、Drawer、Toast、SelectMenu、DatePicker、TextInput、TextArea 和 FormField 继续复用已审批的产品级组件，不使用浏览器默认控件样式。

`OpsStatus` 继承产品级状态标签约束，圆点与文字必须作为不可拆分的单行组件显示。业务容器不得使用宽泛的 `span` 样式覆盖其内部布局。

## 三、业务专用组件

1. 试用审批：申请信息、处理方式、试用权益和账号/工作空间创建预览。
2. 权益调整：调整类型、数量、原因、调整前后值和审计说明。
3. 安全恢复：系统安全判断、允许动作、原因和执行边界。
4. 能力配置：配置草稿、验证过程、验证结果和生效确认。
5. 能力健康卡：能力成功率、延迟、容量、成本、降级和事件。

这些组件只适用于运营端，不进入用户产品组件库。

## 四、数据边界

运营端组件只接收运营元数据。组件属性中不得出现候选人姓名、岗位名称、公司业务资料、简历正文、文件名、对话、提示词、业务输入或 Agent 输出正文。任务、支持和诊断详情使用编号和脱敏摘要相互引用。
