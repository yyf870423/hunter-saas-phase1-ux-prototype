import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const surfaces = [
  ["company", "companies/company-xinglan"],
  ["contact", "companies/company-xinglan/contacts/contact-chenyu"],
  ["position", "positions/position-vla"],
  ["opportunity", "opportunities/opportunity-xinglan"],
  ["candidate", "candidates/candidate-linhao"],
  ["graph", "mappings/mapping-embodied"],
  ["paper", "papers/paper-vla-survey"],
  ["patent", "patents/patent-manipulation"],
];
const removedNames = /^(相关业务|关联业务|编辑相关业务)$/;

for (const [name, route] of surfaces) {
  test(`${name} 不显示关联业务区块，桌面和手机保持原有资料布局`, async ({
    page,
  }) => {
    const check = trackConsoleErrors(page);
    await mkdir("artifacts/asset-business-removal/after", { recursive: true });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(`#/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      for (const role of ["tab", "heading", "button"]) {
        await expect(page.getByRole(role, { name: removedNames })).toHaveCount(
          0,
        );
      }
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `artifacts/asset-business-removal/after/${name}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
    await check();
  });
}

test("旧业务链接回落，处理记录隐藏但机会活动历史保留", async ({ page }) => {
  const check = trackConsoleErrors(page);
  for (const [route, activeTab, heading] of [
    ["companies/company-xinglan?tab=history", "公司资料", "公司基本资料"],
    ["positions/position-vla?tab=history", "岗位资料", null],
    ["opportunities/opportunity-xinglan?tab=history", "活动记录", "活动记录"],
    [
      "companies/company-xinglan/contacts/contact-chenyu?tab=business",
      "联系人资料",
      "基本资料",
    ],
    ["mappings/mapping-embodied?tab=business", null, null],
    ["mappings/mapping-embodied?tab=related", null, null],
  ]) {
    await page.goto(`#/${route}`);
    if (activeTab) await expect(
      page.getByRole("tab", { name: activeTab, exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    else {
      await expect(page.locator(".tg-content-shell")).toBeVisible();
      await expect(page.locator(".tg-detail-page > .s4-detail-tabs")).toHaveCount(0);
    }
    if (heading)
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
    await expect(page.getByRole("heading", { name: removedNames })).toHaveCount(
      0,
    );
  }
  for (const route of ["companies/company-xinglan", "positions/position-vla"]) {
    await page.goto(`#/${route}?tab=history`);
    await expect(page.locator(".s4-ai-process-history")).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "处理与记录", exact: true })).toHaveCount(0);
  }
  await check();
});

test("候选人沟通去掉业务配置后仍可保存记录", async ({ page }) => {
  await page.goto("#/candidates/candidate-linhao?tab=timeline");
  await page.getByRole("button", { name: "添加记录", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "添加跟进记录" });
  await expect(dialog.getByText("关联业务", { exact: true })).toHaveCount(0);
  await dialog
    .locator("textarea")
    .fill("仅记录本次沟通内容，不配置额外业务关系。");
  await dialog.getByRole("button", { name: "保存记录", exact: true }).click();
  await expect(
    page.getByText("仅记录本次沟通内容，不配置额外业务关系。", { exact: true }),
  ).toBeVisible();
});

test("公司归属、机会联系人与候选人事实关系不随业务汇总移除", async ({
  page,
}) => {
  await page.goto("#/companies/company-xinglan?tab=contacts");
  await expect(page.getByRole("button", { name: "添加联系人" })).toBeVisible();
  await expect(page.locator(".s4-relation-table")).toContainText("陈雨");
  await page.goto("#/opportunities/opportunity-xinglan");
  // 产品决策 2026-11-22：机会可关联多位联系人。
  await expect(page.getByRole("button", { name: "查看联系人" }).first()).toBeVisible();
  await page.getByRole("tab", { name: /招聘方向/ }).click();
  await expect(
    page.getByRole("button", { name: "形成岗位" }).first(),
  ).toBeVisible();
  await page.goto("#/candidates/candidate-linhao?tab=relations");
  await expect(
    page.getByRole("heading", { name: "关联公司", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: /学术成果/ })).toBeVisible();
  await page.goto("#/mappings");
  await expect(page.getByPlaceholder("搜索图谱名称或内容")).toBeVisible();
  await expect(
    page.locator(".tg-graph-card footer").filter({ hasText: "个任务" }),
  ).toHaveCount(0);
});
