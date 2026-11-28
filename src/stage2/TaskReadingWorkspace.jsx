import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TaskConversationProvider } from "./TaskConversation";
import { IconButton } from "../stage1/ui";
import { WorkHistory } from "./automation-ui";
import { workItems } from "./data";
import { ConversationSplitHandle, TaskListSplitHandle } from "./ConversationSplitHandle";
import "./candidate-research.css";
import { TaskHeaderControlPortal, TaskReadingActionsContext } from "./TaskWorkspaceControls";

// Same reading layout and live collapse thresholds as the approved research demo.
export function TaskReadingWorkspace({ taskId, header, result, inspection = false, children, onOutputBusyChange, resumeHistory = false }) {
  const navigate = useNavigate();
  const [historyWidth, setHistoryWidth] = useState(252);
  const [maxHistoryWidth, setMaxHistoryWidth] = useState(420);
  const lastHistoryWidth = useRef(252);
  const layout = useRef(null);
  const commitWidth = value => {
    const next = Math.min(value, maxHistoryWidth);
    if (next >= 160) lastHistoryWidth.current = next;
    setHistoryWidth(next);
  };
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (window.innerWidth <= 900) return;
      const maximum = Math.max(180, Math.min(420, layout.current.clientWidth - 648));
      setMaxHistoryWidth(maximum);
      setHistoryWidth(current => Math.min(current, maximum));
    });
    observer.observe(layout.current);
    return () => observer.disconnect();
  }, []);
  const openTab = path => window.open(`${location.pathname}${location.search}#${path}`, "_blank", "noopener,noreferrer");
  return <div className="s2-research-task-layout" ref={layout} style={{ "--research-history-width": `${historyWidth}px` }}>
    <div id="research-history" className="s2-research-history-rail" role="region" aria-label="任务列表">
      <WorkHistory items={workItems} currentId={taskId} collapsed={historyWidth === 58} drawerBreakpoint={900} onToggle={() => commitWidth(historyWidth === 58 ? lastHistoryWidth.current : 58)} onCreate={() => openTab("/new")} onSelect={item => { if (item.id !== taskId) navigate(`/tasks/${item.id}`); }} />
    </div>
    <TaskListSplitHandle width={historyWidth} maxWidth={maxHistoryWidth} onChange={setHistoryWidth} onCommit={commitWidth} containerRef={layout} />
    <div id="research-main" className="s2-page s2-research-workspace s2-task-reading-workspace">
      {header}
      <p className="s2-research-prototype-note">【原型说明，正式实现不展示】本地虚构资料与有限规则演示；未接入真实 Agent、搜索或业务写入。</p>
      <TaskReadingColumns result={result} inspection={inspection} onOutputBusyChange={onOutputBusyChange} resumeHistory={resumeHistory}>{children}</TaskReadingColumns>
    </div>
  </div>;
}

export function TaskReadingColumns({ result, inspection = false, conversationKey, children, onOutputBusyChange, resumeHistory = false }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const identity = conversationKey || [location.pathname, params.get("state"), params.get("run"), params.get("report"), params.get("companies")].join("|");
  const [ratio, setRatio] = useState(50), lastRatio = useRef(50), columns = useRef(null);
  const commitRatio = value => {
    if (value >= 22 && value <= 78) lastRatio.current = value;
    setRatio(value);
  };
  useEffect(() => { if (result) setRatio(current => current === 100 ? lastRatio.current : current); }, [Boolean(result)]);
  const restore = result && (ratio === 0 || ratio === 100) ? <IconButton icon="panelRight" label="恢复对话与结果分栏" title="恢复分栏" onClick={() => commitRatio(lastRatio.current)} /> : null;
  return <TaskConversationProvider key={identity} onOutputBusyChange={onOutputBusyChange} resumeHistory={resumeHistory}><TaskReadingActionsContext.Provider value={ratio === 0 ? restore : null}><div className={`s2-research-columns ${result ? "has-result" : ""} ${inspection ? "has-inspection" : ""} ${result && ratio === 0 ? "is-result-wide" : ""} ${result && ratio === 100 ? "is-dialogue-wide" : ""}`} ref={columns} style={{ "--research-dialogue-track": `${ratio}fr`, "--research-result-track": `${100 - ratio}fr` }}>
    <section id="research-dialogue" className="s2-research-dialogue" aria-label="任务对话">{children}</section>
    {result ? <><ConversationSplitHandle ratio={ratio} onChange={setRatio} onCommit={commitRatio} containerRef={columns} /><div id="research-result" className="s2-research-inspection-slot">{result}</div></> : null}
    {ratio === 100 ? <TaskHeaderControlPortal>{restore}</TaskHeaderControlPortal> : null}
  </div></TaskReadingActionsContext.Provider></TaskConversationProvider>;
}
