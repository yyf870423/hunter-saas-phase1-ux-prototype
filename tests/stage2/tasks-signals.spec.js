import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("导航和任务工作区只使用统一任务概念", async ({ page }) => {
  await page.goto("#/home");
  await expect(
    page.getByRole("button", { name: "任务", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "业务主线", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "支线任务", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "处理进度", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "任务", exact: true }).click();
  await expect(page).toHaveURL(/#\/tasks$/);
  await expect(
    page.getByRole("heading", { name: "新建任务", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".s2-history-list").getByText("具身智能 VLA 算法负责人"),
  ).toBeVisible();
  await expect(page.locator(".s2-history-scenes em").first()).toHaveCSS("font-size", "13px");
  await expect(page.locator(".s2-history-scenes em").first()).toHaveCSS("font-weight", "650");
  await page.screenshot({ path: "artifacts/opportunity-lifecycle/spacing/quick-task-types-after.png", animations: "disabled" });
  await page.getByPlaceholder("搜索任务").fill("核验灵巧手");
  await expect(
    page.locator(".s2-history-list").getByText("核验灵巧手团队负责人"),
  ).toBeVisible();

  await page.goto("#/tasks");
  await expect(page).toHaveURL(/#\/tasks$/);
});

test("统一任务工作区支持任务与周期性任务切换", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/tasks");
  await expect(
    page.getByRole("tab", { name: "任务", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "周期性任务" }).click();
  await expect(page).toHaveURL(/#\/tasks\/periodic$/);
  await expect(page.getByRole("heading", { name: "周期性任务" })).toBeVisible();
  await page.getByRole("tab", { name: "任务", exact: true }).click();
  await expect(page).toHaveURL(/#\/tasks$/);
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("周期性任务覆盖配置、运行记录和等待用户状态", async ({ page }) => {
  await page.goto("#/tasks/periodic");
  await expect(
    page.getByRole("heading", {
      name: "每周发现具身智能创业公司与招聘机会",
    }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /运行记录/ }).click();
  await expect(
    page.locator(".s2-periodic-list-label").getByText("全部状态 · 近一周"),
  ).toBeVisible();
  await page.locator(".s2-periodic-status-filter > button").click();
  await page.getByRole("button", { name: "等待用户", exact: true }).click();
  await expect(page.locator(".s2-periodic-list > button")).toHaveCount(1);
  await expect(
    page.getByRole("complementary").getByText("两位候选人的身份合并结论冲突"),
  ).toBeVisible();
  await expect(page.locator(".s2-run-conversation")).toBeVisible();
  await expect(page.getByLabel("任务对话输入")).toBeVisible();
  await expect(page.getByText("确认当前两份候选人资料的身份关系")).toBeVisible();
  await page.getByRole("button", { name: /跳过本轮冲突项/ }).click();
  await expect(page.getByText("运行已继续")).toBeVisible();
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await page.getByLabel("任务对话输入").fill("只重新处理受影响的两个岗位。");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("只重新处理受影响的两个岗位。")).toBeVisible();
  await expect(page.getByText(/已收到补充要求/)).toBeVisible();
});

test("周期性任务提供关键页面状态和运行时间筛选", async ({ page }) => {
  for (const route of [
    "#/tasks/periodic?state=loading",
    "#/tasks/periodic?state=empty",
    "#/tasks/periodic?state=error",
    "#/tasks/periodic?state=disabled",
  ]) {
    await page.goto(route);
    await expectNoHorizontalOverflow(page);
  }

  await page.goto("#/tasks/periodic?view=runs&status=正在运行");
  await expect(page.locator(".s2-periodic-list > button")).toHaveCount(1);
  await expect(page.getByText("当前执行进度", { exact: true })).toBeVisible();
  await expect(page.locator(".s2-run-round.is-current .s2-hunter-reply")).toHaveCount(1);
  await expect(page.locator(".s2-run-round-divider").first()).toBeVisible();
  await expect(
    page.locator(".s2-run-composer-dock .s2-composer"),
  ).toBeVisible();
  const statusFilterBox = await page
    .locator(".s2-periodic-status-filter")
    .boundingBox();
  const timeFilterBox = await page
    .locator(".s2-periodic-time-filter")
    .boundingBox();
  expect(statusFilterBox).not.toBeNull();
  expect(timeFilterBox).not.toBeNull();
  expect(
    timeFilterBox.x - (statusFilterBox.x + statusFilterBox.width),
  ).toBeLessThanOrEqual(8);
  await page.locator(".s2-periodic-time-filter > button").click();
  await page.getByRole("button", { name: "自定义", exact: true }).click();
  await expect(page.getByRole("button", { name: /开始日期/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /结束日期/ })).toBeVisible();

  await page.goto("#/processing");
  await expect(page).toHaveURL(/#\/tasks\/periodic\?view=runs&status=/);
});

test("所有周期运行状态都使用可继续对话的完整详情", async ({ page }) => {
  await page.goto("#/tasks/periodic?view=runs");
  await page.locator(".s2-periodic-time-filter > button").click();
  await page.getByRole("button", { name: "近一个月", exact: true }).click();
  // 9 runs in the last month, including the mailbox round.
  await expect(page.locator(".s2-periodic-list > button")).toHaveCount(9);

  for (const index of [0, 2, 3, 4, 5, 6, 7, 8]) {
    await page.locator(".s2-periodic-list > button").nth(index).click();
    await expect(page.locator(".s2-run-conversation")).toBeVisible();
    await expect(page.getByLabel("任务对话输入")).toBeVisible();
    await expect(page.getByText("执行计划", { exact: true })).toBeVisible();
  }
});

test("统一任务相关页面在 320 像素宽度下无页面级溢出", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  for (const route of [
    "#/tasks",
    "#/tasks/periodic",
    "#/tasks/periodic?view=runs&run=run-position-waiting",
    "#/signals",
  ]) {
    await page.goto(route);
    await expectNoHorizontalOverflow(page);
  }
  await page.goto("#/tasks/periodic?view=runs&run=run-position-waiting");
  await page.locator(".s2-run-composer-dock").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("任务对话输入")).toBeVisible();
});

test("直接核验任务详情支持补充资料、恢复和结果回流", async ({ page }) => {
  await page.goto("#/tasks/task-hand-team");
  await expect(page.getByText("工作上下文", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "当前判断" })).toBeVisible();
  await expect(page.locator(".s2-markdown-table")).toBeVisible();
  await expect(page.getByText("查看技术信息")).toHaveCount(0);
  await expect(page.locator(".s2-task-timeline .s2-task-plan")).toHaveCount(0);
  const planDock = await page.locator(".s2-task-plan").boundingBox();
  const composer = await page
    .locator(".s2-task-composer-dock > .s2-composer")
    .boundingBox();
  expect(planDock).not.toBeNull();
  expect(composer).not.toBeNull();
  expect(planDock.y + planDock.height).toBeLessThanOrEqual(composer.y);
  await expect(
    page.locator(".s2-task-plan > button > svg:last-child path").first(),
  ).toHaveAttribute("d", "m18 15-6-6-6 6");
  await page.getByRole("button", { name: /执行计划/ }).click();
  await expect(
    page.locator(".s2-task-plan > button > svg:last-child path").first(),
  ).toHaveAttribute("d", "m6 9 6 6 6-6");
  await expect(page.getByText("计划已调整为等待用户")).toBeVisible();
  await expect(page.getByText("计划依据", { exact: true })).toHaveCount(0);
  await expect(
    page.locator(".s2-task-plan .s2-plan-list li.is-complete"),
  ).toHaveCount(2);
  await expect(
    page.locator(".s2-task-plan .s2-plan-list li.is-waiting"),
  ).toHaveCount(1);
  const input = page.getByPlaceholder(/输入你掌握的信息/);
  await input.fill("这是同一个人，2025 年 12 月加入穹顶智能。");
  await input.press("Enter");
  await expect(
    page.getByText(/已回流“星澜机器人知识图谱”的更新与审核区/),
  ).toBeVisible();
  await expect(page.getByText("完成", { exact: true }).first()).toBeVisible();
  await expect(
    page.locator(".s2-task-plan .s2-plan-list li.is-complete"),
  ).toHaveCount(3);
  await expect(page.getByText("计划已完成", { exact: true })).toBeVisible();
});

test("推荐报告资产 AI 处理按对话过程保留每次生成的文件", async ({ page }) => {
  await page.goto("#/positions/position-vla?tab=matching&report=linhao");
  await expect(page.getByText("工作上下文", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/推荐报告-v1\.md/)).toBeVisible();
  await expect(page.getByText(/推荐报告-v2\.md/)).toBeVisible();
  await expect(page.getByRole("button", { name: "历史版本" })).toHaveCount(0);
  const v2File = page
    .locator(".recommendation-report-file")
    .filter({ hasText: /推荐报告-v2\.md/ });
  await v2File.getByRole("button", { name: "在线查看" }).click();
  const preview = page.getByRole("complementary", { name: "文件预览" });
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "核心匹配证据" }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "在线查看推荐报告" }),
  ).toHaveCount(0);

  const fileSwitch = preview.locator(".s2-artifact-file-switch > button");
  for (const [name, label] of [
    ["星澜机器人-客户推荐模板.docx", "Word 预览"],
    ["林昊-公开履历.pdf", "PDF 预览"],
    ["林昊-匹配证据.xlsx", "Excel 预览"],
    ["林昊-证据来源.csv", "CSV 预览"],
    ["林昊-客户预览.html", "HTML 预览"],
  ]) {
    await fileSwitch.click();
    await preview.getByRole("option", { name: new RegExp(name) }).click();
    await expect(preview.getByLabel(label)).toBeVisible();
  }

  await fileSwitch.click();
  await preview.getByRole("option", { name: /推荐报告-v2\.md/ }).click();

  const downloadStarted = page.waitForEvent("download");
  await preview.getByRole("button", { name: "下载", exact: true }).click();
  const download = await downloadStarted;
  expect(download.suggestedFilename()).toMatch(/推荐报告-v2\.md$/);
  await preview.getByRole("button", { name: "关闭文件预览" }).click();
  await expect(preview).toHaveCount(0);

  await page
    .locator(".s2-composer textarea")
    .fill("请突出量产交付经验，并把薪资风险放到最后。");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText(/推荐报告-v3\.md/)).toBeVisible();
  await expect(page.locator(".recommendation-report-file")).toHaveCount(3);
  await page.getByRole("button", { name: "返回人岗匹配" }).click();
  await expect(page).toHaveURL(/positions\/position-vla\?tab=matching/);
  await page.goto("#/tasks");
  await expect(page.getByText("林昊 · 客户推荐报告")).toHaveCount(0);
});

test("统一新建入口可进入直接核验任务或直接完成", async ({ page }) => {
  await page.goto("#/new");
  const input = page.getByPlaceholder(/例如：为星澜机器人/);
  await input.fill("核验知识图谱中的两位周明远是不是同一个人");
  await input.press("Enter");
  await expect(page.getByText(/直接核验这两条人物记录/)).toBeVisible();
  await expect(page).toHaveURL(/#\/tasks\/task-hand-team$/, {
    timeout: 5_000,
  });
  await expect(page.getByText(/两位周明远是不是同一个人/)).toBeVisible();

  await page.goto("#/new");
  await input.fill("把这三条面试反馈整理为候选人跟进摘要");
  await input.press("Enter");
  await expect(page).toHaveURL(/#\/tasks\/task-interview-summary$/, {
    timeout: 5_000,
  });
  await expect(
    page.getByRole("heading", { name: "整理林昊的面试反馈" }),
  ).toBeVisible();
  await expect(page.getByText(/已整理当前三条面试反馈/)).toBeVisible();
});

test("统一新建入口覆盖歧义、自由补充和权限受限", async ({ page }) => {
  await page.goto("#/new?state=clarify");
  await expect(page.getByText("需要补充任务目标")).toBeVisible();
  await expect(page.locator(".s2-decision-request > div > button")).toHaveCount(
    3,
  );
  await page.getByRole("button", { name: /我来补充其他目标/ }).click();
  await expect(page.locator(".s2-composer textarea")).toHaveValue(
    "我的具体目标是：",
  );

  await page.goto("#/new?state=limited");
  await expect(page.getByText("当前工作空间不能创建新任务")).toBeVisible();
  await expect(page.locator(".s2-composer textarea")).toBeDisabled();

  await page.goto("#/tasks");
  await expect(page).toHaveURL(/#\/tasks$/);
});

test("统一自然语言入口可以创建周期性任务", async ({ page }) => {
  await page.goto("#/new");
  const input = page.locator(".s2-composer textarea");
  await input.fill("每周一检查具身智能创业公司和招聘变化，有重要发现时提醒我");
  await input.press("Enter");
  await expect(
    page.getByRole("heading", { name: "周期性任务草案" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "是否按此计划创建周期性任务？", exact: true })).toBeVisible();
  await input.fill("是");
  await input.press("Enter");
  await expect(page).toHaveURL(
    /#\/tasks\/periodic\?selected=periodic-[\w-]+$/,
  );
  await expect(
    page.getByText("周期性任务已创建，将按确认的计划运行"),
  ).toBeVisible();
});

test("新建任务和直接核验任务的普通回复统一由动态 Markdown 渲染", async ({
  page,
}) => {
  const routes = [
    ["#/new?state=direct", "面试反馈摘要"],
    ["#/new?state=mainline", "持续汇总系统候选人"],
    ["#/new?state=task", "直接核验这两条人物记录"],
    ["#/tasks/task-hand-team", "当前判断"],
  ];

  for (const [route, marker] of routes) {
    await page.goto(route);
    await expect(
      page.getByText(marker, { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.locator('.s2-hunter-reply[data-renderer="markdown"]').first(),
    ).toBeVisible();
    await expect(
      page.locator(
        ".s2-inline-artifact, .s2-evidence-table, .s3-opportunity-summary",
      ),
    ).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  }
});

test("洞察只有处理和忽略两个按钮，没有处理结果时不标记", async ({ page }) => {
  await page.goto("#/signals?signal=signal-cloudchip");
  await expect(
    page.getByRole("heading", { name: /云脉芯能正在组建机器人芯片团队/ }),
  ).toBeVisible();
  await expect(page.getByText("4 个来源 · 今天 09:12")).toBeVisible();
  const listBox = await page.locator(".s2-signal-list-pane").boundingBox();
  const detailBox = await page.locator(".s2-signal-detail").boundingBox();
  expect(listBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(detailBox.width).toBeGreaterThan(listBox.width * 1.35);
  const footer = page.locator(".s2-signal-detail > footer");
  await expect(footer.getByRole("button", { name: "处理", exact: true })).toBeVisible();
  await expect(footer.getByRole("button", { name: "忽略", exact: true })).toBeVisible();
  for (const removed of ["处理洞察", "继续观察", "立即复查", "恢复观察", "查看完整上下文对话"]) {
    await expect(page.getByRole("button", { name: removed, exact: true })).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { name: "还没有处理结果" })).toBeVisible();
  await expect(page.locator(".s2-signal-task-context")).toContainText("今天 09:00 那一轮");
});

test("点处理回到来源任务对话并引用洞察，开始客户开发后自动标记已处理", async ({ page }) => {
  await page.goto("#/signals?signal=signal-cloudchip");
  await page.locator(".s2-signal-detail > footer").getByRole("button", { name: "处理", exact: true }).click();
  await expect(page).toHaveURL(/run=run-startups-success.*quote=signal-cloudchip/);
  await expect(page.locator(".s2-quote-chip")).toContainText("云脉芯能正在组建机器人芯片团队");
  await expect(page.locator(".s2-run-round.is-current")).toBeVisible();
  await expect(page.locator(".s2-run-round-divider")).toHaveCount(4);
  await page.getByLabel("任务对话输入").fill("这家开始客户开发");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator(".s2-message-quote")).toContainText("云脉芯能正在组建机器人芯片团队");
  await expect(page.locator(".s2-quote-chip")).toHaveCount(0);
  await expect(page.locator(".s2-run-round.is-current").getByText(/已标记“9\/3 已处理：开始客户开发：云脉芯能”/)).toBeVisible();
  await page.goto("#/signals?signal=signal-cloudchip");
  await expect(page.locator(".s2-signal-detail")).toContainText("9/3 已处理：开始客户开发：云脉芯能");
  await page.goto("#/signals?filter=open");
  await expect(page.locator(".s2-signal-feed")).not.toContainText("云脉芯能正在组建机器人芯片团队");
});

test("只问问题不打标记，回复知道了记为已知情", async ({ page }) => {
  await page.goto("#/signals?signal=signal-chensong");
  await page.locator(".s2-signal-detail > footer").getByRole("button", { name: "处理", exact: true }).click();
  await expect(page).toHaveURL(/run=run-candidate-partial.*quote=signal-chensong/);
  await page.getByLabel("任务对话输入").fill("他现在团队多大？");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText(/这条要记个结论吗/)).toBeVisible();
  await page.goto("#/signals?filter=open");
  await expect(page.locator(".s2-signal-feed")).toContainText("陈松加入星澜机器人");
  await page.goto("#/tasks/periodic?view=runs&run=run-candidate-partial");
  await page.getByLabel("任务对话输入").fill("知道了");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await page.goto("#/signals?signal=signal-chensong");
  await expect(page.locator(".s2-signal-detail")).toContainText("已处理：已知情");
});

test("资料更新先出草稿，确认后才打已处理标记", async ({ page }) => {
  await page.goto("#/tasks/periodic?view=runs&run=run-candidate-partial&quote=signal-chensong");
  await page.getByLabel("任务对话输入").fill("更新陈松的资料");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByRole("heading", { name: "资料更新草稿" })).toBeVisible();
  await page.goto("#/signals?signal=signal-chensong");
  await expect(page.getByRole("heading", { name: "还没有处理结果" })).toBeVisible();
  await page.goto("#/tasks/periodic?view=runs&run=run-candidate-partial");
  await page.getByRole("button", { name: /^是 写入资料/ }).click();
  await expect(page.getByText(/已写入，这条洞察已标记/)).toBeVisible();
  await page.goto("#/signals?signal=signal-chensong");
  await expect(page.locator(".s2-signal-detail")).toContainText("更新了陈松的资料（v5）");
});

test("只看未处理、忽略、取消忽略和撤销标记", async ({ page }) => {
  await page.goto("#/signals?filter=open");
  const feed = page.locator(".s2-signal-feed");
  await expect(feed).not.toContainText("拓界智驾新增感知与规划团队招聘页面");
  await expect(feed).not.toContainText("周明远近期连续转发具身智能招聘内容");
  await expect(feed).toContainText("云脉芯能正在组建机器人芯片团队");
  await page.goto("#/signals?signal=signal-cloudchip");
  await page.locator(".s2-signal-detail > footer").getByRole("button", { name: "忽略", exact: true }).click();
  await expect(page.getByRole("button", { name: "取消忽略" })).toBeVisible();
  await page.getByRole("tab", { name: /已忽略/ }).click();
  await expect(feed).toContainText("云脉芯能正在组建机器人芯片团队");
  await page.getByRole("button", { name: "取消忽略" }).click();
  await expect(page.locator(".s2-signal-detail > footer").getByRole("button", { name: "忽略", exact: true })).toBeVisible();
  await page.goto("#/signals?signal=signal-tuoji");
  await expect(page.locator(".s2-signal-detail")).toContainText("9/3 已处理：约了 9 月 17 日复查");
  await page.getByRole("button", { name: "撤销标记" }).click();
  await expect(page.getByRole("heading", { name: "还没有处理结果" })).toBeVisible();
  // The undo is kept in the history (design 10 §6.6).
  await expect(page.locator(".s2-signal-history")).toContainText("撤销了“已处理”标记");
  await expect(page.locator(".s2-signal-history")).toContainText("原标记：约了 9 月 17 日复查");
});

test("对话里交给已有任务、发邮件确认后、否决草稿后回“知道了”都会打标记；说“撤销”会去掉标记", async ({ page }) => {
  // 例：交给已有任务 → “交给“岗位招聘任务”继续”
  await page.goto("#/tasks/periodic?view=runs&run=run-startups-success&quote=signal-cloudchip");
  await page.getByLabel("任务对话输入").fill("交给岗位招聘任务继续跟");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText(/已标记“9\/3 已处理：交给“岗位招聘任务”继续”/)).toBeVisible();
  // 例：说“撤销” → 去掉标记
  await page.goto("#/tasks/periodic?view=runs&run=run-startups-success&quote=signal-cloudchip");
  await page.getByLabel("任务对话输入").fill("刚才标错了，撤销");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText(/已撤销这条洞察的“已处理”标记/)).toBeVisible();
  // 例：发邮件 → 先出草稿，点“是”才算已处理
  await page.goto("#/tasks/periodic?view=runs&run=run-startups-success&quote=signal-cloudchip");
  await page.getByLabel("任务对话输入").fill("给他们发封邮件问问");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByRole("heading", { name: "邮件草稿" })).toBeVisible();
  await page.getByRole("button", { name: /^是 从你的邮箱发出/ }).click();
  await expect(page.getByText(/已发出，这条洞察已标记“9\/3 已处理：发出邮件给云脉芯能”/)).toBeVisible();
  await page.goto("#/signals?signal=signal-cloudchip");
  await expect(page.locator(".s2-signal-detail")).toContainText("9/3 已处理：发出邮件给云脉芯能");
  // 例：更新草稿选“否”，Hunter 问要不要记结论，回“知道了” → 已知情；这一轮不会变成“正在运行”
  await page.goto("#/tasks/periodic?view=runs&run=run-candidate-partial&quote=signal-chensong");
  await page.getByLabel("任务对话输入").fill("更新一下他的资料");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await page.getByRole("button", { name: /^否 保留草稿/ }).click();
  await expect(page.getByText("草稿已保留，没有写入。这条要记个结论吗？")).toBeVisible();
  await page.getByLabel("任务对话输入").fill("知道了");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText(/已标记“9\/3 已处理：已知情”/)).toBeVisible();
  await expect(page.locator(".s2-run-detail > header")).not.toContainText("正在运行");
});

test("未处理的洞察不加标记，邮箱周期任务不能单独暂停或删除", async ({ page }) => {
  await page.goto("#/signals?signal=signal-cloudchip");
  await expect(page.locator(".s2-signal-detail > header")).not.toContainText("未处理");
  await expect(page.locator(".s2-signal-detail > header small")).toHaveText(/^洞察 · /);
  await page.goto("#/tasks/periodic?selected=periodic-mailbox");
  await expect(page.getByRole("heading", { name: "邮箱：读取 shenlan@qq.com 的邮件" })).toBeVisible();
  await expect(page.getByRole("button", { name: "暂停", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "删除", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "管理邮箱连接" })).toBeVisible();
});

test("洞察来源可以查看证据内容且不会伪装为真实外部链接", async ({ page }) => {
  await page.goto("#/signals?signal=signal-cloudchip");
  await page.getByRole("button", { name: /公司招聘页面/ }).click();
  const dialog = page.getByRole("dialog", { name: "来源与证据" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("直接证据", { exact: true })).toBeVisible();
  await expect(dialog.getByText("支持结论", { exact: true })).toBeVisible();
  await expect(dialog.getByText("新增机器人芯片算法岗位")).toBeVisible();
  await dialog.getByRole("button", { name: "打开原始来源" }).click();
  await expect(page.getByText(/原型未连接真实外部地址/)).toBeVisible();
});

test("洞察列表与详情在桌面端独立纵向滚动", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("#/signals?signal=signal-cloudchip");
  const feed = page.locator(".s2-signal-feed");
  const detail = page.locator(".s2-signal-detail");

  await expect(feed).toHaveCSS("overflow-y", "auto");
  await expect(detail).toHaveCSS("overflow-y", "auto");
  expect(
    await detail.evaluate((node) => node.scrollHeight > node.clientHeight),
  ).toBe(true);

  await detail.evaluate((node) => {
    node.scrollTop = 180;
  });
  expect(await feed.evaluate((node) => node.scrollTop)).toBe(0);
  expect(await detail.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);

  const detailScrollTop = await detail.evaluate((node) => node.scrollTop);
  await feed.evaluate((node) => {
    node.scrollTop = 160;
  });
  expect(await feed.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  expect(await detail.evaluate((node) => node.scrollTop)).toBe(detailScrollTop);
});

test("周期运行与洞察可以双向追溯", async ({ page }) => {
  await page.goto("#/signals?signal=signal-xinglan");
  await expect(page.locator(".s2-signal-detail")).toContainText("8/18 已处理：交给岗位招聘任务");
  // Only two actions on the detail (处理 / 忽略); the source-task block has no button of its own.
  await expect(page.locator(".s2-signal-task-context").getByRole("button")).toHaveCount(0);
  await page.locator(".s2-signal-detail > footer").getByRole("button", { name: "处理", exact: true }).click();
  await expect(page).toHaveURL(/run=run-startups-0817/);
  const finding = page.locator("#finding-signal-cloudchip");
  await expect(finding).toContainText("未处理");
  await finding.getByRole("button", { name: "在洞察中心查看" }).click();
  await expect(page).toHaveURL(/signal=signal-cloudchip/);
  await expect(
    page.getByRole("heading", { name: /云脉芯能正在组建机器人芯片团队/ }),
  ).toBeVisible();
});

test("移动端可以从信号列表进入详情并返回", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/signals");
  await page
    .locator(".s2-signal-feed > button")
    .filter({ hasText: "陈松加入星澜机器人，任自动驾驶技术经理" })
    .click();
  await expect(page.locator(".s2-signal-detail")).toHaveCSS("opacity", "1");
  await expect(
    page.getByRole("heading", { name: /陈松加入星澜机器人/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回洞察列表" }).click();
  await expect(
    page.getByPlaceholder("搜索公司、人物或洞察"),
  ).toBeVisible();
});

test("资料变化放在资产自己的待审核里，影响进行中任务的才进洞察中心，两处互相同步", async ({ page }) => {
  // 规则（议题 14）：图谱关系变化只进图谱“更新与审核”；候选人资料变化进候选人待审核；
  // 例：陈松（在 VLA 推荐阶段）加入星澜 → 洞察写明影响的任务和相关更新，在候选人里确认后洞察自动标记已处理。
  await page.goto("#/signals");
  await expect(page.locator(".s2-signal-feed")).not.toContainText("知识图谱");
  await expect(page.locator(".s2-signal-feed")).toContainText("陈雨来信：星澜机器人想再加 2 个数据平台岗位");
  await page.goto("#/signals?signal=signal-chensong");
  const links = page.locator(".s2-signal-links");
  await expect(links).toContainText("具身智能 VLA 算法负责人（陈松在推荐阶段）");
  await expect(links).toContainText("2 项待审核");
  await page.goto("#/candidates?pending=1");
  await expect(page.getByRole("button", { name: /有待审核更新/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("table tbody tr")).toHaveCount(3);
  await page.goto("#/reviews/fields/candidate-chensong");
  await expect(page.getByRole("heading", { name: "陈松 · 2 项资料建议" })).toBeVisible();
  await page.getByRole("button", { name: "应用变化" }).click();
  await expect(page).toHaveURL(/candidates\/candidate-chensong/);
  await page.goto("#/signals?signal=signal-chensong");
  await expect(page.locator(".s2-signal-detail")).toContainText("9/3 已处理：更新了陈松的资料");
  await expect(links).toContainText("已审核");
  await page.goto("#/candidates?pending=1");
  await expect(page.locator("table tbody tr")).toHaveCount(2);
});

test("周期任务每一轮分开列出写入洞察中心的发现和资料更新，图谱变化只进图谱审核", async ({ page }) => {
  await page.goto("#/tasks/periodic?view=runs&run=run-graph-sept");
  const round = page.locator("#round-run-graph-sept");
  await expect(round).toContainText("不进洞察中心");
  await expect(round.locator(".s2-run-findings.is-updates")).toContainText("具身智能公司关系知识图谱：人才流动：陈松从小鹏汽车加入星澜机器人");
  await round.locator(".s2-run-findings.is-updates").getByRole("button", { name: "去审核" }).click();
  await expect(page).toHaveURL(/mappings\/mapping-company-relations\?tab=reviews/);
  await expect(page.getByRole("heading", { name: "陈松从小鹏汽车加入星澜机器人" })).toBeVisible();
  await page.goto("#/tasks/periodic?view=runs&run=run-mailbox-0903");
  await expect(page.locator("#round-run-mailbox-0903")).toContainText("陈雨来信：星澜机器人想再加 2 个数据平台岗位");
  await page.goto("#/home");
  await expect(page.locator(".s1-dashboard-pending")).toContainText("5 个资产有更新待审核");
  await page.locator(".s1-dashboard-pending").getByRole("button", { name: "公司 1" }).click();
  await expect(page).toHaveURL(/companies\?pending=1/);
});
