import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const routes = [
  ["overview", "运营概况"],
  ["users-workspaces", "用户与工作空间"],
  ["subscriptions", "订阅与额度"],
  ["tasks", "运行与故障"],
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
  await page.getByRole("tab", { name: /任务模型分配/ }).click();
  await page
    .getByRole("button", { name: /深度调研/ })
    .first()
    .click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/stage6-model-routing-modal.png",
    fullPage: true,
  });
  const modelRouteItems = page
    .getByRole("dialog", { name: "编辑任务模型分配" })
    .getByRole("listitem");
  await modelRouteItems.first().evaluate((element) => {
    element.dispatchEvent(
      new DragEvent("dragstart", {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      }),
    );
  });
  const modelDropZones = page
    .getByRole("dialog", { name: "编辑任务模型分配" })
    .locator(".ops-sortable-drop-zone");
  await modelDropZones.last().evaluate((element) => {
    element.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      }),
    );
  });
  await expect(modelDropZones.last()).toHaveClass(/is-drop-target/);
  await page.screenshot({
    path: "artifacts/stage6-model-routing-drag.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "取消" }).click();
  await page.getByRole("tab", { name: /数据源配置/ }).click();
  await page.screenshot({
    path: "artifacts/stage6-data-sources.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: /公开网络搜索/ })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "编辑能力配置" }),
  ).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/stage6-data-source-routing-modal.png",
    fullPage: true,
  });
  const dataRouteItems = page
    .getByRole("dialog", { name: "编辑能力配置" })
    .getByRole("listitem");
  await dataRouteItems.first().evaluate((element) => {
    element.dispatchEvent(
      new DragEvent("dragstart", {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      }),
    );
  });
  const dataDropZones = page
    .getByRole("dialog", { name: "编辑能力配置" })
    .locator(".ops-sortable-drop-zone");
  await dataDropZones.last().evaluate((element) => {
    element.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      }),
    );
  });
  await expect(dataDropZones.last()).toHaveClass(/is-drop-target/);
  await page.waitForTimeout(180);
  await page.screenshot({
    path: "artifacts/stage6-data-source-routing-drag.png",
    fullPage: true,
  });
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

test("全局状态标签的圆点与文字始终保持同一行", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  for (const route of [
    "#/home",
    "#/new",
    "#/tasks/position-vla",
    "#/tasks/client-xinglan",
    "#/tasks/mapping-embodied",
    "#/tasks/career-linhao",
    "#/tasks",
    "#/tasks/task-hand-team",
    "#/signals",
    "#/candidates",
    "#/candidates/candidate-linhao",
    "#/positions/position-vla?tab=profile",
    "#/positions/position-vla?tab=pipeline",
    "#/positions/position-vla?tab=matching",
    "#/companies",
    "#/companies/company-xinglan",
    "#/contacts/contact-chenyu",
    "#/opportunities/opportunity-xinglan",
    "#/mappings",
    "#/mappings/mapping-embodied?tab=overview",
    "#/papers",
    "#/papers/paper-vla-survey",
    "#/patents",
    "#/patents/patent-manipulation",
    "#/data/imports?type=mapping",
    "#/data/exports",
    "#/recycle-bin",
    "#/settings/profile",
    "#/settings/notifications",
    "#/settings/automation",
    "#/settings/connections",
    "#/settings/subscription",
    "#/settings/data-privacy",
    "#/ops/overview",
    "#/ops/users-workspaces",
    "#/ops/subscriptions",
    "#/ops/tasks",
    "#/ops/tasks/TASK-260824-019",
    "#/ops/capabilities?tab=health",
    "#/ops/capabilities?tab=configuration",
    "#/ops/capabilities?tab=data-sources",
    "#/ops/support",
  ]) {
    await page.goto(route);
    const problems = await page.locator(".s1-status").evaluateAll((nodes) =>
      nodes.flatMap((node) => {
        const box = node.getBoundingClientRect();
        if (!box.width || !box.height) return [];
        const dot = node.querySelector(":scope > i");
        const text = node.querySelector(":scope > span");
        if (!text) return [`${node.textContent}: 缺少文本容器`];
        const style = window.getComputedStyle(node);
        const textStyle = window.getComputedStyle(text);
        const textBox = text.getBoundingClientRect();
        if (style.flexWrap !== "nowrap" || textStyle.whiteSpace !== "nowrap") {
          return [`${node.textContent}: 允许换行`];
        }
        if (dot) {
          const dotBox = dot.getBoundingClientRect();
          const overlapsVertically =
            dotBox.bottom >= textBox.top && dotBox.top <= textBox.bottom;
          if (dotBox.right > textBox.left || !overlapsVertically) {
            return [`${node.textContent}: 圆点与文字未保持同一行`];
          }
        }
        return [];
      }),
    );
    expect(problems, route).toEqual([]);
  }
});
