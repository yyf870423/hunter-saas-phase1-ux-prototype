(() => {
  const ns = "http://www.w3.org/2000/svg";
  let instance = 0;

  function svgElement(name, attributes) {
    const element = document.createElementNS(ns, name);
    Object.entries(attributes).forEach(([key, value]) =>
      element.setAttribute(key, String(value)),
    );
    return element;
  }

  function port(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const ratio = Math.min(
      dx ? from.w / 2 / Math.abs(dx) : Infinity,
      dy ? from.h / 2 / Math.abs(dy) : Infinity,
    );
    const x = from.x + dx * ratio;
    const y = from.y + dy * ratio;
    return { x, y };
  }

  function connectionPath(edge, a, b) {
    if (edge.route === "top") {
      const ay = a.y - a.h / 2;
      const by = b.y - b.h / 2;
      const y = Math.max(8, Math.min(ay, by) - 28);
      const r = Math.min(6, ay - y, by - y);
      return `M ${a.x} ${ay} V ${y + r} Q ${a.x} ${y} ${a.x + r} ${y} H ${b.x - r} Q ${b.x} ${y} ${b.x} ${y + r} V ${by}`;
    }
    if (edge.route === "left") {
      const ax = a.x - a.w / 2;
      const bx = b.x - b.w / 2;
      const x = Math.max(2, Math.min(ax, bx) - 32);
      const r = Math.max(0, Math.min(6, ax - x, bx - x));
      return `M ${ax} ${a.y} H ${x + r} Q ${x} ${a.y} ${x} ${a.y + r} V ${b.y - r} Q ${x} ${b.y} ${x + r} ${b.y} H ${bx}`;
    }
    const start = port(a, b);
    const end = port(b, a);
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  function mount(root, network) {
    if (!root || root.classList.contains("o-asset-network")) return;
    const map = root.querySelector(".f-network-map");
    const svg = root.querySelector(".f-network-wires");
    if (!map || !svg) return;
    const nodes = new Map(
      [...root.querySelectorAll("[data-node]")].map((node) => [
        node.dataset.node,
        node,
      ]),
    );
    const wires = new Map(
      [...svg.querySelectorAll("[data-wire]")].map((wire) => [
        wire.dataset.wire,
        wire,
      ]),
    );
    const labels = new Map(
      [...root.querySelectorAll("[data-edge]")].map((label) => [
        label.dataset.edge,
        label,
      ]),
    );
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const id = ++instance;
    let current;
    let trace;
    let animations = [];

    const clearTrace = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      trace?.remove();
      trace = null;
    };

    const geometryObserver = new MutationObserver(() => draw());
    const observeGeometry = () =>
      geometryObserver.observe(svg, {
        attributes: true,
        subtree: true,
        attributeFilter: ["d", "viewBox"],
      });

    const draw = () => {
      const bounds = map.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      geometryObserver.disconnect();
      clearTrace();
      try {
        const boxes = new Map(
          [...nodes].map(([key, node]) => {
            const box = node.getBoundingClientRect();
            return [
              key,
              {
                x: box.left - bounds.left + box.width / 2,
                y: box.top - bounds.top + box.height / 2,
                w: box.width,
                h: box.height,
              },
            ];
          }),
        );
        network.edges.forEach((edge) => {
          const wire = wires.get(edge.id);
          wire.setAttribute(
            "d",
            connectionPath(edge, boxes.get(edge.from), boxes.get(edge.to)),
          );
          const point = wire.getPointAtLength(wire.getTotalLength() / 2);
          const label = labels.get(edge.id);
          const halfWidth = label.offsetWidth / 2 + 6;
          const halfHeight = label.offsetHeight / 2 + 4;
          let x = point.x;
          if (edge.route === "left") {
            const center = boxes.get("candidate");
            x = Math.min(
              point.x + halfWidth + 16,
              center.x - center.w / 2 - halfWidth - 8,
            );
          } else if (edge.route !== "top") {
            x +=
              (boxes.get(edge.from).x < boxes.get(edge.to).x ? -1 : 1) *
              (halfWidth + 4);
          }
          label.style.left = `${Math.max(halfWidth, Math.min(bounds.width - halfWidth, x))}px`;
          label.style.top = `${Math.max(halfHeight, Math.min(bounds.height - halfHeight, point.y))}px`;
        });
      } finally {
        observeGeometry();
      }
    };

    const showTrace = (path) => {
      if (reduced.matches || !svg.animate || document.hidden) return;
      const depths = new Map([[path.nodes[0], 0]]);
      const edges = network.edges.filter((edge) =>
        path.edges.includes(edge.id),
      );
      const queue = [path.nodes[0]];
      for (const node of queue) {
        edges.forEach((edge) => {
          const other =
            edge.from === node ? edge.to : edge.to === node ? edge.from : null;
          if (other && !depths.has(other)) {
            depths.set(other, depths.get(node) + 1);
            queue.push(other);
          }
        });
      }
      const group = svgElement("g", { class: "o-network-traces" });
      const defs = svgElement("defs", {});
      group.append(defs);
      edges.forEach((edge) => {
        const d = wires.get(edge.id).getAttribute("d");
        const maskId = `o-network-mask-${id}-${edge.id}`;
        const mask = svgElement("mask", {
          id: maskId,
          maskUnits: "userSpaceOnUse",
          x: 0,
          y: 0,
          width: "100%",
          height: "100%",
        });
        const reverse = depths.get(edge.from) > depths.get(edge.to);
        const reveal = svgElement("path", {
          d,
          class: "o-network-mask",
          pathLength: 1,
          "stroke-dasharray": 1,
          "stroke-dashoffset": reverse ? -1 : 1,
        });
        mask.append(reveal);
        defs.append(mask);
        group.append(
          svgElement("path", {
            d,
            class: `o-network-trace${edge.pending ? " is-pending" : ""}`,
            mask: `url(#${maskId})`,
          }),
        );
        const delay = Math.min(depths.get(edge.from), depths.get(edge.to)) * 90;
        const animation = reveal.animate(
          [
            { strokeDashoffset: reverse ? "-1" : "1" },
            { strokeDashoffset: "0" },
          ],
          {
            duration: 420,
            delay,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "both",
          },
        );
        animations.push(animation);
      });
      trace = group;
      svg.append(group);
      const running = [...animations];
      Promise.all(running.map((animation) => animation.finished))
        .then(async () => {
          if (trace !== group) return;
          const fade = group.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 120,
            fill: "forwards",
          });
          animations.push(fade);
          await fade.finished;
          if (trace === group) clearTrace();
        })
        .catch(() => {});
    };

    const sync = (animate = true) => {
      const path = network.paths.find(
        (item) => item.id === root.dataset.activePath,
      );
      if (!path || path.id === current) return;
      clearTrace();
      current = path.id;
      root.dataset.startNode = path.nodes[0];
      nodes.forEach((node, key) =>
        node.classList.toggle("is-start", key === path.nodes[0]),
      );
      if (animate) showTrace(path);
    };

    root.classList.add("o-asset-network");
    // Reuse the shared resize lifecycle without modifying the second-version renderer.
    draw();
    sync(false);
    const stateObserver = new MutationObserver(() => sync());
    stateObserver.observe(root, {
      attributes: true,
      attributeFilter: ["data-active-path"],
    });
    reduced.addEventListener("change", clearTrace);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTrace();
    });
  }

  window.OriginAssetNetwork = { mount };
})();
