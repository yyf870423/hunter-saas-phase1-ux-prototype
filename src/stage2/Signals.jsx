import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  Button,
  Modal,
  SearchField,
  StatusBadge,
  useToast,
} from "../stage1/ui";
import { signals as initialSignals } from "./data";
import { pendingGroup, pendingUpdatesEvent } from "../stage4/pending-updates";
import {
  markerText,
  processRoute,
  setIgnored,
  undoHandled,
  viewSignal,
} from "./signal-handling";

// Design 10 §6: only “未处理 / 已忽略” plus a system “已处理” marker; filters are 全部 / 只看未处理 / 已忽略.
const signalFilters = [
  ["all", "全部"],
  ["open", "只看未处理"],
  ["ignored", "已忽略"],
];

function matchesFilter(signal, filter) {
  if (filter === "open") return signal.isOpen;
  if (filter === "ignored") return signal.status === "已忽略";
  return true;
}

// Design 10 §4.2 / §6.2: an open insight carries no badge; only “已处理” (system) and “已忽略” are shown.
function signalBadge(signal) {
  if (signal.status === "已忽略") return { tone: "neutral", label: "已忽略" };
  if (signal.marker) return { tone: "success", label: "已处理" };
  return null;
}

function SourceTask({ task }) {
  if (!task) return null;
  return (
    <section className="s2-signal-task-context">
      <header>
        <i>
          <Icon name="message" />
        </i>
        <span>
          <small>来源任务</small>
          <h3>{task.title}</h3>
        </span>
        <StatusBadge tone={task.tone}>{task.status}</StatusBadge>
      </header>
      <p>
        这条洞察报告在 {task.round}。点下方“处理”会回到这段对话、定位到报告它的位置，并在输入框里引用它；不会新建任务。
      </p>
    </section>
  );
}

// An insight that affects a running task names it (design review topic 14, rule 3);
// when it is also a data change, the change waits in the asset's own review and both link (rule 5).
function AffectsAndUpdates({ signal }) {
  if (!signal.affects && !signal.relatedUpdate) return null;
  const group = signal.relatedUpdate ? pendingGroup(signal.relatedUpdate.assetId) : null;
  return (
    <section className="s2-signal-links">
      {signal.affects ? (
        <p>
          <small>影响的任务</small>
          <a href={`#${signal.affects.route}`}>{signal.affects.title}</a>
        </p>
      ) : null}
      {group ? (
        <p>
          <small>相关资料更新</small>
          <span>
            {group.items.map((item) => `${item.field} ${item.before} → ${item.after}`).join("；")}
            {" · "}
            <b>{group.open.length ? `${group.open.length} 项待审核` : "已审核"}</b>
            {" · "}
            <a href={`#${signal.relatedUpdate.route}`}>在{group.assetName}的待审核里查看</a>
          </span>
        </p>
      ) : null}
    </section>
  );
}

function HandledResults({ signal, onOpen, onUndo }) {
  const [expanded, setExpanded] = useState(false);
  if (!signal.handled.length) {
    return (
      <section className={`s2-signal-followup ${signal.status === "已忽略" ? "is-terminal" : "is-decision"}`}>
        <header>
          <i>
            <Icon name={signal.status === "已忽略" ? "minus" : "clock"} />
          </i>
          <span>
            <small>处理结果</small>
            <h3>{signal.status === "已忽略" ? "已忽略，不再主动提醒" : "还没有处理结果"}</h3>
          </span>
        </header>
        <p>
          {signal.status === "已忽略"
            ? "重复来源仍会合并保存；出现实质性新变化时会形成新的洞察。可以取消忽略。"
            : "点“处理”回到来源任务，用一句话说要怎么处理。只点进去或只问了问题不算已处理；确认了资料变动、开始了客户开发、发出了邮件、记了结论或约了复查，才会自动标记。"}
        </p>
      </section>
    );
  }
  const items = expanded ? signal.handled : signal.handled.slice(0, 1);
  return (
    <section className="s2-signal-followup is-handled">
      <header>
        <i>
          <Icon name="check" />
        </i>
        <span>
          <small>处理结果 · 系统根据实际结果自动标记</small>
          <h3>{markerText(signal.marker)}</h3>
        </span>
      </header>
      <ol className="s2-signal-handled-list">
        {items.map((item) => (
          <li key={item.id || item.text}>
            <button type="button" onClick={() => onOpen(item.route)}>
              <span>
                {item.time} 已处理：{item.text}
              </span>
              <Icon name="chevronRight" />
            </button>
          </li>
        ))}
      </ol>
      <div className="s2-signal-handled-actions">
        {signal.handled.length > 1 ? (
          <Button size="sm" tone="ghost" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "收起" : `查看全部 ${signal.handled.length} 条结果`}
          </Button>
        ) : null}
        <Button size="sm" tone="ghost" onClick={onUndo}>
          撤销标记
        </Button>
      </div>
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
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener("hunter-signal-handling", refresh);
    window.addEventListener(pendingUpdatesEvent, refresh);
    return () => {
      window.removeEventListener("hunter-signal-handling", refresh);
      window.removeEventListener(pendingUpdatesEvent, refresh);
    };
  }, []);
  const signals = useMemo(
    () =>
      initialSignals.map((seed) => viewSignal(seed)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const requestedFilter = signalFilters.some(([value]) => value === params.get("filter"))
    ? params.get("filter")
    : "all";
  const [filter, setFilter] = useState(requestedFilter);
  const [query, setQuery] = useState("");
  const initialSelectedId = signals.some((signal) => signal.id === params.get("signal"))
    ? params.get("signal")
    : "signal-cloudchip";
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [sourcePreview, setSourcePreview] = useState(null);
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return signals
      .filter(
        (signal) =>
          matchesFilter(signal, filter) &&
          (!keyword ||
            `${signal.title} ${signal.object} ${signal.type}`
              .toLowerCase()
              .includes(keyword)),
      )
      .sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
  }, [filter, query, signals]);
  const selected =
    signals.find((signal) => signal.id === selectedId) || visible[0] || signals[0];

  useEffect(() => {
    setFilter(requestedFilter);
  }, [requestedFilter]);

  useEffect(() => {
    const requested = params.get("signal");
    if (!requested || !signals.some((signal) => signal.id === requested)) return;
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

  const changeFilter = (value) => {
    setFilter(value);
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("filter");
    else next.set("filter", value);
    setParams(next, { replace: true });
  };

  const ignore = (ignored) => {
    if (!setIgnored(selected.id, ignored)) {
      notify("保存失败，请重试", "error");
      return;
    }
    notify(
      ignored ? "已忽略；同一事件不再提醒，实质性新变化会形成新的洞察" : "已取消忽略",
      ignored ? "success" : "info",
    );
  };

  const undo = () => {
    if (!undoHandled(selected.id, selected.marker)) {
      notify("撤销失败，请重试", "error");
      return;
    }
    notify("已撤销“已处理”标记；已经写入的资料不会撤回", "info");
  };

  const badge = signalBadge(selected);

  return (
    <div className="s2-page s2-signals-page">
      <header className="s2-page-heading">
        <div>
          <small>Hunter 主动发现的业务变化</small>
          <h1>洞察中心</h1>
          <p>
            每条洞察都来自一个任务。点“处理”回到那段对话，用一句话说要怎么处理；有了处理结果会自动标记“已处理”。
          </p>
        </div>
      </header>
      <section className="s2-signal-shell">
        <div className="s2-signal-list-pane">
          <div className="s2-signal-toolbar">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="搜索公司、人物或洞察"
            />
            <div
              className="s2-signal-tabs app-tabs"
              role="tablist"
              aria-label="洞察筛选"
            >
              {signalFilters.map(([value, label]) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  className={filter === value ? "is-active" : ""}
                  key={value}
                  onClick={() => changeFilter(value)}
                >
                  {label}
                  <em>{signals.filter((signal) => matchesFilter(signal, value)).length}</em>
                </button>
              ))}
            </div>
          </div>
          <div className="s2-signal-list-label">
            <b>洞察</b>
            <span>{visible.length} 条</span>
          </div>
          <div className="s2-signal-feed">
            {visible.map((signal) => {
              const rowBadge = signalBadge(signal);
              return (
                <button
                  type="button"
                  className={selected.id === signal.id ? "is-active" : ""}
                  key={signal.id}
                  aria-pressed={selected.id === signal.id}
                  aria-controls="selected-signal-detail"
                  onClick={() => selectSignal(signal.id)}
                >
                  <i className={`tone-${rowBadge?.tone || "warning"}`}>
                    <Icon
                      name={
                        signal.type === "候选人动向"
                          ? "user"
                          : signal.type === "客户需求"
                            ? "mail"
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
                      {signal.type} · {signal.object}
                    </small>
                    <b>{signal.title}</b>
                    <p>{signal.summary}</p>
                    <em className="s2-signal-next">
                      {signal.marker
                        ? markerText(signal.marker)
                        : signal.status === "已忽略"
                          ? "同一事件不再提醒"
                          : `来源：${signal.sourceTask?.title || "任务"}`}
                    </em>
                    <em>
                      {signal.evidence} 个来源 · {signal.time}
                    </em>
                  </span>
                  <span className="s2-signal-row-trailing">
                    {rowBadge ? (
                      <StatusBadge tone={rowBadge.tone}>{rowBadge.label}</StatusBadge>
                    ) : null}
                    <Icon name="chevronRight" />
                  </span>
                </button>
              );
            })}
            {!visible.length ? (
              <div className="s2-empty">
                <Icon name="signal" />
                <h2>{filter === "open" ? "没有未处理的洞察" : "没有符合条件的洞察"}</h2>
                <p>可以清空搜索或切换筛选。</p>
                <Button
                  tone="secondary"
                  onClick={() => {
                    setQuery("");
                    changeFilter("all");
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
                <small>洞察 · {selected.type}</small>
                <h2>{selected.title}</h2>
                <p>
                  {selected.object} · {selected.time}
                </p>
              </span>
              {badge ? <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge> : null}
            </header>
            <section className={`s2-signal-priority is-${badge?.tone || "warning"}`}>
              <Icon name={selected.marker ? "check" : "signal"} />
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
            </section>
            <AffectsAndUpdates signal={selected} />
            <SourceTask task={selected.sourceTask} />
            <HandledResults
              signal={selected}
              onOpen={(route) => navigate(route)}
              onUndo={undo}
            />
            <section>
              <h3>处理与变化记录</h3>
              <SignalHistory items={selected.history} />
            </section>
            {/* Only two actions, placed last (design 10 §6.3): 处理 and 忽略 / 取消忽略. */}
            <footer>
              <Button tone="primary" icon="message" onClick={() => navigate(processRoute(selected))}>
                处理
              </Button>
              {selected.status === "已忽略" ? (
                <Button tone="secondary" icon="refresh" onClick={() => ignore(false)}>
                  取消忽略
                </Button>
              ) : (
                <Button tone="ghost" onClick={() => ignore(true)}>
                  忽略
                </Button>
              )}
            </footer>
          </aside>
        ) : null}
      </section>
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
