import { useEffect, useRef } from "react";
import * as THREE from "three";

const palette = {
  orchestration: {
    primary: 0x4c8dff,
    secondary: 0x67e8f9,
    quiet: 0x233a64,
    line: 0x44638f,
  },
  graph: {
    primary: 0x695cff,
    secondary: 0x1fb6aa,
    quiet: 0xb9c3e8,
    line: 0x8b94c7,
  },
  observatory: {
    primary: 0x8bd5ff,
    secondary: 0x7788ff,
    quiet: 0x24304c,
    line: 0x496387,
  },
};

function lineBetween(a, b, material) {
  const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
  return new THREE.Line(geometry, material);
}

function buildOrchestration(group, colors) {
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.12, 1),
    new THREE.MeshPhysicalMaterial({
      color: colors.primary,
      emissive: colors.primary,
      emissiveIntensity: 0.26,
      roughness: 0.28,
      metalness: 0.32,
      transparent: true,
      opacity: 0.9,
    }),
  );
  core.userData.role = "core";
  group.add(core);

  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.48, 1)),
    new THREE.LineBasicMaterial({
      color: colors.secondary,
      transparent: true,
      opacity: 0.38,
    }),
  );
  wire.userData.role = "wire";
  group.add(wire);

  const positions = [
    [-4.2, 1.7, -0.5],
    [-3.5, -2.15, 0.4],
    [0, 3.35, -1.2],
    [3.7, 1.55, 0.35],
    [3.65, -2.1, -0.45],
    [0, -3.45, 0.65],
  ];
  const lineMaterial = new THREE.LineBasicMaterial({
    color: colors.line,
    transparent: true,
    opacity: 0.42,
  });
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: colors.secondary,
  });

  positions.forEach((position, index) => {
    const node = new THREE.Mesh(
      new THREE.BoxGeometry(
        index === 2 ? 1.05 : 0.82,
        index === 2 ? 1.05 : 0.82,
        0.82,
      ),
      new THREE.MeshStandardMaterial({
        color: index === 4 ? colors.secondary : colors.quiet,
        emissive: index === 4 ? colors.secondary : colors.primary,
        emissiveIntensity: index === 4 ? 0.2 : 0.06,
        roughness: 0.44,
        metalness: 0.2,
      }),
    );
    node.position.set(...position);
    node.rotation.set(0.35, index * 0.36, 0.18);
    node.userData.role = "node";
    group.add(node);

    const destination = new THREE.Vector3(...position);
    group.add(lineBetween(new THREE.Vector3(), destination, lineMaterial));
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.105, 12, 12),
      pulseMaterial,
    );
    pulse.userData = {
      role: "pulse",
      start: new THREE.Vector3(),
      end: destination,
      delay: index / positions.length,
    };
    group.add(pulse);
  });
}

function buildGraph(group, colors) {
  const clusters = [
    { center: [-3.2, 1.3, -0.2], color: colors.primary, count: 6 },
    { center: [2.8, 1.7, -0.8], color: colors.secondary, count: 5 },
    { center: [0.8, -2.3, 0.5], color: 0x546681, count: 7 },
    { center: [0.2, 0.2, 1.2], color: 0xffffff, count: 4 },
  ];
  const lineMaterial = new THREE.LineBasicMaterial({
    color: colors.line,
    transparent: true,
    opacity: 0.35,
  });
  const centers = [];

  clusters.forEach((cluster, clusterIndex) => {
    const center = new THREE.Vector3(...cluster.center);
    centers.push(center);
    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(clusterIndex === 3 ? 0.5 : 0.34, 24, 24),
      new THREE.MeshStandardMaterial({
        color: cluster.color,
        emissive: cluster.color,
        emissiveIntensity: clusterIndex === 3 ? 0.18 : 0.08,
        roughness: 0.42,
      }),
    );
    hub.position.copy(center);
    hub.userData.role = "hub";
    group.add(hub);

    for (let index = 0; index < cluster.count; index += 1) {
      const angle = (index / cluster.count) * Math.PI * 2 + clusterIndex * 0.7;
      const radius = 0.9 + (index % 3) * 0.32;
      const point = new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius * 0.72,
        center.z + ((index % 2) - 0.5) * 0.8,
      );
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(index % 3 === 0 ? 0.18 : 0.12, 18, 18),
        new THREE.MeshStandardMaterial({
          color: cluster.color,
          roughness: 0.5,
        }),
      );
      node.position.copy(point);
      node.userData.role = "node";
      group.add(node);
      group.add(lineBetween(center, point, lineMaterial));
    }
  });

  for (let index = 0; index < centers.length - 1; index += 1) {
    group.add(lineBetween(centers[index], centers[index + 1], lineMaterial));
  }
  group.add(lineBetween(centers[0], centers[3], lineMaterial));
}

function makeRing(radius, color, opacity = 0.35) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
  const points = curve
    .getPoints(128)
    .map((point) => new THREE.Vector3(point.x, point.y, 0));
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function buildObservatory(group, colors) {
  const floor = new THREE.Group();
  floor.rotation.x = -Math.PI / 2.35;
  [1.5, 2.9, 4.4, 5.8].forEach((radius, index) => {
    const ring = makeRing(
      radius,
      index === 2 ? colors.primary : colors.line,
      index === 2 ? 0.6 : 0.22,
    );
    ring.userData.role = "ring";
    floor.add(ring);
  });

  const spokes = new THREE.LineBasicMaterial({
    color: colors.line,
    transparent: true,
    opacity: 0.2,
  });
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    floor.add(
      lineBetween(
        new THREE.Vector3(),
        new THREE.Vector3(Math.cos(angle) * 5.8, Math.sin(angle) * 5.8, 0),
        spokes,
      ),
    );
  }

  const sweepGeometry = new THREE.BufferGeometry();
  sweepGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [0, 0, 0.02, 5.4, 0, 0.02, 4.4, 2.4, 0.02],
      3,
    ),
  );
  const sweep = new THREE.Mesh(
    sweepGeometry,
    new THREE.MeshBasicMaterial({
      color: colors.primary,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
    }),
  );
  sweep.userData.role = "sweep";
  floor.add(sweep);
  group.add(floor);

  const signals = [
    [-3.2, 1.4, 0.8, 1.9],
    [-1.2, -1.6, 0.7, 1.25],
    [1.5, 2.2, 0.9, 2.6],
    [3.5, -0.9, 0.6, 1.55],
    [0.2, 0.1, 1.1, 3.1],
  ];
  signals.forEach(([x, z, width, height], index) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, width),
      new THREE.MeshStandardMaterial({
        color:
          index === 2
            ? 0xffbf69
            : index === 4
              ? colors.secondary
              : colors.primary,
        emissive: index === 2 ? 0xffbf69 : colors.primary,
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0.78,
        roughness: 0.45,
      }),
    );
    bar.position.set(x, height / 2 - 1.3, z);
    bar.userData.role = "signal";
    group.add(bar);
  });
}

export function SceneCanvas({ variant, className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const colors = palette[variant] || palette.orchestration;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.3, variant === "observatory" ? 11.5 : 12.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    if (variant === "graph") buildGraph(group, colors);
    else if (variant === "observatory") buildObservatory(group, colors);
    else buildOrchestration(group, colors);

    scene.add(
      new THREE.AmbientLight(0xffffff, variant === "graph" ? 1.45 : 0.8),
    );
    const key = new THREE.DirectionalLight(colors.primary, 3.2);
    key.position.set(5, 7, 9);
    scene.add(key);
    const fill = new THREE.PointLight(colors.secondary, 2.6, 24);
    fill.position.set(-5, -3, 7);
    scene.add(fill);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const started = performance.now();

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const onPointerMove = (event) => {
      const bounds = mount.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointerMove);

    const render = (now) => {
      const elapsed = (now - started) / 1000;
      if (!reduceMotion) {
        group.rotation.y += (pointerX * 0.12 - group.rotation.y) * 0.025;
        group.rotation.x += (-pointerY * 0.06 - group.rotation.x) * 0.025;
        group.children.forEach((child) => {
          if (child.userData.role === "core") child.rotation.y = elapsed * 0.28;
          if (child.userData.role === "wire")
            child.rotation.z = -elapsed * 0.15;
          if (child.userData.role === "node" || child.userData.role === "hub") {
            child.position.y += Math.sin(elapsed * 1.2 + child.id) * 0.0009;
          }
          if (child.userData.role === "pulse") {
            const t = (elapsed * 0.22 + child.userData.delay) % 1;
            child.position.lerpVectors(
              child.userData.start,
              child.userData.end,
              t,
            );
          }
          if (child.userData.role === "sweep")
            child.rotation.z = -elapsed * 0.42;
        });
      }
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (Array.isArray(object.material))
          object.material.forEach((item) => item.dispose());
        else if (object.material) object.material.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant]);

  return (
    <div
      ref={mountRef}
      className={`s7-scene-canvas ${className}`.trim()}
      role="img"
      aria-label={
        variant === "graph"
          ? "公司、岗位、候选人与研究成果构成的人才关系网络"
          : variant === "observatory"
            ? "招聘机会和人才变化信号的动态观测场景"
            : "招聘目标被拆解为调研、匹配、审核和业务资产任务的编排场景"
      }
    />
  );
}
