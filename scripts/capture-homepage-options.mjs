import { chromium } from "@playwright/test";
import path from "node:path";
const base =
  process.env.HOMEPAGE_PREVIEW_URL ||
  "http://127.0.0.1:5191/hunter-saas-phase1-ux-prototype/";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  for (const [name, route] of [
    ["original", ""],
    ["signal", "landing-signal/"],
    ["finesse", "landing/"],
    ["origin", "landing-origin/"],
  ]) {
    if (
      process.env.HOMEPAGE_CAPTURE_OPTION &&
      process.env.HOMEPAGE_CAPTURE_OPTION !== name
    )
      continue;
    await page.goto(new URL(route, base).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    if (name === "original") await page.locator(".lp-hero").waitFor();
    else await page.locator(".f-hero img").evaluate((image) => image.decode());
    await page.screenshot({
      path: path.resolve(`public/homepages/assets/${name}.png`),
      animations: "disabled",
    });
    console.log(`Captured ${name}`);
  }
} finally {
  await browser.close();
}
