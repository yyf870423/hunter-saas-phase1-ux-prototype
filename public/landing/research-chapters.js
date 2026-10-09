(() => {
  const ui = window.FinesseUI;
  if (!ui) return;
  const { escape: e } = ui;

  function copyMarkup(chapter, titleId, tag = "h2") {
    return `<${tag} id="${e(titleId)}">${chapter.titleLines.map((line) => `<span>${e(line)}</span>`).join("")}</${tag}><p>${e(chapter.copy)}</p>`;
  }

  function markup(
    data,
    id = "research-chapters",
    { embedded = false, presentation = "scroll" } = {},
  ) {
    const tag = embedded ? "h2" : "h1";
    const carousel = presentation === "carousel";
    const controls = carousel
      ? `<div class="p-carousel-controls" aria-label="研究图片切换" role="group" hidden>${ui.iconButton("chevronLeft", "上一张", `data-carousel-previous aria-controls="${e(id)}-photos"`)}${ui.iconButton("chevronRight", "下一张", `data-carousel-next aria-controls="${e(id)}-photos"`)}</div>`
      : "";
    return `<section class="p-research${carousel ? " p-carousel" : ""}" ${embedded ? `id="${e(id)}" tabindex="-1"` : ""} data-research-chapters data-presentation="${carousel ? "carousel" : "scroll"}" data-chapter="0" aria-labelledby="${e(id)}-title"${carousel ? ' aria-roledescription="轮播"' : ""}>
      <div class="f-container p-container">
        <header class="p-intro"><${tag} id="${e(id)}-title">${data.title.map((line) => `<span>${e(line)}</span>`).join("")}</${tag}><p>${data.introduction.map(e).join("<br />")}</p></header>
        <div class="p-runway">
          <div class="p-stage" id="reading">
            <div class="p-photo" id="${e(id)}-photos">${data.chapters.map((chapter, index) => `<article class="p-slide${index === 0 ? " is-current" : ""}" data-chapter-slide="${index}" aria-labelledby="${e(id)}-chapter-${index}"><img data-chapter-photo="${index}" src="${e(chapter.photo.src)}" alt="${e(chapter.photo.alt)}" style="object-position:${e(chapter.photo.position)}" width="1672" height="941" decoding="async" /><div class="p-copy">${copyMarkup(chapter, `${id}-chapter-${index}`, embedded ? "h3" : "h2")}</div><p class="p-photo-error" role="status" hidden>图片暂时无法加载，文字仍可阅读</p></article>`).join("")}</div>
            ${controls}
          </div>
        </div>
      </div>
    </section>`;
  }

  function mountPhotoErrors(slides) {
    slides.forEach((slide) => {
      const image = slide.querySelector("[data-chapter-photo]");
      const fail = () => {
        image.dataset.failed = "true";
        slide.querySelector(".p-photo-error").hidden = false;
        slide.classList.add("has-photo-error");
      };
      image.addEventListener("error", fail);
      if (image.complete && image.naturalWidth === 0) fail();
    });
  }

  function mountCarousel(root) {
    const stage = root.querySelector(".p-stage");
    const photo = root.querySelector(".p-photo");
    const controls = root.querySelector(".p-carousel-controls");
    const slides = [...root.querySelectorAll("[data-chapter-slide]")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const events = new AbortController();
    const options = { signal: events.signal };
    let selected = -1;
    let timer;
    let visible = false;
    let hovered = false;
    let focused = false;
    let pausedByUser = false;
    let requested = !reduced.matches;
    let transition = 0;

    function schedule() {
      clearTimeout(timer);
      const paused = !requested || hovered || focused || pausedByUser;
      const playing = !paused && visible && !document.hidden;
      root.dataset.playback = paused
        ? "paused"
        : playing
          ? "playing"
          : "waiting";
      photo.setAttribute("aria-live", playing ? "off" : "polite");
      if (playing)
        timer = setTimeout(() => {
          select((selected + 1) % slides.length, 1);
          schedule();
        }, 5000);
    }

    function select(index, direction = index > selected ? 1 : -1) {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= slides.length ||
        selected === index
      )
        return;
      const previous = selected;
      const currentTransition = ++transition;
      selected = index;
      root.dataset.chapter = String(index);
      slides.forEach((slide, slideIndex) => {
        slide.getAnimations().forEach((animation) => animation.cancel());
        slide.classList.toggle("is-current", slideIndex === index);
        slide.classList.remove("is-outgoing");
        slide.inert = slideIndex !== index;
        slide.setAttribute("aria-hidden", String(slideIndex !== index));
      });
      if (previous < 0 || reduced.matches) return;
      slides[previous].classList.add("is-outgoing");
      const timing = { duration: 650, easing: "cubic-bezier(.16,1,.3,1)" };
      const arrival = slides[index].animate(
        [
          { transform: `translateX(${direction * 100}%)` },
          { transform: "translateX(0)" },
        ],
        timing,
      );
      slides[previous].animate(
        [
          { transform: "translateX(0)" },
          { transform: `translateX(${-direction * 100}%)` },
        ],
        timing,
      );
      arrival.finished
        .then(() => {
          if (transition === currentTransition)
            slides.forEach((slide) => slide.classList.remove("is-outgoing"));
        })
        .catch(() => {});
    }

    function manual(index, direction) {
      select(index, direction);
      schedule();
    }

    root.classList.add("p-carousel-ready");
    controls.hidden = false;
    stage.tabIndex = 0;
    stage.setAttribute("role", "group");
    stage.setAttribute("aria-label", "研究图片，空格暂停或继续自动轮播");
    stage.setAttribute("aria-keyshortcuts", "Space");
    mountPhotoErrors(slides);
    select(0);
    schedule();
    root
      .querySelector("[data-carousel-previous]")
      .addEventListener(
        "click",
        () => manual((selected - 1 + slides.length) % slides.length, -1),
        options,
      );
    root
      .querySelector("[data-carousel-next]")
      .addEventListener(
        "click",
        () => manual((selected + 1) % slides.length, 1),
        options,
      );
    stage.addEventListener(
      "focusin",
      (event) => {
        focused = event.target.matches(":focus-visible");
        schedule();
      },
      options,
    );
    stage.addEventListener(
      "focusout",
      (event) => {
        if (stage.contains(event.relatedTarget)) return;
        focused = false;
        schedule();
      },
      options,
    );
    stage.addEventListener(
      "pointerdown",
      () => {
        focused = false;
        schedule();
      },
      options,
    );
    stage.addEventListener(
      "keydown",
      (event) => {
        focused = true;
        schedule();
        const direction =
          event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (direction) {
          event.preventDefault();
          manual(
            (selected + direction + slides.length) % slides.length,
            direction,
          );
        } else if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          manual(event.key === "Home" ? 0 : slides.length - 1);
        } else if (event.key === " " && event.target === stage) {
          event.preventDefault();
          pausedByUser = !pausedByUser;
          schedule();
        }
      },
      options,
    );
    stage.addEventListener(
      "pointerenter",
      (event) => {
        if (event.pointerType === "touch") return;
        hovered = true;
        schedule();
      },
      options,
    );
    stage.addEventListener(
      "pointerleave",
      () => {
        hovered = false;
        schedule();
      },
      options,
    );
    document.addEventListener("visibilitychange", schedule, options);
    reduced.addEventListener(
      "change",
      () => {
        requested = !reduced.matches;
        if (reduced.matches)
          slides.forEach((slide) => {
            slide.getAnimations().forEach((animation) => animation.cancel());
            slide.classList.remove("is-outgoing");
          });
        schedule();
      },
      options,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        // A delivery can contain older and newer entries for the same target.
        const entry = entries[entries.length - 1];
        const next = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (visible === next) return;
        visible = next;
        schedule();
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(photo);
    return {
      select: manual,
      destroy() {
        clearTimeout(timer);
        observer.disconnect();
        events.abort();
        slides.forEach((slide) => {
          slide.getAnimations().forEach((animation) => animation.cancel());
          slide.classList.remove("is-outgoing");
          slide.inert = false;
          slide.removeAttribute("aria-hidden");
        });
        photo.removeAttribute("aria-live");
        controls.hidden = true;
        stage.removeAttribute("tabindex");
        stage.removeAttribute("role");
        stage.removeAttribute("aria-label");
        stage.removeAttribute("aria-keyshortcuts");
        root.classList.remove("p-carousel-ready");
        delete root.dataset.playback;
      },
    };
  }

  function mount(root, data) {
    if (root.dataset.presentation === "carousel") return mountCarousel(root);
    const stage = root.querySelector(".p-stage");
    const runway = root.querySelector(".p-runway");
    const slides = [...root.querySelectorAll("[data-chapter-slide]")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let selected = -1;
    let frame = 0;

    function select(index, animate = true) {
      if (selected === index) return;
      const previous = selected;
      selected = index;
      root.dataset.chapter = String(index);
      slides.forEach((slide, slideIndex) => {
        slide.getAnimations().forEach((animation) => animation.cancel());
        slide.classList.toggle("is-current", index === slideIndex);
        slide.classList.toggle("is-outgoing", previous === slideIndex);
      });
      if (
        previous < 0 ||
        reduced.matches ||
        !animate ||
        !root.classList.contains("p-scroll-linked")
      ) {
        slides.forEach((slide) => slide.classList.remove("is-outgoing"));
        return;
      }
      const direction = index > previous ? 1 : -1;
      const timing = { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" };
      const arrival = slides[index].animate(
        [
          { transform: `translateX(${direction * 100}%)` },
          { transform: "translateX(0)" },
        ],
        timing,
      );
      slides[previous].animate(
        [
          { transform: "translateX(0)" },
          { transform: `translateX(${-direction * 100}%)` },
        ],
        timing,
      );
      arrival.finished
        .then(() => {
          if (selected === index)
            slides.forEach((slide) => slide.classList.remove("is-outgoing"));
        })
        .catch(() => {});
    }

    mountPhotoErrors(slides);
    reduced.addEventListener("change", () => {
      if (!reduced.matches) return;
      slides.forEach((slide) => {
        slide.getAnimations().forEach((animation) => animation.cancel());
        slide.classList.remove("is-outgoing");
      });
    });

    function layout() {
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      const fits =
        slides[0].getBoundingClientRect().height <= innerHeight - top - 20;
      const wasLinked = root.classList.contains("p-scroll-linked");
      root.classList.toggle("p-scroll-linked", fits);
      if (wasLinked !== fits) {
        slides.forEach((slide) => {
          slide.getAnimations().forEach((animation) => animation.cancel());
          slide.classList.remove("is-outgoing");
        });
        select(0, false);
      }
      if (fits) updateFromScroll();
    }

    function updateFromScroll() {
      frame = 0;
      if (!root.classList.contains("p-scroll-linked")) return;
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      const distance = runway.offsetHeight - stage.offsetHeight;
      if (distance <= 0) return;
      const progress = Math.max(
        0,
        Math.min(1, (top - runway.getBoundingClientRect().top) / distance),
      );
      const next = Math.min(
        data.chapters.length - 1,
        Math.floor(progress * data.chapters.length),
      );
      select(next);
    }

    const observer = new ResizeObserver(layout);
    observer.observe(stage);
    addEventListener("resize", layout);
    addEventListener(
      "scroll",
      () => {
        if (!frame) frame = requestAnimationFrame(updateFromScroll);
      },
      { passive: true },
    );
    document.fonts?.ready.then(layout);
    select(0, false);
    layout();
    return { select };
  }

  window.FinesseResearchChapters = { markup, mount };
})();
