import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { agentUsage } from "./data";
import { useToast } from "./ui";

/** Desktop and mobile share the approved four account actions. */
export function AccountMenu({ mobileEntry = false, onUsage, onActiveChange }) {
  const navigate = useNavigate();
  const notify = useToast();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const accountRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const menuId = useId();

  useLayoutEffect(() => {
    onActiveChange?.(open);
    return () => onActiveChange?.(false);
  }, [open, onActiveChange]);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnPointerDown = (event) => {
      if (
        !accountRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, mobileEntry]);
  useLayoutEffect(() => {
    if (!open || !mobileEntry) {
      setPosition(null);
      return undefined;
    }
    const measure = () => {
      const anchor = accountRef.current?.getBoundingClientRect(),
        panel = panelRef.current;
      if (!anchor || !panel) return;
      setPosition({
        left: Math.max(
          8,
          Math.min(
            anchor.right - panel.offsetWidth,
            window.innerWidth - panel.offsetWidth - 8,
          ),
        ),
        bottom: Math.max(
          8,
          Math.min(
            window.innerHeight - anchor.top + 6,
            window.innerHeight - panel.offsetHeight - 8,
          ),
        ),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const observer = new ResizeObserver(measure);
    observer.observe(accountRef.current);
    observer.observe(panelRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      observer.disconnect();
    };
  }, [open, mobileEntry]);

  const panel = open ? (
    <div
      ref={panelRef}
      id={menuId}
      className={`s1-account-menu${mobileEntry ? " is-mobile-account-menu" : ""}`}
      role="menu"
      aria-label="用户菜单"
      style={
        mobileEntry
          ? {
              position: "fixed",
              left: position?.left ?? 0,
              bottom: position?.bottom ?? 0,
              visibility: position ? "visible" : "hidden",
              maxHeight: "calc(100dvh - 16px)",
              overflowY: "auto",
            }
          : undefined
      }
      onKeyDown={(event) => {
        if (mobileEntry && event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
          return;
        }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        const rows = [
          ...event.currentTarget.querySelectorAll('[role="menuitem"]'),
        ];
        const index = rows.indexOf(document.activeElement);
        rows[
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? rows.length - 1
              : (index + (event.key === "ArrowUp" ? -1 : 1) + rows.length) %
                rows.length
        ]?.focus();
      }}
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
          aria-label={`查看 Credits 用量，余额 ${agentUsage.balance.toLocaleString("zh-CN")}，本月套餐已用 ${agentUsage.usedPercent}%`}
          onClick={() => {
            setOpen(false);
            onUsage();
          }}
        >
          <Icon name="activity" />
          <span>
            <b>Credits 余额 {agentUsage.balance.toLocaleString("zh-CN")}</b>
            <small>
              本月套餐已用 {agentUsage.usedPercent}% · {agentUsage.refreshOn}{" "}
              刷新
            </small>
          </span>
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setOpen(false);
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
            setOpen(false);
            notify("当前没有需要切换的工作空间", "info");
          }}
        >
          <Icon name="swap" />
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
            setOpen(false);
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
  ) : null;
  return (
    <div
      className={`s1-account-wrap${mobileEntry ? " is-mobile-entry" : ""}`}
      ref={accountRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`s1-profile-entry${open ? " is-open" : ""}${mobileEntry ? " s1-mobile-account-trigger" : ""}`}
        aria-label="打开用户菜单"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          const last = event.key === "ArrowUp";
          setOpen(true);
          requestAnimationFrame(() => {
            const rows =
              panelRef.current?.querySelectorAll('[role="menuitem"]');
            if (rows?.length) rows[last ? rows.length - 1 : 0].focus();
          });
        }}
      >
        <i>SL</i>
        <span>
          <b>沈岚</b>
          <small>个人工作空间</small>
        </span>
        <Icon name={open ? "chevronUp" : "chevronRight"} />
      </button>
      {mobileEntry && panel
        ? createPortal(
            panel,
            accountRef.current?.closest(".s1-app") || document.body,
          )
        : panel}
    </div>
  );
}
