import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("#/signals?signal=signal-xinglan");
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("星澜机器人 VLA 团队扩招");
});

test("仅在摘要出现的关键词可以找到洞察，清空后保留回退选择", async ({ page }) => {
  const search = page.getByPlaceholder("搜索公司、人物或洞察");
  await search.fill("尚未确认是否开放猎头合作");
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(1);
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("拓界智驾新增感知与规划团队招聘页面");
  await search.fill("");
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(8);
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("拓界智驾新增感知与规划团队招聘页面");
});

test("公司、人物名称可查询，并与已忽略筛选组合", async ({ page }) => {
  const search = page.getByPlaceholder("搜索公司、人物或洞察");
  await search.fill("陈雨");
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(1);
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("陈雨来信：星澜机器人想再加 2 个数据平台岗位");
  await search.fill("星澜机器人");
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(4);
  await page.getByRole("tab", { name: /已忽略/ }).click();
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(1);
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("周明远近期连续转发具身智能招聘内容");
});

test("仅类型、来源名称、证据变化或来源任务中的词不命中", async ({ page }) => {
  for (const query of ["公司变化", "历史组织图", "团队计划扩招 6 人", "每周发现具身智能创业公司与招聘机会"]) {
    await page.getByPlaceholder("搜索公司、人物或洞察").fill(query);
    await expect(page.locator(".s2-signal-feed > button")).toHaveCount(0);
    await expect(page.locator(".s2-signal-detail .s1-empty-state")).toBeVisible();
    await expect(page.locator(".s2-signal-detail > footer")).toHaveCount(0);
  }
});

test("大小写、前后空格与清空条件沿用原有交互", async ({ page }) => {
  const search = page.getByPlaceholder("搜索公司、人物或洞察");
  await search.fill("  vLa  ");
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(2);
  await expect(page.locator(".s2-signal-detail h2")).toHaveText("星澜机器人 VLA 团队扩招");
  await search.fill("   ");
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(8);
  await page.getByRole("button", { name: "清空搜索", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.locator(".s2-signal-feed > button")).toHaveCount(8);
});
