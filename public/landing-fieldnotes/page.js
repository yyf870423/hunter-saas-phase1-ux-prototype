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
      (o.beard ? L("path", { d: "M-25 12C-23 33-11 40 0 40C11 40 23 33 25 12" }) : "") +
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
          clip(71, 73, 238, 184, person(190, 152, 1, { hair: "side", shirt: NAVY, glasses: true, beard: true, collar: "round" })) +
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
          clip(253, 119, 194, 168, person(350, 202, 0.86, { hair: "side", shirt: NAVY, glasses: true, beard: true, collar: "round" })) +
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
    [0, "一份描述"],
    [7.2, "凭描述画人"],
    [14.4, "六扇窗"],
    [24, "三张速写"],
    [31.2, "注明出处"],
    [40.8, "最后一笔"],
    [48, "收进手记"],
  ];
  const video = document.querySelector("[data-film]");
  const chapterHost = document.querySelector("[data-chapters]");
  const chapterButtons = CHAPTERS.map(([t, name]) => {
    const b = el("button", "pill");
    b.type = "button";
    b.dataset.t = t;
    b.setAttribute("aria-pressed", "false");
    b.append(name, " ", el("small", "", `0:${String(Math.floor(t)).padStart(2, "0")}`));
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
      label: "岗位找人",
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
    hd.append(el("b", "", w.subject), el("span", "", "研究摘要"));
    mock.append(hd);
    w.rows.forEach((r) => {
      const row = el("div", "mock-row");
      const r1 = el("div", "r1");
      r1.append(el("b", "", r.t), el("span", "", r.k));
      row.append(r1, el("p", "", r.c));
      if (r.f) row.append(el("span", "gap", `仍需了解：${r.f}`));
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
  tabs(document.querySelector("[data-scenario-tabs]"), WORKS.map((w) => w.label), showScenario, "scenario")(0);

  /* ---------------- 研究资产: a sketched map with a route drawn per task ---------------- */
  const NODES = {
    company: { x: 150, y: 104, label: "公司", detail: "产业、组织与变化" },
    job: { x: 494, y: 96, label: "岗位", detail: "要求与招聘需求" },
    contact: { x: 120, y: 334, label: "联系人", detail: "角色与联系路径" },
    candidate: { x: 330, y: 246, label: "候选人", detail: "经历、能力与意向" },
    research: { x: 540, y: 340, label: "论文与专利", detail: "专业方向与成果" },
  };
  const ICONS = {
    company: "M-10 11V-7l9-4v22M-1-1h11v12M-6-3h2M-6 2h2M-6 7h2M3 3h3M3 7h3",
    contact: "M0-9a5 5 0 1 0 0 10a5 5 0 1 0 0-10M-9 11C-8 3 8 3 9 11",
    job: "M-11-4h22v15h-22zM-4-4v-5h8v5M-11 2h22",
    candidate: "M0-11a6 6 0 1 0 0 12a6 6 0 1 0 0-12M-10 12C-9 3 9 3 10 12M9-12l1.4 2.8 3 .4-2.2 2.1.6 3-2.8-1.5-2.8 1.5.6-3-2.2-2.1 3-.4Z",
    research: "M-8-11H4l5 5v17H-8ZM4-11v5h5M-4-1h9M-4 4h9M-4 8h6",
  };
  const EDGES = {
    demand: { from: "company", to: "job", label: "招聘需求", note: "有效性待核实", bend: -0.16 },
    role: { from: "company", to: "contact", label: "任职与职责", note: "当前角色待核实", bend: 0.2 },
    experience: { from: "company", to: "candidate", label: "职业经历", note: "任职信息待核实", bend: -0.1 },
    fit: { from: "job", to: "candidate", label: "匹配依据", note: "条件与意向待核实", bend: 0.12, pending: true },
    connection: { from: "contact", to: "candidate", label: "联系路径", note: "关系与许可需确认", bend: 0.14, pending: true },
    authorship: { from: "research", to: "candidate", label: "作者 / 发明人", note: "同名身份需核验", bend: -0.14 },
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
    },
    tall: {
      vb: "0 0 360 640",
      pos: { company: [96, 92], job: [268, 100], contact: [88, 530], candidate: [190, 318], research: [274, 536] },
      deco: () => star4(330, 230, 10, SAGE) + plus(30, 330, 7, ROSE) + ring(330, 410, 5, FOAM),
      nudge: { connection: [-34, 4], authorship: [36, 4], experience: [14, 26] },
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
    check.append(el("b", "", "仍需核验 · "), p.check);
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
