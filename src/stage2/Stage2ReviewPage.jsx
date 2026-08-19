import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../stage1/ui";

const reviewLinks = [
  [
    "业务主线渐进演示",
    "/workstreams/position-vla",
    "从第一条用户输入开始，逐步出现回复、计划、任务、结果和审核",
  ],
  ["新建业务主线", "/workstreams/new", "自然语言输入、附件和三种授权模式"],
  ["支线任务列表", "/tasks", "独立任务分类、搜索、分页、详情和删除"],
  [
    "支线任务详情",
    "/tasks/task-hand-team",
    "等待用户、补充信息、恢复和结果回流",
  ],
  ["新建支线任务", "/tasks/new", "有限目标和明确交付的自然语言创建"],
  ["信号中心", "/signals", "合并来源、观察、忽略、失效和转化"],
  [
    "加载状态",
    "/workstreams/position-vla?state=loading",
    "工作区骨架保持稳定，不出现布局跳动",
  ],
  [
    "流式失败",
    "/workstreams/position-vla?state=stream-error",
    "保留已生成内容并从当前检查点继续",
  ],
  [
    "权限受限",
    "/workstreams/position-vla?state=limited",
    "单个平台失效只暂停受影响任务",
  ],
  ["阶段一工作台", "/home", "已审批并冻结的全局框架与工作台"],
];

export function Stage2ReviewPage() {
  return (
    <main className="s1-review-page" data-theme="light">
      <header className="s1-review-hero">
        <span className="s1-review-brand">
          <i>
            <Icon name="sparkles" />
          </i>
          Hunter SaaS
        </span>
        <StatusBadge tone="info">阶段二待审批</StatusBadge>
        <h1>自动化通用交互框架</h1>
        <p>
          本轮只审批业务主线、支线任务和信号中心的通用交互。四类业务主线的完整业务剧本、正式业务资产和运营端仍属于后续阶段。
        </p>
        <Link className="s1-review-primary" to="/workstreams/position-vla">
          进入渐进式业务主线演示
          <Icon name="chevronRight" />
        </Link>
      </header>
      <section className="s1-review-section">
        <div>
          <small>01</small>
          <h2>页面入口</h2>
          <p>建议先观察渐进式主线，再检查大型审核、独立支线和信号转化。</p>
        </div>
        <div className="s1-review-links">
          {reviewLinks.map(([title, route, description]) => (
            <Link to={route} key={title}>
              <span>
                <b>{title}</b>
                <small>{description}</small>
              </span>
              <Icon name="chevronRight" />
            </Link>
          ))}
        </div>
      </section>
      <section className="s1-review-section">
        <div>
          <small>02</small>
          <h2>本轮审批重点</h2>
          <p>验证统一机制是否足以承载后续不同 Agent 场景。</p>
        </div>
        <div className="s1-review-boundary">
          <article>
            <Icon name="check" />
            <b>对象边界</b>
            <p>
              业务主线、内部任务、独立支线和信号在页面位置、状态与去向上是否容易区分。
            </p>
          </article>
          <article>
            <Icon name="task" />
            <b>结果层级</b>
            <p>
              少量结果内联、中量检查区和大量审核工作区是否支持完整业务判断。
            </p>
          </article>
          <article>
            <Icon name="message" />
            <b>交互一致性</b>
            <p>
              自然语言、结构化审核、授权模式和恢复机制是否使用同一业务语义。
            </p>
          </article>
          <article>
            <Icon name="warning" />
            <b>异常边界</b>
            <p>等待、暂停、失败、终止、删除和信号失效是否不会混为同一状态。</p>
          </article>
        </div>
      </section>
      <section className="s1-review-section">
        <div>
          <small>03</small>
          <h2>阶段边界</h2>
          <p>本轮不使用有限示例替代完整业务设计。</p>
        </div>
        <div className="s1-review-viewports">
          <span>
            <b>本轮包含</b>通用工作区、计划、任务、结果、审核、授权和信号处理
          </span>
          <span>
            <b>阶段三</b>客户开发、岗位招聘、人才摸排、候选人求职完整剧本
          </span>
          <span>
            <b>后续阶段</b>八类正式业务资产、设置、运营端与全量串联
          </span>
        </div>
      </section>
    </main>
  );
}
