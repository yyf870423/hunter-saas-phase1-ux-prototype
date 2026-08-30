import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const states = [
  ["home-loading", "/home?state=loading"],
  ["home-empty", "/home?state=empty"],
  ["home-error", "/home?state=error"],
  ["home-limited", "/home?state=limited"],
  ["task-resume-batch", "/tasks/position-vla?state=resume-batch"],
  ["workstream-merge-conflict", "/tasks/position-vla?state=merge-conflict"],
  ["task-stream-error", "/tasks/position-vla?state=stream-error"],
  ["workstream-client-no-contact", "/tasks/client-xinglan?state=no-contact"],
  ["workstream-career-no-position", "/tasks/career-linhao?state=no-position"],
  ["task-mapping-gaps", "/tasks/mapping-embodied?state=gaps"],
  ["new-clarify", "/new?state=clarify"],
  ["new-limited", "/new?state=limited"],
  ["candidates-loading", "/candidates?state=loading"],
  ["candidates-empty", "/candidates?state=empty"],
  ["candidates-error", "/candidates?state=error"],
  ["candidates-limited", "/candidates?state=limited"],
  ["candidate-detail-loading", "/candidates/candidate-linhao?state=loading"],
  ["candidate-detail-error", "/candidates/candidate-linhao?state=error"],
  ["candidate-detail-limited", "/candidates/candidate-linhao?state=limited"],
  [
    "candidate-identity-conflict",
    "/candidates/candidate-linhao?state=identity-conflict",
  ],
  [
    "position-matching-running",
    "/positions/position-vla?tab=matching&state=running",
  ],
  [
    "position-matching-rejected",
    "/positions/position-vla?tab=matching&state=rejected",
  ],
  ["companies-empty", "/companies?state=empty"],
  ["companies-error", "/companies?state=error"],
  ["company-draft", "/companies/company-xinglan?state=draft"],
  ["mappings-empty", "/mappings?state=empty"],
  ["mappings-error", "/mappings?state=error"],
  ["papers-empty", "/papers?state=empty"],
  ["papers-error", "/papers?state=error"],
  ["paper-identity-review", "/papers/paper-vla-survey?state=identity-review"],
  ["patents-empty", "/patents?state=empty"],
  ["patents-error", "/patents?state=error"],
  ["data-import-error", "/data/imports?state=error"],
];

test("详细设计关键状态生成可重复验收截图", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const [name, route] of states) {
    await page.goto(`#${route}`);
    await expect(page.locator("main")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `artifacts/detailed-design-states/${name}.png`,
      fullPage: true,
    });
  }

  await assertNoConsoleErrors();
});
