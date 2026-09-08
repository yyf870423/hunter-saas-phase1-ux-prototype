import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

const routes = [
  ["landing", "/"], ["login", "/login"], ["ops-login", "/ops/login"],
  ["home", "/home"], ["new", "/new"], ["periodic", "/tasks/periodic"],
  ["periodic-runs", "/tasks/periodic?view=runs"], ["signals", "/signals"],
  ["position-task", "/tasks/position-vla"], ["client-task", "/tasks/client-xinglan"],
  ["mapping-task", "/tasks/mapping-embodied"], ["career-task", "/tasks/career-linhao"],
  ["identity-task", "/tasks/task-hand-team"], ["report-task", "/tasks/task-recommend-linhao"],
  ["candidates", "/candidates"], ["candidate", "/candidates/candidate-linhao"],
  ["positions", "/positions"], ["position", "/positions/position-vla"],
  ["companies", "/companies"], ["company", "/companies/company-xinglan"],
  ["contact", "/companies/company-xinglan/contacts/contact-chenyu"],
  ["opportunities", "/opportunities"], ["opportunity", "/opportunities/opportunity-xinglan"],
  ["mappings", "/mappings"], ["mapping", "/mappings/mapping-embodied"],
  ["papers", "/papers"], ["paper", "/papers/paper-vla-survey"],
  ["patents", "/patents"], ["patent", "/patents/patent-manipulation"],
  ["imports", "/data/imports"], ["exports", "/data/exports"], ["recycle", "/recycle-bin"],
  ...["profile", "navigation", "notifications", "automation", "connections", "subscription", "data-privacy"].map((name) => [`settings-${name}`, `/settings/${name}`]),
  ...["overview", "users-workspaces", "subscriptions", "tasks", "capabilities", "support"].map((name) => [`ops-${name}`, `/ops/${name}`]),
];

const readyMarkers = {
  "position-task": "首批候选人已经可以审核",
  "client-task": "待确认的招聘机会",
  "mapping-task": "人物与关系批次可以审核",
  "career-task": "系统内有 3 个岗位值得查看",
};

for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
  for (const [index, [name, route]] of routes.entries()) {
    test(`全局页面基线 ${viewport.name} ${name}`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize(viewport);
      await page.goto(`#${route}`);
      await expect(page.locator("#root")).not.toBeEmpty();
      await page.evaluate(() => document.fonts.ready);
      if (readyMarkers[name]) {
        const marker = page.getByText(readyMarkers[name], { exact: true });
        await expect(marker).toBeVisible({ timeout: 12000 });
        await marker.scrollIntoViewIfNeeded();
      }
      await expect(page.locator("body")).not.toContainText("Unexpected Application Error");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(2);
      const directory = `artifacts/full-review-20260908/${process.env.REVIEW_PHASE || "before"}/${viewport.name}`;
      mkdirSync(directory, { recursive: true });
      await page.screenshot({ path: `${directory}/${String(index + 1).padStart(2, "0")}-${name}.png`, animations: "disabled" });
      expect(errors).toEqual([]);
    });
  }
}
