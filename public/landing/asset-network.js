(() => {
  const ui = window.FinesseUI;
  if (!ui) return;
  const e = ui.escape;
  const positions = {
    company: [23, 22],
    contact: [23, 86],
    job: [77, 22],
    candidate: [50, 54],
    research: [77, 86],
  };

  function validate(nodes, network) {
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edgeIds = new Set(network.edges.map((edge) => edge.id));
    const pathIds = new Set(network.paths.map((path) => path.id));
    if (
      nodeIds.size !== nodes.length ||
      edgeIds.size !== network.edges.length ||
      pathIds.size !== network.paths.length
    )
      throw new Error("Asset network IDs must be unique");
    nodes.forEach((node) => {
      if (!positions[node.id] || !node.label || !node.detail)
        throw new Error(`Invalid asset node: ${node.id}`);
    });
    network.edges.forEach((edge) => {
      if (
        !nodeIds.has(edge.from) ||
        !nodeIds.has(edge.to) ||
        edge.from === edge.to ||
        !edge.label ||
        !edge.note
      )
        throw new Error(`Invalid asset relation: ${edge.id}`);
    });
    network.paths.forEach((path) => {
      if (
        !path.label ||
        !path.title ||
        !path.copy ||
        !path.check ||
        !path.nodes.length ||
        !path.edges.length ||
        path.nodes.some((id) => !nodeIds.has(id)) ||
        path.edges.some((id) => !edgeIds.has(id))
      )
        throw new Error(`Invalid research path: ${path.id}`);
      path.edges.forEach((id) => {
        const edge = network.edges.find((item) => item.id === id);
        if (!path.nodes.includes(edge.from) || !path.nodes.includes(edge.to))
          throw new Error(`Research path lacks an endpoint: ${path.id}/${id}`);
      });
    });
  }

  function storyMarkup(nodes, path, split = false) {
    const labels = new Map(nodes.map((node) => [node.id, node.label]));
    const pause = split ? path.title.indexOf("，") : -1;
    const title =
      pause < 0
        ? e(path.title)
        : `<span class="f-network-heading-line">${e(path.title.slice(0, pause + 1))}</span><span class="f-network-heading-line">${e(path.title.slice(pause + 1))}</span>`;
    return `<ol class="f-network-trail" aria-label="研究路径">${path.nodes.map((id, index) => `<li>${index ? ui.icon("chevronRight") : ""}<span>${e(labels.get(id))}</span></li>`).join("")}</ol><h3>${title}</h3><p>${e(path.copy)}</p><p class="f-network-check">${e(path.check)}</p>`;
  }

  function render(nodes, network, { layout } = {}) {
    validate(nodes, network);
    const split = layout === "split";
    const story = `<div class="f-network-story${split ? " f-network-story--split" : ""}" aria-live="polite">${storyMarkup(nodes, network.paths[0], split)}</div>`;
    const labels = new Map(nodes.map((node) => [node.id, node.label]));
    return `<div class="f-asset-network${split ? " f-network-split" : ""}">
      <div class="f-tabs f-network-tabs" role="tablist" aria-label="资产支持的研究目标">${network.paths.map((path, index) => `<button type="button" class="f-tab" id="f-network-tab-${e(path.id)}" role="tab" aria-selected="${index === 0}" aria-controls="f-network-panel" tabindex="${index === 0 ? 0 : -1}">${e(path.label)}</button>`).join("")}</div>
      <div id="f-network-panel" role="tabpanel" tabindex="0" aria-labelledby="f-network-tab-${e(network.paths[0].id)}">
        ${split ? story : ""}
        <figure class="f-network-figure" aria-labelledby="f-network-caption">
          <div class="f-network-map">
            <svg class="f-network-wires" aria-hidden="true">${network.edges.map((edge) => `<path data-wire="${e(edge.id)}" class="${edge.pending ? "is-pending" : ""}" />`).join("")}</svg>
            <ul class="f-network-nodes" aria-label="五类核心资产">${nodes.map((node) => `<li class="f-network-node${node.id === "candidate" ? " f-network-center" : ""}" data-node="${e(node.id)}" style="--f-node-x:${positions[node.id][0]}%;--f-node-y:${positions[node.id][1]}%">${ui.icon(node.icon)}<h3>${e(node.label)}</h3><p>${e(node.detail)}</p></li>`).join("")}</ul>
            <ul class="f-network-relations" aria-label="资产之间的关系">${network.edges.map((edge) => `<li class="f-network-relation" data-edge="${e(edge.id)}"><span class="f-network-sr">${e(labels.get(edge.from))}与${e(labels.get(edge.to))}：</span><span>${e(edge.label)}</span><small>${e(edge.note)}</small></li>`).join("")}</ul>
          </div>
          <figcaption id="f-network-caption">资产关系示意<span>虚线为需确认的匹配或联系线索</span></figcaption>
        </figure>
        ${split ? "" : story}
      </div>
      <p class="f-network-origin">${ui.icon("link")}有效资料与来源、关系一起保存，成为下一次研究的起点。</p>
    </div>`;
  }

  function mount(root, nodes, network) {
    const split = root.classList.contains("f-network-split");
    const map = root.querySelector(".f-network-map");
    const svg = root.querySelector(".f-network-wires");
    const story = root.querySelector(".f-network-story");
    const nodeElements = new Map(
      [...root.querySelectorAll("[data-node]")].map((node) => [
        node.dataset.node,
        node,
      ]),
    );
    const wireElements = new Map(
      [...root.querySelectorAll("[data-wire]")].map((wire) => [
        wire.dataset.wire,
        wire,
      ]),
    );
    const edgeElements = new Map(
      [...root.querySelectorAll("[data-edge]")].map((edge) => [
        edge.dataset.edge,
        edge,
      ]),
    );

    const draw = () => {
      const bounds = map.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      const boxes = new Map(
        [...nodeElements].map(([id, node]) => {
          const r = node.getBoundingClientRect();
          return [
            id,
            {
              x: r.left - bounds.left + r.width / 2,
              y: r.top - bounds.top + r.height / 2,
              w: r.width,
              h: r.height,
            },
          ];
        }),
      );
      const port = (from, to) => {
        const dx = to.x - from.x,
          dy = to.y - from.y;
        const t = Math.min(
          dx ? from.w / 2 / Math.abs(dx) : Infinity,
          dy ? from.h / 2 / Math.abs(dy) : Infinity,
        );
        return [from.x + dx * t, from.y + dy * t];
      };
      network.edges.forEach((edge) => {
        const a = boxes.get(edge.from),
          b = boxes.get(edge.to);
        let d, x, y;
        if (edge.route === "top") {
          y = Math.min(a.y - a.h / 2, b.y - b.h / 2) - 28;
          x = (a.x + b.x) / 2;
          d = `M ${a.x} ${a.y - a.h / 2} V ${y} H ${b.x} V ${b.y - b.h / 2}`;
        } else if (edge.route === "left") {
          const lane = Math.max(4, Math.min(a.x - a.w / 2, b.x - b.w / 2) - 48);
          const label = edgeElements.get(edge.id);
          x = Math.max(lane, label.offsetWidth / 2 + 2);
          y = (a.y + b.y) / 2;
          d = `M ${a.x - a.w / 2} ${a.y} H ${lane} V ${b.y} H ${b.x - b.w / 2}`;
        } else {
          const start = port(a, b),
            end = port(b, a);
          d = `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`;
          x = (a.x + b.x) / 2;
          y = (a.y + b.y) / 2;
        }
        wireElements.get(edge.id).setAttribute("d", d);
        const label = edgeElements.get(edge.id);
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
      });
    };

    ui.mountTabs(
      root.querySelector(".f-network-tabs"),
      root.querySelector("#f-network-panel"),
      (index) => {
        const path = network.paths[index];
        root.dataset.activePath = path.id;
        nodeElements.forEach((node, id) =>
          node.classList.toggle("is-active", path.nodes.includes(id)),
        );
        wireElements.forEach((wire, id) =>
          wire.classList.toggle("is-active", path.edges.includes(id)),
        );
        edgeElements.forEach((edge, id) =>
          edge.classList.toggle("is-active", path.edges.includes(id)),
        );
        story.innerHTML = storyMarkup(nodes, path, split);
      },
    );
    ui.mountStablePanel(
      story,
      network.paths.map((path) => storyMarkup(nodes, path, split)),
    );
    const observer = new ResizeObserver(draw);
    observer.observe(map);
    nodeElements.forEach((node) => observer.observe(node));
    document.fonts?.ready.then(draw);
    draw();
  }

  window.FinesseAssetNetwork = { validate, render, mount };
})();
