import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  navSections,
  notifications as initialNotifications,
  searchItems,
} from "./data";
import {
  Button,
  Drawer,
  IconButton,
  Modal,
  SearchField,
  StatusBadge,
  Tabs,
  useToast,
} from "./ui";

function UsageRing({ value = 64, expanded, onClick }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  return (
    <button
      type="button"
      className={`s1-usage-entry ${expanded ? "is-expanded" : ""}`}
      aria-label={`查看 Agent 用量，本月已使用 ${value}%`}
      title={expanded ? undefined : `本月 Agent 用量 ${value}%`}
      onClick={onClick}
    >
      <span className="s1-usage-ring">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r={radius} />
          <circle
            className="s1-usage-ring-progress"
            cx="20"
            cy="20"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
          />
        </svg>
        <b>{value}</b>
      </span>
      {expanded ? (
        <span>
          <b>Agent 用量</b>
          <small>本月已使用 {value}%</small>
        </span>
      ) : null}
    </button>
  );
}

function Brand({ expanded }) {
  return (
    <span className="s1-brand">
      <i>
        <Icon name="sparkles" />
      </i>
      {expanded ? (
        <span>
          <b>Hunter</b>
          <small>智能猎头工作空间</small>
        </span>
      ) : null}
    </span>
  );
}

function SearchDialog({ open, close }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const notify = useToast();
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected(null);
    }
  }, [open]);
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return searchItems.slice(0, 5);
    return searchItems
      .filter((item) =>
        `${item.title} ${item.meta} ${item.summary}`
          .toLowerCase()
          .includes(keyword),
      )
      .slice(0, 8);
  }, [query]);
  return (
    <Modal
      open={open}
      close={close}
      title={selected ? "搜索结果摘要" : "全局搜索"}
      description={
        selected
          ? "查看命中原因和当前业务状态"
          : "搜索业务主线、支线任务、信号和正式业务资产"
      }
      size="lg"
    >
      {selected ? (
        <article className="s1-search-preview">
          <button type="button" onClick={() => setSelected(null)}>
            <Icon name="chevronLeft" />
            返回搜索结果
          </button>
          <i>
            <Icon name={selected.icon} />
          </i>
          <StatusBadge tone="info" dot={false}>
            {selected.group}
          </StatusBadge>
          <h3>{selected.title}</h3>
          <p>{selected.summary}</p>
          <dl>
            <div>
              <dt>当前信息</dt>
              <dd>{selected.meta}</dd>
            </div>
            <div>
              <dt>来源</dt>
              <dd>Hunter 工作空间</dd>
            </div>
          </dl>
          <Button
            tone="primary"
            onClick={() => {
              notify(`已选择“${selected.title}”`, "info");
              close();
            }}
          >
            打开来源
          </Button>
        </article>
      ) : (
        <div className="s1-global-search">
          <SearchField
            autoFocus={open}
            value={query}
            onChange={setQuery}
            placeholder="输入姓名、公司、岗位或任务名称"
          />
          <div className="s1-search-label">
            {query ? `搜索结果 · ${visible.length}` : "最近访问"}
          </div>
          {visible.length ? (
            <div className="s1-search-results">
              {visible.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelected(item)}
                >
                  <i>
                    <Icon name={item.icon} />
                  </i>
                  <span>
                    <b>{item.title}</b>
                    <small>{item.meta}</small>
                  </span>
                  <em>{item.group}</em>
                  <Icon name="chevronRight" />
                </button>
              ))}
            </div>
          ) : (
            <div className="s1-search-no-result">
              <Icon name="search" />
              <b>没有找到“{query}”</b>
              <span>可以调整关键词，或从新建入口补充业务数据。</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function NotificationPanel({ open, close, items, setItems }) {
  const [tab, setTab] = useState("all");
  const notify = useToast();
  const unread = items.filter((item) => item.unread).length;
  const visible =
    tab === "unread" ? items.filter((item) => item.unread) : items;
  return (
    <Drawer open={open} close={close} title="通知">
      <div className="s1-notification-toolbar">
        <Tabs
          label="通知范围"
          value={tab}
          onChange={setTab}
          items={[
            { value: "all", label: "全部", count: items.length },
            { value: "unread", label: "未读", count: unread },
          ]}
        />
        <button
          type="button"
          disabled={!unread}
          onClick={() =>
            setItems((current) =>
              current.map((item) => ({ ...item, unread: false })),
            )
          }
        >
          全部已读
        </button>
      </div>
      {visible.length ? (
        <div className="s1-notification-list">
          {visible.map((item) => (
            <button
              type="button"
              className={item.unread ? "is-unread" : ""}
              key={item.id}
              onClick={() => {
                setItems((current) =>
                  current.map((entry) =>
                    entry.id === item.id ? { ...entry, unread: false } : entry,
                  ),
                );
                notify(`已定位到“${item.source}”`, "info");
                close();
              }}
            >
              <i />
              <span>
                <small>{item.type}</small>
                <b>{item.title}</b>
                <em>{item.source}</em>
                <time>{item.time}</time>
              </span>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      ) : (
        <div className="s1-drawer-empty">
          <Icon name="check" />
          <b>没有未读通知</b>
          <span>新的回复、异常和待处理结果会显示在这里。</span>
        </div>
      )}
      <button
        type="button"
        className="s1-drawer-footer-link"
        onClick={() => notify("已打开通知历史", "info")}
      >
        查看全部通知历史
        <Icon name="chevronRight" />
      </button>
    </Drawer>
  );
}

function DesktopAssetNavigation({ open, close, onSelect, triggerRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (
        !panelRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        close();
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open, triggerRef]);

  if (!open) return null;

  return (
    <aside
      className="s1-asset-nav-panel"
      role="dialog"
      aria-label="业务资产导航"
      ref={panelRef}
    >
      <header>
        <span>
          <b>业务资产</b>
          <small>直接打开正式业务数据</small>
        </span>
        <IconButton icon="close" label="关闭业务资产导航" onClick={close} />
      </header>
      <div className="s1-asset-nav-groups">
        {navSections.slice(1).map((section) => (
          <section key={section.label}>
            <h2>{section.label}</h2>
            <div>
              {section.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    close();
                  }}
                >
                  <i>
                    <Icon name={item.icon} />
                  </i>
                  <span>{item.label}</span>
                  <Icon name="chevronRight" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function MobileNavigation({ open, close, mode, onSelect }) {
  const assets = navSections.slice(1).flatMap((section) => section.items);
  const more = [
    navSections[0].items[3],
    { id: "usage", label: "订阅与用量", icon: "database" },
    { id: "settings", label: "设置", icon: "settings" },
  ];
  const items = mode === "assets" ? assets : more;
  return (
    <Drawer
      open={open}
      close={close}
      side="bottom"
      title={mode === "assets" ? "业务资产" : "更多"}
    >
      <div className="s1-mobile-nav-grid">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              onSelect(item);
              close();
            }}
          >
            <i>
              <Icon name={item.icon} />
            </i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </Drawer>
  );
}

function NewMenu({ open, close, onSelect }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!ref.current?.contains(event.target)) close();
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [close, open]);
  if (!open) return null;
  return (
    <div className="s1-new-menu" role="menu" ref={ref}>
      {[
        ["route", "新建工作", "直接说明目标，Hunter 会选择合适的推进方式"],
        ["upload", "导入数据", "导入简历、岗位、公司、论文、专利或人才版图"],
        ["plus", "手动新建资产", "进入对应业务资产创建正式记录"],
      ].map(([icon, title, description]) => (
        <button type="button" key={title} onClick={() => onSelect(title)}>
          <i>
            <Icon name={icon} />
          </i>
          <span>
            <b>{title}</b>
            <small>{description}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

export function Stage1Shell() {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useToast();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("hunter-theme") || "light",
  );
  const [expanded, setExpanded] = useState(
    () => localStorage.getItem("hunter-nav-expanded") === "1",
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [assetNavigationOpen, setAssetNavigationOpen] = useState(false);
  const [mobileMode, setMobileMode] = useState(null);
  const assetTriggerRef = useRef(null);
  const accountRef = useRef(null);
  const [notificationItems, setNotificationItems] =
    useState(initialNotifications);
  const unread = notificationItems.filter((item) => item.unread).length;

  useEffect(() => {
    localStorage.setItem("hunter-theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("hunter-nav-expanded", expanded ? "1" : "0");
  }, [expanded]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    if (!accountOpen) return undefined;
    const closeOnPointerDown = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  const selectNavigation = (item) => {
    const routes = {
      home: "/home",
      workstreams: "/workstreams/position-vla",
      tasks: "/tasks",
      signals: "/signals",
    };
    if (routes[item.id]) {
      navigate(routes[item.id]);
      return;
    }
    if (item.id === "usage") {
      setUsageOpen(true);
      return;
    }
    notify(`已选择“${item.label}”入口，完整页面将在对应原型阶段提交`, "info");
  };

  return (
    <div
      className={`s1-app ${expanded ? "nav-expanded" : "nav-collapsed"}`}
      data-theme={theme}
    >
      <aside className="s1-sidebar">
        <button
          type="button"
          className="s1-sidebar-brand"
          aria-label="返回工作台"
          onClick={() => navigate("/home")}
        >
          <Brand expanded={expanded} />
        </button>
        <div className="s1-sidebar-scroll">
          <section className="s1-nav-section">
            <h2>{navSections[0].label}</h2>
            <nav>
              {navSections[0].items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={(() => {
                    if (item.id === "home")
                      return location.pathname === "/home" ? "is-active" : "";
                    if (item.id === "workstreams")
                      return location.pathname.startsWith("/workstreams")
                        ? "is-active"
                        : "";
                    if (item.id === "tasks")
                      return location.pathname.startsWith("/tasks")
                        ? "is-active"
                        : "";
                    if (item.id === "signals")
                      return location.pathname.startsWith("/signals")
                        ? "is-active"
                        : "";
                    return "";
                  })()}
                  aria-label={item.label}
                  title={expanded ? undefined : item.label}
                  onClick={() => selectNavigation(item)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.count ? <em>{item.count}</em> : null}
                </button>
              ))}
            </nav>
          </section>
          <section className="s1-nav-section s1-nav-section-assets">
            <h2>业务数据</h2>
            <nav>
              <button
                type="button"
                className={assetNavigationOpen ? "is-active" : ""}
                aria-label="打开业务资产"
                aria-expanded={assetNavigationOpen}
                title={expanded ? undefined : "打开业务资产"}
                ref={assetTriggerRef}
                onClick={() => setAssetNavigationOpen((current) => !current)}
              >
                <Icon name="database" />
                <span>业务资产</span>
                <Icon className="s1-assets-entry-chevron" name="chevronRight" />
              </button>
            </nav>
          </section>
        </div>
        <DesktopAssetNavigation
          open={assetNavigationOpen}
          close={() => setAssetNavigationOpen(false)}
          onSelect={selectNavigation}
          triggerRef={assetTriggerRef}
        />
        <div className="s1-sidebar-foot">
          <UsageRing expanded={expanded} onClick={() => setUsageOpen(true)} />
          <div className="s1-account-wrap" ref={accountRef}>
            <button
              type="button"
              className={`s1-profile-entry ${accountOpen ? "is-open" : ""}`}
              aria-label="打开用户菜单"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => setAccountOpen((current) => !current)}
            >
              <i>SL</i>
              <span>
                <b>沈岚</b>
                <small>个人工作空间</small>
              </span>
              <Icon name={accountOpen ? "chevronUp" : "chevronRight"} />
            </button>
            {accountOpen ? (
              <div
                className="s1-account-menu"
                role="menu"
                aria-label="用户菜单"
              >
                <header>
                  <i>SL</i>
                  <span>
                    <b>沈岚</b>
                    <small>个人工作空间</small>
                  </span>
                </header>
                <div className="s1-account-menu-items">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAccountOpen(false);
                      notify("已打开设置", "info");
                    }}
                  >
                    <Icon name="settings" />
                    <span>
                      <b>设置</b>
                      <small>偏好、通知与自动化</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAccountOpen(false);
                      notify("当前没有需要切换的工作空间", "info");
                    }}
                  >
                    <Icon name="database" />
                    <span>
                      <b>切换工作空间</b>
                      <small>当前仅有 1 个工作空间</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="is-danger"
                    onClick={() => {
                      setAccountOpen(false);
                      notify("原型未连接真实账号", "info");
                    }}
                  >
                    <Icon name="logout" />
                    <span>
                      <b>退出登录</b>
                      <small>安全退出当前账号</small>
                    </span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="s1-sidebar-toggle"
            aria-label={expanded ? "收起导航" : "展开导航"}
            title={expanded ? undefined : "展开导航"}
            onClick={() => setExpanded((current) => !current)}
          >
            <Icon name={expanded ? "panelLeft" : "panelRight"} />
            <span>{expanded ? "收起导航" : "展开导航"}</span>
          </button>
        </div>
      </aside>

      <section className="s1-stage">
        <header className="s1-topbar">
          <button
            type="button"
            className="s1-mobile-brand"
            aria-label="Hunter 工作台"
            onClick={() => navigate("/home")}
          >
            <Brand />
          </button>
          <button
            type="button"
            className="s1-search-trigger"
            onClick={() => setSearchOpen(true)}
          >
            <Icon name="search" />
            <span>搜索主线、任务和业务资产</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="s1-topbar-actions">
            <div className="s1-new-menu-wrap">
              <Button
                tone="primary"
                icon="plus"
                onClick={() => setNewOpen((current) => !current)}
              >
                新建
              </Button>
              <NewMenu
                open={newOpen}
                close={() => setNewOpen(false)}
                onSelect={(label) => {
                  setNewOpen(false);
                  if (label === "新建工作") navigate("/new");
                  else notify(`已选择“${label}”入口`, "info");
                }}
              />
            </div>
            <IconButton
              icon={theme === "light" ? "moon" : "sun"}
              label={theme === "light" ? "切换深色模式" : "切换亮色模式"}
              onClick={() =>
                setTheme((current) => (current === "light" ? "dark" : "light"))
              }
            />
            <IconButton
              icon="bell"
              label="打开通知"
              badge={unread}
              onClick={() => setNotificationOpen(true)}
            />
          </div>
        </header>
        <main
          className={`s1-main ${location.pathname === "/new" || location.pathname.startsWith("/workstreams") || location.pathname.startsWith("/tasks/") ? "s1-main-workspace" : ""}`}
        >
          <Outlet />
        </main>
      </section>

      <nav className="s1-mobile-tabs" aria-label="移动端主导航">
        {[
          ["home", "工作台", "home"],
          ["route", "业务主线", "workstreams"],
          ["task", "支线任务", "tasks"],
          ["database", "业务资产", "assets"],
          ["menu", "更多", "more"],
        ].map(([icon, label, id]) => (
          <button
            type="button"
            key={id}
            className={
              (id === "home" && location.pathname === "/home") ||
              (id === "workstreams" &&
                location.pathname.startsWith("/workstreams")) ||
              (id === "tasks" && location.pathname.startsWith("/tasks"))
                ? "is-active"
                : ""
            }
            onClick={() => {
              if (id === "home") navigate("/home");
              else if (id === "assets" || id === "more") setMobileMode(id);
              else selectNavigation({ id, label });
            }}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <SearchDialog open={searchOpen} close={() => setSearchOpen(false)} />
      <NotificationPanel
        open={notificationOpen}
        close={() => setNotificationOpen(false)}
        items={notificationItems}
        setItems={setNotificationItems}
      />
      <MobileNavigation
        open={Boolean(mobileMode)}
        close={() => setMobileMode(null)}
        mode={mobileMode}
        onSelect={selectNavigation}
      />
      <Modal
        open={usageOpen}
        close={() => setUsageOpen(false)}
        title="本月 Agent 用量"
        description="仅实际运行的 Agent、公开网络搜索和数据处理任务消耗用量"
        footer={
          <Button tone="primary" onClick={() => setUsageOpen(false)}>
            知道了
          </Button>
        }
      >
        <div className="s1-usage-detail">
          <UsageRing value={64} expanded />
          <dl>
            <div>
              <dt>已使用</dt>
              <dd>64%</dd>
            </div>
            <div>
              <dt>本月任务</dt>
              <dd>38 次</dd>
            </div>
            <div>
              <dt>预计可用</dt>
              <dd>至 8 月 31 日</dd>
            </div>
          </dl>
          <p>
            <Icon name="info" />
            等待用户、等待外部、暂停和只查看历史不会持续消耗用量。
          </p>
        </div>
      </Modal>
    </div>
  );
}
