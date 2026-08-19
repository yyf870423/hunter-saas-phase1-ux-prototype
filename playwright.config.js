import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/stage1",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: "http://127.0.0.1:4173/hunter-saas-phase1-ux-prototype/",
    locale: "zh-CN",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173/hunter-saas-phase1-ux-prototype/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
