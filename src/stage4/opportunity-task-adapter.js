import { getCompanyContactSnapshot } from "./company-contact-store";
import { extractOpportunityText } from "./opportunity-file-parser";
import { getOpportunitySnapshot, runOpportunityCommand } from "./opportunity-store";
import { checkFields, DIRECTION_FIELDS } from "./opportunity-domain";
import { storeOpportunityAttachment } from "./OpportunityFiles";
import { draftFailureText, singleAssetDecision } from "./single-asset-confirmation";

const fieldLabels = {
  机会名称: "title", 招聘机会: "title", 招聘需求摘要: "summary", 需求摘要: "summary",
  发现依据: "evidence", 需求依据: "evidence", 已确认依据: "evidence", 已确认存在需求的依据: "evidence",
  预计人数: "people", 预计时间: "period", 已确认要求: "requirements", 待确认事项: "missing",
  公司: "company", 所属公司: "company", 招聘公司: "company", 岗位名称: "name",
  工作地点: "location", 薪资范围: "salary", 学历要求: "education", 工作年限: "experience",
  岗位描述: "jd", 岗位职责: "jd", 备注: "note",
  "招聘方向 JSON": "directionsJson",
};
export const taskAuthorization = (mode) => mode === "analysis" ? "analyze" : mode || "confirm";

// The prototype only extracts explicit labels; unstructured facts remain source material for review.
export function explicitInputFields(text) {
  const fields = {};
  const lines = String(text || "").split(/\r?\n/);
  let field = "";
  for (const line of lines) {
    if (/^(岗位职责|任职要求)$/.test(line.trim())) {
      field = "jd";
      fields.jd = [fields.jd, line.trim()].filter(Boolean).join("\n");
      continue;
    }
    const match = line.match(/^\s*(?:请)?([^：:]{2,18}?)(?:[：:]|(?:改为|修改为|调整为))\s*(.*)$/);
    if (match && fieldLabels[match[1].trim()]) {
      field = fieldLabels[match[1].trim()];
      fields[field] = match[2];
    } else if (field && line.trim()) fields[field] += "\n" + line;
  }
  return fields;
}

export function prepareOpportunityDraft(task) {
  const state = getOpportunitySnapshot();
  const context = getCompanyContactSnapshot();
  const materialMessages = task.messages.filter((item) => item.role === "user" && item.sourceKind !== "decision");
  const sourceText = [task.source?.material || "", ...materialMessages.map((item) => item.content)].filter(Boolean).join("\n\n");
  const currentId = task.draft?.opportunityId || task.opportunityId;
  const current = currentId ? state.opportunities.find((item) => item.id === currentId && !item.deletedAt) : null;
  const input = current ? explicitInputFields(materialMessages.at(-1)?.content) :
    Object.assign({}, explicitInputFields(task.source?.material), ...materialMessages.map((item) => explicitInputFields(item.content)));
  const last = materialMessages.at(-1);
  const warnings = [...(task.source?.warnings || [])];
  let directions = [];
  let invalidDirections = false;
  if (input.directionsJson) {
    try { directions = JSON.parse(input.directionsJson); if (!Array.isArray(directions)) throw new Error(); directions.forEach((item) => checkFields(item, DIRECTION_FIELDS)); }
    catch { directions = []; invalidDirections = true; warnings.push("招聘方向结构无法读取，尚不能入库，请补充有效的招聘方向 JSON。"); }
  }
  if (current) directions = directions.filter((draft) => {
    const existing = current.directions.find((item) => !item.archived && item.name.trim() === draft.name.trim());
    if (!existing) return true;
    if (Object.entries(draft).some(([key, value]) => JSON.stringify(existing[key] || "") !== JSON.stringify(value || "")))
      warnings.push("方向“" + draft.name + "”已有记录，请在机会招聘方向中核对修改；原始补充保留在来源中。");
    return false;
  });
  const company = context.companies.find((item) => !context.deletedCompanies.includes(item.id) &&
    (input.company ? item.name === input.company.trim() : sourceText.includes(item.name)));
  const previous = task.draft?.patch || current || {};
  const patch = {
    title: input.title ?? previous.title ?? (company ? company.name + "招聘需求" : ""),
    companyId: input.company !== undefined ? company?.id || "" : previous.companyId || company?.id || "", contactId: (current?.companyId === company?.id ? current?.contactId : "") ||
      context.contacts.find((item) => item.id === (last?.contactId || task.source?.contactId) && item.companyId === company?.id && !item.deletedAt)?.id || "",
    summary: input.summary ?? previous.summary ?? "", evidence: input.evidence ?? previous.evidence ?? "",
    priority: previous.priority || "普通", people: input.people ?? previous.people ?? "",
    period: input.period ?? previous.period ?? "", requirements: input.requirements ?? previous.requirements ?? "",
    missing: input.missing ?? previous.missing ?? "",
  };
  const fileId = last?.fileIds?.[0] || task.messages[0]?.fileIds?.[0] || "";
  const link = sourceText.match(/https?:\/\/[^\s<>"]+/)?.[0] || "";
  return { patch, opportunityId: current?.id || "", expectedVersion: current?.version,
    source: { id: "source-" + task.id + "-" + (last?.id || task.version), kind: fileId ? "file" : link ? "link" : last?.sourceKind === "reply" || task.source?.kind === "reply" ? "reply" : "task",
      label: fileId ? "任务附件与用户补充" : link ? "链接与用户补充" : last?.sourceKind === "reply" ? "客户回复与已有发现依据" : "任务发现依据与用户补充", fileId, url: link, taskId: task.id, content: sourceText },
    warnings, directions, invalidDirections };
}

export function prepareLegacyOpportunityDiscovery(scenario, evidence, authMode) {
  if (getOpportunitySnapshot().tasks.some((item) => item.id === scenario.id)) return;
  runOpportunityCommand("task.create", { id: scenario.id, legacyWorkspace: true, kind: "opportunity", title: scenario.title,
    prompt: scenario.prompt, authMode: taskAuthorization(authMode), allowedResults: ["opportunity"],
    source: { kind: "task", material: "公司：星澜机器人\n机会名称：星澜机器人团队扩张潜在招聘机会\n招聘需求摘要：公开招聘变化显示机器人算法与平台研发方向可能有新增需求，值得进一步核实。\n发现依据：" +
      evidence.map((row) => row.source + "：" + row.finding).join("；") +
      "\n待确认事项：实际 HC、优先方向、预算、猎头合作意愿、完整 JD 和可联系的负责人均待确认。", warnings: [] } });
}

export async function saveLegacyOpportunityReply(scenario, text, files, authMode, isReply = true) {
  const handled = !files.length && respondToSingleAssetDraft(scenario.id, text);
  if (handled) return handled;
  const collected = await collectTaskAttachments(files);
  let task = getOpportunitySnapshot().tasks.find((item) => item.id === scenario.id);
  if (!task) {
    runOpportunityCommand("task.create", { id: scenario.id, legacyWorkspace: true, kind: "opportunity", title: scenario.title,
      prompt: scenario.prompt, authMode: taskAuthorization(authMode), source: { kind: "reply", contactId: scenario.replyContactId || "", material: "", warnings: [] }, allowedResults: ["opportunity"] });
  }
  runOpportunityCommand("task.update", { id: scenario.id, patch: { phase: "input", status: "运行中", authMode: taskAuthorization(authMode), ...(task?.phase === "result" ? { draft: null } : {}) },
    message: { role: "user", content: [text, collected.material, ...collected.warnings].filter(Boolean).join("\n\n"), fileIds: collected.fileIds,
      sourceKind: isReply ? "reply" : "task", contactId: isReply ? scenario.replyContactId || "" : "" } });
}

export function preparePositionDraft(task) {
  const state = getOpportunitySnapshot();
  const current = state.positions.find((item) => item.id === task.positionId && !item.deletedAt);
  const materialMessages = task.messages.filter((item) => item.role === "user" && item.sourceKind !== "decision");
  const sourceText = [task.source?.material || "", ...materialMessages.map((item) => item.content)].filter(Boolean).join("\n\n");
  const fields = current ? explicitInputFields(materialMessages.at(-1)?.content) :
    Object.assign({}, explicitInputFields(task.source?.material), ...materialMessages.map((item) => explicitInputFields(item.content)));
  const previous = task.draft?.patch || task.draft || current || {};
  const patch = { name: fields.name ?? previous.name ?? "", companyId: previous.companyId || "", company: fields.company ?? previous.company ?? "",
    location: fields.location ?? previous.location ?? "", salary: fields.salary ?? previous.salary ?? "", experience: fields.experience ?? previous.experience ?? "",
    education: fields.education ?? previous.education ?? "", skills: previous.skills || [], jd: fields.jd ?? previous.jd ?? "", note: fields.note ?? previous.note ?? "" };
  const latest = materialMessages.at(-1)?.content || "";
  if (fields.jd === undefined && /岗位职责|任职要求/.test(latest) && latest !== task.prompt) patch.jd = latest;
  if (fields.jd === undefined && !patch.jd) {
    const start = sourceText.indexOf("岗位职责");
    if (start >= 0) patch.jd = sourceText.slice(start);
  }
  const context = getCompanyContactSnapshot();
  if (!patch.companyId || (fields.company !== undefined && !task.opportunityId)) patch.companyId = context.companies.find((item) => item.name === patch.company)?.id || "";
  const opportunity = state.opportunities.find((item) => item.id === task.opportunityId);
  const companyConflict = opportunity && fields.company !== undefined ? (fields.company.trim() !== opportunity.company ?
    "来源机会属于“" + opportunity.company + "”，不能在本次岗位写入中改为其他公司。请确认所属公司后再继续。" : "") : task.draft?.companyConflict || "";
  if (opportunity) { patch.companyId = opportunity.companyId; patch.company = opportunity.company; }
  return { patch, positionId: current?.id, opportunityId: task.opportunityId, directionId: task.directionId,
    expectedVersion: current?.version || state.opportunities.find((item) => item.id === task.opportunityId)?.version,
    source: { id: "source-" + task.id + "-" + (materialMessages.at(-1)?.id || task.version), kind: "task", taskId: task.id, label: current ? "岗位修改任务" : "岗位创建任务", content: sourceText },
    companyConflict, warnings: [...(task.source?.warnings || []), companyConflict].filter(Boolean) };
}

export async function collectTaskAttachments(files) {
  const fileIds = [], material = [], warnings = [];
  for (const file of files) {
    const metadata = await storeOpportunityAttachment(file);
    fileIds.push(metadata.id);
    try {
      const parsed = await extractOpportunityText(file);
      material.push("来源文件：" + file.name + "\n" + parsed.text);
      warnings.push(...parsed.warnings);
    } catch (error) { warnings.push(file.name + "：" + error.message); }
  }
  return { fileIds, material: material.join("\n\n"), warnings };
}

export async function createOpportunityTask({ prompt, files = [], authMode, opportunityId, positionId, kind = "opportunity", source, draft }) {
  const collected = await collectTaskAttachments(files);
  return runOpportunityCommand("task.create", { kind, title: kind === "recruiting" ? "寻找岗位候选人" : kind === "position-create" ? "整理岗位资料" : "核验招聘需求",
    prompt, fileIds: collected.fileIds, authMode: taskAuthorization(authMode), opportunityId, positionId, draft,
    source: { ...source, material: collected.material || source?.material || "", warnings: collected.warnings },
    allowedResults: kind === "opportunity" ? ["opportunity"] : kind === "position-create" ? ["position"] : ["candidate"] });
}

export function advanceLifecycleTask(taskId) {
  const latest = getOpportunitySnapshot().tasks.find((item) => item.id === taskId && !item.deletedAt);
  if (!latest) throw new Error("任务不存在或已删除。");
  if (latest.kind === "recruiting") {
    runOpportunityCommand("task.update", { id: taskId, patch: { phase: "candidate-review", status: "等待用户" },
      message: { role: "assistant", content: "候选人资料已列出，等待逐人审核。确认只建立岗位储备关系，不发送联系消息。" } });
    return "";
  }
  const draft = latest.kind === "opportunity" ? prepareOpportunityDraft(latest) : preparePositionDraft(latest);
  runOpportunityCommand("task.update", { id: taskId, patch: { draft, phase: "review", status: "等待用户" },
    message: { role: "assistant", content: latest.kind === "opportunity" ? "招聘需求已整理为草稿。请核对公司、需求依据和待确认项；正式结果将在写入后出现。" : "岗位草稿已整理。请检查职责、任职要求和未知字段，确认后创建岗位。" } });
  return "";
}

export function respondToSingleAssetDraft(taskId, text) {
  const task = getOpportunitySnapshot().tasks.find((item) => item.id === taskId && !item.deletedAt);
  if (!task || !["opportunity", "position-create"].includes(task.kind)) return null;
  const decision = singleAssetDecision(text);
  const pending = ["review", "cancelled"].includes(task.phase) && task.draft;
  if (!pending && decision === "suggest") return null;
  const remember = (content, patch = {}) => {
    runOpportunityCommand("task.update", { id: taskId, patch, message: { role: "assistant", content } });
    return { handled: true, content };
  };
  if (decision === "suggest") {
    const draft = task.draft;
    const state = getOpportunitySnapshot();
    const targetName = text.trim().match(/^更新已有机会[：:]\s*(.+)$/)?.[1];
    const targets = targetName ? state.opportunities.filter((item) => !item.deletedAt && (item.id === targetName || item.title === targetName) && item.companyId === draft.patch.companyId) : [];
    const target = targets.length === 1 ? targets[0] : null;
    if (targetName && !target) return remember("没有找到唯一的同公司机会，尚未修改或写入。请提供上方列出的机会 ID。");
    if (text.trim() === "保留为不同需求" || target || text.trim() === "重新核对") {
      const current = task.kind === "position-create" && draft.positionId ? state.positions.find((item) => item.id === draft.positionId) :
        state.opportunities.find((item) => item.id === (target?.id || draft.opportunityId || task.opportunityId));
      runOpportunityCommand("task.update", { id: taskId, patch: { phase: "review", status: "等待用户", draft: {
        ...draft, ...(target ? { opportunityId: target.id } : {}), expectedVersion: current?.version,
        keepSeparate: text.trim() === "保留为不同需求", feedback: "" } }, message: { role: "user", content: text, sourceKind: "decision" } });
      return remember("已更新待确认方案，尚未写入。是否按下方摘要入库或应用修改？");
    }
    if (Object.keys(explicitInputFields(text)).length || /岗位职责|任职要求/.test(text)) return null;
    runOpportunityCommand("task.update", { id: taskId, patch: {}, message: { role: "user", content: text, sourceKind: "decision" } });
    return remember("尚未修改或写入。当前原型未能可靠解析这条建议，请明确需要修改的字段及内容，例如“机会名称：新的名称”或“岗位名称：新的名称”；正式语义理解仍由后续 Agent 实现。");
  }
  runOpportunityCommand("task.update", { id: taskId, patch: {}, message: { role: "user", content: text, sourceKind: "decision" } });
  if (!pending) return remember(task.phase === "result" ? "这份资料已经写入，没有新的待确认修改，不会重复入库。" : "资料仍在整理，尚未生成可确认的草稿。");
  if (decision === "decline") return remember("暂不写入，草稿已保留。", { phase: "cancelled", status: "可继续" });
  const draft = task.draft;
  try {
    if (draft.invalidDirections) throw new Error("招聘方向结构无法读取，请补充有效的招聘方向 JSON 后重新确认。");
    if (draft.companyConflict) throw new Error(draft.companyConflict);
    if (task.kind === "opportunity") runOpportunityCommand("opportunity.save", { patch: draft.patch, id: draft.opportunityId,
      expectedVersion: draft.expectedVersion, source: draft.source, directions: draft.directions, keepSeparate: Boolean(draft.keepSeparate) },
      { taskId, commandId: "confirm-" + taskId + "-" + draft.source.id + "-" + (draft.opportunityId || "new") });
    else if (draft.positionId) runOpportunityCommand("position.update", { id: draft.positionId, patch: draft.patch, source: draft.source, expectedVersion: draft.expectedVersion },
      { taskId, commandId: "confirm-position-update-" + taskId + "-" + draft.source.id });
    else runOpportunityCommand(task.opportunityId ? "position.convert" : "position.create", { patch: draft.patch, mode: "new", opportunityId: task.opportunityId,
      directionId: task.directionId, expectedVersion: draft.expectedVersion, sources: [draft.source] }, { taskId, commandId: "confirm-position-" + taskId });
    return { handled: true, content: "已按确认内容写入，正式结果见当前任务。" };
  } catch (error) {
    let content = draftFailureText(error);
    if (error.code === "DUPLICATE") content += "\n\n" + (error.details?.ids || []).map((id) => {
      const item = getOpportunitySnapshot().opportunities.find((entry) => entry.id === id);
      return "- 已有机会：“" + item?.title + "”（" + id + "）";
    }).join("\n") + "\n\n请说明“更新已有机会：名称或 ID”，或“保留为不同需求”，我会先更新摘要再等待确认。";
    if (error.code === "CONFLICT") content += "\n\n请回复“重新核对”查看当前版本与待应用修改，再决定是否确认。";
    return remember(content, { draft: { ...draft, feedback: content } });
  }
}
