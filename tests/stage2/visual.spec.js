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

async function waitForCandidateReview(page) {
  await expect(page.getByText("云端检索已开始")).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText("首批候选人已经可以审核")).toBeVisible({
    timeout: 10_000,
  });
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "ipad", width: 820, height: 1180 },
  { name: "iphone", width: 390, height: 844 },
]) {
  test(`截取 ${viewport.name} 任务`, async ({ page }) => {
    const assertNoConsoleErrors = trackConsoleErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("#/tasks/position-vla");
    await waitForCandidateReview(page);
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

test("截取候选人审核、任务运行和信号中心", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/tasks/position-vla");
  await waitForCandidateReview(page);
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
  await page.goto("#/tasks/task-recommend-linhao");
  await page
    .locator(".recommendation-report-file")
    .last()
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `${output}/desktop-recommendation-report-task.png`,
    fullPage: true,
  });
  await page
    .locator(".recommendation-report-file")
    .last()
    .getByRole("button", { name: "在线查看" })
    .click();
  await page.screenshot({
    path: `${output}/desktop-recommendation-report-preview-md.png`,
    fullPage: true,
  });
  const preview = page.getByRole("complementary", { name: "文件预览" });
  await preview.locator(".s2-artifact-file-switch > button").click();
  await preview.getByRole("option", { name: /匹配证据\.xlsx/ }).click();
  await page.screenshot({
    path: `${output}/desktop-recommendation-report-preview-xlsx.png`,
    fullPage: true,
  });
  await preview.getByRole("button", { name: "关闭文件预览" }).click();
  await page
    .locator(".s2-composer textarea")
    .fill("请突出量产交付经验，并把薪资风险放到最后。");
  await page.getByRole("button", { name: "发送" }).click();
  await page
    .locator(".recommendation-report-file")
    .last()
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `${output}/desktop-recommendation-report-revisions.png`,
    fullPage: true,
  });
  await page.goto("#/signals");
  await page.screenshot({
    path: `${output}/desktop-signals.png`,
    fullPage: true,
  });
});

test("截取统一新建任务及关键状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [state, filename] of [
    ["", "desktop-new-work.png"],
    ["?state=clarify", "desktop-new-work-clarify.png"],
    ["?state=direct", "desktop-new-work-direct.png"],
    ["?state=limited", "desktop-new-work-limited.png"],
  ]) {
    await page.goto(`#/new${state}`);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/${filename}`,
      fullPage: true,
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/new?state=clarify");
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/iphone-new-work-clarify.png`,
    fullPage: true,
  });
});

test("截取阶段二异常状态和移动端详情", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/tasks/position-vla?state=stream-error");
  await page.screenshot({
    path: `${output}/desktop-stream-error.png`,
    fullPage: true,
  });
  await page.goto("#/tasks/position-vla?state=limited");
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

test("截取简历上传批次和身份合并状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [state, marker, filename] of [
    ["resume-batch", "VLA 候选人简历（12 份）.zip", "desktop-resume-batch.png"],
    [
      "merge-conflict",
      "林昊的资料存在冲突，确认后才能合并",
      "desktop-merge-conflict.png",
    ],
  ]) {
    await page.goto(`#/tasks/position-vla?state=${state}`);
    const stateMarker = page.getByText(marker);
    await expect(stateMarker).toBeVisible({ timeout: 10_000 });
    await stateMarker.scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/${filename}`,
      fullPage: true,
      animations: "disabled",
    });
  }
});
