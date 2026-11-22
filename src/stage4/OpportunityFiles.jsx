import { useState } from "react";
import { Button, FileDrop, Modal, StateBanner } from "./asset-ui";
import { fileDatabase } from "./contact-file-storage";
import { saveOpportunityFile, useOpportunityState } from "./opportunity-store";
import { openFilePreview } from "./file-preview";

const supported = /\.(pdf|docx|xlsx|csv|txt|md|png|jpe?g|webp)$/i;
export async function storeOpportunityAttachment(file) {
  if (!supported.test(file.name)) throw new Error("文件格式不支持，请选择 PDF、DOCX、XLSX、CSV、TXT 或图片。");
  if (file.size > 50 * 1024 * 1024) throw new Error("文件超过 50 MB，请缩小后重试。");
  const metadata = { id: "opportunity-file-" + crypto.randomUUID(), name: file.name,
    type: file.type, size: file.size, createdAt: new Date().toISOString() };
  await fileDatabase("put", metadata.id, file);
  try { saveOpportunityFile(metadata); }
  catch (error) { await fileDatabase("delete", metadata.id); throw error; }
  return metadata;
}

export function OpportunityFiles({ ids = [], onChange, readOnly = false }) {
  const state = useOpportunityState();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [remove, setRemove] = useState(null);
  const files = ids.map((id) => state.files.find((item) => item.id === id)).filter(Boolean);
  async function upload(incoming) {
    setError(""); setBusy(true);
    const added = [];
    try {
      for (const file of incoming) added.push((await storeOpportunityAttachment(file)).id);
    } catch (failure) { setError(failure.message); }
    finally { if (added.length) onChange?.([...ids, ...added]); setBusy(false); }
  }
  async function download(file) {
    setError("");
    try {
      const blob = await fileDatabase("get", file.id);
      if (!blob) throw new Error("文件内容不存在，请重新上传原文件。");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = file.name; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) { setError(failure.message); }
  }
  // 产品决策 2026-11-22：附件预览在新标签页打开；下载、移除留在当前页。
  return <div className="s4-detail-stack">
    {!readOnly && !busy ? <FileDrop accept="PDF、DOCX、XLSX、CSV、TXT、PNG、JPG、WebP" onFiles={upload} /> : null}
    {busy ? <StateBanner title="正在保存附件" /> : null}
    {error ? <StateBanner tone="danger" title={error} /> : null}
    {files.length ? <div className="s4-contact-company-relations">{files.map((file) =>
      <article className="s4-contact-file-row" key={file.id}>
        <span><b>{file.name}</b><small>{Math.max(1, Math.ceil(file.size / 1024))} KB · 已保存</small></span>
        <Button size="sm" icon="external" onClick={() => openFilePreview({ id: file.id, name: file.name, source: "招聘机会附件" })}>预览</Button>
        <Button size="sm" icon="download" onClick={() => download(file)}>下载</Button>
        {!readOnly ? <Button size="sm" tone="danger-outline" onClick={() => setRemove(file)}>移除</Button> : null}
      </article>)}</div> : null}
    <Modal open={Boolean(remove)} close={() => setRemove(null)} title="移除附件" footer={<><Button onClick={() => setRemove(null)}>取消</Button>
      <Button tone="danger" onClick={() => { onChange?.(ids.filter((id) => id !== remove.id)); setRemove(null); }}>确认移除</Button></>}>
      <p>将从当前记录移除“{remove?.name}”。其他引用不会改变。</p>
    </Modal>
  </div>;
}
