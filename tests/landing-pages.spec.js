import { test, expect } from "@playwright/test";
import { PNG } from "../node_modules/playwright-core/lib/utilsBundle.js";

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
]) {
  test(`isolated landing preserves approved visuals and interactions at ${width}`, async ({
    page,
    browser,
  }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    const failed = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) failed.push(response.url());
    });
    await page.goto("./landing/");
    await expect(page.locator(".f-hero h1")).toHaveText("HunterBuddy");
    await expect(page.locator("meta[name='trial-api']")).toHaveAttribute(
      "content",
      "disabled",
    );
    const navigation = page.locator("#f-navigation");
    await expect(
      navigation.getByRole("link", { includeHidden: true }),
    ).toHaveText(["业务场景", "决策支持", "关于铂寻"]);
    await expect(
      page
        .locator(".f-hero")
        .getByRole("link", { name: "查看场景", exact: true }),
    ).toHaveAttribute("href", "#work");
    for (const image of await page.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((el) => el.decode());
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`landing-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
    if (width < 760) {
      await page.getByRole("button", { name: "打开导航", exact: true }).click();
      await page.screenshot({
        path: testInfo.outputPath(`navigation-${width}.png`),
        animations: "disabled",
      });
    } else {
      await page
        .locator(".f-header")
        .screenshot({
          path: testInfo.outputPath(`navigation-${width}.png`),
          animations: "disabled",
        });
    }
    for (const [name, anchor] of [
      ["业务场景", "work"],
      ["决策支持", "research"],
    ]) {
      if (width < 760 && !(await navigation.isVisible()))
        await page
          .getByRole("button", { name: "打开导航", exact: true })
          .click();
      await navigation.getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
      await expect(page.locator(`#${anchor}`)).toBeFocused();
    }

    if (process.env.LANDING_REFERENCE_URL) {
      const reference = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      try {
        await reference.goto(process.env.LANDING_REFERENCE_URL);
        await expect(reference.locator(".f-hero")).toBeVisible();
        for (const image of await reference.locator("img").all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((el) => el.decode());
        }
        await reference.evaluate(() => document.fonts.ready);
        for (const selector of [
          ".f-hero",
          ".f-work .f-container",
          ".p-stage",
          ".f-memory .f-container",
          ".f-about-copy",
          ".f-trial-layout",
          ".f-footer",
        ]) {
          const capture = async (target, label) => {
            const locator = target.locator(selector);
            await locator.scrollIntoViewIfNeeded();
            return locator.screenshot({
              path: testInfo.outputPath(
                `${label}-${selector.replaceAll(/[^a-z0-9]/gi, "_")}.png`,
              ),
              animations: "disabled",
              style: ".f-header,.f-skip {visibility:hidden!important}",
            });
          };
          const a = PNG.sync.read(await capture(reference, "approved"));
          const b = PNG.sync.read(await capture(page, "published"));
          expect(b.width, selector).toBe(a.width);
          expect(b.height, selector).toBe(a.height);
          let changed = 0;
          for (let index = 0; index < a.data.length; index += 4) {
            if (
              Math.max(
                ...[0, 1, 2].map((channel) =>
                  Math.abs(a.data[index + channel] - b.data[index + channel]),
                ),
              ) > 24
            )
              changed++;
          }
          expect(changed / (a.width * a.height), selector).toBeLessThan(0.025);
        }
      } finally {
        await reference.close();
      }
    }

    for (const tab of await page
      .getByRole("tablist", { name: "猎头业务场景" })
      .getByRole("tab")
      .all()) {
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await page.getByRole("button", { name: "查看研究依据" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
    }
    for (const name of ["找信息", "找人", "找岗位"]) {
      const tab = page
        .locator(".f-memory")
        .getByRole("tab", { name, exact: true });
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator(".f-memory .f-network-node")).toHaveCount(5);
    }
    await page.locator("#research").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "下一张", exact: true }).click();
    await expect(page.locator("#research")).toHaveAttribute(
      "data-chapter",
      "1",
    );
    await page.getByRole("button", { name: "上一张", exact: true }).click();
    await expect(page.locator("#research")).toHaveAttribute(
      "data-chapter",
      "0",
    );
    if (width < 760) {
      await page.getByRole("button", { name: "打开导航", exact: true }).click();
      await expect(page.locator("#f-navigation")).toBeVisible();
      await page
        .locator("#f-navigation")
        .getByRole("link", { name: "关于铂寻" })
        .click();
      await expect(page.locator("#about h2")).toBeInViewport();
    }
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  });

  test(`static landing never sends contact data to an unconfigured service at ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const posts = [];
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto("./landing/#apply");
    for (const [name, value] of Object.entries({
      name: "验收测试",
      company: "虚构团队",
      phone: "+1 202 555 0123",
      email: "pages-qa@example.invalid",
    }))
      await page.locator(`[name="${name}"]`).fill(value);
    const choose = async (name, value) => {
      const trigger = page.locator(`#f-trial-${name}`);
      if ((await trigger.getAttribute("aria-expanded")) !== "true")
        await trigger.click();
      await page
        .locator(`#f-trial-${name}-list`)
        .getByRole("option", { name: value, exact: true })
        .click();
    };
    await choose("role", "猎头顾问");
    await choose("activePositions", "6-10");
    await choose("industry", "智能制造");
    await page.locator("#f-trial-industry").press("Escape");
    await page.locator("#f-trial-consent").check();
    await page.locator(".f-trial-submit").click();
    await expect(page.locator("[data-form-status]")).toContainText(
      "申请服务暂时不可用",
    );
    await expect(page.locator("[data-form-success]")).toBeHidden();
    expect(posts).toEqual([]);
    expect(
      await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
      })),
    ).toEqual({ local: 0, session: 0 });
    await page.screenshot({
      path: testInfo.outputPath(`safe-submit-${width}.png`),
      animations: "disabled",
    });
  });
}

test("landing retains readable fallback when scripts are disabled", async ({
  browser,
}, testInfo) => {
  const page = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    await page.goto(new URL("./landing/", testInfo.project.use.baseURL).href);
    await expect(
      page.getByRole("heading", { name: "HunterBuddy", exact: true }),
    ).toBeVisible();
    await expect(page.locator("#research article")).toHaveCount(3);
    await expect(page.locator("#work article")).toHaveCount(4);
    await expect(page.locator("#footer")).toContainText(
      "北京铂寻智能科技有限公司",
    );
    expect(await page.locator("main").count()).toBe(1);
    await page.screenshot({
      path: testInfo.outputPath("fallback-mobile.png"),
      fullPage: true,
    });
  } finally {
    await page.close();
  }
});

test("research carousel advances automatically after five seconds", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./landing/#research");
  await page.locator(".p-stage").scrollIntoViewIfNeeded();
  await page.mouse.move(5, 80);
  await expect(page.locator("#research")).toHaveAttribute("data-chapter", "0");
  await expect(page.locator("#research")).toHaveAttribute("data-chapter", "1", {
    timeout: 7500,
  });
});
