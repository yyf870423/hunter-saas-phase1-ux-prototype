import { expect as baseExpect, test } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 45000 });
test.describe.configure({ mode: "parallel", timeout: 150000 });
const input = (page) => page.getByRole("textbox", { name: "任务对话输入" });
const output = (page) => page.locator('.s2-hunter-reply[data-output-state="streaming"]');
const idle = async (page) => expect(page.locator('[data-output-busy="true"]')).toHaveCount(0);
const reply = (page) => page.locator('.s2-hunter-reply[data-reply-generation="1"]').first();

test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on("pageerror", (error) => page.__errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") page.__errors.push(message.text()); });
  await page.route("**/*", (route) => {
    const request = route.request(), url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname) || !["GET", "HEAD"].includes(request.method())) {
      page.__errors.push("unexpected request"); return route.abort();
    }
    return route.continue();
  });
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

for (const width of [795, 1440]) test(`${width}px新回复逐步增长而非整段出现，完成后正文和控件恢复`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 865 });
  await page.goto("#/tasks/task-interview-summary");
  await expect(output(page)).toHaveCount(0);
  const old = await page.locator(".s2-hunter-reply").first().textContent();
  await input(page).fill("先单独列出待确认事项，不要保存"); await input(page).press("Enter");
  await expect(output(page)).toHaveCount(1);
  await page.waitForTimeout(250);
  const first = await reply(page).locator(":scope > p:not(.s2-agent-duration)").textContent();
  await page.screenshot({ path: info.outputPath("partial.png") });
  await page.waitForTimeout(300);
  const second = await reply(page).locator(":scope > p:not(.s2-agent-duration)").textContent();
  expect(second.length).toBeGreaterThan(first.length);
  expect(second.length).toBeLessThan(50);
  await expect(input(page)).toBeDisabled();
  await expect(page.getByRole("button", { name: "停止", exact: true })).toBeVisible();
  await idle(page);
  await expect(reply(page)).toHaveAttribute("data-output-state", "complete");
  await expect(reply(page)).toContainText("补充要求已保留在当前摘要任务中，尚未写入候选人跟进记录，也未发起对外联系。");
  await expect(input(page)).toBeEnabled();
  expect(await page.locator(".s2-hunter-reply").first().textContent()).toBe(old);
  await expect(page.locator(".s2-stream-caret,.s2-runtime,.s1-toast")).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("complete.png") });
});

test("停止流式保留部分正文，后续没有迟到文字且可以发起新一轮", async ({ page }) => {
  await page.goto("#/tasks/task-interview-summary");
  await input(page).fill("先列待确认事项"); await input(page).press("Enter");
  await expect(output(page)).toHaveCount(1); await page.waitForTimeout(300);
  await page.getByRole("button", { name: "停止", exact: true }).click();
  const stopped = page.locator('.s2-hunter-reply[data-output-state="stopped"]');
  await expect(stopped).toHaveCount(1);
  const text = await stopped.textContent();
  await page.waitForTimeout(1800);
  expect(await stopped.textContent()).toBe(text);
  await expect(page.getByText("已停止生成，已显示的内容保留。可以继续补充要求。")).toBeVisible();
  await input(page).fill("继续整理，不要保存"); await input(page).press("Enter");
  await expect(page.locator('.s2-hunter-reply[data-reply-generation="2"][data-output-state="streaming"]')).toHaveCount(1);
  await idle(page);
  expect(await stopped.textContent()).toBe(text);
});

test("公司调研多条回复顺序流式，期间不能提前确认，表格最终完整", async ({ page }, info) => {
  await page.goto("#/tasks/client-xinglan");
  await expect(output(page)).toHaveCount(1);
  await expect(page.locator(".s2-agent-work.is-working")).toHaveCount(0);
  await idle(page);
  await expect(page.locator(".s2-agent-work.is-working")).toContainText("检索公开资料");
  await expect(page.getByRole("heading", { name: "公司值得继续核实招聘需求" })).toBeVisible();
  await expect(output(page)).toHaveCount(1);
  const approval = page.getByRole("region", { name: "本次操作确认", exact: true });
  await expect(approval.getByRole("button", { name: "确认入库" })).toBeDisabled();
  await page.screenshot({ path: info.outputPath("queued-replies.png") });
  await idle(page);
  await expect(page.locator(".s2-markdown-table").first()).toBeVisible();
  await expect(page.locator(".s2-markdown-table").first().locator("tbody tr")).toHaveCount(3);
  await expect(approval.getByRole("button", { name: "确认入库" })).toBeEnabled();
  await expect(page.locator(".s2-hunter-reply.is-streaming[data-output-state=streaming]")).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("company-complete.png") });
});

test("切换任务销毁未输出内容，不串入另一段对话", async ({ page }) => {
  await page.goto("#/tasks/task-interview-summary");
  await input(page).fill("单独列出待确认事项"); await input(page).press("Enter");
  await expect(output(page)).toHaveCount(1);
  await page.goto("#/tasks/task-hand-team");
  await expect(output(page)).toHaveCount(0);
  await page.waitForTimeout(2000);
  await expect(page.locator("body")).not.toContainText("补充要求已保留在当前摘要任务中");
});

test("历史结果即时阅读，不重播；推荐报告修改按同一流式标准", async ({ page }, info) => {
  await page.goto("#/positions/position-vla?tab=matching&report=linhao");
  await expect(page.getByText("推荐报告初稿已经生成。")).toBeVisible();
  await expect(output(page)).toHaveCount(0);
  await input(page).fill("补充团队规模，保留风险提示"); await input(page).press("Enter");
  await expect(page.locator(".s2-agent-work.is-working")).toContainText("当前报告");
  await expect(output(page)).toHaveCount(1);
  await page.screenshot({ path: info.outputPath("report-streaming.png") });
  await idle(page);
  await expect(page.locator("body")).toContainText("风险提示和待核实信息仍保留");
});

test("周期轮次的历史摘要不重播，新的补充回复流式且不跳轮次", async ({ page }) => {
  await page.goto("#/tasks/periodic?view=runs&run=run-position-waiting");
  await expect(output(page)).toHaveCount(0);
  await input(page).fill("暂不合并，先核对机构"); await input(page).press("Enter");
  await expect(output(page)).toHaveCount(1);
  await expect(page).toHaveURL(/run=run-position-waiting/);
  await idle(page);
  await expect(page.locator(".s2-decision-thread").last()).toContainText("尚未据此修改身份关系");
});

test("减少动态效果时仍按短语流式呈现，不增加光标或空间动画", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("#/tasks/task-interview-summary");
  await input(page).fill("仅列待确认事项"); await input(page).press("Enter");
  await expect(output(page)).toHaveCount(1);
  await page.waitForTimeout(200);
  const before = await reply(page).textContent();
  await page.waitForTimeout(200);
  expect((await reply(page).textContent()).length).toBeGreaterThan(before.length);
  await idle(page);
  await expect(page.locator(".s2-stream-caret")).toHaveCount(0);
});

test("首轮流式停止会同步停住后续自动步骤，已显示内容不清空", async ({ page }) => {
  await page.goto("#/tasks/client-xinglan");
  await expect(output(page)).toHaveCount(1); await page.waitForTimeout(300);
  await page.getByRole("button", { name: "停止", exact: true }).click();
  const stopped = page.locator('.s2-hunter-reply[data-output-state="stopped"]').first();
  await expect(stopped).toBeVisible();
  const partial = await stopped.textContent();
  await page.waitForTimeout(13000);
  expect(await stopped.textContent()).toBe(partial);
  await expect(page.getByRole("heading", { name: "公司值得继续核实招聘需求" })).toHaveCount(0);
  await expect(page.locator(".s2-agent-work.is-working")).toHaveCount(0);
});

test("新建任务在输出中停止会保留半段回复，并取消自动进入任务", async ({ page }) => {
  await page.goto("#/new");
  await input(page).fill("为星澜机器人的VLA岗位找人，不要联系"); await input(page).press("Enter");
  await expect(output(page)).toHaveCount(1); await page.waitForTimeout(300);
  await page.getByRole("button", { name: "停止", exact: true }).click();
  const stopped = page.locator('.s2-hunter-reply[data-output-state="stopped"]');
  await expect(stopped).toHaveCount(1);
  const text = await stopped.textContent();
  await page.waitForTimeout(2000);
  expect(await stopped.textContent()).toBe(text);
  await expect(page).toHaveURL(/#\/new$/);
  await expect(page.locator(".s2-user-message")).toContainText("为星澜机器人的VLA岗位找人");
});

test("单资产整理停止后不迟到，重新提问只等待一次准备时间", async ({ page }) => {
  await page.goto("#/new?positionId=position-vla");
  await input(page).fill("为当前岗位整理人选，不要联系"); await input(page).press("Enter");
  await expect(output(page)).toHaveCount(1); await page.waitForTimeout(200);
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await page.waitForTimeout(13000);
  await expect(page.getByRole("button", { name: "查看人选结果", exact: true })).toHaveCount(0);
  await input(page).fill("继续整理，不要联系");
  const started = Date.now(); await input(page).press("Enter");
  await expect(page.getByRole("button", { name: "查看人选结果", exact: true })).toBeVisible();
  await idle(page);
  expect(Date.now() - started).toBeLessThan(24000);
});

test("阅读上方内容时流式不强拉到底，追加段落也不重播已显示正文", async ({ page }) => {
  await page.goto("#/tasks/client-xinglan");
  await idle(page);
  await expect(page.locator(".s2-agent-work.is-working")).toBeVisible();
  const intro = await page.locator(".s2-hunter-reply").first().locator("p").first().textContent();
  await expect(page.getByRole("heading", { name: "公司值得继续核实招聘需求" })).toBeVisible();
  expect(await page.locator(".s2-hunter-reply").first().locator("p").first().textContent()).toBe(intro);
  const scroller = page.locator(".s2-conversation").first();
  await expect.poll(() => scroller.evaluate(node => node.scrollHeight - node.clientHeight)).toBeGreaterThan(120);
  await scroller.evaluate(node => { node.scrollTop = 0; node.dispatchEvent(new Event("scroll")); });
  await page.waitForTimeout(1000);
  expect(await scroller.evaluate(node => node.scrollTop)).toBeLessThanOrEqual(1);
  await idle(page);
});
