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

test("岗位 AI 解析依附岗位运行，不创建新工作", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/positions/position-vla?tab=profile");

  await page.getByRole("button", { name: "AI 解析", exact: true }).click();
  const setup = page.getByRole("dialog", { name: "AI 解析当前岗位" });
  await expect(setup).toBeVisible();
  await expect(setup).toContainText("不会新增工作");
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
  ).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/running-desktop.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: "查看处理详情" }).click();
  const detail = page.getByRole("dialog", { name: "AI 处理详情" });
  await expect(detail).toContainText("处理对象");
  await expect(detail).toContainText("所属目标级工作");
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
  const review = page.getByRole("dialog", { name: "审核岗位解析结果" });
  await expect(review).toContainText("当前内容");
  await expect(review).toContainText("AI 建议");
  await expect(review.getByRole("checkbox")).toHaveCount(4);
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/review-desktop.png`,
    fullPage: true,
  });
  await review.getByRole("button", { name: /应用所选 3 项/ }).click();
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
  await expect(page.getByRole("heading", { name: "相关工作" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "AI 处理记录" }),
  ).toBeVisible();
  await expect(page.getByText("不进入工作列表")).toBeVisible();
  await expect(page.getByText("重新解析具身智能 VLA 算法负责人")).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/history-desktop.png`,
    fullPage: true,
  });

  await page.goto("#/works");
  await expect(page.getByText("岗位 AI 解析", { exact: true })).toHaveCount(0);
  await expect(page.getByText("重新解析具身智能 VLA 算法负责人")).toHaveCount(
    0,
  );
  await assertNoConsoleErrors();
});

test("手机端处理状态、审核与详情无横向溢出", async ({ page }) => {
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
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/review-mobile.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});
