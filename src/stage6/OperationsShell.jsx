import { createContext, useContext, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Drawer, IconButton, Modal, StatusBadge } from "../stage1/ui";
import {
  errorGroups,
  operationsNav,
  riskItems,
  tasks,
  workspaces,
} from "./operations-data";

const OpsRoleContext = createContext({ role: "admin", setRole: () => {} });
export const useOpsRole = () => useContext(OpsRoleContext);

function OpsBrand({ expanded }) {
  return (
    <span className="ops-brand">
      <i>
        <Icon name="shield" />
      </i>
      {expanded ? (
        <span>
          <b>Hunter Ops</b>
          <small>运营与系统管理</small>
        </span>
      ) : null}
    </span>
  );
}

function OpsGlobalSearch({ open, close }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const all = [
      ...workspaces.map((item) => ({
        title: item.name,
        meta: `${item.workspaceNo} · ${item.owner}`,
        icon: "building",
        route: `/ops/users-workspaces?workspace=${item.id}`,
      })),
      ...tasks.map((item) => ({
        title: item.id,
        meta: `${item.workspace} · ${item.type} · ${item.status}`,
        icon: "activity",
        route: `/ops/tasks/${item.id}`,
      })),
      ...errorGroups.map((item) => ({
        title: item.code,
        meta: `${item.title} · ${item.count} 次`,
        icon: "warning",
        route: `/ops/tasks?tab=errors&error=${item.id}`,
      })),
    ];
    const normalized = query.trim().toLowerCase();
    return (
      normalized
        ? all.filter((item) =>
            `${item.title} ${item.meta}`.toLowerCase().includes(normalized),
          )
        : all.slice(0, 6)
    ).slice(0, 8);
  }, [query]);
  return (
    <Modal
      open={open}
      close={close}
      title="运营搜索"
      description="搜索工作空间编号、登录手机号、联系邮箱、任务编号或错误码"
      size="lg"
    >
      <div className="ops-global-search">
        <label>
          <Icon name="search" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入工作空间、邮箱、任务编号或错误码"
          />
          {query ? (
            <button
              type="button"
              aria-label="清空搜索"
              onClick={() => setQuery("")}
            >
              <Icon name="close" />
            </button>
          ) : null}
        </label>
        <small>{query ? `找到 ${items.length} 项` : "最近需要处理"}</small>
        <div>
          {items.map((item) => (
            <button
              type="button"
              key={`${item.title}-${item.route}`}
              onClick={() => {
                navigate(item.route);
                close();
              }}
            >
              <i>
                <Icon name={item.icon} />
              </i>
              <span>
                <b>{item.title}</b>
                <small>{item.meta}</small>
              </span>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function AlertsDrawer({ open, close }) {
  const navigate = useNavigate();
  return (
    <Drawer open={open} close={close} title="系统告警">
      <div className="ops-alert-list">
        {riskItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              navigate(item.route);
              close();
            }}
          >
            <i className={`is-${item.tone}`}>
              <Icon name={item.icon} />
            </i>
            <span>
              <b>{item.title}</b>
              <small>{item.meta}</small>
            </span>
            <Icon name="chevronRight" />
          </button>
        ))}
      </div>
    </Drawer>
  );
}

export function OperationsShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [role, setRole] = useState("admin");
  const active = operationsNav.find((item) =>
    location.pathname.startsWith(item.to),
  );
  const roleLabel = role === "admin" ? "系统管理员" : "运营人员";
  const nav = (
    <>
      <button
        type="button"
        className="ops-sidebar-brand"
        aria-label="返回运营概况"
        onClick={() => {
          navigate("/ops/overview");
          setMobileOpen(false);
        }}
      >
        <OpsBrand expanded={expanded} />
      </button>
      <nav aria-label="运营端导航">
        {operationsNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "is-active" : "")}
            title={!expanded ? item.label : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <Icon name={item.icon} />
            {expanded ? <span>{item.label}</span> : null}
            {item.badge ? <em>{item.badge}</em> : null}
          </NavLink>
        ))}
      </nav>
      <div className="ops-sidebar-foot">
        <button
          type="button"
          className="ops-account"
          aria-label="打开运营账户菜单"
          onClick={() => setAccountOpen((value) => !value)}
        >
          <i>CY</i>
          {expanded ? (
            <span>
              <b>程远</b>
              <small>{roleLabel}</small>
            </span>
          ) : null}
          {expanded ? <Icon name="chevronUp" /> : null}
        </button>
        {accountOpen ? (
          <div className="ops-account-menu" role="menu">
            <header>
              <b>程远</b>
              <small>chengyuan@hunter.cn</small>
            </header>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setRole("admin");
                setAccountOpen(false);
              }}
            >
              <Icon name="shield" />
              系统管理员演示{role === "admin" ? <Icon name="check" /> : null}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setRole("operator");
                setAccountOpen(false);
              }}
            >
              <Icon name="user" />
              运营人员演示{role === "operator" ? <Icon name="check" /> : null}
            </button>
            <p>角色切换仅用于原型验收，正式产品由管理员分配。</p>
          </div>
        ) : null}
        <button
          type="button"
          className="ops-sidebar-toggle"
          aria-label={expanded ? "收起运营导航" : "展开运营导航"}
          onClick={() => setExpanded((value) => !value)}
        >
          <Icon name={expanded ? "panelLeft" : "panelRight"} />
          {expanded ? <span>收起导航</span> : null}
        </button>
      </div>
    </>
  );
  return (
    <OpsRoleContext.Provider value={{ role, setRole }}>
      <div className={`ops-app ${expanded ? "nav-expanded" : "nav-collapsed"}`}>
        <aside className="ops-sidebar">{nav}</aside>
        {mobileOpen ? (
          <div
            className="ops-mobile-overlay"
            onClick={() => setMobileOpen(false)}
          >
            <aside onClick={(event) => event.stopPropagation()}>{nav}</aside>
          </div>
        ) : null}
        <header className="ops-topbar">
          <IconButton
            icon="menu"
            label="打开运营导航"
            className="ops-mobile-menu"
            onClick={() => setMobileOpen(true)}
          />
          <div className="ops-topbar-title">
            <small>运营端</small>
            <b>{active?.label || "Hunter Ops"}</b>
          </div>
          <button
            type="button"
            className="ops-topbar-search"
            onClick={() => setSearchOpen(true)}
          >
            <Icon name="search" />
            <span>搜索工作空间、任务或错误码</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="ops-topbar-actions">
            <StatusBadge tone="success">生产环境</StatusBadge>
            <IconButton
              icon="bell"
              label="查看系统告警"
              badge={riskItems.length}
              onClick={() => setAlertsOpen(true)}
            />
            <span className="ops-current-role">
              <Icon name="shield" />
              {roleLabel}
            </span>
          </div>
        </header>
        <main className="ops-main">
          <Outlet />
        </main>
        <OpsGlobalSearch open={searchOpen} close={() => setSearchOpen(false)} />
        <AlertsDrawer open={alertsOpen} close={() => setAlertsOpen(false)} />
      </div>
    </OpsRoleContext.Provider>
  );
}
