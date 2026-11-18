import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../stage1/ui";
import { taskDesignScenarios, taskScenarioSteps } from "./task-design-scenarios";

const reviewLinks = taskDesignScenarios.map(([id, title, route]) => [title, route, taskScenarioSteps[id] || "直接打开检查；示例资料与状态不代表真实执行。"]);

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
        <StatusBadge tone="info">全场景原型待检查</StatusBadge>
        <h1>垂类 Agent 任务模型</h1>
        <p>
          【原型说明，正式实现不展示】本地虚构数据与有限意图模拟，尚未部署；覆盖原详细设计的任务入口、四类业务、独立核验/摘要/报告、周期和异常状态，不代表真实Agent或业务接口已经接通。
        </p>
        <Link className="s1-review-primary" to="/tasks/position-vla" target="_blank" rel="noopener noreferrer">
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
            <Link to={route} key={title} target="_blank" rel="noopener noreferrer">
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
              结果用于阅读、比较和证据核对，原对话明确对象、范围与本版要求，不强制勾选和提交。
            </p>
          </article>
          <article>
            <Icon name="message" />
            <b>交互一致性</b>
            <p>
              自然语言、必要确认、授权与失败恢复共用业务规则；独立资产页手工操作保留。
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
            客户开发、岗位招聘、公司组织梳理、候选人求职使用同一任务交互
          </span>
          <span>
            <b>资产边界</b>资产 AI 不创建独立任务，运行状态保留在对应资产中
          </span>
        </div>
      </section>
    </main>
  );
}
