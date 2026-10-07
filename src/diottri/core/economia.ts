/* ====== DIOTTRI · I CONTI DEL MONDO ======
   Per il controllo automatico e i test: quanto rende un caso giocato bene, e se i mezzi che servono per andare
   avanti si pagano con le vendite fatte prima. Usa il risolutore: non entra nell'interfaccia. */
import { esitoDi, opzioniDisponibili } from "./caso";
import { risolviCaso } from "./risolutore";
import type { CasoDef, PostoId, SpecieId } from "./tipi";
import { vendita } from "./vendita";

/**
 * Quanto rende almeno un caso giocato bene: fra tutti gli occhiali fatti solo di scelte «Bene» (con quello che si
 * scopre chiedendo), la parte di chi vende più piccola.
 */
export function provvigioneMinima(def: CasoDef, seme: number, vassoio: SpecieId[]): number {
  const st = risolviCaso(def, seme, vassoio);
  if (!vendita(def, st)) return 0;
  const posti = Object.keys(def.posti) as PostoId[];
  const scelte = posti.map(p => opzioniDisponibili(def, st, p).filter(o => esitoDi(st, o).esito === "bene").map(o => o.id));
  let min = Infinity;
  const giro = (i: number, acc: Partial<Record<PostoId, string>>) => {
    if (i === posti.length) {
      const v = vendita(def, { ...st, posti: acc });
      if (v) min = Math.min(min, v.provvigione);
      return;
    }
    for (const id of scelte[i]) giro(i + 1, { ...acc, [posti[i]]: id });
  };
  giro(0, {});
  return min === Infinity ? 0 : min;
}
