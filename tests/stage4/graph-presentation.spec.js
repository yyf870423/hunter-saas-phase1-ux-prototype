import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";
import { createOpportunitySeed } from "../../src/stage4/opportunity-seed.js";
import { candidates } from "../../src/stage4/data.js";

async function choose(canvas, label, option) {
  const page = canvas.page();
  if (label === "自动布局") {
    await page.getByRole("button", { name: "布局", exact: true }).click();
    await page.getByRole("menuitem", { name: option === "左右布局" ? "左右重排" : "上下重排", exact: true }).click();
  } else {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.locator(".s4-select-panel").getByRole("button", { name: option, exact: true }).click();
  }
}
async function positions(canvas, selector) {
  return canvas.locator(selector).evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.nodeId, x: Number.parseFloat(node.style.left), y: Number.parseFloat(node.style.top), width: node.offsetWidth, height: node.offsetHeight })));
}
function assertNoOverlap(nodes) {
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y, `${a.id}/${b.id}`).toBe(true);
  }
}
function assertBothSides(nodes, direction) {
  const root = nodes.find(node => node.id === "org-xinglan"), branches = nodes.filter(node => /org-center|dense-department-/.test(node.id));
  const axis = direction === "LR" ? "x" : "y";
  expect(branches.some(node => node[axis] < root[axis])).toBe(true);
  expect(branches.some(node => node[axis] > root[axis])).toBe(true);
}
async function hoverStroke(page, line) {
  const point = await line.evaluate(path => {
    const value = path.getPointAtLength(path.getTotalLength() * 0.4).matrixTransform(path.getScreenCTM());
    return { x: value.x, y: value.y };
  });
  await page.mouse.move(point.x, point.y);
}

for (const width of [1440, 390]) test(`${width}px 密集图双侧展开、两种线形及隐藏撤销`, async ({ page }, testInfo) => {
  const noErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("#/mappings/mapping-embodied?tab=content&sample=dense");
  await expect(page.locator(".tg-detail-panel")).toHaveCount(0);
  const canvas = page.locator(".tg-canvas-frame");
  await expect(canvas.locator(".tg-node")).toHaveCount(85);
  await expect(canvas.locator(".tg-edge")).toHaveCount(100);
  await page.mouse.move(1, 1);
  await expect(canvas.locator(".tg-edge-label-button")).toHaveCount(0);
  const original = await positions(canvas, ".tg-node");
  await choose(canvas, "自动布局", "左右布局");
  const horizontal = await positions(canvas, ".tg-node");
  assertNoOverlap(horizontal);
  assertBothSides(horizontal, "LR");
  expect(horizontal).not.toEqual(original);
  await choose(canvas, "连线样式", "直角线");
  await expect(canvas.locator(".tg-edge-line").first()).toHaveAttribute("d", /L/);
  await page.mouse.move(1, 1);
  await page.screenshot({ path: testInfo.outputPath("dense-left-right.png") });
  await choose(canvas, "自动布局", "上下布局");
  assertNoOverlap(await positions(canvas, ".tg-node"));
  const vertical = await positions(canvas, ".tg-node");
  assertBothSides(vertical, "TB");
  await page.mouse.move(1, 1);
  await page.screenshot({ path: testInfo.outputPath("dense-top-bottom.png") });
  await expect(canvas.getByRole("button", { name: "撤销自动布局", exact: true })).toHaveCount(0);
  const root = await canvas.locator('.tg-node[data-node-id="org-xinglan"]').boundingBox();
  const viewport = await canvas.locator(".tg-canvas-scroll").boundingBox();
  expect(root.x + root.width / 2).toBeCloseTo(viewport.x + viewport.width / 2, 0);
  expect(root.y + root.height / 2).toBeCloseTo(viewport.y + viewport.height / 2, 0);
  await expectNoHorizontalOverflow(page);
  await noErrors();
});

test("知识图谱只悬停显示一条关系，选中、键盘或移开不使标注常驻", async ({ page }) => {
  const noErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?tab=content");
  await expect(page.locator(".tg-detail-panel")).toHaveCount(0);
  const canvas = page.locator(".tg-canvas-frame");
  const edge = canvas.locator(".tg-edge-hit").first();
  await hoverStroke(page, edge);
  await expect(canvas.locator(".tg-edge-label-button")).toHaveCount(1);
  await page.mouse.move(1, 1);
  await expect(canvas.locator(".tg-edge-label-button")).toHaveCount(0);
  await edge.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".tg-detail-panel")).toBeVisible();
  await expect(canvas.locator(".tg-edge-label-button")).toHaveCount(0);
  await noErrors();
});

for (const tab of ["reviews", "history"]) test(`${tab} 只读画布可以预览布局，不改原始图页或存储`, async ({ page }, testInfo) => {
  test.skip(true, "2026-11-27 审核与版本入口暂时隐藏，保留用例待重新设计");
  const noErrors = trackConsoleErrors(page);
  await page.goto(`#/mappings/mapping-embodied?tab=${tab}`);
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  const canvas = page.locator(".tg-canvas-frame");
  const original = await positions(canvas, ".tg-node");
  await choose(canvas, "自动布局", "上下布局");
  expect(await positions(canvas, ".tg-node")).not.toEqual(original);
  assertNoOverlap(await positions(canvas, ".tg-node"));
  await choose(canvas, "连线样式", "直角线");
  if (tab === "reviews") {
    const focused = await canvas.locator('.tg-node[data-node-id="org-wang"]').boundingBox();
    const viewport = await canvas.locator(".tg-canvas-scroll").boundingBox();
    expect(focused.x).toBeGreaterThanOrEqual(viewport.x);
    expect(focused.y).toBeGreaterThanOrEqual(viewport.y);
    expect(focused.x + focused.width).toBeLessThanOrEqual(viewport.x + viewport.width);
    expect(focused.y + focused.height).toBeLessThanOrEqual(viewport.y + viewport.height);
  }
  await page.screenshot({ path: testInfo.outputPath(`${tab}.png`) });
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  await expect(canvas.getByRole("button", { name: "撤销自动布局", exact: true })).toHaveCount(0);
  await noErrors();
});

for (const width of [1440, 390]) test(`${width}px 任务只读组织结果应用共享控件且不产生业务动作`, async ({ page }, testInfo) => {
  const noErrors = trackConsoleErrors(page);
  const writes = [];
  page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) writes.push(request.method()); });
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("#/tasks/mapping-embodied?state=gaps");
  await page.getByRole("button", { name: "查看组织梳理结果", exact: true }).click();
  await page.getByRole("tab", { name: "组织关系", exact: true }).click();
  const canvas = page.locator(".s3-relationship-workspace");
  await expect(canvas.getByRole("button", { name: "连线样式", exact: true })).toBeVisible();
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  await choose(canvas, "自动布局", "上下布局");
  await choose(canvas, "连线样式", "直角线");
  assertNoOverlap(await positions(canvas, ".s3-relationship-node"));
  await page.mouse.move(1, 1);
  await expect(canvas.locator(".s3-relationship-edge-label")).toHaveCount(0);
  await expect(canvas.getByRole("button", { name: "撤销自动布局", exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("task-readonly.png") });
  await expect(canvas.getByRole("button", { name: /保存|提交|确认.*写入/ })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  expect(writes).toEqual([]);
  await expectNoHorizontalOverflow(page);
  await noErrors();
});

test("联系人画布共享悬停规则、线形和布局，选择后标签仍不常驻", async ({ page }, testInfo) => {
  const noErrors = trackConsoleErrors(page);
  await page.goto("#/companies/company-xinglan/contacts/contact-chenyu?tab=contact-path");
  const canvas = page.locator(".s3-relationship-workspace");
  await expect(canvas).toBeVisible();
  await page.mouse.move(1, 1);
  await expect(canvas.locator(".s3-relationship-edge-label")).toHaveCount(0);
  const line = canvas.locator(".s3-edge-hit").first();
  await hoverStroke(page, line);
  await expect(canvas.locator(".s3-relationship-edge-label")).toHaveCount(1);
  await page.mouse.move(1, 1);
  await expect(canvas.locator(".s3-relationship-edge-label")).toHaveCount(0);
  await choose(canvas, "连线样式", "直角线");
  await choose(canvas, "自动布局", "左右布局");
  assertNoOverlap(await positions(canvas, ".s3-relationship-node"));
  await page.screenshot({ path: testInfo.outputPath("contact-path.png") });
  await noErrors();
});

for (const surface of ["company", "candidate", "position"]) for (const width of [1440, 390]) test(`${surface} ${width}px 实际资产入口提供统一连线和布局`, async ({ page }, testInfo) => {
  const noErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width, height: 1000 });
  if (surface === "position") {
    const seed = createOpportunitySeed();
    const position = seed.positions.find(item => item.id === "position-vla");
    position.talentMap = { version: 1, rows: candidates.slice(0, 8).map(item => ({ id: item.id, name: item.name, company: item.company, title: item.title, basis: "隔离验收样例", source: "虚构样例" })), sources: [] };
    await page.addInitScript(seed => localStorage.setItem("hunter-opportunity-lifecycle-v1", JSON.stringify(seed)), seed);
    await page.goto("#/positions/position-vla?tab=talent-map");
    await page.getByRole("tab", { name: "关系图", exact: true }).click();
  } else {
    await page.goto(surface === "company" ? "#/companies/company-xinglan?tab=mappings" : "#/candidates/candidate-linhao?tab=contact-path");
    const title = surface === "company" ? "创建公司关系与人才流动" : "创建联系路径";
    await page.getByRole("button", { name: title, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: title, exact: true });
    await dialog.getByPlaceholder(/说明目标、关注范围/).fill("仅为本地原型验证展示效果，不联系任何人。");
    await dialog.getByRole("button", { name: "开始创建", exact: true }).click();
  }
  const canvas = page.locator(".s3-relationship-workspace");
  await expect(canvas).toBeVisible();
  const original = await positions(canvas, ".s3-relationship-node");
  await choose(canvas, "连线样式", "直角线");
  await choose(canvas, "自动布局", "上下布局");
  assertNoOverlap(await positions(canvas, ".s3-relationship-node"));
  await page.mouse.move(1, 1);
  await expect(canvas.locator(".s3-relationship-edge-label")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath(`${surface}.png`) });
  await canvas.locator(".s3-relationship-node").first().click();
  await expect(canvas.getByRole("button", { name: "撤销自动布局", exact: true })).toHaveCount(0);
  expect(await positions(canvas, ".s3-relationship-node")).not.toEqual(original);
  await expectNoHorizontalOverflow(page);
  await noErrors();
});

test("触屏点击连线查看关系详情，不残留悬停标注", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, baseURL });
  try {
    const page = await context.newPage(), noErrors = trackConsoleErrors(page);
    await page.goto("#/mappings/mapping-embodied?tab=content");
    await expect(page.locator(".tg-detail-panel")).toHaveCount(0);
    const canvas = page.locator(".tg-canvas-frame"), line = canvas.locator(".tg-edge-hit").first();
    await page.getByRole("button", { name: "进入图谱全屏", exact: true }).click();
    await expect(canvas.locator(".tg-node").first()).toBeVisible();
    await line.scrollIntoViewIfNeeded();
    const point = await line.evaluate(path => {
      for (const fraction of [.5, .3, .7, .15, .85]) {
        const p = path.getPointAtLength(path.getTotalLength() * fraction).matrixTransform(path.getScreenCTM());
        if (document.elementFromPoint(p.x, p.y)?.closest(".tg-edge") === path.closest(".tg-edge")) return { x: p.x, y: p.y };
      }
      return null;
    });
    expect(point).not.toBeNull();
    await page.touchscreen.tap(point.x, point.y);
    await expect(page.locator(".tg-detail-panel")).toBeVisible();
    await expect(canvas.locator(".tg-edge-label-button")).toHaveCount(0);
    await noErrors();
  } finally { await context.close(); }
});
