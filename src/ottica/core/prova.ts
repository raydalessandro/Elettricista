/* La prova lenti: quale lente c'è in prova, quando è risolta, cosa dire se non lo è.
   Una sola fonte per il gioco, il controllo dello standard e la riga di comando. */
import { clearRange, COMFORT, diop, normAxis, see, type Sight, type SphCyl } from "./eye";
import type { Prova, ProvaAsse, ProvaSfera, ProvaVicino, Ricetta, RxCell, SceneId, Variant } from "./types";

export type ProvaLenti = ProvaSfera | ProvaVicino | ProvaAsse;

const EPS = 1e-9;

/** I valori che il comando può prendere, dal primo all'ultimo. */
export function values(p: ProvaLenti): number[] {
  if (p.type === "asse") {
    const out: number[] = [];
    for (let a = p.step; a <= 180; a += p.step) out.push(a);
    return out;
  }
  const out: number[] = [];
  for (let v = p.min; v <= p.max + EPS; v += 0.25) out.push(Math.round(v * 100) / 100);
  return out;
}

export function startValue(p: ProvaLenti): number {
  return p.type === "asse" ? p.lens.axis : p.start;
}

/** La lente in prova per un valore del comando. Nella prova da vicino il comando è l'addizione, sopra la ricetta da lontano. */
export function lensAt(p: ProvaLenti, v: number): SphCyl {
  if (p.type === "asse") return { ...p.lens, axis: normAxis(v) };
  if (p.type === "vicino") return { ...p.eye.rx, sph: p.eye.rx.sph + v };
  return { sph: v, cyl: 0, axis: 180 };
}

/** Quello che il cliente vede con quella lente, per ogni vista della prova. */
export function sights(p: ProvaLenti, v: number): Sight[] {
  const l = lensAt(p, v);
  return p.views.map(w => see(p.eye, l, w.d));
}

const comfy = (s: Sight) => s.sharp === "nitido" && s.effort <= COMFORT + EPS && s.work !== "nonbasta";

/** Risolta: lontano nitido a riposo (sfera), prima addizione comoda (vicino), lontano nitido (asse). */
export function solved(p: ProvaLenti, v: number): boolean {
  if (p.type === "sfera") {
    const s = see(p.eye, lensAt(p, v), Infinity);
    return s.sharp === "nitido" && s.work === "riposo";
  }
  if (p.type === "vicino") {
    const ok = values(p).filter(x => comfy(see(p.eye, lensAt(p, x), p.dist)));
    return ok.length > 0 && Math.abs(ok[0] - v) < EPS;
  }
  return see(p.eye, lensAt(p, v), Infinity).sharp === "nitido";
}

export function solutions(p: ProvaLenti): number[] {
  return values(p).filter(v => solved(p, v));
}

const cm = (m: number) => (!Number.isFinite(m) ? "lontano" : m < 1 ? `${Math.round(m * 100)}\u00a0cm` : `${(Math.round(m * 10) / 10).toLocaleString("it-IT")}\u00a0m`);

/** Il giudizio dopo «Questa è la lente giusta». */
export function verdict(p: ProvaLenti, v: number): { ok: boolean; msg: string } {
  if (solved(p, v)) {
    if (p.type === "sfera") return { ok: true, msg: `Con ${diop(v)} il lontano è nitido e il cristallino riposa.` };
    if (p.type === "vicino") {
      const r = clearRange(p.eye, lensAt(p, v));
      return { ok: true, msg: `Con ${diop(v)} si legge nitido e comodo, e la zona nitida va da ${cm(r.near)} a ${cm(r.far)}.` };
    }
    return { ok: true, msg: `Con l'asse a ${normAxis(v)}° le righe sono tutte uguali.` };
  }
  if (p.type === "sfera") {
    const s = see(p.eye, lensAt(p, v), Infinity), rx = p.eye.rx.sph;
    if (s.sharp === "nitido") {
      if (rx < 0) return { ok: false, msg: "Nitido, ma il cristallino lavora: hai messo troppo meno. Torna verso lo zero un quarto alla volta, finché resta nitido." };
      if (v < 0) return { ok: false, msg: "Col meno il cristallino deve lavorare ancora di più: per l'ipermetropia serve una lente col più." };
      return { ok: false, msg: "Nitido, ma il cristallino lavora ancora: sali col più, un quarto alla volta, finché il lontano resta nitido." };
    }
    if (s.m > 0) {
      if (v > rx && rx >= 0) return { ok: false, msg: "Troppo più: il fuoco passa davanti alla retina e il lontano sfoca. Torna indietro." };
      if (v > 0) return { ok: false, msg: "Col più il fuoco va ancora più avanti: per la miopia serve una lente col meno." };
      return { ok: false, msg: "Ancora sfocato: il fuoco cade davanti alla retina. Scendi ancora col meno." };
    }
    return { ok: false, msg: "Troppo meno: il cristallino non riesce più a compensare e il fuoco va dietro la retina." };
  }
  if (p.type === "vicino") {
    const s = see(p.eye, lensAt(p, v), p.dist);
    if (!comfy(s)) return { ok: false, msg: s.sharp === "nitido" ? "Si legge, ma con fatica: il cristallino lavora troppo. Sali ancora col più." : "Ancora sfocato da vicino: sali ancora col più." };
    const r = clearRange(p.eye, lensAt(p, v));
    return { ok: false, msg: `Comodo, ma più forte del necessario: la zona nitida si accorcia (da ${cm(r.near)} a ${cm(r.far)}). Scendi: la lente giusta è la più leggera con cui si legge comodi.` };
  }
  const sol = solutions(p)[0] ?? 0;
  let err = Math.abs(normAxis(v) - sol) % 180;
  if (err > 90) err = 180 - err;
  if (err > 30) return { ok: false, msg: `L'asse è lontano: con ${err}° di errore il cilindro peggiora la vista invece di correggerla. Gira di più.` };
  if (err === 30) return { ok: false, msg: "L'asse è lontano: con 30° di errore è come non avere il cilindro. Gira di più." };
  return { ok: false, msg: "Quasi: una direzione è ancora sfocata. Gira piano, un passo alla volta." };
}

export const isLensProva = (p: Prova | undefined): p is ProvaLenti => !!p && p.type !== "ricetta";

/** La prova con la variante della partita: occhio (e lente di partenza) della variante. */
export function withVariant<T extends Prova>(p: T, v: Variant | undefined): T {
  if (!v || p.type === "ricetta") return p;
  return { ...p, eye: v.eye, ...(v.lens && p.type === "asse" ? { lens: v.lens } : {}) };
}

/** Sostituisce {chiave} con i valori della variante. */
export function fill(t: string, vars: Record<string, string> | undefined): string {
  return vars ? t.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m)) : t;
}

/* ---------- la ricetta ---------- */

/** Cosa vuol dire un numero della ricetta, in una frase (quando lo tocchi, giusto o sbagliato). */
export function cellWhy(r: Ricetta, c: RxCell): string {
  if (c === "ADD") return r.add ? `ADD ${diop(r.add)}: si aggiunge per vicino, a tutti e due gli occhi.` : "Qui non c'è addizione.";
  const [eye, f] = c.split(".") as ["OD" | "OS", "SF" | "CIL" | "AX"];
  const l = eye === "OD" ? r.od : r.os, nome = eye === "OD" ? "occhio destro" : "occhio sinistro";
  if (f === "SF") {
    // col cilindro conta anche la direzione più forte: sfera e sfera + cilindro
    const lo = l.sph + Math.min(0, l.cyl);
    const what = l.sph < 0 ? "miopia" : l.sph > 0 && lo >= 0 ? "ipermetropia" : l.sph > 0 ? "ma col cilindro in una direzione diventa col meno: lo spiega l'ottico" : l.cyl ? "niente sfera, solo il cilindro" : "niente da correggere";
    return `Sfera dell'${nome}: ${diop(l.sph)}, ${what}.`;
  }
  if (!l.cyl) return `L'${nome} non ha cilindro: niente astigmatismo.`;
  return f === "CIL" ? `Cilindro dell'${nome}: ${diop(l.cyl)}, c'è astigmatismo.` : `Asse dell'${nome}: ${normAxis(l.axis)}°, la direzione del cilindro sullo schema TABO.`;
}

/* ---------- che occhiale fare con una ricetta (seconda parte della prova della ricetta) ---------- */

export type Occhiale = "lontano" | "vicino" | "progressive" | "ufficio";
export const OCCHIALI: [Occhiale, string][] = [["lontano", "Da lontano"], ["vicino", "Da vicino"], ["progressive", "Progressive"], ["ufficio", "Da ufficio"]];
export type Guardo = "strada" | "pc" | "giornale";
export const GUARDA: { k: Guardo; scene: SceneId; d: number; label: string; short: string }[] = [
  { k: "strada", scene: "strada", d: Infinity, label: "Lontano: la strada", short: "Strada" },
  { k: "pc", scene: "pc", d: 0.6, label: "Computer, 60 cm", short: "Computer" },
  { k: "giornale", scene: "giornale", d: 0.4, label: "Giornale, 40 cm", short: "Giornale" },
];

/** La lente davanti all'occhio con quell'occhiale, guardando a quella distanza.
    Progressive: in alto niente addizione, al centro una parte, in basso tutta. Da ufficio: in alto c'è già una parte dell'addizione. */
export function occhialeLens(rx: SphCyl, add: number, kind: Occhiale, d: number): SphCyl {
  const mid = Math.round(add * 0.65 * 4) / 4;
  const far = !Number.isFinite(d), inter = !far && d >= 0.5;
  const extra = kind === "lontano" ? 0 : kind === "vicino" ? add : kind === "progressive" ? (far ? 0 : inter ? mid : add) : far || inter ? mid : add;
  return { ...rx, sph: rx.sph + extra };
}

/** Cosa si vede con quell'occhiale, in una frase. */
export function occhialeWords(kind: Occhiale, age: number): string {
  return {
    lontano: `Strada nitida; computer e giornale sfocati: a ${age} anni il cristallino non mette più a fuoco da vicino.`,
    vicino: "Giornale nitido; strada e computer sfocati: con la lente da vicino non si guida.",
    progressive: "In alto la strada, al centro il computer, in basso il giornale: tutto nitido con lo stesso occhiale.",
    ufficio: "Computer e giornale nitidi, la strada no: è un occhiale per la scrivania, non per guidare.",
  }[kind];
}

/** L'addizione più leggera con cui si legge comodi a quella distanza (quarti di diottria, fino a +3,50). */
export function minReadingAdd(eye: { rx: SphCyl; age: number }, dist: number): number {
  for (let x = 0; x <= 3.5 + EPS; x += 0.25) {
    const s = see(eye, { ...eye.rx, sph: eye.rx.sph + x }, dist);
    if (comfy(s)) return Math.round(x * 100) / 100;
  }
  return NaN;
}
