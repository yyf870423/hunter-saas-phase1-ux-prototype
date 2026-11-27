import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

test.describe.configure({ mode: "parallel" });
const forms = ["candidates/new", "positions/new", "companies/new", "opportunities/new"];

for (const width of [1440, 871, 390]) {
  test(`${width}px 普通表单输入、下拉和日期触发器统一38px`, async ({ page }, info) => {
    const check = trackConsoleErrors(page);
    await page.setViewportSize({ width, height: 1000 });
    for (const route of forms) {
      await page.goto(`#/${route}`);
      await expect(page.locator(".s4-form-field").first()).toBeVisible();
      const geometry = await page.locator(".s4-form-field").evaluateAll(fields => fields.flatMap(field => [...field.querySelectorAll(':scope > .s4-input, :scope > .s4-select > button, :scope > .s4-date-picker > button')].map(control => ({
        label: field.querySelector(":scope > span")?.textContent,
        height: control.getBoundingClientRect().height,
        top: control.getBoundingClientRect().top,
      }))));
      expect(geometry.length).toBeGreaterThanOrEqual(2);
      for (const control of geometry) expect(control.height, `${route} ${control.label}`).toBe(38);
      await page.locator(".s4-create-workspace").screenshot({ path: info.outputPath(`${route.replaceAll("/", "-")}.png`) });
      await expectNoHorizontalOverflow(page);
    }
    await check();
  });

  test(`${width}px 公共分页工具同高且仍可切换条数`, async ({ page }, info) => {
    const check = trackConsoleErrors(page);
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["candidates", "companies", "positions", "opportunities", "papers", "patents", "data/imports", "data/exports"]) {
      await page.goto(`#/${route}`);
      const pagination = page.getByRole("navigation", { name: "分页", exact: true });
      await expect(pagination).toBeVisible();
      const controls = pagination.locator('.s4-pagination-pages > button, .s4-pagination-jump > input, .s4-pagination-size > button');
      for (const rect of await controls.evaluateAll(es => es.map(e => e.getBoundingClientRect().toJSON()))) expect(rect.height, route).toBe(30);
      await expectNoHorizontalOverflow(page);
    }
    await page.goto("#/candidates");
    const size = page.getByRole("button", { name: "每页条数", exact: true });
    await size.click();
    await page.getByRole("button", { name: "每页 20 条", exact: true }).click();
    await expect(page.locator(".s4-pagination-summary")).toContainText("1–20");
    await page.getByRole("navigation", { name: "分页", exact: true }).screenshot({ path: info.outputPath("pagination.png") });
    await check();
  });

  test(`${width}px 联系人关联候选人后操作按钮同组且不挤窄`, async ({ page }, info) => {
    const check = trackConsoleErrors(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#/companies/company-xinglan/contacts/contact-chenyu");
    await page.getByRole("button", { name: "关联候选人", exact: true }).click();
    const modal = page.getByRole("dialog", { name: "关联候选人", exact: true });
    await modal.locator(".s4-select > button").click();
    await page.getByRole("button", { name: /^林昊 ·/ }).click();
    await modal.getByRole("button", { name: "保存关联", exact: true }).click();
    await page.getByRole("button", { name: "关闭提示", exact: true }).click();
    const group = page.locator(".s4-field-group").filter({ has: page.getByRole("heading", { name: "候选人身份关系", exact: true }) });
    const view = await group.getByRole("button", { name: "查看候选人", exact: true }).boundingBox();
    const edit = await group.getByRole("button", { name: "修改关联", exact: true }).boundingBox();
    expect(view.y).toBe(edit.y);
    expect(view.height).toBe(32);
    expect(edit.height).toBe(32);
    expect(edit.width).toBeGreaterThanOrEqual(68);
    expect(edit.x - view.x - view.width).toBe(6);
    await group.screenshot({ path: info.outputPath("linked-contact.png") });
    await group.getByRole("button", { name: "修改关联", exact: true }).click();
    await expect(modal).toBeVisible();
    await expect(modal.locator(".s4-select > button")).toContainText("林昊");
    await modal.getByRole("button", { name: "取消", exact: true }).click();
    await group.getByRole("button", { name: "查看候选人", exact: true }).click();
    await expect(page).toHaveURL(/candidates\/candidate-linhao/);
    await expectNoHorizontalOverflow(page);
    await check();
  });

  test(`${width}px 招聘机会活动记录筛选与操作同高`, async ({ page }, info) => {
    const check = trackConsoleErrors(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#/opportunities/opportunity-xinglan?tab=history");
    const group = page.locator(".s4-field-group").filter({ has: page.getByRole("heading", { name: "活动记录", exact: true }) });
    const actions = group.locator("header .s4-command-actions");
    const controls = await actions.locator(":scope > button, :scope > .s4-select > button").evaluateAll(es => es.map(e => e.getBoundingClientRect().toJSON()));
    expect(controls).toHaveLength(2);
    expect(controls[0].height).toBe(32);
    expect(controls[1].height).toBe(32);
    expect(controls[0].y).toBe(controls[1].y);
    await group.locator("header").screenshot({ path: info.outputPath("activity-actions.png") });
    await actions.getByRole("button", { name: "全部记录", exact: true }).click();
    await page.getByRole("button", { name: "系统变更", exact: true }).click();
    await expect(actions.getByRole("button", { name: "系统变更", exact: true })).toBeVisible();
    await actions.getByRole("button", { name: "记录跟进", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await check();
  });
}
