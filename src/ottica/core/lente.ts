/* ====== LA LENTE: MATERIALI, SPESSORE, RIFLESSI, COLORI, NEUTRALIZZAZIONE ======
   Modelli semplici ma onesti, condivisi dal corso e dal gioco Diottri. I numeri dei materiali sono valori
   tipici (non di un produttore): bastano per dire cosa cambia da un materiale all'altro.

   - Spessore: la superficie che dà la forza F (diottrie) a una distanza h (mm) dal centro ottico ha una freccia
     s ≈ h² · |F| / (2000 · (n − 1)) mm. Col meno la lente parte dal suo spessore minimo al centro e cresce verso il
     bordo; col più parte dal minimo al bordo e cresce verso il centro.
   - Distanza dal centro al bordo: metà calibro, più il decentramento quando i centri della montatura
     (calibro + ponte) sono più larghi della distanza pupillare.
   - Riflessi (Fresnel, luce che arriva dritta): R = ((n − 1) / (n + 1))² per superficie.
   - Frange di colore guardando di lato: prisma (regola di Prentice, cm × D) diviso il numero di Abbe.
   - Neutralizzazione a mano: col meno la croce lontana va con la lente, col più va contro; più è forte,
     più corre. Il cilindro sposta la croce in una direzione sola, e girandolo la croce si apre a forbice. */
import { meridian, type SphCyl } from "./eye";

export type MaterialeId = "cr39" | "i160" | "i167" | "i174" | "pc" | "trivex" | "minerale";

export interface Materiale {
  id: MaterialeId;
  /** come si chiama in negozio */
  nome: string;
  /** indice di rifrazione */
  n: number;
  /** numero di Abbe: più è basso, più frange di colore ai lati */
  abbe: number;
  /** densità, g/cm³ */
  densita: number;
  /** spessore minimo al centro di una lente col meno, mm (valore tipico) */
  centroMin: number;
  /** resistenza agli urti */
  urti: "alta" | "normale" | "bassa";
}

export const MATERIALI: Record<MaterialeId, Materiale> = {
  cr39: { id: "cr39", nome: "Organico 1,5", n: 1.498, abbe: 58, densita: 1.32, centroMin: 2.0, urti: "normale" },
  i160: { id: "i160", nome: "Organico 1,6", n: 1.597, abbe: 41, densita: 1.3, centroMin: 1.5, urti: "normale" },
  i167: { id: "i167", nome: "Organico 1,67", n: 1.665, abbe: 31, densita: 1.35, centroMin: 1.3, urti: "normale" },
  i174: { id: "i174", nome: "Organico 1,74", n: 1.74, abbe: 33, densita: 1.47, centroMin: 1.3, urti: "normale" },
  pc: { id: "pc", nome: "Policarbonato", n: 1.586, abbe: 30, densita: 1.2, centroMin: 1.3, urti: "alta" },
  trivex: { id: "trivex", nome: "Trivex", n: 1.532, abbe: 45, densita: 1.11, centroMin: 1.3, urti: "alta" },
  minerale: { id: "minerale", nome: "Minerale (vetro)", n: 1.523, abbe: 59, densita: 2.54, centroMin: 2.0, urti: "bassa" },
};

/** spessore minimo al bordo di una lente col più, mm */
export const BORDO_MIN = 1.0;

/** Freccia della superficie, mm, per una forza F a una distanza h dal centro (mm). */
export function freccia(F: number, n: number, h: number): number {
  return (h * h * Math.abs(F)) / (2000 * (n - 1));
}

export interface Montatura {
  /** calibro: larghezza della lente, mm */
  calibro: number;
  /** ponte, mm */
  ponte: number;
}

/** Distanza dal centro ottico al bordo più lontano (lato tempia), mm, con la distanza pupillare dp (mm). */
export function raggioBordo(m: Montatura, dp: number): number {
  const dec = Math.max(0, (m.calibro + m.ponte - dp) / 2);
  return m.calibro / 2 + dec;
}

export interface Spessore {
  /** al centro, mm */
  centro: number;
  /** al bordo più spesso o più sottile (lato tempia), mm */
  bordo: number;
}

/** Spessore al centro e al bordo di una lente sferica (forza F) nel materiale e nella montatura dati. */
export function spessore(F: number, mat: MaterialeId, m: Montatura, dp: number): Spessore {
  const M = MATERIALI[mat];
  const s = freccia(F, M.n, raggioBordo(m, dp));
  const r1 = (x: number) => Math.round(x * 10) / 10;
  if (F <= 0) return { centro: r1(M.centroMin), bordo: r1(M.centroMin + s) };
  return { centro: r1(BORDO_MIN + s), bordo: BORDO_MIN };
}

/** Lo spessore che conta di più: il bordo col meno, il centro col più. */
export const spessoreMax = (sp: Spessore) => Math.max(sp.centro, sp.bordo);

/** Riflesso di una superficie, in frazione (0,04 = 4%), con la luce che arriva dritta. */
export function riflessoSuperficie(n: number): number {
  return ((n - 1) / (n + 1)) ** 2;
}

/** Riflesso residuo di una superficie con l'antiriflesso: valore tipico, in frazione. */
export const RIFLESSO_AR = 0.005;

/** Riflesso di una superficie della lente, in frazione: col trattamento resta poco, senza dipende dall'indice. */
export function riflesso(mat: MaterialeId, antiriflesso: boolean): number {
  return antiriflesso ? RIFLESSO_AR : riflessoSuperficie(MATERIALI[mat].n);
}

/** Prisma indotto guardando a c centimetri dal centro ottico (regola di Prentice), diottrie prismatiche. */
export const prentice = (cm: number, F: number) => Math.abs(cm * F);

/** Frange di colore (aberrazione cromatica trasversale) a c cm dal centro, in diottrie prismatiche. */
export function frange(F: number, mat: MaterialeId, cm = 1): number {
  return prentice(cm, F) / MATERIALI[mat].abbe;
}

/** sopra questo valore (diottrie prismatiche) le frange di colore si notano */
export const FRANGE_VISIBILI = 0.1;

/* ---------- neutralizzazione a mano ---------- */

export type Moto = "con" | "contro" | "ferma";
export type Fascia = "debole" | "media" | "forte";

/** Fascia di forza: debole fino a 1,50, media da 1,75 a 3,75, forte da 4,00. */
export function fascia(F: number): Fascia {
  const a = Math.abs(F);
  return a <= 1.5 + 1e-9 ? "debole" : a <= 3.75 + 1e-9 ? "media" : "forte";
}

export const FASCE: Fascia[] = ["debole", "media", "forte"];

/** Come si muove la croce lontana quando la lente si sposta nella direzione theta (gradi TABO). */
export function moto(lens: SphCyl, theta: number): { moto: Moto; velocita: number } {
  // spostando la lente in una direzione, conta la forza nel meridiano di quella direzione (regola di Prentice)
  const F = meridian(lens, theta);
  if (Math.abs(F) < 0.12) return { moto: "ferma", velocita: 0 };
  return { moto: F < 0 ? "con" : "contro", velocita: Math.abs(F) };
}

/** Girando la lente davanti alla croce, i bracci si aprono a forbice solo se c'è un cilindro. */
export const forbice = (lens: SphCyl) => Math.abs(lens.cyl) >= 0.25;
