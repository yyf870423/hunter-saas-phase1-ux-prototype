/* 第三版 · 深色云海 — presentation, interaction and motion layer (runs after origin.js). */
(() => {
  const root = document.querySelector("#homepage");
  const hero = root?.querySelector(".f-hero");
  if (!root || !hero) {
    document.documentElement.classList.remove("motion");
    return;
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
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
  const mark = el("p", "o-mark", "HunterBuddy");
  title.classList.add("o-promise");
  title.innerHTML = '<span class="o-line">从杂乱的信息里，</span><span class="o-line">找出岗位、人和时机。</span>';
  title.before(mark);
  statement?.remove();

  /* ---------------- hero: two layers of cloud, and a flight up through them ---------------- */
  const back = hero.querySelector(".f-hero-breath");
  const backImg = back.querySelector("img");
  const front = el("div", "o-front");
  front.setAttribute("aria-hidden", "true");
  const frontImg = el("img");
  frontImg.alt = "";
  frontImg.src = backImg.currentSrc || backImg.src;
  frontImg.decoding = "async";
  front.append(frontImg);
  back.after(front);
  const fly = el("div", "o-fly");
  fly.setAttribute("aria-hidden", "true");
  hero.querySelector(".f-hero-inner").before(fly);
  let raf = 0;
  const flight = () => {
    raf = 0;
    if (!root.classList.contains("o-cloudy")) return;
    const e = clamp(scrollY / Math.max(1, hero.offsetHeight));
    const k = e * e * (3 - 2 * e);
    back.style.transform = `scale(${(1 + 0.12 * k).toFixed(4)})`;
    front.style.transform = `translate3d(0, ${(-150 * k).toFixed(1)}px, 0) scale(${(1 + 0.45 * k).toFixed(4)})`;
    copy.style.transform = `translate3d(0, ${(-90 * k).toFixed(1)}px, 0)`;
    copy.style.opacity = String(1 - clamp(k * 1.6));
    fly.style.opacity = String(clamp(k * 1.4));
  };
  const cloudsOn = () => {
    const on = !reduced.matches;
    root.classList.toggle("o-cloudy", on);
    front.hidden = !on;
    if (!on) {
      [back, front, copy].forEach((n) => { n.style.transform = ""; n.style.opacity = ""; });
      fly.style.opacity = "0";
    } else flight();
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(flight); }, { passive: true });
  reduced.addEventListener?.("change", cloudsOn);
  cloudsOn();

  /* ---------------- 产品短片: chapters are waypoints on a course ---------------- */
  const CHAPTERS = [
    [10, "发现新岗位"],
    [36.5, "摸清团队"],
    [61, "为岗位找人"],
    [89.5, "为人选找机会"],
    [112, "人和关系都存下来了"],
  ];
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const film = el("section", "o-film");
  film.id = "film";
  film.setAttribute("aria-labelledby", "o-film-title");
  film.innerHTML = `
    <div class="f-container">
      <header class="o-film-head">
        <p class="o-film-kicker">产品短片 · 两分钟</p>
        <h2 id="o-film-title"><span class="ln">两分钟，</span><span class="ln">跟着一家公司走一遍。</span></h2>
        <p class="o-film-lead">周一早上，你让 HunterBuddy 盯着的赛道里有了新消息：星川机器人刚拿到融资。接下来两分钟，看它怎么从这条新闻出发，帮你拿到岗位、摸清团队、找到人选，半年后又帮候选人找到下一个机会。建议打开声音。</p>
      </header>
      <figure class="o-film-frame">
        <video data-film src="assets/hunterbuddy-origin.mp4?v=20261021-night" poster="assets/origin-film-poster.jpg?v=20261021-night" controls playsinline preload="metadata" aria-label="HunterBuddy 两分钟产品短片"></video>
      </figure>
      <div class="o-course" style="--p: 0">
        <div class="o-course-line" aria-hidden="true"><span class="o-course-craft"></span></div>
        <ol class="o-course-stops" aria-label="短片章节">${CHAPTERS.map(
          ([t, name], i) =>
            `<li><button type="button" data-t="${t}" aria-pressed="false"><span class="o-stop-dot"></span><span class="o-stop-time">${mmss(t)}</span><span class="o-stop-name">${name}</span></button></li>`,
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
  const course = film.querySelector(".o-course");
  const stops = [...film.querySelectorAll(".o-course-stops button")];
  // the craft reaches waypoint i exactly when chapter i begins, so it travels piecewise
  const coursePos = (time) => {
    const n = CHAPTERS.length;
    const end = video.duration || 134.5;
    for (let i = n - 1; i >= 0; i--) {
      if (time >= CHAPTERS[i][0]) {
        const next = i + 1 < n ? CHAPTERS[i + 1][0] : end;
        return (i + clamp((time - CHAPTERS[i][0]) / Math.max(0.1, next - CHAPTERS[i][0]))) / n;
      }
    }
    return 0;
  };
  const markStop = (index) => stops.forEach((b, i) => {
    b.setAttribute("aria-pressed", String(i === index));
    b.parentElement.classList.toggle("is-passed", i <= index);
  });
  const follow = () => {
    course.style.setProperty("--p", coursePos(video.currentTime).toFixed(4));
    let index = -1;
    stops.forEach((b, i) => {
      if (video.currentTime >= Number(b.dataset.t)) index = i;
    });
    markStop(video.currentTime > 0 || !video.paused ? index : -1);
  };
  let filmRaf = 0;
  const filmTick = () => {
    follow();
    filmRaf = video.paused ? 0 : requestAnimationFrame(filmTick);
  };
  stops.forEach((b, i) =>
    b.addEventListener("click", () => {
      try {
        video.currentTime = Number(b.dataset.t);
      } catch {
        /* metadata not loaded yet: playback starts from the top */
      }
      video.play()?.catch?.(() => {});
      markStop(i);
    }),
  );
  video.addEventListener("play", () => { if (!filmRaf) filmRaf = requestAnimationFrame(filmTick); });
  video.addEventListener("timeupdate", follow);
  video.addEventListener("seeked", follow);
  new IntersectionObserver(([en]) => !en.isIntersecting && !video.paused && video.pause(), { threshold: 0 }).observe(video);

  /* ---------------- dark cards catch a glow that follows the cursor ---------------- */
  const glowTargets = [".o-film-frame", ".p-stage", ".f-trial-form", ".f-work-panel"];
  const hosts = [];
  glowTargets.forEach((sel) =>
    root.querySelectorAll(sel).forEach((host) => {
      if (getComputedStyle(host).position === "static") host.classList.add("o-glow-host");
      host.classList.add("o-glow");
      const fx = el("span", "o-glow-fx");
      fx.setAttribute("aria-hidden", "true");
      host.append(fx);
      hosts.push(host);
    }),
  );
  hosts.forEach((host) => {
    host.addEventListener("pointermove", (event) => {
      if (!fine.matches || reduced.matches) return;
      const r = host.getBoundingClientRect();
      host.style.setProperty("--mx", `${event.clientX - r.left}px`);
      host.style.setProperty("--my", `${event.clientY - r.top}px`);
      host.classList.add("is-glowing");
    });
    host.addEventListener("pointerleave", () => host.classList.remove("is-glowing"));
  });

  /* ---------------- 研究资产: a constellation ---------------- */
  // Assets are stars on a night sky; relations are faint lines between them. The selected task
  // lights up as a constellation — numbered stars, bright lines and small packets of light flowing on.
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
    const WIDE = { h: 470, at: { research: [140, 128], candidate: [360, 218], company: [592, 118], job: [640, 350], contact: [300, 410] } };
    const TALL = { h: 960, at: { research: [160, 180], candidate: [500, 480], company: [610, 150], job: [600, 790], contact: [170, 770] } };
    let H = WIDE.h, AT = WIDE.at;
    const info = new Map(resources.map((r) => [r.id, r]));
    const holder = el("div", "o-sky");
    holder.setAttribute("aria-hidden", "true");
    net.querySelector(".f-network-map").after(holder);
    net.classList.add("o-sky-on");
    let parts = null, lastPath = "", flows = [], skyOn = false, skyRaf = 0;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const build = () => {
      const w = holder.clientWidth || 640;
      const k = W / w;
      const compact = w < 560;
      ({ h: H, at: AT } = compact ? TALL : WIDE);
      seed = 7;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: compact ? "is-compact" : "" });
      const defs = svgEl("defs");
      const glow = svgEl("radialGradient", { id: "o-star-glow" });
      glow.append(svgEl("stop", { offset: "0", "stop-color": "#d1c9ff", "stop-opacity": "0.55" }), svgEl("stop", { offset: "1", "stop-color": "#d1c9ff", "stop-opacity": "0" }));
      defs.append(glow);
      svg.append(defs);
      const field = svgEl("g", { class: "o-field" });
      for (let i = 0; i < 140; i++) {
        const s = svgEl("circle", { cx: (rnd() * W).toFixed(1), cy: (rnd() * H).toFixed(1), r: ((0.5 + rnd() * 1.1) * k * 0.8).toFixed(2), opacity: (0.12 + rnd() * 0.45).toFixed(2) });
        if (i % 9 === 0) { s.setAttribute("class", "is-twinkle"); s.style.animationDelay = `${(-rnd() * 6).toFixed(2)}s`; }
        field.append(s);
      }
      svg.append(field);
      const lines = new Map();
      const lineLayer = svgEl("g"), inkLayer = svgEl("g"), tagLayer = svgEl("g"), packetLayer = svgEl("g", { class: "o-packets" });
      model.edges.forEach((edge) => {
        const [ax, ay] = AT[edge.from], [bx, by] = AT[edge.to];
        const d = `M${ax} ${ay} L${bx} ${by}`;
        lineLayer.append(svgEl("path", { d, class: `o-edge${edge.pending ? " is-pending" : ""}` }));
        const ink = svgEl("path", edge.pending ? { d, class: "o-line-ink is-pending" } : { d, class: "o-line-ink", pathLength: 1 });
        inkLayer.append(ink);
        const len = Math.hypot(bx - ax, by - ay);
        const nx = -(by - ay) / len, ny = (bx - ax) / len;
        const off = 15 * k * (ny > 0 ? -1 : 1);
        const mx = (ax + bx) / 2 + nx * off, my = (ay + by) / 2 + ny * off;
        const tag = svgEl("g", { class: "o-tag" });
        tag.append(svgEl("text", { x: mx, y: my, "font-size": (12 * k).toFixed(1), class: "o-tag-label" }, edge.label));
        tag.append(svgEl("text", { x: mx, y: my + 14 * k, "font-size": (10.5 * k).toFixed(1), class: "o-tag-note" }, edge.note));
        tagLayer.append(tag);
        lines.set(edge.id, { ink, tag, edge });
      });
      svg.append(lineLayer, inkLayer, tagLayer, packetLayer);
      const stars = new Map();
      Object.entries(AT).forEach(([id, [x, y]]) => {
        const g = svgEl("g", { class: `o-star${id === "candidate" ? " is-hub" : ""}` });
        const halo = svgEl("circle", { cx: x, cy: y, r: (id === "candidate" ? 34 : 24) * k, fill: "url(#o-star-glow)", class: "o-star-halo" });
        g.append(halo);
        g.append(svgEl("circle", { cx: x, cy: y, r: 12 * k, class: "o-star-ring" }));
        g.append(svgEl("circle", { cx: x, cy: y, r: (id === "candidate" ? 5.5 : 3.8) * k, class: "o-star-core" }));
        const left = x > W * 0.55;
        const below = compact && id === "candidate"; // on phones the hub's name sits under it, clear of the lines
        const tx = below ? x : x + (left ? -20 : 20) * k;
        const anchor = below ? "middle" : left ? "end" : "start";
        const num = svgEl("text", { x: tx, y: y - (below ? 24 : 16) * k, "font-size": (10.5 * k).toFixed(1), class: "o-star-num", "text-anchor": anchor }, "");
        g.append(num);
        g.append(svgEl("text", { x: tx, y: y + (below ? 36 : 6) * k, "font-size": ((compact ? 15 : 18) * k).toFixed(1), class: "o-star-label", "text-anchor": anchor }, info.get(id).label));
        if (!compact) g.append(svgEl("text", { x: tx, y: y + 23 * k, "font-size": (11 * k).toFixed(1), class: "o-star-detail", "text-anchor": anchor }, info.get(id).detail));
        svg.append(g);
        stars.set(id, { g, num, halo });
      });
      holder.replaceChildren(svg);
      parts = { lines, stars, packetLayer, k };
      lastPath = "";
      update(false);
    };

    const update = (animate = true) => {
      if (!parts) return;
      const path = model.paths.find((p) => p.id === net.dataset.activePath) || model.paths[0];
      if (path.id === lastPath) return;
      lastPath = path.id;
      const motion = animate && !reduced.matches;
      parts.lines.forEach(({ ink, tag }, id) => {
        const i = path.edges.indexOf(id);
        ink.classList.toggle("is-active", i >= 0);
        tag.classList.toggle("is-active", i >= 0);
        ink.getAnimations?.().forEach((a) => a.cancel());
        if (i >= 0 && motion)
          ink.animate(ink.hasAttribute("pathLength") ? [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }] : [{ opacity: 0 }, { opacity: 1 }], { duration: 750, delay: 150 + i * 240, easing: EASE, fill: "backwards" });
      });
      parts.stars.forEach(({ g, num, halo }, id) => {
        const i = path.nodes.indexOf(id);
        g.classList.toggle("is-active", i >= 0);
        num.textContent = i >= 0 ? `0${i + 1}` : "";
        if (i >= 0 && motion) halo.animate([{ scale: 0.4, opacity: 0 }, { scale: 1.4, opacity: 1 }, { scale: 1, opacity: 1 }], { duration: 900, delay: 100 + i * 240, easing: EASE, fill: "backwards" });
      });
      // packets of light travel along the task's lines, outward from where the task starts
      const depths = new Map([[path.nodes[0], 0]]);
      const edges = model.edges.filter((e) => path.edges.includes(e.id));
      const queue = [path.nodes[0]];
      for (const node of queue)
        edges.forEach((edge) => {
          const other = edge.from === node ? edge.to : edge.to === node ? edge.from : null;
          if (other && !depths.has(other)) { depths.set(other, depths.get(node) + 1); queue.push(other); }
        });
      parts.packetLayer.replaceChildren();
      flows = edges.flatMap((edge) => {
        const reverse = depths.get(edge.from) > depths.get(edge.to);
        const [a, b] = reverse ? [AT[edge.to], AT[edge.from]] : [AT[edge.from], AT[edge.to]];
        const order = Math.min(depths.get(edge.from), depths.get(edge.to));
        return [0, 0.5].map((phase) => {
          const dot = svgEl("circle", { r: (2.6 * parts.k).toFixed(2), class: edge.pending ? "is-pending" : "" });
          parts.packetLayer.append(dot);
          return { dot, a, b, phase: phase + order * 0.18 };
        });
      });
      fly();
    };

    const fly = () => { if (!skyRaf) skyRaf = requestAnimationFrame(tick); };
    const tick = (now) => {
      skyRaf = 0;
      if (!parts || !skyOn || reduced.matches || document.hidden) { if (parts) parts.packetLayer.style.display = "none"; return; }
      parts.packetLayer.style.display = "";
      for (const f of flows) {
        const u = (now / 2600 + f.phase) % 1;
        f.dot.setAttribute("cx", (f.a[0] + (f.b[0] - f.a[0]) * u).toFixed(1));
        f.dot.setAttribute("cy", (f.a[1] + (f.b[1] - f.a[1]) * u).toFixed(1));
        f.dot.setAttribute("opacity", (Math.sin(Math.PI * u) * 0.9 + 0.1).toFixed(2));
      }
      skyRaf = requestAnimationFrame(tick);
    };

    new MutationObserver(() => update()).observe(net, { attributes: true, attributeFilter: ["data-active-path"] });
    new IntersectionObserver(([en]) => { skyOn = en.isIntersecting; fly(); }).observe(holder);
    document.addEventListener("visibilitychange", fly);
    let lastW = 0;
    new ResizeObserver(() => {
      const w = Math.round(holder.clientWidth);
      if (w && Math.abs(w - lastW) > 4) { lastW = w; build(); }
    }).observe(holder);
    build();
  }

  /* ---------------- reveals: things come out of the haze ---------------- */
  window.__hbReveal = true;
  if (!document.documentElement.classList.contains("motion") || !Element.prototype.animate) {
    document.documentElement.classList.remove("motion");
    return;
  }
  const haze = (y = 26) => [
    { opacity: 0, transform: `translate3d(0, ${y}px, 0)`, filter: "blur(8px)" },
    { opacity: 1, transform: "none", filter: "blur(0px)" },
  ];
  const SPEC = [
    [".o-film-head > *", haze(28), (i) => i * 130, 1100],
    [".o-film-frame", [{ opacity: 0, transform: "scale(.96)", filter: "blur(12px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }], () => 200, 1400],
    [".o-course", haze(14), () => 380, 1000],
    [".f-work-intro > *", haze(30), (i) => i * 120, 1100],
    [".f-work-demo > .f-tabs", haze(16), () => 0, 900],
    [".f-work-panel", haze(30), () => 140, 1100],
    [".f-work-bottom", haze(12), () => 260, 800],
    [".p-intro h2 > span", haze(30), (i) => i * 130, 1100],
    [".p-intro > p", haze(20), () => 260, 900],
    [".p-stage", [{ opacity: 0, transform: "scale(.96)", filter: "blur(10px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }], () => 150, 1300],
    [".f-memory h2", haze(30), () => 0, 1100],
    [".f-memory .f-container > p", haze(20), () => 150, 900],
    [".f-network-tabs", haze(14), () => 0, 800],
    [".f-network-story", haze(26), () => 120, 1000],
    [".f-network-figure", [{ opacity: 0, transform: "scale(.96)", filter: "blur(10px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }], () => 220, 1300],
    [".f-network-origin", haze(12), () => 320, 800],
    [".f-about-copy > *", haze(24), (i) => i * 110, 1000],
    [".f-trial-intro > *", haze(24), (i) => i * 90, 1000],
    [".f-trial-content", haze(36), () => 160, 1100],
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
  document.querySelectorAll(".f-footer .f-footer-top > *, .f-footer .f-footer-bottom").forEach((n, i) => add(n, haze(16), i * 80, 800));
  const show = (n) => {
    const job = jobs.get(n);
    n.classList.add("in");
    n.animate(job.frames, { duration: job.duration, delay: job.delay, easing: EASE, fill: "backwards" });
  };
  const pending = new Set();
  // the film waits for its poster, then comes out of the haze (the 第三版 entrance)
  const filmVideo = document.querySelector(".o-film-frame video");
  const posterIn = filmVideo?.poster
    ? new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = filmVideo.poster; })
    : null;
  const whenFilm = (n, go) =>
    posterIn && (n.contains(filmVideo) || n.matches(".o-course")) ? Promise.race([posterIn, new Promise((r) => setTimeout(r, 900))]).then(go) : go();
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

  // the hero arrives out of the clouds
  [...copy.children].forEach((n, i) => {
    n.classList.add("in");
    n.animate(haze(i === 2 ? 30 : 16), { duration: 1300, delay: 120 + i * 140, easing: EASE, fill: "backwards" });
  });
})();
