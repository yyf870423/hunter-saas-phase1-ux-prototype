import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  ActivityTimeline,
  AssetPageHeader,
  Button,
  CustomCheckbox,
  DefinitionGrid,
  DeleteAssetModal,
  DetailHeader,
  DetailTabs,
  EntityLink,
  FieldGroup,
  FormField,
  Modal,
  NotFoundState,
  SelectMenu,
  StateBanner,
  StatusBadge,
  StatusFromText,
  TagList,
  TextArea,
  TextInput,
  useToast,
} from "./asset-ui";
import { candidates, matchResults, positionDetail, positions } from "./data";

const tabs = [
  { value: "profile", label: "岗位资料" },
  { value: "pipeline", label: "候选人流程", count: 18 },
  { value: "matching", label: "匹配结果", count: 18 },
  { value: "work", label: "相关工作" },
];

function PositionProfile({ detail, onEdit }) {
  const navigate = useNavigate();
  const notify = useToast();
  const [versionOpen, setVersionOpen] = useState(false);
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="岗位基本资料"
        action={
          <Button size="sm" icon="edit" onClick={onEdit}>
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
          ]}
        />
        <div className="s4-labeled-row">
          <b>关键技能</b>
          <TagList items={detail.skills} tone="info" />
        </div>
        <div className="s4-labeled-row">
          <b>来源机会</b>
          <button
            type="button"
            className="s4-inline-link"
            onClick={() => navigate("/opportunities/opportunity-xinglan")}
          >
            {detail.sourceOpportunity}
          </button>
        </div>
      </FieldGroup>
      <FieldGroup
        title="当前岗位 JD"
        description={`${detail.jdVersion} · 当前有效版本`}
        action={
          <div className="s4-group-actions">
            <Button size="sm" onClick={() => setVersionOpen(true)}>
              版本历史
            </Button>
            <Button
              size="sm"
              icon="sparkles"
              onClick={() =>
                navigate("/new?prompt=重新解析具身智能 VLA 算法负责人岗位")
              }
            >
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
            onClick={() => notify("已打开已确认要求编辑")}
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
            onClick={() => notify("已进入寻访关键词编辑")}
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
        size="lg"
        title="岗位 JD 版本"
        description="恢复历史版本会形成新的变化记录，不覆盖审计历史"
      >
        <div className="s4-version-list">
          <article className="is-current">
            <span>
              <b>v3 · 当前版本</b>
              <small>2026-08-19 · 岗位解析后用户确认</small>
            </span>
            <StatusBadge tone="success">当前</StatusBadge>
          </article>
          <article>
            <span>
              <b>v2</b>
              <small>2026-08-12 · 客户补充团队规模与地点</small>
            </span>
            <Button
              size="sm"
              onClick={() => {
                setVersionOpen(false);
                notify("v2 已恢复为新版本 v4");
              }}
            >
              恢复
            </Button>
          </article>
          <article>
            <span>
              <b>v1 · 原始 JD</b>
              <small>2026-08-08 · 用户输入</small>
            </span>
            <Button
              size="sm"
              onClick={() => {
                setVersionOpen(false);
                notify("v1 已恢复为新版本 v4");
              }}
            >
              恢复
            </Button>
          </article>
        </div>
      </Modal>
    </div>
  );
}

const pipelineGroups = [
  ["储备", "reserve", ["赵星羽", "何文婷", "蒋一帆"]],
  ["推荐", "active", ["林昊", "陈楚宁"]],
  ["一面", "active", ["周明远"]],
  ["二面", "active", ["梁辰"]],
  ["谈薪", "active", ["高远"]],
  ["已入职", "success", ["杨帆"]],
  ["失败", "danger", ["孙然", "王奕"]],
];

function CandidatePipeline() {
  const notify = useToast();
  const [view, setView] = useState("board");
  const [stageModal, setStageModal] = useState(false);
  const [moveTarget, setMoveTarget] = useState(null);
  const [filter, setFilter] = useState("全部");
  const visibleGroups =
    filter === "全部"
      ? pipelineGroups
      : pipelineGroups.filter(([name]) => name === filter);
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
        <SelectMenu
          label="全部阶段"
          value={filter === "全部" ? "" : filter}
          options={["全部", ...pipelineGroups.map(([name]) => name)]}
          onChange={setFilter}
        />
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
        {[
          ["储备", 12],
          ["推进中", 6],
          ["已入职", 1],
          ["失败", 5],
        ].map(([label, count]) => (
          <article key={label}>
            <small>{label}</small>
            <b>{count}</b>
          </article>
        ))}
      </div>
      {view === "board" ? (
        <div className="s4-kanban">
          {visibleGroups.map(([stageName, tone, people]) => (
            <section className={`s4-kanban-${tone}`} key={stageName}>
              <header>
                <b>{stageName}</b>
                <em>{people.length}</em>
              </header>
              <div>
                {people.map((personName) => (
                  <article key={personName}>
                    <span>
                      <b>{personName}</b>
                      <small>
                        {candidates.find(
                          (candidate) => candidate.name === personName,
                        )?.company || "星澜机器人"}
                      </small>
                    </span>
                    <TagList
                      items={[personName === "林昊" ? "91 分" : "84 分"]}
                      tone="info"
                    />
                    <p>
                      {personName === "周明远"
                        ? "等待客户确认二面"
                        : "最近推进：昨天"}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setMoveTarget({ name: personName, stage: stageName })
                      }
                    >
                      移动阶段
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <PipelineList onMove={setMoveTarget} />
      )}
      <StageConfigModal open={stageModal} close={() => setStageModal(false)} />
      <MoveStageModal
        target={moveTarget}
        close={() => setMoveTarget(null)}
        onSave={(next) => {
          notify(`${moveTarget?.name} 已移动到“${next}”`);
          setMoveTarget(null);
        }}
      />
    </div>
  );
}

function PipelineList({ onMove }) {
  return (
    <div className="s4-compact-table">
      <header>
        <span>候选人</span>
        <span>当前阶段</span>
        <span>最近推进</span>
        <span>备注</span>
        <span>操作</span>
      </header>
      {pipelineGroups.flatMap(([stage, , people]) =>
        people.map((name) => (
          <article key={name}>
            <b>
              {name}
              <small>
                {candidates.find((item) => item.name === name)?.company || "—"}
              </small>
            </b>
            <StatusBadge
              tone={
                stage === "已入职"
                  ? "success"
                  : stage === "失败"
                    ? "danger"
                    : "info"
              }
            >
              {stage}
            </StatusBadge>
            <span>昨天 16:20</span>
            <p>{stage === "失败" ? "当前岗位不再推进" : "等待下一步反馈"}</p>
            <button type="button" onClick={() => onMove({ name, stage })}>
              移动阶段
            </button>
          </article>
        )),
      )}
    </div>
  );
}

function StageConfigModal({ open, close }) {
  const notify = useToast();
  const [stages, setStages] = useState(positionDetail.stages);
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
          <Button
            tone="primary"
            onClick={() => {
              close();
              notify("岗位推进阶段已保存");
            }}
          >
            保存配置
          </Button>
        </>
      }
    >
      <div className="s4-stage-config">
        {stages.map((stage, index) => (
          <article key={stage}>
            <Icon name="menu" />
            <TextInput
              value={stage}
              onChange={(value) =>
                setStages((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? value : item,
                  ),
                )
              }
            />
            <SelectMenu
              label="稳定分类"
              value={
                index === 0
                  ? "储备"
                  : stage === "已入职"
                    ? "已入职"
                    : index > 5
                      ? "失败"
                      : "推进中"
              }
              options={["储备", "推进中", "已入职", "失败"]}
              onChange={() => {}}
            />
            <button
              type="button"
              disabled={index < 2}
              onClick={() =>
                setStages((current) =>
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
          onClick={() => setStages((current) => [...current, "新阶段"])}
        >
          添加阶段
        </Button>
      </div>
    </Modal>
  );
}

function MoveStageModal({ target, close, onSave }) {
  const [next, setNext] = useState("一面");
  const [note, setNote] = useState("");
  return (
    <Modal
      open={Boolean(target)}
      close={close}
      title={`移动 ${target?.name || "候选人"}`}
      description={`当前阶段：${target?.stage || "—"}`}
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={() => onSave(next)}>
            确认移动
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="目标阶段" required span={2}>
          <SelectMenu
            label="选择阶段"
            value={next}
            options={positionDetail.stages}
            onChange={setNext}
          />
        </FormField>
        <FormField label="转换备注" span={2}>
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

function MatchingResults() {
  const notify = useToast();
  const [selected, setSelected] = useState(matchResults[0]?.id);
  const [scope, setScope] = useState("全部结果");
  const current =
    matchResults.find((item) => item.id === selected) || matchResults[0];
  const rows =
    scope === "全部结果"
      ? matchResults
      : matchResults.filter((item) =>
          scope === "推荐"
            ? item.score >= 85 && item.roleGate !== "拒绝"
            : item.roleGate === "拒绝",
        );
  return (
    <div className="s4-match-workspace">
      <aside>
        <header>
          <span>
            <b>匹配结果</b>
            <small>资料版本：岗位 v3 · 策略 v12</small>
          </span>
          <Button
            size="sm"
            icon="refresh"
            onClick={() => notify("已创建全量重新匹配任务", "info")}
          >
            重新匹配
          </Button>
        </header>
        <div className="s4-match-filters">
          <SelectMenu
            label="结果范围"
            value={scope}
            options={["全部结果", "推荐", "硬门槛拒绝"]}
            onChange={setScope}
          />
          <span>共 {rows.length} 位</span>
        </div>
        <div className="s4-match-result-list">
          {rows.map((item) => (
            <button
              type="button"
              className={item.id === selected ? "is-active" : ""}
              key={item.id}
              onClick={() => setSelected(item.id)}
            >
              <strong>{item.score}</strong>
              <span>
                <b>{item.name}</b>
                <small>
                  {item.company} · {item.title}
                </small>
                <em>
                  {item.roleGate === "拒绝"
                    ? "硬门槛拒绝"
                    : item.roleGate === "有条件"
                      ? "有条件匹配"
                      : "角色适配通过"}
                </em>
              </span>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      </aside>
      <section>
        <header className="s4-match-detail-head">
          <span>
            <small>候选人匹配详情</small>
            <h2>{current.name}</h2>
            <p>
              {current.company} · {current.title}
            </p>
          </span>
          <strong>
            {current.score}
            <small>综合分</small>
          </strong>
        </header>
        {current.roleGate === "拒绝" ? (
          <StateBanner
            tone="danger"
            icon="warning"
            title="硬性角色门槛未通过"
            description="当前公开资料中的角色与岗位目标存在明显冲突，该候选人不进入推荐排序。"
          />
        ) : current.roleGate === "有条件" ? (
          <StateBanner
            tone="warning"
            icon="warning"
            title="有条件匹配"
            description="能力经历匹配，但当前职级显著高于目标角色，综合分已做折扣。"
          />
        ) : (
          <StateBanner
            tone="success"
            icon="check"
            title="角色适配通过"
            description="候选人当前职责和岗位目标在管理范围、交付责任与技术方向上匹配。"
          />
        )}
        <div className="s4-score-breakdown">
          {[
            ["技能与经验", 94],
            ["岗位角色", current.roleGate === "有条件" ? 68 : 92],
            ["行业与场景", 90],
            ["地点与意愿", 82],
          ].map(([label, score]) => (
            <div key={label}>
              <span>
                <b>{label}</b>
                <em>{score}</em>
              </span>
              <i>
                <b style={{ width: `${score}%` }} />
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
            <li>确认北京工作安排和团队管理范围预期。</li>
          </ol>
        </FieldGroup>
        <footer>
          <Button onClick={() => notify("已打开候选人详情")}>查看候选人</Button>
          <Button
            tone="primary"
            disabled={current.roleGate === "拒绝"}
            onClick={() => notify(`${current.name} 已加入岗位储备`)}
          >
            加入岗位储备
          </Button>
        </footer>
      </section>
    </div>
  );
}

function RelatedWork() {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <FieldGroup title="业务主线">
        <EntityLink
          icon="route"
          title="星澜机器人 · 具身智能团队招聘"
          meta="运行中 · 等待候选人审核"
          onClick={() => navigate("/workstreams/position-vla")}
        />
      </FieldGroup>
      <FieldGroup title="相关任务">
        <div className="s4-task-records">
          <article>
            <i>
              <Icon name="sparkles" />
            </i>
            <span>
              <b>岗位深度解析</b>
              <small>已完成 · 2026-08-19</small>
              <p>生成岗位定位、对标企业、软性和隐性要求及寻访关键词。</p>
            </span>
            <StatusBadge tone="success">完成</StatusBadge>
          </article>
          <article>
            <i>
              <Icon name="users" />
            </i>
            <span>
              <b>候选人全量匹配</b>
              <small>已完成 · 今天 09:40</small>
              <p>完成 18 位候选人匹配，发现 1 条结果因资料变化需要更新。</p>
            </span>
            <StatusBadge tone="warning">有更新</StatusBadge>
          </article>
        </div>
      </FieldGroup>
      <FieldGroup title="活动记录">
        <ActivityTimeline
          items={[
            ["今天 09:40", "匹配完成", "生成 18 条当前匹配结果。", "人岗匹配"],
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

function EditPositionModal({ open, close }) {
  const notify = useToast();
  const [name, setName] = useState(positionDetail.name);
  const [status, setStatus] = useState(positionDetail.status);
  const statusBlocked = status !== "招聘中";
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title="编辑岗位资料"
      description="当前 JD 和已确认要求在各自区域单独维护"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={statusBlocked}
            onClick={() => {
              close();
              notify("岗位资料已保存");
            }}
          >
            保存修改
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="岗位名称" required>
          <TextInput value={name} onChange={setName} />
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
            label="选择公司"
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
        <FormField label="用户备注" span={2}>
          <TextArea
            value="客户优先希望候选人具备真机数据闭环经验。"
            onChange={() => {}}
          />
        </FormField>
      </div>
      {statusBlocked ? (
        <StateBanner
          tone="warning"
          icon="warning"
          title="当前有 2 个运行中任务，暂时不能保存"
          description="暂停或关闭岗位前，需要先停止岗位招聘主线和候选人匹配任务。"
          action={
            <Button size="sm" onClick={() => notify("已打开相关任务")}>
              查看任务
            </Button>
          }
        />
      ) : null}
    </Modal>
  );
}

export function PositionDetailPage() {
  const { positionId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const item =
    positions.find((position) => position.id === positionId) ||
    (positionId === "position-vla" ? positionDetail : null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (!item)
    return <NotFoundState label="岗位" onBack={() => navigate("/positions")} />;
  const detail = { ...positionDetail, ...item };
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
        onEdit={() => setEditOpen(true)}
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
        onChange={(value) => setParams({ tab: value })}
      />
      {tab === "profile" ? (
        <PositionProfile detail={detail} onEdit={() => setEditOpen(true)} />
      ) : null}
      {tab === "pipeline" ? <CandidatePipeline /> : null}
      {tab === "matching" ? <MatchingResults /> : null}
      {tab === "work" ? <RelatedWork /> : null}
      <EditPositionModal open={editOpen} close={() => setEditOpen(false)} />
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="岗位"
        assetName={detail.name}
        impact="候选人档案和公司不会删除；岗位推进、匹配与业务主线保留已删除引用，30 天内可恢复。"
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
