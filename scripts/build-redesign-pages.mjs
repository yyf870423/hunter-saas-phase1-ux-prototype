// 改版首页（public/landing-redesign/）配套的“使用场景”页面，用改版首页的头部、页脚和字体：
//   landing-redesign/use-cases/index.html          使用场景列表
//   landing-redesign/use-cases/<slug>/index.html   九篇：客户开发（由原来的客户开发场景页改写成同一格式）和八篇实务文章
// 2026-10-25 起“使用场景”和“文章”合并：原来四个场景页里组织架构、职位寻访、人选维护三页和文章内容重复，去掉，
// 线上旧网址由主站 301 到对应的新页面（见 docs/seo-geo-plan.md）。客户开发没有对应文章，保留在原网址。
// 正文：八篇在 scripts/articles/*.mjs，客户开发来自 scripts/use-cases/pages.mjs 的中文稿（这里做了几处更正）。
// 页面样式在 landing-redesign/subpage.css，交互在 landing-redesign/subpage.js。
// 改版首页还在预览阶段，所以和首页一样带 noindex。上主站时去掉 noindex，并把 ../landing-origin/ 的资源路径换成主站路径。
// 运行：node scripts/build-redesign-pages.mjs
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { COMMON } from "./use-cases/content.mjs";
import { PAGES } from "./use-cases/pages.mjs";
import { PUBLISHED, checkArticle, loadArticles } from "./build-articles.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.boseekai.com/";
const OUT = resolve(root, "public/landing-redesign");
const V = { redesign: "21", subpage: "20261025-a", subpageJs: "20261025-a" };
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
  name: "使用场景",
  title: "使用场景：猎头客户开发、组织架构图、找人、人岗匹配与人才库｜HunterBuddy",
  description:
    "写给独立猎头和资深顾问的使用场景：猎头怎么找客户、公司组织架构图怎么画、猎头怎么找人、人岗匹配怎么做、同名候选人怎么区分、人才库怎么建，以及猎头能用 AI 助手做哪些事。",
  kicker: "使用场景",
  h1: "使用场景",
  lead: "从客户开发、组织架构到找人、匹配和人选维护，把猎头每天最花时间的几件事讲清楚：一般怎么做、难在哪里、HunterBuddy 能帮什么，哪些还得你自己来。",
};
// 列表和页脚的顺序：按一个职位从客户开发走到人选维护，再是几篇通用的
const ORDER = [
  "business-development",
  "org-chart",
  "finding-candidates",
  "job-matching",
  "same-name-candidates",
  "talent-pool",
  "headhunter-consultant",
  "ai-assistant-for-headhunters",
  "ai-tools-compared",
];
// 页脚“使用场景”一栏：五篇主要的（链接文字用各篇的主攻词），最后一行“全部 >>”
const FOOTER = [
  ["business-development", "客户开发"],
  ["org-chart", "组织架构图"],
  ["finding-candidates", "猎头怎么找人"],
  ["job-matching", "人岗匹配"],
];

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
    <link rel="stylesheet" href="${up}../landing/shared-ui.css?v=20261021" />
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

// the footer: the same three groups as the redesigned homepage (产品 / 使用场景 / 法律)
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
${FOOTER.map(([slug, label]) => `                <li><a href="${up}use-cases/${slug}/"${cur(slug)}>${text(label)}</a></li>`).join("\n")}
                <li><a href="${up}use-cases/"${cur("list")}>全部 &gt;&gt;</a></li>
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
  if (item.steps) return steps(item.steps, T.example);
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

/* ---------- one 使用场景 page (all nine share the format) ---------- */
function page(a, items) {
  const up = "../../";
  const self = `${SITE}use-cases/${a.slug}/`;
  const related = [...new Set([...(a.related || []), ...(a.slug === HUB ? [] : [HUB])])]
    .filter((s) => s !== a.slug)
    .map((s) => {
      const r = items.find((x) => x.slug === s);
      if (!r) throw new Error(`${a.slug}: related ${s} not found`);
      return r;
    });
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${self}#webpage`, url: self, name: a.title, description: a.description, inLanguage: "zh-CN", isPartOf: { "@id": `${SITE}#website` }, publisher: { "@id": `${SITE}#organization` }, breadcrumb: { "@id": `${self}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${self}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: T.homeName, item: SITE },
        { "@type": "ListItem", position: 2, name: LIST.name, item: `${SITE}use-cases/` },
        { "@type": "ListItem", position: 3, name: a.name, item: self },
      ] },
      { "@type": "Article", "@id": `${self}#article`, headline: a.title.replace(/｜HunterBuddy$/, ""), description: a.description, inLanguage: "zh-CN", datePublished: a.published || PUBLISHED, dateModified: PUBLISHED, mainEntityOfPage: { "@id": `${self}#webpage` }, author: { "@id": `${SITE}#organization` }, publisher: { "@id": `${SITE}#organization` }, about: { "@id": `${SITE}#hunterbuddy` } },
      { "@type": "FAQPage", "@id": `${self}#faq`, inLanguage: "zh-CN", isPartOf: { "@id": `${self}#webpage` }, mainEntity: a.faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })) },
    ],
  };
  return `${head({ title: a.title, description: a.description, canonical: self, graph, ogType: "article", up })}
    <main id="main" tabindex="-1">
      <article>
${hero({
  crumbs: `<a href="${up}">首页</a><span aria-hidden="true">/</span><a href="${up}use-cases/">${LIST.name}</a><span aria-hidden="true">/</span><span aria-current="page">${text(a.name)}</span>`,
  kicker: a.kicker,
  h1: lines(a.h1),
  lead: a.answer,
  meta: `<p class="s-meta">铂寻 Boseek<span aria-hidden="true">·</span>更新于 <time datetime="${PUBLISHED}">${PUBLISHED}</time></p>`,
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
${related.map((r) => `              <li><a href="${up}use-cases/${r.slug}/"><span class="s-related-kind">${LIST.name}</span><strong>${text(r.name)}</strong><span class="s-related-line">${text(r.teaser)}</span></a></li>`).join("\n")}
            </ul>
          </div></div>
        </section>
      </div>

${faq(a.faq, a.faqTitle)}
      </article>

${trial(up)}
    </main>

${foot(up, a.slug)}`;
}

function listPage(items) {
  const up = "../";
  const self = `${SITE}use-cases/`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${self}#webpage`, url: self, name: LIST.title, description: LIST.description, inLanguage: "zh-CN", isPartOf: { "@id": `${SITE}#website` }, publisher: { "@id": `${SITE}#organization` }, breadcrumb: { "@id": `${self}#breadcrumb` }, mainEntity: { "@id": `${self}#list` } },
      { "@type": "BreadcrumbList", "@id": `${self}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: T.homeName, item: SITE },
        { "@type": "ListItem", position: 2, name: LIST.name, item: self },
      ] },
      { "@type": "ItemList", "@id": `${self}#list`, itemListElement: items.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${self}${a.slug}/`, name: a.title.replace(/｜HunterBuddy$/, "") })) },
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
${items
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

/* ---------- 客户开发: the old use-case page, rewritten into the same format, with a few corrections ---------- */
function businessDevelopment() {
  const c = PAGES.find((p) => p.slug === "business-development").zh;
  const how = c.how.steps.map((step) =>
    step[0] === "找到用人经理"
      ? [step[0], step[1], "负责视觉团队的是技术负责人许晴，很可能就是这个职位的用人经理，直接联系方式待确认。"]
      : step,
  );
  // BD 客户研判 (on the homepage) gets its own step after the two sources are matched
  how.splice(2, 0, [
    "BD 客户研判：值不值得跟",
    "它把融资动态、创始团队、岗位和业务信号放在一起，看需求是不是真的、付不付得起猎头费、合作上有没有风险，再理清决策链和优先级。有依据的写明来源，没依据的标为待确认。",
    "真实需求、付费潜力都有依据：刚拿到 B 轮，招聘页上了新职位。合作风险待确认：以前和猎头合作过没有、谁拍板，还不清楚。",
  ]);
  const card = {
    ...c.how.card,
    items: [
      c.how.card.items[0],
      ["研判 · 有依据", "真实需求、付费潜力", "刚拿到 B 轮，招聘页上了新职位。合作风险待确认。"],
      ["可能的用人经理", "许晴 · 技术负责人", "负责视觉团队，直接联系方式待确认。"],
      c.how.card.items[2],
    ],
  };
  return {
    slug: "business-development",
    name: c.name,
    title: c.title,
    description: c.description,
    kicker: "使用场景 · 猎头客户开发",
    h1: c.h1,
    answer:
      "新客户常常藏在一条不起眼的消息里。HunterBuddy 帮你盯着关注的赛道，从融资新闻出发，找到新职位、可能的用人经理和引荐路线，判断值不值得跟，每条线索都写明来源。联系谁、怎么开口，由你决定。",
    teaser: c.teaser,
    related: ["org-chart", "finding-candidates", "ai-assistant-for-headhunters"],
    sections: [
      { h2: "猎头客户开发，一般怎么做？", body: [c.method.intro, { steps: c.method.steps }] },
      // 平台名只在工具对比那一篇里出现
      { h2: "难的不是打电话，是知道该打给谁", body: [{ cards: c.hard.items.map(([t, b]) => [t, b.replace("领英和脉脉上", "职业社交平台上")]) }] },
      { h2: "HunterBuddy 怎么帮你做客户开发？", body: [c.how.intro, { steps: how }, { demo: card }] },
      {
        h2: "你会拿到什么，哪些要你确认？",
        body: [
          "一条两处来源对得上的职位线索、一位很可能的用人经理，加一条备用的引荐路线。直接联系还是请人引荐、怎么开口，你说了算。拿到 JD、谈妥委托，它才是你手上的正式职位。",
          c.result.paras[1],
          { list: c.result.confirm },
          { note: c.result.note },
        ],
      },
    ],
    faq: c.faq.items,
    faqTitle: c.faq.h2,
  };
}

/* ---------- write ---------- */
const articles = await loadArticles();
const all = [businessDevelopment(), ...articles];
const items = ORDER.map((slug) => {
  const it = all.find((a) => a.slug === slug);
  if (!it) throw new Error(`missing ${slug}`);
  return it;
});
if (items.length !== all.length) throw new Error("ORDER does not list every page");
let failed = false;
for (const a of items) {
  const problems = checkArticle(a);
  if (problems.length) {
    failed = true;
    console.error(`${a.slug}: ${problems.join("，")}`);
  }
}
if (failed) process.exit(1);
// the old, separate pages are gone: 文章 (merged in here) and the three use-case pages the articles replace
await rm(resolve(OUT, "articles"), { recursive: true, force: true });
for (const old of ["talent-mapping", "sourcing", "candidate-nurturing"])
  await rm(resolve(OUT, "use-cases", old), { recursive: true, force: true });
const out = [["use-cases/index.html", listPage(items)], ...items.map((a) => [`use-cases/${a.slug}/index.html`, page(a, items)])];
for (const [path, html] of out) {
  if (html.includes("；")) throw new Error(`${path}: 不用中文分号`);
  const target = resolve(OUT, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
  console.log(`wrote ${target.replace(root + "/", "")}`);
}
