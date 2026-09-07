import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { TooltipText } from "../stage4/asset-ui";
import {
  AssetTypeNavigation,
  MobileNavigation,
  OtherAssetNavigation,
} from "./AssetNavigation";
import {
  graphListContext,
  graphListRoute,
  graphTypes,
  isGraphType,
} from "../stage4/graph-types";
import { useTopicGraphs } from "../stage4/topic-graph-store";
import {
  assetNavigationItems,
  useAssetNavigationPreferences,
  useGraphTypeNavigationPreferences,
} from "./asset-navigation-store";
import {
  agentUsage,
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
        selected ? "查看命中原因和当前业务状态" : "搜索任务、洞察和正式业务资产"
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
  const navigate = useNavigate();
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
                close();
                if (item.route) navigate(item.route);
                else notify(`已定位到“${item.source}”`, "info");
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
        ["route", "新建任务", "直接说明目标，Hunter 会选择合适的推进方式"],
        ["refresh", "新建周期性任务", "用自然语言说明需要重复执行的任务和周期"],
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

const manualAssetTypes = [
  {
    label: "公司",
    icon: "building",
    description: "建立公司资料与招聘关联",
    route: "/companies/new",
  },
  {
    label: "招聘机会",
    icon: "sparkles",
    description: "沉淀已经确认的招聘需求",
    route: "/opportunities/new",
  },
  {
    label: "岗位",
    icon: "briefcase",
    description: "录入岗位资料与招聘要求",
    route: "/positions/new",
  },
  {
    label: "候选人",
    icon: "user",
    description: "录入候选人或上传简历",
    route: "/candidates/new",
  },
  {
    label: "知识图谱",
    icon: "database",
    description: "创建可持续维护的关系图谱",
    route: "/mappings/new",
  },
];

function AssetCreateDialog({ open, close, onSelect }) {
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title="选择资产类型"
      description="选择后直接进入对应的新建页面"
      footer={<Button onClick={close}>取消</Button>}
    >
      <div className="s1-asset-create-grid">
        {manualAssetTypes.map((item) => (
          <button
            type="button"
            key={item.route}
            onClick={() => onSelect(item.route)}
          >
            <i>
              <Icon name={item.icon} />
            </i>
            <span>
              <b>{item.label}</b>
              <small>{item.description}</small>
            </span>
            <Icon name="chevronRight" />
          </button>
        ))}
      </div>
      <p className="s1-asset-create-note">
        论文和专利通过数据管理导入，避免手动录入缺少必要标识与来源证据。
      </p>
    </Modal>
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
  const [assetCreateOpen, setAssetCreateOpen] = useState(false);
  const [mobileMode, setMobileMode] = useState(null);
  const visibleAssetIds = useAssetNavigationPreferences();
  const visibleGraphTypeIds = useGraphTypeNavigationPreferences();
  const graphs = useTopicGraphs();
  const currentGraph = graphs.find(
    (graph) =>
      !graph.deletedAt && location.pathname === `/mappings/${graph.id}`,
  );
  const requestedGraphType = graphListContext(
    new URLSearchParams(location.search),
  ).type;
  const activeGraphType = location.pathname.startsWith("/mappings")
    ? currentGraph?.typeId ||
      (isGraphType(requestedGraphType) ? requestedGraphType : "")
    : "";
  const visibleAssets = assetNavigationItems.filter((item) =>
    visibleAssetIds.includes(item.id),
  );
  const otherAssets = assetNavigationItems.filter(
    (item) => !visibleAssetIds.includes(item.id),
  );
  const isAssetActive = (item) =>
    location.pathname === `/${item.id}` ||
    location.pathname.startsWith(`/${item.id}/`);
  const assetTriggerRef = useRef(null);
  const accountRef = useRef(null);
  const [notificationItems, setNotificationItems] =
    useState(initialNotifications);
  const unread = notificationItems.filter((item) => item.unread).length;

  useEffect(() => {
    setAssetNavigationOpen(false);
    setMobileMode(null);
  }, [location.pathname, visibleAssetIds]);

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
      tasks: "/tasks",
      signals: "/signals",
      candidates: "/candidates",
      positions: "/positions",
      companies: "/companies",
      opportunities: "/opportunities",
      mappings: "/mappings",
      papers: "/papers",
      patents: "/patents",
      data: "/data/imports",
    };
    if (routes[item.id]) {
      navigate(routes[item.id]);
      return;
    }
    if (item.id === "usage") {
      setUsageOpen(true);
      return;
    }
    if (item.id === "settings") {
      navigate("/settings/profile");
      return;
    }
    notify(`已选择“${item.label}”入口`, "info");
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
                    if (item.id === "tasks")
                      return location.pathname.startsWith("/tasks") ||
                        location.pathname === "/new"
                        ? "is-active"
                        : "";
                    if (item.id === "signals")
                      return location.pathname.startsWith("/signals")
                        ? "is-active"
                        : "";
                    return "";
                  })()}
                  aria-label={item.label}
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
            <h2>业务资产</h2>
            <nav aria-label="资产导航">
              {visibleAssets.map((item) => (
                <Fragment key={item.id}>
                  <button
                    type="button"
                    className={isAssetActive(item) ? "is-active" : ""}
                    aria-label={item.label}
                    aria-current={
                      isAssetActive(item) &&
                      !(
                        item.id === "mappings" &&
                        activeGraphType &&
                        expanded &&
                        visibleGraphTypeIds.includes(activeGraphType)
                      )
                        ? "page"
                        : undefined
                    }
                    onClick={() => selectNavigation(item)}
                  >
                    <TooltipText
                      className="s1-nav-icon-tooltip"
                      tip={!expanded ? item.label : undefined}
                      trigger="always"
                    >
                      <Icon name={item.icon} />
                    </TooltipText>
                    <span>{item.label}</span>
                  </button>
                  {item.id === "mappings" && expanded ? (
                    <AssetTypeNavigation
                      label="知识图谱类型"
                      items={graphTypes.filter((type) =>
                        visibleGraphTypeIds.includes(type.id),
                      )}
                      activeId={activeGraphType}
                      onSelect={(type) =>
                        navigate(graphListRoute({ type: type.id }))
                      }
                    />
                  ) : null}
                </Fragment>
              ))}
              {otherAssets.length ? (
                <button
                  type="button"
                  className={
                    assetNavigationOpen || otherAssets.some(isAssetActive)
                      ? "is-active"
                      : ""
                  }
                  aria-label="其他"
                  aria-haspopup="dialog"
                  aria-expanded={assetNavigationOpen}
                  ref={assetTriggerRef}
                  onClick={() => setAssetNavigationOpen((current) => !current)}
                >
                  <TooltipText
                    className="s1-nav-icon-tooltip"
                    tip={!expanded ? "其他" : undefined}
                    trigger="always"
                  >
                    <Icon name="more" />
                  </TooltipText>
                  <span>其他</span>
                  <Icon
                    className="s1-assets-entry-chevron"
                    name="chevronRight"
                  />
                </button>
              ) : null}
            </nav>
          </section>
          <section className="s1-nav-section">
            <h2>数据工具</h2>
            <nav>
              <button
                type="button"
                className={
                  location.pathname.startsWith("/data/") ||
                  location.pathname === "/recycle-bin"
                    ? "is-active"
                    : ""
                }
                aria-label="打开数据管理"
                onClick={() =>
                  selectNavigation({ id: "data", label: "数据管理" })
                }
              >
                <Icon name="download" />
                <span>数据管理</span>
              </button>
            </nav>
          </section>
        </div>
        <OtherAssetNavigation
          open={assetNavigationOpen}
          close={() => setAssetNavigationOpen(false)}
          onSelect={selectNavigation}
          triggerRef={assetTriggerRef}
          items={otherAssets}
        />
        <div className="s1-sidebar-foot">
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
                    aria-label={`查看 Agent 用量，已用 ${agentUsage.usedPercent}%，${agentUsage.expiresOn} 到期`}
                    onClick={() => {
                      setAccountOpen(false);
                      setUsageOpen(true);
                    }}
                  >
                    <Icon name="activity" />
                    <span>
                      <b>Agent 用量 · 已用 {agentUsage.usedPercent}%</b>
                      <small>{agentUsage.expiresOn} 到期</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAccountOpen(false);
                      navigate("/settings/profile");
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
            <span>搜索任务、洞察和业务资产</span>
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
                  if (label === "新建任务") navigate("/new");
                  else if (label === "新建周期性任务")
                    navigate("/new?mode=periodic");
                  else if (label === "手动新建资产") setAssetCreateOpen(true);
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
          className={`s1-main ${location.pathname === "/new" || location.pathname.startsWith("/tasks") || location.pathname.startsWith("/reviews/") ? "s1-main-workspace" : ""} ${location.pathname.startsWith("/signals") ? "s1-main-signals" : ""}`}
        >
          <Outlet />
        </main>
      </section>

      <nav className="s1-mobile-tabs" aria-label="移动端主导航">
        {[
          ["home", "工作台", "home"],
          ["route", "任务", "tasks"],
          ["signal", "洞察", "signals"],
          ["database", "业务资产", "assets"],
          ["menu", "更多", "more"],
        ].map(([icon, label, id]) => (
          <button
            type="button"
            key={id}
            className={
              (id === "home" && location.pathname === "/home") ||
              (id === "tasks" &&
                (location.pathname.startsWith("/tasks") ||
                  location.pathname === "/new")) ||
              (id === "signals" && location.pathname.startsWith("/signals")) ||
              (id === "assets" && assetNavigationItems.some(isAssetActive))
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
        visibleAssets={visibleAssets}
        otherAssets={otherAssets}
        onModeChange={setMobileMode}
      />
      <AssetCreateDialog
        open={assetCreateOpen}
        close={() => setAssetCreateOpen(false)}
        onSelect={(route) => {
          setAssetCreateOpen(false);
          navigate(route);
        }}
      />
      <Modal
        open={usageOpen}
        close={() => setUsageOpen(false)}
        title="Agent 用量"
        size="sm"
        footer={
          <>
            <Button onClick={() => setUsageOpen(false)}>关闭</Button>
            <Button
              tone="primary"
              onClick={() => {
                setUsageOpen(false);
                navigate("/settings/subscription");
              }}
            >
              查看订阅与用量
            </Button>
          </>
        }
      >
        <div className="s1-usage-detail">
          <dl>
            <div>
              <dt>已用量</dt>
              <dd>{agentUsage.usedPercent}%</dd>
            </div>
            <div>
              <dt>到期日期</dt>
              <dd>{agentUsage.expiresOn}</dd>
            </div>
          </dl>
        </div>
      </Modal>
    </div>
  );
}
