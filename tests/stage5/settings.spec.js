import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("桌面账户菜单中的设置与用量可以进入对应设置页", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/home");
  await page.getByRole("button", { name: "打开用户菜单" }).click();
  await page.getByRole("menuitem", { name: /设置/ }).click();
  await expect(page).toHaveURL(/#\/settings\/profile$/);

  await page.getByRole("button", { name: "打开用户菜单" }).click();
  await page.getByRole("menuitem", { name: /查看 Credits 用量/ }).click();
  await page.getByRole("button", { name: "查看订阅与用量" }).click();
  await expect(page).toHaveURL(/#\/settings\/subscription$/);
  const usage = page.locator(".s5-usage-card");
  await expect(usage.locator(".s5-usage-breakdown > span").filter({ hasText: "本月套餐 Credits" }).locator("em")).toHaveText("64%");
  await expect(usage.locator(".s5-metric-donut b")).toHaveText("64%");
  await expect(usage).not.toContainText("次");
  await expect(page.getByText("公开网络搜索", { exact: true })).toHaveCount(0);
  await expect(usage).toContainText("8.2 / 30 GB");
  await expect(usage).toContainText("12,000");
  await page.screenshot({ path: "artifacts/opportunity-lifecycle/spacing/quick-subscription-after.png", animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await usage.screenshot({ path: "artifacts/opportunity-lifecycle/spacing/quick-subscription-mobile.png", animations: "disabled" });
  await assertNoConsoleErrors();
});

test("个人资料支持分区编辑、校验和安全操作", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/settings/profile");
  await page.getByRole("button", { name: "更换头像" }).click();
  await expect(page.getByRole("button", { name: "保存头像" })).toBeDisabled();
  await page.locator("#s5-avatar-file").setInputFiles({
    name: "unsupported-avatar.gif",
    mimeType: "image/gif",
    buffer: Buffer.from("not-a-supported-avatar"),
  });
  await expect(page.getByText("请选择 JPG、PNG 或 WebP 图片")).toBeVisible();
  await page.locator("#s5-avatar-file").setInputFiles({
    name: "shenlan-avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByAltText("头像裁剪预览")).toBeVisible();
  await page.getByLabel("缩放头像").fill("130");
  await page.getByRole("button", { name: "取消" }).last().click();
  await expect(page.locator(".s5-avatar-editor > i")).toHaveText("SL");

  await page.getByRole("button", { name: "更换头像" }).click();
  await page.locator("#s5-avatar-file").setInputFiles({
    name: "shenlan-avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "保存头像" }).click();
  await expect(page.getByText("头像已更新")).toBeVisible();
  await expect(page.locator(".s5-avatar-editor > i")).toHaveClass(/has-image/);

  await page.getByRole("button", { name: "编辑" }).first().click();
  await expect(page.getByRole("button", { name: "更换头像" })).toHaveCount(0);
  await page.getByLabel("姓名*").fill("");
  await expect(page.getByText("请输入姓名")).toBeVisible();
  await page.getByLabel("姓名*").fill("沈岚");

  await page.getByRole("button", { name: "保存" }).first().click();
  await expect(page.getByText("个人资料已保存")).toBeVisible();

  await page.getByRole("button", { name: "更换手机号" }).click();
  await page.getByLabel("新手机号*").fill("138");
  await expect(page.getByText("请输入有效的 11 位手机号")).toBeVisible();
  await page.getByLabel("新手机号*").fill("13900139000");
  await page.getByLabel("短信验证码*").fill("123456");
  await page.getByRole("button", { name: "验证并更换" }).click();
  await expect(page.getByText("登录手机号已更新")).toBeVisible();

  await page.getByRole("button", { name: "管理绑定" }).click();
  await expect(page.getByText(/仍可使用已验证手机号登录/)).toBeVisible();
  await page.getByRole("button", { name: "解除绑定" }).click();
  await expect(page.getByText("微信登录已解除绑定")).toBeVisible();

  await page.getByRole("button", { name: "退出其他会话" }).click();
  await expect(
    page.getByRole("dialog", { name: "退出其他会话" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "确认退出" }).click();
  await expect(page.getByText("其他会话已退出")).toBeVisible();
  await assertNoConsoleErrors();
});

test("通知页区分可配置通知和强制通知", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/settings/notifications");
  // 规则：邮件只发“账号与订阅”，且必须发送；其他事项只有站内通知。
  await expect(page.getByRole("switch", { name: /邮件通知$/ })).toHaveCount(1);
  const billingMail = page.getByRole("switch", { name: "账号与订阅邮件通知" });
  await expect(billingMail).toBeChecked();
  await expect(billingMail).toBeDisabled();
  for (const title of ["需要我处理", "外部回复", "跟进提醒", "任务状态", "洞察", "数据处理"])
    await expect(page.getByLabel(`${title}不发邮件`)).toBeVisible();
  const taskApp = page.getByRole("switch", { name: "任务状态站内通知" });
  await expect(taskApp).toBeChecked();
  await taskApp.click();
  await expect(taskApp).not.toBeChecked();
  await expect(
    page.getByRole("switch", { name: "需要我处理站内通知" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "保存设置" }).click();
  await expect(page.getByText("通知设置已保存")).toBeVisible();

  await page.goto("#/settings/notifications?state=limited");
  await expect(page.getByText(/联系邮箱尚未验证/)).toBeVisible();
  await expect(billingMail).toBeDisabled();
  await assertNoConsoleErrors();
});

test("自动化授权支持三种统一模式且不展示内部门禁", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/settings/automation");
  await expect(page.getByText("强制门禁")).toHaveCount(0);
  await expect(page.getByText("所有新任务", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "修改" })).toHaveCount(1);
  await expect(page.getByText("客户开发", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "修改" }).click();
  await page.getByRole("radio", { name: /自动执行/ }).click();
  await expect(page.getByText(/不会自动发送邮件/)).toBeVisible();
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("默认授权已更新")).toBeVisible();
  await expect(
    page.getByText("自动执行", { exact: true }).first(),
  ).toBeVisible();
  await assertNoConsoleErrors();
});

test("连接页覆盖邮箱自动探测和手动协议", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/settings/connections?state=empty");
  await page.getByRole("button", { name: "连接邮箱" }).click();
  await page.getByLabel("邮箱地址*").fill("shenlan@qq.com");
  await page.getByLabel("邮箱密码或客户端授权码*").fill("mail-auth-code");
  await page.getByRole("button", { name: "自动探测" }).click();
  await expect(page.getByText("已识别为 QQ 邮箱")).toBeVisible();
  await page.getByRole("button", { name: "验证并连接" }).click();
  await expect(page.getByText("shenlan@qq.com 已连接")).toBeVisible();
  await page.getByRole("button", { name: "完成" }).click();
  await expect(page.getByText("发件邮箱已连接")).toBeVisible();

  await page.getByRole("button", { name: "重新连接" }).click();
  await page.getByLabel("邮箱地址*").fill("shenlan@xinglan-talent.cn");
  await page.getByLabel("邮箱密码或客户端授权码*").fill("mail-auth-code");
  await page.getByRole("button", { name: "自动探测" }).click();
  await expect(page.getByText("未能自动识别邮箱配置")).toBeVisible();
  await page.getByRole("button", { name: "手动设置" }).click();
  await page.getByRole("button", { name: /收件协议/ }).click();
  await page.getByRole("button", { name: "POP3", exact: true }).click();
  await page.getByRole("button", { name: "验证并连接" }).click();
  await expect(page.getByText(/已验证 SMTP 发件和 POP3 收件/)).toBeVisible();
  await page.getByRole("button", { name: "完成" }).click();

  await expect(page.getByText("寻访 App 设备")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "添加设备" })).toHaveCount(0);
  await assertNoConsoleErrors();
});

test("订阅与数据覆盖支付、无订阅、到期和危险操作", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/settings/subscription");
  await expect(page.locator(".s5-plan-card > strong")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "更新支付方式" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: /下载收据/ })).toHaveCount(0);
  await page.getByRole("button", { name: "更换套餐" }).click();
  // Pricing doc 2026-09-28: tiers with monthly Credits and base storage; the team tier comes in phase 2.
  await expect(page.getByRole("radio", { name: /团队版/ })).toBeDisabled();
  await expect(page.getByRole("radio", { name: /个人版.*10,000 Credits.*5 GB/ })).toBeVisible();
  await page.getByRole("radio", { name: /个人版/ }).click();
  await page.getByRole("radio", { name: /微信支付/ }).click();
  await page.getByRole("button", { name: "确认并支付" }).click();
  await expect(page.getByText("套餐已更新")).toBeVisible();

  await page.goto("#/settings/subscription?state=none");
  await expect(page.getByText("尚未订阅 Hunter")).toBeVisible();
  await page.getByRole("button", { name: "选择订阅" }).click();
  await expect(page.getByRole("radio", { name: /支付宝/ })).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();

  await page.goto("#/settings/subscription?state=limited");
  await expect(page.getByText(/业务数据仍可查看和导出/)).toBeVisible();
  await expect(page.getByText(/正在运行的那一轮已经跑完并保存/)).toBeVisible();

  // Expired: topping up is unavailable (the 12 months would run while nothing can be used).
  await expect(page.getByRole("button", { name: "充值", exact: true })).toBeDisabled();
  await expect(page.getByText(/订阅到期期间不能充值/)).toBeVisible();

  await page.goto("#/settings/data-privacy");
  await expect(page.getByText("隐私边界")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "注销账号" })).toHaveCount(0);
  await page.getByRole("button", { name: "删除工作空间" }).click();
  await page.getByLabel(/输入“沈岚的猎头工作空间”确认/).fill("错误名称");
  await expect(page.getByText("输入内容不匹配")).toBeVisible();
  await expect(page.getByRole("button", { name: "确认提交" })).toBeDisabled();
  await page
    .getByLabel(/输入“沈岚的猎头工作空间”确认/)
    .fill("沈岚的猎头工作空间");
  await page.getByRole("button", { name: "确认提交" }).click();
  await expect(page.getByText("删除申请已提交")).toBeVisible();
  await assertNoConsoleErrors();
});

// 12 §11.5: Credits outside the plan are listed one grant per row, ordered by expiry (the order they are
// spent in), with arrival, expiry, validity, what is left and — once expired — what was taken back.
test("购买和补偿的 Credits 按笔显示到账、到期和剩余", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/settings/subscription");
  const grants = page
    .locator(".s5-section")
    .filter({ has: page.getByRole("heading", { name: "购买和补偿的 Credits" }) });
  const rows = grants.locator(".s5-setting-row");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("补偿 Credits 300");
  await expect(rows.nth(0)).toContainText("已失效");
  await expect(rows.nth(0)).toContainText("已收回 200");
  await expect(rows.nth(1)).toContainText("补偿 Credits 500");
  await expect(rows.nth(1)).toContainText("即将到期");
  await expect(rows.nth(1)).toContainText("2026 年 9 月 23 日到期（发放时说明 60 天）");
  await expect(rows.nth(2)).toContainText("充值 ¥100 → 10,000 Credits");
  await expect(rows.nth(2)).toContainText("2027 年 6 月 5 日到期（到账后 12 个月） · 微信支付 · ¥1 = 100 Credits");
  await expect(rows.nth(2)).toContainText("剩余 2,500");
  // The usage card's balance equals what the grants still hold (2,500 + 500).
  await expect(page.getByText("可用余额（含套餐外的 3,000）")).toBeVisible();
  await expect(
    page.locator(".s5-order-list > div").filter({ hasText: "充值 ¥100 · 10,000 Credits" }),
  ).toContainText("2026 年 6 月 5 日 · 微信支付 · 到期 2027 年 6 月 5 日");
  await assertNoConsoleErrors();
});

// 12 §11.6: top up an amount, converted at the rate when the payment succeeds (example ¥1 = 100 Credits);
// WeChat Pay only; nothing is charged or credited until paid, closing the QR step cancels the order.
test("充值按金额换成 Credits，只支持微信支付", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/settings/subscription");
  await page.getByRole("button", { name: "充值", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "充值 Credits" });
  await expect(dialog).toContainText("当前 ¥1 = 100 Credits（示例，汇率待定）");
  await expect(dialog).toContainText("充值目前只支持微信支付");
  await expect(dialog).toContainText("到账后 12 个月内有效，到期没用完的部分自动收回，不退款");
  await expect(dialog.getByRole("radio")).toHaveCount(6); // 4 amounts + 其他金额 + 微信支付
  await dialog.getByRole("radio", { name: /其他金额/ }).click();
  await dialog.getByLabel("充值金额（元）").fill("5");
  await expect(dialog).toContainText("请输入 10–5,000 之间的整数金额");
  await expect(dialog.getByRole("button", { name: "去支付" })).toBeDisabled();
  await dialog.getByLabel("充值金额（元）").fill("300");
  await expect(dialog.locator(".s5-recharge-result")).toContainText("30,000 Credits");
  await dialog.getByRole("radio", { name: /¥200/ }).click();
  await expect(dialog.locator(".s5-recharge-result")).toContainText("20,000 Credits");
  await dialog.getByRole("button", { name: "去支付 ¥200" }).click();

  // Closing on the QR step cancels the order: no charge, no Credits.
  dialog = page.getByRole("dialog", { name: "微信支付" });
  await expect(dialog.getByRole("img", { name: "微信支付二维码" })).toBeVisible();
  await expect(dialog).toContainText("¥ 200.00");
  await dialog.getByRole("button", { name: "关闭" }).click();
  await expect(page.getByText("订单已取消，没有扣款")).toBeVisible();
  await expect(page.getByText("可用余额（含套餐外的 3,000）")).toBeVisible();

  await page.getByRole("button", { name: "充值", exact: true }).click();
  await page.getByRole("dialog", { name: "充值 Credits" }).getByRole("radio", { name: /¥200/ }).click();
  await page.getByRole("button", { name: "去支付 ¥200" }).click();
  await page.getByRole("button", { name: "我已完成支付" }).click();
  await expect(page.getByText("充值成功：20,000 Credits 已到账")).toBeVisible();
  const grants = page
    .locator(".s5-section")
    .filter({ has: page.getByRole("heading", { name: "购买和补偿的 Credits" }) });
  const rows = grants.locator(".s5-setting-row");
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(3)).toContainText("充值 ¥200 → 20,000 Credits");
  await expect(rows.nth(3)).toContainText("2026 年 8 月 24 日到账 · 2027 年 8 月 24 日到期（到账后 12 个月）");
  await expect(rows.nth(3)).toContainText("剩余 20,000");
  await expect(page.getByText("可用余额（含套餐外的 23,000）")).toBeVisible();
  await expect(page.locator(".s5-usage-breakdown")).toContainText("32,000");
  await expect(page.locator(".s5-order-list > div").first()).toContainText(
    "充值 ¥200 · 20,000 Credits",
  );
  await expect(page.locator(".s5-order-list > div").first()).toContainText(
    "2026 年 8 月 24 日 · 微信支付 · 到期 2027 年 8 月 24 日",
  );
  await assertNoConsoleErrors();
});

test("设置公共状态可重复验收", async ({ page }) => {
  await page.goto("#/settings/profile?state=loading");
  await expect(page.getByLabel("设置加载中")).toBeVisible();
  await page.goto("#/settings/profile?state=error");
  await expect(page.getByText("设置读取失败")).toBeVisible();
  await page.getByRole("button", { name: "重新加载" }).click();
  await expect(page).toHaveURL(/#\/settings\/profile$/);
});

test("移动端从账户区域进入设置并切换设置项", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/home");
  await page.getByRole("button", { name: "更多" }).click();
  await page.getByRole("button", { name: /设置/ }).last().click();
  await expect(page).toHaveURL(/#\/settings\/profile$/);
  await page
    .getByRole("button", { name: /个人资料/ })
    .last()
    .click();
  await page.getByRole("button", { name: /通知/ }).last().click();
  await expect(page).toHaveURL(/#\/settings\/notifications$/);
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});
