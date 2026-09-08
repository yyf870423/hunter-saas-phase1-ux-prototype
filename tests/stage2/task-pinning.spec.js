import { expect, test } from "@playwright/test";
import {
  applyTaskPins,
  normalizeTaskPins,
} from "../../src/stage2/task-pin-store";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const key = "hunter-task-pins-v1";
const rows = (page) =>
  page.locator(".s2-history > .s2-history-list > .s2-history-entry");
const entry = (page, id) => page.locator(`.s2-history [data-task-id="${id}"]`);
const ids = (page) =>
  rows(page).evaluateAll((nodes) => nodes.map((node) => node.dataset.taskId));

test("偏好校验、默认置顶取消、稳定分组与输入不变", () => {
  const items = [
    { id: "a", pinned: true },
    { id: "b" },
    { id: "c" },
    { id: "d", pinned: true },
  ];
  const original = structuredClone(items);
  expect(
    applyTaskPins(items, { a: false, c: true }).map((item) => item.id),
  ).toEqual(["c", "d", "a", "b"]);
  expect(items).toEqual(original);
  expect(
    normalizeTaskPins({
      version: 1,
      overrides: { a: false, b: true, c: "yes", "": true },
    }),
  ).toEqual({ a: false, b: true });
  for (const value of [
    null,
    [],
    {},
    { version: 2, overrides: {} },
    { version: 1, overrides: [] },
  ])
    expect(normalizeTaskPins(value)).toEqual({});
});

test("图钉不打开任务、不清空草稿，取消默认置顶后刷新与详情同步", async ({
  page,
}) => {
  const assertNoErrors = trackConsoleErrors(page);
  await page.goto("#/tasks");
  const original = await ids(page);
  const target = entry(page, "task-interview-summary");
  const input = page.locator(".s2-composer textarea");
  await input.fill("保留尚未发送的任务目标");
  await expect(
    entry(page, "position-vla").getByRole("button", { name: /^取消置顶/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await target.hover();
  await target.getByRole("button", { name: /^置顶任务/ }).click();
  await expect(
    target.getByRole("button", { name: /^取消置顶/ }),
  ).toHaveAttribute("aria-pressed", "true");
  expect((await ids(page)).slice(0, 3)).toEqual([
    "position-vla",
    "client-xinglan",
    "task-interview-summary",
  ]);
  await expect(page).toHaveURL(/#\/tasks$/);
  await expect(input).toHaveValue("保留尚未发送的任务目标");
  await page.screenshot({
    path: "artifacts/task-pinning-20260908/after-desktop-pinned.png",
  });
  await target.getByRole("button", { name: /^取消置顶/ }).click();
  expect(await ids(page)).toEqual(original);
  await entry(page, "position-vla")
    .getByRole("button", { name: /^取消置顶/ })
    .click();
  await page.reload();
  await expect(
    entry(page, "position-vla").getByRole("button", { name: /^置顶任务/ }),
  ).toHaveAttribute("aria-pressed", "false");
  expect((await ids(page))[0]).toBe("client-xinglan");
  await entry(page, "task-hand-team").locator(".s2-history-item").click();
  await expect(page).toHaveURL(/#\/tasks\/task-hand-team$/);
  await expect(
    entry(page, "position-vla").getByRole("button", { name: /^置顶任务/ }),
  ).toHaveAttribute("aria-pressed", "false");
  await assertNoErrors();
});

test("键盘与提示、搜索归档范围、保存失败不改变状态", async ({ page }) => {
  await page.goto("#/tasks");
  const target = entry(page, "mapping-embodied");
  const button = target.getByRole("button", { name: /^置顶任务/ });
  await button.focus();
  await expect(target.locator(".s2-task-pin")).toHaveCSS("opacity", "1");
  await expect(page.getByRole("tooltip")).toHaveText("置顶任务");
  await button.press("Enter");
  await expect(
    target.getByRole("button", { name: /^取消置顶/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByPlaceholder("搜索任务").fill("核验灵巧手");
  await expect(rows(page)).toHaveCount(1);
  await expect(entry(page, "mapping-embodied")).toHaveCount(0);
  await page.getByPlaceholder("搜索任务").fill("不存在的任务名称");
  await expect(page.getByText("没有匹配的任务")).toBeVisible();
  await page.getByPlaceholder("搜索任务").fill("");
  await page.getByRole("button", { name: "查看已归档任务" }).click();
  await expect(page.getByText("暂无已归档任务")).toBeVisible();
  await page.getByRole("button", { name: "查看最近任务" }).click();
  const before = await ids(page);
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key)
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      return original.call(this, name, value);
    };
  }, key);
  await target.getByRole("button", { name: /^取消置顶/ }).click();
  await expect(page.getByText("无法保存置顶设置，请重试")).toBeVisible();
  await expect(
    target.getByRole("button", { name: /^取消置顶/ }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await ids(page)).toEqual(before);
});

test("同源标签页实时同步且不改变工作台优先级", async ({ page, context }) => {
  await page.goto("#/home");
  const homeBefore = await page
    .locator(".s1-dashboard-task-item")
    .allTextContents();
  const other = await context.newPage();
  await other.goto("#/tasks");
  await page.goto("#/tasks");
  await entry(page, "career-linhao").hover();
  await entry(page, "career-linhao")
    .getByRole("button", { name: /^置顶任务/ })
    .click();
  await expect(
    entry(other, "career-linhao").getByRole("button", { name: /^取消置顶/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("#/home");
  expect(
    await page.locator(".s1-dashboard-task-item").allTextContents(),
  ).toEqual(homeBefore);
  await other.close();
});

test("损坏偏好安全恢复，新建动态任务可置顶并在刷新后保留", async ({ page }) => {
  await page.addInitScript((key) => {
    if (!sessionStorage.getItem("pin-fixture-ready")) {
      localStorage.setItem(key, "invalid json");
      sessionStorage.setItem("pin-fixture-ready", "1");
    }
  }, key);
  await page.goto("#/tasks?kind=position-create");
  await expect(rows(page)).toHaveCount(6);
  await page
    .locator(".s2-composer textarea")
    .fill("为星澜机器人创建岗位，岗位名称：机器人算法工程师");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page).toHaveURL(/#\/tasks\/task-/);
  const taskId = new URL(page.url()).hash.split("/").at(-1);
  const target = entry(page, taskId);
  await target.hover();
  await target.getByRole("button", { name: /^置顶任务/ }).click();
  await page.reload();
  await expect(
    target.getByRole("button", { name: /^取消置顶/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

for (const width of [320, 390, 1024])
  test(`窄屏 ${width} 任务列表抽屉可置顶、搜索、进入任务`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("#/tasks");
    await page.getByRole("button", { name: "打开任务列表" }).click();
    const drawer = page.getByRole("dialog", { name: "任务列表" });
    await expect(drawer).toBeVisible();
    await drawer.getByPlaceholder("搜索任务").fill("面试反馈");
    await drawer.getByRole("button", { name: /^置顶任务/ }).click();
    await expect(
      drawer.getByRole("button", { name: /^取消置顶/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expectNoHorizontalOverflow(page);
    await drawer.getByPlaceholder("搜索任务").fill("");
    await page.screenshot({
      path: `artifacts/task-pinning-20260908/after-mobile-${width}.png`,
    });
    await drawer
      .locator('[data-task-id="task-interview-summary"] .s2-history-item')
      .click();
    await expect(drawer).toHaveCount(0);
    await expect(page).toHaveURL(/#\/tasks\/task-interview-summary$/);
    await page.getByRole("button", { name: "打开任务列表" }).click();
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await page.screenshot({
      path: `artifacts/task-pinning-20260908/after-detail-${width}.png`,
    });
  });

test("明暗主题图钉与文案不重叠，未置顶悬停可见", async ({ page }) => {
  await page.goto("#/tasks");
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page
        .getByRole("button", { name: "切换深色模式", exact: true })
        .click();
    await expect(page.locator(".s1-app")).toHaveAttribute("data-theme", theme);
    const target = entry(page, "mapping-embodied");
    await target.hover();
    await expect(target.locator(".s2-task-pin")).toHaveCSS("opacity", "1");
    for (const item of await rows(page).all()) {
      const pin = await item.locator(".s2-task-pin").boundingBox();
      const text = await item.locator(".s2-history-copy b").boundingBox();
      expect(text.x + text.width).toBeLessThanOrEqual(pin.x);
    }
    await page.screenshot({
      path: `artifacts/task-pinning-20260908/after-${theme}.png`,
    });
    await expectNoHorizontalOverflow(page);
  }
});
