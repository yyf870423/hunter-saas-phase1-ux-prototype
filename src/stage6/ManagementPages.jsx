import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button, Drawer, Modal, useToast } from "../stage1/ui";
import {
  CustomCheckbox,
  FormField,
  SelectMenu,
  TextArea,
  TextInput,
} from "../stage4/asset-ui";
import {
  entitlementChanges,
  orders,
  subscriptions,
  tasks,
  trialApplications,
  users,
  workspaces,
} from "./operations-data";
import {
  OpsDefinitionList,
  OpsFilterBar,
  OpsInlineState,
  OpsPageHeader,
  OpsPagination,
  OpsSection,
  OpsState,
  OpsStatus,
  OpsTable,
  OpsTabs,
  OpsTimeline,
  useOpsList,
} from "./operations-ui";

const workspaceColumns = [
  {
    key: "name",
    label: "工作空间",
    width: 220,
    render: (row) => (
      <span className="ops-primary-cell">
        <b>{row.name}</b>
        <small>{row.workspaceNo}</small>
      </span>
    ),
  },
  { key: "owner", label: "所有者", width: 130 },
  {
    key: "plan",
    label: "订阅",
    width: 120,
    render: (row) => (
      <span className="ops-stacked-cell">
        <b>{row.plan}</b>
        <small>{row.subscription}</small>
      </span>
    ),
  },
  {
    key: "quota",
    label: "用量",
    width: 140,
    render: (row) => (
      <span className="ops-usage-cell">
        <span>
          <i style={{ width: `${row.quota}%` }} />
        </span>
        <b>{row.quota}%</b>
      </span>
    ),
  },
  {
    key: "storage",
    label: "存储",
    width: 125,
    render: (row) => (
      <span className="ops-stacked-cell">
        <b>{row.storage}</b>
        <small>{row.storageRisk}</small>
      </span>
    ),
  },
  {
    key: "health",
    label: "任务健康",
    width: 125,
    render: (row) => <OpsStatus>{row.health}</OpsStatus>,
  },
  { key: "lastActive", label: "最近活动", width: 130 },
];

const userColumns = [
  {
    key: "name",
    label: "用户",
    width: 180,
    render: (row) => (
      <span className="ops-primary-cell">
        <b>{row.name}</b>
        <small>{row.id}</small>
      </span>
    ),
  },
  { key: "email", label: "登录邮箱", width: 240 },
  {
    key: "verified",
    label: "邮箱状态",
    width: 120,
    render: (row) => <OpsStatus>{row.verified}</OpsStatus>,
  },
  {
    key: "security",
    label: "安全状态",
    width: 120,
    render: (row) => <OpsStatus>{row.security}</OpsStatus>,
  },
  { key: "workspace", label: "所属工作空间", width: 200 },
  { key: "lastLogin", label: "最近登录", width: 130 },
  {
    key: "status",
    label: "账号状态",
    width: 110,
    render: (row) => <OpsStatus>{row.status}</OpsStatus>,
  },
];

function WorkspaceDrawer({ workspace, close }) {
  const navigate = useNavigate();
  if (!workspace) return null;
  const relatedTasks = tasks.filter(
    (item) => item.workspaceId === workspace.id,
  );
  return (
    <Drawer
      open
      close={close}
      title={workspace.name}
      className="ops-detail-drawer"
    >
      <div className="ops-detail-stack">
        <div className="ops-detail-heading">
          <span>
            <small>{workspace.workspaceNo}</small>
            <h2>{workspace.name}</h2>
          </span>
          <OpsStatus>{workspace.account}</OpsStatus>
        </div>
        <OpsDefinitionList
          items={[
            ["所有者", workspace.owner],
            ["登录邮箱", workspace.email],
            ["创建时间", workspace.createdAt],
            ["地区", workspace.region],
            ["当前订阅", `${workspace.plan} · ${workspace.subscription}`],
            ["用量", `${workspace.quota}%`],
          ]}
        />
        <OpsSection
          title="任务健康"
          description="引用任务中心的同一组脱敏数据。"
          action={
            <Button
              size="sm"
              onClick={() => {
                navigate(`/ops/tasks?workspace=${workspace.id}`);
                close();
              }}
            >
              查看全部任务
            </Button>
          }
        >
          <div className="ops-compact-table">
            {relatedTasks.length ? (
              relatedTasks.map((task) => (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => {
                    navigate(`/ops/tasks/${task.id}`);
                    close();
                  }}
                >
                  <span>
                    <b>{task.id}</b>
                    <small>
                      {task.type} · {task.phase}
                    </small>
                  </span>
                  <OpsStatus>{task.status}</OpsStatus>
                </button>
              ))
            ) : (
              <p className="ops-muted-copy">当前没有需要关注的运行任务。</p>
            )}
          </div>
        </OpsSection>
        <OpsSection
          title="存储占用"
          description="只显示分类和容量，不展示文件名或内容。"
        >
          <div className="ops-storage-bars">
            <span>
              <b>结构化数据</b>
              <i>
                <em style={{ width: "48%" }} />
              </i>
              <small>3.2 GB</small>
            </span>
            <span>
              <b>用户文件</b>
              <i>
                <em style={{ width: "34%" }} />
              </i>
              <small>2.3 GB</small>
            </span>
            <span>
              <b>任务工作区</b>
              <i>
                <em style={{ width: "19%" }} />
              </i>
              <small>1.3 GB</small>
            </span>
          </div>
        </OpsSection>
        <OpsSection title="关联记录">
          <div className="ops-link-list">
            <button
              type="button"
              onClick={() => {
                navigate(`/ops/subscriptions?workspace=${workspace.id}`);
                close();
              }}
            >
              <Icon name="creditCard" />
              <span>
                <b>订阅与额度</b>
                <small>查看当前权益和调整历史</small>
              </span>
              <Icon name="chevronRight" />
            </button>
            <button
              type="button"
              onClick={() => {
                navigate(`/ops/support?workspace=${workspace.id}`);
                close();
              }}
            >
              <Icon name="message" />
              <span>
                <b>支持记录</b>
                <small>{workspace.supportCount} 条记录</small>
              </span>
              <Icon name="chevronRight" />
            </button>
          </div>
        </OpsSection>
      </div>
    </Drawer>
  );
}

function TrialModal({ item, close }) {
  const notify = useToast();
  const [action, setAction] = useState("approve");
  const [days, setDays] = useState("21");
  const [quota, setQuota] = useState("3000");
  const [concurrency, setConcurrency] = useState("2");
  const [reason, setReason] = useState("");
  const [sendStandardNotice, setSendStandardNotice] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  if (!item) return null;
  const submit = () => {
    if (action !== "approve" && !reason.trim()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      notify(
        action === "approve"
          ? "试用申请已批准，账号与工作空间已创建"
          : action === "hold"
            ? "申请已暂缓"
            : "申请已拒绝",
      );
      close();
    }, 650);
  };
  return (
    <Modal
      open
      close={close}
      title="处理试用申请"
      description={`${item.name} · ${item.email}`}
      size="xl"
      closeDisabled={submitting}
      footer={
        <>
          <Button disabled={submitting} onClick={close}>
            取消
          </Button>
          <Button
            tone="primary"
            loading={submitting}
            disabled={action !== "approve" && !reason.trim()}
            onClick={submit}
          >
            {action === "approve"
              ? "批准并创建"
              : action === "hold"
                ? "确认暂缓"
                : "确认拒绝"}
          </Button>
        </>
      }
    >
      <div className="ops-trial-layout">
        <section>
          <h3>申请信息</h3>
          <OpsDefinitionList
            items={[
              ["申请编号", item.id],
              ["申请人", item.name],
              ["从业情况", item.experience],
              ["预计规模", item.scale],
              ["申请时间", item.appliedAt],
              ["补充说明", item.note],
            ]}
          />
        </section>
        <section>
          <h3>处理方式</h3>
          <div className="ops-action-choice">
            {[
              ["approve", "批准试用", "创建账号和独立工作空间"],
              ["hold", "暂缓处理", "保留申请并设置后续处理时间"],
              ["reject", "拒绝申请", "不创建账号和工作空间"],
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
          {action === "approve" ? (
            <div className="ops-form-grid">
              <FormField label="试用期限（天）" required>
                <TextInput value={days} onChange={setDays} />
              </FormField>
              <FormField label="初始任务额度" required>
                <TextInput value={quota} onChange={setQuota} />
              </FormField>
              <FormField label="并发上限" required>
                <TextInput value={concurrency} onChange={setConcurrency} />
              </FormField>
              <div className="ops-create-preview">
                <b>将创建</b>
                <span>用户账号：{item.email}</span>
                <span>工作空间：{item.name}的工作空间</span>
              </div>
            </div>
          ) : (
            <div className="ops-form-stack">
              <FormField
                label={
                  action === "hold" ? "暂缓原因与下次处理时间" : "内部原因"
                }
                required
                error={!reason.trim() ? "请填写处理原因" : ""}
              >
                <TextArea
                  value={reason}
                  onChange={setReason}
                  placeholder={
                    action === "hold"
                      ? "例如：等待申请人确认试用人数，下周三再次联系"
                      : "该原因仅供运营内部查看"
                  }
                />
              </FormField>
              {action === "reject" ? (
                <div className="ops-standard-notice">
                  <CustomCheckbox
                    checked={sendStandardNotice}
                    onChange={setSendStandardNotice}
                    label="向申请人发送标准结果说明"
                  />
                  {sendStandardNotice ? (
                    <p>
                      感谢你申请 Hunter
                      试用。当前批次名额有限，本次暂未能开通；后续开放新的名额时，我们会再次通知你。
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

export function UsersWorkspacesPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "workspaces";
  const state = params.get("state") || "normal";
  const [filters, setFilters] = useState({});
  const [selectedWorkspace, setSelectedWorkspace] = useState(
    workspaces.find((item) => item.id === params.get("workspace")) || null,
  );
  const [selectedUser, setSelectedUser] = useState(null);
  const [trial, setTrial] = useState(null);
  const rawSource =
    tab === "users" ? users : tab === "trials" ? trialApplications : workspaces;
  const source = useMemo(
    () =>
      rawSource.filter((item) => {
        if (tab === "workspaces")
          return (
            (!filters.subscription ||
              item.subscription === filters.subscription) &&
            (!filters.health || item.health === filters.health) &&
            (!filters.storage || item.storageRisk === filters.storage)
          );
        if (tab === "users")
          return (
            (!filters.account || item.status === filters.account) &&
            (!filters.security || item.security === filters.security)
          );
        return !filters.trial || item.status === filters.trial;
      }),
    [filters, rawSource, tab],
  );
  const list = useOpsList(
    source,
    tab === "users"
      ? ["name", "email", "workspace"]
      : tab === "trials"
        ? ["name", "email", "experience"]
        : ["name", "owner", "email", "workspaceNo"],
  );
  const switchTab = (value) => {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    next.delete("state");
    setParams(next);
    list.setQuery("");
    setFilters({});
  };
  const retry = () => {
    const next = new URLSearchParams(params);
    next.delete("state");
    setParams(next);
  };
  const trialColumns = [
    {
      key: "name",
      label: "申请人",
      width: 180,
      render: (row) => (
        <span className="ops-primary-cell">
          <b>{row.name}</b>
          <small>{row.email}</small>
        </span>
      ),
    },
    { key: "experience", label: "从业情况", width: 190 },
    { key: "scale", label: "预计使用规模", width: 240 },
    { key: "appliedAt", label: "申请时间", width: 130 },
    {
      key: "status",
      label: "状态",
      width: 110,
      render: (row) => <OpsStatus>{row.status}</OpsStatus>,
    },
  ];
  return (
    <div className="ops-page">
      <OpsPageHeader
        title="用户与工作空间"
        description="账号和工作空间分别管理；订阅、任务与支持状态引用对应模块的同一数据。"
      />
      <OpsTabs
        label="用户与工作空间范围"
        value={tab}
        onChange={switchTab}
        items={[
          { value: "workspaces", label: "工作空间", count: workspaces.length },
          { value: "users", label: "用户账号", count: users.length },
          {
            value: "trials",
            label: "试用申请",
            count: trialApplications.filter((item) => item.status === "待处理")
              .length,
          },
        ]}
      />
      <OpsState
        state={state}
        label={
          tab === "workspaces"
            ? "工作空间"
            : tab === "users"
              ? "用户账号"
              : "试用申请"
        }
        onRetry={retry}
      >
        <OpsFilterBar
          query={list.query}
          onQuery={list.setQuery}
          placeholder={
            tab === "workspaces"
              ? "搜索名称、所有者、邮箱或工作空间编号"
              : tab === "users"
                ? "搜索姓名、邮箱或工作空间"
                : "搜索申请人、邮箱或从业方向"
          }
          filters={
            tab === "workspaces"
              ? [
                  {
                    label: "订阅状态",
                    options: ["正常", "3 天后到期", "支付异常", "已到期"],
                    value: filters.subscription || "",
                    onChange: (value) =>
                      setFilters((current) => ({
                        ...current,
                        subscription: value,
                      })),
                  },
                  {
                    label: "任务健康",
                    options: ["正常", "需关注", "无运行任务"],
                    value: filters.health || "",
                    onChange: (value) =>
                      setFilters((current) => ({ ...current, health: value })),
                  },
                  {
                    label: "存储风险",
                    options: ["正常", "接近上限"],
                    value: filters.storage || "",
                    onChange: (value) =>
                      setFilters((current) => ({ ...current, storage: value })),
                  },
                ]
              : tab === "users"
                ? [
                    {
                      label: "账号状态",
                      options: ["正常", "已停用"],
                      value: filters.account || "",
                      onChange: (value) =>
                        setFilters((current) => ({
                          ...current,
                          account: value,
                        })),
                    },
                    {
                      label: "安全状态",
                      options: ["正常", "需要验证"],
                      value: filters.security || "",
                      onChange: (value) =>
                        setFilters((current) => ({
                          ...current,
                          security: value,
                        })),
                    },
                  ]
                : [
                    {
                      label: "申请状态",
                      options: ["待处理", "暂缓", "已批准", "已拒绝"],
                      value: filters.trial || "",
                      onChange: (value) =>
                        setFilters((current) => ({ ...current, trial: value })),
                    },
                  ]
          }
        />
        <OpsTable
          columns={
            tab === "workspaces"
              ? workspaceColumns
              : tab === "users"
                ? userColumns
                : trialColumns
          }
          rows={list.visible}
          onRow={
            tab === "workspaces"
              ? setSelectedWorkspace
              : tab === "users"
                ? setSelectedUser
                : setTrial
          }
          emptyTitle={
            tab === "trials" ? "没有待处理的试用申请" : "没有符合条件的数据"
          }
        />
        <OpsPagination
          page={list.page}
          pages={list.pages}
          onChange={list.setPage}
          total={list.filtered.length}
        />
      </OpsState>
      <WorkspaceDrawer
        workspace={selectedWorkspace}
        close={() => setSelectedWorkspace(null)}
      />
      <Drawer
        open={Boolean(selectedUser)}
        close={() => setSelectedUser(null)}
        title={selectedUser?.name || "用户详情"}
        className="ops-detail-drawer"
      >
        {selectedUser ? (
          <div className="ops-detail-stack">
            <OpsDefinitionList
              items={[
                ["用户编号", selectedUser.id],
                ["登录邮箱", selectedUser.email],
                ["邮箱验证", selectedUser.verified],
                ["账号状态", selectedUser.status],
                ["安全状态", selectedUser.security],
                ["最近登录", selectedUser.lastLogin],
              ]}
            />
            <OpsSection title="工作空间关系">
              <div className="ops-link-list">
                <button
                  type="button"
                  onClick={() => {
                    const workspace = workspaces.find(
                      (item) => item.name === selectedUser.workspace,
                    );
                    setSelectedUser(null);
                    setSelectedWorkspace(workspace);
                  }}
                >
                  <Icon name="building" />
                  <span>
                    <b>{selectedUser.workspace}</b>
                    <small>所有者</small>
                  </span>
                  <Icon name="chevronRight" />
                </button>
              </div>
            </OpsSection>
            <OpsSection title="登录会话摘要">
              <OpsTimeline
                items={[
                  {
                    title: "当前会话",
                    meta: "今天 16:42 · 中国上海 · Web",
                    tone: "success",
                  },
                  {
                    title: "桌面端",
                    meta: "昨天 21:08 · macOS arm64",
                    tone: "neutral",
                  },
                ]}
              />
            </OpsSection>
          </div>
        ) : null}
      </Drawer>
      <TrialModal item={trial} close={() => setTrial(null)} />
    </div>
  );
}

const subscriptionColumns = [
  { key: "workspace", label: "工作空间", width: 220 },
  { key: "plan", label: "套餐", width: 120 },
  {
    key: "status",
    label: "订阅状态",
    width: 140,
    render: (row) => <OpsStatus>{row.status}</OpsStatus>,
  },
  { key: "renewal", label: "续订方式", width: 150 },
  { key: "period", label: "当前周期", width: 210 },
  { key: "quota", label: "用量", width: 100 },
  {
    key: "payment",
    label: "支付状态",
    width: 110,
    render: (row) => <OpsStatus>{row.payment}</OpsStatus>,
  },
];

function AdjustmentModal({ subscription, close }) {
  const notify = useToast();
  const [type, setType] = useState("任务额度");
  const [value, setValue] = useState("120");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  if (!subscription) return null;
  const save = () => {
    if (!reason.trim()) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      notify("权益调整已生效并生成审计记录");
      close();
    }, 650);
  };
  return (
    <Modal
      open
      close={close}
      title="调整权益"
      description={subscription.workspace}
      size="lg"
      closeDisabled={saving}
      footer={
        <>
          <Button onClick={close} disabled={saving}>
            取消
          </Button>
          <Button
            tone="primary"
            loading={saving}
            disabled={!reason.trim() || !value.trim()}
            onClick={save}
          >
            确认调整
          </Button>
        </>
      }
    >
      <div className="ops-form-grid">
        <FormField label="调整类型" required>
          <SelectMenu
            label="调整类型"
            value={type}
            onChange={setType}
            options={["任务额度", "试用期限", "并发上限", "存储额度"]}
          />
        </FormField>
        <FormField label="增加数量" required>
          <TextInput value={value} onChange={setValue} />
        </FormField>
        <FormField
          label="调整原因"
          required
          span={2}
          error={!reason.trim() ? "请填写调整原因" : ""}
        >
          <TextArea
            value={reason}
            onChange={setReason}
            placeholder="说明用户诉求、系统故障或关联支持记录"
          />
        </FormField>
        <div className="ops-impact-preview">
          <b>调整影响</b>
          <span>当前任务额度：4,800</span>
          <span>调整后任务额度：4,920</span>
          <span>影响周期：当前订阅周期</span>
          <span>本操作将记录操作者、原因和调整前后值。</span>
        </div>
      </div>
    </Modal>
  );
}

export function SubscriptionsPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "subscriptions";
  const state = params.get("state") || "normal";
  const [filters, setFilters] = useState({});
  const rawSource =
    tab === "orders"
      ? orders
      : tab === "adjustments"
        ? entitlementChanges
        : subscriptions;
  const source = useMemo(
    () =>
      rawSource.filter((item) => {
        if (tab === "subscriptions")
          return (
            (!filters.plan || item.plan === filters.plan) &&
            (!filters.status || item.status === filters.status)
          );
        if (tab === "orders")
          return (
            (!filters.orderStatus || item.status === filters.orderStatus) &&
            (!filters.method || item.method === filters.method)
          );
        return !filters.type || item.type === filters.type;
      }),
    [filters, rawSource, tab],
  );
  const fields =
    tab === "orders"
      ? ["id", "workspace", "plan"]
      : tab === "adjustments"
        ? ["id", "workspace", "reason", "reference"]
        : ["id", "workspace", "plan"];
  const list = useOpsList(source, fields);
  const [selected, setSelected] = useState(null);
  const switchTab = (value) => {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    next.delete("state");
    setParams(next);
    list.setQuery("");
    setFilters({});
  };
  const retry = () => {
    const next = new URLSearchParams(params);
    next.delete("state");
    setParams(next);
  };
  const orderColumns = [
    { key: "id", label: "订单号", width: 190 },
    { key: "workspace", label: "工作空间", width: 210 },
    { key: "plan", label: "套餐", width: 150 },
    { key: "amount", label: "金额", width: 110 },
    { key: "method", label: "支付方式", width: 120 },
    {
      key: "status",
      label: "支付状态",
      width: 120,
      render: (row) => <OpsStatus>{row.status}</OpsStatus>,
    },
    { key: "createdAt", label: "创建时间", width: 130 },
    { key: "completedAt", label: "完成时间", width: 130 },
  ];
  const changeColumns = [
    { key: "id", label: "调整编号", width: 170 },
    { key: "workspace", label: "工作空间", width: 200 },
    { key: "type", label: "权益类型", width: 120 },
    { key: "before", label: "调整前", width: 100 },
    { key: "after", label: "调整后", width: 100 },
    { key: "reason", label: "原因", width: 240 },
    { key: "reference", label: "关联记录", width: 160 },
    { key: "operator", label: "操作者", width: 150 },
    { key: "createdAt", label: "时间", width: 130 },
  ];
  return (
    <div className="ops-page">
      <OpsPageHeader
        title="订阅与额度"
        description="管理工作空间订阅、支付状态和权益调整；所有人工修改都保留审计记录。"
      />
      <OpsTabs
        label="订阅与额度范围"
        value={tab}
        onChange={switchTab}
        items={[
          {
            value: "subscriptions",
            label: "订阅工作空间",
            count: subscriptions.length,
          },
          { value: "orders", label: "支付订单", count: orders.length },
          {
            value: "adjustments",
            label: "权益调整",
            count: entitlementChanges.length,
          },
        ]}
      />
      {params.get("status") === "failed" ? (
        <OpsInlineState
          tone="warning"
          icon="warning"
          title="1 笔自动续订扣款失败"
          description="工作空间仍可查看和导出数据，自动化权益将在宽限期结束后暂停。"
        />
      ) : null}
      <OpsState state={state} label="订阅与额度" onRetry={retry}>
        <OpsFilterBar
          query={list.query}
          onQuery={list.setQuery}
          placeholder="搜索工作空间、订单号或关联记录"
          filters={
            tab === "subscriptions"
              ? [
                  {
                    label: "套餐",
                    options: ["试用", "基础版", "专业版"],
                    value: filters.plan || "",
                    onChange: (value) =>
                      setFilters((current) => ({ ...current, plan: value })),
                  },
                  {
                    label: "订阅状态",
                    options: ["正常", "即将到期", "支付异常", "已到期"],
                    value: filters.status || "",
                    onChange: (value) =>
                      setFilters((current) => ({ ...current, status: value })),
                  },
                ]
              : tab === "orders"
                ? [
                    {
                      label: "支付状态",
                      options: ["已支付", "扣款失败", "已退款"],
                      value: filters.orderStatus || "",
                      onChange: (value) =>
                        setFilters((current) => ({
                          ...current,
                          orderStatus: value,
                        })),
                    },
                    {
                      label: "支付方式",
                      options: ["支付宝", "微信支付"],
                      value: filters.method || "",
                      onChange: (value) =>
                        setFilters((current) => ({
                          ...current,
                          method: value,
                        })),
                    },
                  ]
                : [
                    {
                      label: "权益类型",
                      options: ["任务额度", "试用期限", "并发上限", "存储额度"],
                      value: filters.type || "",
                      onChange: (value) =>
                        setFilters((current) => ({ ...current, type: value })),
                    },
                  ]
          }
        />
        <OpsTable
          columns={
            tab === "subscriptions"
              ? subscriptionColumns
              : tab === "orders"
                ? orderColumns
                : changeColumns
          }
          rows={list.visible}
          onRow={tab === "subscriptions" ? setSelected : undefined}
        />
        <OpsPagination
          page={list.page}
          pages={list.pages}
          onChange={list.setPage}
          total={list.filtered.length}
        />
      </OpsState>
      <AdjustmentModal
        subscription={selected}
        close={() => setSelected(null)}
      />
    </div>
  );
}
