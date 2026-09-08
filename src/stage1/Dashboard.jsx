import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { dashboardItemLimit, getDashboardData } from "./dashboard-data";
import {
  ActionQueue,
  DashboardInsightCards,
  DashboardAssetTimeline,
  DashboardListSkeleton,
  DashboardSection,
  DashboardTaskStarter,
  TaskFocusBoard,
} from "./DashboardWidgets";
import { Button, useToast } from "./ui";
import { getOpportunityActions, mergeLifecycleTasks, useOpportunityState } from "../stage4/opportunity-store";

function getTodayLabel() {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(
    now,
  );
  return `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${weekday}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [actionExpanded, setActionExpanded] = useState(false);
  const notify = useToast();
  const state = params.get("state") || "normal";
  const loading = state === "loading";
  const { tasks: baseTasks, insights, assets } = getDashboardData(params);
  const lifecycle = useOpportunityState();
  const dynamicTasks = mergeLifecycleTasks([], lifecycle).map((task) => ({ ...task, route: "/tasks/" + task.id,
    attention: task.phase === "result" ? "acceptance" : "action", progress: { icon: task.kind === "recruiting" ? "briefcase" : "building",
      label: task.results.length ? "已写入 " + task.results.length + " 项结果" : task.phase === "input" ? "正在整理资料" : "等待审核",
      detail: task.kind === "recruiting" ? "候选人审核与岗位流程" : "输入、草稿和正式结果保持关联" } }));
  const tasks = [...dynamicTasks, ...baseTasks.filter((task) => !lifecycle.tasks.some((item) => item.id === task.id))];
  const followupActions = getOpportunityActions(lifecycle);
  const startTask = (prompt) => {
    try {
      sessionStorage.setItem("hunter-new-work-signal", prompt);
      navigate("/tasks");
    } catch {
      notify("无法保存任务输入，请重试", "error");
    }
  };
  const recoverInsights = () => {
    const next = new URLSearchParams(params);
    next.delete("state");
    setParams(next, { replace: true });
    notify("洞察摘要已重新加载", "success");
  };

  return (
    <div
      className="s1-dashboard"
      aria-label={loading ? "工作台正在加载" : "工作台"}
    >
      <header className="s1-dashboard-head">
        <div>
          <small>{getTodayLabel()}</small>
          <h1>上午好，沈岚</h1>
        </div>
      </header>
      {state === "limited" ? (
        <section className="s1-permission-strip">
          <i>
            <Icon name="warning" />
          </i>
          <div>
            <b>部分公开来源暂不可用</b>
            <p>已有任务和结果不受影响，失败来源已保留。</p>
          </div>
          <Button size="sm" onClick={() => navigate("/settings/connections")}>
            查看连接
          </Button>
        </section>
      ) : null}
      <DashboardTaskStarter onStart={startTask} disabled={loading} />

      <DashboardSection
        id="dashboard-tasks-title"
        title="任务"
        icon="task"
        count={loading ? undefined : Math.min(tasks.length, dashboardItemLimit)}
        loading={loading}
        className="s1-dashboard-tasks"
        action={
          <Button
            tone="ghost"
            size="sm"
            icon="chevronRight"
            disabled={loading}
            onClick={() => navigate("/tasks")}
          >
            全部任务
          </Button>
        }
      >
        {loading ? (
          <DashboardListSkeleton rows={5} table />
        ) : (
          <TaskFocusBoard
            items={tasks}
            onOpen={navigate}
            onCreate={() => navigate("/new")}
          />
        )}
      </DashboardSection>

      <div className="s1-dashboard-updates">
        <DashboardSection
          id="dashboard-insights-title"
          title="洞察"
          icon="signal"
          count={loading || state === "error" ? undefined : insights.length}
          loading={loading}
          className="s1-dashboard-insights"
          action={
            <Button
              tone="ghost"
              size="sm"
              icon="chevronRight"
              disabled={loading}
              onClick={() => navigate("/signals")}
            >
              全部洞察
            </Button>
          }
        >
          {loading ? (
            <DashboardListSkeleton rows={8} />
          ) : state === "error" ? (
            <div className="s1-local-state s1-local-error">
              <i>
                <Icon name="warning" />
              </i>
              <div>
                <b>洞察摘要暂时无法加载</b>
                <p>任务和资产变化仍可正常查看。</p>
              </div>
              <Button size="sm" icon="refresh" onClick={recoverInsights}>
                重新加载
              </Button>
            </div>
          ) : (
            <DashboardInsightCards items={insights} onOpen={navigate} />
          )}
        </DashboardSection>
        <DashboardSection
          id="dashboard-assets-title"
          title="资产变化"
          icon="database"
          count={loading ? undefined : assets.length}
          loading={loading}
          className="s1-dashboard-assets"
        >
          {loading ? (
            <DashboardListSkeleton rows={10} />
          ) : (
            <DashboardAssetTimeline
              items={assets}
              onOpen={navigate}
              emptyAction={
                <Button icon="upload" onClick={() => navigate("/data/imports")}>
                  导入数据
                </Button>
              }
            />
          )}
        </DashboardSection>
      </div>
      {!loading && (tasks.length > 0 || followupActions.length > 0) ? (
        <ActionQueue
          additionalItems={followupActions}
          includeExamples={baseTasks.length > 0}
          expanded={actionExpanded}
          onToggle={() => setActionExpanded((current) => !current)}
          onOpen={navigate}
        />
      ) : null}
    </div>
  );
}
