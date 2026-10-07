/* ====== DIOTTRI · GLI OGGETTI ======
   Gli oggetti sopra il terreno, fuori (oggetti_fuori.ts), dentro la bottega (oggetti_dentro.ts) e i negozi
   (oggetti_negozi.ts), in un elenco solo. */
import type { Oggetto, Tavolozza } from "./formato";
import { OGGETTI_DENTRO, TAVOLOZZE_DENTRO } from "./oggetti_dentro";
import { OGGETTI_FUORI, TAVOLOZZE_FUORI } from "./oggetti_fuori";
import { OGGETTI_NEGOZI, TAVOLOZZE_NEGOZI } from "./oggetti_negozi";
import type { Luce } from "./tavolozze";

export const OGGETTI: Record<string, Oggetto> = { ...OGGETTI_FUORI, ...OGGETTI_DENTRO, ...OGGETTI_NEGOZI };

const unisci = (...ts: Partial<Record<Luce, Record<string, Tavolozza>>>[]) => {
  const out: Partial<Record<Luce, Record<string, Tavolozza>>> = {};
  for (const t of ts) for (const [l, v] of Object.entries(t) as [Luce, Record<string, Tavolozza>][]) out[l] = { ...(out[l] ?? {}), ...v };
  return out;
};

export const TAVOLOZZE_OGGETTI = unisci(TAVOLOZZE_FUORI, TAVOLOZZE_DENTRO, TAVOLOZZE_NEGOZI);
