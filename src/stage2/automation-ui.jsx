import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, IconButton, SearchField, StatusBadge } from "../stage1/ui";

export const authorizationModes = [
  {
    id: "analysis",
    label: "仅分析",
    description:
      "可以读取、搜索、分析和生成草稿，不写入正式数据或执行外部动作。",
    icon: "search",
  },
  {
    id: "confirm",
    label: "执行前确认",
    description: "分析可以自动完成，写入数据或产生外部影响前暂停等待确认。",
    icon: "check",
  },
  {
    id: "auto",
    label: "自动执行",
    description:
      "在本次任务的对象、渠道、数量和用量边界内自动推进，强制门禁始终生效。",
    icon: "play",
  },
];

export function AuthorizationSelector({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current =
    authorizationModes.find((mode) => mode.id === value) ||
    authorizationModes[1];
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div className="s2-auth-select" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <Icon name={current.icon} />
        <span>{current.label}</span>
        <Icon name="chevronDown" />
      </button>
      {open ? (
        <div
          className="s2-auth-menu"
          role="listbox"
          aria-label="Agent 授权模式"
        >
          {authorizationModes.map((mode) => (
            <button
              type="button"
              role="option"
              aria-selected={mode.id === value}
              className={mode.id === value ? "is-selected" : ""}
              key={mode.id}
              onClick={() => {
                onChange(mode.id);
                setOpen(false);
              }}
            >
              <i>
                <Icon name={mode.icon} />
              </i>
              <span>
                <b>{mode.label}</b>
                <small>{mode.description}</small>
              </span>
              {mode.id === value ? <Icon name="check" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Composer({
  value,
  onChange,
  onSend,
  authMode,
  onAuthChange,
  attachments = [],
  onAttachmentsChange,
  placeholder = "输入补充信息、决定或新的要求",
  streaming = false,
  onStop,
  disabled = false,
}) {
  const fileRef = useRef(null);
  const [attachmentError, setAttachmentError] = useState("");
  const addFiles = (incoming) => {
    const allowed = incoming.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return (
        file.size <= 20 * 1024 * 1024 &&
        [
          "pdf",
          "doc",
          "docx",
          "xls",
          "xlsx",
          "csv",
          "txt",
          "md",
          "png",
          "jpg",
          "jpeg",
          "webp",
        ].includes(extension)
      );
    });
    if (allowed.length !== incoming.length) {
      setAttachmentError("仅支持文档、表格和图片，单个文件不能超过 20 MB。");
    } else {
      setAttachmentError("");
    }
    if (allowed.length) onAttachmentsChange([...attachments, ...allowed]);
  };
  const submit = () => {
    if (!value.trim() && !attachments.length) return;
    onSend(value.trim(), attachments);
  };
  return (
    <div className={`s2-composer ${disabled ? "is-disabled" : ""}`}>
      {attachments.length ? (
        <div className="s2-attachments">
          {attachments.map((file, index) => (
            <span key={`${file.name}-${index}`}>
              <Icon name={file.type?.startsWith("image/") ? "image" : "file"} />
              <b>{file.name}</b>
              <button
                type="button"
                aria-label={`移除 ${file.name}`}
                onClick={() =>
                  onAttachmentsChange(
                    attachments.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <Icon name="close" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {attachmentError ? (
        <div className="s2-attachment-error" role="alert">
          <Icon name="warning" />
          <span>{attachmentError}</span>
          <button
            type="button"
            aria-label="关闭文件错误"
            onClick={() => setAttachmentError("")}
          >
            <Icon name="close" />
          </button>
        </div>
      ) : null}
      <textarea
        value={value}
        disabled={disabled}
        rows={2}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        onPaste={(event) => {
          const files = Array.from(event.clipboardData?.files || []);
          if (files.length) addFiles(files);
        }}
      />
      <div className="s2-composer-toolbar">
        <div>
          <IconButton
            icon="file"
            label="添加文件或截图"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
          />
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg,.webp"
            hidden
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              addFiles(files);
              event.target.value = "";
            }}
          />
          <AuthorizationSelector
            value={authMode}
            onChange={onAuthChange}
            disabled={disabled}
          />
        </div>
        {streaming ? (
          <Button tone="secondary" icon="pause" onClick={onStop}>
            停止生成
          </Button>
        ) : (
          <IconButton
            icon="send"
            label="发送"
            disabled={disabled || (!value.trim() && !attachments.length)}
            onClick={submit}
          />
        )}
      </div>
    </div>
  );
}

export function UserMessage({ children, time = "今天 09:06" }) {
  return (
    <div className="s2-user-message" tabIndex={0}>
      <div>{children}</div>
      <time>{time}</time>
    </div>
  );
}

export function HunterReply({ children, streaming = false }) {
  return (
    <article className={`s2-hunter-reply ${streaming ? "is-streaming" : ""}`}>
      {children}
      {streaming ? (
        <i className="s2-stream-caret" aria-label="正在生成" />
      ) : null}
    </article>
  );
}

const planStatus = {
  done: { label: "完成", icon: "check", className: "is-complete" },
  running: { label: "进行中", className: "is-active" },
  "waiting-user": {
    label: "等待用户",
    icon: "clock",
    className: "is-waiting",
  },
  paused: { label: "已暂停", icon: "pause", className: "is-paused" },
  adjusted: {
    label: "需调整",
    icon: "refresh",
    className: "is-adjusted",
  },
  pending: { label: "待开始", className: "is-pending" },
};

export function PlanList({ steps }) {
  return (
    <ol className="s2-plan-list">
      {steps.map((step, index) => {
        const status = planStatus[step.status] || planStatus.pending;
        return (
          <li className={status.className} key={step.id}>
            <i>
              {step.status === "running" ? (
                <span />
              ) : status.icon ? (
                <Icon name={status.icon} />
              ) : (
                index + 1
              )}
            </i>
            <span>
              <b>{step.title}</b>
              <small>{step.detail}</small>
              {step.requirement ? (
                <small className="s2-plan-requirement">
                  <span>对应要求</span>
                  {step.requirement}
                </small>
              ) : null}
              {step.statusDetail ? <small>{step.statusDetail}</small> : null}
            </span>
            <em>{step.statusLabel || status.label}</em>
          </li>
        );
      })}
    </ol>
  );
}

export function PlanUpdate({ update }) {
  if (!update) return null;
  return (
    <div className={`s2-plan-update tone-${update.tone || "info"}`}>
      <Icon name={update.tone === "warning" ? "refresh" : "info"} />
      <span>
        <b>{update.title}</b>
        <small>{update.detail}</small>
        {update.requirement ? (
          <q className="s2-plan-update-requirement">
            <span>你的补充要求</span>
            {update.requirement}
          </q>
        ) : null}
        {update.changes?.length ? (
          <ul className="s2-plan-update-changes">
            {update.changes.map((change) => (
              <li key={change.title}>
                <b>{change.title}</b>
                <span>{change.detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {update.unchanged ? (
          <small className="s2-plan-update-unchanged">
            <b>保持不变</b>
            {update.unchanged}
          </small>
        ) : null}
      </span>
      <time>{update.time}</time>
    </div>
  );
}

export function RuntimeBar({
  open,
  onToggle,
  plan,
  planUpdate,
  tasks,
  onInspectTask,
  paused = false,
  docked = false,
}) {
  const done = plan.filter((step) => step.status === "done").length;
  const waiting = plan.some((step) => step.status === "waiting-user");
  const adjusted = plan.some((step) => step.status === "adjusted");
  const running = plan.some((step) => step.status === "running");
  const summary = adjusted
    ? `${done} 项已完成，1 项根据新信息调整`
    : paused
      ? `${done} 项已完成，当前步骤已暂停`
      : waiting
        ? `${done} 项已完成，正在等待候选人审核`
        : running
          ? `已完成 ${done} / ${plan.length} 项`
          : `${done} / ${plan.length} 项已完成`;
  const badge = paused
    ? adjusted
      ? "计划调整"
      : "已暂停"
    : waiting
      ? "等待用户"
      : done === plan.length
        ? "已完成"
        : "推进中";
  return (
    <section
      className={`s2-runtime ${docked ? "is-docked" : ""} ${open ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="s2-runtime-summary"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="s2-runtime-icon">
          <Icon name="task" />
        </span>
        <span>
          <b>执行计划</b>
          <small>{summary}</small>
        </span>
        <StatusBadge
          tone={
            done === plan.length
              ? "success"
              : adjusted || waiting
                ? "warning"
                : paused
                  ? "neutral"
                  : "info"
          }
        >
          {badge}
        </StatusBadge>
        <Icon name={open ? "chevronUp" : "chevronDown"} />
      </button>
      {open ? (
        <div className="s2-runtime-body">
          <div>
            <header>
              <b>动态计划</b>
              <small>计划会随新信息更新，不代表固定流水线</small>
            </header>
            <PlanUpdate update={planUpdate} />
            <PlanList steps={plan} />
          </div>
          <div>
            <header>
              <b>相关内部任务</b>
              <small>只属于当前主线，不进入支线任务列表</small>
            </header>
            <div className="s2-internal-tasks">
              {tasks.map((task) => (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => onInspectTask(task)}
                >
                  <span>
                    <b>{task.title}</b>
                    <small>{task.action}</small>
                  </span>
                  <StatusBadge tone={task.tone}>{task.status}</StatusBadge>
                  <time>{task.duration}</time>
                  <Icon name="chevronRight" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function WorkstreamHistory({
  items,
  collapsed,
  onToggle,
  currentId,
  onSelect,
  onCreate,
}) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return keyword
      ? items.filter((item) =>
          `${item.title} ${item.type} ${item.object}`
            .toLowerCase()
            .includes(keyword),
        )
      : items;
  }, [items, query]);
  return (
    <aside className={`s2-history ${collapsed ? "is-collapsed" : ""}`}>
      <header>
        {collapsed ? null : <b>业务主线</b>}
        <div>
          <IconButton icon="plus" label="新建业务主线" onClick={onCreate} />
          <IconButton
            icon={collapsed ? "panelRight" : "panelLeft"}
            label={collapsed ? "展开主线列表" : "收起主线列表"}
            onClick={onToggle}
          />
        </div>
      </header>
      {collapsed ? (
        <div className="s2-history-collapsed-items">
          {items.slice(0, 4).map((item) => (
            <button
              type="button"
              aria-label={item.title}
              title={item.title}
              className={item.id === currentId ? "is-active" : ""}
              key={item.id}
              onClick={() => onSelect(item)}
            >
              <Icon
                name={
                  item.type === "岗位招聘"
                    ? "briefcase"
                    : item.type === "人才摸排"
                      ? "database"
                      : item.type === "候选人求职"
                        ? "user"
                        : "building"
                }
              />
              <i className={`tone-${item.tone}`} />
            </button>
          ))}
        </div>
      ) : (
        <>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="搜索业务主线"
          />
          <div className="s2-history-list">
            {visible.map((item) => (
              <button
                type="button"
                className={item.id === currentId ? "is-active" : ""}
                key={item.id}
                onClick={() => onSelect(item)}
              >
                <span>
                  <small>
                    {item.type}
                    {item.pinned ? <Icon name="pin" /> : null}
                  </small>
                  <b>{item.title}</b>
                  <em>{item.object}</em>
                </span>
                <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                <time>{item.time}</time>
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

export function EvidenceTable({ rows, onOpen }) {
  return (
    <div className="s2-inline-artifact">
      <header>
        <span>
          <Icon name="paper" />
          <b>已确认的岗位边界</b>
        </span>
        <button type="button" onClick={onOpen}>
          查看完整证据 <Icon name="chevronRight" />
        </button>
      </header>
      <div className="s2-evidence-table">
        {rows.map((row) => (
          <div key={row.finding}>
            <b>{row.source}</b>
            <span>{row.finding}</span>
            <small>{row.freshness}</small>
            <StatusBadge tone="success">{row.confidence}</StatusBadge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DecisionRequest({ title, description, options, onSelect }) {
  return (
    <section className="s2-decision-request">
      <header>
        <Icon name="warning" />
        <span>
          <b>{title}</b>
          <small>{description}</small>
        </span>
      </header>
      <div>
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onSelect(option)}
          >
            <b>{option.label}</b>
            <small>{option.description}</small>
            <Icon name="chevronRight" />
          </button>
        ))}
      </div>
      <p>也可以直接在下方输入其他处理意见。</p>
    </section>
  );
}
