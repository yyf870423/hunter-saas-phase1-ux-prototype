import { useCallback, useEffect, useRef, useState } from "react";
/** Keep handles reachable while the pointer crosses from an SVG line to its HTML endpoint. */
export function useGraphEdgeHover(scopeKey) {
    const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
    const [handleEdgeId, setHandleEdgeId] = useState(null);
    const timer = useRef(null);
    const clear = useCallback(() => {
        if (timer.current !== null)
            clearTimeout(timer.current);
        timer.current = null;
    }, []);
    const hold = useCallback((id) => {
        clear();
        setHandleEdgeId(id);
    }, [clear]);
    const release = useCallback((id) => {
        clear();
        timer.current = setTimeout(() => {
            setHandleEdgeId(current => current === id ? null : current);
            timer.current = null;
        }, 120);
    }, [clear]);
    const reset = useCallback(() => {
        clear();
        setHoveredEdgeId(null);
        setHandleEdgeId(null);
    }, [clear]);
    useEffect(() => {
        reset();
        return clear;
    }, [scopeKey, clear, reset]);
    return {
        hoveredEdgeId,
        handleEdgeId,
        enterEdge: (id) => { setHoveredEdgeId(id); hold(id); },
        leaveEdge: (id) => { setHoveredEdgeId(current => current === id ? null : current); release(id); },
        hold,
        release,
        reset,
    };
}
