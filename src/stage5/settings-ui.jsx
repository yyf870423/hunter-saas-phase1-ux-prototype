import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, EmptyState, StatusBadge } from "../stage1/ui";

export function Toggle({ checked, onChange, disabled = false, label }) {
  const [draft, setDraft] = useState(Boolean(checked));
  useEffect(() => setDraft(Boolean(checked)), [checked]);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={draft}
      aria-label={label}
      className={`s5-toggle ${draft ? "is-checked" : ""}`}
      disabled={disabled}
      onClick={() => {
        const next = !draft;
        setDraft(next);
        onChange?.(next);
      }}
    >
      <i />
    </button>
  );
}

export function SettingsPageHeader({ title, description, badge, actions }) {
  return (
    <header className="s5-page-header">
      <div>
        <span>
          <h1>{title}</h1>
          {badge}
        </span>
        <p>{description}</p>
      </div>
      {actions ? <div className="s5-page-actions">{actions}</div> : null}
    </header>
  );
}

export function SettingsSection({
  title,
  description,
  action,
  children,
  tone = "default",
  className = "",
}) {
  return (
    <section className={`s5-section s5-section-${tone} ${className}`.trim()}>
      <header>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="s5-section-body">{children}</div>
    </section>
  );
}

export function SettingRow({
  icon,
  title,
  description,
  meta,
  status,
  action,
  disabled = false,
  onClick,
  children,
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`s5-setting-row ${icon ? "has-icon" : "no-icon"} ${disabled ? "is-disabled" : ""} ${onClick ? "is-clickable" : ""}`}
      disabled={onClick ? disabled : undefined}
      onClick={onClick}
    >
      {icon ? (
        <i className="s5-setting-row-icon">
          <Icon name={icon} />
        </i>
      ) : null}
      <span className="s5-setting-row-copy">
        <span>
          <b>{title}</b>
          {status}
        </span>
        {description ? <small>{description}</small> : null}
        {meta ? <em>{meta}</em> : null}
        {children}
      </span>
      {action ? <span className="s5-setting-row-action">{action}</span> : null}
      {onClick ? <Icon name="chevronRight" /> : null}
    </Tag>
  );
}

export function LockedRule({ title, description }) {
  return (
    <div className="s5-locked-rule">
      <i>
        <Icon name="lock" />
      </i>
      <span>
        <b>{title}</b>
        <small>{description}</small>
      </span>
      <StatusBadge tone="neutral" dot={false}>
        始终开启
      </StatusBadge>
    </div>
  );
}

export function SettingsLoading({ rows = 4 }) {
  return (
    <div className="s5-page-state s5-page-loading" aria-label="设置加载中">
      <span />
      <span />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index}>
          <i />
          <b />
          <small />
        </div>
      ))}
    </div>
  );
}

export function SettingsError({ onRetry }) {
  return (
    <div className="s5-page-state">
      <EmptyState
        icon="warning"
        title="设置读取失败"
        description="网络连接中断，尚未修改任何设置。可以重试，不会覆盖已保存内容。"
        action={
          <Button tone="primary" icon="refresh" onClick={onRetry}>
            重新加载
          </Button>
        }
      />
    </div>
  );
}

export function InlineNotice({ tone = "info", icon = "info", children }) {
  return (
    <div className={`s5-inline-notice s5-inline-notice-${tone}`}>
      <Icon name={icon} />
      <span>{children}</span>
    </div>
  );
}

export function ChoiceCard({
  selected,
  title,
  description,
  icon,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`s5-choice-card ${selected ? "is-selected" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      <i>{icon ? <Icon name={icon} /> : <span />}</i>
      <span>
        <b>{title}</b>
        <small>{description}</small>
      </span>
      <em>{selected ? <Icon name="check" /> : null}</em>
    </button>
  );
}

export function MetricDonut({ value, label, caption, size = "lg" }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={`s5-metric-donut s5-metric-donut-${size}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} />
        <circle
          className="is-progress"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span>
        <b>{label}</b>
        <small>{caption}</small>
      </span>
    </div>
  );
}
