import test from "node:test";
import assert from "node:assert/strict";
import { applyOpportunityCommand } from "../../src/stage4/opportunity-domain.js";
import { createOpportunitySeed } from "../../src/stage4/opportunity-seed.js";
import { candidates } from "../../src/stage4/data.js";
import { sourcingCandidates } from "../../src/stage2/recruiting-review-data.js";
import { positionTalentRows } from "../../src/stage4/position-talent-results.js";
import { displayDraftConfirmation } from "../../src/stage4/single-asset-confirmation.js";
import { organizationGraphPages } from "../../src/stage3/organization-mapping-data.js";
const context = { candidates, sourcingCandidates };
const review = (state, data = {}, ctx = context) =>
  applyOpportunityCommand(
    state,
    {
      type: "recruiting.legacy-review",
      data: {
        positionId: "position-vla",
        taskId: "position-vla",
        authMode: "confirm",
        reviewIds: ["candidate-1", "candidate-5"],
        ...data,
      },
    },
    ctx,
  );

test("岗位审核原子同步储备与梳理，重复审核不重复加人或递增版本", () => {
  const initial = createOpportunitySeed();
  const { state } = review(initial);
  const position = state.positions.find((item) => item.id === "position-vla");
  assert.equal(position.pipeline.length, 2);
  assert.equal(position.talentMap.rows.length, 2);
  assert.equal(initial.positions[0].pipeline.length, 0);
  assert.ok(
    position.talentMap.rows.every(
      (row) => row.basis && row.risk && row.sourceTaskId,
    ),
  );
  const repeated = review(state).state.positions.find(
    (item) => item.id === position.id,
  );
  assert.equal(repeated.pipeline.length, 2);
  assert.equal(repeated.talentMap.version, 1);
  assert.equal(repeated.talentMap.rows[1].assetPath, "");
});

test("后续推进状态由同一份岗位关系派生，不回退到储备", () => {
  let { state } = review(createOpportunitySeed());
  ({ state } = applyOpportunityCommand(
    state,
    {
      type: "pipeline.move",
      data: {
        positionId: "position-vla",
        candidateId: "candidate-linhao",
        stage: "interview-1",
      },
    },
    context,
  ));
  state = review(state).state;
  assert.equal(positionTalentRows(state.positions[0])[0].stage, "一面");
  const added = review(state, { reviewIds: ["candidate-2"] }).state
    .positions[0];
  assert.equal(added.talentMap.rows.length, 3);
  assert.equal(added.talentMap.version, 2);
});

test("不合法身份、错误岗位、分析模式和受限模式均不能部分入储备", () => {
  const state = createOpportunitySeed();
  for (const data of [
    { reviewIds: ["candidate-1", "missing"] },
    { positionId: "position-simulation" },
    { authMode: "analysis" },
    { reviewIds: [] },
  ])
    assert.throws(() => review(state, data));
  assert.throws(() => review(state, {}, { ...context, limited: true }), /权限/);
  assert.equal(state.positions[0].pipeline.length, 0);
  assert.equal(state.positions[0].talentMap, undefined);
});

test("常规岗位匹配入储备同样更新人才梳理", () => {
  const { state } = applyOpportunityCommand(
    createOpportunitySeed(),
    {
      type: "pipeline.add",
      data: { positionId: "position-vla", candidateIds: [candidates[0].id] },
    },
    context,
  );
  assert.equal(state.positions[0].talentMap.rows[0].id, candidates[0].id);
});

test("公司地图保留未知关键岗位，不将拓界任职人挂在星澜或自动关联冲突身份", () => {
  const pages = organizationGraphPages();
  assert.equal(pages.length, 4);
  assert.equal(
    pages[0].nodes.some((node) => node.label === "林昊"),
    false,
  );
  const unknown = pages[1].nodes.find((node) => node.label === "技术负责人");
  assert.equal(unknown.status, "review");
  assert.ok(unknown.summary.includes("待核实"));
  const conflict = pages[0].nodes.find((node) => node.label === "王奕");
  assert.equal(conflict.assetPath, undefined);
  assert.equal(conflict.parentId, undefined);
  assert.equal(
    pages[2].edges.find((edge) => edge.label === "汇报关系待核实").status,
    "review",
  );
});

test("只兼容首次客户草稿确认显示，保留原文及后续是/否", () => {
  const messages = [
    { id: "1", role: "user", sourceKind: "decision", content: "是" },
    { id: "2", role: "user", sourceKind: "followup", content: "是" },
    { id: "3", role: "user", sourceKind: "decision", content: "是" },
  ];
  const task = { id: "client-xinglan", messages };
  assert.deepEqual(
    messages.map((message) => displayDraftConfirmation(task, message)),
    ["确认", "是", "是"],
  );
  assert.equal(messages[0].content, "是");
  assert.equal(
    displayDraftConfirmation({ ...task, id: "other" }, messages[0]),
    "是",
  );
});
