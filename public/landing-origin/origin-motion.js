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
  title.innerHTML = '<span class="o-line">给我一个难岗位，</span><span class="o-line">把该找的人找出来。</span>';
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

  /* ---------------- dark cards catch a glow that follows the cursor ---------------- */
  const glowTargets = [".f-network-map [data-node]", ".p-stage", ".f-trial-form", ".f-work-panel"];
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

  /* ---------------- network: data keeps flowing along the active path ---------------- */
  const network = root.querySelector(".f-asset-network");
  const wiresSvg = network?.querySelector(".f-network-wires");
  const model = window.FinesseHomepageData?.assetNetwork;
  if (network && wiresSvg && model) {
    const NS = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(NS, "g");
    group.setAttribute("class", "o-packets");
    wiresSvg.append(group);
    const wire = (id) => wiresSvg.querySelector(`[data-wire="${id}"]`);
    let flows = [];
    const plan = () => {
      group.replaceChildren();
      const path = model.paths.find((p) => p.id === network.dataset.activePath) || model.paths[0];
      const depths = new Map([[path.nodes[0], 0]]);
      const edges = model.edges.filter((e) => path.edges.includes(e.id));
      const queue = [path.nodes[0]];
      for (const node of queue)
        edges.forEach((edge) => {
          const other = edge.from === node ? edge.to : edge.to === node ? edge.from : null;
          if (other && !depths.has(other)) { depths.set(other, depths.get(node) + 1); queue.push(other); }
        });
      flows = edges.flatMap((edge) => {
        const reverse = depths.get(edge.from) > depths.get(edge.to);
        const order = Math.min(depths.get(edge.from), depths.get(edge.to));
        return [0, 0.5].map((phase) => {
          const dot = document.createElementNS(NS, "circle");
          dot.setAttribute("r", "3");
          if (edge.pending) dot.setAttribute("class", "is-pending");
          group.append(dot);
          return { dot, id: edge.id, reverse, phase: phase + order * 0.18 };
        });
      });
    };
    let netOn = false, netRaf = 0;
    const tick = (now) => {
      netRaf = 0;
      if (!netOn || reduced.matches || document.hidden) { group.style.display = "none"; return; }
      group.style.display = "";
      for (const f of flows) {
        const w = wire(f.id);
        if (!w) continue;
        const len = w.getTotalLength();
        let u = (now / 2600 + f.phase) % 1;
        if (f.reverse) u = 1 - u;
        const pt = w.getPointAtLength(u * len);
        f.dot.setAttribute("cx", pt.x.toFixed(1));
        f.dot.setAttribute("cy", pt.y.toFixed(1));
        f.dot.setAttribute("opacity", (Math.sin(Math.PI * ((now / 2600 + f.phase) % 1)) * 0.9 + 0.1).toFixed(2));
      }
      netRaf = requestAnimationFrame(tick);
    };
    const go = () => { if (!netRaf) netRaf = requestAnimationFrame(tick); };
    new MutationObserver(() => { plan(); go(); }).observe(network, { attributes: true, attributeFilter: ["data-active-path"] });
    new IntersectionObserver(([en]) => { netOn = en.isIntersecting; go(); }).observe(network);
    document.addEventListener("visibilitychange", go);
    plan();
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

  // the hero arrives out of the clouds
  [...copy.children].forEach((n, i) => {
    n.classList.add("in");
    n.animate(haze(i === 2 ? 30 : 16), { duration: 1300, delay: 120 + i * 140, easing: EASE, fill: "backwards" });
  });
})();
