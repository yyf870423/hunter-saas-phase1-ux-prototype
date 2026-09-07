import { Navigate, useParams } from "react-router-dom";
import { SideTaskDetail } from "../stage2/SideTasks";
import { AutomationWorkspace } from "../stage2/Workstreams";
import { BusinessWorkstreamWorkspace } from "./BusinessWorkstreams";
import { businessScenarios } from "./data";
import { useOpportunityState } from "../stage4/opportunity-store";
import { OpportunityTaskWorkspace } from "../stage4/OpportunityTaskWorkspace";
import { Button, StateBanner } from "../stage4/asset-ui";

export function WorkstreamRoute() {
  const { workstreamId } = useParams();
  const lifecycle = useOpportunityState();
  const task = lifecycle.tasks.find((item) => item.id === workstreamId);
  if (task?.deletedAt) return <StateBanner tone="warning" title="任务已删除，可在回收站恢复" />;
  if (task && !task.legacyWorkspace) return <OpportunityTaskWorkspace key={task.id} taskId={task.id} />;
  if (workstreamId === "task-recommend-linhao") {
    return (
      <Navigate
        to="/positions/position-vla?tab=matching&report=linhao"
        replace
      />
    );
  }
  if (workstreamId?.startsWith("task-")) {
    return <SideTaskDetail taskId={workstreamId} />;
  }
  if (workstreamId === "position-vla") return <AutomationWorkspace />;
  if (businessScenarios[workstreamId]) {
    return (
      <BusinessWorkstreamWorkspace
        key={workstreamId}
        scenarioId={workstreamId}
      />
    );
  }
  return <StateBanner tone="danger" title="任务不存在" />;
}
