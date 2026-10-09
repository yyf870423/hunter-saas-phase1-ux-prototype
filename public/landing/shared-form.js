(() => {
  const ui = window.FinesseUI;
  if (!ui) return;
  const e = ui.escape;

  function feedback(id, help) {
    return `<div class="f-field-feedback"><span class="f-field-help" id="${id}-help">${e(help)}</span><span class="f-field-error" id="${id}-error" hidden></span></div>`;
  }

  function field({
    name,
    label,
    type = "text",
    autocomplete = "off",
    help = "",
    maxLength = 160,
    inputmode = "text",
    wide = false,
  }) {
    const id = `f-trial-${name}`;
    return `<div class="f-form-field${wide ? " f-form-wide" : ""}">
      <label for="${id}">${e(label)}<span class="f-required" aria-hidden="true">*</span></label>
      <input class="f-input" id="${id}" name="${e(name)}" type="${e(type)}" autocomplete="${e(autocomplete)}" inputmode="${e(inputmode)}" maxlength="${maxLength}" required aria-describedby="${id}-help ${id}-error" />
      ${feedback(id, help)}
    </div>`;
  }

  function selectField({
    name,
    label,
    help = "",
    wide = false,
    other = false,
    multiple = false,
    maxLength = 160,
  }) {
    const id = `f-trial-${name}`;
    return `<div class="f-form-field${wide ? " f-form-wide" : ""}">
      <label for="${id}">${e(label)}<span class="f-required" aria-hidden="true">*</span></label>
      <button type="button" class="f-input f-select-trigger" id="${id}" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-required="true" aria-controls="${id}-list" aria-describedby="${id}-help ${id}-error"><span data-select-label>请选择${e(label)}</span>${ui.icon("chevronRight")}</button>
      <input type="hidden" name="${e(name)}" id="${id}-value" data-trigger="${id}" />
      ${multiple ? '<span class="f-select-summary" data-select-summary hidden></span>' : ""}
      ${other ? `<div class="f-select-other" hidden><label for="${id}-other">其他${e(label)}</label><input type="text" class="f-input" id="${id}-other" maxlength="${maxLength}" aria-describedby="${id}-help ${id}-error" /></div>` : ""}
      ${feedback(id, help)}
    </div>`;
  }

  let closeActive = null;

  function mountSelect(
    control,
    { label, options, multiple = false, other = false },
  ) {
    const trigger = visibleControl(control);
    const field = trigger.closest(".f-form-field");
    const caption = trigger.querySelector("[data-select-label]");
    const summary = field.querySelector("[data-select-summary]");
    const otherWrap = field.querySelector(".f-select-other");
    const supplement = otherWrap?.querySelector("input");
    const menu = document.createElement("div");
    menu.id = `${trigger.id}-list`;
    menu.className = "f-select-menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", label);
    if (multiple) menu.setAttribute("aria-multiselectable", "true");
    menu.hidden = true;
    menu.innerHTML = options
      .map(
        (option, index) =>
          `<div class="f-select-option" role="option" id="${trigger.id}-option-${index}" aria-selected="false" data-index="${index}"><span>${e(option)}</span>${ui.icon("check")}</div>`,
      )
      .join("");
    document.body.append(menu);
    const rows = [...menu.children];
    let selected = [];
    let active = 0;
    let opened = false;

    function value() {
      return selected
        .map((option) => (option === "其他" ? supplement.value.trim() : option))
        .filter(Boolean)
        .join("、");
    }

    function sync(notify = true) {
      control.value = value();
      const hasOther = selected.includes("其他");
      if (otherWrap) {
        otherWrap.hidden = !hasOther;
        supplement.required = hasOther;
      }
      caption.textContent = selected.length
        ? selected
            .map((option) =>
              option === "其他" && supplement.value.trim()
                ? supplement.value.trim()
                : option,
            )
            .join("、")
        : `请选择${label}`;
      trigger.dataset.empty = String(!selected.length);
      trigger.title = selected.length ? caption.textContent : "";
      if (summary) {
        summary.hidden = selected.length < 2;
        summary.textContent = caption.textContent;
      }
      rows.forEach((row, index) =>
        row.setAttribute(
          "aria-selected",
          String(selected.includes(options[index])),
        ),
      );
      if (notify) control.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function activate(index) {
      active = index;
      rows.forEach((row, i) => (row.dataset.active = String(i === active)));
      trigger.setAttribute("aria-activedescendant", rows[active].id);
      rows[active].scrollIntoView({ block: "nearest" });
    }

    function position() {
      if (!opened) return;
      const box = trigger.getBoundingClientRect();
      const viewport = window.visualViewport;
      const topEdge = viewport?.offsetTop || 0;
      const bottomEdge = topEdge + (viewport?.height || innerHeight);
      const leftEdge = viewport?.offsetLeft || 0;
      const rightEdge = leftEdge + (viewport?.width || innerWidth);
      if (box.bottom < topEdge || box.top > bottomEdge) return close();
      const below = bottomEdge - box.bottom - 12;
      const above = box.top - topEdge - 12;
      const upwards = below < 180 && above > below;
      menu.style.width = `${Math.min(box.width, rightEdge - leftEdge - 16)}px`;
      menu.style.maxHeight = `${Math.max(44, Math.min(288, upwards ? above : below))}px`;
      menu.style.left = `${Math.max(leftEdge + 8, Math.min(box.left, rightEdge - menu.offsetWidth - 8))}px`;
      menu.style.top = `${upwards ? box.top - menu.offsetHeight - 4 : box.bottom + 4}px`;
    }

    function close() {
      opened = false;
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      trigger.removeAttribute("aria-activedescendant");
      if (closeActive === close) closeActive = null;
    }

    function open() {
      if (trigger.disabled || opened) return;
      closeActive?.();
      closeActive = close;
      opened = true;
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      position();
      activate(Math.max(0, options.indexOf(selected[0])));
    }

    function choose(index) {
      const option = options[index];
      selected = multiple
        ? selected.includes(option)
          ? selected.filter((item) => item !== option)
          : options.filter((item) => selected.includes(item) || item === option)
        : [option];
      sync();
      activate(index);
      if (!multiple) close();
      if (option === "其他" && selected.includes(option)) {
        close();
        supplement.focus();
      }
    }

    trigger.addEventListener("click", () => (opened ? close() : open()));
    trigger.addEventListener("keydown", (event) => {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          "Enter",
          " ",
          "Escape",
        ].includes(event.key)
      ) {
        event.preventDefault();
        if (event.key === "Escape") return close();
        if (!opened) {
          open();
          if (event.key === "Home") activate(0);
          if (event.key === "End") activate(options.length - 1);
          return;
        }
        if (["Enter", " "].includes(event.key)) return choose(active);
        activate(
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? options.length - 1
              : (active +
                  (event.key === "ArrowDown" ? 1 : -1) +
                  options.length) %
                options.length,
        );
      } else if (event.key === "Tab") close();
    });
    trigger.addEventListener("blur", close);
    menu.addEventListener("pointerdown", (event) => event.preventDefault());
    menu.addEventListener("click", (event) => {
      const row = event.target.closest("[data-index]");
      if (row && !trigger.disabled) choose(Number(row.dataset.index));
    });
    document.addEventListener("pointerdown", (event) => {
      if (
        opened &&
        !menu.contains(event.target) &&
        !trigger.contains(event.target)
      )
        close();
    });
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    window.visualViewport?.addEventListener("resize", position);
    window.visualViewport?.addEventListener("scroll", position);
    supplement?.addEventListener("input", () => sync());
    sync(false);
    return {
      valid: () =>
        selected.length > 0 &&
        (!selected.includes("其他") || Boolean(supplement.value.trim())) &&
        control.value === value(),
      reset() {
        close();
        selected = [];
        if (supplement) supplement.value = "";
        sync(false);
      },
      setDisabled(disabled) {
        trigger.disabled = disabled;
        if (supplement) supplement.readOnly = disabled;
        if (disabled) close();
      },
      focus() {
        (selected.includes("其他") && !supplement.value.trim()
          ? supplement
          : trigger
        ).focus();
      },
    };
  }

  function consent(text) {
    return `<div class="f-form-consent">
      <label class="f-check-label" for="f-trial-consent">
        <span class="f-check-control"><input id="f-trial-consent" name="acknowledgedPurpose" type="checkbox" required aria-describedby="f-trial-consent-error" />${ui.icon("check")}</span>
        <span>${e(text)}</span>
      </label>
      <span class="f-field-error" id="f-trial-consent-error"></span>
    </div>`;
  }

  function setError(control, message) {
    const visible = visibleControl(control);
    visible.setAttribute("aria-invalid", String(Boolean(message)));
    const error = document.getElementById(`${visible.id}-error`);
    error.textContent = message;
    error.hidden = !message;
    const help = document.getElementById(`${visible.id}-help`);
    if (help) help.hidden = Boolean(message);
  }

  function visibleControl(control) {
    return control.dataset.trigger
      ? document.getElementById(control.dataset.trigger)
      : control;
  }

  window.FinesseForms = {
    field,
    selectField,
    mountSelect,
    consent,
    setError,
    visibleControl,
  };
})();
