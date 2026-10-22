document.querySelectorAll("[data-catalog-icon]").forEach((element) => {
  if (window.FinesseUI)
    element.innerHTML = window.FinesseUI.icon("chevronRight");
});
