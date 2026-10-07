/* ====== DIOTTRI · IL LISTINO DEL BORGO ======
   Quanto costa l'occhiale che si consegna, voce per voce come in negozio: le lenti (la coppia, con l'indurente
   antigraffio sempre compreso) secondo il materiale, i trattamenti, le lenti da sole, la montatura se è nuova.
   Prezzi di gioco, IVA compresa, in euro tondi: il sito è pubblico, i listini veri dei negozi qui non entrano.
   Chi vende prende il 20% dell'occhiale venduto. */
import type { MaterialeId } from "../../ottica/core/lente";

/** La parte di chi vende. */
export const PROVVIGIONE = 0.2;

export interface VoceListino {
  nome: string;
  prezzo: number;
}

/** Le lenti monofocali, la coppia. */
export const LENTI: Partial<Record<MaterialeId, VoceListino>> = {
  cr39: { nome: "Lenti organiche 1,5", prezzo: 60 },
  i160: { nome: "Lenti organiche 1,6", prezzo: 100 },
  i167: { nome: "Lenti organiche 1,67", prezzo: 160 },
  i174: { nome: "Lenti organiche 1,74", prezzo: 240 },
  pc: { nome: "Lenti in policarbonato", prezzo: 90 },
};

export const TRATTAMENTI = {
  antiriflesso: { nome: "Antiriflesso", prezzo: 60 },
  filtroBlu: { nome: "Filtro luce blu", prezzo: 80 },
} satisfies Record<string, VoceListino>;

/** Le lenti da sole graduate: il colore di una categoria, o la polarizzata. */
export const SOLE = {
  colorata: { nome: "Da sole", prezzo: 40 },
  polarizzata: { nome: "Polarizzata", prezzo: 110 },
} satisfies Record<string, VoceListino>;

/** La montatura, quando non è quella del cliente. */
export const MONTATURE = {
  vista: { nome: "Montatura nuova", prezzo: 120 },
  sole: { nome: "Montatura da sole", prezzo: 130 },
} satisfies Record<string, VoceListino>;
