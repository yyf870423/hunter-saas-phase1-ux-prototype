import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  assetNavigationKey,
  assetNavigationItems,
  defaultVisibleAssetIds,
  normalizeAssetNavigation,
} from "../../src/stage1/asset-navigation-store";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test.use({ reducedMotion: "reduce" });

const labels = ["公司", "岗位", "招聘机会", "候选人", "知识图谱"];
const nav = (page) =>
  page.getByRole("navigation", { name: "资产导航", exact: true });
const other = (page) =>
  page.getByRole("dialog", { name: "其他资产导航", exact: true });
const save = (page) =>
  page.getByRole("button", { name: "保存设置", exact: true });
const toggle = (page, label) =>
  page.getByRole("switch", { name: `平铺显示${label}`, exact: true });
const assertNav = async (page, expected) =>
  expect(nav(page).getByRole("button")).toHaveText(expected);
const assertSidePanel = async (page) => {
  await expect(other(page)).toBeVisible();
  const sidebar = await page.locator(".s1-sidebar").boundingBox();
  const trigger = await nav(page)
    .getByRole("button", { name: "其他", exact: true })
    .boundingBox();
  const panel = await other(page).boundingBox();
  const viewport = page.viewportSize();
  expect(panel.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width);
  expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width - 8);
  expect(panel.y).toBeGreaterThanOrEqual(8);
  expect(panel.y + panel.height).toBeLessThanOrEqual(viewport.height - 8);
  expect(panel.y).toBeCloseTo(
    Math.max(8, Math.min(trigger.y, viewport.height - panel.height - 8)),
    0,
  );
};

test("默认五项直接平铺，并按所属资产高亮详情", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await page.goto("#/home");
  await assertNav(page, [...labels, "其他"]);
  await expect(page.getByRole("button", { name: "打开业务资产" })).toHaveCount(
    0,
  );
  for (const item of assetNavigationItems.slice(0, 5)) {
    await nav(page)
      .getByRole("button", { name: item.label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`#/${item.id}$`));
    await expect(
      nav(page).getByRole("button", { name: item.label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.goto("#/companies/company-xinglan/contacts/contact-chenyu");
  await expect(
    nav(page).getByRole("button", { name: "公司", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    nav(page).getByRole("button", { name: "联系人", exact: true }),
  ).toHaveCount(0);
  await check();
});

test("其他仅包含隐藏项，可选择、点击外部和 Escape 关闭", async ({ page }) => {
  await page.goto("#/home");
  const trigger = nav(page).getByRole("button", { name: "其他", exact: true });
  await trigger.click();
  await expect(other(page).locator(".s1-asset-nav-items button")).toHaveText([
    "论文",
    "专利",
  ]);
  await assertSidePanel(page);
  await other(page)
    .getByRole("button", { name: "关闭其他资产导航", exact: true })
    .click();
  await expect(other(page)).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(other(page)).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.locator(".s1-topbar").click({ position: { x: 240, y: 10 } });
  await expect(other(page)).toHaveCount(0);
  await trigger.click();
  await other(page).getByRole("button", { name: "专利", exact: true }).click();
  await expect(page).toHaveURL(/#\/patents$/);
  await expect(other(page)).toHaveCount(0);
  await expect(trigger).toHaveClass(/is-active/);
});

test("从用户菜单进入导航设置，保存后实时更新且刷新记忆", async ({ page }) => {
  await page.goto("#/home");
  await page.getByRole("button", { name: "打开用户菜单" }).click();
  await page.getByRole("menuitem", { name: /设置/ }).click();
  await page
    .locator(".s5-settings-navigation")
    .getByRole("button", { name: /^导航/ })
    .click();
  await expect(page).toHaveURL(/#\/settings\/navigation$/);
  await expect(save(page)).toBeDisabled();
  await toggle(page, "公司").click();
  await toggle(page, "论文").click();
  await assertNav(page, [...labels, "其他"]);
  await save(page).click();
  await assertNav(page, [
    "岗位",
    "招聘机会",
    "候选人",
    "知识图谱",
    "论文",
    "其他",
  ]);
  await page.reload();
  await assertNav(page, [
    "岗位",
    "招聘机会",
    "候选人",
    "知识图谱",
    "论文",
    "其他",
  ]);
  await expect(save(page)).toBeDisabled();
  await nav(page).getByRole("button", { name: "其他", exact: true }).click();
  await expect(other(page).locator(".s1-asset-nav-items button")).toHaveText([
    "公司",
    "专利",
  ]);
});

test("未保存的修改不生效，恢复默认后可以保存", async ({ page }) => {
  await page.goto("#/settings/navigation");
  await toggle(page, "公司").click();
  await page.reload();
  await expect(toggle(page, "公司")).toHaveAttribute("aria-checked", "true");
  await toggle(page, "论文").click();
  await save(page).click();
  await page.getByRole("button", { name: "恢复默认", exact: true }).click();
  await expect(toggle(page, "论文")).toHaveAttribute("aria-checked", "false");
  await expect(
    nav(page).getByRole("button", { name: "论文", exact: true }),
  ).toHaveCount(1);
  await save(page).click();
  await assertNav(page, [...labels, "其他"]);
});

test("允许全部放入其他或全部平铺，不产生不可达入口", async ({ page }) => {
  await page.goto("#/settings/navigation");
  for (const label of labels) await toggle(page, label).click();
  await save(page).click();
  await page.reload();
  await assertNav(page, ["其他"]);
  await nav(page).getByRole("button", { name: "其他", exact: true }).click();
  await expect(other(page).locator(".s1-asset-nav-items button")).toHaveCount(
    7,
  );
  await assertSidePanel(page);
  await page.keyboard.press("Escape");
  for (const item of assetNavigationItems)
    await toggle(page, item.label).click();
  await save(page).click();
  await assertNav(
    page,
    assetNavigationItems.map((item) => item.label),
  );
  await expect(
    nav(page).getByRole("button", { name: "其他", exact: true }),
  ).toHaveCount(0);
});

test("导航配置在同源页面间同步", async ({ page, context }) => {
  await page.goto("#/settings/navigation");
  const second = await context.newPage();
  await second.goto("#/companies");
  await toggle(page, "公司").click();
  await toggle(page, "专利").click();
  await save(page).click();
  await assertNav(second, [
    "岗位",
    "招聘机会",
    "候选人",
    "知识图谱",
    "专利",
    "其他",
  ]);
  await second.close();
});

test("保存失败保留原导航和编辑草稿，重试可恢复", async ({ page }) => {
  await page.goto("#/settings/navigation");
  await toggle(page, "论文").click();
  await page.evaluate((key) => {
    window.originalStorageSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("QuotaExceededError");
      return window.originalStorageSetItem.call(this, name, value);
    };
  }, assetNavigationKey);
  await save(page).click();
  await expect(page.getByText(/导航设置保存失败/)).toBeVisible();
  await assertNav(page, [...labels, "其他"]);
  await expect(toggle(page, "论文")).toHaveAttribute("aria-checked", "true");
  await page.evaluate(() => {
    Storage.prototype.setItem = window.originalStorageSetItem;
  });
  await save(page).click();
  await assertNav(page, [...labels, "论文", "其他"]);
});

test("设置覆盖加载、读取失败重试和受限状态", async ({ page }) => {
  await page.goto("#/settings/navigation?state=loading");
  await expect(page.getByLabel("设置加载中")).toBeVisible();
  await page.goto("#/settings/navigation?state=error");
  await expect(page.getByText("设置读取失败", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "重新加载", exact: true }).click();
  await expect(page.getByRole("switch", { name: /^平铺显示/ })).toHaveCount(7);
  await page.goto("#/settings/navigation?state=permission-limited");
  await expect(page.getByText("暂无权限修改导航设置。")).toBeVisible();
  for (const control of await page.getByRole("switch").all())
    await expect(control).toBeDisabled();
  await expect(save(page)).toBeDisabled();
});

test("配置结构校验保留合法空列表并清理无效值", () => {
  expect(normalizeAssetNavigation({ version: 1, visibleIds: [] })).toEqual([]);
  expect(
    normalizeAssetNavigation({
      version: 1,
      visibleIds: ["papers", "companies", "papers", "unknown"],
    }),
  ).toEqual(["companies", "papers"]);
  expect(
    normalizeAssetNavigation({ version: 1, visibleIds: ["unknown"] }),
  ).toEqual(defaultVisibleAssetIds);
  expect(normalizeAssetNavigation({ version: 2, visibleIds: [] })).toEqual(
    defaultVisibleAssetIds,
  );
  expect(
    normalizeAssetNavigation({ version: 1, visibleIds: [{ id: "companies" }] }),
  ).toEqual(defaultVisibleAssetIds);
  expect(normalizeAssetNavigation(null)).toEqual(defaultVisibleAssetIds);
});

test("损坏的浏览器配置回退默认，不阻断导航", async ({ page }) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{invalid"),
    assetNavigationKey,
  );
  await page.goto("#/companies");
  await assertNav(page, [...labels, "其他"]);
});

test("桌面收起、展开、低高度和深色其他侧向浮层截图", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await mkdir("artifacts/asset-navigation/after", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/companies");
  await nav(page)
    .getByRole("button", { name: "公司", exact: true })
    .locator(".s1-nav-icon-tooltip")
    .hover();
  await expect(page.getByRole("tooltip")).toHaveText("公司");
  await page.mouse.move(700, 50);
  await page.screenshot({
    path: "artifacts/asset-navigation/after/desktop-collapsed.png",
    fullPage: true,
    animations: "disabled",
  });
  await nav(page).getByRole("button", { name: "其他", exact: true }).click();
  await assertSidePanel(page);
  await page.screenshot({
    path: "artifacts/asset-navigation/after/desktop-other-collapsed.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "展开导航", exact: true }).click();
  await page.screenshot({
    path: "artifacts/asset-navigation/after/desktop-expanded.png",
    fullPage: true,
    animations: "disabled",
  });
  for (const height of [768, 600, 500]) {
    await page.setViewportSize({ width: 1440, height });
    await nav(page).getByRole("button", { name: "其他", exact: true }).click();
    await expect(other(page)).toBeInViewport();
    await assertSidePanel(page);
    await expect(
      other(page).getByRole("button", { name: "专利", exact: true }),
    ).toBeInViewport();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `artifacts/asset-navigation/after/desktop-other-${height}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "切换深色模式" }).click();
  await nav(page).getByRole("button", { name: "其他", exact: true }).click();
  await assertSidePanel(page);
  await expect(other(page)).toHaveCSS("background-color", "rgb(17, 17, 17)");
  await page.screenshot({
    path: "artifacts/asset-navigation/after/desktop-other-dark.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 960, height: 600 });
  await assertSidePanel(page);
  await check();
});

test("数据管理增加同级数据工具标签，设置页其他侧向展开", async ({ page }) => {
  await mkdir("artifacts/asset-navigation/after", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/settings/navigation");
  await page.getByRole("button", { name: "展开导航", exact: true }).click();
  const headings = page.locator(".s1-sidebar-scroll .s1-nav-section > h2");
  await expect(headings).toHaveText(["核心业务", "业务资产", "数据工具"]);
  const section = page.locator(".s1-nav-section").filter({
    has: page.getByRole("heading", { name: "数据工具", exact: true }),
  });
  await expect(
    section.getByRole("button", { name: "打开数据管理" }),
  ).toBeVisible();
  for (const property of ["font-size", "font-weight", "color", "line-height"])
    await expect(headings.nth(2)).toHaveCSS(
      property,
      await headings
        .nth(1)
        .evaluate(
          (node, key) => getComputedStyle(node).getPropertyValue(key),
          property,
        ),
    );
  await page.screenshot({
    path: "artifacts/asset-navigation/after/settings-navigation-groups.png",
    animations: "disabled",
  });
  await nav(page).getByRole("button", { name: "其他", exact: true }).click();
  await assertSidePanel(page);
  await page.screenshot({
    path: "artifacts/asset-navigation/after/settings-other-side.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await section.getByRole("button", { name: "打开数据管理" }).click();
  await expect(page).toHaveURL(/#\/data\/imports$/);
  await page.getByRole("button", { name: "收起导航", exact: true }).click();
  await expect(headings.nth(2)).toHaveCSS("height", "0px");
});

test("移动端常用资产与其他遵循配置且可返回", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await mkdir("artifacts/asset-navigation/after", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/companies");
  const openAssets = () =>
    page
      .locator(".s1-mobile-tabs")
      .getByRole("button", { name: "业务资产", exact: true })
      .click();
  await openAssets();
  let dialog = page.getByRole("dialog", { name: "业务资产", exact: true });
  await expect(dialog.locator(".s1-mobile-nav-grid button")).toHaveText([
    ...labels,
    "其他",
  ]);
  await page.screenshot({
    path: "artifacts/asset-navigation/after/mobile-assets.png",
    fullPage: true,
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "其他", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "其他", exact: true });
  await expect(dialog.locator(".s1-mobile-nav-grid button")).toHaveText([
    "论文",
    "专利",
  ]);
  await page.screenshot({
    path: "artifacts/asset-navigation/after/mobile-other.png",
    fullPage: true,
    animations: "disabled",
  });
  await dialog
    .getByRole("button", { name: "返回业务资产", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "业务资产", exact: true })
    .getByRole("button", { name: "岗位", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/positions$/);
  await page.goto("#/settings/navigation");
  await toggle(page, "论文").click();
  await save(page).click();
  await openAssets();
  await expect(
    page
      .getByRole("dialog", { name: "业务资产", exact: true })
      .getByRole("button", { name: "论文", exact: true }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await check();
});

test("导航设置桌面和手机沿用公共设置布局", async ({ page }) => {
  await mkdir("artifacts/asset-navigation/after", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("#/settings/navigation");
    await expect(page.getByRole("switch", { name: /^平铺显示/ })).toHaveCount(
      7,
    );
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `artifacts/asset-navigation/after/settings-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});
