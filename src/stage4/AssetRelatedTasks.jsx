import { useNavigate, useSearchParams } from "react-router-dom";
import { getAssetTasks } from "../stage2/task-asset-references";
import { Button, FieldGroup, SourceList, StateBanner } from "./asset-ui";

export function AssetRelatedTasks({ assetType, assetId, companyId }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const state = params.get("tasks") || "normal";
  const tasks = getAssetTasks({ type: assetType, id: assetId, companyId });
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
