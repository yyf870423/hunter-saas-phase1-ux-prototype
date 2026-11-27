import { useSyncExternalStore } from "react";
import { createImportDetailSamples } from "./import-task-details";

let tasks = createImportDetailSamples();
const listeners = new Set();
const subscribe = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => tasks;

export function setImportTasks(update) {
  tasks = typeof update === "function" ? update(tasks) : update;
  listeners.forEach(listener => listener());
}

export function addImportTask(task) {
  setImportTasks(current => current.some(item => item.id === task.id) ? current : [task, ...current]);
}

export function useImportTasks() {
  return [useSyncExternalStore(subscribe, snapshot, snapshot), setImportTasks];
}
