// 生成官网的 SEO 文章：public/landing-origin/articles/<slug>/index.html 和文章列表页 articles/index.html（只有中文）。
// 正文在 scripts/articles/<slug>.mjs（每篇一个文件，字段说明见 scripts/articles/README.md），
// 导航、页脚等共用文字和使用场景页一样，来自 scripts/use-cases/content.mjs。
// 页面上的常见问题和结构化数据 FAQPage 用同一份文字。
// 还会写出 scripts/articles/heading-chars.txt：标题里用到的汉字，scripts/subset-origin-chinese.py 用它补全标题字体子集。
// 改了文案或样式版本号后运行：node scripts/build-articles.mjs
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { COMMON } from "./use-cases/content.mjs";
import { PAGES } from "./use-cases/pages.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.boseekai.com/";
export const PUBLISHED = "2026-10-25";
const VERSION = {
  sharedUi: "20261021",
  page: "20261021",
  footer: "20261021d",
  sharedOrigin: "20261025-art",
  origin: "20261023-faq",
  motion: "20261025-foot",
  locale: "20261023-faq",
  useCase: "20261025-art",
};

const HUB = "ai-assistant-for-headhunters";
const LIST = {
  name: "文章",
  title: "猎头实务文章：组织架构、人才库、人岗匹配与猎头 AI 助手｜HunterBuddy",
  ogTitle: "猎头实务文章 · HunterBuddy",
  description:
    "写给独立猎头和资深顾问的实务文章：公司组织架构图怎么画、人才库怎么建、人岗匹配怎么做、猎头怎么找人、同名候选人怎么区分，以及猎头能用 AI 助手做哪些事。",
  kicker: "猎头实务",
  h1: ["猎头实务文章"],
  lead: "从客户开发、组织架构到找人、匹配和人选维护，把猎头每天最花时间的几件事讲清楚：一般怎么做、难在哪里、哪些可以交给 AI，哪些还得你自己来。",
};
const UI = {
  articlesShort: "文章",
  toc: "本文目录",
  related: "相关阅读",
  relatedCase: "使用场景",
  relatedArticle: "文章",
  allArticles: "全部文章",
  published: "发布于",
  author: "铂寻 Boseek",
  readCase: "了解",
  footerArticles: "实务文章",
};

export async function loadArticles() {
  const dir = resolve(root, "scripts/articles");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mjs"));
  const list = [];
  for (const file of files) list.push((await import(pathToFileURL(resolve(dir, file)).href)).default);
  return list.sort((a, b) => a.order - b.order);
}

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const icon = (paths) =>
  `<svg class="f-icon" viewBox="0 0 24 24" aria-hidden="true">${paths.map((d) => `<path d="${d}" />`).join("")}</svg>`;
const chevron = icon(["m9 18 6-6-6-6"]);
const menu = icon(["M4 6h16", "M4 12h16", "M4 18h16"]);
const lines = (parts) => parts.map((part) => `<span class="ln">${text(part)}</span>`).join("<br />");
const indent = (block, pad) =>
  block
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");

const articleUrl = (slug) => `${SITE}articles/${slug}/`;
const listUrl = `${SITE}articles/`;

/* ---------- shared header and footer (same as the use-case pages, Chinese only) ---------- */
function head({ title, description, ogTitle, self, up, graph, ogType }) {
  const t = COMMON.zh;
  const jsonLd = indent(JSON.stringify(graph, null, 2), "      ");
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0f1011" />
    <title>${text(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${self}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="铂寻 Boseek" />
    <meta property="og:title" content="${esc(ogTitle)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${self}" />
    <meta property="og:locale" content="zh_CN" />${
      ogType === "article"
        ? `
    <meta property="article:published_time" content="${PUBLISHED}" />`
        : ""
    }
    <meta name="twitter:card" content="summary" />
    <script type="application/ld+json">
${jsonLd}
    </script>
    <link rel="icon" href="${up}favicon.ico" sizes="any" />
    <link rel="icon" href="${up}favicon.svg?v=20261022-bo" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="${up}apple-touch-icon.png?v=20261022-bo" />
    <!-- 这一页没有表单，申请试用回首页。保留这一行是为了和其他页面一致，部署检查要求每个页面都有 -->
    <meta name="trial-api" content="disabled" />
    <link rel="stylesheet" href="${up}../landing/shared-ui.css?v=${VERSION.sharedUi}" />
    <link rel="stylesheet" href="${up}../landing/page.css?v=${VERSION.page}" />
    <link rel="stylesheet" href="${up}../landing/shared-footer.css?v=${VERSION.footer}" />
    <link rel="stylesheet" href="${up}shared-origin.css?v=${VERSION.sharedOrigin}" />
    <link rel="stylesheet" href="${up}origin.css?v=${VERSION.origin}" />
    <link rel="stylesheet" href="${up}origin-motion.css?v=${VERSION.motion}" />
    <link rel="stylesheet" href="${up}shared-locale.css?v=${VERSION.locale}" />
    <link rel="stylesheet" href="${up}use-case.css?v=${VERSION.useCase}" />
    <script defer src="${up}use-case.js?v=${VERSION.useCase}"></script>
  </head>
  <body class="u-page a-page">
    <a class="f-skip" href="#main">${text(t.skip)}</a>
    <header class="f-header">
      <div class="f-container f-header-inner">
        <a href="${up}" aria-label="${esc(t.homeLabel)}"><span class="f-brand"><img src="${up}assets/boseek-b5-dark.svg" alt="Boseek 铂寻" width="150" height="54" /></span></a>
        <nav class="f-nav" id="f-navigation" aria-label="${esc(t.navLabel)}">
${t.nav.map(([label, hash]) => `          <a href="${up}#${hash}">${text(label)}</a>`).join("\n")}
        </nav>
        <div class="f-header-actions">
          <a class="f-language-switch" href="${up}en/" hreflang="en" lang="en" title="${esc(t.switchTitle)}" aria-label="${esc(t.switchTitle)}"><span>${text(t.switchLabel)}</span></a>
          <a class="f-login-link" href="${up}#apply">${text(t.apply)}</a>
          <button type="button" class="f-icon-button" aria-label="${esc(t.menuOpen)}" data-menu-toggle data-label-open="${esc(t.menuOpen)}" data-label-close="${esc(t.menuClose)}" aria-controls="f-navigation" aria-expanded="false" hidden>${menu}<span class="f-tooltip" aria-hidden="true">${text(t.menuOpen)}</span></button>
        </div>
      </div>
    </header>
`;
}

// the footer: the same four groups everywhere on the Chinese site (产品 / 使用场景 / 文章 / 法律)
// 页脚“文章”一栏：五篇主要文章（链接文字用各篇的主攻词，短而带关键词），最后一行是“全部文章 >>”
export const FOOTER_ARTICLES = [
  ["ai-assistant-for-headhunters", "猎头 AI 助手"],
  ["org-chart", "组织架构图"],
  ["job-matching", "人岗匹配"],
  ["finding-candidates", "猎头怎么找人"],
  ["talent-pool", "人才库管理"],
];
export function footerArticlesGroup(prefix, articles, current = null) {
  const items = FOOTER_ARTICLES.filter(([slug]) => articles.some((a) => a.slug === slug)).map(([slug, label]) => [
    `${prefix}articles/${slug}/`,
    label,
    current === slug,
  ]);
  items.push([`${prefix}articles/`, `${UI.allArticles} >>`, current === "list"]);
  return `            <div class="f-footer-group" role="group" aria-labelledby="f-footer-articles">
              <h2 id="f-footer-articles">${text(UI.footerArticles)}</h2>
              <ul>
${items.map(([href, label, here]) => `                <li><a href="${href}"${here ? ' aria-current="page"' : ""}>${text(label)}</a></li>`).join("\n")}
              </ul>
            </div>`;
}

function foot(up, articles, current) {
  const t = COMMON.zh;
  return `    <footer class="f-footer" id="footer" data-finesse-footer>
      <div class="f-container">
        <div class="f-footer-top">
          <div class="f-footer-brand">
            <span class="f-brand">
              <img src="${up}assets/boseek-b5-dark.svg" alt="Boseek 铂寻" width="150" height="54" loading="lazy" />
            </span>
            <div class="f-footer-notes">
${t.footerNotes.map((note) => `              <p>${text(note)}</p>`).join("\n")}
              <p class="o-footer-contact">${text(t.contact)}<a href="mailto:hello@boseekai.com">hello@boseekai.com</a></p>
            </div>
          </div>
          <div class="f-footer-groups">
            <div class="f-footer-group" role="group" aria-labelledby="f-footer-product">
              <h2 id="f-footer-product">${text(t.footerProduct)}</h2>
              <ul>
${t.nav
  .filter(([, hash]) => hash !== "about")
  .map(([label, hash]) => `                <li><a href="${up}#${hash}">${text(label)}</a></li>`)
  .join("\n")}
              </ul>
            </div>
            <div class="f-footer-group" role="group" aria-labelledby="f-footer-cases">
              <h2 id="f-footer-cases">${text(t.footerCases)}</h2>
              <ul>
${PAGES.map((p) => `                <li><a href="${up}use-cases/${p.slug}/">${text(p.zh.name)}</a></li>`).join("\n")}
              </ul>
            </div>
${footerArticlesGroup(up, articles, current)}
            <div class="f-footer-group" role="group" aria-labelledby="f-footer-legal">
              <h2 id="f-footer-legal">${text(t.footerLegal)}</h2>
              <ul>
${t.legal.map((item) => `                <li>${text(item)}</li>`).join("\n")}
              </ul>
            </div>
          </div>
        </div>
        <div class="f-footer-bottom">
          <ul class="f-footer-meta" aria-label="${esc(t.metaLabel)}">
${t.meta.map((item) => `            <li>${item}</li>`).join("\n")}
            <li>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">京ICP备2026068903号-1</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  </body>
</html>
`;
}

function trial(up) {
  const t = COMMON.zh;
  return `          <div class="u-trial">
            <div>
              <h2>${text(t.trialTitle)}</h2>
              <p>${text(t.trialBody)}</p>
            </div>
            <a class="f-button" href="${up}#apply">${text(t.apply)}${chevron}</a>
          </div>`;
}

/* ---------- article body blocks ---------- */
function block(item) {
  if (typeof item === "string") return `<p class="a-p">${text(item)}</p>`;
  if (item.list) return `<ul class="a-list">\n${item.list.map((li) => `  <li>${text(li)}</li>`).join("\n")}\n</ul>`;
  if (item.steps)
    return `<ol class="u-steps">\n${item.steps
      .map(([title, body]) => `  <li>\n    <h3>${text(title)}</h3>\n    <p>${text(body)}</p>\n  </li>`)
      .join("\n")}\n</ol>`;
  if (item.cards)
    return `<ul class="u-cards">\n${item.cards
      .map(([title, body]) => `  <li>\n    <h3>${text(title)}</h3>\n    <p>${text(body)}</p>\n  </li>`)
      .join("\n")}\n</ul>`;
  if (item.note) return `<p class="u-note a-note">${text(item.note)}</p>`;
  if (item.demo) {
    const d = item.demo;
    return `<figure class="u-demo a-demo">
  <figcaption class="u-demo-lead">
    <p class="u-demo-context">${text(d.context)}</p>
    <h3>${text(d.title)}</h3>
    <p>${text(d.caption)}</p>
  </figcaption>
  <ul class="f-result-list">
${d.items.map(([small, strong, body]) => `    <li><small>${text(small)}</small><strong>${text(strong)}</strong><p>${text(body)}</p></li>`).join("\n")}
  </ul>
</figure>`;
  }
  throw new Error(`unknown block: ${JSON.stringify(item).slice(0, 80)}`);
}

function articlePage(a, articles) {
  const up = "../../";
  const self = articleUrl(a.slug);
  const t = COMMON.zh;
  const headline = a.title.replace(/｜HunterBuddy$/, "");
  const useCase = a.useCase ? PAGES.find((p) => p.slug === a.useCase) : null;
  const relatedSlugs = [...new Set([...(a.related || []), ...(a.slug === HUB ? [] : [HUB])])].filter(
    (s) => s !== a.slug,
  );
  const related = relatedSlugs.map((s) => {
    const r = articles.find((x) => x.slug === s);
    if (!r) throw new Error(`${a.slug}: related article ${s} not found`);
    return r;
  });

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${self}#webpage`,
        url: self,
        name: a.title,
        description: a.description,
        inLanguage: "zh-CN",
        isPartOf: { "@id": `${SITE}#website` },
        publisher: { "@id": `${SITE}#organization` },
        breadcrumb: { "@id": `${self}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${self}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.homeName, item: SITE },
          { "@type": "ListItem", position: 2, name: UI.articlesShort, item: listUrl },
          { "@type": "ListItem", position: 3, name: a.name, item: self },
        ],
      },
      {
        "@type": "Article",
        "@id": `${self}#article`,
        headline,
        description: a.description,
        inLanguage: "zh-CN",
        datePublished: PUBLISHED,
        dateModified: PUBLISHED,
        mainEntityOfPage: { "@id": `${self}#webpage` },
        author: { "@id": `${SITE}#organization` },
        publisher: { "@id": `${SITE}#organization` },
        about: { "@id": `${SITE}#hunterbuddy` },
      },
      {
        "@type": "FAQPage",
        "@id": `${self}#faq`,
        inLanguage: "zh-CN",
        isPartOf: { "@id": `${self}#webpage` },
        mainEntity: a.faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  const sections = a.sections
    .map(
      (s, i) => `        <section class="u-section a-section" id="s${i + 1}" aria-labelledby="a-s${i + 1}">
          <div class="f-container"><div class="u-col">
            <p class="u-label">${String(i + 1).padStart(2, "0")}</p>
            <h2 id="a-s${i + 1}">${text(s.h2)}</h2>
${indent(s.body.map(block).join("\n"), "            ")}
          </div></div>
        </section>`,
    )
    .join("\n\n");

  const relatedItems = [
    ...(useCase
      ? [
          `              <li><a href="${up}use-cases/${useCase.slug}/"><span class="a-related-kind">${text(UI.relatedCase)}</span><strong>${text(useCase.zh.name)}</strong><span class="a-related-line">${text(useCase.zh.teaser)}</span></a></li>`,
        ]
      : []),
    ...related.map(
      (r) =>
        `              <li><a href="${up}articles/${r.slug}/"><span class="a-related-kind">${text(UI.relatedArticle)}</span><strong>${text(r.name)}</strong><span class="a-related-line">${text(r.teaser)}</span></a></li>`,
    ),
  ].join("\n");

  return `${head({ title: a.title, description: a.description, ogTitle: `${a.name} · HunterBuddy`, self, up, graph, ogType: "article" })}
    <main id="main" tabindex="-1">
      <article>
      <section class="u-hero" aria-labelledby="u-title">
        <div class="f-container">
          <div class="u-col">
            <nav class="u-crumbs" aria-label="${esc(t.crumbsLabel)}">
              <a href="${up}">${text(t.homeShort)}</a><span aria-hidden="true">/</span><a href="${up}articles/">${text(UI.articlesShort)}</a><span aria-hidden="true">/</span><span aria-current="page">${text(a.name)}</span>
            </nav>
            <p class="o-kicker">${text(a.kicker)}</p>
            <h1 id="u-title">${lines(a.h1)}</h1>
            <p class="u-lead a-answer">${text(a.answer)}</p>
            <p class="a-meta">${text(UI.author)}<span aria-hidden="true">·</span>${text(UI.published)} <time datetime="${PUBLISHED}">${PUBLISHED}</time></p>
          </div>
        </div>
      </section>

      <div class="u-paper">
        <nav class="a-toc-wrap" aria-labelledby="a-toc-title">
          <div class="f-container"><div class="u-col">
            <div class="a-toc">
              <p class="u-label" id="a-toc-title">${text(UI.toc)}</p>
              <ol>
${a.sections.map((s, i) => `                <li><a href="#s${i + 1}">${text(s.h2)}</a></li>`).join("\n")}
              </ol>
            </div>
          </div></div>
        </nav>

${sections}

        <section class="u-section a-related-wrap" aria-labelledby="a-related-title">
          <div class="f-container"><div class="u-col">
            <p class="u-label">${text(UI.related)}</p>
            <h2 id="a-related-title" class="a-related-title">${text(UI.related)}</h2>
            <ul class="a-related">
${relatedItems}
            </ul>
          </div></div>
        </section>
      </div>

      <section class="o-faq u-faq" id="faq" tabindex="-1" aria-labelledby="o-faq-title">
        <div class="f-container">
          <div class="o-faq-intro">
            <p class="o-kicker">${text(t.faqKicker)}</p>
            <h2 id="o-faq-title">${lines(a.faqTitle || ["关于这件事，", "大家常问这些。"])}</h2>
          </div>
          <div class="o-faq-list">
${a.faq
  .map(
    ([question, answer]) => `            <details>
              <summary><h3>${text(question)}</h3><span class="o-faq-mark" aria-hidden="true"></span></summary>
              <p>${text(answer)}</p>
            </details>`,
  )
  .join("\n")}
          </div>
        </div>
      </section>
      </article>

      <section class="u-next" aria-label="${esc(COMMON.zh.trialTitle)}">
        <div class="f-container">
${trial(up)}
        </div>
      </section>
    </main>

${foot(up, articles, a.slug)}`;
}

function listPage(articles) {
  const up = "../";
  const t = COMMON.zh;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${listUrl}#webpage`,
        url: listUrl,
        name: LIST.title,
        description: LIST.description,
        inLanguage: "zh-CN",
        isPartOf: { "@id": `${SITE}#website` },
        publisher: { "@id": `${SITE}#organization` },
        breadcrumb: { "@id": `${listUrl}#breadcrumb` },
        mainEntity: { "@id": `${listUrl}#list` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${listUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.homeName, item: SITE },
          { "@type": "ListItem", position: 2, name: LIST.name, item: listUrl },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${listUrl}#list`,
        itemListElement: articles.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: articleUrl(a.slug),
          name: a.title.replace(/｜HunterBuddy$/, ""),
        })),
      },
    ],
  };
  return `${head({ title: LIST.title, description: LIST.description, ogTitle: LIST.ogTitle, self: listUrl, up, graph, ogType: "website" })}
    <main id="main" tabindex="-1">
      <section class="u-hero" aria-labelledby="u-title">
        <div class="f-container">
          <div class="u-col">
            <nav class="u-crumbs" aria-label="${esc(t.crumbsLabel)}">
              <a href="${up}">${text(t.homeShort)}</a><span aria-hidden="true">/</span><span aria-current="page">${text(LIST.name)}</span>
            </nav>
            <p class="o-kicker">${text(LIST.kicker)}</p>
            <h1 id="u-title">${lines(LIST.h1)}</h1>
            <p class="u-lead">${text(LIST.lead)}</p>
          </div>
        </div>
      </section>

      <div class="u-paper">
        <section class="u-section" aria-label="${esc(LIST.name)}">
          <div class="f-container">
            <ol class="a-index">
${articles
  .map(
    (a, i) => `              <li>
                <a href="${a.slug}/">
                  <span class="a-index-no">${String(i + 1).padStart(2, "0")}</span>
                  <strong>${text(a.title.replace(/｜HunterBuddy$/, ""))}</strong>
                  <span class="a-index-line">${text(a.teaser)}</span>
                  <span class="a-index-more">阅读全文${chevron}</span>
                </a>
              </li>`,
  )
  .join("\n")}
            </ol>
          </div>
        </section>
      </div>

      <section class="u-next" aria-label="${esc(COMMON.zh.trialTitle)}">
        <div class="f-container">
${trial(up)}
        </div>
      </section>
    </main>

${foot(up, articles, "list")}`;
}

/* ---------- checks, then write ---------- */
function check(a) {
  const problems = [];
  const all = JSON.stringify(a);
  if (all.includes("；")) problems.push("中文分号");
  for (const word of ["猎头 BD", "猎头BD", "猎头软件", "猎头系统", "演示数据", "背调", "据统计", "研究表明"])
    if (
      all.includes(word) &&
      !(word === "猎头软件" && a.slug === HUB) &&
      !(word === "猎头系统" && a.slug === "ai-tools-compared") &&
      !(word === "背调" && a.slug === "same-name-candidates") // 只用来划边界：“不做背调”
    )
      problems.push(`用了“${word}”`);
  if (a.slug !== "ai-tools-compared")
    for (const name of ["豆包", "DeepSeek", "ChatGPT", "猎聘", "领英", "脉脉", "BOSS直聘"])
      if (all.includes(name)) problems.push(`平台名“${name}”只能出现在对比那一篇`);
  if (!/｜HunterBuddy$/.test(a.title)) problems.push("title 要以“｜HunterBuddy”结尾");
  if (a.faq.length < 3) problems.push("常见问题少于 3 条");
  return problems;
}

export const headingStrings = (articles) => [
  ...Object.values(UI),
  ...LIST.h1,
  LIST.name,
  COMMON.zh.trialTitle,
  "关于这件事，",
  "大家常问这些。",
  ...articles.flatMap((a) => [
    a.name,
    a.title,
    ...a.h1,
    ...(a.faqTitle || []),
    ...a.sections.flatMap((s) => [
      s.h2,
      ...s.body.filter((b) => b && b.demo).map((b) => b.demo.title),
    ]),
    ...a.faq.map(([q]) => q),
  ]),
];

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const articles = await loadArticles();
  let failed = false;
  for (const a of articles) {
    const problems = check(a);
    if (problems.length) {
      failed = true;
      console.error(`${a.slug}: ${problems.join("，")}`);
    }
  }
  if (failed) process.exit(1);
  for (const a of articles) {
    const html = articlePage(a, articles);
    if (html.includes("；")) throw new Error(`${a.slug}: 不用中文分号`);
    const target = resolve(root, "public/landing-origin/articles", a.slug, "index.html");
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
    console.log(`wrote ${target.replace(root + "/", "")}`);
  }
  const target = resolve(root, "public/landing-origin/articles/index.html");
  await writeFile(target, listPage(articles));
  console.log(`wrote ${target.replace(root + "/", "")}`);
  const chars = [...new Set(headingStrings(articles).join("").replace(/[\x00-\x7f]/g, ""))].sort().join("");
  await writeFile(resolve(root, "scripts/articles/heading-chars.txt"), chars + "\n");
  console.log(`heading characters: ${chars.length}`);
}
