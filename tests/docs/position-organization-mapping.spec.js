import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { replyToAsset } from "../stage4/opportunity-helpers";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";
const button = (page, name) => page.getByRole("button", { name, exact: true });
const snapshot = (page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("hunter-opportunity-lifecycle-v1")),
  );
async function capture(page, name) {
  await mkdir("artifacts/position-organization-mapping-20260908", {
    recursive: true,
  });
  await page.evaluate(() => document.fonts.ready);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `artifacts/position-organization-mapping-20260908/${name}.png`,
    animations: "disabled",
  });
}
for (const [device, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  test(`${device}：岗位审核同步储备与人才梳理并保留来源`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/tasks/position-vla?state=review");
    await button(page, "打开候选人审核（18）").click();
    await page.getByRole("button", { name: /加入岗位储备/ }).click();
    await expect(
      page.getByRole("link", { name: "查看人才梳理", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "查看人才梳理", exact: true })
      .scrollIntoViewIfNeeded();
    await capture(page, `${device}-position-result`);
    const position = (await snapshot(page)).positions.find(
      (item) => item.id === "position-vla",
    );
    expect(position.pipeline.length).toBeGreaterThan(0);
    expect(position.talentMap.rows.length).toBe(position.pipeline.length);
    await page.getByRole("link", { name: "查看人才梳理", exact: true }).click();
    await expect(
      page.getByTestId("position-talent-hierarchy-table"),
    ).toContainText("林昊");
    if (device === "mobile")
      await page
        .getByTestId("position-talent-hierarchy-table")
        .scrollIntoViewIfNeeded();
    await capture(page, `${device}-position-talents`);
    await button(page, "查看人选").first().click();
    await expect(page.getByRole("dialog")).toContainText("匹配依据");
    await expect(page.getByRole("dialog")).toContainText("风险与待核实");
    await capture(page, `${device}-position-person`);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "关闭", exact: true })
      .first()
      .click();
    await page.getByRole("tab", { name: "关系图", exact: true }).click();
    await expect(page.locator(".s3-relationship-canvas-shell")).toBeVisible();
    await capture(page, `${device}-position-graph`);
    await page.reload();
    await expect(
      page.getByTestId("position-talent-hierarchy-table"),
    ).toContainText("林昊");
    await page.getByRole("tab", { name: /候选人流程/ }).click();
    await expect(page.locator(".s4-kanban-reserve")).toContainText("林昊");
    await capture(page, `${device}-position-reserve`);
    await errors();
  });

  test(`${device}：公司组织梳理保存人才地图，缺口不阻止已核实结果`, async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/tasks/mapping-embodied?state=gaps");
    await expect(
      page.getByRole("heading", {
        name: "具身智能目标公司组织梳理",
        exact: true,
      }),
    ).toBeVisible();
    await button(page, "打开人才地图批次审核").click();
    await expect(
      page.getByRole("tab", { name: "关键岗位与任职人", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("3 个独立知识图谱的本批次变化", { exact: true }),
    ).toHaveCount(0);
    await page.getByRole("tab", { name: "冲突与待补充", exact: true }).click();
    await capture(page, `${device}-organization-review`);
    await button(page, "完成审核并返回对话").click();
    await page.getByRole("button", { name: /^更新人才地图 / }).click();
    await expect(
      page.getByRole("heading", { name: "人才地图已更新", exact: true }),
    ).toBeVisible();
    await capture(page, `${device}-organization-completed`);
    await page.getByRole("link", { name: "查看人才地图", exact: true }).click();
    await expect(
      page.getByRole("heading", {
        name: "具身智能目标公司人才地图",
        exact: true,
      }),
    ).toBeVisible();
    await button(page, "自适应全部内容").click();
    if (device === "mobile") {
      await button(page, "层级表格").click();
      await page.getByLabel("横向滚动图谱层级表格").scrollIntoViewIfNeeded();
    }
    await capture(page, `${device}-organization-map`);
    const graph = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("hunter-topic-graphs-v1")).graphs.find(
        (item) => item.id === "mapping-embodied",
      ),
    );
    expect(graph.pages).toHaveLength(4);
    expect(graph.pages[0].nodes.some((node) => node.label === "林昊")).toBe(
      false,
    );
    expect(
      graph.pages[0].nodes.find((node) => node.label === "王奕").status,
    ).toBe("review");
    const state = await snapshot(page);
    expect(
      state?.positions.every((position) => position.pipeline.length === 0) ??
        true,
    ).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "具身智能目标公司人才地图",
        exact: true,
      }),
    ).toBeVisible();
    await errors();
  });

  test(`${device}：旧客户首次是显示为确认，后续是仍保留`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("#/tasks/client-xinglan");
    await expect(
      page.getByRole("heading", { name: "待确认的招聘机会", exact: true }),
    ).toBeVisible();
    await replyToAsset(page, "是");
    await expect(
      page.locator(".s2-user-message").filter({ hasText: /^确认/ }),
    ).toHaveCount(1);
    const task = (await snapshot(page)).tasks.find(
      (item) => item.id === "client-xinglan",
    );
    expect(
      task.messages.find((message) => message.sourceKind === "decision")
        .content,
    ).toBe("是");
    await page.reload();
    await expect(
      page.locator(".s2-user-message").filter({ hasText: /^确认/ }),
    ).toHaveCount(1);
    await page
      .locator(".s2-user-message")
      .filter({ hasText: /^确认/ })
      .scrollIntoViewIfNeeded();
    await capture(page, `${device}-client-confirmation`);
  });
}

test("公司组织完成直达可恢复结果，重复打开不覆盖已有批次", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied?state=completed");
  await expect(
    page.getByRole("heading", { name: "人才地图已更新", exact: true }),
  ).toBeVisible();
  const before = await page.evaluate(() =>
    localStorage.getItem("hunter-topic-graphs-v1"),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "人才地图已更新", exact: true }),
  ).toHaveCount(1);
  expect(
    await page.evaluate(() => localStorage.getItem("hunter-topic-graphs-v1")),
  ).toBe(before);
});

test("公司组织增量保存保留人工修改与其他公司图页", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied?state=completed");
  await expect(
    page.getByRole("heading", { name: "人才地图已更新", exact: true }),
  ).toBeVisible();
  const result = await page.evaluate(async () => {
    const { getTopicGraphSnapshot, saveGraphPages, publishOrganizationMap } =
      await import(
        new URL("src/stage4/topic-graph-store.js", location.href).href
      );
    const { organizationScope } = await import(
      new URL("src/stage3/organization-mapping-data.js", location.href).href
    );
    const graph = getTopicGraphSnapshot().find(
      (item) => item.id === "mapping-embodied",
    );
    const pages = structuredClone(graph.pages);
    pages[0].nodes[0].label = "星澜机器人（人工核实）";
    saveGraphPages(graph.id, pages);
    return publishOrganizationMap(
      {},
      organizationScope.filter((company) => company.id === "xinglan"),
    );
  });
  expect(result.pages).toHaveLength(4);
  expect(result.pages.find((item) => item.userEdited).nodes[0].label).toBe(
    "星澜机器人（人工核实）",
  );
});

test("新建公司组织梳理保留单家公司范围，不扩成四家公司", async ({ page }) => {
  await page.goto("#/new");
  await replyToAsset(page, "整理拓界机器人的组织架构和关键岗位任职人");
  await expect(page).toHaveURL(/companies=tuojie/);
  await expect(button(page, "打开人才地图批次审核")).toBeVisible();
  await button(page, "打开人才地图批次审核").click();
  await expect(page.locator(".s3-context-change-items > button")).toHaveCount(
    1,
  );
  await expect(page.locator(".s3-review-header")).toContainText(
    "1 家公司 · 2 个关键岗位",
  );
  await button(page, "完成审核并返回对话").click();
  await page.getByRole("button", { name: /^更新人才地图 / }).click();
  await expect(
    page
      .locator(".s2-hunter-reply")
      .filter({
        has: page.getByRole("heading", { name: "人才地图已更新", exact: true }),
      }),
  ).toContainText("1 家公司");
  const graph = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hunter-topic-graphs-v1")).graphs.find(
      (item) => item.id === "mapping-embodied",
    ),
  );
  expect(graph.pages.map((item) => item.name)).toEqual(["拓界机器人"]);
});

test("组织地图保存失败不显示完成，重试后才交付", async ({ page }) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    window.failGraphSave = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === "hunter-topic-graphs-v1" && window.failGraphSave)
        throw new Error("storage full");
      return set.call(this, key, value);
    };
  });
  await page.goto("#/tasks/mapping-embodied?state=completed");
  await expect(
    page.getByRole("heading", { name: "人才地图尚未保存", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("本轮完成", { exact: true })).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("hunter-topic-graphs-v1")),
  ).toBeNull();
  await page.evaluate(() => {
    window.failGraphSave = false;
  });
  await button(page, "重试保存人才地图").click();
  await expect(
    page.getByRole("heading", { name: "人才地图已更新", exact: true }),
  ).toBeVisible();
});

test("岗位储备写入失败时人才梳理不部分保存，选择可重试", async ({ page }) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    window.failPositionSave = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === "hunter-opportunity-lifecycle-v1" && window.failPositionSave)
        throw new Error("storage full");
      return set.call(this, key, value);
    };
  });
  await page.goto("#/tasks/position-vla?state=review");
  await button(page, "打开候选人审核（18）").click();
  await page.getByRole("button", { name: /加入岗位储备/ }).click();
  await expect(page.getByText(/本地保存失败，资料未改变/)).toBeVisible();
  expect(await snapshot(page)).toBeNull();
  await page.evaluate(() => {
    window.failPositionSave = false;
  });
  await page.getByRole("button", { name: /加入岗位储备/ }).click();
  await expect(
    page.getByRole("link", { name: "查看人才梳理", exact: true }),
  ).toBeVisible();
});

test("人才梳理支持无匹配与岗位内刷新，不偷偷创建任务", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=review");
  await replyToAsset(page, "将 85 分以上的人加入岗位储备");
  await page.getByRole("link", { name: "查看人才梳理", exact: true }).click();
  await page
    .getByRole("textbox", { name: "搜索重点人才", exact: true })
    .fill("不存在的人选");
  await expect(
    page.getByTestId("position-talent-hierarchy-table"),
  ).toContainText("没有符合条件的数据");
  await page
    .getByRole("textbox", { name: "搜索重点人才", exact: true })
    .fill("");
  const before = (await snapshot(page)).tasks.length;
  await button(page, "更新人才梳理").click();
  await page
    .getByRole("dialog")
    .getByRole("textbox")
    .fill("核对现有候选人最新任职与流程状态");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "开始更新", exact: true })
    .click();
  await expect(
    page.getByTestId("position-talent-hierarchy-table"),
  ).toContainText("林昊");
  expect((await snapshot(page)).tasks.length).toBe(before);
});
