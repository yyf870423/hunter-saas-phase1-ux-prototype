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
  ["works", "工作"],
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
  ["candidates/candidate-linhao?state=loading", "candidate-loading"],
  [
    "candidates/candidate-linhao?state=identity-conflict",
    "candidate-identity-conflict",
  ],
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

test("公司、联系人和招聘机会详情遵循分区编辑与完整岗位交互", async ({
  page,
}) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("#/companies/company-xinglan");
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/company-detail-section-editing.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "编辑基本资料" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/company-basic-editor-aliases.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "取消" }).click();

  await page.goto("#/companies/new");
  await page.getByRole("button", { name: /公司调研/ }).click();
  await page.screenshot({
    path: `${output}/company-create-agent-composer.png`,
    fullPage: true,
  });

  await page.goto("#/contacts/contact-chenyu");
  await page.screenshot({
    path: `${output}/contact-detail-section-editing.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "编辑联系方式" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/contact-profile-editor-compact.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "取消" }).click();
  await page.getByRole("button", { name: "编辑公司关系" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/contact-relation-editor-compact.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "取消" }).click();
  await page.goto("#/contacts/contact-chenyu?tab=timeline");
  await page.screenshot({
    path: `${output}/contact-timeline-crud.png`,
    fullPage: true,
  });

  await page.goto("#/opportunities/opportunity-xinglan");
  await page.screenshot({
    path: `${output}/opportunity-detail-section-editing.png`,
    fullPage: true,
  });
  await page.goto("#/opportunities/opportunity-xinglan?tab=directions");
  await page.getByRole("button", { name: "形成岗位" }).first().click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/opportunity-create-position-complete-jd.png`,
    fullPage: true,
  });
  await page.getByRole("tab", { name: "关联已有岗位" }).click();
  await page.locator(".s4-existing-position-flow .s4-select > button").click();
  await page.getByRole("button", { name: "运动控制算法专家" }).click();
  await page.screenshot({
    path: `${output}/opportunity-link-existing-position.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});

test("公共时间选择器展开态符合统一设计语言", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("#/candidates/candidate-linhao?tab=experience");
  await page.getByRole("button", { name: "添加经历" }).click();
  await page
    .getByRole("button", { name: /选择起止时间：2022\.03 - 至今/ })
    .click();
  await page.waitForTimeout(180);
  const rangeFields = page.locator(".s4-date-range-steps > button");
  await expect(rangeFields).toHaveCount(2);
  const startBox = await rangeFields.nth(0).boundingBox();
  const endBox = await rangeFields.nth(1).boundingBox();
  expect(startBox).not.toBeNull();
  expect(endBox).not.toBeNull();
  expect(Math.abs(startBox.y - endBox.y)).toBeLessThanOrEqual(1);
  expect(endBox.x).toBeGreaterThan(startBox.x + startBox.width);
  await page.screenshot({
    path: `${output}/date-picker-month-range.png`,
    fullPage: true,
  });

  await page.goto("#/contacts/contact-chenyu?tab=timeline");
  await page.getByRole("button", { name: "添加沟通记录" }).click();
  await page
    .getByRole("button", { name: /选择发生时间：2026-08-21 14:30/ })
    .click();
  await page.waitForTimeout(180);
  await page.screenshot({
    path: `${output}/date-picker-datetime.png`,
    fullPage: true,
  });

  await page.goto("#/papers");
  await page.getByRole("button", { name: "年份", exact: true }).click();
  await page.waitForTimeout(180);
  await page.screenshot({
    path: `${output}/date-picker-years.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});

test("人才版图创建、目标、关系证据、冲突和相关业务交互完整", async ({
  page,
}) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("#/mappings/new");
  await page.screenshot({
    path: `${output}/mapping-create-composer.png`,
    fullPage: true,
  });

  await page.goto("#/mappings/mapping-embodied?tab=overview");
  await page.getByRole("button", { name: "添加目标" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/mapping-target-create.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "取消" }).click();
  await page
    .getByRole("button", {
      name: "查看目标：核实王奕的当前单位与身份",
    })
    .click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/mapping-target-detail.png`,
    fullPage: true,
  });

  await page.goto("#/mappings/mapping-embodied?tab=organization");
  await page.getByRole("button", { name: /查看证据：岗位页面/ }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/mapping-evidence-preview.png`,
    fullPage: true,
  });

  await page.goto("#/mappings/mapping-embodied?tab=people");
  await page.getByRole("tab", { name: "人物关系" }).click();
  await page
    .locator(".s3-relationship-node")
    .filter({ hasText: "王奕" })
    .click();
  await page.screenshot({
    path: `${output}/mapping-candidate-node.png`,
    fullPage: true,
  });

  await page.goto("#/mappings/mapping-embodied?tab=updates");
  await page.getByRole("button", { name: /王奕身份冲突/ }).click();
  await page.screenshot({
    path: `${output}/mapping-conflict-review.png`,
    fullPage: true,
  });

  await page.goto("#/mappings/mapping-embodied?tab=business");
  await page.getByRole("button", { name: "编辑关联" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/mapping-business-editor.png`,
    fullPage: true,
  });

  await page.goto("#/data/exports");
  await page.getByRole("button", { name: "新建导出" }).click();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/data-export-compact-range.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});

test("论文和专利人物信息在大量作者下保持紧凑可读", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("#/papers/paper-vla-survey");
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/paper-detail-authors.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Yifan Jiang", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Yifan Jiang · 作者身份审核" }),
  ).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({
    path: `${output}/paper-author-identity-modal.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.getByRole("button", { name: /还有 15 位作者/ }).click();
  await expect(page.getByRole("dialog", { name: "其余作者" })).toBeVisible();
  await page.screenshot({
    path: `${output}/paper-detail-authors-popover.png`,
    fullPage: true,
  });

  await page.goto("#/patents/patent-manipulation");
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/patent-detail-inventors.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});
