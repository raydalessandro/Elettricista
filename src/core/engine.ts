/* ====== MOTORE: reti, potenziali, collaudo ======
   Ogni morsetto è un nodo. Fili, morsetti a leva e contatti chiusi uniscono i nodi in "reti".
   Ogni rete prende un potenziale: L (fase), N (neutro), PE (terra), oppure lo riceve attraverso
   un carico ("L~": in tensione attraverso la lampada, senza corrente). Il collaudo prova tutte
   le combinazioni dei comandi. */

import type { Board, Comp, Goal, Wire } from "./types";

export const SWITCH_KINDS = ["interruttore", "deviatore", "invertitore"] as const;
export const LOAD_KINDS = ["lampada", "presa"] as const;
export const PHASE_COLORS = ["marrone", "nero", "grigio"] as const;

/** Un collegamento tra due morsetti: basta questo al motore. */
export interface Link {
  a: string;
  b: string;
}

export interface EngineLevel {
  board: Board;
  goal: Goal;
  minSec?: number;
}

/** Stato dei comandi: 0 o 1 per ogni interruttore, deviatore, invertitore. */
export type SwitchStates = Record<string, number>;

export interface EvalOptions {
  /** pezzi rotti: lampadina bruciata, interruttore che non chiude */
  broken?: ReadonlySet<string>;
  /** prese vuote, senza niente attaccato: non portano tensione da un foro all'altro (misure col tester) */
  emptySockets?: boolean;
}

/** Potenziale di una rete. "L~" = in tensione attraverso un carico. */
export type Pot = "L" | "N" | "PE" | "L~" | "N~" | "PE~";

export interface LoadInfo {
  on: boolean;
  live: boolean;
  a: Pot | null;
  b: Pot | null;
  earth?: boolean;
  peLive?: boolean;
  ok?: boolean;
}

export interface Evaluation {
  corto: boolean;
  terraFase: boolean;
  neutroTerra: boolean;
  dispersione: boolean;
  lamps: Record<string, LoadInfo>;
  sockets: Record<string, LoadInfo>;
  potOf: (term: string) => Pot | null;
  netOf: (term: string) => string;
  nL: string;
  nN: string;
  nPE: string;
}

export function termIds(c: Comp): string[] {
  switch (c.kind) {
    case "sorgente":
      return ["L", "N", "PE"];
    case "capo":
      return ["x"];
    case "morsetto":
      return Array.from({ length: c.slots || 0 }, (_, i) => "s" + (i + 1));
    case "presa":
      return ["A", "PE", "B"];
    case "lampada":
      return c.classe1 ? ["L", "N", "PE"] : ["L", "N"];
    case "interruttore":
      return ["1", "2"];
    case "deviatore":
      return ["C", "1", "2"];
    case "invertitore":
      return ["1", "2", "3", "4"];
  }
  return [];
}

export function makeUF() {
  const parent = new Map<string, string>();
  function find(x: string): string {
    if (!parent.has(x)) parent.set(x, x);
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    let c = x;
    while (parent.get(c) !== r) {
      const n = parent.get(c)!;
      parent.set(c, r);
      c = n;
    }
    return r;
  }
  function union(a: string, b: string) {
    const ra = find(a),
      rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }
  return { find, union };
}

export function loadEnds(c: Comp): [string, string] {
  return c.kind === "presa" ? ["A", "B"] : ["L", "N"];
}
const baseOf = (p: Pot | null | undefined) => (p ? (p.replace("~", "") as "L" | "N" | "PE") : p);

/** Unisce in reti tutto ciò che è collegato: fili, morsetti a leva, contatti chiusi. */
export function buildNets(lv: EngineLevel, wires: readonly Link[], states?: SwitchStates, opts?: EvalOptions) {
  const comps = lv.board.comps;
  const broken = opts?.broken;
  const uf = makeUF();
  for (const c of comps) for (const t of termIds(c)) uf.find(c.id + "." + t);
  for (const c of comps) {
    if (c.kind !== "morsetto") continue;
    const ts = termIds(c);
    for (let i = 1; i < ts.length; i++) uf.union(c.id + "." + ts[0], c.id + "." + ts[i]);
  }
  for (const w of lv.board.fixed || []) uf.union(w.a, w.b);
  for (const w of wires) uf.union(w.a, w.b);
  for (const c of comps) {
    const s = (states && states[c.id]) || 0,
      p = c.id + ".";
    if (c.kind === "interruttore" && s && !broken?.has(c.id)) uf.union(p + "1", p + "2");
    if (c.kind === "deviatore") uf.union(p + "C", p + (s ? "2" : "1"));
    if (c.kind === "invertitore") {
      if (s) {
        uf.union(p + "1", p + "4");
        uf.union(p + "2", p + "3");
      } else {
        uf.union(p + "1", p + "3");
        uf.union(p + "2", p + "4");
      }
    }
  }
  return uf;
}

export function evaluate(lv: EngineLevel, wires: readonly Link[], states?: SwitchStates, opts?: EvalOptions): Evaluation {
  const comps = lv.board.comps;
  const broken = opts?.broken;
  const uf = buildNets(lv, wires, states, opts);
  const src = comps.find(c => c.kind === "sorgente")!.id;
  const nL = uf.find(src + ".L"),
    nN = uf.find(src + ".N"),
    nPE = uf.find(src + ".PE");
  const pot = new Map<string, Pot>();
  pot.set(nPE, "PE");
  pot.set(nN, "N");
  pot.set(nL, "L");

  // un carico integro porta il potenziale dall'altra parte, senza corrente ("~")
  const loads = comps.filter(c => (LOAD_KINDS as readonly string[]).includes(c.kind));
  // una presa conduce solo se c'è un apparecchio attaccato (di solito sì: il cliente la usa)
  const idle = (c: Comp) => !!opts?.emptySockets && c.kind === "presa";
  const conducting = loads.filter(c => !broken?.has(c.id) && !idle(c));
  let changed = true,
    guard = 0;
  while (changed && guard++ < 60) {
    changed = false;
    for (const c of conducting) {
      const [x, y] = loadEnds(c).map(t => uf.find(c.id + "." + t));
      const px = pot.get(x),
        py = pot.get(y);
      if (px && !py) {
        pot.set(y, (baseOf(px) + "~") as Pot);
        changed = true;
      } else if (py && !px) {
        pot.set(x, (baseOf(py) + "~") as Pot);
        changed = true;
      }
    }
  }

  const potOf = (term: string) => pot.get(uf.find(term)) || null;
  const res: Evaluation = {
    corto: nL === nN,
    terraFase: nL === nPE && nL !== nN,
    neutroTerra: nN === nPE && nL !== nN,
    dispersione: false,
    lamps: {},
    sockets: {},
    potOf,
    netOf: (t: string) => uf.find(t),
    nL,
    nN,
    nPE,
  };
  let anyCurrent = false;
  for (const c of loads) {
    const [ta, tb] = loadEnds(c).map(t => c.id + "." + t);
    const a = potOf(ta),
      b = potOf(tb);
    const pair = [a || "-", b || "-"].sort().join("|");
    const whole = !broken?.has(c.id) && !idle(c);
    const on = whole && !res.corto && pair === "L|N";
    const toEarth = whole && !res.corto && pair === "L|PE";
    if (on || toEarth) anyCurrent = true;
    if (toEarth) res.dispersione = true;
    const live = [a, b].some(v => v && v[0] === "L");
    const info: LoadInfo = { on: on || toEarth, live, a, b };
    if (c.kind === "presa" || c.classe1) {
      const pe = potOf(c.id + ".PE");
      info.earth = pe === "PE";
      info.peLive = !!pe && pe[0] === "L";
    }
    if (c.kind === "presa") {
      // la presa "funziona" se tra i due fori ci sono fase e neutro (il carico è l'apparecchio)
      info.ok = !res.corto && pair === "L|N";
      res.sockets[c.id] = info;
    } else res.lamps[c.id] = info;
  }
  if (res.terraFase) res.dispersione = true;
  if (res.neutroTerra && anyCurrent) res.dispersione = true;
  return res;
}

export function switchesOf(lv: EngineLevel): string[] {
  return lv.board.comps.filter(c => (SWITCH_KINDS as readonly string[]).includes(c.kind)).map(c => c.id);
}

export function isCapoTerm(lv: EngineLevel, term: string): boolean {
  const id = term.split(".")[0];
  const c = lv.board.comps.find(k => k.id === id);
  return !!c && c.kind === "capo";
}

export interface Issue {
  key: string;
  sev: number;
  comp?: string;
  n?: number;
}

export interface CollaudoRow {
  st: SwitchStates;
  ev: Evaluation;
}

export interface CollaudoResult {
  sw: string[];
  rows: CollaudoRow[];
  issues: Issue[];
  corto: boolean;
  dispersione: boolean;
  funziona: boolean;
  anyOn: boolean;
  cortoRows: SwitchStates[];
  dispWhy?: "fase" | "neutro" | "carico";
  lampOn?: boolean[];
  preseOk?: Record<string, boolean>;
  outcome: "ok" | "nonregola" | "sbagliato" | "spento" | "corto" | "diff";
}

/** Tutte le combinazioni dei comandi, in ordine: il bit i è il comando i. */
export function allStates(sw: readonly string[]): SwitchStates[] {
  const out: SwitchStates[] = [];
  for (let m = 0; m < 1 << sw.length; m++) {
    const st: SwitchStates = {};
    sw.forEach((id, i) => {
      st[id] = (m >> i) & 1;
    });
    out.push(st);
  }
  return out;
}

export function collaudo(lv: EngineLevel, wires: readonly Wire[], opts?: EvalOptions): CollaudoResult {
  const sw = switchesOf(lv);
  const n = sw.length;
  const rows: CollaudoRow[] = allStates(sw).map(st => ({ st, ev: evaluate(lv, wires, st, opts) }));
  const g = lv.goal;
  const out: CollaudoResult = {
    sw,
    rows,
    issues: [],
    corto: rows.some(r => r.ev.corto),
    dispersione: rows.some(r => r.ev.dispersione),
    funziona: false,
    anyOn: false,
    cortoRows: rows.filter(r => r.ev.corto).map(r => r.st),
    outcome: "ok",
  };
  if (out.dispersione) {
    const r = rows.find(x => x.ev.dispersione)!;
    out.dispWhy = r.ev.terraFase ? "fase" : r.ev.neutroTerra ? "neutro" : "carico";
  }

  if (g.type === "lamp") {
    const on = rows.map(r => r.ev.lamps[g.lamp].on && !r.ev.corto && !r.ev.dispersione);
    out.lampOn = on;
    out.anyOn = rows.some(r => r.ev.lamps[g.lamp].on);
    let f: boolean;
    if (g.mode === "sempre") f = on.every(Boolean);
    else if (g.mode === "segue") f = rows.every((r, i) => on[i] === !!r.st[g.sw!]);
    else {
      f = on.some(Boolean);
      for (let a = 0; a < rows.length && f; a++) {
        for (let b = 0; b < n; b++) {
          if (on[a] === on[a ^ (1 << b)]) {
            f = false;
            break;
          }
        }
      }
    }
    out.funziona = f && !out.corto && !out.dispersione;
  } else {
    const ok = g.prese.map(id => rows.every(r => r.ev.sockets[id].ok));
    out.preseOk = {};
    g.prese.forEach((id, i) => {
      out.preseOk![id] = ok[i];
    });
    out.anyOn = g.prese.some(id => rows.some(r => r.ev.sockets[id].ok));
    out.funziona = ok.every(Boolean) && !out.corto && !out.dispersione;
  }

  const issues = out.issues;
  const clean = rows.filter(r => !r.ev.corto && !r.ev.terraFase && !r.ev.neutroTerra);

  // 1. lampada in tensione a luce spenta (interruttore sul neutro)
  if (g.type === "lamp" && g.mode !== "sempre") {
    const bad = clean.some(r => {
      const L = r.ev.lamps[g.lamp];
      return !L.on && L.live;
    });
    if (bad) issues.push({ key: "neutro", sev: 3 });
  }
  // 2. terra
  const needEarth = lv.board.comps.filter(c => c.kind === "presa" || (c.kind === "lampada" && c.classe1));
  for (const c of needEarth) {
    const r0 = clean[0] || rows[0];
    const info = c.kind === "presa" ? r0.ev.sockets[c.id] : r0.ev.lamps[c.id];
    if (
      rows.some(r => {
        const i = c.kind === "presa" ? r.ev.sockets[c.id] : r.ev.lamps[c.id];
        return i.peLive;
      })
    ) {
      issues.push({ key: "terraViva", sev: 3, comp: c.id });
    } else if (!info.earth) {
      issues.push({ key: "terra", sev: 2, comp: c.id });
    }
  }
  // 3. capi lasciati liberi
  const visibleFixed = (lv.board.fixed || []).filter(w => w.vis);
  for (const c of lv.board.comps.filter(k => k.kind === "capo")) {
    const t = c.id + ".x";
    const used = wires.some(w => w.a === t || w.b === t) || visibleFixed.some(w => w.a === t || w.b === t);
    if (used) continue;
    const live = rows.some(r => {
      const p = r.ev.potOf(t);
      return p && p[0] === "L";
    });
    issues.push({ key: live ? "capoVivo" : "capoLibero", sev: live ? 3 : 1, comp: c.id });
  }
  // 4. colori dei fili nuovi
  if (clean.length) {
    const wrong: Record<string, number> = { gvAltro: 0, terraColore: 0, neutroColore: 0, faseBlu: 0 };
    for (const w of wires) {
      if (w.capo) continue;
      let pe = false,
        nn = false,
        ll = false;
      for (const r of clean) {
        const p = r.ev.potOf(w.a);
        if (p === "PE") pe = true;
        else if (p === "N") nn = true;
        else if (p && p[0] === "L") ll = true;
      }
      const role = pe ? "PE" : nn ? "N" : ll ? "F" : null;
      if (!role) continue;
      if (w.color === "gv" && role !== "PE") wrong.gvAltro++;
      else if (role === "PE" && w.color !== "gv") wrong.terraColore++;
      else if (role === "N" && w.color !== "blu") wrong.neutroColore++;
      else if (role === "F" && w.color === "blu") wrong.faseBlu++;
    }
    for (const k of Object.keys(wrong)) if (wrong[k]) issues.push({ key: k, sev: k === "gvAltro" || k === "terraColore" ? 3 : 2, n: wrong[k] });
  }
  // 5. sezione
  const thin = wires.filter(w => !w.capo && w.sec < (lv.minSec || 0)).length;
  if (thin) issues.push({ key: "sezione", sev: 2, n: thin });

  issues.sort((a, b) => b.sev - a.sev);
  out.outcome = out.corto ? "corto" : out.dispersione ? "diff" : !out.anyOn ? "spento" : !out.funziona ? "sbagliato" : issues.length ? "nonregola" : "ok";
  return out;
}
