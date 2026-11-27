import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

const route = "#/candidates/candidate-linhao?tab=contact-path";

for (const width of [1440, 871, 390]) {
  test(`${width}px 寻找和更新联系路径直接运行，不要求额外输入`, async ({ page }, info) => {
    const check = trackConsoleErrors(page), writes = [];
    page.on("request", request => {
      if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
    });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(route);
    await expect(page.getByRole("button", { name: "创建联系路径", exact: true })).toHaveCount(0);
    await expect(page.getByText("暂无联系路径", { exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath(`empty-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "寻找联系路径", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("textarea")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "正在寻找联系路径", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "寻找联系路径", exact: true })).toHaveCount(0);
    await expect(page.getByText("本次要求", { exact: true })).toHaveCount(0);
    await page.screenshot({ path: info.outputPath(`running-${width}.png`), fullPage: true });
    const canvas = page.locator(".s3-relationship-workspace");
    await expect(canvas).toBeVisible({ timeout: 5000 });
    await expect(canvas.locator('[data-node-id="path-linhao"]')).toBeVisible();
    await page.screenshot({ path: info.outputPath(`result-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "更新联系路径", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "正在寻找联系路径", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "更新联系路径", exact: true })).toHaveCount(0);
    await expect(page.getByText("联系路径已更新", { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(canvas).toBeVisible();
    expect(writes).toEqual([]);
    await expectNoHorizontalOverflow(page);
    await check();
  });
}

test("快速重复点击只启动一次，运行完成后可再次寻找", async ({ page }) => {
  await page.clock.install();
  await page.goto(route);
  await page.getByRole("button", { name: "寻找联系路径", exact: true }).evaluate(button => {
    button.click();
    button.click();
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "正在寻找联系路径", exact: true })).toHaveCount(1);
  await page.clock.runFor(2400);
  await expect(page.getByText("联系路径已生成", { exact: true })).toHaveCount(1);
  await expect(page.locator(".s3-relationship-workspace")).toHaveCount(1);
  await page.getByRole("button", { name: "更新联系路径", exact: true }).click();
  await page.clock.runFor(2400);
  await expect(page.getByText("联系路径已更新", { exact: true })).toHaveCount(1);
});

test("离开页面取消原型计时器，不在其他页弹出完成提示", async ({ page }) => {
  await page.clock.install();
  await page.goto(route);
  await page.getByRole("button", { name: "寻找联系路径", exact: true }).click();
  await page.getByRole("tab", { name: "候选人资料", exact: true }).click();
  await page.clock.runFor(3000);
  await expect(page.getByText("联系路径已生成", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
