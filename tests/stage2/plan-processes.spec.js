import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("当前进度支持键盘逐步骤展开，详情关闭后保留展开", async ({
  page,
}) => {
  const noErrors = trackConsoleErrors(page);
  await page.goto("#/tasks/position-vla?state=review");
  const plan = page.getByRole("button", { name: /^执行计划/ });
  await plan.click();
  await expect(page.locator(".s2-runtime-tasks")).toHaveCount(0);
  await expect(page.locator(".s2-step-processes")).toHaveCount(0);
  const recall = page.getByRole("button", { name: /并行检索并接收补充资料/ });
  await recall.focus();
  await page.keyboard.press("Enter");
  await expect(recall).toHaveAttribute("aria-expanded", "true");
  const group = page.getByRole("group", {
    name: "并行检索并接收补充资料的相关处理",
  });
  await expect(group.locator(".s2-internal-tasks > button")).toHaveCount(3);
  await expect(group).not.toContainText("补全、查重与匹配");
  const address = page.url();
  await group.getByRole("button", { name: /研究来源补充人物线索/ }).click();
  await expect(page.locator(".s2-inspector h2")).toHaveText(
    "研究来源补充人物线索",
  );
  expect(page.url()).toBe(address);
  await page.getByRole("button", { name: "关闭检查区", exact: true }).click();
  await expect(recall).toHaveAttribute("aria-expanded", "true");
  const enrich = page.getByRole("button", { name: /持续合并并执行匹配门禁/ });
  await enrich.click();
  await expect(recall).toHaveAttribute("aria-expanded", "false");
  await expect(group).toHaveCount(0);
  const enrichment = page.getByRole("group", {
    name: "持续合并并执行匹配门禁的相关处理",
  });
  await expect(enrichment.locator(".s2-internal-tasks > button")).toHaveCount(
    1,
  );
  await expect(enrichment).toContainText("补全、查重与匹配");
  await enrich.click();
  await expect(page.locator(".s2-step-processes")).toHaveCount(0);
  await page.getByRole("button", { name: /确认岗位边界与找人范围/ }).click();
  await expect(
    page.getByText("此步骤暂无独立处理记录", { exact: true }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await noErrors();
});

for (const [route, step, processing] of [
  [
    "client-xinglan?state=waiting",
    "查找联系人与可用联系路径",
    "联系人与联系方式核验",
  ],
  ["mapping-embodied?state=gaps", "审核并更新人才地图", "组织隶属与任职关系"],
  ["career-linhao?state=waiting", "匹配系统内有效岗位", "系统内岗位增量匹配"],
]) {
  test(`${route}复用逐步骤处理，不混入其他步骤`, async ({ page }) => {
    await page.goto(`#/tasks/${route}`);
    await page.getByRole("button", { name: /^执行计划/ }).click();
    await page.getByRole("button", { name: new RegExp(step) }).click();
    const group = page.getByRole("group", { name: `${step}的相关处理` });
    await expect(group.locator(".s2-internal-tasks > button")).toHaveCount(1);
    await group.getByRole("button", { name: new RegExp(processing) }).click();
    await expect(page.locator(".s2-inspector h2")).toHaveText(processing);
    await expectNoHorizontalOverflow(page);
  });
}
