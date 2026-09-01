import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

async function expectVisibleGraphNodesDoNotOverlap(page) {
  const overlaps = await page
    .locator(".tg-node:visible")
    .evaluateAll((nodes) => {
      const boxes = nodes.map((node) => ({
        label: node.textContent.trim(),
        box: node.getBoundingClientRect(),
      }));
      return boxes.flatMap((left, leftIndex) =>
        boxes.slice(leftIndex + 1).flatMap((right) => {
          const separated =
            left.box.right <= right.box.left ||
            right.box.right <= left.box.left ||
            left.box.bottom <= right.box.top ||
            right.box.bottom <= left.box.top;
          return separated ? [] : [`${left.label} / ${right.label}`];
        }),
      );
    });
  expect(overlaps).toEqual([]);
}

test("知识图谱支持真实拖动、跨图页搜索和画布表格切换", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?tab=content&page=organization");
  await expect(
    page.getByRole("heading", { name: "具身智能 VLA 知识图谱" }),
  ).toBeVisible();

  const node = page.locator(".tg-node", { hasText: "星澜机器人" }).first();
  const before = await node.boundingBox();
  expect(before).not.toBeNull();
  await node.hover();
  await page.mouse.down();
  await page.mouse.move(
    before.x + before.width / 2 + 86,
    before.y + before.height / 2 + 48,
    {
      steps: 8,
    },
  );
  await page.mouse.up();
  const after = await node.boundingBox();
  expect(after.x).toBeGreaterThan(before.x + 50);
  await expectVisibleGraphNodesDoNotOverlap(page);

  await page.getByLabel("搜索知识图谱").fill("拓界机器人");
  await page
    .getByRole("button", { name: /具身智能公司生态 · 拓界机器人/ })
    .click();
  await expect(page.locator(".tg-page-strip span.is-active")).toContainText(
    "具身智能公司生态",
  );
  await expect(
    page.locator(".tg-node.is-focused", { hasText: "拓界机器人" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "层级表格" }).click();
  await expect(
    page.getByRole("columnheader", { name: "一级节点" }),
  ).toBeVisible();
  await expect(page.locator(".tg-detail-panel")).toHaveCount(0);
  await expect(page.locator(".tg-graph-main")).toHaveClass(/is-detail-closed/);
  await expect(page.getByRole("button", { name: "添加关系" })).toBeVisible();
  await expect(page.getByRole("button", { name: "退出连线" })).toHaveCount(0);
  const hierarchyScroll = page.getByTestId("topic-graph-table-scroll");
  await expect(hierarchyScroll).toBeVisible();
  await expect(page.getByRole("slider")).toHaveCount(0);
  const dimensions = await hierarchyScroll.evaluate((element) => ({
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
    scrollHeight: element.scrollHeight,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
  const activeScrollAreas = await page.locator(".tg-table-view").evaluate(
    (container) =>
      [...container.querySelectorAll("*")].filter((element) => {
        const style = window.getComputedStyle(element);
        const canScroll = /(auto|scroll)/.test(
          `${style.overflow} ${style.overflowX} ${style.overflowY}`,
        );
        return (
          canScroll &&
          (element.scrollWidth > element.clientWidth ||
            element.scrollHeight > element.clientHeight)
        );
      }).length,
  );
  expect(activeScrollAreas).toBe(1);

  await hierarchyScroll.hover();
  const initialTop = await hierarchyScroll.evaluate(
    (element) => element.scrollTop,
  );
  await page.mouse.wheel(0, 180);
  await expect
    .poll(() => hierarchyScroll.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(initialTop);
  const initialLeft = await hierarchyScroll.evaluate(
    (element) => element.scrollLeft,
  );
  await page.keyboard.down("Shift");
  await page.mouse.wheel(0, 260);
  await page.keyboard.up("Shift");
  await expect
    .poll(() => hierarchyScroll.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(initialLeft);
  const shiftedLeft = await hierarchyScroll.evaluate(
    (element) => element.scrollLeft,
  );
  await page.mouse.wheel(0, 160);
  await expect
    .poll(() => hierarchyScroll.evaluate((element) => element.scrollLeft))
    .toBe(shiftedLeft);
  await expect(page.getByRole("button", { name: /拓界机器人/ })).toBeVisible();
  await page
    .getByRole("button", { name: /拓界机器人/ })
    .first()
    .click();
  await expect(page.locator(".tg-detail-panel")).toBeVisible();
  await page.getByRole("button", { name: "关闭详情" }).click();
  await expect(page.locator(".tg-detail-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "画布" }).click();
  await expect(page.locator(".tg-canvas-frame")).toBeVisible();
  await expect(page.locator(".tg-detail-panel")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  assertNoConsoleErrors();
});

test("知识图谱缩小后可继续扩展画布且节点信息保持完整", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?tab=content&page=organization");
  await page.getByRole("button", { name: "关闭详情" }).click();

  const linkedNode = page.locator(".tg-node", { hasText: "赵星羽" }).first();
  await expect(linkedNode.locator(".tg-node-title")).toHaveText("赵星羽");
  await expect(linkedNode.locator(".tg-node-subtitle")).toHaveText(
    "VLA 算法负责人",
  );
  await expect(linkedNode.locator(".tg-node-asset")).toHaveText(
    "已关联 · 候选人",
  );

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "缩小", exact: true }).click();
  }
  await expect(page.locator(".tg-zoom-controls > button").nth(1)).toHaveText(
    "50%",
  );
  const relationshipLabels = page.locator(".tg-edge-label-button");
  expect(await relationshipLabels.count()).toBeGreaterThan(0);
  const renderedRelationshipNames = await relationshipLabels
    .locator("text")
    .allTextContents();
  expect(
    renderedRelationshipNames.every((name) => name.trim().length > 0),
  ).toBe(true);

  const before = await linkedNode.boundingBox();
  expect(before).not.toBeNull();
  await page.mouse.move(
    before.x + before.width / 2,
    before.y + before.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    before.x + before.width / 2 + 390,
    before.y + before.height / 2 + 110,
    { steps: 12 },
  );
  await page.mouse.up();

  const logicalLeft = await linkedNode.evaluate((element) =>
    Number.parseFloat(element.style.left),
  );
  expect(logicalLeft).toBeGreaterThan(1240);
  const logicalCanvasWidth = await page
    .locator(".tg-canvas-stage")
    .evaluate((element) => Number.parseFloat(element.style.width));
  expect(logicalCanvasWidth).toBeGreaterThan(1600);
  await expect(linkedNode.locator(".tg-node-subtitle")).toBeVisible();
  await expect(linkedNode.locator(".tg-node-asset")).toBeVisible();
  await expectVisibleGraphNodesDoNotOverlap(page);

  const stage = page.locator(".tg-canvas-stage");
  const transformBeforePan = await stage.evaluate(
    (element) => element.style.transform,
  );
  const canvas = page.locator(".tg-canvas-scroll");
  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();
  await page.mouse.move(canvasBox.x + 28, canvasBox.y + 28);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 128, canvasBox.y + 98, { steps: 8 });
  await page.mouse.up();
  const transformAfterPan = await stage.evaluate(
    (element) => element.style.transform,
  );
  expect(transformAfterPan).not.toBe(transformBeforePan);
  assertNoConsoleErrors();
});

test("图页导入、同名处理、智能分析和审核可操作", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?panel=import");
  await expect(page.getByRole("dialog", { name: "导入图页" })).toBeVisible();
  await page.getByRole("button", { name: /使用演示文件验收/ }).click();
  await page.getByRole("button", { name: "校验并预览" }).click();
  await expect(page.getByText("发现同名图页")).toBeVisible();
  await page.getByRole("button", { name: /替换现有图页/ }).click();
  await page.getByRole("button", { name: "确认导入" }).click();
  await expect(page.getByText("图页已经可以查看")).toBeVisible();
  await page.getByRole("button", { name: "查看图页" }).click();
  await expect(page.getByText("正在分析节点与连线关系")).toBeVisible();

  await page.goto("#/mappings/mapping-embodied?tab=reviews");
  await expect(page.getByText("AI 建议")).toBeVisible();
  await page.getByRole("button", { name: "论文作者单位 · 2025-11" }).click();
  const evidenceDialog = page.getByRole("dialog", { name: "来源与证据" });
  await expect(evidenceDialog).toBeVisible();
  await expect(page.getByText("证据摘录")).toBeVisible();
  await evidenceDialog
    .locator("footer")
    .getByRole("button", { name: "关闭", exact: true })
    .click();
  await page.getByRole("button", { name: "作为本图备注保留" }).click();
  await expect(page.locator(".tg-review-list > button")).toHaveCount(2);
  assertNoConsoleErrors();
});

test("图页导入与分析异常均可恢复且不产生半成品", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?panel=import&case=unsupported");
  await expect(page.getByText("不支持该文件格式")).toBeVisible();
  await expect(page.getByRole("button", { name: "校验并预览" })).toBeDisabled();

  await page.goto("#/mappings/mapping-embodied?panel=import&case=corrupt");
  await expect(page.getByText("文件无法读取")).toBeVisible();
  await expect(page.getByText(/没有产生任何半成品图页/)).toBeVisible();

  await page.goto("#/mappings/mapping-embodied?panel=import&case=multi-root");
  await expect(page.getByText("文件中没有共同的第一层结构")).toBeVisible();
  const importBox = await page
    .getByRole("dialog", { name: "确认图页结构" })
    .boundingBox();
  expect(importBox.width).toBeGreaterThan(960);
  await expect(page.getByText("将新建图页", { exact: true })).toHaveCount(3);
  await expect(page.getByText("具身智能产业链", { exact: true })).toBeVisible();

  await page.goto("#/mappings/mapping-embodied?panel=import&case=partial");
  await expect(page.getByText("2 个节点只能保留原文")).toBeVisible();

  await page.goto("#/mappings/mapping-embodied?state=analysis-error");
  await expect(page.getByText("智能分析未完成")).toBeVisible();
  await page.getByRole("button", { name: "重新分析" }).click();
  await expect(page.getByText("正在分析节点与连线关系")).toBeVisible();
  assertNoConsoleErrors();
});

test("空图谱、图谱内 AI、版本预览与关联入口有完整路径", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/graph-empty");
  await expect(page.getByText("还没有图页")).toBeVisible();
  await page.getByRole("button", { name: "创建空白图页" }).click();
  await page.getByLabel("图页名称").fill("产业链关系");
  await page.getByRole("button", { name: "创建图页" }).click();
  await expect(page.getByRole("button", { name: /产业链关系/ })).toBeVisible();

  await page.goto("#/mappings/mapping-embodied?panel=ai");
  await expect(page.getByText("资产内 AI 协作 · 不进入任务列表")).toBeVisible();
  await page.getByRole("button", { name: "应用可信变化" }).click();
  await expect(
    page.getByText("3 项可信变化已写入当前图页，1 项待确认"),
  ).toBeVisible();

  await page.goto("#/mappings/mapping-embodied?tab=history");
  await expect(
    page.getByRole("heading", { name: "v12 当时视图" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".tg-history-preview-canvas")).toBeVisible();
  await expect(page.getByLabel("搜索知识图谱")).toBeVisible();
  await page.getByLabel("搜索知识图谱").fill("赵星羽");
  await page
    .locator(".tg-search-results > button", { hasText: "赵星羽" })
    .click();
  await expect(
    page.locator(".tg-detail-panel").getByRole("heading", { name: "赵星羽" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭详情" }).click();

  const initialZoomLabel = await page
    .locator(".tg-history-viewer-toolbar .tg-zoom-controls > button")
    .nth(1)
    .textContent();
  await page.getByRole("button", { name: "放大历史图谱" }).click();
  await expect(
    page
      .locator(".tg-history-viewer-toolbar .tg-zoom-controls > button")
      .nth(1),
  ).not.toHaveText(initialZoomLabel);

  await page.locator(".tg-history-preview-canvas .tg-edge-hit").first().click({
    force: true,
  });
  await expect(
    page.locator(".tg-detail-panel").getByRole("heading", {
      name: "下属组织",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭详情" }).click();
  const historyStage = page.locator(
    ".tg-history-preview-canvas .tg-canvas-stage",
  );
  const transformBeforePan = await historyStage.evaluate(
    (element) => element.style.transform,
  );
  const historyCanvas = page.locator(
    ".tg-history-preview-canvas .tg-canvas-scroll",
  );
  await historyCanvas.scrollIntoViewIfNeeded();
  const historyCanvasBox = await historyCanvas.boundingBox();
  const viewport = page.viewportSize();
  expect(historyCanvasBox).not.toBeNull();
  const panStartY = Math.min(
    historyCanvasBox.y + historyCanvasBox.height - 24,
    viewport.height - 24,
  );
  await page.mouse.move(historyCanvasBox.x + 24, panStartY);
  await page.mouse.down();
  await page.mouse.move(historyCanvasBox.x + 96, panStartY - 34, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(() => historyStage.evaluate((element) => element.style.transform))
    .not.toBe(transformBeforePan);
  const historyColumnWidth = await page
    .locator(".tg-history-layout > section")
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(historyColumnWidth).toBeGreaterThanOrEqual(340);
  await page.getByRole("button", { name: /v11/ }).click();
  await expect(
    page.getByRole("heading", { name: "v11 当时视图" }),
  ).toBeVisible();
  const historyBadges = page.locator(
    ".tg-history-layout > section > button > .s1-status",
  );
  await expect(historyBadges).toHaveCount(3);
  for (let index = 0; index < (await historyBadges.count()); index += 1) {
    const badge = historyBadges.nth(index);
    const geometry = await badge.evaluate((element) => {
      const dot = element.querySelector("i").getBoundingClientRect();
      const label = element.querySelector("span").getBoundingClientRect();
      const box = element.getBoundingClientRect();
      return {
        height: box.height,
        centerDelta: Math.abs(
          dot.top + dot.height / 2 - (label.top + label.height / 2),
        ),
      };
    });
    expect(geometry.height).toBeLessThanOrEqual(24);
    expect(geometry.centerDelta).toBeLessThanOrEqual(1.5);
  }
  await page.goto("#/mappings/mapping-embodied?panel=hidden");
  await expect(page.getByText("李青", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "恢复" }).click();
  await expect(page.locator(".tg-node", { hasText: "李青" })).toBeVisible();
  await page.goto("#/mappings/mapping-embodied");
  await expect(page.getByRole("tab", { name: "关联业务" })).toHaveCount(0);
  assertNoConsoleErrors();
});

test("空图谱可通过自然语言生成标题并启动整理", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/graph-empty");
  await page.getByRole("button", { name: /让 AI 整理图页/ }).click();
  const dialog = page.getByRole("dialog", { name: "AI 整理新图页" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "生成整理计划" }).click();
  await expect(
    page.getByRole("dialog", { name: "确认 AI 整理目标" }),
  ).toBeVisible();
  await page.getByLabel("AI 提炼的图页标题").fill("新能源机器人产业与人才");
  await page.getByRole("button", { name: "创建图页并开始整理" }).click();
  await expect(
    page.getByRole("button", { name: /新能源机器人产业与人才/ }),
  ).toBeVisible();
  await expect(page.getByText("正在分析节点与连线关系")).toBeVisible();
  assertNoConsoleErrors();
});

test("同一图谱只允许一个导入或整理任务运行", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?state=analyzing");
  await expect(page.getByText("正在分析节点与连线关系")).toBeVisible();
  await page.getByRole("button", { name: "AI 整理" }).click();
  await expect(
    page.getByRole("dialog", { name: "当前图谱已有整理任务" }),
  ).toBeVisible();
  await expect(page.getByText(/同一时间只能运行一个/)).toBeVisible();
  assertNoConsoleErrors();
});

test("图谱卡片支持拖动排序并持久化", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings");
  await page.evaluate(() =>
    window.localStorage.removeItem("hunter-topic-graph-order"),
  );
  await page.reload();
  const cards = page.locator(".tg-graph-card");
  const firstTitle = await cards.nth(0).getByRole("heading").textContent();
  const secondTitle = await cards.nth(1).getByRole("heading").textContent();
  const firstCard = cards.filter({ hasText: firstTitle });
  const secondCard = cards.filter({ hasText: secondTitle });
  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  await firstCard.dispatchEvent("dragstart", { dataTransfer });
  await secondCard.dispatchEvent("dragenter", { dataTransfer });
  await expect(cards.nth(0).getByRole("heading")).toHaveText(secondTitle);
  await secondCard.dispatchEvent("drop", { dataTransfer });
  await firstCard.dispatchEvent("dragend", { dataTransfer });
  await expect(page.getByText("知识图谱顺序已保存")).toBeVisible();
  await page.reload();
  await expect(cards.nth(0).getByRole("heading")).toHaveText(secondTitle);
  await expect(cards.nth(1).getByRole("heading")).toHaveText(firstTitle);
  assertNoConsoleErrors();
});

test("图谱空状态与节点资产关联可维护", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings?state=empty");
  await expect(page.getByText("还没有知识图谱")).toBeVisible();

  await page.goto("#/mappings/mapping-embodied?tab=content");
  await page.locator(".tg-node", { hasText: "星澜机器人" }).click();
  await page.getByRole("button", { name: "图页操作：星澜机器人组织" }).click();
  const pageMenu = page.locator(".tg-page-menu");
  await expect(pageMenu).toBeVisible();
  const menuBox = await pageMenu.boundingBox();
  expect(menuBox.x).toBeGreaterThanOrEqual(0);
  expect(menuBox.y).toBeGreaterThanOrEqual(0);
  await pageMenu.getByRole("button", { name: "编辑", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "编辑节点" });
  await expect(editor.getByText("已关联公司")).toBeVisible();
  await editor.getByRole("button", { name: "解除关联" }).click();
  await expect(editor.getByText("将转为图谱本地节点")).toBeVisible();
  await editor.getByRole("button", { name: "保存修改" }).click();
  await expect(page.getByText("未关联正式资产")).toBeVisible();
  assertNoConsoleErrors();
});

test("图谱关系可编辑且来源证据可查看", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.context().route("https://example.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Mock evidence</title>",
    }),
  );
  await page.goto("#/mappings/mapping-embodied?tab=content");
  await page.locator(".tg-edge-label-button").first().dblclick();
  const relationEditor = page.getByRole("dialog", { name: "编辑关系" });
  await expect(relationEditor).toBeVisible();
  await expect(
    relationEditor.getByRole("button", { name: "选择起点" }),
  ).toHaveCount(0);
  await expect(
    relationEditor.getByRole("button", { name: "选择终点" }),
  ).toHaveCount(0);
  await expect(relationEditor.getByText("保存位置")).toHaveCount(0);
  await expect(relationEditor.getByText(/写入门禁/)).toHaveCount(0);
  await relationEditor
    .getByPlaceholder("例如：汇报给、前同事、合作")
    .fill("协作关系");
  await relationEditor.getByRole("button", { name: "保存关系" }).click();
  await expect(page.getByText("本图关系已更新")).toBeVisible();

  await page.locator(".tg-node", { hasText: "星澜机器人" }).click();
  await page.getByRole("button", { name: "公司官网" }).click();
  const evidenceDialog = page.getByRole("dialog", { name: "来源与证据" });
  await expect(evidenceDialog).toBeVisible();
  const sourcePopupPromise = page.waitForEvent("popup");
  await evidenceDialog.getByRole("button", { name: "打开来源记录" }).click();
  const sourcePopup = await sourcePopupPromise;
  await expect(sourcePopup).toHaveURL(/#\/companies\/company-xinglan/);
  await sourcePopup.close();
  const webPopupPromise = page.waitForEvent("popup");
  await evidenceDialog.getByRole("button", { name: "打开原始网页" }).click();
  const webPopup = await webPopupPromise;
  await expect(webPopup).toHaveURL(/example\.com\/xinglan-robotics\/about/);
  await webPopup.close();
  assertNoConsoleErrors();
});

test("图谱支持先连线、后命名并调整节点层级", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?tab=content");
  await page.getByRole("button", { name: "关闭详情" }).click();
  await page.getByRole("button", { name: "添加关系" }).click();
  const source = page.locator(".tg-node", { hasText: "具身智能中心" }).first();
  const target = page.locator(".tg-node", { hasText: "星澜机器人" }).first();
  const connector = source.locator(".tg-node-connector");
  const edgeCountBefore = await page.locator(".tg-edge").count();
  const connectorBox = await connector.boundingBox();
  const targetBox = await target.boundingBox();
  expect(connectorBox).not.toBeNull();
  expect(targetBox).not.toBeNull();
  await page.mouse.move(
    connectorBox.x + connectorBox.width / 2,
    connectorBox.y + connectorBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 10 },
  );
  await page.mouse.up();
  await expect(
    page.getByText("连接已添加；双击连线可以补充关系名称"),
  ).toBeVisible();
  await expect(page.locator(".tg-edge")).toHaveCount(edgeCountBefore + 1);
  const createdEdge = page.locator(".tg-edge").last();
  await expect(createdEdge.locator(".tg-edge-label-button")).toHaveCount(0);
  await createdEdge.locator(".tg-edge-hit").dblclick({ force: true });
  const relationEditor = page.getByRole("dialog", { name: "编辑关系" });
  await expect(relationEditor).toBeVisible();
  await relationEditor
    .getByPlaceholder("例如：汇报给、前同事、合作")
    .fill("战略协作");
  await relationEditor.getByRole("button", { name: "保存关系" }).click();
  await expect(page.getByText("本图关系已更新")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "编辑关系：战略协作" }),
  ).toBeVisible();

  const movedNode = page.locator(".tg-node", { hasText: "VLA 算法组" }).first();
  const newParent = page.locator(".tg-node", { hasText: "星澜机器人" }).first();
  const movedBox = await movedNode.boundingBox();
  const parentBox = await newParent.boundingBox();
  expect(movedBox).not.toBeNull();
  expect(parentBox).not.toBeNull();
  await page.mouse.move(
    movedBox.x + movedBox.width / 2,
    movedBox.y + movedBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    parentBox.x + parentBox.width / 2,
    parentBox.y + parentBox.height / 2,
    { steps: 10 },
  );
  await expect(newParent).toHaveClass(/is-drop-target/);
  await page.mouse.up();
  await expect(
    page.getByText("VLA 算法组已移动到“星澜机器人”下"),
  ).toBeVisible();
  await expectVisibleGraphNodesDoNotOverlap(page);
  assertNoConsoleErrors();
});

test("图谱快捷键与删除操作沿用本地人才地图语义", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?tab=content");
  await expect(page.getByText("新增子节点")).toBeVisible();
  const node = page.locator(".tg-node", { hasText: "星澜机器人" }).first();
  await node.click();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("dialog", { name: "添加节点" })).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog", { name: "编辑节点" })).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await page.keyboard.press("Delete");
  const deleteDialog = page.getByRole("dialog", { name: "删除图谱节点" });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole("button", { name: "取消" }).click();
  await expect(node).toBeVisible();
  assertNoConsoleErrors();
});

test("知识图谱、历史视图和审核视图均可进入并退出全屏", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.goto("#/mappings/mapping-embodied?tab=content");
  await page.getByRole("button", { name: "进入图谱全屏" }).click();
  await expect(page.locator(".tg-content-shell")).toHaveClass(/is-fullscreen/);
  await expect(
    page.getByRole("button", { name: "退出图谱全屏" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".tg-content-shell")).not.toHaveClass(
    /is-fullscreen/,
  );

  await page.goto("#/mappings/mapping-embodied?tab=history");
  await page.getByRole("button", { name: "进入历史画布全屏" }).click();
  await expect(page.locator("aside.is-history-preview")).toHaveClass(
    /is-fullscreen/,
  );
  await page.getByRole("button", { name: "退出历史画布全屏" }).click();
  await expect(page.locator("aside.is-history-preview")).not.toHaveClass(
    /is-fullscreen/,
  );

  await page.goto("#/mappings/mapping-embodied?tab=reviews");
  await page.getByRole("button", { name: "进入审核画布全屏" }).click();
  await expect(page.locator(".tg-review-workspace")).toHaveClass(
    /is-fullscreen/,
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".tg-review-workspace")).not.toHaveClass(
    /is-fullscreen/,
  );
  assertNoConsoleErrors();
});

test("相关资产和运营页体现知识图谱决策", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  const cases = [
    ["#/candidates/candidate-linhao?tab=relations", "学术成果"],
    ["#/candidates/candidate-linhao?tab=contact-path", "可执行联系路径"],
    ["#/positions/position-vla?tab=talent-map", "重点人才"],
    ["#/companies/company-xinglan?tab=mappings", "公司关系与人才流动"],
    ["#/patents/patent-manipulation", "关系同步"],
    ["#/tasks/mapping-embodied", "具身智能 VLA 人才摸排"],
    ["#/signals", "星澜机器人组织与人才流动关系发生变化"],
    ["#/ops/tasks?view=background", "图谱后台运行"],
  ];
  for (const [url, text] of cases) {
    await page.goto(url);
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }
  await page.goto("#/papers/paper-vla-survey");
  await expect(page.getByText("关系同步", { exact: true })).toHaveCount(0);
  assertNoConsoleErrors();
});

test("关系视图在移动端不产生页面级横向溢出", async ({ page }) => {
  const assertNoConsoleErrors = trackConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of [
    "#/mappings/mapping-embodied",
    "#/mappings/mapping-embodied?tab=content&view=table",
    "#/candidates/candidate-linhao?tab=relations",
    "#/candidates/candidate-linhao?tab=contact-path",
    "#/positions/position-vla?tab=talent-map",
    "#/companies/company-xinglan?tab=mappings",
  ]) {
    await page.goto(url);
    await expectNoHorizontalOverflow(page);
  }
  assertNoConsoleErrors();
});
