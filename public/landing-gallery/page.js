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
    { note: ["岗位 · 星川机器人", "视觉算法负责人"], x: 40, y: 17, w: 176, rot: -1 },
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
    { note: ["待确认", "本人想不想动"], x: 84, y: 24, w: 168, rot: 3 },
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
    [10, "发现新岗位"],
    [36.5, "摸清团队"],
    [61, "为岗位找人"],
    [89.5, "为人选找机会"],
    [112, "人和关系都存下来了"],
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
    b.append(name, el("small", "", `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`));
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
      title: "岗位要求 · 视觉算法负责人",
      opts: [
        ["必须", "工业视觉、带过团队。"],
        ["加分", "做过量产、有论文或专利。"],
        ["未知", "薪资范围、到岗时间。客户没说的，不去猜。"],
      ],
      label: "弄清要什么",
      desc: "理清要什么、已经知道什么、还缺什么。要你确认的问题，单独列出来。",
    },
    {
      p: "g-team-wall",
      title: "是不是同一个人 · 3 处资料",
      opts: [
        ["简历", "林越 · 2019 年简历。"],
        ["论文", "Lin Y. · 视觉检测方向的论文作者。"],
        ["开源", "lin-yue · 开源社区的代码贡献者。"],
      ],
      foot: "核对之后，合并成同一个人：林越。",
      label: "认出同一个人",
      desc: "先翻你的候选人、人才地图和人脉，再去公开网络、论文专利和开源社区补齐，核对后合并成一份。",
    },
    {
      p: "g-paper",
      title: "林越 · 对照岗位",
      opts: [
        ["有来源", "产线视觉和算法团队经历。来源：简历、团队页。"],
        ["待了解", "实际带多大团队。暂时没有可靠来源。"],
        ["待确认", "本人想不想动。要本人聊过才知道。"],
      ],
      label: "理由，连同来源",
      desc: "每条匹配理由都写着从哪来。没有可靠来源的标“待确认”，不把猜测当成事实。",
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

  /* tabs that step through by themselves: a thin line under the open tab fills as its turn runs out. A click jumps
     straight to that tab and the rotation carries on from there. Pointing the mouse at the panel holds it while
     you read. Reduced motion stays manual. */
  function rotateTabs(host, panelEl, select, now, count) {
    const DWELL = 9000;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    let elapsed = 0, last = 0, visible = false, looping = false, reading = false;
    const setP = () => [...host.querySelectorAll('[role="tab"]')].forEach((b, i) => b.style.setProperty("--p", i === now() ? Math.min(1, elapsed / DWELL).toFixed(4) : 0));
    const tick = (t) => {
      const dt = Math.min(t - last, 100);
      last = t;
      if (!still.matches && !reading && !document.hidden) {
        elapsed += dt;
        if (elapsed >= DWELL) {
          elapsed = 0;
          select((now() + 1) % count);
        }
        setP();
      }
      if (visible) requestAnimationFrame(tick);
      else looping = false;
    };
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (!visible || looping) return;
      looping = true;
      last = performance.now();
      requestAnimationFrame(tick);
    }, { threshold: 0.2 }).observe(panelEl);
    const restart = () => { elapsed = 0; setP(); };
    host.addEventListener("click", restart);
    host.addEventListener("keydown", restart);
    panelEl.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") reading = true; });
    panelEl.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") reading = false; });
  }

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
      "label": "发现新岗位",
      "cover": [
        "g-city",
        "g-robot-arm",
        "g-coffee"
      ],
      "headline": "一条融资新闻，可能就是下一个岗位。",
      "description": "周一早上，HunterBuddy 提醒你：星川机器人刚拿到 B 轮融资，可能要扩招。它先去找有没有具体岗位：官网招聘页上多了视觉算法负责人。找到岗位，再找对口的联系人：负责视觉团队的技术负责人许晴。她的直接联系方式没找到，才去翻你的人脉：你的老客户张远是星川的投资人，能帮你引荐。",
      "detail": "一个确认过的岗位、一位对口联系人，加一条备用的引荐路线。直接联系还是请人引荐、怎么开口，你说了算。拿到 JD，它就是一个正式岗位。",
      "context": "每周一 09:00 · 帮你盯着的赛道",
      "subject": "星川机器人 · 可能有新岗位",
      "rows": [
        {
          "t": "官网招聘页新增视觉算法负责人",
          "k": "找到岗位 · 两处来源",
          "c": "招聘页和融资新闻都能对上。"
        },
        {
          "t": "许晴 · 技术负责人",
          "k": "对口联系人",
          "c": "公开资料能确认她负责视觉团队。",
          "f": "直接联系方式"
        },
        {
          "t": "张远 → 许晴",
          "k": "备用 · 引荐路线",
          "c": "直接联系不上时，你的老客户张远（星川的投资人）能帮你引荐。"
        }
      ],
      "questions": [
        "他们真的在招这个岗位吗？",
        "直接联系许晴，还是请张远引荐？",
        "合作方式和优先级怎么谈？"
      ]
    },
    {
      "label": "摸清团队",
      "cover": [
        "g-team-wall",
        "g-patent",
        "g-code"
      ],
      "headline": "想摸清一个团队，资料却东一块西一块。",
      "description": "星川要招人，你得先知道这类人都在哪。星川和两家对标公司的团队信息，散在官网、新闻、论文和你的简历库里。它按公司、团队、关键岗位、在职的人一层层排好，把官网上的任职信息、你库里的候选人、论文和专利里的名字对上号。一起写过论文的人，不会被当成上下级。",
      "detail": "一张人才地图：谁在什么位置，消息从哪来，哪里还是空白。你手上的 Excel 人才地图也能导进来接着补。",
      "context": "目标公司 · 人才地图",
      "subject": "星川和两家对标公司",
      "rows": [
        {
          "t": "拓界机器人 · 视觉团队",
          "k": "负责人已确认",
          "c": "官网任职和团队页都能对上，就是你库里的林越。"
        },
        {
          "t": "穹顶智能 · 控制团队",
          "k": "在职的人待确认",
          "c": "从论文作者里找到线索，身份和现在的职位还要核对。"
        },
        {
          "t": "星川机器人 · 产品交付",
          "k": "空白",
          "c": "知道有这个关键岗位，还不知道是谁，不等于这个位置空着。"
        }
      ],
      "questions": [
        "团队名字和分工还对吗？",
        "这些名字和你库里的候选人是同一个人吗？",
        "哪些空白值得下次去补？"
      ]
    },
    {
      "label": "为岗位找人",
      "cover": [
        "g-resumes",
        "g-vision-line",
        "g-paper"
      ],
      "headline": "JD 到手，先看你手上已经有谁。",
      "description": "张远引荐之后，许晴发来视觉算法负责人的 JD，只有几行字。合适的人很少，线索也很散。它不从零开始：先看人才地图里的目标团队、这类人通常从哪些公司出来、你库里谁最接近，再去网上、论文专利和开源社区补齐。简历里的林越、论文里的 Lin Y. 和开源社区的 lin-yue，核对后发现是同一个人。",
      "detail": "几位值得聊聊的人选。为什么合适、消息从哪来、哪里还不清楚，都写在旁边。先联系谁，你来判断。",
      "context": "星川机器人 · 视觉算法负责人",
      "subject": "值得聊聊的人选",
      "rows": [
        {
          "t": "林越",
          "k": "工业视觉 · 团队负责人",
          "c": "做过产线视觉和算法团队，三个地方的资料已合并。",
          "f": "实际带多大团队"
        },
        {
          "t": "周宁",
          "k": "机器人感知 · 技术骨干",
          "c": "有相关论文和项目经历。",
          "f": "有没有做过量产"
        },
        {
          "t": "陈思",
          "k": "视觉算法 · 项目负责人",
          "c": "带过跨团队的项目。",
          "f": "最近在做什么、想不想动"
        }
      ],
      "questions": [
        "JD 里哪些条件不能让步？",
        "人选现在的职位和负责的项目准确吗？",
        "本人想不想动、能不能联系，问过了吗？"
      ]
    },
    {
      "label": "为人选找机会",
      "cover": [
        "g-notebook",
        "g-gallery",
        "g-shelf"
      ],
      "headline": "半年后，林越的团队变了。",
      "description": "上次林越没动。你让 HunterBuddy 每两周看一次重点候选人，这次它发现：拓界机器人的视觉团队并进了新成立的平台部，而林越在现在的岗位上已经做了四年。它不替你下结论，先问你要不要核实。你点头后，它整理林越的最新情况，对照你手上所有在招的岗位和熟悉的公司，看哪些值得聊。",
      "detail": "几个有理有据的机会。打不打这通电话、推不推荐，你说了算。聊完把新简历发给它，资料和匹配都会更新。",
      "context": "重点候选人 · 林越",
      "subject": "林越 · 可以聊的下一站",
      "rows": [
        {
          "t": "穹顶智能 · 视觉平台负责人",
          "k": "你在招的岗位",
          "c": "技术方向和带团队经历都对得上。",
          "f": "地点和薪资"
        },
        {
          "t": "星川机器人 · 新产线视觉团队",
          "k": "人脉里的新机会",
          "c": "星川扩张后的新方向，和林越的产线经历相关。",
          "f": "需求是不是真的"
        },
        {
          "t": "本人意向",
          "k": "只是迹象",
          "c": "团队调整不等于想走，愿不愿意看机会，要你去问。"
        }
      ],
      "questions": [
        "他这次最在意什么？",
        "这些机会的职责和要求核实过吗？",
        "推荐出去的内容，他同意了吗？"
      ]
    }
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
  let colNow = 0;
  const selectCol = tabs(colButtons, (i, id) => {
    colNow = i;
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
        g.append(el("span", "ask", "?"), `待确认：${r.f}`);
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
  });
  selectCol(0);
  rotateTabs(colHost, colPanel, selectCol, () => colNow, WORKS.length);

  /* ---------------- 研究资产: a salon hang, joined by thread per task ---------------- */
  const ASSETS = {
    company: { label: "公司", detail: "行业、团队和变化", p: "g-city", x: 3, y: 4, w: 27, rot: -2 },
    job: { label: "岗位", detail: "要求和在招的需求", p: "g-resumes", x: 64, y: 0, w: 25, rot: 2 },
    candidate: { label: "候选人", detail: "经历、能力和意向", p: "g-coffee", x: 35, y: 30, w: 28, rot: -1 },
    contact: { label: "联系人", detail: "负责什么、怎么联系上", p: "g-team-wall", x: 4, y: 52, w: 25, rot: 3 },
    research: { label: "论文与专利", detail: "研究方向和成果", p: "g-patent", x: 69, y: 49, w: 26, rot: -3 },
  };
  const EDGES = {
    demand: { from: "company", to: "job", label: "在招", note: "还在不在招，待确认" },
    role: { from: "company", to: "contact", label: "在职", note: "现在负责什么，待确认" },
    experience: { from: "company", to: "candidate", label: "待过", note: "任职时间，待核对" },
    fit: { from: "job", to: "candidate", label: "匹配理由", note: "条件和意向，待确认", pending: true },
    connection: { from: "contact", to: "candidate", label: "认识", note: "能不能引荐，待确认", pending: true },
    authorship: { from: "research", to: "candidate", label: "作者 / 发明人", note: "同名的人，要核对" },
    owner: { from: "job", to: "contact", label: "对口联系人", note: "直接联系方式，待确认" },
  };
  const PATHS = [
    {
      label: "发现新岗位",
      nodes: ["company", "job", "contact"],
      edges: ["demand", "owner"],
      title: "一家公司在扩张，先找岗位，再找对口的人。",
      copy: "一家公司在扩张：先找到具体岗位，再找对口的联系人。联系不上，再请熟人引荐。",
      check: "招聘页上的岗位不等于客户已经委托。还在不在招、谁说了算，要你去确认。",
    },
    {
      label: "摸清团队",
      nodes: ["company", "candidate", "research"],
      edges: ["experience", "authorship"],
      title: "一家公司，按团队一层层排好。",
      copy: "想摸清一家公司：按团队和关键岗位排好，把在职的人和你库里的候选人对上号。",
      check: "一起写过论文的人，不会被当成上下级。团队名字和分工，还要你确认。",
    },
    {
      label: "为岗位找人",
      nodes: ["job", "candidate", "research"],
      edges: ["fit", "authorship"],
      title: "一个新岗位，先从目标团队里找人。",
      copy: "新岗位来了：先从人才地图里的目标团队找人，再用论文和专利确认专长对得上。",
      check: "论文写得好，不等于做过量产或带过团队。本人想不想动，要你去问。",
    },
    {
      label: "为人选找机会",
      nodes: ["candidate", "company", "job"],
      edges: ["experience", "demand"],
      title: "候选人想动了，对照你在招的岗位。",
      copy: "候选人想动了：顺着他的经历和熟悉的公司，对照你手上在招的岗位。",
      check: "招聘页上的岗位只是线索。需求是不是真的、本人愿不愿意、能不能推荐，要一项项确认。",
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
    check.append(el("b", "", "还要确认 · "), p.check);
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
  // the film waits for its poster, then comes out of the haze (the 第三版 entrance)
  const filmVideo = document.querySelector("[data-film]");
  const posterIn = filmVideo?.poster
    ? new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = filmVideo.poster; })
    : null;
  const whenFilm = (n, go) =>
    posterIn && (n.contains(filmVideo) || n.matches(".chapters")) ? Promise.race([posterIn, new Promise((r) => setTimeout(r, 900))]).then(go) : go();
  const reveal = (n) => {
    if (!pending.delete(n)) return;
    io.unobserve(n);
    whenFilm(n, () => show(n));
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
        say("申请已收到。我们会逐一审核，并在开通时通过你留下的联系方式与你联系。", "ok");
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
