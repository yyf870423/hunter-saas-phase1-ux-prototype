import { test, expect } from "@playwright/test";

const cases = [
  ["business-development", "客户开发", "Business development"],
  ["talent-mapping", "人才地图", "Talent mapping"],
  ["sourcing", "职位寻访", "Sourcing"],
  ["candidate-nurturing", "人选维护", "Candidate nurturing"],
];

for (const [slug, zh, en] of cases) {
  for (const language of ["zh", "en"]) {
    test(`Use case ${slug} (${language}) reads without scripts and matches its structured data`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const prefix = language === "en" ? "en/" : "";
      await page.goto(`./landing-origin/${prefix}use-cases/${slug}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", language === "en" ? "en" : "zh-CN");
      await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
        "href",
        `https://www.boseekai.com/${prefix}use-cases/${slug}/`,
      );
      await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute(
        "href",
        `https://www.boseekai.com/use-cases/${slug}/`,
      );
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
        "href",
        `https://www.boseekai.com/en/use-cases/${slug}/`,
      );
      await expect(page.locator("meta[name=trial-api]")).toHaveAttribute("content", "disabled");
      await expect(page.locator(".u-crumbs [aria-current=page]")).toHaveText(language === "en" ? en : zh);
      await expect(page.locator(".u-four .is-current strong")).toHaveText(language === "en" ? en : zh);
      await expect(page.locator(".f-footer [aria-current=page]")).toHaveText(language === "en" ? en : zh);
      const graph = JSON.parse(
        await page.locator('script[type="application/ld+json"]').textContent(),
      )["@graph"];
      expect(graph.map((node) => node["@type"])).toEqual(["WebPage", "BreadcrumbList", "FAQPage"]);
      const faq = graph.find((node) => node["@type"] === "FAQPage");
      const visible = await page
        .locator("#faq details")
        .evaluateAll((items) =>
          items.map((item) => [item.querySelector("h3").textContent, item.querySelector("p").textContent]),
        );
      expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(visible);
      expect(visible.length).toBeGreaterThanOrEqual(3);
      const html = await page.content();
      expect(html).not.toContain("；");
      await page.locator(".f-language-switch").click();
      await expect(page).toHaveURL(
        new RegExp(`/landing-origin/${language === "en" ? "" : "en/"}use-cases/${slug}/$`),
      );
      expect(errors).toEqual([]);
    });
  }
}

test("Use case pages fold the navigation into the menu at the homepage widths", async ({ page }) => {
  for (const [language, width] of [["zh", 900], ["en", 1120]]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`./landing-origin/${language === "en" ? "en/" : ""}use-cases/sourcing/`);
    const toggle = page.locator("[data-menu-toggle]");
    await expect(toggle).toBeVisible();
    await expect(page.locator("#f-navigation")).toBeHidden();
    await toggle.click();
    await expect(page.locator("#f-navigation")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#f-navigation")).toBeHidden();
    await expect(toggle).toBeFocused();
  }
});

test("Homepage links each use case and lists them in the footer", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./landing-origin/");
  const tabs = page.locator(".o-scenario-tabs .f-tab");
  for (const [index, [slug, zh]] of cases.entries()) {
    await tabs.nth(index).click();
    const link = page.locator(".o-case-link");
    await expect(link).toHaveText(`了解${zh}`);
    await expect(link).toHaveAttribute("href", `use-cases/${slug}/`);
  }
  await expect(page.locator('.f-footer a[href^="use-cases/"]')).toHaveCount(4);
  await page.locator(".o-case-link").click();
  await expect(page).toHaveURL(/\/landing-origin\/use-cases\/candidate-nurturing\/$/);
});
