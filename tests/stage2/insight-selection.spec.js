import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("#/signals?signal=signal-xinglan");
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("星澜机器人 VLA 团队扩招");
});

test("search preserves the current selection when it still matches", async ({ page }) => {
  await page.getByPlaceholder("搜索公司、人物或洞察").fill("机器人");
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("星澜机器人 VLA 团队扩招");
  await expect(page.locator(".s2-signal-feed .is-active")).toContainText("星澜机器人 VLA 团队扩招");
});

test("search fallback becomes the current selection when the query is cleared", async ({ page }) => {
  await page.getByPlaceholder("搜索公司、人物或洞察").fill("云脉");
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("云脉芯能正在组建机器人芯片团队");
  await page.getByPlaceholder("搜索公司、人物或洞察").fill("");
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("云脉芯能正在组建机器人芯片团队");
});

test("filter fallback remains selected after switching back to all", async ({ page }) => {
  await page.getByRole("tab", { name: /已忽略/ }).click();
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("周明远近期连续转发具身智能招聘内容");
  await page.getByRole("tab", { name: /全部/ }).click();
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("周明远近期连续转发具身智能招聘内容");
});

test("no results clear the old detail and clearing selects the first visible insight", async ({ page }, testInfo) => {
  await page.getByPlaceholder("搜索公司、人物或洞察").fill("不存在的筛选回归项");
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(0);
  await expect(page.locator(".s2-signal-detail .s1-empty-state")).toBeVisible();
  await expect(page.locator(".s2-signal-detail > footer")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("empty.png") });
  await page.getByRole("button", { name: "清空条件" }).click();
  const first = page.locator(".s2-signal-feed > button").first();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("陈雨来信：星澜机器人想再加 2 个数据平台岗位");
});

test("an open-filter status change cannot leave an excluded detail behind", async ({ page }) => {
  await page.getByRole("tab", { name: /只看未处理/ }).click();
  await page.getByPlaceholder("搜索公司、人物或洞察").fill("云脉");
  await page.locator(".s2-signal-detail > footer").getByRole("button", { name: "忽略", exact: true }).click();
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(0);
  await expect(page.locator(".s2-signal-detail .s1-empty-state")).toBeVisible();
  await page.getByRole("tab", { name: /全部/ }).click();
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("云脉芯能正在组建机器人芯片团队");
  await expect(page.getByRole("button", { name: "取消忽略" })).toBeVisible();
});

test("a new valid deep link still selects its requested insight", async ({ page }) => {
  await page.getByRole("tab", { name: /已忽略/ }).click();
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("周明远近期连续转发具身智能招聘内容");
  await page.goto("#/signals?signal=signal-cloudchip");
  await expect(page.getByRole("tab", { name: /全部/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("云脉芯能正在组建机器人芯片团队");
});
