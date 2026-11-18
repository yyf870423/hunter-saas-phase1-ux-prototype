import { useEffect, useRef } from "react";

export const snapConversationRatio = ratio => ratio < 22 ? 0 : ratio > 78 ? 100 : ratio;

// Window listeners keep the gesture alive when the divider becomes hidden.
export function ResizableDivider({ value, min, max, step, defaultValue, label, controls, valueText, readValue, normalize = value => value, onChange, onCommit, className = "" }) {
  const props = useRef(null), cleanup = useRef(null);
  props.current = { min, max, readValue, normalize, onChange, onCommit };
  useEffect(() => () => cleanup.current?.(), []);
  const start = event => {
    if (event.button !== 0) return;
    event.preventDefault();
    cleanup.current?.();
    const pointerId = event.pointerId, element = event.currentTarget;
    const oldCursor = document.body.style.cursor, oldSelect = document.body.style.userSelect;
    let latest = value;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = moveEvent => {
      if (moveEvent.pointerId !== pointerId) return;
      const p = props.current;
      latest = p.normalize(Math.max(p.min, Math.min(p.max, p.readValue(moveEvent))));
      p.onChange(latest);
    };
    const finish = endEvent => {
      if (endEvent.pointerId !== pointerId) return;
      if (endEvent.type === "pointerup") move(endEvent);
      cleanup.current?.();
      props.current.onCommit(latest);
    };
    cleanup.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      document.body.style.cursor = oldCursor;
      document.body.style.userSelect = oldSelect;
      if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
      cleanup.current = null;
    };
    element.setPointerCapture(pointerId);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };
  return <div className={`s2-conversation-split-handle ${className}`} role="separator" aria-orientation="vertical" aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-valuetext={valueText} aria-controls={controls} tabIndex={0} title="拖动调整宽度；双击恢复默认" onPointerDown={start}
    onDoubleClick={() => onCommit(defaultValue)}
    onKeyDown={event => {
      const next = event.key === "Home" ? min : event.key === "End" ? max : event.key === "ArrowLeft" ? value - step : event.key === "ArrowRight" ? value + step : null;
      if (next == null) return;
      event.preventDefault(); onCommit(normalize(Math.max(min, Math.min(max, next))));
    }}><span /></div>;
}

export function ConversationSplitHandle({ ratio, onChange, onCommit, containerRef }) {
  return <ResizableDivider value={ratio} min={0} max={100} step={5} defaultValue={50} label="调整对话与结果宽度" controls="research-dialogue research-result" valueText={`对话${Math.round(ratio)}%，结果${Math.round(100 - ratio)}%`} readValue={event => {
    const box = containerRef.current.getBoundingClientRect();
    return (event.clientX - box.left) / box.width * 100;
  }} normalize={snapConversationRatio} onChange={onChange} onCommit={onCommit} />;
}

export function TaskListSplitHandle({ width, maxWidth, onChange, onCommit, containerRef }) {
  return <ResizableDivider value={width} min={58} max={maxWidth} step={16} defaultValue={Math.min(252, maxWidth)} label="调整任务列表宽度" controls="research-history research-main" valueText={width === 58 ? "任务列表已收起" : `任务列表${Math.round(width)}像素`} readValue={event => event.clientX - containerRef.current.getBoundingClientRect().left} normalize={value => value < 160 ? 58 : value} onChange={onChange} onCommit={onCommit} className="s2-task-list-resizer" />;
}
