import { useState } from "react";
import { Icon } from "../components/Icon";
import {
  Button,
  CustomCheckbox,
  DefinitionGrid,
  Drawer,
  StatusBadge,
} from "./asset-ui";

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

export function AssetAiReviewWorkspace({
  assetLabel,
  currentVersion,
  nextVersion,
  title,
  description = "逐项查看建议及原内容；未选择的内容继续保留在本次处理记录中。",
  suggestions,
  initialSelected,
  sourceLabel,
  onBack,
  onApply,
}) {
  const initialLabels =
    initialSelected ||
    suggestions
      .filter((item) => item.selected !== false)
      .map((item) => item.label);
  const [selected, setSelected] = useState(initialLabels);
  const [activeField, setActiveField] = useState(suggestions[0]?.label || "");
  const [mobileView, setMobileView] = useState("suggestion");
  const activeIndex = suggestions.findIndex(
    (item) => item.label === activeField,
  );
  const activeSuggestion = suggestions[Math.max(activeIndex, 0)];
  const toggle = (label, checked) =>
    setSelected((current) =>
      checked
        ? [...new Set([...current, label])]
        : current.filter((item) => item !== label),
    );
  const moveTo = (index) => {
    const item = suggestions[index];
    if (!item) return;
    setActiveField(item.label);
    setMobileView("suggestion");
  };
  if (!activeSuggestion) return null;
  return (
    <section className="s4-ai-review-workspace" aria-label={title}>
      <header className="s4-ai-review-heading">
        <div>
          <button type="button" onClick={onBack}>
            <Icon name="chevronLeft" />
            返回{assetLabel}
          </button>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span>
          <StatusBadge tone="warning">
            {suggestions.length} 项建议待审核
          </StatusBadge>
          <small>
            当前{assetLabel} {currentVersion}
          </small>
        </span>
      </header>
      <div className="s4-ai-review-body">
        <div className="s4-ai-review-summary">
          <Icon name="info" />
          <span>
            已选择 {selected.length} 项；确认后形成{assetLabel} {nextVersion}
            ，未选择的建议仍可从 AI 处理记录中查看。
          </span>
        </div>
        <div className="s4-ai-review-layout">
          <nav className="s4-ai-review-fields" aria-label="待审核字段">
            <header>
              <b>字段目录</b>
              <small>{suggestions.length} 项建议</small>
            </header>
            <div>
              {suggestions.map((item) => {
                const isActive = item.label === activeSuggestion.label;
                const isSelected = selected.includes(item.label);
                return (
                  <article
                    className={isActive ? "is-active" : ""}
                    key={item.label}
                  >
                    <button
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => {
                        setActiveField(item.label);
                        setMobileView("suggestion");
                      }}
                    >
                      <span>
                        <b>{item.label}</b>
                        <small>{item.meta || "AI 处理建议"}</small>
                      </span>
                      <Icon name="chevronRight" />
                    </button>
                    <CustomCheckbox
                      checked={isSelected}
                      onChange={(checked) => toggle(item.label, checked)}
                      ariaLabel={`${isSelected ? "取消选择" : "选择"}${item.label}建议`}
                    />
                  </article>
                );
              })}
            </div>
          </nav>

          <section className="s4-ai-review-detail">
            <header>
              <span>
                <small>正在审核</small>
                <h3>{activeSuggestion.label}</h3>
              </span>
              <StatusBadge
                tone={
                  selected.includes(activeSuggestion.label)
                    ? "success"
                    : "neutral"
                }
              >
                {selected.includes(activeSuggestion.label)
                  ? "已选择"
                  : "未选择"}
              </StatusBadge>
            </header>

            <div
              className="s4-ai-review-mobile-switch"
              role="tablist"
              aria-label="审核内容"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mobileView === "suggestion"}
                className={mobileView === "suggestion" ? "is-active" : ""}
                onClick={() => setMobileView("suggestion")}
              >
                AI 建议
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileView === "current"}
                className={mobileView === "current" ? "is-active" : ""}
                onClick={() => setMobileView("current")}
              >
                当前内容
              </button>
            </div>

            <div className="s4-ai-review-panels">
              <article
                className={`s4-ai-review-suggestion ${
                  mobileView === "suggestion" ? "is-mobile-active" : ""
                }`}
              >
                <header>
                  <span>
                    <Icon name="sparkles" />
                    AI 建议
                  </span>
                  <small>
                    建议写入{assetLabel} {nextVersion}
                  </small>
                </header>
                <p>{activeSuggestion.suggestion}</p>
              </article>

              <aside
                className={`s4-ai-review-inspector ${
                  mobileView === "current" ? "is-mobile-active" : ""
                }`}
              >
                <section>
                  <small>当前内容</small>
                  <p>{activeSuggestion.current}</p>
                </section>
                <section>
                  <small>修改依据</small>
                  <p>{activeSuggestion.reason}</p>
                </section>
                <footer>
                  <Icon name="file" />
                  <span>
                    <small>参考来源</small>
                    <b>{activeSuggestion.source || sourceLabel}</b>
                  </span>
                </footer>
              </aside>
            </div>

            <footer className="s4-ai-review-field-nav">
              <Button
                size="sm"
                icon="chevronLeft"
                disabled={activeIndex <= 0}
                onClick={() => moveTo(activeIndex - 1)}
              >
                上一项
              </Button>
              <span>
                {activeIndex + 1} / {suggestions.length}
              </span>
              <Button
                size="sm"
                disabled={activeIndex >= suggestions.length - 1}
                onClick={() => moveTo(activeIndex + 1)}
              >
                下一项
              </Button>
            </footer>
          </section>
          <footer className="s4-ai-review-actions">
            <span>
              {selected.length
                ? `将更新 ${selected.length} 个字段`
                : "尚未选择任何建议"}
            </span>
            <div>
              <Button onClick={onBack}>稍后处理</Button>
              <Button
                tone="primary"
                disabled={!selected.length}
                onClick={() => onApply(selected)}
              >
                确认所选 {selected.length} 项
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
