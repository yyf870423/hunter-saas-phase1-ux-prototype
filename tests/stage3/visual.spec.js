import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  trackConsoleErrors,
} from "../stage1/helpers";

const output = "artifacts/stage3";

async function expectConversationAtLatest(page) {
  await expect
    .poll(() =>
      page
        .locator(".s2-conversation")
        .evaluate((element) =>
          Math.round(
            element.scrollHeight - element.clientHeight - element.scrollTop,
          ),
        ),
    )
    .toBeLessThanOrEqual(1);
}

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

for (const scenario of [
  ["client-xinglan", "公司与联系人结果可以审核", "client"],
  ["mapping-embodied", "人物与关系批次可以审核", "mapping"],
  ["career-linhao", "系统内有 3 个岗位值得查看", "career"],
]) {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "iphone", width: 390, height: 844 },
  ]) {
    test(`截取 ${scenario[2]} ${viewport.name} 主线`, async ({ page }) => {
      const assertNoConsoleErrors = trackConsoleErrors(page);
      await page.setViewportSize(viewport);
      await page.goto(`#/workstreams/${scenario[0]}`);
      await expect(page.getByText(scenario[1])).toBeVisible({
        timeout: 10_000,
      });
      await expectConversationAtLatest(page);
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `${output}/${viewport.name}-${scenario[2]}.png`,
        fullPage: true,
      });
      await assertNoConsoleErrors();
    });
  }
}

test("截取三类业务审核工作区", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const scenario of [
    [
      "client-xinglan",
      "公司与联系人结果可以审核",
      "打开公司与联系人审核",
      "contact-review",
    ],
    [
      "mapping-embodied",
      "人物与关系批次可以审核",
      "打开本批次更新审核",
      "mapping-review",
    ],
    [
      "career-linhao",
      "系统内有 3 个岗位值得查看",
      "查看完整岗位匹配",
      "match-review",
    ],
  ]) {
    await page.goto(`#/workstreams/${scenario[0]}`);
    await expect(page.getByText(scenario[1])).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: scenario[2] }).click();
    if (scenario[3] === "contact-review" || scenario[3] === "match-review") {
      const list = await page
        .locator(
          scenario[3] === "contact-review"
            ? ".s3-contact-list"
            : ".s3-match-list",
        )
        .boundingBox();
      const detail = await page
        .locator(
          scenario[3] === "contact-review"
            ? ".s3-review-detail"
            : ".s3-match-detail",
        )
        .boundingBox();
      expect(list).not.toBeNull();
      expect(detail).not.toBeNull();
      expect(detail.width).toBeGreaterThan(list.width);
    }
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/desktop-${scenario[3]}.png`,
      fullPage: true,
    });
  }
});

test("人才摸排关系影响区域宽于左侧变化列表", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/workstreams/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开本批次更新审核" }).click();
  await page.getByRole("tab", { name: /人物与关系/ }).click();
  await page
    .getByRole("button", { name: /王奕的身份与成果关系待确认/ })
    .click();
  const list = await page.locator(".s3-context-change-list").boundingBox();
  const detail = await page.locator(".s3-context-graph").boundingBox();
  expect(list).not.toBeNull();
  expect(detail).not.toBeNull();
  expect(detail.width).toBeGreaterThan(list.width);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/desktop-mapping-person-review.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "确认写入王奕身份关系" }).click();
  await expect(
    page.getByRole("button", { name: "撤销确认王奕身份关系" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /冲突与待补充/ }).click();
  await page.getByRole("button", { name: /王奕身份关系冲突/ }).click();
  await page.screenshot({
    path: `${output}/desktop-mapping-pending-review.png`,
    fullPage: true,
  });
});

test("截取人才摸排变化项对应的关系影响", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/workstreams/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开本批次更新审核" }).click();
  for (const [item, file] of [
    ["星澜机器人组织层级补充", "organization"],
    ["目标公司生态关系更新", "ecosystem"],
    ["方向与关键角色覆盖更新", "direction-role"],
    ["近 24 个月人才流动更新", "talent-flow"],
  ]) {
    await page.getByRole("button", { name: new RegExp(item) }).click();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/desktop-mapping-${file}-graph.png`,
      fullPage: true,
    });
  }
  await page.getByRole("tab", { name: /人物与关系/ }).click();
  for (const [item, file] of [
    ["林昊的人物关系补充", "people"],
    ["赵星羽的可联系路径补充", "contact-path"],
    ["周明远的成果关系补充", "academic"],
  ]) {
    await page.getByRole("button", { name: new RegExp(item) }).click();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/desktop-mapping-${file}-graph.png`,
      fullPage: true,
    });
  }
});

test("截取移动端人才摸排关系画布", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("#/workstreams/mapping-embodied");
  await expect(page.getByText("人物与关系批次可以审核")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "打开本批次更新审核" }).click();
  await page.getByRole("tab", { name: /人物与关系/ }).click();
  await page.getByRole("button", { name: /赵星羽的可联系路径补充/ }).click();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/iphone-mapping-contact-path-graph.png`,
    fullPage: true,
  });
  await page
    .getByRole("heading", { name: "赵星羽", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `${output}/iphone-mapping-contact-path-detail.png`,
    fullPage: true,
  });
});

test("截取阶段三等待、冲突和资料回流状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, marker, file] of [
    [
      "client-xinglan?state=waiting",
      "等待陈雨回复招聘合作邮件",
      "client-waiting",
    ],
    [
      "client-xinglan?state=no-contact",
      "暂未找到可以直接联系的招聘负责人",
      "client-no-contact",
    ],
    ["client-xinglan?state=reply", "回复已形成一条招聘机会", "client-reply"],
    [
      "mapping-embodied?state=conflict",
      "人物与关系批次可以审核",
      "mapping-conflict",
    ],
    [
      "career-linhao?state=no-position",
      "当前没有合适的系统内岗位",
      "career-no-position",
    ],
    [
      "career-linhao?state=new-resume",
      "新简历已合并，2 个岗位需要重新判断",
      "career-new-resume",
    ],
  ]) {
    await page.goto(`#/workstreams/${route}`);
    await expect(page.getByText(marker)).toBeVisible({ timeout: 10_000 });
    await expectConversationAtLatest(page);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/desktop-${file}.png`,
      fullPage: true,
    });
  }
});

test("截取岗位招聘的审核、外部等待和简历回流状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, marker, file] of [
    ["position-vla?state=review", "首批候选人已经可以审核", "position-review"],
    [
      "position-vla?state=waiting",
      "等待 3 位候选人回复岗位沟通",
      "position-waiting",
    ],
    [
      "position-vla?state=candidate-reply",
      "林昊的新简历已合并并完成局部重匹配",
      "position-candidate-reply",
    ],
  ]) {
    await page.goto(`#/workstreams/${route}`);
    await expect(page.getByText(marker)).toBeVisible({ timeout: 10_000 });
    await expectConversationAtLatest(page);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${output}/desktop-${file}.png`,
      fullPage: true,
    });
  }
});

test("截取岗位招聘无候选人结果", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("#/workstreams/position-vla?state=no-candidate");
  await expect(page.getByText("本轮没有候选人通过岗位门禁")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${output}/desktop-position-no-candidate.png`,
    fullPage: true,
  });
});
