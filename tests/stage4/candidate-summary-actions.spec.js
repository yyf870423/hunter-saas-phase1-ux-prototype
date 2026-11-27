import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

for (const width of [1440, 871, 390]) {
  test(`${width}px 职业概览操作靠右且保留原行为`, async ({ page }, info) => {
    const check = trackConsoleErrors(page), writes = [];
    page.on("request", request => {
      if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
    });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#/candidates/candidate-linhao");
    const section = page.locator(".s4-field-group").filter({ has: page.getByRole("heading", { name: "职业概览", exact: true }) });
    const header = section.locator("header"), actions = header.locator(".s4-field-actions");
    const regenerate = actions.getByRole("button", { name: "重新生成", exact: true });
    const edit = actions.getByRole("button", { name: "编辑职业概览", exact: true });
    await expect(regenerate).toBeVisible();
    await expect(edit).toBeVisible();
    const geometry = await header.evaluate(element => {
      const group = element.querySelector(".s4-field-actions"), buttons = [...group.querySelectorAll("button")];
      const box = element.getBoundingClientRect(), groupBox = group.getBoundingClientRect();
      const [first, second] = buttons.map(button => button.getBoundingClientRect());
      return { inset: box.right - groupBox.right, padding: parseFloat(getComputedStyle(element).paddingRight), gap: second.left - first.right, sameRow: Math.abs(first.top - second.top) < 1 };
    });
    expect(Math.abs(geometry.inset - geometry.padding)).toBeLessThan(1);
    expect(geometry.sameRow).toBe(true);
    expect(geometry.gap).toBeCloseTo(6, 0);
    await section.screenshot({ path: info.outputPath(`summary-${width}.png`) });
    await regenerate.click();
    await expect(page.getByText("职业概览正在后台重新生成，可以继续浏览其他页面，完成后自动刷新", { exact: true })).toBeVisible();
    await edit.click();
    await expect(page.getByRole("dialog", { name: "编辑职业概览", exact: true })).toBeVisible();
    expect(writes).toEqual([]);
    await expectNoHorizontalOverflow(page);
    await check();
  });
}
