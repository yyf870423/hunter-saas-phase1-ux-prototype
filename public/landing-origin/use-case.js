// 使用场景页：顶部导航的菜单按钮（中文 900px、英文 1120px 以下收进菜单，和首页一致）和页脚年份。
// 页面内容都是静态写好的，不运行这个脚本也能完整阅读。
(() => {
  const year = document.querySelector("[data-footer-year]");
  if (year) year.textContent = new Date().getFullYear();

  const header = document.querySelector(".f-header");
  const nav = header?.querySelector(".f-nav");
  const toggle = header?.querySelector("[data-menu-toggle]");
  if (!nav || !toggle) return;

  const english = document.documentElement.lang === "en";
  const mobile = matchMedia(`(max-width: ${english ? 1120 : 900}px)`);
  const svg = (paths) =>
    `<svg class="f-icon" viewBox="0 0 24 24" aria-hidden="true">${paths.map((d) => `<path d="${d}" />`).join("")}</svg>`;
  const icons = {
    open: svg(["M4 6h16", "M4 12h16", "M4 18h16"]),
    close: svg(["M6 6l12 12", "M18 6 6 18"]),
  };
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const set = (open, restoreFocus = false) => {
    const label = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    nav.hidden = mobile.matches && !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", label);
    toggle.innerHTML = `${open ? icons.close : icons.open}<span class="f-tooltip" aria-hidden="true">${label}</span>`;
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };
  const sync = () => {
    toggle.hidden = !mobile.matches;
    set(false);
  };

  toggle.addEventListener("click", () => set(!isOpen()));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) set(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) set(false, true);
  });
  document.addEventListener("pointerdown", (event) => {
    if (isOpen() && !header.contains(event.target)) set(false, true);
  });
  mobile.addEventListener("change", sync);
  sync();
})();
