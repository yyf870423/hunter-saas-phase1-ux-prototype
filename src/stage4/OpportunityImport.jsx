import { useNavigate } from "react-router-dom";
import { Button, DataTable, DefinitionGrid, Modal, StateBanner } from "./asset-ui";
import { useOpportunityState } from "./opportunity-store";
import { displayDateTime } from "./OpportunityComponents";
import { OpportunityFiles } from "./OpportunityFiles";

export function OpportunityImportDetail({ batchId, close }) {
  const state = useOpportunityState();
  const navigate = useNavigate();
  const batch = state.imports.find((item) => item.id === batchId);
  if (!batch) return null;
  return <Modal open close={close} title={batch.name} size="xl" footer={<Button onClick={close}>关闭</Button>}>
    <div className="s4-detail-stack"><StateBanner title="历史导入记录" description="招聘机会批量导入已取消，原件和已有结果保留。" />
      <DefinitionGrid items={[["来源文件", batch.file], ["创建时间", displayDateTime(batch.createdAt)], ["处理状态", batch.status]]} />
      {batch.fileId ? <OpportunityFiles ids={[batch.fileId]} readOnly /> : null}
      {batch.taskId ? <Button icon="task" onClick={() => navigate("/tasks/" + batch.taskId)}>查看审核任务</Button> : <DataTable rows={batch.rows.map((row) => ({ ...row, id: String(row.rowNo) }))}
        columns={[{ key: "rowNo", label: "原始行号" }, { key: "name", label: "招聘机会", render: (row) => row.patch.title },
          { key: "status", label: "结果", render: (row) => row.result || row.error || ({ ready: "未写入", skipped: "已跳过" })[row.status] }]}
        onRow={(row) => row.opportunityId && navigate("/opportunities/" + row.opportunityId)} />}
    </div>
  </Modal>;
}
