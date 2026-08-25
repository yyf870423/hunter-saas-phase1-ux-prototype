import { defineConfig } from "@playwright/test";

const previewPort = process.env.PLAYWRIGHT_PORT || "4173";
const prototypeUrl = `http://127.0.0.1:${previewPort}/hunter-saas-phase1-ux-prototype/`;

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: prototypeUrl,
    locale: "zh-CN",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${previewPort}`,
    url: prototypeUrl,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
