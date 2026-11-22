export function readGraphPresentation(key) {
  try {
    const saved = key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
    return {
      lineStyle: saved?.lineStyle === "step" ? "step" : "curve",
      direction: saved?.direction === "TB" ? "TB" : "LR",
      adaptiveNodes: Array.isArray(saved?.adaptiveNodes) ? saved.adaptiveNodes.filter(id => typeof id === "string") : [],
    };
  } catch { return { lineStyle: "curve", direction: "LR", adaptiveNodes: [] }; }
}

export function writeGraphPresentation(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Coordinates retain their own persistence contract. */ }
}
