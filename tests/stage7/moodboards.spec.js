import { expect, test } from "@playwright/test";

const themes = [
  [
    "orchestration",
    "AI 招聘编排中枢",
    "让每一个招聘目标，都成为持续推进的工作。",
  ],
  ["graph", "人才智能图谱", "从零散线索，看见完整的人才关系。"],
  ["observatory", "AI 人才观测站", "机会出现时，不再等你偶然发现。"],
];

async function expectCanvasHasPixels(page) {
  await expect(page.locator(".s7-scene-canvas canvas").first()).toBeVisible();
  await page.waitForTimeout(250);
  const sample = await page
    .locator(".s7-scene-canvas canvas")
    .first()
    .evaluate((canvas) => {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) return { context: false, active: 0 };
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      let active = 0;
      for (let index = 0; index < pixels.length; index += 64) {
        if (pixels[index] + pixels[index + 1] + pixels[index + 2] > 12)
          active += 1;
      }
      return { context: true, active };
    });
  expect(sample.context).toBe(true);
  expect(sample.active).toBeGreaterThan(20);
}

test("moodboard index links to all three directions", async ({ page }) => {
  await page.goto("#/moodboards");
  await expect(
    page.getByRole("heading", { name: "三种 Hunter 品牌表达方向" }),
  ).toBeVisible();
  await expect(page.locator(".s7-index-card")).toHaveCount(3);
  for (const [, name] of themes) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
});

for (const [theme, , title] of themes) {
  test(`${theme} homepage renders an interactive 3D scene`, async ({
    page,
  }) => {
    await page.goto(`#/moodboards/${theme}`);
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await expectCanvasHasPixels(page);
    await page.locator("#how").scrollIntoViewIfNeeded();
    await expect(page.locator("#how")).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  });
}

test("orchestration process updates the selected explanation", async ({
  page,
}) => {
  await page.goto("#/moodboards/orchestration");
  await page.locator("#how").scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: /人工审核/ }).click();
  await expect(
    page.getByRole("heading", { name: "把需要判断的内容，集中交给人" }),
  ).toBeVisible();
});

test("user registration validates and reaches a success state", async ({
  page,
}) => {
  await page.goto("#/moodboards/graph/auth?mode=register");
  await page.getByRole("button", { name: "提交申请" }).click();
  await expect(page.getByText("请输入姓名")).toBeVisible();
  await page.getByLabel("姓名").fill("林昊");
  await page.getByLabel("手机号或邮箱").fill("linhao@example.com");
  await page.getByLabel("验证码").fill("482716");
  await page.getByRole("textbox", { name: "密码" }).fill("hunter2026");
  await page.getByRole("button", { name: "提交申请" }).click();
  await expect(page.getByRole("heading", { name: "申请已提交" })).toBeVisible();
});

test("operations login requires a second factor", async ({ page }) => {
  await page.goto("#/moodboards/observatory/ops-login");
  await page.getByLabel("运营账号").fill("ops@hunter.cn");
  await page.getByRole("textbox", { name: "密码" }).fill("hunter-ops-2026");
  await page.getByRole("button", { name: "继续" }).click();
  await expect(
    page.getByRole("heading", { name: "完成二次验证" }),
  ).toBeVisible();
  await page.getByLabel("动态验证码").fill("275941");
  await page.getByRole("button", { name: "验证并进入" }).click();
  await expect(
    page.getByRole("heading", { name: "身份验证成功" }),
  ).toBeVisible();
});

test("reduced motion keeps the 3D meaning without continuous animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("#/moodboards/orchestration");
  await expectCanvasHasPixels(page);
  await expect(
    page.getByText("正在编排：具身智能 VLA 算法负责人"),
  ).toBeVisible();
});

test("public and authentication routes do not emit runtime errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const route of [
    "/moodboards",
    "/moodboards/orchestration",
    "/moodboards/graph/auth?mode=register",
    "/moodboards/observatory/ops-login?state=mfa",
  ]) {
    await page.goto(`#${route}`);
    await page.waitForTimeout(180);
  }
  expect(errors).toEqual([]);
});

for (const viewport of [
  { name: "iphone", width: 390, height: 844 },
  { name: "ipad", width: 820, height: 1180 },
]) {
  test(`${viewport.name} layouts do not overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const [theme] of themes) {
      await page.goto(`#/moodboards/${theme}`);
      await expect(page.locator(".s7-hero")).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });
}
