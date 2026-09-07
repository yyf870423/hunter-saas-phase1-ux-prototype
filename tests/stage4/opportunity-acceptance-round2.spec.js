import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { createOpportunitySeed } from "../../src/stage4/opportunity-seed.js";
import { legacyLearningJd } from "../../src/stage4/opportunity-jd.js";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";
import { waitForOpportunityDraft, replyToAsset } from "./opportunity-helpers";

const key = "hunter-opportunity-lifecycle-v1";
const state = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
const button = (page, name) => page.getByRole("button", { name, exact: true });
const field = (page, label) => page.locator(".s4-form-field").filter({ has: page.locator("span", { hasText: new RegExp("^" + label + "\\*?$") }) }).locator("input,textarea");
const jd = "岗位职责\n负责机器人操作策略研发、训练评测和真机交付。\n任职要求\n具备机器人学习项目经验，能够独立定位与解决部署问题。";

async function shot(page, name) {
  await mkdir("artifacts/opportunity-acceptance-round2", { recursive: true });
  await page.evaluate(() => { window.scrollTo(0, 0); });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "artifacts/opportunity-acceptance-round2/" + name + ".png", fullPage: true, animations: "disabled" });
}

for (const [device, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
  test(device + "：发现潜在机会先确认，无联系人也可入库，无 JD 不建岗位", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/tasks/client-xinglan?state=no-contact");
    await expect(page.getByRole("heading", { name: "待确认的招聘机会", exact: true })).toBeVisible();
    await expect(button(page, "打开公司与联系人审核")).toHaveCount(0);
    await expect(button(page, "确认并发送")).toHaveCount(0);
    await expect(page.locator(".s2-runtime")).toContainText("确认是否记录潜在招聘机会");
    expect((await state(page)).opportunities).toHaveLength(4);
    await page.getByRole("heading", { name: "是否记录这条潜在招聘机会？", exact: true }).scrollIntoViewIfNeeded();
    await shot(page, device + "-discovery-review");
    await waitForOpportunityDraft(page);
    await replyToAsset(page, "否");
    expect((await state(page)).opportunities).toHaveLength(4);
    await expect(page.getByRole("heading", { name: "草稿已保留，未写入正式资料", exact: true })).toBeVisible();
    await replyToAsset(page, "是");
    await expect(page.getByText("暂未找到可以直接联系的招聘负责人", { exact: true })).toBeVisible();
    await replyToAsset(page, "招聘需求摘要：新部门成立，可能需要补充外部算法人才；尚未确认招聘计划。");
    await replyToAsset(page, "是");
    await expect(page.getByRole("link", { name: "查看招聘机会", exact: true })).toBeVisible();
    const opportunity = (await state(page)).opportunities.at(-1);
    expect(opportunity.contactId).toBe("");
    expect(opportunity.directions).toEqual([]);
    expect(opportunity.summary).toContain("尚未确认招聘计划");
    await page.getByRole("link", { name: "查看招聘机会", exact: true }).click();
    await page.getByRole("tab", { name: /^招聘方向/ }).click();
    await button(page, "添加方向").click();
    await field(page, "方向名称").fill("新部门算法工程师");
    await button(page, "保存方向").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await button(page, "形成岗位").click();
    await expect(field(page, "完整岗位 JD")).toHaveValue("");
    await expect(page.getByText("JD 来源：尚未取得 JD", { exact: true }).last()).toBeVisible();
    await button(page, "确认创建并关联").click();
    await expect(page.getByText("请提供实际岗位职责与任职要求，不能只填写岗位名称", { exact: true })).toBeVisible();
    expect((await state(page)).positions).toHaveLength(5);
    await field(page, "完整岗位 JD").fill(jd);
    await expect(page.getByText("JD 来源：本次用户输入 JD", { exact: true })).toBeVisible();
    await expect(page.getByText("请提供实际岗位职责与任职要求，不能只填写岗位名称", { exact: true })).toHaveCount(0);
    await page.locator(".s1-modal-body").evaluate((element) => { element.scrollTop = 0; });
    await shot(page, device + "-jd-conversion");
    await button(page, "确认创建并关联").click();
    await expect(page.getByRole("heading", { name: "岗位已形成", exact: true })).toBeVisible();
    const position = (await state(page)).positions.at(-1);
    expect(position.jd).toBe(jd);
    expect(position.sources[0].content).toBe(jd);
    expect(position.sources[0].label).toBe("本次用户输入 JD");
    await button(page, "返回招聘方向").click();
    await expect(page.getByText("JD 来源：已关联岗位 JD · v1", { exact: true })).toBeVisible();
    await errors();
  });

  test(device + "：资料页仅进入联系人详情，招聘方向来源可见", async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("#/opportunities/opportunity-xinglan?tab=profile");
    await expect(button(page, "寻找联系路径")).toHaveCount(0);
    await button(page, "查看联系人").click();
    await expect(page).toHaveURL(/companies\/company-xinglan\/contacts\/contact-chenyu/);
    await page.goto("#/opportunities/opportunity-xinglan?tab=directions");
    const learning = page.locator(".s4-direction-list article").filter({ hasText: "机器人学习负责人" });
    await expect(learning).toContainText("尚未取得 JD");
    await shot(page, device + "-direction-sources");
  });
}

test("旧原型 JD 只供查看，不清空历史或已编辑内容，也不进入 AI 草稿", async ({ page }) => {
  const seed = createOpportunitySeed();
  seed.opportunities[0].directions.find((item) => item.id === "direction-learning").jd = legacyLearningJd;
  seed.opportunities[1].directions.find((item) => item.id === "direction-tuojie-learning").jd = jd;
  await page.addInitScript(({ key, seed }) => localStorage.setItem(key, JSON.stringify(seed)), { key, seed });
  await page.goto("#/opportunities/opportunity-xinglan?tab=directions");
  const learning = page.locator(".s4-direction-list article").filter({ hasText: "机器人学习负责人" });
  await expect(learning).toContainText("历史原型样例");
  await button(learning, "查看 JD 来源").click();
  await expect(page.getByRole("dialog")).toContainText(legacyLearningJd);
  await page.getByRole("dialog").getByRole("button", { name: "关闭", exact: true }).last().click();
  await button(learning, "形成岗位").click();
  await expect(field(page, "完整岗位 JD")).toHaveValue("");
  await button(page, "AI 整理岗位").click();
  await expect(page.getByRole("heading", { name: "待确认的岗位", exact: true })).toBeVisible();
  const current = await state(page);
  expect(current.tasks.at(-1).draft.patch.jd).toBe("");
  expect(current.opportunities[0].directions.find((item) => item.id === "direction-learning").jd).toBe(legacyLearningJd);
  expect(current.opportunities[1].directions.find((item) => item.id === "direction-tuojie-learning").jd).toBe(jd);
  expect(current.tasks.at(-1).prompt).not.toContain(legacyLearningJd);
  expect(current.positions).toHaveLength(5);
});

test("自动模式和旧回复链接均不能跳过首次机会确认", async ({ page }) => {
  await page.goto("#/tasks/client-xinglan?state=reply");
  await expect(page.getByRole("heading", { name: "待确认的招聘机会", exact: true })).toBeVisible();
  await button(page, "执行前确认").click();
  await page.getByRole("option", { name: /^自动执行/ }).click();
  await page.getByPlaceholder("输入补充信息、决定或新的要求").fill("待确认事项：新公司招聘计划、负责人和完整 JD 均未确认。");
  await button(page, "发送").click();
  await expect(page.getByRole("heading", { name: "待确认的招聘机会", exact: true })).toBeVisible();
  expect((await state(page)).opportunities).toHaveLength(4);
  expect((await state(page)).tasks[0].authMode).toBe("auto");
  await expect(button(page, "打开公司与联系人审核")).toHaveCount(0);
  await expect(page.getByText("已收到陈雨的邮件回复", { exact: true })).toHaveCount(0);
});
