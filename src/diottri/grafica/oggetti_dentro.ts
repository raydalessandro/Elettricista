/* ====== DIOTTRI · OGGETTI DELLA BOTTEGA, DENTRO ======
   Segnaposto: forme semplici fatte dal programma, finché non arrivano i disegni a mano (docs/gioco/STILE.md).
   Ogni oggetto è w×h mattonelle; «.» trasparente; una tavolozza per cella; `solido` dice dove non si passa,
   `sopra` quante righe di celle si disegnano sopra i personaggi, `notte` i pixel della sera. */
import type { Oggetto, Tavolozza } from "./formato";
import type { Luce } from "./tavolozze";

type F = (x: number, y: number) => string;
const disegna = (w: number, h: number, f: F) => Array.from({ length: h * 16 }, (_, y) => Array.from({ length: w * 16 }, (_, x) => f(x, y)).join(""));
const griglia = (w: number, h: number, f: (cx: number, cy: number) => string) => Array.from({ length: h }, (_, cy) => Array.from({ length: w }, (_, cx) => f(cx, cy)));
const pieno = (w: number, h: number) => Array.from({ length: h }, () => "x".repeat(w));

export const OGGETTI_DENTRO: Record<string, Oggetto> = {
  banco: { w: 4, h: 1, pal: "banco", px: disegna(4, 1, (_x, y) => (y < 3 ? "0" : y === 3 ? "3" : y > 13 ? "3" : y % 5 === 0 ? "2" : "1")), solido: ["xxxx"], bancone: true },
  scaffale: { w: 2, h: 2, pal: [["banco", "banco"], ["banco", "banco"]], px: disegna(2, 2, (x, y) => (x < 2 || x > 29 || y % 10 === 9 ? "3" : y % 10 < 3 && x % 6 < 4 ? "0" : "2")), solido: pieno(2, 2) },
  specchio: { w: 1, h: 2, pal: [["ottone"], ["vetro"]], px: disegna(1, 2, (x, y) => (x < 2 || x > 13 || y < 2 || y > 29 ? "2" : (x + y) % 9 === 0 ? "0" : "1")), solido: [".", "x"] },
  pianta: { w: 1, h: 2, pal: [["chioma"], ["banco"]], px: disegna(1, 2, (x, y) => (y < 18 ? (Math.hypot(x - 7.5, y - 9) < 8 ? ((x + y) % 4 === 0 ? "1" : "2") : ".") : x > 3 && x < 12 ? (y === 18 ? "3" : "2") : ".")), solido: [".", "x"] },
  vetrinetta: { w: 2, h: 1, pal: [["vetro", "vetro"]], px: disegna(2, 1, (x, y) => (y < 2 || y > 13 || x < 1 || x > 30 ? "3" : y === 8 ? "2" : x % 6 === 2 && (y === 5 || y === 11) ? "3" : "0")), solido: ["xx"] },
  campionario: { w: 2, h: 2, pal: [["banco", "banco"], ["velluto", "velluto"]], px: disegna(2, 2, (x, y) => (x < 2 || x > 29 || y < 2 || y > 29 ? "3" : y < 16 ? "1" : (x % 8 === 4 && y % 8 === 4) ? "0" : "2")), solido: pieno(2, 2) },
  cassetta: { w: 2, h: 1, pal: [["banco", "ottone"]], px: disegna(2, 1, (x, y) => (y < 4 || y > 14 ? "." : y === 4 || y === 14 || x === 0 || x === 31 ? "3" : x % 4 === 2 && y % 3 === 0 ? "0" : "1")), solido: ["xx"] },
};

/** Tavolozze in più per questi disegni (oltre a quelle comuni di grafica/tavolozze.ts): per luce, poi per nome.
    La sera deve avere gli stessi nomi del giorno; se manca, si usa quella del giorno. */
export const TAVOLOZZE_DENTRO: Partial<Record<Luce, Record<string, Tavolozza>>> = {};
