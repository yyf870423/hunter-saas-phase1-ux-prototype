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

  /* scenarios: four neutral cards */
  const LABELS = ["岗位找人", "客户开发", "人才梳理", "候选人机会"];
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
