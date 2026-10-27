// Pending asset updates found by tasks (design review topic 14).
// Rule: a change to an asset's data goes into that asset's own review, never only into the insight center.
// Each item states field, before → after, source and the task round that found it; the hunter accepts or
// rejects it item by item (or “全部采纳” per asset). Items never expire; rejected items are not raised again
// until the evidence changes. When a finding is also an insight, both records link to each other and a
// confirmation in either place shows in the other.
//
// Example: the periodic task “每两周核验收藏夹‘重点候选人’的公开变化” finds that 陈松 joined 星澜机器人.
//   → 陈松's pending review gets “当前公司：小鹏汽车 → 星澜机器人”;
//   → the insight “陈松加入星澜机器人” (he is in the VLA pipeline) links to that item.

export const pendingUpdatesKey = "hunter-pending-updates";
export const pendingUpdatesEvent = "hunter-pending-updates";

const candidateRun = {
  label: "每两周核验收藏夹“重点候选人”的公开变化 · 8 月 28 日那一轮",
  runId: "run-candidate-partial",
  route: "/tasks/periodic?view=runs&run=run-candidate-partial",
};

export const pendingUpdateGroups = [
  {
    assetType: "candidates",
    assetId: "candidate-linhao",
    assetName: "林昊",
    assetRoute: "/candidates/candidate-linhao",
    foundBy: { label: "用户上传的新简历", route: "/candidates/candidate-linhao?tab=files" },
    items: [
      {
        id: "work",
        field: "工作经历",
        before: "拓界机器人 · 机器人学习负责人；负责操作策略平台和真机部署。",
        after:
          "拓界机器人 · 机器人学习负责人；管理 14 人团队，负责 VLA、多任务操作策略、真机数据闭环和跨团队交付。",
        source: "新简历第 1-2 页",
        evidence:
          "工作经历段落明确补充团队规模、汇报对象、职责范围和 2025 年交付成果。",
      },
      {
        id: "education",
        field: "教育经历",
        before: "浙江大学 · 自动化 · 本科",
        after: "上海交通大学 · 控制科学与工程 · 硕士（2010-2013）",
        source: "新简历第 3 页",
        evidence: "教育经历区块提供学校、专业、学历和起止时间。",
      },
      {
        id: "paper",
        field: "论文成果",
        before: "已关联 1 篇论文",
        after: "新增 2 篇 VLA 与机器人操作论文，其中 1 篇为第一作者",
        source: "新简历第 5 页、OpenAlex",
        evidence:
          "标题、作者顺序和机构一致；作者身份已通过工作经历和公开主页交叉核实。",
      },
      {
        id: "patent",
        field: "专利成果",
        before: "未记录",
        after: "机器人训练数据的自动筛选与回流系统 · 第一发明人",
        source: "新简历第 6 页、国家知识产权公开信息",
        evidence: "专利标题、申请人、发明人顺序和申请号均可核验。",
      },
      {
        id: "skill",
        field: "关键技能",
        before: "VLA、强化学习、真机部署",
        after: "VLA、强化学习、真机部署、数据闭环",
        source: "项目作品集第 6 页",
        evidence:
          "项目说明写明持续使用离线数据回流、困难样本筛选和真机评测闭环。",
      },
      {
        id: "team",
        field: "团队规模",
        before: "未记录",
        after: "14 人",
        source: "新简历工作经历",
        evidence: "拓界机器人经历中写明直接管理 14 人算法团队。",
      },
      {
        id: "location",
        field: "意向地点",
        before: "上海",
        after: "上海、北京",
        source: "邮件回复",
        evidence: "候选人回复：上海优先，核心团队在北京时可以进一步沟通。",
        defaultRejected: true,
      },
    ],
  },
  {
    assetType: "candidates",
    assetId: "candidate-chensong",
    assetName: "陈松",
    assetRoute: "/candidates/candidate-chensong",
    foundBy: candidateRun,
    insightId: "signal-chensong",
    items: [
      {
        id: "company",
        field: "当前公司",
        before: "小鹏汽车",
        after: "星澜机器人",
        source: "公开主页、星澜机器人官网团队页",
        evidence: "公开主页 8 月更新为星澜机器人；官网团队页列出陈松，职位为自动驾驶技术经理。",
      },
      {
        id: "title",
        field: "当前职位",
        before: "自动驾驶感知算法专家",
        after: "自动驾驶技术经理",
        source: "星澜机器人官网团队页",
        evidence: "团队页职位与公开主页一致。",
      },
    ],
  },
  {
    assetType: "candidates",
    assetId: "candidate-zhaoxingyu",
    assetName: "赵星羽",
    assetRoute: "/candidates/candidate-zhaoxingyu",
    foundBy: candidateRun,
    items: [
      {
        id: "paper",
        field: "论文成果",
        before: "已关联 3 篇论文",
        after: "新增 1 篇：Scaling Vision-Language-Action Policies for Dexterous Manipulation（2026-08，第一作者）",
        source: "arXiv",
        evidence: "作者单位为星澜机器人，作者顺序与候选人既有论文一致。",
      },
    ],
  },
  {
    assetType: "companies",
    assetId: "company-xinglan",
    assetName: "星澜机器人",
    assetRoute: "/companies/company-xinglan",
    foundBy: {
      label: "每周发现具身智能创业公司与招聘机会 · 今天 09:00 那一轮",
      runId: "run-startups-success",
      route: "/tasks/periodic?view=runs&run=run-startups-success",
    },
    items: [
      {
        id: "funding",
        field: "融资阶段",
        before: "A 轮",
        after: "A+ 轮（2026 年 8 月，3 亿元）",
        source: "融资新闻稿",
        evidence: "新闻稿写明 A+ 轮金额和领投方，公司官网新闻页同步发布。",
      },
      {
        id: "size",
        field: "员工规模",
        before: "150 人左右",
        after: "220 人左右",
        source: "招聘页、职业社交平台公司页",
        evidence: "公司页员工数 8 月由 160 增至 214，招聘页在招 9 个研发岗位。",
      },
    ],
  },
];

// Graph relation changes found by the monthly graph update stay in the graph's “更新与审核” (no insight).
export const graphPendingUpdates = [
  {
    assetType: "graphs",
    assetId: "mapping-company-relations",
    assetName: "具身智能公司关系知识图谱",
    assetRoute: "/mappings/mapping-company-relations?tab=reviews",
    foundBy: {
      label: "每月更新机器人行业知识图谱 · 9 月 1 日那一轮",
      runId: "run-graph-sept",
      route: "/tasks/periodic?view=runs&run=run-graph-sept",
    },
    count: 1,
    summary: "人才流动：陈松从小鹏汽车加入星澜机器人",
  },
];

const read = () => {
  try {
    return JSON.parse(sessionStorage.getItem(pendingUpdatesKey) || "{}") || {};
  } catch {
    return {};
  }
};

// Status of one item: "pending" | "accepted" | "rejected".
export function updateStatus(assetId, itemId) {
  return read()[`${assetId}:${itemId}`] || "pending";
}

export function resolveUpdates(assetId, decisions) {
  const all = read();
  Object.entries(decisions).forEach(([itemId, status]) => {
    all[`${assetId}:${itemId}`] = status;
  });
  try {
    sessionStorage.setItem(pendingUpdatesKey, JSON.stringify(all));
    window.dispatchEvent(new Event(pendingUpdatesEvent));
    return true;
  } catch {
    return false;
  }
}

export function pendingGroup(assetId) {
  const group = pendingUpdateGroups.find((item) => item.assetId === assetId);
  if (!group) return null;
  const items = group.items.map((item) => ({ ...item, status: updateStatus(assetId, item.id) }));
  return { ...group, items, open: items.filter((item) => item.status === "pending") };
}

export function openCount(assetId) {
  return pendingGroup(assetId)?.open.length || 0;
}

export function pendingAssetIds(assetType) {
  return pendingUpdateGroups
    .filter((group) => group.assetType === assetType && openCount(group.assetId))
    .map((group) => group.assetId);
}

// Summary for the workbench asset area, e.g. “候选人 3 · 公司 1 · 知识图谱 1”.
export function pendingSummary() {
  const byType = [
    ["candidates", "候选人", "/candidates?pending=1"],
    ["companies", "公司", "/companies?pending=1"],
  ].map(([type, label, route]) => ({ type, label, route, count: pendingAssetIds(type).length }));
  const graphs = { type: "graphs", label: "知识图谱", route: graphPendingUpdates[0]?.assetRoute, count: graphPendingUpdates.length };
  return [...byType, graphs].filter((item) => item.count);
}

// Updates reported by one periodic round, for the round's “本轮发现” list.
export function roundUpdates(runId) {
  const groups = pendingUpdateGroups
    .filter((group) => group.foundBy?.runId === runId)
    .map((group) => pendingGroup(group.assetId));
  const graphs = graphPendingUpdates.filter((group) => group.foundBy.runId === runId);
  return [
    ...groups.map((group) => ({
      id: group.assetId,
      title: `${group.assetName}：${group.items.map((item) => `${item.field} ${item.before} → ${item.after}`).join("；")}`,
      status: group.open.length ? `${group.open.length} 项待审核` : "已审核",
      route: `/reviews/fields/${group.assetId}`,
    })),
    ...graphs.map((group) => ({
      id: group.assetId,
      title: `${group.assetName}：${group.summary}`,
      status: `${group.count} 项待审核`,
      route: group.assetRoute,
    })),
  ];
}
