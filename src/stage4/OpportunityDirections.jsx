import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, CustomCheckbox, DefinitionGrid, DetailTabs, EntitySelect, FieldGroup, FormField,
  Modal, PostWriteMatchingOptions, StateBanner, StatusBadge, TextArea, TextInput, useToast } from "./asset-ui";
import { getOpportunityPermission, runOpportunityCommand, useOpportunityState } from "./opportunity-store";
import { OpportunityDirectionFields, OpportunityJdSource, PositionFields, positionFromDirection, useOpportunityAction } from "./OpportunityComponents";
import { directionJdInfo, directionJdSource } from "./opportunity-jd";

export function OpportunityDirectionEditor({ opportunity, direction, split = false, close }) {
  const expectedVersion = useRef(opportunity.version).current;
  const [draft, setDraft] = useState({ name: direction?.name || "", requirement: direction?.requirement || "", missing: direction?.missing || "", jd: directionJdInfo(direction, opportunity).text });
  const [parts, setParts] = useState([{ name: "", requirement: "" }, { name: "", requirement: "" }]);
  const [keepSeparate, setKeepSeparate] = useState(false);
  const action = useOpportunityAction();
  const save = () => action.run(split ? "direction.split" : "direction.save", { opportunityId: opportunity.id, id: direction?.id,
    expectedVersion, patch: directionJdInfo(direction, opportunity).legacy && !draft.jd ? { name: draft.name, requirement: draft.requirement, missing: draft.missing } : draft, parts, keepSeparate }, {}, close);
  return <Modal open close={action.busy ? () => {} : close} size="lg" title={split ? "拆分招聘方向" : direction ? "编辑招聘方向" : "添加招聘方向"}
    footer={<><Button onClick={close} disabled={action.busy}>取消</Button><Button tone="primary" disabled={action.busy || getOpportunityPermission()} onClick={save}>{action.busy ? "保存中" : split ? "确认拆分" : "保存方向"}</Button></>}>
    <div className="s4-detail-stack">{split ? <>{parts.map((part, index) => <div className="s4-form-grid" key={index}>
      <FormField label={"方向 " + (index + 1)} required><TextInput value={part.name} onChange={(name) => setParts(parts.map((entry, at) => at === index ? { ...entry, name } : entry))} /></FormField>
      <FormField label="需求摘要"><TextInput value={part.requirement} onChange={(requirement) => setParts(parts.map((entry, at) => at === index ? { ...entry, requirement } : entry))} /></FormField>
      {parts.length > 2 ? <Button icon="trash" tone="danger-outline" size="sm" onClick={() => setParts(parts.filter((_, at) => at !== index))}>移除此方向</Button> : null}
    </div>)}<Button icon="plus" onClick={() => setParts([...parts, { name: "", requirement: "" }])}>添加一个方向</Button></> : <OpportunityDirectionFields value={draft} onChange={setDraft} />}{action.errorView}{action.error?.code === "DUPLICATE" ? <CustomCheckbox label="已核对，是同名的不同需求方向" checked={keepSeparate} onChange={setKeepSeparate} /> : null}</div>
  </Modal>;
}

export function OpportunityPositionConversion({ opportunity, direction, close }) {
  const expectedVersion = useRef(opportunity.version).current;
  const state = useOpportunityState();
  const navigate = useNavigate();
  const [mode, setMode] = useState("create");
  const [draft, setDraft] = useState(() => positionFromDirection(opportunity, direction));
  const [positionId, setPositionId] = useState("");
  const [match, setMatch] = useState(false);
  const [result, setResult] = useState(null);
  const action = useOpportunityAction();
  const selected = state.positions.find((position) => position.id === positionId);
  const owner = state.opportunities.find((entry) => entry.directions.some((item) => !item.archived && item.positionId === positionId));
  const positions = state.positions.filter((position) => !position.deletedAt && position.companyId === opportunity.companyId && position.status !== "已关闭");
  const save = () => action.run("position.convert", { opportunityId: opportunity.id, directionId: direction.id, expectedVersion,
    mode: mode === "existing" ? "existing" : "new", positionId, patch: draft, sources: mode === "existing" ? [] : [directionJdSource(direction, opportunity, draft.jd)] }, {}, (output) => {
      setResult(output);
      if (match && output.created) {
        try { runOpportunityCommand("position.match", { id: output.positionId, phase: "start" }); }
        catch (error) { action.setError(error); }
      }
    });
  const createAiTask = () => action.run("task.create", { kind: "position-create", title: "整理岗位：" + draft.name,
    prompt: "请根据当前招聘方向整理岗位草稿。\n招聘机会：" + opportunity.title + "\n方向：" + draft.name +
      "\n需求：" + direction.requirement + "\n发现依据：" + opportunity.evidence + "\n已取得 JD：\n" + draft.jd + "\n待确认：" + (direction.missing || opportunity.missing || "无补充"),
    opportunityId: opportunity.id, directionId: direction.id, draft, source: { ...directionJdSource(direction, opportunity, draft.jd), material: draft.jd }, allowedResults: ["position"] }, {},
    (output) => navigate("/tasks/" + output.taskId));
  const actual = result ? state.positions.find((position) => position.id === result.positionId) : null;
  return <Modal open close={action.busy ? () => {} : close} size="xl" title={result ? "岗位已形成" : "将“" + direction.name + "”形成岗位"}
    footer={result ? <><Button onClick={close}>返回招聘方向</Button><Button tone="primary" onClick={() => navigate("/positions/" + result.positionId)}>查看岗位详情</Button></> : <>
      <Button onClick={close} disabled={action.busy}>取消</Button><Button tone="primary" onClick={save} disabled={action.busy || getOpportunityPermission()}>{action.busy ? "保存中" : mode === "existing" ? "确认关联岗位" : "确认创建并关联"}</Button></>}>
    {actual ? <div className="s4-detail-stack"><DefinitionGrid items={[["正式岗位", actual.name], ["招聘公司", actual.company], ["来源机会", opportunity.title], ["岗位状态", actual.status], ["招聘任务", "尚未开始"]]} />
      {action.errorView}</div> : <div className="s4-direction-convert-workspace">
      <DetailTabs variant="inset" value={mode} onChange={setMode} tabs={[{ value: "create", label: "创建新岗位" }, { value: "existing", label: "关联已有岗位" }]} />
      {mode === "create" ? <div className="s4-detail-stack"><div className="s4-command-actions"><Button icon="sparkles" onClick={createAiTask} disabled={action.busy || getOpportunityPermission()}>AI 整理岗位</Button></div>
        <OpportunityJdSource direction={direction} opportunity={opportunity} value={draft.jd} />
        <PositionFields value={draft} onChange={(next) => { setDraft(next); action.setError(null); }} fixedCompany errors={action.error?.details?.fields} disabled={action.busy} />
        <PostWriteMatchingOptions entityType="position" enabled={match} onEnabledChange={setMatch} disabled={action.busy || getOpportunityPermission()} />
      </div> : <div className="s4-detail-stack"><FormField label="选择已有岗位" required><EntitySelect label="搜索同公司岗位" value={positionId}
        options={positions.map((position) => ({ value: position.id, label: position.name + " · " + position.status }))} onChange={setPositionId} searchable /></FormField>
        {!positions.length ? <StateBanner title="暂无可关联的同公司岗位" /> : null}
        {selected ? <><DefinitionGrid columns={2} items={[["招聘公司", selected.company], ["岗位状态", selected.status], ["工作地点", selected.location || "待确认"], ["当前主归属", owner?.title || "尚未关联"]]} />
          {selected.status === "已暂停" ? <StateBanner tone="warning" title="该岗位已暂停，关联不会恢复招聘" /> : null}
          {owner ? <StateBanner tone="warning" title="该岗位已有机会主归属" action={<Button size="sm" onClick={() => navigate("/opportunities/" + owner.id + "?tab=directions")}>查看原关系</Button>} /> : null}
          <p className="s4-long-copy">{selected.jd}</p></> : null}
      </div>}{action.errorView}
    </div>}
  </Modal>;
}

export function OpportunityStatusAction({ opportunity }) {
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const action = useOpportunityAction();
  const notify = useToast();
  const choose = (value) => { setStatus(value); setReason(""); action.setError(null); };
  return <><div className="s4-command-actions">{opportunity.status === "跟进中" ? <>
    <Button size="sm" icon="check" disabled={getOpportunityPermission()} onClick={() => choose("已完成")}>完成机会</Button>
    <Button size="sm" icon="close" disabled={getOpportunityPermission()} onClick={() => choose("已关闭")}>关闭机会</Button>
  </> : <Button icon="refresh" size="sm" disabled={getOpportunityPermission()} onClick={() => choose("跟进中")}>重新打开</Button>}</div>
    <Modal open={Boolean(status)} close={() => setStatus("")} title={status === "跟进中" ? "重新打开招聘机会" : status === "已完成" ? "完成招聘机会" : "关闭招聘机会"}
      footer={<><Button onClick={() => setStatus("")} disabled={action.busy}>取消</Button><Button tone="primary" disabled={action.busy || getOpportunityPermission()}
        onClick={() => action.run("opportunity.transition", { id: opportunity.id, status, reason, expectedVersion: opportunity.version }, {}, () => { notify("机会状态已更新"); setStatus(""); })}>{action.busy ? "保存中" : "确认"}</Button></>}>
      {status === "已完成" ? <StateBanner title="确认本轮需求交接完成" description="未处理方向需先形成岗位或停止推进。机会自己的未来跟进安排将取消，岗位招聘和已有任务保持不变。" /> :
        <FormField label={status === "跟进中" ? "重新打开原因" : "关闭原因"} required><TextArea value={reason} onChange={setReason} rows={4} /></FormField>}
      {action.errorView}
    </Modal>
  </>;
}

export function OpportunityDirections({ opportunity }) {
  const state = useOpportunityState();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const [convert, setConvert] = useState(null);
  const [manage, setManage] = useState(null);
  const [reason, setReason] = useState("");
  const action = useOpportunityAction();
  const following = opportunity.status === "跟进中";
  const disabled = !following || getOpportunityPermission();
  const directions = opportunity.directions.filter((direction) => !direction.archived);
  const openManage = (item, type) => { setManage({ item, type }); setReason(""); action.setError(null); };
  const confirmManage = () => {
    const command = manage.type === "unlink" ? "position.unlink" : manage.type === "delete" ? "direction.remove" : "direction.status";
    action.run(command, { opportunityId: opportunity.id, id: manage.item.id, directionId: manage.item.id,
      expectedVersion: opportunity.version, status: manage.type === "reopen" ? "待处理" : "不再推进", reason }, {}, () => setManage(null));
  };
  return <div className="s4-detail-stack"><FieldGroup title="招聘方向" action={<Button icon="plus" size="sm" disabled={disabled} onClick={() => setEditor({})}>添加方向</Button>}>
    {!directions.length ? <StateBanner title="尚未添加招聘方向" /> : <div className="s4-direction-list">{directions.map((direction) => {
      const position = state.positions.find((item) => item.id === direction.positionId && !item.deletedAt);
      return <article key={direction.id}><div className="s4-direction-copy"><b>{direction.name}</b><p>{direction.requirement || "需求摘要待补充"}</p>
        {direction.missing ? <p>待确认：{direction.missing}</p> : null}{direction.closeReason ? <p>{direction.closeReason}</p> : null}
        <OpportunityJdSource direction={direction} opportunity={opportunity} /></div>
        <StatusBadge tone={direction.status === "待处理" ? "warning" : direction.status === "不再推进" ? "neutral" : "success"}>{direction.status}</StatusBadge>
        <div className="s4-command-actions">{direction.positionId ? <><Button size="sm" icon="link" disabled={!position} onClick={() => navigate("/positions/" + position.id)}>{position?.name || "岗位已删除"}</Button>
          <Button size="sm" disabled={disabled} onClick={() => openManage(direction, "unlink")}>管理关联</Button></> : direction.status === "待处理" ?
          <Button size="sm" tone="primary" disabled={disabled} onClick={() => setConvert(direction)}>形成岗位</Button> : <Button size="sm" icon="refresh" disabled={disabled} onClick={() => openManage(direction, "reopen")}>重新打开方向</Button>}
          <Button size="sm" icon="edit" disabled={disabled} onClick={() => setEditor({ direction })}>编辑</Button>
          {!direction.positionId && direction.status === "待处理" ? <><Button size="sm" disabled={disabled} onClick={() => setEditor({ direction, split: true })}>拆分</Button>
            <Button size="sm" disabled={disabled} onClick={() => openManage(direction, "stop")}>不再推进</Button></> : null}
          {!direction.positionId ? <Button size="sm" tone="danger-outline" icon="trash" disabled={disabled} onClick={() => openManage(direction, "delete")}>删除方向</Button> : null}
        </div></article>;
    })}</div>}
  </FieldGroup>
    {editor ? <OpportunityDirectionEditor opportunity={opportunity} {...editor} close={() => setEditor(null)} /> : null}
    {convert ? <OpportunityPositionConversion opportunity={opportunity} direction={convert} close={() => setConvert(null)} /> : null}
    <Modal open={Boolean(manage)} close={() => setManage(null)} title={{ unlink: "解除岗位关联", delete: "删除误建方向", stop: "停止推进方向", reopen: "重新打开方向" }[manage?.type] || "处理方向"}
      footer={<><Button onClick={() => setManage(null)}>取消</Button><Button tone={manage?.type === "reopen" ? "primary" : "danger"} disabled={action.busy || getOpportunityPermission()} onClick={confirmManage}>确认</Button></>}>
      <div className="s4-detail-stack"><p className="s4-long-copy">{manage?.item.name}</p>{manage?.type === "unlink" ? <p className="s1-modal-copy">解除当前关系后，岗位和最初创建来源仍会保留。</p> : null}
      {manage?.type === "stop" ? <FormField label="不再推进原因" required><TextArea value={reason} onChange={setReason} rows={4} /></FormField> : null}{action.errorView}</div>
    </Modal>
  </div>;
}
