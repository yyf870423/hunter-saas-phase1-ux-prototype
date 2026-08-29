import { Icon } from "../components/Icon";
import { Button, DefinitionGrid, Drawer, StatusBadge } from "./asset-ui";

const stateMeta = {
  running: {
    label: "运行中",
    tone: "info",
    icon: "refresh",
    className: "is-running",
  },
  review: {
    label: "等待审核",
    tone: "warning",
    icon: "clock",
    className: "is-review",
  },
  failed: {
    label: "处理失败",
    tone: "danger",
    icon: "warning",
    className: "is-failed",
  },
  complete: {
    label: "已完成",
    tone: "success",
    icon: "check",
    className: "is-complete",
  },
};

function getStateMeta(state) {
  return stateMeta[state] || stateMeta.complete;
}

export function AssetAiProcessBanner({
  state,
  title,
  description,
  target,
  work,
  onDetails,
  onPrimary,
  primaryLabel,
  onSecondary,
  secondaryLabel,
}) {
  if (!state || state === "idle" || state === "setup") return null;
  const meta = getStateMeta(state);
  return (
    <section
      className={`s4-ai-process-banner ${meta.className}`}
      aria-label={`${title}，${meta.label}`}
    >
      <i>
        <Icon name={meta.icon} />
      </i>
      <div>
        <header>
          <b>{title}</b>
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
        </header>
        <p>{description}</p>
        <small>
          处理对象：{target}
          {work ? ` · 所属工作：${work}` : ""}
        </small>
      </div>
      <footer>
        <Button size="sm" onClick={onDetails}>
          查看处理详情
        </Button>
        {secondaryLabel ? (
          <Button size="sm" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        ) : null}
        {primaryLabel ? (
          <Button size="sm" tone="primary" onClick={onPrimary}>
            {primaryLabel}
          </Button>
        ) : null}
      </footer>
    </section>
  );
}

export function AssetAiProcessHistory({ records, onOpen }) {
  return (
    <div className="s4-ai-process-history">
      {records.map((record) => {
        const meta = getStateMeta(record.state);
        return (
          <button type="button" key={record.id} onClick={() => onOpen(record)}>
            <i className={meta.className}>
              <Icon name={meta.icon} />
            </i>
            <span>
              <small>{record.type}</small>
              <b>{record.title}</b>
              <p>{record.summary}</p>
            </span>
            <time>{record.updatedAt}</time>
            <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
            <Icon name="chevronRight" />
          </button>
        );
      })}
    </div>
  );
}

export function AssetAiProcessDrawer({
  open,
  close,
  record,
  onOpenWork,
  onPrimary,
  primaryLabel,
}) {
  if (!record) return null;
  const meta = getStateMeta(record.state);
  return (
    <Drawer
      open={open}
      close={close}
      title="AI 处理详情"
      className="s4-ai-process-drawer"
    >
      <div className="s4-ai-process-detail">
        <header>
          <i className={meta.className}>
            <Icon name={meta.icon} />
          </i>
          <span>
            <small>{record.type}</small>
            <h3>{record.title}</h3>
            <p>{record.summary}</p>
          </span>
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
        </header>

        <section>
          <h4>处理归属</h4>
          <DefinitionGrid
            columns={2}
            items={[
              ["处理对象", record.target],
              ["发起位置", record.source],
              ["创建时间", record.startedAt],
              ["最近更新", record.updatedAt],
            ]}
          />
          {record.work ? (
            <button
              type="button"
              className="s4-ai-process-work-link"
              onClick={onOpenWork}
            >
              <i>
                <Icon name="route" />
              </i>
              <span>
                <small>所属目标级工作</small>
                <b>{record.work}</b>
              </span>
              <Icon name="chevronRight" />
            </button>
          ) : null}
        </section>

        <section>
          <h4>执行计划</h4>
          <div className="s4-ai-process-plan">
            {record.plan.map((item) => (
              <article key={item.title}>
                <i className={`is-${item.state}`}>
                  <Icon
                    name={
                      item.state === "complete"
                        ? "check"
                        : item.state === "running"
                          ? "refresh"
                          : item.state === "failed"
                            ? "warning"
                            : "clock"
                    }
                  />
                </i>
                <span>
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </span>
                <em>{item.label}</em>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h4>运行记录</h4>
          <div className="s4-ai-run-history">
            {record.runs.map((run) => (
              <article key={run.id}>
                <span>
                  <b>{run.label}</b>
                  <small>{run.time}</small>
                </span>
                <p>{run.detail}</p>
                <StatusBadge tone={run.tone}>{run.status}</StatusBadge>
              </article>
            ))}
          </div>
        </section>

        <footer>
          <Button onClick={close}>关闭</Button>
          {primaryLabel ? (
            <Button tone="primary" onClick={onPrimary}>
              {primaryLabel}
            </Button>
          ) : null}
        </footer>
      </div>
    </Drawer>
  );
}
