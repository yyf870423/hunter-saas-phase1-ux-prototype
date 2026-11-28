const operations = {
  input: [
    "读取内容 · 本轮要求与当前任务资料",
    "调用资料整理工具 · 核对来源、结果与待确认项",
  ],
  company: [
    "检索公开资料 · 公司官网与招聘页面",
    "读取来源内容 · 核对公司身份、招聘变化与发布时间",
  ],
  companyFollowup: [
    "读取内容 · 当前公司资料与补充要求",
    "调用资料核验工具 · 对照招聘信号与待确认事项",
  ],
  contacts: [
    "检索公开资料 · 招聘负责人及联系路径",
    "读取人物来源 · 核对任职与公开联系方式",
  ],
  scope: [
    "读取内容 · 岗位 JD、硬要求与可放宽条件",
    "调用需求解析工具 · 核对找人范围与本轮边界",
  ],
  recall: [
    "检索人选 · 候选人库、知识图谱与论文专利",
    "检索公开资料 · 项目记录、公开履历与关联来源",
  ],
  enrich: [
    "读取内容 · 人选资料、简历与原始来源",
    "调用人选匹配工具 · 核对身份、岗位要求与证据缺口",
  ],
  research: [
    "读取内容 · 本轮指定人选与核实要求",
    "调用资料核验工具 · 对照研究经历与个人贡献",
  ],
  researchSources: [
    "检索公开资料 · 人选的论文、项目与公开履历",
    "读取来源内容 · 核对研究经历与个人贡献",
  ],
  mapping: [
    "检索公开资料 · 目标公司的部门、团队与关键岗位",
    "读取来源内容 · 核对组织归属、任职人与观察时间",
  ],
  relations: [
    "读取内容 · 组织资料与人物任职证据",
    "调用关系整理工具 · 核对上下级关系与未知位置",
  ],
  career: [
    "读取内容 · 候选人档案、动向信号与跟进记录",
    "检索系统内岗位 · 核对正在招聘的岗位与匹配依据",
  ],
  identity: [
    "读取内容 · 人物档案与任职来源",
    "调用身份核验工具 · 比对姓名、机构与任职时间",
  ],
  summary: [
    "读取内容 · 本轮反馈与补充要求",
    "调用摘要整理工具 · 提取明确事项与待确认项",
  ],
  periodic: [
    "读取内容 · 本轮运行记录与连续上下文",
    "调用增量核对工具 · 比较已有结果与本轮变化",
  ],
};

// These labels describe local demonstration operations, not live API calls.
export function taskOperationLabels(pathname, stepId) {
  if (pathname.includes("client-"))
    return stepId === "verify" ? operations.company
      : stepId === "contacts" ? operations.contacts : operations.companyFollowup;
  if (pathname.includes("mapping-"))
    return stepId === "people" ? operations.relations : operations.mapping;
  if (pathname.includes("career-")) return operations.career;
  if (pathname.includes("task-hand-")) return operations.identity;
  if (pathname.includes("summary")) return operations.summary;
  if (pathname.includes("periodic")) return operations.periodic;
  if (pathname.includes("candidate-research"))
    return stepId === "followup" ? operations.researchSources : operations.research;
  if (pathname.includes("position-"))
    return stepId === "scope" ? operations.scope
      : stepId === "recall" ? operations.recall : operations.enrich;
  return operations.input;
}
