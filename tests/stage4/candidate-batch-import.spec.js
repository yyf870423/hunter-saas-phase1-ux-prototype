import { expect, test } from "@playwright/test";
import { read } from "xlsx";

test.describe.configure({ mode: "parallel" });
const entry = "#/candidates/new?mode=batch";
const upload = (name, text = "Only for prototype interaction testing") => ({ name, mimeType: "application/octet-stream", buffer: Buffer.from(text) });
test.beforeEach(async ({ page }) => {
  page.__problems = [];
  page.on("pageerror", e => page.__problems.push(e.message));
  page.on("request", r => { if (!["GET", "HEAD"].includes(r.method())) page.__problems.push(`${r.method()} ${r.url()}`); });
  page.on("response", r => { if (r.status() >= 400) page.__problems.push(`${r.status()} ${r.url()}`); });
});
test.afterEach(async ({ page }) => expect(page.__problems).toEqual([]));

for (const width of [1440, 871, 390]) test(`${width}px 批量入口、文件区、确认与共享任务`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("#/candidates");
  const header = page.locator(".s4-page-actions");
  await expect(header.getByRole("button", { name: "新建候选人", exact: true })).toBeVisible();
  await expect(header.getByRole("button")).toHaveCount(1);
  await header.getByRole("button", { name: "新建候选人", exact: true }).click();
  await page.getByRole("button", { name: "批量导入 多份简历或候选人表格", exact: true }).click();
  await expect(page.getByRole("heading", { name: "批量导入候选人", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "校验并继续", exact: true })).toBeDisabled();
  expect(await page.locator(".s4-candidate-batch-note").evaluate(e => getComputedStyle(e).marginBottom)).toBe("12px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: info.outputPath("empty.png"), fullPage: true });
  await page.locator('input[type="file"]').setInputFiles([upload("简历甲.pdf"), upload("候选人表.xlsx")]);
  await expect(page.locator(".s4-uploaded-files > span")).toHaveCount(2);
  await page.getByRole("button", { name: "校验并继续", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "确认导入任务", exact: true });
  await expect(confirm.locator(".s4-import-summary dl")).toContainText("待处理文件2已处理0成功0失败0");
  await confirm.screenshot({ path: info.outputPath("confirmation.png") });
  await confirm.getByRole("button", { name: "返回", exact: true }).click();
  await expect(page.locator(".s4-uploaded-files > span")).toHaveCount(2);
  await page.getByRole("button", { name: "校验并继续", exact: true }).click();
  await confirm.getByRole("button", { name: "确认导入", exact: true }).dblclick();
  await expect(page.getByText("导入任务已创建", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "查看任务详情", exact: true }).click();
  const detail = page.getByRole("dialog", { name: "候选人文件导入", exact: true });
  await expect(detail).toContainText("已处理 0 / 2");
  await expect(detail).toContainText("未开启自动人岗匹配");
  await detail.getByRole("button", { name: "刷新状态", exact: true }).click();
  await expect(detail).toContainText("已处理 2 / 2");
  await detail.screenshot({ path: info.outputPath("task-detail.png") });
  await detail.getByRole("button", { name: "关闭", exact: true }).last().click();
  await expect(page.locator(".s4-task-table > article").filter({ hasText: "候选人文件导入" })).toHaveCount(1);
  await page.getByRole("tab", { name: "数据导出", exact: true }).click();
  await page.getByRole("tab", { name: "数据导入", exact: true }).click();
  await page.locator(".s4-task-table > article").filter({ hasText: "候选人文件导入" }).getByRole("button", { name: "查看详情", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("已处理 2 / 2");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

test("错误文件可移除并重新选择，超量不会截断后继续", async ({ page }) => {
  await page.goto(entry);
  const input = page.locator('input[type="file"]');
  await input.setInputFiles([upload("不是简历.exe"), upload("空文件.pdf", "")]);
  await expect(page.locator(".s4-file-error")).toContainText("不支持此格式");
  await expect(page.locator(".s4-file-error")).toContainText("文件为空");
  await expect(page.getByRole("button", { name: "校验并继续" })).toBeDisabled();
  await page.getByRole("button", { name: "移除 不是简历.exe", exact: true }).click();
  await page.getByRole("button", { name: "移除 空文件.pdf", exact: true }).click();
  await input.setInputFiles(Array.from({ length: 101 }, (_, i) => upload(`${i}.pdf`)));
  await expect(page.locator(".s4-file-error")).toContainText("单次最多上传 100 份");
  await expect(page.locator(".s4-uploaded-files > span")).toHaveCount(0);
  await input.setInputFiles(upload("合格.pdf"));
  await expect(page.getByRole("button", { name: "校验并继续" })).toBeEnabled();
});

test("可拖入文件、检查大文件并保留同名不同文件", async ({ page }) => {
  await page.goto(entry);
  const data = await page.evaluateHandle(() => {
    const dt = new DataTransfer(); dt.items.add(new File([new Uint8Array(20 * 1024 * 1024 + 1)], "过大.zip")); return dt;
  });
  await page.locator(".s4-file-drop").dispatchEvent("drop", { dataTransfer: data });
  await expect(page.locator(".s4-file-error")).toContainText("超过单个文件 20 MB");
  await expect(page.getByRole("button", { name: "校验并继续" })).toBeDisabled();
  await page.locator('input[type="file"]').setInputFiles([upload("同名.pdf", "file one"), upload("同名.pdf", "file two")]);
  await expect(page.locator(".s4-uploaded-files > span")).toHaveCount(2);
  await page.getByRole("button", { name: "移除 同名.pdf", exact: true }).first().click();
  await expect(page.locator(".s4-uploaded-files > span")).toHaveCount(1);
});

test("匹配选项有门禁，取消确认不创建任务", async ({ page }) => {
  await page.goto(entry);
  await page.locator('input[type="file"]').setInputFiles(upload("招聘资料.pdf"));
  const option = page.locator(".s4-post-write-matching");
  await option.getByRole("checkbox").click();
  await option.getByRole("radio", { name: /指定岗位/ }).click();
  await page.getByRole("button", { name: "校验并继续" }).click();
  await expect(page.getByText("请至少选择一个岗位", { exact: true })).toBeVisible();
  await option.getByRole("button", { name: "选择岗位", exact: true }).click();
  await page.getByRole("button", { name: "具身智能 VLA 算法负责人 · 星澜机器人", exact: true }).click();
  await page.getByRole("button", { name: "校验并继续" }).click();
  const confirm = page.getByRole("dialog");
  await expect(confirm).toContainText("已选择的 1 个岗位");
  await confirm.getByRole("button", { name: "返回", exact: true }).click();
  await expect(page.locator(".s4-uploaded-files > span")).toHaveCount(1);
  await page.getByRole("button", { name: "校验并继续" }).click();
  await confirm.getByRole("button", { name: "确认导入", exact: true }).click();
  await page.getByRole("button", { name: "查看任务详情", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("匹配岗位：具身智能 VLA 算法负责人 · 星澜机器人");
  await page.getByRole("dialog").getByRole("button", { name: "关闭", exact: true }).last().click();
  await expect(page.locator(".s4-task-table > article").filter({ hasText: "候选人文件导入" })).toHaveCount(1);
});

test("继续导入清空文件并创建独立任务，不重复提交上批文件", async ({ page }) => {
  await page.goto(entry);
  for (const name of ["第一批.pdf", "第二批.zip"]) {
    await page.locator('input[type="file"]').setInputFiles(upload(name));
    await page.getByRole("button", { name: "校验并继续" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "确认导入", exact: true }).click();
    await expect(page.getByText("导入任务已创建", { exact: true })).toBeVisible();
    if (name === "第一批.pdf") {
      await page.getByRole("button", { name: "继续导入", exact: true }).click();
      await expect(page.locator(".s4-uploaded-files > span")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "校验并继续" })).toBeDisabled();
    }
  }
  await page.getByRole("button", { name: "查看任务详情", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("第二批.zip");
  await page.getByRole("dialog").getByRole("button", { name: "关闭", exact: true }).last().click();
  await expect(page.locator(".s4-task-table > article").filter({ hasText: "候选人文件导入" })).toHaveCount(2);
});

test("下载示例是可读取的空白XLSX，没有假数据", async ({ page }) => {
  await page.goto(entry);
  const waiting = page.waitForEvent("download");
  await page.getByRole("link", { name: "下载 候选人 导入示例", exact: true }).click();
  const download = await waiting;
  expect(download.suggestedFilename()).toBe("候选人导入示例.xlsx");
  const stream = await download.createReadStream();
  const chunks = []; for await (const chunk of stream) chunks.push(chunk);
  const book = read(Buffer.concat(chunks));
  expect(book.SheetNames).toEqual(["候选人"]);
  expect(book.Sheets.候选人.A1.v).toBe("姓名");
  expect(book.Sheets.候选人["!ref"]).toBe("A1:J1");
});

test("批量图标区别于上传，下载示例与数据导入使用相同链接", async ({ page }, info) => {
  await page.goto(entry);
  const modes = page.locator(".s4-create-modes");
  const batchIcon = modes.getByRole("button", { name: "批量导入 多份简历或候选人表格", exact: true }).locator('svg[data-icon="fileInput"]');
  await expect(batchIcon).toBeVisible();
  await expect(modes.getByRole("button", { name: "上传简历 解析后确认写入", exact: true }).locator('svg[data-icon="upload"]')).toBeVisible();
  const link = page.getByRole("link", { name: "下载 候选人 导入示例", exact: true });
  await expect(link.locator("svg")).toHaveCount(0);
  const order = await link.evaluate(element => [...element.parentElement.children].map(child => child.className || child.tagName));
  expect(order).toEqual(["s4-file-drop-wrap", "s4-post-write-matching ", "A"]);
  const appearance = element => {
    const style = getComputedStyle(element);
    return { tag: element.tagName, color: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight, textDecoration: style.textDecorationLine, borderWidth: style.borderWidth };
  };
  const reference = await link.evaluate(appearance);
  for (const width of [1440, 871]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(batchIcon).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.locator(".s4-create-layout").screenshot({ path: info.outputPath(`batch-icon-and-example-link-${width}.png`) });
  }
  await page.goto("#/data/imports?type=candidates");
  const dataLink = page.getByRole("dialog").getByRole("link", { name: "下载 候选人 导入示例", exact: true });
  await expect(dataLink).toBeVisible();
  expect(await dataLink.evaluate(appearance)).toEqual(reference);
  expect(await dataLink.evaluate(element => element.previousElementSibling.classList.contains("s4-post-write-matching"))).toBe(true);
  const waiting = page.waitForEvent("download");
  await dataLink.click();
  expect((await waiting).suggestedFilename()).toBe("候选人导入示例.xlsx");
  await page.getByRole("dialog").screenshot({ path: info.outputPath("data-import-example-link.png") });
});
