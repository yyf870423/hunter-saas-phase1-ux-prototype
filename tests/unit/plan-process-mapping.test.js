import test from "node:test";
import assert from "node:assert/strict";
import { planSteps, internalTasks } from "../../src/stage2/data.js";
import { businessScenarios } from "../../src/stage3/data.js";

for (const [name, plan, tasks] of [
  ["岗位招聘", planSteps, internalTasks],
  ...Object.values(businessScenarios).map((scenario) => [
    scenario.type,
    scenario.plan,
    scenario.tasks,
  ]),
]) {
  test(`${name}的每条处理通过唯一stepId归属有效步骤`, () => {
    const steps = new Set(plan.map((step) => step.id));
    assert.equal(steps.size, plan.length);
    assert.equal(new Set(tasks.map((task) => task.id)).size, tasks.length);
    for (const task of tasks) {
      assert.equal(typeof task.stepId, "string");
      assert(steps.has(task.stepId), `${task.id}归属的${task.stepId}不存在`);
    }
    assert.equal(
      plan.flatMap((step) => tasks.filter((task) => task.stepId === step.id))
        .length,
      tasks.length,
    );
  });
}
