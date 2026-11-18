import { test } from "node:test";
import assert from "node:assert/strict";
import { createResearchState, finishResearch, researchCommand } from "../../src/stage2/candidate-research-model.js";
import { researchPeople } from "../../src/stage2/candidate-research-data.js";

test("点名多人先同名澄清，补公司后保留另外两人和原要求", () => {
  const initial = createResearchState(), snapshot = initial.results[0];
  const first = researchCommand(initial, "调研林昊、赵星羽和陈楚宁，重点核实预训练经历，不联系本人", snapshot);
  assert.equal(first.state.job, null);
  assert.equal(first.state.pending.problems.length, 1);
  const clarified = researchCommand(first.state, "拓界机器人那位", snapshot);
  assert.deepEqual([...clarified.state.job.ids].sort(), ["candidate-1", "candidate-3", "candidate-4"]);
  assert.match(clarified.state.job.requirement, /预训练经历/);
});
test("显式公司加姓名不要求勾选", () => {
  const state = createResearchState();
  const out = researchCommand(state, "调研拓界机器人的林昊、赵星羽和陈楚宁，重点核实个人贡献", state.results[0]);
  assert.equal(out.state.job.ids.length, 3);
  assert.equal(out.state.pending, null);
});
test("序号按当前版本顺序，不按最初数组", () => {
  const state = createResearchState();
  const sorted = researchCommand(state, "按分数升序", state.results[0]);
  const out = researchCommand(sorted.state, "调研前三位，核实任职经历", sorted.result);
  assert.deepEqual(out.state.job.ids, sorted.result.ids.slice(0, 3));
  assert.notDeepEqual(out.state.job.ids, state.results[0].ids.slice(0, 3));
});
test("城市和分数条件共同过滤，空结果不破坏旧结果", () => {
  const state = createResearchState();
  const out = researchCommand(state, "只看北京且85分以上的人选", state.results[0]);
  assert.ok(out.result.ids.length);
  assert.ok(out.result.ids.every(id => researchPeople.find(person => person.id === id).city === "北京" && researchPeople.find(person => person.id === id).score >= 85));
  const empty = researchCommand(state, "只看南京且99分以上的人选", state.results[0]);
  assert.equal(empty.state.results.length, 1);
  assert.match(empty.body, /没有符合/);
});
test("含未知姓名不偷偷只处理已知对象", () => {
  const state = createResearchState();
  const out = researchCommand(state, "调研赵星羽和王小明，核实预训练经历", state.results[0]);
  assert.equal(out.state.job, null);
  assert.match(out.body, /王小明/);
});
test("含糊指代或全部范围不猜测", () => {
  const state = createResearchState();
  for (const text of ["调研他们", "调研全部人选", "调研第99位"]) {
    const out = researchCommand(state, text, state.results[0]);
    assert.equal(out.state.job, null);
  }
});
test("明确的人选范围可在后续对话复用", () => {
  const state = createResearchState();
  const first = researchCommand(state, "调研赵星羽和陈楚宁，核实预训练经历", state.results[0]);
  const finished = finishResearch(first.state, first.state.job.id);
  const next = researchCommand(finished.state, "他们重点核实任职经历", finished.result);
  assert.deepEqual(next.state.job.ids, first.state.job.ids);
});
test("停止后迟到回执无效，可恢复原要求", () => {
  const state = createResearchState();
  const first = researchCommand(state, "调研前三位，核实个人贡献", state.results[0]);
  const stopped = researchCommand(first.state, "停止", state.results[0]);
  assert.equal(finishResearch(stopped.state, first.state.job.id), null);
  const continued = researchCommand(stopped.state, "继续刚才的调研", state.results[0]);
  assert.deepEqual(continued.state.job.ids, first.state.job.ids);
  assert.equal(finishResearch(continued.state, continued.state.job.id).result.ids.length, 3);
});
test("部分失败只重试失败项，旧版结果不变", () => {
  const state = createResearchState(), old = JSON.stringify(state.results[0]);
  const first = researchCommand(state, "调研前三位，核实预训练经历", state.results[0]);
  const failed = finishResearch(first.state, first.state.job.id, true);
  assert.equal(failed.state.failedIds.length, 1);
  const retry = researchCommand(failed.state, "重试失败的", failed.result);
  assert.deepEqual(retry.state.job.ids, failed.state.failedIds);
  const completed = finishResearch(retry.state, retry.state.job.id);
  assert.equal(completed.result.ids.length, 3);
  assert.equal(completed.result.failedIds.length, 0);
  assert.equal(JSON.stringify(completed.state.results[0]), old);
});
test("写入及对外联系不伪装成功，评分说明不触发调研或改分", () => {
  const state = createResearchState();
  for (const text of ["把赵星羽加入岗位储备", "联系他们", "删除候选人赵星羽"]) {
    const out = researchCommand(state, text, state.results[0]);
    assert.equal(out.state.job, null);
    assert.match(out.body, /没有接入/);
  }
  const explanation = researchCommand(state, "解释赵星羽的匹配分和理由", state.results[0]);
  assert.equal(explanation.result.kind, "comparison");
  assert.equal(explanation.state.job, null);
  assert.match(explanation.body, /没有开展新搜索或重新评分/);
});
