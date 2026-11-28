import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { Button } from "../stage1/ui";
import { CustomCheckbox, CustomRadio, TextInput } from "../stage4/asset-ui";
import "./task-conversation.css";
import { TaskFeedback, useTaskFeedback } from "./TaskFeedback";
import { taskOperationLabels } from "./task-operations";
import {
  TASK_DEMO_STAGE_MS,
  TASK_DEMO_TURN_MS,
  taskElapsedMs,
} from "./task-timing";

const ConversationContext = createContext(null);
export const useTaskConversation = () => useContext(ConversationContext);

export function formatTaskDuration(milliseconds) {
  const seconds = Math.max(1, Math.round(milliseconds / 1000));
  return seconds < 60
    ? `${seconds} 秒`
    : `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;
}

export function TaskConversationProvider({ children, onOutputBusyChange, resumeHistory = false }) {
  const location = useLocation();
  const feedback = useTaskFeedback();
  const [work, setWork] = useState(null);
  const [turn, setTurn] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [result, setResult] = useState({ generation: 0, elapsed: null });
  const [initialElapsed, setInitialElapsed] = useState(null);
  const [replies, setReplies] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [outputCancel, setOutputCancel] = useState(0);
  const [outputStopped, setOutputStopped] = useState(false);
  const outputBusy = outputs.length > 0;
  const queueOutput = useCallback((item) => {
    setOutputs((current) => [...current.filter((entry) => entry.id !== item.id), item]);
  }, []);
  const removeOutput = useCallback((id, key) => {
    setOutputs((current) => current.filter((item) => item.id !== id || item.key !== key));
  }, []);
  const finishOutput = removeOutput;
  const stopOutput = useCallback(() => {
    setOutputs([]);
    setOutputCancel((value) => value + 1);
    setOutputStopped(true);
  }, []);
  useEffect(() => {
    onOutputBusyChange?.(outputBusy, { stopped: outputStopped });
  }, [outputBusy, outputStopped, onOutputBusyChange]);
  useEffect(() => () => onOutputBusyChange?.(false, { unmounted: true }), [onOutputBusyChange]);
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
    } else if (work && !outputBusy && automaticStarted.current !== null) {
      setInitialElapsed(taskElapsedMs(automaticStarted.current));
      automaticStarted.current = null;
    }
  }, [work?.status, waiting.length, Boolean(turn), outputBusy]);
  const resultRef = useRef(result);
  resultRef.current = result;
  useEffect(() => {
    if (!outputBusy) return;
    const tick = () => {
      if (resultRef.current.started) setResult((current) => ({ ...current, elapsed: taskElapsedMs(current.started) }));
      else if (automaticStarted.current !== null && work?.status !== "running") setInitialElapsed(taskElapsedMs(automaticStarted.current));
    };
    tick();
    const timer = setInterval(tick, 150);
    return () => { clearInterval(timer); tick(); };
  }, [outputBusy, work?.status]);
  const previousStatus = useRef(null);
  useEffect(() => {
    if (work?.status === "running" && previousStatus.current !== "running") setOutputStopped(false);
    previousStatus.current = work?.status;
  }, [work?.status]);
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
    if (active.current || outputBusy) return false;
    feedback?.clear();
    setOutputStopped(false);
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
              started: job.started,
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
        outputs,
        outputBusy,
        outputCancel,
        outputStopped,
        queueOutput,
        removeOutput,
        finishOutput,
        stopOutput,
        resumeHistory,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useTaskPresentationGate(key) {
  const conversation = useTaskConversation();
  const [gate, setGate] = useState({ key, visible: false, cancelled: false });
  const visible = gate.key === key && gate.visible;
  const cancelled = gate.key === key && gate.cancelled;
  const busy = Boolean(conversation?.outputBusy);
  const stopped = Boolean(conversation?.outputStopped);
  useLayoutEffect(() => {
    if (gate.key !== key) setGate({ key, visible: false, cancelled: stopped });
    else if (stopped && !visible && !cancelled) setGate({ key, visible: false, cancelled: true });
  }, [key, stopped, visible, cancelled, gate.key]);
  useEffect(() => {
    if (!conversation || visible || cancelled || busy || stopped) return;
    // Let sibling replies register their output before exposing a new card.
    const timer = setTimeout(() => setGate({ key, visible: true, cancelled: false }), 0);
    return () => clearTimeout(timer);
  }, [key, visible, cancelled, busy, stopped, Boolean(conversation)]);
  return !conversation || visible;
}

export function TaskPresentationGate({ gateKey, children }) {
  return useTaskPresentationGate(gateKey) ? children : null;
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
  const operationLabels = taskOperationLabels(conversation?.location.pathname || "", running?.id);
  const operationKey = `${conversation?.location.pathname}:${running?.id || running?.title || ""}`;
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
                ? operationLabels[0]
                : "本轮处理已完成，可以继续提出要求";
  const status =
    state ||
    (paused ? "paused" : waiting ? "waiting" : running ? "running" : "done");
  useEffect(() => {
    conversation?.setWork({ label: message || label, status, operationLabels: message ? null : operationLabels, operationKey });
    return () => conversation?.setWork(null);
  }, [conversation?.setWork, label, status, message, operationLabels, operationKey]);
  return null;
}

export function TaskWorkStatus({ label, running = false, operationLabels, operationKey }) {
  const [progress, setProgress] = useState(null);
  const stage = progress && progress.key === operationKey ? progress.stage : 0;
  useEffect(() => {
    if (!running || !operationLabels || operationLabels.length < 2) return;
    setProgress({ key: operationKey, stage: 0 });
    const timer = setTimeout(() => setProgress({ key: operationKey, stage: 1 }), TASK_DEMO_STAGE_MS);
    return () => clearTimeout(timer);
  }, [running, operationLabels, operationKey]);
  return (
    <p className={`s2-agent-work ${running ? "is-working" : ""}`} role="status">
      {running ? (
        <LoaderCircle size={14} aria-hidden="true" />
      ) : (
        <span className="s2-agent-work-dot" aria-hidden="true" />
      )}
      <span>{running && operationLabels ? operationLabels[stage] : label}</span>
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
  ref: externalRef,
  ...props
}) {
  const conversation = useTaskConversation();
  const { turn, receipt, work, waiting = [] } = conversation || {};
  const bottom = useRef(null);
  const timeline = useRef(null);
  const attachTimeline = useCallback((node) => {
    timeline.current = node;
    if (typeof externalRef === "function") externalRef(node);
    else if (externalRef) externalRef.current = node;
  }, [externalRef]);
  useEffect(() => {
    if (!turn) return;
    const scroller = bottom.current?.closest(
      ".s2-conversation, .s2-task-timeline, .s2-run-timeline, .s2-new-work-conversation",
    );
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [turn?.id]);
  useEffect(() => {
    const scroller = timeline.current?.closest(".s2-conversation, .s2-task-timeline, .s2-run-timeline, .s2-new-work-conversation");
    if (!scroller) return;
    let follow = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 100;
    const scroll = () => { follow = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 100; };
    scroller.addEventListener("scroll", scroll, { passive: true });
    let frame;
    const observer = new MutationObserver(() => {
      if (!follow || frame) return;
      frame = requestAnimationFrame(() => { frame = null; if (follow) scroller.scrollTop = scroller.scrollHeight; });
    });
    observer.observe(timeline.current, { subtree: true, childList: true, characterData: true });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); scroller.removeEventListener("scroll", scroll); };
  }, []);
  return (
    <div className={className} {...props} ref={attachTimeline} data-output-busy={conversation?.outputBusy ? "true" : "false"}>
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
      {conversation?.outputStopped ? <p className="s2-turn-receipt" role="status">已停止生成，已显示的内容保留。可以继续补充要求。</p> : null}
      {conversation?.outputBusy ? null : turn ? (
        <TaskWorkStatus
          running
          label={taskOperationLabels(conversation.location.pathname)[turn.stage]}
        />
      ) : waiting.length &&
        !["paused", "stopped", "error"].includes(work?.status) ? (
        <TaskWorkStatus label={waiting.at(-1).label} />
      ) : work ? (
        <TaskWorkStatus
          running={work.status === "running"}
          label={work.label}
          operationLabels={work.operationLabels}
          operationKey={work.operationKey}
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
  const presentationReady = useTaskPresentationGate(questionKey);
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
  const busy = status === "submitting" || Boolean(conversation?.turn) || Boolean(conversation?.outputBusy || conversation?.outputStopped),
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
  if (!presentationReady) return null;
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
