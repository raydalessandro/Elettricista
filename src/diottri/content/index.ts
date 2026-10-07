/* I contenuti di Diottri: casi, riconoscimenti, specie, e l'ordine in cui si giocano. */
import { CASI, ORDINE } from "./casi";
import { RICONOSCIMENTI } from "./riconoscimenti";
import { INTRO_PROVE, SPECIE, VASSOIO_INIZIO } from "./specie";
import type { SpecieId } from "../core/tipi";

export { CASI, INTRO_PROVE, ORDINE, RICONOSCIMENTI, SPECIE, VASSOIO_INIZIO };

/** Il vassoio prima di un passo dell'ordine, se si sono fatti tutti i riconoscimenti prima. */
export function vassoioPrima(id: string): SpecieId[] {
  const out = [...VASSOIO_INIZIO];
  for (const p of ORDINE) {
    if (p.id === id) break;
    if (p.tipo === "ric") {
      const r = RICONOSCIMENTI.find(x => x.id === p.id)!;
      if (!out.includes(r.specie)) out.push(r.specie);
    }
  }
  return out;
}
