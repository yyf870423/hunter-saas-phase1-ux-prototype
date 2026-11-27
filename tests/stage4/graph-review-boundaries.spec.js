import { expect, test } from "@playwright/test";
test.skip(true, "2026-11-27 更新与审核入口暂时隐藏，保留用例待重新设计；当前范围见deferred-asset-sections.spec.js");
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const route = "#/mappings/mapping-embodied?tab=reviews";

test("修改组织上级可操作，节点与新增连线同步预览且确认后才生效", async ({
  page,
}, info) => {
  const noErrors = trackConsoleErrors(page);
  await page.goto(route);
  await item(page, "VLA 算法组拟调整").click();
  await page.getByRole("button", { name: "修改建议", exact: true }).click();
  const editor = page.getByRole("dialog", {
    name: "修改审核建议",
    exact: true,
  });
  await editor.getByRole("button", { name: "上级节点", exact: true }).click();
  await page
    .locator(".s4-select-panel")
    .getByRole("button", { name: "星澜机器人", exact: true })
    .click();
  await expect(
    editor.getByRole("button", { name: "起点节点", exact: true }),
  ).toContainText("星澜机器人");
  await page.screenshot({
    path: info.outputPath("review-editor.png"),
    fullPage: true,
  });
  await editor
    .getByRole("button", { name: "更新建议预览", exact: true })
    .click();
  expect(
    (await record(page)).pages[0].nodes.find((n) => n.id === "org-vla")
      .parentId,
  ).toBe("org-center");
  await primary(page).click();
  await expect(item(page, "VLA 算法组拟调整")).toHaveCount(0);
  const saved = await record(page);
  expect(saved.pages[0].nodes.find((n) => n.id === "org-vla").parentId).toBe(
    "org-xinglan",
  );
  expect(
    saved.pages[0].edges.find((e) => e.id === "review-team-edge").source,
  ).toBe("org-xinglan");
  await noErrors();
});
const store = (page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("hunter-topic-graphs-v1") || "null"),
  );
const record = async (page) =>
  (await store(page)).graphs.find((graph) => graph.id === "mapping-embodied");
const pos = (canvas) =>
  canvas
    .locator(".tg-node")
    .evaluateAll((nodes) =>
      Object.fromEntries(
        nodes.map((node) => [
          node.dataset.nodeId,
          [node.dataset.worldX, node.dataset.worldY],
        ]),
      ),
    );
const camera = (canvas) =>
  canvas
    .locator(".tg-canvas-stage")
    .evaluate((node) => getComputedStyle(node).transform);
const item = (page, name) =>
  page.locator(".tg-review-list > button").filter({ hasText: name });
const tab = (page, name) =>
  page.getByRole("tab", { name: new RegExp(`^${name}(?:\\s*\\d+)?$`) });
const primary = (page) =>
  page.locator(".tg-review-detail > footer .s1-button-primary");
async function moveNode(page, canvas, id, dx = -50, dy = 55) {
  const box = await canvas.locator(`[data-node-id="${id}"]`).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + dx,
    box.y + box.height / 2 + dy,
    { steps: 8 },
  );
  await page.mouse.up();
}

for (const width of [1440, 926])
  test(`${width}px 局部审核与正式图页隔离，临时视角按项保留，刷新重置`, async ({
    page,
  }, info) => {
    const noErrors = trackConsoleErrors(page),
      writes = [];
    page.on("request", (request) => {
      if (!["GET", "HEAD"].includes(request.method()))
        writes.push(request.url());
    });
    await page.setViewportSize({ width, height: 1100 });
    await page.goto(route.replace("reviews", "content"));
    const full = page.locator(".tg-graph-workarea");
    await expect(full.locator(".tg-node").first()).toBeVisible();
    await page.waitForTimeout(150);
    const original = await pos(full),
      originalCamera = await camera(full);
    await tab(page, "更新与审核").click();
    const canvas = page.locator(".tg-review-canvas");
    await expect(canvas.locator('[data-node-id="org-wang"]')).toBeVisible();
    expect(await canvas.locator(".tg-node").count()).toBeLessThan(
      Object.keys(original).length,
    );
    expect(new URL(page.url()).hash).not.toContain("page=");
    await moveNode(page, canvas, "org-wang");
    const moved = await pos(canvas);
    expect(moved["org-wang"]).not.toEqual(original["org-wang"]);
    await page
      .getByRole("button", { name: "缩小审核画布", exact: true })
      .click();
    const savedCamera = await camera(canvas);
    await item(page, "何静").click();
    await item(page, "王奕").click();
    await expect.poll(() => pos(canvas)).toEqual(moved);
    await expect.poll(() => camera(canvas)).toEqual(savedCamera);
    await tab(page, "图谱内容").click();
    await expect.poll(() => pos(full)).toEqual(original);
    await expect.poll(() => camera(full)).toEqual(originalCamera);
    await tab(page, "更新与审核").click();
    await expect.poll(() => pos(canvas)).toEqual(moved);
    await page.screenshot({
      path: info.outputPath("review-local.png"),
      fullPage: true,
    });
    await page.reload();
    await expect
      .poll(async () => (await pos(canvas))["org-wang"])
      .toEqual(original["org-wang"]);
    expect(await store(page)).toBeNull();
    await expectNoHorizontalOverflow(page);
    expect(writes).toEqual([]);
    await noErrors();
  });

test("修改先预览、取消可继续编辑；采纳后刷新可回读，处理前后可追溯", async ({
  page,
}, info) => {
  await page.goto(route);
  await page.getByRole("button", { name: "修改建议", exact: true }).click();
  const editor = page.getByRole("dialog", {
    name: "修改审核建议",
    exact: true,
  });
  await editor
    .getByRole("textbox", { name: /本图备注/ })
    .fill("保留自由人物，先核对任职时间线，再判断身份关联。");
  await editor.getByRole("button", { name: "取消", exact: true }).click();
  await page.getByRole("button", { name: "继续编辑", exact: true }).click();
  await expect(editor.getByRole("textbox", { name: /本图备注/ })).toContainText(
    "核对任职时间线",
  );
  await editor
    .getByRole("button", { name: "更新建议预览", exact: true })
    .click();
  const draft = await record(page);
  expect(
    draft.pages[0].nodes.find((node) => node.id === "org-wang").summary,
  ).not.toContain("先核对任职时间线");
  await primary(page).click();
  await expect(item(page, "王奕")).toHaveCount(0);
  await tab(page, "已处理").click();
  await expect(page.locator(".tg-review-detail")).toContainText(
    "仅应用本项完整变化",
  );
  await page.screenshot({
    path: info.outputPath("review-accepted.png"),
    fullPage: true,
  });
  const accepted = await record(page);
  expect(
    accepted.pages[0].nodes.find((node) => node.id === "org-wang").summary,
  ).toContain("先核对任职时间线");
  expect(
    accepted.reviewRecords.find((row) => row.id === "review-wang").state,
  ).toBe("accepted");
  await page.reload();
  await tab(page, "已处理").click();
  await expect(page.locator(".tg-review-detail")).toContainText(
    "先核对任职时间线",
  );
  await expect(primary(page)).toHaveCount(0);
});

test("拖动审核节点后采纳上级调整，不带入临时位置且完整替换关系", async ({
  page,
}, info) => {
  await page.goto(route);
  await item(page, "VLA 算法组拟调整").click();
  const canvas = page.locator(".tg-review-canvas");
  await expect(
    canvas.locator('.tg-edge[data-review-delta="remove"]'),
  ).toHaveCount(1);
  await expect(canvas.locator('.tg-edge[data-review-delta="add"]')).toHaveCount(
    1,
  );
  const before = await pos(canvas);
  await moveNode(page, canvas, "org-vla", -40, 55);
  await expect(canvas.locator(".is-drop-target")).toHaveCount(0);
  await page.screenshot({
    path: info.outputPath("review-parent-delta.png"),
    fullPage: true,
  });
  await primary(page).click();
  await expect(item(page, "VLA 算法组拟调整")).toHaveCount(0);
  const graph = await record(page),
    p = graph.pages.find((p) => p.id === "organization");
  expect(p.nodes.find((n) => n.id === "org-vla").parentId).toBe("org-learning");
  expect(p.nodes.find((n) => n.id === "org-vla").x).toBe(
    Number(before["org-vla"][0]),
  );
  expect(p.edges.some((e) => e.id === "oe2")).toBe(false);
  expect(p.edges.some((e) => e.id === "review-team-edge")).toBe(true);
  expect(graph.reviewRecords.filter((i) => i.state === "pending")).toHaveLength(
    2,
  );
});

test("拒绝不修改原图；处理记录与计数同步，三项处理后可查看记录", async ({
  page,
}) => {
  await page.goto(route);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "拒绝建议", exact: true }).click();
    await expect(page.locator(".tg-review-list > button")).toHaveCount(2 - i);
  }
  await expect(
    page.getByRole("heading", { name: "当前没有待审核事项" }),
  ).toBeVisible();
  const graph = await record(page);
  expect(graph.pending).toBe(0);
  expect(graph.pages[0].nodes.find((n) => n.id === "org-vla").parentId).toBe(
    "org-center",
  );
  await tab(page, "已处理").click();
  await expect(page.locator(".tg-review-list > button")).toHaveCount(3);
});

for (const scenario of ["conflict", "missing", "already", "unrelated", "fail"])
  test(`受控场景 ${scenario}：门禁、重核与重试`, async ({ page }, info) => {
    const noErrors = trackConsoleErrors(page);
    await page.goto(`${route}&reviewCase=${scenario}`);
    if (scenario === "conflict") {
      await expect(primary(page)).toBeDisabled();
      await expect(page.locator(".tg-review-detail")).toContainText(
        "用户已手动补充",
      );
      await page
        .getByRole("button", { name: "已核对最新内容", exact: true })
        .click();
      await expect(primary(page)).toBeEnabled();
    } else if (scenario === "missing") {
      await expect(primary(page)).toBeDisabled();
      await page
        .getByRole("button", { name: "已核对最新内容", exact: true })
        .click();
      await expect(page.locator(".tg-review-detail")).toContainText(
        "不能直接沿用旧操作",
      );
    } else if (scenario === "already") {
      await expect(primary(page)).toHaveText("记录为无需重复处理");
      await primary(page).click();
      await tab(page, "已处理").click();
      await expect(page.locator(".tg-review-detail")).toContainText(
        "不重复写入",
      );
    } else if (scenario === "fail") {
      await primary(page).click();
      await expect(page.locator(".tg-review-detail")).toContainText(
        "本次模拟保存失败",
      );
      await expect(item(page, "王奕")).toHaveCount(1);
      await primary(page).click();
      await expect(item(page, "王奕")).toHaveCount(0);
    } else {
      await expect(primary(page)).toBeEnabled();
      await primary(page).click();
      await expect(item(page, "王奕")).toHaveCount(0);
    }
    await page.screenshot({
      path: info.outputPath(`review-${scenario}.png`),
      fullPage: true,
    });
    await noErrors();
  });

for (const [graph, title, added] of [
  ["mapping-company-relations", "陈松", "review-xpeng"],
  ["mapping-candidate-relations", "周明远", null],
  ["mapping-industry-chain", "多传感器", "review-sensor-fusion"],
])
  test(`${graph} 复用变更预览，采纳可回读且不修改其他图谱`, async ({
    page,
  }, info) => {
    const noErrors = trackConsoleErrors(page);
    await page.goto(`#/mappings/${graph}?tab=reviews`);
    await item(page, title).click();
    await page.screenshot({
      path: info.outputPath(`${graph}.png`),
      fullPage: true,
    });
    await primary(page).click();
    await expect(item(page, title)).toHaveCount(0);
    await tab(page, "已处理").click();
    const current = (await store(page)).graphs.find((g) => g.id === graph);
    expect(current.reviewRecords.some((i) => i.state === "accepted")).toBe(
      true,
    );
    if (added)
      expect(
        current.pages.some((p) => p.nodes.some((n) => n.id === added)),
      ).toBe(true);
    expect(
      (await store(page)).graphs.find((g) => g.id === "mapping-embodied").pages,
    ).toBeUndefined();
    await page.reload();
    await tab(page, "已处理").click();
    await expect(primary(page)).toHaveCount(0);
    await noErrors();
  });

test("权限不足不开放修改、采纳或拒绝；显式查看原图才定位", async ({ page }) => {
  await page.goto(`${route}&state=limited`);
  await expect(primary(page)).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "修改建议", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "拒绝建议", exact: true }),
  ).toBeDisabled();
  await item(page, "VLA 算法组拟调整").click();
  expect(page.url()).not.toContain("page=");
  await page.getByRole("button", { name: "查看原图", exact: true }).click();
  await expect(page).toHaveURL(/tab=content.*node=org-vla/);
});
