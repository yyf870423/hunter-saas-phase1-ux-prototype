import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test.describe.configure({ mode: "parallel" });

const screens = [
  ["home", "home"], ["new-task", "tasks"], ["task-review", "tasks/position-vla?state=review"],
  ["task-plan", "tasks/position-vla?state=review", "plan"], ["mapping-task", "tasks/mapping-embodied?state=gaps"],
  ["periodic", "tasks/periodic"], ["insights", "signals"],
  ["companies", "companies"], ["company-new", "companies/new"], ["company", "companies/company-xinglan"],
  ["company-contacts", "companies/company-xinglan?tab=contacts"], ["company-talents", "companies/company-xinglan?tab=talents"],
  ["company-map", "companies/company-xinglan?tab=mappings"], ["contact-new", "companies/company-xinglan/contacts/new"],
  ["contact", "companies/company-xinglan/contacts/contact-chenyu"], ["contact-timeline", "companies/company-xinglan/contacts/contact-chenyu?tab=timeline"],
  ["candidates", "candidates"], ["candidate-filters", "candidates", "candidate-filters"], ["candidate-new", "candidates/new"],
  ["candidate", "candidates/candidate-linhao"], ["candidate-edit", "candidates/candidate-linhao", "candidate-edit"],
  ["candidate-experience", "candidates/candidate-linhao?tab=experience"], ["candidate-files", "candidates/candidate-linhao?tab=files"],
  ["candidate-timeline", "candidates/candidate-linhao?tab=timeline"], ["candidate-matching", "candidates/candidate-linhao?tab=matching"],
  ["candidate-relations", "candidates/candidate-linhao?tab=relations"], ["candidate-path", "candidates/candidate-linhao?tab=contact-path"],
  ["positions", "positions"], ["position-new", "positions/new"], ["position", "positions/position-vla"],
  ["position-pipeline", "positions/position-vla?tab=pipeline"], ["position-matching", "positions/position-vla?tab=matching"],
  ["position-map", "positions/position-vla?tab=talent-map"], ["interview", "positions/position-vla?tab=interview"],
  ["interview-add", "positions/position-vla?tab=interview", "interview-add"],
  ["opportunities", "opportunities"], ["opportunity-new", "opportunities/new"],
  ["opportunity", "opportunities/opportunity-xinglan"], ["opportunity-directions", "opportunities/opportunity-xinglan?tab=directions"],
  ["opportunity-files", "opportunities/opportunity-xinglan?tab=files"], ["opportunity-activity", "opportunities/opportunity-xinglan?tab=history"],
  ["graphs", "mappings"], ["graph-new", "mappings/new"], ["graph", "mappings/mapping-embodied"],
  ["graph-table", "mappings/mapping-embodied?view=table"], ["graph-import", "mappings/mapping-embodied?panel=import"],
  ["papers", "papers"], ["paper", "papers/paper-vla-survey"], ["patents", "patents"], ["patent", "patents/patent-manipulation"],
  ["imports", "data/imports"], ["import-new", "data/imports", "import-new"],
  ["exports", "data/exports"], ["export-new", "data/exports", "export-new"], ["recycle", "recycle-bin"],
  ["identity-review", "reviews/identity/candidate-linhao"], ["fields-review", "reviews/fields/candidate-linhao"],
  ["settings-profile", "settings/profile"], ["settings-edit", "settings/profile", "settings-edit"],
  ["settings-navigation", "settings/navigation"], ["settings-notifications", "settings/notifications"],
  ["settings-automation", "settings/automation"], ["settings-connections", "settings/connections"],
  ["settings-connect", "settings/connections?state=empty", "settings-connect"],
  ["settings-subscription", "settings/subscription"], ["settings-data", "settings/data-privacy"],
  ["login", "login"], ["not-activated", "not-activated"],
];
const mobileSpot = new Set(["home", "candidates", "candidate", "position-new", "interview", "graph-import", "import-new", "export-new", "settings-profile", "settings-connect", "settings-subscription", "settings-data"]);

async function openState(page, action) {
  if (action === "plan") await page.getByRole("button", { name: /^执行计划/ }).click();
  if (action === "candidate-filters") await page.locator(".s4-candidate-filter-toggle").click();
  if (action === "candidate-edit") await page.getByRole("button", { name: "编辑职业概览", exact: true }).click();
  if (action === "interview-add") await page.getByRole("button", { name: "新增记录", exact: true }).click();
  if (action === "import-new") await page.getByRole("button", { name: "新建导入", exact: true }).click();
  if (action === "export-new") await page.getByRole("button", { name: "新建导出", exact: true }).click();
  if (action === "settings-edit") await page.getByRole("button", { name: "编辑", exact: true }).first().click();
  if (action === "settings-connect") await page.getByRole("button", { name: "连接邮箱", exact: true }).click();
}

export function inspectControls() {
  const visible = element => {
    const r = element.getBoundingClientRect(), s = getComputedStyle(element);
    return r.width > 2 && r.height > 2 && s.display !== "none" && s.visibility !== "hidden";
  };
  const describe = e => ({ tag: e.tagName, class: String(e.className ?? ""), text: (e.getAttribute("aria-label") || e.textContent || e.getAttribute("placeholder") || "").trim().replace(/\s+/g, " ").slice(0, 80), x: e.getBoundingClientRect().x, y: e.getBoundingClientRect().y, width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height });
  const findings = [];
  for (const header of document.querySelectorAll(".s4-field-group > header")) {
    const children = [...header.children].filter(visible);
    if (children.length > 2 && children.filter(e => e.matches("button")).length > 1) findings.push({ type: "split-header-actions", controls: children.map(describe) });
  }
  for (const select of document.querySelectorAll('[class*="filter"] .s4-select, [class*="toolbar"] .s4-select, .s4-form-field .s4-select')) {
    const button = select.querySelector(":scope > button");
    if (button && visible(button) && select.getBoundingClientRect().width - button.getBoundingClientRect().width > 18) findings.push({ type: "select-wrapper-gap", wrapper: describe(select), control: describe(button) });
  }
  for (const group of document.querySelectorAll('.s4-filter-bar, [class*="toolbar"], .s1-modal-footer, .s4-modal-footer, .s4-page-actions, .s4-field-actions')) {
    const controls = [...group.querySelectorAll('button, input:not([type="hidden"]), textarea')].filter(e => visible(e) && !e.closest('.s4-select-panel, .app-popover, .tg-canvas-scroll, .s3-relationship-viewport, .s2-timeline'));
    for (let i = 0; i < controls.length; i++) for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i], b = controls[j];
      if (a.contains(b) || b.contains(a)) continue;
      const r = a.getBoundingClientRect(), s = b.getBoundingClientRect();
      const w = Math.min(r.right, s.right) - Math.max(r.left, s.left), h = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
      if (w > 2 && h > 2) findings.push({ type: "overlapping-controls", group: String(group.className), controls: [describe(a), describe(b)] });
    }
  }
  for (const button of document.querySelectorAll("button")) {
    if (visible(button) && !button.closest('.tg-canvas-scroll, .s3-relationship-viewport, .s4-detail-tabs, .s1-sidebar, .s1-topbar') && !button.matches('.s1-icon-button, .s1-sidebar-toggle') && getComputedStyle(button).textOverflow !== "ellipsis" && button.scrollWidth > button.clientWidth + 2) findings.push({ type: "button-content-overflow", control: describe(button) });
  }
  for (const field of document.querySelectorAll(".s4-form-field")) {
    for (const control of field.querySelectorAll(':scope > .s4-input, :scope > .s4-select > button, :scope > .s4-date-picker > button')) {
      if (visible(control) && Math.abs(control.getBoundingClientRect().height - 38) > 1) findings.push({ type: "form-control-height", control: describe(control) });
    }
  }
  return { documentOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth), findings, controls: [...document.querySelectorAll('.s4-filter-bar, [class*="toolbar"], .s1-modal-footer, .s4-field-group > header')].filter(visible).map(e => ({ group: String(e.className), children: [...e.querySelectorAll('button,input:not([type="hidden"]),textarea')].filter(visible).map(describe) })) };
}

for (const width of [1440, 871, 390]) for (const [id, route, action] of screens) {
  if (width === 390 && !mobileSpot.has(id)) continue;
  test(`${width}px ${id}`, async ({ page }, info) => {
    const errors = [], writes = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url()); });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`#/${route}`);
    await openState(page, action);
    await expect(page.locator("#root")).not.toBeEmpty();
    const layout = await page.evaluate(inspectControls);
    await writeFile(info.outputPath("geometry.json"), JSON.stringify({ id, route, width, errors, writes, ...layout }, null, 2));
    await page.screenshot({ path: info.outputPath("screen.png"), fullPage: true, animations: "disabled" });
    expect(errors).toEqual([]);
    expect(writes).toEqual([]);
    expect(layout.documentOverflow).toBeLessThanOrEqual(1);
    expect(layout.findings.filter(f => ["overlapping-controls", "split-header-actions", "form-control-height"].includes(f.type))).toEqual([]);
  });
}
