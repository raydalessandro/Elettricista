/* ====== BANCO GUASTI: guasti, tester, sintomi ======
   Un guasto cambia l'impianto sano in tre modi: un collegamento che non fa contatto (open),
   un pezzo rotto (broken), un collegamento fatto male e visibile (rewire).
   Il tester legge tensione (linea accesa) o continuità (linea spenta) tra due morsetti. */

import { allStates, buildNets, collaudo, evaluate, switchesOf, termIds, type SwitchStates } from "./engine";
import { RULES } from "./rules";
import type { Fault, GuastoLevel, Symptom, Wire } from "./types";

export interface FaultSetup {
  /** collegamenti come si vedono sulla tavola */
  visible: Wire[];
  /** collegamenti come sono davvero */
  actual: Wire[];
  broken: Set<string>;
  /** problemi nella definizione del guasto */
  errors: string[];
}

const sameLink = (w: { a: string; b: string }, [x, y]: [string, string]) => (w.a === x && w.b === y) || (w.a === y && w.b === x);

export function healthyWires(lv: GuastoLevel): Wire[] {
  return RULES.toWires(lv, lv.wiring);
}

/** L'impianto con il guasto dentro. Senza guasto: l'impianto sano. */
export function applyFault(lv: GuastoLevel, f: Fault | null): FaultSetup {
  const errors: string[] = [];
  const visible = healthyWires(lv);
  for (const r of f?.rewire || []) {
    const i = visible.findIndex(w => sameLink(w, r.from));
    if (i < 0) errors.push(`rewire: nessun collegamento ${r.from.join(" → ")}`);
    else visible[i] = { ...visible[i], a: r.to[0], b: r.to[1] };
  }
  const actual = visible.map(w => ({ ...w }));
  for (const o of f?.open || []) {
    const i = actual.findIndex(w => sameLink(w, o));
    if (i < 0) errors.push(`open: nessun collegamento ${o.join(" → ")}`);
    else actual.splice(i, 1);
  }
  const broken = new Set(f?.broken || []);
  for (const id of broken) if (!lv.board.comps.some(c => c.id === id)) errors.push(`broken: il pezzo «${id}» non esiste`);
  return { visible, actual, broken, errors };
}

/** I punti dove si possono appoggiare i puntali. */
export function probePoints(lv: GuastoLevel): string[] {
  const out: string[] = [];
  for (const c of lv.board.comps) {
    if (c.kind === "sorgente" || c.kind === "capo" || c.locked) continue;
    for (const t of termIds(c)) out.push(`${c.id}.${t}`);
  }
  return out;
}

export interface PowerState {
  /** linea accesa al quadro */
  on: boolean;
  /** la protezione è scattata (corto o dispersione): la linea resta giù */
  tripped: "corto" | "diff" | null;
}

/** Cosa succede dando tensione in questa posizione dei comandi. */
export function powerCheck(lv: GuastoLevel, s: FaultSetup, st: SwitchStates): PowerState["tripped"] {
  const ev = evaluate(lv, s.actual, st, { broken: s.broken });
  return ev.corto ? "corto" : ev.dispersione ? "diff" : null;
}

/** Tensione tra due punti, con la linea accesa: 230 o 0. */
export function readVoltage(lv: GuastoLevel, s: FaultSetup, st: SwitchStates, a: string, b: string): number {
  const ev = evaluate(lv, s.actual, st, { broken: s.broken });
  if (ev.corto || ev.dispersione) return 0;
  const pa = ev.potOf(a),
    pb = ev.potOf(b);
  if (!pa || !pb) return 0;
  const ba = pa.replace("~", ""),
    bb = pb.replace("~", "");
  if (ba === bb) return 0;
  return ba === "L" || bb === "L" ? 230 : 0;
}

export type Continuity = "zero" | "carico" | "aperto";

/** Continuità tra due punti, con la linea spenta: stesso filo, attraverso una lampada, o niente. */
export function readContinuity(lv: GuastoLevel, s: FaultSetup, st: SwitchStates, a: string, b: string): Continuity {
  const uf = buildNets(lv, s.actual, st, { broken: s.broken });
  const na = uf.find(a),
    nb = uf.find(b);
  if (na === nb) return "zero";
  // le lampade intere collegano le due reti dei loro morsetti
  const adj = new Map<string, string[]>();
  for (const c of lv.board.comps) {
    if (c.kind !== "lampada" || s.broken.has(c.id)) continue;
    const x = uf.find(c.id + ".L"),
      y = uf.find(c.id + ".N");
    if (x === y) continue;
    adj.set(x, [...(adj.get(x) || []), y]);
    adj.set(y, [...(adj.get(y) || []), x]);
  }
  const seen = new Set([na]),
    q = [na];
  while (q.length) {
    const n = q.shift()!;
    for (const m of adj.get(n) || []) {
      if (m === nb) return "carico";
      if (!seen.has(m)) {
        seen.add(m);
        q.push(m);
      }
    }
  }
  return "aperto";
}

/** Il sintomo che vede il cliente. */
export function symptomOf(lv: GuastoLevel, s: FaultSetup): Symptom {
  const sw = switchesOf(lv);
  const states = allStates(sw);
  const evs = states.map(st => evaluate(lv, s.actual, st, { broken: s.broken }));
  if (evs.some(e => e.corto || e.dispersione)) return "salta";
  const g = lv.goal;
  if (g.type === "prese") return g.prese.every(id => evs.every(e => e.sockets[id].ok)) ? "funziona" : "presa-morta";
  const on = evs.map(e => e.lamps[g.lamp].on);
  if (on.every(x => !x)) return "spenta";
  if (on.every(Boolean) && g.mode !== "sempre") return "sempre-accesa";
  const col = collaudo(lv, s.actual, { broken: s.broken });
  return col.funziona ? "funziona" : "parziale";
}

/** Tutte le misure possibili, come testo: due guasti con la stessa firma non si distinguono. */
export function signature(lv: GuastoLevel, s: FaultSetup): Map<string, string> {
  const pts = probePoints(lv);
  const sig = new Map<string, string>();
  sig.set("vista", s.visible.map(w => [w.a, w.b].sort().join("~")).sort().join(" "));
  for (const st of allStates(switchesOf(lv))) {
    const k = JSON.stringify(st);
    sig.set(`luce ${k}`, symptomRow(lv, s, st));
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        sig.set(`V ${pts[i]} ${pts[j]} ${k}`, String(readVoltage(lv, s, st, pts[i], pts[j])));
        sig.set(`Ω ${pts[i]} ${pts[j]} ${k}`, readContinuity(lv, s, st, pts[i], pts[j]));
      }
  }
  return sig;
}

function symptomRow(lv: GuastoLevel, s: FaultSetup, st: SwitchStates): string {
  const ev = evaluate(lv, s.actual, st, { broken: s.broken });
  if (ev.corto) return "corto";
  if (ev.dispersione) return "diff";
  const g = lv.goal;
  return g.type === "lamp" ? (ev.lamps[g.lamp].on ? "accesa" : "spenta") : g.prese.map(id => (ev.sockets[id].ok ? "1" : "0")).join("");
}

/** Le misure che distinguono a da b. */
function diffKeys(a: Map<string, string>, b: Map<string, string>): string[] {
  const out: string[] = [];
  for (const [k, v] of a) if (b.get(k) !== v) out.push(k);
  return out;
}

/**
 * Quante misure servono, al minimo, per riconoscere il guasto tra gli altri del livello
 * (copertura golosa: ogni misura scelta esclude più guasti possibile).
 */
export function measuresNeeded(sigs: Map<string, Map<string, string>>, id: string): number {
  const me = sigs.get(id)!;
  const seen = (k: string) => k === "vista" || k.startsWith("luce "); // si vede senza tester
  // prima si esclude quello che si vede guardando la tavola e provando i comandi
  const left = new Set([...sigs.keys()].filter(k => k !== id && !diffKeys(me, sigs.get(k)!).some(seen)));
  let n = 0;
  while (left.size) {
    const count = new Map<string, number>();
    for (const o of left) for (const k of diffKeys(me, sigs.get(o)!)) if (!seen(k)) count.set(k, (count.get(k) || 0) + 1);
    let best = "",
      bestN = 0;
    for (const [k, c] of count) if (c > bestN) [best, bestN] = [k, c];
    if (!best) return Infinity;
    n++;
    for (const o of [...left]) if (sigs.get(o)!.get(best) !== me.get(best)) left.delete(o);
  }
  return n;
}

export interface FaultFinding {
  code: string;
  sev: "errore" | "avviso";
  msg: string;
}

/** Regole S15–S17 dello standard, per un livello del banco guasti. */
export function checkFaults(lv: GuastoLevel): FaultFinding[] {
  const out: FaultFinding[] = [];
  const add = (code: string, msg: string, sev: FaultFinding["sev"] = "errore") => out.push({ code, sev, msg });

  /* S15 · l'impianto sano funziona e passa il collaudo */
  const rep = RULES.replay({ ...lv, palette: { sections: true } }, lv.wiring);
  rep.errors.forEach(e => add("S15", "impianto sano: collegamento impossibile, " + e));
  const healthy = applyFault(lv, null);
  const col = collaudo(lv, healthy.actual);
  if (col.outcome !== "ok") add("S15", `l'impianto sano dà «${col.outcome}» ${JSON.stringify(col.issues)}`);
  if (lv.faults.length < 2) add("S15", "servono almeno due guasti, perché la diagnosi sia una scelta");
  const labels = new Set<string>();

  const sigs = new Map<string, Map<string, string>>();
  sigs.set("sano", signature(lv, healthy));
  for (const f of lv.faults) {
    const s = applyFault(lv, f);
    s.errors.forEach(e => add("S15", `guasto «${f.id}»: ${e}`));
    if (labels.has(f.label)) add("S17", `due guasti con la stessa diagnosi: «${f.label}»`);
    labels.add(f.label);
    /* S15 · il sintomo dichiarato è quello che succede davvero */
    const sym = symptomOf(lv, s);
    if (sym !== f.symptom) add("S15", `guasto «${f.id}»: dichiara il sintomo «${f.symptom}», ma l'impianto fa «${sym}»`);
    if (!f.proof || !f.where || !f.msg) add("S17", `guasto «${f.id}»: servono where, msg e proof`);
    sigs.set(f.id, signature(lv, s));
  }
  /* S16 · ogni guasto si distingue misurando dagli altri e dall'impianto sano */
  const ids = [...sigs.keys()];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) {
      if (!diffKeys(sigs.get(ids[i])!, sigs.get(ids[j])!).length) add("S16", `«${ids[i]}» e «${ids[j]}» danno le stesse misure: non si possono distinguere`);
    }
  for (const f of lv.faults) {
    const n = measuresNeeded(sigs, f.id);
    if (!Number.isFinite(n)) continue;
    if (f.minMeasures < n) add("S16", `guasto «${f.id}»: minMeasures ${f.minMeasures}, ma ne servono almeno ${n}`, "avviso");
  }
  return out;
}
