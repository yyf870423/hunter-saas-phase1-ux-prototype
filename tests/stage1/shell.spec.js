import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("#/home");
  await expect(
    page.getByRole("heading", { name: "上午好，沈岚" }),
  ).toBeVisible();
});

test("导航展开状态被记忆", async ({ page }) => {
  await page.getByRole("button", { name: "展开导航" }).click();
  await expect(page.locator(".s1-app")).toHaveClass(/nav-expanded/);
  await page.reload();
  await expect(page.locator(".s1-app")).toHaveClass(/nav-expanded/);
  await page.getByRole("button", { name: "收起导航" }).click();
  await expect(page.locator(".s1-app")).toHaveClass(/nav-collapsed/);
});

test("全局搜索支持结果、详情和无结果", async ({ page }) => {
  await page.getByRole("button", { name: /搜索主线/ }).click();
  const input = page.getByPlaceholder("输入姓名、公司、岗位或任务名称");
  await input.fill("星澜机器人");
  await expect(
    page.getByRole("button", { name: /星澜机器人招聘合作/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /星澜机器人招聘合作/ }).click();
  await expect(
    page
      .getByRole("dialog", { name: "搜索结果摘要" })
      .getByRole("heading", { name: "星澜机器人招聘合作" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /返回搜索结果/ }).click();
  await input.fill("不存在的业务对象");
  await expect(page.getByText("没有找到“不存在的业务对象”")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("通知支持未读筛选和全部已读", async ({ page }) => {
  await page.getByRole("button", { name: "打开通知" }).click();
  await page.getByRole("tab", { name: /未读/ }).click();
  await expect(page.locator(".s1-notification-list > button")).toHaveCount(3);
  await page.getByRole("button", { name: "全部已读" }).click();
  await expect(page.getByText("没有未读通知")).toBeVisible();
  await page.keyboard.press("Escape");
});

test("主题切换即时生效并记忆", async ({ page }) => {
  await page.getByRole("button", { name: "切换深色模式" }).click();
  await expect(page.locator(".s1-app")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator(".s1-app")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "切换亮色模式" }).click();
});

test("新建菜单、用量和账号入口有反馈", async ({ page }) => {
  await page.getByRole("button", { name: "新建", exact: true }).click();
  await page.getByRole("button", { name: /导入数据/ }).click();
  await expect(page.getByText("已选择“导入数据”入口")).toBeVisible();
  await page.getByLabel(/查看 Agent 用量/).click();
  await expect(
    page.getByRole("heading", { name: "本月 Agent 用量" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "知道了" }).click();
  await page.locator(".s1-profile-entry").click();
  await expect(page.getByRole("button", { name: "账号设置" })).toBeVisible();
});

test("桌面页面没有横向溢出或控制台错误", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});
