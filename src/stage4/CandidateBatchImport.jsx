import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FileDrop, Modal, PostWriteMatchingOptions, StateBanner, StatusBadge } from "./asset-ui";
import { candidateBatchFileErrors, candidateBatchFileLimit } from "./candidate-batch-import";
import { CandidateImportExampleLink } from "./CandidateImportExampleLink";
import { createUploadedImportSample } from "./import-task-details";
import { addImportTask } from "./import-task-store";
import "./candidate-batch-import.css";

export function CandidateBatchImport() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [matchEnabled, setMatchEnabled] = useState(false);
  const [matchScope, setMatchScope] = useState("all");
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [matchError, setMatchError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const timer = useRef(null);
  const submitting = useRef(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const errors = files.length ? candidateBatchFileErrors(files) : [];
  const inspect = () => {
    if (!files.length || errors.length) return;
    if (matchEnabled && matchScope === "selected" && !selectedPositions.length) {
      setMatchError("请至少选择一个岗位");
      return;
    }
    setMatchError("");
    setConfirmOpen(true);
  };
  const finish = () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    timer.current = window.setTimeout(() => {
      const task = {
        ...createUploadedImportSample("候选人", files),
        matching: { enabled: matchEnabled, scope: matchScope, positions: matchEnabled && matchScope === "selected" ? [...selectedPositions] : [] },
      };
      addImportTask(task);
      setCreated(task);
      setConfirmOpen(false);
      setBusy(false);
      submitting.current = false;
    }, 450);
  };
  const matchingDescription = matchScope === "selected"
    ? `只对成功写入的候选人匹配已选择的 ${selectedPositions.length} 个岗位；待身份确认和失败记录不会启动。`
    : "只对成功写入的候选人匹配全部招聘中岗位；待身份确认和失败记录不会启动。";

  return <>
    <header><h2>批量导入候选人</h2><p>导入多份简历、简历压缩包或候选人表格，统一查看每一项的处理结果。</p></header>
    <p className="s4-import-prototype-note s4-candidate-batch-note">【原型说明，正式实现不展示】仅演示文件选择、确认和任务状态；不上传文件、不解析正文或写入真实候选人。</p>
    {created ? <div className="s4-import-step">
      <StateBanner tone="success" icon="check" title="导入任务已创建" description={`已接收 ${files.length} 份文件，候选人条目数量将在解析后确定。`} />
      <StateBanner title="可在数据导入中继续查看" description="处理中、成功、失败原因和待确认条目会在同一个任务中展示；关闭页面不会重复创建任务。" />
      <div className="s4-command-actions">
        <Button tone="primary" icon="task" onClick={() => navigate(`/data/imports?detail=${encodeURIComponent(created.id)}`)}>查看任务详情</Button>
        <Button icon="upload" onClick={() => { setCreated(null); setFiles([]); }}>继续导入</Button>
      </div>
    </div> : <>
      <div className="s4-import-step s4-candidate-batch-import">
        <FileDrop files={files} onFiles={setFiles} accept="PDF、DOCX、ZIP、XLSX" maxFiles={candidateBatchFileLimit} sizeLabel="20 MB" error={errors.join("\n")} />
        <PostWriteMatchingOptions entityType="candidate" enabled={matchEnabled} onEnabledChange={next => { setMatchEnabled(next); setMatchError(""); }} scope={matchScope} onScopeChange={next => { setMatchScope(next); setMatchError(""); }} selectedPositions={selectedPositions} onSelectedPositionsChange={next => { setSelectedPositions(next); setMatchError(""); }} error={matchError} />
        <CandidateImportExampleLink />
      </div>
      <footer><Button tone="primary" disabled={!files.length || errors.length > 0} onClick={inspect}>校验并继续</Button></footer>
    </>}
    <Modal open={confirmOpen} close={() => setConfirmOpen(false)} closeDisabled={busy} size="xl" title="确认导入任务" description="确认文件和导入设置；开始后可在任务详情查看处理结果" footer={<>
      <Button disabled={busy} onClick={() => setConfirmOpen(false)}>返回</Button>
      <Button tone="primary" loading={busy} onClick={finish}>确认导入</Button>
    </>}>
      <div className="s4-import-summary s4-candidate-batch-import">
        <dl>{[["待处理文件", files.length], ["已处理", 0], ["成功", 0], ["失败", 0]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <StateBanner title="确认后开始导入" description="当前只检查文件类型、数量和大小。正文、表格行与压缩包内容在处理后解析，不提前计入成功；疑似重复或身份不明确的条目需审核后写入。" />
        {matchEnabled ? <StateBanner icon="sparkles" title="正式写入后将自动开始人岗匹配" description={matchingDescription} /> : null}
        <div className="s4-import-result-list">{files.map((file, index) => <article key={`${file.name}-${index}`}><StatusBadge tone="neutral">待处理</StatusBadge><span><b>{file.name}</b><small>候选人 · 确认后进入解析、查重与写入审核</small></span></article>)}</div>
      </div>
    </Modal>
  </>;
}
