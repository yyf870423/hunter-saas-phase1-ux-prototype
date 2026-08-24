import { useMemo, useState } from "react";
import { Button, Drawer, IconButton, Modal, useToast } from "../stage1/ui";
import { FormField, SelectMenu, TextArea, TextInput } from "../stage4/asset-ui";
import {
  modelBackends,
  modelCapacityPolicy,
  modelConfigVersions,
  modelRoutes,
} from "./operations-data";
import {
  OpsDefinitionList,
  OpsInlineState,
  OpsSection,
  OpsStatus,
  OpsTable,
  OpsTabs,
} from "./operations-ui";

const backendColumns = [
  {
    key: "name",
    label: "模型后端",
    width: 220,
    render: (row) => (
      <span className="ops-primary-cell">
        <b>{row.name}</b>
        <small>{row.id}</small>
      </span>
    ),
  },
  { key: "provider", label: "厂商", width: 130 },
  { key: "models", label: "模型", width: 270 },
  { key: "keys", label: "健康密钥", width: 110 },
  { key: "concurrency", label: "并发上限", width: 105 },
  {
    key: "weight",
    label: "流量权重",
    width: 100,
    render: (row) => `${row.weight}%`,
  },
  { key: "latency", label: "P95 延迟", width: 105 },
  {
    key: "status",
    label: "状态",
    width: 110,
    render: (row) => <OpsStatus>{row.status}</OpsStatus>,
  },
];

const routeColumns = [
  { key: "task", label: "任务类型", width: 190 },
  { key: "primary", label: "主资源池", width: 220 },
  { key: "fallback", label: "备用资源池顺序", width: 340 },
  { key: "policy", label: "分配策略", width: 180 },
  { key: "retries", label: "最大重试", width: 100 },
  {
    key: "status",
    label: "状态",
    width: 110,
    render: (row) => <OpsStatus>{row.status}</OpsStatus>,
  },
];

function BackendDrawer({ backend, close, onEdit }) {
  if (!backend) return null;
  const keys = Array.from({ length: backend.totalKeys }, (_, index) => ({
    id: `${backend.id}-key-${index + 1}`,
    label: `密钥 ${index + 1}`,
    masked: `sk-••••••••${["d81f", "72ac", "19f2", "88e1", "a10c", "f42b"][index] || "c903"}`,
    status: index < backend.healthyKeys ? "正常" : "认证异常",
  }));
  return (
    <Drawer
      open
      close={close}
      title={backend.name}
      className="ops-detail-drawer ops-model-drawer"
    >
      <div className="ops-detail-stack">
        <div className="ops-detail-heading">
          <span>
            <small>{backend.id}</small>
            <h2>{backend.name}</h2>
          </span>
          <OpsStatus>{backend.status}</OpsStatus>
        </div>
        <div className="ops-model-health-strip">
          <span>
            <b>{backend.keys}</b>
            <small>健康密钥</small>
          </span>
          <span>
            <b>{backend.concurrency}</b>
            <small>并发上限</small>
          </span>
          <span>
            <b>{backend.rpm}</b>
            <small>每分钟请求</small>
          </span>
          <span>
            <b>{backend.latency}</b>
            <small>P95 延迟</small>
          </span>
        </div>
        <OpsSection title="接入信息">
          <OpsDefinitionList
            items={[
              ["模型厂商", backend.provider],
              ["服务地址", backend.endpoint],
              ["可用模型", backend.models],
              ["部署区域", backend.region],
              ["流量权重", `${backend.weight}%`],
              ["调度优先级", backend.priority],
            ]}
          />
        </OpsSection>
        <OpsSection
          title="密钥池"
          description="密钥独立健康检查，异常密钥自动退出分流。"
        >
          <div className="ops-model-key-list">
            {keys.map((key) => (
              <div key={key.id}>
                <span>
                  <b>{key.label}</b>
                  <small>{key.masked}</small>
                </span>
                <OpsStatus>{key.status}</OpsStatus>
              </div>
            ))}
          </div>
        </OpsSection>
        <div className="ops-drawer-actions">
          <Button tone="primary" onClick={() => onEdit(backend)}>
            编辑模型后端
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

function BackendModal({ backend, close }) {
  const notify = useToast();
  const [provider, setProvider] = useState(backend?.provider || "DeepSeek");
  const [name, setName] = useState(backend?.name || "");
  const [endpoint, setEndpoint] = useState(backend?.endpoint || "");
  const [models, setModels] = useState(backend?.models || "");
  const [keys, setKeys] = useState(backend ? "" : "");
  const [concurrency, setConcurrency] = useState(
    String(backend?.concurrency || 80),
  );
  const [rpm, setRpm] = useState(backend?.rpm || "4,000");
  const [weight, setWeight] = useState(String(backend?.weight || 10));
  const [region, setRegion] = useState(backend?.region || "中国大陆");
  const [stage, setStage] = useState("edit");
  const valid =
    name.trim() &&
    endpoint.trim() &&
    models.trim() &&
    concurrency.trim() &&
    weight.trim() &&
    region.trim() &&
    (backend || keys.trim());
  const validate = () => {
    setStage("validating");
    window.setTimeout(
      () => setStage(endpoint.includes("invalid") ? "failed" : "passed"),
      700,
    );
  };
  const save = () => {
    notify(backend ? "模型后端已更新并生成新配置版本" : "模型后端已加入资源池");
    close();
  };
  return (
    <Modal
      open
      close={close}
      title={backend ? "编辑模型后端" : "新增模型后端"}
      description="配置厂商端点、模型、密钥池与分流容量"
      size="xl"
      closeDisabled={stage === "validating"}
      footer={
        <>
          <Button onClick={close} disabled={stage === "validating"}>
            取消
          </Button>
          {stage === "passed" ? (
            <Button tone="primary" onClick={save}>
              确认保存并生效
            </Button>
          ) : (
            <Button
              tone="primary"
              loading={stage === "validating"}
              disabled={!valid}
              onClick={validate}
            >
              验证配置
            </Button>
          )}
        </>
      }
    >
      <div className="ops-model-form-layout">
        <section>
          <h3>后端资源</h3>
          <div className="ops-form-grid">
            <FormField label="模型厂商" required>
              <SelectMenu
                label="模型厂商"
                value={provider}
                onChange={setProvider}
                options={[
                  "DeepSeek",
                  "阿里云百炼",
                  "OpenAI",
                  "自建推理服务",
                  "其他兼容接口",
                ]}
              />
            </FormField>
            <FormField label="资源池名称" required>
              <TextInput
                value={name}
                onChange={setName}
                placeholder="例如：DeepSeek 主资源池"
              />
            </FormField>
            <FormField label="Base URL" required span={2}>
              <TextInput
                value={endpoint}
                onChange={setEndpoint}
                placeholder="https://api.example.com/v1"
              />
            </FormField>
            <FormField
              label="可用模型"
              required
              span={2}
              help="多个模型使用中文顿号分隔"
            >
              <TextInput
                value={models}
                onChange={setModels}
                placeholder="模型 A、模型 B"
              />
            </FormField>
            <FormField
              label="新增密钥"
              required={!backend}
              span={2}
              help={
                backend
                  ? "留空保留现有密钥；每行一个密钥"
                  : "每行一个密钥，可一次添加多把"
              }
            >
              <TextArea value={keys} onChange={setKeys} placeholder="sk-..." />
            </FormField>
            <FormField label="并发上限" required>
              <TextInput value={concurrency} onChange={setConcurrency} />
            </FormField>
            <FormField label="每分钟请求" required>
              <TextInput value={rpm} onChange={setRpm} />
            </FormField>
            <FormField label="流量权重" required>
              <TextInput value={weight} onChange={setWeight} />
            </FormField>
            <FormField label="部署区域">
              <TextInput value={region} onChange={setRegion} />
            </FormField>
          </div>
        </section>
        <section>
          <h3>验证结果</h3>
          {stage === "edit" ? (
            <OpsInlineState
              tone="info"
              icon="shield"
              title="保存前必须完成验证"
              description="系统会检查端点连通性、模型权限、每把密钥和并发边界；验证期间当前配置继续生效。"
            />
          ) : stage === "validating" ? (
            <div className="ops-validation-progress">
              <span className="s1-spinner" />
              <b>正在并行验证端点、模型和密钥池…</b>
              <small>不会切换线上流量</small>
            </div>
          ) : stage === "failed" ? (
            <OpsInlineState
              tone="danger"
              icon="warning"
              title="配置验证失败"
              description="端点无法连接，草稿未生效，当前资源池保持不变。"
            />
          ) : (
            <>
              <OpsInlineState
                tone="success"
                icon="check"
                title="配置验证通过"
                description="端点、模型权限和密钥池均可用，可以保存并加入分流。"
              />
              <div className="ops-validation-list">
                <span className="is-success">端点连接正常</span>
                <span className="is-success">模型权限可用</span>
                <span className="is-success">密钥池健康检查通过</span>
              </div>
            </>
          )}
        </section>
      </div>
    </Modal>
  );
}

function RouteModal({ route, close }) {
  const notify = useToast();
  const [primary, setPrimary] = useState(route.primary);
  const [fallbacks, setFallbacks] = useState(
    route.fallback.split("→").map((item) => item.trim()),
  );
  const [fallbackChoice, setFallbackChoice] = useState("");
  const [policy, setPolicy] = useState(route.policy);
  const moveFallback = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= fallbacks.length) return;
    setFallbacks((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const fallbackOptions = [
    ...modelBackends.map((item) => item.name),
    "人工处理队列",
  ].filter((item) => item !== primary && !fallbacks.includes(item));
  return (
    <Modal
      open
      close={close}
      title="编辑任务模型分配"
      description={route.task}
      size="lg"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            onClick={() => {
              notify("任务路由已保存为配置草稿");
              close();
            }}
          >
            保存路由草稿
          </Button>
        </>
      }
    >
      <div className="ops-form-grid">
        <FormField label="主资源池" required span={2}>
          <SelectMenu
            label="主资源池"
            value={primary}
            onChange={(value) => {
              setPrimary(value);
              setFallbacks((current) =>
                current.filter((item) => item !== value),
              );
            }}
            options={modelBackends.map((item) => item.name)}
          />
        </FormField>
        <FormField
          label="备用资源池顺序"
          required
          span={2}
          help="主资源池不可用时，系统从上到下依次尝试"
        >
          <div className="ops-fallback-editor">
            <div className="ops-fallback-list">
              {fallbacks.map((item, index) => (
                <div key={item}>
                  <i>{index + 1}</i>
                  <span>{item}</span>
                  <IconButton
                    icon="chevronUp"
                    label={`上移 ${item}`}
                    disabled={index === 0}
                    onClick={() => moveFallback(index, -1)}
                  />
                  <IconButton
                    icon="chevronDown"
                    label={`下移 ${item}`}
                    disabled={index === fallbacks.length - 1}
                    onClick={() => moveFallback(index, 1)}
                  />
                  <IconButton
                    icon="close"
                    label={`移除 ${item}`}
                    onClick={() =>
                      setFallbacks((current) =>
                        current.filter((value) => value !== item),
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <div className="ops-fallback-add">
              <SelectMenu
                label="选择备用资源池"
                value={fallbackChoice}
                onChange={setFallbackChoice}
                options={fallbackOptions}
              />
              <Button
                icon="plus"
                disabled={!fallbackChoice}
                onClick={() => {
                  setFallbacks((current) => [...current, fallbackChoice]);
                  setFallbackChoice("");
                }}
              >
                添加备用
              </Button>
            </div>
          </div>
        </FormField>
        <FormField label="分配策略" required span={2}>
          <SelectMenu
            label="分配策略"
            value={policy}
            onChange={setPolicy}
            options={[
              "最少并发 + 延迟权重",
              "加权轮询",
              "质量优先",
              "固定资源池",
            ]}
          />
        </FormField>
      </div>
    </Modal>
  );
}

export function ModelConfigurationPanel() {
  const [tab, setTab] = useState("backends");
  const [selectedBackend, setSelectedBackend] = useState(null);
  const [editingBackend, setEditingBackend] = useState(null);
  const [creatingBackend, setCreatingBackend] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const totalConcurrency = useMemo(
    () => modelBackends.reduce((sum, item) => sum + item.concurrency, 0),
    [],
  );
  return (
    <section className="ops-model-config">
      <div className="ops-model-config-header">
        <span>
          <small>企业模型网关</small>
          <h2>模型后端与流量调度</h2>
          <p>
            统一管理多厂商、多端点和多密钥资源池，并按任务类型分流、限流和降级。
          </p>
        </span>
        {tab === "backends" ? (
          <Button
            tone="primary"
            icon="plus"
            onClick={() => setCreatingBackend(true)}
          >
            新增模型后端
          </Button>
        ) : null}
      </div>
      <div className="ops-model-summary">
        <span>
          <b>4</b>
          <small>模型资源池</small>
        </span>
        <span>
          <b>3</b>
          <small>接入厂商</small>
        </span>
        <span>
          <b>14 / 15</b>
          <small>健康密钥</small>
        </span>
        <span>
          <b>{totalConcurrency}</b>
          <small>总并发上限</small>
        </span>
      </div>
      <OpsTabs
        value={tab}
        onChange={setTab}
        label="模型配置范围"
        items={[
          { value: "backends", label: "模型后端", count: modelBackends.length },
          {
            value: "routes",
            label: "任务模型分配",
            count: modelRoutes.length,
          },
          { value: "capacity", label: "容量与成本限制" },
          {
            value: "versions",
            label: "配置版本",
            count: modelConfigVersions.length,
          },
        ]}
      />
      {tab === "backends" ? (
        <OpsTable
          columns={backendColumns}
          rows={modelBackends}
          onRow={setSelectedBackend}
        />
      ) : null}
      {tab === "routes" ? (
        <>
          <OpsInlineState
            tone="info"
            icon="info"
            title="为不同任务选择主模型与备用顺序"
            description="例如深度调研优先使用 DeepSeek；主资源池不可用时，再按配置顺序切换备用资源池。"
          />
          <OpsTable
            columns={routeColumns}
            rows={modelRoutes}
            onRow={setEditingRoute}
          />
        </>
      ) : null}
      {tab === "capacity" ? (
        <>
          <OpsInlineState
            tone="info"
            icon="info"
            title="限制平台同时调用量与成本风险"
            description="控制平台和单个工作空间可以同时运行多少模型请求，并在密钥异常或预算达到阈值时自动降载。"
          />
          <div className="ops-model-policy-grid">
            {[
              [
                "平台总并发",
                modelCapacityPolicy.globalConcurrency,
                "所有模型资源池的有效并发上限",
              ],
              [
                "单工作空间并发",
                modelCapacityPolicy.workspaceConcurrency,
                "防止单一工作空间挤占平台容量",
              ],
              [
                "负载均衡",
                modelCapacityPolicy.balancing,
                "在健康资源池之间分配请求",
              ],
              [
                "异常密钥冷却",
                modelCapacityPolicy.keyCooldown,
                "冷却后自动重新健康检查",
              ],
              [
                "失败摘除阈值",
                modelCapacityPolicy.failureThreshold,
                "达到阈值后退出分流",
              ],
              [
                "预算预警 / 停止",
                `${modelCapacityPolicy.budgetWarning} / ${modelCapacityPolicy.budgetStop}`,
                "达到阈值时通知或停止非必要任务",
              ],
            ].map(([label, value, note]) => (
              <article key={label}>
                <small>{label}</small>
                <b>{value}</b>
                <p>{note}</p>
              </article>
            ))}
          </div>
        </>
      ) : null}
      {tab === "versions" ? (
        <OpsTable
          columns={[
            { key: "version", label: "版本", width: 110 },
            {
              key: "status",
              label: "状态",
              width: 120,
              render: (row) => <OpsStatus>{row.status}</OpsStatus>,
            },
            { key: "summary", label: "变更概要", width: 420 },
            { key: "changedBy", label: "操作人", width: 120 },
            { key: "changedAt", label: "生效时间", width: 140 },
          ]}
          rows={modelConfigVersions}
        />
      ) : null}
      <BackendDrawer
        backend={selectedBackend}
        close={() => setSelectedBackend(null)}
        onEdit={(backend) => {
          setSelectedBackend(null);
          setEditingBackend(backend);
        }}
      />
      {creatingBackend || editingBackend ? (
        <BackendModal
          backend={editingBackend}
          close={() => {
            setCreatingBackend(false);
            setEditingBackend(null);
          }}
        />
      ) : null}
      {editingRoute ? (
        <RouteModal route={editingRoute} close={() => setEditingRoute(null)} />
      ) : null}
    </section>
  );
}
