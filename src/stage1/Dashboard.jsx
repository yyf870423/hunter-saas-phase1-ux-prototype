import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { getDashboardData } from "./dashboard-data";
import {
  ActionQueue,
  DashboardFeed,
  DashboardListSkeleton,
  DashboardSection,
  DashboardTaskStarter,
  TaskSummaryTable,
} from "./DashboardWidgets";
import { Button, useToast } from "./ui";

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
  const { tasks, insights, assets } = getDashboardData(params);
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
        count={loading ? undefined : tasks.length}
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
          <TaskSummaryTable
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
            <DashboardFeed items={insights} onOpen={navigate} kind="insights" />
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
            <DashboardFeed
              items={assets}
              onOpen={navigate}
              kind="assets"
              emptyAction={
                <Button icon="upload" onClick={() => navigate("/data/imports")}>
                  导入数据
                </Button>
              }
            />
          )}
        </DashboardSection>
      </div>
      {!loading && tasks.length > 0 ? (
        <ActionQueue
          expanded={actionExpanded}
          onToggle={() => setActionExpanded((current) => !current)}
          onOpen={navigate}
        />
      ) : null}
    </div>
  );
}
