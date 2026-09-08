import { expect, test } from "@playwright/test";
import { confirmClientOpportunity } from "./client-helpers";
import { waitForOpportunityDraft, replyToAsset } from "../stage4/opportunity-helpers";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("四类持续任务可以从同一任务历史区切换且内容不同", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/tasks/client-xinglan");
  await expect(
    page.getByRole("heading", { name: "星澜机器人招聘合作" }),
  ).toBeVisible();
  await page
    .locator(".s2-history-item")
    .filter({ hasText: "具身智能目标公司组织梳理" })
    .first()
    .click();
  await expect(page).toHaveURL(/tasks\/mapping-embodied/);
  await expect(
    page.getByRole("heading", { name: "具身智能目标公司组织梳理" }),
  ).toBeVisible();
  await page.locator(".s2-history-item").filter({ hasText: "林昊职业机会" }).click();
  await expect(page).toHaveURL(/tasks\/career-linhao/);
  await expect(
    page.getByRole("heading", { name: "林昊职业机会" }),
  ).toBeVisible();
  await page
    .locator(".s2-history-item")
    .filter({ hasText: "具身智能 VLA 算法负责人" })
    .first()
    .click();
  await expect(page).toHaveURL(/tasks\/position-vla/);
  await assertNoConsoleErrors();
});

test("客户开发完成联系人审核、联系授权、外部等待和招聘机会回流", async ({
  page,
}) => {
  await page.goto("#/tasks/client-xinglan");
  await confirmClientOpportunity(page);
  await expect(page.getByText("公司与联系人结果可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开公司与联系人审核" }).click();
  await expect(
    page.getByRole("heading", { name: "星澜机器人招聘合作" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "陈雨" })).toBeVisible();
  await expect(page.getByText("手机 / 邮箱", { exact: true })).toBeVisible();
  await expect(page.getByText("微信已添加", { exact: true })).toHaveCount(0);
  await expect(page.locator(".s3-review-detail dt")).toHaveText([
    "手机",
    "邮箱",
  ]);
  await expect(page.getByRole("button", { name: /陈雨/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: /周琪/ }).click();
  await expect(page.getByRole("heading", { name: "周琪" })).toBeVisible();
  await expect(page.getByRole("button", { name: /周琪/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: /陈雨/ }).click();
  await expect(page.getByText("138 **** 6217").first()).toBeVisible();
  await page.getByRole("button", { name: "保存审核结果" }).click();
  await expect(page.getByText("确认邮件内容")).toBeVisible();
  await expect(page.getByLabel("主题")).toHaveValue(
    "星澜机器人具身智能团队招聘合作",
  );
  await page.getByRole("button", { name: "确认并发送" }).click();
  await expect(page.getByText("等待陈雨回复招聘合作邮件")).toBeVisible();
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("公司：星澜机器人\n机会名称：邮件确认的新一轮团队招聘\n招聘需求摘要：两个岗位正在招聘，稍后补完整 JD。\n需求依据：陈雨回复邮件，确认两个方向存在招聘需求。");
  await input.press("Enter");
  await waitForOpportunityDraft(page);
  await expect(page.getByRole("heading", { name: "待确认的招聘机会" })).toBeVisible();
  await replyToAsset(page, "是");
  await expect(page.getByRole("heading", { name: "待确认的招聘机会" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "查看招聘机会", exact: true })).toBeVisible();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("hunter-opportunity-lifecycle-v1")));
  expect(state.opportunities.find((item) => item.title === "邮件确认的新一轮团队招聘").contactId).toBe("contact-chenyu");
  expect(state.positions.filter((item) => item.managed)).toEqual([]);
});

test("客户开发没有联系人时展示可执行缺口而不生成虚假联系人", async ({
  page,
}) => {
  await page.goto("#/tasks/client-xinglan?state=no-contact");
  await expect(page.getByText("是否记录这条潜在招聘机会？", { exact: true })).toBeVisible();
  await confirmClientOpportunity(page);
  await expect(
    page.getByText("暂未找到可以直接联系的招聘负责人"),
  ).toBeVisible();
  await expect(page.getByText(/不会猜测姓名/)).toBeVisible();
  await page.getByRole("button", { name: /查看已尝试路径/ }).click();
  await expect(
    page.getByRole("heading", { name: "已尝试的联系路径" }),
  ).toBeVisible();
});

test("公司组织梳理按组织、关键岗位与任职人审核，并保留同一确认决定", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied?state=conflict");
  await page.getByRole("button", { name: "打开人才地图批次审核", exact: true }).click();
  await expect(page.getByRole("tab", { name: "公司与组织", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "关键岗位与任职人", exact: true }).click();
  await page.locator(".s3-context-change-items > button").filter({ hasText: "机器人学习研究员" }).click();
  await page.getByRole("button", { name: "确认写入王奕身份关系", exact: true }).click();
  await page.getByRole("tab", { name: "冲突与待补充", exact: true }).click();
  await page.locator(".s3-context-change-items > button").filter({ hasText: "机器人学习研究员" }).click();
  await expect(page.getByRole("button", { name: "重新选择王奕身份关系", exact: true })).toBeVisible();
  await page.locator(".s3-context-change-items > button").filter({ hasText: "穹顶智能" }).click();
  await page.getByRole("button", { name: "本批次不写入", exact: true }).click();
  await page.getByRole("button", { name: "完成审核并返回对话", exact: true }).click();
  await expect(page.getByText(/1 项待核实内容由你明确确认/)).toBeVisible();
  await page.getByRole("button", { name: /^更新人才地图 / }).click();
  await expect(page.getByRole("heading", { name: "人才地图已更新", exact: true })).toBeVisible();
});

test("公司组织审核切换公司后不混淆人员及组织归属", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied?state=gaps");
  await page.getByRole("button", { name: "打开人才地图批次审核", exact: true }).click();
  const items = page.locator(".s3-context-change-items > button");
  await items.filter({ hasText: "拓界机器人" }).click();
  await expect(page.locator('[data-node-id="tuojie-person-learning"]')).toContainText("林昊");
  await expect(page.locator('[data-node-id="xinglan-person-vla"]')).toHaveCount(0);
  await items.filter({ hasText: "星澜机器人" }).click();
  await expect(page.locator('[data-node-id="xinglan-person-vla"]')).toContainText("赵星羽");
  await expect(page.locator('[data-node-id="tuojie-person-learning"]')).toHaveCount(0);
});

test("公司组织关系画布缩放可重置且移动端不产生页面横向溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/tasks/mapping-embodied?state=gaps");
  await page.getByRole("button", { name: "打开人才地图批次审核", exact: true }).click();
  await page.getByRole("button", { name: "缩小关系画布", exact: true }).click();
  await expect(page.locator(".s3-relationship-controls > span")).toHaveText("90%");
  await page.getByRole("button", { name: "重置关系画布", exact: true }).click();
  await expect(page.locator(".s3-relationship-controls > span")).toHaveText("100%");
  await expectNoHorizontalOverflow(page);
});

test("公司组织梳理检查点使用人才地图交付，不显示其他类型图谱", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied?state=gaps");
  await page.getByRole("button", { name: /^执行计划/ }).click();
  await page.getByRole("button", { name: /相关处理/ }).click();
  await page.getByRole("button", { name: /组织隶属与任职关系/ }).click();
  await expect(page.getByText("目标公司人才地图 · 组织、关键岗位与任职人", { exact: true })).toBeVisible();
  await expect(page.getByText("3 个独立知识图谱 · 本批次增量更新", { exact: true })).toHaveCount(0);
});

test("候选人求职只匹配系统岗位并由猎头本人联系", async ({ page }) => {
  await page.goto("#/tasks/career-linhao");
  await expect(page.getByText("系统内有 3 个岗位值得查看")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "查看完整岗位匹配" }).click();
  await expect(
    page.getByRole("button", { name: /具身智能 VLA 算法负责人/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".s3-match-list strong").first()).toContainText(
    "94",
  );
  await page.getByRole("button", { name: /机器人策略学习技术总监/ }).click();
  await expect(
    page.getByRole("heading", { name: "机器人策略学习技术总监" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /机器人策略学习技术总监/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("推荐理由", { exact: true })).toBeVisible();
  await expect(page.getByText("风险提示", { exact: true })).toBeVisible();
  await expect(page.getByText("建议沟通要点", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回任务并继续" }).click();
  await expect(page.getByText("请由你本人联系林昊")).toBeVisible();
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("已经联系，暂时还没有回复。");
  await input.press("Enter");
  await expect(page.getByText("等待林昊补充反馈")).toBeVisible();
  await expect(page.getByText(/不消耗 Agent 用量/)).toBeVisible();
});

test("候选人求职新简历只触发受影响岗位重匹配", async ({ page }) => {
  await page.goto("#/tasks/career-linhao?state=new-resume");
  await expect(
    page.getByText("新简历已合并，2 个岗位需要重新判断"),
  ).toBeVisible();
  await expect(page.getByText(/没有创建重复候选人档案/)).toBeVisible();
  await expect(page.getByText(/团队规模从 8 人更新为 15 人/)).toBeVisible();
});

test("岗位招聘在入岗位储备后单独确认联系并接收新简历", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=review");
  await page.getByRole("button", { name: /打开候选人审核/ }).click();
  await page.getByRole("button", { name: "加入岗位储备" }).click();
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.fill("给林昊、周明远和陈楚宁发邮件，先了解意愿。");
  await input.press("Enter");
  await expect(page.getByText("确认邮件内容")).toBeVisible();
  await expect(page.getByLabel("主题")).toHaveValue(
    "北京具身智能 VLA 算法负责人机会",
  );
  await page.getByRole("button", { name: "确认并发送" }).click();
  await expect(page.getByText("等待 3 位候选人回复邮件")).toBeVisible();
  await input.fill("林昊回复并发来一份新简历，只考虑北京或远程。");
  await input.press("Enter");
  await expect(
    page.getByText("林昊的新简历已合并并完成局部重匹配"),
  ).toBeVisible();
  await expect(page.getByText(/正式推荐、面试安排/)).toBeVisible();
});

test("岗位招聘无候选人时解释原因且不放宽硬门槛", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=no-candidate");
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
    await page.goto(`#/tasks/${scenario}?state=loading`);
    await expect(page.locator(".s2-workspace-loading")).toBeVisible();
    await page.goto(`#/tasks/${scenario}?state=stream-error`);
    await expect(page.getByText("回复生成中断")).toBeVisible();
    await page.getByRole("button", { name: "继续生成" }).click();
    await expect(page.getByText("回复生成中断")).toHaveCount(0);
    await page.goto(`#/tasks/${scenario}?state=limited`);
    await expect(page.locator(".s2-hunter-reply").filter({ hasText: "只暂停受影响的内部处理" })).toBeVisible();
    await expect(page.getByRole("button", { name: "处理权限" })).toHaveCount(0);
    await page.goto(`#/tasks/${scenario}?state=error`);
    await expect(page.getByRole("alert").filter({ has: page.getByRole("button", { name: "重试失败步骤" }) })).toBeVisible();
    await page.getByRole("button", { name: "重试失败步骤" }).click();
    await expect(page.getByRole("button", { name: "重试失败步骤" })).toHaveCount(0);
  });
}

test("移动端客户联系人和候选人岗位详情可查看并返回", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/tasks/client-xinglan");
  await confirmClientOpportunity(page);
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

test("客户开发邮件草稿使用独立编辑组件且需要逐次确认", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("#/tasks/client-xinglan");
    await confirmClientOpportunity(page);
    await expect(page.getByText("公司与联系人结果可以审核")).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole("button", { name: "打开公司与联系人审核" }).click();
    await page.getByRole("button", { name: "保存审核结果" }).click();
    const request = page.locator(".s2-email-review");
    await expect(request).toBeVisible();
    await expect(request.locator("input")).toHaveCount(3);
    await expect(request.locator("textarea")).toHaveCount(1);
    const layout = await request.evaluate((element) => {
      const container = element.getBoundingClientRect();
      const controls = [...element.querySelectorAll("input, textarea")];
      return {
        overflow: element.scrollWidth - element.clientWidth,
        controls: controls.map((control) => {
          const rect = control.getBoundingClientRect();
          const style = getComputedStyle(control);
          return {
            width: rect.width,
            appearance: style.appearance,
            fontFamily: style.fontFamily,
          };
        }),
        containerWidth: container.width,
      };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    for (const control of layout.controls) {
      expect(control.appearance).toBe("auto");
      expect(control.width).toBeGreaterThan(160);
      expect(control.fontFamily.toLowerCase()).toContain("sans-serif");
    }
    await expect(
      page.getByRole("button", { name: "确认并发送" }),
    ).toBeEnabled();
    await expectNoHorizontalOverflow(page);
  }
});

test("四类业务任务的 Markdown 标题列表引用和表格保持统一渲染", async ({
  page,
}) => {
  const scenarios = [
    ["client-xinglan?state=no-contact", "暂未找到可以直接联系的招聘负责人"],
    ["position-vla?state=no-candidate", "本轮没有候选人通过岗位门禁"],
    ["mapping-embodied?state=conflict", "组织与任职人批次可以审核"],
    ["career-linhao?state=new-resume", "新简历已合并，2 个岗位需要重新判断"],
  ];
  const coveredTags = new Set();

  for (const [route, marker] of scenarios) {
    await page.goto(`#/tasks/${route}`);
    if (route.startsWith("client-")) await confirmClientOpportunity(page);
    await expect(page.getByText(marker)).toBeVisible({ timeout: 10_000 });
    const audit = await page
      .locator(".s2-hunter-reply")
      .evaluateAll((replies) =>
        replies.flatMap((reply) =>
          [...reply.querySelectorAll("h1,h2,h3,h4,p,ul,ol,li,blockquote,table")]
            .filter((element) => {
              const style = getComputedStyle(element);
              return style.display !== "none" && style.visibility !== "hidden";
            })
            .map((element) => {
              const style = getComputedStyle(element);
              return {
                tag: element.tagName.toLowerCase(),
                overflow: element.scrollWidth - element.clientWidth,
                fontFamily: style.fontFamily,
                fontSize: Number.parseFloat(style.fontSize),
              };
            }),
        ),
      );
    expect(audit.length).toBeGreaterThan(0);
    for (const element of audit) {
      coveredTags.add(element.tag);
      expect(element.overflow).toBeLessThanOrEqual(1);
      expect(element.fontFamily.toLowerCase()).toContain("sans-serif");
      expect(element.fontSize).toBeGreaterThanOrEqual(12);
    }
    await expectNoHorizontalOverflow(page);
  }

  for (const tag of ["h2", "p", "ul", "li", "blockquote", "table"]) {
    expect(coveredTags.has(tag), `Markdown ${tag} 应有真实样本覆盖`).toBe(true);
  }
});

test("任务普通回复不再依赖场景专用对话卡片", async ({ page }) => {
  const scenarios = [
    ["client-xinglan?state=reply", "待确认的招聘机会"],
    ["position-vla?state=review", "首批候选人已经可以审核"],
    ["mapping-embodied?state=conflict", "组织与任职人批次可以审核"],
    ["career-linhao?state=new-resume", "新简历已合并"],
  ];

  for (const [route, marker] of scenarios) {
    await page.goto(`#/tasks/${route}`);
    await expect(page.getByText(marker, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.locator('.s2-hunter-reply[data-renderer="markdown"]').first(),
    ).toBeVisible();
    await expect(
      page.locator(
        ".s2-inline-artifact, .s2-evidence-table, .s3-opportunity-summary",
      ),
    ).toHaveCount(0);

    const controlledViolations = await page
      .locator('.s2-hunter-reply[data-renderer="controlled"]')
      .evaluateAll(
        (replies) =>
          replies.filter(
            (reply) =>
              !reply.querySelector(".s2-decision-request") &&
              !reply.querySelector(".s2-review-entry"),
          ).length,
      );
    expect(controlledViolations).toBe(0);
    await expectNoHorizontalOverflow(page);
  }
});
