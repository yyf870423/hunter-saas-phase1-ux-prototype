import { expect as baseExpect, test } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 45000 });
test.describe.configure({ mode: "parallel", timeout: 150000 });
const streaming = (page) => page.locator('.s2-hunter-reply[data-output-state="streaming"]');
const idle = (page) => expect(page.locator('[data-output-busy="true"]')).toHaveCount(0);
const input = (page) => page.getByRole("textbox", { name: "任务对话输入" });

test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on("pageerror", error => page.__errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") page.__errors.push(message.text()); });
  await page.route("**/*", route => {
    const request = route.request(), url = new URL(request.url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname) || !["GET", "HEAD"].includes(request.method())) {
      page.__errors.push("unexpected request"); return route.abort();
    }
    return route.continue();
  });
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

for (const width of [795, 1440]) test(`${width}px岗位寻访旧进度不能让下一阶段标题提前出现`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 865 });
  await page.addInitScript(() => {
    sessionStorage.setItem("hunter-workstream-phase", "4");
    sessionStorage.setItem("hunter-workstream-draft", "保留我的输入");
    sessionStorage.setItem("hunter-workstream-auth", "confirm");
  });
  await page.goto("#/tasks/position-vla");
  await expect(page.getByRole("heading", { name: "本轮检索范围已确定" })).toHaveCount(0);
  await expect(streaming(page)).toHaveCount(1);
  await page.screenshot({ path: info.outputPath("first-stream.png") });
  await expect(page.getByRole("heading", { name: "本轮检索范围已确定" })).toBeVisible();
  const previous = page.locator(".s2-hunter-reply").first();
  await expect(previous).toHaveAttribute("data-output-state", "complete");
  await expect(previous).toContainText("只形成审核结果，不执行对外联系。");
  await expect(page.getByRole("heading", { name: "候选人结果正在持续合并" })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("next-stage.png") });
  await idle(page);
  expect(await input(page).inputValue()).toBe("保留我的输入");
  expect(await page.evaluate(() => sessionStorage.getItem("hunter-workstream-auth"))).toBe("confirm");
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("hunter-workstream-completed-dialogue-v1")).phase)).toBe(2);
});

for (const [task, title] of [
  ["client-xinglan", "公司值得继续核实招聘需求"],
  ["mapping-embodied", "公司组织梳理清单已经建立"],
  ["career-linhao", "动向值得核实，但求职意愿仍未知"],
]) test(`${task}忽略没有输出完成标记的旧缓存`, async ({ page }) => {
  await page.addInitScript(task => sessionStorage.setItem(`hunter-stage3-${task}-phase`, "4"), task);
  await page.goto(`#/tasks/${task}`);
  await expect(streaming(page)).toHaveCount(1);
  await expect(page.locator(".s2-hunter-reply")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: title, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(task => sessionStorage.getItem(`hunter-stage3-${task}-completed-dialogue-v1`), task)).toBeNull();
  await expect(page.getByRole("heading", { name: title, exact: true })).toHaveCount(0);
});

test("完整历史可以恢复，下一阶段仍逐条输出；中途离开不覆盖完成点", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hunter-workstream-completed-dialogue-v1", JSON.stringify({ schemaVersion: 1, complete: true, phase: 2 })));
  await page.goto("#/tasks/position-vla");
  await expect(page.getByRole("heading", { name: "本轮检索范围已确定" })).toBeVisible();
  await expect(streaming(page)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "候选人结果正在持续合并" })).toHaveCount(0);
  await expect(streaming(page)).toHaveCount(1);
  await page.goto("#/tasks/task-interview-summary");
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("hunter-workstream-completed-dialogue-v1")).phase)).toBe(2);
});

test("公司确认卡片等本版全部正文完成后才显示，不只是禁用", async ({ page }, info) => {
  await page.addInitScript(() => {
    window.prematureReplies = [];
    const check = () => {
      let precedingOutput = false;
      for (const node of document.querySelectorAll(".s2-hunter-reply")) {
        if (node.dataset.outputState === "streaming") precedingOutput = true;
        else if (precedingOutput && node.dataset.outputState === "complete") {
          const clone = node.cloneNode(true);
          clone.querySelectorAll(".s2-agent-duration").forEach(item => item.remove());
          const text = clone.textContent.trim();
          if (text && !window.prematureReplies.includes(text)) window.prematureReplies.push(text);
        }
      }
    };
    new MutationObserver(check).observe(document, { subtree: true, attributes: true, childList: true, characterData: true });
  });
  await page.goto("#/tasks/client-xinglan");
  const approval = page.getByRole("region", { name: "本次操作确认", exact: true });
  await expect(page.getByRole("heading", { name: "公司值得继续核实招聘需求" })).toBeVisible();
  await expect(streaming(page)).toHaveCount(1);
  await expect(approval).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("no-premature-card.png") });
  await idle(page);
  await expect(approval.getByRole("button", { name: "确认入库" })).toBeEnabled();
  expect(await page.evaluate(() => window.prematureReplies)).toEqual([]);
  await page.screenshot({ path: info.outputPath("approval-after-output.png") });
});

test("停止本版正文后未显示的确认卡不会迟到", async ({ page }) => {
  await page.goto("#/tasks/client-xinglan");
  await expect(page.getByRole("heading", { name: "公司值得继续核实招聘需求" })).toBeVisible();
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await page.waitForTimeout(1800);
  await expect(page.getByRole("region", { name: "本次操作确认", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("hunter-stage3-client-xinglan-completed-dialogue-v1")).phase)).toBe(1);
});

test("新建澄清的选择与输入等说明流式完毕后才出现", async ({ page }) => {
  await page.goto("#/new");
  await input(page).fill("帮我看看云脉芯能"); await input(page).press("Enter");
  await expect(streaming(page)).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "需要补充任务目标" })).toHaveCount(0);
  await expect(page.locator(".s2-task-question")).toHaveCount(0);
  await idle(page);
  await expect(page.getByRole("heading", { name: "需要补充任务目标" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "只整理当前公开信息", exact: false })).toBeEnabled();
  await expect(page.getByRole("textbox", { name: "补充说明" })).toBeEnabled();
});

test("推荐报告旧文件可读，新文件等修订说明完成后才显示", async ({ page }, info) => {
  await page.goto("#/positions/position-vla?tab=matching&report=linhao");
  const filename = "林昊-具身智能VLA算法负责人-推荐报告-v3.md";
  await expect(page.getByText("林昊-具身智能VLA算法负责人-推荐报告-v2.md", { exact: true }).first()).toBeVisible();
  await input(page).fill("补充团队规模，保留风险提示"); await input(page).press("Enter");
  await expect(streaming(page)).toHaveCount(1);
  await expect(page.getByText(filename, { exact: true })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("report-before-complete.png") });
  await idle(page);
  await expect(page.getByText(filename, { exact: true }).first()).toBeVisible();
});
