import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "./helpers";

for (const [state, marker] of [
  ["loading", ".s1-skeleton"],
  ["empty", ".s1-empty-state"],
  ["error", ".s1-local-error"],
  ["limited", ".s1-permission-strip"],
]) {
  test(`${state} 状态可访问且不溢出`, async ({ page }) => {
    const assertNoConsoleErrors = trackConsoleErrors(page);
    await page.goto(`#/home?state=${state}`);
    await expect(page.locator(marker).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await assertNoConsoleErrors();
  });
}

test("局部错误可独立恢复", async ({ page }) => {
  await page.goto("#/home?state=error");
  await page.getByRole("button", { name: "重新加载" }).click();
  await expect(page).toHaveURL(/#\/home$/);
  await expect(page.getByText("运行摘要已重新加载")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "需要关注的执行" }),
  ).toBeVisible();
});

test("组件页的 Toast 与 Modal 可用", async ({ page }) => {
  await page.goto("#/components");
  await page.getByRole("button", { name: "成功 Toast" }).click();
  await expect(page.getByText("修改已保存")).toBeVisible();
  await page.getByRole("button", { name: "打开 Modal" }).click();
  await expect(
    page.getByRole("heading", { name: "确认继续此操作" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "确认", exact: true }).click();
  await expect(page.getByText("操作已确认")).toBeVisible();
});
