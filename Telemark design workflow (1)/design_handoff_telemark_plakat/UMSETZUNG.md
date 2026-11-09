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

## Tiefe (leichter 3D-Effekt)

Die Ebenen bleiben flach. Die Tiefe entsteht nur daraus, dass sie sich unterschiedlich stark bewegen. Tiefenfaktor f je Ebene: Himmel 0,02 · fern 0,08 · mittel 0,22 · nah 0,5 · Hang und Spielebene 0,85.

- **Im Sprung:** Die Kamera bewegt sich ohnehin und erzeugt so schon Parallaxe. Zusätzlich fällt der Schnee in drei Tiefen, jeweils zwischen den Ebenen: klein und langsam hinter dem Ort, mittel vor dem Wald, groß und schnell vor dem Hang (Größe × 0,6 / 1 / 1,75, Tempo × 0,55 / 1 / 1,5). Mechanik und Kamera bleiben unverändert, kein Neigen während des Sprungs.
- **Ankunft als Dolly:** Zoom je Ebene `1 + 0.07 · (1 − e) · (0.2 + 1.6 · f)`. Nahe Ebenen fahren stärker heran als ferne.
- **Menü und Titelplakat:** Das Bild folgt dem Neigen des Handys (`deviceorientation`; iOS fragt beim ersten Tippen um Erlaubnis), am Computer der Maus. Verschiebung je Ebene `−cam.x · f · 40` und `−cam.y · f · 22` Entwurfs-px, geglättet mit 6 % je Bild. Dazu 5,5 % Überzoom, damit keine Ränder sichtbar werden. Ohne Eingabe schwenkt das Bild langsam von selbst.

Referenz: `frame()` in `telemark-orte.js` (Optionen `tiefe`, `cam`).

### Tiefe ohne Bewegung

| Mittel | Umsetzung | Funktion |
|---|---|---|
| Luftperspektive | Zwei zusätzliche Ketten hinter dem Hausberg, je Ort per Seed erzeugt. Kette 2 ist 70 % zum Horizontton gemischt, Kette 1 42 %, nur Licht- und Schattenfläche. Bei Hügel-Orten liegen sie niedriger (y 418–462). | `hazeRanges`, `paintHaze` (vor den Hauptketten in die ferne Ebene) |
| Talnebel | Zwei Nebelbänder aus je vier Linsen, Vollton mit dunklerer Unterkante. Eines am Bergfuß (y 524, Höhe 17, 7 px/s), eines vor dem Ort (y 662, Höhe 12, 11 px/s). Bei Holmenkollen über dem Fjord. | `mistAnim` (in `live.anim[0]` und `[1]`) |
| Wolkenschatten | Nur bei Plakatsonne. Drei Flecken wandern über die Berge (9–14 px/s, Tiefschatten mit 24 % Deckkraft, auf die Bergflächen begrenzt), zwei schneller über den Hang (26–34 px/s, 14 %). | `clouds()` in `frame`, `S.mtnClip`, `S.hillClip` |
| Vordergrund | Zwei angeschnittene Fichtenzweige oben rechts, Bande „FIRNGOLD Skiwachs“ (erfunden) unten rechts. Tiefenfaktor 1,15, zieht bei der Ankunft zuletzt ein. Liegt hinter dem HUD. | `branch`, `frontLayer` (neue vierte Ebene, `par` 0,7) |
| Wege | Weg zum Ort, der nach hinten schmäler wird (30 → 3 px), mit sechs Telegrafenmasten (40 → 6 px) und Leitung. Loipe im Vordergrund, deren Spurbreite nach hinten abnimmt. | `wege` (mittlere Ebene), `loipe` (nahe Ebene) |

## Gelände unter dem Anlauf: ein Hang aus einem Stück

Bisher passiert in `index.html` Folgendes:
- `terrain()` füllt das Gelände unter dem Anlauf (`G.left`) flach mit `C.ground`.
- `slope()` zeichnet den Aufsprunghang als eigenen Schneekörper und schließt ihn links mit einer geraden Schrägen ab (`slant = 18 %`).

Dadurch wirken Unterbau und Hang wie zwei aufeinandergeklebte Teile mit einer Fuge am Tisch.

Neu (Referenz `buildOverview()` in `telemark-orte.js`): Gelände und Aufsprunghang bilden **eine** durchgehende Oberkante. Die Daten dafür gibt es schon:
- `G.left` endet bei `[0, −tableH]`.
- Dort beginnt `Hh.land`.
- Danach folgt `G.right`.

```js
const edge = G.left.concat(Hh.land.map((p) => [p.x, p.y]), G.right);   // Weltkoordinaten
```

1. **Ein Körper:**
   - Fläche unter `edge` bis zum Bildrand, gefüllt mit `hill[3]`.
   - Die gerade Schräge (`slant`) entfällt, ebenso die getrennte Füllung mit `C.ground`.
   - Der Schanzentisch bekommt vorn eine kurze senkrechte Holzfläche von der Tischkante bis `edge` (Tischhöhe `tableH`).
2. **Alles parallel zur Kante:** Jede Zone ist ein Versatz von `edge` nach unten. So entsteht nirgends eine Fuge.

   | Zone | Versatz unter `edge` | Farbe |
   |---|---|---|
   | präparierter Streifen und Licht | 0 bis Zone 1 | `hill[0]` |
   | Kantenschatten (nur ab Tisch, blendet auf den ersten 2 m ein) | 5–13 px × k | `kante` |
   | Schneezonen | 168 / 250 / 336 px × k, wellig ±12–18 px | `hill[1]`, `hill[2]`, `hill[3]` |
3. **Waldgürtel parallel zur Kante:**
   - Unter dem Anlauf beginnt er direkt an der Kante (Versatz 0,5 m).
   - Ab dem Tisch rückt er bis 0,3 · K auf 7 m unter die Kante. So bleibt darüber der präparierte Hang frei.
   - Dicke 9–15 m mit Waldzungen. Zwischen 0,9 · K und dem Ende des Auslaufs läuft er auf 0 aus.
   - Oben Kronen-Zacken mit Schneehauben, untere Hälfte in der Mischung aus Fichte und Fichte dunkel, innen fünf Reihen Wipfel mit Schnee.
   - Unter dem Gürtel ein Schattenstreifen von 1 m in `kante`.
   - Dicke und Versatz in Metern (× `cam.ppm`), damit der Wald mit der Welt mitwächst.
4. **Baumgruppen** auf dem Schnee unter dem Gürtel, je zwei Fichten, alle 8–14 m.
5. **Hangkante** (2,2 px, Tiefschatten) nur am Aufsprunghang, also ab x = 0. Unter dem Anlauf bilden die Baumkronen die Kante.
6. **Abgewandte Flanke:** Die Baumreihe hinter der Kante (`G.back`) läuft über die ganze Länge, auch hinter dem Anlauf, mit `spruce()` statt `pine()`.

## Abwechslung am Hang je Ort

Referenz: `OVT`, `judgeTower`, `schild`, `crowd`, `hump`, `rock` in `telemark-orte.js`.

| Ort | Wald unter dem Anlauf | Dazu |
|---|---|---|
| Willingen | Mischwald, Fichte im Wechsel mit kahlem Laubwald | Lichtung mit Heustadel |
| Engelberg | Fichte | Lichtung mit Chalet |
| Predazzo | Lärchen (ocker, kahl, einzelne Fichten) | Felsblöcke |
| Holmenkollen | Birken (weiße Stämme) | Fels |
| Oberstdorf | Fichte, dicht | Lichtung mit Stadel |
| Garmisch | lichter Mischwald | zwei Wiesen mit Stadeln |
| Innsbruck | wenige Fichten | Felsen |
| Bischofshofen | Fichte, sehr dicht | – |
| Zakopane | hohe Fichten | – |
| Planica | kein Hochwald: Latschen als niedrige Polster | Felsblöcke |

In allen Orten gilt außerdem:
- **Richterturm** hinter der Kante bei etwa 0,6 · K, mit Kabine, Fensterband und zwei Landesfahnen. Holz auf Gitterstützen in Willingen, Engelberg, Holmenkollen, Bischofshofen und Zakopane, verputzter Pfeiler in den übrigen Orten.
- **Trainerpodest** neben dem Tisch, **Fahne** am Starthaus.
- **Hütten** am Hang in der Hausform des Orts (`preset(town.house)`).
- **Größenwechsel bei den Bäumen:** einzelne hohe Fichten ragen aus dem Gürtel (26–48 px), vorn stehen große Einzelbäume (66–92 px), weiter oben kleine Gruppen.
- **Schanzenschild:** Emailtafel mit Emblem (gekreuzte Ski, Stern, ockerfarbener Ring) und dem Schanzennamen in Jost 700, zum Beispiel TITLIS-SCHANZE, DAL BEN, BERGISEL. Nur Schanzennamen, keine Marken.
- **Zuschauer** im Auslauf: zwei Reihen mit Hut und Mantel, vereinzelt Landesfähnchen. Im Spiel übernimmt das `Scene.drawWorld`, dort nur die Farben angleichen.
- **Ebenen in der Übersicht:** Die nahe Ebene des Flugbilds (Schneebank, Vordergrund-Bäume, Fahnen) wird in der Übersicht nicht gezeichnet. Mit dem Höhenversatz würde sie sonst über dem Auslauf schweben. Die großen Fahnen stehen dort auf dem Auslauf (`gp(x) + 3`).

## Vordergrund je Ort

Die nahe Ebene ist je Ort verschieden (`NEAR` in `telemark-orte.js`). Der Zweig oben rechts erscheint nur in Oberstdorf, Bischofshofen und Zakopane.

| Ort | Nahebene |
|---|---|
| Willingen | Holzzaun, zwei kleine Fichten |
| Engelberg | Fichtengruppe |
| Predazzo | drei Lärchen, kahl mit Schnee auf den Ästen (`larch`) |
| Holmenkollen | drei Birken (`birch`) |
| Oberstdorf | zwei Fichten, Zweig |
| Garmisch | Heustadel (`stadel`) und Zaun, keine Bäume |
| Innsbruck | nur Zaun |
| Bischofshofen | zwei Fichten, Heustadel, Zweig |
| Zakopane | hohe Fichtengruppe, Zweig |
| Planica | eine Fichte |

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
5. Ankunft mit Speicher, Überspringen und roter Ampel; Schnee in drei Tiefen.
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
