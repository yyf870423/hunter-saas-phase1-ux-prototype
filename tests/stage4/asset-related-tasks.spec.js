import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { getAssetTasks } from "../../src/stage2/task-asset-references";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const surfaces = [
  ["company", "companies/company-xinglan", 2],
  ["contact", "companies/company-xinglan/contacts/contact-chenyu", 1],
  ["position", "positions/position-vla", 1],
  ["opportunity", "opportunities/opportunity-xinglan", 1],
  ["candidate", "candidates/candidate-linhao", 3],
  ["graph", "mappings/mapping-embodied", 2],
  ["paper", "papers/paper-vla-survey", 0],
  ["patent", "patents/patent-manipulation", 0],
];

for (const [type, route, count] of surfaces) {
  test(`${type} 恢复只读关联任务，桌面和手机入口可用`, async ({ page }) => {
    const check = trackConsoleErrors(page);
    await mkdir("artifacts/asset-related-tasks", { recursive: true });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(`#/${route}`);
      if (!["paper", "patent"].includes(type)) {
        const tab = page.getByRole("tab", { name: "关联任务", exact: true });
        await tab.click();
        await tab.scrollIntoViewIfNeeded();
        await expect(tab).toHaveAttribute("aria-selected", "true");
      }
      const section = page.locator(".s4-asset-related-tasks");
      await expect(
        section.getByRole("heading", { name: "关联任务" }),
      ).toBeVisible();
      await expect(section.locator(".s4-source-list > button")).toHaveCount(
        count,
      );
      if (!count) await expect(section).toContainText("暂无关联任务");
      await expect(
        section.getByRole("button", { name: /关联|解除|新建|编辑/ }),
      ).toHaveCount(0);
      await expect(section).not.toContainText("AI 处理记录");
      await expect(
        page.getByRole("tab", { name: /^(相关业务|关联业务)$/ }),
      ).toHaveCount(0);
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `artifacts/asset-related-tasks/${type}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
    await check();
  });
}

test("关联任务跳转到对应用户任务而非 AI 处理页", async ({ page }) => {
  for (const [route, title, taskId] of [
    [
      "companies/company-xinglan/contacts/contact-chenyu",
      "星澜机器人招聘合作",
      "client-xinglan",
    ],
    ["positions/position-vla", "具身智能 VLA 算法负责人", "position-vla"],
    [
      "candidates/candidate-linhao",
      "整理林昊的面试反馈",
      "task-interview-summary",
    ],
    ["mappings/mapping-embodied", "核验灵巧手团队负责人", "task-hand-team"],
  ]) {
    await page.goto(`#/${route}?tab=work`);
    await page
      .locator(".s4-asset-related-tasks")
      .getByRole("button", { name: new RegExp(title) })
      .click();
    await expect(page).toHaveURL(new RegExp(`#/tasks/${taskId}$`));
    await expect(page.locator("h1")).toBeVisible();
    await page.goBack();
    await expect(page.locator(".s4-asset-related-tasks")).toBeVisible();
  }
});

test("同公司的未引用联系人不继承公司任务", async ({ page }) => {
  await page.goto(
    "#/companies/company-xinglan/contacts/contact-zhouqi?tab=work",
  );
  await expect(page.locator(".s4-asset-related-tasks")).toContainText(
    "暂无关联任务",
  );
  await expect(
    page.locator(".s4-asset-related-tasks .s4-source-list"),
  ).toHaveCount(0);
});

test("任务引用按类型和稳定 ID 匹配，联系人必须同时匹配公司", () => {
  const tasks = [
    {
      id: "task-a",
      assetRefs: [
        { type: "contact", id: "same-id", companyId: "company-a" },
        { type: "contact", id: "same-id", companyId: "company-a" },
      ],
    },
  ];
  expect(
    getAssetTasks(
      { type: "contact", id: "same-id", companyId: "company-a" },
      tasks,
    ),
  ).toHaveLength(1);
  expect(
    getAssetTasks(
      { type: "contact", id: "same-id", companyId: "company-b" },
      tasks,
    ),
  ).toEqual([]);
  expect(getAssetTasks({ type: "candidate", id: "same-id" }, tasks)).toEqual(
    [],
  );
  expect(getAssetTasks({ type: "contact", id: "same-id" }, tasks)).toEqual([]);
  expect(
    getAssetTasks(
      { type: "contact", id: "other-id", companyId: "company-a" },
      tasks,
    ),
  ).toEqual([]);
});

test("关联任务覆盖加载、空、失败重试和受限状态", async ({ page }) => {
  for (const [state, title] of [
    ["loading", "正在加载关联任务"],
    ["empty", "暂无关联任务"],
    ["permission-limited", "暂无权限查看关联任务"],
    ["error", "关联任务加载失败"],
  ]) {
    await page.goto(`#/companies/company-xinglan?tab=work&tasks=${state}`);
    const section = page.locator(".s4-asset-related-tasks");
    await expect(section).toContainText(title);
    await expect(section.locator(".s4-source-list")).toHaveCount(0);
    if (state === "loading")
      await expect(section.locator("[aria-live]")).toHaveAttribute(
        "aria-busy",
        "true",
      );
    if (state === "error") {
      await section.getByRole("button", { name: "重试" }).click();
      await expect(section.locator(".s4-source-list > button")).toHaveCount(2);
      await expect(page).toHaveURL(/tab=work$/);
    }
  }
});

test("空图谱也能查看关联任务空态", async ({ page }) => {
  await page.goto("#/mappings/graph-empty?tab=history");
  await expect(
    page.getByRole("tab", { name: "图谱内容", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "关联任务", exact: true }).click();
  await expect(page.locator(".s4-asset-related-tasks")).toContainText(
    "暂无关联任务",
  );
  await expect(page.getByRole("tab", { name: "更新与审核" })).toHaveCount(0);
});
