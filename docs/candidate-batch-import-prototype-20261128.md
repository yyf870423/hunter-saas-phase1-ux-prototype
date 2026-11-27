# 新建候选人：批量导入原型

## 已确认决定与范围

用户确认列表按原型处理，并要求先在原型“新建候选人”增加批量导入，交互参考数据导入。2026-11-28用户已验收最终FileInput图标、下载示例及整套原型，并授权“推送原型，然后继续一比一还原”。原型按此范围推送；产品仅同步前端至本地1420，完成后再次验收，后端与产品部署不动。

既有原型已经有“手动新建 / 上传简历”，数据管理有 FileDrop、导入确认、导入任务及逐项详情，可承载本次需求，无需重设计页面或控件。新增第三个方式“批量导入”，保持已有两种方式不变。

## 方案

- 文件区复用数据导入 FileDrop：多份 PDF/DOCX、ZIP、XLSX，单次最多 100 份，单个文件不超过 20 MB。类型、数量、大小、空文件错误明确展示，可移除后重选。
- 同样复用写入后人岗匹配选项：默认关闭；开启后可选全部招聘中岗位或指定岗位，指定岗位为空不能继续。
- 文件检查后打开“确认导入任务”Modal，显示所选文件及匹配设置；不预报候选人数、成功人数。返回保留选择，确认后才创建原型任务。
- 成功态可以查看任务详情、继续导入。任务和数据管理共享同一份内存状态，前往数据导入后可查看、刷新、重新打开同一任务，不做两套结果。
- XLSX空白模板沿用当前导入解析器能识别的表头，不放入真实个人资料。下载真实文件，不以 Toast 冒充下载。
- 显式标注“原型说明，正式实现不展示”：不上传文件，不解析正文、ZIP内部或表格行，不写真实候选人。任务目前模拟文件级处理，不能把文件数量当作候选人数。刷新网页重置演示任务，页面内导航保留。

## 公共组件与边界

2026-11-28反馈：用户认为重叠文件Files图标类似复制，因此弃用。核对实际产品及官方组件后，批量导入侧栏改为Lucide FileInput（水平箭头进入单份文件），与上传简历的上箭头、复制的重叠文件区分，不自行绘制SVG。下载入口完全沿用数据导入的“下载 候选人 导入示例”文字链接及公共样式，不使用按钮/下载图标，同样位于匹配选项下方。两个候选人入口复用CandidateImportExampleLink并下载同一空白XLSX，其他资产类型的入口不改。其余布局和流程保持不变。

图标参考（2026-11-28核对官方源码/文档，并非声称所有产品统一采用某一图标）：

- [Twenty CRM导入记录配置](https://github.com/twentyhq/twenty/blob/main/packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant.ts)：importRecords明确使用IconFileImport；借鉴文件与进入箭头的语义，项目继续用已有Lucide库的FileInput，不引入新图标依赖。
- [NocoDB导入弹窗](https://github.com/nocodb/nocodb/blob/develop/packages/nc-gui/components/project/ImportModal.vue)：按CSV、Excel、JSON使用不同格式图标；我们允许多种文件，不采用单一表格格式图标。
- [Ant Design拖拽上传示例](https://4x.ant.design/components/upload-cn/#components-upload-demo-drag)：使用InboxOutlined托盘，属于设计系统参考，不冒充具体产品使用证据。
- [Lucide FileInput](https://lucide.dev/icons/file-input)：本项目最终复用的现成图标。以上参考只影响批量导入侧栏图标，不更改上传区图标或其他流程。

复用现有 Button、FileDrop、Modal、StateBanner、StatusBadge、PostWriteMatchingOptions、ImportTaskDetail，以及数据导入的确认摘要和结果列表样式。新增 CandidateBatchImport 为组合组件、import-task-store 为两个入口的临时共享状态；不在业务页另造上传、按钮或输入框视觉。

产品仓库已完成但尚未推送的排布同步状态，见 AROS `docs/06-ui/control-layout-alignment-2026-11-27.md`。候选人/岗位列表旧导入入口迁移等待此原型验收；现有后端、SDK、测试库和公网部署不动。

## 验证与验收

- 文件规则11项单元检查通过：类型、大小、数量边界、空文件、多错误不静默跳过，以及模板表头。
- 新增9项浏览器流程通过：1440/871/390px完整流程、确认返回保留选择、双击防重复、错误移除/重选、拖放、大文件、同名文件、匹配门禁与设置回显、继续导入独立任务、真实示例下载，以及与数据导入的链接外观/行为对照。
- 既有15项导入任务详情回归及5项新建/上传/写入后匹配回归通过。没有把首次测试中错误使用导航按钮而非页签造成的超时当作产品缺陷；测试按真实页签修正后重新验证。
- 构建、293项官网产物边界检查及`git diff --check`通过。构建仅有已有大分块警告。
- 已核对公共组件与新组合代码，以及桌面、窄桌面、手机的上传区、确认窗口、任务详情截图。上传区与说明间保留12px间距，长文件名在确认清单内可换行；原有新建/上传视觉不改。
- 原型不发业务写请求，不请求后台解析。任务状态是显式本地模拟，不能算真实文件解析、候选人导入或匹配验收。

本地验收：<http://127.0.0.1:1425/hunter-saas-phase1-ux-prototype/#/candidates/new?mode=batch>；也可从候选人列表点击“新建候选人”，再选“批量导入”。可选择自己的文件检查交互，文件不会上传；模板下载会生成空白表头。

代表截图在本机`/Users/eric.yu/job_hunting/outputs/candidate-batch-import-final-20261128/`；最终组合回归证据在`/Users/eric.yu/job_hunting/outputs/candidate-batch-complete-20261128/`。路径不作为异机运行依赖，仓库中的测试可重新生成。

用户反馈后的9项浏览器复验和构建通过，截图见本机`/Users/eric.yu/job_hunting/outputs/candidate-batch-feedback-20261128/`。两处下载入口均为无图标文字链接，字号、颜色、字重、下划线和边框计算样式一致；下载同一份空白示例文件。

FileInput替换后另做1项定点浏览器复验，覆盖1440/871px实际截图、图标显示、页面无横向溢出、示例链接顺序/样式与下载行为，通过；人工查看两张截图并对照源码。构建、293项产物边界检查及diff检查通过。证据在本机`/Users/eric.yu/job_hunting/outputs/candidate-import-icon-research-20261128/`；此前流程检查不冒称为本次重新全跑。

推送前已重新通过9项批量导入浏览器回归和11项文件规则单元检查，FileInput版本构建及293项产物检查通过。远端main核对为排布基线8196312，按快进方式提交并推送本批内容，不强推。产品旧入口迁移及批量导入开始按已验收原型同步，产品结果尚待独立验收。
