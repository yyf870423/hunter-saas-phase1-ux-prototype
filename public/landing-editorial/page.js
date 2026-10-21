(() => {
  const WORKS = [
    {
      "headline": "一条融资新闻，可能就是下一个岗位。",
      "description": "周一早上，HunterBuddy 提醒你：星川机器人刚拿到 B 轮融资，可能要扩招。",
      "detail": "它先去找有没有具体岗位：官网招聘页上多了视觉算法负责人。找到岗位，再找对口的联系人：负责视觉团队的技术负责人许晴。她的直接联系方式没找到，才去翻你的人脉：你的老客户张远是星川的投资人，能帮你引荐。",
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
      "evidence": [
        [
          "交给你",
          "一个确认过的岗位、一位对口联系人，加一条备用的引荐路线。直接联系还是请人引荐、怎么开口，你说了算。拿到 JD，它就是一个正式岗位。"
        ],
        [
          "用到的关系",
          "公司新闻 · 招聘页 · 对口联系人 · 你的人脉"
        ]
      ],
      "questions": [
        "他们真的在招这个岗位吗？",
        "直接联系许晴，还是请张远引荐？",
        "合作方式和优先级怎么谈？"
      ]
    },
    {
      "headline": "想摸清一个团队，资料却东一块西一块。",
      "description": "星川要招人，你得先知道这类人都在哪。星川和两家对标公司的团队信息，散在官网、新闻、论文和你的简历库里。",
      "detail": "它按公司、团队、关键岗位、在职的人一层层排好，把官网上的任职信息、你库里的候选人、论文和专利里的名字对上号。一起写过论文的人，不会被当成上下级。",
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
      "evidence": [
        [
          "交给你",
          "一张人才地图：谁在什么位置，消息从哪来，哪里还是空白。你手上的 Excel 人才地图也能导进来接着补。"
        ],
        [
          "用到的关系",
          "团队结构 · 在职 · 论文作者"
        ]
      ],
      "questions": [
        "团队名字和分工还对吗？",
        "这些名字和你库里的候选人是同一个人吗？",
        "哪些空白值得下次去补？"
      ]
    },
    {
      "headline": "JD 到手，先看你手上已经有谁。",
      "description": "张远引荐之后，许晴发来视觉算法负责人的 JD，只有几行字。合适的人很少，线索也很散。",
      "detail": "它不从零开始：先看人才地图里的目标团队、这类人通常从哪些公司出来、你库里谁最接近，再去网上、论文专利和开源社区补齐。简历里的林越、论文里的 Lin Y. 和开源社区的 lin-yue，核对后发现是同一个人。",
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
      "evidence": [
        [
          "交给你",
          "几位值得聊聊的人选。为什么合适、消息从哪来、哪里还不清楚，都写在旁边。先联系谁，你来判断。"
        ],
        [
          "用到的关系",
          "人才地图 · 跳槽去向 · 同公司 · 一起写过论文"
        ]
      ],
      "questions": [
        "JD 里哪些条件不能让步？",
        "人选现在的职位和负责的项目准确吗？",
        "本人想不想动、能不能联系，问过了吗？"
      ]
    },
    {
      "headline": "半年后，林越的团队变了。",
      "description": "上次林越没动。你让 HunterBuddy 每两周看一次重点候选人，这次它发现：拓界机器人的视觉团队并进了新成立的平台部，而林越在现在的岗位上已经做了四年。",
      "detail": "它不替你下结论，先问你要不要核实。你点头后，它整理林越的最新情况，对照你手上所有在招的岗位和熟悉的公司，看哪些值得聊。",
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
      "evidence": [
        [
          "交给你",
          "几个有理有据的机会。打不打这通电话、推不推荐，你说了算。聊完把新简历发给它，资料和匹配都会更新。"
        ],
        [
          "用到的关系",
          "团队调整 · 在招岗位 · 熟悉的公司"
        ]
      ],
      "questions": [
        "他这次最在意什么？",
        "这些机会的职责和要求核实过吗？",
        "推荐出去的内容，他同意了吗？"
      ]
    }
  ];

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  /* header hairline once the page scrolls */
  const header = document.querySelector("[data-header]");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
  /* the film shows its cover with no player controls until someone starts it */
  if (video) {
    video.removeAttribute("controls");
    video.tabIndex = 0;
    const start = () => { video.controls = true; video.play()?.catch?.(() => {}); };
    video.addEventListener("click", () => { if (!video.controls) start(); });
    video.addEventListener("keydown", (e) => { if (!video.controls && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); start(); } });
    video.addEventListener("play", () => { video.controls = true; });
  }

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
    // headlines break at the comma, not inside a phrase
    slot("headline").replaceChildren(...work.headline.split(/(?<=，)/).map((part) => el("span", "ph", part)));
    slot("questions").replaceChildren(...stagger(work.questions.map((q) => el("div", "q", q)), 2));
    slot("rows").replaceChildren(
      ...stagger(
        work.rows.map((row) => {
          const item = el("div", "row");
          const title = el("div", "row-title");
          title.append(el("strong", "", row.t), el("span", "", row.k));
          item.append(title, el("p", "", row.c));
          if (row.f) item.append(el("p", "follow", `待确认：${row.f}`));
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

  /* the four tabs step through by themselves (a thin line under the open tab fills as its turn runs out);
     clicking a tab jumps straight to it and the rotation carries on from there. Pointing the mouse at the
     panel holds it while you read. Reduced motion stays manual. */
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
      [".hero-copy > *", rise(24), (i) => 60 + i * 110, 1000],
      [".floats .glass", rise(40, 0, 0.96), (i) => 520 + i * 160, 1100],
      [".head-row .head-col > *", rise(28), (i) => i * 90, 900],
      [".head-row > .body", rise(28), () => 200, 900],
      [".head-col:not(.head-row .head-col) > *", rise(28), (i) => i * 90, 900],
      [".film-frame", FILM_IN, () => 200, 1400],
      [".chapters .chapter", HAZE(14), (i) => 380 + i * 60, 1000],
      ["section[aria-label='找人渠道'] .body", rise(20), () => 0, 800],
      [".channel", rise(26, 0, 0.97), (i) => 120 + i * 80, 800],
      [".tabs", rise(20), () => 0, 800],
      [".panel-copy", rise(28), () => 120, 900],
      [".panel > .card", rise(56, 0, 0.98), () => 220, 1100],
      [".band-art", [{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], () => 0, 1200],
      [".band-copy > *", rise(28), (i) => 150 + i * 100, 900],
      [".duo li", rise(0, -14), (i) => 500 + i * 80, 700],
      [".photo-card", rise(48, 0, 0.98), (i) => i * 140, 1100],
      [".asset", rise(30, 0, 0.97), (i) => i * 90, 900],
      [".relation", rise(16, 0, 0.96), (i) => 200 + i * 70, 700],
      [".flows .flow", rise(24), (i) => 150 + i * 110, 900],
      [".gradient .wrap > *", rise(32), (i) => i * 120, 1000],
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

    // the dark band: the record cards and the line toward the gate draw themselves in
    const art = document.querySelector(".band-art svg");
    const solid = art ? [...art.querySelectorAll("rect, line, path, circle")].filter((n) => !n.getAttribute("stroke-dasharray") && n.getAttribute("stroke")) : [];
    solid.forEach((n) => { n.setAttribute("pathLength", "1"); n.classList.add("draw"); });
    const drawArt = () => {
      solid.forEach((n, i) =>
        n.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1000, delay: 250 + i * 70, easing: EASE, fill: "both" }),
      );
      [...art.querySelectorAll("[stroke-dasharray], circle[fill]:not([stroke])")].forEach((n, i) =>
        n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 900 + i * 90, easing: "ease-out", fill: "backwards" }),
      );
    };

    const show = (n) => {
      const job = jobs.get(n);
      n.classList.add("in");
      n.animate(job.frames, { duration: job.duration, delay: job.delay, easing: EASE, fill: "backwards" });
      if (n.matches(".panel > .card"))
        n.querySelectorAll(".row").forEach((row, i) =>
          row.animate(rise(0, -12), { duration: 700, delay: 560 + i * 110, easing: EASE, fill: "backwards" }),
        );
      if (n.matches(".photo-card"))
        n.querySelector("img")?.animate([{ transform: "scale(1.08)" }, { transform: "none" }], { duration: 1600, delay: job.delay, easing: EASE, fill: "backwards" });
      if (n.matches(".band-art") && art) drawArt();
    };
    const pending = new Set();
    // the film waits for its poster, then comes out of the haze (the 第三版 entrance)
    const filmVideo = document.querySelector(".film-frame video");
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
        solid.forEach((p) => p.style.setProperty("stroke-dashoffset", "0"));
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
