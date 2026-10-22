(() => {
  const footer = document.querySelector("[data-finesse-footer]");
  if (!footer) return;

  function updateYear() {
    const year = footer.querySelector("[data-footer-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  addEventListener("pageshow", updateYear);
  updateYear();

  // The enhanced main content changes the initial fragment position.
  if (location.hash === "#footer") {
    addEventListener(
      "load",
      () => footer.scrollIntoView({ behavior: "instant", block: "start" }),
      { once: true },
    );
  }
})();
