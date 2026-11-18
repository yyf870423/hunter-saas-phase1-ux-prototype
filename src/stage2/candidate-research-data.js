import { candidates } from "./data.js";

// Synthetic task-local references, not production candidate IDs or verified facts.
export const researchPeople = candidates.map((person, index) => ({
  ...person,
  ...(index === candidates.length - 1
    ? { name: "林昊", company: "前沿智能研究院", role: "多模态研究员", city: "北京" }
    : {}),
  direction: ["机器人学习", "多模态策略", "VLA 与模型训练", "灵巧操作"][index % 4],
  evidence: index % 3 === 0 ? "有相关研究记录" : index % 3 === 1 ? "需补充个人贡献" : "任职信息待核实",
  findings: [
    { title: "模型训练经历", status: index % 3 === 0 ? "有相关线索" : "尚未证实", detail: index % 3 === 0 ? "示例项目记录提到参与模型训练，但不足以单独证明负责大规模预训练。" : "示例材料没有明确区分预训练、后训练与下游微调，不能据此判断没有相关经验。" },
    { title: "个人贡献", status: "待核实", detail: "团队成果不直接等于个人贡献，需要补充职责范围、作者署名和项目任职时间。" },
    { title: "证据边界", status: "演示资料", detail: "人物、经历与来源均为原型样例；本次没有调用搜索或核实真实人物。" },
  ],
}));

export const initialResearchResult = {
  id: "research-result-1", version: 1, kind: "list", title: "首批候选人", scope: "本轮18位人选",
  ids: [...researchPeople].sort((a, b) => b.score - a.score).map(person => person.id),
  requirement: "具身智能 VLA 算法负责人 · 先找人，不联系", failedIds: [],
};

export const personById = id => researchPeople.find(person => person.id === id);
export const personLabel = id => {
  const person = personById(id);
  return person ? `${person.name}（${person.company}）` : "未找到人选";
};

export const researchPlanSteps = [
  { id: "scope", title: "确认岗位边界与找人范围", detail: "本轮 VLA 岗位要求与不联系边界已明确。", status: "done" },
  { id: "recall", title: "并行检索并接收补充资料", detail: "展示本轮既有18位演示人选，不代表执行了真实检索。", status: "done" },
  { id: "enrich", title: "持续合并并执行匹配门禁", detail: "展示示例初筛分、理由和证据缺口，不虚构核实结论。", status: "done" },
  { id: "review", title: "交付候选人结果", detail: "名单可直接查看，后续要求在原对话提出。", status: "done" },
  { id: "followup", title: "按要求进一步调研", detail: "等待你说明人选、范围及需要核实的内容。", status: "waiting-user" },
];

export const researchProcesses = [
  { id: "demo-recall", stepId: "recall", title: "汇总本轮候选人线索", action: "18位虚构人选的初始结果已展示。", resultDestination: "本任务 · 首批候选人 v1" },
  { id: "demo-match", stepId: "enrich", title: "整理匹配依据与资料缺口", action: "分数来自既有演示资料；未核实的经历仍为未知。", resultDestination: "本任务 · 初筛分、理由与风险" },
  { id: "demo-delivery", stepId: "review", title: "交付可查看的候选人名单", action: "不需要勾选或提交，可直接提出下一步要求。", resultDestination: "本任务 · 候选人结果视图" },
].map(item => ({ ...item, kind: "task", status: "完成", tone: "success", duration: "示例", checkpoints: [
  { title: "示例资料已整理", detail: "仅使用本地虚构数据，没有读取真实人物资料。", done: true },
  { title: "结果可查看", detail: "本次没有写入正式资产或对外联系。", done: true },
] }));
