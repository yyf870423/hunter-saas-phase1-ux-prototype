import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button, Drawer, Modal, useToast } from "../stage1/ui";
import { FormField, SelectMenu, TextArea, TextInput } from "../stage4/asset-ui";
import {
  auditRecords,
  capabilities,
  capabilityConfigurations,
  diagnostics,
  errorGroups,
  securityEvents,
  supportRecords,
  tasks,
} from "./operations-data";
import { useOpsRole } from "./OperationsShell";
import { ModelConfigurationPanel } from "./ModelConfiguration";
import {
  OpsDefinitionList,
  OpsFilterBar,
  OpsInlineState,
  OpsPageHeader,
  OpsPagination,
  OpsSection,
  OpsSortableList,
  OpsState,
  OpsStatus,
  OpsTable,
  OpsTabs,
  OpsTimeline,
  useOpsList,
} from "./operations-ui";

const taskColumns = [
  { key: "id", label: "任务编号", width: 180 },
  { key: "workspace", label: "工作空间", width: 210 },
  {
    key: "scope",
    label: "任务归属",
    width: 110,
    render: (row) => <OpsStatus>{row.scope}</OpsStatus>,
  },
  { key: "type", label: "执行类型", width: 140 },
  { key: "parent", label: "所属主线", width: 170 },
  {
    key: "status",
    label: "状态",
    width: 110,
    render: (row) => <OpsStatus>{row.status}</OpsStatus>,
  },
  { key: "phase", label: "当前阶段", width: 140 },
  { key: "startedAt", label: "开始时间", width: 130 },
  { key: "duration", label: "耗时", width: 130 },
  {
    key: "retries",
    label: "重试",
    width: 80,
    render: (row) => `${row.retries} 次`,
  },
  {
    key: "resource",
    label: "资源状态",
    width: 130,
    render: (row) => <OpsStatus>{row.resource}</OpsStatus>,
  },
  { key: "error", label: "错误分类", width: 190 },
];

function ErrorDrawer({ error, close }) {
  const navigate = useNavigate();
  if (!error) return null;
  const representative = tasks.filter((task) => task.error === error.code);
  return (
    <Drawer open close={close} title={error.code} className="ops-detail-drawer">
      <div className="ops-detail-stack">
        <div className="ops-detail-heading">
          <span>
            <small>错误分类</small>
            <h2>{error.title}</h2>
          </span>
          <OpsStatus>{error.status}</OpsStatus>
        </div>
        <OpsDefinitionList
          items={[
            ["发生次数", `${error.count} 次`],
            ["影响工作空间", `${error.workspaces} 个`],
            ["影响任务类型", error.taskTypes],
            ["关联能力", error.capability],
            ["首次发生", error.firstSeen],
            ["最近发生", error.lastSeen],
          ]}
        />
        <OpsSection
          title="代表任务"
          description="只显示任务元数据和错误上下文。"
        >
          <div className="ops-link-list">
            {representative.map((task) => (
              <button
                type="button"
                key={task.id}
                onClick={() => {
                  navigate(`/ops/tasks/${task.id}`);
                  close();
                }}
              >
                <Icon name="activity" />
                <span>
                  <b>{task.id}</b>
                  <small>
                    {task.workspace} · {task.phase}
                  </small>
                </span>
                <Icon name="chevronRight" />
              </button>
            ))}
          </div>
        </OpsSection>
        <OpsSection title="处理进展">
          <OpsTimeline
            items={[
              {
                title: "错误分类已聚合",
                meta: error.firstSeen,
                detail: "系统使用相同错误码聚合受影响任务。",
                tone: "success",
              },
              {
                title: "已启用可用降级路径",
                meta: "今天 15:54",
                detail: "现有任务继续运行，新任务优先走兜底能力。",
                tone: "warning",
              },
              {
                title: "等待主能力恢复",
                meta: "当前",
                detail: "恢复后将自动确认错误发生率是否回落。",
              },
            ]}
          />
        </OpsSection>
      </div>
    </Drawer>
  );
}

export function TasksPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "runs";
  const state = params.get("state") || "normal";
  const [filters, setFilters] = useState({});
  const rawSource = tab === "errors" ? errorGroups : tasks;
  const source = useMemo(
    () =>
      rawSource.filter((item) => {
        if (tab === "runs")
          return (
            (!filters.status?.length || filters.status.includes(item.status)) &&
            (!filters.scope?.length || filters.scope.includes(item.scope)) &&
            (!filters.type?.length || filters.type.includes(item.type)) &&
            (!filters.resource || item.resource === filters.resource)
          );
        return (
          (!filters.errorStatus || item.status === filters.errorStatus) &&
          (!filters.capability || item.capability === filters.capability)
        );
      }),
    [filters, rawSource, tab],
  );
  const list = useOpsList(
    source,
    tab === "errors"
      ? ["code", "title", "taskTypes"]
      : ["id", "workspace", "scope", "type", "parent", "status", "error"],
  );
  const [selectedError, setSelectedError] = useState(
    errorGroups.find((item) => item.id === params.get("error")) || null,
  );
  const switchTab = (value) => {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    next.delete("state");
    setParams(next);
    list.setQuery("");
    setFilters({});
  };
  const errorColumns = [
    {
      key: "code",
      label: "错误码",
      width: 220,
      render: (row) => (
        <span className="ops-primary-cell">
          <b>{row.code}</b>
          <small>{row.title}</small>
        </span>
      ),
    },
    {
      key: "count",
      label: "发生次数",
      width: 100,
      render: (row) => `${row.count} 次`,
    },
    {
      key: "workspaces",
      label: "影响工作空间",
      width: 140,
      render: (row) => `${row.workspaces} 个`,
    },
    { key: "taskTypes", label: "影响任务类型", width: 240 },
    { key: "lastSeen", label: "最近发生", width: 140 },
    {
      key: "status",
      label: "处理状态",
      width: 120,
      render: (row) => <OpsStatus>{row.status}</OpsStatus>,
    },
  ];
  return (
    <div className="ops-page">
      <OpsPageHeader
        title="任务与故障"
        description="统一查看业务主线、支线任务和系统后台任务的脱敏运行元数据、错误码与调用链；无法证明安全时不提供恢复操作。"
      />
      <OpsTabs
        value={tab}
        onChange={switchTab}
        label="任务与故障范围"
        items={[
          { value: "runs", label: "任务运行", count: tasks.length },
          { value: "errors", label: "错误中心", count: errorGroups.length },
        ]}
      />
      <OpsState
        state={state}
        label={tab === "runs" ? "任务运行" : "错误中心"}
        onRetry={() => switchTab(tab)}
      >
        <OpsFilterBar
          query={list.query}
          onQuery={list.setQuery}
          placeholder={
            tab === "runs"
              ? "搜索任务编号、工作空间、任务归属、执行类型或错误码"
              : "搜索错误码、分类或任务类型"
          }
          filters={
            tab === "runs"
              ? [
                  {
                    label: "任务状态",
                    options: ["运行中", "需处理", "失败", "已完成", "已取消"],
                    value: filters.status || [],
                    onChange: (value) =>
                      setFilters((current) => ({ ...current, status: value })),
                    multiple: true,
                  },
                  {
                    label: "任务归属",
                    options: ["业务主线", "支线任务", "系统后台任务"],
                    value: filters.scope || [],
                    onChange: (value) =>
                      setFilters((current) => ({ ...current, scope: value })),
                    multiple: true,
                  },
                  {
                    label: "执行类型",
                    options: [
                      "岗位解析",
                      "候选人补全",
                      "学术搜索",
                      "公司调研",
                      "邮箱回复检查",
                    ],
                    value: filters.type || [],
                    onChange: (value) =>
                      setFilters((current) => ({ ...current, type: value })),
                    multiple: true,
                  },
                  {
                    label: "资源状态",
                    options: ["运行中", "已释放", "资源未释放"],
                    value: filters.resource || "",
                    onChange: (value) =>
                      setFilters((current) => ({
                        ...current,
                        resource: value,
                      })),
                  },
                ]
              : [
                  {
                    label: "处理状态",
                    options: ["需处理", "处理中", "观察中", "用户处理"],
                    value: filters.errorStatus || "",
                    onChange: (value) =>
                      setFilters((current) => ({
                        ...current,
                        errorStatus: value,
                      })),
                  },
                  {
                    label: "关联能力",
                    options: ["大模型", "公开网络搜索", "邮件", "任务执行"],
                    value: filters.capability || "",
                    onChange: (value) =>
                      setFilters((current) => ({
                        ...current,
                        capability: value,
                      })),
                  },
                ]
          }
        />
        <OpsTable
          columns={tab === "runs" ? taskColumns : errorColumns}
          rows={list.visible}
          onRow={
            tab === "runs"
              ? (row) => navigate(`/ops/tasks/${row.id}`)
              : setSelectedError
          }
        />
        <OpsPagination
          page={list.page}
          pages={list.pages}
          onChange={list.setPage}
          total={list.filtered.length}
        />
      </OpsState>
      <ErrorDrawer error={selectedError} close={() => setSelectedError(null)} />
    </div>
  );
}

function RecoveryModal({ task, close, initialAction }) {
  const notify = useToast();
  const [action, setAction] = useState(initialAction || "checkpoint");
  const [reason, setReason] = useState("");
  const [running, setRunning] = useState(false);
  const run = () => {
    if (!reason.trim()) return;
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      notify(
        action === "refund" ? "重复扣减额度已退还" : "恢复操作已提交并记录审计",
      );
      close();
    }, 700);
  };
  return (
    <Modal
      open={Boolean(task)}
      close={close}
      title="执行安全恢复"
      description={task?.id}
      size="lg"
      closeDisabled={running}
      footer={
        <>
          <Button onClick={close} disabled={running}>
            取消
          </Button>
          <Button
            tone="primary"
            loading={running}
            disabled={!reason.trim()}
            onClick={run}
          >
            确认执行
          </Button>
        </>
      }
    >
      {task ? (
        <div className="ops-detail-stack">
          <OpsInlineState
            tone="success"
            icon="shield"
            title="系统已确认该操作可安全执行"
            description={task.safeReason}
          />
          <div className="ops-action-choice">
            {[
              [
                "checkpoint",
                "从检查点继续",
                `从“${task.checkpoint}”继续，不重复执行已完成步骤`,
              ],
              ["requeue", "重新入队", "释放当前资源后以相同输入重新运行"],
              ["release", "终止异常资源", "只终止失去父任务的资源占用"],
              [
                "redistribute",
                "重新分配执行资源",
                "保留检查点并切换到健康的执行单元",
              ],
              ["refund", "退还重复额度", "退还由系统重试产生的重复消耗"],
            ].map(([value, label, note]) => (
              <button
                type="button"
                key={value}
                className={action === value ? "is-active" : ""}
                onClick={() => setAction(value)}
              >
                <i>{action === value ? <Icon name="check" /> : null}</i>
                <span>
                  <b>{label}</b>
                  <small>{note}</small>
                </span>
              </button>
            ))}
          </div>
          <FormField
            label="操作原因"
            required
            error={!reason.trim() ? "请填写操作原因" : ""}
          >
            <TextArea
              value={reason}
              onChange={setReason}
              placeholder="说明判断依据和关联支持记录"
            />
          </FormField>
          <div className="ops-impact-preview">
            <b>执行边界</b>
            <span>不会修改任务输入、业务结果或用户审核状态。</span>
            <span>操作结果和失败原因都会写入不可编辑的审计记录。</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function TaskDetailPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [params, setParams] = useSearchParams();
  const task = tasks.find((item) => item.id === taskId) || tasks[0];
  const state = params.get("state") || "normal";
  const [recovery, setRecovery] = useState(false);
  const timeline = [
    {
      title: "任务创建并进入队列",
      meta: task.startedAt,
      detail: `触发方式：${task.trigger} · 任务归属：${task.scope} · 执行类型：${task.type}`,
      tone: "success",
    },
    {
      title: "完成前置检查",
      meta: "开始后 12 秒",
      detail: "身份、额度、并发和运行环境检查通过。",
      tone: "success",
    },
    {
      title: `进入${task.phase}`,
      meta: task.duration,
      detail:
        task.error === "—"
          ? "任务按照执行计划继续推进。"
          : `检测到 ${task.error}，业务数据未写入。`,
      tone: task.error === "—" ? "info" : "danger",
    },
  ];
  return (
    <div className="ops-page">
      <button
        type="button"
        className="ops-back"
        onClick={() => navigate("/ops/tasks")}
      >
        <Icon name="chevronLeft" />
        返回任务与故障
      </button>
      <OpsPageHeader
        eyebrow={`${task.workspace} · ${task.type}`}
        title={task.id}
        description="此页面仅显示任务元数据、脱敏调用链和安全恢复判断，不展示用户业务内容。"
        actions={<OpsStatus>{task.status}</OpsStatus>}
      />
      <OpsState
        state={state}
        label="任务详情"
        onRetry={() => {
          const next = new URLSearchParams(params);
          next.delete("state");
          setParams(next);
        }}
      >
        {!task.safe && ["运行中", "失败", "需处理"].includes(task.status) ? (
          <OpsInlineState
            tone="warning"
            icon="lock"
            title="当前无法证明恢复操作安全"
            description={task.safeReason}
          />
        ) : task.safe ? (
          <OpsInlineState
            tone="success"
            icon="shield"
            title="可以执行受控恢复"
            description={task.safeReason}
            action={
              <Button
                icon="refresh"
                className="ops-safe-recovery-button"
                onClick={() => setRecovery(true)}
              >
                执行安全恢复
              </Button>
            }
          />
        ) : null}
        <div className="ops-task-detail-grid">
          <OpsSection title="任务状态">
            <OpsDefinitionList
              items={[
                ["工作空间", task.workspace],
                ["任务归属", task.scope],
                ["执行类型", task.type],
                ["所属主线", task.parent],
                ["触发方式", task.trigger],
                ["状态", task.status],
                ["当前阶段", task.phase],
                ["开始时间", task.startedAt],
                ["运行耗时", task.duration],
                ["检查点", task.checkpoint],
                ["重试次数", `${task.retries} 次`],
                ["资源状态", task.resource],
                ["错误分类", task.error],
                ["用量", task.usage],
                ["任务输入与结果", "受隐私边界保护，不向运营端展示"],
              ]}
            />
          </OpsSection>
          <OpsSection title="状态时间线">
            <OpsTimeline items={timeline} />
          </OpsSection>
        </div>
        <OpsSection
          title="脱敏调用链"
          description="只记录服务、动作类别、耗时、状态码和错误码。"
        >
          <div className="ops-call-chain">
            {[
              {
                service: "任务调度",
                action: "分配执行单元",
                duration: "842 ms",
                status: "200",
                error: "—",
              },
              {
                service: task.type === "学术搜索" ? "公开网络搜索" : "大模型",
                action: task.phase,
                duration: "31.4 min",
                status: task.error === "SOURCE_RATE_LIMIT" ? "429" : "200",
                error: task.error,
              },
              {
                service: "结果门禁",
                action: "结构与业务边界检查",
                duration: "2.7 s",
                status: task.error === "OUTPUT_SCHEMA_INVALID" ? "422" : "200",
                error:
                  task.error === "OUTPUT_SCHEMA_INVALID" ? task.error : "—",
              },
            ].map((item, index) => (
              <div key={item.service}>
                <i>{index + 1}</i>
                <span>
                  <b>{item.service}</b>
                  <small>{item.action}</small>
                </span>
                <span>
                  <b>{item.duration}</b>
                  <small>状态 {item.status}</small>
                </span>
                <OpsStatus>{item.error === "—" ? "正常" : "异常"}</OpsStatus>
              </div>
            ))}
          </div>
        </OpsSection>
        <div className="ops-task-detail-grid">
          <OpsSection title="关联上下文">
            <div className="ops-link-list">
              <button
                type="button"
                onClick={() => navigate("/ops/support?tab=diagnostics")}
              >
                <Icon name="file" />
                <span>
                  <b>诊断包 DIAG-260824-031</b>
                  <small>用户主动提交 · 已解析</small>
                </span>
                <Icon name="chevronRight" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/ops/support?tab=records")}
              >
                <Icon name="message" />
                <span>
                  <b>支持记录 SUP-20260824-017</b>
                  <small>处理中</small>
                </span>
                <Icon name="chevronRight" />
              </button>
            </div>
          </OpsSection>
          <OpsSection title="运营操作历史">
            <OpsTimeline
              items={[
                {
                  title: "查看诊断包",
                  meta: "许维 · 今天 16:08",
                  tone: "success",
                },
                {
                  title: "系统生成安全恢复判断",
                  meta: "今天 16:11",
                  tone: task.safe ? "success" : "warning",
                },
              ]}
            />
          </OpsSection>
        </div>
      </OpsState>
      {recovery ? (
        <RecoveryModal task={task} close={() => setRecovery(false)} />
      ) : null}
    </div>
  );
}

function CapabilityDrawer({ capability, close }) {
  const notify = useToast();
  if (!capability) return null;
  return (
    <Drawer
      open
      close={close}
      title={capability.name}
      className="ops-detail-drawer"
    >
      <div className="ops-detail-stack">
        <div className="ops-detail-heading">
          <span>
            <small>系统能力</small>
            <h2>{capability.name}</h2>
          </span>
          <OpsStatus>{capability.status}</OpsStatus>
        </div>
        <OpsDefinitionList
          items={[
            ["成功率", capability.success],
            ["P95 延迟", capability.latency],
            ["容量使用", capability.capacity],
            ["当日成本", capability.cost],
            ["降级状态", capability.fallback],
            ["影响范围", capability.impact],
            ["当前路由", capability.provider],
            ["最近事件", capability.event],
          ]}
        />
        <OpsSection title="近 24 小时">
          <div className="ops-capability-chart">
            <span style={{ height: "42%" }} />
            <span style={{ height: "48%" }} />
            <span style={{ height: "39%" }} />
            <span style={{ height: "61%" }} />
            <span style={{ height: "54%" }} />
            <span style={{ height: "78%" }} />
            <span style={{ height: "64%" }} />
            <span style={{ height: "52%" }} />
          </div>
          <div className="ops-chart-legend">
            <span>
              <i className="is-blue" />
              请求量
            </span>
            <span>
              <i className="is-red" />
              失败率
            </span>
          </div>
        </OpsSection>
        <OpsSection title="能力事件">
          <OpsTimeline
            items={[
              {
                title: capability.event,
                meta: "最近事件",
                tone: capability.status === "正常" ? "success" : "warning",
              },
              {
                title: "当前有效路由继续提供服务",
                meta: "系统自动判断",
                detail: capability.impact,
                tone: capability.status === "降级" ? "warning" : "success",
              },
            ]}
          />
        </OpsSection>
        {capability.status !== "正常" ? (
          <div className="ops-drawer-actions">
            <Button onClick={() => notify("已关联现有安全事件 SEC-260824-006")}>
              关联现有事件
            </Button>
            <Button
              tone="primary"
              onClick={() => notify("安全事件已创建并进入调查状态")}
            >
              创建安全事件
            </Button>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}

function ConfigurationModal({ config, close }) {
  const notify = useToast();
  const [routes, setRoutes] = useState(
    config?.routeItems ||
      config?.route
        ?.split(/→|\+/)
        .map((item) => item.trim())
        .filter(Boolean) ||
      [],
  );
  const [quota, setQuota] = useState(config?.quota || "");
  const [newKey, setNewKey] = useState("");
  const [stage, setStage] = useState("edit");
  const [failed, setFailed] = useState(false);
  if (!config) return null;
  const validate = () => {
    setStage("validating");
    window.setTimeout(() => {
      const shouldFail = routes.some((item) => item.includes("失效"));
      setFailed(shouldFail);
      setStage("validated");
    }, 750);
  };
  const activate = () => {
    notify("新配置已切换生效并生成审计记录");
    close();
  };
  return (
    <Modal
      open
      close={close}
      title="编辑能力配置"
      description={`${config.capability} · 当前生效 ${config.activeVersion}`}
      size="xl"
      closeDisabled={stage === "validating"}
      footer={
        <>
          {stage === "validated" && !failed ? (
            <Button onClick={() => setStage("edit")}>返回编辑</Button>
          ) : (
            <Button onClick={close} disabled={stage === "validating"}>
              取消
            </Button>
          )}
          {stage === "validated" && !failed ? (
            <Button tone="primary" onClick={activate}>
              确认切换生效
            </Button>
          ) : (
            <Button
              tone="primary"
              icon="play"
              loading={stage === "validating"}
              disabled={!routes.length || !quota.trim()}
              onClick={validate}
            >
              运行验证
            </Button>
          )}
        </>
      }
    >
      <div className="ops-config-layout">
        <section>
          <h3>配置草稿</h3>
          <div className="ops-form-grid">
            <FormField label="路由与兜底顺序" required span={2}>
              <OpsSortableList
                label={`${config.capability}路由与兜底顺序`}
                items={routes}
                onChange={setRoutes}
              />
            </FormField>
            <FormField label="额度与预算" required span={2}>
              <TextInput value={quota} onChange={setQuota} />
            </FormField>
            <FormField
              label="新密钥（留空则不变）"
              span={2}
              help="密钥保存后不可回显"
            >
              <TextInput
                value={newKey}
                onChange={setNewKey}
                placeholder="输入新密钥"
              />
            </FormField>
          </div>
          <button
            type="button"
            className="ops-test-failure"
            onClick={() => setRoutes(["主路由", "失效兜底路由"])}
          >
            填入失败示例
          </button>
        </section>
        <section>
          <h3>验证与生效</h3>
          {stage === "edit" ? (
            <OpsInlineState
              tone="info"
              icon="info"
              title="当前版本保持生效"
              description="运行验证不会影响当前用户任务。验证通过后仍需再次确认才会切换版本。"
            />
          ) : stage === "validating" ? (
            <div className="ops-validation-progress">
              <span className="s1-spinner" />
              <b>正在验证连接、权限、路由和额度边界…</b>
              <small>当前有效版本仍为 {config.activeVersion}</small>
            </div>
          ) : failed ? (
            <>
              <OpsInlineState
                tone="danger"
                icon="warning"
                title="配置验证失败"
                description="兜底路由认证失败，当前有效版本没有变化。"
              />
              <div className="ops-validation-list">
                <span className="is-success">
                  <Icon name="check" />
                  主路由连接成功
                </span>
                <span className="is-danger">
                  <Icon name="close" />
                  兜底路由认证失败
                </span>
                <span>
                  <Icon name="minus" />
                  流量切换未执行
                </span>
              </div>
            </>
          ) : (
            <>
              <OpsInlineState
                tone="success"
                icon="check"
                title="配置验证通过"
                description="连接、权限、路由和额度检查均通过。确认后将创建新版本并切换生效。"
              />
              <div className="ops-validation-list">
                <span className="is-success">
                  <Icon name="check" />
                  主路由与兜底路由可用
                </span>
                <span className="is-success">
                  <Icon name="check" />
                  额度和预算边界有效
                </span>
                <span className="is-success">
                  <Icon name="check" />
                  模拟降级切换成功
                </span>
              </div>
            </>
          )}
        </section>
      </div>
    </Modal>
  );
}

export function CapabilitiesPage() {
  const { role } = useOpsRole();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "health";
  const state = params.get("state") || "normal";
  const [selectedCapability, setSelectedCapability] = useState(
    capabilities.find((item) => item.id === params.get("capability")) || null,
  );
  const [selectedConfig, setSelectedConfig] = useState(null);
  const switchTab = (value) => {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    next.delete("state");
    setParams(next);
  };
  const configColumns = [
    { key: "capability", label: "能力", width: 170 },
    { key: "activeVersion", label: "生效版本", width: 110 },
    { key: "route", label: "路由与兜底", width: 300 },
    { key: "quota", label: "额度与预算", width: 170 },
    { key: "key", label: "密钥", width: 170 },
    {
      key: "status",
      label: "验证状态",
      width: 120,
      render: (row) => <OpsStatus>{row.status}</OpsStatus>,
    },
    { key: "validatedAt", label: "最近验证", width: 130 },
    { key: "updatedBy", label: "更新人", width: 100 },
  ];
  return (
    <div className="ops-page">
      <OpsPageHeader
        title="系统能力"
        description="按 Hunter 能力查看健康状态；实际供应商、路由和密钥只在运营端管理。"
      />
      <OpsTabs
        value={tab}
        onChange={switchTab}
        label="系统能力范围"
        items={[
          { value: "health", label: "服务健康", count: capabilities.length },
          {
            value: "configuration",
            label: "模型配置",
            count: 4,
          },
          {
            value: "data-sources",
            label: "数据源配置",
            count: capabilityConfigurations.length - 1,
          },
        ]}
      />
      <OpsState
        state={state === "degraded" ? "normal" : state}
        label="系统能力"
        onRetry={() => switchTab(tab)}
      >
        {tab === "health" ? (
          <>
            <div className="ops-capability-summary">
              <span>
                <b>6</b>
                <small>运行正常</small>
              </span>
              <span className="is-warning">
                <b>1</b>
                <small>降级运行</small>
              </span>
              <span className="is-warning">
                <b>1</b>
                <small>需要关注</small>
              </span>
              <span>
                <b>0</b>
                <small>全面不可用</small>
              </span>
            </div>
            <div className="ops-capability-grid">
              {capabilities.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedCapability(item)}
                >
                  <header>
                    <span className="ops-capability-name">
                      <i>
                        <Icon
                          name={
                            item.name === "邮件"
                              ? "mail"
                              : item.name === "存储"
                                ? "database"
                                : item.name === "文件解析"
                                  ? "file"
                                  : "activity"
                          }
                        />
                      </i>
                      <b>{item.name}</b>
                    </span>
                    <OpsStatus>{item.status}</OpsStatus>
                  </header>
                  <dl>
                    <div>
                      <dt>成功率</dt>
                      <dd>{item.success}</dd>
                    </div>
                    <div>
                      <dt>P95 延迟</dt>
                      <dd>{item.latency}</dd>
                    </div>
                    <div>
                      <dt>容量</dt>
                      <dd>{item.capacity}</dd>
                    </div>
                    <div>
                      <dt>当日成本</dt>
                      <dd>{item.cost}</dd>
                    </div>
                  </dl>
                  <footer>
                    <span>{item.event}</span>
                    <Icon name="chevronRight" />
                  </footer>
                </button>
              ))}
            </div>
          </>
        ) : role === "operator" ? (
          <OpsState
            state="limited"
            label={tab === "configuration" ? "模型配置" : "数据源配置"}
          />
        ) : tab === "configuration" ? (
          <ModelConfigurationPanel />
        ) : (
          <>
            <OpsInlineState
              tone="info"
              icon="shield"
              title="数据源配置采用草稿、验证、确认三步"
              description="公开网络搜索和学术数据独立配置，不与模型后端共享路由、密钥或额度。"
            />
            <OpsTable
              columns={configColumns}
              rows={capabilityConfigurations.filter(
                (item) => item.capability !== "大模型",
              )}
              onRow={setSelectedConfig}
            />
            <OpsPagination
              page={1}
              pages={1}
              onChange={() => {}}
              total={capabilityConfigurations.length - 1}
            />
          </>
        )}
      </OpsState>
      <CapabilityDrawer
        capability={selectedCapability}
        close={() => setSelectedCapability(null)}
      />
      {selectedConfig ? (
        <ConfigurationModal
          config={selectedConfig}
          close={() => setSelectedConfig(null)}
        />
      ) : null}
    </div>
  );
}

function SupportDrawer({ record, close }) {
  const notify = useToast();
  const [status, setStatus] = useState(record.status);
  if (!record) return null;
  return (
    <Drawer
      open
      close={close}
      title={record.id}
      className="ops-detail-drawer ops-support-drawer"
    >
      <div className="ops-detail-stack">
        <div className="ops-detail-heading">
          <span>
            <small>{record.category}</small>
            <h2>{record.workspace}</h2>
          </span>
          <OpsStatus>{status}</OpsStatus>
        </div>
        <div className="ops-support-brief">
          <small>用户反馈摘要</small>
          <p>{record.summary}</p>
          <span>
            创建于 {record.createdAt} · 最近更新 {record.updatedAt}
          </span>
        </div>
        <OpsSection
          title="问题处理清单"
          description="每一步都保留处理人和结论，避免只记录一条模糊状态。"
        >
          <div className="ops-support-checklist">
            <span className="is-complete">
              <i>
                <Icon name="check" />
              </i>
              <b>确认问题范围</b>
              <small>{record.category} · 已完成</small>
            </span>
            <span
              className={record.diagnostic === "—" ? "is-muted" : "is-complete"}
            >
              <i>
                <Icon name={record.diagnostic === "—" ? "minus" : "check"} />
              </i>
              <b>检查诊断信息</b>
              <small>
                {record.diagnostic === "—"
                  ? "当前问题不需要诊断包"
                  : `${record.diagnostic} 完整性检查通过`}
              </small>
            </span>
            <span
              className={status === "已解决" ? "is-complete" : "is-current"}
            >
              <i>
                <Icon name={status === "已解决" ? "check" : "activity"} />
              </i>
              <b>回复用户并验证结果</b>
              <small>
                {status === "已解决"
                  ? "用户已确认问题解决"
                  : "等待处理人补充结论"}
              </small>
            </span>
          </div>
        </OpsSection>
        <OpsSection title="关联诊断与任务">
          <div className="ops-link-list">
            {record.diagnostic !== "—" ? (
              <button type="button">
                <Icon name="file" />
                <span>
                  <b>{record.diagnostic}</b>
                  <small>诊断包 · 已完成完整性检查</small>
                </span>
                <Icon name="chevronRight" />
              </button>
            ) : null}
            {record.category === "任务运行异常" ? (
              <button type="button">
                <Icon name="activity" />
                <span>
                  <b>TASK-260824-019</b>
                  <small>支线任务 · 学术搜索 · 失败</small>
                </span>
                <Icon name="chevronRight" />
              </button>
            ) : null}
            {record.diagnostic === "—" && record.category !== "任务运行异常" ? (
              <p className="ops-muted-copy">
                当前支持记录没有关联诊断包或运行任务。
              </p>
            ) : null}
          </div>
        </OpsSection>
        <OpsSection title="沟通与处理记录">
          <OpsTimeline
            items={[
              {
                title: "用户创建支持记录",
                meta: record.createdAt,
                detail: record.summary,
                tone: "success",
              },
              {
                title:
                  record.diagnostic === "—" ? "完成问题分类" : "诊断包已关联",
                meta: record.updatedAt,
                detail:
                  record.diagnostic === "—"
                    ? `处理人 ${record.operator} 已确认当前问题不需要诊断包。`
                    : `${record.diagnostic} 已完成完整性检查。`,
                tone: record.status === "已解决" ? "success" : "warning",
              },
            ]}
          />
        </OpsSection>
        <div className="ops-drawer-actions">
          <Button
            disabled={status === "等待用户"}
            onClick={() => {
              setStatus("等待用户");
              notify("支持记录已更新为等待用户");
            }}
          >
            等待用户
          </Button>
          <Button
            tone="primary"
            disabled={status === "已解决"}
            onClick={() => {
              setStatus("已解决");
              notify("支持记录已标记为已解决");
            }}
          >
            标记已解决
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

function DiagnosticDrawer({ diagnostic, close }) {
  if (!diagnostic) return null;
  return (
    <Drawer
      open
      close={close}
      title={diagnostic.id}
      className="ops-detail-drawer ops-diagnostic-drawer"
    >
      <div className="ops-detail-stack">
        <div className="ops-detail-heading">
          <span>
            <small>用户主动提交的诊断包</small>
            <h2>{diagnostic.workspace}</h2>
          </span>
          <OpsStatus>{diagnostic.status}</OpsStatus>
        </div>
        <div className="ops-diagnostic-integrity">
          <i>
            <Icon
              name={diagnostic.checksum === "匹配" ? "shield" : "warning"}
            />
          </i>
          <span>
            <b>文件完整性：{diagnostic.checksum}</b>
            <small>诊断内容已按隐私边界脱敏，不包含用户业务正文。</small>
          </span>
        </div>
        <OpsSection title="运行环境">
          <OpsDefinitionList
            items={[
              ["产品版本", diagnostic.version],
              ["运行环境", diagnostic.environment],
              ["生成时间", diagnostic.createdAt],
              ["有效期", diagnostic.expiresAt],
              ["关联任务", diagnostic.task],
              ["解析状态", diagnostic.status],
            ]}
          />
        </OpsSection>
        <OpsSection
          title="可用诊断信息"
          description="只展示排障所需的系统状态和脱敏错误摘要。"
        >
          <div className="ops-diagnostic-sections">
            <span>
              <b>进程与任务目录</b>
              <small>任务目录存在 · 父子进程关系正常</small>
            </span>
            <span>
              <b>网络与能力调用</b>
              <small>公开网络搜索出现 3 次 429，已进入降级路径</small>
            </span>
            <span>
              <b>最近错误</b>
              <small>SOURCE_RATE_LIMIT · 结果尚未写入</small>
            </span>
          </div>
        </OpsSection>
      </div>
    </Drawer>
  );
}

function SecurityDrawer({ event, close }) {
  const notify = useToast();
  const [status, setStatus] = useState(event.status);
  return (
    <Drawer open close={close} title={event.id} className="ops-detail-drawer">
      <div className="ops-detail-stack">
        <div className="ops-detail-heading">
          <span>
            <small>{event.type}</small>
            <h2>{event.summary}</h2>
          </span>
          <OpsStatus>{status}</OpsStatus>
        </div>
        <OpsDefinitionList
          items={[
            ["事件级别", event.severity],
            ["影响范围", event.scope],
            ["首次发生", event.firstSeen],
            ["最近发生", event.lastSeen],
            ["处理人", event.owner],
            ["业务内容", "不采集、不展示"],
          ]}
        />
        <OpsSection title="调查记录">
          <OpsTimeline
            items={[
              {
                title: "系统创建安全事件",
                meta: event.firstSeen,
                detail: event.summary,
                tone: "warning",
              },
              {
                title: status === "已关闭" ? "事件已关闭" : "等待管理员判断",
                meta: event.lastSeen,
                detail: event.scope,
                tone: status === "已关闭" ? "success" : "warning",
              },
            ]}
          />
        </OpsSection>
        <div className="ops-drawer-actions">
          <Button
            disabled={status === "调查中"}
            onClick={() => {
              setStatus("调查中");
              notify("安全事件已进入调查状态");
            }}
          >
            开始调查
          </Button>
          <Button
            tone="primary"
            disabled={status === "已关闭"}
            onClick={() => {
              setStatus("已关闭");
              notify("安全事件已关闭并保留处理记录");
            }}
          >
            关闭事件
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export function SupportPage() {
  const { role } = useOpsRole();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "records";
  const state = params.get("state") || "normal";
  const [filters, setFilters] = useState({});
  const rawSource =
    tab === "diagnostics"
      ? diagnostics
      : tab === "audit"
        ? auditRecords
        : tab === "security"
          ? securityEvents
          : supportRecords;
  const source = useMemo(
    () =>
      rawSource.filter((item) => {
        if (tab === "records")
          return (
            (!filters.supportStatus || item.status === filters.supportStatus) &&
            (!filters.category || item.category === filters.category)
          );
        if (tab === "diagnostics")
          return (
            !filters.diagnosticStatus ||
            item.status === filters.diagnosticStatus
          );
        if (tab === "audit")
          return (
            (!filters.result || item.result === filters.result) &&
            (!filters.role || item.role === filters.role)
          );
        return (
          (!filters.severity || item.severity === filters.severity) &&
          (!filters.securityStatus || item.status === filters.securityStatus)
        );
      }),
    [filters, rawSource, tab],
  );
  const list = useOpsList(source, [
    "id",
    "workspace",
    "summary",
    "action",
    "object",
    "type",
  ]);
  const [selected, setSelected] = useState(null);
  const switchTab = (value) => {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    next.delete("state");
    setParams(next);
    list.setQuery("");
    setFilters({});
  };
  const columns = useMemo(() => {
    if (tab === "diagnostics")
      return [
        { key: "id", label: "诊断包", width: 190 },
        { key: "workspace", label: "工作空间", width: 210 },
        { key: "version", label: "产品版本", width: 120 },
        { key: "createdAt", label: "生成时间", width: 130 },
        { key: "expiresAt", label: "有效期", width: 120 },
        { key: "task", label: "关联任务", width: 180 },
        { key: "environment", label: "环境摘要", width: 230 },
        {
          key: "status",
          label: "解析状态",
          width: 120,
          render: (row) => <OpsStatus>{row.status}</OpsStatus>,
        },
      ];
    if (tab === "audit")
      return [
        { key: "id", label: "审计编号", width: 170 },
        { key: "actor", label: "操作者", width: 110 },
        { key: "role", label: "角色", width: 130 },
        { key: "action", label: "操作", width: 220 },
        { key: "object", label: "对象", width: 220 },
        {
          key: "result",
          label: "结果",
          width: 100,
          render: (row) => <OpsStatus>{row.result}</OpsStatus>,
        },
        { key: "reference", label: "关联记录", width: 170 },
        { key: "createdAt", label: "时间", width: 140 },
      ];
    if (tab === "security")
      return [
        { key: "id", label: "事件编号", width: 170 },
        { key: "type", label: "事件类型", width: 150 },
        {
          key: "severity",
          label: "级别",
          width: 100,
          render: (row) => <OpsStatus>{row.severity}</OpsStatus>,
        },
        { key: "summary", label: "摘要", width: 320 },
        { key: "scope", label: "影响范围", width: 190 },
        {
          key: "status",
          label: "状态",
          width: 110,
          render: (row) => <OpsStatus>{row.status}</OpsStatus>,
        },
        { key: "lastSeen", label: "最近发生", width: 140 },
        { key: "owner", label: "处理人", width: 100 },
      ];
    return [
      { key: "id", label: "支持编号", width: 180 },
      { key: "workspace", label: "工作空间", width: 210 },
      { key: "category", label: "问题分类", width: 150 },
      { key: "summary", label: "问题摘要", width: 330 },
      { key: "diagnostic", label: "诊断包", width: 170 },
      {
        key: "status",
        label: "状态",
        width: 110,
        render: (row) => <OpsStatus>{row.status}</OpsStatus>,
      },
      { key: "updatedAt", label: "最近更新", width: 130 },
      { key: "operator", label: "处理人", width: 100 },
    ];
  }, [tab]);
  return (
    <div className="ops-page">
      <OpsPageHeader
        title="支持与审计"
        description="保留最小支持记录、用户主动提交的诊断包、不可编辑的操作审计和安全事件。"
      />
      <OpsTabs
        value={tab}
        onChange={switchTab}
        label="支持与审计范围"
        items={[
          { value: "records", label: "支持记录", count: supportRecords.length },
          { value: "diagnostics", label: "诊断包", count: diagnostics.length },
          { value: "audit", label: "操作审计", count: auditRecords.length },
          {
            value: "security",
            label: "安全事件",
            count: securityEvents.length,
          },
        ]}
      />
      {tab === "security" && role === "operator" ? (
        <OpsInlineState
          tone="warning"
          icon="lock"
          title="安全事件按职责显示"
          description="运营人员只能查看与用户支持相关的摘要；完整事件仅系统管理员可见。"
        />
      ) : null}
      <OpsState state={state} label="支持与审计" onRetry={() => switchTab(tab)}>
        <OpsFilterBar
          query={list.query}
          onQuery={list.setQuery}
          placeholder="搜索编号、工作空间、对象或摘要"
          filters={
            tab === "records"
              ? [
                  {
                    label: "处理状态",
                    options: ["处理中", "等待用户", "已解决"],
                    value: filters.supportStatus || "",
                    onChange: (value) =>
                      setFilters((current) => ({
                        ...current,
                        supportStatus: value,
                      })),
                  },
                  {
                    label: "问题分类",
                    options: [
                      "任务运行异常",
                      "支付问题",
                      "试用范围",
                      "账号使用",
                    ],
                    value: filters.category || "",
                    onChange: (value) =>
                      setFilters((current) => ({
                        ...current,
                        category: value,
                      })),
                  },
                ]
              : tab === "diagnostics"
                ? [
                    {
                      label: "解析状态",
                      options: ["已解析", "已过期", "文件损坏"],
                      value: filters.diagnosticStatus || "",
                      onChange: (value) =>
                        setFilters((current) => ({
                          ...current,
                          diagnosticStatus: value,
                        })),
                    },
                  ]
                : tab === "audit"
                  ? [
                      {
                        label: "操作结果",
                        options: ["成功", "失败"],
                        value: filters.result || "",
                        onChange: (value) =>
                          setFilters((current) => ({
                            ...current,
                            result: value,
                          })),
                      },
                      {
                        label: "角色",
                        options: ["运营人员", "系统管理员"],
                        value: filters.role || "",
                        onChange: (value) =>
                          setFilters((current) => ({
                            ...current,
                            role: value,
                          })),
                      },
                    ]
                  : [
                      {
                        label: "事件级别",
                        options: ["高", "中", "低"],
                        value: filters.severity || "",
                        onChange: (value) =>
                          setFilters((current) => ({
                            ...current,
                            severity: value,
                          })),
                      },
                      {
                        label: "处理状态",
                        options: ["调查中", "已确认", "已关闭"],
                        value: filters.securityStatus || "",
                        onChange: (value) =>
                          setFilters((current) => ({
                            ...current,
                            securityStatus: value,
                          })),
                      },
                    ]
          }
        />
        <OpsTable
          columns={columns}
          rows={list.visible}
          onRow={
            tab === "records"
              ? setSelected
              : tab === "diagnostics"
                ? (row) =>
                    setSelected({
                      ...row,
                      category: "诊断包",
                      summary: `环境 ${row.environment}，完整性校验${row.checksum}。`,
                      diagnostic: row.id,
                      updatedAt: row.createdAt,
                      operator: "系统自动解析",
                    })
                : tab === "security" && role === "admin"
                  ? setSelected
                  : undefined
          }
        />
        <OpsPagination
          page={list.page}
          pages={list.pages}
          onChange={list.setPage}
          total={list.filtered.length}
        />
      </OpsState>
      {selected && tab === "security" ? (
        <SecurityDrawer event={selected} close={() => setSelected(null)} />
      ) : selected && tab === "diagnostics" ? (
        <DiagnosticDrawer
          diagnostic={selected}
          close={() => setSelected(null)}
        />
      ) : selected ? (
        <SupportDrawer record={selected} close={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
