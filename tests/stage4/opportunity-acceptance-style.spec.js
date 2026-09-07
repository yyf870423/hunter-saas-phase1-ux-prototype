import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";
test.use({ actionTimeout: 8000 });

const output = "artifacts/opportunity-lifecycle/spacing";
const field = (page, label) => page.locator(".s4-form-field").filter({
  has: page.locator("span", { hasText: new RegExp("^" + label + "\\*?$") }),
});
const button = (page, name) => page.getByRole("button", { name, exact: true });
const section = (page, title) => page.locator(".s4-field-group").filter({
  has: page.getByRole("heading", { name: title, exact: true }),
});
const shot = (page, name, fullPage = false) => page.screenshot({
  path: `${output}/${name}.png`, fullPage, animations: "disabled",
});

test.beforeEach(async ({ page }) => {
  await mkdir(output, { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const [device, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
  test(`${device}: 新建机会分区间距与公共时间选择器`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/opportunities/new?demoCase=chengyue");
    await page.evaluate(() => document.fonts.ready);
    const fields = page.locator(".s4-create-workspace > .s4-opportunity-fields");
    const main = await fields.first().boundingBox();
    const followup = await fields.last().boundingBox();
    expect(followup.y - main.y - main.height).toBeCloseTo(24, 0);
    await shot(page, `after-${device}-form`, true);
    await button(page, "选择预计时间").click();
    const range = page.locator(".s4-date-picker-panel");
    await expect(range).toHaveCSS("width", "344px");
    await expect(range.getByRole("button", { name: "确定", exact: true })).toBeDisabled();
    await range.screenshot({ path: `${output}/after-${device}-range.png`, animations: "disabled" });
    await range.getByRole("button", { name: "3 月", exact: true }).click();
    await range.getByRole("button", { name: "6 月", exact: true }).click();
    await range.getByRole("button", { name: "确定", exact: true }).click();
    await expect(field(page, "预计时间").getByRole("button")).toContainText("2026.03 - 2026.06");
    await page.getByRole("checkbox", { name: "同时记录首次跟进" }).click();
    await page.getByRole("checkbox", { name: "同时安排下次跟进" }).click();
    const groups = page.locator(".s4-initial-followup-option");
    for (const group of await groups.all()) {
      const toggle = await group.getByRole("checkbox").boundingBox();
      const form = await group.locator(".s4-form-grid").boundingBox();
      expect(form.y - toggle.y - toggle.height).toBeCloseTo(16, 0);
    }
    const first = await groups.first().boundingBox();
    const second = await groups.last().boundingBox();
    expect(second.y - first.y - first.height).toBeCloseTo(24, 0);
    await shot(page, `after-${device}-followup`, true);
    await field(page, "下次跟进时间").getByRole("button").click();
    const picker = page.locator(".s4-date-picker-panel");
    await expect(picker).toHaveCSS("width", "320px");
    const confirm = picker.getByRole("button", { name: "确定", exact: true });
    await expect(confirm).toHaveCSS("background-color", "rgb(0, 112, 247)");
    await expect(confirm).toHaveCSS("color", "rgb(255, 255, 255)");
    await shot(page, `after-${device}-datetime`);
    await picker.getByRole("textbox", { name: "小时", exact: true }).fill("29");
    await expect(confirm).toBeDisabled();
    await picker.getByRole("textbox", { name: "小时", exact: true }).fill("11");
    await picker.getByRole("textbox", { name: "分钟", exact: true }).fill("17");
    await confirm.click();
    await expect(field(page, "下次跟进时间").getByRole("button")).toContainText("11:17");
    await expectNoHorizontalOverflow(page);
    await errors();
  });

  test(`${device}: 形成岗位内嵌标签不留空白且解除关联正文复用公共样式`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height });
    await page.goto("#/opportunities/opportunity-xinglan?tab=directions");
    await page.evaluate(() => document.fonts.ready);
    await button(page, "形成岗位").first().click();
    const modal = page.locator(".s1-modal");
    const body = modal.locator(".s1-modal-body");
    const tabs = modal.locator(".s4-inset-tabs");
    await expect(tabs).toHaveCSS("position", "static");
    const geometry = await tabs.evaluate((el) => ({
      offset: el.getBoundingClientRect().top - el.closest(".s1-modal-body").getBoundingClientRect().top,
      padding: parseFloat(getComputedStyle(el.closest(".s1-modal-body")).paddingTop),
    }));
    expect(geometry.offset).toBeCloseTo(geometry.padding, 0);
    await expect.poll(() => modal.evaluate((element) => {
      const tabs = element.querySelector(".s4-inset-tabs").getBoundingClientRect();
      const ai = element.querySelector(".s4-direction-convert-workspace .s4-command-actions button").getBoundingClientRect();
      return Math.round(ai.top - tabs.bottom);
    })).toBe(18);
    await shot(page, `after-${device}-conversion`);
    await body.evaluate((el) => { el.scrollTop = 240; });
    await expect(modal.getByRole("button", { name: "确认创建并关联", exact: true })).toBeVisible();
    await body.evaluate((el) => { el.scrollTop = 0; });
    await modal.getByRole("tab", { name: "关联已有岗位", exact: true }).click();
    await expect(field(page, "选择已有岗位").getByRole("button")).toBeVisible();
    await modal.getByRole("tab", { name: "创建新岗位", exact: true }).click();
    await expect(field(page, "岗位名称").locator("input")).toHaveValue("机器人学习负责人");
    await button(modal, "取消").click();
    await button(page, "管理关联").first().click();
    const copy = page.getByRole("dialog", { name: "解除岗位关联" });
    await expect(copy.locator(".s4-long-copy")).toHaveCSS("font-size", "13px");
    await expect(copy.locator(".s1-modal-copy")).toHaveCSS("font-size", "13px");
    await expect(copy.locator(".s1-modal-copy")).toHaveCSS("line-height", "22px");
    await expect(copy.locator("p").first()).toHaveCSS("margin", "0px");
    await shot(page, `after-${device}-unlink`);
    await button(copy, "取消").click();
    await expectNoHorizontalOverflow(page);
    await errors();
  });

  test(`${device}: 需求摘要与补充长文本保持一致字号、行距和换行`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("#/opportunities/opportunity-xinglan?tab=profile");
    const summary = section(page, "招聘需求摘要");
    await button(summary, "编辑").click();
    const modal = page.getByRole("dialog", { name: "编辑招聘机会" });
    await field(page, "已确认要求").locator("textarea").fill("客户确认机器人学习方向。\n需要真机部署与评测经验。");
    await field(page, "待确认事项").locator("textarea").fill("第一项：招聘人数。\n第二项：薪酬与汇报关系。");
    await button(modal, "保存修改").click();
    await expect(modal).toHaveCount(0);
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await expect(summary.locator("p")).toHaveCount(3);
    for (const paragraph of await summary.locator("p").all()) {
      await expect(paragraph).toHaveCSS("font-size", "13px");
      await expect(paragraph).toHaveCSS("line-height", "23px");
      await expect(paragraph).toHaveCSS("white-space", "pre-wrap");
    }
    await expect(summary.locator("dd").first()).toHaveText("客户确认机器人学习方向。\n需要真机部署与评测经验。");
    await summary.screenshot({ path: `${output}/after-${device}-summary.png`, animations: "disabled" });
    await expectNoHorizontalOverflow(page);
  });
}

test("系统历史只读；手工记录可纠错并软删除，保留操作历史", async ({ page }) => {
  await page.goto("#/opportunities/opportunity-xinglan?tab=history");
  await page.locator(".s4-detail-actions").getByRole("button", { name: "删除", exact: true }).click();
  await expect(page.getByRole("dialog").locator(".s1-modal-copy")).toHaveCSS("font-size", "13px");
  await expect(page.getByRole("dialog").locator(".s1-modal-copy")).toHaveCSS("line-height", "22px");
  await shot(page, "quick-delete-opportunity-modal");
  await button(page.getByRole("dialog"), "取消").click();
  await expect(page.locator(".s4-timeline-actions")).toHaveCount(0);
  await button(page, "记录跟进").click();
  await field(page, "跟进内容").locator("textarea").fill("第一次电话确认研发需求");
  await button(page, "保存记录").click();
  const record = page.locator(".s4-timeline li").filter({ hasText: "第一次电话确认研发需求" });
  await button(record, "编辑").click();
  await field(page, "跟进内容").locator("textarea").fill("修正：客户通过邮件确认研发需求");
  await button(page, "保存记录").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  const corrected = page.locator(".s4-timeline li").filter({ hasText: "修正：客户通过邮件确认研发需求" });
  await button(corrected, "删除").click();
  await expect(page.getByRole("dialog").locator(".s1-modal-copy")).toHaveCSS("font-size", "13px");
  await expect(page.getByRole("dialog").locator(".s1-modal-copy")).toHaveCSS("line-height", "22px");
  await shot(page, "quick-delete-record-modal");
  await button(page.getByRole("dialog"), "确认删除").click();
  await expect(corrected).toHaveCount(0);
  await expect(page.locator(".s4-timeline-actions")).toHaveCount(0);
  await expect(page.getByText("修改跟进记录", { exact: true })).toBeVisible();
  await expect(page.getByText("删除跟进记录", { exact: true })).toBeVisible();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("hunter-opportunity-lifecycle-v1")));
  const stored = state.opportunities.find((item) => item.id === "opportunity-xinglan").records[0];
  expect(stored.deletedAt).toBeTruthy();
  expect(stored.previous[0].content).toBe("第一次电话确认研发需求");
});
