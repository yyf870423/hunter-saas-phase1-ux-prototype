import { mkdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { candidates } from "../../src/stage4/data.js";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const company = "#/companies/company-xinglan";
const contact = `${company}/contacts/contact-chenyu`;
const field = (page, label) =>
  page
    .locator(".s4-form-field")
    .filter({
      has: page.locator("span", { hasText: new RegExp(`^${label}\\*?$`) }),
    })
    .locator("input,textarea");

test("联系人只从所属公司创建，列表与刷新持久化", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await page.goto(`${company}?tab=contacts`);
  await expect(page.locator('.s1-sidebar a[href="#/contacts"]')).toHaveCount(0);
  await expect(page.locator(".s4-relation-table > button")).toHaveCount(2);
  await page.getByRole("button", { name: "添加联系人" }).click();
  await expect(page).toHaveURL(/company-xinglan\/contacts\/new/);
  await expect(field(page, "所属公司")).toHaveValue("星澜机器人");
  await expect(field(page, "所属公司")).toBeDisabled();
  await page.getByRole("button", { name: "创建联系人" }).click();
  await expect(
    page.getByText("请输入姓名或明确称呼", { exact: true }),
  ).toBeVisible();
  await page.getByPlaceholder("例如：陈雨").fill("陈雨");
  await field(page, "邮箱").fill("invalid");
  await page.getByRole("button", { name: "创建联系人" }).click();
  await expect(page.getByText("邮箱格式不正确。")).toBeVisible();
  await field(page, "邮箱").fill("yu.chen@xinglan-robotics.com");
  await page.getByRole("button", { name: "创建联系人" }).click();
  await expect(page.getByText(/该公司下已存在相同身份/)).toBeVisible();
  await page.getByPlaceholder("例如：陈雨").fill("测试顾问");
  await field(page, "邮箱").fill("consultant@example.com");
  await page.getByRole("button", { name: "创建联系人" }).click();
  await expect(
    page.getByRole("heading", { name: "测试顾问", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "测试顾问", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "返回公司联系人" }).click();
  await expect(page.locator(".s4-relation-table > button")).toHaveCount(3);
  await page.getByPlaceholder("搜索姓名、角色、手机或邮箱").fill("测试顾问");
  await expect(page.locator(".s4-relation-table > button")).toHaveCount(1);
  await check();
});

test("不同公司的同名记录和沟通内容互不影响", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await page.goto("#/companies/company-tuojie/contacts/new");
  await page.getByPlaceholder("例如：陈雨").fill("陈雨");
  await field(page, "邮箱").fill("yu.chen@xinglan-robotics.com");
  await page.getByRole("button", { name: "创建联系人" }).click();
  const created = page.url();
  await page.getByRole("tab", { name: "跟进与沟通" }).click();
  await expect(page.getByText("暂无沟通记录")).toBeVisible();
  await page.getByRole("button", { name: "添加沟通记录" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "保存", exact: true })
    .click();
  await expect(page.getByText("请输入沟通内容")).toBeVisible();
  await page
    .getByRole("dialog")
    .locator("textarea")
    .fill("仅属于拓界的合作记录");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "保存", exact: true })
    .click();
  await page.goto(`${contact}?tab=timeline`);
  await expect(page.getByText("仅属于拓界的合作记录")).toHaveCount(0);
  await page.goto(`${created}?tab=timeline`);
  await expect(page.getByText("仅属于拓界的合作记录")).toBeVisible();
  await page.goto("#/companies/company-xinglan/contacts/contact-zhangmin");
  await expect(page.getByText("没有找到该公司下的联系人")).toBeVisible();
  await check();
});

test("新建关联候选人带入完整联系资料并锁定，创建后从联系人更新", async ({
  page,
}) => {
  const check = trackConsoleErrors(page);
  await page.goto(`${company}/contacts/new`);
  await page.getByRole("button", { name: "创建联系人" }).click();
  await page.getByRole("button", { name: "关联候选人", exact: true }).click();
  await page.getByRole("button", { name: /林昊 ·/ }).click();
  await expect(
    page.getByText("请输入姓名或明确称呼", { exact: true }),
  ).toHaveCount(0);
  const source = candidates.find(
    (candidate) => candidate.id === "candidate-linhao",
  );
  for (const [label, value] of [
    ["姓名或明确称呼", source.name],
    ["手机", source.phone],
    ["邮箱", source.email],
    ["所在地区", source.location],
    ["职位或角色", source.title],
  ]) {
    await expect(field(page, label)).toHaveValue(value);
    await expect(field(page, label)).toBeDisabled();
  }
  await expect(field(page, "所属公司")).toHaveValue("星澜机器人");
  await expect(field(page, "用户备注")).toBeEditable();
  await field(page, "用户备注").fill("星澜顾问关系");
  await mkdir("artifacts/company-contact-subassets", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `artifacts/company-contact-subassets/create-linked-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.getByRole("button", { name: "创建联系人" }).click();
  await expect(
    page.getByRole("heading", { name: "林昊", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "编辑联系方式" }).click();
  await expect(field(page, "手机")).toBeEditable();
  await expect(field(page, "邮箱")).toBeEditable();
  await field(page, "手机").fill("13900001234");
  await field(page, "邮箱").fill("lin.contact@example.com");
  await page.getByRole("button", { name: "保存修改" }).click();
  await page.reload();
  await expect(page.getByText("13900001234", { exact: true })).toBeVisible();
  await expect(
    page.getByText("lin.contact@example.com", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("星澜顾问关系", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "查看候选人" }).click();
  await expect(page.getByText(source.phone, { exact: true })).toBeVisible();
  await expect(page.getByText(source.email, { exact: true })).toBeVisible();
  await check();
});

test("切换候选人不会混用联系方式，切回手工保留原输入", async ({ page }) => {
  await page.goto(`${company}/contacts/new`);
  await field(page, "姓名或明确称呼").fill("手工联系人");
  await field(page, "手机").fill("13900005678");
  await field(page, "邮箱").fill("manual@example.com");
  await page.getByRole("button", { name: "关联候选人", exact: true }).click();
  await page.getByRole("button", { name: /林昊 ·/ }).click();
  await expect(field(page, "邮箱")).toHaveValue("hao.lin@example.com");
  await page.getByRole("button", { name: "关联候选人", exact: true }).click();
  await page.getByRole("button", { name: /赵星羽 ·/ }).click();
  await expect(field(page, "姓名或明确称呼")).toHaveValue("赵星羽");
  await expect(field(page, "手机")).toHaveValue("");
  await expect(field(page, "邮箱")).toHaveValue("");
  await expect(field(page, "邮箱")).toBeDisabled();
  await page.getByRole("button", { name: "关联候选人", exact: true }).click();
  await page.getByRole("button", { name: "手工填写", exact: true }).click();
  await expect(field(page, "姓名或明确称呼")).toHaveValue("手工联系人");
  await expect(field(page, "手机")).toHaveValue("13900005678");
  await expect(field(page, "邮箱")).toHaveValue("manual@example.com");
  await expect(field(page, "邮箱")).toBeEditable();
});

test("编辑任职不允许更换所属公司，资料保存后可刷新", async ({ page }) => {
  await page.goto(contact);
  await page.getByRole("button", { name: "编辑任职信息" }).click();
  await expect(field(page, "所属公司")).toBeDisabled();
  await field(page, "职位或角色").fill("人才招聘总监");
  await page.getByRole("button", { name: "保存修改" }).click();
  await page.reload();
  await expect(page.getByText("人才招聘总监 · 当前")).toBeVisible();
  await page.getByRole("button", { name: "关联候选人", exact: true }).click();
  await page.getByRole("dialog").locator(".s4-select > button").click();
  await page.getByRole("button", { name: /林昊 ·/ }).click();
  await page.getByRole("button", { name: "保存关联" }).click();
  await expect(page.getByRole("button", { name: "查看候选人" })).toBeVisible();
});

test("公司恢复不会复活此前单独删除的联系人", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await page.goto(contact);
  await page
    .locator(".s4-detail-header")
    .getByRole("button", { name: "删除", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "删除并进入回收站" })
    .click();
  await expect(page.locator(".s4-relation-table > button")).toHaveCount(1);
  await page
    .locator(".s4-detail-header")
    .getByRole("button", { name: "删除", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "删除并进入回收站" })
    .click();
  await expect(page).toHaveURL(/#\/companies$/);
  await page.goto("#/recycle-bin");
  const contactRow = page
    .locator(".s4-recycle-table > article")
    .filter({ hasText: "陈雨" });
  await contactRow.getByRole("button", { name: "恢复", exact: true }).click();
  await page.getByRole("button", { name: "确认恢复" }).click();
  await expect(
    page.getByText("请先恢复所属公司，再恢复联系人。"),
  ).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "取消" }).click();
  await page
    .locator(".s4-recycle-table > article")
    .filter({ hasText: "包含 1 条本次随公司删除" })
    .getByRole("button", { name: "恢复", exact: true })
    .click();
  await page.getByRole("button", { name: "确认恢复" }).click();
  await page.goto(`${company}?tab=contacts`);
  await expect(page.locator(".s4-relation-table > button")).toHaveCount(1);
  await expect(page.locator(".s4-relation-table")).toContainText("周琪");
  await check();
});

test("文件可校验、上传、预览和下载，刷新后仍在所属联系人下", async ({
  page,
}) => {
  const check = trackConsoleErrors(page);
  await page.goto(`${contact}?tab=files`);
  await page.getByRole("button", { name: "上传文件" }).click();
  await page
    .getByRole("dialog")
    .locator('input[type="file"]')
    .setInputFiles({
      name: "bad.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("bad"),
    });
  await page.getByRole("button", { name: "保存文件" }).click();
  await expect(page.getByText(/文件格式不支持/)).toBeVisible();
  await page
    .getByRole("dialog")
    .locator('input[type="file"]')
    .setInputFiles({
      name: "客户沟通.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("星澜客户沟通记录"),
    });
  await page.getByRole("button", { name: "保存文件" }).click();
  await expect(page.getByText("文件已保存", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "预览", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("星澜客户沟通记录");
  await page.getByRole("dialog").getByRole("button", { name: "关闭" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("客户沟通.txt");
  await page
    .locator(".s4-detail-header")
    .getByRole("button", { name: "删除", exact: true })
    .click();
  await page.getByRole("button", { name: "删除并进入回收站" }).click();
  await expect(page).toHaveURL(/company-xinglan\?tab=contacts$/);
  await page.goto("#/recycle-bin");
  await page
    .locator(".s4-recycle-table > article")
    .filter({ hasText: "陈雨" })
    .getByRole("button", { name: "永久删除", exact: true })
    .click();
  await page.getByRole("button", { name: "确认永久删除" }).click();
  await expect(page.getByText("资产已永久删除", { exact: true })).toBeVisible();
  const count = await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("hunter-contact-files", 1);
        request.onsuccess = () => {
          const db = request.result;
          const count = db.transaction("files").objectStore("files").count();
          count.onsuccess = () => {
            resolve(count.result);
            db.close();
          };
          count.onerror = () => reject(count.error);
        };
        request.onerror = () => reject(request.error);
      }),
  );
  expect(count).toBe(0);
  await check();
});

test("公司列表必要状态与其他公司引用正确", async ({ page }) => {
  await page.goto(`${company}?tab=contacts&state=loading`);
  await expect(page.getByLabel("联系人正在加载")).toBeVisible();
  await page.goto(`${company}?tab=contacts&state=permission-limited`);
  await expect(page.getByRole("button", { name: "添加联系人" })).toBeDisabled();
  await page.goto(`${company}?tab=contacts&state=error`);
  await page.getByRole("button", { name: "重新加载" }).click();
  await expect(page.locator(".s4-relation-table > button")).toHaveCount(2);
  await page.goto("#/opportunities/opportunity-tuojie");
  await expect(page.getByText("张敏 · 人才招聘总监")).toBeVisible();
  await page.getByRole("button", { name: "查看联系人" }).click();
  await expect(page).toHaveURL(/company-tuojie\/contacts\/contact-zhangmin/);
});

test("桌面和移动端联系人页面截图与溢出检查", async ({ page }) => {
  const check = trackConsoleErrors(page);
  await mkdir("artifacts/company-contact-subassets", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    for (const [name, route] of [
      ["list", `${company}?tab=contacts`],
      ["detail", contact],
      ["create", `${company}/contacts/new`],
      ["timeline", `${contact}?tab=timeline`],
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `artifacts/company-contact-subassets/${name}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await check();
});
