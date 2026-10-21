/* 第一版 · 蓝白编辑 — presentation, interaction and motion layer (runs after signal.js has mounted). */
(() => {
  const root = document.querySelector("#homepage.s-homepage");
  if (!root || !root.dataset.signalMounted) {
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
  const hero = root.querySelector(".f-hero");
  const copy = hero.querySelector(".f-hero-copy");
  const title = copy.querySelector("h1");
  const statement = copy.querySelector(".f-hero-statement");
  const soon = copy.querySelector(".f-coming-soon");
  const eyebrow = el("p", "s-eyebrow", "HunterBuddy · 猎头的 AI 工作伙伴");
  title.classList.add("s-promise");
  title.innerHTML = '<span class="s-line">从杂乱的信息里，</span><span class="s-line">找出岗位、人和时机。</span>';
  copy.prepend(eyebrow);
  statement?.remove();
  if (soon) copy.append(soon);

  /* ---------------- hero: a live research wall ---------------- */
  // Leads found in different places light up and connect to the promise.
  const CARDS = [
    { x: 0.6, y: 0.2, d: 0.9, ico: "林", t: "林越", s: "简历库 · 2019" },
    { x: 0.79, y: 0.12, d: 0.55, ico: "文", t: "Lin Y.", s: "论文作者" },
    { x: 0.86, y: 0.36, d: 1, ico: "&lt;/&gt;", t: "lin-yue", s: "开源社区" },
    { x: 0.66, y: 0.5, d: 0.7, ico: "司", t: "星川机器人", s: "团队页 · 视觉" },
    { x: 0.82, y: 0.64, d: 0.45, ico: "利", t: "视觉检测", s: "专利 · 发明人" },
    { x: 0.58, y: 0.76, d: 0.8, ico: "人", t: '你的候选人 <span class="s-num" data-n="12">0</span>', s: "这一轮找到" },
    { x: 0.74, y: 0.86, d: 0.6, ico: "网", t: '公开网络 <span class="s-num" data-n="9">0</span>', s: "这一轮找到" },
  ];
  const wall = el("div", "s-wall");
  wall.setAttribute("aria-hidden", "true");
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  const link = document.createElementNS(NS, "path");
  link.setAttribute("class", "s-link");
  const anchor = document.createElementNS(NS, "circle");
  anchor.setAttribute("class", "s-anchor");
  anchor.setAttribute("r", "4");
  anchor.style.opacity = "0";
  svg.append(link, anchor);
  wall.append(svg);
  const cards = CARDS.map((c) => {
    const card = el("div", "s-card", `<span class="s-ico">${c.ico}</span><span>${c.t}<small>${c.s}</small></span>`);
    card.style.left = `${c.x * 100}%`;
    card.style.top = `${c.y * 100}%`;
    wall.append(card);
    return { ...c, card, phase: Math.random() * 6.28 };
  });
  hero.querySelector(".f-hero-inner").before(wall);

  let px = 0, py = 0, tx = 0, ty = 0, heroOn = true, wallRaf = 0;
  const wallFrame = (now) => {
    wallRaf = 0;
    if (!heroOn || document.hidden) return;
    px += (tx - px) * 0.08;
    py += (ty - py) * 0.08;
    const lift = Math.min(window.scrollY, hero.offsetHeight);
    for (const c of cards) {
      const still = reduced.matches;
      const drift = still ? 0 : Math.sin(now / 2400 + c.phase) * 5 * c.d;
      const x = still ? 0 : px * 26 * c.d;
      const y = still ? 0 : py * 18 * c.d + drift - lift * 0.22 * c.d;
      c.card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    if (current) drawLink();
    wallRaf = requestAnimationFrame(wallFrame);
  };
  const wake = () => { if (!wallRaf && heroOn) wallRaf = requestAnimationFrame(wallFrame); };
  hero.addEventListener("pointermove", (e) => {
    if (!fine.matches || e.pointerType === "touch") return;
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  });
  hero.addEventListener("pointerleave", () => { tx = ty = 0; });
  new IntersectionObserver(([en]) => { heroOn = en.isIntersecting; wake(); }).observe(hero);
  document.addEventListener("visibilitychange", wake);

  // one lead at a time: the card lights, a line runs to the end of the promise
  let current = null;
  function drawLink() {
    const hr = hero.getBoundingClientRect();
    const cr = current.card.getBoundingClientRect();
    const lines = title.querySelectorAll(".s-line");
    const tr = lines[lines.length - 1].getBoundingClientRect();
    const x1 = cr.left - hr.left, y1 = cr.top - hr.top + cr.height / 2;
    const x2 = tr.right - hr.left + 18, y2 = tr.top - hr.top + tr.height * 0.55;
    const mx = (x1 + x2) / 2;
    link.setAttribute("d", `M${x1.toFixed(1)} ${y1.toFixed(1)} C${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    anchor.setAttribute("cx", x2.toFixed(1));
    anchor.setAttribute("cy", y2.toFixed(1));
  }
  let turn = 0;
  function nextLead() {
    if (reduced.matches || !heroOn || document.hidden || !svg.isConnected || innerWidth <= 1000) return;
    cards.forEach((c) => c.card.classList.remove("is-lit"));
    current = cards[turn++ % cards.length];
    current.card.classList.add("is-lit");
    drawLink();
    const len = link.getTotalLength();
    link.style.strokeDasharray = `${len}`;
    link.animate(
      [
        { strokeDashoffset: len, opacity: 1 },
        { strokeDashoffset: 0, opacity: 1, offset: 0.45 },
        { strokeDashoffset: 0, opacity: 1, offset: 0.8 },
        { strokeDashoffset: 0, opacity: 0 },
      ],
      { duration: 2300, easing: "ease-in-out", fill: "both" },
    );
    anchor.animate(
      [
        { opacity: 0, r: 2 },
        { opacity: 0, r: 2, offset: 0.4 },
        { opacity: 1, r: 6, offset: 0.5 },
        { opacity: 1, r: 4, offset: 0.8 },
        { opacity: 0, r: 4 },
      ],
      { duration: 2300, easing: "ease-out", fill: "both" },
    );
    setTimeout(() => current?.card.classList.remove("is-lit"), 2000);
  }
  setTimeout(() => { nextLead(); setInterval(nextLead, 2600); }, 1400);
  wake();

  // counts settle in once
  const countUp = (node) => {
    const n = Number(node.dataset.n);
    if (reduced.matches) return (node.textContent = String(n));
    const t0 = performance.now() + 700;
    const step = (now) => {
      const k = clamp((now - t0) / 1100);
      node.textContent = String(Math.round(n * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  wall.querySelectorAll(".s-num").forEach(countUp);

  /* ---------------- opening: label rule ---------------- */
  const label = root.querySelector(".s-opening .s-section-label");
  const rules = [];
  if (label) {
    const r = el("span", "s-rule");
    label.append(r);
    rules.push(r);
  }

  /* ---------------- 产品短片: two minutes with one company ---------------- */
  const CHAPTERS = [
    [10, "发现新岗位"],
    [36.5, "摸清团队"],
    [61, "为岗位找人"],
    [89.5, "为人选找机会"],
    [112, "人和关系都存下来了"],
  ];
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const film = el("section", "s-film");
  film.id = "film";
  film.setAttribute("aria-labelledby", "s-film-title");
  film.innerHTML = `
    <div class="f-container">
      <div class="s-section-label s-film-label">产品短片</div>
      <div class="s-film-head">
        <h2 id="s-film-title"><span class="ln">两分钟，</span><span class="ln">跟着一家公司走一遍。</span></h2>
        <p>周一早上，你让 HunterBuddy 盯着的赛道里有了新消息：星川机器人刚拿到融资。接下来两分钟，看它怎么从这条新闻出发，帮你拿到岗位、摸清团队、找到人选，半年后又帮候选人找到下一个机会。建议打开声音。</p>
      </div>
      <figure class="s-film-frame">
        <video data-film src="assets/hunterbuddy-signal.mp4?v=20261021" poster="assets/signal-film-poster.jpg?v=20261021" controls playsinline preload="metadata" aria-label="HunterBuddy 两分钟产品短片"></video>
      </figure>
      <ol class="s-chapters" aria-label="短片章节">${CHAPTERS.map(
        ([t, name], i) =>
          `<li><button type="button" data-t="${t}" aria-pressed="false"><span class="s-ch-no">${String(i + 1).padStart(2, "0")}</span><span class="s-ch-name">${name}</span><span class="s-ch-time">${mmss(t)}</span></button></li>`,
      ).join("")}</ol>
    </div>`;
  hero.after(film);
  {
    const r = el("span", "s-rule");
    film.querySelector(".s-film-label").append(r);
    rules.push(r);
  }
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
  const chapterButtons = [...film.querySelectorAll(".s-chapters button")];
  const markChapter = (index) => chapterButtons.forEach((b, i) => b.setAttribute("aria-pressed", String(i === index)));
  chapterButtons.forEach((b, i) =>
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
  video.addEventListener("timeupdate", () => {
    let index = -1;
    chapterButtons.forEach((b, i) => {
      if (video.currentTime >= Number(b.dataset.t)) index = i;
    });
    markChapter(index);
  });
  // stop playing once the film has scrolled well out of view
  new IntersectionObserver(([en]) => !en.isIntersecting && !video.paused && video.pause(), { threshold: 0 }).observe(video);

  /* ---------------- scenarios: one continuous section, switched by click ---------------- */
  const work = root.querySelector("#work");
  const panel = work.querySelector(".f-work-panel");
  const tabs = [...work.querySelectorAll('.s-scenario-tabs [role="tab"]')];
  let shownIndex = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
  const rowsIn = () => {
    if (reduced.matches) return;
    panel.querySelectorAll(".f-work-lead > *").forEach((n, i) =>
      n.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: i * 60, easing: EASE, fill: "backwards" }),
    );
    panel.querySelectorAll(".f-result-title, .f-result-list > li, .f-roles tbody tr").forEach((n, i) =>
      n.animate([{ opacity: 0, transform: "translateX(-14px)" }, { opacity: 1, transform: "none" }], { duration: 560, delay: 120 + i * 90, easing: EASE, fill: "backwards" }),
    );
  };
  const followTabs = () => {
    const i = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    if (i >= 0 && i !== shownIndex) { shownIndex = i; rowsIn(); }
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", followTabs);
    tab.addEventListener("keydown", () => setTimeout(followTabs));
  });

  /* ---------------- 研究资产: an editorial arc diagram ---------------- */
  // Five assets sit on one baseline; relations are arcs above it (ordered so no two arcs cross).
  // The selected task draws its arcs in blue and numbers its stops; dashed arcs still need confirming.
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
    const ORDER = ["research", "candidate", "job", "company", "contact"];
    const label = new Map(resources.map((r) => [r.id, r]));
    const W = 760, H = 400, BASE = 292, STEP = 155, X0 = 70;
    const X = (id) => X0 + ORDER.indexOf(id) * STEP;
    const holder = el("div", "s-arcs");
    holder.setAttribute("aria-hidden", "true");
    net.querySelector(".f-network-map").after(holder);
    net.classList.add("s-arcs-on");
    let parts = null;
    let lastPath = "";

    const build = () => {
      const w = holder.clientWidth || 640;
      const k = W / w; // viewBox units per screen pixel
      const compact = w < 560;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: compact ? "is-compact" : "" });
      svg.append(svgEl("line", { x1: 30, y1: BASE, x2: W - 30, y2: BASE, class: "s-arc-base" }));
      const arcs = new Map();
      model.edges.forEach((edge) => {
        const [a, b] = [X(edge.from), X(edge.to)].sort((p, q) => p - q);
        const rx = (b - a) / 2, ry = Math.min(rx * 0.96, 212);
        const d = `M${a} ${BASE} A${rx} ${ry} 0 0 1 ${b} ${BASE}`;
        const g = svgEl("g", { class: `s-arc${edge.pending ? " is-pending" : ""}` });
        g.append(svgEl("path", { d, class: "s-arc-line" }));
        const ink = svgEl("path", edge.pending ? { d, class: "s-arc-ink" } : { d, class: "s-arc-ink", pathLength: 1 });
        g.append(ink);
        const tx = (a + b) / 2, ty = BASE - ry - 10 * k;
        g.append(svgEl("text", { x: tx, y: ty - 15 * k, class: "s-arc-label", "font-size": (13 * k).toFixed(1) }, edge.label));
        g.append(svgEl("text", { x: tx, y: ty - 1 * k, class: "s-arc-note", "font-size": (11 * k).toFixed(1) }, edge.note));
        svg.append(g);
        arcs.set(edge.id, { g, ink });
      });
      const dots = new Map();
      ORDER.forEach((id) => {
        const x = X(id);
        const g = svgEl("g", { class: `s-node${id === "candidate" ? " is-hub" : ""}` });
        g.append(svgEl("circle", { cx: x, cy: BASE, r: (id === "candidate" ? 7 : 5) * k, class: "s-node-dot" }));
        g.append(svgEl("circle", { cx: x, cy: BASE, r: 11 * k, class: "s-node-step" }));
        const num = svgEl("text", { x, y: BASE + 4 * k, class: "s-node-num", "font-size": (11 * k).toFixed(1) }, "");
        g.append(num);
        g.append(svgEl("text", { x, y: BASE + 34 * k, class: "s-node-label", "font-size": (compact ? 14 : 19) * k }, label.get(id).label));
        if (!compact) g.append(svgEl("text", { x, y: BASE + 54 * k, class: "s-node-detail", "font-size": 12 * k }, label.get(id).detail));
        svg.append(g);
        dots.set(id, { g, num });
      });
      holder.replaceChildren(svg);
      parts = { arcs, dots };
      lastPath = "";
      update(false);
    };

    const update = (animate = true) => {
      if (!parts) return;
      const path = model.paths.find((p) => p.id === net.dataset.activePath) || model.paths[0];
      if (path.id === lastPath) return;
      lastPath = path.id;
      const motion = animate && !reduced.matches && Element.prototype.animate;
      parts.arcs.forEach(({ g, ink }, id) => {
        const i = path.edges.indexOf(id);
        g.classList.toggle("is-active", i >= 0);
        ink.getAnimations?.().forEach((a) => a.cancel());
        if (i >= 0 && motion)
          ink.animate(
            ink.hasAttribute("pathLength") ? [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }] : [{ opacity: 0 }, { opacity: 1 }],
            { duration: 700, delay: 120 + i * 220, easing: EASE, fill: "backwards" },
          );
      });
      parts.dots.forEach(({ g, num }, id) => {
        const i = path.nodes.indexOf(id);
        g.classList.toggle("is-active", i >= 0);
        num.textContent = i >= 0 ? String(i + 1) : "";
        if (i >= 0 && motion)
          g.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 500, delay: 80 + i * 220, easing: EASE, fill: "backwards" });
      });
    };

    new MutationObserver(() => update()).observe(net, { attributes: true, attributeFilter: ["data-active-path"] });
    let lastW = 0;
    new ResizeObserver(() => {
      const w = Math.round(holder.clientWidth);
      if (w && Math.abs(w - lastW) > 4) { lastW = w; build(); }
    }).observe(holder);
    build();
  }

  /* ---------------- research carousel: counter and timer line ---------------- */
  const research = root.querySelector("#research");
  const stage = research?.querySelector(".p-stage");
  if (stage) {
    const total = research.querySelectorAll("[data-chapter-slide]").length;
    const count = el("div", "s-count", `<span data-now>01</span><span class="s-track"><i class="s-fill"></i></span><span>0${total}</span>`);
    count.setAttribute("aria-hidden", "true");
    stage.append(count);
    const now = count.querySelector("[data-now]");
    const fill = count.querySelector(".s-fill");
    let timer = null;
    const restart = () => {
      now.textContent = `0${Number(research.dataset.chapter || 0) + 1}`;
      timer?.cancel();
      fill.style.transform = "scaleX(0)";
      if (research.dataset.playback === "playing" && !reduced.matches)
        timer = fill.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 5000, easing: "linear", fill: "forwards" });
    };
    new MutationObserver(restart).observe(research, { attributes: true, attributeFilter: ["data-chapter", "data-playback"] });
    restart();
  }

  /* ---------------- editorial reveals ---------------- */
  window.__hbReveal = true;
  if (!document.documentElement.classList.contains("motion") || !Element.prototype.animate) {
    document.documentElement.classList.remove("motion");
    return;
  }
  const rise = (y = 28, x = 0) => [{ opacity: 0, transform: `translate3d(${x}px, ${y}px, 0)` }, { opacity: 1, transform: "none" }];
  const FILM_IN = [{ opacity: 0, transform: "scale(.96)", filter: "blur(12px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }];
  const HAZE = (y) => [{ opacity: 0, transform: `translate3d(0, ${y}px, 0)`, filter: "blur(8px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }];
  const lineUp = [
    { opacity: 0, transform: "translateY(60%)", clipPath: "inset(0 0 100% 0)" },
    { opacity: 1, transform: "none", clipPath: "inset(0 0 0% 0)" },
  ];
  const SPEC = [
    [".s-film-label", rise(12), () => 0, 700],
    [".s-film-head > *", rise(28), (i) => 100 + i * 140, 1000],
    [".s-film-frame", FILM_IN, () => 200, 1400],
    [".s-chapters li", HAZE(14), (i) => 380 + i * 60, 1000],
    [".s-opening .s-section-label", rise(12), () => 0, 700],
    [".f-work-intro h2", rise(36), () => 100, 1000],
    [".f-work-intro > p", rise(24), () => 260, 900],
    [".s-overview-heading p", rise(24), () => 0, 900],
    [".s-scenario-tabs", rise(16), () => 120, 800],
    [".s-work-content", rise(32), () => 220, 1000],
    [".p-intro h2 > span", lineUp, (i) => i * 120, 900],
    [".p-intro > p", rise(20), () => 260, 900],
    [".p-stage", [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], () => 200, 1400],
    [".f-memory h2", rise(32), () => 0, 1000],
    [".f-memory .f-container > p", rise(24), () => 150, 900],
    [".f-network-tabs", rise(16), () => 0, 800],
    [".f-network-story", rise(28), () => 120, 900],
    [".f-network-figure", [{ opacity: 0, transform: "translateY(28px) scale(.98)" }, { opacity: 1, transform: "none" }], () => 220, 1100],
    [".f-network-origin", rise(12), () => 300, 800],
    [".s-about-grid > *", rise(28), (i) => i * 140, 1000],
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
  rules.forEach((r) => add(r, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 250, 1400));

  const show = (n) => {
    const job = jobs.get(n);
    n.classList.add("in");
    n.animate(job.frames, { duration: job.duration, delay: job.delay, easing: EASE, fill: "backwards" });
  };
  const pending = new Set();
  // the film waits for its poster, then comes out of the haze (the 第三版 entrance)
  const filmVideo = document.querySelector(".s-film-frame video");
  const posterIn = filmVideo?.poster
    ? new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = filmVideo.poster; })
    : null;
  const whenFilm = (n, go) =>
    posterIn && (n.contains(filmVideo) || n.matches(".s-chapters li")) ? Promise.race([posterIn, new Promise((r) => setTimeout(r, 900))]).then(go) : go();
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

  // the hero itself arrives once
  [eyebrow, ...title.querySelectorAll(".s-line"), ...copy.querySelectorAll(".f-hero-description, .f-hero-actions, .f-coming-soon")].forEach((n, i) => {
    n.classList.add("in");
    n.animate(i > 0 && i < 3 ? lineUp : rise(18), { duration: 1000, delay: 80 + i * 110, easing: EASE, fill: "backwards" });
  });
  title.classList.add("in");
  cards.forEach((c, i) =>
    c.card.animate([{ opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1 }], { duration: 900, delay: 450 + i * 90, easing: EASE, fill: "backwards" }),
  );
})();
