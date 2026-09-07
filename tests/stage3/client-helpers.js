import { expect } from "@playwright/test";
import { replyToAsset } from "../stage4/opportunity-helpers";

export async function confirmClientOpportunity(page) {
  const entry = page.getByRole("heading", { name: "待确认的招聘机会", exact: true });
  const result = page.getByRole("link", { name: "查看招聘机会", exact: true });
  const contacts = page.getByRole("button", { name: "打开公司与联系人审核", exact: true });
  await expect(entry.or(result).or(contacts).first()).toBeVisible({ timeout: 15000 });
  if (await entry.isVisible()) {
    await expect(contacts).toHaveCount(0);
    await replyToAsset(page, "是");
    await expect(result).toBeVisible();
  }
  const next = page.getByRole("button", { name: "继续核实联系人", exact: true });
  if (await next.isVisible()) await next.click();
}
