(() => {
  const iconPaths = {
    chevronRight: ["m9 18 6-6-6-6"],
    chevronLeft: ["m15 18-6-6 6-6"],
    play: ["m8 5 11 7-11 7Z"],
    pause: ["M9 5v14", "M15 5v14"],
    close: ["M6 6l12 12", "M18 6 6 18"],
    menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
    check: ["m5 12 4 4L19 6"],
    user: ["M20 21a8 8 0 0 0-16 0", "M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"],
    users: [
      "M16 21a6 6 0 0 0-12 0",
      "M10 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
      "M20 8a3 3 0 0 1-3 3",
      "M18 15a5 5 0 0 1 4 5",
    ],
    building: [
      "M4 22V3h12v19",
      "M16 9h4v13",
      "M8 7h4",
      "M8 11h4",
      "M8 15h4",
      "M8 19h4",
    ],
    briefcase: [
      "M3 7h18v14H3Z",
      "M8 7V3h8v4",
      "M3 12a20 20 0 0 0 18 0",
      "M12 11v4",
    ],
    target: [
      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
      "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z",
      "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    ],
    file: ["M6 2h9l5 5v15H6Z", "M14 2v6h6", "M9 13h6", "M9 17h6"],
    link: [
      "M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2",
      "M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2",
    ],
  };

  function escape(value) {
    return String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  }

  function icon(name) {
    return `<svg class="f-icon" viewBox="0 0 24 24" aria-hidden="true">${(
      iconPaths[name] || iconPaths.chevronRight
    )
      .map((path) => `<path d="${path}" />`)
      .join("")}</svg>`;
  }

  function brand(small = false) {
    return `<span class="f-brand${small ? " f-brand-small" : ""}"><img src="assets/boseek-wordmark.svg" alt="Boseek 铂寻" width="187" height="187" /></span>`;
  }

  function button(label, href, secondary = false) {
    return `<a class="${secondary ? "f-text-link" : "f-button"}" href="${escape(href)}">${escape(label)}${icon("chevronRight")}</a>`;
  }

  function iconButton(name, label, attributes = "") {
    return `<button type="button" class="f-icon-button" aria-label="${escape(label)}" ${attributes}>${icon(name)}<span class="f-tooltip" aria-hidden="true">${escape(label)}</span></button>`;
  }

  function mountNavigation(header) {
    const nav = header.querySelector(".f-nav");
    const toggle = header.querySelector("[data-menu-toggle]");
    const mobile = matchMedia("(max-width: 800px)");

    const close = (restoreFocus = false) => {
      nav.hidden = mobile.matches;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "打开导航");
      toggle.innerHTML = `${icon("menu")}<span class="f-tooltip" aria-hidden="true">打开导航</span>`;
      if (restoreFocus) toggle.focus({ preventScroll: true });
    };

    const sync = () => {
      toggle.hidden = !mobile.matches;
      close();
    };

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) return close();
      nav.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "关闭导航");
      toggle.innerHTML = `${icon("close")}<span class="f-tooltip" aria-hidden="true">关闭导航</span>`;
    });

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;
      close();
      if (mobile.matches) {
        document
          .querySelector(link.getAttribute("href"))
          ?.focus({ preventScroll: true });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        close(true);
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (
        !header.contains(event.target) &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        close(true);
      }
    });

    mobile.addEventListener("change", sync);
    sync();

    const sentinel = document.querySelector(".f-header-sentinel");
    new IntersectionObserver(([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    }).observe(sentinel);

    const links = [...nav.querySelectorAll("a[href^='#']")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    let sectionObserver;
    const observeSections = () => {
      sectionObserver?.disconnect();
      const navHeight =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--f-nav-h",
          ),
        ) ||
        header.getBoundingClientRect().height ||
        72;
      const viewportHeight = Math.max(2, innerHeight);
      const probe = Math.min(
        viewportHeight - 2,
        Math.max(navHeight + 12, Math.floor(viewportHeight * 0.22)),
      );
      const update = () => {
        const current = sections.find((section) => {
          const bounds = section.getBoundingClientRect();
          return bounds.top <= probe && bounds.bottom > probe;
        });
        links.forEach((link) => {
          if (current && link.getAttribute("href") === `#${current.id}`)
            link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      };
      sectionObserver = new IntersectionObserver(update, {
        rootMargin: `-${probe}px 0px -${viewportHeight - probe - 2}px 0px`,
        threshold: 0,
      });
      sections.forEach((section) => sectionObserver.observe(section));
      update();
    };
    observeSections();
    addEventListener("resize", observeSections);
  }

  function mountTabs(tablist, panel, onSelect) {
    const tabs = [...tablist.querySelectorAll("[role='tab']")];
    const select = (index, focus = false) => {
      tabs.forEach((tab, tabIndex) => {
        tab.setAttribute("aria-selected", String(tabIndex === index));
        tab.tabIndex = tabIndex === index ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", tabs[index].id);
      onSelect(index);
      if (focus) tabs[index].focus({ preventScroll: true });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(index));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft")
          next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });
    select(0);
    return { select };
  }

  function createDialog() {
    const dialog = document.createElement("dialog");
    dialog.className = "f-dialog";
    dialog.setAttribute("aria-labelledby", "f-dialog-title");
    dialog.innerHTML = `<div class="f-dialog-header"><h2 id="f-dialog-title"></h2>${iconButton("close", "关闭", "data-dialog-close")}</div><div class="f-dialog-body"></div>`;
    document.body.append(dialog);
    let trigger = null;
    const close = () => dialog.close();
    dialog
      .querySelector("[data-dialog-close]")
      .addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        close();
    });
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("f-dialog-open");
      // Native close can restore focus before this queued event runs.
      if (
        document.activeElement === document.body ||
        dialog.contains(document.activeElement)
      ) {
        trigger?.focus({ preventScroll: true });
      }
    });
    return {
      open(title, html, source) {
        trigger = source || document.activeElement;
        dialog.querySelector("#f-dialog-title").textContent = title;
        dialog.querySelector(".f-dialog-body").innerHTML = html;
        if (!dialog.open) dialog.showModal();
        dialog.scrollTop = 0;
        document.documentElement.classList.add("f-dialog-open");
        dialog
          .querySelector("[data-dialog-close]")
          .focus({ preventScroll: true });
      },
      close,
      element: dialog,
    };
  }

  function mountStablePanel(panel, variants) {
    const measurer = document.createElement("div");
    measurer.className = panel.className;
    measurer.setAttribute("aria-hidden", "true");
    measurer.inert = true;
    Object.assign(measurer.style, {
      position: "fixed",
      top: "0",
      left: "0",
      visibility: "hidden",
      pointerEvents: "none",
      minHeight: "0",
      height: "auto",
    });
    document.body.append(measurer);
    let lastWidth = 0;
    const measure = () => {
      const width = panel.getBoundingClientRect().width;
      if (!width) return;
      lastWidth = width;
      measurer.style.width = `${width}px`;
      let height =
        parseFloat(
          getComputedStyle(panel).getPropertyValue("--f-panel-floor"),
        ) || 0;
      variants.forEach((html) => {
        measurer.innerHTML = html;
        height = Math.max(height, measurer.getBoundingClientRect().height);
      });
      panel.style.minHeight = `${Math.ceil(height)}px`;
    };
    const observer = new ResizeObserver(() => {
      if (Math.abs(panel.getBoundingClientRect().width - lastWidth) > 0.5)
        measure();
    });
    observer.observe(panel);
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      observer.disconnect();
      measurer.remove();
    };
  }

  window.FinesseUI = {
    escape,
    icon,
    brand,
    button,
    iconButton,
    mountNavigation,
    mountTabs,
    createDialog,
    mountStablePanel,
  };
})();
