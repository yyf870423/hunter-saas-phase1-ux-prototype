import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { Button } from "../stage1/ui";
import { CustomCheckbox, CustomRadio, TextInput } from "../stage4/asset-ui";
import "./task-conversation.css";
import { TaskFeedback, useTaskFeedback } from "./TaskFeedback";
import {
  TASK_DEMO_STAGE_MS,
  TASK_DEMO_TURN_MS,
  taskElapsedMs,
} from "./task-timing";

const ConversationContext = createContext(null);
export const useTaskConversation = () => useContext(ConversationContext);

const workLabels = (pathname) => {
  if (pathname.includes("client-"))
    return ["正在核对公司资料与本轮要求…", "正在整理招聘信号和待确认事项…"];
  if (pathname.includes("mapping-"))
    return ["正在核对组织、任职人与来源…", "正在整理组织关系和待核实项…"];
  if (pathname.includes("career-"))
    return ["正在读取候选人经历与岗位条件…", "正在整理匹配依据和信息缺口…"];
  if (pathname.includes("task-hand-"))
    return ["正在读取你补充的身份线索…", "正在整理冲突与待核实信息…"];
  if (pathname.includes("summary"))
    return ["正在读取本轮反馈与补充要求…", "正在整理摘要与待确认事项…"];
  if (pathname.includes("periodic"))
    return ["正在读取本轮记录与连续上下文…", "正在核对本轮结果和处理范围…"];
  if (pathname.includes("position-") || pathname.includes("research"))
    return ["正在核对岗位要求与人选资料…", "正在整理人选结果、匹配依据和缺口…"];
  return ["正在读取本轮要求与相关资料…", "正在核对结果与处理范围…"];
};

export function formatTaskDuration(milliseconds) {
  const seconds = Math.max(1, Math.round(milliseconds / 1000));
  return seconds < 60
    ? `${seconds} 秒`
    : `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;
}

export function TaskConversationProvider({ children }) {
  const location = useLocation();
  const feedback = useTaskFeedback();
  const [work, setWork] = useState(null);
  const [turn, setTurn] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [result, setResult] = useState({ generation: 0, elapsed: null });
  const [initialElapsed, setInitialElapsed] = useState(null);
  const [replies, setReplies] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const registerWait = useCallback((id, label) => {
    setWaiting((current) => [...current, { id, label }]);
    return () =>
      setWaiting((current) => current.filter((item) => item.id !== id));
  }, []);
  const registerReply = useCallback((id, generation) => {
    setReplies((current) => [...current, { id, generation }]);
    return () =>
      setReplies((current) => current.filter((reply) => reply.id !== id));
  }, []);
  const active = useRef(null),
    sequence = useRef(0),
    mounted = useRef(true);
  const automaticStarted = useRef(null);
  useEffect(() => {
    if (turn || sequence.current > 0) {
      automaticStarted.current = null;
      return;
    }
    if (work?.status === "running" && waiting.length === 0) {
      automaticStarted.current ??= performance.now();
    } else if (work && automaticStarted.current !== null) {
      setInitialElapsed(taskElapsedMs(automaticStarted.current));
      automaticStarted.current = null;
    }
  }, [work?.status, waiting.length, Boolean(turn)]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(active.current?.timer);
      active.current?.resolve({ stopped: true });
      active.current = null;
    };
  }, []);
  const stop = () => {
    const job = active.current;
    if (!job || job.executing) return;
    clearTimeout(job.timer);
    active.current = null;
    job.resolve({ stopped: true });
    setTurn(null);
    setReceipt({
      text: job.text,
      files: job.files,
      message: "已停止本轮处理，尚未执行后续操作。你可以继续补充要求。",
    });
  };
  const run = (text, files, process, { delayMs = TASK_DEMO_TURN_MS } = {}) => {
    if (active.current) return false;
    feedback?.clear();
    const job = {
      id: ++sequence.current,
      text,
      files: files.map((file) => file.name),
      started: performance.now(),
      process,
    };
    const completion = new Promise((resolve) => {
      job.resolve = resolve;
    });
    active.current = job;
    setReceipt(null);
    setTurn({ ...job, stage: 0 });
    job.timer = setTimeout(async () => {
      if (active.current !== job || !mounted.current) return;
      setTurn((current) => current && { ...current, stage: 1 });
      job.timer = setTimeout(
        async () => {
          if (active.current !== job || !mounted.current) return;
          try {
            job.executing = true;
            setTurn((current) => current && { ...current, executing: true });
            await job.process();
            if (active.current !== job || !mounted.current) return;
            setResult({
              generation: job.id,
              elapsed: taskElapsedMs(job.started),
            });
            setTurn(null);
            active.current = null;
            job.resolve({ completed: true });
          } catch (error) {
            if (active.current !== job || !mounted.current) return;
            setReceipt({
              text: job.text,
              files: job.files,
              message: "这轮处理没有完成，输入已保留。请重试或调整要求。",
              failed: true,
            });
            setTurn(null);
            active.current = null;
            job.resolve({
              failed: true,
              message:
                error instanceof Error
                  ? error.message
                  : "处理未能完成，请重试。",
            });
          }
        },
        Math.max(0, delayMs - taskElapsedMs(job.started)),
      );
    }, Math.min(TASK_DEMO_STAGE_MS, delayMs));
    return completion;
  };
  return (
    <ConversationContext.Provider
      value={{
        work,
        setWork,
        turn,
        receipt,
        result,
        initialElapsed,
        run,
        stop,
        location,
        replies,
        registerReply,
        waiting,
        registerWait,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function TaskActivity({
  plan = [],
  paused = false,
  waitingLabel,
  state,
  message,
}) {
  const conversation = useTaskConversation();
  const running = plan.find((step) => step.status === "running");
  const waiting = plan.find((step) => step.status === "waiting-user");
  const external = waiting?.statusDetail?.includes("等待外部");
  const label =
    state === "error"
      ? "本轮处理遇到问题，可按上方提示继续"
      : state === "stopped"
        ? "本轮处理已停止，已有结果保留"
        : paused
          ? "本轮已暂停"
          : external
            ? "等待外部回复，收到后继续"
            : waiting
              ? waitingLabel
                ? "等待你的确认"
                : "等待你的回复"
              : running
                ? running.title
                : "本轮处理已完成，可以继续提出要求";
  const status =
    state ||
    (paused ? "paused" : waiting ? "waiting" : running ? "running" : "done");
  useEffect(() => {
    conversation?.setWork({ label: message || label, status });
    return () => conversation?.setWork(null);
  }, [conversation?.setWork, label, status, message]);
  return null;
}

export function TaskWorkStatus({ label, running = false }) {
  return (
    <p className={`s2-agent-work ${running ? "is-working" : ""}`} role="status">
      {running ? (
        <LoaderCircle size={14} aria-hidden="true" />
      ) : (
        <span className="s2-agent-work-dot" aria-hidden="true" />
      )}
      <span>{label}</span>
    </p>
  );
}

export function TaskTurnSummary({ elapsed }) {
  return (
    <p
      className="s2-agent-duration"
      data-elapsed-kind="measured"
      data-elapsed-ms={Math.round(elapsed)}
    >
      处理用时 {formatTaskDuration(elapsed)}
    </p>
  );
}

export function TaskTimeline({
  children,
  className = "s2-timeline",
  ...props
}) {
  const conversation = useTaskConversation();
  const { turn, receipt, work, waiting = [] } = conversation || {};
  const bottom = useRef(null);
  useEffect(() => {
    if (!turn && !conversation?.result.generation && !receipt) return;
    const scroller = bottom.current?.closest(
      ".s2-conversation, .s2-task-timeline, .s2-run-timeline, .s2-new-work-conversation",
    );
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [turn?.id, turn?.stage, conversation?.result.generation, receipt]);
  return (
    <div className={className} {...props}>
      {children}
      {turn || receipt ? (
        <div className="s2-user-message s2-pending-message">
          <div>
            {(turn || receipt).text}
            {(turn || receipt).files.length ? (
              <small>{(turn || receipt).files.join("、")}</small>
            ) : null}
          </div>
          <time>刚刚</time>
        </div>
      ) : null}
      {receipt ? (
        <p
          className="s2-turn-receipt"
          role={receipt.failed ? "alert" : "status"}
        >
          {receipt.message}
        </p>
      ) : null}
      <TaskFeedback />
      {turn ? (
        <TaskWorkStatus
          running
          label={workLabels(conversation.location.pathname)[turn.stage]}
        />
      ) : waiting.length &&
        !["paused", "stopped", "error"].includes(work?.status) ? (
        <TaskWorkStatus label={waiting.at(-1).label} />
      ) : work ? (
        <TaskWorkStatus
          running={work.status === "running"}
          label={work.label}
        />
      ) : null}
      <span ref={bottom} />
    </div>
  );
}

// A clarification answer conveys intent only; operation approval stays in TaskExecutionApproval.
export function TaskQuestion({
  questionKey,
  title,
  description,
  mode = "single",
  options = [],
  allowCustom = true,
  inputLabel = "补充说明",
  onAnswer,
  onSkip,
}) {
  const conversation = useTaskConversation();
  const id = useId();
  const [values, setValues] = useState([]),
    [text, setText] = useState("");
  const [status, setStatus] = useState("ready"),
    [error, setError] = useState("");
  const lock = useRef(false),
    latest = useRef(questionKey),
    mounted = useRef(true);
  latest.current = questionKey;
  useEffect(() => {
    setValues([]);
    setText("");
    setStatus("ready");
    setError("");
    lock.current = false;
  }, [questionKey]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const busy = status === "submitting" || Boolean(conversation?.turn),
    finished = ["answered", "skipped", "superseded"].includes(status);
  useEffect(() => {
    if (!finished) return conversation?.registerWait(id, "等待你的回答");
  }, [conversation?.registerWait, id, finished]);
  useEffect(() => {
    if (conversation?.turn && !lock.current && status === "ready")
      setStatus("superseded");
  }, [conversation?.turn?.id, status]);
  const submit = async (skip) => {
    if (lock.current || busy || finished) return;
    if (!skip && !values.length && !text.trim()) {
      setError(
        mode === "input"
          ? "请填写你的要求。"
          : "请选择至少一项，或补充你的要求。",
      );
      return;
    }
    if (!skip && values.includes("custom") && !text.trim()) {
      setError("请补充具体要求。");
      return;
    }
    const answer = {
      values,
      text: text.trim(),
      labels: options
        .filter((option) => values.includes(option.value))
        .map((option) => option.label),
    };
    const key = questionKey;
    lock.current = true;
    setStatus("submitting");
    setError("");
    try {
      const outcome = skip
        ? await onSkip?.()
        : conversation
          ? await conversation.run(
              [...answer.labels, answer.text].filter(Boolean).join("；"),
              [],
              () => onAnswer(answer),
            )
          : await onAnswer(answer);
      if (outcome?.stopped || outcome?.failed) {
        if (mounted.current && latest.current === key) {
          lock.current = false;
          setStatus("ready");
          setError(
            outcome.failed
              ? "回答未能处理，请重试。"
              : "处理已停止，回答仍保留，可修改后再次提交。",
          );
        }
        return;
      }
      if (mounted.current && latest.current === key)
        setStatus(skip ? "skipped" : "answered");
    } catch (failure) {
      if (mounted.current && latest.current === key) {
        lock.current = false;
        setStatus("ready");
        setError(failure.message || "回答未提交，请重试。");
      }
    }
  };
  return (
    <section
      className="s2-task-question"
      aria-labelledby={`${id}-title`}
      data-question-mode={mode}
    >
      <header>
        <h3 id={`${id}-title`}>{title}</h3>
        <span>
          {finished
            ? status === "answered"
              ? "已回答"
              : status === "superseded"
                ? "已转入对话"
                : "暂不回答"
            : mode === "multiple"
              ? "可多选"
              : mode === "input"
                ? "请补充"
                : "单选"}
        </span>
      </header>
      {description ? <p>{description}</p> : null}
      {finished ? (
        <p className="s2-question-receipt">
          {status === "skipped"
            ? "这次先不补充，未扩大处理范围。"
            : status === "superseded"
              ? "后续以你在对话中补充的要求为准，本询问不再提交。"
              : [
                  ...options
                    .filter((option) => values.includes(option.value))
                    .map((option) => option.label),
                  text.trim(),
                ]
                  .filter(Boolean)
                  .join("；")}
        </p>
      ) : (
        <>
          {mode !== "input" ? (
            <div
              className="s2-question-options"
              role={mode === "single" ? "radiogroup" : "group"}
              aria-label={title}
              onKeyDown={(event) => {
                if (
                  mode !== "single" ||
                  busy ||
                  !["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const radios = [
                  ...event.currentTarget.querySelectorAll('[role="radio"]'),
                ];
                const index = radios.indexOf(document.activeElement),
                  direction = ["ArrowDown", "ArrowRight"].includes(event.key)
                    ? 1
                    : -1;
                const next =
                  (index + direction + radios.length) % radios.length;
                radios[next]?.focus();
                setValues([options[next].value]);
              }}
            >
              {options.map((option) =>
                mode === "multiple" ? (
                  <div key={option.value}>
                    <CustomCheckbox
                      checked={values.includes(option.value)}
                      label={option.label}
                      disabled={busy}
                      onChange={(checked) => {
                        setError("");
                        setValues((current) =>
                          checked
                            ? [...current, option.value]
                            : current.filter((value) => value !== option.value),
                        );
                      }}
                    />
                    {option.description ? (
                      <small>{option.description}</small>
                    ) : null}
                  </div>
                ) : (
                  <CustomRadio
                    key={option.value}
                    checked={values.includes(option.value)}
                    label={option.label}
                    description={option.description}
                    disabled={busy}
                    onChange={() => {
                      setError("");
                      setValues([option.value]);
                    }}
                  />
                ),
              )}
            </div>
          ) : null}
          {allowCustom || mode === "input" ? (
            <label className="s4-form-field">
              <span>{inputLabel}</span>
              <TextInput
                value={text}
                onChange={(value) => {
                  setText(value);
                  setError("");
                }}
                ariaLabel={inputLabel}
                maxLength={500}
                disabled={busy}
                placeholder="也可以用自己的话说明"
              />
            </label>
          ) : null}
          {error ? (
            <p className="s2-question-error" role="alert">
              {error}
            </p>
          ) : null}
          <footer>
            <Button tone="primary" loading={busy} onClick={() => submit(false)}>
              提交回答
            </Button>
            <Button disabled={busy} onClick={() => submit(true)}>
              暂不回答
            </Button>
          </footer>
        </>
      )}
    </section>
  );
}
