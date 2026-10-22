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
  const ui = window.FinesseUI;
  const EASE = "cubic-bezier(.2, .75, .2, 1)";
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = ui.localizeHTML(html);
    return n;
  };

  /* ---------------- hero: the promise leads ---------------- */
  const copy = hero.querySelector(".f-hero-copy");
  const title = copy.querySelector("h1");
  const statement = copy.querySelector(".f-hero-statement");
  const mark = el("p", "o-mark", "HunterBuddy");
  title.classList.add("o-promise");
  title.innerHTML = ui.localizeHTML('<span class="o-line">从杂乱的信息里，</span><span class="o-line">找出岗位、人和时机。</span>');
  title.before(mark);
  /* the product name leads the first screen; what it is ("猎头的 AI 工作伙伴") sits right under it */
  if (statement) {
    statement.classList.add("o-role");
    mark.after(statement);
  }

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

  /* ---------------- hero: three signals rise out of the cloud sea, join into one course, and light the name ----------------
     The headline says it: a funding round, an old CV, a profile update — on their own easy to miss, connected they point
     to the next opportunity. Same language as the film's cold open and the knowledge network. Decoration only (aria-hidden);
     drawn on one canvas between the clouds and the copy; paused off-screen; reduced motion gets the finished picture. */
  (() => {
    const canvas = el("canvas", "o-signals");
    canvas.setAttribute("aria-hidden", "true");
    fly.before(canvas);
    // a band of moonlight sweeps slowly across the cloud sea, then rests (CSS only, see .o-sheen)
    const sheen = el("div", "o-sheen");
    sheen.setAttribute("aria-hidden", "true");
    canvas.before(sheen);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const en = window.FinesseLocale?.language === "en";
    const LABELS = en ? ["Funding news", "A CV from two years ago", "Profile update"] : ["融资新闻", "两年前的简历", "主页变动"];
    // colours of the course (two ends), the signal dots and the light on the name: moonlight silver, the same cool key as the clouds and stars
    const PAL = { from: "232,236,248", to: "232,236,248", dot: "240,244,255", name: "222,228,246" };
    let W = 0, H = 0, dpr = 1, pts = [], stars = [], markAt = null, phone = false;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const soft = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
    const out3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
    const inout = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    // a quadratic course between two points, bowed downward by `bow` px
    const qpt = (a, b, bow, u) => {
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2 + bow, v = 1 - u;
      return { x: v * v * a.x + 2 * v * u * cx + u * u * b.x, y: v * v * a.y + 2 * v * u * cy + u * u * b.y };
    };
    const layout = () => {
      const hr = hero.getBoundingClientRect();
      W = Math.round(hr.width); H = Math.round(hr.height);
      if (!W || !H) return;
      dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      phone = W < 640;
      const rel = (n) => { const r = n.getBoundingClientRect(); return { l: r.left - hr.left, r: r.right - hr.left, t: r.top - hr.top, b: r.bottom - hr.top, cx: (r.left + r.right) / 2 - hr.left, cy: (r.top + r.bottom) / 2 - hr.top }; };
      // copy moves with scroll; measure it at rest
      const moved = copy.style.transform; copy.style.transform = "";
      const actions = hero.querySelector(".f-hero-actions") || copy;
      const a = rel(actions), m = rel(mark);
      copy.style.transform = moved;
      markAt = { x: m.cx, y: m.cy, w: m.r - m.l, h: m.b - m.t };
      const band = Math.max(60, H - a.b);           // the cloud band under the buttons
      if (phone) {
        pts = [
          { x: W * 0.16, y: a.b + band * 0.42 },
          { x: W * 0.5, y: a.b + band * 0.74 },
          { x: W * 0.84, y: a.b + band * 0.46 },
        ];
      } else {
        // two signals out in the open sky beside the copy, one in the clouds under the buttons
        const side = Math.max(56, (W - (a.r - a.l)) * 0.16);
        pts = [
          { x: Math.max(64, W * 0.13), y: Math.min(H - 70, a.t + (a.b - a.t) * 0.2) },
          { x: W * 0.5, y: a.b + band * 0.5 },
          { x: Math.min(W - 64, W * 0.87), y: Math.min(H - 70, a.t - (a.b - a.t) * 0.6) },
        ];
        void side;
      }
      seed = 7;
      const n = phone ? 34 : 78;
      stars = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H * 0.58, r: 0.35 + rnd() * 1.05, a: 0.18 + rnd() * 0.5, tw: rnd() * 6.28 }));
    };
    const dot = (x, y, r, rgb, a, halo) => {
      if (a <= 0.003) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, halo);
      g.addColorStop(0, `rgba(${rgb},${0.9 * a})`);
      g.addColorStop(0.35, `rgba(${rgb},${0.32 * a})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, halo, 0, 6.283); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    };
    const course = (p, alpha) => {
      if (p <= 0 || alpha <= 0.003) return;
      const g = ctx.createLinearGradient(pts[0].x, 0, pts[2].x, 0);
      g.addColorStop(0, `rgba(${PAL.from},${alpha})`);
      g.addColorStop(1, `rgba(${PAL.to},${alpha})`);
      const N = 60, segs = [[pts[0], pts[1]], [pts[1], pts[2]]];
      const path = () => {
        ctx.beginPath();
        let first = true;
        segs.forEach(([a, b], k) => {
          const local = clamp(p * 2 - k);
          for (let i = 0; i <= N * local; i++) { const q = qpt(a, b, phone ? 10 : 34, i / N); first ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y); first = false; }
        });
      };
      ctx.lineCap = "round";
      ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.shadowColor = `rgba(${PAL.from},.9)`; ctx.shadowBlur = 12;
      path(); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.setLineDash([3, 7]);
      path(); ctx.stroke(); ctx.setLineDash([]);
    };
    const along = (u) => (u < 0.5 ? qpt(pts[0], pts[1], phone ? 10 : 34, u * 2) : qpt(pts[1], pts[2], phone ? 10 : 34, u * 2 - 1));
    const label = (i, a) => {
      if (a <= 0.01) return;
      const p = pts[i];
      ctx.font = `500 ${phone ? 11 : 13}px "Boseek Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.fillStyle = `rgba(232,228,255,${0.92 * a})`;
      ctx.shadowColor = "rgba(0,0,0,.8)"; ctx.shadowBlur = 10;
      const right = i === 2;
      ctx.textAlign = right ? "right" : "left";
      ctx.fillText(LABELS[i], p.x + (right ? -14 : 14), p.y - 10);
      ctx.shadowBlur = 0;
    };
    let t0 = performance.now(), frame = 0, visible = true;
    const draw = (t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (!pts.length) return;
      // stars in the open sky
      const sky = soft((t - 0.3) / 1.4);
      for (const s of stars) {
        const a = s.a * sky * (0.6 + 0.4 * Math.sin(t * 0.9 + s.tw));
        if (a < 0.02) continue;
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
      // the name takes the light once the signals reach it, then breathes
      if (markAt) {
        const bloom = soft((t - 5.4) / 0.8), settle = 1 - 0.35 * soft((t - 6.4) / 1.8);
        const a = bloom * settle * (0.85 + 0.15 * Math.sin((t - 6.6) * 0.8));
        if (a > 0.005) {
          const rx = markAt.w * 0.7, ry = markAt.h * 1.7;
          ctx.save(); ctx.translate(markAt.x, markAt.y); ctx.scale(1, ry / rx);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
          g.addColorStop(0, `rgba(${PAL.name},${0.55 * a})`);
          g.addColorStop(0.5, `rgba(${PAL.name},${0.18 * a})`);
          g.addColorStop(1, `rgba(${PAL.name},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.283); ctx.fill(); ctx.restore();
        }
      }
      // the course joins the three
      const drawn = inout((t - 3.0) / 1.4);
      course(drawn, 0.95);
      // three signals rise out of the cloud sea
      pts.forEach((p, i) => {
        const at = 1.5 + i * 0.5, up = out3((t - at) / 0.9), a = soft((t - at) / 0.5);
        const y = p.y + (1 - up) * 26;
        dot(p.x, y, 3, PAL.dot, a * (0.85 + 0.15 * Math.sin(t * 1.6 + i * 2)), phone ? 30 : 40);
        // a ring opens as each signal appears
        const ring = (t - at) / 1.2;
        if (ring > 0 && ring < 1) {
          ctx.strokeStyle = `rgba(${PAL.dot},${0.6 * (1 - ring)})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(p.x, y, 6 + 34 * out3(ring), 0, 6.283); ctx.stroke();
        }
        label(i, soft((t - at - 0.3) / 0.6) * (phone && i === 1 ? 0.9 : 1));
      });
      // once: a spark runs the course and climbs to the name
      const run = (t - 4.3) / 0.8;
      if (run > 0 && run < 1) { const q = along(0.5 * inout(run)); dot(q.x, q.y, 2.6, "255,255,255", 1, 28); }
      const climb = (t - 4.9) / 0.9;
      if (climb > 0 && climb < 1 && markAt) {
        const k = inout(climb), from = pts[1], to = { x: markAt.x, y: markAt.y + markAt.h * 0.2 };
        const x = from.x + (to.x - from.x) * k, y = from.y + (to.y - from.y) * k;
        dot(x, y, 2.6, "255,255,255", 1 - soft((climb - 0.7) / 0.3), 30);
      }
      // afterwards, every few seconds a light travels the course; as it passes the middle signal,
      // a ripple spreads across the cloud sea (the film's pings, seen in perspective)
      const loop = t - 7.5;
      if (loop > 0) {
        const u = (loop % 7) / 2.6;
        if (u < 1) { const q = along(inout(u)); dot(q.x, q.y, 2.2, "255,255,255", Math.sin(Math.PI * u), 22); }
        const r = ((loop % 7) - 1.3) / 3.2;
        if (r > 0 && r < 1) {
          const c = pts[1], rx = (phone ? W * 0.55 : W * 0.42) * out3(r), fadeR = (1 - r) * (1 - r);
          ctx.lineWidth = 1.2;
          for (const [k, a] of [[1, 0.34], [0.62, 0.2]]) {
            ctx.strokeStyle = `rgba(${PAL.dot},${a * fadeR})`;
            ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(1, rx * k), Math.max(1, rx * k * 0.16), 0, 0, 6.283); ctx.stroke();
          }
        }
      }
    };
    const tick = (now) => {
      frame = 0;
      draw((now - t0) / 1000);
      if (visible && !reduced.matches && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!frame && visible && !reduced.matches) frame = requestAnimationFrame(tick); };
    const still = () => { cancelAnimationFrame(frame); frame = 0; draw(60); };
    const refresh = () => { layout(); reduced.matches ? still() : (frame || draw((performance.now() - t0) / 1000)); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : (cancelAnimationFrame(frame), frame = 0); }).observe(hero);
    document.addEventListener("visibilitychange", start);
    reduced.addEventListener?.("change", () => { t0 = performance.now(); reduced.matches ? still() : start(); });
    new ResizeObserver(refresh).observe(hero);
    document.fonts?.ready.then(refresh);
    layout();
    reduced.matches ? still() : start();
  })();

  /* ---------------- every section opens with a small label, like the film's ---------------- */
  [
    [".f-work-intro h2", "能做什么 · 四件事"],
    [".p-intro h2", "工作方式"],
    [".f-memory h2", "人和关系"],
    [".f-about-copy h2", "关于铂寻"],
    [".f-trial-intro h2", "申请试用"],
  ].forEach(([sel, text]) => {
    const h = root.querySelector(sel);
    if (h && !h.previousElementSibling?.classList.contains("o-kicker")) h.before(el("p", "o-kicker", text));
  });

  /* 四件事只留一句引导：另一段在 locale 表里译成了空串，这里把空段落拿掉 */
  root.querySelectorAll(".f-work-intro > p").forEach((p) => {
    if (!p.textContent.trim()) p.remove();
  });

  /* ---------------- 产品短片: chapters are waypoints on a course ---------------- */
  const CHAPTERS = [
    [10, "客户开发"],
    [36.5, "人才地图"],
    [61, "职位寻访"],
    [89.5, "人选维护"],
    [112, "人和关系都存下来了"],
  ];
  /* the English page plays the English cut: same timeline, so the chapter stops line up */
  const filmFile = window.FinesseLocale?.language === "en" ? "hunterbuddy-origin-en" : "hunterbuddy-origin";
  const posterFile = window.FinesseLocale?.language === "en" ? "origin-film-poster-en" : "origin-film-poster";
  // the English film was re-cut on 2026-10-22 for more natural English; the Chinese film is unchanged
  const filmVersion = window.FinesseLocale?.language === "en" ? "20261022-en-copy" : "20261022-terms";
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const film = el("section", "o-film");
  film.id = "film";
  film.setAttribute("aria-labelledby", "o-film-title");
  film.innerHTML = ui.localizeHTML(`
    <div class="f-container">
      <header class="o-film-head">
        <p class="o-film-kicker">产品短片 · 两分钟</p>
        <h2 id="o-film-title"><span class="ln">两分钟，</span><span class="ln">跟着一家公司走一遍。</span></h2>
        <p class="o-film-lead">从一条融资新闻出发，看 HunterBuddy 怎么帮你拿到职位、做出人才地图、寻访到人选，半年后再帮人选找到下一个机会。建议打开声音。</p>
      </header>
      <figure class="o-film-frame">
        <video data-film src="assets/${filmFile}.mp4?v=${filmVersion}" poster="assets/${posterFile}.jpg?v=${filmVersion}" controls playsinline preload="metadata" aria-label="HunterBuddy 两分钟产品短片"></video>
      </figure>
      <div class="o-course" style="--p: 0">
        <div class="o-course-line" aria-hidden="true"><span class="o-course-craft"></span></div>
        <ol class="o-course-stops" aria-label="短片章节">${CHAPTERS.map(
          ([t, name], i) =>
            `<li><button type="button" data-t="${t}" aria-pressed="false"><span class="o-stop-dot"></span><span class="o-stop-time">${mmss(t)}</span><span class="o-stop-name">${name}</span></button></li>`,
        ).join("")}</ol>
      </div>
    </div>`);
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
    // where each star sits, and which side its name goes: r = right, l = left, b = below
    const WIDE = {
      h: 470,
      at: { company: [205, 108], job: [600, 90], candidate: [420, 250], contact: [190, 382], research: [650, 380] },
      side: { company: "l", job: "r", candidate: "b", contact: "l", research: "b" },
    };
    const TALL = {
      h: 960,
      at: { research: [160, 180], candidate: [500, 480], company: [610, 150], job: [600, 790], contact: [170, 770] },
      side: { research: "r", candidate: "b", company: "l", job: "l", contact: "r" },
    };
    let H = WIDE.h, AT = WIDE.at, SIDE = WIDE.side;
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
      ({ h: H, at: AT, side: SIDE } = compact ? TALL : WIDE);
      const spot = (id, x, y) => {
        const below = SIDE[id] === "b", left = SIDE[id] === "l";
        return { below, tx: below ? x : x + (left ? -20 : 20) * k, anchor: below ? "middle" : left ? "end" : "start" };
      };
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
        const tag = svgEl("g", { class: "o-tag", "stroke-width": (4 * k).toFixed(1) });
        tag.append(svgEl("text", { "font-size": (12 * k).toFixed(1), class: "o-tag-label" }, edge.label));
        tag.append(svgEl("text", { "font-size": (10.5 * k).toFixed(1), class: "o-tag-note" }, edge.note));
        tagLayer.append(tag);
        lines.set(edge.id, { ink, tag, edge });
      });
      svg.append(lineLayer, inkLayer, tagLayer, packetLayer);
      // star names, so the tags can keep clear of them
      const ems = (s, latin) => [...s].reduce((n, ch) => n + (/[　-鿿＀-￯]/.test(ch) ? 1 : latin), 0);
      const textBox = (x, y, s, size, anchor, latin = 0.56) => {
        const w = ems(s, latin) * size;
        return { x: anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x, y: y - 0.92 * size, w, h: 1.16 * size, m: 10 * k };
      };
      const blocks = [];
      Object.entries(AT).forEach(([id, [x, y]]) => {
        const { below, tx, anchor } = spot(id, x, y);
        blocks.push({ x: x - 16 * k, y: y - 16 * k, w: 32 * k, h: 32 * k });
        blocks.push(textBox(tx, y - (below ? 24 : 16) * k, "00", 10.5 * k, anchor, 0.7));
        blocks.push(textBox(tx, y + (below ? 36 : 6) * k, info.get(id).label, (compact ? 15 : 18) * k, anchor));
        if (!compact) blocks.push(textBox(tx, y + (below ? 53 : 23) * k, info.get(id).detail, 11 * k, anchor));
      });
      // each tag sits beside its own line: never on it, and clear of other lines, star names and tags
      const overlap = (a, b, m = 0) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) + m - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) + m - Math.max(a.y, b.y));
      const samples = new Map(model.edges.map((edge) => {
        const [ax, ay] = AT[edge.from], [bx, by] = AT[edge.to];
        return [edge.id, Array.from({ length: 41 }, (_, i) => [ax + ((bx - ax) * i) / 40, ay + ((by - ay) * i) / 40])];
      }));
      const top = -11 * k, bottom = (compact ? 3 : 17) * k;
      [...model.edges].sort((a, b) => Math.hypot(...AT[a.from].map((v, i) => v - AT[a.to][i])) - Math.hypot(...AT[b.from].map((v, i) => v - AT[b.to][i]))).forEach((edge) => {
        const [ax, ay] = AT[edge.from], [bx, by] = AT[edge.to];
        const len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len;
        const w = Math.max(ems(edge.label, 0.6) * 12 * k, compact ? 0 : ems(edge.note, 0.56) * 10.5 * k), h = bottom - top;
        let best = null;
        [0.5, 0.42, 0.58, 0.34, 0.66, 0.27, 0.73].forEach((t) => [1, -1].forEach((side) => {
          const nx = -uy * side, ny = ux * side;
          const dist = 6 * k + Math.abs(nx) * w / 2 + Math.abs(ny) * h / 2;
          const cx = ax + (bx - ax) * t + nx * dist, cy = ay + (by - ay) * t + ny * dist;
          const box = { x: cx - w / 2, y: cy - h / 2, w, h };
          let score = Math.abs(t - 0.5) * 120;
          blocks.forEach((b) => (score += overlap(box, b, b.m ?? 4 * k) * 6));
          samples.forEach((pts, id) => id !== edge.id && pts.forEach(([px, py]) => {
            if (px > box.x - 4 * k && px < box.x + w + 4 * k && py > box.y - 4 * k && py < box.y + h + 4 * k) score += 400;
          }));
          score += (Math.max(0, 6 * k - box.x) + Math.max(0, box.x + w - W + 6 * k) + Math.max(0, 6 * k - box.y) + Math.max(0, box.y + h - H + 6 * k)) * 80;
          if (!best || score < best.score) best = { score, box, cx, cy };
        }));
        blocks.push({ ...best.box, m: 12 * k });
        const my = best.cy - (top + bottom) / 2;
        const [label, note] = lines.get(edge.id).tag.children;
        label.setAttribute("x", best.cx.toFixed(1)); label.setAttribute("y", my.toFixed(1));
        note.setAttribute("x", best.cx.toFixed(1)); note.setAttribute("y", (my + 14 * k).toFixed(1));
      });
      const stars = new Map();
      Object.entries(AT).forEach(([id, [x, y]]) => {
        const g = svgEl("g", { class: `o-star${id === "candidate" ? " is-hub" : ""}`, "stroke-width": (4 * k).toFixed(1) });
        const halo = svgEl("circle", { cx: x, cy: y, r: (id === "candidate" ? 34 : 24) * k, fill: "url(#o-star-glow)", class: "o-star-halo" });
        g.append(halo);
        g.append(svgEl("circle", { cx: x, cy: y, r: 12 * k, class: "o-star-ring" }));
        g.append(svgEl("circle", { cx: x, cy: y, r: (id === "candidate" ? 5.5 : 3.8) * k, class: "o-star-core" }));
        const { below, tx, anchor } = spot(id, x, y);
        const num = svgEl("text", { x: tx, y: y - (below ? 24 : 16) * k, "font-size": (10.5 * k).toFixed(1), class: "o-star-num", "text-anchor": anchor }, "");
        g.append(num);
        g.append(svgEl("text", { x: tx, y: y + (below ? 36 : 6) * k, "font-size": ((compact ? 15 : 18) * k).toFixed(1), class: "o-star-label", "text-anchor": anchor }, info.get(id).label));
        if (!compact) g.append(svgEl("text", { x: tx, y: y + (below ? 53 : 23) * k, "font-size": (11 * k).toFixed(1), class: "o-star-detail", "text-anchor": anchor }, info.get(id).detail));
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
    [".o-kicker", haze(14), () => 0, 900],
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
    n.animate(haze(n.classList.contains("o-mark") ? 30 : 16), { duration: 1300, delay: 120 + i * 140, easing: EASE, fill: "backwards" });
  });
})();
