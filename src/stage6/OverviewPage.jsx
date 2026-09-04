import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../stage1/ui";
import { DatePicker, SelectMenu } from "../stage4/asset-ui";
import {
  entitlementChanges,
  insightLifecycleHealth,
  overviewMetrics,
  riskItems,
  tasks,
  trialApplications,
} from "./operations-data";
import {
  OpsInlineState,
  OpsMetric,
  OpsPageHeader,
  OpsSection,
  OpsState,
  OpsStatus,
} from "./operations-ui";

export function OverviewPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const state = params.get("state") || "normal";
  const range = params.get("range") || "近 7 天";
  const [customRange, setCustomRange] = useState("2026.08 - 2026.08");
  const setRange = (value) => {
    const next = new URLSearchParams(params);
    next.set("range", value);
    setParams(next);
  };
  const retry = () => {
    const next = new URLSearchParams(params);
    next.delete("state");
    setParams(next);
  };
  return (
    <div className="ops-page ops-overview-page">
      <OpsPageHeader
        eyebrow="2026 年 8 月 24 日 · 数据更新于 16:46"
        title="运营概况"
        description="先判断运营趋势是否符合预期，再处理系统风险、异常运行和用户事项。"
        actions={
          <>
            <SelectMenu
              label="时间范围"
              value={range}
              onChange={setRange}
              options={["近 24 小时", "近 7 天", "近 30 天", "自定义"]}
            />
            {range === "自定义" ? (
              <DatePicker
                label="自定义时间"
                value={customRange}
                onChange={setCustomRange}
                mode="month-range"
                initialYear={2026}
              />
            ) : null}
            <Button icon="refresh" onClick={() => window.location.reload()}>
              刷新数据
            </Button>
          </>
        }
      />
      {state === "partial-error" ? (
        <OpsInlineState
          tone="warning"
          icon="warning"
          title="成本趋势暂时不可用"
          description="用户、运行和订阅指标已正常更新，成本数据将在下次刷新时重试。"
          action={
            <Button size="sm" onClick={retry}>
              重试成本数据
            </Button>
          }
        />
      ) : null}
      <OpsState
        state={state === "partial-error" ? "normal" : state}
        label="运营概况"
        onRetry={retry}
      >
        <OpsSection
          title="运营趋势"
          description={`${range}与上一周期对比，点击指标进入对应明细。`}
        >
          <div className="ops-metrics-grid">
            {overviewMetrics.map((item) => (
              <OpsMetric
                key={item.id}
                item={item}
                onClick={() =>
                  navigate(`${item.route}&range=${encodeURIComponent(range)}`)
                }
              />
            ))}
          </div>
        </OpsSection>
        <div className="ops-overview-grid">
          <OpsSection
            title="系统风险"
            description="按影响范围和紧急程度排序。"
            action={
              <Button
                size="sm"
                onClick={() => navigate("/ops/capabilities?tab=health")}
              >
                查看全部
              </Button>
            }
          >
            <div className="ops-priority-list">
              {riskItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigate(item.route)}
                >
                  <span className={`is-${item.tone}`}>
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </span>
                  <OpsStatus>
                    {item.tone === "danger" ? "需立即处理" : "需关注"}
                  </OpsStatus>
                </button>
              ))}
            </div>
          </OpsSection>
          <OpsSection
            title="运行处理"
            description="只显示需要运营判断的脱敏运行。"
            action={
              <Button size="sm" onClick={() => navigate("/ops/tasks")}>
                进入运行中心
              </Button>
            }
          >
            <div className="ops-compact-table">
              {tasks
                .filter((item) =>
                  ["失败", "需处理", "运行中"].includes(item.status),
                )
                .map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => navigate(`/ops/tasks/${task.id}`)}
                  >
                    <span>
                      <b>{task.id}</b>
                      <small>
                        {task.workspace} · {task.type}
                      </small>
                    </span>
                    <span>
                      <OpsStatus>{task.status}</OpsStatus>
                      <small>{task.duration}</small>
                    </span>
                  </button>
                ))}
            </div>
          </OpsSection>
        </div>
        <OpsSection
          title="洞察运行健康"
          description="只展示积压、超期、失败与合并效率，不展示用户业务内容。"
          action={
            <Button
              size="sm"
              onClick={() => navigate("/ops/tasks?tab=runs&scope=系统运行")}
            >
              查看相关运行
            </Button>
          }
        >
          <div className="ops-insight-health">
            {insightLifecycleHealth.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate("/ops/tasks?tab=runs&scope=系统运行")}
              >
                <span>
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </span>
                <span>
                  <strong>{item.value}</strong>
                  <OpsStatus tone={item.tone}>{item.status}</OpsStatus>
                </span>
              </button>
            ))}
          </div>
        </OpsSection>
        <OpsSection
          title="用户与商业事项"
          description="试用、订阅、支付与额度中需要人工处理的事项。"
        >
          <div className="ops-business-matters">
            <button
              type="button"
              onClick={() => navigate("/ops/users-workspaces?tab=trials")}
            >
              <i>2</i>
              <span>
                <b>待处理试用申请</b>
                <small>最长等待 6 小时 28 分</small>
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/ops/subscriptions?tab=subscriptions&status=expiring")
              }
            >
              <i>4</i>
              <span>
                <b>7 天内到期</b>
                <small>其中 1 个工作空间用量超过 90%</small>
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/ops/subscriptions?tab=orders&status=failed")
              }
            >
              <i>1</i>
              <span>
                <b>支付异常</b>
                <small>自动续订扣款失败</small>
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/ops/subscriptions?tab=adjustments")}
            >
              <i>{entitlementChanges.length}</i>
              <span>
                <b>今日权益调整</b>
                <small>均已生成操作审计</small>
              </span>
            </button>
          </div>
          <div className="ops-overview-footnote">
            当前有{" "}
            {
              trialApplications.filter((item) => item.status === "待处理")
                .length
            }{" "}
            份试用申请等待处理，所有申请都需要运营人员明确批准后才创建账号和工作空间。
          </div>
        </OpsSection>
      </OpsState>
    </div>
  );
}
