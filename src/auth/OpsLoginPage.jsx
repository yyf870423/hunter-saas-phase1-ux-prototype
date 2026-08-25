import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { AuthBrand, AuthField, AuthStatus } from "./auth-components";
import "./auth.css";

export function OpsLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Hunter 运营登录";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!username.trim()) nextErrors.username = "请输入用户名";
    if (!password) nextErrors.password = "请输入密码";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    window.setTimeout(() => navigate("/ops/overview"), 650);
  };

  return (
    <main className="auth-page auth-ops-page">
      <div className="auth-ops-brand">
        <AuthBrand compact />
      </div>
      <section className="auth-ops-card" aria-labelledby="ops-auth-title">
        <span className="auth-ops-mark">
          <Icon name="shield" size={22} />
        </span>
        <div className="auth-heading">
          <span className="auth-kicker">OPERATIONS ACCESS</span>
          <h1 id="ops-auth-title">Hunter 运营后台</h1>
          <p>仅供内部运营人员访问。</p>
        </div>
        <form className="auth-form" onSubmit={submit} noValidate>
          <AuthField
            id="ops-username"
            label="用户名"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="请输入运营用户名"
            error={errors.username}
          />
          <AuthField
            id="ops-password"
            label="密码"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入密码"
            error={errors.password}
          />
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "正在验证…" : "登录运营后台"}
            {!submitting ? <Icon name="chevronRight" /> : null}
          </button>
        </form>
        <AuthStatus>
          原型演示：填写任意用户名和密码即可进入现有运营页面。
        </AuthStatus>
      </section>
    </main>
  );
}
