import { expect as baseExpect, test } from "@playwright/test";
import { taskDesignScenarios } from "../../src/stage2/task-design-scenarios";
import { TASK_DEMO_TURN_MS } from "../../src/stage2/task-timing";
const expect = baseExpect.configure({ timeout: TASK_DEMO_TURN_MS + 5000 });

const input = (page) => page.getByRole("textbox", { name: "任务对话输入" });
const question = (page) => page.locator(".s2-task-question").last();
const send = async (page, text) => {
  await input(page).fill(text);
  await input(page).press("Enter");
  await expect(input(page)).toBeEnabled();
};
const capture = process.env.TASK_DIALOGUE_CAPTURE_DIR;
test.describe.configure({ mode: "parallel", timeout: 90000 });

test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on("pageerror", (error) => page.__errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") page.__errors.push(message.text());
  });
  await page.route("**/*", (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) &&
      !["blob:", "data:"].includes(url.protocol)
    ) {
      page.__errors.push("external:" + url.origin);
      return route.abort();
    }
    if (!["GET", "HEAD"].includes(request.method())) {
      page.__errors.push("write:" + request.method());
      return route.abort();
    }
    return route.continue();
  });
});
test.afterEach(async ({ page }) => {
  expect(page.__errors).toEqual([]);
});

for (const [id, title, route] of taskDesignScenarios)
  test(`全场景 ${id} ${title}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`#${route}`);
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("执行计划");
    await expect(page.locator(".s2-runtime, .s2-plan-step-toggle")).toHaveCount(
      0,
    );
    await expect(page.locator(".s2-stream-caret")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (capture)
      await page.screenshot({
        path: `${capture}/scenarios/${id}.png`,
        animations: "disabled",
      });
  });

test("工作状态只在对话末尾一次性显示，完成后显示实测耗时与自然语言回复", async ({
  page,
}) => {
  await page.goto("#/tasks/task-interview-summary");
  await input(page).fill("先单独列出尚未确认的事项，不要保存");
  await input(page).press("Enter");
  await expect(page.locator(".s2-agent-work.is-working")).toContainText(
    "读取内容 · 本轮反馈与补充要求",
  );
  expect(
    await page
      .locator(".s2-agent-work")
      .evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain("monospace");
  await expect(page.locator(".s2-agent-work.is-working")).toContainText(
    "调用摘要整理工具",
  );
  await expect(
    page.locator('.s2-agent-duration[data-elapsed-kind="measured"]'),
  ).toHaveCount(1);
  await expect(page.locator(".s2-agent-work.is-working")).toHaveCount(0);
  await expect(page.locator(".s2-task-timeline")).toContainText(
    "补充要求已保留在当前摘要任务中",
  );
  await expect(page.locator(".s2-task-timeline details")).toHaveCount(0);
  await send(page, "再明确下一步要核实的信息，不要联系");
  await expect(
    page.locator('.s2-agent-duration[data-elapsed-kind="measured"]'),
  ).toHaveCount(2);
});

for (const width of [795, 1440])
  test(`${width}px公司调研分开呈现检索、读取与阶段结论，每项可阅读六秒`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 865 });
    await page.goto("#/tasks/client-xinglan");
    const status = page.locator(".s2-agent-work.is-working");
    await expect(status).toHaveText("检索公开资料 · 公司官网与招聘页面");
    await expect(page.locator(".s2-hunter-reply").first()).toContainText("已明确本轮目标");
    const first = await page.evaluate(() => performance.now());
    await page.screenshot({ path: testInfo.outputPath("search.png") });
    await expect(status).toHaveText("读取来源内容 · 核对公司身份、招聘变化与发布时间");
    const second = await page.evaluate(() => performance.now());
    expect(second - first).toBeGreaterThan(5700);
    await expect(page.locator(".s2-agent-work")).toHaveCount(1);
    await page.screenshot({ path: testInfo.outputPath("read.png") });
    await expect(page.getByRole("heading", { name: "公司值得继续核实招聘需求" })).toBeVisible();
    const completed = await page.evaluate(() => performance.now());
    expect(completed - second).toBeGreaterThan(5600);
    await expect(page.locator(".s2-hunter-reply").filter({ hasText: "预算仍未确认" }).first()).toBeVisible();
    await expect(status).toHaveCount(0);
    await expect(page.locator(".s2-stream-caret, .s2-runtime, .s1-toast")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("conclusion.png") });
    await testInfo.attach("stage-timing", { body: JSON.stringify({ firstOperationMs: second - first, secondOperationMs: completed - second }), contentType: "application/json" });
  });

test("岗位寻访六个具体操作依次停留，阶段结论保留但操作记录不堆叠", async ({ page }, testInfo) => {
  await page.goto("#/tasks/position-vla");
  const status = page.locator(".s2-agent-work.is-working");
  for (const text of [
    "读取内容 · 岗位 JD、硬要求与可放宽条件",
    "调用需求解析工具 · 核对找人范围与本轮边界",
    "检索人选 · 候选人库、知识图谱与论文专利",
    "检索公开资料 · 项目记录、公开履历与关联来源",
    "读取内容 · 人选资料、简历与原始来源",
    "调用人选匹配工具 · 核对身份、岗位要求与证据缺口",
  ]) {
    await expect(status).toHaveText(text, { timeout: 8000 });
    await expect(status).toHaveCount(1);
  }
  await expect(page.getByRole("heading", { name: "首批候选人已经可以审核" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "本轮检索范围已确定" })).toBeVisible();
  await expect(page.locator(".s2-agent-duration")).toContainText(/36 秒|37 秒/);
  await expect(page.locator(".s2-runtime, .s2-plan-step-toggle")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("recruiting-result.png") });
});

test("单选提交后仅生成待确认范围，不等同导入授权", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=candidate-ingestion");
  await question(page).getByRole("button", { name: "提交回答" }).click();
  await expect(question(page).getByRole("alert")).toContainText("请选择");
  await question(page)
    .getByRole("radio", { name: "仅写入", exact: false })
    .first()
    .click();
  await question(page).getByRole("button", { name: "提交回答" }).click();
  await expect(
    page.getByRole("heading", { name: "待确认的本批处理范围" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "确认导入", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".s2-timeline")).not.toContainText(
    "本版本地演示范围已确认",
  );
});

test("多选、文字补充和回答回显，点击选择本身不处理", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied?state=gaps");
  const q = question(page);
  await q.getByRole("checkbox", { name: "任职人身份", exact: true }).click();
  await q
    .getByRole("checkbox", { name: "当前任职与起止时间", exact: true })
    .click();
  await q
    .getByRole("textbox", { name: "补充说明" })
    .fill("先核实王奕，不保存或合并");
  await expect(page.locator(".s2-pending-message")).toHaveCount(0);
  await q.getByRole("button", { name: "提交回答" }).click();
  await expect(q).toContainText("已回答");
  await expect(q.locator(".s2-question-receipt")).toContainText(
    "任职人身份；当前任职与起止时间；先核实王奕",
  );
  await expect(page.locator(".s2-decision-thread").last()).toContainText(
    "尚未启动真实调研",
  );
  if (capture)
    await page.screenshot({ path: `${capture}/multiple-answered.png` });
});

test("自由输入校验、提交、停止后保留回答并可重试", async ({ page }) => {
  await page.goto("#/tasks/task-hand-team");
  const q = question(page);
  await q.getByRole("button", { name: "提交回答" }).click();
  await expect(q.getByRole("alert")).toHaveText("请填写你的要求。");
  await q.getByRole("textbox").fill("请先核实当前任职，不要合并人物");
  await q.getByRole("button", { name: "提交回答" }).click();
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await expect(q.getByRole("alert")).toContainText("处理已停止");
  await expect(q.getByRole("textbox")).toHaveValue(
    "请先核实当前任职，不要合并人物",
  );
  await q.getByRole("button", { name: "提交回答" }).click();
  await expect(q).toContainText("已回答");
  await expect(page.locator(".s2-task-timeline")).toContainText(
    "当前没有合并人物",
  );
});

test("停止前未执行的操作不会迟到，之后可继续新一轮", async ({ page }) => {
  await page.goto("#/tasks/task-interview-summary");
  await input(page).fill("不要保存，先核实任职时间");
  await input(page).press("Enter");
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await expect(page.locator(".s2-turn-receipt")).toContainText(
    "已停止本轮处理",
  );
  await page.waitForTimeout(TASK_DEMO_TURN_MS + 300);
  await expect(
    page.locator('.s2-agent-duration[data-elapsed-kind="measured"]'),
  ).toHaveCount(0);
  await send(page, "先整理待核实的问题，不要写入");
  await expect(
    page.locator('.s2-agent-duration[data-elapsed-kind="measured"]'),
  ).toHaveCount(1);
});

test("暂不回答和自然语言改需求均不扩大授权", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied?state=gaps");
  await question(page).getByRole("button", { name: "暂不回答" }).click();
  await expect(question(page)).toContainText("未扩大处理范围");
  await send(page, "核实王奕的身份冲突");
  await expect(page.locator(".s2-decision-thread").last()).toContainText(
    "没有启动真实调研",
  );
  await page.goto("#/tasks/task-hand-team");
  await send(page, "请先保留为两个人，不要合并");
  await expect(question(page)).toContainText("已转入对话");
  await expect(
    question(page).getByRole("button", { name: "提交回答" }),
  ).toHaveCount(0);
});

test("切换任务清理运行和草稿，不串入旧回复", async ({ page }) => {
  await page.goto("#/tasks/task-interview-summary");
  await input(page).fill("本轮唯一标记A，不保存");
  await input(page).press("Enter");
  await page.locator('[data-task-id="career-linhao"] .s2-history-item').click();
  await expect(page).not.toHaveURL(/task-interview-summary/);
  await page.waitForTimeout(TASK_DEMO_TURN_MS + 300);
  await expect(page.locator("#research-dialogue")).not.toContainText(
    "本轮唯一标记A",
  );
});

test("正常任务不出现黑色提示，必要反馈留在对话内", async ({ page }) => {
  await page.goto("#/tasks/task-interview-summary");
  await send(page, "先单独列出待确认事项，不要保存");
  await expect(page.locator(".s1-toast")).toHaveCount(0);
  await expect(page.locator(".s2-task-inline-feedback")).toHaveCount(0);
  await page.goto("#/tasks/position-vla?state=review");
  await page.getByRole("button", { name: "执行前确认", exact: true }).click();
  await page.getByRole("option", { name: /仅分析/ }).click();
  await expect(page.locator(".s2-task-inline-feedback")).toContainText(
    "仅分析",
  );
  await expect(page.locator(".s1-toast")).toHaveCount(0);
});

test("等待问题回答时不伪装持续运行，键盘切换单选", async ({ page }) => {
  await page.goto("#/new?state=clarify");
  await expect(page.locator(".s2-agent-work")).toContainText("等待你的回答");
  await expect(page.locator(".s2-agent-work.is-working")).toHaveCount(0);
  const radios = question(page).getByRole("radio");
  await radios.first().focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
  await expect(radios.first()).toHaveAttribute("aria-checked", "false");
});

test("问题可直接输入其他要求，提交后保留原文并回复", async ({ page }) => {
  await page.goto("#/new?state=clarify");
  await question(page)
    .getByRole("textbox")
    .fill("只核实最新融资信息，不查联系人");
  await question(page).getByRole("button", { name: "提交回答" }).click();
  await expect(page.locator(".s2-new-work-conversation")).toContainText(
    "已收到补充目标：只核实最新融资信息，不查联系人",
  );
  await expect(question(page)).toContainText("已回答");
  await expect(page.locator(".s1-toast")).toHaveCount(0);
});

test("快速重复提交问题只生成一个确认范围", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=candidate-ingestion");
  await question(page)
    .getByRole("radio", { name: "仅写入", exact: false })
    .first()
    .click();
  await question(page)
    .getByRole("button", { name: "提交回答" })
    .evaluate((button) => {
      button.click();
      button.click();
    });
  await expect(
    page.getByRole("heading", { name: "待确认的本批处理范围" }),
  ).toHaveCount(1);
  await expect(page.locator(".s2-decision-thread")).toHaveCount(1);
  await expect(page.locator(".s1-toast")).toHaveCount(0);
});

test("移除洞察引用不重置当前轮次的处理用时", async ({ page }) => {
  await page.goto("#/tasks/periodic?view=runs&run=run-mailbox-0903&quote=signal-mail-xinglan");
  await expect(page.locator(".s2-quote-chip")).toBeVisible();
  await send(page, "这条为什么值得关注？");
  await expect(page).not.toHaveURL(/quote=/);
  await expect(page.locator('.s2-agent-duration[data-elapsed-kind="measured"]')).toHaveCount(1);
  await expect(page.locator(".s2-turn-receipt")).toHaveCount(0);
  await expect(page.locator(".s1-toast")).toHaveCount(0);
});

test("旧版存下的计划详情不再恢复，结果阅读入口保留", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hunter-workstream-inspection", JSON.stringify({ kind: "task", id: "legacy-process", title: "旧计划处理详情" })));
  await page.goto("#/tasks/position-vla?state=review");
  await expect(page.locator(".s2-inspector")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "查看候选人结果（18）", exact: true })).toBeVisible();
});

test("其他页面的提示机制不受任务范围调整影响", async ({ page }) => {
  await page.goto("#/components");
  await page.getByRole("button", { name: "成功 Toast", exact: true }).click();
  await expect(page.locator(".s1-toast")).toContainText("修改已保存");
  await expect(page.locator(".s2-task-inline-feedback")).toHaveCount(0);
});
