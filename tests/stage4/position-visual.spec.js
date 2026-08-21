import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const output = "artifacts/stage4-position";

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

test("岗位资料、流程、匹配与相关工作桌面视觉门禁", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const [tab, file] of [
    ["profile", "profile"],
    ["pipeline", "pipeline"],
    ["matching", "matching"],
    ["work", "related-work"],
  ]) {
    await page.goto(`#/positions/position-vla?tab=${tab}`);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${output}/${file}.png`, fullPage: true });
  }

  await page.goto("#/positions/position-vla?tab=pipeline");
  await page.getByText("赵星羽", { exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: /赵星羽 · 完整推进记录/ }),
  ).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/pipeline-candidate-record.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "关闭", exact: true }).click();

  await page.getByRole("button", { name: "配置阶段" }).click();
  await expect(
    page.getByRole("dialog", { name: "配置岗位推进阶段" }),
  ).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/pipeline-stage-config.png`,
    fullPage: true,
  });
  const movableStages = page
    .getByRole("dialog", { name: "配置岗位推进阶段" })
    .locator(".s4-stage-config article:not(.is-fixed)");
  await movableStages.first().evaluate((element) => {
    element.dispatchEvent(
      new DragEvent("dragstart", {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      }),
    );
  });
  await movableStages.nth(1).evaluate((element) => {
    element.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      }),
    );
  });
  await expect(movableStages.nth(1)).toHaveClass(/is-drop-target/);
  await page.waitForTimeout(180);
  await page.screenshot({
    path: `${output}/pipeline-stage-config-drag.png`,
    fullPage: true,
  });

  await page.goto("#/positions/position-vla?tab=profile");
  await page.getByRole("button", { name: "版本历史" }).click();
  await page
    .getByRole("dialog", { name: "岗位 JD 版本" })
    .getByRole("button", { name: /v2/ })
    .click();
  await page.waitForTimeout(160);
  await page.screenshot({
    path: `${output}/profile-jd-history.png`,
    fullPage: true,
  });

  await page.goto("#/positions/position-vla?tab=matching");
  await page.getByRole("button", { name: "在线查看" }).click();
  await page.waitForTimeout(160);
  await page.screenshot({
    path: `${output}/matching-report-preview.png`,
    fullPage: true,
  });
  await page
    .getByRole("dialog", { name: "在线查看推荐报告" })
    .getByRole("button", { name: "关闭", exact: true })
    .first()
    .click();
  await page.getByRole("tab", { name: /有条件匹配/ }).click();
  await page.screenshot({
    path: `${output}/matching-conditional.png`,
    fullPage: true,
  });
  await page.getByRole("tab", { name: /硬门槛拒绝/ }).click();
  await page.screenshot({
    path: `${output}/matching-rejected.png`,
    fullPage: true,
  });
  await page.getByRole("tab", { name: /未完成匹配/ }).click();
  await page.screenshot({
    path: `${output}/matching-pending.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "查看匹配过程" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/matching-run-process.png`,
    fullPage: true,
  });

  await assertNoConsoleErrors();
});

test("岗位核心工作区在平板和手机上保持可操作", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  for (const viewport of [
    { name: "ipad", width: 1024, height: 1366 },
    { name: "iphone", width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [tab, file] of [
      ["pipeline", "pipeline"],
      ["matching", "matching"],
      ["work", "related-work"],
    ]) {
      await page.goto(`#/positions/position-vla?tab=${tab}`);
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `${output}/${file}-${viewport.name}.png`,
        fullPage: true,
      });
    }
  }
  await assertNoConsoleErrors();
});
