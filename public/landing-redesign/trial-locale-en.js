// English for the shared trial form on the English redesign page (en/index.html).
// (Named trial-locale-en.js so it never collides with landing-origin/locale-en.js, the catalog it reads, when both sit at the site root.)
// The form scripts (../landing/shared-ui.js, trial-form.js) ask window.FinesseLocale for every label, option,
// hint and error, so this supplies it, using the live English site's catalog (../landing-origin/locale-en.js,
// loaded just before this file). Only presentation text is translated, never form values.
(() => {
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
    catalog.set(`请选择${zh}，选择其他时请补充内容`, `Select your ${en}. If you choose Other, add details.`);
    catalog.set(`${zh}内容过长，请精简后再提交`, `Please shorten your ${en}.`);
    catalog.set(`请检查${zh}后重新提交`, `Check your ${en} and submit again.`);
    catalog.set(`其他${zh}`, `Specify your ${en}`);
  }
  catalog.set("请选择目前同时在做的岗位数", "Select a range");
  catalog.set("其他职位", "Specify your job title");

  function text(value) {
    if (typeof value !== "string") return value;
    const normalized = value.trim();
    const translated = catalog.get(normalized);
    if (translated !== undefined) return value.replace(normalized, translated);
    if (/\p{Script=Han}/u.test(normalized)) missing.add(normalized);
    return value;
  }

  function translateDOM(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    for (const node of texts) {
      if (!node.parentElement?.closest("script,style,textarea,[data-no-translate]")) node.nodeValue = text(node.nodeValue);
    }
    for (const node of [root, ...root.querySelectorAll("*")]) {
      if (!node.getAttribute || node.closest?.("[data-no-translate]")) continue;
      for (const name of ["aria-label", "aria-roledescription", "title", "alt", "placeholder", "data-label"])
        if (node.hasAttribute(name)) node.setAttribute(name, text(node.getAttribute(name)));
    }
  }

  function html(source) {
    const template = document.createElement("template");
    template.innerHTML = source;
    translateDOM(template.content);
    return template.innerHTML;
  }

  window.FinesseLocale = { language: "en", text, html, missing };
})();
