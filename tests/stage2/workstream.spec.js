import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

async function waitForReview(page) {
  await expect(page.getByText("云端检索已开始")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "在本机继续" }).click();
  await expect(page.getByRole("heading", { name: "在本机继续" })).toBeVisible();
  await page.getByRole("button", { name: "在此设备继续" }).click();
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
  await expect(page.locator(".s2-timeline .s2-runtime")).toHaveCount(0);
  const planDock = await page
    .locator(".s2-composer-wrap > .s2-runtime")
    .boundingBox();
  const composer = await page
    .locator(".s2-composer-wrap > .s2-composer")
    .boundingBox();
  expect(planDock).not.toBeNull();
  expect(composer).not.toBeNull();
  expect(planDock.y + planDock.height).toBeLessThanOrEqual(composer.y);
  await expect(
    page.locator(".s2-runtime-summary > svg path").first(),
  ).toHaveAttribute("d", "m18 15-6-6-6 6");
  await page.getByRole("button", { name: /执行计划/ }).click();
  await expect(
    page.locator(".s2-runtime-summary > svg path").first(),
  ).toHaveAttribute("d", "m6 9 6 6 6-6");
  await expect(page.getByText("当前进度", { exact: true })).toBeVisible();
  await expect(page.getByText("计划依据", { exact: true })).toHaveCount(0);
  await expect(
    page.locator(".s2-runtime .s2-plan-list li.is-complete"),
  ).toHaveCount(4);
  await expect(
    page.locator(".s2-runtime .s2-plan-list li.is-waiting"),
  ).toHaveCount(1);
  const relatedTasks = page.getByRole("button", { name: /相关任务/ });
  await expect(relatedTasks).toContainText("3 项完成 · 1 项等待用户");
  await relatedTasks.click();
  await expect(
    page.locator(".s2-runtime .s2-plan-list li").filter({
      hasText: "按决定继续后续动作",
    }),
  ).toContainText("等待用户");
  await page.getByRole("button", { name: /准备本地任务并接收结果/ }).click();
  await expect(
    page.getByRole("heading", { name: "准备本地任务并接收结果" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭检查区" }).click();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("执行计划持续标记进度并显示新信息造成的调整", async ({ page }) => {
  const runtimeButton = page.getByRole("button", { name: /执行计划/ });
  await expect(runtimeButton).toBeVisible({ timeout: 6_000 });
  await runtimeButton.click();
  await expect(
    page.locator(".s2-runtime .s2-plan-list li.is-active"),
  ).toHaveCount(1);

  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("补充：最近加入北京团队的候选人也要纳入本轮判断。");
  await input.press("Enter");

  await expect(page.getByText("计划已根据新信息调整")).toBeVisible();
  await expect(
    page.locator(".s2-runtime .s2-plan-list li.is-adjusted"),
  ).toHaveCount(1);
  await expect(page.locator(".s2-runtime .s2-plan-list")).toContainText(
    "已完成步骤和已有结果继续保留",
  );

  await page.reload();
  await expect(page.getByText("计划已根据新信息调整")).toBeVisible();
  await expect(
    page.locator(".s2-runtime .s2-plan-list li.is-adjusted"),
  ).toHaveCount(1);
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
  await page.getByRole("button", { name: "加入岗位储备" }).click();
  await expect(page.getByText(/已应用审核决定/)).toBeVisible();
  await expect(
    page.getByText(/下一步可以继续指定需要联系的人选/),
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
  await expect(
    page.getByText(/未选择赵星羽，4 位候选人已加入岗位储备/),
  ).toBeVisible();
  await expect(
    page.getByText(/下一步可以继续指定需要联系的人选/),
  ).toBeVisible();
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

test("新建工作判断为业务主线后进入主线工作区", async ({ page }) => {
  await page.goto("#/new");
  const input = page.getByPlaceholder(/例如：为星澜机器人/);
  await input.fill("为星澜机器人 VLA 算法负责人岗位持续寻找合适候选人");
  await input.press("Enter");
  await expect(page.getByText(/我会建立一条岗位招聘业务主线/)).toBeVisible();
  await expect(page).toHaveURL(/#\/workstreams\/position-vla$/, {
    timeout: 5_000,
  });
  await expect(
    page.getByText("为星澜机器人 VLA 算法负责人岗位持续寻找合适候选人"),
  ).toBeVisible();
});

test("加载、流式中断和本机协作受限状态都可恢复", async ({ page }) => {
  await page.goto("#/workstreams/position-vla?state=loading");
  await expect(page.locator(".s2-workspace-loading")).toBeVisible();

  await page.goto("#/workstreams/position-vla?state=stream-error");
  await expect(page.getByText("回复生成中断")).toBeVisible();
  await page.getByRole("button", { name: "继续生成" }).click();
  await expect(page.getByText("云端检索已开始")).toBeVisible({
    timeout: 8_000,
  });

  await page.goto("#/workstreams/position-vla?state=limited");
  await expect(page.getByText("本机协作暂不可用").first()).toBeVisible();
  const handoffSpacing = await page
    .locator(".s2-permission-state--handoff")
    .evaluate((element) => {
      const current = element.getBoundingClientRect();
      const previous = element.previousElementSibling.getBoundingClientRect();
      const next = element.nextElementSibling.getBoundingClientRect();
      return {
        above: Math.round(current.top - previous.bottom),
        below: Math.round(next.top - current.bottom),
      };
    });
  expect(handoffSpacing.above).toBeGreaterThanOrEqual(12);
  expect(handoffSpacing.below).toBeGreaterThanOrEqual(12);
  expect(
    Math.abs(handoffSpacing.above - handoffSpacing.below),
  ).toBeLessThanOrEqual(6);
  await page.getByRole("button", { name: "查看处理方式" }).click();
  await expect(page.getByRole("heading", { name: "在本机继续" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "在此设备继续" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "下载任务" })).toBeEnabled();
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

test("本机结果等待、岗位版本变化和身份冲突都有独立状态", async ({ page }) => {
  await page.goto("#/workstreams/position-vla?state=local-waiting");
  await expect(page.getByText("等待本机结果")).toBeVisible();
  await expect(page.getByText(/云端已经形成 9 位候选人/)).toBeVisible();

  await page.goto("#/workstreams/position-vla?state=stale-task");
  await expect(page.getByText(/本地任务使用的是上一版本/)).toBeVisible();
  await expect(page.getByText(/按照最新岗位重新匹配/)).toBeVisible();

  await page.goto("#/workstreams/position-vla?state=merge-conflict");
  await expect(page.getByText(/林昊的资料存在冲突/)).toBeVisible();
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
  await expect(page.getByText("候选人", { exact: true }).first()).toBeVisible();
});
