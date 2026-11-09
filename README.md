# Übergabe: TELEMARK · Landschaft im Stil der Plakate von 1928

## Überblick
TELEMARK ist ein Skisprungspiel im Browser (Repo `matpeins-debug/TELEMARK`, eine `index.html`, Canvas 2D). Landschaft, Orte und Schnee sollen den Charme von Wintersportplakaten der 1920er bekommen. Dazu gehört je Schanze ein eigener Hausberg, ein ortstypisches Ortsbild und bewegte Details. Beim ersten Besuch eines Orts läuft eine kurze Ankunft. Spielmechanik, Kamera, HUD-Tafeln und Texte bleiben unverändert.

## Über die Entwurfsdateien
Die Dateien in `entwurf/` sind **Entwürfe in HTML**. Sie zeigen, wie es aussehen und sich bewegen soll, sind aber kein fertiger Spielcode. Aufgabe ist, sie in `index.html` des Spiels nachzubauen, mit dessen bestehendem Aufbau (`SCENES`, `ATMO`, `TOD`, `LAYERS`, `buildPanorama`, `drawPanorama`, `Renderer`).

Eine Ausnahme gilt: `entwurf/telemark-orte.js` ist reines Canvas 2D ohne Abhängigkeiten. Seine Zeichenfunktionen dürfen direkt übernommen werden.

## Genauigkeit
**High-Fidelity.** Farben, Formen, Maße und Abläufe sind final. Die Werte stehen in `UMSETZUNG.md` und im Stilblatt.

## Was wo liegt
| Datei | Inhalt |
|---|---|
| `UMSETZUNG.md` | **Hauptanleitung.** Entscheidungen, Umrechnung der Koordinaten, Änderungen an SCENES, ATMO, TOD und LAYERS, neue und entfallende Funktionen, Animations-Haken, Ankunft, Leistung, Reihenfolge, Prüfliste, Prompt |
| `entwurf/telemark-orte.js` | Referenz-Renderer mit allen zehn Orten (`ORTE`), Paletten (`PAL.sonne`, `PAL.gluehen`), Bergen, Ortsbild, Animationen und Ankunft (`frame`) |
| `entwurf/TELEMARK Orte.dc.html` | Ansicht aller zehn Orte mit Umschalter für das Licht und Knopf „Ankunft abspielen“ |
| `entwurf/TELEMARK Stilblatt.dc.html` | Druckfarben, Zuordnung je Lichtstimmung, Formregeln, Textur, Do und Don't, Schrift |
| `entwurf/TELEMARK Stilrichtung.dc.html` + `plakat-szene.js` | erster Entwurf Engelberg mit HUD-Tafeln, zeigt Lesbarkeit und Springer-Kontur (die Berge dort sind noch die alte Form) |
| `fonts/Jost.ttf`, `fonts/Oswald.ttf` | OFL-Schriften, ins Repo nach `fonts/` kopieren und selbst hosten |

Die Entwürfe öffnen sich direkt im Browser. Dafür `entwurf/` über einen lokalen Webserver ausliefern, zum Beispiel mit `npx serve entwurf`.

## Kurzfassung der Farben
Kobalt `#1F56A8`, Himmel `#4F86C6`, Dunst `#BFD6EA`, Papierweiß `#F4EEDF`, Schneeschatten `#8DAFD8`, Tiefschatten `#5C78B8`, Alpenglühen `#E9A58C`, Abendviolett `#6B5C8E`, Fichte `#2D5546`, Fichte dunkel `#1D3A33`, Holz & Dach `#8E4A2E`. Dazu aus der Oberfläche: Signalrot `#C23B2A`, Ocker `#DDA43B`, Tinte `#1E2734`, Springergelb `#F2C230`. Zwischentöne sind Mischungen zweier dieser Farben. Die vollständige Zuordnung je Rolle steht in `PAL` in `telemark-orte.js`.

## Vorgehen
Die Reihenfolge in `UMSETZUNG.md` Schritt für Schritt abarbeiten. Mit Engelberg beginnen und nach jedem Schritt anhalten, damit am Handy getestet werden kann. Ganz unten in `UMSETZUNG.md` steht der fertige Prompt.
