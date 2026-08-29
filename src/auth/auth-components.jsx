import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";

export function AuthBrand({ compact = false }) {
  return (
    <div className={`auth-brand ${compact ? "is-compact" : ""}`}>
      <Link className="auth-wordmark" to="/" aria-label="返回 Hunter 首页">
        HUNTER
      </Link>
      {!compact ? (
        <div className="auth-brand-copy">
          <span>持续推进 · 证据驱动</span>
          <h1>
            <span>继续推进，</span>
            <span>而不是重新开始。</span>
          </h1>
          <p>回到你的任务，查看执行进度、人工判断与下一步行动。</p>
        </div>
      ) : null}
      <div className="auth-brand-track" aria-hidden="true">
        <i />
        <span>
          <Icon name="activity" />
        </span>
        <b />
      </div>
    </div>
  );
}

export function AuthField({ id, label, error, action, ...inputProps }) {
  return (
    <div className={`auth-field ${error ? "has-error" : ""}`}>
      <label className="auth-field-label" htmlFor={id}>
        {label}
      </label>
      <span className="auth-input-wrap">
        <input id={id} aria-invalid={Boolean(error)} {...inputProps} />
        {action}
      </span>
      {error ? <small role="alert">{error}</small> : null}
    </div>
  );
}

export function AuthStatus({ children, tone = "info" }) {
  if (!children) return null;
  return (
    <p className={`auth-status is-${tone}`} role="status">
      <Icon
        name={
          tone === "error" ? "warning" : tone === "success" ? "check" : "info"
        }
      />
      <span>{children}</span>
    </p>
  );
}
