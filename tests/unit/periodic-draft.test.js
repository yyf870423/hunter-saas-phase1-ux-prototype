import test from "node:test";
import assert from "node:assert/strict";
import { periodicGoal, periodicSchedule, readPeriodicDrafts } from "../../src/stage2/periodic-draft.js";

test("周期输入保留具体频率，只有首次草稿允许补充默认时间", () => {
  assert.equal(periodicSchedule("每周三检查招聘需求变化", "09:00"), "每周三 09:00");
  assert.equal(periodicSchedule("每天检查公开招聘变化", "09:00"), "每天 09:00");
  assert.equal(periodicSchedule("每两周周五 17:00 检查公开招聘变化", "09:00"), "每两周周五 17:00");
  assert.equal(periodicSchedule("每周三"), "");
  assert.equal(periodicSchedule("整理面试反馈", "09:00"), "");
  assert.equal(periodicGoal("每周三检查招聘需求变化"), "检查招聘需求变化");
});

test("缺少时间的已保存周期仍不能绕过读取校验", () => {
  const storage = { getItem: () => JSON.stringify([{ id: "invalid", prompt: "检查招聘需求", schedule: "每周三" }, { id: "valid", prompt: "检查招聘需求", schedule: "每周三 09:00" }]) };
  assert.deepEqual(readPeriodicDrafts(storage).map((item) => item.id), ["valid"]);
});
