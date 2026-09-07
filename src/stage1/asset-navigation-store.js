import { useSyncExternalStore } from "react";
import { navSections } from "./data";

export const assetNavigationKey = "hunter-asset-navigation-v1";
const assetOrder = [
  "companies",
  "positions",
  "opportunities",
  "candidates",
  "mappings",
  "papers",
  "patents",
];
const catalog = navSections.slice(1).flatMap((section) => section.items);
export const assetNavigationItems = assetOrder
  .map((id) => catalog.find((item) => item.id === id))
  .filter(Boolean);
export const defaultVisibleAssetIds = assetOrder.slice(0, 5);

export function normalizeAssetNavigation(value) {
  if (
    value?.version !== 1 ||
    !Array.isArray(value.visibleIds) ||
    value.visibleIds.some((id) => typeof id !== "string")
  ) {
    return [...defaultVisibleAssetIds];
  }
  const visibleIds = assetOrder.filter((id) => value.visibleIds.includes(id));
  return value.visibleIds.length && !visibleIds.length
    ? [...defaultVisibleAssetIds]
    : visibleIds;
}

function readPreferences() {
  if (typeof window === "undefined") return [...defaultVisibleAssetIds];
  try {
    return normalizeAssetNavigation(
      JSON.parse(localStorage.getItem(assetNavigationKey)),
    );
  } catch {
    return [...defaultVisibleAssetIds];
  }
}

let visibleIds = readPreferences();
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => visibleIds;

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== assetNavigationKey && event.key !== null) return;
    const next = readPreferences();
    if (JSON.stringify(next) !== JSON.stringify(visibleIds)) {
      visibleIds = next;
      emit();
    }
  });
}

export function useAssetNavigationPreferences() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => defaultVisibleAssetIds,
  );
}

export function saveAssetNavigationPreferences(ids) {
  const next = normalizeAssetNavigation({ version: 1, visibleIds: ids });
  try {
    localStorage.setItem(
      assetNavigationKey,
      JSON.stringify({ version: 1, visibleIds: next }),
    );
  } catch {
    return {
      error: "导航设置保存失败，当前导航未改变。请检查浏览器存储权限后重试。",
    };
  }
  visibleIds = next;
  emit();
  return { error: "" };
}
