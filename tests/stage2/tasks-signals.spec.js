import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("导航、列表和详情只使用统一任务概念", async ({ page }) => {
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
  await page.getByRole("button", { name: "任务", exact: true }).click();
  await expect(page).toHaveURL(/#\/tasks$/);
  await expect(
    page.getByRole("heading", { name: "任务", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".s2-task-row")
      .filter({ hasText: "具身智能 VLA 算法负责人" })
      .first(),
  ).toBeVisible();
  await page
    .getByPlaceholder("搜索任务、业务场景或关联对象")
    .fill("核验灵巧手");
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "核验灵巧手团队负责人" }),
  ).toBeVisible();

  await page.goto("#/tasks");
  await expect(page).toHaveURL(/#\/tasks$/);
});

test("统一任务列表支持分类、搜索、详情和删除", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/tasks");
  await expect(
    page.locator(".s2-page-heading").getByRole("button", {
      name: "新建任务",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.locator(".s1-topbar").getByRole("button", {
      name: "新建任务",
      exact: true,
    }),
  ).toHaveCount(1);
  await page.getByRole("tab", { name: /人才摸排/ }).click();
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "核验灵巧手团队负责人" }),
  ).toBeVisible();
  await page
    .getByPlaceholder("搜索任务、业务场景或关联对象")
    .fill("核验灵巧手");
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "核验灵巧手团队负责人" }),
  ).toBeVisible();
  const deleteButton = page.getByLabel("删除 核验灵巧手团队负责人");
  await expect(deleteButton).toHaveClass(/s1-table-delete-button/);
  await expect(deleteButton).toHaveCSS("color", "rgb(196, 43, 51)");
  await page.getByRole("button", { name: "切换深色模式" }).click();
  await expect(deleteButton).toHaveCSS("color", "rgb(185, 87, 95)");
  await page.getByRole("button", { name: "切换亮色模式" }).click();
  await deleteButton.click();
  await expect(page.getByRole("heading", { name: "删除任务" })).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await page.getByRole("tab", { name: /全部/ }).click();
  await page.getByPlaceholder("搜索任务、业务场景或关联对象").fill("");
  await page.getByRole("button", { name: "状态", exact: true }).click();
  await page.getByRole("button", { name: "等待用户", exact: true }).click();
  await expect(page.locator(".s2-task-row")).toHaveCount(2);
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "核验灵巧手团队负责人" }),
  ).toBeVisible();
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "星澜机器人招聘合作" }),
  ).toBeVisible();
  const search = page.getByPlaceholder("搜索任务、业务场景或关联对象");
  await search.focus();
  await expect(search).toHaveCSS("box-shadow", "none");
  await expect(page.locator(".s1-search-field").last()).not.toHaveCSS(
    "box-shadow",
    "none",
  );
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("有限范围任务详情支持补充资料、恢复和结果回流", async ({ page }) => {
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

test("统一新建入口可进入有限范围任务或直接完成", async ({ page }) => {
  await page.goto("#/new");
  const input = page.getByPlaceholder(/例如：为星澜机器人/);
  await input.fill("核验知识图谱中的两位周明远是不是同一个人");
  await input.press("Enter");
  await expect(page.getByText(/范围有限、交付明确的核验任务/)).toBeVisible();
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

test("新建任务和有限范围任务的普通回复统一由动态 Markdown 渲染", async ({
  page,
}) => {
  const routes = [
    ["#/new?state=direct", "面试反馈摘要"],
    ["#/new?state=mainline", "持续汇总系统候选人"],
    ["#/new?state=task", "范围有限、交付明确的核验任务"],
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

test("信号中心支持合并来源、观察和转化", async ({ page }) => {
  await page.goto("#/signals");
  await expect(
    page.getByRole("heading", { name: /云脉芯能正在组建机器人芯片团队/ }),
  ).toBeVisible();
  await expect(page.getByText("4 个来源 · 今天 09:12")).toBeVisible();
  const listBox = await page.locator(".s2-signal-list-pane").boundingBox();
  const detailBox = await page.locator(".s2-signal-detail").boundingBox();
  expect(listBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(detailBox.width).toBeGreaterThan(listBox.width * 1.35);
  const nextSignal = page
    .locator(".s2-signal-feed > button")
    .filter({ hasText: "拓界智驾新增感知与规划团队招聘页面" });
  await nextSignal.click();
  await expect(nextSignal).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", {
      name: "拓界智驾新增感知与规划团队招聘页面",
    }),
  ).toBeVisible();
  await page
    .locator(".s2-signal-feed > button")
    .filter({ hasText: "云脉芯能正在组建机器人芯片团队" })
    .click();
  await page.getByRole("button", { name: "加入观察" }).click();
  await expect(page.getByText(/信号已加入观察/)).toBeVisible();
  await page.getByRole("button", { name: "转化或启动任务" }).click();
  await expect(page.getByRole("heading", { name: "转化信号" })).toBeVisible();
  await page.getByRole("radio", { name: /启动新任务/ }).click();
  await page.getByRole("button", { name: "继续" }).click();
  await expect(page).toHaveURL(/#\/new$/);
  await expect(page.locator(".s2-composer textarea")).toHaveValue(
    /云脉芯能正在组建机器人芯片团队/,
  );
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
  await page.getByRole("button", { name: "返回信号列表" }).click();
  await expect(page.getByPlaceholder("搜索公司、人物或信号内容")).toBeVisible();
});
