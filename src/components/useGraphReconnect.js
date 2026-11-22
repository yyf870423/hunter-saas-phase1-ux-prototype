import { useEffect, useRef, useState } from "react";
import { graphEdgeGeometry, graphPortPoint } from "./graph-presentation.js";
import { graphNearestPort, graphPortHit, graphReconnectPreview } from "./graph-connection-preview.js";
export function reconnectError(nodes, edges, edge, pair) {
    if (pair.source === pair.target)
        return "self";
    if (pair.source === edge.source && pair.target === edge.target)
        return null;
    if (edges.some(other => other.id !== edge.id && other.source === pair.source && other.target === pair.target))
        return "duplicate";
    if (edge.origin === "hierarchy") {
        const links = nodes.filter(node => node.parentId && !(node.id === edge.target && node.parentId === edge.source)).map(node => ({ source: node.parentId, target: node.id }));
        links.push(...edges.filter(other => other.id !== edge.id && other.origin === "hierarchy"));
        const queue = [pair.target], visited = new Set();
        while (queue.length) {
            const id = queue.pop();
            if (id === pair.source)
                return "cycle";
            if (visited.has(id))
                continue;
            visited.add(id);
            queue.push(...links.filter(link => link.source === id).map(link => link.target));
        }
    }
    return null;
}
export function useGraphReconnect({ nodes, edges, scopeKey, stageRef, zoom, width = 180, height = 86, options, setPorts, onCommit, onError, messages }) {
    const [draft, setDraft] = useState(null), [pending, setPending] = useState(false);
    const draftRef = useRef(null), pendingRef = useRef(false), generation = useRef(0);
    const suppressClickUntil = useRef(0);
    const latest = useRef({ nodes, edges, scopeKey, stageRef, zoom, width, height, options, setPorts, onCommit, onError, messages });
    latest.current = { nodes, edges, scopeKey, stageRef, zoom, width, height, options, setPorts, onCommit, onError, messages };
    const cancel = () => { draftRef.current = null; setDraft(null); };
    useEffect(() => { generation.current++; cancel(); pendingRef.current = false; setPending(false); return () => { generation.current++; }; }, [scopeKey]);
    useEffect(() => {
        const current = draftRef.current;
        if (current && !edges.some(edge => edge.id === current.edge.id && edge.source === current.edge.source && edge.target === current.edge.target))
            cancel();
    }, [edges]);
    const choose = async (nodeId, side) => {
        const current = draftRef.current;
        if (!current || pendingRef.current)
            return;
        cancel();
        const state = latest.current;
        if (!state.nodes.some(node => node.id === nodeId))
            return;
        const pair = { source: current.edge.source, target: current.edge.target, ...current.ports, [current.end]: nodeId, [current.end === "source" ? "sourcePort" : "targetPort"]: side };
        const error = reconnectError(state.nodes, state.edges, current.edge, pair);
        if (error) {
            state.onError(state.messages[error]);
            return;
        }
        const changed = pair.source !== current.edge.source || pair.target !== current.edge.target;
        if (changed && !state.onCommit) {
            state.onError(state.messages.unavailable);
            return;
        }
        const operation = generation.current;
        pendingRef.current = true;
        setPending(true);
        try {
            if (changed)
                await state.onCommit(current.edge, pair);
            if (generation.current === operation)
                state.setPorts({ ...current.edge, ...pair }, { sourcePort: pair.sourcePort, targetPort: pair.targetPort });
        }
        catch (error) {
            if (generation.current === operation)
                state.onError(error instanceof Error ? error.message : state.messages.failed);
        }
        finally {
            if (generation.current === operation) {
                pendingRef.current = false;
                setPending(false);
            }
        }
    };
    const chooseRef = useRef(choose);
    chooseRef.current = choose;
    useEffect(() => {
        const pointAt = (event) => {
            const state = latest.current, stage = state.stageRef.current;
            if (!stage)
                return null;
            const rect = stage.getBoundingClientRect();
            return { x: (event.clientX - rect.left) / state.zoom + Number(stage.dataset.originX || 0), y: (event.clientY - rect.top) / state.zoom + Number(stage.dataset.originY || 0) };
        };
        const move = (event) => {
            const current = draftRef.current;
            if (!current || current.keyboard || event.pointerId !== current.pointerId)
                return;
            const point = pointAt(event);
            if (point) {
                draftRef.current = { ...current, point, hit: graphPortHit(latest.current.stageRef.current, event.clientX, event.clientY) };
                setDraft(draftRef.current);
            }
        };
        const up = (event) => {
            const current = draftRef.current;
            if (!current || current.keyboard || event.pointerId !== current.pointerId)
                return;
            suppressClickUntil.current = performance.now() + 100;
            const hit = graphPortHit(latest.current.stageRef.current, event.clientX, event.clientY);
            const node = latest.current.nodes.find(item => item.id === hit?.nodeId);
            const point = pointAt(event);
            if (!node || !point) {
                cancel();
                return;
            }
            const { width, height } = latest.current;
            const side = hit?.port || graphNearestPort(node, point, { width, height });
            void chooseRef.current(node.id, side);
        };
        const escape = (event) => { if (event.key === "Escape" && draftRef.current) {
            event.preventDefault();
            cancel();
        } };
        const click = (event) => { if (performance.now() < suppressClickUntil.current) {
            event.preventDefault();
            event.stopPropagation();
        } };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", cancel);
        window.addEventListener("blur", cancel);
        window.addEventListener("keydown", escape);
        window.addEventListener("click", click, true);
        return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", cancel); window.removeEventListener("blur", cancel); window.removeEventListener("keydown", escape); window.removeEventListener("click", click, true); };
    }, []);
    const endpoints = (edge) => {
        const source = nodes.find(node => node.id === edge.source), target = nodes.find(node => node.id === edge.target);
        if (!source || !target)
            return null;
        const ports = graphEdgeGeometry(source, target, { width, height, ...options(edge) });
        return { source: graphPortPoint(source, ports.sourcePort, { width, height }), target: graphPortPoint(target, ports.targetPort, { width, height }), ports: { sourcePort: ports.sourcePort, targetPort: ports.targetPort } };
    };
    return { active: Boolean(draft), pending, draft, cancel, choose, endpoints,
        preview: (style) => draft ? graphReconnectPreview(nodes, draft, { style, width, height }) : null,
        start: (edge, end, keyboard, pointerId) => {
            if (pendingRef.current)
                return;
            const points = endpoints(edge);
            if (!points)
                return;
            const value = { edge, end, keyboard, pointerId, ports: points.ports, point: points[end], fixed: points[end === "source" ? "target" : "source"] };
            draftRef.current = value;
            setDraft(value);
        },
    };
}
