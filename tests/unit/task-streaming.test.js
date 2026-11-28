import { test } from "node:test";
import assert from "node:assert/strict";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { replyTextLength, replyStreamDuration, rehypeReplyStream } from "../../src/stage2/task-streaming.js";

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
const parse = (text) => parser.runSync(parser.parse(text));
const text = (node) => node.type === "text" ? node.value : (node.children || []).map(text).join("");
const descendants = (node, tag) => [node, ...(node.children || []).flatMap(child => descendants(child, tag))].filter(item => item.tagName === tag);

test("模拟时长有上下限，不由长文无限拖延", () => {
  assert.equal(replyStreamDuration(1), 1200);
  assert.equal(replyStreamDuration(10000), 6000);
  assert(replyStreamDuration(200) > replyStreamDuration(50));
});
test("空内容不会启动打字；中文及emoji按Unicode码点计数", () => {
  assert.equal(replyTextLength(""), 0);
  assert.equal(replyTextLength("中文😀"), 3);
  const tree = parse("中文😀结束");
  rehypeReplyStream({ budget: 3 })(tree);
  assert.equal(text(tree), "中文😀");
});
test("未闭合显示不来自截断源码，粗体和段落结构保持正确", () => {
  const tree = parse("先看 **核验结果**，预算未知。");
  rehypeReplyStream({ budget: 5 })(tree);
  assert.equal(descendants(tree, "strong").length, 1);
  assert.equal(text(tree), "先看 核验");
});
test("已揭示行保留全部列，后续表格行不一次出现", () => {
  const tree = parse("| 来源 | 结论 |\n| --- | --- |\n| 官网 | 待核实 |\n| 招聘 | 有信号 |\n");
  const headerOnly = text(tree).indexOf("官网") + 1;
  rehypeReplyStream({ budget: headerOnly })(tree);
  assert.equal(descendants(tree, "table").length, 1);
  assert.equal(descendants(tree, "tr").length, 2);
  assert.equal(descendants(descendants(tree, "tr")[1], "td").length, 2);
  assert(!text(tree).includes("招聘"));
});
test("零预算没有正文；完成后不改动解析树和原始链接", () => {
  const source = "## 结论\n\n[来源](https://example.com/evidence)\n\n- 保留未知项";
  const tree = parse(source), original = structuredClone(tree);
  rehypeReplyStream()(tree);
  assert.deepEqual(tree, original);
  const empty = parse(source);
  rehypeReplyStream({ budget: 0 })(empty);
  assert.equal(text(empty), "");
});
test("多个格式化片段之间的空格不会被流式裁剪吃掉", () => {
  const tree = parse("**first** **second** end");
  rehypeReplyStream({ budget: 13 })(tree);
  assert.equal(text(tree), "first second ");
});
