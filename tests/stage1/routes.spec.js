import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test("审核入口暴露阶段二范围并保留阶段一入口", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/review");
  await expect(
    page.getByRole("heading", { name: "自动化通用交互框架" }),
  ).toBeVisible();
  await expect(page.getByText("阶段二待审批")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /进入渐进式业务主线演示/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /阶段一工作台/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("未知路由返回阶段审核入口", async ({ page }) => {
  await page.goto("#/unknown-stage-page");
  await expect(page).toHaveURL(/#\/review$/);
});
