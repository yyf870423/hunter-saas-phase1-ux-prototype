// Current scope only: retain the deferred modules/data without exposing their entry points.
export const assetRelatedTasksVisible = false;
export function isAssetDetailTabVisible(id, historyIsActivity = false) {
  return !["work", "tasks", "records"].includes(id) && (id !== "history" || historyIsActivity);
}
