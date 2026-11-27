import { test, expect } from "@playwright/test";
import { topicGraphs } from "../../src/stage4/topic-graph-data";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

const graphKey = "hunter-topic-graphs-v1";
const card = page => page.locator(".tg-graph-card").filter({ has: page.getByRole("heading", { name: "1201 节点压力测试图谱", exact: true }) });

for (const width of [1440, 871]) test(`${width}px 压力图谱作为普通卡片打开、编辑和保存`, async ({ page }, info) => {
  const noErrors = trackConsoleErrors(page);
  const writes = [];
  page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url()); });
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("#/mappings");
  await expect(card(page)).toHaveCount(1);
  await expect(card(page)).toContainText("1201");
  await page.screenshot({ path: info.outputPath("ordinary-list.png"), fullPage: true });
  await card(page).getByRole("button", { name: "打开图谱", exact: true }).click();
  await expect(page).toHaveURL(/#\/mappings\/mapping-stress$/);
  await expect(page.locator(".tg-node")).toHaveCount(1201);
  await expect(page.locator(".tg-edge")).toHaveCount(1280);
  await expect(page.getByRole("button", { name: "编辑资料", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "自适应全部内容", exact: true }).click();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: info.outputPath("ordinary-stress-graph.png"), fullPage: true });
  await page.locator('.tg-node[data-node-id="org-xinglan"]').dblclick();
  const dialog = page.getByRole("dialog", { name: "编辑节点", exact: true });
  await dialog.locator(".s4-form-field", { hasText: "节点名称" }).locator("input").fill("压力测试组织（已编辑）");
  await dialog.getByRole("button", { name: "保存修改", exact: true }).click();
  await page.reload();
  await expect(page.locator('.tg-node[data-node-id="org-xinglan"]')).toContainText("压力测试组织（已编辑）");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).graphs.find(graph => graph.id === "mapping-embodied").name, graphKey)).toBe(topicGraphs[0].name);
  expect(writes).toEqual([]);
  await noErrors();
});

test("旧原型会话补入普通样例，但不会覆盖已有图谱或复活删除记录", async ({ page }) => {
  await page.goto("#/mappings");
  const old = topicGraphs.filter(graph => graph.id !== "mapping-stress").map(graph => graph.id === "mapping-embodied" ? { ...graph, name: "用户已修改的地图" } : graph);
  await page.evaluate(({ key, graphs }) => localStorage.setItem(key, JSON.stringify({ version: 1, graphs })), { key: graphKey, graphs: old });
  await page.reload();
  await expect(card(page)).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "用户已修改的地图", exact: true })).toBeVisible();
  await card(page).getByRole("button", { name: "更多操作：1201 节点压力测试图谱", exact: true }).click();
  await page.getByRole("button", { name: "删除知识图谱", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "删除并进入回收站", exact: true }).click();
  await expect(card(page)).toHaveCount(0);
  await page.reload();
  await expect(card(page)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "用户已修改的地图", exact: true })).toBeVisible();
});
