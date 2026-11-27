import { test } from "node:test";
import assert from "node:assert/strict";
import { initialGraphPages } from "../../src/stage4/topic-graph-data.js";
import {
  createReviewItems,
  editReview,
  projectReview,
  rebaseReview,
  resolveReview,
  reviewCondition,
  reviewRows,
  validateReview,
} from "../../src/stage4/graph-review-model.js";

const setup = (id) => {
  const pages = structuredClone(initialGraphPages),
    items = createReviewItems(pages);
  return { pages, items, item: items.find((item) => item.id === id) };
};
for (const id of [
  "review-wang",
  "review-import",
  "review-chensong-flow",
  "review-eco",
  "review-team-parent",
  "review-coauthor",
  "review-industry",
]) {
  test(`${id}: 采纳只应用本项，原值与坐标不被预览污染，可识别重复结果`, () => {
    const { pages, items, item } = setup(id),
      before = structuredClone(pages);
    assert.equal(reviewCondition(pages, item).state, "ready");
    const result = resolveReview(pages, items, id, "accept");
    assert.deepEqual(pages, before);
    for (const page of pages) {
      const next = result.pages.find((p) => p.id === page.id);
      if (page.id !== item.pageId) assert.deepEqual(next, page);
      for (const node of page.nodes) {
        const after = next.nodes.find((n) => n.id === node.id);
        if (after)
          assert.deepEqual(
            [after.x, after.y, after.assetPath],
            [node.x, node.y, node.assetPath],
          );
      }
    }
    assert.equal(reviewCondition(result.pages, item).state, "already");
    assert.equal(
      result.items.filter((row) => row.state === "accepted").length,
      1,
    );
    assert.throws(
      () => resolveReview(result.pages, result.items, id, "accept"),
      /已处理/,
    );
  });
}
test("拒绝仅保留处理记录，不改变任何原图内容", () => {
  const { pages, items } = setup();
  const r = resolveReview(pages, items, "review-team-parent", "reject");
  assert.strictEqual(r.pages, pages);
  assert.equal(
    r.items.find((x) => x.id === "review-team-parent").state,
    "rejected",
  );
});
test("局部变化叠加明确的旧新关系，临时位置不进入原图", () => {
  const { pages, item } = setup("review-team-parent");
  const p = projectReview(pages, item, false, {
    "org-vla": { x: -300, y: -500 },
  });
  assert.equal(p.edges.find((e) => e.id === "oe2").reviewDelta, "remove");
  assert.equal(
    p.edges.find((e) => e.id === "review-team-edge").reviewDelta,
    "add",
  );
  assert.equal(p.nodes.find((n) => n.id === "org-vla").x, -300);
  assert.equal(pages[0].nodes.find((n) => n.id === "org-vla").x, 610);
});
test("默认局部上下文小于整图，按需展开不丢改动状态", () => {
  const { pages, item } = setup("review-wang");
  assert.ok(
    projectReview(pages, item).nodes.length <
      pages[0].nodes.filter((n) => !n.hidden).length,
  );
  assert.equal(
    projectReview(pages, item, true).nodes.length,
    pages[0].nodes.filter((n) => !n.hidden).length,
  );
});
test("同一节点无关字段和纯坐标变化不造成冲突", () => {
  const { pages, item } = setup("review-wang");
  Object.assign(
    pages[0].nodes.find((n) => n.id === "org-wang"),
    { x: -900, subtitle: "用户补充的岗位" },
  );
  assert.equal(reviewCondition(pages, item).state, "ready");
});
test("相关字段变化必须重核，重核后保留最新无关字段", () => {
  const { pages, items, item } = setup("review-wang");
  Object.assign(
    pages[0].nodes.find((n) => n.id === "org-wang"),
    { summary: "用户最新核对", x: -200 },
  );
  assert.equal(reviewCondition(pages, item).state, "conflict");
  assert.throws(
    () => resolveReview(pages, items, item.id, "accept"),
    /正式内容已变化/,
  );
  const rechecked = rebaseReview(pages, item);
  assert.equal(reviewCondition(pages, rechecked).state, "ready");
  const next = resolveReview(pages, [rechecked], item.id, "accept");
  assert.equal(next.pages[0].nodes.find((n) => n.id === "org-wang").x, -200);
});
test("删除依赖不能通过重新核对绕过", () => {
  const { pages, item } = setup("review-wang");
  pages[0].nodes = pages[0].nodes.filter((n) => n.id !== "org-wang");
  assert.equal(reviewCondition(pages, item).state, "conflict");
  assert.throws(() => rebaseReview(pages, item), /移除/);
});
test("上级调整不会部分生效，循环建议被拒绝且原图不变", () => {
  const { pages, items, item } = setup("review-team-parent"),
    before = structuredClone(pages);
  const invalid = editReview(item, {
    id: "org-vla",
    field: "parentId",
    value: "org-zhao",
  });
  assert.equal(reviewCondition(pages, invalid).state, "invalid");
  assert.throws(
    () =>
      resolveReview(
        pages,
        items.map((x) => (x.id === item.id ? invalid : x)),
        item.id,
        "accept",
      ),
    /循环/,
  );
  assert.deepEqual(pages, before);
});
test("重复边、缺失端点和非法字段都在写入前拦截", () => {
  const { pages, item } = setup("review-chensong-flow");
  const noTarget = editReview(item, {
    id: "review-chensong-flow-edge",
    field: "target",
    value: "missing",
  });
  assert.equal(reviewCondition(pages, noTarget).state, "invalid");
  const invalid = structuredClone(item);
  invalid.changes[0].keys.push("x");
  invalid.changes[0].after.x = 999;
  assert.throws(() => validateReview(pages, invalid), /字段不合法/);
  const duplicate = structuredClone(item);
  Object.assign(duplicate.changes[1].after, {
    source: "eco-tuojie",
    target: "eco-xinglan",
    label: "人才流向",
  });
  assert.equal(reviewCondition(pages, duplicate).state, "invalid");
});
test("修改建议仅更新副本，当前值和建议值可审阅", () => {
  const { pages, item } = setup("review-wang");
  const edited = editReview(item, {
    id: "org-wang",
    field: "summary",
    value: "重新核对身份后再关联",
  });
  assert.notDeepEqual(edited.changes, item.changes);
  assert.equal(reviewRows(pages, edited)[0].proposed, "重新核对身份后再关联");
  assert.notEqual(
    pages[0].nodes.find((n) => n.id === "org-wang").summary,
    "重新核对身份后再关联",
  );
});
test("非法类型、空关系名称、任意资产链接不允许保存", () => {
  const { pages, item } = setup("review-coauthor");
  const blank = editReview(item, { id: "pe3", field: "label", value: "" });
  assert.throws(() => validateReview(pages, blank), /不能为空/);
  const invalid = structuredClone(item);
  invalid.changes[0].keys.push("assetPath");
  invalid.changes[0].before.assetPath = null;
  invalid.changes[0].after.assetPath = "javascript:alert(1)";
  assert.throws(() => validateReview(pages, invalid), /字段不合法/);
});
test("已实现只记录为无需重复处理，保留页面引用不执行写入", () => {
  const { pages, items, item } = setup("review-wang");
  const applied = resolveReview(pages, items, item.id, "accept");
  const result = resolveReview(applied.pages, items, item.id, "already");
  assert.strictEqual(result.pages, applied.pages);
  assert.equal(result.items.find((x) => x.id === item.id).state, "already");
});
