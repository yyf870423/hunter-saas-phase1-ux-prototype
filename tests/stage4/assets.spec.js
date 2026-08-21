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
  await expect(
    page.getByRole("checkbox", { name: /重点岗位人才/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /VLA 算法负责人/ }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: /VLA 算法负责人/ }).click();
  await page.getByRole("checkbox", { name: /客户项目/ }).click();
  await expect(
    page.getByText("已选 2 个收藏夹", { exact: false }),
  ).toBeVisible();
  await page.locator(".s4-favorite-filter > button").click();
  await page
    .locator(".s4-candidate-filter-chips")
    .getByRole("button", { name: "收藏夹 · 2", exact: false })
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

test("公共筛选浮层不被容器裁切且行业统一使用两级多选", async ({ page }) => {
  await page.goto("#/candidates");
  await page.getByRole("button", { name: "行业", exact: true }).click();
  const cascade = page.locator("body > .s4-cascade-panel");
  await expect(cascade).toBeVisible();
  const search = cascade.getByPlaceholder("搜索行业（跨一级）");
  await search.focus();
  expect(
    await search.evaluate((element) => getComputedStyle(element).boxShadow),
  ).toBe("none");
  const cascadeBox = await cascade.boundingBox();
  expect(cascadeBox.x).toBeGreaterThanOrEqual(0);
  expect(cascadeBox.x + cascadeBox.width).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );

  await page.goto("#/companies");
  await page.getByRole("button", { name: "行业", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "AI/互联网/IT" }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "具身智能与机器人" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("星澜机器人", { exact: true })).toBeVisible();

  await page.goto("#/companies/company-xinglan");
  await page.getByRole("button", { name: "编辑资料" }).click();
  const editor = page.getByRole("dialog", { name: "编辑公司资料" });
  await editor.locator(".s4-cascade > button").click();
  await expect(page.locator("body > .s4-cascade-panel")).toBeVisible();
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
    page.getByRole("heading", { name: "林昊 · 7 项资料建议" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "应用变化" }).click();
  await expect(page.getByText("字段变化已写入候选人档案")).toBeVisible();
});

test("候选人详情覆盖分区编辑、版本变化、沟通和匹配操作", async ({ page }) => {
  await page.goto("#/candidates/candidate-linhao");
  const alertBox = await page
    .locator(".s4-candidate-attention-index")
    .boundingBox();
  const tabsBox = await page.locator(".s4-detail-tabs").boundingBox();
  expect(alertBox.y + alertBox.height).toBeLessThan(tabsBox.y);
  await expect(page.getByRole("button", { name: "身份与合并" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "查看来源与证据" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "编辑当前概览" }).click();
  await expect(
    page.getByRole("dialog", { name: "编辑当前概览" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await page.getByRole("button", { name: "审核资料变化" }).click();
  await expect(page).toHaveURL(/reviews\/fields\/candidate-linhao/);

  await page.goto("#/candidates/candidate-linhao?state=identity-conflict");
  await expect(
    page.getByRole("button", { name: "处理身份冲突" }),
  ).toBeVisible();

  await page.goto("#/candidates/candidate-linhao?tab=files");
  await page.getByRole("button", { name: "查看简历变化" }).click();
  const resumeChanges = page.getByRole("dialog", { name: "查看简历变化" });
  await expect(resumeChanges.getByText("论文成果")).toBeVisible();
  await expect(resumeChanges.getByText("专利成果")).toBeVisible();
  await resumeChanges
    .locator("footer")
    .getByRole("button", { name: "关闭" })
    .click();

  await page.goto("#/candidates/candidate-linhao?tab=timeline");
  await page.getByRole("button", { name: "编辑" }).first().click();
  const editRecord = page.getByRole("dialog", { name: "编辑跟进记录" });
  await editRecord
    .getByLabel("内容")
    .fill("候选人确认下周可以安排一次电话沟通。");
  await editRecord.getByRole("button", { name: "保存修改" }).click();
  await expect(page.getByText("跟进记录已更新")).toBeVisible();
  await page
    .locator(".s4-timeline")
    .getByRole("button", { name: "删除" })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "删除跟进记录" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();

  await page.getByRole("button", { name: "匹配与推进，1 项待处理" }).click();
  await expect(page).toHaveURL(/tab=matching/);
  await expect(
    page.locator(".s4-detail-stack .s4-state-banner").filter({
      hasText: "1 条匹配结果需要更新",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "重新匹配" }).click();
  await expect(
    page.getByRole("dialog", { name: "重新匹配过期结果" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await page.getByRole("button", { name: "匹配岗位" }).click();
  const matching = page.getByRole("dialog", { name: "匹配岗位" });
  await matching.getByRole("button", { name: "开始匹配" }).click();
  await expect(matching.getByText("岗位匹配完成")).toBeVisible();

  await page.goto("#/candidates/candidate-linhao?tab=relations");
  await expect(
    page.getByRole("button", { name: "查看全部证据" }),
  ).toBeVisible();
});

test("候选人来源证据逐项可打开且详情加载状态完整", async ({ page }) => {
  await page.goto("#/sources/candidate-linhao");
  await page.getByRole("button", { name: /工作经历/ }).click();
  await page
    .getByRole("button", { name: /林昊_机器人学习负责人_2026.pdf/ })
    .click();
  await expect(
    page.getByRole("dialog", { name: /林昊_机器人学习负责人_2026.pdf/ }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .locator("footer")
    .getByRole("button", { name: "关闭" })
    .click();
  await page.goto("#/candidates/candidate-linhao?state=loading");
  await expect(page.getByLabel("候选人详情正在加载")).toBeVisible();
  await expect(page.locator(".s4-detail-loading > section")).toHaveCount(2);
});

test("时间相关字段统一使用单触发框时间选择器", async ({ page }) => {
  await page.goto("#/candidates/candidate-linhao");
  await page.getByRole("button", { name: "编辑资料" }).click();
  const basicEditor = page.getByRole("dialog", { name: "编辑基本资料" });
  await basicEditor.getByRole("button", { name: /1989/ }).click();
  const yearPicker = page.getByRole("dialog", {
    name: "选择出生年份时间选择器",
  });
  await expect(yearPicker).toBeVisible();
  await yearPicker.getByRole("button", { name: "1990", exact: true }).click();
  await expect(basicEditor.getByRole("button", { name: /1990/ })).toBeVisible();
  await basicEditor.getByRole("button", { name: "取消" }).click();

  await page.goto("#/candidates/candidate-linhao?tab=experience");
  await page.getByRole("button", { name: "添加经历" }).click();
  const experienceEditor = page.getByRole("dialog", {
    name: "编辑工作经历",
  });
  await experienceEditor
    .getByRole("button", { name: /选择起止时间：2022\.03 - 至今/ })
    .click();
  const rangePicker = page.getByRole("dialog", {
    name: "选择起止时间时间选择器",
  });
  await expect(rangePicker.getByText("开始", { exact: true })).toBeVisible();
  await expect(rangePicker.getByText("结束", { exact: true })).toBeVisible();
  await rangePicker.getByRole("button", { name: /结束/ }).click();
  await expect(
    rangePicker.getByRole("button", { name: "设为至今" }),
  ).toBeVisible();
  await expect(experienceEditor.locator('input[type="date"]')).toHaveCount(0);
  await expect(experienceEditor.locator('input[type="month"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await experienceEditor.getByRole("button", { name: "取消" }).click();

  await page.goto("#/contacts/contact-chenyu?tab=timeline");
  await page.getByRole("button", { name: "添加沟通记录" }).click();
  const contactEditor = page.getByRole("dialog", { name: "添加沟通记录" });
  await contactEditor
    .getByRole("button", { name: /选择发生时间：2026-08-21 14:30/ })
    .click();
  const dateTimePicker = page.getByRole("dialog", {
    name: "选择发生时间时间选择器",
  });
  await expect(dateTimePicker.getByText("选择时间")).toBeVisible();
  await dateTimePicker.getByRole("button", { name: "16:00" }).click();
  await expect(
    contactEditor.getByRole("button", {
      name: /选择发生时间：2026-08-21 16:00/,
    }),
  ).toBeVisible();

  await page.goto("#/papers");
  await page.getByRole("button", { name: "年份", exact: true }).click();
  const yearsPicker = page.getByRole("dialog", { name: "年份时间选择器" });
  await yearsPicker.getByRole("button", { name: "2025", exact: true }).click();
  await yearsPicker.getByRole("button", { name: "2024", exact: true }).click();
  await yearsPicker.getByRole("button", { name: "确定" }).click();
  await expect(page.getByRole("button", { name: /年份 · 2/ })).toBeVisible();
  await expect(page.locator('input[type="date"]')).toHaveCount(0);
  await expect(page.locator('input[type="datetime-local"]')).toHaveCount(0);
});

test("数据管理使用独立导航而不是全局导入按钮", async ({ page }) => {
  await page.goto("#/candidates");
  await expect(
    page.locator(".s1-topbar").getByRole("button", { name: "导入数据" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "打开数据管理" }).click();
  await expect(page).toHaveURL(/data\/imports/);
  await expect(page.getByRole("tab", { name: "数据导入" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("tab", { name: "数据导出" }).click();
  await expect(page).toHaveURL(/data\/exports/);
  await page.getByRole("tab", { name: "回收站" }).click();
  await expect(page).toHaveURL(/recycle-bin/);
});

test("岗位流程、匹配和暂停门禁可以完整操作", async ({ page }) => {
  await page.goto("#/positions/position-vla?tab=pipeline");
  await page.getByRole("button", { name: "移动阶段" }).first().click();
  await expect(page.getByRole("dialog", { name: /移动/ })).toBeVisible();
  const moveModal = page.getByRole("dialog", { name: /移动/ });
  await moveModal.locator(".s4-select > button").click();
  await page.getByRole("button", { name: "二面", exact: true }).click();
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
  await page.getByRole("button", { name: "已暂停", exact: true }).click();
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
  await page
    .getByRole("button", { name: "赵星羽", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/candidates\/candidate-zhaoxingyu/);
});

test("论文和专利列表提供足够的摘要信息", async ({ page }) => {
  await page.goto("#/papers");
  const paperSummaries = page.locator(".s4-academic-summary");
  await expect(paperSummaries).toHaveCount(4);
  expect((await paperSummaries.first().textContent()).length).toBeGreaterThan(
    70,
  );
  await expect(page.locator(".s4-tag-overflow").first()).toHaveText("+1");
  await page.locator(".s4-tag-overflow").first().hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await expect(
    page.locator(".s4-page-header").getByRole("button", { name: /导入/ }),
  ).toHaveCount(0);

  await page.goto("#/patents");
  const patentSummaries = page.locator(".s4-academic-summary");
  await expect(patentSummaries).toHaveCount(3);
  expect((await patentSummaries.first().textContent()).length).toBeGreaterThan(
    60,
  );
  expect(
    await patentSummaries
      .first()
      .evaluate((element) => getComputedStyle(element).webkitLineClamp),
  ).toBe("3");
  const firstVisibleTagBox = await page
    .locator(".s4-academic-list article")
    .first()
    .locator(".s4-tag-list > .s4-tag")
    .first()
    .boundingBox();
  const firstOverflowTagBox = await page
    .locator(".s4-academic-list article")
    .first()
    .locator(".s4-tag-overflow")
    .boundingBox();
  expect(Math.abs(firstVisibleTagBox.y - firstOverflowTagBox.y)).toBeLessThan(
    2,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await patentSummaries.first().hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "面向多任务机器人的操作策略训练方法",
  );
  await expect(page.getByRole("tooltip")).toHaveCSS(
    "background-color",
    "rgba(255, 255, 255, 0.98)",
  );
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole("button", { name: "专利类型", exact: true }).click();
  await page.getByRole("button", { name: "实用新型", exact: true }).click();
  await expect(page.getByText("灵巧手关节传动机构及机器人")).toBeVisible();
  await expect(
    page.getByText("一种面向多任务机器人的操作策略训练方法"),
  ).toHaveCount(0);
});

test("Tooltip 只服务截断文本和隐藏标签且 Tab 使用统一组件", async ({
  page,
}) => {
  for (const route of [
    "#/home",
    "#/tasks",
    "#/signals",
    "#/candidates",
    "#/candidates/candidate-linhao",
    "#/data/imports",
  ]) {
    await page.goto(route);
    await expect(page.locator("[title]")).toHaveCount(0);
    await expect(page.locator("svg > title")).toHaveCount(0);
    await expect(page.locator('[role="tablist"]:not(.app-tabs)')).toHaveCount(
      0,
    );
    await expect(
      page.locator('.app-tabs button:not([role="tab"])'),
    ).toHaveCount(0);
  }

  await page.goto("#/candidates");
  const shortText = page.locator('td[data-label="地点"] .s4-tooltip').first();
  await expect(shortText).not.toHaveAttribute("tabindex", "0");
  await shortText.hover();
  await expect(page.getByRole("tooltip")).toHaveCount(0);

  await page.goto("#/patents");
  const summaries = page.locator(".s4-academic-summary");
  const longSummaryMetrics = await summaries.first().evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(longSummaryMetrics.scrollHeight).toBeGreaterThan(
    longSummaryMetrics.clientHeight,
  );
  await summaries.first().hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.mouse.move(10, 10);
  await page.goto("#/mappings");
  const untruncatedSummary = page.locator(".s4-landscape-goal").nth(1);
  const shortSummaryMetrics = await untruncatedSummary.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(shortSummaryMetrics.scrollHeight).toBeLessThanOrEqual(
    shortSummaryMetrics.clientHeight + 1,
  );
  await expect(untruncatedSummary).not.toHaveAttribute("tabindex", "0");
  await untruncatedSummary.hover();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.goto("#/patents");
  await page
    .locator(".s4-academic-list article")
    .first()
    .locator(".s4-tag-list > .s4-tag")
    .first()
    .hover();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.locator(".s4-tag-overflow").first().hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveCSS("border-radius", "6px");
  await expect(page.getByRole("tooltip")).toHaveCSS(
    "border-left-color",
    "rgb(229, 231, 235)",
  );

  await page.goto("#/tasks");
  const activeTab = page.locator(
    '.app-tabs [role="tab"][aria-selected="true"]',
  );
  await expect(activeTab).toBeVisible();
  const activeTabStyle = await activeTab.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      borderBottomWidth: style.borderBottomWidth,
      borderBottomColor: style.borderBottomColor,
      backgroundColor: style.backgroundColor,
      fontWeight: Number(style.fontWeight),
    };
  });
  expect(activeTabStyle.borderBottomWidth).toBe("3px");
  expect(activeTabStyle.borderBottomColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(activeTabStyle.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(activeTabStyle.fontWeight).toBeGreaterThanOrEqual(700);

  await page.goto("#/signals");
  const signalFeedBox = await page.locator(".s2-signal-feed").boundingBox();
  const signalPaneBox = await page
    .locator(".s2-signal-list-pane")
    .boundingBox();
  expect(signalFeedBox.width).toBeLessThanOrEqual(signalPaneBox.width + 1);
});

test("所有业务资产的同组标签保持统一间距", async ({ page }) => {
  for (const route of [
    "#/candidates",
    "#/positions",
    "#/companies",
    "#/contacts",
    "#/papers",
    "#/patents",
  ]) {
    await page.goto(route);
    const groups = await page.locator(".s4-tag-list").evaluateAll((lists) =>
      lists.map((list) => {
        const style = getComputedStyle(list);
        const children = Array.from(list.children).map((element) =>
          element.getBoundingClientRect(),
        );
        const horizontalGaps = children.slice(1).flatMap((rect, index) => {
          const previous = children[index];
          return Math.abs(rect.top - previous.top) < 1
            ? [rect.left - previous.right]
            : [];
        });
        return {
          columnGap: Number.parseFloat(style.columnGap),
          rowGap: Number.parseFloat(style.rowGap),
          horizontalGaps,
        };
      }),
    );
    expect(groups.length, `${route} 应显示标签组`).toBeGreaterThan(0);
    for (const group of groups) {
      expect(group.columnGap).toBe(8);
      expect(group.rowGap).toBe(6);
      for (const gap of group.horizontalGaps) expect(gap).toBeGreaterThan(7);
    }
  }
});

test("论文作者与机构紧凑展示并支持查看全部作者", async ({ page }) => {
  await page.goto("#/papers/paper-vla-survey");
  const people = page.locator(".s4-academic-people").first();
  await expect(
    people.locator(":scope > .s4-authorship-list article"),
  ).toHaveCount(5);
  await expect(
    people.getByText("Tuojie Robotics", { exact: true }),
  ).toBeVisible();
  await expect(
    people.getByText("Shanghai AI Laboratory", { exact: true }),
  ).toBeVisible();
  const more = people.getByRole("button", { name: /还有 15 位作者/ });
  await expect(more).toBeVisible();
  await more.click();
  const remaining = page.getByRole("dialog", { name: "其余作者" });
  await expect(remaining).toBeVisible();
  await expect(remaining.locator(".s4-authorship-list article")).toHaveCount(
    15,
  );
  await expect(
    remaining.getByText("Shanghai Jiao Tong University", { exact: true }),
  ).toBeVisible();
  await remaining.getByRole("button", { name: "关闭其余作者" }).click();
  await expect(remaining).toBeHidden();

  const original = page.getByRole("link", { name: /arXiv 原文/ });
  await expect(original).toHaveAttribute("target", "_blank");
  await expect(original).toHaveAttribute(
    "href",
    "https://arxiv.org/abs/2603.01452",
  );
  expect(
    await original.evaluate((element) => getComputedStyle(element).cursor),
  ).toBe("pointer");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/papers/paper-vla-survey");
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: /还有 15 位作者/ }).click();
  const mobilePanel = page.getByRole("dialog", { name: "其余作者" });
  const panelBox = await mobilePanel.boundingBox();
  expect(panelBox.x).toBeGreaterThanOrEqual(8);
  expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(382);
});

test("论文作者身份和专利发明人身份使用同一审核边界", async ({ page }) => {
  await page.goto("#/papers/paper-vla-survey");
  await expect(
    page.getByRole("button", { name: /审核作者身份|审核人物身份/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Yifan Jiang", exact: true }).click();
  const paperModal = page.getByRole("dialog", {
    name: "Yifan Jiang · 作者身份审核",
  });
  await expect(paperModal).toBeVisible();
  await expect(
    paperModal
      .locator(".s4-person-compare-profiles article")
      .first()
      .locator("p"),
  ).toBeVisible();
  await expect(
    paperModal
      .locator(".s4-person-compare-profiles article")
      .first()
      .locator("p"),
  ).toHaveText("Shanghai AI Laboratory");
  await expect(paperModal.getByText("系统疑似候选人")).toBeVisible();
  await expect(
    paperModal
      .locator(".s4-person-compare-profiles h4")
      .filter({ hasText: "蒋一帆" }),
  ).toBeVisible();
  await expect(
    paperModal.locator(".s4-person-compare-profiles article.is-candidate p"),
  ).toHaveText("智源研究院 · 多模态算法研究员");
  for (const group of ["联系方式", "工作经历", "教育经历", "项目与研究经历"])
    await expect(paperModal.getByText(group, { exact: true })).toBeVisible();
  await expect(paperModal.getByText("手机", { exact: true })).toHaveCount(2);
  await expect(paperModal.getByText("邮箱", { exact: true })).toHaveCount(2);
  await expect(paperModal.getByText(/186 \*\*\*\* 3271/)).toBeVisible();
  await expect(
    paperModal.getByText("上海交通大学 · 计算机科学与技术", {
      exact: true,
    }),
  ).toHaveCount(2);
  await expect(paperModal.getByText("具身 VLA 预训练项目")).toBeVisible();
  await expect(paperModal.locator(".s4-person-compare-table")).toHaveCount(0);
  await expect(paperModal.getByText("Wenting He")).toHaveCount(0);
  await expect(
    paperModal.getByRole("button", { name: "选择候选人" }),
  ).toHaveCount(0);
  await expect(paperModal.getByRole("radio")).toHaveCount(0);
  await paperModal.getByRole("button", { name: "确认是同一人并关联" }).click();
  const yifan = page
    .locator(".s4-authorship-list article")
    .filter({ hasText: "Yifan Jiang" });
  await expect(yifan.getByText("已关联", { exact: true })).toBeVisible();
  await yifan.getByRole("button", { name: "Yifan Jiang" }).click();
  await expect(page).toHaveURL(/candidates\/candidate-jiangyifan/);

  await page.goto("#/patents/patent-manipulation");
  await expect(
    page.getByRole("button", { name: /审核发明人身份|审核人物身份/ }),
  ).toHaveCount(0);
  await expect(
    page.locator(".s4-academic-people .s4-authorship-list article"),
  ).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: /还有 .* 位发明人/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "王奕", exact: true }).click();
  const patentModal = page.getByRole("dialog", {
    name: "王奕 · 发明人身份审核",
  });
  await expect(patentModal).toBeVisible();
  await expect(
    patentModal
      .locator(".s4-person-compare-profiles article")
      .first()
      .locator("p"),
  ).toHaveText("星澜机器人（北京）有限公司");
  await expect(
    patentModal.locator(".s4-person-compare-profiles h4"),
  ).toHaveCount(2);
  await expect(
    patentModal.locator(".s4-person-compare-profiles article.is-candidate p"),
  ).toHaveText("星澜机器人 · 机器人学习研究员");
  await expect(
    patentModal.getByText("腾讯 Robotics X · 算法工程师"),
  ).toBeVisible();
  await expect(
    patentModal.getByText("浙江大学 · 控制科学与工程"),
  ).toBeVisible();
  await expect(
    patentModal.getByRole("button", { name: "保留人物线索" }),
  ).toBeVisible();
  await expect(
    patentModal.getByRole("button", { name: "暂不关联" }),
  ).toBeVisible();
  await expect(patentModal.getByText("陈雨")).toHaveCount(0);
  await patentModal.getByRole("button", { name: "保留人物线索" }).click();
  await expect(patentModal).toBeHidden();
  const wangyi = page
    .locator(".s4-authorship-list article")
    .filter({ hasText: "王奕" });
  await expect(wangyi.getByText("人物线索", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/papers/paper-vla-survey");
  await page.getByRole("button", { name: "Yifan Jiang", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Yifan Jiang · 作者身份审核" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("导入、导出和回收站覆盖异步、重名和恢复冲突", async ({ page }) => {
  await page.goto("#/data/imports?type=mapping");
  await expect(page.getByRole("tab", { name: "数据导入" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
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
  await expect(page.getByRole("tab", { name: "数据导出" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
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
  await expect(page.getByRole("tab", { name: "回收站" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const guidance = page.locator(".s4-recycle-guidance");
  const filterBar = page.locator(".s4-filter-bar");
  const guidanceBox = await guidance.boundingBox();
  const filterBox = await filterBar.boundingBox();
  const spacing = filterBox.y - (guidanceBox.y + guidanceBox.height);
  expect(spacing).toBeGreaterThanOrEqual(14);
  await page.getByRole("button", { name: "恢复" }).nth(2).click();
  await expect(
    page.getByRole("dialog", { name: "恢复前需要处理名称冲突" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "审核并合并" }).click();
  await expect(page.getByText("已进入公司身份合并审核")).toBeVisible();
});
