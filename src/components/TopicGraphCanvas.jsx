import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {graphText} from "./graph-copy.js";
import {Icon as ProtoIcon} from "./Icon";
import {TooltipText} from "../stage4/asset-ui";
import { GraphPresentationControls } from "./GraphPresentationControls";
import { GraphNodePorts } from "./GraphNodePorts";
import { GraphEdgeHandles } from "./GraphEdgeHandles";
import { useGraphReconnect } from "./useGraphReconnect";
import { useGraphEdgeHover } from "./useGraphEdgeHover";
import { graphConnectionPreview, graphPortHit } from "./graph-connection-preview.js";
import {useToast} from "../stage4/asset-ui";
import { useGraphWheelZoom } from "./useGraphWheelZoom";
import { useGraphPan } from "./useGraphPan";
import { useGraphUndoShortcut } from "./useGraphUndoShortcut";
import { readGraphPresentation, writeGraphPresentation } from "./graph-presentation-storage.js";
import { useGraphEdgePorts } from "./useGraphEdgePorts";
import { graphEdgeGeometry, graphFitCamera, graphFitZoom, graphLayoutPan, graphPortPoint, layoutGraph } from "./graph-presentation.js";
import { clampGraphNode, expandGraphCanvasBounds, findGraphReparentTarget, getDescendantIds, graphCanvasMinimumBounds, graphNodeWidth, graphNodeHeight, nodeKindIcon, placeMovedGraphNodes, } from "./topic-graph-geometry.js";
export function GraphCanvas({ pageKey, nodes, edges, selectedIds, setSelectedIds, selectedEdgeId, setSelectedEdgeId, onNodesChange, onMoveCommit, collapsed, setCollapsed, zoom, focusNodeId, onContextMenu, onEditRelation, onCreateRelation, onReconnectRelation, onReparentNodes, onZoom, connectionMode = false, presentationControlsTarget, onCreateNode, apiRef, history, onBeforeChange, readingOnly = false, }) {
    const t = graphText;
    const notify = useToast();
    const scrollRef = useRef(null);
    const stageRef = useRef(null);
    const dragRef = useRef(null);
    const connectionRef = useRef(null);
    /**
     * 原型缺陷修正：多选时批量条出现在画布上方、把画布整体下推 42px，松手位置已不在节点上，
     * 浏览器把 click 派发给画布，原型的“点空白取消选择”随即清空了刚建立的多选。
     * 这里记住“按下发生在节点上”，这一次 click 不当作点空白。
     */
    const pressedOnNodeRef = useRef(false);
    const [connectionDraft, setConnectionDraft] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);
    const [shortcutOpen, setShortcutOpen] = useState(false);
    const shortcutId = useId();
    const lastPanRef = useRef(Number.NEGATIVE_INFINITY);
    const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
    const presentationKey = readingOnly ? undefined : `hunter.graph.presentation.${pageKey}`;
    const [presentationOwner, setPresentationOwner] = useState(presentationKey);
    const [lineStyle, setLineStyle] = useState(() => readGraphPresentation(presentationKey).lineStyle);
    const [layoutDirection, setLayoutDirection] = useState(() => readGraphPresentation(presentationKey).direction);
    const edgeHover = useGraphEdgeHover(pageKey);
    const { hoveredEdgeId } = edgeHover;
    const [storedBounds, setCanvasBounds] = useState(() => expandGraphCanvasBounds(graphCanvasMinimumBounds, nodes));
    const canvasBounds = useMemo(() => expandGraphCanvasBounds(storedBounds, nodes), [storedBounds, nodes]);
    const originX = canvasBounds.minX || 0, originY = canvasBounds.minY || 0;
    const panGesture = useGraphPan({ viewportRef: scrollRef, stageRef, pan: canvasPan, zoom, originX, originY, onPan: setCanvasPan,
        onEnd: moved => { if (moved)
            lastPanRef.current = performance.now(); }, scopeKey: pageKey });
    const hiddenByCollapse = useMemo(() => {
        const ids = new Set();
        collapsed.forEach((id) => getDescendantIds(nodes, id).forEach((child) => ids.add(child)));
        return ids;
    }, [collapsed, nodes]);
    const visibleNodes = useMemo(() => nodes.filter((node) => !node.hidden && !hiddenByCollapse.has(node.id)), [nodes, hiddenByCollapse]);
    const nodeMap = useMemo(() => new Map(visibleNodes.map((node) => [node.id, node])), [visibleNodes]);
    const visibleEdges = useMemo(() => edges.filter((edge) => !edge.hidden && nodeMap.has(edge.source) && nodeMap.has(edge.target)), [edges, nodeMap]);
    const parentIds = useMemo(() => new Set(nodes.filter(node => !node.hidden && node.parentId).map(node => node.parentId)), [nodes]);
    const portLocks = useGraphEdgePorts({ nodes, edges, direction: layoutDirection, scopeKey: pageKey, storageKey: readingOnly ? undefined : `${presentationKey}.ports` });
    const reconnect = useGraphReconnect({ nodes: visibleNodes, edges: visibleEdges, scopeKey: pageKey, stageRef, zoom, options: portLocks.options, setPorts: portLocks.set,
        onCommit: onReconnectRelation, onBeforeCommit: () => onBeforeChange?.("reconnect"), onError: message => notify(message, "error"),
        messages: { self: t("graphReconnect.self"), duplicate: t("graphReconnect.duplicate"), cycle: t("graphReconnect.cycle"), unavailable: t("graphReconnect.unavailable"), failed: t("graphReconnect.failed") } });
    const reconnectEdge = visibleEdges.find(edge => edge.id === (reconnect.draft?.edge.id ?? edgeHover.handleEdgeId ?? selectedEdgeId));
    useGraphWheelZoom({ viewportRef: scrollRef, zoom, pan: canvasPan, onZoom, onPan: setCanvasPan, getPan: panGesture.getPan, scopeKey: pageKey, onGestureStart: () => {
            panGesture.cancel();
            const drag = dragRef.current;
            if (drag?.moved)
                onNodesChange(current => current.map(node => drag.original[node.id] ? { ...node, ...drag.original[node.id] } : node));
            dragRef.current = null;
            connectionRef.current = null;
            setConnectionDraft(null);
            setDropTargetId(null);
            reconnect.cancel();
        } });
    useGraphUndoShortcut(readingOnly ? undefined : history, () => Boolean(dragRef.current || connectionRef.current || reconnect.active || reconnect.pending));
    const fit = () => {
        const camera = graphFitCamera(visibleNodes, scrollRef.current);
        if (!camera)
            return;
        panGesture.cancel();
        setCanvasPan(camera.pan);
        onZoom(camera.zoom);
        scrollRef.current?.scrollTo?.({ left: 0, top: 0 });
    };
    const fitRef = useRef(fit);
    fitRef.current = fit;
    useImperativeHandle(apiRef, () => ({
        fit,
        capture: () => ({ lineStyle, layoutDirection, ports: portLocks.capture(), zoom, pan: panGesture.getPan() }),
        restore: state => {
            panGesture.cancel();
            reconnect.cancel();
            setLineStyle(state.lineStyle);
            setLayoutDirection(state.layoutDirection);
            portLocks.restore(state.ports);
            setCanvasPan(state.pan);
            onZoom(state.zoom);
            scrollRef.current?.scrollTo?.({ left: 0, top: 0 });
        },
    }));
    useEffect(() => {
        const viewport = scrollRef.current;
        if (!viewport || !nodes.length)
            return;
        let done = false;
        const apply = () => {
            if (done || !viewport.clientWidth || !viewport.clientHeight)
                return;
            done = true;
            fitRef.current();
        };
        const frame = requestAnimationFrame(apply);
        const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(apply);
        observer?.observe(viewport);
        return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
    }, [pageKey, nodes.length > 0]);
    useEffect(() => {
        const bounds = expandGraphCanvasBounds(graphCanvasMinimumBounds, nodes);
        setCanvasBounds(bounds);
        setCanvasPan({ x: -(bounds.minX || 0) * zoom, y: -(bounds.minY || 0) * zoom });
        const saved = readGraphPresentation(presentationKey);
        setLineStyle(saved.lineStyle);
        setLayoutDirection(saved.direction);
        setPresentationOwner(presentationKey);
        // 原型只在切换图页时重置；本地节点异步加载，到达后同样按节点扩展一次。
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageKey, nodes.length === 0]);
    useEffect(() => {
        if (!readingOnly && presentationOwner === presentationKey)
            writeGraphPresentation(presentationKey, { lineStyle, direction: layoutDirection, adaptiveNodes: [] });
    }, [presentationOwner, presentationKey, lineStyle, layoutDirection]);
    useEffect(() => {
        if (!focusNodeId || !scrollRef.current)
            return;
        const target = nodes.find((node) => node.id === focusNodeId);
        if (!target)
            return;
        const scroller = scrollRef.current;
        if (typeof scroller.scrollTo !== "function")
            return;
        setCanvasPan(graphLayoutPan(nodes, scroller, zoom, layoutDirection, { focusId: target.id }));
        scroller.scrollTo({ left: 0, top: 0 });
        // Reposition only for an explicit focus or newly loaded page, not hover, reflow or zoom.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusNodeId, pageKey, nodes.length === 0]);
    const autoLayout = (direction) => {
        onBeforeChange?.("layout");
        reconnect.cancel();
        const next = layoutGraph(nodes, edges, direction);
        onNodesChange(() => next);
        onMoveCommit(Object.fromEntries(next.map(node => [node.id, { x: node.x, y: node.y }])));
        connectionRef.current = null;
        setConnectionDraft(null);
        portLocks.reset(next, direction);
        setLayoutDirection(direction);
        setCanvasBounds(expandGraphCanvasBounds(graphCanvasMinimumBounds, next));
        const nextZoom = graphFitZoom(next, scrollRef.current);
        setCanvasPan(graphLayoutPan(next, scrollRef.current, nextZoom, direction, { focusId: readingOnly ? focusNodeId : undefined }));
        scrollRef.current?.scrollTo?.({ left: 0, top: 0 });
        onZoom(nextZoom);
        edgeHover.reset();
    };
    useEffect(() => {
        const move = (event) => {
            if (dragRef.current) {
                const { startX, startY, original, ids } = dragRef.current;
                if (!dragRef.current.moved && Math.hypot(event.clientX - startX, event.clientY - startY) < 4)
                    return;
                if (!dragRef.current.moved)
                    onBeforeChange?.("move");
                dragRef.current.moved = true;
                const dx = (event.clientX - startX) / zoom;
                const dy = (event.clientY - startY) / zoom;
                const desiredById = Object.fromEntries(ids.map((id) => [id, { x: original[id].x + dx, y: original[id].y + dy }]));
                const desiredNodes = nodes.map((node) => desiredById[node.id] ? { ...node, ...desiredById[node.id] } : node);
                const nextBounds = expandGraphCanvasBounds(canvasBounds, desiredNodes);
                if (nextBounds !== canvasBounds)
                    setCanvasBounds(nextBounds);
                onNodesChange((current) => current.map((node) => desiredById[node.id]
                    ? { ...node, ...clampGraphNode({ ...node, ...desiredById[node.id] }, nextBounds), userMoved: true }
                    : node));
                if (stageRef.current) {
                    const target = findGraphReparentTarget(nodes, ids, desiredById);
                    const nextTargetId = target?.id || null;
                    dragRef.current.dropTargetId = nextTargetId;
                    setDropTargetId(nextTargetId);
                }
            }
            if (connectionRef.current && stageRef.current) {
                const rect = stageRef.current.getBoundingClientRect();
                setConnectionDraft((current) => current
                    ? { ...current, x2: (event.clientX - rect.left) / zoom + originX, y2: (event.clientY - rect.top) / zoom + originY, hit: graphPortHit(stageRef.current, event.clientX, event.clientY) }
                    : current);
            }
        };
        const up = (event) => {
            if (connectionRef.current) {
                const connection = connectionRef.current;
                const hit = graphPortHit(stageRef.current, event.clientX, event.clientY);
                const preview = graphConnectionPreview(nodes, connection.sourceId, connection.sourcePort, { x: 0, y: 0 }, hit, { direction: layoutDirection, style: lineStyle });
                if (preview?.targetId) {
                    onCreateRelation({ source: connection.sourceId, target: preview.targetId, sourcePort: connection.sourcePort, targetPort: preview.targetPort });
                }
                connectionRef.current = null;
                setConnectionDraft(null);
            }
            if (dragRef.current?.moved)
                lastPanRef.current = performance.now();
            if (dragRef.current?.moved && dragRef.current.dropTargetId) {
                onReparentNodes(dragRef.current.ids, dragRef.current.dropTargetId);
            }
            else if (dragRef.current?.moved) {
                const { ids, original } = dragRef.current;
                const desiredById = Object.fromEntries(nodes.filter((node) => ids.includes(node.id)).map((node) => [node.id, { x: node.x, y: node.y }]));
                const placed = placeMovedGraphNodes(nodes, ids, desiredById, canvasBounds);
                const moved = {};
                placed.forEach((node) => {
                    if (!ids.includes(node.id))
                        return;
                    const before = original[node.id];
                    if (before && (Math.round(before.x) !== Math.round(node.x) || Math.round(before.y) !== Math.round(node.y))) {
                        moved[node.id] = { x: Math.round(node.x), y: Math.round(node.y) };
                    }
                });
                onNodesChange(() => placed);
                if (Object.keys(moved).length)
                    onMoveCommit(moved);
            }
            dragRef.current = null;
            setDropTargetId(null);
        };
        const cancel = () => { connectionRef.current = null; setConnectionDraft(null); };
        const escape = (event) => { if (event.key === "Escape" && connectionRef.current) {
            event.preventDefault();
            cancel();
        } };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", cancel);
        window.addEventListener("blur", cancel);
        window.addEventListener("keydown", escape);
        return () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
            window.removeEventListener("pointercancel", cancel);
            window.removeEventListener("blur", cancel);
            window.removeEventListener("keydown", escape);
        };
    }, [canvasBounds, nodes, onCreateRelation, onMoveCommit, onNodesChange, onReparentNodes, zoom, originX, originY, layoutDirection, lineStyle]);
    const connectionPreview = connectionDraft ? graphConnectionPreview(visibleNodes, connectionDraft.sourceId, connectionDraft.sourcePort, { x: connectionDraft.x2, y: connectionDraft.y2 }, connectionDraft.hit, { direction: layoutDirection, style: lineStyle }) : null;
    // Camera-only renders retain the scene; cached event handlers still read current actions.
    const sceneActions = useRef({ portLocks, reconnect, edgeHover, setSelectedIds, setSelectedEdgeId, setCollapsed, onContextMenu, onCreateRelation, onEditRelation });
    sceneActions.current = { portLocks, reconnect, edgeHover, setSelectedIds, setSelectedEdgeId, setCollapsed, onContextMenu, onCreateRelation, onEditRelation };
    const edgeElements = useMemo(() => visibleEdges.slice().sort((a, b) => Number(a.id === hoveredEdgeId) - Number(b.id === hoveredEdgeId)).map((relation) => {
        const source = nodeMap.get(relation.source);
        const target = nodeMap.get(relation.target);
        const { path, x: labelX, y: labelY } = graphEdgeGeometry(source, target, { direction: layoutDirection, style: lineStyle, ...portLocks.options(relation) });
        const labelWidth = Math.max(54, Math.min(132, relation.label.length * 11 + 22));
        return (<g key={relation.id} data-source={relation.source} data-target={relation.target} onPointerEnter={event => { if (event.pointerType !== "touch" && !window.matchMedia?.("(pointer: coarse)")?.matches)
            sceneActions.current.edgeHover.enterEdge(relation.id); }} onPointerLeave={() => sceneActions.current.edgeHover.leaveEdge(relation.id)} className={`tg-edge is-${relation.kind} ${selectedEdgeId === relation.id ? "is-selected" : ""} ${relation.status === "review" ? "is-review" : ""}`}>
        <path d={path} className="tg-edge-line" markerEnd="url(#tg-arrow)"/>
        <path d={path} className="tg-edge-hit" data-edge-id={relation.id} data-edge-label={relation.label || t("graph.unnamedRelation")} role="button" tabIndex={0} aria-label={t("graphPresentation.edge", { label: relation.label || t("graph.unnamedRelation") })} onKeyDown={event => {
                if (event.key !== "Enter" && event.key !== " ")
                    return;
                event.preventDefault();
                sceneActions.current.setSelectedEdgeId(relation.id);
                sceneActions.current.setSelectedIds([]);
            }} onClick={(event) => {
                event.stopPropagation();
                sceneActions.current.setSelectedEdgeId(relation.id);
                sceneActions.current.setSelectedIds([]);
            }} onDoubleClick={(event) => {
                event.stopPropagation();
                if (!readingOnly) sceneActions.current.onEditRelation?.(relation);
            }}/>
        {relation.label && hoveredEdgeId === relation.id ? (<g className="tg-edge-label-button" role="button" tabIndex={0} aria-label={t("graph.editRelationNamed", { label: relation.label })} transform={`translate(${labelX - labelWidth / 2} ${labelY - 13})`} onClick={(event) => {
                    event.stopPropagation();
                    sceneActions.current.setSelectedEdgeId(relation.id);
                    sceneActions.current.setSelectedIds([]);
                }} onDoubleClick={(event) => {
                    event.stopPropagation();
                    if (!readingOnly) sceneActions.current.onEditRelation?.(relation);
                }} onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ")
                        return;
                    event.preventDefault();
                    sceneActions.current.setSelectedEdgeId(relation.id);
                    sceneActions.current.setSelectedIds([]);
                }}>
            <rect width={labelWidth} height="26" rx="5"/>
            <text x={labelWidth / 2} y="17" textAnchor="middle">
              {relation.label}
            </text>
          </g>) : null}
      </g>);
    }), [visibleEdges, nodeMap, layoutDirection, lineStyle, portLocks.options, selectedEdgeId, hoveredEdgeId, readingOnly, t]);
    const nodeElements = useMemo(() => visibleNodes.map((item) => {
        const selected = selectedIds.includes(item.id);
        const hasChildren = parentIds.has(item.id);
        const kindLabel = t(`graph.kind.${item.kind}`);
        return (<button type="button" key={item.id} className={`tg-node is-${item.kind} is-${item.status} ${selected ? "is-selected" : ""} ${focusNodeId === item.id ? "is-focused" : ""} ${dropTargetId === item.id ? "is-drop-target" : ""}`} data-node-id={item.id} data-world-x={item.x} data-world-y={item.y} style={{ left: item.x - originX, top: item.y - originY, width: item.width || graphNodeWidth }} aria-pressed={selected} onPointerDown={(event) => {
                if (readingOnly || event.button !== 0 || event.target.closest(".tg-node-connector"))
                    return;
                sceneActions.current.portLocks.freeze();
                event.stopPropagation();
                if (event.pointerType === "touch")
                    event.currentTarget.focus({ preventScroll: true });
                const nextIds = event.shiftKey || event.metaKey || event.ctrlKey
                    ? selected
                        ? selectedIds.filter((id) => id !== item.id)
                        : [...selectedIds, item.id]
                    : selectedIds.includes(item.id) && selectedIds.length > 1
                        ? selectedIds
                        : [item.id];
                sceneActions.current.setSelectedIds(nextIds);
                sceneActions.current.setSelectedEdgeId(null);
                dragRef.current = {
                    startX: event.clientX,
                    startY: event.clientY,
                    ids: nextIds,
                    original: Object.fromEntries(nodes.filter((node) => nextIds.includes(node.id)).map((node) => [node.id, { x: node.x, y: node.y }])),
                };
            }} onClick={(event) => {
                event.stopPropagation();
                if (!selectedIds.includes(item.id))
                    sceneActions.current.setSelectedIds([item.id]);
                sceneActions.current.setSelectedEdgeId(null);
            }} onDoubleClick={(event) => {
                event.stopPropagation();
                if (readingOnly || event.target.closest(".tg-node-connector, .tg-collapse-node") || performance.now() - lastPanRef.current < 250)
                    return;
                sceneActions.current.onContextMenu({ x: event.clientX, y: event.clientY, node: item, action: "edit" });
            }} onKeyDown={event => {
                const connection = connectionRef.current;
                if (!connection?.keyboard || event.key !== "Enter" && event.key !== " ")
                    return;
                event.preventDefault();
                event.stopPropagation();
                if (connection.sourceId !== item.id)
                    sceneActions.current.onCreateRelation({ source: connection.sourceId, target: item.id, sourcePort: connection.sourcePort });
                connectionRef.current = null;
                setConnectionDraft(null);
            }} onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                sceneActions.current.setSelectedIds([item.id]);
                if (!readingOnly) sceneActions.current.onContextMenu?.({ x: event.clientX, y: event.clientY, node: item });
            }}>
        <span className="tg-node-kind">
          <ProtoIcon name={nodeKindIcon[item.kind]}/>
        </span>
        <span className="tg-node-copy">
          <TooltipText tip={item.label} className="tg-node-title" clampLines={1}>
            {item.label}
          </TooltipText>
          <TooltipText tip={item.subtitle || kindLabel} className="tg-node-subtitle" clampLines={1}>
            {item.subtitle || kindLabel}
          </TooltipText>
          {item.assetPath ? (<span className="tg-node-asset">
              <ProtoIcon name="link"/>
              {t("graph.assetLinked", { type: item.assetType || t("graph.assetCandidate") })}
            </span>) : null}
        </span>
        {item.status === "review" ? (<span className="tg-node-marker is-review">
            <ProtoIcon name="warning"/>
            {item.marker || t(item.markerKey ?? "graph.markerReview")}
          </span>) : null}
        {!readingOnly ? <GraphNodePorts label={item.label} className="tg-node-connector" destination={reconnect.active} activeSide={connectionDraft?.sourceId === item.id ? connectionDraft.sourcePort : undefined} onStart={(sourcePort, keyboard) => {
                if (sceneActions.current.reconnect.active) {
                    void sceneActions.current.reconnect.choose(item.id, sourcePort);
                    return;
                }
                if (sceneActions.current.reconnect.pending)
                    return;
                const point = graphPortPoint(item, sourcePort);
                connectionRef.current = { sourceId: item.id, sourcePort, keyboard };
                setConnectionDraft({
                    sourceId: item.id,
                    sourcePort,
                    x1: point.x,
                    y1: point.y,
                    x2: point.x + (sourcePort === "left" ? -24 : sourcePort === "right" ? 24 : 0),
                    y2: point.y + (sourcePort === "top" ? -24 : sourcePort === "bottom" ? 24 : 0),
                });
            }}/> : null}
        {hasChildren ? (<span role="button" tabIndex={0} className="tg-collapse-node" aria-label={collapsed.has(item.id) ? t("graph.expandChildren") : t("graph.collapseChildren")} onClick={(event) => {
                    event.stopPropagation();
                    sceneActions.current.setCollapsed((current) => {
                        const next = new Set(current);
                        if (next.has(item.id))
                            next.delete(item.id);
                        else
                            next.add(item.id);
                        return next;
                    });
                }}>
            <ProtoIcon name={collapsed.has(item.id) ? "plus" : "minus"}/>
          </span>) : null}
      </button>);
    }), [visibleNodes, nodes, selectedIds, focusNodeId, dropTargetId, parentIds, collapsed, reconnect.active, reconnect.pending, connectionDraft?.sourceId, connectionDraft?.sourcePort, originX, originY, readingOnly, t]);
    const shortcuts = [
        [t("graphUndo.label"), ["Ctrl+Z", "⌘Z"]],
        [t("graphUndo.redoLabel"), ["Ctrl+Y", "Ctrl+Shift+Z", "⌘Shift+Z"]],
        [t("graph.shortcut.addNode"), t("graph.shortcut.addNodeHow")],
        [t("graph.shortcut.addChild"), ["Tab"]],
        [t("graph.shortcut.addSibling"), ["Enter"]],
        [t("graph.shortcut.edit"), [t("graph.shortcut.doubleClick"), "E", "F2"]],
        [t("graph.shortcut.delete"), ["Del", "Backspace"]],
        [t("graph.shortcut.zoom"), t("graph.shortcut.zoomHow")],
        [t("graph.shortcut.pan"), t("graph.shortcut.panHow")],
        [t("graph.shortcut.move"), t("graph.shortcut.moveHow")],
        [t("graph.shortcut.reparent"), t("graph.shortcut.reparentHow")],
        [t("graph.shortcut.more"), t("graph.shortcut.moreHow")],
    ];
    return (<div className={`tg-canvas-frame ${connectionMode ? "is-connection-mode" : ""} ${reconnect.active ? "is-reconnecting" : ""}`}>
      {presentationControlsTarget ? createPortal(<GraphPresentationControls lineStyle={lineStyle} onLineStyle={value => { if (value !== lineStyle) {
            onBeforeChange?.("line-style");
            setLineStyle(value);
        } }} onLayout={autoLayout} disabled={nodes.length < 2 || reconnect.pending} placement="toolbar"/>, presentationControlsTarget) : null}
      {readingOnly && !presentationControlsTarget ? <div className="tg-presentation-controls"><GraphPresentationControls lineStyle={lineStyle} onLineStyle={setLineStyle} onLayout={autoLayout} disabled={nodes.length < 2} /></div> : null}
      {connectionMode ? (<div className="tg-connection-mode-hint">
          <ProtoIcon name="link"/>
          {t("graph.connectionHint")}
        </div>) : null}
      {!readingOnly ? <div className={`tg-shortcut-panel ${shortcutOpen ? "is-open" : ""}`}>
        <button type="button" aria-label={shortcutOpen ? t("graph.shortcutsHide") : t("graph.shortcutsShow")} aria-expanded={shortcutOpen} aria-controls={shortcutOpen ? shortcutId : undefined} onClick={() => setShortcutOpen((value) => !value)}>
          <ProtoIcon name="keyboard"/>
          {!shortcutOpen ? <span>{t("graph.shortcuts")}</span> : null}
          <ProtoIcon name={shortcutOpen ? "chevronUp" : "chevronDown"}/>
        </button>
        {shortcutOpen ? (<dl id={shortcutId}>
            {shortcuts.map(([label, keys]) => (<div key={label}>
                <dt>{label}</dt>
                <dd>{Array.isArray(keys) ? keys.map((key) => <kbd key={key}>{key}</kbd>) : keys}</dd>
              </div>))}
          </dl>) : null}
      </div> : null}
      <div ref={scrollRef} className="tg-canvas-scroll is-pan-mode" data-testid="graph-canvas-scroll" onDragStartCapture={event => event.preventDefault()} onClickCapture={event => { if (panGesture.suppressClick()) {
        event.preventDefault();
        event.stopPropagation();
    } }} onPointerDownCapture={(event) => {
            pressedOnNodeRef.current = Boolean(event.target.closest(".tg-node"));
        }} onPointerDown={(event) => {
            const target = event.target;
            if (event.button !== 0 || target.closest(".tg-collapse-node, .graph-edge-handle") ||
                !readingOnly && target.closest(".tg-node, .tg-edge-label-button, .tg-edge-hit"))
                return;
            edgeHover.reset();
            panGesture.start(event);
        }} onPointerMove={panGesture.move} onPointerUp={panGesture.end} onPointerCancel={panGesture.cancelEvent} onLostPointerCapture={panGesture.cancelEvent} onClick={(event) => {
            const target = event.target;
            if (pressedOnNodeRef.current) {
                pressedOnNodeRef.current = false;
                return;
            }
            if (target.closest(".tg-node") || target.closest(".tg-edge-hit, .graph-edge-handle"))
                return;
            setSelectedIds([]);
            setSelectedEdgeId(null);
        }} onDoubleClick={(event) => {
            const target = event.target;
            if (!onCreateNode || !stageRef.current || event.button !== 0 ||
                target.closest(".tg-node, .tg-edge-hit, .tg-edge-label-button, .graph-edge-handle") ||
                connectionRef.current || reconnect.active || reconnect.pending || performance.now() - lastPanRef.current < 250)
                return;
            event.preventDefault();
            const rect = stageRef.current.getBoundingClientRect();
            onCreateNode({ x: (event.clientX - rect.left) / zoom + originX - graphNodeWidth / 2,
                y: (event.clientY - rect.top) / zoom + originY - graphNodeHeight / 2 });
        }}>
        <div className="tg-canvas-size" style={{ width: canvasBounds.width * zoom, height: canvasBounds.height * zoom }}>
          <div ref={stageRef} data-origin-x={originX} data-origin-y={originY} className={`tg-canvas-stage ${zoom < 0.8 ? "is-compact" : ""}`} style={{
            width: canvasBounds.width,
            height: canvasBounds.height,
            transform: `translate(${canvasPan.x + originX * zoom}px, ${canvasPan.y + originY * zoom}px) scale(${zoom})`,
        }}>
            <svg className="tg-edge-layer" width={canvasBounds.width} height={canvasBounds.height} style={{ width: canvasBounds.width, height: canvasBounds.height }} viewBox={`${originX} ${originY} ${canvasBounds.width} ${canvasBounds.height}`} aria-label={t("graph.edgesAria")}>
              <defs>
                <marker id="tg-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0 0 L8 4 L0 8 Z"/>
                </marker>
              </defs>
              {connectionDraft ? (<path className="tg-connection-draft" d={connectionPreview?.path} markerEnd="url(#tg-arrow)"/>) : null}
              {edgeElements}
            </svg>
            {reconnect.draft ? <svg className="tg-edge-layer" width={canvasBounds.width} height={canvasBounds.height} viewBox={`${originX} ${originY} ${canvasBounds.width} ${canvasBounds.height}`} aria-hidden="true" style={{ pointerEvents: "none" }}><path className="graph-reconnect-draft" d={reconnect.preview(lineStyle)?.path} markerEnd="url(#tg-arrow)"/></svg> : null}
            {nodeElements}
            {!readingOnly && reconnectEdge ? <GraphEdgeHandles edgeId={reconnectEdge.id} points={reconnect.endpoints(reconnectEdge)} originX={originX} originY={originY} zoom={zoom} pending={reconnect.pending} onEnter={() => edgeHover.hold(reconnectEdge.id)} onLeave={() => edgeHover.release(reconnectEdge.id)} labels={{ source: t("graphReconnect.source"), target: t("graphReconnect.target") }} onStart={(end, keyboard, pointerId) => {
                connectionRef.current = null;
                setConnectionDraft(null);
                dragRef.current = null;
                panGesture.cancel();
                reconnect.start(reconnectEdge, end, keyboard, pointerId);
            }}/> : null}
          </div>
        </div>
      </div>
    </div>);
}
