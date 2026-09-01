import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const output = "artifacts/stage4-interview-contact-path";

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

test("岗位资料显示招聘难度和有顺序的找人建议", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/positions/position-vla?tab=profile&profile=analysis");

  await expect(
    page.getByRole("heading", { name: "招聘难度与找人建议" }),
  ).toBeVisible();
  await expect(page.getByText("高难度", { exact: true })).toBeVisible();
  await expect(page.getByText("8.4 / 10")).toBeVisible();
  await expect(page.getByText("先匹配 Hunter 已有候选人")).toBeVisible();
  await expect(page.getByText("由猎头在招聘网站定向筛选")).toBeVisible();
  await expect(page.getByText("摸排目标公司与关键人才")).toBeVisible();
  await expect(page.getByRole("button", { name: "编辑建议" })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "建议挖猎的公司" }),
  ).toBeVisible();
  await expect(page.getByText("灵跃科技", { exact: true })).toBeVisible();
  await expect(page.getByText("矩阵动力", { exact: true })).toBeVisible();
  await expect(page.getByText("股权解禁", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/position-recruitment-strategy-desktop.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: "重新分析" }).first().click();
  const setup = page.getByRole("dialog", { name: "AI 解析当前岗位" });
  await expect(setup).toContainText("招聘难度、找人步骤、建议挖猎公司");
  await setup.getByRole("button", { name: "取消" }).click();
  await page.getByText("灵跃科技", { exact: true }).click();
  const evidence = page.getByRole("dialog", { name: "建议挖猎依据" });
  await expect(evidence).toContainText("机器人算法中台");
  await expect(evidence).toContainText("公司组织架构更新");
  await evidence.getByRole("button", { name: "关闭" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/position-recruitment-strategy-mobile.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});

test("岗位沟通记录直接整理为面试指南并保留历史版本", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/positions/position-vla?tab=interview");

  await expect(page.getByRole("tab", { name: "面试资料" })).toBeVisible();
  await expect(page.getByRole("tab", { name: /沟通记录/ })).toBeVisible();
  await expect(page.getByText("新增机器人数据质量追问")).toBeVisible();
  await expect(page.getByText("负责人终面关注跨团队推动")).toBeVisible();
  await expect(page.getByText("待收录建议")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/position-records-desktop.png`,
    fullPage: true,
  });

  await page.getByRole("tab", { name: "面试指南" }).click();
  await expect(
    page.getByText("具身智能VLA算法负责人-面试指南-v3.md"),
  ).toBeVisible();
  await page.getByRole("button", { name: "整理与更新" }).click();
  const setup = page.getByRole("dialog", { name: "整理面试指南" });
  await expect(setup).toContainText("直接生成最新版本");
  await setup.getByRole("button", { name: "开始整理" }).click();
  await expect(page.getByText("正在整理面试指南 v4")).toBeVisible();
  await expect(page.getByText("面试指南已更新为 v4")).toBeVisible({
    timeout: 5000,
  });
  await expect(
    page.getByText("具身智能VLA算法负责人-面试指南-v4.md"),
  ).toBeVisible();
  await expect(page.getByText(/等待审核/)).toHaveCount(0);
  await page.screenshot({
    path: `${output}/position-guide-current-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "历史版本" }).click();
  const history = page.getByRole("dialog", {
    name: "面试指南历史版本",
  });
  await expect(history).toContainText("面试指南-v4.md");
  await expect(history).toContainText("面试指南-v3.md");
  await assertNoConsoleErrors();
});

test("已有手机号的联系人仍可创建或更新联系路径", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/contacts/contact-chenyu?tab=contact-path");

  await expect(page.getByRole("tab", { name: "联系路径" })).toBeVisible();
  await expect(page.getByText("无论是否已有手机号或邮箱")).toBeVisible();
  await expect(page.getByText("已核实手机号").first()).toBeVisible();
  await expect(page.getByText("陈雨", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "更新联系路径" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "寻找联系路径" }).click();
  await expect(
    page.getByRole("dialog", { name: "更新联系路径" }),
  ).toBeVisible();
  await page
    .getByRole("dialog", { name: "更新联系路径" })
    .getByRole("button", {
      name: "取消",
    })
    .click();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/contact-path-ready-desktop.png`,
    fullPage: true,
  });

  await page.goto("#/contacts/contact-chenyu?tab=contact-path&state=empty");
  await expect(page.getByText("尚未创建联系路径")).toBeVisible();
  await page
    .getByRole("button", { name: "寻找联系路径", exact: true })
    .last()
    .click();
  const setup = page.getByRole("dialog", { name: "寻找联系路径" });
  await expect(setup).toContainText("用自然语言说明优先关系");
  await setup.getByRole("button", { name: "开始寻找" }).click();
  await expect(page.getByText("正在寻找联系人路径")).toBeVisible();
  await expect(page.getByText("读取联系人和招聘机会")).toBeVisible();
  await expect(page.getByText("核实直接联系方式")).toBeVisible();
  await expect(page.getByText("查找可执行引荐关系")).toBeVisible();
  await expect(page.getByText("生成联系路径图")).toBeVisible();
  await expect(page.getByText("联系路径已生成")).toBeVisible({ timeout: 5000 });
  await assertNoConsoleErrors();
});

test("联系人联系路径提供可直接验收的运行中和失败恢复状态", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/contacts/contact-chenyu?tab=contact-path&state=running");
  await expect(page.getByText("正在寻找联系人路径")).toBeVisible();
  await expect(page.getByText("运行中", { exact: true })).toBeVisible();
  await expect(page.getByText("查找可执行引荐关系")).toBeVisible();

  await page.goto("#/contacts/contact-chenyu?tab=contact-path&state=error");
  await expect(page.getByText("联系路径寻找失败")).toBeVisible();
  await page.getByRole("button", { name: "重新寻找" }).click();
  await expect(page.getByText("正在寻找联系人路径")).toBeVisible();
  await assertNoConsoleErrors();
});

test("招聘机会触发联系路径，但完整结果保存在联系人资产", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/opportunities/opportunity-xinglan");

  await expect(page.getByText("招聘机会只引用联系人及路径摘要")).toBeVisible();
  await expect(page.getByText("陈雨 · 招聘负责人")).toBeVisible();
  await page.getByRole("button", { name: "寻找联系路径" }).click();
  await expect(page).toHaveURL(
    /contacts\/contact-chenyu\?tab=contact-path&action=find/,
  );
  await expect(
    page.getByRole("dialog", { name: "更新联系路径" }),
  ).toBeVisible();
  await assertNoConsoleErrors();
});

test("面试资料与联系路径在手机端可操作且无横向溢出", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });

  for (const url of [
    "#/positions/position-vla?tab=interview",
    "#/positions/position-vla?tab=interview&section=guide",
    "#/contacts/contact-chenyu?tab=contact-path",
    "#/opportunities/opportunity-xinglan",
  ]) {
    await page.goto(url);
    await expectNoHorizontalOverflow(page);
  }

  await page.goto("#/contacts/contact-chenyu?tab=contact-path");
  await page.screenshot({
    path: `${output}/contact-path-mobile.png`,
    fullPage: true,
  });
  await assertNoConsoleErrors();
});
