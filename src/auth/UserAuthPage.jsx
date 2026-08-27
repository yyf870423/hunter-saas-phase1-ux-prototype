import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { Icon } from "../components/Icon";
import { AuthBrand, AuthField, AuthStatus } from "./auth-components";
import "./auth.css";

const phonePattern = /^1[3-9]\d{9}$/;

export function UserAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [qrState, setQrState] = useState({ status: "idle", src: "" });
  const isRegister = mode.startsWith("register");
  const isWechat = mode === "wechat" || mode === "register-wechat";
  const authMethod = isWechat ? "wechat" : "phone";

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "登录 Hunter";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setTimeout(
      () => setCountdown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!isWechat || qrState.src) return undefined;
    let cancelled = false;
    setQrState({ status: "loading", src: "" });
    QRCode.toDataURL(
      "https://hunter.example/auth/wechat-demo?source=prototype",
      {
        width: 240,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#06193A", light: "#FFFFFF" },
      },
    )
      .then((src) => {
        if (!cancelled) setQrState({ status: "ready", src });
      })
      .catch(() => {
        if (!cancelled) setQrState({ status: "error", src: "" });
      });
    return () => {
      cancelled = true;
    };
  }, [isWechat, qrState.src]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setNotice("");
    setStatus("idle");
  };

  const handleAuthTabKeyDown = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const method =
      event.key === "ArrowLeft" || event.key === "Home" ? "phone" : "wechat";
    const nextMode = isRegister ? `register-${method}` : method;
    switchMode(nextMode);
    window.requestAnimationFrame(() => {
      document.getElementById(`auth-tab-${method}`)?.focus();
    });
  };

  const requestCode = () => {
    if (!phonePattern.test(phone)) {
      setErrors((current) => ({
        ...current,
        phone: "请输入有效的 11 位手机号",
      }));
      return;
    }
    setErrors((current) => ({ ...current, phone: "" }));
    setCountdown(60);
    setNotice("演示验证码已生成，请输入任意 4–6 位数字。未发送真实短信。 ");
  };

  const completeAuth = () => {
    setStatus("submitting");
    window.setTimeout(() => {
      setStatus("success");
      navigate("/home");
    }, 650);
  };

  const completeWechatAuth = () => {
    if (isRegister && !agreed) {
      setErrors({ agreed: "注册前需要同意服务条款与隐私说明" });
      return;
    }
    setErrors({});
    completeAuth();
  };

  const submitPhone = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!phonePattern.test(phone))
      nextErrors.phone = "请输入有效的 11 位手机号";
    if (!/^\d{4,6}$/.test(code)) nextErrors.code = "请输入 4–6 位数字验证码";
    if (isRegister && !name.trim()) nextErrors.name = "请输入你的姓名";
    if (isRegister && !agreed)
      nextErrors.agreed = "注册前需要同意服务条款与隐私说明";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) completeAuth();
  };

  return (
    <main className="auth-page auth-user-page">
      <AuthBrand />
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-panel-inner">
          {isRegister ? (
            <button
              type="button"
              className="auth-back"
              onClick={() => switchMode("phone")}
            >
              <Icon name="chevronLeft" /> 返回登录
            </button>
          ) : null}
          <div className="auth-heading">
            <span className="auth-kicker">
              {isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}
            </span>
            <h2 id="auth-title">
              {isRegister ? "注册 Hunter" : "登录 Hunter"}
            </h2>
            <p>
              {isRegister
                ? "创建账号后继续进入现有工作台。"
                : "选择一种方式回到你的业务主线。"}
            </p>
          </div>

          <div
            className="auth-tabs"
            role="tablist"
            aria-label={isRegister ? "注册方式" : "登录方式"}
            data-mode={authMethod}
          >
            <button
              id="auth-tab-phone"
              type="button"
              role="tab"
              aria-selected={authMethod === "phone"}
              aria-controls="auth-panel-phone"
              tabIndex={authMethod === "phone" ? 0 : -1}
              className={authMethod === "phone" ? "is-active" : ""}
              onClick={() =>
                switchMode(isRegister ? "register-phone" : "phone")
              }
              onKeyDown={handleAuthTabKeyDown}
            >
              <span className="auth-tab-icon">
                <Icon name="phone" />
              </span>
              <span className="auth-tab-copy">
                <strong>{isRegister ? "手机号注册" : "手机号登录"}</strong>
                <small>手机号 + 验证码</small>
              </span>
            </button>
            <button
              id="auth-tab-wechat"
              type="button"
              role="tab"
              aria-selected={authMethod === "wechat"}
              aria-controls="auth-panel-wechat"
              tabIndex={authMethod === "wechat" ? 0 : -1}
              className={authMethod === "wechat" ? "is-active" : ""}
              onClick={() =>
                switchMode(isRegister ? "register-wechat" : "wechat")
              }
              onKeyDown={handleAuthTabKeyDown}
            >
              <span className="auth-tab-icon">
                <Icon name="qrCode" />
              </span>
              <span className="auth-tab-copy">
                <strong>{isRegister ? "微信扫码注册" : "微信扫码"}</strong>
                <small>微信扫一扫</small>
              </span>
            </button>
          </div>

          {isWechat ? (
            <div
              className="auth-wechat"
              id="auth-panel-wechat"
              role="tabpanel"
              aria-labelledby="auth-tab-wechat"
            >
              <div
                className={`auth-qr ${qrState.status === "loading" ? "is-loading" : ""}`}
              >
                {qrState.src ? (
                  <img
                    src={qrState.src}
                    alt={`Hunter 微信${isRegister ? "注册" : "登录"}演示二维码`}
                  />
                ) : (
                  <Icon name="qrCode" size={54} />
                )}
                <span>演示二维码</span>
              </div>
              <h3>使用微信扫码{isRegister ? "注册" : "登录"}</h3>
              <p>
                打开微信扫一扫，在手机端确认后
                {isRegister ? "创建账号" : "继续"}。
              </p>
              {qrState.status === "error" ? (
                <AuthStatus tone="error">
                  二维码生成失败，请刷新页面重试。
                </AuthStatus>
              ) : null}
              <button
                type="button"
                className="auth-submit auth-ghost-submit"
                disabled={qrState.status !== "ready" || status === "submitting"}
                onClick={completeWechatAuth}
              >
                {status === "submitting"
                  ? "正在确认…"
                  : isRegister
                    ? "模拟已在手机确认并注册"
                    : "模拟已在手机确认"}
              </button>
              {isRegister ? (
                <label
                  className={`auth-consent auth-wechat-consent ${errors.agreed ? "has-error" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => {
                      setAgreed(event.target.checked);
                      setErrors((current) => ({ ...current, agreed: "" }));
                    }}
                  />
                  <span className="auth-checkbox">
                    <Icon name="check" size={13} />
                  </span>
                  <span>我已阅读并同意服务条款与隐私说明</span>
                  {errors.agreed ? (
                    <small role="alert">{errors.agreed}</small>
                  ) : null}
                </label>
              ) : null}
              <small className="auth-prototype-note">
                原型演示：未接入微信开放平台。
              </small>
            </div>
          ) : (
            <form
              className="auth-form"
              id="auth-panel-phone"
              role="tabpanel"
              aria-label={isRegister ? "注册表单" : "登录表单"}
              onSubmit={submitPhone}
              noValidate
            >
              {isRegister ? (
                <AuthField
                  id="auth-name"
                  label="姓名"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="如何称呼你"
                  error={errors.name}
                />
              ) : null}
              <AuthField
                id="auth-phone"
                label="手机号"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))
                }
                placeholder="请输入 11 位手机号"
                error={errors.phone}
              />
              <AuthField
                id="auth-code"
                label="验证码"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="4–6 位数字"
                error={errors.code}
                action={
                  <button
                    type="button"
                    className="auth-code-button"
                    disabled={countdown > 0}
                    onClick={requestCode}
                  >
                    {countdown > 0 ? `${countdown}s 后重试` : "获取验证码"}
                  </button>
                }
              />
              {notice ? <AuthStatus>{notice}</AuthStatus> : null}
              {isRegister ? (
                <label
                  className={`auth-consent ${errors.agreed ? "has-error" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                  />
                  <span className="auth-checkbox">
                    <Icon name="check" size={13} />
                  </span>
                  <span>我已阅读并同意服务条款与隐私说明</span>
                  {errors.agreed ? (
                    <small role="alert">{errors.agreed}</small>
                  ) : null}
                </label>
              ) : null}
              <button
                type="submit"
                className="auth-submit"
                disabled={status === "submitting"}
              >
                {status === "submitting"
                  ? "正在进入…"
                  : isRegister
                    ? "注册并进入 Hunter"
                    : "登录"}
                {status !== "submitting" ? <Icon name="chevronRight" /> : null}
              </button>
            </form>
          )}

          {!isRegister ? (
            <p className="auth-switch">
              还没有账号？{" "}
              <button
                type="button"
                onClick={() => switchMode("register-phone")}
              >
                注册账号
              </button>
            </p>
          ) : null}
          <p className="auth-disclosure">
            本页面为交互原型，不会发送短信或创建真实账号。
          </p>
        </div>
      </section>
    </main>
  );
}
