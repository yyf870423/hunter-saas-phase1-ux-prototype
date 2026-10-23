(() => {
  const root = document.querySelector("#homepage");
  const ui = window.FinesseUI;
  if (!root || !ui || !root.querySelector(".f-hero")) return;

  const hero = root.querySelector(".f-hero-copy");
  const status = hero.querySelector(".f-coming-soon");
  if (status) hero.prepend(status);
  document.querySelectorAll(".f-brand img").forEach((img) => (img.src = "assets/boseek-b5-dark.svg"));
  const image = root.querySelector(".f-hero-breath img");
  image.alt = ui.text("冷色天空与辽阔的银蓝色云海");

  const thought = root.querySelector(".f-trial-thought");
  if (thought) {
    thought.replaceChildren(...["把时间，", "留给真正重要的人。"].map((text) => {
      const line = document.createElement("span");
      line.className = "o-trial-thought-line";
      line.textContent = ui.text(text);
      return line;
    }));
  }

  const icons = ["building", "link", "users", "briefcase"];
  root.querySelector(".f-work-demo > .f-tabs").classList.add("o-scenario-tabs");
  root
    .querySelectorAll(".f-work-demo > .f-tabs .f-tab")
    .forEach((tab, index) => {
      const label = document.createElement("span");
      label.textContent = tab.textContent;
      const icon = document.createElement("span");
      icon.className = "o-tab-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = ui.icon(icons[index]);
      tab.replaceChildren(icon, label);
    });

  // 每个场景下面加一个文字链接，进到对应的使用场景页（顺序和四个标签页一致）
  const english = document.documentElement.lang === "en";
  const cases = [
    ["business-development", "了解客户开发", "More on business development"],
    ["talent-mapping", "了解组织架构", "More on org mapping"],
    ["sourcing", "了解职位寻访", "More on sourcing"],
    ["candidate-nurturing", "了解人选维护", "More on candidate nurturing"],
  ];
  const bottom = root.querySelector(".f-work-bottom");
  const tabs = [...root.querySelectorAll(".f-work-demo > .f-tabs .f-tab")];
  if (bottom && tabs.length === cases.length) {
    const more = document.createElement("a");
    more.className = "f-text-link o-case-link";
    bottom.prepend(more);
    const syncCase = () => {
      const index = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
      const [slug, zh, en] = cases[index];
      more.href = `${english ? "en/" : ""}use-cases/${slug}/`;
      more.innerHTML = `${english ? en : zh}${ui.icon("chevronRight")}`;
    };
    new MutationObserver(syncCase).observe(tabs[0].parentElement, { subtree: true, attributeFilter: ["aria-selected"] });
    syncCase();
  }

  const network = root.querySelector(".f-asset-network");
  const data = window.FinesseHomepageData;
  if (network && data && window.OriginAssetNetwork) {
    window.OriginAssetNetwork.mount(network, data.assetNetwork);
  }

  // 常见问题：静态写在 #homepage 外面（不运行脚本也能读到），渲染后移到“人和关系”之后
  const faq = document.getElementById("faq");
  const assets = root.querySelector("#assets");
  if (faq && assets) {
    assets.after(faq);
    const after = root.querySelector('.f-nav a[href="#assets"]');
    if (after && !root.querySelector('.f-nav a[href="#faq"]')) {
      const link = document.createElement("a");
      link.href = "#faq";
      link.textContent = ui.text("常见问题");
      after.after(link);
      // 共用的导航高亮只认页面脚本渲染时已有的链接，这一项单独跟上
      const header = root.querySelector(".f-header");
      let frame = 0;
      const sync = () => {
        frame = 0;
        const top = header?.getBoundingClientRect().height || 72;
        const probe = Math.min(innerHeight - 2, Math.max(top + 12, Math.floor(innerHeight * 0.22)));
        const bounds = faq.getBoundingClientRect();
        if (bounds.top <= probe && bounds.bottom > probe) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      };
      const queue = () => frame || (frame = requestAnimationFrame(sync));
      addEventListener("scroll", queue, { passive: true });
      addEventListener("resize", queue);
      sync();
    }
  }
})();
