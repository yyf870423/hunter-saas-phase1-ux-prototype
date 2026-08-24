import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";

const groups = [
  {
    title: "运营概况",
    description: "趋势、风险、任务处理和用户商业事项。",
    links: [
      ["正常状态", "/ops/overview"],
      ["部分数据失败", "/ops/overview?state=partial-error"],
      ["加载状态", "/ops/overview?state=loading"],
      ["整体错误", "/ops/overview?state=error"],
    ],
  },
  {
    title: "用户与工作空间",
    description: "工作空间、账号和试用申请审批。",
    links: [
      ["工作空间列表", "/ops/users-workspaces"],
      ["工作空间详情", "/ops/users-workspaces?workspace=ws-blue"],
      ["用户账号", "/ops/users-workspaces?tab=users"],
      ["试用申请", "/ops/users-workspaces?tab=trials"],
      ["空状态", "/ops/users-workspaces?tab=trials&state=empty"],
      ["加载状态", "/ops/users-workspaces?state=loading"],
    ],
  },
  {
    title: "订阅与额度",
    description: "订阅工作空间、支付订单和权益调整。",
    links: [
      ["订阅工作空间", "/ops/subscriptions"],
      ["支付异常", "/ops/subscriptions?tab=orders&status=failed"],
      ["权益调整记录", "/ops/subscriptions?tab=adjustments"],
      ["错误状态", "/ops/subscriptions?state=error"],
    ],
  },
  {
    title: "任务与故障",
    description: "脱敏任务、错误聚合和受控恢复。",
    links: [
      ["任务运行", "/ops/tasks"],
      ["错误中心", "/ops/tasks?tab=errors"],
      ["可安全恢复任务", "/ops/tasks/TASK-260824-019"],
      ["不可安全恢复任务", "/ops/tasks/TASK-260824-018"],
      ["任务详情加载", "/ops/tasks/TASK-260824-019?state=loading"],
    ],
  },
  {
    title: "系统能力",
    description: "能力健康、降级、配置验证和权限差异。",
    links: [
      ["服务健康", "/ops/capabilities"],
      ["降级能力详情", "/ops/capabilities?capability=cap-search"],
      ["能力配置", "/ops/capabilities?tab=configuration"],
      ["权限受限", "/ops/capabilities?tab=configuration&state=limited"],
      ["服务错误", "/ops/capabilities?state=error"],
    ],
  },
  {
    title: "支持与审计",
    description: "支持记录、诊断包、审计和安全事件。",
    links: [
      ["支持记录", "/ops/support"],
      ["诊断包", "/ops/support?tab=diagnostics"],
      ["操作审计", "/ops/support?tab=audit"],
      ["安全事件", "/ops/support?tab=security"],
      ["支持空状态", "/ops/support?state=empty"],
    ],
  },
];

export function OperationsReviewPage() {
  return (
    <main className="ops-review">
      <header>
        <span>Hunter SaaS 阶段一</span>
        <h1>运营端 UX 原型验收</h1>
        <p>
          运营端与用户产品完全分离；只展示运营元数据、脱敏任务上下文和用户主动提交的诊断信息。
        </p>
        <div>
          <b>设计方向</b>
          <span>WorkBuddy × Vercel AI</span>
          <b>角色</b>
          <span>运营人员 / 系统管理员</span>
          <b>模块</b>
          <span>6 个</span>
        </div>
      </header>
      <section className="ops-review-boundary">
        <Icon name="shield" />
        <div>
          <b>隐私与操作边界</b>
          <p>
            原型不展示候选人、岗位、公司业务资料、对话、提示词、业务输入或 Agent
            输出。运营人员只能执行系统明确判定安全的技术恢复，不能代替用户完成业务判断。
          </p>
        </div>
      </section>
      <div className="ops-review-grid">
        {groups.map((group, index) => (
          <section key={group.title}>
            <header>
              <i>{String(index + 1).padStart(2, "0")}</i>
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
            </header>
            <div>
              {group.links.map(([label, to]) => (
                <Link key={`${label}-${to}`} to={to}>
                  <span>{label}</span>
                  <Icon name="external" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
