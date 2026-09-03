import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  Button,
  EmptyState,
  IconButton,
  Modal,
  SearchField,
  Skeleton,
  StatusBadge,
  useToast,
} from "../stage1/ui";
import { DatePicker, SelectMenu } from "../stage4/asset-ui";
import {
  Composer,
  DecisionRequest,
  HunterReply,
  PlanList,
  UserMessage,
} from "./automation-ui";
import { TaskAreaNav } from "./TaskAreaNav";

const timeRangeOptions = [
  "近一天",
  "近三天",
  "近一周",
  "近两周",
  "近一个月",
  "自定义",
];
const referenceDate = new Date("2026-09-03T23:59:59+08:00");
const rangeDays = {
  近一天: 1,
  近三天: 3,
  近一周: 7,
  近两周: 14,
  近一个月: 30,
};

function runInTimeRange(run, range, customStart, customEnd) {
  const runDate = new Date(`${run.startedAtDate}T12:00:00+08:00`);
  if (range === "自定义") {
    const start = customStart
      ? new Date(`${customStart}T00:00:00+08:00`)
      : null;
    const end = customEnd ? new Date(`${customEnd}T23:59:59+08:00`) : null;
    return (!start || runDate >= start) && (!end || runDate <= end);
  }
  const days = rangeDays[range] || 7;
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return runDate >= start && runDate <= referenceDate;
}

const periodicTasks = [
  {
    id: "periodic-startups",
    title: "每周发现具身智能创业公司与招聘机会",
    prompt:
      "每周检查中国大陆具身智能创业公司、融资与核心团队招聘变化，核验后整理高价值公司、招聘机会和负责人线索。",
    scenarios: ["客户开发", "洞察发现"],
    schedule: "每周一 09:00",
    nextRun: "9 月 7 日 09:00",
    lastRun: "今天 09:00",
    status: "已启用",
    tone: "success",
    destination: "新信号进入洞察中心；公司与联系人草稿等待确认",
    memory:
      "已覆盖 86 家公司；忽略工业设备经销商；同一公司 30 天内无实质变化不重复提醒。",
  },
  {
    id: "periodic-position-refresh",
    title: "每 3 天更新招聘中岗位的人岗匹配",
    prompt:
      "检查招聘中岗位和最近更新的候选人，只重算受影响的匹配关系，并汇总分数、门槛和推荐建议的变化。",
    scenarios: ["岗位招聘", "人岗匹配"],
    schedule: "每 3 天 10:00",
    nextRun: "9 月 6 日 10:00",
    lastRun: "9 月 1 日 10:00",
    status: "等待用户",
    tone: "warning",
    destination: "更新岗位匹配结果；冲突项等待确认",
    memory:
      "只处理招聘中岗位；角色层级硬门槛保持不变；已人工标记不合适的人选不重复推荐。",
  },
  {
    id: "periodic-graph-refresh",
    title: "每月更新机器人行业知识图谱",
    prompt:
      "结合新增公司、候选人、论文和专利，更新机器人行业公司关系、人才流动和学术合作关系。",
    scenarios: ["知识图谱", "关系更新"],
    schedule: "每月 1 日 08:30",
    nextRun: "10 月 1 日 08:30",
    lastRun: "9 月 1 日 08:30",
    status: "已启用",
    tone: "success",
    destination: "高可信关系自动更新；疑似关系进入对应图谱审核",
    memory:
      "以正式资产和可追溯证据为输入；用户否认的关系不会在证据未变化时再次提出。",
  },
  {
    id: "periodic-candidate-change",
    title: "每两周核验重点候选人公开变化",
    prompt:
      "核验重点候选人收藏夹中的公开任职、成果和团队变化，只保留值得猎头注意的变化。",
    scenarios: ["候选人", "洞察发现"],
    schedule: "每两周周五 17:00",
    nextRun: "已暂停",
    lastRun: "8 月 28 日 17:00",
    status: "已暂停",
    tone: "neutral",
    destination: "值得注意的变化进入洞察中心",
    memory: "仅核验重点候选人收藏夹；不把用户主动录入的资料生成为洞察。",
  },
];

const periodicRuns = [
  {
    id: "run-startups-active",
    taskId: "periodic-startups",
    task: "每周发现具身智能创业公司与招聘机会",
    startedAt: "今天 09:26",
    startedAtDate: "2026-09-03",
    duration: "运行 7 分钟",
    status: "正在运行",
    tone: "info",
    summary: "正在核验新成立公司、融资动态与核心团队招聘变化。",
    scope: "中国大陆 · 具身智能 · 新成立至 B 轮",
    result: "已核验 43 / 86 家公司，正在合并重复线索",
    memory: "本轮完成前不会覆盖上一次成功记忆和处理水位。",
  },
  {
    id: "run-position-waiting",
    taskId: "periodic-position-refresh",
    task: "每 3 天更新招聘中岗位的人岗匹配",
    startedAt: "今天 10:00",
    startedAtDate: "2026-09-03",
    duration: "运行 14 分钟",
    status: "等待用户",
    tone: "warning",
    summary: "两位候选人的身份合并结论冲突，确认后才能继续更新匹配结果。",
    scope: "8 个招聘中岗位 · 31 位资料有变化的候选人",
    result: "已完成 6 个岗位；2 个岗位等待身份冲突处理",
    memory: "等待期间不覆盖上次成功结果；后续触发会合并为一次补跑。",
  },
  {
    id: "run-startups-success",
    taskId: "periodic-startups",
    task: "每周发现具身智能创业公司与招聘机会",
    startedAt: "今天 09:00",
    startedAtDate: "2026-09-03",
    duration: "12 分 36 秒",
    status: "已完成",
    tone: "success",
    summary: "核验 73 家公司，合并 19 条重复线索，产生 7 条新洞察。",
    scope: "中国大陆 · 具身智能 · 新成立至 B 轮",
    result: "3 条高优先级洞察、4 条观察项",
    memory: "覆盖水位已更新至今天 09:00。",
  },
  {
    id: "run-graph-empty",
    taskId: "periodic-graph-refresh",
    task: "每月更新机器人行业知识图谱",
    startedAt: "9 月 1 日 08:30",
    startedAtDate: "2026-09-01",
    duration: "8 分 42 秒",
    status: "无变化",
    tone: "neutral",
    summary: "本轮没有发现足以更新正式关系的新证据。",
    scope: "12 张知识图谱 · 208 个正式节点",
    result: "0 条更新；已记录本轮核验范围",
    memory: "成功水位已推进，下一轮不会重复核验相同资料。",
  },
  {
    id: "run-candidate-partial",
    taskId: "periodic-candidate-change",
    task: "每两周核验重点候选人公开变化",
    startedAt: "8 月 28 日 17:00",
    startedAtDate: "2026-08-28",
    duration: "18 分 03 秒",
    status: "部分完成",
    tone: "warning",
    summary: "已核验 111 位候选人，17 位的公开来源暂不可用。",
    scope: "重点候选人收藏夹 · 128 人",
    result: "产生 2 条洞察；失败来源可在下轮增量重试",
    memory: "只推进已成功对象的水位，失败对象保留原水位。",
  },
  {
    id: "run-startups-stopped",
    taskId: "periodic-startups",
    task: "每周发现具身智能创业公司与招聘机会",
    startedAt: "8 月 24 日 09:00",
    startedAtDate: "2026-08-24",
    duration: "运行 4 分 21 秒",
    status: "已停止",
    tone: "neutral",
    summary: "用户在检索阶段停止了本轮运行，已保留证据和处理水位。",
    scope: "已核验 21 家公司",
    result: "本轮未写入洞察或正式资产",
    memory: "未覆盖上次成功记忆；下轮从上次成功水位继续。",
  },
  {
    id: "run-position-catchup",
    taskId: "periodic-position-refresh",
    task: "每 3 天更新招聘中岗位的人岗匹配",
    startedAt: "8 月 22 日 10:00",
    startedAtDate: "2026-08-22",
    duration: "21 分 15 秒",
    status: "补跑完成",
    tone: "success",
    summary: "合并等待期间错过的 2 次触发，一次覆盖上次成功以来的全部变化。",
    scope: "5 天增量 · 11 个岗位 · 44 位候选人",
    result: "更新 23 条匹配结果，没有创建重复运行",
    memory: "连续记忆和成功水位均已更新。",
  },
];

function StateView({ state, onReset }) {
  if (state === "loading") {
    return (
      <section
        className="s2-periodic-state is-loading"
        aria-label="周期性任务正在加载"
      >
        <Skeleton className="s1-sk-title" />
        {[1, 2, 3, 4].map((item) => (
          <Skeleton className="s1-sk-row" key={item} />
        ))}
      </section>
    );
  }
  if (state === "empty") {
    return (
      <EmptyState
        icon="refresh"
        title="还没有周期性任务"
        description="用自然语言说明要重复完成的猎头工作和执行周期，Hunter 会整理成可确认的计划。"
        action={
          <Button tone="primary" icon="plus" onClick={onReset}>
            新建周期性任务
          </Button>
        }
      />
    );
  }
  return (
    <section className="s2-periodic-state" role="alert">
      <Icon name={state === "disabled" ? "lock" : "warning"} />
      <div>
        <h2>
          {state === "disabled" ? "周期性任务暂不可用" : "周期性任务加载失败"}
        </h2>
        <p>
          {state === "disabled"
            ? "当前工作空间没有创建周期性任务的权限，已有运行记录仍可查看。"
            : "任务和运行记录没有丢失，可以重新加载当前页面。"}
        </p>
      </div>
      <Button tone="secondary" icon="refresh" onClick={onReset}>
        {state === "disabled" ? "查看运行记录" : "重新加载"}
      </Button>
    </section>
  );
}

function PeriodicTaskDetail({ task, runs, onRun, onToggle, onDelete, onBack }) {
  const navigate = useNavigate();
  return (
    <aside className="s2-periodic-detail">
      <button
        type="button"
        className="s2-periodic-mobile-back"
        onClick={onBack}
      >
        <Icon name="chevronLeft" />
        返回周期任务
      </button>
      <header>
        <div>
          <small>周期性任务</small>
          <h2>{task.title}</h2>
          <div className="s2-periodic-scenarios">
            {task.scenarios.map((scenario) => (
              <span key={scenario}>{scenario}</span>
            ))}
          </div>
        </div>
        <StatusBadge tone={task.tone}>{task.status}</StatusBadge>
      </header>
      <div className="s2-periodic-metrics">
        <div>
          <small>执行周期</small>
          <b>{task.schedule}</b>
        </div>
        <div>
          <small>下次运行</small>
          <b>{task.nextRun}</b>
        </div>
        <div>
          <small>上次运行</small>
          <b>{task.lastRun}</b>
        </div>
      </div>
      <div className="s2-periodic-actions">
        <Button tone="primary" icon="play" onClick={onRun}>
          立即运行
        </Button>
        <Button
          tone="secondary"
          icon={task.status === "已暂停" ? "play" : "pause"}
          onClick={onToggle}
        >
          {task.status === "已暂停" ? "继续" : "暂停"}
        </Button>
        <Button
          tone="secondary"
          icon="edit"
          onClick={() => navigate(`/new?mode=periodic&edit=${task.id}`)}
        >
          调整任务
        </Button>
        <Button tone="ghost" icon="trash" onClick={onDelete}>
          删除
        </Button>
      </div>
      <div className="s2-periodic-body">
        <section>
          <h3>任务要求</h3>
          <p>{task.prompt}</p>
        </section>
        <section>
          <h3>结果去向</h3>
          <p>{task.destination}</p>
        </section>
        <section>
          <h3>连续记忆</h3>
          <p>{task.memory}</p>
          <small>失败或停止的运行不会覆盖上一次成功记忆。</small>
        </section>
        <section>
          <h3>最近运行</h3>
          <div className="s2-periodic-recent-runs">
            {runs
              .filter((run) => run.taskId === task.id)
              .slice(0, 3)
              .map((run) => (
                <button
                  type="button"
                  key={run.id}
                  onClick={() =>
                    navigate(`/tasks/periodic?view=runs&run=${run.id}`)
                  }
                >
                  <span>
                    <b>{run.status}</b>
                    <small>
                      {run.startedAt} · {run.duration}
                    </small>
                  </span>
                  <Icon name="chevronRight" />
                </button>
              ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function buildRunPlan(run, resolved, followUpCount, stopped) {
  const completed = ["已完成", "无变化", "部分完成", "补跑完成"].includes(
    run.status,
  );
  const waiting = run.status === "等待用户" && !resolved;
  const running = run.status === "正在运行" && !stopped;
  const stoppedRun = run.status === "已停止" || stopped;
  const followUpRunning = followUpCount > 0;

  return [
    {
      id: "prepare",
      title: "读取连续记忆与最新资产",
      detail: "读取上次成功结论、处理水位和当前正式业务数据。",
      status: "done",
    },
    {
      id: "execute",
      title: "执行本轮任务范围",
      detail: run.scope,
      status: waiting
        ? "done"
        : running || followUpRunning
          ? "running"
          : stoppedRun
            ? "paused"
            : "done",
      statusLabel: followUpRunning ? "继续核验" : undefined,
    },
    {
      id: "deliver",
      title: "整理结果并更新连续记忆",
      detail: "交付本轮结果；只有成功完成后才更新连续记忆和处理水位。",
      status: waiting
        ? "waiting-user"
        : running || followUpRunning
          ? "pending"
          : stoppedRun
            ? "pending"
            : completed
              ? "done"
              : "pending",
    },
  ];
}

function RunDetail({ run, onBack }) {
  const [resolved, setResolved] = useState(false);
  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [authMode, setAuthMode] = useState("confirm");
  const [planOpen, setPlanOpen] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const notify = useToast();
  useEffect(() => {
    setResolved(false);
    setComposer("");
    setAttachments([]);
    setPlanOpen(false);
    setStopped(false);
    setFollowUps([]);
  }, [run.id]);
  const followUpActive = followUps.length > 0 && !stopped;
  const effectiveStatus = stopped
    ? "已停止"
    : resolved || followUpActive
      ? "正在运行"
      : run.status;
  const effectiveTone = stopped
    ? "neutral"
    : resolved || followUpActive
      ? "info"
      : run.tone;
  const plan = buildRunPlan(run, resolved, followUps.length, stopped);
  const send = (text, files) => {
    const normalized = text.trim();
    setFollowUps((items) => [
      ...items,
      {
        id: `${run.id}-${items.length + 1}`,
        text: normalized,
        files: files.map((file) => ({ name: file.name, size: file.size })),
      },
    ]);
    setComposer("");
    setAttachments([]);
    setStopped(false);
    if (run.status === "等待用户") setResolved(true);
    notify("补充要求已加入当前运行会话", "success");
  };
  return (
    <aside className="s2-periodic-detail s2-run-detail">
      <button
        type="button"
        className="s2-periodic-mobile-back"
        onClick={onBack}
      >
        <Icon name="chevronLeft" />
        返回运行记录
      </button>
      <header>
        <div>
          <small>周期运行记录</small>
          <h2>{run.task}</h2>
          <p>
            {run.startedAt} · {run.duration}
          </p>
        </div>
        <StatusBadge tone={effectiveTone}>{effectiveStatus}</StatusBadge>
      </header>
      <div className="s2-run-conversation">
        <div className="s2-run-timeline">
          <HunterReply
            markdown={`## 本轮已按周期计划启动

- **触发时间：** ${run.startedAt}
- **本轮范围：** ${run.scope}
- **读取记忆：** ${run.memory}

本轮使用独立会话执行，但会读取同一周期任务上一次成功的结论和用户修正规则。`}
          />
          <HunterReply
            streaming={effectiveStatus === "正在运行"}
            markdown={`## ${effectiveStatus === "正在运行" ? "当前执行进度" : "本轮运行结果"}

${run.summary}

**当前结果：** ${run.result}`}
          />
          {run.status === "等待用户" && !resolved ? (
            <HunterReply>
              <DecisionRequest
                title="2 项身份冲突需要一起确认"
                description="确认后会继续同一轮运行；本次决定不会自动成为后续长期规则。"
                options={[
                  {
                    value: "merge",
                    label: "按较新资料合并",
                    description:
                      "保留两个来源和冲突记录，继续更新受影响的匹配结果。",
                  },
                  {
                    value: "separate",
                    label: "保留为不同人物",
                    description: "不合并档案，并继续处理剩余岗位。",
                  },
                  {
                    value: "skip",
                    label: "跳过本轮冲突项",
                    description: "先完成其他结果，冲突项留待以后处理。",
                  },
                  {
                    value: "custom",
                    label: "我来补充其他要求",
                    description: "在下方输入你掌握的信息或指定处理方式。",
                  },
                ]}
                onSelect={(option) => {
                  if (option.value === "custom") {
                    setComposer("关于这两项身份冲突，请按以下要求处理：");
                    return;
                  }
                  setResolved(true);
                  notify("已记录决定，并从当前检查点继续运行", "success");
                }}
              />
            </HunterReply>
          ) : null}
          {resolved ? (
            <>
              <UserMessage time="刚刚">按刚才选择的方式继续处理。</UserMessage>
              <HunterReply
                streaming={!stopped}
                markdown={`## 运行已继续

决定已经写入当前运行会话，我会从身份冲突检查点继续，不重复执行已完成的 6 个岗位。后续独立确认项会合并后再提醒。`}
              />
            </>
          ) : null}
          {followUps.map((message) => (
            <div className="s2-decision-thread" key={message.id}>
              <UserMessage time="刚刚">
                {message.text ? <span>{message.text}</span> : null}
                {message.files.map((file) => (
                  <span className="s2-message-file" key={file.name}>
                    <Icon name="file" />
                    <span>
                      <b>{file.name}</b>
                      <small>
                        {file.size
                          ? `${Math.max(file.size / 1024 / 1024, 0.1).toFixed(1)} MB`
                          : "已上传文件"}
                      </small>
                    </span>
                  </span>
                ))}
              </UserMessage>
              <HunterReply
                streaming={!stopped}
                markdown={`已收到补充要求，并加入本次运行的上下文。我会保留已经完成的结果，只重新执行受影响的步骤；新的结论仍记录在本次运行会话中。`}
              />
            </div>
          ))}
          {stopped ? (
            <div className="s2-system-state">
              <Icon name="pause" />
              <span>
                <b>本轮运行已停止</b>
                <small>
                  对话、证据和当前处理水位已保留，可以继续补充要求。
                </small>
              </span>
            </div>
          ) : null}
        </div>
        <div className="s2-run-composer-dock">
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
                  {plan.filter((step) => step.status === "done").length} /{" "}
                  {plan.length}
                  项完成 · {effectiveStatus}
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
            onSend={send}
            authMode={authMode}
            onAuthChange={(mode) => {
              setAuthMode(mode);
              notify("本次运行的授权模式已更新", "info");
            }}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            streaming={effectiveStatus === "正在运行"}
            onStop={() => {
              setStopped(true);
              notify("本轮运行已停止，当前进度已经保留", "info");
            }}
            placeholder="继续补充信息、文件、链接或新的处理要求"
          />
        </div>
      </div>
    </aside>
  );
}

export function PeriodicTasksPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const notify = useToast();
  const view = params.get("view") === "runs" ? "runs" : "tasks";
  const state = params.get("state") || "normal";
  const requestedTaskId = params.get("selected");
  const requestedRunId = params.get("run");
  const requestedRunStatus = params.get("status") || "";
  const [tasks, setTasks] = useState(periodicTasks);
  const [runs, setRuns] = useState(periodicRuns);
  const [query, setQuery] = useState("");
  const [runStatus, setRunStatus] = useState(requestedRunStatus);
  const [timeRange, setTimeRange] = useState("近一周");
  const [customStart, setCustomStart] = useState("2026-08-28");
  const [customEnd, setCustomEnd] = useState("2026-09-03");
  const [selectedId, setSelectedId] = useState(
    requestedTaskId || periodicTasks[0].id,
  );
  const [runId, setRunId] = useState(requestedRunId || periodicRuns[0].id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(
    Boolean(requestedRunId || requestedTaskId),
  );
  const creationNotified = useRef(false);
  const selected = tasks.find((task) => task.id === selectedId) || tasks[0];
  const runStatusOptions = useMemo(
    () => ["全部状态", ...new Set(runs.map((run) => run.status))],
    [runs],
  );
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const source = view === "runs" ? runs : tasks;
    return source.filter(
      (item) =>
        (view !== "runs" ||
          ((!runStatus || item.status === runStatus) &&
            runInTimeRange(item, timeRange, customStart, customEnd))) &&
        (!keyword ||
          `${item.title || item.task} ${item.prompt || item.summary} ${item.status} ${(item.scenarios || []).join(" ")}`
            .toLowerCase()
            .includes(keyword)),
    );
  }, [customEnd, customStart, query, runStatus, runs, tasks, timeRange, view]);
  const selectedRun =
    visible.find((run) => view === "runs" && run.id === runId) ||
    (view === "runs" ? visible[0] : null);
  const setView = (nextView) => {
    setMobileDetailOpen(false);
    setRunStatus("");
    setParams(nextView === "runs" ? { view: "runs" } : {});
  };
  const resetState = () => {
    if (state === "empty") navigate("/new?mode=periodic");
    else if (state === "disabled") setParams({ view: "runs" });
    else setParams(view === "runs" ? { view: "runs" } : {});
  };
  const closeMobileDetail = () => {
    setMobileDetailOpen(false);
    setParams(
      view === "runs" && runStatus
        ? { view: "runs", status: runStatus }
        : view === "runs"
          ? { view: "runs" }
          : {},
    );
  };
  useEffect(() => {
    if (params.get("created") !== "1" || creationNotified.current) return;
    creationNotified.current = true;
    notify("周期性任务已创建，将按确认的计划运行", "success");
    const next = new URLSearchParams(params);
    next.delete("created");
    setParams(next, { replace: true });
  }, [notify, params, setParams]);
  useEffect(() => {
    if (requestedRunId) {
      setRunId(requestedRunId);
      setMobileDetailOpen(true);
    } else if (requestedTaskId) {
      setSelectedId(requestedTaskId);
      setMobileDetailOpen(true);
    }
  }, [requestedRunId, requestedTaskId]);
  useEffect(() => {
    setRunStatus(requestedRunStatus);
  }, [requestedRunStatus]);
  return (
    <div className="s2-page s2-periodic-page">
      <TaskAreaNav value="periodic" />
      <header className="s2-periodic-heading">
        <div>
          <small>按计划重复执行的猎头工作</small>
          <h1>周期性任务</h1>
          <p>
            每次运行使用独立会话，并读取上次成功结论、最新正式资产和用户修正规则。
          </p>
        </div>
        <Button
          tone="primary"
          icon="plus"
          onClick={() => navigate("/new?mode=periodic")}
        >
          新建周期性任务
        </Button>
      </header>
      <div
        className="s2-periodic-view-tabs app-tabs"
        role="tablist"
        aria-label="周期性任务视图"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === "tasks"}
          className={view === "tasks" ? "is-active" : ""}
          onClick={() => setView("tasks")}
        >
          周期任务<em>{tasks.length}</em>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "runs"}
          className={view === "runs" ? "is-active" : ""}
          onClick={() => setView("runs")}
        >
          运行记录<em>{runs.length}</em>
        </button>
      </div>
      {state !== "normal" ? (
        <StateView state={state} onReset={resetState} />
      ) : view === "tasks" && !tasks.length ? (
        <StateView
          state="empty"
          onReset={() => navigate("/new?mode=periodic")}
        />
      ) : (
        <section
          className={`s2-periodic-shell ${mobileDetailOpen ? "is-mobile-detail" : ""}`}
        >
          <div className="s2-periodic-list-pane">
            <div className="s2-periodic-list-tools">
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder={
                  view === "runs"
                    ? "搜索任务或运行结果"
                    : "搜索任务目标或业务场景"
                }
              />
              {view === "runs" ? (
                <div className="s2-periodic-run-filters">
                  <SelectMenu
                    className="s2-periodic-status-filter"
                    label="运行状态"
                    value={runStatus}
                    options={runStatusOptions}
                    onChange={(next) => {
                      const normalized = next === "全部状态" ? "" : next;
                      setRunStatus(normalized);
                      setMobileDetailOpen(false);
                      setParams(
                        normalized
                          ? { view: "runs", status: normalized }
                          : { view: "runs" },
                      );
                    }}
                  />
                  <SelectMenu
                    className="s2-periodic-time-filter"
                    label="时间范围"
                    value={timeRange}
                    options={timeRangeOptions}
                    onChange={(next) => {
                      setTimeRange(next);
                      setMobileDetailOpen(false);
                    }}
                  />
                </div>
              ) : null}
              {view === "runs" && timeRange === "自定义" ? (
                <div className="s2-periodic-custom-range">
                  <DatePicker
                    label="开始日期"
                    value={customStart}
                    onChange={setCustomStart}
                    initialYear={2026}
                  />
                  <DatePicker
                    label="结束日期"
                    value={customEnd}
                    onChange={setCustomEnd}
                    initialYear={2026}
                  />
                </div>
              ) : null}
            </div>
            <div className="s2-periodic-list-label">
              <b>
                {view === "runs"
                  ? `${runStatus || "全部状态"} · ${timeRange}`
                  : "周期任务"}
              </b>
              <span>{visible.length} 项</span>
            </div>
            <div className="s2-periodic-list">
              {visible.length ? (
                visible.map((item) => {
                  const isRun = view === "runs";
                  const active = isRun
                    ? selectedRun?.id === item.id
                    : selected.id === item.id;
                  return (
                    <button
                      type="button"
                      className={active ? "is-active" : ""}
                      key={item.id}
                      onClick={() => {
                        if (isRun) {
                          setRunId(item.id);
                          setParams(
                            runStatus
                              ? {
                                  view: "runs",
                                  run: item.id,
                                  status: runStatus,
                                }
                              : { view: "runs", run: item.id },
                          );
                        } else {
                          setSelectedId(item.id);
                          setParams({ selected: item.id });
                        }
                        setMobileDetailOpen(true);
                      }}
                    >
                      <i className={`tone-${item.tone}`}>
                        <Icon name={isRun ? "activity" : "refresh"} />
                      </i>
                      <span>
                        <small>
                          {isRun
                            ? `${item.startedAt} · ${item.duration}`
                            : item.schedule}
                        </small>
                        <b>{isRun ? item.task : item.title}</b>
                        <p>{isRun ? item.summary : item.prompt}</p>
                        {!isRun ? <em>{item.scenarios.join(" · ")}</em> : null}
                      </span>
                      <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                    </button>
                  );
                })
              ) : (
                <div className="s2-periodic-filter-empty">
                  <Icon name="search" />
                  <b>没有符合条件的运行记录</b>
                  <small>调整状态、时间范围或搜索条件后再试。</small>
                  <Button
                    size="sm"
                    tone="secondary"
                    onClick={() => {
                      setQuery("");
                      setRunStatus("");
                      setTimeRange("近一周");
                      setParams({ view: "runs" });
                    }}
                  >
                    清空筛选
                  </Button>
                </div>
              )}
            </div>
          </div>
          {view === "runs" ? (
            selectedRun ? (
              <RunDetail run={selectedRun} onBack={closeMobileDetail} />
            ) : (
              <aside className="s2-periodic-detail">
                <EmptyState
                  icon="search"
                  title="没有可查看的运行记录"
                  description="调整左侧筛选条件后再试。"
                />
              </aside>
            )
          ) : (
            <PeriodicTaskDetail
              task={selected}
              runs={runs}
              onBack={closeMobileDetail}
              onRun={() => {
                const activeRun = {
                  id: `run-${selected.id}-manual`,
                  taskId: selected.id,
                  task: selected.title,
                  startedAt: "刚刚",
                  startedAtDate: "2026-09-03",
                  duration: "运行不到 1 分钟",
                  status: "正在运行",
                  tone: "info",
                  summary: "Hunter 正在读取任务记忆和最新正式资产。",
                  scope: selected.prompt,
                  result: "正在准备本轮执行范围",
                  memory: "本轮完成前不会覆盖上一次成功记忆和处理水位。",
                };
                setRuns((items) => [
                  activeRun,
                  ...items.filter((item) => item.id !== activeRun.id),
                ]);
                setRunId(activeRun.id);
                setRunStatus("正在运行");
                setMobileDetailOpen(true);
                notify("已创建新的独立运行，会从上次成功水位继续", "info");
                setParams({
                  view: "runs",
                  run: activeRun.id,
                  status: "正在运行",
                });
              }}
              onToggle={() => {
                const pause = selected.status !== "已暂停";
                setTasks((items) =>
                  items.map((item) =>
                    item.id === selected.id
                      ? {
                          ...item,
                          status: pause ? "已暂停" : "已启用",
                          tone: pause ? "neutral" : "success",
                          nextRun: pause ? "已暂停" : item.schedule,
                        }
                      : item,
                  ),
                );
                notify(
                  pause ? "周期性任务已暂停" : "周期性任务已继续",
                  "success",
                );
              }}
              onDelete={() => setDeleteOpen(true)}
            />
          )}
        </section>
      )}
      <Modal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        title="删除周期性任务"
        description="删除会停止后续触发，已经写入的资产、洞察和运行记录不会被删除。"
        footer={
          <>
            <Button onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button
              tone="danger"
              onClick={() => {
                const remaining = tasks.filter(
                  (item) => item.id !== selected.id,
                );
                setTasks(remaining);
                setSelectedId(remaining[0]?.id || "");
                setDeleteOpen(false);
                notify("周期性任务已删除", "success");
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="s1-modal-copy">
          将删除“{selected?.title}”。最近一次成功记忆会随任务配置停止使用。
        </p>
      </Modal>
    </div>
  );
}
