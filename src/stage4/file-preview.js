// 产品决策 2026-11-22（HB-06 与身份复核 ②）：所有文件预览统一在新标签页打开，
// 原页面保持不动。上传的文件存在浏览器 IndexedDB（contact-file-storage），新标签页按 id 读取；
// 演示用的候选人简历没有原文件，新标签页显示示例文档。
export function filePreviewHref({ id, name, type, source }) {
  const params = new URLSearchParams();
  if (id) params.set("id", id);
  if (name) params.set("name", name);
  if (type) params.set("type", type);
  if (source) params.set("source", source);
  return `${window.location.pathname}${window.location.search}#/files/preview?${params.toString()}`;
}

export function openFilePreview(file) {
  window.open(filePreviewHref(file), "_blank", "noopener");
}
