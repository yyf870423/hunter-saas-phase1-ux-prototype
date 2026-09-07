import { waitForOpportunityDraft, replyToAsset } from "./opportunity-helpers";
import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { opportunityDemoCases, demoOpportunityPrompt } from "../../src/stage4/opportunity-demo-data.js";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

const button = (page, name) => page.getByRole("button", { name, exact: true });
const field = (page, label) => page.getByLabel(label, { exact: false });
const snapshot = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("hunter-opportunity-lifecycle-v1")));
const output = "artifacts/opportunity-lifecycle/demo";

async function futureTime(page) {
  await page.locator(".s4-form-field").filter({ has: page.locator("span", { hasText: "下次跟进时间" }) }).locator(".s4-date-picker > button").click();
  await button(page, "下个月").click();
  await button(page, "下个月").click();
  await page.locator(".s4-day-grid").getByRole("button", { name: "17", exact: true }).click();
  await page.getByRole("textbox", { name: "小时", exact: true }).fill("10");
  await page.getByRole("textbox", { name: "分钟", exact: true }).fill("17");
  await page.locator(".s4-date-time-inputs").getByRole("button", { name: "确定", exact: true }).click();
}

for (const example of opportunityDemoCases) {
  test(example.company + " S01-S10 连续演示：任务形成机会到两岗位交接", async ({ browser }, testInfo) => {
    test.setTimeout(150000);
    await mkdir(output, { recursive: true });
    const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width: 1440, height: 960 },
      recordVideo: { dir: output + "/raw", size: { width: 1440, height: 960 } } });
    context.setDefaultTimeout(10000);
    const page = await context.newPage();
    const errors = trackConsoleErrors(page);
    const capture = async (step) => {
      await expectNoHorizontalOverflow(page);
      await page.screenshot({ path: output + "/" + example.id + "-" + step + ".png", fullPage: true, animations: "disabled" });
      await page.waitForTimeout(550);
    };
    let companyId, opportunityId, taskId, firstPositionId, secondPositionId, positionTaskId, recruitingTaskId;
    try {
      await test.step("S01 创建新公司并从真实需求输入形成双方向草稿", async () => {
        await page.goto("#/companies/new?name=" + encodeURIComponent(example.company));
        await button(page, "创建公司").click();
        await expect(page.getByRole("heading", { name: example.company, exact: true })).toBeVisible();
        companyId = page.url().split("/companies/")[1].split("?")[0];
        await page.goto("#/new?kind=opportunity&prompt=" + encodeURIComponent(demoOpportunityPrompt(example)));
        await button(page, "发送").click();
        await waitForOpportunityDraft(page);
        await expect(page.getByRole("heading", { name: "待确认的招聘机会", exact: true })).toBeVisible();
        const state = await snapshot(page);
        expect(state.opportunities).toHaveLength(4);
        expect(state.tasks.at(-1).draft.directions).toHaveLength(2);
        taskId = state.tasks.at(-1).id;
        await capture("S01-draft");
      });
      await test.step("S02 核对来源并编辑确认真实机会", async () => {
        await expect(page.locator(".s2-user-message").getByText(demoOpportunityPrompt(example), { exact: true })).toBeVisible();
        await replyToAsset(page, "招聘需求摘要：" + example.summary + "已与客户核对本轮范围。");
        await replyToAsset(page, "是");
        await page.getByRole("link", { name: "查看招聘机会", exact: true }).click();
        await expect(page.getByRole("heading", { name: example.title, exact: true })).toBeVisible();
        opportunityId = (await snapshot(page)).opportunities.at(-1).id;
        await capture("S02-opportunity");
      });
      await test.step("S03 首次记录与下一次跟进同时保存并刷新", async () => {
        await button(page, "记录跟进").click();
        await field(page, "跟进内容").fill("已确认两个方向，职责、人数和薪酬继续澄清。");
        await page.getByRole("checkbox", { name: "安排下一次跟进", exact: true }).click();
        await field(page, "下次跟进事项").fill("确认两个方向的职责与预算边界");
        await futureTime(page);
        await button(page, "保存记录").click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await page.reload();
        await expect(page.getByText("确认两个方向的职责与预算边界", { exact: true })).toBeVisible();
        await capture("S03-followup");
      });
      await test.step("S04 推进到期并从已读通知回到同一机会", async () => {
        await page.goto("#/demo/opportunities");
        await button(page, "目标招聘机会").click();
        await button(page, example.title).click();
        await button(page, "推进到跟进到期").click();
        await button(page, "打开通知").click();
        await page.getByRole("button", { name: new RegExp(example.title + "：确认两个方向") }).click();
        const state = await snapshot(page);
        expect(state.notifications[0].read).toBe(true);
        expect(state.followups[0].status).toBe("due");
        await capture("S04-notice-read-still-due");
      });
      await test.step("S05 完成本次并安排下一次，不创建重复机会", async () => {
        await button(page, "记录跟进").click();
        await field(page, "跟进内容").fill("客户补充第一方向职责，第二方向完整 JD 将随后提供。");
        await page.getByRole("checkbox", { name: /^完成当前事项/ }).click();
        await page.getByRole("checkbox", { name: "安排下一次跟进", exact: true }).click();
        await field(page, "下次跟进事项").fill("接收第二方向完整 JD 并确认交接");
        await futureTime(page);
        await button(page, "保存并完成本次跟进").click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        const state = await snapshot(page);
        expect(state.opportunities).toHaveLength(5);
        expect(state.opportunities.at(-1).records).toHaveLength(2);
        expect(state.followups.map((item) => item.status)).toEqual(["done", "pending"]);
        await capture("S05-next-followup");
      });
      await test.step("S06 第一方向手工补齐 JD，形成空候选人岗位", async () => {
        await page.getByRole("tab", { name: /^招聘方向/ }).click();
        await page.locator(".s4-direction-list article").filter({ hasText: example.directionName }).getByRole("button", { name: "形成岗位", exact: true }).click();
        await field(page, "完整岗位 JD").fill(example.algorithmJd);
        await expect(field(page, "薪资范围")).toHaveValue("");
        await button(page, "确认创建并关联").click();
        await expect(page.getByRole("heading", { name: "岗位已形成", exact: true })).toBeVisible();
        const position = (await snapshot(page)).positions.at(-1);
        firstPositionId = position.id;
        expect(position.jd).toBe(example.algorithmJd);
        expect(position.pipeline).toEqual([]);
        expect(position.processing).toEqual([]);
        await capture("S06-first-position");
        await button(page, "返回招聘方向").click();
      });
      await test.step("S07 在第二方向处理任务中上传实际 JD 文件并修改草稿", async () => {
        await page.locator(".s4-direction-list article").filter({ hasText: example.secondDirectionName }).getByRole("button", { name: "形成岗位", exact: true }).click();
        await button(page, "AI 整理岗位").click();
        await expect(page.getByRole("heading", { name: "待确认的岗位", exact: true })).toBeVisible();
        expect((await snapshot(page)).tasks.at(-1).draft.patch.jd).toBe("");
        positionTaskId = (await snapshot(page)).tasks.at(-1).id;
        await page.locator('.s2-composer input[type="file"]').setInputFiles({ name: example.secondDirectionName + "-JD.txt", mimeType: "text/plain", buffer: Buffer.from(example.simulationJd) });
        await page.locator(".s2-composer textarea").fill("这是客户后续补充的第二方向完整 JD，请整理并保留来源。");
        await button(page, "发送").click();
        await expect.poll(async () => (await snapshot(page)).tasks.at(-1).draft.patch.jd).toContain(example.simulationJd.split("\n")[1]);
        await replyToAsset(page, example.simulationJd + "\n补充要求：能够清楚记录评测结果与问题复现步骤。");
        await capture("S07-file-draft");
        await replyToAsset(page, "是");
        await page.getByRole("link", { name: "查看岗位详情", exact: true }).click();
        await expect(page.getByRole("heading", { name: example.secondDirectionName, exact: true })).toBeVisible();
        secondPositionId = (await snapshot(page)).positions.at(-1).id;
      });
      await test.step("S08 明确开始找人，审核候选人并推进一次阶段", async () => {
        await button(page, "开始找人").click();
        await button(page, "创建招聘任务").click();
        await expect(page.getByRole("heading", { name: "候选人审核", exact: true })).toBeVisible();
        recruitingTaskId = (await snapshot(page)).tasks.at(-1).id;
        await page.getByRole("checkbox", { name: /选择.*林昊/ }).click();
        await button(page, "将所选候选人加入岗位储备").click();
        await expect(page.getByText(/已将 林昊 加入岗位储备/)).toBeVisible();
        await button(page, "查看岗位流程").click();
        await page.locator(".s4-lifecycle-stage article").filter({ hasText: "林昊" }).getByRole("button", { name: "变更阶段", exact: true }).click();
        await button(page, "目标阶段").click();
        await button(page, "已推荐").click();
        await button(page, "确认变更").click();
        await expect.poll(async () => (await snapshot(page)).positions.find((item) => item.id === secondPositionId).pipeline[0].stage).toBe("recommended");
        await capture("S08-candidate-pipeline");
      });
      await test.step("S09 明确完成需求交接，保留独立岗位和招聘任务", async () => {
        const before = await snapshot(page);
        await page.goto("#/tasks/" + taskId);
        await page.locator(".s2-composer textarea").fill("招聘需求摘要：" + example.summary + "客户补充跨团队协作要求，岗位 JD 由用户另行确认。\n需求依据：后续邮件再次确认本轮需求范围。");
        await button(page, "发送").click();
        await waitForOpportunityDraft(page);
        await expect(page.getByRole("heading", { name: "待确认的招聘机会", exact: true })).toBeVisible();
        await replyToAsset(page, "是");
        await expect.poll(async () => (await snapshot(page)).opportunities.at(-1).summary).toContain("跨团队协作要求");
        const updated = await snapshot(page);
        expect(updated.opportunities.at(-1).directions).toHaveLength(2);
        expect(updated.positions.map((position) => position.jd)).toEqual(before.positions.map((position) => position.jd));
        await page.goto("#/opportunities/" + opportunityId);
        await button(page, "完成机会").click();
        await page.getByRole("dialog").getByRole("button", { name: "确认", exact: true }).click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        const state = await snapshot(page);
        expect(state.opportunities.at(-1).status).toBe("已完成");
        expect(state.followups.map((item) => item.status)).toEqual(["done", "cancelled"]);
        expect(state.tasks.find((item) => item.id === recruitingTaskId).positionId).toBe(secondPositionId);
        expect(state.positions.find((item) => item.id === firstPositionId).pipeline).toEqual([]);
        await capture("S09-handoff-complete");
      });
      await test.step("S10 刷新并核对任务、机会、岗位、公司所有引用", async () => {
        await page.reload();
        const state = await snapshot(page);
        const opportunity = state.opportunities.find((item) => item.id === opportunityId);
        expect(opportunity.companyId).toBe(companyId);
        expect(opportunity.directions.map((item) => item.positionId)).toEqual([firstPositionId, secondPositionId]);
        expect(opportunity.sources[0].taskId).toBe(taskId);
        expect(state.positions.find((item) => item.id === secondPositionId).origin.taskId).toBe(positionTaskId);
        expect(state.tasks.find((item) => item.id === positionTaskId).messages.some((message) => message.fileIds?.length)).toBe(true);
        await page.goto("#/companies/" + companyId + "?tab=recruiting");
        await expect(page.getByText(example.title, { exact: true }).first()).toBeVisible();
        await page.goto("#/opportunities/" + opportunityId + "?tab=directions");
        await capture("S10-linked-positions");
        await page.setViewportSize({ width: 390, height: 960 });
        await capture("S10-mobile");
        await errors();
      });
    } finally {
      const video = page.video();
      await context.close();
      await video.saveAs(output + "/" + example.id + "-S01-S10.webm");
    }
  });
}
