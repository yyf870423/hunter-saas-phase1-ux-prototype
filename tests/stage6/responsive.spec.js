import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const routes = [
  ["overview", "运营概况"],
  ["users-workspaces", "用户与工作空间"],
  ["subscriptions", "订阅与额度"],
  ["tasks", "任务与故障"],
  ["tasks/TASK-260824-019", "TASK-260824-019"],
  ["capabilities", "系统能力"],
  ["support", "支持与审计"],
];

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "ipad", width: 1024, height: 1366 },
  { name: "iphone", width: 390, height: 844 },
]) {
  test(`${viewport.name} 运营端主要页面无横向溢出`, async ({ page }) => {
    const assertNoConsoleErrors = trackConsoleErrors(page);
    await page.setViewportSize(viewport);
    for (const [route, text] of routes) {
      await page.goto(`#/ops/${route}`);
      await expect(
        page.getByRole("heading", { name: text, exact: true }).last(),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
    await assertNoConsoleErrors();
  });
}

test("运营端关键页面生成桌面、平板和手机验收截图", async ({ page }) => {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "ipad", width: 1024, height: 1366 },
    { name: "iphone", width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [route, name] of [
      ["overview", "overview"],
      ["users-workspaces", "workspaces"],
      ["subscriptions", "subscriptions"],
      ["tasks", "tasks"],
      ["tasks/TASK-260824-019", "task-detail"],
      ["capabilities", "capabilities"],
    ]) {
      await page.goto(`#/ops/${route}`);
      await page.screenshot({
        path: `artifacts/stage6-${name}-${viewport.name}.png`,
        fullPage: true,
      });
    }
  }
});

test("运营端关键 Modal 和状态生成验收截图", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/ops/users-workspaces?tab=trials");
  await page
    .getByRole("button", { name: /宋知遥/ })
    .first()
    .click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/stage6-trial-approval.png",
    fullPage: true,
  });

  await page.goto("#/ops/tasks/TASK-260824-019");
  await page.getByRole("button", { name: "执行安全恢复" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/stage6-safe-recovery.png",
    fullPage: true,
  });

  await page.goto("#/ops/capabilities?tab=configuration");
  await page.screenshot({
    path: "artifacts/stage6-model-configuration.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "新增模型后端" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/stage6-model-backend-modal.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "取消" }).click();
  await page
    .getByRole("button", { name: /公开网络搜索/ })
    .first()
    .click();
  await page.getByRole("button", { name: "填入失败示例" }).click();
  await page.getByRole("button", { name: "运行验证" }).click();
  await expect(page.getByText("配置验证失败")).toBeVisible();
  await page.screenshot({
    path: "artifacts/stage6-config-validation-failed.png",
    fullPage: true,
  });

  await page.goto("#/ops/users-workspaces");
  await page
    .getByRole("button", { name: /深蓝猎头工作室/ })
    .first()
    .click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/stage6-workspace-health-drawer.png",
    fullPage: true,
  });

  await page.goto("#/ops/subscriptions");
  await page
    .getByRole("button", { name: /深蓝猎头工作室/ })
    .first()
    .click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/stage6-subscription-drawer.png",
    fullPage: true,
  });

  await page.goto("#/ops/support");
  await page
    .getByRole("button", { name: /SUP-20260824-017/ })
    .first()
    .click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/stage6-support-workflow-drawer.png",
    fullPage: true,
  });

  for (const [route, name] of [
    ["overview?state=partial-error", "overview-partial-error"],
    ["users-workspaces?tab=trials&state=empty", "trials-empty"],
    ["tasks/TASK-260824-018", "task-unsafe"],
    ["capabilities?tab=configuration&state=limited", "capability-limited"],
    ["support?tab=diagnostics", "diagnostics"],
  ]) {
    await page.goto(`#/ops/${route}`);
    await page.screenshot({
      path: `artifacts/stage6-${name}.png`,
      fullPage: true,
    });
  }
});
