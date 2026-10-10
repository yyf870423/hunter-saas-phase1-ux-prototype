import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const base =
  process.env.HOMEPAGE_PREVIEW_URL ||
  "http://127.0.0.1:5191/hunter-saas-phase1-ux-prototype/";
const out = path.resolve(
  process.env.TITLE_ARTIFACT_DIR || "artifacts/landing-title-20261010",
);
const recording = process.env.TITLE_RECORD_BASELINE === "1";
const baselinePath = path.resolve(
  process.env.TITLE_BASELINE || path.join(out, "baseline.json"),
);
await fs.mkdir(out, { recursive: true });
const baseline = recording
  ? {}
  : JSON.parse(await fs.readFile(baselinePath, "utf8"));
const browser = await chromium.launch();
const results = [];
function check(value, message) {
  assert.ok(value, message);
  results.push(message);
}
async function snapshot(page, selector) {
  return page.evaluate((selector) => {
    const title = document.querySelector(selector);
    const properties = (node) => {
      const css = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      return {
        text: node.innerText,
        family: css.fontFamily,
        size: css.fontSize,
        weight: css.fontWeight,
        lineHeight: css.lineHeight,
        spacing: css.letterSpacing,
        color: css.color,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
    };
    return {
      title: properties(title),
      copy: document.querySelector("#homepage")?.innerText || title.innerText,
      neighbors: [
        ...document.querySelectorAll(
          ".f-hero-statement,.f-hero-description,.f-hero-actions,.f-nav",
        ),
      ].map(properties),
    };
  }, selector);
}
try {
  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [1024, 768],
    [1440, 640],
    [390, 844],
    [320, 568],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [],
      failed = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) failed.push(response.url());
    });
    await page.goto(new URL("landing/?v=20261010-display-a", base).href);
    await page.locator(".f-hero h1").waitFor();
    await page.evaluate(() => document.fonts.ready);
    const key = `second-${width}-${height}`;
    const actual = await snapshot(page, ".f-hero h1");
    if (recording) baseline[key] = actual;
    else {
      check(
        actual.title.family.includes("Origin Display") &&
          actual.title.weight === "400",
        `${key}: third-version display face and weight`,
      );
      check(
        await page.evaluate(() =>
          [...document.fonts].some(
            (font) =>
              font.family === "Origin Display" && font.status === "loaded",
          ),
        ),
        `${key}: real local font loaded`,
      );
      assert.deepEqual(
        { ...actual.title, family: baseline[key].title.family },
        baseline[key].title,
        `${key}: only the title family changes`,
      );
      assert.deepEqual(
        actual.neighbors,
        baseline[key].neighbors,
        `${key}: adjacent copy, typography and geometry unchanged`,
      );
      check(
        actual.copy === baseline[key].copy,
        `${key}: all page copy retained`,
      );
      check(
        await page
          .locator(".f-hero h1")
          .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
        `${key}: title fits its container`,
      );
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${key}: no page overflow`,
      );
      check(
        errors.length === 0 && failed.length === 0,
        `${key}: no browser errors or failed resources`,
      );
    }
    await page.screenshot({
      path: path.join(out, `${recording ? "before" : "after"}-${key}.png`),
    });
    await page.close();
  }
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    for (const [name, route, selector] of [
      ["original", "", ".lp-hero h1"],
      ["signal", "landing-signal/", ".f-hero h1"],
      ["origin", "landing-origin/", ".f-hero h1"],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      await page.goto(new URL(route, base).href);
      await page.locator(selector).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const key = `${name}-${width}-${height}`;
      const actual = await snapshot(page, selector);
      if (recording) baseline[key] = actual;
      else {
        assert.deepEqual(
          actual,
          baseline[key],
          `${key}: other homepage typography, content and geometry unchanged`,
        );
        check(true, `${key}: other homepage is unchanged`);
      }
      await page.screenshot({
        path: path.join(out, `${recording ? "before" : "after"}-${key}.png`),
      });
      await page.close();
    }
  }
  if (recording) {
    await fs.writeFile(baselinePath, JSON.stringify(baseline, null, 2));
  } else {
    const plain = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    await plain.goto(new URL("landing/?v=20261010-display-a", base).href);
    await plain.evaluate(() => document.fonts.ready);
    check(
      (await plain.locator(".f-static-fallback > h1").innerText()) ===
        "HunterBuddy",
      "No JS: product title remains readable",
    );
    check(
      (
        await plain
          .locator(".f-static-fallback > h1")
          .evaluate((node) => getComputedStyle(node).fontFamily)
      ).includes("Origin Display"),
      "No JS: static title uses the same display face",
    );
    await plain.screenshot({
      path: path.join(out, "no-js.png"),
      fullPage: true,
    });
    await plain.close();

    const fallback = await browser.newPage({
      viewport: { width: 320, height: 568 },
      reducedMotion: "reduce",
    });
    await fallback.route("**/dm-serif-display.ttf", (route) => route.abort());
    await fallback.goto(new URL("landing/", base).href);
    await fallback.evaluate(() => document.fonts.ready);
    check(
      await fallback.locator(".f-hero h1").isVisible(),
      "Font failure: product title remains visible",
    );
    check(
      await fallback
        .locator(".f-hero h1")
        .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "Font failure: fallback fits at 320px",
    );
    await fallback.screenshot({ path: path.join(out, "font-fallback.png") });
    await fallback.close();
    await fs.writeFile(
      path.join(out, "report.json"),
      JSON.stringify(
        { status: "passed", checks: results.length, base, results },
        null,
        2,
      ),
    );
  }
  console.log(
    JSON.stringify({
      status: recording ? "baseline-recorded" : "passed",
      checks: results.length,
      out,
    }),
  );
} finally {
  await browser.close();
}
