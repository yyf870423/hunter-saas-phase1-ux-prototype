import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { taskDesignScenarios } from "../../src/stage2/task-design-scenarios";
import { confirmClientOpportunity } from "../stage3/client-helpers";

const out = "/Users/eric.yu/job_hunting/docs/hb-test-20261104/round4/local-align/task-design-all-20261118";
const input = page => page.getByRole("textbox", { name: "任务对话输入" });
const latestResultScenes = new Set(["recruiting-source", "recruiting-ingestion", "identity-conflict", "recruiting-none", "recruiting-wait", "recruiting-reply", "pipeline", "recruiting-reserve-draft", "recruiting-reserve-saved", "stream-error", "source-limited", "source-error", "client", "client-opportunity-draft", "client-no-contact", "career-none", "career-new-resume", "periodic-wait", "periodic-running", "periodic-partial", "periodic-graph", "periodic-mail", "periodic-stopped", "periodic-empty"]);
async function send(page, text) { await input(page).fill(text); await input(page).press("Enter"); }
test.beforeEach(async ({ page }) => {
  page.__failures = [];
  page.on("pageerror", error => page.__failures.push(error.message));
  page.on("console", message => { if (message.type() === "error") page.__failures.push(message.text()); });
  await page.route("**/*", async route => {
    const request = route.request(), url = new URL(request.url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname) && !["data:", "blob:"].includes(url.protocol)) { page.__failures.push(`external:${url.origin}`); return route.abort(); }
    if (!["GET", "HEAD"].includes(request.method())) { page.__failures.push(`write:${request.method()}`); return route.abort(); }
    return route.continue();
  });
});
test.afterEach(async ({ page }) => { expect(page.__failures).toEqual([]); });
for (const width of [1440, 390]) for (const [id, title, route, text] of taskDesignScenarios) test(`${id} ${width}px ${title}`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`#${route}`);
  if (id === "periodic-running") await page.locator(".s2-periodic-list > button").first().click();
  if (id === "recruiting-dynamic") {
    await send(page, "为当前岗位整理人选，不要联系。");
    await page.getByRole("button", { name: "查看人选结果", exact: true }).click();
  }
  if (["recruiting-reserve-draft", "recruiting-reserve-saved", "position-map-asset", "position-pipeline-asset"].includes(id)) {
    if (id.startsWith("position-")) await page.goto("#/tasks/position-vla?state=review");
    await send(page, "将85分以上的人加入岗位储备，但不要选择赵星羽");
    await expect(page.locator(".s2-decision-thread").last()).toContainText("85 分以上");
    if (id !== "recruiting-reserve-draft") {
      await send(page, "是");
      await expect(page.locator(".s2-timeline")).toContainText("已应用审核决定");
      if (id.startsWith("position-")) await page.goto(`#${route}`);
    }
  }
  if (id === "report-preview") await page.locator(".recommendation-report-file").last().getByRole("button", { name: "在线查看", exact: true }).click();
  if (["plan-detail", "periodic-plan-detail"].includes(id)) {
    await page.getByRole("button", { name: /^执行计划/ }).click();
    if (id === "plan-detail") await page.getByRole("button", { name: /并行检索并接收补充资料/ }).click();
    else await page.locator(".s2-plan-step-toggle").first().click();
    await page.locator(".s2-step-processes .s2-internal-tasks > button").first().click();
    await expect(page.getByRole("complementary", { name: "当前检查内容" })).toBeVisible();
  }
  if (["client-no-contact", "client-contacts", "client-waiting", "client-reply", "client-followup"].includes(id)) {
    await confirmClientOpportunity(page);
    if (id === "client-contacts") await page.getByRole("button", { name: "查看联系人结果", exact: true }).click();
    else if (id !== "client-no-contact") {
      await send(page, "保存陈雨、周琪为联系人"); await send(page, "确认");
      await page.getByRole("button", { name: "确认并发送", exact: true }).click();
      await expect(page.getByRole("heading", { name: "等待陈雨回复招聘合作邮件", exact: true })).toBeVisible();
      if (id !== "client-waiting") {
        await send(page, "招聘需求摘要：客户已回复，新增机器人测试团队\n需求依据：陈雨确认需要进一步核对JD");
        if (id === "client-followup") {
          await expect(page.getByRole("heading", { name: "待确认的招聘机会", exact: true })).toBeVisible();
          await send(page, "是");
          await expect(page.getByRole("heading", { name: "持续跟进", exact: true })).toBeVisible();
          await send(page, "安排跟进\n跟进事项：核实完整JD\n跟进时间：2099-09-10 10:00");
          await expect(page.getByRole("heading", { name: "待确认的跟进安排", exact: true })).toBeVisible();
        }
      }
    }
  }
  if (id === "recruiting") await page.getByRole("button", { name: "查看候选人结果（18）", exact: true }).click();
  if (["organization", "organization-gaps", "organization-saved"].includes(id)) {
    await page.getByRole("button", { name: "查看组织梳理结果", exact: true }).click();
    if (id === "organization-gaps") await page.getByRole("tab", { name: "组织关系", exact: true }).click();
  }
  if (id === "career") await page.getByRole("button", { name: "查看完整岗位匹配", exact: true }).click();
  if (id.startsWith("history-") && width === 390) await page.getByRole("button", { name: "打开任务列表" }).click();
  if (text) await expect(page.locator("body")).toContainText(text, { timeout: 15000 });
  if (id === "loading") await expect(page.locator(".s2-workspace-loading")).toBeVisible();
  else await expect(page.locator("main")).toBeVisible();
  if (id.startsWith("periodic-") && id !== "periodic-draft" || id.startsWith("report")) {
    const composer = page.locator(".s2-composer").last();
    if (await composer.isVisible()) {
      const rect = await composer.boundingBox();
      expect(rect.y + rect.height).toBeLessThanOrEqual(width === 390 ? 799 : 990);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await expect(page.locator(".s2-hunter-reply").filter({ hasText: "\\n" })).toHaveCount(0);
  if (latestResultScenes.has(id)) await page.locator(".s2-conversation, .s2-run-timeline").evaluateAll(elements => elements.forEach(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" })));
  const focus = id === "recruiting-source" ? page.getByText("VLA 候选人简历（12 份）.zip", { exact: true }) : ["source-error", "source-limited", "stream-error"].includes(id) ? page.getByRole("heading", { name: text, exact: false }) : null;
  if (focus) await focus.last().evaluate(element => {
    const scroller = element.closest(".s2-conversation, .s2-run-timeline");
    scroller.scrollTo({ top: scroller.scrollTop + element.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 14, behavior: "instant" });
  });
  if (id === "organization-gaps" && width === 390) await page.locator(".s2-result-view-content").evaluate(element => { element.scrollTop = 200; });
  if (process.env.TASK_DESIGN_VERIFY_ONLY === "1") return;
  await mkdir(out, { recursive: true });
  const image = `${out}/${id}-${width}.png`;
  await page.screenshot({ path: image, animations: "disabled" });
  await writeFile(`${out}/${id}-${width}.json`, JSON.stringify({ id, title, route, width, screenshot: image, consoleErrors: page.__failures, capturedAt: new Date().toISOString() }, null, 2));
});
test("候选人写入范围不用纵向选择，修改/分析不执行", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=candidate-ingestion");
  await expect(page.locator(".s2-decision-request")).toHaveCount(0);
  await send(page, "仅写入");
  await expect(page.getByRole("heading", { name: "待确认的本批处理范围" })).toBeVisible();
  await send(page, "先不写入");
  await expect(page.locator(".s2-timeline")).toContainText("旧草稿未执行");
  await send(page, "写入后匹配全部招聘中岗位");
  await send(page, "确认");
  await expect(page.locator(".s2-timeline")).toContainText("真实写入、匹配与逐对象回执尚未接入");
});
test("独立身份核验自由补充不伪称已核实，计划可按步骤检查", async ({ page }) => {
  await page.goto("#/tasks/task-hand-team");
  await send(page, "请继续核实最近任职，不要合并");
  await expect(page.locator(".s2-task-timeline")).toContainText("未实际解析附件或核实新的任职资料");
  await page.getByRole("button", { name: /^执行计划/ }).click();
  await page.getByRole("button", { name: /比较身份与任职证据/ }).click();
  await page.locator(".s2-step-processes .s2-internal-tasks > button").first().click();
  await expect(page.getByRole("complementary", { name: "当前检查内容" })).toBeVisible();
  await expect(input(page)).toBeVisible();
});
test("周期身份决定可在原对话表达，普通文字不解决冲突", async ({ page }) => {
  await page.goto("#/tasks/periodic?view=runs&run=run-position-waiting");
  await send(page, "请先再查一下来源");
  await expect(page.locator(".s2-run-timeline")).toContainText("尚未据此修改身份关系");
  await send(page, "保留为不同人物");
  await expect(page.locator(".s2-run-timeline")).toContainText("决定已经写入这一轮");
});
