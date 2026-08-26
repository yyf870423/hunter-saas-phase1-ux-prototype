import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("#/home");
  await expect(
    page.getByRole("heading", { name: "上午好，沈岚" }),
  ).toBeVisible();
});

test("导航展开状态被记忆", async ({ page }) => {
  const sidebar = page.locator(".s1-sidebar");
  const toggle = page.getByRole("button", { name: "展开导航" });
  const collapsedSidebarBox = await sidebar.boundingBox();
  const collapsedToggleBox = await toggle.boundingBox();
  expect(collapsedToggleBox.y).toBeGreaterThan(collapsedSidebarBox.height / 2);
  expect(collapsedToggleBox.x).toBeGreaterThanOrEqual(collapsedSidebarBox.x);
  expect(collapsedToggleBox.x + collapsedToggleBox.width).toBeLessThanOrEqual(
    collapsedSidebarBox.x + collapsedSidebarBox.width,
  );

  await toggle.click();
  await expect(page.locator(".s1-app")).toHaveClass(/nav-expanded/);
  await page.reload();
  await expect(page.locator(".s1-app")).toHaveClass(/nav-expanded/);
  await page.getByRole("button", { name: "收起导航" }).click();
  await expect(page.locator(".s1-app")).toHaveClass(/nav-collapsed/);
});

test("常见桌面高度下导航无需滚动", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 768 });
  await page.getByRole("button", { name: "展开导航" }).click();
  const navigation = page.locator(".s1-sidebar-scroll");
  const dimensions = await navigation.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight);
  await page.getByRole("button", { name: "打开业务资产" }).click();
  await expect(
    page.getByRole("dialog", { name: "业务资产导航" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "专利" })).toBeInViewport();
  await expect(page.getByRole("button", { name: "收起导航" })).toBeInViewport();
});

test("业务资产使用侧向面板并可直接选择", async ({ page }) => {
  await page.getByRole("button", { name: "打开业务资产" }).click();
  const panel = page.getByRole("dialog", { name: "业务资产导航" });
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "候选人" }).click();
  await expect(panel).toBeHidden();
  await expect(page).toHaveURL(/#\/candidates$/);
  await expect(page.getByRole("heading", { name: "候选人" })).toBeVisible();
});

test("通知计数使用正圆标记", async ({ page }) => {
  const badge = page.getByRole("button", { name: "打开通知" }).locator("em");
  const box = await badge.boundingBox();
  expect(box.width).toBe(box.height);
  await expect(badge).toHaveCSS("border-radius", "50%");
});

test("全局搜索支持结果、详情和无结果", async ({ page }) => {
  await page.getByRole("button", { name: /搜索工作/ }).click();
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
  const topbar = page.locator(".s1-topbar");
  await expect(
    topbar.getByRole("button", { name: "导入数据", exact: true }),
  ).toHaveCount(0);
  const dataManagementButton = page.getByRole("button", {
    name: "打开数据管理",
  });
  await expect(
    dataManagementButton.locator('[data-icon="download"]'),
  ).toBeVisible();
  await dataManagementButton.click();
  await expect(page).toHaveURL(/#\/data\/imports$/);
  await expect(page.getByRole("heading", { name: "数据导入" })).toBeVisible();
  await page.goto("#/home");
  await topbar.getByRole("button", { name: "新建工作", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /手动新建资产/ }),
  ).toBeVisible();
  await page.getByLabel(/查看 Agent 用量/).click();
  await expect(
    page.getByRole("heading", { name: "本月 Agent 用量" }),
  ).toBeVisible();
  await page
    .locator(".s1-modal > footer")
    .getByRole("button", { name: "关闭" })
    .click();
  await expect(
    page.getByRole("button", { name: "设置", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "打开用户菜单" }).click();
  const accountMenu = page.getByRole("menu", { name: "用户菜单" });
  await expect(accountMenu).toBeVisible();
  await expect(
    accountMenu.getByRole("menuitem", { name: /设置/ }),
  ).toBeVisible();
  await accountMenu.getByRole("menuitem", { name: /设置/ }).click();
  await expect(page).toHaveURL(/#\/settings\/profile$/);
  await expect(
    page.getByRole("heading", { name: "个人资料", exact: true }).last(),
  ).toBeVisible();
  await expect(accountMenu).toBeHidden();

  await page.getByRole("button", { name: "打开用户菜单" }).click();
  await page.keyboard.press("Escape");
  await expect(accountMenu).toBeHidden();
});

test("桌面页面没有横向溢出或控制台错误", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});
