import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Composer, HunterReply, TaskActivity, UserMessage } from "../stage2/automation-ui";
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
import { displayDraftConfirmation } from "./single-asset-confirmation";
import { TaskReadingWorkspace } from "../stage2/TaskReadingWorkspace";
import { TaskTimeline } from "../stage2/TaskConversation";
import { TASK_DEMO_TURN_MS } from "../stage2/task-timing";
import { TaskResultReader } from "../stage2/TaskResultReader";
import { InspectionPanel } from "../stage2/ReviewWorkspace";
import { executionApprovalKey, TaskExecutionApproval } from "../stage2/TaskExecutionApproval";
import { validateOpportunity, validatePosition } from "./opportunity-domain";

export function TaskOpportunityFollowup({ task, hasUnsentChanges = false }) {
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
    lines.push(question || "可点击下方业务确认按钮，或在原对话提出修改建议。");
  } else lines.push(draft?.stage === "applied" ? "可以继续补充新的跟进记录，或提出改期、取消安排。" : plan ? "可以提出修改下次跟进、记录本次跟进或取消安排；确认前不会改变已有记录。" : opportunity ? "是否安排一次后续跟进？请回复“是”“否”，或提出建议。" : "需要取消保留的安排时，请说明取消安排。");
  const ready = draft?.stage === "review" && !missingFollowupField(draft);
  const key = executionApprovalKey(task.id, draft);
  const decide = (decision, requestKey, event) => {
    const latest = getOpportunitySnapshot().tasks.find(item => item.id === task.id);
    if (!latest || executionApprovalKey(task.id, latest.followupDraft) !== requestKey) throw Error("跟进范围已变化，请先核对新版摘要。");
    respondToTaskFollowup(task.id, decision === "approve" ? "确认" : "否", undefined, event);
    const after = getOpportunitySnapshot().tasks.find(item => item.id === task.id);
    if (decision === "approve" && after?.followupDraft?.stage !== "applied") throw Error(after?.followupDraft?.feedback || "本次安排未能执行，请核对后重试。");
  };
  return <><HunterReply markdown={lines.join("\n\n")} />{ready ? <TaskExecutionApproval key={key} requestKey={key}
    action={({ schedule: "followup", record: "followup-record", cancel: "followup-cancel" })[draft.action]}
    scope={["所属招聘机会：" + (opportunity?.name || "已删除的机会"), ({ schedule: `事项：${draft.subject}；时间：${displayDateTime(draft.dueAt)}（${Intl.DateTimeFormat().resolvedOptions().timeZone}）。`, record: "保存以上跟进记录" + (draft.complete ? "，并完成当前跟进事项。" : "，不改变当前安排。"), cancel: `取消‘${plan?.subject || "已失效的安排"}’${plan?.dueAt ? `（${displayDateTime(plan.dueAt)}）` : ""}，保留历史记录。` })[draft.action]]}
    boundary="仅更新所属任务内的跟进安排或记录，不自动联系客户。"
    authMode={task.authMode} hasUnsentChanges={hasUnsentChanges}
    disabledReason={getOpportunityPermission() ? "当前工作空间不能执行写入。" : ""}
    onApprove={(requestKey, event) => decide("approve", requestKey, event)} onDecline={(requestKey, event) => decide("decline", requestKey, event)} /> : null}</>;
}

export function OpportunityWriteResult({ result, taskId }) {
  const state = useOpportunityState();
  return <HunterReply markdown={writeResultMarkdown(result, state) + (taskId ? "\n\n[返回来源任务](#/tasks/" + encodeURIComponent(taskId) + ")" : "")} />;
}

export function RecruitingCandidateReview({ task, onOpen }) {
  const state = useOpportunityState();
  const position = state.positions.find((item) => item.id === task.positionId && !item.deletedAt);
  if (!position) return <StateBanner tone="danger" title="目标岗位不存在或已删除" />;
  return <HunterReply markdown={`## 人选结果已整理\n\n基于岗位v${task.positionVersion}；${task.positionVersion !== position.version ? `当前岗位已更新为v${position.version}，旧确认不能用于新要求。` : "没有自动加入岗位储备或联系。"}\n\n可在原对话说明要保留或核实哪些人。`}><Button icon="users" onClick={onOpen}>查看人选结果</Button></HunterReply>;
}

export function SingleAssetTaskSummary({ task, askConfirmation = true, confirmationReply = "是", hasUnsentChanges = false }) {
  const state = useOpportunityState();
  const [recheckError, setRecheckError] = useState("");
  const key = executionApprovalKey(task.id, [task.phase, task.draft]);
  const validation = task.draft ? (task.kind === "position-create" ? validatePosition(task.draft.patch || {}, { ...state, ...getOpportunityContext() }, Boolean(task.opportunityId)) : validateOpportunity(task.draft.patch || {}, { ...state, ...getOpportunityContext() })) : {};
  const previous = task.kind === "position-create" ? state.positions.find(item => item.id === task.draft?.positionId) : state.opportunities.find(item => item.id === task.draft?.opportunityId);
  const stale = previous && task.draft?.expectedVersion !== previous.version;
  const decide = (decision, requestKey, event) => {
    const latest = getOpportunitySnapshot().tasks.find(item => item.id === task.id);
    if (!latest || executionApprovalKey(task.id, [latest.phase, latest.draft]) !== requestKey || latest.phase !== "review") throw Error("草稿已变化或本次请求已处理，请先核对当前摘要。");
    const outcome = respondToSingleAssetDraft(task.id, decision === "approve" ? "确认" : "否", event);
    const after = getOpportunitySnapshot().tasks.find(item => item.id === task.id);
    if (decision === "approve" && after?.phase !== "result") throw Error(after?.draft?.feedback || outcome?.content || "本次写入未完成，请核对摘要后重试。");
  };
  return <>
    {["review", "cancelled"].includes(task.phase) ? <HunterReply markdown={draftSummaryMarkdown(task, { ...state, ...getOpportunityContext() }, false, confirmationReply)} /> : null}
    {askConfirmation && task.phase === "review" && task.draft ? <TaskExecutionApproval key={key} requestKey={key}
      action={task.draft.expectedVersion ? "update" : task.kind === "position-create" ? "position" : "opportunity"}
      scope={[`${task.kind === "position-create" ? "岗位" : "招聘机会"}：${task.draft.patch?.name || task.draft.patch?.title || "待补充名称"}`, task.draft.expectedVersion ? `基于原资料 v${task.draft.expectedVersion} 应用上方修改。` : "按以上摘要创建一份正式资料。"]}
      authMode={task.authMode} hasUnsentChanges={hasUnsentChanges}
      boundary={task.kind === "position-create" ? "保存到岗位列表，不自动启动找人或匹配，不发送邮件。" : "保存到招聘机会列表；未核实的 HC、预算、合作意愿与完整 JD 仍待核实，不创建岗位、联系人或发送邮件。"}
      disabledReason={getOpportunityPermission() ? "当前工作空间不能执行写入。" : stale ? "资料版本已变化，请先重新核对草稿。" : task.draft.companyConflict || Object.values(validation)[0] || (task.draft.invalidDirections ? "招聘方向结构不完整，请先补充有效资料。" : "")}
      onApprove={(requestKey, event) => decide("approve", requestKey, event)} onDecline={(requestKey, event) => decide("decline", requestKey, event)} /> : null}
    {task.phase === "cancelled" || stale ? <Button icon="refresh" disabled={getOpportunityPermission() || hasUnsentChanges} onClick={() => {
      setRecheckError("");
      try { respondToSingleAssetDraft(task.id, "重新核对"); }
      catch (failure) { setRecheckError(failure.message || "草稿重新核对失败，请稍后重试。"); }
    }}>重新核对草稿</Button> : null}
    {recheckError ? <StateBanner tone="danger" title={recheckError} /> : null}
  </>;
}

export function OpportunityTaskWorkspace({ taskId }) {
  const state = useOpportunityState();
  const task = state.tasks.find((item) => item.id === taskId);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get("input") || "");
  const [attachments, setAttachments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inspection, setInspection] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [reserveDraft, setReserveDraft] = useState(null);
  const preparing = useRef(false);
  const initialPreparation = useRef(null);
  const [outputBusy, setOutputBusy] = useState(false);
  const [generationStopped, setGenerationStopped] = useState(false);
  if (task && initialPreparation.current?.id !== taskId) initialPreparation.current = { id: taskId, pending: task.phase === "input" };
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
    finally { preparing.current = false; initialPreparation.current.pending = false; }
  };
  useEffect(() => {
    if (task?.phase !== "input" || outputBusy || generationStopped) return undefined;
    const timer = setTimeout(prepare, initialPreparation.current?.pending ? TASK_DEMO_TURN_MS : 0);
    return () => clearTimeout(timer);
  }, [taskId, task?.phase, outputBusy, generationStopped]);

  async function send(text, files, { approval = false, decisionEvent } = {}) {
    if (busy || (!text.trim() && !files.length)) return;
    if (task.phase === "input") initialPreparation.current.pending = false;
    setGenerationStopped(false);
    setBusy(true); setError("");
    try {
      if (task.kind === "recruiting" && task.phase !== "input" && !files.length) {
        const message = content => runOpportunityCommand("task.update", { id: task.id, patch: {}, message: { role: "assistant", content } });
        runOpportunityCommand("task.update", { id: task.id, patch: {}, message: { role: "user", content: decisionEvent ? `已点击：${decisionEvent.label}` : text, ...(decisionEvent ? { decisionEvent } : {}) } });
        if (reserveDraft) {
          const draft = reserveDraft;
          if (/^(确认|是|是的)[。 ]*$/.test(text.trim())) {
            if (draft.positionVersion !== sourcePosition?.version) throw Error("岗位版本已变化，请重新核对范围；没有加入储备。");
            runOpportunityCommand("recruiting.review", { taskId: task.id, positionId: task.positionId, candidateIds: draft.ids });
          } else message("这版范围未执行；请重新明确人选，取消或修改都不会沿用旧确认。");
          setReserveDraft(null);
        } else if (text.trim() === "采用当前JD") {
          runOpportunityCommand("task.refresh-position", { id: task.id }); message("已采用当前岗位版本，请重新核对人选和依据；尚未加入储备。");
        } else {
          const names = text.trim().match(/^将(.+)加入岗位储备[。 ]*$/)?.[1].split(/[、，,]|和/).map(name => name.trim());
          const people = names?.map(name => candidates.find(candidate => candidate.name === name));
          if (!people?.length || people.some(person => !person)) message("此本地示例请明确姓名，例如‘将林昊、赵星羽加入岗位储备’；未知对象不跳过。本轮未写入。版本变化时可说‘采用当前JD’，再核对范围。");
          else {
            setReserveDraft({ ids: [...new Set(people.map(person => person.id))], positionVersion: sourcePosition?.version });
            message(`### 待确认的岗位储备范围\n\n${people.map(person => `- ${person.name} · ${person.company} · ${person.title}`).join("\n")}\n\n岗位v${sourcePosition?.version}。授权后才写入本地演示的储备与人才梳理；不联系。可点击下方确认按钮或修改要求。`);
          }
        }
        setValue(""); return;
      }
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
    } catch (failure) { setError(failure.message); if (approval) throw failure; }
    finally { setBusy(false); }
  }
  const updateAuthorization = (mode) => {
    try { runOpportunityCommand("task.update", { id: task.id, patch: { authMode: taskAuthorization(mode) } }); }
    catch (failure) { setError(failure.message); }
  };
  if (!task) return <StateBanner tone="danger" title="任务不存在" action={<Button onClick={() => navigate("/tasks")}>返回全部任务</Button>} />;
  const actualResults = task.results.filter((result) => ["opportunity", "position"].includes(result.type));
  const pipelineResults = task.results.filter((result) => result.type === "pipeline");
  const plan = [{ id: "input", title: "读取任务输入与来源", status: "done", detail: "原始文字与附件已保留" },
    { id: "draft", title: task.kind === "recruiting" ? "整理人选与证据" : "核对并整理资料草稿", status: task.phase === "input" ? "running" : "done" },
    { id: "write", title: "核对本版范围与正式结果", status: task.phase === "input" ? "pending" : task.results.length ? "done" : "waiting-user" }];
  return <TaskReadingWorkspace taskId={task.id} onOutputBusyChange={setOutputBusy} inspection={Boolean(inspection)} result={inspection ? <InspectionPanel item={inspection} onClose={() => setInspection(null)} /> : resultOpen ? <TaskResultReader title="人选结果" version={task.positionVersion} rows={candidates.map(candidate => ({ id: candidate.id, title: candidate.name, subtitle: `${candidate.company} · ${candidate.title}`, details: { 已有技能: candidate.skills.join("、"), 所在地: candidate.location, 评分与证据: "当前样例未提供任务初筛分或独立证据，不能据此断言已核实。" }, href: `#/candidates/${candidate.id}` }))} onClose={() => setResultOpen(false)} /> : null} header={<><TaskAreaNav value="tasks" />
      <header className="s2-detail-header"><button type="button" onClick={() => navigate("/tasks")}><Icon name="chevronLeft" />返回全部任务</button>
        <div><h1>{task.title}</h1><p>{opportunity?.title || sourcePosition?.name || "招聘需求处理"}</p></div><StatusBadge tone={task.phase === "result" ? "success" : "warning"}>{task.status}</StatusBadge></header></>}>
      <div className="s2-task-detail-layout"><section className="s2-task-conversation"><TaskTimeline className="s2-task-timeline" ref={timelineRef}>
        <p>【原型说明，正式实现不展示】使用本地输入与显式字段演示资料整理；未调用生产 Agent，不读取外部邮箱或发送邮件。</p>
        {task.source?.kind === "signal" ? <HunterReply markdown={"[查看来源洞察](#/signals?signal=" + encodeURIComponent(task.source.id) + ")"} /> : null}
        {task.messages.map((message) => message.role === "user" ? <div key={message.id}><UserMessage time={displayDateTime(message.at)}>{message.content}</UserMessage>
          {message.fileIds?.length ? <OpportunityFiles ids={message.fileIds} readOnly /> : null}</div> : <HunterReply key={message.id} markdown={message.content} />)}
        {task.phase === "input" ? <HunterReply streaming markdown="正在整理输入与来源资料。" /> : null}
        {task.kind === "recruiting" && ["candidate-review", "result"].includes(task.phase) ? <RecruitingCandidateReview task={task} onOpen={() => { setInspection(null); setResultOpen(true); }} /> : null}
        {actualResults.map((result, index) => <OpportunityWriteResult key={result.type + result.id + index} result={result} />)}
        {["opportunity", "position-create"].includes(task.kind) ? <SingleAssetTaskSummary task={task} hasUnsentChanges={Boolean(value.trim() || attachments.length)} /> : null}
        {reserveDraft ? <TaskExecutionApproval key={executionApprovalKey(task.id, reserveDraft)} requestKey={executionApprovalKey(task.id, reserveDraft)}
          action="reserve"
          scope={["本次人选：" + reserveDraft.ids.map(id => candidates.find(candidate => candidate.id === id)?.name || id).join("、"), `加入当前岗位 v${reserveDraft.positionVersion} 的储备。`]}
          authMode={task.authMode} hasUnsentChanges={Boolean(value.trim() || attachments.length)}
          disabledReason={getOpportunityPermission() ? "当前工作空间不能执行写入。" : sourcePosition?.version !== reserveDraft.positionVersion ? "岗位版本已变化，请采用当前 JD 并重新核对人选。" : ""}
          onApprove={(_, event) => send("确认", [], { approval: true, decisionEvent: event })} onDecline={(_, event) => send("否", [], { approval: true, decisionEvent: event })} /> : null}
        {pipelineResults.map((result, index) => <HunterReply key={index} markdown={"已将 " + result.candidateIds.map((id) => candidates.find((candidate) => candidate.id === id)?.name || id).join("、") + " 加入岗位储备，并同步更新岗位人才梳理。未发送联系消息。\n\n[查看人才梳理](#/positions/" + encodeURIComponent(result.id) + "?tab=talent-map)"} />)}
        {task.opportunityId && task.kind === "opportunity" && task.phase === "result" ? <TaskOpportunityFollowup task={task} hasUnsentChanges={Boolean(value.trim() || attachments.length)} /> : null}
        {error ? <><HunterReply markdown={"> " + markdownText(error)} />{task.phase === "input" ? <Button icon="refresh" onClick={prepare}>重试整理</Button> : null}</> : null}
      </TaskTimeline><div className="s2-task-composer-dock"><TaskActivity plan={plan} paused={generationStopped} state={error ? "error" : undefined} />
        <Composer value={value} onChange={setValue} onSend={send} authMode={task.authMode === "analyze" ? "analysis" : task.authMode} onAuthChange={updateAuthorization}
          streaming={task.phase === "input" && !generationStopped} onStop={() => setGenerationStopped(true)}
          attachments={attachments} onAttachmentsChange={setAttachments} disabled={busy || getOpportunityPermission()} placeholder="补充需求、客户回复或新的依据" />
      </div></section></div>
  </TaskReadingWorkspace>;
}

export function LegacyOpportunityResult({ taskId, showFollowup = true, awaitingContinuation = false, hasUnsentChanges = false }) {
  const state = useOpportunityState();
  const task = state.tasks.find((item) => item.id === taskId);
  const [error, setError] = useState("");
  useEffect(() => {
    if (task?.phase !== "input") return undefined;
    const timer = setTimeout(() => {
      try { setError(advanceLifecycleTask(taskId)); }
      catch (failure) { setError(failure.message); }
    }, 0);
    return () => clearTimeout(timer);
  }, [taskId, task?.phase]);
  if (!task) return <HunterReply markdown="尚无可整理的客户回复。" />;
  return <>
    {task.messages.slice(1).map((message) => message.role === "user" ? <div key={message.id}><UserMessage>{displayDraftConfirmation(task, message)}</UserMessage>
      {message.fileIds?.length ? <OpportunityFiles ids={message.fileIds} readOnly /> : null}</div> : <HunterReply key={message.id} markdown={message.content} />)}
    {task.phase === "input" ? <HunterReply streaming markdown="正在整理招聘需求与来源资料。" /> : null}
    {task.results.filter((result, index, items) => result.type === "opportunity" && items.findLastIndex((item) => item.type === "opportunity" && item.id === result.id) === index).map((result) => <OpportunityWriteResult key={result.id + "-" + result.version} result={result} />)}
    <SingleAssetTaskSummary task={task} askConfirmation={!(awaitingContinuation && task.phase === "cancelled")} confirmationReply="确认" hasUnsentChanges={hasUnsentChanges} />
    {showFollowup && task.opportunityId && task.phase === "result" ? <TaskOpportunityFollowup task={task} hasUnsentChanges={hasUnsentChanges} /> : null}
    {error ? <HunterReply markdown={"> " + markdownText(error)} /> : null}
  </>;
}
