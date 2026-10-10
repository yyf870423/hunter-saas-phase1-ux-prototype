(() => {
  function mount(root, data, ui) {
    if (!root?.querySelector(".f-hero") || root.dataset.signalMounted) return;
    const work = root.querySelector("#work");
    const tabs = [...work.querySelectorAll('[role="tab"]')];
    const panel = work.querySelector(".f-work-panel");
    const intro = work.querySelector(".f-work-intro");
    if (tabs.length !== data.works.length || !panel || !intro) return;

    const opening = document.createElement("section");
    opening.className = "s-opening";
    opening.innerHTML =
      '<div class="f-container s-opening-grid"><span class="s-section-label">业务场景</span></div>';
    opening.firstElementChild.append(intro);
    root.querySelector(".f-hero").after(opening);

    const overview = document.createElement("div");
    overview.className = "s-overview";
    overview.innerHTML =
      '<div class="f-container"><div class="s-overview-heading"></div></div>';
    const premise = intro.querySelector("p");
    overview.querySelector(".s-overview-heading").append(premise);
    const tablist = work.querySelector(".f-tabs");
    tablist.classList.add("s-scenario-tabs");
    overview.firstElementChild.append(tablist);
    work.querySelector(":scope > .f-container").classList.add("s-work-content");
    work.querySelector(".f-work-demo").classList.add("s-work-switcher");
    work.prepend(overview);

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
