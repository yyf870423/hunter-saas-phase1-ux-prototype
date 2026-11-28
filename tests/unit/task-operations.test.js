import { test } from "node:test";
import assert from "node:assert/strict";
import { taskOperationLabels } from "../../src/stage2/task-operations.js";

for (const [route, step, first, second] of [
  ["client-xinglan", "verify", "检索公开资料", "读取来源内容"],
  ["client-xinglan", "contacts", "检索公开资料", "读取人物来源"],
  ["position-vla", "scope", "读取内容", "调用需求解析工具"],
  ["position-vla", "recall", "检索人选", "检索公开资料"],
  ["position-vla", "enrich", "读取内容", "调用人选匹配工具"],
  ["mapping-embodied", "people", "读取内容", "调用关系整理工具"],
  ["career-linhao", undefined, "读取内容", "检索系统内岗位"],
  ["task-hand-team", undefined, "读取内容", "调用身份核验工具"],
  ["task-interview-summary", undefined, "读取内容", "调用摘要整理工具"],
  ["periodic", undefined, "读取内容", "调用增量核对工具"],
  ["candidate-research-demo", undefined, "读取内容", "调用资料核验工具"],
  ["candidate-research-demo", "followup", "检索公开资料", "读取来源内容"],
  ["new", undefined, "读取内容", "调用资料整理工具"],
]) test(`${route}/${step || "followup"}显示操作类型与对象`, () => {
  const labels = taskOperationLabels(`/tasks/${route}`, step);
  assert.equal(labels.length, 2);
  assert.ok(labels[0].startsWith(first + " · "));
  assert.ok(labels[1].startsWith(second + " · "));
});

test("求职匹配不冒充公开市场岗位搜索，显示词不暴露内部推理", () => {
  assert.ok(taskOperationLabels("/tasks/career-linhao").every(label => !label.includes("公开")));
  assert.ok(!taskOperationLabels("/tasks/unknown").join("").includes("思维链"));
});
