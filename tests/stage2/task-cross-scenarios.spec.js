import { expect, test } from "@playwright/test";

const input = page => page.getByRole("textbox", { name: "任务对话输入" });
const send = async (page, text) => { await input(page).fill(text); await input(page).press("Enter"); };
const state = page => page.evaluate(() => JSON.parse(localStorage.getItem("hunter-opportunity-lifecycle-v1")));
const pipeline = snapshot => snapshot.positions.find(position => position.id === "position-vla").pipeline;
test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on("pageerror", error => page.__errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") page.__errors.push(message.text()); });
  await page.route("**/*", async route => {
    const request = route.request(), url = new URL(request.url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname) && !["data:", "blob:"].includes(url.protocol)) { page.__errors.push("external request"); return route.abort(); }
    if (!["GET", "HEAD"].includes(request.method())) { page.__errors.push("HTTP write"); return route.abort(); }
    await route.continue();
  });
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

for (const width of [1440, 390]) test(`动态招聘 ${width}px：未知范围不跳过，取消不写，确认才写`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto("#/new?positionId=position-vla");
  await send(page, "为当前岗位整理人选，不要联系。");
  await page.getByRole("button", { name: "查看人选结果", exact: true }).click();
  const pane = page.getByRole("complementary", { name: "人选结果", exact: true });
  await expect(pane.getByRole("checkbox")).toHaveCount(0);
  if (width === 390) await pane.getByRole("button", { name: "关闭结果", exact: true }).click();
  const before = await state(page);
  await send(page, "将林昊、未知人选加入岗位储备");
  await expect(page.locator(".s2-task-timeline")).toContainText("未知对象不跳过");
  await expect(page.getByRole("heading", { name: "待确认的岗位储备范围" })).toHaveCount(0);
  await send(page, "将林昊、赵星羽加入岗位储备");
  await expect(page.getByRole("heading", { name: "待确认的岗位储备范围" })).toBeVisible();
  expect(pipeline(await state(page))).toEqual(pipeline(before));
  await send(page, "取消");
  expect(pipeline(await state(page))).toEqual(pipeline(before));
  await send(page, "将林昊、赵星羽加入岗位储备");
  await send(page, "确认");
  await expect(page.locator(".s2-task-timeline")).toContainText("已将 林昊、赵星羽 加入岗位储备");
  const after = await state(page);
  expect(pipeline(after).some(entry => entry.candidateId === "candidate-linhao")).toBe(true);
  await send(page, "确认");
  expect(pipeline(await state(page))).toEqual(pipeline(after));
});

test("动态招聘仅分析不允许入储备", async ({ page }) => {
  await page.goto("#/new?positionId=position-vla");
  await send(page, "为当前岗位整理人选，不要联系。");
  await expect(page.getByRole("heading", { name: "人选结果已整理" })).toBeVisible();
  await page.locator(".s2-auth-select > button").click();
  await page.getByRole("option", { name: /^仅分析/ }).click();
  const before = await state(page);
  await send(page, "将林昊加入岗位储备"); await send(page, "确认");
  expect(pipeline(await state(page))).toEqual(pipeline(before));
  await expect(page.locator(".s2-task-timeline")).toContainText("仅分析");
});

test("历史读取失败重试不清空输入", async ({ page }) => {
  await page.goto("#/tasks?state=error");
  await input(page).fill("先核对最近的任务");
  await page.getByRole("button", { name: /重新加载|重试/ }).first().click();
  await expect(input(page)).toHaveValue("先核对最近的任务");
  await expect(page.getByText("任务列表读取失败", { exact: true })).toHaveCount(0);
});
