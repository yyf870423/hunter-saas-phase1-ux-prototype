// Insight handling (design 10 §6): only “处理” and “忽略”; a “已处理” marker is added automatically
// when handling produces a result. The prototype keeps markers and ignore state in sessionStorage.

export const signalHandledKey = "hunter-signal-handled";
export const signalIgnoredKey = "hunter-signal-ignored";
export const signalUndoneKey = "hunter-signal-undone";

const read = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "{}") || {};
  } catch {
    return {};
  }
};
const write = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("hunter-signal-handling"));
    return true;
  } catch {
    return false;
  }
};

export const handledToday = () => {
  const now = new Date("2026-09-03T12:00:00+08:00");
  return `${now.getMonth() + 1}/${now.getDate()}`;
};

// Five result types that count as handled (design 10 §6.2).
export const handledKinds = {
  update: "资料变动",
  start: "启动或推进",
  outbound: "对外动作",
  conclusion: "处理结论",
  recheck: "约了复查",
};

export function addHandled(signalId, item) {
  const all = read(signalHandledKey);
  const entry = { id: crypto.randomUUID(), time: handledToday(), ...item };
  all[signalId] = [entry, ...(all[signalId] || [])];
  const undone = read(signalUndoneKey);
  if (undone[signalId]) {
    delete undone[signalId];
    write(signalUndoneKey, undone);
  }
  return write(signalHandledKey, all);
}

export function undoHandled(signalId) {
  const undone = read(signalUndoneKey);
  undone[signalId] = true;
  return write(signalUndoneKey, undone);
}

export function setIgnored(signalId, ignored) {
  const all = read(signalIgnoredKey);
  all[signalId] = ignored;
  return write(signalIgnoredKey, all);
}

// Merge seed data with what happened in this browser session.
export function viewSignal(signal) {
  const handledSession = read(signalHandledKey)[signal.id] || [];
  const undone = Boolean(read(signalUndoneKey)[signal.id]);
  const ignoredOverride = read(signalIgnoredKey)[signal.id];
  const handled = undone ? [] : [...handledSession, ...(signal.handled || [])];
  const status =
    ignoredOverride === true
      ? "已忽略"
      : ignoredOverride === false
        ? "未处理"
        : signal.status;
  return {
    ...signal,
    status,
    handled,
    marker: handled[0] || null,
    isOpen: status === "未处理" && !handled.length,
  };
}

export function markerText(marker) {
  return marker ? `${marker.time} 已处理：${marker.text}` : "";
}

export function processRoute(signal) {
  const route = signal.sourceTask?.route || "/tasks";
  return `${route}${route.includes("?") ? "&" : "?"}quote=${signal.id}`;
}

// Classify how a reply handles a quoted insight. Returns the marker to add (if any) and the reply kind.
export function classifyHandling(text, signal) {
  const value = text.trim();
  const person = (signal.object || "").split(" · ")[0];
  if (/更新|改成|写入|改一下/.test(value)) {
    return { kind: "update", marker: { kind: "update", text: `更新了${person}的资料（v5）` } };
  }
  if (/客户开发|开始跟进|跟进这家|做 ?BD/.test(value)) {
    return { kind: "start", marker: { kind: "start", text: `开始客户开发：${person}` } };
  }
  if (/复查|再看看|下个月|下周|过段时间/.test(value)) {
    return { kind: "recheck", marker: { kind: "recheck", text: "约了 10 月 3 日复查" } };
  }
  if (/知道了|已知情/.test(value)) {
    return { kind: "conclusion", marker: { kind: "conclusion", text: "已知情" } };
  }
  if (/不看|不跟|聊过|已联系|不需要|先放|没兴趣|暂不/.test(value)) {
    const short = value.length > 18 ? `${value.slice(0, 18)}…` : value;
    return { kind: "conclusion", marker: { kind: "conclusion", text: `记录“${short}”` } };
  }
  return { kind: "question", marker: null };
}
