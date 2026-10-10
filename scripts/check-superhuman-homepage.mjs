import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";

const base =
  process.env.HOMEPAGE_PREVIEW_URL ||
  "http://127.0.0.1:5191/hunter-saas-phase1-ux-prototype/";
const out = path.resolve(
  process.env.HOMEPAGE_REVIEW_DIR || ".impeccable/review/superhuman-20261010",
);
await fs.mkdir(out, { recursive: true });
const checks = [];
const failures = [];
const screenshots = [];
const researchContrast = [];
const ledgerMeasurements = [];
function check(value, message) {
  checks.push({ message, passed: Boolean(value) });
  if (!value) failures.push(message);
}
const browser = await chromium.launch();
async function capture(page, name, locator) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    document.getAnimations().forEach((animation) => animation.finish()),
  );
  const file = path.join(out, `${name}.png`);
  if (locator)
    await locator.screenshot({
      path: file,
      style: ".f-header { visibility: hidden !important; }",
    });
  else {
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: file });
  }
  screenshots.push(file);
}
try {
  for (const [width, height] of [
    [1536, 1024],
    [1920, 720],
    [1440, 640],
    [1024, 768],
    [390, 844],
    [320, 568],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    const badResponses = [];
    const posts = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) badResponses.push(response.url());
    });
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto(new URL("landing-superhuman/", base).href);
    await page.waitForSelector('[data-superhuman-mounted="true"]');
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((image) => {
        image.loading = "eager";
      });
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) => image.decode().catch(() => {})),
      );
    });
    await capture(page, `hero-${width}x${height}`);
    const referenceStyle = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const style = (selector) =>
        getComputedStyle(document.querySelector(selector));
      return {
        pageWidth: root.getPropertyValue("--page-max-width").trim(),
        spacing16: root.getPropertyValue("--spacing-16").trim(),
        radiusCards: root.getPropertyValue("--radius-cards").trim(),
        primary: style(".sh-hero-actions .f-button").backgroundColor,
        buttonRadius: style(".sh-hero-actions .f-button").borderRadius,
        excerptRadius: style(".sh-excerpt").borderRadius,
        excerptPadding: style(".sh-excerpt").paddingTop,
        resultPadding: style(".sh-result").paddingTop,
        resultSurface: style(".sh-result").backgroundColor,
        resultDecoration: getComputedStyle(
          document.querySelector(".sh-result"),
          "::before",
        ).content,
        chineseTracking: style(".sh-position").letterSpacing,
        blur: style(".f-header").backdropFilter,
        utilityColor: style(".text-ink-charcoal").color,
        sourceLinked: Boolean(
          document.querySelector('link[href="reference-system.css"]'),
        ),
      };
    });
    check(
      referenceStyle.sourceLinked,
      `${width}: compiled Tailwind reference stylesheet loaded`,
    );
    check(
      referenceStyle.pageWidth === "1200px",
      `${width}: original 1200px content token used`,
    );
    check(
      referenceStyle.spacing16 === "16px",
      `${width}: original spacing scale used`,
    );
    check(
      referenceStyle.radiusCards === "16px",
      `${width}: original named card radius used`,
    );
    check(
      referenceStyle.primary === "rgb(6, 25, 58)",
      `${width}: CTA maps to bo rather than maroon`,
    );
    check(
      referenceStyle.buttonRadius === "16px",
      `${width}: original primary action shape used`,
    );
    check(
      referenceStyle.excerptRadius === "16px",
      `${width}: original floating excerpt shape used`,
    );
    check(
      referenceStyle.excerptPadding === "16px" &&
        referenceStyle.resultPadding === "16px",
      `${width}: original card padding used`,
    );
    check(
      referenceStyle.resultSurface === "rgb(255, 255, 255)",
      `${width}: result uses reference white paper surface`,
    );
    check(
      referenceStyle.resultDecoration === "none",
      `${width}: obsolete rotated decoration does not obscure result`,
    );
    check(
      referenceStyle.chineseTracking === "normal" ||
        referenceStyle.chineseTracking === "0px",
      `${width}: approved zero Chinese tracking retained`,
    );
    check(
      referenceStyle.blur === "blur(12px)",
      `${width}: reference header material used`,
    );
    check(
      referenceStyle.utilityColor === "rgb(6, 25, 58)",
      `${width}: actual Tailwind utility applies brand token`,
    );
    check(
      await page
        .locator(".sh-hero-photo")
        .evaluate(
          (image) => image.naturalWidth === 1600 && image.naturalHeight === 901,
        ),
      `${width}: new AI-human hero loaded`,
    );
    check(
      await page
        .locator(".sh-about-photo img")
        .evaluate(
          (image) => image.naturalWidth === 1600 && image.naturalHeight === 800,
        ),
      `${width}: new AI-human conversation loaded`,
    );
    check(
      await page
        .locator(".f-brand img")
        .first()
        .evaluate((image) => image.complete && image.naturalWidth > 0),
      `${width}: original bo vector loaded`,
    );
    check(
      await page
        .locator(".sh-brand-title")
        .evaluate((node) =>
          getComputedStyle(node).fontFamily.includes("Inter Variable"),
        ),
      `${width}: brand uses approved English font`,
    );
    check(
      await page
        .locator(".sh-position")
        .evaluate((node) =>
          getComputedStyle(node).fontFamily.includes("Noto Sans SC"),
        ),
      `${width}: Chinese uses self-hosted CJK font`,
    );
    const data = await page.evaluate(() => window.FinesseHomepageData);
    const research = await page.evaluate(() => window.FinesseResearchStoryData);
    const workTabs = page
      .getByRole("tablist", { name: "猎头业务场景" })
      .getByRole("tab");
    const panel = page.locator("#sh-work-panel");
    const heights = [];
    for (const [index, work] of data.works.entries()) {
      await workTabs.nth(index).click();
      await page.waitForTimeout(360);
      const text = await panel.textContent();
      check(
        [
          work.headline,
          work.description,
          work.descriptionDetail,
          work.context,
          work.subject,
          ...work.rows.flatMap((row) =>
            [row.title, row.label, row.copy, row.followUp].filter(Boolean),
          ),
        ].every((copy) => text.includes(copy)),
        `${width}: ${work.label} complete original narrative and results`,
      );
      check(
        (await panel.getAttribute("aria-labelledby")) ===
          (await workTabs.nth(index).getAttribute("id")),
        `${width}: ${work.label} associated accessible panel`,
      );
      check(
        (await page.locator('.sh-work-tabs [aria-selected="true"]').count()) ===
          1,
        `${width}: one current business tab`,
      );
      heights.push((await panel.boundingBox()).height);
      await page.locator("[data-evidence]").click();
      const dialog = page.getByRole("dialog");
      const evidenceText = await dialog.textContent();
      check(
        [
          ...work.evidence.flatMap((item) => [item.title, item.copy]),
          ...work.questions,
        ].every((copy) => evidenceText.includes(copy)),
        `${width}: ${work.label} evidence and unresolved questions retained`,
      );
      await page.keyboard.press("Escape");
      check(
        await page
          .locator("[data-evidence]")
          .evaluate((node) => node === document.activeElement),
        `${width}: dialog Escape restores trigger focus`,
      );
    }
    check(
      Math.max(...heights) - Math.min(...heights) <= 2,
      `${width}: all business panels have stable height`,
    );
    await workTabs.first().focus();
    for (const [key, index] of [
      ["ArrowRight", 1],
      ["End", 3],
      ["Home", 0],
    ]) {
      await page.keyboard.press(key);
      check(
        (await workTabs.nth(index).getAttribute("aria-selected")) === "true",
        `${width}: ${key} business keyboard selection`,
      );
    }
    for (const [index, phase] of research.phases.entries()) {
      const carousel = page.locator(".sh-research-carousel");
      if (index > 0) await carousel.locator("[data-carousel-next]").click();
      await page.waitForTimeout(700);
      const chapter = carousel.locator(".p-slide.is-current");
      check(
        (await chapter.textContent()).includes(phase.copy),
        `${width}: research chapter ${index + 1} full copy`,
      );
      check(
        (await chapter.locator(".sh-research-case").textContent()).includes(
          phase.detail,
        ),
        `${width}: research chapter ${index + 1} corresponding source view`,
      );
      check(
        (await carousel.locator('.p-slide[aria-hidden="false"]').count()) ===
          1 && (await carousel.locator(".p-slide[inert]").count()) === 2,
        `${width}: only current research slide is accessible`,
      );
      const contrast = await chapter.evaluate((slide) => {
        const context = document.createElement("canvas").getContext("2d");
        const rgba = (color) => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return [...context.getImageData(0, 0, 1, 1).data];
        };
        const composite = (foreground, background) => {
          const alpha = foreground[3] / 255;
          return foreground
            .slice(0, 3)
            .map(
              (channel, index) =>
                channel * alpha + background[index] * (1 - alpha),
            );
        };
        const luminance = (color) =>
          color.slice(0, 3).reduce((sum, channel, index) => {
            const value = channel / 255;
            const linear =
              value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4;
            return sum + linear * [0.2126, 0.7152, 0.0722][index];
          }, 0);
        const ratio = (first, second) => {
          const values = [luminance(first), luminance(second)].sort(
            (a, b) => b - a,
          );
          return (values[0] + 0.05) / (values[1] + 0.05);
        };
        const section = slide.closest(".sh-research");
        const sectionColor = rgba(getComputedStyle(section).backgroundColor);
        const panel = slide.querySelector(".sh-research-case");
        const panelColor = composite(
          rgba(getComputedStyle(panel).backgroundColor),
          sectionColor,
        );
        const text = [...slide.querySelectorAll("h3, h4, p, dt, dd, li")].map(
          (node) => {
            const background = panel.contains(node) ? panelColor : sectionColor;
            return {
              text: node.textContent.trim(),
              ratio: ratio(
                composite(rgba(getComputedStyle(node).color), background),
                background,
              ),
            };
          },
        );
        return {
          surfaceRatio: ratio(sectionColor, panelColor),
          previousSurfaceRatio: ratio(
            sectionColor,
            rgba(
              getComputedStyle(section).getPropertyValue(
                "--surface-parchment-canvas",
              ),
            ),
          ),
          text,
        };
      });
      researchContrast.push({ width, phase: index, ...contrast });
      check(
        contrast.surfaceRatio < 2 &&
          contrast.surfaceRatio < contrast.previousSurfaceRatio / 3,
        `${width}: research ${index + 1} surface contrast is softened, not a bright white block`,
      );
      check(
        contrast.text.every((item) => item.ratio >= 4.5),
        `${width}: research ${index + 1} body, metadata and status text meet 4.5:1`,
      );
      if ([1536, 390, 320].includes(width))
        await capture(
          page,
          `research-slide-${index}-${width}`,
          page.locator("#research"),
        );
    }
    const ledger = page.locator(".sh-ledger");
    const ledgerTabs = page
      .getByRole("tablist", { name: "资产支持的研究目标" })
      .getByRole("tab");
    for (const [index, route] of data.assetNetwork.paths.entries()) {
      await ledgerTabs.nth(index).click();
      await page.waitForTimeout(360);
      const story = ledger.locator(".sh-ledger-story-content:visible");
      const text = await story.textContent();
      check(
        [route.title, route.copy, route.check].every((copy) =>
          text.includes(copy),
        ),
        `${width}: ${route.label} narrative and verification boundaries retained`,
      );
      check(
        (await ledger.locator(".sh-ledger-sheet--active").count()) ===
          route.nodes.length,
        `${width}: ${route.label} emphasizes correct assets`,
      );
      check(
        (await ledger.locator(".sh-ledger-wire-group--active").count()) ===
          route.edges.length,
        `${width}: ${route.label} emphasizes correct relations`,
      );
      check(
        (await ledger.locator("[data-sh-ledger-node]:visible").count()) === 5,
        `${width}: all five assets remain visible`,
      );
      check(
        await ledger
          .locator(".sh-ledger-wire")
          .evaluateAll((nodes) =>
            nodes.every((node) =>
              /^M [\d.]+ [\d.]+ C/.test(node.getAttribute("d")),
            ),
          ),
        `${width}: all six relation curves use measured coordinates`,
      );
      const geometry = await ledger
        .locator(".sh-ledger-map")
        .evaluate((map) => {
          const bounds = map.getBoundingClientRect();
          const boxes = [...map.querySelectorAll("[data-sh-ledger-node]")].map(
            (node) => node.getBoundingClientRect(),
          );
          const overlap = (a, b) =>
            a.left < b.right - 1 &&
            a.right > b.left + 1 &&
            a.top < b.bottom - 1 &&
            a.bottom > b.top + 1;
          const labels = [
            ...map.querySelectorAll("[data-sh-ledger-label]"),
          ].filter((node) => getComputedStyle(node).display !== "none");
          const context = document.createElement("canvas").getContext("2d");
          const canvas = getComputedStyle(
            map.closest(".sh-memory"),
          ).backgroundColor;
          const color = (background, foreground) => {
            context.clearRect(0, 0, 1, 1);
            for (const value of [canvas, background, foreground].filter(
              Boolean,
            )) {
              context.fillStyle = value;
              context.fillRect(0, 0, 1, 1);
            }
            return [...context.getImageData(0, 0, 1, 1).data];
          };
          const luminance = (pixels) =>
            pixels.slice(0, 3).reduce((sum, channel, i) => {
              const value = channel / 255;
              return (
                sum +
                (value <= 0.04045
                  ? value / 12.92
                  : ((value + 0.055) / 1.055) ** 2.4) *
                  [0.2126, 0.7152, 0.0722][i]
              );
            }, 0);
          const textContrast = [
            ...map.querySelectorAll("h4, p, .sh-ledger-sheet-status"),
            ...labels,
          ].map((node) => {
            const style = getComputedStyle(node);
            const background = getComputedStyle(
              node.closest(".sh-ledger-sheet") || node,
            ).backgroundColor;
            const values = [
              luminance(color(background)),
              luminance(color(background, style.color)),
            ].sort((a, b) => b - a);
            return (values[0] + 0.05) / (values[1] + 0.05);
          });
          return {
            minTextContrast: Math.min(...textContrast),
            labels: labels.map((node) => node.dataset.shLedgerLabel),
            labelFit: labels.every((node) => {
              const box = node.getBoundingClientRect();
              return (
                box.left >= bounds.left - 1 &&
                box.right <= bounds.right + 1 &&
                !boxes.some((asset) => overlap(box, asset))
              );
            }),
            labelOverlap: labels.some((first, i) =>
              labels
                .slice(i + 1)
                .some((second) =>
                  overlap(
                    first.getBoundingClientRect(),
                    second.getBoundingClientRect(),
                  ),
                ),
            ),
            clearCurves: [...map.querySelectorAll(".sh-ledger-wire")].every(
              (wire) => {
                const length = wire.getTotalLength();
                return Array.from({ length: 101 }, (_, i) =>
                  wire.getPointAtLength((length * i) / 100),
                ).every(
                  (point) =>
                    !boxes.some(
                      (box) =>
                        point.x + bounds.left > box.left + 1 &&
                        point.x + bounds.left < box.right - 1 &&
                        point.y + bounds.top > box.top + 1 &&
                        point.y + bounds.top < box.bottom - 1,
                    ),
                );
              },
            ),
            noPaperStack: [...map.querySelectorAll(".sh-ledger-sheet")].every(
              (node) =>
                ["::before", "::after"].every((pseudo) =>
                  ["none", "normal"].includes(
                    getComputedStyle(node, pseudo).content,
                  ),
                ),
            ),
          };
        });
      ledgerMeasurements.push({ width, path: route.id, ...geometry });
      check(
        geometry.minTextContrast >= 4.5,
        `${width}: ${route.label} asset text and relation labels meet 4.5:1`,
      );
      check(
        geometry.labelFit && !geometry.labelOverlap,
        `${width}: ${route.label} relation labels fit without node or label overlap`,
      );
      check(
        geometry.clearCurves,
        `${width}: ${route.label} curves avoid all five asset interiors`,
      );
      check(
        geometry.noPaperStack,
        `${width}: ${route.label} artificial document backing removed`,
      );
      check(
        geometry.labels.length === (width <= 390 ? route.edges.length : 6),
        `${width}: ${route.label} desktop labels or mobile active legend readable`,
      );
      if ([1536, 390, 320].includes(width))
        await capture(
          page,
          `memory-path-${route.id}-${width}`,
          page.locator("#memory"),
        );
    }
    await ledger.locator("[data-sh-ledger-open-relations]:visible").click();
    check(
      (await ledger.locator(".sh-ledger-relations").getAttribute("open")) !==
        null,
      `${width}: all-relations control opens readable list`,
    );
    const relations = await ledger
      .locator(".sh-ledger-relations")
      .textContent();
    check(
      data.assetNetwork.edges.every(
        (edge) =>
          relations.includes(edge.label) && relations.includes(edge.note),
      ),
      `${width}: all six relation labels and boundaries retained`,
    );
    await ledger.locator(".sh-ledger-relations summary").click();
    await ledgerTabs.first().click();
    const form = page.getByRole("form", { name: "HunterBuddy 试用申请" });
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.locator('[aria-invalid="true"]').count()) === 8,
      `${width}: seven required fields and consent validation`,
    );
    await form.locator('[name="phone"]').fill("not-a-phone");
    await form.locator('[name="email"]').fill("wrong-email");
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.locator("#f-trial-phone-error").textContent()).includes(
        "有效的联系电话",
      ) &&
        (await form.locator("#f-trial-email-error").textContent()).includes(
          "有效的邮箱",
        ),
      `${width}: phone and email format checks`,
    );
    for (const [name, value] of [
      ["name", "本地验收"],
      ["company", "测试资料，不提交"],
      ["phone", "+1 202-555-0123"],
      ["email", "qa@example.invalid"],
    ])
      await form.locator(`[name="${name}"]`).fill(value);
    for (const [name, option] of [
      ["role", "猎头顾问"],
      ["activePositions", "6-10"],
      ["industry", "互联网与软件"],
    ]) {
      await form.locator(`#f-trial-${name}`).click();
      await page
        .getByRole("listbox", {
          name: {
            role: "职位",
            activePositions: "同时招聘的岗位数",
            industry: "行业",
          }[name],
        })
        .getByRole("option", { name: option, exact: true })
        .click();
      await page.keyboard.press("Escape");
      check(
        (await form.locator(`[name="${name}"]`).inputValue()) === option,
        `${width}: ${name} custom dropdown keeps actual selection`,
      );
    }
    await form.locator('[name="acknowledgedPurpose"]').check();
    await form.getByRole("button", { name: "提交试用申请" }).click();
    check(
      (await form.locator('[aria-invalid="true"]').count()) === 0,
      `${width}: valid local-only form values accepted`,
    );
    check(
      (await form.locator("[data-form-status]").textContent()).includes(
        "服务暂时不可用",
      ) && posts.length === 0,
      `${width}: disabled API never sends personal data`,
    );
    await form.evaluate((node) => node.reset());
    await page.locator("[data-form-status]").evaluate((node) => {
      node.textContent = "";
    });
    const menu = page.locator("[data-menu-toggle]");
    if (await menu.isVisible()) {
      await menu.click();
      check(
        (await menu.getAttribute("aria-expanded")) === "true" &&
          (await page.locator(".f-nav").isVisible()),
        `${width}: mobile navigation opens`,
      );
      await page.keyboard.press("Escape");
      check(
        (await menu.getAttribute("aria-expanded")) === "false",
        `${width}: mobile navigation closes with Escape`,
      );
    }
    check(
      (await page.locator(".sh-footer-group a").count()) === 0,
      `${width}: footer menu has no fabricated destinations`,
    );
    const footerText = await page.locator("#footer").textContent();
    check(
      [
        "www.boseeksi.com",
        "北京铂寻智能科技有限公司",
        "ICP 备案号：待补充",
        "公安备案号：待补充",
      ].every((copy) => footerText.includes(copy)),
      `${width}: domain and company/legal placeholders retained`,
    );
    if ([1536, 390].includes(width)) {
      await page.reload();
      await page.waitForSelector('[data-superhuman-mounted="true"]');
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((image) => {
          image.loading = "eager";
        });
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((image) => image.decode().catch(() => {})),
        );
      });
      for (const id of [
        "work",
        "research",
        "memory",
        "about",
        "apply",
        "footer",
      ])
        await capture(page, `${id}-${width}`, page.locator(`#${id}`));
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await workTabs.nth(1).click();
    await ledgerTabs.nth(1).click();
    check(
      await page.evaluate(() =>
        document
          .getAnimations()
          .every((animation) => animation.playState !== "running"),
      ),
      `${width}: reduced motion has no running reveal animations`,
    );
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}: no horizontal page overflow`,
    );
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,h4,p,button,summary,input")]
        .filter(
          (node) =>
            node.checkVisibility() &&
            !(
              node.matches(".f-icon-button") &&
              node.closest(".sh-research-carousel")
            ) &&
            !node.closest('[aria-hidden="true"],[inert]') &&
            node.clientWidth > 0 &&
            node.scrollWidth > node.clientWidth + 2,
        )
        .map(
          (node) =>
            `${node.tagName}.${node.className}: ${node.textContent.slice(0, 48)}`,
        ),
    );
    check(
      clipped.length === 0,
      `${width}: no clipped text (${clipped.join("; ")})`,
    );
    const clippedIcons = await page
      .locator(".sh-research-carousel .f-icon-button")
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => {
            const button = node.getBoundingClientRect();
            const icon = node.querySelector("svg").getBoundingClientRect();
            return (
              icon.left < button.left - 1 ||
              icon.right > button.right + 1 ||
              icon.top < button.top - 1 ||
              icon.bottom > button.bottom + 1
            );
          }).length,
      );
    check(
      clippedIcons === 0,
      `${width}: arrow glyph fits its click target; tooltip may extend outside button`,
    );
    check(
      errors.length === 0 && badResponses.length === 0,
      `${width}: no browser errors or failed resources (${[...errors, ...badResponses].join("; ")})`,
    );
    await page.close();
  }
  for (const fallback of ["no-js", "blocked-ledger", "blocked-carousel"]) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      javaScriptEnabled: fallback !== "no-js",
    });
    if (fallback === "blocked-ledger")
      await page.route("**/landing-superhuman/shared-ledger.js", (route) =>
        route.abort(),
      );
    if (fallback === "blocked-carousel")
      await page.route("**/landing/research-chapters.js", (route) =>
        route.abort(),
      );
    await page.goto(new URL("landing-superhuman/", base).href);
    check(
      (await page.locator("#homepage.sh-static").count()) === 1,
      `${fallback}: readable static fallback remains`,
    );
    check(
      (await page.locator(".sh-static-work").count()) === 4,
      `${fallback}: all four original business narratives available`,
    );
    check(
      (await page.locator(".sh-research-slide:visible").count()) === 3,
      `${fallback}: all three research chapters and details remain readable`,
    );
    check(
      (await page.locator(".sh-ledger-relations li").count()) === 6,
      `${fallback}: all six relationships remain accessible`,
    );
    check(
      (await page.locator(".sh-ledger-story-content:visible").count()) === 3,
      `${fallback}: all three asset pathways remain readable`,
    );
    check(
      (await page.locator("#apply").textContent()).includes("开放试用"),
      `${fallback}: Coming Soon application information remains`,
    );
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${fallback}: no horizontal overflow`,
    );
    await capture(page, `fallback-${fallback}`, page.locator("#work"));
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.goto(new URL("homepages/", base).href);
  const links = page.locator(".h-option");
  check(
    (await links.count()) === 5,
    "catalog: five alternatives, original four retained",
  );
  const popupEvent = page.waitForEvent("popup");
  await links.nth(4).click();
  const popup = await popupEvent;
  await popup.waitForSelector('[data-superhuman-mounted="true"]');
  check(
    popup.url().includes("/landing-superhuman/") &&
      (await popup.evaluate(() => opener === null)),
    "catalog: fifth alternative opens new tab with no opener",
  );
  await capture(page, "catalog");
  await popup.close();
  await page.close();
  const protectedFiles = JSON.parse(
    await fs.readFile(
      "tests/fixtures/homepages/superhuman-protected.json",
      "utf8",
    ),
  );
  const extension = JSON.parse(
    await fs.readFile(
      "tests/fixtures/homepages/research-carousel-shared-change.json",
      "utf8",
    ),
  );
  for (const [file, hash] of Object.entries(protectedFiles)) {
    if (extension[file])
      check(
        extension[file].before === hash,
        `shared opt-in extension keeps original baseline: ${file}`,
      );
    check(
      createHash("sha256")
        .update(await fs.readFile(file))
        .digest("hex") === (extension[file]?.after || hash),
      extension[file]
        ? `reviewed shared opt-in extension: ${file}`
        : `protected: ${file} unchanged`,
    );
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  path.join(out, "report.json"),
  JSON.stringify(
    {
      checks: checks.length,
      failures,
      screenshots,
      researchContrast,
      ledgerMeasurements,
      results: checks,
    },
    null,
    2,
  ),
);
console.log(
  `${failures.length ? "FAIL" : "PASS"} ${checks.length} checks; ${screenshots.length} screenshots; ${failures.length} failures`,
);
if (failures.length) console.log(failures.join("\n"));
assert.equal(failures.length, 0, "Resolve recorded fifth-homepage failures");
