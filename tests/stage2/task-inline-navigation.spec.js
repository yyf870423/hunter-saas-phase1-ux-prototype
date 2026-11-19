import { expect, test } from "@playwright/test";
import { trackConsoleErrors } from "../stage1/helpers";

for (const initialTask of ["position-vla?state=review", "candidate-research-demo"]) {
  for (const mode of ["expanded", "collapsed", "mobile"]) {
    test(`${initialTask} ${mode} 任务列表同页切换，手机关闭抽屉`, async ({ page, context }, testInfo) => {
      const noErrors = trackConsoleErrors(page);
      const popups = [];
      page.on("popup", popup => popups.push(popup));
      await page.setViewportSize({ width: mode === "mobile" ? 390 : 1440, height: 1000 });
      await page.goto(`#/tasks/${initialTask}`);
      let history = page.locator(".s2-research-history-rail > .s2-history");
      if (mode === "collapsed") await page.getByRole("button", { name: "收起任务历史", exact: true }).click();
      if (mode === "mobile") {
        await page.getByRole("button", { name: "打开任务列表", exact: true }).click();
        history = page.getByRole("dialog", { name: "任务列表", exact: true });
      }
      const pagesBefore = context.pages().length;
      const startingUrl = page.url();
      await page.screenshot({ path: testInfo.outputPath("before.png") });
      let targetTitle;
      if (mode === "collapsed") {
        const target = history.locator(".s2-history-collapsed-items button:not(.is-active)").first();
        targetTitle = await target.getAttribute("aria-label");
        await target.click();
      } else {
        await history.getByPlaceholder("搜索任务").fill("职业机会");
        await history.locator('[data-task-id="career-linhao"] .s2-history-item').click();
      }
      await expect(page).not.toHaveURL(startingUrl);
      await expect(page).toHaveURL(/#\/tasks\/[^/?]+$/);
      await expect(page.locator(".s2-workstream-header h1")).toBeVisible();
      if (targetTitle) await expect(page.locator(".s2-workstream-header h1")).toHaveText(targetTitle);
      await expect(page.getByRole("dialog", { name: "任务列表", exact: true })).toHaveCount(0);
      expect(popups).toHaveLength(0);
      expect(context.pages()).toHaveLength(pagesBefore);
      await page.screenshot({ path: testInfo.outputPath("after.png") });
      await noErrors();
    });
  }
}
