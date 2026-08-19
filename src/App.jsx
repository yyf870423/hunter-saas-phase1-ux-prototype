import { Navigate, Route, Routes } from "react-router-dom";
import { ComponentsPage } from "./stage1/ComponentsPage";
import { Dashboard } from "./stage1/Dashboard";
import { ReviewPage } from "./stage1/ReviewPage";
import { Stage1Shell } from "./stage1/Stage1Shell";
import { NewWork } from "./stage2/NewWork";
import { SideTaskDetail, SideTasksPage } from "./stage2/SideTasks";
import { SignalsPage } from "./stage2/Signals";
import { Stage2ReviewPage } from "./stage2/Stage2ReviewPage";
import { AutomationWorkspace } from "./stage2/Workstreams";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/review" replace />} />
      <Route path="/review" element={<Stage2ReviewPage />} />
      <Route path="/review/stage-1" element={<ReviewPage />} />
      <Route element={<Stage1Shell />}>
        <Route path="/home" element={<Dashboard />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/new" element={<NewWork />} />
        <Route
          path="/workstreams/new"
          element={<Navigate to="/new" replace />}
        />
        <Route
          path="/workstreams/:workstreamId"
          element={<AutomationWorkspace />}
        />
        <Route path="/tasks" element={<SideTasksPage />} />
        <Route path="/tasks/new" element={<Navigate to="/new" replace />} />
        <Route path="/tasks/:taskId" element={<SideTaskDetail />} />
        <Route path="/signals" element={<SignalsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/review" replace />} />
    </Routes>
  );
}
