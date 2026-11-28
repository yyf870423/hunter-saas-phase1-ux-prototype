import { useEffect, useId, useRef, useState } from "react";
import { Button, StatusBadge } from "../stage1/ui";
import "./task-execution-approval.css";
import { executionApprovalCopy } from "./execution-approval-copy";
import { useTaskConversation } from "./TaskConversation";

export const executionApprovalKey = (taskId, scope) =>
  JSON.stringify([taskId, scope]);

export function TaskExecutionApproval({
  requestKey,
  action,
  title,
  scope,
  boundary = "仅执行以上操作，不对外联系，也不授权后续步骤。",
  authMode = "confirm",
  disabledReason = "",
  hasUnsentChanges = false,
  onApprove,
  onDecline,
}) {
  const conversation = useTaskConversation();
  const id = useId();
  const copy = Object.hasOwn(executionApprovalCopy, action)
    ? executionApprovalCopy[action]
    : null;
  const analysisAllowed = copy?.choice === true;
  const invalid =
    !copy ||
    !requestKey ||
    !Array.isArray(scope) ||
    !scope.length ||
    scope.some((line) => typeof line !== "string" || !line.trim()) ||
    typeof onApprove !== "function" ||
    typeof onDecline !== "function" ||
    !["confirm", "auto", "analysis", "analyze", "analyze_only"].includes(
      authMode,
    );
  const [status, setStatus] = useState("ready");
  if (conversation?.turn && status === "ready") disabledReason = "正在处理你的新要求，旧确认暂不可用。";
  if (conversation?.outputBusy && status === "ready") disabledReason = "回复正在输出，请读完本版范围后再确认。";
  if (conversation?.outputStopped && status === "ready") disabledReason = "本轮输出已停止，请先在原对话重新明确本次要求。";
  useEffect(() => {
    if (status === "ready") return conversation?.registerWait(id, "等待你的确认");
  }, [conversation?.registerWait, id, status]);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const latest = useRef(null);
  latest.current = {
    requestKey,
    action,
    authMode,
    analysisAllowed,
    disabledReason,
    hasUnsentChanges,
    invalid,
  };
  const blocked =
    (invalid ? "操作范围不完整，请先在原对话核对。" : "") ||
    disabledReason ||
    (!analysisAllowed &&
    ["analysis", "analyze", "analyze_only"].includes(authMode)
      ? "当前为仅分析，请先切换授权模式，再核对本次范围。"
      : hasUnsentChanges
        ? "输入框中有未发送的修改或附件，请先发送或清空，再核对本次范围。"
        : "");
  const act = async (decision) => {
    const current = latest.current;
    if (
      lock.current ||
      status !== "ready" ||
      current.requestKey !== requestKey ||
      current.action !== action ||
      current.invalid ||
      current.disabledReason ||
      current.hasUnsentChanges ||
      (decision === "approve" &&
        !current.analysisAllowed &&
        ["analysis", "analyze", "analyze_only"].includes(current.authMode))
    )
      return;
    lock.current = true;
    setError("");
    setStatus(decision === "approve" ? "submitting" : "declining");
    try {
      const event = {
        requestKey,
        action,
        decision,
        label: decision === "approve" ? copy.approve : copy.decline,
      };
      const execute = () => (decision === "approve" ? onApprove : onDecline)(requestKey, event);
      const result = conversation ? await conversation.run(`已点击：${event.label}`, [], execute) : await execute();
      if (result?.stopped) throw Error("处理已停止，本次确认尚未执行。请核对后重新确认。");
      if (result?.failed) throw Error(result.message || "本次操作未完成，请核对结果后重试。");
      if (latest.current.requestKey === requestKey)
        setStatus(decision === "approve" ? "submitted" : "declined");
    } catch (failure) {
      if (latest.current.requestKey === requestKey) {
        setStatus("ready");
        setError(
          failure instanceof Error
            ? failure.message
            : "确认未能提交，请核对处理状态后重试。",
        );
        lock.current = false;
      }
    }
  };
  return (
    <section
      className="s2-execution-approval"
      aria-label={analysisAllowed ? "本次业务选择" : "本次操作确认"}
      aria-busy={status === "submitting" || status === "declining"}
    >
      <header>
        <h3>{title || copy?.title || "操作范围待核对"}</h3>
        <StatusBadge
          tone={
            status === "submitted"
              ? "info"
              : status === "declined"
                ? "neutral"
                : "warning"
          }
        >
          {status === "submitted"
            ? "已提交"
            : status === "declined"
              ? "暂不执行"
              : "待确认"}
        </StatusBadge>
      </header>
      <ul>
        {(Array.isArray(scope) ? scope : []).map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
      <p>{boundary}</p>
      {blocked ? (
        <p className="s2-execution-approval-notice">{blocked}</p>
      ) : null}
      {error ? (
        <p className="s2-execution-approval-error" role="alert">
          {error}
        </p>
      ) : null}
      {status === "submitted" || status === "declined" ? (
        <p role="status">
          {status === "submitted"
            ? "已提交本次决定，请查看任务后续处理结果。"
            : "本次没有执行，已有结果保留；可以在原对话提出新的要求。"}
        </p>
      ) : (
        <footer>
          <Button
            tone="primary"
            icon="check"
            loading={status === "submitting"}
            disabled={Boolean(blocked) || status !== "ready"}
            onClick={() => act("approve")}
          >
            {copy?.approve || "暂不可执行"}
          </Button>
          <Button
            disabled={
              invalid ||
              Boolean(disabledReason) ||
              hasUnsentChanges ||
              status !== "ready"
            }
            loading={status === "declining"}
            onClick={() => act("decline")}
          >
            {copy?.decline || "暂不可执行"}
          </Button>
        </footer>
      )}
    </section>
  );
}
