import { expect, test } from "@playwright/test";

test("landing page exposes user login but not operations login", async ({
  page,
}) => {
  await page.goto("./");

  await expect(
    page.getByRole("heading", { name: /给我一个难岗位/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "登录" }).first(),
  ).toHaveAttribute("href", "#/login");
  await expect(page.locator('a[href="#/ops/login"]')).toHaveCount(0);
  await expect(page.locator("#comparison")).toHaveCount(0);
  await expect(page.getByText("不是多一个记录库")).toHaveCount(0);

  await page.getByRole("link", { name: "登录" }).first().click();
  await expect(page).toHaveURL(/#\/login$/);
  await expect(
    page.getByRole("heading", { name: "登录 Hunter" }),
  ).toBeVisible();
});

test("hero keeps two semantic title lines and every evidence sheet in frame", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");

  const result = await page.evaluate(() => {
    const stage = document
      .querySelector(".lp-evidence-stage")
      .getBoundingClientRect();
    const titleLines = [
      ...document.querySelectorAll(".lp-hero .lp-title-line"),
    ];
    const sheets = [...document.querySelectorAll(".lp-evidence-sheet")];
    return {
      titleLineCount: titleLines.length,
      titleLinesFit: titleLines.every(
        (line) => line.scrollWidth <= line.clientWidth + 1,
      ),
      sheetsFit: sheets.every((sheet) => {
        const box = sheet.getBoundingClientRect();
        return box.left >= stage.left - 1 && box.right <= stage.right + 1;
      }),
    };
  });

  expect(result).toEqual({
    titleLineCount: 2,
    titleLinesFit: true,
    sheetsFit: true,
  });
});

test("mobile menu contains the user login entry", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  await page.getByRole("button", { name: "打开导航菜单" }).click();
  await expect(page.getByRole("link", { name: "登录" }).first()).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollLeft", 0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("auth brand headline keeps two semantic lines without clipping", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1040, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 760 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./#/login");

    const result = await page
      .locator(".auth-brand-copy h1")
      .evaluate((title) => {
        const lines = [...title.children];
        return {
          lineCount: lines.length,
          linesFit: lines.every(
            (line) => line.scrollWidth <= line.clientWidth + 1,
          ),
          pageFits:
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        };
      });

    expect(result).toEqual({
      lineCount: 2,
      linesFit: true,
      pageFits: true,
    });
  }
});

test("evidence motion advances normally and pauses for reduced motion", async ({
  page,
}) => {
  await page.goto("./");
  const activeStage = page.locator(".lp-evidence-sheet.is-active");
  const initialStage = await activeStage.innerText();
  await expect(page.locator(".lp-track-pulse")).toHaveCSS(
    "animation-name",
    "lp-track-pulse",
  );
  await page.waitForTimeout(3_000);
  expect(await activeStage.innerText()).not.toBe(initialStage);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const reducedStage = await activeStage.innerText();
  await page.waitForTimeout(3_000);
  expect(await activeStage.innerText()).toBe(reducedStage);
});

test("workflow proof switches immediately without simulated loading", async ({
  page,
}) => {
  await page.goto("./");
  const workflow = page.locator(".lp-proof-window");

  await workflow.scrollIntoViewIfNeeded();
  await workflow.getByRole("tab", { name: /候选人判断/ }).click();
  await expect(
    workflow.getByRole("heading", {
      name: "周岚为什么值得看，哪里还不能下结论",
    }),
  ).toBeVisible();
  await expect(workflow).not.toHaveClass(/is-loading/);
});

test("narrow mobile titles do not clip or create horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("./");

  const layout = await page.evaluate(() => ({
    pageFits:
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
    titleLinesFit: [...document.querySelectorAll(".lp-title-line")].every(
      (line) => line.scrollWidth <= line.clientWidth + 1,
    ),
  }));

  expect(layout).toEqual({ pageFits: true, titleLinesFit: true });
});

test("demo request dialog exposes errors without sending data", async ({
  page,
}) => {
  await page.goto("./");
  const opener = page.getByRole("button", { name: "拿一个岗位来演示" }).first();
  await opener.focus();
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByPlaceholder("例如：沈岚")).toBeFocused();
  await page.getByPlaceholder("例如：沈岚").press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "关闭演示预约" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "关闭演示预约" }).press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "拿一个岗位来演示" }).last(),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(opener).toBeFocused();

  await opener.click();
  await page.getByRole("button", { name: "拿一个岗位来演示" }).last().click();
  await expect(page.getByText(/请告诉我们怎么称呼你/)).toBeVisible();
  await expect(page.getByText(/请填写你的品牌或团队/)).toBeVisible();
  await expect(page.getByText(/请输入工作邮箱或手机号/)).toBeVisible();
});

test("user auth supports validation, QR login and registration", async ({
  page,
}) => {
  await page.goto("./#/login");

  await page.getByLabel("手机号").focus();
  await expect(page.getByLabel("手机号")).toHaveCSS("box-shadow", "none");
  await expect(page.locator(".auth-input-wrap").first()).toHaveCSS(
    "box-shadow",
    "none",
  );

  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByText("请输入有效的 11 位手机号")).toBeVisible();
  await expect(page.getByText("请输入 4–6 位数字验证码")).toBeVisible();

  const phoneTab = page.getByRole("tab", { name: /手机号登录/ });
  const wechatTab = page.getByRole("tab", { name: /微信扫码/ });
  await phoneTab.focus();
  await phoneTab.press("ArrowRight");
  await expect(wechatTab).toBeFocused();
  await expect(wechatTab).toHaveAttribute("aria-selected", "true");
  const qr = page.getByRole("img", { name: "Hunter 微信登录演示二维码" });
  await expect(qr).toBeVisible();
  await expect(qr).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.getByText("未接入微信开放平台")).toBeVisible();

  await page.getByRole("button", { name: "注册账号" }).click();
  await expect(
    page.getByRole("heading", { name: "注册 Hunter" }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /服务条款与隐私说明/ }),
  ).toBeVisible();
});

test("phone login hands off to the existing console", async ({ page }) => {
  await page.goto("./#/login");
  await page.getByLabel("手机号").fill("13800138000");
  await page.getByRole("button", { name: "获取验证码" }).click();
  await expect(page.getByText(/未发送真实短信/)).toBeVisible();
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("button", { name: "登录", exact: true }).click();

  await expect(page).toHaveURL(/#\/home$/);
});

test("wechat login hands off to the existing console", async ({ page }) => {
  await page.goto("./#/login");
  await page.getByRole("tab", { name: /微信扫码/ }).click();
  const confirmButton = page.getByRole("button", {
    name: "模拟已在手机确认",
  });
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();

  await expect(page).toHaveURL(/#\/home$/);
});

test("phone registration hands off to the existing console", async ({
  page,
}) => {
  await page.goto("./#/login");
  await page.getByRole("button", { name: "注册账号" }).click();
  await page.getByLabel("姓名").fill("林昊");
  await page.getByLabel("手机号").fill("13800138000");
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("checkbox", { name: /服务条款与隐私说明/ }).check();
  await page.getByRole("button", { name: "注册并进入 Hunter" }).click();

  await expect(page).toHaveURL(/#\/home$/);
});

test("operations login is independent and hands off to the existing operations page", async ({
  page,
}) => {
  await page.goto("./#/ops/login");
  await expect(
    page.getByRole("heading", { name: "Hunter 运营后台" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "登录运营后台" }).click();
  await expect(page.getByText("请输入用户名")).toBeVisible();
  await expect(page.getByText("请输入密码")).toBeVisible();

  await page.getByLabel("用户名").fill("demo-operator");
  await page.getByLabel("密码").fill("demo-password");
  await page.getByRole("button", { name: "登录运营后台" }).click();
  await expect(page).toHaveURL(/#\/ops\/overview$/);
});
