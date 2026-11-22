import { useEffect, useMemo, useState } from "react";
import { graphEdgeGeometry } from "./graph-presentation.js";
const keyOf = (edge) => JSON.stringify([edge.origin === "hierarchy" ? "hierarchy" : edge.id, edge.source, edge.target]);
export function freezeGraphPorts(nodes, edges, direction, previous = {}, dimensions = {}, reset = false) {
    if (!nodes.length || !edges.length)
        return previous;
    const byId = new Map(nodes.map(node => [node.id, node]));
    const next = {};
    for (const edge of edges) {
        const source = byId.get(edge.source), target = byId.get(edge.target), key = keyOf(edge);
        if (!source || !target)
            continue;
        if (previous[key] && !reset) {
            next[key] = previous[key];
            continue;
        }
        const explicit = !reset && Boolean(edge.sourcePort || edge.targetPort);
        const { sourcePort, targetPort } = graphEdgeGeometry(source, target, { ...dimensions, direction, adaptive: !reset && edge.autoPorts, ...(explicit ? { sourcePort: edge.sourcePort, targetPort: edge.targetPort } : {}) });
        next[key] = { sourcePort, targetPort, explicit };
    }
    return Object.keys(next).length === Object.keys(previous).length && Object.keys(next).every(key => next[key] === previous[key]) ? previous : next;
}
function readLocks(storageKey) {
    try {
        const value = storageKey ? JSON.parse(localStorage.getItem(storageKey) ?? "{}") : {};
        const sides = ["top", "right", "bottom", "left"];
        return Object.fromEntries(Object.entries(value ?? {}).filter(([, p]) => p && typeof p === "object" && sides.includes(p.sourcePort) && sides.includes(p.targetPort))
            .map(([key, p]) => { const item = p; return [key, { sourcePort: item.sourcePort, targetPort: item.targetPort, explicit: item.explicit === true }]; }));
    }
    catch {
        return {};
    }
}
export function useGraphEdgePorts({ nodes, edges, direction, scopeKey, storageKey, width = 180, height = 86 }) {
    const [owner, setOwner] = useState(scopeKey);
    const [locks, setLocks] = useState(() => readLocks(storageKey));
    useEffect(() => { setLocks(readLocks(storageKey)); setOwner(scopeKey); }, [scopeKey, storageKey]);
    const current = useMemo(() => freezeGraphPorts(nodes, edges, direction, owner === scopeKey ? locks : readLocks(storageKey), { width, height }), [nodes, edges, direction, owner, scopeKey, locks, storageKey, width, height]);
    useEffect(() => { if (owner === scopeKey && current !== locks)
        setLocks(previous => freezeGraphPorts(nodes, edges, direction, previous, { width, height })); }, [owner, scopeKey, current, locks, nodes, edges, direction, width, height]);
    useEffect(() => {
        if (storageKey && owner === scopeKey)
            try {
                localStorage.setItem(storageKey, JSON.stringify(current));
            }
            catch { /* Layout persistence reports storage failures separately. */ }
    }, [storageKey, owner, scopeKey, current]);
    return {
        set: (edge, ports) => setLocks(previous => ({ ...current, ...previous, [keyOf(edge)]: { ...ports, explicit: true } })),
        freeze: () => setLocks(current),
        reset: (nextNodes, nextDirection) => setLocks(freezeGraphPorts(nextNodes, edges, nextDirection, {}, { width, height }, true)),
        options: (edge) => { const fixed = current[keyOf(edge)]; return { ...(fixed?.explicit ? { sourcePort: fixed.sourcePort, targetPort: fixed.targetPort } : {}), fixedPorts: fixed }; },
    };
}
