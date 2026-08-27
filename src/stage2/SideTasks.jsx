import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  buildRecommendationReportVersions,
  buildRevisedRecommendationReport,
  RecommendationReportFile,
} from "../components/RecommendationReportFile";
import {
  Button,
  IconButton,
  Modal,
  SearchField,
  StatusBadge,
  useToast,
} from "../stage1/ui";
import { SelectMenu } from "../stage4/asset-ui";
import {
  Composer,
  HunterReply,
  PlanList,
  PlanUpdate,
  UserMessage,
  WorkHistory,
} from "./automation-ui";
import { workItems } from "./data";
import {
  buildRecommendationTaskArtifacts,
  TaskArtifactPreview,
} from "./TaskArtifactPreview";

const tabs = [
  ["all", "全部"],
  ["running", "运行中"],
  ["waiting", "等待处理"],
  ["finished", "已结束"],
];

const businessScenarios = [
  "全部业务场景",
  "客户开发",
  "岗位招聘",
  "人才摸排",
  "候选人求职",
];

function workInTab(work, tab) {
  if (tab === "running")
    return ["推进中", "进行中", "运行中", "重试中", "排队中"].includes(
      work.status,
    );
  if (tab === "waiting")
    return ["等待用户", "等待外部", "已暂停", "失败"].includes(work.status);
  if (tab === "finished") return ["完成", "已取消"].includes(work.status);
  return true;
}

export function WorksPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [scenario, setScenario] = useState("");
  const [page, setPage] = useState(1);
  const [deleteWork, setDeleteWork] = useState(null);
  const [rows, setRows] = useState(workItems);
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter(
      (work) =>
        workInTab(work, tab) &&
        (!scenario || work.scenario === scenario) &&
        (!keyword ||
          `${work.title} ${work.category} ${work.scenario} ${work.object}`
            .toLowerCase()
            .includes(keyword)),
    );
  }, [query, rows, scenario, tab]);
  return (
    <div className="s2-page s2-module-page">
      <header className="s2-page-heading">
        <div>
          <small>持续推进与独立交付</small>
          <h1>工作</h1>
          <p>
            查看所有可独立管理的工作；执行过程中拆出的相关任务保留在所属工作内。
          </p>
        </div>
        <Button tone="primary" icon="plus" onClick={() => navigate("/new")}>
          新建工作
        </Button>
      </header>
      <section className="s2-list-panel">
        <div className="s2-list-toolbar">
          <div
            className="s2-module-tabs app-tabs"
            role="tablist"
            aria-label="工作状态"
          >
            {tabs.map(([value, label]) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === value}
                className={tab === value ? "is-active" : ""}
                key={value}
                onClick={() => {
                  setTab(value);
                  setPage(1);
                }}
              >
                {label}
                <em>{rows.filter((work) => workInTab(work, value)).length}</em>
              </button>
            ))}
          </div>
          <div className="s2-list-filters">
            <SearchField
              value={query}
              onChange={(next) => {
                setQuery(next);
                setPage(1);
              }}
              placeholder="搜索工作、业务场景或关联对象"
            />
            <SelectMenu
              className="s2-scenario-filter"
              label="业务场景"
              value={scenario}
              options={businessScenarios}
              onChange={(next) => {
                setScenario(next === "全部业务场景" ? "" : next);
                setPage(1);
              }}
            />
          </div>
        </div>
        {visible.length ? (
          <div className="s2-task-table">
            <div className="s2-task-table-head">
              <span>工作</span>
              <span>业务场景</span>
              <span>关联对象</span>
              <span>状态</span>
              <span>最近活动</span>
              <span>操作</span>
            </div>
            {visible.slice((page - 1) * 5, page * 5).map((work) => (
              <div
                className="s2-task-row"
                role="link"
                tabIndex={0}
                key={work.id}
                onClick={() => navigate(`/works/${work.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/works/${work.id}`);
                  }
                }}
              >
                <span>
                  <b>{work.title}</b>
                  <small>{work.summary}</small>
                </span>
                <span>{work.scenario}</span>
                <span>{work.object}</span>
                <span>
                  <StatusBadge tone={work.tone}>{work.status}</StatusBadge>
                </span>
                <time>{work.time}</time>
                <span
                  className="s2-row-actions"
                  onClick={(event) => event.stopPropagation()}
                >
                  <IconButton
                    icon="chevronRight"
                    label={`查看 ${work.title}`}
                    onClick={() => navigate(`/works/${work.id}`)}
                  />
                  <IconButton
                    icon="trash"
                    label={`删除 ${work.title}`}
                    onClick={() => setDeleteWork(work)}
                  />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="s2-empty">
            <Icon name="task" />
            <h2>没有符合条件的工作</h2>
            <p>可以调整状态或搜索条件，也可以直接描述一项新的业务目标。</p>
            <Button
              tone="secondary"
              onClick={() => {
                setTab("all");
                setQuery("");
                setScenario("");
              }}
            >
              清空条件
            </Button>
          </div>
        )}
        <footer className="s2-pagination">
          <span>共 {visible.length} 项</span>
          <div>
            <IconButton
              icon="chevronLeft"
              label="上一页"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            />
            <b>{page}</b>
            <IconButton
              icon="chevronRight"
              label="下一页"
              disabled={page * 5 >= visible.length}
              onClick={() => setPage((value) => value + 1)}
            />
          </div>
        </footer>
      </section>
      <Modal
        open={Boolean(deleteWork)}
        close={() => setDeleteWork(null)}
        title="删除工作"
        description="工作将进入回收站，30 天内可以恢复。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setDeleteWork(null)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setRows((items) =>
                  items.filter((item) => item.id !== deleteWork.id),
                );
                setDeleteWork(null);
                notify("工作已移入回收站", "success");
              }}
            >
              删除并移入回收站
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>
            排队、运行、等待和重试中的执行会先安全停止；已写入的正式资产不会删除。
          </p>
          <p>该任务没有已经发生且无法撤销的外部动作。</p>
        </div>
      </Modal>
    </div>
  );
}

const taskPlan = [
  {
    id: "collect",
    title: "汇总现有人物与来源",
    detail: "读取人才版图和公开来源中已经存在的两组人物记录。",
    requirement: "核验两位“周明远”是否为同一个人。",
  },
  {
    id: "compare",
    title: "比较身份与任职证据",
    detail: "对比姓名、教育、任职时间和团队关系。",
    requirement: "只形成身份建议，不自动合并人物。",
  },
  {
    id: "decide",
    title: "交付消歧建议",
    detail: "无法安全判断时等待用户补充或选择。",
    requirement: "证据不足时必须停下来等待用户决定。",
  },
];

export function SideTaskDetail({ taskId: taskIdOverride }) {
  const { taskId: routeTaskId, workstreamId } = useParams();
  const taskId = taskIdOverride || routeTaskId || workstreamId;
  return taskId === "task-recommend-linhao" ? (
    <RecommendationReportTask taskId={taskId} />
  ) : (
    <IdentityReviewTask taskId={taskId || "task-hand-team"} />
  );
}

function TaskWorkspaceShell({ currentId, children }) {
  const navigate = useNavigate();
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  return (
    <div className="s2-page s2-workspace">
      <WorkHistory
        items={workItems}
        collapsed={historyCollapsed}
        currentId={currentId}
        onToggle={() => setHistoryCollapsed((value) => !value)}
        onCreate={() => navigate("/new")}
        onSelect={(item) => navigate(`/works/${item.id}`)}
      />
      <section className="s2-workstream-main s2-task-detail-page">
        {children}
      </section>
    </div>
  );
}

function IdentityReviewTask({ taskId }) {
  const navigate = useNavigate();
  const notify = useToast();
  const [paused, setPaused] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [authMode, setAuthMode] = useState("confirm");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const send = (text, files) => {
    setResolved(true);
    setComposer("");
    setAttachments([]);
    notify(
      files.length
        ? "补充资料已保存并从当前检查点继续"
        : "处理意见已保存并从当前检查点继续",
      "success",
    );
  };
  const visiblePlan = taskPlan.map((step, index) => ({
    ...step,
    status: resolved
      ? "done"
      : index < 2
        ? "done"
        : paused
          ? "paused"
          : "waiting-user",
    statusDetail:
      !resolved && index === 2
        ? paused
          ? "身份建议和已有证据已保留，继续后仍从当前决定节点恢复。"
          : "公开证据不足，等待用户补充最新任职信息或给出决定。"
        : undefined,
  }));
  const planUpdate = resolved
    ? {
        title: "计划已完成",
        detail: "用户补充最新任职信息后，身份建议已回流人才版图审核区。",
        time: "刚刚",
        tone: "info",
      }
    : paused
      ? {
          title: "计划已暂停",
          detail: "身份建议、证据和等待节点均已保留，继续后从当前检查点恢复。",
          time: "刚刚",
          tone: "warning",
        }
      : {
          title: "计划已调整为等待用户",
          detail: "公开证据不足以安全合并人物，自动判断已停止并保留现有结果。",
          time: "08:58",
          tone: "warning",
        };
  return (
    <TaskWorkspaceShell currentId={taskId}>
      <header className="s2-detail-header">
        <button type="button" onClick={() => navigate("/works")}>
          <Icon name="chevronLeft" />
          返回全部工作
        </button>
        <div>
          <small>人物身份核验</small>
          <h1>核验灵巧手团队负责人</h1>
          <p>关联：星澜机器人人才版图 · 创建人：沈岚</p>
        </div>
        <div>
          <StatusBadge
            tone={resolved ? "success" : paused ? "neutral" : "warning"}
          >
            {resolved ? "完成" : paused ? "已暂停" : "等待用户"}
          </StatusBadge>
          <Button
            tone="secondary"
            icon={paused ? "play" : "pause"}
            disabled={resolved}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "继续" : "暂停"}
          </Button>
          <IconButton
            icon="trash"
            label="删除任务"
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      </header>
      <div className="s2-task-detail-layout">
        <section className="s2-task-conversation">
          <div className="s2-task-timeline">
            <UserMessage time="今天 08:54">
              {sessionStorage.getItem("hunter-new-task-prompt") ||
                "核验人才版图中两位“周明远”是不是同一个人，只给身份建议，不要自动合并。"}
            </UserMessage>
            <HunterReply
              markdown={`我已经比较公开履历、任职时间、教育经历和团队关系。两组记录有较强重合，但目前仍存在一项无法自动消除的冲突。

## 当前判断

- 姓名、教育经历和早期任职一致。
- 一组资料显示 2025 年加入穹顶智能，另一组仍显示原公司。
- 两项来源都没有足够新鲜的直接联系方式。

## 待确认的两条记录

| 记录 | 人物 | 当前任职 | 来源更新 |
| --- | --- | --- | --- |
| A | 周明远 | 穹顶智能 · 具身智能算法总监 | 2026-08-17 |
| B | 周明远 | 矩阵机器人 · 机器人学习负责人 | 2025-11-08 |

> 建议暂时标记为“疑似同一人”，补充最新任职证据后再合并。系统不会在证据不足时自动合并人物。

可以直接在下方输入你掌握的任职信息，或上传相关文件。`}
            />
            {resolved ? (
              <>
                <UserMessage time="刚刚">
                  补充：这是同一个人，2025 年 12 月加入穹顶智能。
                </UserMessage>
                <HunterReply markdown="已记录你补充的任职事实，并将两组记录标记为同一人物的合并建议。该建议已回流“星澜机器人人才版图”的更新与审核区，仍需按当前写入规则完成审核。" />
              </>
            ) : null}
          </div>
          <div className="s2-task-composer-dock">
            <div className="s2-task-plan">
              <button
                type="button"
                aria-expanded={planOpen}
                onClick={() => setPlanOpen((value) => !value)}
              >
                <Icon name="task" />
                <span>
                  <b>执行计划</b>
                  <small>
                    {resolved
                      ? "3 / 3 项完成"
                      : paused
                        ? "2 / 3 项完成，当前已暂停"
                        : "2 / 3 项完成，等待身份决定"}
                  </small>
                </span>
                <Icon name={planOpen ? "chevronDown" : "chevronUp"} />
              </button>
              {planOpen ? (
                <div className="s2-task-plan-body">
                  <PlanUpdate update={planUpdate} />
                  <PlanList steps={visiblePlan} />
                </div>
              ) : null}
            </div>
            <Composer
              value={composer}
              onChange={setComposer}
              onSend={send}
              authMode={authMode}
              onAuthChange={setAuthMode}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder="输入你掌握的信息，或上传能够帮助核验的文件"
              disabled={paused || resolved}
            />
          </div>
        </section>
      </div>
      <Modal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        title="删除工作"
        description="工作将进入回收站，30 天内可以恢复。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setDeleteOpen(false);
                navigate("/works");
                notify("工作已移入回收站", "success");
              }}
            >
              删除并移入回收站
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>工作对话、计划和尚未写入正式资产的专属文件会一起进入回收站。</p>
          <p>人才版图中已经确认的正式人物记录不会删除。</p>
        </div>
      </Modal>
    </TaskWorkspaceShell>
  );
}

function RecommendationReportTask({ taskId }) {
  const navigate = useNavigate();
  const notify = useToast();
  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [authMode, setAuthMode] = useState("confirm");
  const candidateId = sessionStorage.getItem(
    "hunter-recommendation-candidate-id",
  );
  const [revised, setRevised] = useState(
    () =>
      Boolean(candidateId) &&
      sessionStorage.getItem(
        `hunter-recommendation-report-version-${candidateId}`,
      ) === "v3",
  );
  const [planOpen, setPlanOpen] = useState(false);
  const candidateName =
    sessionStorage.getItem("hunter-recommendation-candidate") || "林昊";
  const reportRequirement =
    sessionStorage.getItem("hunter-recommendation-task-prompt") ||
    "面向客户技术负责人，重点说明真机部署、团队管理和风险核实情况。";
  const baseReportVersions = buildRecommendationReportVersions(candidateName);
  const reportVersions = revised
    ? [buildRevisedRecommendationReport(candidateName), ...baseReportVersions]
    : baseReportVersions;
  const latestReport = reportVersions[0];
  const initialReport = baseReportVersions[1];
  const reviewedReport = baseReportVersions[0];
  const [previewArtifactId, setPreviewArtifactId] = useState(null);
  const taskArtifacts = useMemo(
    () => buildRecommendationTaskArtifacts(candidateName, reportVersions),
    [candidateName, revised],
  );
  const previewArtifact = taskArtifacts.find(
    (artifact) => artifact.id === previewArtifactId,
  );
  useEffect(() => {
    if (candidateId) {
      sessionStorage.setItem(
        `hunter-recommendation-report-${candidateId}`,
        "1",
      );
    }
  }, [candidateId]);
  const plan = [
    {
      id: "read",
      title: "读取候选人与岗位资料",
      detail: `使用当前岗位 v3 和${candidateName}候选人资料 v6。`,
      status: "done",
    },
    {
      id: "evidence",
      title: "组织匹配证据与风险",
      detail: "区分已核实事实、匹配判断和待客户确认项。",
      status: "done",
    },
    {
      id: "draft",
      title: "交付并修改推荐报告",
      detail: revised
        ? "已按用户要求完成第二版报告。"
        : "初稿已生成，等待用户反馈。",
      status: revised ? "done" : "waiting-user",
    },
  ];
  return (
    <TaskWorkspaceShell currentId={taskId}>
      <header className="s2-detail-header">
        <button type="button" onClick={() => navigate("/works")}>
          <Icon name="chevronLeft" />
          返回全部工作
        </button>
        <div>
          <small>候选人推荐报告</small>
          <h1>为{candidateName}生成客户推荐报告</h1>
          <p>关联：具身智能 VLA 算法负责人 · {candidateName}</p>
        </div>
        <div>
          <Button
            size="sm"
            onClick={() => navigate("/positions/position-vla?tab=matching")}
          >
            查看岗位匹配
          </Button>
          <StatusBadge tone={revised ? "success" : "warning"}>
            {revised ? "完成" : "等待用户"}
          </StatusBadge>
        </div>
      </header>
      <div
        className={`s2-task-detail-layout ${previewArtifact ? "has-artifact" : ""}`}
      >
        <section className="s2-task-conversation">
          <div className="s2-task-timeline">
            <UserMessage time="今天 10:08">{reportRequirement}</UserMessage>
            <HunterReply
              markdown={`推荐报告初稿已经生成。

- 使用岗位资料 **v3**、候选人资料 **v6** 和当前匹配结论；
- 已将未确认的团队规模、薪资和到岗时间放入风险提示；
- 报告以文件交付，可以在线查看或下载。

你可以继续在对话中提出修改意见，每次修改都会生成一个新的报告文件。`}
            />
            <RecommendationReportFile
              candidateName={candidateName}
              report={initialReport}
              onPreview={(item) =>
                setPreviewArtifactId(`report-${item.version}`)
              }
            />
            <UserMessage time="今天 10:20">
              把开头改得更适合直接发给客户，并补充团队规模，但不要删除风险提示。
            </UserMessage>
            <HunterReply markdown="已按要求调整：开头改为客户可直接阅读的推荐摘要，并在核心证据中补充当前管理的团队规模；原有风险提示和待核实项均保留。" />
            <RecommendationReportFile
              candidateName={candidateName}
              report={reviewedReport}
              onPreview={(item) =>
                setPreviewArtifactId(`report-${item.version}`)
              }
            />
            {revised ? (
              <>
                <UserMessage time="刚刚">
                  请进一步突出量产交付经验，并把薪资风险放到最后。
                </UserMessage>
                <HunterReply markdown="已完成新一轮修改：优先呈现量产和真实场景交付证据，薪资风险移动到报告末尾，未删除任何待核实信息。" />
                <RecommendationReportFile
                  candidateName={candidateName}
                  report={latestReport}
                  onPreview={(item) =>
                    setPreviewArtifactId(`report-${item.version}`)
                  }
                />
              </>
            ) : null}
          </div>
          <div className="s2-task-composer-dock">
            <div className="s2-task-plan">
              <button
                type="button"
                aria-expanded={planOpen}
                onClick={() => setPlanOpen((value) => !value)}
              >
                <Icon name="task" />
                <span>
                  <b>执行计划</b>
                  <small>
                    {revised ? "3 / 3 项完成" : "2 / 3 项完成，等待修改意见"}
                  </small>
                </span>
                <Icon name={planOpen ? "chevronDown" : "chevronUp"} />
              </button>
              {planOpen ? (
                <div className="s2-task-plan-body">
                  <PlanList steps={plan} />
                </div>
              ) : null}
            </div>
            <Composer
              value={composer}
              onChange={setComposer}
              onSend={() => {
                setRevised(true);
                const candidateId = sessionStorage.getItem(
                  "hunter-recommendation-candidate-id",
                );
                if (candidateId) {
                  sessionStorage.setItem(
                    `hunter-recommendation-report-version-${candidateId}`,
                    "v3",
                  );
                }
                setComposer("");
                setAttachments([]);
                notify("报告已按补充要求更新", "success");
              }}
              authMode={authMode}
              onAuthChange={setAuthMode}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder="输入报告修改要求，或上传需要引用的补充资料"
            />
          </div>
        </section>
        {previewArtifact ? (
          <TaskArtifactPreview
            artifact={previewArtifact}
            artifacts={taskArtifacts}
            onSelect={setPreviewArtifactId}
            onClose={() => setPreviewArtifactId(null)}
          />
        ) : null}
      </div>
    </TaskWorkspaceShell>
  );
}
