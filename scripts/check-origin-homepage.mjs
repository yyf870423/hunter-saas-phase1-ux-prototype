import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";

const base = process.env.ORIGIN_PREVIEW_URL || "http://127.0.0.1:5190";
const out = path.resolve(
  process.env.ORIGIN_ARTIFACT_DIR ||
    "artifacts/landing-origin-20261010/acceptance",
);
await fs.mkdir(out, { recursive: true });
execFileSync("git", [
  "diff",
  "--exit-code",
  "--",
  "public/landing",
  "src",
  ".github/workflows/pages.yml",
  "package.json",
  "package-lock.json",
]);
const browser = await chromium.launch();
const results = [];
let checks = 0;
function check(value, message) {
  assert.ok(value, message);
  checks += 1;
}
const reference = await browser.newPage();
await reference.goto(`${base}/landing/`);
await reference.evaluate(() => document.fonts.ready);
const baseline = await reference.evaluate(() => {
  const root = document.querySelector("#homepage").cloneNode(true);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const text = [];
  while (walker.nextNode()) {
    if (walker.currentNode.parentElement.closest('[aria-hidden="true"]'))
      continue;
    const value = walker.currentNode.textContent.replace(/\s+/g, " ").trim();
    if (value) text.push(value);
  }
  return {
    text: text.sort(),
    data: window.FinesseHomepageData,
    research: window.FinesseResearchChaptersData,
  };
});
await reference.close();

try {
  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [1024, 768],
    [390, 844],
    [320, 740],
    [1440, 640],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    const posts = [];
    const productImages = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
      if (request.url().includes("hunter-workspace.png"))
        productImages.push(request.url());
    });
    const response = await page.goto(`${base}/landing-origin/`);
    check(response.status() === 200, `${width}: preview HTTP`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);
    const actual = await page.evaluate(() => {
      const root = document.querySelector("#homepage").cloneNode(true);
      root
        .querySelectorAll(".o-category-meta")
        .forEach((item) => item.remove());
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const text = [];
      while (walker.nextNode()) {
        if (walker.currentNode.parentElement.closest('[aria-hidden="true"]'))
          continue;
        const value = walker.currentNode.textContent
          .replace(/\s+/g, " ")
          .trim();
        if (value) text.push(value);
      }
      return {
        text: text.sort(),
        data: window.FinesseHomepageData,
        research: window.FinesseResearchChaptersData,
      };
    });
    assert.deepEqual(
      actual,
      baseline,
      `${width}: all second-version copy and business data preserved`,
    );
    checks += 1;
    check(
      (await page.locator(".f-hero h1").textContent()) === "HunterBuddy",
      `${width}: product name`,
    );
    await page.screenshot({
      path: path.join(out, `hero-${width}-${height}.png`),
    });
    const hero = await page.locator(".f-hero").boundingBox();
    check(hero.y + hero.height < height, `${width}: next section hint`);
    check(
      (await page
        .locator('.o-product-proof, img[src*="hunter-workspace"]')
        .count()) === 0 && productImages.length === 0,
      `${width}: product screenshot is removed and not loaded`,
    );
    const display = await page
      .locator(".f-hero h1")
      .evaluate((node) => getComputedStyle(node).fontFamily);
    check(display.includes("Origin Display"), `${width}: display type`);
    check(
      await page.evaluate(() =>
        [...document.fonts].every((font) => font.status === "loaded"),
      ),
      `${width}: local fonts`,
    );

    const work = page.getByRole("tablist", { name: "猎头业务场景" });
    for (const item of baseline.data.works) {
      await work.getByRole("tab", { name: item.label, exact: true }).click();
      check(
        (await page.locator("#f-work-panel .f-work-lead h3").textContent()) ===
          item.headline,
        `${width}: ${item.label} heading`,
      );
      check(
        (await work
          .getByRole("tab", { name: item.label, exact: true })
          .getAttribute("aria-selected")) === "true",
        `${width}: ${item.label} selection`,
      );
      check(
        (await page.locator("#f-work-panel .f-result").innerText()).includes(
          item.rows[2].copy,
        ),
        `${width}: ${item.label} result retained`,
      );
      await page.getByRole("button", { name: "查看研究依据" }).click();
      const dialog = page.getByRole("dialog");
      check(await dialog.isVisible(), `${width}: evidence modal`);
      check(
        (await dialog.innerText()).includes(item.questions[2]),
        `${width}: consent and uncertainty copy`,
      );
      await page.keyboard.press("Escape");
      check(!(await dialog.isVisible()), `${width}: Escape closes modal`);
    }
    await work.getByRole("tab", { name: "岗位找人", exact: true }).click();
    await page.keyboard.press("ArrowRight");
    check(
      (await work
        .getByRole("tab", { name: "客户开发", exact: true })
        .getAttribute("aria-selected")) === "true",
      `${width}: keyboard tabs`,
    );
    await page.keyboard.press("Home");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    check(
      await work
        .getByRole("tab", { name: "岗位找人", exact: true })
        .evaluate(
          (node) =>
            node.matches(":focus-visible") &&
            getComputedStyle(node).outlineStyle === "solid",
        ),
      `${width}: keyboard focus remains visible`,
    );
    await page.screenshot({
      path: path.join(out, `work-${width}-${height}.png`),
    });
    const tabStyles = await work.locator(".f-tab").evaluateAll((nodes) =>
      nodes.map((node) => ({
        selected: node.getAttribute("aria-selected") === "true",
        background: getComputedStyle(node).backgroundColor,
        border: getComputedStyle(node).borderTopWidth,
        radius: getComputedStyle(node).borderRadius,
        underline: new DOMMatrix(getComputedStyle(node, "::after").transform).a,
        height: node.getBoundingClientRect().height,
      })),
    );
    check(
      tabStyles.every(
        (tab) =>
          tab.height === 48 &&
          tab.background === "rgba(0, 0, 0, 0)" &&
          tab.border === "0px" &&
          tab.radius === "0px",
      ) &&
        tabStyles.find((tab) => tab.selected).underline === 1 &&
        tabStyles
          .filter((tab) => !tab.selected)
          .every((tab) => tab.underline === 0),
      `${width}: transparent line tabs with distinct selection`,
    );
    check(
      await page
        .locator(".f-nav a")
        .first()
        .evaluate(
          (node) =>
            getComputedStyle(node).borderTopWidth === "1px" &&
            getComputedStyle(node).borderRadius === "8px",
        ),
      `${width}: outlined header navigation remains distinct`,
    );
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(0, 0);
    await page.screenshot({
      path: path.join(out, `work-default-${width}-${height}.png`),
    });
    const nextTab = work.getByRole("tab", { name: "客户开发", exact: true });
    await nextTab.hover();
    await page.waitForTimeout(250);
    check(
      await nextTab.evaluate(
        (node) =>
          new DOMMatrix(getComputedStyle(node, "::after").transform).a > 0 &&
          new DOMMatrix(getComputedStyle(node, "::after").transform).a < 1 &&
          getComputedStyle(node).backgroundColor === "rgba(0, 0, 0, 0)",
      ),
      `${width}: hover has a short underline without button fill`,
    );
    await page.mouse.move(0, 0);

    await page.locator(".p-stage").scrollIntoViewIfNeeded();
    await page.locator(".p-stage").focus();
    for (let i = 0; i < 3; i += 1) {
      const current = Number(
        await page.locator("#research").getAttribute("data-chapter"),
      );
      await page.getByRole("button", { name: "下一张", exact: true }).click();
      await page.waitForTimeout(650);
      check(
        Number(await page.locator("#research").getAttribute("data-chapter")) ===
          (current + 1) % 3,
        `${width}: carousel next`,
      );
      const slide = page.locator(".p-slide.is-current");
      check(
        (await slide.getAttribute("aria-hidden")) === "false",
        `${width}: current slide accessible`,
      );
    }
    check(
      (await page
        .locator("[data-carousel-play], [data-carousel-pause]")
        .count()) === 0,
      `${width}: no play button`,
    );
    await page.screenshot({
      path: path.join(out, `research-${width}-${height}.png`),
    });

    const network = page.locator(".f-asset-network");
    const networkTabs = page.getByRole("tablist", {
      name: "资产支持的研究目标",
    });
    for (const route of baseline.data.assetNetwork.paths) {
      await networkTabs
        .getByRole("tab", { name: route.label, exact: true })
        .click();
      await page.waitForTimeout(280);
      check(
        (await network.locator(".f-network-node.is-active").count()) ===
          route.nodes.length,
        `${width}: ${route.label} active entities`,
      );
      check(
        (await network.locator(".f-network-wires .is-active").count()) ===
          route.edges.length,
        `${width}: ${route.label} active relationships`,
      );
      check(
        (await network.locator(".f-network-story").innerText()).includes(
          route.check,
        ),
        `${width}: ${route.label} verification boundary`,
      );
      const contrast = await network.evaluate((node) => {
        const active = node.querySelector(".f-network-node.is-active");
        const other = node.querySelector(".f-network-node:not(.is-active)");
        return (
          getComputedStyle(active).backgroundColor !==
          getComputedStyle(other).backgroundColor
        );
      });
      check(contrast, `${width}: fade unrelated entities`);
      const visual = await network.evaluate((node) => {
        const map = node
          .querySelector(".f-network-map")
          .getBoundingClientRect();
        const entities = [...node.querySelectorAll("[data-node]")];
        const relations = [...node.querySelectorAll("[data-edge]")];
        const overlaps = (a, b) =>
          a.left < b.right - 1 &&
          a.right > b.left + 1 &&
          a.top < b.bottom - 1 &&
          a.bottom > b.top + 1;
        return {
          start: node.dataset.startNode,
          starts: entities
            .filter((entity) => entity.classList.contains("is-start"))
            .map((entity) => entity.dataset.node),
          levels: [
            ...new Set(
              entities.map(
                (entity) => getComputedStyle(entity).backgroundColor,
              ),
            ),
          ],
          inactiveFrames: entities
            .filter((entity) => !entity.classList.contains("is-active"))
            .every((entity) => {
              const style = getComputedStyle(entity);
              const luminance = (color) => {
                const rgb = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
                if (!rgb) return NaN;
                const channels = rgb.slice(1).map((value) => {
                  const channel = Number(value) / 255;
                  return channel <= 0.04045
                    ? channel / 12.92
                    : ((channel + 0.055) / 1.055) ** 2.4;
                });
                return (
                  channels[0] * 0.2126 +
                  channels[1] * 0.7152 +
                  channels[2] * 0.0722
                );
              };
              const foreground = luminance(style.borderTopColor);
              const background = luminance(style.backgroundColor);
              const contrast =
                (Math.max(foreground, background) + 0.05) /
                (Math.min(foreground, background) + 0.05);
              return (
                style.borderTopStyle === "solid" &&
                parseFloat(style.borderTopWidth) === 1 &&
                contrast >= 3
              );
            }),
          connections: [...node.querySelectorAll("[data-wire]")].every(
            (wire) => {
              const box = wire.getBBox();
              return (
                !wire.getAttribute("d").includes(" C ") &&
                (wire.getAttribute("d").includes(" Q ") ||
                  wire.getAttribute("d").includes(" L ")) &&
                box.x >= -1 &&
                box.y >= -1 &&
                box.x + box.width <= map.width + 1 &&
                box.y + box.height <= map.height + 1
              );
            },
          ),
          overlap: relations.some((label) =>
            entities.some((entity) =>
              overlaps(
                label.getBoundingClientRect(),
                entity.getBoundingClientRect(),
              ),
            ),
          ),
          labelClipping: relations.some((label) => {
            const box = label.getBoundingClientRect();
            return (
              box.left < map.left - 1 ||
              box.right > map.right + 1 ||
              box.top < map.top - 1 ||
              box.bottom > map.bottom + 1 ||
              label.scrollWidth > label.clientWidth + 2
            );
          }),
          pending: [...node.querySelectorAll("[data-wire].is-pending")].every(
            (wire) => getComputedStyle(wire).strokeDasharray !== "none",
          ),
          mutedWiresVisible: [
            ...node.querySelectorAll("[data-wire]:not(.is-active)"),
          ].every((wire) => {
            const style = getComputedStyle(wire);
            return style.opacity === "1" && parseFloat(style.strokeWidth) >= 1;
          }),
          diagonalDistances: relations
            .filter((label) =>
              ["experience", "fit", "connection", "authorship"].includes(
                label.dataset.edge,
              ),
            )
            .map((label) => {
              const wire = node.querySelector(
                `[data-wire="${label.dataset.edge}"]`,
              );
              const range = document.createRange();
              range.selectNodeContents(
                label.querySelector("span:not(.f-network-sr)"),
              );
              const textBoxes = [...range.getClientRects()];
              let distance = Infinity;
              const length = wire.getTotalLength();
              for (let i = 0; i <= 100; i += 1) {
                const point = wire.getPointAtLength((length * i) / 100);
                const x = map.left + point.x;
                const y = map.top + point.y;
                textBoxes.forEach((box) => {
                  distance = Math.min(
                    distance,
                    Math.hypot(
                      Math.max(box.left - x, 0, x - box.right),
                      Math.max(box.top - y, 0, y - box.bottom),
                    ),
                  );
                });
              }
              return { edge: label.dataset.edge, distance };
            }),
        };
      });
      check(
        visual.start === route.nodes[0] &&
          visual.starts.length === 1 &&
          visual.starts[0] === route.nodes[0],
        `${width}: ${route.label} has the correct single origin`,
      );
      check(
        visual.levels.length === 3,
        `${width}: ${route.label} has three surface levels`,
      );
      check(
        visual.inactiveFrames,
        `${width}: ${route.label} unselected assets retain visible frames`,
      );
      check(
        visual.connections,
        `${width}: ${route.label} clean connections stay inside the map`,
      );
      check(
        !visual.overlap && !visual.labelClipping,
        `${width}: ${route.label} all relation labels remain readable`,
      );
      check(
        visual.pending,
        `${width}: ${route.label} pending relations stay dashed`,
      );
      check(
        visual.mutedWiresVisible,
        `${width}: ${route.label} unrelated relationships remain visible`,
      );
      check(
        visual.diagonalDistances.every((item) => item.distance <= 20),
        `${width}: ${route.label} diagonal titles stay near their lines: ${JSON.stringify(visual.diagonalDistances)}`,
      );
      await page.waitForTimeout(520);
      await network.screenshot({
        path: path.join(out, `network-${route.id}-${width}-${height}.png`),
      });
    }
    await page.locator(".f-memory").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(out, `network-${width}-${height}.png`),
    });

    const form = page.getByRole("form", { name: "HunterBuddy 试用申请" });
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.getAttribute("data-state")) === "invalid",
      `${width}: required fields`,
    );
    await form.locator('[name="phone"]').fill("123");
    await form.locator('[name="email"]').fill("bad@@email");
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.locator('[name="phone"]').getAttribute("aria-invalid")) ===
        "true",
      `${width}: phone format`,
    );
    check(
      (await form.locator('[name="email"]').getAttribute("aria-invalid")) ===
        "true",
      `${width}: email format`,
    );
    await form.locator('[name="name"]').fill("视觉验收");
    await form.locator('[name="company"]').fill("本地验收公司");
    await form.locator('[name="phone"]').fill("13800138000");
    await form.locator('[name="email"]').fill("qa@example.com");
    for (const [name, label] of [
      ["role", "猎头顾问"],
      ["activePositions", "6-10"],
      ["industry", "智能制造"],
    ]) {
      await form.locator(`#f-trial-${name}`).click();
      await page.getByRole("option", { name: label, exact: true }).click();
      await page.keyboard.press("Escape");
    }
    await form.locator('[name="acknowledgedPurpose"]').check();
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.locator("[data-form-status]").textContent()).includes(
        "申请服务暂时不可用",
      ),
      `${width}: no simulated success`,
    );
    check(posts.length === 0, `${width}: no real external trial submission`);
    await page.locator("#apply").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(out, `form-${width}-${height}.png`),
    });
    check(
      (await page.locator(".f-footer a, .f-footer button").count()) === 0,
      `${width}: footer static menus`,
    );
    check(
      (await page.locator(".f-footer").innerText()).includes(
        "北京铂寻智能科技有限公司",
      ),
      `${width}: legal company`,
    );

    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,button,.f-input,.f-network-node")]
        .filter((node) => {
          if (
            !node.checkVisibility() ||
            node.closest('[aria-hidden="true"], dialog:not([open])')
          )
            return false;
          const box = node.getBoundingClientRect();
          const textOverflow =
            !node.classList.contains("f-icon-button") &&
            node.scrollWidth > node.clientWidth + 2;
          return (
            box.width > 0 &&
            (box.left < -1 || box.right > innerWidth + 1 || textOverflow)
          );
        })
        .map((node) => ({
          tag: node.tagName,
          text: node.textContent.trim().slice(0, 65),
          width: node.clientWidth,
          scrollWidth: node.scrollWidth,
        })),
    );
    check(
      overflow.length === 0,
      `${width}: no clipped text or offscreen controls: ${JSON.stringify(overflow)}`,
    );
    check(
      errors.length === 0,
      `${width}: no browser errors: ${errors.join(", ")}`,
    );
    await page.screenshot({
      path: path.join(out, `full-${width}-${height}.png`),
      fullPage: true,
    });
    results.push({
      viewport: { width, height },
      status: "passed",
      browserErrors: errors,
      applicationPosts: posts,
    });
    await context.close();
  }

  const reduced = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  await reduced.goto(`${base}/landing-origin/#research`);
  await reduced.locator(".p-stage").scrollIntoViewIfNeeded();
  await reduced.waitForTimeout(350);
  const initial = await reduced
    .locator("#research")
    .getAttribute("data-chapter");
  await reduced.waitForTimeout(5300);
  check(
    (await reduced.locator("#research").getAttribute("data-chapter")) ===
      initial,
    "reduced motion: carousel does not autoplay",
  );
  await reduced.getByRole("button", { name: "下一张", exact: true }).click();
  check(
    (await reduced.locator("#research").getAttribute("data-chapter")) !==
      initial,
    "reduced motion: manual carousel works",
  );
  await reduced.getByRole("tab", { name: "找人", exact: true }).click();
  await reduced.waitForTimeout(100);
  check(
    (await reduced.locator(".is-start").getAttribute("data-node")) === "job" &&
      (await reduced.locator(".o-network-trace").count()) === 0,
    "reduced motion: origin updates without path animation",
  );
  await reduced.close();

  const automatic = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await automatic.goto(`${base}/landing-origin/`);
  await automatic.locator(".p-stage").scrollIntoViewIfNeeded();
  await automatic.mouse.move(0, 0);
  await automatic.waitForTimeout(300);
  const before = await automatic
    .locator("#research")
    .getAttribute("data-chapter");
  await automatic.waitForTimeout(5450);
  check(
    (await automatic.locator("#research").getAttribute("data-chapter")) !==
      before,
    "normal motion: five-second autoplay",
  );
  await automatic.close();

  const plain = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await plain.goto(`${base}/landing-origin/`);
  for (const text of [
    "HunterBuddy",
    "客户开发",
    "候选人机会",
    "看得更清楚",
    "五类",
    "为猎头化繁解难",
    "申请表暂时无法加载",
    "北京铂寻智能科技有限公司",
  ]) {
    check(
      (await plain.locator("body").innerText()).includes(text),
      `no JS: ${text}`,
    );
  }
  await plain.screenshot({
    path: path.join(out, "no-js-mobile.png"),
    fullPage: true,
  });
  await plain.close();
  await fs.writeFile(
    path.join(out, "report.json"),
    JSON.stringify(
      {
        status: "passed",
        checks,
        results,
        protectedFiles:
          "Git diff is empty for previous landing, product source, CI and dependency inputs",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify({ status: "passed", checks, screenshots: out }));
} finally {
  await browser.close();
}
