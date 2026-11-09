// TELEMARK · Plakat-Renderer (Entwurf). Alles Canvas 2D: Polygone, Vollton, gestufte Verläufe, Korn.
// Bildraum 1280 × 800 (16:10), Horizont y = 520. Aufruf: TelemarkPlakat.draw(ctx, { variant, korn, passer, kontur })
(function () {
  const INK = {
    kobalt: "#1F56A8", himmel: "#4F86C6", dunst: "#BFD6EA", papier: "#F4EEDF", schatten: "#8DAFD8", tief: "#5C78B8",
    gluehen: "#E9A58C", violett: "#6B5C8E", fichte: "#2D5546", fichteD: "#1D3A33", dach: "#8E4A2E",
    rot: "#C23B2A", ocker: "#DDA43B", tinte: "#1E2734", gruen: "#3F6B55",
  };
  const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  function mix(a, b, t) {
    const A = hx(a), B = hx(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  const I = INK;

  const PAL = {
    sonne: {
      sky: [I.kobalt, mix(I.kobalt, I.himmel, 0.5), I.himmel, mix(I.himmel, I.dunst, 0.5), I.dunst],
      m: { lit: I.papier, shade: I.schatten, firn: I.dunst, rock: I.tief, rockLit: I.schatten, crev: I.schatten },
      mFar: { lit: mix(I.papier, I.dunst, 0.3), shade: mix(I.schatten, I.dunst, 0.4), firn: I.dunst, rock: mix(I.tief, I.dunst, 0.35), rockLit: mix(I.schatten, I.dunst, 0.3), crev: I.schatten },
      erd: null, moon: null,
      farForest: mix(I.tief, I.fichte, 0.45), farForestTip: I.tief,
      valley: I.papier, valleyShade: I.schatten,
      wall: I.papier, wallSide: I.schatten, roof: I.dach, roofSnow: I.papier, roofSnowD: I.schatten,
      win: I.tief, winHi: I.tief, door: I.dach,
      tree: I.fichte, treeD: I.fichteD, tSnow: I.papier, tSnowD: I.schatten,
      hill: [I.papier, I.dunst, I.schatten, I.tief], kante: I.schatten, mulde: I.dunst, key: I.tief, hillShadow: I.tief,
      smoke: I.papier, smokeD: I.dunst, line: I.tief, loco: I.fichteD, red: I.rot,
      chalk: I.papier, spray: I.tinte,
    },
    gluehen: {
      sky: [mix(I.violett, I.tinte, 0.4), I.violett, mix(I.violett, I.gluehen, 0.3), mix(I.violett, I.gluehen, 0.55), mix(I.violett, I.gluehen, 0.78)],
      m: { lit: I.gluehen, shade: I.violett, firn: mix(I.gluehen, I.papier, 0.5), rock: mix(I.violett, I.tinte, 0.38), rockLit: mix(I.gluehen, I.violett, 0.45), crev: mix(I.gluehen, I.violett, 0.4) },
      mFar: { lit: mix(I.gluehen, I.violett, 0.18), shade: mix(I.violett, I.gluehen, 0.2), firn: mix(I.gluehen, I.papier, 0.3), rock: mix(I.violett, I.tinte, 0.2), rockLit: mix(I.gluehen, I.violett, 0.5), crev: mix(I.gluehen, I.violett, 0.4) },
      // Erdschatten: unterhalb der Linie liegt das Gebirge schon im Schatten, nur die Gipfel glühen
      erd: { y: 368, lit: mix(I.violett, I.schatten, 0.45), shade: I.violett, firn: mix(I.violett, I.schatten, 0.62), rock: mix(I.violett, I.tinte, 0.35), rockLit: mix(I.violett, I.schatten, 0.2), crev: mix(I.violett, I.schatten, 0.2) },
      moon: mix(I.papier, I.gluehen, 0.25),
      farForest: mix(I.violett, I.fichteD, 0.55), farForestTip: mix(I.violett, I.fichteD, 0.3),
      valley: mix(I.schatten, I.violett, 0.3), valleyShade: mix(I.violett, I.schatten, 0.3),
      wall: mix(I.papier, I.violett, 0.3), wallSide: mix(I.violett, I.papier, 0.25), roof: mix(I.dach, I.violett, 0.4), roofSnow: mix(I.papier, I.violett, 0.38), roofSnowD: mix(I.violett, I.schatten, 0.35),
      win: I.ocker, winHi: mix(I.ocker, I.papier, 0.45), door: mix(I.dach, I.violett, 0.4),
      tree: mix(I.fichte, I.violett, 0.3), treeD: I.fichteD, tSnow: mix(I.schatten, I.gluehen, 0.25), tSnowD: mix(I.schatten, I.violett, 0.45),
      hill: [mix(I.schatten, I.gluehen, 0.32), mix(I.schatten, I.violett, 0.35), mix(I.violett, I.schatten, 0.25), mix(I.violett, I.tinte, 0.3)],
      kante: mix(I.violett, I.schatten, 0.3), mulde: mix(I.schatten, I.violett, 0.25), key: mix(I.violett, I.tinte, 0.45), hillShadow: mix(I.violett, I.tinte, 0.35),
      lip: mix(I.gluehen, I.papier, 0.4),
      smoke: mix(I.papier, I.violett, 0.42), smokeD: mix(I.violett, I.papier, 0.22), line: mix(I.violett, I.tinte, 0.5), loco: I.fichteD, red: I.rot,
      chalk: mix(I.papier, I.gluehen, 0.3), spray: I.tinte,
    },
  };
  // Druckfarben je Variante (für die Legende im Entwurf)
  const INKS = {
    sonne: [["Kobalt", I.kobalt], ["Himmel", I.himmel], ["Dunst", I.dunst], ["Papierweiß", I.papier], ["Schneeschatten", I.schatten], ["Tiefschatten", I.tief], ["Fichte", I.fichte], ["Fichte dunkel", I.fichteD], ["Holz & Dach", I.dach], ["Signalrot", I.rot]],
    gluehen: [["Abendviolett", I.violett], ["Alpenglühen", I.gluehen], ["Papierweiß", I.papier], ["Schneeschatten", I.schatten], ["Tinte", I.tinte], ["Fichte", I.fichte], ["Fichte dunkel", I.fichteD], ["Holz & Dach", I.dach], ["Ocker", I.ocker], ["Signalrot", I.rot]],
  };

  const W = 1280, H = 800, HOR = 520;
  let ctx, P, OFF, r;

  function path(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function fill(pts, c) { path(pts); ctx.fillStyle = c; ctx.fill(); }
  // Schattenplatte: mit Passerversatz gedruckt
  function shade(pts, c) { ctx.save(); ctx.translate(OFF[0], OFF[1]); fill(pts, c); ctx.restore(); }
  function line(pts, c, w) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
  function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function dot(x, y, rad, c) { ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fillStyle = c; ctx.fill(); }

  // Spritzkorn an einer Stufenkante: Punkte der oberen Farbe sinken ein, wenige der unteren steigen auf
  function spray(yAt, up, down, x0, x1, n, reach) {
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = yAt(x);
      const d = Math.pow(r(), 2.4) * reach;
      dot(x, y + d, 0.55 + r() * 0.9, up);
      if (i % 3 === 0) dot(x0 + r() * (x1 - x0), y - Math.pow(r(), 2.4) * reach * 0.4, 0.5 + r() * 0.7, down);
    }
  }

  // ---------------------------------------------------------------- Himmel in fünf Stufen
  function sky() {
    const ys = [0, 118, 222, 318, 412, HOR + 30];
    for (let i = 0; i < 5; i++) rect(0, ys[i], W, ys[i + 1] - ys[i] + 1, P.sky[i]);
    for (let i = 1; i < 5; i++) spray(() => ys[i], P.sky[i - 1], P.sky[i], 0, W, 2200, 30);
    if (P.moon) { dot(986, 178, 12, P.moon); }
  }

  // ---------------------------------------------------------------- Hausberg: Titlis, Spannörter, Hahnen
  const MOUNTS = [
    { far: true, // Spannörter, Doppelhorn hinten
      sil: [[630, 530], [690, 448], [736, 414], [766, 384], [790, 340], [805, 316], [818, 338], [834, 360], [850, 346], [866, 322], [880, 306], [894, 334], [914, 378], [952, 418], [992, 458], [1030, 530]],
      firn: [[[742, 420], [772, 392], [794, 360], [800, 396], [776, 420], [752, 430]]],
      shade: [[[805, 316], [818, 338], [834, 360], [842, 420], [826, 530], [810, 530], [800, 440], [812, 378]], [[880, 306], [894, 334], [914, 378], [952, 418], [992, 458], [1030, 530], [882, 530], [868, 440], [884, 372]]],
      rock: [], rinnen: [[820, 340, 60, 7, 0.2], [896, 338, 70, 8, 0.3], [930, 396, 50, 6, 0.4]], rockLit: [], crev: [] },
    { // Titlis: breiter Gletscherdom
      sil: [[-20, 530], [-20, 420], [40, 400], [90, 372], [130, 358], [170, 330], [205, 300], [240, 262], [270, 238], [300, 222], [330, 217], [362, 225], [392, 244], [420, 262], [452, 290], [478, 300], [505, 330], [540, 352], [575, 388], [610, 420], [650, 452], [690, 482], [722, 530]],
      firn: [[[118, 364], [168, 334], [214, 304], [256, 284], [300, 276], [336, 282], [352, 300], [346, 334], [322, 356], [282, 372], [236, 384], [186, 392], [140, 392]]],
      shade: [[[330, 217], [362, 225], [392, 244], [420, 262], [452, 290], [478, 300], [505, 330], [540, 352], [575, 388], [610, 420], [650, 452], [690, 482], [722, 530], [344, 530], [358, 450], [334, 380], [352, 300]]],
      rock: [[[362, 225], [392, 244], [404, 256], [384, 262], [366, 244]]], rinnen: [[396, 248, 78, 9, 0.22], [436, 272, 96, 11, 0.32], [482, 304, 84, 9, 0.42], [544, 358, 64, 8, 0.48], [600, 414, 44, 7, 0.5]],
      rockLit: [[[60, 410], [120, 398], [190, 404], [250, 398], [300, 392], [324, 398], [290, 410], [230, 416], [170, 420], [110, 424], [70, 426]], [[150, 452], [220, 444], [290, 446], [320, 452], [280, 462], [200, 466]]],
      crev: [[[176, 362], [222, 350]], [[240, 336], [292, 326]], [[204, 380], [254, 370]], [[296, 304], [330, 300]], [[270, 356], [312, 344]]] },
    { // Hahnen: Felsturm über dem Kloster
      sil: [[930, 530], [980, 470], [1010, 430], [1030, 380], [1045, 330], [1058, 296], [1072, 284], [1086, 296], [1100, 338], [1118, 372], [1150, 390], [1190, 402], [1240, 418], [1300, 438], [1300, 530]],
      firn: [[[1150, 396], [1190, 408], [1236, 424], [1200, 430], [1160, 420]]],
      shade: [[[1072, 284], [1086, 296], [1100, 338], [1118, 372], [1150, 390], [1190, 402], [1240, 418], [1300, 438], [1300, 530], [1058, 530], [1048, 440], [1066, 360]]],
      rock: [[[1072, 284], [1086, 296], [1100, 338], [1108, 372], [1094, 404], [1080, 378], [1070, 330]]], rinnen: [[1120, 374, 56, 9, 0.3], [1166, 394, 40, 8, 0.4], [1100, 410, 60, 7, 0.2]],
      rockLit: [[[1058, 296], [1066, 300], [1064, 338], [1054, 366], [1046, 334]], [[1030, 382], [1040, 386], [1036, 420], [1024, 446], [1022, 410]]],
      crev: [] },
  ];
  // Rinne: oben am Grat angesetzt, läuft in Falllinie spitz aus
  function streak(x, y, len, w, sl) {
    return [[x - w * 0.3, y], [x + w * 0.5, y + 2], [x + w * 0.55 + sl * len * 0.35, y + len * 0.4], [x + sl * len, y + len], [x - w * 0.45 + sl * len * 0.3, y + len * 0.45]];
  }
  function mountain(M, c) {
    fill(M.sil, c.lit);
    for (const f of M.firn) fill(f, c.firn);
    for (const p of M.rockLit) fill(p, c.rockLit);
    for (const l of M.crev) line(l, c.crev, 2);
    for (const s of M.shade) shade(s, c.shade);
    for (const p of M.rock) shade(p, c.rock);
    for (const q of (M.rinnen || [])) shade(streak(...q), c.rock);
  }
  function mountains() {
    for (const M of MOUNTS) mountain(M, M.far ? P.mFar : P.m);
    if (P.erd) {
      // Erdschatten mit welliger Oberkante, nur innerhalb der Bergflächen
      ctx.save();
      ctx.beginPath();
      for (const M of MOUNTS) { ctx.moveTo(M.sil[0][0], M.sil[0][1]); for (const q of M.sil) ctx.lineTo(q[0], q[1]); ctx.closePath(); }
      ctx.clip();
      ctx.beginPath(); ctx.moveTo(-20, 560);
      for (let x = -20; x <= W + 20; x += 40) ctx.lineTo(x, P.erd.y + Math.sin(x * 0.011) * 14 + Math.sin(x * 0.037) * 5 + (x > 900 ? 34 : 0));
      ctx.lineTo(W + 20, 560); ctx.closePath(); ctx.clip();
      for (const M of MOUNTS) mountain(M, P.erd);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- Fichte mit Schneelast: 0 schlank, 1 breit, 2 jung
  function spruce(x, yb, h, v) {
    const tiers = v === 1 ? 5 : v === 2 ? 3 : 4, wk = v === 1 ? 0.52 : v === 2 ? 0.5 : 0.38;
    const w = h * wk, top = yb - h, th = (h * 0.86) / tiers;
    const R = [[x, top]], tips = [];
    for (let i = 0; i < tiers; i++) {
      const yE = top + h * 0.06 + th * (i + 1), hw = (w / 2) * (0.34 + 0.66 * (i + 1) / tiers);
      R.push([x + hw, yE]); tips.push([hw, yE]);
      if (i < tiers - 1) R.push([x + hw * 0.4, yE - th * 0.32]);
    }
    const yL = R[R.length - 1][1];
    R.push([x + w * 0.05, yL], [x + w * 0.05, yb]);
    const L = R.slice(1).reverse().map((q) => [2 * x - q[0], q[1]]);
    fill(R.concat(L), P.treeD);
    fill(L.concat([[x, top]], [[x, yb]]).filter(Boolean), P.tree);
    // Schneehauben auf jeder Etage, Lichtseite links
    for (let i = 0; i < tiers; i++) {
      const [hw, yE] = tips[i];
      const a = i === 0 ? 0 : 0.42, ax = hw * a * 0.85, ay = yE - th * (1 - a * 0.7), t = th * 0.2;
      fill([[x - ax, ay - t * 0.6], [x - hw - 1, yE - 0.5], [x - hw * 0.72, yE - t * 1.2], [x - ax * 0.6, ay + t * 0.4]], P.tSnow);
      shade([[x + ax, ay - t * 0.6], [x + hw + 1, yE - 0.5], [x + hw * 0.72, yE - t * 1.2], [x + ax * 0.6, ay + t * 0.4]], P.tSnowD);
    }
  }
  function grove(list, castShadow) {
    if (castShadow) for (const [x, yb, h] of list) shade([[x, yb + 1], [x + h * 0.9, yb + 1 - h * 0.02], [x + h * 0.7, yb + h * 0.06], [x, yb + h * 0.05]], P.valleyShade);
    for (const [x, yb, h, v] of list.slice().sort((a, b) => a[1] - b[1])) spruce(x, yb, h, v);
  }

  // ---------------------------------------------------------------- Ortsbild: Chalets, Kloster, Grandhotel, Bahn
  function chalet(x, yb, w, h, k) {
    const d = w * 0.5, ox = d * 0.62, oy = d * 0.24, g = w * (k || 0.28);
    shade([[x + w, yb], [x + w + ox, yb - oy], [x + w + ox, yb - h - oy], [x + w, yb - h]], P.wallSide);
    fill([[x, yb], [x + w, yb], [x + w, yb - h], [x + w / 2, yb - h - g], [x, yb - h]], P.wall);
    // Dach: Fläche nach hinten, fast ganz verschneit, Traufe in Holz
    fill([[x + w / 2, yb - h - g], [x + w / 2 + ox, yb - h - g - oy], [x + w + ox + 2, yb - h - oy + 1.5], [x + w + 2, yb - h + 1.5]], P.roof);
    fill([[x + w / 2, yb - h - g - 1.2], [x + w / 2 + ox, yb - h - g - oy - 1.2], [x + w + ox, yb - h - oy - 1], [x + w, yb - h - 1]], P.roofSnow);
    line([[x - 2, yb - h + 2], [x + w / 2, yb - h - g], [x + w + 2, yb - h + 2]], P.roof, 1.8);
    line([[x - 1, yb - h + 0.6], [x + w / 2, yb - h - g - 1.4], [x + w + 1, yb - h + 0.6]], P.roofSnow, 1.2);
    // Balkon und Fenster
    line([[x, yb - h * 0.52], [x + w, yb - h * 0.52]], P.roof, 1.2);
    const fw = Math.max(1.6, w * 0.14), fh = Math.max(2, h * 0.2), n = w > 20 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const fx = x + (w / (n + 1)) * (i + 1) - fw / 2;
      rect(fx, yb - h * 0.86, fw, fh, i === 1 ? P.winHi : P.win);
      rect(fx, yb - h * 0.4, fw, fh, P.win);
    }
  }
  function abbey(x0, x1, yb, h) {
    // hinterer Flügel
    const bx0 = x0 + 30, bx1 = x1 - 20, by = yb - 16, bh = 22;
    fill([[bx0, by], [bx1, by], [bx1, by - bh], [bx1 - 10, by - bh - 12], [bx0 + 10, by - bh - 12], [bx0, by - bh]], P.wallSide);
    fill([[bx0 - 1, by - bh], [bx0 + 10, by - bh - 12], [bx1 - 10, by - bh - 12], [bx1 + 1, by - bh]], P.roofSnowD);
    // Hauptbau
    const ox = 22, oy = 8;
    shade([[x1, yb], [x1 + ox, yb - oy], [x1 + ox, yb - h - oy], [x1, yb - h]], P.wallSide);
    rect(x0, yb - h, x1 - x0, h, P.wall);
    fill([[x0 - 2, yb - h + 1], [x0 + 12, yb - h - 15], [x1 - 10, yb - h - 15], [x1 + 2, yb - h + 1]], P.roofSnow);
    shade([[x1 - 10, yb - h - 15], [x1 + ox - 8, yb - h - oy - 15], [x1 + ox + 2, yb - h - oy + 1], [x1 + 2, yb - h + 1]], P.roofSnowD);
    rect(x0 - 2, yb - h - 1, x1 - x0 + 4, 3, P.roof);
    for (let row = 0; row < 3; row++) for (let fx = x0 + 6; fx < x1 - 4; fx += 8.2)
      rect(fx, yb - h + 6 + row * 8.5, 2.8, 4.4, (row === 1 && Math.floor(fx) % 3 === 0) ? P.winHi : P.win);
    rect((x0 + x1) / 2 - 4, yb - 9, 8, 9, P.door);
    // Kirche: Giebel und Turm
    const cx0 = x0 - 38, cw = 40, ch = 40, cg = 20;
    fill([[cx0, yb], [cx0 + cw, yb], [cx0 + cw, yb - ch], [cx0 + cw / 2, yb - ch - cg], [cx0, yb - ch]], P.wall);
    line([[cx0 - 2, yb - ch + 2], [cx0 + cw / 2, yb - ch - cg], [cx0 + cw + 2, yb - ch + 2]], P.roof, 2.4);
    line([[cx0 - 1, yb - ch], [cx0 + cw / 2, yb - ch - cg - 1.6], [cx0 + cw + 1, yb - ch]], P.roofSnow, 1.4);
    rect(cx0 + cw / 2 - 4, yb - 30, 8, 16, P.win);
    rect(cx0 + cw / 2 - 3, yb - 9, 6, 9, P.door);
    const tx = cx0 + 4, tw = 15, tb = yb - ch - 2, tt = tb - 56;
    rect(tx, tt, tw, tb - tt, P.wall);
    shade([[tx + tw, tb], [tx + tw + 6, tb - 3], [tx + tw + 6, tt - 3], [tx + tw, tt]], P.wallSide);
    rect(tx + 4, tt + 8, 7, 10, P.win);
    dot(tx + tw / 2, tt + 28, 3.2, P.roof);
    // Zwiebelhaube mit Laterne
    const c = tx + tw / 2 + 2;
    const bulb = [[c - 11, tt], [c - 12, tt - 7], [c - 7, tt - 14], [c - 2, tt - 18], [c - 2, tt - 23], [c + 2, tt - 23], [c + 2, tt - 18], [c + 7, tt - 14], [c + 12, tt - 7], [c + 11, tt]];
    fill(bulb, P.roof);
    shade([[c, tt - 18], [c + 2, tt - 18], [c + 7, tt - 14], [c + 12, tt - 7], [c + 11, tt], [c, tt]], mix(P.roof, I.tinte, 0.25));
    fill([[c - 11, tt - 1], [c - 12, tt - 7], [c - 7, tt - 13], [c - 4, tt - 10], [c - 8, tt - 4]], P.roofSnow);
    line([[c, tt - 23], [c, tt - 36]], P.line, 1.4);
    line([[c - 3.5, tt - 32], [c + 3.5, tt - 32]], P.line, 1.4);
  }
  function hotel(x, yb, w, h) {
    const ox = 18, oy = 7;
    shade([[x + w, yb], [x + w + ox, yb - oy], [x + w + ox, yb - h - oy], [x + w, yb - h]], P.wallSide);
    rect(x, yb - h, w, h, P.wall);
    // Mansarddach: steiler Unterteil in Holz, Gaupen, verschneite Kappe
    fill([[x - 2, yb - h], [x + 4, yb - h - 13], [x + w - 4, yb - h - 13], [x + w + 2, yb - h]], P.roof);
    shade([[x + w + 2, yb - h], [x + w - 4, yb - h - 13], [x + w + ox - 6, yb - h - oy - 13], [x + w + ox + 1, yb - h - oy]], mix(P.roof, I.tinte, 0.2));
    fill([[x + 4, yb - h - 13], [x + 9, yb - h - 18], [x + w - 9, yb - h - 18], [x + w - 4, yb - h - 13]], P.roofSnow);
    fill([[x + w - 4, yb - h - 13], [x + w - 9, yb - h - 18], [x + w + ox - 12, yb - h - oy - 18], [x + w + ox - 6, yb - h - oy - 13]], P.roofSnowD);
    for (let i = 0; i < 6; i++) { const dx = x + 8 + i * ((w - 16) / 5) - 2.5; rect(dx, yb - h - 11, 5, 7, P.roofSnow); rect(dx + 1.3, yb - h - 9, 2.4, 4, P.win); }
    rect(x, yb - h + 3, w, 3, P.red); // Schriftband
    for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++)
      rect(x + 5 + i * ((w - 10) / 8.6), yb - h + 10 + row * 9, 3.2, 5.2, (row + i) % 5 === 2 ? P.winHi : P.win);
    rect(x + w / 2 - 5, yb - 8, 10, 8, P.door);
    // Fahnenmast
    const fx = x + w / 2;
    line([[fx, yb - h - 18], [fx, yb - h - 44]], P.line, 1.3);
    fill([[fx, yb - h - 44], [fx + 14, yb - h - 43], [fx + 13, yb - h - 35], [fx, yb - h - 36]], P.red);
    rect(fx + 5.6, yb - h - 42.4, 1.8, 5.4, P.wall); rect(fx + 3.8, yb - h - 40.6, 5.4, 1.8, P.wall);
  }
  function train(x, yb) {
    line([[x - 160, yb + 1], [x + 300, yb + 1]], P.line, 1.2);
    for (let i = 0; i < 2; i++) {
      const cx = x + i * 37;
      rect(cx, yb - 12, 34, 10, P.roof);
      rect(cx - 1, yb - 14, 36, 2.4, P.roofSnow);
      for (let k = 0; k < 5; k++) rect(cx + 3 + k * 6.2, yb - 9.5, 3.4, 3.6, P.winHi);
    }
    const lx = x + 76;
    rect(lx, yb - 15, 11, 13, P.loco); rect(lx - 0.5, yb - 16.5, 12, 2, P.roofSnow);
    rect(lx + 11, yb - 11, 24, 9, P.loco);
    rect(lx + 29, yb - 17, 3.4, 6, P.loco);
    rect(lx + 33, yb - 5, 3, 3, P.red);
    for (const wx of [x + 6, x + 28, x + 43, x + 65, lx + 4, lx + 16, lx + 26]) dot(wx, yb - 1.4, 2.1, P.line);
    // Rauchfahne zieht nach links oben
    const sx = lx + 30.7, sy = yb - 18;
    const puffs = [];
    for (let i = 0; i < 10; i++) puffs.push([sx - 7 * i - i * i * 0.45, sy - 6.5 * i + i * i * 0.2, 2.8 + i * 1.05]);
    for (const [px, py, rr] of puffs) dot(px + 0.8, py + rr * 0.3, rr, P.smokeD);
    for (const [px, py, rr] of puffs) dot(px, py - rr * 0.08, rr * 0.92, P.smoke);
  }
  function chimneySmoke(x, y) {
    for (let i = 4; i >= 0; i--) { const px = x - 3 * i - i * i * 0.5, py = y - 6 * i; dot(px + 0.6, py + 0.8, 1.6 + i * 0.9, P.smokeD); dot(px, py, 1.6 + i * 0.9, P.smoke); }
  }

  function valley() {
    fill([[-20, 534], [200, 530], [520, 536], [800, 530], [1050, 534], [1300, 530], [1300, 820], [-20, 820]], P.valley);
    // Waldsaum: Zackenkante aus kleinen Fichten, Lichtspitzen in Blau
    const pts = [[-20, 560]];
    let x = -20;
    while (x < W + 20) {
      const h = 10 + r() * 18 + (Math.sin(x * 0.01) + 1) * 6, w = 6 + r() * 6;
      pts.push([x, 534 - (r() * 4)], [x + w / 2, 534 - h], [x + w, 534 - r() * 4]);
      x += w * (0.7 + r() * 0.4);
    }
    pts.push([W + 20, 560]);
    fill(pts, P.farForest);
    fill([[-20, 556], [300, 552], [700, 558], [1000, 552], [1300, 556], [1300, 548], [-20, 546]], P.farForest);
    // Schatten des Waldsaums auf dem Talboden
    shade([[-20, 556], [260, 552], [520, 560], [760, 554], [1000, 560], [1300, 554], [1300, 568], [1000, 574], [720, 566], [460, 574], [200, 566], [-20, 572]], P.valleyShade);
  }

  function town() {
    grove([[684, 606, 30, 0], [700, 610, 22, 2], [722, 604, 36, 1], [744, 608, 26, 0], [662, 600, 24, 0]], true);
    grove([[868, 588, 22, 0], [880, 591, 16, 2]], false);
    hotel(786, 598, 76, 50);
    // hintere Reihe
    for (const [x, yb, w, h] of [[896, 590, 18, 14], [1138, 590, 20, 15], [1166, 588, 16, 12], [1190, 586, 22, 15], [1222, 590, 16, 12]]) chalet(x, yb, w, h);
    abbey(934, 1118, 606, 31);
    // vordere Reihen um den Platz
    for (const [x, yb, w, h] of [[852, 626, 18, 13], [878, 624, 22, 16], [905, 627, 18, 14], [958, 628, 24, 17], [992, 626, 18, 13], [1040, 628, 26, 18], [1080, 626, 18, 13], [1112, 630, 24, 17], [1148, 628, 18, 14], [1178, 630, 22, 16], [1212, 626, 18, 13]]) chalet(x, yb, w, h);
    for (const [x, yb, w, h] of [[928, 650, 26, 18], [1000, 652, 22, 15], [1064, 652, 28, 19], [1124, 654, 20, 14]]) chalet(x, yb, w, h);
    for (const [x, y] of [[884, 600], [1052, 602], [1186, 604], [1074, 626]]) chimneySmoke(x, y);
    grove([[1238, 602, 38, 0], [1256, 606, 30, 1], [1276, 598, 44, 0]], true);
    train(660, 652);
  }

  function near() {
    fill([[880, 820], [960, 744], [1060, 718], [1170, 700], [1300, 688], [1300, 820]], P.valley);
    shade([[960, 744], [1060, 718], [1170, 700], [1300, 688], [1300, 700], [1180, 712], [1070, 730], [980, 752]], P.valleyShade);
    grove([[1196, 764, 150, 0], [1240, 776, 188, 1], [1282, 752, 138, 0], [1158, 786, 104, 2]], true);
    grove([[968, 790, 92, 1], [1004, 800, 68, 2], [938, 806, 58, 0]], true);
  }

  // ---------------------------------------------------------------- Aufsprunghang: größte Fläche, in Zonen gegliedert
  const prof = (x) => 342 + 0.47 * x + 0.00003 * x * x;
  function hill() {
    const X0 = -20, X1 = 980, step = 20;
    const body = []; for (let x = X0; x <= X1; x += step) body.push([x, prof(x)]);
    const poly = body.concat([[X1, 830], [X0, 830]]);
    ctx.save(); path(poly); ctx.clip();
    const zone = (d, a, f, ph) => (x) => prof(x) + d + Math.sin(x * f + ph) * a + Math.sin(x * f * 2.7 + ph) * a * 0.35;
    const zs = [null, zone(112, 14, 0.009, 1), zone(214, 18, 0.007, 3), zone(320, 22, 0.006, 5)];
    rect(-40, 0, 1100, 900, P.hill[3]);
    for (let k = 2; k >= 0; k--) {
      const f = zs[k + 1], pts = [];
      for (let x = X0 - 20; x <= X1 + 20; x += 12) pts.push([x, f(x)]);
      const zp = body.concat(pts.reverse());
      (k === 0 ? fill : shade)(zp, P.hill[k]);
    }
    for (let k = 1; k <= 3; k++) spray(zs[k], P.hill[k - 1], P.hill[k], X0, X1, 1800, 26);
    // Muldenschatten als lange Linsen, parallel zum Hang
    const ang = Math.atan(0.47);
    for (const [x, d, L, t] of [[120, 62, 200, 8], [390, 78, 260, 10], [660, 52, 180, 7], [250, 170, 220, 12], [560, 176, 240, 13], [100, 276, 200, 12]]) {
      ctx.save(); ctx.translate(x + OFF[0], prof(x) + d + OFF[1]); ctx.rotate(ang);
      ctx.beginPath(); ctx.ellipse(0, 0, L / 2, t / 2, 0, 0, 6.2832); ctx.fillStyle = d < 112 ? P.mulde : P.hill[d < 214 ? 2 : 3]; ctx.fill();
      ctx.restore();
    }
    // Spuren
    for (const [d, a, b] of [[44, 40, 300], [52, 360, 620], [112, 80, 260], [120, 460, 760], [36, 700, 900]]) {
      const pts = []; for (let x = a; x <= b; x += 20) pts.push([x, prof(x) + d + Math.sin(x * 0.02) * 2]);
      line(pts, P.mulde, 1.6);
    }
    // Kantenschatten: schmale blaue Zone direkt unter der Lippe
    const kb = []; for (let x = X0; x <= X1; x += step) kb.push([x, prof(x) + 7]);
    const ke = []; for (let x = X1; x >= X0; x -= step) ke.push([x, prof(x) + 17 + Math.sin(x * 0.03) * 2]);
    shade(kb.concat(ke), P.kante);
    if (P.lip) { const lb = []; for (let x = X1; x >= X0; x -= step) lb.push([x, prof(x) + 6]); fill(body.concat(lb), P.lip); }
    ctx.restore();
    // Hangkante als klare Linie
    line(body, P.key, 2.6);
    // Weitenmarken, rote K-Marke
    for (let x = 230; x <= 900; x += 95) {
      const y = prof(x), n = [-0.43, 0.9];
      line([[x, y], [x + n[0] * 16, y + n[1] * 16]], x === 800 ? P.red : P.key, x === 800 ? 4 : 2);
    }
  }

  // ---------------------------------------------------------------- Spielebene (bleibt wie im Spiel)
  function cable() {
    const a = [586, 548], b = [300, 330];
    line([a, b], P.line, 1.2);
    rect(b[0] - 5, b[1] - 6, 10, 7, P.line);
    rect(a[0] - 6, a[1] - 8, 12, 8, P.line);
    const t = 0.38, cx = a[0] + (b[0] - a[0]) * t, cy = a[1] + (b[1] - a[1]) * t;
    line([[cx, cy], [cx, cy + 6]], P.line, 1);
    rect(cx - 4.5, cy + 6, 9, 7, P.red);
  }
  function idealLine() {
    ctx.save(); ctx.lineCap = "round"; ctx.setLineDash([16, 11]);
    ctx.beginPath(); ctx.moveTo(-10, 110); ctx.quadraticCurveTo(500, 300, 1290, 760);
    ctx.strokeStyle = I.tinte; ctx.lineWidth = 5.5; ctx.stroke();
    ctx.strokeStyle = I.ocker; ctx.lineWidth = 2.8; ctx.stroke();
    ctx.restore();
  }
  function windFlag() {
    const x = 150, y = prof(x);
    line([[x, y], [x, y - 62]], I.tinte, 2.4);
    fill([[x, y - 60], [x + 38, y - 55], [x + 35, y - 41], [x, y - 45]], I.gruen);
  }
  function jumperShadow() {
    ctx.save(); ctx.translate(486, prof(486) + 3); ctx.rotate(Math.atan(0.47 + 0.00006 * 486));
    ctx.beginPath(); ctx.ellipse(0, 0, 62, 5.5, 0, 0, 6.2832); ctx.fillStyle = P.hillShadow; ctx.fill(); ctx.restore();
  }
  // Pose „flight“ aus dem Spiel (27 Einheiten = 1 m)
  const POSE = {
    sf: [[-24.7, 6.3], [44.5, -4.7]], sn: [[-23.9, 5.7], [45.8, -1.6]],
    ab: [-0.8, -0.6], kb: [10.2, -5.5], af: [0, 0], kf: [11.0, -4.9],
    hip: [21.9, -9.8], sh: [37.7, -12.3], head: [43.9, -12.8],
    eb: [29.2, -11.2], hb: [20.4, -9.6], ef: [28.9, -10.5], hf: [20.1, -8.5],
  };
  function jumper(kontur) {
    const ox = 404, oy = 276, s = 2.6, a = -0.3, ca = Math.cos(a), sa = Math.sin(a);
    const lift = -0.13, cl = Math.cos(lift), sl = Math.sin(lift);
    const T = (p, body) => {
      let x = p[0], y = p[1];
      if (body) { const nx = x * cl - y * sl, ny = x * sl + y * cl; x = nx; y = ny; }
      return [ox + (x * ca - y * sa) * s, oy + (x * sa + y * ca) * s];
    };
    const Y = "#F2C230", YD = "#C99A22", K = I.tinte;
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    const limb = (pts, w, c) => {
      const q = pts.map((k) => T(POSE[k], k !== "ab" && k !== "af"));
      if (kontur) line(q, K, w * s + 4.4);
      line(q, c, w * s);
    };
    const ski = (k, c) => { const q = POSE[k].map((p) => T(p)); line(q, c, 2.3 * s + (kontur ? 1.2 : 0)); };
    ski("sf", mix(I.tinte, I.tief, 0.45));
    limb(["sh", "eb", "hb"], 2.4, YD);
    limb(["ab", "kb", "hip"], 4.4, YD);
    limb(["hip", "sh"], 6.4, Y);
    const hd = T(POSE.head, true);
    if (kontur) dot(hd[0], hd[1], 3.6 * s + 2.2, K);
    dot(hd[0], hd[1], 3.6 * s, Y);
    limb(["af", "kf", "hip"], 4.4, Y);
    limb(["sh", "ef", "hf"], 2.4, Y);
    ski("sn", K);
    ctx.restore();
  }

  // ---------------------------------------------------------------- Druckanmutung: Kreide- und Spritzkorn als runde Punkte
  function grain(korn, onHill) {
    if (korn <= 0) return;
    const g = document.createElement("canvas"); g.width = g.height = 440;
    const gc = g.getContext("2d"), rr = rng(77);
    for (let i = 0; i < 2600; i++) { gc.globalAlpha = 0.25 + rr() * 0.5; gc.fillStyle = P.chalk; gc.beginPath(); gc.arc(rr() * 440, rr() * 440, 0.6 + rr() * 1.3, 0, 6.2832); gc.fill(); }
    for (let i = 0; i < 1500; i++) { gc.globalAlpha = 0.12 + rr() * 0.3; gc.fillStyle = P.spray; gc.beginPath(); gc.arc(rr() * 440, rr() * 440, 0.5 + rr() * 0.9, 0, 6.2832); gc.fill(); }
    const pat = ctx.createPattern(g, "repeat");
    if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(0.5));
    ctx.save(); ctx.globalAlpha = Math.min(1, korn * 0.55); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
    if (onHill === false) { ctx.restore(); return; }
    // stärker auf dem Hang
    ctx.beginPath(); ctx.moveTo(-20, prof(-20)); for (let x = -20; x <= 980; x += 20) ctx.lineTo(x, prof(x)); ctx.lineTo(980, 830); ctx.lineTo(-20, 830); ctx.closePath(); ctx.clip();
    ctx.globalAlpha = Math.min(1, korn * 0.6); ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function draw(c, opts) {
    const o = Object.assign({ variant: "sonne", korn: 0.4, passer: true, kontur: true, spiel: true }, opts || {});
    ctx = c; P = PAL[o.variant] || PAL.sonne; OFF = o.passer ? [1.3, 0.7] : [0, 0]; r = rng(1928);
    ctx.save(); ctx.lineJoin = "round";
    sky();
    mountains();
    cable();
    valley();
    town();
    near();
    hill();
    grain(o.korn);
    if (o.spiel) { idealLine(); windFlag(); jumperShadow(); jumper(o.kontur); }
    ctx.restore();
  }

  // Wald-Tafel fürs Stilblatt (900 × 300): drei Silhouetten einzeln, dann als Gruppe
  function fichten(c, opts) {
    const o = Object.assign({ variant: "sonne", korn: 0.4, passer: true }, opts || {});
    ctx = c; P = PAL[o.variant] || PAL.sonne; OFF = o.passer ? [1.3, 0.7] : [0, 0]; r = rng(7);
    ctx.save(); ctx.lineJoin = "round";
    rect(0, 0, 900, 300, P.sky[4]);
    rect(0, 0, 900, 90, P.sky[3]);
    spray(() => 90, P.sky[3], P.sky[4], 0, 900, 900, 24);
    fill([[0, 258], [300, 252], [600, 258], [900, 250], [900, 300], [0, 300]], P.valley);
    spruce(110, 270, 200, 0);
    spruce(290, 272, 196, 1);
    spruce(450, 274, 132, 2);
    grove([[620, 276, 150, 0], [664, 284, 112, 1], [706, 270, 196, 0], [752, 286, 96, 2], [800, 278, 160, 1], [846, 284, 120, 0]], true);
    for (const [x, h] of [[110, 200], [290, 196], [450, 132]]) shade([[x, 272], [x + h * 0.9, 271], [x + h * 0.7, 272 + h * 0.06], [x, 272 + h * 0.05]], P.valleyShade);
    spruce(110, 270, 200, 0); spruce(290, 272, 196, 1); spruce(450, 274, 132, 2);
    grainRect(o.korn, 900, 300);
    ctx.restore();
  }
  function grainRect(korn, w, h) {
    if (korn <= 0) return;
    const g = document.createElement("canvas"); g.width = g.height = 440;
    const gc = g.getContext("2d"), rr = rng(77);
    for (let i = 0; i < 2600; i++) { gc.globalAlpha = 0.25 + rr() * 0.5; gc.fillStyle = P.chalk; gc.beginPath(); gc.arc(rr() * 440, rr() * 440, 0.6 + rr() * 1.3, 0, 6.2832); gc.fill(); }
    for (let i = 0; i < 1500; i++) { gc.globalAlpha = 0.12 + rr() * 0.3; gc.fillStyle = P.spray; gc.beginPath(); gc.arc(rr() * 440, rr() * 440, 0.5 + rr() * 0.9, 0, 6.2832); gc.fill(); }
    const pat = ctx.createPattern(g, "repeat");
    if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(0.5));
    ctx.save(); ctx.globalAlpha = Math.min(1, korn * 0.55); ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); ctx.restore();
  }

  window.TelemarkPlakat = { draw, fichten, PAL, INK, INKS, mix, W, H };
})();
