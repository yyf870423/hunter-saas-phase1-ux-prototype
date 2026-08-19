import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const output = "artifacts/stage2";

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "ipad", width: 820, height: 1180 },
  { name: "iphone", width: 390, height: 844 },
]) {
  test(`截取 ${viewport.name} 业务主线`, async ({ page }) => {
    const assertNoConsoleErrors = trackConsoleErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("#/workstreams/position-vla");
    await expect(page.getByText("首批候选人已经可以审核")).toBeVisible({
      timeout: 10_000,
    });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/${viewport.name}-workstream.png`,
      fullPage: true,
    });
    await assertNoConsoleErrors();
  });
}

test("截取候选人审核、支线任务和信号中心", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/workstreams/position-vla");
  await expect(page.getByText("首批候选人已经可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: /执行计划/ }).click();
  await page.screenshot({
    path: `${output}/desktop-workstream-plan.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: /执行计划/ }).click();
  await page.getByRole("button", { name: /打开候选人审核/ }).click();
  await page.screenshot({
    path: `${output}/desktop-candidate-review.png`,
    fullPage: true,
  });
  await page.goto("#/tasks");
  await page.screenshot({
    path: `${output}/desktop-side-tasks.png`,
    fullPage: true,
  });
  await page.goto("#/tasks/task-hand-team");
  await page.getByRole("button", { name: /执行计划/ }).click();
  await page.screenshot({
    path: `${output}/desktop-side-task-plan.png`,
    fullPage: true,
  });
  await page.goto("#/signals");
  await page.screenshot({
    path: `${output}/desktop-signals.png`,
    fullPage: true,
  });
});

test("截取阶段二异常状态和移动端详情", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/workstreams/position-vla?state=stream-error");
  await page.screenshot({
    path: `${output}/desktop-stream-error.png`,
    fullPage: true,
  });
  await page.goto("#/workstreams/position-vla?state=limited");
  await page.screenshot({
    path: `${output}/desktop-permission-limited.png`,
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/signals");
  await page.locator(".s2-signal-feed > button").first().click();
  await page.screenshot({
    path: `${output}/iphone-signal-detail.png`,
    fullPage: true,
  });
});
