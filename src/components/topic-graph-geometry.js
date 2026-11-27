import { expandCanvasBounds } from "./graph-presentation.js";
export const nodeKindIcon = {
    company: "building",
    organization: "users",
    person: "user",
    contact: "users",
    position: "briefcase",
    industry: "database",
    group: "folder",
    note: "route",
};
export const graphCanvasMinimumBounds = { width: 1240, height: 650 };
export const graphCanvasExpansionPadding = 240;
export const graphCanvasExpansionStep = 320;
export const graphNodeHeight = 86;
export const graphNodeGap = 18;
export const graphNodeWidth = 180;
export function findGraphReparentTarget(nodes, ids, positions) {
    const blocked = new Set(ids.flatMap(id => [id, ...getDescendantIds(nodes, id)]));
    let best;
    let bestOverlap = 0;
    for (const target of nodes) {
        if (target.hidden || blocked.has(target.id))
            continue;
        for (const id of ids) {
            const moving = nodes.find(node => node.id === id), point = positions[id];
            if (!moving || !point)
                continue;
            const width = moving.width || graphNodeWidth;
            const overlapWidth = Math.max(0, Math.min(point.x + width, target.x + (target.width || graphNodeWidth)) - Math.max(point.x, target.x));
            const overlapHeight = Math.max(0, Math.min(point.y + graphNodeHeight, target.y + graphNodeHeight) - Math.max(point.y, target.y));
            const overlap = overlapWidth * overlapHeight / (width * graphNodeHeight);
            if (overlap >= 0.5 && overlap > bestOverlap) {
                best = target;
                bestOverlap = overlap;
            }
        }
    }
    return best;
}
export function getDescendantIds(nodes, parentId) {
    const direct = nodes.filter((node) => node.parentId === parentId).map((node) => node.id);
    return direct.flatMap((id) => [id, ...getDescendantIds(nodes, id)]);
}
export function expandGraphCanvasBounds(bounds, nodes) {
    return expandCanvasBounds(bounds, nodes, { minWidth: graphCanvasMinimumBounds.width, minHeight: graphCanvasMinimumBounds.height, width: graphNodeWidth, height: graphNodeHeight, padding: graphCanvasExpansionPadding, step: graphCanvasExpansionStep });
}
export function graphNodesOverlap(left, right) {
    const leftWidth = left.width || graphNodeWidth;
    const rightWidth = right.width || graphNodeWidth;
    return !(left.x + leftWidth + graphNodeGap <= right.x ||
        right.x + rightWidth + graphNodeGap <= left.x ||
        left.y + graphNodeHeight + graphNodeGap <= right.y ||
        right.y + graphNodeHeight + graphNodeGap <= left.y);
}
export function clampGraphNode(node, bounds = graphCanvasMinimumBounds) {
    const width = node.width || graphNodeWidth;
    return {
        ...node,
        x: Math.min((bounds.minX || 0) + bounds.width - width - 16, Math.max(bounds.minX || 0, node.x)),
        y: Math.min((bounds.minY || 0) + bounds.height - graphNodeHeight - 16, Math.max(bounds.minY || 0, node.y)),
    };
}
export function placeGraphNodeWithoutOverlap(node, occupied, bounds = graphCanvasMinimumBounds) {
    const desired = clampGraphNode(node, bounds);
    if (!occupied.some((item) => graphNodesOverlap(desired, item)))
        return desired;
    const step = 24;
    for (let ring = 1; ring <= 12; ring += 1) {
        const offsets = [];
        for (let axis = -ring; axis <= ring; axis += 1) {
            offsets.push([axis * step, -ring * step], [axis * step, ring * step], [-ring * step, axis * step], [ring * step, axis * step]);
        }
        for (const [dx, dy] of offsets) {
            const candidate = clampGraphNode({ ...node, x: node.x + dx, y: node.y + dy }, bounds);
            if (!occupied.some((item) => graphNodesOverlap(candidate, item)))
                return candidate;
        }
    }
    return desired;
}
export function placeMovedGraphNodes(nodes, ids, desiredById, bounds = graphCanvasMinimumBounds) {
    const occupied = nodes.filter((node) => !ids.includes(node.id));
    const placed = [];
    const positions = {};
    ids.forEach((id) => {
        const current = nodes.find((node) => node.id === id);
        if (!current || !desiredById[id])
            return;
        const next = placeGraphNodeWithoutOverlap({ ...current, ...desiredById[id] }, [...occupied, ...placed], bounds);
        placed.push(next);
        positions[id] = { x: next.x, y: next.y };
    });
    return nodes.map((node) => (positions[node.id] ? { ...node, ...positions[node.id], userMoved: true } : node));
}
