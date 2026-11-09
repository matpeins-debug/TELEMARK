// TELEMARK · Orte-Renderer (Entwurf). Canvas 2D, Bildraum 1280 × 800, Horizont um y 520.
// Berge aus natürlichen Gratlinien (Mittelpunktverschiebung), Flächen aus Graten und Rinnen, Wald mit Zungen.
// Statische Ebenen werden einmal gezeichnet, bewegte Details je Bild darüber.
(function () {
  const I = { kobalt: "#1F56A8", himmel: "#4F86C6", dunst: "#BFD6EA", papier: "#F4EEDF", schatten: "#8DAFD8", tief: "#5C78B8",
    gluehen: "#E9A58C", violett: "#6B5C8E", fichte: "#2D5546", fichteD: "#1D3A33", dach: "#8E4A2E", rot: "#C23B2A", ocker: "#DDA43B",
    tinte: "#1E2734", gruen: "#3F6B55", navy: "#23466B" };
  const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  function mix(a, b, t) { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const W = 1280, H = 800, BASE = 548;

  const PAL = {
    sonne: {
      abend: false,
      sky: [I.kobalt, mix(I.kobalt, I.himmel, 0.5), I.himmel, mix(I.himmel, I.dunst, 0.5), I.dunst],
      alp: { lit: I.papier, shade: I.schatten, firn: I.dunst, rock: I.tief, rockLit: I.schatten, crev: I.schatten },
      alpFar: { lit: mix(I.papier, I.dunst, 0.3), shade: mix(I.schatten, I.dunst, 0.4), firn: I.dunst, rock: mix(I.tief, I.dunst, 0.35), rockLit: mix(I.schatten, I.dunst, 0.3), crev: I.schatten },
      alpErd: { lit: I.schatten, shade: mix(I.tief, I.schatten, 0.3), firn: mix(I.schatten, I.dunst, 0.4), rock: mix(I.tief, I.tinte, 0.25), rockLit: mix(I.tief, I.schatten, 0.4), crev: mix(I.tief, I.schatten, 0.5) },
      dol: { lit: mix(I.papier, I.ocker, 0.22), shade: mix(I.schatten, I.violett, 0.3), rock: mix(I.tief, I.violett, 0.35), ledge: I.papier, scree: I.papier },
      dolErd: { lit: mix(I.schatten, I.violett, 0.2), shade: mix(I.tief, I.violett, 0.3), rock: mix(I.tief, I.tinte, 0.3), ledge: mix(I.schatten, I.dunst, 0.4), scree: mix(I.schatten, I.dunst, 0.3) },
      hug: { lit: mix(I.fichte, I.dunst, 0.22), fill: mix(I.fichteD, I.tief, 0.2), piste: I.papier, frost: mix(I.fichte, I.papier, 0.5) },
      hugFar: { lit: mix(I.tief, I.dunst, 0.32), fill: mix(I.tief, I.fichte, 0.45), piste: mix(I.papier, I.dunst, 0.5), frost: mix(I.dunst, I.tief, 0.25) },
      forest: mix(I.tief, I.fichte, 0.45), forestFar: mix(mix(I.tief, I.fichte, 0.45), I.dunst, 0.35),
      moon: null,
      valley: I.papier, valleyShade: I.schatten,
      wall: I.papier, wallSide: I.schatten, roof: I.dach, roofSnow: I.papier, roofSnowD: I.schatten, slate: mix(I.tinte, I.tief, 0.35), timber: mix(I.dach, I.tinte, 0.45), wood: mix(I.dach, I.tinte, 0.2),
      win: I.tief, winHi: I.tief, winOff: I.tief, door: I.dach,
      tree: I.fichte, treeD: I.fichteD, tSnow: I.papier, tSnowD: I.schatten,
      hill: [I.papier, I.dunst, I.schatten, I.tief], kante: I.schatten, mulde: I.dunst, key: I.tief, hillShadow: I.tief, lip: null,
      water: [mix(I.himmel, I.dunst, 0.55), mix(I.himmel, I.kobalt, 0.25)], waterLine: I.papier,
      smoke: I.papier, smokeD: I.dunst, line: I.tief, loco: I.fichteD,
      chalk: I.papier, spray: I.tinte, band: I.kobalt, bandInk: I.papier,
    },
    gluehen: {
      abend: true,
      sky: [mix(I.violett, I.tinte, 0.4), I.violett, mix(I.violett, I.gluehen, 0.3), mix(I.violett, I.gluehen, 0.55), mix(I.violett, I.gluehen, 0.78)],
      alp: { lit: I.gluehen, shade: I.violett, firn: mix(I.gluehen, I.papier, 0.5), rock: mix(I.violett, I.tinte, 0.38), rockLit: mix(I.gluehen, I.violett, 0.45), crev: mix(I.gluehen, I.violett, 0.4) },
      alpFar: { lit: mix(I.gluehen, I.violett, 0.18), shade: mix(I.violett, I.gluehen, 0.2), firn: mix(I.gluehen, I.papier, 0.3), rock: mix(I.violett, I.tinte, 0.2), rockLit: mix(I.gluehen, I.violett, 0.5), crev: mix(I.gluehen, I.violett, 0.4) },
      alpErd: { lit: mix(I.violett, I.schatten, 0.45), shade: I.violett, firn: mix(I.violett, I.schatten, 0.62), rock: mix(I.violett, I.tinte, 0.35), rockLit: mix(I.violett, I.schatten, 0.2), crev: mix(I.violett, I.schatten, 0.2) },
      dol: { lit: mix(I.gluehen, I.rot, 0.3), shade: mix(I.violett, I.rot, 0.15), rock: mix(I.violett, I.tinte, 0.3), ledge: mix(I.gluehen, I.papier, 0.55), scree: mix(I.gluehen, I.papier, 0.3) },
      dolErd: { lit: mix(I.violett, I.schatten, 0.35), shade: I.violett, rock: mix(I.violett, I.tinte, 0.4), ledge: mix(I.violett, I.schatten, 0.6), scree: mix(I.violett, I.schatten, 0.5) },
      hug: { lit: mix(I.fichte, I.violett, 0.4), fill: mix(I.fichteD, I.violett, 0.22), piste: mix(I.schatten, I.violett, 0.3), frost: mix(I.schatten, I.violett, 0.5) },
      hugFar: { lit: mix(I.violett, I.schatten, 0.3), fill: mix(I.violett, I.fichteD, 0.45), piste: mix(I.violett, I.schatten, 0.55), frost: mix(I.violett, I.schatten, 0.4) },
      forest: mix(I.violett, I.fichteD, 0.55), forestFar: mix(I.violett, I.fichteD, 0.35),
      moon: mix(I.papier, I.gluehen, 0.25),
      valley: mix(I.schatten, I.violett, 0.3), valleyShade: mix(I.violett, I.schatten, 0.3),
      wall: mix(I.papier, I.violett, 0.3), wallSide: mix(I.violett, I.papier, 0.25), roof: mix(I.dach, I.violett, 0.4), roofSnow: mix(I.papier, I.violett, 0.38), roofSnowD: mix(I.violett, I.schatten, 0.35), slate: mix(I.tinte, I.violett, 0.35), timber: mix(I.dach, I.tinte, 0.6), wood: mix(I.dach, I.tinte, 0.45),
      win: I.ocker, winHi: mix(I.ocker, I.papier, 0.45), winOff: mix(I.violett, I.tinte, 0.3), door: mix(I.dach, I.violett, 0.4),
      tree: mix(I.fichte, I.violett, 0.3), treeD: I.fichteD, tSnow: mix(I.schatten, I.gluehen, 0.25), tSnowD: mix(I.schatten, I.violett, 0.45),
      hill: [mix(I.schatten, I.gluehen, 0.32), mix(I.schatten, I.violett, 0.35), mix(I.violett, I.schatten, 0.25), mix(I.violett, I.tinte, 0.3)],
      kante: mix(I.violett, I.schatten, 0.3), mulde: mix(I.schatten, I.violett, 0.25), key: mix(I.violett, I.tinte, 0.45), hillShadow: mix(I.violett, I.tinte, 0.35), lip: mix(I.gluehen, I.papier, 0.4),
      water: [mix(I.violett, I.gluehen, 0.5), mix(I.violett, I.tinte, 0.15)], waterLine: mix(I.gluehen, I.papier, 0.4),
      smoke: mix(I.papier, I.violett, 0.42), smokeD: mix(I.violett, I.papier, 0.22), line: mix(I.violett, I.tinte, 0.5), loco: I.fichteD,
      chalk: mix(I.papier, I.gluehen, 0.3), spray: I.tinte, band: mix(I.violett, I.tinte, 0.45), bandInk: mix(I.papier, I.gluehen, 0.2),
    },
  };

  let ctx, P, r, OFF = [1.3, 0.7];
  function path(pts) { ctx.beginPath(); addPath(pts); }
  function addPath(pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function fill(pts, c) { path(pts); ctx.fillStyle = c; ctx.fill(); }
  function shade(pts, c) { ctx.save(); ctx.translate(OFF[0], OFF[1]); fill(pts, c); ctx.restore(); }
  function line(pts, c, w) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
  function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function dot(x, y, rad, c) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, rad), 0, 6.2832); ctx.fillStyle = c; ctx.fill(); }
  function spray(yAt, up, down, x0, x1, n, reach) {
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = yAt(x);
      dot(x, y + Math.pow(r(), 2.4) * reach, 0.55 + r() * 0.9, up);
      if (i % 3 === 0) dot(x0 + r() * (x1 - x0), y - Math.pow(r(), 2.4) * reach * 0.4, 0.5 + r() * 0.7, down);
    }
  }
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => 1 - Math.pow(1 - clamp01(v), 3);
  const lerp = (a, b, t) => a + (b - a) * t;

  // ================================================================ Gratlinie und Bergflächen
  function ridge(ctrl, rough, rr) {
    let pts = ctrl.map((p) => [p[0], p[1]]), amp = rough;
    for (let it = 0; it < 7; it++) {
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], dx = b[0] - a[0];
        if (dx > 6) out.push([(a[0] + b[0]) / 2 + (rr() - 0.5) * dx * 0.1, (a[1] + b[1]) / 2 + (rr() - 0.5) * dx * amp]);
        out.push(b);
      }
      pts = out; amp *= 0.56;
    }
    return pts;
  }
  function skyY(sil, x) {
    if (x <= sil[0][0]) return sil[0][1];
    for (let i = 1; i < sil.length; i++) if (x <= sil[i][0]) { const a = sil[i - 1], b = sil[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / ((b[0] - a[0]) || 1); }
    return sil[sil.length - 1][1];
  }
  function nearest(sil, x) { let bi = 0, bd = 1e9; for (let i = 0; i < sil.length; i++) { const d = Math.abs(sil[i][0] - x); if (d < bd) { bd = d; bi = i; } } return bi; }
  // Falllinie mit Drift, die sich von oben (d0) nach unten (d1) ändert: Grate fächern zum Fuß hin auf
  function fall2(x, y, yEnd, rr, d0, d1) { const pts = [[x, y]]; let cx = x; const L = Math.max(1, yEnd - y); for (let yy = y + 8; yy < yEnd; yy += 8) { const u = (yy - y) / L; cx += (rr() - 0.5) * 3.2 + (d0 + (d1 - d0) * u) * 8; pts.push([cx, yy]); } pts.push([cx, yEnd]); return pts; }
  function fall(x, y, yEnd, rr, drift) { const pts = [[x, y]]; let cx = x; for (let yy = y + 9; yy < yEnd; yy += 9) { cx += (rr() - 0.5) * 5 + drift * 9; pts.push([cx, yy]); } pts.push([cx, yEnd]); return pts; }
  function xAt(L, y) {
    if (y <= L[0][1]) return L[0][0];
    for (let i = 1; i < L.length; i++) if (y <= L[i][1]) { const a = L[i - 1], b = L[i]; return a[0] + (b[0] - a[0]) * (y - a[1]) / ((b[1] - a[1]) || 1); }
    return L[L.length - 1][0];
  }
  // Keil entlang einer Falllinie: mode 0 mittig (Rinne), -1 als Band links davon (Lichtrippe)
  function taper(L, w, mode) {
    const A = [], B = [], n = L.length - 1;
    L.forEach((p, i) => {
      const t = i / (n || 1), ww = w * Math.pow(1 - t, 0.8) * (0.75 + 0.25 * Math.sin(t * 6 + w));
      if (mode < 0) { A.push(p); B.push([p[0] - ww, p[1] + ww * 0.15]); } else { A.push([p[0] - ww / 2, p[1]]); B.push([p[0] + ww / 2, p[1]]); }
    });
    return A.concat(B.reverse());
  }
  function tipped(sil, rr, hgt) {
    const out = [], a = sil[0][0], b = sil[sil.length - 1][0]; let i = 0;
    for (let x = a; x < b; x += 3.4) out.push([x, skyY(sil, x) - (i++ % 2 ? 0 : hgt * (0.5 + rr() * 0.8))]);
    out.push(sil[sil.length - 1]);
    return out;
  }

  function buildRange(R, seed) {
    const rr = rng(seed);
    let sil = ridge(R.ctrl, R.rough, rr);
    if (R.style === "huegel") sil = tipped(sil, rr, R.far ? 2.5 : 4.5);
    const x0 = sil[0][0], x1 = sil[sil.length - 1][0], ys = (x) => skyY(sil, x);
    const top = Math.min.apply(null, sil.map((p) => p[1]));
    const G = { R, sil, top, poly: sil.concat([[x1, BASE + 6], [x0, BASE + 6]]), faces: [], ribs: [], cou: [], rock: [], firn: [], crev: [], wall: [], striae: [], ledges: [], scree: [], pistes: [], frost: [], forest: null, peaks: [] };
    const S = R.ctrl.filter((p) => p[2] === "S").map((p) => p[0]);
    const V = R.ctrl.filter((p) => p[2] === "V").map((p) => p[0]);
    const det = R.detail == null ? 1 : R.detail, rocky = R.rocky == null ? 1 : R.rocky;
    const spurs = S.map((xs) => fall2(xs, ys(xs) + 1, BASE + 6, rr, (rr() - 0.5) * 0.3, (rr() - 0.5) * 1.0));
    const litIv = []; let prevX = x0;
    S.forEach((xs, i) => {
      G.peaks.push([xs, ys(xs)]);
      const xn = i < S.length - 1 ? S[i + 1] : x1 + 1;
      const xv = V.find((v) => v > xs && v < xn);
      litIv.push([prevX, xs]);
      const spur = spurs[i], iS = nearest(sil, xs);
      let xe;
      if (xv != null) {
        const g = fall2(xv, ys(xv) + 1, BASE + 6, rr, (rr() - 0.5) * 0.2, (rr() - 0.5) * 0.7), nx = spurs[i + 1];
        for (const p of g) { const a = xAt(spur, p[1]) + 8; if (nx) { const b = xAt(nx, p[1]) - 8; if (p[0] > b) p[0] = b; } if (p[0] < a) p[0] = a; }
        G.faces.push(sil.slice(iS, nearest(sil, xv) + 1).concat(g.slice(1), spur.slice().reverse()));
        xe = xv; prevX = xv;
      } else {
        G.faces.push(sil.slice(iS).concat([[x1, BASE + 6]], spur.slice().reverse()));
        xe = x1; prevX = x1;
      }
      const nr = Math.max(1, Math.round((xe - xs) / 80 * det));
      for (let k = 0; k < nr; k++) {
        const xa = xs + (xe - xs) * (0.18 + 0.64 * (k + 0.2 + rr() * 0.6) / nr), ya = ys(xa) + 1;
        const len = (BASE - ya) * (0.22 + rr() * 0.4);
        if (len > 14) G.ribs.push(taper(fall2(xa, ya, ya + len, rr, 0.55 + rr() * 0.4, 0.15 + rr() * 0.25), 4 + rr() * 9, -1));
      }
    });
    litIv.push([prevX, x1]);
    if (R.style === "alpin") {
      for (const [a, b] of litIv) {
        const n = Math.round((b - a) / 55 * det);
        for (let k = 0; k < n; k++) {
          const xa = a + (b - a) * (k + 0.2 + rr() * 0.6) / n, ya = ys(xa) + 1;
          const len = Math.min(140, (BASE - ya) * (0.15 + rr() * 0.35));
          if (len > 12) G.cou.push(taper(fall2(xa, ya + 2, ya + len, rr, -(0.5 + rr() * 0.4), -(0.1 + rr() * 0.25)), 3 + rr() * 6, 0));
        }
      }
      const inShade = (x) => G.faces.length && S.some((xs, i) => { const xn = i < S.length - 1 ? S[i + 1] : x1 + 1, xv = V.find((v) => v > xs && v < xn); return x > xs && x < (xv != null ? xv : x1); });
      for (let x = x0 + 10; x < x1 - 10; x += 16) {
        const sl = Math.abs(ys(x + 8) - ys(x - 8)) / 16;
        if (sl > 0.6 && rr() < 0.32 * rocky) {
          const sh = inShade(x), ya = ys(x) + 3 + rr() * 6, len = 22 + rr() * 54 * rocky, d = sh ? 1 : -1;
          G.rock.push(taper(fall2(x, ya, ya + len, rr, d * (0.45 + rr() * 0.4), d * (0.1 + rr() * 0.2)), 6 + rr() * 7 * rocky, 0));
        }
      }
      if (R.firn) {
        const [a, b, d] = R.firn, tp = [], bt = [];
        for (let x = a; x <= b; x += 8) { tp.push([x, ys(x) - 2]); bt.push([x, ys(x) + d * (0.55 + 0.45 * Math.sin((x - a) / (b - a) * Math.PI)) + (rr() - 0.5) * 6]); }
        G.firn.push(tp.concat(bt.reverse()));
        for (let k = 0; k < 6; k++) { const x = a + (b - a) * (0.1 + 0.8 * rr()), y = ys(x) + d * (0.25 + rr() * 0.45); G.crev.push([[x - 8 - rr() * 10, y], [x + 8 + rr() * 10, y + 2 - rr() * 4]]); }
      }
      if (R.wall) {
        const [a, b, off, h] = R.wall, tp = [], bt = [];
        for (let x = a; x <= b; x += 7) { tp.push([x, ys(x) + off]); bt.push([x, ys(x) + off + h * (0.55 + rr() * 0.55)]); }
        G.wall.push(tp.concat(bt.reverse()));
      }
    }
    if (R.style === "dolomit") {
      for (let x = x0 + 3; x < x1; x += 6 + rr() * 8) {
        const ya = ys(x) + 2 + rr() * 10, len = 20 + rr() * 150 * (R.cliff || 1);
        G.striae.push({ pts: [[x, ya], [x + (rr() - 0.5) * 6, ya + len]], w: 0.9 + rr() * 1.6 });
      }
      for (let k = 0; k < 60 * det; k++) { const x = x0 + rr() * (x1 - x0), ya = ys(x) + 8 + rr() * (BASE - ys(x)) * 0.6, l = 6 + rr() * 16; G.ledges.push([[x, ya], [x + l, ya + 1.5]]); }
      for (let x = x0 + 40; x < x1; x += 50 + rr() * 60) { const yt = BASE - 50 - rr() * 60, w = 16 + rr() * 26; G.scree.push([[x, yt], [x + w, BASE + 6], [x - w, BASE + 6]]); }
    }
    if (R.style === "huegel") {
      for (const [px, w] of (R.pisten || [])) { const y0 = ys(px) + 3, dd = 0.25; G.pistes.push([[px - w * 0.25, y0], [px + w * 0.25, y0], [px + w * 0.6 - (BASE - y0) * dd, BASE + 6], [px - w * 0.6 - (BASE - y0) * dd, BASE + 6]]); }
      const n = Math.round((x1 - x0) * (BASE - top) / 260);
      for (let k = 0; k < n; k++) { const x = x0 + rr() * (x1 - x0), y = ys(x) + rr() * (BASE - ys(x)); G.frost.push([x, y, 0.7 + rr() * 1.1]); }
    }
    if (R.tree && R.style !== "huegel") {
      const tongues = V.map((v) => [v, 24 + rr() * 40, 18 + rr() * 18]);
      const pts = []; let i = 0;
      for (let x = x0; x <= x1; x += 4.5) {
        let y = R.tree + Math.sin(x * 0.03 + seed) * 4;
        for (const [v, a, w] of tongues) y -= a * Math.exp(-Math.pow((x - v) / w, 2));
        pts.push([x, y - (i++ % 2 ? 0 : 5 + rr() * 6)]);
      }
      G.forest = pts.concat([[x1, BASE + 6], [x0, BASE + 6]]);
    }
    return G;
  }
  function rangeColors(G, mode) {
    const R = G.R;
    if (R.style === "huegel") return R.far ? P.hugFar : P.hug;
    if (R.style === "dolomit") return mode === "erd" ? P.dolErd : P.dol;
    return mode === "erd" ? P.alpErd : R.far ? P.alpFar : P.alp;
  }
  function paintRange(G, mode) {
    const R = G.R, C = rangeColors(G, mode);
    ctx.save(); path(G.poly); ctx.clip();
    fill(G.poly, C.lit);
    if (R.style === "huegel") {
      for (const f of G.faces) shade(f, C.fill);
      for (const p of G.pistes) fill(p, C.piste);
      for (const d of G.frost) dot(d[0], d[1], d[2], C.frost);
    } else if (R.style === "dolomit") {
      for (const s of G.scree) fill(s, C.scree);
      for (const f of G.faces) shade(f, C.shade);
      for (const q of G.ribs) fill(q, C.lit);
      for (const l of G.striae) line(l.pts, C.rock, l.w);
      for (const l of G.ledges) line(l, C.ledge, 1.7);
    } else {
      for (const f of G.firn) fill(f, C.firn);
      for (const l of G.crev) line(l, C.crev, 1.8);
      for (const q of G.cou) fill(q, C.shade);
      for (const q of G.rock) fill(q, C.rockLit);
      for (const q of G.wall) fill(q, mix(C.rockLit, C.rock, 0.55));
      for (const f of G.faces) shade(f, C.shade);
      ctx.save(); ctx.beginPath(); for (const f of G.faces) addPath(f); ctx.clip();
      for (const q of G.rock) shade(q, C.rock);
      for (const q of G.wall) shade(q, C.rock);
      ctx.restore();
      for (const q of G.ribs) fill(q, C.lit);
    }
    if (G.forest) fill(G.forest, R.far ? P.forestFar : P.forest);
    ctx.restore();
  }
  // Schattengrenze am Abend: gemeinsame Höhe, wie der Erdschatten
  const erdLine = (x) => 372 + Math.sin(x * 0.011) * 10 + Math.sin(x * 0.037) * 4;

  // ================================================================ Himmel, Tal, Wasser
  function sky() {
    const ys = [0, 118, 222, 318, 412, 560];
    for (let i = 0; i < 5; i++) rect(-40, ys[i], W + 80, ys[i + 1] - ys[i] + 1, P.sky[i]);
    for (let i = 1; i < 5; i++) spray(() => ys[i], P.sky[i - 1], P.sky[i], -20, W + 20, 2200, 30);
    if (P.moon) dot(986, 178, 12, P.moon);
  }
  function forestBand(y) {
    const pts = [[-20, y + 26]]; let x = -20;
    while (x < W + 20) {
      const h = 10 + r() * 18 + (Math.sin(x * 0.01) + 1) * 6, w = 6 + r() * 6;
      pts.push([x, y - r() * 4], [x + w / 2, y - h], [x + w, y - r() * 4]);
      x += w * (0.7 + r() * 0.4);
    }
    pts.push([W + 20, y + 26]);
    fill(pts, P.forest);
    fill([[-20, y + 22], [300, y + 18], [700, y + 24], [1000, y + 18], [1300, y + 22], [1300, y + 14], [-20, y + 12]], P.forest);
    shade([[-20, y + 22], [260, y + 18], [520, y + 26], [760, y + 20], [1000, y + 26], [1300, y + 20], [1300, y + 34], [1000, y + 40], [720, y + 32], [460, y + 40], [200, y + 32], [-20, y + 38]], P.valleyShade);
  }
  function valley(O) {
    if (O.fjord) {
      const F = O.fjord;
      rect(-20, F.y0, W + 40, F.y1 - F.y0 + 6, P.water[1]);
      rect(-20, F.y0, W + 40, (F.y1 - F.y0) * 0.36, P.water[0]);
      spray(() => F.y0 + (F.y1 - F.y0) * 0.36, P.water[0], P.water[1], -20, W + 20, 1400, 16);
      for (let k = 0; k < 80; k++) { const x = r() * 1300, y = F.y0 + 5 + r() * (F.y1 - F.y0 - 8), l = 6 + r() * 24; line([[x, y], [x + l, y]], P.waterLine, 1.1); }
      for (const [x, yb, w, h] of F.islands) {
        const pts = []; for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push([x - w / 2 + u * w, yb - h * Math.pow(Math.sin(u * Math.PI), 0.6) - (k % 2 ? 0 : 1.5)]); }
        pts.push([x + w / 2, yb + 1], [x - w / 2, yb + 1]);
        fill(pts, P.hugFar.fill);
        fill(pts.slice(0, 9).concat([[x, yb + 1], [x - w / 2, yb + 1]]), P.hugFar.lit);
        line([[x - w / 2 - 4, yb + 1.5], [x + w / 2 + 4, yb + 1.5]], P.waterLine, 1.2);
      }
      const shore = []; for (let x = -20; x <= W + 20; x += 40) shore.push([x, F.y1 + Math.sin(x * 0.02) * 3]);
      fill(shore.concat([[W + 20, 820], [-20, 820]]), P.valley);
      line(shore, P.valleyShade, 2.4);
      return;
    }
    const y = O.valleyY || 534;
    fill([[-20, y], [200, y - 4], [520, y + 2], [800, y - 4], [1050, y], [1300, y - 4], [1300, 820], [-20, 820]], P.valley);
    forestBand(y);
  }
  function valleyDetail(O) {
    if (O.fjord) return;
    const rr = rng(hash(O.id) ^ 41);
    for (const [x, y, L, t] of [[700, 590, 160, 7], [860, 680, 220, 9], [1120, 676, 180, 8], [640, 720, 200, 10]]) {
      ctx.save(); ctx.translate(x + OFF[0] + (rr() - 0.5) * 30, y + OFF[1]); ctx.beginPath(); ctx.ellipse(0, 0, L / 2, t / 2, -0.04, 0, 6.2832); ctx.fillStyle = P.valleyShade; ctx.fill(); ctx.restore();
    }
    grove([[662, 680, 34, 0], [686, 686, 26, 2], [762, 704, 46, 1], [792, 710, 32, 0], [820, 702, 24, 2]], true);
  }
  function river(Rv) {
    const top = [], bot = [];
    for (let x = Rv.x0 || 460; x <= W + 20; x += 30) { top.push([x, Rv.y + Math.sin(x * 0.013) * 3]); bot.push([x, Rv.y + Rv.h + Math.sin(x * 0.013 + 1) * 3]); }
    fill(top.concat(bot.reverse()), P.water[1]);
    for (let k = 0; k < 26; k++) { const x = (Rv.x0 || 460) + r() * 840, y = Rv.y + 2 + r() * (Rv.h - 3); line([[x, y], [x + 5 + r() * 12, y]], P.waterLine, 1); }
  }

  // ================================================================ Häuser, Kirchen, Wahrzeichen
  function preset(type, rr) {
    const o = { wall: P.wall, side: P.wallSide, roof: P.roof, k: 0.28, balcony: true };
    switch (type) {
      case "fachwerk": return Object.assign(o, { roof: P.slate, k: 0.52, timber: P.timber, balcony: false });
      case "goral": return Object.assign(o, { wall: P.wood, side: mix(P.wood, I.tinte, 0.35), k: 0.82, logs: mix(P.wood, I.tinte, 0.3), balcony: false });
      case "nordisch": { const c = [I.rot, I.ocker, P.wall, mix(I.dach, I.rot, 0.5)][Math.floor(rr() * 4)]; const cw = P.abend && c !== P.wall ? mix(c, I.violett, 0.38) : c; return Object.assign(o, { wall: cw, side: mix(cw, I.tinte, 0.28), roof: P.slate, k: 0.42, balcony: false }); }
      case "italien": return Object.assign(o, { wall: mix(P.wall, I.ocker, 0.22), side: mix(P.wallSide, I.ocker, 0.15), k: 0.16, shut: I.gruen, balcony: false });
      case "bayern": return Object.assign(o, { k: 0.3, paint: rr() < 0.55 ? [I.ocker, I.rot, I.gruen, I.himmel][Math.floor(rr() * 4)] : null });
      default: return o;
    }
  }
  function house(x, yb, w, h, o) {
    const d = w * 0.5, ox = d * 0.62, oy = d * 0.24, g = w * (o.k == null ? 0.28 : o.k);
    shade([[x + w, yb], [x + w + ox, yb - oy], [x + w + ox, yb - h - oy], [x + w, yb - h]], o.side);
    fill([[x, yb], [x + w, yb], [x + w, yb - h], [x + w / 2, yb - h - g], [x, yb - h]], o.wall);
    if (o.logs) for (let yy = yb - 2.4; yy > yb - h - g * 0.6; yy -= 2.6) line([[x, yy], [x + w, yy]], o.logs, 0.6);
    if (o.timber) {
      const T = o.timber, lw = Math.max(0.8, w * 0.045);
      for (const f of [0.03, 0.36, 0.64, 0.97]) line([[x + w * f, yb], [x + w * f, yb - h]], T, lw);
      line([[x, yb - h * 0.5], [x + w, yb - h * 0.5]], T, lw);
      line([[x, yb - h + 0.4], [x + w, yb - h + 0.4]], T, lw);
      line([[x + w * 0.03, yb], [x + w * 0.36, yb - h * 0.5]], T, lw * 0.9);
      line([[x + w * 0.97, yb], [x + w * 0.64, yb - h * 0.5]], T, lw * 0.9);
      line([[x + w / 2, yb - h], [x + w / 2, yb - h - g * 0.8]], T, lw);
    }
    fill([[x + w / 2, yb - h - g], [x + w / 2 + ox, yb - h - g - oy], [x + w + ox + 2, yb - h - oy + 1.5], [x + w + 2, yb - h + 1.5]], o.roof);
    fill([[x + w / 2, yb - h - g - 1.2], [x + w / 2 + ox, yb - h - g - oy - 1.2], [x + w + ox, yb - h - oy - 1], [x + w, yb - h - 1]], P.roofSnow);
    line([[x - 2, yb - h + 2], [x + w / 2, yb - h - g], [x + w + 2, yb - h + 2]], o.roof, 1.8);
    line([[x - 1, yb - h + 0.6], [x + w / 2, yb - h - g - 1.4], [x + w + 1, yb - h + 0.6]], P.roofSnow, 1.2);
    if (o.balcony) line([[x, yb - h * 0.52], [x + w, yb - h * 0.52]], o.roof, 1.2);
    if (o.paint) rect(x + w * 0.34, yb - h * 0.9, w * 0.32, h * 0.26, o.paint);
    const fw = Math.max(1.6, w * 0.13), fh = Math.max(2, h * 0.19), n = w > 20 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const fx = x + (w / (n + 1)) * (i + 1) - fw / 2;
      if (!(o.paint && i === Math.floor(n / 2))) rect(fx, yb - h * 0.86, fw, fh, i === 1 ? P.winHi : P.win);
      rect(fx, yb - h * 0.4, fw, fh, P.win);
      if (o.shut) { rect(fx - 1.3, yb - h * 0.86, 1, fh, o.shut); rect(fx + fw + 0.3, yb - h * 0.86, 1, fh, o.shut); }
    }
  }
  function onion(c, tt, s) {
    const bulb = [[c - 8 * s, tt], [c - 9 * s, tt - 5 * s], [c - 5 * s, tt - 10 * s], [c - 1.5 * s, tt - 13 * s], [c - 1.5 * s, tt - 17 * s], [c + 1.5 * s, tt - 17 * s], [c + 1.5 * s, tt - 13 * s], [c + 5 * s, tt - 10 * s], [c + 9 * s, tt - 5 * s], [c + 8 * s, tt]];
    fill(bulb, P.roof);
    shade([[c, tt - 13 * s], [c + 1.5 * s, tt - 13 * s], [c + 5 * s, tt - 10 * s], [c + 9 * s, tt - 5 * s], [c + 8 * s, tt], [c, tt]], mix(P.roof, I.tinte, 0.25));
    fill([[c - 8 * s, tt - 1], [c - 9 * s, tt - 5 * s], [c - 5 * s, tt - 9.5 * s], [c - 3 * s, tt - 7 * s], [c - 6 * s, tt - 3 * s]], P.roofSnow);
    line([[c, tt - 17 * s], [c, tt - 27 * s]], P.line, 1.2); line([[c - 2.5, tt - 24 * s], [c + 2.5, tt - 24 * s]], P.line, 1.2);
  }
  function tower(x, yb, h, t, wall, side) {
    const tw = t === "campanile" ? 14 : 12, tx = x - tw / 2, tt = yb - h * (t === "campanile" ? 0.82 : 0.6);
    shade([[tx + tw, yb], [tx + tw + 5, yb - 2], [tx + tw + 5, tt - 2], [tx + tw, tt]], side);
    rect(tx, tt, tw, yb - tt, wall);
    if (t === "campanile") { rect(tx + 2.5, tt + 4, 3.5, 8, P.win); rect(tx + tw - 6, tt + 4, 3.5, 8, P.win); rect(tx - 1, tt + 14, tw + 2, 1.6, side); }
    else { rect(tx + tw / 2 - 2, tt + 5, 4, 7, P.win); dot(tx + tw / 2, tt + 18, 2.6, P.roof); }
    if (t === "spire" || t === "wood") {
      const sh = h * (t === "wood" ? 0.32 : 0.42), col = t === "wood" ? P.wood : P.slate;
      fill([[tx - 1.5, tt], [x, tt - sh], [tx + tw + 1.5, tt]], col);
      shade([[x, tt - sh], [tx + tw + 1.5, tt], [x, tt]], mix(col, I.tinte, 0.3));
      fill([[tx - 1.5, tt], [x, tt - sh], [x - 1.4, tt - sh * 0.5], [tx + 1, tt - 1]], P.roofSnow);
      line([[x, tt - sh], [x, tt - sh - 7]], P.line, 1.2); line([[x - 2.5, tt - sh - 5], [x + 2.5, tt - sh - 5]], P.line, 1.2);
    } else if (t === "onion") onion(x, tt, 1);
    else if (t === "campanile") {
      fill([[tx - 1.5, tt], [x, tt - 13], [tx + tw + 1.5, tt]], P.roof);
      shade([[x, tt - 13], [tx + tw + 1.5, tt], [x, tt]], mix(P.roof, I.tinte, 0.25));
      line([[x, tt - 13], [x, tt - 19]], P.line, 1.2);
    }
  }
  function church(x, yb, t, h) {
    if (t === "stave") { stave(x, yb, h); return; }
    const woody = t === "wood", wall = woody ? P.wood : P.wall, side = woody ? mix(P.wood, I.tinte, 0.35) : P.wallSide;
    if (t === "twin") {
      house(x - 22, yb, 44, h * 0.34, { wall, side, roof: P.roof, k: 0.4 });
      tower(x - 26, yb, h, "onion", wall, side); tower(x + 24, yb, h, "onion", wall, side);
      return;
    }
    if (t === "campanile") { house(x - 44, yb, 36, h * 0.28, { wall: mix(P.wall, I.ocker, 0.2), side, roof: P.roof, k: 0.2 }); tower(x, yb, h, t, mix(P.wall, I.ocker, 0.2), side); return; }
    house(x + 4, yb, 34, h * 0.3, { wall, side, roof: woody ? P.wood : P.roof, k: woody ? 0.75 : 0.42, logs: woody ? mix(P.wood, I.tinte, 0.3) : null });
    tower(x, yb, h, t, wall, side);
  }
  function stave(x, yb, h) {
    const wd = P.wood, dk = mix(P.wood, I.tinte, 0.42);
    rect(x - 14, yb - 12, 28, 12, wd);
    for (const [w, hh, y] of [[32, 8, yb - 12], [22, 7, yb - 22], [14, 6, yb - 31]]) {
      fill([[x - w / 2 - 2, y], [x, y - hh - 3], [x + w / 2 + 2, y]], dk);
      fill([[x - w / 2 - 1, y - 1], [x, y - hh - 4], [x - w * 0.1, y - hh * 0.45]], P.roofSnow);
      if (y !== yb - 12) rect(x - w / 2 + 3, y, w - 6, 3, wd);
    }
    fill([[x - 3, yb - 37], [x, yb - 37 - h * 0.35], [x + 3, yb - 37]], dk);
    rect(x - 3, yb - 8, 6, 8, P.win);
  }
  function abbey(x0, x1, yb, h) {
    const bx0 = x0 + 30, bx1 = x1 - 20, by = yb - 16, bh = 22;
    fill([[bx0, by], [bx1, by], [bx1, by - bh], [bx1 - 10, by - bh - 12], [bx0 + 10, by - bh - 12], [bx0, by - bh]], P.wallSide);
    fill([[bx0 - 1, by - bh], [bx0 + 10, by - bh - 12], [bx1 - 10, by - bh - 12], [bx1 + 1, by - bh]], P.roofSnowD);
    const ox = 22, oy = 8;
    shade([[x1, yb], [x1 + ox, yb - oy], [x1 + ox, yb - h - oy], [x1, yb - h]], P.wallSide);
    rect(x0, yb - h, x1 - x0, h, P.wall);
    fill([[x0 - 2, yb - h + 1], [x0 + 12, yb - h - 15], [x1 - 10, yb - h - 15], [x1 + 2, yb - h + 1]], P.roofSnow);
    shade([[x1 - 10, yb - h - 15], [x1 + ox - 8, yb - h - oy - 15], [x1 + ox + 2, yb - h - oy + 1], [x1 + 2, yb - h + 1]], P.roofSnowD);
    rect(x0 - 2, yb - h - 1, x1 - x0 + 4, 3, P.roof);
    for (let row = 0; row < 3; row++) for (let fx = x0 + 6; fx < x1 - 4; fx += 8.2) rect(fx, yb - h + 6 + row * 8.5, 2.8, 4.4, (row === 1 && Math.floor(fx) % 3 === 0) ? P.winHi : P.win);
    rect((x0 + x1) / 2 - 4, yb - 9, 8, 9, P.door);
    const cx0 = x0 - 38, cw = 40, ch = 40, cg = 20;
    fill([[cx0, yb], [cx0 + cw, yb], [cx0 + cw, yb - ch], [cx0 + cw / 2, yb - ch - cg], [cx0, yb - ch]], P.wall);
    line([[cx0 - 2, yb - ch + 2], [cx0 + cw / 2, yb - ch - cg], [cx0 + cw + 2, yb - ch + 2]], P.roof, 2.4);
    line([[cx0 - 1, yb - ch], [cx0 + cw / 2, yb - ch - cg - 1.6], [cx0 + cw + 1, yb - ch]], P.roofSnow, 1.4);
    rect(cx0 + cw / 2 - 4, yb - 30, 8, 16, P.win); rect(cx0 + cw / 2 - 3, yb - 9, 6, 9, P.door);
    const tx = cx0 + 4, tw = 15, tb = yb - ch - 2, tt = tb - 56;
    rect(tx, tt, tw, tb - tt, P.wall);
    shade([[tx + tw, tb], [tx + tw + 6, tb - 3], [tx + tw + 6, tt - 3], [tx + tw, tt]], P.wallSide);
    rect(tx + 4, tt + 8, 7, 10, P.win); dot(tx + tw / 2, tt + 28, 3.2, P.roof);
    onion(tx + tw / 2 + 1, tt, 1.3);
  }
  function hotel(x, yb, w, h) {
    const ox = 18, oy = 7;
    shade([[x + w, yb], [x + w + ox, yb - oy], [x + w + ox, yb - h - oy], [x + w, yb - h]], P.wallSide);
    rect(x, yb - h, w, h, P.wall);
    fill([[x - 2, yb - h], [x + 4, yb - h - 13], [x + w - 4, yb - h - 13], [x + w + 2, yb - h]], P.roof);
    shade([[x + w + 2, yb - h], [x + w - 4, yb - h - 13], [x + w + ox - 6, yb - h - oy - 13], [x + w + ox + 1, yb - h - oy]], mix(P.roof, I.tinte, 0.2));
    fill([[x + 4, yb - h - 13], [x + 9, yb - h - 18], [x + w - 9, yb - h - 18], [x + w - 4, yb - h - 13]], P.roofSnow);
    fill([[x + w - 4, yb - h - 13], [x + w - 9, yb - h - 18], [x + w + ox - 12, yb - h - oy - 18], [x + w + ox - 6, yb - h - oy - 13]], P.roofSnowD);
    for (let i = 0; i < 6; i++) { const dx = x + 8 + i * ((w - 16) / 5) - 2.5; rect(dx, yb - h - 11, 5, 7, P.roofSnow); rect(dx + 1.3, yb - h - 9, 2.4, 4, P.win); }
    rect(x, yb - h + 3, w, 3, I.rot);
    for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++) rect(x + 5 + i * ((w - 10) / 8.6), yb - h + 10 + row * 9, 3.2, 5.2, (row + i) % 5 === 2 ? P.winHi : P.win);
    rect(x + w / 2 - 5, yb - 8, 10, 8, P.door);
  }
  function block(x, yb, w, h, rr) {
    const tone = rr() < 0.5 ? P.wall : mix(P.wall, P.wallSide, 0.35);
    shade([[x + w, yb], [x + w + 5, yb - 2], [x + w + 5, yb - h - 2], [x + w, yb - h]], P.wallSide);
    rect(x, yb - h, w, h, tone);
    if (rr() < 0.5) { rect(x - 1, yb - h - 2, w + 2, 2.4, P.roofSnow); }
    else { fill([[x - 1, yb - h], [x + 2.5, yb - h - 6], [x + w - 2.5, yb - h - 6], [x + w + 1, yb - h]], P.slate); rect(x + 2.5, yb - h - 7.4, w - 5, 1.8, P.roofSnow); }
    for (let yy = yb - h + 4; yy < yb - 4; yy += 6.5) for (let xx = x + 2; xx < x + w - 2.5; xx += 4.2) rect(xx, yy, 1.8, 3, P.abend ? (rr() < 0.5 ? P.win : rr() < 0.3 ? P.winHi : P.winOff) : P.win);
  }
  function cluster(T, rr) {
    const out = [], n = 3;
    for (let k = 0; k < n; k++) {
      const yb = T.y0 + (T.y1 - T.y0) * k / (n - 1), sc = (0.78 + 0.32 * k / (n - 1)) * (T.scale || 1.18);
      let x = T.cx - T.w / 2 + rr() * 10;
      while (x < T.cx + T.w / 2) {
        const w = (14 + rr() * 11) * sc, mid = x + w / 2, dc = Math.abs(mid - T.cx) / (T.w / 2);
        const keep = rr() < (1 - dc * dc * 0.75) * (T.dens || 0.92);
        const blocked = (T.skip || []).some((s) => mid > s[0] && mid < s[1] && (s[2] == null || k <= s[2]));
        if (keep && !blocked) out.push({ x, yb: yb + (rr() - 0.5) * 4, w, h: w * (0.6 + rr() * 0.2) * (T.tall || 1), k });
        x += keep ? w + 3 + rr() * 6 : w * 0.6;
      }
    }
    return out;
  }
  function town(T, A) {
    const rr = rng(T.seed || 5);
    const items = cluster(T, rr).map((h) => ({ yb: h.yb, h, draw: () => house(h.x, h.yb, h.w, h.h, preset(T.house, rr)) }));
    for (const c of (T.churches || [])) items.push({ yb: c.yb, draw: () => church(c.x, c.yb, c.t, c.h) });
    for (const e of (T.extra || [])) items.push({ yb: e.yb, draw: () => (e.t === "abbey" ? abbey(e.x0, e.x1, e.yb, e.h) : hotel(e.x, e.yb, e.w, e.h)) });
    items.sort((a, b) => a.yb - b.yb).forEach((it) => it.draw());
    const hs = items.filter((it) => it.h && it.h.k > 0);
    for (let i = 0; i < Math.min(T.smoke == null ? 5 : T.smoke, hs.length); i++) { const h = hs[Math.floor(rr() * hs.length)].h; A.mid.push(smokeAnim(h.x + h.w * 0.72, h.yb - h.h - h.w * 0.22, 0.7 + h.k * 0.2, rr() * 10)); }
  }
  function city(Cn, A) {
    const rr = rng(Cn.seed || 9);
    for (const row of Cn.rows) {
      let x = row.x0;
      while (x < row.x1) { const w = 10 + rr() * 16, h = row.hmin + rr() * (row.hmax - row.hmin); block(x, row.y, w, h, rr); x += w + rr() * 2; }
      for (const c of (Cn.churches || [])) if (c.row === Cn.rows.indexOf(row)) church(c.x, c.yb, c.t, c.h);
    }
    for (let i = 0; i < 4; i++) A.mid.push(smokeAnim(Cn.rows[0].x0 + 60 + rr() * 600, Cn.rows[0].y - 30 - rr() * 6, 0.8, rr() * 10));
  }
  function viaduct(V) {
    const { x0, x1, y, h, n } = V, span = (x1 - x0) / n, pw = span * 0.2, st = mix(P.wall, P.wallSide, 0.3), sd = P.wallSide;
    for (let i = 0; i < n; i++) {
      const xl = x0 + i * span, xr = xl + span, cx = (xl + xr) / 2, rad = span / 2 - pw / 2, ya = y + 5 + h * 0.45;
      const pts = [[xl, y + 5], [xr, y + 5], [xr, ya]];
      for (let a = 0; a <= Math.PI + 0.01; a += Math.PI / 10) pts.push([cx + rad * Math.cos(a), ya - rad * Math.sin(a) * 0.9]);
      pts.push([xl, ya]); fill(pts, st);
    }
    for (let i = 0; i <= n; i++) { const px = x0 + i * span - pw / 2; rect(px, y + 5, pw, h, st); shade([[px + pw * 0.55, y + 5], [px + pw, y + 5], [px + pw, y + 5 + h], [px + pw * 0.55, y + 5 + h]], sd); }
    rect(x0 - pw / 2, y, x1 - x0 + pw, 5, st); rect(x0 - pw / 2, y - 1.5, x1 - x0 + pw, 1.6, P.roofSnow);
  }
  function skywalk(S) {
    const { x0, x1, y } = S, ph = 20, L = P.line;
    line([[x0, y], [x0, y - ph]], L, 1.6); line([[x1, y], [x1, y - ph]], L, 1.6);
    const cat = (u) => y - ph + Math.sin(u * Math.PI) * ph * 0.85, deck = (u) => y - 3 + Math.sin(u * Math.PI) * 4;
    const a = [], b = []; for (let k = 0; k <= 20; k++) { const u = k / 20, x = x0 + (x1 - x0) * u; a.push([x, cat(u)]); b.push([x, deck(u)]); }
    line(a, L, 1); line(b, L, 1.6);
    for (let k = 1; k < 20; k += 2) { const u = k / 20, x = x0 + (x1 - x0) * u; line([[x, cat(u)], [x, deck(u)]], L, 0.6); }
  }
  function latticeTower(T) {
    const { x, y, h } = T, L = P.line, b = 7, tp = 2.2;
    line([[x - b, y], [x - tp, y - h]], L, 1.3); line([[x + b, y], [x + tp, y - h]], L, 1.3);
    for (let k = 0; k < 6; k++) { const u0 = k / 6, u1 = (k + 1) / 6, wa = b + (tp - b) * u0, wb = b + (tp - b) * u1; line([[x - wa, y - h * u0], [x + wb, y - h * u1]], L, 0.7); line([[x + wa, y - h * u0], [x - wb, y - h * u1]], L, 0.7); }
    rect(x - 5, y - h - 4, 10, 4, L); fill([[x - 6, y - h - 4], [x, y - h - 9], [x + 6, y - h - 4]], P.roof);
  }
  function station(x, y) { rect(x - 6, y - 7, 12, 7, P.wood); rect(x - 7, y - 8.5, 14, 2, P.roofSnow); }
  function kozolec(x, yb) {
    const w = 34, h = 20, wd = P.wood;
    for (const px of [x, x + w / 2, x + w]) rect(px - 1, yb - h, 2.2, h, wd);
    for (let k = 1; k < 5; k++) line([[x, yb - h + k * 3.6], [x + w, yb - h + k * 3.6]], wd, 0.9);
    fill([[x - 4, yb - h], [x + w / 2, yb - h - 8], [x + w + 4, yb - h]], P.roof);
    fill([[x - 3, yb - h - 1], [x + w / 2, yb - h - 8.6], [x + w + 3, yb - h - 1], [x + w / 2, yb - h - 4]], P.roofSnow);
  }

  // ================================================================ Fichten und Nahebene
  function spruce(x, yb, h, v) {
    const tiers = v === 1 ? 5 : v === 2 ? 3 : 4, wk = v === 1 ? 0.52 : v === 2 ? 0.5 : 0.38;
    const w = h * wk, top = yb - h, th = (h * 0.86) / tiers, R = [[x, top]], tips = [];
    for (let i = 0; i < tiers; i++) {
      const yE = top + h * 0.06 + th * (i + 1), hw = (w / 2) * (0.34 + 0.66 * (i + 1) / tiers);
      R.push([x + hw, yE]); tips.push([hw, yE]);
      if (i < tiers - 1) R.push([x + hw * 0.4, yE - th * 0.32]);
    }
    const yL = R[R.length - 1][1];
    R.push([x + w * 0.05, yL], [x + w * 0.05, yb]);
    const L = R.slice(1).reverse().map((q) => [2 * x - q[0], q[1]]);
    fill(R.concat(L), P.treeD);
    fill(L.concat([[x, top], [x, yb]]), P.tree);
    for (let i = 0; i < tiers; i++) {
      const [hw, yE] = tips[i], a = i === 0 ? 0 : 0.42, ax = hw * a * 0.85, ay = yE - th * (1 - a * 0.7), t = th * 0.2;
      fill([[x - ax, ay - t * 0.6], [x - hw - 1, yE - 0.5], [x - hw * 0.72, yE - t * 1.2], [x - ax * 0.6, ay + t * 0.4]], P.tSnow);
      shade([[x + ax, ay - t * 0.6], [x + hw + 1, yE - 0.5], [x + hw * 0.72, yE - t * 1.2], [x + ax * 0.6, ay + t * 0.4]], P.tSnowD);
    }
  }
  function grove(list, cast) {
    if (cast) for (const [x, yb, h] of list) shade([[x, yb + 1], [x + h * 0.9, yb + 1 - h * 0.02], [x + h * 0.7, yb + h * 0.06], [x, yb + h * 0.05]], P.valleyShade);
    for (const [x, yb, h, v] of list.slice().sort((a, b) => a[1] - b[1])) spruce(x, yb, h, v);
  }
  // Nahebene je Ort: eigene Bäume oder Bauten, nie überall dieselbe Gruppe
  const NEAR = {
    willingen: { zaun: [968, 1300, 726], spruce: [[1240, 742, 92, 0], [1268, 736, 66, 2]] },
    engelberg: { spruce: [[1214, 752, 116, 0], [1252, 760, 146, 1], [1286, 744, 100, 0]] },
    predazzo: { larch: [[1186, 744, 122], [1230, 756, 150], [1272, 738, 110]] },
    holmenkollen: { birch: [[1196, 744, 118], [1236, 754, 148], [1270, 740, 108]] },
    oberstdorf: { spruce: [[1244, 752, 108, 0], [1276, 744, 84, 2]], zweig: true },
    garmisch: { stadel: [1150, 728, 62], zaun: [968, 1140, 738] },
    innsbruck: { zaun: [988, 1300, 724] },
    bischofshofen: { spruce: [[1224, 758, 128, 1], [1264, 748, 108, 0]], stadel: [1060, 726, 46], zweig: true },
    zakopane: { spruce: [[1184, 770, 168, 0], [1228, 782, 198, 0], [1272, 760, 158, 1], [1144, 790, 108, 2]], zweig: true },
    planica: { spruce: [[1262, 748, 90, 0]] },
  };
  function larch(x, yb, h) {
    const tw = mix(P.wood, I.tinte, 0.25);
    line([[x, yb], [x, yb - h]], tw, Math.max(1.4, h * 0.03));
    for (let i = 0; i < 13; i++) {
      const u = i / 13, y = yb - h * 0.12 - u * h * 0.86, w = h * 0.28 * (1 - u * 0.92);
      for (const d of [-1, 1]) { line([[x, y], [x + d * w * 0.55, y + 2], [x + d * w, y + 5]], tw, 1.1); }
      if (i % 2 === 0) line([[x - w * 0.7, y + 2.6], [x - 1, y - 0.6]], P.tSnow, 1.4);
    }
  }
  function birch(x, yb, h) {
    const tw = mix(P.wood, I.tinte, 0.45), bark = P.abend ? mix(P.wall, I.violett, 0.2) : P.wall;
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.2, l = h * (0.3 + (i % 3) * 0.1), y0 = yb - h * (0.45 + (i % 4) * 0.08); line([[x, y0], [x + Math.cos(a) * l * 0.5, y0 + Math.sin(a) * l * 0.6], [x + Math.cos(a) * l * 0.85, y0 + Math.sin(a) * l * 0.85 + l * 0.18]], tw, 0.9); }
    const w = Math.max(2.4, h * 0.045);
    rect(x - w / 2, yb - h * 0.92, w, h * 0.92, bark);
    for (let y = yb - h * 0.85; y < yb - 4; y += h * 0.09) rect(x - w / 2, y, w * (0.4 + (y % 3) * 0.2), 1.6, I.tinte);
  }
  function stadel(x, yb, w) {
    const h = w * 0.5, o = { wall: P.wood, side: mix(P.wood, I.tinte, 0.35), roof: P.wood, k: 0.36, balcony: false };
    house(x, yb, w, h, o);
    for (let px = x + 4; px < x + w - 2; px += 4) line([[px, yb], [px, yb - h]], mix(P.wood, I.tinte, 0.3), 0.7);
    rect(x + w * 0.38, yb - h * 0.62, w * 0.24, h * 0.62, mix(P.wood, I.tinte, 0.5));
  }
  function zaun(x0, x1, y) {
    const post = mix(P.wood, I.tinte, 0.25), slope = (1300 - x0) ? (-0.06) : 0;
    const yy = (x) => y + (x - x0) * slope;
    line([[x0, yy(x0) - 9], [x1, yy(x1) - 9]], post, 1.6); line([[x0, yy(x0) - 4], [x1, yy(x1) - 4]], post, 1.6);
    for (let x = x0; x <= x1; x += 15) { rect(x - 1.2, yy(x) - 14, 2.6, 15, post); rect(x - 1.6, yy(x) - 15.6, 3.4, 2, P.tSnow); }
  }
  function nearLayer(O) {
    fill([[880, 820], [960, 744], [1060, 718], [1170, 700], [1300, 688], [1300, 820]], P.valley);
    shade([[960, 744], [1060, 718], [1170, 700], [1300, 688], [1300, 700], [1180, 712], [1070, 730], [980, 752]], P.valleyShade);
    loipe();
    const N = NEAR[O.id] || {};
    if (N.stadel) stadel(N.stadel[0], N.stadel[1], N.stadel[2]);
    if (N.zaun) zaun(N.zaun[0], N.zaun[1], N.zaun[2]);
    if (N.spruce) grove(N.spruce, true);
    for (const [x, yb, h] of (N.larch || [])) { shade([[x, yb + 1], [x + h * 0.7, yb], [x + h * 0.5, yb + 5], [x, yb + 4]], P.valleyShade); larch(x, yb, h); }
    for (const [x, yb, h] of (N.birch || [])) { shade([[x, yb + 1], [x + h * 0.7, yb], [x + h * 0.5, yb + 5], [x, yb + 4]], P.valleyShade); birch(x, yb, h); }
  }

  // ================================================================ Schanze und Springer (Spielebene)
  const prof = (x) => 342 + 0.47 * x + 0.00003 * x * x;
  function hillLayer() {
    const X0 = -20, X1 = 980, step = 20, body = [];
    for (let x = X0; x <= X1; x += step) body.push([x, prof(x)]);
    ctx.save(); path(body.concat([[X1, 830], [X0, 830]])); ctx.clip();
    const zone = (d, a, f, ph) => (x) => prof(x) + d + Math.sin(x * f + ph) * a + Math.sin(x * f * 2.7 + ph) * a * 0.35;
    const zs = [null, zone(112, 14, 0.009, 1), zone(214, 18, 0.007, 3), zone(320, 22, 0.006, 5)];
    rect(-40, 0, 1100, 900, P.hill[3]);
    for (let k = 2; k >= 0; k--) { const f = zs[k + 1], pts = []; for (let x = X0 - 20; x <= X1 + 20; x += 12) pts.push([x, f(x)]); (k === 0 ? fill : shade)(body.concat(pts.reverse()), P.hill[k]); }
    for (let k = 1; k <= 3; k++) spray(zs[k], P.hill[k - 1], P.hill[k], X0, X1, 1800, 26);
    const ang = Math.atan(0.47);
    for (const [x, d, L, t] of [[120, 62, 200, 8], [390, 78, 260, 10], [660, 52, 180, 7], [250, 170, 220, 12], [560, 176, 240, 13], [100, 276, 200, 12]]) {
      ctx.save(); ctx.translate(x + OFF[0], prof(x) + d + OFF[1]); ctx.rotate(ang);
      ctx.beginPath(); ctx.ellipse(0, 0, L / 2, t / 2, 0, 0, 6.2832); ctx.fillStyle = d < 112 ? P.mulde : P.hill[d < 214 ? 2 : 3]; ctx.fill(); ctx.restore();
    }
    for (const [d, a, b] of [[44, 40, 300], [52, 360, 620], [112, 80, 260], [120, 460, 760], [36, 700, 900]]) { const pts = []; for (let x = a; x <= b; x += 20) pts.push([x, prof(x) + d + Math.sin(x * 0.02) * 2]); line(pts, P.mulde, 1.6); }
    const kb = [], ke = []; for (let x = X0; x <= X1; x += step) kb.push([x, prof(x) + 7]); for (let x = X1; x >= X0; x -= step) ke.push([x, prof(x) + 17 + Math.sin(x * 0.03) * 2]);
    shade(kb.concat(ke), P.kante);
    if (P.lip) { const lb = []; for (let x = X1; x >= X0; x -= step) lb.push([x, prof(x) + 6]); fill(body.concat(lb), P.lip); }
    ctx.restore();
    line(body, P.key, 2.6);
    for (let x = 230; x <= 900; x += 95) { const y = prof(x); line([[x, y], [x - 7, y + 14]], x === 800 ? I.rot : P.key, x === 800 ? 4 : 2); }
  }
  const POSE = { sf: [[-24.7, 6.3], [44.5, -4.7]], sn: [[-23.9, 5.7], [45.8, -1.6]], ab: [-0.8, -0.6], kb: [10.2, -5.5], af: [0, 0], kf: [11.0, -4.9], hip: [21.9, -9.8], sh: [37.7, -12.3], head: [43.9, -12.8], eb: [29.2, -11.2], hb: [20.4, -9.6], ef: [28.9, -10.5], hf: [20.1, -8.5] };
  function spielLayer() {
    ctx.save(); ctx.lineCap = "round"; ctx.setLineDash([16, 11]);
    ctx.beginPath(); ctx.moveTo(-10, 110); ctx.quadraticCurveTo(500, 300, 1290, 760);
    ctx.strokeStyle = I.tinte; ctx.lineWidth = 5.5; ctx.stroke(); ctx.strokeStyle = I.ocker; ctx.lineWidth = 2.8; ctx.stroke(); ctx.restore();
    const fx = 150, fy = prof(fx); line([[fx, fy], [fx, fy - 62]], I.tinte, 2.4); fill([[fx, fy - 60], [fx + 38, fy - 55], [fx + 35, fy - 41], [fx, fy - 45]], I.gruen);
    ctx.save(); ctx.translate(486, prof(486) + 3); ctx.rotate(Math.atan(0.47 + 0.00006 * 486)); ctx.beginPath(); ctx.ellipse(0, 0, 62, 5.5, 0, 0, 6.2832); ctx.fillStyle = P.hillShadow; ctx.fill(); ctx.restore();
    const ox = 404, oy = 276, s = 2.6, a = -0.3, ca = Math.cos(a), sa = Math.sin(a), lift = -0.13, cl = Math.cos(lift), sl = Math.sin(lift);
    const T = (p, body) => { let x = p[0], y = p[1]; if (body) { const nx = x * cl - y * sl, ny = x * sl + y * cl; x = nx; y = ny; } return [ox + (x * ca - y * sa) * s, oy + (x * sa + y * ca) * s]; };
    const Y = "#F2C230", YD = "#C99A22", K = I.tinte;
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    const limb = (pts, w, c) => { const q = pts.map((k) => T(POSE[k], k !== "ab" && k !== "af")); line(q, K, w * s + 4.4); line(q, c, w * s); };
    const ski = (k, c) => line(POSE[k].map((p) => T(p)), c, 2.3 * s + 1.2);
    ski("sf", mix(I.tinte, I.tief, 0.45));
    limb(["sh", "eb", "hb"], 2.4, YD); limb(["ab", "kb", "hip"], 4.4, YD); limb(["hip", "sh"], 6.4, Y);
    const hd = T(POSE.head, true); dot(hd[0], hd[1], 3.6 * s + 2.2, K); dot(hd[0], hd[1], 3.6 * s, Y);
    limb(["af", "kf", "hip"], 4.4, Y); limb(["sh", "ef", "hf"], 2.4, Y); ski("sn", K);
    ctx.restore();
  }

  // ================================================================ Bewegte Details
  function smokeAnim(x, y, s, ph) {
    return (t) => { for (let i = 6; i >= 0; i--) { const u = ((t * 0.16 + ph) + i / 7) % 1, px = x - u * 24 * s - u * u * 18 * s, py = y - u * 30 * s, rr = (1.3 + u * 3.6) * s * (u > 0.82 ? (1 - u) / 0.18 : 1); dot(px + 0.5 * s, py + 0.7 * s, rr, P.smokeD); dot(px, py, rr, P.smoke); } };
  }
  const FLAGS = {
    de: (q) => { q(0, 1, 0, 1 / 3, I.tinte); q(0, 1, 1 / 3, 2 / 3, I.rot); q(0, 1, 2 / 3, 1, I.ocker); },
    ch: (q) => { q(0, 1, 0, 1, I.rot); q(0.2, 0.8, 0.4, 0.6, I.papier); q(0.4, 0.6, 0.2, 0.8, I.papier); },
    it: (q) => { q(0, 1 / 3, 0, 1, I.gruen); q(1 / 3, 2 / 3, 0, 1, I.papier); q(2 / 3, 1, 0, 1, I.rot); },
    no: (q) => { q(0, 1, 0, 1, I.rot); q(0.27, 0.45, 0, 1, I.papier); q(0, 1, 0.36, 0.64, I.papier); q(0.31, 0.41, 0, 1, I.navy); q(0, 1, 0.43, 0.57, I.navy); },
    at: (q) => { q(0, 1, 0, 1, I.rot); q(0, 1, 1 / 3, 2 / 3, I.papier); },
    pl: (q) => { q(0, 1, 0, 0.5, I.papier); q(0, 1, 0.5, 1, I.rot); },
    si: (q) => { q(0, 1, 0, 1 / 3, I.papier); q(0, 1, 1 / 3, 2 / 3, I.kobalt); q(0, 1, 2 / 3, 1, I.rot); },
    by: (q) => { for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) q(i / 5, (i + 1) / 5, j / 3, (j + 1) / 3, (i + j) % 2 ? I.papier : I.himmel); },
  };
  function flagShape(x, y0, w, h, kind, wv) {
    const pt = (u, v) => [x + u * w, y0 + v * h + wv(u)];
    const q = (u0, u1, v0, v1, col) => { const pts = []; for (let i = 0; i <= 6; i++) pts.push(pt(u0 + (u1 - u0) * i / 6, v0)); for (let i = 6; i >= 0; i--) pts.push(pt(u0 + (u1 - u0) * i / 6, v1)); fill(pts, col); };
    FLAGS[kind](q);
  }
  function flagAnim(x, yb, pole, w, h, kind, ph) {
    return (t) => { line([[x, yb], [x, yb - pole]], I.tinte, 1.8); flagShape(x, yb - pole + 1, w, h, kind, (u) => Math.sin(t * 3.4 + ph - u * 5) * h * 0.13 * u); };
  }
  function trainAt(x, yb, t) {
    for (let i = 0; i < 2; i++) { const cx = x + i * 37; rect(cx, yb - 12, 34, 10, P.roof); rect(cx - 1, yb - 14, 36, 2.4, P.roofSnow); for (let k = 0; k < 5; k++) rect(cx + 3 + k * 6.2, yb - 9.5, 3.4, 3.6, P.winHi); }
    const lx = x + 76;
    rect(lx, yb - 15, 11, 13, P.loco); rect(lx - 0.5, yb - 16.5, 12, 2, P.roofSnow); rect(lx + 11, yb - 11, 24, 9, P.loco); rect(lx + 29, yb - 17, 3.4, 6, P.loco); rect(lx + 33, yb - 5, 3, 3, I.rot);
    for (const wx of [x + 6, x + 28, x + 43, x + 65, lx + 4, lx + 16, lx + 26]) dot(wx, yb - 1.4, 2.1, P.line);
    const sx = lx + 30.7, sy = yb - 18;
    for (let i = 9; i >= 0; i--) { const u = (i + (t * 2.2) % 1) / 10, px = sx - u * 86, py = sy - u * 30 + u * u * 10, rr = 2.6 + u * 9; dot(px + 0.8, py + rr * 0.3, rr, P.smokeD); dot(px, py - rr * 0.08, rr * 0.92, P.smoke); }
  }
  function trainAnim(T) {
    const L = (T.x1 - T.x0) + 260;
    return (t) => { const x = T.x0 - 130 + ((t * T.speed) % L); ctx.save(); ctx.beginPath(); ctx.rect(T.x0, 0, T.x1 - T.x0, H); ctx.clip(); trainAt(x, T.y, t); ctx.restore(); };
  }
  function ferryAnim(F) {
    const L = F.x1 - F.x0 + 160;
    return (t) => {
      const x = F.x0 - 80 + ((t * F.speed) % L), y = F.y;
      ctx.save(); ctx.beginPath(); ctx.rect(F.x0, 0, F.x1 - F.x0, H); ctx.clip();
      line([[x - 40, y + 1.5], [x + 4, y + 1.5]], P.waterLine, 1.4);
      fill([[x, y - 6], [x + 48, y - 6], [x + 42, y], [x + 4, y]], P.loco); rect(x + 10, y - 11, 26, 5, P.wall); rect(x + 26, y - 19, 5, 8, I.rot); rect(x + 26, y - 20, 5, 2, I.tinte);
      for (let i = 8; i >= 0; i--) { const u = (i + (t * 0.6) % 1) / 9, px = x + 28 - u * 64, py = y - 22 - u * 20, rr = 2 + u * 6.5; dot(px + 0.8, py + 1, rr, P.smokeD); dot(px, py, rr, P.smoke); }
      ctx.restore();
    };
  }
  function cabinAnim(c) {
    const [ax, ay, bx, by, per] = c;
    return (t) => { const u = 0.5 - 0.5 * Math.cos((t / per) * 2 * Math.PI); for (const v of [u, 1 - u]) { const x = ax + (bx - ax) * v, y = ay + (by - ay) * v; line([[x, y], [x, y + 5]], P.line, 0.9); rect(x - 4, y + 5, 8, 6, I.rot); rect(x - 3, y + 6.5, 6, 2, P.wall); } };
  }
  function funicularAnim(f) {
    const [ax, ay, bx, by, per] = f, ang = Math.atan2(by - ay, bx - ax);
    return (t) => { const u = 0.5 - 0.5 * Math.cos((t / per) * 2 * Math.PI), x = ax + (bx - ax) * u, y = ay + (by - ay) * u; ctx.save(); ctx.translate(x, y); ctx.rotate(ang); rect(-7, -7, 14, 6, I.rot); rect(-5, -5.5, 10, 2, P.wall); ctx.restore(); };
  }
  function sleighAnim(Sl) {
    const L = Sl.x1 - Sl.x0 + 120;
    return (t) => {
      const x = Sl.x0 - 60 + ((t * Sl.speed) % L), y = Sl.y, g = Math.sin(t * 9) * 2.2, hc = mix(I.dach, I.tinte, 0.5);
      ctx.save(); ctx.beginPath(); ctx.rect(Sl.x0, 0, Sl.x1 - Sl.x0, H); ctx.clip();
      ctx.beginPath(); ctx.ellipse(x + 30, y - 9, 9, 4.2, 0, 0, 6.2832); ctx.fillStyle = hc; ctx.fill();
      line([[x + 37, y - 11], [x + 42, y - 17]], hc, 3.2); dot(x + 43, y - 17, 2.4, hc);
      for (const [lx, d] of [[24, -1], [27, 1], [34, 1], [37, -1]]) line([[x + lx, y - 7], [x + lx + d * g, y]], hc, 1.6);
      line([[x + 12, y - 8], [x + 22, y - 9]], P.line, 0.8);
      fill([[x, y - 10], [x + 14, y - 10], [x + 16, y - 3], [x + 1, y - 3]], I.rot); line([[x - 2, y], [x + 17, y], [x + 19, y - 3]], P.line, 1.2);
      rect(x + 3, y - 13, 6, 4, P.line); dot(x + 6, y - 15, 2.4, P.line);
      ctx.restore();
    };
  }
  function driftAnim(px, py, s, ph) {
    return (t) => { const c = P.abend ? P.alp.firn : P.alp.lit; for (let i = 0; i < 7; i++) { const u = ((t * 0.18 + ph) + i / 7) % 1, x = px + 4 + u * 70 * s, y = py + 2 + u * 12 * s + Math.sin(u * 7 + t) * 2 * s, rr = (1 + u * 5) * s * (u < 0.15 ? u / 0.15 : 1 - u); if (rr > 0.2) dot(x, y, rr, c); } };
  }
  const grainCache = {};
  function grainPattern(variant) {
    if (grainCache[variant]) return grainCache[variant];
    const g = document.createElement("canvas"); g.width = g.height = 440;
    const gc = g.getContext("2d"), rr = rng(77);
    for (let i = 0; i < 2600; i++) { gc.globalAlpha = 0.25 + rr() * 0.5; gc.fillStyle = P.chalk; gc.beginPath(); gc.arc(rr() * 440, rr() * 440, 0.6 + rr() * 1.3, 0, 6.2832); gc.fill(); }
    for (let i = 0; i < 1500; i++) { gc.globalAlpha = 0.12 + rr() * 0.3; gc.fillStyle = P.spray; gc.beginPath(); gc.arc(rr() * 440, rr() * 440, 0.5 + rr() * 0.9, 0, 6.2832); gc.fill(); }
    return (grainCache[variant] = g);
  }

  // ================================================================ Orte
  const ORTE = [
    { id: "willingen", name: "Willingen", land: "Deutschland", schanze: "Mühlenkopfschanze", flag: "de", snow: 0.95,
      ranges: [
        { style: "huegel", far: true, rough: 0.05, ctrl: [[-40, 478], [140, 458, "S"], [300, 472, "V"], [470, 450, "S"], [640, 468, "V"], [800, 452, "S"], [980, 470, "V"], [1140, 446, "S"], [1320, 464]] },
        { style: "huegel", rough: 0.045, ctrl: [[-40, 506], [180, 474, "S"], [410, 500, "V"], [650, 444, "S"], [880, 492, "V"], [1080, 470, "S"], [1320, 500]], pisten: [[600, 24], [690, 20], [1060, 22]] },
      ],
      far: { tower: { x: 650, y: 447, h: 40 }, skywalk: { x0: 842, x1: 952, y: 486 } },
      mid: { viaduct: { x0: 590, x1: 900, y: 570, h: 34, n: 8 }, train: { y: 570, x0: 560, x1: 905, speed: 46 }, groves: [[[912, 578, 34, 0], [928, 582, 28, 1], [946, 576, 40, 0], [968, 580, 30, 2]]] },
      town: [{ house: "fachwerk", cx: 1090, w: 360, y0: 598, y1: 652, churches: [{ x: 1080, yb: 624, t: "spire", h: 72 }], skip: [[1050, 1124, 1]] }],
      flags: [[1010, 736, 66, 36, 22], [1052, 728, 60, 36, 22]],
      info: { oertlich: ["Ettelsberg mit Aussichtsturm", "Hängebrücke über den Sattel", "Viadukt der Uplandbahn"], typisch: ["Sauerländer Fachwerk, schwarz-weiß mit Schieferdach", "bewaldete Kuppen und Skiwiesen statt Hochgebirge"], bewegt: ["Zug über das Viadukt", "Kaminrauch, Fahnen, dichter Schneefall"] } },
    { id: "engelberg", name: "Engelberg", land: "Schweiz", schanze: "Gross-Titlis-Schanze", flag: "ch", snow: 0.5,
      ranges: [
        { style: "alpin", far: true, rough: 0.28, tree: 500, ctrl: [[560, 548], [640, 470], [700, 424], [760, 366], [796, 320, "S"], [824, 352, "V"], [862, 308, "S"], [904, 352], [960, 404, "V"], [1010, 440], [1070, 548]] },
        { style: "alpin", rough: 0.24, tree: 488, firn: [120, 370, 46], ctrl: [[-40, 436], [40, 408], [120, 362], [200, 302], [262, 252], [312, 226, "S"], [372, 234], [412, 254, "V"], [454, 246, "S"], [520, 294], [580, 340, "V"], [640, 384], [700, 434], [770, 548]] },
        { style: "alpin", rough: 0.3, rocky: 1.5, tree: 490, ctrl: [[860, 548], [930, 470], [990, 410], [1030, 350], [1058, 298, "S"], [1078, 316, "V"], [1102, 302, "S"], [1132, 350], [1170, 382, "V"], [1222, 372, "S"], [1280, 398], [1330, 420]] },
      ],
      far: { drift: [[312, 226, 1], [862, 308, 0.7], [1058, 298, 0.6]] },
      mid: { cables: [[586, 548, 318, 300, 9]], train: { y: 668, x0: 560, x1: 1300, speed: 38 } },
      town: [{ house: "chalet", cx: 1040, w: 440, y0: 592, y1: 648, extra: [{ t: "abbey", x0: 934, x1: 1118, yb: 606, h: 31 }, { t: "hotel", x: 786, yb: 598, w: 76, h: 50 }], skip: [[780, 870, 1], [890, 1146, 1]] }],
      flags: [[1010, 736, 66, 28, 28, "ch"], [1050, 728, 60, 28, 28, "ch"], [824, 530, 26, 14, 14, "ch"]],
      info: { oertlich: ["Titlis mit Gletscher und Seilbahn", "Spannörter und Felsturm des Hahnen", "Benediktinerkloster im Talboden"], typisch: ["Chalets mit Holzbalkon und Schneehaube", "Grandhotel mit Mansarddach und Fahnenmast"], bewegt: ["Kabinen zum Titlis, Zug im Tal", "Schneefahnen am Grat, Kaminrauch, Fahnen"] } },
    { id: "predazzo", name: "Predazzo", land: "Italien", schanze: "Trampolino dal Ben", flag: "it", snow: 0.4,
      ranges: [
        { style: "alpin", far: true, rough: 0.2, tree: 500, ctrl: [[-40, 470], [120, 420, "S"], [260, 446, "V"], [380, 404, "S"], [520, 436, "V"], [700, 548]] },
        { style: "dolomit", rough: 0.1, cliff: 1.1, tree: 492, ctrl: [[-40, 486], [30, 450], [80, 392], [118, 340], [142, 300, "S"], [160, 336, "V"], [186, 286, "S"], [208, 322, "V"], [236, 262, "S"], [258, 300, "V"], [292, 276, "S"], [326, 318, "V"], [366, 294, "S"], [400, 340], [448, 400], [520, 460], [600, 548]] },
        { style: "alpin", rough: 0.16, tree: 448, ctrl: [[560, 548], [660, 460], [760, 414, "S"], [870, 440, "V"], [990, 398, "S"], [1100, 424, "V"], [1210, 404, "S"], [1330, 436]] },
      ],
      far: { drift: [] },
      mid: {},
      town: [{ house: "italien", cx: 1010, w: 420, y0: 598, y1: 652, churches: [{ x: 1000, yb: 624, t: "campanile", h: 92 }], skip: [[950, 1045, 1]] }],
      flags: [[1010, 736, 66, 40, 26, "it"], [1056, 728, 60, 40, 26, "it"]],
      info: { oertlich: ["Latemar über dem Fleimstal", "Campanile im Ortskern"], typisch: ["Dolomitfels, der am Abend rot aufglüht", "Steinhäuser mit flachem Dach und grünen Läden"], bewegt: ["Kaminrauch, Trikolore, leichter Schneefall"] } },
    { id: "holmenkollen", name: "Holmenkollen", land: "Norwegen", schanze: "Holmenkollbakken", flag: "no", snow: 1,
      ranges: [{ style: "huegel", far: true, rough: 0.05, ctrl: [[-40, 482], [180, 464, "S"], [360, 476, "V"], [560, 458, "S"], [800, 472, "V"], [1000, 460, "S"], [1320, 476]] }],
      fjord: { y0: 482, y1: 560, islands: [[640, 524, 90, 12], [790, 508, 60, 8], [940, 534, 120, 14], [1150, 514, 70, 9]] },
      far: {},
      mid: { ferry: { y: 548, x0: 520, x1: 1300, speed: 14 }, city: { rows: [{ y: 586, x0: 560, x1: 1300, hmin: 16, hmax: 34 }, { y: 606, x0: 600, x1: 1300, hmin: 12, hmax: 26 }], churches: [{ x: 1010, yb: 586, t: "spire", h: 64, row: 0 }] } },
      town: [{ house: "nordisch", cx: 920, w: 480, y0: 634, y1: 678, dens: 0.82, churches: [{ x: 780, yb: 656, t: "stave", h: 60 }], skip: [[748, 812, 2]] }],
      flags: [[1010, 736, 66, 40, 28, "no"], [1056, 728, 60, 40, 28, "no"]],
      info: { oertlich: ["Blick über Oslo und den Fjord mit Inseln", "Kapelle im Stil einer Stabkirche"], typisch: ["rote und ockerfarbene Holzhäuser mit dunklem Dach", "weiche Waldrücken, Wasser statt Talboden"], bewegt: ["Fähre mit Rauchfahne auf dem Fjord", "Fahnen, dichter Schneefall"] } },
    { id: "oberstdorf", name: "Oberstdorf", land: "Deutschland", schanze: "Schattenbergschanze", flag: "de", snow: 0.6,
      ranges: [
        { style: "alpin", far: true, rough: 0.26, tree: 520, ctrl: [[260, 548], [380, 360], [440, 316, "S"], [500, 340, "V"], [560, 322, "S"], [640, 364, "V"], [720, 548]] },
        { style: "alpin", rough: 0.24, tree: 482, rocky: 1.2, ctrl: [[-40, 444], [60, 404], [150, 350], [204, 324, "S"], [252, 350, "V"], [320, 304], [364, 258, "S"], [392, 292, "V"], [432, 272, "S"], [472, 304, "V"], [532, 290, "S"], [602, 344, "V"], [680, 384], [760, 364], [846, 330, "S"], [920, 326], [1000, 356, "V"], [1100, 374, "S"], [1200, 410, "V"], [1330, 432]] },
      ],
      far: { drift: [[364, 258, 0.8], [846, 330, 0.6]] },
      mid: { cables: [[934, 572, 852, 336, 10]] },
      town: [{ house: "chalet", cx: 1060, w: 420, y0: 596, y1: 650, churches: [{ x: 1040, yb: 622, t: "spire", h: 102 }], skip: [[1010, 1090, 1]] }],
      flags: [[1010, 736, 66, 36, 22, "de"], [1052, 728, 60, 36, 22, "de"]],
      info: { oertlich: ["Allgäuer Hochalpen mit Trettachspitze und Nebelhorn", "Pfarrkirche mit hohem Spitzturm"], typisch: ["Bauernhäuser mit flachem Satteldach und Balkon", "Schwarz-Rot-Gold"], bewegt: ["Kabinen zum Nebelhorn", "Schneefahne am Gipfel, Kaminrauch"] } },
    { id: "garmisch", name: "Garmisch-Partenkirchen", land: "Deutschland", schanze: "Große Olympiaschanze", flag: "de", snow: 0.3,
      ranges: [{ style: "alpin", rough: 0.22, rocky: 1.6, tree: 470, ctrl: [[-40, 404], [40, 326], [110, 266], [160, 238, "S"], [222, 246], [272, 264, "V"], [332, 252, "S"], [392, 292, "V"], [452, 302], [502, 282, "S"], [542, 318, "V"], [602, 306, "S"], [682, 360, "V"], [762, 322], [820, 258, "S"], [880, 318], [940, 366, "V"], [1040, 344, "S"], [1160, 392, "V"], [1330, 424]] }],
      far: { drift: [[160, 238, 1], [820, 258, 0.8]] },
      mid: { cables: [[884, 570, 792, 384, 10]] },
      town: [{ house: "bayern", cx: 1060, w: 420, y0: 596, y1: 650, churches: [{ x: 1040, yb: 622, t: "onion", h: 80 }], skip: [[1010, 1090, 1]] }],
      flags: [[1010, 736, 66, 38, 26, "by"], [1056, 728, 60, 38, 24, "de"]],
      info: { oertlich: ["Wetterstein mit Zugspitze, Waxenstein und Alpspitze", "St. Martin mit Zwiebelturm"], typisch: ["Lüftlmalerei an den Fassaden", "weiß-blaue Fahne neben Schwarz-Rot-Gold"], bewegt: ["Kreuzeckbahn zur Alpspitze", "Schneefahnen an der Zugspitze, Kaminrauch"] } },
    { id: "innsbruck", name: "Innsbruck", land: "Österreich", schanze: "Bergisel", flag: "at", snow: 0.25,
      ranges: [{ style: "alpin", rough: 0.15, rocky: 1.4, detail: 0.55, tree: 448, ctrl: [[-40, 306], [50, 258], [120, 224, "S"], [170, 244], [220, 228], [270, 252, "V"], [330, 234], [372, 242], [422, 214, "S"], [482, 238], [552, 224], [632, 248, "V"], [722, 232, "S"], [812, 258], [902, 246], [1002, 274, "V"], [1102, 264, "S"], [1202, 292], [1330, 304]] }],
      far: { drift: [[422, 214, 0.7]] },
      mid: { cables: [[480, 474, 448, 344, 9], [448, 344, 426, 218, 9]], funicular: [604, 566, 482, 478, 12], hamlet: { cx: 470, yb: 484 }, river: { y: 612, h: 9, x0: 520 },
        city: { rows: [{ y: 602, x0: 560, x1: 1300, hmin: 14, hmax: 30 }, { y: 644, x0: 626, x1: 1300, hmin: 18, hmax: 40 }], churches: [{ x: 900, yb: 646, t: "twin", h: 74, row: 1 }, { x: 1090, yb: 646, t: "onion", h: 62, row: 1 }] } },
      town: [],
      flags: [[1010, 736, 66, 38, 26, "at"], [1056, 728, 60, 38, 26, "at"]],
      info: { oertlich: ["Nordkette mit Hungerburg, Seegrube und Hafelekar", "Stadt am Inn mit Dom und Zwiebeltürmen"], typisch: ["Kalkwand in großen, ruhigen Flächen", "warme Stadtfenster am Abend, Rot-Weiß-Rot"], bewegt: ["Nordkettenbahn in zwei Sektionen, Hungerburgbahn", "Kaminrauch über der Stadt, Fahnen"] } },
    { id: "bischofshofen", name: "Bischofshofen", land: "Österreich", schanze: "Paul-Außerleitner-Schanze", flag: "at", snow: 0.85,
      ranges: [{ style: "alpin", rough: 0.12, tree: 486, wall: [190, 700, 22, 62], rocky: 0.8, ctrl: [[-40, 452], [60, 402], [140, 354], [200, 318], [250, 298], [300, 288, "S"], [410, 281, "V"], [520, 272, "S"], [600, 282], [662, 302, "V"], [722, 318], [792, 342], [862, 330, "S"], [942, 362, "V"], [1042, 348, "S"], [1142, 382, "V"], [1222, 372, "S"], [1330, 404]] }],
      far: { drift: [[520, 272, 0.9]] },
      mid: { train: { y: 668, x0: 640, x1: 1300, speed: 40 }, river: { y: 676, h: 9, x0: 640 } },
      town: [{ house: "chalet", cx: 1060, w: 420, y0: 596, y1: 648, churches: [{ x: 1060, yb: 622, t: "spire", h: 96 }], skip: [[1030, 1110, 1]] }],
      flags: [[1010, 736, 66, 38, 26, "at"], [1056, 728, 60, 38, 26, "at"]],
      info: { oertlich: ["Hochkönig mit Gletscherplateau und Felsgürtel", "Salzach und Bahnstrecke im Pongau"], typisch: ["Pongauer Höfe mit Holzbalkon", "Rot-Weiß-Rot"], bewegt: ["Zug entlang der Salzach", "Kaminrauch, Fahnen, Schneefall"] } },
    { id: "zakopane", name: "Zakopane", land: "Polen", schanze: "Wielka Krokiew", flag: "pl", snow: 1.25,
      ranges: [
        { style: "alpin", far: true, rough: 0.24, tree: 520, ctrl: [[300, 548], [420, 334], [500, 292, "S"], [560, 318, "V"], [624, 300, "S"], [704, 342, "V"], [782, 330, "S"], [880, 404], [960, 548]] },
        { style: "alpin", rough: 0.2, rocky: 1.5, tree: 470, ctrl: [[-40, 434], [50, 394], [120, 354, "S"], [170, 374, "V"], [232, 332], [272, 300], [302, 274, "S"], [322, 282], [342, 300, "V"], [382, 294, "S"], [432, 324, "V"], [502, 318, "S"], [582, 352, "V"], [662, 404], [742, 452], [820, 548]] },
        { style: "huegel", rough: 0.04, ctrl: [[720, 548], [840, 486], [940, 462, "S"], [1080, 468, "V"], [1200, 456, "S"], [1330, 470]], pisten: [[1000, 40]] },
      ],
      far: { cross: [302, 274] },
      mid: { funicular: [930, 584, 1018, 470, 12], sleigh: { y: 674, x0: 620, x1: 1300, speed: 30 } },
      town: [{ house: "goral", cx: 1040, w: 420, y0: 600, y1: 654, churches: [{ x: 1120, yb: 628, t: "wood", h: 70 }], skip: [[1090, 1160, 1]] }],
      flags: [[1010, 736, 66, 38, 24, "pl"], [1056, 728, 60, 38, 24, "pl"]],
      info: { oertlich: ["Giewont mit Gipfelkreuz", "Gubałówka mit Standseilbahn"], typisch: ["Holzhäuser im Zakopane-Stil mit steilem Schindeldach", "Holzkirche, Weiß-Rot"], bewegt: ["Pferdeschlitten im Tal, Standseilbahn", "dichter Schneefall, Kaminrauch"] } },
    { id: "planica", name: "Planica", land: "Slowenien", schanze: "Letalnica", flag: "si", snow: 0.7,
      ranges: [{ style: "alpin", rough: 0.22, rocky: 1.2, tree: 478, ctrl: [[-40, 384], [40, 332], [100, 290], [152, 248, "S"], [192, 292, "V"], [252, 272, "S"], [322, 312, "V"], [402, 282, "S"], [472, 314, "V"], [552, 292, "S"], [632, 322, "V"], [712, 296, "S"], [792, 332, "V"], [872, 302, "S"], [952, 338, "V"], [1042, 314, "S"], [1132, 348, "V"], [1222, 326, "S"], [1330, 352]] }],
      far: { drift: [[152, 248, 1.1], [402, 282, 0.8], [712, 296, 0.8], [1042, 314, 0.7]] },
      mid: { kozolci: [[690, 642], [862, 666], [934, 656]] },
      town: [{ house: "chalet", cx: 1160, w: 240, y0: 606, y1: 646, dens: 0.85, churches: [{ x: 1170, yb: 628, t: "spire", h: 78 }], skip: [[1140, 1210, 1]] }, { house: "chalet", cx: 780, w: 120, y0: 614, y1: 634, dens: 0.95, seed: 17, smoke: 2 }],
      flags: [[1010, 736, 66, 38, 24, "si"], [1056, 728, 60, 38, 24, "si"]],
      info: { oertlich: ["Ponce-Kamm und Jalovec im Talschluss", "Rateče mit Kirche, Nordisches Zentrum"], typisch: ["Kozolec, die slowenische Heuharfe", "Julische Alpen mit steilen Felsflanken"], bewegt: ["Schneefahnen über dem Grat", "Fahnen, Kaminrauch, Schneefall"] } },
  ];
  const BY = {}; ORTE.forEach((o) => (BY[o.id] = o));

  // ================================================================ Tiefe: Luftperspektive, Nebel, Wolkenschatten, Wege, Vordergrund
  function hazeRanges(O) {
    const hilly = O.ranges.every((R) => R.style === "huegel");
    const out = [];
    for (const lv of [2, 1]) {
      const rr = rng(hash(O.id) ^ (lv * 7919)), band = hilly ? [418, 462] : lv === 2 ? [292, 372] : [334, 420], ctrl = [[-40, band[1] + 20]];
      let x = -40 + 60 * rr(), sTurn = true;
      while (x < 1320) { const y = sTurn ? band[0] + rr() * (band[1] - band[0]) * 0.6 : band[1] - rr() * (band[1] - band[0]) * 0.35; ctrl.push([x, y, sTurn ? "S" : "V"]); x += 90 + rr() * 110; sTurn = !sTurn; }
      ctrl.push([1330, band[1] + 20]);
      out.push({ lv, G: buildRange({ style: "dunst", rough: hilly ? 0.05 : 0.2, detail: 0.5, ctrl }, (hash(O.id) ^ (lv * 131)) >>> 0) });
    }
    return out;
  }
  function paintHaze(H, mode) {
    const G = H.G, f = H.lv === 2 ? 0.7 : 0.42;
    let lit = mix(P.alpFar.lit, P.sky[4], f), sh = mix(P.alpFar.shade, P.sky[H.lv === 2 ? 4 : 3], f + 0.05);
    if (mode === "erd") lit = mix(sh, P.sky[4], 0.25);
    ctx.save(); path(G.poly); ctx.clip();
    fill(G.poly, lit);
    for (const fc of G.faces) shade(fc, sh);
    for (const q of G.ribs) fill(q, lit);
    ctx.restore();
  }
  function mistAnim(y, h, speed, seed, col, colD) {
    const rr = rng(seed), segs = [];
    for (let i = 0; i < 4; i++) segs.push({ x: rr() * 1700, L: 260 + rr() * 380, h: h * (0.6 + rr() * 0.6), dy: (rr() - 0.5) * h * 1.2, ph: rr() * 6 });
    return (t) => {
      for (const g of segs) {
        const cx = ((g.x + t * speed) % 1900) - 300, yy = y + g.dy, top = [], bot = [];
        for (let k = 0; k <= 14; k++) { const u = k / 14, x = cx - g.L / 2 + u * g.L, env = Math.pow(Math.sin(u * Math.PI), 0.7); top.push([x, yy - g.h * env + Math.sin(u * 9 + g.ph + t * 0.2) * 1.6]); bot.push([x, yy + g.h * 0.35 * env]); }
        const shp = top.concat(bot.reverse());
        shade(shp, colD);
        fill(shp.map((p, i) => [p[0], p[1] + (i < top.length ? 2.2 : -1)]), col);
      }
    };
  }
  function blobPts(rr, w, h) { const pts = []; for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.2832, j = 0.8 + rr() * 0.3; pts.push([Math.cos(a) * w / 2 * j, Math.sin(a) * h / 2 * j]); } return pts; }
  function wege() {
    const C = [[905, 792, 30], [926, 752, 20], [958, 714, 12], [985, 682, 7], [1001, 654, 3]];
    const L = [], R = [];
    for (const [x, y, w] of C) { L.push([x - w / 2, y]); R.push([x + w / 2, y]); }
    fill(L.concat(R.reverse()), P.valleyShade);
    const mid = C.map(([x, y]) => [x, y]); line(mid, P.valley, 1.2);
    // Telegrafenmasten: nach hinten kleiner und dichter
    const poles = [[932, 778, 40], [952, 740, 28], [972, 712, 19], [988, 690, 13], [999, 674, 9], [1007, 661, 6]];
    const tops = poles.map(([x, y, h]) => [x + 16 * (h / 40), y - h]);
    for (const [x, y, h] of poles) { const px = x + 16 * (h / 40); line([[px, y], [px, y - h]], P.line, Math.max(0.8, h * 0.06)); line([[px - h * 0.16, y - h * 0.9], [px + h * 0.16, y - h * 0.9]], P.line, Math.max(0.6, h * 0.035)); }
    ctx.save(); ctx.globalAlpha = 0.9; line(tops.map(([x, y], i) => [x - poles[i][2] * 0.14, y + poles[i][2] * 0.1]), P.line, 0.6); line(tops.map(([x, y], i) => [x + poles[i][2] * 0.14, y + poles[i][2] * 0.1]), P.line, 0.6); ctx.restore();
  }
  function loipe() {
    const pts = (off) => { const o = []; for (let k = 0; k <= 12; k++) { const u = k / 12, x = 1130 - u * 150 + Math.sin(u * 3) * 16, y = 812 - u * 78, sp = 8 * (1 - u * 0.8); o.push([x + off * sp, y]); } return o; };
    line(pts(-1), P.valleyShade, 1.6); line(pts(1), P.valleyShade, 1.6);
  }
  function branch(twig, scale, rr) {
    const wood = mix(P.wood, I.tinte, 0.35), at = (u) => { const i = Math.min(twig.length - 2, Math.floor(u * (twig.length - 1))), f = u * (twig.length - 1) - i; return [lerp(twig[i][0], twig[i + 1][0], f), lerp(twig[i][1], twig[i + 1][1], f)]; };
    for (let i = 0; i < twig.length - 1; i++) line([twig[i], twig[i + 1]], wood, (10 - i * 2) * scale);
    // Nadelbüschel hängen unter dem Zweig, hinten dunkel, vorn hell
    for (const pass of [0, 1]) for (let u = pass * 0.025; u < 0.98; u += 0.05) {
      const [px, py] = at(u), L = 112 * scale * (1 - u * 0.5) * (0.78 + rr() * 0.35), wd = 22 * scale * (1 - u * 0.45);
      const lean = pass ? -0.42 : -0.18, tip = [px + L * lean, py + L], pts = [[px - wd / 2, py - 2]];
      for (let k = 1; k <= 6; k++) { const v = k / 6, cx = lerp(px, tip[0], v), cy = lerp(py, tip[1], v), hw = wd / 2 * (1 - v * 0.85); pts.push([cx - hw - 6 * scale * (1 - v), cy - 4 * scale]); pts.push([cx - hw * 0.4, cy]); }
      pts.push(tip);
      for (let k = 6; k >= 1; k--) { const v = k / 6, cx = lerp(px, tip[0], v), cy = lerp(py, tip[1], v), hw = wd / 2 * (1 - v * 0.85); pts.push([cx + hw * 0.4, cy]); pts.push([cx + hw + 6 * scale * (1 - v), cy - 4 * scale]); }
      pts.push([px + wd / 2, py - 2]);
      fill(pts, pass ? P.tree : P.treeD);
    }
    const sn = [], sb = [];
    for (let u = 0; u <= 1.001; u += 0.04) { const [px, py] = at(Math.min(1, u)), th = (15 - u * 10) * scale * (0.75 + 0.5 * Math.abs(Math.sin(u * 19))); sn.push([px, py - th]); sb.push([px, py + 3 * scale]); }
    fill(sn.concat(sb.reverse()), P.tSnow);
    shade(sb.slice(0, sb.length).map((p) => [p[0], p[1] + 1]).concat(sb.slice().reverse().map((p) => [p[0], p[1] + 5 * scale])), P.tSnowD);
  }
  function frontLayer(O) {
    // Fichtenzweige oben rechts nur dort, wo der Wald nah ist
    const rr = rng(31);
    if ((NEAR[O.id] || {}).zweig) branch([[1320, 2], [1236, 40], [1150, 82], [1068, 132], [1002, 178]], 1, rr);
    if ((NEAR[O.id] || {}).zweig) branch([[1320, 128], [1270, 150], [1214, 178], [1170, 204]], 0.62, rr);
    // Bande unten rechts: Emailschild mit erfundener Werbung
    const bx = 1052, by = 748, bw = 260, bh = 46, post = mix(P.wood, I.tinte, 0.3);
    for (const x of [bx + 22, bx + 150]) rect(x, by + bh - 2, 6, 60, post);
    rect(bx, by, bw, bh, I.navy); rect(bx + 4, by + 4, bw - 8, bh - 8, P.abend ? mix(I.navy, I.violett, 0.3) : I.navy);
    ctx.strokeStyle = P.abend ? mix(I.papier, I.violett, 0.3) : I.papier; ctx.lineWidth = 1.6; ctx.strokeRect(bx + 5, by + 5, bw - 10, bh - 10);
    ctx.fillStyle = P.abend ? mix(I.papier, I.violett, 0.25) : I.papier; ctx.font = "700 22px Jost, Futura, sans-serif"; ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
    ctx.fillText("FIRNGOLD", bx + 18, by + bh / 2 + 1);
    const fw = ctx.measureText("FIRNGOLD").width;
    ctx.fillStyle = I.ocker; ctx.font = "600 14px Jost, Futura, sans-serif"; ctx.fillText("SKIWACHS", bx + 18 + fw + 12, by + bh / 2 + 1);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    fill([[bx - 3, by + 1], [bx + 30, by - 6], [bx + 90, by - 3], [bx + 160, by - 7], [bx + bw + 4, by - 2], [bx + bw + 4, by + 2], [bx - 3, by + 2]], P.tSnow);
  }

  // ================================================================ Übersicht vor dem Sprung (1280 × 592, wie Handy quer)
  const OVH = 592;
  const OV = {
    inrun: [[34, 52], [110, 96], [190, 142], [262, 184], [314, 211], [354, 230], [393, 242]],
    ground: [[-20, 80], [34, 70], [110, 112], [190, 158], [262, 199], [318, 228], [360, 249], [393, 262]],
    land: [[393, 262], [440, 267], [500, 284], [580, 320], [680, 382], [780, 448], [880, 506], [980, 548], [1080, 572], [1180, 584], [1300, 590]],
    shoulder: [[393, 256], [399, 300], [410, 360], [428, 430], [450, 510], [468, 610]],
  };
  const yOn = (pts, x) => skyY(pts, x);
  // Gelände unter dem Anlauf je Ort: Baumart, Dicke des Waldgürtels, Lichtungen [x0, x1], Bauten und Felsen [x, Tiefe, Breite]
  const OVT = {
    willingen: { typ: "misch", thick: 0.85, ph: 1, gaps: [[110, 190]], stadel: [[132, 34, 30]] },
    engelberg: { typ: "fichte", thick: 1, gaps: [[196, 252]], huette: [[208, 30, 24]] },
    predazzo: { typ: "laerche", thick: 1, ph: 2, fels: [[40, 70, 46], [250, 96, 34]] },
    holmenkollen: { typ: "birke", thick: 0.9, ph: 3, fels: [[200, 80, 30]] },
    oberstdorf: { typ: "fichte", thick: 1.15, ph: 4, gaps: [[50, 128]], stadel: [[70, 36, 32]] },
    garmisch: { typ: "misch", thick: 0.55, ph: 5, gaps: [[-40, 110], [250, 320]], stadel: [[24, 40, 30], [266, 44, 26]] },
    innsbruck: { typ: "fichte", thick: 0.35, ph: 6, sparse: true, fels: [[120, 60, 44], [300, 90, 30]] },
    bischofshofen: { typ: "fichte", thick: 1.35, ph: 7 },
    zakopane: { typ: "fichte", thick: 1.5, ph: 8, tall: true },
    planica: { typ: "latschen", kahl: true, fels: [[30, 50, 60], [170, 90, 48], [320, 60, 40], [470, 120, 34]] },
  };
  // Schanzenname je Ort für das Schanzenschild (Schanzennamen, keine Marken)
  const SCHILD = { willingen: "MÜHLENKOPF", engelberg: "TITLIS-SCHANZE", predazzo: "DAL BEN", holmenkollen: "HOLMENKOLLEN", oberstdorf: "SCHATTENBERG", garmisch: "GUDIBERG",
    innsbruck: "BERGISEL", bischofshofen: "BISCHOFSHOFEN", zakopane: "WIELKA KROKIEW", planica: "LETALNICA" };
  const PUTZ = { garmisch: 1, innsbruck: 1, oberstdorf: 1, planica: 1, predazzo: 1 };
  function judgeTower(O, x, yb) {
    const putz = PUTZ[O.id], wd = mix(P.wood, I.tinte, 0.2), wdD = mix(P.wood, I.tinte, 0.45), cw = 46, ch = 22, cy = yb - 64;
    if (putz) { fill([[x - 14, yb], [x - 10, cy], [x + 10, cy], [x + 14, yb]], P.wall); shade([[x + 2, cy], [x + 10, cy], [x + 14, yb], [x + 3, yb]], P.wallSide); for (let y = cy + 8; y < yb - 6; y += 12) rect(x - 4, y, 3, 5, P.win); }
    else {
      for (const px of [-15, -5, 5, 15]) line([[x + px * 1.25, yb], [x + px, cy]], wdD, 2);
      for (let y = cy + 8; y < yb - 4; y += 14) { line([[x - 18, y + 14], [x + 18, y]], wdD, 1); line([[x - 18, y], [x + 18, y + 14]], wdD, 1); }
      for (let y = cy + 5; y < yb; y += 22) line([[x - 19, y], [x + 19, y]], wd, 1.6);
    }
    const wall = putz ? P.wall : P.wood, side = putz ? P.wallSide : wdD;
    rect(x - cw / 2, cy - ch, cw, ch, wall);
    shade([[x + cw / 2, cy], [x + cw / 2 + 8, cy - 3], [x + cw / 2 + 8, cy - ch - 3], [x + cw / 2, cy - ch]], side);
    rect(x - cw / 2 + 4, cy - ch + 6, cw - 8, 8, P.abend ? P.winHi : P.win);
    for (let k = 1; k < 5; k++) rect(x - cw / 2 + 4 + k * (cw - 8) / 5 - 0.6, cy - ch + 6, 1.2, 8, wall);
    rect(x - cw / 2 - 3, cy - 2, cw + 6, 2.4, wdD);
    fill([[x - cw / 2 - 6, cy - ch], [x - cw / 2 + 6, cy - ch - 12], [x + cw / 2 - 2, cy - ch - 12], [x + cw / 2 + 10, cy - ch - 3]], P.roof);
    fill([[x - cw / 2 - 5, cy - ch - 1], [x - cw / 2 + 6, cy - ch - 13], [x + cw / 2 - 2, cy - ch - 13], [x + cw / 2 + 4, cy - ch - 7]], P.roofSnow);
    for (const [fx, f] of [[x - 12, O.flag], [x + 12, O.flag]]) { line([[fx, cy - ch - 12], [fx, cy - ch - 36]], I.tinte, 1.2); flagShape(fx, cy - ch - 36, 14, 9, f, () => 0); }
  }
  function schild(O, x, yb) {
    const name = SCHILD[O.id] || O.name.toUpperCase(), post = mix(P.wood, I.tinte, 0.3);
    ctx.font = "700 17px Jost, Futura, sans-serif"; if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
    const tw = ctx.measureText(name).width, w = tw + 62, h = 34, bx = x - w / 2, by = yb - h - 16;
    rect(bx + 10, by + h - 2, 4, 18, post); rect(bx + w - 14, by + h - 2, 4, 18, post);
    rect(bx, by, w, h, I.navy); ctx.strokeStyle = P.abend ? mix(I.papier, I.violett, 0.3) : I.papier; ctx.lineWidth = 1.4; ctx.strokeRect(bx + 3.5, by + 3.5, w - 7, h - 7);
    // Emblem: Kreis mit gekreuzten Ski und Stern
    const ex = bx + 20, ey = by + h / 2;
    dot(ex, ey, 11, I.ocker); dot(ex, ey, 9, I.navy);
    line([[ex - 6, ey + 6], [ex + 6, ey - 6]], I.papier, 1.8); line([[ex - 6, ey - 6], [ex + 6, ey + 6]], I.papier, 1.8);
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 1.2566; line([[ex, ey - 1], [ex + Math.cos(a) * 3.2, ey - 1 + Math.sin(a) * 3.2]], I.ocker, 1.1); }
    ctx.fillStyle = P.abend ? mix(I.papier, I.violett, 0.25) : I.papier; ctx.textBaseline = "middle"; ctx.fillText(name, bx + 40, by + h / 2 + 1);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    fill([[bx - 2, by + 1], [bx + w * 0.3, by - 4], [bx + w * 0.7, by - 2], [bx + w + 2, by - 4], [bx + w + 2, by + 2], [bx - 2, by + 2]], P.tSnow);
  }
  function crowd(x0, x1, yAt, rr, O) {
    const cols = [I.tinte, P.wood, I.navy, I.gruen, I.rot, mix(I.tinte, P.wood, 0.4)], skin = P.abend ? mix(I.gluehen, I.violett, 0.35) : mix(I.papier, I.dach, 0.28);
    for (const row of [0, 1]) for (let x = x0 + row * 3; x < x1; x += 4.2 + rr() * 2.6) {
      const y = yAt(x) + 6 + row * 7, c = cols[Math.floor(rr() * cols.length)];
      ctx.beginPath(); ctx.ellipse(x, y, 2.4, 4.6, 0, 0, 6.2832); ctx.fillStyle = c; ctx.fill();
      dot(x, y - 6, 1.9, skin); rect(x - 2.4, y - 8.6, 4.8, 1.8, rr() < 0.5 ? I.tinte : c);
      if (rr() < 0.06) { line([[x + 2, y - 4], [x + 2, y - 16]], I.tinte, 0.8); flagShape(x + 2, y - 16, 8, 5, O.flag, () => 0); }
    }
  }
  function hump(x, y, h) {
    const w = h * 2.2, pts = [];
    for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([x - w / 2 + u * w, y - Math.sin(u * Math.PI) * h - (k % 2 ? 0 : 1.2)]); }
    fill(pts.concat([[x + w / 2, y + 1], [x - w / 2, y + 1]]), P.treeD);
    fill(pts.slice(0, 6).concat([[x, y + 1], [x - w / 2, y + 1]]), P.tree);
    fill(pts.slice(1, 5).map((p, i) => [p[0], p[1] + (i % 2 ? 0 : 1)]).concat([[pts[4][0], pts[4][1] + 2.4], [pts[1][0], pts[1][1] + 2.4]]), P.tSnow);
  }
  function rock(x, y, w, rr) {
    const h = w * (0.45 + rr() * 0.2), pts = [[x - w / 2, y], [x - w * 0.36, y - h * 0.7], [x - w * 0.08, y - h], [x + w * 0.22, y - h * 0.86], [x + w / 2, y - h * 0.2], [x + w * 0.46, y]];
    fill(pts, P.alp.rockLit);
    shade([[x - w * 0.08, y - h], [x + w * 0.22, y - h * 0.86], [x + w / 2, y - h * 0.2], [x + w * 0.46, y], [x + w * 0.04, y]], P.alp.rock);
    fill([[x - w * 0.36, y - h * 0.7], [x - w * 0.08, y - h], [x + w * 0.22, y - h * 0.86], [x + w * 0.02, y - h * 0.8], [x - w * 0.2, y - h * 0.62]], P.tSnow);
    shade([[x - w / 2 - 4, y], [x + w / 2 + w * 0.6, y + 1], [x + w / 2 + w * 0.4, y + 5], [x - w / 2, y + 4]], P.kante);
  }
  // Ein Hang aus einem Stück: Gelände unter dem Anlauf und Aufsprunghang bilden eine durchgehende Oberkante.
  // Alles darunter (präparierter Streifen, Waldgürtel, Schneezonen) läuft parallel zu dieser Kante; keine senkrechte Fuge am Tisch.
  const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  function buildOverview(S) {
    const res = S.res, cv = document.createElement("canvas"); cv.width = Math.round(W * res); cv.height = Math.round(OVH * res);
    const c = cv.getContext("2d"); c.setTransform(res, 0, 0, res, 0, 0); c.lineJoin = "round"; ctx = c; P = S.P; r = rng(hash(S.O.id) ^ 71);
    const rr = rng(hash(S.O.id) ^ 73), L = OV.land, prf = (x) => yOn(L, x);
    const GP = OV.ground.concat(L.slice(1)), gp = (x) => yOn(GP, x), X0 = -20, X1 = 1300, YB = OVH + 20;
    const V = OVT[S.O.id] || OVT.engelberg;
    // Bäume auf der abgewandten Flanke, über der Kante sichtbar, in der Baumart des Orts
    for (let x = X0; x < 1140; x += 8 + rr() * 9) {
      const nt = x < 380 ? 1.25 : 1, h = (7 + rr() * 9) * nt * (V.tall ? 1.3 : 1), y = gp(x) + 1.5, t = V.typ === "misch" && Math.sin(x * 0.02) > 0.2 ? "laerche" : V.typ;
      if (t === "latschen") { if (rr() < 0.5) hump(x, y, h * 0.5); }
      else if (t === "laerche") (rr() < 0.25 ? spruce(x, y, h, 0) : larch(x, y, h * 1.2));
      else if (t === "birke") (rr() < 0.35 ? spruce(x, y, h, 0) : birch(x, y, h * 1.1));
      else spruce(x, y, h, rr() < 0.3 ? 2 : 0);
    }
    judgeTower(S.O, 706, gp(706) + 2);
    // Schneekörper: eine Fläche unter der ganzen Kante
    const top = []; for (let x = X0; x <= X1; x += 6) top.push([x, gp(x)]);
    const body = top.concat([[X1, YB], [X0, YB]]);
    ctx.save(); path(body); ctx.clip();
    rect(X0, 0, X1 - X0, YB, P.hill[3]);
    const zz = (d, a, f, ph) => (x) => gp(x) + d + Math.sin(x * f + ph) * a + Math.sin(x * f * 2.6 + ph) * a * 0.3;
    const zs = [null, zz(168, 12, 0.009, 1), zz(250, 16, 0.007, 3), zz(336, 18, 0.006, 5)];
    for (let k = 2; k >= 0; k--) { const f = zs[k + 1], bt = []; for (let x = X1; x >= X0; x -= 8) bt.push([x, f(x)]); (k === 0 ? fill : shade)(top.concat(bt), P.hill[k]); }
    for (let k = 1; k <= 3; k++) spray(zs[k], P.hill[k - 1], P.hill[k], X0, X1, 1400, 22);
    // Waldgürtel parallel zur Kante; Baumart, Dicke, Lichtungen und Felsen je Ort (OVT)
    const ft = (x) => gp(x) + lerp(3, 58, sstep(300, 560, x));
    const gapM = (x) => (V.gaps || []).reduce((m, [a, b]) => m * (1 - sstep(a - 14, a + 14, x) * (1 - sstep(b - 14, b + 14, x))), 1);
    const thick = (x) => (V.typ === "latschen" ? 0 : 1) * (V.thick || 1) * gapM(x) * (76 + Math.sin(x * 0.021 + (V.ph || 0)) * 16 + Math.max(0, Math.sin(x * 0.011 + 1.3 + (V.ph || 0))) * 44) * (1 - sstep(640, 960, x));
    const fb = (x) => ft(x) + thick(x);
    const seg = (x) => V.typ === "misch" ? (Math.sin(x * 0.024 + 0.7) > 0.15 ? "laerche" : "fichte") : V.typ;
    const BASE = { fichte: P.tree, laerche: P.abend ? mix(P.wood, I.violett, 0.3) : mix(I.ocker, P.wood, 0.55), birke: P.abend ? mix(P.wood, I.violett, 0.45) : mix(mix(P.wood, I.violett, 0.4), P.wall, 0.3) };
    { const a = [], b = []; for (let x = X0; x <= 980; x += 8) { const th = thick(x); a.push([x, fb(x) - 2]); b.push([x, fb(x) + 9 * Math.min(1, th / 30) + Math.sin(x * 0.05) * 2]); } shade(a.concat(b.reverse()), P.kante); }
    // Gürtel in Abschnitten derselben Baumart zeichnen
    let xa = X0;
    while (xa < 980) {
      const t = seg(xa); let xb = xa; while (xb < 980 && seg(xb) === t) xb += 4.5; xb = Math.min(980, xb + 4.5);
      const base = BASE[t] || P.tree, mid = mix(base, P.treeD, t === "fichte" ? 0.55 : 0.4), tall = V.tall ? 1.6 : 1;
      const crown = []; let i = 0;
      for (let x = xa; x <= xb; x += t === "fichte" ? 4.5 : 3) { const th = thick(x), amp = Math.min(1, th / 40); crown.push([x, ft(x) - (th < 4 ? 0 : t === "fichte" ? (i++ % 2 ? 1.5 : (5 + rr() * 8) * amp * tall) : (2 + Math.abs(Math.sin(x * 0.3)) * 5 + rr() * 2) * amp)]); }
      const bot = []; for (let x = xb; x >= xa; x -= 4.5) bot.push([x, fb(x) - (Math.round(x) % 9 < 4.5 || thick(x) < 6 ? 0 : 5)]);
      fill(crown.concat(bot), base);
      { const p = []; for (let x = xa; x <= xb; x += 8) p.push([x, ft(x) + thick(x) * 0.55 + Math.sin(x * 0.03) * 5]); shade(p.concat(bot), mid); }
      if (t === "fichte") {
        for (const u of [0.14, 0.3, 0.48, 0.66, 0.84]) for (let x = xa + rr() * 8; x < xb; x += 7 + rr() * 6) {
          const th = thick(x); if (th < 14) continue;
          const y = ft(x) + th * u + (rr() - 0.5) * 5, h = (8 + rr() * 6) * tall, w = h * 0.62;
          fill([[x, y - h], [x + w / 2, y], [x - w / 2, y]], mix(u < 0.55 ? base : mid, P.treeD, 0.35));
          fill([[x, y - h], [x - w * 0.18, y - h * 0.45], [x - w / 2, y - 0.5], [x - w * 0.12, y - h * 0.62]], P.tSnow);
        }
        for (let k = 1; k < crown.length - 1; k += 2) { const [tx, ty] = crown[k]; if (ty < ft(tx) - 2) fill([[tx, ty], [tx - 2.4, ty + 4], [tx - 0.3, ty + 3]], P.tSnow); }
        // einzelne hohe Fichten ragen aus dem Gürtel
        for (let x = xa + 20 + rr() * 30; x < xb - 10; x += 52 + rr() * 70) { if (thick(x) < 30) continue; spruce(x, ft(x) + 10 + rr() * 8, (26 + rr() * 22) * tall, rr() < 0.5 ? 0 : 1); }
      } else {
        // Laubwald und Lärchen: Stämme als feine senkrechte Striche, Schnee auf den Ästen
        const trunk = t === "birke" ? P.wall : mix(P.wood, I.tinte, 0.35);
        for (let x = xa + rr() * 4; x < xb; x += 3 + rr() * 4) {
          const th = thick(x); if (th < 10) continue;
          const y0 = ft(x) + 2 + rr() * th * 0.5, y1 = Math.min(fb(x) - 2, y0 + 10 + rr() * 22);
          line([[x, y0], [x, y1]], trunk, t === "birke" ? 1.4 : 0.9);
          if (t === "birke") rect(x - 0.7, y0 + (y1 - y0) * 0.4, 1.4, 1.2, I.tinte);
          if (rr() < 0.5) line([[x - 2.4, y0 + 2], [x + 0.4, y0 + 0.6]], P.tSnow, 1.2);
        }
        for (let x = xa + rr() * 10; x < xb; x += 16 + rr() * 22) { if (thick(x) < 24) continue; const y = ft(x) + 6 + rr() * thick(x) * 0.6; spruce(x, y + 12, 12 + rr() * 6, 0); }
        for (const [tx, ty] of crown) if (rr() < 0.4 && ty < ft(tx) - 1) dot(tx, ty + 1, 1.2, P.tSnow);
      }
      xa = xb;
    }
    // Lichtungen mit Stadel oder Hütte, Felsen, Latschen
    for (const [x, d, w] of (V.stadel || [])) stadel(x, gp(x) + d, w);
    for (const [x, d, w] of (V.huette || [])) house(x, gp(x) + d, w, w * 0.6, preset("chalet", rr));
    for (const [x, d, w] of (V.fels || [])) rock(x, gp(x) + d, w, rr);
    if (V.typ === "latschen") for (let x = X0 + 10; x < 560; x += 9 + rr() * 16) { const y = gp(x) + 14 + rr() * 140; if (rr() < 0.7) hump(x, y, 6 + rr() * 9); }
    // Kantenschatten unter dem präparierten Streifen, beginnt am Tisch
    { const a = [], b = []; for (let x = 393; x <= X1; x += 8) { const g = sstep(393, 470, x); a.push([x, gp(x) + 5]); b.push([x, gp(x) + 5 + 8 * g]); } shade(a.concat(b.reverse()), P.kante); }
    // Mulden im präparierten Streifen und im Auslauf
    for (const [x, d, Ln, t] of [[620, 34, 150, 6], [800, 52, 200, 8], [1010, 38, 170, 6], [1180, 70, 220, 9]]) { const a = Math.atan2(gp(x + 10) - gp(x - 10), 20); ctx.save(); ctx.translate(x + OFF[0], gp(x) + d + OFF[1]); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, Ln / 2, t / 2, 0, 0, 6.2832); ctx.fillStyle = P.mulde; ctx.fill(); ctx.restore(); }
    // Baumgruppen auf dem Schnee unter dem Wald, in der Baumart des Orts
    if (!V.kahl) {
      const g = [];
      for (let x = X0 + 30; x < 900; x += (V.sparse ? 46 : 64) + rr() * 56) {
        const y = fb(x) + 40 + rr() * 110, t = seg(x);
        if (t === "laerche") { larch(x, y, 22 + rr() * 16); continue; }
        if (t === "birke") { birch(x, y, 20 + rr() * 14); birch(x + 8, y + 3, 16 + rr() * 10); continue; }
        if (t === "latschen") continue;
        g.push([x, y, (20 + rr() * 22) * (V.tall ? 1.3 : 1), 0], [x + 11, y + 4, 14 + rr() * 12, 2]);
      }
      grove(g, true);
    }
    ctx.restore();
    line(L, P.key, 2.2);
    // Anlauf: Holzbahn auf Stützen, Starthaus, Schanzentisch
    const I0 = OV.inrun, G0 = OV.ground, tw = P.wood, tD = mix(P.wood, I.tinte, 0.4);
    for (let k = 0; k < I0.length - 1; k++) { const [ax, ay] = I0[k], [bx, by] = I0[k + 1]; for (let u = 0; u < 1; u += 0.34) { const x = lerp(ax, bx, u), y = lerp(ay, by, u); line([[x, y + 3], [x, yOn(G0, x) + 2]], tD, 1.6); } }
    line(I0.map(([x, y]) => [x, y + 2]), tD, 6); line(I0, tw, 4.4); line(I0.map(([x, y]) => [x, y - 2]), P.roofSnow, 1.4);
    fill([[384, 241], [395, 241], [395, 262], [388, 262]], tD); rect(384, 239.5, 11, 2.2, P.roofSnow);
    house(12, 66, 26, 16, { wall: P.wood, side: tD, roof: P.wood, k: 0.4, balcony: false });
    // Flutlichtmasten
    for (const x of [470, 660, 860, 1060]) { const y = prf(x) - 2; line([[x, y], [x, y - 54]], P.line, 1.6); rect(x - 9, y - 60, 18, 7, P.line); for (let j = 0; j < 4; j++) dot(x - 6 + j * 4, y - 56.5, 1.3, P.abend ? I.ocker : P.wall); }
    for (const d of [0.55, 0.78]) { const x = lerp(393, 1300, d), y = prf(x); line([[x - 5, y + 1], [x + 5, y + 4]], d === 0.78 ? I.rot : P.key, 3.6); }
    // Starthaus-Fahne, Trainerpodest am Tisch
    line([[25, 48], [25, 26]], I.tinte, 1.2); flagShape(25, 26, 13, 8, S.O.flag, () => 0);
    { const px = 430, py = gp(430) - 2; for (const dx of [-8, 8]) line([[px + dx, py], [px + dx, py - 22]], tD, 1.6); rect(px - 11, py - 24, 22, 3, tw); line([[px - 11, py - 24], [px - 11, py - 31], [px + 11, py - 31], [px + 11, py - 24]], tD, 1); rect(px - 11, py - 25.6, 22, 1.6, P.roofSnow); }
    // Auslauf: Zuschauer, Hütten im Stil des Orts, Schanzenschild
    crowd(1000, 1290, gp, rr, S.O);
    const hs = (S.O.town && S.O.town[0] && S.O.town[0].house) || "chalet";
    for (const [x, d, w] of [[150, 46, 26], [178, 52, 18], [470, 34, 22], [760, 26, 24]]) { const y = Math.min(OVH - 8, fb(x) + d); house(x, y, w, w * 0.62, preset(hs, rr)); }
    schild(S.O, 610, Math.min(OVH - 14, fb(610) + 64));
    // große Einzelbäume vorn, kleine weiter oben: Maßstab und Tiefe
    const big = V.typ === "latschen" ? [] : [[64, 186, 74], [338, 210, 92], [560, 236, 66]];
    for (const [x, d, h] of big) {
      const y = fb(x) + d * 0.55, t = seg(x);
      if (y > OVH + 30) continue;
      shade([[x, y + 1], [x + h * 0.9, y], [x + h * 0.7, y + h * 0.06], [x, y + h * 0.05]], P.kante);
      if (t === "laerche") larch(x, y, h * 1.1); else if (t === "birke") birch(x, y, h); else spruce(x, y, h, 1);
    }
    // Fahnen am Auslauf stehen auf dem Hang, nicht in der Nahebene des Flugbilds
    S.A.ov = (S.O.flags || []).slice(0, 2).map((f, i) => { const x = 1004 + i * 44; return flagAnim(x, gp(x) + 3, 58, f[3], f[4], f[5] || S.O.flag, i * 1.7); });
    S.ov = cv;
  }

  // ================================================================ Szene bauen und zeichnen
  function build(id, variant, opts) {
    const o = Object.assign({ res: 2 }, opts || {});
    const O = BY[id] || ORTE[0]; P = PAL[variant] || PAL.sonne; OFF = [1.3, 0.7];
    const S = { O, P, variant, res: o.res, A: { far: [], mid: [], near: [] } };
    const mk = () => { const cv = document.createElement("canvas"); cv.width = Math.round(W * o.res); cv.height = Math.round(H * o.res); const c = cv.getContext("2d"); c.setTransform(o.res, 0, 0, o.res, 0, 0); c.lineJoin = "round"; return [cv, c]; };
    let cv, c;
    [cv, c] = mk(); ctx = c; r = rng(hash(O.id) ^ 11); sky(); S.sky = cv;
    const geos = O.ranges.map((R, i) => buildRange(R, (hash(O.id) + i * 977) >>> 0));
    const farExtras = (first) => {
      const F = O.far || {};
      if (F.tower) latticeTower(F.tower);
      if (F.skywalk) skywalk(F.skywalk);
      if (F.cross) { const [x, y] = F.cross; line([[x, y + 1], [x, y - 15]], I.tinte, 1.8); line([[x - 5, y - 10], [x + 5, y - 10]], I.tinte, 1.8); }
      if (first) for (const d of (F.drift || [])) S.A.far.push(driftAnim(d[0], d[1], d[2], d[0] * 0.01));
    };
    const hz = hazeRanges(O);
    [cv, c] = mk(); ctx = c; for (const h of hz) paintHaze(h, "lit"); for (const G of geos) paintRange(G, "lit"); farExtras(true); S.farLit = cv;
    [cv, c] = mk(); ctx = c; for (const h of hz) paintHaze(h, "erd"); for (const G of geos) paintRange(G, "erd"); farExtras(false); S.farErd = cv;
    S.mtnClip = new Path2D(); for (const G of geos.concat(hz.map((h) => h.G))) { const p = G.poly; S.mtnClip.moveTo(p[0][0], p[0][1]); for (const q of p) S.mtnClip.lineTo(q[0], q[1]); S.mtnClip.closePath(); }
    S.hillClip = new Path2D(); S.hillClip.moveTo(-20, prof(-20)); for (let x = -20; x <= 980; x += 20) S.hillClip.lineTo(x, prof(x)); S.hillClip.lineTo(980, 830); S.hillClip.lineTo(-20, 830); S.hillClip.closePath();
    const cr = rng(hash(O.id) ^ 55);
    S.clouds = { m: [0, 1, 2].map((i) => ({ x: i * 620 + cr() * 300, y: 270 + cr() * 150, v: 9 + cr() * 5, pts: blobPts(cr, 320 + cr() * 180, 60 + cr() * 50) })), h: [0, 1].map((i) => ({ x: i * 900 + cr() * 300, y: 480 + cr() * 220, v: 26 + cr() * 8, pts: blobPts(cr, 280 + cr() * 120, 46 + cr() * 30) })) };
    const mistC = P.abend ? mix(P.valley, P.sky[4], 0.45) : mix(I.papier, I.dunst, 0.45), mistD = P.abend ? mix(P.valleyShade, P.sky[3], 0.3) : I.dunst;
    S.A.far.push(mistAnim(O.fjord ? O.fjord.y0 + 8 : 524, 17, 7, hash(O.id) ^ 3, mistC, mistD));
    [cv, c] = mk(); ctx = c; r = rng(hash(O.id) ^ 23);
    valley(O);
    valleyDetail(O);
    wege();
    const M = O.mid || {};
    if (M.river) river(M.river);
    if (M.viaduct) viaduct(M.viaduct);
    if (M.train) line([[M.train.x0, M.train.y + 0.6], [M.train.x1, M.train.y + 0.6]], P.line, 1.2);
    for (const k of (M.kozolci || [])) kozolec(k[0], k[1]);
    for (const g of (M.groves || [])) grove(g, true);
    if (M.hamlet) { const h = M.hamlet; for (const [dx, w] of [[-34, 10], [-20, 12], [-6, 9], [8, 12], [22, 10]]) house(h.cx + dx, h.yb + (dx % 3), w, w * 0.62, preset("chalet", rng(3))); }
    for (const T of (O.town || [])) town(T, S.A);
    if (M.city) city(M.city, S.A);
    for (const cb of (M.cables || [])) { line([[cb[0], cb[1]], [cb[2], cb[3]]], P.line, 1.1); station(cb[0], cb[1] + 1); station(cb[2], cb[3] + 1); S.A.mid.push(cabinAnim(cb)); }
    if (M.funicular) { const f = M.funicular; line([[f[0], f[1]], [f[2], f[3]]], P.line, 1.6); station(f[0], f[1]); station(f[2], f[3]); S.A.mid.push(funicularAnim(f)); }
    if (M.train) S.A.mid.push(trainAnim(M.train));
    if (M.ferry) S.A.mid.push(ferryAnim(M.ferry));
    if (M.sleigh) S.A.mid.push(sleighAnim(M.sleigh));
    S.mid = cv;
    S.A.mid.push(mistAnim(O.fjord ? 568 : 662, 12, 11, hash(O.id) ^ 9, mistC, mistD));
    [cv, c] = mk(); ctx = c; nearLayer(O); S.near = cv;
    (O.flags || []).forEach((f, i) => S.A.near.push(flagAnim(f[0], f[1], f[2], f[3], f[4], f[5] || O.flag, i * 1.7)));
    [cv, c] = mk(); ctx = c; r = rng(5); hillLayer(); S.hill = cv;
    [cv, c] = mk(); ctx = c; spielLayer(); S.spiel = cv;
    [cv, c] = mk(); ctx = c; frontLayer(O); S.front = cv;
    const fr = rng(hash(O.id) ^ 99), n = Math.round(70 * (O.snow || 0.5));
    S.flakes = []; for (let i = 0; i < Math.max(n, 30); i++) S.flakes.push({ x: fr() * 1320, y: fr() * 820, v: 26 + fr() * 34, rad: 0.9 + fr() * 1.5, ph: fr() * 6.3 });
    S.grain = grainPattern(variant);
    if (o.uebersicht !== false) buildOverview(S);
    return S;
  }

  const INTRO = 6.2;
  function frame(S, c, t, ti, o) {
    o = Object.assign({ spiel: true, korn: 0.4 }, o || {});
    P = S.P; OFF = [1.3, 0.7]; ctx = c;
    const k = c.canvas.width / W, intro = ti != null && ti < INTRO;
    const ez = (a, d) => (!intro ? 1 : ease((ti - a) / d));
    // Tiefe: jede Ebene verschiebt sich mit ihrem Tiefenfaktor f; bei der Ankunft zoomen nahe Ebenen stärker (Dolly)
    const DY = o.uebersicht ? -150 : 0, dz = 1 - ez(0, 3.4), tf = o.tiefe || 0, cam = o.cam || { x: 0, y: 0 }, over = 1 + 0.055 * tf;
    const T = (dx, dy, f) => {
      f = f || 0;
      const z = over * (1 + 0.07 * dz * (tf > 0 ? 0.2 + f * 1.6 : 1)), px = dx - cam.x * f * 40 * tf, py = dy + DY - cam.y * f * 22 * tf;
      c.setTransform(k * z, 0, 0, k * z, ((1 - z) * W * 0.5 + px * z) * k, ((1 - z) * H * 0.55 + py * z) * k);
    };
    const DEPTH = [0.12, 0.4, 1];
    const flakes = (d) => {
      T(0, 0, DEPTH[d]);
      const sz = [0.6, 1, 1.75][d], sp = [0.55, 1, 1.5][d];
      for (let i = d; i < S.flakes.length; i += 3) { const f = S.flakes[i], y = ((f.y + t * f.v * sp) % 830) - 15, x = ((((f.x + t * 14 * sp + Math.sin(t * 0.8 + f.ph) * 8) % 1320) + 1320) % 1320) - 20; dot(x, y, f.rad * sz, P.chalk); }
    };
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    T(0, 0, 0.02); c.drawImage(S.sky, 0, 0, W, H);
    const fo = (1 - ez(0, 1.6)) * 90, mo = (1 - ez(0.35, 1.5)) * 70, no = (1 - ez(0.8, 1.4)) * 180;
    // Licht auf den Gipfeln: morgens fließt es von oben herab, abends steigt der Erdschatten hinauf
    let shift = null;
    if (!P.abend) { if (intro) shift = lerp(-260, 560, ez(1.0, 2.4)); }
    else shift = intro ? lerp(560, 0, ez(1.0, 2.6)) : 0;
    T(0, fo, 0.08);
    if (shift == null || shift >= 540) c.drawImage(S.farLit, 0, 0, W, H);
    else {
      c.save(); c.beginPath(); c.moveTo(-40, -40); c.lineTo(W + 40, -40); for (let x = W + 40; x >= -40; x -= 40) c.lineTo(x, erdLine(x) + shift); c.closePath(); c.clip(); c.drawImage(S.farLit, 0, 0, W, H); c.restore();
      c.save(); c.beginPath(); c.moveTo(-40, H + 200); c.lineTo(W + 40, H + 200); for (let x = W + 40; x >= -40; x -= 40) c.lineTo(x, erdLine(x) + shift); c.closePath(); c.clip(); c.drawImage(S.farErd, 0, 0, W, H); c.restore();
    }
    for (const a of S.A.far) a(t);
    const clouds = (list, clip, col, al) => {
      c.save(); c.clip(clip); c.globalAlpha = al;
      for (const b of list) { const x = ((b.x + t * b.v) % (W + 900)) - 450; fill(b.pts.map((p) => [p[0] + x, p[1] + b.y]), col); }
      c.restore();
    };
    if (!P.abend && o.wolken !== false) clouds(S.clouds.m, S.mtnClip, P.alp.rock, 0.24);
    flakes(0);
    T(0, mo, 0.22); c.drawImage(S.mid, 0, 0, W, H); for (const a of S.A.mid) a(t);
    if (!o.uebersicht) { T(0, no * 0.5, 0.5); c.drawImage(S.near, 0, 0, W, H); for (const a of S.A.near) a(t); }
    flakes(1);
    if (o.uebersicht) { const z0 = over; c.setTransform(k * z0, 0, 0, k * z0, (1 - z0) * W * 0.5 * k - cam.x * 0.85 * 40 * tf * k, (1 - z0) * OVH * 0.55 * k - cam.y * 0.85 * 22 * tf * k); c.drawImage(S.ov, 0, 0, W, OVH); for (const a of (S.A.ov || [])) a(t); }
    else {
    T(-no * 0.9, no * 0.7, 0.85); c.drawImage(S.hill, 0, 0, W, H);
    if (!P.abend && o.wolken !== false) clouds(S.clouds.h, S.hillClip, P.hill[3], 0.14);
    if (o.spiel && (!intro || ti > INTRO - 0.4)) { T(0, 0, 0.85); c.drawImage(S.spiel, 0, 0, W, H); }
    if (o.vorne !== false) { T(no * 0.8, no * 0.4, 1.15); c.drawImage(S.front, 0, 0, W, H); }
    }
    flakes(2);
    c.setTransform(k, 0, 0, k, 0, 0);
    if (o.korn > 0) {
      const pat = c.createPattern(S.grain, "repeat");
      if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(0.5));
      c.save(); c.globalAlpha = Math.min(1, o.korn * 0.55); c.fillStyle = pat; c.fillRect(-40, -40, W + 80, H + 80); c.restore();
    }
    if (intro) band(S, ti, ez);
  }
  // Schriftband der Ankunft: läuft von links ein, steht, läuft rechts hinaus
  function band(S, ti, ez) {
    const a = ez(2.2, 0.8), b = ti > 5.2 ? ease((ti - 5.2) / 0.6) : 0;
    if (a <= 0 || b >= 1) return;
    const y = 600, h = 132, x = -W * (1 - a) + W * b;
    ctx.save(); ctx.translate(x, 0);
    rect(-10, y, W + 20, h, P.band); rect(-10, y + 8, W + 20, 2, P.bandInk); rect(-10, y + h - 10, W + 20, 2, P.bandInk);
    line([[72, y + 30], [72, y + 104]], P.bandInk, 2);
    flagShape(72, y + 31, 64, 42, S.O.flag, () => 0);
    ctx.fillStyle = P.bandInk; ctx.textBaseline = "alphabetic";
    ctx.font = "700 " + (S.O.name.length > 14 ? 54 : 76) + "px Jost, Futura, 'Avenir Next', sans-serif";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "5px";
    ctx.fillText(S.O.name.toUpperCase(), 168, y + 86);
    ctx.font = "600 21px Jost, Futura, 'Avenir Next', sans-serif";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
    ctx.fillText((S.O.land + "  ·  " + S.O.schanze).toUpperCase(), 172, y + 114);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.restore();
  }

  window.TelemarkOrte = { ORTE, PAL, INK: I, build, frame, INTRO, OVH };
})();
