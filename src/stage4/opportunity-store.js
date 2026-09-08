import { useSyncExternalStore } from "react";
import { candidates } from "./data.js";
import { sourcingCandidates } from "../stage2/recruiting-review-data.js";
import { getCompanyContactSnapshot } from "./company-contact-store.js";
import { applyOpportunityCommand, OpportunityError, opportunityNow } from "./opportunity-domain.js";
import { createOpportunitySeed } from "./opportunity-seed.js";

const key = "hunter-opportunity-lifecycle-v1";
const listeners = new Set();
let state = createOpportunitySeed();
let loadError = "";
let permissionLimited = false;
let failureOnce = "";
let failureOperation = "write";
let notificationError = "";
const matchingTimers = new Map();
const valid = (value) => value?.schemaVersion === 1 &&
  ["opportunities", "positions", "tasks", "followups", "notifications", "imports", "files", "tombstones"].every((field) => Array.isArray(value[field])) &&
  value.commands && typeof value.commands === "object" && Number.isInteger(value.revision);
try {
  const raw = localStorage.getItem(key);
  if (raw) {
    const saved = JSON.parse(raw);
    if (!valid(saved)) throw new Error("资料格式不正确");
    state = saved;
  }
} catch {
  loadError = "本地机会资料无法读取，已进入只读状态。请恢复浏览器备份或明确重置演示资料。";
}
const emit = () => listeners.forEach((listener) => listener());
function commit(next) {
  if (loadError) throw new OpportunityError(loadError, "STORAGE");
  try { localStorage.setItem(key, JSON.stringify(next)); }
  catch { throw new OpportunityError("本地保存失败，资料未改变。请检查存储空间后重试。", "STORAGE"); }
  state = next;
  emit();
  scheduleMatching();
}
export const getOpportunitySnapshot = () => state;
export const getOpportunityStoreError = () => loadError;
export const getOpportunityNotificationError = () => notificationError;
export const getOpportunityPermission = () => permissionLimited || Boolean(loadError);
export const getOpportunityContext = () => ({ ...getCompanyContactSnapshot(), candidates, sourcingCandidates, limited: permissionLimited });
export function useOpportunityState() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => state);
}
export function runOpportunityCommand(type, data = {}, options = {}) {
  if (loadError) throw new OpportunityError(loadError, "STORAGE");
  if (failureOnce && ((failureOperation === type && (type !== "position.match" || data.phase !== "start")) || (failureOperation === "write" && !["clock.set", "notification.read", "notifications.tick"].includes(type)))) {
    const message = failureOnce;
    failureOnce = "";
    throw new OpportunityError(message, "SIMULATED_FAILURE");
  }
  const output = applyOpportunityCommand(state, { ...options, type, data }, getOpportunityContext());
  if (type === "notifications.tick") notificationError = "";
  if (output.state !== state) commit(output.state);
  return output.result;
}
export function configureOpportunityDemo({ limited, failure, operation = "write" } = {}) {
  if (limited !== undefined) permissionLimited = Boolean(limited);
  if (failure !== undefined) { failureOnce = failure; failureOperation = operation; }
  state = { ...state };
  emit();
  scheduleMatching();
}
export function resetOpportunityDemo(confirmed) {
  if (confirmed !== true) throw new OpportunityError("请先确认重置演示资料。");
  const next = createOpportunitySeed();
  try { localStorage.setItem(key, JSON.stringify(next)); }
  catch { throw new OpportunityError("演示资料重置失败。", "STORAGE"); }
  loadError = "";
  permissionLimited = false;
  failureOnce = "";
  notificationError = "";
  state = next;
  emit();
}
export function saveOpportunityFile(file) {
  if (permissionLimited) throw new OpportunityError("当前没有修改权限。", "PERMISSION");
  const next = { ...state, files: [...state.files.filter((entry) => entry.id !== file.id), file], revision: state.revision + 1 };
  commit(next);
  return file;
}
function tick() {
  if (loadError || permissionLimited) return;
  const now = new Date(opportunityNow(state)).getTime();
  const due = state.followups.some((plan) => ["pending", "due"].includes(plan.status) &&
    new Date(plan.dueAt).getTime() <= now && plan.notifiedVersion !== plan.version &&
    (plan.ownerTaskId ? state.tasks.some((task) => task.id === plan.ownerTaskId && !task.deletedAt) :
      state.opportunities.some((opportunity) => opportunity.id === plan.opportunityId && !opportunity.deletedAt && opportunity.status === "跟进中")));
  if (due) {
    try { runOpportunityCommand("notifications.tick"); }
    catch (error) { notificationError = error.message; state = { ...state }; emit(); }
  }
}
// Simulated asset processing continues independently of the currently open route.
function scheduleMatching() {
  if (loadError || permissionLimited) return;
  for (const position of state.positions.filter((item) => !item.deletedAt)) {
    const process = position.processing?.find((item) => item.type === "matching" && item.status === "running");
    if (!process || matchingTimers.has(process.id)) continue;
    matchingTimers.set(process.id, setTimeout(() => {
      if (loadError || permissionLimited) { matchingTimers.delete(process.id); return; }
      try {
        const words = position.skills.map((word) => word.toLowerCase());
        const candidateIds = candidates.filter((candidate) => words.some((word) => candidate.skills.some((skill) => skill.toLowerCase().includes(word) || word.includes(skill.toLowerCase())))).map((candidate) => candidate.id);
        runOpportunityCommand("position.match", { id: position.id, phase: "complete", candidateIds });
      } catch (error) {
        try { runOpportunityCommand("position.match", { id: position.id, phase: "complete", failed: true, error: error.message }); }
        catch { /* The pending result stays recoverable after storage or permission recovery. */ }
      } finally { matchingTimers.delete(process.id); }
    }, 700));
  }
}
window.addEventListener("storage", (event) => {
  if (event.key !== key) return;
  try {
    const saved = event.newValue ? JSON.parse(event.newValue) : createOpportunitySeed();
    if (!valid(saved)) throw new Error();
    state = saved; loadError = ""; emit(); tick(); scheduleMatching();
  } catch { loadError = "其他页面写入的机会资料无法读取，请检查本地存储。"; state = { ...state }; emit(); }
});
window.addEventListener("focus", tick);
setInterval(tick, 15000);
queueMicrotask(tick);
queueMicrotask(scheduleMatching);

export function summarizePosition(position) {
  const counts = position.managed ? {
    matches: position.matches.length,
    reserve: position.pipeline.filter((entry) => entry.stage === "reserve").length,
    progress: position.pipeline.filter((entry) => ["recommended", "interview-1", "interview-2", "offer"].includes(entry.stage)).length,
    hired: position.pipeline.filter((entry) => entry.stage === "joined").length,
    failed: position.pipeline.filter((entry) => ["withdrawn", "rejected", "unsuitable"].includes(entry.stage)).length,
  } : position.legacyCounts;
  return { ...position, ...counts };
}

export function mergeLifecycleTasks(items, snapshot = state) {
  const dynamic = snapshot.tasks.filter((task) => !task.deletedAt).map((task) => ({ ...task,
    type: task.kind === "recruiting" ? "岗位招聘" : task.kind === "position-create" ? "岗位创建" : "客户开发",
    scenario: task.kind === "recruiting" ? "岗位招聘" : task.kind === "position-create" ? "岗位创建" : "客户开发",
    object: snapshot.opportunities.find((item) => item.id === task.opportunityId)?.title || snapshot.positions.find((item) => item.id === task.positionId)?.name || "需求资料",
    summary: task.prompt, time: new Date(task.updatedAt).toLocaleString("zh-CN"), tone: task.phase === "result" ? "success" : "warning",
  }));
  return [...dynamic.reverse(), ...items.filter((item) => !snapshot.tasks.some((task) => task.id === item.id))];
}

export function getOpportunityActions(snapshot = state) {
  const now = new Date(opportunityNow(snapshot)).getTime();
  return snapshot.followups.filter((plan) => ["pending", "due"].includes(plan.status) && new Date(plan.dueAt).getTime() <= now).flatMap((plan) => {
    const opportunity = snapshot.opportunities.find((item) => item.id === plan.opportunityId);
    if (plan.ownerTaskId ? !snapshot.tasks.some((task) => task.id === plan.ownerTaskId && !task.deletedAt) :
      !opportunity || opportunity.deletedAt || opportunity.status !== "跟进中") return [];
    return [{ id: plan.id, title: plan.subject, source: opportunity?.title || plan.opportunityTitle || "来源机会不可用", meta: "招聘机会待跟进", tone: "warning",
      route: plan.ownerTaskId ? "/tasks/" + plan.ownerTaskId + "?followup=" + plan.id : "/opportunities/" + opportunity.id + "?tab=profile&followup=" + plan.id }];
  });
}
