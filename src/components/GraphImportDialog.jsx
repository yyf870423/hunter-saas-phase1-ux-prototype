import { useEffect, useState } from "react";
import { Button, FileDrop, FormField, Modal, StateBanner, TextInput } from "../stage4/asset-ui";

const extensions = [".emmx", ".xmind", ".opml", ".mm", ".freemind", ".md", ".markdown", ".json", ".xlsx"];
export function GraphImportDialog({ open, close, names, onImported, scenario = "" }) {
  const [name, setName] = useState(""), [files, setFiles] = useState([]), [submitted, setSubmitted] = useState(false);
  useEffect(() => { if (open) { setName(""); setFiles([]); setSubmitted(false); } }, [open]);
  const file = files[0];
  const fileError = file && (!extensions.some(ext => file.name.toLowerCase().endsWith(ext)) ? "不支持此文件格式。" : !file.size ? "文件为空，请选择有效的图谱文件。" : file.size > 10 * 1024 * 1024 ? "文件不能超过10MB。" : null);
  const nameError = submitted ? !name.trim() ? "请输入图页名称。" : names.includes(name.trim()) ? "已有同名图页，请换一个名称。" : null : null;
  const simulatedError = scenario === "corrupt" ? "文件无法读取，当前图谱未产生任何半成品图页。" : scenario === "unsupported" ? "不支持该文件格式，当前文件未导入。" : null;
  const selectFiles = next => { setFiles(next.slice(0, 1)); if (next[0]) setName(current => current.trim() ? current : next[0].name.replace(/\.[^.]+$/, "").slice(0, 60)); };
  const submit = () => {
    setSubmitted(true);
    if (!file || fileError || simulatedError || !name.trim() || names.includes(name.trim())) return;
    onImported({ name: name.trim(), file });
  };
  return <Modal open={open} close={close} title="导入图页" size="lg" footer={<><Button onClick={close}>取消</Button><Button tone="primary" onClick={submit}>导入</Button></>}>
    <div className="s4-import-step">
      <FormField label="图页名称" required error={nameError}><TextInput ariaLabel="图页名称" value={name} onChange={setName} maxLength={60} /></FormField>
      <FileDrop files={files} onFiles={selectFiles} accept="EMMX、XMind、OPML、FreeMind、Markdown、Hunter JSON、Hunter XLSX" multiple={false} sizeLabel="10 MB" error={fileError || (submitted && !file ? "请选择图谱文件。" : null)} />
      {simulatedError ? <StateBanner tone="danger" title="导入失败" description={simulatedError} /> : null}
      <p className="s2-research-prototype-note">【原型说明，正式实现不展示】选择的文件只用于交互演示，不上传、不调用后端；导入结果使用明确的虚构示例数据。</p>
      <Button size="sm" onClick={() => selectFiles([new File(["<map/>"], "星澜机器人组织架构.mm", { type: "application/xml" })])}>使用示例文件</Button>
    </div>
  </Modal>;
}
