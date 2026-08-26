export const navSections = [
  {
    label: "核心工作",
    items: [
      { id: "home", label: "工作台", icon: "home", route: "/home" },
      { id: "works", label: "工作", icon: "route", count: 2 },
      { id: "signals", label: "信号中心", icon: "signal", count: 3 },
    ],
  },
  {
    label: "招聘资产",
    items: [
      { id: "companies", label: "公司", icon: "building" },
      { id: "contacts", label: "联系人", icon: "users" },
      { id: "opportunities", label: "招聘机会", icon: "sparkles" },
      { id: "positions", label: "岗位", icon: "briefcase" },
    ],
  },
  {
    label: "人才资产",
    items: [
      { id: "candidates", label: "候选人", icon: "user" },
      { id: "mappings", label: "人才版图", icon: "database" },
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
      "已核验两条招聘信号，形成三位联系人草稿，其中两位具有可用联系方式。",
    facts: [
      ["招聘信号", "2 条已核验"],
      ["联系人", "3 位 / 2 位可联系"],
      ["当前等待", "确认优先联系人"],
    ],
    next: "确认优先联系人后，Hunter 将准备联系内容并按当前授权继续。",
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
    summary: "云端与本机结果持续汇入，当前新增 18 位待审核候选人。",
    facts: [
      ["本批新增", "18 位"],
      ["资料更新", "4 位"],
      ["当前工作", "身份合并与审核"],
    ],
    next: "待首批资料补全后审核候选人，并决定进入联系名单的范围。",
  },
  {
    id: "mapping-embodied",
    type: "人才摸排",
    icon: "database",
    title: "具身智能核心人才版图",
    object: "VLA、机器人学习与灵巧操作",
    status: "进行中",
    tone: "success",
    changed: "今天 08:40",
    summary: "已经覆盖八家公司和三十七位确认人物，仍缺五个关键角色的可靠信息。",
    facts: [
      ["公司", "8 家"],
      ["确认人物", "37 位"],
      ["覆盖缺口", "5 个关键角色"],
    ],
    next: "可以补充目标团队，或对五个关键角色启动增量摸排。",
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

export const sideTasks = [
  {
    id: "task-hand-team",
    title: "核验灵巧手团队负责人",
    type: "身份核验",
    object: "星澜机器人人才版图",
    status: "等待用户",
    tone: "warning",
    detail: "发现两位同名人物，需要确认公开履历对应关系。",
    time: "16 分钟前",
  },
  {
    id: "task-shlab",
    title: "补充上海人工智能实验室具身智能团队",
    type: "公开资料调研",
    object: "具身智能核心人才版图",
    status: "运行中",
    tone: "info",
    detail: "已处理 8 / 13 个可信来源，当前正在核对组织关系。",
    time: "已运行 24 分钟",
  },
  {
    id: "task-zhaoxingyu",
    title: "消歧赵星羽的论文与任职身份",
    type: "人物消歧",
    object: "VLA 候选人审核",
    status: "失败",
    tone: "danger",
    detail: "一个来源暂时无法访问，已保留其余证据和检查点。",
    time: "7 分钟前",
  },
];

export const signals = [
  {
    id: "signal-cloudchip",
    type: "公司变化",
    title: "云脉芯能正在组建机器人芯片团队",
    object: "云脉芯能",
    priority: "高优先级",
    tone: "warning",
    evidence: 4,
    time: "今天 09:12",
  },
  {
    id: "signal-tuoji",
    type: "招聘动态",
    title: "拓界智驾新增感知与规划团队招聘页面",
    object: "拓界智驾",
    priority: "建议关注",
    tone: "info",
    evidence: 3,
    time: "今天 08:36",
  },
  {
    id: "signal-chensong",
    type: "候选人动向",
    title: "陈松的公开任职信息发生变化",
    object: "陈松 · 自动驾驶技术经理",
    priority: "观察中",
    tone: "neutral",
    evidence: 2,
    time: "昨天 17:20",
  },
];

export const actionItems = [
  {
    id: "action-contact",
    title: "确认星澜机器人优先联系人",
    source: "客户开发 · 星澜机器人招聘合作",
    meta: "3 位联系人草稿，其中 2 位有可用联系方式",
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
    id: "action-local-handoff",
    title: "处理本机协作异常",
    source: "岗位招聘 · VLA 候选人寻访",
    meta: "云端工作继续，本地任务等待重新接收",
    tone: "danger",
  },
];

export const notifications = [
  {
    id: "notification-1",
    type: "外部回复",
    title: "周雅雯补充了两个算法岗位方向",
    source: "星澜机器人招聘合作",
    time: "8 分钟前",
    unread: true,
  },
  {
    id: "notification-2",
    type: "工作更新",
    title: "赵星羽身份消歧需要处理",
    source: "VLA 候选人审核",
    time: "18 分钟前",
    unread: true,
  },
  {
    id: "notification-3",
    type: "信号",
    title: "云脉芯能团队变化已完成证据核验",
    source: "信号中心",
    time: "今天 09:12",
    unread: true,
  },
  {
    id: "notification-4",
    type: "本机协作",
    title: "本地结果已返回，18 位候选人待审核",
    source: "具身智能 VLA 算法负责人",
    time: "昨天 22:14",
    unread: false,
  },
];

export const searchItems = [
  ...mainlines.map((item) => ({
    id: item.id,
    group: "工作",
    icon: "route",
    title: item.title,
    meta: `${item.type} · ${item.status}`,
    summary: item.summary,
  })),
  ...sideTasks.map((item) => ({
    id: item.id,
    group: "工作",
    icon: "task",
    title: item.title,
    meta: `${item.type} · ${item.status}`,
    summary: item.detail,
  })),
  ...signals.map((item) => ({
    id: item.id,
    group: "信号",
    icon: "signal",
    title: item.title,
    meta: `${item.type} · ${item.priority}`,
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
      "负责 VLA 模型、机器人学习和算法团队建设，对应岗位招聘工作正在推进。",
  },
];
