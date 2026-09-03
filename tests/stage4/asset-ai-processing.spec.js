import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const output = "artifacts/stage4-asset-ai-processing";

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

test("岗位 AI 解析依附岗位运行，不创建任务", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/positions/position-vla?tab=profile");

  await page.getByRole("button", { name: "AI 解析", exact: true }).click();
  const setup = page.getByRole("dialog", { name: "AI 解析当前岗位" });
  await expect(setup).toBeVisible();
  await expect(setup).toContainText("不会新增任务");
  await expect(setup).toContainText("具身智能 VLA 算法负责人");
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/setup-desktop.png`,
    fullPage: true,
  });

  await setup.getByRole("button", { name: "开始解析" }).click();
  await expect(page).toHaveURL(/ai=running/);
  await expect(page.getByLabel("岗位 AI 解析，运行中")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /岗位 AI 解析.*运行中/ }),
  ).toHaveCount(0);
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/running-desktop.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: "查看处理详情" }).click();
  const detail = page.getByRole("dialog", { name: "AI 处理详情" });
  await expect(detail).toContainText("处理对象");
  await expect(detail.getByText("关联任务", { exact: true })).toHaveCount(0);
  await expect(detail).toContainText("执行计划");
  await expect(detail).toContainText("运行记录");
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/running-detail.png`,
    fullPage: true,
  });

  await assertNoConsoleErrors();
});

test("待审核、失败重试和处理历史均有独立状态", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("#/positions/position-vla?tab=profile&ai=review");
  await expect(page.getByLabel("岗位 AI 解析，等待审核")).toBeVisible();
  await page.getByRole("button", { name: "审核解析结果" }).click();
  const review = page.getByRole("region", { name: "审核岗位解析结果" });
  await expect(review).toContainText("当前内容");
  await expect(review).toContainText("AI 建议");
  await expect(review.getByRole("checkbox")).toHaveCount(6);
  await expect(
    review.getByRole("navigation", { name: "待审核字段" }),
  ).toBeVisible();
  await review.getByRole("button", { name: /软性与隐性要求/ }).click();
  await expect(
    review.getByRole("heading", { name: "软性与隐性要求" }),
  ).toBeVisible();
  await expect(review).toContainText("模型效果、硬件约束和客户交付时间");
  await expect(review).toContainText(
    "单纯写“跨团队协作”不足以支持后续匹配判断",
  );
  await review.getByRole("button", { name: /招聘难度与找人建议/ }).click();
  await expect(review).toContainText("高难度（8.4 / 10）");
  await expect(review).toContainText("单一渠道很难覆盖");
  await review.getByRole("button", { name: /建议挖猎的公司/ }).click();
  await expect(review).toContainText("优先关注灵跃科技");
  await expect(review).toContainText("组织调整、员工持股解禁");
  await review.getByRole("button", { name: /软性与隐性要求/ }).click();
  await review
    .locator(".s4-ai-review-fields article.is-active")
    .getByRole("checkbox")
    .click();
  await expect(
    review.getByRole("button", { name: /应用所选 4 项/ }),
  ).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/review-desktop.png`,
    fullPage: true,
  });
  await review.getByRole("button", { name: /应用所选 4 项/ }).click();
  await expect(page).toHaveURL(/ai=complete/);
  await expect(page.getByText("岗位资料更新为 v4")).toBeVisible();

  await page.goto("#/positions/position-vla?tab=profile&ai=failed");
  await expect(page.getByLabel("岗位 AI 解析，处理失败")).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/failed-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "重新运行" }).click();
  await expect(page).toHaveURL(/ai=running/);

  await page.goto("#/positions/position-vla?tab=work&ai=review");
  await expect(page.getByRole("heading", { name: "关联任务" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "AI 处理记录" }),
  ).toBeVisible();
  await expect(page.getByText("不创建独立任务")).toBeVisible();
  await expect(page.getByText("重新解析具身智能 VLA 算法负责人")).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/history-desktop.png`,
    fullPage: true,
  });

  await page.goto("#/tasks");
  await expect(page.getByText("岗位 AI 解析", { exact: true })).toHaveCount(0);
  await expect(page.getByText("重新解析具身智能 VLA 算法负责人")).toHaveCount(
    0,
  );
  await assertNoConsoleErrors();
});

test("手机和平板端处理状态、审核与详情无横向溢出", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });

  for (const url of [
    "#/positions/position-vla?tab=profile&ai=setup",
    "#/positions/position-vla?tab=profile&ai=running",
    "#/positions/position-vla?tab=profile&ai=review&panel=review",
    "#/positions/position-vla?tab=profile&ai=failed&panel=details&process=position-analysis-v4",
  ]) {
    await page.goto(url);
    await expectNoHorizontalOverflow(page);
  }

  await page.goto(
    "#/positions/position-vla?tab=profile&ai=review&panel=review",
  );
  const review = page.getByRole("region", { name: "审核岗位解析结果" });
  await review.getByRole("tab", { name: "当前内容" }).click();
  await expect(review.getByText("兼顾团队管理与真机项目交付")).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/review-mobile.png`,
    fullPage: true,
  });

  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto(
    "#/positions/position-vla?tab=profile&ai=review&panel=review",
  );
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("tab", { name: "AI 建议" })).toBeVisible();
  await page.screenshot({
    path: `${output}/review-tablet.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});

test("候选人信息补全在候选人详情内完成运行和字段审核", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/candidates/candidate-linhao?tab=profile");

  await page.getByRole("button", { name: "信息补全", exact: true }).click();
  const setup = page.getByRole("dialog", { name: "补全当前候选人资料" });
  await expect(setup).toContainText("不会新增任务");
  await expect(setup).toContainText("候选人资料 v6");
  await setup.getByRole("button", { name: "开始补全" }).click();
  await expect(page).toHaveURL(/ai=running/);
  await expect(page.getByLabel("候选人信息补全，运行中")).toBeVisible();

  await page.goto(
    "#/candidates/candidate-linhao?tab=profile&ai=review&panel=review",
  );
  const review = page.getByRole("region", { name: "审核候选人补全结果" });
  await expect(review.getByRole("checkbox")).toHaveCount(6);
  await expect(review).toContainText("当前简历 · LinkedIn 公开资料");
  await review.getByRole("button", { name: /论文与专利/ }).click();
  await expect(review).toContainText("存在同名作者可能");
  await page.screenshot({
    path: `${output}/candidate-review-desktop.png`,
    fullPage: true,
  });
  await review.getByRole("button", { name: /确认所选 5 项/ }).click();
  await expect(page.getByText("候选人资料更新为 v7")).toBeVisible();

  await page.goto("#/candidates/candidate-linhao?tab=relations&ai=review");
  await expect(
    page.getByRole("heading", { name: "AI 处理记录" }),
  ).toBeVisible();
  await expect(page.getByText("补全林昊的候选人资料")).toBeVisible();
  await assertNoConsoleErrors();
});

test("已有公司调研留在公司详情并共享同一套审核交互", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/companies/company-xinglan?tab=profile");

  await page.getByRole("button", { name: "更新调研" }).click();
  const setup = page.getByRole("dialog", { name: "更新当前公司调研" });
  await expect(setup).toContainText("不会新增任务");
  await expect(setup).toContainText("星澜机器人");
  await setup.getByRole("button", { name: "开始调研" }).click();
  await expect(page).toHaveURL(/ai=running/);
  await expect(page.getByLabel("公司调研更新，运行中")).toBeVisible();

  await page.goto(
    "#/companies/company-xinglan?tab=profile&ai=review&panel=review",
  );
  const review = page.getByRole("region", { name: "审核公司调研结果" });
  await expect(review.getByRole("checkbox")).toHaveCount(6);
  await review.getByRole("button", { name: /融资、上市与市值/ }).click();
  await expect(review).toContainText("未找到公司或投资方披露的估值");
  await page.screenshot({
    path: `${output}/company-review-desktop.png`,
    fullPage: true,
  });
  await review.getByRole("button", { name: /确认所选 5 项/ }).click();
  await expect(page.getByText("公司资料更新为 v4")).toBeVisible();

  await page.goto("#/companies/company-xinglan?tab=work&ai=review");
  await expect(
    page.getByRole("heading", { name: "AI 处理记录" }),
  ).toBeVisible();
  await expect(page.getByText("更新星澜机器人公司资料")).toBeVisible();
  await assertNoConsoleErrors();
});

test("候选人和公司 AI 审核在手机端无横向溢出", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of [
    "#/candidates/candidate-linhao?tab=profile&ai=setup",
    "#/candidates/candidate-linhao?tab=profile&ai=review&panel=review",
    "#/companies/company-xinglan?tab=profile&ai=setup",
    "#/companies/company-xinglan?tab=profile&ai=review&panel=review",
  ]) {
    await page.goto(url);
    await expectNoHorizontalOverflow(page);
  }
  await assertNoConsoleErrors();
});
