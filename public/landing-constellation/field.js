/* HunterBuddy triangle field.
   One population of outlined triangles morphs between 3D shapes. On the page the shapes are tied to
   scroll anchors ([data-shape] sections); in the film they are driven by time. The pointer pushes
   nearby triangles aside and lights them up. WebGL2 instanced lines, with a Canvas 2D fallback. */
(function () {
  "use strict";
  const PAL = [
    [47, 134, 255], // 0 product blue
    [143, 211, 255], // 1 sky
    [25, 179, 140], // 2 verdant
    [255, 184, 41], // 3 amber
    [185, 164, 255], // 4 lilac
    [255, 122, 89], // 5 coral
    [236, 242, 255], // 6 white
  ];

  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  }
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = (x) => {
    x = clamp(x);
    return x * x * (3 - 2 * x);
  };
  const ease = (x) => {
    x = clamp(x);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  /* ---------- 2D masks from SVG paths ---------- */
  function mask(paths, vb, size = 400, rule = "nonzero") {
    const [x0, y0, w, h] = vb;
    const k = size / Math.max(w, h);
    const cw = Math.ceil(w * k), ch = Math.ceil(h * k);
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    const ctx = c.getContext("2d");
    ctx.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    paths.forEach((d) => ctx.fill(new Path2D(d), rule));
    const data = ctx.getImageData(0, 0, cw, ch).data;
    const inside = new Uint8Array(cw * ch);
    for (let i = 0; i < cw * ch; i++) inside[i] = data[i * 4 + 3] > 127 ? 1 : 0;
    const edge = [];
    for (let y = 1; y < ch - 1; y++)
      for (let x = 1; x < cw - 1; x++) {
        const i = y * cw + x;
        if (inside[i] && (!inside[i - 1] || !inside[i + 1] || !inside[i - cw] || !inside[i + cw])) edge.push(i);
      }
    const fill = [];
    for (let i = 0; i < cw * ch; i++) if (inside[i]) fill.push(i);
    return { w: cw, h: ch, inside, edge, fill };
  }

  const HEAD =
    "M200 40 C270 40 330 90 335 165 C340 215 322 250 300 272 C290 285 288 300 292 318 C300 340 340 352 380 362 L400 368 L400 440 L0 440 L0 380 C30 372 80 360 120 352 C140 348 150 330 150 310 C150 300 140 292 128 290 C112 288 104 280 104 270 C104 262 100 258 96 256 C92 254 94 248 98 246 C92 242 88 236 92 232 C86 230 78 228 76 222 C74 216 80 210 84 204 C92 190 92 176 90 166 C88 156 92 148 96 142 C104 96 148 40 200 40 Z";
  const BO_BODY = "M105 307H125V308H129V309L133 310L134 312H136V313L139 315V317L141 318V320L143 321L144 328H145V441H146V445H147L149 451L151 452V454H152L156 459H158L159 461H161V462H163V463H167V464H178V463H182V462L184 463V467H185V470H186L187 475L189 476L190 480H191L192 483L195 485V487L200 491V493H198V494L195 495V496L189 497V498H185V499H180V500H163V499H157V498H153V497L147 496V495H145V494L139 492V491H137L136 489H134L131 485H129V484L119 475V473L117 472V470L115 469L114 465L112 464V462H111V460H110V457H109V455H108V452H107L106 444H105V307ZM223 420V443H224V449H225V452H226V455H227L228 459H229V460L232 462V464L235 465L237 468H239V469L243 470V471H246V472H262V471H265V470H267V469L273 467V466L282 458V456L284 455V453H285V451H286V448H287V445H288V440H289L288 426H287L286 420H285L284 416L282 415V413H281L273 404H271V403L265 401V400H261V399H246V400H242V401L236 403L235 405H233V406L228 410V412L226 413V415H225V417H224V420H223ZM152 364H170V365H175V366L181 367V368H184V369H186V370L192 372V373H194L195 375H197V376H198L200 379H202L204 382H206V381H207L211 376H213L215 373L219 372L220 370H222V369L226 368V367L232 366V365H235V364H239V363H245V362H261V363L271 364V365L277 366V367H280V368H282V369L288 371V372H290V373L293 374L294 376H296L300 381H302V382L306 385V387L311 391V393L313 394V396L315 397V399H316V401H317L319 407H320V409H321L322 415H323V419H324V425H325V447H324L323 456H322L321 462H320V465H319L317 471L315 472L314 476H313L312 479L310 480V482H309L299 493H297L295 496H293L292 498H290L289 500H287V501L283 502V503H280V504H278V505H275V506L268 507V508H261V509H245V508H239V507H235V506L229 505V504H227V503L221 501V500H219V499L216 498L215 496H213V495L201 484V482L198 480V478H197V476H196L194 470H193V468H192V465H191V463H190L189 455H188V450H187V430H186V423H185V420H184V417H183L182 413H181V412L178 410V408H176L173 404H171V403L167 402V401H163V400H152V364Z";
  const BO_CRESCENT = "M239 456L251 454V453L257 451V450L265 443V441L267 440V438H268V436H269V433H270V419H269V416H268V414H269V415L274 419V421L276 422V424H277V426H278V429H279V433H280L279 444H278V447H277V449L275 450V452H274L268 459H266V460H264V461H260V462H248V461H245V460L241 459L239 456Z";

  /* colour bands that follow a shape's own geometry, like the source's clustered hues */
  function band(x, y, z, r) {
    if (r < 0.1) return 6;
    const f = Math.sin(x * 2.3 + y * 1.4 + z * 1.9) + 0.6 * Math.sin(x * 4.1 - z * 3.3 + y * 0.7);
    const g = (f + 1.6) / 3.2;
    const order = [3, 3, 0, 4, 1, 0, 2, 3];
    return order[Math.min(order.length - 1, Math.floor(clamp(g, 0, 0.999) * order.length))];
  }

  /* ---------- shapes: N points each, ~[-1, 1] units, with colour index and alpha ---------- */
  function makeShapes(N, seed) {
    const S = {};
    const make = (name, fn) => {
      const r = rng(seed + name.length * 7919);
      const pos = new Float32Array(N * 3), col = new Uint8Array(N), alp = new Float32Array(N).fill(1);
      for (let i = 0; i < N; i++) fn(i, r, pos, col, alp);
      S[name] = { pos, col, alp };
    };
    const put = (pos, i, x, y, z) => {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    };
    const gauss = (r) => (r() + r() + r() - 1.5) / 1.5;
    const sphere = (r) => {
      const u = r() * 2 - 1, t = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      return [s * Math.cos(t), u, s * Math.sin(t)];
    };

    // a person in profile: the 2D bust given depth row by row
    const hm = mask([HEAD], [0, 0, 400, 440], 440);
    const rowMin = new Int16Array(hm.h).fill(-1), rowMax = new Int16Array(hm.h).fill(-1);
    for (let y = 0; y < hm.h; y++)
      for (let x = 0; x < hm.w; x++)
        if (hm.inside[y * hm.w + x]) {
          if (rowMin[y] < 0) rowMin[y] = x;
          rowMax[y] = x;
        }
    make("head", (i, r, pos, col, alp) => {
      const onEdge = r() < 0.3;
      const list = onEdge ? hm.edge : hm.fill;
      const p = list[Math.floor(r() * list.length)];
      const px = (p % hm.w) + r() - 0.5, py = Math.floor(p / hm.w) + r() - 0.5;
      const row = Math.floor(py);
      const cx = (rowMin[row] + rowMax[row]) / 2, half = Math.max(1, (rowMax[row] - rowMin[row]) / 2);
      const depth = half * (py > 330 ? 1.5 : 0.78);
      const k = Math.sqrt(clamp(1 - ((px - cx) / half) ** 2));
      const z = onEdge ? (r() - 0.5) * 0.25 * depth * k : (r() < 0.78 ? (r() < 0.5 ? -1 : 1) : r() * 2 - 1) * depth * k;
      const X = (px - 200) / 200, Y = -(py - 240) / 200, Z = z / 200;
      put(pos, i, X, Y, Z);
      col[i] = band(X, Y, Z, r());
      alp[i] = py > 380 ? clamp(1 - (py - 380) / 60) : 1;
    });

    // scattered across six places
    const C6 = [[-1.45, 0.55, -0.3], [-0.55, -0.6, 0.4], [0.2, 0.7, -0.6], [0.95, -0.35, 0.2], [1.5, 0.5, -0.2], [-1.2, -0.75, -0.8]];
    const C6c = [0, 1, 2, 3, 5, 4];
    make("scatter", (i, r, pos, col) => {
      if (r() < 0.22) {
        put(pos, i, (r() * 2 - 1) * 2.1, (r() * 2 - 1) * 1.2, (r() * 2 - 1) * 1.2);
        col[i] = band(pos[i * 3], pos[i * 3 + 1], 0, r());
        return;
      }
      const c = i % 6;
      put(pos, i, C6[c][0] + gauss(r) * 0.28, C6[c][1] + gauss(r) * 0.28, C6[c][2] + gauss(r) * 0.28);
      col[i] = r() < 0.12 ? 6 : C6c[c];
    });

    // a tilted ring that frames the film
    make("ring", (i, r, pos, col) => {
      const u = r() * Math.PI * 2, v = r() * Math.PI * 2, R = 1.12, t = 0.05 + r() * 0.05;
      let x = (R + t * Math.cos(v)) * Math.cos(u), y = (R + t * Math.cos(v)) * Math.sin(u), z = t * Math.sin(v);
      const a = 1.05; // tilt about x
      [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
      put(pos, i, x, y * 0.95, z);
      col[i] = r() < 0.1 ? 6 : [0, 1, 4, 3][Math.floor(((u / (Math.PI * 2)) * 4 + 0.5) % 4)];
    });

    // a job brief: card outline with lines of requirements
    make("doc", (i, r, pos, col) => {
      const w = 0.62, h = 0.82, k = r();
      let x, y, c;
      if (k < 0.32) {
        const p = r() * 2 * (w + h) * 2, side = p < 2 * w ? 0 : p < 2 * w + 2 * h ? 1 : p < 4 * w + 2 * h ? 2 : 3;
        if (side === 0) [x, y] = [-w + p, h];
        else if (side === 1) [x, y] = [w, h - (p - 2 * w)];
        else if (side === 2) [x, y] = [w - (p - 2 * w - 2 * h), -h];
        else [x, y] = [-w, -h + (p - 4 * w - 2 * h)];
        c = r() < 0.3 ? 6 : 1;
      } else if (k < 0.9) {
        const L = [[0.62, 0.5, 3], [0.42, 0.75, 0], [0.24, 0.62, 0], [0.06, 0.82, 0], [-0.12, 0.55, 1], [-0.36, 0.7, 3], [-0.54, 0.48, 1]];
        const l = L[Math.floor(r() * L.length)];
        x = -w + 0.14 + r() * (2 * w - 0.28) * l[1];
        y = l[0] + (r() - 0.5) * (l === L[0] ? 0.07 : 0.035);
        c = l[2];
      } else {
        x = (r() * 2 - 1) * w;
        y = (r() * 2 - 1) * h;
        c = 4;
      }
      put(pos, i, x, y, (r() - 0.5) * 0.04);
      col[i] = c;
    });

    // three sources, then one person
    const C3 = [[-0.78, 0.38, 0.1], [0.74, 0.46, -0.2], [0.02, -0.62, 0.25]];
    const C3c = [0, 4, 2];
    make("three", (i, r, pos, col) => {
      const g = i % 3, s = sphere(r), rad = 0.32 * (0.86 + r() * 0.14);
      put(pos, i, C3[g][0] + s[0] * rad, C3[g][1] + s[1] * rad, C3[g][2] + s[2] * rad);
      col[i] = r() < 0.1 ? 6 : C3c[g];
    });
    make("one", (i, r, pos, col) => {
      const g = i % 3, s = sphere(r), rad = 0.66 * (0.9 + r() * 0.1);
      put(pos, i, s[0] * rad, s[1] * rad, s[2] * rad);
      col[i] = r() < 0.16 ? 6 : r() < 0.3 ? 1 : C3c[g];
    });

    // reasons with sources: a check inside a ring
    const seg = (r, ax, ay, bx, by, wdt) => {
      const t = r(), nx = -(by - ay), ny = bx - ax, l = Math.hypot(nx, ny), o = (r() - 0.5) * wdt;
      return [ax + (bx - ax) * t + (nx / l) * o, ay + (by - ay) * t + (ny / l) * o];
    };
    make("check", (i, r, pos, col) => {
      if (r() < 0.62) {
        const [x, y] = r() < 0.33 ? seg(r, -0.52, 0.04, -0.12, -0.38, 0.17) : seg(r, -0.12, -0.38, 0.62, 0.48, 0.17);
        put(pos, i, x, y, (r() - 0.5) * 0.12);
        col[i] = r() < 0.25 ? 6 : 2;
      } else {
        const a = r() * Math.PI * 2, R = 0.95 + (r() - 0.5) * 0.06;
        put(pos, i, Math.cos(a) * R, Math.sin(a) * R, (r() - 0.5) * 0.08);
        col[i] = r() < 0.5 ? 1 : 0;
      }
    });

    // the human gate: the profile waits on the left, the amber gate holds
    make("gate", (i, r, pos, col, alp) => {
      const k = r();
      if (k < 0.36) {
        const s = sphere(r);
        put(pos, i, -0.95 + s[0] * 0.34, s[1] * 0.34, s[2] * 0.34);
        col[i] = r() < 0.15 ? 6 : r() < 0.5 ? 1 : 0;
      } else if (k < 0.5) {
        const t = r();
        put(pos, i, -0.6 + t * 0.78, (r() - 0.5) * 0.05, (r() - 0.5) * 0.05);
        col[i] = 1;
        alp[i] = 0.4 + t * 0.6;
      } else if (k < 0.92) {
        const a = r() * Math.PI * 2, R = 0.82 + (r() - 0.5) * 0.05;
        put(pos, i, 0.32 + Math.sin(a) * 0.16, Math.cos(a) * R, Math.sin(a) * R * 0.5);
        col[i] = r() < 0.75 ? 3 : 5;
      } else {
        put(pos, i, 0.7 + r() * 0.9, (r() - 0.5) * 1.2, (r() - 0.5) * 0.8);
        col[i] = 3;
        alp[i] = 0.35;
      }
    });

    // from people to opportunities: a wireframe globe
    make("globe", (i, r, pos, col) => {
      let x, y, z;
      if (r() < 0.62) [x, y, z] = sphere(r);
      else if (r() < 0.5) {
        const lat = (Math.floor(r() * 5) - 2) * 0.42, a = r() * Math.PI * 2, c = Math.cos(lat);
        [x, y, z] = [c * Math.cos(a), Math.sin(lat), c * Math.sin(a)];
      } else {
        const lon = Math.floor(r() * 6) * (Math.PI / 6), a = r() * Math.PI * 2;
        [x, y, z] = [Math.cos(a) * Math.cos(lon), Math.sin(a), Math.cos(a) * Math.sin(lon)];
      }
      put(pos, i, x * 0.95, y * 0.95, z * 0.95);
      col[i] = r() < 0.1 ? 6 : y > 0.35 ? 3 : y > -0.1 ? 4 : y > -0.5 ? 0 : 2;
    });

    // five research assets, linked
    const P5 = [0, 1, 2, 3, 4].map((k) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      return [Math.cos(a) * 0.82, -Math.sin(a) * 0.82, (k % 2 ? -0.2 : 0.2)];
    });
    const L5 = [[0, 1], [0, 4], [0, 2], [1, 2], [4, 2], [3, 2]]; // 公司–岗位/联系人/候选人, 岗位/联系人/论文与专利–候选人
    make("pent", (i, r, pos, col) => {
      if (r() < 0.7) {
        const g = i % 5, s = sphere(r), rad = (g === 2 ? 0.26 : 0.18) * (0.85 + r() * 0.15);
        put(pos, i, P5[g][0] + s[0] * rad, P5[g][1] + s[1] * rad, P5[g][2] + s[2] * rad);
        col[i] = r() < 0.1 ? 6 : [3, 0, 1, 2, 4][g];
      } else {
        const [a, b] = L5[Math.floor(r() * L5.length)], t = r();
        put(pos, i, P5[a][0] + (P5[b][0] - P5[a][0]) * t, P5[a][1] + (P5[b][1] - P5[a][1]) * t, P5[a][2] + (P5[b][2] - P5[a][2]) * t);
        col[i] = 6;
      }
    });

    // the Boseek mark
    const bm = mask([BO_BODY, BO_CRESCENT], [100, 302, 230, 212], 360, "evenodd");
    const bk = Math.max(bm.w, bm.h) / 2;
    make("logo", (i, r, pos, col) => {
      const list = r() < 0.3 ? bm.edge : bm.fill;
      const p = list[Math.floor(r() * list.length)];
      const px = (p % bm.w) + r() - 0.5, py = Math.floor(p / bm.w) + r() - 0.5;
      const X = (px - bm.w / 2) / bk, Y = -(py - bm.h / 2) / bk;
      put(pos, i, X * 0.95, Y * 0.95, (r() - 0.5) * 0.16);
      col[i] = r() < 0.18 ? 6 : X < -0.1 ? 0 : Y < -0.3 ? 3 : 1;
    });

    // dissolved: everywhere, thinly
    make("dust", (i, r, pos, col, alp) => {
      put(pos, i, (r() * 2 - 1) * 2.3, (r() * 2 - 1) * 1.3, (r() * 2 - 1) * 1.4);
      col[i] = band(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], r());
      alp[i] = 0.55;
    });
    return S;
  }

  /* ---------- renderer ---------- */
  const VS = `#version 300 es
  in vec2 a_corner; in vec2 i_pos; in vec2 i_sr; in vec4 i_col;
  uniform vec2 u_view; out vec4 v_col;
  void main() {
    float c = cos(i_sr.y), s = sin(i_sr.y);
    vec2 p = i_pos + mat2(c, s, -s, c) * a_corner * i_sr.x;
    gl_Position = vec4(p / u_view * 2.0 - 1.0, 0.0, 1.0);
    gl_Position.y = -gl_Position.y;
    v_col = i_col;
  }`;
  const FS = `#version 300 es
  precision mediump float; in vec4 v_col; out vec4 o;
  void main() { o = vec4(v_col.rgb * v_col.a, v_col.a); }`;

  function createRenderer(canvas, maxN) {
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const tri = [];
    for (let k = 0; k < 3; k++) {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 3, b = -Math.PI / 2 + (((k + 1) % 3) * 2 * Math.PI) / 3;
      tri.push(Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b));
    }
    const corner = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, corner);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tri), gl.STATIC_DRAW);
    const aC = gl.getAttribLocation(prog, "a_corner");
    gl.enableVertexAttribArray(aC);
    gl.vertexAttribPointer(aC, 2, gl.FLOAT, false, 0, 0);
    const inst = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, inst);
    gl.bufferData(gl.ARRAY_BUFFER, maxN * 8 * 4, gl.DYNAMIC_DRAW);
    const attr = (name, size, off) => {
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 32, off);
      gl.vertexAttribDivisor(loc, 1);
    };
    attr("i_pos", 2, 0);
    attr("i_sr", 2, 8);
    attr("i_col", 4, 16);
    const uView = gl.getUniformLocation(prog, "u_view");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    return {
      draw(buf, n, w, h, dpr) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uView, w, h);
        gl.bindBuffer(gl.ARRAY_BUFFER, inst);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, buf, 0, n * 8);
        gl.lineWidth(1);
        gl.drawArraysInstanced(gl.LINES, 0, 6, n);
      },
    };
  }

  function create2D(canvas) {
    const ctx = canvas.getContext("2d");
    return {
      draw(buf, n, w, h, dpr) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 1;
        for (let i = 0; i < n; i++) {
          const o = i * 8, a = buf[o + 7];
          if (a < 0.02) continue;
          const x = buf[o], y = buf[o + 1], s = buf[o + 2], r = buf[o + 3];
          ctx.strokeStyle = `rgba(${(buf[o + 4] * 255) | 0},${(buf[o + 5] * 255) | 0},${(buf[o + 6] * 255) | 0},${a})`;
          ctx.beginPath();
          for (let k = 0; k <= 3; k++) {
            const t = r - Math.PI / 2 + (k * 2 * Math.PI) / 3;
            const px = x + Math.cos(t) * s, py = y + Math.sin(t) * s;
            k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.stroke();
        }
      },
    };
  }

  /* ---------- the field ---------- */
  function Field(canvas, opts = {}) {
    const small = opts.small ?? window.innerWidth < 760;
    const N = opts.count ?? (small ? 2600 : 7200);
    const M = opts.ambient ?? (small ? 380 : 900);
    const seed = opts.seed ?? 20261011;
    const shapes = makeShapes(N, seed);
    const r = rng(seed ^ 0x5bd1e995);
    const phase = new Float32Array(N), delay = new Float32Array(N), size = new Float32Array(N), spin = new Float32Array(N), rot = new Float32Array(N);
    const sw = new Float32Array(N * 3); // swirl direction used mid-morph
    const ox = new Float32Array(N + M), oy = new Float32Array(N + M), glow = new Float32Array(N + M);
    for (let i = 0; i < N; i++) {
      phase[i] = r() * 6.283;
      delay[i] = r();
      size[i] = 2.4 + r() * r() * 5;
      spin[i] = (r() - 0.5) * 0.9;
      rot[i] = r() * 6.283;
      sw[i * 3] = r() * 2 - 1;
      sw[i * 3 + 1] = r() * 2 - 1;
      sw[i * 3 + 2] = r() * 2 - 1;
    }
    const amb = new Float32Array(M * 6); // x, y (0..1), depth, size, colour, rot
    for (let j = 0; j < M; j++) {
      const deep = r();
      amb[j * 6] = r();
      amb[j * 6 + 1] = r();
      amb[j * 6 + 2] = deep;
      amb[j * 6 + 3] = deep > 0.96 ? 10 + r() * 16 : 1.8 + r() * 4;
      amb[j * 6 + 4] = band(r() * 4 - 2, r() * 2 - 1, 0, r());
      amb[j * 6 + 5] = r() * 6.283;
    }
    const buf = new Float32Array((N + M) * 8);
    const renderer = (!opts.force2d && createRenderer(canvas, N + M)) || create2D(canvas);
    let W = 1, H = 1, dpr = 1;
    const pointer = { x: -9999, y: -9999, active: false };

    function resize(w, h, ratio) {
      W = w;
      H = h;
      dpr = ratio;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }

    /* state: {a, b, t, la, lb, time, intro, scrollShift, calm, alpha} */
    function render(st) {
      const A = shapes[st.a], B = shapes[st.b];
      const t = st.t, la = st.la, lb = st.lb;
      const lt = ease(t);
      const L = {
        x: la.x + (lb.x - la.x) * lt,
        y: la.y + (lb.y - la.y) * lt,
        s: la.s + (lb.s - la.s) * lt,
        ry: la.ry + (lb.ry - la.ry) * lt,
        rx: (la.rx || 0) + ((lb.rx || 0) - (la.rx || 0)) * lt,
        a: (la.a ?? 1) + ((lb.a ?? 1) - (la.a ?? 1)) * lt,
      };
      const time = st.time;
      const idle = st.calm ? 0 : 1;
      const ry = L.ry + Math.sin(time * 0.17) * 0.22 * idle + (st.drag || 0);
      const rx = L.rx + Math.sin(time * 0.11) * 0.06 * idle;
      const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      const S = L.s * Math.min(H, W * 0.75) * 0.5;
      const X0 = L.x * W, Y0 = L.y * H;
      const cam = 3.4;
      const intro = st.intro ?? 1;
      const pr = 150, pr2 = pr * pr;
      let o = 0;
      for (let i = 0; i < N; i++) {
        const k = i * 3;
        const ti = st.calm ? smooth(t) : ease(clamp(t * 1.5 - delay[i] * 0.5));
        const burst = Math.sin(Math.PI * ti) * (st.calm ? 0 : 0.42);
        let x = A.pos[k] + (B.pos[k] - A.pos[k]) * ti + sw[k] * burst;
        let y = A.pos[k + 1] + (B.pos[k + 1] - A.pos[k + 1]) * ti + sw[k + 1] * burst;
        let z = A.pos[k + 2] + (B.pos[k + 2] - A.pos[k + 2]) * ti + sw[k + 2] * burst;
        if (intro < 1) {
          const e = ease(clamp(intro * 1.35 - delay[i] * 0.35));
          x *= e;
          y *= e;
          z *= e;
        }
        const br = 0.006 * idle;
        x += Math.sin(time * 0.9 + phase[i]) * br;
        y += Math.cos(time * 0.8 + phase[i]) * br;
        // rotate y then x
        let x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        let y1 = y * cx - z1 * sx;
        z1 = y * sx + z1 * cx;
        const p = cam / (cam - z1);
        let px = X0 + x1 * S * p, py = Y0 - y1 * S * p;
        // pointer: push aside and light up
        const dx = px - pointer.x, dy = py - pointer.y, d2 = dx * dx + dy * dy;
        let tx = 0, ty = 0, tg = 0;
        if (pointer.active && d2 < pr2 && !st.calm) {
          const d = Math.sqrt(d2) + 0.001, f = (1 - d / pr) ** 2;
          tx = (dx / d) * f * 46;
          ty = (dy / d) * f * 46;
          tg = f;
        }
        const kk = st.instant ? 1 : 0.14;
        ox[i] += (tx - ox[i]) * kk;
        oy[i] += (ty - oy[i]) * kk;
        glow[i] += (tg - glow[i]) * (st.instant ? 1 : 0.12);
        px += ox[i];
        py += oy[i];
        const ca = PAL[A.col[i]], cb = PAL[B.col[i]];
        const g = glow[i];
        const rr = (ca[0] + (cb[0] - ca[0]) * ti) / 255, gg = (ca[1] + (cb[1] - ca[1]) * ti) / 255, bb = (ca[2] + (cb[2] - ca[2]) * ti) / 255;
        const depthA = clamp(0.28 + (p - 0.78) * 1.6, 0.12, 1);
        const alpha = clamp((A.alp[i] + (B.alp[i] - A.alp[i]) * ti) * depthA * L.a * (0.55 + 0.45 * intro) + g * 0.6);
        buf[o] = px;
        buf[o + 1] = py;
        buf[o + 2] = size[i] * p * (1 + g * 0.8);
        buf[o + 3] = rot[i] + time * spin[i] * idle;
        buf[o + 4] = rr + (1 - rr) * g;
        buf[o + 5] = gg + (1 - gg) * g;
        buf[o + 6] = bb + (1 - bb) * g;
        buf[o + 7] = alpha;
        o += 8;
      }
      // ambient dust everywhere, drifting with its own parallax
      const shift = st.scrollShift || 0;
      for (let j = 0; j < M; j++) {
        const q = j * 6, deep = amb[q + 2];
        let px = ((amb[q] * W + time * (4 + deep * 10) * idle) % (W + 60)) - 30;
        let py = ((((amb[q + 1] * H * 1.6 - shift * (0.15 + deep * 0.5)) % (H * 1.6)) + H * 1.6) % (H * 1.6)) - H * 0.3;
        const idx = N + j;
        const dx = px - pointer.x, dy = py - pointer.y, d2 = dx * dx + dy * dy;
        let tx = 0, ty = 0, tg = 0;
        if (pointer.active && d2 < pr2 && !st.calm) {
          const d = Math.sqrt(d2) + 0.001, f = (1 - d / pr) ** 2;
          tx = (dx / d) * f * 30;
          ty = (dy / d) * f * 30;
          tg = f;
        }
        const ka = st.instant ? 1 : 0.1;
        ox[idx] += (tx - ox[idx]) * ka;
        oy[idx] += (ty - oy[idx]) * ka;
        glow[idx] += (tg - glow[idx]) * ka;
        const c = PAL[amb[q + 4]], g = glow[idx];
        const big = amb[q + 3] > 9;
        buf[o] = px + ox[idx];
        buf[o + 1] = py + oy[idx];
        buf[o + 2] = amb[q + 3];
        buf[o + 3] = amb[q + 5] + time * 0.12 * idle * (big ? 0.4 : 1);
        buf[o + 4] = c[0] / 255 + (1 - c[0] / 255) * g;
        buf[o + 5] = c[1] / 255 + (1 - c[1] / 255) * g;
        buf[o + 6] = c[2] / 255 + (1 - c[2] / 255) * g;
        buf[o + 7] = clamp((big ? 0.5 : 0.22 + deep * 0.45) * (st.ambient ?? 1) + g * 0.5);
        o += 8;
      }
      renderer.draw(buf, N + M, W, H, dpr);
    }

    return { resize, render, pointer, shapes: Object.keys(shapes) };
  }

  window.HBField = Field;
})();
