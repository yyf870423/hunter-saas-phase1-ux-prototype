import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
/** Panning changes only the camera: draw once per frame, commit React state on release. */
export function useGraphPan({ viewportRef, stageRef, pan, zoom, originX = 0, originY = 0, onPan, onEnd, scopeKey }) {
    const latest = useRef({ pan, zoom, originX, originY, onPan, onEnd });
    latest.current = { pan, zoom, originX, originY, onPan, onEnd };
    const gesture = useRef(null);
    const frame = useRef(null);
    const suppressUntil = useRef(0);
    const paint = useCallback(() => {
        const current = gesture.current, stage = stageRef.current, camera = latest.current;
        if (current && stage)
            stage.style.transform = `translate(${current.point.x + camera.originX * camera.zoom}px, ${current.point.y + camera.originY * camera.zoom}px) scale(${camera.zoom})`;
    }, [stageRef]);
    const stopFrame = useCallback(() => {
        if (frame.current !== null)
            cancelAnimationFrame(frame.current);
        frame.current = null;
    }, []);
    const finish = useCallback(() => {
        const current = gesture.current;
        if (!current)
            return;
        stopFrame();
        if (!current.moved)
            current.point = latest.current.pan;
        paint();
        gesture.current = null;
        const viewport = viewportRef.current;
        viewport?.classList.remove("is-panning");
        if (viewport?.hasPointerCapture?.(current.pointerId))
            viewport.releasePointerCapture(current.pointerId);
        if (current.moved) {
            suppressUntil.current = performance.now() + 150;
            latest.current.onPan(current.point);
        }
        latest.current.onEnd?.(current.moved);
    }, [paint, stopFrame, viewportRef]);
    useLayoutEffect(() => {
        const current = gesture.current;
        if (!current)
            return;
        // A wheel zoom or another explicit camera command rebases an in-flight pan.
        if (current.base.x !== pan.x || current.base.y !== pan.y) {
            current.base = pan;
            current.point = pan;
            current.start = current.last;
        }
        paint();
    });
    useEffect(() => {
        window.addEventListener("blur", finish);
        return () => {
            window.removeEventListener("blur", finish);
            stopFrame();
            const pointerId = gesture.current?.pointerId;
            gesture.current = null;
            const viewport = viewportRef.current;
            viewport?.classList.remove("is-panning");
            if (pointerId !== undefined && viewport?.hasPointerCapture?.(pointerId))
                viewport.releasePointerCapture(pointerId);
        };
    }, [scopeKey, finish, stopFrame, viewportRef]);
    const move = (event) => {
        const current = gesture.current;
        if (!current || current.pointerId !== event.pointerId)
            return;
        event.preventDefault();
        current.last = { x: event.clientX, y: event.clientY };
        current.point = { x: current.base.x + event.clientX - current.start.x, y: current.base.y + event.clientY - current.start.y };
        current.moved ||= Math.hypot(event.clientX - current.start.x, event.clientY - current.start.y) > 4;
        if (frame.current === null)
            frame.current = requestAnimationFrame(() => { frame.current = null; paint(); });
    };
    return {
        getPan: () => gesture.current?.point ?? latest.current.pan,
        suppressClick: () => performance.now() < suppressUntil.current,
        cancel: finish,
        start: (event) => {
            if (event.button !== 0 || event.isPrimary === false || gesture.current)
                return;
            event.preventDefault();
            const point = { x: event.clientX, y: event.clientY };
            gesture.current = { pointerId: event.pointerId, start: point, last: point, base: latest.current.pan, point: latest.current.pan, moved: false };
            viewportRef.current?.classList.add("is-panning");
            event.currentTarget.setPointerCapture?.(event.pointerId);
        },
        move,
        end: (event) => { if (gesture.current?.pointerId === event.pointerId) {
            move(event);
            finish();
        } },
        cancelEvent: (event) => { if (gesture.current?.pointerId === event.pointerId)
            finish(); },
    };
}
