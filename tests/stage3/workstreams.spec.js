import { expect, test } from "@playwright/test";
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
    .locator(".s2-history-list > button")
    .filter({ hasText: "具身智能 VLA 人才摸排" })
    .first()
    .click();
  await expect(page).toHaveURL(/tasks\/mapping-embodied/);
  await expect(
    page.getByRole("heading", { name: "具身智能 VLA 人才摸排" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /林昊职业机会/ }).click();
  await expect(page).toHaveURL(/tasks\/career-linhao/);
  await expect(
    page.getByRole("heading", { name: "林昊职业机会" }),
  ).toBeVisible();
  await page
    .locator(".s2-history-list > button")
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
  await input.fill("陈雨回复：两个岗位正在招聘，稍后补完整 JD。");
  await input.press("Enter");
  await expect(page.getByText("回复已形成一条招聘机会")).toBeVisible();
  await expect(page.getByText("星澜机器人 · 具身智能团队招聘")).toBeVisible();
  await expect(page.getByText(/不足以直接创建正式岗位/)).toBeVisible();
});

test("客户开发没有联系人时展示可执行缺口而不生成虚假联系人", async ({
  page,
}) => {
  await page.goto("#/tasks/client-xinglan?state=no-contact");
  await expect(
    page.getByText("暂未找到可以直接联系的招聘负责人"),
  ).toBeVisible();
  await expect(page.getByText(/不会猜测姓名/)).toBeVisible();
  await page.getByRole("button", { name: /查看已尝试路径/ }).click();
  await expect(
    page.getByRole("heading", { name: "已尝试的联系路径" }),
  ).toBeVisible();
});

test("人才摸排分批审核公司、人物、冲突和待补充信息", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开本批次更新审核" }).click();
  await expect(
    page.getByRole("button", { name: /星澜机器人组织层级补充/ }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: /人物与关系/ }).click();
  await page
    .getByRole("button", { name: /王奕的身份与成果关系待确认/ })
    .click();
  await expect(page.getByText("身份待确认", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认写入王奕身份关系" }).click();
  await expect(
    page.getByRole("button", { name: "重新选择王奕身份关系" }),
  ).toContainText("重新选择");
  await expect(page.getByText("已确认写入", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: /冲突与待补充/ }).click();
  await expect(
    page.getByRole("button", { name: /王奕身份关系冲突/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("button", { name: "重新选择王奕身份关系" }),
  ).toContainText("重新选择");
  await page.getByRole("button", { name: /穹顶智能组织关系待确认/ }).click();
  await page.getByRole("button", { name: "本批次不写入" }).click();
  await page.getByRole("button", { name: "完成审核并返回对话" }).click();
  await expect(page.getByText("本批次审核已经完成")).toBeVisible();
  await expect(
    page.getByText(/1 项待确认内容已按你的决定纳入本批次/),
  ).toBeVisible();
  await page.getByRole("button", { name: /更新已有图谱/ }).click();
  await expect(page.getByText(/已有图谱已经更新/)).toBeVisible();
});

test("人才摸排每条变化显示对应关系影响并保持同一审核决定", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开本批次更新审核" }).click();
  await expect(page.getByRole("tab", { name: /公司与组织/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("button", { name: /星澜机器人组织层级补充/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByText("当前聚焦星澜机器人 · 7 个对象 · 6 条关系"),
  ).toBeVisible();

  await page.getByRole("button", { name: /目标公司生态关系更新/ }).click();
  await expect(
    page.getByRole("button", { name: /目标公司生态关系更新/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByText("5 家公司或机构 · 7 条生态关系 · 2 条待核验"),
  ).toBeVisible();
  await page.locator('[data-edge-id="eco-e2"]').press("Enter");
  await expect(page.getByText("关系方向", { exact: true })).toBeVisible();
  await expect(page.getByText("星澜机器人 → 灵跃科技").first()).toBeVisible();

  await page.getByRole("button", { name: /方向与关键角色覆盖更新/ }).click();
  await expect(
    page.getByText("4 个方向 · 3 类关键角色 · 2 个明确缺口"),
  ).toBeVisible();
  await page.getByRole("button", { name: /近 24 个月人才流动更新/ }).click();
  await expect(
    page.getByText("近 24 个月 · 18 条可核验流动记录 · 4 条主要流向"),
  ).toBeVisible();

  await page.getByRole("tab", { name: /人物与关系/ }).click();
  await page.getByRole("button", { name: /赵星羽的可联系路径补充/ }).click();
  await expect(
    page.getByText("赵星羽 · 2 条可用路径 · 最短 2 段"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /王奕的身份与成果关系待确认/ })
    .click();
  await expect(
    page.getByRole("button", { name: /王奕的身份与成果关系待确认/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByText(/同名身份与论文单位时间线存在冲突/),
  ).toBeVisible();
  await page.getByRole("button", { name: "确认写入王奕身份关系" }).click();
  await expect(
    page.getByRole("button", { name: "重新选择王奕身份关系" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: /冲突与待补充/ }).click();
  await page.getByRole("button", { name: /王奕身份关系冲突/ }).click();
  await expect(
    page.getByRole("button", { name: "重新选择王奕身份关系" }),
  ).toBeVisible();
});

test("人才摸排关系画布缩放可重置且移动端不产生页面横向溢出", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/tasks/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开本批次更新审核" }).click();
  await page.getByRole("button", { name: "缩小关系画布" }).click();
  await expect(page.locator(".s3-relationship-controls > span")).toHaveText(
    "90%",
  );
  await page.getByRole("button", { name: "重置关系画布" }).click();
  await expect(page.locator(".s3-relationship-controls > span")).toHaveText(
    "100%",
  );
  await page.getByRole("tab", { name: /人物与关系/ }).click();
  await page.getByRole("button", { name: /赵星羽的可联系路径补充/ }).click();
  await expect(
    page.getByText("投资关系", { exact: true }).last(),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("相关处理详情使用人才摸排自己的结果去向和检查点", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "执行计划" }).click();
  await page.getByRole("button", { name: /相关处理/ }).click();
  await page.getByRole("button", { name: /人物关系与联系路径/ }).click();
  await expect(
    page.getByText("具身智能 VLA 知识图谱 · 本批次增量更新"),
  ).toBeVisible();
  await expect(page.getByText("人物身份与关系已去重")).toBeVisible();
  await expect(page.getByText("未生成重复候选人记录")).toHaveCount(0);
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
    await expect(page.locator(".s2-permission-state")).toBeVisible();
    await page.getByRole("button", { name: "处理权限" }).click();
    await expect(page.getByText("已打开对应权限处理入口")).toBeVisible();
    await page.goto(`#/tasks/${scenario}?state=error`);
    await expect(page.locator(".s2-local-error")).toBeVisible();
    await page.getByRole("button", { name: "重试失败步骤" }).click();
    await expect(page.locator(".s2-local-error")).toHaveCount(0);
  });
}

test("移动端客户联系人和候选人岗位详情可查看并返回", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/tasks/client-xinglan");
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
    ["mapping-embodied?state=conflict", "人物与关系批次可以审核"],
    ["career-linhao?state=new-resume", "新简历已合并，2 个岗位需要重新判断"],
  ];
  const coveredTags = new Set();

  for (const [route, marker] of scenarios) {
    await page.goto(`#/tasks/${route}`);
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
    ["client-xinglan?state=reply", "回复已形成一条招聘机会"],
    ["position-vla?state=review", "首批候选人已经可以审核"],
    ["mapping-embodied?state=conflict", "人物与关系批次可以审核"],
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
