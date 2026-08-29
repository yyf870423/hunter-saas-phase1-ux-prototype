import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  buildRecommendationReportVersions,
  buildRevisedRecommendationReport,
  RecommendationReportFile,
} from "../components/RecommendationReportFile";
import {
  ActivityTimeline,
  AssetPageHeader,
  Button,
  CustomCheckbox,
  DefinitionGrid,
  DeleteAssetModal,
  DetailHeader,
  DetailTabs,
  Drawer,
  FieldGroup,
  FormField,
  Modal,
  NotFoundState,
  Pagination,
  ProgressBar,
  SelectMenu,
  StateBanner,
  StatusBadge,
  StatusFromText,
  TagList,
  TextArea,
  TextInput,
  useToast,
} from "./asset-ui";
import {
  AssetAiProcessBanner,
  AssetAiProcessDrawer,
  AssetAiProcessHistory,
} from "./AssetAiProcessing";
import { matchResults, positionDetail, positions } from "./data";

const tabs = [
  { value: "profile", label: "岗位资料" },
  { value: "pipeline", label: "候选人流程", count: 11 },
  { value: "matching", label: "匹配结果", count: 128 },
  { value: "work", label: "相关工作" },
];

const positionAiWorkTitle = "星澜机器人 · 具身智能团队招聘";
const positionAiSupplement =
  "客户强调这是能直接参与技术路线决策的负责人岗位，需要同时判断候选人的技术深度、真机落地经验和团队管理跨度。";

function buildPositionAiRecord(state = "complete") {
  const planByState = {
    running: ["complete", "running", "pending", "pending"],
    review: ["complete", "complete", "complete", "complete"],
    failed: ["complete", "failed", "pending", "pending"],
    complete: ["complete", "complete", "complete", "complete"],
  };
  const planStates = planByState[state] || planByState.complete;
  const plan = [
    ["读取岗位资料", "已读取 JD v3、三项确认要求和现有岗位解析。"],
    [
      "分析岗位定位",
      state === "failed"
        ? "模型响应中断，已保留读取结果和原始输入。"
        : "分析岗位层级、职责边界、上下游关系与可能风险。",
    ],
    ["生成寻访建议", "生成软性与隐性要求、对标企业和寻访关键词。"],
    ["形成审核结果", "把建议转换为字段级差异，等待用户确认后写入。"],
  ].map(([title, detail], index) => {
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
  const currentRun = {
    id: "run-4",
    label: "运行 #4",
    time:
      state === "running"
        ? "今天 10:26 · 已运行 1 分 18 秒"
        : "今天 10:26 · 2 分 41 秒",
    detail:
      state === "failed"
        ? "读取岗位资料后，模型连接中断。原始输入和已完成步骤均已保留。"
        : state === "running"
          ? "正在分析岗位定位和角色边界。"
          : "已生成 4 项字段建议，正式岗位资料尚未改变。",
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
  };
  return {
    id: state === "complete" ? "position-analysis-v3" : "position-analysis-v4",
    type: "岗位 AI 解析",
    title:
      state === "complete"
        ? "岗位深度解析 · 资料版本 v3"
        : "重新解析具身智能 VLA 算法负责人",
    target: "具身智能 VLA 算法负责人",
    source: "岗位详情 · 当前岗位 JD",
    work: positionAiWorkTitle,
    state,
    startedAt: state === "complete" ? "8 月 19 日 16:42" : "今天 10:26",
    updatedAt:
      state === "running"
        ? "刚刚"
        : state === "review"
          ? "今天 10:29"
          : state === "failed"
            ? "今天 10:27"
            : "8 月 19 日 16:45",
    summary:
      state === "running"
        ? "正在分析岗位定位、角色边界与寻访关键词。"
        : state === "review"
          ? "已生成 4 项建议，等待确认后更新当前岗位。"
          : state === "failed"
            ? "模型连接中断，已保留原输入和完成步骤，可直接重试。"
            : "已确认岗位定位、软性与隐性要求及 5 组寻访关键词。",
    plan,
    runs:
      state === "complete"
        ? [
            {
              id: "run-3",
              label: "运行 #3",
              time: "8 月 19 日 16:42 · 2 分 08 秒",
              detail: "一次完成并通过结构检查，用户确认后写入岗位资料 v3。",
              status: "完成",
              tone: "success",
            },
          ]
        : [
            currentRun,
            {
              id: "run-3",
              label: "运行 #3",
              time: "8 月 19 日 16:42 · 2 分 08 秒",
              detail: "完成上一版岗位解析，并形成岗位资料 v3。",
              status: "完成",
              tone: "success",
            },
          ],
  };
}

function PositionProfile({
  detail,
  aiState,
  aiPanel,
  aiRecord,
  onOpenAiSetup,
  onOpenAiDetails,
  onOpenAiReview,
  onCloseAiPanel,
  onStartAi,
  onStopAi,
  onRetryAi,
  onApplyAi,
}) {
  const navigate = useNavigate();
  const notify = useToast();
  const [versionOpen, setVersionOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("v3");
  const [editSection, setEditSection] = useState(null);
  const jdVersions = useMemo(
    () => [
      {
        id: "v3",
        label: "v3 · 当前版本",
        meta: "2026-08-19 · 岗位解析后用户确认",
        content: detail.jd,
        current: true,
      },
      {
        id: "v2",
        label: "v2",
        meta: "2026-08-12 · 客户补充团队规模与地点",
        content: `岗位职责\n1. 负责具身智能 VLA 算法方向的技术规划与工程落地，带领团队完成多模态感知、策略学习和真机部署。\n2. 建设机器人数据采集、训练、评测和迭代闭环，推动算法在仓储与柔性制造场景稳定交付。\n3. 与硬件、数据和产品团队协作，拆解季度目标并识别关键技术风险。\n\n任职要求\n1. 计算机、自动化或机器人相关专业硕士及以上学历。\n2. 8 年以上算法研发经验，具备机器人学习、强化学习或多模态模型经验。\n3. 有 8 人以上团队管理经验，能够负责跨团队项目交付。\n4. 工作地点以北京为主。`,
      },
      {
        id: "v1",
        label: "v1 · 原始 JD",
        meta: "2026-08-08 · 用户输入",
        content: `岗位职责\n负责公司具身智能 VLA 算法方向，推进模型训练和机器人真机落地，带领算法团队完成客户项目。\n\n任职要求\n熟悉机器人学习、强化学习和多模态大模型，有团队管理经验，能够在北京工作。`,
      },
    ],
    [detail.jd],
  );
  const activeVersion =
    jdVersions.find((item) => item.id === selectedVersion) || jdVersions[0];
  return (
    <div className="s4-detail-stack">
      <AssetAiProcessBanner
        state={aiState}
        title="岗位 AI 解析"
        description={aiRecord.summary}
        target={aiRecord.target}
        work={aiRecord.work}
        onDetails={onOpenAiDetails}
        onPrimary={aiState === "review" ? onOpenAiReview : onRetryAi}
        primaryLabel={
          aiState === "review"
            ? "审核解析结果"
            : aiState === "failed"
              ? "重新运行"
              : undefined
        }
        onSecondary={onStopAi}
        secondaryLabel={aiState === "running" ? "停止" : undefined}
      />
      <FieldGroup
        title="岗位基本资料"
        action={
          <Button size="sm" icon="edit" onClick={() => setEditSection("base")}>
            编辑资料
          </Button>
        }
      >
        <DefinitionGrid
          items={[
            [
              "招聘公司",
              <button
                className="s4-inline-link"
                type="button"
                onClick={() => navigate("/companies/company-xinglan")}
              >
                星澜机器人
              </button>,
            ],
            ["招聘状态", <StatusFromText value={detail.status} />],
            ["工作地点", detail.location],
            ["薪资范围", detail.salary],
            ["最低工作年限", detail.experience],
            ["学历要求", detail.education],
            [
              "来源机会",
              <button
                type="button"
                className="s4-position-source-inline"
                onClick={() => navigate("/opportunities/opportunity-xinglan")}
              >
                <span>
                  <b>{detail.sourceOpportunity}</b>
                  <small>已确认 · 已形成 2 个岗位</small>
                </span>
                <Icon name="chevronRight" />
              </button>,
            ],
          ]}
        />
        <div className="s4-labeled-row">
          <b>关键技能</b>
          <TagList items={detail.skills} tone="info" />
        </div>
      </FieldGroup>
      <FieldGroup
        title="当前岗位 JD"
        description={`${detail.jdVersion} · 当前有效版本`}
        action={
          <div className="s4-group-actions">
            <Button size="sm" icon="edit" onClick={() => setEditSection("jd")}>
              编辑 JD
            </Button>
            <Button size="sm" onClick={() => setVersionOpen(true)}>
              版本历史
            </Button>
            <Button size="sm" icon="sparkles" onClick={onOpenAiSetup}>
              AI 解析
            </Button>
          </div>
        }
      >
        <div className="s4-jd-content">
          {detail.jd
            .split("\n")
            .map((line, index) =>
              line ? (
                /^(岗位职责|任职要求)$/.test(line) ? (
                  <h3 key={index}>{line}</h3>
                ) : (
                  <p key={index}>{line}</p>
                )
              ) : (
                <br key={index} />
              ),
            )}
        </div>
      </FieldGroup>
      <FieldGroup
        title="已确认招聘要求"
        description="只有这一层可以成为明确硬约束。"
        action={
          <Button
            size="sm"
            icon="edit"
            onClick={() => setEditSection("requirements")}
          >
            编辑要求
          </Button>
        }
      >
        <ol className="s4-confirmed-requirements">
          {detail.confirmedRequirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </FieldGroup>
      <FieldGroup
        title="岗位解析"
        description="用于理解岗位和辅助寻访，不自动成为硬要求。"
        action={
          <Button
            size="sm"
            icon="edit"
            onClick={() => setEditSection("analysis")}
          >
            编辑解析
          </Button>
        }
      >
        <div className="s4-analysis-list">
          {detail.analysis.map(([label, value]) => (
            <article key={label}>
              <b>{label}</b>
              <p>{value}</p>
            </article>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup
        title="寻访关键词"
        description="最多 5 组，每组最多 2 个词。"
        action={
          <Button
            size="sm"
            icon="edit"
            onClick={() => setEditSection("keywords")}
          >
            编辑
          </Button>
        }
      >
        <div className="s4-keyword-groups">
          {detail.keywordGroups.map((group, index) => (
            <span key={group.join("-")}>
              <em>组合 {index + 1}</em>
              {group.map((item) => (
                <b key={item}>{item}</b>
              ))}
            </span>
          ))}
        </div>
      </FieldGroup>
      <Modal
        open={versionOpen}
        close={() => setVersionOpen(false)}
        size="xl"
        title="岗位 JD 版本"
        description="先查看当时的完整内容，再决定是否恢复；恢复后会形成新版本"
        footer={
          <>
            <Button onClick={() => setVersionOpen(false)}>关闭</Button>
            <Button
              tone="primary"
              disabled={activeVersion.current}
              onClick={() => {
                setVersionOpen(false);
                notify(`${activeVersion.id} 已恢复为新版本 v4`);
              }}
            >
              {activeVersion.current ? "当前版本" : `恢复 ${activeVersion.id}`}
            </Button>
          </>
        }
      >
        <div className="s4-version-review">
          <nav aria-label="岗位 JD 历史版本">
            {jdVersions.map((item) => (
              <button
                type="button"
                className={item.id === activeVersion.id ? "is-active" : ""}
                key={item.id}
                onClick={() => setSelectedVersion(item.id)}
              >
                <span>
                  <b>{item.label}</b>
                  <small>{item.meta}</small>
                </span>
                {item.current ? (
                  <StatusBadge tone="success">当前</StatusBadge>
                ) : (
                  <Icon name="chevronRight" />
                )}
              </button>
            ))}
          </nav>
          <section>
            <header>
              <span>
                <small>正在查看</small>
                <h3>{activeVersion.label}</h3>
              </span>
              <small>{activeVersion.meta}</small>
            </header>
            <div className="s4-jd-content is-version-preview">
              {activeVersion.content
                .split("\n")
                .map((line, index) =>
                  line ? (
                    /^(岗位职责|任职要求)$/.test(line) ? (
                      <h3 key={index}>{line}</h3>
                    ) : (
                      <p key={index}>{line}</p>
                    )
                  ) : (
                    <br key={index} />
                  ),
                )}
            </div>
          </section>
        </div>
      </Modal>
      <PositionSectionEditor
        section={editSection}
        close={() => setEditSection(null)}
        onSave={(label) => {
          setEditSection(null);
          notify(`${label}已保存`);
        }}
      />
      <PositionAiStartModal
        open={aiState === "setup"}
        close={onCloseAiPanel}
        onStart={onStartAi}
      />
      <PositionAiReviewModal
        open={aiState === "review" && aiPanel === "review"}
        close={onCloseAiPanel}
        onApply={onApplyAi}
      />
    </div>
  );
}

function PositionAiStartModal({ open, close, onStart }) {
  const [supplement, setSupplement] = useState(positionAiSupplement);
  const [includeJd, setIncludeJd] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const valid = Boolean(supplement.trim());
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title="AI 解析当前岗位"
      description="处理结果保存在当前岗位，确认前不会修改正式资料，也不会新增工作"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            icon="sparkles"
            onClick={() => {
              setSubmitted(true);
              if (valid) onStart({ supplement, includeJd });
            }}
          >
            开始解析
          </Button>
        </>
      }
    >
      <div className="s4-ai-start-form">
        <section className="s4-ai-target-summary">
          <i>
            <Icon name="briefcase" />
          </i>
          <span>
            <small>处理对象</small>
            <b>具身智能 VLA 算法负责人</b>
            <p>星澜机器人 · 岗位资料 v3 · 当前岗位 JD</p>
          </span>
        </section>
        <FormField
          label="补充说明"
          required
          help="补充客户口径、岗位重点或公开 JD 中没有写清楚的信息。"
          error={submitted && !valid ? "请输入本次解析需要关注的补充信息" : ""}
        >
          <TextArea
            rows={5}
            value={supplement}
            onChange={setSupplement}
            placeholder="例如：客户更看重真机落地和团队管理经验……"
          />
        </FormField>
        <div className="s4-ai-scope-options">
          <span>
            <b>本次处理范围</b>
            <small>岗位解析、软性与隐性要求、对标企业、寻访关键词</small>
          </span>
          <CustomCheckbox
            checked={includeJd}
            onChange={setIncludeJd}
            label="同时生成岗位 JD 更新建议"
          />
        </div>
        <section className="s4-ai-write-policy">
          <Icon name="lock" />
          <span>
            <b>审核后更新</b>
            <p>Hunter 先生成字段级建议；只有你确认的内容才会写入当前岗位。</p>
          </span>
        </section>
      </div>
    </Modal>
  );
}

function PositionAiReviewModal({ open, close, onApply }) {
  const [selected, setSelected] = useState([
    "岗位定位",
    "软性与隐性要求",
    "寻访关键词",
  ]);
  const suggestions = [
    {
      label: "岗位定位",
      current: "负责具身智能 VLA 算法方向，兼顾团队管理与真机项目交付。",
      suggestion:
        "面向量产交付的 VLA 算法负责人。核心不是单点模型研究，而是统筹数据、训练、评测和真机部署闭环，并承担 8—12 人团队的技术路线与交付责任。",
    },
    {
      label: "软性与隐性要求",
      current: "需要较强的跨团队协作能力和客户项目意识。",
      suggestion:
        "需要能在模型效果、硬件约束和客户交付时间之间做取舍；候选人若长期只负责研究原型、缺少真机失败复盘或团队管理跨度不足，匹配分应适当降低。",
    },
    {
      label: "寻访关键词",
      current: "VLA + 机器人学习；强化学习 + 真机部署；多模态 + 算法负责人",
      suggestion:
        "VLA + 真机部署；机器人学习 + 技术负责人；多模态策略 + 数据闭环；强化学习 + 量产交付；具身智能 + 团队管理",
    },
    {
      label: "岗位 JD",
      current: "岗位资料 v3，不在默认处理范围内。",
      suggestion:
        "补充数据闭环、评测体系和跨硬件协同职责；将“熟悉强化学习”收紧为具备真机策略学习或机器人数据闭环经验。",
    },
  ];
  const toggle = (label, checked) =>
    setSelected((current) =>
      checked
        ? [...new Set([...current, label])]
        : current.filter((item) => item !== label),
    );
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title="审核岗位解析结果"
      description="逐项比较当前内容和 AI 建议；未选择的内容继续保留在本次处理记录中"
      footer={
        <>
          <Button onClick={close}>稍后处理</Button>
          <Button
            tone="primary"
            disabled={!selected.length}
            onClick={() => onApply(selected)}
          >
            应用所选 {selected.length} 项
          </Button>
        </>
      }
    >
      <div className="s4-ai-review-summary">
        <StatusBadge tone="warning">4 项建议待审核</StatusBadge>
        <span>当前岗位资料仍为 v3，应用后形成 v4。</span>
      </div>
      <div className="s4-ai-review-list">
        {suggestions.map((item) => (
          <article
            className={selected.includes(item.label) ? "is-selected" : ""}
            key={item.label}
          >
            <header>
              <CustomCheckbox
                checked={selected.includes(item.label)}
                onChange={(checked) => toggle(item.label, checked)}
                label={item.label}
              />
              {item.label === "岗位 JD" ? (
                <StatusBadge tone="neutral">未纳入本次范围</StatusBadge>
              ) : null}
            </header>
            <div>
              <section>
                <small>当前内容</small>
                <p>{item.current}</p>
              </section>
              <section>
                <small>AI 建议</small>
                <p>{item.suggestion}</p>
              </section>
            </div>
          </article>
        ))}
      </div>
    </Modal>
  );
}

function PositionSectionEditor({ section, close, onSave }) {
  const [status, setStatus] = useState("招聘中");
  const [keywordGroups, setKeywordGroups] = useState(() =>
    positionDetail.keywordGroups.map((group) => [...group]),
  );
  const statusBlocked = section === "base" && status !== "招聘中";
  const config = {
    base: {
      title: "编辑岗位基本资料",
      label: "岗位基本资料",
      content: (
        <div className="s4-form-grid">
          <FormField label="岗位名称" required>
            <TextInput value={positionDetail.name} onChange={() => {}} />
          </FormField>
          <FormField label="招聘状态">
            <SelectMenu
              label="招聘状态"
              value={status}
              options={["招聘中", "已暂停", "已关闭"]}
              onChange={setStatus}
            />
          </FormField>
          <FormField label="招聘公司原文" required>
            <TextInput value="星澜机器人" onChange={() => {}} />
          </FormField>
          <FormField label="正式公司关联">
            <SelectMenu
              label="正式公司关联"
              value="星澜机器人"
              options={["星澜机器人", "拓界机器人", "灵跃科技"]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="工作地点">
            <TextInput value="北京 / 上海" onChange={() => {}} />
          </FormField>
          <FormField label="薪资范围">
            <TextInput value="80 - 120 万 / 年" onChange={() => {}} />
          </FormField>
          <FormField label="最低工作年限">
            <TextInput value="8" onChange={() => {}} />
          </FormField>
          <FormField label="学历要求">
            <SelectMenu
              label="学历要求"
              value="硕士"
              options={["不限", "本科", "硕士", "博士"]}
              onChange={() => {}}
            />
          </FormField>
        </div>
      ),
    },
    jd: {
      title: "编辑岗位 JD",
      label: "岗位 JD",
      content: (
        <FormField label="岗位 JD" required>
          <TextArea value={positionDetail.jd} onChange={() => {}} />
        </FormField>
      ),
    },
    requirements: {
      title: "编辑已确认招聘要求",
      label: "已确认招聘要求",
      content: (
        <FormField label="每行一项明确要求" required>
          <TextArea
            value={positionDetail.confirmedRequirements.join("\n")}
            onChange={() => {}}
          />
        </FormField>
      ),
    },
    analysis: {
      title: "编辑岗位解析",
      label: "岗位解析",
      content: (
        <div className="s4-position-analysis-editor">
          {positionDetail.analysis.map(([label, value]) => (
            <FormField label={label} key={label}>
              <TextArea value={value} onChange={() => {}} />
            </FormField>
          ))}
        </div>
      ),
    },
    keywords: {
      title: "编辑寻访关键词",
      label: "寻访关键词",
      content: (
        <div className="s4-position-keyword-editor">
          {keywordGroups.map((group, index) => (
            <article key={`keyword-group-${index}`}>
              <span>组合 {index + 1}</span>
              <TextInput
                value={group[0]}
                onChange={(value) =>
                  setKeywordGroups((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? [value, item[1]] : item,
                    ),
                  )
                }
              />
              <TextInput
                value={group[1]}
                onChange={(value) =>
                  setKeywordGroups((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? [item[0], value] : item,
                    ),
                  )
                }
              />
              <button
                type="button"
                aria-label={`删除组合 ${index + 1}`}
                onClick={() =>
                  setKeywordGroups((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <Icon name="trash" />
              </button>
            </article>
          ))}
          <Button
            size="sm"
            icon="plus"
            disabled={keywordGroups.length >= 5}
            onClick={() =>
              setKeywordGroups((current) => [...current, ["", ""]])
            }
          >
            添加关键词组合
          </Button>
        </div>
      ),
    },
  }[section];
  return (
    <Modal
      open={Boolean(config)}
      close={close}
      size={section === "analysis" ? "xl" : "lg"}
      title={config?.title || "编辑岗位资料"}
      description="修改后形成新的资料版本，并保留变化记录"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={statusBlocked}
            onClick={() => onSave(config?.label || "资料")}
          >
            保存修改
          </Button>
        </>
      }
    >
      {config?.content}
      {statusBlocked ? (
        <StateBanner
          tone="warning"
          icon="warning"
          title="当前有 2 个运行中任务，暂时不能保存"
          description="暂停或关闭岗位前，需要先停止对应的岗位招聘工作和候选人匹配任务。"
        />
      ) : null}
    </Modal>
  );
}

const pipelineCandidateSeed = {
  zhaoxingyu: {
    id: "zhaoxingyu",
    name: "赵星羽",
    company: "星澜机器人",
    title: "VLA 算法负责人",
    score: 94,
    note: "等待确认本周沟通时间",
    stageDays: 2,
  },
  hewenting: {
    id: "hewenting",
    name: "何文婷",
    company: "上海人工智能实验室",
    title: "机器人学习研究员",
    score: 84,
    note: "需要补充团队管理经历",
    stageDays: 9,
  },
  jiangyifan: {
    id: "jiangyifan",
    name: "蒋一帆",
    company: "银河通用",
    title: "机器人算法专家",
    score: null,
    note: "手动加入，尚未进行岗位匹配",
    stageDays: 0,
  },
  linhao: {
    id: "linhao",
    name: "林昊",
    company: "拓界机器人",
    title: "机器人学习负责人",
    score: 91,
    note: "推荐报告已发送客户",
    stageDays: 16,
  },
  chenchuning: {
    id: "chenchuning",
    name: "陈楚宁",
    company: "灵跃科技",
    title: "灵巧操作算法负责人",
    score: 89,
    note: "客户已确认进入技术面",
    stageDays: 1,
  },
  zhoumingyuan: {
    id: "zhoumingyuan",
    name: "周明远",
    company: "穹顶智能",
    title: "具身智能算法总监",
    score: 86,
    note: "等待客户反馈一面结论",
    stageDays: 33,
  },
  liangchen: {
    id: "liangchen",
    name: "梁辰",
    company: "矩阵机器人",
    title: "多模态算法 Lead",
    score: 82,
    note: "二面安排在周五 14:00",
    stageDays: 1,
  },
  gaoyuan: {
    id: "gaoyuan",
    name: "高远",
    company: "启元动力",
    title: "强化学习负责人",
    score: 78,
    note: "候选人期望总包 115 万",
    stageDays: 8,
  },
  yangfan: {
    id: "yangfan",
    name: "杨帆",
    company: "智行未来",
    title: "机器人算法经理",
    score: 88,
    note: "已确认 9 月 16 日入职",
    enteredAt: "8 月 20 日",
  },
  sunran: {
    id: "sunran",
    name: "孙然",
    company: "云枢机器人",
    title: "高级算法工程师",
    score: 69,
    note: "客户认为管理跨度不足",
    enteredAt: "8 月 18 日",
  },
  wangyi: {
    id: "wangyi",
    name: "王奕",
    company: "星澜机器人",
    title: "机器人学习研究员",
    score: null,
    note: "候选人暂不考虑外部机会",
    enteredAt: "8 月 17 日",
  },
};

const initialPipelineStages = [
  {
    id: "reserve",
    name: "储备",
    tone: "reserve",
    fixed: true,
    people: ["zhaoxingyu", "hewenting", "jiangyifan"],
  },
  {
    id: "recommended",
    name: "已推荐",
    tone: "active",
    people: ["linhao", "chenchuning"],
  },
  { id: "interview-1", name: "一面", tone: "active", people: ["zhoumingyuan"] },
  { id: "interview-2", name: "二面", tone: "active", people: ["liangchen"] },
  { id: "salary", name: "谈薪", tone: "active", people: ["gaoyuan"] },
  {
    id: "joined",
    name: "已入职",
    tone: "success",
    fixed: true,
    people: ["yangfan"],
  },
  {
    id: "rejected",
    name: "已落选",
    tone: "danger",
    fixed: true,
    people: ["sunran"],
  },
  {
    id: "withdrawn",
    name: "候选人放弃",
    tone: "danger",
    fixed: true,
    people: ["wangyi"],
  },
  {
    id: "unsuitable",
    name: "候选人不合适",
    tone: "danger",
    fixed: true,
    people: [],
  },
];

function scoreTone(score) {
  if (score === null || score === undefined) return "unmatched";
  if (score >= 90) return "strong";
  if (score >= 80) return "good";
  if (score >= 70) return "watch";
  return "weak";
}

function MatchScore({ score, compact = false }) {
  return (
    <span
      className={`s4-match-score is-${scoreTone(score)} ${compact ? "is-compact" : ""}`}
    >
      {score === null || score === undefined ? "未匹配" : `${score} 分`}
    </span>
  );
}

function pipelineStageTone(stage = "") {
  if (stage === "储备") return "reserve";
  if (stage === "已入职") return "success";
  if (["已落选", "候选人放弃", "候选人不合适"].includes(stage)) return "danger";
  return "active";
}

function PipelineStageTag({ stage, prefix = false }) {
  return (
    <span className={`s4-pipeline-stage-tag is-${pipelineStageTone(stage)}`}>
      {prefix ? "流程中 · " : ""}
      {stage}
    </span>
  );
}

function stageAgeTone(stageDays) {
  if (stageDays > 30) return "danger";
  if (stageDays > 14) return "high";
  if (stageDays > 7) return "warning";
  return "normal";
}

function StageAge({ candidate }) {
  const tone = stageAgeTone(candidate.stageDays);
  const text =
    candidate.stageDays === 0
      ? "今天进入"
      : Number.isFinite(candidate.stageDays)
        ? `进入 ${candidate.stageDays} 天`
        : candidate.enteredAt;
  return <time className={`s4-stage-age is-${tone}`}>{text}</time>;
}

function CandidatePipeline() {
  const notify = useToast();
  const boardRef = useRef(null);
  const scrollDragRef = useRef(null);
  const [view, setView] = useState("board");
  const [stageModal, setStageModal] = useState(false);
  const [stages, setStages] = useState(initialPipelineStages);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);
  const [candidateOpen, setCandidateOpen] = useState(null);
  const [scrollMetrics, setScrollMetrics] = useState({
    left: 0,
    max: 0,
    viewportRatio: 1,
  });
  const syncScrollMetrics = () => {
    const board = boardRef.current;
    if (!board) return;
    setScrollMetrics({
      left: board.scrollLeft,
      max: Math.max(0, board.scrollWidth - board.clientWidth),
      viewportRatio: Math.min(1, board.clientWidth / board.scrollWidth),
    });
  };
  useEffect(() => {
    syncScrollMetrics();
    window.addEventListener("resize", syncScrollMetrics);
    return () => window.removeEventListener("resize", syncScrollMetrics);
  }, [stages, view]);
  const pipelineSummary = [
    [
      "储备",
      stages.find((stage) => stage.id === "reserve")?.people.length || 0,
    ],
    [
      "推进中",
      stages
        .filter((stage) => stage.tone === "active")
        .reduce((total, stage) => total + stage.people.length, 0),
    ],
    [
      "已入职",
      stages.find((stage) => stage.id === "joined")?.people.length || 0,
    ],
    [
      "失败",
      stages
        .filter((stage) => stage.tone === "danger")
        .reduce((total, stage) => total + stage.people.length, 0),
    ],
  ];
  const moveCandidate = (note) => {
    if (!pendingMove) return;
    setStages((current) =>
      current.map((stage) => {
        if (stage.id === pendingMove.from) {
          return {
            ...stage,
            people: stage.people.filter((id) => id !== pendingMove.personId),
          };
        }
        if (stage.id === pendingMove.to) {
          return { ...stage, people: [...stage.people, pendingMove.personId] };
        }
        return stage;
      }),
    );
    const person = pipelineCandidateSeed[pendingMove.personId];
    notify(
      `${person.name} 已进入“${pendingMove.toName}”${note ? "并记录备注" : ""}`,
    );
    setPendingMove(null);
    setDragging(null);
    setDragOver(null);
  };
  return (
    <div className="s4-detail-stack">
      <div className="s4-pipeline-toolbar">
        <div>
          <button
            type="button"
            className={view === "board" ? "is-active" : ""}
            onClick={() => setView("board")}
          >
            <Icon name="database" />
            泳道
          </button>
          <button
            type="button"
            className={view === "list" ? "is-active" : ""}
            onClick={() => setView("list")}
          >
            <Icon name="menu" />
            列表
          </button>
        </div>
        <Button size="sm" icon="settings" onClick={() => setStageModal(true)}>
          配置阶段
        </Button>
        <Button
          size="sm"
          tone="primary"
          icon="plus"
          onClick={() => notify("已打开添加候选人")}
        >
          添加候选人
        </Button>
      </div>
      <div className="s4-pipeline-summary">
        {pipelineSummary.map(([label, count]) => (
          <article key={label}>
            <small>{label}</small>
            <b>{count}</b>
          </article>
        ))}
      </div>
      {view === "board" ? (
        <div className="s4-kanban-shell">
          <div
            className="s4-kanban"
            ref={boardRef}
            onScroll={syncScrollMetrics}
          >
            {stages.map((stage) => (
              <section
                className={`s4-kanban-${stage.tone} ${dragOver === stage.id ? "is-drag-over" : ""}`}
                key={stage.id}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (dragging?.from !== stage.id) setDragOver(stage.id);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setDragOver(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  let dragData = dragging;
                  if (!dragData) {
                    try {
                      dragData = JSON.parse(
                        event.dataTransfer.getData("text/plain"),
                      );
                    } catch {
                      dragData = null;
                    }
                  }
                  if (dragData && dragData.from !== stage.id) {
                    setPendingMove({
                      ...dragData,
                      to: stage.id,
                      toName: stage.name,
                    });
                  }
                  setDragOver(null);
                }}
              >
                <header>
                  <b>{stage.name}</b>
                  <em>{stage.people.length}</em>
                </header>
                <div>
                  {stage.people.map((personId) => {
                    const person = pipelineCandidateSeed[personId];
                    return (
                      <article
                        draggable
                        className={
                          dragging?.personId === personId ? "is-dragging" : ""
                        }
                        key={personId}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          const dragData = {
                            personId,
                            from: stage.id,
                            fromName: stage.name,
                          };
                          event.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify(dragData),
                          );
                          setDragging(dragData);
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setDragOver(null);
                        }}
                        onClick={() => {
                          if (!dragging)
                            setCandidateOpen({ ...person, stage: stage.name });
                        }}
                      >
                        <header>
                          <b>{person.name}</b>
                          <StageAge candidate={person} />
                        </header>
                        <strong>{person.title}</strong>
                        <small>{person.company}</small>
                        <footer>
                          <MatchScore score={person.score} compact />
                          <span>查看推进记录</span>
                        </footer>
                        <p>{person.note}</p>
                      </article>
                    );
                  })}
                  {!stage.people.length ? (
                    <span className="s4-kanban-empty">拖动候选人到此阶段</span>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
          <div
            className="s4-kanban-scrollbar"
            role="scrollbar"
            aria-label="候选人流程横向位置"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              scrollMetrics.max
                ? Math.round((scrollMetrics.left / scrollMetrics.max) * 100)
                : 0
            }
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const board = boardRef.current;
              if (!board) return;
              if (event.key === "Home") board.scrollLeft = 0;
              else if (event.key === "End")
                board.scrollLeft = scrollMetrics.max;
              else
                board.scrollBy({
                  left: event.key === "ArrowRight" ? 220 : -220,
                  behavior: "smooth",
                });
            }}
            onPointerDown={(event) => {
              if (event.target !== event.currentTarget) return;
              const board = boardRef.current;
              if (!board || !scrollMetrics.max) return;
              const rect = event.currentTarget.getBoundingClientRect();
              const ratio = Math.min(
                1,
                Math.max(0, (event.clientX - rect.left) / rect.width),
              );
              board.scrollLeft = ratio * scrollMetrics.max;
            }}
          >
            <span
              style={{
                width: `${Math.max(12, scrollMetrics.viewportRatio * 100)}%`,
                left: `${
                  scrollMetrics.max
                    ? (scrollMetrics.left / scrollMetrics.max) *
                      (100 - Math.max(12, scrollMetrics.viewportRatio * 100))
                    : 0
                }%`,
              }}
              onPointerDown={(event) => {
                const board = boardRef.current;
                if (!board) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                scrollDragRef.current = {
                  pointerId: event.pointerId,
                  clientX: event.clientX,
                  scrollLeft: board.scrollLeft,
                  trackWidth:
                    event.currentTarget.parentElement?.clientWidth || 1,
                };
              }}
              onPointerMove={(event) => {
                const drag = scrollDragRef.current;
                const board = boardRef.current;
                if (!drag || !board || drag.pointerId !== event.pointerId)
                  return;
                const delta = event.clientX - drag.clientX;
                board.scrollLeft =
                  drag.scrollLeft +
                  delta * (board.scrollWidth / drag.trackWidth);
              }}
              onPointerUp={(event) => {
                if (scrollDragRef.current?.pointerId === event.pointerId) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                  scrollDragRef.current = null;
                }
              }}
              onPointerCancel={() => {
                scrollDragRef.current = null;
              }}
            />
          </div>
        </div>
      ) : (
        <PipelineList stages={stages} onOpen={setCandidateOpen} />
      )}
      <StageConfigModal
        open={stageModal}
        close={() => setStageModal(false)}
        initialStages={stages}
        onSave={(nextStages) => {
          setStages(nextStages);
          setStageModal(false);
          notify("岗位推进阶段已保存");
        }}
      />
      <StageMoveNoteModal
        move={pendingMove}
        close={() => setPendingMove(null)}
        onSave={moveCandidate}
      />
      <PipelineCandidateModal
        candidate={candidateOpen}
        close={() => setCandidateOpen(null)}
      />
    </div>
  );
}

function PipelineList({ stages, onOpen }) {
  return (
    <div className="s4-compact-table">
      <header>
        <span>候选人</span>
        <span>当前阶段</span>
        <span>最近推进</span>
        <span>备注</span>
        <span>操作</span>
      </header>
      {stages.flatMap((stage) =>
        stage.people.map((personId) => {
          const person = pipelineCandidateSeed[personId];
          return (
            <article key={personId}>
              <b>
                {person.name}
                <small>
                  {person.company} · {person.title}
                </small>
              </b>
              <PipelineStageTag stage={stage.name} />
              <StageAge candidate={person} />
              <p>{person.note}</p>
              <button
                type="button"
                onClick={() => onOpen({ ...person, stage: stage.name })}
              >
                查看记录
              </button>
            </article>
          );
        }),
      )}
    </div>
  );
}

function StageConfigModal({ open, close, initialStages, onSave }) {
  const [stages, setStages] = useState(initialStages);
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const reorder = (targetId) => {
    if (!dragging || dragging === targetId) return;
    const from = stages.findIndex((stage) => stage.id === dragging);
    const to = stages.findIndex((stage) => stage.id === targetId);
    if (from < 0 || to < 0 || stages[from].fixed || stages[to].fixed) return;
    const next = [...stages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setStages(next);
    setDropTarget(null);
  };
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title="配置岗位推进阶段"
      description="阶段名称和顺序属于当前岗位；稳定分类用于跨岗位统计"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={() => onSave(stages)}>
            保存配置
          </Button>
        </>
      }
    >
      <div className="s4-stage-config">
        {stages.map((stage) => (
          <article
            className={`${stage.fixed ? "is-fixed" : ""} ${dragging === stage.id ? "is-dragging" : ""} ${dropTarget === stage.id ? "is-drop-target" : ""}`.trim()}
            draggable={!stage.fixed}
            key={stage.id}
            onDragStart={() => {
              setDragging(stage.id);
              setDropTarget(null);
            }}
            onDragOver={(event) => {
              if (!stage.fixed && dragging !== stage.id) {
                event.preventDefault();
                setDropTarget(stage.id);
              }
            }}
            onDrop={() => reorder(stage.id)}
            onDragEnd={() => {
              setDragging(null);
              setDropTarget(null);
            }}
          >
            <Icon name={stage.fixed ? "lock" : "menu"} />
            <TextInput
              value={stage.name}
              disabled={stage.fixed}
              onChange={(value) =>
                setStages((current) =>
                  current.map((item) =>
                    item.id === stage.id ? { ...item, name: value } : item,
                  ),
                )
              }
            />
            <SelectMenu
              label="稳定分类"
              value={
                stage.category ||
                (stage.id === "reserve"
                  ? "储备"
                  : stage.id === "joined"
                    ? "已入职"
                    : stage.tone === "danger"
                      ? "失败"
                      : "推进中")
              }
              options={["储备", "推进中", "已入职", "失败"]}
              onChange={(value) =>
                setStages((current) =>
                  current.map((item) =>
                    item.id === stage.id
                      ? {
                          ...item,
                          category: value,
                          tone:
                            value === "失败"
                              ? "danger"
                              : value === "已入职"
                                ? "success"
                                : value === "储备"
                                  ? "reserve"
                                  : "active",
                        }
                      : item,
                  ),
                )
              }
              disabled={stage.fixed}
            />
            <button
              type="button"
              disabled={stage.fixed}
              onClick={() =>
                setStages((current) =>
                  current.filter((item) => item.id !== stage.id),
                )
              }
            >
              <Icon name="trash" />
            </button>
          </article>
        ))}
        <Button
          size="sm"
          icon="plus"
          onClick={() =>
            setStages((current) => {
              const firstTerminal = current.findIndex(
                (stage) => stage.id === "joined",
              );
              const next = [...current];
              next.splice(firstTerminal, 0, {
                id: `custom-${Date.now()}`,
                name: "新阶段",
                tone: "active",
                people: [],
              });
              return next;
            })
          }
        >
          添加阶段
        </Button>
      </div>
    </Modal>
  );
}

function StageMoveNoteModal({ move, close, onSave }) {
  const [note, setNote] = useState("");
  return (
    <Modal
      open={Boolean(move)}
      close={close}
      title={`移动 ${pipelineCandidateSeed[move?.personId]?.name || "候选人"}`}
      description={`${move?.fromName || "—"} → ${move?.toName || "—"}`}
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={() => onSave(note)}>
            确认移动
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="本次操作备注" span={2}>
          <TextArea
            value={note}
            onChange={setNote}
            placeholder="可选，记录本次阶段变化的原因"
          />
        </FormField>
      </div>
    </Modal>
  );
}

function PipelineCandidateModal({ candidate, close }) {
  const notify = useToast();
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  return (
    <Drawer
      open={Boolean(candidate)}
      close={close}
      className="s4-pipeline-record-drawer"
      title={`${candidate?.name || "候选人"} · 完整推进记录`}
    >
      <div className="s4-pipeline-candidate-detail">
        <p className="s4-pipeline-record-role">
          {candidate?.company || "—"} · {candidate?.title || "—"}
        </p>
        <header>
          <span>
            <PipelineStageTag stage={candidate?.stage || "储备"} />
            <MatchScore score={candidate?.score} />
          </span>
          <Button size="sm" onClick={() => notify("已打开候选人完整档案")}>
            查看候选人档案
          </Button>
        </header>
        <DefinitionGrid
          columns={2}
          items={[
            ["当前公司", candidate?.company],
            ["当前职位", candidate?.title],
            ["进入阶段", candidate?.days],
            ["最近备注", candidate?.note],
          ]}
        />
        <section>
          <header>
            <h3>备注与推进时间线</h3>
            <Button size="sm" icon="plus" onClick={() => setEditing(true)}>
              添加备注
            </Button>
          </header>
          {editing ? (
            <div className="s4-pipeline-note-editor">
              <TextArea
                value={note}
                onChange={setNote}
                placeholder="记录沟通结果、阶段变化原因或下一步安排"
              />
              <div>
                <Button size="sm" onClick={() => setEditing(false)}>
                  取消
                </Button>
                <Button
                  size="sm"
                  tone="primary"
                  disabled={!note.trim()}
                  onClick={() => {
                    setEditing(false);
                    setNote("");
                    notify("推进备注已添加");
                  }}
                >
                  保存备注
                </Button>
              </div>
            </div>
          ) : null}
          <ActivityTimeline
            items={[
              [
                "今天 10:20",
                candidate?.stage || "阶段更新",
                candidate?.note || "等待下一步反馈",
                "沈岚",
              ],
              [
                "昨天 16:40",
                "补充沟通备注",
                "候选人确认可以在本周安排一次岗位沟通。",
                "沈岚",
              ],
              [
                "08-19 09:42",
                "加入岗位储备",
                "从人岗匹配结果加入当前岗位。",
                "人岗匹配",
              ],
            ]}
          />
        </section>
      </div>
    </Drawer>
  );
}

const matchSurnames = [
  "林",
  "周",
  "赵",
  "陈",
  "顾",
  "许",
  "沈",
  "唐",
  "陆",
  "叶",
  "韩",
  "方",
  "罗",
  "蒋",
  "伍",
  "宋",
];
const matchGivenNames = [
  "昊",
  "明远",
  "星羽",
  "楚宁",
  "言川",
  "若航",
  "亦辰",
  "可欣",
];
const matchCompanies = [
  "拓界机器人",
  "穹顶智能",
  "星澜机器人",
  "灵跃科技",
  "智行未来",
  "银河通用",
  "启元动力",
  "矩阵机器人",
];
const matchTitles = [
  "机器人学习负责人",
  "VLA 算法负责人",
  "具身智能算法总监",
  "多模态算法 Lead",
  "机器人基础模型专家",
  "强化学习负责人",
  "机器人算法经理",
  "高级算法工程师",
];

const matchingCatalog = Array.from({ length: 128 }, (_, index) => {
  const base = matchResults[index] || {};
  const unmatched = index >= 120;
  const score = unmatched ? null : Math.max(52, 96 - Math.floor(index / 3));
  const roleGate = unmatched
    ? "未匹配"
    : index > 0 && index % 11 === 0
      ? "拒绝"
      : index > 0 && index % 5 === 0
        ? "有条件"
        : "通过";
  const pipelineStages = ["储备", "已推荐", "一面", "二面", "谈薪"];
  return {
    ...base,
    id: base.id || `match-${index + 1}`,
    name:
      base.name ||
      `${matchSurnames[Math.floor(index / matchGivenNames.length)]}${matchGivenNames[index % matchGivenNames.length]}`,
    company: base.company || matchCompanies[index % matchCompanies.length],
    title: base.title || matchTitles[index % matchTitles.length],
    score,
    roleGate,
    pipelineStage:
      index < 8 && index % 2 === 0 ? pipelineStages[index % 5] : null,
    reason:
      base.reason ||
      "候选人的机器人学习、真机部署和跨团队交付经历与岗位核心目标有较高重合，公开资料中可以确认其承担过关键技术决策。",
    risk:
      base.risk ||
      (roleGate === "拒绝"
        ? "当前角色层级或职业方向与岗位硬边界冲突，不进入可推荐范围。"
        : roleGate === "有条件"
          ? "当前职级或管理跨度高于目标岗位，需要先确认角色预期。"
          : "最近两年的个人贡献、地点意愿和到岗时间仍需沟通核实。"),
  };
}).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

const matchTabs = [
  { value: "all", label: "全部结果" },
  { value: "passed", label: "角色适配通过" },
  { value: "conditional", label: "有条件匹配" },
  { value: "rejected", label: "硬门槛拒绝" },
  { value: "pending", label: "未完成匹配" },
  { value: "removed", label: "已移除" },
];

function MatchingResults() {
  const navigate = useNavigate();
  const notify = useToast();
  const [selected, setSelected] = useState(
    () =>
      sessionStorage.getItem("hunter-matching-selected-candidate") ||
      matchingCatalog[0]?.id,
  );
  const [scope, setScope] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [removed, setRemoved] = useState(
    () => new Set([matchingCatalog[17].id]),
  );
  const [removedReasons, setRemovedReasons] = useState({
    [matchingCatalog[17].id]: "用户判断当前阶段不适合该岗位",
  });
  const [pipelineStages, setPipelineStages] = useState(() =>
    Object.fromEntries(
      matchingCatalog
        .filter((item) => item.pipelineStage)
        .map((item) => [item.id, item.pipelineStage]),
    ),
  );
  const [reportFiles] = useState(() => {
    const generatedId = sessionStorage.getItem(
      "hunter-recommendation-candidate-id",
    );
    const generatedName = sessionStorage.getItem(
      "hunter-recommendation-candidate",
    );
    const buildReports = (candidateId, candidateName) => {
      const versions = buildRecommendationReportVersions(candidateName);
      return sessionStorage.getItem(
        `hunter-recommendation-report-version-${candidateId}`,
      ) === "v3"
        ? [buildRevisedRecommendationReport(candidateName), ...versions]
        : versions;
    };
    return {
      [matchingCatalog[0].id]: buildReports(
        matchingCatalog[0].id,
        matchingCatalog[0].name,
      ),
      ...(generatedId && generatedName
        ? { [generatedId]: buildReports(generatedId, generatedName) }
        : {}),
    };
  });
  const [runOpen, setRunOpen] = useState(false);
  const [runMode, setRunMode] = useState("complete");
  const [reportCandidate, setReportCandidate] = useState(null);
  const [reportPrompt, setReportPrompt] = useState("");
  const counts = useMemo(
    () => ({
      all: matchingCatalog.length - removed.size,
      passed: matchingCatalog.filter(
        (item) => item.roleGate === "通过" && !removed.has(item.id),
      ).length,
      conditional: matchingCatalog.filter(
        (item) => item.roleGate === "有条件" && !removed.has(item.id),
      ).length,
      rejected: matchingCatalog.filter(
        (item) => item.roleGate === "拒绝" && !removed.has(item.id),
      ).length,
      pending: matchingCatalog.filter(
        (item) => item.roleGate === "未匹配" && !removed.has(item.id),
      ).length,
      removed: removed.size,
    }),
    [removed],
  );
  const rows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return matchingCatalog.filter((item) => {
      const isRemoved = removed.has(item.id);
      const inScope =
        scope === "removed"
          ? isRemoved
          : !isRemoved &&
            (scope === "all" ||
              (scope === "passed" && item.roleGate === "通过") ||
              (scope === "conditional" && item.roleGate === "有条件") ||
              (scope === "rejected" && item.roleGate === "拒绝") ||
              (scope === "pending" && item.roleGate === "未匹配"));
      return (
        inScope &&
        (!keyword ||
          `${item.name} ${item.company} ${item.title}`
            .toLowerCase()
            .includes(keyword))
      );
    });
  }, [query, removed, scope]);
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  const visibleRows = rows.slice((page - 1) * 10, page * 10);
  const current =
    rows.find((item) => item.id === selected) ||
    visibleRows[0] ||
    matchingCatalog[0];
  const changeScope = (value) => {
    setScope(value);
    setPage(1);
    const next = matchingCatalog.find((item) => {
      if (value === "removed") return removed.has(item.id);
      if (removed.has(item.id)) return false;
      return (
        value === "all" ||
        (value === "passed" && item.roleGate === "通过") ||
        (value === "conditional" && item.roleGate === "有条件") ||
        (value === "rejected" && item.roleGate === "拒绝") ||
        (value === "pending" && item.roleGate === "未匹配")
      );
    });
    if (next) setSelected(next.id);
  };
  const removeCandidate = (reason) => {
    setRemoved((currentSet) => new Set([...currentSet, current.id]));
    setRemovedReasons((currentReasons) => ({
      ...currentReasons,
      [current.id]: reason,
    }));
    notify(`${current.name} 已移到“已移除”`);
  };
  const restoreCandidate = () => {
    setRemoved((currentSet) => {
      const next = new Set(currentSet);
      next.delete(current.id);
      return next;
    });
    notify(`${current.name} 已恢复到匹配结果`);
    changeScope("all");
  };
  const startReportTask = (candidate, requirement) => {
    sessionStorage.setItem(
      "hunter-recommendation-task-prompt",
      requirement ||
        "重点说明候选人的 VLA 落地能力、团队管理范围和岗位适配证据。",
    );
    sessionStorage.setItem("hunter-recommendation-candidate", candidate.name);
    sessionStorage.setItem("hunter-recommendation-candidate-id", candidate.id);
    sessionStorage.setItem(
      "hunter-recommendation-candidate-record",
      JSON.stringify(candidate),
    );
    sessionStorage.setItem("hunter-matching-selected-candidate", candidate.id);
    navigate("/works/task-recommend-linhao");
  };
  return (
    <div className="s4-match-shell">
      <header className="s4-match-overview">
        <span>
          <small>匹配结果</small>
          <b>128 位候选人完成本轮处理</b>
          <p>岗位资料 v3 · 匹配策略 v12 · 结果按综合分倒序</p>
        </span>
        <div>
          <Button
            size="sm"
            icon="activity"
            onClick={() => {
              setRunMode("complete");
              setRunOpen(true);
            }}
          >
            查看匹配过程
          </Button>
          <Button
            size="sm"
            icon="refresh"
            onClick={() => {
              setRunMode("running");
              setRunOpen(true);
            }}
          >
            重新匹配
          </Button>
        </div>
      </header>
      <div className="s4-match-tabs">
        <div
          className="s1-tabs app-tabs"
          role="tablist"
          aria-label="匹配结果分类"
        >
          {matchTabs.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={scope === item.value}
              className={scope === item.value ? "is-active" : ""}
              key={item.value}
              onClick={() => changeScope(item.value)}
            >
              {item.label}
              <em>{counts[item.value]}</em>
            </button>
          ))}
        </div>
      </div>
      <div className="s4-match-workspace">
        <aside>
          <div className="s4-match-filters">
            <label className="s4-match-search">
              <Icon name="search" />
              <input
                value={query}
                placeholder="搜索姓名、公司或职位"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </label>
            <span>共 {rows.length} 位</span>
          </div>
          <div className="s4-match-result-list">
            {visibleRows.map((item) => (
              <button
                type="button"
                className={`${item.id === current.id ? "is-active" : ""} is-${scoreTone(item.score)}`}
                key={item.id}
                onClick={() => setSelected(item.id)}
              >
                <MatchScore score={item.score} compact />
                <span>
                  <span className="s4-match-person-heading">
                    <b>{item.name}</b>
                    {pipelineStages[item.id] ? (
                      <PipelineStageTag
                        stage={pipelineStages[item.id]}
                        prefix
                      />
                    ) : null}
                  </span>
                  <small>
                    {item.company} · {item.title}
                  </small>
                  <em className={`is-${item.roleGate}`}>
                    {item.roleGate === "拒绝"
                      ? "硬门槛拒绝"
                      : item.roleGate === "有条件"
                        ? "有条件匹配"
                        : item.roleGate === "未匹配"
                          ? "等待匹配"
                          : "角色适配通过"}
                  </em>
                </span>
                <Icon name="chevronRight" />
              </button>
            ))}
          </div>
          <Pagination
            page={page}
            pages={pages}
            pageSize={10}
            onChange={setPage}
          />
        </aside>
        <section>
          <header className="s4-match-detail-head">
            <span>
              <small>候选人匹配详情</small>
              <span className="s4-match-person-heading is-detail">
                <h2>{current.name}</h2>
                {pipelineStages[current.id] ? (
                  <PipelineStageTag stage={pipelineStages[current.id]} prefix />
                ) : null}
              </span>
              <p>
                {current.company} · {current.title}
              </p>
            </span>
            <MatchScore score={current.score} />
          </header>
          <MatchGateSummary
            item={current}
            removedReason={removedReasons[current.id]}
          />
          {current.score === null ? (
            <div className="s4-match-pending-detail">
              <Icon name="clock" />
              <h3>尚未进行岗位匹配</h3>
              <p>该候选人由用户手动加入候选池，资料已进入下一批匹配队列。</p>
              <Button
                tone="primary"
                onClick={() => {
                  setRunMode("running");
                  setRunOpen(true);
                }}
              >
                立即匹配此人
              </Button>
            </div>
          ) : (
            <>
              <div className="s4-score-breakdown">
                {[
                  ["技能与经验", Math.min(98, current.score + 2)],
                  [
                    "岗位角色",
                    current.roleGate === "有条件"
                      ? 68
                      : current.roleGate === "拒绝"
                        ? 42
                        : Math.min(96, current.score),
                  ],
                  ["行业与场景", Math.max(62, current.score - 3)],
                  ["地点与意愿", Math.max(58, current.score - 8)],
                ].map(([label, score]) => (
                  <div key={label}>
                    <span>
                      <b>{label}</b>
                      <em>{score}</em>
                    </span>
                    <i>
                      <b
                        className={`is-${scoreTone(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </i>
                  </div>
                ))}
              </div>
              <FieldGroup title="推荐理由">
                <p className="s4-long-copy">{current.reason}</p>
              </FieldGroup>
              <FieldGroup title="风险提示">
                <p className="s4-long-copy">{current.risk}</p>
              </FieldGroup>
              <FieldGroup title="建议动作">
                <ol className="s4-confirmed-requirements">
                  <li>核实最近两年真机部署项目中的个人贡献。</li>
                  <li>确认北京工作安排、到岗时间和团队管理范围预期。</li>
                </ol>
              </FieldGroup>
            </>
          )}
          <FieldGroup title="推荐报告">
            {reportFiles[current.id] ? (
              <RecommendationReportFile
                candidateName={current.name}
                report={reportFiles[current.id][0]}
                onRegenerate={() => startReportTask(current)}
              />
            ) : (
              <div className="s4-report-empty">
                <span>
                  <Icon name="file" />
                  <b>未生成过推荐报告</b>
                  <small>
                    {pipelineStages[current.id]
                      ? "可新建工作生成报告，完成后最新文件会显示在这里。"
                      : "候选人加入岗位流程后，才可以生成面向客户的推荐报告。"}
                  </small>
                </span>
                {pipelineStages[current.id] ? (
                  <Button
                    size="sm"
                    icon="sparkles"
                    onClick={() => setReportCandidate(current)}
                  >
                    生成推荐报告
                  </Button>
                ) : null}
              </div>
            )}
          </FieldGroup>
          <footer className="s4-match-actions">
            <Button
              onClick={() =>
                navigate(`/candidates/${current.id}`, {
                  state: { candidate: current },
                })
              }
            >
              查看候选人
            </Button>
            {removed.has(current.id) ? (
              <Button tone="primary" icon="refresh" onClick={restoreCandidate}>
                恢复到结果
              </Button>
            ) : (
              <>
                <Button
                  tone="danger-outline"
                  onClick={() => removeCandidate("从当前岗位匹配结果中移除")}
                >
                  从结果移除
                </Button>
                <Button
                  tone="danger-outline"
                  onClick={() =>
                    removeCandidate("用户判断当前阶段不适合该岗位")
                  }
                >
                  标记不合适
                </Button>
                {!pipelineStages[current.id] ? (
                  <Button
                    tone="primary"
                    disabled={
                      current.roleGate === "拒绝" || current.score === null
                    }
                    onClick={() => {
                      setPipelineStages((stages) => ({
                        ...stages,
                        [current.id]: "储备",
                      }));
                      notify(`${current.name} 已加入岗位储备`);
                    }}
                  >
                    加入岗位储备
                  </Button>
                ) : null}
              </>
            )}
          </footer>
        </section>
      </div>
      <MatchRunModal
        open={runOpen}
        mode={runMode}
        close={() => setRunOpen(false)}
      />
      <Modal
        open={Boolean(reportCandidate)}
        close={() => setReportCandidate(null)}
        size="lg"
        title={`为 ${reportCandidate?.name || "候选人"} 生成推荐报告`}
        description="这会创建一项独立工作；可以继续通过对话补充要求和修改报告"
        footer={
          <>
            <Button onClick={() => setReportCandidate(null)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                const candidate = reportCandidate;
                setReportCandidate(null);
                startReportTask(candidate, reportPrompt);
              }}
            >
              创建并开始
            </Button>
          </>
        }
      >
        <FormField label="报告要求">
          <TextArea
            value={reportPrompt}
            onChange={setReportPrompt}
            placeholder="例如：面向客户技术负责人，重点说明真机部署、团队管理和风险核实情况"
          />
        </FormField>
      </Modal>
    </div>
  );
}

function MatchGateSummary({ item, removedReason }) {
  if (removedReason) {
    return (
      <div className="s4-match-gate is-removed">
        <i>
          <Icon name="trash" />
        </i>
        <span>
          <b>已从当前结果中移除</b>
          <p>{removedReason}。可以随时恢复，不会删除候选人档案。</p>
        </span>
      </div>
    );
  }
  const config =
    item.roleGate === "拒绝"
      ? [
          "danger",
          "warning",
          "硬性角色门槛未通过",
          "角色层级或职业方向与岗位硬边界冲突，不进入推荐排序。",
        ]
      : item.roleGate === "有条件"
        ? [
            "warning",
            "warning",
            "有条件匹配",
            "能力经历匹配，但当前职级或管理跨度偏高，综合分已做折扣。",
          ]
        : item.roleGate === "未匹配"
          ? ["neutral", "clock", "等待匹配", "该候选人尚未完成本岗位匹配。"]
          : [
              "success",
              "check",
              "角色适配通过",
              "当前职责与岗位目标在管理范围、交付责任和技术方向上匹配。",
            ];
  return (
    <div className={`s4-match-gate is-${config[0]}`}>
      <i>
        <Icon name={config[1]} />
      </i>
      <span>
        <b>{config[2]}</b>
        <p>{config[3]}</p>
      </span>
    </div>
  );
}

function MatchRunModal({ open, mode, close }) {
  const running = mode === "running";
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title={running ? "人岗匹配正在运行" : "人岗匹配运行过程"}
      description="本轮使用岗位资料 v3、候选人资料版本和匹配策略 v12"
      footer={
        <Button onClick={close}>{running ? "在后台继续" : "关闭"}</Button>
      }
    >
      <div className="s4-match-run-process">
        <ProgressBar
          value={running ? 58 : 100}
          label={running ? "已处理 74 / 128 位候选人" : "128 位候选人处理完成"}
        />
        {[
          [
            "读取岗位与候选人资料",
            "已完成",
            "读取岗位 v3 与 128 位候选人当前资料版本。",
            "success",
          ],
          [
            "执行硬门槛检查",
            "已完成",
            "学历、工作年限与角色硬门槛已完成代码校验。",
            "success",
          ],
          [
            "评估角色适配与综合得分",
            running ? "运行中" : "已完成",
            running
              ? "正在处理第 75 位候选人。"
              : "88 位角色适配通过，21 位有条件匹配，10 位被硬门槛拒绝。",
            running ? "info" : "success",
          ],
          [
            "写入可审核结果",
            running ? "等待" : "已完成",
            running
              ? "将在全部校验完成后统一交付。"
              : "8 位资料不足的候选人保留在未完成匹配中，1 位已由用户移除。",
            running ? "neutral" : "success",
          ],
        ].map(([title, status, detail, tone]) => (
          <article key={title}>
            <i className={`is-${tone}`}>
              <Icon
                name={
                  tone === "success"
                    ? "check"
                    : tone === "info"
                      ? "refresh"
                      : "clock"
                }
              />
            </i>
            <span>
              <b>{title}</b>
              <p>{detail}</p>
            </span>
            <StatusBadge tone={tone}>{status}</StatusBadge>
          </article>
        ))}
      </div>
    </Modal>
  );
}

function RelatedWork({ processingRecords, onOpenProcessing }) {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <FieldGroup title="相关工作">
        <button
          type="button"
          className="s4-related-mainline"
          onClick={() => navigate("/works/position-vla")}
        >
          <i>
            <Icon name="route" />
          </i>
          <span>
            <small>岗位招聘</small>
            <b>星澜机器人 · 具身智能团队招聘</b>
            <p>持续汇总候选人召回、匹配、审核和岗位推进结果。</p>
          </span>
          <StatusBadge tone="warning">等待候选人审核</StatusBadge>
          <Icon name="chevronRight" />
        </button>
      </FieldGroup>
      <FieldGroup
        title="AI 处理记录"
        description="当前岗位上的解析、匹配与内容生成记录，不进入工作列表。"
      >
        <AssetAiProcessHistory
          records={processingRecords}
          onOpen={onOpenProcessing}
        />
      </FieldGroup>
      <FieldGroup title="活动记录">
        <ActivityTimeline
          items={[
            [
              "今天 09:40",
              "匹配完成",
              "完成 128 位候选人匹配并生成可审核结果。",
              "人岗匹配",
            ],
            [
              "昨天 17:21",
              "岗位资料更新",
              "确认岗位 JD v3 和三项招聘要求。",
              "沈岚",
            ],
            [
              "08-18 12:08",
              "创建岗位",
              "从招聘机会拆分并创建正式岗位。",
              "星澜机器人客户开发",
            ],
          ]}
        />
      </FieldGroup>
    </div>
  );
}

export function PositionDetailPage() {
  const { positionId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const aiState = params.get("ai") || "idle";
  const aiPanel = params.get("panel") || "";
  const aiTimerRef = useRef(null);
  const item =
    positions.find((position) => position.id === positionId) ||
    (positionId === "position-vla" ? positionDetail : null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateQuery = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "")
        next.delete(key);
      else next.set(key, value);
    });
    setParams(next);
  };
  const setAiState = (state) =>
    updateQuery({
      tab: "profile",
      ai: state === "idle" ? null : state,
      panel: null,
      process: null,
    });
  const startAiProcessing = () => {
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    setAiState("running");
    aiTimerRef.current = window.setTimeout(() => {
      updateQuery({ tab: "profile", ai: "review", panel: null, process: null });
      notify("岗位 AI 解析完成，4 项建议等待审核", "info");
    }, 4200);
  };
  useEffect(
    () => () => {
      if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    },
    [],
  );
  useEffect(() => {
    const active = ["running", "review", "failed"].includes(aiState);
    const payload = active
      ? {
          state: aiState,
          title: "岗位 AI 解析",
          target: "具身智能 VLA 算法负责人",
          route: `/positions/position-vla?tab=profile&ai=${aiState}&panel=details&process=position-analysis-v4`,
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
  if (!item)
    return <NotFoundState label="岗位" onBack={() => navigate("/positions")} />;
  const detail = { ...positionDetail, ...item };
  const aiRecord = buildPositionAiRecord(
    ["running", "review", "failed"].includes(aiState) ? aiState : "complete",
  );
  const processingRecords = ["running", "review", "failed"].includes(aiState)
    ? [aiRecord, buildPositionAiRecord("complete")]
    : [buildPositionAiRecord("complete")];
  const selectedProcessId = params.get("process");
  const selectedProcessingRecord =
    processingRecords.find((record) => record.id === selectedProcessId) ||
    processingRecords[0];
  return (
    <div className="s4-detail-page">
      <DetailHeader
        icon="briefcase"
        title={detail.name}
        subtitle={`${detail.company} · ${detail.location}`}
        badges={[
          {
            label: detail.status,
            tone: detail.status === "招聘中" ? "success" : "warning",
          },
          { label: "岗位资料 v3", tone: "info" },
        ]}
        onBack={() => navigate("/positions")}
        onDelete={() => setDeleteOpen(true)}
      >
        <Button
          icon="sparkles"
          onClick={() => navigate(`/new?prompt=为${detail.name}寻找候选人`)}
        >
          开始找人
        </Button>
      </DetailHeader>
      <DetailTabs
        tabs={tabs}
        value={tab}
        onChange={(value) =>
          updateQuery({ tab: value, panel: null, process: null })
        }
      />
      {tab === "profile" ? (
        <PositionProfile
          detail={detail}
          aiState={aiState}
          aiPanel={aiPanel}
          aiRecord={aiRecord}
          onOpenAiSetup={() => setAiState("setup")}
          onOpenAiDetails={() =>
            updateQuery({ panel: "details", process: aiRecord.id })
          }
          onOpenAiReview={() => updateQuery({ panel: "review" })}
          onCloseAiPanel={() => {
            if (aiState === "setup") setAiState("idle");
            else updateQuery({ panel: null, process: null });
          }}
          onStartAi={startAiProcessing}
          onStopAi={() => {
            if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
            setAiState("idle");
            notify("岗位 AI 解析已停止，正式岗位资料没有变化", "info");
          }}
          onRetryAi={startAiProcessing}
          onApplyAi={(selected) => {
            updateQuery({ tab: "profile", ai: "complete", panel: null });
            notify(`已应用 ${selected.length} 项建议，岗位资料更新为 v4`);
          }}
        />
      ) : null}
      {tab === "pipeline" ? <CandidatePipeline /> : null}
      {tab === "matching" ? <MatchingResults /> : null}
      {tab === "work" ? (
        <RelatedWork
          processingRecords={processingRecords}
          onOpenProcessing={(record) =>
            updateQuery({ panel: "details", process: record.id })
          }
        />
      ) : null}
      <AssetAiProcessDrawer
        open={aiPanel === "details"}
        close={() => updateQuery({ panel: null, process: null })}
        record={selectedProcessingRecord}
        onOpenWork={() => navigate("/works/position-vla")}
        primaryLabel={
          selectedProcessingRecord.state === "review"
            ? "审核解析结果"
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
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="岗位"
        assetName={detail.name}
        impact="候选人档案和公司不会删除；岗位推进、匹配与相关工作保留已删除引用，30 天内可恢复。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("岗位已进入回收站");
          navigate("/positions");
        }}
      />
    </div>
  );
}

export function PositionCreatePage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [mode, setMode] = useState("manual");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [requirements, setRequirements] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const create = () => {
    setSubmitted(true);
    if (!name.trim() || !company.trim() || !requirements.trim()) return;
    notify("岗位已创建");
    navigate("/positions/position-vla");
  };
  return (
    <div className="s4-create-page">
      <AssetPageHeader
        eyebrow="岗位"
        title="新建岗位"
        description="手动创建正式岗位，或让 Hunter 根据自然语言和 JD 建立岗位资料。"
        actions={<Button onClick={() => navigate("/positions")}>取消</Button>}
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
              <small>填写岗位资料</small>
            </span>
          </button>
          <button
            type="button"
            className={mode === "agent" ? "is-active" : ""}
            onClick={() => setMode("agent")}
          >
            <Icon name="sparkles" />
            <span>
              <b>AI 解析 JD</b>
              <small>对话创建岗位</small>
            </span>
          </button>
        </aside>
        <section className="s4-create-workspace">
          {mode === "manual" ? (
            <>
              <header>
                <h2>岗位基础资料</h2>
                <p>基本招聘要求可以是完整 JD，也可以是能说明目标的几句话。</p>
              </header>
              <div className="s4-form-grid">
                <FormField
                  label="岗位名称"
                  required
                  error={submitted && !name.trim() ? "请输入岗位名称" : ""}
                >
                  <TextInput
                    value={name}
                    onChange={setName}
                    placeholder="例如：具身智能 VLA 算法负责人"
                  />
                </FormField>
                <FormField
                  label="招聘公司原文"
                  required
                  error={submitted && !company.trim() ? "请输入招聘公司" : ""}
                >
                  <TextInput value={company} onChange={setCompany} />
                </FormField>
                <FormField label="正式公司关联">
                  <SelectMenu
                    label="选择公司"
                    value=""
                    options={["星澜机器人", "拓界机器人", "灵跃科技"]}
                    onChange={() => {}}
                    searchable
                  />
                </FormField>
                <FormField label="工作地点">
                  <TextInput value="" onChange={() => {}} />
                </FormField>
                <FormField label="薪资下限">
                  <TextInput
                    value=""
                    onChange={() => {}}
                    placeholder="万元 / 年"
                  />
                </FormField>
                <FormField label="薪资上限">
                  <TextInput
                    value=""
                    onChange={() => {}}
                    placeholder="万元 / 年"
                  />
                </FormField>
                <FormField
                  label="基本招聘要求"
                  required
                  span={2}
                  error={
                    submitted && !requirements.trim()
                      ? "请输入完整 JD 或能够说明招聘目标的内容"
                      : ""
                  }
                >
                  <TextArea
                    value={requirements}
                    onChange={setRequirements}
                    rows={12}
                    placeholder="粘贴岗位 JD，或用几句话说明要找什么样的人、需要哪些经验与背景。"
                  />
                </FormField>
              </div>
              <footer>
                <Button tone="primary" onClick={create}>
                  创建岗位
                </Button>
              </footer>
            </>
          ) : (
            <div className="s4-agent-create-entry">
              <i>
                <Icon name="sparkles" />
              </i>
              <h2>用自然语言创建岗位</h2>
              <p>
                Hunter
                会先理解招聘目标、进行公开网络调研，并在写入前提供完整岗位资料供你确认。
              </p>
              <div>
                <span>例如：</span>
                <p>
                  我们想找一个做 VLA
                  的算法负责人，要做过真实机器人部署，最好带过 8
                  人以上团队，Base 北京。
                </p>
              </div>
              <Button
                tone="primary"
                icon="message"
                onClick={() =>
                  navigate(
                    "/new?prompt=我们想找一个做 VLA 的算法负责人，要做过真实机器人部署，最好带过 8 人以上团队，Base 北京",
                  )
                }
              >
                开始对话
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
