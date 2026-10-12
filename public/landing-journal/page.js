(() => {
  const WORKS = [
    {
      headline: "给出岗位要求，找到人，也看清为什么。",
      description: "从岗位与客户要求出发，围绕目标公司，在已有候选人、公开履历、论文与专利中跨渠道找人。",
      detail: "核对身份、合并重复资料，对照岗位留下匹配理由、来源与待确认条件。谁值得联系，由你判断。",
      context: "机器人公司 · 视觉算法负责人",
      subject: "值得进一步了解的人选与匹配依据",
      rows: [
        { t: "林越", k: "工业视觉 · 团队负责人", c: "产线视觉与算法团队经历。", f: "实际管理范围" },
        { t: "周宁", k: "机器人感知 · 技术骨干", c: "相关论文与项目经历。", f: "量产落地经验" },
        { t: "陈思", k: "视觉算法 · 项目负责人", c: "跨团队交付经历。", f: "近期职责与求职意向" },
      ],
      evidence: [
        ["岗位要求", "负责工业视觉方向，具备项目交付与团队协作经历。未提供的条件保持未知。"],
        ["候选人资料", "匹配理由对应已有经历与相关成果，资料来源和需要进一步了解的条件分别保留。"],
      ],
      questions: ["岗位中哪些条件不可妥协？", "人选当前任职与项目职责是否准确？", "本人求职意向及联系许可是否已确认？"],
    },
    {
      headline: "从公司变化，找到值得跟进的客户机会。",
      description: "结合新业务、新基地和招聘动态，梳理公司业务、相关岗位与关键角色，发现潜在客户需求。",
      detail: "留下值得关注的原因、负责人线索和沟通切入点。带着背景核实需求，让下一次客户沟通有备而来。",
      context: "机器人与智能制造",
      subject: "星川机器人",
      rows: [
        { t: "新基地与技术岗位信息同时出现", k: "观察到的变化", c: "新生产基地的公开信息，与视觉、控制方向的岗位需求同时出现。" },
        { t: "业务扩张出现技术团队需求线索", k: "潜在需求", c: "招聘优先级、预算与需求有效性，仍需进一步沟通确认。" },
        { t: "从新基地交付计划与岗位需求聊起", k: "沟通切入点", c: "进一步核实相关负责角色和有效的联系路径，判断是否值得跟进。" },
      ],
      evidence: [
        ["生产基地动态", "新增产线与交付计划可支持业务扩张线索，但不能直接认定招聘委托已经成立。"],
        ["岗位信息", "视觉算法与运动控制方向的岗位需求，仍需核实优先级、招聘预算、负责人与对外渠道。"],
      ],
      questions: ["招聘需求是否仍然有效？", "哪位负责人适合进一步沟通？", "现有联系路径是否已获授权？"],
    },
    {
      headline: "从一家公司，梳理团队与关键人才。",
      description: "围绕目标公司的团队与关键岗位，关联公开任职、候选人资料以及论文、专利中的人物线索。",
      detail: "把人物角色、关系依据和未覆盖的岗位放在同一份研究里。已知继续核对，缺口继续补充，让下一轮寻访有方向。",
      context: "目标公司 · 团队研究",
      subject: "星川机器人 · 关键角色",
      rows: [
        { t: "视觉团队", k: "视觉算法负责人", c: "有负责人任职线索，人物身份与当前职责待确认。" },
        { t: "控制团队", k: "运动控制负责人", c: "有相关技术成果线索，作者或发明人与真实任职的对应关系待核实。" },
        { t: "产品团队", k: "产品交付负责人", c: "负责人尚未覆盖，保留为下一轮资料补充方向。" },
      ],
      evidence: [
        ["团队与岗位", "不同团队按各自公开线索整理，不把合作、共同作者或联系关系当作汇报关系。"],
        ["技术成果", "论文与专利只支持技术方向与人物发现，需要进一步核验身份和真实任职。"],
      ],
      questions: ["团队名称与职责是否仍然有效？", "线索人物能否与已有候选人核验为同一人？", "哪些岗位与汇报关系尚没有可靠依据？"],
    },
    {
      headline: "从候选人的经历，找到值得讨论的下一站。",
      description: "结合专业方向、项目经历与候选人意向，研究相关公司和岗位，寻找手上岗位之外的机会。",
      detail: "对照经历、职责与地点，保留匹配依据和待确认条件。哪些机会值得沟通、是否推荐，由你判断。",
      context: "候选人 · 新机会研究",
      subject: "林越 · 工业视觉与团队管理",
      rows: [
        { t: "算法落地与小团队交付", k: "已有经验", c: "沿已有项目经历研究相关岗位，保留资料来源与不确定处。" },
        { t: "工业视觉与机器人感知岗位", k: "可继续研究的方向", c: "从专业方向与已有经历出发，进一步了解公司与岗位要求。" },
        { t: "岗位职责、工作地点与本人意向", k: "需要比较的条件", c: "缺失条件保留待确认。先讨论方向、核实机会，再决定是否对外推荐。" },
      ],
      evidence: [
        ["本人要求", "人选希望继续工业视觉方向。未提供的薪酬、地点与到岗时间保持未知。"],
        ["市场机会", "公开岗位线索仅供研究，不意味着公司已接受推荐或人选已同意对外传递资料。"],
      ],
      questions: ["本人下一步最在意的条件是什么？", "机会的职责与要求是否已核实？", "对外推荐的内容和范围是否得到同意？"],
    },
  ];

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  /* film chapters: seek on click, follow playback */
  const video = document.querySelector("[data-film]");
  const chapters = [...document.querySelectorAll("[data-chapters] .chapter")];
  const markChapter = (index) =>
    chapters.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
  chapters.forEach((button, i) =>
    button.addEventListener("click", () => {
      if (!video) return;
      try {
        video.currentTime = Number(button.dataset.t);
      } catch {
        /* metadata not loaded yet; play() will start from the top */
      }
      video.play()?.catch?.(() => {});
      markChapter(i);
    }),
  );
  video?.addEventListener("timeupdate", () => {
    let index = -1;
    chapters.forEach((button, i) => {
      if (video.currentTime >= Number(button.dataset.t)) index = i;
    });
    markChapter(index);
  });

  /* hero data flow: hold still for reduced motion, and pause while off screen */
  const flow = document.querySelector("svg[data-flow]");
  if (flow?.pauseAnimations) {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const sync = () => (visible && !still.matches ? flow.unpauseAnimations() : flow.pauseAnimations());
    if ("IntersectionObserver" in window)
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      }).observe(flow);
    still.addEventListener?.("change", sync);
    sync();
  }

  /* hero assembly (after steep.app, in this page's journal idiom): while the hero is pinned, the pills
     that float around the headline fly into Figure 01, the hub appears, connectors draw, data flows. */
  (() => {
    const hero = document.querySelector("[data-hero]");
    const svg = hero?.querySelector("svg[data-flow]");
    if (!hero || !svg) return;
    const pin = hero.querySelector(".pin");
    const wrap = pin.querySelector(".wrap");
    const copy = hero.querySelector(".hero-copy");
    const title = copy.querySelector("h1");
    const others = [...copy.children].filter((n) => n !== title);
    const figure = hero.querySelector(".pipeline");
    const caption = figure.querySelector("figcaption");
    const washes = [...hero.querySelectorAll(".wash")];
    const nodes = [...svg.querySelectorAll(".pn:not(.hub)")];
    const hub = svg.querySelector(".pn.hub");
    const glow = svg.querySelector(".lay-glow");
    const labels = svg.querySelector(".lay-label");
    const packets = svg.querySelector(".lay-packet");
    const drawn = [...svg.querySelectorAll('.lay-wire path[pathLength="1"]')];
    const faded = [...svg.querySelectorAll(".lay-wire path:not([pathLength])")];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const roomy = window.matchMedia("(min-width: 1100px) and (min-height: 700px)");
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const out = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
    // where each pill floats before assembly: centre offset from the headline's centre (px), and a tilt
    const FLOAT = {
      s0: [-560, -230, -4], s1: [560, -250, 3], s2: [-625, -40, 2], s3: [615, -80, -3], s4: [-520, 140, 3],
      s5: [525, 100, -2], o0: [-600, 300, 2], o1: [600, 270, -3], o2: [70, 330, 1],
    };
    let on = false, geo = null, shown = -1, raf = 0, visible = true;

    const centre = (g) => { const b = g.getBBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };

    function measure() {
      [title, ...others].forEach((n) => { n.style.transform = ""; n.style.opacity = ""; });
      const pinH = pin.clientHeight;
      const cs = getComputedStyle(wrap);
      const innerW = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ts = 0.56;
      const titleH = title.offsetHeight * ts;
      const s = Math.min(1, innerW / 1368, (pinH - titleH - 120) / 452);
      const fw = 1368 * s, fh = 452 * s;
      const total = titleH + 36 + fh + 44;
      const top0 = Math.max(16, (pinH - total) / 2);
      const ft = top0 + titleH + 36;
      figure.style.setProperty("--fw", `${fw}px`);
      figure.style.setProperty("--ft", `${ft}px`);
      const pinTop = pin.getBoundingClientRect().top;
      const t = title.getBoundingClientRect();
      const copyMid = copy.getBoundingClientRect().top + copy.offsetHeight / 2 - pinTop;
      const qx = Math.min(1, innerW / 1368), qy = Math.min(1, (pinH - 60) / 760);
      geo = {
        s, ts, titleDy: top0 - (t.top - pinTop),
        items: nodes.map((g) => {
          const [cx, cy] = centre(g);
          const [fx, fy, rot] = FLOAT[g.dataset.n];
          const lim = window.innerWidth / 2 - 24 - 110 * s; // keep every pill fully on screen
          const px = Math.max(-lim, Math.min(lim, fx * qx));
          const vx = 684 + px / s, vy = (copyMid - ft) / s + (fy * qy) / s;
          return { g, cx, cy, dx: vx - cx, dy: vy - cy, rot, i: Object.keys(FLOAT).indexOf(g.dataset.n) };
        }),
      };
      shown = -1;
    }

    function progress() {
      const r = hero.getBoundingClientRect();
      return clamp((81 - r.top) / Math.max(1, hero.offsetHeight - pin.offsetHeight));
    }

    function paint(p, now) {
      const { s, ts, titleDy, items } = geo;
      const c = out(p / 0.38);
      others.forEach((n, i) => {
        n.style.opacity = String(1 - clamp(c * 1.3));
        n.style.transform = `translateY(${(i === others.length - 1 ? 36 : -24) * c}px)`;
        n.style.visibility = c > 0.97 ? "hidden" : "";
      });
      const g = ease(clamp(p / 0.7));
      title.style.transform = `translateY(${titleDy * g}px) scale(${1 - (1 - ts) * g})`;
      washes.forEach((w, i) => (w.style.transform = `translate(${(i ? -1 : 1) * 70 * p}px, ${-40 * p}px)`));
      for (const it of items) {
        const f = ease(clamp((p - 0.1 - it.i * 0.035) / 0.56));
        const bob = (Math.sin(now / 1000 * (0.8 + it.i * 0.07) + it.i * 1.7) * 6 * (1 - f)) / s;
        it.g.setAttribute("transform", `translate(${it.dx * (1 - f)} ${it.dy * (1 - f) + bob}) rotate(${it.rot * (1 - f)} ${it.cx} ${it.cy})`);
      }
      const h = out(clamp((p - 0.42) / 0.26));
      hub.setAttribute("transform", `translate(684 236) scale(${0.6 + 0.4 * h}) translate(-684 -236)`);
      hub.style.opacity = String(h);
      glow.style.opacity = String(h);
      const wIn = ease(clamp((p - 0.5) / 0.32)), wOut = ease(clamp((p - 0.64) / 0.26));
      drawn.forEach((path) => {
        const d = path.id.startsWith("pf-o") ? wOut : wIn;
        path.style.strokeDasharray = "1";
        path.style.strokeDashoffset = String(1 - d);
      });
      faded.forEach((path) => (path.style.opacity = String(path.classList.contains("flow-dash") ? clamp((p - 0.84) / 0.12) : wOut)));
      packets.style.opacity = String(clamp((p - 0.86) / 0.12));
      labels.style.opacity = String(clamp((p - 0.74) / 0.2));
      caption.style.opacity = String(clamp((p - 0.82) / 0.16));
    }

    function frame(now) {
      raf = 0;
      if (!on || !geo) return;
      const target = progress();
      shown = shown < 0 ? target : shown + (target - shown) * 0.14;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      paint(shown, now);
      if (visible && (shown !== target || shown < 0.98)) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (on && !raf) raf = requestAnimationFrame(frame); };

    function reset() {
      [title, ...others, ...washes].forEach((n) => { n.style.transform = ""; n.style.opacity = ""; n.style.visibility = ""; });
      [...nodes, hub].forEach((g) => { g.removeAttribute("transform"); g.style.opacity = ""; });
      [glow, labels, packets, caption, ...faded].forEach((n) => (n.style.opacity = ""));
      drawn.forEach((path) => { path.style.strokeDasharray = ""; path.style.strokeDashoffset = ""; });
      figure.style.removeProperty("--fw");
      figure.style.removeProperty("--ft");
      geo = null;
    }

    function setup() {
      const want = roomy.matches && !still.matches;
      if (want !== on) {
        on = want;
        hero.classList.toggle("assemble", on);
        if (!on) return reset();
      }
      if (on) { measure(); kick(); }
    }

    let resizeTimer = 0;
    window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setup, 120); });
    window.addEventListener("scroll", kick, { passive: true });
    roomy.addEventListener?.("change", setup);
    still.addEventListener?.("change", setup);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; kick(); }).observe(hero);
    setup();
    document.fonts?.ready.then(() => on && (measure(), kick()));
  })();

  /* scenario tabs: a sliding selection marker, and a panel that fades out, swaps, then eases back in */
  const tabList = document.querySelector("[data-tabs]");
  const tabs = [...tabList.querySelectorAll(".tab")];
  const panel = document.querySelector("[data-panel]");
  const slot = (name) => panel.querySelector(`[data-f="${name}"]`);
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  const marker = el("span", "tab-ink");
  marker.setAttribute("aria-hidden", "true");
  tabList.prepend(marker);
  tabList.classList.add("has-ink");
  let current = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
  let swap = 0;

  function moveMarker(instant = false) {
    const tab = tabs[current];
    if (instant) marker.style.transition = "none";
    marker.style.width = `${tab.offsetWidth}px`;
    marker.style.height = `${tab.offsetHeight}px`;
    marker.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
    if (instant) {
      void marker.offsetWidth;
      marker.style.transition = "";
    }
  }
  moveMarker(true);
  window.addEventListener("resize", () => moveMarker(true));
  document.fonts?.ready.then(() => moveMarker(true));

  const stagger = (nodes, from = 0) =>
    nodes.map((node, i) => {
      node.classList.add("anim-in");
      node.style.setProperty("--i", String(from + i));
      return node;
    });

  function renderWork(index) {
    const work = WORKS[index];
    ["headline", "description", "detail", "context", "subject"].forEach((key) => {
      slot(key).textContent = work[key];
    });
    slot("questions").replaceChildren(...stagger(work.questions.map((q) => el("div", "q", q)), 2));
    slot("rows").replaceChildren(
      ...stagger(
        work.rows.map((row) => {
          const item = el("div", "row");
          item.append(el("strong", "", row.t), el("span", "k", row.k), el("p", "", row.c));
          if (row.f) item.append(el("p", "follow", `仍需了解：${row.f}`));
          return item;
        }),
        1,
      ),
    );
    slot("evidence").replaceChildren(
      ...stagger(
        work.evidence.map(([title, copy]) => {
          const item = el("div");
          item.append(el("b", "", `${title}：`), document.createTextNode(copy));
          return item;
        }),
        4,
      ),
    );
  }

  function showWork(index, focus = false) {
    if (focus) tabs[index].focus();
    if (index === current) return;
    current = index;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tabs[index].id);
    moveMarker();
    if (calm.matches) {
      renderWork(index);
      return;
    }
    const token = ++swap;
    const from = panel.offsetHeight;
    panel.style.height = `${from}px`;
    panel.classList.add("is-sizing", "is-out");
    setTimeout(() => {
      if (token !== swap) return;
      renderWork(index);
      panel.classList.replace("is-out", "is-in");
      panel.style.height = "auto";
      const to = panel.offsetHeight;
      panel.style.height = `${from}px`;
      void panel.offsetHeight;
      panel.classList.remove("is-in");
      panel.style.height = `${to}px`;
      setTimeout(() => {
        if (token !== swap) return;
        panel.style.height = "";
        panel.classList.remove("is-sizing");
      }, 480);
    }, 170);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => showWork(i));
    tab.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        showWork(event.key === "Home" ? 0 : tabs.length - 1, true);
      } else if (step) {
        event.preventDefault();
        showWork((i + step + tabs.length) % tabs.length, true);
      }
    });
  });

  /* scroll reveals: every part of every section arrives with its own motion, the first time it is seen */
  (() => {
    window.__hbReveal = true;
    if (!document.documentElement.classList.contains("motion") || !Element.prototype.animate) {
      document.documentElement.classList.remove("motion");
      return;
    }
    const EASE = "cubic-bezier(.2, .75, .2, 1)";
    const rise = (y = 28, x = 0, s = 1) => [
      { opacity: 0, transform: `translate3d(${x}px, ${y}px, 0) scale(${s})` },
      { opacity: 1, transform: "none" },
    ];
    // [selector, keyframes, delay(i), duration]; i = position among revealed siblings
    const SPEC = [
      [".sec-head .left > *", rise(28), (i) => i * 90, 900],
      [".sec-head > .lead", rise(28), () => 220, 900],
      [".film", [{ opacity: 0.3, clipPath: "inset(9% 11% round 40px)", transform: "scale(.97)" }, { opacity: 1, clipPath: "inset(0% 0% round 40px)", transform: "none" }], () => 0, 1300],
      [".chapters .chapter", rise(14), (i) => 320 + i * 60, 700],
      [".grid3 .feature", rise(44, 0, 0.98), (i) => (i % 3) * 110 + Math.floor(i / 3) * 160, 1000],
      [".tabs", rise(20), () => 0, 800],
      [".panel-copy", rise(28), () => 120, 900],
      [".elevated", rise(56, 0, 0.98), () => 220, 1100],
      [".statement", rise(40), () => 0, 1100],
      [".gate", [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], () => 150, 1700],
      [".duo .card", rise(36), (i) => i * 140, 1000],
      [".duo li", rise(0, -14), (i) => 380 + i * 90, 700],
      ["#boundary .wrap > .body", rise(24), () => 120, 900],
      [".graph", rise(40, 0, 0.98), () => 0, 1000],
      [".flows .flow", rise(28), (i) => 160 + i * 120, 900],
      [".faq details", rise(20), (i) => i * 70, 800],
      [".band", [{ opacity: 0, transform: "scale(.95)" }, { opacity: 1, transform: "none" }], () => 0, 1100],
      [".band > :not(.wash)", rise(24), (i) => 260 + i * 100, 900],
      [".about > *", rise(28), (i) => i * 80, 900],
      [".facts li", rise(0, -12), (i) => 300 + i * 60, 600],
      [".form", rise(44), () => 160, 1000],
      [".foot-cols > div", rise(20), (i) => i * 80, 800],
      [".foot-meta", rise(12), () => 300, 800],
    ];
    const jobs = new Map();
    SPEC.forEach(([sel, frames, delay, duration]) => {
      const seen = new Map();
      document.querySelectorAll(sel).forEach((n) => {
        if (jobs.has(n)) return;
        const i = seen.get(n.parentElement) || 0;
        seen.set(n.parentElement, i + 1);
        jobs.set(n, { frames, delay: delay(i), duration });
      });
    });

    // Figure 05: edges draw from the candidate outward, then the labels and nodes settle
    const graph = document.querySelector(".graph svg");
    graph?.querySelectorAll("path").forEach((p) => { p.setAttribute("pathLength", "1"); p.classList.add("edge"); });
    const drawGraph = () => {
      graph.querySelectorAll("path").forEach((p, i) =>
        p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 350 + i * 110, easing: EASE, fill: "both" }),
      );
      [...graph.children].filter((n) => n.tagName !== "path").forEach((n, i) =>
        n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 700 + i * 45, easing: "ease-out", fill: "backwards" }),
      );
    };

    const show = (n) => {
      const job = jobs.get(n);
      n.classList.add("in");
      n.animate(job.frames, { duration: job.duration, delay: job.delay, easing: EASE, fill: "backwards" });
      if (n.matches(".elevated"))
        n.querySelectorAll(".row").forEach((row, i) =>
          row.animate(rise(0, -12), { duration: 700, delay: 560 + i * 110, easing: EASE, fill: "backwards" }),
        );
      if (n.matches(".graph") && graph) drawGraph();
    };
    const pending = new Set();
    const reveal = (n) => { if (!pending.delete(n)) return; io.unobserve(n); show(n); };
    const io = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && reveal(en.target)), {
      rootMargin: "0px 0px -8% 0px",
    });
    // at the very bottom of the page the last items can never cross the trigger line, so let them in
    window.addEventListener(
      "scroll",
      () => {
        if (pending.size && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)
          [...pending].filter((n) => n.getBoundingClientRect().top < window.innerHeight).forEach(reveal);
      },
      { passive: true },
    );
    jobs.forEach((_, n) => {
      if (n.getBoundingClientRect().bottom < 0) {
        n.classList.add("in");
        graph?.querySelectorAll(".edge").forEach((p) => p.style.setProperty("stroke-dashoffset", "0"));
      } else {
        pending.add(n);
        io.observe(n);
      }
    });
  })();

  /* trial application */
  const form = document.querySelector("[data-trial-form]");
  if (!form) return;
  const toggles = [...form.querySelectorAll("[data-industries] .toggle")];
  toggles.forEach((toggle) =>
    toggle.addEventListener("click", () =>
      toggle.setAttribute("aria-pressed", String(toggle.getAttribute("aria-pressed") !== "true")),
    ),
  );
  const status = form.querySelector("[data-status]");
  const submit = form.querySelector("[data-submit]");
  const say = (text, tone = "warn") => {
    status.textContent = text;
    status.dataset.tone = tone;
    status.hidden = false;
  };
  const required = ["name", "company", "phone", "email", "role", "activePositions"];

  function apiUrl() {
    const value = document.querySelector('meta[name="trial-api"]')?.content || "/api/trial-applications";
    if (value === "disabled") return null;
    const url = new URL(value, location.origin);
    const local = url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname);
    if (url.pathname !== "/api/trial-applications" || url.search || url.hash || url.username || url.password || (url.protocol !== "https:" && !local))
      throw new Error("Invalid trial API configuration");
    return url.href;
  }

  let snapshot = null;
  form.addEventListener("input", () => {
    snapshot = null;
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let first = null;
    required.forEach((name) => {
      const control = form.elements.namedItem(name);
      const empty = !control.value.trim();
      control.closest(".field").dataset.invalid = String(empty);
      if (empty && !first) first = control;
    });
    const industries = toggles.filter((t) => t.getAttribute("aria-pressed") === "true").map((t) => t.textContent);
    const consent = form.elements.namedItem("acknowledgedPurpose");
    if (first || !industries.length || !consent.checked) {
      say("还有必填项没有完成：请补全带 * 的信息，选择至少一个行业，并勾选信息用途说明。");
      (first || (!industries.length ? toggles[0] : consent)).focus();
      return;
    }
    const email = form.elements.namedItem("email");
    if (!/^[^@\s]+@[a-z\d-]+(\.[a-z\d-]+)+$/i.test(email.value.trim())) {
      email.closest(".field").dataset.invalid = "true";
      say("邮箱格式看起来不正确，请检查后再提交。");
      email.focus();
      return;
    }
    const phone = form.elements.namedItem("phone");
    if (!/^\+?[\d ()-]{6,20}$/.test(phone.value.trim()) || phone.value.replace(/\D/g, "").length < 7) {
      phone.closest(".field").dataset.invalid = "true";
      say("请填写有效的联系电话；境外号码请包含国家区号。");
      phone.focus();
      return;
    }

    let endpoint;
    try {
      endpoint = apiUrl();
    } catch {
      say("申请服务暂时不可用，请稍后重试。");
      return;
    }
    if (!endpoint) {
      say("试用申请服务尚未开通：当前为静态预览页面，填写已通过校验，但不会发送任何信息。", "ok");
      return;
    }
    if (!window.crypto?.randomUUID) {
      say("当前浏览器无法提交申请，请使用更新的浏览器后重试。");
      return;
    }
    snapshot ||= {
      ...Object.fromEntries(required.map((name) => [name, form.elements.namedItem(name).value.trim()])),
      industry: industries.join("、"),
      acknowledgedPurpose: true,
      submissionId: crypto.randomUUID(),
    };
    submit.disabled = true;
    say("正在提交，请稍候。", "ok");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
        signal: controller.signal,
      });
      const result = await response.json();
      if (response.ok && result.status === "received" && result.receipt === snapshot.submissionId) {
        form.reset();
        toggles.forEach((t) => t.setAttribute("aria-pressed", "false"));
        snapshot = null;
        say("申请已收到。开放试用后，我们会通过你留下的联系方式与你联系；提交申请不代表试用已开通。", "ok");
      } else if (result.status === "rate_limited") {
        say("提交过于频繁，请稍后再试。已填写的信息会保留在当前页面。");
      } else if (result.status === "invalid") {
        snapshot = null;
        say("申请信息未通过校验，请检查并修改后重新提交。");
      } else {
        say("申请暂未提交，请稍后重试。已填写的信息会保留在当前页面。");
      }
    } catch {
      say("暂未确认申请结果。请重试；为避免重复，重试会使用相同资料。");
    } finally {
      clearTimeout(timer);
      submit.disabled = false;
    }
  });
})();
