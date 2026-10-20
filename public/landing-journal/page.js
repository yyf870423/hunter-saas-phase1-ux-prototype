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

  /* data-flow figures (hero, 人机协作): hold still for reduced motion, and pause while off screen */
  document.querySelectorAll("svg[data-flow]").forEach((flow) => {
    if (!flow.pauseAnimations) return;
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
  });

  /* about drawing: number the strokes so they ink in one after another */
  document.querySelectorAll(".sketch").forEach((art) => art.querySelectorAll(".ln, .fade").forEach((n, i) => n.style.setProperty("--i", i)));

  /* figure 05: its two glows drift only while the figure is on screen */
  document.querySelectorAll(".graph").forEach((fig) => {
    if (!("IntersectionObserver" in window)) return fig.classList.add("is-live");
    new IntersectionObserver(([entry]) => fig.classList.toggle("is-live", entry.isIntersecting)).observe(fig);
  });

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
  // the card beside the panel lines up with the top of the tabs; it needs to know how tall the tab row is
  const workSection = tabList.closest("section");
  const syncTabsHeight = () => workSection?.style.setProperty("--tabs-h", `${tabList.offsetHeight}px`);
  syncTabsHeight();
  if ("ResizeObserver" in window) new ResizeObserver(syncTabsHeight).observe(tabList);
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

  /* how it works: six columns in one strip; the step the mouse points at opens (tap, Tab focus or
     Enter / Space do the same), the others stay narrow */
  (() => {
    const cols = [...document.querySelectorAll("[data-s6] .s6-col")];
    const open = (col) =>
      cols.forEach((c) => {
        c.classList.toggle("is-open", c === col);
        c.setAttribute("aria-expanded", String(c === col));
      });
    cols.forEach((col) => {
      col.setAttribute("role", "button");
      col.addEventListener("pointerenter", (event) => event.pointerType === "mouse" && open(col));
      col.addEventListener("focus", () => open(col));
      col.addEventListener("click", () => open(col));
      col.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        open(col);
      });
    });
    open(cols.find((c) => c.classList.contains("is-open")) || cols[0]);
  })();

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
    const FILM_IN = [{ opacity: 0, transform: "scale(.96)", filter: "blur(12px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }];
    const HAZE = (y) => [{ opacity: 0, transform: `translate3d(0, ${y}px, 0)`, filter: "blur(8px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }];
    // [selector, keyframes, delay(i), duration]; i = position among revealed siblings
    const SPEC = [
      [".hero-copy > *", rise(24), (i) => 80 + i * 110, 1000],
      [".pipeline", rise(36), () => 520, 1200],
      [".sec-head .left > *", rise(28), (i) => i * 90, 900],
      [".sec-head > .lead", rise(28), () => 220, 900],
      [".film", FILM_IN, () => 200, 1400],
      [".chapters .chapter", HAZE(14), (i) => 380 + i * 60, 1000],
      [".s6", rise(36, 0, 0.985), () => 0, 1000],
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
    graph?.querySelectorAll("path[data-edge]").forEach((p) => { p.setAttribute("pathLength", "1"); p.classList.add("edge"); });
    const drawGraph = () => {
      graph.querySelectorAll("path[data-edge]").forEach((p, i) =>
        p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 350 + i * 110, easing: EASE, fill: "both" }),
      );
      [...graph.children].filter((n) => n.tagName !== "path" && !n.matches(".route, .marks")).forEach((n, i) =>
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
    // the film waits for its poster, then comes out of the haze (the 第三版 entrance)
    const filmVideo = document.querySelector(".film video");
    const posterIn = filmVideo?.poster
      ? new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = filmVideo.poster; })
      : null;
    const whenFilm = (n, go) =>
      posterIn && (n.contains(filmVideo) || n.matches(".chapters .chapter")) ? Promise.race([posterIn, new Promise((r) => setTimeout(r, 900))]).then(go) : go();
    const reveal = (n) => { if (!pending.delete(n)) return; io.unobserve(n); whenFilm(n, () => show(n)); };
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

  /* figure 05: three ways through the research assets, in turn. A route draws itself edge by edge, its nodes
     light up with step numbers, the last one gets a coral ring (yours to confirm), then packets run along it.
     The matching item in the list follows along; pointing at an item (or the figure) holds the cycle. */
  (() => {
    const fig = document.querySelector(".graph");
    const svg = fig?.querySelector("svg[data-scenes]");
    const flowsBox = document.querySelector(".flows");
    const flows = [...document.querySelectorAll(".flows .flow")];
    if (!svg || flows.length !== 3) return;
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs, parent) => {
      const n = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      parent?.append(n);
      return n;
    };
    const baseEdges = [...svg.querySelectorAll("path[data-edge]")];
    const labels = [...svg.querySelectorAll(".elabel")];
    const nodes = Object.fromEntries([...svg.querySelectorAll(".node")].map((g) => [g.dataset.node, g]));
    const geo = baseEdges.map((p) => {
      const n = p.getAttribute("d").match(/-?\d+(?:\.\d+)?/g).map(Number);
      return [[n[0], n[1]], [n[2], n[3]], [n[4], n[5]]];
    });
    const ENDS = [["company", "role"], ["company", "cand"], ["role", "cand"], ["contact", "cand"], ["paper", "cand"], ["company", "contact"]];
    const SCENES = [
      ["paper", "cand", "company", "contact"], // 找信息
      ["role", "cand", "paper"], // 找人
      ["cand", "company", "role"], // 找岗位
    ];
    const hop = (a, b) => {
      const i = ENDS.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
      const [p0, c, p1] = geo[i];
      return ENDS[i][0] === a ? { i, s: p0, c, e: p1 } : { i, s: p1, c, e: p0 };
    };
    const layer = mk("g", { class: "route", "aria-hidden": "true" });
    svg.insertBefore(layer, svg.querySelector(".elabel"));
    const marks = mk("g", { class: "marks", "aria-hidden": "true" }, svg);

    flows.forEach((flow, k) => {
      const chain = flow.querySelector(".chain");
      const names = chain.textContent.split("→").map((t) => t.trim());
      chain.textContent = "";
      names.forEach((name, j) => {
        if (j) chain.append(el("span", "arr", " → "));
        chain.append(el("span", "hop", name));
      });
      flow.append(el("span", "flow-progress"));
      flow.setAttribute("role", "button");
      flow.setAttribute("aria-pressed", "false");
      flow.tabIndex = 0;
    });

    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const DWELL = 7000;
    const STEP = 560;
    const SPEED = 230; // svg units per second
    let cur = -1;
    let elapsed = 0;
    let held = 0;
    let visible = false;
    let started = false;
    let timers = [];
    let packets = [];
    let route = null;
    let routeLen = 1;
    let routeT0 = 0;

    const light = (k, name, j, total) => {
      if (k !== cur) return;
      const g = nodes[name];
      g.classList.add("lit");
      const r = g.querySelector("rect");
      const [x, y, w, h] = ["x", "y", "width", "height"].map((a) => +r.getAttribute(a));
      if (j === total - 1) mk("rect", { class: "confirm", x: x - 6, y: y - 6, width: w + 12, height: h + 12, rx: h / 2 + 6 }, marks);
      const at = mk("g", { transform: `translate(${x + 6} ${y + 1})` }, marks);
      const badge = mk("g", { class: "badge" }, at);
      mk("circle", { r: 11 }, badge);
      mk("text", { y: 4.2, "text-anchor": "middle" }, badge).textContent = j + 1;
      flows[k].querySelectorAll(".hop")[j]?.classList.add("lit");
    };

    function show(k) {
      cur = k;
      elapsed = 0;
      timers.forEach(clearTimeout);
      timers = [];
      const names = SCENES[k];
      const hops = names.slice(1).map((name, j) => hop(names[j], name));
      const still = calm.matches || !Element.prototype.animate;
      svg.classList.add("has-scene");
      flowsBox.classList.add("has-scene");
      baseEdges.forEach((p, i) => p.classList.toggle("on", hops.some((h) => h.i === i)));
      labels.forEach((g, i) => g.classList.toggle("on", hops.some((h) => h.i === i)));
      Object.entries(nodes).forEach(([name, g]) => {
        g.classList.remove("lit");
        g.classList.toggle("on", names.includes(name));
      });
      flows.forEach((f, j) => {
        f.classList.toggle("on", j === k);
        f.setAttribute("aria-pressed", String(j === k));
        f.style.setProperty("--p", 0);
        f.querySelectorAll(".hop").forEach((h) => h.classList.remove("lit"));
      });
      layer.replaceChildren();
      layer.classList.remove("flowing");
      marks.replaceChildren();
      packets = [];
      hops.forEach((h, j) => {
        const line = mk("path", { class: "route-line", pathLength: 1, d: `M${h.s} Q${h.c} ${h.e}`.replace(/,/g, " ") }, layer);
        if (!still) line.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: STEP + 60, delay: 180 + j * STEP, easing: "cubic-bezier(.45, 0, .25, 1)", fill: "backwards" });
      });
      route = mk("path", { class: "route-path", d: `M${hops[0].s} ` + hops.map((h) => `Q${h.c} ${h.e}`).join(" ") }, layer);
      route.setAttribute("d", route.getAttribute("d").replace(/,/g, " "));
      routeLen = route.getTotalLength();
      names.forEach((name, j) => timers.push(setTimeout(() => light(k, name, j, names.length), still ? 0 : 180 + j * STEP - (j ? 40 : 0))));
      if (still) return;
      timers.push(
        setTimeout(() => {
          if (k !== cur) return;
          layer.classList.add("flowing");
          routeT0 = performance.now();
          packets = [0, 0.5].map((phase) => {
            const g = mk("g", { class: "packet" }, layer);
            mk("circle", { class: "halo", r: 11 }, g);
            mk("circle", { class: "core", r: 4.4 }, g);
            return { phase, g };
          });
        }, 180 + hops.length * STEP + 120),
      );
    }

    let last = 0;
    let looping = false;
    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (started && !held && !calm.matches) {
        elapsed += dt;
        flows[cur].style.setProperty("--p", Math.min(1, elapsed / DWELL).toFixed(4));
        if (elapsed >= DWELL) show((cur + 1) % SCENES.length);
      }
      const span = (routeLen / SPEED) * 1000;
      packets.forEach(({ phase, g }) => {
        const u = ((now - routeT0) / span + phase) % 1;
        const pt = route.getPointAtLength(u * routeLen);
        g.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        g.style.opacity = Math.max(0, Math.min(1, u / 0.06, (1 - u) / 0.06)).toFixed(3);
      });
      if (visible) requestAnimationFrame(tick);
      else looping = false;
    };
    const run = () => {
      if (looping) return;
      looping = true;
      last = performance.now();
      requestAnimationFrame(tick);
    };
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) run();
    }).observe(fig);

    // pointing at the figure or an item holds the cycle; an item also switches to its scene
    const hold = (on) => (held = Math.max(0, held + (on ? 1 : -1)));
    fig.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && hold(true));
    fig.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && hold(false));
    flows.forEach((flow, k) => {
      const pick = () => started && k !== cur && show(k);
      flow.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; hold(true); pick(); });
      flow.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && hold(false));
      flow.addEventListener("click", pick);
      flow.addEventListener("focus", () => { hold(true); pick(); });
      flow.addEventListener("blur", () => hold(false));
      flow.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        pick();
      });
    });

    // begin once the figure has drawn itself in (or straight away when nothing animates in)
    const start = () => {
      if (started) return;
      started = true;
      show(0);
      if (visible) run();
    };
    if (!document.documentElement.classList.contains("motion") || fig.classList.contains("in")) start();
    else
      new MutationObserver((_, mo) => {
        if (!fig.classList.contains("in")) return;
        mo.disconnect();
        setTimeout(start, 1900);
      }).observe(fig, { attributes: true, attributeFilter: ["class"] });
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
  /* dropdowns: the native <select> still holds the value, a listbox in the page's own style drives it */
  const dropdowns = [...form.querySelectorAll(".field select")].map((select, n) => {
    const field = select.closest(".field");
    const text = [...field.childNodes].find((c) => c.nodeType === 3 && c.textContent.trim());
    const name = el("span", "field-name", text.textContent.trim());
    name.id = `dd-name-${n}`;
    text.replaceWith(name);
    const blank = select.options[0]?.value === "" ? select.options[0].textContent : "请选择";
    const box = el("div", "dd");
    const trigger = el("button", "dd-trigger");
    const value = el("span", "dd-value");
    const chev = el("span", "dd-chev");
    const list = el("ul", "dd-list");
    trigger.type = "button";
    value.id = `dd-value-${n}`;
    list.id = `dd-list-${n}`;
    chev.setAttribute("aria-hidden", "true");
    chev.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const attrs = (node, map) => Object.entries(map).forEach(([k, v]) => node.setAttribute(k, v));
    attrs(trigger, { role: "combobox", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-controls": list.id, "aria-labelledby": `${name.id} ${value.id}` });
    attrs(list, { role: "listbox", "aria-labelledby": name.id, tabindex: "-1" });
    const opts = [...select.options].filter((o) => o.value !== "").map((o, i) => {
      const li = el("li", "dd-opt", o.textContent);
      li.id = `${list.id}-${i}`;
      li.dataset.value = o.value;
      attrs(li, { role: "option", "aria-selected": "false" });
      list.append(li);
      return li;
    });
    trigger.append(value, chev);
    box.append(trigger, list);
    select.after(box);
    select.classList.add("dd-native");
    attrs(select, { tabindex: "-1", "aria-hidden": "true" });
    select.hbTrigger = trigger;

    let active = -1;
    let typed = "";
    let typedAt = 0;
    const isOpen = () => box.classList.contains("is-open");
    const chosen = () => opts.findIndex((o) => o.dataset.value === select.value);
    const sync = () => {
      const i = chosen();
      opts.forEach((o, k) => o.setAttribute("aria-selected", String(k === i)));
      value.textContent = i < 0 ? blank : opts[i].textContent;
      value.classList.toggle("is-blank", i < 0);
    };
    const mark = (i, scroll = true) => {
      active = Math.max(0, Math.min(opts.length - 1, i));
      opts.forEach((o, k) => o.classList.toggle("is-active", k === active));
      trigger.setAttribute("aria-activedescendant", opts[active].id);
      if (!scroll) return;
      const o = opts[active];
      if (o.offsetTop < list.scrollTop) list.scrollTop = o.offsetTop - 6;
      else if (o.offsetTop + o.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = o.offsetTop + o.offsetHeight - list.clientHeight + 6;
    };
    const close = () => {
      if (!isOpen()) return;
      box.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      trigger.removeAttribute("aria-activedescendant");
      opts.forEach((o) => o.classList.remove("is-active"));
    };
    const open = (i) => {
      if (!isOpen()) {
        dropdowns.forEach((d) => d.box !== box && d.close());
        const r = trigger.getBoundingClientRect();
        const need = Math.min(list.scrollHeight, 312) + 16;
        list.classList.toggle("up", innerHeight - r.bottom < need && r.top > innerHeight - r.bottom);
        box.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
      mark(i);
    };
    const choose = (i, refocus = true) => {
      select.value = opts[i].dataset.value;
      sync();
      field.dataset.invalid = "false";
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      if (refocus) trigger.focus();
    };
    const seek = (key) => {
      const now = Date.now();
      typed = (now - typedAt > 700 ? "" : typed) + key.toLowerCase();
      typedAt = now;
      const from = typed.length > 1 ? active : active + 1;
      for (let k = 0; k < opts.length; k++) {
        const i = (Math.max(from, 0) + k) % opts.length;
        if (opts[i].textContent.toLowerCase().startsWith(typed)) return i;
      }
      return -1;
    };

    trigger.addEventListener("click", () => (isOpen() ? close() : open(Math.max(chosen(), 0))));
    trigger.addEventListener("keydown", (event) => {
      const { key } = event;
      const here = chosen();
      if (!isOpen()) {
        if (key === "ArrowDown" || key === "Enter" || key === " ") open(Math.max(here, 0));
        else if (key === "ArrowUp") open(here < 0 ? opts.length - 1 : here);
        else if (key === "Home") open(0);
        else if (key === "End") open(opts.length - 1);
        else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const i = seek(key);
          if (i >= 0) open(i);
          return;
        } else return;
        event.preventDefault();
        return;
      }
      if (key === "ArrowDown") mark(active + 1);
      else if (key === "ArrowUp") mark(active - 1);
      else if (key === "Home" || key === "PageUp") mark(0);
      else if (key === "End" || key === "PageDown") mark(opts.length - 1);
      else if (key === "Enter" || key === " ") choose(active);
      else if (key === "Escape") close();
      else if (key === "Tab") return choose(active, false);
      else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const i = seek(key);
        if (i >= 0) mark(i);
      } else return;
      event.preventDefault();
    });
    trigger.addEventListener("blur", close);
    opts.forEach((o, i) => {
      o.addEventListener("pointerdown", (event) => event.preventDefault());
      o.addEventListener("pointermove", () => active !== i && mark(i, false));
      o.addEventListener("click", () => choose(i));
    });
    // the wrapping <label> would hand clicks to the hidden select: send them to the trigger instead
    field.addEventListener("click", (event) => {
      if (trigger.contains(event.target)) return;
      event.preventDefault();
      if (!box.contains(event.target)) trigger.focus();
    });
    document.addEventListener("pointerdown", (event) => !box.contains(event.target) && close());
    sync();
    return { box, close, sync };
  });
  form.addEventListener("reset", () => setTimeout(() => dropdowns.forEach((d) => d.sync())));

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
      (first?.hbTrigger || first || (!industries.length ? toggles[0] : consent)).focus();
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
      say("请填写有效的联系电话，境外号码请包含国家区号。");
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
        say("申请已收到。开放试用后，我们会通过你留下的联系方式与你联系。提交申请不代表试用已开通。", "ok");
      } else if (result.status === "rate_limited") {
        say("提交过于频繁，请稍后再试。已填写的信息会保留在当前页面。");
      } else if (result.status === "invalid") {
        snapshot = null;
        say("申请信息未通过校验，请检查并修改后重新提交。");
      } else {
        say("申请暂未提交，请稍后重试。已填写的信息会保留在当前页面。");
      }
    } catch {
      say("暂未确认申请结果，请重试。为避免重复，重试会使用相同资料。");
    } finally {
      clearTimeout(timer);
      submit.disabled = false;
    }
  });
})();
