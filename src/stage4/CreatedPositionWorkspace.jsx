import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, DataTable, DefinitionGrid, DetailHeader, DetailTabs, EntitySelect,
  FieldGroup, FormField, Modal, SourceList, StateBanner, StatusBadge, TagList, TextArea } from "./asset-ui";
import { AssetRelatedTasks } from "./AssetRelatedTasks";
import { displayDateTime, PositionFields, useOpportunityAction } from "./OpportunityComponents";
import { getOpportunityPermission, runOpportunityCommand, useOpportunityState } from "./opportunity-store";
import { candidates } from "./data";
import { PositionTalentMap } from "./PositionTalentMap";

export function RecruitingTaskStart({ position, close }) {
  const [prompt, setPrompt] = useState("为“" + position.name + "”寻找合适候选人，先提交候选人审核，不自动联系。\n\n当前 JD：\n" + position.jd);
  const action = useOpportunityAction();
  const navigate = useNavigate();
  return <Modal open close={action.busy ? () => {} : close} title="开始找人" size="lg" footer={<><Button onClick={close} disabled={action.busy}>取消</Button>
    <Button tone="primary" icon="play" disabled={action.busy || getOpportunityPermission()} onClick={() => action.run("task.create", { kind: "recruiting", title: "招聘：" + position.name,
      prompt, positionId: position.id, authMode: "confirm", allowedResults: ["candidate"] }, {}, (result) => navigate("/tasks/" + result.taskId))}>{action.busy ? "创建中" : "创建招聘任务"}</Button></>}>
    <div className="s4-detail-stack"><DefinitionGrid columns={2} items={[["目标岗位", position.name], ["岗位版本", "v" + position.version]]} />
      <FormField label="招聘任务目标" required><TextArea value={prompt} onChange={setPrompt} rows={10} /></FormField>{action.errorView}</div>
  </Modal>;
}

function PositionEditor({ position, section, close }) {
  const expectedVersion = useRef(position.version).current;
  const [draft, setDraft] = useState(() => Object.fromEntries(["name", "companyId", "company", "location", "salary", "experience", "education", "skills", "jd", "note", "requirements"].map((key) => [key, position[key] || (key === "skills" ? [] : "")])));
  const action = useOpportunityAction();
  return <Modal open close={action.busy ? () => {} : close} title={section === "requirements" ? "编辑招聘要求" : "编辑岗位资料"} size="xl" footer={<><Button onClick={close} disabled={action.busy}>取消</Button>
    <Button tone="primary" disabled={action.busy || getOpportunityPermission()} onClick={() => action.run("position.update", { id: position.id, patch: draft, expectedVersion }, {}, close)}>{action.busy ? "保存中" : "保存修改"}</Button></>}>
    {section === "requirements" ? <FormField label="已确认招聘要求"><TextArea value={draft.requirements} onChange={(requirements) => setDraft({ ...draft, requirements })} rows={8} /></FormField> : <PositionFields value={draft} onChange={setDraft} errors={action.error?.details?.fields} disabled={action.busy} />}{action.errorView}
  </Modal>;
}

function PositionPipeline({ position }) {
  const [preview, setPreview] = useState(null);
  const [move, setMove] = useState(null);
  const [stageId, setStageId] = useState("");
  const [note, setNote] = useState("");
  const action = useOpportunityAction();
  const navigate = useNavigate();
  const moveTo = (candidateId, stage) => { setMove(candidateId); setStageId(stage); setNote(""); };
  return <div className="s4-detail-stack"><div className="s4-pipeline-board s4-lifecycle-pipeline" aria-label="候选人流程">
    {position.stages.map((stage) => {
      const records = position.pipeline.filter((item) => item.stage === stage.id);
      return <section className="s4-lifecycle-stage" key={stage.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
        event.preventDefault(); const id = event.dataTransfer.getData("application/hunter-candidate");
        if (position.pipeline.some((item) => item.candidateId === id)) moveTo(id, stage.id);
      }}><header><h2>{stage.name}</h2><StatusBadge>{records.length}</StatusBadge></header>
        {records.map((record) => {
          const candidate = candidates.find((item) => item.id === record.candidateId);
          if (!candidate) return null;
          return <article key={candidate.id} draggable={!getOpportunityPermission()} onDragStart={(event) => event.dataTransfer.setData("application/hunter-candidate", candidate.id)}>
            <button type="button" className="s4-inline-link" onClick={() => setPreview(candidate)}>{candidate.name}</button><p>{candidate.title}</p><p>{candidate.company}</p>
            <Button size="sm" icon="route" disabled={getOpportunityPermission()} onClick={() => moveTo(candidate.id, record.stage)}>变更阶段</Button>
          </article>;
        })}
        {!records.length ? <p className="s4-lifecycle-stage-empty">暂无候选人</p> : null}
      </section>;
    })}</div>
    <Modal open={Boolean(move)} close={() => setMove(null)} title="变更候选人阶段" footer={<><Button onClick={() => setMove(null)}>取消</Button><Button tone="primary" disabled={action.busy || getOpportunityPermission()}
      onClick={() => action.run("pipeline.move", { positionId: position.id, candidateId: move, stage: stageId, note }, {}, () => setMove(null))}>确认变更</Button></>}>
      <div className="s4-detail-stack"><FormField label="目标阶段"><EntitySelect value={stageId} options={position.stages.map((stage) => ({ value: stage.id, label: stage.name }))} onChange={setStageId} /></FormField>
        <FormField label="本次推进记录"><TextArea value={note} onChange={setNote} rows={4} /></FormField>{action.errorView}</div>
    </Modal>
    <Modal open={Boolean(preview)} close={() => setPreview(null)} title={preview?.name || "候选人"} size="lg" footer={<><Button onClick={() => setPreview(null)}>关闭</Button>
      <Button onClick={() => navigate("/candidates/" + preview.id)}>查看完整资料</Button></>}>
      {preview ? <DefinitionGrid columns={2} items={[["当前公司", preview.company], ["当前职位", preview.title], ["技能", <TagList items={preview.skills} />], ["地点", preview.location]]} /> : null}
    </Modal>
  </div>;
}

function PositionMatching({ position }) {
  const [selected, setSelected] = useState(new Set());
  const action = useOpportunityAction();
  const running = position.processing.find((item) => item.type === "matching" && item.status === "running");
  const latest = position.processing.find((item) => item.type === "matching");
  const rows = candidates.filter((candidate) => position.matches.includes(candidate.id));
  return <FieldGroup title="匹配结果" action={<Button icon="users" size="sm" disabled={Boolean(running) || getOpportunityPermission()} onClick={() => action.run("position.match", { id: position.id, phase: "start" })}>{running ? "匹配中" : latest ? "重新匹配" : "开始匹配"}</Button>}>
    {running ? <StateBanner icon="refresh" title="正在核对原型已有候选人资料" /> : latest?.status === "failed" ? <StateBanner tone="danger" title="本次匹配失败，岗位和既有结果未改变" description={latest.error} /> : null}
    <p>【原型说明，正式实现不展示】本地演示使用技能词交集呈现可供核对的样本，不替代真实人岗匹配模型。</p>
    <DataTable columns={[{ key: "name", label: "候选人", required: true }, { key: "title", label: "当前职位" },
      { key: "skills", label: "已有技能", render: (row) => <TagList items={row.skills} maxVisible={3} /> }]}
      rows={rows} selected={selected} onSelect={setSelected} empty={<StateBanner title={latest?.status === "complete" ? "没有匹配的已有候选人" : "尚无人岗匹配结果"} />} />
    {rows.length ? <div className="s4-command-actions"><Button tone="primary" disabled={!selected.size || action.busy || getOpportunityPermission()} onClick={() => action.run("pipeline.add", { positionId: position.id, candidateIds: [...selected] }, {}, () => setSelected(new Set()))}>审核并加入岗位储备</Button></div> : null}
    {action.errorView}
  </FieldGroup>;
}

export function CreatedPositionWorkspace({ position }) {
  const state = useOpportunityState();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [edit, setEdit] = useState("");
  const [start, setStart] = useState(false);
  const [remove, setRemove] = useState(false);
  const [versions, setVersions] = useState(false);
  const [status, setStatus] = useState("");
  const action = useOpportunityAction();
  const tab = params.get("tab") || "profile";
  const profile = params.get("profile") || "information";
  const currentOpportunity = state.opportunities.find((item) => !item.deletedAt && item.directions.some((direction) => !direction.archived && direction.positionId === position.id));
  const originOpportunity = state.opportunities.find((item) => item.id === position.origin.opportunityId && !item.deletedAt);
  const changeTab = (value) => setParams({ tab: value });
  return <div className="s4-detail-page"><DetailHeader icon="briefcase" title={position.name} subtitle={[position.company, position.location].filter(Boolean).join(" · ")}
    badges={[{ label: position.status, tone: position.status === "招聘中" ? "success" : "warning" }, { label: "岗位资料 v" + position.version, tone: "info" }]}
    onBack={() => navigate("/positions")} onDelete={getOpportunityPermission() ? undefined : () => setRemove(true)}>
    <Button icon="users" onClick={() => changeTab("matching")}>人岗匹配</Button><Button icon="sparkles" disabled={position.status !== "招聘中" || getOpportunityPermission()} onClick={() => setStart(true)}>开始找人</Button>
  </DetailHeader>
    <DetailTabs value={tab} onChange={changeTab} tabs={[{ value: "profile", label: "岗位资料" }, { value: "pipeline", label: "候选人流程", count: position.pipeline.length },
      { value: "matching", label: "匹配结果", count: position.matches.length }, { value: "talent-map", label: "人才梳理", count: position.talentMap?.rows.length || 0 }, { value: "interview", label: "面试资料" }, { value: "work", label: "关联任务" }, { value: "history", label: "处理与记录" }]} />
    {tab === "profile" ? <div className="s4-detail-stack"><DetailTabs value={profile} onChange={(value) => setParams({ tab, profile: value })} tabs={[{ value: "information", label: "岗位信息" }, { value: "analysis", label: "招聘分析" }]} />
      {profile === "analysis" ? <FieldGroup title="岗位解析"><StateBanner title="尚无已确认招聘分析" /></FieldGroup> : <>
        <FieldGroup title="岗位基本资料" action={<div className="s4-command-actions"><Button size="sm" icon="edit" disabled={getOpportunityPermission()} onClick={() => setEdit("base")}>编辑资料</Button>
          <Button size="sm" disabled={getOpportunityPermission()} onClick={() => setStatus(position.status)}>变更状态</Button></div>}>
          <DefinitionGrid items={[["招聘公司", position.companyId ? <button type="button" className="s4-inline-link" onClick={() => navigate("/companies/" + position.companyId)}>{position.company}</button> : position.company],
            ["招聘状态", <StatusBadge>{position.status}</StatusBadge>], ["工作地点", position.location || "待确认"], ["薪资范围", position.salary || "待确认"],
            ["最低工作年限", position.experience || "待确认"], ["学历要求", position.education || "待确认"], ["当前来源机会", currentOpportunity ? <button type="button" className="s4-inline-link" onClick={() => navigate("/opportunities/" + currentOpportunity.id + "?tab=directions")}>{currentOpportunity.title}</button> : "未关联"],
            ["最初创建来源", originOpportunity ? <button type="button" className="s4-inline-link" onClick={() => navigate("/opportunities/" + originOpportunity.id)}>{position.origin.label}</button> : position.origin.label]]} />
          <div className="s4-labeled-row"><b>关键技能</b><TagList items={position.skills} tone="info" /></div>
        </FieldGroup>
        <FieldGroup title="当前岗位 JD" description={"v" + position.version + " · 当前有效版本"} action={<div className="s4-command-actions"><Button icon="edit" size="sm" disabled={getOpportunityPermission()} onClick={() => setEdit("jd")}>编辑 JD</Button>
          <Button size="sm" onClick={() => setVersions(true)}>版本历史</Button></div>}><div className="s4-jd-content">{position.jd.split("\n").map((line, index) => /^(岗位职责|任职要求)$/.test(line) ? <h3 key={index}>{line}</h3> : <p key={index}>{line || " "}</p>)}</div></FieldGroup>
        <FieldGroup title="已确认招聘要求" action={<Button size="sm" icon="edit" disabled={getOpportunityPermission()} onClick={() => setEdit("requirements")}>编辑要求</Button>}><p className="s4-long-copy">{position.requirements || "暂无单独确认的招聘要求"}</p></FieldGroup>
        <FieldGroup title="用户备注"><p className="s4-long-copy">{position.note || "暂无备注"}</p></FieldGroup>
      </>}
    </div> : tab === "talent-map" ? <PositionTalentMap position={position} /> : tab === "pipeline" ? <PositionPipeline position={position} /> : tab === "matching" ? <PositionMatching position={position} /> : tab === "work" ? <AssetRelatedTasks assetType="position" assetId={position.id} /> : tab === "history" ? <div className="s4-detail-stack">
      <FieldGroup title="AI 处理记录">{!position.processing.length ? <StateBanner title="暂无 AI 处理记录" /> : <SourceList items={position.processing.map((item) => ({ id: item.id,
        title: "人岗匹配 · v" + item.version, meta: displayDateTime(item.at), description: "处理对象：" + position.name, status: { running: "运行中", complete: "已完成", failed: "失败" }[item.status], tone: item.status === "failed" ? "danger" : "info", onClick: () => changeTab("matching") }))} />}</FieldGroup>
      <FieldGroup title="创建来源"><SourceList items={position.sources.map((source) => ({ id: source.id, title: source.label, description: source.content, status: "已保存",
        onClick: source.taskId ? () => navigate("/tasks/" + source.taskId) : undefined }))} />{position.origin.taskId ? <Button icon="task" onClick={() => navigate("/tasks/" + position.origin.taskId)}>查看创建任务</Button> : <p>用户确认创建</p>}</FieldGroup>
    </div> : <FieldGroup title={tab === "talent-map" ? "人才梳理" : "面试资料"}><StateBanner title={tab === "talent-map" ? "暂无人才梳理结果" : "暂无面试资料"} /></FieldGroup>}
    {action.errorView}
    {edit ? <PositionEditor key={edit} position={position} section={edit} close={() => setEdit("")} /> : null}
    {start ? <RecruitingTaskStart position={position} close={() => setStart(false)} /> : null}
    <Modal open={versions} close={() => setVersions(false)} title="岗位版本历史" size="lg" footer={<Button onClick={() => setVersions(false)}>关闭</Button>}>
      {[{ version: position.version, jd: position.jd, at: position.updatedAt }, ...position.versions].map((version) => <div key={version.version}><h3>v{version.version} · {displayDateTime(version.at)}</h3><p className="s4-long-copy">{version.jd}</p></div>)}
    </Modal>
    <Modal open={remove} close={() => setRemove(false)} title="删除岗位" footer={<><Button onClick={() => setRemove(false)}>取消</Button><Button tone="danger" disabled={action.busy || getOpportunityPermission()} onClick={() => action.run("position.recycle", { id: position.id }, {}, () => navigate("/positions"))}>移入回收站</Button></>}>
      <p>岗位及流程记录将进入回收站，来源机会和任务不会删除。</p>{action.errorView}
    </Modal>
    <Modal open={Boolean(status)} close={() => setStatus("")} title="变更岗位状态" footer={<><Button onClick={() => setStatus("")}>取消</Button><Button tone="primary" disabled={status === position.status || action.busy || getOpportunityPermission()}
      onClick={() => action.run("position.status", { id: position.id, status }, {}, () => setStatus(""))}>确认变更</Button></>}>
      <EntitySelect value={status} options={["招聘中", "已暂停", "已关闭"].map((value) => ({ value, label: value }))} onChange={setStatus} />{action.errorView}
    </Modal>
  </div>;
}
