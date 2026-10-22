import { test, expect } from "@playwright/test";

const legal = /京ICP备2026068903号-1/g;

test("shared landing renders when an older cached UI helper has no locale API", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/landing/shared-ui.js?*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: `${await response.text()}\ndelete window.FinesseUI.text; delete window.FinesseUI.localizeHTML;`,
    });
  });
  await page.goto("./landing/");
  await expect(page.locator(".f-hero h1")).toHaveText(
    "从杂乱的信息里，找出岗位、人和时机。",
  );
  await expect(page.locator(".f-trial-submit")).toBeDisabled();
  await expect(page.locator(".f-work-demo [role=tab]")).toHaveCount(4);
  await page.locator("#f-trial-role").click();
  await expect(page.locator("#f-trial-role-list")).toContainText("独立猎头");
  expect(errors).toEqual([]);
});
async function untranslated(page) {
  return page.evaluate(() => {
    const missing = new Set();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest("script,style,[data-language-switch]"))
        continue;
      const text = node.nodeValue.trim().replace(/京ICP备2026068903号-1/g, "");
      if (/\p{Script=Han}/u.test(text)) missing.add(text);
    }
    return [...missing];
  });
}

for (const width of [1440, 1024, 801, 390, 320]) {
  for (const language of ["zh", "en"]) {
    test(`Origin ${language} preserves readable layout at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(
        language === "en" ? "./landing-origin/en/" : "./landing-origin/",
      );
      await expect(page.locator(".f-hero h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        language === "en" ? "en" : "zh-CN",
      );
      const switcher = page.locator("[data-language-switch]");
      await expect(switcher).toHaveText(language === "en" ? "中文" : "EN");
      const switchBox = await switcher.boundingBox();
      const applyBox = await page
        .locator(".f-header-actions .f-login-link")
        .boundingBox();
      expect(switchBox.x + switchBox.width).toBeLessThanOrEqual(applyBox.x);
      const header = await page.locator(".f-header").evaluate((root) => {
        const visible = [
          ...root.querySelectorAll(
            ".f-brand,.f-nav:not([hidden]),.f-header-actions",
          ),
        ].map((el) => el.getBoundingClientRect());
        const withinViewport = [...root.querySelectorAll("a,button")]
          .filter((el) => el.checkVisibility())
          .every((el) => {
            const box = el.getBoundingClientRect();
            return box.left >= 0 && box.right <= innerWidth;
          });
        return (
          withinViewport &&
          visible.every(
            (a, i) =>
              a.left >= 0 &&
              a.right <= innerWidth &&
              visible.every(
                (b, j) =>
                  i === j || a.right <= b.left + 1 || b.right <= a.left + 1,
              ),
          )
        );
      });
      expect
        .soft(header, "Header actions must not overlap navigation or brand")
        .toBe(true);
      if (language === "en")
        for (const action of await page.locator(".f-hero-actions a").all()) {
          const box = await action.boundingBox();
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width);
        }
      if (language === "en" && width <= 1000) {
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click();
        await expect(page.locator("#f-navigation")).toBeVisible();
        await expect(page.locator("#f-navigation a")).toHaveText([
          "Product video",
          "Use cases",
          "How it works",
          "Knowledge network",
          "About Boseek",
        ]);
        await page.keyboard.press("Escape");
        await expect(page.locator("#f-navigation")).toBeHidden();
      }
      if (language === "en") {
        await expect(page.locator("#f-about-title")).toHaveText(
          "Boseek. Clarity for recruiters.",
        );
        const singleLine = await page
          .locator("#f-about-title")
          .evaluate((el) => {
            const range = document.createRange();
            range.selectNodeContents(el);
            return range.getClientRects().length === 1;
          });
        expect(singleLine, "About headline stays on one line").toBe(true);
        await expect(page.locator(".f-trial-submit")).toHaveText("Submit");
        await expect(page.locator(".f-footer")).toContainText(
          "Operated by Beijing Boseek Intelligent Technology Co., Ltd.",
        );
      }
      for (const logo of await page.locator(".f-brand img").all()) {
        await expect(logo).toHaveAttribute(
          "src",
          language === "en"
            ? "assets/boseek-b5-en.svg"
            : "assets/boseek-b5-dark.svg",
        );
        expect(
          await logo.evaluate(
            (image) => image.complete && image.naturalWidth > 0,
          ),
        ).toBe(true);
      }
      if ([1440, 390, 320].includes(width))
        await page.locator(".f-header").screenshot({
          path: testInfo.outputPath(`${language}-header-${width}.png`),
          animations: "disabled",
        });
      for (const selector of [
        ".f-hero",
        ".f-work",
        "#research",
        ".f-memory",
        ".f-about",
        ".f-trial",
        ".f-footer",
      ]) {
        const section = page.locator(selector);
        await section.scrollIntoViewIfNeeded();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          selector,
        ).toBe(true);
        const clipped = await section.evaluate((root) =>
          [...root.querySelectorAll("h1,h2,h3,p,.f-tab")]
            .filter((el) => {
              if (
                !el.checkVisibility() ||
                el.closest(".f-network-map,.o-sky,[aria-hidden='true']")
              )
                return false;
              if (
                document.documentElement.lang !== "en" &&
                el.matches(".f-network-tabs .f-tab")
              )
                return false;
              return el.scrollWidth > el.clientWidth + 2;
            })
            .map((el) => ({
              text: el.textContent,
              scroll: el.scrollWidth,
              width: el.clientWidth,
            })),
        );
        expect.soft(clipped, `Clipped text in ${selector}`).toEqual([]);
        if ([1440, 390, 320].includes(width))
          await section.screenshot({
            path: testInfo.outputPath(
              `${language}-${selector.replaceAll(/[^a-z0-9]/gi, "_")}-${width}.png`,
            ),
            animations: "disabled",
            style: ".f-header,.f-skip {visibility:hidden!important}",
          });
      }
      await expect(page.locator("video[data-film]")).toHaveAttribute(
        "src",
        language === "en"
          ? "assets/hunterbuddy-origin-en.mp4?v=20261022-en-copy"
          : "assets/hunterbuddy-origin.mp4?v=20261022-terms",
      );
      if (language === "zh")
        await expect(
          page.locator(".f-work-demo > .f-tabs [role=tab]"),
        ).toHaveText(["客户开发", "人才地图", "职位寻访", "人选维护"]);
      await expect(page.locator("meta[name='trial-api']")).toHaveAttribute(
        "content",
        "disabled",
      );
      if (language === "en") expect(await untranslated(page)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test("English interactions translate all scenes, slides, errors and canonical form choices", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const posts = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto("./landing-origin/en/");
  const tabs = page.locator(".f-work-demo > .f-tabs [role=tab]");
  await expect(tabs).toHaveText([
    "Business development",
    "Talent mapping",
    "Sourcing",
    "Candidate nurturing",
  ]);
  for (const tab of await tabs.all()) {
    await tab.click();
    await page.locator("[data-evidence]").click();
    await expect(page.locator("dialog")).toBeVisible();
    expect(await untranslated(page)).toEqual([]);
    await page.getByRole("button", { name: "Close", exact: true }).click();
  }
  for (const tab of await page.locator(".f-network-tabs [role=tab]").all()) {
    await tab.click();
    expect(await untranslated(page)).toEqual([]);
  }
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Next slide", exact: true }).click();
    expect(await untranslated(page)).toEqual([]);
  }
  const consent = page.locator("#f-trial-consent");
  await expect(
    page.locator("#f-trial-activePositions [data-select-label]"),
  ).toHaveText("Select a range");
  const button = page.locator(".f-trial-submit");
  await expect(button).toBeDisabled();
  await consent.check();
  await button.click();
  await expect(page.locator("#f-trial-name-error")).toHaveText(
    "Enter your name.",
  );
  for (const [name, value] of Object.entries({
    name: "English preview",
    company: "Example",
    phone: "123",
    email: "not-an-email",
  }))
    await page.locator(`[name=${name}]`).fill(value);
  await button.click();
  await expect(page.locator("#f-trial-phone-error")).toContainText(
    "valid phone number",
  );
  await expect(page.locator("#f-trial-email-error")).toContainText(
    "valid email",
  );
  await page.locator("[name=phone]").fill("+1 202 555 0123");
  await page.locator("[name=email]").fill("locale-qa@example.invalid");
  for (const [name, visible, canonical] of [
    ["role", "Recruitment consultant", "猎头顾问"],
    ["activePositions", "51+", "51及以上"],
    ["industry", "Healthcare & life sciences", "医疗健康"],
  ]) {
    await page.locator(`#f-trial-${name}`).click();
    await page
      .locator(`#f-trial-${name}-list`)
      .getByRole("option", { name: visible, exact: true })
      .click();
    await expect(page.locator(`[name=${name}]`)).toHaveValue(canonical);
    await expect(
      page.locator(`#f-trial-${name} [data-select-label]`),
    ).toHaveText(visible);
  }
  await page.locator("#f-trial-industry").press("Escape");
  await button.click();
  await expect(page.locator("[data-form-status]")).toContainText(
    "We cannot accept applications right now",
  );
  await consent.uncheck();
  await expect(button).toBeDisabled();
  expect(posts).toEqual([]);
  expect(await untranslated(page)).toEqual([]);
  const missing = await page.evaluate(() => [...window.FinesseLocale.missing]);
  expect(
    missing.map((text) => text.replace(legal, "")).filter(Boolean),
  ).toEqual([]);
  let payload;
  await page.route("**/api/trial-applications", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      json: { status: "received", receipt: payload.submissionId },
    });
  });
  await page.evaluate(() => {
    document.querySelector('meta[name="trial-api"]').content =
      "/api/trial-applications";
  });
  await consent.check();
  await button.click();
  await expect(page.locator("[data-form-success] h3")).toHaveText(
    "Application received",
  );
  expect(payload).toMatchObject({
    role: "猎头顾问",
    activePositions: "51及以上",
    industry: "医疗健康",
    acknowledgedPurpose: true,
  });
  expect(posts).toHaveLength(1);
  expect(await untranslated(page)).toEqual([]);
  await page.evaluate(() => {
    location.hash = "assets";
  });
  await expect(page.locator("[data-language-switch]")).toHaveAttribute(
    "href",
    /\/landing-origin\/#assets$/,
  );
  await page.locator("[data-language-switch]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator(".f-hero h1")).toHaveText(
    "从杂乱的信息里，找出岗位、人和时机。",
  );
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
});
