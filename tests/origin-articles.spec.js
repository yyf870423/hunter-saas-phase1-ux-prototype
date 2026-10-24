import { test, expect } from "@playwright/test";

// 官网 SEO 文章（只有中文）：规范网址、结构化数据和页面一致、站内链接、首页入口（只在页脚，不在顶部导航）
const articles = [
  "org-chart",
  "talent-pool",
  "headhunter-consultant",
  "job-matching",
  "ai-assistant-for-headhunters",
  "finding-candidates",
  "ai-tools-compared",
  "same-name-candidates",
];

// the five main articles listed in the footer, above “全部文章 >>”
const inFooter = ["ai-assistant-for-headhunters", "org-chart", "job-matching", "finding-candidates", "talent-pool"];

for (const slug of articles) {
  test(`Article ${slug} reads without scripts and matches its structured data`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`./landing-origin/articles/${slug}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      `https://www.boseekai.com/articles/${slug}/`,
    );
    await expect(page.locator("meta[name=trial-api]")).toHaveAttribute("content", "disabled");
    await expect(page.locator("h1")).toHaveCount(1);
    const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())["@graph"];
    expect(graph.map((node) => node["@type"])).toEqual(["WebPage", "BreadcrumbList", "Article", "FAQPage"]);
    const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList").itemListElement;
    await expect(page.locator(".u-crumbs [aria-current=page]")).toHaveText(crumbs[2].name);
    const faq = graph.find((node) => node["@type"] === "FAQPage");
    const visible = await page
      .locator("#faq details")
      .evaluateAll((items) =>
        items.map((item) => [item.querySelector("h3").textContent, item.querySelector("p").textContent]),
      );
    expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(visible);
    expect(visible.length).toBeGreaterThanOrEqual(3);
    // every section heading is in the table of contents, and every related link points at a real page
    const sections = await page.locator(".a-section h2").allTextContents();
    expect(await page.locator(".a-toc a").allTextContents()).toEqual(sections);
    for (const href of await page.locator(".a-related a").evaluateAll((links) => links.map((a) => a.href))) {
      const response = await page.request.get(href);
      expect(response.ok(), href).toBeTruthy();
    }
    const html = await page.content();
    expect(html).not.toContain("；");
    await expect(page.locator(".f-footer [aria-current=page]")).toHaveCount(inFooter.includes(slug) ? 1 : 0);
    expect(errors).toEqual([]);
  });
}

test("The article list links all articles", async ({ page }) => {
  await page.goto("./landing-origin/articles/");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://www.boseekai.com/articles/");
  const hrefs = await page.locator(".a-index a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(articles.map((slug) => `${slug}/`));
  await page.locator(".a-index a").first().click();
  await expect(page).toHaveURL(/\/landing-origin\/articles\/org-chart\/$/);
});

test("The homepage reaches the articles from the footer, not the top navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./landing-origin/");
  await expect(page.locator('#f-navigation a[href*="articles"]')).toHaveCount(0);
  await expect(page.locator('.f-footer a[href="articles/"]')).toHaveText("全部文章 >>");
  expect(
    await page.locator('.f-footer a[href^="articles/"]').evaluateAll((links) => links.map((a) => a.getAttribute("href"))),
  ).toEqual([...inFooter.map((slug) => `articles/${slug}/`), "articles/"]);
  await page.locator('.f-footer a[href="articles/"]').click();
  await expect(page).toHaveURL(/\/landing-origin\/articles\/$/);
});

test("The sitemap lists the article pages", async ({ page }) => {
  const response = await page.request.get("./landing-origin/sitemap.xml");
  const xml = await response.text();
  expect(xml).toContain("<loc>https://www.boseekai.com/articles/</loc>");
  for (const slug of articles) expect(xml).toContain(`<loc>https://www.boseekai.com/articles/${slug}/</loc>`);
});
