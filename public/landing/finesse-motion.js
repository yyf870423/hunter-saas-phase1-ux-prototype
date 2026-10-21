/* 第二版 · 实景大图 — presentation, interaction and motion layer (runs after page.js has rendered). */
(() => {
  const root = document.querySelector("#homepage");
  const hero = root?.querySelector(".f-hero");
  if (!root || !hero || root.classList.contains("s-homepage")) {
    document.documentElement.classList.remove("motion");
    return;
  }
  root.classList.add("fx-on");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const wide = matchMedia("(min-width: 1000px)");
  const EASE = "cubic-bezier(.2, .75, .2, 1)";
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ---------------- hero: the promise leads ---------------- */
  const copy = hero.querySelector(".f-hero-copy");
  const title = copy.querySelector("h1");
  const statement = copy.querySelector(".f-hero-statement");
  const soon = copy.querySelector(".f-coming-soon");
  const mark = el("p", "fx-mark", "HunterBuddy");
  title.classList.add("fx-promise");
  title.innerHTML = '<span class="fx-line">从杂乱的信息里，</span><span class="fx-line">找出岗位、人和时机。</span>';
  copy.prepend(mark);
  statement?.remove();
  if (soon) copy.append(soon);

  /* ---------------- hero: camera push-in as the page scrolls ---------------- */
  const breath = hero.querySelector(".f-hero-breath");
  const depth = hero.querySelector(".f-hero-depth");
  const veil = el("div", "fx-veil");
  veil.setAttribute("aria-hidden", "true");
  hero.querySelector(".f-hero-inner").before(veil);
  let heroRaf = 0;
  const push = () => {
    heroRaf = 0;
    if (!root.classList.contains("fx-push")) return;
    const e = clamp(scrollY / Math.max(1, hero.offsetHeight));
    const k = e * e * (3 - 2 * e);
    breath.style.transform = `scale(${(1.02 + 0.3 * k).toFixed(4)})`;
    depth.style.transform = `translateY(${(e * 70).toFixed(1)}px)`;
    copy.style.transform = `translateY(${(-80 * k).toFixed(1)}px)`;
    copy.style.opacity = String(1 - clamp(k * 1.5));
    veil.style.opacity = String(clamp(k * 1.3));
  };
  const pushOn = () => {
    const on = !reduced.matches;
    root.classList.toggle("fx-push", on);
    if (!on) {
      [breath, depth, copy].forEach((n) => { n.style.transform = ""; n.style.opacity = ""; });
      veil.style.opacity = "0";
    } else push();
  };
  addEventListener("scroll", () => { if (!heroRaf) heroRaf = requestAnimationFrame(push); }, { passive: true });
  reduced.addEventListener?.("change", pushOn);
  pushOn();

  /* ---------------- 产品短片: chapters sit on a lens distance scale ---------------- */
  const FILM_LEN = 134.5;
  const CHAPTERS = [
    [10, "发现新岗位"],
    [36.5, "摸清团队"],
    [61, "为岗位找人"],
    [89.5, "为人选找机会"],
    [112, "人和关系都存下来了"],
  ];
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const film = el("section", "fx-film");
  film.id = "film";
  film.setAttribute("aria-labelledby", "fx-film-title");
  film.innerHTML = `
    <div class="f-container">
      <header class="fx-film-head">
        <p class="fx-film-kicker">产品短片 · 两分钟</p>
        <h2 id="fx-film-title"><span class="ln">两分钟，</span><span class="ln">跟着一家公司走一遍。</span></h2>
        <p class="fx-film-lead">周一早上，你让 HunterBuddy 盯着的赛道里有了新消息：星川机器人刚拿到融资。接下来两分钟，看它怎么从这条新闻出发，帮你拿到岗位、摸清团队、找到人选，半年后又帮候选人找到下一个机会。建议打开声音。</p>
      </header>
      <figure class="fx-film-frame">
        <video data-film src="media/hunterbuddy-finesse.mp4?v=20261021" poster="media/finesse-film-poster.jpg?v=20261021" controls playsinline preload="metadata" aria-label="HunterBuddy 两分钟产品短片"></video>
      </figure>
      <div class="fx-scale" style="--p: 0">
        <div class="fx-scale-track" aria-hidden="true"><span class="fx-scale-head"></span></div>
        <ol class="fx-scale-marks" aria-label="短片章节">${CHAPTERS.map(
          ([t, name]) =>
            `<li style="--at: ${((t / FILM_LEN) * 100).toFixed(2)}%"><button type="button" data-t="${t}" aria-pressed="false"><span class="fx-mark-time">${mmss(t)}</span><span class="fx-mark-name">${name}</span></button></li>`,
        ).join("")}</ol>
      </div>
    </div>`;
  hero.after(film);
  const video = film.querySelector("video");
  /* the film shows its cover with no player controls until someone starts it */
  if (video) {
    video.removeAttribute("controls");
    video.tabIndex = 0;
    const start = () => { video.controls = true; video.play()?.catch?.(() => {}); };
    video.addEventListener("click", () => { if (!video.controls) start(); });
    video.addEventListener("keydown", (e) => { if (!video.controls && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); start(); } });
    video.addEventListener("play", () => { video.controls = true; });
  }
  const scale = film.querySelector(".fx-scale");
  const marks = [...film.querySelectorAll(".fx-scale-marks button")];
  const markChapter = (index) => marks.forEach((b, i) => b.setAttribute("aria-pressed", String(i === index)));
  const follow = () => {
    scale.style.setProperty("--p", String(clamp(video.currentTime / (video.duration || FILM_LEN))));
    let index = -1;
    marks.forEach((b, i) => {
      if (video.currentTime >= Number(b.dataset.t)) index = i;
    });
    markChapter(video.currentTime > 0 || !video.paused ? index : -1);
  };
  let filmRaf = 0;
  const tick = () => {
    follow();
    filmRaf = video.paused ? 0 : requestAnimationFrame(tick);
  };
  marks.forEach((b, i) =>
    b.addEventListener("click", () => {
      try {
        video.currentTime = Number(b.dataset.t);
      } catch {
        /* metadata not loaded yet: playback starts from the top */
      }
      video.play()?.catch?.(() => {});
      markChapter(i);
    }),
  );
  video.addEventListener("play", () => { if (!filmRaf) filmRaf = requestAnimationFrame(tick); });
  video.addEventListener("timeupdate", follow);
  video.addEventListener("seeked", follow);
  new IntersectionObserver(([en]) => !en.isIntersecting && !video.paused && video.pause(), { threshold: 0 }).observe(video);

  /* ---------------- research: chapters scroll past a pinned photo ---------------- */
  const research = root.querySelector("#research");
  const story = window.FinesseResearchChaptersData;
  let steps = [];
  let photos = [];
  let dots = [];
  if (research && story?.chapters?.length) {
    const box = el("div", "fx-story");
    const stepCol = el("div", "fx-steps");
    const photoCol = el("div", "fx-photo-col");
    const frame = el("div", "fx-photo");
    const dotRow = el("div", "fx-dots");
    dotRow.setAttribute("aria-hidden", "true");
    story.chapters.forEach((chapter, i) => {
      const step = el("article", "fx-step");
      step.innerHTML = `<span class="fx-no">0${i + 1} · ${chapter.label || ""}</span><h3>${chapter.titleLines.map((line) => `<span>${line}</span>`).join("")}</h3><p>${chapter.copy}</p>`;
      stepCol.append(step);
      const img = el("img");
      img.src = `${chapter.photo.src}`;
      img.alt = chapter.photo.alt;
      img.loading = "lazy";
      img.decoding = "async";
      img.style.objectPosition = chapter.photo.position;
      frame.append(img);
      dotRow.append(el("i"));
    });
    frame.append(dotRow);
    photoCol.append(frame);
    box.append(stepCol, photoCol);
    research.querySelector(".p-intro").after(box);
    steps = [...stepCol.children];
    photos = [...frame.querySelectorAll("img")];
    dots = [...dotRow.children];
  }
  let storyIndex = -1;
  const showChapter = (i) => {
    if (i === storyIndex) return;
    storyIndex = i;
    steps.forEach((s, k) => s.classList.toggle("is-on", k === i));
    photos.forEach((p, k) => p.classList.toggle("is-on", k === i));
    dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
  };
  const followStory = () => {
    if (!root.classList.contains("fx-story-on")) return;
    const mid = innerHeight * 0.5;
    let best = 0, gap = Infinity;
    steps.forEach((s, k) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < gap) { gap = d; best = k; }
    });
    showChapter(best);
  };
  const storyOn = () => {
    const on = steps.length > 0 && wide.matches && !reduced.matches;
    root.classList.toggle("fx-story-on", on);
    if (on) followStory();
  };
  addEventListener("scroll", followStory, { passive: true });
  wide.addEventListener?.("change", storyOn);
  reduced.addEventListener?.("change", storyOn);
  storyOn();

  /* ---------------- 研究资产: a research route map ---------------- */
  // The five assets are places on a light map; relations are roads. Each task is a route:
  // its roads turn blue, its stops are numbered, and a marker keeps travelling along it.
  const net = root.querySelector(".f-asset-network");
  const resources = window.FinesseHomepageData?.resources;
  const model = window.FinesseHomepageData?.assetNetwork;
  if (net && resources && model) {
    const NS = "http://www.w3.org/2000/svg";
    const svgEl = (tag, attrs = {}, text) => {
      const n = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      if (text != null) n.textContent = text;
      return n;
    };
    const W = 760;
    const WIDE = { h: 460, at: { company: [175, 122], job: [590, 104], candidate: [388, 258], contact: [168, 370], research: [598, 368] } };
    // on phones the map turns portrait so labels keep their room
    const TALL = { h: 980, at: { company: [190, 170], job: [580, 150], candidate: [385, 500], contact: [175, 830], research: [585, 810] } };
    let H = WIDE.h, PLACE = WIDE.at;
    const BEND = { demand: -0.14, role: 0.16, experience: -0.1, fit: 0.1, connection: -0.14, authorship: 0.12 };
    const info = new Map(resources.map((r) => [r.id, r]));
    const control = (edge) => {
      const [ax, ay] = PLACE[edge.from], [bx, by] = PLACE[edge.to];
      const mx = (ax + bx) / 2, my = (ay + by) / 2, len = Math.hypot(bx - ax, by - ay);
      const nx = -(by - ay) / len, ny = (bx - ax) / len, c = (BEND[edge.id] || 0.1) * len;
      return [mx + nx * c, my + ny * c];
    };
    const curve = (edge, reverse = false) => {
      const [cx, cy] = control(edge);
      const [a, b] = reverse ? [PLACE[edge.to], PLACE[edge.from]] : [PLACE[edge.from], PLACE[edge.to]];
      return { start: a, d: `Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0]} ${b[1]}`, end: b };
    };
    const holder = el("div", "fx-map");
    holder.setAttribute("aria-hidden", "true");
    net.querySelector(".f-network-map").after(holder);
    net.classList.add("fx-map-on");
    let parts = null, lastPath = "", route = null, routeLen = 0, mapOn = false, travelRaf = 0;

    const contours = () => {
      const g = svgEl("g", { class: "fx-contours" });
      const sy = H / 460;
      [[300, 170, [36, 66, 98, 132]], [640, 260, [28, 54, 82]], [110, 250, [30, 58]], [470, 420, [40, 74]]].forEach(([cx, cy0, radii], h) => {
        const cy = cy0 * sy;
        radii.forEach((r, i) => {
          let d = "";
          for (let s = 0; s <= 48; s++) {
            const a = (s / 48) * Math.PI * 2;
            const rr = r * (1 + 0.12 * Math.sin(a * 3 + h + i * 0.7) + 0.06 * Math.cos(a * 5 + h));
            d += `${s ? "L" : "M"}${(cx + Math.cos(a) * rr * 1.25).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.85).toFixed(1)}`;
          }
          g.append(svgEl("path", { d: d + "Z" }));
        });
      });
      return g;
    };

    const build = () => {
      const w = holder.clientWidth || 640;
      const k = W / w;
      const compact = w < 560;
      ({ h: H, at: PLACE } = compact ? TALL : WIDE);
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: compact ? "is-compact" : "" });
      const defs = svgEl("defs");
      const clip = svgEl("clipPath", { id: "fx-map-clip" });
      clip.append(svgEl("rect", { x: 0, y: 0, width: W, height: H, rx: 18 }));
      defs.append(clip);
      svg.append(defs);
      const ground = svgEl("g", { "clip-path": "url(#fx-map-clip)" });
      ground.append(svgEl("rect", { x: 0, y: 0, width: W, height: H, class: "fx-ground" }));
      ground.append(contours());
      svg.append(ground);
      const roads = new Map();
      const roadLayer = svgEl("g");
      const inkLayer = svgEl("g");
      const labelLayer = svgEl("g");
      model.edges.forEach((edge) => {
        const c = curve(edge);
        const d = `M${c.start[0]} ${c.start[1]} ${c.d}`;
        const g = svgEl("g", { class: `fx-road${edge.pending ? " is-pending" : ""}` });
        g.append(svgEl("path", { d, class: "fx-road-case" }), svgEl("path", { d, class: "fx-road-line" }));
        roadLayer.append(g);
        const ink = svgEl("path", { d, class: `fx-road-ink${edge.pending ? " is-pending" : ""}` });
        inkLayer.append(ink);
        const [cx, cy] = control(edge);
        const [ax, ay] = c.start, [bx, by] = c.end;
        const lx = 0.25 * ax + 0.5 * cx + 0.25 * bx, ly = 0.25 * ay + 0.5 * cy + 0.25 * by;
        const t = svgEl("g", { class: "fx-road-tag" });
        t.append(svgEl("text", { x: lx, y: ly - 3 * k, "font-size": (12.5 * k).toFixed(1), class: "fx-road-label" }, edge.label));
        t.append(svgEl("text", { x: lx, y: ly + 12 * k, "font-size": (10.5 * k).toFixed(1), class: "fx-road-note" }, edge.note));
        labelLayer.append(t);
        roads.set(edge.id, { g, ink, tag: t });
      });
      svg.append(roadLayer, inkLayer);
      const marker = svgEl("g", { class: "fx-traveller" });
      marker.append(svgEl("circle", { r: 13 * k, class: "fx-traveller-halo" }), svgEl("circle", { r: 5 * k, class: "fx-traveller-dot" }));
      const pins = new Map();
      Object.entries(PLACE).forEach(([id, [x, y]]) => {
        const g = svgEl("g", { class: `fx-pin${id === "candidate" ? " is-hub" : ""}` });
        g.append(svgEl("circle", { cx: x, cy: y, r: 10 * k, class: "fx-pin-ring" }));
        g.append(svgEl("circle", { cx: x, cy: y, r: 4 * k, class: "fx-pin-dot" }));
        const stop = svgEl("g", { class: "fx-stop" });
        stop.append(svgEl("circle", { cx: x, cy: y, r: 11 * k }));
        const num = svgEl("text", { x, y: y + 4 * k, "font-size": (11 * k).toFixed(1) }, "");
        stop.append(num);
        g.append(stop);
        const right = x < W * 0.62;
        const card = svgEl("g", { class: "fx-card" });
        const lx = x + (right ? 20 : -20) * k;
        const label = svgEl("text", { x: lx, y: y - (compact ? -5 : 2) * k, "font-size": ((compact ? 13 : 16) * k).toFixed(1), class: "fx-card-label", "text-anchor": right ? "start" : "end" }, info.get(id).label);
        card.append(label);
        if (!compact) card.append(svgEl("text", { x: lx, y: y + 15 * k, "font-size": (11 * k).toFixed(1), class: "fx-card-detail", "text-anchor": right ? "start" : "end" }, info.get(id).detail));
        g.append(card);
        pins.set(id, { g, num });
      });
      const pinLayer = svgEl("g");
      pins.forEach(({ g }) => pinLayer.append(g));
      svg.append(labelLayer, marker, pinLayer);
      const routePath = svgEl("path", { class: "fx-route-probe" });
      svg.append(routePath);
      holder.replaceChildren(svg);
      parts = { roads, pins, marker, routePath, k };
      // place cards behind a soft plate so they stay legible over roads
      pins.forEach(({ g }) => {
        const card = g.querySelector(".fx-card");
        const bb = card.getBBox();
        const plate = svgEl("rect", { x: bb.x - 8 * k, y: bb.y - 5 * k, width: bb.width + 16 * k, height: bb.height + 10 * k, rx: 8 * k, class: "fx-card-plate" });
        card.prepend(plate);
      });
      lastPath = "";
      update(false);
    };

    const update = (animate = true) => {
      if (!parts) return;
      const path = model.paths.find((p) => p.id === net.dataset.activePath) || model.paths[0];
      if (path.id === lastPath) return;
      lastPath = path.id;
      const motion = animate && !reduced.matches;
      parts.roads.forEach(({ g, ink, tag }, id) => {
        const i = path.edges.indexOf(id);
        g.classList.toggle("is-active", i >= 0);
        tag.classList.toggle("is-active", i >= 0);
        ink.classList.toggle("is-active", i >= 0);
        ink.getAnimations?.().forEach((a) => a.cancel());
        if (i >= 0 && motion && !ink.classList.contains("is-pending")) {
          const len = ink.getTotalLength();
          ink.animate([{ strokeDasharray: `${len}`, strokeDashoffset: len }, { strokeDasharray: `${len}`, strokeDashoffset: 0 }], { duration: 650, delay: 100 + i * 260, easing: EASE, fill: "backwards" });
        }
      });
      parts.pins.forEach(({ g, num }, id) => {
        const i = path.nodes.indexOf(id);
        g.classList.toggle("is-active", i >= 0);
        num.textContent = i >= 0 ? String(i + 1) : "";
      });
      // one continuous route through the task's roads, for the travelling marker
      let at = path.nodes[0], d = `M${PLACE[at][0]} ${PLACE[at][1]}`;
      path.edges.forEach((id) => {
        const edge = model.edges.find((e) => e.id === id);
        const reverse = edge.to === at;
        const c = curve(edge, reverse);
        if (c.start !== PLACE[at]) d += ` M${c.start[0]} ${c.start[1]}`;
        d += ` ${c.d}`;
        at = reverse ? edge.from : edge.to;
      });
      parts.routePath.setAttribute("d", d);
      routeLen = parts.routePath.getTotalLength();
      route = { started: performance.now() + (motion ? 100 + path.edges.length * 260 : 0), dur: 1900 * path.edges.length };
      travel();
    };

    const travel = () => { if (!travelRaf) travelRaf = requestAnimationFrame(step); };
    const step = (now) => {
      travelRaf = 0;
      if (!parts || !route || !mapOn || document.hidden || reduced.matches) { parts?.marker.setAttribute("opacity", "0"); return; }
      const t = ((now - route.started) % route.dur + route.dur) % route.dur / route.dur;
      const visible = now >= route.started;
      const pt = parts.routePath.getPointAtLength(t * routeLen);
      parts.marker.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      parts.marker.setAttribute("opacity", visible ? (Math.min(1, t * 8, (1 - t) * 8)).toFixed(2) : "0");
      travelRaf = requestAnimationFrame(step);
    };

    new MutationObserver(() => update()).observe(net, { attributes: true, attributeFilter: ["data-active-path"] });
    new IntersectionObserver(([en]) => { mapOn = en.isIntersecting; travel(); }).observe(holder);
    document.addEventListener("visibilitychange", travel);
    let lastW = 0;
    new ResizeObserver(() => {
      const w = Math.round(holder.clientWidth);
      if (w && Math.abs(w - lastW) > 4) { lastW = w; build(); }
    }).observe(holder);
    build();
  }

  /* ---------------- about: the photo drifts as it passes ---------------- */
  const aboutImg = root.querySelector(".f-about-image img");
  if (aboutImg) {
    let raf = 0;
    const drift = () => {
      raf = 0;
      if (reduced.matches) { aboutImg.style.transform = ""; return; }
      const r = aboutImg.parentElement.getBoundingClientRect();
      const t = clamp((innerHeight - r.top) / (innerHeight + r.height));
      aboutImg.style.transform = `translateY(${((t - 0.5) * -40).toFixed(1)}px) scale(1.08)`;
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(drift); }, { passive: true });
    drift();
  }

  /* ---------------- reveals: images open like curtains, text settles ---------------- */
  window.__hbReveal = true;
  if (!document.documentElement.classList.contains("motion") || !Element.prototype.animate) {
    document.documentElement.classList.remove("motion");
    return;
  }
  const rise = (y = 28) => [{ opacity: 0, transform: `translate3d(0, ${y}px, 0)` }, { opacity: 1, transform: "none" }];
  const FILM_IN = [{ opacity: 0, transform: "scale(.96)", filter: "blur(12px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }];
  const HAZE = (y) => [{ opacity: 0, transform: `translate3d(0, ${y}px, 0)`, filter: "blur(8px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }];
  const curtain = [{ opacity: 1, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, clipPath: "inset(0% 0 0 0)" }];
  const SPEC = [
    [".fx-film-head > *", rise(28), (i) => i * 120, 1000],
    [".fx-film-frame", FILM_IN, () => 200, 1400],
    [".fx-scale", HAZE(14), () => 380, 1000],
    [".f-work-intro > *", rise(30), (i) => i * 110, 1000],
    [".f-work-demo .f-tabs", rise(18), () => 0, 800],
    [".f-work-panel", rise(30), () => 140, 1000],
    [".f-work-bottom", rise(12), () => 240, 800],
    [".p-intro h2 > span", rise(30), (i) => i * 120, 1000],
    [".p-intro > p", rise(20), () => 240, 900],
    [".fx-steps", rise(30), () => 0, 1000],
    [".fx-photo-col", curtain, () => 150, 1400],
    [".f-memory h2", rise(30), () => 0, 1000],
    [".f-memory .f-container > p", rise(22), () => 150, 900],
    [".f-network-tabs", rise(16), () => 0, 800],
    [".f-network-story", rise(26), () => 120, 900],
    [".f-network-figure", rise(30), () => 220, 1000],
    [".f-network-origin", rise(12), () => 300, 800],
    [".f-about-copy > *", rise(26), (i) => i * 100, 900],
    [".f-about-image", curtain, () => 120, 1500],
    [".f-trial-intro > *", rise(24), (i) => i * 90, 900],
    [".f-trial-content", rise(40), () => 160, 1000],
  ];
  const jobs = new Map();
  const add = (n, frames, delay, duration) => { if (!jobs.has(n)) jobs.set(n, { frames, delay, duration }); };
  SPEC.forEach(([sel, frames, delay, duration]) => {
    const seen = new Map();
    root.querySelectorAll(sel).forEach((n) => {
      const i = seen.get(n.parentElement) || 0;
      seen.set(n.parentElement, i + 1);
      add(n, frames, delay(i), duration);
    });
  });
  document.querySelectorAll(".f-footer .f-footer-top > *, .f-footer .f-footer-bottom").forEach((n, i) => add(n, rise(16), i * 80, 800));

  const show = (n) => {
    const job = jobs.get(n);
    n.classList.add("in");
    n.animate(job.frames, { duration: job.duration, delay: job.delay, easing: EASE, fill: "backwards" });
    if (n.matches(".f-about-image"))
      n.querySelector("img")?.animate([{ scale: 1.18 }, { scale: 1 }], { duration: 1800, delay: job.delay, easing: EASE, fill: "backwards" });
  };
  const pending = new Set();
  // the film waits for its poster, then comes out of the haze (the 第三版 entrance)
  const filmVideo = document.querySelector(".fx-film-frame video");
  const posterIn = filmVideo?.poster
    ? new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = filmVideo.poster; })
    : null;
  const whenFilm = (n, go) =>
    posterIn && (n.contains(filmVideo) || n.matches(".fx-scale")) ? Promise.race([posterIn, new Promise((r) => setTimeout(r, 900))]).then(go) : go();
  const reveal = (n) => { if (!pending.delete(n)) return; io.unobserve(n); whenFilm(n, () => show(n)); };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && reveal(en.target)), {
    rootMargin: "0px 0px -8% 0px",
  });
  addEventListener(
    "scroll",
    () => {
      if (pending.size && innerHeight + scrollY >= document.documentElement.scrollHeight - 4)
        [...pending].filter((n) => n.getBoundingClientRect().top < innerHeight).forEach(reveal);
    },
    { passive: true },
  );
  jobs.forEach((_, n) => {
    if (n.getBoundingClientRect().bottom < 0) n.classList.add("in");
    else { pending.add(n); io.observe(n); }
  });

  // the hero arrives once: brand line, the promise line by line, then the rest
  [...copy.children].forEach((n, i) => {
    n.classList.add("in");
    n.animate(rise(i === 1 ? 26 : 16), { duration: 1100, delay: 100 + i * 130, easing: EASE, fill: "backwards" });
  });
})();
