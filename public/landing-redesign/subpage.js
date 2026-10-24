// 改版首页配套子页面的交互（和首页同一套头部）：
// 头部在页面顶端透明，往下滚隐藏，往上滚时带着深色底出现；窄屏收进菜单按钮。
// 浏览器顶栏颜色跟着页面从夜色走到浅色正文。没有脚本时，页面内容照样完整可读。
(() => {
  const narrow = matchMedia("(max-width: 900px)");
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("#n-nav");
  const menu = document.querySelector("[data-menu]");
  if (!header || !nav || !menu) return;
  let lastY = scrollY;
  let menuOpen = false;

  function syncHeader() {
    const y = scrollY;
    const delta = y - lastY;
    const atTop = y < 24;
    header.classList.toggle("is-top", atTop);
    if (menuOpen) {
      header.classList.remove("is-hidden");
      header.classList.add("is-solid");
    } else if (atTop) {
      header.classList.remove("is-hidden", "is-solid");
    } else if (delta > 4 && y > 120) {
      header.classList.add("is-hidden");
    } else if (delta < -4) {
      header.classList.remove("is-hidden");
      header.classList.add("is-solid");
    }
    if (Math.abs(delta) > 4 || atTop) lastY = y;
  }

  function setMenu(open) {
    menuOpen = open;
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    header.classList.toggle("is-open", open);
    nav.hidden = narrow.matches && !open;
    syncHeader();
  }
  function syncMenuMode() {
    menu.hidden = !narrow.matches;
    setMenu(false);
  }
  menu.addEventListener("click", () => setMenu(!menuOpen));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a") && narrow.matches) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      setMenu(false);
      menu.focus();
    }
  });
  narrow.addEventListener("change", syncMenuMode);
  syncMenuMode();

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const firstLight = document.querySelector(".s-paper");
  function syncTheme() {
    if (!themeMeta || !firstLight) return;
    themeMeta.content = firstLight.getBoundingClientRect().top < 40 ? "#f5f5f6" : "#0f1011";
  }

  addEventListener(
    "scroll",
    () => {
      syncHeader();
      syncTheme();
    },
    { passive: true },
  );
  syncHeader();
  syncTheme();

  document.querySelectorAll("[data-footer-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
