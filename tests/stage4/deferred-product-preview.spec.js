import { expect, test } from "@playwright/test";

// Render the actual 1420 frontend with isolated, explicitly fictitious API responses.
// No real credentials are read, and every API request is intercepted before reaching a backend.
async function setup(page) {
  const reads = [], writes = [], errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const user = { id: "visibility-user", email: "fixture@example.invalid", display_name: "界面验收" };
  const tenant = { id: "visibility-space", name: "【隔离样例】个人工作空间", type: "personal" };
  await page.addInitScript(({ user, tenant }) => {
    localStorage.setItem("aros-auth", JSON.stringify({ state: { accessToken: "ui-fixture-only-not-a-real-token", refreshToken: null, expiresAt: Date.now() + 3600000, user, tenant }, version: 0 }));
    localStorage.setItem("aros-tenant", JSON.stringify({ state: { currentTenant: tenant }, version: 0 }));
  }, { user, tenant });
  await page.route("**/api/**", async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (request.method() !== "GET") { writes.push(path); await route.abort(); return; }
    reads.push(path);
    let body = { data: [], meta: { total: 0, limit: 100, offset: 0, has_more: false } };
    if (path.endsWith("/tenants")) body.data = [tenant];
    if (path.endsWith("/auth/me")) body = { data: { user, current_tenant_id: tenant.id, memberships: [{ tenant }] } };
    if (path.endsWith("/talent-maps/visibility-map")) body = { data: { id: "visibility-map", name: "【隔离样例】组织图谱", description: "仅用于前端截图，不连接真实数据。", graph_type: "talent_map", pages: ["研发"], stats: { node_count: 2, linked_assets: 0, pending: 0 } } };
    if (path.endsWith("/talent-maps/visibility-map/nodes")) body.data = [
      { id: "v-company", map_id: "visibility-map", text: "【隔离样例】研发公司", parent_id: null, order: 0, page: 1, x: 100, y: 100, mentions: [] },
      { id: "v-team", map_id: "visibility-map", text: "算法团队", parent_id: "v-company", order: 0, page: 1, x: 380, y: 100, mentions: [] },
    ];
    if (path.endsWith("/companies/visibility-company")) body = { data: { id: "visibility-company", name: "【隔离样例】研发公司", profile: {}, industry: "", created_at: "2026-11-27T00:00:00Z" } };
    if (path.endsWith("/subscription/overview")) body = { data: {} };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  return { reads, writes, errors };
}

test("1420实际图谱页面不显示一级标签，旧版本链接不读取历史", async ({ page }, info) => {
  const result = await setup(page); await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:1420/maps/visibility-map?tab=versions&page=1");
  await expect(page.locator(".tg-node").first()).toBeVisible();
  await expect(page.locator(".tg-detail-page > .s4-detail-tabs")).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("1420-graph.png"), fullPage: true });
  expect(result.reads.filter(path => /snapshots|asset-tasks/.test(path))).toEqual([]);
  expect(result.writes).toEqual([]); expect(result.errors).toEqual([]);
});

test("1420实际公司详情隐藏任务与处理记录，旧地址显示资料", async ({ page }, info) => {
  const result = await setup(page); await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:1420/companies/visibility-company?tab=records");
  await expect(page.getByRole("heading", { name: "【隔离样例】研发公司", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "关联任务", exact: true })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "处理与记录", exact: true })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("1420-company.png"), fullPage: true });
  expect(result.reads.filter(path => /asset-tasks|asset-changes/.test(path))).toEqual([]);
  expect(result.writes).toEqual([]); expect(result.errors).toEqual([]);
});

test("1420实际账号菜单隐藏切换，但设置和退出仍可见", async ({ page }, info) => {
  const result = await setup(page); await page.goto("http://127.0.0.1:1420/companies/visibility-company");
  await page.getByRole("button", { name: "打开用户菜单", exact: true }).click();
  const menu = page.getByRole("menu", { name: "用户菜单", exact: true });
  await expect(menu.getByRole("menuitem")).toHaveCount(3);
  await expect(menu.getByText("切换工作空间", { exact: true })).toHaveCount(0);
  await expect(menu.getByText("设置", { exact: true })).toBeVisible();
  await expect(menu.getByText("退出登录", { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("1420-account-menu.png") });
  expect(result.writes).toEqual([]); expect(result.errors).toEqual([]);
});
