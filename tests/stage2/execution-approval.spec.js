import { expect, test } from "@playwright/test";

const capture =
  process.env.APPROVAL_CAPTURE_DIR || "artifacts/task-approval-20261124";
const input = (page) => page.getByRole("textbox", { name: "任务对话输入" });
const approval = (page) =>
  page.getByRole("region", { name: /本次操作确认|本次业务选择/ }).last();
const send = async (page, text) => {
  await input(page).fill(text);
  await input(page).press("Enter");
};
const snapshot = (page) =>
  page.evaluate(() => localStorage.getItem("hunter-opportunity-lifecycle-v1"));
async function reserve(page) {
  await page.goto("#/tasks/position-vla?state=review");
  await send(page, "将85分以上的人加入岗位储备，但不要选择赵星羽");
  await expect(
    approval(page).getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    }),
  ).toBeVisible();
}
async function configure(page, options) {
  await page.evaluate(async (options) => {
    const moduleUrl = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .find((url) => url.includes("/src/stage4/opportunity-store.js"));
    if (!moduleUrl) throw Error("Local prototype store module not loaded");
    const store = await import(moduleUrl);
    store.configureOpportunityDemo(options);
  }, options);
}

test.beforeEach(async ({ page }) => {
  page.__approvalErrors = [];
  page.on("pageerror", (error) => page.__approvalErrors.push(error.message));
  await page.route("**/*", (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) &&
      !["data:", "blob:"].includes(url.protocol)
    ) {
      page.__approvalErrors.push(`external:${url.origin}`);
      return route.abort();
    }
    if (!["GET", "HEAD"].includes(request.method())) {
      page.__approvalErrors.push(`write:${request.method()}`);
      return route.abort();
    }
    return route.continue();
  });
});
test.afterEach(async ({ page }) => {
  expect(page.__approvalErrors).toEqual([]);
});

test("不输入确认即可授权指定人选，保持执行前确认模式且不重复写入", async ({
  page,
}) => {
  await reserve(page);
  await expect(approval(page).getByRole("heading")).toHaveText(
    "将顾言川加入岗位储备？",
  );
  await expect(approval(page)).toContainText("新增 1 位：顾言川");
  await expect(approval(page)).toContainText("保持 3 位原阶段");
  await expect(approval(page)).toContainText("赵星羽不在本次范围");
  await expect(input(page)).toHaveValue("");
  await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .evaluate((button) => {
      button.click();
      button.click();
    });
  await expect(
    page.getByText("已应用审核决定：", { exact: false }).last(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "执行前确认", exact: true }),
  ).toContainText("执行前确认");
  await expect(
    page.locator(".s2-user-message > div").filter({ hasText: /^确认$/ }),
  ).toHaveCount(0);
  await expect(
    page.getByText("已点击：确认加入储备", { exact: true }),
  ).toHaveCount(1);
});

test("暂不执行不写入，结果和对话保留", async ({ page }) => {
  await reserve(page);
  const before = await snapshot(page);
  await approval(page)
    .getByRole("button", { name: /^(暂不加入|暂不保存)$/ })
    .click();
  await expect(
    page.getByText("好的，这次不加入，审核结果保持原样。"),
  ).toBeVisible();
  expect(await snapshot(page)).toBe(before);
  await expect(
    page.getByRole("button", { name: "查看候选人结果（18）" }),
  ).toBeVisible();
});

test("未发送修改时禁用授权，清空后仍是同一范围", async ({ page }) => {
  await reserve(page);
  await input(page).fill("先不执行，我需要调整范围");
  await expect(
    approval(page).getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    }),
  ).toBeDisabled();
  await expect(approval(page)).toContainText("未发送的修改");
  await expect(input(page)).toHaveValue("先不执行，我需要调整范围");
  await input(page).fill("");
  await expect(
    approval(page).getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    }),
  ).toBeEnabled();
});

test("仅分析不能授权写入，仍可拒绝当前操作", async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("hunter-workstream-auth", "analysis"),
  );
  await reserve(page);
  await expect(approval(page)).toContainText("当前为仅分析");
  await expect(
    approval(page).getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    }),
  ).toBeDisabled();
  const before = await snapshot(page);
  await approval(page)
    .getByRole("button", { name: /^(暂不加入|暂不保存)$/ })
    .click();
  expect(await snapshot(page)).toBe(before);
});

test("修改名单后只授权新范围，旧按钮不执行", async ({ page }) => {
  await reserve(page);
  const oldButton = await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .elementHandle();
  await send(page, "将85分以上的人加入岗位储备");
  await expect(approval(page)).toContainText("赵星羽");
  await oldButton.evaluate((button) => button.click());
  await expect(
    approval(page).getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    }),
  ).toBeEnabled();
  await expect(
    page.getByText("已应用审核决定：", { exact: false }),
  ).toHaveCount(0);
});

test("写入失败保留范围，可重试且不冒充完成", async ({ page }) => {
  await reserve(page);
  await configure(page, {
    failure: "本地模拟保存失败",
    operation: "recruiting.legacy-review",
  });
  const before = await snapshot(page);
  await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .click();
  await expect(approval(page).getByRole("alert")).toContainText(
    "本次操作未完成",
  );
  expect(await snapshot(page)).toBe(before);
  await expect(
    approval(page).getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    }),
  ).toBeEnabled();
  await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .click();
  await expect(
    page.getByText("已应用审核决定：", { exact: false }).last(),
  ).toBeVisible();
});

test("权限受限时不提交授权", async ({ page }) => {
  await reserve(page);
  await configure(page, { limited: true });
  await expect(approval(page)).toContainText("不能执行写入");
  await expect(
    approval(page).getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    }),
  ).toBeDisabled();
});

test("客户开发先授权机会入库，再分别核实联系人及建档，不合并发送授权", async ({
  page,
}) => {
  await page.goto("#/tasks/client-xinglan");
  await expect(approval(page)).toContainText("招聘机会：");
  await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .click();
  await expect(
    page.getByRole("link", { name: "查看招聘机会", exact: true }),
  ).toBeVisible();
  const confirmed = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hunter-opportunity-lifecycle-v1"))
      .tasks.find((task) => task.id === "client-xinglan")
      .messages.find(
        (message) => message.decisionEvent?.action === "opportunity",
      ),
  );
  expect(confirmed.content).toBe("已点击：确认入库");
  expect(confirmed.decisionEvent.decision).toBe("approve");
  await expect(approval(page)).toContainText("是否继续核实招聘联系人");
  await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "查看联系人结果", exact: true }),
  ).toBeVisible();
  await send(page, "保存陈雨、周琪为联系人");
  await expect(approval(page)).toContainText("陈雨、周琪");
  await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "确认发送", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("邮件已发出", { exact: false })).toHaveCount(0);
});

test("组织梳理只在本次授权后保存本地地图", async ({ page }) => {
  await page.goto("#/tasks/mapping-embodied?state=gaps");
  await send(page, "保存当前人才地图");
  await expect(approval(page)).toContainText("保留未知任职人");
  await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "人才地图已更新", exact: true }),
  ).toBeVisible();
});

test("单资产拒绝后可重新核对，按钮重新授权，无需打字", async ({ page }) => {
  await page.goto("#/tasks/client-xinglan?state=no-contact");
  await approval(page)
    .getByRole("button", { name: /^(暂不加入|暂不保存)$/ })
    .click();
  await page.getByRole("button", { name: "重新核对草稿", exact: true }).click();
  await expect(
    approval(page).getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    }),
  ).toBeEnabled();
});

test("周期计划可点击创建，不改变每轮的确认方式", async ({ page }) => {
  await page.goto("#/new?state=periodic");
  await expect(approval(page)).toContainText("创建这个周期任务？");
  await expect(approval(page)).toContainText("此计划将持续运行");
  await approval(page)
    .getByRole("button", {
      name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
    })
    .click();
  await expect(page).toHaveURL(/tasks\/periodic\?selected=/);
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
  { name: "dark-medium", width: 871, height: 866, dark: true },
])
  test(`一键授权布局：${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    if (viewport.dark)
      await page.addInitScript(() =>
        localStorage.setItem("hunter-theme", "dark"),
      );
    await reserve(page);
    await approval(page).scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(220);
    const bounds = await approval(page)
      .getByRole("button", {
        name: /^(确认加入储备|确认入库|继续核实联系人|确认建档|保存人才地图|创建周期任务)$/,
      })
      .boundingBox();
    const composerBounds = await page
      .locator(".s2-composer-wrap")
      .boundingBox();
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(composerBounds.y + 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await page.screenshot({ path: `${capture}/approval-${viewport.name}.png` });
  });

test("已授权的只读核实是业务选择，仅分析仍能继续且不变更授权模式", async ({
  page,
}) => {
  await page.goto("#/tasks/client-xinglan");
  await approval(page)
    .getByRole("button", { name: "确认入库", exact: true })
    .click();
  await page.getByRole("button", { name: "执行前确认", exact: true }).click();
  await page.getByRole("option", { name: /^仅分析/ }).click();
  await expect(approval(page)).toHaveAccessibleName("本次业务选择");
  await approval(page)
    .getByRole("button", { name: "继续核实联系人", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "查看联系人结果", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "仅分析", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("已点击：继续核实联系人", { exact: true }),
  ).toBeVisible();
});

for (const [scene, route, instruction, heading, button] of [
  [
    "opportunity",
    "tasks/client-xinglan?state=no-contact",
    "",
    "保存这条潜在招聘机会？",
    "确认入库",
  ],
  [
    "mapping",
    "tasks/mapping-embodied?state=gaps",
    "保存当前人才地图",
    "保存本轮公司组织梳理结果？",
    "保存人才地图",
  ],
  ["periodic", "new?state=periodic", "", "创建这个周期任务？", "创建周期任务"],
])
  for (const [device, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ]) {
    test(`业务文案截图：${scene}-${device}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("#/" + route);
      if (instruction) await send(page, instruction);
      await expect(approval(page).getByRole("heading")).toHaveText(heading);
      await expect(
        approval(page).getByRole("button", { name: button, exact: true }),
      ).toBeEnabled();
      await approval(page).scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      await page.screenshot({ path: `${capture}/${scene}-${device}.png` });
    });
  }
