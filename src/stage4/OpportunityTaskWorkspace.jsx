import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Composer, HunterReply, PlanList, UserMessage, WorkHistory } from "../stage2/automation-ui";
import { TaskAreaNav } from "../stage2/TaskAreaNav";
import { workItems } from "../stage2/data";
import { Button, DataTable, DefinitionGrid, FieldGroup, Modal, StateBanner, StatusBadge, TagList } from "./asset-ui";
import { candidates } from "./data";
import { displayDateTime, useOpportunityAction } from "./OpportunityComponents";
import { OpportunityFiles } from "./OpportunityFiles";
import { getOpportunityContext, getOpportunityPermission, getOpportunitySnapshot, runOpportunityCommand, useOpportunityState } from "./opportunity-store";
import { advanceLifecycleTask, collectTaskAttachments, respondToSingleAssetDraft, respondToTaskFollowup, respondToTaskFollowupFiles, taskAuthorization } from "./opportunity-task-adapter";
import { draftSummaryMarkdown, markdownText, writeResultMarkdown } from "./opportunity-task-markdown";
import { activeTaskPlan, missingFollowupField } from "./task-followup";

export function TaskOpportunityFollowup({ task }) {
  const state = useOpportunityState();
  const opportunity = state.opportunities.find((item) => item.id === task.opportunityId);
  const plan = activeTaskPlan(state, task);
  const draft = task.followupDraft;
  const lastRecord = opportunity?.records.filter((record) => !record.deletedAt).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
  const lines = ["## 持续跟进", plan ? "- 当前事项：" + markdownText(plan.subject) + "\n- 下次跟进：" + displayDateTime(plan.dueAt) + "\n- 提醒状态：" + (new Date(plan.dueAt) <= new Date(state.clock || Date.now()) ? "待跟进" : "已安排") : "目前没有待执行的跟进安排。",
    lastRecord ? "最近跟进：" + displayDateTime(lastRecord.occurredAt) + "\n\n" + markdownText(lastRecord.content) : "尚无跟进记录。"];
  if (!opportunity) lines.push("> 来源机会已永久删除。已有安排仍保留，可取消；不能追加跟进记录或新安排。");
  else if (opportunity.deletedAt) lines.push("> 来源机会已进入回收站，原任务仍可维护已有跟进。");
  if (plan?.ownerTaskId && plan.ownerTaskId !== task.id) lines.push("该事项由其他任务维护。[返回原任务处理](#/tasks/" + encodeURIComponent(plan.ownerTaskId) + ")");
  else if (draft && ["collect", "review", "declined"].includes(draft.stage)) {
    lines.push("### " + ({ schedule: "待确认的跟进安排", record: "待确认的跟进记录", cancel: "待确认的取消安排" }[draft.action]));
    if (draft.action === "schedule") lines.push("- 跟进事项：" + markdownText(draft.subject || "待补充") + "\n- 跟进时间：" + (draft.dueAt ? displayDateTime(draft.dueAt) : "待补充"));
    else if (draft.action === "record") lines.push("- 跟进内容：" + markdownText(draft.content || "待补充") + "\n- 实际跟进时间：" + (draft.occurredAt ? displayDateTime(draft.occurredAt) : "待补充") + "\n- 完成当前事项：" + (draft.complete ? "是" : "否"));
    else lines.push("取消“" + markdownText(plan?.subject || "已失效的安排") + "”；历史跟进记录仍保留。");
    if (draft.feedback) lines.push("> " + markdownText(draft.feedback));
    if (draft.fileIds?.length) lines.push("附件：" + draft.fileIds.map((id) => markdownText(state.files.find((file) => file.id === id)?.name || "已保留附件")).join("、"));
    const question = { subject: "下次需要跟进什么事项？", dueAt: "安排在什么时间？", content: "这次实际跟进了什么内容？", occurredAt: "这次实际跟进发生在什么时间？" }[missingFollowupField(draft)];
    lines.push(question || "是否执行以上操作？请回复“是”“否”，或提出修改建议。");
  } else lines.push(draft?.stage === "applied" ? "可以继续补充新的跟进记录，或提出改期、取消安排。" : plan ? "可以提出修改下次跟进、记录本次跟进或取消安排；确认前不会改变已有记录。" : opportunity ? "是否安排一次后续跟进？请回复“是”“否”，或提出建议。" : "需要取消保留的安排时，请说明取消安排。");
  return <HunterReply markdown={lines.join("\n\n")} />;
}

export function OpportunityWriteResult({ result, taskId }) {
  const state = useOpportunityState();
  return <HunterReply markdown={writeResultMarkdown(result, state) + (taskId ? "\n\n[返回来源任务](#/tasks/" + encodeURIComponent(taskId) + ")" : "")} />;
}

export function RecruitingCandidateReview({ task }) {
  const state = useOpportunityState();
  const navigate = useNavigate();
  const action = useOpportunityAction();
  const [selected, setSelected] = useState(new Set(task.selectedCandidateIds || []));
  const [preview, setPreview] = useState(null);
  const position = state.positions.find((item) => item.id === task.positionId && !item.deletedAt);
  if (!position) return <StateBanner tone="danger" title="目标岗位不存在或已删除" />;
  const rows = candidates.filter((candidate) => !position.pipeline.some((entry) => entry.candidateId === candidate.id));
  const select = (next) => {
    setSelected(next);
    try { runOpportunityCommand("task.update", { id: task.id, patch: { selectedCandidateIds: [...next] } }); }
    catch (error) { action.setError(error); }
  };
  return <FieldGroup title="候选人审核"><div className="s4-detail-stack">
    {task.positionVersion !== position.version ? <StateBanner tone="warning" title={"岗位已更新为 v" + position.version + "，本任务仍基于 v" + task.positionVersion} description={position.jd}
      action={<Button disabled={action.busy || getOpportunityPermission()} onClick={() => action.run("task.refresh-position", { id: task.id }, {}, () => setSelected(new Set()))}>核对并采用当前 JD</Button>} /> : null}
    <p>【原型说明，正式实现不展示】本次展示原型中已有候选人的资料，不执行外部寻访或发送联系消息。</p>
    <DataTable rows={rows} columns={[{ key: "name", label: "候选人", required: true }, { key: "title", label: "当前职位" },
      { key: "skills", label: "已有技能", render: (row) => <TagList items={row.skills} maxVisible={3} /> }, { key: "location", label: "地点" }]}
      selected={selected} onSelect={select} onRow={setPreview} empty={<StateBanner title="本轮候选人均已进入岗位流程" />} />
    {action.errorView}<div className="s4-command-actions"><Button icon="chevronRight" onClick={() => navigate("/positions/" + position.id + "?tab=pipeline")}>查看岗位流程</Button>
      <Button tone="primary" disabled={!selected.size || action.busy || task.positionVersion !== position.version || position.status !== "招聘中" || task.authMode === "analyze" || getOpportunityPermission()} onClick={() => action.run("recruiting.review", {
        taskId: task.id, positionId: position.id, candidateIds: [...selected] }, {}, () => setSelected(new Set()))}>将所选候选人加入岗位储备</Button></div>
    <Modal open={Boolean(preview)} close={() => setPreview(null)} title={preview?.name || "候选人资料"} size="lg" footer={<><Button onClick={() => setPreview(null)}>关闭</Button>
      <Button icon="chevronRight" onClick={() => navigate("/candidates/" + preview.id)}>查看完整资料</Button></>}>
      {preview ? <DefinitionGrid columns={2} items={[["当前公司", preview.company], ["当前职位", preview.title], ["技能", <TagList items={preview.skills} />], ["地点", preview.location], ["学历", preview.education], ["经验", preview.experience]]} /> : null}
    </Modal>
  </div></FieldGroup>;
}

export function SingleAssetTaskSummary({ task, askConfirmation = true }) {
  const state = useOpportunityState();
  return <>
    {["review", "cancelled"].includes(task.phase) ? <HunterReply markdown={draftSummaryMarkdown(task, { ...state, ...getOpportunityContext() }, askConfirmation)} /> : null}
  </>;
}

export function OpportunityTaskWorkspace({ taskId }) {
  const state = useOpportunityState();
  const task = state.tasks.find((item) => item.id === taskId);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [value, setValue] = useState(params.get("input") || "");
  const [attachments, setAttachments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const preparing = useRef(false);
  const timelineRef = useRef(null);
  const opportunity = state.opportunities.find((item) => item.id === task?.opportunityId && !item.deletedAt);
  const sourcePosition = state.positions.find((item) => item.id === task?.positionId && !item.deletedAt);
  useEffect(() => {
    timelineRef.current?.lastElementChild?.scrollIntoView({ block: "nearest" });
  }, [task?.phase, task?.messages.length]);

  const prepare = () => {
    const latest = getOpportunitySnapshot().tasks.find((item) => item.id === taskId);
    if (!latest || preparing.current) return;
    preparing.current = true;
    setError("");
    try {
      setError(advanceLifecycleTask(taskId));
    } catch (failure) { setError(failure.message); }
    finally { preparing.current = false; }
  };
  useEffect(() => {
    if (task?.phase !== "input") return undefined;
    const timer = setTimeout(prepare, 500);
    return () => clearTimeout(timer);
  }, [taskId, task?.phase]);

  async function send(text, files) {
    if (busy || (!text.trim() && !files.length)) return;
    setBusy(true); setError("");
    try {
      if (files.length && await respondToTaskFollowupFiles(taskId, text, files)) {
        setValue(""); setAttachments([]); return;
      }
      if (!files.length && (respondToTaskFollowup(taskId, text) || respondToSingleAssetDraft(taskId, text))) {
        setValue(""); setAttachments([]); return;
      }
      const collected = await collectTaskAttachments(files);
      runOpportunityCommand("task.update", { id: task.id, patch: { phase: "input", followupDraft: null, status: "运行中", ...(task.phase === "result" ? { draft: null } : {}) },
        message: { role: "user", content: [text, collected.material, ...collected.warnings].filter(Boolean).join("\n\n"), fileIds: collected.fileIds } });
      setValue(""); setAttachments([]);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  const updateAuthorization = (mode) => {
    try { runOpportunityCommand("task.update", { id: task.id, patch: { authMode: taskAuthorization(mode) } }); }
    catch (failure) { setError(failure.message); }
  };
  if (!task) return <StateBanner tone="danger" title="任务不存在" action={<Button onClick={() => navigate("/tasks")}>返回全部任务</Button>} />;
  const actualResults = task.results.filter((result) => ["opportunity", "position"].includes(result.type));
  const pipelineResults = task.results.filter((result) => result.type === "pipeline");
  return <div className="s2-page s2-workspace"><WorkHistory items={workItems} currentId={task.id} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onCreate={() => navigate("/new")} onSelect={(item) => navigate("/tasks/" + item.id)} />
    <section className="s2-workstream-main s2-task-detail-page"><TaskAreaNav value="tasks" />
      <header className="s2-detail-header"><button type="button" onClick={() => navigate("/tasks")}><Icon name="chevronLeft" />返回全部任务</button>
        <div><h1>{task.title}</h1><p>{opportunity?.title || sourcePosition?.name || "招聘需求处理"}</p></div><StatusBadge tone={task.phase === "result" ? "success" : "warning"}>{task.status}</StatusBadge></header>
      <div className="s2-task-detail-layout"><section className="s2-task-conversation"><div className="s2-task-timeline" ref={timelineRef}>
        <p>【原型说明，正式实现不展示】使用本地输入与显式字段演示资料整理；未调用生产 Agent，不读取外部邮箱或发送邮件。</p>
        {task.source?.kind === "signal" ? <HunterReply markdown={"[查看来源洞察](#/signals?signal=" + encodeURIComponent(task.source.id) + ")"} /> : null}
        {task.messages.map((message) => message.role === "user" ? <div key={message.id}><UserMessage time={displayDateTime(message.at)}>{message.content}</UserMessage>
          {message.fileIds?.length ? <OpportunityFiles ids={message.fileIds} readOnly /> : null}</div> : <HunterReply key={message.id} markdown={message.content} />)}
        {task.phase === "input" ? <HunterReply streaming markdown="正在整理输入与来源资料。" /> : null}
        {task.kind === "recruiting" && ["candidate-review", "result"].includes(task.phase) ? <RecruitingCandidateReview task={task} /> : null}
        {actualResults.map((result, index) => <OpportunityWriteResult key={result.type + result.id + index} result={result} />)}
        {["opportunity", "position-create"].includes(task.kind) ? <SingleAssetTaskSummary task={task} /> : null}
        {pipelineResults.map((result, index) => <HunterReply key={index} markdown={"已将 " + result.candidateIds.map((id) => candidates.find((candidate) => candidate.id === id)?.name || id).join("、") + " 加入岗位储备。未发送联系消息。"} />)}
        {task.opportunityId && task.kind === "opportunity" && task.phase === "result" ? <TaskOpportunityFollowup task={task} /> : null}
        {error ? <><HunterReply markdown={"> " + markdownText(error)} />{task.phase === "input" ? <Button icon="refresh" onClick={prepare}>重试整理</Button> : null}</> : null}
      </div><div className="s2-task-composer-dock"><div className="s2-task-plan"><Button size="sm" icon="task" onClick={() => setPlanOpen(!planOpen)}>{planOpen ? "收起执行计划" : "执行计划"}</Button>
        {planOpen ? <PlanList steps={[{ id: "input", title: "读取任务输入与来源", status: "done", detail: "原始文字与附件已保存" },
          { id: "draft", title: task.kind === "recruiting" ? "整理候选人资料" : "核对并整理资料草稿", status: task.phase === "input" ? "running" : "done" },
          { id: "write", title: task.kind === "recruiting" ? "审核后加入岗位储备" : "按授权写入正式结果", status: task.results.length ? "done" : "waiting-user" }]} /> : null}</div>
        <Composer value={value} onChange={setValue} onSend={send} authMode={task.authMode === "analyze" ? "analysis" : task.authMode} onAuthChange={updateAuthorization}
          attachments={attachments} onAttachmentsChange={setAttachments} disabled={busy || getOpportunityPermission()} placeholder="补充需求、客户回复或新的依据" />
      </div></section></div>
    </section>
  </div>;
}

export function LegacyOpportunityResult({ taskId, showFollowup = true, awaitingContinuation = false }) {
  const state = useOpportunityState();
  const task = state.tasks.find((item) => item.id === taskId);
  const [error, setError] = useState("");
  useEffect(() => {
    if (task?.phase !== "input") return undefined;
    const timer = setTimeout(() => {
      try { setError(advanceLifecycleTask(taskId)); }
      catch (failure) { setError(failure.message); }
    }, 300);
    return () => clearTimeout(timer);
  }, [taskId, task?.phase]);
  if (!task) return <HunterReply markdown="尚无可整理的客户回复。" />;
  return <>
    {task.messages.slice(1).map((message) => message.role === "user" ? <div key={message.id}><UserMessage>{message.content}</UserMessage>
      {message.fileIds?.length ? <OpportunityFiles ids={message.fileIds} readOnly /> : null}</div> : <HunterReply key={message.id} markdown={message.content} />)}
    {task.phase === "input" ? <HunterReply streaming markdown="正在整理招聘需求与来源资料。" /> : null}
    {task.results.filter((result, index, items) => result.type === "opportunity" && items.findLastIndex((item) => item.type === "opportunity" && item.id === result.id) === index).map((result) => <OpportunityWriteResult key={result.id + "-" + result.version} result={result} />)}
    <SingleAssetTaskSummary task={task} askConfirmation={!(awaitingContinuation && task.phase === "cancelled")} />
    {showFollowup && task.opportunityId && task.phase === "result" ? <TaskOpportunityFollowup task={task} /> : null}
    {error ? <HunterReply markdown={"> " + markdownText(error)} /> : null}
  </>;
}
