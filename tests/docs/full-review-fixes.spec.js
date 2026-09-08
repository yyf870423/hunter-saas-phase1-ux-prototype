import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { replyToAsset } from "../stage4/opportunity-helpers";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

const button = (page, name) => page.getByRole("button", { name, exact: true });
const readRuns = (page) => page.evaluate(() => JSON.parse(sessionStorage.getItem("hunter-periodic-runs-v1")));
async function capture(page, name) {
  await mkdir("artifacts/full-review-20260908/after", { recursive: true });
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `artifacts/full-review-20260908/after/${name}.png`, fullPage: !name.includes("paper-delete"), animations: "disabled" });
}

test("周期计划改期不残留旧周期，暂停删除跨刷新保留", async ({ page }) => {
  await page.goto("#/tasks/periodic?selected=periodic-startups");
  await button(page, "调整任务").click();
  await replyToAsset(page, "改为每周三 10:00");
  const plan = page.locator(".s2-hunter-reply").filter({ has: page.getByRole("heading", { name: "周期性任务草案" }) });
  await expect(plan).toContainText("每周三 10:00");
  await expect(plan).not.toContainText("每周检查");
  await page.locator(".s2-composer textarea").fill("是");
  await button(page, "发送").click();
  await expect(page).toHaveURL(/#\/tasks\/periodic/);
  const detail = page.locator(".s2-periodic-detail");
  await expect(detail.locator("h2")).toContainText("检查中国大陆具身智能");
  await expect(detail).not.toContainText("9 月 7 日");
  await button(page, "暂停").click();
  await page.reload();
  await expect(detail).toContainText("已暂停");
  await capture(page, "desktop-periodic-paused");
  await button(page, "删除").click();
  await button(page, "确认删除").click();
  await page.reload();
  await expect(page.locator(".s2-periodic-list")).not.toContainText("检查中国大陆具身智能");
  for (let i = 0; i < 3; i += 1) {
    await button(page, "删除").click();
    await button(page, "确认删除").click();
  }
  await expect(page.getByRole("heading", { name: "还没有周期性任务" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "还没有周期性任务" })).toBeVisible();
});

test("已有运行复用，停止与新运行保留独立 ID", async ({ page }) => {
  await page.goto("#/tasks/periodic?selected=periodic-startups");
  await button(page, "立即运行").click();
  await expect(page).toHaveURL(/run=run-startups-active/);
  await button(page, "停止").click();
  const stopped = await readRuns(page);
  expect(stopped.find((item) => item.id === "run-startups-active").status).toBe("已停止");
  await page.reload();
  await expect(page.locator(".s2-run-detail > header")).toContainText("已停止");
  await page.goto("#/tasks/periodic?selected=periodic-startups");
  await button(page, "立即运行").click();
  await expect(page).not.toHaveURL(/run=run-startups-active/);
  const firstId = (await readRuns(page))[0].id;
  await button(page, "停止").click();
  await page.goto("#/tasks/periodic?selected=periodic-startups");
  await button(page, "立即运行").click();
  const runs = await readRuns(page);
  expect(runs[0].id).not.toBe(firstId);
  expect(runs.find((item) => item.id === firstId).status).toBe("已停止");
  await capture(page, "desktop-periodic-run");
});

test("周期运行的否定与仅分析不能隐式解决身份冲突", async ({ page }) => {
  await page.goto("#/tasks/periodic?view=runs&run=run-position-waiting");
  await replyToAsset(page, "否");
  await expect(page.locator(".s2-run-detail > header")).toContainText("等待用户");
  await button(page, "执行前确认").click();
  await page.getByRole("option", { name: /^仅分析/ }).click();
  await page.getByRole("button", { name: /^按较新资料合并/ }).click();
  await expect(page.locator(".s2-run-detail > header")).toContainText("等待用户");
  await button(page, "仅分析").click();
  await page.getByRole("option", { name: /^执行前确认/ }).click();
  await page.getByRole("button", { name: /^保留为不同人物/ }).click();
  await page.reload();
  await expect(page.locator(".s2-run-detail > header")).toContainText("正在运行");
  await expect(page.locator(".s2-user-message").filter({ hasText: "保留为不同人物" })).toBeVisible();
  expect((await readRuns(page)).find((item) => item.id === "run-position-waiting").followUps.map((message) => message.text)).toEqual(["否", "保留为不同人物"]);
  await page.setViewportSize({ width: 390, height: 844 });
  await capture(page, "mobile-periodic-decision");
  await page.goto("#/tasks/periodic?selected=periodic-position-refresh");
  await expect(page.locator(".s2-periodic-detail > header")).toContainText("已启用");
  await expect(page.locator(".s2-periodic-detail > header")).not.toContainText("等待用户");
});

for (const [device, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
  test(`${device}：论文仅保留删除 Modal，分页数量与实际一致`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/papers/paper-vla-survey");
    await expect(button(page, "编辑")).toHaveCount(0);
    await button(page, "删除").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await capture(page, `${device}-paper-delete`);
    await button(page, "取消").click();
    await expect(page).toHaveURL(/papers\/paper-vla-survey/);
    for (const [route, size] of [["papers", 4], ["patents", 4], ["candidates", 6], ["data/imports", 2]]) {
      await page.goto("#/" + route);
      await expect(page.getByText(`每页 ${size} 条`, { exact: true })).toHaveCount(1);
    }
    for (const route of ["papers", "patents"]) {
      await page.goto("#/" + route);
      await page.getByRole("checkbox").first().click();
      await page.locator(".s4-floating-bulk").getByRole("button", { name: "删除", exact: true }).click();
      await expect(page.getByRole("dialog")).toContainText("已选的 1 项");
      await page.getByRole("dialog").getByRole("button", { name: "取消", exact: true }).click();
      await expect(page.getByRole("checkbox").first()).toBeChecked();
    }
    await errors();
  });

  test(`${device}：图谱画布可视高度与详情不互相挤占`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("#/mappings/mapping-embodied");
    const canvas = page.locator(".tg-graph-workarea");
    await expect(canvas).toBeVisible();
    expect((await canvas.boundingBox()).height).toBeGreaterThanOrEqual(500);
    if (device === "mobile") expect((await canvas.boundingBox()).height).toBeLessThanOrEqual(530);
    await canvas.scrollIntoViewIfNeeded();
    await capture(page, `${device}-graph`);
  });
}

test("手机回收站选择框不遮挡清理状态", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/recycle-bin");
  const rows = page.locator(".s4-recycle-table article");
  await expect(rows).toHaveCount(4);
  for (const row of await rows.all()) {
    const checkbox = await row.getByRole("checkbox").boundingBox();
    const badge = await row.locator(".s1-status").boundingBox();
    expect(checkbox.y + checkbox.height).toBeLessThanOrEqual(badge.y);
  }
  await capture(page, "mobile-recycle");
});
