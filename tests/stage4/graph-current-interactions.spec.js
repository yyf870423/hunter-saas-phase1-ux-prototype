import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

const route = "#/mappings/mapping-embodied?tab=content";
const nameField = dialog => dialog.locator(".s4-form-field", { hasText: "节点名称" }).locator("input");
const positions = page => page.locator(".tg-node").evaluateAll(nodes => nodes.map(node => [node.dataset.nodeId, node.dataset.worldX, node.dataset.worldY]));
async function runLayout(page, name) {
  await page.getByRole("button", { name: "布局", exact: true }).click();
  await page.getByRole("menuitem", { name, exact: true }).click();
}
async function strokePoint(line) {
  return line.evaluate(path => {
    for (const fraction of [.5, .3, .7, .15, .85]) {
      const p = path.getPointAtLength(path.getTotalLength() * fraction).matrixTransform(path.getScreenCTM());
      if (document.elementFromPoint(p.x, p.y)?.closest(".tg-edge") === path.closest(".tg-edge")) return { x: p.x, y: p.y };
    }
    return null;
  });
}

test("节点选中、双击编辑、空白新增、撤销重做与快捷键", async ({ page }, info) => {
  const noErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route);
  const root = page.locator('.tg-node[data-node-id="org-xinglan"]');
  await root.click();
  await expect(page.locator(".tg-detail-panel")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "隐藏内容", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "添加关系", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "查看图谱快捷键", exact: true }).click();
  await expect(page.locator(".tg-shortcut-panel")).toContainText("双击空白处");
  await expect(page.locator(".tg-shortcut-panel")).toContainText("⌘Shift+Z");
  await page.getByRole("button", { name: "收起图谱快捷键", exact: true }).click();
  await root.dblclick();
  const editor = page.getByRole("dialog", { name: "编辑节点", exact: true });
  await nameField(editor).fill("原型验收节点");
  await editor.getByRole("button", { name: "保存修改", exact: true }).click();
  await expect(root).toContainText("原型验收节点");
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await expect(root).toContainText("星澜机器人");
  await page.getByRole("button", { name: "重做", exact: true }).click();
  await expect(root).toContainText("原型验收节点");
  await page.keyboard.press("Control+z");
  await expect(root).toContainText("星澜机器人");
  await page.keyboard.press("Control+Shift+z");
  await expect(root).toContainText("原型验收节点");
  const viewport = await page.locator(".tg-canvas-scroll").boundingBox();
  await page.mouse.dblclick(viewport.x + 34, viewport.y + 65);
  const add = page.getByRole("dialog", { name: "添加节点", exact: true });
  await nameField(add).fill("空白处新增节点");
  await add.getByRole("button", { name: "添加节点", exact: true }).click();
  await expect(page.locator(".tg-node")).toHaveCount(9);
  await page.keyboard.press("Meta+z");
  await expect(page.locator(".tg-node")).toHaveCount(8);
  await page.keyboard.press("Meta+Shift+z");
  await expect(page.locator(".tg-node")).toHaveCount(9);
  await page.screenshot({ path: info.outputPath("interaction.png") });
  await noErrors();
});

test("导入自动命名、手填保护、间距、标签名称与远坐标自适应", async ({ page }, info) => {
  const noErrors = trackConsoleErrors(page);
  const writes = [];
  page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route);
  await page.getByRole("button", { name: "导入图页", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "导入图页", exact: true });
  const field = dialog.getByRole("textbox", { name: "图页名称", exact: true });
  await dialog.locator('input[type="file"]').setInputFiles({ name: "研发组织.v2.mm", mimeType: "application/xml", buffer: Buffer.from("<map/>") });
  await expect(field).toHaveValue("研发组织.v2");
  const fieldBox = await field.boundingBox(), uploadBox = await dialog.locator(".s4-file-drop").boundingBox();
  expect(uploadBox.y - fieldBox.y - fieldBox.height).toBeGreaterThanOrEqual(11.5);
  await field.fill("我指定的图页");
  await dialog.locator('input[type="file"]').setInputFiles({ name: "其他文件.md", mimeType: "text/markdown", buffer: Buffer.from("# 示例") });
  await expect(field).toHaveValue("我指定的图页");
  await page.screenshot({ path: info.outputPath("import.png") });
  await dialog.getByRole("button", { name: "导入", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".tg-page-strip span.is-active")).toContainText("我指定的图页");
  await expect(page.locator(".tg-node")).toHaveCount(7);
  const visible = await page.locator(".tg-canvas-scroll").evaluate(viewport => {
    const box = viewport.getBoundingClientRect();
    return [...viewport.querySelectorAll(".tg-node")].every(node => { const n = node.getBoundingClientRect(); return n.left >= box.left && n.top >= box.top && n.right <= box.right && n.bottom <= box.bottom; });
  });
  expect(visible).toBe(true);
  await page.screenshot({ path: info.outputPath("imported.png") });
  expect(writes).toEqual([]);
  await noErrors();
});

test("布局是一次性命令、内容与整次布局一键撤销、左侧按钮间距", async ({ page }, info) => {
  const noErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route);
  const before = await positions(page);
  await runLayout(page, "上下重排");
  await expect.poll(() => positions(page)).not.toEqual(before);
  await expect(page.getByRole("menu", { name: "布局", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await expect.poll(() => positions(page)).toEqual(before);
  await page.getByRole("button", { name: "重做", exact: true }).click();
  const group = page.locator(".graph-camera-controls");
  expect(await group.evaluate(node => getComputedStyle(node).gap)).toBe("12px");
  expect(await group.locator(".graph-history-controls").evaluate(node => getComputedStyle(node).gap)).toBe("6px");
  await page.screenshot({ path: info.outputPath("layout.png") });
  await noErrors();
});

test("未选中的连线悬停即可拖动端点，预览使用真实曲线", async ({ page }, info) => {
  const noErrors = trackConsoleErrors(page);
  await page.goto(route);
  const line = page.locator(".tg-edge-hit").first();
  const point = await strokePoint(line);
  expect(point).not.toBeNull();
  await page.mouse.move(point.x, point.y);
  const handle = page.getByRole("button", { name: "调整连线终点", exact: true });
  await expect(handle).toBeVisible();
  await expect(line.locator("..")).not.toHaveClass(/is-selected/);
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(point.x + 65, point.y + 90, { steps: 5 });
  await expect(page.locator(".graph-reconnect-draft")).toHaveAttribute("d", /C|Q/);
  await page.screenshot({ path: info.outputPath("reconnect.png") });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator(".graph-reconnect-draft")).toHaveCount(0);
  await noErrors();
});

test("撤销最多20步、新编辑清空重做、原生文本撤销不改画布", async ({ page }) => {
  await page.goto(route);
  for (let index = 0; index < 21; index++) {
    await page.getByRole("button", { name: "连线样式", exact: true }).click();
    await page.locator(".s4-select-panel").getByRole("button", { name: index % 2 ? "自然曲线" : "直角线", exact: true }).click();
  }
  for (let index = 0; index < 20; index++) await page.getByRole("button", { name: "撤销", exact: true }).click();
  await expect(page.getByRole("button", { name: "撤销", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "重做", exact: true })).toBeEnabled();
  await runLayout(page, "上下重排");
  await expect(page.getByRole("button", { name: "重做", exact: true })).toBeDisabled();
  const before = await positions(page);
  await page.getByRole("button", { name: "添加节点", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "添加节点", exact: true });
  await nameField(dialog).pressSequentially("temporary input");
  await nameField(dialog).press("Control+z");
  expect(await positions(page)).toEqual(before);
  await dialog.getByRole("button", { name: "取消", exact: true }).click();
});

test("资产关系画布的布局撤销重做与左侧工具栏", async ({ page }, info) => {
  const noErrors = trackConsoleErrors(page);
  await page.goto("#/companies/company-xinglan/contacts/contact-chenyu?tab=contact-path");
  const canvas = page.locator(".s3-relationship-workspace");
  const positions = () => canvas.locator(".s3-relationship-node").evaluateAll(nodes => nodes.map(n => [n.dataset.nodeId, n.dataset.worldX, n.dataset.worldY]));
  const before = await positions();
  await runLayout(page, "上下重排");
  const after = await positions(); expect(after).not.toEqual(before);
  await canvas.getByRole("button", { name: "撤销", exact: true }).click();
  expect(await positions()).toEqual(before);
  await canvas.getByRole("button", { name: "重做", exact: true }).click();
  expect(await positions()).toEqual(after);
  expect(await canvas.locator(".graph-camera-controls").evaluate(n => n.parentElement.firstElementChild === n)).toBe(true);
  await page.screenshot({ path: info.outputPath("relationship.png") });
  await noErrors();
});

for (const width of [1440, 390]) test(width + "px 千节点平移、连续手势缩放、标签切回可见", async ({ page }, info) => {
  const noErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(route + "&sample=stress");
  await expect(page.locator(".tg-node")).toHaveCount(1201);
  await expect(page.locator(".tg-edge")).toHaveCount(1280);
  const viewport = page.locator(".tg-canvas-scroll"), stage = page.locator(".tg-canvas-stage");
  const box = await viewport.boundingBox();
  const blank = await viewport.evaluate(node => {
    const rect = node.getBoundingClientRect();
    for (let y = 30; y < rect.height - 15; y += 50) for (let x = 25; x < rect.width - 15; x += 50) {
      const target = document.elementFromPoint(rect.x + x, rect.y + y);
      if (node.contains(target) && !target.closest(".tg-node, .tg-edge, .graph-edge-handle")) return { x: rect.x + x, y: rect.y + y };
    }
    return null;
  });
  expect(blank).not.toBeNull();
  const before = await stage.getAttribute("style");
  await page.mouse.move(blank.x, blank.y); await page.mouse.down();
  await page.mouse.move(blank.x + 90, blank.y + 50, { steps: 20 }); await page.mouse.up();
  await expect(stage).not.toHaveAttribute("style", before);
  const zoomBefore = await page.locator(".tg-zoom-controls > button").nth(1).innerText();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.keyboard.down("Control"); await page.mouse.wheel(0, -60); await page.keyboard.up("Control");
  await expect(page.locator(".tg-zoom-controls > button").nth(1)).not.toHaveText(zoomBefore);
  await page.screenshot({ path: info.outputPath("stress.png") });
  await page.getByRole("button", { name: "自适应全部内容", exact: true }).click();
  await page.getByRole("tab", { name: /版本记录/, exact: true }).click();
  await page.getByRole("tab", { name: "图谱内容", exact: true }).click();
  await expect(page.locator(".tg-node")).toHaveCount(1201);
  await expectNoHorizontalOverflow(page);
  await noErrors();
});
