import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

async function waitForReview(page) {
  await expect(page.getByText("首批候选人已经可以审核")).toBeVisible({
    timeout: 10_000,
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("#/workstreams/position-vla");
});

test("业务主线从第一条输入渐进推进到审核节点", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await expect(
    page.getByText(/为星澜机器人“具身智能 VLA 算法负责人”岗位做多渠道找人/),
  ).toBeVisible();
  await expect(page.getByText("首批候选人已经可以审核")).toHaveCount(0);
  await waitForReview(page);
  await expect(page.getByRole("button", { name: /执行计划/ })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.getByRole("button", { name: /执行计划/ }).click();
  await expect(page.getByText("相关内部任务")).toBeVisible();
  await page.getByRole("button", { name: /人才平台并行寻访/ }).click();
  await expect(
    page.getByRole("heading", { name: "人才平台并行寻访" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭检查区" }).click();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("大型候选人审核支持筛选、详情和结构化决定", async ({ page }) => {
  await waitForReview(page);
  await page.getByRole("button", { name: "打开完整审核" }).click();
  await expect(
    page.getByRole("heading", { name: "具身智能 VLA 算法负责人" }),
  ).toBeVisible();
  await page.getByPlaceholder("搜索姓名、公司、职位或技能").fill("林昊");
  await expect(page.getByRole("button", { name: /林昊/ })).toBeVisible();
  await page.getByRole("radio", { name: "加入岗位储备" }).click();
  await page.getByRole("button", { name: "应用决定并继续" }).click();
  await expect(page.getByText(/已应用审核决定/)).toBeVisible();
  await expect(page.getByText("已从当前检查点继续")).toBeVisible();
});

test("候选人审核支持排序并在刷新后恢复未提交状态", async ({ page }) => {
  await waitForReview(page);
  const composer = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await composer.fill("稍后还要核实异地意愿");
  await page.getByRole("button", { name: "打开完整审核" }).click();
  const rows = page.locator(".s2-candidate-table > button");
  await expect(rows.first()).toContainText("林昊");
  await page.getByRole("button", { name: "匹配分从高到低" }).click();
  await expect(rows.first()).toContainText("孟予安");
  await page.getByPlaceholder("搜索姓名、公司、职位或技能").fill("林昊");
  await page.getByRole("radio", { name: "加入岗位储备" }).click();
  await page.reload();
  await expect(page.getByPlaceholder("搜索姓名、公司、职位或技能")).toHaveValue(
    "林昊",
  );
  await expect(
    page.getByRole("radio", { name: "加入岗位储备" }),
  ).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "返回对话" }).click();
  await expect(composer).toHaveValue("稍后还要核实异地意愿");
});

test("自然语言批量决定与审核工作区使用同一语义", async ({ page }) => {
  await waitForReview(page);
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("联系 85 分以上的人，但赵星羽虽然分高也不适合，排除他");
  await input.press("Enter");
  await expect(
    page.getByText(/排除赵星羽后，4 位候选人加入联系名单/),
  ).toBeVisible();
  await expect(page.getByText(/正式外部联系尚未执行/)).toBeVisible();
});

test("授权切换、暂停、终止与删除确认可用", async ({ page }) => {
  await page.getByRole("button", { name: /执行前确认/ }).click();
  await page.getByRole("option", { name: /仅分析/ }).click();
  await expect(page.getByText(/授权模式已切换为“仅分析”/)).toBeVisible();
  await page.getByRole("button", { name: "暂停" }).click();
  await expect(page.getByRole("button", { name: "继续" })).toBeVisible();
  await page.getByRole("button", { name: "更多主线操作" }).click();
  await page.getByRole("button", { name: "终止业务主线" }).click();
  await expect(
    page.getByRole("heading", { name: "终止业务主线" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await page.getByRole("button", { name: "更多主线操作" }).click();
  await page.getByRole("button", { name: "删除业务主线" }).click();
  await expect(
    page.getByRole("heading", { name: "删除业务主线" }),
  ).toBeVisible();
});

test("新建业务主线通过自然语言进入统一工作区", async ({ page }) => {
  await page.goto("#/workstreams/new");
  const input = page.getByPlaceholder(/例如：帮我摸排/);
  await input.fill("帮我找星澜机器人 VLA 算法负责人候选人");
  await input.press("Enter");
  await expect(page).toHaveURL(/#\/workstreams\/position-vla$/, {
    timeout: 5_000,
  });
  await expect(
    page.getByText("帮我找星澜机器人 VLA 算法负责人候选人"),
  ).toBeVisible();
});

test("加载、流式中断和平台权限受限状态都可恢复", async ({ page }) => {
  await page.goto("#/workstreams/position-vla?state=loading");
  await expect(page.locator(".s2-workspace-loading")).toBeVisible();

  await page.goto("#/workstreams/position-vla?state=stream-error");
  await expect(page.getByText("回复生成中断")).toBeVisible();
  await page.getByRole("button", { name: "继续生成" }).click();
  await expect(page.getByText("岗位边界已经确认")).toBeVisible({
    timeout: 8_000,
  });

  await page.goto("#/workstreams/position-vla?state=limited");
  await expect(page.getByText(/猎聘登录已失效/)).toBeVisible();
  await page.getByRole("button", { name: "打开平台处理" }).click();
  await expect(page.getByText("已打开人才平台处理入口")).toBeVisible();
});

test("附件格式失败使用局部反馈且可以关闭", async ({ page }) => {
  const chooser = page.locator('input[type="file"]');
  await chooser.setInputFiles({
    name: "未经支持的脚本.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("not-an-attachment"),
  });
  await expect(page.getByRole("alert")).toContainText("仅支持文档、表格和图片");
  await page.getByRole("button", { name: "关闭文件错误" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("移动端候选人审核可以查看详情并返回列表", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await waitForReview(page);
  await page.getByRole("button", { name: "打开完整审核" }).click();
  await page.getByRole("button", { name: /林昊/ }).click();
  await expect(page.getByRole("heading", { name: "推荐理由" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "风险提示" })).toBeVisible();
  await page.getByRole("button", { name: "返回候选人列表" }).click();
  await expect(page.getByText("候选人", { exact: true }).first()).toBeVisible();
});
