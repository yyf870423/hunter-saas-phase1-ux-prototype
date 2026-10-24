// 改版首页（public/landing-redesign/）配套的子页面，用改版首页的头部、页脚和字体：
//   landing-redesign/use-cases/<slug>/index.html   四个使用场景页（中文）
//   landing-redesign/articles/<slug>/index.html    八篇文章和文章列表页（中文）
// 正文和正式版（landing-origin）共用：场景页来自 scripts/use-cases/pages.mjs，文章来自 scripts/articles/*.mjs。
// 页面样式在 landing-redesign/subpage.css（只放子页面自己的部分，头部、页脚、按钮、常见问题沿用 redesign.css），
// 交互在 landing-redesign/subpage.js（头部随滚动隐藏、菜单、浏览器顶栏颜色）。
// 改版首页还在预览阶段，所以和首页一样带 noindex。上主站时去掉 noindex，并把 ../landing-origin/ 的资源路径换成主站路径。
// 运行：node scripts/build-redesign-pages.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { COMMON } from "./use-cases/content.mjs";
import { PAGES } from "./use-cases/pages.mjs";
import { FOOTER_ARTICLES, PUBLISHED, loadArticles } from "./build-articles.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.boseekai.com/";
const OUT = resolve(root, "public/landing-redesign");
const V = { redesign: "18", subpage: "20261025-a", subpageJs: "20261025-a" };
const HUB = "ai-assistant-for-headhunters";
const T = COMMON.zh;

const NAV = [
  ["产品短片", "film"],
  ["能做什么", "capabilities"],
  ["我们相信", "belief"],
  ["深耕赛道", "industries"],
  ["常见问题", "faq"],
];
const LIST = {
  name: "文章",
  title: "猎头实务文章：组织架构、人才库、人岗匹配与猎头 AI 助手｜HunterBuddy",
  description:
    "写给独立猎头和资深顾问的实务文章：公司组织架构图怎么画、人才库怎么建、人岗匹配怎么做、猎头怎么找人、同名候选人怎么区分，以及猎头能用 AI 助手做哪些事。",
  kicker: "猎头实务",
  h1: "猎头实务文章",
  lead: "从客户开发、组织架构到找人、匹配和人选维护，把猎头每天最花时间的几件事讲清楚：一般怎么做、难在哪里、哪些可以交给 AI，哪些还得你自己来。",
};

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const indent = (block, pad) =>
  block
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
const lines = (parts) => parts.map((p) => `<span class="ln">${text(p)}</span>`).join("<br />");

/* ---------- head, header, footer ---------- */
function head({ title, description, canonical, graph, ogType, up }) {
  const lo = `${up}../landing-origin/`;
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0f1011" />
    <!-- 改版草稿：只用于预览，不收录（上主站时去掉这一行） -->
    <meta name="robots" content="noindex" />
    <title>${text(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="铂寻 Boseek" />
    <meta property="og:title" content="${esc(title.replace(/｜HunterBuddy$/, ""))}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="zh_CN" />
    <script type="application/ld+json">
${indent(JSON.stringify(graph, null, 2), "      ")}
    </script>
    <link rel="icon" href="${lo}favicon.ico" sizes="any" />
    <link rel="icon" href="${lo}favicon.svg?v=20261022-bo" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="${lo}apple-touch-icon.png?v=20261022-bo" />
    <!-- 这一页没有表单，申请试用回首页。保留这一行是为了和其他页面一致 -->
    <meta name="trial-api" content="disabled" />
    <link rel="stylesheet" href="${up}redesign.css?v=${V.redesign}" />
    <link rel="stylesheet" href="${up}subpage.css?v=${V.subpage}" />
    <script defer src="${up}subpage.js?v=${V.subpageJs}"></script>
  </head>
  <body class="n-page s-page">
    <a class="n-skip" href="#main">跳到正文</a>

    <header class="n-header is-top" data-header>
      <div class="n-wrap n-header-inner">
        <a class="n-brand" href="${up}" aria-label="铂寻 Boseek 首页">
          <img src="${lo}assets/boseek-b5-dark.svg" alt="Boseek 铂寻" width="150" height="54" />
        </a>
        <nav class="n-nav" id="n-nav" aria-label="主导航">
${NAV.map(([label, hash]) => `          <a href="${up}#${hash}">${text(label)}</a>`).join("\n")}
        </nav>
        <div class="n-header-actions">
          <a class="n-lang" href="${lo}en/" hreflang="en" lang="en" title="Switch to English" aria-label="Switch to English">EN</a>
          <a class="n-btn n-btn-light n-btn-sm" href="${up}#apply">申请试用</a>
          <button class="n-menu" type="button" aria-controls="n-nav" aria-expanded="false" aria-label="打开导航" data-menu hidden>
            <span></span><span></span>
          </button>
        </div>
      </div>
    </header>
`;
}

// the footer: the same four groups as the redesigned homepage (产品 / 使用场景 / 文章 / 法律)
export function redesignFooterGroups(up, here = null) {
  const cur = (key) => (key === here ? ' aria-current="page"' : "");
  return `          <div class="n-footer-groups">
            <div>
              <h2>产品</h2>
              <ul>
${NAV.map(([label, hash]) => `                <li><a href="${up}#${hash}">${text(label)}</a></li>`).join("\n")}
              </ul>
            </div>
            <div>
              <h2>使用场景</h2>
              <ul>
${PAGES.map((p) => `                <li><a href="${up}use-cases/${p.slug}/"${cur(`uc:${p.slug}`)}>${text(p.zh.name)}</a></li>`).join("\n")}
              </ul>
            </div>
            <div>
              <h2>文章</h2>
              <ul>
${FOOTER_ARTICLES.map(([slug, label]) => `                <li><a href="${up}articles/${slug}/"${cur(`a:${slug}`)}>${text(label)}</a></li>`).join("\n")}
                <li><a href="${up}articles/"${cur("list")}>全部文章 &gt;&gt;</a></li>
              </ul>
            </div>
            <div>
              <h2>法律</h2>
              <ul>
${T.legal.map((item) => `                <li>${text(item)}</li>`).join("\n")}
              </ul>
            </div>
          </div>`;
}

function foot(up, here) {
  const lo = `${up}../landing-origin/`;
  return `    <footer class="n-footer" id="footer">
      <div class="n-wrap">
        <div class="n-footer-top">
          <div class="n-footer-brand">
            <img src="${lo}assets/boseek-b5.svg" alt="Boseek 铂寻" width="150" height="54" loading="lazy" />
            <p>HunterBuddy，猎头的 AI 工作伙伴。</p>
            <p>铂寻为独立猎头和资深顾问打造。</p>
            <p class="n-footer-mail">联系我们：<a href="mailto:hello@boseekai.com">hello@boseekai.com</a></p>
          </div>
${redesignFooterGroups(up, here)}
        </div>
        <ul class="n-footer-meta" aria-label="版权、网站主体与备案信息">
          <li>&copy; <span data-footer-year>2026</span> 铂寻 Boseek</li>
          <li>网站域名：www.boseekai.com</li>
          <li>网站主体：北京铂寻智能科技有限公司</li>
          <li><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">京ICP备2026068903号-1</a></li>
        </ul>
      </div>
    </footer>
  </body>
</html>
`;
}

function trial(up) {
  return `      <section class="n-dark s-trial" aria-labelledby="s-trial-title">
        <div class="n-wrap s-trial-inner">
          <div>
            <h2 id="s-trial-title">${text(T.trialTitle)}</h2>
            <p>${text(T.trialBody)}</p>
          </div>
          <a class="n-btn n-btn-light" href="${up}#apply">申请试用</a>
        </div>
      </section>`;
}

function hero({ crumbs, kicker, h1, lead, meta }) {
  return `      <section class="n-dark s-hero" aria-labelledby="s-title">
        <div class="n-wrap"><div class="s-col">
          <nav class="s-crumbs" aria-label="当前位置">
            ${crumbs}
          </nav>
          <p class="n-kicker">${text(kicker)}</p>
          <h1 id="s-title">${h1}</h1>
          <p class="s-lead">${text(lead)}</p>${meta ? `\n          ${meta}` : ""}
        </div></div>
      </section>`;
}

function faq(items, title = ["关于这件事，", "大家常问这些。"]) {
  return `      <section class="n-light n-faq s-faq" id="faq" tabindex="-1" aria-labelledby="s-faq-title">
        <div class="n-wrap n-faq-layout">
          <div class="n-section-head">
            <p class="n-kicker">常见问题</p>
            <h2 class="n-h2" id="s-faq-title">${lines(title)}</h2>
          </div>
          <div class="n-faq-list">
${items
  .map(
    ([q, a]) => `            <details>
              <summary><h3>${text(q)}</h3><i aria-hidden="true"></i></summary>
              <p>${text(a)}</p>
            </details>`,
  )
  .join("\n")}
          </div>
        </div>
      </section>`;
}

/* ---------- body blocks (articles and use-case pages share them) ---------- */
function steps(items, example) {
  return `<ol class="s-steps">\n${items
    .map(
      ([title, body, ex]) =>
        `  <li>\n    <h3>${text(title)}</h3>\n    <p>${text(body)}</p>${
          ex ? `\n    <p class="s-example"><span>${text(example)}</span>${text(ex)}</p>` : ""
        }\n  </li>`,
    )
    .join("\n")}\n</ol>`;
}
const cards = (items) =>
  `<ul class="s-cards">\n${items.map(([t, b]) => `  <li>\n    <h3>${text(t)}</h3>\n    <p>${text(b)}</p>\n  </li>`).join("\n")}\n</ul>`;
function demo(d) {
  return `<figure class="s-demo">
  <figcaption>
    <p class="s-demo-context">${text(d.context)}</p>
    <h3>${text(d.title)}</h3>
    <p>${text(d.caption)}</p>
  </figcaption>
  <ul>
${d.items.map(([small, strong, body]) => `    <li><small>${text(small)}</small><strong>${text(strong)}</strong><p>${text(body)}</p></li>`).join("\n")}
  </ul>
</figure>`;
}
function block(item) {
  if (typeof item === "string") return `<p class="s-p">${text(item)}</p>`;
  if (item.list) return `<ul class="s-list">\n${item.list.map((li) => `  <li>${text(li)}</li>`).join("\n")}\n</ul>`;
  if (item.steps) return steps(item.steps);
  if (item.cards) return cards(item.cards);
  if (item.note) return `<p class="s-note">${text(item.note)}</p>`;
  if (item.demo) return demo(item.demo);
  throw new Error(`unknown block ${JSON.stringify(item).slice(0, 60)}`);
}
const section = (id, label, h2, body) => `        <section class="s-section" id="${id}" aria-labelledby="${id}-t">
          <div class="n-wrap"><div class="s-col">
            <p class="s-label">${text(label)}</p>
            <h2 id="${id}-t">${text(h2)}</h2>
${indent(body, "            ")}
          </div></div>
        </section>`;

/* ---------- article ---------- */
function articlePage(a, articles) {
  const up = "../../";
  const self = `${SITE}articles/${a.slug}/`;
  const useCase = a.useCase ? PAGES.find((p) => p.slug === a.useCase) : null;
  const related = [...new Set([...(a.related || []), ...(a.slug === HUB ? [] : [HUB])])]
    .filter((s) => s !== a.slug)
    .map((s) => articles.find((x) => x.slug === s));
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${self}#webpage`, url: self, name: a.title, description: a.description, inLanguage: "zh-CN", isPartOf: { "@id": `${SITE}#website` }, publisher: { "@id": `${SITE}#organization` }, breadcrumb: { "@id": `${self}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${self}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: T.homeName, item: SITE },
        { "@type": "ListItem", position: 2, name: "文章", item: `${SITE}articles/` },
        { "@type": "ListItem", position: 3, name: a.name, item: self },
      ] },
      { "@type": "Article", "@id": `${self}#article`, headline: a.title.replace(/｜HunterBuddy$/, ""), description: a.description, inLanguage: "zh-CN", datePublished: PUBLISHED, dateModified: PUBLISHED, mainEntityOfPage: { "@id": `${self}#webpage` }, author: { "@id": `${SITE}#organization` }, publisher: { "@id": `${SITE}#organization` }, about: { "@id": `${SITE}#hunterbuddy` } },
      { "@type": "FAQPage", "@id": `${self}#faq`, inLanguage: "zh-CN", isPartOf: { "@id": `${self}#webpage` }, mainEntity: a.faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })) },
    ],
  };
  const relatedItems = [
    ...(useCase ? [[`${up}use-cases/${useCase.slug}/`, "使用场景", useCase.zh.name, useCase.zh.teaser]] : []),
    ...related.map((r) => [`${up}articles/${r.slug}/`, "文章", r.name, r.teaser]),
  ];
  return `${head({ title: a.title, description: a.description, canonical: self, graph, ogType: "article", up })}
    <main id="main" tabindex="-1">
      <article>
${hero({
  crumbs: `<a href="${up}">首页</a><span aria-hidden="true">/</span><a href="${up}articles/">文章</a><span aria-hidden="true">/</span><span aria-current="page">${text(a.name)}</span>`,
  kicker: a.kicker,
  h1: lines(a.h1),
  lead: a.answer,
  meta: `<p class="s-meta">铂寻 Boseek<span aria-hidden="true">·</span>发布于 <time datetime="${PUBLISHED}">${PUBLISHED}</time></p>`,
})}

      <div class="n-light s-paper">
        <nav class="s-toc-wrap" aria-labelledby="s-toc-title">
          <div class="n-wrap"><div class="s-col">
            <div class="s-toc">
              <p class="s-label" id="s-toc-title">本文目录</p>
              <ol>
${a.sections.map((s, i) => `                <li><a href="#s${i + 1}">${text(s.h2)}</a></li>`).join("\n")}
              </ol>
            </div>
          </div></div>
        </nav>

${a.sections.map((s, i) => section(`s${i + 1}`, String(i + 1).padStart(2, "0"), s.h2, s.body.map(block).join("\n"))).join("\n\n")}

        <section class="s-section s-related-wrap" aria-labelledby="s-related-title">
          <div class="n-wrap"><div class="s-col">
            <p class="s-label" id="s-related-title">相关阅读</p>
            <ul class="s-related">
${relatedItems.map(([href, kind, name, line]) => `              <li><a href="${href}"><span class="s-related-kind">${kind}</span><strong>${text(name)}</strong><span class="s-related-line">${text(line)}</span></a></li>`).join("\n")}
            </ul>
          </div></div>
        </section>
      </div>

${faq(a.faq, a.faqTitle)}
      </article>

${trial(up)}
    </main>

${foot(up, `a:${a.slug}`)}`;
}

function listPage(articles) {
  const up = "../";
  const self = `${SITE}articles/`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${self}#webpage`, url: self, name: LIST.title, description: LIST.description, inLanguage: "zh-CN", isPartOf: { "@id": `${SITE}#website` }, publisher: { "@id": `${SITE}#organization` }, breadcrumb: { "@id": `${self}#breadcrumb` }, mainEntity: { "@id": `${self}#list` } },
      { "@type": "BreadcrumbList", "@id": `${self}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: T.homeName, item: SITE },
        { "@type": "ListItem", position: 2, name: LIST.name, item: self },
      ] },
      { "@type": "ItemList", "@id": `${self}#list`, itemListElement: articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}articles/${a.slug}/`, name: a.title.replace(/｜HunterBuddy$/, "") })) },
    ],
  };
  return `${head({ title: LIST.title, description: LIST.description, canonical: self, graph, ogType: "website", up })}
    <main id="main" tabindex="-1">
${hero({
  crumbs: `<a href="${up}">首页</a><span aria-hidden="true">/</span><span aria-current="page">${LIST.name}</span>`,
  kicker: LIST.kicker,
  h1: text(LIST.h1),
  lead: LIST.lead,
})}

      <div class="n-light s-paper">
        <section class="s-section s-index-wrap" aria-label="${LIST.name}">
          <div class="n-wrap">
            <ol class="s-index">
${articles
  .map(
    (a, i) => `              <li>
                <a href="${a.slug}/">
                  <span class="s-index-no">${String(i + 1).padStart(2, "0")}</span>
                  <strong>${text(a.title.replace(/｜HunterBuddy$/, ""))}</strong>
                  <span class="s-index-line">${text(a.teaser)}</span>
                  <span class="n-more">阅读全文</span>
                </a>
              </li>`,
  )
  .join("\n")}
            </ol>
          </div>
        </section>
      </div>

${trial(up)}
    </main>

${foot(up, "list")}`;
}

/* ---------- use-case page ---------- */
function useCasePage(entry, articles) {
  const up = "../../";
  const c = entry.zh;
  const self = `${SITE}use-cases/${entry.slug}/`;
  const index = PAGES.indexOf(entry);
  const next = PAGES[(index + 1) % PAGES.length];
  const reading = articles.filter((a) => a.useCase === entry.slug);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${self}#webpage`, url: self, name: c.title, description: c.description, inLanguage: "zh-CN", isPartOf: { "@id": `${SITE}#website` }, about: { "@id": `${SITE}#hunterbuddy` }, publisher: { "@id": `${SITE}#organization` }, breadcrumb: { "@id": `${self}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${self}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: T.homeName, item: SITE },
        { "@type": "ListItem", position: 2, name: c.name, item: self },
      ] },
      { "@type": "FAQPage", "@id": `${self}#faq`, inLanguage: "zh-CN", isPartOf: { "@id": `${self}#webpage` }, mainEntity: c.faq.items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };
  const resultBody = [
    ...c.result.paras.map((p) => `<p class="s-p">${text(p)}</p>`),
    `<h3 class="s-confirm-title">${text(c.result.confirmTitle)}</h3>`,
    `<ul class="s-confirm">\n${c.result.confirm.map((x) => `  <li>${text(x)}</li>`).join("\n")}\n</ul>`,
    `<p class="s-note">${text(c.result.note)}</p>`,
    ...(reading.length
      ? [
          `<h3 class="s-confirm-title">延伸阅读</h3>`,
          `<ul class="s-reading">\n${reading.map((a) => `  <li><a href="${up}articles/${a.slug}/">${text(a.title.replace(/｜HunterBuddy$/, ""))}</a></li>`).join("\n")}\n</ul>`,
        ]
      : []),
  ].join("\n");
  return `${head({ title: c.title, description: c.description, canonical: self, graph, ogType: "article", up })}
    <main id="main" tabindex="-1">
${hero({
  crumbs: `<a href="${up}">首页</a><span aria-hidden="true">/</span><a href="${up}#capabilities">能做什么</a><span aria-hidden="true">/</span><span aria-current="page">${text(c.name)}</span>`,
  kicker: c.kicker,
  h1: lines(c.h1),
  lead: c.lead,
  meta: `<div class="s-actions"><a class="n-btn n-btn-light" href="${up}#apply">申请试用</a><a class="n-link n-link-light" href="#how">${text(T.seeHow)}</a></div>`,
})}

      <div class="n-light s-paper">
${section("method", c.method.label, c.method.h2, [`<p class="s-p">${text(c.method.intro)}</p>`, steps(c.method.steps, T.example)].join("\n"))}

${section("hard", c.hard.label, c.hard.h2, cards(c.hard.items))}

${section("how", c.how.label, c.how.h2, [`<p class="s-p">${text(c.how.intro)}</p>`, steps(c.how.steps, T.example), demo(c.how.card)].join("\n"))}

${section("result", c.result.label, c.result.h2, resultBody)}
      </div>

${faq(c.faq.items, c.faq.h2)}

      <section class="n-dark s-four-wrap" aria-labelledby="s-four-title">
        <div class="n-wrap">
          <p class="n-kicker">${text(T.fourKicker)}</p>
          <h2 class="n-h2" id="s-four-title">${lines(T.fourTitle)}</h2>
          <ol class="s-four">
${PAGES.map(
  (p, i) => `            <li${p === entry ? ' class="is-current"' : p === next ? ' class="is-next"' : ""}>
              <a href="${up}use-cases/${p.slug}/"${p === entry ? ' aria-current="page"' : ""}>
                <span class="s-four-index">${String(i + 1).padStart(2, "0")}${p === entry ? ` · ${text(T.here)}` : p === next ? ` · ${text(T.nextUp)}` : ""}</span>
                <strong>${text(p.zh.name)}</strong>
                <span class="s-four-line">${text(p.zh.teaser)}</span>
              </a>
            </li>`,
).join("\n")}
          </ol>
        </div>
      </section>

${trial(up)}
    </main>

${foot(up, `uc:${entry.slug}`)}`;
}

/* ---------- write ---------- */
const articles = await loadArticles();
const out = [];
for (const a of articles) out.push([`articles/${a.slug}/index.html`, articlePage(a, articles)]);
out.push(["articles/index.html", listPage(articles)]);
for (const p of PAGES) out.push([`use-cases/${p.slug}/index.html`, useCasePage(p, articles)]);
for (const [path, html] of out) {
  if (html.includes("；")) throw new Error(`${path}: 不用中文分号`);
  const target = resolve(OUT, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
  console.log(`wrote ${target.replace(root + "/", "")}`);
}
