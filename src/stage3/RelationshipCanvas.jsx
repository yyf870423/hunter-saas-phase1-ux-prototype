import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useCanvasFullscreen } from "../components/useCanvasFullscreen";
import { Button, IconButton, Modal, StatusBadge, useToast } from "../stage1/ui";
import {
  FormField,
  SelectMenu,
  TextInput,
  TooltipText,
} from "../stage4/asset-ui";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 500;
const NODE_WIDTH = 168;
const NODE_HEIGHT = 78;
const NODE_GAP = 16;
const CANVAS_EXPANSION_PADDING = 240;

function relationshipAssetType(node) {
  if (!node.detailPath) return "";
  if (node.detailPath.includes("/candidates/")) return "候选人";
  if (node.detailPath.includes("/contacts/")) return "联系人";
  if (node.detailPath.includes("/companies/")) return "公司";
  if (node.detailPath.includes("/positions/")) return "岗位";
  if (node.detailPath.includes("/papers/")) return "论文";
  if (node.detailPath.includes("/patents/")) return "专利";
  return "业务资产";
}

function cloneRelationshipView(view) {
  return {
    ...view,
    nodes: view.nodes.map((node) => ({ ...node })),
    edges: view.edges.map((edge) => ({ ...edge })),
  };
}

function loadRelationshipViews(storageKey, views) {
  const fallback = Object.fromEntries(
    views.map((view) => [view.id, cloneRelationshipView(view)]),
  );
  if (!storageKey) return fallback;
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    views.forEach((view) => {
      const saved = stored[view.id];
      if (!saved?.nodes || !saved?.edges) return;
      const baseNodeIds = new Set(view.nodes.map((node) => node.id));
      const baseEdgeIds = new Set(view.edges.map((edge) => edge.id));
      fallback[view.id] = {
        ...cloneRelationshipView(view),
        nodes: [
          ...view.nodes.map((node) => {
            const savedNode = saved.nodes.find((item) => item.id === node.id);
            if (!savedNode) return node;
            return {
              ...node,
              ...(savedNode.userEdited
                ? { label: savedNode.label, meta: savedNode.meta }
                : {}),
              x: savedNode.x,
              y: savedNode.y,
              userMoved: true,
              userEdited: savedNode.userEdited,
            };
          }),
          ...saved.nodes.filter((node) => !baseNodeIds.has(node.id)),
        ],
        edges: [
          ...view.edges.map((edge) => {
            const savedEdge = saved.edges.find((item) => item.id === edge.id);
            return savedEdge?.userEdited
              ? { ...edge, label: savedEdge.label, userEdited: true }
              : edge;
          }),
          ...saved.edges.filter((edge) => !baseEdgeIds.has(edge.id)),
        ],
      };
    });
  } catch {
    return fallback;
  }
  return fallback;
}

function relationshipCanvasSize(nodes) {
  return {
    width: Math.max(
      CANVAS_WIDTH,
      ...nodes.map((node) => node.x + NODE_WIDTH + CANVAS_EXPANSION_PADDING),
    ),
    height: Math.max(
      CANVAS_HEIGHT,
      ...nodes.map((node) => node.y + NODE_HEIGHT + CANVAS_EXPANSION_PADDING),
    ),
  };
}

function relationshipNodesOverlap(left, right) {
  return !(
    left.x + NODE_WIDTH + NODE_GAP <= right.x ||
    right.x + NODE_WIDTH + NODE_GAP <= left.x ||
    left.y + NODE_HEIGHT + NODE_GAP <= right.y ||
    right.y + NODE_HEIGHT + NODE_GAP <= left.y
  );
}

function placeRelationshipNode(node, occupied) {
  const desired = { ...node };
  if (!occupied.some((item) => relationshipNodesOverlap(desired, item))) {
    return desired;
  }
  const step = 22;
  for (let ring = 1; ring <= 12; ring += 1) {
    for (let axis = -ring; axis <= ring; axis += 1) {
      const offsets = [
        [axis * step, -ring * step],
        [axis * step, ring * step],
        [-ring * step, axis * step],
        [ring * step, axis * step],
      ];
      for (const [dx, dy] of offsets) {
        const candidate = {
          ...node,
          x: node.x + dx,
          y: node.y + dy,
        };
        if (
          !occupied.some((item) => relationshipNodesOverlap(candidate, item))
        ) {
          return candidate;
        }
      }
    }
  }
  return desired;
}

const decisionLabels = {
  wangyi: "王奕身份关系",
  qiongding: "穹顶智能汇报关系",
};

const evidenceSnapshots = {
  公司官网: {
    type: "公开网页",
    capturedAt: "今天 09:18",
    content:
      "公司介绍页明确列出具身智能、机器人学习和真机数据闭环为当前重点研发方向。页面同时展示了核心团队和主要产品线。",
  },
  官网团队介绍: {
    type: "公开网页",
    capturedAt: "今天 09:21",
    content:
      "团队页面将具身智能中心列为一级研发组织，并在下方展示 VLA 算法组与机器人学习组的研究方向。",
  },
  公开招聘页: {
    type: "公开招聘信息",
    capturedAt: "今天 09:22",
    content:
      "招聘页面同时出现 VLA、模仿学习、强化学习和真机部署岗位；岗位汇报关系指向具身智能中心。",
  },
  岗位页面: {
    type: "公开招聘信息",
    capturedAt: "今天 09:27",
    content:
      "VLA 算法负责人岗位负责视觉语言动作模型、真机策略部署和数据闭环，并要求具备团队管理经验。",
  },
  团队论文: {
    type: "论文证据",
    capturedAt: "今天 09:29",
    content:
      "近两年论文的作者机构和致谢信息持续出现 VLA、机器人学习与数据闭环方向，能够支持团队研究边界判断。",
  },
  Hunter候选人档案: {
    type: "系统内业务资产",
    capturedAt: "今天 09:31",
    content:
      "候选人当前工作经历、公开资料链接和最近核实记录均指向星澜机器人 VLA 算法负责人。",
  },
  "Hunter 候选人档案": {
    type: "系统内业务资产",
    capturedAt: "今天 09:31",
    content:
      "候选人当前工作经历、公开资料链接和最近核实记录均指向星澜机器人 VLA 算法负责人。",
  },
  论文作者信息: {
    type: "论文作者信息",
    capturedAt: "今天 09:35",
    content:
      "论文署名显示王奕在 2024 年仍使用另一家研究机构，但公司公开活动名单中出现同名人员，需要继续核实是否为同一人。",
  },
  公司公开活动名单: {
    type: "公开活动资料",
    capturedAt: "今天 09:35",
    content:
      "活动议程将王奕列为星澜机器人学习研究员，但缺少可稳定区分同名人员的个人主页或联系方式。",
  },
  活动名单: {
    type: "公开活动资料",
    capturedAt: "今天 09:35",
    content:
      "活动议程出现同名研究员及公司信息，与论文单位时间线存在差异，当前只能作为待确认依据。",
  },
};

function resolveEvidenceSnapshot(label, selected, view) {
  return (
    evidenceSnapshots[label] || {
      type: "来源记录",
      capturedAt: selected.observedAt || "本轮摸排",
      content: `该来源用于判断“${selected.label}”在“${view.label}”中的身份、方向或关系。Hunter 已保留本轮读取到的关键片段，正式实现中同时保留原始链接、获取时间和任务上下文。`,
    }
  );
}

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

function SelectedDetail({
  view,
  selection,
  decisions,
  onDecision,
  onSelect,
  onClose,
  onOpenEvidence,
  onOpenEntity,
}) {
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
  const decision = decisionKey ? decisions[decisionKey] : null;
  const confirmed = decision === "write";
  const skipped = decision === "skip";
  return (
    <aside className="s3-relationship-detail" aria-live="polite">
      <header>
        <span>
          <small className="s3-detail-kicker">
            {isNode ? selected.meta : "关系详情"}
          </small>
          <h2>{selected.label || "未命名关系"}</h2>
          {!isNode ? (
            <p>
              {source?.label} → {target?.label}
            </p>
          ) : null}
        </span>
        <span className="s3-relationship-detail-actions">
          <StatusBadge tone={selected.tone}>{selected.status}</StatusBadge>
          <IconButton icon="close" label="关闭详情" onClick={onClose} />
        </span>
      </header>
      {isNode ? (
        <p className="s3-relationship-summary">{selected.summary}</p>
      ) : null}
      {isNode && selected.detailPath ? (
        <Button
          className="s3-related-asset-link"
          tone="secondary"
          size="sm"
          icon="external"
          onClick={() => onOpenEntity(selected)}
        >
          {selected.detailLabel || "打开资产详情"}
        </Button>
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
              <button
                type="button"
                aria-label={`查看证据：${item}`}
                onClick={() => onOpenEvidence(item, selected, view)}
              >
                <Icon name="file" />
                <span>{item}</span>
                <Icon name="chevronRight" />
              </button>
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
                  <b>{relation.label || "未命名关系"}</b>
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
            <StatusBadge
              tone={confirmed ? "success" : skipped ? "neutral" : "warning"}
            >
              {confirmed ? "已确认写入" : skipped ? "本批次不写入" : "待确认"}
            </StatusBadge>
            {confirmed || skipped ? (
              <Button
                tone="secondary"
                size="sm"
                aria-label={`重新选择${decisionLabels[decisionKey]}`}
                onClick={() => onDecision(decisionKey, "pending")}
              >
                重新选择
              </Button>
            ) : (
              <div className="s3-pending-actions">
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() => onDecision(decisionKey, "skip")}
                >
                  本批次不写入
                </Button>
                <Button
                  tone="primary"
                  size="sm"
                  aria-label={`确认写入${decisionLabels[decisionKey]}`}
                  onClick={() => onDecision(decisionKey, "write")}
                >
                  确认并写入
                </Button>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </aside>
  );
}

function RelationshipEditorDialog({ open, mode, item, view, close, onSave }) {
  const nodeMode = mode === "add-node" || mode === "edit-node";
  const editing = mode === "edit-node" || mode === "edit-edge";
  const [label, setLabel] = useState("");
  const [meta, setMeta] = useState("");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  useEffect(() => {
    if (!open) return;
    setLabel(item?.label || "");
    setMeta(item?.meta || "");
    setSource(item?.source || view.nodes[0]?.id || "");
    setTarget(item?.target || view.nodes[1]?.id || "");
  }, [item, open, view]);
  const sourceNode = view.nodes.find((node) => node.id === source);
  const targetNode = view.nodes.find((node) => node.id === target);
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title={
        mode === "add-node"
          ? "添加关系节点"
          : mode === "add-edge"
            ? "添加节点关系"
            : nodeMode
              ? "编辑关系节点"
              : "编辑节点关系"
      }
      description={
        nodeMode
          ? "这里的修改只影响当前资产关系图，不会覆盖正式资产资料。"
          : "关系名称可以留空；起点和终点创建后不再修改。"
      }
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={
              nodeMode ? !label.trim() : !source || !target || source === target
            }
            onClick={() =>
              onSave({
                label: label.trim(),
                meta: meta.trim(),
                source,
                target,
              })
            }
          >
            {editing ? "保存修改" : "确认添加"}
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        {nodeMode ? (
          <>
            <FormField label="节点名称" required span={2}>
              <TextInput value={label} onChange={setLabel} />
            </FormField>
            <FormField label="节点说明" span={2}>
              <TextInput
                value={meta}
                onChange={setMeta}
                placeholder="例如：目标公司、合作人、重点候选人"
              />
            </FormField>
          </>
        ) : (
          <>
            {editing ? (
              <div className="s3-relation-editor-endpoints">
                <span>
                  <small>起点</small>
                  <b>{sourceNode?.label}</b>
                </span>
                <Icon name="chevronRight" />
                <span>
                  <small>终点</small>
                  <b>{targetNode?.label}</b>
                </span>
              </div>
            ) : (
              <>
                <FormField label="起点" required>
                  <SelectMenu
                    label="选择起点"
                    value={sourceNode?.label || "请选择"}
                    options={view.nodes.map((node) => node.label)}
                    searchable
                    onChange={(value) =>
                      setSource(
                        view.nodes.find((node) => node.label === value)?.id ||
                          "",
                      )
                    }
                  />
                </FormField>
                <FormField label="终点" required>
                  <SelectMenu
                    label="选择终点"
                    value={targetNode?.label || "请选择"}
                    options={view.nodes.map((node) => node.label)}
                    searchable
                    onChange={(value) =>
                      setTarget(
                        view.nodes.find((node) => node.label === value)?.id ||
                          "",
                      )
                    }
                  />
                </FormField>
              </>
            )}
            <FormField label="关系名称" span={2}>
              <TextInput
                value={label}
                onChange={setLabel}
                placeholder="例如：合作、人才流入、共同作者"
              />
            </FormField>
          </>
        )}
      </div>
    </Modal>
  );
}

export function RelationshipCanvas({
  views,
  decisions,
  onDecision,
  editable = false,
  draggable = false,
  storageKey,
}) {
  const navigate = useNavigate();
  const notify = useToast();
  const [viewId, setViewId] = useState(views[0].id);
  const [viewStateById, setViewStateById] = useState(() =>
    loadRelationshipViews(storageKey, views),
  );
  const incomingView = views.find((item) => item.id === viewId) || views[0];
  const activeView = viewStateById[viewId] || incomingView;
  const [selectionByView, setSelectionByView] = useState(() =>
    Object.fromEntries(views.map((view) => [view.id, view.defaultSelection])),
  );
  const [zoom, setZoom] = useState(1);
  const [panByView, setPanByView] = useState(() =>
    Object.fromEntries(views.map((view) => [view.id, { x: 0, y: 0 }])),
  );
  const [detailOpen, setDetailOpen] = useState(true);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [connectionDraft, setConnectionDraft] = useState(null);
  const { isFullscreen, toggleFullscreen } = useCanvasFullscreen();
  const dragRef = useRef(null);
  const panRef = useRef(null);
  const connectionRef = useRef(null);
  const stageRef = useRef(null);
  const suppressClickRef = useRef(false);
  const viewSignature = views.map((view) => view.id).join("|");
  useEffect(() => {
    setViewId((current) =>
      views.some((view) => view.id === current) ? current : views[0].id,
    );
    setSelectionByView((current) => {
      const next = { ...current };
      views.forEach((view) => {
        if (!next[view.id]) next[view.id] = view.defaultSelection;
      });
      return next;
    });
    setViewStateById((current) => {
      const next = { ...current };
      views.forEach((view) => {
        if (!next[view.id]) next[view.id] = cloneRelationshipView(view);
      });
      return next;
    });
    setPanByView((current) => {
      const next = { ...current };
      views.forEach((view) => {
        if (!next[view.id]) next[view.id] = { x: 0, y: 0 };
      });
      return next;
    });
    setZoom(1);
  }, [viewSignature]);
  useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(viewStateById));
    } catch {
      // The prototype remains usable when browser storage is unavailable.
    }
  }, [storageKey, viewStateById]);
  useEffect(() => {
    if (!contextMenu) return undefined;
    const closeMenu = (event) => {
      if (!event.target.closest(".s3-relationship-context-menu")) {
        setContextMenu(null);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("pointerdown", closeMenu);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [contextMenu]);
  useEffect(() => {
    const move = (event) => {
      const drag = dragRef.current;
      if (drag) {
        const dx = (event.clientX - drag.startX) / zoom;
        const dy = (event.clientY - drag.startY) / zoom;
        if (Math.abs(dx) + Math.abs(dy) > 4) {
          drag.moved = true;
          suppressClickRef.current = true;
        }
        setViewStateById((current) => {
          const currentView = current[drag.viewId];
          if (!currentView) return current;
          const movingNode = currentView.nodes.find(
            (node) => node.id === drag.nodeId,
          );
          if (!movingNode) return current;
          const occupied = currentView.nodes.filter(
            (node) => node.id !== drag.nodeId,
          );
          const placed = placeRelationshipNode(
            {
              ...movingNode,
              x: drag.originX + dx,
              y: drag.originY + dy,
            },
            occupied,
          );
          return {
            ...current,
            [drag.viewId]: {
              ...currentView,
              nodes: currentView.nodes.map((node) =>
                node.id === drag.nodeId
                  ? { ...node, x: placed.x, y: placed.y, userMoved: true }
                  : node,
              ),
            },
          };
        });
      }
      if (connectionRef.current && stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        setConnectionDraft((current) =>
          current
            ? {
                ...current,
                x2: (event.clientX - rect.left) / zoom,
                y2: (event.clientY - rect.top) / zoom,
              }
            : current,
        );
      }
    };
    const up = (event) => {
      if (connectionRef.current) {
        const connection = connectionRef.current;
        const target = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest(".s3-relationship-node");
        const targetId = target?.dataset.nodeId;
        if (targetId && targetId !== connection.sourceId) {
          const edge = {
            id: `manual-edge-${Date.now()}`,
            source: connection.sourceId,
            target: targetId,
            label: "",
            status: "用户维护",
            tone: "info",
            observedAt: "刚刚",
            evidence: ["用户维护"],
          };
          setViewStateById((current) => {
            const currentView = current[connection.viewId];
            if (!currentView) return current;
            return {
              ...current,
              [connection.viewId]: {
                ...currentView,
                edges: [...currentView.edges, edge],
              },
            };
          });
          setSelectionByView((current) => ({
            ...current,
            [connection.viewId]: { kind: "edge", id: edge.id },
          }));
          setDetailOpen(true);
          notify("关系已添加；双击连线可以补充关系名称");
        }
        connectionRef.current = null;
        setConnectionDraft(null);
      }
      dragRef.current = null;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [notify, zoom]);
  const selection =
    selectionByView[activeView.id] || activeView.defaultSelection;
  const activePan = panByView[activeView.id] || { x: 0, y: 0 };
  const nodesById = useMemo(
    () => Object.fromEntries(activeView.nodes.map((node) => [node.id, node])),
    [activeView],
  );
  const canvasSize = useMemo(
    () => relationshipCanvasSize(activeView.nodes),
    [activeView.nodes],
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
  useEffect(() => {
    if (!editable) return undefined;
    const addChildWithTab = (event) => {
      const target = event.target;
      if (
        event.key !== "Tab" ||
        !selectedNodeId ||
        editor ||
        deleteTarget ||
        (target instanceof HTMLElement &&
          (target.matches(
            "input, textarea, select, [contenteditable='true']",
          ) ||
            target.closest("[role='dialog'], .s4-select-panel")))
      )
        return;
      event.preventDefault();
      setEditor({ mode: "add-node", parentId: selectedNodeId });
    };
    window.addEventListener("keydown", addChildWithTab);
    return () => window.removeEventListener("keydown", addChildWithTab);
  }, [deleteTarget, editable, editor, selectedNodeId]);
  const select = (kind, id) => {
    setSelectionByView((current) => ({
      ...current,
      [activeView.id]: { kind, id },
    }));
    setDetailOpen(true);
    setContextMenu(null);
  };
  const switchView = (id) => {
    setViewId(id);
    setZoom(1);
    setDetailOpen(true);
    setEditor(null);
    setContextMenu(null);
  };
  const updateActivePan = (next) =>
    setPanByView((current) => ({
      ...current,
      [activeView.id]:
        typeof next === "function"
          ? next(current[activeView.id] || { x: 0, y: 0 })
          : next,
    }));
  const updateActiveView = (updater) =>
    setViewStateById((current) => ({
      ...current,
      [activeView.id]: updater(current[activeView.id] || activeView),
    }));
  const saveEditor = (draft) => {
    const now = Date.now();
    if (editor.mode === "add-node") {
      const parentNode = editor.parentId
        ? activeView.nodes.find((node) => node.id === editor.parentId)
        : null;
      const node = placeRelationshipNode(
        {
          id: `manual-node-${now}`,
          label: draft.label,
          meta: draft.meta || "用户添加",
          summary: "用户在当前资产关系图中手动添加的节点。",
          status: "用户维护",
          tone: "info",
          kind: "person",
          x: parentNode ? parentNode.x + NODE_WIDTH + 54 : 400,
          y: parentNode ? parentNode.y + NODE_HEIGHT + 26 : 190,
          evidence: ["用户维护"],
        },
        activeView.nodes,
      );
      updateActiveView((view) => ({
        ...view,
        nodes: [...view.nodes, node],
        edges: parentNode
          ? [
              ...view.edges,
              {
                id: `manual-edge-${now}`,
                source: parentNode.id,
                target: node.id,
                label: "",
                status: "用户维护",
                tone: "info",
                observedAt: "刚刚",
                evidence: ["用户维护"],
              },
            ]
          : view.edges,
      }));
      select("node", node.id);
      notify(
        parentNode
          ? `子节点已添加到“${parentNode.label}”下；双击连线可以补充关系名称`
          : "节点已添加到当前关系图",
      );
    } else if (editor.mode === "add-edge") {
      const edge = {
        id: `manual-edge-${now}`,
        source: draft.source,
        target: draft.target,
        label: draft.label,
        status: "用户维护",
        tone: "info",
        observedAt: "刚刚",
        evidence: ["用户维护"],
      };
      updateActiveView((view) => ({
        ...view,
        edges: [...view.edges, edge],
      }));
      select("edge", edge.id);
      notify("关系已添加到当前关系图");
    } else if (editor.mode === "edit-node") {
      updateActiveView((view) => ({
        ...view,
        nodes: view.nodes.map((node) =>
          node.id === editor.item.id
            ? {
                ...node,
                label: draft.label,
                meta: draft.meta,
                userEdited: true,
              }
            : node,
        ),
      }));
      notify("节点内容已更新");
    } else {
      updateActiveView((view) => ({
        ...view,
        edges: view.edges.map((edge) =>
          edge.id === editor.item.id
            ? { ...edge, label: draft.label, userEdited: true }
            : edge,
        ),
      }));
      notify("关系内容已更新");
    }
    setEditor(null);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    updateActiveView((view) =>
      deleteTarget.kind === "node"
        ? {
            ...view,
            nodes: view.nodes.filter((node) => node.id !== deleteTarget.id),
            edges: view.edges.filter(
              (edge) =>
                edge.source !== deleteTarget.id &&
                edge.target !== deleteTarget.id,
            ),
          }
        : {
            ...view,
            edges: view.edges.filter((edge) => edge.id !== deleteTarget.id),
          },
    );
    const remainingNode = activeView.nodes.find(
      (node) => node.id !== deleteTarget.id,
    );
    if (remainingNode) select("node", remainingNode.id);
    setDeleteTarget(null);
    notify(deleteTarget.kind === "node" ? "节点已删除" : "关系已删除");
  };
  return (
    <>
      <section
        className={`s3-relationship-workspace ${isFullscreen ? "is-fullscreen" : ""}`}
      >
        <header className="s3-relationship-header">
          {views.length > 1 ? (
            <div
              className="s3-relationship-view-tabs app-tabs"
              role="tablist"
              aria-label="专题图谱关系视图"
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
        <div
          className={`s3-relationship-body ${detailOpen ? "" : "is-detail-hidden"}`}
        >
          <div className="s3-relationship-canvas-shell">
            {editable ? (
              <div className="s3-relationship-actionbar">
                <Button
                  size="xs"
                  icon="plus"
                  data-tooltip="添加节点；选中节点后按 Tab 可添加子节点"
                  onClick={() => setEditor({ mode: "add-node" })}
                >
                  添加节点
                </Button>
              </div>
            ) : null}
            <div className="s3-relationship-controls">
              <IconButton
                icon="plus"
                label="放大关系画布"
                disabled={zoom >= 1.5}
                onClick={() =>
                  setZoom((value) =>
                    Math.min(1.5, Number((value + 0.1).toFixed(1))),
                  )
                }
              />
              <IconButton
                icon="minus"
                label="缩小关系画布"
                disabled={zoom <= 0.5}
                onClick={() =>
                  setZoom((value) =>
                    Math.max(0.5, Number((value - 0.1).toFixed(1))),
                  )
                }
              />
              <IconButton
                icon="refresh"
                label="重置关系画布"
                onClick={() => {
                  setZoom(1);
                  updateActivePan({ x: 0, y: 0 });
                }}
              />
              <IconButton
                icon={isFullscreen ? "minimize" : "maximize"}
                label={isFullscreen ? "退出关系画布全屏" : "进入关系画布全屏"}
                onClick={toggleFullscreen}
              />
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <div
              className="s3-relationship-viewport"
              onWheel={(event) => {
                event.preventDefault();
                const direction = event.deltaY > 0 ? -0.1 : 0.1;
                setZoom((value) =>
                  Math.min(
                    1.5,
                    Math.max(0.5, Number((value + direction).toFixed(1))),
                  ),
                );
              }}
              onPointerDown={(event) => {
                if (
                  event.button !== 0 ||
                  event.target.closest(".s3-relationship-node") ||
                  event.target.closest(".s3-relationship-edge") ||
                  event.target.closest(".s3-relationship-controls") ||
                  event.target.closest(".s3-relationship-actionbar")
                )
                  return;
                panRef.current = {
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  originX: activePan.x,
                  originY: activePan.y,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (panRef.current?.pointerId !== event.pointerId) return;
                updateActivePan({
                  x:
                    panRef.current.originX +
                    event.clientX -
                    panRef.current.startX,
                  y:
                    panRef.current.originY +
                    event.clientY -
                    panRef.current.startY,
                });
              }}
              onPointerUp={(event) => {
                if (panRef.current?.pointerId !== event.pointerId) return;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                panRef.current = null;
              }}
              onPointerCancel={(event) => {
                if (panRef.current?.pointerId !== event.pointerId) return;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                panRef.current = null;
              }}
            >
              <div
                ref={stageRef}
                className={`s3-relationship-stage is-${activeView.id}`}
                style={{
                  width: canvasSize.width,
                  height: canvasSize.height,
                  transform: `translate(${activePan.x}px, ${activePan.y}px) scale(${zoom})`,
                }}
              >
                <svg
                  className="s3-relationship-edges"
                  viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
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
                  {connectionDraft ? (
                    <path
                      className="s3-relationship-connection-draft"
                      d={`M ${connectionDraft.x1} ${connectionDraft.y1} L ${connectionDraft.x2} ${connectionDraft.y2}`}
                      markerEnd="url(#s3-arrow-info)"
                    />
                  ) : null}
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
                        aria-label={`${nodesById[edge.source].label}到${nodesById[edge.target].label}：${edge.label || "未命名关系"}`}
                        onClick={() => select("edge", edge.id)}
                        onDoubleClick={() => {
                          if (editable) {
                            setEditor({ mode: "edit-edge", item: edge });
                          }
                        }}
                        onContextMenu={(event) => {
                          if (!editable) return;
                          event.preventDefault();
                          event.stopPropagation();
                          select("edge", edge.id);
                          setContextMenu({
                            x: event.clientX,
                            y: event.clientY,
                            kind: "edge",
                            item: edge,
                          });
                        }}
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
                          style={{
                            "--s3-edge-width": `${edge.width || 1.5}px`,
                          }}
                        />
                        {edge.label ? (
                          <g
                            className="s3-relationship-edge-label"
                            transform={`translate(${point.x}, ${point.y})`}
                          >
                            <rect
                              x="-48"
                              y="-10"
                              width="96"
                              height="20"
                              rx="4"
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              {edge.label}
                            </text>
                          </g>
                        ) : null}
                      </g>
                    );
                  })}
                </svg>
                {activeView.nodes.map((node) => {
                  const active =
                    selection.kind === "node" && selection.id === node.id;
                  const assetType = relationshipAssetType(node);
                  return (
                    <button
                      type="button"
                      data-node-id={node.id}
                      className={`s3-relationship-node is-${node.kind} is-${node.tone} ${active ? "is-active" : ""} ${draggable || editable ? "is-draggable" : ""}`}
                      aria-pressed={active}
                      key={node.id}
                      style={{ left: node.x, top: node.y }}
                      onPointerDown={(event) => {
                        if (
                          (!draggable && !editable) ||
                          event.button !== 0 ||
                          event.target.closest(
                            ".s3-relationship-node-connector",
                          )
                        )
                          return;
                        event.preventDefault();
                        select("node", node.id);
                        dragRef.current = {
                          viewId: activeView.id,
                          nodeId: node.id,
                          startX: event.clientX,
                          startY: event.clientY,
                          originX: node.x,
                          originY: node.y,
                          moved: false,
                        };
                      }}
                      onClick={() => {
                        if (suppressClickRef.current) return;
                        select("node", node.id);
                      }}
                      onDoubleClick={() => {
                        if (editable) {
                          setEditor({ mode: "edit-node", item: node });
                        }
                      }}
                      onContextMenu={(event) => {
                        if (!editable) return;
                        event.preventDefault();
                        event.stopPropagation();
                        select("node", node.id);
                        setContextMenu({
                          x: event.clientX,
                          y: event.clientY,
                          kind: "node",
                          item: node,
                        });
                      }}
                    >
                      <span className="s3-relationship-node-copy">
                        <TooltipText
                          tip={node.label}
                          className="s3-relationship-node-title"
                          clampLines={1}
                        >
                          {node.label}
                        </TooltipText>
                        <TooltipText
                          tip={node.meta}
                          className="s3-relationship-node-subtitle"
                          clampLines={1}
                        >
                          {node.meta}
                        </TooltipText>
                        {assetType ? (
                          <span className="s3-relationship-node-asset">
                            <Icon name="link" />
                            已关联 · {assetType}
                          </span>
                        ) : null}
                      </span>
                      {node.tone === "warning" ? <Icon name="warning" /> : null}
                      {editable ? (
                        <span
                          role="button"
                          tabIndex="0"
                          className="s3-relationship-node-connector"
                          aria-label={`从${node.label}开始连线`}
                          data-tooltip="拖到另一个节点建立关系"
                          onPointerDown={(event) => {
                            if (event.button !== 0) return;
                            event.preventDefault();
                            event.stopPropagation();
                            connectionRef.current = {
                              viewId: activeView.id,
                              sourceId: node.id,
                            };
                            setConnectionDraft({
                              sourceId: node.id,
                              x1: node.x + NODE_WIDTH,
                              y1: node.y + NODE_HEIGHT / 2,
                              x2: node.x + NODE_WIDTH + 24,
                              y2: node.y + NODE_HEIGHT / 2,
                            });
                          }}
                        >
                          <Icon name="plus" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {detailOpen ? (
            <SelectedDetail
              view={activeView}
              selection={selection}
              decisions={decisions}
              onDecision={onDecision}
              onSelect={select}
              onClose={() => setDetailOpen(false)}
              onOpenEvidence={(label, selected) =>
                setEvidencePreview({
                  label,
                  selected,
                  view: activeView,
                  ...resolveEvidenceSnapshot(label, selected, activeView),
                })
              }
              onOpenEntity={(selected) => navigate(selected.detailPath)}
            />
          ) : null}
        </div>
      </section>
      {contextMenu ? (
        <div
          className="s3-relationship-context-menu"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 190),
            top: Math.min(contextMenu.y, window.innerHeight - 150),
          }}
          role="menu"
          aria-label={`${contextMenu.item.label || "未命名关系"}操作`}
        >
          <header>
            <b>{contextMenu.item.label || "未命名关系"}</b>
            <IconButton
              icon="close"
              label="关闭操作菜单"
              onClick={() => setContextMenu(null)}
            />
          </header>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setEditor({
                mode: contextMenu.kind === "node" ? "edit-node" : "edit-edge",
                item: contextMenu.item,
              });
              setContextMenu(null);
            }}
          >
            <Icon name="edit" />
            编辑
          </button>
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => {
              setDeleteTarget({
                kind: contextMenu.kind,
                id: contextMenu.item.id,
                label:
                  contextMenu.item.label ||
                  (contextMenu.kind === "node" ? "节点" : "未命名关系"),
              });
              setContextMenu(null);
            }}
          >
            <Icon name="trash" />
            删除
          </button>
        </div>
      ) : null}
      <RelationshipEditorDialog
        open={Boolean(editor)}
        mode={editor?.mode}
        item={editor?.item}
        view={activeView}
        close={() => setEditor(null)}
        onSave={saveEditor}
      />
      <Modal
        open={Boolean(deleteTarget)}
        close={() => setDeleteTarget(null)}
        title={deleteTarget?.kind === "node" ? "删除关系节点" : "删除节点关系"}
        description={
          deleteTarget?.kind === "node"
            ? "删除节点会同时移除当前关系图中与它相连的关系，不会删除正式资产。"
            : "只删除当前关系图中的这条关系，不会修改其他业务记录。"
        }
        footer={
          <>
            <Button onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button tone="danger" onClick={confirmDelete}>
              确认删除
            </Button>
          </>
        }
      >
        <p className="s3-relationship-delete-copy">
          即将删除“{deleteTarget?.label}”。该操作仅影响当前关系图。
        </p>
      </Modal>
      <Modal
        open={Boolean(evidencePreview)}
        close={() => setEvidencePreview(null)}
        title="查看证据内容"
        description={evidencePreview?.label}
        size="lg"
        footer={
          <Button tone="primary" onClick={() => setEvidencePreview(null)}>
            关闭
          </Button>
        }
      >
        {evidencePreview ? (
          <div className="s3-evidence-preview">
            <dl>
              <div>
                <dt>来源类型</dt>
                <dd>{evidencePreview.type}</dd>
              </div>
              <div>
                <dt>获取时间</dt>
                <dd>{evidencePreview.capturedAt}</dd>
              </div>
              <div>
                <dt>支持判断</dt>
                <dd>{evidencePreview.selected.label}</dd>
              </div>
              <div>
                <dt>关系视图</dt>
                <dd>{evidencePreview.view.label}</dd>
              </div>
            </dl>
            <section>
              <small>本轮读取到的关键内容</small>
              <p>{evidencePreview.content}</p>
            </section>
            <p>
              原始来源、读取时间和任务上下文会随证据共同保存；来源内容发生变化时，不覆盖本次快照。
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
