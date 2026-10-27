import { expect } from "@playwright/test";

export function trackConsoleErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return async () => expect(errors, errors.join("\n")).toEqual([]);
}

export async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
}

// Resolve a theme token (e.g. "--s1-nav") to the computed rgb() string inside the workspace, so colour
// checks follow docs/brand-style-unification.md instead of hard-coding one palette.
export async function themeColor(page, token, property = "background-color") {
  return page.evaluate(
    ([name, prop]) => {
      const host = document.querySelector(".s1-app") || document.body;
      const probe = document.createElement("span");
      probe.style.setProperty(prop, `var(${name})`);
      host.appendChild(probe);
      const value = getComputedStyle(probe).getPropertyValue(prop);
      probe.remove();
      return value;
    },
    [token, property],
  );
}

// The file name the page asked for when it started a download (the anchor's download attribute). Some
// headless Chromium builds report non-ASCII names as "download", so tests read the name the page set.
export async function recordDownloadNames(page) {
  await page.addInitScript(() => {
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function recordDownload() {
      if (this.hasAttribute("download")) window.__hunterDownloadName = this.download;
      return click.call(this);
    };
  });
}

export async function downloadName(page, download) {
  const suggested = download.suggestedFilename();
  if (suggested !== "download") return suggested;
  return page.evaluate(() => window.__hunterDownloadName || "download");
}
