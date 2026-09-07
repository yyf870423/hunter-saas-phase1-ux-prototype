import { singleAssetDecision } from "./single-asset-confirmation.js";

const labels = { 下次跟进事项: "subject", 跟进事项: "subject", 下次跟进时间: "dueAt", 跟进时间: "dueAt", 实际跟进时间: "occurredAt", 跟进内容: "content", 完成当前事项: "complete" };
export const activeTaskPlan = (state, task) => state.followups.find((plan) => plan.opportunityId === task.opportunityId && ["pending", "due"].includes(plan.status));

export function followupDate(value) {
  const match = String(value || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
  if (!match) return "";
  const [, year, month, day, hour, minute] = match.map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date.getHours() === hour && date.getMinutes() === minute ? date.toISOString() : "";
}

export function missingFollowupField(draft) {
  if (draft.action === "cancel") return "";
  if (draft.action === "schedule") return !draft.subject ? "subject" : !draft.dueAt ? "dueAt" : "";
  return !draft.content ? "content" : !draft.occurredAt ? "occurredAt" : "";
}

export function nextFollowupDraft(task, state, text) {
  const previous = task.followupDraft;
  const pending = previous && ["collect", "review", "declined"].includes(previous.stage);
  const decision = singleAssetDecision(text);
  const trimmed = text.trim();
  const action = /^(取消安排|取消下次跟进)/.test(trimmed) ? "cancel" : /^(记录(?:本次)?跟进|完成(?:本次|当前)跟进)/.test(trimmed) ? "record" : /^(安排(?:下次)?跟进|修改下次跟进|改期)/.test(trimmed) ? "schedule" : "";
  const fields = {};
  for (const line of trimmed.split(/\r?\n/)) {
    const match = line.match(/^\s*([^：:]+)[：:]\s*(.*)$/);
    if (match && labels[match[1]]) fields[labels[match[1]]] = match[2].trim();
  }
  if (!pending && !action && !Object.keys(fields).length && (decision === "suggest" || previous?.stage === "applied")) return null;
  const plan = activeTaskPlan(state, task);
  const opportunity = state.opportunities.find((item) => item.id === task.opportunityId);
  const newAction = action || (fields.content || fields.occurredAt ? "record" : "schedule");
  let draft = pending && (!action || action === previous.action) ? { ...previous } : {
    id: "followup-draft-" + crypto.randomUUID(), stage: "collect", action: newAction,
    opportunityVersion: opportunity?.version, planId: plan?.id || "", planVersion: plan?.version,
    subject: newAction === "schedule" ? plan?.subject || "" : "", dueAt: newAction === "schedule" ? plan?.dueAt || "" : "",
    content: "", occurredAt: "", complete: false, fileIds: [],
  };
  draft.feedback = "";
  if (decision === "decline") return { ...draft, stage: "declined", feedback: "本次操作暂不执行，已有安排和记录未改变。" };
  if (trimmed === "重新核对") draft = { ...draft, id: "followup-draft-" + crypto.randomUUID(), opportunityVersion: opportunity?.version, planId: plan?.id || "", planVersion: plan?.version };
  const missing = missingFollowupField(draft);
  if (!action && !Object.keys(fields).length && decision === "suggest" && trimmed !== "重新核对") {
    if (["subject", "content"].includes(missing)) fields[missing] = trimmed;
    else if (["dueAt", "occurredAt"].includes(missing)) fields[missing] = trimmed;
    else draft.feedback = "尚未修改。请明确建议对应的跟进事项、时间或内容，再核对摘要。";
  }
  for (const [key, value] of Object.entries(fields)) {
    if (["dueAt", "occurredAt"].includes(key)) {
      const date = followupDate(value);
      draft[key] = date;
      if (!date) draft.feedback = "时间无法识别，请提供有效的 YYYY-MM-DD HH:mm，尚未执行。";
    } else if (key === "complete") {
      if (["confirm", "decline"].includes(singleAssetDecision(value))) draft.complete = singleAssetDecision(value) === "confirm";
      else draft.feedback = "请明确是否完成当前事项，尚未执行。";
    } else draft[key] = value;
  }
  draft.stage = missingFollowupField(draft) || draft.feedback ? "collect" : "review";
  return draft;
}
