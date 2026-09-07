import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  dashboardAssetChanges,
  dashboardInsights,
  dashboardTasks,
  getDashboardData,
  getDashboardTaskState,
  limitDashboardItems,
  orderDashboardTasks,
  summarizeDashboardPlan,
} from "../../src/stage1/dashboard-data";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test.use({ reducedMotion: "reduce" });
const taskRows = (page) => page.locator(".s1-task-summary-table tbody tr");
const insightRows = (page) =>
  page.locator(".s1-dashboard-feed-insights > button");
const assetRows = (page) => page.locator(".s1-dashboard-feed-assets > button");

test("摘要数据默认为 5/8/10，每个区域的上限为 10 且不修改输入", () => {
  const data = getDashboardData(new URLSearchParams());
  expect([data.tasks.length, data.insights.length, data.assets.length]).toEqual(
    [5, 8, 10],
  );
  expect(data.tasks.map(({ id }) => id)).toEqual([
    "client-xinglan",
    "task-hand-team",
    "position-vla",
    "mapping-embodied",
    "career-linhao",
  ]);
  const items = Array.from({ length: 12 }, (_, id) => ({ id }));
  expect(limitDashboardItems(items)).toEqual(items.slice(0, 10));
  expect(items).toHaveLength(12);
  expect(getDashboardData(new URLSearchParams("state=empty"))).toEqual({
    tasks: [],
    insights: [],
    assets: [],
  });
  expect(getDashboardData(new URLSearchParams("empty=tasks,assets"))).toEqual({
    tasks: [],
    insights: dashboardInsights,
    assets: [],
  });
});

test("任务先按处理与验收优先级排序再限量，同组稳定且不改变源数据", () => {
  const tasks = [
    ...Array.from({ length: 11 }, (_, index) => ({
      id: `running-${index}`,
      attention: "running",
      pinned: true,
    })),
    { id: "action-1", attention: "action" },
    { id: "review", attention: "acceptance" },
    { id: "action-2", attention: "action" },
    { id: "external", attention: "external" },
    { id: "unknown", attention: "other", status: "已暂停", tone: "neutral" },
  ];
  const original = structuredClone(tasks);
  const ordered = orderDashboardTasks(tasks);
  expect(limitDashboardItems(ordered).map(({ id }) => id)).toEqual([
    "action-1",
    "action-2",
    "review",
    ...Array.from({ length: 7 }, (_, index) => `running-${index}`),
  ]);
  expect(ordered.slice(-2).map(({ id }) => id)).toEqual([
    "external",
    "unknown",
  ]);
  expect(tasks).toEqual(original);
  expect(getDashboardTaskState(tasks.at(-1))).toEqual({
    label: "已暂停",
    tone: "neutral",
    rank: 4,
  });
  expect(getDashboardTaskState({ attention: "__proto__" }).label).toBe(
    "状态待同步",
  );
});

test("工作台进度按当前计划统计完成步数，未知和重复完成 ID 不增加进度", () => {
  expect(
    dashboardTasks.map(({ progress }) => [progress.completed, progress.total]),
  ).toEqual([
    [4, 5],
    [1, 6],
    [3, 5],
    [3, 5],
    [2, 3],
  ]);
  const steps = [
    { id: "a", title: "核验资料" },
    { id: "b", title: "审核结果" },
    { id: "c", title: "后续安排" },
  ];
  expect(summarizeDashboardPlan(steps, ["a", "a", "unknown"])).toEqual({
    completed: 1,
    total: 3,
    label: "已完成 1 / 3 步",
    detail: "当前：审核结果",
  });
  expect(summarizeDashboardPlan(steps)).toMatchObject({
    completed: 0,
    label: "已完成 0 / 3 步",
    detail: "当前：核验资料",
  });
  expect(summarizeDashboardPlan(steps, ["a", "b", "c"])).toMatchObject({
    label: "已完成 3 / 3 步",
    detail: "计划步骤已全部完成",
  });
  expect(summarizeDashboardPlan()).toEqual({
    completed: 0,
    total: 0,
    label: "计划待生成",
    detail: "等待生成执行计划",
  });
});

test("三个摘要区共享明确标题带，动态双栏有间距和分隔，名称先于元信息", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/home");
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page
        .getByRole("button", { name: "切换深色模式", exact: true })
        .click();
    const headers = await page
      .locator(".s1-dashboard-section-head")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const style = getComputedStyle(node);
          return {
            height: node.getBoundingClientRect().height,
            background: style.backgroundColor,
            border: style.borderTopWidth,
            icon: node.querySelector("h2 svg")?.getAttribute("data-icon"),
          };
        }),
      );
    expect(headers.map(({ icon }) => icon)).toEqual([
      "task",
      "signal",
      "database",
    ]);
    for (const header of headers) {
      expect(header.height).toBeGreaterThanOrEqual(56);
      expect(header.border).toBe("1px");
      expect(header.background).not.toBe("rgba(0, 0, 0, 0)");
    }
    const divider = await page
      .locator(".s1-dashboard-updates")
      .evaluate((node) => ({
        width: getComputedStyle(node, "::before").width,
        gap: getComputedStyle(node).columnGap,
        margin: getComputedStyle(node).marginTop,
      }));
    expect(divider).toEqual({ width: "1px", gap: "48px", margin: "40px" });
  }
  const title = await insightRows(page).first().locator("b").boundingBox();
  const meta = await insightRows(page)
    .first()
    .locator(".s1-dashboard-feed-meta")
    .boundingBox();
  expect(meta.y).toBeGreaterThanOrEqual(title.y + title.height);
  await page.setViewportSize({ width: 390, height: 900 });
  const mobileDivider = await page
    .locator(".s1-dashboard-updates")
    .evaluate((node) => getComputedStyle(node, "::before").content);
  expect(mobileDivider).toBe("none");
  await expectNoHorizontalOverflow(page);
});

test("工作台任务按处理优先级展示四个字段，洞察和资产变化双栏顶部对齐", async ({
  page,
}) => {
  const check = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/home");
  await expect(taskRows(page)).toHaveCount(5);
  await expect(insightRows(page)).toHaveCount(8);
  await expect(assetRows(page)).toHaveCount(10);
  await expect(taskRows(page).locator(".s4-data-col-status")).toHaveText([
    "待你处理",
    "待你处理",
    "待你验收",
    "正在推进",
    "等待外部",
  ]);
  await expect(taskRows(page).locator(".s1-task-summary-name")).toHaveText(
    getDashboardData(new URLSearchParams()).tasks.map(({ title }) => title),
  );
  await expect(
    page.locator(".s1-mainline-focus, .s1-mainline-primary"),
  ).toHaveCount(0);
  await expect(page.locator(".s1-task-summary-table th")).toHaveText([
    "任务类型",
    "任务名称",
    "进度",
    "状态",
  ]);
  const heights = await taskRows(page).evaluateAll((rows) =>
    rows.map((row) => row.getBoundingClientRect().height),
  );
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  for (const task of dashboardTasks) {
    const row = taskRows(page).filter({ hasText: task.title });
    await expect(row.locator(".s4-data-col-type")).toHaveText(task.type);
    await expect(row.locator(".s4-data-col-status")).toHaveText(
      getDashboardTaskState(task).label,
    );
    await expect(
      row.getByText(task.progress.label, { exact: true }),
    ).toBeVisible();
    await expect(
      row.getByText(task.progress.detail, { exact: true }),
    ).toBeVisible();
  }
  const insights = await page.locator(".s1-dashboard-insights").boundingBox();
  const assets = await page.locator(".s1-dashboard-assets").boundingBox();
  expect(Math.abs(insights.y - assets.y)).toBeLessThanOrEqual(1);
  expect(assets.x).toBeGreaterThan(insights.x + insights.width);
  expect(insights.y).toBeLessThan(800);
  await expectNoHorizontalOverflow(page);
  await check();
});

test("五个任务从名称直接进入对应详情，不再先切换焦点", async ({ page }) => {
  const check = trackConsoleErrors(page);
  for (const task of dashboardTasks) {
    await page.goto("#/home");
    await page
      .locator(".s1-task-summary-table")
      .getByRole("button", { name: task.title, exact: true })
      .click();
    await expect.poll(() => new URL(page.url()).hash).toBe(`#${task.route}`);
    await expect(
      page.getByRole("heading", { name: task.title, exact: true }),
    ).toBeVisible();
  }
  await check();
});

test("八条洞察沿用来源状态和下一步，并进入对应详情", async ({ page }) => {
  for (const insight of dashboardInsights) {
    await page.goto("#/home");
    const row = insightRows(page).filter({ hasText: insight.title });
    await expect(row.getByText(insight.status, { exact: true })).toBeVisible();
    await expect(row.getByText(insight.detail, { exact: true })).toBeVisible();
    await row.click();
    await expect.poll(() => new URL(page.url()).hash).toBe(`#${insight.route}`);
    await expect(
      page
        .locator(".s2-signal-detail")
        .getByRole("heading", { name: insight.title, exact: true }),
    ).toBeVisible();
  }
});

test("十条资产变化均打开现有资产，联系人仍为公司子资产", async ({ page }) => {
  const check = trackConsoleErrors(page);
  for (const asset of dashboardAssetChanges) {
    await page.goto("#/home");
    await assetRows(page)
      .filter({
        has: page.locator("b").getByText(asset.title, { exact: true }),
      })
      .click();
    const expected = new URL(asset.route, "https://prototype.test");
    await expect
      .poll(() => {
        const actual = new URL(
          new URL(page.url()).hash.slice(1),
          "https://prototype.test",
        );
        return {
          pathname: actual.pathname,
          params: [...expected.searchParams].map(([key]) => [
            key,
            actual.searchParams.get(key),
          ]),
        };
      })
      .toEqual({
        pathname: expected.pathname,
        params: [...expected.searchParams],
      });
    await expect(
      page.locator(".s1-main").getByText(/未找到|不存在的资产/),
    ).toHaveCount(0);
    await expect(page.locator(".s1-main h1")).toBeVisible();
  }
  await check();
});

test("行动队列默认收起，展开后进入事项来源", async ({ page }) => {
  await page.goto("#/home");
  const summary = page.getByRole("button", { name: /行动队列/ });
  const updates = await page.locator(".s1-dashboard-updates").boundingBox();
  const queue = await page.locator(".s1-action-queue").boundingBox();
  expect(queue.y - (updates.y + updates.height)).toBeGreaterThanOrEqual(12);
  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await summary.click();
  await expect(summary).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".s1-action-list > button")).toHaveCount(4);
  await summary.click();
  await expect(page.locator(".s1-action-list")).toHaveCount(0);
  await summary.click();
  await page.getByRole("button", { name: /确认是否记录星澜机器人潜在机会/ }).click();
  await expect(page).toHaveURL(/#\/tasks\/client-xinglan$/);
});

test("自然语言开始任务，空白输入禁用，Shift+Enter 保留换行", async ({
  page,
}) => {
  await page.goto("#/home");
  const input = page.getByLabel("描述新任务", { exact: true });
  await expect(
    page.getByRole("button", { name: "开始", exact: true }),
  ).toBeDisabled();
  await input.fill("每周一检查具身智能创业公司");
  await input.press("Shift+Enter");
  await expect(page).toHaveURL(/#\/home$/);
  await input.press("Enter");
  await expect(page).toHaveURL(/#\/tasks$/);
  await expect(page.locator(".s2-composer textarea")).toHaveValue(
    "每周一检查具身智能创业公司",
  );
});

test("新任务输入保存失败保留草稿且不跳转", async ({ page }) => {
  await page.goto("#/home");
  await page.getByLabel("描述新任务", { exact: true }).fill("核验招聘需求");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "hunter-new-work-signal")
        throw new DOMException("QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "开始", exact: true }).click();
  await expect(
    page.getByText("无法保存任务输入，请重试", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("描述新任务", { exact: true })).toHaveValue(
    "核验招聘需求",
  );
  await expect(page).toHaveURL(/#\/home$/);
});

test("全局空保留三个零数量区域与可用的新建、导入入口", async ({ page }) => {
  await page.goto("#/home?state=empty");
  await expect(page.locator(".s1-dashboard-count")).toHaveText(["0", "0", "0"]);
  await expect(page.locator(".s1-empty-state")).toHaveCount(3);
  await expect(taskRows(page)).toHaveCount(0);
  await expect(insightRows(page)).toHaveCount(0);
  await expect(assetRows(page)).toHaveCount(0);
  await expect(page.locator(".s1-action-queue")).toHaveCount(0);
  await expect(page.getByLabel("描述新任务", { exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "新建任务", exact: true }).click();
  await expect(page).toHaveURL(/#\/new$/);
  await page.goto("#/home?state=empty");
  await page.getByRole("button", { name: "导入数据", exact: true }).click();
  await expect(page).toHaveURL(/#\/data\/imports$/);
});

for (const [empty, counts, title] of [
  ["tasks", [0, 8, 10], "还没有任务"],
  ["insights", [5, 0, 10], "暂无洞察"],
  ["assets", [5, 8, 0], "暂无资产变化"],
]) {
  test(`${empty} 局部空状态不隐藏其他区域`, async ({ page }) => {
    await page.goto(`#/home?empty=${empty}`);
    await expect(taskRows(page)).toHaveCount(counts[0]);
    await expect(insightRows(page)).toHaveCount(counts[1]);
    await expect(assetRows(page)).toHaveCount(counts[2]);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".s1-empty-state")).toHaveCount(1);
    await expect(page.locator(".s1-action-queue")).toHaveCount(
      empty === "tasks" ? 0 : 1,
    );
    await expect(page.locator(".s1-dashboard-count")).toHaveText(
      counts.map(String),
    );
  });
}

test("组件库最大容量向每类传入 12 条但只呈现 10 条", async ({ page }) => {
  await mkdir("artifacts/dashboard-layout", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("#/components?dashboard=capacity");
    await expect(taskRows(page)).toHaveCount(10);
    await expect(insightRows(page)).toHaveCount(10);
    await expect(assetRows(page)).toHaveCount(10);
    await expect(
      page
        .locator(".s1-dashboard-component-preview .s1-dashboard-feed")
        .getByText(/容量示例 1[12]$/),
    ).toHaveCount(0);
    await expect(taskRows(page).locator(".s4-data-col-status")).toHaveText([
      ...Array(5).fill("待你处理"),
      ...Array(3).fill("待你验收"),
      ...Array(2).fill("正在推进"),
    ]);
    await expectNoHorizontalOverflow(page);
    await page.locator(".s1-dashboard-component-preview").screenshot({
      path: `artifacts/dashboard-layout/capacity-${width}.png`,
      animations: "disabled",
    });
  }
  await page.getByRole("tablist", { name: "工作台组件状态" }).getByRole("tab", { name: "空状态", exact: true }).click();
  await expect(
    page.locator(".s1-dashboard-component-preview .s1-empty-state"),
  ).toHaveCount(3);
});

test("桌面、平板、手机的正常、空态、局部空与深色截图", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await mkdir("artifacts/dashboard-layout", { recursive: true });
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, query] of [
      ["normal", ""],
      ["empty", "?state=empty"],
      ["empty-tasks", "?empty=tasks"],
    ]) {
      await page.goto(`#/home${query}`);
      await expect(page.locator(".s1-dashboard-section")).toHaveCount(3);
      await expectNoHorizontalOverflow(page);
      if (width === 390 && name === "normal") {
        const row = taskRows(page).first();
        for (const key of ["type", "title", "progress", "status"])
          await expect(row.locator(`.s4-data-col-${key}`)).toBeVisible();
        const type = await row.locator(".s1-task-summary-type").boundingBox();
        const cell = await row.locator(".s4-data-col-type").boundingBox();
        expect(cell.width).toBeGreaterThanOrEqual(type.width);
        expect(type.height).toBeLessThan(25);
      }
      const nestedScrolls = await page
        .locator(".s1-dashboard-section")
        .evaluateAll(
          (sections) =>
            sections
              .flatMap((section) => [section, ...section.querySelectorAll("*")])
              .filter(
                (node) =>
                  ["auto", "scroll"].includes(
                    getComputedStyle(node).overflowY,
                  ) && node.scrollHeight > node.clientHeight + 1,
              ).length,
        );
      expect(nestedScrolls).toBe(0);
      await page.screenshot({
        path: `artifacts/dashboard-layout/${name}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/home");
  await page.getByRole("button", { name: "展开导航", exact: true }).click();
  await page.screenshot({
    path: "artifacts/dashboard-layout/expanded-1440.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "切换深色模式", exact: true }).click();
  await page.screenshot({
    path: "artifacts/dashboard-layout/dark-1440.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("#/home?state=empty");
  await page.screenshot({
    path: "artifacts/dashboard-layout/empty-dark-1440.png",
    fullPage: true,
    animations: "disabled",
  });
  await check();
});
