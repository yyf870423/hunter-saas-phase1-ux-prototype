# 2026-09-08 人工验收反馈修正

## 已确认范围

1. 客户开发任务的招聘机会草稿确认提示及演示回复使用“确认”。不自动回复、不自动入库，不改写已保存的用户原文；现有明确同意词解析继续兼容。
2. 摸排 `completed` 链接缺少阶段映射，导致干净会话只有初始输入。现补齐阶段历史、报告结果、待补充信息和后续输入；完成示例选择“仅保留摸排报告”，不伪造新增图谱资产。完成状态和计划保持一致，后续消息在浏览器会话内保留。
3. 只有统一“新建任务”，周期意图从用户输入判断，优先于一次性招聘需求分类。旧 `mode=periodic` 参数移除后兼容统一入口，已有周期任务调整保留原计划。具体星期或每天的频率保留；未指定时间时沿用 09:00 草稿默认值，仍需用户确认。
4. 论文、专利详情均无编辑；列表多选只有删除，取消只退出选择。删除继续使用公共确认 Modal，本轮不扩展真实删除、恢复或回收联动。

## 组件与边界

- `SingleAssetTaskSummary.confirmationReply` 仅配置共享 Markdown 的确认文案，输入、解析、授权、写入和幂等边界不变。
- `NewWork` 和 `periodic-draft.js` 继续使用既有分类与计划草稿，不新增任务类型预选择器，不代表接入真实模型或调度器。
- `MappingTimeline`、`HunterReply`、`UserMessage` 和 `Composer` 保留原布局；示例保存选择统一从 `stage3/data.js` 读取，不复制完成页面。
- 学术列表与详情继续组合既有头部、列表选择及 `DeleteAssetModal`，不新增样式或组件体系。

## 验证

- 62 项不同的相关 Playwright 用例通过，包括 9 项本轮验收回归；没有重跑整个原型的全量套件。
- 32 项单元测试和生产构建通过。手机端周期任务页的新建图标补充可访问名称；桌面、手机截图已对照检查。
- 没有新增视觉 token，没有修改正式 Hunter 代码；原型仍使用浏览器示例数据，不代表真实模型、图谱写入或后台调度已实现。

## 验收配图

- [统一新建任务](assets/acceptance-feedback-20260908/desktop-new-task.png)
- [从输入识别周期](assets/acceptance-feedback-20260908/desktop-periodic-detected.png)
- [客户草稿回复“确认”](assets/acceptance-feedback-20260908/desktop-client-confirmed.png)
- [摸排完成与继续输入](assets/acceptance-feedback-20260908/desktop-mapping-completed.png)
- [手机摸排完成](assets/acceptance-feedback-20260908/mobile-mapping-completed.png)
- [论文多选仅删除](assets/acceptance-feedback-20260908/desktop-papers-bulk.png)
- [专利多选仅删除](assets/acceptance-feedback-20260908/desktop-patents-bulk.png)
- [专利详情无编辑](assets/acceptance-feedback-20260908/desktop-patents-detail.png)
