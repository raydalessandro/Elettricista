/* ====== DIOTTRI · IL RISOLUTORE ======
   Gioca un caso o un riconoscimento come lo giocherebbe un ottico bravo. Lo usano il controllo dello standard
   (ogni caso ha una soluzione da tre stelle) e i test (il robot che gioca tutto). */
import { apriProva, apriRicetta, caselleRicetta, chiedi, confermaProva, consegna, consigliaVisita, dubbioAperto, esitoDi, leggiVecchi, medico, metti, mostra, nuovoCaso, occhioProva, opzioniDisponibili, scoperto, soluzioneProva, spostaProva, toccaRicetta, usaVecchi } from "./caso";
import { nuovoRic, prova, riconosci, grandezzaGiusta } from "./riconosci";
import { bisogni, totaleTacche } from "./valuta";
import type { CasoDef, CasoState, Opzione, PostoId, ProvaId, RicState, RiconoscimentoDef, SpecieId } from "./tipi";

/** Gioca un caso da bravo. */
export function risolviCaso(def: CasoDef, seed: number, vassoio: SpecieId[]): CasoState {
  const st = nuovoCaso(def, seed, vassoio);
  for (const q of def.domande) if (!q.giaDetto && (q.chiave || q.rivela)) chiedi(def, st, q.id);
  if (def.allarme) {
    medico(def, st, def.allarme.urgenza);
    return st;
  }
  if (def.visita) consigliaVisita(def, st, def.visita);
  misura(def, st);
  costruisci(def, st);
  for (let i = 0; i < 5 && dubbioAperto(def, st); i++) {
    const d = dubbioAperto(def, st)!;
    mostra(def, st, d.mostra.find(m => m.esito === "risponde")!.id);
  }
  consegna(def, st);
  return st;
}

function misura(def: CasoDef, st: CasoState) {
  if (def.ricetta && (!def.ricetta.nascosta || scoperto(st, "ricetta"))) {
    apriRicetta(def, st);
    for (const c of caselleRicetta(def)) toccaRicetta(def, st, c);
    return;
  }
  if (def.vecchi?.vedeBene) {
    leggiVecchi(def, st);
    usaVecchi(def, st);
    return;
  }
  apriProva(def, st);
  for (const o of ["od", "os"] as const) {
    occhioProva(def, st, o);
    const target = soluzioneProva({ rx: st.occhio[o], age: st.occhio.age });
    let guard = 0;
    while (st.prova && Math.abs(st.prova.v - target) > 1e-9 && guard++ < 80) {
      const d = target - st.prova.v;
      if (!spostaProva(st, Math.abs(d) >= 1 ? Math.sign(d) : Math.sign(d) * 0.25)) break;
    }
    confermaProva(def, st);
  }
}

/** Sceglie i pezzi giusti: tra le opzioni «Bene», la combinazione che porta a zero tutte le tacche. */
function costruisci(def: CasoDef, st: CasoState) {
  const posti = Object.keys(def.posti) as PostoId[];
  const scelte = posti.map(p => opzioniDisponibili(def, st, p).filter(o => esitoDi(st, o).esito === "bene"));
  const combo = combinazioni(scelte).find(c => {
    const prova: CasoState = { ...st, posti: { ...st.posti } };
    c.forEach((o, i) => { prova.posti[posti[i]] = o.id; });
    return totaleTacche(bisogni(def, prova).filter(b => b.tipo !== "dubbio")) === 0;
  });
  if (!combo) return;
  combo.forEach((o, i) => { if (st.posti[posti[i]] !== o.id) metti(def, st, posti[i], o.id); });
}

function combinazioni(xs: Opzione[][]): Opzione[][] {
  return xs.reduce<Opzione[][]>((acc, opts) => acc.flatMap(c => opts.map(o => [...c, o])), [[]]);
}

/** Riconosce un Diottro da bravo: le prove utili, poi la risposta giusta. */
export function risolviRic(def: RiconoscimentoDef, seed: number): RicState {
  const st = nuovoRic(def, seed);
  const utili = (Object.keys(def.prove) as ProvaId[]).filter(p => def.prove[p] === "utile" && !(p === "caldo" && def.specie === "cello"));
  for (const p of utili) prova(def, st, p);
  riconosci(def, st, def.specie, grandezzaGiusta(def, st));
  return st;
}
