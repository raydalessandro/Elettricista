/* Diottri: le regole del caso e del riconoscimento, il risolutore, i testi nel riquadro, l'elenco nero. */
import { describe, expect, it } from "vitest";
import { CASI, ORDINE, RICONOSCIMENTI, SPECIE, VASSOIO_INIZIO, vassoioPrima } from "../../src/diottri/content";
import * as K from "../../src/diottri/core/caso";
import * as R from "../../src/diottri/core/riconosci";
import { risolviCaso, risolviRic } from "../../src/diottri/core/risolutore";
import { pick, quarti, rng } from "../../src/diottri/core/rng";
import type { CasoDef, CasoState, Msg, PostoId, ProvaId, RicState, RiconoscimentoDef } from "../../src/diottri/core/tipi";
import { bisogni, totaleTacche } from "../../src/diottri/core/valuta";
import { ELENCO_NERO, nelNero, righe, stanno, validateDiottri } from "../../src/diottri/standard/validate";

const caso = (id: string) => CASI.find(c => c.id === id)!;
const ric = (id: string) => RICONOSCIMENTI.find(r => r.id === id)!;
const ultimo = (st: { log: Msg[] }) => st.log[st.log.length - 1];
const SEMI = Array.from({ length: 40 }, (_, i) => i + 1);

/** Porta la prova lenti di un occhio al valore v, coi passi dei bottoni. */
function portaA(st: CasoState, v: number) {
  for (let g = 0; g < 80 && Math.abs(st.prova!.v - v) > 1e-9; g++) {
    const d = v - st.prova!.v;
    if (!K.spostaProva(st, Math.abs(d) >= 1 ? Math.sign(d) : Math.sign(d) * 0.25)) throw new Error(`la prova non arriva a ${v}`);
  }
}

/** Misura con la prova lenti, da bravi. */
function provaGiusta(def: CasoDef, st: CasoState) {
  K.apriProva(def, st);
  for (const o of ["od", "os"] as const) {
    K.occhioProva(def, st, o);
    portaA(st, K.soluzioneProva({ rx: st.occhio[o], age: st.occhio.age }));
    K.confermaProva(def, st);
  }
}

describe("Diottri · lo standard", () => {
  it("non trova errori nei contenuti", () => {
    const err = validateDiottri().filter(f => f.sev === "errore");
    expect(err.map(f => `${f.lv} ${f.code} ${f.msg}`)).toEqual([]);
  });

  it("l'ordine alterna casi e riconoscimenti, e ogni passo c'è una volta", () => {
    expect(ORDINE.length).toBe(CASI.length + RICONOSCIMENTI.length);
    expect(new Set(ORDINE.map(o => o.id)).size).toBe(ORDINE.length);
    expect(ORDINE[0]).toEqual({ tipo: "caso", id: "c1" });
  });

  it("il vassoio cresce con i riconoscimenti fatti prima", () => {
    expect(vassoioPrima("c1")).toEqual(VASSOIO_INIZIO);
    expect(vassoioPrima("c2")).toContain("bombo");
    expect(vassoioPrima("c3")).toContain("verdino");
    expect(vassoioPrima("c4")).toContain("polare");
  });
});

describe("Diottri · il risolutore", () => {
  it("finisce ogni caso con tre stelle, in ogni variante", () => {
    for (const c of CASI) for (const seed of SEMI) {
      const st = risolviCaso(c, seed, vassoioPrima(c.id));
      expect(K.riuscito(st), `${c.id} seme ${seed}`).toBe(true);
      expect(K.stelleFinali(st), `${c.id} seme ${seed}`).toEqual({ occhio: true, spiegazione: true, soluzione: true });
      expect(st.fiducia).toBeGreaterThanOrEqual(6);
      expect(st.log.some(m => m.esito === "no" || m.esito === "grave")).toBe(false);
    }
  });

  it("riconosce ogni Diottro, con ogni valore", () => {
    for (const r of RICONOSCIMENTI) for (const seed of SEMI) {
      const st = risolviRic(r, seed);
      expect(st.fine, `${r.id} seme ${seed}`).toBe("preso");
      expect(st.diffidenza).toBeLessThanOrEqual(3);
    }
  });
});

describe("Diottri · i numeri col seme", () => {
  it("lo stesso seme dà la stessa partita, semi diversi partite diverse", () => {
    expect(rng(7, "c1")()).toBe(rng(7, "c1")());
    expect(rng(7, "c1")()).not.toBe(rng(8, "c1")());
    expect(rng(7, "c1")()).not.toBe(rng(7, "c2")());
  });

  it("le varianti escono tutte, e i valori stanno a quarti nell'intervallo", () => {
    const visti = new Set(SEMI.concat(SEMI.map(s => s + 100)).map(s => pick([0, 1, 2, 3], s, "c1")));
    expect(visti.size).toBe(4);
    for (const s of SEMI) {
      const v = quarti(0.5, 6, s, "r1");
      expect(v).toBeGreaterThanOrEqual(0.5);
      expect(v).toBeLessThanOrEqual(6);
      expect(Math.abs(v * 4 - Math.round(v * 4))).toBeLessThan(1e-9);
    }
  });
});

describe("Diottri · il caso", () => {
  it("una domanda già detta costa fiducia e la stella Spiegazione; le altre non costano", () => {
    const c1 = caso("c1"), st = K.nuovoCaso(c1, 1, vassoioPrima("c1"));
    expect(st.fiducia).toBe(6);
    K.chiedi(c1, st, "quando");
    K.chiedi(c1, st, "guida");
    expect(st.fiducia).toBe(6);
    expect(st.stelle.spiegazione).toBe(true);
    K.chiedi(c1, st, "occhiali");
    expect(st.fiducia).toBe(5);
    expect(st.stelle.spiegazione).toBe(false);
    K.chiedi(c1, st, "occhiali"); // la stessa domanda due volte non conta
    expect(st.fiducia).toBe(5);
  });

  it("la lente viene solo da una misura: senza, non si consegna", () => {
    const c1 = caso("c1"), st = K.nuovoCaso(c1, 1, vassoioPrima("c1"));
    K.consegna(c1, st);
    expect(st.fine).toBeNull();
    expect(ultimo(st).t).toMatch(/Prima la misura/);
  });

  it("rifare uguali gli occhiali con cui vede sfocato è un errore; al terzo arriva la soluzione", () => {
    const c1 = caso("c1"), st = K.nuovoCaso(c1, 1, vassoioPrima("c1"));
    K.usaVecchi(c1, st); // prima vanno letti
    expect(st.log.length).toBe(1);
    K.leggiVecchi(c1, st);
    expect(st.vecchiLetti).toBe(true);
    K.usaVecchi(c1, st);
    expect(ultimo(st).esito).toBe("no");
    expect(st.stelle.occhio).toBe(false);
    expect(st.lente).toBeNull();
    K.usaVecchi(c1, st);
    K.usaVecchi(c1, st);
    expect(st.soluzioneMostrata).toBe(true);
  });

  it("la prova lenti: parte dagli occhiali letti, col più serve Bombo, e giudica come il corso", () => {
    const c1 = caso("c1"), st = K.nuovoCaso(c1, 3, vassoioPrima("c1"));
    K.leggiVecchi(c1, st);
    K.apriProva(c1, st);
    expect(st.prova!.v).toBe(-1.25);
    expect(K.spostaProva(st, 1)).toBe(true); // −0,25: col meno, c'è Conca
    expect(K.spostaProva(st, 1)).toBe(false); // +0,75: serve Bombo, non c'è
    const sol = K.soluzioneProva({ rx: st.occhio.od, age: st.occhio.age });
    expect(sol).toBe(st.occhio.od.sph);
    // tre conferme sbagliate: la Maestra dà la soluzione e passa all'altro occhio
    for (let i = 0; i < 3; i++) K.confermaProva(c1, st);
    expect(st.stelle.occhio).toBe(false);
    expect(st.soluzioneMostrata).toBe(true);
    expect(st.prova!.fatti.od).toBe(sol);
    expect(st.prova!.occhio).toBe("os");
    portaA(st, K.soluzioneProva({ rx: st.occhio.os, age: st.occhio.age }));
    K.confermaProva(c1, st);
    expect(st.lente?.fonte).toBe("prova");
    expect(st.prova).toBeNull();
  });

  it("il giudizio della prova: il miope il meno più leggero, l'ipermetrope il più più forte", () => {
    const miope = { rx: { sph: -2, cyl: 0, axis: 180 }, age: 24 };
    expect(K.soluzioneProva(miope)).toBe(-2);
    expect(K.giudizioProva(miope, -2.25).t).toMatch(/troppo meno/);
    expect(K.giudizioProva(miope, -1.5).ok).toBe(false);
    const iper = { rx: { sph: 2, cyl: 0, axis: 180 }, age: 28 };
    expect(K.soluzioneProva(iper)).toBe(2);
    expect(K.giudizioProva(iper, 0).t).toMatch(/sali col più/);
    expect(K.giudizioProva(iper, 2.5).t).toMatch(/Troppo più/);
  });

  it("l'ipermetrope giovane: con la lente nasce il dubbio, e si risponde mostrando", () => {
    const c2 = caso("c2"), st = K.nuovoCaso(c2, 2, vassoioPrima("c2"));
    const vicino = () => bisogni(c2, st).find(b => b.tipo === "vicino")!.tacche;
    expect(vicino()).toBeGreaterThan(0);
    provaGiusta(c2, st);
    expect(vicino()).toBe(0);
    expect(K.dubbioAperto(c2, st)?.id).toBe("perche");
    expect(K.mancaPerConsegna(c2, st)).toMatch(/dubbio/);
    K.mostra(c2, st, "goccia"); // fuori tema
    expect(st.fiducia).toBe(5);
    expect(st.stelle.spiegazione).toBe(false);
    K.mostra(c2, st, "dilato"); // vero, ma non risponde
    expect(st.fiducia).toBe(5);
    K.mostra(c2, st, "lavora");
    expect(st.fiducia).toBe(6);
    expect(K.dubbioAperto(c2, st)).toBeNull();
  });

  it("i trattamenti non correggono il difetto, ma servono al cliente: al computer il filtro è «Bene»", () => {
    const c2 = caso("c2"), st = K.nuovoCaso(c2, 2, vassoioPrima("c2"));
    const schermi = () => bisogni(c2, st).find(b => b.tipo === "schermi")!;
    expect(schermi().visibile).toBe(false);
    K.chiedi(c2, st, "quando");
    expect(schermi().visibile).toBe(true);
    expect(schermi().tacche).toBe(1);
    K.metti(c2, st, "trattamento", "blu");
    expect(ultimo(st).esito).toBe("bene");
    expect(schermi().tacche).toBe(0);
    expect(st.stelle.soluzione).toBe(true);
    // senza chiedere, il computer salta fuori alla consegna
    const b = K.nuovoCaso(c2, 2, vassoioPrima("c2"));
    K.chiedi(c2, b, "segni");
    K.chiedi(c2, b, "dove");
    provaGiusta(c2, b);
    K.mostra(c2, b, "lavora");
    K.consegna(c2, b);
    expect(b.fine).toBeNull();
    expect(b.perse.spiegazione).toBe("una domanda mancata: «Da quando?»");
  });

  it("senza Bombo, l'ipermetrope non si misura con la prova", () => {
    const c2 = caso("c2"), st = K.nuovoCaso(c2, 2, VASSOIO_INIZIO);
    K.apriProva(c2, st);
    expect(K.spostaProva(st, 0.25)).toBe(false);
  });

  it("un bisogno nascosto salta fuori alla consegna: si perde la Spiegazione, poi si sistema", () => {
    const c3 = caso("c3"), st = K.nuovoCaso(c3, 1, vassoioPrima("c3"));
    K.chiedi(c3, st, "ricetta");
    K.apriRicetta(c3, st);
    for (const c of K.caselleRicetta(c3)) K.toccaRicetta(c3, st, c);
    expect(st.lente?.fonte).toBe("ricetta");
    K.mostra(c3, st, "dilato");
    K.metti(c3, st, "materiale", "i167");
    K.metti(c3, st, "montatura", "m50");
    expect(bisogni(c3, st).filter(b => b.visibile).every(b => b.tacche === 0)).toBe(true);
    K.consegna(c3, st);
    expect(st.fine).toBeNull();
    expect(st.log.some(m => m.t === "Ah, dimenticavo una cosa…")).toBe(true);
    expect(st.stelle.spiegazione).toBe(false);
    expect(bisogni(c3, st).find(b => b.tipo === "riflessi")!.visibile).toBe(true);
    K.metti(c3, st, "trattamento", "ar");
    K.consegna(c3, st);
    expect(st.fine).toBe("consegnato");
    expect(K.stelleFinali(st)).toEqual({ occhio: true, spiegazione: false, soluzione: true });
  });

  it("la ricetta letta male: tre errori sulla stessa casella e la Maestra la legge", () => {
    const c3 = caso("c3"), st = K.nuovoCaso(c3, 1, vassoioPrima("c3"));
    K.apriRicetta(c3, st);
    expect(st.ricetta).toBeNull(); // la ricetta non c'è finché non la chiedi
    K.chiedi(c3, st, "ricetta");
    K.apriRicetta(c3, st);
    for (let i = 0; i < 3; i++) K.toccaRicetta(c3, st, "OS.SF");
    expect(st.stelle.occhio).toBe(false);
    expect(st.ricetta!.passo).toBe(1);
  });

  it("la categoria 4: un errore prima di sapere della guida, grave dopo; la fiducia non scende sotto 1", () => {
    const c4 = caso("c4");
    const a = K.nuovoCaso(c4, 1, vassoioPrima("c4"));
    K.metti(c4, a, "filtro", "b4");
    expect(ultimo(a).esito).toBe("no");
    expect(a.posti.filtro).toBe("b4");

    const st = K.nuovoCaso(c4, 1, vassoioPrima("c4"));
    K.chiedi(c4, st, "guida");
    K.metti(c4, st, "filtro", "b4");
    expect(st.log.some(m => m.esito === "grave")).toBe(true);
    expect(st.posti.filtro).toBe("no"); // il pezzo grave non si mette
    expect(st.fiducia).toBe(3);
    K.metti(c4, st, "filtro", "b4");
    expect(st.fiducia).toBe(1);
    K.metti(c4, st, "filtro", "b4");
    expect(st.fiducia).toBe(1);
    expect(st.soluzioneMostrata).toBe(true);
    expect(st.posti.filtro).toBe("p3");
    expect(st.fine).toBeNull();
    K.chiedi(c4, st, "sole"); // già detto, e adesso la fiducia può finire
    expect(st.fine).toBe("andato");
    expect(K.riuscito(st)).toBe(false);
  });

  it("un pezzo che diventa grave alla consegna la Maestra lo toglie", () => {
    const c4 = caso("c4"), st = K.nuovoCaso(c4, 1, vassoioPrima("c4"));
    K.chiedi(c4, st, "disturba");
    K.leggiVecchi(c4, st);
    K.usaVecchi(c4, st);
    expect(st.lente?.fonte).toBe("vecchi");
    K.metti(c4, st, "filtro", "b4");
    expect(K.mancaPerConsegna(c4, st)).toBeNull();
    K.consegna(c4, st);
    expect(st.fine).toBeNull();
    expect(st.posti.filtro).toBe("no");
    expect(st.log.some(m => m.esito === "grave" && /guida/.test(m.t))).toBe(true);
    K.metti(c4, st, "filtro", "p3");
    expect(K.dubbioAperto(c4, st)?.id).toBe("schermo");
    K.mostra(c4, st, "polarizzate");
    K.consegna(c4, st);
    expect(st.fine).toBe("consegnato");
    expect(K.stelleFinali(st).soluzione).toBe(false);
  });

  it("con l'allarme non si misura: la mossa è fermata, e vince solo il medico, subito", () => {
    const c5 = caso("c5");
    const st = K.nuovoCaso(c5, 1, vassoioPrima("c5"));
    K.leggiVecchi(c5, st); // leggere gli occhiali non tocca l'occhio: un errore, non grave
    expect(ultimo(st).esito).toBe("no");
    expect(st.fiducia).toBe(5);
    expect(st.vecchiLetti).toBe(false);
    expect(st.perse.occhio).toBe("misurare con un allarme");
    K.apriProva(c5, st); // le lenti davanti all'occhio: grave
    expect(st.prova).toBeNull();
    expect(ultimo(st).esito).toBe("grave");
    expect(st.fiducia).toBe(2);
    K.consegna(c5, st);
    expect(ultimo(st).t).toMatch(/Prima la misura/); // lo stesso messaggio degli altri casi
    K.medico(c5, st, "oggi");
    expect(st.fine).toBe("medico");
    expect(st.log.some(m => m.esito === "grave" && /pronto soccorso adesso/.test(m.t))).toBe(true);
    expect(st.perse.soluzione).toMatch(/serviva «subito»/);
    expect(K.stelleFinali(st)).toEqual({ occhio: false, spiegazione: false, soluzione: false });

    const bravo = K.nuovoCaso(c5, 1, vassoioPrima("c5"));
    K.chiedi(c5, bravo, "improvviso");
    K.medico(c5, bravo, "subito");
    expect(K.stelleFinali(bravo)).toEqual({ occhio: true, spiegazione: true, soluzione: true });
  });

  it("nel caso d'allarme lo schermo è quello di un caso normale: bisogni e pezzi ci sono", () => {
    const c5 = caso("c5"), st = K.nuovoCaso(c5, 1, vassoioPrima("c5"));
    const bs = bisogni(c5, st).filter(b => b.visibile);
    expect(bs.length).toBeGreaterThan(0);
    expect(totaleTacche(bs)).toBeGreaterThan(0); // vede sfocato, come dice
    expect(Object.keys(c5.posti).length).toBeGreaterThan(0);
  });

  it("il medico su un caso normale chiude senza stelle; la visita dove non serve è «Va bene, ma…»", () => {
    const c1 = caso("c1"), st = K.nuovoCaso(c1, 1, vassoioPrima("c1"));
    K.consigliaVisita(c1, st, "anni40");
    expect(ultimo(st).esito).toBe("ok");
    expect(st.stelle.soluzione).toBe(false);
    K.medico(c1, st, "oggi");
    expect(st.fine).toBe("chiuso");
    expect(K.riuscito(st)).toBe(false);
    expect(K.stelleFinali(st)).toEqual({ occhio: false, spiegazione: false, soluzione: false });
  });

  it("un «Va bene, ma…» al primo colpo toglie la stella del suo momento, non la fiducia", () => {
    const c1 = caso("c1"), st = K.nuovoCaso(c1, 1, vassoioPrima("c1"));
    K.metti(c1, st, "materiale", "i160");
    expect(ultimo(st).esito).toBe("ok");
    expect(st.stelle.soluzione).toBe(false);
    expect(st.fiducia).toBe(6);
  });

  it("un pezzo che peggiora le tacche costa due di fiducia", () => {
    const c3 = caso("c3"), st = K.nuovoCaso(c3, 1, vassoioPrima("c3"));
    K.chiedi(c3, st, "ricetta");
    K.apriRicetta(c3, st);
    for (const c of K.caselleRicetta(c3)) K.toccaRicetta(c3, st, c);
    K.metti(c3, st, "montatura", "m50");
    const f = st.fiducia;
    K.metti(c3, st, "montatura", "sua"); // torna al calibro grande: lo spessore cresce
    expect(ultimo(st).esito).toBe("no");
    expect(st.fiducia).toBe(f - 2);
  });
});

describe("Diottri · il riconoscimento", () => {
  const nuovo = (id: string, seed = 1) => { const d = ric(id); return { d, st: R.nuovoRic(d, seed) }; };

  it("la croce va contro la lente col più, con la lente col meno; la velocità dice la fascia", () => {
    for (const seed of SEMI) {
      const { d, st } = nuovo("r1", seed);
      const t = R.osserva(d, st, "neutralizza");
      expect(t).toMatch(/contro/);
      const passo = { debole: "piano", media: "svelta", forte: "corre" }[R.grandezzaGiusta(d, st) as "debole" | "media" | "forte"];
      expect(t).toContain(passo);
    }
    const conca: RiconoscimentoDef = { ...ric("r1"), specie: "conca", grandezza: { tipo: "sfera", min: -6, max: -0.5 } };
    expect(R.osserva(conca, R.nuovoRic(conca, 1), "neutralizza")).toMatch(/va con/);
  });

  it("il cilindro: destra e sinistra va con la lente e dice quanto corre, su e giù sta ferma; girandolo si apre a forbice", () => {
    for (const seed of SEMI) {
      const { d, st } = nuovo("r4", seed);
      const t = R.osserva(d, st, "neutralizza");
      expect(t).toMatch(/^Destra e sinistra: va con la lente, e (si muove piano|si muove svelta|corre)\. Su e giù: ferma\.$/);
      expect(stanno(t)).toBe(true);
      expect(R.osserva(d, st, "ruota")).toMatch(/forbice/);
    }
  });

  it("una prova inutile alza la diffidenza di 1; finché non si è vista la soluzione non si scappa", () => {
    const { d, st } = nuovo("r1");
    expect(st.diffidenza).toBe(3);
    R.prova(d, st, "riflesso");
    expect(st.diffidenza).toBe(4);
    R.prova(d, st, "riflesso"); // la stessa prova due volte non conta
    expect(st.diffidenza).toBe(4);
    R.riconosci(d, st, "conca", "debole");
    expect(st.diffidenza).toBe(5);
    R.riconosci(d, st, "neutra", "debole");
    expect(st.diffidenza).toBe(5);
    expect(st.fine).toBeNull();
    expect(st.log.some(m => m.t === d.aiuto)).toBe(true); // al secondo errore l'aiuto
    R.riconosci(d, st, "conca", "media");
    expect(st.soluzioneMostrata).toBe(true);
    expect(st.log.some(m => m.t.startsWith("La risposta: Lente col più"))).toBe(true);
    expect(st.fine).toBe("scappato");
  });

  it("il tipo giusto col numero sbagliato è un errore a metà", () => {
    const { d, st } = nuovo("r1", 5);
    const giusta = R.grandezzaGiusta(d, st)!;
    const sbagliata = ["debole", "media", "forte"].find(x => x !== giusta)!;
    R.riconosci(d, st, "bombo", sbagliata);
    expect(ultimo(st).t).toBe("Quasi: il tipo è giusto, la forza no.");
    R.riconosci(d, st, "bombo", giusta);
    expect(st.fine).toBe("preso");
    expect(st.occhioEsperto).toBe(false);
  });

  it("occhio esperto: una prova sola e la risposta giusta", () => {
    const { d, st } = nuovo("r1", 9);
    R.prova(d, st, "neutralizza");
    R.riconosci(d, st, "bombo", R.grandezzaGiusta(d, st));
    expect(st.fine).toBe("preso");
    expect(st.occhioEsperto).toBe(true);
  });

  it("la montatura: il caldo prima di leggere l'asta è dannoso, dopo è utile", () => {
    const a = nuovo("r5");
    expect(R.utilita(a.d, a.st, "caldo")).toBe("dannosa");
    R.prova(a.d, a.st, "caldo");
    expect(a.st.diffidenza).toBe(5);
    const b = nuovo("r5");
    R.prova(b.d, b.st, "asta");
    expect(R.utilita(b.d, b.st, "caldo")).toBe("utile");
    R.prova(b.d, b.st, "caldo");
    expect(b.st.diffidenza).toBe(3);
    expect(R.osserva(b.d, b.st, "asta")).toContain(`Acetate ${b.st.valore}□18 140`);
  });

  it("il sole: la luce che passa dice la categoria, come nella spiegazione della prova", () => {
    for (const seed of SEMI) {
      const { d, st } = nuovo("r3", seed);
      const pct = Number(R.osserva(d, st, "luce").match(/(\d+)%/)![1]);
      const cat = pct > 18 ? "2" : pct > 8 ? "3" : "4";
      expect(cat).toBe(R.grandezzaGiusta(d, st));
    }
  });

  it("le prove fuori dal banco di quel Diottro non si fanno", () => {
    const { d, st } = nuovo("r2");
    expect(R.prova(d, st, "asta" as ProvaId)).toBeNull();
    expect(st.provate).toEqual([]);
  });
});

/* ---------- i testi: tre righe da 24 ---------- */

/** Gioca un caso male in tanti modi, per raccogliere i messaggi del motore. */
function giocaMale(def: CasoDef, seed: number): CasoState {
  const st = K.nuovoCaso(def, seed, vassoioPrima(def.id));
  for (const q of def.domande) K.chiedi(def, st, q.id);
  K.leggiVecchi(def, st);
  K.usaVecchi(def, st);
  K.apriRicetta(def, st);
  if (st.ricetta) for (let i = 0; i < 3; i++) K.toccaRicetta(def, st, "OS.AX");
  K.apriProva(def, st);
  if (st.prova) {
    K.spostaProva(st, -1);
    K.confermaProva(def, st);
    K.spostaProva(st, 1);
    K.spostaProva(st, 1);
    K.confermaProva(def, st);
    K.confermaProva(def, st);
  }
  for (const p of Object.keys(def.posti) as PostoId[]) for (const o of def.posti[p]!) K.metti(def, st, p, o.id);
  for (let i = 0; i < 4 && K.dubbioAperto(def, st); i++) for (const m of K.dubbioAperto(def, st)?.mostra ?? []) K.mostra(def, st, m.id);
  K.consigliaVisita(def, st, "decimi");
  K.consegna(def, st);
  K.consegna(def, st);
  K.medico(def, st, "oggi");
  return st;
}

function giocaMaleRic(def: RiconoscimentoDef, seed: number): RicState {
  const st = R.nuovoRic(def, seed);
  for (const p of Object.keys(def.prove) as ProvaId[]) R.prova(def, st, p);
  for (const o of def.opzioni) R.riconosci(def, st, o.id, "nessuna");
  return st;
}

describe("Diottri · i testi stanno nel riquadro", () => {
  it("righe() va a capo sulle parole", () => {
    expect(righe("Da quando?")).toBe(1);
    expect(righe("La gradazione non si indovina: si misura.")).toBe(2);
    expect(righe("x".repeat(25))).toBe(Infinity);
  });

  it("ogni messaggio del motore sta in tre righe da 24, giocando bene e male", () => {
    const lunghi = new Set<string>();
    for (const c of CASI) for (const seed of [1, 2, 3, 4, 5, 6]) {
      for (const st of [risolviCaso(c, seed, vassoioPrima(c.id)), giocaMale(c, seed)]) for (const m of st.log) if (!stanno(m.t)) lunghi.add(`${c.id}: ${m.t}`);
    }
    for (const r of RICONOSCIMENTI) for (const seed of [1, 2, 3, 4, 5, 6]) {
      for (const st of [risolviRic(r, seed), giocaMaleRic(r, seed)]) for (const m of st.log) if (!stanno(m.t)) lunghi.add(`${r.id}: ${m.t}`);
      const st = R.nuovoRic(r, seed);
      for (const p of Object.keys(r.prove) as ProvaId[]) { const t = R.osserva(r, st, p); if (!stanno(t)) lunghi.add(`${r.id} ${p}: ${t}`); }
    }
    expect([...lunghi]).toEqual([]);
  });

  it("i nomi delle specie sono corti e diversi", () => {
    const nomi = Object.values(SPECIE).map(s => s.nome);
    expect(new Set(nomi).size).toBe(nomi.length);
    for (const n of nomi) expect(n.length).toBeLessThanOrEqual(10);
  });
});

describe("Diottri · l'elenco nero", () => {
  it("prende i nomi e le formule del mondo Pokémon", () => {
    for (const t of ["Un Pokémon selvatico", "il Pokédex", "È superefficace!", "Pikachu", "Usa MT05", "Lega Pokémon", "Un Diottro selvatico è apparso!"]) expect(nelNero(t), t).not.toBeNull();
  });

  it("lascia stare le parole del gioco", () => {
    for (const t of ["Diottro", "Diottri", "Campionario", "vassoio", "Maestra Iride", "Borgo Diottria", "Riconosci", "Preso!", "Occhio esperto", "Scappato!"]) expect(nelNero(t), t).toBeNull();
    expect(ELENCO_NERO.length).toBeGreaterThan(10);
  });

  it("i messaggi del motore e i testi dei contenuti non ci cadono", () => {
    for (const c of CASI) for (const m of [...risolviCaso(c, 1, vassoioPrima(c.id)).log, ...giocaMale(c, 1).log]) expect(nelNero(m.t), m.t).toBeNull();
    for (const s of Object.values(SPECIE)) for (const t of [s.nome, s.uso, s.forma, s.limite, s.prove]) expect(nelNero(t), t).toBeNull();
  });
});
