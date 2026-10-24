import { test, expect } from "@playwright/test";

// 改版首页的“使用场景”（2026-10-25 起和实务文章合并成一套，九篇）：
// 规范网址、结构化数据和页面一致、目录、相关阅读能打开，首页的入口（能做什么里的“了解…”和页脚，不在顶部导航）
const pages = [
  "business-development",
  "org-chart",
  "finding-candidates",
  "job-matching",
  "same-name-candidates",
  "talent-pool",
  "headhunter-consultant",
  "ai-assistant-for-headhunters",
  "ai-tools-compared",
];

for (const slug of pages) {
  test(`Redesign use case ${slug} matches its structured data`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`./landing-redesign/use-cases/${slug}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", `https://www.boseekai.com/use-cases/${slug}/`);
    await expect(page.locator("meta[name=trial-api]")).toHaveAttribute("content", "disabled");
    await expect(page.locator("h1")).toHaveCount(1);
    const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())["@graph"];
    expect(graph.map((node) => node["@type"])).toEqual(["WebPage", "BreadcrumbList", "Article", "FAQPage"]);
    const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList").itemListElement;
    expect(crumbs[1].item).toBe("https://www.boseekai.com/use-cases/");
    await expect(page.locator(".s-crumbs [aria-current=page]")).toHaveText(crumbs[2].name);
    const faq = graph.find((node) => node["@type"] === "FAQPage");
    const visible = await page
      .locator("#faq details")
      .evaluateAll((items) => items.map((item) => [item.querySelector("h3").textContent, item.querySelector("p").textContent]));
    expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(visible);
    expect(visible.length).toBeGreaterThanOrEqual(3);
    expect(await page.locator(".s-toc a").allTextContents()).toEqual(await page.locator(".s-section[id^=s] h2").allTextContents());
    for (const href of await page.locator(".s-related a").evaluateAll((links) => links.map((a) => a.href))) {
      expect((await page.request.get(href)).ok(), href).toBeTruthy();
    }
    expect(await page.content()).not.toContain("；");
    expect(errors).toEqual([]);
  });
}

test("Redesign use-case list links all nine pages", async ({ page }) => {
  await page.goto("./landing-redesign/use-cases/");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://www.boseekai.com/use-cases/");
  const hrefs = await page.locator(".s-index a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(pages.map((slug) => `${slug}/`));
});

test("Redesign homepage reaches the use cases from 能做什么 and the footer, not the top navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./landing-redesign/");
  await expect(page.locator('#n-nav a[href*="use-cases"]')).toHaveCount(0);
  await expect(page.locator('a[href*="articles"]')).toHaveCount(0);
  const more = await page.locator(".n-more").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(more.length).toBe(6);
  for (const href of more) expect(pages.map((slug) => `use-cases/${slug}/`)).toContain(href);
  await expect(page.locator('.n-footer a[href="use-cases/"]')).toHaveText("全部 >>");
  await page.locator('.n-footer a[href="use-cases/"]').click();
  await expect(page).toHaveURL(/\/landing-redesign\/use-cases\/$/);
});
