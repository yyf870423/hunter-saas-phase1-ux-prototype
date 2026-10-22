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
  const html = ui.localizeHTML || ((value) => value);
  const e = ui.escape;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

  root.innerHTML = html(`
    <a class="f-skip" href="#main">跳到正文</a>
    <span class="f-header-sentinel" aria-hidden="true"></span>
    <header class="f-header">
      <div class="f-container f-header-inner">
        <a href="#main" aria-label="铂寻 Boseek 首页">${ui.brand()}</a>
        <nav class="f-nav" id="f-navigation" aria-label="主导航">
          <a href="#film">产品短片</a>
          <a href="#work">能做什么</a>
          <a href="#research">工作方式</a>
          <a href="#assets">人和关系</a>
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
            ${trial ? '<p class="f-coming-soon">正在开发中，邀请制试用申请已开放</p>' : ""}
            <p class="f-hero-statement">猎头的 AI 工作伙伴</p>
            <p class="f-hero-description">一条融资新闻、一份旧简历、一次主页变动，连起来就是下一个机会。<br class="bd" />HunterBuddy 替你找线索、连关系，联系谁、何时开口，你说了算。</p>
            <div class="f-hero-actions">${trial ? ui.button("申请试用", "#apply") + ui.button("看看能做什么", "#work", true) : ui.button("看看能做什么", "#work")}</div>
          </div>
        </div>
      </section>

      <section class="f-work" id="work" tabindex="-1" aria-labelledby="f-work-title">
        <div class="f-container">
          <div class="f-work-intro">
            <h2 id="f-work-title"><span class="ln">猎头每天在做的四件事，</span><br /><span class="ln">它都能帮上忙。</span></h2>
            <p>下面用星川机器人这一家公司，把四件事走一遍。</p>
            <p>做猎头不只是找人：先要发现谁在招，再摸清对方的团队，然后找到合适的人。手上的候选人想动了，还要帮他找下一个机会。</p>
          </div>
          <div class="f-work-demo">
            <div class="f-tabs" role="tablist" aria-label="四件事">
              ${data.works.map((work, index) => `<button type="button" class="f-tab" id="f-work-tab-${work.id}" role="tab" aria-selected="${index === 0}" aria-controls="f-work-panel" tabindex="${index === 0 ? 0 : -1}">${e(work.label)}</button>`).join("")}
            </div>
            <div class="f-work-panel" id="f-work-panel" role="tabpanel" tabindex="0" aria-labelledby="f-work-tab-${e(data.works[0].id)}"></div>
            <div class="f-work-bottom">
              <button type="button" class="f-text-link" data-evidence>查看结果和来源 ${ui.icon("chevronRight")}</button>
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
            <h2 id="f-research-title"><span class="ln">理由和来源写在一起，</span><br /><span class="ln">拿不准的单独列出来。</span></h2>
            <p>每个判断都写着从哪来，没查到的不会被当成事实。联系谁、怎么说，还是由你来定。</p>
          </div>
          <div class="f-process-grid">
            <figure class="f-process-visual">
              <div class="f-process-photo"><img src="assets/research-detail.webp" alt="猎头用蓝色笔核对三份人选资料，纸张与研究笔记整齐排列" width="1586" height="992" loading="lazy" /></div>
              <figcaption class="f-process-caption"><strong data-step-caption>看见线索</strong><span data-step-detail>新动向和手上的资料</span></figcaption>
            </figure>
            <div class="f-process-steps">
              <span class="f-process-rail" aria-hidden="true"><span></span></span>
              ${data.process.map((step, index) => `<article class="f-process-step${index === 0 ? " is-current" : ""}" data-step="${index}"><h3>${e(step.title)}</h3><p>${e(step.copy)}</p></article>`).join("")}
            </div>
          </div>
        </div>
      </section>`
      }

      <section class="f-memory" id="assets" tabindex="-1" aria-labelledby="f-memory-title">
        <div class="f-container">
          <h2 id="f-memory-title"><span class="ln"><span class="ph">查过的人和公司</span><span class="ph">都存下来了，</span></span><br /><span class="ln"><span class="ph">谁和谁是什么关系，</span><span class="ph">也存下来了。</span></span></h2>
          <p>四件事查过的公司、岗位和人，都存下来了。谁在哪家公司待过、谁和谁一起写过论文、谁能帮你引荐谁，这些关系也都存着。资料一更新，这些关系和匹配也跟着更新，没确认的会一直标着“待确认”。</p>
          ${network.render(data.resources, data.assetNetwork, { layout: "split" })}
        </div>
      </section>

      <section class="f-about" id="about" tabindex="-1" aria-labelledby="f-about-title">
        <div class="f-container">
          <div class="f-about-copy">
            <h2 id="f-about-title"><span class="ln">铂寻，</span><wbr /><span class="ln">为猎头化繁解难</span></h2>
            <p>猎头最值钱的时间，应该花在理解客户、判断人才和建立信任上，而不是一页页翻资料。</p>
            <p>铂寻为独立猎头和资深顾问打造 HunterBuddy，让 AI 承接繁琐的查找与整理，把这些时间还给你。</p>
            <p>工具负责连接信息，专业判断与人与人的沟通，始终由你掌握。</p>
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
    </main>`);

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
      return `${title}<ul class="f-result-list f-people-list">${work.rows.map((row) => `<li><div><strong>${e(row.title)}</strong><small>${e(row.label)}</small></div><div class="f-person-evidence"><p>为什么合适：${e(row.copy)}</p>${row.followUp ? `<p>待确认：${e(row.followUp)}</p>` : ""}</div></li>`).join("")}</ul>`;
    }
    return `${title}<ul class="f-result-list">${work.rows.map((row) => `<li><small>${e(row.label)}</small><strong>${e(row.title)}</strong><p>${e(row.copy)}</p></li>`).join("")}</ul>`;
  }

  function workMarkup(work) {
    return `<div class="f-work-lead"><p class="f-work-context">${e(work.context)}</p><h3>${work.headline.split(/(?<=，)/).map((part) => `<span class="ph">${e(part)}</span>`).join("")}</h3><p>${e(work.description)}</p>${work.descriptionDetail ? `<p>${e(work.descriptionDetail)}</p>` : ""}</div><div class="f-result">${resultMarkup(work)}</div>`;
  }

  function renderWork(index) {
    activeWork = index;
    const work = data.works[index];
    panelAnimation?.cancel();
    panel.innerHTML = html(workMarkup(work));
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

  ui.mountNavigation(root.querySelector(".f-header"), {
    breakpoint: window.FinesseLocale?.language === "en" ? 1000 : 800,
  });
  const workTabs = ui.mountTabs(root.querySelector(".f-tabs"), panel, renderWork);

  /* the four tabs step through by themselves (a thin line under the open tab fills as its turn runs out);
     clicking a tab jumps straight to it and the rotation carries on from there. Pointing the mouse at the
     panel holds it while you read. Reduced motion stays manual. A page can opt out with data-still-tabs. */
  if (!root.hasAttribute("data-still-tabs")) {
    const DWELL = 9000;
    const tabList = root.querySelector(".f-work-demo .f-tabs");
    const tabButtons = [...tabList.querySelectorAll("[role='tab']")];
    let elapsed = 0, last = 0, visible = false, looping = false, reading = false;
    const setP = () => tabButtons.forEach((t, i) => t.style.setProperty("--p", i === activeWork ? Math.min(1, elapsed / DWELL).toFixed(4) : 0));
    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!reduced.matches && !reading && !document.hidden) {
        elapsed += dt;
        if (elapsed >= DWELL) {
          elapsed = 0;
          workTabs.select((activeWork + 1) % tabButtons.length);
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
    tabButtons.forEach((tab) => tab.addEventListener("click", restart));
    tabList.addEventListener("keydown", restart);
    panel.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") reading = true; });
    panel.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") reading = false; });
  }
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
      `${work.label} · 结果和来源`,
      `<h3>交给你的结果</h3><ul class="f-evidence-list">${sources}</ul><h3>还要你确认</h3><ul class="f-evidence-list">${questions}</ul>`,
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
