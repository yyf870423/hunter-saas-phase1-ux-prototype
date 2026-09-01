import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test("审核入口暴露阶段四全部业务资产范围", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/review");
  await expect(
    page.getByRole("heading", { name: "业务资产与统一数据管理" }),
  ).toBeVisible();
  await expect(page.getByText("阶段四待审批")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /从候选人列表开始验收/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /知识图谱导入/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("未知路由返回阶段审核入口", async ({ page }) => {
  await page.goto("#/unknown-stage-page");
  await expect(page).toHaveURL(/#\/review$/);
});
