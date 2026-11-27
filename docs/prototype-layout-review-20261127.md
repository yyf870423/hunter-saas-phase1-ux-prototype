# 原型控件排布巡检与修复

## 范围与状态

用户要求检查整体原型，修复按钮、输入框等控件的排布问题。本轮基于原型提交 `4b938c7175d9e75010807b01b59d32d06789667e`，只调整原型布局。2026-11-27 用户验收通过并授权推送 GitHub 原型；同时授权将已验收排布同步到在线产品的前端仓库，不改后端或直接部署产品。

检查工作台、任务及计划、洞察、资产列表/详情/新建、常用弹窗、数据管理和设置。共 68 个不同页面或状态，在 1440px 和 871px 宽度各检查一次，另抽查 12 个 390px 状态，共 148 个截图巡检。结合公共组件及页面源码、控件尺寸和真实浏览器截图判断，不把图谱/表格的局部滚动、明确的文字省略或折叠导航隐藏文字当作排布缺陷。

不改文案、数据、业务流程、权限、隐藏入口、AROS 1420、后端、SDK、数据库或正式官网。不能把本轮布局检查等同于全系统业务验收；运营端、营销页面、全部历史/异常状态和图谱性能不属于本轮完整覆盖范围。

## 发现并修复的问题

| 等级 | 问题与证据 | 修复与影响范围 |
| --- | --- | --- |
| P2 | 普通表单的输入框为 38px，下拉框和日期触发器默认 36px，新建岗位、候选人、公司和招聘机会等表单的同排控件底边不齐。 | 仅在公共 FormField 上设置 `--s1-field-height: 38px`，沿用原有 SelectMenu、DatePicker。筛选栏仍为已验收的 40px，不改日历/下拉行为。 |
| P2 | 联系人关联候选人后，StateBanner 直接接收两个并列按钮。第二个“修改关联”掉入网格下一行的图标列，871px 下宽度仅 22px，文字被挤坏。 | 用现有 `s4-field-actions` 把两个按钮归为一个操作组；窄屏落入正文列，保留 6px 间距及原有查看、修改关联操作。 |
| P3 | 公共分页的页码、跳页输入为 30px，每页条数下拉框却为 36px。 | 仅公共分页内的下拉触发器统一为 30px，选项和分页行为不变。 |
| P3 | 招聘机会“活动记录”标题栏的筛选为 36px，“记录跟进”为 32px。 | 公共操作组新增 `is-compact` 尺寸变体，当前仅用于该标题行，统一 32px；保持 8px 间距、现有换行及业务操作。 |

生产源码修改限于四个文件：`src/stage4/stage4.css`、`CompanyOpportunityPages.jsx`、`OpportunityPages.jsx`、`opportunity-components.css`。没有新造控件视觉。

## 验证结果

实际通过 183 项浏览器检查：

- `tests/layout/layout-survey.spec.js`：148 项，保存真实截图和尺寸记录；修改后扫描结果无控件重叠、表单高度异常、分页以外的选择框包裹空隙或按钮内容溢出等已定义告警。无页面级横向溢出、页面脚本异常或非 GET/HEAD 请求。
- `tests/layout/control-layout-regression.spec.js`：12 项，1440/871/390px 验证四类修复。新建表单控件 38px；8 类实际存在分页的页面控件 30px且能切换条数；联系人关联、修改及查看正常；活动类型筛选与记录跟进弹窗仍正常。
- 既有职业概览按钮、面试筛选、暂缓入口回归：21 项通过，未恢复已隐藏入口，面试筛选仍是 40px。
- 既有个人资料编辑、邮箱连接表单回归：2 项通过。
- `npm run build` 通过，只有已有的大分块非阻塞警告。
- `node scripts/verify-pages-artifact.mjs` 通过：293 个白名单官网文件与构建产物一致，无后台或私有文件混入。本轮未发布任何产物。
- 最终 `git diff --check` 通过。人工对照了修复前后截图和最终源码；已知的四类问题均收敛。

复测命令（本地原型服务端口 1425）：

```sh
PLAYWRIGHT_PORT=1425 npx playwright test tests/layout/layout-survey.spec.js tests/layout/control-layout-regression.spec.js --workers=2
PLAYWRIGHT_PORT=1425 npx playwright test tests/stage4/candidate-summary-actions.spec.js tests/stage4/interview-filter-row.spec.js tests/stage4/deferred-asset-sections.spec.js --workers=2
PLAYWRIGHT_PORT=1425 npx playwright test tests/stage5/settings.spec.js --grep '个人资料支持分区编辑|连接页覆盖邮箱'
npm run build
node scripts/verify-pages-artifact.mjs
git diff --check
```

## 验收入口与证据

- 新建岗位：<http://127.0.0.1:1425/hunter-saas-phase1-ux-prototype/#/positions/new>，查看输入框与下拉框的同排对齐。
- 候选人列表：<http://127.0.0.1:1425/hunter-saas-phase1-ux-prototype/#/candidates>，查看底部分页。
- 联系人：<http://127.0.0.1:1425/hunter-saas-phase1-ux-prototype/#/companies/company-xinglan/contacts/contact-chenyu>，点击“关联候选人”，选择林昊，保存关联后查看同一组内的“查看候选人”“修改关联”。此操作只修改原型浏览器本地样例，不写真实后台。
- 招聘机会：<http://127.0.0.1:1425/hunter-saas-phase1-ux-prototype/#/opportunities/opportunity-xinglan?tab=history>，查看“活动记录”右侧筛选与按钮。

本机修复前后代表截图位于 `/Users/eric.yu/job_hunting/outputs/prototype-layout-review-20261127/`，保留 form/contact/activity/pagination 的 before/after，以及联系人手机宽度 after。完整巡检截图与尺寸记录在 `/tmp/prototype-layout-review-before-20261127/` 和 `/tmp/prototype-layout-review-after-20261127/`，临时目录不作为长期研发交付依赖；两份新增测试可以重新生成证据。

发布步骤：按既有流程仅快进推送 GitHub 原型并复验 Pages；推送提交与公网页面验证结果另在本地交付记录中登记，不把产品前端同步视为产品部署完成。
