import { expect, test } from "@playwright/test";
import { TASK_DEMO_RESEARCH_MS } from "../../src/stage2/task-timing";
import { mkdir } from "node:fs/promises";

const route = "#/tasks/candidate-research-demo";
const out = process.env.RESEARCH_CAPTURE_DIR || "/Users/eric.yu/job_hunting/docs/hb-test-20261104/round4/local-align/candidate-research-20261118";
const resultDivider = page => page.getByRole("separator", { name: "调整对话与结果宽度" });
const pane = page => page.getByRole("complementary", { name: "候选人调研结果" });
const input = page => page.getByRole("textbox", { name: "任务对话输入" });
async function send(page, text) { await input(page).fill(text); await input(page).press("Enter"); await expect(input(page)).toBeEnabled(); }
async function open(page) { await page.getByRole("button", { name: /首批候选人.*查看结果/ }).click(); }

test.beforeEach(async ({ page }) => {
  const failures = [];
  page.on("pageerror", error => failures.push(error.message));
  page.on("console", message => { if (message.type() === "error") failures.push(message.text()); });
  await page.route("**/*", async r => {
    const request = r.request(), url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname) && !["data:", "blob:"].includes(url.protocol)) { failures.push(`external:${url.origin}`); return r.abort(); }
    if (!["GET", "HEAD"].includes(request.method())) { failures.push(`write:${request.method()}`); return r.abort(); }
    return r.continue();
  });
  page.on("response", response => { if (response.status() >= 400) failures.push(`http:${response.status()}:${new URL(response.url()).pathname}`); });
  await page.goto(route);
  await expect(page.getByRole("heading", { name: "具身智能 VLA 算法负责人" })).toBeVisible();
  page.__researchFailures = failures;
});
test.afterEach(async ({ page }) => { expect(page.__researchFailures).toEqual([]); });

test("无复选框和业务提交，名单展示分数与理由，输入草稿不丢", async ({ page }) => {
  await open(page);
  await expect(pane(page).getByRole("checkbox")).toHaveCount(0);
  await expect(pane(page).getByRole("button", { name: /提交|加入.*储备/ })).toHaveCount(0);
  await expect(pane(page)).toContainText("初筛分");
  await expect(pane(page)).toContainText("VLA 产品落地与团队管理经历完整");
  await input(page).fill("先核实个人贡献，暂不联系");
  await page.getByRole("button", { name: "关闭结果视图" }).click();
  await expect(input(page)).toHaveValue("先核实个人贡献，暂不联系");
  await page.getByRole("button", { name: "查看结果", exact: true }).click();
  await expect(input(page)).toHaveValue("先核实个人贡献，暂不联系");
});
test("自然语言点名三人，同名在原对话澄清，结果含分数理由缺口", async ({ page }) => {
  await send(page, "调研林昊、赵星羽和陈楚宁，重点核实预训练经历，不联系本人");
  await expect(page.locator(".s2-timeline")).toContainText("林昊有2位");
  await expect(page.locator(".s2-timeline")).toContainText("尚未开始调研");
  await send(page, "拓界机器人那位");
  await expect(pane(page)).toContainText("进一步调研结果");
  await expect(pane(page).locator(".s2-result-comparison > article")).toHaveCount(3);
  await expect(pane(page)).toContainText("91");
  await expect(pane(page)).toContainText("匹配理由");
  await expect(pane(page)).toContainText("风险 / 缺口");
  await expect(pane(page)).toContainText("未重新评分");
  await expect(pane(page)).toContainText("预训练经历");
  await page.getByRole("button", { name: "查看上一版结果" }).click();
  await expect(pane(page).getByRole("table").getByRole("row")).toHaveCount(19);
  await expect(pane(page)).toContainText("历史快照");
});
test("排序后按序号调研，明确范围不是旧列表", async ({ page }) => {
  await send(page, "按分数升序");
  const firstNames = await pane(page).locator("tbody tr .s2-result-person-link b").allTextContents();
  await send(page, "调研前三位，核实预训练经历");
  await expect(pane(page).locator(".s2-result-comparison > article")).toHaveCount(3);
  expect(await pane(page).locator(".s2-result-comparison .s2-result-person-link b").allTextContents()).toEqual(firstNames.slice(0, 3));
});
test("条件筛选、未知人选、模糊范围和未接入写入不返回假成功", async ({ page }) => {
  await send(page, "调研赵星羽和王小明，核实预训练经历");
  await expect(page.locator(".s2-timeline")).toContainText("无法明确找到“王小明”");
  await expect(pane(page)).toHaveCount(0);
  await send(page, "调研全部人选");
  await expect(page.locator(".s2-timeline")).toContainText("请明确范围");
  await send(page, "只看北京且85分以上的人选");
  await expect(pane(page).locator("tbody tr")).toHaveCount(2);
  await send(page, "把这些人加入岗位储备");
  await expect(page.locator(".s2-timeline")).toContainText("不会产生业务写入或发送动作");
});
test("停止后不出现迟到结果，恢复仍处理原对象", async ({ page }) => {
  await send(page, "调研前三位，核实预训练经历");
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await page.waitForTimeout(TASK_DEMO_RESEARCH_MS + 300);
  await expect(pane(page)).toHaveCount(0);
  await send(page, "继续刚才的调研");
  await expect(pane(page).locator(".s2-result-comparison > article")).toHaveCount(3);
});
test("部分失败保留结果，对话只重试失败项", async ({ page }) => {
  await page.goto(`${route}?scenario=error`);
  await send(page, "调研前三位，核实预训练经历");
  await expect(pane(page)).toContainText("调研待重试");
  await send(page, "重试失败的");
  await expect(page.locator(".s2-agent-work.is-working")).toContainText("1 位");
  await expect(pane(page)).not.toContainText("调研待重试");
  await expect(pane(page).locator(".s2-result-comparison > article")).toHaveCount(3);
});
test("证据在当前结果打开，原始来源新标签页，不改变人选范围", async ({ page }) => {
  await open(page);
  await pane(page).getByRole("button", { name: "赵星羽 星澜机器人" }).click();
  await expect(pane(page)).toContainText("91 / 100");
  await expect(pane(page)).toContainText("匹配理由");
  const popup = page.waitForEvent("popup");
  await pane(page).getByRole("link", { name: "查看示例来源" }).click();
  const source = await popup;
  await expect(source.getByRole("heading", { name: "赵星羽 · 示例研究记录" })).toBeVisible();
  expect(page.url()).toContain("candidate-research-demo");
  await source.close();
  await pane(page).getByRole("button", { name: "返回人选结果" }).click();
  await expect(pane(page).getByRole("checkbox")).toHaveCount(0);
});
test("鼠标调整比例，两端自动隐藏，恢复保留草稿与阅读位置", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page);
  await input(page).fill("请先核实这几人的任职时间");
  const panel = pane(page).locator(".s2-result-view-content");
  await panel.evaluate(node => { node.scrollTop = 180; });
  const drag = async fraction => {
    const box = await resultDivider(page).boundingBox();
    const cols = await page.locator(".s2-research-columns").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + 90);
    await page.mouse.down(); await page.mouse.move(cols.x + cols.width * fraction, box.y + 90, { steps: 10 }); await page.mouse.up();
  };
  await drag(0.65);
  const before = await resultDivider(page).getAttribute("aria-valuenow");
  expect(Number(before)).toBeGreaterThan(60);
  await drag(0.1);
  await expect(page.getByRole("region", { name: "候选人调研对话" })).toBeHidden();
  await expect(pane(page)).toBeVisible();
  await page.getByRole("button", { name: "恢复对话与结果分栏" }).click();
  await expect(input(page)).toHaveValue("请先核实这几人的任职时间");
  expect(await panel.evaluate(node => node.scrollTop)).toBe(180);
  expect(Number(await resultDivider(page).getAttribute("aria-valuenow"))).toBeGreaterThan(60);
  await drag(0.9);
  await expect(pane(page)).toBeHidden();
  await expect(input(page)).toBeVisible();
  await page.getByRole("button", { name: "恢复对话与结果分栏" }).click();
  await expect(pane(page)).toBeVisible();
});
test("分隔条可键盘操作，结果全宽可恢复", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await open(page);
  await resultDivider(page).focus(); await page.keyboard.press("ArrowRight");
  await expect(resultDivider(page)).toHaveAttribute("aria-valuenow", "55");
  await page.keyboard.press("Home");
  await expect(input(page)).toBeHidden();
  await page.getByRole("button", { name: "恢复对话与结果分栏" }).click();
  await resultDivider(page).focus(); await page.keyboard.press("End");
  await expect(pane(page)).toBeHidden();
  await page.getByRole("button", { name: "恢复对话与结果分栏" }).click();
});

test("任务列表可搜索并在当前页切换，不打开新标签", async ({ page, context }) => {
  const rail = page.locator(".s2-research-history-rail > .s2-history");
  await expect(rail).toBeVisible();
  await expect(rail.locator('[data-task-id="candidate-research-demo"] .s2-history-item')).toHaveClass(/is-active/);
  await rail.getByPlaceholder("搜索任务").fill("职业机会");
  await expect(rail.locator(".s2-history-entry")).toHaveCount(1);
  const pagesBefore = context.pages().length;
  const popups = [];
  page.on("popup", popup => popups.push(popup));
  await rail.locator(".s2-history-item").click();
  await expect(page).toHaveURL(/#\/tasks\/career-linhao$/);
  await expect(page.locator(".s2-workstream-header h1")).toContainText("林昊");
  expect(popups).toHaveLength(0);
  expect(context.pages()).toHaveLength(pagesBefore);
});

test("任务列表实时收起且不松鼠标可拖回，宽度与结果分栏互不覆盖", async ({ page }) => {
  await open(page);
  const divider = page.getByRole("separator", { name: "调整任务列表宽度" });
  const box = await divider.boundingBox(), root = await page.locator(".s2-research-task-layout").boundingBox();
  await page.mouse.move(box.x + 4, box.y + 120); await page.mouse.down();
  await page.mouse.move(root.x + 350, box.y + 120, { steps: 8 });
  await expect(divider).toHaveAttribute("aria-valuenow", "350");
  await page.mouse.move(root.x + 100, box.y + 120, { steps: 8 });
  await expect(divider).toHaveAttribute("aria-valuenow", "58");
  await expect(page.locator(".s2-research-history-rail > .s2-history")).toHaveClass(/is-collapsed/);
  await page.mouse.move(root.x + 300, box.y + 120, { steps: 8 });
  await expect(divider).toHaveAttribute("aria-valuenow", "300");
  await expect(page.locator(".s2-research-history-rail > .s2-history")).not.toHaveClass(/is-collapsed/);
  await page.mouse.up();
  await expect(resultDivider(page)).toHaveAttribute("aria-valuenow", "50");
  await divider.focus(); await page.keyboard.press("Home");
  await expect(divider).toHaveAttribute("aria-valuenow", "58");
  await page.getByRole("button", { name: "展开任务历史" }).click();
  await expect(divider).toHaveAttribute("aria-valuenow", "300");
  await page.screenshot({ path: `${out}/desktop-task-list-resized.png` });
});

test("对话与结果在鼠标松开前收起，同一次拖拽可反向恢复", async ({ page }) => {
  await open(page);
  const divider = resultDivider(page), root = await page.locator(".s2-research-columns").boundingBox();
  const box = await divider.boundingBox();
  await page.mouse.move(box.x + 4, box.y + 90); await page.mouse.down();
  await page.mouse.move(root.x + root.width * 0.1, box.y + 90, { steps: 8 });
  await expect(input(page)).toBeHidden();
  await expect(pane(page)).toBeVisible();
  await page.mouse.move(root.x + root.width * 0.5, box.y + 90, { steps: 8 });
  await expect(input(page)).toBeVisible();
  await expect(pane(page)).toBeVisible();
  await page.mouse.move(root.x + root.width * 0.9, box.y + 90, { steps: 8 });
  await expect(pane(page)).toBeHidden();
  await expect(input(page)).toBeVisible();
  await page.mouse.move(root.x + root.width * 0.45, box.y + 90, { steps: 8 });
  await expect(pane(page)).toBeVisible(); await page.mouse.up();
  await expect(divider).toHaveAttribute("aria-valuenow", "45");
  expect(await page.evaluate(() => document.body.style.userSelect)).not.toBe("none");
});

for (const [name, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
  test(`${name}不再显示计划或处理回查，结果仍可阅读且草稿保留`, async ({ page }) => {
    await mkdir(out, { recursive: true });
    await page.setViewportSize({ width, height }); await open(page);
    await input(page).fill("下一步先检查任职时间");
    await expect(page.getByRole("button", { name: /^执行计划/ })).toHaveCount(0);
    await expect(page.locator(".s2-runtime, .s2-step-processes")).toHaveCount(0);
    await expect(pane(page)).toContainText("首批候选人");
    await page.getByRole("button", { name: "关闭结果视图" }).click();
    await expect(input(page)).toHaveValue("下一步先检查任职时间");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `${out}/${name}-lightweight-dialogue.png` });
  });
}

test("手机任务列表抽屉不挤占对话，打开关闭保留草稿", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await input(page).fill("原对话未发送的要求");
  await expect(page.getByRole("separator", { name: "调整任务列表宽度" })).toBeHidden();
  await page.getByRole("button", { name: "打开任务列表" }).click();
  const drawer = page.getByRole("dialog", { name: "任务列表" });
  await expect(drawer).toBeVisible();
  await drawer.getByPlaceholder("搜索任务").fill("候选人调研");
  await expect(drawer.locator(".s2-history-entry")).toHaveCount(1);
  await drawer.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(input(page)).toHaveValue("原对话未发送的要求");
});

for (const [label, width, height, theme] of [["desktop", 1440, 1000, "light"], ["medium", 926, 866, "light"], ["mobile", 390, 844, "light"], ["small", 320, 740, "light"], ["dark", 1440, 1000, "dark"]]) {
  test(`${label} 真实截图、名单/比较/分数理由及移动布局`, async ({ page }) => {
    await mkdir(out, { recursive: true });
    await page.setViewportSize({ width, height });
    await page.evaluate(theme => localStorage.setItem("hunter-theme", theme), theme);
    await page.reload(); await open(page); await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${out}/${label}-list.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (width <= 760) {
      const result = await pane(page).boundingBox(), composer = await page.locator(".s2-research-composer-wrap").boundingBox();
      expect(result.y + result.height).toBeLessThanOrEqual(composer.y + 1);
      await expect(input(page)).toBeVisible();
    }
    await send(page, "调研拓界机器人的林昊、赵星羽和陈楚宁，重点核实预训练经历，不联系本人");
    await expect(pane(page).locator(".s2-result-comparison > article")).toHaveCount(3);
    await page.screenshot({ path: `${out}/${label}-comparison.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (width <= 760) {
      await input(page).fill("这是尚未发送的要求，\n需要保留原始输入。\n同时不要遮住结果内容。\n继续增加一行检查高度。");
      const result = await pane(page).boundingBox(), composer = await page.locator(".s2-research-composer-wrap").boundingBox();
      expect(result.y + result.height).toBeLessThanOrEqual(composer.y + 1);
      await page.screenshot({ path: `${out}/${label}-draft.png` });
    }
  });
}
