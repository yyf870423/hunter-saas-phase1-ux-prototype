import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TASK_DEMO_TURN_MS,
  TASK_DEMO_STAGE_MS,
  TASK_DEMO_RESEARCH_MS,
  taskElapsedMs,
  taskInitialStepMs,
} from "../../src/stage2/task-timing.js";

test("普通处理留出六秒，两个工作状态都有可见时间", () => {
  assert.equal(TASK_DEMO_TURN_MS, 6000);
  assert.ok(TASK_DEMO_STAGE_MS > 1000);
  assert.ok(TASK_DEMO_STAGE_MS < TASK_DEMO_TURN_MS);
});

for (const lastPhase of [2, 3, 4])
  test(`首轮${lastPhase}阶段共用六秒时长，不随步骤数膨胀`, () => {
    assert.equal(taskInitialStepMs(0, lastPhase), 0);
    const total = Array.from({ length: lastPhase - 1 }, (_, i) =>
      taskInitialStepMs(i + 1, lastPhase),
    ).reduce((a, b) => a + b, 0);
    assert.equal(total, TASK_DEMO_TURN_MS);
  });

test("调研累计用时包含前置处理，不仅计算最后一个阶段", () => {
  const started = 1000;
  const completed = started + TASK_DEMO_TURN_MS + TASK_DEMO_RESEARCH_MS;
  assert.equal(taskElapsedMs(started, completed), 12000);
  assert.equal(taskElapsedMs(started, completed + 1500), 13500);
});
