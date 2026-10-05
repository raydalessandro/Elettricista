/* Quadri e misure ricorrenti. */
import type { Breaker, Probe } from "../core/types";

export const DIFF: Breaker = { id: "diff", label: "Differenziale", sub: "30 mA · tipo A", sub2: "25 A", w: 1.6, kind: "diff" };
export const Q_STD: Breaker[] = [
  { id: "gen", label: "Generale", w: 1.6, kind: "gen" },
  DIFF,
  { id: "luci", label: "Luci", sub: "C10" },
  { id: "prese", label: "Prese", sub: "C16" },
  { id: "cucina", label: "Cucina", sub: "C16" },
];
export const PROBES3: Probe[] = [
  { label: "Fase – Neutro", a: "L", b: "N" },
  { label: "Fase – Terra", a: "L", b: "PE" },
  { label: "Neutro – Terra", a: "N", b: "PE" },
];
