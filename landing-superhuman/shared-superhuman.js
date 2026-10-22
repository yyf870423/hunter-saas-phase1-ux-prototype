(() => {
  const ui = window.FinesseUI;
  if (!ui) return;
  function opening() {
    return `<a class="f-skip" href="#main">跳到正文</a>
    <span class="f-header-sentinel" aria-hidden="true"></span>
    <header class="f-header"><div class="f-container f-header-inner">
      <a href="#main" aria-label="铂寻 Boseek 首页">${ui.brand(true)}</a>
      <nav class="f-nav" id="f-navigation" aria-label="主导航"><a href="#work">业务场景</a><a href="#research">决策支持</a><a href="#about">关于铂寻</a></nav>
      <div class="f-header-actions">${ui.button("申请试用", "#apply")}${ui.iconButton("menu", "打开导航", 'data-menu-toggle aria-controls="f-navigation" aria-expanded="false" hidden')}</div>
    </div></header>
    <main id="main" tabindex="-1">
      <section class="sh-hero" aria-labelledby="sh-hero-title">
        <img class="sh-hero-photo" src="assets/hero-ai-human.webp" width="1600" height="901" alt="AI 协作概念摄影：猎头面向相互关联的数字研究层，审阅信息而非整理纸质文件" fetchpriority="high">
        <div class="f-container sh-hero-inner"><div class="sh-hero-copy text-ink-charcoal">
          <h1 class="sh-brand-title" id="sh-hero-title" lang="en">HunterBuddy</h1>
          <p class="sh-position">猎头的 AI 工作伙伴</p>
          <p class="sh-hero-description">围绕岗位跨渠道找人，整理身份、经历与匹配依据。</p>
          <p class="sh-hero-description">关联公司、岗位和专业成果，让研究持续积累，把关键判断留给你。</p>
          <div class="sh-hero-actions">${ui.button("申请试用", "#apply")}<span class="sh-status">即将上线</span></div>
        </div></div>
        <aside class="sh-excerpt sh-excerpt--request" aria-label="岗位要求摘录"><strong>${ui.icon("file")}岗位要求</strong><p>视觉算法负责人</p></aside>
        <aside class="sh-excerpt sh-excerpt--evidence" aria-label="AI 研究依据摘录"><strong>${ui.icon("link")}匹配依据</strong><p>资料来源与待确认条件</p></aside>
      </section>`;
  }
  function workIntroduction() {
    return `<section class="sh-section sh-work" id="work" tabindex="-1" aria-labelledby="sh-work-title"><div class="f-container">
      <h2 id="sh-work-title">从找人到找机会，<br>把工作接起来。</h2>
      <p class="sh-intro">一个岗位、一家目标公司或一位候选人，都可以成为工作的起点。</p>
      <p class="sh-intro">HunterBuddy 沿着你的目标查找资料、关联人物与公司，把分散的信息整理成有依据的人选、客户线索、人才版图和岗位机会。</p>
    </div></section>`;
  }
  const e = ui.escape;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  function result(work) {
    const heading = `<div class="sh-result-heading"><h4>${e(work.subject)}</h4></div>`;
    let body;
    if (work.type === "organization") {
      body = `<table class="sh-roles"><thead><tr><th>团队</th><th>关键岗位</th><th>当前线索</th></tr></thead><tbody>${work.rows.map((row) => `<tr><td data-label="团队">${e(row.title)}</td><td data-label="关键岗位">${e(row.label)}</td><td data-label="当前线索">${e(row.copy)}</td></tr>`).join("")}</tbody></table>`;
    } else {
      body = `<ul class="sh-result-rows${work.type === "people" ? " sh-result-people" : ""}">${work.rows.map((row) => `<li><div><strong>${e(row.title)}</strong><span>${e(row.label)}</span></div><div><p>${work.type === "people" ? "推荐依据：" : ""}${e(row.copy)}</p>${row.followUp ? `<p class="sh-follow-up">仍需了解：${e(row.followUp)}</p>` : ""}</div></li>`).join("")}</ul>`;
    }
    return `<article class="sh-result">${heading}${body}<p class="sh-example-note">研究摘录 · 示例数据</p></article>`;
  }

  function workPanel(work) {
    return `<div class="sh-work-lead"><h3>${e(work.headline).replace("，", "，<br>")}</h3><p>${e(work.description)}</p><p>${e(work.descriptionDetail)}</p><p class="sh-context">${e(work.context)}</p></div>${result(work)}`;
  }

  function work(data) {
    const tabs = data.works
      .map(
        (item, index) =>
          `<button class="f-tab" type="button" id="sh-work-tab-${e(item.id)}" role="tab" aria-selected="${index === 0}" aria-controls="sh-work-panel" tabindex="${index === 0 ? 0 : -1}">${ui.icon({ search: "target", opportunity: "building", mapping: "users", career: "briefcase" }[item.id])}<span>${e(item.label)}</span></button>`,
      )
      .join("");
    return workIntroduction().replace(
      "</div></section>",
      `<div class="f-tabs sh-work-tabs" role="tablist" aria-label="猎头业务场景">${tabs}</div><div class="sh-work-panel" id="sh-work-panel" role="tabpanel" aria-labelledby="sh-work-tab-search" tabindex="0">${workPanel(data.works[0])}</div><div class="sh-work-bottom"><button type="button" class="f-text-link" data-evidence>查看研究依据 ${ui.icon("chevronRight")}</button></div></div></section>`,
    );
  }

  function researchCase(data, index) {
    const source = data.evidence;
    const body =
      index === 0
        ? `<div class="sh-citation"><h4>${e(source[0].title)}</h4><p>${e(source[0].copy)}</p></div><div class="sh-citation"><h4>${e(data.person.title)} · ${e(data.person.label)}</h4><p>${e(data.person.copy)}</p></div><div class="sh-citation"><h4>${e(source[1].title)}</h4><p>${e(source[1].copy)}</p></div>`
        : index === 1
          ? `<dl class="sh-gaps">${data.gaps.map((gap) => `<div><dt>${e(gap.title)}</dt><dd>${e(gap.state)}</dd></div>`).join("")}</dl>`
          : `<ul class="sh-review-questions">${data.questions.map((question) => `<li>${e(question)}</li>`).join("")}</ul>`;
    return `<h4 class="sh-case-title">${e(data.phases[index].detail)}</h4>${body}<p class="sh-example-note">${e(data.context)} · 示例数据</p>`;
  }

  function research(data) {
    return `<section class="sh-section sh-research" id="research" tabindex="-1" aria-labelledby="sh-research-title"><div class="f-container">
      <div class="sh-research-heading"><h2 id="sh-research-title">${data.title.map(e).join("<br>")}</h2><div>${data.introduction.map((copy) => `<p class="sh-intro">${e(copy)}</p>`).join("")}</div></div>
      <div class="sh-research-carousel" data-research-chapters data-presentation="carousel" data-chapter="0" aria-roledescription="轮播"><div class="p-stage"><div class="p-photo sh-research-track" id="sh-research-slides">${data.phases.map((phase, index) => `<article class="p-slide sh-research-slide sh-research-layout${index === 0 ? " is-current" : ""}" data-chapter-slide="${index}" aria-labelledby="sh-research-chapter-${index}"><div class="sh-chapter"><h3 id="sh-research-chapter-${index}">${phase.titleLines.map(e).join("<br>")}</h3><p>${e(phase.copy)}</p></div><div class="sh-research-case" aria-label="研究依据示意">${researchCase(data, index)}</div></article>`).join("")}</div>
      <div class="p-carousel-controls" role="group" aria-label="研究章节切换" hidden>${ui.iconButton("chevronLeft", "上一张", 'data-carousel-previous aria-controls="sh-research-slides"')}${ui.iconButton("chevronRight", "下一张", 'data-carousel-next aria-controls="sh-research-slides"')}</div></div></div>
    </div></section>`;
  }

  function memory(data, ledger) {
    return `<section class="sh-section sh-memory" id="memory" tabindex="-1" aria-labelledby="f-memory-title"><div class="f-container"><h2 id="f-memory-title">做过的研究，<br>不必从头再来。</h2><p class="sh-intro sh-memory-intro">不只是保存五类资料，更把职业经历、招聘需求、人物角色与技术成果连在一起。<br>找信息、找人、找岗位，都能从已有研究继续出发。</p>${ledger.render(data.resources, data.assetNetwork)}</div></section>`;
  }

  function about() {
    return `<section class="sh-section sh-about" id="about" tabindex="-1" aria-labelledby="sh-about-title"><div class="f-container sh-about-copy"><h2 id="sh-about-title">铂寻，<br>为猎头化繁解难</h2><div><p class="sh-intro">铂寻为独立猎头与精品团队打造 HunterBuddy。</p><p class="sh-intro">我们希望 AI 承接繁琐的资料查找与整理，让猎头把更多时间留给理解客户、判断人才和建立信任。</p><p class="sh-intro">工具连接信息，专业判断与人与人的沟通，始终由你掌握。</p></div></div><figure class="sh-about-photo"><img src="assets/about-ai-human.webp" width="1600" height="800" loading="lazy" alt="AI 协作概念摄影：数字研究层在背景提供支持，两位专业人士专注于交流和判断"></figure></section>`;
  }

  function footer() {
    return `<footer class="sh-footer" id="footer"><div class="f-container"><div class="sh-footer-top"><div class="sh-footer-brand"><span class="f-brand"><img src="assets/boseek-wordmark-dark.svg" alt="Boseek 铂寻" width="187" height="187" loading="lazy"></span><p>HunterBuddy，猎头的 AI 工作伙伴。</p><p>铂寻为独立猎头与精品团队打造。</p></div><div class="sh-footer-group"><h2>产品</h2><ul><li>产品博客</li><li>产品路线图</li><li>用户社区</li></ul></div><div class="sh-footer-group"><h2>法律</h2><ul><li>隐私政策</li><li>服务条款</li><li>数据处理协议</li></ul></div><div class="sh-footer-contact"><p class="sh-latin">www.boseeksi.com</p><p>联系邮箱：待补充</p></div></div><div class="sh-footer-bottom"><p>© <span data-footer-year>2026</span> 铂寻 Boseek</p><ul aria-label="网站主体与备案信息"><li>网站主体：北京铂寻智能科技有限公司</li><li>ICP 备案号：待补充</li><li>公安备案号：待补充</li></ul></div></div></footer>`;
  }

  function render(data, researchData, ledger, trial) {
    return (
      opening() +
      work(data) +
      research(researchData) +
      memory(data, ledger) +
      about() +
      trial.render() +
      "</main>" +
      footer()
    );
  }

  function mount(root, data, researchData, ledger, trial) {
    let current = 0;
    let workAnimation;
    const panel = root.querySelector("#sh-work-panel");
    const dialog = ui.createDialog();
    ui.mountTabs(root.querySelector(".sh-work-tabs"), panel, (index) => {
      current = index;
      workAnimation?.cancel();
      panel.innerHTML = workPanel(data.works[index]);
      if (!reduced.matches)
        workAnimation = panel.animate(
          [
            { transform: "translateX(18px)", clipPath: "inset(0 0 0 1%)" },
            { transform: "translateX(0)", clipPath: "inset(0 0 0 0)" },
          ],
          { duration: 320, easing: "cubic-bezier(.16,1,.3,1)" },
        );
    });
    ui.mountStablePanel(panel, data.works.map(workPanel));
    root.querySelector("[data-evidence]").addEventListener("click", (event) => {
      const item = data.works[current];
      dialog.open(
        `${item.label} · 研究依据`,
        `<h3>来源与判断</h3><ul class="f-evidence-list">${item.evidence.map((source) => `<li><strong>${e(source.title)}</strong><p>${e(source.copy)}</p></li>`).join("")}</ul><h3>仍需核实</h3><ul class="f-evidence-list">${item.questions.map((question) => `<li><p>${e(question)}</p></li>`).join("")}</ul>`,
        event.currentTarget,
      );
    });
    const carousel = root.querySelector(".sh-research-carousel");
    const controller = window.FinesseResearchChapters.mount(carousel, null, {
      photoErrors: false,
      label: "研究章节，空格暂停或继续自动轮播",
    });
    let touch;
    carousel.addEventListener("pointerdown", (event) => {
      touch =
        event.pointerType === "touch" ? [event.clientX, event.clientY] : null;
    });
    carousel.addEventListener("pointercancel", () => {
      touch = null;
    });
    carousel.addEventListener("pointerup", (event) => {
      if (!touch) return;
      const [x, y] = touch;
      touch = null;
      const distance = event.clientX - x;
      if (
        Math.abs(distance) < 48 ||
        Math.abs(distance) < Math.abs(event.clientY - y) * 1.2
      )
        return;
      const direction = distance < 0 ? 1 : -1;
      controller.select(
        (Number(carousel.dataset.chapter) + direction + 3) % 3,
        direction,
      );
    });
    addEventListener("pagehide", () => controller.destroy(), { once: true });
    ledger.mount(
      root.querySelector(".sh-ledger"),
      data.resources,
      data.assetNetwork,
    );
    trial.mount(root.querySelector("#apply"));
    ui.mountNavigation(root.querySelector(".f-header"));
    root.querySelector("[data-footer-year]").textContent =
      new Date().getFullYear();
    root.dataset.superhumanMounted = "true";
    addEventListener(
      "load",
      () => {
        const target = document.getElementById(location.hash.slice(1));
        if (target && root.contains(target))
          target.scrollIntoView({ behavior: "instant", block: "start" });
      },
      { once: true },
    );
  }

  window.SuperhumanHomepage = {
    opening,
    workIntroduction,
    render,
    mount,
    workPanel,
    researchCase,
  };
})();
