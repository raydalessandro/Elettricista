/* ====== DIOTTRI · IL CASO: COSTRUIRE L'OCCHIALE ======
   Il motore del primo giro: osserva e chiedi, misura, costruisci, mostra, consegna; il medico.
   Gira senza disegno: l'interfaccia, i test e il risolutore chiamano queste funzioni e leggono lo stato.
   Le tacche dei bisogni vengono dai modelli dell'ottica (valuta.ts); gli esiti dei pezzi dal caso. */
import { diop, normAxis, PLANO, see, type SphCyl } from "../../ottica/core/eye";
import { pick } from "./rng";
import { bisogni, opzioneDi, totaleTacche } from "./valuta";
import type { Bisogno, CasoDef, CasoState, Dubbio, Esito, Fine, Momento, MostraId, Motivo, Msg, PostoId, Rivela, RxCell, SpecieId, Urgenza } from "./tipi";

/* ---------- avvio ---------- */

export function nuovoCaso(def: CasoDef, seed: number, vassoio: SpecieId[], eta?: number): CasoState {
  const occhio = def.varianti?.length ? pick(def.varianti, seed, def.id) : def.occhio;
  const posti: CasoState["posti"] = {};
  for (const [p, opts] of Object.entries(def.posti) as [PostoId, NonNullable<CasoDef["posti"][PostoId]>][]) posti[p] = opts[0].id;
  const st: CasoState = {
    id: def.id, seed, occhio: { ...occhio, age: eta ?? def.cliente.eta },
    fiducia: 6, soluzioneMostrata: false, scoperti: [], chieste: [],
    lente: null, vecchiLetti: false, ricetta: null, prova: null,
    posti, provati: {}, dubbi: [], visita: null,
    stelle: { occhio: true, spiegazione: true, soluzione: true }, perse: {},
    errori: {}, log: [], fine: null, vassoio: [...vassoio],
  };
  say(st, "cliente", def.cliente.frase);
  return st;
}

/* ---------- utilità ---------- */

function say(st: CasoState, chi: Msg["chi"], t: string, esito?: Esito) {
  st.log.push(esito ? { chi, t, esito } : { chi, t });
}

/** Cambia la fiducia. Finché la soluzione non è stata mostrata, il cliente non se ne va: non si scende sotto 1. */
function fiducia(st: CasoState, delta: number) {
  const min = st.soluzioneMostrata ? 0 : 1;
  st.fiducia = Math.max(min, Math.min(10, st.fiducia + delta));
  if (st.fiducia <= 0) {
    st.fine = "andato";
    say(st, "cliente", "Ci penso. Torno un altro giorno.");
  }
}

/** Toglie la stella di un momento, e ricorda la prima ragione: la schermata finale la dice. */
const perde = (st: CasoState, m: Momento, perche: string) => {
  st.stelle[m] = false;
  if (!st.perse[m]) st.perse[m] = perche;
};

/** Conta un errore in un passo; al secondo un indizio, al terzo la soluzione. Ritorna 1, 2 o 3+. */
function errore(st: CasoState, passo: string, indizio: string | undefined): number {
  const n = (st.errori[passo] = (st.errori[passo] || 0) + 1);
  if (n === 2 && indizio) say(st, "iride", indizio);
  return n;
}

export const scoperto = (st: CasoState, r: Rivela) => st.scoperti.includes(r);
const finito = (st: CasoState) => st.fine !== null;

/** I Diottri della famiglia Lente: col meno Conca, col più Bombo. */
export function lenteServe(v: number): SpecieId | null {
  if (v < 0) return "conca";
  if (v > 0) return "bombo";
  return null;
}

/* ---------- 1 · osserva e chiedi ---------- */

export function chiedi(def: CasoDef, st: CasoState, id: string) {
  if (finito(st) || st.chieste.includes(id)) return;
  const q = def.domande.find(d => d.id === id);
  if (!q) return;
  st.chieste.push(id);
  say(st, "tu", q.testo);
  say(st, "cliente", q.risposta);
  if (q.giaDetto) {
    perde(st, "spiegazione", `una domanda già detta: «${q.testo}»`);
    fiducia(st, -1);
    return;
  }
  if (q.rivela && !scoperto(st, q.rivela)) st.scoperti.push(q.rivela);
}

/* ---------- 2 · misura ---------- */

/** Con un segnale d'allarme non si misura: la Maestra ferma la mossa. Ritorna true se la mossa è fermata.
    Mettere lenti davanti all'occhio è un errore grave; leggere gli occhiali o la ricetta non tocca l'occhio, ed è un errore. */
function fermaSeAllarme(def: CasoDef, st: CasoState, grave: boolean): boolean {
  if (!def.allarme) return false;
  perde(st, "occhio", "misurare con un allarme");
  fiducia(st, grave ? -3 : -1);
  say(st, "iride", def.aiuti.medico || "Con un allarme non si misura: prima il medico.", grave ? "grave" : "no");
  return true;
}

/** Il frontifocometro legge gli occhiali che porta. */
export function leggiVecchi(def: CasoDef, st: CasoState) {
  if (finito(st) || fermaSeAllarme(def, st, false)) return;
  if (!def.vecchi) {
    say(st, "gioco", "Non porta occhiali: non c'è niente da leggere.");
    return;
  }
  st.vecchiLetti = true;
  say(st, "gioco", `Frontifocometro: OD ${rx(def.vecchi.od)}, OS ${rx(def.vecchi.os)}.`);
  say(st, "cliente", def.vecchi.frase);
}

/** Rifare uguali gli occhiali che porta: giusto solo se con quelli vede bene. */
export function usaVecchi(def: CasoDef, st: CasoState) {
  if (finito(st) || !def.vecchi || !st.vecchiLetti) return;
  if (def.vecchi.vedeBene) {
    st.lente = { od: def.vecchi.od, os: def.vecchi.os, fonte: "vecchi" };
    say(st, "iride", "Con questi vede bene: si rifanno uguali.", "bene");
    dopoLente(def, st);
    return;
  }
  perde(st, "occhio", "rifatti uguali occhiali con cui vede sfocato");
  fiducia(st, -1);
  const n = errore(st, "vecchi", "Coi suoi occhiali vede sfocato: serve la prova.");
  say(st, "iride", "Con questi vede ancora sfocato: si misura.", "no");
  if (n >= 3) st.soluzioneMostrata = true;
}

const rx = (l: SphCyl) => (l.cyl ? `${diop(l.sph)} ${diop(l.cyl)} × ${normAxis(l.axis)}` : diop(l.sph));

/** Le caselle da toccare per leggere la ricetta: la sfera, e cilindro e asse se ci sono. */
export function caselleRicetta(def: CasoDef): RxCell[] {
  const r = def.ricetta;
  if (!r) return [];
  const out: RxCell[] = ["OD.SF"];
  if (r.od.cyl) out.push("OD.CIL", "OD.AX");
  out.push("OS.SF");
  if (r.os.cyl) out.push("OS.CIL", "OS.AX");
  return out;
}

export const RX_NOME: Record<RxCell, string> = {
  "OD.SF": "la sfera dell'occhio destro", "OD.CIL": "il cilindro dell'occhio destro", "OD.AX": "l'asse dell'occhio destro",
  "OS.SF": "la sfera dell'occhio sinistro", "OS.CIL": "il cilindro dell'occhio sinistro", "OS.AX": "l'asse dell'occhio sinistro",
};

export function apriRicetta(def: CasoDef, st: CasoState) {
  if (finito(st) || !def.ricetta) return;
  if (def.ricetta.nascosta && !scoperto(st, "ricetta")) return;
  if (fermaSeAllarme(def, st, false)) return;
  st.ricetta = { passo: 0, caselle: caselleRicetta(def) };
}

/** Tocca una casella della ricetta. */
export function toccaRicetta(def: CasoDef, st: CasoState, c: RxCell) {
  const r = st.ricetta;
  if (finito(st) || !r || !def.ricetta) return;
  const cerca = r.caselle[r.passo];
  if (c === cerca) {
    r.passo++;
    if (r.passo >= r.caselle.length) {
      st.lente = { od: def.ricetta.od, os: def.ricetta.os, fonte: "ricetta" };
      st.ricetta = null;
      say(st, "iride", `Letta: OD ${rx(def.ricetta.od)}, OS ${rx(def.ricetta.os)}.`, "bene");
      dopoLente(def, st);
    }
    return;
  }
  perde(st, "occhio", "la ricetta letta male");
  const n = errore(st, `ricetta:${cerca}`, def.aiuti.ricetta || "Ogni riga è un occhio; la sfera è il primo numero.");
  say(st, "iride", `Questa non è ${RX_NOME[cerca]}.`, "no");
  if (n >= 3) {
    st.soluzioneMostrata = true;
    toccaRicetta(def, st, cerca);
  }
}

/* ---------- la prova lenti ---------- */

export function apriProva(def: CasoDef, st: CasoState) {
  if (finito(st) || fermaSeAllarme(def, st, true)) return;
  const start = st.vecchiLetti && def.vecchi ? def.vecchi.od.sph : 0;
  st.prova = { occhio: "od", v: start, fatti: {} };
}

/** Sposta la lente in prova; col più serve Bombo nel vassoio, col meno Conca. Ritorna false se non si può. */
export function spostaProva(st: CasoState, delta: number): boolean {
  const p = st.prova;
  if (!p || finito(st)) return false;
  const v = Math.round((p.v + delta) * 100) / 100;
  if (v < -8 || v > 8) return false;
  const serve = lenteServe(v);
  if (serve && !st.vassoio.includes(serve)) return false;
  p.v = v;
  return true;
}

export function occhioProva(def: CasoDef, st: CasoState, o: "od" | "os") {
  const p = st.prova;
  if (!p || finito(st)) return;
  p.occhio = o;
  const start = st.vecchiLetti && def.vecchi ? def.vecchi[o].sph : 0;
  p.v = p.fatti[o] ?? start;
}

/** Il giudizio della prova: il lontano nitido, e l'occhio a riposo (come nel corso). */
export function giudizioProva(eye: { rx: SphCyl; age: number }, v: number): { ok: boolean; t: string } {
  const s = see(eye, { sph: v, cyl: 0, axis: 180 }, Infinity);
  const r = eye.rx.sph;
  if (s.sharp === "nitido" && s.work === "riposo") return { ok: true, t: "Nitido, e l'occhio riposa: è questa." };
  if (s.sharp === "nitido") {
    if (r < 0) return { ok: false, t: "Nitido, ma l'occhio lavora: troppo meno. Torna verso lo zero." };
    if (v < 0) return { ok: false, t: "Col meno l'occhio lavora ancora di più: serve il più." };
    return { ok: false, t: "Nitido, ma l'occhio lavora ancora: sali col più." };
  }
  if (s.m > 0) {
    if (v > r && r >= 0) return { ok: false, t: "Troppo più: il lontano sfoca. Torna indietro." };
    if (v > 0) return { ok: false, t: "Col più il miope vede peggio: serve il meno." };
    return { ok: false, t: "Ancora sfocato: aggiungi meno." };
  }
  return { ok: false, t: "Troppo meno: l'occhio non ce la fa più." };
}

/** La soluzione della prova per un occhio: la lente più positiva nitida a riposo. */
export function soluzioneProva(eye: { rx: SphCyl; age: number }): number {
  for (let v = 8; v >= -8; v -= 0.25) {
    const x = Math.round(v * 100) / 100;
    if (giudizioProva(eye, x).ok) return x;
  }
  return NaN;
}

export function confermaProva(def: CasoDef, st: CasoState) {
  const p = st.prova;
  if (!p || finito(st)) return;
  const o = p.occhio;
  const eye = { rx: st.occhio[o], age: st.occhio.age };
  const g = giudizioProva(eye, p.v);
  const nome = o === "od" ? "Destro" : "Sinistro";
  if (g.ok) {
    p.fatti[o] = p.v;
    say(st, "iride", `${nome}: ${diop(p.v)}. ${g.t}`, "bene");
  } else {
    perde(st, "occhio", "la prova lenti confermata sbagliata");
    const n = errore(st, `prova:${o}`, def.aiuti.prova || (eye.rx.sph < 0 ? "Cerca il meno più leggero con cui è nitido." : "Cerca il più positivo con cui è ancora nitido."));
    say(st, "iride", g.t, "no");
    if (n >= 3) {
      st.soluzioneMostrata = true;
      p.v = soluzioneProva(eye);
      p.fatti[o] = p.v;
      say(st, "iride", `${nome}: è ${diop(p.v)}.`);
    }
  }
  if (p.fatti.od !== undefined && p.fatti.os !== undefined) {
    st.lente = { od: { ...PLANO, sph: p.fatti.od }, os: { ...PLANO, sph: p.fatti.os }, fonte: "prova" };
    st.prova = null;
    dopoLente(def, st);
  } else if (p.fatti[o] !== undefined) {
    occhioProva(def, st, o === "od" ? "os" : "od");
  }
}

export function chiudiProva(st: CasoState) {
  st.prova = null;
}

/** Quando la lente c'è, possono nascere dubbi. */
function dopoLente(def: CasoDef, st: CasoState) {
  const l = st.lente!;
  const forte = Math.max(Math.abs(l.od.sph), Math.abs(l.os.sph)) >= 4;
  const piu = l.od.sph > 0 || l.os.sph > 0;
  apriDubbi(def, st, d => (d.quando === "lenteForte" && forte) || (d.quando === "lentePiu" && piu));
}

function apriDubbi(def: CasoDef, st: CasoState, se: (d: Dubbio) => boolean) {
  for (const d of def.dubbi || []) {
    if (st.dubbi.some(x => x.id === d.id) || !se(d)) continue;
    st.dubbi.push({ id: d.id, aperto: true, tentati: [] });
    say(st, "cliente", d.domanda);
  }
}

/* ---------- 3 · costruisci ---------- */

/** L'esito di un'opzione, con quello che si è scoperto. */
export function esitoDi(st: CasoState, o: { esito: Esito; perche: string; seScoperto?: { rivela: Rivela; esito: Esito; perche: string } }): { esito: Esito; perche: string } {
  if (o.seScoperto && scoperto(st, o.seScoperto.rivela)) return { esito: o.seScoperto.esito, perche: o.seScoperto.perche };
  return { esito: o.esito, perche: o.perche };
}

/** Le opzioni di un posto che si possono usare: quelle che non chiedono un Diottro che non hai. */
export function opzioniDisponibili(def: CasoDef, st: CasoState, posto: PostoId) {
  return (def.posti[posto] || []).filter(o => !o.serve || st.vassoio.includes(o.serve));
}

export function metti(def: CasoDef, st: CasoState, posto: PostoId, id: string) {
  if (finito(st)) return;
  const o = opzioniDisponibili(def, st, posto).find(x => x.id === id);
  if (!o || st.posti[posto] === id) return;
  const prima = totaleTacche(bisogni(def, st));
  const { esito, perche } = esitoDi(st, o);
  const tried = (st.provati[posto] = st.provati[posto] || []);
  const primo = tried.length === 0;
  tried.push(id);
  if (esito === "grave") {
    perde(st, "soluzione", `un errore grave: ${o.nome}`);
    fiducia(st, -3);
    say(st, "iride", perche, "grave");
    erroreDiPosto(def, st, posto);
    return;
  }
  st.posti[posto] = id;
  if (esito === "bene") {
    say(st, "iride", perche, "bene");
  } else if (esito === "ok") {
    if (primo) perde(st, "soluzione", `«Va bene, ma…» al primo colpo: ${o.nome}`);
    say(st, "iride", perche, "ok");
  } else {
    perde(st, "soluzione", `un pezzo sbagliato: ${o.nome}`);
    const peggio = totaleTacche(bisogni(def, st)) > prima;
    fiducia(st, peggio ? -2 : -1);
    say(st, "iride", perche, "no");
    erroreDiPosto(def, st, posto);
  }
  if (o.filtro?.polarizzata) apriDubbi(def, st, d => d.quando === "polarizzata");
}

function erroreDiPosto(def: CasoDef, st: CasoState, posto: PostoId) {
  const n = errore(st, `posto:${posto}`, def.aiuti.posti?.[posto]);
  if (n >= 3) {
    const giusta = opzioniDisponibili(def, st, posto).find(o => esitoDi(st, o).esito === "bene");
    if (giusta) {
      st.soluzioneMostrata = true;
      st.posti[posto] = giusta.id;
      say(st, "iride", `Ecco la scelta giusta: ${giusta.nome}.`);
      say(st, "iride", esitoDi(st, giusta).perche);
      if (giusta.filtro?.polarizzata) apriDubbi(def, st, d => d.quando === "polarizzata");
    }
  }
}

/* ---------- 4 · mostra ---------- */

export function dubbioAperto(def: CasoDef, st: CasoState): Dubbio | null {
  const a = st.dubbi.find(d => d.aperto);
  return a ? def.dubbi!.find(d => d.id === a.id)! : null;
}

export function mostra(def: CasoDef, st: CasoState, id: MostraId) {
  if (finito(st)) return;
  const d = dubbioAperto(def, st);
  if (!d) return;
  const s = st.dubbi.find(x => x.id === d.id)!;
  if (s.tentati.includes(id)) return;
  const m = d.mostra.find(x => x.id === id);
  if (!m) return;
  s.tentati.push(id);
  if (m.esito === "risponde") {
    s.aperto = false;
    fiducia(st, 1);
    say(st, "iride", d.risposta, "bene");
    return;
  }
  perde(st, "spiegazione", "una dimostrazione che non rispondeva al dubbio");
  if (m.esito === "vero") {
    say(st, "iride", "È vero, ma non risponde alla sua domanda.", "ok");
    return;
  }
  fiducia(st, -1);
  say(st, "iride", "Questo non c'entra con la sua domanda.", "no");
  const n = errore(st, `mostra:${d.id}`, def.aiuti.mostra);
  if (n >= 3) {
    st.soluzioneMostrata = true;
    s.aperto = false;
    say(st, "iride", d.risposta);
  }
}

/* ---------- il medico ---------- */

export function consigliaVisita(def: CasoDef, st: CasoState, motivo: Motivo) {
  if (finito(st)) return;
  say(st, "tu", "Le consiglio una visita dall'oculista.");
  if (def.allarme) {
    perde(st, "soluzione", "una visita al posto dell'urgenza");
    say(st, "iride", "Non è una visita da prenotare: è un'urgenza.", "grave");
    return;
  }
  if (def.visita === motivo) {
    st.visita = motivo;
    say(st, "iride", "Bene: qui la visita serve, e il motivo è quello.", "bene");
    return;
  }
  perde(st, "soluzione", def.visita ? "la visita col motivo sbagliato" : "una visita che non serviva");
  say(st, "iride", def.visita ? "La visita serve, ma per un altro motivo." : "La visita non guasta, ma qui il passo era misurare.", "ok");
}

export function medico(def: CasoDef, st: CasoState, u: Urgenza) {
  if (finito(st)) return;
  say(st, "tu", u === "subito" ? "Vada subito al pronto soccorso." : "Oggi stesso dall'oculista.");
  if (!def.allarme) {
    for (const m of ["occhio", "spiegazione", "soluzione"] as const) perde(st, m, "non era un caso da medico");
    say(st, "iride", "Non era un caso da medico: qui si misurava.");
    st.fine = "chiuso";
    return;
  }
  controllaChiavi(def, st);
  if (u === def.allarme.urgenza) {
    say(st, "iride", def.allarme.perche, "bene");
  } else if (def.allarme.urgenza === "subito") {
    perde(st, "soluzione", "«oggi» quando serviva «subito»");
    say(st, "iride", "Oggi può essere tardi: pronto soccorso adesso.", "grave");
    say(st, "iride", "Le dica: pronto soccorso adesso, accompagnata.");
  } else {
    perde(st, "soluzione", "«subito» quando bastava «oggi»");
    say(st, "iride", "Bastava oggi; il pronto soccorso va bene lo stesso.", "ok");
  }
  st.fine = "medico";
  say(st, "cliente", def.ciVedo);
  say(st, "iride", def.fine);
}

/** Le domande che servivano e non sono state fatte: la stella Spiegazione si perde. */
function controllaChiavi(def: CasoDef, st: CasoState) {
  const manca = def.domande.find(q => q.chiave && !st.chieste.includes(q.id) && !(q.rivela && scoperto(st, q.rivela)));
  if (manca) {
    perde(st, "spiegazione", `una domanda mancata: «${manca.testo}»`);
    say(st, "iride", `Mancava una domanda: «${manca.testo}»`, "ok");
  }
}

/* ---------- 5 · consegna ---------- */

/** Cosa manca per consegnare (null: si può). */
export function mancaPerConsegna(def: CasoDef, st: CasoState): string | null {
  // con un allarme la lente non c'è mai (misurare è fermato): il messaggio è lo stesso degli altri casi
  if ((def.serveLente || def.allarme) && !st.lente) return "Prima la misura: la lente non c'è ancora.";
  if (st.dubbi.some(d => d.aperto)) return "Prima rispondi al suo dubbio: Mostra.";
  const b = bisogni(def, st).find(x => x.visibile && (x.tacche > 0 || x.vietato));
  if (b) return `Restano tacche: ${b.nome.toLowerCase()}.`;
  return null;
}

export function consegna(def: CasoDef, st: CasoState) {
  if (finito(st)) return;
  const manca = mancaPerConsegna(def, st);
  if (manca) {
    say(st, "gioco", manca);
    return;
  }
  // un bisogno che non si è scoperto salta fuori adesso: mancava una domanda
  const nascosto = bisogni(def, st).find(x => !x.visibile && (x.tacche > 0 || x.vietato));
  if (nascosto) {
    const q = def.domande.find(d => d.rivela === nascosto.tipo);
    st.scoperti.push(nascosto.tipo);
    perde(st, "spiegazione", q ? `una domanda mancata: «${q.testo}»` : "un bisogno scoperto solo alla consegna");
    say(st, "cliente", "Ah, dimenticavo una cosa…");
    if (q) say(st, "cliente", q.risposta);
    if (nascosto.vietato) {
      // un pezzo che con quello che si è scoperto è un errore grave: la Maestra lo toglie
      const posto = (Object.keys(st.posti) as PostoId[]).find(p => esitoDi(st, opzioneDi(def, st, p)).esito === "grave");
      if (posto) {
        perde(st, "soluzione", `un errore grave: ${opzioneDi(def, st, posto).nome}`);
        fiducia(st, -3);
        say(st, "iride", esitoDi(st, opzioneDi(def, st, posto)).perche, "grave");
        st.posti[posto] = def.posti[posto]![0].id;
      }
    }
    say(st, "iride", "Mancava una domanda. Sistema, poi consegna.", "ok");
    return;
  }
  controllaChiavi(def, st);
  if (def.visita && st.visita !== def.visita) {
    perde(st, "soluzione", "la visita da consigliare");
    say(st, "iride", "Va bene, ma andava consigliata la visita.", "ok");
  }
  st.fine = "consegnato";
  say(st, "cliente", def.ciVedo);
  say(st, "iride", def.fine);
}

/* ---------- lo stato per l'interfaccia ---------- */

export function stelleFinali(st: CasoState): Record<Momento, boolean> {
  const ok = st.fine === "consegnato" || st.fine === "medico";
  return ok ? { ...st.stelle } : { occhio: false, spiegazione: false, soluzione: false };
}

export const riuscito = (st: CasoState) => st.fine === "consegnato" || st.fine === "medico";

export type { Bisogno, Fine };
