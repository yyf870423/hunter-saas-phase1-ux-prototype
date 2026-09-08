export const OPPORTUNITY_STATUSES = ["跟进中", "已完成", "已关闭"];
export const DIRECTION_STATUSES = ["待处理", "已形成或关联岗位", "不再推进"];
export const OPPORTUNITY_FIELDS = [
  "title", "companyId", "contactId", "summary", "evidence", "priority",
  "people", "period", "requirements", "missing",
];
export const POSITION_FIELDS = [
  "name", "companyId", "company", "location", "salary", "experience",
  "education", "skills", "jd", "note", "requirements",
];
export const DIRECTION_FIELDS = [
  "name", "requirement", "missing", "location", "salary", "experience",
  "education", "skills", "jd", "note",
];
export const PIPELINE_STAGES = [
  { id: "reserve", name: "储备", tone: "reserve" },
  { id: "recommended", name: "已推荐", tone: "active" },
  { id: "interview-1", name: "一面", tone: "active" },
  { id: "interview-2", name: "二面", tone: "active" },
  { id: "offer", name: "谈薪", tone: "active" },
  { id: "joined", name: "已入职", tone: "success" },
  { id: "withdrawn", name: "候选人放弃", tone: "danger" },
  { id: "rejected", name: "已落选", tone: "danger" },
  { id: "unsuitable", name: "候选人不合适", tone: "danger" },
];

export class OpportunityError extends Error {
  constructor(message, code = "VALIDATION", details = {}) {
    super(message);
    this.name = "OpportunityError";
    this.code = code;
    this.details = details;
  }
}

const fail = (message, code, details) => {
  throw new OpportunityError(message, code, details);
};
const text = (value) => typeof value === "string" ? value.trim() : "";
const normalized = (value) => text(value).normalize("NFKC").toLocaleLowerCase();
const activePlan = (plan) => ["pending", "due"].includes(plan.status);
export const opportunityNow = (state) => state.clock || new Date().toISOString();
export const currentFollowup = (state, opportunityId) =>
  state.followups.find((plan) => plan.opportunityId === opportunityId && activePlan(plan));

export function checkFields(patch, allowed) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch))
    fail("资料结构不正确，请重新生成或填写。", "SCHEMA");
  const unknown = Object.keys(patch).filter((key) => !allowed.includes(key));
  if (unknown.length)
    fail("资料包含不允许写入的字段：" + unknown.join("、"), "SCHEMA");
  for (const [key, value] of Object.entries(patch)) {
    if (key === "skills") {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string"))
        fail("关键技能必须是文字列表。", "SCHEMA");
    } else if (typeof value !== "string") {
      fail("字段 " + key + " 必须是文字。", "SCHEMA");
    }
  }
}

export function validateOpportunity(draft, context = {}) {
  const errors = {};
  if (!text(draft.title)) errors.title = "请输入机会名称";
  if (!text(draft.summary)) errors.summary = "请输入招聘需求摘要";
  if (!text(draft.evidence)) errors.evidence = "请说明发现依据";
  const company = context.companies?.find((item) => item.id === draft.companyId);
  if (!company || context.deletedCompanies?.includes(company.id))
    errors.companyId = "请选择有效的所属公司";
  if (draft.contactId && !context.contacts?.some((contact) =>
    contact.id === draft.contactId && contact.companyId === draft.companyId && !contact.deletedAt))
    errors.contactId = "联系人不存在或不属于当前公司";
  if (draft.title?.length > 120) errors.title = "机会名称不能超过 120 个字符";
  return errors;
}

export function validatePosition(draft, context = {}, fromOpportunity = false) {
  const errors = {};
  if (!text(draft.name)) errors.name = "请输入岗位名称";
  if (!text(draft.jd) || normalized(draft.jd) === normalized(draft.name))
    errors.jd = "请提供实际岗位职责与任职要求，不能只填写岗位名称";
  const company = context.companies?.find((item) => item.id === draft.companyId);
  if (fromOpportunity || draft.companyId) {
    if (!company || context.deletedCompanies?.includes(company.id))
      errors.companyId = "所属公司不存在或已删除，请先处理公司资料";
  } else if (!text(draft.company)) errors.companyId = "请输入明确的招聘公司";
  return errors;
}

function assertErrors(errors) {
  if (Object.keys(errors).length)
    fail(Object.values(errors)[0], "VALIDATION", { fields: errors });
}

function assertVersion(record, expectedVersion) {
  if (expectedVersion !== undefined && record.version !== expectedVersion)
    fail("资料已被更新，请查看最新变化后重新确认。", "CONFLICT", {
      current: record,
      expectedVersion,
    });
}

function getOpportunity(state, id, allowDeleted = false) {
  const item = state.opportunities.find((entry) => entry.id === id);
  if (!item || (item.deletedAt && !allowDeleted))
    fail("招聘机会不存在或已删除。", "NOT_FOUND");
  return item;
}

function getDirection(opportunity, id) {
  const item = opportunity.directions.find((entry) => entry.id === id && !entry.archived);
  if (!item) fail("招聘方向不存在，请刷新后重试。", "NOT_FOUND");
  return item;
}

function getPosition(state, id, allowDeleted = false) {
  const item = state.positions.find((entry) => entry.id === id);
  if (!item || (item.deletedAt && !allowDeleted))
    fail("岗位不存在或已删除。", "NOT_FOUND");
  return item;
}

function requireFollowing(opportunity) {
  if (opportunity.status !== "跟进中")
    fail("请先重新打开招聘机会，再继续处理需求。", "STATE");
}

function addHistory(opportunity, now, content, details = {}) {
  opportunity.history.unshift({ id: crypto.randomUUID(), at: now, content, ...details });
  opportunity.version += 1;
  opportunity.updatedAt = now;
}

function companyFor(context, id) {
  const company = context.companies?.find((item) => item.id === id);
  if (!company || context.deletedCompanies?.includes(id))
    fail("所属公司不存在或已删除。", "REFERENCE");
  return company;
}

function cancelPlans(state, opportunityId, now, reason) {
  for (const plan of state.followups) {
    if (plan.opportunityId !== opportunityId || !activePlan(plan) || plan.ownerTaskId) continue;
    plan.status = "cancelled";
    plan.closedAt = now;
    plan.closeReason = reason;
  }
  for (const notice of state.notifications) {
    const plan = state.followups.find((item) => item.id === notice.followupId);
    if (plan?.opportunityId === opportunityId && !activePlan(plan)) notice.resolved = true;
  }
}

function validateSource(source) {
  if (!source) return;
  if (!text(source.id) || !text(source.label) ||
      !["manual", "task", "reply", "file", "link", "signal", "import"].includes(source.kind))
    fail("来源结构不合法，未写入正式资料。", "SCHEMA");
  if (source.content !== undefined && typeof source.content !== "string")
    fail("来源内容必须是文字。", "SCHEMA");
  if (source.url && !/^https?:\/\//i.test(source.url))
    fail("来源链接只支持 HTTP 或 HTTPS。", "SCHEMA");
}

function addSource(opportunity, source, now) {
  if (!source || opportunity.sources.some((item) => item.id === source.id)) return;
  validateSource(source);
  opportunity.sources.push({
    id: source.id, kind: source.kind, label: source.label,
    content: source.content || "", url: source.url || "",
    fileId: source.fileId || "", taskId: source.taskId || "",
    runId: source.runId || "", at: source.at || now,
  });
}

function addTaskResult(state, taskId, result, now) {
  if (!taskId) return;
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) fail("来源任务不存在，未写入正式结果。", "REFERENCE");
  const assetRef = { type: result.type, id: result.id };
  if (!task.assetRefs.some((ref) => ref.type === assetRef.type && ref.id === assetRef.id))
    task.assetRefs.push(assetRef);
  if (!task.results.some((item) => item.type === result.type && item.id === result.id &&
      item.version === result.version))
    task.results.push({ ...result, at: now });
  task.phase = "result";
  if (result.type === "opportunity" && task.kind === "opportunity") task.opportunityId = result.id;
  if (result.type === "position") task.positionId = result.id;
  task.status = "可继续";
  task.updatedAt = now;
  task.version += 1;
}

function checkWriteAuthorization(state, command, resultType = "opportunity") {
  if (!command.taskId) return;
  const task = state.tasks.find((item) => item.id === command.taskId);
  if (!task) fail("来源任务不存在。", "REFERENCE");
  if (task.authMode === "analyze")
    fail("当前任务仅分析，未获得正式写入授权。", "AUTHORIZATION");
  if (command.automatic && ["opportunity", "position-create"].includes(task.kind))
    fail("单个资产入库或修改需要用户确认。", "AUTHORIZATION");
  if (command.automatic && (task.authMode !== "auto" || !task.allowedResults?.includes(resultType)))
    fail("当前自动确认授权不包含招聘机会写入。", "AUTHORIZATION");
}

function validateFollowupRecord(data, now) {
  const occurred = new Date(data.occurredAt);
  if (!text(data.content)) fail("请输入实际跟进内容。");
  if (!Number.isFinite(occurred.getTime()) || occurred.getTime() > new Date(now).getTime() + 60000)
    fail("请选择有效的实际跟进时间，不能晚于当前时间。");
  return { content: text(data.content), occurredAt: occurred.toISOString() };
}

function validateFollowupOwner(state, opportunityId, ownerTaskId) {
  if (ownerTaskId && !state.tasks.some((task) => task.id === ownerTaskId && !task.deletedAt &&
    task.assetRefs.some((ref) => ref.type === "opportunity" && ref.id === opportunityId)))
    fail("跟进任务没有直接引用该招聘机会。", "REFERENCE");
}

function scheduleFollowup(state, opportunity, data, now) {
  validateFollowupOwner(state, opportunity.id, data.ownerTaskId);
  if (!data.ownerTaskId) requireFollowing(opportunity);
  const subject = text(data.subject);
  const due = new Date(data.dueAt);
  if (!subject) fail("请输入下次跟进事项。");
  if (!Number.isFinite(due.getTime()) || due.getTime() <= new Date(now).getTime())
    fail("请选择未来的跟进时间。");
  const existing = currentFollowup(state, opportunity.id);
  if (data.id && existing?.id !== data.id)
    fail("本次安排已被处理，请刷新后核对当前跟进。", "CONFLICT");
  if (existing && data.id !== existing.id && !data.replace)
    fail("已安排下一次跟进，请明确改期或替换。", "EXISTING_PLAN", { current: existing });
  if (existing?.ownerTaskId && existing.ownerTaskId !== data.ownerTaskId)
    fail("该跟进由原任务维护，请回到原任务处理。", "TASK_OWNED", { taskId: existing.ownerTaskId });
  if (existing) {
    assertVersion(existing, data.expectedVersion);
    existing.history.push({
      subject: existing.subject, dueAt: existing.dueAt,
      version: existing.version, at: now,
    });
    existing.subject = subject;
    existing.dueAt = due.toISOString();
    existing.status = "pending";
    existing.version += 1;
    existing.notifiedVersion = null;
    for (const notice of state.notifications)
      if (notice.followupId === existing.id) notice.resolved = true;
    return existing;
  }
  const plan = {
    id: "followup-" + crypto.randomUUID(), opportunityId: opportunity.id,
    ownerTaskId: data.ownerTaskId || "", opportunityTitle: opportunity.title, subject, dueAt: due.toISOString(),
    status: "pending", version: 1, history: [], createdAt: now, notifiedVersion: null,
  };
  state.followups.push(plan);
  return plan;
}

export function summarizeOpportunity(opportunity, state, context = {}) {
  const directions = opportunity.directions.filter((item) => !item.archived);
  const linked = [...new Set(directions.map((item) => item.positionId).filter(Boolean))]
    .filter((id) => state.positions.some((position) => position.id === id && !position.deletedAt));
  const followup = currentFollowup(state, opportunity.id);
  const now = new Date(opportunityNow(state)).getTime();
  const followupStatus = !followup ? "未安排" :
    new Date(followup.dueAt).getTime() <= now ? "待跟进" : "已安排";
  return {
    ...opportunity,
    company: context.companies?.find((company) => company.id === opportunity.companyId)?.name ||
      opportunity.company || "公司不可用",
    directions: directions.length, positions: linked.length,
    directionRecords: directions, followup, followupStatus,
    lastFollowupAt: opportunity.records.filter((record) => !record.deletedAt)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0]?.occurredAt || "",
  };
}

// Commands operate on a clone; a failed validation cannot leave half-written assets.
export function applyOpportunityCommand(current, command, context = {}) {
  if (!command || typeof command.type !== "string") fail("操作结构不正确。", "SCHEMA");
  if (context.limited && !["notification.read", "clock.set"].includes(command.type))
    fail("当前没有修改权限，资料未改变。", "PERMISSION");
  if (command.commandId && current.commands[command.commandId])
    return { state: current, result: current.commands[command.commandId] };
  const state = structuredClone(current);
  const now = opportunityNow(state);
  const data = command.data || {};
  let result = {};

  if (command.type === "opportunity.import-row") {
    fail("招聘机会批量导入已取消，历史记录仅供查看。", "UNSUPPORTED");
  } else if (command.type === "opportunity.save") {
    checkWriteAuthorization(state, command);
    checkFields(data.patch, OPPORTUNITY_FIELDS);
    validateSource(data.source);
    const existing = data.id ? getOpportunity(state, data.id) : null;
    if (existing) assertVersion(existing, data.expectedVersion);
    const values = { ...(existing || {}), ...data.patch };
    assertErrors(validateOpportunity(values, context));
    const company = companyFor(context, values.companyId);
    if (existing && existing.companyId !== company.id &&
        existing.directions.some((direction) => direction.positionId))
      fail("已有岗位关系，请先修正关系后再修改所属公司。", "RELATIONSHIP");
    if (!existing && data.source) {
      const prior = state.opportunities.find((item) => !item.deletedAt &&
        item.sources.some((source) => source.id === data.source.id));
      if (prior) {
        result = { opportunityId: prior.id, version: prior.version, duplicate: true };
        addTaskResult(state, command.taskId, { type: "opportunity", id: prior.id,
          title: prior.title, version: prior.version }, now);
      }
    }
    if (!result.opportunityId) {
      const duplicates = state.opportunities.filter((item) => !item.deletedAt &&
        item.id !== existing?.id && item.companyId === company.id &&
        (normalized(item.title) === normalized(values.title) ||
         normalized(item.summary) === normalized(values.summary)));
      if (duplicates.length && !data.keepSeparate)
        fail("发现可能属于同一轮需求的机会，请比较后决定更新或保留为不同需求。",
          "DUPLICATE", { ids: duplicates.map((item) => item.id) });
      const opportunity = existing || {
        id: "opportunity-" + crypto.randomUUID(), status: "跟进中", version: 0,
        directions: [], records: [], history: [], sources: [],
        createdAt: now, deletedAt: null,
      };
      const before = existing ? Object.fromEntries(OPPORTUNITY_FIELDS.map((key) =>
        [key, existing[key] || ""])) : null;
      for (const [key, value] of Object.entries(data.patch)) opportunity[key] = value.trim();
      opportunity.company = company.name;
      addSource(opportunity, data.source, now);
      if (data.directions !== undefined && !Array.isArray(data.directions))
        fail("招聘方向必须是列表。", "SCHEMA");
      if (Array.isArray(data.directions)) {
        for (const draft of data.directions) {
          checkFields(draft, DIRECTION_FIELDS);
          if (!text(draft.name)) fail("招聘方向名称不能为空。");
          if (opportunity.directions.some((item) => !item.archived && normalized(item.name) === normalized(draft.name)))
            fail("招聘方向已经存在，请在机会内核对后编辑原方向。", "DUPLICATE_DIRECTION");
          const jdSource = text(draft.jd) ? { ...data.source, id: "source-jd-" + crypto.randomUUID(),
            kind: data.source ? "task" : "manual", label: data.source ? "任务资料整理后确认的 JD" : "用户录入 JD",
            content: draft.jd + (data.source ? "\n\n原始来源（" + data.source.label + "）：\n" + data.source.content : "") } : null;
          addSource(opportunity, jdSource, now);
          opportunity.directions.push({
            ...draft, name: text(draft.name), id: "direction-" + crypto.randomUUID(),
            jdSourceId: jdSource?.id || "",
            status: "待处理", positionId: "", createdAt: now,
          });
        }
      }
      addHistory(opportunity, now, existing ? "更新机会资料" : "创建招聘机会", { before });
      if (data.initialRecord) {
        const record = { ...validateFollowupRecord(data.initialRecord, now), id: "record-" + crypto.randomUUID(),
          version: 1, fileIds: [], createdAt: now, updatedAt: now };
        opportunity.records.push(record);
        addHistory(opportunity, now, "记录首次跟进", { recordId: record.id });
      }
      if (data.initialSchedule) {
        scheduleFollowup(state, opportunity, data.initialSchedule, now);
        addHistory(opportunity, now, "安排下一次跟进：" + data.initialSchedule.subject);
      }
      if (!existing) state.opportunities.push(opportunity);
      result = { opportunityId: opportunity.id, version: opportunity.version, created: !existing };
      addTaskResult(state, command.taskId, { type: "opportunity", id: opportunity.id,
        title: opportunity.title, version: opportunity.version }, now);
    }
  } else if (command.type.startsWith("direction.")) {
    const opportunity = getOpportunity(state, data.opportunityId);
    assertVersion(opportunity, data.expectedVersion);
    requireFollowing(opportunity);
    const direction = data.id ? getDirection(opportunity, data.id) : null;
    if (command.type === "direction.save") {
      checkFields(data.patch, DIRECTION_FIELDS);
      if (!text(data.patch.name || direction?.name)) fail("请输入招聘方向名称。");
      const name = text(data.patch.name || direction.name);
      const duplicate = opportunity.directions.find((item) => !item.archived &&
        item.id !== data.id && normalized(item.name) === normalized(name));
      if (duplicate && !data.keepSeparate) fail("已有同名方向，请确认是否为不同需求。", "DUPLICATE");
      const jdSourceId = data.patch.jd !== undefined && data.patch.jd !== direction?.jd
        ? (text(data.patch.jd) ? "manual" : "") : direction?.jdSourceId || "";
      if (direction) Object.assign(direction, data.patch, { name, jdSourceId });
      else opportunity.directions.push({
        ...data.patch, name, jdSourceId, id: "direction-" + crypto.randomUUID(),
        status: "待处理", positionId: "", createdAt: now,
      });
      result.directionId = direction?.id || opportunity.directions.at(-1).id;
      addHistory(opportunity, now, (direction ? "编辑方向：" : "添加方向：") + name);
    } else if (command.type === "direction.split") {
      if (!direction) fail("请选择要拆分的方向。");
      if (direction.positionId) fail("请先处理原岗位关系，再拆分方向。", "RELATIONSHIP");
      if (!Array.isArray(data.parts) || data.parts.length < 2)
        fail("请至少填写两个拆分后的方向。");
      const parts = data.parts.map((part) => {
        checkFields(part, DIRECTION_FIELDS);
        if (!text(part.name)) fail("拆分后的方向名称不能为空。");
        return { ...part, name: text(part.name), id: "direction-" + crypto.randomUUID(),
          status: "待处理", positionId: "", sourceDirectionId: direction.id, createdAt: now };
      });
      if (new Set(parts.map((part) => normalized(part.name))).size !== parts.length)
        fail("拆分后的方向名称不能重复。");
      direction.archived = true;
      direction.splitInto = parts.map((part) => part.id);
      opportunity.directions.push(...parts);
      addHistory(opportunity, now, "拆分招聘方向：" + direction.name);
      result.directionIds = direction.splitInto;
    } else if (command.type === "direction.remove") {
      if (!direction) fail("招聘方向不存在。");
      if (direction.positionId) fail("请先解除岗位关系，删除方向不会删除岗位。", "RELATIONSHIP");
      direction.archived = true;
      addHistory(opportunity, now, "删除误建方向：" + direction.name);
    } else if (command.type === "direction.status") {
      if (!direction || !["待处理", "不再推进"].includes(data.status))
        fail("方向状态不合法。", "SCHEMA");
      if (direction.positionId) fail("已关联岗位，请先处理当前关系。", "RELATIONSHIP");
      if (data.status === "不再推进" && !text(data.reason)) fail("请说明不再推进的原因。");
      direction.status = data.status;
      direction.closeReason = text(data.reason);
      addHistory(opportunity, now, direction.name + "：" + data.status);
    } else fail("不支持的招聘方向操作。", "SCHEMA");
    result.opportunityId = opportunity.id;
  } else if (command.type === "followup.record") {
    validateFollowupOwner(state, data.opportunityId, data.ownerTaskId);
    const opportunity = getOpportunity(state, data.opportunityId, Boolean(data.ownerTaskId));
    assertVersion(opportunity, data.expectedVersion);
    const values = validateFollowupRecord(data, now);
    const previous = data.id ? opportunity.records.find((record) => record.id === data.id && !record.deletedAt) : null;
    if (data.id && !previous) fail("跟进记录不存在。", "NOT_FOUND");
    if (previous?.readOnly) fail("原始事件不可在机会内改写，请查看来源。", "STATE");
    const record = previous || { id: "record-" + crypto.randomUUID(), createdAt: now, version: 0 };
    if (previous) record.previous = [...(record.previous || []),
      { content: previous.content, occurredAt: previous.occurredAt, at: now }];
    Object.assign(record, { ...values,
      fileIds: data.fileIds || [], updatedAt: now, version: record.version + 1 });
    if (!previous) opportunity.records.push(record);
    if (data.completeId) {
      const plan = state.followups.find((item) => item.id === data.completeId && item.opportunityId === opportunity.id);
      if (!plan || !activePlan(plan)) fail("本次跟进已被处理，请刷新安排后重试。", "CONFLICT");
      if (plan.ownerTaskId && plan.ownerTaskId !== data.ownerTaskId)
        fail("该事项由原任务维护，请返回原任务处理。", "TASK_OWNED", { taskId: plan.ownerTaskId });
      plan.status = "done";
      plan.closedAt = now;
      for (const notice of state.notifications)
        if (notice.followupId === plan.id) notice.resolved = true;
    }
    if (data.next) result.followupId = scheduleFollowup(state, opportunity, data.next, now).id;
    addHistory(opportunity, now, previous ? "修改跟进记录" : "记录本次跟进", { recordId: record.id });
    result.recordId = record.id;
  } else if (command.type === "followup.remove") {
    const opportunity = getOpportunity(state, data.opportunityId);
    const record = opportunity.records.find((item) => item.id === data.id && !item.deletedAt);
    if (!record || record.readOnly) fail("该跟进记录不可删除。", "STATE");
    record.deletedAt = now;
    addHistory(opportunity, now, "删除跟进记录", { recordId: record.id });
  } else if (command.type === "followup.schedule") {
    const opportunity = getOpportunity(state, data.opportunityId, Boolean(data.ownerTaskId));
    result.followupId = scheduleFollowup(state, opportunity, data, now).id;
    addHistory(opportunity, now, "安排下一次跟进：" + data.subject);
  } else if (command.type === "followup.cancel") {
    const plan = state.followups.find((item) => item.id === data.id);
    if (!plan || !activePlan(plan)) fail("跟进安排已失效。", "CONFLICT");
    assertVersion(plan, data.expectedVersion);
    if (plan.ownerTaskId && plan.ownerTaskId !== data.ownerTaskId)
      fail("请回到原任务取消该安排。", "TASK_OWNED", { taskId: plan.ownerTaskId });
    plan.status = "cancelled";
    plan.closedAt = now;
    for (const notice of state.notifications)
      if (notice.followupId === plan.id) notice.resolved = true;
    validateFollowupOwner(state, plan.opportunityId, data.ownerTaskId);
    const opportunity = state.opportunities.find((item) => item.id === plan.opportunityId);
    if (opportunity) addHistory(opportunity, now, "取消下次跟进：" + plan.subject);
  } else if (command.type === "opportunity.transition") {
    const opportunity = getOpportunity(state, data.id);
    assertVersion(opportunity, data.expectedVersion);
    if (!OPPORTUNITY_STATUSES.includes(data.status)) fail("机会状态不合法。", "SCHEMA");
    if (data.status === opportunity.status) fail("机会状态没有变化。");
    if (data.status === "已完成") {
      const directions = opportunity.directions.filter((item) => !item.archived);
      const hasPosition = directions.some((item) => item.positionId &&
        state.positions.some((position) => position.id === item.positionId && !position.deletedAt));
      if (!hasPosition || directions.some((item) => item.status === "待处理" ||
        (item.positionId && !state.positions.some((position) => position.id === item.positionId && !position.deletedAt))))
        fail("请先形成至少一个岗位，并处理所有剩余招聘方向。", "STATE");
    }
    if (data.status === "已关闭" && !text(data.reason)) fail("请填写关闭原因。");
    if (data.status === "跟进中" && !text(data.reason)) fail("请填写重新打开的原因。");
    opportunity.status = data.status;
    opportunity.statusReason = text(data.reason);
    if (data.status !== "跟进中") cancelPlans(state, opportunity.id, now, data.status);
    addHistory(opportunity, now, "机会" + data.status, { reason: text(data.reason) });
    result.opportunityId = opportunity.id;
  } else if (command.type === "opportunity.recycle-many") {
    if (!Array.isArray(data.ids) || !data.ids.length) fail("请先选择招聘机会。");
    const records = [...new Set(data.ids)].map((id) => getOpportunity(state, id));
    for (const opportunity of records) {
      opportunity.deletedAt = now;
      cancelPlans(state, opportunity.id, now, "机会已删除");
      addHistory(opportunity, now, "招聘机会进入回收站");
    }
    result.ids = records.map((record) => record.id);
  } else if (["opportunity.recycle", "opportunity.restore", "opportunity.purge"].includes(command.type)) {
    const opportunity = getOpportunity(state, data.id, true);
    if (command.type === "opportunity.recycle") {
      opportunity.deletedAt = now;
      cancelPlans(state, opportunity.id, now, "机会已删除");
      addHistory(opportunity, now, "招聘机会进入回收站");
    } else if (command.type === "opportunity.restore") {
      if (!opportunity.deletedAt) fail("招聘机会已经恢复。", "CONFLICT");
      if (new Date(now).getTime() - new Date(opportunity.deletedAt).getTime() >= 30 * 86400000)
        fail("招聘机会已超过 30 天恢复期限，不能恢复。", "STATE");
      companyFor(context, opportunity.companyId);
      const title = text(data.title) || opportunity.title;
      if (state.opportunities.some((item) => item.id !== opportunity.id && !item.deletedAt &&
        item.companyId === opportunity.companyId && normalized(item.title) === normalized(title)))
        fail("存在同公司同名机会，请修改恢复后的名称。", "DUPLICATE");
      opportunity.title = title;
      opportunity.deletedAt = null;
      addHistory(opportunity, now, "恢复招聘机会，未重新启动提醒或任务");
    } else {
      if (!opportunity.deletedAt) fail("请先将机会放入回收站。", "STATE");
      state.tombstones.push({ id: opportunity.id, type: "opportunity", title: opportunity.title, at: now });
      state.opportunities = state.opportunities.filter((item) => item.id !== opportunity.id);
    }
    result.opportunityId = opportunity.id;
  } else if (command.type === "position.create" || command.type === "position.convert") {
    checkWriteAuthorization(state, command, "position");
    if (data.sources) {
      if (!Array.isArray(data.sources)) fail("岗位来源必须是列表。", "SCHEMA");
      data.sources.forEach(validateSource);
    }
    const opportunity = data.opportunityId ? getOpportunity(state, data.opportunityId) : null;
    const direction = opportunity ? getDirection(opportunity, data.directionId) : null;
    if (opportunity) {
      assertVersion(opportunity, data.expectedVersion);
      requireFollowing(opportunity);
      if (direction.status === "不再推进") fail("请先重新打开该招聘方向。", "STATE");
      if (direction.positionId) fail("该方向已有关联岗位，请先管理现有关系。", "RELATIONSHIP");
    }
    let position;
    if (data.mode === "existing") {
      if (!opportunity) fail("请选择所属招聘机会。");
      position = getPosition(state, data.positionId);
      if (position.companyId !== opportunity.companyId) fail("只能关联同一公司的岗位。", "RELATIONSHIP");
      if (position.status === "已关闭") fail("已关闭岗位不能建立新机会关系。", "STATE");
      if (state.opportunities.some((item) => item.directions.some((entry) =>
        !entry.archived && entry.positionId === position.id)))
        fail("该岗位已有机会主归属，请先查看并处理原关系。", "RELATIONSHIP");
    } else {
      checkFields(data.patch, POSITION_FIELDS);
      const patch = { ...data.patch,
        ...(opportunity ? { companyId: opportunity.companyId, company: opportunity.company } : {}) };
      assertErrors(validatePosition(patch, context, Boolean(opportunity)));
      const duplicate = state.positions.find((item) => !item.deletedAt &&
        normalized(item.name) === normalized(patch.name) &&
        (patch.companyId ? item.companyId === patch.companyId :
          normalized(item.company) === normalized(patch.company)));
      if (duplicate) fail("已存在同公司同名岗位，请先比较或关联已有岗位。", "DUPLICATE",
        { positionId: duplicate.id });
      position = {
        ...patch, name: text(patch.name), id: "position-" + crypto.randomUUID(),
        company: patch.companyId ? companyFor(context, patch.companyId).name : text(patch.company),
        status: "招聘中", managed: true, version: 1, createdAt: now, updatedAt: now,
        skills: patch.skills || [], pipeline: [], stages: structuredClone(PIPELINE_STAGES),
        versions: [], processing: [], matches: [], deletedAt: null,
        origin: { opportunityId: opportunity?.id || "", directionId: direction?.id || "",
          taskId: command.taskId || "", label: opportunity ? opportunity.title : "用户创建" },
        sources: data.sources || [],
      };
      state.positions.push(position);
    }
    if (opportunity) {
      direction.positionId = position.id;
      direction.status = "已形成或关联岗位";
      direction.linkMethod = data.mode === "existing" ? "existing" : "created";
      direction.linkedAt = now;
      addHistory(opportunity, now, (data.mode === "existing" ? "关联已有岗位：" : "创建岗位：") + position.name,
        { positionId: position.id, directionId: direction.id });
    }
    result = { positionId: position.id, opportunityId: opportunity?.id || "", created: data.mode !== "existing" };
    addTaskResult(state, command.taskId, { type: "position", id: position.id,
      title: position.name, version: position.version }, now);
  } else if (command.type === "position.unlink") {
    const opportunity = getOpportunity(state, data.opportunityId);
    requireFollowing(opportunity);
    const direction = getDirection(opportunity, data.directionId);
    const prior = direction.positionId;
    if (!prior) fail("该方向没有当前岗位关系。", "STATE");
    direction.positionId = "";
    direction.status = "待处理";
    direction.previousLinks = [...(direction.previousLinks || []), { positionId: prior, at: now }];
    addHistory(opportunity, now, "解除岗位关系，岗位和创建来源保留", { positionId: prior });
    result.positionId = prior;
  } else if (command.type === "position.update") {
    checkWriteAuthorization(state, command, "position");
    validateSource(data.source);
    const position = getPosition(state, data.id);
    assertVersion(position, data.expectedVersion);
    checkFields(data.patch, POSITION_FIELDS);
    const patch = { ...position, ...data.patch };
    assertErrors(validatePosition(patch, context));
    if (patch.companyId !== position.companyId && state.opportunities.some((opportunity) =>
      opportunity.directions.some((direction) => direction.positionId === position.id)))
      fail("岗位已有机会关系，不能直接改变招聘公司。", "RELATIONSHIP");
    position.versions ||= [];
    position.versions.unshift({ version: position.version, jd: position.jd, at: position.updatedAt,
      fields: Object.fromEntries(POSITION_FIELDS.map((key) => [key, position[key] || (key === "skills" ? [] : "")])) });
    Object.assign(position, data.patch, { version: position.version + 1, updatedAt: now, managed: true });
    addSource(position, data.source, now);
    result.positionId = position.id;
    result.version = position.version;
    addTaskResult(state, command.taskId, { type: "position", id: position.id, title: position.name, version: position.version }, now);
  } else if (command.type === "position.purge") {
    const position = getPosition(state, data.id, true);
    if (!position.deletedAt) fail("请先将岗位放入回收站。", "STATE");
    state.tombstones.push({ id: position.id, type: "position", title: position.name, at: now });
    state.positions = state.positions.filter((item) => item.id !== position.id);
    result.positionId = position.id;
  } else if (["position.recycle", "position.restore", "position.status"].includes(command.type)) {
    const position = getPosition(state, data.id, command.type === "position.restore");
    if (command.type === "position.status") {
      if (!["招聘中", "已暂停", "已关闭"].includes(data.status)) fail("岗位状态不合法。", "SCHEMA");
      position.status = data.status;
    } else if (command.type === "position.recycle") position.deletedAt = now;
    else {
      if (!position.deletedAt) fail("岗位已经恢复。", "CONFLICT");
      if (new Date(now).getTime() - new Date(position.deletedAt).getTime() >= 30 * 86400000)
        fail("岗位已超过 30 天恢复期限，不能恢复。", "STATE");
      if (position.companyId) companyFor(context, position.companyId);
      position.deletedAt = null;
    }
    position.version += 1;
    position.updatedAt = now;
    result.positionId = position.id;
  } else if (command.type === "position.match") {
    const position = getPosition(state, data.id);
    position.processing ||= [];
    if (data.phase === "start") {
      if (position.processing.some((item) => item.type === "matching" && item.status === "running"))
        fail("该岗位已有人岗匹配正在运行。", "STATE");
      position.processing.unshift({ id: "process-" + crypto.randomUUID(), type: "matching",
        status: "running", at: now, version: position.version });
    } else {
      const process = position.processing.find((item) => item.type === "matching" && item.status === "running");
      if (!process) fail("没有正在运行的人岗匹配。", "STATE");
      if (!data.failed) assertVersion(position, process.version);
      process.status = data.failed ? "failed" : "complete";
      process.error = data.failed ? text(data.error) : "";
      process.finishedAt = now;
      if (!data.failed) {
        const ids = [...new Set(data.candidateIds || [])];
        if (ids.some((id) => !context.candidates?.some((candidate) => candidate.id === id)))
          fail("匹配结果引用了不存在的候选人。", "REFERENCE");
        position.matches = ids;
      }
    }
    result.positionId = position.id;
  } else if (command.type === "pipeline.add" || command.type === "pipeline.move") {
    const position = getPosition(state, data.positionId);
    position.pipeline ||= [];
    position.stages ||= structuredClone(PIPELINE_STAGES);
    if (command.type === "pipeline.add") {
      for (const id of [...new Set(data.candidateIds || [])]) {
        if (!context.candidates?.some((candidate) => candidate.id === id))
          fail("候选人不存在。", "REFERENCE");
        if (!position.pipeline.some((item) => item.candidateId === id))
          position.pipeline.push({ candidateId: id, stage: "reserve", at: now, history: [{ stage: "reserve", at: now }] });
      }
    } else {
      const item = position.pipeline.find((entry) => entry.candidateId === data.candidateId);
      if (!item || !position.stages.some((stage) => stage.id === data.stage))
        fail("候选人或目标阶段不存在。", "REFERENCE");
      item.stage = data.stage;
      item.at = now;
      item.history.push({ stage: data.stage, at: now, note: text(data.note) });
    }
    position.updatedAt = now;
    result.positionId = position.id;
  } else if (command.type === "recruiting.review") {
    const task = state.tasks.find((item) => item.id === data.taskId && item.kind === "recruiting");
    if (!task || task.positionId !== data.positionId) fail("招聘任务与目标岗位不一致。", "REFERENCE");
    if (task.authMode === "analyze") fail("当前任务仅分析，不能写入岗位储备。", "AUTHORIZATION");
    if (!Array.isArray(data.candidateIds) || !data.candidateIds.length) fail("请至少选择一位候选人。");
    const position = getPosition(state, data.positionId);
    if (position.status !== "招聘中") fail("岗位当前不在招聘中，不能加入新的岗位储备。", "STATE");
    assertVersion(position, task.positionVersion);
    const ids = [...new Set(data.candidateIds)];
    for (const id of ids) {
      if (!context.candidates?.some((candidate) => candidate.id === id)) fail("候选人不存在。", "REFERENCE");
      if (!position.pipeline.some((entry) => entry.candidateId === id))
        position.pipeline.push({ candidateId: id, stage: "reserve", at: now, history: [{ stage: "reserve", at: now }], taskId: task.id });
    }
    task.results.push({ type: "pipeline", id: position.id, candidateIds: ids, at: now });
    task.status = "可继续";
    task.phase = "result";
    task.selectedCandidateIds = [];
    task.updatedAt = now;
    task.version += 1;
    position.updatedAt = now;
    result = { positionId: position.id, candidateIds: ids };
  } else if (command.type === "task.create") {
    if (!["opportunity", "position-create", "recruiting"].includes(data.kind))
      fail("任务类型不合法。", "SCHEMA");
    if (!text(data.title) || !text(data.prompt)) fail("请输入任务目标。");
    if (!["confirm", "auto", "analyze"].includes(data.authMode || "confirm")) fail("授权方式不合法。");
    const assetRefs = [];
    if (data.opportunityId) {
      getOpportunity(state, data.opportunityId);
      assetRefs.push({ type: "opportunity", id: data.opportunityId });
    }
    if (data.positionId) {
      const position = getPosition(state, data.positionId);
      if (data.kind === "recruiting" && position.status !== "招聘中")
        fail("请先将岗位恢复为招聘中，再开始找人。", "STATE");
      assetRefs.push({ type: "position", id: data.positionId });
    }
    const task = {
      id: data.id || "task-" + data.kind + "-" + crypto.randomUUID(),
      kind: data.kind, title: text(data.title), prompt: data.prompt,
      legacyWorkspace: Boolean(data.legacyWorkspace),
      authMode: data.authMode || "confirm", status: "等待用户", phase: "input",
      allowedResults: data.allowedResults || ["opportunity"], assetRefs,
      results: [], messages: [{ id: crypto.randomUUID(), role: "user", content: data.prompt,
        fileIds: data.fileIds || [], at: now }],
      draft: data.draft || null, opportunityId: data.opportunityId || "",
      directionId: data.directionId || "", positionId: data.positionId || "",
      positionVersion: data.positionId ? getPosition(state, data.positionId).version : null,
      source: data.source || null, createdAt: now, updatedAt: now, version: 1,
      sourceSignals: data.source?.kind === "signal" && data.source.id ? [data.source.id] : [],
    };
    if (state.tasks.some((item) => item.id === task.id)) fail("任务已经存在。", "CONFLICT");
    state.tasks.push(task);
    result.taskId = task.id;
  } else if (command.type === "task.refresh-position") {
    const task = state.tasks.find((item) => item.id === data.id && item.kind === "recruiting" && !item.deletedAt);
    if (!task) fail("招聘任务不存在。", "NOT_FOUND");
    const position = getPosition(state, task.positionId);
    if (position.status !== "招聘中") fail("请先恢复岗位招聘状态。", "STATE");
    task.positionVersion = position.version;
    task.selectedCandidateIds = [];
    task.messages.push({ id: crypto.randomUUID(), role: "assistant", at: now,
      content: "用户已重新核对岗位 v" + position.version + "，请按当前 JD 重新审核候选人。\n\n" + position.jd });
    task.version += 1;
    task.updatedAt = now;
    result.taskId = task.id;
  } else if (command.type === "task.purge") {
    const task = state.tasks.find((item) => item.id === data.id && item.deletedAt);
    if (!task) fail("请先将任务放入回收站。", "STATE");
    state.tombstones.push({ id: task.id, type: "task", title: task.title, at: now });
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
    result.taskId = task.id;
  } else if (["task.recycle", "task.restore"].includes(command.type)) {
    const task = state.tasks.find((item) => item.id === data.id);
    if (!task) fail("任务不存在。", "NOT_FOUND");
    if (command.type === "task.restore") {
      if (!task.deletedAt) fail("任务已经恢复。", "CONFLICT");
      if (new Date(now).getTime() - new Date(task.deletedAt).getTime() >= 30 * 86400000)
        fail("任务已超过 30 天恢复期限，不能恢复。", "STATE");
    }
    task.deletedAt = command.type === "task.recycle" ? now : null;
    if (task.deletedAt) {
      for (const plan of state.followups) {
        if (plan.ownerTaskId === task.id && activePlan(plan)) { plan.status = "cancelled"; plan.closedAt = now; }
      }
      for (const notice of state.notifications) if (notice.taskId === task.id) notice.resolved = true;
    }
    task.updatedAt = now;
    task.version += 1;
    result.taskId = task.id;
  } else if (command.type === "task.followup.confirm") {
    const task = state.tasks.find((item) => item.id === data.id && !item.deletedAt);
    if (!task || task.phase !== "result") fail("当前任务没有可确认的跟进操作。", "STATE");
    checkWriteAuthorization(state, { ...command, taskId: task.id });
    const draft = task.followupDraft;
    if (!draft || draft.stage !== "review" || draft.id !== data.draftId || !["schedule", "record", "cancel"].includes(draft.action))
      fail("跟进草稿已变化，请重新核对。", "CONFLICT");
    validateFollowupOwner(state, task.opportunityId, task.id);
    const plan = currentFollowup(state, task.opportunityId);
    if ((plan?.id || "") !== draft.planId) fail("跟进安排已变化，请重新核对。", "CONFLICT");
    if (draft.action === "record" && draft.complete && !plan) fail("当前没有可完成的跟进事项，请取消同时完成后再保存记录。", "STATE");
    if (plan) {
      assertVersion(plan, draft.planVersion);
      if (plan.ownerTaskId && plan.ownerTaskId !== task.id) fail("该事项由原任务维护，请返回原任务处理。", "TASK_OWNED");
    }
    const opportunity = state.opportunities.find((item) => item.id === task.opportunityId);
    if (opportunity) assertVersion(opportunity, draft.opportunityVersion);
    const values = { opportunityId: task.opportunityId, ownerTaskId: task.id };
    if (draft.action === "schedule") Object.assign(values, { id: draft.planId, subject: draft.subject, dueAt: draft.dueAt, expectedVersion: draft.planVersion });
    else if (draft.action === "record") Object.assign(values, { content: draft.content, occurredAt: draft.occurredAt, fileIds: draft.fileIds || [], expectedVersion: draft.opportunityVersion, completeId: draft.complete ? draft.planId : "" });
    else Object.assign(values, { id: draft.planId, expectedVersion: draft.planVersion });
    const applied = applyOpportunityCommand(state, { type: "followup." + draft.action, data: values }, context);
    Object.assign(state, applied.state);
    const updatedTask = state.tasks.find((item) => item.id === task.id);
    updatedTask.followupDraft = { ...draft, stage: "applied", feedback: "" };
    updatedTask.status = "可继续";
    updatedTask.messages.push({ id: crypto.randomUUID(), role: "assistant", sourceKind: "followup", at: now,
      content: draft.action === "schedule" ? "已保存下次跟进安排。" : draft.action === "cancel" ? "已取消本次跟进安排，历史记录保留。" : draft.complete ? "已保存跟进记录，并完成当前事项。" : "已保存跟进记录，当前安排未改变。" });
    updatedTask.version += 1;
    updatedTask.updatedAt = now;
    result = { ...applied.result, taskId: task.id };
  } else if (command.type === "task.update") {
    const task = state.tasks.find((item) => item.id === data.id);
    if (!task) fail("任务不存在。", "NOT_FOUND");
    const allowed = ["draft", "followupDraft", "phase", "status", "authMode", "title", "selectedCandidateIds", "sourceSignals"];
    if (!data.patch || Object.keys(data.patch).some((key) => !allowed.includes(key)))
      fail("任务变更结构不合法。", "SCHEMA");
    if (data.patch.authMode && !["confirm", "auto", "analyze"].includes(data.patch.authMode))
      fail("任务授权方式不合法。", "SCHEMA");
    if (data.patch.followupDraft != null) {
      const draft = data.patch.followupDraft;
      const keys = ["id", "stage", "action", "opportunityVersion", "planId", "planVersion", "subject", "dueAt", "content", "occurredAt", "complete", "feedback", "fileIds"];
      if (typeof draft !== "object" || Array.isArray(draft) || Object.keys(draft).some((key) => !keys.includes(key)) ||
        !["collect", "review", "declined", "applied"].includes(draft.stage) || !["schedule", "record", "cancel"].includes(draft.action) ||
        ["id", "planId", "subject", "dueAt", "content", "occurredAt"].some((key) => typeof draft[key] !== "string") || typeof draft.complete !== "boolean" ||
        ["opportunityVersion", "planVersion"].some((key) => draft[key] != null && (!Number.isInteger(draft[key]) || draft[key] < 1)) ||
        (draft.fileIds != null && (!Array.isArray(draft.fileIds) || draft.fileIds.some((id) => typeof id !== "string" || !state.files.some((file) => file.id === id)))))
        fail("跟进草稿结构不合法。", "SCHEMA");
    }
    Object.assign(task, data.patch);
    if (data.message) task.messages.push({
      id: crypto.randomUUID(), role: data.message.role === "assistant" ? "assistant" : "user",
      content: String(data.message.content || ""), fileIds: data.message.fileIds || [], at: now,
      sourceKind: ["reply", "decision", "followup"].includes(data.message.sourceKind) ? data.message.sourceKind : "task",
      contactId: typeof data.message.contactId === "string" ? data.message.contactId : "",
    });
    task.version += 1;
    task.updatedAt = now;
    result.taskId = task.id;
  } else if (command.type === "clock.set") {
    const value = new Date(data.value);
    if (!Number.isFinite(value.getTime())) fail("演示时间不合法。");
    state.clock = value.toISOString();
  } else if (command.type === "notifications.tick") {
    for (const plan of state.followups) {
      if (!activePlan(plan) || new Date(plan.dueAt).getTime() > new Date(now).getTime()) continue;
      const opportunity = state.opportunities.find((item) => item.id === plan.opportunityId);
      if (plan.ownerTaskId ? !state.tasks.some((task) => task.id === plan.ownerTaskId && !task.deletedAt) :
        !opportunity || opportunity.deletedAt || opportunity.status !== "跟进中") continue;
      plan.status = "due";
      if (plan.notifiedVersion === plan.version) continue;
      const id = "notice-" + plan.id + "-" + plan.version;
      if (!state.notifications.some((notice) => notice.id === id))
        state.notifications.unshift({
          id, followupId: plan.id, opportunityId: plan.opportunityId, taskId: plan.ownerTaskId,
          title: "招聘机会待跟进", content: (opportunity?.title || plan.opportunityTitle || "来源机会不可用") + "：" + plan.subject,
          at: now, read: false, resolved: false,
        });
      plan.notifiedVersion = plan.version;
    }
  } else if (command.type === "notification.read") {
    const notice = state.notifications.find((item) => item.id === data.id);
    if (!notice) fail("通知不存在。", "NOT_FOUND");
    notice.read = true;
  } else fail("不支持的操作：" + command.type, "SCHEMA");

  if (command.automatic && command.taskId && (result.opportunityId || result.positionId)) {
    const kind = result.positionId ? "岗位" : "招聘机会";
    const target = result.positionId ? state.positions.find((item) => item.id === result.positionId) :
      state.opportunities.find((item) => item.id === result.opportunityId);
    const id = "notice-auto-" + command.taskId + "-" + target.id + "-" + target.version;
    if (!state.notifications.some((notice) => notice.id === id)) state.notifications.unshift({
      id, kind: "asset-write", title: kind + "已自动写入", content: target.title || target.name,
      taskId: command.taskId, at: now, read: false, resolved: false,
    });
  }
  if (command.commandId) state.commands[command.commandId] = result;
  state.revision += 1;
  return { state, result };
}
