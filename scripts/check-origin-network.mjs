import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const base = process.env.ORIGIN_PREVIEW_URL || "http://127.0.0.1:5190";
const out = path.resolve(
  process.env.ORIGIN_ARTIFACT_DIR ||
    "artifacts/landing-origin-network-20261010/acceptance-c",
);
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
function check(value, message) {
  assert.ok(value, message);
  results.push(message);
}

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(
    `${base}/landing-origin/?v=20261010-network-c#f-memory-title`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const network = page.locator(".o-asset-network");
  const tabs = page.getByRole("tablist", { name: "资产支持的研究目标" });
  const contrast = await network.evaluate((root) => {
    const luminance = (color) => {
      const rgb = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
      if (!rgb) throw new Error(`Unexpected opaque color: ${color}`);
      const values = rgb.slice(1).map((value) => {
        const channel = Number(value) / 255;
        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    return [...root.querySelectorAll("[data-node] h3, [data-node] p")].map(
      (text) => {
        const foreground = luminance(getComputedStyle(text).color);
        const background = luminance(
          getComputedStyle(text.closest("[data-node]")).backgroundColor,
        );
        return {
          text: text.textContent,
          ratio:
            (Math.max(foreground, background) + 0.05) /
            (Math.min(foreground, background) + 0.05),
        };
      },
    );
  });
  check(
    contrast.every((item) => item.ratio >= 4.5),
    "All three entity surface levels retain readable text contrast",
  );

  await tabs.getByRole("tab", { name: "找人", exact: true }).click();
  await page.waitForTimeout(100);
  check(
    (await network.getAttribute("data-start-node")) === "job",
    "People mode starts from the job",
  );
  check(
    (await network.locator(".o-network-trace").count()) === 2,
    "Only selected relationships receive a one-shot trace",
  );
  const first = await network.locator(".o-network-mask").evaluateAll((nodes) =>
    nodes.map((node) => ({
      opacity: getComputedStyle(node).opacity,
      offset: getComputedStyle(node).strokeDashoffset,
    })),
  );
  check(
    first.length === 2 && first.every((mask) => mask.opacity === "1"),
    "Trace masks are visible rather than inheriting unrelated-wire dimming",
  );
  check(
    await network
      .locator(".o-network-trace.is-pending")
      .evaluate((node) => getComputedStyle(node).strokeDasharray !== "none"),
    "The pending match stays dashed during the trace",
  );
  await network
    .locator(".f-network-map")
    .screenshot({ path: path.join(out, "path-motion-1.png") });
  await page.waitForTimeout(100);
  const second = await network
    .locator(".o-network-mask")
    .evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).strokeDashoffset),
    );
  check(
    second.length === first.length &&
      second.some((value, index) => value !== first[index].offset),
    "The path mask advances between actual rendered frames",
  );
  await network
    .locator(".f-network-map")
    .screenshot({ path: path.join(out, "path-motion-2.png") });

  await tabs.getByRole("tab", { name: "找岗位", exact: true }).click();
  await tabs.getByRole("tab", { name: "找信息", exact: true }).click();
  check(
    (await network.getAttribute("data-start-node")) === "research" &&
      (await network.locator(".o-network-traces").count()) === 1 &&
      (await network.locator(".o-network-trace").count()) === 3,
    "Rapid switches replace rather than accumulate old traces",
  );
  await page.waitForTimeout(800);
  check(
    (await network.locator(".o-network-traces").count()) === 0,
    "Tracing ends without looping or leftover layers",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  check(
    await network.evaluate((root) => {
      const map = root.querySelector(".f-network-map").getBoundingClientRect();
      const view = root.querySelector(".f-network-wires").viewBox.baseVal;
      return (
        Math.abs(view.width - map.width) < 1 &&
        [...root.querySelectorAll("[data-wire]")].every(
          (wire) => !wire.getAttribute("d").includes(" C "),
        )
      );
    }),
    "Resizing preserves the simplified geometry and measured viewBox",
  );
  await network.screenshot({
    path: path.join(out, "network-resized-mobile.png"),
  });

  await tabs.getByRole("tab", { name: "找人", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(80);
  check(
    (await network.locator(".o-network-trace").count()) === 0 &&
      (await network.getAttribute("data-start-node")) === "job",
    "Enabling reduced motion cancels tracing without losing the selected origin",
  );
  check(
    errors.length === 0,
    `No errors across switching and resizing: ${errors.join(", ")}`,
  );
  await page.close();

  const fallback = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const fallbackErrors = [];
  fallback.on("pageerror", (error) => fallbackErrors.push(error.message));
  await fallback.route("**/shared-origin-network.js*", (route) =>
    route.abort(),
  );
  await fallback.goto(`${base}/landing-origin/#f-memory-title`);
  await fallback.evaluate(() => document.fonts.ready);
  const original = fallback.locator(".f-asset-network");
  await fallback.getByRole("tab", { name: "找岗位", exact: true }).click();
  check(
    (await original.locator("[data-node]").count()) === 5 &&
      (await original.locator("[data-edge]").count()) === 6 &&
      (await original.locator(".is-start").count()) === 0 &&
      (await original.getAttribute("data-active-path")) === "jobs",
    "An unavailable enhancement preserves all assets, relations and original controls",
  );
  check(
    fallbackErrors.length === 0,
    "Enhancement failure does not break the original page",
  );
  await original.screenshot({
    path: path.join(out, "network-enhancement-fallback.png"),
  });
  await fallback.close();
  const report = {
    status: "passed",
    checks: results.length,
    results,
    contrast,
  };
  await fs.writeFile(
    path.join(out, "motion-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      status: report.status,
      checks: report.checks,
      minimumTextContrast: Math.min(...contrast.map((item) => item.ratio)),
    }),
  );
} finally {
  await browser.close();
}
