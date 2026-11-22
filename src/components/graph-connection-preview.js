import { GRAPH_PORT_SIDES, graphEdgeGeometry, graphPathGeometry, graphPortPoint } from "./graph-presentation.js";
const opposite = { top: "bottom", right: "left", bottom: "top", left: "right" };
export function graphPortHit(stage, clientX, clientY) {
    const hit = document.elementFromPoint(clientX, clientY), node = hit?.closest("[data-node-id]");
    if (!node?.dataset.nodeId || !stage?.contains(node))
        return;
    const side = hit?.closest(".graph-node-port")?.dataset.port;
    return { nodeId: node.dataset.nodeId, ...(GRAPH_PORT_SIDES.includes(side) ? { port: side } : {}) };
}
export function graphNearestPort(node, point, options = {}) {
    return GRAPH_PORT_SIDES.reduce((best, candidate) => {
        const a = graphPortPoint(node, best, options), b = graphPortPoint(node, candidate, options);
        return Math.hypot(b.x - point.x, b.y - point.y) < Math.hypot(a.x - point.x, a.y - point.y) ? candidate : best;
    });
}
export function graphConnectionPreview(nodes, sourceId, sourcePort, point, hit, options = {}) {
    const source = nodes.find(node => node.id === sourceId), target = nodes.find(node => node.id === hit?.nodeId);
    if (!source)
        return null;
    if (target && target.id !== source.id)
        return { ...graphEdgeGeometry(source, target, { ...options, sourcePort, targetPort: hit?.port }), targetId: target.id };
    return { ...graphPathGeometry(graphPortPoint(source, sourcePort, options), point, { style: options.style, sourcePort, targetPort: opposite[sourcePort] }), targetId: undefined };
}
export function graphReconnectPreview(nodes, draft, options = {}) {
    const source = nodes.find(node => node.id === draft.edge.source), target = nodes.find(node => node.id === draft.edge.target);
    if (!source || !target)
        return null;
    const moving = nodes.find(node => node.id === draft.hit?.nodeId), movingPort = moving ? draft.hit?.port || graphNearestPort(moving, draft.point, options) : undefined;
    if (moving && movingPort)
        return graphEdgeGeometry(draft.end === "source" ? moving : source, draft.end === "target" ? moving : target, { ...options, ...draft.ports, ...(draft.end === "source" ? { sourcePort: movingPort } : { targetPort: movingPort }) });
    const sourcePort = draft.end === "source" ? opposite[draft.ports.targetPort] : draft.ports.sourcePort;
    const targetPort = draft.end === "target" ? opposite[draft.ports.sourcePort] : draft.ports.targetPort;
    return graphPathGeometry(draft.end === "source" ? draft.point : graphPortPoint(source, sourcePort, options), draft.end === "target" ? draft.point : graphPortPoint(target, targetPort, options), { style: options.style, sourcePort, targetPort });
}
