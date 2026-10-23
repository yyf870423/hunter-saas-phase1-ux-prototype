# 铂寻官网 SEO 与 GEO · 计划与决策记录

范围：www.boseekai.com（官网第三版 `public/landing-origin/`，中英文）。
做法：每一步先讨论、定下来记在这里，再实施。问题逐个确认，攒够一个阶段再汇总确认后执行。

## 已定

### 1. 市场优先级（2026-10-23）
- 中国市场优先：百度、微信搜一搜等国内搜索，以及豆包、DeepSeek、元宝、千问、Kimi、夸克等国产 AI。
- 英文版一起优化（Google、Bing，以及 ChatGPT、Perplexity、Claude 等），但排在中文之后。

### 2. 爬虫策略（2026-10-23）
- 搜索引擎爬虫全部放行。
- AI 公司的爬虫全部放行，包括联网搜索用的和训练用的。

### 3. 站外账号（2026-10-23）
- 公众号、知乎、领英等公司账号目前都没有，需要从零注册。
- 先集中做好 SEO（官网本身）；站外 GEO 平台在公司账号注册后再做。

### 4. 第一阶段问题的答复（2026-10-23）
| # | 问题 | 答复 |
|---|---|---|
| 1 | 目标用户 | 独立猎头和资深顾问为主，猎头公司团队为辅，不专门面向企业 HR |
| 2 | 品类词 | 主词“猎头 AI 助手 / AI 猎头工具”；次词“人才地图 / 人才寻访工具”。不做“猎头软件 / 猎头系统”“猎头 BD” |
| 3 | 品牌名 | 公司“铂寻 Boseek”，产品“HunterBuddy”，不另起中文名 |
| 4 | 对比对象 | 通用 AI（豆包、DeepSeek、ChatGPT）、招聘平台（猎聘、领英、脉脉）、猎头管理系统（CRM、ATS）；只讲各自适合做什么，不贬低 |
| 5 | 公开的公司信息 | 只公开成立时间和城市：北京，2026 年成立。团队背景、开放时间、价格暂不公开 |
| 6 | 联系方式 | 商务邮箱 hello@boseekai.com；邮箱开通后再放上官网（开通单独作为一项任务） |
| 7 | 英文网址 | 独立路径 www.boseekai.com/en/，静态英文页面；旧的 ?lang=en 跳转过去 |
| 8 | 短片文字稿 | 不加。短片内容页面上基本都有，只补视频结构化数据 |
| 9 | 分享图 | 新做 1200×630 分享图，不用首屏云海；具体用什么另行商量 |
| 10 | 站长工具 | 百度、Google、Bing 已由用户注册；网站所有权还没验证，验证文件或代码由用户提供，放进仓库随第一阶段部署 |
| 11 | 一句话介绍 | 保持“猎头的 AI 工作伙伴”，关键词只放在标题和描述里 |
| 12 | 首页标题与描述（中文） | 标题：HunterBuddy · 猎头 AI 助手，做人才地图与人才寻访｜铂寻 Boseek；描述：HunterBuddy 是铂寻 Boseek 为独立猎头和资深顾问打造的猎头 AI 助手。从融资新闻、招聘页、简历和论文里找线索，帮你做客户开发、人才地图、人才寻访和人选维护，每个判断都写明来源。目前邀请制试用。 |

### 5. 站长工具验证（2026-10-23）
- Google Search Console：网域资源 `boseekai.com`，阿里云解析 TXT 记录验证，已通过。这条 TXT 记录要一直保留。
- 百度搜索资源平台：`https://www.boseekai.com`，只提供文件和 HTML 标签两种验证，用 HTML 标签。`<meta name="baidu-site-verification" content="codeva-SxHxeGOeZL" />` 已放进首页，b4317e7 部署后验证通过。这行代码要一直保留。
- Bing：从 Google Search Console 导入 `boseekai.com`，已完成，不需要额外代码。

## 第一阶段：技术基础

分两批做：第一批只改给搜索引擎看的部分，页面外观不变；第二批做英文 `/en/`。

### 第一批（2026-10-23，已完成）
- `public/landing-origin/robots.txt`：搜索引擎和 AI 爬虫全部放行，写明 sitemap 位置。
- `public/landing-origin/sitemap.xml`：目前只有中文首页。
- 首页 `<head>`：新标题和描述、canonical（`https://www.boseekai.com/`）、Open Graph 文字标签（分享图待定）。
- JSON-LD：Organization、WebSite、WebPage、SoftwareApplication（HunterBuddy）、VideoObject（中文短片）。
- 产品没有公开价格，Google 富媒体检测会提示缺少 offers，属预期。
- 上线后：三个平台提交 sitemap；用 Google 富媒体检测工具检查结构化数据。
- 已上线（e3827ce，2026-10-23）：robots.txt 和 sitemap.xml 返回 200、类型正确，不经过首页兜底；首页 head 内容核对无误。线上没有 CDN，首页 `no-cache`。
- Google 富媒体检测（2026-10-23）：3 个有效项目（组织、软件应用、视频），无错误。组织和软件应用有“非关键问题”：缺少地址细节、联系方式、价格等可选字段，属预期。检测工具没加载短片 mp4，属常见现象，不影响结果。
- 站点地图与收录提交（2026-10-23）：Google、Bing 提交 sitemap 成功；百度用普通收录 API 提交首页成功（success 1，当日剩余 9）。API 由用户在自己电脑上用 curl 调用，token 不进仓库。
- 跳转（2026-10-23 已修）：阿里云新增 A 记录 `@ → 59.110.28.161`，证书覆盖 boseekai.com；`http://www.boseekai.com/`、`http(s)://boseekai.com/` 都 301 到 `https://www.boseekai.com/`，保留路径。Google 验证用的 TXT 记录仍在。

### 第二批：英文版 `/en/`（2026-10-23，已上线）
决定：
- 不按浏览器语言自动跳转，只保留切换按钮。
- 英文标题：HunterBuddy · AI assistant for recruiters: talent mapping and sourcing | Boseek
- 英文描述：HunterBuddy by Boseek is an AI assistant for independent recruiters and senior search consultants. It finds leads in funding news, job pages, CVs and papers to help with business development, talent mapping, sourcing and candidate nurturing, with a source for every finding. Early access by invitation.

实现：
- `public/landing-origin/en/index.html` 由 `scripts/build-origin-english.mjs` 生成：用 `<base href="../">` 共用中文首页的样式、脚本和资源；`<head>` 是英文页面信息（canonical `/en/`、hreflang、Open Graph、JSON-LD 含英文短片）；静态正文和页脚是英文，不运行 JavaScript 也能读到。
- 站内锚点（#work 等）由页面里一段小脚本留在 `/en/` 滚动，不跳回中文首页。
- `shared-locale.js`：按路径 `/en/` 判断语言；语言切换在 `/` 与 `/en/` 之间跳转并保留锚点；旧的 `?lang=en` 在浏览器端补一次跳转（服务器端由 Codex 配 301）。
- 中文首页加 hreflang 和 `og:locale:alternate`；sitemap 加入 `/en/` 及语言对应。
- 维护：改了中文首页 `<head>`（如脚本版本号）或英文静态文案后，运行 `node scripts/build-origin-english.mjs` 重新生成英文页。

上线（1753337，2026-10-23）：
- `/en/` 返回 200、`no-cache`；`/en` 301 到 `/en/`；`/?lang=en` 301 到 `/en/`，`/?lang=zh` 301 到 `/`；`http://boseekai.com/?lang=en` 经两次 301 到 `/en/`。
- 线上英文页：标题、canonical、`og:locale`、`<base>` 正确；trial-api 已换成生产值；没有百度验证代码（只在中文首页）。语言切换指向 `/`，站内锚点留在 `/en/`。
- 收录提交（2026-10-23）：百度 API 已提交 `/en/`；Google“网址检查”已请求编入索引；Bing 后台没有 URL 提交入口，由 sitemap 自动发现。

第一阶段完成。

## 第二阶段：内容页面

分两批：第一批首页“常见问题”，第二批四个使用场景页（客户开发、人才地图、职位寻访、人选维护，动手前再逐个问题确认）。

### 第一批：首页常见问题（2026-10-23，已验收，待部署）
决定：
- 问答沿用第五版首页的 6 条原样，再补 2 条对比：和招聘平台（猎聘、领英、脉脉）的关系、和猎头管理系统（CRM、ATS）的区别。
- 位置：“人和关系”之后、“关于铂寻”之前。顶部导航和页脚各加一项“常见问题”（英文 FAQ）。
- 中英文都做，英文问答与中文一一对应。
- 标题：中文“试用之前，大家常问这些。”，英文“What people ask / before they try it.”（第一稿“先把疑问说清楚，再带一件手上的事来试。”不够口语，已换掉）。
- 英文问答按“信达雅”逐条对照中文重译过一遍。

实现：
- 问答静态写在 `index.html`（英文由 `scripts/build-origin-english.mjs` 生成），放在 `#homepage` 外面，不运行 JavaScript 也能读到。`origin.js` 渲染后把它移到“人和关系”之后，并在顶部导航插入“常见问题”，同时负责这一项的高亮。
- `<head>` 结构化数据加 FAQPage（中文 `https://www.boseekai.com/#faq`，英文 `https://www.boseekai.com/en/#faq`），文字与页面上的问答逐字一致。改问答时两处一起改：中文改 `index.html` 里的问答和 FAQPage，英文只改构建脚本里的 `FAQ` 数组。
- 样式在 `origin-motion.css`：深色底、细分隔线，问题用标题字体，答案用正文字体，点开加号变减号，进入视野时和其他段落一样淡入。
- 中文标题字体子集补了问答标题里新出现的 13 个字（`noto-serif-sc-subset.woff2`，加了版本号防缓存）。
- 导航变成六项后，中文在 801–900px、英文在 801–1120px 收进菜单按钮，避免和右侧按钮挤在一起（`page.js` 只对第三版生效，其他版本仍是 800px）。
- 上线后：用 Google 富媒体检测工具检查 FAQPage，百度、Google 重新提交首页和 `/en/`。

## 接下来（2026-10-23 定的顺序）
1. 第二阶段：内容页面（先逐个问题确认，再汇总执行）。
2. 企业邮箱 hello@boseekai.com：交给 Codex（有阿里云凭证）开通并配好解析；开通后把邮箱加到网站和结构化数据。
3. 分享图：内容页面之后再做。
