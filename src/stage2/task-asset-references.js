import { workItems } from "./data";

export function getAssetTasks({ type, id, companyId }, tasks = workItems) {
  if (!type || !id || (type === "contact" && !companyId)) return [];
  return tasks.filter((task) =>
    task.assetRefs?.some(
      (reference) =>
        reference.type === type &&
        reference.id === id &&
        (type !== "contact" || reference.companyId === companyId),
    ),
  );
}
