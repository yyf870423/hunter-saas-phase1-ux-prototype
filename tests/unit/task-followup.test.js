import test from "node:test";
import assert from "node:assert/strict";
import { applyOpportunityCommand } from "../../src/stage4/opportunity-domain.js";
import { createOpportunitySeed } from "../../src/stage4/opportunity-seed.js";
import { companies, contacts, candidates } from "../../src/stage4/data.js";
import { followupDate, missingFollowupField, nextFollowupDraft } from "../../src/stage4/task-followup.js";
import { periodicSchedule, readPeriodicDrafts } from "../../src/stage2/periodic-draft.js";

const context = { companies, contacts, candidates, deletedCompanies: [] };
const command = (state, type, data, options = {}) => applyOpportunityCommand(state, { type, data, ...options }, context);
function setup() {
  const task = command({ ...createOpportunitySeed(), clock: "2026-09-08T01:00:00Z" }, "task.create", { kind: "opportunity", title: "后续跟进", prompt: "核实", allowedResults: ["opportunity"] });
  const saved = command(task.state, "opportunity.save", { patch: { title: "本轮扩建", companyId: "company-xinglan", summary: "核实机器人团队需求", evidence: "客户电话" } }, { taskId: task.result.taskId });
  return { state: saved.state, id: task.result.taskId, opportunityId: saved.result.opportunityId };
}
function draft(state, id, text) {
  const task = state.tasks.find((item) => item.id === id);
  return command(state, "task.update", { id, patch: { followupDraft: nextFollowupDraft(task, state, text) } }).state;
}
function confirm(state, id, options = {}) {
  const pending = state.tasks.find((item) => item.id === id).followupDraft;
  return command(state, "task.followup.confirm", { id, draftId: pending.id }, { commandId: "confirm-" + pending.id, ...options });
}

test("follow-up collects one missing field and does not mistake suggestions or no for consent", () => {
  let { state, id } = setup();
  state = draft(state, id, "是");
  assert.equal(missingFollowupField(state.tasks.find((item) => item.id === id).followupDraft), "subject");
  assert.throws(() => confirm(state, id), /草稿已变化/);
  state = draft(state, id, "核实招聘预算");
  assert.equal(missingFollowupField(state.tasks.find((item) => item.id === id).followupDraft), "dueAt");
  state = draft(state, id, "2099-09-10 10:00");
  state = draft(state, id, "是，但是先别执行");
  assert.equal(state.tasks.find((item) => item.id === id).followupDraft.stage, "collect");
  state = draft(state, id, "否");
  assert.equal(state.tasks.find((item) => item.id === id).followupDraft.stage, "declined");
  assert.equal(state.followups.length, 0);
});

test("follow-up schedule, update, completion and cancel share version and idempotency boundaries", () => {
  let { state, id, opportunityId } = setup();
  state = draft(state, id, "安排跟进\n跟进事项：核实预算\n跟进时间：2099-09-10 10:00");
  const applied = confirm(state, id);
  const duplicate = confirm(applied.state, id);
  assert.equal(duplicate.state.followups.length, 1);
  assert.equal(duplicate.state.followups[0].ownerTaskId, id);
  state = draft(applied.state, id, "修改下次跟进\n跟进时间：2099-09-11 11:00");
  const old = state;
  state = command(state, "followup.schedule", { opportunityId, id: state.followups[0].id, ownerTaskId: id, subject: "其他窗口调整", dueAt: "2099-09-12T01:00:00Z" }).state;
  assert.throws(() => confirm(state, id), /更新|版本|变化/);
  assert.equal(old.followups[0].version, 1);
  state = draft(state, id, "重新核对");
  state = confirm(state, id).state;
  state = draft(state, id, "记录跟进\n跟进内容：客户确认预算\n实际跟进时间：2026-09-07 10:00\n完成当前事项：是");
  state = confirm(state, id).state;
  assert.equal(state.followups[0].status, "done");
  assert.equal(state.opportunities.find((item) => item.id === opportunityId).records.at(-1).content, "客户确认预算");
  state = draft(state, id, "安排跟进\n跟进事项：索取 JD\n跟进时间：2099-09-15 10:00");
  state = confirm(state, id).state;
  state = draft(state, id, "取消安排");
  assert.equal(state.followups.at(-1).status, "pending");
  state = confirm(state, id).state;
  assert.equal(state.followups.at(-1).status, "cancelled");
});

test("follow-up confirmation rechecks permissions, analysis mode, ownership and invalid dates atomically", () => {
  let { state, id } = setup();
  state = draft(state, id, "安排跟进\n跟进事项：核实\n跟进时间：2099-09-10 10:00");
  const pending = state.tasks.find((item) => item.id === id).followupDraft;
  assert.throws(() => applyOpportunityCommand(state, { type: "task.followup.confirm", data: { id, draftId: pending.id } }, { ...context, limited: true }), /权限/);
  assert.throws(() => confirm(state, id, { automatic: true }), /用户确认/);
  const analysis = command(state, "task.update", { id, patch: { authMode: "analyze" } }).state;
  assert.throws(() => confirm(analysis, id), /仅分析/);
  state = draft(state, id, "跟进时间：2026-01-01 10:00");
  assert.throws(() => confirm(state, id), /未来/);
  assert.equal(state.followups.length, 0);
  const invalid = { ...pending, unexpected: "write" };
  assert.throws(() => command(state, "task.update", { id, patch: { followupDraft: invalid } }), /结构/);
  const noReference = structuredClone(state);
  noReference.tasks.find((item) => item.id === id).assetRefs = [];
  assert.throws(() => confirm(noReference, id), /直接引用/);
});

test("recycled sources preserve task follow-ups; purged sources allow only cancel", () => {
  let { state, id, opportunityId } = setup();
  state = draft(state, id, "安排跟进\n跟进事项：核实\n跟进时间：2099-09-10 10:00");
  state = confirm(state, id).state;
  state.opportunities.find((item) => item.id === opportunityId).deletedAt = state.clock;
  state = draft(state, id, "记录跟进\n跟进内容：已核实\n实际跟进时间：2026-09-07 10:00");
  state = confirm(state, id).state;
  state.opportunities = state.opportunities.filter((item) => item.id !== opportunityId);
  state = draft(state, id, "记录跟进\n跟进内容：已核实\n实际跟进时间：2026-09-07 10:00");
  assert.throws(() => confirm(state, id), /不存在/);
  state = draft(state, id, "取消安排");
  state = confirm(state, id).state;
  assert.equal(state.followups[0].status, "cancelled");
});

test("date and periodic draft parsing rejects rollover, malformed storage and impossible times", () => {
  assert.equal(followupDate("2026-02-30 10:00"), "");
  assert.equal(followupDate("2026-09-10 25:00"), "");
  assert.ok(followupDate("2026-09-10 10:00"));
  assert.equal(periodicSchedule("改为每周三 10:00"), "每周三 10:00");
  assert.equal(periodicSchedule("每周三 25:00"), "");
  assert.deepEqual(readPeriodicDrafts({ getItem: () => "bad" }), []);
});
