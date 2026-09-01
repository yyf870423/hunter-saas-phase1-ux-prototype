export const landingNavItems = [
  { id: "mechanism", label: "怎么找人" },
  { id: "scenarios", label: "找人渠道" },
  { id: "workflow", label: "真实寻访" },
  { id: "control", label: "人机边界" },
];

export const heroStages = [
  {
    id: "goal",
    label: "岗位要求",
    title: "具身智能 VLA 算法负责人",
    detail: "北京优先 · 必须有真机落地",
    icon: "route",
  },
  {
    id: "research",
    label: "多路召回",
    title: "所有能找人的渠道，一起跑",
    detail: "内部人才 · 版图 · 公开与学术来源",
    icon: "search",
  },
  {
    id: "evidence",
    label: "身份与证据",
    title: "周岚 · 不是只有一个名字",
    detail: "经历已核验 · 意向仍待确认",
    icon: "file",
  },
  {
    id: "judgment",
    label: "等你筛人",
    title: "进岗位储备，还是继续补证？",
    detail: "联系、推荐和口径由你决定",
    icon: "user",
    tone: "human",
  },
  {
    id: "next",
    label: "候选池",
    title: "确认的人，进入岗位储备",
    detail: "依据、风险和来源一起保留",
    icon: "send",
  },
];

export const heroSteps = [
  {
    index: "01",
    title: "先吃透岗位",
    text: "硬条件、软要求和客户没写进 JD 的偏好，先变成找人标准。",
    icon: "route",
  },
  {
    index: "02",
    title: "多路召回人选",
    text: "已有候选人、专题图谱、公开与学术来源一起找，不押注单一平台。",
    icon: "search",
  },
  {
    index: "03",
    title: "合并、去重、补证",
    text: "先确认是不是同一个人，再把匹配理由、来源和缺口放到一起。",
    icon: "user",
  },
  {
    index: "04",
    title: "你确认后再推进",
    text: "谁进入岗位储备、何时联系、是否正式推荐，都由你拍板。",
    icon: "send",
  },
];

export const mechanismStages = [
  {
    id: "intent",
    index: "01",
    label: "定义目标",
    title: "先把“什么人算合适”说清楚",
    text: "不只抄 JD。地点、层级、团队阶段、关键技能、不能妥协的条件，以及客户口头补充的偏好，一起成为找人标准。",
    proof: "岗位画像 · 第 3 版",
    facts: ["北京优先", "VLA / 机器人学习", "真机产品落地", "8 人以上团队管理"],
  },
  {
    id: "research",
    index: "02",
    label: "多路召回",
    title: "所有能找到人的地方，一起跑",
    text: "先查已有候选人和专题图谱，再扩到公开网络、论文、专利、开源项目与用户主动上传的简历。渠道覆盖和缺口都看得见。",
    proof: "6 类渠道 · 并行寻访",
    facts: ["已有候选人", "目标公司与团队", "公开与学术来源", "用户上传简历"],
  },
  {
    id: "evidence",
    index: "03",
    label: "统一成池",
    title: "先认准同一个人，再谈匹配",
    text: "Hunter 统一人物身份、查重、补全资料，区分已核验事实与未知项，再按岗位硬门槛和加权条件给出匹配依据。",
    proof: "18 位人物 · 已去重",
    facts: ["身份合并", "经历与成果补全", "硬门槛筛选", "匹配理由与风险"],
  },
  {
    id: "advance",
    index: "04",
    label: "交给你筛",
    title: "候选池到这里停下，等你决定",
    text: "系统给出分数、理由、风险、建议动作和来源；谁进入岗位储备、何时联系、怎么开口、是否正式推荐，回到熟悉关系的你手里。",
    proof: "等待猎头确认",
    facts: ["加入岗位储备", "继续补证", "调整优先级", "暂不推进"],
    human: true,
  },
];

export const workflowStages = [
  {
    id: "research",
    label: "多路召回",
    status: "已跑一轮",
    title: "先把能找到人的渠道跑一轮",
    description:
      "客户要的不只是懂 VLA 的人，还要真机落地和带队经验。Hunter 先从已有候选人、目标团队和公开与学术来源里并行召回。",
    rows: [
      ["内部与版图", "已有候选人、目标公司与关键团队"],
      ["公开与学术", "公开履历、团队页、论文、专利与开源项目"],
      ["补充简历", "用户批量上传后统一查重与匹配"],
    ],
    footer: "6 类渠道已覆盖 · 演示数据",
  },
  {
    id: "evidence",
    label: "候选人判断",
    status: "证据已齐",
    title: "周岚为什么值得看，哪里还不能下结论",
    description:
      "技术方向、真机经历、带队范围分别有依据；但近期意愿没有公开信息，系统不会把“未知”写成“匹配”。",
    rows: [
      ["技术方向", "VLA 与机器人学习 · 高匹配"],
      ["落地经历", "双臂机器人真机部署 · 已核验"],
      ["带队范围", "带领 12 人算法团队 · 已核验"],
      ["还不知道", "近期求职意向尚未确认"],
    ],
    footer: "3 项有依据 · 1 项仍未知",
  },
  {
    id: "judgment",
    label: "等你拍板",
    status: "等你决定",
    title: "现在联系周岚，还是先补一轮信息？",
    description:
      "能力证据只是底牌。客户关系、候选人温度、联系时机和开场口径，仍要由熟悉这盘业务的你来定。",
    rows: [
      ["系统判断", "值得优先接触"],
      ["你要权衡", "客户节奏、候选人关系与联系时机"],
      ["还需确认", "近期意愿与合适的开场方式"],
    ],
    footer: "尚未对外联系",
    human: true,
  },
  {
    id: "next",
    label: "继续推进",
    status: "下一步就绪",
    title: "一旦拍板，后面的活直接接上",
    description:
      "岗位优先级、候选人档案和接触待办一起更新，首轮沟通只带必要证据，不用再从聊天记录里拼一遍。",
    rows: [
      ["岗位管道", "周岚进入优先接触序列"],
      ["候选人档案", "判断依据与未知项已同步"],
      ["接触待办", "确认联系路径并审核开场话术"],
    ],
    footer: "等你确认联系路径与口径",
  },
];

export const scenarios = [
  {
    id: "internal",
    title: "已有候选人",
    trigger: "先看看你已经认识的人",
    description:
      "Hunter 先查你已经积累的候选人资产和历史判断，不让合适的人因为换了岗位名称、公司叫法或一次没推进就被重新遗漏。",
    output: "一批带着历史关系与判断依据的人选",
  },
  {
    id: "mapping",
    title: "专题图谱",
    trigger: "从目标公司和团队定位关键人",
    description:
      "从目标公司、组织、研究方向和关键角色向下找人，同时保留人物关系、来源证据和仍未覆盖的空白。",
    output: "一张可复用、可继续补全的专题图谱",
  },
  {
    id: "public",
    title: "公开与学术来源",
    trigger: "履历之外，也从成果和协作关系找人",
    description:
      "公开网页、论文、专利和开源项目可以暴露真实方向、成果与共同关系。Hunter 保留来源并先核验人物身份，不只按姓名连线。",
    output: "一批能回到原始证据的人物线索",
  },
  {
    id: "uploads",
    title: "用户上传简历",
    trigger: "把已经取得的简历批量加入候选池",
    description:
      "用户主动上传单份简历或批量文件后，Hunter 会统一识别身份、查重、合并资料并按当前岗位重新匹配。",
    output: "一批经过统一整理和匹配的候选人资料",
  },
];

export const demoTeamSizes = ["1–5 人", "6–15 人", "16–50 人", "50 人以上"];
