import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, IconButton, StatusBadge } from "../stage1/ui";
import { Composer, HunterReply, UserMessage, WorkHistory, TaskActivity } from "./automation-ui";
import { workItems } from "./data";
import { InspectionPanel } from "./ReviewWorkspace";
import { TaskAreaNav } from "./TaskAreaNav";
import { ConversationResultView } from "./ConversationResultView";
import { ConversationSplitHandle, TaskListSplitHandle } from "./ConversationSplitHandle";
import { createResearchState, finishResearch, researchCommand } from "./candidate-research-model";
import { initialResearchResult, personById, researchPlanSteps } from "./candidate-research-data";
import "./candidate-research.css";
import { TaskHeaderActions, TaskReadingActionsContext } from "./TaskWorkspaceControls";
import { TaskConversationProvider, TaskTimeline } from "./TaskConversation";

const initialMessages = [
  { id: "intro-user", role: "user", body: "为星澜机器人的具身智能 VLA 算法负责人岗位找人。先给我值得进一步判断的人选，不要联系。" },
  { id: "intro-reply", role: "assistant", body: "首批整理了18位人选。相关研究方向、当前机构和匹配情况已放在结果中；经历和个人贡献仍有需要核实的部分。", resultId: initialResearchResult.id },
];
const timeLabel = () => new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
const historyItems = [{ id: "candidate-research-demo", title: "具身智能 VLA 算法负责人", type: "岗位招聘", scenarios: ["岗位招聘", "候选人调研"], object: "星澜机器人 · 本地演示", status: "等待用户", tone: "neutral", time: "本轮", pinned: true }, ...workItems];

export function CandidateResearchDemo() {
  return <TaskConversationProvider><CandidateResearchConversation /></TaskConversationProvider>;
}

function CandidateResearchConversation() {
  const navigate = useNavigate();
  const [state, setState] = useState(createResearchState);
  const [messages, setMessages] = useState(initialMessages);
  const [viewId, setViewId] = useState(null);
  const [referencedId, setReferencedId] = useState(initialResearchResult.id);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [authMode, setAuthMode] = useState("analysis");
  const [ratio, setRatio] = useState(50);
  const lastSplitRatio = useRef(50);
  const [historyWidth, setHistoryWidth] = useState(252);
  const [maxHistoryWidth, setMaxHistoryWidth] = useState(420);
  const taskLayout = useRef(null), lastHistoryWidth = useRef(252);
  const [inspection, setInspection] = useState(null);
  const scroller = useRef(null), origin = useRef(null), sequence = useRef(1);
  const model = useRef(state);
  const failureUsed = useRef(false);
  const followBottom = useRef(true);
  const columns = useRef(null);
  const view = state.results.find(result => result.id === viewId);
  const rightOpen = Boolean(view || inspection);
  const plan = researchPlanSteps.map(step => step.id === "followup" ? { ...step, status: state.job ? "running" : state.stopped ? "paused" : state.pending || state.failedIds.length || state.results.length === 1 ? "waiting-user" : "done", detail: state.job ? state.job.requirement : state.pending ? "等待在原对话澄清同名人选。" : step.detail } : step);
  const commitHistoryWidth = width => {
    const next = Math.min(width, maxHistoryWidth);
    if (next >= 160) lastHistoryWidth.current = next;
    setHistoryWidth(next);
  };
  const context = state.results.find(result => result.id === referencedId) || state.results.at(-1);
  const update = next => { model.current = next; setState(next); };
  const append = message => setMessages(current => [...current, { ...message, id: `message-${sequence.current++}`, time: timeLabel() }]);
  const commitRatio = next => {
    if (next >= 22 && next <= 78) lastSplitRatio.current = next;
    setRatio(next);
    if (next === 0) requestAnimationFrame(() => document.querySelector(".s2-result-view h2, .s2-inspector button")?.focus());
    if (next === 100) requestAnimationFrame(() => document.querySelector(".s2-research-workspace textarea")?.focus());
  };
  const open = id => { origin.current = document.activeElement; setInspection(null); setViewId(id); setReferencedId(id); if (ratio === 100) setRatio(lastSplitRatio.current); };
  const close = () => { setViewId(null); requestAnimationFrame(() => origin.current?.isConnected ? origin.current.focus({ preventScroll: true }) : document.querySelector(".s2-research-workspace textarea")?.focus()); };

  useEffect(() => {
    if (followBottom.current && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages]);
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!taskLayout.current || window.innerWidth <= 900) return;
      const maximum = Math.max(180, Math.min(420, taskLayout.current.clientWidth - 648));
      setMaxHistoryWidth(maximum);
      setHistoryWidth(current => Math.min(current, maximum));
    });
    observer.observe(taskLayout.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const job = state.job;
    if (!job) return undefined;
    const started = performance.now();
    const timer = setTimeout(() => {
      const fail = new URLSearchParams(location.hash.split("?")[1]).get("scenario") === "error" && !failureUsed.current;
      const outcome = finishResearch(model.current, job.id, fail);
      if (!outcome) return;
      failureUsed.current = true;
      update(outcome.state);
      append({ role: "assistant", body: outcome.body, resultId: outcome.result?.id, elapsedMs: performance.now() - started });
      if (outcome.result) { setInspection(null); setViewId(outcome.result.id); setReferencedId(outcome.result.id); }
    }, 1400);
    return () => clearTimeout(timer);
  }, [state.job?.id]);

  const send = body => {
    if (!body.trim() && !attachments.length) return;
    append({ role: "user", body: body || "附加文件", contextId: context.id });
    setDraft(""); followBottom.current = true;
    if (attachments.length) {
      append({ role: "assistant", body: "本轮原型没有模拟文件解析，附件仍保留在输入框中，没有上传或读取内容。请移除附件后直接说明名单中的人选和要求。" });
      return;
    }
    const outcome = researchCommand(model.current, body, context);
    update(outcome.state);
    if (!outcome.running) append({ role: "assistant", body: outcome.body, resultId: outcome.result?.id });
    if (outcome.result) { setInspection(null); setViewId(outcome.result.id); setReferencedId(outcome.result.id); }
  };

  const reset = () => {
    update(createResearchState()); setMessages(initialMessages); setViewId(null); setInspection(null); setReferencedId(initialResearchResult.id); setDraft(""); setAttachments([]); setRatio(50); lastSplitRatio.current = 50; failureUsed.current = false;
  };
  const newTab = path => window.open(`${location.pathname}${location.search}#${path}`, "_blank", "noopener,noreferrer");
  return <div className="s2-research-task-layout" ref={taskLayout} style={{ "--research-history-width": `${historyWidth}px` }}>
    <div id="research-history" className="s2-research-history-rail" role="region" aria-label="任务列表">
      <WorkHistory items={historyItems} collapsed={historyWidth === 58} currentId="candidate-research-demo" drawerBreakpoint={900} onToggle={() => commitHistoryWidth(historyWidth === 58 ? lastHistoryWidth.current : 58)} onSelect={item => { if (item.id !== "candidate-research-demo") navigate(`/tasks/${item.id}`); }} onCreate={() => newTab("/new")} />
    </div>
    <TaskListSplitHandle width={historyWidth} maxWidth={maxHistoryWidth} onChange={setHistoryWidth} onCommit={commitHistoryWidth} containerRef={taskLayout} />
    <div id="research-main" className="s2-page s2-research-workspace">
    <TaskAreaNav value="tasks" />
    <header className="s2-workstream-header">
      <div><span>候选人调研</span><h1>具身智能 VLA 算法负责人</h1><small>星澜机器人 · 本轮先研究，不联系</small></div>
      <TaskHeaderActions><StatusBadge tone={state.job ? "success" : "neutral"}>{state.job ? "调研中" : "等待要求"}</StatusBadge>{rightOpen && ratio === 100 ? <IconButton icon="panelRight" label="恢复对话与结果分栏" title="恢复分栏" onClick={() => commitRatio(lastSplitRatio.current)} /> : null}<IconButton icon="refresh" label="重新演示候选人调研" title="重新演示" onClick={reset} /></TaskHeaderActions>
    </header>
    <p className="s2-research-prototype-note">【原型说明，正式实现不展示】本地模拟，人物和证据均为虚构；未接入 AI、搜索或业务写入。</p>
    <TaskReadingActionsContext.Provider value={inspection && ratio === 0 ? <IconButton icon="panelRight" label="恢复对话与结果分栏" title="恢复分栏" onClick={() => commitRatio(lastSplitRatio.current)} /> : null}><div className={`s2-research-columns ${rightOpen ? "has-result" : ""} ${inspection ? "has-inspection" : ""} ${rightOpen && ratio === 0 ? "is-result-wide" : ""} ${rightOpen && ratio === 100 ? "is-dialogue-wide" : ""}`} ref={columns} style={{ "--research-dialogue-track": `${ratio}fr`, "--research-result-track": `${100 - ratio}fr` }}>
      <section id="research-dialogue" className="s2-research-dialogue" aria-label="候选人调研对话">
        <div className="s2-conversation" ref={scroller} onScroll={event => { const node = event.currentTarget; followBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80; }}>
          <TaskTimeline>
            {messages.map(message => message.role === "user" ? <UserMessage key={message.id} time={message.time || "本轮开始"}>{message.body}</UserMessage> : <HunterReply key={message.id} markdown={message.body} elapsedMs={message.elapsedMs}>
              {message.resultId ? <button type="button" className="s2-research-result-entry" onClick={() => open(message.resultId)}><span><b>{state.results.find(result => result.id === message.resultId)?.title}</b><small>v{state.results.find(result => result.id === message.resultId)?.version} · {state.results.find(result => result.id === message.resultId)?.ids.length} 位人选</small></span><span>查看结果</span></button> : null}
            </HunterReply>)}
          </TaskTimeline>
        </div>
        <div className="s2-research-composer-wrap" onKeyDownCapture={event => { if (event.key === "Enter" && event.nativeEvent.isComposing) event.stopPropagation(); }}>
          <div className="s2-research-context"><span>{view && !inspection ? "正在查看" : "本轮引用"}：{context.title} · v{context.version}</span>{!view ? <Button size="sm" icon="file" onClick={() => open(context.id)}>查看结果</Button> : null}</div>
          <TaskActivity plan={plan} paused={Boolean(state.stopped)} waitingLabel="新的要求" message={state.job ? `正在核实 ${state.job.ids.length} 位人选的资料…` : undefined} />
          <Composer value={draft} onChange={setDraft} onSend={send} authMode={authMode} onAuthChange={setAuthMode} attachments={attachments} onAttachmentsChange={setAttachments} streaming={Boolean(state.job)} onStop={() => send("停止")} placeholder="说明要调研谁，以及想核实什么" />
        </div>
      </section>
      {rightOpen ? <><ConversationSplitHandle ratio={ratio} onChange={setRatio} onCommit={commitRatio} containerRef={columns} />{inspection ? <div id="research-result" className="s2-research-inspection-slot"><InspectionPanel item={inspection} onClose={() => { setInspection(null); requestAnimationFrame(() => document.querySelector(".s2-research-workspace textarea")?.focus()); }} /></div> : <ConversationResultView result={view} results={state.results} onVersion={id => { setViewId(id); setReferencedId(id); }} onClose={close} wide={ratio === 0} onToggleWide={() => commitRatio(ratio === 0 ? lastSplitRatio.current : 0)} />}</> : null}
    </div></TaskReadingActionsContext.Provider>
  </div></div>;
}

export function CandidateResearchSourceDemo() {
  const { candidateId } = useParams();
  const person = personById(candidateId);
  return <main className="s2-research-source-page"><p>【原型说明，正式实现不展示】仅供交互验收的虚构来源，不是真实人物资料。</p><h1>{person ? `${person.name} · 示例研究记录` : "示例来源不存在"}</h1>{person ? <><p>{person.company} · {person.role}</p>{person.findings.map(item => <section key={item.title}><h2>{item.title}</h2><p>{item.detail}</p></section>)}</> : <p>没有对应记录，未加载其他人的资料。</p>}</main>;
}
