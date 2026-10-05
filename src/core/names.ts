/* ====== NOMI DEI PEZZI E DEI MORSETTI ======
   Come il gioco chiama le cose: sulla tavola, sul tester, nel registro delle misure.
   Li usano il gioco e il banco da riga di comando, così dicono le stesse parole. */

import { WIRES } from "../content/wires";
import { RULES, type RulesLevel } from "./rules";
import type { Comp, Wire } from "./types";

/** La scritta accanto al morsetto. */
export function termLabel(c: Comp, t: string): string {
  if (c.tlabel && c.tlabel[t]) return c.tlabel[t];
  if (c.kind === "presa") return t === "PE" ? "⏚" : "L/N";
  if (c.kind === "lampada") return t === "PE" ? "⏚" : t;
  return t;
}

/** Il nome del pezzo nei testi. */
export function compName(c: Comp): string {
  if (c.name) return c.name;
  if (c.kind === "lampada") return c.look || "lampada";
  if (c.kind === "presa") return c.id === "PA" ? "presa esistente" : c.id === "PB" ? "presa nuova" : "presa bipasso";
  if (c.kind === "deviatore") return c.id === "D1" ? "primo deviatore" : "secondo deviatore";
  if (c.kind === "interruttore") return c.locked ? "interruttore a muro" : "interruttore";
  if (c.kind === "invertitore") return "invertitore";
  if (c.kind === "morsetto") return "morsetto a leva";
  return c.kind;
}

/** Il nome corto, dove c'è poco spazio. */
export function shortName(c: Comp): string {
  if (c.short) return c.short;
  return ({ D1: "Dev. 1", D2: "Dev. 2", INV: "Inv.", I: "Interr.", WS: "Interr. a muro" } as Record<string, string>)[c.id] || compName(c);
}

/** La posizione di un comando, in parole. */
export function swState(c: Comp, s: number): string {
  if (c.kind === "interruttore") return s ? "acceso" : "spento";
  if (c.kind === "deviatore") return s ? "su 2" : "su 1";
  return s ? "incrociato" : "dritto";
}

/** Un morsetto descritto per intero (sulla tavola dei fili). */
export function descTerm(lv: RulesLevel, id: string): string {
  const c = RULES.compOf(lv, id),
    t = id.split(".")[1];
  if (c.kind === "capo") return `il filo ${WIRES[c.color!].label}`;
  if (c.kind === "morsetto") return `morsetto a leva, foro ${t.slice(1)}`;
  return `${compName(c)}, morsetto ${termLabel(c, t)}`;
}

/** I morsetti a leva si chiamano col colore del filo che ci entra: «il morsetto del blu». */
export function wagoName(id: string, wires: readonly Wire[]): string {
  const ws = wires.filter(w => w.a.split(".")[0] === id || w.b.split(".")[0] === id);
  const w = ws.find(x => x.capo) || ws[0];
  return w ? `morsetto del ${WIRES[w.color].label}` : "morsetto libero";
}

const side = (t: string) => (t === "PE" ? "di terra" : t === "A" ? "sinistro" : "destro");

/** Un morsetto del banco guasti, per intero: «presa nuova, morsetto sinistro». */
export function benchTermName(lv: RulesLevel, id: string, wires: readonly Wire[]): string {
  const c = RULES.compOf(lv, id),
    t = id.split(".")[1];
  if (c.kind === "morsetto") return `${wagoName(c.id, wires)}, foro ${t.slice(1)}`;
  if (c.kind === "presa") return `${compName(c)}, morsetto ${side(t)}`;
  if (c.kind === "lampada") return `${compName(c)}, morsetto ${t === "PE" ? "di terra" : t}`;
  return descTerm(lv, id);
}

/** Un morsetto del banco guasti, corto: per il tester e il registro. */
export function termShort(lv: RulesLevel, id: string, wires: readonly Wire[]): string {
  const c = RULES.compOf(lv, id),
    t = id.split(".")[1];
  switch (c.kind) {
    case "morsetto":
      return wagoName(c.id, wires);
    case "presa":
      return `${compName(c)} ${t === "PE" ? "⏚" : t === "A" ? "sinistro" : "destro"}`;
    case "lampada":
      return `${compName(c)} ${t === "PE" ? "⏚" : t}`;
    case "deviatore":
      return `${shortName(c).toLowerCase()} ${t}`;
    case "invertitore":
      return `inv. ${t}`;
    case "interruttore":
      return `interr. ${t}`;
  }
  return id;
}
