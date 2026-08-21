import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "ipad", width: 1024, height: 1366 },
  { name: "iphone", width: 390, height: 844 },
];

const routes = [
  ["candidates", "候选人"],
  ["positions/position-vla?tab=matching", "匹配结果"],
  ["companies/company-xinglan", "星澜机器人"],
  ["mappings/mapping-embodied?tab=people", "人物与关系"],
  ["papers", "论文"],
  ["data/imports", "数据导入"],
];

for (const viewport of viewports) {
  test(`${viewport.name} 阶段四主要页面无横向溢出`, async ({ page }) => {
    const assertNoConsoleErrors = trackConsoleErrors(page);
    await page.setViewportSize(viewport);
    for (const [route, text] of routes) {
      await page.goto(`#/${route}`);
      await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
    await assertNoConsoleErrors();
  });
}

test("阶段四关键页面生成桌面、平板和手机截图", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("#/candidates");
    await page.screenshot({
      path: `artifacts/stage4-candidates-${viewport.name}.png`,
      fullPage: true,
    });
    await page.goto("#/positions/position-vla?tab=matching");
    await page.screenshot({
      path: `artifacts/stage4-matching-${viewport.name}.png`,
      fullPage: true,
    });
    await page.goto("#/mappings/mapping-embodied?tab=people");
    await page.screenshot({
      path: `artifacts/stage4-mapping-${viewport.name}.png`,
      fullPage: true,
    });
  }
});

test("阶段四公共筛选与数据管理生成桌面验收截图", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/candidates");
  await page.getByRole("button", { name: "收藏夹", exact: true }).click();
  await page.screenshot({
    path: "artifacts/stage4-candidate-favorites.png",
    fullPage: true,
  });
  await page.goto("#/companies");
  await page.getByRole("button", { name: "行业", exact: true }).click();
  await page.screenshot({
    path: "artifacts/stage4-company-industry.png",
    fullPage: true,
  });
  for (const [route, file] of [
    ["patents", "stage4-patents.png"],
    ["data/imports", "stage4-data-imports.png"],
    ["recycle-bin", "stage4-recycle-bin.png"],
  ]) {
    await page.goto(`#/${route}`);
    await page.screenshot({ path: `artifacts/${file}`, fullPage: true });
  }
});
