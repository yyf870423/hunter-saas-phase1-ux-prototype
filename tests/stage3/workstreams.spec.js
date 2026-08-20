import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("四类业务主线可以从同一历史区切换且内容不同", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/workstreams/client-xinglan");
  await expect(
    page.getByRole("heading", { name: "星澜机器人招聘合作" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /具身智能核心人才版图/ }).click();
  await expect(page).toHaveURL(/workstreams\/mapping-embodied/);
  await expect(
    page.getByRole("heading", { name: "具身智能核心人才版图" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /林昊职业机会/ }).click();
  await expect(page).toHaveURL(/workstreams\/career-linhao/);
  await expect(
    page.getByRole("heading", { name: "林昊职业机会" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /具身智能 VLA 算法负责人/ }).click();
  await expect(page).toHaveURL(/workstreams\/position-vla/);
  await assertNoConsoleErrors();
});

test("客户开发完成联系人审核、联系授权、外部等待和招聘机会回流", async ({
  page,
}) => {
  await page.goto("#/workstreams/client-xinglan");
  await expect(page.getByText("公司与联系人结果可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开公司与联系人审核" }).click();
  await expect(
    page.getByRole("heading", { name: "星澜机器人招聘合作" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "陈雨" })).toBeVisible();
  await expect(page.getByText("138 **** 6217").first()).toBeVisible();
  await page.getByRole("button", { name: "保存审核结果" }).click();
  await expect(page.getByText("是否允许本次对外联系？")).toBeVisible();
  await page.getByRole("button", { name: /仅允许本次发送/ }).click();
  await expect(page.getByText("等待陈雨回复招聘合作邮件")).toBeVisible();
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("陈雨回复：两个岗位正在招聘，稍后补完整 JD。");
  await input.press("Enter");
  await expect(page.getByText("回复已形成一条招聘机会")).toBeVisible();
  await expect(page.getByText("星澜机器人 · 具身智能团队招聘")).toBeVisible();
  await expect(page.getByText(/不足以直接创建正式岗位/)).toBeVisible();
});

test("客户开发没有联系人时展示可执行缺口而不生成虚假联系人", async ({
  page,
}) => {
  await page.goto("#/workstreams/client-xinglan?state=no-contact");
  await expect(
    page.getByText("暂未找到可以直接联系的招聘负责人"),
  ).toBeVisible();
  await expect(page.getByText(/不会猜测姓名/)).toBeVisible();
  await page.getByRole("button", { name: /查看已尝试路径/ }).click();
  await expect(
    page.getByRole("heading", { name: "已尝试的联系路径" }),
  ).toBeVisible();
});

test("人才摸排分批审核公司、人物、冲突和行动缺口", async ({ page }) => {
  await page.goto("#/workstreams/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开本批次更新审核" }).click();
  await expect(page.getByText("星澜机器人", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: /人物与关系/ }).click();
  await page.getByRole("button", { name: /王奕/ }).click();
  await expect(page.getByText("存在冲突", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: /冲突与缺口/ }).click();
  await expect(page.getByText("拓界机器人技术负责人仍缺失")).toBeVisible();
  await page.getByRole("button", { name: "暂不合并" }).click();
  await expect(page.getByRole("button", { name: "已暂不合并" })).toBeVisible();
  await page.getByRole("button", { name: "更新人才版图" }).click();
  await expect(page.getByText("人才版图已完成本批次更新")).toBeVisible();
  await expect(page.getByText(/不会把人才版图标记为“初版完成”/)).toBeVisible();
});

test("相关任务详情使用人才摸排自己的结果去向和检查点", async ({ page }) => {
  await page.goto("#/workstreams/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "执行计划" }).click();
  await page.getByRole("button", { name: /相关任务/ }).click();
  await page.getByRole("button", { name: /人物关系与联系路径/ }).click();
  await expect(
    page.getByText("具身智能核心人才版图 · 本批次增量更新"),
  ).toBeVisible();
  await expect(page.getByText("人物身份与关系已去重")).toBeVisible();
  await expect(page.getByText("未生成重复候选人记录")).toHaveCount(0);
});

test("候选人求职只匹配系统岗位并由猎头本人联系", async ({ page }) => {
  await page.goto("#/workstreams/career-linhao");
  await expect(page.getByText("系统内有 3 个岗位值得查看")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "查看完整岗位匹配" }).click();
  await expect(page.locator(".s3-match-list strong").first()).toContainText(
    "92",
  );
  await expect(page.getByText("推荐理由", { exact: true })).toBeVisible();
  await expect(page.getByText("风险提示", { exact: true })).toBeVisible();
  await expect(page.getByText("建议沟通要点", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回主线并继续" }).click();
  await expect(page.getByText("请由你本人联系林昊")).toBeVisible();
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("微信已联系，暂时还没有回复。");
  await input.press("Enter");
  await expect(page.getByText("等待林昊回复猎头的微信")).toBeVisible();
  await expect(page.getByText(/不消耗 Agent 用量/)).toBeVisible();
});

test("候选人求职新简历只触发受影响岗位重匹配", async ({ page }) => {
  await page.goto("#/workstreams/career-linhao?state=new-resume");
  await expect(
    page.getByText("新简历已合并，2 个岗位需要重新判断"),
  ).toBeVisible();
  await expect(page.getByText(/没有创建重复候选人档案/)).toBeVisible();
  await expect(page.getByText(/团队规模从 8 人更新为 15 人/)).toBeVisible();
});

test("岗位招聘在入岗位储备后单独确认联系并接收新简历", async ({ page }) => {
  await page.goto("#/workstreams/position-vla?state=review");
  await page.getByRole("button", { name: /打开候选人审核/ }).click();
  await page.getByRole("button", { name: "加入岗位储备" }).click();
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("联系林昊、周明远和陈楚宁，先了解意愿。");
  await input.press("Enter");
  await expect(page.getByText("是否允许联系这 3 位候选人？")).toBeVisible();
  await page.getByRole("button", { name: /仅允许本次联系/ }).click();
  await expect(page.getByText("等待 3 位候选人回复岗位沟通")).toBeVisible();
  await input.fill("林昊回复并发来一份新简历，只考虑北京或远程。");
  await input.press("Enter");
  await expect(
    page.getByText("林昊的新简历已合并并完成局部重匹配"),
  ).toBeVisible();
  await expect(page.getByText(/正式推荐、面试安排/)).toBeVisible();
});

test("岗位招聘无候选人时解释原因且不放宽硬门槛", async ({ page }) => {
  await page.goto("#/workstreams/position-vla?state=no-candidate");
  await expect(page.getByText("本轮没有候选人通过岗位门禁")).toBeVisible();
  await expect(page.getByText(/角色层级明显不匹配/)).toBeVisible();
  await expect(page.getByText(/不会为了凑数量放宽/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /打开候选人审核/ }),
  ).toHaveCount(0);
});

for (const scenario of [
  "client-xinglan",
  "mapping-embodied",
  "career-linhao",
]) {
  test(`${scenario} 覆盖加载、中断、权限受限和局部失败`, async ({ page }) => {
    await page.goto(`#/workstreams/${scenario}?state=loading`);
    await expect(page.locator(".s2-workspace-loading")).toBeVisible();
    await page.goto(`#/workstreams/${scenario}?state=stream-error`);
    await expect(page.getByText("回复生成中断")).toBeVisible();
    await page.getByRole("button", { name: "继续生成" }).click();
    await expect(page.getByText("回复生成中断")).toHaveCount(0);
    await page.goto(`#/workstreams/${scenario}?state=limited`);
    await expect(page.locator(".s2-permission-state")).toBeVisible();
    await page.getByRole("button", { name: "处理权限" }).click();
    await expect(page.getByText("已打开对应权限处理入口")).toBeVisible();
    await page.goto(`#/workstreams/${scenario}?state=error`);
    await expect(page.locator(".s2-local-error")).toBeVisible();
    await page.getByRole("button", { name: "重试失败步骤" }).click();
    await expect(page.locator(".s2-local-error")).toHaveCount(0);
  });
}

test("移动端客户联系人和候选人岗位详情可查看并返回", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/workstreams/client-xinglan");
  await expect(page.getByText("公司与联系人结果可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开公司与联系人审核" }).click();
  await page.getByRole("button", { name: /陈雨/ }).click();
  await expect(page.getByText("首选联系对象", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回列表" }).click();
  await expect(page.locator(".s3-review-detail")).not.toHaveClass(
    /is-mobile-open/,
  );
  await expectNoHorizontalOverflow(page);
});
