import { useEffect, useId, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeReplyStream } from "./task-streaming";
import { useTaskReplyStream } from "./useTaskReplyStream";
import { Icon } from "../components/Icon";
import { TaskActivity, TaskQuestion, TaskTurnSummary, useTaskConversation, useTaskPresentationGate } from "./TaskConversation";
import {
  Button,
  Drawer,
  IconButton,
  SearchField,
  StatusBadge,
} from "../stage1/ui";
import {
  mergeLifecycleTasks,
  useOpportunityState,
} from "../stage4/opportunity-store";
import { applyTaskPins, useTaskPins } from "./task-pin-store";
import { TaskHistoryList } from "./TaskHistoryList";
import { TaskHeaderControlPortal } from "./TaskWorkspaceControls";
import "./task-history.css";

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
    description: "在本次任务边界内自动分析和写入；邮件发送仍需逐次确认。",
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
  processingDelayMs,
}) {
  const conversation = useTaskConversation();
  disabled = disabled || Boolean(conversation?.turn) || Boolean(conversation?.outputBusy);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const [attachmentError, setAttachmentError] = useState("");
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 54), 150);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 150 ? "auto" : "hidden";
  }, [value]);
  const addFiles = (incoming) => {
    if (disabled) return;
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
    if (disabled || streaming || conversation?.turn || !value.trim() && !attachments.length) return;
    const text = value.trim(), files = [...attachments];
    if (conversation) {
      if (conversation.run(text, files, () => onSend(text, files), { delayMs: processingDelayMs })) {
        onChange("");
        onAttachmentsChange?.([]);
      }
    } else onSend(text, files);
  };
  return (
    <div className={`s2-composer ${disabled && !conversation?.turn ? "is-disabled" : ""}`}>
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
        ref={textareaRef}
        value={value}
        disabled={disabled}
        aria-label="任务对话输入"
        rows={2}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
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
        {streaming || conversation?.turn || conversation?.outputBusy ? (
          <Button tone="secondary" icon="pause" disabled={conversation?.turn?.executing} onClick={conversation?.turn ? conversation.stop : conversation?.outputBusy ? () => { conversation.stopOutput(); onStop?.(); } : onStop}>
            停止
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

export function EmailDraftReview({
  sender,
  initialRecipients,
  initialSubject,
  initialBody,
  onSend,
  onCancel,
}) {
  const conversation = useTaskConversation();
  const outputBusy = Boolean(conversation?.outputBusy || conversation?.outputStopped);
  const [recipients, setRecipients] = useState(initialRecipients);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);
  const valid = !outputBusy && recipients.trim() && subject.trim() && body.trim();

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
            确认发送
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

export function HunterMarkdown({ content, budget = Infinity }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={Number.isFinite(budget) ? [[rehypeReplyStream, { budget }]] : []}
      skipHtml
      components={{
        table: ({ node: _node, ...props }) => (
          <table className="s2-markdown-table" {...props} />
        ),
        blockquote: ({ node: _node, ...props }) => (
          <blockquote className="s2-markdown-note" {...props} />
        ),
        a: ({ node: _node, href, ...props }) => {
          if (Number.isFinite(budget)) return <span {...props} />;
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

export function HunterReply({ children, markdown, streaming = false, elapsedMs, historical = false }) {
  const conversation = useTaskConversation();
  const id = useId();
  const generation = useRef(conversation?.turn?.id || conversation?.result.generation || 0);
  const resuming = conversation?.resumeHistory && !conversation.work && generation.current === 0;
  const live = Boolean(!historical && !resuming && conversation && !conversation.outputStopped && (streaming || generation.current || conversation.work?.status === "running" || conversation.outputBusy));
  const output = useTaskReplyStream(id, markdown || "", conversation, live);
  const presentationReady = useTaskPresentationGate(`${id}:${output.key || "initial"}`);
  const completed = useRef(null);
  useEffect(() => {
    if (!streaming) return conversation?.registerReply(id, generation.current);
  }, [conversation?.registerReply, id, streaming]);
  if (generation.current && conversation?.result.generation === generation.current && conversation.result.elapsed) completed.current = conversation.result;
  const isLastReply = conversation?.replies.filter(reply => reply.generation === generation.current).at(-1)?.id === id;
  const isTimingReply = generation.current ? conversation?.replies.find(reply => reply.generation === generation.current)?.id === id : isLastReply;
  const outputElapsed = output.queuedAt ? (output.finishedAt || performance.now()) - output.queuedAt : 0;
  const elapsed = Number.isFinite(elapsedMs) ? elapsedMs + outputElapsed : completed.current?.elapsed ?? (generation.current === 0 ? conversation?.initialElapsed : null);
  if (generation.current && conversation?.turn?.id === generation.current) return null;
  if (output.pending && conversation?.outputs[0]?.key !== output.key) return null;
  if (!markdown && !presentationReady) return null;
  return (
    <article
      className={`s2-hunter-reply ${streaming ? "is-streaming" : ""}`}
      data-renderer={markdown ? "markdown" : "controlled"}
      data-output-state={output.stopped ? "stopped" : output.complete ? "complete" : "streaming"}
      data-reply-generation={generation.current}
      aria-busy={output.pending}
    >
      {conversation && !streaming && isTimingReply && Number.isFinite(elapsed) ? <TaskTurnSummary elapsed={elapsed} /> : null}
      {markdown ? <HunterMarkdown content={output.source} budget={output.complete ? Infinity : output.budget} /> : null}
      {output.complete && presentationReady ? children : null}
    </article>
  );
}


// Existing scenario state still determines work status; no plan is rendered.
export { TaskActivity };

export function WorkHistory({
  items,
  collapsed,
  onToggle,
  currentId,
  onSelect,
  onCreate,
  drawerBreakpoint = 1180,
  loadState,
  onRetry,
}) {
  const lifecycle = useOpportunityState();
  const pins = useTaskPins();
  const orderedItems = useMemo(
    () => applyTaskPins(mergeLifecycleTasks(items, lifecycle), pins),
    [items, lifecycle, pins],
  );
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [useDrawer, setUseDrawer] = useState(() => window.matchMedia(`(max-width: ${drawerBreakpoint}px)`).matches);
  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${drawerBreakpoint}px)`);
    const update = () => setUseDrawer(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [drawerBreakpoint]);
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const scoped = orderedItems.filter(
      (item) => Boolean(item.archived) === showArchived,
    );
    return keyword
      ? scoped.filter((item) =>
          `${item.title} ${item.type} ${item.scenario || ""} ${(item.scenarios || []).join(" ")} ${item.object}`
            .toLowerCase()
            .includes(keyword),
        )
      : scoped;
  }, [orderedItems, query, showArchived]);
  return (
    <>
      <aside className={`s2-history ${collapsed ? "is-collapsed" : ""}`}>
        <header>
          {collapsed ? null : <b>任务</b>}
          <div>
            {!collapsed ? (
              <IconButton
                icon="folder"
                label={showArchived ? "查看最近任务" : "查看已归档任务"}
                className={showArchived ? "is-active" : ""}
                onClick={() => setShowArchived((current) => !current)}
              />
            ) : null}
            <IconButton icon="plus" label="新建任务" onClick={onCreate} />
            <IconButton
              icon={collapsed ? "panelRight" : "panelLeft"}
              label={collapsed ? "展开任务历史" : "收起任务历史"}
              onClick={() => {
                if (window.matchMedia(`(max-width: ${drawerBreakpoint}px)`).matches) {
                  setMobileOpen(true);
                } else {
                  onToggle();
                }
              }}
            />
          </div>
        </header>
        {collapsed ? (
          <div className="s2-history-collapsed-items">
            {visible.slice(0, 4).map((item) => (
              <button
                type="button"
                aria-label={item.title}
                className={item.id === currentId ? "is-active" : ""}
                key={item.id}
                onClick={() => onSelect(item)}
              >
                <Icon
                  name={
                    item.type === "岗位招聘"
                      ? "briefcase"
                      : item.type === "公司组织梳理"
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
              placeholder="搜索任务"
            />
            <TaskHistoryList
              items={visible}
              currentId={currentId}
              onSelect={onSelect}
              query={query}
              archived={showArchived}
              loadState={loadState}
              onRetry={onRetry}
            />
          </>
        )}
      </aside>
      <TaskHeaderControlPortal><IconButton
        className={`s2-history-mobile-trigger${useDrawer ? " is-visible" : ""}`}
        icon="panelLeft"
        label="打开任务列表"
        onClick={() => setMobileOpen(true)}
      /></TaskHeaderControlPortal>
      <Drawer
        open={mobileOpen}
        close={() => setMobileOpen(false)}
        title="任务列表"
        side="left"
        className="s2-history-drawer"
      >
        <div className="s2-history-drawer-tools">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="搜索任务"
          />
          <IconButton
            icon="folder"
            label={showArchived ? "查看最近任务" : "查看已归档任务"}
            className={showArchived ? "is-active" : ""}
            onClick={() => setShowArchived((current) => !current)}
          />
          <IconButton
            icon="plus"
            label="新建任务"
            onClick={() => {
              setMobileOpen(false);
              onCreate();
            }}
          />
        </div>
        <TaskHistoryList
          items={visible}
          currentId={currentId}
          onSelect={(item) => {
            setMobileOpen(false);
            onSelect(item);
          }}
          query={query}
          archived={showArchived}
          loadState={loadState}
          onRetry={onRetry}
        />
      </Drawer>
    </>
  );
}

export function DecisionRequest({ title, description, options, onSelect }) {
  return <TaskQuestion questionKey={title} title={title} description={description} options={options}
    onAnswer={({ values, text }) => onSelect({ ...(options.find(option => option.value === values[0]) || { value: "custom", label: text }), text })} />;
}

export function IdentityConflictReview({
  title,
  description,
  records,
  differences,
  note,
}) {
  return (
    <section className="s2-identity-compare">
      <header>
        <Icon name="warning" />
        <span>
          <b>{title}</b>
          <small>{description}</small>
        </span>
      </header>
      <div className="s2-identity-records">
        {records.map((record) => (
          <article key={record.label}>
            <small>{record.label}</small>
            <b>{record.name}</b>
            <p>{record.organization}</p>
            <span>{record.role}</span>
            <span>
              {record.source} · {record.updatedAt}
            </span>
          </article>
        ))}
      </div>
      <div className="s2-identity-differences">
        <table>
          <thead>
            <tr>
              <th>对比字段</th>
              <th>{records[0].label}</th>
              <th>{records[1].label}</th>
              <th>系统判断</th>
            </tr>
          </thead>
          <tbody>
            {differences.map((difference) => (
              <tr key={difference.field}>
                <th>{difference.field}</th>
                <td data-label={records[0].label}>{difference.current}</td>
                <td data-label={records[1].label}>{difference.incoming}</td>
                <td data-label="系统判断">
                  <span className={`tone-${difference.tone}`}>
                    {difference.assessment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{note}</p>
    </section>
  );
}
