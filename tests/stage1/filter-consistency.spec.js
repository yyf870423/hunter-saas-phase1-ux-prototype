import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test.use({ reducedMotion: "reduce" });

const surfaces = [
  ["companies", "公司"],
  ["positions", "岗位"],
  ["opportunities", "招聘机会"],
  ["candidates", "候选人"],
  ["mappings", "知识图谱"],
  ["papers", "论文"],
  ["patents", "专利"],
  ["data/imports", "导入任务"],
  ["data/exports", "导出任务"],
  ["recycle-bin", "回收站"],
  ["tasks/periodic?view=runs", "运行记录"],
  ["ops/users-workspaces", "用户与工作空间"],
  ["ops/subscriptions", "订阅与额度"],
  ["ops/tasks", "运行与故障"],
  ["ops/support", "支持与审计"],
];

for (const width of [1440, 390]) {
  test(`${width}px 全部列表筛选复用一致的高度、字体和主题边框`, async ({
    page,
  }) => {
    const check = trackConsoleErrors(page);
    await mkdir("artifacts/filter-consistency", { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    for (const [route, name] of surfaces) {
      await page.goto(`#/${route}`);
      if (route === "candidates") {
        await expect(page.locator(".s4-candidate-filter-area")).toBeVisible();
        if (width === 390)
          await expect(
            page.locator(".s4-candidate-filter-area > div").first(),
          ).toHaveCSS("flex-wrap", "nowrap");
      }
      const scope = page.locator(".s4-filter-scope").first();
      await expect(scope, name).toBeVisible();
      const controls = scope.locator(
        ".s1-search-field, .s4-select > button, .s4-date-picker > button, .s4-candidate-filter-toggle, .s4-candidate-title-filter input, .s4-candidate-number-filters > label",
      );
      for (const control of await controls.all()) {
        if (!(await control.isVisible())) continue;
        await expect(control, `${name} 控件高度`).toHaveCSS("height", "40px");
        const style = await control.evaluate((node) => {
          const text = node.matches(".s1-search-field")
            ? node.querySelector("input")
            : node.matches(".s4-date-picker > button")
              ? node.querySelector("span")
              : node;
          const css = getComputedStyle(text);
          return { size: css.fontSize, weight: css.fontWeight };
        });
        expect(style, `${name} 字体`).toEqual({ size: "13px", weight: "400" });
        const overlap = await control.evaluate(
          (node) =>
            node.parentElement.matches(".s4-select") &&
            node.getBoundingClientRect().width >
              node.parentElement.getBoundingClientRect().width + 1,
        );
        expect(overlap, `${name} 筛选项不得压缩到触发框之下而遮挡相邻项`).toBe(
          false,
        );
      }
      const search = scope.locator(".s1-search-field").first();
      const select = scope
        .locator(
          ".s4-select:not(.s4-cascade):not(.s4-favorite-filter) > button",
        )
        .first();
      if (await select.count()) {
        if (await search.count()) {
          for (const property of [
            "border-color",
            "border-radius",
            "background-color",
            "box-shadow",
          ])
            await expect(select, `${name} ${property}`).toHaveCSS(
              property,
              await search.evaluate(
                (node, key) => getComputedStyle(node).getPropertyValue(key),
                property,
              ),
            );
        }
        await select.click();
        const option = page
          .locator(".s4-select-panel .s4-select-options > button")
          .first();
        await expect(option).toHaveCSS("font-size", "13px");
        await expect(option).toHaveCSS("font-weight", "400");
        await page.keyboard.press("Escape");
        await expect(select).toBeFocused();
      }
      await expectNoHorizontalOverflow(page);
      if (
        [
          "candidates",
          "mappings",
          "ops/users-workspaces",
          "tasks/periodic?view=runs",
        ].includes(route)
      ) {
        await page.screenshot({
          path: `artifacts/filter-consistency/${route.replaceAll("/", "-").split("?")[0]}-${width}.png`,
          animations: "disabled",
        });
      }
    }
    await check();
  });
}

test("详情表格紧凑筛选统一 36px，深色选择浮层继承主题", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/candidates/candidate-linhao?tab=relations");
  const scope = page.locator(".s4-employment-relations-filters");
  await expect(scope).toBeVisible();
  for (const control of await scope
    .locator(".s4-inline-search, .s4-select > button")
    .all()) {
    await expect(control).toHaveCSS("height", "36px");
  }
  await page.goto("#/candidates");
  await expect(page.locator(".s4-candidate-filter-area")).toBeVisible();
  await page.getByRole("button", { name: "切换深色模式", exact: true }).click();
  for (const [trigger, panel] of [
    ["公司", ".s4-select-panel"],
    ["行业", ".s4-cascade-panel"],
    ["收藏夹", ".s4-favorite-panel"],
  ]) {
    await page
      .locator(".s4-candidate-filter-area")
      .getByRole("button", { name: trigger, exact: true })
      .click();
    await expect(
      page.locator(`.s1-app[data-theme="dark"] ${panel}`),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  }
  await check();
});
