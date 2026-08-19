import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

test("审核入口只暴露阶段一范围", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/review");
  await expect(
    page.getByRole("heading", { name: "全局框架与工作台" }),
  ).toBeVisible();
  await expect(page.getByText("阶段一待审批")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /进入工作台原型/ }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("未知路由返回阶段审核入口", async ({ page }) => {
  await page.goto("#/unknown-stage-page");
  await expect(page).toHaveURL(/#\/review$/);
});
