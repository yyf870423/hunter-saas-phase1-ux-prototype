import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, IconButton, StatusBadge } from "../stage1/ui";
import { personById } from "./candidate-research-data";

export function ConversationResultView({ result, results, onVersion, onClose, wide, onToggleWide }) {
  const [focusedId, setFocusedId] = useState(null);
  const heading = useRef(null);
  useEffect(() => { setFocusedId(null); heading.current?.focus({ preventScroll: true }); }, [result.id]);
  const focused = result.ids.includes(focusedId) ? personById(focusedId) : null;
  const index = results.findIndex(item => item.id === result.id);
  return <aside id="research-result" className="s2-result-view" aria-label="候选人调研结果" onKeyDown={event => { if (event.key === "Escape") onClose(); }}>
    <header className="s2-result-view-header">
      <div><h2 tabIndex={-1} ref={heading}>{result.title}</h2><span>{result.scope} · v{result.version}{index < results.length - 1 ? " · 历史快照" : ""}</span></div>
      <div className="s2-result-view-tools">
        <IconButton icon={wide ? "panelLeft" : "maximize"} label={wide ? "恢复对话与结果分栏" : "全宽查看结果"} title={wide ? "恢复分栏" : "全宽查看"} onClick={onToggleWide} />
        <IconButton icon="chevronLeft" label="查看上一版结果" title="上一版" disabled={index === 0} onClick={() => onVersion(results[index - 1].id)} />
        <IconButton icon="chevronRight" label="查看下一版结果" title="下一版" disabled={index === results.length - 1} onClick={() => onVersion(results[index + 1].id)} />
        <IconButton icon="close" label="关闭结果视图" title="关闭结果视图" onClick={onClose} />
      </div>
    </header>
    <div className="s2-result-view-content">
      <p className="s2-result-requirement"><b>本次要求</b>{result.requirement}</p>
      {focused ? <>
        <Button icon="chevronLeft" size="sm" onClick={() => setFocusedId(null)}>返回人选结果</Button>
        <section className="s2-result-person-detail" aria-label={`${focused.name}的证据详情`}>
          <h3>{focused.name}</h3><p>{focused.company} · {focused.role}</p>
          <dl className="s2-key-values"><div><dt>初筛匹配分</dt><dd>{focused.score} / 100</dd></div><div><dt>城市</dt><dd>{focused.city}</dd></div><div><dt>专业方向</dt><dd>{focused.direction}</dd></div><div><dt>线索来源</dt><dd>{focused.source}</dd></div></dl>
          <section className="s2-result-finding"><h4>匹配理由</h4><p>{focused.strength}</p><h4>风险与缺口</h4><p>{focused.risk}</p><small className="s2-result-score-note">对应本轮 VLA 岗位要求的示例初筛分；本次模拟调研未重新评分。</small></section>
          {focused.findings.map(finding => <section className="s2-result-finding" key={finding.title}><header><h4>{finding.title}</h4><StatusBadge tone="neutral">{finding.status}</StatusBadge></header><p>{finding.detail}</p></section>)}
          <a className="s1-button s1-button-secondary s1-button-sm" href={`#/demo/candidate-research-source/${focused.id}`} target="_blank" rel="noopener noreferrer"><Icon name="file" /><span>查看示例来源</span><Icon name="external" /></a>
        </section>
      </> : result.kind === "list" ? <>
        <table className="s2-result-table" aria-label="候选人只读名单">
          <thead><tr><th scope="col">序号</th><th scope="col">人选 / 匹配理由</th><th scope="col" className="s2-result-role">方向</th><th scope="col">初筛分</th></tr></thead>
          <tbody>{result.ids.map((id, ordinal) => {
            const person = personById(id);
            return <tr key={id}><td>{ordinal + 1}</td><td><button type="button" className="s2-result-person-link" onClick={() => setFocusedId(id)}><b>{person.name}</b><span>{person.company}</span></button><p className="s2-result-row-reason">{person.strength}</p></td><td className="s2-result-role">{person.direction}</td><td>{person.score}<small className="s2-result-score-scale">/ 100</small></td></tr>;
          })}</tbody>
        </table>
        <p className="s2-result-footnote">共 {result.ids.length} 位 · 本轮 VLA 岗位的示例初筛分 · 资料不足不代表不匹配</p>
      </> : <div className="s2-result-comparison" aria-label="人选证据比较">
        {result.ids.map((id, ordinal) => {
          const person = personById(id), failed = result.failedIds.includes(id);
          return <article key={id}><header><span className="s2-result-ordinal">{ordinal + 1}</span><div><button type="button" className="s2-result-person-link" onClick={() => setFocusedId(id)}><b>{person.name}</b></button><small>{person.company} · {person.role}</small></div><div className="s2-result-score"><b>{person.score}<small>/ 100</small></b><span>初筛匹配分</span></div></header>
            <dl><div><dt>匹配理由</dt><dd>{person.strength}</dd></div><div><dt>风险 / 缺口</dt><dd>{person.risk}</dd></div></dl>
            <StatusBadge tone={failed ? "warning" : "neutral"}>{failed ? "调研待重试" : "模拟调研完成"}</StatusBadge>
            {failed ? <p role="status">示例来源暂时不可用，本人的进一步调研尚未完成。没有用其他人的信息填补。</p> : <><p>{person.findings[0].detail}</p><dl><div><dt>相关方向</dt><dd>{person.direction}</dd></div><div><dt>待核实</dt><dd>预训练职责、个人贡献与任职时间</dd></div></dl></>}
            <p className="s2-result-score-note">初筛分沿用原结果，本次模拟调研未重新评分。</p><button type="button" className="s2-result-evidence-link" onClick={() => setFocusedId(id)}>查看证据与缺口 <Icon name="chevronRight" /></button>
          </article>;
        })}
      </div>}
    </div>
  </aside>;
}
