import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("支线任务列表支持分类、搜索、详情和删除", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/tasks");
  await page.getByRole("tab", { name: /等待处理/ }).click();
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "核验灵巧手团队负责人" }),
  ).toBeVisible();
  await page.getByPlaceholder("搜索任务、类型或关联对象").fill("赵星羽");
  await expect(
    page.locator(".s2-task-row").filter({ hasText: "消歧赵星羽" }),
  ).toBeVisible();
  await page.getByLabel("删除 消歧赵星羽的论文与任职身份").click();
  await expect(
    page.getByRole("heading", { name: "删除支线任务" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("支线任务详情支持补充资料、恢复和结果回流", async ({ page }) => {
  await page.goto("#/tasks/task-hand-team");
  await expect(page.getByText("身份核验需要决定")).toBeVisible();
  const input = page.getByPlaceholder(/输入你掌握的信息/);
  await input.fill("这是同一个人，2025 年 12 月加入穹顶智能。");
  await input.press("Enter");
  await expect(
    page.getByText(/已回流“星澜机器人人才版图”的更新与审核区/),
  ).toBeVisible();
  await expect(page.getByText("完成", { exact: true }).first()).toBeVisible();
});

test("信号中心支持合并来源、观察和转化", async ({ page }) => {
  await page.goto("#/signals");
  await expect(
    page.getByRole("heading", { name: /云脉芯能正在组建机器人芯片团队/ }),
  ).toBeVisible();
  await expect(page.getByText("4 个来源 · 今天 09:12")).toBeVisible();
  await page.getByRole("button", { name: "加入观察" }).click();
  await expect(page.getByText(/信号已加入观察/)).toBeVisible();
  await page.getByRole("button", { name: "转化或启动工作" }).click();
  await expect(page.getByRole("heading", { name: "转化信号" })).toBeVisible();
  await page.getByRole("radio", { name: /新建支线任务/ }).click();
  await page.getByRole("button", { name: "继续" }).click();
  await expect(page).toHaveURL(/#\/tasks\/new$/);
});

test("移动端可以从信号列表进入详情并返回", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/signals");
  await page
    .locator(".s2-signal-feed > button")
    .filter({ hasText: "陈松的公开任职信息发生变化" })
    .click();
  await expect(
    page.getByRole("heading", { name: /陈松的公开任职信息发生变化/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回信号列表" }).click();
  await expect(page.getByPlaceholder("搜索公司、人物或信号内容")).toBeVisible();
});
