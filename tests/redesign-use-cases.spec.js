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
    expect(graph.map((node) => node["@type"])).toEqual(["Organization", "WebPage", "BreadcrumbList", "Article", "FAQPage"]);
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

// 英文站：九篇和列表页一一对应，结构化数据和页面一致，语言切换直达对应的那一页，页面上没有中文（语言切换和备案号除外）
const hanLeft = (page) =>
  page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode.nodeValue.trim();
      if (/[一-鿿]/.test(t) && t !== "中文" && !t.includes("京ICP备")) out.push(t.slice(0, 40));
    }
    return out;
  });

for (const slug of pages) {
  test(`English use case ${slug} matches its structured data and its Chinese twin`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`./landing-redesign/en/use-cases/${slug}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", `https://www.boseekai.com/en/use-cases/${slug}/`);
    await expect(page.locator('link[rel=alternate][hreflang="zh-CN"]')).toHaveAttribute("href", `https://www.boseekai.com/use-cases/${slug}/`);
    await expect(page.locator("meta[name=trial-api]")).toHaveAttribute("content", "disabled");
    await expect(page.locator("h1")).toHaveCount(1);
    const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())["@graph"];
    expect(graph.map((node) => node["@type"])).toEqual(["Organization", "WebPage", "BreadcrumbList", "Article", "FAQPage"]);
    expect(graph.every((node) => !node.inLanguage || node.inLanguage === "en")).toBeTruthy();
    const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList").itemListElement;
    expect(crumbs[1].item).toBe("https://www.boseekai.com/en/use-cases/");
    await expect(page.locator(".s-crumbs [aria-current=page]")).toHaveText(crumbs[2].name);
    const faq = graph.find((node) => node["@type"] === "FAQPage");
    const visible = await page
      .locator("#faq details")
      .evaluateAll((items) => items.map((item) => [item.querySelector("h3").textContent, item.querySelector("p").textContent]));
    expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(visible);
    expect(await page.locator(".s-toc a").allTextContents()).toEqual(await page.locator(".s-section[id^=s] h2").allTextContents());
    for (const href of await page.locator(".s-related a, .n-footer a[href*='use-cases']").evaluateAll((links) => links.map((a) => a.href))) {
      expect((await page.request.get(href)).ok(), href).toBeTruthy();
    }
    expect(await hanLeft(page)).toEqual([]);
    // the switch goes to the same page in Chinese, and that page comes back here
    await page.locator(".n-lang").click();
    await expect(page).toHaveURL(new RegExp(`/landing-redesign/use-cases/${slug}/$`));
    await page.locator(".n-lang").click();
    await expect(page).toHaveURL(new RegExp(`/landing-redesign/en/use-cases/${slug}/$`));
    expect(errors).toEqual([]);
  });
}

test("English use-case list links all nine pages", async ({ page }) => {
  await page.goto("./landing-redesign/en/use-cases/");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://www.boseekai.com/en/use-cases/");
  const hrefs = await page.locator(".s-index a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(pages.map((slug) => `${slug}/`));
  expect(await hanLeft(page)).toEqual([]);
});

test("English homepage is all English, reaches its use cases, and its trial form is in English", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./landing-redesign/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#apply form")).toBeVisible();
  expect(await hanLeft(page)).toEqual([]);
  const more = await page.locator(".n-more").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(more.length).toBe(6);
  for (const href of more) expect(pages.map((slug) => `use-cases/${slug}/`)).toContain(href);
  await expect(page.locator('.n-footer a[href="use-cases/"]')).toHaveText("All >>");
  // the preview server answers unknown paths with the app page, so check that the English film really is a video
  const film = await page.request.get(new URL(await page.locator("video[data-film]").getAttribute("src"), page.url()).href);
  expect(film.headers()["content-type"]).toContain("video");
  const poster = await page.request.get(new URL(await page.locator("video[data-film]").getAttribute("poster"), page.url()).href);
  expect(poster.headers()["content-type"]).toContain("image");
  // the photo wall's pictures come from the shared folder, not from en/
  const wallSrc = await page.locator(".n-tile img").first().getAttribute("src");
  expect(wallSrc).toContain("/landing-redesign/assets/wall/");
  expect((await page.request.get(wallSrc)).headers()["content-type"]).toContain("image");
  await page.locator(".n-lang").click();
  await expect(page).toHaveURL(/\/landing-redesign\/$/);
  await expect(page.locator(".n-lang")).toHaveAttribute("href", "en/");
  expect(errors).toEqual([]);
});

for (const [path, home, lang] of [["./landing-redesign/", "https://www.boseekai.com/", "zh-CN"], ["./landing-redesign/en/", "https://www.boseekai.com/en/", "en"]]) {
  test(`Redesign homepage ${lang} carries the live site's SEO head, with the FAQ data matching the page`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", home);
    await expect(page.locator('meta[name="baidu-site-verification"]')).toHaveCount(lang === "zh-CN" ? 1 : 0);
    const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())["@graph"];
    expect(graph.map((node) => node["@type"])).toEqual(["Organization", "WebSite", "WebPage", "SoftwareApplication", "VideoObject", "FAQPage"]);
    const visible = await page
      .locator(".n-faq-list details")
      .evaluateAll((items) => items.map((item) => [item.querySelector("summary span").textContent, item.querySelector("p").textContent]));
    const faq = graph.find((node) => node["@type"] === "FAQPage");
    expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(visible);
    const film = graph.find((node) => node["@type"] === "VideoObject");
    expect(film.contentUrl.endsWith((await page.locator("video[data-film]").getAttribute("src")).replace(/^(\.\.\/)?/, "").replace(/\?.*$/, ""))).toBeTruthy();
  });
}
