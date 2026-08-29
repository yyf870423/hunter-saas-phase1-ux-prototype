import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("右上角手动新建资产先选择类型再进入对应页面", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/home");
  await page
    .locator(".s1-topbar")
    .getByRole("button", { name: "新建工作" })
    .click();
  await page.getByRole("button", { name: /手动新建资产/ }).click();
  await expect(
    page.getByRole("heading", { name: "选择资产类型" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "公司 建立公司资料与招聘关联" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "联系人 记录联系人身份与公司关系" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "招聘机会 沉淀已经确认的招聘需求" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "岗位 录入岗位资料与招聘要求" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "候选人 录入候选人或上传简历" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "人才版图 建立人才摸排目标和范围" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "联系人 记录联系人身份与公司关系" })
    .click();
  await expect(page).toHaveURL(/#\/contacts\/new$/);
  await expect(page.getByRole("heading", { name: "新建联系人" })).toBeVisible();
  await assertNoConsoleErrors();
});

test("联系人新建页面使用独立表单并阻止信息不足的写入", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/contacts/new");
  await page.getByPlaceholder("例如：陈雨").fill("周明");
  await page.getByRole("button", { name: "创建联系人" }).click();
  await expect(page.getByText("身份信息不足")).toBeVisible();
  await expect(page).toHaveURL(/#\/contacts\/new$/);
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("招聘机会新建页面展示完整字段和必填校验", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/opportunities/new");
  await page.getByRole("button", { name: "创建招聘机会" }).click();
  await expect(page.getByText("请输入机会名称")).toBeVisible();
  await expect(page.getByText("请选择所属公司")).toBeVisible();
  await expect(page.getByText("请输入招聘需求摘要")).toBeVisible();
  await expect(page.getByText("请说明需求确认依据")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("信号中心分类完整且主从区域没有横向溢出", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/signals");
  for (const label of [
    "全部",
    "待处理",
    "观察中",
    "已转化",
    "已忽略",
    "已失效",
  ]) {
    await expect(
      page.getByRole("tab", { name: new RegExp(label) }),
    ).toBeVisible();
  }
  const panes = await page
    .locator(".s2-signal-shell > *")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().width),
    );
  expect(panes[1]).toBeGreaterThan(panes[0]);
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("移动端新建页面和资产类型选择没有横向溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/contacts/new");
  await expectNoHorizontalOverflow(page);
  await page.goto("#/opportunities/new");
  await expectNoHorizontalOverflow(page);
});

test("工作详情左侧搜索框保持在侧栏范围内", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/works/position-vla");
  const sidebarBox = await page.locator(".s2-history").boundingBox();
  const searchBox = await page
    .locator(".s2-history > .s1-search-field")
    .boundingBox();
  expect(sidebarBox).not.toBeNull();
  expect(searchBox).not.toBeNull();
  expect(searchBox.x).toBeGreaterThanOrEqual(sidebarBox.x);
  expect(searchBox.x + searchBox.width).toBeLessThanOrEqual(
    sidebarBox.x + sidebarBox.width,
  );
  await expectNoHorizontalOverflow(page);
});
