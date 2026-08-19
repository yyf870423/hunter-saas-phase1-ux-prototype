import { mkdir } from "node:fs/promises";
import { test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers";

const output = "artifacts/stage1";

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "ipad", width: 820, height: 1180 },
  { name: "iphone", width: 390, height: 844 },
]) {
  test(`截取 ${viewport.name} 工作台`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("#/home");
    await page.locator(".s1-dashboard").waitFor();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/${viewport.name}-home.png`,
      fullPage: true,
    });
  });
}

test("截取桌面深色工作台", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/home");
  await page.getByRole("button", { name: "切换深色模式" }).click();
  await page.screenshot({
    path: `${output}/desktop-home-dark.png`,
    fullPage: true,
  });
});

test("截取桌面展开导航", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/home");
  await page.getByRole("button", { name: "展开导航" }).click();
  await page.screenshot({
    path: `${output}/desktop-home-nav-expanded.png`,
    fullPage: true,
  });
});
