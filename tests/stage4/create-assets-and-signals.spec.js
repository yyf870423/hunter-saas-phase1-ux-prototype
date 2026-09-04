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
    .getByRole("button", { name: "新建", exact: true })
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

test("洞察中心分类完整且主从区域没有横向溢出", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/signals");
  for (const label of [
    "全部",
    "待你决定",
    "观察中",
    "核验中",
    "已处理",
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

test("周期性任务支持查看、运行、暂停和自然语言调整", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/tasks/periodic");
  await expect(page.getByRole("heading", { name: "周期性任务" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "每周发现具身智能创业公司与招聘机会" }),
  ).toBeVisible();
  await expect(page.getByText("任务要求")).toBeVisible();
  await page.getByRole("button", { name: "立即运行" }).click();
  await expect(page).toHaveURL(/#\/tasks\/periodic\?view=runs&run=/);
  await expect(page.getByText("当前执行进度", { exact: true })).toBeVisible();
  await expect(
    page
      .locator(".s2-periodic-list > button")
      .filter({ hasText: "运行不到 1 分钟" }),
  ).toHaveCount(1);
  await page.goto("#/tasks/periodic");
  await page.getByRole("button", { name: "调整任务" }).click();
  await expect(
    page.getByRole("heading", { name: "调整周期性任务" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("周期性任务在移动端可以查看配置与运行记录", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/tasks/periodic");
  await page
    .locator(".s2-periodic-list > button")
    .filter({ hasText: "每 3 天更新招聘中岗位的人岗匹配" })
    .click();
  await expect(
    page.getByRole("heading", { name: "每 3 天更新招聘中岗位的人岗匹配" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回周期任务" }).click();
  await page.getByRole("tab", { name: /运行记录/ }).click();
  await page
    .locator(".s2-periodic-list > button")
    .filter({ hasText: "等待用户" })
    .click();
  await expect(
    page.getByRole("complementary").getByText("两位候选人的身份合并结论冲突"),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回运行记录" }).click();
  await expect(page.locator(".s2-periodic-list > button")).toHaveCount(5);

  await page.goto("#/home");
  await page.getByRole("button", { name: "打开通知" }).click();
  await page
    .getByRole("button", { name: /两位候选人的身份合并结论冲突/ })
    .click();
  await expect(
    page.getByText("2 项身份冲突需要一起确认", { exact: true }),
  ).toBeVisible();
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
