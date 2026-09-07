import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, CustomCheckbox, DatePicker, DefinitionGrid, DetailTabs, EntitySelect,
  FieldGroup, FormField, Modal, SelectMenu, StateBanner, StatusBadge, TextArea, TextInput, useToast,
} from "./asset-ui";
import { currentFollowup, OPPORTUNITY_FIELDS, opportunityNow, summarizeOpportunity } from "./opportunity-domain";
import { getOpportunityPermission, runOpportunityCommand, useOpportunityState } from "./opportunity-store";
import { useCompanyContacts } from "./company-contact-store";
import { OpportunityFiles } from "./OpportunityFiles";
import { directionJdInfo } from "./opportunity-jd";
import "./opportunity-components.css";

export const localDateTime = (value) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
};
export const displayDateTime = (value) => localDateTime(value) || "待确认";
export const emptyOpportunity = (companyId = "") => Object.fromEntries(OPPORTUNITY_FIELDS.map((key) => [key, key === "companyId" ? companyId : key === "priority" ? "普通" : ""]));
export const pickOpportunity = (item) => Object.fromEntries(OPPORTUNITY_FIELDS.map((key) => [key, item?.[key] || ""]));
export const positionFromDirection = (opportunity, direction) => ({
  name: direction?.name || "", companyId: opportunity?.companyId || "", company: opportunity?.company || "",
  location: direction?.location || "", salary: direction?.salary || "", experience: direction?.experience || "",
  education: direction?.education || "", skills: direction?.skills || [], jd: directionJdInfo(direction, opportunity).text, note: direction?.note || "",
});

export function OpportunityJdSource({ direction, opportunity, value }) {
  const [open, setOpen] = useState(false);
  const state = useOpportunityState();
  const info = directionJdInfo(direction, opportunity, state.positions.find((item) => item.id === direction?.positionId && !item.deletedAt));
  const changed = value !== undefined && value !== info.text;
  const source = changed ? null : info.source;
  const content = changed ? value : source?.content || info.raw;
  const label = changed ? value ? "本次用户输入 JD" : "尚未取得 JD" : info.label;
  return <><div className="s4-command-actions"><span className="s1-modal-copy">JD 来源：{label}</span>
    {content ? <Button size="sm" icon="file" onClick={() => setOpen(true)}>查看 JD 来源</Button> : null}</div>
    <Modal open={open} close={() => setOpen(false)} title={label} size="lg" footer={<Button onClick={() => setOpen(false)}>关闭</Button>}>
      <div className="s4-detail-stack">{info.legacy && !changed ? <StateBanner tone="warning" title="旧原型预置文本，仅保留历史查看，不带入新岗位" /> : null}
        <p className="s4-long-copy">{content}</p>{source?.fileId ? <OpportunityFiles ids={[source.fileId]} readOnly /> : null}
        {source?.taskId ? <a className="s2-markdown-link" href={"#/tasks/" + source.taskId}>查看来源任务</a> : null}
        {info.positionId ? <a className="s2-markdown-link" href={"#/positions/" + info.positionId}>查看岗位及来源版本</a> : null}
      </div>
    </Modal>
  </>;
}

export function useOpportunityAction() {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const run = async (type, data, options, success) => {
    if (lock.current) return null;
    lock.current = true; setBusy(true); setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 180));
      const result = runOpportunityCommand(type, data, options);
      success?.(result);
      return result;
    } catch (failure) { setError(failure); return null; }
    finally { lock.current = false; setBusy(false); }
  };
  return { error, setError, busy, run, errorView: error ? <StateBanner tone="danger" title={error.details?.fields ? "请检查标出的必填项或无效内容。" : error.message} /> : null };
}

export function OpportunityFields({ value, onChange, errors = {}, section = "all", disabled = false, previous, fixedCompany = false }) {
  const { companies, contacts, deletedCompanies } = useCompanyContacts();
  const set = (key, next) => onChange({ ...value, [key]: next });
  const old = (key) => previous && previous[key] !== value[key] ? <p className="s4-opportunity-old-value">原值：{previous[key] || "未填写"}</p> : null;
  return <fieldset className="s4-opportunity-fields" disabled={disabled}><div className="s4-form-grid">
    {["all", "basic"].includes(section) ? <>
      <FormField label="机会名称" required error={errors.title}><TextInput value={value.title} onChange={(next) => set("title", next)} />{old("title")}</FormField>
      <FormField label="所属公司" required error={errors.companyId}>{fixedCompany ? <TextInput value={companies.find((item) => item.id === value.companyId)?.name || "公司不可用"} disabled /> : <EntitySelect label="选择公司" value={value.companyId}
        options={companies.filter((item) => !deletedCompanies.includes(item.id)).map((item) => ({ value: item.id, label: item.name }))}
        onChange={(companyId) => onChange({ ...value, companyId, contactId: "" })} searchable />}</FormField>
      <FormField label="预计人数"><TextInput value={value.people} onChange={(next) => set("people", next)} placeholder="待确认" /></FormField>
      <FormField label="预计时间"><DatePicker mode="month-range" label="选择预计时间" value={value.period} onChange={(next) => set("period", next)} /></FormField>
      <FormField label="相关联系人" error={errors.contactId}><EntitySelect label="未关联联系人" value={value.contactId}
        options={[{ value: "", label: "未关联联系人" }, ...contacts.filter((item) => item.companyId === value.companyId && !item.deletedAt).map((item) => ({ value: item.id, label: item.name + (item.role ? " · " + item.role : "") }))]}
        onChange={(next) => set("contactId", next)} searchable /></FormField>
      <FormField label="优先级"><SelectMenu value={value.priority || "普通"} options={["普通", "高", "低"]} onChange={(next) => set("priority", next)} /></FormField>
    </> : null}
    {["all", "summary"].includes(section) ? <FormField label="招聘需求摘要" required span={2} error={errors.summary}>
      <TextArea value={value.summary} onChange={(next) => set("summary", next)} rows={5} />{old("summary")}</FormField> : null}
    {["all", "evidence"].includes(section) ? <FormField label="发现依据" required span={2} error={errors.evidence}>
      <TextArea value={value.evidence} onChange={(next) => set("evidence", next)} rows={4} />{old("evidence")}</FormField> : null}
    {["all", "summary"].includes(section) ? <>
      <FormField label="已确认要求" span={2}><TextArea value={value.requirements} onChange={(next) => set("requirements", next)} rows={3} /></FormField>
      <FormField label="待确认事项" span={2}><TextArea value={value.missing} onChange={(next) => set("missing", next)} rows={3} /></FormField>
    </> : null}
  </div></fieldset>;
}

export function InitialOpportunityFollowup({ value, onChange, disabled = false }) {
  const state = useOpportunityState();
  const set = (key, next) => onChange({ ...value, [key]: next });
  return <fieldset className="s4-opportunity-fields s4-initial-followup" disabled={disabled}>
    <div className="s4-initial-followup-option">
    <CustomCheckbox label="同时记录首次跟进" checked={value.record} onChange={(next) => set("record", next)} />
    {value.record ? <div className="s4-form-grid"><FormField label="实际跟进时间" required><DatePicker mode="datetime" value={value.occurredAt} onChange={(next) => set("occurredAt", next)} /></FormField>
      <FormField label="跟进内容" required span={2}><TextArea value={value.content} onChange={(next) => set("content", next)} rows={3} /></FormField></div> : null}
    </div><div className="s4-initial-followup-option">
    <CustomCheckbox label="同时安排下次跟进" checked={value.schedule} onChange={(next) => set("schedule", next)} />
    {value.schedule ? <div className="s4-form-grid"><FormField label="下次跟进事项" required><TextInput value={value.subject} onChange={(next) => set("subject", next)} /></FormField>
      <FormField label="下次跟进时间" required><DatePicker mode="datetime" value={value.dueAt} initialDate={opportunityNow(state)} onChange={(next) => set("dueAt", next)} /></FormField></div> : null}
    </div></fieldset>;
}

export function PositionFields({ value, onChange, fixedCompany = false, disabled = false, errors = {} }) {
  const { companies, deletedCompanies } = useCompanyContacts();
  const set = (key, next) => onChange({ ...value, [key]: next });
  return <fieldset className="s4-opportunity-fields" disabled={disabled}><div className="s4-form-grid">
    <FormField label="岗位名称" required error={errors.name}><TextInput value={value.name} onChange={(next) => set("name", next)} /></FormField>
    <FormField label="招聘公司" required error={errors.companyId}>{fixedCompany ? <TextInput value={value.company} disabled /> :
      <EntitySelect label="选择公司" value={value.companyId} options={companies.filter((item) => !deletedCompanies.includes(item.id)).map((item) => ({ value: item.id, label: item.name }))}
        onChange={(companyId) => onChange({ ...value, companyId, company: companies.find((item) => item.id === companyId)?.name || "" })} searchable />}</FormField>
    {!fixedCompany && !value.companyId ? <FormField label="尚未建档的招聘公司" span={2}><TextInput value={value.company} onChange={(next) => set("company", next)} /></FormField> : null}
    {[["location", "工作地点"], ["salary", "薪资范围"], ["experience", "最低工作年限"], ["education", "学历要求及弹性"]].map(([key, label]) =>
      <FormField label={label} key={key}><TextInput value={value[key]} onChange={(next) => set(key, next)} placeholder="待确认" /></FormField>)}
    <FormField label="关键技能" span={2}><SelectMenu label="关键技能" value={value.skills || []} options={value.skills || []} onChange={(next) => set("skills", next)} multiple searchable creatable /></FormField>
    <FormField label="完整岗位 JD" required span={2} error={errors.jd}><TextArea value={value.jd} onChange={(next) => set("jd", next)} rows={14} /></FormField>
    <FormField label="用户备注" span={2}><TextArea value={value.note} onChange={(next) => set("note", next)} rows={3} /></FormField>
  </div></fieldset>;
}

export function OpportunityDirectionFields({ value, onChange }) {
  return <div className="s4-form-grid">
    <FormField label="方向名称" required span={2}><TextInput value={value.name} onChange={(name) => onChange({ ...value, name })} /></FormField>
    <FormField label="需求摘要" span={2}><TextArea value={value.requirement} onChange={(requirement) => onChange({ ...value, requirement })} rows={3} /></FormField>
    <FormField label="待确认事项" span={2}><TextArea value={value.missing} onChange={(missing) => onChange({ ...value, missing })} rows={3} /></FormField>
    <FormField label="已取得的岗位 JD" span={2}><TextArea value={value.jd} onChange={(jd) => onChange({ ...value, jd })} rows={8} /></FormField>
  </div>;
}

export function OpportunityProfileEditor({ opportunity, section = "all", close }) {
  const expectedVersion = useRef(opportunity.version).current;
  const [draft, setDraft] = useState(() => pickOpportunity(opportunity));
  const [keepSeparate, setKeepSeparate] = useState(false);
  const action = useOpportunityAction();
  const notify = useToast();
  return <Modal open close={action.busy ? () => {} : close} title="编辑招聘机会" size="xl" footer={<><Button disabled={action.busy} onClick={close}>取消</Button>
    <Button tone="primary" disabled={action.busy || getOpportunityPermission()} onClick={() => action.run("opportunity.save", { id: opportunity.id, patch: draft, expectedVersion, keepSeparate }, {}, () => { notify("机会资料已保存"); close(); })}>{action.busy ? "保存中" : "保存修改"}</Button></>}>
    <OpportunityFields value={draft} onChange={setDraft} section={section} disabled={action.busy} errors={action.error?.details?.fields} />
    {action.error?.code === "DUPLICATE" ? <CustomCheckbox checked={keepSeparate} onChange={setKeepSeparate} label="已核对，这是不同的一轮需求" /> : null}
    {action.errorView}
  </Modal>;
}

export function FollowupScheduleEditor({ opportunity, plan, close, ownerTaskId = "" }) {
  const state = useOpportunityState();
  const originalPlan = useRef(plan).current;
  const [subject, setSubject] = useState(plan?.subject || "");
  const [dueAt, setDueAt] = useState(plan ? localDateTime(plan.dueAt) : "");
  const action = useOpportunityAction();
  const save = () => action.run("followup.schedule", { opportunityId: opportunity.id, id: originalPlan?.id, subject, dueAt,
    expectedVersion: originalPlan?.version, ownerTaskId }, {}, close);
  return <Modal open close={action.busy ? () => {} : close} title={plan ? "修改下次跟进" : "安排下次跟进"} footer={<>
    <Button onClick={close} disabled={action.busy}>取消</Button><Button tone="primary" onClick={save} disabled={action.busy || getOpportunityPermission()}>{action.busy ? "保存中" : "保存安排"}</Button></>}>
    <div className="s4-detail-stack"><FormField label="下次跟进事项" required><TextInput value={subject} onChange={setSubject} /></FormField>
      <FormField label="下次跟进时间" required><DatePicker mode="datetime" value={dueAt} onChange={setDueAt} initialDate={opportunityNow(state)} /></FormField>{action.errorView}</div>
  </Modal>;
}

export function FollowupRecordEditor({ opportunity, record, close, ownerTaskId = "" }) {
  const state = useOpportunityState();
  const expectedVersion = useRef(opportunity.version).current;
  const plan = useRef(currentFollowup(state, opportunity.id)).current;
  const [content, setContent] = useState(record?.content || "");
  const [occurredAt, setOccurredAt] = useState(localDateTime(record?.occurredAt || opportunityNow(state)));
  const [fileIds, setFileIds] = useState(record?.fileIds || []);
  const [complete, setComplete] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [subject, setSubject] = useState("");
  const [dueAt, setDueAt] = useState("");
  const action = useOpportunityAction();
  const taskOwned = plan?.ownerTaskId && plan.ownerTaskId !== ownerTaskId;
  const save = () => action.run("followup.record", { opportunityId: opportunity.id, id: record?.id, content, occurredAt,
    fileIds, ownerTaskId, expectedVersion, completeId: complete ? plan?.id : "",
    next: schedule ? { subject, dueAt, ownerTaskId } : undefined }, {}, close);
  return <Modal open close={action.busy ? () => {} : close} size="lg" title={record ? "编辑跟进记录" : "记录本次跟进"} footer={<>
    <Button onClick={close} disabled={action.busy}>取消</Button><Button tone="primary" onClick={save} disabled={action.busy || getOpportunityPermission()}>{action.busy ? "保存中" : complete ? "保存并完成本次跟进" : "保存记录"}</Button></>}>
    <div className="s4-detail-stack"><FormField label="实际跟进时间" required><DatePicker mode="datetime" value={occurredAt} onChange={setOccurredAt} /></FormField>
      <FormField label="跟进内容" required><TextArea value={content} onChange={setContent} rows={6} /></FormField>
      <OpportunityFiles ids={fileIds} onChange={setFileIds} readOnly={action.busy} />
      {plan && !record ? <CustomCheckbox checked={complete} disabled={Boolean(taskOwned)} onChange={(checked) => { setComplete(checked); if (!checked) setSchedule(false); }} label={"完成当前事项：" + plan.subject} /> : null}
      {taskOwned ? <StateBanner title="当前事项由原任务维护" description="本次可单独保存记录；完成和改期请返回原任务。" /> : null}
      {!record && !taskOwned && (ownerTaskId || opportunity.status === "跟进中") ? <CustomCheckbox checked={schedule} disabled={Boolean(plan && !complete)} onChange={setSchedule} label="安排下一次跟进" /> : null}
      {schedule ? <><FormField label="下次跟进事项" required><TextInput value={subject} onChange={setSubject} /></FormField>
        <FormField label="下次跟进时间" required><DatePicker mode="datetime" value={dueAt} onChange={setDueAt} initialDate={opportunityNow(state)} /></FormField></> : null}
      {action.errorView}</div>
  </Modal>;
}

export function OpportunityFollowupSummary({ opportunity, ownerTaskId = "" }) {
  const state = useOpportunityState();
  const context = useCompanyContacts();
  const navigate = useNavigate();
  const summary = summarizeOpportunity(opportunity, state, context);
  const plan = summary.followup;
  const [editor, setEditor] = useState("");
  const action = useOpportunityAction();
  const taskOwned = plan?.ownerTaskId && plan.ownerTaskId !== ownerTaskId;
  const following = Boolean(ownerTaskId) || opportunity.status === "跟进中";
  return <FieldGroup title="持续跟进" action={<Button size="sm" icon="edit" disabled={getOpportunityPermission()} onClick={() => setEditor("record")}>记录跟进</Button>}>
    <DefinitionGrid items={[["当前事项", plan?.subject || "未安排"], ["下次跟进", plan ? displayDateTime(plan.dueAt) : "未安排"],
      ["提醒状态", <StatusBadge tone={summary.followupStatus === "待跟进" ? "warning" : "neutral"}>{summary.followupStatus}</StatusBadge>],
      ["最近跟进", summary.lastFollowupAt ? displayDateTime(summary.lastFollowupAt) : "尚无跟进记录"]]} />
    <div className="s4-command-actions">
      {taskOwned ? <Button icon="route" onClick={() => navigate("/tasks/" + plan.ownerTaskId)}>返回原任务处理</Button> : <>
        {following ? <Button size="sm" icon="calendar" disabled={getOpportunityPermission()} onClick={() => setEditor("schedule")}>{plan ? "修改下次跟进" : "安排下次跟进"}</Button> : null}
        {plan ? <Button size="sm" tone="danger-outline" onClick={() => setEditor("cancel")}>取消安排</Button> : null}
      </>}
    </div>
    {editor === "record" ? <FollowupRecordEditor opportunity={opportunity} ownerTaskId={ownerTaskId} close={() => setEditor("")} /> : null}
    {editor === "schedule" ? <FollowupScheduleEditor opportunity={opportunity} plan={plan} ownerTaskId={ownerTaskId} close={() => setEditor("")} /> : null}
    <Modal open={editor === "cancel"} close={() => setEditor("")} title="取消下次跟进" footer={<><Button onClick={() => setEditor("")}>保留安排</Button><Button tone="danger" disabled={action.busy || getOpportunityPermission()} onClick={() => action.run("followup.cancel", { id: plan?.id, ownerTaskId }, {}, () => setEditor(""))}>确认取消</Button></>}>
      <p>{plan?.subject}，{displayDateTime(plan?.dueAt)}</p>{action.errorView}
    </Modal>
  </FieldGroup>;
}

export function TaskOpportunityFollowup({ task }) {
  const state = useOpportunityState();
  const action = useOpportunityAction();
  const opportunity = state.opportunities.find((item) => item.id === task.opportunityId);
  if (opportunity) return <>{opportunity.deletedAt ? <StateBanner tone="warning" title="来源机会已进入回收站，任务跟进仍然保留" /> : null}
    <OpportunityFollowupSummary opportunity={opportunity} ownerTaskId={task.id} /></>;
  const plans = state.followups.filter((plan) => plan.ownerTaskId === task.id && ["pending", "due"].includes(plan.status));
  if (!plans.length) return null;
  return <FieldGroup title="持续跟进"><StateBanner tone="warning" title="来源机会已永久删除" description="任务安排仍保留，可取消；不能向已删除的机会追加记录。" />
    {plans.map((plan) => <div key={plan.id}><p>{plan.subject}，{displayDateTime(plan.dueAt)}</p>
      <Button size="sm" tone="danger-outline" disabled={action.busy || getOpportunityPermission()} onClick={() => action.run("followup.cancel", { id: plan.id, ownerTaskId: task.id })}>取消安排</Button></div>)}{action.errorView}
  </FieldGroup>;
}

export function OpportunityComponentsPreview() {
  const [state, setState] = useState("normal");
  const [draft, setDraft] = useState({ ...emptyOpportunity("company-xinglan"), title: "团队扩建需求", summary: "客户确认新增机器人研发方向", evidence: "招聘负责人电话确认" });
  const [time, setTime] = useState("2026-09-09 10:17");
  return <section className="s1-component-section"><h2>招聘机会闭环</h2>
    <p>【原型说明，正式实现不展示】公共机会表单、时间输入与反馈状态预览，不写入资产。</p>
    <DetailTabs value={state} onChange={setState} tabs={[["normal", "正常"], ["loading", "加载中"], ["empty", "空状态"], ["error", "错误"], ["disabled", "禁用"], ["permission-limited", "权限受限"]].map(([value, label]) => ({ value, label }))} />
    {state === "loading" ? <StateBanner title="正在保存机会资料" icon="refresh" /> : state === "empty" ? <StateBanner title="尚未安排下次跟进" /> :
      state === "permission-limited" ? <StateBanner title="暂无修改权限" icon="lock" tone="warning" /> : <>
        <OpportunityFields value={draft} onChange={setDraft} disabled={state === "disabled"} errors={state === "error" ? { evidence: "请说明需求确认依据" } : {}} />
        <FormField label="下次跟进时间"><DatePicker mode="datetime" value={time} onChange={setTime} /></FormField>
        {state === "error" ? <StateBanner tone="danger" title="保存失败，输入已保留，请重试。" /> : null}
      </>}
  </section>;
}
