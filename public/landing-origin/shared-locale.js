(() => {
  const language =
    new URL(location.href).searchParams.get("lang") === "en" ? "en" : "zh";
  const catalog = new Map(Object.entries(window.OriginEnglishCatalog || {}));
  const missing = new Set();
  const fields = {
    姓名: "name",
    公司: "company",
    电话: "phone number",
    邮箱: "email",
    职位: "role",
    目前同时在做的岗位数: "number of active searches",
    行业: "industry",
  };
  for (const [zh, en] of Object.entries(fields)) {
    catalog.set(`请选择${zh}`, `Select your ${en}`);
    catalog.set(`请填写${zh}`, `Enter your ${en}.`);
    catalog.set(
      `请选择${zh}，选择其他时请补充内容`,
      `Select your ${en}. If you choose Other, add details.`,
    );
    catalog.set(`${zh}内容过长，请精简后再提交`, `Please shorten your ${en}.`);
    catalog.set(`请检查${zh}后重新提交`, `Check your ${en} and submit again.`);
    catalog.set(`其他${zh}`, `Specify your ${en}`);
  }
  catalog.set("请选择目前同时在做的岗位数", "Select a range");
  catalog.set("其他职位", "Specify your job title");

  function text(value) {
    if (language !== "en" || typeof value !== "string") return value;
    const normalized = value.trim();
    const translated = catalog.get(normalized);
    if (translated !== undefined) return value.replace(normalized, translated);
    for (const [prefix, replacement] of [
      ["为什么合适：", "Why they fit: "],
      ["待确认：", "To verify: "],
    ]) {
      if (normalized.startsWith(prefix))
        return replacement + text(normalized.slice(prefix.length));
    }
    if (normalized.endsWith(" · 结果和来源"))
      return (
        text(normalized.slice(0, -" · 结果和来源".length)) +
        " · Results & sources"
      );
    if (
      /\p{Script=Han}/u.test(normalized) &&
      !normalized.includes("京ICP备") &&
      !normalized.includes("北京铂寻智能科技有限公司")
    )
      missing.add(normalized);
    return value;
  }

  // Translate only presentation text and readable attributes, never form values or identifiers.
  function translateDOM(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    for (const node of texts) {
      if (
        !node.parentElement?.closest(
          "script,style,textarea,[data-no-translate]",
        )
      )
        node.nodeValue = text(node.nodeValue);
    }
    for (const node of [root, ...root.querySelectorAll("*")]) {
      if (!node.getAttribute || node.closest?.("[data-no-translate]")) continue;
      for (const name of [
        "aria-label",
        "aria-roledescription",
        "title",
        "alt",
        "placeholder",
        "data-label",
      ])
        if (node.hasAttribute(name))
          node.setAttribute(name, text(node.getAttribute(name)));
    }
  }

  function html(source) {
    if (language !== "en") return source;
    const template = document.createElement("template");
    template.innerHTML = source;
    translateDOM(template.content);
    return template.innerHTML;
  }

  function localizeData(value) {
    if (typeof value === "string") return text(value);
    if (Array.isArray(value)) return value.map(localizeData);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, localizeData(item)]),
      );
    return value;
  }

  window.FinesseLocale = { language, text, html, missing };
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  if (language === "en") {
    for (const name of [
      "FinesseHomepageData",
      "FinesseResearchStoryData",
      "FinesseResearchChaptersData",
    ])
      if (window[name]) window[name] = localizeData(window[name]);
    document.title = "Boseek · HunterBuddy, your AI partner in recruitment";
    document.querySelector('meta[name="description"]').content =
      "Connect hiring signals, talent maps and candidate research. HunterBuddy helps recruiters find opportunities and build shortlists. You make the decisions.";
    translateDOM(document.querySelector("[data-finesse-footer]"));
  }

  function mountSwitch() {
    if (language === "en") {
      document.querySelectorAll(".f-brand img").forEach((logo) => {
        logo.src = "assets/boseek-b5-en.svg";
        logo.alt = "Boseek";
        logo.width = 150;
        logo.height = 48;
      });
      const about = document.querySelector("#f-about-title");
      if (about)
        about.textContent = `${text("铂寻，")} ${text("为猎头化繁解难")}`;
    }
    const actions = document.querySelector(".f-header-actions");
    if (!actions || actions.querySelector("[data-language-switch]")) return;
    const target = language === "en" ? "zh" : "en";
    const link = document.createElement("a");
    const destination = new URL(location.href);
    destination.searchParams.set("lang", target);
    link.href = destination.href;
    link.hreflang = target === "zh" ? "zh-CN" : "en";
    link.lang = link.hreflang;
    link.className = "f-language-switch";
    link.dataset.languageSwitch = target;
    link.title = target === "en" ? "Switch to English" : "切换到中文";
    link.setAttribute("aria-label", link.title);
    link.innerHTML = `<span>${target === "en" ? "EN" : "中文"}</span>`;
    const syncDestination = () => {
      const url = new URL(location.href);
      url.searchParams.set("lang", target);
      link.href = url.href;
    };
    addEventListener("hashchange", syncDestination);
    link.addEventListener("click", syncDestination);
    actions.prepend(link);
  }
  if (document.readyState !== "complete")
    document.addEventListener("DOMContentLoaded", mountSwitch, { once: true });
  else mountSwitch();
})();
