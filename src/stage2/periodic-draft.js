export const periodicDraftKey = "hunter-periodic-confirmed-drafts-v1";
export const periodicOverridesKey = "hunter-periodic-config-overrides-v1";
export const periodicRunsKey = "hunter-periodic-runs-v1";

const cadence = /^(?:每\s*[1-9]\d*\s*天|每两周周[一二三四五六日天]|每周[一二三四五六日天]?|每天|每月\s*(?:[1-9]|[12]\d|3[01])\s*日)\s*(?:(?:[01]?\d|2[0-3]):[0-5]\d)?\s*[，,：:]?\s*/;

export function periodicGoal(text) {
  const trimmed = text.trim();
  return trimmed.replace(cadence, "") || trimmed;
}

export function periodicSchedule(text) {
  return text.match(/(?:每两周周[一二三四五六日天]|每周[一二三四五六日天]|每天|每\s*[1-9]\d*\s*天|每月\s*(?:[1-9]|[12]\d|3[01])\s*日)\s*(?:[01]?\d|2[0-3]):[0-5]\d/)?.[0].replace(/\s+/g, " ") || "";
}

export function readPeriodicOverrides(storage = sessionStorage) {
  try {
    const value = JSON.parse(storage.getItem(periodicOverridesKey) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export function readPeriodicRuns(fallback, storage = sessionStorage) {
  try {
    const values = JSON.parse(storage.getItem(periodicRunsKey) || "null");
    return Array.isArray(values) && values.every((item) => item && typeof item.id === "string" && typeof item.taskId === "string" && typeof item.status === "string") ? values : fallback;
  } catch { return fallback; }
}

export function readPeriodicDrafts(storage = sessionStorage) {
  try {
    const values = JSON.parse(storage.getItem(periodicDraftKey) || "[]");
    return Array.isArray(values) ? values.filter((item) => item && typeof item.id === "string" && typeof item.prompt === "string" && typeof item.schedule === "string" && item.prompt && periodicSchedule(item.schedule) === item.schedule) : [];
  } catch { return []; }
}
