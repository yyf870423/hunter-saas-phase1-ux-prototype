import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Icon } from "../components/Icon";
import {
  Button,
  IconButton,
  Modal,
  SearchField,
  StatusBadge,
} from "../stage1/ui";

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
      "在本次任务边界内自动分析和写入；文件上传与邮件发送仍需逐次确认。",
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
  const textareaRef = useRef(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [uploadConfirmOpen, setUploadConfirmOpen] = useState(false);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 54), 150);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 150 ? "auto" : "hidden";
  }, [value]);
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
  const commitSubmit = () => {
    if (!value.trim() && !attachments.length) return;
    onSend(value.trim(), attachments);
    setUploadConfirmOpen(false);
  };
  const submit = () => {
    if (!value.trim() && !attachments.length) return;
    if (attachments.length) {
      setUploadConfirmOpen(true);
      return;
    }
    commitSubmit();
  };
  return (
    <>
      <div className={`s2-composer ${disabled ? "is-disabled" : ""}`}>
        {attachments.length ? (
          <div className="s2-attachments">
            {attachments.map((file, index) => (
              <span key={`${file.name}-${index}`}>
                <Icon
                  name={file.type?.startsWith("image/") ? "image" : "file"}
                />
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
          ref={textareaRef}
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
      <Modal
        open={uploadConfirmOpen}
        close={() => setUploadConfirmOpen(false)}
        title="确认上传到 Hunter"
        description="文件将在确认后上传到当前工作，用于本次分析。"
        size="lg"
        footer={
          <>
            <Button
              tone="secondary"
              onClick={() => setUploadConfirmOpen(false)}
            >
              取消
            </Button>
            <Button tone="primary" onClick={commitSubmit}>
              确认上传并发送
            </Button>
          </>
        }
      >
        <div className="s2-upload-confirm">
          <div className="s2-upload-confirm-target">
            <span>上传位置</span>
            <b>当前工作</b>
          </div>
          <div className="s2-upload-confirm-list">
            {attachments.map((file, index) => (
              <div key={`${file.name}-${index}`}>
                <i>
                  <Icon
                    name={file.type?.startsWith("image/") ? "image" : "file"}
                  />
                </i>
                <span>
                  <b>{file.name}</b>
                  <small>
                    {file.type || "未知类型"} · {formatFileSize(file.size)}
                  </small>
                </span>
                <IconButton
                  icon="close"
                  label={`移除 ${file.name}`}
                  onClick={() => {
                    const next = attachments.filter(
                      (_, itemIndex) => itemIndex !== index,
                    );
                    onAttachmentsChange(next);
                    if (!next.length) setUploadConfirmOpen(false);
                  }}
                />
              </div>
            ))}
          </div>
          <p>
            上传前请确认文件不包含无关的敏感资料。原始简历附件不会因候选人自动提交而自动上传。
          </p>
        </div>
      </Modal>
    </>
  );
}

function formatFileSize(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function EmailDraftReview({
  sender,
  initialRecipients,
  initialSubject,
  initialBody,
  onSend,
  onCancel,
}) {
  const [recipients, setRecipients] = useState(initialRecipients);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);
  const valid = recipients.trim() && subject.trim() && body.trim();

  const send = () => {
    if (!valid || sending) return;
    setSending(true);
    window.setTimeout(() => {
      onSend({ recipients, subject, body });
      setSending(false);
    }, 650);
  };

  return (
    <section className="s2-email-review" aria-label="邮件发送确认">
      <header>
        <i>
          <Icon name="mail" />
        </i>
        <span>
          <b>确认邮件内容</b>
          <small>Hunter 已起草邮件，但不会自动发送。</small>
        </span>
      </header>
      <div className="s2-email-fields">
        <label>
          <span>发件人</span>
          <input value={sender} readOnly />
        </label>
        <label>
          <span>收件人</span>
          <input
            value={recipients}
            onChange={(event) => setRecipients(event.target.value)}
          />
        </label>
        <label>
          <span>主题</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </label>
        <label>
          <span>正文</span>
          <textarea
            rows={7}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
      </div>
      <footer>
        <small>如需附件，请先添加文件并逐项确认。本次邮件没有附件。</small>
        <div>
          <Button tone="secondary" onClick={onCancel}>
            暂不发送
          </Button>
          <Button
            tone="primary"
            icon="send"
            loading={sending}
            disabled={!valid}
            onClick={send}
          >
            确认并发送
          </Button>
        </div>
      </footer>
    </section>
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

function safeMarkdownHref(href) {
  if (!href) return undefined;
  if ((href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#"))
    return href;
  try {
    const url = new URL(href);
    return ["http:", "https:"].includes(url.protocol) ? href : undefined;
  } catch {
    return undefined;
  }
}

export function createMarkdownTable(headers, rows) {
  const escapeCell = (value) =>
    String(value ?? "—")
      .replaceAll("|", "\\|")
      .replace(/\s*\n\s*/g, " ");
  return [
    `| ${headers.map(escapeCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ].join("\n");
}

export function HunterMarkdown({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={{
        table: ({ node: _node, ...props }) => (
          <table className="s2-markdown-table" {...props} />
        ),
        blockquote: ({ node: _node, ...props }) => (
          <blockquote className="s2-markdown-note" {...props} />
        ),
        a: ({ node: _node, href, ...props }) => {
          const safeHref = safeMarkdownHref(href);
          if (!safeHref) return <span {...props} />;
          const external = /^https?:/i.test(safeHref);
          return (
            <a
              {...props}
              href={safeHref}
              rel={external ? "noreferrer" : undefined}
              target={external ? "_blank" : undefined}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function HunterReply({ children, markdown, streaming = false }) {
  return (
    <article
      className={`s2-hunter-reply ${streaming ? "is-streaming" : ""}`}
      data-renderer={markdown ? "markdown" : "controlled"}
    >
      {markdown ? <HunterMarkdown content={markdown} /> : null}
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
              {step.statusDetail ? <small>{step.statusDetail}</small> : null}
            </span>
            <em>{step.statusLabel || status.label}</em>
          </li>
        );
      })}
    </ol>
  );
}

export function PlanUpdate({ update, detailed = false }) {
  if (!update) return null;
  return (
    <div className={`s2-plan-update tone-${update.tone || "info"}`}>
      <Icon name={update.tone === "warning" ? "refresh" : "info"} />
      <span>
        <b>{update.title}</b>
        <small>{update.detail}</small>
        {detailed && update.requirement ? (
          <q className="s2-plan-update-requirement">
            <span>你的补充要求</span>
            {update.requirement}
          </q>
        ) : null}
        {detailed && update.changes?.length ? (
          <ul className="s2-plan-update-changes">
            {update.changes.map((change) => (
              <li key={change.title}>
                <b>{change.title}</b>
                <span>{change.detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {detailed && update.unchanged ? (
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
  const [tasksOpen, setTasksOpen] = useState(false);
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
  const completedTasks = tasks.filter((task) => task.status === "完成").length;
  const waitingTasks = tasks.filter(
    (task) => task.status === "等待用户",
  ).length;
  const taskSummary = [
    completedTasks ? `${completedTasks} 项完成` : null,
    waitingTasks ? `${waitingTasks} 项等待用户` : null,
    tasks.length - completedTasks - waitingTasks > 0
      ? `${tasks.length - completedTasks - waitingTasks} 项处理中`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
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
        <Icon name={open ? "chevronDown" : "chevronUp"} />
      </button>
      {open ? (
        <div className="s2-runtime-body">
          <div className="s2-runtime-plan">
            <header className="s2-runtime-plan-header">
              <span>
                <b>当前进度</b>
                <small>
                  {done} / {plan.length} 项已完成
                </small>
              </span>
            </header>
            <PlanUpdate update={planUpdate} />
            <PlanList steps={plan} />
          </div>
          <section className="s2-runtime-tasks">
            <button
              type="button"
              aria-expanded={tasksOpen}
              onClick={() => setTasksOpen((value) => !value)}
            >
              <span>
                <b>相关任务</b>
                <small>{taskSummary || `${tasks.length} 项任务`}</small>
              </span>
              <Icon name={tasksOpen ? "chevronUp" : "chevronDown"} />
            </button>
            {tasksOpen ? (
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
            ) : null}
          </section>
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
          <IconButton icon="plus" label="新建工作" onClick={onCreate} />
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
        {options.map((option, index) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onSelect(option)}
          >
            <span className="s2-decision-index" aria-hidden="true">
              {index + 1}
            </span>
            <span className="s2-decision-copy">
              <b>{option.label}</b>
              <small>{option.description}</small>
            </span>
            <Icon name="chevronRight" />
          </button>
        ))}
      </div>
      <p>也可以直接在下方输入其他处理意见。</p>
    </section>
  );
}
