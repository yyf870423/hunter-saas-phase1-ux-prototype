import test from "node:test";
import assert from "node:assert/strict";
import { applyOpportunityCommand, currentFollowup } from "../../src/stage4/opportunity-domain.js";
import { createOpportunitySeed } from "../../src/stage4/opportunity-seed.js";
import { directionJdInfo, legacyLearningJd } from "../../src/stage4/opportunity-jd.js";
import { companies, contacts, candidates } from "../../src/stage4/data.js";

const context = { companies, contacts, candidates, deletedCompanies: [] };
const initial = () => ({ ...createOpportunitySeed(), clock: "2026-09-08T01:00:00Z" });
const patch = { title: "新一轮研发扩建", companyId: "company-xinglan", contactId: "", summary: "客户确认需要研发工程师", evidence: "电话确认真实需求" };
const positionPatch = { name: "机器人学习工程师", jd: "负责操作策略研发与真机部署。要求具备机器人学习项目经验。", skills: [] };
const command = (state, type, data, options = {}) => applyOpportunityCommand(state, { type, data, ...options }, context);
function create(state = initial()) { return command(state, "opportunity.save", { patch }); }
function direction(state, opportunityId, name = "机器人学习工程师") {
  return command(state, "direction.save", { opportunityId, patch: { name, requirement: "真机部署" } });
}
function conversionSetup() {
  let { state, result } = create();
  const opportunityId = result.opportunityId;
  ({ state, result } = direction(state, opportunityId));
  return { state, opportunityId, directionId: result.directionId };
}

test("manual creation validates required fields and contact/company references without mutating input", () => {
  const state = initial();
  assert.throws(() => command(state, "opportunity.save", { patch: { ...patch, evidence: "" } }), /发现依据/);
  assert.throws(() => command(state, "opportunity.save", { patch: { ...patch, companyId: "missing" } }), /有效的所属公司/);
  assert.throws(() => command(state, "opportunity.save", { patch: { ...patch, companyId: "company-tuojie", contactId: "contact-chenyu" } }), /不属于/);
  assert.equal(state.opportunities.length, 4);
  assert.equal(create(state).state.opportunities.at(-1).contactId, "");
});

test("initial record and schedule are atomic with opportunity creation", () => {
  const state = initial();
  const data = { patch, initialRecord: { content: "首次确认", occurredAt: state.clock },
    initialSchedule: { subject: "下一步确认", dueAt: "2026-09-01T01:00:00Z" } };
  assert.throws(() => command(state, "opportunity.save", data), /未来/);
  assert.equal(state.opportunities.length, 4);
  assert.deepEqual(state.followups, []);
  data.initialSchedule.dueAt = "2026-09-09T01:00:00Z";
  const result = command(state, "opportunity.save", data);
  assert.equal(result.state.opportunities.at(-1).records.length, 1);
  assert.equal(result.state.followups[0].opportunityId, result.result.opportunityId);
});

test("single-asset creation and updates cannot bypass confirmation in automatic mode", () => {
  let { state, result } = command(initial(), "task.create", { kind: "opportunity", title: "核验需求", prompt: "确认需求", authMode: "auto", allowedResults: ["opportunity"] });
  const options = { taskId: result.taskId, automatic: true, commandId: "auto-1" };
  assert.throws(() => command(state, "opportunity.save", { patch }, options), /需要用户确认/);
  const created = command(state, "opportunity.save", { patch }, { taskId: result.taskId });
  const data = { id: created.result.opportunityId, patch: { summary: "后续核实更新同一轮需求" } };
  assert.throws(() => command(created.state, "opportunity.save", data, options), /需要用户确认/);
  assert.equal(created.state.notifications.length, 0);
  assert.throws(() => command(state, "position.create", { patch: { ...positionPatch, company: "星澜机器人" } }, options), /需要用户确认/);
  ({ state } = command(state, "task.update", { id: result.taskId, patch: { authMode: "confirm" } }));
  assert.throws(() => command(state, "opportunity.save", data, options), /需要用户确认/);
});

test("strict field whitelist and source validation reject unsafe generated drafts", () => {
  assert.throws(() => command(initial(), "opportunity.save", { patch: { ...patch, systemPrompt: "not allowed" } }), /不允许写入/);
  assert.throws(() => command(initial(), "opportunity.save", { patch: { ...patch, people: 5 } }), /必须是文字/);
  assert.throws(() => command(initial(), "opportunity.save", { patch, source: { id: "s", kind: "link", label: "资料", url: "javascript:alert(1)" } }), /HTTP/);
});

test("position task updates retain identity, source, authorization and idempotent results", () => {
  const task = command(initial(), "task.create", { kind: "position-create", title: "创建岗位", prompt: "岗位资料", allowedResults: ["position"] });
  const taskId = task.result.taskId;
  const created = command(task.state, "position.create", { patch: { ...positionPatch, companyId: "company-xinglan" } }, { taskId });
  const id = created.result.positionId;
  const before = created.state.positions.find((item) => item.id === id);
  const source = { id: "position-revision-source", kind: "task", label: "用户补充要求", content: "增加跨团队协作要求", taskId };
  const data = { id, expectedVersion: before.version, patch: { jd: before.jd + "需要跨团队协作。" }, source };
  const options = { taskId, commandId: "position-revision-1" };
  const updated = command(created.state, "position.update", data, options);
  assert.equal(updated.state.positions.length, created.state.positions.length);
  assert.equal(updated.result.positionId, id);
  assert.equal(updated.result.version, before.version + 1);
  assert.equal(updated.state.tasks[0].results.length, 2);
  assert.equal(updated.state.positions.at(-1).sources[0].id, source.id);
  assert.equal(command(updated.state, "position.update", data, options).state, updated.state);
  assert.throws(() => command(created.state, "position.update", data, { taskId, automatic: true }), /需要用户确认/);
  const limited = command(created.state, "task.update", { id: taskId, patch: { authMode: "analyze" } });
  assert.throws(() => command(limited.state, "position.update", data, { taskId }), /未获得正式写入授权/);
});

test("same command and same event are idempotent; suspected duplicates need explicit choice", () => {
  const data = { patch, source: { id: "event-1", kind: "reply", label: "邮件回复", content: "已确认" } };
  const first = command(initial(), "opportunity.save", data, { commandId: "save-1" });
  const second = command(first.state, "opportunity.save", data, { commandId: "save-1" });
  assert.equal(first.state, second.state);
  const third = command(second.state, "opportunity.save", data);
  assert.equal(third.result.opportunityId, first.result.opportunityId);
  assert.equal(third.state.opportunities.length, 5);
  assert.throws(() => command(third.state, "opportunity.save", { patch }), /比较后决定/);
  assert.equal(command(third.state, "opportunity.save", { patch, keepSeparate: true }).state.opportunities.length, 6);
});

test("one current followup, future scheduling and actual-time validation", () => {
  const created = create();
  const opportunityId = created.result.opportunityId;
  const planned = command(created.state, "followup.schedule", { opportunityId, subject: "确认薪酬", dueAt: "2026-09-08T02:17:00Z" });
  assert.equal(currentFollowup(planned.state, opportunityId).subject, "确认薪酬");
  assert.throws(() => command(planned.state, "followup.schedule", { opportunityId, subject: "再问一次", dueAt: "2026-09-09T02:00:00Z" }), /已安排/);
  assert.throws(() => command(planned.state, "followup.record", { opportunityId, content: "已回复", occurredAt: "2026-09-09T01:00:00Z" }), /不能晚于/);
  const savedOnly = command(planned.state, "followup.record", { opportunityId, content: "客户暂未回复", occurredAt: "2026-09-08T00:59:00Z" });
  assert.equal(currentFollowup(savedOnly.state, opportunityId).id, planned.result.followupId);
});

test("due reminders are deduplicated and reading does not complete the plan", () => {
  const created = create();
  const opportunityId = created.result.opportunityId;
  let { state } = command(created.state, "followup.schedule", { opportunityId, subject: "确认职责", dueAt: "2026-09-08T02:17:00Z" });
  ({ state } = command(state, "clock.set", { value: "2026-09-08T03:00:00Z" }));
  ({ state } = command(state, "notifications.tick", {}));
  ({ state } = command(state, "notifications.tick", {}));
  assert.equal(state.notifications.length, 1);
  ({ state } = command(state, "notification.read", { id: state.notifications[0].id }));
  assert.equal(currentFollowup(state, opportunityId).status, "due");
  const plan = currentFollowup(state, opportunityId);
  ({ state } = command(state, "followup.record", { opportunityId, content: "确认职责，预算下周给出", occurredAt: state.clock,
    completeId: plan.id, next: { subject: "确认预算", dueAt: "2026-09-15T03:00:00Z" } }));
  assert.equal(state.followups.find((item) => item.id === plan.id).status, "done");
  assert.equal(currentFollowup(state, opportunityId).subject, "确认预算");
  assert.equal(state.notifications[0].resolved, true);
  assert.throws(() => command(state, "followup.schedule", { opportunityId, id: plan.id, subject: "旧页面改期", dueAt: "2026-09-16T03:00:00Z" }), /已被处理/);
});

test("failed next schedule rolls back both record and completion", () => {
  const created = create();
  const opportunityId = created.result.opportunityId;
  const scheduled = command(created.state, "followup.schedule", { opportunityId, subject: "确认职责", dueAt: "2026-09-08T02:00:00Z" });
  assert.throws(() => command(scheduled.state, "followup.record", { opportunityId, content: "已跟进", occurredAt: scheduled.state.clock,
    completeId: scheduled.result.followupId, next: { subject: "下一次", dueAt: "2026-09-01T02:00:00Z" } }), /未来/);
  assert.equal(scheduled.state.opportunities.at(-1).records.length, 0);
  assert.equal(currentFollowup(scheduled.state, opportunityId).status, "pending");
});

test("new position inherits company, keeps unknown salary empty and starts with no candidates", () => {
  const setup = conversionSetup();
  const converted = command(setup.state, "position.convert", { ...setup, state: undefined, mode: "new", patch: positionPatch });
  const position = converted.state.positions.at(-1);
  assert.equal(position.companyId, "company-xinglan");
  assert.equal(position.salary, undefined);
  assert.deepEqual(position.pipeline, []);
  assert.deepEqual(position.processing, []);
  assert.equal(converted.state.tasks.length, 0);
  assert.equal(converted.state.opportunities.at(-1).status, "跟进中");
  assert.throws(() => command(converted.state, "position.convert", { ...setup, mode: "new", patch: positionPatch }), /已有关联岗位/);
});

test("existing association blocks cross-company, closed and already-owned positions", () => {
  const setup = conversionSetup();
  for (const [positionId, pattern] of [["position-platform", /同一公司/], ["position-simulation", /已关闭/], ["position-vla", /已有机会主归属/]])
    assert.throws(() => command(setup.state, "position.convert", { ...setup, mode: "existing", positionId }), pattern);
});

test("completion is explicit and requires all directions resolved; unlink preserves origin", () => {
  let { state, opportunityId, directionId } = conversionSetup();
  assert.throws(() => command(state, "opportunity.transition", { id: opportunityId, status: "已完成" }), /至少一个岗位/);
  ({ state } = command(state, "position.convert", { opportunityId, directionId, mode: "new", patch: positionPatch }));
  ({ state } = command(state, "opportunity.transition", { id: opportunityId, status: "已完成" }));
  assert.throws(() => command(state, "position.unlink", { opportunityId, directionId }), /先重新打开/);
  ({ state } = command(state, "opportunity.transition", { id: opportunityId, status: "跟进中", reason: "需要调整需求" }));
  ({ state } = command(state, "position.unlink", { opportunityId, directionId }));
  assert.equal(state.positions.at(-1).origin.opportunityId, opportunityId);
  assert.equal(state.opportunities.at(-1).directions[0].positionId, "");
});

test("task authorization, typed results and task-owned followup are independent", () => {
  let { state, result } = command(initial(), "task.create", { kind: "opportunity", title: "分析需求", prompt: "只分析", authMode: "analyze" });
  const taskId = result.taskId;
  assert.throws(() => command(state, "opportunity.save", { patch }, { taskId }), /仅分析/);
  ({ state } = command(state, "task.update", { id: taskId, patch: { authMode: "confirm" } }));
  ({ state, result } = command(state, "opportunity.save", { patch }, { taskId }));
  const opportunityId = result.opportunityId;
  assert.equal(state.tasks[0].assetRefs[0].id, opportunityId);
  ({ state, result } = command(state, "followup.schedule", { opportunityId, ownerTaskId: taskId, subject: "客户回复", dueAt: "2026-09-09T01:00:00Z" }));
  assert.throws(() => command(state, "followup.cancel", { id: result.followupId }), /原任务/);
  ({ state } = command(state, "opportunity.transition", { id: opportunityId, status: "已关闭", reason: "本轮暂停" }));
  assert.ok(currentFollowup(state, opportunityId));
  ({ state } = command(state, "followup.schedule", { opportunityId, ownerTaskId: taskId, id: result.followupId, subject: "确认下一轮时间", dueAt: "2026-09-10T01:00:00Z" }));
  ({ state } = command(state, "opportunity.recycle", { id: opportunityId }));
  ({ state } = command(state, "clock.set", { value: "2026-09-10T02:00:00Z" }));
  ({ state } = command(state, "notifications.tick", {}));
  assert.equal(state.notifications[0].taskId, taskId);
  assert.equal(currentFollowup(state, opportunityId).status, "due");
  ({ state } = command(state, "followup.record", { opportunityId, ownerTaskId: taskId, content: "客户确认另行对接", occurredAt: state.clock,
    completeId: result.followupId, next: { ownerTaskId: taskId, subject: "再次联系", dueAt: "2026-09-12T01:00:00Z" } }));
  assert.equal(state.opportunities.at(-1).records.length, 1);
  const planId = currentFollowup(state, opportunityId).id;
  ({ state } = command(state, "opportunity.purge", { id: opportunityId }));
  ({ state } = command(state, "clock.set", { value: "2026-09-12T02:00:00Z" }));
  ({ state } = command(state, "notifications.tick", {}));
  assert.equal(state.notifications[0].taskId, taskId);
  assert.match(state.notifications[0].content, /再次联系/);
  ({ state } = command(state, "followup.cancel", { id: planId, ownerTaskId: taskId }));
  assert.equal(currentFollowup(state, opportunityId), undefined);
});

test("delete and restore do not restart reminders or erase related positions/tasks", () => {
  let { state, opportunityId, directionId } = conversionSetup();
  ({ state } = command(state, "position.convert", { opportunityId, directionId, mode: "new", patch: positionPatch }));
  ({ state } = command(state, "followup.schedule", { opportunityId, subject: "确认交接", dueAt: "2026-09-09T01:00:00Z" }));
  ({ state } = command(state, "opportunity.recycle", { id: opportunityId }));
  assert.equal(state.positions.length, 6);
  assert.equal(currentFollowup(state, opportunityId), undefined);
  ({ state } = command(state, "opportunity.restore", { id: opportunityId }));
  assert.equal(currentFollowup(state, opportunityId), undefined);
  assert.equal(state.opportunities.at(-1).directions[0].positionId, state.positions.at(-1).id);
});

test("candidate review writes selected stable IDs only and stale/permission writes are rejected", () => {
  let { state, opportunityId, directionId } = conversionSetup();
  ({ state } = command(state, "position.convert", { opportunityId, directionId, mode: "new", patch: positionPatch }));
  const positionId = state.positions.at(-1).id;
  assert.throws(() => command(state, "pipeline.add", { positionId, candidateIds: ["missing"] }), /候选人不存在/);
  ({ state } = command(state, "pipeline.add", { positionId, candidateIds: [candidates[0].id, candidates[0].id] }));
  assert.equal(state.positions.at(-1).pipeline.length, 1);
  assert.throws(() => command(state, "opportunity.save", { id: opportunityId, patch, expectedVersion: 0 }), /已被更新/);
  assert.throws(() => applyOpportunityCommand(state, { type: "opportunity.save", data: { patch } }, { ...context, limited: true }), /没有修改权限/);
});

test("recruiting locks the actual position version and permits explicit current-JD review", () => {
  let { state, opportunityId, directionId } = conversionSetup();
  ({ state } = command(state, "position.convert", { opportunityId, directionId, mode: "new", patch: positionPatch }));
  const positionId = state.positions.at(-1).id;
  let result;
  ({ state, result } = command(state, "task.create", { kind: "recruiting", title: "招募", prompt: "按当前 JD 招募", positionId }));
  const taskId = result.taskId;
  ({ state } = command(state, "position.update", { id: positionId, patch: { jd: "新的职责和要求，需要平台开发经验" } }));
  assert.throws(() => command(state, "recruiting.review", { taskId, positionId, candidateIds: [candidates[0].id] }), /已被更新/);
  assert.equal(state.positions.at(-1).pipeline.length, 0);
  ({ state } = command(state, "task.refresh-position", { id: taskId }));
  ({ state } = command(state, "recruiting.review", { taskId, positionId, candidateIds: [candidates[0].id] }));
  assert.equal(state.positions.at(-1).pipeline.length, 1);
  assert.equal(state.tasks.at(-1).positionVersion, 2);
});

test("stale matching results cannot replace current results; a failed match preserves the position", () => {
  let { state, opportunityId, directionId } = conversionSetup();
  ({ state } = command(state, "position.convert", { opportunityId, directionId, mode: "new", patch: positionPatch }));
  const id = state.positions.at(-1).id;
  ({ state } = command(state, "position.match", { id, phase: "start" }));
  assert.throws(() => command(state, "position.match", { id, phase: "start" }), /正在运行/);
  ({ state } = command(state, "position.update", { id, patch: { jd: "岗位职责和任职要求已更新" } }));
  assert.throws(() => command(state, "position.match", { id, phase: "complete", candidateIds: [candidates[0].id] }), /已被更新/);
  ({ state } = command(state, "position.match", { id, phase: "complete", failed: true }));
  assert.deepEqual(state.positions.at(-1).matches, []);
  assert.equal(state.positions.at(-1).version, 2);
});

test("retired opportunity import cannot create assets", () => {
  const data = { patch, historicalStatus: "已完成", source: { kind: "import", id: "file-row-2", label: "第 2 行" } };
  const state = initial();
  assert.throws(() => command(state, "opportunity.import-row", data), /批量导入已取消/);
  assert.equal(state.opportunities.length, 4);
  assert.equal(state.positions.length, 5);
});

test("missing and legacy sample JD never autofill new positions, manual text is preserved", () => {
  const opportunity = initial().opportunities[0];
  const direction = opportunity.directions.find((item) => item.id === "direction-learning");
  assert.equal(directionJdInfo(direction, opportunity).text, "");
  const legacy = { ...direction, jd: legacyLearningJd };
  assert.equal(directionJdInfo(legacy, opportunity).text, "");
  assert.equal(legacy.jd, legacyLearningJd);
  assert.equal(directionJdInfo({ ...legacy, jd: "用户已经修改的内容" }, opportunity).text, "用户已经修改的内容");
  assert.equal(directionJdInfo({ ...legacy, jdSourceId: "manual" }, opportunity).text, legacyLearningJd);
});

test("split directions, deletion prerequisites and completion with missing linked job", () => {
  let { state, opportunityId, directionId } = conversionSetup();
  ({ state } = command(state, "direction.split", { opportunityId, id: directionId, parts: [{ name: "算法" }, { name: "平台" }] }));
  const records = state.opportunities.at(-1).directions.filter((item) => !item.archived);
  assert.equal(records.length, 2);
  ({ state } = command(state, "position.convert", { opportunityId, directionId: records[0].id, mode: "new", patch: positionPatch }));
  assert.throws(() => command(state, "direction.remove", { opportunityId, id: records[0].id }), /岗位/);
  assert.throws(() => command(state, "opportunity.transition", { id: opportunityId, status: "已完成" }), /剩余招聘方向/);
  ({ state } = command(state, "direction.status", { opportunityId, id: records[1].id, status: "不再推进", reason: "客户取消" }));
  ({ state } = command(state, "position.recycle", { id: state.positions.at(-1).id }));
  assert.throws(() => command(state, "opportunity.transition", { id: opportunityId, status: "已完成" }), /至少一个岗位/);
});
