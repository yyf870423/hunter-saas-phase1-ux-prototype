import { useEffect, useMemo, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Icon } from "../components/Icon";
import { RelationshipCanvas } from "../stage3/RelationshipCanvas";
import {
  ActivityTimeline,
  AssetPageHeader,
  Button,
  CustomRadio,
  DatePicker,
  DefinitionGrid,
  DeleteAssetModal,
  DetailHeader,
  DetailTabs,
  EntityLink,
  FieldGroup,
  FileDrop,
  FilePreview,
  FormField,
  Modal,
  NotFoundState,
  Pagination,
  PostWriteMatchingOptions,
  ProgressBar,
  RelationshipAiDialog,
  RelationshipAiEmptyState,
  RelationshipAiProcessingState,
  SelectMenu,
  SourceList,
  StateBanner,
  StatusBadge,
  StatusFromText,
  TagList,
  TextArea,
  TextInput,
  TooltipText,
  useToast,
} from "./asset-ui";
import {
  AssetAiProcessBanner,
  AssetAiProcessDrawer,
  AssetAiProcessHistory,
  AssetAiReviewWorkspace,
} from "./AssetAiProcessing";
import {
  candidateDetail,
  candidates,
  matchResults,
  positionDetail,
} from "./data";

const candidateTabs = [
  { value: "profile", label: "候选人资料" },
  { value: "experience", label: "工作与教育" },
  { value: "files", label: "简历与文件" },
  { value: "timeline", label: "跟进与沟通" },
  { value: "matching", label: "匹配与推进" },
  { value: "relations", label: "关联信息" },
  { value: "contact-path", label: "联系路径" },
];

const academicRelationNames = [
  "陈松",
  "赵星羽",
  "周明远",
  "沈岚",
  "何静",
  "王奕",
  "孙若凡",
  "蒋文博",
  "陆嘉成",
  "唐心怡",
  "魏清远",
  "顾思源",
];

const academicOutcomeTitles = [
  "Vision-Language-Action Learning for Generalizable Robotic Manipulation",
  "Open-World Robot Learning with Multimodal Foundation Models",
  "面向真机策略学习的数据闭环方法与系统",
  "Cross-Embodiment Policy Transfer for Dexterous Manipulation",
  "Learning Long-Horizon Mobile Manipulation from Human Videos",
  "多模态机器人任务规划与执行方法",
  "Scalable Data Curation for Vision-Language-Action Models",
  "Tactile-Guided Policy Adaptation in Unstructured Environments",
];

const candidateAcademicOutcomes = Array.from({ length: 48 }, (_, index) => ({
  id: `academic-outcome-${index}`,
  type: index % 5 === 2 ? "专利" : "论文",
  title: academicOutcomeTitles[index % academicOutcomeTitles.length],
  institution:
    index % 3 === 0
      ? "上海人工智能实验室"
      : index % 3 === 1
        ? "清华大学智能产业研究院"
        : "拓界机器人",
  relation:
    index % 7 === 0 ? "第一作者" : index % 4 === 0 ? "通讯作者" : "共同作者",
  updatedAt: `${2021 + (index % 6)} 年`,
  path: index % 5 === 2 ? "/patents/patent-data" : "/papers/paper-vla-survey",
}));

const collaborationWorks = [
  "Vision-Language-Action Learning for Generalizable Robotic Manipulation",
  "面向真机策略学习的数据闭环方法与系统",
  "Open-World Robot Learning with Multimodal Foundation Models",
  "多模态机器人任务规划与执行方法",
  "Cross-Embodiment Policy Transfer for Dexterous Manipulation",
  "Scalable Data Curation for Vision-Language-Action Models",
];

const candidateAcademicCollaborators = Array.from(
  { length: 28 },
  (_, index) => {
    const name = academicRelationNames[index % academicRelationNames.length];
    return {
      id: `academic-collaborator-${index}`,
      person: name,
      collaborationType:
        index % 5 === 1
          ? "共同发明人"
          : index % 4 === 0
            ? "项目合作"
            : "论文共同作者",
      workName: collaborationWorks[index % collaborationWorks.length],
      institution:
        index % 3 === 0
          ? "上海人工智能实验室"
          : index % 3 === 1
            ? "清华大学智能产业研究院"
            : "拓界机器人",
      updatedAt: `${2021 + (index % 5)}—${2023 + (index % 4)} 年`,
      path:
        name === "赵星羽"
          ? "/candidates/candidate-zhaoxingyu"
          : name === "陈松"
            ? "/candidates/candidate-chensong"
            : "",
    };
  },
);

const employmentRelationNames = [
  "陈若凡",
  "赵星羽",
  "周明远",
  "孙若凡",
  "蒋文博",
  "陆嘉成",
  "唐心怡",
  "魏清远",
  "顾思源",
  "沈岚",
  "何静",
  "王奕",
];

const candidateEmploymentRelations = Array.from({ length: 42 }, (_, index) => {
  const company = index % 3 === 0 ? "拓界机器人" : "上海人工智能实验室";
  const current = index % 4 < 2;
  const sameDepartment = index % 3 !== 1;
  return {
    id: `employment-relation-${index}`,
    person: employmentRelationNames[index % employmentRelationNames.length],
    relation: `${current ? "当前" : "曾经"}${sameDepartment ? "同部门" : "同公司"}`,
    company,
    department: sameDepartment
      ? index % 2
        ? "机器人学习与数据平台"
        : "具身智能中心"
      : "部门信息未核实",
    overlap: current
      ? index % 2
        ? "2024.06—至今"
        : "2025.02—至今"
      : index % 2
        ? "2020.07—2023.11"
        : "2018.04—2021.08",
    title:
      index % 4 === 0
        ? "VLA 算法专家"
        : index % 4 === 1
          ? "机器人数据平台主管"
          : index % 4 === 2
            ? "强化学习算法负责人"
            : "具身智能研究员",
    status: sameDepartment ? "已核实" : "部门待确认",
    path:
      index % 5 === 0
        ? "/candidates/candidate-zhaoxingyu"
        : "/candidates/candidate-linhao",
  };
});

const candidateContactPathViews = [
  {
    id: "contact-path",
    label: "联系路径",
    description: "林昊的可执行联系路径",
    summary: "1 条直接联系方式 · 2 条关系路径 · 证据随底层资产自动更新",
    layout: "network",
    defaultSelection: { kind: "node", id: "path-linhao" },
    nodes: [
      {
        id: "path-me",
        label: "于一凡",
        meta: "当前猎头",
        summary: "当前 Hunter 用户。",
        status: "已确认",
        tone: "success",
        kind: "person",
        x: 38,
        y: 190,
        evidence: ["用户账号"],
      },
      {
        id: "path-phone",
        label: "已核实手机号",
        meta: "直接联系",
        summary: "手机号最近核实于 2026-08-20，可直接由猎头联系。",
        status: "可直接联系",
        tone: "success",
        kind: "contact",
        x: 310,
        y: 42,
        evidence: ["候选人档案"],
      },
      {
        id: "path-shen",
        label: "沈岚",
        meta: "前同事 · 已有微信",
        summary: "与猎头有稳定联系，曾与林昊在上海人工智能实验室共事。",
        status: "已确认",
        tone: "success",
        kind: "person",
        x: 292,
        y: 190,
        evidence: ["沟通记录", "工作经历"],
      },
      {
        id: "path-chen",
        label: "陈松",
        meta: "共同作者 · 系统候选人",
        summary: "与林昊共同发表 3 篇论文，可作为备用关系路径。",
        status: "已确认",
        tone: "info",
        kind: "person",
        x: 520,
        y: 322,
        detailPath: "/candidates/candidate-chensong",
        detailLabel: "打开候选人详情",
        evidence: ["论文作者关系", "候选人档案"],
      },
      {
        id: "path-linhao",
        label: "林昊",
        meta: "目标候选人",
        summary:
          "无论是否已有直接联系方式，Hunter 都保留可解释的备用联系路径。",
        status: "目标人物",
        tone: "info",
        kind: "person",
        x: 770,
        y: 190,
        detailPath: "/candidates/candidate-linhao?tab=profile",
        detailLabel: "打开候选人资料",
        evidence: ["候选人档案"],
      },
    ],
    edges: [
      {
        id: "path-e-phone",
        source: "path-me",
        target: "path-phone",
        label: "已有号码",
        status: "已确认",
        tone: "success",
        observedAt: "2026-08-20",
        evidence: ["候选人档案"],
      },
      {
        id: "path-e-phone-target",
        source: "path-phone",
        target: "path-linhao",
        label: "直接联系",
        status: "可用",
        tone: "success",
        observedAt: "2026-08-20",
        evidence: ["手机号核实记录"],
      },
      {
        id: "path-e-shen",
        source: "path-me",
        target: "path-shen",
        label: "已有关系",
        status: "已确认",
        tone: "success",
        observedAt: "2026-08-12",
        evidence: ["沟通记录"],
      },
      {
        id: "path-e-chen",
        source: "path-shen",
        target: "path-chen",
        label: "前同事",
        status: "已确认",
        tone: "info",
        observedAt: "2026-08-22",
        evidence: ["工作经历"],
      },
      {
        id: "path-e-target",
        source: "path-chen",
        target: "path-linhao",
        label: "共同作者",
        status: "已确认",
        tone: "info",
        observedAt: "2026-08-24",
        evidence: ["论文作者关系"],
      },
    ],
  },
];

const candidateAiSuggestions = [
  {
    label: "当前公司与职位",
    meta: "职业概览建议",
    current: "拓界机器人 · 机器人学习负责人；当前职位待本人核实。",
    suggestion:
      "拓界机器人 · 机器人学习负责人（公开资料显示 2023 年至今）。负责机器人学习与 VLA 方向，管理 12 人算法团队；当前任职状态仍待本人核实。",
    reason:
      "公开职业资料、GitHub 简介与最新简历对公司和职责描述一致，但没有候选人本人确认，因此补充团队范围并保留待核实状态。",
    source: "当前简历 · LinkedIn 公开资料 · GitHub 主页",
  },
  {
    label: "工作经历",
    meta: "经历补充建议",
    current:
      "2023 年至今，拓界机器人，机器人学习负责人。负责机器人学习算法与项目交付。",
    suggestion:
      "2023 年至今，拓界机器人，机器人学习负责人。带领 12 人团队建设 VLA 训练、真机评测与失败样本回流链路，推动仓储和柔性制造场景的策略模型稳定交付。",
    reason:
      "最新简历补充了团队规模；公开项目说明和技术分享给出了数据闭环、真机评测及交付场景，可形成更完整的职责描述。",
    source: "林昊_机器人学习负责人_2026.pdf · 公开技术分享",
  },
  {
    label: "教育经历",
    meta: "教育信息建议",
    current: "上海交通大学 · 控制科学与工程 · 硕士。",
    suggestion:
      "上海交通大学 · 控制科学与工程 · 硕士（2014—2017）；研究方向为机器人运动规划与强化学习。",
    reason:
      "学校和学位与当前资料一致；论文作者主页补充了就读时间和研究方向，需要用户确认后写入正式经历。",
    source: "当前简历 · 论文作者主页",
  },
  {
    label: "技能与行业",
    meta: "标签归一建议",
    current: "VLA、强化学习、机器人学习、真机部署、团队管理。",
    suggestion:
      "VLA、机器人学习、强化学习、模仿学习、真机部署、机器人数据闭环、算法团队管理；行业归入机器人、人工智能。",
    reason:
      "根据项目经历补充模仿学习和数据闭环，并把原始表达归一为现有标准技能与行业标签，便于搜索和匹配。",
    source: "当前简历 · 项目作品集 · Hunter 标准标签",
  },
  {
    label: "公开资料链接",
    meta: "公开来源建议",
    current: "LinkedIn、GitHub。",
    suggestion:
      "保留已验证的 LinkedIn 与 GitHub 链接；新增个人学术主页和 Google Scholar 公开主页，并标记最近验证时间为今天。",
    reason:
      "两个新增页面的姓名、工作单位与研究方向均与当前候选人一致，仍需用户确认身份后成为正式链接。",
    source: "公开网络搜索 · 候选人身份交叉验证",
  },
  {
    label: "论文与专利",
    meta: "人物关联建议",
    current: "已关联 1 篇论文、1 项专利。",
    suggestion:
      "新增关联论文《Data-Centric Robot Learning with Failure Replay》；作者单位和履历时间一致，但存在同名作者可能，建议保留为待确认关联。",
    reason:
      "作者姓名、单位和研究方向均匹配，但缺少邮箱或 ORCID 等稳定标识，不能直接确认是同一人。",
    source: "OpenAlex · 论文主页 · 当前候选人资料",
  },
];

function buildCandidateAiRecord(state = "complete") {
  const planStates = {
    running: ["complete", "running", "pending", "pending"],
    review: ["complete", "complete", "complete", "complete"],
    failed: ["complete", "failed", "pending", "pending"],
    complete: ["complete", "complete", "complete", "complete"],
  }[state];
  const details = [
    ["读取候选人资料", "已读取资料版本 v6、简历、公开链接和已有关联。"],
    [
      "检索与核验公开资料",
      state === "failed"
        ? "公开资料读取中断，已保留成功读取的来源和原始输入。"
        : "核验职业主页、项目、论文和专利中的身份线索。",
    ],
    ["生成字段建议", "对经历、技能、链接和学术成果生成字段级建议。"],
    ["形成审核结果", "建议通过结构检查，等待用户确认后写入资料。"],
  ];
  const plan = details.map(([title, detail], index) => {
    const itemState = planStates[index];
    return {
      title,
      detail,
      state: itemState,
      label:
        itemState === "complete"
          ? "已完成"
          : itemState === "running"
            ? "运行中"
            : itemState === "failed"
              ? "失败"
              : "等待",
    };
  });
  const active = state !== "complete";
  return {
    id: active ? "candidate-enrichment-v7" : "candidate-enrichment-v6",
    type: "候选人信息补全",
    title: active ? "补全林昊的候选人资料" : "公开资料补全 · 资料版本 v6",
    target: "林昊",
    source: "候选人详情 · 资料版本 v6",
    state,
    startedAt: active ? "今天 10:42" : "8 月 19 日 18:12",
    updatedAt:
      state === "running"
        ? "刚刚"
        : state === "review"
          ? "今天 10:46"
          : state === "failed"
            ? "今天 10:44"
            : "8 月 19 日 18:20",
    summary:
      state === "running"
        ? "正在核验职业经历、公开主页和学术成果。"
        : state === "review"
          ? "已生成 6 项建议，等待确认后更新候选人资料。"
          : state === "failed"
            ? "公开资料读取中断，已保留成功结果，可直接重试。"
            : "已补充职业经历、标准技能、公开链接和一项学术成果。",
    plan,
    runs: [
      {
        id: active ? "run-7" : "run-6",
        label: active ? "运行 #7" : "运行 #6",
        time: active ? "今天 10:42" : "8 月 19 日 18:12 · 8 分 06 秒",
        detail:
          state === "failed"
            ? "公开资料读取中断，没有改动正式候选人资料。"
            : state === "running"
              ? "已完成简历读取，正在核验公开职业资料。"
              : state === "review"
                ? "已形成 6 项字段建议，正式资料尚未改变。"
                : "用户确认 5 项建议后形成候选人资料版本 v6。",
        status:
          state === "failed"
            ? "失败"
            : state === "running"
              ? "运行中"
              : state === "review"
                ? "待审核"
                : "完成",
        tone:
          state === "failed"
            ? "danger"
            : state === "running"
              ? "info"
              : state === "review"
                ? "warning"
                : "success",
      },
    ],
  };
}

function CandidateSectionEditModal({ section, close, candidate }) {
  const notify = useToast();
  const config = {
    summary: {
      title: "编辑职业概览",
      description: "人工维护的概览不会被后续 Agent 结果静默覆盖",
      body: (
        <FormField label="职业概览" required span={2}>
          <TextArea value={candidate.summary} onChange={() => {}} rows={7} />
        </FormField>
      ),
    },
    basic: {
      title: "编辑基本资料",
      description: "出生年份用于动态计算年龄",
      body: (
        <>
          <FormField label="中文名" required>
            <TextInput value={candidate.name} onChange={() => {}} />
          </FormField>
          <FormField label="英文名">
            <TextInput value={candidate.englishName} onChange={() => {}} />
          </FormField>
          <FormField label="出生年份">
            <DatePicker
              label="选择出生年份"
              mode="year"
              value={candidate.birthYear}
              initialYear={1990}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="性别">
            <SelectMenu
              label="选择性别"
              value={candidate.gender}
              options={["男", "女", "未知"]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="地点">
            <TextInput value={candidate.location} onChange={() => {}} />
          </FormField>
          <FormField label="求职状态">
            <SelectMenu
              label="选择状态"
              value={candidate.preference}
              options={["正在求职", "愿意了解机会", "暂不考虑", "未知"]}
              onChange={() => {}}
            />
          </FormField>
        </>
      ),
    },
    overview: {
      title: "编辑当前概览",
      description: "概览允许与详细经历暂时不一致，并保留核实状态",
      body: (
        <>
          <FormField label="当前公司原文">
            <TextInput value={candidate.company} onChange={() => {}} />
          </FormField>
          <FormField label="当前职位">
            <TextInput value={candidate.title} onChange={() => {}} />
          </FormField>
          <FormField label="工作年限">
            <TextInput value={candidate.experience} onChange={() => {}} />
          </FormField>
          <FormField label="最高教育">
            <TextInput value={candidate.education} onChange={() => {}} />
          </FormField>
          <FormField label="职级">
            <TextInput value="技术总监 / 负责人" onChange={() => {}} />
          </FormField>
          <FormField label="信息状态">
            <SelectMenu
              label="选择状态"
              value="待本人核实"
              options={["已核实", "待本人核实", "公开资料推断"]}
              onChange={() => {}}
            />
          </FormField>
        </>
      ),
    },
    contacts: {
      title: "编辑联系方式",
      description: "阶段一结构化联系方式只保存手机和邮箱",
      body: (
        <>
          <FormField label="手机号码">
            <TextInput value={candidate.phone} onChange={() => {}} />
          </FormField>
          <FormField label="手机状态">
            <SelectMenu
              label="选择状态"
              value="可用"
              options={["可用", "待核实", "已失效"]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="邮箱">
            <TextInput value={candidate.email} onChange={() => {}} />
          </FormField>
          <FormField label="邮箱状态">
            <SelectMenu
              label="选择状态"
              value="已回复"
              options={["已回复", "可用", "待核实", "已失效"]}
              onChange={() => {}}
            />
          </FormField>
        </>
      ),
    },
    skills: {
      title: "编辑技能与行业",
      description: "技能标签使用标准词，同时保留无法归一的原始表达",
      body: (
        <>
          <FormField label="关键技能" span={2}>
            <TextArea
              value="VLA、强化学习、机器人学习、模仿学习、真机部署、数据闭环、团队管理"
              onChange={() => {}}
              rows={4}
            />
          </FormField>
          <FormField label="行业标签">
            <SelectMenu
              label="选择行业"
              value={["机器人", "人工智能"]}
              options={["机器人", "人工智能", "自动驾驶", "智能硬件"]}
              multiple
              onChange={() => {}}
            />
          </FormField>
          <FormField label="软性能力">
            <TextArea
              value="能够在研究、工程和产品团队之间建立清晰的交付边界，愿意亲自解决关键技术问题。"
              onChange={() => {}}
              rows={4}
            />
          </FormField>
        </>
      ),
    },
    links: {
      title: "编辑公开资料链接",
      description: "系统根据域名自动识别链接类型",
      body: (
        <>
          {candidate.links.map(([type, url]) => (
            <FormField label={type} key={url}>
              <TextInput value={`https://${url}`} onChange={() => {}} />
            </FormField>
          ))}
          <FormField label="新增链接" span={2}>
            <TextInput
              value=""
              onChange={() => {}}
              placeholder="粘贴公开资料 URL"
            />
          </FormField>
        </>
      ),
    },
  };
  const active = config[section];
  return (
    <Modal
      open={Boolean(active)}
      close={close}
      size="xl"
      title={active?.title || "编辑候选人资料"}
      description={active?.description}
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            onClick={() => {
              close();
              notify(`${active?.title || "候选人资料"}已保存`);
            }}
          >
            保存修改
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">{active?.body}</div>
    </Modal>
  );
}

function ProfileTab({
  candidate,
  hasIdentityIssue = false,
  aiState,
  aiRecord,
  onOpenAiDetails,
  onOpenAiReview,
  onStopAi,
  onRetryAi,
}) {
  const navigate = useNavigate();
  const [editSection, setEditSection] = useState(null);
  return (
    <div className="s4-detail-stack">
      <AssetAiProcessBanner
        state={aiState}
        title="候选人信息补全"
        description={aiRecord.summary}
        target={aiRecord.target}
        onDetails={onOpenAiDetails}
        onPrimary={aiState === "review" ? onOpenAiReview : onRetryAi}
        primaryLabel={
          aiState === "review"
            ? "审核补全结果"
            : aiState === "failed"
              ? "重新运行"
              : undefined
        }
        onSecondary={onStopAi}
        secondaryLabel={aiState === "running" ? "停止" : undefined}
      />
      <section className="s4-candidate-review-strip">
        <article className="is-warning">
          <i>
            <Icon name="warning" />
          </i>
          <span>
            <b>7 项资料变化等待审核</b>
            <p>新简历带来工作经历、教育经历、论文、专利和技能变化。</p>
          </span>
          <Button
            size="sm"
            onClick={() => navigate("/reviews/fields/candidate-linhao")}
          >
            审核资料变化
          </Button>
        </article>
        {hasIdentityIssue ? (
          <article className="is-danger">
            <i>
              <Icon name="copy" />
            </i>
            <span>
              <b>发现疑似重复候选人</b>
              <p>手机后四位和工作轨迹高度一致，需要确认是否合并。</p>
            </span>
            <Button
              size="sm"
              onClick={() => navigate("/reviews/identity/candidate-linhao")}
            >
              处理身份冲突
            </Button>
          </article>
        ) : null}
      </section>
      <FieldGroup
        title="职业概览"
        action={
          <Button
            size="sm"
            icon="edit"
            onClick={() => setEditSection("summary")}
          >
            编辑职业概览
          </Button>
        }
      >
        <p className="s4-long-copy">{candidate.summary}</p>
        <small className="s4-generated-meta">
          基于资料版本 v6 生成 · 昨天 18:20
        </small>
      </FieldGroup>
      <FieldGroup
        title="基本资料"
        action={
          <Button size="sm" icon="edit" onClick={() => setEditSection("basic")}>
            编辑资料
          </Button>
        }
      >
        <DefinitionGrid
          items={[
            ["中文名", candidate.name],
            ["英文名", candidate.englishName],
            [
              "出生年份",
              `${candidate.birthYear}（${new Date().getFullYear() - Number(candidate.birthYear)} 岁）`,
            ],
            ["性别", candidate.gender],
            ["地点", candidate.location],
            ["求职状态", candidate.preference],
          ]}
        />
      </FieldGroup>
      <FieldGroup
        title="当前概览"
        description="概览不强制覆盖详细经历；存在差异时保留待核实提示。"
        action={
          <Button
            size="sm"
            icon="edit"
            onClick={() => setEditSection("overview")}
          >
            编辑当前概览
          </Button>
        }
      >
        <DefinitionGrid
          items={[
            ["当前公司", candidate.company],
            ["当前职位", candidate.title],
            ["工作年限", candidate.experience],
            ["最高教育", candidate.education],
            ["职级", "技术总监 / 负责人"],
            [
              "信息状态",
              <StatusBadge tone="warning">当前职位待本人核实</StatusBadge>,
            ],
          ]}
        />
      </FieldGroup>
      <FieldGroup
        title="联系方式"
        action={
          <Button
            size="sm"
            icon="edit"
            onClick={() => setEditSection("contacts")}
          >
            编辑联系方式
          </Button>
        }
      >
        <div className="s4-contact-methods">
          <article>
            <i>
              <Icon name="phone" />
            </i>
            <span>
              <b>{candidate.phone}</b>
              <small>主要手机 · 2026-08-18 核实</small>
            </span>
            <StatusBadge tone="success">可用</StatusBadge>
          </article>
          <article>
            <i>
              <Icon name="mail" />
            </i>
            <span>
              <b>{candidate.email}</b>
              <small>主要邮箱 · 简历提供</small>
            </span>
            <StatusBadge tone="success">已回复</StatusBadge>
          </article>
        </div>
      </FieldGroup>
      <FieldGroup
        title="技能与行业"
        action={
          <Button
            size="sm"
            icon="edit"
            onClick={() => setEditSection("skills")}
          >
            编辑标签
          </Button>
        }
      >
        <div className="s4-labeled-row">
          <b>关键技能</b>
          <TagList
            items={[
              "VLA",
              "强化学习",
              "机器人学习",
              "模仿学习",
              "真机部署",
              "数据闭环",
              "团队管理",
            ]}
            tone="info"
          />
        </div>
        <div className="s4-labeled-row">
          <b>行业标签</b>
          <TagList items={["机器人", "人工智能"]} />
        </div>
        <div className="s4-labeled-row">
          <b>软性能力</b>
          <p>
            能够在研究、工程和产品团队之间建立清晰的交付边界，愿意亲自解决关键技术问题。
          </p>
        </div>
      </FieldGroup>
      <FieldGroup
        title="公开资料链接"
        action={
          <Button size="sm" icon="edit" onClick={() => setEditSection("links")}>
            编辑链接
          </Button>
        }
      >
        <div className="s4-link-list">
          {candidate.links.map(([type, url, status]) => (
            <button
              type="button"
              key={url}
              onClick={() => window.open(`https://${url}`, "_blank")}
            >
              <i>
                <Icon name="link" />
              </i>
              <span>
                <b>{type}</b>
                <small>{url}</small>
              </span>
              <StatusBadge tone="success">{status}</StatusBadge>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      </FieldGroup>
      <CandidateSectionEditModal
        section={editSection}
        close={() => setEditSection(null)}
        candidate={candidate}
      />
    </div>
  );
}

function CandidateAiStartModal({ open, close, onStart }) {
  const [scope, setScope] = useState([
    "工作与教育经历",
    "技能与行业",
    "公开资料链接",
    "论文与专利",
  ]);
  const options = [
    "工作与教育经历",
    "技能与行业",
    "公开资料链接",
    "论文与专利",
  ];
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title="补全当前候选人资料"
      description="处理结果保存在当前候选人，确认前不会修改正式资料，也不会新增任务"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            icon="sparkles"
            disabled={!scope.length}
            onClick={() => onStart({ scope })}
          >
            开始补全
          </Button>
        </>
      }
    >
      <div className="s4-ai-start-form">
        <section className="s4-ai-target-summary">
          <i>
            <Icon name="users" />
          </i>
          <span>
            <small>处理对象</small>
            <b>林昊</b>
            <p>拓界机器人 · 机器人学习负责人 · 候选人资料 v6</p>
          </span>
        </section>
        <FormField
          label="本次补全范围"
          help="Hunter 使用现有资料和公开网络信息，逐项生成待审核建议。"
        >
          <SelectMenu
            label="选择补全范围"
            value={scope}
            options={options}
            multiple
            onChange={setScope}
          />
        </FormField>
        <section className="s4-ai-write-policy">
          <Icon name="lock" />
          <span>
            <b>审核后更新</b>
            <p>
              身份冲突和同名作者不会自动确认；只有选中的建议会写入候选人资料。
            </p>
          </span>
        </section>
      </div>
    </Modal>
  );
}

function ExperienceTab({ candidate }) {
  const notify = useToast();
  const [experienceModal, setExperienceModal] = useState(false);
  const [recordModal, setRecordModal] = useState(null);
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="工作经历"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() => setExperienceModal(true)}
          >
            添加经历
          </Button>
        }
      >
        <div className="s4-experience-list">
          {candidate.experiences.map((item, index) => (
            <article key={item.company}>
              <span className="s4-experience-time">{item.period}</span>
              <div>
                <header>
                  <span>
                    <h3>{item.company}</h3>
                    <p>
                      {item.title} · {item.department}
                    </p>
                  </span>
                  <button
                    type="button"
                    onClick={() => setExperienceModal(true)}
                  >
                    <Icon name="edit" />
                    编辑
                  </button>
                </header>
                <p>{item.detail}</p>
                <footer>
                  <StatusBadge tone="success">已关联正式公司</StatusBadge>
                  <small>{index === 0 ? "简历与用户确认" : "历史简历"}</small>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup
        title="教育经历"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() =>
              setRecordModal({ kind: "education", mode: "create" })
            }
          >
            添加教育
          </Button>
        }
      >
        <div className="s4-simple-records">
          {candidate.educationHistory.map(([school, degree, period]) => (
            <article key={school}>
              <i>
                <Icon name="database" />
              </i>
              <span>
                <b>{school}</b>
                <p>{degree}</p>
              </span>
              <time>{period}</time>
              <button
                type="button"
                aria-label={`编辑${school}教育经历`}
                onClick={() =>
                  setRecordModal({
                    kind: "education",
                    mode: "edit",
                    name: school,
                  })
                }
              >
                <Icon name="edit" />
              </button>
            </article>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup
        title="项目经历"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() => setRecordModal({ kind: "project", mode: "create" })}
          >
            添加项目
          </Button>
        }
      >
        <div className="s4-project-list">
          {candidate.projects.map(([name, role, period, detail]) => (
            <article key={name}>
              <header>
                <span>
                  <b>{name}</b>
                  <small>
                    {role} · {period}
                  </small>
                </span>
                <button
                  type="button"
                  aria-label={`编辑${name}项目经历`}
                  onClick={() =>
                    setRecordModal({ kind: "project", mode: "edit", name })
                  }
                >
                  <Icon name="edit" />
                </button>
              </header>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </FieldGroup>
      <ExperienceModal
        open={experienceModal}
        close={() => setExperienceModal(false)}
        onSave={() => {
          setExperienceModal(false);
          notify("工作经历已保存");
        }}
      />
      <CandidateRecordModal
        config={recordModal}
        close={() => setRecordModal(null)}
        onSave={() => {
          notify(
            recordModal?.kind === "education"
              ? "教育经历已保存"
              : "项目经历已保存",
          );
          setRecordModal(null);
        }}
      />
    </div>
  );
}

function CandidateRecordModal({ config, close, onSave }) {
  const isEducation = config?.kind === "education";
  const isEdit = config?.mode === "edit";
  return (
    <Modal
      open={Boolean(config)}
      close={close}
      size="lg"
      title={`${isEdit ? "编辑" : "添加"}${isEducation ? "教育经历" : "项目经历"}`}
      description="该记录会独立保存，并保留后续变化历史"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={onSave}>
            保存记录
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        {isEducation ? (
          <>
            <FormField label="学校" required>
              <TextInput
                value={config?.name || "上海交通大学"}
                onChange={() => {}}
              />
            </FormField>
            <FormField label="学历" required>
              <SelectMenu
                label="选择学历"
                value="硕士"
                options={["博士", "硕士", "本科", "大专"]}
                onChange={() => {}}
              />
            </FormField>
            <FormField label="专业">
              <TextInput value="控制科学与工程" onChange={() => {}} />
            </FormField>
            <FormField label="起止时间">
              <DatePicker
                label="选择起止时间"
                mode="month-range"
                value="2010.09 - 2013.06"
                onChange={() => {}}
              />
            </FormField>
          </>
        ) : (
          <>
            <FormField label="项目名称" required>
              <TextInput
                value={config?.name || "多任务机器人操作策略平台"}
                onChange={() => {}}
              />
            </FormField>
            <FormField label="项目角色">
              <TextInput value="项目负责人" onChange={() => {}} />
            </FormField>
            <FormField label="起止时间">
              <DatePicker
                label="选择起止时间"
                mode="month-range"
                value="2023.01 - 2025.12"
                onChange={() => {}}
              />
            </FormField>
            <FormField label="项目描述" required span={2}>
              <TextArea
                value="负责从数据采集、策略训练到真机评测的完整闭环，推动多任务策略在客户现场稳定运行。"
                onChange={() => {}}
                rows={6}
              />
            </FormField>
          </>
        )}
      </div>
    </Modal>
  );
}

function ExperienceModal({ open, close, onSave }) {
  const [company, setCompany] = useState("拓界机器人");
  const [title, setTitle] = useState("机器人学习负责人");
  const [detail, setDetail] = useState(
    "负责机器人学习团队、操作策略平台和真机数据闭环。\n主导多任务策略上线并推动跨团队交付。",
  );
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title="编辑工作经历"
      description="公司原文和正式公司关系分别保存"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={onSave}>
            保存经历
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="公司原文" required>
          <TextInput value={company} onChange={setCompany} />
        </FormField>
        <FormField label="正式公司关联">
          <SelectMenu
            label="选择公司"
            value={company}
            options={["拓界机器人", "星澜机器人", "上海人工智能实验室"]}
            onChange={setCompany}
            searchable
          />
        </FormField>
        <FormField label="职位" required>
          <TextInput value={title} onChange={setTitle} />
        </FormField>
        <FormField label="部门">
          <TextInput value="智能操作部 / 机器人学习团队" onChange={() => {}} />
        </FormField>
        <FormField label="起止时间">
          <DatePicker
            label="选择起止时间"
            mode="month-range"
            value="2022.03 - 至今"
            allowOngoing
            onChange={() => {}}
          />
        </FormField>
        <FormField label="团队规模">
          <TextInput value="14 人" onChange={() => {}} />
        </FormField>
        <FormField label="职责与亮点" required span={2}>
          <TextArea value={detail} onChange={setDetail} rows={6} />
        </FormField>
      </div>
    </Modal>
  );
}

function FilesTab({ candidate }) {
  const navigate = useNavigate();
  const notify = useToast();
  const [preview, setPreview] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  return (
    <div className="s4-detail-stack">
      <StateBanner
        tone="warning"
        icon="warning"
        title="新简历不会直接覆盖候选人档案"
        description="系统会先比较新增、更新和冲突字段，再由用户确认或按当前授权处理。"
        action={
          <Button size="sm" onClick={() => setChangesOpen(true)}>
            查看简历变化
          </Button>
        }
      />
      <FieldGroup
        title="简历版本"
        action={
          <Button size="sm" icon="upload" onClick={() => setUploadOpen(true)}>
            上传新简历
          </Button>
        }
      >
        <div className="s4-file-list">
          {candidate.resumes.map(
            ([name, version, time, status, size], index) => (
              <article key={name}>
                <i>
                  <Icon name="file" />
                </i>
                <span>
                  <b>{name}</b>
                  <small>
                    {version} · {time} · {size}
                  </small>
                </span>
                <StatusBadge tone="success">{status}</StatusBadge>
                <div>
                  <button type="button" onClick={() => setPreview(name)}>
                    预览
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      notify(
                        index
                          ? "该版本已恢复为当前简历，并形成新的变化记录"
                          : "已经是当前简历",
                      )
                    }
                  >
                    {index ? "恢复" : "当前"}
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      </FieldGroup>
      <FieldGroup
        title="其他文件"
        description="作品集、证明、推荐材料和沟通附件与简历版本分开。"
        action={
          <Button size="sm" icon="plus" onClick={() => setUploadOpen(true)}>
            添加文件
          </Button>
        }
      >
        <div className="s4-file-list">
          {candidate.files.map(([name, type, time, size]) => (
            <article key={name}>
              <i>
                <Icon name="file" />
              </i>
              <span>
                <b>{name}</b>
                <small>
                  {type} · {time} · {size}
                </small>
              </span>
              <StatusBadge tone="neutral">已保存</StatusBadge>
              <div>
                <button type="button" onClick={() => setPreview(name)}>
                  预览
                </button>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() => notify(`“${name}”已移至回收站`)}
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      </FieldGroup>
      <Modal
        open={uploadOpen}
        close={() => setUploadOpen(false)}
        size="lg"
        title="上传候选人文件"
        description="系统会先判断文件类型，再决定是否进入简历解析"
        footer={
          <>
            <Button onClick={() => setUploadOpen(false)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                setUploadOpen(false);
                notify("文件已上传，正在解析并比较变化", "info");
              }}
            >
              上传并处理
            </Button>
          </>
        }
      >
        <FileDrop files={[]} onFiles={() => {}} accept="PDF、DOCX、PNG、JPG" />
      </Modal>
      <Modal
        open={changesOpen}
        close={() => setChangesOpen(false)}
        size="xl"
        title="查看简历变化"
        description="林昊_机器人学习负责人_2026.pdf 相比资料版本 v6"
        footer={
          <>
            <Button onClick={() => setChangesOpen(false)}>关闭</Button>
            <Button
              tone="primary"
              onClick={() => {
                setChangesOpen(false);
                navigate("/reviews/fields/candidate-linhao");
              }}
            >
              审核 7 项变化
            </Button>
          </>
        }
      >
        <div className="s4-resume-change-summary">
          <article>
            <b>4</b>
            <span>新增内容</span>
          </article>
          <article>
            <b>2</b>
            <span>更新内容</span>
          </article>
          <article>
            <b>1</b>
            <span>需要核实</span>
          </article>
        </div>
        <div className="s4-resume-change-list">
          {[
            [
              "工作经历",
              "更新",
              "补充拓界机器人团队规模、汇报对象和真机数据闭环成果",
            ],
            ["教育经历", "新增", "新增上海交通大学控制科学与工程硕士经历"],
            ["论文成果", "新增", "新增 2 篇具身智能论文，作者身份需要交叉核实"],
            ["专利成果", "新增", "新增 1 项机器人训练数据相关发明专利"],
            ["关键技能", "更新", "新增数据闭环、Diffusion Policy 与 Sim2Real"],
            ["意向地点", "待核实", "简历写北京、上海，当前档案仅记录上海"],
          ].map(([field, status, detail]) => (
            <article key={field}>
              <StatusFromText value={status} />
              <span>
                <b>{field}</b>
                <p>{detail}</p>
              </span>
            </article>
          ))}
        </div>
      </Modal>
      {preview ? (
        <FilePreview name={preview} close={() => setPreview(null)} />
      ) : null}
    </div>
  );
}

function TimelineTab({ candidate }) {
  const notify = useToast();
  const [items, setItems] = useState(candidate.timeline);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const openCreate = () => {
    setEditingIndex(null);
    setNote("");
    setNoteOpen(true);
  };
  const openEdit = (index) => {
    setEditingIndex(index);
    setNote(items[index][2]);
    setNoteOpen(true);
  };
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="跟进与沟通"
        description="真实消息只保存一次；岗位业务事件通过引用显示。"
        action={
          <Button size="sm" icon="plus" onClick={openCreate}>
            添加记录
          </Button>
        }
      >
        <ActivityTimeline
          items={items}
          onEdit={openEdit}
          onDelete={setDeleteIndex}
        />
      </FieldGroup>
      <Modal
        open={noteOpen}
        close={() => setNoteOpen(false)}
        title={editingIndex === null ? "添加跟进记录" : "编辑跟进记录"}
        description="记录猎头人工获得的沟通结果，不要求维护沟通渠道类型"
        footer={
          <>
            <Button onClick={() => setNoteOpen(false)}>取消</Button>
            <Button
              tone="primary"
              disabled={!note.trim()}
              onClick={() => {
                if (editingIndex === null) {
                  setItems((current) => [
                    ["刚刚", "人工备注", note.trim(), "沈岚"],
                    ...current,
                  ]);
                } else {
                  setItems((current) =>
                    current.map((item, index) =>
                      index === editingIndex
                        ? [item[0], item[1], note.trim(), item[3]]
                        : item,
                    ),
                  );
                }
                setNoteOpen(false);
                setNote("");
                notify(
                  editingIndex === null ? "跟进记录已添加" : "跟进记录已更新",
                );
              }}
            >
              {editingIndex === null ? "保存记录" : "保存修改"}
            </Button>
          </>
        }
      >
        <div className="s4-form-grid">
          <FormField label="发生时间">
            <DatePicker
              label="选择发生时间"
              mode="datetime"
              value="2026-08-21 14:30"
              onChange={() => {}}
            />
          </FormField>
          <FormField label="关联业务">
            <SelectMenu
              label="可选"
              value="具身智能 VLA 算法负责人"
              options={["具身智能 VLA 算法负责人", "星澜机器人客户开发"]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="内容" required span={2}>
            <TextArea
              value={note}
              onChange={setNote}
              placeholder="记录本次沟通内容和下一步"
              rows={6}
            />
          </FormField>
        </div>
      </Modal>
      <Modal
        open={deleteIndex !== null}
        close={() => setDeleteIndex(null)}
        title="删除跟进记录"
        description="记录删除后进入变更历史，当前时间线不再显示"
        footer={
          <>
            <Button onClick={() => setDeleteIndex(null)}>取消</Button>
            <Button
              tone="danger"
              onClick={() => {
                setItems((current) =>
                  current.filter((_, index) => index !== deleteIndex),
                );
                setDeleteIndex(null);
                notify("跟进记录已删除");
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <div className="s4-delete-impact">
          <Icon name="warning" />
          <span>
            <b>{deleteIndex !== null ? items[deleteIndex]?.[1] : "跟进记录"}</b>
            <p>{deleteIndex !== null ? items[deleteIndex]?.[2] : ""}</p>
          </span>
        </div>
      </Modal>
    </div>
  );
}

function MatchingTab({ onRematch, refreshing }) {
  const navigate = useNavigate();
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchMode, setMatchMode] = useState("all");
  const [matchStep, setMatchStep] = useState("scope");
  const startMatching = () => {
    setMatchStep("running");
    window.setTimeout(() => setMatchStep("done"), 900);
  };
  const closeMatching = () => {
    setMatchOpen(false);
    setMatchStep("scope");
  };
  return (
    <div className="s4-detail-stack">
      <StateBanner
        tone="warning"
        icon="warning"
        title="1 条匹配结果需要更新"
        description="候选人资料版本已变化，历史结果继续保留，但不再作为当前判断。"
        action={
          <Button
            size="sm"
            icon="refresh"
            loading={refreshing}
            onClick={onRematch}
          >
            重新匹配
          </Button>
        }
      />
      <FieldGroup
        title="岗位匹配"
        action={
          <Button size="sm" icon="sparkles" onClick={() => setMatchOpen(true)}>
            匹配岗位
          </Button>
        }
      >
        <div className="s4-match-list">
          <article
            onClick={() => navigate("/positions/position-vla?tab=matching")}
          >
            <strong>91</strong>
            <span>
              <b>具身智能 VLA 算法负责人</b>
              <small>星澜机器人 · 当前结果</small>
              <p>
                技术方向、真机部署和团队规模高度匹配；需要确认北京工作安排。
              </p>
            </span>
            <StatusBadge tone="success">推荐</StatusBadge>
            <Icon name="chevronRight" />
          </article>
          <article>
            <strong>83</strong>
            <span>
              <b>机器人数据平台负责人</b>
              <small>拓界机器人 · 需要更新</small>
              <p>
                数据闭环经历匹配，但候选人近期管理职责变化后需要重算角色适配。
              </p>
            </span>
            <StatusBadge tone="warning">需更新</StatusBadge>
            <Icon name="chevronRight" />
          </article>
        </div>
      </FieldGroup>
      <FieldGroup title="岗位推进">
        <div className="s4-pipeline-relations">
          <article>
            <span>
              <b>具身智能 VLA 算法负责人</b>
              <small>星澜机器人</small>
            </span>
            <StatusBadge tone="warning">一面</StatusBadge>
            <p>昨天 16:20 从推荐进入一面 · 下一步：确认技术面时间</p>
            <button
              type="button"
              onClick={() => navigate("/positions/position-vla?tab=pipeline")}
            >
              查看推进
            </button>
          </article>
        </div>
      </FieldGroup>
      <Modal
        open={matchOpen}
        close={closeMatching}
        size="lg"
        title="匹配岗位"
        description="选择本次匹配范围，结果会写入候选人的匹配历史"
        footer={
          matchStep === "scope" ? (
            <>
              <Button onClick={closeMatching}>取消</Button>
              <Button tone="primary" onClick={startMatching}>
                开始匹配
              </Button>
            </>
          ) : matchStep === "done" ? (
            <Button tone="primary" onClick={closeMatching}>
              查看匹配结果
            </Button>
          ) : (
            <Button disabled>正在匹配</Button>
          )
        }
      >
        {matchStep === "scope" ? (
          <div className="s4-match-scope">
            <CustomRadio
              checked={matchMode === "all"}
              onChange={() => setMatchMode("all")}
              label="全部招聘中岗位"
              description="当前工作空间 8 个岗位，自动排除已关闭和已暂停岗位"
            />
            <CustomRadio
              checked={matchMode === "selected"}
              onChange={() => setMatchMode("selected")}
              label="指定岗位"
              description="只匹配本次选择的岗位"
            />
            {matchMode === "selected" ? (
              <FormField label="选择岗位">
                <SelectMenu
                  label="选择一个或多个岗位"
                  value={["具身智能 VLA 算法负责人"]}
                  options={[
                    "具身智能 VLA 算法负责人",
                    "机器人数据平台负责人",
                    "强化学习算法专家",
                  ]}
                  multiple
                  searchable
                  onChange={() => {}}
                />
              </FormField>
            ) : null}
          </div>
        ) : matchStep === "running" ? (
          <div className="s4-match-running">
            <ProgressBar
              value={68}
              label="正在计算角色适配、硬性门槛和综合匹配"
            />
            <small>已完成 5 / 8 个岗位，关闭窗口不会中断任务。</small>
          </div>
        ) : (
          <div className="s4-match-complete">
            <i>
              <Icon name="check" />
            </i>
            <h3>岗位匹配完成</h3>
            <p>8 个岗位中，2 个推荐、3 个有条件匹配、3 个未通过硬性门槛。</p>
            <div>
              <StatusBadge tone="success">推荐 2</StatusBadge>
              <StatusBadge tone="warning">有条件 3</StatusBadge>
              <StatusBadge tone="neutral">未通过 3</StatusBadge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CandidateAcademicRelationsTable({ mode }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const source =
    mode === "collaborators"
      ? candidateAcademicCollaborators
      : candidateAcademicOutcomes;
  const filtered = useMemo(
    () =>
      source.filter((item) => {
        const keyword = query.trim().toLowerCase();
        return (
          !keyword ||
          (mode === "collaborators"
            ? [
                item.person,
                item.collaborationType,
                item.workName,
                item.institution,
              ]
            : [item.title, item.type, item.institution, item.relation]
          )
            .join(" ")
            .toLowerCase()
            .includes(keyword)
        );
      }),
    [mode, query, source],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [mode, query]);
  return (
    <div className="s4-large-relations">
      <div className="s4-large-relations-toolbar">
        <div className="s4-inline-search">
          <Icon name="search" />
          <input
            aria-label={
              mode === "collaborators" ? "搜索合作人" : "搜索学术成果"
            }
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              mode === "collaborators"
                ? "搜索合作人、合作类型、成果或机构"
                : "搜索论文、专利、机构或作者身份"
            }
          />
        </div>
        <span className="s4-table-count">
          {mode === "collaborators" ? "28 位合作人" : "48 项学术成果"}
        </span>
      </div>
      <div className="s4-large-relations-scroll">
        <table>
          <thead>
            <tr>
              {mode === "collaborators" ? (
                <>
                  <th>合作人</th>
                  <th>合作类型</th>
                  <th>合作论文或专利</th>
                  <th>合作人机构</th>
                  <th>合作时间</th>
                  <th>操作</th>
                </>
              ) : (
                <>
                  <th>类型</th>
                  <th>论文或专利名称</th>
                  <th>所属机构</th>
                  <th>作者身份</th>
                  <th>年份</th>
                  <th>操作</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                {mode === "collaborators" ? (
                  <>
                    <td>
                      <b>{item.person}</b>
                    </td>
                    <td>
                      <StatusBadge tone="info">
                        {item.collaborationType}
                      </StatusBadge>
                    </td>
                    <td>
                      <TooltipText tip={item.workName} clampLines={2}>
                        {item.workName}
                      </TooltipText>
                    </td>
                    <td>{item.institution}</td>
                    <td>{item.updatedAt}</td>
                  </>
                ) : (
                  <>
                    <td>
                      <StatusBadge
                        tone={item.type === "专利" ? "info" : "neutral"}
                      >
                        {item.type}
                      </StatusBadge>
                    </td>
                    <td>
                      <TooltipText tip={item.title} clampLines={2}>
                        {item.title}
                      </TooltipText>
                    </td>
                    <td>{item.institution}</td>
                    <td>{item.relation}</td>
                    <td>{item.updatedAt}</td>
                  </>
                )}
                <td>
                  {item.path ? (
                    <Button size="xs" onClick={() => navigate(item.path)}>
                      打开详情
                    </Button>
                  ) : (
                    <span className="s4-table-muted">仅关系记录</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        pages={pages}
        pageSize={pageSize}
        onChange={setPage}
      />
    </div>
  );
}

function CandidateEmploymentRelationsTable() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [relationTypes, setRelationTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return candidateEmploymentRelations.filter((item) => {
      const matchesQuery =
        !keyword ||
        [item.person, item.relation, item.company, item.department, item.title]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchesRelation =
        !relationTypes.length || relationTypes.includes(item.relation);
      const matchesCompany =
        !companies.length || companies.includes(item.company);
      return matchesQuery && matchesRelation && matchesCompany;
    });
  }, [companies, query, relationTypes]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [companies, query, relationTypes]);
  return (
    <div className="s4-large-relations s4-employment-relations">
      <div className="s4-large-relations-toolbar">
        <div className="s4-employment-relations-filters">
          <div className="s4-inline-search">
            <Icon name="search" />
            <input
              aria-label="搜索同公司或同部门候选人"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索候选人、公司、部门或职位"
            />
          </div>
          <SelectMenu
            className="s4-employment-relation-filter"
            label="关系类型"
            value={relationTypes}
            options={["当前同部门", "曾经同部门", "当前同公司", "曾经同公司"]}
            multiple
            onChange={setRelationTypes}
          />
          <SelectMenu
            className="s4-employment-company-filter"
            label="共同公司"
            value={companies}
            options={["拓界机器人", "上海人工智能实验室"]}
            multiple
            onChange={setCompanies}
          />
        </div>
        <span className="s4-table-count">{filtered.length} 位候选人</span>
      </div>
      <div className="s4-large-relations-scroll">
        <table>
          <thead>
            <tr>
              <th>候选人</th>
              <th>任职关系</th>
              <th>共同公司与部门</th>
              <th>任职重叠</th>
              <th>对方当前职位</th>
              <th>资料状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td>
                  <b>{item.person}</b>
                </td>
                <td>
                  <StatusBadge
                    tone={item.relation.includes("同部门") ? "info" : "neutral"}
                  >
                    {item.relation}
                  </StatusBadge>
                </td>
                <td>
                  <b>{item.company}</b>
                  <small>{item.department}</small>
                </td>
                <td>{item.overlap}</td>
                <td>{item.title}</td>
                <td>
                  <StatusBadge
                    tone={item.status === "已核实" ? "success" : "warning"}
                  >
                    {item.status}
                  </StatusBadge>
                </td>
                <td>
                  <Button size="xs" onClick={() => navigate(item.path)}>
                    打开详情
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        pages={pages}
        pageSize={pageSize}
        onChange={setPage}
      />
    </div>
  );
}

function ContactPathTab() {
  const notify = useToast();
  const [status, setStatus] = useState("idle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const timerRef = useRef(null);
  const generated = status === "ready";
  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="可执行联系路径"
        description="联系路径不会自动生成。用户可以说明希望优先使用的人脉、关系层数和需要排除的路径。"
        action={
          generated ? (
            <Button
              size="sm"
              icon="refresh"
              onClick={() => setDialogOpen(true)}
            >
              更新联系路径
            </Button>
          ) : null
        }
      >
        {status === "running" ? (
          <RelationshipAiProcessingState
            title="正在创建联系路径"
            description="正在核对候选人的任职、合作、学术与已有沟通关系。"
            prompt={lastPrompt}
            steps={["读取候选人关系", "查找可用联系链路", "生成联系路径图"]}
            activeStep={1}
          />
        ) : generated ? (
          <RelationshipCanvas
            views={candidateContactPathViews}
            decisions={{}}
            onDecision={() => {}}
            editable
            draggable
            storageKey="hunter-prototype-candidate-linhao-contact-path"
          />
        ) : (
          <RelationshipAiEmptyState
            title="尚未创建联系路径"
            description="Hunter 会基于系统中的人物、任职、合作和沟通关系，整理一条或多条可解释路径；不会自动联系任何人。"
            actionLabel="创建联系路径"
            onAction={() => setDialogOpen(true)}
          />
        )}
      </FieldGroup>
      <RelationshipAiDialog
        open={dialogOpen}
        close={() => setDialogOpen(false)}
        title={generated ? "更新联系路径" : "创建联系路径"}
        description="用自然语言说明目标和限制，Hunter 会据此生成可审核的关系图。"
        initialPrompt={lastPrompt}
        submitLabel={generated ? "开始更新" : "开始创建"}
        onSubmit={(prompt) => {
          const updating = generated;
          setLastPrompt(prompt);
          setStatus("running");
          setDialogOpen(false);
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setStatus("ready");
            notify(updating ? "联系路径已按新要求更新" : "联系路径已创建");
          }, 2400);
        }}
      />
    </div>
  );
}

function RelationsTab({ processingRecords, onOpenProcessing }) {
  const navigate = useNavigate();
  const [relationView, setRelationView] = useState("employment");
  const runningRecord = processingRecords.find(
    (record) => record.state === "running",
  );
  const relationViews = {
    employment: {
      label: "任职关系",
      count: 42,
      title: "同公司与同部门候选人",
      description:
        "根据已确认工作经历和任职重叠时间自动整理；部门依据不足时只显示同公司关系。",
    },
    outcomes: {
      label: "学术成果",
      count: 48,
      title: "学术成果",
      description:
        "共 48 项论文与专利，按成果名称、机构、作者身份和年份独立查看。",
    },
    collaborators: {
      label: "合作人",
      count: 28,
      title: "合作人",
      description: "共 28 位合作人，明确展示合作类型以及对应的论文或专利。",
    },
  };
  const activeRelationView = relationViews[relationView];
  return (
    <div className="s4-detail-stack">
      {runningRecord ? (
        <AssetAiProcessBanner
          state="running"
          title="正在更新候选人关联信息"
          description="正在结合候选人资料、论文、专利和已确认关系，更新学术成果与合作人。"
          target={runningRecord.target}
          onDetails={() => onOpenProcessing(runningRecord)}
        />
      ) : null}
      <FieldGroup title="关联公司">
        <div className="s4-entity-grid">
          <EntityLink
            icon="building"
            title="拓界机器人"
            meta="当前工作经历 · 正式关联"
            onClick={() => navigate("/companies/company-tuojie")}
          />
          <EntityLink
            icon="building"
            title="上海人工智能实验室"
            meta="历史工作经历 · 正式关联"
            onClick={() => navigate("/companies/company-ailab")}
          />
        </div>
      </FieldGroup>
      <FieldGroup title="人物与成果关系">
        <div className="s4-relation-switcher">
          <div
            className="app-tabs s4-relation-view-tabs"
            role="tablist"
            aria-label="候选人关系类型"
          >
            {Object.entries(relationViews).map(([key, item]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={relationView === key}
                className={relationView === key ? "is-active" : ""}
                onClick={() => setRelationView(key)}
              >
                {item.label}
                <em>{item.count}</em>
              </button>
            ))}
          </div>
          <section
            className="s4-relation-view-panel"
            role="tabpanel"
            aria-label={activeRelationView.title}
          >
            <header>
              <h3>{activeRelationView.title}</h3>
              <p>{activeRelationView.description}</p>
            </header>
            {relationView === "employment" ? (
              <CandidateEmploymentRelationsTable />
            ) : (
              <CandidateAcademicRelationsTable mode={relationView} />
            )}
          </section>
        </div>
      </FieldGroup>
      <FieldGroup title="知识图谱">
        <div className="s4-entity-grid">
          <EntityLink
            icon="route"
            title="VLA 核心候选人关系知识图谱"
            meta="候选人关系 · 3 处引用 · 已自动同步"
            onClick={() =>
              navigate(
                "/mappings/mapping-candidate-relations?node=person-linhao",
              )
            }
          />
        </div>
      </FieldGroup>
      <FieldGroup
        title="来源与证据"
        action={
          <Button
            size="sm"
            onClick={() => navigate("/sources/candidate-linhao")}
          >
            查看全部证据
          </Button>
        }
      >
        <SourceList
          items={[
            {
              title: "当前简历",
              description: "林昊_机器人学习负责人_2026.pdf",
              meta: "2026-08-18 · 用户上传",
              status: "可访问",
            },
            {
              title: "公开职业资料",
              description: "LinkedIn 公开履历和 GitHub 主页",
              meta: "2026-08-19 · 信息补全 AI 处理",
              status: "已验证",
            },
            {
              title: "用户确认",
              description: "电话核实当前职位与求职偏好",
              meta: "2026-08-20 · 沈岚",
              status: "已确认",
            },
          ]}
          onOpen={() => navigate("/sources/candidate-linhao")}
        />
      </FieldGroup>
      <FieldGroup
        title="AI 处理记录"
        description="当前候选人的信息补全和匹配计算记录，不进入任务列表。"
      >
        <AssetAiProcessHistory
          records={processingRecords}
          onOpen={onOpenProcessing}
        />
      </FieldGroup>
    </div>
  );
}

export function CandidateDetailPage() {
  const { candidateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const state = params.get("state") || "normal";
  const aiState = params.get("ai") || "idle";
  const aiPanel = params.get("panel") || "";
  const aiTimerRef = useRef(null);
  const linkedCandidate = location.state?.candidate;
  const candidate = linkedCandidate
    ? { ...candidateDetail, ...linkedCandidate }
    : candidateId === candidateDetail.id || candidateId === "candidate-linhao"
      ? candidateDetail
      : candidates.find((item) => item.id === candidateId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rematchOpen, setRematchOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(state === "matching-running");
  const updateQuery = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "")
        next.delete(key);
      else next.set(key, value);
    });
    setParams(next);
  };
  const setAiState = (nextState) =>
    updateQuery({
      tab: "profile",
      ai: nextState === "idle" ? null : nextState,
      panel: null,
      process: null,
    });
  const startAiProcessing = () => {
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    setAiState("running");
    aiTimerRef.current = window.setTimeout(() => {
      updateQuery({ tab: "profile", ai: "review", panel: null, process: null });
      notify("候选人信息补全完成，6 项建议等待审核", "info");
    }, 4200);
  };
  useEffect(
    () => () => {
      if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    },
    [],
  );
  useEffect(() => {
    if (state !== "matching-running") return undefined;
    setRefreshing(true);
    const timer = window.setTimeout(() => {
      setRefreshing(false);
      notify("人岗匹配完成，8 个岗位中有 5 个结果值得查看");
      const next = new URLSearchParams(params);
      next.delete("state");
      setParams(next);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [state]);
  useEffect(() => {
    const active = ["running", "review", "failed"].includes(aiState);
    const payload = active
      ? {
          state: aiState,
          title: "候选人信息补全",
          target: "林昊",
          route: `/candidates/candidate-linhao?tab=profile&ai=${aiState}&panel=details&process=candidate-enrichment-v7`,
        }
      : null;
    if (payload)
      sessionStorage.setItem(
        "hunter-active-ai-process",
        JSON.stringify(payload),
      );
    else sessionStorage.removeItem("hunter-active-ai-process");
    window.dispatchEvent(
      new CustomEvent("hunter:ai-processing", { detail: payload }),
    );
  }, [aiState]);
  if (!candidate)
    return (
      <NotFoundState label="候选人" onBack={() => navigate("/candidates")} />
    );
  if (state === "loading")
    return (
      <div className="s4-detail-loading" aria-label="候选人详情正在加载">
        <header>
          <i />
          <span>
            <b />
            <small />
            <em />
          </span>
        </header>
        <nav>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <span key={item} />
          ))}
        </nav>
        <section>
          <header>
            <b />
            <i />
          </header>
          <div className="s4-detail-loading-grid">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <span key={item} />
            ))}
          </div>
        </section>
        <section>
          <header>
            <b />
            <i />
          </header>
          <div className="s4-detail-loading-lines">
            <span />
            <span />
            <span />
          </div>
        </section>
      </div>
    );
  if (state === "error")
    return (
      <div className="s4-detail-error">
        <Icon name="warning" />
        <h1>候选人资料加载失败</h1>
        <p>已经保留列表搜索上下文，可以重新加载或返回列表。</p>
        <Button
          tone="primary"
          icon="refresh"
          onClick={() => setParams({ tab })}
        >
          重新加载
        </Button>
      </div>
    );
  const aiRecord = buildCandidateAiRecord(
    ["running", "review", "failed"].includes(aiState) ? aiState : "complete",
  );
  const processingRecords = ["running", "review", "failed"].includes(aiState)
    ? [aiRecord, buildCandidateAiRecord("complete")]
    : [buildCandidateAiRecord("complete")];
  const selectedProcessId = params.get("process");
  const selectedProcessingRecord =
    processingRecords.find((record) => record.id === selectedProcessId) ||
    processingRecords[0];
  return (
    <div className="s4-detail-page">
      {state === "limited" ? (
        <StateBanner
          tone="warning"
          icon="warning"
          title="部分敏感资料已隐藏"
          description="当前账号可以查看候选人业务摘要，但不能查看联系方式、简历原文和沟通记录。"
        />
      ) : null}
      <DetailHeader
        icon="users"
        title={candidate.name}
        subtitle={`${candidate.company} · ${candidate.title}`}
        badges={[
          { label: candidate.preference || "资料已确认", tone: "success" },
          { label: "资料版本 v6", tone: "info" },
        ]}
        onBack={() => navigate("/candidates")}
        onDelete={() => setDeleteOpen(true)}
      >
        <Button icon="sparkles" onClick={() => setAiState("setup")}>
          信息补全
        </Button>
      </DetailHeader>
      <nav
        className="s4-candidate-attention-index"
        aria-label="候选人待处理区域"
      >
        <span>
          <Icon name="warning" />
          <b>2 个区域有待处理事项</b>
        </span>
        <div>
          <button
            type="button"
            aria-label={`候选人资料，${state === "identity-conflict" ? 8 : 7} 项待处理`}
            onClick={() => setParams({ tab: "profile" })}
          >
            候选人资料
            <em>{state === "identity-conflict" ? 8 : 7}</em>
          </button>
          <button
            type="button"
            aria-label="匹配与推进，1 项待处理"
            onClick={() => setParams({ tab: "matching" })}
          >
            匹配与推进
            <em>1</em>
          </button>
        </div>
      </nav>
      <DetailTabs
        tabs={candidateTabs}
        value={tab}
        onChange={(value) =>
          updateQuery({ tab: value, panel: null, process: null })
        }
      />
      {tab === "profile" && aiState === "review" && aiPanel === "review" ? (
        <AssetAiReviewWorkspace
          assetLabel="候选人资料"
          currentVersion="v6"
          nextVersion="v7"
          title="审核候选人补全结果"
          suggestions={candidateAiSuggestions}
          initialSelected={[
            "当前公司与职位",
            "工作经历",
            "教育经历",
            "技能与行业",
            "公开资料链接",
          ]}
          sourceLabel="当前简历 · 公开职业资料"
          onBack={() => updateQuery({ panel: null, process: null })}
          onApply={(selected) => {
            updateQuery({ tab: "profile", ai: "complete", panel: null });
            notify(`已确认 ${selected.length} 项建议，候选人资料更新为 v7`);
          }}
        />
      ) : null}
      {tab === "profile" && !(aiState === "review" && aiPanel === "review") ? (
        <ProfileTab
          candidate={{ ...candidateDetail, ...candidate }}
          hasIdentityIssue={state === "identity-conflict"}
          aiState={aiState}
          aiRecord={aiRecord}
          onOpenAiDetails={() =>
            updateQuery({ panel: "details", process: aiRecord.id })
          }
          onOpenAiReview={() => updateQuery({ panel: "review" })}
          onStopAi={() => {
            if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
            setAiState("idle");
            notify("候选人信息补全已停止，正式资料没有变化", "info");
          }}
          onRetryAi={startAiProcessing}
        />
      ) : null}
      {tab === "experience" ? (
        <ExperienceTab candidate={candidateDetail} />
      ) : null}
      {tab === "files" ? <FilesTab candidate={candidateDetail} /> : null}
      {tab === "timeline" ? <TimelineTab candidate={candidateDetail} /> : null}
      {tab === "matching" ? (
        <MatchingTab
          refreshing={refreshing}
          onRematch={() => setRematchOpen(true)}
        />
      ) : null}
      {tab === "relations" ? (
        <RelationsTab
          processingRecords={processingRecords}
          onOpenProcessing={(record) =>
            updateQuery({ panel: "details", process: record.id })
          }
        />
      ) : null}
      {tab === "contact-path" ? <ContactPathTab /> : null}
      <CandidateAiStartModal
        open={aiState === "setup"}
        close={() => setAiState("idle")}
        onStart={startAiProcessing}
      />
      <AssetAiProcessDrawer
        open={aiPanel === "details"}
        close={() => updateQuery({ panel: null, process: null })}
        record={selectedProcessingRecord}
        primaryLabel={
          selectedProcessingRecord.state === "review"
            ? "审核补全结果"
            : selectedProcessingRecord.state === "failed"
              ? "重新运行"
              : undefined
        }
        onPrimary={() => {
          if (selectedProcessingRecord.state === "review")
            updateQuery({ tab: "profile", panel: "review" });
          else startAiProcessing();
        }}
      />
      <Modal
        open={rematchOpen}
        close={() => setRematchOpen(false)}
        title="重新匹配过期结果"
        description="使用候选人资料版本 v6 重新计算 1 个已过期岗位结果"
        footer={
          <>
            <Button onClick={() => setRematchOpen(false)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                setRematchOpen(false);
                setRefreshing(true);
                notify("重新匹配任务已开始", "info");
                window.setTimeout(() => {
                  setRefreshing(false);
                  notify("1 个岗位匹配结果已更新");
                }, 900);
              }}
            >
              确认重新匹配
            </Button>
          </>
        }
      >
        <div className="s4-rematch-impact">
          <article>
            <span>
              <b>机器人数据平台负责人</b>
              <small>拓界机器人</small>
            </span>
            <StatusBadge tone="warning">资料版本过期</StatusBadge>
          </article>
          <p>历史分数和推荐理由继续保留；新结果生成后成为当前判断。</p>
        </div>
      </Modal>
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="候选人"
        assetName={candidate.name}
        impact="岗位推进、匹配历史和关联任务会保留已删除引用；公司、岗位、论文和专利不会被删除。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("候选人已进入回收站");
          navigate("/candidates");
        }}
      />
    </div>
  );
}

export function CandidateCreatePage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") || "manual");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const create = () => {
    setSubmitted(true);
    if (
      !name.trim() ||
      (!company.trim() && !title.trim() && !phone.trim() && !email.trim())
    )
      return;
    if (name.includes("林昊")) {
      setDuplicate(true);
      return;
    }
    notify("候选人已创建");
    navigate("/candidates/candidate-linhao");
  };
  return (
    <div className="s4-create-page">
      <AssetPageHeader
        eyebrow="候选人"
        title="新建候选人"
        description="手动录入身份资料，或上传简历后审核新增与变化。"
        actions={<Button onClick={() => navigate("/candidates")}>取消</Button>}
      />
      <div className="s4-create-layout">
        <aside className="s4-create-modes">
          <button
            type="button"
            className={mode === "manual" ? "is-active" : ""}
            onClick={() => setMode("manual")}
          >
            <Icon name="edit" />
            <span>
              <b>手动新建</b>
              <small>填写已知资料</small>
            </span>
          </button>
          <button
            type="button"
            className={mode === "upload" ? "is-active" : ""}
            onClick={() => setMode("upload")}
          >
            <Icon name="upload" />
            <span>
              <b>上传简历</b>
              <small>解析后确认写入</small>
            </span>
          </button>
        </aside>
        <section className="s4-create-workspace">
          {mode === "manual" ? (
            <>
              <header>
                <h2>候选人身份与当前资料</h2>
                <p>只有姓名不能创建正式候选人，至少还需要一项可识别信息。</p>
              </header>
              <div className="s4-form-grid">
                <FormField
                  label="姓名"
                  required
                  error={submitted && !name.trim() ? "请输入候选人姓名" : ""}
                >
                  <TextInput
                    value={name}
                    onChange={setName}
                    placeholder="例如：林昊"
                  />
                </FormField>
                <FormField label="英文名">
                  <TextInput value="" onChange={() => {}} placeholder="可选" />
                </FormField>
                <FormField label="当前公司原文">
                  <TextInput
                    value={company}
                    onChange={setCompany}
                    placeholder="保留资料中的原始写法"
                  />
                </FormField>
                <FormField label="当前职位">
                  <TextInput value={title} onChange={setTitle} />
                </FormField>
                <FormField label="手机">
                  <TextInput value={phone} onChange={setPhone} />
                </FormField>
                <FormField label="邮箱">
                  <TextInput value={email} onChange={setEmail} />
                </FormField>
                <FormField label="地点">
                  <TextInput value="" onChange={() => {}} />
                </FormField>
                <FormField label="出生年份">
                  <DatePicker
                    label="选择出生年份"
                    mode="year"
                    value=""
                    initialYear={1990}
                    onChange={() => {}}
                  />
                </FormField>
                <FormField label="用户备注" span={2}>
                  <TextArea value="" onChange={() => {}} rows={5} />
                </FormField>
              </div>
              {submitted &&
              !company.trim() &&
              !title.trim() &&
              !phone.trim() &&
              !email.trim() ? (
                <StateBanner
                  tone="danger"
                  icon="warning"
                  title="资料不足，不能创建正式候选人"
                  description="请至少补充公司、职位、手机或邮箱中的一项；否则可以先保留为人物线索。"
                  action={
                    <Button
                      size="sm"
                      onClick={() => notify("已保存为人物线索")}
                    >
                      保存为人物线索
                    </Button>
                  }
                />
              ) : null}
              <footer>
                <Button tone="primary" onClick={create}>
                  创建候选人
                </Button>
              </footer>
            </>
          ) : (
            <UploadCandidate files={files} setFiles={setFiles} />
          )}
        </section>
      </div>
      <Modal
        open={duplicate}
        close={() => setDuplicate(false)}
        size="lg"
        title="可能已存在同一位候选人"
        description="Hunter 不会静默跳过，也不会直接创建重复档案"
        footer={
          <>
            <Button onClick={() => setDuplicate(false)}>返回补充资料</Button>
            <Button
              tone="primary"
              onClick={() => navigate("/reviews/identity/candidate-linhao")}
            >
              审核并合并
            </Button>
          </>
        }
      >
        <div className="s4-duplicate-compare">
          <article>
            <small>本次输入</small>
            <b>{name}</b>
            <p>
              {company || "未填写公司"} · {title || "未填写职位"}
            </p>
          </article>
          <Icon name="refresh" />
          <article>
            <small>已有候选人</small>
            <b>林昊</b>
            <p>拓界机器人 · 机器人学习负责人</p>
            <StatusBadge tone="success">手机后四位一致</StatusBadge>
          </article>
        </div>
      </Modal>
    </div>
  );
}

function UploadCandidate({ files, setFiles }) {
  const navigate = useNavigate();
  const notify = useToast();
  const [params] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);
  const initialMatchMode = params.get("match") || "none";
  const [matchEnabled, setMatchEnabled] = useState(
    initialMatchMode === "all" || initialMatchMode === "selected",
  );
  const [matchScope, setMatchScope] = useState(
    initialMatchMode === "selected" ? "selected" : "all",
  );
  const [selectedPositions, setSelectedPositions] = useState(
    initialMatchMode === "selected"
      ? ["具身智能 VLA 算法负责人 · 星澜机器人"]
      : [],
  );
  const [matchError, setMatchError] = useState("");
  const process = () => {
    if (!files.length) {
      setFailed(true);
      return;
    }
    if (
      matchEnabled &&
      matchScope === "selected" &&
      !selectedPositions.length
    ) {
      setMatchError("请至少选择一个岗位");
      return;
    }
    setMatchError("");
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      notify("简历解析完成，发现已有候选人和 7 项变化", "info");
      const next = new URLSearchParams({ from: "upload" });
      if (matchEnabled) next.set("match", matchScope);
      if (matchEnabled && matchScope === "selected")
        next.set("positions", String(selectedPositions.length));
      navigate(`/reviews/identity/candidate-linhao?${next.toString()}`);
    }, 900);
  };
  return (
    <>
      <header>
        <h2>上传候选人简历</h2>
        <p>系统先判断是否为简历，再做解析、查重和变化审核。</p>
      </header>
      <FileDrop
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setFailed(false);
        }}
        accept="PDF、DOCX"
        error={failed ? "请先选择一份 PDF 或 DOCX 简历" : ""}
      />
      <div className="s4-upload-rules">
        <span>
          <Icon name="check" />
          非简历文件会在解析前被阻止
        </span>
        <span>
          <Icon name="check" />
          发现同一候选人时进入合并审核
        </span>
        <span>
          <Icon name="check" />
          没有新内容时明确返回处理结果
        </span>
      </div>
      <PostWriteMatchingOptions
        entityType="candidate"
        enabled={matchEnabled}
        onEnabledChange={(next) => {
          setMatchEnabled(next);
          setMatchError("");
        }}
        scope={matchScope}
        onScopeChange={(next) => {
          setMatchScope(next);
          setMatchError("");
        }}
        selectedPositions={selectedPositions}
        onSelectedPositionsChange={(next) => {
          setSelectedPositions(next);
          setMatchError("");
        }}
        error={matchError}
      />
      <footer>
        <Button tone="primary" loading={processing} onClick={process}>
          {processing ? "正在判断并解析" : "上传并解析"}
        </Button>
      </footer>
    </>
  );
}

export function IdentityMergeReviewPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [params] = useSearchParams();
  const [section, setSection] = useState("changes");
  const [choices, setChoices] = useState({
    company: "existing",
    phone: "new",
    title: "new",
    summary: "new",
  });
  const [busy, setBusy] = useState(false);
  const matchMode = params.get("match") || "none";
  const matchEnabled = matchMode === "all" || matchMode === "selected";
  const items = [
    {
      key: "company",
      field: "当前公司",
      existing: "拓界机器人",
      incoming: "拓界机器人（上海）有限公司",
      source: "新简历",
      confidence: "正式公司关系不变",
    },
    {
      key: "phone",
      field: "手机",
      existing: "138 **** 6217",
      incoming: "138 1688 6217",
      source: "新简历",
      confidence: "后四位一致",
    },
    {
      key: "title",
      field: "当前职位",
      existing: "机器人学习负责人",
      incoming: "机器人学习与数据平台负责人",
      source: "新简历",
      confidence: "新资料更新",
    },
    {
      key: "summary",
      field: "职业概览",
      existing: "负责机器人学习团队与真机数据闭环。",
      incoming: "负责机器人学习、数据平台和 14 人算法团队。",
      source: "新简历",
      confidence: "新增团队规模",
    },
  ];
  return (
    <div className="s4-review-workspace">
      <header className="s4-review-header">
        <button
          type="button"
          onClick={() => navigate("/candidates/candidate-linhao?tab=files")}
        >
          <Icon name="chevronLeft" />
          返回候选人
        </button>
        <span>
          <small>身份与合并审核</small>
          <h1>林昊 · 新简历资料合并</h1>
          <p>
            稳定身份和手机后四位交叉确认，系统判断为同一人。请审核变化后写入已有档案。
          </p>
        </span>
        <StatusBadge tone="warning">等待确认</StatusBadge>
      </header>
      <div className="s4-review-summary">
        <article>
          <small>保留档案</small>
          <b>林昊</b>
          <p>拓界机器人 · 资料版本 v6</p>
        </article>
        <Icon name="refresh" />
        <article>
          <small>本次资料</small>
          <b>
            {params.get("from") === "upload"
              ? "林昊_2026_更新简历.pdf"
              : "用户上传简历"}
          </b>
          <p>发现 3 项更新 · 1 项冲突</p>
        </article>
        <dl>
          <div>
            <dt>正式关系</dt>
            <dd>7 条保留</dd>
          </div>
          <div>
            <dt>业务推进</dt>
            <dd>1 条保留</dd>
          </div>
          <div>
            <dt>文件</dt>
            <dd>新增 1 份</dd>
          </div>
        </dl>
      </div>
      <div
        className="s4-review-tabs app-tabs"
        role="tablist"
        aria-label="资料合并审核内容"
      >
        <button
          type="button"
          role="tab"
          aria-selected={section === "changes"}
          className={section === "changes" ? "is-active" : ""}
          onClick={() => setSection("changes")}
        >
          字段变化 <em>4</em>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === "relations"}
          className={section === "relations" ? "is-active" : ""}
          onClick={() => setSection("relations")}
        >
          关系与文件 <em>9</em>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === "sources"}
          className={section === "sources" ? "is-active" : ""}
          onClick={() => setSection("sources")}
        >
          判断依据 <em>3</em>
        </button>
      </div>
      {section === "changes" ? (
        <div className="s4-change-review-list">
          {items.map((item) => (
            <article key={item.key}>
              <header>
                <span>
                  <b>{item.field}</b>
                  <small>
                    {item.source} · {item.confidence}
                  </small>
                </span>
                <StatusBadge
                  tone={item.key === "company" ? "warning" : "success"}
                >
                  {item.key === "company" ? "需要选择" : "建议更新"}
                </StatusBadge>
              </header>
              <div>
                <CustomRadio
                  label="保留现有内容"
                  description={item.existing}
                  checked={choices[item.key] === "existing"}
                  onChange={() =>
                    setChoices((current) => ({
                      ...current,
                      [item.key]: "existing",
                    }))
                  }
                />
                <CustomRadio
                  label="采用本次内容"
                  description={item.incoming}
                  checked={choices[item.key] === "new"}
                  onChange={() =>
                    setChoices((current) => ({ ...current, [item.key]: "new" }))
                  }
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {section === "relations" ? (
        <div className="s4-preserved-relations">
          <StateBanner
            title="正式关系不会因资料合并而丢失"
            description="岗位推进、匹配历史、公司经历、论文、专利、知识图谱和关联任务继续关联到保留档案。"
          />
          <div className="s4-entity-grid">
            <EntityLink
              icon="briefcase"
              title="具身智能 VLA 算法负责人"
              meta="一面 · 保留"
            />
            <EntityLink
              icon="building"
              title="拓界机器人"
              meta="当前工作经历 · 保留"
            />
            <EntityLink
              icon="paper"
              title="2 篇论文"
              meta="稳定作者身份 · 保留"
            />
            <EntityLink
              icon="file"
              title="新增简历文件"
              meta="作为新版本保存"
            />
          </div>
        </div>
      ) : null}
      {section === "sources" ? (
        <SourceList
          items={[
            {
              title: "手机身份",
              description: "本次资料与已有档案手机完整号码一致",
              meta: "强身份依据",
              status: "已确认",
            },
            {
              title: "工作轨迹",
              description: "拓界机器人与上海人工智能实验室经历时间线一致",
              meta: "两段经历交叉验证",
              status: "已确认",
            },
            {
              title: "公开身份",
              description: "LinkedIn 与 Google Scholar 身份保持一致",
              meta: "公开资料",
              status: "已验证",
            },
          ]}
        />
      ) : null}
      {matchEnabled ? (
        <div className="s4-review-post-action">
          <Icon name="sparkles" />
          <span>
            <b>完成合并后立即人岗匹配</b>
            <small>
              {matchMode === "selected"
                ? `将使用资料版本 v7 匹配已选择的 ${params.get("positions") || "1"} 个岗位。`
                : "将使用资料版本 v7 匹配全部 8 个招聘中岗位。"}
            </small>
          </span>
          <StatusBadge tone="info">等待正式写入</StatusBadge>
        </div>
      ) : null}
      <footer className="s4-review-footer">
        <span>
          <b>合并后形成资料版本 7</b>
          <small>当前选择：采用 3 项本次内容，保留 1 项现有内容</small>
        </span>
        <div>
          <Button onClick={() => navigate("/candidates/candidate-linhao")}>
            取消
          </Button>
          <Button
            tone="primary"
            loading={busy}
            onClick={() => {
              setBusy(true);
              window.setTimeout(() => {
                notify(
                  matchEnabled
                    ? "资料已合并，人岗匹配已经开始"
                    : "资料已合并，可在变化记录中撤销",
                );
                navigate(
                  matchEnabled
                    ? "/candidates/candidate-linhao?tab=matching&state=matching-running"
                    : "/candidates/candidate-linhao",
                );
              }, 700);
            }}
          >
            确认合并
          </Button>
        </div>
      </footer>
    </div>
  );
}

export function FieldChangeReviewPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [accepted, setAccepted] = useState(
    new Set(["work", "education", "paper", "patent", "skill", "team"]),
  );
  const [evidence, setEvidence] = useState(null);
  const changes = [
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
    },
  ];
  return (
    <div className="s4-review-workspace">
      <header className="s4-review-header">
        <button type="button" onClick={() => navigate(-1)}>
          <Icon name="chevronLeft" />
          返回
        </button>
        <span>
          <small>字段变化审核</small>
          <h1>林昊 · 7 项资料建议</h1>
          <p>每项变化保留来源；未选择的建议不会写入正式档案。</p>
        </span>
      </header>
      <div className="s4-field-change-table">
        <header>
          <span>字段</span>
          <span>当前内容</span>
          <span>建议内容</span>
          <span>处理</span>
        </header>
        {changes.map((item) => (
          <article key={item.id}>
            <b>
              {item.field}
              <button type="button" onClick={() => setEvidence(item)}>
                {item.source}
              </button>
            </b>
            <p>{item.before}</p>
            <p>{item.after}</p>
            <button
              type="button"
              className={accepted.has(item.id) ? "is-accepted" : ""}
              onClick={() => {
                const next = new Set(accepted);
                if (next.has(item.id)) next.delete(item.id);
                else next.add(item.id);
                setAccepted(next);
              }}
            >
              {accepted.has(item.id) ? (
                <>
                  <Icon name="check" />
                  采用
                </>
              ) : (
                "不采用"
              )}
            </button>
          </article>
        ))}
      </div>
      <footer className="s4-review-footer">
        <span>
          <b>将写入 {accepted.size} 项变化</b>
          <small>所有决定进入变化记录</small>
        </span>
        <div>
          <Button onClick={() => navigate(-1)}>取消</Button>
          <Button
            tone="primary"
            disabled={!accepted.size}
            onClick={() => {
              notify("字段变化已写入候选人档案");
              navigate("/candidates/candidate-linhao");
            }}
          >
            应用变化
          </Button>
        </div>
      </footer>
      <Modal
        open={Boolean(evidence)}
        close={() => setEvidence(null)}
        title={`${evidence?.field || "字段"}的判断依据`}
        description={evidence?.source}
        footer={<Button onClick={() => setEvidence(null)}>关闭</Button>}
      >
        <div className="s4-evidence-preview">
          <i>
            <Icon name="file" />
          </i>
          <span>
            <b>支持本次变化的原始片段</b>
            <p>{evidence?.evidence}</p>
            <small>来源原文只用于本次审核，不会代替正式字段内容。</small>
          </span>
        </div>
      </Modal>
    </div>
  );
}

export function SourceEvidencePage() {
  const navigate = useNavigate();
  const [activeField, setActiveField] = useState("当前职位");
  const [preview, setPreview] = useState(null);
  const evidenceByField = {
    当前职位: {
      value: "机器人学习负责人",
      count: 2,
      sources: [
        {
          title: "林昊_机器人学习负责人_2026.pdf",
          description: "“机器人学习负责人，负责算法与数据平台团队”",
          meta: "第 1 页 · 2026-08-18 上传",
          status: "直接证据",
        },
        {
          title: "LinkedIn 公开职业资料",
          description: "Robotics Learning Lead at Tuojie Robotics",
          meta: "2026-08-19 获取 · 页面可访问",
          status: "交叉验证",
        },
      ],
    },
    团队规模: {
      value: "18 人",
      count: 1,
      sources: [
        {
          title: "候选人沟通记录",
          description: "“目前直接管理 18 人的机器人学习团队。”",
          meta: "2026-08-19 · 猎头人工记录",
          status: "用户确认",
        },
      ],
    },
    关键技能: {
      value: "VLA、强化学习、PyTorch",
      count: 1,
      sources: [
        {
          title: "林昊_机器人学习负责人_2026.pdf",
          description: "项目和工作经历中持续使用 VLA、强化学习与 PyTorch。",
          meta: "第 2-3 页 · 2026-08-18 上传",
          status: "直接证据",
        },
      ],
    },
    求职偏好: {
      value: "上海优先，可考虑北京",
      count: 1,
      sources: [
        {
          title: "候选人沟通记录",
          description: "优先考虑上海岗位，对北京的核心团队保持开放。",
          meta: "2026-08-20 · 猎头人工记录",
          status: "用户确认",
        },
      ],
    },
    工作经历: {
      value: "拓界机器人 · 机器人学习负责人",
      count: 2,
      sources: [
        {
          title: "林昊_机器人学习负责人_2026.pdf",
          description: "工作经历区块包含职责、团队规模和主要成果",
          meta: "第 1-2 页 · 2026-08-18 上传",
          status: "直接证据",
          icon: "file",
        },
        {
          title: "拓界机器人团队公开介绍",
          description: "公开页面中的负责人信息与履历时间一致",
          meta: "https://tuojie.example.com/team · 2026-08-19 获取",
          status: "交叉验证",
        },
      ],
    },
    教育经历: {
      value: "上海交通大学 · 控制科学与工程 · 硕士",
      count: 1,
      sources: [
        {
          title: "林昊_机器人学习负责人_2026.pdf",
          description: "教育经历区块提供学校、专业、学历和时间",
          meta: "第 3 页 · 2026-08-18 上传",
          status: "直接证据",
          icon: "file",
        },
      ],
    },
    论文成果: {
      value: "3 篇已确认论文",
      count: 2,
      sources: [
        {
          title: "OpenAlex 作者与论文记录",
          description: "作者、机构、标题和 DOI 与候选人公开主页一致",
          meta: "OpenAlex · 2026-08-20 获取",
          status: "已验证",
          icon: "paper",
        },
        {
          title: "Google Scholar 公开主页",
          description: "显示相同论文标题和作者顺序",
          meta: "公开网页 · 2026-08-20 获取",
          status: "交叉验证",
        },
      ],
    },
    专利成果: {
      value: "1 项已确认发明专利",
      count: 1,
      sources: [
        {
          title: "国家知识产权公开信息",
          description: "申请号、申请人和发明人顺序均可核验",
          meta: "公开专利页面 · 2026-08-20 获取",
          status: "已验证",
          icon: "patent",
        },
      ],
    },
  };
  const activeEvidence = evidenceByField[activeField];
  return (
    <div className="s4-detail-page">
      <DetailHeader
        icon="link"
        title="来源与证据"
        subtitle="林昊 · 候选人资料"
        badges={[{ label: "3 个来源", tone: "info" }]}
        onBack={() => navigate(-1)}
      />
      <div className="s4-source-layout">
        <aside>
          <h2>资料字段</h2>
          {Object.entries(evidenceByField).map(([item, evidence]) => (
            <button
              type="button"
              className={item === activeField ? "is-active" : ""}
              key={item}
              onClick={() => setActiveField(item)}
            >
              <span>
                <b>{item}</b>
                <small>{evidence.count} 项证据</small>
              </span>
              <Icon name="chevronRight" />
            </button>
          ))}
        </aside>
        <section>
          <FieldGroup title={`${activeField}：${activeEvidence.value}`}>
            <SourceList
              items={activeEvidence.sources}
              onOpen={(item) => setPreview({ ...item, field: activeField })}
            />
          </FieldGroup>
          <FieldGroup title="证据状态">
            <DefinitionGrid
              columns={2}
              items={[
                ["最近核实", "2026-08-19"],
                ["可信状态", "已验证"],
                ["支持字段", "当前公司、当前职位"],
                ["处理记录", "候选人信息补全 · 2026-08-19"],
              ]}
            />
          </FieldGroup>
        </section>
      </div>
      <Modal
        open={Boolean(preview)}
        close={() => setPreview(null)}
        size="lg"
        title={preview?.title || "查看证据"}
        description={`${preview?.field || "候选人字段"} · ${preview?.meta || ""}`}
        footer={<Button onClick={() => setPreview(null)}>关闭</Button>}
      >
        <div className="s4-evidence-document">
          <header>
            <i>
              <Icon name={preview?.icon || "link"} />
            </i>
            <span>
              <b>证据原文</b>
              <small>{preview?.status}</small>
            </span>
          </header>
          <blockquote>{preview?.description}</blockquote>
          <dl>
            <div>
              <dt>支持字段</dt>
              <dd>{preview?.field}</dd>
            </div>
            <div>
              <dt>获取信息</dt>
              <dd>{preview?.meta}</dd>
            </div>
            <div>
              <dt>访问状态</dt>
              <dd>当前可访问</dd>
            </div>
          </dl>
        </div>
      </Modal>
    </div>
  );
}
