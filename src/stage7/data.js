export const moodboards = {
  orchestration: {
    id: "orchestration",
    index: "A",
    name: "AI 招聘编排中枢",
    shortName: "编排中枢",
    tagline: "让每一个招聘目标，都成为持续推进的工作。",
    description:
      "从一句话开始，Hunter 规划任务、搜集公开证据、形成候选结果，并在关键节点等待你确认。",
    tone: "深色、精确、可监督",
    sceneLabel: "正在编排：具身智能 VLA 算法负责人",
    metrics: ["6 个 Agent 协作", "42 条证据已核验", "18 位候选人待审核"],
  },
  graph: {
    id: "graph",
    index: "B",
    name: "人才智能图谱",
    shortName: "智能图谱",
    tagline: "从零散线索，看见完整的人才关系。",
    description:
      "Hunter 将公司、岗位、候选人、论文和专利连接起来，让每次调研都沉淀为可复用的业务资产。",
    tone: "明亮、探索、关系驱动",
    sceneLabel: "上海具身智能人才网络",
    metrics: ["27 家目标公司", "186 位关键人才", "64 条关系已核验"],
  },
  observatory: {
    id: "observatory",
    index: "C",
    name: "AI 人才观测站",
    shortName: "人才观测站",
    tagline: "机会出现时，不再等你偶然发现。",
    description:
      "Hunter 持续整理公开招聘与人才变化信号，分清优先级，并把值得行动的机会交给你。",
    tone: "深色、主动、持续运行",
    sceneLabel: "人才市场信号 · 最近 24 小时",
    metrics: ["12 条高价值信号", "3 个招聘机会", "5 项建议行动"],
  },
};

export const processSteps = [
  {
    id: "intent",
    label: "理解目标",
    eyebrow: "01 / 招聘目标",
    title: "把猎头的自然语言，转换为可执行计划",
    body: "你只需要说明客户、岗位、方向和已经掌握的信息。Hunter 会识别缺口、提出必要问题，并给出持续更新的执行计划。",
    detail: "目标：星澜机器人 · VLA 算法负责人 · 上海/北京",
  },
  {
    id: "research",
    label: "探索证据",
    eyebrow: "02 / Agent 执行",
    title: "在公开网络和业务资产中并行探索",
    body: "Agent 调研公司、岗位和人才线索，交叉核验论文、专利与公开资料。每条结论保留来源，不让未经确认的信息直接成为正式数据。",
    detail: "已核验 42 条公开证据，排除 11 条同名与过期线索",
  },
  {
    id: "review",
    label: "人工审核",
    eyebrow: "03 / 决策门禁",
    title: "把需要判断的内容，集中交给人",
    body: "候选人匹配、关系冲突和外部联系等关键动作会停下来等待确认。你可以直接选择，也可以用自然语言补充规则。",
    detail: "18 位候选人待审核，其中 7 位建议优先联系",
  },
  {
    id: "asset",
    label: "沉淀成果",
    eyebrow: "04 / 业务资产",
    title: "确认后的成果继续服务下一次工作",
    body: "公司、岗位、候选人和人才版图不再是一次性结果。后续任务可以复用已有证据、关系和判断，减少重复调研。",
    detail: "已更新岗位、候选人池和具身智能人才版图",
  },
];

export const referenceProducts = [
  "WorkBuddy",
  "Vercel AI",
  "Google DeepMind",
  "Stripe",
  "Metaview",
  "Juicebox",
];
