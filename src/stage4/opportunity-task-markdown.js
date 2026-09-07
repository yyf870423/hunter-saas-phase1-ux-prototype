import { createMarkdownTable } from "../stage2/automation-ui";
import { displayDateTime } from "./OpportunityComponents";

export const markdownText = (value) => String(value ?? "待确认").replace(/[\\`*_{}\[\]()#+.!>~-]/g, "\\$&");

export function draftSummaryMarkdown(task, state) {
  const draft = task.draft || {};
  const patch = draft.patch || {};
  const position = task.kind === "position-create";
  const company = (state.companies || []).find((item) => item.id === patch.companyId);
  const previous = position ? state.positions.find((item) => item.id === draft.positionId) : state.opportunities.find((item) => item.id === draft.opportunityId);
  const fields = position ? [["岗位名称", "name"], ["工作地点", "location"], ["薪资范围", "salary"], ["学历要求", "education"],
    ["工作年限", "experience"], ["岗位描述", "jd"], ["备注", "note"]] : [["机会名称", "title"], ["招聘需求摘要", "summary"],
    ["发现依据", "evidence"], ["预计人数", "people"], ["预计时间", "period"], ["已确认要求", "requirements"], ["待确认事项", "missing"]];
  const required = position ? ["name", "jd"] : ["title", "summary", "evidence"];
  const rows = [["所属公司", company?.name || patch.company || "待确认"],
    ...fields.filter(([, key]) => patch[key] || required.includes(key)).map(([label, key]) => [label, patch[key] || "未提供"])];
  const changes = previous ? fields.filter(([, key]) => (previous[key] || "") !== (patch[key] || "")).map(([label, key]) =>
    "- **" + label + "**：" + markdownText(previous[key] || "未提供") + " → " + markdownText(patch[key] || "未提供")) : [];
  return ["## " + (task.phase === "cancelled" ? "草稿已保留，未写入正式资料" : position ? "待确认的岗位" : "待确认的招聘机会"),
    ...rows.filter(([, value]) => value).map(([label, value]) => "**" + label + "**\n\n" + markdownText(value)),
    ...(draft.directions || []).map((item) => "### 招聘方向：" + markdownText(item.name) + "\n\n" +
      [["要求", item.requirement], ["待确认", item.missing], ["JD", item.jd]].filter(([, value]) => value).map(([label, value]) => "**" + label + "**\n\n" + markdownText(value)).join("\n\n")),
    changes.length ? "### 拟应用的修改\n\n" + changes.join("\n") : "",
    ...(draft.warnings || []).map((warning) => "> " + markdownText(warning)),
    task.authMode === "analyze" ? "> 当前仅分析，尚未获得正式写入授权。" : "",
    state.limited ? "> 当前权限受限，不能写入或修改资料。草稿已保留。" : "",
    draft.feedback ? "> " + markdownText(draft.feedback) : "",
    "**" + (previous ? "是否应用以上修改？" : "是否将这份" + (position ? "岗位" : "招聘机会") + "入库？") + "**\n\n请回复“是”“否”，或提出修改建议。",
  ].filter(Boolean).join("\n\n");
}

export function writeResultMarkdown(result, state) {
  const isOpportunity = result.type === "opportunity";
  const target = (isOpportunity ? state.opportunities : state.positions).find((item) => item.id === result.id);
  const title = isOpportunity ? "招聘机会" : "岗位";
  return ["## 已写入" + title,
    createMarkdownTable(["内容", "结果"], [["正式结果", target?.title || target?.name || result.title],
      ["写入版本", "v" + (result.version || 1)], ["写入时间", displayDateTime(result.at)],
      ["状态", target?.deletedAt ? "已删除" : target?.status || "不可用"]].map((row) => row.map(markdownText))),
    target && !target.deletedAt ? "[查看" + (isOpportunity ? "招聘机会" : "岗位详情") + "](#/" + (isOpportunity ? "opportunities" : "positions") + "/" + encodeURIComponent(result.id) + ")" : "",
  ].filter(Boolean).join("\n\n");
}
