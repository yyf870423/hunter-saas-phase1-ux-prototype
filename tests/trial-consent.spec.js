import { test, expect } from "@playwright/test";

async function openForm(page, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/landing-origin/", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replace(
        '<meta name="trial-api" content="disabled" />',
        '<meta name="trial-api" content="/api/trial-applications" />',
      ),
    });
  });
  await page.goto("./landing-origin/");
  await expect(page.locator(".f-trial-form")).toBeVisible();
}

async function fillForm(page) {
  for (const [name, value] of Object.entries({
    name: "用途确认验收",
    company: "虚构验收团队",
    phone: "+1 202 555 0123",
    email: "consent-qa@example.invalid",
  }))
    await page.locator(`[name="${name}"]`).fill(value);
  for (const [name, value] of [
    ["role", "猎头顾问"],
    ["activePositions", "6-10"],
    ["industry", "智能制造"],
  ]) {
    await page.locator(`#f-trial-${name}`).click();
    await page
      .locator(`#f-trial-${name}-list`)
      .getByRole("option", { name: value, exact: true })
      .click();
  }
  await page.locator("#f-trial-industry").press("Escape");
}

for (const width of [1440, 390]) {
  test(`purpose confirmation gates all submit paths at ${width}px`, async ({
    page,
  }, testInfo) => {
    const requests = [];
    await page.route("**/api/trial-applications", async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ status: 503, json: { status: "unavailable" } });
    });
    await openForm(page, width);
    const button = page.locator(".f-trial-submit");
    const consent = page.locator("#f-trial-consent");
    await expect(button).toBeDisabled();
    await page.locator(".f-trial-layout").screenshot({
      path: testInfo.outputPath(`unchecked-${width}.png`),
      animations: "disabled",
    });
    await fillForm(page);
    await expect(button).toBeDisabled();
    await page.locator('[name="name"]').press("Enter");
    await page
      .locator(".f-trial-form")
      .evaluate((form) => form.requestSubmit());
    await expect(consent).toHaveAttribute("aria-invalid", "true");
    expect(requests).toHaveLength(0);
    await button.evaluate((element) => {
      element.disabled = false;
      element.form.requestSubmit(element);
    });
    await expect(button).toBeDisabled();
    await expect(consent).toBeFocused();
    expect(requests).toHaveLength(0);

    await consent.check();
    await expect(button).toBeEnabled();
    await consent.uncheck();
    await expect(button).toBeDisabled();
    await consent.check();
    await expect(button).toBeEnabled();
    await page.locator(".f-trial-layout").screenshot({
      path: testInfo.outputPath(`checked-${width}.png`),
      animations: "disabled",
    });
    await button.click();
    await expect(page.locator(".f-trial-form")).toHaveAttribute(
      "data-state",
      "unavailable",
    );
    expect(requests).toHaveLength(1);
    expect(requests[0].acknowledgedPurpose).toBe(true);
    await expect(button).toBeEnabled();
    await consent.uncheck();
    await expect(button).toBeDisabled();
    await page
      .locator(".f-trial-form")
      .evaluate((form) => form.requestSubmit());
    expect(requests).toHaveLength(1);
    await consent.check();
    await page.locator(".f-trial-form").evaluate((form) => form.reset());
    await expect(consent).not.toBeChecked();
    await expect(button).toBeDisabled();
  });
}

test("checked confirmation survives an unconfirmed retry without duplicate submission", async ({
  page,
}) => {
  const requests = [];
  let finish;
  const pending = new Promise((resolve) => (finish = resolve));
  await page.route("**/api/trial-applications", async (route) => {
    const payload = route.request().postDataJSON();
    requests.push(payload);
    if (requests.length === 1) {
      await pending;
      await route.fulfill({ status: 502, json: { status: "unconfirmed" } });
    } else
      await route.fulfill({
        json: { status: "received", receipt: payload.submissionId },
      });
  });
  await openForm(page);
  await fillForm(page);
  const consent = page.locator("#f-trial-consent");
  const button = page.locator(".f-trial-submit");
  await consent.check();
  await button.click();
  await expect(button).toBeDisabled();
  await expect(consent).toBeDisabled();
  await page.locator(".f-trial-form").evaluate((form) => form.requestSubmit());
  expect(requests).toHaveLength(1);
  finish();
  await expect(page.locator(".f-trial-form")).toHaveAttribute(
    "data-state",
    "unconfirmed",
  );
  await expect(button).toBeEnabled();
  await expect(consent).toBeChecked();
  await expect(consent).toBeDisabled();
  await button.click();
  await expect(page.locator("[data-form-success]")).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
  await expect(button).toBeDisabled();
});
