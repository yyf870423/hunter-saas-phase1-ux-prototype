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
    ["任务与故障", "tasks", "任务与故障"],
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

test("订阅权益调整必须说明原因并生成反馈", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/subscriptions");
  await page
    .getByRole("button", { name: /深蓝猎头工作室/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "调整权益" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "确认调整" })).toBeDisabled();
  await dialog
    .getByRole("textbox", { name: "调整原因*" })
    .fill("补偿系统重试产生的重复任务额度。");
  await dialog.getByRole("button", { name: "确认调整" }).click();
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
  await page.getByRole("button", { name: "任务状态", exact: true }).click();
  await page
    .locator(".s4-select-panel")
    .getByRole("button", { name: "失败", exact: true })
    .click();
  await expect(page.getByText("TASK-260824-019").first()).toBeVisible();
  await expect(page.getByText("TASK-260824-011")).toHaveCount(0);
  await page.getByRole("button", { name: "清空任务状态" }).click();
  await expect(page.getByText("TASK-260824-011").first()).toBeVisible();
  await assertNoConsoleErrors();
});

test("任务详情区分可安全恢复和不可恢复", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/tasks/TASK-260824-019");
  await expect(page.getByText("可以执行受控恢复")).toBeVisible();
  await page.getByRole("button", { name: "执行安全恢复" }).click();
  const dialog = page.getByRole("dialog", { name: "执行安全恢复" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/不会修改任务输入/)).toBeVisible();
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

test("能力配置验证失败时保留当前有效版本", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/ops/capabilities?tab=configuration");
  await page
    .getByRole("button", { name: /大模型/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "编辑能力配置" });
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
  await expect(page.getByText("支持记录不包含业务正文")).toBeVisible();
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
