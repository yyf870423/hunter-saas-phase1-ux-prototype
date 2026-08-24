import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Drawer } from "../stage1/ui";

export const settingSections = [
  {
    id: "profile",
    label: "个人资料",
    description: "账户、工作空间与登录安全",
    icon: "user",
    route: "/settings/profile",
  },
  {
    id: "notifications",
    label: "通知",
    description: "站内和邮件提醒",
    icon: "bell",
    route: "/settings/notifications",
  },
  {
    id: "automation",
    label: "自动化授权",
    description: "新工作的默认执行边界",
    icon: "activity",
    route: "/settings/automation",
  },
  {
    id: "connections",
    label: "连接",
    description: "发件邮箱和寻访 App 设备",
    icon: "link",
    route: "/settings/connections",
  },
  {
    id: "subscription",
    label: "订阅与用量",
    description: "套餐、额度、支付与订单",
    icon: "creditCard",
    route: "/settings/subscription",
  },
  {
    id: "data-privacy",
    label: "数据与隐私",
    description: "导出、恢复和账号删除",
    icon: "shield",
    route: "/settings/data-privacy",
  },
];

export function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = useMemo(
    () =>
      settingSections.find((item) => location.pathname.endsWith(item.id)) ||
      settingSections[0],
    [location.pathname],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  const choose = (item) => {
    setMobileOpen(false);
    navigate(item.route);
  };

  return (
    <div className="s5-settings-shell">
      <header className="s5-settings-titlebar">
        <div>
          <small>个人工作空间</small>
          <h1>设置</h1>
        </div>
        <button
          type="button"
          className="s5-mobile-section-trigger"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <i>
            <Icon name={active.icon} />
          </i>
          <span>
            <b>{active.label}</b>
            <small>{active.description}</small>
          </span>
          <Icon name="chevronDown" />
        </button>
      </header>

      <div className="s5-settings-grid">
        <aside className="s5-settings-navigation" aria-label="设置导航">
          {settingSections.map((item) => (
            <button
              type="button"
              key={item.id}
              className={active.id === item.id ? "is-active" : ""}
              onClick={() => choose(item)}
            >
              <Icon name={item.icon} />
              <span>
                <b>{item.label}</b>
                <small>{item.description}</small>
              </span>
              <Icon name="chevronRight" />
            </button>
          ))}
        </aside>
        <article className="s5-settings-content">
          <Outlet />
        </article>
      </div>

      <Drawer
        open={mobileOpen}
        close={() => setMobileOpen(false)}
        side="bottom"
        title="设置"
      >
        <div className="s5-mobile-settings-list">
          {settingSections.map((item) => (
            <button
              type="button"
              key={item.id}
              className={active.id === item.id ? "is-active" : ""}
              onClick={() => choose(item)}
            >
              <i>
                <Icon name={item.icon} />
              </i>
              <span>
                <b>{item.label}</b>
                <small>{item.description}</small>
              </span>
              {active.id === item.id ? <Icon name="check" /> : null}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
