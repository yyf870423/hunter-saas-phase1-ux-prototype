(() => {
  const ui = window.FinesseUI;
  const data = window.FinesseHomepageData;
  const network = window.FinesseAssetNetwork;
  const root = document.querySelector("#homepage");
  const integrated = root?.hasAttribute("data-integrated-page");
  const chapters = window.FinesseResearchChapters;
  const research = window.FinesseResearchChaptersData;
  const trial = root?.hasAttribute("data-trial-preview")
    ? window.FinesseTrial
    : null;
  // Keep the readable HTML when an enhancement script fails to load.
  if (!ui || !data || !network || !root) return;
  if (root.hasAttribute("data-trial-preview") && !trial) return;
  if (integrated && (!chapters || !research)) return;
  const e = ui.escape;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

  root.innerHTML = `
    <a class="f-skip" href="#main">跳到正文</a>
    <span class="f-header-sentinel" aria-hidden="true"></span>
    <header class="f-header">
      <div class="f-container f-header-inner">
        <a href="#main" aria-label="铂寻 Boseek 首页">${ui.brand()}</a>
        <nav class="f-nav" id="f-navigation" aria-label="主导航">
          <a href="#work">工作示例</a>
          <a href="#research">研究与推进</a>
          <a href="#about">关于铂寻</a>
        </nav>
        <div class="f-header-actions">
          <a class="f-login-link" href="${e(trial ? "#apply" : data.loginUrl)}">${trial ? "申请试用" : "登录"}</a>
          ${ui.iconButton("menu", "打开导航", 'data-menu-toggle aria-controls="f-navigation" aria-expanded="false" hidden')}
        </div>
      </div>
    </header>

    <main id="main" tabindex="-1">
      <section class="f-hero" aria-labelledby="f-hero-title">
        <div class="f-hero-depth">
          <div class="f-hero-pointer">
            <picture class="f-hero-breath">
              <source media="(max-width: 600px)" srcset="assets/hero-research-mobile.webp" />
              <img src="assets/hero-research.webp" alt="自然光下，一位亚洲猎头正在核对研究资料" width="1915" height="821" fetchpriority="high" />
            </picture>
          </div>
        </div>
        <div class="f-container f-hero-inner">
          <div class="f-hero-copy">
            <h1 id="f-hero-title">HunterBuddy</h1>
            ${trial ? '<p class="f-coming-soon">产品开发中，即将上线</p>' : ""}
            <p class="f-hero-statement">猎头的 AI 工作伙伴</p>
            <p class="f-hero-description">围绕岗位跨渠道找人，整理身份、经历与匹配依据。<br />关联公司、岗位和专业成果，让研究持续积累，把关键判断留给你。</p>
            <div class="f-hero-actions">${trial ? ui.button("申请试用", "#apply") + ui.button("看工作示例", "#work", true) : ui.button("看工作示例", "#work")}</div>
          </div>
        </div>
      </section>

      <section class="f-work" id="work" tabindex="-1" aria-labelledby="f-work-title">
        <div class="f-container">
          <div class="f-work-intro">
            <h2 id="f-work-title">从找人到找机会，<br />把工作接起来。</h2>
            <p>一个岗位、一家目标公司或一位候选人，都可以成为工作的起点。</p>
            <p>HunterBuddy 沿着你的目标查找资料、关联人物与公司，把分散的信息整理成有依据的人选、客户线索、人才版图和岗位机会。</p>
          </div>
          <div class="f-work-demo">
            <div class="f-tabs" role="tablist" aria-label="猎头工作示例">
              ${data.works.map((work, index) => `<button type="button" class="f-tab" id="f-work-tab-${work.id}" role="tab" aria-selected="${index === 0}" aria-controls="f-work-panel" tabindex="${index === 0 ? 0 : -1}">${e(work.label)}</button>`).join("")}
            </div>
            <div class="f-work-panel" id="f-work-panel" role="tabpanel" tabindex="0" aria-labelledby="f-work-tab-${e(data.works[0].id)}"></div>
            <div class="f-work-bottom">
              <button type="button" class="f-text-link" data-evidence>查看研究依据 ${ui.icon("chevronRight")}</button>
            </div>
          </div>
        </div>
      </section>

      ${
        integrated
          ? chapters.markup(research, "research", {
              embedded: true,
              presentation: "carousel",
            })
          : `<section class="f-process" id="research" tabindex="-1" aria-labelledby="f-research-title">
        <div class="f-container">
          <div class="f-process-heading">
            <h2 id="f-research-title">看得更清楚，<br />走得更从容。</h2>
            <p>研究不只是一份名单。每条线索的来由、每个尚未确认的问题，都和下一步一起留下。</p>
          </div>
          <div class="f-process-grid">
            <figure class="f-process-visual">
              <div class="f-process-photo"><img src="assets/research-detail.webp" alt="猎头用蓝色笔核对三份人选资料，纸张与研究笔记整齐排列" width="1586" height="992" loading="lazy" /></div>
              <figcaption class="f-process-caption"><strong data-step-caption>看见线索</strong><span data-step-detail>市场变化与已有资料</span></figcaption>
            </figure>
            <div class="f-process-steps">
              <span class="f-process-rail" aria-hidden="true"><span></span></span>
              ${data.process.map((step, index) => `<article class="f-process-step${index === 0 ? " is-current" : ""}" data-step="${index}"><h3>${e(step.title)}</h3><p>${e(step.copy)}</p></article>`).join("")}
            </div>
          </div>
        </div>
      </section>`
      }

      <section class="f-memory" aria-labelledby="f-memory-title">
        <div class="f-container">
          <h2 id="f-memory-title">做过的研究，<br />不必从头再来。</h2>
          <p>不只是保存五类资料，更把职业经历、招聘需求、人物角色与技术成果连在一起。<br />找信息、找人、找岗位，都能从已有研究继续出发。</p>
          ${network.render(data.resources, data.assetNetwork, { layout: "split" })}
        </div>
      </section>

      <section class="f-about" id="about" tabindex="-1" aria-labelledby="f-about-title">
        <div class="f-container">
          <div class="f-about-copy">
            <h2 id="f-about-title">铂寻，<wbr />为猎头化繁解难</h2>
            <p>铂寻为独立猎头与精品团队打造 HunterBuddy。</p>
            <p>我们希望 AI 承接繁琐的资料查找与整理，让猎头把更多时间留给理解客户、判断人才和建立信任。</p>
            <p>工具连接信息，专业判断与人与人的沟通，始终由你掌握。</p>
          </div>
        </div>
        <figure class="f-about-image"><img src="assets/human-conversation.webp" alt="自然光下，亚洲猎头与专业人士认真讨论资料" width="1916" height="821" loading="lazy" /></figure>
      </section>

      ${
        trial
          ? trial.render()
          : `<section class="f-closing" aria-labelledby="f-closing-title">
        <div class="f-container">
          <h2 id="f-closing-title">把时间，留给真正重要的人。</h2>
          <p>从更清楚的研究，走向下一次值得的沟通。</p>
          ${ui.button("登录 HunterBuddy", data.loginUrl)}
        </div>
      </section>`
      }
    </main>`;

  if (trial) trial.mount(root.querySelector("#apply"));
  if (integrated)
    chapters.mount(root.querySelector("[data-research-chapters]"), research);

  // Replacing the fallback changes fragment positions; restore the current target after layout.
  if (integrated)
    addEventListener(
      "load",
      () => {
        let id;
        try {
          id = decodeURIComponent(location.hash.slice(1));
        } catch {
          return;
        }
        const target = document.getElementById(id);
        if (target && root.contains(target))
          target.scrollIntoView({ behavior: "instant", block: "start" });
      },
      { once: true },
    );

  let activeWork = 0;
  let panelAnimation = null;
  const panel = root.querySelector(".f-work-panel");
  const dialog = ui.createDialog();

  function resultMarkup(work) {
    const title = `<div class="f-result-title"><h4>${e(work.subject)}</h4></div>`;
    if (work.type === "organization") {
      return `${title}<table class="f-roles"><thead><tr><th>团队</th><th>关键岗位</th><th>当前线索</th></tr></thead><tbody>${work.rows.map((row) => `<tr><td data-label="团队">${e(row.title)}</td><td data-label="关键岗位">${e(row.label)}</td><td data-label="当前线索">${e(row.copy)}</td></tr>`).join("")}</tbody></table>`;
    }
    if (work.type === "people") {
      return `${title}<ul class="f-result-list f-people-list">${work.rows.map((row) => `<li><div><strong>${e(row.title)}</strong><small>${e(row.label)}</small></div><div class="f-person-evidence"><p>推荐依据：${e(row.copy)}</p>${row.followUp ? `<p>仍需了解：${e(row.followUp)}</p>` : ""}</div></li>`).join("")}</ul>`;
    }
    return `${title}<ul class="f-result-list">${work.rows.map((row) => `<li><small>${e(row.label)}</small><strong>${e(row.title)}</strong><p>${e(row.copy)}</p></li>`).join("")}</ul>`;
  }

  function workMarkup(work) {
    return `<div class="f-work-lead"><p class="f-work-context">${e(work.context)}</p><h3>${e(work.headline)}</h3><p>${e(work.description)}</p>${work.descriptionDetail ? `<p>${e(work.descriptionDetail)}</p>` : ""}</div><div class="f-result">${resultMarkup(work)}</div>`;
  }

  function renderWork(index) {
    activeWork = index;
    const work = data.works[index];
    panelAnimation?.cancel();
    panel.innerHTML = workMarkup(work);
    if (!reduced.matches) {
      panelAnimation = panel.animate(
        [
          { opacity: 0.35, transform: "translateY(6px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 380, easing: "cubic-bezier(0.22, 0.75, 0.25, 1)" },
      );
    }
  }

  ui.mountNavigation(root.querySelector(".f-header"));
  ui.mountTabs(root.querySelector(".f-tabs"), panel, renderWork);
  ui.mountStablePanel(panel, data.works.map(workMarkup));
  network.mount(
    root.querySelector(".f-asset-network"),
    data.resources,
    data.assetNetwork,
  );

  root.querySelector("[data-evidence]").addEventListener("click", (event) => {
    const work = data.works[activeWork];
    const sources = work.evidence
      .map(
        (source) =>
          `<li><strong>${e(source.title)}</strong><p>${e(source.copy)}</p></li>`,
      )
      .join("");
    const questions = work.questions
      .map((question) => `<li><p>${e(question)}</p></li>`)
      .join("");
    dialog.open(
      `${work.label} · 研究依据`,
      `<h3>来源与判断</h3><ul class="f-evidence-list">${sources}</ul><h3>仍需核实</h3><ul class="f-evidence-list">${questions}</ul>`,
      event.currentTarget,
    );
  });

  const steps = [...root.querySelectorAll(".f-process-step")];
  let stepObserver;
  const updateStep = () => {
    const probe = innerHeight * 0.35;
    const distance = (step) => {
      const bounds = step.getBoundingClientRect();
      return Math.max(bounds.top - probe, probe - bounds.bottom, 0);
    };
    const current = steps.reduce((nearest, step) =>
      distance(step) < distance(nearest) ? step : nearest,
    );
    const index = Number(current.dataset.step);
    steps.forEach((step) =>
      step.classList.toggle("is-current", step === current),
    );
    root.querySelector("[data-step-caption]").textContent =
      data.process[index].caption;
    root.querySelector("[data-step-detail]").textContent =
      data.process[index].detail;
  };
  const observeSteps = () => {
    stepObserver?.disconnect();
    // A narrow reading band makes the same step authoritative in both scroll directions.
    const top = Math.floor(innerHeight * 0.34);
    const bottom = Math.floor(innerHeight * 0.62);
    stepObserver = new IntersectionObserver(updateStep, {
      rootMargin: `-${top}px 0px -${bottom}px 0px`,
      threshold: 0,
    });
    steps.forEach((step) => stepObserver.observe(step));
    updateStep();
  };
  if (steps.length) {
    observeSteps();
    addEventListener("resize", observeSteps);
  }

  const hero = root.querySelector(".f-hero");
  const pointer = root.querySelector(".f-hero-pointer");
  let heroVisible = true;
  let frameId = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;

  function resetPointer() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    x = y = targetX = targetY = 0;
    pointer.style.setProperty("--f-pointer-x", "0px");
    pointer.style.setProperty("--f-pointer-y", "0px");
  }

  function frame() {
    if (reduced.matches || !fine.matches || !heroVisible || document.hidden)
      return resetPointer();
    x += (targetX - x) * 0.085;
    y += (targetY - y) * 0.085;
    pointer.style.setProperty("--f-pointer-x", `${x.toFixed(2)}px`);
    pointer.style.setProperty("--f-pointer-y", `${y.toFixed(2)}px`);
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.035) {
      frameId = requestAnimationFrame(frame);
    } else {
      frameId = 0;
    }
  }

  function requestFrame() {
    if (!frameId) frameId = requestAnimationFrame(frame);
  }

  hero.addEventListener("pointermove", (event) => {
    if (reduced.matches || !fine.matches || event.pointerType === "touch")
      return;
    const bounds = hero.getBoundingClientRect();
    targetX = -((event.clientX - bounds.left) / bounds.width - 0.5) * 20;
    targetY = -((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
    requestFrame();
  });

  hero.addEventListener("pointerleave", () => {
    targetX = targetY = 0;
    requestFrame();
  });

  new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.isIntersecting;
      root.classList.toggle("f-motion-paused", !heroVisible || document.hidden);
      if (!heroVisible) resetPointer();
    },
    { threshold: 0.01 },
  ).observe(hero);

  const syncMotion = () => {
    panelAnimation?.cancel();
    resetPointer();
  };
  reduced.addEventListener("change", syncMotion);
  fine.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", () => {
    root.classList.toggle("f-motion-paused", document.hidden || !heroVisible);
    if (document.hidden) resetPointer();
  });
})();
