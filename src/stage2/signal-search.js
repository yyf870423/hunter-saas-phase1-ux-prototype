export function matchesSignalSearch(signal, query) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;
  return [signal.title, signal.summary, ...(signal.relatedNames || [])].some(
    (value) => typeof value === "string" && value.toLowerCase().includes(keyword),
  );
}
