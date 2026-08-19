import { Navigate, Route, Routes } from "react-router-dom";
import { ComponentsPage } from "./stage1/ComponentsPage";
import { Dashboard } from "./stage1/Dashboard";
import { ReviewPage } from "./stage1/ReviewPage";
import { Stage1Shell } from "./stage1/Stage1Shell";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/review" replace />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route element={<Stage1Shell />}>
        <Route path="/home" element={<Dashboard />} />
        <Route path="/components" element={<ComponentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/review" replace />} />
    </Routes>
  );
}
