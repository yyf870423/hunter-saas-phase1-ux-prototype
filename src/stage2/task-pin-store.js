import { useSyncExternalStore } from "react";

export const taskPinStorageKey = "hunter-task-pins-v1";
export function normalizeTaskPins(value) {
  if (
    value?.version !== 1 ||
    !value.overrides ||
    Array.isArray(value.overrides) ||
    typeof value.overrides !== "object"
  )
    return {};
  return Object.fromEntries(
    Object.entries(value.overrides).filter(
      ([id, pinned]) =>
        id.length > 0 && id.length <= 200 && typeof pinned === "boolean",
    ),
  );
}
function readPins() {
  try {
    return normalizeTaskPins(
      JSON.parse(localStorage.getItem(taskPinStorageKey)),
    );
  } catch {
    return {};
  }
}
let pins = readPins();
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => pins;
const emptyPins = {};
export function useTaskPins() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptyPins);
}
export function applyTaskPins(items, overrides = pins) {
  return items
    .map((item) => ({
      ...item,
      pinned: Object.hasOwn(overrides, item.id)
        ? overrides[item.id]
        : Boolean(item.pinned),
    }))
    .sort((left, right) => Number(right.pinned) - Number(left.pinned));
}
export function saveTaskPin(id, pinned) {
  if (
    typeof id !== "string" ||
    !id ||
    id.length > 200 ||
    typeof pinned !== "boolean"
  )
    return false;
  const next = { ...readPins(), [id]: pinned };
  try {
    localStorage.setItem(
      taskPinStorageKey,
      JSON.stringify({ version: 1, overrides: next }),
    );
  } catch {
    return false;
  }
  pins = next;
  listeners.forEach((listener) => listener());
  return true;
}
if (typeof window !== "undefined")
  window.addEventListener("storage", (event) => {
    if (event.key !== taskPinStorageKey && event.key !== null) return;
    pins = readPins();
    listeners.forEach((listener) => listener());
  });
