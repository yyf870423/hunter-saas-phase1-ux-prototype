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

  /* scenario tabs */
  const tabs = [...document.querySelectorAll("[data-tabs] .tab")];
  const panel = document.querySelector("[data-panel]");
  const slot = (name) => panel.querySelector(`[data-f="${name}"]`);
  function showWork(index, focus = false) {
    const work = WORKS[index];
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    if (focus) tabs[index].focus();
    panel.setAttribute("aria-labelledby", tabs[index].id);
    ["headline", "description", "detail", "context", "subject"].forEach((key) => {
      slot(key).textContent = work[key];
    });
    slot("questions").replaceChildren(...work.questions.map((q) => el("div", "q", q)));
    slot("rows").replaceChildren(
      ...work.rows.map((row) => {
        const item = el("div", "row");
        item.append(el("strong", "", row.t), el("span", "k", row.k), el("p", "", row.c));
        if (row.f) item.append(el("p", "follow", `仍需了解：${row.f}`));
        return item;
      }),
    );
    slot("evidence").replaceChildren(
      ...work.evidence.map(([title, copy]) => {
        const item = el("div");
        item.append(el("b", "", `${title}：`), document.createTextNode(copy));
        return item;
      }),
    );
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
