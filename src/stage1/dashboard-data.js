import {
  identityReviewPlan,
  planSteps,
  signals,
  workItems,
} from "../stage2/data";
import { businessScenarios } from "../stage3/data";
import {
  candidates,
  companies,
  contacts,
  opportunities,
  papers,
  patents,
  positions,
} from "../stage4/data";
import { topicGraphs } from "../stage4/topic-graph-data";

export const dashboardItemLimit = 10;
export const limitDashboardItems = (items) =>
  items.slice(0, dashboardItemLimit);

const taskAttentionStates = {
  action: { label: "待你处理", tone: "warning", rank: 0 },
  acceptance: { label: "待你验收", tone: "info", rank: 1 },
  running: { label: "正在推进", tone: "info", rank: 2 },
  external: { label: "等待外部", tone: "neutral", rank: 3 },
};

export function getDashboardTaskState(task) {
  return Object.hasOwn(taskAttentionStates, task.attention)
    ? taskAttentionStates[task.attention]
    : {
        label: task.status || "状态待同步",
        tone: task.tone || "neutral",
        rank: 4,
      };
}

export function orderDashboardTasks(items) {
  return [...items].sort(
    (left, right) =>
      getDashboardTaskState(left).rank - getDashboardTaskState(right).rank,
  );
}

export function summarizeDashboardPlan(steps = [], completedStepIds = []) {
  const completedIds = new Set(completedStepIds);
  const completed = steps.filter((step) => completedIds.has(step.id)).length;
  const current = steps.find((step) => !completedIds.has(step.id));
  return {
    completed,
    total: steps.length,
    label: steps.length
      ? `已完成 ${completed} / ${steps.length} 步`
      : "计划待生成",
    detail: current
      ? `当前：${current.title}`
      : steps.length
        ? "计划步骤已全部完成"
        : "等待生成执行计划",
  };
}

const taskPlanSnapshots = {
  "position-vla": {
    attention: "acceptance",
    steps: planSteps,
    completedStepIds: ["scope", "recall", "enrich", "review"],
    icon: "briefcase",
  },
  "client-xinglan": {
    attention: "action",
    steps: businessScenarios["client-xinglan"].plan,
    completedStepIds: ["verify"],
    icon: "building",
  },
  "mapping-embodied": {
    attention: "running",
    steps: businessScenarios["mapping-embodied"].plan,
    completedStepIds: ["scope", "ecosystem", "people"],
    icon: "database",
  },
  "career-linhao": {
    attention: "external",
    steps: businessScenarios["career-linhao"].plan,
    completedStepIds: ["signal", "match", "review"],
    icon: "user",
  },
  "task-hand-team": {
    attention: "action",
    steps: identityReviewPlan,
    completedStepIds: ["collect", "compare"],
    icon: "user",
  },
};

export const dashboardTasks = Object.entries(taskPlanSnapshots).map(
  ([id, snapshot]) => ({
    ...workItems.find((item) => item.id === id),
    attention: snapshot.attention,
    progress: {
      ...summarizeDashboardPlan(snapshot.steps, snapshot.completedStepIds),
      icon: snapshot.icon,
    },
    route: `/tasks/${id}`,
  }),
);

export const dashboardInsights = [
  "signal-verifying",
  "signal-graph-sync",
  "signal-cloudchip",
  "signal-tuoji",
  "signal-chensong",
  "signal-xinglan",
  "signal-ignored",
  "signal-expired",
].map((id) => {
  const signal = signals.find((item) => item.id === id);
  return {
    ...signal,
    detail: signal.nextLabel,
    route: `/signals?signal=${id}`,
  };
});

export const dashboardAssetChanges = [
  {
    id: "change-linhao",
    type: "候选人",
    icon: "user",
    title: candidates.find((item) => item.id === "candidate-linhao").name,
    detail: "资料更新至 v6，新增真机项目与团队规模",
    time: "18 分钟前",
    route: "/candidates/candidate-linhao?tab=profile",
  },
  {
    id: "change-vla",
    type: "岗位",
    icon: "briefcase",
    title: positions.find((item) => item.id === "position-vla").name,
    detail: "补充找人建议，新增 3 家建议挖猎公司",
    time: "今天 08:52",
    route: "/positions/position-vla?tab=profile",
  },
  {
    id: "change-xinglan",
    type: "公司",
    icon: "building",
    title: companies.find((item) => item.id === "company-xinglan").name,
    detail: "补充团队规模与近期招聘方向",
    time: "今天 08:36",
    route: "/companies/company-xinglan",
  },
  {
    id: "change-chenyu",
    type: "公司联系人",
    icon: "user",
    title: `${contacts.find((item) => item.id === "contact-chenyu").name} · 星澜机器人`,
    detail: "更新职务和联系方式核验记录",
    time: "今天 08:20",
    route: "/companies/company-xinglan/contacts/contact-chenyu",
  },
  {
    id: "change-opportunity",
    type: "招聘机会",
    icon: "sparkles",
    title: opportunities.find((item) => item.id === "opportunity-xinglan")
      .title,
    detail: "补充需求线索与来源证据",
    time: "昨天 20:14",
    route: "/opportunities/opportunity-xinglan",
  },
  {
    id: "change-graph",
    type: "知识图谱",
    icon: "database",
    title: topicGraphs.find((item) => item.id === "mapping-embodied").name,
    detail: "更新 2 条关系，另有 1 条关系待确认",
    time: "昨天 19:06",
    route: "/mappings/mapping-embodied?tab=reviews",
  },
  {
    id: "change-zhaoxingyu",
    type: "候选人",
    icon: "user",
    title: candidates.find((item) => item.id === "candidate-zhaoxingyu").name,
    detail: "补充项目经历与研究方向",
    time: "昨天 18:42",
    route: "/candidates/candidate-zhaoxingyu?tab=profile",
  },
  {
    id: "change-paper",
    type: "论文",
    icon: "paper",
    title: papers.find((item) => item.id === "paper-vla-survey").title,
    detail: "补充作者署名机构与原文来源",
    time: "昨天 17:25",
    route: "/papers/paper-vla-survey",
  },
  {
    id: "change-patent",
    type: "专利",
    icon: "patent",
    title: patents.find((item) => item.id === "patent-manipulation").title,
    detail: "补充发明人资料与专利原文",
    time: "昨天 16:18",
    route: "/patents/patent-manipulation",
  },
  {
    id: "change-platform",
    type: "岗位",
    icon: "briefcase",
    title: positions.find((item) => item.id === "position-platform").name,
    detail: "更新岗位职责与人才要求",
    time: "昨天 15:40",
    route: "/positions/position-platform?tab=profile",
  },
];

export function getDashboardData(params) {
  const empty = new Set((params.get("empty") || "").split(","));
  const allEmpty = params.get("state") === "empty";
  const visible = (key, items) =>
    allEmpty || empty.has(key) ? [] : limitDashboardItems(items);
  return {
    tasks: visible("tasks", orderDashboardTasks(dashboardTasks)),
    insights: visible("insights", dashboardInsights),
    assets: visible("assets", dashboardAssetChanges),
  };
}
