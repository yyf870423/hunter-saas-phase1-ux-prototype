import { selectTopReviewCandidates } from "../review-helpers";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

async function waitForReview(page) {
  await expect(page.getByText("本轮检索范围已确定")).toBeVisible({
    timeout: 18_000,
  });
  await expect(page.getByText("首批候选人已经可以审核")).toBeVisible({
    timeout: 45_000,
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("#/tasks/position-vla");
});


test("持续任务渐进交付结果，不再显示计划和处理回查", async ({ page }) => {
  const noErrors = trackConsoleErrors(page);
  await expect(page.getByText(/为星澜机器人“具身智能 VLA 算法负责人”岗位做多渠道找人/)).toBeVisible();
  await waitForReview(page);
  await expect(page.getByRole("button", { name: /执行计划/ })).toHaveCount(0);
  await expect(page.locator(".s2-runtime, .s2-step-processes")).toHaveCount(0);
  await expect(page.locator(".s2-agent-work")).toContainText("等待");
  await expect(page.locator(".s2-agent-duration")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await noErrors();
});

test("补充要求保留在对话，完成后仍可继续，不恢复计划面板", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=review");
  const input = page.getByRole("textbox", { name: "任务对话输入" });
  await input.fill("补充：最近加入北京团队的候选人也要纳入本轮判断。");
  await input.press("Enter");
  await expect(input).toBeEnabled();
  await expect(page.locator(".s2-decision-thread").last()).toContainText("北京团队");
  await expect(page.locator('.s2-agent-duration[data-elapsed-kind="measured"]')).toHaveCount(1);
  await expect(page.locator(".s2-runtime, .s2-step-processes")).toHaveCount(0);
  await expect(page.locator(".s1-toast")).toHaveCount(0);
});

test("对话输入框随内容自动增高并在上限后内部滚动", async ({ page }) => {
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await expect(input).toBeVisible({ timeout: 6_000 });
  const initialHeight = await input.evaluate((element) => element.clientHeight);
  await input.fill("第一行\n第二行\n第三行\n第四行\n第五行");
  const expandedHeight = await input.evaluate(
    (element) => element.clientHeight,
  );
  expect(expandedHeight).toBeGreaterThan(initialHeight);
  await expect(input).toHaveCSS("resize", "none");
  await input.fill(
    Array.from({ length: 20 }, (_, index) => `第 ${index + 1} 行`).join("\n"),
  );
  const cappedHeight = await input.evaluate((element) => element.clientHeight);
  expect(cappedHeight).toBeLessThanOrEqual(150);
  await expect(input).toHaveCSS("overflow-y", "auto");
  await input.fill("");
  const resetHeight = await input.evaluate((element) => element.clientHeight);
  expect(resetHeight).toBe(initialHeight);
});

test("大型候选人审核支持筛选、详情和结构化决定", async ({ page }) => {
  await waitForReview(page);
  await page.getByRole("button", { name: /打开候选人审核/ }).click();
  await expect(
    page.getByRole("heading", { name: "具身智能 VLA 算法负责人" }),
  ).toBeVisible();
  await page.getByPlaceholder("搜索姓名、公司、职位或技能").fill("林昊");
  await expect(page.getByRole("button", { name: /林昊/ })).toBeVisible();
  await expect(page.getByText(/批量处理已选/)).toBeVisible();
  await expect(page.getByText(/不会自动联系候选人/)).toBeVisible();
  await expect(page.getByRole("button", { name: "本轮排除" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "加入联系名单" })).toHaveCount(
    0,
  );
  await page.getByPlaceholder("搜索姓名、公司、职位或技能").fill("");
  await selectTopReviewCandidates(page);
  await page.getByRole("button", { name: "加入岗位储备" }).click();
  await expect(page.getByText(/已应用审核决定/)).toBeVisible();
  await expect(
    page.getByText(/下一步可以直接告诉我需要给哪些候选人发邮件/),
  ).toBeVisible();
  await expect(page.getByText("已从当前检查点继续")).toBeVisible();
});

test("候选人审核支持排序并在刷新后恢复未提交状态", async ({ page }) => {
  await waitForReview(page);
  const composer = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await composer.fill("稍后还要核实异地意愿");
  await page.getByRole("button", { name: /打开候选人审核/ }).click();
  const rows = page.locator(".s2-candidate-table > button");
  await expect(rows.first()).toContainText("林昊");
  await page.getByRole("button", { name: "匹配分从高到低" }).click();
  await expect(rows.first()).toContainText("孟予安");
  await page.getByPlaceholder("搜索姓名、公司、职位或技能").fill("林昊");
  await page.getByLabel("选择 林昊").uncheck();
  await page.reload();
  await expect(page.getByPlaceholder("搜索姓名、公司、职位或技能")).toHaveValue(
    "林昊",
  );
  await expect(page.getByLabel("选择 林昊")).not.toBeChecked();
  await page.getByRole("button", { name: "返回对话" }).click();
  await expect(composer).toHaveValue("稍后还要核实异地意愿");
});

test("自然语言筛选与审核工作区使用同一入储备语义", async ({ page }) => {
  await waitForReview(page);
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("将 85 分以上的人加入岗位储备，但不要选择赵星羽");
  await input.press("Enter");
  // A batch said in the conversation is listed first and written only after “是” (02 §7.14).
  const draft = page.locator(".s2-decision-thread").last();
  await expect(draft).toContainText("已核对 85 分以上的 4 位人选（未选择赵星羽）");
  await expect(draft).toContainText("本次新增 1 位储备，3 位保持原阶段");
  await expect(draft).toContainText("林昊 · 94 分 · 已在一面，保持原阶段");
  await expect(draft).toContainText("顾言川 · 86 分 · 加入储备");
  await expect(page.getByText(/已应用审核决定/)).toHaveCount(0);
  await input.fill("是");
  await input.press("Enter");
  await expect(
    page.getByText(/未选择赵星羽，新增 1 位岗位储备并同步人才梳理，3 位保持原阶段/),
  ).toBeVisible();
  await expect(
    page.getByText(/下一步可以直接告诉我需要给哪些候选人发邮件/),
  ).toBeVisible();
});

test("授权切换、归档与删除确认可用", async ({ page }) => {
  await page.getByRole("button", { name: /执行前确认/ }).click();
  await page.getByRole("option", { name: /仅分析/ }).click();
  await expect(page.getByText(/授权模式已切换为“仅分析”/)).toBeVisible();
  await page.getByRole("button", { name: "更多任务操作" }).click();
  await expect(
    page.getByRole("button", { name: "归档任务", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "终止任务" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "暂停", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "更多任务操作" }).click();
  await page.getByRole("button", { name: "更多任务操作" }).click();
  await page.getByRole("button", { name: "删除任务" }).click();
  await expect(page.getByRole("heading", { name: "删除任务" })).toBeVisible();
});

test("新建任务自动规划后进入统一任务区", async ({ page }) => {
  await page.goto("#/new");
  const input = page.getByPlaceholder(/例如：为星澜机器人/);
  await input.fill("为星澜机器人 VLA 算法负责人岗位持续寻找合适候选人");
  await input.press("Enter");
  await expect(page.getByText(/我会持续汇总系统候选人/)).toBeVisible();
  await expect(page).toHaveURL(/#\/tasks\/position-vla$/, {
    timeout: 5_000,
  });
  await expect(
    page.getByText("为星澜机器人 VLA 算法负责人岗位持续寻找合适候选人"),
  ).toBeVisible();
});

test("加载、流式中断和公开来源受限状态都可恢复", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=loading");
  await expect(page.locator(".s2-workspace-loading")).toBeVisible();

  await page.goto("#/tasks/position-vla?state=stream-error");
  await expect(page.getByText("回复生成中断")).toBeVisible();
  await page.getByRole("button", { name: "继续生成" }).click();
  await expect(page.getByText("本轮检索范围已确定")).toBeVisible({
    timeout: 8_000,
  });

  await page.goto("#/tasks/position-vla?state=limited");
  await expect(page.getByText("部分公开来源暂不可用").first()).toBeVisible();
  await expect(page.getByText(/可以稍后单独重试/)).toBeVisible();
  await expect(page.getByRole("button", { name: "在本机继续" })).toHaveCount(0);
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

test("文件随消息直接上传且不再二次确认", async ({ page }) => {
  const chooser = page.locator('input[type="file"]');
  await chooser.setInputFiles({
    name: "林昊补充简历.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("prototype-resume"),
  });
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("补充这份候选人资料");
  await input.press("Enter");
  await expect(page.getByText(/已记录新信息/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "确认上传到 Hunter" }),
  ).toHaveCount(0);
});

test("上传简历批次和身份冲突都有独立状态", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=resume-batch");
  await expect(page.getByText("VLA 候选人简历（12 份）.zip")).toBeVisible();
  const uploadedResumeTable = page
    .locator(".s2-markdown-table")
    .filter({ hasText: "用户上传简历" });
  await expect(uploadedResumeTable).toContainText("12 位");

  await page.goto("#/tasks/position-vla?state=merge-conflict");
  await expect(page.getByText(/林昊的资料存在冲突/)).toBeVisible();
  await expect(page.getByText("合并前资料对比")).toBeVisible();
  const identityTable = page.locator(".s2-identity-differences table");
  await expect(identityTable).toContainText("系统候选人记录");
  await expect(identityTable).toContainText("用户上传简历");
  await expect(identityTable).toContainText("手机号后四位");
  await expect(identityTable).toContainText("开始时间相差 2 个月");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".s2-identity-differences tbody tr")).toHaveCount(
    5,
  );
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: /确认为同一人并合并/ }).click();
  await expect(page.getByText(/已合并林昊的资料/)).toBeVisible();
});

test("移动端候选人审核可以查看详情并返回列表", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await waitForReview(page);
  await page.getByRole("button", { name: /打开候选人审核/ }).click();
  await page.getByRole("button", { name: /林昊/ }).click();
  await expect(page.getByRole("heading", { name: "推荐理由" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "风险提示" })).toBeVisible();
  await page.getByRole("button", { name: "返回候选人列表" }).click();
  await expect(
    page.locator(".s2-candidate-head").getByText("候选人", { exact: true }),
  ).toBeVisible();
});
