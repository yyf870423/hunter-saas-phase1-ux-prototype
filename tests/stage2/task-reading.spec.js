import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { confirmClientOpportunity } from "../stage3/client-helpers";

const out = process.env.RESEARCH_CAPTURE_DIR || "/Users/eric.yu/job_hunting/docs/hb-test-20261104/round4/local-align/agent-result-design-20261118";
const input = page => page.getByRole("textbox", { name: "任务对话输入" });
const send = async (page, text) => { await input(page).fill(text); await input(page).press("Enter"); await expect(input(page)).toBeEnabled(); };
const cases = [
  ["position-vla?state=review", "查看候选人结果（18）", "候选人结果", "林昊"],
  ["mapping-embodied?state=conflict", "查看组织梳理结果", "组织梳理结果", "星澜机器人 · VLA 算法负责人"],
  ["career-linhao?state=waiting", "查看完整岗位匹配", "岗位匹配结果", "具身智能 VLA 算法负责人"],
  ["client-xinglan", "查看联系人结果", "联系人结果", "陈雨"],
];
async function openCase(page, item) {
  await page.goto(`#/tasks/${item[0]}`);
  if (item[0] === "client-xinglan") await confirmClientOpportunity(page);
  await page.getByRole("button", { name: item[1], exact: true }).click();
  return page.getByRole("complementary", { name: item[2], exact: true });
}
test.beforeEach(async ({ page }) => {
  page.__failures = [];
  page.on("pageerror", error => page.__failures.push(error.message));
  page.on("console", message => { if (message.type() === "error") page.__failures.push(message.text()); });
  await page.route("**/*", async route => {
    const request = route.request(), url = new URL(request.url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname) && !["data:", "blob:"].includes(url.protocol)) { page.__failures.push(`external:${url.origin}`); return route.abort(); }
    if (!["GET", "HEAD"].includes(request.method())) { page.__failures.push(`write:${request.method()}`); return route.abort(); }
    return route.continue();
  });
});
test.afterEach(async ({ page }) => { expect(page.__failures).toEqual([]); });

for (const item of cases) test(`${item[2]}只读、原对话保留、关闭不丢草稿`, async ({ page }) => {
  const pane = await openCase(page, item);
  await expect(pane).toBeVisible();
  await expect(pane.getByRole("checkbox")).toHaveCount(0);
  await expect(pane.getByRole("button", { name: /提交|保存|写入/ })).toHaveCount(0);
  await pane.getByRole("button", { name: item[3], exact: false }).first().click();
  await expect(pane.getByRole("heading", { name: item[3], exact: true })).toBeVisible();
  await input(page).fill("先核实证据，暂不保存。");
  await pane.getByRole("button", { name: "关闭结果", exact: true }).click();
  await expect(input(page)).toHaveValue("先核实证据，暂不保存。");
  await page.getByRole("button", { name: item[1], exact: true }).click();
  await expect(input(page)).toHaveValue("先核实证据，暂不保存。");
  await expect(pane.getByRole("heading", { name: item[3], exact: true })).toBeVisible();
  await expect(page.getByRole("separator", { name: "调整任务列表宽度" })).toBeVisible();
});
test("组织图只读并保留冲突和证据，不在图上确认写入", async ({ page }) => {
  const pane = await openCase(page, cases[1]);
  await pane.getByRole("tab", { name: "组织关系" }).click();
  await expect(pane.locator(".s3-relationship-workspace")).toBeVisible();
  await expect(pane.getByRole("button", { name: /确认.*写入|添加节点/ })).toHaveCount(0);
  await expect(pane).toContainText("星澜");
});
test("组织保存由原对话提出草稿，确认后仅写本地示例，取消不写", async ({ page }) => {
  await openCase(page, cases[1]);
  await send(page, "保存当前整批人才地图，保留待核实项");
  await expect(page.getByRole("heading", { name: "待确认的人才地图更新" })).toBeVisible();
  await send(page, "取消");
  await expect(page.locator(".s2-timeline")).toContainText("这次不保存");
  await send(page, "保存当前整批人才地图");
  await send(page, "确认");
  await expect(page.locator(".s2-timeline")).toContainText("人才地图已更新");
  await expect(page.locator(".s2-user-message").last().locator(":scope > div")).toHaveText("确认");
  await expect(input(page)).toHaveValue("");
});
test("地图草稿后新增附件使旧确认失效，不伪称已解析", async ({ page }) => {
  await openCase(page, cases[1]);
  await send(page, "保存当前整批人才地图");
  await page.locator('.s2-composer input[type="file"]').setInputFiles({ name: "补充组织资料.txt", mimeType: "text/plain", buffer: Buffer.from("新增待核实的组织证据") });
  await send(page, "先参考这份新资料");
  await expect(page.locator(".s2-timeline")).toContainText("旧草稿未执行且已失效");
  await send(page, "确认");
  await expect(page.locator(".s2-timeline")).not.toContainText("人才地图已更新");
});
test("仅分析确认不写入，未实现的核实不冒充成功", async ({ page }) => {
  await openCase(page, cases[1]);
  await page.locator(".s2-auth-select > button").click();
  await page.getByRole("option", { name: /仅分析/ }).click();
  await send(page, "保存当前整批人才地图");
  await send(page, "确认");
  await expect(page.locator(".s2-timeline")).toContainText("当前仅分析，没有执行保存");
  await send(page, "核实王奕的身份冲突");
  await expect(page.locator(".s2-timeline")).toContainText("没有启动真实调研");
});
for (const width of [1440, 926, 390]) for (const item of cases) test(`${width}px ${item[2]}截图与溢出检查`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  const pane = await openCase(page, item);
  await expect(pane).toBeVisible();
  await expect(input(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await mkdir(out, { recursive: true });
  await page.screenshot({ path: `${out}/${item[0].split("?")[0]}-${width}.png` });
});
