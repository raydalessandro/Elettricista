/* ====== REGOLE DELLA TAVOLA ======
   Cosa si può collegare a cosa. Le usa il gioco (trascinare, toccare due punti)
   e le usano i controlli automatici: una sola fonte, così non possono divergere. */

import { termIds } from "./engine";
import type { Board, Comp, Wire, WireColor, WireSpec } from "./types";
import { WIRES } from "../content/wires";

export interface RulesLevel {
  board: Board;
  palette?: { sections?: boolean; defSec?: number } | null;
}

/** Un rifiuto: [versione corta sulla tavola, versione lunga nel riquadro]. */
export type Reject = readonly [string, string];

export type Source = { kind: "tip"; cid: string } | { kind: "grip"; i: number; end: "a" | "b" } | { kind: "term"; t: string };

export interface Point {
  x: number;
  y: number;
}

const compById = (lv: RulesLevel, id: string): Comp => lv.board.comps.find(c => c.id === id)!;
const compOf = (lv: RulesLevel, term: string): Comp => compById(lv, term.split(".")[0]);
const capOf = (lv: RulesLevel, t: string) => {
  const c = compOf(lv, t);
  return c.kind === "capo" || c.kind === "morsetto" ? 1 : 2;
};
const usedAt = (lv: RulesLevel, wires: readonly Wire[], t: string, skip: number) =>
  wires.filter((w, i) => i !== skip && (w.a === t || w.b === t)).length + (lv.board.fixed || []).filter(f => f.vis && (f.a === t || f.b === t)).length;
const capoWire = (wires: readonly Wire[], cid: string) => wires.findIndex(w => w.capo && w.a === cid + ".x");

/* geometria: dove sta ogni morsetto sulla tavola (larga 360) */
function tpos(lv: RulesLevel, id: string): Point {
  const t = id.split(".")[1],
    c = compOf(lv, id),
    x = c.x || 0,
    y = c.y || 0;
  const pick = (m: Record<string, number>) => m[t] ?? 0;
  switch (c.kind) {
    case "capo":
      return { x, y };
    case "morsetto":
      return { x: x + 15 + (+t.slice(1) - 1) * 30, y: y + 14 };
    case "presa":
      return { x: x + pick({ A: 16, PE: 50, B: 84 }), y: y + 88 };
    case "lampada": {
      const ty = c.top ? y + 12 : y + 78;
      return c.classe1 ? { x: x + pick({ L: 16, N: 50, PE: 84 }), y: ty } : { x: x + pick({ L: 25, N: 75 }), y: ty };
    }
    case "interruttore":
      return { x: x + pick({ 1: 24, 2: 72 }), y: y + 72 };
    case "deviatore":
      return { x: x + pick({ C: 14, 1: 48, 2: 82 }), y: y + 72 };
    case "invertitore":
      return { x: x + pick({ 1: 14, 2: 48, 3: 82, 4: 116 }), y: y + 72 };
  }
  return { x: 0, y: 0 };
}
/* da che parte arriva un filo al morsetto: dal basso (1) o dall'alto (-1, morsettiera in cima alle lampade a soffitto) */
const tdir = (lv: RulesLevel, id: string) => {
  const c = compOf(lv, id);
  return c.kind === "lampada" && c.top ? -1 : 1;
};
/* ingombro di un componente, per i controlli di impaginazione */
function bbox(c: Comp): { x: number; y: number; w: number; h: number } | null {
  const x = c.x || 0,
    y = c.y || 0;
  switch (c.kind) {
    case "morsetto":
      return { x, y: y - 7, w: (c.slots || 0) * 30, h: 35 };
    case "presa":
      return { x, y: y - 22, w: 100, h: 118 };
    case "lampada":
      return c.top ? { x, y: y - 22, w: 100, h: 112 } : { x, y, w: 100, h: 106 };
    case "interruttore":
    case "deviatore":
      return { x, y, w: 96, h: 92 };
    case "invertitore":
      return { x, y, w: 140, h: 92 };
    case "capo":
      return { x: x - 6, y: y - 6, w: 12, h: 12 };
  }
  return null;
}

/* ogni rifiuto ha una versione corta (sulla tavola, mentre trascini) e una lunga (nel riquadro) */
const E = {
  twist: ["serve un morsetto", "Due fili non si uniscono attorcigliandoli: serve un morsetto."],
  tipend: ["serve un morsetto", "Un filo nuovo va da morsetto a morsetto, non sulla punta di un altro filo."],
  locked: ["già collegato", "Questo è già collegato."],
  full: ["pieno", "Morsetto pieno: ci stanno al massimo due fili."],
  slot: ["foro occupato", "Questo foro è già occupato: un filo per foro."],
  same: ["stesso morsetto", "È lo stesso morsetto."],
  wago: ["stesso morsetto a leva", "Sono due fori dello stesso morsetto a leva: dentro sono già uniti."],
  dup: ["già collegati", "Questi due punti sono già collegati."],
  nonew: ["qui niente fili nuovi", "Qui non servono fili nuovi: trascina la punta di rame dei fili che ci sono."],
} as const satisfies Record<string, Reject>;
const eFar = (cc: Comp): Reject => ["non ci arriva", `Il filo ${WIRES[cc.color!].label} esce dal cavo e non ci arriva: collegalo a un morsetto vicino, poi prosegui con un filo nuovo.`];
const eFull = (lv: RulesLevel, t: string): Reject => (compOf(lv, t).kind === "morsetto" ? E.slot : E.full);

function attachCapo(lv: RulesLevel, wires: readonly Wire[], cid: string, t: string, skip: number): Reject | null {
  const cc = compById(lv, cid),
    oc = compOf(lv, t);
  if (oc.locked) return E.locked;
  if (oc.zone !== cc.zone) return eFar(cc);
  if (usedAt(lv, wires, t, skip) >= capOf(lv, t)) return eFull(lv, t);
  return null;
}
function attachNew(lv: RulesLevel, wires: readonly Wire[], from: string, t: string, skip: number): Reject | null {
  if (t === from) return E.same;
  const A = compOf(lv, from),
    B = compOf(lv, t);
  if (B.locked) return E.locked;
  if (A === B && A.kind === "morsetto") return E.wago;
  if (wires.some((w, i) => i !== skip && ((w.a === from && w.b === t) || (w.a === t && w.b === from)))) return E.dup;
  if (usedAt(lv, wires, t, skip) >= capOf(lv, t)) return eFull(lv, t);
  return null;
}
/* da dove parte un gesto: la punta di un filo che arriva, un morsetto, o il pallino di un filo già posato */
function srcFromKey(lv: RulesLevel, wires: readonly Wire[], key: string): Source {
  const id = key.slice(2);
  if (key[0] === "c") return { kind: "tip", cid: id };
  if (!lv.palette) {
    const ws = wires.map((w, i) => [w, i] as const).filter(([w]) => w.capo && w.b === id);
    if (ws.length) return { kind: "grip", i: ws[ws.length - 1][1], end: "b" };
  }
  return { kind: "term", t: id };
}
function sourceError(lv: RulesLevel, wires: readonly Wire[], src: Source): Reject | null {
  if (src.kind !== "term") return null;
  if (usedAt(lv, wires, src.t, -1) >= capOf(lv, src.t)) return eFull(lv, src.t);
  return null;
}
function checkTarget(lv: RulesLevel, wires: readonly Wire[], src: Source, key: string): Reject | null {
  const tip = key[0] === "c",
    id = key.slice(2);
  if (src.kind === "tip") return tip ? E.twist : attachCapo(lv, wires, src.cid, id, -1);
  if (src.kind === "grip") {
    const w = wires[src.i];
    if (tip) return w.capo ? E.twist : E.tipend;
    if (w.capo) return attachCapo(lv, wires, w.a.split(".")[0], id, src.i);
    return attachNew(lv, wires, src.end === "a" ? w.b : w.a, id, src.i);
  }
  if (tip) return attachCapo(lv, wires, id, src.t, -1);
  if (!lv.palette) return E.nonew;
  return attachNew(lv, wires, src.t, id, -1);
}
function allKeys(lv: RulesLevel, wires: readonly Wire[]): string[] {
  const out: string[] = [];
  for (const c of lv.board.comps) {
    if (c.kind === "sorgente" || c.locked) continue;
    if (c.kind === "capo") {
      if (capoWire(wires, c.id) < 0) out.push("c:" + c.id);
      continue;
    }
    for (const t of termIds(c)) out.push("t:" + c.id + "." + t);
  }
  return out;
}
function candKeys(lv: RulesLevel, wires: readonly Wire[], src: Source): Set<string> {
  if (sourceError(lv, wires, src)) return new Set();
  const self = src.kind === "tip" ? "c:" + src.cid : src.kind === "term" ? "t:" + src.t : null;
  return new Set(allKeys(lv, wires).filter(k => k !== self && !checkTarget(lv, wires, src, k)));
}

export type ConnectResult = { kind: "capo"; cid: string; t: string; index: number } | { kind: "move"; index: number; t: string; capo: boolean } | { kind: "new"; index: number };

/* applica un collegamento già controllato; restituisce cosa è successo */
function connect(lv: RulesLevel, wires: Wire[], src: Source, key: string, pick: { color: WireColor; sec: number }): ConnectResult {
  const tip = key[0] === "c",
    id = key.slice(2);
  const addCapo = (cid: string, t: string): ConnectResult => {
    const c = compById(lv, cid);
    wires.push({ a: cid + ".x", b: t, capo: true, color: c.color!, sec: c.sec! });
    return { kind: "capo", cid, t, index: wires.length - 1 };
  };
  if (src.kind === "tip") return addCapo(src.cid, id);
  if (src.kind === "grip") {
    const w = wires[src.i];
    if (w.capo) w.b = id;
    else w[src.end] = id;
    return { kind: "move", index: src.i, t: id, capo: !!w.capo };
  }
  if (tip) return addCapo(id, src.t);
  wires.push({ a: src.t, b: id, capo: false, color: pick.color, sec: pick.sec });
  return { kind: "new", index: wires.length - 1 };
}
/* rigioca una lista di collegamenti con le stesse regole del gioco: [da, a, colore?, sezione?] */
function replay(lv: RulesLevel, list: readonly WireSpec[]): { wires: Wire[]; errors: string[] } {
  const wires: Wire[] = [],
    errors: string[] = [];
  for (const [a, b, color, sec] of list) {
    const capoA = a.endsWith(".x"),
      capoB = b.endsWith(".x");
    const key = capoB ? "c:" + b.split(".")[0] : "t:" + b;
    const src: Source = capoA ? { kind: "tip", cid: a.split(".")[0] } : srcFromKey(lv, wires, "t:" + a);
    const err = sourceError(lv, wires, src) || checkTarget(lv, wires, src, key);
    if (err) {
      errors.push(`${a} → ${b}: ${err[1]}`);
      continue;
    }
    connect(lv, wires, src, key, { color: color || "marrone", sec: sec || lv.palette?.defSec || 1.5 });
  }
  return { wires, errors };
}

/** Da lista compatta a fili veri, senza passare dalle regole (per il motore e i controlli). */
function toWires(lv: RulesLevel, list: readonly WireSpec[]): Wire[] {
  return list.map(([a, b, color, sec]) => {
    const capo = a.endsWith(".x");
    const c = capo ? compById(lv, a.split(".")[0]) : null;
    return { a, b, capo, color: capo ? c!.color! : color || "marrone", sec: capo ? c!.sec! : sec || 1.5 };
  });
}

export const RULES = {
  E,
  compById,
  compOf,
  capOf,
  usedAt,
  capoWire,
  tpos,
  tdir,
  bbox,
  attachCapo,
  attachNew,
  srcFromKey,
  sourceError,
  checkTarget,
  allKeys,
  candKeys,
  connect,
  replay,
  toWires,
};
