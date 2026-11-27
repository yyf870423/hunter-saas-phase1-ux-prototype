import { graphReviewItems, initialGraphPages } from "./topic-graph-data.js";

const fields = {
  node: [
    "label",
    "subtitle",
    "summary",
    "kind",
    "parentId",
    "status",
    "marker",
    "sourceType",
    "assetType",
    "assetPath",
    "evidence",
    "hidden",
    "excluded",
  ],
  edge: [
    "source",
    "target",
    "label",
    "kind",
    "status",
    "evidence",
    "sourcePort",
    "targetPort",
  ],
};
const listKey = (kind) => (kind === "node" ? "nodes" : "edges");
const pick = (value, keys) =>
  Object.fromEntries(keys.map((key) => [key, value?.[key] ?? null]));
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clean = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== null));
const find = (page, change) =>
  page?.[listKey(change.kind)]?.find((item) => item.id === change.id);
export const reviewStateLabel = {
  pending: "待审核",
  accepted: "已采纳",
  rejected: "已拒绝",
  already: "无需重复处理",
};
export const reviewDeltaLabel = {
  add: "拟新增",
  update: "拟修改",
  remove: "拟移除",
};
export const changeAction = (change) =>
  change.before === null ? "add" : change.after === null ? "remove" : "update";

function change(pageId, kind, id, patch, mode = "update") {
  const original = initialGraphPages
    .find((page) => page.id === pageId)
    ?.[listKey(kind)].find((item) => item.id === id);
  const keys = mode === "update" ? Object.keys(patch) : fields[kind];
  return {
    kind,
    id,
    keys,
    before: mode === "add" ? null : pick(original, keys),
    after:
      mode === "remove"
        ? null
        : pick(mode === "add" ? patch : { ...original, ...patch }, keys),
  };
}

const proposals = {
  "review-wang": {
    actionLabel: "确认保留待核实状态",
    suggestion:
      "保留自由人物节点和待核实身份，补充本图备注；不关联同名候选人，也不确认当前单位。",
    changes: [
      change("organization", "node", "org-wang", {
        summary: "身份与任职时间线待核实；暂不关联同名候选人。",
      }),
    ],
  },
  "review-import": {
    actionLabel: "确认标记待核实",
    suggestion:
      "在本图标记身份待核实，继续保留自由人物节点；现有证据不足以关联系统候选人。",
    changes: [
      change("organization", "node", "org-hejing", {
        status: "review",
        marker: "身份待核实",
        summary:
          "同名候选人仅作为线索，稳定身份和当前单位尚待核实；不自动关联。",
      }),
    ],
  },
  "review-eco": {
    actionLabel: "确认移除本图关系",
    suggestion:
      "会议共同出席不足以支持合作关系，建议仅移除本图的疑似合作连线；保留两家公司节点和原始资料。",
    changes: [change("ecosystem", "edge", "ee3", {}, "remove")],
  },
  "review-chensong-flow": {
    actionLabel: "确认新增人才流动关系",
    changes: [
      change(
        "ecosystem",
        "node",
        "review-xpeng",
        {
          label: "小鹏汽车",
          subtitle: "人才原任职公司",
          kind: "company",
          status: "normal",
          sourceType: "local",
          evidence: ["陈松公开主页 · 2026-08"],
        },
        "add",
      ),
      change(
        "ecosystem",
        "edge",
        "review-chensong-flow-edge",
        {
          source: "review-xpeng",
          target: "eco-xinglan",
          label: "人才流动 · 陈松",
          kind: "local",
          status: "normal",
          evidence: [
            "陈松公开主页 · 2026-08",
            "星澜机器人官网团队页 · 2026-08",
          ],
        },
        "add",
      ),
    ],
  },
};

const extraItems = [
  {
    id: "review-team-parent",
    pageId: "organization",
    nodeId: "org-vla",
    type: "组织关系",
    title: "VLA 算法组拟调整至机器人学习组",
    summary: "组织说明提出新的隶属关系，须确认后才更新本图。",
    suggestion:
      "将 VLA 算法组从具身智能中心调整到机器人学习组，旧关系与新关系一起变更。",
    actionLabel: "确认调整关系",
    evidence: ["【测试材料】组织调整说明"],
    changes: [
      change("organization", "node", "org-vla", { parentId: "org-learning" }),
      change("organization", "edge", "oe2", {}, "remove"),
      change(
        "organization",
        "edge",
        "review-team-edge",
        {
          source: "org-learning",
          target: "org-vla",
          label: "下属团队",
          kind: "local",
          status: "normal",
          evidence: ["【测试材料】组织调整说明"],
        },
        "add",
      ),
    ],
  },
  {
    id: "review-coauthor",
    pageId: "people",
    nodeId: "p-zhou",
    type: "候选人关系",
    title: "周明远与刘闻博的共同作者关系待补充",
    summary: "补充本图中共同作者关系的证据说明，不修改候选人资料。",
    suggestion: "将本图关系补充为共同作者关系，并注明一篇论文的依据。",
    actionLabel: "确认更新本图关系",
    evidence: ["【测试材料】共同作者记录"],
    changes: [
      change("people", "edge", "pe3", {
        label: "共同作者 · 1 篇",
        evidence: ["【测试材料】共同作者记录"],
      }),
    ],
  },
  {
    id: "review-industry",
    pageId: "industry-chain",
    nodeId: "chain-platform",
    type: "行业知识",
    title: "补充多传感器融合知识节点",
    summary: "行业资料提出一个待审核的支撑技术节点及其关系。",
    suggestion:
      "在本图新增多传感器融合节点并连接本体平台；不创建或修改其他资产。",
    actionLabel: "确认新增知识节点",
    evidence: ["【测试材料】行业知识说明"],
    changes: [
      change(
        "industry-chain",
        "node",
        "review-sensor-fusion",
        {
          label: "多传感器融合",
          subtitle: "本体感知支撑技术",
          kind: "note",
          status: "normal",
          sourceType: "local",
          evidence: ["【测试材料】行业知识说明"],
        },
        "add",
      ),
      change(
        "industry-chain",
        "edge",
        "review-sensor-edge",
        {
          source: "review-sensor-fusion",
          target: "chain-platform",
          label: "支撑感知",
          kind: "local",
          status: "normal",
          evidence: ["【测试材料】行业知识说明"],
        },
        "add",
      ),
    ],
  },
];

export function createReviewItems(pages, saved = []) {
  return [
    ...graphReviewItems.map((item) => ({ ...item, ...proposals[item.id] })),
    ...extraItems,
  ]
    .filter((item) => pages.some((page) => page.id === item.pageId))
    .map((item) => ({
      ...structuredClone(item),
      state: "pending",
      ...structuredClone(saved.find((record) => record.id === item.id) || {}),
    }));
}

export function validateReview(pages, item) {
  if (!item || !Array.isArray(item.changes) || !item.changes.length)
    throw new Error("本项缺少完整变更，不能采纳。");
  const page = pages.find((page) => page.id === item.pageId);
  if (!page) throw new Error("对应图页已不存在，请重新核对。");
  const identities = new Set();
  for (const c of item.changes) {
    if (
      !fields[c.kind] ||
      typeof c.id !== "string" ||
      !c.id ||
      identities.has(`${c.kind}:${c.id}`) ||
      !Array.isArray(c.keys) ||
      !c.keys.length ||
      c.keys.some((key) => !fields[c.kind].includes(key)) ||
      (c.before === null && c.after === null)
    )
      throw new Error("变更结构或字段不合法，正式内容未改变。");
    identities.add(`${c.kind}:${c.id}`);
    for (const value of [c.before, c.after]) {
      if (value === null) continue;
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        Object.keys(value).some((key) => !c.keys.includes(key)) ||
        c.keys.some((key) => !Object.hasOwn(value, key))
      )
        throw new Error("变更字段与声明不一致，正式内容未改变。");
      if (
        ["label", ...(c.kind === "edge" ? ["source", "target"] : [])].some(
          (key) =>
            c.keys.includes(key) &&
            (typeof value[key] !== "string" || !value[key].trim()),
        )
      )
        throw new Error("名称和关系端点不能为空。");
      for (const [key, v] of Object.entries(value)) {
        if (v === null) continue;
        if (
          key === "evidence"
            ? !Array.isArray(v) || v.some((x) => typeof x !== "string")
            : ["hidden", "excluded"].includes(key)
              ? typeof v !== "boolean"
              : typeof v !== "string"
        )
          throw new Error("变更字段类型不合法。");
      }
      if (
        value.label != null &&
        (!value.label.trim() || value.label.length > 120)
      )
        throw new Error("名称须为1至120个字符。");
      if (value.summary != null && value.summary.length > 2000)
        throw new Error("本图备注不能超过2000个字符。");
      if (
        value.kind != null &&
        !(
          c.kind === "node"
            ? [
                "company",
                "person",
                "organization",
                "position",
                "industry",
                "note",
              ]
            : ["local", "shared", "derived", "analysis"]
        ).includes(value.kind)
      )
        throw new Error("对象类型不合法。");
      if (
        value.status != null &&
        !["normal", "review", "updated"].includes(value.status)
      )
        throw new Error("对象状态不合法。");
      if (
        value.assetPath != null &&
        !/^\/(candidates|companies|positions|papers|patents)\/[a-zA-Z0-9_-]+$/.test(
          value.assetPath,
        )
      )
        throw new Error("资产关联地址不合法。");
    }
    if (
      c.after &&
      c.before === null &&
      (!c.after.label?.trim() ||
        (c.kind === "edge" && (!c.after.source || !c.after.target)))
    )
      throw new Error("新增对象的信息不完整。");
  }
  return page;
}

export function reviewCondition(pages, item) {
  let page;
  try {
    page = validateReview(pages, item);
  } catch (error) {
    return { state: "invalid", message: error.message };
  }
  const matches = (side) =>
    item.changes.every((c) => {
      const current = find(page, c);
      return c[side] === null
        ? !current
        : Boolean(current) && equal(pick(current, c.keys), c[side]);
    });
  if (matches("after"))
    return {
      state: "already",
      message: "当前正式内容已完整实现这项建议，无需重复处理。",
    };
  if (!matches("before"))
    return {
      state: "conflict",
      message: "本项涉及的正式内容已变化，请核对最新差异后重新确认。",
    };
  try {
    applyChanges(page, item.changes);
  } catch (error) {
    return { state: "invalid", message: error.message };
  }
  return { state: "ready" };
}

function applyChanges(page, changes) {
  const next = structuredClone(page);
  next.userEdited = true;
  // Build and validate the complete result before exposing any of it to the UI/store.
  for (const c of changes) {
    const key = listKey(c.kind),
      previous = next[key].find((value) => value.id === c.id);
    next[key] = next[key].filter((value) => value.id !== c.id);
    if (c.after) {
      const value = { ...(previous || {}), id: c.id, ...c.after };
      for (const field of c.keys)
        if (value[field] === null) delete value[field];
      if (c.kind === "node" && !previous) {
        const related = changes.find(
          (edge) =>
            edge.kind === "edge" &&
            edge.after &&
            [edge.after.source, edge.after.target].includes(c.id),
        );
        const neighbor = next.nodes.find((node) =>
          [related?.after?.source, related?.after?.target].includes(node.id),
        );
        let x = (neighbor?.x || 70) + 240,
          y = neighbor?.y || 70;
        while (
          next.nodes.some(
            (node) => Math.abs(node.x - x) < 200 && Math.abs(node.y - y) < 100,
          )
        )
          y += 120;
        Object.assign(value, { x, y, width: 180 });
      }
      next[key].push(value);
    }
  }
  const nodes = new Map(next.nodes.map((node) => [node.id, node]));
  const edgeKeys = new Set();
  for (const edge of next.edges) {
    const key = JSON.stringify([edge.source, edge.target, edge.label]);
    if (
      !nodes.has(edge.source) ||
      !nodes.has(edge.target) ||
      edge.source === edge.target ||
      edgeKeys.has(key)
    )
      throw new Error("关系端点不存在、自连或重复，请修改建议后重试。");
    edgeKeys.add(key);
  }
  for (const node of next.nodes) {
    const seen = new Set([node.id]);
    let parent = node.parentId;
    while (parent) {
      if (!nodes.has(parent) || seen.has(parent))
        throw new Error("层级存在循环或上级不存在，请重新核对。");
      seen.add(parent);
      parent = nodes.get(parent).parentId;
    }
  }
  for (const c of changes.filter(
    (c) => c.kind === "node" && c.after && c.keys.includes("parentId"),
  )) {
    const parent = nodes.get(c.id)?.parentId;
    if (
      parent &&
      !next.edges.some((edge) => edge.source === parent && edge.target === c.id)
    )
      throw new Error("上级节点与建议连线不一致，请修改完整关系后重试。");
  }
  return next;
}

export function resolveReview(pages, items, id, action) {
  const item = items.find((item) => item.id === id);
  if (!item || item.state !== "pending")
    throw new Error("本项已处理或不存在，无需重复操作。");
  if (!["accept", "reject", "already"].includes(action))
    throw new Error("不支持的审核操作。");
  let nextPages = pages;
  if (action !== "reject") {
    const condition = reviewCondition(pages, item);
    if (
      action === "already"
        ? condition.state !== "already"
        : condition.state !== "ready"
    )
      throw new Error(condition.message || "本项状态已变化，请重新核对。");
    if (action === "accept")
      nextPages = pages.map((page) =>
        page.id === item.pageId ? applyChanges(page, item.changes) : page,
      );
  }
  const state = { accept: "accepted", reject: "rejected", already: "already" }[
    action
  ];
  const nextItems = items.map((row) =>
    row.id === id
      ? {
          ...row,
          state,
          processedAt: new Date().toISOString(),
          result:
            action === "reject"
              ? "保留正式图页原内容。"
              : action === "already"
                ? "正式内容已实现，不重复写入。"
                : "仅应用本项完整变化；未修改其他资产及原有节点位置。",
        }
      : row,
  );
  return { pages: nextPages, items: nextItems };
}

export function rebaseReview(pages, item) {
  const page = validateReview(pages, item);
  const changes = item.changes.map((c) => {
    const current = find(page, c);
    if ((c.before === null && current) || (c.before !== null && !current))
      throw new Error("对象已新增或移除，请重新生成建议；不能直接沿用旧操作。");
    return { ...c, before: c.before === null ? null : pick(current, c.keys) };
  });
  const next = { ...item, changes };
  if (reviewCondition(pages, next).state === "invalid")
    throw new Error(reviewCondition(pages, next).message);
  return next;
}

export function editReview(item, values) {
  let changes = item.changes.map((c) =>
    c.after && c.keys.includes(values.field) && c.id === values.id
      ? { ...c, after: { ...c.after, [values.field]: values.value } }
      : c,
  );
  if (values.field === "parentId")
    changes = changes.map((c) =>
      c.kind === "edge" && !c.before && c.after?.target === values.id
        ? { ...c, after: { ...c.after, source: values.value } }
        : c,
    );
  const editedEdge = changes.find(
    (c) => c.kind === "edge" && c.id === values.id && !c.before,
  );
  if (values.field === "source" && editedEdge)
    changes = changes.map((c) =>
      c.kind === "node" &&
      c.id === editedEdge.after.target &&
      c.keys.includes("parentId")
        ? { ...c, after: { ...c.after, parentId: values.value } }
        : c,
    );
  return { ...item, changes };
}

export function reviewRows(pages, item) {
  const page = pages.find((page) => page.id === item.pageId);
  const labels = {
    label: "名称",
    subtitle: "副标题",
    summary: "本图备注",
    parentId: "上级节点",
    status: "核实状态",
    marker: "状态说明",
    evidence: "证据",
    assetPath: "关联资产",
  };
  const readable = (key, value) =>
    value == null
      ? "未填写"
      : key === "parentId"
        ? page?.nodes.find((node) => node.id === value)?.label || "上级不存在"
        : key === "status"
          ? { normal: "正常", review: "待核实", updated: "已更新" }[value] ||
            value
          : Array.isArray(value)
            ? value.join("；") || "未提供"
            : String(value);
  return item.changes.flatMap((c) => {
    const current =
        item.state !== "pending"
          ? c.before
            ? { ...find(page, c), ...c.before }
            : undefined
          : find(page, c),
      action = changeAction(c);
    const name = current?.label || c.after?.label || c.before?.label || c.id;
    if (action !== "update")
      return [
        {
          change: c,
          label: name,
          field: c.kind === "node" ? "节点" : "关系",
          current: current
            ? c.kind === "edge"
              ? `${page.nodes.find((n) => n.id === current.source)?.label || "节点"} → ${page.nodes.find((n) => n.id === current.target)?.label || "节点"} · ${current.label}`
              : current.label
            : "不存在",
          proposed:
            action === "remove"
              ? "从本图移除，原始资产保留"
              : c.kind === "edge"
                ? `${page?.nodes.find((n) => n.id === c.after.source)?.label || item.changes.find((x) => x.id === c.after.source)?.after?.label || "新节点"} → ${page?.nodes.find((n) => n.id === c.after.target)?.label || "节点"} · ${c.after.label}`
                : c.after.label,
        },
      ];
    return c.keys
      .filter((key) => !equal(c.before[key], c.after[key]))
      .map((key) => ({
        change: c,
        key,
        label: name,
        field: labels[key] || key,
        current: readable(key, current?.[key]),
        proposed: readable(key, c.after[key]),
      }));
  });
}

export function projectReview(pages, item, expanded = false, positions = {}) {
  const page = pages.find((page) => page.id === item.pageId);
  if (!page) return { id: item.id, nodes: [], edges: [] };
  const nodes = new Map(
    page.nodes
      .filter((node) => !node.hidden)
      .map((node) => [node.id, { ...node }]),
  );
  const edges = new Map(
    page.edges
      .filter((edge) => !edge.hidden)
      .map((edge) => [edge.id, { ...edge }]),
  );
  const affected = new Set([item.nodeId]);
  for (const c of item.changes) {
    const map = c.kind === "node" ? nodes : edges,
      previous = map.get(c.id),
      delta = changeAction(c);
    const after = c.after ? clean(c.after) : {};
    if (c.kind === "edge" && delta === "update" && previous)
      edges.set(`${c.id}:before`, {
        ...previous,
        id: `${c.id}:before`,
        reviewDelta: "remove",
      });
    const value = {
      ...(previous || {
        kind: c.kind === "node" ? "note" : "local",
        status: "normal",
        x: 70,
        y: 70,
        width: 180,
      }),
      ...after,
      id: c.id,
      reviewDelta: delta,
    };
    if (c.kind === "node") {
      affected.add(c.id);
      if (value.parentId) affected.add(value.parentId);
      if (c.before?.parentId) affected.add(c.before.parentId);
    } else {
      affected.add(value.source);
      affected.add(value.target);
    }
    map.set(c.id, value);
  }
  // Include the changed objects and their direct explanatory context, not the whole page.
  const context = new Set(affected);
  for (const edge of edges.values())
    if (affected.has(edge.source) || affected.has(edge.target)) {
      context.add(edge.source);
      context.add(edge.target);
    }
  const shown = [...nodes.values()].filter(
    (node) => expanded || context.has(node.id),
  );
  const visible = new Set(shown.map((node) => node.id));
  shown.forEach((node, i) => {
    if (!page.nodes.some((original) => original.id === node.id))
      Object.assign(node, {
        x: 70 + (i % 3) * 250,
        y: 80 + Math.floor(i / 3) * 160,
      });
    if (positions[node.id])
      Object.assign(node, { x: positions[node.id].x, y: positions[node.id].y });
  });
  return {
    ...page,
    nodes: shown,
    edges: [...edges.values()].filter(
      (edge) => visible.has(edge.source) && visible.has(edge.target),
    ),
  };
}
