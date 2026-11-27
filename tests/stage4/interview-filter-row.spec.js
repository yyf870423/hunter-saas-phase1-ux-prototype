import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

for (const width of [1440, 871, 390]) {
  test(`${width}px 面试资料筛选行等宽对齐且筛选行为不变`, async ({ page }, info) => {
    const check = trackConsoleErrors(page), writes = [];
    page.on("request", request => {
      if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
    });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#/positions/position-vla?tab=interview");
    const toolbar = page.locator(".s4-interview-record-toolbar");
    const round = toolbar.locator(".s4-select > button").nth(0);
    const status = toolbar.locator(".s4-select > button").nth(1);
    const search = toolbar.locator(".s1-search-field");
    const measure = async () => {
      const boxes = await Promise.all([search.boundingBox(), round.boundingBox(), status.boundingBox()]);
      const [s, r, v] = boxes;
      expect(r.height).toBe(40);
      expect(v.height).toBe(40);
      expect(r.y).toBe(v.y);
      expect(r.width).toBe(v.width);
      expect(v.x - r.x - r.width).toBe(8);
      if (width > 720) {
        expect(s.y).toBe(r.y);
        expect(s.height).toBe(r.height);
        expect(r.width).toBe(140);
      } else expect(r.y - s.y - s.height).toBe(8);
    };
    await expect(round).toBeVisible();
    await measure();
    await toolbar.screenshot({ path: info.outputPath(`initial-${width}.png`) });
    await round.click();
    await expect(page.getByRole("button", { name: "技术一面", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "技术一面", exact: true }).click();
    await status.click();
    await page.getByRole("button", { name: "待核实", exact: true }).click();
    await measure();
    const clear = toolbar.getByRole("button", { name: "清空筛选", exact: true });
    const c = await clear.boundingBox(), v = await status.boundingBox();
    expect(c.height).toBe(40);
    if (width > 720) {
      expect(c.y).toBe(v.y);
      expect(c.x - v.x - v.width).toBe(8);
    } else expect(c.y - v.y - v.height).toBe(8);
    const records = page.locator(".s4-interview-record-list > button");
    await expect(records).toHaveCount(1);
    await expect(records.first()).toContainText("英文交流比例可能随面试官变化");
    await toolbar.screenshot({ path: info.outputPath(`selected-${width}.png`) });
    await clear.click();
    await expect(round).toHaveText("面试轮次");
    await expect(status).toHaveText("有效状态");
    await expect(records).toHaveCount(8);
    await toolbar.getByRole("textbox").fill("数据质量");
    await expect(records).toHaveCount(1);
    await expect(records.first()).toContainText("新增机器人数据质量追问");
    await expectNoHorizontalOverflow(page);
    expect(writes).toEqual([]);
    await check();
  });
}
