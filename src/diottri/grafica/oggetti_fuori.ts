/* ====== DIOTTRI · OGGETTI DEL BORGO, FUORI ======
   Segnaposto: forme semplici fatte dal programma, finché non arrivano i disegni a mano (docs/gioco/STILE.md).
   Ogni oggetto è w×h mattonelle; «.» trasparente; una tavolozza per cella; `solido` dice dove non si passa,
   `sopra` quante righe di celle si disegnano sopra i personaggi, `notte` i pixel della sera. */
import type { Oggetto, Tavolozza } from "./formato";
import type { Luce } from "./tavolozze";

type F = (x: number, y: number) => string;
const disegna = (w: number, h: number, f: F) => Array.from({ length: h * 16 }, (_, y) => Array.from({ length: w * 16 }, (_, x) => f(x, y)).join(""));
const griglia = (w: number, h: number, f: (cx: number, cy: number) => string) => Array.from({ length: h }, (_, cy) => Array.from({ length: w }, (_, cx) => f(cx, cy)));
const pieno = (w: number, h: number) => Array.from({ length: h }, () => "x".repeat(w));

/** Una casa: il tetto in alto, il muro con porta e finestre. */
function casa(w: number, h: number, tetto: string, muro: string, porta: number, extra?: { insegna?: number; nome?: string }): Oggetto {
  const tr = 1; // righe di tetto
  const pal = griglia(w, h, (cx, cy) => {
    if (cy < tr) return tetto;
    if (extra?.insegna !== undefined && cy === extra.insegna) return extra.nome ?? "insegna";
    if (cy === h - 1 && cx === porta) return "legno";
    if (cy >= tr && (cx === 0 || cx === w - 1) && cy === h - 1) return "vetro";
    return muro;
  });
  const px = disegna(w, h, (x, y) => {
    const cx = Math.floor(x / 16), cy = Math.floor(y / 16), lx = x % 16, ly = y % 16;
    if (cy < tr) return ly < 2 ? "3" : (lx + ly * 2) % 6 === 0 ? "2" : ly % 4 === 3 ? "2" : "1";
    if (extra?.insegna !== undefined && cy === extra.insegna) return ly < 3 ? "3" : Math.floor(lx / 4) % 2 === 0 ? "1" : "2";
    if (cy === h - 1 && cx === porta) return lx < 2 || lx > 13 || ly < 2 ? "3" : lx === 11 && ly === 9 ? "0" : "2";
    if (cy === h - 1 && (cx === 0 || cx === w - 1)) return lx < 2 || lx > 13 || ly < 3 || ly > 12 ? "3" : lx === 8 || ly === 7 ? "3" : "1";
    return ly === 15 ? "3" : (ly % 5 === 4 && lx % 7 === 0) ? "2" : "0";
  });
  return { w, h, pal, px, solido: pieno(w, h) };
}

export const OGGETTI_FUORI: Record<string, Oggetto> = {
  bottega: casa(5, 4, "tetto", "muro", 2, { insegna: 1, nome: "bottega" }),
  casa_rossa: casa(4, 3, "tetto", "muro_rosa", 1),
  casa_blu: casa(4, 3, "ardesia", "muro", 2),
  merceria: casa(4, 3, "tetto", "muro", 1, { insegna: 1, nome: "insegna" }),
  edicola: {
    w: 2, h: 2, pal: [["insegna", "insegna"], ["carta", "carta"]],
    px: disegna(2, 2, (x, y) => (y < 16 ? (y < 3 ? "3" : Math.floor(x / 4) % 2 === 0 ? "1" : "2") : (x % 8 < 6 && y % 8 > 1 ? "1" : y === 31 ? "3" : "2"))),
    solido: pieno(2, 2),
  },
  tabellone: {
    w: 2, h: 2, pal: [["tabellone", "tabellone"], ["ferro", "ferro"]],
    px: disegna(2, 2, (x, y) => (y < 14 ? (y < 1 || y > 12 || x < 1 || x > 30 ? "3" : y % 4 === 2 && x % 3 !== 0 && x > 2 && x < 29 ? "0" : "2") : y < 16 ? "." : (x === 4 || x === 27 ? "3" : "."))),
    solido: ["..", "xx"],
    sopra: 1,
  },
  pensilina: {
    w: 3, h: 2, pal: [["ardesia", "ardesia", "ardesia"], ["ferro", "ferro", "ferro"]],
    px: disegna(3, 2, (x, y) => (y < 10 ? (y < 2 ? "3" : y < 8 ? "1" : "2") : (x === 8 || x === 39 ? "3" : "."))),
    solido: ["...", "x.x"],
    sopra: 1,
  },
  fontana: {
    w: 2, h: 2, pal: [["pietra", "pietra"], ["acqua", "acqua"]],
    px: disegna(2, 2, (x, y) => { const dx = x - 15.5, dy = y - 15.5, r = Math.hypot(dx, dy); return r > 15.5 ? "." : r > 13 ? "3" : r > 11 ? "2" : r < 3 ? "0" : "1"; }),
    solido: pieno(2, 2),
  },
  albero: {
    w: 2, h: 2, pal: [["chioma", "chioma"], ["chioma", "chioma"]],
    px: disegna(2, 2, (x, y) => { const dx = x - 15.5, dy = y - 13, r = Math.hypot(dx, dy * 1.1); if (y > 24 && Math.abs(dx) < 3) return "3"; return r > 14 ? "." : r > 12.5 ? "3" : (x + y) % 5 === 0 ? "1" : "2"; }),
    solido: ["..", "xx"],
    sopra: 1,
  },
  cespuglio: { w: 1, h: 1, pal: "chioma", px: disegna(1, 1, (x, y) => { const r = Math.hypot(x - 7.5, y - 8.5); return r > 7.5 ? "." : r > 6 ? "3" : (x + y) % 4 === 0 ? "1" : "2"; }), solido: ["x"] },
  lampione: {
    w: 1, h: 2, pal: [["ferro"], ["ferro"]],
    px: disegna(1, 2, (x, y) => (y < 8 ? (x > 3 && x < 12 ? (y < 2 || y > 6 ? "3" : "1") : ".") : x > 6 && x < 9 ? "3" : y > 28 && x > 4 && x < 11 ? "2" : ".")),
    notte: disegna(1, 2, (x, y) => (y < 8 ? (x > 3 && x < 12 ? (y < 2 || y > 6 ? "3" : "0") : ".") : x > 6 && x < 9 ? "3" : y > 28 && x > 4 && x < 11 ? "2" : ".")),
    solido: [".", "x"],
    sopra: 1,
  },
  panchina: { w: 2, h: 1, pal: "legno", px: disegna(2, 1, (x, y) => (y < 4 || y > 12 ? "." : y < 7 ? "1" : y === 7 || y === 12 ? "3" : x % 30 < 3 ? "3" : "2")), solido: ["xx"] },
  cartello: { w: 1, h: 1, pal: "legno", px: disegna(1, 1, (x, y) => (y < 9 ? (x < 1 || x > 14 ? "." : y === 0 || y === 8 || x === 1 || x === 14 ? "3" : "1") : x > 6 && x < 9 ? "3" : ".")), solido: ["x"] },
  auto: { w: 2, h: 1, pal: [["auto", "auto"]], px: disegna(2, 1, (x, y) => (y < 3 || y > 14 ? "." : y < 7 ? (x > 8 && x < 24 ? (y === 3 ? "3" : "0") : ".") : (x === 6 || x === 25) && y > 11 ? "3" : y === 7 ? "3" : "1")), solido: ["xx"] },
  cancello_chiuso: { w: 2, h: 1, pal: "ferro", px: disegna(2, 1, (x, y) => (y < 2 || y === 15 ? "3" : x % 4 === 1 ? "3" : y === 7 ? "2" : ".")), solido: ["xx"] },
  cancello_aperto: { w: 2, h: 1, pal: "ferro", px: disegna(2, 1, (x, y) => ((x < 3 || x > 28) && y > 1 ? "3" : ".")), solido: [".."] },
  // dentro la bottega
};

/** Tavolozze in più per questi disegni (oltre a quelle comuni di grafica/tavolozze.ts): per luce, poi per nome.
    La sera deve avere gli stessi nomi del giorno; se manca, si usa quella del giorno. */
export const TAVOLOZZE_FUORI: Partial<Record<Luce, Record<string, Tavolozza>>> = {};
