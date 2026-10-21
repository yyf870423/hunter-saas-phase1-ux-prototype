/* 第七版 · 研究手记 — drawings, interactions and reveals. Every illustration is drawn here as ink line
   work (people inside browser windows, doodles around them) and inks itself in line by line on reveal. */
(() => {
  const INK = "#231e21";
  const SAGE = "#65b8a2";
  const ROSE = "#d6aec1";
  const FOAM = "#cae1e2";
  const NAVY = "#16325a";
  const TEAL = "#1c5d5f";
  const BLUSH = "#f2e8e2";
  const PAPER = "#fbfdfc";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  const at = (o) =>
    Object.entries(o)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
  // an inked line: drawn on reveal, its fill arrives after the outline
  const L = (tag, o) =>
    `<${tag} class="ln" pathLength="1" ${at({ stroke: INK, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none", ...o })}/>`;
  // a doodle that pops in
  const F = (tag, o, cls = "") => `<${tag} class="fade ${cls}" ${at(o)}/>`;
  let uid = 0;

  /* ---------------- the drawing kit ---------------- */
  function win(x, y, w, h, o = {}) {
    const bar = o.bar || 26;
    return (
      L("rect", { x, y, width: w, height: h, rx: 12, fill: o.fill || "#fff" }) +
      L("path", { d: `M${x} ${y + bar}H${x + w}` }) +
      [ROSE, FOAM, SAGE].map((c, i) => L("circle", { cx: x + 16 + i * 13, cy: y + bar / 2, r: 3.6, fill: c, "stroke-width": 1.6 })).join("")
    );
  }
  // a bust drawn around a head at (0,0), radius 32: hair is a solid inked shape, faces are dots and a curve
  function person(cx, cy, s, o = {}) {
    const hair = {
      bob: "M-34 6C-39-30-19-40 0-40C23-40 41-28 35 8C31-4 27-14 17-20C5-12-15-10-27-14C-31-8-32 0-34 6Z",
      side: "M-32-4C-35-32-17-42 3-40C23-39 35-26 32-4C27-16 17-22 5-20C-7-18-21-20-32-4Z",
      bun: "M-32 0C-36-30-16-40 2-40C22-39 36-26 32 2C28-12 18-20 4-20C-10-20-24-14-32 0ZM-8-44C-10-56 10-58 10-46C8-41-4-40-8-44Z",
    }[o.hair || "side"];
    return `<g transform="translate(${cx} ${cy}) scale(${s})">${
      L("path", { d: "M-76 112C-72 70-44 48 0 48C44 48 72 70 76 112Z", fill: o.shirt || SAGE }) +
      L("path", { d: "M-13 24V50C-5 57 5 57 13 50V24Z", fill: "#fff" }) +
      L("path", { d: o.collar === "round" ? "M-16 50C-10 60 10 60 16 50" : "M-14 49L0 64L14 49", fill: o.collar === "round" ? "none" : "#fff" }) +
      L("path", { d: "M-31-1C-39-2-39 11-30 11M31-1C39-2 39 11 30 11", fill: "#fff" }) +
      L("circle", { cx: 0, cy: 0, r: 32, fill: "#fff" }) +
      L("path", { d: hair, fill: INK }) +
      (o.glasses
        ? L("circle", { cx: -11, cy: 3, r: 8.5 }) + L("circle", { cx: 11, cy: 3, r: 8.5 }) + L("path", { d: "M-2.5 2Q0-1 2.5 2" })
        : "") +
      L("circle", { cx: -11, cy: 4, r: 2.1, fill: INK, "stroke-width": 1 }) +
      L("circle", { cx: 11, cy: 4, r: 2.1, fill: INK, "stroke-width": 1 }) +
      L("path", { d: o.mouth === "o" ? "M-3 19Q0 23 3 19Q0 16-3 19Z" : "M-7 18Q0 24 7 18" })
    }</g>`;
  }
  const star4 = (x, y, r, fill, cls = "bob") =>
    F("path", {
      d: `M${x} ${y - r}L${x + r * 0.26} ${y - r * 0.26}L${x + r} ${y}L${x + r * 0.26} ${y + r * 0.26}L${x} ${y + r}L${x - r * 0.26} ${y + r * 0.26}L${x - r} ${y}L${x - r * 0.26} ${y - r * 0.26}Z`,
      fill,
      stroke: INK,
      "stroke-width": 1.6,
      "stroke-linejoin": "round",
    }, cls);
  const plus = (x, y, r, color, cls = "bob slow") =>
    F("path", { d: `M${x} ${y - r}V${y + r}M${x - r} ${y}H${x + r}`, stroke: color, "stroke-width": 3.2, "stroke-linecap": "round", fill: "none" }, cls);
  const ring = (x, y, r, fill, cls = "bob") => F("circle", { cx: x, cy: y, r, fill, stroke: INK, "stroke-width": 1.6 }, cls);
  const sparks = (x, y, color) =>
    F("path", { d: `M${x} ${y - 10}V${y - 18}M${x + 9} ${y - 6}L${x + 15} ${y - 12}M${x - 9} ${y - 6}L${x - 15} ${y - 12}`, stroke: color, "stroke-width": 2.6, "stroke-linecap": "round", fill: "none" });
  function arrow(x1, y1, x2, y2, bend, o = {}) {
    const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
    const my = (y1 + y2) / 2 + (x2 - x1) * bend;
    const ang = Math.atan2(y2 - my, x2 - mx);
    const h = (a) => `${(x2 - 9 * Math.cos(ang + a)).toFixed(1)} ${(y2 - 9 * Math.sin(ang + a)).toFixed(1)}`;
    const line = `M${x1} ${y1}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2} ${y2}`;
    return (
      (o.dash
        ? F("path", { d: line, stroke: o.color || INK, "stroke-width": 1.8, "stroke-dasharray": "5 6", "stroke-linecap": "round", fill: "none" })
        : L("path", { d: line, stroke: o.color || INK, "stroke-width": 1.8 })) +
      L("path", { d: `M${h(0.45)}L${x2} ${y2}L${h(-0.45)}`, stroke: o.color || INK, "stroke-width": 1.8 })
    );
  }
  function plant(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">${
      L("path", { d: "M0 0C-8-18-22-22-30-34C-14-33-2-22 0 0Z", fill: SAGE }) +
      L("path", { d: "M2 0C4-22 16-30 28-40C28-22 18-10 2 0Z", fill: SAGE }) +
      L("path", { d: "M1 0C0-16 2-30 6-44" }) +
      L("path", { d: "M-15 0H17L12 30H-10Z", fill: ROSE })
    }</g>`;
  }
  const tag = (x, y, w, text, fill = "#fff") =>
    L("rect", { x, y, width: w, height: 26, rx: 13, fill }) +
    `<text class="fade" x="${x + w / 2}" y="${y + 17.5}" text-anchor="middle" font-family="FN Mono, monospace" font-size="11.5" letter-spacing=".04em" fill="${INK}">${text}</text>`;
  const lines = (x, y, widths, gap = 12, color = INK) =>
    widths.map((w, i) => L("path", { d: `M${x} ${y + i * gap}H${x + w}`, stroke: color, "stroke-width": i ? 1.6 : 2.4 })).join("");
  const svg = (vb, body, label) =>
    `<svg viewBox="${vb}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"'}><g filter="url(#wobble)">${body}</g></svg>`;
  const clip = (x, y, w, h, body) => {
    const id = `fn-clip-${++uid}`;
    return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/></clipPath><g clip-path="url(#${id})">${body}</g>`;
  };

  const SCENES = {
    // the hunter at her window, a job card pinned to the corner, a notebook and pen to hand
    hunter: () =>
      svg(
        "0 0 320 344",
        win(16, 34, 250, 220) +
          clip(17, 61, 248, 192, person(141, 150, 1, { hair: "bob", shirt: SAGE })) +
          `<g transform="rotate(6 260 40)">${L("rect", { x: 214, y: 8, width: 92, height: 62, rx: 4, fill: FOAM })}${lines(226, 26, [62, 54, 40])}</g>` +
          `<g transform="rotate(-8 222 244)">${L("rect", { x: 182, y: 196, width: 80, height: 98, rx: 6, fill: BLUSH })}${L("path", { d: "M194 196V294", "stroke-width": 1.6 })}${lines(204, 218, [44, 40, 34, 40], 14)}</g>` +
          L("path", { d: "M266 170L272 176L246 214L238 218L240 209Z", fill: NAVY }) +
          plant(52, 300, 1) +
          star4(298, 110, 13, SAGE) +
          plus(24, 300, 9, ROSE) +
          ring(296, 300, 8, FOAM, "bob slow") +
          sparks(141, 98, SAGE),
      ),
    // the person she is looking for, seen through three sources at once
    candidate: () =>
      svg(
        "0 0 344 344",
        win(70, 46, 240, 212) +
          clip(71, 73, 238, 184, person(190, 152, 1, { hair: "side", shirt: NAVY, glasses: true, collar: "round" })) +
          L("circle", { cx: 300, cy: 74, r: 26, fill: "rgba(202,225,226,.55)", "stroke-width": 2.6 }) +
          L("path", { d: "M319 93L338 112", "stroke-width": 6 }) +
          tag(6, 96, 70, "简历库") +
          tag(4, 214, 58, "论文") +
          tag(232, 296, 58, "开源") +
          arrow(76, 110, 140, 132, 0.18, { dash: true }) +
          arrow(62, 226, 128, 214, -0.2, { dash: true }) +
          arrow(258, 296, 236, 250, 0.22, { dash: true }) +
          star4(36, 40, 15, ROSE, "spin") +
          plus(330, 196, 8, SAGE) +
          ring(26, 290, 7, SAGE) +
          ring(318, 252, 5, ROSE, "bob slow"),
      ),
    // the hand-off: her window and his, a conversation still to be had — that part is yours
    handoff: () =>
      svg(
        "0 0 460 330",
        win(10, 30, 196, 196) +
          clip(11, 57, 194, 168, person(108, 140, 0.86, { hair: "bob", shirt: SAGE })) +
          win(252, 92, 196, 196) +
          clip(253, 119, 194, 168, person(350, 202, 0.86, { hair: "side", shirt: NAVY, glasses: true, collar: "round" })) +
          F("path", { d: "M186 236C186 214 206 202 232 202C260 202 280 214 280 236C280 258 260 270 232 270C222 270 214 268 206 264L190 274L194 258C188 252 186 244 186 236Z", fill: "#fff", stroke: INK, "stroke-width": 2, "stroke-dasharray": "6 6" }) +
          F("circle", { cx: 214, cy: 236, r: 3.4, fill: INK }) +
          F("circle", { cx: 232, cy: 236, r: 3.4, fill: INK }) +
          F("circle", { cx: 250, cy: 236, r: 3.4, fill: INK }) +
          `<g transform="rotate(-12 70 270)">${L("rect", { x: 52, y: 238, width: 38, height: 66, rx: 8, fill: "#fff" })}${L("path", { d: "M64 246H78" })}${L("circle", { cx: 71, cy: 292, r: 3 })}</g>` +
          sparks(71, 238, ROSE) +
          star4(236, 52, 14, SAGE) +
          plus(440, 52, 9, ROSE) +
          ring(426, 306, 8, FOAM) +
          star4(20, 312, 9, ROSE, "bob slow"),
      ),
    // an open field notebook with a pen and a sprouting plant
    notebook: () =>
      svg(
        "0 0 360 210",
        L("path", { d: "M30 54C80 40 130 44 178 62V196C130 178 80 176 30 190Z", fill: "#fff" }) +
          L("path", { d: "M326 54C276 40 226 44 178 62V196C226 178 276 176 326 190Z", fill: "#fff" }) +
          lines(52, 84, [100, 92, 104, 70], 18) +
          L("path", { d: "M204 96L222 112L254 80", stroke: TEAL, "stroke-width": 3 }) +
          lines(204, 136, [96, 80], 18) +
          L("path", { d: "M282 154C292 146 304 150 300 160C296 170 284 166 288 156", stroke: ROSE, "stroke-width": 2.4 }) +
          L("path", { d: "M330 20L338 28L268 104L258 108L262 98Z", fill: NAVY }) +
          plant(36, 168, 0.8) +
          star4(186, 22, 11, SAGE) +
          plus(116, 22, 7, ROSE),
      ),
    // loose doodles scattered around the call to action
    doodles: () =>
      `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g filter="url(#wobble)">${
        star4(110, 80, 18, SAGE) +
        plus(210, 330, 10, ROSE) +
        ring(84, 300, 10, "#fff") +
        arrow(70, 380, 170, 340, -0.25) +
        star4(1090, 330, 16, ROSE, "spin") +
        plus(1010, 74, 10, TEAL) +
        ring(1128, 150, 9, "#fff", "bob slow") +
        arrow(1150, 250, 1100, 330, 0.25) +
        star4(520, 46, 9, SAGE, "bob slow") +
        plus(700, 380, 7, ROSE) +
        ring(612, 386, 6, "#fff")
      }</g></svg>`,
  };
  document.querySelectorAll("[data-sketch]").forEach((host) => {
    const scene = SCENES[host.dataset.sketch];
    if (!scene) return;
    host.innerHTML = scene();
    host.classList.add("sketch");
    host.querySelectorAll(".ln, .fade").forEach((n, i) => n.style.setProperty("--i", i));
  });

  /* ---------------- hand-drawn marks under and around key phrases ---------------- */
  const MARKS = {
    underline: '<svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 12C40 6 80 15 120 9C150 5 175 10 197 7"/></svg>',
    circle: '<svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M150 10C110 0 40 4 14 30C-6 52 12 84 70 92C130 100 190 86 194 52C197 24 160 8 112 8"/></svg>',
  };
  document.querySelectorAll("[data-mark]").forEach((m) => m.insertAdjacentHTML("beforeend", MARKS[m.dataset.mark] || ""));

  /* ---------------- nav: hairline once scrolled, current section marked ---------------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const navLinks = [...document.querySelectorAll(".links a")];
  const watched = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const navIo = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${en.target.id}`));
      }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  watched.forEach((s) => navIo.observe(s));

  /* ---------------- film chapters ---------------- */
  const CHAPTERS = [
    [10, "发现新岗位"],
    [36.5, "摸清团队"],
    [61, "为岗位找人"],
    [89.5, "为人选找机会"],
    [112, "人和关系都存下来了"],
  ];
  const video = document.querySelector("[data-film]");
  const chapterHost = document.querySelector("[data-chapters]");
  const chapterButtons = CHAPTERS.map(([t, name]) => {
    const b = el("button", "pill");
    b.type = "button";
    b.dataset.t = t;
    b.setAttribute("aria-pressed", "false");
    b.append(name, " ", el("small", "", `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`));
    chapterHost.append(b);
    return b;
  });
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
    markChapter(video.currentTime > 0 || !video.paused ? index : -1);
  });
  new IntersectionObserver(([en]) => !en.isIntersecting && !video.paused && video.pause(), { threshold: 0 }).observe(video);
  /* the film shows its cover with no player controls until someone starts it */
  if (video) {
    video.removeAttribute("controls");
    video.tabIndex = 0;
    const start = () => { video.controls = true; video.play()?.catch?.(() => {}); };
    video.addEventListener("click", () => { if (!video.controls) start(); });
    video.addEventListener("keydown", (e) => { if (!video.controls && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); start(); } });
    video.addEventListener("play", () => { video.controls = true; });
  }

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
  function tabs(host, labels, render, name) {
    const buttons = labels.map((label, i) => {
      const b = el("button", "pill", label);
      b.type = "button";
      b.id = `${name}-tab-${i}`;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", "false");
      b.tabIndex = -1;
      host.append(b);
      return b;
    });
    const select = (i, focus) => {
      buttons.forEach((b, j) => {
        b.setAttribute("aria-selected", String(i === j));
        b.tabIndex = i === j ? 0 : -1;
      });
      if (focus) buttons[i].focus();
      render(i, buttons[i].id);
    };
    buttons.forEach((b, i) => {
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

  /* ---------------- scenarios ---------------- */
  const WORKS = [
    {
      "label": "发现新岗位",
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
  const panel = document.querySelector("[data-scenario-panel]");
  let firstScenario = true;
  const showScenario = (i, tabId) => {
    const w = WORKS[i];
    panel.setAttribute("aria-labelledby", tabId);
    const copy = el("div", "scenario-copy");
    const title = el("h3", "serif h2");
    title.append(...w.headline.split(/(?<=，)/).map((part) => el("span", "nb", part)));
    copy.append(el("span", "eyebrow small", ""), title, el("p", "", w.description), el("p", "detail", w.detail));
    copy.firstChild.innerHTML = `<i class="dot ${["teal", "navy", "sage", "rose"][i]}"></i>${w.label} · ${w.context}`;
    const mock = el("div", "mock");
    const hd = el("div", "mock-hd");
    hd.append(el("b", "", w.subject), el("span", "", "查到的结果"));
    mock.append(hd);
    w.rows.forEach((r) => {
      const row = el("div", "mock-row");
      const r1 = el("div", "r1");
      r1.append(el("b", "", r.t), el("span", "", r.k));
      row.append(r1, el("p", "", r.c));
      if (r.f) row.append(el("span", "gap", `待确认：${r.f}`));
      mock.append(row);
    });
    const asks = el("div", "asks");
    asks.append(el("b", "", "需要你来确认"));
    const ul = el("ul");
    w.questions.forEach((q) => {
      const li = el("li");
      li.append(el("span", "ask", "?"), el("span", "", q));
      ul.append(li);
    });
    asks.append(ul);
    mock.append(asks);
    panel.replaceChildren(copy, mock);
    if (!firstScenario && !reduced.matches) [copy, mock].forEach((n, k) => { n.classList.add("swap"); n.style.animationDelay = `${k * 80}ms`; });
    firstScenario = false;
  };
  const scenarioTabs = document.querySelector("[data-scenario-tabs]");
  let scenarioNow = 0;
  const selectScenario = tabs(scenarioTabs, WORKS.map((w) => w.label), (i, id) => { scenarioNow = i; showScenario(i, id); }, "scenario");
  selectScenario(0);
  rotateTabs(scenarioTabs, panel, selectScenario, () => scenarioNow, WORKS.length);

  /* ---------------- 研究资产: a sketched map with a route drawn per task ---------------- */
  const NODES = {
    company: { x: 150, y: 104, label: "公司", detail: "行业、团队和变化" },
    job: { x: 494, y: 96, label: "岗位", detail: "要求和在招的需求" },
    contact: { x: 120, y: 334, label: "联系人", detail: "负责什么、怎么联系上" },
    candidate: { x: 330, y: 246, label: "候选人", detail: "经历、能力和意向" },
    research: { x: 540, y: 340, label: "论文与专利", detail: "研究方向和成果" },
  };
  const ICONS = {
    company: "M-10 11V-7l9-4v22M-1-1h11v12M-6-3h2M-6 2h2M-6 7h2M3 3h3M3 7h3",
    contact: "M0-9a5 5 0 1 0 0 10a5 5 0 1 0 0-10M-9 11C-8 3 8 3 9 11",
    job: "M-11-4h22v15h-22zM-4-4v-5h8v5M-11 2h22",
    candidate: "M0-11a6 6 0 1 0 0 12a6 6 0 1 0 0-12M-10 12C-9 3 9 3 10 12M9-12l1.4 2.8 3 .4-2.2 2.1.6 3-2.8-1.5-2.8 1.5.6-3-2.2-2.1 3-.4Z",
    research: "M-8-11H4l5 5v17H-8ZM4-11v5h5M-4-1h9M-4 4h9M-4 8h6",
  };
  const EDGES = {
    demand: { from: "company", to: "job", label: "在招", note: "还在不在招，待确认", bend: -0.16 },
    role: { from: "company", to: "contact", label: "在职", note: "现在负责什么，待确认", bend: 0.2 },
    experience: { from: "company", to: "candidate", label: "待过", note: "任职时间，待核对", bend: -0.1 },
    fit: { from: "job", to: "candidate", label: "匹配理由", note: "条件和意向，待确认", bend: 0.12, pending: true },
    connection: { from: "contact", to: "candidate", label: "认识", note: "能不能引荐，待确认", bend: 0.14, pending: true },
    authorship: { from: "research", to: "candidate", label: "作者 / 发明人", note: "同名的人，要核对", bend: -0.14 },
    owner: { from: "job", to: "contact", label: "对口联系人", note: "直接联系方式，待确认", bend: 0.22 },
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
  const R = 40;
  // a gently bent line between two node rims, oriented from a to b
  function curve(a, b, bend) {
    const A = NODES[a], B = NODES[b];
    const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const s = { x: A.x + ux * (R + 8), y: A.y + uy * (R + 8) };
    const e = { x: B.x - ux * (R + 8), y: B.y - uy * (R + 8) };
    const c = { x: (s.x + e.x) / 2 - dy * bend, y: (s.y + e.y) / 2 + dx * bend };
    return { d: `M${s.x.toFixed(1)} ${s.y.toFixed(1)}Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${e.x.toFixed(1)} ${e.y.toFixed(1)}`, mid: { x: 0.25 * s.x + 0.5 * c.x + 0.25 * e.x, y: 0.25 * s.y + 0.5 * c.y + 0.25 * e.y }, e, c };
  }
  const map = document.querySelector("[data-map]");
  // a wide sheet on desktop; on phones the same map is redrawn tall so its labels stay readable
  const LAYOUTS = {
    wide: {
      vb: "0 0 660 440",
      pos: { company: [150, 104], job: [494, 96], contact: [120, 334], candidate: [330, 246], research: [540, 340] },
      deco: () => star4(620, 40, 12, SAGE) + plus(40, 40, 8, ROSE) + ring(630, 200, 6, FOAM),
      nudge: { owner: [92, -36] },
    },
    tall: {
      vb: "0 0 360 640",
      pos: { company: [96, 92], job: [268, 100], contact: [88, 530], candidate: [190, 318], research: [274, 536] },
      deco: () => star4(330, 230, 10, SAGE) + plus(30, 330, 7, ROSE) + ring(330, 410, 5, FOAM),
      nudge: { connection: [-34, 4], authorship: [36, 4], experience: [14, 26], owner: [-34, -42] },
    },
  };
  const tall = matchMedia("(max-width: 720px)");
  let routes, stops;
  function buildMap() {
    const layout = tall.matches ? LAYOUTS.tall : LAYOUTS.wide;
    Object.entries(layout.pos).forEach(([id, [x, y]]) => Object.assign(NODES[id], { x, y }));
    const edgeSvg = Object.entries(EDGES)
      .map(([id, e]) => {
        const k = curve(e.from, e.to, e.bend);
        const [nx, ny] = layout.nudge?.[id] || [0, 0];
        return `<path class="edge ${e.pending ? "pending fade" : "ln"}" ${e.pending ? "" : 'pathLength="1"'} d="${k.d}"/><text class="edge-label fade" x="${(k.mid.x + nx).toFixed(1)}" y="${(k.mid.y - 8 + ny).toFixed(1)}">${e.label}</text>`;
      })
      .join("");
    const nodeSvg = Object.entries(NODES)
      .map(
        ([id, n]) =>
          `<g class="node" data-node="${id}"><circle class="node-ring ln" pathLength="1" cx="${n.x}" cy="${n.y}" r="${R}"/><path class="icon fade" transform="translate(${n.x} ${n.y}) scale(1.35)" d="${ICONS[id]}"/><text class="node-label fade" x="${n.x}" y="${n.y + R + 24}">${n.label}</text><text class="node-detail fade" x="${n.x}" y="${n.y + R + 42}">${n.detail}</text></g>`,
      )
      .join("");
    map.innerHTML = `<svg viewBox="${layout.vb}" aria-hidden="true" focusable="false"><g filter="url(#wobble)">${edgeSvg}<g class="routes"></g>${nodeSvg}<g class="stops"></g>${layout.deco()}</g></svg>`;
    map.querySelectorAll(".ln, .fade").forEach((n, i) => n.style.setProperty("--i", Math.min(i, 24)));
    routes = map.querySelector(".routes");
    stops = map.querySelector(".stops");
  }
  map.classList.add("sketch");
  buildMap();
  const pathPanel = document.querySelector("[data-path-panel]");
  let routeAnims = [];
  let currentPath = 0;
  const showPath = (i, tabId) => {
    const p = PATHS[i];
    currentPath = i;
    pathPanel.setAttribute("aria-labelledby", tabId);
    const title = el("h3", "serif h3");
    title.append(...p.title.split(/(?<=，)/).map((part) => el("span", "nb", part)));
    const chain = el("div", "chain");
    p.nodes.forEach((id, k) => {
      if (k) chain.append(el("span", "to", "→"));
      const n = el("span", "n");
      n.append(el("i", "", String(k + 1)), NODES[id].label);
      chain.append(n);
    });
    const rels = el("ul", "rels");
    p.edges.forEach((id) => {
      const e = EDGES[id];
      const li = el("li");
      const left = el("div");
      left.append(`${NODES[e.from].label} `, el("span", "", `${e.label} →`), ` ${NODES[e.to].label}`);
      li.append(left, el("em", "", e.note));
      rels.append(li);
    });
    const check = el("p", "check-note");
    check.append(el("b", "", "还要确认 · "), p.check);
    pathPanel.replaceChildren(chain, title, el("p", "", p.copy), rels, check);
    if (!reduced.matches) pathPanel.childNodes.forEach((n, k) => { n.classList.add("swap"); n.style.animationDelay = `${k * 60}ms`; });

    // the route, segment by segment, in the order the task walks it
    routeAnims.forEach((a) => a.cancel());
    routeAnims = [];
    map.querySelectorAll(".node").forEach((g) => g.classList.toggle("on", p.nodes.includes(g.dataset.node)));
    let routeHtml = "";
    p.nodes.slice(1).forEach((to, k) => {
      const from = p.nodes[k];
      const id = p.edges[k];
      const e = EDGES[id];
      const forward = e.from === from;
      const k2 = curve(from, to, forward ? e.bend : -e.bend);
      routeHtml += `<path class="route${e.pending ? " pending" : ""}" pathLength="1" d="${k2.d}"/>`;
    });
    routes.innerHTML = routeHtml;
    stops.innerHTML = p.nodes
      .map((id, k) => `<g class="stop"><circle cx="${NODES[id].x + 30}" cy="${NODES[id].y - 30}" r="12"/><text x="${NODES[id].x + 30}" y="${NODES[id].y - 30}">${k + 1}</text></g>`)
      .join("");
    if (!reduced.matches && Element.prototype.animate && map.classList.contains("in")) {
      [...routes.children].forEach((path, k) => {
        path.style.strokeDasharray = path.classList.contains("pending") ? "0.02 0.03" : "1";
        if (!path.classList.contains("pending"))
          routeAnims.push(path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 650, delay: 200 + k * 520, easing: "cubic-bezier(.2,.75,.2,1)", fill: "backwards" }));
        else routeAnims.push(path.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200 + k * 520, fill: "backwards" }));
      });
      [...stops.children].forEach((s, k) =>
        routeAnims.push(s.animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 120 + k * 520, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "backwards" })),
      );
      [...stops.children].forEach((s) => { s.style.transformBox = "fill-box"; s.style.transformOrigin = "center"; });
    } else {
      [...routes.children].forEach((path) => (path.style.strokeDasharray = path.classList.contains("pending") ? "0.02 0.03" : "none"));
    }
  };
  const selectPath = tabs(document.querySelector("[data-path-tabs]"), PATHS.map((p) => p.label), showPath, "path");
  selectPath(0);
  tall.addEventListener?.("change", () => {
    buildMap();
    showPath(currentPath, `path-tab-${currentPath}`);
  });

  /* ---------------- reveals: each part arrives the first time it enters the viewport ---------------- */
  window.__hbReveal = true;
  const motion = document.documentElement.classList.contains("motion");
  const REVEAL = [
    ".section .head > *", ".strip span", ".film-window", ".chapters", ".step", ".boundary", ".boundary-copy > *", "#work .pills",
    ".scenario", ".map", ".map-side", ".cta", ".cta > :not(.cta-doodles)", ".about > *", ".form", ".foot > div", ".foot-meta",
  ].join(",");
  const nodes = [...document.querySelectorAll(REVEAL)];
  const order = new Map();
  nodes.forEach((n) => {
    n.classList.add("rv");
    const i = order.get(n.parentElement) || 0;
    n.style.setProperty("--d", i);
    order.set(n.parentElement, i + 1);
  });
  document.querySelectorAll(".step, .boundary, .scenario, .form").forEach((c, i) => c.style.setProperty("--tilt", `${[-1.4, 1.2, -0.8, 1][i % 4]}deg`));
  document.querySelectorAll(".checks li").forEach((li, i) => li.style.setProperty("--d", [...li.parentElement.children].indexOf(li)));
  const watchers = [
    ...nodes,
    ...document.querySelectorAll(".sketch:not(.hero-art), .mark, .checks"),
  ];
  // the map's route is drawn again, segment by segment, once the map itself has been inked
  const show = (n) => {
    n.classList.add("in");
    if (n.matches(".checks")) n.querySelectorAll("li").forEach((li) => li.classList.add("in"));
    if (n === map && motion) setTimeout(() => showPath(currentPath, `path-tab-${currentPath}`), 900);
  };
  if (!motion) {
    watchers.forEach(show);
    document.querySelectorAll(".hero-art, .hero .mark").forEach(show);
    return;
  }
  const pending = new Set();
  // the film waits for its poster, then comes out of the haze (the 第三版 entrance)
  const filmVideo = document.querySelector(".film-window video");
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
  watchers.forEach((n) => {
    if (n.closest(".hero")) return;
    if (n.getBoundingClientRect().bottom < 0) show(n);
    else {
      pending.add(n);
      io.observe(n);
    }
  });

  // the hero inks itself in on arrival: copy rises, then both drawings, then the underline
  const heroParts = [...document.querySelectorAll(".hero-copy > *")];
  heroParts.forEach((n, i) => {
    n.classList.add("rv");
    n.style.setProperty("--d", i);
  });
  document.querySelectorAll(".hero-copy h1 .line").forEach((n, i) => {
    n.classList.add("rv");
    n.style.setProperty("--d", i + 1);
  });
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      heroParts.forEach((n) => n.classList.add("in"));
      document.querySelectorAll(".hero-copy h1 .line").forEach((n) => n.classList.add("in"));
      setTimeout(() => document.querySelectorAll(".hero-art").forEach((n) => n.classList.add("in")), 250);
      setTimeout(() => document.querySelectorAll(".hero .mark").forEach((n) => n.classList.add("in")), 700);
    }),
  );
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
