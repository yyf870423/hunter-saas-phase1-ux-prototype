import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";
import { confirmClientOpportunity } from "../stage3/client-helpers";
import { replyToAsset } from "./opportunity-helpers";

const snapshot = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("hunter-opportunity-lifecycle-v1")));
const button = (page, name) => page.getByRole("button", { name, exact: true });
const followup = (page) => page.locator(".s2-hunter-reply").filter({ has: page.getByRole("heading", { name: "持续跟进", exact: true }) });
async function capture(page, name) {
  await mkdir("artifacts/task-followup-markdown", { recursive: true });
  const current = followup(page);
  if (await current.count()) await current.scrollIntoViewIfNeeded();
  else if (name.includes("periodic")) await page.getByRole("heading", { name: "是否按此计划创建周期性任务？" }).scrollIntoViewIfNeeded();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "artifacts/task-followup-markdown/" + name + ".png", fullPage: true, animations: "disabled" });
}
async function readyClient(page) {
  await page.goto("#/tasks/client-xinglan");
  await confirmClientOpportunity(page);
  await button(page, "打开公司与联系人审核").click();
  await button(page, "保存审核结果").click();
  await button(page, "确认并发送").click();
  await expect(page.getByRole("heading", { name: "等待陈雨回复招聘合作邮件" })).toBeVisible();
  await replyToAsset(page, "招聘需求摘要：客户已回复，新增机器人测试团队\n需求依据：陈雨确认需要进一步核对 JD");
  await replyToAsset(page, "是");
  await expect(followup(page)).toBeVisible();
}

for (const [device, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
  test(device + "：客户回复后持续跟进全程 Markdown，单项确认不弹窗", async ({ page }) => {
    test.setTimeout(70000);
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await readyClient(page);
    const article = followup(page);
    await expect(article.locator("button, input, select, textarea, .s4-field-group, .s4-definition-grid")).toHaveCount(0);
    await replyToAsset(page, "是");
    await expect(article).toContainText("下次需要跟进什么事项？");
    await replyToAsset(page, "核实完整职责与任职要求");
    await expect(article).toContainText("安排在什么时间？");
    await replyToAsset(page, "2026-02-30 10:00");
    await expect(article).toContainText("时间无法识别");
    await replyToAsset(page, "2099-09-10 10:00");
    expect((await snapshot(page)).followups).toHaveLength(0);
    await replyToAsset(page, "否");
    expect((await snapshot(page)).followups).toHaveLength(0);
    await replyToAsset(page, "跟进时间：2099-09-11 11:00");
    await expect(article).toContainText("2099-09-11 11:00");
    await capture(page, device + "-client-followup-confirm");
    await replyToAsset(page, "是");
    expect((await snapshot(page)).followups).toHaveLength(1);
    await replyToAsset(page, "是");
    expect((await snapshot(page)).followups).toHaveLength(1);
    await page.reload();
    await expect(article).toContainText("核实完整职责与任职要求");
    await replyToAsset(page, "记录跟进\n跟进内容：已拿到完整 JD\n实际跟进时间：2026-09-01 10:00\n完成当前事项：是");
    expect((await snapshot(page)).followups[0].status).toBe("pending");
    await replyToAsset(page, "是");
    expect((await snapshot(page)).followups[0].status).toBe("done");
    await expect(article).toContainText("已拿到完整 JD");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await capture(page, device + "-client-followup-recorded");
    await replyToAsset(page, "招聘需求摘要：预算新增一档，仍待确认人数");
    await replyToAsset(page, "是");
    const opportunity = (await snapshot(page)).opportunities.at(-1);
    expect(opportunity.summary).toContain("预算新增一档");
    expect(opportunity.sources.at(-1).content).not.toContain("跟进时间：2099");
    await errors();
  });
}

test("普通机会任务复用跟进确认，改期建议、取消和仅分析边界", async ({ page }) => {
  await page.goto("#/new?kind=opportunity");
  await replyToAsset(page, "公司：星澜机器人\n机会名称：研发需求专项核实\n招聘需求摘要：核实新增研发方向\n发现依据：电话回访");
  await expect(page.getByRole("heading", { name: "待确认的招聘机会", exact: true })).toBeVisible();
  await replyToAsset(page, "是");
  await replyToAsset(page, "安排跟进\n跟进事项：核实人数\n跟进时间：2099-09-10 10:00");
  await replyToAsset(page, "是，但先别执行");
  expect((await snapshot(page)).followups).toHaveLength(0);
  await replyToAsset(page, "跟进事项：核实人数和预算");
  await replyToAsset(page, "是");
  await replyToAsset(page, "修改下次跟进\n跟进时间：2099-09-11 10:00");
  await replyToAsset(page, "否");
  expect((await snapshot(page)).followups[0].version).toBe(1);
  await replyToAsset(page, "取消安排");
  await replyToAsset(page, "是");
  expect((await snapshot(page)).followups[0].status).toBe("cancelled");
  await replyToAsset(page, "记录跟进\n跟进内容：客户确认已收到问题清单\n实际跟进时间：2026-09-01 10:00");
  const beforeRecords = (await snapshot(page)).opportunities.at(-1).records.length;
  await page.locator('.s2-composer input[type="file"]').setInputFiles({ name: "followup-evidence.txt", mimeType: "text/plain", buffer: Buffer.from("客户回访记录：已经收到问题清单") });
  await replyToAsset(page, "是");
  expect((await snapshot(page)).opportunities.at(-1).records).toHaveLength(beforeRecords);
  await expect(followup(page)).toContainText("followup-evidence.txt");
  await replyToAsset(page, "是");
  expect((await snapshot(page)).opportunities.at(-1).records.at(-1).fileIds).toHaveLength(1);
  await replyToAsset(page, "安排跟进\n跟进事项：核实预算\n跟进时间：2099-09-12 10:00");
  await button(page, "执行前确认").click();
  await page.getByRole("option", { name: /^仅分析/ }).click();
  await replyToAsset(page, "是");
  await expect(followup(page)).toContainText("仅分析");
  expect((await snapshot(page)).followups).toHaveLength(1);
});

test("周期计划回复、否定与建议仍停留在同一草稿，确认后列表反映真实计划", async ({ page }) => {
  await page.goto("#/new?mode=periodic");
  await replyToAsset(page, "每周一检查机器人公司的公开招聘变化");
  await expect(page.getByRole("heading", { name: "周期性任务草案" })).toBeVisible();
  await expect(page.locator(".s2-decision-request")).toHaveCount(0);
  await replyToAsset(page, "否");
  await expect(page).toHaveURL(/#\/new/);
  await replyToAsset(page, "是，但改为每周三 10:00");
  await expect(page).toHaveURL(/#\/new/);
  const plan = page.locator(".s2-hunter-reply").filter({ has: page.getByRole("heading", { name: "周期性任务草案" }) });
  await expect(plan).toContainText("每周三 10:00");
  await expect(plan).toContainText("机器人公司的公开招聘变化");
  await capture(page, "desktop-periodic-confirm");
  await page.setViewportSize({ width: 390, height: 844 });
  await capture(page, "mobile-periodic-confirm");
  await page.locator(".s2-composer textarea").fill("是");
  await button(page, "发送").click();
  await expect(page).toHaveURL(/#\/tasks\/periodic/);
  await expect(page.locator(".s2-periodic-detail")).toContainText("每周三 10:00");
  await page.reload();
  await expect(page.locator(".s2-periodic-detail")).toContainText("机器人公司的公开招聘变化");
});

test("各类任务回复后不重新出现普通状态卡，复杂审核和产物入口仍保留", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  for (const [route, text] of [
    ["position-vla?state=candidate-reply", "请保留最新简历，再核对当前城市"],
    ["career-linhao?state=waiting", "林昊回复了，愿意进一步了解团队规模"],
    ["mapping-embodied?state=completed", "请补充核实机器人研究方向"],
    ["task-hand-team", "补充任职时间依据"],
    ["task-interview-summary", "请补充团队规模的待确认事项"],
    ["task-recommendation-report", "请保留薪资待确认项"],
  ]) {
    await page.goto("#/tasks/" + route);
    const input = page.locator(".s2-composer textarea");
    await expect(input).toBeVisible();
    await input.fill(text);
    await button(page, "发送").click();
    await expect(input).toHaveValue("");
    await expect(page.locator(".s2-local-error, .s2-system-state, .s2-permission-state, .s3-external-wait")).toHaveCount(0);
    await expect(page.locator(".s2-user-message").filter({ hasText: text })).toBeVisible();
  }
  await page.goto("#/tasks/periodic?view=runs&run=run-position-waiting");
  await expect(page.locator(".s2-decision-request")).toContainText("确认当前两份候选人资料的身份关系");
  await page.getByRole("button", { name: /^保留为不同人物/ }).click();
  await expect(page.locator(".s2-decision-request")).toHaveCount(0);
  await errors();
});
