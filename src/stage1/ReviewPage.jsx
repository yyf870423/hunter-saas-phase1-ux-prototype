import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "./ui";

const stateLinks = [
  ["正常状态", "/home", "工作台完整业务层级与主要交互"],
  ["加载状态", "/home?state=loading", "局部骨架与稳定布局"],
  ["空状态", "/home?state=empty", "首次使用与新建引导"],
  ["任务为空", "/home?empty=tasks", "保留洞察和资产变化"],
  ["洞察为空", "/home?empty=insights", "保留任务和资产变化"],
  ["资产变化为空", "/home?empty=assets", "保留任务和洞察"],
  ["局部错误", "/home?state=error", "部分来源失败但其他区域可用"],
  ["来源受限", "/home?state=limited", "公开来源受限时保留已有结果"],
  ["组件状态", "/components", "本阶段公共组件与状态"],
  [
    "最大容量",
    "/components?dashboard=capacity",
    "三个摘要列表均最多呈现 10 条",
  ],
];

export function ReviewPage() {
  return (
    <main className="s1-review-page" data-theme="light">
      <header className="s1-review-hero">
        <span className="s1-review-brand">
          <i>
            <Icon name="sparkles" />
          </i>
          Hunter SaaS
        </span>
        <StatusBadge tone="info">工作台迭代待验收</StatusBadge>
        <h1>全局框架与工作台</h1>
        <p>
          【原型说明，正式实现不展示】2026-09-07
          工作台迭代：任务按处理优先级排列，默认任务 5 条、洞察 8 条、资产变化
          10 条，同时覆盖全局空和局部空状态。
        </p>
        <Link className="s1-review-primary" to="/home">
          进入工作台原型
          <Icon name="chevronRight" />
        </Link>
      </header>
      <section className="s1-review-section">
        <div>
          <small>01</small>
          <h2>验收状态</h2>
          <p>每个入口使用相同的数据关系和页面结构，只改变对应状态。</p>
        </div>
        <div className="s1-review-links">
          {stateLinks.map(([title, route, description]) => (
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
          <h2>本轮边界</h2>
          <p>避免把未审批的后续页面伪装成已完成产品。</p>
        </div>
        <div className="s1-review-boundary">
          <article>
            <Icon name="check" />
            <b>本轮包含</b>
            <p>
              任务四字段表格、洞察与资产变化双栏、三个区域最多 10
              条、全局空与局部空，以及既有导航和主题。
            </p>
          </article>
          <article>
            <Icon name="clock" />
            <b>保留既有实现</b>
            <p>
              任务、洞察和资产详情继续使用既有原型，不在工作台另建处理状态或重做业务流程。
            </p>
          </article>
        </div>
      </section>
      <section className="s1-review-section">
        <div>
          <small>03</small>
          <h2>响应式验收</h2>
          <p>推荐分别查看三个视口，所有功能保持可达。</p>
        </div>
        <div className="s1-review-viewports">
          <span>
            <b>1440 × 900</b>桌面宽屏
          </span>
          <span>
            <b>820 × 1180</b>iPad
          </span>
          <span>
            <b>390 × 844</b>iPhone
          </span>
        </div>
      </section>
    </main>
  );
}
