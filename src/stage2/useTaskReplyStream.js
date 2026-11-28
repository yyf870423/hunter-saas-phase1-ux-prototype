import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { replyStreamDuration, replyTextLength } from "./task-streaming";

export function useTaskReplyStream(id, source, conversation, simulate) {
  const total = useMemo(() => replyTextLength(source), [source]);
  const revision = useRef(0);
  const previous = useRef(null);
  const registration = useRef(null);
  const [output, setOutput] = useState({ source, total, budget: simulate ? 0 : total, key: null, stopped: false, queuedAt: null, finishedAt: null });
  const current = useRef(output);
  current.current = output;
  useLayoutEffect(() => {
    if (previous.current === source) {
      const item = registration.current;
      if (item) conversation?.queueOutput(item);
      return () => { if (item) conversation?.removeOutput(item.id, item.key); };
    }
    const before = current.current;
    const live = simulate && !conversation?.outputStopped && total > 0;
    const key = `${id}:${++revision.current}`;
    const budget = live && previous.current !== null && source.startsWith(before.source) ? before.budget : live ? 0 : total;
    previous.current = source;
    setOutput({ source, total, budget, key, stopped: false, queuedAt: live && budget < total ? performance.now() : null, finishedAt: null });
    registration.current = live && budget < total ? { id, key, generation: conversation.turn?.id || conversation.result.generation, length: total - budget } : null;
    if (registration.current) conversation?.queueOutput(registration.current);
    return () => conversation?.removeOutput(id, key);
  }, [source, total, id, conversation?.queueOutput, conversation?.removeOutput]);

  const active = conversation?.outputs[0]?.key === output.key;
  useEffect(() => {
    if (!active || output.stopped) return;
    const started = performance.now(), from = current.current.budget;
    const duration = replyStreamDuration(output.total - from);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / duration);
      setOutput((state) => ({ ...state, budget: Math.min(state.total, from + Math.ceil((state.total - from) * progress)), finishedAt: progress === 1 ? performance.now() : null }));
      if (progress === 1) {
        clearInterval(timer);
        registration.current = null;
        conversation?.finishOutput(id, output.key);
      }
    }, reduced ? 160 : 50);
    return () => clearInterval(timer);
  }, [active, output.key, output.stopped, conversation?.finishOutput, id]);

  const cancel = useRef(conversation?.outputCancel);
  useLayoutEffect(() => {
    if (cancel.current === conversation?.outputCancel) return;
    cancel.current = conversation?.outputCancel;
    registration.current = null;
    setOutput((state) => state.queuedAt && !state.finishedAt ? { ...state, stopped: true, finishedAt: performance.now() } : state);
  }, [conversation?.outputCancel]);

  const complete = !output.stopped && output.budget >= output.total && (!output.queuedAt || Boolean(output.finishedAt));
  return { ...output, complete, pending: !complete && !output.stopped };
}
