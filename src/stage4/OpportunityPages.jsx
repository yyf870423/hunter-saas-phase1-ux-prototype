import { useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ActivityTimeline, AssetPageHeader, Button, DefinitionGrid, DetailHeader, DetailTabs, FieldGroup,
  Modal, NotFoundState, SelectMenu, SourceList, StateBanner, StatusBadge, useToast } from "./asset-ui";
import { AssetRelatedTasks } from "./AssetRelatedTasks";
import { OpportunityDirections, OpportunityStatusAction } from "./OpportunityDirections";
import { displayDateTime, emptyOpportunity, FollowupRecordEditor, InitialOpportunityFollowup, localDateTime, OpportunityFields,
  OpportunityFollowupSummary, OpportunityProfileEditor, useOpportunityAction } from "./OpportunityComponents";
import { OpportunityFiles } from "./OpportunityFiles";
import { getOpportunityPermission, getOpportunityStoreError, useOpportunityState } from "./opportunity-store";
import { opportunityNow, summarizeOpportunity } from "./opportunity-domain";
import { contactRoute, useCompanyContacts } from "./company-contact-store";
import { opportunityDemoCases } from "./opportunity-demo-data";

export function OpportunityDuplicateChoice({ error, onSeparate, onUpdate }) {
  const state = useOpportunityState();
  const [selected, setSelected] = useState("");
  if (error?.code !== "DUPLICATE" || !error.details?.ids) return null;
  return <FieldGroup title="比较已有机会"><div className="s4-detail-stack">
    {error.details.ids.map((id) => {
      const item = state.opportunities.find((entry) => entry.id === id);
      return item ? <div key={id}><DefinitionGrid columns={2} items={[["机会名称", item.title], ["状态", item.status]]} />
        <p className="s4-long-copy">{item.summary}</p><p className="s4-long-copy">{item.evidence}</p>
        <Button size="sm" onClick={() => setSelected(id)}>{selected === id ? "已选中此机会" : "选择更新此机会"}</Button></div> : null;
    })}
    <div className="s4-command-actions"><Button disabled={!selected} onClick={() => onUpdate(state.opportunities.find((entry) => entry.id === selected))}>更新所选机会</Button>
      <Button onClick={onSeparate}>确认为不同需求，单独创建</Button></div>
  </div></FieldGroup>;
}

export function OpportunityCreatePage() {
  const state = useOpportunityState();
  const navigate = useNavigate();
  const notify = useToast();
  const [params] = useSearchParams();
  const context = useCompanyContacts();
  const [draft, setDraft] = useState(() => {
    const example = opportunityDemoCases.find((item) => item.id === params.get("demoCase"));
    return example ? { ...emptyOpportunity(context.companies.find((item) => item.name === example.company)?.id || ""), title: example.title, summary: example.summary, evidence: example.evidence, missing: "薪资、人数、汇报关系和到岗时间" } : emptyOpportunity(params.get("companyId") || "");
  });
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  const [followup, setFollowup] = useState(() => ({ record: false, schedule: false, content: "", occurredAt: localDateTime(opportunityNow(state)), subject: "", dueAt: "" }));
  const action = useOpportunityAction();
  const sourceId = useRef("manual-" + crypto.randomUUID());
  const save = (keepSeparate = false, target = duplicateTarget) => action.run("opportunity.save", { patch: draft, keepSeparate,
    initialRecord: followup.record ? { content: followup.content, occurredAt: followup.occurredAt } : undefined,
    initialSchedule: followup.schedule ? { subject: followup.subject, dueAt: followup.dueAt } : undefined,
    id: target?.id, expectedVersion: target?.version, source: { id: sourceId.current, kind: "manual", label: "用户手工确认", content: draft.evidence } }, {},
    (result) => { notify(result.created ? "招聘机会已创建" : "招聘机会已更新"); navigate("/opportunities/" + result.opportunityId); });
  return <div className="s4-create-page"><AssetPageHeader title="新建招聘机会" actions={<Button onClick={() => navigate(params.get("companyId") ? "/companies/" + params.get("companyId") + "?tab=recruiting" : "/opportunities")}>取消</Button>} />
    <div className="s4-create-layout s4-create-layout-direct"><section className="s4-create-workspace"><header><h2>招聘机会资料</h2></header>
      {getOpportunityStoreError() ? <StateBanner tone="danger" title={getOpportunityStoreError()} /> : null}
      <OpportunityFields value={draft} onChange={setDraft} fixedCompany={Boolean(params.get("companyId"))} errors={action.error?.details?.fields} disabled={action.busy || getOpportunityPermission()} />
      <InitialOpportunityFollowup value={followup} onChange={setFollowup} disabled={action.busy || getOpportunityPermission()} />
      {action.errorView}<OpportunityDuplicateChoice error={action.error} onSeparate={() => save(true, null)} onUpdate={(target) => { setDuplicateTarget(target); save(false, target); }} />
      <footer><Button tone="primary" disabled={action.busy || getOpportunityPermission() || Boolean(getOpportunityStoreError())} onClick={() => save()}>{action.busy ? "保存中" : "创建招聘机会"}</Button></footer>
    </section></div>
  </div>;
}

function OpportunityActivity({ opportunity }) {
  const [type, setType] = useState("全部记录");
  const [edit, setEdit] = useState(null);
  const [remove, setRemove] = useState(null);
  const action = useOpportunityAction();
  const records = opportunity.records.filter((record) => !record.deletedAt).map((record) => ({
    ...record, time: displayDateTime(record.occurredAt), sort: record.occurredAt, type: "跟进记录", source: "用户记录", editable: !record.readOnly,
  }));
  const history = opportunity.history.map((event) => ({ ...event, time: displayDateTime(event.at), sort: event.at, type: "系统变更", source: "Hunter", editable: false }));
  const items = [...records, ...history].filter((item) => type === "全部记录" || item.type === type).sort((a, b) => b.sort.localeCompare(a.sort));
  return <FieldGroup title="活动记录" action={<div className="s4-command-actions"><SelectMenu value={type} options={["全部记录", "跟进记录", "系统变更"]} onChange={setType} />
    <Button size="sm" icon="edit" disabled={getOpportunityPermission()} onClick={() => setEdit({})}>记录跟进</Button></div>}>
    {!items.length ? <StateBanner title="暂无活动记录" /> : <ActivityTimeline items={items}
      onEdit={getOpportunityPermission() ? undefined : (id) => setEdit(opportunity.records.find((record) => record.id === id))}
      onDelete={getOpportunityPermission() ? undefined : (id) => setRemove(id)}
      renderAttachments={(item) => item.fileIds?.length ? <OpportunityFiles ids={item.fileIds} readOnly /> : null} />}
    {edit ? <FollowupRecordEditor opportunity={opportunity} record={edit.id ? edit : undefined} close={() => setEdit(null)} /> : null}
    <Modal open={Boolean(remove)} close={() => setRemove(null)} title="删除跟进记录" footer={<><Button onClick={() => setRemove(null)}>取消</Button>
      <Button tone="danger" disabled={action.busy || getOpportunityPermission()} onClick={() => action.run("followup.remove", { opportunityId: opportunity.id, id: remove }, {}, () => setRemove(null))}>确认删除</Button></>}>
      <p className="s1-modal-copy">删除本条记录不会自动完成或取消未来的跟进安排。</p>{action.errorView}
    </Modal>
  </FieldGroup>;
}

export function OpportunityDetailPage() {
  const { opportunityId } = useParams();
  const state = useOpportunityState();
  const context = useCompanyContacts();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [section, setSection] = useState("");
  const [remove, setRemove] = useState(false);
  const [source, setSource] = useState(null);
  const action = useOpportunityAction();
  const opportunity = state.opportunities.find((item) => item.id === opportunityId && !item.deletedAt);
  const tab = ["profile", "directions", "work", "history"].includes(params.get("tab")) ? params.get("tab") : "profile";
  const stateMode = params.get("state");
  const retry = () => { const next = new URLSearchParams(params); next.delete("state"); setParams(next); };
  if (!opportunity) return <NotFoundState label="招聘机会" onBack={() => navigate("/opportunities")} />;
  if (stateMode === "loading") return <StateBanner title="正在加载招聘机会" icon="refresh" action={<Button onClick={retry}>重新加载</Button>} />;
  if (stateMode === "error") return <StateBanner tone="danger" title="机会资料加载失败" action={<Button onClick={retry} icon="refresh">重试</Button>} />;
  if (["permission-limited", "limited"].includes(stateMode)) return <StateBanner tone="warning" icon="lock" title="暂无权限查看机会资料" action={<Button onClick={() => navigate("/opportunities")}>返回列表</Button>} />;
  const summary = summarizeOpportunity(opportunity, state, context);
  const company = context.companies.find((item) => item.id === opportunity.companyId && !context.deletedCompanies.includes(item.id));
  const contact = context.contacts.find((item) => item.id === opportunity.contactId && item.companyId === opportunity.companyId && !item.deletedAt);
  const changeTab = (value) => { const next = new URLSearchParams(params); next.set("tab", value); next.delete("followup"); setParams(next); };
  return <div className="s4-detail-page"><DetailHeader icon="signal" title={opportunity.title} subtitle={summary.company}
    badges={[{ label: opportunity.status, tone: opportunity.status === "跟进中" ? "success" : "neutral" }, { label: summary.directions + " 个招聘方向", tone: "info" }]}
    onBack={() => navigate("/opportunities")} onDelete={getOpportunityPermission() ? undefined : () => setRemove(true)}>
    <OpportunityStatusAction opportunity={opportunity} />
  </DetailHeader>
    {getOpportunityStoreError() ? <StateBanner tone="danger" title={getOpportunityStoreError()} /> : null}
    {getOpportunityPermission() ? <StateBanner tone="warning" icon="lock" title="当前为只读权限" /> : null}
    <DetailTabs value={tab} onChange={changeTab} tabs={[{ value: "profile", label: "机会资料" }, { value: "directions", label: "招聘方向", count: summary.directions }, { value: "work", label: "关联任务" }, { value: "history", label: "活动记录" }]} />
    {tab === "profile" ? <div className="s4-detail-stack">
      <FieldGroup title="机会资料" action={<Button size="sm" icon="edit" disabled={getOpportunityPermission()} onClick={() => setSection("basic")}>编辑资料</Button>}>
        <DefinitionGrid items={[["所属公司", company ? <button type="button" className="s4-inline-link" onClick={() => navigate("/companies/" + company.id)}>{company.name}</button> : summary.company + "（已删除）"],
          ["状态", <StatusBadge tone={opportunity.status === "跟进中" ? "success" : "neutral"}>{opportunity.status}</StatusBadge>], ["预计人数", opportunity.people || "待确认"], ["预计时间", opportunity.period || "待确认"],
          ["优先级", opportunity.priority || "普通"], ["已形成岗位", summary.positions + " 个"]]} />
      </FieldGroup>
      <OpportunityFollowupSummary opportunity={opportunity} />
      <FieldGroup title="相关联系人">{contact ? <div className="s4-opportunity-contact-path"><i><Icon name="user" /></i>
        <span><b>{contact.name}{contact.role ? " · " + contact.role : ""}</b><p>{company?.name}</p><small>{contact.phone || contact.email || "尚无直接联系方式"}</small></span>
        <StatusBadge tone={contact.phone || contact.email ? "success" : "warning"}>{contact.phone || contact.email ? "已有联系方式" : "待寻找路径"}</StatusBadge>
        <div><Button size="sm" onClick={() => navigate(contactRoute(contact))}>查看联系人</Button></div>
      </div> :
        <StateBanner title="未关联联系人" action={company ? <Button size="sm" onClick={() => navigate("/companies/" + company.id + "?tab=contacts")}>前往公司联系人</Button> : null} />}</FieldGroup>
      <FieldGroup title="招聘需求摘要" action={<Button size="sm" icon="edit" disabled={getOpportunityPermission()} onClick={() => setSection("summary")}>编辑</Button>}>
        <div className="s4-detail-stack"><p className="s4-long-copy">{opportunity.summary}</p><DefinitionGrid columns={2} items={[
          ["已确认要求", <p className="s4-long-copy">{opportunity.requirements || "无补充"}</p>],
          ["待确认事项", <p className="s4-long-copy">{opportunity.missing || "暂无单独记录"}</p>],
        ]} /></div>
      </FieldGroup>
      <FieldGroup title="发现依据" action={<Button size="sm" icon="edit" disabled={getOpportunityPermission()} onClick={() => setSection("evidence")}>编辑</Button>}>
        <p className="s4-long-copy">{opportunity.evidence}</p><SourceList items={opportunity.sources.map((item) => ({ id: item.id, title: item.label,
          description: item.content, meta: displayDateTime(item.at), status: "已保存", onClick: () => setSource(item) }))} />
      </FieldGroup>
    </div> : tab === "directions" ? <OpportunityDirections opportunity={opportunity} /> : tab === "work" ? <AssetRelatedTasks assetType="opportunity" assetId={opportunity.id} /> : <OpportunityActivity opportunity={opportunity} />}
    {section ? <OpportunityProfileEditor key={section} opportunity={opportunity} section={section} close={() => setSection("")} /> : null}
    <Modal open={remove} close={() => setRemove(false)} title="删除招聘机会" footer={<><Button onClick={() => setRemove(false)}>取消</Button><Button tone="danger" disabled={action.busy || getOpportunityPermission()}
      onClick={() => action.run("opportunity.recycle", { id: opportunity.id }, {}, () => navigate("/opportunities"))}>移入回收站</Button></>}>
      <p className="s1-modal-copy">“{opportunity.title}”将进入回收站。已形成的岗位和任务会保留，机会自己的未来跟进安排将取消。</p>{action.errorView}
    </Modal>
    <Modal open={Boolean(source)} close={() => setSource(null)} title={source?.label || "需求来源"} size="lg" footer={<>
      {source?.taskId ? <Button icon="task" onClick={() => navigate("/tasks/" + source.taskId)}>返回来源任务</Button> : null}
      {source?.url ? <a className="s4-inline-link" href={source.url} target="_blank" rel="noreferrer">打开原始链接</a> : null}<Button onClick={() => setSource(null)}>关闭</Button></>}>
      <p className="s4-long-copy">{source?.content}</p>{source?.fileId ? <OpportunityFiles ids={[source.fileId]} readOnly /> : null}
    </Modal>
  </div>;
}
