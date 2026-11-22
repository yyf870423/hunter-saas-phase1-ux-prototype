// 产品决策 2026-11-22（HB-02 学历弹性）：照搬本地版 Hunter 的“学历要求 + 学历要求程度”。
// 必须满足：候选人学历低于要求或不明，原则上不推荐并写明原因。
// 可酌情降低：只放宽一级，低一级分数 ×0.9、学历不明 ×0.8 并写明原因；低两级及以上不推荐。
export const EDUCATION_LEVELS = ["不限", "本科", "硕士", "博士"];
export const EDUCATION_MODES = ["必须满足", "可酌情降低"];
export const DEFAULT_EDUCATION_MODE = "必须满足";

export function normalizeEducation(value) {
  const text = String(value || "");
  return ["博士", "硕士", "本科"].find((level) => text.includes(level)) || "不限";
}

export function normalizeEducationMode(value) {
  return EDUCATION_MODES.includes(value) ? value : DEFAULT_EDUCATION_MODE;
}

export function educationLabel(position) {
  if (!position?.education) return "";
  const level = normalizeEducation(position.education);
  return level === "不限" ? "不限" : `${level}（${normalizeEducationMode(position.educationMode)}）`;
}
