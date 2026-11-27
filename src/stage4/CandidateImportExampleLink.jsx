import { useState } from "react";
import { useToast } from "./asset-ui";
import { downloadCandidateTemplate } from "./candidate-batch-import";

export function CandidateImportExampleLink() {
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  return <a href="#sample" aria-busy={busy} aria-disabled={busy || undefined} onClick={async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try { await downloadCandidateTemplate(); }
    catch { notify("导入示例下载失败，请重试。", "error"); }
    finally { setBusy(false); }
  }}>下载 候选人 导入示例</a>;
}
