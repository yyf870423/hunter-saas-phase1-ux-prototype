// Credits usage (pricing doc 2026-09-28): one balance is shown; plan Credits refresh monthly and are used
// before purchased Credits. Numbers are examples.
export const agentUsage = {
  usedPercent: 64, // share of this month's plan Credits already used
  planCredits: 25000,
  planUsed: 16000,
  purchasedLeft: 3000,
  balance: 12000, // 25,000 − 16,000 + 3,000
  refreshOn: "2026-09-01",
  expiresOn: "2026-08-31",
  storageUsedGb: 8.2,
  storageLimitGb: 30,
};

export const navSections = [
  {
    label: "核心业务",
    items: [
      { id: "home", label: "工作台", icon: "dashboard", route: "/home" },
      { id: "tasks", label: "任务", icon: "task", count: 2 },
      { id: "signals", label: "洞察中心", icon: "signal", count: 3 },
    ],
  },
  {
    label: "招聘资产",
    items: [
      { id: "companies", label: "公司", icon: "building" },
      { id: "opportunities", label: "招聘机会", icon: "target" },
      { id: "positions", label: "岗位", icon: "briefcase" },
    ],
  },
  {
    label: "人才资产",
    items: [
      { id: "candidates", label: "候选人", icon: "user" },
      { id: "mappings", label: "知识图谱", icon: "graph" },
    ],
  },
  {
    label: "研究资产",
    items: [
      { id: "papers", label: "论文", icon: "paper" },
      { id: "patents", label: "专利", icon: "patent" },
    ],
  },
];

export const mainlines = [
  {
    id: "client-xinglan",
    type: "客户开发",
    icon: "building",
    title: "星澜机器人招聘合作",
    object: "星澜机器人",
    status: "等待用户",
    tone: "warning",
    changed: "12 分钟前",
    summary:
      "已核验公开招聘与团队扩张线索，等待确认是否记录潜在招聘机会。",
    facts: [
      ["招聘信号", "公开岗位与团队扩张"],
      ["待确认", "招聘计划、联系人与完整 JD"],
      ["当前等待", "是否记录潜在机会"],
    ],
    next: "先确认是否记录潜在机会，再继续核实联系人；对外联系单独授权。",
  },
  {
    id: "position-vla",
    type: "岗位招聘",
    icon: "briefcase",
    title: "具身智能 VLA 算法负责人",
    object: "星澜机器人 · 北京",
    status: "推进中",
    tone: "info",
    changed: "4 分钟前",
    summary:
      "系统候选人、知识图谱、公开资料和用户上传简历持续汇入，当前新增 18 位待审核候选人。",
    facts: [
      ["本批新增", "18 位"],
      ["资料更新", "4 位"],
      ["当前处理", "身份合并与审核"],
    ],
    next: "待首批资料补全后审核候选人，并决定进入联系名单的范围。",
  },
  {
    id: "mapping-embodied",
    type: "公司组织梳理",
    icon: "graph",
    title: "具身智能目标公司组织梳理",
    object: "星澜、拓界、穹顶、灵跃",
    status: "进行中",
    tone: "success",
    changed: "今天 08:40",
    summary: "已定位四家公司、七个关键岗位及五位任职人或线索，未知任职人和汇报关系继续核实。",
    facts: [
      ["公司", "4 家"],
      ["关键岗位", "7 个"],
      ["任职人或线索", "5 位"],
    ],
    next: "核对组织、关键岗位与任职人，保存人才地图并保留待核实项。",
  },
  {
    id: "career-linhao",
    type: "候选人求职",
    icon: "user",
    title: "林昊职业机会",
    object: "林昊 · 机器人算法负责人",
    status: "等待外部",
    tone: "neutral",
    changed: "昨天 18:26",
    summary: "已与系统内六个岗位完成匹配，等待猎头回填候选人的联系结果。",
    facts: [
      ["匹配岗位", "6 个"],
      ["推荐联系", "2 个岗位"],
      ["当前等待", "猎头联系结果"],
    ],
    next: "联系候选人后补充意愿和最新资料，Hunter 将局部重算匹配结果。",
  },
];

export const signals = [
  {
    id: "signal-mail-xinglan",
    kind: "洞察",
    type: "客户需求",
    title: "陈雨来信：星澜机器人想再加 2 个数据平台岗位",
    object: "星澜机器人 · 陈雨",
    status: "未处理",
    next: "来源：邮箱：读取 shenlan@qq.com 的邮件",
    tone: "warning",
    evidence: 1,
    time: "今天 09:31",
  },
  {
    id: "signal-cloudchip",
    kind: "信号",
    type: "公司变化",
    title: "云脉芯能正在组建机器人芯片团队",
    object: "云脉芯能",
    status: "未处理",
    next: "来源：每周发现具身智能创业公司与招聘机会",
    tone: "warning",
    evidence: 4,
    time: "今天 09:12",
  },
  {
    id: "signal-chensong",
    kind: "洞察",
    type: "候选人动向",
    title: "陈松加入星澜机器人，任自动驾驶技术经理",
    object: "陈松 · 自动驾驶技术经理",
    status: "未处理",
    next: "来源：每两周核验收藏夹“重点候选人”的公开变化",
    tone: "warning",
    evidence: 2,
    time: "昨天 17:20",
  },
];

export const actionItems = [
  {
    id: "action-contact",
    title: "确认是否记录星澜机器人潜在机会",
    source: "客户开发 · 星澜机器人招聘合作",
    meta: "发现依据已整理，招聘计划、联系人和 JD 待核实",
    tone: "warning",
  },
  {
    id: "action-candidates",
    title: "审核 VLA 岗位首批候选人",
    source: "岗位招聘 · 具身智能 VLA 算法负责人",
    meta: "18 位候选人等待业务判断",
    tone: "info",
  },
  {
    id: "action-reply",
    title: "记录林昊的联系结果",
    source: "候选人求职 · 林昊职业机会",
    meta: "昨天 18:26 开始等待猎头补充",
    tone: "neutral",
  },
  {
    id: "action-source-retry",
    title: "处理公开来源异常",
    source: "岗位招聘 · VLA 候选人寻访",
    meta: "已有结果已保留，1 个失败来源可以单独重试",
    tone: "danger",
  },
];

export const notifications = [
  {
    id: "notification-periodic-waiting",
    type: "周期运行待确认",
    title: "两位候选人的身份合并结论冲突",
    source: "每 3 天更新招聘中岗位的人岗匹配",
    route: "/tasks/periodic?view=runs&run=run-position-waiting",
    time: "3 分钟前",
    unread: true,
  },
  {
    id: "notification-1",
    type: "任务待确认",
    title: "星澜机器人潜在招聘机会待确认",
    source: "星澜机器人招聘合作",
    route: "/tasks/client-xinglan",
    time: "8 分钟前",
    unread: true,
  },
  {
    id: "notification-2",
    type: "任务更新",
    title: "赵星羽身份消歧需要处理",
    source: "VLA 候选人审核",
    route: "/tasks/position-vla?state=merge-conflict",
    time: "18 分钟前",
    unread: true,
  },
  {
    id: "notification-3",
    type: "信号",
    title: "云脉芯能团队变化需要确认是否开展客户开发",
    source: "洞察中心",
    route: "/signals?signal=signal-cloudchip",
    time: "今天 09:12",
    unread: true,
  },
  {
    id: "notification-4",
    type: "资料导入",
    title: "补充简历已合并，18 位候选人待审核",
    source: "具身智能 VLA 算法负责人",
    route: "/tasks/position-vla?state=review",
    time: "昨天 22:14",
    unread: false,
  },
];

export const searchItems = [
  ...mainlines.map((item) => ({
    id: item.id,
    group: "任务",
    icon: "task",
    title: item.title,
    meta: `${item.type} · ${item.status}`,
    summary: item.summary,
  })),
  ...signals.map((item) => ({
    id: item.id,
    group: "洞察",
    icon: "signal",
    title: item.title,
    meta: `${item.type} · ${item.status}`,
    summary: `已汇总 ${item.evidence} 个来源，发现于 ${item.time}。`,
  })),
  {
    id: "company-xinglan",
    group: "公司",
    icon: "building",
    title: "星澜机器人",
    meta: "具身智能 · 北京",
    summary: "专注具身智能机器人本体与 VLA 算法平台，当前存在招聘合作机会。",
  },
  {
    id: "candidate-linhao",
    group: "候选人",
    icon: "user",
    title: "林昊",
    meta: "机器人算法负责人 · 上海",
    summary: "具备机器人学习、强化学习和 VLA 项目经验，当前正在核实求职意愿。",
  },
  {
    id: "position-vla-asset",
    group: "岗位",
    icon: "briefcase",
    title: "具身智能 VLA 算法负责人",
    meta: "星澜机器人 · 北京",
    summary:
      "负责 VLA 模型、机器人学习和算法团队建设，对应岗位招聘任务正在推进。",
  },
];
