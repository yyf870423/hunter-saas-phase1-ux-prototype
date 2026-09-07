import { useState } from "react";
import { Icon } from "../components/Icon";
import { DataTable, TooltipText } from "../stage4/asset-ui";
import {
  getDashboardTaskState,
  limitDashboardItems,
  orderDashboardTasks,
} from "./dashboard-data";
import { Button, EmptyState, Skeleton, StatusBadge } from "./ui";
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

const taskColumns = [
  {
    key: "type",
    label: "任务类型",
    width: 150,
    render: (item) => (
      <span className="s1-task-summary-type">
        <Icon name={item.progress.icon} />
        {item.type}
      </span>
    ),
  },
  {
    key: "title",
    label: "任务名称",
    render: (item) => (
      <TooltipText tip={item.title}>
        <b className="s1-task-summary-name">{item.title}</b>
      </TooltipText>
    ),
  },
  {
    key: "progress",
    label: "进度",
    width: "30%",
    render: (item) => <TaskProgressSummary progress={item.progress} />,
  },
  {
    key: "status",
    label: "状态",
    width: 116,
    render: (item) => {
      const state = getDashboardTaskState(item);
      return <StatusBadge tone={state.tone}>{state.label}</StatusBadge>;
    },
  },
];

export function TaskSummaryTable({ items, onOpen, onCreate }) {
  return (
    <div className="s1-task-summary-table">
      <DataTable
        rows={limitDashboardItems(orderDashboardTasks(items))}
        columns={taskColumns}
        onRow={(item) => onOpen(item.route)}
        empty={
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
        }
      />
    </div>
  );
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
          {item.icon ? <Icon name={item.icon} /> : null}
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
  return (
    <div
      className={`s1-dashboard-list-skeleton ${table ? "is-table" : ""}`}
      aria-label="正在加载"
    >
      {table ? <Skeleton className="s1-dashboard-skeleton-head" /> : null}
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

export function ActionQueue({ expanded, onToggle, onOpen }) {
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
          <small>2 项待确认、1 项待补充、1 项异常</small>
        </span>
        <em>共 {actionItems.length} 项</em>
        <Icon name={expanded ? "chevronUp" : "chevronDown"} />
      </button>
      {expanded ? (
        <div className="s1-action-list">
          {actionItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onOpen(actionRoutes[item.id])}
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
