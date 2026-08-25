import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("桌面账户菜单和用量环可以进入设置", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/home");
  await page.getByRole("button", { name: "打开用户菜单" }).click();
  await page.getByRole("menuitem", { name: /设置/ }).click();
  await expect(page).toHaveURL(/#\/settings\/profile$/);

  await page.getByRole("button", { name: /查看 Agent 用量/ }).click();
  await page.getByRole("button", { name: "查看订阅与用量" }).click();
  await expect(page).toHaveURL(/#\/settings\/subscription$/);
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
  const taskMail = page.getByRole("switch", { name: "任务状态邮件通知" });
  await expect(taskMail).toBeChecked();
  await taskMail.click();
  await expect(taskMail).not.toBeChecked();
  await expect(
    page.getByRole("switch", { name: "需要我处理站内通知" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "保存设置" }).click();
  await expect(page.getByText("通知设置已保存")).toBeVisible();

  await page.goto("#/settings/notifications?state=limited");
  await expect(page.getByText(/联系邮箱尚未验证/)).toBeVisible();
  await expect(taskMail).toBeDisabled();
  await assertNoConsoleErrors();
});

test("自动化授权支持三种统一模式且不展示内部门禁", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/settings/automation");
  await expect(page.getByText("强制门禁")).toHaveCount(0);
  await page.getByRole("button", { name: "修改" }).first().click();
  await page.getByRole("radio", { name: /自动执行/ }).click();
  await expect(page.getByText(/不会自动发送邮件/)).toBeVisible();
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("默认授权已更新")).toBeVisible();
  await expect(
    page.getByText("自动执行", { exact: true }).first(),
  ).toBeVisible();
  await assertNoConsoleErrors();
});

test("连接页覆盖邮箱自动探测、手动协议和设备连接", async ({ page }) => {
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

  await page.getByRole("button", { name: "添加设备" }).first().click();
  await expect(page.getByText("H7K4-9Q2M")).toBeVisible();
  await page.getByRole("button", { name: "开始等待" }).click();
  await expect(page.getByText(/正在等待设备确认/)).toBeVisible();
  await page.getByRole("button", { name: "模拟设备已连接" }).click();
  await expect(page.getByText("新设备已连接")).toBeVisible();
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
  await page.getByRole("radio", { name: /专业版年付/ }).click();
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
