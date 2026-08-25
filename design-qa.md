# Hunter Landing / Auth 设计 QA

## 比较基准

- 源视觉真值：`.impeccable/mocks/decision/evidence-choreography-spine-theatre-v3-login.png`
- 最终首屏：`.impeccable/qa/landing-hero-feedback-fix-final.png`
- 最终源图并排比较：`.impeccable/qa/source-vs-implementation-feedback-final.jpg`
- 移动证据：`.impeccable/qa/landing-mobile-feedback-fix.png`、`.impeccable/qa/landing-mobile-final-title.png`
- 认证证据：`.impeccable/qa/user-login-desktop.png`、`.impeccable/qa/user-login-wechat.png`、`.impeccable/qa/ops-login-desktop.png`

## 归一化与状态

- 源图：1536 × 1024，RGB，1×。
- 浏览器 CSS viewport：1536 × 1024；in-app Browser 内容截图为 1526 × 1017。
- 并排比较时将源图等比归一化为 1526 × 1017，避免把浏览器内容边界误判为设计偏移。
- 比较状态：浅色 Landing 首屏。Hero 每 2.8 秒推进活动证据片，所以激活片可与源图不同；五阶段顺序和空间拓扑保持一致。

## 必查表面

- 字体与标题：中文导航、标题与正文统一使用 Noto Sans SC Variable；Familjen Grotesk 只负责英文和数字。1440px 桌面导航实测 14px / 620 / 1.4 / `0.01em`，Hero 实测 49.68px / 830 / 1.06；固定为两条完整语义行。区块标题统一为 40–48px，移动端统一为 28–32px。320、390、1440、1536px 均无标题裁切、孤字或标点孤行。
- Hero 构图：桌面五张证据片的 transform 后边界全部落在证据舞台内；移动端只显示一张完整活动证据片。首屏页面无横向溢出。
- 信息密度：按最新评审移除定位比较整段；找人渠道后直接进入最终 CTA，不以另一组解释内容重复产品主张。
- 动效：Hero 证据轮播、轨道脉冲、机制扫描和区块进入均可见；`prefers-reduced-motion` 停止自动推进并把 CSS 动画压缩为单次状态更新。
- 无障碍：导航、Tabs、Dialog、表单均使用语义控件；演示 Dialog 支持焦点圈定、Escape 关闭和关闭后焦点恢复。
- 认证边界：首页与用户认证均无运营登录入口；手机号、二维码和注册均标注为前端演示。运营登录只存在于独立 `#/ops/login`。
- 浏览器状态：最终桌面首屏控制台 0 条 error / warn；1536px 和 320px 页面均无横向溢出。

## Findings 与修复历史

### Pass 1 — blocked

- [P2] 移动端隐藏“下一步”证据片但仍轮播第 5 阶段，产生空档。
  - 修复：compact hero 只循环四个移动端可见阶段。
- [P2] 验证码按钮位于字段 label 内，可访问名称合并。
  - 修复：label、输入容器和 action 按钮拆分。

### Pass 2 — blocked

- [P2] 桌面 Hero 标题被自动排成四行，偏离源图的两行语义结构。
  - 修复：标题改为作者声明的语义行，并建立桌面 / 移动字号、字重、行高和孤行标准。
- [P2] 演示 Dialog 没有焦点圈定与关闭后焦点恢复。
  - 修复：实现 Tab / Shift+Tab 焦点循环、Escape 关闭和 opener restore。

### Pass 3 — blocked（用户反馈）

- [P2] Hero 第一组视觉左右存在裁切风险。
  - 修复：重新分配五张证据片的宽度和位置；最终实测每张 transform 后边界均完整落在舞台内。
- [P2] 标题偏大且出现不合语义的换行。
  - 修复：Hero 桌面字号收敛为 `clamp(3.15rem, 3.8vw, 3.85rem)`；所有营销标题使用显式语义行，移动端再用语义子行适配 320px。
- [P2] 对比区仍像表格，页面动势不足。
  - 修复：宽表替换为动态比较舞台；维度自动轮播，三方案沿信号轨迹错位抬升，并提供暂停控制；主要区块增加一次性进入动效。

### Pass 4 — passed

- 源图与最终首屏并排检查：标题尺度、两行结构、五阶段完整性、颜色与首屏阅读顺序一致，无新的 P0 / P1 / P2 差异。
- 1536 × 1024、390 × 844 与 320 × 760 均完成浏览器测量；首屏证据片、标题和页面宽度无裁切或溢出。
- `npm run build` 通过。
- 全仓库 Playwright：171 passed；最终 Landing 定向回归：10 passed；最后的标题 / 比较 / 窄屏视觉收敛：3 passed。
- Impeccable detector 在缺失 HTML parser modules 时进入 regex degraded mode；已修复唯一直接命中的 `side-tab` 反模式。剩余 152 条是该降级模式对既有详细字号、色阶和圆角字面量的设计系统记录提示，不能执行 selector / computed contrast 判断；最终结论以并排视觉、浏览器测量、控制台和 E2E 为准。

### Pass 5 — passed（产品主叙事与全页字体收敛）

- 飞书阶段一目录 00—12 与产品计划确认：首页首要用户收敛为独立猎头 / 资深顾问，核心叙事改为围绕岗位跨渠道找人、统一身份、去重补证和匹配，再把候选池交给猎头判断。
- 顶部导航由临时继承字重改为明确的 Navigation 角色；标题、导语、正文、按钮、标签 / 编号同步建立五类文字职责，降低大标题尺度并统一中英文回退。
- 1440 × 1000 实测五张 Hero 证据片全部落在舞台边界内；390 × 844 与 320 × 760 页面、Hero 和全部语义标题无横向溢出。
- 比较区缩短空舞台并补足找人维度内容；桌面三张方案卡和移动纵向方案卡均无内容溢出。
- `npm run build` 通过；Landing / Auth 定向 Playwright 回归 11 / 11 通过。

### Pass 6 — passed（移除冗余定位比较）

- 找人渠道后的定位比较区块、场景区跳转入口、组件、数据、样式和动画状态全部移除。
- 找人渠道现在直接进入最终 CTA，页面叙事更短，不再重复解释 ATS / 通用 AI 的差异。
- 1440 × 1000 与 390 × 844 实测区块无间隙衔接，页面无横向溢出；`npm run build`、格式检查与 Landing / Auth 定向 Playwright 10 / 10 通过。

### Pass 7 — passed（末尾区块对比度）

- 最终 CTA 从浅色纸面改为深海军蓝转化区，与前一段浅色找人渠道建立清晰边界；原有硬边斜带收敛为两端消隐的细光轨与柔和移动辉光，不增加新内容。
- CTA 正文与次要入口改为深色表面的同色系高对比文字，主按钮仍保持 Hunter Blue 的唯一主动作层级。

### Pass 8 — passed（认证方式切换）

- 手机号与微信切换从灰底分段控件改为认证方式轨道：方形图标节点、主副标签和蓝青活动滑轨共同表达选中状态。
- 补齐 hover、focus-visible、方向键切换、roving tabindex 与 reduced-motion；桌面和移动端两种方式均完整可读。

### Pass 9 — passed（认证品牌标题）

- “继续推进，而不是重新开始。”由最高 76px、桌面三行收敛为中文专用 40–52px 字阶与两条固定语义行；行高调整为 1.08，字距回到 `-0.03em`。
- 900px 以下使用 36px，520px 以下使用 30px；1440、1040、390、320px 均不得出现额外换行或水平裁切。

## Implementation Checklist

- [x] 首屏五张证据片完整入框。
- [x] Hero 与区块标题建立语义换行和响应式字号标准。
- [x] 冗余定位比较区及相关入口、状态和样式已移除。
- [x] Landing、用户登录 / 注册与独立运营登录交互可用。
- [x] Landing 与用户认证页没有运营登录入口。
- [x] 桌面、移动、错误态、键盘焦点、动态和 reduced motion 已验证。

## Follow-up Polish

- [P3] Vite 仍提示主 bundle 大于 500kB。它来自原型全阶段共包，不影响本轮视觉和交互验收；正式产品化时应按阶段路由做 code splitting。

final result: passed
