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
  await expect(page.getByText("2 项身份冲突需要一起确认")).toBeVisible();
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
  await expect(page.locator(".s2-run-timeline .s2-hunter-reply")).toHaveCount(
    2,
  );
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
  await expect(page.locator(".s2-periodic-list > button")).toHaveCount(7);

  for (const index of [0, 2, 3, 4, 5, 6]) {
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
  await page.goto("#/new?mode=periodic");
  const input = page.locator(".s2-composer textarea");
  await input.fill("每周一检查具身智能创业公司和招聘变化，有重要发现时提醒我");
  await input.press("Enter");
  await expect(
    page.getByRole("heading", { name: "周期性任务草案" }),
  ).toBeVisible();
  await expect(page.getByText("确认周期性任务", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /按此计划创建/ }).click();
  await expect(page).toHaveURL(
    /#\/tasks\/periodic\?selected=periodic-startups$/,
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

test("洞察中心持续跟进观察项并把处理结果带入任务", async ({ page }) => {
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
  await expect(page.getByText("等待你的决定", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/是否围绕云脉芯能启动一次客户开发任务/),
  ).toBeVisible();
  await page.goto("#/signals?signal=signal-tuoji");
  await expect(
    page.getByRole("heading", {
      name: "拓界智驾新增感知与规划团队招聘页面",
    }),
  ).toBeVisible();
  await expect(page.getByText("Hunter 将继续观察")).toBeVisible();
  await expect(
    page.getByText("9 月 7 日 09:00", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "立即复查" }).click();
  await expect(page.getByText("Hunter 正在重新核验")).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "信号核验进度" }),
  ).toBeVisible();
  await expect(page.getByText("等待你的决定", { exact: true })).toBeVisible({
    timeout: 3_000,
  });
  await page.getByRole("button", { name: "处理洞察" }).click();
  await expect(page.getByRole("heading", { name: "处理洞察" })).toBeVisible();
  await page.getByRole("radio", { name: /创建新任务/ }).click();
  await page.getByRole("button", { name: "创建任务", exact: true }).click();
  await expect(page).toHaveURL(/#\/new$/);
  await expect(page.locator(".s2-composer textarea")).toHaveValue(
    /拓界智驾新增感知与规划团队招聘页面/,
  );
});

test("洞察加入已有任务前必须明确选择目标任务", async ({ page }) => {
  await page.goto("#/signals?signal=signal-cloudchip");
  await page.getByRole("button", { name: "处理洞察" }).click();
  await page.getByRole("radio", { name: /加入已有任务/ }).click();
  const submit = page.getByRole("button", { name: "加入所选任务" });
  await expect(submit).toBeDisabled();
  await expect(page.getByText("选择目标任务")).toBeVisible();
  await page.getByRole("radio", { name: /星澜机器人招聘合作/ }).click();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole("heading", { name: "已加入任务" })).toBeVisible();
  await expect(
    page
      .locator(".s2-signal-followup")
      .getByText("星澜机器人招聘合作", { exact: true }),
  ).toBeVisible();
});

test("洞察可以记录系统外处理结果而不创建任务", async ({ page }) => {
  await page.goto("#/signals?signal=signal-chensong");
  await page.getByRole("button", { name: "处理洞察" }).click();
  await page.getByRole("radio", { name: /记录处理结果/ }).click();
  await page
    .getByPlaceholder(/已电话联系招聘负责人/)
    .fill("已电话联系陈松，对方暂时不考虑新机会。");
  await page.getByRole("button", { name: "记录已处理" }).click();
  await expect(
    page.getByRole("heading", { name: "已记录处理结果" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".s2-signal-followup")
      .getByText("已电话联系陈松，对方暂时不考虑新机会。"),
  ).toBeVisible();
});

test("不同业务类型的洞察统一使用通用处理入口", async ({ page }) => {
  for (const id of [
    "signal-graph-sync",
    "signal-cloudchip",
    "signal-chensong",
  ]) {
    await page.goto(`#/signals?signal=${id}`);
    await expect(page.getByRole("button", { name: "处理洞察" })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "发起客户开发" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "安排联系核实" })).toHaveCount(
    0,
  );
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

test("洞察中心展示核验、处理、忽略和失效的真实后续", async ({ page }) => {
  for (const [id, marker] of [
    ["signal-verifying", "Hunter 正在重新核验"],
    ["signal-xinglan", "创建任务"],
    ["signal-ignored", "同一事件不再提醒"],
    ["signal-expired", "观察已经结束"],
  ]) {
    await page.goto(`#/signals?signal=${id}`);
    await expect(page.getByRole("heading", { name: marker })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }

  await page.goto("#/signals?signal=signal-verifying");
  const activity = page.locator(".s2-signal-verification-activity");
  await expect(activity.getByRole("listitem")).toHaveCount(5);
  await expect(
    activity.getByText("正在核验任职时间和近期团队公开动态"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "查看完整上下文对话" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "查看完整上下文对话" }).click();
  await expect(page).toHaveURL(/run=run-startups-active/);
  await expect(page.locator(".s2-run-conversation")).toBeVisible();
});

test("洞察关联任务的完整对话入口不随洞察状态变化丢失", async ({ page }) => {
  await page.goto("#/signals?signal=signal-tuoji");
  const conversationButton = page.getByRole("button", {
    name: "查看完整上下文对话",
  });
  await expect(conversationButton).toBeVisible();
  await page.getByRole("button", { name: "立即复查" }).click();
  await expect(conversationButton).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hunter 正在重新核验" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "等待你的决定" })).toBeVisible(
    {
      timeout: 3000,
    },
  );
  await expect(conversationButton).toBeVisible();
});

test("周期运行与洞察可以双向追溯", async ({ page }) => {
  await page.goto("#/signals?signal=signal-cloudchip");
  await page.getByRole("button", { name: "查看完整上下文对话" }).click();
  await expect(page).toHaveURL(/run=run-startups-success/);
  await page.getByRole("button", { name: "查看本轮产生的洞察" }).click();
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
    .filter({ hasText: "陈松的公开任职信息发生变化" })
    .click();
  await expect(page.locator(".s2-signal-detail")).toHaveCSS("opacity", "1");
  await expect(
    page.getByRole("heading", { name: /陈松的公开任职信息发生变化/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回洞察列表" }).click();
  await expect(
    page.getByPlaceholder("搜索公司、人物、信号或洞察"),
  ).toBeVisible();
});
