import assert from "node:assert/strict";
import test from "node:test";
import { signals } from "../../src/stage2/data.js";
import { matchesSignalSearch } from "../../src/stage2/signal-search.js";

// Isolated search fixtures, not company facts or Agent discovery results.
const signal = {
  title: "标题测试词",
  summary: "摘要测试词",
  relatedNames: ["关联公司测试词", "关联人物测试词"],
};

test("标题、摘要、关联公司及人物名称分别可以独立命中", () => {
  for (const query of ["标题测试词", "摘要测试词", "关联公司测试词", "关联人物测试词"]) {
    assert.equal(matchesSignalSearch(signal, query), true, query);
  }
});

test("仅在类型、来源、证据、对话及展示信息出现的词不会命中", () => {
  const query = "仅排除字段测试词";
  for (const extra of [
    { type: query },
    { object: query },
    { sources: [query] },
    { changes: [query] },
    { sourceTask: { title: query } },
    { history: [{ detail: query }] },
    { handled: [{ text: query }] },
  ]) {
    assert.equal(matchesSignalSearch({ ...signal, ...extra }, query), false);
  }
});

test("排除字段中的词也出现在允许字段时仍正常命中", () => {
  assert.equal(matchesSignalSearch({ ...signal, summary: "公司变化", type: "公司变化" }, "公司变化"), true);
});

test("去除前后空格并忽略英文大小写，保留普通子串而非正则匹配", () => {
  assert.equal(matchesSignalSearch({ title: "VLA 团队扩招" }, "  vLa  "), true);
  assert.equal(matchesSignalSearch({ title: "VLA 团队扩招" }, ".*"), false);
});

test("空输入与全空白不限制搜索结果", () => {
  assert.equal(matchesSignalSearch(signal, ""), true);
  assert.equal(matchesSignalSearch(signal, " \t　"), true);
});

test("可选字段缺失或为空时不会产生虚假命中或异常", () => {
  assert.equal(matchesSignalSearch({}, "undefined"), false);
  assert.equal(matchesSignalSearch({ title: null, summary: null, relatedNames: [] }, "null"), false);
});

test("每条原型洞察都明确提供关联名称，而非拆分带职位的展示文字", () => {
  for (const item of signals) {
    assert(Array.isArray(item.relatedNames) && item.relatedNames.length > 0, item.id);
    assert(item.relatedNames.every((name) => typeof name === "string" && name.trim()), item.id);
  }
});

test("搜索不修改洞察及关联名称", () => {
  const before = structuredClone(signal);
  matchesSignalSearch(signal, "关联人物");
  assert.deepEqual(signal, before);
});
