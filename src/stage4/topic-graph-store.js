import { useSyncExternalStore } from "react";
import { isGraphType } from "./graph-types";
import { topicGraphs } from "./topic-graph-data";
import { organizationBatchId, organizationGraphPages, organizationScope } from "../stage3/organization-mapping-data";

export const graphStorageKey = "hunter-topic-graphs-v1";
export const graphOrderStorageKey = "hunter-topic-graph-order";
export const emptyGraphDemo = {
  id: "graph-empty",
  name: "新能源机器人产业图谱",
  description: "整理产业链、目标公司与关键人才。",
  typeId: "industry-chain",
  pageIds: [],
  pageCount: 0,
  nodeCount: 0,
  linkedAssets: 0,
  pending: 0,
  updatedAt: "尚未编辑",
};

export function normalizeTopicGraphs(value) {
  if (value?.version !== 1 || !Array.isArray(value.graphs)) return topicGraphs;
  const ids = new Set();
  const valid = value.graphs.every((graph) => {
    if (
      !graph ||
      typeof graph.id !== "string" ||
      !graph.id ||
      ids.has(graph.id) ||
      typeof graph.name !== "string" ||
      !graph.name.trim() ||
      typeof graph.description !== "string" ||
      !isGraphType(graph.typeId) ||
      !Array.isArray(graph.pageIds) ||
      graph.pageIds.some((id) => typeof id !== "string") ||
      (graph.deletedAt != null && typeof graph.deletedAt !== "string")
    )
      return false;
    ids.add(graph.id);
    return true;
  });
  if (!valid) return topicGraphs;
  return value.graphs.map((graph) => ({
    id: graph.id,
    name: graph.name,
    description: graph.description,
    typeId: graph.typeId,
    pageIds: [...new Set(graph.pageIds)],
    ...(Array.isArray(graph.pages) && graph.pages.every((page) => page && typeof page.id === "string" && Array.isArray(page.nodes) && Array.isArray(page.edges)) ? { pages: graph.pages } : {}),
    batchIds: Array.isArray(graph.batchIds) ? graph.batchIds : [],
    versions: Array.isArray(graph.versions) ? graph.versions : [],
    sourceTaskId: typeof graph.sourceTaskId === "string" ? graph.sourceTaskId : "",
    ...Object.fromEntries(
      ["pageCount", "nodeCount", "linkedAssets", "pending"].map((key) => [
        key,
        Number.isInteger(graph[key]) && graph[key] >= 0 ? graph[key] : 0,
      ]),
    ),
    updatedAt:
      typeof graph.updatedAt === "string" ? graph.updatedAt : "尚未编辑",
    deletedAt: graph.deletedAt || null,
  }));
}

function readGraphs() {
  if (typeof window === "undefined") return topicGraphs;
  try {
    return normalizeTopicGraphs(
      JSON.parse(localStorage.getItem(graphStorageKey)),
    );
  } catch {
    return topicGraphs;
  }
}

let graphs = readGraphs();
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => graphs;
export const getTopicGraphSnapshot = getSnapshot;
const emit = () => listeners.forEach((listener) => listener());
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== graphStorageKey && event.key !== null) return;
    graphs = readGraphs();
    emit();
  });
}

export function useTopicGraphs() {
  return useSyncExternalStore(subscribe, getSnapshot, () => topicGraphs);
}

function commit(next) {
  try {
    localStorage.setItem(
      graphStorageKey,
      JSON.stringify({ version: 1, graphs: next }),
    );
  } catch {
    throw new Error(
      "图谱保存失败，原数据未改变。请检查浏览器存储空间或权限后重试。",
    );
  }
  graphs = next;
  emit();
}

export function saveGraphPages(id, pages) {
  const graph = graphs.find((item) => item.id === id && !item.deletedAt);
  if (!graph || !graph.pages || JSON.stringify(graph.pages) === JSON.stringify(pages)) return;
  const editedPages = pages.map((page) => {
    const previous = graph.pages.find((item) => item.id === page.id);
    return JSON.stringify(previous) === JSON.stringify(page) ? page : { ...page, userEdited: true };
  });
  commit(graphs.map((item) => item.id === id ? { ...item, pages: editedPages, pageIds: pages.map((page) => page.id), pageCount: pages.length,
    nodeCount: pages.reduce((count, page) => count + page.nodes.length, 0), updatedAt: "刚刚" } : item));
}

export function publishOrganizationMap(decisions = {}, scope = organizationScope) {
  const id = "mapping-embodied";
  const graph = graphs.find((item) => item.id === id);
  if (!graph || graph.deletedAt) throw new Error("目标人才地图不存在或已删除，请先恢复资产，再保存本批次。");
  if (Object.entries(decisions).some(([key, value]) => !["wangyi", "qiongding"].includes(key) || !["pending", "write", "skip"].includes(value))) throw new Error("审核决定不合法，人才地图未改变。");
  if (!scope.length || scope.some((company) => !organizationScope.some((item) => item.id === company.id))) throw new Error("请明确本轮目标公司，人才地图未改变。");
  const batchId = organizationBatchId(scope);
  if (graph.batchIds?.includes(batchId)) return graph;
  const incoming = organizationGraphPages(decisions, scope).map((page) => {
    const previous = graph.pages?.find((item) => item.id === page.id);
    return previous?.userEdited ? previous : page;
  });
  const pages = [...(graph.pages || []).filter((page) => !incoming.some((item) => item.id === page.id)), ...incoming];
  const result = { ...graph, name: "具身智能目标公司人才地图", description: "星澜、拓界、穹顶和灵跃的组织、关键岗位、任职人与待核实信息。",
    pages, pageIds: pages.map((page) => page.id), pageCount: pages.length, nodeCount: pages.reduce((count, page) => count + page.nodes.length, 0),
    pending: pages.reduce((count, page) => count + page.nodes.filter((node) => node.status === "review").length, 0),
    linkedAssets: pages.reduce((count, page) => count + page.nodes.filter((node) => node.assetPath).length, 0),
    sourceTaskId: "mapping-embodied", batchIds: [...(graph.batchIds || []), batchId], updatedAt: "刚刚",
    versions: [...(graph.versions || []), { at: new Date().toISOString(), name: graph.name, pages: graph.pages || null, pageIds: graph.pageIds, decisions }],
  };
  commit(graphs.map((item) => item.id === id ? result : item));
  return result;
}

export function validateGraphMetadata(draft, records = graphs, id) {
  const errors = {};
  const name = typeof draft.name === "string" ? draft.name.trim() : "";
  if (!name) errors.name = "请输入图谱名称";
  else if (name.length > 120) errors.name = "图谱名称不能超过 120 个字符";
  else if (
    records.some(
      (graph) =>
        !graph.deletedAt &&
        graph.id !== id &&
        graph.name.trim().toLowerCase() === name.toLowerCase(),
    )
  )
    errors.name = "已存在同名知识图谱，请使用其他名称";
  if (!isGraphType(draft.typeId)) errors.typeId = "请选择图谱类型";
  if (typeof draft.description !== "string" || draft.description.length > 2000)
    errors.description = "图谱说明不能超过 2000 个字符";
  return errors;
}

export function saveGraphMetadata(draft, id) {
  const current =
    graphs.find((graph) => graph.id === id) ||
    (id === emptyGraphDemo.id ? emptyGraphDemo : null);
  if (id && (!current || current.deletedAt))
    throw new Error("图谱不存在或已删除，请返回列表。");
  const errors = validateGraphMetadata(draft, graphs, id);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const next = {
    ...(current || {
      pageIds: [],
      pageCount: 0,
      nodeCount: 0,
      linkedAssets: 0,
      pending: 0,
    }),
    id: id || `graph-${crypto.randomUUID()}`,
    name: draft.name.trim(),
    description: draft.description.trim(),
    typeId: draft.typeId,
    updatedAt: "刚刚",
  };
  commit(
    graphs.some((graph) => graph.id === id)
      ? graphs.map((graph) => (graph.id === id ? next : graph))
      : [...graphs, next],
  );
  return next;
}

export function recycleGraph(id) {
  const graph =
    graphs.find((item) => item.id === id) ||
    (id === emptyGraphDemo.id ? emptyGraphDemo : null);
  if (!graph || graph.deletedAt) throw new Error("图谱不存在或已删除。");
  const deleted = { ...graph, deletedAt: new Date().toISOString() };
  commit(
    graphs.some((item) => item.id === id)
      ? graphs.map((item) => (item.id === id ? deleted : item))
      : [...graphs, deleted],
  );
}

export function restoreGraph(id, permanently = false, name) {
  const graph = graphs.find(
    (item) => item.id === id && item.deletedAt && item.deletedAt !== "purged",
  );
  if (!graph) throw new Error("回收站中已不存在该图谱。");
  if (permanently) {
    // Preserve a tombstone so seed and demo routes cannot resurrect purged graphs.
    commit(
      graphs.map((item) =>
        item.id === id
          ? {
              ...item,
              pageIds: [],
              pageCount: 0,
              nodeCount: 0,
              linkedAssets: 0,
              pending: 0,
              description: "",
              deletedAt: "purged",
            }
          : item,
      ),
    );
    return;
  }
  const draft = { ...graph, name: name ?? graph.name };
  const errors = validateGraphMetadata(draft, graphs, id);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  commit(
    graphs.map((item) =>
      item.id === id
        ? { ...draft, name: draft.name.trim(), deletedAt: null }
        : item,
    ),
  );
}

export function orderTopicGraphs(items) {
  let ids = [];
  try {
    const saved = JSON.parse(localStorage.getItem(graphOrderStorageKey));
    if (Array.isArray(saved))
      ids = [...new Set(saved.filter((id) => typeof id === "string"))];
  } catch {
    /* Invalid order never hides valid graphs. */
  }
  const rank = (id) => (ids.includes(id) ? ids.indexOf(id) : ids.length);
  return [...items].sort((a, b) => rank(a.id) - rank(b.id));
}

export function saveGraphOrder(ids) {
  try {
    localStorage.setItem(
      graphOrderStorageKey,
      JSON.stringify([...new Set(ids)]),
    );
  } catch {
    throw new Error("图谱顺序保存失败，已恢复原顺序。请检查浏览器存储后重试。");
  }
}
