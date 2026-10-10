(() => {
  const root = document.querySelector("#homepage");
  const ui = window.FinesseUI;
  if (!root || !ui || !root.querySelector(".f-hero")) return;

  const hero = root.querySelector(".f-hero-copy");
  const status = hero.querySelector(".f-coming-soon");
  if (status) hero.prepend(status);
  const image = root.querySelector(".f-hero-breath img");
  image.alt = "冷色天空与辽阔的银蓝色云海";

  const icons = ["users", "building", "link", "briefcase"];
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

  const network = root.querySelector(".f-asset-network");
  const data = window.FinesseHomepageData;
  if (network && data && window.OriginAssetNetwork) {
    window.OriginAssetNetwork.mount(network, data.assetNetwork);
  }
})();
