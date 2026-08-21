import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Icon } from "../components/Icon";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const notify = (message, tone = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((item) => item.id !== id)),
      3200,
    );
  };
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="s1-toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`s1-toast s1-toast-${toast.tone}`} key={toast.id}>
            <Icon
              name={
                toast.tone === "error"
                  ? "warning"
                  : toast.tone === "info"
                    ? "info"
                    : "check"
              }
            />
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label="关闭提示"
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id),
                )
              }
            >
              <Icon name="close" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export function Button({
  children,
  icon,
  tone = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`s1-button s1-button-${tone} s1-button-${size} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="s1-spinner" />
      ) : icon ? (
        <Icon name={icon} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({ icon, label, badge, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`s1-icon-button ${className}`}
      aria-label={label}
      {...props}
    >
      <Icon name={icon} />
      {badge ? <em>{badge}</em> : null}
    </button>
  );
}

export function StatusBadge({ children, tone = "neutral", dot = true }) {
  return (
    <span className={`s1-status s1-status-${tone}`}>
      {dot ? <i /> : null}
      <span>{children}</span>
    </span>
  );
}

function useOverlay(open, close) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);
}

export function Modal({
  open,
  close,
  title,
  description,
  children,
  size = "md",
  footer,
  closeDisabled = false,
}) {
  const titleId = useId();
  useOverlay(open, close);
  if (!open) return null;
  return (
    <div
      className="s1-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) close();
      }}
    >
      <section
        className={`s1-modal s1-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header>
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <IconButton
            icon="close"
            label="关闭"
            disabled={closeDisabled}
            onClick={close}
          />
        </header>
        <div className="s1-modal-body">{children}</div>
        {footer ? <footer>{footer}</footer> : null}
      </section>
    </div>
  );
}

export function Drawer({ open, close, title, children, side = "right" }) {
  const titleId = useId();
  useOverlay(open, close);
  if (!open) return null;
  return (
    <div
      className="s1-overlay s1-drawer-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <aside
        className={`s1-drawer s1-drawer-${side}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header>
          <h2 id={titleId}>{title}</h2>
          <IconButton icon="close" label="关闭" onClick={close} />
        </header>
        <div className="s1-drawer-body">{children}</div>
      </aside>
    </div>
  );
}

export function Tabs({ value, onChange, items, label }) {
  return (
    <div className="s1-tabs app-tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          type="button"
          role="tab"
          aria-selected={value === item.value}
          className={value === item.value ? "is-active" : ""}
          key={item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {item.count !== undefined ? <em>{item.count}</em> : null}
        </button>
      ))}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  autoFocus = false,
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <label className="s1-search-field">
      <Icon name="search" />
      <input
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {value ? (
        <button
          type="button"
          aria-label="清空搜索"
          onClick={() => onChange("")}
        >
          <Icon name="close" />
        </button>
      ) : null}
    </label>
  );
}

export function EmptyState({ icon = "route", title, description, action }) {
  return (
    <section className="s1-empty-state">
      <i>
        <Icon name={icon} />
      </i>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

export function Skeleton({ className = "" }) {
  return <span className={`s1-skeleton ${className}`} aria-hidden="true" />;
}
