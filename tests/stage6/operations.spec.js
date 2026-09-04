import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("运营端六个模块可通过独立导航访问", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/review/operations");
  await expect(
    page.getByRole("heading", { name: "运营端 UX 原型验收" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "正常状态" }).click();
  await expect(page).toHaveURL(/#\/ops\/overview/);
  for (const [name, route, heading] of [
    ["运营概况", "overview", "运营概况"],
    ["用户与工作空间", "users-workspaces", "用户与工作空间"],
    ["订阅与额度", "subscriptions", "订阅与额度"],
    ["运行与故障", "tasks", "运行与故障"],
    ["系统能力", "capabilities", "系统能力"],
    ["支持与审计", "support", "支持与审计"],
  ]) {
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(new RegExp(`#\\/ops\\/${route}`));
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
  await assertNoConsoleErrors();
});

test("工作空间详情、用户详情与试用审批保持数据联动", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/users-workspaces");
  await page
    .getByRole("button", { name: /深蓝猎头工作室/ })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "深蓝猎头工作室" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("dialog", { name: "深蓝猎头工作室" })
      .getByText("WS-20260518-0142"),
  ).toBeVisible();
  await expect(page.getByText("运营健康概览")).toBeVisible();
  await expect(page.getByText("需要运营关注")).toBeVisible();
  await page.getByRole("button", { name: "关闭" }).click();

  await page.getByRole("tab", { name: /用户账号/ }).click();
  await page.getByRole("button", { name: /沈岚/ }).first().click();
  await expect(page.getByRole("dialog", { name: "沈岚" })).toBeVisible();
  await page.getByRole("button", { name: "关闭" }).click();

  await page.getByRole("tab", { name: /试用申请/ }).click();
  await page
    .getByRole("button", { name: /宋知遥/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "处理试用申请" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("TRIAL-260824-017")).toBeVisible();
  await dialog.getByRole("button", { name: /暂缓处理/ }).click();
  await expect(dialog.getByRole("button", { name: "确认暂缓" })).toBeDisabled();
  await dialog
    .getByRole("textbox")
    .fill("等待申请人确认团队试用规模，下周三再次联系。");
  await dialog.getByRole("button", { name: "确认暂缓" }).click();
  await expect(page.getByText("申请已暂缓")).toBeVisible();
  await assertNoConsoleErrors();
});

test("拒绝试用可选择发送标准结果说明", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/users-workspaces?tab=trials");
  await page
    .getByRole("button", { name: /宋知遥/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "处理试用申请" });
  await dialog.getByRole("button", { name: /拒绝申请/ }).click();
  await expect(dialog.getByText(/感谢你申请 Hunter 试用/)).toBeVisible();
  await dialog
    .getByRole("checkbox", { name: "向申请人发送标准结果说明" })
    .click();
  await expect(dialog.getByText(/感谢你申请 Hunter 试用/)).toHaveCount(0);
  await assertNoConsoleErrors();
});

test("订阅详情区分正常订阅与例外权益调整", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/subscriptions");
  await page
    .getByRole("button", { name: /深蓝猎头工作室/ })
    .first()
    .click();
  const subscription = page.getByRole("dialog", {
    name: "深蓝猎头工作室",
  });
  await expect(subscription.getByText("当前订阅")).toBeVisible();
  await expect(subscription.getByText("例外权益调整")).toBeVisible();
  await subscription.getByRole("button", { name: "发起权益调整" }).click();
  const dialog = page.getByRole("dialog", { name: "发起权益调整" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "确认并生效" }),
  ).toBeDisabled();
  await dialog
    .getByRole("textbox", { name: "调整原因*" })
    .fill("补偿系统重试产生的重复 Agent 用量。");
  await dialog.getByRole("button", { name: "确认并生效" }).click();
  await expect(page.getByText("权益调整已生效并生成审计记录")).toBeVisible();
  await assertNoConsoleErrors();
});

test("运营筛选会真实改变列表且可以单独清空", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/users-workspaces");
  await page.getByRole("button", { name: "订阅状态", exact: true }).click();
  await page.getByRole("button", { name: "支付异常", exact: true }).click();
  await expect(page.getByText("远望招聘咨询").first()).toBeVisible();
  await expect(page.getByText("深蓝猎头工作室")).toHaveCount(0);
  await page.getByRole("button", { name: "清空订阅状态" }).click();
  await expect(page.getByText("深蓝猎头工作室").first()).toBeVisible();

  await page.goto("#/ops/tasks");
  await page.getByRole("button", { name: "运行状态", exact: true }).click();
  await page
    .locator(".s4-select-panel")
    .getByRole("button", { name: "失败", exact: true })
    .click();
  await expect(page.getByText("TASK-260824-019").first()).toBeVisible();
  await expect(page.getByText("TASK-260824-011")).toHaveCount(0);
  await page.getByRole("button", { name: "清空运行状态" }).click();
  await expect(page.getByText("TASK-260824-011").first()).toBeVisible();
  await page.getByRole("button", { name: "运行类型", exact: true }).click();
  await page
    .locator(".s4-select-panel")
    .getByRole("button", { name: "系统运行", exact: true })
    .click();
  await expect(page.getByText("邮箱回复检查").first()).toBeVisible();
  await expect(page.getByText("TASK-260824-019")).toHaveCount(0);
  await assertNoConsoleErrors();
});

test("运行质量按四类运行展示且排除等待耗时", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/tasks?tab=quality");
  await expect(page.getByText("运行耗时不包含等待时间")).toBeVisible();
  for (const type of [
    "普通任务运行",
    "周期任务运行",
    "资产 AI 运行",
    "系统运行",
  ]) {
    await expect(page.getByText(type, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText("中位等待耗时", { exact: true })).toBeVisible();
  await assertNoConsoleErrors();
});

test("运行详情区分可安全恢复和不可恢复", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/tasks/TASK-260824-019");
  await expect(page.getByText("具身智能 VLA 人才摸排")).toHaveCount(0);
  await expect(page.getByText("WORK-260824-006")).toBeVisible();
  await expect(page.getByText("普通任务运行", { exact: true })).toBeVisible();
  await expect(page.getByText("制定/调整计划", { exact: true })).toBeVisible();
  await expect(page.getByText("计划调整", { exact: true })).toBeVisible();
  await expect(
    page
      .locator(".ops-section")
      .filter({ hasText: "计划与写入摘要" })
      .getByText("2 次", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("所属主线", { exact: true })).toHaveCount(0);
  await expect(page.getByText("可以执行受控恢复")).toBeVisible();
  await page.getByRole("button", { name: "执行安全恢复" }).click();
  const dialog = page.getByRole("dialog", { name: "执行安全恢复" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/不会修改用户输入/)).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /重新分配执行资源/ }),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "确认执行" })).toBeDisabled();
  await dialog
    .getByRole("textbox", { name: "操作原因*" })
    .fill("诊断包确认上游限流已解除，从检查点继续不会重复写入。");
  await dialog.getByRole("button", { name: "确认执行" }).click();
  await expect(page.getByText("恢复操作已提交并记录审计")).toBeVisible();

  await page.goto("#/ops/tasks/TASK-260824-018");
  await expect(page.getByText("当前无法证明恢复操作安全")).toBeVisible();
  await expect(page.getByRole("button", { name: "执行安全恢复" })).toHaveCount(
    0,
  );
  await assertNoConsoleErrors();
});

test("企业模型网关可管理后端与路由，其他能力验证失败时保留生效版本", async ({
  page,
}) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/capabilities?tab=configuration");
  await expect(page.getByText("模型后端与流量调度")).toBeVisible();
  await expect(page.getByText("14 / 15")).toBeVisible();
  await page.getByRole("button", { name: "新增模型后端" }).click();
  const backendDialog = page.getByRole("dialog", { name: "新增模型后端" });
  await expect(backendDialog.getByText("后端资源")).toBeVisible();
  await backendDialog
    .getByRole("textbox", { name: "资源池名称*" })
    .fill("自建推理资源池");
  await backendDialog
    .getByRole("textbox", { name: "Base URL*" })
    .fill("https://model.example.com/v1");
  await backendDialog
    .getByRole("textbox", { name: "可用模型*" })
    .fill("hunter-research-v1");
  await backendDialog
    .getByRole("textbox", { name: "新增密钥*" })
    .fill("sk-test-primary\nsk-test-secondary");
  await backendDialog.getByRole("button", { name: "验证配置" }).click();
  await expect(backendDialog.getByText("配置验证通过")).toBeVisible();
  await backendDialog.getByRole("button", { name: "确认保存并生效" }).click();
  await expect(page.getByText("模型后端已加入资源池")).toBeVisible();

  await page.getByRole("tab", { name: /任务模型分配/ }).click();
  await page
    .getByRole("button", { name: /深度调研/ })
    .first()
    .click();
  const routeDialog = page.getByRole("dialog", {
    name: "编辑任务模型分配",
  });
  await expect(routeDialog).toBeVisible();
  await expect(routeDialog.getByText("备用资源池顺序")).toBeVisible();
  const fallbackItems = routeDialog.getByRole("listitem");
  await fallbackItems
    .first()
    .dragTo(routeDialog.locator(".ops-sortable-drop-zone").last());
  await expect(fallbackItems.first()).toContainText("OpenAI 复杂推理池");
  await expect(fallbackItems.last()).toContainText("百炼高速资源池");
  await page.getByRole("button", { name: "取消" }).click();

  await page.getByRole("tab", { name: /数据源配置/ }).click();
  await page
    .getByRole("button", { name: /公开网络搜索/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "编辑能力配置" });
  const routeItems = dialog.getByRole("listitem");
  await expect(routeItems).toHaveCount(3);
  await routeItems
    .first()
    .dragTo(dialog.locator(".ops-sortable-drop-zone").last());
  await expect(routeItems.first()).toContainText("Serper.dev 备用路由");
  await expect(routeItems.last()).toContainText("百度搜索主路由");
  await dialog.getByPlaceholder("输入新密钥").fill("sk-test-redacted");
  await expect(dialog.getByPlaceholder("输入新密钥")).toHaveValue(
    "sk-test-redacted",
  );
  await dialog.getByRole("button", { name: "填入失败示例" }).click();
  await dialog.getByRole("button", { name: "运行验证" }).click();
  await expect(dialog.getByText("配置验证失败")).toBeVisible();
  await expect(dialog.getByText(/当前有效版本没有变化/)).toBeVisible();
  await dialog.getByRole("button", { name: "取消" }).click();

  await page.getByRole("button", { name: "打开运营账户菜单" }).click();
  await page.getByRole("menuitem", { name: /运营人员演示/ }).click();
  await expect(page.getByText("当前角色无权执行此操作")).toBeVisible();
  await assertNoConsoleErrors();
});

test("概况自定义时间与能力异常事件均可操作", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/overview");
  await page.getByRole("button", { name: "近 7 天", exact: true }).click();
  await page.getByRole("button", { name: "自定义", exact: true }).click();
  await expect(page.getByRole("button", { name: /自定义时间/ })).toBeVisible();

  await page.goto("#/ops/capabilities?capability=cap-search");
  const drawer = page.getByRole("dialog", { name: /公开网络搜索/ });
  await expect(
    drawer.getByRole("button", { name: "创建安全事件" }),
  ).toBeVisible();
  await drawer.getByRole("button", { name: "创建安全事件" }).click();
  await expect(page.getByText("安全事件已创建并进入调查状态")).toBeVisible();
  await assertNoConsoleErrors();
});

test("支持、诊断包、审计和安全事件可切换查看", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/support");
  await page
    .getByRole("button", { name: /SUP-20260824-017/ })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "SUP-20260824-017" }),
  ).toBeVisible();
  await expect(page.getByText("问题处理清单")).toBeVisible();
  await expect(page.getByText("用户反馈摘要")).toBeVisible();
  await page.getByRole("button", { name: "标记已解决" }).click();
  await expect(page.getByText("支持记录已标记为已解决")).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  for (const [tab, text] of [
    ["诊断包", "DIAG-260824-031"],
    ["操作审计", "AUD-260824-1092"],
    ["安全事件", "SEC-260824-006"],
  ]) {
    await page.getByRole("tab", { name: new RegExp(tab) }).click();
    await expect(page.getByText(text).first()).toBeVisible();
  }
  await page.getByRole("tab", { name: /诊断包/ }).click();
  await page
    .getByRole("button", { name: /DIAG-260824-031/ })
    .first()
    .click();
  await expect(page.getByText("文件完整性：匹配")).toBeVisible();
  await expect(page.getByText("可用诊断信息")).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.getByRole("tab", { name: /安全事件/ }).click();
  await page
    .getByRole("button", { name: /SEC-260824-006/ })
    .first()
    .click();
  await expect(page.getByRole("button", { name: "关闭事件" })).toBeVisible();
  await page.getByRole("button", { name: "关闭事件" }).click();
  await expect(page.getByText("安全事件已关闭并保留处理记录")).toBeVisible();
  await assertNoConsoleErrors();
});

test("运营端全局搜索能够下钻到准确对象", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/overview");
  await page.getByRole("button", { name: /搜索工作空间/ }).click();
  const dialog = page.getByRole("dialog", { name: "运营搜索" });
  await dialog.getByRole("textbox").fill("TASK-260824-019");
  await dialog.getByRole("button", { name: /TASK-260824-019/ }).click();
  await expect(page).toHaveURL(/#\/ops\/tasks\/TASK-260824-019/);
  await assertNoConsoleErrors();
});
