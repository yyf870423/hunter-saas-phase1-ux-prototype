import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../stage1/ui";

const reviewLinks = [
  [
    "任务渐进演示",
    "/tasks/position-vla",
    "从第一条用户输入开始，逐步出现回复、计划、运行、结果和审核",
  ],
  [
    "任务工作区",
    "/tasks",
    "同一入口创建任务并查看历史对话，不要求用户选择任务类型",
  ],
  ["周期性任务", "/tasks/periodic", "统一创建周期、查看配置和逐轮运行记录"],
  [
    "等待用户的周期运行",
    "/tasks/periodic?view=runs&run=run-position-waiting",
    "同一批问题集中确认后继续本轮运行",
  ],
  [
    "正在运行的周期记录",
    "/tasks/periodic?view=runs&status=正在运行",
    "在运行记录中筛选当前正在执行的周期运行",
  ],
  [
    "直接核验任务",
    "/tasks/task-hand-team",
    "等待用户、补充信息、恢复和结果回流",
  ],
  ["洞察中心", "/signals", "统一处理 Hunter 主动发现的信号与洞察"],
  [
    "推进方式判断中",
    "/new?state=classifying",
    "保留用户输入，流式说明正在判断任务范围和推进方式",
  ],
  ["目标歧义确认", "/new?state=clarify", "只追问一个会改变推进方式的关键问题"],
  [
    "直接完成",
    "/new?state=direct",
    "可立即完成的任务创建后进入统一任务对话并返回 Markdown 结果",
  ],
  [
    "创建权限受限",
    "/new?state=limited",
    "允许查看已有内容，禁用新建输入和授权操作",
  ],
  [
    "加载状态",
    "/tasks/position-vla?state=loading",
    "任务详情骨架保持稳定，不出现布局跳动",
  ],
  [
    "流式失败",
    "/tasks/position-vla?state=stream-error",
    "保留已生成内容并从当前检查点继续",
  ],
  [
    "公开来源受限",
    "/tasks/position-vla?state=limited",
    "局部公开来源受限时保留系统候选人、知识图谱和已有结果",
  ],
  [
    "用户上传简历批次",
    "/tasks/position-vla?state=resume-batch",
    "在对话中显示用户上传文件，并进入统一查重、合并和匹配流程",
  ],
  [
    "候选人合并冲突",
    "/tasks/position-vla?state=merge-conflict",
    "用户上传简历与系统候选人疑似同人时等待用户决定",
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
        <StatusBadge tone="info">统一任务模型待审批</StatusBadge>
        <h1>垂类 Agent 任务模型</h1>
        <p>
          本轮审批统一任务、周期性任务、运行记录和洞察中心的产品模型。用户不需要理解任何内部任务分类。
        </p>
        <Link className="s1-review-primary" to="/tasks/position-vla">
          进入渐进式任务演示
          <Icon name="chevronRight" />
        </Link>
      </header>
      <section className="s1-review-section">
        <div>
          <small>01</small>
          <h2>页面入口</h2>
          <p>建议先检查统一任务工作区，再查看周期运行记录和洞察处理。</p>
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
          <p>
            验证用户是否能用同一套交互创建、继续和管理不同复杂度的猎头任务。
          </p>
        </div>
        <div className="s1-review-boundary">
          <article>
            <Icon name="check" />
            <b>对象边界</b>
            <p>任务历史、周期配置、当前运行和洞察处理是否各有明确入口。</p>
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
            <p>
              运行中、等待用户、等待外部、错误、停止和删除是否不会混为同一状态。
            </p>
          </article>
        </div>
      </section>
      <section className="s1-review-section">
        <div>
          <small>03</small>
          <h2>模型边界</h2>
          <p>
            资产内 AI 继续从资产详情发起；只有用户对话创建的工作进入任务历史。
          </p>
        </div>
        <div className="s1-review-viewports">
          <span>
            <b>本轮包含</b>统一任务、周期运行记录、洞察处理和关键状态
          </span>
          <span>
            <b>业务场景</b>
            客户开发、岗位招聘、人才摸排、候选人求职使用同一任务交互
          </span>
          <span>
            <b>资产边界</b>资产 AI 不创建独立任务，运行状态保留在对应资产中
          </span>
        </div>
      </section>
    </main>
  );
}
