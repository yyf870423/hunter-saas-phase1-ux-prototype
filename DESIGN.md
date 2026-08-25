---
name: Hunter Landing & Auth
description: 光学证据编舞驱动的 Hunter 公开首页与认证界面视觉系统
colors:
  paper: "#f7f8f5"
  paper-bright: "#ffffff"
  paper-blue: "#eef8ff"
  registry-navy: "#06193a"
  registry-navy-soft: "#0d2c58"
  hunter-blue: "#0070f7"
  hunter-blue-deep: "#005fd6"
  signal-cyan: "#00c8ff"
  photon-mist: "#ddf7ff"
  judgment-amber: "#ffb000"
  judgment-amber-soft: "#fff3d1"
  carbon: "#171717"
  muted: "#596273"
  rule: "#d9dee7"
  rule-strong: "#bcc6d5"
  success: "#087a55"
  danger: "#b4232c"
typography:
  landing-display:
    fontFamily: "Noto Sans SC Variable, Noto Sans SC, sans-serif"
    fontSize: "clamp(3rem, 3.45vw, 3.55rem)"
    fontWeight: 830
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  section-display:
    fontFamily: "Noto Sans SC Variable, Noto Sans SC, sans-serif"
    fontSize: "clamp(2.5rem, 2.9vw, 3rem)"
    fontWeight: 790
    lineHeight: 1.1
    letterSpacing: "-0.032em"
  navigation:
    fontFamily: "Noto Sans SC Variable, Noto Sans SC, sans-serif"
    fontSize: "14px"
    fontWeight: 620
    lineHeight: 1.4
    letterSpacing: "0.01em"
  auth-display:
    fontFamily: "Noto Sans SC Variable, Noto Sans SC, sans-serif"
    fontSize: "clamp(40px, 3.4vw, 52px)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Noto Sans SC Variable, Noto Sans SC, sans-serif"
    fontSize: "16px"
    fontWeight: 450
    lineHeight: 1.75
  utility:
    fontFamily: "Familjen Grotesk Variable, Noto Sans SC Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.04em"
  type-ramp:
    micro: "11px"
    caption: "12px"
    label: "13px"
    navigation: "14px"
    small-body: "15px"
    body: "16px"
    large-body: "18px"
rounded:
  sharp: "0px"
  evidence: "5px"
  control: "6px"
  feature: "10px"
  pill: "999px"
components:
  landing-button-primary:
    backgroundColor: "{colors.hunter-blue}"
    textColor: "{colors.paper-bright}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  auth-submit:
    backgroundColor: "{colors.hunter-blue}"
    textColor: "{colors.paper-bright}"
    rounded: "{rounded.sharp}"
    padding: "0 16px"
    height: "54px"
    width: "100%"
  evidence-sheet:
    backgroundColor: "rgba(255, 255, 255, 0.86)"
    textColor: "{colors.registry-navy}"
    rounded: "{rounded.evidence}"
    padding: "38px 24px 24px"
    width: "180px"
  ops-auth-card:
    backgroundColor: "rgba(255, 255, 255, 0.96)"
    textColor: "{colors.registry-navy}"
    rounded: "{rounded.sharp}"
    padding: "44px"
    width: "440px"
---

# Design System: Hunter Landing & Auth

<!-- impeccable:design-schema 1 -->

## Overview

**Creative North Star: “光学证据编舞（Optical Evidence Choreography）”**

Hunter 的公开首页是一张正在运行的业务证据台：目标、研究、证据、人工判断与下一步沿同一条轨道进入、对齐、刹停和离场。视觉来源是并购尽调案卷的索引秩序与舞台机械的精确调度，气质必须笃定、专业、透明；科技感来自真实状态变化，而不是通用 AI 的蓝紫渐变或装饰性霓虹。

用户认证页延续相同的海军蓝、信号青、判断琥珀、测量网格与轨道语法，但收敛为操作界面。用户登录 / 注册页以深色品牌舞台和浅色表单面板组成；独立运营登录页则是浅色网格上的单一无圆角工作卡。三类公开界面共享识别，不共享布局组件，也不把营销尺度带进现有工作台。

**Key Characteristics:**

- 浅色纸张是默认地面，海军蓝承担结构，亮蓝 / 信号青表示系统推进，琥珀只表示需要人的判断。
- 不使用圆角卡片墙；通过装订线、裁切、叠片、局部透光与少量结构阴影建立层次。
- 轨道、扫描、景深位移和琥珀刹停点共同表达“系统正在运行”。
- Landing、用户认证和运营认证各自隔离样式命名空间；共同复用字体、色彩语义和 `Icon`。
- 所有认证、验证码、微信扫码、演示申请与运营校验均是前端原型，不代表真实后端已接入。

## Colors

这是一套“暖纸面 + 冷运行信号 + 暖人工判断”的受控配色；蓝—青光谱只沿推进轨道、活动状态和焦点出现。

### Primary

- **Hunter Blue**：主 CTA、活动标签、当前轨迹、选中状态和输入焦点。
- **Registry Navy**：导航、标题、证据骨架、深色机制区与用户认证品牌舞台。

### Secondary

- **Signal Cyan**：扫描束、运行脉冲、精密网格与 `focus-visible`；不充当第二种通用按钮色。
- **Photon Mist / Paper Blue**：只用于证据折射和轻量信息反馈。

### Tertiary

- **Judgment Amber**：人工判断证据片、人工闸门与刹停标记。它不表示普通警告，也不用于装饰性强调。
- **Success / Danger**：分别用于真实界面状态中的成功确认和字段错误，不替代文字说明。

### Neutral

- **Paper / Paper Bright**：页面底、表单面板和证明窗口的主要承载面。
- **Carbon / Muted**：高对比正文与次要说明。
- **Rule / Rule Strong**：索引线、表格分隔、输入边界和卡片装订线。

大面积页面背景不得使用单一纯色平铺。浅色区块以 Paper / Paper Bright 为底，叠加低对比度的 Paper Blue 光学冷光；只有靠近人工判断语义的区域才允许出现极淡的 Judgment Amber 反射。深色区块以 Registry Navy 为底做同色系明度过渡，蓝青只形成推进方向，不使用独立渐变球、满版网格或装饰性玻璃效果。最终 CTA 使用深海军蓝收束长页，与前一段浅色找人渠道形成明确的转化边界。

**The Semantic Spectrum Rule.** 亮蓝与信号青只表示系统推进或交互焦点；琥珀只表示人工判断。颜色之外必须同时存在文字、图标或结构状态。

**The Restrained Atmosphere Rule.** 背景层次必须是大尺度、低饱和、无清晰边界的纸面与光学反射；它只解释空间和业务方向，不制造新的视觉主体。

## Typography

**Display Font:** Noto Sans SC Variable（中文营销标题）  
**Auth Display / Utility Font:** Familjen Grotesk Variable，中文回退到 Noto Sans SC Variable  
**Body Font:** Noto Sans SC Variable

**Character:** Landing 以 Noto Sans SC 的重字重和紧字距形成直接、有压强的中文论点；Familjen Grotesk 为 HUNTER 字标、英文 kicker、编号和索引提供编辑部式精度。认证页允许 Familjen Grotesk 主导中英混排标题，使操作界面更紧凑，但正文始终回到 Noto Sans SC。

### Hierarchy

- **Landing Display**：桌面 Hero 为 48–57px、830 字重、1.06 行高，固定为两条完整语义行；移动端为约 31–37px，仍保持相同两行。不得让标点或不足三个汉字单独成行。
- **Section Headline**：桌面统一为 40–48px、790 字重、1.10 行高，使用作者明确声明的 2–3 条语义行；移动端统一为约 28–32px。每条语义行默认 `nowrap`，尺寸必须先适配容器，不能交给浏览器随机制造孤行。
- **Auth Display**：用户认证品牌文案固定为两条完整语义行，桌面 40–52px、移动端 30–36px；登录标题次之，运营登录标题收敛到 34px，避免营销感压过任务。
- **Navigation / Action**：桌面导航和登录固定为 14px、620 字重、1.4 行高和 `0.01em` 字距；主按钮为 16px、650 字重。中文导航必须使用 Noto Sans SC，不使用英文字体强行承担中文笔形。
- **Body**：15–18px 为主要阅读区间，默认正文 16px / 450 字重，首屏与区块导语 18px，长段落使用约 1.7–1.8 行高。
- **Label / Utility / Index**：11–13px、620–760 字重，服务于英文 kicker、演示数据、阶段编号和状态；Familjen Grotesk 只负责英文与数字，中文逐字回退到 Noto Sans SC。

**The Two-Typeface Rule.** 当前实现只加载 Familjen Grotesk Variable 与 Noto Sans SC Variable；不要引入未加载的等宽字体或用等宽排版把界面做成终端。

**The Text Role Rule.** 全页只使用 Display、Section Headline、Navigation / Action、Body、Label / Utility 五类文字职责。相同职责必须共享字号、字重、字距和行高；不能因区块不同临时改变导航、正文或标签的字体气质。

**The Semantic Line Rule.** 营销标题的换行是内容的一部分。Hero 固定两行，区块标题固定 2–3 行；禁止出现“回事。”、“前。”之类由两个字与标点组成的孤行。新增标题必须先声明语义行，再从 320px、390px、1040px、1536px 四个宽度反推字号。

## Layout

Landing 使用最大 1536px 的页级画布和最大 1344px 的内容容器。Hero 是左侧稳定论点与右侧运动证据带的非对称双栏；后续区块沿同一业务主线展开，以列表、证据窗口、人工闸门和场景轨道替代均匀功能卡片阵列。深海军蓝只用于机制区和最终 CTA：前者建立结构反差，后者明确结束叙事并聚焦转化。

响应式不是等比缩小：

- 1240px 以下收紧页边距和证据片宽度。
- 1040px 以下隐藏桌面导航与头部 CTA，改用移动菜单；Hero 变单列，四步说明变两列，主要双栏标题与内容区变单列。
- 720px 以下使用 20px 侧边距、66px 顶栏和堆叠 CTA。斜向轨道可以越出舞台，但一次只展示一张完整、居中的活动证据片；隐藏离场的第五阶段，只循环四个可见阶段。机制和工作流标签转为可横向滚动的窄轨，系统 / 人工控制改为纵向排列。
- Modal 在移动端占满视口并归零圆角。
- 用户认证在 900px 以下由深浅双栏变为纵向布局，品牌舞台缩为 260px；520px 以下进一步缩为 220px。运营认证始终保持单一居中卡，移动端只收紧卡片内边距。

**The Stable Reading Order Rule.** 光轨和速度残影可以越出容器，证据片可以叠压但必须完整入框；标题、说明、主动作与状态反馈的阅读顺序必须稳定。

## Elevation & Depth

系统以平面结构为主，深度由透光叠片、透视变换、裁切线、局部渐变和 1px 规则线建立。证据片、真实寻访窗口、二维码、Modal 与运营登录卡允许低扩散结构阴影，以区分层级或浮层；普通内容区和场景列表不使用悬浮卡片阴影。Landing 的证据片使用轻微背板模糊与景深，用户认证品牌舞台使用深色测量网格，运营认证使用更安静的浅色网格。

**The Structural Shadow Rule.** 阴影只解释重叠、浮层或任务焦点，不用于把每个区块包装成可悬浮的圆角卡。

## Shapes

矩形与细线是默认形状。认证 Tab、输入、状态条、运营登录卡和大多数内容分区保持直角；Landing 证据片使用 5px 微圆角，按钮和表单控件使用 6px，证明窗口、最终 CTA 面板与桌面 Modal 使用 10px。圆形只用于轨道节点、状态点、图标容器、人工闸门轨道和成功标记等具有明确语义的小元素。

证据片通过索引签、裁切角、1px 描边、不同高度和透视角度形成“案卷”而非“卡片”。真实产品 UI 只能作为工作流证明窗口里的局部内容，不能变成 Landing 的首屏骨架。

**The No Card Wall Rule.** 不把内容组织为一组同尺寸、同圆角、同阴影的卡片；优先使用连续轨道、列表分隔、证据叠片和整块结构面。

## Components

### Buttons and links

- Landing 主按钮高 52px、6px 圆角；头部紧凑版高 44px，大号 CTA 高 58px。Hover 向上 2px、图标向前 3px，Active 回到原位。
- Landing 次动作是无容器文字链接，以底线和图标位移反馈，不与主 CTA 争夺层级。
- 认证提交按钮高 54px、无圆角、全宽；验证码按钮是嵌入输入框的浅蓝功能区。Disabled 降低不透明度，并保留明确的等待或不可用文案。
- 所有链接、按钮与字段使用信号青 2px 可见焦点；不能依赖 hover 才暴露必要信息。

### Evidence rail and motion grammar

- **光学轨道**：海军蓝斜向轨道承载一束信号青扫描脉冲和同向残影；Hero 与最终 CTA 重复这一视觉签名。
- **证据片**：目标、研究、证据、人工判断、下一步具有不同位置、深度和姿态。活动证据片以 620ms 的有重量位移对齐，并触发一次 1.4s 的片内扫描。
- **人工刹停**：琥珀证据片和 `HumanGate` 是稳定、可读的判断阈值；不通过无语义闪烁制造紧迫感。
- **节奏**：Hero 默认每 2.8s 推进一个活动阶段；轨道脉冲约 3.2s，机制扫描和闸门轨道约 4.8s。按钮、Tab 和展开状态使用更短的 160–520ms 反馈。
- **滚动入场**：主要区块在进入视口时完成一次 760ms 上移对齐，不循环、不遮蔽正文；reduced motion 下直接显示。

### Proof and control surfaces

- **Workflow proof**：顶部明确标注“演示数据”，左侧阶段索引驱动右侧证据详情；人工阶段切换为浅琥珀背景并显示“对外动作受限”。
- **Mechanism workspace / Scenario rail**：机制与场景使用连续规则线和阶段切换，不使用宽表格或等高卡片阵列。
- **Demo dialog**：桌面是 10px 圆角白色浮层，移动端是全屏直角面板；字段错误、提交中和本地成功状态均有明确文字。打开后焦点进入首字段，Tab 在浮层内循环，关闭后焦点回到触发按钮。

### Authentication surfaces

- **User auth**：深海军蓝品牌舞台与浅色操作面板对分；手机号登录、微信扫码与注册共用 `AuthField`、`AuthStatus` 和提交按钮。微信二维码必须标注“演示二维码”。
- **Auth method switch**：手机号与微信不使用灰底分段控件；两种方式沿同一条细规则线并列，以方形图标节点、方式说明和蓝青活动滑轨表达当前选择。支持方向键切换，移动端保持两项完整可读。
- **Ops auth**：仅能通过独立 `/ops/login` 路由访问；使用浅色测量网格、无圆角白卡和紧凑内部访问文案。Landing 与用户认证页不提供运营入口。
- **Shared / isolated boundary**：两个认证页共享 `auth.css`、`.auth-page` token、`AuthBrand`、`AuthField`、`AuthStatus` 和 `Icon`；Landing 只与它们共享字体、色彩语义和 `Icon`，组件与样式通过 `lp-*` / `auth-*` 前缀隔离。现有工作台继续使用自己的设计系统。
- **Prototype disclosure**：短信验证码仅接受演示输入并倒计时，微信只生成本地演示二维码，用户认证完成后仅导航到 `/home`；运营登录只做非空校验后导航到 `/ops/overview`。界面不得暗示真实短信、微信开放平台、账号创建、凭证验证或销售系统写入已发生。

### Reduced motion

`prefers-reduced-motion: reduce` 下，Landing 停止 Hero 自动轮播，将平滑滚动改为即时跳转，并把动画与过渡压缩为单次 1ms 状态更新；Auth 停止轨道扫描和二维码 loading 脉冲，同时取消提交按钮位移动画。静态颜色、文字、描边、选中态与人工判断状态必须继续完整表达信息。

## Do's and Don'ts

### Do:

- **Do** 让光、位移和颜色始终对应目标推进、证据对齐、人工判断或交互焦点。
- **Do** 在 Landing 的工作流证明、演示申请和全部认证路径中持续显示“演示 / 原型 / 本地记录”边界。
- **Do** 保持公共 Landing、用户认证、运营认证与现有工作台的组件和样式边界，只共享已经实现的字体、语义色和图标。
- **Do** 在桌面与移动端同时维护清晰阅读顺序、可见焦点、文字状态和局部滚动边界。

### Don't:

- **Don't** 使用通用 AI 蓝紫渐变、黑色赛博控制台、漂浮粒子、持续呼吸光晕或亲和型 HR 插画。
- **Don't** 退化为居中 Hero + 产品截图，或同尺寸圆角功能卡片墙。
- **Don't** 把琥珀用于普通强调，或让青色扫描脱离业务轨道成为装饰。
- **Don't** 虚构客户 Logo、证言、商业指标、价格、认证、真实外部发送或任何已接入认证后端。
- **Don't** 从 Landing 或用户认证页暴露运营登录入口。
