# TELEMARK · Umsetzung Plakat 1928

Übergabe an Claude Code. Diese Notiz beschreibt, wie die Entwürfe in `index.html` kommen.
Quelle der Formen und Farben ist `telemark-orte.js` (Referenz-Renderer). Er läuft im Entwurf schon mit allen zehn Orten. Für die Zahlen gilt `TELEMARK Stilblatt.dc.html`.

## Entscheidungen

- **Lichtstimmungen:** `morning` und `afternoon` werden zu **Plakatsonne** (`PAL.sonne`), `evening` wird zu **Alpenglühen** (`PAL.gluehen`). Am Abend bleiben Flutlicht-Laternen und Lichtkegel als Akzent, der Mond ebenfalls. Die Sterne entfallen. `HILL_TOD` bleibt wie es ist.
- **Ankunft:** läuft beim ersten Besuch eines Orts je Gerät (`localStorage` `telemark-ankunft-v1`, Liste der gesehenen Orte) und lässt sich mit Tippen überspringen. Sie fällt in die Phase „Warte auf Grün“: Die Ampel bleibt bis zum Ende der Ankunft rot, höchstens 6,2 s. Ab dem zweiten Besuch ändert sich am Ablauf nichts.
- **Schrift:** Jost und Oswald (OFL) liegen selbst gehostet in `fonts/`. Jost nur für das Schriftband der Ankunft und später für Titelplakat und Teilen-Bild (Punkt H). Oswald als Ersatz dort, wo Futura fehlt (`--font-display`, `COND`). Alle übrigen Texte, die HUD-Tafeln und die Mechanik bleiben unverändert.

## Koordinaten

Der Entwurf zeichnet in 1280 × 800 px, die Oberkante des Talbodens liegt bei y = 534. Die Panorama-Ebenen im Spiel haben ihren Ursprung in der Mitte am Horizont, y zeigt nach unten, 390 Einheiten entsprechen der Bildhöhe.

```
c = (x − 640) × 0.4875        // waagrecht, Mitte = 0
v = (y − 534) × 0.4875        // senkrecht, negativ = über dem Horizont
```

- **Breite:** Die Ebenen sind breiter als der Bildschirm (`wl = wv + 470·par + 60`). Am Handy quer (844 × 390) braucht die ferne Ebene ±471 Einheiten, die mittlere ±521, die nahe ±560. Die Grate im Entwurf reichen nur über das 16:10-Bild. Darum Kontrollpunkte links und rechts mit flacheren Ausläufern bis ±600 ergänzen, ohne neue Hauptgipfel.
- **Seilbahnen:** Sie hängen an den Bergen und gehören deshalb in die ferne Ebene (Ebene 0), wie `live.cable` heute. Im Entwurf liegen sie in der mittleren Ebene.
- **Höhen der Ebenen:**
  - Die höchsten Gipfel liegen bei v ≈ −156 (Innsbruck, Garmisch). `far.top = 205` reicht.
  - `mid.top = 125` reicht für Türme und Fahnenmasten.
  - `near.top` auf 40 anheben, weil die nahen Fichten über den Horizont ragen.

## SCENES

Pro Ort entfallen `far.col`, `far.snow`, `far.jag` und `far.peaks`. Neu kommen hinzu (Werte aus `ORTE` in `telemark-orte.js`, umgerechnet nach c/v):

| Schlüssel | Inhalt |
|---|---|
| `ranges[]` | Bergketten von hinten nach vorn: `ctrl` (Kontrollpunkte, `"S"` = Gipfel mit Grat, `"V"` = Scharte mit Rinne), `style` (`alpin`, `dolomit`, `huegel`), `rough`, `rocky`, `detail`, `tree` (Waldgrenze), `firn`, `wall` (Felsgürtel), `pisten`, `far` |
| `far` | Wahrzeichen am Berg: `tower`, `skywalk`, `cross`, `drift` (Schneefahnen) |
| `mid` | Tal: `viaduct`, `train`, `cables`, `funicular`, `ferry`, `sleigh`, `river`, `city`, `kozolci`, `hamlet`, `groves` |
| `town[]` | Ortskern: `house` (`chalet`, `fachwerk`, `goral`, `nordisch`, `italien`, `bayern`), `cx`, `w`, `y0`, `y1`, `dens`, `churches[]` (`spire`, `onion`, `campanile`, `twin`, `wood`, `stave`), `extra[]` (`abbey`, `hotel`), `skip` |
| `flags[]` | Fahnen an der Schanze `[x, y, Mast, b, h, Land]` |
| `fjord` | nur Holmenkollen: Wasserband und Inseln |

Weiter verwendet werden: `moon`, die Stationen der Nordkette als Positionen für `cables`, Fähre und Kreuz. `ARCH` bleibt unverändert.

## ATMO, TOD, LAYERS

- **`ATMO`** schrumpft auf `{ snow }` je Ort. `sky`, `day` und `glow` entfallen, weil der Himmel aus der gemeinsamen Palette kommt. Den Lichtschein von Innsbruck übernehmen am Abend die warmen Stadtfenster.
- **`TOD`:**
  - `morning` und `afternoon` bekommen die Werte aus `PAL.sonne`, `evening` die aus `PAL.gluehen`.
  - Bestehende Schlüssel zuordnen: `skyTop`/`skyMid`/`skyLow` → `sky[0]`/`sky[2]`/`sky[4]`, `forest` → `forest`, `ground` → `valley`, `snow` → `hill[0]`, `snowBody` → `hill[3]`.
  - `strips` und `buildStrips` entfallen.
  - Beim Abend `stars: false`, `flood: true` bleibt.
- **`LAYERS`:** `par` bleibt 0,08 / 0,22 / 0,5. Nur `near.top` von 12 auf 40.

## Neue Zeichenfunktionen

Alle aus `telemark-orte.js`, unverändert übernehmbar. Die Farben liest der Code aus `P`, der aktiven Palette.

- **Berge:**
  - `ridge` (Gratlinie durch Mittelpunktverschiebung, fester Seed je Ort)
  - `fall2`, `taper` (Grate, Rippen, Rinnen, Fels)
  - `buildRange` (Geometrie einmal je Ort)
  - `paintRange(G, "lit" | "erd")`
  - `erdLine` (Schattengrenze am Abend)
- **Himmel:** fünf Stufen mit `spray` an den Kanten. Einmal in eine Canvas der Panorama-Ebene zeichnen; heute wird der Verlauf in jedem Bild neu gezeichnet.
- **Wald:** `spruce(x, yb, h, v)` mit drei Formen, `grove`, `forestBand`.
- **Ort:**
  - `house` mit `preset`, `church`, `tower`, `onion`, `stave`, `abbey`, `hotel`, `block`, `cluster`, `town`, `city`
  - `viaduct`, `skywalk`, `latticeTower`, `kozolec`, `station`, `river`, `valleyDetail`
- **Hang:** `hillLayer` ersetzt die Schneestreifen in `Renderer.slope()`. Die Zonengrenzen liegen 112, 214 und 320 Entwurfs-px unter dem Profil, im Spiel also `d × 0.4875 × k` Bildschirm-px, nicht in Metern. Hangkante 2,6 px, Kantenschatten, Mulden und Spuren wie im Entwurf.
- **Korn:** eine Kachel aus `grainPattern`, Deckkraft `korn × 0.55`, Standard 0,4. Ersetzt das Rauschen in `paper()`. Die Vignette entfällt.
- **Springer:** In `jumper()` jede Gliedmaße zuerst in Tinte zeichnen, um 4,4 px breiter, dann in Gelb darüber. Der Kopf bekommt einen Ring von 2,2 px.

**Entfällt:**
- `skyline()` mit `jag` und dem Rauschen
- das Rauschen in `drawWall`
- Nadelkegel (Gipfel mit p < 1)
- `SNOW_STRIPS`
- die Vignette in `paper()`

## Bewegte Details

Ein neuer Haken in `drawPanorama`: `live.anim[i]` je Ebene, eine Liste von Funktionen `fn(t)` in Ebenen-Einheiten. Nach `ctx.drawImage(L.cv, …)` ausführen:

```js
ctx.save(); ctx.translate(pos[i].ox, pos[i].oy); ctx.scale(k, k);
for (const a of live.anim[i]) a(t);
ctx.restore();
```

| Funktion | Ebene | Orte |
|---|---|---|
| `driftAnim` Schneefahne | 0 | Engelberg, Oberstdorf, Garmisch, Innsbruck, Bischofshofen, Planica |
| `cabinAnim` Seilbahn | 0 | Engelberg, Oberstdorf, Garmisch, Innsbruck |
| `smokeAnim` Kaminrauch | 1 | alle |
| `trainAnim` Zug | 1 | Willingen (Viadukt), Engelberg, Bischofshofen |
| `funicularAnim` | 1 | Innsbruck (Hungerburg), Zakopane (Gubałówka) |
| `ferryAnim` | 1 | Holmenkollen |
| `sleighAnim` | 1 | Zakopane |
| `flagAnim` | 2 | alle |

`live.cable`, `live.ferry` und das rote Blinken bleiben als Fallback, bis alle Orte umgestellt sind. Der Schneefall nutzt weiter `RM.Snow` mit `ATMO.snow`, die Flocken in `P.chalk`.

## Ankunft

`frame()` in `telemark-orte.js` zeigt den Ablauf. Im Spiel wirkt er nur auf die Zeichnung, nie auf Physik oder Kamera:

| Zeit | Was passiert |
|---|---|
| 0–3,4 s | Zoom 1,07 → 1 um die Bildmitte |
| 0–1,6 s / 0,35–1,85 s / 0,8–2,2 s | fern, mittel und nah fahren von unten ein (90 / 70 / 180 Entwurfs-px); der Hang zusätzlich von links |
| 1,0–3,4 s | Licht: früh und nachmittags wandert die Lichtgrenze von oben bis zum Talboden (`shift` −260 → 560); abends steigt der Erdschatten (`shift` 560 → 0), bis nur die Gipfel glühen |
| 2,2–5,8 s | Schriftband: läuft links ein, steht, läuft rechts hinaus. Fahne, Ortsname in Jost 700 Versalien, darunter Land · Schanze |
| ab 5,8 s | Spielebene (Ideallinie, Fahne, Springer) blendet ein |

Am Abend braucht die Ankunft beide Fassungen der fernen Ebene (`farLit` und `farErd`). Die zweite wird nur für den Abend gebaut.

## Leistung

- Statische Ebenen werden wie heute einmal je Ort × Tageszeit × Bildschirmgröße gebaut (`buildPanorama`). Ziel: unter 120 ms auf einem Mittelklasse-Handy. Die meiste Zeit kosten die Spritzpunkte. Bei Bedarf `spray`-Anzahl mit `res` skalieren.
- Je Bild nur Ebenen kopieren plus etwa 300 Kreise für alle Animationen. Ziel: 60 fps.
- `res = min(2, dpr) × k` wie heute.

## Reihenfolge

Nach jedem Schritt am Handy testen und committen.

1. Palette und `TOD` umstellen, Himmel in Stufen und gecacht, Korn ersetzen. Alle Orte laufen weiter mit alten Bergen.
2. **Engelberg** vollständig: `ranges`, Ort, Wald, Hang, Springer-Kontur.
3. Animations-Haken `live.anim` mit Engelberg (Schneefahnen, Titlisbahn, Zug, Rauch, Fahnen).
4. Die übrigen neun Orte einzeln, in dieser Reihenfolge: Willingen, Innsbruck, Holmenkollen, Zakopane, Oberstdorf, Garmisch, Bischofshofen, Predazzo, Planica.
5. Ankunft mit Speicher, Überspringen und roter Ampel.
6. Schriften: `@font-face` für Jost und Oswald, Oswald in `--font-display` und `COND` nach Futura.
7. Aufräumen: alte Funktionen entfernen, `version.txt` erhöhen, damit `sw.js` neu lädt.

## Prüfliste je Ort

- [ ] Gelber Springer vor jedem Hintergrund klar lesbar
- [ ] Hangkante, Weitenmarken und Ideallinie eindeutig
- [ ] Keine Nadelkegel, kein Pixelrauschen, kein #FFFFFF oder #000000
- [ ] Höchstens 10 Druckfarben in der Szene
- [ ] Wahrzeichen und Hausform erkennbar (siehe `info` je Ort)
- [ ] Bau der Ebenen unter 120 ms, 60 fps im Flug
- [ ] Ankunft läuft einmal, Tippen überspringt, zweiter Besuch ohne Ankunft

## Prompt für Claude Code

> Setze die Plakat-Landschaft aus `UMSETZUNG.md` in `index.html` um. Referenz für Formen, Farben und Animationen ist `telemark-orte.js`, Zahlen stehen im Stilblatt. Spielmechanik, Kamera, HUD-Tafeln und Texte bleiben unverändert. Arbeite die Reihenfolge Schritt für Schritt ab, beginne mit Schritt 1 und 2 (Engelberg). Halte nach jedem Schritt an, damit ich am Handy teste.
