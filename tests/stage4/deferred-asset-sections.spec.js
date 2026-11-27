import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

for (const tab of ["content", "reviews", "history", "work"]) test(`图谱 ${tab} 旧链接直接显示内容，不暴露一级标签`, async ({ page }, info) => {
  const check = trackConsoleErrors(page), writes = [];
  page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`#/mappings/mapping-embodied?tab=${tab}&reviewCase=missing`);
  await expect(page.locator(".tg-content-shell")).toBeVisible();
  await expect(page.locator('[data-node-id="org-wang"]')).toHaveCount(1);
  await expect(page.locator(".tg-detail-page > .s4-detail-tabs, .tg-review-workspace, .tg-history-layout, .s4-asset-related-tasks")).toHaveCount(0);
  await expect(page.getByRole("tablist", { name: "图页", exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath(`graph-${tab}.png`), fullPage: true });
  expect(writes).toEqual([]); await expectNoHorizontalOverflow(page); await check();
});

const assetRoutes = [
  ["公司", "companies/company-xinglan", "history"],
  ["公司旧任务", "companies/company-xinglan", "work"],
  ["岗位", "positions/position-vla", "history"],
  ["岗位旧任务", "positions/position-vla", "work"],
  ["候选人", "candidates/candidate-linhao", "work"],
  ["联系人", "companies/company-xinglan/contacts/contact-chenyu", "work"],
  ["招聘机会", "opportunities/opportunity-xinglan", "work"],
  ["论文", "papers/paper-vla-survey", "work"],
  ["专利", "patents/patent-manipulation", "work"],
];
for (const [name, route, tab] of assetRoutes) test(`${name}隐藏任务与处理记录，旧入口回落且正文仍可见`, async ({ page }, info) => {
  const check = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`#/${route}?tab=${tab}`);
  await expect(page.locator(".s4-detail-page h1").first()).toBeVisible();
  await expect(page.getByRole("tab", { name: "关联任务", exact: true })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "处理与记录", exact: true })).toHaveCount(0);
  await expect(page.locator(".s4-asset-related-tasks")).toHaveCount(0);
  if (!["论文", "专利"].includes(name)) await expect(page.locator('.s4-detail-tabs [role="tab"][aria-selected="true"]').first()).toBeVisible();
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
  await expectNoHorizontalOverflow(page); await check();
});

test("保留机会活动记录与候选人跟进沟通，不扩大隐藏范围", async ({ page }) => {
  await page.goto("#/opportunities/opportunity-xinglan?tab=history");
  await expect(page.getByRole("tab", { name: "活动记录", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.goto("#/candidates/candidate-linhao?tab=timeline");
  await expect(page.getByRole("tab", { name: "跟进与沟通", exact: true })).toHaveAttribute("aria-selected", "true");
});

test("账号菜单仅保留用量、设置和退出，不显示工作空间切换", async ({ page }, info) => {
  const check = trackConsoleErrors(page);
  await page.goto("#/settings/profile");
  await page.getByRole("button", { name: "打开用户菜单", exact: true }).click();
  const menu = page.getByRole("menu", { name: "用户菜单", exact: true });
  await expect(menu.getByRole("menuitem")).toHaveCount(3);
  await expect(menu.getByText("切换工作空间", { exact: true })).toHaveCount(0);
  await expect(menu.getByText("退出登录", { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("account-menu.png") }); await check();
});
