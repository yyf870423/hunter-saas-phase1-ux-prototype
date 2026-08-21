import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, IconButton, StatusBadge } from "../stage1/ui";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 460;
const NODE_WIDTH = 148;
const NODE_HEIGHT = 62;

const decisionLabels = {
  wangyi: "王奕身份关系",
  qiongding: "穹顶智能汇报关系",
};

function edgePath(source, target, index, layout) {
  const startX = source.x + NODE_WIDTH;
  const startY = source.y + NODE_HEIGHT / 2;
  const endX = target.x;
  const endY = target.y + NODE_HEIGHT / 2;
  if (layout === "network") {
    const offset = index % 2 === 0 ? -24 : 24;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2 + offset;
    return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
  }
  const bendX = startX + Math.max(42, (endX - startX) / 2);
  return `M ${startX} ${startY} C ${bendX} ${startY}, ${bendX} ${endY}, ${endX} ${endY}`;
}

function edgeLabelPoint(source, target, index, layout) {
  const startX = source.x + NODE_WIDTH;
  const startY = source.y + NODE_HEIGHT / 2;
  const endX = target.x;
  const endY = target.y + NODE_HEIGHT / 2;
  return {
    x: (startX + endX) / 2,
    y:
      (startY + endY) / 2 +
      (layout === "network" ? (index % 2 === 0 ? -15 : 15) : -8),
  };
}

function SelectedDetail({ view, selection, decisions, onDecision, onSelect }) {
  const selected =
    selection.kind === "node"
      ? view.nodes.find((item) => item.id === selection.id)
      : view.edges.find((item) => item.id === selection.id);
  if (!selected) return null;
  const isNode = selection.kind === "node";
  const source = !isNode
    ? view.nodes.find((item) => item.id === selected.source)
    : null;
  const target = !isNode
    ? view.nodes.find((item) => item.id === selected.target)
    : null;
  const relations = isNode
    ? view.edges
        .filter(
          (edge) => edge.source === selected.id || edge.target === selected.id,
        )
        .map((edge) => {
          const anotherId =
            edge.source === selected.id ? edge.target : edge.source;
          return {
            ...edge,
            another: view.nodes.find((item) => item.id === anotherId),
          };
        })
    : [];
  const decisionKey = selected.decisionKey;
  const confirmed = decisionKey && decisions[decisionKey] === "write";
  return (
    <aside className="s3-relationship-detail" aria-live="polite">
      <header>
        <span>
          <small className="s3-detail-kicker">
            {isNode ? selected.meta : "关系详情"}
          </small>
          <h2>{selected.label}</h2>
          {!isNode ? (
            <p>
              {source?.label} → {target?.label}
            </p>
          ) : null}
        </span>
        <StatusBadge tone={selected.tone}>{selected.status}</StatusBadge>
      </header>
      {isNode ? (
        <p className="s3-relationship-summary">{selected.summary}</p>
      ) : null}
      {isNode && selected.facts?.length ? (
        <section>
          <h3>关键信息</h3>
          <dl className="s3-detail-list">
            {selected.facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {!isNode ? (
        <section>
          <h3>关系依据</h3>
          <dl className="s3-detail-list">
            <div>
              <dt>关系方向</dt>
              <dd>
                {source?.label} → {target?.label}
              </dd>
            </div>
            <div>
              <dt>获知时间</dt>
              <dd>{selected.observedAt}</dd>
            </div>
            <div>
              <dt>确认状态</dt>
              <dd>{selected.status}</dd>
            </div>
          </dl>
        </section>
      ) : null}
      <section>
        <h3>证据来源</h3>
        <ul className="s3-evidence-list">
          {selected.evidence.map((item) => (
            <li key={item}>
              <Icon name="file" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      {isNode && relations.length ? (
        <section>
          <h3>直接关系</h3>
          <div className="s3-direct-relations">
            {relations.map((relation) => (
              <button
                type="button"
                key={relation.id}
                onClick={() => onSelect("edge", relation.id)}
              >
                <span>
                  <b>{relation.label}</b>
                  <small>{relation.another?.label}</small>
                </span>
                <Icon name="chevronRight" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {decisionKey ? (
        <section className="s3-pending-decision">
          <h3>本批次写入决定</h3>
          <p>原始冲突和证据会保留；确认只影响本批次是否写入当前关系。</p>
          <div className="s3-pending-control">
            <StatusBadge tone={confirmed ? "success" : "warning"}>
              {confirmed ? "已确认写入" : "待确认"}
            </StatusBadge>
            <Button
              tone="secondary"
              size="sm"
              aria-label={
                confirmed
                  ? `撤销确认${decisionLabels[decisionKey]}`
                  : `确认写入${decisionLabels[decisionKey]}`
              }
              onClick={() =>
                onDecision(decisionKey, confirmed ? "pending" : "write")
              }
            >
              {confirmed ? "撤销确认" : "确认并写入"}
            </Button>
          </div>
        </section>
      ) : null}
    </aside>
  );
}

export function RelationshipCanvas({ views, decisions, onDecision }) {
  const [viewId, setViewId] = useState(views[0].id);
  const activeView = views.find((item) => item.id === viewId) || views[0];
  const [selectionByView, setSelectionByView] = useState(() =>
    Object.fromEntries(views.map((view) => [view.id, view.defaultSelection])),
  );
  const [zoom, setZoom] = useState(1);
  const selection = selectionByView[activeView.id];
  const nodesById = useMemo(
    () => Object.fromEntries(activeView.nodes.map((node) => [node.id, node])),
    [activeView],
  );
  const selectedNodeId = selection.kind === "node" ? selection.id : null;
  const connectedEdges = new Set(
    selectedNodeId
      ? activeView.edges
          .filter(
            (edge) =>
              edge.source === selectedNodeId || edge.target === selectedNodeId,
          )
          .map((edge) => edge.id)
      : [],
  );
  const select = (kind, id) =>
    setSelectionByView((current) => ({
      ...current,
      [activeView.id]: { kind, id },
    }));
  const switchView = (id) => {
    setViewId(id);
    setZoom(1);
  };
  return (
    <section className="s3-relationship-workspace">
      <header className="s3-relationship-header">
        {views.length > 1 ? (
          <div
            className="s3-relationship-view-tabs app-tabs"
            role="tablist"
            aria-label="人才版图关系视图"
          >
            {views.map((view) => (
              <button
                type="button"
                role="tab"
                aria-selected={view.id === activeView.id}
                className={view.id === activeView.id ? "is-active" : ""}
                key={view.id}
                onClick={() => switchView(view.id)}
              >
                {view.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="s3-relationship-intro">
          <span>
            <b>{activeView.description}</b>
            <small>{activeView.summary}</small>
          </span>
          <div className="s3-relationship-legend" aria-label="关系状态说明">
            <span className="is-confirmed">已确认</span>
            <span className="is-inferred">系统归纳</span>
            <span className="is-pending">待确认</span>
          </div>
        </div>
      </header>
      <div className="s3-relationship-body">
        <div className="s3-relationship-canvas-shell">
          <div className="s3-relationship-controls">
            <IconButton
              icon="plus"
              label="放大关系画布"
              disabled={zoom >= 1.3}
              onClick={() => setZoom((value) => Math.min(1.3, value + 0.1))}
            />
            <IconButton
              icon="minus"
              label="缩小关系画布"
              disabled={zoom <= 0.8}
              onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}
            />
            <IconButton
              icon="refresh"
              label="重置关系画布"
              onClick={() => setZoom(1)}
            />
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="s3-relationship-viewport">
            <div
              className={`s3-relationship-stage is-${activeView.id}`}
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `scale(${zoom})`,
              }}
            >
              <svg
                className="s3-relationship-edges"
                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                aria-label={`${activeView.label}关系连线`}
              >
                <defs>
                  {["success", "info", "warning"].map((tone) => (
                    <marker
                      id={`s3-arrow-${tone}`}
                      key={tone}
                      markerWidth="7"
                      markerHeight="7"
                      refX="6"
                      refY="3.5"
                      orient="auto"
                    >
                      <path d="M0,0 L7,3.5 L0,7 Z" />
                    </marker>
                  ))}
                </defs>
                {activeView.edges.map((edge, index) => {
                  const source = nodesById[edge.source];
                  const target = nodesById[edge.target];
                  const path = edgePath(
                    source,
                    target,
                    index,
                    activeView.layout,
                  );
                  const point = edgeLabelPoint(
                    source,
                    target,
                    index,
                    activeView.layout,
                  );
                  const active =
                    (selection.kind === "edge" && selection.id === edge.id) ||
                    connectedEdges.has(edge.id);
                  return (
                    <g
                      className={`s3-relationship-edge is-${edge.tone} ${active ? "is-active" : ""}`}
                      data-edge-id={edge.id}
                      key={edge.id}
                      role="button"
                      tabIndex="0"
                      aria-label={`${nodesById[edge.source].label}到${nodesById[edge.target].label}：${edge.label}`}
                      onClick={() => select("edge", edge.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          select("edge", edge.id);
                        }
                      }}
                    >
                      <path className="s3-edge-hit" d={path} />
                      <path
                        className="s3-edge-line"
                        d={path}
                        markerEnd={`url(#s3-arrow-${edge.tone})`}
                        style={{ "--s3-edge-width": `${edge.width || 1.5}px` }}
                      />
                      <g transform={`translate(${point.x}, ${point.y})`}>
                        <rect x="-48" y="-10" width="96" height="20" rx="4" />
                        <text textAnchor="middle" dominantBaseline="central">
                          {edge.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
              {activeView.nodes.map((node) => {
                const active =
                  selection.kind === "node" && selection.id === node.id;
                return (
                  <button
                    type="button"
                    className={`s3-relationship-node is-${node.kind} is-${node.tone} ${active ? "is-active" : ""}`}
                    aria-pressed={active}
                    key={node.id}
                    style={{ left: node.x, top: node.y }}
                    onClick={() => select("node", node.id)}
                  >
                    <span>
                      <b>{node.label}</b>
                      <small>{node.meta}</small>
                    </span>
                    {node.tone === "warning" ? <Icon name="warning" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <SelectedDetail
          view={activeView}
          selection={selection}
          decisions={decisions}
          onDecision={onDecision}
          onSelect={select}
        />
      </div>
    </section>
  );
}
