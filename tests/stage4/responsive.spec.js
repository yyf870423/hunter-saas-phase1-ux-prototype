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
  ["mappings/mapping-embodied?tab=content", "具身智能 VLA 知识图谱"],
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
    await page.goto("#/mappings/mapping-embodied?tab=content");
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
  await page.goto("#/patents");
  await page.locator(".s4-tag-overflow").first().hover();
  await page.waitForTimeout(160);
  await page.screenshot({
    path: "artifacts/stage4-custom-tooltip.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/patents");
  await page.locator(".s4-academic-summary").first().hover();
  await page.waitForTimeout(160);
  await page.screenshot({
    path: "artifacts/stage4-description-tooltip.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, file] of [
    ["tasks", "stage4-tabs-tasks.png"],
    ["signals", "stage4-tabs-signals.png"],
    ["candidates/candidate-linhao", "stage4-tabs-candidate-detail.png"],
  ]) {
    await page.goto(`#/${route}`);
    await page.waitForTimeout(240);
    if (route === "signals") {
      await expect(page.locator(".s2-signal-detail")).toHaveCSS("opacity", "1");
    }
    await page.screenshot({ path: `artifacts/${file}`, fullPage: true });
  }
  for (const [route, file] of [
    ["patents", "stage4-patents.png"],
    ["data/imports", "stage4-data-imports.png"],
    ["recycle-bin", "stage4-recycle-bin.png"],
  ]) {
    await page.goto(`#/${route}`);
    await page.screenshot({ path: `artifacts/${file}`, fullPage: true });
  }
});
