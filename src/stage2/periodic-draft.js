export const periodicDraftKey = "hunter-periodic-confirmed-drafts-v1";

export function periodicSchedule(text) {
  return text.match(/(?:每周[一二三四五六日天]|每天|每\s*[1-9]\d*\s*天|每月\s*(?:[1-9]|[12]\d|3[01])\s*日)\s*(?:[01]?\d|2[0-3]):[0-5]\d/)?.[0].replace(/\s+/g, " ") || "";
}

export function readPeriodicDrafts(storage = sessionStorage) {
  try {
    const values = JSON.parse(storage.getItem(periodicDraftKey) || "[]");
    return Array.isArray(values) ? values.filter((item) => item && typeof item.id === "string" && typeof item.prompt === "string" && typeof item.schedule === "string" && item.prompt && periodicSchedule(item.schedule) === item.schedule) : [];
  } catch { return []; }
}
