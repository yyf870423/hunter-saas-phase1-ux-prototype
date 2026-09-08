import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { replyToAsset } from "../stage4/opportunity-helpers";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

const button = (page, name) => page.getByRole("button", { name, exact: true });
async function capture(page, name) {
  await mkdir("artifacts/acceptance-feedback-20260908/after", { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  if (name.includes("mapping-completed")) await page.locator(".s2-conversation").evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  if (/papers|patents/.test(name)) await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector(".s1-main")?.scrollTo({ top: 0, behavior: "instant" });
  });
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `artifacts/acceptance-feedback-20260908/after/${name}.png`, animations: "disabled" });
}

for (const [device, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
  test(`${device}：客户草稿等待用户确认，不自动回复或入库`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/tasks/client-xinglan");
    const draft = page.locator(".s2-hunter-reply").filter({ has: page.getByRole("heading", { name: "待确认的招聘机会", exact: true }) });
    await expect(draft).toContainText("请回复“确认”“否”");
    await expect(page.locator(".s2-user-message")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "查看招聘机会", exact: true })).toHaveCount(0);
    await page.getByText("请回复“确认”“否”，或提出修改建议。", { exact: true }).scrollIntoViewIfNeeded();
    await capture(page, `${device}-client-confirm`);
    await replyToAsset(page, "确认");
    await expect(page.getByRole("link", { name: "查看招聘机会", exact: true })).toBeVisible();
    await expect(page.locator(".s2-user-message").filter({ hasText: /^确认/ })).toHaveCount(1);
    await capture(page, `${device}-client-confirmed`);
    await errors();
  });

  test(`${device}：摸排完成态有阶段对话、保存结果及可持续追加的会话`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/tasks/mapping-embodied?state=completed");
    await expect(page.getByRole("heading", { name: "摸排报告已经保存", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "人物与关系批次已审核", exact: true })).toHaveCount(1);
    await expect(page.getByText("本轮完成", { exact: true })).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "待补充信息与下一步", exact: true })).toBeVisible();
    await expect(button(page, "打开本批次更新审核")).toHaveCount(0);
    expect(await page.locator(".s2-hunter-reply").count()).toBeGreaterThanOrEqual(6);
    await capture(page, `${device}-mapping-completed`);
    await replyToAsset(page, "请优先核实拓界技术负责人的任职时间");
    await expect(page.locator(".s2-user-message").filter({ hasText: "请优先核实拓界技术负责人的任职时间" })).toBeVisible();
    await page.reload();
    await expect(page.locator(".s2-user-message").filter({ hasText: "请优先核实拓界技术负责人的任职时间" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "摸排报告已经保存", exact: true })).toHaveCount(1);
    await errors();
  });

  test(`${device}：统一新建入口根据输入识别周期，不由旧链接强制分类`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("#/new?mode=periodic");
    await expect(page).toHaveURL(/#\/new$/);
    await expect(page.getByRole("heading", { name: "新建任务", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "新建周期性任务", exact: true })).toHaveCount(0);
    await capture(page, `${device}-new-task`);
    await replyToAsset(page, "每周三检查星澜机器人的招聘需求变化");
    const draft = page.locator(".s2-hunter-reply").filter({ has: page.getByRole("heading", { name: "周期性任务草案", exact: true }) });
    await expect(draft).toContainText("每周三 09:00");
    await expect(draft).toContainText("检查星澜机器人的招聘需求变化");
    await expect(page).toHaveURL(/#\/new$/);
    await capture(page, `${device}-periodic-detected`);
    await page.locator(".s2-composer textarea").fill("确认");
    await button(page, "发送").click();
    await expect(page).toHaveURL(/#\/tasks\/periodic/);
    await expect(page.locator(".s2-periodic-detail")).toContainText("每周三 09:00");
    await button(page, "新建任务").click();
    await expect(page).toHaveURL(/#\/new$/);
    await replyToAsset(page, "整理这三条面试反馈");
    await expect(page).toHaveURL(/#\/tasks\/task-interview-summary$/);
  });

  test(`${device}：论文专利均无编辑，多选操作仅删除并保留取消`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    for (const [kind, id] of [["papers", "paper-vla-survey"], ["patents", "patent-manipulation"]]) {
      await page.goto(`#/${kind}/${id}`);
      await expect(button(page, "编辑")).toHaveCount(0);
      await capture(page, `${device}-${kind}-detail`);
      await button(page, "删除").click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.getByRole("dialog").getByRole("button", { name: "取消", exact: true }).click();
      await page.goto(`#/${kind}`);
      await page.getByRole("checkbox").nth(0).click();
      await page.getByRole("checkbox").nth(1).click();
      const actions = page.locator(".s4-floating-bulk");
      await expect(actions.getByRole("button")).toHaveText(["删除", "取消"]);
      await expect(button(page, "加入知识图谱")).toHaveCount(0);
      await capture(page, `${device}-${kind}-bulk`);
      await actions.getByRole("button", { name: "删除", exact: true }).click();
      await expect(page.getByRole("dialog")).toContainText("已选的 2 项");
      await page.getByRole("dialog").getByRole("button", { name: "取消", exact: true }).click();
      await expect(page.getByRole("checkbox").nth(0)).toBeChecked();
      await expect(page.getByRole("checkbox").nth(1)).toBeChecked();
    }
    await errors();
  });
}

test("摸排完成直达不被未开始会话的空缓存覆盖", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied");
  await page.evaluate(() => sessionStorage.setItem("hunter-stage3-mapping-embodied-messages", "[]"));
  await page.goto("#/tasks/mapping-embodied?state=completed");
  await page.reload();
  await expect(page.getByRole("heading", { name: "摸排报告已经保存", exact: true })).toBeVisible();
});
