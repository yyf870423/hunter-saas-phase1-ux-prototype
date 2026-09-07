import { expect } from "@playwright/test";

export async function waitForOpportunityDraft(page) {
  await expect(page.getByRole("heading", { name: /^(待确认的招聘机会|草稿已保留，未写入正式资料)$/ })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("region", { name: "招聘机会审核工作区" })).toHaveCount(0);
}

export async function replyToAsset(page, text) {
  await page.locator(".s2-composer textarea").fill(text);
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator(".s2-composer textarea")).toHaveValue("");
  await expect(page.getByText(/正在整理输入与来源资料|正在整理招聘需求与来源资料/)).toHaveCount(0);
}
