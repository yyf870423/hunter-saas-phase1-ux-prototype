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
  title.innerHTML = '<span class="fx-line">给我一个难岗位，</span><span class="fx-line">把该找的人找出来。</span>';
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
  const curtain = [{ opacity: 1, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, clipPath: "inset(0% 0 0 0)" }];
  const SPEC = [
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

  // the hero arrives once: brand line, the promise line by line, then the rest
  [...copy.children].forEach((n, i) => {
    n.classList.add("in");
    n.animate(rise(i === 1 ? 26 : 16), { duration: 1100, delay: 100 + i * 130, easing: EASE, fill: "backwards" });
  });
})();
