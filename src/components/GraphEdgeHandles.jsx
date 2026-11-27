import "./graph-node-ports.css";
export function GraphEdgeHandles({ edgeId, points, originX = 0, originY = 0, zoom = 1, pending, labels, onStart, onEnter, onLeave }) {
    if (!points)
        return null;
    return ["source", "target"].map(end => <button key={end} type="button" className="graph-edge-handle" data-end={end} data-edge-id={edgeId} aria-label={labels[end]} title={labels[end]} disabled={pending} style={{ left: points[end].x - originX, top: points[end].y - originY, transform: `translate(-50%, -50%) scale(${1 / zoom})` }} onPointerDown={(event) => { if (event.button !== 0)
        return; event.preventDefault(); event.stopPropagation(); onStart(end, false, event.pointerId); }} onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()} onPointerEnter={onEnter} onPointerLeave={onLeave} onFocus={onEnter} onBlur={onLeave} onKeyDown={event => { if (!["Enter", " "].includes(event.key))
        return; event.preventDefault(); event.stopPropagation(); onStart(end, true); }}/>);
}
