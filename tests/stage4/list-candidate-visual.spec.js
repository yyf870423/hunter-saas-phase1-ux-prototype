import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const output = "artifacts/stage4-acceptance";

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

const listPages = [
  ["tasks", "支线任务"],
  ["signals", "信号中心"],
  ["candidates", "候选人"],
  ["positions", "岗位"],
  ["companies", "公司"],
  ["contacts", "联系人"],
  ["opportunities", "招聘机会"],
  ["mappings", "人才版图"],
  ["papers", "论文"],
  ["patents", "专利"],
  ["data/imports", "数据导入"],
  ["data/exports", "数据导出"],
  ["recycle-bin", "回收站"],
];

test("全部列表与数据管理入口使用统一设计系统", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, name] of listPages) {
    await page.goto(`#/${route}`);
    await expect(
      page.getByRole("heading", { level: 1, name, exact: true }).first(),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/list-${route.replaceAll("/", "-")}.png`,
      fullPage: true,
    });
  }
  await assertNoConsoleErrors();
});

const candidatePages = [
  ["candidates/new", "candidate-create-manual"],
  ["candidates/new?mode=upload", "candidate-create-upload"],
  ["candidates/candidate-linhao", "candidate-profile"],
  ["candidates/candidate-linhao?tab=experience", "candidate-experience"],
  ["candidates/candidate-linhao?tab=files", "candidate-files"],
  ["candidates/candidate-linhao?tab=timeline", "candidate-timeline"],
  ["candidates/candidate-linhao?tab=matching", "candidate-matching"],
  ["candidates/candidate-linhao?tab=relations", "candidate-relations"],
  ["reviews/identity/candidate-linhao", "candidate-identity-review"],
  ["reviews/fields/candidate-linhao", "candidate-field-review"],
  ["sources/candidate-linhao", "candidate-source-evidence"],
  ["candidates/candidate-linhao?state=limited", "candidate-limited"],
  ["candidates/candidate-linhao?state=error", "candidate-error"],
];

test("候选人创建、详情、审核与异常状态视觉完整", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, file] of candidatePages) {
    await page.goto(`#/${route}`);
    await expect(page.locator("main.s1-main")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/${file}.png`,
      fullPage: true,
    });
  }
  await assertNoConsoleErrors();
});
