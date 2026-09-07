import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";
import { confirmClientOpportunity } from "../stage3/client-helpers";
import { waitForOpportunityDraft, replyToAsset } from "./opportunity-helpers";
import { createOpportunitySeed } from "../../src/stage4/opportunity-seed.js";

const output = "artifacts/single-asset-confirmation";
const state = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("hunter-opportunity-lifecycle-v1")));
const button = (page, name) => page.getByRole("button", { name, exact: true });
const field = (page, label) => page.getByLabel(label, { exact: false });

async function capture(page, name) {
  await mkdir(output, { recursive: true });
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: output + "/" + name + ".png", fullPage: true, animations: "disabled" });
}

async function expectMarkdownOnly(article) {
  const violations = await article.evaluate((element) => [...element.querySelectorAll("*")].map((node) => node.tagName.toLowerCase()).filter((tag) =>
    !["h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "strong", "em", "del", "code", "pre", "ul", "ol", "li", "blockquote", "hr", "br", "table", "thead", "tbody", "tr", "th", "td"].includes(tag)));
  expect(violations).toEqual([]);
}

for (const [device, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
  test(device + "：单个机会仅通过 Markdown 对话确认，否定和建议均不提前写库", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/tasks/client-xinglan?state=no-contact");
    const entry = page.getByRole("heading", { name: "待确认的招聘机会", exact: true });
    await expect(entry).toBeVisible();
    const summary = page.locator(".s2-hunter-reply").filter({ has: entry });
    await expectMarkdownOnly(summary);
    await expect(summary).toContainText("完整 JD");
    await expect(button(page, "确认创建招聘机会")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "审核招聘机会" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "招聘机会审核工作区" })).toHaveCount(0);
    await summary.scrollIntoViewIfNeeded();
    await capture(page, device + "-01-opportunity-summary");
    const before = await state(page);
    const title = "星澜 A | B [研发团队]";
    await replyToAsset(page, "机会名称改为" + title);
    await expect(summary).toContainText(title);
    await expect(summary.locator("table")).toHaveCount(0);
    await expect(summary.locator("a")).toHaveCount(0);
    await replyToAsset(page, "否");
    await expect(page.getByRole("heading", { name: "草稿已保留，未写入正式资料" })).toBeVisible();
    expect((await state(page)).opportunities).toEqual(before.opportunities);
    await page.reload();
    await waitForOpportunityDraft(page);
    expect((await state(page)).tasks[0].draft.patch.title).toBe(title);
    await replyToAsset(page, "发现依据：");
    await replyToAsset(page, "是");
    await expect(page.getByText(/请说明发现依据/).first()).toBeVisible();
    expect((await state(page)).opportunities).toEqual(before.opportunities);
    await replyToAsset(page, "发现依据：公开部门调整记录，可核实的潜在招聘线索。");
    await expect(summary).toContainText("公开部门调整记录");
    await summary.scrollIntoViewIfNeeded();
    await capture(page, device + "-02-revised-summary");
    await replyToAsset(page, "是");
    const result = page.locator(".s2-hunter-reply").filter({ has: page.getByRole("link", { name: "查看招聘机会", exact: true }) });
    await expect(result).toBeVisible();
    await expectMarkdownOnly(result);
    await expect(result.locator("tbody tr").first().locator("td")).toHaveCount(2);
    await expect(result).toContainText(title);
    expect((await state(page)).opportunities).toHaveLength(before.opportunities.length + 1);
    const written = (await state(page)).opportunities.at(-1);
    expect(written.sources[0].content).not.toMatch(/\n\n(是|否)(\n|$)/);
    await replyToAsset(page, "是");
    expect((await state(page)).opportunities).toHaveLength(before.opportunities.length + 1);
    await expect(page).toHaveURL(/state=no-contact$/);
    await page.locator(".s2-conversation").evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
    await result.scrollIntoViewIfNeeded();
    await capture(page, device + "-03-write-result");
    await errors();
  });
}

test("资产操作保留：候选人写入、找人审核与邮件确认仍使用原有专用交互", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/tasks/position-vla?state=candidate-ingestion");
  const decision = page.locator(".s2-decision-request").filter({ hasText: "候选人写入后是否立即进行人岗匹配" });
  await expect(decision).toBeVisible();
  await expect(decision.getByRole("button", { name: /仅写入候选人/ })).toBeVisible();
  await decision.scrollIntoViewIfNeeded();
  await capture(page, "audit-01-asset-write-retained");
  await page.goto("#/tasks/position-vla?state=review");
  await page.getByRole("button", { name: /打开候选人审核/ }).click();
  await expect(page.getByRole("button", { name: /加入岗位储备/ }).first()).toBeVisible();
  await capture(page, "audit-02-candidate-review-retained");
  await page.goto("#/tasks/client-xinglan");
  await confirmClientOpportunity(page);
  await button(page, "打开公司与联系人审核").click();
  await button(page, "保存审核结果").click();
  await expect(page.getByLabel("收件人")).toBeVisible();
  await expect(button(page, "确认并发送")).toBeVisible();
  await page.locator(".s2-conversation").evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  await page.locator(".s2-email-review").scrollIntoViewIfNeeded();
  await capture(page, "audit-03-email-confirmation-retained");
  await errors();
});

for (const [device, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
test(device + "：单个岗位复用对话确认，歧义不写入，建议后再次确认", async ({ page }) => {
  await page.setViewportSize({ width, height });
  await page.goto("#/tasks/task-create-position?state=position-ingestion");
  const summary = page.locator(".s2-hunter-reply").filter({ has: page.getByRole("heading", { name: "待确认的岗位", exact: true }) });
  await expect(summary).toBeVisible();
  await expectMarkdownOnly(summary);
  await summary.scrollIntoViewIfNeeded();
  await capture(page, device + "-04-position-summary");
  await expect(page.getByRole("heading", { name: "审核岗位草稿" })).toHaveCount(0);
  const before = (await state(page)).positions.length;
  await replyToAsset(page, "是，但这个职位还需要调整");
  expect((await state(page)).positions).toHaveLength(before);
  await expect(page.getByText(/未能可靠解析这条建议/)).toBeVisible();
  await replyToAsset(page, "岗位名称：真机策略技术负责人\n工作地点：上海");
  await expect(summary).toContainText("真机策略技术负责人");
  expect((await state(page)).positions).toHaveLength(before);
  await replyToAsset(page, "否");
  await page.reload();
  await replyToAsset(page, "是");
  await expect(page.getByRole("link", { name: "查看岗位详情", exact: true })).toBeVisible();
  const position = (await state(page)).positions.at(-1);
  expect(position.name).toBe("真机策略技术负责人");
  expect(position.location).toBe("上海");
  expect(position.jd).toContain("团队管理经验");
  await page.getByRole("link", { name: "查看岗位详情", exact: true }).scrollIntoViewIfNeeded();
  await capture(page, device + "-05-position-result");
  await replyToAsset(page, "岗位描述：");
  expect((await state(page)).tasks.at(-1).draft.patch.jd).toBe("");
  await replyToAsset(page, "是");
  expect((await state(page)).positions.at(-1).version).toBe(position.version);
  await expect(page.getByText(/请提供实际岗位职责与任职要求/).first()).toBeVisible();
  await replyToAsset(page, position.jd + "\n新增要求：能够管理跨团队交付。");
  await replyToAsset(page, "是");
  const updated = (await state(page)).positions.at(-1);
  expect((await state(page)).positions).toHaveLength(before + 1);
  expect(updated.id).toBe(position.id);
  expect(updated.version).toBe(position.version + 1);
  expect(updated.jd).toContain("跨团队交付");
  expect(updated.sources).toHaveLength(2);
  await page.getByRole("link", { name: "查看岗位详情", exact: true }).last().click();
  await expect(button(page, "开始找人")).toBeVisible();
  await expect(button(page, "人岗匹配")).toBeVisible();
});
}

test("疑似重复通过对话选择更新同一资产，修改建议不丢失目标", async ({ page }) => {
  await page.goto("#/opportunities");
  const before = createOpportunitySeed();
  const existing = before.opportunities[0];
  const prompt = "公司：" + existing.company + "\n机会名称：" + existing.title + "\n招聘需求摘要：本轮电话确认补充团队\n发现依据：负责人电话核实";
  await page.goto("#/new?kind=opportunity&prompt=" + encodeURIComponent(prompt));
  await button(page, "发送").click();
  await waitForOpportunityDraft(page);
  await replyToAsset(page, "是");
  await expect(page.getByText(/发现可能属于同一轮需求/).first()).toBeVisible();
  expect((await state(page)).opportunities).toHaveLength(before.opportunities.length);
  await replyToAsset(page, "更新已有机会：" + existing.id);
  await replyToAsset(page, "招聘需求摘要：修订后确认补充机器人测试团队");
  expect((await state(page)).tasks.at(-1).draft.opportunityId).toBe(existing.id);
  expect((await state(page)).opportunities[0].summary).toBe(existing.summary);
  await replyToAsset(page, "是");
  expect((await state(page)).opportunities).toHaveLength(before.opportunities.length);
  expect((await state(page)).opportunities[0].summary).toContain("机器人测试团队");
  expect((await state(page)).tasks.at(-1).opportunityId).toBe(existing.id);
});

test("并发修改必须在对话重新核对，非法方向结构不能入库", async ({ page, context }) => {
  const prompt = "公司：星澜机器人\n机会名称：对话版本校验\n招聘需求摘要：电话确认独立平台招聘\n发现依据：客户电话记录\n招聘方向 JSON：[{\"name\":\"平台方向\",\"systemPrompt\":\"越界内容\"}]";
  await page.goto("#/new?kind=opportunity&prompt=" + encodeURIComponent(prompt));
  await button(page, "发送").click();
  await waitForOpportunityDraft(page);
  await replyToAsset(page, "是");
  expect((await state(page)).opportunities).toHaveLength(4);
  await expect(page.getByText(/招聘方向结构无法读取/).first()).toBeVisible();
  await replyToAsset(page, "招聘方向 JSON：[]");
  await replyToAsset(page, "是");
  const created = (await state(page)).opportunities.at(-1);
  await replyToAsset(page, "招聘需求摘要：需要补充测试平台方向");
  const other = await context.newPage();
  await other.goto("#/opportunities/" + created.id);
  await button(other, "编辑资料").click();
  await field(other, "机会名称").fill("另一页面修订的名称");
  await button(other, "保存修改").click();
  await expect(other.getByRole("dialog")).toHaveCount(0);
  await expect.poll(async () => (await state(page)).opportunities.at(-1).title).toBe("另一页面修订的名称");
  await replyToAsset(page, "是");
  await expect(page.getByText(/资料已被更新/).first()).toBeVisible();
  expect((await state(page)).opportunities.at(-1).summary).toBe(created.summary);
  await replyToAsset(page, "重新核对");
  await expect(page.locator(".s2-hunter-reply").filter({ has: page.getByRole("heading", { name: "待确认的招聘机会" }) })).toContainText("另一页面修订的名称");
  await replyToAsset(page, "机会名称：另一页面修订的名称");
  await replyToAsset(page, "是");
  expect((await state(page)).opportunities.at(-1).title).toBe("另一页面修订的名称");
  expect((await state(page)).opportunities.at(-1).summary).toContain("补充测试平台方向");
  await other.close();
});

test("检查证据：纯状态说明仍有专用块，记录问题但不自动迁移业务操作", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/tasks/position-vla?state=limited");
  await expect(page.locator(".s2-permission-state")).toContainText("部分公开来源暂不可用");
  await capture(page, "audit-04-readonly-permission-state");
  await page.goto("#/tasks/career-linhao?state=waiting");
  await expect(page.locator(".s3-external-wait")).toBeVisible();
  await page.locator(".s3-external-wait").scrollIntoViewIfNeeded();
  await capture(page, "audit-05-waiting-summary-and-action");
  await errors();
});
