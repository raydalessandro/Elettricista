/* ====== BANCO GUASTI: guasti, tester, sintomi ======
   Un guasto cambia l'impianto sano in tre modi: un collegamento che non fa contatto (open),
   un pezzo rotto (broken), un collegamento fatto male e visibile (rewire).
   Un «guasto» con none: true è la risposta «nessun difetto»: l'impianto sano.
   Il tester legge tensione (linea accesa) o continuità (linea spenta) tra due morsetti.
   Sul banco le prese sono vuote: per misurare si stacca quello che c'è attaccato. */

import { allStates, buildNets, collaudo, evaluate, switchesOf, termIds, type SwitchStates } from "./engine";
import { RULES } from "./rules";
import type { Fault, GuastoLevel, Symptom, Wire } from "./types";

export interface FaultSetup {
  /** il livello come è davvero: i collegamenti fissi interrotti non ci sono */
  lv: GuastoLevel;
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
  let fixed = lv.board.fixed || [];
  for (const o of f?.open || []) {
    const i = actual.findIndex(w => sameLink(w, o));
    if (i >= 0) {
      actual.splice(i, 1);
      continue;
    }
    // anche un collegamento già fatto (un filo che arriva dal quadro) può non fare contatto
    const k = fixed.findIndex(w => sameLink(w, o));
    if (k < 0) errors.push(`open: nessun collegamento ${o.join(" → ")}`);
    else fixed = fixed.filter((_, j) => j !== k);
  }
  const broken = new Set(f?.broken || []);
  for (const id of broken) if (!lv.board.comps.some(c => c.id === id)) errors.push(`broken: il pezzo «${id}» non esiste`);
  const real = fixed === lv.board.fixed ? lv : { ...lv, board: { ...lv.board, fixed } };
  return { lv: real, visible, actual, broken, errors };
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
export function powerCheck(s: FaultSetup, st: SwitchStates): PowerState["tripped"] {
  const ev = evaluate(s.lv, s.actual, st, { broken: s.broken });
  return ev.corto ? "corto" : ev.dispersione ? "diff" : null;
}

/** Tensione tra due punti, con la linea accesa: 230 o 0. */
export function readVoltage(s: FaultSetup, st: SwitchStates, a: string, b: string): number {
  const ev = evaluate(s.lv, s.actual, st, { broken: s.broken, emptySockets: true });
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
export function readContinuity(s: FaultSetup, st: SwitchStates, a: string, b: string): Continuity {
  const lv = s.lv;
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
export function symptomOf(s: FaultSetup): Symptom {
  const lv = s.lv;
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
export function signature(s: FaultSetup): Map<string, string> {
  const lv = s.lv;
  const pts = probePoints(lv);
  const sig = new Map<string, string>();
  sig.set("vista", s.visible.map(w => [w.a, w.b].sort().join("~")).sort().join(" "));
  for (const st of allStates(switchesOf(lv))) {
    const k = JSON.stringify(st);
    sig.set(`luce ${k}`, symptomRow(s, st));
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        sig.set(`V ${pts[i]} ${pts[j]} ${k}`, String(readVoltage(s, st, pts[i], pts[j])));
        sig.set(`Ω ${pts[i]} ${pts[j]} ${k}`, readContinuity(s, st, pts[i], pts[j]));
      }
  }
  return sig;
}

function symptomRow(s: FaultSetup, st: SwitchStates): string {
  const ev = evaluate(s.lv, s.actual, st, { broken: s.broken });
  if (ev.corto) return "corto";
  if (ev.dispersione) return "diff";
  const g = s.lv.goal;
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
export function measuresNeeded(sigs: Map<string, Map<string, string>>, id: string, lampGoal = true): number {
  const me = sigs.get(id)!;
  // senza tester si vede solo la lampada, accesa o spenta: i colori guidano, ma non provano
  const seen = (k: string) => lampGoal && k.startsWith("luce ");
  // prima si esclude quello che si vede guardando la tavola e provando i comandi
  // due impianti identici (il sano e «nessun difetto») non vanno distinti: li segnala S16 se serve
  const left = new Set([...sigs.keys()].filter(k => k !== id && diffKeys(me, sigs.get(k)!).length > 0 && !diffKeys(me, sigs.get(k)!).some(seen)));
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
  sigs.set("sano", signature(healthy));
  const nones = lv.faults.filter(f => f.none);
  if (nones.length > 1) add("S15", "al massimo una risposta «nessun difetto» per livello");
  for (const f of lv.faults) {
    const s = applyFault(lv, f);
    s.errors.forEach(e => add("S15", `guasto «${f.id}»: ${e}`));
    if (f.none && (f.open?.length || f.broken?.length || f.rewire?.length)) add("S15", `«${f.id}» è «nessun difetto»: non può cambiare l'impianto`);
    if (labels.has(f.label)) add("S17", `due guasti con la stessa diagnosi: «${f.label}»`);
    labels.add(f.label);
    /* S15 · il sintomo dichiarato è quello che succede davvero */
    const sym = symptomOf(s);
    if (sym !== f.symptom) add("S15", `guasto «${f.id}»: dichiara il sintomo «${f.symptom}», ma l'impianto fa «${sym}»`);
    if (!f.proof || (!f.where && !f.none) || !f.msg) add("S17", `guasto «${f.id}»: servono where, msg e proof`);
    sigs.set(f.id, signature(s));
  }
  /* S16 · ogni guasto si distingue misurando dagli altri e dall'impianto sano
     («nessun difetto» è l'impianto sano: con quello non si confronta) */
  const ids = [...sigs.keys()];
  const isNone = (id: string) => !!lv.faults.find(f => f.id === id)?.none;
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) {
      if ((ids[i] === "sano" && isNone(ids[j])) || (ids[j] === "sano" && isNone(ids[i]))) continue;
      if (!diffKeys(sigs.get(ids[i])!, sigs.get(ids[j])!).length) add("S16", `«${ids[i]}» e «${ids[j]}» danno le stesse misure: non si possono distinguere`);
    }
  for (const f of lv.faults) {
    const n = measuresNeeded(sigs, f.id, lv.goal.type === "lamp");
    if (!Number.isFinite(n)) continue;
    if (f.minMeasures < n) add("S16", `guasto «${f.id}»: minMeasures ${f.minMeasures}, ma ne servono almeno ${n}`, "avviso");
  }
  return out;
}

/* ====== LA PROVA: le misure fatte dimostrano la diagnosi? ======
   Una diagnosi è dimostrata quando:
   - nessun'altra risposta del livello si accorda con quello che il giocatore sa davvero: la chiamata del cliente,
     la luce nelle posizioni che ha provato (a linea accesa) e le misure che ha fatto. I colori e i morsetti
     guidano lo sguardo ma non provano niente: i colori possono mentire, e un difetto che si vede si conferma col tester;
   - almeno una misura conta: legge qualcosa di diverso dall'impianto sano, oppure esclude una risposta che chiamata
     e luce lasciavano aperta (salvo «nessun difetto», che non ha un difetto da mostrare);
   - il tester è stato provato su una presa viva, prima di fidarsi delle letture. */

/** Una misura fatta: tensione (con la linea accesa) o continuità (con la linea spenta), in una posizione dei comandi. */
export interface Observation {
  mode: "V" | "Ω";
  a: string;
  b: string;
  st: SwitchStates;
}

/** Cosa legge il tester in quella misura: "230", "0", oppure "zero", "carico", "aperto". */
export function observe(s: FaultSetup, o: Observation): string {
  return o.mode === "V" ? String(readVoltage(s, o.st, o.a, o.b)) : readContinuity(s, o.st, o.a, o.b);
}

const visKey = (s: FaultSetup) => s.visible.map(w => [w.a, w.b].sort().join("~")).sort().join(" ");
/** Come si comporta la luce nelle posizioni viste (le prese non si vedono: si misurano). */
const lightKey = (s: FaultSetup, seen: readonly string[]) => (s.lv.goal.type === "lamp" ? seen.map(k => symptomRow(s, JSON.parse(k))).join(",") : "");

export interface ProofInput {
  obs: readonly Observation[];
  /** posizioni dei comandi in cui, a linea accesa, si è vista la luce (JSON degli stati) */
  seen?: readonly string[];
  /** il tester è stato provato su una presa viva */
  tester?: boolean;
}

export interface ProofCheck {
  /** le altre risposte che quello che si sa non esclude ancora */
  alt: Fault[];
  /** nessuna misura fa vedere il difetto: lo si vede o lo si deduce, ma il tester non l'ha mostrato */
  noDefect: boolean;
  /** il tester non è stato provato */
  noTester: boolean;
  proven: boolean;
}

/** Le misure fatte dimostrano la diagnosi giusta? E se no, cosa manca. */
export function checkProof(lv: GuastoLevel, truth: Fault, p: ProofInput): ProofCheck {
  const real = applyFault(lv, truth),
    healthy = applyFault(lv, null);
  const seen = p.seen || [];
  const got = p.obs.map(o => observe(real, o));
  // le risposte che la chiamata e la luce vista lasciano aperte: si chiudono solo misurando
  const open = lv.faults
    .filter(f => f.id !== truth.id && f.msg === truth.msg)
    .map(f => ({ f, s: applyFault(lv, f) }))
    .filter(x => lightKey(x.s, seen) === lightKey(real, seen));
  const alt = open.filter(x => p.obs.every((o, i) => observe(x.s, o) === got[i])).map(x => x.f);
  const counts = p.obs.some((o, i) => observe(healthy, o) !== got[i] || open.some(x => observe(x.s, o) !== got[i]));
  const noDefect = !truth.none && !counts;
  const noTester = !p.tester;
  return { alt, noDefect, noTester, proven: !alt.length && !noDefect && !noTester };
}

/** Le altre risposte che le misure fatte non escludono ancora (con quello che si vede e la luce in tutte le posizioni). */
export function stillPossible(lv: GuastoLevel, truth: Fault, obs: readonly Observation[]): Fault[] {
  const all = allStates(switchesOf(lv)).map(st => JSON.stringify(st));
  return checkProof(lv, truth, { obs, seen: all, tester: true }).alt;
}

const orList = (xs: string[]) => (xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " o " + xs[xs.length - 1]);

/** Cosa manca alla prova, in parole (vuoto se è dimostrata). */
export function proofGaps(c: ProofCheck): string[] {
  const out: string[] = [];
  if (c.alt.length) out.push(`con la luce che hai visto e le misure che hai fatto poteva essere anche ${orList(c.alt.map(f => `«${f.label}»`))}`);
  if (c.noDefect) out.push("nessuna tua misura lo conferma: colori e luce dicono dove guardare, la prova è il tester");
  if (c.noTester) out.push("non hai provato il tester su una presa viva prima di misurare: è l'abitudine che ti salva il giorno in cui il tester è guasto");
  return out;
}

export type Contradiction = { kind: "misura"; o: Observation; got: string; would: string } | { kind: "chiamata" } | { kind: "vista" } | { kind: "luce" };

/** Perché la diagnosi scelta non può essere: la prima cosa misurata, raccontata o vista che la smentisce (null: niente, finora). */
export function contradiction(lv: GuastoLevel, truth: Fault, pick: Fault, obs: readonly Observation[], seen: readonly string[] = []): Contradiction | null {
  const real = applyFault(lv, truth),
    alt = applyFault(lv, pick);
  for (const o of obs) {
    const got = observe(real, o),
      would = observe(alt, o);
    if (got !== would) return { kind: "misura", o, got, would };
  }
  if (pick.msg !== truth.msg) return { kind: "chiamata" };
  if (visKey(real) !== visKey(alt)) return { kind: "vista" };
  if (lightKey(real, seen) !== lightKey(alt, seen)) return { kind: "luce" };
  return null;
}

/** Una lettura in parole, come sul tester. */
export function readingWords(r: string): string {
  return ({ zero: "suona (0 Ω)", carico: "38 Ω", aperto: "OL" } as Record<string, string>)[r] || `${r} V`;
}

/** La spiegazione di una diagnosi sbagliata, in parole. describe dice dove e come è stata fatta la misura. */
export function wrongText(c: Contradiction | null, pick: Fault, describe: (o: Observation) => string): string {
  const it = pick.none ? "se fosse tutto a posto" : "con quel guasto";
  if (!c) return "Non è questo, anche se quello che hai visto e misurato non lo escludeva ancora. Cerca la misura che distingue una risposta dall'altra: dove una darebbe tensione e l'altra no.";
  if (c.kind === "chiamata") return `Non può essere: ${it}, il cliente ti avrebbe raccontato un'altra cosa.`;
  if (c.kind === "vista") return `Non può essere: ${it}, i fili sulla tavola sarebbero collegati in un altro modo. Guarda colori e morsetti.`;
  if (c.kind === "luce") return `Non può essere: ${it}, nelle posizioni che hai provato la luce avrebbe fatto un'altra cosa.`;
  return `Non può essere: ${describe(c.o)} hai letto ${readingWords(c.got)}; ${it} avresti letto ${readingWords(c.would)}.`;
}
