import { useEffect } from "react";

export function useGraphMenuDismiss(open, close, trigger, panel) {
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (!trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) close(); };
    const escape = event => { if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); close(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape, true);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape, true); };
  }, [open, close, trigger, panel]);
}
