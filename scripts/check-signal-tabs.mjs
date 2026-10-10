import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const base =
  process.env.HOMEPAGE_PREVIEW_URL ||
  "http://127.0.0.1:5191/hunter-saas-phase1-ux-prototype/";
const out = path.resolve("artifacts/signal-scenarios-20261010/tabs");
await fs.mkdir(out, { recursive: true });
const checks = [];
function check(value, message) {
  assert.ok(value, message);
  checks.push(message);
}
const browser = await chromium.launch();
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [320, 568],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(new URL("landing-signal/#work", base).href);
    await page.waitForSelector('[data-signal-mounted="true"]');
    await page.evaluate(() => document.fonts.ready);
    const works = await page.evaluate(() => window.FinesseHomepageData.works);
    const tablist = page.getByRole("tablist", { name: "猎头业务场景" });
    const tabs = tablist.getByRole("tab");
    const panel = page.locator("#f-work-panel");
    check((await tabs.count()) === 4, `${width}: four existing business tabs`);
    check(
      (await page.locator(".s-capabilities,.s-capability").count()) === 0,
      `${width}: no flat duplicate scenario articles`,
    );
    check(
      await page.locator(".s-overview .s-scenario-tabs").isVisible(),
      `${width}: selector belongs to the blue introduction band`,
    );
    check(
      (await tabs.first().getAttribute("aria-selected")) === "true",
      `${width}: starts with job sourcing`,
    );
    const paneHeights = [];
    const sectionEnds = [];
    for (let i = 0; i < works.length; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(420);
      check(
        (await tablist.locator('[aria-selected="true"]').count()) === 1 &&
          (await tabs.nth(i).getAttribute("aria-selected")) === "true",
        `${width}: ${works[i].label} is exclusively selected`,
      );
      check(
        (await panel.getAttribute("aria-labelledby")) ===
          (await tabs.nth(i).getAttribute("id")),
        `${width}: ${works[i].label} accessible panel association`,
      );
      const text = await panel.innerText();
      check(
        [works[i].headline, works[i].description, works[i].descriptionDetail]
          .filter(Boolean)
          .every((copy) => text.includes(copy)),
        `${width}: ${works[i].label} full narrative remains`,
      );
      check(
        works
          .filter((_, index) => index !== i)
          .every((work) => !text.includes(work.headline)),
        `${width}: only current narrative is visible`,
      );
      const measure = await panel.boundingBox();
      paneHeights.push(measure.height);
      sectionEnds.push(
        await page
          .locator("#research")
          .evaluate((node) => node.getBoundingClientRect().top + scrollY),
      );
      check(
        await tabs
          .nth(i)
          .evaluate((tab) => tab.scrollWidth <= tab.clientWidth + 1),
        `${width}: ${works[i].label} label is not clipped`,
      );
      await page.locator("#work").screenshot({
        path: path.join(out, `signal-${width}-${works[i].id}.png`),
        style: ".f-header { visibility: hidden !important; }",
      });
    }
    check(
      Math.max(...paneHeights) - Math.min(...paneHeights) <= 2,
      `${width}: stable pane height across all four scenarios`,
    );
    check(
      Math.max(...sectionEnds) - Math.min(...sectionEnds) <= 2,
      `${width}: following section does not shift`,
    );
    await tabs.first().focus();
    for (const [key, index] of [
      ["ArrowRight", 1],
      ["End", 3],
      ["ArrowRight", 0],
      ["ArrowLeft", 3],
      ["Home", 0],
    ]) {
      await page.keyboard.press(key);
      check(
        (await tabs.nth(index).getAttribute("aria-selected")) === "true" &&
          (await tabs
            .nth(index)
            .evaluate((tab) => document.activeElement === tab)),
        `${width}: ${key} selects and focuses expected business tab`,
      );
    }
    const beforeScroll = await page.evaluate(() => scrollY);
    await tabs.nth(1).evaluate((tab) => tab.click());
    await page.waitForTimeout(420);
    check(
      Math.abs((await page.evaluate(() => scrollY)) - beforeScroll) <= 2,
      `${width}: switching does not navigate or move the reading position`,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await tabs.nth(2).click();
    check(
      (await panel.evaluate((node) => node.getAnimations().length)) === 0,
      `${width}: reduced motion disables panel animation`,
    );
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}: no horizontal page overflow`,
    );
    check(errors.length === 0, `${width}: no browser runtime errors`);
    await page.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  path.join(out, "report.json"),
  JSON.stringify(
    { checks: checks.length, results: checks, screenshots: 12 },
    null,
    2,
  ),
);
console.log(
  `PASS ${checks.length} targeted tab checks; 12 real scenario screenshots`,
);
