// 生成官网的使用场景页：public/landing-origin/use-cases/<slug>/index.html（中文）
// 和 public/landing-origin/en/use-cases/<slug>/index.html（英文）。
// 文案都在 scripts/use-cases/content.mjs，页面上的常见问题和结构化数据 FAQPage 用同一份文字。
// 改了文案或样式版本号后运行：node scripts/build-use-cases.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, COMMON } from "./use-cases/content.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.boseekai.com/";
const VERSION = {
  sharedUi: "20261021",
  page: "20261021",
  footer: "20261021d",
  sharedOrigin: "20261023-uc",
  origin: "20261023-faq",
  motion: "20261023-uc",
  locale: "20261023-faq",
  useCase: "20261023-uc",
};

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const icon = (paths) =>
  `<svg class="f-icon" viewBox="0 0 24 24" aria-hidden="true">${paths.map((d) => `<path d="${d}" />`).join("")}</svg>`;
const chevron = icon(["m9 18 6-6-6-6"]);
const menu = icon(["M4 6h16", "M4 12h16", "M4 18h16"]);
const lines = (parts) => parts.map((part) => `<span class="ln">${text(part)}</span>`).join("<br />");

const url = (lang, slug) => `${SITE}${lang === "en" ? "en/" : ""}use-cases/${slug}/`;

function page(lang, entry) {
  const c = entry[lang];
  const t = COMMON[lang];
  const up = lang === "en" ? "../../../" : "../../"; // 到站点根目录
  const home = lang === "en" ? `${up}en/` : up;
  const self = url(lang, entry.slug);
  const other = lang === "en" ? "zh" : "en";
  const otherHref = `${up}${other === "en" ? "en/" : ""}use-cases/${entry.slug}/`;
  const index = PAGES.indexOf(entry);
  const next = PAGES[(index + 1) % PAGES.length];

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${self}#webpage`,
        url: self,
        name: c.title,
        description: c.description,
        inLanguage: lang === "en" ? "en" : "zh-CN",
        isPartOf: { "@id": `${SITE}#website` },
        about: { "@id": `${SITE}#hunterbuddy` },
        publisher: { "@id": `${SITE}#organization` },
        breadcrumb: { "@id": `${self}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${self}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.homeName, item: lang === "en" ? `${SITE}en/` : SITE },
          { "@type": "ListItem", position: 2, name: c.name, item: self },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${self}#faq`,
        inLanguage: lang === "en" ? "en" : "zh-CN",
        isPartOf: { "@id": `${self}#webpage` },
        mainEntity: c.faq.items.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
  const jsonLd = JSON.stringify(graph, null, 2)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");

  const navLinks = t.nav
    .map(([label, hash]) => `          <a href="${home}#${hash}"${hash === "work" ? ' aria-current="true"' : ""}>${text(label)}</a>`)
    .join("\n");
  const footerProduct = t.nav
    .filter(([, hash]) => hash !== "about")
    .map(([label, hash]) => `                <li><a href="${home}#${hash}">${text(label)}</a></li>`)
    .join("\n");
  const footerCases = PAGES.map(
    (p) =>
      `                <li><a href="${up}${lang === "en" ? "en/" : ""}use-cases/${p.slug}/"${p === entry ? ' aria-current="page"' : ""}>${text(p[lang].name)}</a></li>`,
  ).join("\n");
  const logo =
    lang === "en"
      ? `<img src="${up}assets/boseek-b5-en.svg" alt="Boseek" width="150" height="48"`
      : `<img src="${up}assets/boseek-b5-dark.svg" alt="Boseek 铂寻" width="150" height="54"`;

  const steps = (items) =>
    items
      .map(
        ([title, body, example]) => `            <li>
              <h3>${text(title)}</h3>
              <p>${text(body)}</p>${
                example
                  ? `
              <p class="u-example"><span>${text(t.example)}</span>${text(example)}</p>`
                  : ""
              }
            </li>`,
      )
      .join("\n");

  const html = `<!doctype html>
<html lang="${lang === "en" ? "en" : "zh-CN"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0f1011" />
    <title>${text(c.title)}</title>
    <meta name="description" content="${esc(c.description)}" />
    <link rel="canonical" href="${self}" />
    <link rel="alternate" hreflang="zh-CN" href="${url("zh", entry.slug)}" />
    <link rel="alternate" hreflang="en" href="${url("en", entry.slug)}" />
    <link rel="alternate" hreflang="x-default" href="${url("zh", entry.slug)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${lang === "en" ? "Boseek" : "铂寻 Boseek"}" />
    <meta property="og:title" content="${esc(c.ogTitle)}" />
    <meta property="og:description" content="${esc(c.description)}" />
    <meta property="og:url" content="${self}" />
    <meta property="og:locale" content="${lang === "en" ? "en_US" : "zh_CN"}" />
    <meta property="og:locale:alternate" content="${lang === "en" ? "zh_CN" : "en_US"}" />
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
  <body class="u-page">
    <a class="f-skip" href="#main">${text(t.skip)}</a>
    <header class="f-header">
      <div class="f-container f-header-inner">
        <a href="${home}" aria-label="${esc(t.homeLabel)}"><span class="f-brand">${logo} /></span></a>
        <nav class="f-nav" id="f-navigation" aria-label="${esc(t.navLabel)}">
${navLinks}
        </nav>
        <div class="f-header-actions">
          <a class="f-language-switch" href="${otherHref}" hreflang="${other === "en" ? "en" : "zh-CN"}" lang="${other === "en" ? "en" : "zh-CN"}" title="${esc(t.switchTitle)}" aria-label="${esc(t.switchTitle)}"><span>${text(t.switchLabel)}</span></a>
          <a class="f-login-link" href="${home}#apply">${text(t.apply)}</a>
          <button type="button" class="f-icon-button" aria-label="${esc(t.menuOpen)}" data-menu-toggle data-label-open="${esc(t.menuOpen)}" data-label-close="${esc(t.menuClose)}" aria-controls="f-navigation" aria-expanded="false" hidden>${menu}<span class="f-tooltip" aria-hidden="true">${text(t.menuOpen)}</span></button>
        </div>
      </div>
    </header>

    <main id="main" tabindex="-1">
      <section class="u-hero" aria-labelledby="u-title">
        <div class="f-container">
          <div class="u-col">
            <nav class="u-crumbs" aria-label="${esc(t.crumbsLabel)}">
              <a href="${home}">${text(t.homeShort)}</a><span aria-hidden="true">/</span><a href="${home}#work">${text(t.casesShort)}</a><span aria-hidden="true">/</span><span aria-current="page">${text(c.name)}</span>
            </nav>
            <p class="o-kicker">${text(c.kicker)}</p>
            <h1 id="u-title">${lines(c.h1)}</h1>
            <p class="u-lead">${text(c.lead)}</p>
            <div class="u-actions">
              <a class="f-button" href="${home}#apply">${text(t.apply)}${chevron}</a>
              <a class="f-text-link" href="#how">${text(t.seeHow)}${chevron}</a>
            </div>
          </div>
        </div>
      </section>

      <div class="u-paper">
        <section class="u-section" id="method" aria-labelledby="u-method-title">
          <div class="f-container"><div class="u-col">
            <p class="u-label">${text(c.method.label)}</p>
            <h2 id="u-method-title">${text(c.method.h2)}</h2>
            <p class="u-intro">${text(c.method.intro)}</p>
            <ol class="u-steps">
${steps(c.method.steps)}
            </ol>
          </div></div>
        </section>

        <section class="u-section" id="hard" aria-labelledby="u-hard-title">
          <div class="f-container"><div class="u-col">
            <p class="u-label">${text(c.hard.label)}</p>
            <h2 id="u-hard-title">${text(c.hard.h2)}</h2>
            <ul class="u-cards">
${c.hard.items
  .map(
    ([title, body]) => `              <li>
                <h3>${text(title)}</h3>
                <p>${text(body)}</p>
              </li>`,
  )
  .join("\n")}
            </ul>
          </div></div>
        </section>

        <section class="u-section" id="how" tabindex="-1" aria-labelledby="u-how-title">
          <div class="f-container"><div class="u-col">
            <p class="u-label">${text(c.how.label)}</p>
            <h2 id="u-how-title">${text(c.how.h2)}</h2>
            <p class="u-intro">${text(c.how.intro)}</p>
            <ol class="u-steps">
${steps(c.how.steps)}
            </ol>
          </div></div>
          <div class="f-container">
            <figure class="u-demo" aria-labelledby="u-demo-title">
              <figcaption class="u-demo-lead">
                <p class="u-demo-context">${text(c.how.card.context)}</p>
                <h3 id="u-demo-title">${text(c.how.card.title)}</h3>
                <p>${text(c.how.card.caption)}</p>
              </figcaption>
              <ul class="f-result-list">
${c.how.card.items
  .map(
    ([small, strong, body]) => `                <li><small>${text(small)}</small><strong>${text(strong)}</strong><p>${text(body)}</p></li>`,
  )
  .join("\n")}
              </ul>
            </figure>
          </div>
        </section>

        <section class="u-section" id="result" aria-labelledby="u-result-title">
          <div class="f-container"><div class="u-col">
            <p class="u-label">${text(c.result.label)}</p>
            <h2 id="u-result-title">${text(c.result.h2)}</h2>
${c.result.paras.map((para) => `            <p class="u-intro">${text(para)}</p>`).join("\n")}
            <h3 class="u-confirm-title">${text(c.result.confirmTitle)}</h3>
            <ul class="u-confirm">
${c.result.confirm.map((item) => `              <li>${text(item)}</li>`).join("\n")}
            </ul>
            <p class="u-note">${text(c.result.note)}</p>
          </div></div>
        </section>
      </div>

      <section class="o-faq u-faq" id="faq" tabindex="-1" aria-labelledby="o-faq-title">
        <div class="f-container">
          <div class="o-faq-intro">
            <p class="o-kicker">${text(t.faqKicker)}</p>
            <h2 id="o-faq-title">${lines(c.faq.h2)}</h2>
          </div>
          <div class="o-faq-list">
${c.faq.items
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

      <section class="u-next" aria-labelledby="u-next-title">
        <div class="f-container">
          <div class="u-next-head">
            <p class="o-kicker">${text(t.fourKicker)}</p>
            <h2 id="u-next-title">${lines(t.fourTitle)}</h2>
          </div>
          <ol class="u-four">
${PAGES.map(
  (p, i) => `            <li${p === entry ? ' class="is-current"' : p === next ? ' class="is-next"' : ""}>
              <a href="${up}${lang === "en" ? "en/" : ""}use-cases/${p.slug}/"${p === entry ? ' aria-current="page"' : ""}>
                <span class="u-four-index">${String(i + 1).padStart(2, "0")}${p === entry ? ` · ${text(t.here)}` : p === next ? ` · ${text(t.nextUp)}` : ""}</span>
                <strong>${text(p[lang].name)}</strong>
                <span class="u-four-line">${text(p[lang].teaser)}</span>
              </a>
            </li>`,
).join("\n")}
          </ol>
          <div class="u-trial">
            <div>
              <h2>${text(t.trialTitle)}</h2>
              <p>${text(t.trialBody)}</p>
            </div>
            <a class="f-button" href="${home}#apply">${text(t.apply)}${chevron}</a>
          </div>
        </div>
      </section>
    </main>

    <footer class="f-footer" id="footer" data-finesse-footer>
      <div class="f-container">
        <div class="f-footer-top">
          <div class="f-footer-brand">
            <span class="f-brand">
              ${logo} loading="lazy" />
            </span>
            <div class="f-footer-notes">
${t.footerNotes.map((note) => `              <p>${text(note)}</p>`).join("\n")}
            </div>
          </div>
          <div class="f-footer-groups">
            <div class="f-footer-group" role="group" aria-labelledby="f-footer-product">
              <h2 id="f-footer-product">${text(t.footerProduct)}</h2>
              <ul>
${footerProduct}
              </ul>
            </div>
            <div class="f-footer-group" role="group" aria-labelledby="f-footer-cases">
              <h2 id="f-footer-cases">${text(t.footerCases)}</h2>
              <ul>
${footerCases}
              </ul>
            </div>
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
  return html;
}

for (const entry of PAGES) {
  for (const lang of ["zh", "en"]) {
    if (!entry[lang]?.title) continue; // 还没写完整文案的页面先不生成
    const target = resolve(
      root,
      "public/landing-origin",
      lang === "en" ? "en/use-cases" : "use-cases",
      entry.slug,
      "index.html",
    );
    const html = page(lang, entry);
    if (html.includes("；")) throw new Error(`${entry.slug} ${lang}: 不用中文分号`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
    console.log(`wrote ${target.replace(root + "/", "")}`);
  }
}
