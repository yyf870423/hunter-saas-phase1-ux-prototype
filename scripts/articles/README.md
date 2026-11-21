# 使用场景里的实务文章

2026-10-25 起“使用场景”和“文章”合成一套，页面在改版首页下：`public/landing-redesign/use-cases/<slug>/`（加上列表页 `use-cases/`）。
2026-11-21 起，八个核心能力各有一页，正文在 `scripts/capabilities/<slug>.mjs`（英文 `scripts/capabilities-en/`），其中六页沿用了旧文章的网址。这里只剩三篇通用的实务文章，每篇一个文件 `<slug>.mjs`，`export default {...}`。改完运行：

```sh
node scripts/build-articles.mjs        # 只做规矩检查
node scripts/build-redesign-pages.mjs  # 生成十一篇、列表页和法律页（会先检查，再写）
```

新增一篇还要：在 `scripts/build-redesign-pages.mjs` 的 ORDER（和需要的话 FOOTER）里加上 slug，在 `tests/redesign-use-cases.spec.js` 的列表里加 slug，上线时在 sitemap 里加网址。

## 字段
| 字段 | 说明 |
|---|---|
| `slug`、`order` | 网址 `/use-cases/<slug>/`（列表顺序由构建脚本里的 ORDER 决定） |
| `name` | 面包屑、相关阅读、页脚里的短名，16 字以内 |
| `title` | `<title>`，含主攻词，以“｜HunterBuddy”结尾，40 字以内 |
| `description` | 搜索结果摘要，80–120 字 |
| `kicker`、`h1` | 首屏小标签和标题（1–2 行） |
| `answer` | 首屏第一段，直接回答标题的问题，2–3 句，能被单独引用 |
| `teaser` | 文章列表里的一句话 |
| `keywords` | 主攻词和长尾词，只用于检查，不上页面 |
| `useCase` | 旧字段（原来对应的使用场景页），合并后不再使用 |
| `related` | 2–3 篇相关文章的 slug（总领文章 `ai-assistant-for-headhunters` 会自动加上） |
| `sections` | 4–6 节，`{ h2: "问句？", body: [...] }` |
| `faq` | 3–4 条 `[问题, 回答]`，页面和结构化数据 FAQPage 用同一份 |

`body` 里的块：段落字符串、`{ list }`、`{ steps }`、`{ cards }`、`{ note }`、`{ demo }`（深色结果卡片，每篇最多一张）。

## 规矩
- 不用中文分号“；”（构建时会检查）。
- 不编造数据、统计、客户、案例、引语。星川机器人只作为讲清用法的例子。
- HunterBuddy 的能力和边界只写首页、场景页已有的。自称“高阶技术人才寻访的 AI 工作台”，猎头向的文章里可以说它属于“猎头 AI 助手”这一类（2026-11-02 曾改名 TalentBuddy，2026-11-21 起改回 HunterBuddy）。能力名用首页八个叫法：多源寻访、人岗双向匹配、身份核实、组织架构 Mapping、客户研判、人选转介绍、人才库、行业入门。不自称“猎头软件 / 猎头系统”，不用“猎头 BD”。
- 平台名（豆包、DeepSeek、ChatGPT、猎聘、领英、脉脉、BOSS直聘）只出现在 `ai-tools-compared`，只讲各自适合做什么，不贬低。
- 不碰背调、查身份证 / 手机号 / 住址，找人和核实身份只用公开信息、拿不准就标出来。
- 关键词只放在 title、description、h1、h2 和常见问题里，正文是平常说话的语气。
