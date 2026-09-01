import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const output = "artifacts/stage4-candidate-relations-matching";

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

test("候选人详情展示同公司与同部门关系并支持筛选", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/candidates/candidate-linhao?tab=relations");

  await expect(
    page.getByRole("heading", { name: "同公司与同部门候选人" }),
  ).toBeVisible();
  await expect(page.getByText("赵星羽", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("当前同部门", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("任职重叠", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: /学术成果/ }).click();
  await expect(
    page.getByRole("columnheader", { name: "论文或专利名称" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /合作人/ }).click();
  await expect(
    page.getByRole("columnheader", { name: "合作论文或专利" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /任职关系/ }).click();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/candidate-employment-relations-desktop.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: /关系类型/ }).click();
  await page
    .getByRole("button", { name: "曾经同公司", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("button", { name: "曾经同公司", exact: true }).last(),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await assertNoConsoleErrors();
});

test("候选人上传可选择写入后匹配全部或指定岗位", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/candidates/new?mode=upload&match=selected");

  await expect(
    page.getByText("写入后立即人岗匹配", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("radio", { name: /指定岗位/ })).toBeChecked();
  const positionPicker = page.getByRole("button", { name: /选择岗位 · 1/ });
  await expect(positionPicker).toBeVisible();
  await positionPicker.click();
  await expect(
    page.getByRole("button", { name: /具身智能 VLA 算法负责人/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/candidate-upload-selected-positions-desktop.png`,
    fullPage: true,
  });

  await page.getByRole("radio", { name: /全部招聘中岗位/ }).click();
  await expect(page.getByText(/8 个招聘中岗位/)).toBeVisible();
  await assertNoConsoleErrors();
});

test("候选人身份确认说明匹配发生在完成写入之后", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(
    "#/reviews/identity/candidate-linhao?from=upload&match=selected&positions=1",
  );

  await expect(
    page.getByText("完成合并后立即人岗匹配", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/将使用资料版本 v7/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/candidate-identity-post-match-desktop.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});

test("岗位新建与批量导入使用相同的写入后匹配规则", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("#/positions/new?match=all");
  await expect(
    page.getByText("创建后立即人岗匹配", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("匹配系统内可用候选人")).toBeVisible();
  await page.screenshot({
    path: `${output}/position-create-post-match-desktop.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: /AI 解析 JD/ }).click();
  const jdInput = page.getByPlaceholder(/粘贴完整 JD/);
  await expect(jdInput).toBeVisible();
  await expect(
    page.getByRole("button", { name: "添加文件或截图" }),
  ).toBeVisible();
  await page.screenshot({
    path: `${output}/position-ai-create-input-desktop.png`,
    fullPage: true,
  });
  await jdInput.fill(
    "招聘具身智能 VLA 算法负责人，需要真机部署经验和团队管理能力。",
  );
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page).toHaveURL(/tasks\/task-create-position/);
  await expect(
    page.getByText(/招聘具身智能 VLA 算法负责人，需要真机部署经验/),
  ).toBeVisible();

  await page.goto("#/data/imports?type=positions&match=all");
  const dialog = page.getByRole("dialog", { name: "导入业务数据" });
  await expect(
    dialog.getByRole("checkbox", { name: "创建后立即人岗匹配" }),
  ).toBeChecked();
  await expect(dialog.getByText("匹配系统内可用候选人")).toBeVisible();
  await assertNoConsoleErrors();
});

test("Agent 入库对话在写入前询问是否立即匹配", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("#/tasks/position-vla?state=candidate-ingestion");
  await expect(
    page.getByText(/候选人写入后是否立即进行人岗匹配/),
  ).toBeVisible();
  await expect(
    page.getByText("写入并匹配全部招聘中岗位", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `${output}/agent-candidate-ingestion-decision.png`,
    fullPage: true,
  });

  await page.goto("#/tasks/task-create-position?state=position-ingestion");
  await expect(page.getByText(/创建岗位后是否立即进行人岗匹配/)).toBeVisible();
  await expect(
    page.getByText("创建岗位并立即人岗匹配", { exact: true }),
  ).toBeVisible();
  await assertNoConsoleErrors();
});

test("岗位匹配运行态可从创建结果直接进入", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/positions/position-vla?tab=matching&state=running");

  await expect(
    page.getByRole("dialog", { name: "人岗匹配正在运行" }),
  ).toBeVisible();
  await expect(page.getByText(/正在处理第 75 位候选人/)).toBeVisible();
  await assertNoConsoleErrors();
});

test("新增关系与匹配选项在手机端无横向溢出", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });

  for (const url of [
    "#/candidates/candidate-linhao?tab=relations",
    "#/candidates/new?mode=upload&match=selected",
    "#/positions/new?match=all",
  ]) {
    await page.goto(url);
    await expectNoHorizontalOverflow(page);
  }

  await page.goto("#/candidates/new?mode=upload&match=selected");
  await page.screenshot({
    path: `${output}/candidate-upload-selected-positions-mobile.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});
