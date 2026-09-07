import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { graphTypes, defaultGraphTypeIds } from "../../src/stage4/graph-types";
import { topicGraphs } from "../../src/stage4/topic-graph-data";
import {
  graphStorageKey,
  normalizeTopicGraphs,
  validateGraphMetadata,
} from "../../src/stage4/topic-graph-store";
import {
  assetNavigationKey,
  normalizeGraphTypeNavigation,
} from "../../src/stage1/asset-navigation-store";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test.use({ reducedMotion: "reduce" });
const cards = (page) => page.locator(".tg-graph-card");
const typeNav = (page) =>
  page.getByRole("group", { name: "知识图谱类型", exact: true });
const assetNav = (page) =>
  page.getByRole("navigation", { name: "资产导航", exact: true });
const editor = (page) =>
  page.getByRole("dialog", { name: "编辑图谱资料", exact: true });
const formType = (scope) =>
  scope
    .locator(".s4-form-field")
    .filter({ hasText: "图谱类型" })
    .locator(".s4-select > button");
const chooseType = async (page, label, scope) => {
  await (
    scope ? formType(scope) : page.locator(".s4-filter-bar .s4-select > button")
  ).click();
  await page
    .locator(".s4-select-panel")
    .getByRole("button", { name: label, exact: true })
    .click();
};
const expandNav = (page) =>
  page.getByRole("button", { name: "展开导航", exact: true }).click();
const openEditor = async (page, name) => {
  const card = cards(page).filter({
    has: page.getByRole("heading", { name, exact: true }),
  });
  await card
    .getByRole("button", { name: `更多操作：${name}`, exact: true })
    .click();
  await card.getByRole("button", { name: "编辑图谱资料", exact: true }).click();
  await expect(editor(page)).toBeVisible();
};
const saveEditor = (page) =>
  editor(page).getByRole("button", { name: "保存修改", exact: true }).click();
const createGraph = async (page, name, type = "人才地图") => {
  await page.goto("#/mappings/new");
  await page.getByLabel(/图谱名称/).fill(name);
  await chooseType(page, type, page);
  await page.getByRole("button", { name: "创建知识图谱", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  return new URL(page.url()).hash.split("?")[0].split("/").at(-1);
};
const simulateWriteFailure = (page, key) =>
  page.evaluate((target) => {
    window.originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === target) throw new DOMException("QuotaExceededError");
      return window.originalSetItem.call(this, name, value);
    };
  }, key);
const restoreWrites = (page) =>
  page.evaluate(() => {
    Storage.prototype.setItem = window.originalSetItem;
  });
const saveSettings = (page) =>
  page.getByRole("button", { name: "保存设置", exact: true }).click();
const typeSwitch = (page, label) =>
  page.getByRole("switch", { name: `快捷显示${label}`, exact: true });

test("类型目录为八类且人才地图替代组织架构，边界不接受多类型或未知值", () => {
  expect(graphTypes.map((type) => type.label)).toEqual([
    "人才地图",
    "公司关系",
    "候选人关系",
    "岗位人才",
    "岗位知识",
    "行业知识",
    "技术与人才",
    "人才流动",
  ]);
  expect(topicGraphs.map((graph) => graph.typeId)).toEqual(
    graphTypes.map((type) => type.id),
  );
  const draft = { name: "新的图谱", description: "", typeId: "talent-map" };
  expect(validateGraphMetadata(draft)).toEqual({});
  expect(
    validateGraphMetadata({
      ...draft,
      typeId: ["talent-map", "company-relations"],
    }).typeId,
  ).toBeTruthy();
  expect(
    validateGraphMetadata({ ...draft, typeId: "organization" }).typeId,
  ).toBeTruthy();
  expect(
    validateGraphMetadata({ ...draft, name: topicGraphs[0].name }).name,
  ).toContain("同名");
  expect(normalizeTopicGraphs({ version: 1, graphs: [] })).toEqual([]);
  expect(
    normalizeTopicGraphs({
      version: 1,
      graphs: [{ ...topicGraphs[0], typeId: "unknown" }],
    }),
  ).toEqual(topicGraphs);
  expect(normalizeGraphTypeNavigation({ version: 1, visibleIds: [] })).toEqual(
    defaultGraphTypeIds,
  );
  expect(
    normalizeGraphTypeNavigation({ version: 1, graphTypeIds: [] }),
  ).toEqual([]);
  expect(
    normalizeGraphTypeNavigation({
      version: 1,
      graphTypeIds: ["talent-flow", "unknown", "talent-flow"],
    }),
  ).toEqual(["talent-flow"]);
});

test("默认快捷类型直接筛选，父导航返回全部图谱", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await page.goto("#/mappings");
  await expandNav(page);
  await expect(typeNav(page).getByRole("button")).toHaveText([
    "人才地图",
    "公司关系",
    "候选人关系",
  ]);
  await typeNav(page)
    .getByRole("button", { name: "人才地图", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/mappings\?type=talent-map$/);
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).getByRole("heading")).toHaveText(
    topicGraphs[0].name,
  );
  await expect(
    typeNav(page).getByRole("button", { name: "人才地图", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await assetNav(page)
    .getByRole("button", { name: "知识图谱", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/mappings$/);
  await expect(cards(page)).toHaveCount(6);
  await expect(typeNav(page).locator('[aria-current="page"]')).toHaveCount(0);
  await page.locator(".s4-filter-bar .s4-select > button").click();
  await expect(page.locator(".s4-select-options > button")).toHaveCount(9);
  await expect(
    page
      .locator(".s4-select-options")
      .getByRole("button", { name: "组织架构", exact: true }),
  ).toHaveCount(0);
  await check();
});

test("八类图谱卡片显式显示类型标签，桌面手机与深色不裁切", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await mkdir("artifacts/graph-card-types", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const number of [1, 2]) {
      await page.goto(`#/mappings?page=${number}`);
      const expected = topicGraphs.slice((number - 1) * 6, number * 6);
      await expect(cards(page)).toHaveCount(expected.length);
      for (const graph of expected) {
        const card = cards(page).filter({
          has: page.getByRole("heading", { name: graph.name, exact: true }),
        });
        const label = graphTypes.find((type) => type.id === graph.typeId).label;
        const tag = card.locator(".tg-graph-card-meta .s4-tag");
        await expect(tag).toHaveText(`类型：${label}`);
        await expect(tag).toBeVisible();
        await expect(card.locator(".tg-graph-card-meta small")).toHaveText(
          `${graph.pageCount} 个图页`,
        );
        expect(
          await tag.evaluate((node) => node.scrollWidth <= node.clientWidth),
        ).toBe(true);
      }
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `artifacts/graph-card-types/after-${width}-page-${number}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/mappings");
  await expandNav(page);
  await page.getByRole("button", { name: "切换深色模式", exact: true }).click();
  await expect(cards(page).first().locator(".s4-tag")).toHaveText(
    "类型：人才地图",
  );
  await page.screenshot({
    path: "artifacts/graph-card-types/after-dark.png",
    fullPage: true,
    animations: "disabled",
  });
  await check();
});

test("类型与搜索取交集，刷新、清除和未知类型回退正常", async ({ page }) => {
  await page.goto("#/mappings");
  await chooseType(page, "公司关系");
  await page.getByPlaceholder("搜索图谱名称或内容").fill("具身智能");
  await expect(cards(page)).toHaveCount(1);
  await expect(page).toHaveURL(/type=company-relations/);
  await page.reload();
  await expect(page.getByPlaceholder("搜索图谱名称或内容")).toHaveValue(
    "具身智能",
  );
  await expect(cards(page)).toHaveCount(1);
  await page.getByPlaceholder("搜索图谱名称或内容").fill("不存在的内容");
  await expect(
    page.getByText("没有匹配的知识图谱", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "清除筛选", exact: true }).click();
  await expect(cards(page)).toHaveCount(6);
  await page.goto("#/mappings?type=unknown");
  await expect(
    page.getByText("该图谱类型不存在，已显示全部类型", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "清除无效筛选", exact: true }).click();
  await expect(page).toHaveURL(/#\/mappings$/);
});

test("新建校验必填与重名，从类型入口带入并真实保存", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await page.goto("#/mappings/new");
  await page.getByRole("button", { name: "创建知识图谱", exact: true }).click();
  await expect(page.getByText("请输入图谱名称", { exact: true })).toBeVisible();
  await expect(page.getByText("请选择图谱类型", { exact: true })).toBeVisible();
  await page.getByLabel(/图谱名称/).fill(topicGraphs[0].name);
  await chooseType(page, "公司关系", page);
  await page.getByRole("button", { name: "创建知识图谱", exact: true }).click();
  await expect(
    page.getByText("已存在同名知识图谱，请使用其他名称"),
  ).toBeVisible();
  await page.goto("#/mappings?type=talent-map");
  await page.getByRole("button", { name: "新建知识图谱", exact: true }).click();
  await expect(formType(page)).toHaveText("人才地图");
  await page.getByLabel(/图谱名称/).fill("机器人核心团队人才地图");
  await page
    .getByLabel("图谱说明", { exact: true })
    .fill("记录团队负责人及关键岗位分布。");
  await page.getByRole("button", { name: "创建知识图谱", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "机器人核心团队人才地图", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".s4-detail-header .s1-status")
      .filter({ hasText: "人才地图" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "机器人核心团队人才地图", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回列表", exact: true }).click();
  await expect(page).toHaveURL(/type=talent-map$/);
  await expect(cards(page)).toHaveCount(2);
  await expect(
    cards(page)
      .filter({ hasText: "机器人核心团队人才地图" })
      .locator(".s4-tag"),
  ).toHaveText("类型：人才地图");
  await check();
});

test("卡片编辑能取消，保存类型后在分类间移动", async ({ page }) => {
  await page.goto("#/mappings?type=talent-map");
  await openEditor(page, topicGraphs[0].name);
  await expect(
    editor(page).getByRole("button", { name: "保存修改", exact: true }),
  ).toBeDisabled();
  await editor(page)
    .getByLabel(/图谱名称/)
    .fill("未保存的名称");
  await editor(page).getByRole("button", { name: "取消", exact: true }).click();
  await expect(cards(page).getByRole("heading")).toHaveText(
    topicGraphs[0].name,
  );
  await openEditor(page, topicGraphs[0].name);
  await editor(page)
    .getByLabel(/图谱名称/)
    .fill("星澜机器人公司关系");
  await chooseType(page, "公司关系", editor(page));
  await saveEditor(page);
  await expect(editor(page)).toHaveCount(0);
  await expect(
    page.getByText("暂无人才地图图谱", { exact: true }),
  ).toBeVisible();
  await chooseType(page, "公司关系");
  await expect(cards(page)).toHaveCount(2);
  const card = cards(page).filter({ hasText: "星澜机器人公司关系" });
  await expect(card.locator(".s4-tag")).toHaveText("类型：公司关系");
  await page.reload();
  await expect(card.locator(".s4-tag")).toHaveText("类型：公司关系");
  await card.getByRole("button", { name: "打开图谱", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "星澜机器人公司关系", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".tg-node")).not.toHaveCount(0);
  await expect(
    page
      .locator(".s4-detail-header .s1-status")
      .filter({ hasText: "公司关系" }),
  ).toBeVisible();
});

test("详情编辑保存并保留图页，选择浮层 Escape 不关闭编辑器", async ({
  page,
}) => {
  await page.goto("#/mappings/mapping-embodied");
  await expandNav(page);
  const nodes = await page.locator(".tg-node").count();
  await page.getByRole("button", { name: "编辑资料", exact: true }).click();
  await formType(editor(page)).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".s4-select-panel")).toHaveCount(0);
  await expect(editor(page)).toBeVisible();
  await expect(formType(editor(page))).toBeFocused();
  await chooseType(page, "候选人关系", editor(page));
  await saveEditor(page);
  await expect(page.locator(".tg-node")).toHaveCount(nodes);
  await expect(
    typeNav(page).getByRole("button", { name: "候选人关系", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.reload();
  await expect(
    page
      .locator(".s4-detail-header .s1-status")
      .filter({ hasText: "候选人关系" }),
  ).toBeVisible();
});

test("返回列表保留搜索和分页，类型切换复位分页", async ({ page }) => {
  await page.goto("#/mappings?q=图谱&page=2");
  await expect(cards(page)).toHaveCount(2);
  const title = await cards(page).first().getByRole("heading").textContent();
  await cards(page)
    .first()
    .getByRole("button", { name: "打开图谱", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回列表", exact: true }).click();
  await expect(page.getByPlaceholder("搜索图谱名称或内容")).toHaveValue("图谱");
  await expect(page.getByText("第 2 / 2 页", { exact: true })).toBeVisible();
  await chooseType(page, "人才地图");
  await expect(cards(page)).toHaveCount(1);
  await expect(page.getByText("第 1 / 1 页", { exact: true })).toBeVisible();
  await expect(page).not.toHaveURL(/page=/);
});

test("编辑保存失败不改原图谱，保留草稿后可重试", async ({ page }) => {
  await page.goto("#/mappings?type=talent-map");
  await openEditor(page, topicGraphs[0].name);
  await editor(page)
    .getByLabel(/图谱名称/)
    .fill("保存失败后重试的图谱");
  await chooseType(page, "公司关系", editor(page));
  await simulateWriteFailure(page, graphStorageKey);
  await saveEditor(page);
  await expect(editor(page).getByText(/图谱保存失败/)).toBeVisible();
  await expect(cards(page).getByRole("heading")).toHaveText(
    topicGraphs[0].name,
  );
  await expect(editor(page).getByLabel(/图谱名称/)).toHaveValue(
    "保存失败后重试的图谱",
  );
  await restoreWrites(page);
  await saveEditor(page);
  await expect(editor(page)).toHaveCount(0);
  await expect(cards(page)).toHaveCount(0);
});

test("新建存储失败不生成半成品，重试只新增一条", async ({ page }) => {
  await page.goto("#/mappings/new?type=talent-map");
  await page.getByLabel(/图谱名称/).fill("新建存储失败检查");
  await simulateWriteFailure(page, graphStorageKey);
  await page.getByRole("button", { name: "创建知识图谱", exact: true }).click();
  await expect(page.getByText(/图谱保存失败/)).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), graphStorageKey),
  ).toBeNull();
  await restoreWrites(page);
  await page.getByRole("button", { name: "创建知识图谱", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "新建存储失败检查", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)).graphs.length,
      graphStorageKey,
    ),
  ).toBe(9);
});

test("图谱资料在同源页面间同步", async ({ page, context }) => {
  await page.goto("#/mappings?type=talent-map");
  const second = await context.newPage();
  await second.goto("#/mappings/mapping-embodied");
  await openEditor(page, topicGraphs[0].name);
  await editor(page)
    .getByLabel(/图谱名称/)
    .fill("同步后的图谱名称");
  await chooseType(page, "人才流动", editor(page));
  await saveEditor(page);
  await expect(
    second.getByRole("heading", { name: "同步后的图谱名称", exact: true }),
  ).toBeVisible();
  await expect(
    second
      .locator(".s4-detail-header .s1-status")
      .filter({ hasText: "人才流动" }),
  ).toBeVisible();
  await second.close();
});

test("删除后离开分类，回收站恢复保留类型并处理重名", async ({ page }) => {
  const name = "类型恢复检查";
  const id = await createGraph(page, name, "行业知识");
  await page.getByRole("button", { name: "删除", exact: true }).click();
  await page
    .getByRole("button", { name: "删除并进入回收站", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/mappings$/);
  await createGraph(page, name, "人才地图");
  await page.goto("#/recycle-bin");
  const row = page
    .locator(".s4-recycle-table > article")
    .filter({ hasText: name });
  await expect(row).toContainText("行业知识");
  await row.getByRole("button", { name: "恢复", exact: true }).click();
  await page.getByRole("button", { name: "确认恢复", exact: true }).click();
  await expect(
    page.getByText("已存在同名知识图谱，请使用其他名称"),
  ).toBeVisible();
  await page.getByLabel(/恢复后的图谱名称/).fill("恢复后行业图谱");
  await page.getByRole("button", { name: "确认恢复", exact: true }).click();
  await expect(row).toHaveCount(0);
  await page.goto(`#/mappings/${id}`);
  await expect(
    page.getByRole("heading", { name: "恢复后行业图谱", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".s4-detail-header .s1-status")
      .filter({ hasText: "行业知识" }),
  ).toBeVisible();
});

test("永久删除不会在刷新后复活示例图谱", async ({ page }) => {
  await page.goto("#/mappings/mapping-embodied");
  await page.getByRole("button", { name: "删除", exact: true }).click();
  await page
    .getByRole("button", { name: "删除并进入回收站", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/mappings$/);
  await page.goto("#/recycle-bin");
  const row = page
    .locator(".s4-recycle-table > article")
    .filter({ hasText: topicGraphs[0].name });
  await row.getByRole("button", { name: "永久删除", exact: true }).click();
  await page.getByRole("button", { name: "确认永久删除", exact: true }).click();
  await page.reload();
  await expect(row).toHaveCount(0);
  await page.goto("#/mappings?type=talent-map");
  await expect(cards(page)).toHaveCount(0);
  await page.goto("#/mappings/mapping-embodied");
  await expect(
    page.getByRole("button", { name: "编辑资料", exact: true }),
  ).toHaveCount(0);
});

test("筛选中的拖拽只调整命中项，隐藏图谱不会丢失", async ({ page }) => {
  await page.goto("#/mappings?q=VLA");
  const firstTitle = await cards(page)
    .nth(0)
    .getByRole("heading")
    .textContent();
  const secondTitle = await cards(page)
    .nth(1)
    .getByRole("heading")
    .textContent();
  const first = cards(page).filter({ hasText: firstTitle });
  const second = cards(page).filter({ hasText: secondTitle });
  const transfer = await page.evaluateHandle(() => new DataTransfer());
  await first.dispatchEvent("dragstart", { dataTransfer: transfer });
  await second.dispatchEvent("dragenter", { dataTransfer: transfer });
  await second.dispatchEvent("drop", { dataTransfer: transfer });
  await first.dispatchEvent("dragend", { dataTransfer: transfer });
  await page.reload();
  await expect(cards(page).nth(0).getByRole("heading")).toHaveText(secondTitle);
  const ids = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hunter-topic-graph-order")),
  );
  expect(new Set(ids).size).toBe(8);
  expect(ids[0]).toBe(topicGraphs[0].id);
  expect(ids[1]).toBe(topicGraphs[1].id);
});

test("快捷类型可配置、全部隐藏、恢复默认，父入口隐藏不留孤立子项", async ({
  page,
}) => {
  await page.goto("#/settings/navigation");
  await expandNav(page);
  await expect(page.getByRole("switch", { name: /^快捷显示/ })).toHaveCount(8);
  await typeSwitch(page, "人才地图").click();
  await typeSwitch(page, "人才流动").click();
  await expect(typeNav(page).getByRole("button")).toHaveText([
    "人才地图",
    "公司关系",
    "候选人关系",
  ]);
  await saveSettings(page);
  await expect(typeNav(page).getByRole("button")).toHaveText([
    "公司关系",
    "候选人关系",
    "人才流动",
  ]);
  await page.reload();
  await expect(typeNav(page).getByRole("button")).toHaveText([
    "公司关系",
    "候选人关系",
    "人才流动",
  ]);
  await page
    .getByRole("switch", { name: "平铺显示知识图谱", exact: true })
    .click();
  await saveSettings(page);
  await expect(typeNav(page)).toHaveCount(0);
  await assetNav(page)
    .getByRole("button", { name: "其他", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "其他资产导航" })
      .getByRole("button", { name: "知识图谱", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("switch", { name: "平铺显示知识图谱", exact: true })
    .click();
  await saveSettings(page);
  await expect(typeNav(page).getByRole("button")).toHaveText([
    "公司关系",
    "候选人关系",
    "人才流动",
  ]);
  for (const label of ["公司关系", "候选人关系", "人才流动"])
    await typeSwitch(page, label).click();
  await saveSettings(page);
  await expect(typeNav(page)).toHaveCount(0);
  await page.getByRole("button", { name: "恢复默认", exact: true }).click();
  await saveSettings(page);
  await expect(typeNav(page).getByRole("button")).toHaveText([
    "人才地图",
    "公司关系",
    "候选人关系",
  ]);
});

test("旧导航偏好升级保留资产显隐，快捷项与资产原子保存并跨页同步", async ({
  page,
  context,
}) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({ version: 1, visibleIds: ["companies", "mappings"] }),
      ),
    assetNavigationKey,
  );
  await page.goto("#/settings/navigation");
  await expandNav(page);
  await expect(assetNav(page).locator(":scope > button")).toHaveText([
    "公司",
    "知识图谱",
    "其他",
  ]);
  await expect(typeNav(page).getByRole("button")).toHaveText([
    "人才地图",
    "公司关系",
    "候选人关系",
  ]);
  const second = await context.newPage();
  await second.goto("#/mappings");
  await typeSwitch(page, "人才流动").click();
  await page.getByRole("switch", { name: "平铺显示论文", exact: true }).click();
  await simulateWriteFailure(page, assetNavigationKey);
  await saveSettings(page);
  await expect(page.getByText(/导航设置保存失败/)).toBeVisible();
  await expect(
    typeNav(page).getByRole("button", { name: "人才流动", exact: true }),
  ).toHaveCount(0);
  await expect(
    assetNav(page).getByRole("button", { name: "论文", exact: true }),
  ).toHaveCount(0);
  await restoreWrites(page);
  await saveSettings(page);
  await expect(
    typeNav(second).getByRole("button", { name: "人才流动", exact: true }),
  ).toBeVisible();
  await expect(
    assetNav(second).getByRole("button", { name: "论文", exact: true }),
  ).toBeVisible();
  await second.close();
});

test("加载、读取失败、空状态和权限受限路径可恢复", async ({ page }) => {
  await page.goto("#/mappings?type=talent-map&state=loading");
  await expect(page.getByLabel("知识图谱正在加载")).toBeVisible();
  await page.goto("#/mappings?type=talent-map&state=error");
  await page.getByRole("button", { name: "重新加载", exact: true }).click();
  await expect(page).toHaveURL(/type=talent-map$/);
  await expect(cards(page)).toHaveCount(1);
  await page.goto("#/mappings?state=permission-limited");
  await expect(page.getByText("当前账号只能查看摘要")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "新建知识图谱", exact: true }),
  ).toBeDisabled();
  await page.goto("#/mappings/new?state=permission-limited");
  await expect(page.getByLabel(/图谱名称/)).toBeDisabled();
  await expect(formType(page)).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "创建知识图谱", exact: true }),
  ).toBeDisabled();
  await page.goto("#/mappings/mapping-embodied?state=permission-limited");
  await expect(
    page.getByRole("button", { name: "编辑资料", exact: true }),
  ).toBeDisabled();
  await page.goto("#/settings/navigation?state=permission-limited");
  for (const control of await page
    .getByRole("switch", { name: /^快捷显示/ })
    .all())
    await expect(control).toBeDisabled();
  await page.goto("#/mappings?state=empty");
  await expect(page.getByText("还没有知识图谱", { exact: true })).toBeVisible();
});

test("损坏的图谱数据安全回退，合法空数组保持为空", async ({ page }) => {
  await page.goto("#/mappings");
  await page.evaluate(
    (key) => localStorage.setItem(key, "{invalid"),
    graphStorageKey,
  );
  await page.reload();
  await expect(cards(page)).toHaveCount(6);
  await page.evaluate(
    (key) =>
      localStorage.setItem(key, JSON.stringify({ version: 1, graphs: [] })),
    graphStorageKey,
  );
  await page.reload();
  await expect(cards(page)).toHaveCount(0);
  await expect(page.getByText("还没有知识图谱", { exact: true })).toBeVisible();
});

test("默认桌面导航免滚动，子项层级及用户菜单用量符合公共样式", async ({
  page,
}) => {
  const check = trackConsoleErrors(page);
  await mkdir("artifacts/graph-types/after", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/mappings?type=talent-map");
  await expandNav(page);
  for (const height of [900, 768, 720, 700]) {
    await page.setViewportSize({ width: 1440, height });
    const dimensions = await page
      .locator(".s1-sidebar-scroll")
      .evaluate((element) => ({
        client: element.clientHeight,
        scroll: element.scrollHeight,
      }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
    await expect(
      page.getByRole("button", { name: "打开数据管理", exact: true }),
    ).toBeInViewport();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `artifacts/graph-types/after/navigation-${height}.png`,
      animations: "disabled",
    });
  }
  const selected = typeNav(page).getByRole("button", {
    name: "人才地图",
    exact: true,
  });
  const normal = typeNav(page).getByRole("button", {
    name: "公司关系",
    exact: true,
  });
  await expect(selected).toHaveCSS("font-size", "13px");
  await expect(normal).toHaveCSS("font-size", "13px");
  await expect(selected).toHaveCSS("color", "rgb(11, 79, 163)");
  await expect(normal).toHaveCSS(
    "color",
    await page
      .locator(".s1-sidebar-toggle")
      .evaluate((node) => getComputedStyle(node).color),
  );
  const parentLabel = await assetNav(page)
    .getByRole("button", { name: "知识图谱", exact: true })
    .locator(":scope > span")
    .last()
    .boundingBox();
  const childBox = await selected.boundingBox();
  expect(childBox.x + 10).toBeGreaterThan(parentLabel.x + 8);
  await expect(page.locator(".s1-sidebar-foot > .s1-usage-entry")).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "打开用户菜单", exact: true }).click();
  const menu = page.getByRole("menu", { name: "用户菜单", exact: true });
  await expect(
    menu.getByRole("menuitem", { name: /查看 Agent 用量/ }),
  ).toBeVisible();
  await expect(menu).toBeInViewport();
  await page.screenshot({
    path: "artifacts/graph-types/after/account-usage-menu.png",
    animations: "disabled",
  });
  await menu.getByRole("menuitem", { name: /查看 Agent 用量/ }).click();
  await expect(menu).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "Agent 用量", exact: true }),
  ).toBeVisible();
  const usage = page.getByRole("dialog", { name: "Agent 用量", exact: true });
  await expect(usage.locator("dt")).toHaveText(["已用量", "到期日期"]);
  await expect(usage.locator("dd")).toHaveText(["64%", "2026-08-31"]);
  await expect(usage.getByText("本月任务")).toHaveCount(0);
  await page.screenshot({
    path: "artifacts/graph-types/after/usage-summary.png",
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "查看订阅与用量", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/settings\/subscription$/);
  await check();
});

test("窄屏和深色的类型筛选、新建、编辑、设置截图", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await mkdir("artifacts/graph-types/after", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("#/mappings?type=talent-map");
    await expect(cards(page)).toHaveCount(1);
    await page.screenshot({
      path: `artifacts/graph-types/after/list-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await openEditor(page, topicGraphs[0].name);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `artifacts/graph-types/after/editor-${width}.png`,
      animations: "disabled",
    });
    await editor(page)
      .getByRole("button", { name: "取消", exact: true })
      .click();
    await page.goto("#/mappings/new?type=talent-map");
    await expect(formType(page)).toHaveText("人才地图");
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `artifacts/graph-types/after/create-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.goto("#/settings/navigation");
    await expect(page.getByRole("switch", { name: /^快捷显示/ })).toHaveCount(
      8,
    );
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `artifacts/graph-types/after/settings-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/mappings?type=talent-map");
  await expandNav(page);
  await page.getByRole("button", { name: "切换深色模式", exact: true }).click();
  await openEditor(page, topicGraphs[0].name);
  await formType(editor(page)).click();
  await expect(page.locator(".s4-select-panel")).toHaveCSS(
    "background-color",
    "rgb(26, 26, 26)",
  );
  await page.screenshot({
    path: "artifacts/graph-types/after/dark-type-editor.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(editor(page)).toBeVisible();
  await check();
});

test("手机端可以完成创建与类型修改，不增加底部导航入口", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await createGraph(page, "手机创建图谱", "人才地图");
  await page.getByRole("button", { name: "编辑资料", exact: true }).click();
  await chooseType(page, "人才流动", editor(page));
  await saveEditor(page);
  await page.getByRole("button", { name: "返回列表", exact: true }).click();
  await chooseType(page, "人才流动");
  await expect(cards(page).filter({ hasText: "手机创建图谱" })).toBeVisible();
  await expect(page.locator(".s1-mobile-tabs > button")).toHaveCount(5);
  await expect(typeNav(page)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await check();
});
