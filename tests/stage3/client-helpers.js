import { expect } from "@playwright/test";
import { replyToAsset } from "../stage4/opportunity-helpers";

export async function confirmClientOpportunity(page) {
  const entry = page.getByRole("heading", { name: "待确认的招聘机会", exact: true });
  const result = page.getByRole("link", { name: "查看招聘机会", exact: true });
  const contacts = page.getByRole("button", { name: "打开公司与联系人审核", exact: true });
  await expect(entry.or(result).or(contacts).first()).toBeVisible({ timeout: 15000 });
  if (await entry.isVisible()) {
    await expect(contacts).toHaveCount(0);
    await replyToAsset(page, "确认");
    await expect(result).toBeVisible();
  }
  const next = page.getByText("是否继续核实联系人？请回复“是”“否”，或提出建议。联系人核实与对外发送分别确认。", { exact: true });
  if (await next.isVisible()) await replyToAsset(page, "是");
}
