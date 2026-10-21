(() => {
  const WORKS = [
    {
      "headline": "一条融资新闻，可能就是下一个岗位。",
      "description": "周一早上，HunterBuddy 提醒你：星川机器人刚拿到 B 轮融资，可能要扩招。一个确认过的岗位、一位对口联系人，加一条备用的引荐路线。直接联系还是请人引荐、怎么开口，你说了算。拿到 JD，它就是一个正式岗位。",
      "context": "每周一 09:00 · 帮你盯着的赛道",
      "subject": "星川机器人 · 可能有新岗位",
      "rows": [
        {
          "t": "官网招聘页新增视觉算法负责人",
          "k": "找到岗位 · 两处来源"
        },
        {
          "t": "许晴 · 技术负责人",
          "k": "对口联系人"
        },
        {
          "t": "张远 → 许晴",
          "k": "备用 · 引荐路线"
        }
      ],
      "questions": [
        "他们真的在招这个岗位吗？",
        "直接联系许晴，还是请张远引荐？",
        "合作方式和优先级怎么谈？"
      ]
    },
    {
      "headline": "想摸清一个团队，资料却东一块西一块。",
      "description": "星川要招人，你得先知道这类人都在哪。星川和两家对标公司的团队信息，散在官网、新闻、论文和你的简历库里。一张人才地图：谁在什么位置，消息从哪来，哪里还是空白。你手上的 Excel 人才地图也能导进来接着补。",
      "context": "目标公司 · 人才地图",
      "subject": "星川和两家对标公司",
      "rows": [
        {
          "t": "拓界机器人 · 视觉团队",
          "k": "负责人已确认"
        },
        {
          "t": "穹顶智能 · 控制团队",
          "k": "在职的人待确认"
        },
        {
          "t": "星川机器人 · 产品交付",
          "k": "空白"
        }
      ],
      "questions": [
        "团队名字和分工还对吗？",
        "这些名字和你库里的候选人是同一个人吗？",
        "哪些空白值得下次去补？"
      ]
    },
    {
      "headline": "JD 到手，先看你手上已经有谁。",
      "description": "张远引荐之后，许晴发来视觉算法负责人的 JD，只有几行字。合适的人很少，线索也很散。几位值得聊聊的人选。为什么合适、消息从哪来、哪里还不清楚，都写在旁边。先联系谁，你来判断。",
      "context": "星川机器人 · 视觉算法负责人",
      "subject": "值得聊聊的人选",
      "rows": [
        {
          "t": "林越",
          "k": "工业视觉 · 团队负责人"
        },
        {
          "t": "周宁",
          "k": "机器人感知 · 技术骨干"
        },
        {
          "t": "陈思",
          "k": "视觉算法 · 项目负责人"
        }
      ],
      "questions": [
        "JD 里哪些条件不能让步？",
        "人选现在的职位和负责的项目准确吗？",
        "本人想不想动、能不能联系，问过了吗？"
      ]
    },
    {
      "headline": "半年后，林越的团队变了。",
      "description": "上次林越没动。你让 HunterBuddy 每两周看一次重点候选人，这次它发现：拓界机器人的视觉团队并进了新成立的平台部，而林越在现在的岗位上已经做了四年。几个有理有据的机会。打不打这通电话、推不推荐，你说了算。聊完把新简历发给它，资料和匹配都会更新。",
      "context": "重点候选人 · 林越",
      "subject": "林越 · 可以聊的下一站",
      "rows": [
        {
          "t": "穹顶智能 · 视觉平台负责人",
          "k": "你在招的岗位"
        },
        {
          "t": "星川机器人 · 新产线视觉团队",
          "k": "人脉里的新机会"
        },
        {
          "t": "本人意向",
          "k": "只是迹象"
        }
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

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* hero: artifacts settle in once, then drift gently */
  const stage = document.querySelector("[data-intro]");
  if (stage && !calm.matches) stage.classList.add("intro");

  /* hero assembly (after steep.app): the hero pins while you scroll; the headline recedes, a workspace
     window rises, and each floating fragment flies into its slot until the hero reads as one product page. */
  (() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const app = hero.querySelector("[data-app]");
    const canvas = hero.querySelector("[data-canvas]");
    const copy = hero.querySelector(".hero-copy");
    const arts = [...hero.querySelectorAll("[data-art]")];
    const roomy = window.matchMedia("(min-width: 1100px) and (min-height: 620px)");
    const W = 1152, H = 700, CW = 1152, CH = 820, TOP = 112;
    const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const out = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
    const clamp = (x) => Math.max(0, Math.min(1, x));
    // stagger: [start, length] in scroll progress, per fragment
    const TIMING = { a1: [0.1, 0.62], a2: [0.15, 0.62], a3: [0.2, 0.62], a4: [0.25, 0.62], hb: [0.3, 0.62], you: [0.34, 0.62] };
    const BOB = { a1: [7, 0], a2: [8, 1.8], a3: [7.5, 3.1], a4: [8.5, 4.4], hb: [6, 0.6], you: [6.5, 2.4] };
    let on = false, geo = null, shown = -1, target = 0, raf = 0, visible = true;

    function measure() {
      arts.forEach((a) => (a.style.transform = ""));
      const sw = canvas.parentElement.clientWidth, sh = canvas.parentElement.clientHeight;
      const k = Math.min(1, (sh - TOP - 12) / CH, sw / CW);
      canvas.style.setProperty("--k", k);
      const fit = Math.min(1, sw / W, (sh - 48) / H);
      const top = Math.max(24, (sh - H * fit) / 2);
      arts.forEach((a) => {
        const slot = app.querySelector(`[data-slot="${a.dataset.art}"]`);
        if (!slot.classList.contains("cur")) slot.style.height = `${a.offsetHeight}px`;
      });
      geo = {
        sw, sh, k, fit, top,
        items: arts.map((a) => {
          const slot = app.querySelector(`[data-slot="${a.dataset.art}"]`);
          let lx = 0, ly = 0;
          for (let n = slot; n && n !== app; n = n.offsetParent) { lx += n.offsetLeft; ly += n.offsetTop; }
          const tx = sw / 2 + (lx - W / 2) * fit, ty = top + ly * fit; // slot, in stage pixels
          const cx = (tx - sw / 2) / k + CW / 2, cy = (ty - TOP) / k; // the same point in canvas units
          return { a, name: a.dataset.art, dx: cx - a.offsetLeft, dy: cy - a.offsetTop, s: fit / k };
        }),
      };
      shown = -1;
    }

    function progress() {
      const r = hero.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, hero.offsetHeight - window.innerHeight));
    }

    function paint(p, now) {
      const { sh, fit, top, items } = geo;
      const c = out(p / 0.5);
      copy.style.transform = `translateY(${-70 * c}px) scale(${1 - 0.2 * c})`;
      copy.style.opacity = String(1 - clamp(c * 1.25));
      copy.style.visibility = c > 0.97 ? "hidden" : "";
      const e = ease(clamp((p - 0.04) / 0.66));
      app.style.transform = `translateY(${top + (1 - e) * sh * 0.55}px) scale(${fit * (0.86 + 0.14 * e)})`;
      app.style.opacity = String(clamp(e * 2.4));
      for (const it of items) {
        const [s0, len] = TIMING[it.name];
        const f = ease(clamp((p - s0) / len));
        const [period, phase] = BOB[it.name];
        const bob = Math.sin(((now / 1000 + phase) / period) * Math.PI * 2) * 6 * (1 - f);
        const sc = 1 + (it.s - 1) * f;
        it.a.style.transform = `translate(${it.dx * f}px, ${it.dy * f + bob}px) scale(${sc})`;
        it.a.style.setProperty("--lift", (1 - f).toFixed(3));
      }
    }

    function frame(now) {
      raf = 0;
      if (!on || !geo) return;
      target = progress();
      shown = shown < 0 ? target : shown + (target - shown) * 0.14;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      paint(shown, now);
      // keep running while settling, or while fragments still float (they bob until docked)
      if (visible && (shown !== target || shown < 0.98)) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (on && !raf) raf = requestAnimationFrame(frame); };

    function setup() {
      const want = roomy.matches && !calm.matches;
      if (want !== on) {
        on = want;
        hero.classList.toggle("assemble", on);
        if (!on) {
          [copy, app, ...arts].forEach((n) => { n.style.transform = ""; n.style.opacity = ""; n.style.visibility = ""; });
          canvas.style.removeProperty("--k");
          geo = null;
          return;
        }
      }
      if (on) { measure(); kick(); }
    }

    let resizeTimer = 0;
    window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setup, 120); });
    window.addEventListener("scroll", kick, { passive: true });
    roomy.addEventListener?.("change", setup);
    calm.addEventListener?.("change", setup);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; kick(); }).observe(hero);
    setup();
    document.fonts?.ready.then(() => on && (measure(), kick()));
  })();

  /* film chapters */
  const video = document.querySelector("[data-film]");
  const chapters = [...document.querySelectorAll("[data-chapters] .chapter")];
  const markChapter = (index) => chapters.forEach((b, i) => b.setAttribute("aria-pressed", String(i === index)));
  chapters.forEach((button, i) =>
    button.addEventListener("click", () => {
      if (!video) return;
      try {
        video.currentTime = Number(button.dataset.t);
      } catch {
        /* metadata not loaded yet */
      }
      video.play()?.catch?.(() => {});
      markChapter(i);
    }),
  );
  video?.addEventListener("timeupdate", () => {
    let index = -1;
    chapters.forEach((b, i) => {
      if (video.currentTime >= Number(b.dataset.t)) index = i;
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

  /* scenarios: four neutral cards */
  const LABELS = ["发现新岗位", "摸清团队", "为岗位找人", "为人选找机会"];
  const grid = document.querySelector("[data-scenarios]");
  WORKS.forEach((work, i) => {
    const card = el("article", "card");
    const rows = el("div", "rows");
    rows.append(
      ...work.rows.map((row) => {
        const line = el("div");
        line.append(el("b", "", row.t), el("span", "", row.k));
        line.firstChild.style.fontWeight = "450";
        return line;
      }),
    );
    const title = el("h3", "d44");
    // keep each clause on one line so headlines break at the comma, not mid-phrase
    title.append(...work.headline.split(/(?<=，)/).map((part) => el("span", "nb", part)));
    card.append(el("span", "tag", `${LABELS[i]} · ${work.context}`), title, el("p", "", work.description), rows);
    grid.append(card);
  });

  /* scroll reveals: each section's parts arrive in sequence the first time they enter the viewport */
  (() => {
    window.__hbReveal = true;
    const root = document.documentElement;
    if (!root.classList.contains("motion")) return;
    const SEL = [
      ".section .head > *", ".feature .copy > *", ".feature .panel", ".feature .panel > .artifact", ".film", ".chapters .chapter",
      ".peach", ".peach > div > *", ".peach li", ".grid2 .card", ".rel-list .rel", ".flows .flow", ".section .wrap.center > *",
      ".about > *", ".form", ".foot > div", ".foot-meta",
    ].join(",");
    const nodes = [...document.querySelectorAll(SEL)];
    const order = new Map();
    nodes.forEach((n) => {
      const i = order.get(n.parentElement) || 0;
      n.style.setProperty("--d", i);
      order.set(n.parentElement, i + 1);
    });
    document.querySelectorAll(".section .panel").forEach((panel) => {
      panel.querySelectorAll(".ev").forEach((row, i) => row.style.setProperty("--r", i));
      panel.querySelectorAll(".chip").forEach((chip, i) => chip.style.setProperty("--c", i));
    });

    // "43 → 18": count the leads up, then let duplicates merge away
    const count = (metric) => {
      const m = metric.textContent.trim().match(/^(\d+) → (\d+)$/);
      if (!m) return;
      const [a, b] = [Number(m[1]), Number(m[2])];
      const t0 = performance.now() + 450;
      const step = (now) => {
        const x = Math.max(0, now - t0) / 1000;
        const up = Math.min(1, x / 0.7), down = Math.min(1, Math.max(0, x - 0.8) / 0.9);
        const e = (v) => 1 - Math.pow(1 - v, 3);
        metric.textContent = `${Math.round(a * e(up))} → ${Math.round(a + (b - a) * e(down))}`;
        if (down < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const show = (n) => {
      n.classList.add("in");
      if (n.matches(".feature .panel > .artifact")) n.querySelectorAll(".metric").forEach(count);
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
    nodes.forEach((n) => {
      if (n.getBoundingClientRect().bottom < 0) n.classList.add("in");
      else {
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
