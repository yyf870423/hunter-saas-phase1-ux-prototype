import { useCallback, useEffect, useRef, useState } from "react";
/** Current-view history only. Restore adapters must handle their real persistence before resolving. */
export function useGraphHistory(scopeKey, capture, restore, onError) {
    const entries = useRef([]);
    const future = useRef([]);
    const [count, setCount] = useState(0), [pending, setPending] = useState(false);
    const [redoCount, setRedoCount] = useState(0);
    const busy = useRef(false), generation = useRef(0);
    const latest = useRef({ capture, restore, onError });
    latest.current = { capture, restore, onError };
    useEffect(() => { generation.current++; entries.current = []; future.current = []; setCount(0); setRedoCount(0); busy.current = false; setPending(false); return () => { generation.current++; }; }, [scopeKey]);
    const record = useCallback((label) => {
        if (busy.current)
            return;
        entries.current = [...entries.current, { snapshot: latest.current.capture(), label }].slice(-20);
        future.current = [];
        setRedoCount(0);
        setCount(entries.current.length);
    }, []);
    const restoreStep = useCallback(async (direction) => {
        const source = direction === "undo" ? entries : future, target = direction === "undo" ? future : entries;
        const entry = source.current.at(-1);
        if (!entry || busy.current)
            return;
        const session = generation.current;
        busy.current = true;
        setPending(true);
        try {
            const snapshot = latest.current.capture();
            await latest.current.restore(entry.snapshot);
            if (generation.current === session) {
                source.current.pop();
                target.current = [...target.current, { snapshot, label: entry.label }].slice(-20);
                setCount(entries.current.length);
                setRedoCount(future.current.length);
            }
        }
        catch (error) {
            if (generation.current === session)
                latest.current.onError(error);
        }
        finally {
            if (generation.current === session) {
                busy.current = false;
                setPending(false);
            }
        }
    }, []);
    const undo = useCallback(() => restoreStep("undo"), [restoreStep]);
    const redo = useCallback(() => restoreStep("redo"), [restoreStep]);
    return { count, redoCount, pending, record, undo, redo };
}
