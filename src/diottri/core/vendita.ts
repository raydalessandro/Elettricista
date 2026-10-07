/* ====== DIOTTRI · LA VENDITA ======
   Un caso consegnato è un occhiale venduto: il conto voce per voce dal listino, e la parte di chi vende.
   Il cliente paga quello che gli serve: un pezzo «Va bene, ma…» più caro del necessario lo paga come il pezzo
   giusto più economico. Con un allarme non si vende: prima il medico. */
import { LENTI, MONTATURE, PROVVIGIONE, SOLE, TRATTAMENTI } from "../content/listino";
import { esitoDi, opzioniDisponibili } from "./caso";
import type { CasoDef, CasoState, Opzione, PostoId } from "./tipi";
import { opzioneDi } from "./valuta";

export interface VoceVendita {
  nome: string;
  prezzo: number;
  /** se il cliente ha pagato meno del listino: perché */
  nota?: string;
}

export interface Vendita {
  voci: VoceVendita[];
  totale: number;
  /** la parte di chi vende, in euro tondi */
  provvigione: number;
}

const POSTI: PostoId[] = ["materiale", "trattamento", "filtro", "montatura"];

/** Una scelta di un posto, come voce di listino: null se non costa niente (l'antigraffio compreso, la montatura del cliente). */
export function voceDi(def: CasoDef, posto: PostoId, o: Opzione): VoceVendita | null {
  switch (posto) {
    case "materiale": return LENTI[o.materiale ?? "cr39"] ?? LENTI.cr39!;
    case "trattamento": {
      if (o.filtroBlu) return TRATTAMENTI.filtroBlu;
      if (o.antiriflesso) return TRATTAMENTI.antiriflesso;
      return null;
    }
    case "filtro": {
      if (!o.filtro) return null;
      const s = o.filtro.polarizzata ? SOLE.polarizzata : SOLE.colorata;
      return { nome: `${s.nome}, categoria ${o.filtro.categoria}`, prezzo: s.prezzo };
    }
    case "montatura": return o.id === "sua" ? null : def.posti.filtro ? MONTATURE.sole : MONTATURE.vista;
    default: return null;
  }
}

/** Il conto dell'occhiale consegnato, o null se non c'è vendita (il caso non è consegnato, o era da medico). */
export function vendita(def: CasoDef, st: CasoState): Vendita | null {
  if (st.fine !== "consegnato" || !def.serveLente) return null;
  const voci: VoceVendita[] = [];
  for (const p of POSTI) {
    if (!def.posti[p]) continue;
    const o = opzioneDi(def, st, p);
    const v = voceDi(def, p, o);
    if (!v) continue;
    const voce: VoceVendita = { ...v };
    // un pezzo che non serviva si paga come il pezzo giusto più economico
    if (esitoDi(st, o).esito === "ok") {
      const giuste = opzioniDisponibili(def, st, p).filter(x => esitoDi(st, x).esito === "bene");
      const meno = giuste.map(x => ({ o: x, prezzo: voceDi(def, p, x)?.prezzo ?? 0 })).sort((a, b) => a.prezzo - b.prezzo)[0];
      if (meno && meno.prezzo < voce.prezzo) { voce.prezzo = meno.prezzo; voce.nota = `non serviva: pagato come «${meno.o.nome}»`; }
    }
    voci.push(voce);
  }
  if (!voci.length) voci.push(LENTI.cr39!);
  const totale = voci.reduce((s, v) => s + v.prezzo, 0);
  return { voci, totale, provvigione: Math.round(totale * PROVVIGIONE) };
}

/** Euro scritti come in negozio: «1.250 €». */
export const euro = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;
