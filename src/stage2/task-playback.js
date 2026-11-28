import { useCallback, useRef, useState } from "react";

export const taskPlaybackKey = (key) => `${key}-completed-dialogue-v1`;

export function readCompletedTaskPhase(key, maximum, storage = sessionStorage) {
  try {
    const value = JSON.parse(storage.getItem(taskPlaybackKey(key)) || "null");
    return value?.schemaVersion === 1 && value.complete === true && Number.isInteger(value.phase) && value.phase >= 0 && value.phase <= maximum ? value.phase : null;
  } catch { return null; }
}

export function saveCompletedTaskPhase(key, phase, storage = sessionStorage) {
  try { storage.setItem(taskPlaybackKey(key), JSON.stringify({ schemaVersion: 1, complete: true, phase })); }
  catch { /* Unavailable playback storage must not block the demonstration. */ }
}

export function clearTaskPlayback(key) {
  try { sessionStorage.removeItem(taskPlaybackKey(key)); } catch { /* Keep the current in-memory replay usable. */ }
}

export function useTaskPlaybackState(key, phase, enabled, onComplete) {
  const [busy, setBusy] = useState(false);
  const previous = useRef(false);
  const current = useRef({ phase, enabled, onComplete });
  current.current = { phase, enabled, onComplete };
  const onChange = useCallback((next, details = {}) => {
    setBusy(next);
    if (previous.current && !next && current.current.enabled && !details.stopped && !details.unmounted) {
      saveCompletedTaskPhase(key, current.current.phase);
      current.current.onComplete?.();
    }
    previous.current = next;
  }, [key]);
  return [busy, onChange];
}
