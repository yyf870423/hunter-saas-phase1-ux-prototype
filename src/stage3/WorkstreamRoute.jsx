import { Navigate, useParams } from "react-router-dom";
import { SideTaskDetail } from "../stage2/SideTasks";
import { AutomationWorkspace } from "../stage2/Workstreams";
import { BusinessWorkstreamWorkspace } from "./BusinessWorkstreams";
import { businessScenarios } from "./data";

export function WorkstreamRoute() {
  const { workstreamId } = useParams();
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
  return <Navigate to="/works/position-vla" replace />;
}
