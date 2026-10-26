# 给 Codex 的上线提示词：改版官网（中英文）替换 www.boseekai.com

> 用法：用户验收通过后，把下面“提示词”整段发给 Codex。分隔线以上是给人看的说明，不用发。

---

## 提示词

请把仓库 `main` 分支（提交 `cbdd841` 或之后）里的改版官网（中英文）发布到正式站 https://www.boseekai.com ，替换现在线上的版本。改版内容已经由用户验收，**不要改任何文案、样式和脚本逻辑**，只做上线需要的路径、头部、跳转、站点地图和服务器配置。做完按文末清单逐项验证，并把结果回报给我。

如果你之前已经按这份说明上线过一版（例如提交 `2be613d`），这次是更新：用新提交重新生成发布产物（同样去掉 noindex、同样改写 `landing-origin/` 路径），第 3、4 条的跳转和服务器配置已经配好的就保持不变，然后重新跑第 5 条验证。这次更新的内容：中英文短片章节标题加了停顿（光点停在横线画完处）、片长变为 2 分 32 秒；导航改为“产品短片 · 核心能力 · 产品边界 · 行业赛道 · 常见问题”（英文 Product video · Capabilities · Boundaries · Sectors · FAQ）、首页标题跟随新文案；英文“短片”统一为 video；英文版“BD client research”用词；手机窄屏场景图不再被裁；使用场景页新增文章配图和完整的机构信息（结构化数据）。

### 1. 上线什么

源目录：`public/landing-redesign/`（GitHub Pages 预览：https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/landing-redesign/ ）。

| 线上网址 | 仓库文件 |
|---|---|
| `/` | `public/landing-redesign/index.html` |
| `/en/` | `public/landing-redesign/en/index.html` |
| `/use-cases/` | `public/landing-redesign/use-cases/index.html` |
| `/use-cases/<slug>/`（9 个） | `public/landing-redesign/use-cases/<slug>/index.html` |
| `/en/use-cases/` | `public/landing-redesign/en/use-cases/index.html` |
| `/en/use-cases/<slug>/`（9 个） | `public/landing-redesign/en/use-cases/<slug>/index.html` |
| `/sitemap.xml` | `public/landing-redesign/sitemap.xml`（替换现在的 `landing-origin/sitemap.xml`） |
| `/robots.txt` | 不变，沿用 `public/landing-origin/robots.txt` |

9 个 slug：`business-development`、`org-chart`、`finding-candidates`、`job-matching`、`same-name-candidates`、`talent-pool`、`headhunter-consultant`、`ai-assistant-for-headhunters`、`ai-tools-compared`。

页面用到的改版自带文件（都在 `public/landing-redesign/` 下，按相对路径引用）：
`redesign.css`、`redesign.js`、`subpage.css`、`subpage.js`、`trial-locale-en.js`、`vendor/lenis-1.3.4.min.js`、`assets/`（整个目录：`fonts/`、`wall/` 18 张照片、`use-cases/` 18 张文章配图（中文 9 张、`en/` 下英文 9 张）、`mist-*.webp`、`film-poster.jpg`、`film-poster-en.jpg`、`hunterbuddy-film.mp4`、`hunterbuddy-film-en.mp4`、`boseek-b5-en-light.svg`）。

页面还引用了两个目录里的文件，用的是相对路径 `../landing-origin/…` 和 `../landing/…`（子页面按层级多几个 `../`，见下表）：

- `landing/`（线上已有 `/landing/`，改版放在站点根目录后这些相对路径会自然落到 `/landing/…`，不用改）：`shared-ui.css`、`shared-form.css`、`trial-page.css`、`shared-ui.js`、`shared-form.js`、`trial-form.js`、`vendor/libphonenumber-max.js`。
- `landing-origin/`（**要处理**）：`favicon.ico`、`favicon.svg`、`apple-touch-icon.png`、`locale-en.js`、`assets/boseek-b5-dark.svg`、`assets/boseek-b5.svg`、`assets/boseek-b5-en.svg`、`assets/hero-research.webp`、`assets/human-conversation.webp`、`assets/fonts/inter-400.woff2`、`assets/fonts/inter-500.woff2`。

建议的做法：发布目录以 `landing-redesign/` 为根，把上面 `landing-origin/` 的 11 个文件复制到发布目录里同样的相对位置（根目录和 `assets/` 下，没有重名；改版自己的英文表单文件特意叫 `trial-locale-en.js`，不会和 `locale-en.js` 冲突），然后在**发布产物**里把指向 `landing-origin/` 的相对路径改成指向站点根目录，规则是去掉一个 `../` 和 `landing-origin/`。仓库里一共有四种写法：

| 出现在 | 原写法 | 改成 |
|---|---|---|
| `/index.html`、`redesign.css`（Inter 字体） | `../landing-origin/` | （空，即同级） |
| `/en/index.html`、`/use-cases/index.html` | `../../landing-origin/` | `../` |
| `/use-cases/<slug>/`、`/en/use-cases/index.html` | `../../../landing-origin/` | `../../` |
| `/en/use-cases/<slug>/` | `../../../../landing-origin/` | `../../../` |

`../landing/` 这类写法不用改，放到根目录后会落到 `/landing/…`。不要改仓库里的源文件，只改发布产物。如果你更习惯别的布局，只要所有引用都能 200 返回、页面结构化数据里 `https://www.boseekai.com/assets/…` 的网址（短片和封面）有效即可。

### 2. 头部要改的地方

改版页面现在带着预览期的 `<meta name="robots" content="noindex" />`（每个页面一行，共 22 个页面），**上线时全部去掉**。其他头部信息已经按正式站写好，不要再改：

- 两个首页的 `<!-- seo -->…<!-- /seo -->` 里有 canonical、hreflang、Open Graph、JSON-LD（Organization、WebSite、WebPage、SoftwareApplication、VideoObject、FAQPage）。中文首页带百度验证 `<meta name="baidu-site-verification" content="codeva-SxHxeGOeZL" />`，**必须保留**（英文首页不加）。JSON-LD 里短片和封面的网址是 `https://www.boseekai.com/assets/hunterbuddy-film.mp4`、`…/assets/film-poster.jpg`（英文：`hunterbuddy-film-en.mp4`、`film-poster-en.jpg`），按第 1 条的布局正好有效；如果你换了布局，就同步改这四个网址。
- 18 个使用场景页和 2 个列表页已有 canonical（`https://www.boseekai.com/use-cases/<slug>/`、`/en/use-cases/<slug>/`）、三条 hreflang、Open Graph 和 JSON-LD。使用场景页的 `og:image` 和 Article 的 `image` 指向 `https://www.boseekai.com/assets/use-cases/<slug>.jpg`（英文 `…/assets/use-cases/en/<slug>.jpg`），按第 1 条的布局正好有效。
- `<meta name="trial-api" content="disabled" />`：和现在线上一样处理。两个首页有试用申请表单，换成生产接口的值（你上次上线时的做法）；使用场景页没有表单，保持 `disabled` 或按你们的惯例。

### 3. 跳转（301）

新增（旧的三个场景页已经并进新页面，中英文都要配）：

| 旧网址 | 301 到 |
|---|---|
| `/use-cases/talent-mapping/` | `/use-cases/org-chart/` |
| `/use-cases/sourcing/` | `/use-cases/finding-candidates/` |
| `/use-cases/candidate-nurturing/` | `/use-cases/talent-pool/` |
| `/en/use-cases/talent-mapping/` | `/en/use-cases/org-chart/` |
| `/en/use-cases/sourcing/` | `/en/use-cases/finding-candidates/` |
| `/en/use-cases/candidate-nurturing/` | `/en/use-cases/talent-pool/` |

（以上几条也要覆盖不带结尾斜杠的写法。`/use-cases/business-development/`、`/en/use-cases/business-development/` 网址不变，内容换成新版。）

删掉：`/use-cases/` → `/#work` 和 `/en/use-cases/` → `/en/#work` 这两条，现在它们是真实的列表页。

保持不变：`http` → `https`、`boseekai.com` → `www.boseekai.com`、`/en` → `/en/`、`/?lang=en` → `/en/`、`/?lang=zh` → `/`。另外请确认所有目录网址不带斜杠时 301 到带斜杠的写法（如 `/use-cases/org-chart` → `/use-cases/org-chart/`）。

`/articles/…` 从来没上线过，不需要跳转。

### 4. 服务器

- HTML 继续 `Cache-Control: no-cache`。其他静态文件都带 `?v=` 版本号，可以长缓存。
- `.mp4` 要支持 Range 请求（`Accept-Ranges: bytes`，带 Range 时返回 206），`Content-Type: video/mp4`，否则 iPhone 上的 Safari 播不了短片。`.woff2` 是 `font/woff2`，`.webp` 是 `image/webp`，`.svg` 是 `image/svg+xml`。
- 两个短片各约 29 MB。
- 旧的 `landing-origin/` 目录留在仓库里作为回退版本，不要删。回退方法：发布目录切回上一版（请在上线前确认能一步切回）。
- 保留阿里云 DNS 里 Google 验证用的 TXT 记录。

### 5. 上线后验证（请把命令输出贴给我）

1. 状态码：`/`、`/en/`、`/use-cases/`、`/en/use-cases/`、18 个使用场景页、`/sitemap.xml`、`/robots.txt` 都是 200；第 3 条的 6 条旧网址是 301，`Location` 正确，最终 200；`/use-cases/org-chart`（不带斜杠）301 到带斜杠。
2. 已发布的 HTML 里没有 `noindex`：对 22 个页面 `curl -s … | grep -c noindex` 都是 0。
3. 首页：canonical 是 `https://www.boseekai.com/`，有百度验证 meta；英文首页 canonical 是 `/en/`。
4. 页面引用的所有文件（CSS、JS、字体、图片、短片、封面）都返回 200，浏览器控制台没有 404 和脚本错误（中文、英文首页各打开一次，滚到底）。
5. 短片：`curl -I -H "Range: bytes=0-1" https://www.boseekai.com/assets/hunterbuddy-film.mp4` 返回 206；中英文首页点封面能播放（中英文都是 2 分 32 秒）。
6. 语言切换：中文首页右上角 “EN” 到 `/en/`，英文页 “中文” 回来；任意一个使用场景页切换语言，落到同一篇的另一种语言。
7. 试用申请表单在中英文首页都能显示，提交走生产接口（只确认能提交，按你们平时的方式测）。
8. 结构化数据：用 Google 富媒体检测工具测 `/`、`/en/`、`/use-cases/org-chart/`、`/en/use-cases/org-chart/`，无错误；使用场景页的“文章”应能读到作者（铂寻 Boseek / Boseek）和配图。缺少价格、地址细节这类“非关键问题”属预期；FAQ 不再出现在检测结果里也属正常（Google 已停止支持 FAQ 富媒体结果）。
9. 文章配图：`curl -I https://www.boseekai.com/assets/use-cases/org-chart.jpg` 和 `…/assets/use-cases/en/org-chart.jpg` 返回 200、`Content-Type: image/jpeg`。

### 6. 提交收录

- Google Search Console、Bing：重新提交 `https://www.boseekai.com/sitemap.xml`（22 个网址）。
- 百度：用户会在自己电脑上用普通收录 API 提交，**token 不要写进仓库或任何文件**。你只需要把要提交的网址列表给我（首页、英文首页、两个列表页、18 个使用场景页）。

### 7. 不要做的事

- 不改任何文案、样式、动效和脚本逻辑；不改仓库里的源文件（只改发布产物）。如果发现页面问题，先告诉我，不要自行修。
- 不删 `landing-origin/`，不动 Google 的 DNS TXT 记录，不把任何 token、密钥写进仓库。
- 不新增登录入口，只有“申请试用”。

完成后请回报：发布用的 commit、改了哪些服务器配置（301、缓存、MIME）、第 5 条的验证输出，以及回退方法。
