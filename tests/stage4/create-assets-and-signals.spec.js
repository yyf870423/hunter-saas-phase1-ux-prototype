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
    .getByRole("button", { name: "新建任务" })
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
    page.getByRole("button", { name: "知识图谱 创建可持续维护的关系图谱" }),
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
  const signalTop = (await page.locator(".s2-signal-shell").boundingBox()).y;
  expect(panes[1]).toBeGreaterThan(panes[0]);
  await page.goto("#/signals?view=periodic");
  const periodicPanes = await page
    .locator(".s2-signal-shell > *")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().width),
    );
  const periodicTop = (await page.locator(".s2-signal-shell").boundingBox()).y;
  expect(periodicPanes[0]).toBeCloseTo(panes[0], 0);
  expect(periodicPanes[1]).toBeCloseTo(panes[1], 0);
  expect(periodicTop).toBeCloseTo(signalTop, 0);
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("周期扫描支持查看、运行、暂停和编辑配置", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/signals?view=periodic");
  await expect(page.getByRole("heading", { name: "信号中心" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "具身智能新公司与融资动态" }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "扫描配置" })).toBeVisible();
  await page.getByRole("tab", { name: /执行记录/ }).click();
  await expect(page.getByText("核验 73 家公司")).toBeVisible();
  await page.getByRole("tab", { name: /产生的信号/ }).click();
  await expect(page.getByText("维拓智能完成数千万元天使轮融资")).toBeVisible();
  await page.getByRole("button", { name: "立即运行" }).click();
  await expect(page.getByRole("button", { name: "正在运行" })).toBeDisabled();
  await expect(
    page.getByText("本轮扫描完成，产生 2 条待处理信号"),
  ).toBeVisible();
  await page.getByRole("button", { name: "暂停", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "继续", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "编辑" }).click();
  await expect(
    page.getByRole("heading", { name: "编辑周期扫描" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("周期扫描在移动端可以进入详情并返回", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/signals");
  const signalTop = (await page.locator(".s2-signal-shell").boundingBox()).y;
  await page.goto("#/signals?view=periodic");
  const periodicTop = (await page.locator(".s2-signal-shell").boundingBox()).y;
  expect(periodicTop).toBeCloseTo(signalTop, 0);
  await page
    .locator(".s2-scan-list > button")
    .filter({ hasText: "AI 创业公司核心岗位招聘" })
    .click();
  await expect(
    page.getByRole("heading", { name: "AI 创业公司核心岗位招聘" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回周期扫描列表" }).click();
  await expect(page.getByPlaceholder("搜索周期扫描名称或范围")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("移动端新建页面和资产类型选择没有横向溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/contacts/new");
  await expectNoHorizontalOverflow(page);
  await page.goto("#/opportunities/new");
  await expectNoHorizontalOverflow(page);
});

test("任务详情左侧搜索框保持在侧栏范围内", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/tasks/position-vla");
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
