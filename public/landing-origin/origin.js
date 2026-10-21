(() => {
  const root = document.querySelector("#homepage");
  const ui = window.FinesseUI;
  if (!root || !ui || !root.querySelector(".f-hero")) return;

  const hero = root.querySelector(".f-hero-copy");
  const status = hero.querySelector(".f-coming-soon");
  if (status) hero.prepend(status);
  document.querySelectorAll(".f-brand img").forEach((img) => (img.src = "assets/boseek-b5-dark.svg"));
  const image = root.querySelector(".f-hero-breath img");
  image.alt = "冷色天空与辽阔的银蓝色云海";

  const thought = root.querySelector(".f-trial-thought");
  if (thought) {
    thought.replaceChildren(...["把时间，", "留给真正重要的人。"].map((text) => {
      const line = document.createElement("span");
      line.className = "o-trial-thought-line";
      line.textContent = text;
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

  const network = root.querySelector(".f-asset-network");
  const data = window.FinesseHomepageData;
  if (network && data && window.OriginAssetNetwork) {
    window.OriginAssetNetwork.mount(network, data.assetNetwork);
  }
})();
