import { useNavigate, useSearchParams } from "react-router-dom";
import { getAssetTasks } from "../stage2/task-asset-references";
import { workItems } from "../stage2/data";
import { useOpportunityState } from "./opportunity-store";
import { Button, FieldGroup, SourceList, StateBanner } from "./asset-ui";

export function AssetRelatedTasks({ assetType, assetId, companyId }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const state = params.get("tasks") || "normal";
  const lifecycle = useOpportunityState();
  const dynamic = lifecycle.tasks.map((task) => ({ ...task, summary: task.prompt,
    type: task.kind === "recruiting" ? "招聘任务" : task.kind === "position-create" ? "岗位创建" : "客户开发",
    time: new Date(task.updatedAt).toLocaleString("zh-CN"), tone: task.phase === "result" ? "success" : "warning" }));
  const tasks = getAssetTasks({ type: assetType, id: assetId, companyId },
    [...dynamic, ...workItems.filter((task) => !dynamic.some((item) => item.id === task.id))]);
  let content;
  if (state === "loading") {
    content = <StateBanner icon="refresh" title="正在加载关联任务" />;
  } else if (state === "error") {
    content = (
      <StateBanner
        tone="danger"
        icon="warning"
        title="关联任务加载失败"
        action={
          <Button
            size="sm"
            icon="refresh"
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("tasks");
              setParams(next);
            }}
          >
            重试
          </Button>
        }
      />
    );
  } else if (["limited", "permission-limited"].includes(state)) {
    content = (
      <StateBanner tone="warning" icon="lock" title="暂无权限查看关联任务" />
    );
  } else if (state === "empty" || !tasks.length) {
    content = <StateBanner title="暂无关联任务" />;
  } else {
    content = (
      <SourceList
        items={tasks.map((task) => ({
          id: task.id,
          icon: "task",
          title: task.title,
          description: task.summary,
          meta: `${task.type} · ${task.time}`,
          status: task.status,
          tone: task.tone,
          onClick: () => navigate(`/tasks/${task.id}`),
        }))}
      />
    );
  }
  return (
    <FieldGroup title="关联任务" className="s4-asset-related-tasks">
      <div aria-live="polite" aria-busy={state === "loading"}>
        {content}
      </div>
    </FieldGroup>
  );
}
