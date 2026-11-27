import { useEffect, useLayoutEffect, useRef } from "react";
import { graphScaleAtPoint, graphZoomAtPoint } from "./graph-presentation.js";
export function useGraphWheelZoom({ viewportRef, zoom, pan, onZoom, onPan, getPan, onGestureStart, scopeKey, enabled = true }) {
    const camera = useRef({ zoom, pan, onZoom, onPan, getPan, onGestureStart });
    camera.current = { zoom, pan, onZoom, onPan, getPan, onGestureStart };
    const pending = useRef(null);
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport || !enabled)
            return;
        const pointAt = (clientX, clientY) => {
            const rect = viewport.getBoundingClientRect();
            return { x: clientX - rect.left - viewport.clientLeft, y: clientY - rect.top - viewport.clientTop };
        };
        const readCamera = () => {
            const current = camera.current, livePan = current.getPan?.() ?? current.pan;
            return { zoom: current.zoom, pan: pending.current ? current.pan : { x: livePan.x - viewport.scrollLeft, y: livePan.y - viewport.scrollTop } };
        };
        const apply = (next) => {
            const current = camera.current;
            if (next.zoom === current.zoom && next.pan.x === current.pan.x && next.pan.y === current.pan.y)
                return;
            pending.current = { scopeKey };
            camera.current = { ...current, ...next };
            current.onPan(next.pan);
            current.onZoom(next.zoom);
        };
        const wheel = (event) => {
            event.preventDefault();
            if (pinch || native)
                return;
            const current = readCamera(), point = pointAt(event.clientX, event.clientY);
            const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
            const next = event.ctrlKey
                ? graphScaleAtPoint(current.zoom, current.pan, point, current.zoom * Math.exp(-Math.max(-240, Math.min(240, delta)) * .01))
                : graphZoomAtPoint(current.zoom, current.pan, point, event.deltaY);
            if (next.zoom !== current.zoom)
                apply(next);
        };
        const pointers = new Map();
        let pinch = null, native = null, touching = false;
        const start = (point, distance, interrupt = true) => {
            const current = readCamera();
            if (interrupt)
                camera.current.onGestureStart?.();
            return { zoom: current.zoom, anchor: { x: (point.x - current.pan.x) / current.zoom, y: (point.y - current.pan.y) / current.zoom }, distance };
        };
        const update = (base, point, ratio) => {
            if (!Number.isFinite(ratio) || ratio <= 0)
                return;
            const nextZoom = Math.min(1.5, Math.max(.1, base.zoom * ratio));
            apply({ zoom: nextZoom, pan: { x: point.x - base.anchor.x * nextZoom, y: point.y - base.anchor.y * nextZoom } });
        };
        const pair = () => {
            const [a, b] = [...pointers.values()];
            return a && b ? { point: pointAt((a.x + b.x) / 2, (a.y + b.y) / 2), distance: Math.hypot(a.x - b.x, a.y - b.y) } : null;
        };
        const pointerDown = (event) => {
            if (event.pointerType !== "touch")
                return;
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            const value = pair();
            if (!value)
                return;
            event.preventDefault();
            event.stopPropagation();
            if (!native)
                pinch = start(value.point, Math.max(1, value.distance), !touching);
            touching = true;
            for (const id of pointers.keys())
                viewport.setPointerCapture?.(id);
        };
        const pointerMove = (event) => {
            if (!pointers.has(event.pointerId))
                return;
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (!touching)
                return;
            event.preventDefault();
            event.stopPropagation();
            const value = pair();
            if (pinch && value)
                update(pinch, value.point, value.distance / pinch.distance);
        };
        const pointerEnd = (event) => {
            if (!pointers.delete(event.pointerId))
                return;
            if (touching) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (viewport.hasPointerCapture?.(event.pointerId))
                viewport.releasePointerCapture(event.pointerId);
            const value = pair();
            if (pinch && value)
                pinch = start(value.point, Math.max(1, value.distance), false);
            if (!pointers.size) {
                touching = false;
                pinch = null;
            }
        };
        const nativePoint = (event) => {
            const rect = viewport.getBoundingClientRect();
            return pointAt(event.clientX ?? rect.left + rect.width / 2, event.clientY ?? rect.top + rect.height / 2);
        };
        const nativeStart = (event) => { event.preventDefault(); if (!pinch)
            native = start(nativePoint(event), 1); };
        const nativeChange = (event) => { event.preventDefault(); if (native && !pinch)
            update(native, nativePoint(event), event.scale); };
        const nativeEnd = (event) => { event.preventDefault(); native = null; };
        const clear = () => {
            for (const id of pointers.keys())
                if (viewport.hasPointerCapture?.(id))
                    viewport.releasePointerCapture(id);
            pointers.clear();
            pinch = null;
            native = null;
            touching = false;
        };
        viewport.addEventListener("wheel", wheel, { passive: false });
        viewport.addEventListener("pointerdown", pointerDown, true);
        viewport.addEventListener("pointermove", pointerMove, true);
        viewport.addEventListener("pointerup", pointerEnd, true);
        viewport.addEventListener("pointercancel", pointerEnd, true);
        viewport.addEventListener("gesturestart", nativeStart, { passive: false });
        viewport.addEventListener("gesturechange", nativeChange, { passive: false });
        viewport.addEventListener("gestureend", nativeEnd, { passive: false });
        window.addEventListener("blur", clear);
        return () => {
            clear();
            pending.current = null;
            viewport.removeEventListener("wheel", wheel);
            viewport.removeEventListener("pointerdown", pointerDown, true);
            viewport.removeEventListener("pointermove", pointerMove, true);
            viewport.removeEventListener("pointerup", pointerEnd, true);
            viewport.removeEventListener("pointercancel", pointerEnd, true);
            viewport.removeEventListener("gesturestart", nativeStart);
            viewport.removeEventListener("gesturechange", nativeChange);
            viewport.removeEventListener("gestureend", nativeEnd);
            window.removeEventListener("blur", clear);
        };
    }, [viewportRef, scopeKey, enabled]);
    useLayoutEffect(() => {
        const next = pending.current, viewport = viewportRef.current;
        if (!next || !viewport)
            return;
        pending.current = null;
        if (next.scopeKey !== scopeKey)
            return;
        // Native offsets are now included in pan; reset them atomically before painting.
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
    }, [zoom, pan, scopeKey, viewportRef]);
}
