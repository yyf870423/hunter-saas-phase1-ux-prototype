# 官网 SEO 文章

每篇一个文件 `<slug>.mjs`，`export default {...}`。改完运行：

```sh
node scripts/build-articles.mjs        # 生成 public/landing-origin/articles/… 和文章列表，写出标题用字
python3 scripts/subset-origin-chinese.py # 标题里出现新字时，补全思源宋体子集
node scripts/build-use-cases.mjs       # 场景页的“延伸阅读”和页脚“文章”一栏跟着文章走
```

新增文章还要：在 `public/landing-origin/sitemap.xml` 加网址，在 `scripts/verify-pages-artifact.mjs` 的 landing-origin 清单里加文件，在 `tests/origin-articles.spec.js` 的列表里加 slug。

## 字段
| 字段 | 说明 |
|---|---|
| `slug`、`order` | 网址 `/articles/<slug>/` 和列表顺序 |
| `name` | 面包屑、相关阅读、页脚里的短名，16 字以内 |
| `title` | `<title>`，含主攻词，以“｜HunterBuddy”结尾，40 字以内 |
| `description` | 搜索结果摘要，80–120 字 |
| `kicker`、`h1` | 首屏小标签和标题（1–2 行） |
| `answer` | 首屏第一段，直接回答标题的问题，2–3 句，能被单独引用 |
| `teaser` | 文章列表里的一句话 |
| `keywords` | 主攻词和长尾词，只用于检查，不上页面 |
| `useCase` | 对应的使用场景页 slug，没有就 `null` |
| `related` | 2–3 篇相关文章的 slug（总领文章 `ai-assistant-for-headhunters` 会自动加上） |
| `sections` | 4–6 节，`{ h2: "问句？", body: [...] }` |
| `faq` | 3–4 条 `[问题, 回答]`，页面和结构化数据 FAQPage 用同一份 |

`body` 里的块：段落字符串、`{ list }`、`{ steps }`、`{ cards }`、`{ note }`、`{ demo }`（深色结果卡片，每篇最多一张）。

## 规矩
- 不用中文分号“；”（构建时会检查）。
- 不编造数据、统计、客户、案例、引语。星川机器人只作为讲清用法的例子。
- HunterBuddy 的能力和边界只写首页、场景页已有的。称“猎头 AI 助手”，不自称“猎头软件 / 猎头系统”，不用“猎头 BD”。
- 平台名（豆包、DeepSeek、ChatGPT、猎聘、领英、脉脉、BOSS直聘）只出现在 `ai-tools-compared`，只讲各自适合做什么，不贬低。
- 不碰背调、查身份证 / 手机号 / 住址，找人和核实身份只用公开信息、拿不准就标出来。
- 关键词只放在 title、description、h1、h2 和常见问题里，正文是平常说话的语气。
