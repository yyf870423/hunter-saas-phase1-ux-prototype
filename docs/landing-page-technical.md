# Hunter 首页技术方案

> 状态：已批准进入实现。

## 1. 集成方式

- 复用当前 React 19、React Router 7、Vite 7 工程，不创建第二套应用。
- 将 `/` 从重定向改为独立 `LandingPage`，新增 `/login` 与 `/ops/login`；现有 `/review`、`/home`、`/ops/overview` 和业务路由保持不变。
- 新增 `src/landing/`：薄页面壳、公共营销组件、数据配置与独立样式。
- 新增 `src/auth/`：两个薄认证页面与共享认证组件 / 样式。
- 复用 `src/components/Icon.jsx` 的产品级图标映射；仅新增 `qrcode` 运行时依赖生成可扫描的演示二维码。

## 2. 文件边界

```text
src/landing/
  LandingPage.jsx       # 页面壳、区块组合与顶层状态
  landing-components.jsx# 导航、证据轨道、工作流、Modal 等组件
  landing-data.js       # 文案、阶段、场景和演示数据
  landing.css           # 设计 token、布局、动效与响应式规则
src/auth/
  UserAuthPage.jsx      # 手机号登录、微信扫码与注册
  OpsLoginPage.jsx      # 独立运营用户名密码登录
  auth.css              # 认证页共享 token、布局、控件与状态
```

`src/App.jsx` 只声明 `/`、`/login`、`/ops/login` 路由；不复制页面组件实现。

## 3. 状态模型

- `activeHeroStage`：Hero 当前证据阶段；自动轮播或用户选择。
- `activeWorkflowStage`：真实工作流展示阶段。
- `mobileMenuOpen`：移动导航菜单状态。
- `demoOpen`：演示申请 Modal。
- `demoStatus`：idle / submitting / success。
- `demoErrors`：字段级错误对象。
- `authMode`：phone / wechat / register。
- `authStatus`：idle / submitting / success。
- `codeCountdown`：验证码按钮倒计时；不调用真实短信接口。

## 4. 动效实现

- 光学轨道、扫描脉冲和速度残影使用 CSS transform / opacity；不使用持续 JS 布局计算。
- 证据片以 transform 和 z-index 建立景深；只动画 transform 与 opacity。
- `IntersectionObserver` 添加区块一次性进入状态；内容默认可见，未加载 JS 时仍可阅读。
- 桌面证据片按舞台宽度重新排布并完整入框；移动端非活动片使用 opacity / visibility 退出，只保留完整居中的活动片。
- `prefers-reduced-motion: reduce` 取消自动轮播、滚动过渡和循环脉冲。

## 5. 表单与导航

- 演示申请只在前端模拟提交，750ms 后进入本地成功状态。
- 字段：姓名、公司 / 团队、工作邮箱或手机号、团队规模、希望解决的问题。
- 校验：姓名、公司、联系方式必填；联系方式必须匹配邮箱或中国大陆手机号的基本格式。
- 首页登录使用 React Router `Link` 指向 `/login`。
- 手机号登录 / 注册使用基本大陆手机号和验证码非空校验，模拟成功后进入 `/home`。
- 微信二维码由 `qrcode` 生成演示 Data URL，页面明确标注“演示二维码”；模拟确认后进入 `/home`。
- 运营登录页 `/ops/login` 仅校验用户名、密码非空，模拟成功后进入 `/ops/overview`；不从首页或用户登录页链接到该路由。
- 查看工作流使用 `Link` 指向 `/workstreams/position-vla`。
- 页面导航使用 `scrollIntoView`，避免 HashRouter 与原生锚点冲突。

## 6. 样式与组件复用

- 页面 token 从 `DESIGN.md` 派生，并以 `--lp-*` 变量隔离，避免污染现有产品页。
- 可见控件统一使用营销组件状态；不显示浏览器默认 button / select 样式。
- 圆角、线重与色彩语义延续 Hunter；营销尺度与动效只在 landing page 范围内扩展。

## 7. 验证

- `npm run build`。
- 新增 Playwright 路由 / 交互测试：根路由、用户认证模式与校验、独立运营登录、真实工作流、Modal 校验和成功状态。
- 浏览器检查桌面 1536 × 1024 与移动 390 × 844。
- 与获批 comp 并排进行 Hero 视觉比较。
- 运行 Impeccable detector 和 Product Design design QA，直到报告为 `final result: passed`。
