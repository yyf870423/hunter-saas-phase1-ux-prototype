import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base =
  process.env.TASK_DIALOGUE_URL ||
  "http://127.0.0.1:1425/hunter-saas-phase1-ux-prototype/";
const output =
  process.env.TASK_DIALOGUE_CAPTURE_DIR ||
  "artifacts/task-dialogue-20261128";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const reports = [];
try {
  for (const width of [795, 1280, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 865 },
      locale: "zh-CN",
    });
    const page = await context.newPage();
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        failures.push(
          `${response.status()} ${new URL(response.url()).pathname}`,
        );
    });
    for (const [id, route, focus] of [
      ["confirmation", "/tasks/client-xinglan", ".s2-execution-approval"],
      [
        "single",
        "/tasks/position-vla?state=candidate-ingestion",
        ".s2-task-question",
      ],
      ["multiple", "/tasks/mapping-embodied?state=gaps", ".s2-task-question"],
      ["input", "/tasks/task-hand-team", ".s2-task-question"],
      [
        "periodic",
        "/tasks/periodic?view=runs&run=run-position-waiting",
        ".s2-task-question",
      ],
    ]) {
      await page.goto(`${base}#${route}`);
      await page.locator(focus).last().waitFor({ state: "visible" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator(focus).last().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `${output}/${id}-${width}.png`,
        animations: "disabled",
      });
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        planPanels: document.querySelectorAll(
          ".s2-runtime, .s2-plan-step-toggle",
        ).length,
        questionMode:
          document.querySelector(".s2-task-question")?.dataset.questionMode,
        composer: (() => {
          const box = document
            .querySelector(".s2-composer")
            .getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height };
        })(),
      }));
      reports.push({ id, route, width, geometry, failures: [...failures] });
    }
    await page.goto(`${base}#/tasks/task-interview-summary`);
    await page.evaluate(() => document.fonts.ready);
    const input = page.getByRole("textbox", { name: "任务对话输入" });
    await input.fill("先单独列出待确认事项，不要保存");
    await input.press("Enter");
    await page.locator(".s2-agent-work.is-working").waitFor();
    await page.screenshot({ path: `${output}/working-${width}.png` });
    await page
      .locator('.s2-agent-duration[data-elapsed-kind="measured"]')
      .waitFor();
    await page.screenshot({ path: `${output}/completed-${width}.png` });
    reports.push({
      id: "working-and-completed",
      width,
      failures: [...failures],
    });
    await context.close();
  }
  await writeFile(
    `${output}/layout-report.json`,
    JSON.stringify(reports, null, 2),
  );
  if (
    reports.some(
      (report) =>
        report.failures.length ||
        report.geometry?.overflow ||
        report.geometry?.planPanels,
    )
  )
    throw Error("页面或布局检查未通过，请查看 layout-report.json");
  console.log(
    JSON.stringify({
      screenshots: 21,
      reports: reports.length,
      output,
      failures: 0,
    }),
  );
} finally {
  await browser.close();
}
