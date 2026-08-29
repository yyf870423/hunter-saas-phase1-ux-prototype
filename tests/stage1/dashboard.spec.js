import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("#/home");
});

test("主线焦点可切换且布局保持稳定", async ({ page }) => {
  const focus = page.locator(".s1-mainline-focus");
  const before = await focus.boundingBox();
  await page.getByRole("button", { name: /具身智能 VLA 算法负责人/ }).click();
  await expect(page.locator(".s1-mainline-primary h3")).toHaveText(
    "具身智能 VLA 算法负责人",
  );
  const after = await focus.boundingBox();
  expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(1);
});

test("行动队列默认收起并可展开", async ({ page }) => {
  const summary = page.getByRole("button", { name: /行动队列/ });
  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await summary.click();
  await expect(summary).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("button", { name: /确认星澜机器人优先联系人/ }),
  ).toBeVisible();
  await summary.click();
  await expect(page.locator(".s1-action-list")).toHaveCount(0);
});

test("重点任务入口进入任务详情", async ({ page }) => {
  await page.getByRole("button", { name: /具身智能 VLA 算法负责人/ }).click();
  await page.getByRole("button", { name: "继续任务" }).click();
  await expect(page).toHaveURL(/#\/tasks\/position-vla$/);
  await expect(
    page.getByRole("heading", { name: "具身智能 VLA 算法负责人" }),
  ).toBeVisible();
});
