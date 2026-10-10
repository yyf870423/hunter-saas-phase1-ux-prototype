import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";

const base =
  process.env.HOMEPAGE_PREVIEW_URL ||
  "http://127.0.0.1:5191/hunter-saas-phase1-ux-prototype/";
const out = path.resolve(
  process.env.HOMEPAGE_ARTIFACT_DIR ||
    "artifacts/homepage-options-20261010/local",
);
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
function check(value, message) {
  assert.ok(value, message);
  results.push(message);
}
const url = (route) => new URL(route, base).href;
try {
  const reference = await browser.newPage();
  await reference.goto(url("landing/"));
  const baseline = await reference.evaluate(() => ({
    data: window.FinesseHomepageData,
    research: window.FinesseResearchChaptersData,
    hero: document.querySelector(".f-hero-copy").innerText,
    about: document.querySelector(".f-about-copy").innerText,
    footer: document.querySelector(".f-footer").innerText,
  }));
  await reference.close();
  for (const [width, height] of [
    [1440, 900],
    [1440, 640],
    [1024, 768],
    [390, 844],
    [320, 740],
    [320, 568],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [],
      failures = [],
      posts = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) failures.push(response.url());
    });
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto(url("landing-signal/"));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);
    check(
      (await page.locator('[data-signal-mounted="true"]').count()) === 1,
      `${width}: restored layout initialized`,
    );
    const data = await page.evaluate(() => ({
      data: window.FinesseHomepageData,
      research: window.FinesseResearchChaptersData,
    }));
    assert.deepEqual(data, {
      data: baseline.data,
      research: baseline.research,
    });
    check(
      (await page.locator(".f-hero-copy").innerText()) === baseline.hero,
      `${width}: authoritative hero copy`,
    );
    const about = await page.locator("#about").innerText();
    for (const line of baseline.about.split("\n").filter(Boolean))
      check(about.includes(line), `${width}: company copy ${line}`);
    check(
      (await page.locator(".f-footer").innerText()) === baseline.footer,
      `${width}: authoritative footer`,
    );
    const nextSection = await page.locator(".s-section-label").boundingBox();
    check(
      nextSection && nextSection.y + nextSection.height < height,
      `${width}x${height}: next section is visible in first viewport`,
    );
    await page.screenshot({
      path: path.join(out, `signal-hero-${width}-${height}.png`),
    });
    const body = await page.locator("#homepage").innerText();
    for (const item of baseline.data.works) {
      await page.getByRole("tab", { name: item.label, exact: true }).click();
      const selectedBody = await page.locator("#work").innerText();
      for (const text of [
        item.label,
        item.headline,
        item.description,
        item.descriptionDetail,
        ...item.rows.map((row) => row.copy),
      ].filter(Boolean))
        check(
          selectedBody.includes(text),
          `${width}: ${item.label} copy and results retained`,
        );
      const button = page.locator("[data-evidence]");
      await button.click();
      const dialog = page.getByRole("dialog");
      check(await dialog.isVisible(), `${width}: ${item.label} evidence opens`);
      check(
        (await dialog.innerText()).includes(item.questions[2]),
        `${width}: ${item.label} verification boundary`,
      );
      await page.keyboard.press("Escape");
      check(!(await dialog.isVisible()), `${width}: modal closes`);
    }
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
    for (const selector of [
      ".s-opening",
      ".s-overview",
      "#work",
      ".f-memory",
      "#about",
    ]) {
      await page.locator(selector).screenshot({
        style: ".f-header { visibility: hidden !important; }",
        path: path.join(
          out,
          `signal-${selector.replace(/[^a-z]/g, "")}-${width}-${height}.png`,
        ),
      });
    }
    for (const item of baseline.data.assetNetwork.paths) {
      await page.getByRole("tab", { name: item.label, exact: true }).click();
      check(
        (await page.locator(".f-network-node.is-active").count()) ===
          item.nodes.length,
        `${width}: ${item.label} entity highlighting`,
      );
    }
    await page.locator("#research").scrollIntoViewIfNeeded();
    const previous = await page
      .locator("#research")
      .getAttribute("data-chapter");
    await page.getByRole("button", { name: "下一张", exact: true }).click();
    check(
      (await page.locator("#research").getAttribute("data-chapter")) !==
        previous,
      `${width}: manual carousel`,
    );
    const form = page.getByRole("form", { name: "HunterBuddy 试用申请" });
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.getAttribute("data-state")) === "invalid",
      `${width}: required form validation`,
    );
    await form.locator('[name="phone"]').fill("123");
    await form.locator('[name="email"]').fill("bad@@email");
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.locator('[name="phone"]').getAttribute("aria-invalid")) ===
        "true" &&
        (await form.locator('[name="email"]').getAttribute("aria-invalid")) ===
          "true",
      `${width}: contact format validation`,
    );
    for (const [name, value] of Object.entries({
      name: "本地验收",
      company: "虚构团队",
      phone: "13800138000",
      email: "qa@example.invalid",
    }))
      await form.locator(`[name="${name}"]`).fill(value);
    for (const [name, value] of [
      ["role", "猎头顾问"],
      ["activePositions", "6-10"],
      ["industry", "智能制造"],
    ]) {
      await form.locator(`#f-trial-${name}`).click();
      await page.getByRole("option", { name: value, exact: true }).click();
      await page.keyboard.press("Escape");
    }
    await form.locator('[name="acknowledgedPurpose"]').check();
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.locator("[data-form-status]").textContent()).includes(
        "申请服务暂时不可用",
      ) && posts.length === 0,
      `${width}: static submission never sends personal data`,
    );
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: path.join(out, `signal-full-${width}-${height}.png`),
      fullPage: true,
    });
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}: no page overflow`,
    );
    check(
      await page
        .locator("h1,h2,h3,.f-work-lead p,.s-overview a,.f-network-node")
        .evaluateAll((nodes) =>
          nodes.every((node) => node.scrollWidth <= node.clientWidth + 2),
        ),
      `${width}: no clipped copy`,
    );
    check(
      !body.includes("Mock") &&
        !body.includes("团队背景与公司信息将在正式发布时补充"),
      `${width}: no obsolete placeholder claims`,
    );
    await page.goto(url("homepages/"));
    for (const image of await page.locator(".h-option img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((image) => image.decode());
    }
    check(
      (await page.locator(".h-option").count()) === 5,
      `${width}: all homepage choices`,
    );
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}: catalog no overflow`,
    );
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: path.join(out, `catalog-${width}-${height}.png`),
      fullPage: true,
    });
    for (const [index, route] of [
      [0, ""],
      [1, "landing-signal/"],
      [2, "landing/"],
      [3, "landing-origin/"],
      [4, "landing-superhuman/"],
    ]) {
      const popupPromise = page.waitForEvent("popup");
      await page.locator(".h-option").nth(index).click();
      const preview = await popupPromise;
      preview.on("pageerror", (error) => errors.push(error.message));
      preview.on("response", (response) => {
        if (response.status() >= 400) failures.push(response.url());
      });
      await preview.waitForLoadState();
      check(
        preview.url() === url(route),
        `${width}: catalog links stay within GitHub repository path`,
      );
      check(
        page.url() === url("homepages/"),
        `${width}: catalog stays open while preview uses a new tab`,
      );
      check(
        await preview.evaluate(() => window.opener === null),
        `${width}: preview cannot control the catalog tab`,
      );
      const heroSelector =
        route === "landing-superhuman/"
          ? "#sh-hero-title"
          : route
            ? ".f-hero h1"
            : ".lp-hero h1";
      await preview.locator(heroSelector).waitFor();
      check(
        await preview.locator(heroSelector).isVisible(),
        `${width}: choice ${index + 1} loads`,
      );
      await preview.close();
    }
    check(
      errors.length === 0,
      `${width}: no browser errors ${errors.join(",")}`,
    );
    check(
      failures.length === 0,
      `${width}: no failed resources ${failures.join(",")}`,
    );
    await page.close();
  }
  for (const route of ["homepages/", "landing-signal/", "landing-origin/"]) {
    const page = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    await page.goto(url(route));
    check(
      (await page.locator("body").innerText()).includes(
        route === "homepages/" ? "第三版首页" : "为猎头化繁解难",
      ),
      `${route}: no-script content retained`,
    );
    await page.screenshot({
      path: path.join(out, `no-js-${route.replace("/", "")}.png`),
      fullPage: true,
    });
    await page.close();
  }
  if (!process.env.HOMEPAGE_SKIP_LOCAL_HASHES) {
    const reviewedSharedChanges = {
      "dist/landing/research-chapters.js": {
        before:
          "6e9fdd259d87be912f4d7714fba214b033a6c97386e7ae79aa0b2558542b8d54",
        after:
          "941b5008b529e8d68a5203a2c6941c03755982293809c14b09df883f809d686b",
      },
    };
    const hashes = JSON.parse(
      await fs.readFile(
        "artifacts/homepage-options-20261010/baseline/build-hashes.json",
        "utf8",
      ),
    );
    // These files are explicitly changed by the approved title and scenario updates.
    const unchanged = hashes.filter(
      (item) =>
        ![
          "dist/landing/index.html",
          "dist/landing-signal/index.html",
          "dist/landing-signal/shared-signal.js",
          "dist/landing-signal/shared-signal.css",
        ].includes(item.file),
    );
    for (const item of unchanged) {
      const sharedChange = reviewedSharedChanges[item.file];
      if (sharedChange) assert.equal(item.sha256, sharedChange.before);
      assert.equal(
        createHash("sha256")
          .update(await fs.readFile(item.file))
          .digest("hex"),
        sharedChange?.after || item.sha256,
        item.file,
      );
    }
    check(
      true,
      `${unchanged.length} other build files remain byte-identical; changed copy checked above`,
    );
  }
  await fs.writeFile(
    path.join(out, "report.json"),
    JSON.stringify(
      { status: "passed", checks: results.length, base, results },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      status: "passed",
      checks: results.length,
      base,
      artifacts: out,
    }),
  );
} finally {
  await browser.close();
}
