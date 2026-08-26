import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test.use({ viewport: { width: 390, height: 844 } });

test("iPhone 使用底部导航并打开资产抽屉", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/home");
  await expect(page.locator(".s1-sidebar")).toBeHidden();
  await expect(page.locator(".s1-mobile-tabs")).toBeVisible();
  await page.getByRole("button", { name: "业务资产" }).click();
  await expect(page.getByRole("heading", { name: "业务资产" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "公司", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("iPhone 搜索、通知和重点工作切换可用", async ({ page }) => {
  await page.goto("#/home");
  await page.locator(".s1-search-trigger").click();
  await expect(
    page.getByPlaceholder("输入姓名、公司、岗位或任务名称"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "打开通知" }).click();
  await expect(page.getByRole("heading", { name: "通知" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /具身智能 VLA 算法负责人/ }).click();
  await expect(page.locator(".s1-mainline-primary h3")).toHaveText(
    "具身智能 VLA 算法负责人",
  );
});

test("iPhone 空状态和权限状态可读", async ({ page }) => {
  await page.goto("#/home?state=empty");
  await expect(page.getByRole("heading", { name: "还没有工作" })).toBeVisible();
  await page.goto("#/home?state=limited");
  await expect(page.getByText("本机协作暂不可用")).toBeVisible();
});
