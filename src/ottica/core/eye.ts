/* ====== MODELLO DELL'OCCHIO ======
   Un modello semplice ma onesto, in diottrie: tutto quello che il gioco disegna (raggi, fuoco, sfocatura,
   fatica, decimi) viene da qui. Niente stati disegnati a mano.

   - Il difetto dell'occhio si scrive come la lente che lo corregge (la «ricetta» da lontano), sul piano degli occhiali.
   - Lenti e ricette sono sferocilindriche, col cilindro negativo e l'asse in gradi TABO (0–180, visti da davanti).
   - Un oggetto a distanza d manda luce con vergenza V = −1/d (0 per lontano).
   - Nel meridiano θ l'occhio, rilassato, mette a fuoco la luce di vergenza E(θ); accomodando di A mette a fuoco E(θ) − A.
     Con la lente L davanti, la sfocatura nel meridiano θ è  δ(θ) = V + A + L(θ) − E(θ).
     δ > 0: il fuoco cade prima della retina (sfocatura «da miope»); δ < 0: cadrebbe dietro.
   - L'occhio sceglie da solo quanto accomodare (da 0 al massimo che ha a quell'età) per mettere a fuoco al meglio.
   I calcoli col cilindro usano i vettori di potenza (Thibos): M = S + C/2, J0 = −C/2·cos2α, J45 = −C/2·sin2α. */

/** Lente sferocilindrica: sfera, cilindro (≤ 0) e asse in gradi TABO. */
export interface SphCyl {
  sph: number;
  cyl: number;
  axis: number;
}

export const PLANO: SphCyl = { sph: 0, cyl: 0, axis: 180 };
export const sph = (s: number): SphCyl => ({ sph: s, cyl: 0, axis: 180 });

/** Vettore di potenza: M equivalente sferico, J0 e J45 le due componenti dell'astigmatismo. */
export interface PowerVec {
  M: number;
  J0: number;
  J45: number;
}

const RAD = Math.PI / 180;

export function toVec(l: SphCyl): PowerVec {
  const a = 2 * l.axis * RAD;
  return { M: l.sph + l.cyl / 2, J0: (-l.cyl / 2) * Math.cos(a), J45: (-l.cyl / 2) * Math.sin(a) };
}

/** Asse TABO tra 1 e 180 (il 0 si scrive 180). */
export function normAxis(a: number): number {
  let x = Math.round(a) % 180;
  if (x <= 0) x += 180;
  return x;
}

export function fromVec(v: PowerVec): SphCyl {
  const J = Math.hypot(v.J0, v.J45);
  if (J < 1e-9) return { sph: v.M, cyl: 0, axis: 180 };
  const cyl = -2 * J;
  return { sph: v.M - cyl / 2, cyl, axis: normAxis(Math.atan2(v.J45, v.J0) / 2 / RAD) };
}

export const addVec = (a: PowerVec, b: PowerVec): PowerVec => ({ M: a.M + b.M, J0: a.J0 + b.J0, J45: a.J45 + b.J45 });
export const subVec = (a: PowerVec, b: PowerVec): PowerVec => ({ M: a.M - b.M, J0: a.J0 - b.J0, J45: a.J45 - b.J45 });

/** Potenza di una lente nel meridiano θ (gradi TABO). */
export function meridian(l: SphCyl, theta: number): number {
  return l.sph + l.cyl * Math.sin((theta - l.axis) * RAD) ** 2;
}

/** Accomodazione disponibile a quell'età, in diottrie: il valore minimo atteso per l'età (Hofstetter; la media è 18,5 − 0,3 × età).
    Non scende sotto 0,5: anche a 70 anni la profondità di campo regala qualcosa. */
export function amplitude(age: number): number {
  return Math.max(0.5, 15 - 0.25 * age);
}

/** Punto più vicino che si vede nitido, in metri, per un occhio senza difetti da lontano. */
export const nearPoint = (age: number): number => 1 / amplitude(age);

/** Quanto può lavorare il cristallino a lungo senza stancarsi: metà di quello che ha. */
export const COMFORT = 0.5;

export type Sharpness = "nitido" | "quasi" | "sfocato" | "molto";
export type Work = "riposo" | "poco" | "lavora" | "fatica" | "nonbasta";

export interface Sight {
  /** vergenza della luce che arriva (D) */
  V: number;
  /** accomodazione disponibile e usata (D) */
  amp: number;
  A: number;
  /** quanto lavora il cristallino: A diviso amp */
  effort: number;
  /** sfocatura media che resta (D): > 0 fuoco davanti alla retina, < 0 dietro */
  m: number;
  /** metà della differenza tra i due meridiani principali (D): 0 se non c'è astigmatismo che resta */
  J: number;
  /** meridiano principale con la sfocatura più «da miope» (gradi TABO) e il suo perpendicolare */
  phi: number;
  rMax: number;
  rMin: number;
  /** sfocatura complessiva (D) */
  B: number;
  /** come appare la scena: se resta astigmatismo e l'occhio può, porta a fuoco la linea dietro la retina
      (una direzione nitida, l'altra sfocata). Solo per disegnare: decimi e nitidezza vengono da B. */
  dMax: number;
  dMin: number;
  sharp: Sharpness;
  work: Work;
  /** acuità visiva stimata, in decimi (10 = 10/10) */
  decimi: number;
}

const DECIMI = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0.5];

/** Acuità in decimi dalla sfocatura: −1,00 non corretto ≈ 3/10, −2,00 ≈ 2/10, −3,00 ≈ 1/10. */
export function decimiOf(B: number): number {
  const va = 10 / (1 + 1.5 * B + 0.5 * B * B);
  let best = DECIMI[0];
  for (const d of DECIMI) if (Math.abs(Math.log(d / va)) < Math.abs(Math.log(best / va))) best = d;
  return best;
}

/** Nitidezza a parole, coerente con i decimi: 9–10 nitido, 6–8 quasi, 3–5 sfocato, sotto molto sfocato. */
export function sharpOf(B: number): Sharpness {
  if (B < 0.1) return "nitido";
  const d = decimiOf(B);
  return d >= 6 ? "quasi" : d >= 3 ? "sfocato" : "molto";
}

/** sopra questo astigmatismo che resta (D) ci sono due fuochi distinti: si disegnano, si dicono e l'occhio ne porta uno sulla retina */
export const TWO_FOCI = 0.06;

export interface EyeState {
  /** la lente che corregge l'occhio da lontano */
  rx: SphCyl;
  age: number;
}

/** Cosa vede un occhio, con una lente davanti, guardando a una distanza (metri; Infinity = lontano). */
export function see(eye: EyeState, lens: SphCyl, dist: number): Sight {
  const V = Number.isFinite(dist) ? -1 / dist : 0;
  const D = subVec(toVec(lens), toVec(eye.rx));
  const amp = amplitude(eye.age);
  const need = -(V + D.M);
  const A = Math.min(Math.max(need, 0), amp);
  const m = V + A + D.M;
  const J = Math.hypot(D.J0, D.J45);
  const phi = J < 1e-9 ? 90 : normAxis(Math.atan2(D.J45, D.J0) / 2 / RAD);
  const B = Math.hypot(m, J);
  const effort = A / amp;
  const work: Work = need > amp + 1e-9 ? "nonbasta" : A < 0.13 ? "riposo" : effort <= 0.25 ? "poco" : effort <= COMFORT + 1e-9 ? "lavora" : "fatica";
  const rMax = m + J, rMin = m - J;
  // con due fuochi a cavallo della retina l'occhio giovane porta a fuoco quello dietro: una direzione nitida, l'altra no
  const shift = J > TWO_FOCI && rMin < 0 ? Math.min(-rMin, amp - A) : 0;
  return { V, amp, A, effort, m, J, phi, rMax, rMin, B, dMax: rMax + shift, dMin: rMin + shift, sharp: sharpOf(B), work, decimi: decimiOf(B) };
}

/** Zona in cui si vede nitido con una lente (metri, dal più vicino al più lontano). Per occhi senza cilindro. */
export function clearRange(eye: EyeState, lens: SphCyl): { near: number; far: number } {
  const P = toVec(lens).M - toVec(eye.rx).M;
  const amp = amplitude(eye.age);
  return { near: 1 / (P + amp), far: P > 1e-9 ? 1 / P : Infinity };
}

/* ---------- numeri come li scrive l'ottico ---------- */

/** «−1,75», «+2,00», «0,00»: segno tipografico, virgola, due decimali. */
export function diop(x: number, sign = true): string {
  const v = Math.round(x * 100) / 100;
  const s = Math.abs(v).toFixed(2).replace(".", ",");
  if (!sign || v === 0) return s;
  return (v < 0 ? "−" : "+") + s;
}

/** Ricetta in una riga: «−0,50 −1,25 × 170», «+2,00». */
export function rxText(l: SphCyl): string {
  return l.cyl ? `${diop(l.sph)} ${diop(l.cyl)} × ${normAxis(l.axis)}` : diop(l.sph);
}

/** Distanza leggibile: «40 cm», «1,2 m», «lontano» (con lo spazio che non va a capo). */
export function distText(d: number): string {
  if (!Number.isFinite(d)) return "lontano";
  if (d < 1) return `${Math.round(d * 100)}\u00a0cm`;
  return `${(Math.round(d * 10) / 10).toLocaleString("it-IT")}\u00a0m`;
}

/** L'asse visto da chi porta gli occhiali è lo specchio di quello TABO (che si legge da davanti). */
export const wearerAngle = (tabo: number): number => 180 - tabo;
