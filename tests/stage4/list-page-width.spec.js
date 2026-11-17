import { test, expect } from "@playwright/test";

const lists = ["/companies", "/candidates", "/positions", "/opportunities", "/mappings", "/papers", "/patents",
  "/data/imports", "/data/exports", "/recycle-bin", "/signals"];

for (const width of [2560, 1920, 1440, 390]) {
  test(`list pages use the available content width at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of lists) {
      await page.goto(`./#${route}`);
      const main = page.locator("main.s1-main");
      await expect(main).toHaveClass(/s1-main-list/);
      const gaps = await main.evaluate(main => {
        const root = main.firstElementChild;
        const m = main.getBoundingClientRect(), r = root.getBoundingClientRect(), css = getComputedStyle(main);
        return { left:r.left - m.left - parseFloat(css.paddingLeft), right:m.right - parseFloat(css.paddingRight) - r.right };
      });
      expect(Math.abs(gaps.left), `${route} left`).toBeLessThanOrEqual(0.5);
      expect(Math.abs(gaps.right), `${route} right`).toBeLessThanOrEqual(0.5);
    }
  });
}

test("detail, new, home, settings and task routes keep their existing layout", async ({ page }) => {
  await page.setViewportSize({ width:2560, height:1000 });
  for (const route of ["/companies/new", "/candidates/new", "/mappings/new", "/home", "/settings/profile", "/tasks", "/tasks/periodic"]) {
    await page.goto(`./#${route}`);
    await expect(page.locator("main.s1-main")).not.toHaveClass(/s1-main-list/);
  }
});
