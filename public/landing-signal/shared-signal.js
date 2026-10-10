(() => {
  function mount(root, data, ui) {
    if (!root?.querySelector(".f-hero") || root.dataset.signalMounted) return;
    const work = root.querySelector("#work");
    const tabs = [...work.querySelectorAll('[role="tab"]')];
    const panel = work.querySelector(".f-work-panel");
    const intro = work.querySelector(".f-work-intro");
    if (tabs.length !== data.works.length || !panel || !intro) return;

    const snapshots = data.works.map((item, index) => {
      tabs[index].click();
      return {
        lead: panel.querySelector(".f-work-lead").cloneNode(true),
        result: panel.querySelector(".f-result").cloneNode(true),
      };
    });
    tabs[1].click();
    panel.getAnimations().forEach((animation) => animation.cancel());
    panel.removeAttribute("role");
    panel.removeAttribute("aria-labelledby");
    panel.removeAttribute("tabindex");
    work.querySelector(".f-tabs").remove();
    work.querySelector(".f-work-demo").classList.add("s-client-brief");
    work.querySelector(".f-work-bottom button").dataset.signalWork =
      data.works[1].id;

    const opening = document.createElement("section");
    opening.className = "s-opening";
    opening.innerHTML =
      '<div class="f-container s-opening-grid"><span class="s-section-label">业务场景</span></div>';
    opening.firstElementChild.append(intro);
    root.querySelector(".f-hero").after(opening);

    const overview = document.createElement("nav");
    overview.className = "s-overview";
    overview.setAttribute("aria-label", "业务场景选择");
    overview.innerHTML = `<div class="f-container"><div class="s-overview-heading"></div><div class="s-overview-links">${data.works.map((item) => `<a href="#${item.id === data.works[1].id ? "work" : `s-work-${ui.escape(item.id)}`}"><span>${ui.escape(item.label)}</span>${ui.icon("chevronRight")}</a>`).join("")}</div></div>`;
    const premise = intro.querySelector("p");
    overview.querySelector(".s-overview-heading").append(premise);
    opening.after(overview);

    const capabilities = document.createElement("section");
    capabilities.className = "s-capabilities";
    const container = document.createElement("div");
    container.className = "f-container";
    capabilities.append(container);
    const images = [
      [0, "ai-talent-evidence-cn.webp", "人物经历与研究依据关联的工作画面"],
      [2, "ai-company-mapping-cn.webp", "目标团队与关键人物关联的工作画面"],
      [
        3,
        "ai-research-talent-cn.webp",
        "候选人、专业成果与职业机会关联的工作画面",
      ],
    ];
    images.forEach(([index, file, alt]) => {
      const item = data.works[index];
      const article = document.createElement("article");
      article.className = "s-capability";
      article.id = `s-work-${item.id}`;
      article.dataset.signalWork = item.id;
      article.innerHTML = `<div class="s-capability-top"><figure><img src="assets/${file}" alt="${alt}" width="1536" height="1024" loading="lazy" /></figure></div><div class="s-capability-result"></div><div class="f-work-bottom"><button type="button" class="f-text-link" data-signal-evidence="${ui.escape(item.id)}">查看研究依据 ${ui.icon("chevronRight")}</button></div>`;
      article.querySelector(".s-capability-top").prepend(snapshots[index].lead);
      article
        .querySelector(".s-capability-result")
        .append(snapshots[index].result);
      container.append(article);
    });
    work.after(capabilities);

    const dialog = ui.createDialog();
    root.querySelectorAll("[data-signal-evidence]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = data.works.find(
          (candidate) => candidate.id === button.dataset.signalEvidence,
        );
        dialog.open(
          `${item.label} · 研究依据`,
          `<h3>来源与判断</h3><ul class="f-evidence-list">${item.evidence.map((source) => `<li><strong>${ui.escape(source.title)}</strong><p>${ui.escape(source.copy)}</p></li>`).join("")}</ul><h3>仍需核实</h3><ul class="f-evidence-list">${item.questions.map((question) => `<li><p>${ui.escape(question)}</p></li>`).join("")}</ul>`,
          button,
        );
      });
    });

    const about = root.querySelector(".f-about-copy");
    const aboutTitle = about.querySelector("h2");
    root.querySelector(".f-about > .f-container").classList.add("s-about-grid");
    about.before(aboutTitle);
    root.querySelector(".f-about-image").remove();
    root.querySelector(".f-hero-breath img").alt =
      "人物、公司与招聘线索相连的工作空间";
    root.dataset.signalMounted = "true";
  }
  window.SignalHomepage = { mount };
})();
