import dagre from "@dagrejs/dagre";
export function projectGraphPositions(nodes, positions) {
    return positions ? nodes.map(node => positions[node.id] ? { ...node, ...positions[node.id] } : node) : nodes;
}
import { getSmoothStepPath, Position } from "@xyflow/system";
import { routeGraphCurve } from "./graph-curve-routing.js";
export const GRAPH_PORT_SIDES = ["top", "right", "bottom", "left"];
export function graphZoomAtPoint(zoom, pan, point, deltaY) {
    const nextZoom = deltaY === 0 ? zoom : Math.min(1.5, Math.max(0.1, Number((zoom + (deltaY > 0 ? -0.1 : 0.1)).toFixed(1))));
    return graphScaleAtPoint(zoom, pan, point, nextZoom);
}
export function graphScaleAtPoint(zoom, pan, point, scale) {
    const nextZoom = Number.isFinite(scale) ? Math.min(1.5, Math.max(0.1, scale)) : zoom;
    if (nextZoom === zoom)
        return { zoom, pan };
    const ratio = nextZoom / zoom;
    return { zoom: nextZoom, pan: { x: point.x - (point.x - pan.x) * ratio, y: point.y - (point.y - pan.y) * ratio } };
}
export function expandCanvasBounds(bounds, nodes, { minWidth = 1240, minHeight = 650, width = 180, height = 86, padding = 240, step = 320, round = true } = {}) {
    const oldX = bounds.minX || 0, oldY = bounds.minY || 0;
    const minX = Math.min(oldX, ...nodes.map(node => node.x < 0 ? Math.floor((node.x - padding) / step) * step : 0));
    const minY = Math.min(oldY, ...nodes.map(node => node.y < 0 ? Math.floor((node.y - padding) / step) * step : 0));
    const requiredRight = Math.max(minWidth, ...nodes.map(node => node.x + (node.width || width) + padding));
    const requiredBottom = Math.max(minHeight, ...nodes.map(node => node.y + height + padding));
    const right = Math.max(oldX + bounds.width, round ? Math.ceil(requiredRight / step) * step : requiredRight);
    const bottom = Math.max(oldY + bounds.height, round ? Math.ceil(requiredBottom / step) * step : requiredBottom);
    if (minX === oldX && minY === oldY && right - minX === bounds.width && bottom - minY === bounds.height)
        return bounds;
    return { width: right - minX, height: bottom - minY, ...(minX ? { minX } : {}), ...(minY ? { minY } : {}) };
}
export function graphPortPoint(node, side, { width = 180, height = 86 } = {}) {
    const w = node.width || width;
    return { x: node.x + (side === "left" ? 0 : side === "right" ? w : w / 2), y: node.y + (side === "top" ? 0 : side === "bottom" ? height : height / 2) };
}
function layoutForest(nodes, edges) {
    const ids = new Set(nodes.map(node => node.id));
    const parents = nodes.filter(node => node.parentId && ids.has(node.parentId));
    const relations = (parents.length ? parents.map(node => ({ source: node.parentId, target: node.id })) : edges)
        .filter(edge => edge.source !== edge.target && ids.has(edge.source) && ids.has(edge.target));
    const outgoing = new Map(nodes.map(node => [node.id, new Set()]));
    const incoming = new Map(nodes.map(node => [node.id, new Set()]));
    relations.forEach(edge => { outgoing.get(edge.source).add(edge.target); incoming.get(edge.target).add(edge.source); });
    const roots = nodes.filter(node => !incoming.get(node.id).size);
    const visited = new Set(), forest = [];
    // Display-only spanning trees must never overwrite original hierarchy or relation facts.
    for (const root of [...roots, ...nodes]) {
        if (visited.has(root.id))
            continue;
        const queue = [root.id], children = new Map();
        visited.add(root.id);
        for (let index = 0; index < queue.length; index++) {
            const id = queue[index];
            children.set(id, []);
            for (const next of [...outgoing.get(id), ...incoming.get(id)]) {
                if (visited.has(next))
                    continue;
                visited.add(next);
                children.get(id).push(next);
                queue.push(next);
            }
        }
        forest.push({ root: root.id, ids: queue, children });
    }
    return forest;
}
export function layoutGraph(nodes, edges, direction = "LR", { width = 180, height = 86 } = {}) {
    if (!nodes.length)
        return [];
    const vertical = direction === "TB", nodeMap = new Map(nodes.map(node => [node.id, node]));
    const positions = new Map();
    let crossOffset = 0;
    for (const tree of layoutForest(nodes, edges)) {
        const descendants = new Map();
        for (const id of tree.ids.slice().reverse())
            descendants.set(id, [id, ...tree.children.get(id).flatMap(child => descendants.get(child))]);
        const branches = tree.children.get(tree.root).map(id => descendants.get(id)).sort((a, b) => b.length - a.length);
        const sides = [[], []], weight = [0, 0];
        for (const branch of branches) {
            const side = weight[0] <= weight[1] ? 0 : 1;
            sides[side].push(...branch);
            weight[side] += branch.length;
        }
        const local = new Map([[tree.root, { x: 0, y: 0 }]]);
        sides.forEach((branchIds, side) => {
            if (!branchIds.length)
                return;
            const graph = new dagre.graphlib.Graph();
            graph.setGraph({ rankdir: vertical ? (side ? "BT" : "TB") : (side ? "RL" : "LR"), nodesep: 42, ranksep: 100, ranker: "network-simplex" });
            graph.setDefaultEdgeLabel(() => ({}));
            const included = new Set([tree.root, ...branchIds]);
            included.forEach(id => graph.setNode(id, { width: nodeMap.get(id).width || width, height }));
            included.forEach(id => tree.children.get(id).forEach(child => { if (included.has(child))
                graph.setEdge(id, child); }));
            dagre.layout(graph);
            const center = graph.node(tree.root), rootWidth = nodeMap.get(tree.root).width || width;
            branchIds.forEach(id => {
                const point = graph.node(id), nodeWidth = nodeMap.get(id).width || width;
                local.set(id, { x: point.x - nodeWidth / 2 - (center.x - rootWidth / 2), y: point.y - center.y });
            });
        });
        const minX = Math.min(...tree.ids.map(id => local.get(id).x));
        const minY = Math.min(...tree.ids.map(id => local.get(id).y));
        tree.ids.forEach(id => {
            const point = local.get(id);
            positions.set(id, { x: point.x - minX + 48 + (vertical ? crossOffset : 0), y: point.y - minY + 72 + (vertical ? 0 : crossOffset) });
        });
        crossOffset += vertical
            ? Math.max(...tree.ids.map(id => local.get(id).x + (nodeMap.get(id).width || width))) - minX + 140
            : Math.max(...tree.ids.map(id => local.get(id).y + height)) - minY + 140;
    }
    return nodes.map(node => ({ ...node, ...positions.get(node.id) }));
}
export function graphEdgeGeometry(source, target, { direction = "LR", style = "curve", width = 180, height = 86, sourcePort, targetPort, adaptive = false, fixedPorts } = {}) {
    const sourceWidth = source.width || width, targetWidth = target.width || width;
    const dx = target.x + targetWidth / 2 - source.x - sourceWidth / 2, dy = target.y - source.y;
    let vertical = direction === "TB";
    if (adaptive)
        vertical = Math.abs(dy) / height > Math.abs(dx) / Math.max(sourceWidth, targetWidth);
    if (Math.abs(vertical ? dy : dx) < 1)
        vertical = !vertical;
    const forward = (vertical ? dy : dx) >= 0;
    const from = fixedPorts?.sourcePort || sourcePort || (vertical ? forward ? "bottom" : "top" : forward ? "right" : "left");
    const to = fixedPorts?.targetPort || targetPort || (vertical ? forward ? "top" : "bottom" : forward ? "left" : "right");
    if (fixedPorts?.sourcePort)
        vertical = from === "top" || from === "bottom";
    const chosenPorts = { sourcePort: from, targetPort: to };
    const { x: sourceX, y: sourceY } = graphPortPoint(source, from, { width, height });
    const { x: targetX, y: targetY } = graphPortPoint(target, to, { width, height });
    return graphPathGeometry({ x: sourceX, y: sourceY }, { x: targetX, y: targetY }, { style, ...chosenPorts });
}
export function graphPathGeometry(source, target, { style = "curve", sourcePort, targetPort }) {
    const ports = { top: Position.Top, right: Position.Right, bottom: Position.Bottom, left: Position.Left };
    const sourcePosition = ports[sourcePort], targetPosition = ports[targetPort];
    if (style === "step") {
        const [path, x, y] = getSmoothStepPath({ sourceX: source.x, sourceY: source.y, targetX: target.x, targetY: target.y, sourcePosition, targetPosition, borderRadius: 8, offset: 24 });
        return { path, x, y, sourcePort, targetPort };
    }
    const { path, x, y } = routeGraphCurve(source, target, sourcePort, targetPort);
    return { path, x, y, sourcePort, targetPort };
}
export const graphPositions = (nodes) => Object.fromEntries(nodes.map(node => [node.id, { x: node.x, y: node.y }]));
export function graphFitCamera(nodes, viewport, { width = 180, height = 86 } = {}) {
    if (!viewport || !nodes.length || !viewport.clientWidth || !viewport.clientHeight)
        return null;
    const left = Math.min(...nodes.map(node => node.x)), right = Math.max(...nodes.map(node => node.x + (node.width || width)));
    const top = Math.min(...nodes.map(node => node.y)), bottom = Math.max(...nodes.map(node => node.y + height));
    const desired = Math.min(1, (viewport.clientWidth - 48) / Math.max(1, right - left), (viewport.clientHeight - 48) / Math.max(1, bottom - top));
    const zoom = Math.max(0.1, desired);
    const root = nodes.find(node => !node.parentId) || nodes[0];
    const center = desired < 0.1 ? { x: root.x + (root.width || width) / 2, y: root.y + height / 2 } : { x: (left + right) / 2, y: (top + bottom) / 2 };
    return { zoom, pan: { x: viewport.clientWidth / 2 - center.x * zoom, y: viewport.clientHeight / 2 - center.y * zoom } };
}
export function graphFitZoom(nodes, viewport, { width = 180, height = 86 } = {}) {
    if (!viewport || !nodes.length)
        return 1;
    const right = Math.max(...nodes.map(node => node.x + (node.width || width))) - Math.min(0, ...nodes.map(node => node.x)) + 48;
    const bottom = Math.max(...nodes.map(node => node.y + height)) - Math.min(0, ...nodes.map(node => node.y)) + 48;
    return Math.max(0.65, Math.min(1, (viewport.clientWidth - 24) / right, (viewport.clientHeight - 24) / bottom));
}
export function graphLayoutPan(nodes, viewport, zoom, _direction, { width = 180, height = 86, focusId } = {}) {
    if (!viewport || !nodes.length)
        return { x: 0, y: 0 };
    const root = nodes.find(node => node.id === focusId) || nodes.find(node => !node.parentId) || nodes[0];
    return { x: viewport.clientWidth / 2 - (root.x + (root.width || width) / 2) * zoom, y: viewport.clientHeight / 2 - (root.y + height / 2) * zoom };
}
