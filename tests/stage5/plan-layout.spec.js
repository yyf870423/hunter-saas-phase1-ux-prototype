import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackConsoleErrors } from "../stage1/helpers";

test.use({ channel: "chrome", reducedMotion: "reduce" });

for (const width of [1440, 900, 761, 760, 390, 320]) {
  test(`套餐选择 ${width}px：等宽、完整内容和可达操作`, async ({ page }) => {
    const assertNoConsoleErrors = trackConsoleErrors(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("#/settings/subscription?state=none");
    await page.getByRole("button", { name: "选择订阅" }).click();
    const dialog = page.getByRole("dialog", { name: "选择订阅" });
    await page.evaluate(() => document.fonts.ready);
    await dialog.evaluate(() => { for (const animation of document.getAnimations()) if (animation.effect?.getComputedTiming().iterations !== Infinity) animation.finish(); });
    const cards = dialog.locator(".s5-plan-choices > .s5-choice-card");
    await expect(cards).toHaveCount(3);
    const boxes = await cards.evaluateAll(elements => elements.map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }));
    for (const box of boxes) expect(Math.abs(box.width - boxes[0].width)).toBeLessThan(1);
    if (width > 760) {
      for (const box of boxes) { expect(box.y).toBe(boxes[0].y); expect(box.height).toBeGreaterThanOrEqual(240); }
      expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
      expect(boxes[2].x).toBeGreaterThan(boxes[1].x);
    } else {
      expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
      expect(boxes[2].y).toBeGreaterThan(boxes[1].y);
    }
    await expect(cards.locator(".s5-choice-price")).toHaveText(["¥199 / 月", "¥399 / 月", "¥899 / 月"]);
    for (const card of await cards.all()) {
      await expect(card).toHaveClass(/is-vertical/);
      expect(await card.evaluate(el => [el, ...el.querySelectorAll("b, small, strong")].every(node => node.scrollWidth <= node.clientWidth + 1))).toBe(true);
    }
    await cards.first().click();
    await expect(cards.first()).toHaveAttribute("aria-checked", "true");
    await expect(dialog.locator(".s5-payment-options > .is-vertical")).toHaveCount(0);
    await dialog.getByRole("button", { name: "确认并支付" }).scrollIntoViewIfNeeded();
    await expect(dialog.getByRole("button", { name: "确认并支付" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `/Users/eric.yu/job_hunting/docs/hb-test-20261104/round4/local-align/subscription-plan-layout-20261117/prototype-${width}.jpg`, animations: "disabled" });
    await dialog.getByRole("button", { name: "取消" }).click();
    await expect(dialog).toHaveCount(0);
    await assertNoConsoleErrors();
  });
}

test("横排不改变升级限制、默认选择和支付方式", async ({ page }) => {
  await page.goto("#/settings/subscription");
  await page.getByRole("button", { name: "升级套餐" }).click();
  const dialog = page.getByRole("dialog", { name: "升级套餐" });
  await expect(dialog.getByRole("radio", { name: /基础版/ })).toBeDisabled();
  await expect(dialog.getByRole("radio", { name: /标准版（当前套餐）/ })).toBeDisabled();
  await expect(dialog.getByRole("radio", { name: /专业版/ })).toHaveAttribute("aria-checked", "true");
  await dialog.getByRole("radio", { name: /微信支付/ }).click();
  await expect(dialog.getByRole("radio", { name: /微信支付/ })).toHaveAttribute("aria-checked", "true");
  await page.screenshot({ path: "/Users/eric.yu/job_hunting/docs/hb-test-20261104/round4/local-align/subscription-plan-layout-20261117/prototype-upgrade.jpg", animations: "disabled" });
  await dialog.getByRole("button", { name: "取消" }).click();
  await expect(page.locator(".s5-plan-card h2")).toHaveText("标准版");
});

test("横排套餐深色与缩放仍保持可读", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("#/settings/subscription?state=none");
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; const app = document.querySelector(".s1-app"); if (app) app.dataset.theme = "dark"; });
  await page.getByRole("button", { name: "选择订阅" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".s5-plan-choices")).toBeVisible();
  await page.screenshot({ path: "/Users/eric.yu/job_hunting/docs/hb-test-20261104/round4/local-align/subscription-plan-layout-20261117/prototype-dark.jpg", animations: "disabled" });
  await page.setViewportSize({ width: 720, height: 500 });
  await dialog.getByRole("button", { name: "确认并支付" }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole("button", { name: "确认并支付" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
