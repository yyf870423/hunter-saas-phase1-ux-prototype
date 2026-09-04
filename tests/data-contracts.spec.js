import { expect, test } from "@playwright/test";
import { mainlines } from "../src/stage1/data";
import { workstreamHistory } from "../src/stage2/data";
import {
  candidates,
  candidatePositionRelations,
  companies,
  contacts,
  opportunities,
  papers,
  positions,
} from "../src/stage4/data";
import { subscriptionPlans } from "../src/shared/productCatalog";
import {
  orders,
  overviewMetrics,
  runQuality,
  tasks,
} from "../src/stage6/operations-data";

test("任务历史与工作台使用同一当前状态", () => {
  const currentById = new Map(mainlines.map((item) => [item.id, item.status]));
  for (const item of workstreamHistory) {
    expect(item.status, item.id).toBe(currentById.get(item.id));
  }
});

test("候选人流程来自岗位关系而不是候选人全局事实", () => {
  for (const candidate of candidates) {
    expect(candidate).not.toHaveProperty("score");
    const relations = candidatePositionRelations.filter(
      (relation) => relation.candidateId === candidate.id,
    );
    expect(candidate.pipelineActive).toBe(
      relations.some((relation) => relation.active),
    );
    expect(candidate.pipeline).toBe(relations[0]?.stage || "未进入流程");
  }
});

test("公司列表统计由关联资产事实推导", () => {
  for (const company of companies) {
    const companyPositions = positions.filter(
      (item) => item.company === company.name,
    );
    expect(company.contacts, `${company.name} 联系人`).toBe(
      contacts.filter((item) => item.company === company.name).length,
    );
    expect(company.opportunities, `${company.name} 招聘机会`).toBe(
      opportunities.filter((item) => item.company === company.name).length,
    );
    expect(company.positions, `${company.name} 岗位`).toBe(
      companyPositions.length,
    );
    expect(company.talents, `${company.name} 任职人才`).toBe(
      candidates.filter((item) => item.company === company.name).length,
    );
    expect(company.progress, `${company.name} 推进人数`).toBe(
      companyPositions.reduce((total, item) => total + item.progress, 0),
    );
  }
});

test("论文作者和署名机构使用结构化署名关系", () => {
  for (const paper of papers) {
    expect(paper.authorships.length).toBe(paper.authors.length);
    expect(
      paper.authorships.every(([, affiliations]) => affiliations.length),
    ).toBe(true);
    expect(paper.sourceRecords.length).toBeGreaterThan(0);
    expect(paper.sourceRecords.every((source) => source.href)).toBe(true);
  }
});

test("用户端套餐和运营端订单使用同一产品目录", () => {
  const professionalOrders = orders.filter((order) =>
    order.plan.startsWith(subscriptionPlans.professional.name),
  );
  const basicOrders = orders.filter((order) =>
    order.plan.startsWith(subscriptionPlans.basic.name),
  );
  expect(professionalOrders.every((order) => order.amount === "¥ 399.00")).toBe(
    true,
  );
  expect(basicOrders.every((order) => order.amount === "¥ 199.00")).toBe(true);
});

test("运营指标有统计口径，四类运行使用统一阶段摘要", () => {
  expect(overviewMetrics.every((metric) => metric.definition)).toBe(true);
  expect(
    overviewMetrics.find((metric) => metric.id === "tasks").definition,
  ).toContain("系统运行");
  expect(new Set(tasks.map((task) => task.scope))).toEqual(
    new Set(["普通任务运行", "周期任务运行", "资产 AI 运行", "系统运行"]),
  );
  expect(
    tasks
      .filter((task) => task.scope !== "系统运行")
      .every((task) => task.workId !== "—" && Boolean(task.workTitle.trim())),
  ).toBe(true);
  expect(
    tasks
      .filter((task) => ["普通任务运行", "周期任务运行"].includes(task.scope))
      .every((task) => task.workId.startsWith("WORK-")),
  ).toBe(true);
  expect(
    tasks
      .filter((task) => task.scope === "资产 AI 运行")
      .every((task) => !task.workId.startsWith("WORK-")),
  ).toBe(true);
  expect(
    tasks
      .filter((task) => task.scope === "系统运行")
      .every((task) => task.workId === "—"),
  ).toBe(true);
  const mailCheck = tasks.find((task) => task.type === "邮箱回复检查");
  expect(mailCheck.status).toBe("已完成");
  expect(mailCheck.resource).toBe("已释放");
  expect(
    tasks.every(
      (task) =>
        task.processPhase &&
        task.plan.total >= task.plan.completed &&
        task.writeSummary,
    ),
  ).toBe(true);
  expect(runQuality).toHaveLength(4);
  expect(runQuality.every((row) => row.waitingDuration)).toBe(true);
});
