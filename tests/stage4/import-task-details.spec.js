import { expect, test } from "@playwright/test";

const base = "#/data/imports";
const evidence = process.env.IMPORT_DETAIL_EVIDENCE_DIR || "artifacts/import-task-details-20261123";

test.beforeEach(async ({ page }) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method()))
      failures.push(`unexpected write: ${request.method()} ${request.url()}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
  test
    .info()
    .annotations.push({
      type: "scope",
      description: "本地虚构样例，无业务写入",
    });
  page.__importFailures = failures;
});
test.afterEach(async ({ page }) => {
  expect(page.__importFailures).toEqual([]);
});

test("列表入口与逐项状态、原因筛选及分页", async ({ page }) => {
  await page.goto(base);
  await page
    .locator(".s4-task-table > article")
    .filter({ hasText: "论文结果导入" })
    .getByRole("button", { name: "查看详情" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("已处理 340 / 500");
  await expect(dialog.locator("[data-import-item]")).toHaveCount(10);
  const tabs = dialog.getByRole("tablist", { name: "导入明细状态" });
  for (const [label, count] of [
    ["处理中", 160],
    ["成功", 332],
    ["失败", 4],
    ["待确认", 2],
    ["已跳过", 2],
  ]) {
    await tabs.getByRole("tab", { name: `${label} ${count}` }).click();
    await expect(
      dialog.getByRole("navigation", { name: "分页" }),
    ).toContainText(`共 ${count} 条`);
  }
  await tabs.getByRole("tab", { name: "失败 4" }).click();
  await dialog
    .getByPlaceholder("搜索名称、文件名、行号或原因")
    .fill("标题字段为空");
  await expect(dialog.locator("[data-import-item]")).toHaveCount(2);
  await dialog
    .locator("[data-import-item]")
    .first()
    .getByRole("button")
    .click();
  await expect(
    dialog.getByText("补齐原表格的标题字段后，重新导入修正记录。", {
      exact: true,
    }),
  ).toBeVisible();
  await dialog
    .getByPlaceholder("搜索名称、文件名、行号或原因")
    .fill("没有匹配项");
  await expect(dialog.getByText("没有符合条件的导入条目")).toBeVisible();
  await dialog.getByRole("button", { name: "清除筛选" }).click();
  await dialog.getByRole("button", { name: "下一页", exact: true }).click();
  await expect(dialog.getByRole("navigation", { name: "分页" })).toContainText(
    "第 11–20 条",
  );
});

test("刷新推进状态且关闭重开不丢失", async ({ page }) => {
  await page.goto(`${base}?detail=import-papers`);
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "刷新状态" }).click();
  await expect(dialog).toContainText("已处理 348 / 500");
  await expect(dialog.getByRole("tab", { name: "失败 4" })).toBeVisible();
  await dialog
    .getByRole("button", { name: "关闭", exact: true })
    .last()
    .click();
  await page
    .locator(".s4-task-table > article")
    .filter({ hasText: "论文结果导入" })
    .getByRole("button", { name: "查看详情" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("已处理 348 / 500");
});

test("重试新建关联任务、只含可恢复项、原结果保持且防重复", async ({ page }) => {
  await page.goto(`${base}?detail=import-papers`);
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "重试可恢复项（2）" }).click();
  await dialog.getByRole("button", { name: "取消", exact: true }).click();
  await expect(
    dialog.getByText("已创建失败项重试任务", { exact: true }),
  ).not.toBeVisible();
  await dialog.getByRole("button", { name: "重试可恢复项（2）" }).click();
  await dialog.getByRole("button", { name: "确认重试" }).click();
  await expect(
    dialog.getByRole("button", { name: "重试可恢复项（2）" }),
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "查看重试任务" }).click();
  await expect(dialog).toContainText("已处理 0 / 2");
  await expect(dialog.locator("[data-import-item]")).toHaveCount(2);
  await dialog.getByRole("button", { name: "刷新状态" }).click();
  await expect(dialog).toContainText("已处理 2 / 2");
  await dialog.getByRole("button", { name: "查看原任务" }).click();
  await expect(dialog.getByRole("tab", { name: "失败 4" })).toBeVisible();
  await expect(page.locator(".s4-task-table > article")).toHaveCount(4);
});

test("可下载逐项失败报告", async ({ page }) => {
  await page.goto(`${base}?detail=import-papers`);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载失败明细" }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe("import-papers-失败明细.csv");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const csv = Buffer.concat(chunks).toString("utf8");
  expect(csv.split("\r\n")).toHaveLength(5);
  expect(csv).toContain("标题字段为空");
  expect(csv).not.toContain("论文已新建");
});

test("成功项资产链接新标签页，待确认与失败不冒充成功", async ({
  page,
  context,
}) => {
  await page.goto(`${base}?detail=import-resumes`);
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("tab", { name: "成功 25" })).toBeVisible();
  await dialog
    .locator("[data-import-item]")
    .first()
    .getByRole("button")
    .click();
  const link = dialog.getByRole("link", { name: /查看资产/ });
  await expect(link).toHaveAttribute("target", "_blank");
  const newTab = context.waitForEvent("page");
  await link.click();
  const asset = await newTab;
  await asset.waitForURL(/#\/candidates\/candidate-linhao/);
  await asset.close();
  await expect(page).toHaveURL(/data\/imports/);
  await dialog.getByRole("tab", { name: "待确认 2" }).click();
  await expect(dialog.locator("[data-import-item]")).toHaveCount(2);
  await dialog.getByRole("tab", { name: "失败 1" }).click();
  await expect(
    dialog.getByText("PDF 文件已加密，无法读取正文", { exact: true }),
  ).toBeVisible();
});

test("整文件校验失败不伪造逐项成功或进度", async ({ page }) => {
  await page.goto(`${base}?detail=import-mapping`);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("第 3 行 · C3");
  await expect(dialog).toContainText("未创建任何节点或连线");
  await expect(dialog.locator(".s4-progress")).toHaveCount(0);
  await expect(dialog.locator("[data-import-item]")).toHaveCount(0);
});

for (const state of ["error", "loading", "restricted", "missing"])
  test(`读取边界：${state}`, async ({ page }) => {
    await page.goto(
      `${base}?detail=${state === "missing" ? "does-not-exist" : "import-papers"}&importView=${state}`,
    );
    const dialog = page.getByRole("dialog");
    if (state === "error") {
      await expect(dialog.getByText("导入明细读取失败")).toBeVisible();
      await dialog.getByRole("button", { name: "重新加载" }).click();
      await expect(dialog.getByRole("table")).toBeVisible();
    } else if (state === "loading") {
      await expect(dialog.getByText("正在读取导入明细…")).toBeVisible();
      await expect(dialog.getByRole("table")).toBeVisible();
    } else {
      await expect(
        dialog.getByText(
          state === "missing" ? "找不到导入任务" : "无权查看此导入任务",
        ),
      ).toBeVisible();
      await expect(dialog.getByRole("table")).toHaveCount(0);
      await expect(dialog).not.toContainText("academic-search");
    }
  });

test("列表筛选和新建导入后可直接打开对应详情", async ({ page }) => {
  await page.goto(base);
  await page.getByPlaceholder("搜索导入记录或文件名").fill("不存在的记录");
  await expect(page.getByText("没有符合条件的导入任务")).toBeVisible();
  await page.getByPlaceholder("搜索导入记录或文件名").fill("");
  await page.getByRole("button", { name: "新建导入" }).click();
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "本地验收简历.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("prototype fixture, not a real resume"),
    });
  await page.getByRole("button", { name: "校验并解析" }).click();
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
  await page.getByRole("button", { name: "查看任务详情" }).click();
  await expect(page.getByRole("dialog")).toContainText("本地验收简历.pdf");
  await expect(page.getByRole("dialog")).toContainText("已处理 0 / 1 份文件");
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "medium", width: 871, height: 866 },
  { name: "mobile", width: 390, height: 844 },
  { name: "low-dark", width: 1280, height: 650, dark: true },
])
  test(`截图与布局：${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    if (viewport.dark)
      await page.addInitScript(() =>
        localStorage.setItem("hunter-theme", "dark"),
      );
    await page.goto(`${base}?detail=import-papers`);
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("tab", { name: "失败 4" }).click();
    await dialog
      .locator("[data-import-item]")
      .first()
      .getByRole("button")
      .click();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(220);
    const overflow = await dialog.evaluate((element) => {
      const body = element.querySelector(".s1-modal-body");
      return {
        modal: element.scrollWidth - element.clientWidth,
        body: body.scrollWidth - body.clientWidth,
        viewport: document.documentElement.scrollWidth - innerWidth,
      };
    });
    expect(overflow).toEqual({ modal: 0, body: 0, viewport: 0 });
    await expect(
      dialog.getByRole("button", { name: "关闭", exact: true }).last(),
    ).toBeInViewport();
    await dialog.screenshot({
      path: `${evidence}/detail-${viewport.name}.png`,
    });
  });
