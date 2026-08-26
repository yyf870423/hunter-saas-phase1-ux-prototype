import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../stage1/ui";

const groups = [
  {
    number: "01",
    title: "个人与通知",
    description: "个人身份、工作空间、登录安全和通知偏好。",
    links: [
      [
        "个人资料",
        "/settings/profile",
        "分区编辑、登录身份、联系邮箱和登录会话",
      ],
      ["通知", "/settings/notifications", "站内、邮件、强制通知和摘要频率"],
      [
        "联系邮箱未验证",
        "/settings/notifications?state=limited",
        "邮件渠道禁用和恢复操作",
      ],
    ],
  },
  {
    number: "02",
    title: "自动化与连接",
    description: "新工作的默认执行边界和云端可识别的外部连接。",
    links: [
      [
        "自动化授权",
        "/settings/automation",
        "新工作统一默认授权和自动执行影响确认",
      ],
      ["连接", "/settings/connections", "个人发件邮箱和寻访 App 设备"],
      ["尚未连接", "/settings/connections?state=empty", "邮箱和设备空状态"],
      [
        "连接失败",
        "/settings/connections?state=error",
        "协议探测失败、手动设置和重新验证",
      ],
    ],
  },
  {
    number: "03",
    title: "权益与数据",
    description: "订阅、用量、支付、导出、恢复和危险操作。",
    links: [
      ["订阅与用量", "/settings/subscription", "套餐、分类用量、预警和订单"],
      [
        "从未订阅",
        "/settings/subscription?state=none",
        "未订阅权益说明和首次订阅入口",
      ],
      [
        "订阅到期",
        "/settings/subscription?state=limited",
        "付费能力受限但数据仍可访问",
      ],
      ["无订单", "/settings/subscription?state=empty", "首购前的订单空状态"],
      [
        "数据与隐私",
        "/settings/data-privacy",
        "导出、回收站、诊断包和删除工作空间",
      ],
      [
        "删除受限",
        "/settings/data-privacy?state=limited",
        "运行中的数据处理阻塞工作空间删除",
      ],
    ],
  },
  {
    number: "04",
    title: "公共状态",
    description: "设置页面必须稳定覆盖的加载和异常状态。",
    links: [
      [
        "个人资料加载中",
        "/settings/profile?state=loading",
        "页面骨架和稳定布局",
      ],
      ["个人资料读取失败", "/settings/profile?state=error", "原因、影响和重试"],
      [
        "连接读取失败",
        "/settings/connections?state=error",
        "局部错误不覆盖已有连接",
      ],
    ],
  },
];

export function SettingsReviewPage() {
  return (
    <main className="s4-review-page s5-review-page" data-theme="light">
      <header className="s4-review-hero">
        <span className="s4-review-brand">
          <i>
            <Icon name="sparkles" />
          </i>
          Hunter SaaS
        </span>
        <StatusBadge tone="info">设置中心待审批</StatusBadge>
        <h1>个人账户与订阅设置</h1>
        <p>
          设置不进入主导航，不暴露模型、API Key
          和人才平台账号。以下入口覆盖桌面与移动端的完整设置流程及异常状态。
        </p>
        <Link className="s4-review-primary" to="/settings/profile">
          从个人资料开始验收
          <Icon name="chevronRight" />
        </Link>
      </header>
      {groups.map((group) => (
        <section className="s4-review-section" key={group.number}>
          <div>
            <small>{group.number}</small>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className="s4-review-links">
            {group.links.map(([title, route, description]) => (
              <Link to={route} key={route}>
                <span>
                  <b>{title}</b>
                  <small>{description}</small>
                </span>
                <Icon name="chevronRight" />
              </Link>
            ))}
          </div>
        </section>
      ))}
      <section className="s4-review-boundary">
        <h2>验收边界</h2>
        <div>
          <article>
            <Icon name="settings" />
            <b>账户菜单入口</b>
            <p>桌面和移动端都从用户账户进入设置。</p>
          </article>
          <article>
            <Icon name="mail" />
            <b>个人邮箱连接</b>
            <p>优先自动探测协议，失败后再手动设置。</p>
          </article>
          <article>
            <Icon name="monitor" />
            <b>只管理设备</b>
            <p>人才平台登录与风控不进入云端设置。</p>
          </article>
          <article>
            <Icon name="shield" />
            <b>数据仍可带出</b>
            <p>订阅到期后业务数据仍可查看和导出。</p>
          </article>
        </div>
      </section>
    </main>
  );
}
