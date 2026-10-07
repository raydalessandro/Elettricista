/* ====== IL SOLE: CATEGORIE, GUIDA, POLARIZZATA ======
   Condiviso dal corso e dal gioco Diottri.
   - Categorie dei filtri (EN ISO 12312-1): quanta luce passa. La 4 non è adatta alla guida.
   - Di sera e di notte non va bene nessuna lente che lasci passare meno del 75% della luce.
   - Il riflesso dell'acqua è luce polarizzata in orizzontale (del tutto solo verso 53° dalla verticale):
     la polarizzata lo riduce molto, non sempre del tutto. Una lente scura normale abbassa tutto, riflesso compreso. */

export type Categoria = 0 | 1 | 2 | 3 | 4;
export const CATEGORIE_ELENCO: Categoria[] = [0, 1, 2, 3, 4];

export interface InfoCategoria {
  /** luce che passa: da min a max (frazione) */
  min: number;
  max: number;
  /** valore tipico, per disegnare */
  tipico: number;
  /** a cosa serve, in poche parole */
  uso: string;
}

export const CATEGORIE: Record<Categoria, InfoCategoria> = {
  0: { min: 0.8, max: 1, tipico: 0.9, uso: "chiara, appena colorata" },
  1: { min: 0.43, max: 0.8, tipico: 0.6, uso: "sole debole" },
  2: { min: 0.18, max: 0.43, tipico: 0.3, uso: "sole medio" },
  3: { min: 0.08, max: 0.18, tipico: 0.12, uso: "sole forte, mare, lago" },
  4: { min: 0.03, max: 0.08, tipico: 0.05, uso: "sole fortissimo: ghiacciaio, alta montagna" },
};

/** La categoria di una lente dalla luce che passa (frazione). */
export function categoriaDa(trasm: number): Categoria {
  for (const c of [4, 3, 2, 1] as Categoria[]) if (trasm <= CATEGORIE[c].max + 1e-9) return c;
  return 0;
}

/** Alla guida, di giorno: dalla 0 alla 3. La 4 mai. */
export const allaGuida = (c: Categoria) => c <= 3;

/** Di sera e di notte: solo lenti che lasciano passare almeno il 75% della luce. */
export const diNotte = (trasm: number) => trasm >= 0.75;

/** Quanto resta del riflesso dell'acqua dopo il filtro (frazione del riflesso senza filtro). */
export function riflessoAcqua(trasm: number, polarizzata: boolean): number {
  // la polarizzata ferma quasi tutta la parte polarizzata del riflesso; ne resta un po' (angoli diversi da 53°)
  return trasm * (polarizzata ? 0.15 : 1);
}
