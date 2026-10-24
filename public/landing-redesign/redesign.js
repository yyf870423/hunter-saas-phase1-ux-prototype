// 官网改版草稿的交互：
// 头部在首屏透明，往下滚隐藏，往上滚时带着深色底出现。
// 云海随滚动和指针分层移动，雾气用镜像拼接无缝平移。
// 照片墙平时是灰的，鼠标经过时点亮，离开后停一下再慢慢暗下去，触屏上自己轮流亮起。
// 没有脚本时，页面内容照样完整可读。
(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const narrow = matchMedia("(max-width: 900px)");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- smooth scrolling, the way the reference site moves ---------- */
  if (window.Lenis && !reduced.matches) {
    window.__lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
      autoRaf: true,
    });
  }

  /* ---------- header ---------- */
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("#n-nav");
  const menu = document.querySelector("[data-menu]");
  const hero = document.querySelector(".n-hero");
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

  // nav state follows the section in view
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const targets = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const seen = new Map();
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => seen.set(entry.target, entry.isIntersecting));
        const current = targets.find((t) => seen.get(t));
        navLinks.forEach((a) => {
          if (current && a.getAttribute("href") === `#${current.id}`) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => spy.observe(t));
  }

  /* ---------- the cloud sea ---------- */
  // mist: image, mirror, image, mirror, so a −50% pan loops without a seam
  document.querySelectorAll(".n-layer-mist img, .n-dawn-mist img").forEach((img) => {
    const build = () => {
      if (!img.isConnected || img.closest(".n-pan")) return;
      const pan = document.createElement("div");
      pan.className = "n-pan";
      img.replaceWith(pan);
      pan.append(img);
      for (let i = 0; i < 3; i += 1) {
        const copy = img.cloneNode();
        copy.removeAttribute("onerror");
        copy.removeAttribute("fetchpriority");
        pan.append(copy);
      }
    };
    if (img.complete && img.naturalWidth) build();
    else img.addEventListener("load", build, { once: true });
  });

  const layers = [
    { el: document.querySelector(".n-layer-base"), scroll: 0.12, px: 6, py: 4 },
    { el: document.querySelector(".n-mist-a"), scroll: 0.3, px: 18, py: 8 },
    { el: document.querySelector(".n-layer-front"), scroll: 0.42, px: 26, py: 12 },
    { el: document.querySelector(".n-mist-b"), scroll: 0.55, px: 34, py: 14 },
  ];
  const heroCopy = document.querySelector("[data-hero-copy]");
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let heroVisible = true;
  let frame = 0;

  function paintHero() {
    frame = 0;
    if (!heroVisible || reduced.matches) return;
    const h = hero.offsetHeight || innerHeight;
    const y = clamp(scrollY, 0, h);
    const p = y / h;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    layers.forEach(({ el, scroll, px, py }) => {
      if (!el || !el.isConnected) return;
      const dx = -pointer.x * px;
      const dy = y * scroll - pointer.y * py;
      el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    });
    if (heroCopy) {
      heroCopy.style.transform = `translate3d(0, ${(-y * 0.18).toFixed(2)}px, 0)`;
      heroCopy.style.opacity = String(clamp(1 - p * 1.6));
    }
    if (Math.abs(pointer.tx - pointer.x) > 0.002 || Math.abs(pointer.ty - pointer.y) > 0.002) requestHero();
  }

  function requestHero() {
    if (!frame) frame = requestAnimationFrame(paintHero);
  }

  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) requestHero();
    }).observe(hero);
  }
  hero?.addEventListener("pointermove", (event) => {
    if (!fine.matches) return;
    pointer.tx = (event.clientX / innerWidth) * 2 - 1;
    pointer.ty = (event.clientY / innerHeight) * 2 - 1;
    requestHero();
  });
  hero?.addEventListener("pointerleave", () => {
    pointer.tx = 0;
    pointer.ty = 0;
    requestHero();
  });

  /* ---------- the dawn: the browser bar follows the page from night to day ---------- */
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const firstLight = document.querySelector(".n-caps");
  function syncTheme() {
    if (!themeMeta || !firstLight) return;
    const light = firstLight.getBoundingClientRect().top < 40;
    themeMeta.content = light ? "#f5f5f6" : "#0f1011";
  }

  addEventListener(
    "scroll",
    () => {
      syncHeader();
      syncTheme();
      requestHero();
    },
    { passive: true },
  );
  addEventListener("resize", requestHero, { passive: true });
  syncHeader();
  syncTheme();
  requestHero();

  /* ---------- 六件事: the text pinned on the left follows the picture passing the middle ---------- */
  const steps = [...document.querySelectorAll("[data-scrolly] .n-step")];
  if (steps.length && "IntersectionObserver" in window) {
    const activate = (step) => {
      const at = steps.indexOf(step);
      if (at < 0 || step.classList.contains("is-active")) return;
      steps.forEach((s, i) => {
        s.classList.toggle("is-active", i === at);
        s.classList.toggle("is-past", i < at);
      });
    };
    const watch = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activate(entry.target.closest(".n-step"));
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    steps.forEach((step) => {
      watch.observe(step.querySelector(".n-figure"));
      // keyboard users tabbing into a step bring it forward
      step.addEventListener("focusin", () => activate(step));
    });
    // centre each pinned text in the screen by its own height, without shifting it up
    // (a shift would push the first text over the section heading before it pins)
    const centre = () => {
      steps.forEach((step) => {
        const text = step.querySelector(".n-step-text");
        const top = Math.max(96, Math.round((innerHeight - text.offsetHeight) / 2));
        text.style.setProperty("--stick", `${top}px`);
      });
    };
    centre();
    addEventListener("resize", centre, { passive: true });
    document.fonts?.ready.then(centre);

    // pictures fade in as they rise towards the middle of the screen and fade out as they leave it,
    // so only the picture of the current step is fully clear; the step whose picture is nearest
    // the middle is the active one (measured on every scroll, so a fast scroll never skips a step)
    let figFrame = 0;
    const paintFigures = () => {
      figFrame = 0;
      const mid = innerHeight / 2;
      let best = null;
      let gap = Infinity;
      steps.forEach((step) => {
        const fig = step.querySelector(".n-figure");
        const r = fig.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < gap) {
          gap = d;
          best = step;
        }
        const k = clamp(1 - (d - innerHeight * 0.06) / (innerHeight * 0.42));
        fig.style.setProperty("--vis", (0.12 + 0.88 * k * k * (3 - 2 * k)).toFixed(3));
      });
      if (best && gap < innerHeight * 0.5) activate(best);
    };
    const requestFigures = () => {
      if (!figFrame) figFrame = requestAnimationFrame(paintFigures);
    };
    addEventListener("scroll", requestFigures, { passive: true });
    addEventListener("resize", requestFigures, { passive: true });
    requestFigures();
  }

  /* ---------- scroll-linked motion ---------- */
  const film = document.querySelector(".n-film-frame");
  const photo = document.querySelector(".n-belief-photo");
  const photoImg = photo?.querySelector("img");
  let linkFrame = 0;
  function paintLinked() {
    linkFrame = 0;
    if (reduced.matches) return;
    const vh = innerHeight;
    if (film) {
      // grows from 90% to full size as it rises into view
      const r = film.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.75));
      film.style.transform = `scale(${(0.9 + 0.1 * p).toFixed(4)})`;
    }
    if (photo && photoImg) {
      const r = photo.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = clamp((vh - r.top) / (vh + r.height));
        photo.style.transform = `scale(${(0.94 + 0.06 * clamp(p * 2)).toFixed(4)})`;
        photoImg.style.transform = `translate3d(0, ${((p - 0.5) * -12).toFixed(2)}%, 0)`;
      }
    }
  }
  const requestLinked = () => {
    if (!linkFrame) linkFrame = requestAnimationFrame(paintLinked);
  };
  addEventListener("scroll", requestLinked, { passive: true });
  addEventListener("resize", requestLinked, { passive: true });
  requestLinked();

  /* ---------- film cover ---------- */
  // the poster is the film's cover and carries its own play button, so the browser's controls stay hidden
  // until playback starts (without JavaScript the video keeps its controls)
  const video = document.querySelector("[data-film]");
  if (video) {
    const frame = video.closest("figure");
    const cover = document.createElement("button");
    cover.type = "button";
    cover.className = "n-film-cover";
    cover.setAttribute("aria-label", "播放 HunterBuddy 产品短片，2 分 22 秒");
    video.controls = false;
    frame.appendChild(cover);
    const reveal = () => {
      if (!cover.isConnected) return;
      cover.remove();
      video.controls = true;
    };
    cover.addEventListener("click", () => {
      reveal();
      video.focus({ preventScroll: true });
      video.play().catch(() => {});
    });
    video.addEventListener("play", reveal);
  }

  /* ---------- film chapters ---------- */
  document.querySelectorAll("[data-seek]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!video) return;
      const t = Number(button.dataset.seek) || 0;
      const go = () => {
        video.currentTime = t;
        video.play().catch(() => {});
      };
      if (video.readyState >= 1) go();
      else {
        video.preload = "metadata";
        video.addEventListener("loadedmetadata", go, { once: true });
        video.load();
      }
      const frame = video.closest("figure");
      if (frame && window.__lenis) window.__lenis.scrollTo(frame, { offset: -(innerHeight - frame.offsetHeight) / 2 });
      else frame?.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "center" });
    });
  });

  /* ---------- 深耕各行赛道: the photo wall ---------- */
  // one picture per field and no field twice: the wall uses each of these exactly once.
  // They fill the columns top to bottom, left to right, in this order, which keeps
  // look-alike scenes (the four single lab-coat portraits) out of each other's way
  const pictures = [
    ["internet-1", "互联网"],
    ["quantum", "量子计算"],
    ["ev", "新能源汽车"],
    ["fusion-2", "核聚变"],
    ["meddevice", "医疗器械"],
    ["semi-2", "半导体"],
    ["lowalt", "低空经济"],
    ["cloud-1", "云计算"],
    ["materials", "新材料"],
    ["embodied-1", "具身智能"],
    ["space", "商业航天"],
    ["resources-2", "能源与稀有资源"],
    ["pharma-1", "医药"],
    ["electronics", "消费电子"],
    ["storage-2", "新型储能"],
    ["ai-2", "人工智能"],
    ["autonomous", "自动驾驶"],
    ["synbio", "合成生物"],
  ].map(([file, label]) => ({ src: `assets/wall/${file}.webp`, label }));
  const wall = document.querySelector("[data-wall]");
  const wallSection = wall?.closest("section");
  const tiles = [];

  // a loose, staggered wall: columns of different widths, each pushed up by a different amount,
  // with tiles of different heights, so the edges step past each other instead of lining up in rows
  const PLANS = {
    desk: { counts: [3, 3, 3, 3, 3, 3], widths: [1.0, 1.34, 0.9, 1.2, 1.02, 1.3], shifts: [0.1, 0.02, 0.15, 0.05, 0.12, 0.0] },
    tablet: { counts: [4, 4, 3, 4, 3], widths: [1.1, 0.92, 1.26, 1.0, 1.16], shifts: [0.06, 0.14, 0.0, 0.1, 0.03] },
    phone: { counts: [6, 6, 6], widths: [1.0, 1.22, 0.94], shifts: [0.05, 0.0, 0.1] },
  };
  const HEIGHTS = [0.8, 1.18, 0.95, 1.36, 0.88, 1.08, 1.26, 0.92];
  // and each tile is pulled in a little from one side or the other, so the gaps between columns step too
  const INSETS = [0, 9, 0, 15, 5, 0, 12, 7];

  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeTile(n) {
    const pic = pictures[n];
    const tile = document.createElement("div");
    tile.className = "n-tile";
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = pic.src;
    img.addEventListener("error", () => tile.classList.add("is-empty"), { once: true });
    const name = document.createElement("b");
    name.textContent = pic.label;
    tile.append(img, name);
    tiles.push(tile);
    return tile;
  }

  function layoutWall() {
    if (!wall) return;
    const w = wall.clientWidth || innerWidth;
    const h = wall.clientHeight || 760;
    const mode = w < 640 ? "phone" : w < 1000 ? "tablet" : "desk";
    const stamp = `${mode}:${Math.round(w / 80)}:${Math.round(h / 80)}`;
    if (wall.dataset.stamp === stamp) return;
    wall.dataset.stamp = stamp;
    wall.textContent = "";
    tiles.length = 0;
    const plan = PLANS[mode];
    const rand = seeded(mode === "desk" ? 7 : mode === "tablet" ? 5 : 3);
    const reach = Math.max(...plan.shifts) + 0.06;
    let n = 0;
    plan.counts.forEach((count, c) => {
      const col = document.createElement("div");
      col.className = "n-col";
      col.style.flexGrow = String(plan.widths[c]);
      col.style.height = `${Math.round(h * (1 + reach))}px`;
      col.style.transform = `translateY(${Math.round(-plan.shifts[c] * h)}px)`;
      const end = Math.min(n + count, pictures.length);
      while (n < end) {
        const tile = makeTile(n++);
        tile.style.flexGrow = String(HEIGHTS[Math.floor(rand() * HEIGHTS.length)]);
        const inset = INSETS[Math.floor(rand() * INSETS.length)];
        if (inset) tile.style[rand() < 0.5 ? "marginLeft" : "marginRight"] = `${inset}%`;
        col.append(tile);
      }
      wall.append(col);
    });
  }

  const lit = new Map();
  function light(tile, hold) {
    clearTimeout(lit.get(tile));
    tile.classList.add("is-lit");
    if (hold) lit.set(tile, setTimeout(() => tile.classList.remove("is-lit"), hold));
  }

  if (wall) {
    layoutWall();
    let resizing = 0;
    addEventListener(
      "resize",
      () => {
        clearTimeout(resizing);
        resizing = setTimeout(layoutWall, 150);
      },
      { passive: true },
    );
    let ambient = 0;
    let hasMouse = false;
    const stopAmbient = () => {
      clearInterval(ambient);
      ambient = 0;
    };
    wall.addEventListener("pointerover", (event) => {
      const tile = event.target.closest(".n-tile");
      if (!tile || event.pointerType === "touch") return;
      // a mouse is here: hand the wall over to the pointer
      hasMouse = true;
      stopAmbient();
      light(tile);
    });
    wall.addEventListener("pointerout", (event) => {
      const tile = event.target.closest(".n-tile");
      if (!tile || event.pointerType === "touch" || tile.contains(event.relatedTarget)) return;
      // CSS waits a beat before the slow fade back to grey
      tile.classList.remove("is-lit");
    });
    // a tap lights a tile for a while
    wall.addEventListener("pointerdown", (event) => {
      const tile = event.target.closest(".n-tile");
      if (tile && event.pointerType === "touch") light(tile, 2200);
    });

    // without a mouse, a few tiles take turns lighting up while the wall is on screen
    const tick = () => {
      if (!tiles.length) return;
      const tile = tiles[Math.floor(Math.random() * tiles.length)];
      if (!tile.classList.contains("is-lit")) light(tile, 1400);
    };
    const startAmbient = () => {
      if (ambient || hasMouse || fine.matches || reduced.matches) return;
      ambient = setInterval(tick, 900);
      tick();
    };
    if ("IntersectionObserver" in window && wallSection) {
      new IntersectionObserver(([entry]) => (entry.isIntersecting ? startAmbient() : stopAmbient()), {
        threshold: 0.25,
      }).observe(wallSection);
    }
  }

  /* ---------- trial form (shared with the live site) ---------- */
  const applySlot = document.querySelector("[data-apply]");
  if (applySlot && window.FinesseTrial) {
    applySlot.innerHTML = window.FinesseTrial.render();
    const section = applySlot.querySelector("#apply");
    window.FinesseTrial.mount(section);
    const kicker = document.createElement("p");
    kicker.className = "n-kicker";
    kicker.textContent = "05 · 申请试用";
    section.querySelector(".f-trial-intro")?.prepend(kicker);
    // break after the comma, the same as the live site
    const thought = section.querySelector(".f-trial-thought");
    if (thought) {
      thought.replaceChildren(
        ...["把时间，", "留给真正重要的人。"].map((text) => {
          const line = document.createElement("span");
          line.className = "n-thought-line";
          line.textContent = text;
          return line;
        }),
      );
    }
    section.querySelectorAll('a[href="#work"]').forEach((a) => a.setAttribute("href", "#capabilities"));
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-footer-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- gentle reveals: only for what is still below the fold ---------- */
  if (!reduced.matches && "IntersectionObserver" in window) {
    const items = document.querySelectorAll(
      ".n-section-head, .n-display, .n-lede, .n-belief-head, .n-bounds, .n-wall-panel, .n-faq-list, .f-trial-layout",
    );
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("is-waiting");
          reveal.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => {
      el.classList.add("n-reveal");
      if (el.getBoundingClientRect().top > innerHeight * 0.92) {
        el.classList.add("is-waiting");
        reveal.observe(el);
      }
    });
  }
})();
