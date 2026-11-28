import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TASK_DEMO_TURN_MS,
  TASK_DEMO_STAGE_MS,
  TASK_DEMO_RESEARCH_MS,
  taskElapsedMs,
  taskInitialStepMs,
} from "../../src/stage2/task-timing.js";

test("每个具体操作留出六秒，两项操作累计十二秒", () => {
  assert.equal(TASK_DEMO_TURN_MS, 12000);
  assert.equal(TASK_DEMO_STAGE_MS, 6000);
  assert.ok(TASK_DEMO_STAGE_MS < TASK_DEMO_TURN_MS);
});

for (const lastPhase of [2, 3, 4])
  test(`首轮${lastPhase}阶段各留十二秒，不压缩具体操作的阅读时间`, () => {
    assert.equal(taskInitialStepMs(0), 0);
    const total = Array.from({ length: lastPhase - 1 }, (_, i) =>
      taskInitialStepMs(i + 1),
    ).reduce((a, b) => a + b, 0);
    assert.equal(total, TASK_DEMO_TURN_MS * (lastPhase - 1));
  });

test("调研累计用时包含前置处理，不仅计算最后一个阶段", () => {
  const started = 1000;
  const completed = started + TASK_DEMO_TURN_MS + TASK_DEMO_RESEARCH_MS;
  assert.equal(taskElapsedMs(started, completed), 24000);
  assert.equal(taskElapsedMs(started, completed + 1500), 25500);
});
