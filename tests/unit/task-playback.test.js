import assert from "node:assert/strict";
import test from "node:test";
import { readCompletedTaskPhase, saveCompletedTaskPhase, taskPlaybackKey } from "../../src/stage2/task-playback.js";

const storage = (entries = []) => {
  const values = new Map(entries);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test("legacy phase alone cannot expose uncompleted dialogue", () => {
  const cache = storage([["demo-phase", "4"], ["demo-draft", "保留输入"]]);
  assert.equal(readCompletedTaskPhase("demo", 5, cache), null);
  assert.equal(cache.getItem("demo-draft"), "保留输入");
});

test("completed playback restores only a versioned integer checkpoint in range", () => {
  const cache = storage();
  saveCompletedTaskPhase("demo", 2, cache);
  assert.equal(readCompletedTaskPhase("demo", 5, cache), 2);
  for (const value of [null, {}, { schemaVersion: 0, complete: true, phase: 2 }, { schemaVersion: 1, complete: false, phase: 2 }, ...[-1, 6, 1.5, "2"].map(phase => ({ schemaVersion: 1, complete: true, phase }))]) {
    cache.setItem(taskPlaybackKey("demo"), JSON.stringify(value));
    assert.equal(readCompletedTaskPhase("demo", 5, cache), null);
  }
  cache.setItem(taskPlaybackKey("demo"), "invalid");
  assert.equal(readCompletedTaskPhase("demo", 5, cache), null);
});

test("checkpoint writing neither overwrites draft nor another task", () => {
  const cache = storage([["demo-draft", "保留输入"], ["other-phase", "4"]]);
  saveCompletedTaskPhase("demo", 0, cache);
  assert.equal(readCompletedTaskPhase("demo", 5, cache), 0);
  assert.equal(readCompletedTaskPhase("other", 5, cache), null);
  assert.equal(cache.getItem("demo-draft"), "保留输入");
  assert.equal(cache.getItem("other-phase"), "4");
});

test("unavailable storage cannot break dialogue playback", () => {
  const denied = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
  assert.equal(readCompletedTaskPhase("demo", 5, denied), null);
  assert.doesNotThrow(() => saveCompletedTaskPhase("demo", 2, denied));
});
