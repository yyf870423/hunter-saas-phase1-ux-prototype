import { Navigate, Route, Routes } from "react-router-dom";
import { ComponentsPage } from "./stage1/ComponentsPage";
import { Dashboard } from "./stage1/Dashboard";
import { ReviewPage } from "./stage1/ReviewPage";
import { Stage1Shell } from "./stage1/Stage1Shell";
import { NewSideTask, SideTaskDetail, SideTasksPage } from "./stage2/SideTasks";
import { SignalsPage } from "./stage2/Signals";
import { Stage2ReviewPage } from "./stage2/Stage2ReviewPage";
import { AutomationWorkspace, NewWorkstream } from "./stage2/Workstreams";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/review" replace />} />
      <Route path="/review" element={<Stage2ReviewPage />} />
      <Route path="/review/stage-1" element={<ReviewPage />} />
      <Route element={<Stage1Shell />}>
        <Route path="/home" element={<Dashboard />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/workstreams/new" element={<NewWorkstream />} />
        <Route
          path="/workstreams/:workstreamId"
          element={<AutomationWorkspace />}
        />
        <Route path="/tasks" element={<SideTasksPage />} />
        <Route path="/tasks/new" element={<NewSideTask />} />
        <Route path="/tasks/:taskId" element={<SideTaskDetail />} />
        <Route path="/signals" element={<SignalsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/review" replace />} />
    </Routes>
  );
}
