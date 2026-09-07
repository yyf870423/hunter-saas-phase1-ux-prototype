import { useSyncExternalStore } from "react";
import { navSections } from "./data";
import { defaultGraphTypeIds, graphTypes } from "../stage4/graph-types";

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
export const defaultVisibleGraphTypeIds = defaultGraphTypeIds;

function normalizeIds(value, field, ids, defaults) {
  if (
    value?.version !== 1 ||
    !Array.isArray(value[field]) ||
    value[field].some((id) => typeof id !== "string")
  ) {
    return [...defaults];
  }
  const visibleIds = ids.filter((id) => value[field].includes(id));
  return value[field].length && !visibleIds.length ? [...defaults] : visibleIds;
}

export const normalizeAssetNavigation = (value) =>
  normalizeIds(value, "visibleIds", assetOrder, defaultVisibleAssetIds);
export const normalizeGraphTypeNavigation = (value) =>
  normalizeIds(
    value,
    "graphTypeIds",
    graphTypes.map((type) => type.id),
    defaultVisibleGraphTypeIds,
  );

function readPreferences() {
  let value;
  try {
    if (typeof window !== "undefined")
      value = JSON.parse(localStorage.getItem(assetNavigationKey));
  } catch {
    /* Corrupt preferences fall back without hiding assets. */
  }
  return {
    visibleIds: normalizeAssetNavigation(value),
    graphTypeIds: normalizeGraphTypeNavigation(value),
  };
}

let preferences = readPreferences();
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => preferences.visibleIds;
const getGraphTypeSnapshot = () => preferences.graphTypeIds;

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== assetNavigationKey && event.key !== null) return;
    const next = readPreferences();
    if (JSON.stringify(next) !== JSON.stringify(preferences)) {
      preferences = next;
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

export function useGraphTypeNavigationPreferences() {
  return useSyncExternalStore(
    subscribe,
    getGraphTypeSnapshot,
    () => defaultVisibleGraphTypeIds,
  );
}

export function saveAssetNavigationPreferences(
  ids,
  graphTypeIds = preferences.graphTypeIds,
) {
  const value = { version: 1, visibleIds: ids, graphTypeIds };
  const next = {
    visibleIds: normalizeAssetNavigation(value),
    graphTypeIds: normalizeGraphTypeNavigation(value),
  };
  try {
    localStorage.setItem(
      assetNavigationKey,
      JSON.stringify({ version: 1, ...next }),
    );
  } catch {
    return {
      error: "导航设置保存失败，当前导航未改变。请检查浏览器存储权限后重试。",
    };
  }
  preferences = next;
  emit();
  return { error: "" };
}
