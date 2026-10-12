/* 第八版 · 线索画廊 — floating photographs, a film screen, collections and a wall joined by thread. */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const narrow = matchMedia("(max-width: 720px)");
  const stacked = matchMedia("(max-width: 980px)");
  const PH = (name) => `assets/photos/${name}.webp?v=2`;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const img = (name, alt = "") => {
    const i = el("img");
    i.src = PH(name);
    i.alt = alt;
    i.loading = "lazy";
    i.decoding = "async";
    return i;
  };

  /* ---------------- hero: photographs and clue cards float around the promise ---------------- */
  // x / y are percentages of the hero; w is the tile width in px; m marks the tiles kept on phones
  const HERO = [
    { p: "g-resumes", x: 9, y: 27, w: 132, rot: -4, m: 1 },
    { note: ["简历库", "林越 · 2019 年简历"], x: 22, y: 20, w: 172, rot: 2 },
    { p: "g-vision-line", x: 21, y: 66, w: 112, rot: 3, m: 1 },
    { note: ["开源", "lin-yue · 代码贡献者"], x: 9, y: 50, w: 176, rot: -3 },
    { p: "g-city", x: 7, y: 82, w: 96, rot: -2 },
    { p: "g-team-wall", x: 33, y: 90, w: 82, rot: -4 },
    { note: ["岗位 · 机器人公司", "视觉算法负责人"], x: 40, y: 17, w: 176, rot: -1 },
    { p: "g-patent", x: 67, y: 20, w: 80, rot: -3 },
    { p: "g-paper", x: 85, y: 22, w: 126, rot: 4, m: 1 },
    { p: "g-code", x: 79, y: 45, w: 92, rot: 2 },
    { p: "g-coffee", x: 93, y: 56, w: 108, rot: -3, m: 1 },
    { note: ["论文", "Lin Y. · 视觉检测方向"], x: 79, y: 76, w: 184, rot: -2 },
    { p: "g-robot-arm", x: 67, y: 90, w: 88, rot: 3, m: 1 },
  ];
  const CTA = [
    { p: "g-notebook", x: 10, y: 28, w: 110, rot: -4 },
    { p: "g-shelf", x: 17, y: 74, w: 92, rot: 3 },
    { note: ["待确认", "本人求职意向"], x: 84, y: 24, w: 168, rot: 3 },
    { p: "g-gallery", x: 90, y: 66, w: 116, rot: -3 },
  ];
  function hang(host, list) {
    const tiles = list.map((d, i) => {
      const t = el("div", `tile${d.note ? " note" : ""}${d.m ? " m" : ""}`);
      t.style.cssText = `--x:${d.x}%;--y:${d.y}%;--w:${d.w}px;--rot:${d.rot}deg`;
      const inner = el("div", "tile-in");
      if (d.note) {
        inner.append(el("small", "", d.note[0]), d.note[1]);
      } else {
        const ph = el("div", "ph");
        ph.append(img(d.p));
        inner.append(ph);
      }
      t.append(inner);
      host.append(t);
      return { t, inner, d, i, depth: 0.012 + (i % 4) * 0.008 };
    });
    return tiles;
  }
  const heroTiles = hang(document.querySelector("[data-tiles]"), HERO);
  const ctaTiles = hang(document.querySelector('[data-tiles="cta"]'), CTA);

  // parallax: tiles lean with the pointer and drift apart as the hero scrolls away
  const hero = document.querySelector(".hero");
  let mx = 0, my = 0, raf = 0;
  const drift = () => {
    raf = 0;
    if (reduced.matches || narrow.matches) {
      heroTiles.forEach(({ t }) => { t.style.removeProperty("--px"); t.style.removeProperty("--py"); });
      return;
    }
    const s = Math.min(1, Math.max(0, scrollY / Math.max(1, hero.offsetHeight)));
    heroTiles.forEach(({ t, d, depth }) => {
      const ox = (d.x - 50) / 50, oy = (d.y - 50) / 50;
      t.style.setProperty("--px", `${(mx * depth * 900 + ox * s * 140).toFixed(1)}px`);
      t.style.setProperty("--py", `${(my * depth * 700 + oy * s * 90 - s * 40).toFixed(1)}px`);
    });
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(drift); }, { passive: true });
  hero.addEventListener("pointermove", (e) => {
    if (!fine.matches) return;
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
    if (!raf) raf = requestAnimationFrame(drift);
  });

  /* ---------------- nav: the current room is marked ---------------- */
  const links = [...document.querySelectorAll(".links a")];
  const navIo = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.isIntersecting && links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${en.target.id}`))),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  links.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s) navIo.observe(s); });

  /* ---------------- the film: a screen with a cover, and chapters ---------------- */
  const CHAPTERS = [
    [0, "空墙"],
    [8, "线索满墙"],
    [16, "重新挂一遍"],
    [24, "同一个画框"],
    [32, "展签"],
    [40, "留给你的画框"],
    [48, "展厅"],
  ];
  const screen = document.querySelector("[data-screen]");
  const video = screen.querySelector("video");
  const cover = screen.querySelector("[data-cover]");
  cover.querySelectorAll(".dots i").forEach((d, k) => d.style.setProperty("--k", k));
  const start = (t) => {
    screen.classList.add("playing");
    video.controls = true;
    if (t != null) {
      try {
        video.currentTime = t;
      } catch {
        /* metadata not loaded yet: playback starts from the top */
      }
    }
    video.play()?.catch?.(() => {});
  };
  cover.addEventListener("click", () => start());
  document.querySelectorAll("[data-play-film]").forEach((a) =>
    a.addEventListener("click", () => setTimeout(() => start(), reduced.matches ? 0 : 650)),
  );
  const chapterHost = document.querySelector("[data-chapters]");
  const chapterButtons = CHAPTERS.map(([t, name]) => {
    const li = el("li");
    const b = el("button", "chip-btn");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.append(name, el("small", "", `0:${String(t).padStart(2, "0")}`));
    b.addEventListener("click", () => start(t));
    li.append(b);
    chapterHost.append(li);
    return b;
  });
  video.addEventListener("timeupdate", () => {
    let index = -1;
    CHAPTERS.forEach(([t], i) => { if (video.currentTime >= t) index = i; });
    chapterButtons.forEach((b, i) => b.setAttribute("aria-pressed", String(i === index && screen.classList.contains("playing"))));
  });
  new IntersectionObserver(([en]) => !en.isIntersecting && !video.paused && video.pause(), { threshold: 0 }).observe(video);

  /* ---------------- how it works: image-first cards, each with a small working overlay ---------------- */
  const FEATURES = [
    {
      p: "g-resumes",
      title: "岗位条件 · 视觉算法负责人",
      opts: [
        ["必须", "工业视觉、团队管理。"],
        ["加分", "量产落地、论文或专利。"],
        ["未知", "薪酬范围、到岗时间——客户没说的，不去猜。"],
      ],
      label: "先吃透岗位",
      desc: "拆出必须、加分与未知条件；需要你确认的问题，单独列出。",
    },
    {
      p: "g-team-wall",
      title: "身份核对 · 3 个来源",
      opts: [
        ["简历", "林越 · 2019 年简历。"],
        ["论文", "Lin Y. · 视觉检测方向的论文作者。"],
        ["开源", "lin-yue · 开源项目的代码贡献者。"],
      ],
      foot: "核对之后，合并为同一人：林越。",
      label: "认出同一个人",
      desc: "已有候选人、知识图谱、公开网络、论文与专利、开源项目、上传简历六路召回，核对后合并成一份档案。",
    },
    {
      p: "g-paper",
      title: "林越 · 对照岗位",
      opts: [
        ["有依据", "产线视觉与算法团队经历。来源：简历、团队页。"],
        ["待了解", "实际管理范围。暂无可靠来源。"],
        ["待确认", "本人求职意向。需要本人沟通。"],
      ],
      label: "理由，连同来源",
      desc: "每条匹配理由都对应资料来源；没有可靠依据的，标为待确认，不把推测当事实。",
    },
  ];
  const cardsHost = document.querySelector("[data-cards]");
  FEATURES.forEach((f) => {
    const card = el("article", "feature");
    const pic = el("figure", "pic dev");
    pic.append(img(f.p));
    const ov = el("div", "overlay");
    const body = el("p", "", f.opts[0][1]);
    body.setAttribute("aria-live", "polite");
    const opts = el("div", "opts");
    const buttons = f.opts.map(([label, text], i) => {
      const b = el("button", "opt", label);
      b.type = "button";
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", () => {
        buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        body.textContent = text;
      });
      opts.append(b);
      return b;
    });
    ov.append(el("b", "", f.title), body, opts);
    if (f.foot) {
      const ft = el("p", "", f.foot);
      ft.style.cssText = "min-height:0;margin:10px 0 0;font-size:13px";
      ov.append(ft);
    }
    pic.append(ov);
    card.append(pic, el("h3", "", f.label), el("p", "", f.desc));
    cardsHost.append(card);
  });

  /* ---------------- tabs helper: click or arrow keys ---------------- */
  function tabs(buttons, render) {
    const select = (i, focus) => {
      buttons.forEach((b, j) => {
        b.setAttribute("aria-selected", String(i === j));
        b.tabIndex = i === j ? 0 : -1;
      });
      if (focus) buttons[i].focus();
      render(i, buttons[i].id);
    };
    buttons.forEach((b, i) => {
      b.setAttribute("role", "tab");
      b.addEventListener("click", () => select(i));
      b.addEventListener("keydown", (e) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (step) {
          e.preventDefault();
          select((i + step + buttons.length) % buttons.length, true);
        } else if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          select(e.key === "Home" ? 0 : buttons.length - 1, true);
        }
      });
    });
    return select;
  }

  /* ---------------- scenarios: four collections ---------------- */
  const WORKS = [
    {
      label: "岗位找人",
      cover: ["g-resumes", "g-vision-line", "g-paper"],
      headline: "给出岗位要求，找到人，也看清为什么。",
      description: "从岗位与客户要求出发，围绕目标公司，在已有候选人、公开履历、论文与专利中跨渠道找人。",
      detail: "核对身份、合并重复资料，对照岗位留下匹配理由、来源与待确认条件。谁值得联系，由你判断。",
      context: "机器人公司 · 视觉算法负责人",
      subject: "值得进一步了解的人选与匹配依据",
      rows: [
        { t: "林越", k: "工业视觉 · 团队负责人", c: "推荐依据：产线视觉与算法团队经历。", f: "实际管理范围" },
        { t: "周宁", k: "机器人感知 · 技术骨干", c: "推荐依据：相关论文与项目经历。", f: "量产落地经验" },
        { t: "陈思", k: "视觉算法 · 项目负责人", c: "推荐依据：跨团队交付经历。", f: "近期职责与求职意向" },
      ],
      questions: ["岗位中哪些条件不可妥协？", "人选当前任职与项目职责是否准确？", "本人求职意向及联系许可是否已确认？"],
    },
    {
      label: "客户开发",
      cover: ["g-city", "g-robot-arm", "g-coffee"],
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
      questions: ["招聘需求是否仍然有效？", "哪位负责人适合进一步沟通？", "现有联系路径是否已获授权？"],
    },
    {
      label: "人才梳理",
      cover: ["g-team-wall", "g-patent", "g-code"],
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
      questions: ["团队名称与职责是否仍然有效？", "线索人物能否与已有候选人核验为同一人？", "哪些岗位与汇报关系尚没有可靠依据？"],
    },
    {
      label: "候选人机会",
      cover: ["g-notebook", "g-gallery", "g-shelf"],
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
      questions: ["本人下一步最在意的条件是什么？", "机会的职责与要求是否已核实？", "对外推荐的内容和范围是否得到同意？"],
    },
  ];
  const colHost = document.querySelector("[data-collections]");
  const colButtons = WORKS.map((w, i) => {
    const b = el("button", "collection");
    b.type = "button";
    b.id = `collection-${i}`;
    const mosaic = el("span", "mosaic dev");
    w.cover.forEach((p) => { const s = el("span"); s.append(img(p)); mosaic.append(s); });
    const lbl = el("span", "lbl");
    lbl.append(w.label, el("small", "", w.context));
    b.append(mosaic, lbl);
    colHost.append(b);
    return b;
  });
  const colPanel = document.querySelector("[data-collection-panel]");
  let firstCol = true;
  tabs(colButtons, (i, id) => {
    const w = WORKS[i];
    colPanel.setAttribute("aria-labelledby", id);
    const copy = el("div", "detail-copy");
    const h = el("h3", "h-md");
    h.append(...w.headline.split(/(?<=，)/).map((part) => el("span", "nb", part)));
    copy.append(el("p", "eyebrow", `${w.label} · ${w.context}`), h, el("p", "", w.description), el("p", "more", w.detail));
    copy.firstChild.style.cssText = "color:var(--ink);font-size:13px";
    const right = el("div");
    const head = el("p", "", w.subject);
    head.style.cssText = "margin:0 0 12px;font-weight:500";
    const rows = el("ul", "rows");
    w.rows.forEach((r) => {
      const li = el("li");
      const t = el("div", "t");
      t.append(r.t, el("small", "", r.k));
      li.append(t, el("p", "", r.c));
      if (r.f) {
        const g = el("p", "gap");
        g.append(el("span", "ask", "?"), `仍需了解：${r.f}`);
        li.append(g);
      }
      rows.append(li);
    });
    const asks = el("div", "asks");
    const ul = el("ul");
    w.questions.forEach((q) => { const li = el("li"); li.append(el("span", "ask", "?"), q); ul.append(li); });
    asks.append(el("b", "", "需要你来确认"), ul);
    right.append(head, rows, asks);
    colPanel.replaceChildren(copy, right);
    if (!firstCol && !reduced.matches) [copy, right].forEach((n, k) => { n.classList.add("swap"); n.style.animationDelay = `${k * 80}ms`; });
    firstCol = false;
  })(0);

  /* ---------------- 研究资产: a salon hang, joined by thread per task ---------------- */
  const ASSETS = {
    company: { label: "公司", detail: "产业、组织与变化", p: "g-city", x: 3, y: 4, w: 27, rot: -2 },
    job: { label: "岗位", detail: "要求与招聘需求", p: "g-resumes", x: 64, y: 0, w: 25, rot: 2 },
    candidate: { label: "候选人", detail: "经历、能力与意向", p: "g-coffee", x: 35, y: 30, w: 28, rot: -1 },
    contact: { label: "联系人", detail: "角色与联系路径", p: "g-team-wall", x: 4, y: 52, w: 25, rot: 3 },
    research: { label: "论文与专利", detail: "专业方向与成果", p: "g-patent", x: 69, y: 49, w: 26, rot: -3 },
  };
  const EDGES = {
    demand: { from: "company", to: "job", label: "招聘需求", note: "有效性待核实" },
    role: { from: "company", to: "contact", label: "任职与职责", note: "当前角色待核实" },
    experience: { from: "company", to: "candidate", label: "职业经历", note: "任职信息待核实" },
    fit: { from: "job", to: "candidate", label: "匹配依据", note: "条件与意向待核实", pending: true },
    connection: { from: "contact", to: "candidate", label: "联系路径", note: "关系与许可需确认", pending: true },
    authorship: { from: "research", to: "candidate", label: "作者 / 发明人", note: "同名身份需核验" },
  };
  const PATHS = [
    {
      label: "找信息",
      nodes: ["research", "candidate", "company", "contact"],
      edges: ["authorship", "experience", "role"],
      title: "一项技术成果，连起人物与组织的线索。",
      copy: "从论文与专利发现专业人物，再沿职业经历研究公司与相关角色。零散资料因此有了上下文，也有了可以追溯的来由。",
      check: "作者身份、真实任职与联系人职责分别核验，不能把共同作者当作汇报关系。",
    },
    {
      label: "找人",
      nodes: ["job", "candidate", "research"],
      edges: ["fit", "authorship"],
      title: "一个岗位，找到有依据、可审阅的人选。",
      copy: "岗位要求连接候选人的经历与能力，论文与专利补充专业线索。推荐不只留下姓名，也保留为什么值得继续了解的依据。",
      check: "技术成果不等于量产或管理经验；匹配条件与本人意向仍需确认。",
    },
    {
      label: "找岗位",
      nodes: ["candidate", "company", "job"],
      edges: ["experience", "demand"],
      title: "一段职业经历，延伸到值得讨论的新机会。",
      copy: "从候选人的经历与明确意向出发，研究相关公司与岗位需求。已有资产相互参照，让下一次机会研究不必重新开始。",
      check: "公开岗位只是机会线索；需求有效性、本人意向与推荐许可需逐项确认。",
    },
  ];
  const wall = document.querySelector("[data-wall]");
  const NS = "http://www.w3.org/2000/svg";
  const threads = document.createElementNS(NS, "svg");
  threads.classList.add("threads");
  wall.append(threads);
  const frames = {};
  Object.entries(ASSETS).forEach(([id, a]) => {
    const f = el("figure", "frame dev");
    f.style.cssText = `--x:${a.x}%;--y:${a.y}%;--w:${a.w}%;--rot:${a.rot}deg;--ar:1 / 1`;
    const ph = el("div", "ph");
    ph.append(img(a.p));
    const cap = el("figcaption");
    cap.append(a.label, el("small", "", a.detail));
    const no = el("span", "stopno");
    f.append(ph, cap, no);
    wall.append(f);
    frames[id] = { f, no };
  });
  let current = 0, threadAnims = [];
  // each thread hangs from one pin to the next with a little slack
  function drawThreads(animate) {
    threadAnims.forEach((a) => a.cancel());
    threadAnims = [];
    threads.replaceChildren();
    if (stacked.matches) return;
    const box = wall.getBoundingClientRect();
    const pin = (id) => {
      const r = frames[id].f.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top - box.top - 1 };
    };
    const p = PATHS[current];
    p.nodes.slice(1).forEach((to, k) => {
      const a = pin(p.nodes[k]), b = pin(to);
      const sag = 60 + Math.abs(a.x - b.x) * 0.12;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", `M${a.x} ${a.y}Q${(a.x + b.x) / 2} ${Math.max(a.y, b.y) + sag} ${b.x} ${b.y}`);
      if (EDGES[p.edges[k]].pending) path.classList.add("pending");
      threads.append(path);
      if (animate && !reduced.matches && path.animate) {
        const len = path.getTotalLength();
        if (!path.classList.contains("pending")) {
          path.style.strokeDasharray = `${len}`;
          threadAnims.push(path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 700, delay: 150 + k * 450, easing: "cubic-bezier(.2,.75,.2,1)", fill: "backwards" }));
        } else threadAnims.push(path.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 150 + k * 450, fill: "backwards" }));
      }
    });
  }
  const taskPanel = document.querySelector("[data-task-panel]");
  const taskButtons = PATHS.map((p, i) => {
    const b = el("button", "chip-btn", p.label);
    b.type = "button";
    b.id = `task-${i}`;
    document.querySelector("[data-tasks]").append(b);
    return b;
  });
  let wallSeen = false;
  const showTask = (i, id) => {
    current = i;
    const p = PATHS[i];
    taskPanel.setAttribute("aria-labelledby", id);
    wall.classList.add("has-path");
    Object.entries(frames).forEach(([nid, { f, no }]) => {
      const k = p.nodes.indexOf(nid);
      f.classList.toggle("on", k >= 0);
      no.textContent = k >= 0 ? String(k + 1) : "";
    });
    const chain = el("ol", "chain");
    p.nodes.forEach((nid, k) => { const li = el("li"); li.append(el("i", "", String(k + 1)), ASSETS[nid].label); chain.append(li); });
    const h = el("h3");
    h.append(...p.title.split(/(?<=，)/).map((part) => el("span", "nb", part)));
    const rels = el("ul", "rels");
    p.edges.forEach((eid) => {
      const e = EDGES[eid];
      const li = el("li");
      const left = el("div");
      left.append(`${ASSETS[e.from].label} `, el("span", "", `${e.label} →`), ` ${ASSETS[e.to].label}`);
      li.append(left, el("em", "", e.note));
      rels.append(li);
    });
    const check = el("p", "check-note");
    check.append(el("b", "", "仍需核验 · "), p.check);
    taskPanel.replaceChildren(chain, h, el("p", "", p.copy), rels, check);
    if (wallSeen && !reduced.matches) taskPanel.childNodes.forEach((n, k) => { n.classList.add("swap"); n.style.animationDelay = `${k * 60}ms`; });
    drawThreads(wallSeen);
  };
  tabs(taskButtons, showTask)(0);
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => drawThreads(false), 120); });
  stacked.addEventListener?.("change", () => drawThreads(false));
  // pins move while frames reveal; redraw once the wall has settled
  document.fonts?.ready?.then(() => drawThreads(false));
  addEventListener("load", () => drawThreads(false));

  /* ---------------- reveals ---------------- */
  window.__hbReveal = true;
  const motion = document.documentElement.classList.contains("motion");
  const REVEAL = [
    ".room-head > *", ".screen", ".chapters", ".feature", ".stop .wrap > :not(.stop-photo)", ".stop-photo", ".collection", ".detail",
    ".tasks", ".frame", ".wall-copy", ".cta .wrap > *", ".about > *", ".form", ".foot > div", ".foot-meta",
  ].join(",");
  const nodes = [...document.querySelectorAll(REVEAL)];
  const order = new Map();
  nodes.forEach((n) => {
    n.classList.add("rv");
    const i = order.get(n.parentElement) || 0;
    n.style.setProperty("--d", i);
    order.set(n.parentElement, i + 1);
  });
  document.querySelectorAll(".stop-photo").forEach((n) => n.classList.add("devself"));
  const devs = [...document.querySelectorAll(".dev")];
  const show = (n) => {
    n.classList.add("in");
    if (n.matches(".feature, .collection")) n.querySelector(".dev")?.classList.add("in");
    if (n === wall) {
      wallSeen = true;
      setTimeout(() => drawThreads(true), motion ? 900 : 0);
    }
  };
  const watch = [...nodes, wall, ...devs.filter((d) => d.matches(".frame"))];
  if (!motion) {
    watch.forEach(show);
    devs.forEach((d) => d.classList.add("in"));
    return;
  }
  const pending = new Set();
  const reveal = (n) => {
    if (!pending.delete(n)) return;
    io.unobserve(n);
    show(n);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && reveal(en.target)), { rootMargin: "0px 0px -8% 0px" });
  addEventListener(
    "scroll",
    () => {
      if (pending.size && innerHeight + scrollY >= document.documentElement.scrollHeight - 4)
        [...pending].filter((n) => n.getBoundingClientRect().top < innerHeight).forEach(reveal);
    },
    { passive: true },
  );
  watch.forEach((n) => {
    if (n.getBoundingClientRect().bottom < 0) show(n);
    else {
      pending.add(n);
      io.observe(n);
    }
  });

  // the hero arrives: words first, then the photographs settle onto the wall one by one
  const heroParts = [...document.querySelectorAll(".hero-copy > *"), ...document.querySelectorAll(".hero .display .line")];
  heroParts.forEach((n, i) => {
    n.classList.add("rv");
    n.style.setProperty("--d", n.matches(".line") ? 1 + [...n.parentElement.children].indexOf(n) : [...n.parentElement.children].indexOf(n));
  });
  const settle = (list, delay) =>
    list.forEach(({ inner }, i) =>
      inner.animate(
        [{ opacity: 0, transform: "translateY(26px) scale(.92)", filter: "grayscale(1) brightness(1.2)" }, { opacity: 1, transform: "none", filter: "none" }],
        { duration: 1100, delay: delay + i * 85, easing: "cubic-bezier(.2,.75,.2,1)", fill: "backwards" },
      ),
    );
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      heroParts.forEach((n) => n.classList.add("in"));
      settle(heroTiles, 350);
    }),
  );
  const ctaHost = document.querySelector('[data-tiles="cta"]');
  const ctaIo = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    ctaIo.disconnect();
    settle(ctaTiles, 100);
  }, { rootMargin: "0px 0px -15% 0px" });
  ctaIo.observe(ctaHost.parentElement);
})();

/* ---------------- trial application (stays a static preview while trial-api is disabled) ---------------- */
(() => {
  const form = document.querySelector("[data-trial-form]");
  if (!form) return;
  const toggles = [...form.querySelectorAll("[data-industries] .toggle")];
  toggles.forEach((toggle) =>
    toggle.addEventListener("click", () => toggle.setAttribute("aria-pressed", String(toggle.getAttribute("aria-pressed") !== "true"))),
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
