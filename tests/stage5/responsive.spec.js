import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "ipad", width: 1024, height: 1366 },
  { name: "iphone", width: 390, height: 844 },
];

const routes = [
  ["profile", "个人资料"],
  ["notifications", "通知"],
  ["automation", "自动化授权"],
  ["connections", "连接"],
  ["subscription", "订阅与用量"],
  ["data-privacy", "数据与隐私"],
];

for (const viewport of viewports) {
  test(`${viewport.name} 设置中心主要页面无横向溢出`, async ({ page }) => {
    const assertNoConsoleErrors = trackConsoleErrors(page);
    await page.setViewportSize(viewport);
    for (const [route, title] of routes) {
      await page.goto(`#/settings/${route}`);
      await expect(
        page.getByRole("heading", { name: title, exact: true }).last(),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
    await assertNoConsoleErrors();
  });
}

test("设置中心生成桌面、平板和手机验收截图", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of [
      "profile",
      "notifications",
      "automation",
      "connections",
      "subscription",
      "data-privacy",
    ]) {
      await page.goto(`#/settings/${route}`);
      await page.screenshot({
        path: `artifacts/stage5-${route}-${viewport.name}.png`,
        fullPage: true,
      });
    }
  }
});

test("设置中心关键 Modal 生成验收截图", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/settings/automation");
  await page.getByRole("button", { name: "修改" }).first().click();
  await page.getByRole("radio", { name: /自动执行/ }).click();
  await page.screenshot({
    path: "artifacts/stage5-automation-modal.png",
    fullPage: true,
  });

  await page.goto("#/settings/connections?state=empty");
  await page.getByRole("button", { name: "连接邮箱" }).click();
  await page.screenshot({
    path: "artifacts/stage5-email-connect.png",
    fullPage: true,
  });

  await page.goto("#/settings/data-privacy");
  await page.getByRole("button", { name: "删除工作空间" }).click();
  await page.screenshot({
    path: "artifacts/stage5-delete-workspace.png",
    fullPage: true,
  });
});
