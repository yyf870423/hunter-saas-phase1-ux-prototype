import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Composer } from "../stage2/automation-ui";
import { AssetPageHeader, Button, FileDrop, PostWriteMatchingOptions, StateBanner } from "./asset-ui";
import { PositionFields, positionFromDirection, useOpportunityAction } from "./OpportunityComponents";
import { createOpportunityTask } from "./opportunity-task-adapter";
import { getOpportunityPermission, runOpportunityCommand } from "./opportunity-store";

export function PositionCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState("manual");
  const [draft, setDraft] = useState(() => positionFromDirection());
  const [files, setFiles] = useState([]);
  const [value, setValue] = useState("");
  const [authMode, setAuthMode] = useState("confirm");
  const [match, setMatch] = useState(params.get("match") === "all");
  const [parsing, setParsing] = useState(false);
  const action = useOpportunityAction();
  const save = () => action.run("position.create", { patch: draft }, {}, (result) => {
    if (match) {
      try { runOpportunityCommand("position.match", { id: result.positionId, phase: "start" }); }
      catch (error) { action.setError(error); }
    }
    navigate("/positions/" + result.positionId);
  });
  const parse = async (text, attachments) => {
    if (parsing) return;
    setParsing(true); action.setError(null);
    try {
      const result = await createOpportunityTask({ kind: "position-create", prompt: text || "请根据附件整理岗位资料并保留待确认字段。", files: attachments, authMode, draft });
      navigate("/tasks/" + result.taskId);
    } catch (error) { action.setError(error); }
    finally { setParsing(false); }
  };
  return <div className="s4-create-page"><AssetPageHeader title="新建岗位" actions={<Button onClick={() => navigate("/positions")}>取消</Button>} />
    <div className="s4-create-layout"><aside className="s4-create-modes">{[["manual", "edit", "手动新建"], ["file", "upload", "文件解析"], ["agent", "sparkles", "AI 解析 JD"]].map(([id, icon, label]) =>
      <button type="button" key={id} className={mode === id ? "is-active" : ""} onClick={() => setMode(id)}><Icon name={icon} /><span><b>{label}</b></span></button>)}</aside>
      <section className="s4-create-workspace"><header><h2>{mode === "manual" ? "岗位资料" : mode === "file" ? "从文件整理岗位" : "整理岗位资料"}</h2></header>
        {mode === "manual" ? <><PositionFields value={draft} onChange={setDraft} errors={action.error?.details?.fields} disabled={action.busy || getOpportunityPermission()} />
          <PostWriteMatchingOptions entityType="position" enabled={match} onEnabledChange={setMatch} disabled={action.busy || getOpportunityPermission()} /><footer><Button tone="primary" disabled={action.busy || getOpportunityPermission()} onClick={save}>{action.busy ? "保存中" : "创建岗位"}</Button></footer></> :
          mode === "file" ? <><FileDrop files={files} onFiles={setFiles} accept="PDF、DOCX、TXT、XLSX、CSV、图片" /><footer><Button tone="primary" disabled={!files.length || parsing || getOpportunityPermission()} onClick={() => parse(value, files)}>{parsing ? "读取中" : "整理岗位草稿"}</Button></footer></> :
          <Composer value={value} onChange={setValue} onSend={parse} authMode={authMode} onAuthChange={setAuthMode} attachments={files} onAttachmentsChange={setFiles} disabled={parsing || getOpportunityPermission()} placeholder="粘贴完整 JD，补充岗位名称、公司、职责与要求" />}
        {action.errorView}{parsing ? <StateBanner icon="refresh" title="正在保存并读取输入资料" /> : null}
      </section>
    </div>
  </div>;
}
