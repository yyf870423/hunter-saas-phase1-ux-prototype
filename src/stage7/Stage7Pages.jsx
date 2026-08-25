import { useEffect, useId, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Icon } from "../components/Icon";
import { moodboards, processSteps, referenceProducts } from "./data";
import { SceneCanvas } from "./SceneCanvas";

function HunterMark({ compact = false }) {
  return (
    <span className={`s7-brand ${compact ? "is-compact" : ""}`.trim()}>
      <span className="s7-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="presentation">
          <path d="M7 6v20M25 6v20M7 16h18" />
          <path
            className="s7-brand-spark"
            d="m21 3 1.2 3.1L25 7.3l-2.8 1.1L21 11l-1.2-2.6L17 7.3l2.8-1.2Z"
          />
        </svg>
      </span>
      <span>
        <b>Hunter</b>
        {!compact ? <small>AI 猎头工作系统</small> : null}
      </span>
    </span>
  );
}

function PublicButton({
  children,
  icon,
  tone = "primary",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`s7-button is-${tone} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {icon ? <Icon name={icon} size={17} /> : null}
    </button>
  );
}

function PublicNav({ theme }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="s7-public-nav">
      <Link to={`/moodboards/${theme.id}`} aria-label="Hunter 首页">
        <HunterMark />
      </Link>
      <nav className={open ? "is-open" : ""} aria-label="公开页面导航">
        <a href="#how" onClick={() => setOpen(false)}>
          工作方式
        </a>
        <a href="#proof" onClick={() => setOpen(false)}>
          业务成果
        </a>
        <Link to="/moodboards" onClick={() => setOpen(false)}>
          设计方向
        </Link>
      </nav>
      <div className="s7-nav-actions">
        <Link className="s7-nav-login" to={`/moodboards/${theme.id}/auth`}>
          登录
        </Link>
        <Link
          className="s7-nav-cta"
          to={`/moodboards/${theme.id}/auth?mode=register`}
        >
          申请体验
        </Link>
        <button
          type="button"
          className="s7-menu-button"
          aria-label={open ? "关闭导航" : "打开导航"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}

function SceneLabels({ variant }) {
  if (variant === "graph") {
    return (
      <div className="s7-scene-labels is-graph" aria-hidden="true">
        <span style={{ "--x": "18%", "--y": "31%" }}>目标公司 · 27</span>
        <span style={{ "--x": "79%", "--y": "24%" }}>关键人才 · 186</span>
        <span style={{ "--x": "72%", "--y": "72%" }}>论文与专利 · 94</span>
        <span className="is-focus" style={{ "--x": "48%", "--y": "48%" }}>
          VLA 算法负责人
        </span>
      </div>
    );
  }
  if (variant === "observatory") {
    return (
      <div className="s7-scene-labels is-observatory" aria-hidden="true">
        <span style={{ "--x": "68%", "--y": "24%" }}>新公司融资 · 高</span>
        <span style={{ "--x": "78%", "--y": "38%" }}>算法团队扩招 · 高</span>
        <span className="is-warning" style={{ "--x": "66%", "--y": "66%" }}>
          关键人才变动 · 待核验
        </span>
      </div>
    );
  }
  return (
    <div className="s7-scene-labels is-orchestration" aria-hidden="true">
      <span style={{ "--x": "14%", "--y": "28%" }}>理解目标</span>
      <span style={{ "--x": "18%", "--y": "66%" }}>公开网络调研</span>
      <span style={{ "--x": "45%", "--y": "13%" }}>任务编排</span>
      <span style={{ "--x": "73%", "--y": "30%" }}>候选人匹配</span>
      <span className="is-focus" style={{ "--x": "72%", "--y": "67%" }}>
        等待人工审核
      </span>
      <span style={{ "--x": "45%", "--y": "81%" }}>写入业务资产</span>
    </div>
  );
}

function HeroStatus({ theme }) {
  return (
    <div className="s7-hero-status" id="proof">
      <span className="s7-live-dot" />
      <b>{theme.sceneLabel}</b>
      <div>
        {theme.metrics.map((metric) => (
          <span key={metric}>{metric}</span>
        ))}
      </div>
    </div>
  );
}

function OrchestrationProcess() {
  const [active, setActive] = useState(processSteps[0].id);
  const current =
    processSteps.find((step) => step.id === active) || processSteps[0];
  return (
    <section className="s7-process is-orchestration" id="how">
      <div className="s7-section-heading">
        <span>从目标到成果</span>
        <h2>Agent 负责执行，人负责关键判断。</h2>
        <p>过程持续推进，但任何结果都不会越过你设定的审核边界。</p>
      </div>
      <div className="s7-process-orchestrator">
        <div
          className="s7-step-rail"
          role="tablist"
          aria-label="Hunter 工作流程"
        >
          {processSteps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={active === step.id}
              className={active === step.id ? "is-active" : ""}
              onClick={() => setActive(step.id)}
            >
              <em>{String(index + 1).padStart(2, "0")}</em>
              <span>{step.label}</span>
            </button>
          ))}
        </div>
        <article className="s7-process-detail" key={current.id}>
          <small>{current.eyebrow}</small>
          <h3>{current.title}</h3>
          <p>{current.body}</p>
          <div>
            <Icon name="activity" />
            {current.detail}
          </div>
        </article>
        <div className="s7-process-preview" aria-label="执行结果预览">
          <div className="s7-mini-plan">
            <header>
              <span>执行计划</span>
              <b>3 / 4</b>
            </header>
            {processSteps.map((step, index) => (
              <div
                className={
                  index < 2 ? "is-done" : index === 2 ? "is-running" : ""
                }
                key={step.id}
              >
                <span>
                  {index < 2 ? (
                    <Icon name="check" />
                  ) : index === 2 ? (
                    <span className="s7-mini-spinner" />
                  ) : (
                    index + 1
                  )}
                </span>
                <p>
                  {step.label}
                  <small>
                    {index < 2
                      ? "已完成"
                      : index === 2
                        ? "等待你审核"
                        : "未开始"}
                  </small>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GraphProcess() {
  const [active, setActive] = useState("company");
  const items = [
    {
      id: "company",
      label: "公司与组织",
      value: "27 家",
      detail: "已形成 8 家重点公司的组织方向与核心团队关系。",
    },
    {
      id: "people",
      label: "关键人才",
      value: "186 位",
      detail: "按技术方向、履历层级与关系距离完成分类。",
    },
    {
      id: "research",
      label: "研究成果",
      value: "94 项",
      detail: "论文与专利已关联到 63 位系统人物或人物线索。",
    },
    {
      id: "evidence",
      label: "核验证据",
      value: "312 条",
      detail: "每条关系保留来源，冲突信息等待用户确认。",
    },
  ];
  const current = items.find((item) => item.id === active);
  return (
    <section className="s7-process is-graph" id="how">
      <div className="s7-section-heading">
        <span>从线索到关系</span>
        <h2>每一次调研，都让人才网络更完整。</h2>
        <p>
          不是保存一份搜索结果，而是把可以继续探索的公司、人物和证据留在系统里。
        </p>
      </div>
      <div className="s7-graph-process">
        <div className="s7-graph-map" aria-hidden="true">
          <span className="is-center">具身智能</span>
          {items.map((item, index) => (
            <button
              type="button"
              className={`is-node node-${index + 1} ${active === item.id ? "is-active" : ""}`}
              key={item.id}
              tabIndex="-1"
            >
              {item.value}
            </button>
          ))}
          <i className="line-1" />
          <i className="line-2" />
          <i className="line-3" />
          <i className="line-4" />
        </div>
        <div
          className="s7-graph-index"
          role="tablist"
          aria-label="人才图谱组成"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active === item.id}
              className={active === item.id ? "is-active" : ""}
              onClick={() => setActive(item.id)}
            >
              <span>{item.label}</span>
              <b>{item.value}</b>
            </button>
          ))}
          <article key={current.id}>
            <small>当前关系投影</small>
            <h3>{current.label}</h3>
            <p>{current.detail}</p>
            <span>
              <Icon name="check" />
              已通过来源核验
            </span>
          </article>
        </div>
      </div>
    </section>
  );
}

function ObservatoryProcess() {
  const [selected, setSelected] = useState(0);
  const signals = [
    {
      time: "09:42",
      level: "高",
      title: "星澜机器人完成新一轮融资",
      action: "建议建立客户开发主线",
      detail: "公开信息显示资金将重点投入具身智能研发和商业化团队。",
    },
    {
      time: "08:16",
      level: "高",
      title: "云深处科技新增 VLA 算法岗位",
      action: "建议核验团队扩张方向",
      detail: "岗位描述出现具身导航、VLA 与真实机器人数据闭环等关键词。",
    },
    {
      time: "昨天",
      level: "中",
      title: "三位核心研究者出现共同署名",
      action: "建议更新人才关系",
      detail: "新论文反映三个实验室在多模态机器人方向形成合作。",
    },
  ];
  return (
    <section className="s7-process is-observatory" id="how">
      <div className="s7-section-heading">
        <span>从变化到行动</span>
        <h2>持续观察，但只提醒真正值得处理的变化。</h2>
        <p>
          信号先经过归并、核验和优先级判断，再由你决定是否启动新的业务主线。
        </p>
      </div>
      <div className="s7-signal-console">
        <div
          className="s7-signal-stream"
          role="listbox"
          aria-label="招聘与人才信号"
        >
          {signals.map((signal, index) => (
            <button
              key={signal.title}
              type="button"
              role="option"
              aria-selected={selected === index}
              className={selected === index ? "is-active" : ""}
              onClick={() => setSelected(index)}
            >
              <time>{signal.time}</time>
              <span className={signal.level === "高" ? "is-high" : ""}>
                {signal.level}
              </span>
              <p>
                <b>{signal.title}</b>
                <small>{signal.action}</small>
              </p>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
        <article className="s7-signal-detail" key={signals[selected].title}>
          <div>
            <span className="s7-live-dot" />
            已核验公开来源
          </div>
          <small>建议关注</small>
          <h3>{signals[selected].title}</h3>
          <p>{signals[selected].detail}</p>
          <dl>
            <div>
              <dt>业务影响</dt>
              <dd>{signals[selected].action}</dd>
            </div>
            <div>
              <dt>关联资产</dt>
              <dd>2 家公司 · 1 个岗位 · 7 位人才</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}

function ProductBridge({ variant }) {
  const cards =
    variant === "graph"
      ? [
          ["公司", "27", "目标企业与组织方向"],
          ["候选人", "186", "人物档案与关系"],
          ["人才版图", "4", "持续更新的摸排成果"],
        ]
      : variant === "observatory"
        ? [
            ["高优先级", "12", "需要今天处理"],
            ["建议主线", "3", "等待你决定是否启动"],
            ["持续观察", "46", "暂无需人工操作"],
          ]
        : [
            ["业务主线", "4", "持续推进完整目标"],
            ["相关任务", "9", "Agent 并行执行"],
            ["等待审核", "18", "由你做关键判断"],
          ];
  return (
    <section className="s7-product-bridge">
      <header>
        <span>进入 Hunter 工作台</span>
        <b>所有结果回到同一个工作上下文</b>
      </header>
      <div>
        {cards.map(([label, value, text]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ThemeHome({ theme }) {
  const process =
    theme.id === "graph" ? (
      <GraphProcess />
    ) : theme.id === "observatory" ? (
      <ObservatoryProcess />
    ) : (
      <OrchestrationProcess />
    );
  return (
    <main className={`s7-site theme-${theme.id}`}>
      <PublicNav theme={theme} />
      <section className="s7-hero">
        <SceneCanvas variant={theme.id} />
        <SceneLabels variant={theme.id} />
        <div className="s7-hero-content">
          <span className="s7-hero-kicker">
            <Icon name="sparkles" />
            {theme.name}
          </span>
          <h1>{theme.tagline}</h1>
          <p>{theme.description}</p>
          <div className="s7-hero-actions">
            <Link
              className="s7-button is-primary"
              to={`/moodboards/${theme.id}/auth?mode=register`}
            >
              申请体验 <Icon name="chevronRight" />
            </Link>
            <a className="s7-button is-ghost" href="#how">
              了解工作方式 <Icon name="chevronDown" />
            </a>
          </div>
        </div>
        <HeroStatus theme={theme} />
        <div className="s7-scroll-hint">
          <span />
          继续了解 Hunter
        </div>
      </section>
      {process}
      <ProductBridge variant={theme.id} />
      <footer className="s7-public-footer">
        <HunterMark />
        <p>让猎头把时间留给判断、关系与沟通。</p>
        <div>
          <Link to={`/moodboards/${theme.id}/auth`}>登录</Link>
          <Link to="/moodboards">查看其他方向</Link>
        </div>
      </footer>
    </main>
  );
}

function PreviewArt({ themeId }) {
  if (themeId === "graph") {
    return (
      <div className="s7-index-art is-graph">
        <i />
        <i />
        <i />
        <i />
        <span />
      </div>
    );
  }
  if (themeId === "observatory") {
    return (
      <div className="s7-index-art is-observatory">
        <i />
        <i />
        <i />
        <span />
        <b />
      </div>
    );
  }
  return (
    <div className="s7-index-art is-orchestration">
      <i />
      <i />
      <i />
      <i />
      <span />
    </div>
  );
}

export function MoodboardIndex() {
  return (
    <main className="s7-index">
      <header>
        <HunterMark />
        <Link to="/review">
          返回产品原型 <Icon name="external" />
        </Link>
      </header>
      <section className="s7-index-heading">
        <span>阶段七 · 公开首页与认证</span>
        <h1>三种 Hunter 品牌表达方向</h1>
        <p>
          每套方案都包含可运行的首页首屏、业务流程、用户认证和运营端认证。当前只审批设计语言，不代表最终首页内容已经冻结。
        </p>
      </section>
      <section className="s7-index-grid">
        {Object.values(moodboards).map((theme) => (
          <article className={`s7-index-card theme-${theme.id}`} key={theme.id}>
            <Link className="s7-index-preview" to={`/moodboards/${theme.id}`}>
              <PreviewArt themeId={theme.id} />
              <span>
                打开首页 Moodboard <Icon name="external" />
              </span>
            </Link>
            <div className="s7-index-card-body">
              <small>
                {theme.index} · {theme.tone}
              </small>
              <h2>{theme.name}</h2>
              <p>{theme.description}</p>
              <div>
                <Link to={`/moodboards/${theme.id}`}>首页</Link>
                <Link to={`/moodboards/${theme.id}/auth`}>用户登录</Link>
                <Link to={`/moodboards/${theme.id}/auth?mode=register`}>
                  用户注册
                </Link>
                <Link to={`/moodboards/${theme.id}/ops-login`}>运营端</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="s7-reference-strip">
        <span>参考范围</span>
        <div>
          {referenceProducts.map((name) => (
            <b key={name}>{name}</b>
          ))}
        </div>
      </section>
      <section className="s7-state-links">
        <h2>认证状态验收入口</h2>
        <div>
          <Link to="/moodboards/orchestration/auth?state=error">凭据错误</Link>
          <Link to="/moodboards/graph/auth?mode=register&state=loading">
            注册处理中
          </Link>
          <Link to="/moodboards/observatory/ops-login?state=mfa">
            运营端二次验证
          </Link>
          <Link to="/moodboards/orchestration/ops-login?state=disabled">
            运营账号停用
          </Link>
        </div>
      </section>
    </main>
  );
}

function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled,
  action,
}) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <div className={`s7-auth-field ${error ? "has-error" : ""}`}>
      <label htmlFor={inputId}>{label}</label>
      <div>
        <input
          id={inputId}
          type={isPassword && visible ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={visible ? "隐藏密码" : "显示密码"}
            onClick={() => setVisible((current) => !current)}
            disabled={disabled}
          >
            <Icon name={visible ? "eyeOff" : "eye"} size={16} />
          </button>
        ) : (
          action || null
        )}
      </div>
      {error ? <small>{error}</small> : null}
    </div>
  );
}

function AuthVisual({ theme, ops = false }) {
  return (
    <section className="s7-auth-visual">
      <SceneCanvas variant={theme.id} />
      <div>
        <span>{ops ? "Hunter Operations" : theme.name}</span>
        <h2>{ops ? "运营工作空间" : theme.tagline}</h2>
        <p>
          {ops
            ? "处理工作空间、任务故障和平台能力配置。"
            : "让复杂招聘工作持续推进，让关键决定始终留在人手中。"}
        </p>
      </div>
      {!ops ? (
        <HeroStatus theme={theme} />
      ) : (
        <div className="s7-ops-guard">
          <Icon name="shield" />
          仅限已授权运营人员
        </div>
      )}
    </section>
  );
}

export function UserAuthPage() {
  const { themeId } = useParams();
  const theme = moodboards[themeId] || moodboards.orchestration;
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "login";
  const state = searchParams.get("state") || "normal";
  const [values, setValues] = useState({
    name: "",
    account: "",
    code: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const loading = state === "loading";

  const setMode = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    if (nextMode === "register") next.set("mode", "register");
    else next.delete("mode");
    next.delete("state");
    setSearchParams(next);
    setErrors({});
    setSuccess(false);
  };
  const update = (field) => (value) =>
    setValues((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (mode === "register" && !values.name.trim()) next.name = "请输入姓名";
    if (!values.account.trim()) next.account = "请输入手机号或邮箱";
    if (mode === "register" && !values.code.trim()) next.code = "请输入验证码";
    if (values.password.length < 8) next.password = "密码至少需要 8 位";
    setErrors(next);
    if (Object.keys(next).length === 0) setSuccess(true);
  };

  return (
    <main className={`s7-auth-page theme-${theme.id}`}>
      <Link className="s7-auth-back" to={`/moodboards/${theme.id}`}>
        <Icon name="chevronLeft" />
        返回首页
      </Link>
      <AuthVisual theme={theme} />
      <section className="s7-auth-panel">
        <div className="s7-auth-panel-inner">
          <HunterMark />
          <div className="s7-auth-tabs" role="tablist" aria-label="登录或注册">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => setMode("login")}
            >
              登录
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => setMode("register")}
            >
              注册
            </button>
          </div>
          <header>
            <h1>
              {mode === "login" ? "继续你的猎头工作" : "创建 Hunter 工作空间"}
            </h1>
            <p>
              {mode === "login"
                ? "登录后继续查看业务主线、任务与待审核结果。"
                : "目前采用申请体验方式，注册后将进入资格审核。"}
            </p>
          </header>
          {state === "error" ? (
            <div className="s7-auth-alert is-error">
              <Icon name="warning" />
              账号或密码不正确，请检查后重试。
            </div>
          ) : null}
          {success ? (
            <div className="s7-auth-success">
              <span>
                <Icon name="check" size={26} />
              </span>
              <h2>{mode === "login" ? "登录成功" : "申请已提交"}</h2>
              <p>
                {mode === "login"
                  ? "正在进入 Hunter 工作台。"
                  : "审核结果将发送到你的手机号或邮箱。"}
              </p>
              <Link className="s7-button is-primary" to="/home">
                查看工作台原型 <Icon name="chevronRight" />
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {mode === "register" ? (
                <AuthField
                  label="姓名"
                  value={values.name}
                  onChange={update("name")}
                  placeholder="请输入真实姓名"
                  error={errors.name}
                  disabled={loading}
                />
              ) : null}
              <AuthField
                label="手机号或邮箱"
                value={values.account}
                onChange={update("account")}
                placeholder="用于登录和接收通知"
                error={errors.account}
                disabled={loading}
              />
              {mode === "register" ? (
                <AuthField
                  label="验证码"
                  value={values.code}
                  onChange={update("code")}
                  placeholder="请输入 6 位验证码"
                  error={errors.code}
                  disabled={loading}
                  action={
                    <button
                      type="button"
                      className="s7-field-action"
                      disabled={codeSent}
                      onClick={() => setCodeSent(true)}
                    >
                      {codeSent ? "已发送" : "获取验证码"}
                    </button>
                  }
                />
              ) : null}
              <AuthField
                label="密码"
                type="password"
                value={values.password}
                onChange={update("password")}
                placeholder={mode === "login" ? "请输入密码" : "至少 8 位"}
                error={errors.password}
                disabled={loading}
              />
              {mode === "login" ? (
                <div className="s7-auth-options">
                  <label>
                    <input type="checkbox" />
                    <span>
                      <Icon name="check" />
                    </span>
                    记住登录状态
                  </label>
                  <button type="button">忘记密码</button>
                </div>
              ) : (
                <label className="s7-auth-consent">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <Icon name="check" />
                  </span>
                  <p>我已阅读并同意《用户协议》和《隐私政策》</p>
                </label>
              )}
              <PublicButton
                type="submit"
                tone="primary"
                className={loading ? "is-loading" : ""}
                disabled={loading}
              >
                {loading ? "正在处理" : mode === "login" ? "登录" : "提交申请"}
              </PublicButton>
            </form>
          )}
          <footer>
            需要帮助？<button type="button">联系 Hunter</button>
          </footer>
        </div>
      </section>
    </main>
  );
}

export function OpsLoginPage() {
  const { themeId } = useParams();
  const theme = moodboards[themeId] || moodboards.orchestration;
  const [searchParams] = useSearchParams();
  const forcedState = searchParams.get("state");
  const [step, setStep] = useState(forcedState === "mfa" ? "mfa" : "login");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const disabled = forcedState === "disabled";

  const submit = (event) => {
    event.preventDefault();
    if (step === "login") {
      if (!account || !password) setError("请输入运营账号和密码");
      else {
        setError("");
        setStep("mfa");
      }
    } else if (code.length !== 6) setError("请输入 6 位动态验证码");
    else setStep("success");
  };

  return (
    <main className={`s7-auth-page s7-ops-login theme-${theme.id}`}>
      <Link className="s7-auth-back" to="/moodboards">
        <Icon name="chevronLeft" />
        返回设计方向
      </Link>
      <AuthVisual theme={theme} ops />
      <section className="s7-auth-panel">
        <div className="s7-auth-panel-inner">
          <HunterMark />
          <span className="s7-ops-label">
            <Icon name="shield" />
            Hunter 运营端
          </span>
          {step === "success" ? (
            <div className="s7-auth-success">
              <span>
                <Icon name="check" size={26} />
              </span>
              <h2>身份验证成功</h2>
              <p>正在进入运营工作空间。</p>
              <Link className="s7-button is-primary" to="/ops/overview">
                查看运营端原型 <Icon name="chevronRight" />
              </Link>
            </div>
          ) : (
            <>
              <header>
                <h1>{step === "mfa" ? "完成二次验证" : "运营人员登录"}</h1>
                <p>
                  {step === "mfa"
                    ? "验证码已发送到安全设备尾号 2071。"
                    : "使用已授权的运营账号访问系统。"}
                </p>
              </header>
              {disabled ? (
                <div className="s7-auth-alert is-error">
                  <Icon name="warning" />
                  该运营账号已停用，请联系管理员。
                </div>
              ) : error ? (
                <div className="s7-auth-alert is-error">
                  <Icon name="warning" />
                  {error}
                </div>
              ) : null}
              <form onSubmit={submit} noValidate>
                {step === "login" ? (
                  <>
                    <AuthField
                      label="运营账号"
                      value={account}
                      onChange={setAccount}
                      placeholder="name@hunter.cn"
                      disabled={disabled}
                    />
                    <AuthField
                      label="密码"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      placeholder="请输入密码"
                      disabled={disabled}
                    />
                  </>
                ) : (
                  <AuthField
                    label="动态验证码"
                    value={code}
                    onChange={setCode}
                    placeholder="请输入 6 位验证码"
                    error={error && code.length !== 6 ? error : ""}
                  />
                )}
                <PublicButton type="submit" tone="primary" disabled={disabled}>
                  {step === "mfa" ? "验证并进入" : "继续"}
                </PublicButton>
                {step === "mfa" ? (
                  <button
                    type="button"
                    className="s7-auth-secondary"
                    onClick={() => {
                      setStep("login");
                      setError("");
                    }}
                  >
                    返回账号登录
                  </button>
                ) : null}
              </form>
            </>
          )}
          <footer>访问将被记录并纳入安全审计。</footer>
        </div>
      </section>
    </main>
  );
}

export function MoodboardRoute() {
  const { themeId } = useParams();
  const theme = moodboards[themeId];
  const navigate = useNavigate();
  useEffect(() => {
    if (!theme) navigate("/moodboards", { replace: true });
  }, [navigate, theme]);
  return theme ? <ThemeHome theme={theme} /> : null;
}
