import { expect, test } from "@playwright/test";
import { candidatePositionRelations, candidates } from "../../src/stage4/data";

const laneNames = (page) =>
  page.$$eval(".s4-kanban > section", (sections) =>
    Object.fromEntries(
      sections.map((section) => [
        section.querySelector("header b").textContent,
        [...section.querySelectorAll("article header b")].map((item) => item.textContent),
      ]),
    ),
  );

test("岗位泳道、候选人列表和候选人页使用同一份岗位关系", async ({ page }) => {
  await page.goto("#/positions/position-vla?tab=pipeline");
  const lanes = await laneNames(page);
  const vla = candidatePositionRelations.filter((relation) => relation.positionId === "position-vla");
  expect(Object.values(lanes).flat().length, "泳道只显示这个岗位的关系").toBe(vla.length);
  for (const relation of vla) {
    const name = candidates.find((item) => item.id === relation.candidateId).name;
    expect(lanes[relation.stage], `${name} 在 ${relation.stage}`).toContain(name);
  }
  expect(lanes["一面"]).toEqual(["林昊", "周明远"]);
  expect(lanes["已推荐"]).toEqual(["陈楚宁", "陈松"]);
  expect(lanes["已入职"]).toEqual([]);
  await expect(page.locator(".s4-pipeline-summary")).toContainText("推进中6");

  await page.goto("#/candidates/candidate-linhao?tab=matching");
  const relation = page.locator(".s4-pipeline-relations article");
  await expect(relation).toContainText("一面");
  await expect(relation).toContainText("从已推荐进入一面");
});

test("对话中一句话推进多位候选人：先出整批草稿，可逐项确认，确认后各处同步", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=pipeline-dialogue");
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await expect(input).toHaveValue("陈楚宁约了一面，梁辰二面过了、进谈薪，周明远客户没通过");
  await input.press("Enter");
  const draft = page.locator(".s2-decision-thread").last();
  await expect(draft).toContainText("将更新「具身智能 VLA 算法负责人」的流程");
  await expect(draft).toContainText("陈楚宁：已推荐 → 一面，备注“约了一面”");
  await expect(draft).toContainText("梁辰：二面 → 谈薪，备注“二面过了、进谈薪”");
  await expect(draft).toContainText("周明远：一面 → 已落选，备注“客户没通过”");
  await expect(draft).toContainText("是否执行？请回复“是”“否”，或单独调整某一位。");

  await input.fill("周明远先不动，其他是");
  await input.press("Enter");
  const result = page.locator(".s2-decision-thread").last();
  await expect(result).toContainText("写入 2 条推进记录，记录里写明由 Hunter 按对话要求执行");
  await expect(result).toContainText("周明远保持一面，没有改动。");

  await result.getByRole("link", { name: "查看岗位泳道" }).click();
  const lanes = await laneNames(page);
  expect(lanes["一面"]).toEqual(expect.arrayContaining(["陈楚宁", "林昊", "周明远"]));
  expect(lanes["谈薪"]).toEqual(expect.arrayContaining(["梁辰", "高远"]));
  expect(lanes["二面"]).toEqual([]);
  await page.locator(".s4-kanban article", { hasText: "陈楚宁" }).click();
  const drawer = page.getByRole("dialog", { name: /陈楚宁 · 完整推进记录/ });
  await expect(drawer).toContainText("已推荐 → 一面");
  await expect(drawer).toContainText("Hunter · 按对话要求执行");
  await expect(drawer.getByRole("link", { name: "查看对话" })).toBeVisible();

  await page.goto("#/candidates/candidate-chenchuning?tab=matching");
  await expect(page.locator(".s4-pipeline-relations article")).toContainText(
    "今天从已推荐进入一面 · 约了一面 · Hunter · 按对话要求执行",
  );
  await page.goto("#/candidates");
  await expect(page.getByRole("row", { name: /陈楚宁/ })).toContainText("一面");
});

test("对话中推进：回复“否”不改，提出调整后重新出草稿", async ({ page }) => {
  await page.goto("#/tasks/position-vla?state=pipeline-dialogue");
  const input = page.getByPlaceholder("输入补充信息、决定或新的要求");
  await input.press("Enter");
  await input.fill("周明远改成候选人不合适");
  await input.press("Enter");
  await expect(page.locator(".s2-decision-thread").last()).toContainText(
    "周明远：一面 → 候选人不合适",
  );
  await input.fill("否");
  await input.press("Enter");
  await expect(page.locator(".s2-decision-thread").last()).toContainText(
    "好的，这次不改，岗位流程保持原样。",
  );
  await page.goto("#/positions/position-vla?tab=pipeline");
  const lanes = await laneNames(page);
  expect(lanes["已推荐"]).toEqual(["陈楚宁", "陈松"]);
  expect(lanes["候选人不合适"]).toEqual([]);
});
