export const graphTypes = [
  { id: "talent-map", label: "人才地图", icon: "users" },
  { id: "company-relations", label: "公司关系", icon: "building" },
  { id: "candidate-relations", label: "候选人关系", icon: "user" },
  { id: "position-pool", label: "岗位人才", icon: "briefcase" },
  { id: "position-context", label: "岗位知识", icon: "paper" },
  { id: "industry-chain", label: "行业知识", icon: "database" },
  { id: "technology-talent", label: "技术与人才", icon: "sparkles" },
  { id: "talent-flow", label: "人才流动", icon: "route" },
];

export const defaultGraphTypeIds = graphTypes
  .slice(0, 3)
  .map((type) => type.id);
export const isGraphType = (id) => graphTypes.some((type) => type.id === id);
export const graphTypeLabel = (id) =>
  graphTypes.find((type) => type.id === id)?.label || "类型不可用";

export function graphListRoute({ type = "", q = "", page = 1 } = {}) {
  const params = new URLSearchParams();
  if (isGraphType(type)) params.set("type", type);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  return `/mappings${params.size ? `?${params}` : ""}`;
}

export function graphListContext(params) {
  const source = new URLSearchParams(params.get("from") ?? params);
  return {
    type: source.get("type") || "",
    q: source.get("q") || "",
    page: Math.max(1, Number.parseInt(source.get("page"), 10) || 1),
  };
}

export function graphDestinationRoute(path, context) {
  const query = graphListRoute(context).split("?")[1];
  return query ? `${path}?${new URLSearchParams({ from: query })}` : path;
}
