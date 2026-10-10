import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = "http://127.0.0.1:5191/hunter-saas-phase1-ux-prototype/";
const out = ".impeccable/review/superhuman-carousel-20261010";
await fs.mkdir(out, { recursive: true });
const results = [];
const check = (passed, message) =>
  results.push({ passed: Boolean(passed), message });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1536, height: 1024 },
  });
  await page.goto(base + "landing-superhuman/#research");
  await page.waitForSelector("[data-superhuman-mounted=true]");
  await page.evaluate(() => document.fonts.ready);
  const root = page.locator(".sh-research-carousel");
  const stage = root.locator(".p-stage");
  await stage.scrollIntoViewIfNeeded();
  await page.mouse.move(4, 4);
  await page.waitForFunction(
    () =>
      document.querySelector(".sh-research-carousel").dataset.playback ===
      "playing",
  );
  const began = Date.now();
  await page.waitForFunction(
    () =>
      document.querySelector(".sh-research-carousel").dataset.chapter === "1",
    { timeout: 7500 },
  );
  check(
    Date.now() - began >= 4500,
    "automatic advance uses five-second reading interval",
  );
  await page.waitForTimeout(700);
  const height = (await stage.boundingBox()).height;
  await root.locator("[data-carousel-next]").click();
  await page.waitForTimeout(700);
  check(
    (await root.getAttribute("data-chapter")) === "2",
    "right arrow advances current chapter",
  );
  check(
    Math.abs((await stage.boundingBox()).height - height) < 2,
    "chapter change preserves stage height",
  );
  await root.locator("[data-carousel-next]").click();
  await page.waitForTimeout(700);
  check(
    (await root.getAttribute("data-chapter")) === "0",
    "right arrow wraps last to first",
  );
  await root.locator("[data-carousel-previous]").click();
  await page.waitForTimeout(700);
  check(
    (await root.getAttribute("data-chapter")) === "2",
    "left arrow wraps first to last",
  );
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  check(
    (await root.getAttribute("data-chapter")) === "0",
    "keyboard arrow advances chapter",
  );
  check(
    (await root.getAttribute("data-playback")) === "paused",
    "keyboard reading pauses autoplay",
  );
  await page.keyboard.press(" ");
  await page.evaluate(() => document.activeElement.blur());
  await page.mouse.move(4, 4);
  check(
    (await root.getAttribute("data-playback")) === "paused",
    "space pause persists after leaving focus",
  );
  await page.evaluate(() => scrollBy(0, 70));
  check(
    (await root.getAttribute("data-chapter")) === "0",
    "scroll does not choose a chapter",
  );
  await stage.focus();
  await page.keyboard.press(" ");
  await page.evaluate(() => document.activeElement.blur());
  await stage.hover();
  check(
    (await root.getAttribute("data-playback")) === "paused",
    "hover pauses autoplay for reading",
  );
  await page.mouse.move(4, 4);
  await page.waitForFunction(
    () =>
      document.querySelector(".sh-research-carousel").dataset.playback ===
      "playing",
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(
    () =>
      document.querySelector(".sh-research-carousel").dataset.playback ===
      "waiting",
  );
  check(true, "offscreen chapter stops automatic timer");
  await stage.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await root.locator("[data-carousel-next]").click();
  check(
    (await root.getAttribute("data-playback")) === "paused",
    "reduced motion defaults to manual reading",
  );
  check(
    await root
      .locator(".p-slide")
      .evaluateAll((nodes) =>
        nodes.every((node) => node.getAnimations().length === 0),
      ),
    "reduced motion changes without spatial animation",
  );
  check(
    (await root.locator("button").count()) === 2,
    "only two arrows, no playback or chapter-tab buttons",
  );
  const skin = await root.locator("[data-carousel-next]").evaluate((node) => ({
    background: getComputedStyle(node).backgroundColor,
    icon: getComputedStyle(node.querySelector("svg")).width,
  }));
  check(
    skin.background === "rgba(0, 0, 0, 0)" && skin.icon === "40px",
    "transparent large arrows preserve approved presentation",
  );
  await page.close();

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  await mobile.goto(base + "landing-superhuman/#research");
  await mobile.waitForSelector("[data-superhuman-mounted=true]");
  const mobileStage = mobile.locator(".sh-research-carousel .p-stage");
  await mobileStage.scrollIntoViewIfNeeded();
  const box = await mobileStage.boundingBox();
  const y = Math.min(Math.max(box.y + 140, 180), 650);
  const cdp = await mobile.context().newCDPSession(mobile);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 300, y }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 110, y }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  check(
    (await mobile
      .locator(".sh-research-carousel")
      .getAttribute("data-chapter")) === "1",
    "native touch swipe advances mobile chapter",
  );
  await mobile.close();

  const second = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });
  await second.route("**/research-chapter-gaps-20261008.webp", (route) =>
    route.abort(),
  );
  await second.goto(base + "landing/#research");
  await second.waitForSelector(".p-carousel-ready");
  const original = second.locator("#research");
  await original.locator("[data-carousel-next]").click();
  check(
    (await original.getAttribute("data-chapter")) === "1",
    "second homepage default controller still advances",
  );
  check(
    await original
      .locator("[data-chapter-slide='1'] .p-photo-error")
      .isVisible(),
    "second homepage default image failure handling retained",
  );
  check(
    (await original.locator(".p-stage").getAttribute("aria-label")).startsWith(
      "研究图片",
    ),
    "second homepage default accessible name retained",
  );
  await original.locator("[data-carousel-previous]").click();
  check(
    (await original.getAttribute("data-chapter")) === "0",
    "second homepage reverse action retained",
  );
  await original.screenshot({
    path: out + "/second-default.png",
    style: ".f-header{visibility:hidden!important}",
  });
  await second.close();
} finally {
  await browser.close();
}
const failures = results.filter((item) => !item.passed);
await fs.writeFile(
  out + "/behavior-report.json",
  JSON.stringify({ checks: results.length, failures, results }, null, 2),
);
console.log(
  `${failures.length ? "FAIL" : "PASS"} ${results.length} carousel behavior checks; ${failures.length} failures`,
);
failures.forEach((item) => console.log(item.message));
assert.equal(failures.length, 0);
