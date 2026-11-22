const normals = { top: { x: 0, y: -1 }, right: { x: 1, y: 0 }, bottom: { x: 0, y: 1 }, left: { x: -1, y: 0 } };
const shift = (p, n, length) => ({ x: p.x + n.x * length, y: p.y + n.y * length });
function cubic(a, b, c, d, t) {
    const u = 1 - t;
    return { x: u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x, y: u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y };
}
/** Natural curves depend only on their fixed endpoints; other nodes never trigger detours. */
export function routeGraphCurve(start, end, sourceSide, targetSide) {
    const a = normals[sourceSide], b = normals[targetSide], dx = end.x - start.x, dy = end.y - start.y, span = Math.hypot(dx, dy);
    const sourceLength = Math.max(48, (dx * a.x + dy * a.y) / 2, sourceSide === targetSide ? Math.min(180, span * .35) : 0);
    const targetLength = Math.max(48, (-dx * b.x - dy * b.y) / 2, sourceSide === targetSide ? Math.min(180, span * .35) : 0);
    const first = shift(start, a, sourceLength), last = shift(end, b, targetLength);
    const collinear = Math.abs(dx * a.y - dy * a.x) < .01 && Math.abs(a.x * b.y - a.y * b.x) < .01;
    const facing = dx * a.x + dy * a.y > 0 && -dx * b.x - dy * b.y > 0;
    // Same-axis back-facing handles need two smooth segments to avoid a flat folded line.
    if (collinear && !facing) {
        const normal = { x: -a.y, y: a.x }, tangent = span ? { x: dx / span, y: dy / span } : { x: -a.x, y: -a.y };
        const middle = shift({ x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }, normal, Math.max(48, Math.min(120, span * .25)));
        const handle = Math.max(24, Math.min(120, span * .2)), before = shift(middle, tangent, -handle), after = shift(middle, tangent, handle);
        const points = Array.from({ length: 49 }, (_, i) => i <= 24 ? cubic(start, first, before, middle, i / 24) : cubic(middle, after, last, end, (i - 24) / 24));
        return { path: `M ${start.x} ${start.y} C ${first.x} ${first.y}, ${before.x} ${before.y}, ${middle.x} ${middle.y} C ${after.x} ${after.y}, ${last.x} ${last.y}, ${end.x} ${end.y}`, ...middle, points };
    }
    const points = Array.from({ length: 49 }, (_, i) => cubic(start, first, last, end, i / 48));
    return { path: `M ${start.x} ${start.y} C ${first.x} ${first.y}, ${last.x} ${last.y}, ${end.x} ${end.y}`, ...points[24], points };
}
