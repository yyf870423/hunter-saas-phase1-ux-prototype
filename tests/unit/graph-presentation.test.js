import test from "node:test";
import assert from "node:assert/strict";
import { graphEdgeGeometry, graphFitZoom, graphLayoutPan, graphPositions, layoutGraph, projectGraphPositions } from "../../src/components/graph-presentation.js";
import { createDenseGraphPage } from "../../src/stage4/graph-dense-sample.js";

for (const direction of ["LR", "TB"]) test(`${direction} 密集图布局不重叠、不丢事实、按显式父级分层`, () => {
  const page = createDenseGraphPage(), before = structuredClone(page);
  const result = layoutGraph(page.nodes, page.edges, direction);
  assert.equal(result.length, 85);
  assert.equal(page.edges.length, 100);
  assert.deepEqual(page, before);
  const root = result.find(node => node.id === "org-xinglan");
  const firstLevel = result.filter(node => node.parentId === root.id);
  const axis = direction === "LR" ? "x" : "y";
  assert(firstLevel.some(node => node[axis] < root[axis]));
  assert(firstLevel.some(node => node[axis] > root[axis]));
  for (const node of result) {
    assert(Number.isFinite(node.x) && Number.isFinite(node.y));
    const { x, y, ...facts } = node, { x: oldX, y: oldY, ...originalFacts } = page.nodes.find(item => item.id === node.id);
    assert.deepEqual(facts, originalFacts);
    if (node.parentId) {
      const parent = result.find(item => item.id === node.parentId);
      const positive = node[axis] > root[axis];
      assert(direction === "LR"
        ? positive ? node.x >= parent.x + 180 : node.x + 180 <= parent.x
        : positive ? node.y >= parent.y + 86 : node.y + 86 <= parent.y);
    }
  }
  for (let i = 0; i < result.length; i++) for (let j = i + 1; j < result.length; j++) {
    const a = result[i], b = result[j];
    assert(a.x + 180 <= b.x || b.x + 180 <= a.x || a.y + 86 <= b.y || b.y + 86 <= a.y, `${a.id}/${b.id} overlap`);
  }
  assert.deepEqual(projectGraphPositions(result, graphPositions(page.nodes)), page.nodes);
});

test("循环、孤立节点、多根和缺失端点不导致数据丢失", () => {
  const nodes = ["a", "b", "c", "isolated"].map(id => ({ id, x: 0, y: 0 }));
  const edges = [{ source: "a", target: "b" }, { source: "b", target: "c" }, { source: "c", target: "a" }, { source: "unknown", target: "a" }];
  assert.equal(layoutGraph(nodes, edges).length, 4);
  assert.deepEqual(layoutGraph([], []).length, 0);
  assert.equal(layoutGraph([{ id: "only" }], []).length, 1);
});

test("密集图保留可读缩放，审核定位保留被审核节点", () => {
  const page = createDenseGraphPage(), viewport = { clientWidth: 800, clientHeight: 520 };
  const nodes = layoutGraph(page.nodes, page.edges);
  const zoom = graphFitZoom(nodes, viewport);
  assert(zoom >= 0.65);
  const target = nodes.find(node => node.id === "org-wang");
  const pan = graphLayoutPan(nodes, viewport, zoom, "TB", { focusId: target.id });
  assert.equal((target.x + 90) * zoom + pan.x, 400);
  assert.equal((target.y + 43) * zoom + pan.y, 260);
  const root = nodes.find(node => node.id === "org-xinglan");
  const centered = graphLayoutPan(nodes, viewport, zoom, "LR");
  assert.equal((root.x + 90) * zoom + centered.x, 400);
  assert.equal((root.y + 43) * zoom + centered.y, 260);
});

for (const direction of ["LR", "TB"]) for (const style of ["curve", "step"]) test(`${direction}/${style} 反向分支使用左侧或上侧端口且不反转关系`, () => {
  const source = { x: 420, y: 300 }, target = { x: 40, y: 80 };
  const value = graphEdgeGeometry(source, target, { direction, style });
  const coordinates = value.path.match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert.deepEqual(coordinates.slice(0, 2), direction === "LR" ? [420, 343] : [510, 300]);
  assert.deepEqual(coordinates.slice(-2), direction === "LR" ? [220, 123] : [130, 166]);
  assert(!value.path.includes("NaN"));
});

test("单分支不制造额外关系，分支及其后代不被拆散", () => {
  const nodes = [{ id: "root" }, { id: "only", parentId: "root" }, { id: "leaf-a", parentId: "only" }, { id: "leaf-b", parentId: "only" }];
  const result = layoutGraph(nodes, []);
  const root = result[0];
  assert(result.slice(1).every(node => node.x > root.x));
  assert.deepEqual(result.map(({ x, y, ...facts }) => facts), nodes);
});

test("无parent的关系网络双侧展开，多根和不同宽度不重叠", () => {
  const nodes = [{ id: "root", width: 240 }, ...["a", "b", "c", "d"].map(id => ({ id, width: 160 })), { id: "isolated", width: 300 }];
  const edges = ["a", "b", "c", "d"].map(target => ({ source: "root", target }));
  for (const direction of ["LR", "TB"]) {
    const result = layoutGraph(nodes, edges, direction);
    const root = result[0], children = result.slice(1, 5), axis = direction === "LR" ? "x" : "y";
    assert(children.some(node => node[axis] < root[axis]) && children.some(node => node[axis] > root[axis]));
    for (let i = 0; i < result.length; i++) for (let j = i + 1; j < result.length; j++) {
      const a = result[i], b = result[j];
      assert(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + 86 <= b.y || b.y + 86 <= a.y);
    }
  }
});

for (const direction of ["LR", "TB"]) for (const style of ["curve", "step"]) test(`${direction}/${style} 连线方向和端点正确`, () => {
  const a = { x: 40, y: 80 }, b = { x: 420, y: 300 };
  const value = graphEdgeGeometry(a, b, { direction, style });
  assert(!value.path.includes("NaN"));
  assert(value.path.startsWith(direction === "LR" ? "M220 123" : "M130 166") || value.path.startsWith(direction === "LR" ? "M 220 123" : "M 130 166"));
  assert(style === "curve" ? value.path.includes("C") : value.path.includes("L"));
  assert(Number.isFinite(value.x) && Number.isFinite(value.y));
});
