import { useEffect, useLayoutEffect, useRef } from "react";
import { graphZoomAtPoint } from "./graph-presentation";

export function useGraphWheelZoom({ viewportRef, zoom, pan, onZoom, onPan, scopeKey, enabled = true }) {
  const camera = useRef({ zoom, pan, onZoom, onPan });
  camera.current = { zoom, pan, onZoom, onPan };
  const pending = useRef(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !enabled) return;
    const wheel = (event) => {
      event.preventDefault();
      const current = camera.current, rect = viewport.getBoundingClientRect();
      const point = { x: event.clientX - rect.left - viewport.clientLeft, y: event.clientY - rect.top - viewport.clientTop };
      const pan = pending.current ? current.pan : { x: current.pan.x - viewport.scrollLeft, y: current.pan.y - viewport.scrollTop };
      const next = graphZoomAtPoint(current.zoom, pan, point, event.deltaY);
      if (next.zoom === current.zoom) return;
      pending.current = { scopeKey };
      camera.current = { ...current, ...next };
      current.onPan(next.pan);
      current.onZoom(next.zoom);
    };
    viewport.addEventListener("wheel", wheel, { passive: false });
    return () => { viewport.removeEventListener("wheel", wheel); pending.current = null; };
  }, [viewportRef, scopeKey, enabled]);

  useLayoutEffect(() => {
    const next = pending.current, viewport = viewportRef.current;
    if (!next || !viewport) return;
    pending.current = null;
    if (next.scopeKey !== scopeKey) return;
    // Native offsets are now included in pan; reset them atomically before painting.
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }, [zoom, pan, scopeKey, viewportRef]);
}
