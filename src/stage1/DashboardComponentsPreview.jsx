import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DashboardInsightCards,
  DashboardAssetTimeline,
  DashboardSection,
  TaskFocusBoard,
} from "./DashboardWidgets";
import {
  dashboardAssetChanges,
  dashboardInsights,
  dashboardTasks,
  limitDashboardItems,
} from "./dashboard-data";
import { Tabs } from "./ui";

function sampleItems(items, state) {
  if (state === "empty") return [];
  if (state !== "capacity") return items.slice(0, 2);
  return Array.from({ length: 12 }, (_, index) => ({
    ...items[index % items.length],
    id: `sample-${index}`,
    title: `${items[index % items.length].title} · 容量示例 ${index + 1}`,
  }));
}

export function DashboardComponentsPreview() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const state = params.get("dashboard") || "normal";
  const tasks = sampleItems(dashboardTasks, state);
  const insights = sampleItems(dashboardInsights, state);
  const assets = sampleItems(dashboardAssetChanges, state);
  return (
    <section className="s1-component-section s1-dashboard-component-preview">
      <h2>工作台摘要</h2>
      <p>
        【原型说明，正式实现不展示】容量示例向每个公共列表传入 12 条，最多呈现
        10 条；不写入工作台数据。
      </p>
      <Tabs
        label="工作台组件状态"
        value={state}
        onChange={(value) => {
          const next = new URLSearchParams(params);
          next.set("dashboard", value);
          setParams(next, { replace: true });
        }}
        items={[
          { value: "normal", label: "正常" },
          { value: "capacity", label: "最大容量" },
          { value: "empty", label: "空状态" },
        ]}
      />
      <DashboardSection
        id="sample-tasks-title"
        title="任务"
        icon="task"
        count={limitDashboardItems(tasks).length}
      >
        <TaskFocusBoard
          items={tasks}
          onOpen={navigate}
          onCreate={() => navigate("/new")}
        />
      </DashboardSection>
      <div className="s1-dashboard-updates">
        <DashboardSection
          id="sample-insights-title"
          title="洞察"
          icon="signal"
          count={limitDashboardItems(insights).length}
        >
          <DashboardInsightCards items={insights} onOpen={navigate} />
        </DashboardSection>
        <DashboardSection
          id="sample-assets-title"
          title="资产变化"
          icon="database"
          count={limitDashboardItems(assets).length}
        >
          <DashboardAssetTimeline items={assets} onOpen={navigate} />
        </DashboardSection>
      </div>
    </section>
  );
}
