import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

const route = "#/mappings/mapping-embodied?tab=reviews";
const coordinates = page => page.locator(".tg-node").evaluateAll(nodes => nodes.map(node => [node.dataset.nodeId, node.dataset.worldX, node.dataset.worldY]));
async function transform(stage) {
  return stage.evaluate(node => { const m = new DOMMatrix(getComputedStyle(node).transform); return { x: m.e, y: m.f, zoom: m.a }; });
}
async function blank(viewport) {
  return viewport.evaluate(node => {
    const r = node.getBoundingClientRect();
    for (let y = 45; y < Math.min(r.height - 20, innerHeight - r.y - 20); y += 40) for (let x = 25; x < r.width - 100; x += 40) {
      const target = document.elementFromPoint(r.x + x, r.y + y);
      if (node.contains(target) && !target.closest(".tg-node,.tg-edge,.graph-edge-handle,.tg-presentation-controls")) return { x: r.x + x, y: r.y + y };
    }
    return null;
  });
}
async function drag(page, start, dx = 45, dy = 25) {
  expect(start).not.toBeNull();
  await page.mouse.move(start.x, start.y); await page.mouse.down();
  await page.mouse.move(start.x + dx, start.y + dy, { steps: 8 }); await page.mouse.up();
}
async function anchor(stage, point) {
  return stage.evaluate((node, p) => { const r = node.getBoundingClientRect(), z = new DOMMatrix(getComputedStyle(node).transform).a; return { x: (p.x - r.left) / z + Number(node.dataset.originX || 0), y: (p.y - r.top) / z + Number(node.dataset.originY || 0) }; }, point);
}

for (const width of [1440, 926]) test(width + "px 审核画布从空白和节点平移，滚轮与触控板保持鼠标锚点且不写入", async ({ page }, info) => {
  const noErrors = trackConsoleErrors(page), writes = [];
  page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url()); });
  await page.setViewportSize({ width, height: 1100 });
  await page.goto(route);
  const viewport = page.locator(".tg-review-canvas .tg-canvas-scroll"), stage = viewport.locator(".tg-canvas-stage");
  await expect(viewport).toBeVisible();
  await page.getByRole("button", { name: "自适应审核画布", exact: true }).click();
  const initialCoordinates = await coordinates(page), stored = await page.evaluate(() => JSON.stringify(localStorage));
  let before = await transform(stage);
  await drag(page, await blank(viewport));
  await expect.poll(() => transform(stage)).not.toEqual(before);
  const node = page.locator('.tg-node[data-node-id="org-xinglan"]');
  const box = await node.boundingBox(), point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  before = await transform(stage);
  await drag(page, point);
  await expect.poll(() => transform(stage)).not.toEqual(before);
  const current = await node.boundingBox(), wheelPoint = { x: Math.round(current.x + current.width / 2), y: Math.round(current.y + current.height / 2) };
  const a = await anchor(stage, wheelPoint), oldZoom = (await transform(stage)).zoom;
  await page.mouse.move(wheelPoint.x, wheelPoint.y); await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await transform(stage)).zoom).toBeGreaterThan(oldZoom);
  let b = await anchor(stage, wheelPoint);
  expect(b.x).toBeCloseTo(a.x, 2); expect(b.y).toBeCloseTo(a.y, 2);
  const zoom = (await transform(stage)).zoom;
  await page.keyboard.down("Control"); await page.mouse.wheel(0, 8); await page.keyboard.up("Control");
  await expect.poll(async () => (await transform(stage)).zoom).toBeLessThan(zoom);
  b = await anchor(stage, wheelPoint); expect(b.x).toBeCloseTo(a.x, 2); expect(b.y).toBeCloseTo(a.y, 2);
  await page.getByRole("button", { name: "放大审核画布", exact: true }).click();
  await page.getByRole("button", { name: "缩小审核画布", exact: true }).click();
  await page.getByRole("button", { name: "自适应审核画布", exact: true }).click();
  expect(await coordinates(page)).toEqual(initialCoordinates);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(stored);
  const frameBox = await page.locator(".tg-review-canvas").boundingBox(), viewBox = await viewport.boundingBox();
  expect(viewBox.y + viewBox.height).toBeLessThanOrEqual(frameBox.y + frameBox.height + 1);
  await node.dblclick(); await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".graph-edge-handle, .graph-node-port")).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("review-camera.png"), fullPage: true });
  await page.getByRole("button", { name: "进入审核画布全屏", exact: true }).click();
  await page.getByRole("button", { name: "自适应审核画布", exact: true }).click();
  before = await transform(stage); await drag(page, await blank(viewport));
  await expect.poll(() => transform(stage)).not.toEqual(before);
  await page.screenshot({ path: info.outputPath("review-fullscreen.png") });
  await page.getByRole("button", { name: "退出审核画布全屏", exact: true }).click();
  expect(await coordinates(page)).toEqual(initialCoordinates);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(stored);
  await expectNoHorizontalOverflow(page); expect(writes).toEqual([]); await noErrors();
});

test("审核切换目标后仍可平移和缩放，历史画布只读能力不退化", async ({ page }) => {
  const noErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1100 }); await page.goto(route);
  await page.locator(".tg-review-list > button").last().click();
  const canvas = page.locator(".tg-review-canvas"), viewport = canvas.locator(".tg-canvas-scroll"), stage = canvas.locator(".tg-canvas-stage");
  await expect(page.locator(".tg-review-detail h2")).toContainText("何静");
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  let before = await transform(stage); await drag(page, await blank(viewport)); await expect.poll(() => transform(stage)).not.toEqual(before);
  await page.getByRole("button", { name: "缩小审核画布", exact: true }).click();
  await page.getByRole("tab", { name: "版本记录", exact: true }).click();
  const historyStage = page.locator(".tg-history-preview-canvas .tg-canvas-stage");
  const root = page.locator(".tg-history-preview-canvas .tg-node").first(), box = await root.boundingBox();
  before = await transform(historyStage); await drag(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  await expect.poll(() => transform(historyStage)).not.toEqual(before);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(stored); await noErrors();
});
