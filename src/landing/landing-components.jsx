import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  demoTeamSizes,
  heroStages,
  landingNavItems,
  scenarios,
  workflowStages,
} from "./landing-data";

const contactPattern = /(^1[3-9]\d{9}$)|(^[^\s@]+@[^\s@]+\.[^\s@]+$)/;

export function scrollToLandingSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
}

export function LandingNav({ onDemoOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const navigateTo = (id) => {
    setMenuOpen(false);
    scrollToLandingSection(id);
  };

  return (
    <header className="lp-header">
      <div className="lp-header-inner">
        <button
          type="button"
          className="lp-wordmark"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="返回 Hunter 首页顶部"
        >
          HUNTER
        </button>

        <nav className="lp-desktop-nav" aria-label="首页导航">
          {landingNavItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigateTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="lp-header-actions">
          <Link className="lp-login-link" to="/login">
            登录
          </Link>
          <button
            type="button"
            className="lp-button lp-button-primary lp-header-cta"
            onClick={onDemoOpen}
          >
            预约演示
          </button>
          <button
            type="button"
            className="lp-menu-button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <div
        className={`lp-mobile-nav ${menuOpen ? "is-open" : ""}`}
        id={menuId}
        aria-hidden={!menuOpen}
      >
        {landingNavItems.map((item) => (
          <button
            type="button"
            key={item.id}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => navigateTo(item.id)}
          >
            <span>{item.label}</span>
            <Icon name="chevronRight" />
          </button>
        ))}
        <Link to="/login" tabIndex={menuOpen ? 0 : -1}>
          <span>登录</span>
          <Icon name="chevronRight" />
        </Link>
        <button
          type="button"
          className="lp-mobile-demo"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => {
            setMenuOpen(false);
            onDemoOpen();
          }}
        >
          拿一个岗位来演示
        </button>
      </div>
    </header>
  );
}

function EvidenceSheet({ stage, index, active, onSelect }) {
  return (
    <button
      type="button"
      className={`lp-evidence-sheet lp-sheet-${stage.id} ${active ? "is-active" : ""} ${stage.tone === "human" ? "is-human" : ""}`}
      aria-pressed={active}
      onClick={() => onSelect(index)}
    >
      <span className="lp-sheet-tab" />
      <span className="lp-sheet-corners" aria-hidden="true" />
      <span className="lp-sheet-label">{stage.label}</span>
      <Icon name={stage.icon} className="lp-sheet-icon" />
      <strong>{stage.title}</strong>
      <span className="lp-sheet-detail">{stage.detail}</span>
      <span className="lp-sheet-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {stage.tone === "human" ? (
        <span className="lp-sheet-decision">批准并继续</span>
      ) : null}
    </button>
  );
}

export function HeroEvidenceRail({ activeStage, onStageChange }) {
  return (
    <div className="lp-evidence-stage" aria-label="Hunter 围绕岗位找人演示">
      <div className="lp-stage-grid" aria-hidden="true" />
      <div className="lp-optical-track" aria-hidden="true">
        <span className="lp-track-core" />
        <span className="lp-track-pulse" />
        <span className="lp-track-arrow">
          <Icon name="chevronRight" />
        </span>
      </div>
      <div className="lp-stage-caption">
        <span />
        演示数据 · 一个难岗位的寻访过程
      </div>
      {heroStages.map((stage, index) => (
        <EvidenceSheet
          key={stage.id}
          stage={stage}
          index={index}
          active={activeStage === index}
          onSelect={onStageChange}
        />
      ))}
      <div className="lp-stage-index" aria-hidden="true">
        {heroStages.map((stage, index) => (
          <span
            key={stage.id}
            className={activeStage === index ? "is-active" : ""}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WorkflowProof() {
  const [active, setActive] = useState(workflowStages[0].id);
  const stage =
    workflowStages.find((item) => item.id === active) || workflowStages[0];

  return (
    <div className="lp-proof-window">
      <div className="lp-proof-topbar">
        <div>
          <span className="lp-demo-dot" />
          <strong>具身智能 VLA 算法负责人</strong>
          <span>演示数据</span>
        </div>
        <Link to="/works/position-vla">
          打开完整寻访线 <Icon name="external" />
        </Link>
      </div>
      <div className="lp-proof-layout">
        <div className="lp-proof-tabs" role="tablist" aria-label="工作流阶段">
          {workflowStages.map((item, index) => (
            <button
              type="button"
              key={item.id}
              role="tab"
              aria-selected={item.id === active}
              onClick={() => setActive(item.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              <em>{item.status}</em>
            </button>
          ))}
        </div>

        <div
          key={stage.id}
          className={`lp-proof-detail ${stage.human ? "is-human" : ""}`}
        >
          <div className="lp-proof-heading">
            <div>
              <span>{stage.status}</span>
              <h3>{stage.title}</h3>
            </div>
            <Icon name={stage.human ? "user" : "activity"} />
          </div>
          <p>{stage.description}</p>
          <dl>
            {stage.rows.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
          <footer>
            <span>{stage.footer}</span>
            {stage.human ? (
              <span className="lp-permission-note">
                <Icon name="lock" /> 尚未联系候选人
              </span>
            ) : null}
          </footer>
        </div>
      </div>
    </div>
  );
}

export function ScenarioRail() {
  const [active, setActive] = useState(scenarios[1].id);

  return (
    <div className="lp-scenario-rail">
      {scenarios.map((scenario, index) => {
        const expanded = scenario.id === active;
        return (
          <article className={expanded ? "is-active" : ""} key={scenario.id}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setActive(scenario.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{scenario.title}</strong>
              <em>{scenario.trigger}</em>
              <Icon name={expanded ? "minus" : "plus"} />
            </button>
            <div className="lp-scenario-content" aria-hidden={!expanded}>
              <p>{scenario.description}</p>
              <dl>
                <dt>最后留下</dt>
                <dd>{scenario.output}</dd>
              </dl>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function validateDemoForm(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "请告诉我们怎么称呼你。";
  if (!values.company.trim()) errors.company = "请填写你的品牌或团队。";
  if (!values.contact.trim()) {
    errors.contact = "请输入工作邮箱或手机号。";
  } else if (!contactPattern.test(values.contact.trim())) {
    errors.contact = "请输入有效的工作邮箱或中国大陆手机号。";
  }
  return errors;
}

export function DemoDialog({ open, onClose }) {
  const titleId = useId();
  const firstField = useRef(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [status, setStatus] = useState("idle");
  const statusRef = useRef(status);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    name: "",
    company: "",
    contact: "",
    size: demoTeamSizes[0],
    need: "",
  });

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => firstField.current?.focus(), 30);
    const handleKey = (event) => {
      if (event.key === "Escape" && statusRef.current !== "submitting") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll(
          'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element instanceof HTMLElement);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
      window.setTimeout(() => openerRef.current?.focus(), 0);
    };
  }, [open]);

  if (!open) return null;

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateDemoForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStatus("submitting");
    window.setTimeout(() => setStatus("success"), 760);
  };

  return (
    <div
      className="lp-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && status !== "submitting")
          onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="lp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="lp-dialog-close"
          aria-label="关闭演示预约"
          disabled={status === "submitting"}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>

        {status === "success" ? (
          <div className="lp-dialog-success">
            <span>
              <Icon name="check" size={28} />
            </span>
            <h2 id={titleId}>演示信息已在本地确认</h2>
            <p>
              这是原型中的确认状态，不会把你填写的业务信息发送到销售系统或其他外部服务。
            </p>
            <button
              type="button"
              className="lp-button lp-button-primary"
              onClick={onClose}
            >
              返回首页
            </button>
          </div>
        ) : (
          <>
            <div className="lp-dialog-intro">
              <span>HUNTER / DEMO</span>
              <h2 id={titleId}>带一个正在卡住的岗位来</h2>
              <p>
                告诉我们岗位难在哪、已经找过哪些地方。当前原型只模拟填写，不会把信息发送到外部服务。
              </p>
            </div>
            <form onSubmit={submit} noValidate>
              <div className="lp-field-row">
                <label className={errors.name ? "has-error" : ""}>
                  <span>怎么称呼你</span>
                  <input
                    ref={firstField}
                    value={values.name}
                    onChange={(event) => update("name", event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    placeholder="例如：沈岚"
                  />
                  {errors.name ? <small>{errors.name}</small> : null}
                </label>
                <label className={errors.company ? "has-error" : ""}>
                  <span>你的品牌或团队</span>
                  <input
                    value={values.company}
                    onChange={(event) => update("company", event.target.value)}
                    aria-invalid={Boolean(errors.company)}
                    placeholder="个人顾问也可以填写姓名"
                  />
                  {errors.company ? <small>{errors.company}</small> : null}
                </label>
              </div>
              <label className={errors.contact ? "has-error" : ""}>
                <span>工作邮箱或手机号</span>
                <input
                  value={values.contact}
                  onChange={(event) => update("contact", event.target.value)}
                  aria-invalid={Boolean(errors.contact)}
                  placeholder="name@company.com / 13800000000"
                />
                {errors.contact ? <small>{errors.contact}</small> : null}
              </label>
              <fieldset>
                <legend>顾问团队规模</legend>
                <div className="lp-size-options">
                  {demoTeamSizes.map((size) => (
                    <label key={size}>
                      <input
                        type="radio"
                        name="team-size"
                        checked={values.size === size}
                        onChange={() => update("size", size)}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>
                <span>这个岗位最难找的是什么？</span>
                <textarea
                  value={values.need}
                  onChange={(event) => update("need", event.target.value)}
                  placeholder="例如：方向太新、目标公司不清楚、平台搜不到、同名人物难核验"
                  rows={4}
                />
              </label>
              <button
                type="submit"
                className="lp-button lp-button-primary lp-submit-button"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  <span className="lp-spinner" />
                ) : null}
                {status === "submitting" ? "正在确认…" : "拿一个岗位来演示"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
