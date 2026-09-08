import { useId, useState } from "react";
import { Icon } from "../components/Icon";
import { TooltipText } from "../stage4/asset-ui";
import {
  getDashboardTaskState,
  limitDashboardItems,
  orderDashboardTasks,
} from "./dashboard-data";
import { Button, EmptyState, IconButton, Skeleton, StatusBadge } from "./ui";
import { actionItems } from "./data";
import "./dashboard.css";

export function DashboardTaskStarter({ onStart, disabled }) {
  const [value, setValue] = useState("");
  const submit = () => {
    if (!disabled && value.trim()) onStart(value.trim());
  };
  return (
    <section
      className="s1-dashboard-starter"
      aria-labelledby="task-starter-title"
    >
      <h2 id="task-starter-title">新任务</h2>
      <div className="s1-task-starter-input">
        <textarea
          rows={2}
          value={value}
          disabled={disabled}
          aria-label="描述新任务"
          placeholder="例如：每周一检查具身智能创业公司和招聘变化，有重要发现时提醒我"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button
          tone="primary"
          icon="send"
          disabled={disabled || !value.trim()}
          onClick={submit}
        >
          开始
        </Button>
      </div>
    </section>
  );
}

export function DashboardSection({
  id,
  title,
  icon,
  count,
  action,
  children,
  className = "",
  loading = false,
}) {
  return (
    <section
      className={`s1-dashboard-section ${className}`}
      aria-labelledby={id}
      aria-busy={loading || undefined}
    >
      <header className="s1-dashboard-section-head">
        <h2 id={id}>
          {icon ? <Icon name={icon} /> : null}
          {title}
          {typeof count === "number" ? (
            <span className="s1-dashboard-count">{count}</span>
          ) : null}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function TaskProgressSummary({ progress }) {
  return (
    <span className="s1-task-progress-summary">
      <span>{progress.label}</span>
      <small>{progress.detail}</small>
    </span>
  );
}

export function TaskPlanMilestones({ steps = [] }) {
  if (!steps.length) return null;
  return (
    <ol className="s1-task-plan-milestones" aria-label="任务执行计划">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`is-${step.state}`}
          aria-current={step.state === "current" ? "step" : undefined}
        >
          <i>{step.state === "done" ? <Icon name="check" /> : index + 1}</i>
          <span>
            <b>{step.title}</b>
            <small>
              {step.state === "done"
                ? "已完成"
                : step.state === "current"
                  ? "当前步骤"
                  : "后续步骤"}
            </small>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function TaskFocusBoard({ items, onOpen, onCreate }) {
  const visible = limitDashboardItems(orderDashboardTasks(items));
  const [selectedId, setSelectedId] = useState(null);
  const prefix = useId();
  const selected = visible.find((item) => item.id === selectedId) || visible[0];
  if (!selected)
    return (
      <EmptyState
        compact
        title="还没有任务"
        description="暂无任务记录。"
        action={
          <Button icon="plus" onClick={onCreate}>
            新建任务
          </Button>
        }
      />
    );
  const state = getDashboardTaskState(selected);
  const selectPreview = (event, item) => {
    setSelectedId(item.id);
    const board = event.currentTarget.closest(".s1-task-focus-board");
    if (board?.getBoundingClientRect().width <= 760) {
      document
        .getElementById(prefix + "-detail")
        ?.scrollIntoView({ block: "start" });
    }
  };
  const selectByKey = (event, index) => {
    const target =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? (index + 1) % visible.length
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? (index + visible.length - 1) % visible.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? visible.length - 1
              : null;
    if (target === null) return;
    event.preventDefault();
    setSelectedId(visible[target].id);
    document.getElementById(prefix + "-task-" + target)?.focus();
  };
  return (
    <div className="s1-task-focus-board">
      <article
        className="s1-task-focus-detail"
        id={prefix + "-detail"}
        role="tabpanel"
        aria-labelledby={
          prefix +
          "-task-" +
          visible.findIndex((item) => item.id === selected.id)
        }
      >
        <div className="s1-task-focus-meta">
          <span className="s1-task-focus-icon">
            <Icon name={selected.progress.icon} />
          </span>
          <span>{selected.type}</span>
          <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
        </div>
        <h3>{selected.title}</h3>
        {selected.object ? (
          <p className="s1-task-focus-object">{selected.object}</p>
        ) : null}
        {selected.summary ? (
          <p className="s1-task-focus-summary">{selected.summary}</p>
        ) : null}
        <div className="s1-task-focus-progress">
          <TaskProgressSummary progress={selected.progress} />
        </div>
        <TaskPlanMilestones steps={selected.planSteps} />
        <footer>
          <Button
            tone="primary"
            icon="chevronRight"
            onClick={() => onOpen(selected.route)}
          >
            进入任务
          </Button>
        </footer>
      </article>
      <div
        className="s1-task-focus-switcher"
        role="tablist"
        aria-label="工作台任务预览"
        aria-orientation="vertical"
      >
        {visible.map((item, index) => {
          const itemState = getDashboardTaskState(item);
          return (
            <div
              key={item.id}
              className={`s1-dashboard-task-item ${item.id === selected.id ? "is-selected" : ""}`}
            >
              <button
                type="button"
                className="s1-dashboard-task-select"
                role="tab"
                id={prefix + "-task-" + index}
                aria-controls={prefix + "-detail"}
                aria-selected={item.id === selected.id}
                tabIndex={item.id === selected.id ? 0 : -1}
                onClick={(event) => selectPreview(event, item)}
                onKeyDown={(event) => selectByKey(event, index)}
              >
                <span className="s1-dashboard-task-heading">
                  <span className="s1-task-summary-type">
                    <Icon name={item.progress.icon} />
                    {item.type}
                  </span>
                  <StatusBadge tone={itemState.tone}>
                    {itemState.label}
                  </StatusBadge>
                </span>
                <b className="s1-task-summary-name">{item.title}</b>
                <TaskProgressSummary progress={item.progress} />
              </button>
              <TooltipText trigger="always" tip="打开任务详情">
                <IconButton
                  className="s1-dashboard-task-open"
                  icon="chevronRight"
                  label={"打开任务：" + item.title}
                  onClick={() => onOpen(item.route)}
                />
              </TooltipText>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardInsightCards(props) {
  return <DashboardFeed {...props} kind="insights" />;
}

export function DashboardAssetTimeline(props) {
  return <DashboardFeed {...props} kind="assets" />;
}

export function DashboardFeed({ items, onOpen, kind, emptyAction }) {
  const visible = limitDashboardItems(items);
  if (!visible.length) {
    return (
      <EmptyState
        compact
        icon={kind === "insights" ? "signal" : "database"}
        title={kind === "insights" ? "暂无洞察" : "暂无资产变化"}
        description={
          kind === "insights"
            ? "暂时没有需要关注的变化。"
            : "还没有新增或更新的资产。"
        }
        action={emptyAction}
      />
    );
  }
  return (
    <div className={`s1-dashboard-feed s1-dashboard-feed-${kind}`}>
      {visible.map((item) => (
        <button
          key={item.id}
          type="button"
          className="s1-dashboard-feed-row"
          onClick={() => onOpen(item.route)}
        >
          <i className="s1-dashboard-feed-icon">
            <Icon
              name={item.icon || (kind === "insights" ? "signal" : "database")}
            />
          </i>
          <span className="s1-dashboard-feed-content">
            <b>{item.title}</b>
            <span className="s1-dashboard-feed-meta">
              <span>
                {item.type}
                {item.evidence ? ` · ${item.evidence} 个来源` : ""}
              </span>
              <time>{item.time}</time>
            </span>
            <span className="s1-dashboard-feed-detail">
              {item.status ? (
                <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
              ) : null}
              <span>{item.detail}</span>
            </span>
          </span>
          <Icon name="chevronRight" />
        </button>
      ))}
    </div>
  );
}

export function DashboardListSkeleton({ rows = 5, table = false }) {
  if (table)
    return (
      <div
        className="s1-dashboard-list-skeleton is-focus"
        aria-label="正在加载"
      >
        <div className="s1-dashboard-skeleton-focus">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
        <div className="s1-dashboard-skeleton-switcher">
          {Array.from({ length: Math.min(rows, 10) }, (_, index) => (
            <div key={index}>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
          ))}
        </div>
      </div>
    );
  return (
    <div className="s1-dashboard-list-skeleton" aria-label="正在加载">
      {Array.from({ length: Math.min(rows, 10) }, (_, index) => (
        <div key={index}>
          <Skeleton />
          <Skeleton />
        </div>
      ))}
    </div>
  );
}

const actionRoutes = {
  "action-contact": "/tasks/client-xinglan",
  "action-candidates": "/tasks/position-vla?state=review",
  "action-reply": "/tasks/career-linhao",
  "action-source-retry": "/tasks/position-vla?state=limited",
};

export function ActionQueue({
  expanded,
  onToggle,
  onOpen,
  additionalItems = [],
  includeExamples = true,
}) {
  const items = [...additionalItems, ...(includeExamples ? actionItems : [])];
  return (
    <section className={`s1-action-queue ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="s1-action-summary"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <i>
          <Icon name="check" />
        </i>
        <span>
          <b>行动队列</b>
          <small>
            {additionalItems.length
              ? additionalItems.length + " 项招聘机会待跟进"
              : "2 项待确认、1 项待补充、1 项异常"}
          </small>
        </span>
        <em>共 {items.length} 项</em>
        <Icon name={expanded ? "chevronUp" : "chevronDown"} />
      </button>
      {expanded ? (
        <div className="s1-action-list">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onOpen(item.route || actionRoutes[item.id])}
            >
              <StatusBadge tone={item.tone}>
                {item.tone === "danger" ? "异常" : "待处理"}
              </StatusBadge>
              <span>
                <b>{item.title}</b>
                <small>{item.source}</small>
              </span>
              <em>{item.meta}</em>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
