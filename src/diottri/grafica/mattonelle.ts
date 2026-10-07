/* ====== DIOTTRI · MATTONELLE DEL TERRENO (16×16) ======
   Segnaposto: disegni semplici fatti dal programma, finché non arrivano quelli a mano (vedi docs/gioco/STILE.md).
   Ogni voce: tavolozza (nome in grafica/tavolozze.ts) e 16 righe da 16 caratteri «0»–«3». */
import type { Mattonella, Tavolozza } from "./formato";
import type { Luce } from "./tavolozze";

/** Una mattonella piena di un indice, con qualche puntino di un altro: deterministica dal nome. */
function trama(base: string, punti: string, densita: number, seme: number): string[] {
  let a = seme >>> 0;
  const r = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  return Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => (r() < densita ? punti : base)).join(""));
}

const righe = (f: (x: number, y: number) => string) => Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => f(x, y)).join(""));

export const MATTONELLE: Record<string, Mattonella> = {
  // fuori
  erba: { pal: "erba", px: trama("1", "2", 0.08, 1) },
  erba_alta: { pal: "erba", px: righe((x, y) => ((x + y * 3) % 7 === 0 ? "3" : (x * 5 + y) % 9 === 0 ? "2" : "1")) },
  fiori: { pal: "fiori", px: righe((x, y) => ((x % 6 === 2 && y % 6 === 2) ? "1" : (x % 6 === 2 && y % 6 === 3) ? "3" : (x + y) % 11 === 0 ? "2" : "0")) },
  pietra: { pal: "pietra", px: righe((x, y) => (y % 8 === 0 || (x + (Math.floor(y / 8) % 2) * 8) % 16 === 0 ? "2" : "1")) },
  sentiero: { pal: "sentiero", px: trama("1", "2", 0.1, 7) },
  binari: { pal: "ferro", px: righe((x, y) => (y === 4 || y === 11 ? "3" : x % 4 === 0 ? "2" : "1")) },
  banchina: { pal: "pietra", px: righe((x, y) => (y % 8 === 7 || x % 8 === 7 ? "2" : "0")) },
  banchina_bordo: { pal: "insegna", px: righe((_x, y) => (y < 3 ? "1" : y < 4 ? "3" : "0")) },
  acqua: { pal: "acqua", px: righe((x, y) => ((x + y * 2) % 8 === 0 ? "0" : "1")), anim: [righe((x, y) => ((x + y * 2 + 4) % 8 === 0 ? "0" : "1"))] },
  riva: { pal: "sabbia", px: trama("1", "2", 0.08, 3) },
  pontile: { pal: "legno", px: righe((x, y) => (x % 4 === 3 ? "3" : y % 8 === 0 ? "2" : "1")) },
  canne: { pal: "chioma", px: righe((x, y) => (x % 3 === 0 && y > 2 ? "3" : y > 10 ? "1" : "0")) },
  siepe: { pal: "chioma", px: trama("2", "3", 0.2, 5) },
  recinto: { pal: "legno", px: righe((x, y) => (y === 5 || y === 10 ? "2" : x % 8 === 3 && y > 2 ? "3" : "0")) },
  // dentro la bottega
  parquet: { pal: "parquet", px: righe((x, y) => (y % 4 === 3 ? "2" : (x + Math.floor(y / 4) * 5) % 16 === 0 ? "2" : "1")) },
  tappeto: { pal: "tappeto", px: righe((x, y) => (x === 0 || y === 0 || x === 15 || y === 15 ? "3" : (x + y) % 4 === 0 ? "1" : "2")) },
  muro_int: { pal: "muro_int", px: righe((_x, y) => (y > 12 ? "2" : y === 12 ? "3" : "1")) },
  muro_basso: { pal: "muro_int", px: righe((_x, y) => (y < 3 ? "3" : y < 6 ? "2" : "1")) },
  zerbino: { pal: "banco", px: righe((x, y) => (x < 2 || x > 13 ? "1" : (x + y) % 2 === 0 ? "2" : "3")) },
};

/** Tavolozze in più per questi disegni (oltre a quelle comuni di grafica/tavolozze.ts): per luce, poi per nome.
    La sera deve avere gli stessi nomi del giorno; se manca, si usa quella del giorno. */
export const TAVOLOZZE_MATTONELLE: Partial<Record<Luce, Record<string, Tavolozza>>> = {};
