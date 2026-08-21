import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("支线任务列表支持分类、搜索、详情和删除", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/tasks");
  await page.getByRole("tab", { name: /等待处理/ }).click();
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "核验灵巧手团队负责人" }),
  ).toBeVisible();
  await page.getByPlaceholder("搜索任务、类型或关联对象").fill("赵星羽");
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "消歧赵星羽" }),
  ).toBeVisible();
  await page.getByLabel("删除 消歧赵星羽的论文与任职身份").click();
  await expect(
    page.getByRole("heading", { name: "删除支线任务" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("支线任务详情支持补充资料、恢复和结果回流", async ({ page }) => {
  await page.goto("#/tasks/task-hand-team");
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
    page.getByText(/已回流“星澜机器人人才版图”的更新与审核区/),
  ).toBeVisible();
  await expect(page.getByText("完成", { exact: true }).first()).toBeVisible();
  await expect(
    page.locator(".s2-task-plan .s2-plan-list li.is-complete"),
  ).toHaveCount(3);
  await expect(page.getByText("计划已完成", { exact: true })).toBeVisible();
});

test("推荐报告任务按对话过程保留每次生成的文件", async ({ page }) => {
  await page.goto("#/tasks/task-recommend-linhao");
  await expect(page.getByText(/推荐报告-v1\.md/)).toBeVisible();
  await expect(page.getByText(/推荐报告-v2\.md/)).toBeVisible();
  await expect(page.getByRole("button", { name: "历史版本" })).toHaveCount(0);
  const v2File = page
    .locator(".recommendation-report-file")
    .filter({ hasText: /推荐报告-v2\.md/ });
  await v2File.getByRole("button", { name: "在线查看" }).click();
  const preview = page.getByRole("dialog", { name: "在线查看推荐报告" });
  await expect(preview.getByText("核心匹配证据")).toBeVisible();
  await preview
    .getByRole("button", { name: "关闭", exact: true })
    .first()
    .click();

  const downloadStarted = page.waitForEvent("download");
  await v2File.getByRole("button", { name: "下载", exact: true }).click();
  const download = await downloadStarted;
  expect(download.suggestedFilename()).toMatch(/推荐报告-v2\.md$/);

  await page
    .locator(".s2-composer textarea")
    .fill("请突出量产交付经验，并把薪资风险放到最后。");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText(/推荐报告-v3\.md/)).toBeVisible();
  await expect(page.locator(".recommendation-report-file")).toHaveCount(3);
});

test("统一新建入口可进入支线任务或直接完成", async ({ page }) => {
  await page.goto("#/new");
  const input = page.getByPlaceholder(/例如：为星澜机器人/);
  await input.fill("核验人才版图中的两位周明远是不是同一个人");
  await input.press("Enter");
  await expect(page.getByText(/我会创建独立支线任务/)).toBeVisible();
  await expect(page).toHaveURL(/#\/tasks\/task-hand-team$/, {
    timeout: 5_000,
  });
  await expect(page.getByText(/两位周明远是不是同一个人/)).toBeVisible();

  await page.goto("#/new");
  await input.fill("把这三条面试反馈整理为候选人跟进摘要");
  await input.press("Enter");
  await expect(
    page.getByRole("heading", { name: "候选人跟进摘要" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#\/new$/);
});

test("统一新建入口覆盖歧义、失败、权限受限和旧路由", async ({ page }) => {
  await page.goto("#/new?state=clarify");
  await expect(page.getByText(/还缺少一个会改变推进方式的信息/)).toBeVisible();
  await page.getByRole("button", { name: /只整理当前信息/ }).click();
  await expect(
    page.getByRole("heading", { name: "云脉芯能公开信息摘要" }),
  ).toBeVisible();

  await page.goto("#/new?state=error");
  await expect(page.getByText("暂时无法判断推进方式")).toBeVisible();
  await page.getByRole("button", { name: "重新判断" }).click();
  await expect(page.getByText(/我正在判断这项工作/)).toBeVisible();

  await page.goto("#/new?state=limited");
  await expect(page.getByText("当前工作空间不能创建新工作")).toBeVisible();
  await expect(page.locator(".s2-composer textarea")).toBeDisabled();

  await page.goto("#/workstreams/new");
  await expect(page).toHaveURL(/#\/new$/);
  await page.goto("#/tasks/new");
  await expect(page).toHaveURL(/#\/new$/);
});

test("新建工作和支线任务的普通回复统一由动态 Markdown 渲染", async ({
  page,
}) => {
  const routes = [
    ["#/new?state=direct", "候选人跟进摘要"],
    ["#/new?state=mainline", "建立一条岗位招聘业务主线"],
    ["#/new?state=task", "创建独立支线任务"],
    ["#/new?state=clarify", "还缺少一个会改变推进方式的信息"],
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
  await page.getByRole("button", { name: "转化或启动工作" }).click();
  await expect(page.getByRole("heading", { name: "转化信号" })).toBeVisible();
  await page.getByRole("radio", { name: /启动新工作/ }).click();
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
  await expect(
    page.getByRole("heading", { name: /陈松的公开任职信息发生变化/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回信号列表" }).click();
  await expect(page.getByPlaceholder("搜索公司、人物或信号内容")).toBeVisible();
});
