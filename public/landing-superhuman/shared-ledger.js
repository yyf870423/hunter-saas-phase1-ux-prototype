/*
 * Fifth-version asset ledger: a light, two-dimensional relationship map.
 * Existing asset and path copy stays intact; selection emphasizes, never hides.
 * Finesse owns controls, validation and stable reading height. No page shell,
 * illustration or new product claims. Visual acceptance belongs to integration.
 */
(() => {
  let serial = 0;
  const mounts = new WeakMap();

  function dependencies(nodes, network) {
    const ui = window.FinesseUI;
    const assets = window.FinesseAssetNetwork;
    if (!ui || !assets)
      throw new Error(
        "SuperhumanLedger requires FinesseUI and FinesseAssetNetwork",
      );
    assets.validate(nodes, network);
    if (
      nodes.length !== 5 ||
      network.edges.length !== 6 ||
      network.paths.length !== 3
    )
      throw new Error(
        "SuperhumanLedger requires five assets, six relations and three paths",
      );
    return ui;
  }

  function storyMarkup(ui, labels, path, relationsId) {
    const e = ui.escape;
    return `<ol class="sh-ledger-trail" aria-label="研究路径">${path.nodes
      .map(
        (id, index) =>
          `<li class="sh-ledger-trail-step">${index ? ui.icon("chevronRight") : ""}<span>${e(labels.get(id))}</span></li>`,
      )
      .join("")}</ol>
      <h3 class="sh-ledger-story-title">${e(path.title)}</h3>
      <p class="sh-ledger-story-copy">${e(path.copy)}</p>
      <p class="sh-ledger-story-check">${e(path.check)}</p>
      <a class="f-text-link sh-ledger-relations-link" href="#${relationsId}" data-sh-ledger-open-relations>查看全部关系与待核实事项${ui.icon("chevronRight")}</a>`;
  }

  function sheetStatus(path, id) {
    if (path.nodes[0] === id) return "研究起点";
    return path.nodes.includes(id) ? "当前路径" : "其他资料";
  }

  function render(nodes, network) {
    const ui = dependencies(nodes, network);
    const e = ui.escape;
    const id = `sh-ledger-${++serial}`;
    const panelId = `${id}-panel`;
    const relationsId = `${id}-relations`;
    const first = network.paths[0];
    const labels = new Map(nodes.map((node) => [node.id, node.label]));

    return `<div class="sh-ledger" data-sh-ledger-active-path="${e(first.id)}">
      <div class="f-tabs sh-ledger-tabs" role="tablist" aria-label="资产支持的研究目标">${network.paths
        .map(
          (path, index) =>
            `<button type="button" class="f-tab sh-ledger-tab" id="${id}-tab-${index}" role="tab" aria-selected="${index === 0}" aria-controls="${panelId}" tabindex="${index === 0 ? 0 : -1}">${e(path.label)}</button>`,
        )
        .join("")}</div>
      <div class="sh-ledger-panel" id="${panelId}" role="tabpanel" tabindex="0" aria-labelledby="${id}-tab-0">
        <div class="sh-ledger-story" aria-live="polite" aria-atomic="true">${network.paths
          .map(
            (path, index) =>
              `<div class="sh-ledger-story-content" data-sh-ledger-story="${e(path.id)}"${index ? " hidden" : ""}>${storyMarkup(ui, labels, path, relationsId)}</div>`,
          )
          .join("")}</div>
        <div class="sh-ledger-evidence">
          <figure class="sh-ledger-figure" aria-labelledby="${id}-caption">
            <div class="sh-ledger-map">
              <svg class="sh-ledger-wires" aria-hidden="true" focusable="false">${network.edges
                .map(
                  (edge) =>
                    `<g class="sh-ledger-wire-group${first.edges.includes(edge.id) ? " sh-ledger-wire-group--active" : ""}${edge.pending ? " sh-ledger-wire-group--pending" : ""}" data-sh-ledger-wire="${e(edge.id)}"><path class="sh-ledger-wire"/><circle class="sh-ledger-port sh-ledger-port--from" r="2"/><circle class="sh-ledger-port sh-ledger-port--to" r="2"/></g>`,
                )
                .join("")}</svg>
              <ul class="sh-ledger-documents" aria-label="五类核心资产">${nodes
                .map(
                  (
                    node,
                  ) => `<li class="sh-ledger-sheet${first.nodes.includes(node.id) ? " sh-ledger-sheet--active" : ""}${first.nodes[0] === node.id ? " sh-ledger-sheet--start" : ""}" data-sh-ledger-node="${e(node.id)}">
                  <div class="sh-ledger-sheet-body">
                    <div class="sh-ledger-sheet-heading">${ui.icon(node.icon)}<h4 class="sh-ledger-sheet-title">${e(node.label)}</h4></div>
                    <p class="sh-ledger-sheet-detail">${e(node.detail)}</p>
                    <span class="sh-ledger-sheet-status">${sheetStatus(first, node.id)}</span>
                  </div>
                </li>`,
                )
                .join("")}</ul>
              <ul class="sh-ledger-map-labels" aria-hidden="true">${network.edges
                .map(
                  (edge) =>
                    `<li class="sh-ledger-map-label${first.edges.includes(edge.id) ? " sh-ledger-map-label--active" : ""}${edge.pending ? " sh-ledger-map-label--pending" : ""}" data-sh-ledger-label="${e(edge.id)}">${e(edge.label)}</li>`,
                )
                .join("")}</ul>
            </div>
            <figcaption class="sh-ledger-caption" id="${id}-caption"><span>资产关系示意</span><span>虚线为需确认的匹配或联系线索</span></figcaption>
          </figure>
          <details class="sh-ledger-relations" id="${relationsId}">
            <summary class="sh-ledger-summary">${ui.icon("chevronRight")}<span>全部六种关系与待核实事项</span></summary>
            <ol class="sh-ledger-relation-list" aria-label="资产之间的关系">${network.edges
              .map(
                (
                  edge,
                ) => `<li class="sh-ledger-relation${first.edges.includes(edge.id) ? " sh-ledger-relation--active" : ""}" data-sh-ledger-edge="${e(edge.id)}">
                <h4 class="sh-ledger-relation-title">${e(edge.label)}</h4>
                <p class="sh-ledger-relation-endpoints"><span>${e(labels.get(edge.from))}</span>${ui.icon("chevronRight")}<span>${e(labels.get(edge.to))}</span></p>
                <p class="sh-ledger-relation-note">${e(edge.note)}</p>
              </li>`,
              )
              .join("")}</ol>
          </details>
        </div>
      </div>
      <p class="sh-ledger-origin">${ui.icon("link")}<span>有效资料与来源、关系一起保存，成为下一次研究的起点。</span></p>
    </div>`;
  }

  function mount(root, nodes, network) {
    const ui = dependencies(nodes, network);
    const ledger = root?.matches?.(".sh-ledger")
      ? root
      : root?.querySelector?.(".sh-ledger");
    if (!ledger)
      throw new Error(
        "SuperhumanLedger.mount requires rendered .sh-ledger markup",
      );
    if (mounts.has(ledger)) return mounts.get(ledger);

    const tablist = ledger.querySelector(".sh-ledger-tabs");
    const panel = ledger.querySelector(".sh-ledger-panel");
    const story = ledger.querySelector(".sh-ledger-story");
    const stories = [...story.querySelectorAll(".sh-ledger-story-content")];
    const relations = ledger.querySelector(".sh-ledger-relations");
    const map = ledger.querySelector(".sh-ledger-map");
    const svg = ledger.querySelector(".sh-ledger-wires");
    const sheets = new Map(
      [...map.querySelectorAll("[data-sh-ledger-node]")].map((element) => [
        element.dataset.shLedgerNode,
        element,
      ]),
    );
    const wires = new Map(
      [...svg.querySelectorAll("[data-sh-ledger-wire]")].map((element) => [
        element.dataset.shLedgerWire,
        element,
      ]),
    );
    const rows = new Map(
      [...relations.querySelectorAll("[data-sh-ledger-edge]")].map(
        (element) => [element.dataset.shLedgerEdge, element],
      ),
    );
    const labels = new Map(
      [...map.querySelectorAll("[data-sh-ledger-label]")].map((element) => [
        element.dataset.shLedgerLabel,
        element,
      ]),
    );
    if (
      stories.length !== network.paths.length ||
      nodes.some((node) => !sheets.has(node.id)) ||
      network.edges.some(
        (edge) =>
          !wires.has(edge.id) || !rows.has(edge.id) || !labels.has(edge.id),
      ) ||
      network.paths.some(
        (path, index) => stories[index].dataset.shLedgerStory !== path.id,
      )
    )
      throw new Error(
        "SuperhumanLedger markup and data do not match; render before mounting",
      );

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let animations = [];
    let selected = -1;

    const draw = () => {
      frame = 0;
      const bounds = map.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      const boxes = new Map(
        [...sheets].map(([id, element]) => {
          const box = element.getBoundingClientRect();
          return [
            id,
            {
              left: box.left - bounds.left,
              right: box.right - bounds.left,
              top: box.top - bounds.top,
              bottom: box.bottom - bounds.top,
              cx: box.left - bounds.left + box.width / 2,
              cy: box.top - bounds.top + box.height / 2,
            },
          ];
        }),
      );
      // The six known relations each occupy a clear gap in this five-asset map.
      network.edges.forEach((edge) => {
        const a = boxes.get(edge.from);
        const b = boxes.get(edge.to);
        let start, end, controls, label;
        if (edge.id === "authorship" || edge.id === "demand") {
          start = { x: a.cx, y: a.bottom };
          end = { x: b.cx, y: b.top };
          const middle = (start.y + end.y) / 2;
          controls = `${start.x} ${middle} ${end.x} ${middle}`;
        } else if (edge.id === "role") {
          start = { x: a.right, y: a.cy + 12 };
          end = { x: b.right, y: b.cy };
          const lane = bounds.width - 4;
          const turn = Math.min(24, (end.y - start.y) / 4);
          const job = boxes.get("job");
          label = { x: lane - 4, y: (job.bottom + b.top) / 2 };
          const group = wires.get(edge.id);
          group
            .querySelector(".sh-ledger-wire")
            .setAttribute(
              "d",
              `M ${start.x} ${start.y} C ${lane} ${start.y} ${lane} ${start.y} ${lane} ${start.y + turn} L ${lane} ${end.y - turn} C ${lane} ${end.y} ${lane} ${end.y} ${end.x} ${end.y}`,
            );
        } else if (edge.id === "connection") {
          start = { x: a.left, y: a.cy };
          end = { x: b.cx, y: b.bottom };
          const reach = Math.max(24, (start.x - end.x) / 2);
          controls = `${start.x - reach} ${start.y} ${end.x} ${end.y + 40}`;
        } else {
          const offset = edge.id === "fit" ? 12 : -12;
          start = { x: a.left, y: a.cy + offset };
          end = { x: b.right, y: b.cy + offset };
          const reach = Math.max(8, (start.x - end.x) * 0.4);
          controls = `${start.x - reach} ${start.y} ${end.x + reach} ${end.y}`;
        }
        const group = wires.get(edge.id);
        const path = group.querySelector(".sh-ledger-wire");
        if (edge.id !== "role")
          path.setAttribute(
            "d",
            `M ${start.x} ${start.y} C ${controls} ${end.x} ${end.y}`,
          );
        const point = label || path.getPointAtLength(path.getTotalLength() / 2);
        const text = labels.get(edge.id);
        text.style.setProperty("--sh-label-x", `${point.x}px`);
        text.style.setProperty("--sh-label-y", `${point.y}px`);
        [
          ["from", start],
          ["to", end],
        ].forEach(([name, point]) => {
          const circle = group.querySelector(`.sh-ledger-port--${name}`);
          circle.setAttribute("cx", point.x);
          circle.setAttribute("cy", point.y);
        });
      });
    };
    const refresh = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };
    const cancelMotion = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
    };
    const reveal = (elements) => {
      cancelMotion();
      if (motion.matches) return;
      animations = elements
        .filter((element) => typeof element.animate === "function")
        .map((element, index) =>
          element.animate(
            [{ transform: "translateX(6px)" }, { transform: "translateX(0)" }],
            {
              duration: 240,
              delay: Math.min(index, 3) * 24,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
          ),
        );
    };
    const tabs = ui.mountTabs(tablist, panel, (index) => {
      const path = network.paths[index];
      ledger.dataset.shLedgerActivePath = path.id;
      stories.forEach((element, storyIndex) => {
        element.hidden = storyIndex !== index;
      });
      sheets.forEach((sheet, id) => {
        sheet.classList.toggle(
          "sh-ledger-sheet--active",
          path.nodes.includes(id),
        );
        sheet.classList.toggle("sh-ledger-sheet--start", path.nodes[0] === id);
        sheet.querySelector(".sh-ledger-sheet-status").textContent =
          sheetStatus(path, id);
      });
      wires.forEach((wire, id) =>
        wire.classList.toggle(
          "sh-ledger-wire-group--active",
          path.edges.includes(id),
        ),
      );
      labels.forEach((label, id) =>
        label.classList.toggle(
          "sh-ledger-map-label--active",
          path.edges.includes(id),
        ),
      );
      rows.forEach((row, id) =>
        row.classList.toggle(
          "sh-ledger-relation--active",
          path.edges.includes(id),
        ),
      );
      if (selected !== -1 && selected !== index)
        reveal([
          stories[index],
          ...path.nodes.map((id) =>
            sheets.get(id).querySelector(".sh-ledger-sheet-body"),
          ),
        ]);
      selected = index;
      refresh();
    });

    ui.mountStablePanel(
      story,
      stories.map(
        (element) =>
          `<div class="sh-ledger-story-content">${element.innerHTML}</div>`,
      ),
    );
    const observer = new ResizeObserver(refresh);
    observer.observe(map);
    sheets.forEach((sheet) => observer.observe(sheet));
    document.fonts?.ready.then(refresh);
    motion.addEventListener("change", () => {
      if (motion.matches) cancelMotion();
    });
    story.addEventListener("click", (event) => {
      const link = event.target.closest?.("[data-sh-ledger-open-relations]");
      if (
        !link ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      relations.open = true;
      relations.querySelector("summary").focus();
      refresh();
    });
    relations.addEventListener("toggle", refresh);
    if (frame) window.cancelAnimationFrame(frame);
    draw();
    const controller = { select: tabs.select, refresh };
    mounts.set(ledger, controller);
    return controller;
  }

  window.SuperhumanLedger = { render, mount };
})();
