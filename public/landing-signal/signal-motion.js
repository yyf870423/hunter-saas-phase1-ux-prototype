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
  title.innerHTML = '<span class="s-line">给我一个难岗位，</span><span class="s-line">把该找的人找出来。</span>';
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
    { x: 0.58, y: 0.76, d: 0.8, ico: "人", t: '已有候选人 <span class="s-num" data-n="12">0</span>', s: "本轮召回" },
    { x: 0.74, y: 0.86, d: 0.6, ico: "网", t: '公开网络 <span class="s-num" data-n="9">0</span>', s: "本轮召回" },
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

  /* ---------------- scenarios advance as you scroll ---------------- */
  const work = root.querySelector("#work");
  const overview = work.querySelector(".s-overview");
  const tablist = work.querySelector(".s-scenario-tabs");
  const content = work.querySelector(".s-work-content");
  const panel = work.querySelector(".f-work-panel");
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const header = root.querySelector(".f-header");
  const bar = el("div", "s-tabbar", '<div class="f-container"></div>');
  const progress = el("span", "s-progress");
  progress.setAttribute("aria-hidden", "true");
  bar.firstElementChild.append(tablist);
  bar.append(progress);
  tabs.forEach((tab, i) => {
    const step = el("span", "s-step", `0${i + 1}`);
    step.setAttribute("aria-hidden", "true");
    tab.append(step);
  });
  const stick = el("div", "s-stick");
  content.before(stick);
  stick.append(bar, content);
  const spacer = el("div", "s-spacer");
  spacer.setAttribute("aria-hidden", "true");
  work.append(spacer);

  const rowsIn = () => {
    if (reduced.matches) return;
    panel.querySelectorAll(".f-work-lead > *").forEach((n, i) =>
      n.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: i * 60, easing: EASE, fill: "backwards" }),
    );
    panel.querySelectorAll(".f-result-title, .f-result-list > li, .f-roles tbody tr").forEach((n, i) =>
      n.animate([{ opacity: 0, transform: "translateX(-14px)" }, { opacity: 1, transform: "none" }], { duration: 560, delay: 120 + i * 90, easing: EASE, fill: "backwards" }),
    );
  };

  let pinned = false, range = 0, lockUntil = 0, shownIndex = 0;
  const selectedIndex = () => Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
  function layout() {
    const headerH = header ? header.offsetHeight : 72;
    root.style.setProperty("--s-header-h", `${headerH}px`);
    const want = innerWidth >= 1100 && !reduced.matches;
    work.classList.toggle("s-pinned", want);
    pinned = want && stick.offsetHeight + headerH + 12 <= innerHeight;
    work.classList.toggle("s-pinned", pinned);
    range = pinned ? Math.round(innerHeight * 0.7) * (tabs.length - 1) : 0;
    spacer.style.height = `${range}px`;
    sync();
  }
  function start() {
    return overview.getBoundingClientRect().bottom + scrollY - (header ? header.offsetHeight : 72);
  }
  function sync() {
    if (!pinned) { progress.style.transform = "scaleX(0)"; return; }
    const p = clamp((scrollY - start()) / Math.max(1, range));
    progress.style.transform = `scaleX(${p.toFixed(4)})`;
    if (performance.now() < lockUntil) return;
    const index = Math.min(tabs.length - 1, Math.floor(p * (tabs.length - 1) + 0.5));
    if (index !== selectedIndex()) tabs[index].click();
  }
  tabs.forEach((tab, i) =>
    tab.addEventListener("click", (event) => {
      if (shownIndex !== i) { shownIndex = i; rowsIn(); }
      if (!event.isTrusted || !pinned) return;
      // a reader's click moves the page to that scenario's stretch of the scroll
      lockUntil = performance.now() + 1100;
      scrollTo({ top: start() + (range * i) / (tabs.length - 1) + 1, behavior: "smooth" });
    }),
  );
  addEventListener("scroll", sync, { passive: true });
  let resizeTimer = 0;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });
  reduced.addEventListener?.("change", layout);
  layout();

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
  const lineUp = [
    { opacity: 0, transform: "translateY(60%)", clipPath: "inset(0 0 100% 0)" },
    { opacity: 1, transform: "none", clipPath: "inset(0 0 0% 0)" },
  ];
  const SPEC = [
    [".s-opening .s-section-label", rise(12), () => 0, 700],
    [".f-work-intro h2", rise(36), () => 100, 1000],
    [".f-work-intro > p", rise(24), () => 260, 900],
    [".s-overview-heading p", rise(24), () => 0, 900],
    [".s-tabbar", rise(16), () => 120, 800],
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
  const reveal = (n) => { if (!pending.delete(n)) return; io.unobserve(n); show(n); };
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
