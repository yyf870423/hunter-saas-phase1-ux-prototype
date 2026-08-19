# Hunter SaaS 阶段一 UX 原型

这是重新建立的 Hunter SaaS 高保真交互原型仓库。它不继承上一版原型页面、路由、Mock 业务过程或状态，只允许复用经过验证的底层 SVG 和公共组件能力。

当前开放：

1. **原型阶段一：全局框架与工作台**，已经通过人类审批并冻结。
2. **原型阶段二：自动化通用交互框架**，已经实现并完成自动化验证，等待人类审批。

在线原型：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/review>

## 当前入口

- 阶段审核入口：`#/review`
- 业务主线渐进演示：`#/workstreams/position-vla`
- 新建业务主线：`#/workstreams/new`
- 支线任务：`#/tasks`
- 支线任务详情：`#/tasks/task-hand-team`
- 信号中心：`#/signals`
- 阶段一审核入口：`#/review/stage-1`
- 工作台：`#/home`
- 工作台加载态：`#/home?state=loading`
- 工作台空状态：`#/home?state=empty`
- 工作台局部错误态：`#/home?state=error`
- 工作台权限受限态：`#/home?state=limited`
- 阶段一公共组件：`#/components`

四类业务主线完整剧本、业务资产、设置与运营端将在对应阶段获得人类审批后逐步开放。

## 本地运行

```bash
npm install
npm run dev
```

## 验证

```bash
npm run build
npm run test:e2e
```

E2E 覆盖桌面、iPad、iPhone、亮暗主题、导航、搜索、通知、浮层、工作台、业务主线、候选人审核、支线任务、信号处理、异常恢复、控制台错误和页面级横向溢出。

## 工程结构

- `src/components/Icon.jsx`：允许复用的统一 SVG 组件。
- `src/stage1/data.js`：本轮重新建立的阶段一 Mock 数据。
- `src/stage1/ui.jsx`：本轮公共 UI 组件。
- `src/stage1/Stage1Shell.jsx`：全局框架与导航。
- `src/stage1/Dashboard.jsx`：工作台及必要状态。
- `src/stage1/stage1.css`：WorkBuddy × Vercel 设计 Token、组件和响应式规则。
- `src/stage2/`：自动化工作区、候选人审核、支线任务和信号中心。
- `docs/stage-1-plan.md`：阶段一实施与审批边界。
- `docs/stage-1-interaction-coverage.md`：交互覆盖清单。
- `docs/stage-1-design-system.md`：阶段一公共设计系统。
- `docs/stage-2-plan.md`：阶段二实施、状态和审批边界。
- `docs/stage-2-interaction-coverage.md`：阶段二交互覆盖清单。
- `docs/stage-2-design-system-extension.md`：阶段二公共组件扩展。
