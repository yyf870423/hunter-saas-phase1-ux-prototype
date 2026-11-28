import { expect as baseExpect, test } from "@playwright/test";
import {
  TASK_DEMO_TURN_MS,
  TASK_DEMO_RESEARCH_MS,
} from "../../src/stage2/task-timing";
const expect = baseExpect.configure({ timeout: TASK_DEMO_TURN_MS + 5000 });

test.describe.configure({ mode: "parallel" });
const input = (page) => page.getByRole("textbox", { name: "任务对话输入" });
const duration = (page) =>
  page.locator('.s2-agent-duration[data-elapsed-kind="measured"]').last();

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
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      !["GET", "HEAD"].includes(request.method())
    ) {
      page.__errors.push("unexpected network request");
      return route.abort();
    }
    return route.continue();
  });
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

async function checkElapsed(page, started, minimum) {
  await expect(duration(page)).toBeVisible({ timeout: minimum + 8000 });
  const reported = Number(await duration(page).getAttribute("data-elapsed-ms"));
  const observed = await page.evaluate(
    (start) => performance.now() - start,
    started,
  );
  expect(reported).toBeGreaterThanOrEqual(minimum - 100);
  expect(Math.abs(reported - observed)).toBeLessThan(800);
  await expect(duration(page)).toHaveText(
    `处理用时 ${Math.max(1, Math.round(reported / 1000))} 秒`,
  );
  await expect(page.locator(".s2-agent-work.is-working")).toHaveCount(0);
  await expect(page.locator(".s1-toast")).toHaveCount(0);
  return { reported, observed };
}

for (const width of [795, 1440])
  test(`${width}px普通处理真实等待约十二秒，显示值来自同一次计时`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 865 });
    await page.goto("#/tasks/task-interview-summary");
    await expect(page.locator(".s2-agent-duration")).toHaveCount(0);
    await input(page).fill("先单独列出待确认事项，不要保存");
    const started = await page.evaluate(() => performance.now());
    await input(page).press("Enter");
    await expect(page.locator(".s2-agent-work.is-working")).toContainText(
      "读取内容 · 本轮反馈与补充要求",
    );
    await page.screenshot({ path: testInfo.outputPath("working.png") });
    const measured = await checkElapsed(page, started, TASK_DEMO_TURN_MS);
    await page.screenshot({ path: testInfo.outputPath("completed.png") });
    await testInfo.attach("measured-time", {
      body: JSON.stringify(measured),
      contentType: "application/json",
    });
  });

test("首轮客户调研按实际推进计时，不填预置秒数", async ({
  page,
}, testInfo) => {
  await page.goto("#/tasks/client-xinglan");
  await expect(page.locator(".s2-agent-work.is-working")).toBeVisible();
  await expect(page.locator(".s2-hunter-reply.is-streaming").first()).toBeVisible();
  await expect(page.locator(".s2-stream-caret")).toHaveCount(0);
  const started = await page.evaluate(() => performance.now());
  await expect(
    page.getByRole("heading", { name: "保存这条潜在招聘机会？", exact: true }),
  ).toBeVisible({ timeout: TASK_DEMO_TURN_MS + 3000 });
  const measured = await checkElapsed(page, started, TASK_DEMO_TURN_MS);
  await testInfo.attach("initial-research-time", {
    body: JSON.stringify(measured),
    contentType: "application/json",
  });
});

test("深入调研显示累计二十四秒，包含前置处理和核实阶段", async ({
  page,
}, testInfo) => {
  await page.goto("#/tasks/candidate-research-demo");
  await input(page).fill("调研前三位，核实预训练经历");
  const started = await page.evaluate(() => performance.now());
  await input(page).press("Enter");
  const measured = await checkElapsed(
    page,
    started,
    TASK_DEMO_TURN_MS + TASK_DEMO_RESEARCH_MS,
  );
  await expect(
    page
      .getByRole("complementary", { name: "候选人调研结果" })
      .locator(".s2-result-comparison > article"),
  ).toHaveCount(3);
  await testInfo.attach("full-research-time", {
    body: JSON.stringify(measured),
    contentType: "application/json",
  });
});

test("直接打开历史结果不显示未经测量的秒数", async ({ page }) => {
  for (const route of [
    "/tasks/position-vla?state=review",
    "/tasks/mapping-embodied?state=gaps",
    "/tasks/task-hand-team",
    "/tasks/task-interview-summary",
  ]) {
    await page.goto(`#${route}`);
    await expect(page.locator(".s2-hunter-reply").first()).toBeVisible();
    await expect(page.locator(".s2-agent-duration")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("示例处理用时");
  }
});

test("创建任务后只等待一次，不在新建页和详情页重复等待", async ({
  page,
}, testInfo) => {
  await page.goto("#/new?positionId=position-vla");
  await input(page).fill("为当前岗位整理人选，不要联系。");
  const started = await page.evaluate(() => performance.now());
  await input(page).press("Enter");
  await expect(
    page.getByRole("button", { name: "查看人选结果", exact: true }),
  ).toBeVisible({ timeout: TASK_DEMO_TURN_MS + 5000 });
  const measured = await checkElapsed(page, started, TASK_DEMO_TURN_MS);
  await testInfo.attach("create-task-time", {
    body: JSON.stringify(measured),
    contentType: "application/json",
  });
});

test("补充文件后不叠加第二次等待，结果耗时与实际等待一致", async ({
  page,
}, testInfo) => {
  await page.goto("#/new?positionId=position-vla");
  await input(page).fill("为当前岗位整理人选，不要联系。");
  await input(page).press("Enter");
  await expect(
    page.getByRole("button", { name: "查看人选结果", exact: true }),
  ).toBeVisible({ timeout: TASK_DEMO_TURN_MS + 5000 });
  await page
    .locator('.s2-composer input[type="file"]')
    .setInputFiles({
      name: "计时验证.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("【仅供本地原型计时验证】补充资料，不进行对外联系。"),
    });
  await input(page).fill("参考补充资料，重新整理");
  const started = await page.evaluate(() => performance.now());
  await input(page).press("Enter");
  await expect(input(page)).toBeDisabled();
  await expect(input(page)).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "查看人选结果", exact: true }),
  ).toBeVisible();
  const measured = await checkElapsed(page, started, TASK_DEMO_TURN_MS);
  await testInfo.attach("file-followup-time", {
    body: JSON.stringify(measured),
    contentType: "application/json",
  });
});
