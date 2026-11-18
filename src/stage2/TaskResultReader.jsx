import { useLayoutEffect, useRef, useState } from "react";
import { IconButton, StatusBadge } from "../stage1/ui";
import { RelationshipCanvas } from "../stage3/RelationshipCanvas";
import { organizationViews } from "../stage3/organization-mapping-data";
import { TaskPaneActions } from "./TaskWorkspaceControls";
// Reading state only, scoped to a specific immutable sample result; no business decisions.
const readingPositions = new Map();

export function TaskResultReader({ title, rows, onClose, version = 1, companies }) {
  const key = `${title}:${version}:${rows.map(row => row.id).join(",")}`;
  const [focusedId, setFocus] = useState(() => readingPositions.get(key)?.focusedId || null);
  const [tab, setViewTab] = useState(() => readingPositions.get(key)?.tab || "list");
  const scroller = useRef(null);
  const setFocusedId = id => { readingPositions.set(key, { focusedId: id, tab, scroll: 0 }); setFocus(id); };
  const setTab = value => { readingPositions.set(key, { focusedId, tab: value, scroll: 0 }); setViewTab(value); };
  useLayoutEffect(() => { if (scroller.current) scroller.current.scrollTop = readingPositions.get(key)?.scroll || 0; }, [key, focusedId, tab]);
  const focused = rows.find(row => row.id === focusedId);
  return <aside className="s2-result-view s2-task-result-reader" aria-label={title}>
    <header className="s2-result-view-header"><div><h2>{title}</h2><span>v{version} · {rows.length} 项结果</span></div><TaskPaneActions className="s2-result-view-tools"><IconButton icon="close" label="关闭结果" onClick={onClose} /></TaskPaneActions></header>
    <div className="s2-result-view-content" ref={scroller} onScroll={event => readingPositions.set(key, { focusedId, tab, scroll: event.currentTarget.scrollTop })}>
      {companies ? <div className="app-tabs s2-reading-tabs" role="tablist" aria-label="组织结果阅读方式">{[["list", "岗位与缺口"], ["graph", "组织关系"]].map(([value, label]) => <button type="button" role="tab" aria-selected={tab === value} className={tab === value ? "is-active" : ""} key={value} onClick={() => setTab(value)}>{label}</button>)}</div> : null}
      {companies && tab === "graph" ? <div className="s2-reading-graph"><RelationshipCanvas views={organizationViews({}, companies)} readingOnly /></div> : focused ? <>
        <button className="s2-result-evidence-link" type="button" onClick={() => setFocusedId(null)}>返回结果列表</button>
        <article className="s2-result-person-detail"><h3>{focused.title}</h3><p>{focused.subtitle}</p>
          {Number.isFinite(focused.score) ? <p><b>{focused.score} / 100</b> · 本版初筛分</p> : null}
          {Object.entries(focused.details).filter(([, value]) => value).map(([label, value]) => <section className="s2-result-finding" key={label}><h4>{label}</h4><p>{value}</p></section>)}
          {focused.href ? <a href={focused.href} target="_blank" rel="noopener noreferrer">查看已有资产</a> : null}
        </article>
      </> : <div className="s2-result-comparison">{rows.map((row, index) => <article key={row.id}>
        <header><span className="s2-result-ordinal">{index + 1}</span><div><button className="s2-result-person-link" type="button" onClick={() => setFocusedId(row.id)}><b>{row.title}</b><span>{row.subtitle}</span></button></div>{Number.isFinite(row.score) ? <div className="s2-result-score"><b>{row.score}<small>/ 100</small></b><span>本版初筛分</span></div> : null}</header>
        {row.status ? <p><StatusBadge tone={row.tone || "neutral"}>{row.status}</StatusBadge></p> : null}
        {Object.entries(row.details).filter(([, value]) => value).slice(0, 3).map(([label, value]) => <p key={label}><b>{label}：</b>{value}</p>)}
      </article>)}</div>}
      {!rows.length ? <p className="s2-result-footnote">当前没有可展示结果，尚未保存或执行其他动作。</p> : null}
    </div>
  </aside>;
}

export const candidateReadingRows = candidates => candidates.slice().sort((a, b) => b.score - a.score).map(person => ({
  id: person.id, title: person.name, subtitle: `${person.company} · ${person.role} · ${person.city}`, score: person.score,
  details: { 匹配理由: person.strength, 风险与待核实: person.risk, 资料来源: person.source },
}));
export const contactReadingRows = contacts => contacts.map(person => ({
  id: person.id, title: person.name, subtitle: `${person.company} · ${person.role}`, status: person.confidence, tone: person.tone,
  details: { 身份与来源: person.source, 联系方式: [person.phone, person.email].filter(Boolean).join(" · ") || "尚未找到", 保存状态: person.category === "联系人线索" ? "身份尚未明确，仅保留任务线索。" : "查看资料不表示确认建档或对外联系。" },
}));
export const organizationReadingRows = companies => companies.flatMap(company => company.roles.map(role => ({
  id: `${company.id}-${role.id}`, title: `${company.name} · ${role.title}`, subtitle: role.name || "任职人待核实", status: role.gap ? "待核实" : "已定位任职人", tone: role.gap ? "warning" : "success",
  details: { 组织与职责: role.summary || company.organization, 证据与缺口: role.gap || "任职人已定位，任职时间待补充。", 来源: Array.isArray(role.evidence) ? role.evidence.join("、") : role.evidence || role.source || "未提供独立来源，继续保留为未知。" },
})));
export const positionReadingRows = matches => matches.map(match => ({
  id: match.id, title: match.title, subtitle: `${match.company} · ${match.location}`, score: match.score, status: match.status,
  details: { 匹配理由: match.reason, 风险提示: match.risk, 仍需确认: match.gaps, 沟通参考: match.talkingPoint },
}));
