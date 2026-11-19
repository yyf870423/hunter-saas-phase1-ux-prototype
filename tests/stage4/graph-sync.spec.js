import { expect, test } from "@playwright/test";
import { trackConsoleErrors } from "../stage1/helpers";

for (const width of [1440, 390]) {
  test(`${width}px 图谱全屏与自适应图标不同，工具提示及退出可用`, async ({ page }, testInfo) => {
    const noErrors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#/mappings/mapping-embodied?tab=content");
    const fit = page.getByRole("button", { name: "自适应全部内容", exact: true });
    const fullscreen = page.getByRole("button", { name: "进入图谱全屏", exact: true });
    await expect(fit.locator("svg")).toHaveAttribute("data-icon", "maximize");
    await expect(fullscreen.locator("svg")).toHaveAttribute("data-icon", "maximize2");
    expect(await fit.locator("svg").innerHTML()).not.toEqual(await fullscreen.locator("svg").innerHTML());
    await page.screenshot({ path: testInfo.outputPath("toolbar.png") });
    await page.locator(".tg-zoom-controls").screenshot({ path: testInfo.outputPath("toolbar-detail.png") });
    await fullscreen.focus();
    await expect(page.getByRole("tooltip", { name: "进入图谱全屏", exact: true })).toBeVisible();
    await fullscreen.click();
    await expect(page.locator(".tg-content-shell")).toHaveClass(/is-fullscreen/);
    await expect(page.getByRole("button", { name: "退出图谱全屏" }).locator("svg")).toHaveAttribute("data-icon", "minimize2");
    await fit.click();
    await expect(page.locator(".tg-zoom-controls > button").nth(1)).toHaveText("76%");
    await page.keyboard.press("Escape");
    await expect(page.locator(".tg-content-shell")).not.toHaveClass(/is-fullscreen/);
    await noErrors();
  });
}

test("拖动重设父节点后首帧起节点与新连线连续八帧对齐", async ({ page }, testInfo) => {
  const noErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/mappings/mapping-embodied?tab=content&page=organization");
  await page.getByRole("button", { name: "关闭详情", exact: true }).click();
  const child = page.locator('.tg-node[data-node-id="org-vla"]');
  const parent = page.locator('.tg-node[data-node-id="org-xinglan"]');
  const childBox = await child.boundingBox(), parentBox = await parent.boundingBox();
  await page.mouse.move(childBox.x + childBox.width / 2, childBox.y + childBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(parentBox.x + parentBox.width / 2, parentBox.y + parentBox.height / 2, { steps: 8 });
  await expect(parent).toHaveClass(/is-drop-target/);
  await page.evaluate(() => {
    window.__graphFrames = new Promise(resolve => {
      window.addEventListener("pointerup", () => {
        const frames = [];
        const sample = () => {
          const node = document.querySelector('.tg-node[data-node-id="org-vla"]');
          const parent = document.querySelector('.tg-node[data-node-id="org-xinglan"]');
          const line = document.querySelector('.tg-edge[data-source="org-xinglan"][data-target="org-vla"] .tg-edge-line');
          const oldLine = document.querySelector('.tg-edge[data-source="org-center"][data-target="org-vla"]');
          const end = line?.getPointAtLength(line.getTotalLength()), start = line?.getPointAtLength(0);
          const screenEnd = end?.matrixTransform(line.getScreenCTM()), screenStart = start?.matrixTransform(line.getScreenCTM());
          const box = node.getBoundingClientRect(), parentBox = parent.getBoundingClientRect();
          frames.push({
            hasNewLine: Boolean(line), hasOldLine: Boolean(oldLine),
            error: screenEnd ? Math.max(Math.abs(screenEnd.x - box.left), Math.abs(screenEnd.y - (box.top + box.height / 2)), Math.abs(screenStart.x - parentBox.right), Math.abs(screenStart.y - (parentBox.top + parentBox.height / 2))) : null,
          });
          if (frames.length < 8) requestAnimationFrame(sample); else resolve(frames);
        };
        requestAnimationFrame(sample);
      }, { once: true });
    });
  });
  await page.mouse.up();
  const frames = await page.evaluate(() => window.__graphFrames);
  expect(frames).toHaveLength(8);
  for (const frame of frames) {
    expect(frame.hasNewLine).toBe(true);
    expect(frame.hasOldLine).toBe(false);
    expect(frame.error).toBeLessThanOrEqual(0.5);
  }
  await expect(page.getByText("VLA 算法组已移动到“星澜机器人”下")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("reparented.png") });
  await testInfo.attach("frame-alignment", { body: JSON.stringify(frames, null, 2), contentType: "application/json" });
  await page.getByRole("button", { name: "层级表格", exact: true }).click();
  await page.getByRole("button", { name: "画布", exact: true }).click();
  await expect(page.locator('.tg-edge[data-source="org-xinglan"][data-target="org-vla"]')).toHaveCount(1);
  await expect(page.locator('.tg-edge[data-source="org-center"][data-target="org-vla"]')).toHaveCount(0);
  await noErrors();
});
