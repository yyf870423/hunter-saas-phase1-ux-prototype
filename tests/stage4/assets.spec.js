import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

test("候选人列表支持搜索、筛选、列设置和详情跳转", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/candidates");
  for (const heading of [
    "姓名",
    "公司",
    "职位",
    "学历",
    "技能",
    "行业",
    "年限",
    "年龄",
    "地点",
    "流程",
    "操作",
  ]) {
    await expect(
      page.getByRole("columnheader", { name: heading, exact: true }),
    ).toBeVisible();
  }
  for (const filter of [
    "公司",
    "行业",
    "学历",
    "地点",
    "机会情况",
    "流程状态",
    "收藏夹",
  ]) {
    await expect(
      page.getByRole("button", { name: filter, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByLabel("职位筛选")).toBeVisible();
  await expect(page.getByLabel("最低工作年限")).toBeVisible();
  await expect(page.getByLabel("最低年龄")).toBeVisible();
  await expect(page.getByLabel("最高年龄")).toBeVisible();

  await page.getByRole("button", { name: "行业", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "AI/互联网/IT" }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "具身智能与机器人" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "行业 · 1" })).toBeVisible();
  await page.getByRole("button", { name: "行业 · 1" }).click();

  await page.getByRole("button", { name: "收藏夹", exact: true }).click();
  await expect(page.getByRole("radio", { name: /重点岗位人才/ })).toBeVisible();
  await expect(
    page.getByRole("radio", { name: /VLA 算法负责人/ }),
  ).toBeVisible();
  await page.getByRole("radio", { name: /VLA 算法负责人/ }).click();
  await expect(
    page
      .locator(".s4-favorite-filter > button")
      .getByText("VLA 算法负责人", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "收藏夹：VLA 算法负责人", exact: true })
    .click();
  const tableWrap = page.locator(".s4-table-wrap");
  const beforeScroll = await tableWrap.evaluate((element) => {
    const name = element.querySelector("th.s4-data-col-name");
    const actions = element.querySelector("th.s4-actions-cell");
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      nameLeft: name.getBoundingClientRect().left,
      actionsRight: actions.getBoundingClientRect().right,
    };
  });
  expect(beforeScroll.scrollWidth).toBeGreaterThan(beforeScroll.clientWidth);
  const degreeTones = await page
    .locator("td.s4-data-col-education .s4-tag")
    .evaluateAll((tags) => [...new Set(tags.map((tag) => tag.className))]);
  expect(degreeTones.some((value) => value.includes("s4-tag-violet"))).toBe(
    true,
  );
  expect(degreeTones.some((value) => value.includes("s4-tag-info"))).toBe(true);
  for (const key of ["skills", "industries"]) {
    const hasTruncatedTag = await page
      .locator(`td.s4-data-col-${key} .s4-tag`)
      .evaluateAll((tags) =>
        tags.some((tag) => tag.scrollWidth > tag.clientWidth + 1),
      );
    expect(hasTruncatedTag).toBe(false);
  }
  const pagination = page.getByRole("navigation", { name: "分页" });
  await pagination.getByRole("button", { name: "2", exact: true }).click();
  await expect(
    page.locator("td.s4-data-col-education .s4-tag-success").first(),
  ).toBeVisible();
  await pagination.getByRole("button", { name: "1", exact: true }).click();
  await tableWrap.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  const afterScroll = await tableWrap.evaluate((element) => {
    const name = element.querySelector("th.s4-data-col-name");
    const actions = element.querySelector("th.s4-actions-cell");
    return {
      scrollLeft: element.scrollLeft,
      nameLeft: name.getBoundingClientRect().left,
      actionsRight: actions.getBoundingClientRect().right,
    };
  });
  expect(afterScroll.scrollLeft).toBeGreaterThan(0);
  expect(Math.abs(afterScroll.nameLeft - beforeScroll.nameLeft)).toBeLessThan(
    4,
  );
  expect(
    Math.abs(afterScroll.actionsRight - beforeScroll.actionsRight),
  ).toBeLessThan(4);
  await page.getByPlaceholder(/搜索姓名/).fill("林昊");
  await expect(
    page.getByRole("button", { name: /林昊/ }).first(),
  ).toBeVisible();
  await expect(page.getByText("赵星羽")).toHaveCount(0);

  await page.getByRole("button", { name: "公司" }).click();
  await page
    .locator(".s4-select-panel")
    .getByRole("button", { name: "拓界机器人" })
    .click();
  await page.keyboard.press("Escape");
  await page.getByLabel("设置显示列").click();
  await page.getByRole("checkbox", { name: "学历" }).click();
  await page.keyboard.press("Escape");

  await page
    .locator("tbody .s4-select-cell")
    .getByRole("checkbox")
    .first()
    .click();
  await page.getByRole("button", { name: "加入收藏夹" }).click();
  const favoriteModal = page.getByRole("dialog", { name: "加入收藏夹" });
  await expect(favoriteModal).toBeVisible();
  await favoriteModal
    .getByRole("button", { name: "展开VLA 算法负责人" })
    .click();
  await favoriteModal.getByRole("checkbox", { name: /优先联系/ }).click();
  await favoriteModal.getByRole("checkbox", { name: /星澜机器人/ }).click();
  await favoriteModal.getByRole("button", { name: "确认加入" }).click();
  await expect(page.getByText(/已将 1 位候选人加入 2 个收藏夹/)).toBeVisible();

  await page.getByRole("button", { name: /林昊/ }).first().click();
  await expect(page).toHaveURL(/#\/candidates\/candidate-linhao$/);
  await expect(page.getByRole("heading", { name: "林昊" })).toBeVisible();
  await page.getByRole("tab", { name: /简历与文件/ }).click();
  await expect(page.getByText("林昊_机器人学习负责人_2026.pdf")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await assertNoConsoleErrors();
});

test("候选人新建、身份合并和字段审核覆盖关键门禁", async ({ page }) => {
  await page.goto("#/candidates/new");
  await page.getByRole("button", { name: "创建候选人" }).click();
  await expect(page.getByText("请输入候选人姓名")).toBeVisible();
  await page.getByPlaceholder("例如：林昊").fill("林昊");
  await page.getByRole("button", { name: "创建候选人" }).click();
  await expect(page.getByText("资料不足，不能创建正式候选人")).toBeVisible();

  await page.goto("#/reviews/identity/candidate-linhao");
  await expect(
    page.getByRole("heading", { name: "林昊 · 新简历资料合并" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /确认合并/ }).click();
  await expect(page.getByText(/合并已完成|已合并/)).toBeVisible();

  await page.goto("#/reviews/fields/candidate-linhao");
  await expect(
    page.getByRole("heading", { name: "林昊 · 3 项资料建议" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "应用变化" }).click();
  await expect(page.getByText("字段变化已写入候选人档案")).toBeVisible();
});

test("岗位流程、匹配和暂停门禁可以完整操作", async ({ page }) => {
  await page.goto("#/positions/position-vla?tab=pipeline");
  await page.getByRole("button", { name: "移动阶段" }).first().click();
  await expect(page.getByRole("dialog", { name: /移动/ })).toBeVisible();
  const moveModal = page.getByRole("dialog", { name: /移动/ });
  await moveModal.locator(".s4-select > button").click();
  await moveModal.getByRole("button", { name: "二面", exact: true }).click();
  await page.getByRole("button", { name: "确认移动" }).click();
  await expect(page.getByText(/已移动到“二面”/)).toBeVisible();

  await page.getByRole("tab", { name: /匹配结果/ }).click();
  await expect(page.getByText("综合分")).toBeVisible();
  await page.getByRole("button", { name: /周明远/ }).click();
  await expect(
    page.getByText("有条件匹配", { exact: true }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "编辑" }).click();
  const modal = page.getByRole("dialog", { name: "编辑岗位资料" });
  await modal.getByRole("button", { name: "招聘状态" }).click();
  await modal.getByRole("button", { name: "已暂停", exact: true }).click();
  await expect(modal.getByText(/暂时不能保存/)).toBeVisible();
  await expect(modal.getByRole("button", { name: "保存修改" })).toBeDisabled();
});

test("公司文件草稿、联系人和招聘机会形成岗位交互闭环", async ({ page }) => {
  await page.goto("#/companies/company-xinglan?state=draft");
  await expect(page.getByText("文件解析结果等待确认")).toBeVisible();
  await page.getByRole("button", { name: "编辑草稿" }).click();
  const editor = page.getByRole("dialog", { name: "编辑公司资料" });
  await editor.getByLabel("公司名称").fill("星澜机器人科技有限公司");
  await editor.getByRole("button", { name: "保存修改" }).click();

  await page.goto("#/contacts/contact-chenyu?tab=timeline");
  await page.getByRole("button", { name: "添加沟通记录" }).click();
  await page.getByLabel("沟通内容").fill("客户确认下周安排候选人技术面。 ");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("沟通记录已添加")).toBeVisible();

  await page.goto("#/opportunities/opportunity-xinglan?tab=directions");
  await page.getByRole("button", { name: "形成岗位" }).first().click();
  await expect(page.getByRole("dialog", { name: /形成岗位/ })).toBeVisible();
  await page.getByRole("button", { name: "确认创建岗位" }).click();
  await expect(page.getByText("岗位已创建并关联到招聘机会")).toBeVisible();
});

test("人才版图多视图、关系详情与写入决定可用", async ({ page }) => {
  await page.goto("#/mappings/mapping-embodied?tab=people");
  await expect(page.getByRole("heading", { name: "人物与关系" })).toBeVisible();
  await page.getByRole("tab", { name: "人物关系" }).click();
  await page.locator(".s3-relationship-node").first().click();
  await expect(page.locator(".s3-relationship-detail")).toBeVisible();
  const decision = page.getByRole("button", { name: /确认写入/ });
  if (await decision.count()) {
    await decision.first().click();
    await expect(page.getByText("已确认写入")).toBeVisible();
  }
  await expectNoHorizontalOverflow(page);
});

test("阶段四次级控件不是装饰按钮", async ({ page }) => {
  await page.goto("/#/mappings");
  await page.getByRole("button", { name: "更多操作" }).first().click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("button", { name: "编辑版图" })).toBeVisible();

  await page.goto("/#/sources/candidate-linhao");
  await page.getByRole("button", { name: /团队规模/ }).click();
  await expect(page.getByText("团队规模：18 人")).toBeVisible();

  await page.goto("/#/patents/patent-manipulation");
  await page.getByRole("button", { name: "查看", exact: true }).first().click();
  await expect(page).toHaveURL(/candidates\/candidate-linhao/);
});

test("论文和专利列表提供足够的摘要信息", async ({ page }) => {
  await page.goto("#/papers");
  const paperSummaries = page.locator(".s4-academic-summary");
  await expect(paperSummaries).toHaveCount(4);
  expect((await paperSummaries.first().textContent()).length).toBeGreaterThan(
    70,
  );
  await expect(
    page.locator(".s4-page-header").getByRole("button", { name: /导入/ }),
  ).toHaveCount(0);

  await page.goto("#/patents");
  const patentSummaries = page.locator(".s4-academic-summary");
  await expect(patentSummaries).toHaveCount(3);
  expect((await patentSummaries.first().textContent()).length).toBeGreaterThan(
    60,
  );
});

test("论文作者身份和专利发明人身份使用同一审核边界", async ({ page }) => {
  await page.goto("#/papers/paper-vla-survey");
  await page.getByRole("button", { name: "审核作者身份" }).click();
  const paperModal = page.getByRole("dialog", { name: "作者人物身份审核" });
  await expect(paperModal).toBeVisible();
  await paperModal
    .getByRole("radio", { name: /保留为人物线索/ })
    .first()
    .click();
  await paperModal.getByRole("button", { name: "保存身份关系" }).click();

  await page.goto("#/patents/patent-manipulation");
  await page
    .getByRole("button", { name: "审核发明人身份", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "发明人人物身份审核" }),
  ).toBeVisible();
});

test("导入、导出和回收站覆盖异步、重名和恢复冲突", async ({ page }) => {
  await page.goto("#/data/imports?type=mapping");
  await expect(
    page
      .getByRole("button", { name: "新建导入" })
      .locator('[data-icon="download"]'),
  ).toBeVisible();
  const modal = page.getByRole("dialog", { name: "导入业务数据" });
  await modal.locator('input[type="file"]').setInputFiles({
    name: "具身智能 VLA 核心人才版图.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from("prototype"),
  });
  await modal.getByRole("button", { name: "校验并解析" }).click();
  await expect(
    page.getByRole("dialog", { name: "发现同名人才版图" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: /保留两张版图/ }).click();
  await page.getByRole("button", { name: "确认导入" }).click();
  await expect(
    page.getByText("导入任务已创建", { exact: true }).first(),
  ).toBeVisible();

  await page.goto("#/data/exports");
  await expect(
    page
      .getByRole("button", { name: "新建导出" })
      .locator('[data-icon="upload"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "新建导出" }).click();
  await page.getByLabel("文件名称").fill("候选人完整导出");
  await page.getByRole("button", { name: "开始生成" }).click();
  await expect(page.getByText("导出任务已创建")).toBeVisible();

  await page.goto("#/recycle-bin");
  await page.getByRole("button", { name: "恢复" }).nth(2).click();
  await expect(
    page.getByRole("dialog", { name: "恢复前需要处理名称冲突" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "审核并合并" }).click();
  await expect(page.getByText("已进入公司身份合并审核")).toBeVisible();
});
