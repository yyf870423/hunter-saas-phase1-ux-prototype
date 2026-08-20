import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "../stage1/helpers";

test("动态 Markdown 覆盖通用语义并拦截不安全链接和 HTML", async ({ page }) => {
  await page.goto("#/components");
  const reply = page.locator('.s2-hunter-reply[data-renderer="markdown"]');
  await expect(reply).toBeVisible();
  for (const selector of [
    "h2",
    "strong",
    "ul",
    "ol",
    "blockquote.s2-markdown-note",
    "table.s2-markdown-table",
    "hr",
    "code",
    "pre",
  ]) {
    await expect(reply.locator(selector).first()).toBeVisible();
  }
  const safeLink = reply.getByRole("link", { name: "查看公开来源" });
  await expect(safeLink).toHaveAttribute("href", "https://example.com");
  await expect(safeLink).toHaveAttribute("target", "_blank");
  await expect(reply.getByText("不安全链接")).toBeVisible();
  await expect(reply.getByText("不安全链接")).not.toHaveAttribute("href");
  await expect(reply.getByText("协议相对链接")).toBeVisible();
  await expect(reply.getByText("协议相对链接")).not.toHaveAttribute("href");
  await expect(
    reply.locator("button").filter({ hasText: "不能渲染的 HTML" }),
  ).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
