import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { actionItems, mainlines, runSummaries, signals } from "./data";
import { Button, EmptyState, Skeleton, StatusBadge, useToast } from "./ui";

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <header className="s1-section-heading">
      <div>
        {eyebrow ? <small>{eyebrow}</small> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

function MainlineFocus({ selectedId, onSelect, onOpen }) {
  const selected =
    mainlines.find((item) => item.id === selectedId) || mainlines[0];
  const alternatives = mainlines.filter((item) => item.id !== selected.id);
  return (
    <section className="s1-mainline-section" aria-labelledby="mainline-title">
      <SectionHeading
        eyebrow="重点任务"
        title="继续最重要的任务"
        description="Hunter 已按等待处理、业务影响和最近变化整理当前任务。"
        action={
          <Button
            tone="ghost"
            size="sm"
            icon="chevronRight"
            onClick={() => onOpen("全部任务")}
          >
            查看全部
          </Button>
        }
      />
      <div className="s1-mainline-focus">
        <article className="s1-mainline-primary">
          <div className="s1-mainline-meta">
            <span className="s1-object-icon">
              <Icon name={selected.icon} />
            </span>
            <span>{selected.type}</span>
            <StatusBadge tone={selected.tone}>{selected.status}</StatusBadge>
            <time>{selected.changed}</time>
          </div>
          <h3 id="mainline-title">{selected.title}</h3>
          <p className="s1-mainline-object">{selected.object}</p>
          <p className="s1-mainline-summary">{selected.summary}</p>
          <dl className="s1-mainline-facts">
            {selected.facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="s1-mainline-next">
            <Icon name="sparkles" />
            <span>
              <b>下一步</b>
              {selected.next}
            </span>
          </div>
          <Button
            tone="primary"
            icon="chevronRight"
            onClick={() => onOpen(selected.title)}
          >
            继续任务
          </Button>
        </article>
        <div className="s1-mainline-switcher" aria-label="其他进行中的任务">
          <span>其他进行中的任务</span>
          {alternatives.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelect(item.id)}
            >
              <i>
                <Icon name={item.icon} />
              </i>
              <span>
                <small>{item.type}</small>
                <b>{item.title}</b>
                <em>{item.object}</em>
              </span>
              <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function RunPanel({ state, onOpen, onRetry }) {
  if (state === "error") {
    return (
      <section
        className="s1-support-panel s1-local-error"
        aria-labelledby="task-title"
      >
        <SectionHeading eyebrow="运行动态" title="需要关注的执行" />
        <div className="s1-local-state">
          <i>
            <Icon name="warning" />
          </i>
          <div>
            <b>运行摘要暂时无法加载</b>
            <p>重点任务和信号仍可正常使用。</p>
          </div>
          <Button size="sm" icon="refresh" onClick={onRetry}>
            重新加载
          </Button>
        </div>
      </section>
    );
  }
  return (
    <section className="s1-support-panel" aria-labelledby="task-title">
      <SectionHeading
        eyebrow="运行动态"
        title="需要关注的执行"
        action={
          <Button tone="ghost" size="sm" onClick={() => onOpen("全部任务")}>
            查看任务
          </Button>
        }
      />
      <div className="s1-task-list">
        {runSummaries.map((task) => (
          <button
            type="button"
            key={task.id}
            onClick={() => onOpen(task.title)}
          >
            <span className="s1-task-status">
              <StatusBadge tone={task.tone}>{task.status}</StatusBadge>
              <time>{task.time}</time>
            </span>
            <b>{task.title}</b>
            <small>
              {task.type} · {task.object}
            </small>
            <p>{task.detail}</p>
            <Icon name="chevronRight" />
          </button>
        ))}
      </div>
    </section>
  );
}

function SignalPanel({ onOpen }) {
  return (
    <section className="s1-support-panel" aria-labelledby="signal-title">
      <SectionHeading
        eyebrow="信号与机会"
        title="值得判断的变化"
        action={
          <Button tone="ghost" size="sm" onClick={() => onOpen("全部信号")}>
            查看全部
          </Button>
        }
      />
      <div className="s1-signal-list">
        {signals.map((signal) => (
          <button
            type="button"
            key={signal.id}
            onClick={() => onOpen(signal.title)}
          >
            <span className="s1-signal-line">
              <i />
              <time>{signal.time}</time>
            </span>
            <span className="s1-signal-content">
              <small>
                {signal.type} · {signal.object}
              </small>
              <b>{signal.title}</b>
              <span>
                <StatusBadge tone={signal.tone}>{signal.priority}</StatusBadge>
                <em>{signal.evidence} 个证据来源</em>
              </span>
            </span>
            <Icon name="chevronRight" />
          </button>
        ))}
      </div>
    </section>
  );
}

function ActionQueue({ expanded, onToggle, onOpen }) {
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
              onClick={() => onOpen(item.title)}
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

function LoadingDashboard() {
  return (
    <div className="s1-dashboard" aria-label="工作台正在加载">
      <header className="s1-dashboard-head">
        <div>
          <Skeleton className="s1-sk-small" />
          <Skeleton className="s1-sk-title" />
          <Skeleton className="s1-sk-text" />
        </div>
        <Skeleton className="s1-sk-button" />
      </header>
      <section className="s1-loading-mainline">
        <Skeleton className="s1-sk-small" />
        <Skeleton className="s1-sk-title" />
        <div>
          <article>
            <Skeleton className="s1-sk-wide" />
            <Skeleton className="s1-sk-hero" />
            <Skeleton className="s1-sk-wide" />
          </article>
          <aside>
            {[1, 2, 3].map((item) => (
              <Skeleton className="s1-sk-row" key={item} />
            ))}
          </aside>
        </div>
      </section>
      <div className="s1-support-grid">
        {[1, 2].map((panel) => (
          <section className="s1-support-panel" key={panel}>
            <Skeleton className="s1-sk-title" />
            {[1, 2, 3].map((item) => (
              <Skeleton className="s1-sk-row" key={item} />
            ))}
          </section>
        ))}
      </div>
      <Skeleton className="s1-sk-action" />
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(mainlines[0].id);
  const [actionExpanded, setActionExpanded] = useState(false);
  const notify = useToast();
  const state = params.get("state") || "normal";
  const openPlaceholder = (title) => {
    if (title === "新建任务") {
      navigate("/new");
      return;
    }
    if (title === "全部任务") {
      navigate("/tasks");
      return;
    }
    const work = mainlines.find((item) => item.title === title);
    if (work) {
      navigate(`/tasks/${work.id}`);
      return;
    }
    const run = runSummaries.find((item) => item.title === title);
    if (run) {
      navigate(`/tasks/${run.parentTaskId}`);
      return;
    }
    notify(`已选择“${title}”，完整业务剧本将在原型阶段三提交`, "info");
  };
  const recoverTasks = () => {
    const next = new URLSearchParams(params);
    next.delete("state");
    setParams(next, { replace: true });
    notify("运行摘要已重新加载", "success");
  };

  if (state === "loading") return <LoadingDashboard />;
  if (state === "empty") {
    return (
      <div className="s1-dashboard s1-dashboard-empty">
        <header className="s1-dashboard-head">
          <div>
            <small>2026 年 8 月 19 日 · 星期三</small>
            <h1>上午好，沈岚</h1>
            <p>
              从一条真实业务目标开始，Hunter
              会在过程中整理任务、信号和业务资产。
            </p>
          </div>
        </header>
        <EmptyState
          title="还没有任务"
          description="可以从客户开发、岗位招聘、人才摸排或候选人求职开始，Hunter 会根据目标决定一步完成或持续推进。"
          action={
            <Button
              tone="primary"
              icon="plus"
              onClick={() => openPlaceholder("新建任务")}
            >
              新建任务
            </Button>
          }
        />
        <div className="s1-empty-support">
          <span>任务执行产生的运行进度会回到对应任务</span>
          <span>值得关注的外部变化会显示在信号中心</span>
        </div>
      </div>
    );
  }

  return (
    <div className="s1-dashboard">
      <header className="s1-dashboard-head">
        <div>
          <small>2026 年 8 月 19 日 · 星期三</small>
          <h1>上午好，沈岚</h1>
          <p>你有 1 项任务等待继续，2 项运行需要关注。</p>
        </div>
      </header>

      {state === "limited" ? (
        <section className="s1-permission-strip">
          <i>
            <Icon name="warning" />
          </i>
          <div>
            <b>本机协作暂不可用</b>
            <p>云端检索和已有结果继续保留，可稍后在本机继续或下载处理包。</p>
          </div>
          <Button
            size="sm"
            onClick={() => openPlaceholder("查看本机协作处理方式")}
          >
            查看处理方式
          </Button>
        </section>
      ) : null}

      <MainlineFocus
        selectedId={selectedId}
        onSelect={setSelectedId}
        onOpen={openPlaceholder}
      />
      <div className="s1-support-grid">
        <RunPanel
          state={state}
          onOpen={openPlaceholder}
          onRetry={recoverTasks}
        />
        <SignalPanel onOpen={openPlaceholder} />
      </div>
      <ActionQueue
        expanded={actionExpanded}
        onToggle={() => setActionExpanded((current) => !current)}
        onOpen={openPlaceholder}
      />
    </div>
  );
}
