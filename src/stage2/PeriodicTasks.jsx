import { useEffect, useMemo, useRef, useState } from "react";
import { periodicOverridesKey, periodicRunsKey, readPeriodicDrafts, readPeriodicOverrides, readPeriodicRuns } from "./periodic-draft";
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
import { signals as seedSignals } from "./data";
import { pendingGroup, resolveUpdates, roundUpdates } from "../stage4/pending-updates";
import {
  addHandled,
  classifyHandling,
  handledToday,
  markerText,
  undoHandled,
  viewSignal,
} from "./signal-handling";

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
    destination: "新公司和招聘机会进入洞察中心，你点“处理”在这段对话里决定后，公司、联系人才出草稿等你确认；已有公司的资料变化放进该公司的待审核",
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
    title: "每两周核验收藏夹“重点候选人”的公开变化",
    prompt:
      "跟进范围：收藏夹“重点候选人”（当前 36 人）。核验公开任职、成果和团队变化，只保留有证据、值得猎头注意的变化。",
    scenarios: ["候选人", "洞察发现"],
    schedule: "每两周周五 17:00",
    nextRun: "已暂停",
    lastRun: "8 月 28 日 17:00",
    status: "已暂停",
    tone: "neutral",
    destination: "影响进行中任务、需要你决定的发现进洞察中心；资料变化放进各候选人的待审核，由你确认后才写入",
    memory: "仅核验收藏夹“重点候选人”；不把用户主动录入的资料生成为洞察。",
  },
  {
    id: "periodic-mailbox",
    title: "邮箱：读取 shenlan@qq.com 的邮件",
    system: true,
    prompt:
      "连接发件邮箱时系统自动建立。定期读取邮箱里的所有邮件：回复回到原任务，发现的机会和待处理事项写入洞察中心；只保存和工作相关的邮件，其他邮件读完就丢，只记邮件编号。",
    scenarios: ["邮箱", "洞察发现"],
    schedule: "每 30 分钟",
    nextRun: "今天 10:00",
    lastRun: "今天 09:30",
    status: "已启用",
    tone: "success",
    destination: "回复回到原任务；机会和待处理事项进入洞察中心；邮件里的简历按外部资料处理：新的人走建档（身份、查重，你确认后创建），已有候选人走补全审核，都要你确认",
    memory: "随邮箱连接运行，不能单独暂停或删除；断开邮箱后停止读取，已保存的邮件、洞察和对话保留。",
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
    summary: "核验 73 家公司，合并 19 条重复线索，有 7 条新发现。",
    scope: "中国大陆 · 具身智能 · 新成立至 B 轮",
    result: "3 条洞察写入洞察中心，另有 4 条证据不足，留在这一轮记录里不提醒",
    memory: "覆盖水位已更新至今天 09:00。",
  },
  {
    id: "run-mailbox-0903",
    taskId: "periodic-mailbox",
    task: "邮箱：读取 shenlan@qq.com 的邮件",
    startedAt: "今天 09:30",
    startedAtDate: "2026-09-03",
    duration: "1 分 12 秒",
    status: "已完成",
    tone: "success",
    summary: "读取 14 封新邮件：保存 3 封工作相关的，其余 11 封读完就丢，只记邮件编号。",
    scope: "收件箱 · 上次读到 09:00 之后",
    result: "1 封客户新需求写入洞察中心；1 封回复回到原任务；1 份简历放进建档等你确认",
    memory: "读取位置推进到 09:30；不会重复读取同一封邮件。",
  },
  {
    id: "run-graph-sept",
    taskId: "periodic-graph-refresh",
    task: "每月更新机器人行业知识图谱",
    startedAt: "9 月 1 日 08:30",
    startedAtDate: "2026-09-01",
    duration: "22 分 05 秒",
    status: "已完成",
    tone: "success",
    summary: "发现 3 条关系变化：2 条来自已确认的资产资料，已同步；1 条人才流动来自公开资料，放进图谱“更新与审核”等你确认，不进洞察中心。",
    scope: "12 张知识图谱 · 214 个正式节点",
    result: "同步 2 条关系；1 条关系变化待审核",
    memory: "成功水位已推进至 9 月 1 日。",
  },
  {
    id: "run-graph-empty",
    taskId: "periodic-graph-refresh",
    task: "每月更新机器人行业知识图谱",
    startedAt: "8 月 1 日 08:30",
    startedAtDate: "2026-08-01",
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
    task: "每两周核验收藏夹“重点候选人”的公开变化",
    startedAt: "8 月 28 日 17:00",
    startedAtDate: "2026-08-28",
    duration: "18 分 03 秒",
    status: "部分完成",
    tone: "warning",
    summary: "已核验 31 位候选人，5 位的公开来源暂不可用。",
    scope: "重点候选人收藏夹 · 36 人",
    result: "2 条写入洞察中心；陈松、赵星羽的资料变化放进各自的待审核；失败来源可在下轮增量重试",
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
  {
    id: "run-startups-0817",
    taskId: "periodic-startups",
    task: "每周发现具身智能创业公司与招聘机会",
    startedAt: "8 月 17 日 09:00",
    startedAtDate: "2026-08-17",
    duration: "10 分 48 秒",
    status: "已完成",
    tone: "success",
    summary: "核验 65 家公司，合并 14 条重复线索，产生 5 条新洞察。",
    scope: "中国大陆 · 具身智能 · 新成立至 B 轮",
    result: "5 条新洞察，已处理 2 条",
    memory: "覆盖水位已更新至 8 月 17 日 09:00。",
  },
];

const runOrderKey = (run) => {
  const time = (run.startedAt || "").match(/(\d{1,2}):(\d{2})/);
  return `${run.startedAtDate || "2026-09-03"} ${time ? time[1].padStart(2, "0") + ":" + time[2] : "23:59"}`;
};

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
            新建任务
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
        {task.system ? (
          // The mailbox task follows the mailbox connection: no separate pause or delete
          // (connecting = consent; disconnecting = withdrawal, decision 12.2).
          <Button
            tone="secondary"
            icon="settings"
            onClick={() => navigate("/settings/connections")}
          >
            管理邮箱连接
          </Button>
        ) : (
          <>
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
              onClick={() => navigate(`/new?edit=${task.id}&originalPrompt=${encodeURIComponent(task.prompt)}&schedule=${encodeURIComponent(task.schedule)}`)}
            >
              调整任务
            </Button>
            <Button tone="ghost" icon="trash" onClick={onDelete}>
              删除
            </Button>
          </>
        )}
      </div>
      {task.system ? (
        <p className="s2-periodic-system-note">
          连接发件邮箱时自动建立，随连接运行：不能单独暂停或删除，不想被读取就在设置里断开邮箱。
        </p>
      ) : null}
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
  const followUpRunning = followUpCount > 0 && running;

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

function roundFindings(runId) {
  return seedSignals
    .filter((signal) => signal.sourceTask?.runId === runId)
    .map((signal) => viewSignal(signal));
}

function quoteReply(message, signal) {
  const object = signal?.object || "这条洞察";
  if (message.kind === "update") {
    const rows = (signal?.changes || []).map((change) => {
      const [field, value] = change.includes("：") ? change.split("：") : ["变化", change];
      const [from, to] = value.includes("→") ? value.split("→").map((item) => item.trim()) : ["—", value];
      return `| ${field} | ${from} | ${to} | ${signal?.sources?.[0] || "来源证据"} |`;
    });
    return `## 资料更新草稿\n\n| 字段 | 当前 | 新值 | 来源 |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n\n确认后写入${object.split(" · ")[0]}的资料，形成新版本。证据再充分也要你确认，我不会自动写入。`;
  }
  if (message.kind === "outbound") {
    const name = object.split(" · ")[0];
    return `## 邮件草稿\n\n- **收件人：** ${name}（已有联系方式）\n- **标题：** 关于近期的合作机会\n- **正文：** 您好，注意到${signal?.summary || "贵司近期的变化"}，想约 15 分钟交流一下招聘方面的合作。\n\n每封邮件都要你确认收件人、标题、正文和附件后才会发出，自动执行也不跳过。`;
  }
  if (message.kind === "undo") return `已撤销这条洞察的“已处理”标记，它回到“未处理”。已经写入的资料不会撤回。`;
  if (message.kind === "start" && message.marker?.text.startsWith("交给"))
    return `好的，已把${object}的这条洞察交给那个任务继续，相关上下文一并带过去。\n\n这条洞察已标记“${markerText(message.marker)}”。`;
  if (message.kind === "start") return `好的，开始围绕${object}做客户开发：先核实招聘负责人和合作意愿，再列出潜在机会请你确认。\n\n这条洞察已标记“${markerText(message.marker)}”。`;
  if (message.kind === "recheck") return `已记下复查时间，到时我在这段对话里复查${object}的变化。\n\n这条洞察已标记“${markerText(message.marker)}”。`;
  if (message.kind === "conclusion") return `已记成这条洞察的处理结论。\n\n这条洞察已标记“${markerText(message.marker)}”。`;
  return `（原型示意）根据已有证据：${signal?.summary || ""}\n\n这条要记个结论吗？回复“知道了”就记成“已知情”。`;
}

function RunDetail({ run, runs, onBack, onUpdate }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState([]);
  const authMode = run.authMode || "confirm";
  const [planOpen, setPlanOpen] = useState(false);
  const [, setHandledVersion] = useState(0);
  const notify = useToast();
  const rounds = useMemo(
    () =>
      runs
        .filter((item) => item.taskId === run.taskId)
        .sort((a, b) => runOrderKey(a).localeCompare(runOrderKey(b))),
    [run.taskId, runs],
  );
  const quoteId = params.get("quote");
  const quotedSeed = seedSignals.find((signal) => signal.id === quoteId);
  const quoted = quotedSeed ? viewSignal(quotedSeed) : null;
  const followUps = run.followUps || [];
  const stopped = run.status === "已停止";
  const resolved = Boolean(run.decision);
  useEffect(() => {
    setComposer("");
    setAttachments([]);
    setPlanOpen(false);
    const messageId = params.get("msg");
    const target =
      (messageId && document.getElementById(`msg-${messageId}`)) ||
      document.getElementById(
        quotedSeed?.sourceTask?.runId === run.id ? `finding-${quotedSeed.id}` : `round-${run.id}`,
      );
    if (target?.scrollIntoView) target.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.id]);
  useEffect(() => {
    const refresh = () => setHandledVersion((value) => value + 1);
    window.addEventListener("hunter-signal-handling", refresh);
    return () => window.removeEventListener("hunter-signal-handling", refresh);
  }, []);
  const plan = buildRunPlan(run, resolved, followUps.length, stopped);
  const removeQuote = () => {
    const next = new URLSearchParams(params);
    next.delete("quote");
    setParams(next, { replace: true });
  };
  const quoteSignal = (signal) => {
    const next = new URLSearchParams(params);
    next.set("quote", signal.id);
    setParams(next, { replace: true });
  };
  const send = (text, files) => {
    const normalized = text.trim();
    const last = followUps[followUps.length - 1];
    // Hunter asked “这条要记个结论吗？” after a question, or after a draft was declined.
    const pendingQuestion =
      !quoted &&
      last?.quote &&
      (last.kind === "question" || (["update", "outbound"].includes(last.kind) && last.resolution === "no"))
        ? last.quote
        : null;
    const signalId = quoted?.id || pendingQuestion;
    const signal = signalId ? seedSignals.find((item) => item.id === signalId) : null;
    const waiting = run.status === "等待用户";
    let entry = {
      id: crypto.randomUUID(),
      text: normalized,
      files: files.map((file) => ({ name: file.name, size: file.size })),
      waiting,
    };
    if (signal) {
      const handling = classifyHandling(normalized, signal);
      // The marker jumps back to the message that produced the result.
      const marker = handling.marker
        ? { ...handling.marker, time: handledToday(), route: `/tasks/periodic?view=runs&run=${run.id}&msg=${entry.id}` }
        : null;
      entry = { ...entry, quote: signal.id, quoteTitle: quoted ? signal.title : "", kind: handling.kind, marker };
      if (handling.kind === "undo") undoHandled(signal.id, viewSignal(signal).marker);
      else if (marker && !["update", "outbound"].includes(handling.kind)) addHandled(signal.id, marker);
    }
    const patch = {
      followUps: [...followUps, entry],
      ...(waiting || signal ? {} : { status: "正在运行", tone: "info" }),
    };
    if (!onUpdate(run.id, patch)) return;
    setComposer("");
    setAttachments([]);
    if (quoted) removeQuote();
    notify(signal ? "已收到，正在按你的话处理这条洞察" : "补充要求已加入这一轮对话", "success");
  };
  const resolveUpdate = (message, option) => {
    if (option.value === "suggest") {
      setComposer("是，但");
      return;
    }
    const next = followUps.map((item) =>
      item.id === message.id ? { ...item, resolution: option.value } : item,
    );
    if (!onUpdate(run.id, { followUps: next })) return;
    if (option.value === "yes") {
      addHandled(message.quote, message.marker);
      // Confirming here also confirms the linked item in the asset's own review (topic 14, rule 5).
      const related = seedSignals.find((item) => item.id === message.quote)?.relatedUpdate;
      if (message.kind === "update" && related)
        resolveUpdates(
          related.assetId,
          Object.fromEntries((pendingGroup(related.assetId)?.open || []).map((item) => [item.id, "accepted"])),
        );
      notify(
        message.kind === "outbound" ? "邮件已从你的邮箱发出，这条洞察已标记“已处理”" : "资料已更新，这条洞察已标记“已处理”",
        "success",
      );
    } else {
      notify("草稿已保留，没有写入", "info");
    }
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
          <small>周期任务对话 · {rounds.length} 轮运行</small>
          <h2>{run.task}</h2>
          <p>
            当前定位：{run.startedAt} 那一轮 · 左侧运行记录是这段对话的目录
          </p>
        </div>
        <StatusBadge tone={run.tone}>{run.status}</StatusBadge>
      </header>
      <div className="s2-run-conversation">
        <div className="s2-run-timeline">
          <HunterReply
            markdown={`## 周期任务对话

这段对话记录这个周期任务的每一次运行，每次运行是其中一轮。

- 每一轮读取连续记忆和相关的那一轮，不读全部历史。
- 每一轮跑完才交出这一轮的发现，运行中不会出现半截发现；运行中只能停止。
- 你正在对话里处理时，新一轮等你停下再开始（离开这段对话，或最后一条消息后 15 分钟没有新输入），不和你的消息交错。`}
          />
          {rounds.map((round) => {
            const findings = roundFindings(round.id);
            const updates = roundUpdates(round.id);
            const roundFollowUps = round.followUps || [];
            const roundWaiting = round.status === "等待用户" && !round.decision;
            return (
              <section
                key={round.id}
                id={`round-${round.id}`}
                className={`s2-run-round ${round.id === run.id ? "is-current" : ""}`}
              >
                <div className="s2-run-round-divider">
                  <span>
                    {round.startedAt} 运行 · {round.status}
                    {round.id === run.id ? " · 当前定位" : ""}
                  </span>
                </div>
                <HunterReply
                  streaming={round.status === "正在运行"}
                  markdown={`## ${round.status === "正在运行" ? "当前执行进度" : "本轮运行结果"}

${round.summary}

- **本轮范围：** ${round.scope}
- **当前结果：** ${round.result}${round.status === "正在运行" ? "\n- **本轮发现：** 跑完后一起交出，运行中不会出现半截发现。" : ""}
- **连续记忆：** ${round.memory}`}
                />
                {findings.length ? (
                  <div className="s2-run-findings">
                    <h4>本轮写入洞察中心的发现</h4>
                    <ol>
                      {findings.map((signal) => (
                        <li key={signal.id} id={`finding-${signal.id}`}>
                          <span>
                            <b>{signal.title}</b>
                            <small>
                              {signal.marker
                                ? markerText(signal.marker)
                                : signal.status === "已忽略"
                                  ? "已忽略"
                                  : "未处理"}
                            </small>
                          </span>
                          <span className="s2-run-finding-actions">
                            {round.id === run.id ? (
                              <Button size="sm" tone="secondary" onClick={() => quoteSignal(signal)}>
                                引用并处理
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              tone="ghost"
                              onClick={() => navigate(`/signals?signal=${signal.id}`)}
                            >
                              在洞察中心查看
                            </Button>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
                {updates.length ? (
                  <div className="s2-run-findings is-updates">
                    <h4>本轮发现的资料更新（放在各资产的待审核里，不进洞察中心）</h4>
                    <ol>
                      {updates.map((update) => (
                        <li key={update.id}>
                          <span>
                            <b>{update.title}</b>
                            <small>{update.status}</small>
                          </span>
                          <span className="s2-run-finding-actions">
                            <Button size="sm" tone="ghost" onClick={() => navigate(update.route)}>
                              去审核
                            </Button>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
                {roundWaiting ? (
                  <HunterReply>
                    <DecisionRequest
                      title="确认当前两份候选人资料的身份关系"
                      description="确认后会继续这一轮运行；本次决定不会自动成为后续长期规则。"
                      options={[
                        { value: "merge", label: "按较新资料合并", description: "保留两个来源和冲突记录，继续更新受影响的匹配结果。" },
                        { value: "separate", label: "保留为不同人物", description: "不合并档案，并继续处理剩余岗位。" },
                        { value: "skip", label: "跳过本轮冲突项", description: "先完成其他结果，冲突项留待以后处理。" },
                        { value: "custom", label: "我来补充其他要求", description: "在下方输入你掌握的信息或指定处理方式。" },
                      ]}
                      onSelect={(option) => {
                        if (option.value === "custom") {
                          setComposer("关于当前身份冲突，请按以下要求处理：");
                          return;
                        }
                        if (authMode === "analysis" && option.value !== "skip") {
                          notify("当前仅分析，尚未修改身份关系；可跳过冲突项或调整授权。", "warning");
                          return;
                        }
                        if (!onUpdate(round.id, { decision: option.label, status: "正在运行", tone: "info",
                          followUps: [...roundFollowUps, { id: crypto.randomUUID(), text: option.label, files: [], decision: true }] })) return;
                        notify("已记录决定，并从当前检查点继续运行", "success");
                      }}
                    />
                  </HunterReply>
                ) : null}
                {roundFollowUps.map((message) => {
                  const signal = message.quote
                    ? seedSignals.find((item) => item.id === message.quote)
                    : null;
                  return (
                    <div className="s2-decision-thread" key={message.id} id={`msg-${message.id}`}>
                      <UserMessage time="刚刚">
                        {message.quoteTitle ? (
                          <span className="s2-message-quote">
                            <Icon name="signal" />
                            引用洞察：{message.quoteTitle}
                          </span>
                        ) : null}
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
                      {message.quote ? (
                        <HunterReply markdown={quoteReply(message, signal)}>
                          {message.kind === "outbound" && !message.resolution ? (
                            <DecisionRequest
                              title="确认发出这封邮件？"
                              description="是 / 否 / 建议；确认后从你连接的邮箱发出。"
                              options={[
                                { value: "yes", label: "是", description: "从你的邮箱发出这封邮件。" },
                                { value: "no", label: "否", description: "保留草稿，不发送。" },
                                { value: "suggest", label: "建议", description: "在下方说明要怎么改，我会出新的草稿。" },
                              ]}
                              onSelect={(option) => resolveUpdate(message, option)}
                            />
                          ) : null}
                          {message.kind === "update" && !message.resolution ? (
                            <DecisionRequest
                              title="是否按草稿更新资料？"
                              description="是 / 否 / 建议；“是，但改一下……”算修改建议，不算确认。"
                              options={[
                                { value: "yes", label: "是", description: "写入资料，形成新版本。" },
                                { value: "no", label: "否", description: "保留草稿，不写入。" },
                                { value: "suggest", label: "建议", description: "在下方说明要怎么改，我会出新的草稿。" },
                              ]}
                              onSelect={(option) => resolveUpdate(message, option)}
                            />
                          ) : null}
                          {message.resolution === "yes" ? (
                            <p className="s2-run-handled-note">
                              {message.kind === "outbound" ? "已发出" : "已写入"}，这条洞察已标记“{markerText(message.marker)}”。
                            </p>
                          ) : null}
                          {message.resolution === "no" ? (
                            <p className="s2-run-handled-note">草稿已保留，没有写入。这条要记个结论吗？</p>
                          ) : null}
                        </HunterReply>
                      ) : (
                        <HunterReply
                          streaming={round.status === "正在运行"}
                          markdown={message.decision ? "## 运行已继续\n\n决定已经写入这一轮，我会从身份冲突检查点继续，不重复执行已完成的 6 个岗位。后续独立问题逐项确认，不沿用本次决定。" : message.waiting ? "补充内容已保留，尚未据此修改身份关系。请核对当前身份问题并明确选择处理方式；这一轮仍在等待确认。" : "已收到补充要求，并加入这一轮的上下文。我会保留已经完成的结果，只重新执行受影响的步骤。"}
                        />
                      )}
                    </div>
                  );
                })}
                {round.status === "已停止" ? (
                  <HunterReply markdown="### 这一轮已停止\n\n对话、证据和当前处理水位已保留，可以继续补充要求。" />
                ) : null}
              </section>
            );
          })}
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
                  项完成 · {run.status}
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
          {quoted ? (
            <div className="s2-quote-chip" role="note">
              <Icon name="signal" />
              <span>
                <small>
                  引用洞察 · {quoted.marker ? markerText(quoted.marker) : quoted.status}
                </small>
                <b>{quoted.title}</b>
              </span>
              <button type="button" aria-label="移除引用" onClick={removeQuote}>
                <Icon name="close" />
              </button>
            </div>
          ) : null}
          <Composer
            value={composer}
            onChange={setComposer}
            onSend={send}
            authMode={authMode}
            onAuthChange={(mode) => {
              if (!onUpdate(run.id, { authMode: mode })) return;
              notify("本次运行的授权模式已更新", "info");
            }}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            streaming={run.status === "正在运行"}
            onStop={() => {
              if (!onUpdate(run.id, { status: "已停止", tone: "neutral" })) return;
              notify("这一轮已停止，当前进度已经保留", "info");
            }}
            placeholder={
              quoted
                ? "说说要怎么处理这条洞察，例如“更新资料”“开始客户开发”“先不跟”“下个月再看看”"
                : "继续补充信息、文件、链接或新的处理要求"
            }
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
  const [tasks, setTasks] = useState(() => {
    const drafts = readPeriodicDrafts();
    const overrides = readPeriodicOverrides();
    const merged = periodicTasks.map((task) => {
      const draft = drafts.find((item) => item.id === task.id);
      return draft ? { ...task, ...draft, title: draft.prompt, nextRun: draft.schedule } : task;
    });
    return [...drafts.filter((item) => !periodicTasks.some((task) => task.id === item.id)).map((item) => ({ ...item, title: item.prompt,
      scenarios: ["周期任务"], status: "已启用", tone: "success", nextRun: "待下次执行周期", lastRun: "尚未运行",
      destination: "高价值变化进入洞察中心；资产草稿等待确认", memory: "尚无成功运行记录" })), ...merged]
      .filter((task) => !overrides[task.id]?.deleted)
      .map((task) => overrides[task.id]?.paused === true ? { ...task, status: "已暂停", tone: "neutral", nextRun: "已暂停" }
        : overrides[task.id]?.paused === false ? { ...task, status: "已启用", tone: "success", nextRun: task.schedule } : task);
  });
  const [runs, setRuns] = useState(() => readPeriodicRuns(periodicRuns));
  const saveRuns = (next) => {
    try {
      sessionStorage.setItem(periodicRunsKey, JSON.stringify(next));
      setRuns(next);
      return true;
    } catch { notify("运行状态保存失败，尚未变更，请重试。", "error"); return false; }
  };
  const updateRun = (id, patch) => {
    if (!saveRuns(runs.map((run) => run.id === id ? { ...run, ...patch } : run))) return false;
    if (patch.status) {
      const next = new URLSearchParams(params);
      next.set("run", id);
      setRunId(id);
      if (params.get("status")) {
        next.set("status", patch.status);
        setRunStatus(patch.status);
      }
      setParams(next, { replace: true });
    }
    return true;
  };
  const saveTaskChange = (id, patch) => {
    try {
      const values = readPeriodicOverrides();
      sessionStorage.setItem(periodicOverridesKey, JSON.stringify({ ...values, [id]: { ...values[id], ...patch } }));
      return true;
    } catch { notify("任务配置保存失败，尚未变更，请重试。", "error"); return false; }
  };
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
  const taskViews = useMemo(() => tasks.map((task) => {
    if (task.status === "已暂停") return task;
    const waiting = runs.some((run) => run.taskId === task.id && run.status === "等待用户");
    return { ...task, status: waiting ? "等待用户" : "已启用", tone: waiting ? "warning" : "success" };
  }), [tasks, runs]);
  const selected = taskViews.find((task) => task.id === selectedId) || taskViews[0];
  const runStatusOptions = useMemo(
    () => ["全部状态", ...new Set(runs.map((run) => run.status))],
    [runs],
  );
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const source = view === "runs" ? runs : taskViews;
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
  }, [customEnd, customStart, query, runStatus, runs, taskViews, timeRange, view]);
  const selectedRun =
    visible.find((run) => view === "runs" && run.id === runId) ||
    (view === "runs"
      ? runs.find((run) => requestedRunId && run.id === requestedRunId) || visible[0]
      : null);
  const setView = (nextView) => {
    setMobileDetailOpen(false);
    setRunStatus("");
    setParams(nextView === "runs" ? { view: "runs" } : {});
  };
  const resetState = () => {
    if (state === "empty") navigate("/new");
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
    if ((params.get("created") !== "1" && params.get("updated") !== "1") || creationNotified.current) return;
    creationNotified.current = true;
    notify(params.get("updated") === "1" ? "周期性任务已更新" : "周期性任务已创建，将按确认的计划运行", "success");
    const next = new URLSearchParams(params);
    next.delete("created");
    next.delete("updated");
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
            每个周期任务是一段连续对话，每次运行是其中一轮；运行记录是这段对话的目录。
          </p>
        </div>
        <Button
          tone="primary"
          icon="plus"
          aria-label="新建任务"
          onClick={() => navigate("/new")}
        >
          新建任务
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
          onReset={() => navigate("/new")}
        />
      ) : (
        <section
          className={`s2-periodic-shell ${mobileDetailOpen ? "is-mobile-detail" : ""}`}
        >
          <div className="s2-periodic-list-pane">
            <div className="s2-periodic-list-tools s4-filter-scope">
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
              <RunDetail run={selectedRun} runs={runs} onBack={closeMobileDetail} onUpdate={updateRun} />
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
                const existing = runs.find((run) => run.taskId === selected.id && ["正在运行", "等待用户"].includes(run.status));
                if (existing) {
                  setTimeRange("近一个月");
                  setQuery("");
                  setParams({ view: "runs", run: existing.id });
                  notify("当前已有未结束运行，已打开该运行记录。", "info");
                  return;
                }
                const activeRun = {
                  id: `run-${selected.id}-${crypto.randomUUID()}`,
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
                if (!saveRuns([activeRun, ...runs])) return;
                setTimeRange("近一周");
                setQuery("");
                setRunId(activeRun.id);
                setRunStatus("正在运行");
                setMobileDetailOpen(true);
                notify("已在这段对话里开始新的一轮，会从上次成功水位继续", "info");
                setParams({
                  view: "runs",
                  run: activeRun.id,
                  status: "正在运行",
                });
              }}
              onToggle={() => {
                const pause = selected.status !== "已暂停";
                if (!saveTaskChange(selected.id, { paused: pause })) return;
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
                if (!selected || !saveTaskChange(selected.id, { deleted: true })) return;
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
