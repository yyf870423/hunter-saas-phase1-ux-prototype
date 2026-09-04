import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  Button,
  Modal,
  SearchField,
  StatusBadge,
  useToast,
} from "../stage1/ui";
import { mainlines } from "../stage1/data";
import { signals as initialSignals } from "./data";

const signalDecisionAction = "处理洞察";

const signalTabs = [
  "全部",
  "待你决定",
  "观察中",
  "核验中",
  "已处理",
  "已忽略",
  "已失效",
];

const defaultObservation = {
  objective: "继续核验与当前变化直接相关的公开信息和正式资产。",
  nextCheck: "3 天后 09:00",
  trigger: "出现新的可靠来源、行动价值明显提高或反向证据",
  expiresAt: "30 天后；届时仍无实质变化则自动失效",
  lastChecked: "刚刚",
  lastResult: "已经建立观察计划，当前没有需要立即处理的新变化。",
};

function FollowUpPanel({ signal }) {
  if (signal.status === "待你决定") {
    return (
      <section className="s2-signal-followup is-decision">
        <header>
          <i>
            <Icon name="warning" />
          </i>
          <span>
            <small>系统后续处理</small>
            <h3>等待你的决定</h3>
          </span>
          <em>{signal.validity}</em>
        </header>
        <strong>{signal.decision?.question}</strong>
        <dl>
          <div>
            <dt>Hunter 建议</dt>
            <dd>{signal.decision?.recommendation}</dd>
          </div>
          <div>
            <dt>暂不处理</dt>
            <dd>{signal.decision?.impact}</dd>
          </div>
        </dl>
      </section>
    );
  }

  if (signal.status === "观察中") {
    const observation = signal.observation || defaultObservation;
    return (
      <section className="s2-signal-followup is-observing">
        <header>
          <i>
            <Icon name="clock" />
          </i>
          <span>
            <small>系统后续处理</small>
            <h3>Hunter 将继续观察</h3>
          </span>
          <em>{observation.nextCheck}</em>
        </header>
        <strong>{observation.objective}</strong>
        <dl className="is-grid">
          <div>
            <dt>转为待你决定的条件</dt>
            <dd>{observation.trigger}</dd>
          </div>
          <div>
            <dt>观察结束条件</dt>
            <dd>{observation.expiresAt}</dd>
          </div>
          <div>
            <dt>最近检查</dt>
            <dd>
              {observation.lastChecked} · {observation.lastResult}
            </dd>
          </div>
        </dl>
      </section>
    );
  }

  if (signal.status === "核验中") {
    const verification = signal.verification || {
      progress: 35,
      completed: "已读取现有来源",
      remaining: "正在补充交叉证据",
      outcome: "完成后自动更新状态。",
    };
    return (
      <section className="s2-signal-followup is-verifying">
        <header>
          <i>
            <Icon name="activity" />
          </i>
          <span>
            <small>系统后续处理</small>
            <h3>Hunter 正在重新核验</h3>
          </span>
          <em>{verification.progress}%</em>
        </header>
        <div
          className="s2-signal-progress"
          role="progressbar"
          aria-label="信号核验进度"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={verification.progress}
        >
          <span style={{ width: `${verification.progress}%` }} />
        </div>
        <dl>
          <div>
            <dt>已经完成</dt>
            <dd>{verification.completed}</dd>
          </div>
          <div>
            <dt>当前处理</dt>
            <dd>{verification.remaining}</dd>
          </div>
          <div>
            <dt>完成以后</dt>
            <dd>{verification.outcome}</dd>
          </div>
        </dl>
      </section>
    );
  }

  if (signal.status === "已处理") {
    return (
      <section className="s2-signal-followup is-handled">
        <header>
          <i>
            <Icon name="check" />
          </i>
          <span>
            <small>处理结果</small>
            <h3>{signal.outcome?.type || "已经处理"}</h3>
          </span>
        </header>
        <strong>{signal.outcome?.title}</strong>
        <p>{signal.outcome?.detail}</p>
      </section>
    );
  }

  if (signal.status === "已忽略") {
    return (
      <section className="s2-signal-followup is-terminal">
        <header>
          <i>
            <Icon name="minus" />
          </i>
          <span>
            <small>系统后续处理</small>
            <h3>同一事件不再提醒</h3>
          </span>
        </header>
        <p>{signal.ignoredReason}</p>
        <small>
          重复来源仍会合并保存；出现实质性新变化时，Hunter 会形成一条新信号。
        </small>
      </section>
    );
  }

  return (
    <section className="s2-signal-followup is-terminal">
      <header>
        <i>
          <Icon name="clock" />
        </i>
        <span>
          <small>系统后续处理</small>
          <h3>观察已经结束</h3>
        </span>
      </header>
      <p>{signal.invalidReason || signal.summary}</p>
      <small>失效记录和历史证据继续保留，可以随时重新核验。</small>
    </section>
  );
}

function SignalHistory({ items = [] }) {
  return (
    <ol className="s2-signal-history">
      {items.map((item) => (
        <li key={`${item.time}-${item.title}`}>
          <i className={`tone-${item.tone || "neutral"}`} />
          <span>
            <time>{item.time}</time>
            <b>{item.title}</b>
            <p>{item.detail}</p>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function SignalsPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const initialSelectedId = initialSignals.some(
    (signal) => signal.id === params.get("signal"),
  )
    ? params.get("signal")
    : initialSignals.find((signal) => signal.id === "signal-cloudchip")?.id ||
      initialSignals[0].id;
  const [signals, setSignals] = useState(initialSignals);
  const [tab, setTab] = useState("全部");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState("new");
  const [taskQuery, setTaskQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [sourcePreview, setSourcePreview] = useState(null);
  const timers = useRef([]);
  const selected =
    signals.find((signal) => signal.id === selectedId) || signals[0];
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return signals.filter(
      (signal) =>
        (tab === "全部" || signal.status === tab) &&
        (!keyword ||
          `${signal.title} ${signal.object} ${signal.type}`
            .toLowerCase()
            .includes(keyword)),
    );
  }, [query, signals, tab]);
  const availableTasks = useMemo(() => {
    const keyword = taskQuery.trim().toLowerCase();
    return mainlines.filter(
      (task) =>
        !keyword ||
        `${task.title} ${task.type} ${task.object} ${task.status}`
          .toLowerCase()
          .includes(keyword),
    );
  }, [taskQuery]);
  const selectedTask = mainlines.find((task) => task.id === selectedTaskId);

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );

  useEffect(() => {
    const requested = params.get("signal");
    if (!requested || !signals.some((signal) => signal.id === requested))
      return;
    setSelectedId(requested);
    setMobileDetailOpen(true);
  }, [params, signals]);

  const selectSignal = (id) => {
    setSelectedId(id);
    setMobileDetailOpen(true);
    const next = new URLSearchParams(params);
    next.set("signal", id);
    setParams(next, { replace: true });
  };

  const patchSignal = (id, patch, historyItem, message, tone = "success") => {
    setSignals((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
              history: historyItem
                ? [historyItem, ...(item.history || [])]
                : item.history,
            }
          : item,
      ),
    );
    if (message) notify(message, tone);
  };

  const startObservation = () => {
    setTab("观察中");
    patchSignal(
      selected.id,
      {
        status: "观察中",
        tone: "info",
        priority: "持续观察",
        nextLabel: "下次检查：3 天后 09:00",
        observation: selected.observation || defaultObservation,
      },
      {
        time: "刚刚",
        title: "进入观察中",
        detail: "Hunter 已建立观察计划，将在条件触发或到达检查时间后更新结果。",
        tone: "info",
      },
      "Hunter 将继续观察，出现实质变化时会再次提醒",
    );
  };

  const ignoreSignal = () => {
    setTab("已忽略");
    patchSignal(
      selected.id,
      {
        status: "已忽略",
        tone: "neutral",
        priority: "已忽略",
        nextLabel: "同一事件不再提醒",
        ignoredReason:
          selected.ignoredReason ||
          "用户确认当前信息不需要继续处理，同一事件的重复来源不再提醒。",
      },
      {
        time: "刚刚",
        title: "用户选择忽略",
        detail: "同一事件的重复来源继续合并，但不再主动提醒。",
        tone: "neutral",
      },
      "信号已忽略；实质性新变化仍会形成新的提醒",
    );
  };

  const restoreObservation = () => {
    setTab("观察中");
    patchSignal(
      selected.id,
      {
        status: "观察中",
        tone: "info",
        priority: "持续观察",
        nextLabel: "下次检查：3 天后 09:00",
        observation: defaultObservation,
      },
      {
        time: "刚刚",
        title: "恢复观察",
        detail: "Hunter 已重新建立观察计划并保留此前证据。",
        tone: "info",
      },
      "已恢复观察，Hunter 将从现有证据继续核验",
    );
  };

  const startRecheck = () => {
    const id = selected.id;
    setTab("核验中");
    patchSignal(
      id,
      {
        status: "核验中",
        tone: "info",
        priority: "正在核验",
        nextLabel: "正在核验：1 / 4 个来源",
        verification: {
          progress: 25,
          completed: "已读取当前信号和历史证据",
          remaining: "正在检查公开来源和关联正式资产",
          outcome: "完成后自动更新状态，无需停留等待。",
        },
      },
      {
        time: "刚刚",
        title: "开始立即核验",
        detail: "正在检查公开来源、关联资产和反向证据。",
        tone: "info",
      },
      "已开始重新核验，可以离开当前页面",
      "info",
    );
    timers.current.push(
      window.setTimeout(() => {
        setTab("待你决定");
        patchSignal(
          id,
          {
            status: "待你决定",
            tone: "warning",
            priority: "需要确认",
            evidence: selected.evidence + 1,
            summary:
              "重新核验发现招聘岗位仍在开放，并新增一位招聘负责人信息，已经具备明确的后续行动。",
            nextLabel: "需要确认：是否开展客户开发",
            validity: "建议在 3 天内处理",
            decision: {
              question: `是否围绕${selected.object}启动一次客户开发任务？`,
              recommendation:
                "建议先核验招聘负责人的职责和可用联系方式，再决定是否联系。",
              impact:
                "若暂不处理，Hunter 会在有效期结束前再次核验，不会自动创建任务或写入资产。",
            },
          },
          {
            time: "刚刚",
            title: "核验完成，等待决定",
            detail: "新增一个可靠来源，行动价值已达到提醒条件。",
            tone: "warning",
          },
          "核验完成：发现实质变化，请确认是否开展客户开发",
        );
      }, 1500),
    );
  };

  const completeDecision = () => {
    if (decisionType === "existing" && !selectedTask) return;
    setDecisionOpen(false);
    if (decisionType === "record") {
      setTab("已处理");
      patchSignal(
        selected.id,
        {
          status: "已处理",
          tone: "success",
          priority: "已处理",
          nextLabel: "去向：已记录处理结果",
          outcome: {
            type: "已记录处理结果",
            title: decisionNote.trim() || "用户已在系统外完成处理",
            detail:
              "本条洞察已停止主动提醒，原始来源、证据和处理记录继续保留。",
          },
        },
        {
          time: "刚刚",
          title: "用户记录处理结果",
          detail:
            decisionNote.trim() || "用户确认已经完成处理，不需要创建任务。",
          tone: "success",
        },
        "处理结果已记录",
      );
      return;
    }
    if (decisionType === "new") {
      sessionStorage.setItem(
        "hunter-new-work-signal",
        `根据信号“${selected.title}”继续处理。已知依据、有效期和建议动作已经随信号关联，请先判断最合适的推进方式。`,
      );
      navigate("/new");
      return;
    }
    setTab("已处理");
    patchSignal(
      selected.id,
      {
        status: "已处理",
        tone: "success",
        priority: "已处理",
        nextLabel: "去向：已加入任务",
        outcome: {
          type: "已加入任务",
          title: selectedTask.title,
          detail: "洞察的来源、变化和建议动作已作为新的上下文加入该任务。",
          route: `/tasks/${selectedTask.id}`,
        },
      },
      {
        time: "刚刚",
        title: "已加入任务",
        detail: `洞察及其证据已加入“${selectedTask.title}”，可以从该任务继续处理。`,
        tone: "success",
      },
      "洞察已加入所选任务",
    );
  };

  const openDecision = () => {
    setDecisionType("new");
    setTaskQuery("");
    setSelectedTaskId("");
    setDecisionNote("");
    setDecisionOpen(true);
  };

  return (
    <div className="s2-page s2-signals-page">
      <header className="s2-page-heading">
        <div>
          <small>Hunter 主动发现、持续跟进的业务变化</small>
          <h1>洞察中心</h1>
          <p>
            每条洞察都有明确的后续行动。Hunter
            会继续核验和观察，只在需要你处理时提醒你。
          </p>
        </div>
      </header>
      <section className="s2-signal-shell">
        <div className="s2-signal-list-pane">
          <div className="s2-signal-toolbar">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="搜索公司、人物、信号或洞察"
            />
            <div
              className="s2-signal-tabs app-tabs"
              role="tablist"
              aria-label="洞察状态"
            >
              {signalTabs.map((item) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  className={tab === item ? "is-active" : ""}
                  key={item}
                  onClick={() => setTab(item)}
                >
                  {item}
                  <em>
                    {item === "全部"
                      ? signals.length
                      : signals.filter((signal) => signal.status === item)
                          .length}
                  </em>
                </button>
              ))}
            </div>
          </div>
          <div className="s2-signal-list-label">
            <b>洞察与信号</b>
            <span>{visible.length} 条</span>
          </div>
          <div className="s2-signal-feed">
            {visible.map((signal) => (
              <button
                type="button"
                className={selected.id === signal.id ? "is-active" : ""}
                key={signal.id}
                aria-pressed={selected.id === signal.id}
                aria-controls="selected-signal-detail"
                onClick={() => selectSignal(signal.id)}
              >
                <i className={`tone-${signal.tone}`}>
                  <Icon
                    name={
                      signal.type === "候选人动向"
                        ? "user"
                        : signal.type === "关系变化"
                          ? "route"
                          : signal.type === "公司变化"
                            ? "building"
                            : "signal"
                    }
                  />
                </i>
                <span>
                  <small>
                    {signal.kind || "信号"} · {signal.type} · {signal.object}
                  </small>
                  <b>{signal.title}</b>
                  <p>{signal.summary}</p>
                  <em className="s2-signal-next">{signal.nextLabel}</em>
                  <em>
                    {signal.evidence} 个来源 · {signal.time}
                  </em>
                </span>
                <span className="s2-signal-row-trailing">
                  <StatusBadge tone={signal.tone}>{signal.status}</StatusBadge>
                  <Icon name="chevronRight" />
                </span>
              </button>
            ))}
            {!visible.length ? (
              <div className="s2-empty">
                <Icon name="signal" />
                <h2>没有符合条件的洞察或信号</h2>
                <p>可以清空搜索或切换状态分类。</p>
                <Button
                  tone="secondary"
                  onClick={() => {
                    setQuery("");
                    setTab("全部");
                  }}
                >
                  清空条件
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        {selected ? (
          <aside
            id="selected-signal-detail"
            key={selected.id}
            className={`s2-signal-detail ${mobileDetailOpen ? "is-mobile-open" : ""}`}
          >
            <button
              type="button"
              className="s2-signal-mobile-back"
              onClick={() => setMobileDetailOpen(false)}
            >
              <Icon name="chevronLeft" />
              返回洞察列表
            </button>
            <header>
              <span>
                <small>
                  {selected.kind || "信号"} · {selected.type}
                </small>
                <h2>{selected.title}</h2>
                <p>
                  {selected.object} · {selected.time}
                </p>
              </span>
              <StatusBadge tone={selected.tone}>{selected.status}</StatusBadge>
            </header>
            <section className={`s2-signal-priority is-${selected.tone}`}>
              <Icon
                name={
                  selected.status === "已处理"
                    ? "check"
                    : selected.status === "核验中"
                      ? "activity"
                      : selected.status === "观察中"
                        ? "clock"
                        : "warning"
                }
              />
              <span>
                <b>{selected.priority}</b>
                <p>{selected.summary}</p>
              </span>
            </section>
            <section>
              <h3>本次变化</h3>
              <ul>
                {selected.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>来源与证据</h3>
              <div className="s2-signal-sources">
                {selected.sources.map((source, index) => (
                  <button
                    type="button"
                    key={source}
                    onClick={() =>
                      setSourcePreview({
                        name: source,
                        evidenceType: index === 0 ? "直接证据" : "交叉印证",
                        capturedAt: selected.time,
                        supports:
                          selected.changes[index % selected.changes.length],
                      })
                    }
                  >
                    <span>
                      <b>{source}</b>
                      <small>
                        {index === 0 ? "直接证据" : "交叉印证"} · {index + 1}{" "}
                        天内
                      </small>
                    </span>
                    <Icon name="chevronRight" />
                  </button>
                ))}
              </div>
              {selected.sourceRun ? (
                <button
                  type="button"
                  className="s2-signal-origin-run"
                  onClick={() => navigate(selected.sourceRun.route)}
                >
                  <Icon name="refresh" />
                  <span>
                    <small>发现来源</small>
                    <b>{selected.sourceRun.label}</b>
                  </span>
                  <Icon name="chevronRight" />
                </button>
              ) : null}
            </section>
            <FollowUpPanel signal={selected} />
            <footer>
              {selected.status === "待你决定" ? (
                <>
                  {selected.graphPath ? (
                    <Button
                      tone="primary"
                      onClick={() => navigate(selected.graphPath)}
                    >
                      {signalDecisionAction}
                    </Button>
                  ) : (
                    <Button tone="primary" onClick={openDecision}>
                      {signalDecisionAction}
                    </Button>
                  )}
                  <Button tone="secondary" onClick={startObservation}>
                    继续观察
                  </Button>
                  <Button tone="ghost" onClick={ignoreSignal}>
                    忽略
                  </Button>
                </>
              ) : null}
              {selected.status === "观察中" ? (
                <>
                  <Button tone="primary" icon="refresh" onClick={startRecheck}>
                    立即复查
                  </Button>
                  <Button tone="ghost" onClick={ignoreSignal}>
                    结束观察
                  </Button>
                </>
              ) : null}
              {selected.status === "核验中" ? (
                <Button tone="secondary" loading disabled>
                  正在核验
                </Button>
              ) : null}
              {selected.status === "已处理" && selected.outcome?.route ? (
                <Button
                  tone="primary"
                  onClick={() => navigate(selected.outcome.route)}
                >
                  查看处理去向
                </Button>
              ) : null}
              {["已忽略", "已失效"].includes(selected.status) ? (
                <Button
                  tone="secondary"
                  icon="refresh"
                  onClick={restoreObservation}
                >
                  恢复观察
                </Button>
              ) : null}
            </footer>
            <section>
              <h3>处理与变化记录</h3>
              <SignalHistory items={selected.history} />
            </section>
          </aside>
        ) : null}
      </section>
      <Modal
        open={decisionOpen}
        close={() => setDecisionOpen(false)}
        title={signalDecisionAction}
        description="你可以围绕这条洞察创建任务、加入已有任务，或记录已经完成的处理。Hunter 会保留来源、证据和处理去向。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setDecisionOpen(false)}>
              取消
            </Button>
            <Button
              tone="primary"
              disabled={decisionType === "existing" && !selectedTask}
              onClick={completeDecision}
            >
              {decisionType === "new"
                ? "创建任务"
                : decisionType === "existing"
                  ? "加入所选任务"
                  : "记录已处理"}
            </Button>
          </>
        }
      >
        <div
          className="s2-convert-options"
          role="radiogroup"
          aria-label="洞察处理方式"
        >
          {[
            [
              "new",
              "创建新任务",
              "围绕这条洞察开始一项新任务，并带入目标、证据和有效期。",
            ],
            [
              "existing",
              "加入已有任务",
              "选择具体任务，把洞察及其证据作为新的任务上下文加入。",
            ],
            [
              "record",
              "记录处理结果",
              "已经在系统外完成必要行动，只保留结果和依据，不创建任务。",
            ],
          ].map(([value, title, description]) => (
            <button
              type="button"
              role="radio"
              aria-checked={decisionType === value}
              className={decisionType === value ? "is-active" : ""}
              key={value}
              onClick={() => setDecisionType(value)}
            >
              <i>{decisionType === value ? <span /> : null}</i>
              <span>
                <b>{title}</b>
                <small>{description}</small>
              </span>
            </button>
          ))}
        </div>
        {decisionType === "existing" ? (
          <section className="s2-existing-task-picker">
            <header>
              <b>选择目标任务</b>
              <small>没有合适任务时，请选择创建新任务。</small>
            </header>
            <SearchField
              value={taskQuery}
              onChange={setTaskQuery}
              placeholder="搜索任务名称、场景或关联对象"
            />
            <div role="radiogroup" aria-label="已有任务">
              {availableTasks.map((task) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedTaskId === task.id}
                  className={selectedTaskId === task.id ? "is-active" : ""}
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <i>{selectedTaskId === task.id ? <span /> : null}</i>
                  <span>
                    <b>{task.title}</b>
                    <small>
                      {task.type} · {task.object}
                    </small>
                  </span>
                  <StatusBadge tone={task.tone}>{task.status}</StatusBadge>
                </button>
              ))}
              {!availableTasks.length ? <p>没有找到符合条件的任务。</p> : null}
            </div>
          </section>
        ) : null}
        {decisionType === "record" ? (
          <label className="s2-signal-handled-note">
            <span>处理说明（可选）</span>
            <textarea
              rows="3"
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              placeholder="例如：已电话联系招聘负责人，对方暂不开放猎头合作。"
            />
            <small>说明会和原始来源、证据一起保留在处理记录中。</small>
          </label>
        ) : null}
      </Modal>
      <Modal
        open={Boolean(sourcePreview)}
        close={() => setSourcePreview(null)}
        title="来源与证据"
        description={`查看“${selected.title}”引用的来源内容和支持结论。`}
        footer={
          <Button tone="secondary" onClick={() => setSourcePreview(null)}>
            关闭
          </Button>
        }
      >
        {sourcePreview ? (
          <div className="s2-signal-source-preview">
            <header>
              <span>
                <small>{sourcePreview.evidenceType}</small>
                <h3>{sourcePreview.name}</h3>
              </span>
              <StatusBadge tone="success">已保存</StatusBadge>
            </header>
            <dl>
              <div>
                <dt>获取时间</dt>
                <dd>{sourcePreview.capturedAt}</dd>
              </div>
              <div>
                <dt>支持结论</dt>
                <dd>{sourcePreview.supports}</dd>
              </div>
            </dl>
            <section>
              <h4>证据摘录</h4>
              <p>
                Hunter 从“{sourcePreview.name}”中提取到与
                {selected.object}
                相关的变化，并与本条洞察中的其他来源完成了交叉核验。
              </p>
            </section>
            <Button
              tone="ghost"
              icon="external"
              onClick={() =>
                notify(
                  "原型未连接真实外部地址；正式产品将在新标签页打开原始来源",
                  "info",
                )
              }
            >
              打开原始来源
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
