import { useEffect, useState } from "react";
import { Button, FileDrop, Modal, SourceList, StateBanner } from "./asset-ui";
import { fileDatabase } from "./contact-file-storage";
import { saveOpportunityFile, useOpportunityState } from "./opportunity-store";
import { extractOpportunityText } from "./opportunity-file-parser";

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
  const [preview, setPreview] = useState(null);
  const [remove, setRemove] = useState(null);
  const files = ids.map((id) => state.files.find((item) => item.id === id)).filter(Boolean);
  useEffect(() => () => { if (preview?.url) URL.revokeObjectURL(preview.url); }, [preview]);
  async function upload(incoming) {
    setError(""); setBusy(true);
    const added = [];
    try {
      for (const file of incoming) added.push((await storeOpportunityAttachment(file)).id);
    } catch (failure) { setError(failure.message); }
    finally { if (added.length) onChange?.([...ids, ...added]); setBusy(false); }
  }
  async function open(file) {
    setError("");
    try {
      const blob = await fileDatabase("get", file.id);
      if (!blob) throw new Error("文件内容不存在，请重新上传原文件。");
      const url = URL.createObjectURL(blob);
      const text = /\.(txt|md|csv|docx|xlsx)$/i.test(file.name)
        ? (await extractOpportunityText(new File([blob], file.name, { type: file.type }))).text : "";
      setPreview({ ...file, url, text });
    } catch (failure) { setError(failure.message); }
  }
  return <div className="s4-detail-stack">
    {!readOnly && !busy ? <FileDrop accept="PDF、DOCX、XLSX、CSV、TXT、PNG、JPG、WebP" onFiles={upload} /> : null}
    {busy ? <StateBanner title="正在保存附件" /> : null}
    {error ? <StateBanner tone="danger" title={error} /> : null}
    <SourceList items={files.map((file) => ({ id: file.id, title: file.name,
      description: Math.ceil(file.size / 1024) + " KB", status: "已保存", icon: "file", onClick: () => open(file) }))} />
    <Modal open={Boolean(preview)} close={() => setPreview(null)} title={preview?.name || "文件预览"} size="xl"
      footer={<>{!readOnly ? <Button tone="danger-outline" icon="trash" onClick={() => setRemove(preview)}>移除附件</Button> : null}
        <Button icon="download" onClick={() => { const link = document.createElement("a"); link.href = preview.url; link.download = preview.name; link.click(); }}>下载</Button>
        <Button onClick={() => setPreview(null)}>关闭</Button></>}>
      {preview ? /\.(png|jpe?g|webp)$/i.test(preview.name) ? <img className="s4-opportunity-file-image" src={preview.url} alt={preview.name} /> :
        /\.pdf$/i.test(preview.name) ? <iframe className="s4-opportunity-file-frame" src={preview.url} title={preview.name} /> :
        preview.text ? <pre className="s4-long-copy">{preview.text}</pre> : <StateBanner title="该格式暂不支持在线预览" action={<Button icon="download" onClick={() => { const link = document.createElement("a"); link.href = preview.url; link.download = preview.name; link.click(); }}>下载原文件</Button>} /> : null}
    </Modal>
    <Modal open={Boolean(remove)} close={() => setRemove(null)} title="移除附件" footer={<><Button onClick={() => setRemove(null)}>取消</Button>
      <Button tone="danger" onClick={() => { onChange?.(ids.filter((id) => id !== remove.id)); setRemove(null); setPreview(null); }}>确认移除</Button></>}>
      <p>将从当前记录移除“{remove?.name}”。其他引用不会改变。</p>
    </Modal>
  </div>;
}
