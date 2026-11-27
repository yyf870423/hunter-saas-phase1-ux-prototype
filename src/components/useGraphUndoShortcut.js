import { useEffect, useRef } from "react";
export function useGraphUndoShortcut(history, blocked) {
    const latest = useRef({ history, blocked });
    latest.current = { history, blocked };
    useEffect(() => {
        const keydown = (event) => {
            const { history: current, blocked: isBlocked } = latest.current;
            const key = event.key.toLowerCase();
            const redo = (event.ctrlKey || event.metaKey) && event.shiftKey && key === "z" || event.ctrlKey && !event.metaKey && !event.shiftKey && key === "y";
            const undo = (event.ctrlKey || event.metaKey) && !event.shiftKey && key === "z";
            if (!current || current.pending || isBlocked?.() || event.defaultPrevented || event.isComposing || event.altKey || !(undo || redo) ||
                (redo ? !current.redoCount || !current.redo : !current.count))
                return;
            const target = event.target;
            if (document.querySelector('[role="dialog"], [aria-modal="true"]') || target instanceof Element &&
                target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'))
                return;
            event.preventDefault();
            if (redo)
                current.redo?.();
            else
                current.undo();
        };
        window.addEventListener("keydown", keydown);
        return () => window.removeEventListener("keydown", keydown);
    }, []);
}
