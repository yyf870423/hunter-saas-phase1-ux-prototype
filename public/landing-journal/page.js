(() => {
  const WORKS = [
    {
      "headline": "一条融资新闻，可能就是下一个岗位。",
      "beats": [
        "周一早上，HunterBuddy 提醒你：星川机器人刚拿到 B 轮融资，可能要扩招。",
        "它先去找有没有具体岗位：官网招聘页上多了视觉算法负责人。找到岗位，再找对口的联系人：负责视觉团队的技术负责人许晴。她的直接联系方式没找到，才去翻你的人脉：你的老客户张远是星川的投资人，能帮你引荐。",
        "一个确认过的岗位、一位对口联系人，加一条备用的引荐路线。直接联系还是请人引荐、怎么开口，你说了算。拿到 JD，它就是一个正式岗位。"
      ],
      "questions": [
        "他们真的在招这个岗位吗？",
        "直接联系许晴，还是请张远引荐？",
        "合作方式和优先级怎么谈？"
      ],
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
      "relations": [
        "公司新闻",
        "招聘页",
        "对口联系人",
        "你的人脉"
      ]
    },
    {
      "headline": "想摸清一个团队，资料却东一块西一块。",
      "beats": [
        "星川要招人，你得先知道这类人都在哪。星川和两家对标公司的团队信息，散在官网、新闻、论文和你的简历库里。",
        "它按公司、团队、关键岗位、在职的人一层层排好，把官网上的任职信息、你库里的候选人、论文和专利里的名字对上号。一起写过论文的人，不会被当成上下级。",
        "一张人才地图：谁在什么位置，消息从哪来，哪里还是空白。你手上的 Excel 人才地图也能导进来接着补。"
      ],
      "questions": [
        "团队名字和分工还对吗？",
        "这些名字和你库里的候选人是同一个人吗？",
        "哪些空白值得下次去补？"
      ],
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
      "relations": [
        "团队结构",
        "在职",
        "论文作者"
      ]
    },
    {
      "headline": "JD 到手，先看你手上已经有谁。",
      "beats": [
        "张远引荐之后，许晴发来视觉算法负责人的 JD，只有几行字。合适的人很少，线索也很散。",
        "它不从零开始：先看人才地图里的目标团队、这类人通常从哪些公司出来、你库里谁最接近，再去网上、论文专利和开源社区补齐。简历里的林越、论文里的 Lin Y. 和开源社区的 lin-yue，核对后发现是同一个人。",
        "几位值得聊聊的人选。为什么合适、消息从哪来、哪里还不清楚，都写在旁边。先联系谁，你来判断。"
      ],
      "questions": [
        "JD 里哪些条件不能让步？",
        "人选现在的职位和负责的项目准确吗？",
        "本人想不想动、能不能联系，问过了吗？"
      ],
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
      "relations": [
        "人才地图",
        "跳槽去向",
        "同公司",
        "一起写过论文"
      ]
    },
    {
      "headline": "半年后，林越的团队变了。",
      "beats": [
        "上次林越没动。你让 HunterBuddy 每两周看一次重点候选人，这次它发现：拓界机器人的视觉团队并进了新成立的平台部，而林越在现在的岗位上已经做了四年。",
        "它不替你下结论，先问你要不要核实。你点头后，它整理林越的最新情况，对照你手上所有在招的岗位和熟悉的公司，看哪些值得聊。",
        "几个有理有据的机会。打不打这通电话、推不推荐，你说了算。聊完把新简历发给它，资料和匹配都会更新。"
      ],
      "questions": [
        "他这次最在意什么？",
        "这些机会的职责和要求核实过吗？",
        "推荐出去的内容，他同意了吗？"
      ],
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
      "relations": [
        "团队调整",
        "在招岗位",
        "熟悉的公司"
      ]
    }
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
  /* before it is started the film shows only its designed cover: no player bar on top. Clicking the cover (or
     Enter / Space on it) starts it, and from then on the normal controls are there. */
  if (video) {
    video.removeAttribute("controls");
    video.tabIndex = 0;
    const start = () => {
      video.controls = true;
      video.play()?.catch?.(() => {});
    };
    video.addEventListener("click", () => { if (!video.controls) start(); });
    video.addEventListener("keydown", (event) => {
      if (!video.controls && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        start();
      }
    });
    video.addEventListener("play", () => { video.controls = true; });
  }
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

  /* data-flow figures (hero, 分工): hold still for reduced motion, and pause while off screen */
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
    ["headline", "context"].forEach((key) => {
      slot(key).textContent = work[key];
    });
    /* keep each half of "公司 · 说明" on one line so a narrow card breaks at the dot */
    slot("subject").replaceChildren(
      ...work.subject.split(" · ").flatMap((part, i) => [...(i ? [" · "] : []), el("span", "nw", part)]),
    );
    slot("beats").replaceChildren(
      ...stagger(
        work.beats.map((text, i) => {
          const beat = el("div", "beat");
          beat.append(el("span", "beat-k", ["看到", "它来查", "交给你"][i]), el("p", "body", text));
          return beat;
        }),
        1,
      ),
    );
    slot("questions").replaceChildren(...stagger(work.questions.map((q) => el("div", "q", q)), 4));
    slot("rows").replaceChildren(
      ...stagger(
        work.rows.map((row) => {
          const item = el("div", "row");
          item.append(el("strong", "", row.t), el("span", "k", row.k), el("p", "", row.c));
          if (row.f) item.append(el("p", "follow", `待确认：${row.f}`));
          return item;
        }),
        1,
      ),
    );
    slot("relations").replaceChildren(...stagger(work.relations.map((r) => el("span", "rel-tag", r)), 4));
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

  /* the four scenarios step through by themselves. A click (or arrow key) jumps straight to one and the cycle carries
     on from there; the open tab shows a thin progress line. While the pointer rests on the panel, someone is reading,
     so the cycle holds until it leaves. */
  {
    const DWELL = 9000;
    let elapsed = 0;
    let last = 0;
    let visible = false;
    let looping = false;
    let reading = false;
    const setP = () => tabs.forEach((t, i) => t.style.setProperty("--p", i === current ? Math.min(1, elapsed / DWELL).toFixed(4) : 0));
    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!calm.matches && !reading && !document.hidden) {
        elapsed += dt;
        if (elapsed >= DWELL) {
          elapsed = 0;
          showWork((current + 1) % tabs.length);
        }
        setP();
      }
      if (visible) requestAnimationFrame(tick);
      else looping = false;
    };
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible || looping) return;
      looping = true;
      last = performance.now();
      requestAnimationFrame(tick);
    }, { threshold: 0.2 }).observe(panel);
    const restart = () => { elapsed = 0; setP(); };
    tabs.forEach((tab) => tab.addEventListener("click", restart));
    tabList.addEventListener("keydown", restart);
    panel.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") reading = true; });
    panel.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") reading = false; });
  }

  /* how it works: six columns in one strip. On wide screens it steps through by itself (the open column's
     top bar fills as its turn runs out); pointing the mouse at the strip stops it on the step you point at,
     leaving resumes it. Tab focus holds it too, a tap hands control over for good. Narrow screens (an
     accordion) and reduced motion stay manual. */
  (() => {
    const strip = document.querySelector("[data-s6]");
    if (!strip) return;
    const cols = [...strip.querySelectorAll(".s6-col")];
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const wide = matchMedia("(min-width: 1181px)");
    const DWELL = 4200;
    let cur = 0;
    let elapsed = 0;
    let hovering = false;
    let focused = false;
    let handed = false;
    let visible = false;
    let looping = false;
    let last = 0;
    const auto = () => !handed && !calm.matches && wide.matches;
    const running = () => auto() && !hovering && !focused;
    const open = (col) => {
      cur = cols.indexOf(col);
      elapsed = 0;
      cols.forEach((c) => {
        c.classList.toggle("is-open", c === col);
        c.setAttribute("aria-expanded", String(c === col));
        c.style.setProperty("--p", c === col && running() ? 0 : 1);
      });
    };
    const sync = () => {
      elapsed = 0;
      cols[cur].style.setProperty("--p", running() ? 0 : 1);
    };
    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (running()) {
        elapsed += dt;
        cols[cur].style.setProperty("--p", Math.min(1, elapsed / DWELL).toFixed(4));
        if (elapsed >= DWELL) open(cols[(cur + 1) % cols.length]);
      }
      if (visible) requestAnimationFrame(tick);
      else looping = false;
    };
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible || looping) return;
      looping = true;
      last = performance.now();
      requestAnimationFrame(tick);
    }).observe(strip);

    strip.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") { hovering = true; sync(); } });
    strip.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") { hovering = false; sync(); } });
    strip.addEventListener("focusin", () => { focused = true; sync(); });
    strip.addEventListener("focusout", (event) => { if (!strip.contains(event.relatedTarget)) { focused = false; sync(); } });
    strip.addEventListener("pointerdown", (event) => { if (event.pointerType !== "mouse") { handed = true; sync(); } });
    [calm, wide].forEach((mq) => mq.addEventListener?.("change", sync));
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
    if (!svg || flows.length !== 4) return;
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
    const ENDS = baseEdges.map((p) => [p.dataset.a, p.dataset.b]);
    const SCENES = [
      ["company", "role", "contact"], // 发现新岗位
      ["company", "map", "cand"], // 摸清团队
      ["role", "map", "cand", "paper"], // 为岗位找人
      ["cand", "company", "role"], // 为人选找机会
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
      notes: form.elements.namedItem("notes").value.trim(),
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
