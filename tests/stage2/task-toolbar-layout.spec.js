import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { confirmClientOpportunity } from "../stage3/client-helpers";

const out = "/Users/eric.yu/job_hunting/docs/hb-test-20261104/round4/local-align/task-toolbar-20261118";
const rect = locator => locator.evaluate(element => { const box = element.getBoundingClientRect(); return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: box.width, height: box.height }; });
async function capture(page, name) { await mkdir(out, { recursive: true }); await page.screenshot({ path: `${out}/${name}.png`, animations: "disabled" }); }
test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on("pageerror", error => page.__errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") page.__errors.push(message.text()); });
  await page.route("**/*", route => {
    const request = route.request(), url = new URL(request.url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname) && !["data:", "blob:"].includes(url.protocol) || !["GET", "HEAD"].includes(request.method())) { page.__errors.push("unexpected request"); return route.abort(); }
    return route.continue();
  });
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

for (const [kind, path, breakpoint] of [["new", "/tasks", 1180], ["shared", "/tasks/mapping-embodied?state=gaps", 900], ["research", "/tasks/candidate-research-demo", 900]]) {
  for (const width of [320, 390, 760, 761, 871, 900, 901, 1024, 1180, 1181, 1440]) test(`${kind} ${width}px 任务列表入口在导航内并保留间距`, async ({ page }) => {
    await page.setViewportSize({ width, height: 866 }); await page.goto(`#${path}`);
    const trigger = page.getByRole("button", { name: "打开任务列表", exact: true });
    if (width <= breakpoint) {
      await expect(trigger).toBeVisible();
      expect(await trigger.evaluate(element => Boolean(element.closest(".s2-task-area-nav")))).toBe(true);
      const nav = await rect(page.getByRole("navigation", { name: "任务区域" })), button = await rect(trigger);
      expect(button.y - nav.y).toBeGreaterThanOrEqual(6); expect(nav.bottom - button.bottom).toBeGreaterThanOrEqual(6);
      expect(nav.right - button.right).toBeGreaterThanOrEqual(12);
      await trigger.click(); await expect(page.getByRole("dialog", { name: "任务列表" })).toBeVisible();
      await page.getByRole("dialog", { name: "任务列表" }).getByRole("button", { name: "关闭", exact: true }).click();
      if ([390, 871, 1024].includes(width)) await capture(page, `${kind}-navigation-${width}`);
    } else await expect(trigger).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

const readers = [
  ["candidate", "/tasks/position-vla?state=review", "查看候选人结果（18）", "关闭结果"],
  ["organization", "/tasks/mapping-embodied?state=gaps", "查看组织梳理结果", "关闭结果"],
  ["career", "/tasks/career-linhao?state=waiting", "查看完整岗位匹配", "关闭结果"],
  ["contacts", "/tasks/client-xinglan", "查看联系人结果", "关闭结果"],
  ["report", "/positions/position-vla?tab=matching&report=linhao", null, "关闭文件预览"],
  ["periodic", "/tasks/periodic?view=runs&run=run-position-waiting", null, "关闭检查区"],
  ["identity", "/tasks/task-hand-team", null, "关闭检查区"],
];
for (const [kind, path, entry, closeName] of readers) for (const width of [320, 390, 871, 1440]) test(`${kind} ${width}px 全宽恢复、关闭及标题不重叠`, async ({ page }) => {
  await page.setViewportSize({ width: Math.max(width, 871), height: 866 }); await page.goto(`#${path}`);
  if (kind === "contacts") await confirmClientOpportunity(page);
  if (!entry && kind !== "report") {
    await expect(page.locator(".s2-runtime, .s2-step-processes")).toHaveCount(0);
    await expect(page.locator(".s2-task-question").last()).toBeVisible();
    await page.setViewportSize({ width, height: 866 });
    await expect(page.getByRole("textbox", { name: "任务对话输入" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await capture(page, `${kind}-lightweight-dialogue-${width}`);
    return;
  }
  if (entry) await page.getByRole("button", { name: entry, exact: true }).click();
  else if (kind === "report") await page.locator(".recommendation-report-file").last().getByRole("button", { name: "在线查看", exact: true }).click();
  const input = page.getByRole("textbox", { name: "任务对话输入" });
  await input.fill("保留这段未发送的补充要求");
  await page.getByRole("separator", { name: "调整对话与结果宽度" }).press("Home");
  await page.setViewportSize({ width, height: 866 });
  const restore = page.getByRole("button", { name: "恢复对话与结果分栏", exact: true }), close = page.getByRole("button", { name: closeName, exact: true });
  await expect(restore).toBeVisible();
  expect(await restore.evaluate(element => element.parentElement === element.closest("header")?.querySelector(".s2-workspace-header-actions"))).toBe(true);
  const { r, c, header, file } = await page.evaluate(closeLabel => {
    const box = element => { const b = element.getBoundingClientRect(); return { x: b.x, y: b.y, right: b.right, bottom: b.bottom, width: b.width, height: b.height }; };
    const restoreButton = document.querySelector('button[aria-label="恢复对话与结果分栏"]'), closeButton = document.querySelector(`button[aria-label="${closeLabel}"]`);
    return { r: box(restoreButton), c: box(closeButton), header: box(closeButton.closest("header")), file: document.querySelector(".s2-artifact-file-switch") ? box(document.querySelector(".s2-artifact-file-switch")) : null };
  }, closeName);
  expect(Math.abs(r.y + r.height / 2 - c.y - c.height / 2)).toBeLessThan(1);
  expect(c.x - r.right).toBeGreaterThanOrEqual(7); expect(header.bottom - c.bottom).toBeGreaterThanOrEqual(7);
  if (kind === "report") {
    expect(file.right).toBeLessThanOrEqual(r.x - 6);
  }
  await capture(page, `${kind}-result-wide-${width}`);
  if (kind === "organization" && width === 871) await writeFile(`${out}/after.json`, JSON.stringify({ restore: r, close: c, resultControlCenterOffset: r.y + r.height / 2 - c.y - c.height / 2 }, null, 2));
  await restore.click(); await expect(input).toHaveValue("保留这段未发送的补充要求");
  await page.setViewportSize({ width: Math.max(width, 871), height: 866 });
  await page.getByRole("separator", { name: "调整对话与结果宽度" }).press("End");
  await page.setViewportSize({ width, height: 866 });
  await expect(restore).toBeVisible();
  expect(await restore.evaluate(element => Boolean(element.closest(".s2-task-area-nav,.s2-detail-header")))).toBe(true);
  const history = page.getByRole("button", { name: "打开任务列表", exact: true });
  if (await history.isVisible()) {
    const a = await rect(history), b = await rect(restore);
    expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(1); expect(b.x - a.right).toBeGreaterThanOrEqual(7);
  }
  await capture(page, `${kind}-dialogue-wide-${width}`);
  await restore.click(); await expect(input).toHaveValue("保留这段未发送的补充要求");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await expect(page.locator(".s2-reading-restore")).toHaveCount(0);
});
