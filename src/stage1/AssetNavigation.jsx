import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "../components/Icon";
import { FloatingPanel } from "../stage4/asset-ui";
import { Drawer, IconButton } from "./ui";

export function AssetNavigationItems({
  items,
  onSelect,
  className = "s1-asset-nav-items",
}) {
  const location = useLocation();
  return (
    <div className={className}>
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          aria-label={item.label}
          aria-current={
            location.pathname === `/${item.id}` ||
            location.pathname.startsWith(`/${item.id}/`)
              ? "page"
              : undefined
          }
          onClick={() => onSelect(item)}
        >
          <i>
            <Icon name={item.icon} />
          </i>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function OtherAssetNavigation({
  open,
  close,
  onSelect,
  triggerRef,
  items,
}) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const frame = requestAnimationFrame(() =>
      panelRef.current?.querySelector(".s1-asset-nav-items button")?.focus(),
    );
    const onPointerDown = (event) => {
      if (
        !panelRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      )
        close();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open, triggerRef]);
  return (
    <FloatingPanel
      open={open && Boolean(items.length)}
      anchorRef={triggerRef}
      panelRef={panelRef}
      portalTarget={triggerRef.current?.closest(".s1-app")}
      className="s1-asset-nav-panel"
      width={320}
      placement="right"
      gap={16}
      role="dialog"
      ariaLabel="其他资产导航"
    >
      <header>
        <b>其他</b>
        <IconButton
          icon="close"
          label="关闭其他资产导航"
          onClick={() => {
            close();
            triggerRef.current?.focus();
          }}
        />
      </header>
      <AssetNavigationItems
        items={items}
        onSelect={(item) => {
          onSelect(item);
          close();
        }}
      />
    </FloatingPanel>
  );
}

export function MobileNavigation({
  open,
  close,
  mode,
  onSelect,
  visibleAssets,
  otherAssets,
  onModeChange,
}) {
  const more = [
    { id: "data", label: "数据管理", icon: "download" },
    { id: "usage", label: "订阅与用量", icon: "database" },
  ];
  const items =
    mode === "assets"
      ? [
          ...visibleAssets,
          ...(otherAssets.length
            ? [{ id: "other-assets", label: "其他", icon: "more" }]
            : []),
        ]
      : mode === "other-assets"
        ? otherAssets
        : more;
  return (
    <Drawer
      open={open}
      close={close}
      side="bottom"
      title={
        mode === "assets"
          ? "业务资产"
          : mode === "other-assets"
            ? "其他"
            : "更多"
      }
    >
      {mode === "other-assets" ? (
        <div className="s1-mobile-asset-back">
          <IconButton
            icon="chevronLeft"
            label="返回业务资产"
            onClick={() => onModeChange("assets")}
          />
        </div>
      ) : null}
      <AssetNavigationItems
        items={items}
        className="s1-mobile-nav-grid"
        onSelect={(item) => {
          if (item.id === "other-assets") onModeChange("other-assets");
          else {
            onSelect(item);
            close();
          }
        }}
      />
      {mode === "more" ? (
        <section className="s1-mobile-account-section">
          <header>
            <i>SL</i>
            <span>
              <b>沈岚</b>
              <small>个人工作空间</small>
            </span>
          </header>
          <button
            type="button"
            onClick={() => {
              onSelect({ id: "settings", label: "设置", icon: "settings" });
              close();
            }}
          >
            <Icon name="settings" />
            <span>
              <b>设置</b>
              <small>个人资料、导航、通知、授权与订阅</small>
            </span>
            <Icon name="chevronRight" />
          </button>
        </section>
      ) : null}
    </Drawer>
  );
}
