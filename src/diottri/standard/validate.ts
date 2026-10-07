/* Controllo automatico dello standard di Diottri (docs/gioco/STANDARD.md, regole G1–G10).
   Lo usano npm run standard e i test: con un errore la mandata non esce. */
import { CASI, INTRO_PROVE, ORDINE, RICONOSCIMENTI, SPECIE, vassoioPrima } from "../content";
import { MAPPE } from "../content/borgo";
import { ARTICOLI, MONDO_ORA, segnoDi } from "../content/negozi";
import { provvigioneMinima } from "../core/economia";
import { apreEvento, cosePresenti, personaggiPresenti, strada, testiEvento } from "../mondo/motore";
import type { Comando, Contesto, Evento, StatoMondo } from "../mondo/tipi";
import { lenteServe, riuscito, soluzioneProva } from "../core/caso";
import { quarti } from "../core/rng";
import { risolviCaso, risolviRic } from "../core/risolutore";
import type { CasoDef, RiconoscimentoDef } from "../core/tipi";

export interface Finding {
  lv: string;
  code: string;
  sev: "errore" | "avviso";
  msg: string;
}

/** Il riquadro del gioco: tre righe da 24 caratteri, a capo sulle parole. */
export const RIGHE = 3, COLONNE = 24;

/** Quante righe prende un testo nel riquadro (Infinity se una parola non ci sta). */
export function righe(t: string, colonne = COLONNE): number {
  let n = 1, w = 0;
  for (const p of t.split(/\s+/).filter(Boolean)) {
    if (p.length > colonne) return Infinity;
    if (w === 0) w = p.length;
    else if (w + 1 + p.length <= colonne) w += 1 + p.length;
    else { n++; w = p.length; }
  }
  return n;
}
export const stanno = (t: string) => righe(t) <= RIGHE;

/** Nomi propri e formule fisse del mondo Pokémon: non devono comparire (G8). Maiuscole e minuscole contano. */
export const ELENCO_NERO: (string | RegExp)[] = [
  /Pok[eé]mon/i, /Pok[eé]dex/i, /Pok[eé] ?Ball/i, "Centro Pokémon", "Lega Pokémon", "Campione della Lega", "Superquattro",
  /selvatic[oa] è apparso/i, /superefficace/i, /non è molto efficace/i, /è esausto/i, /si sta evolvendo/i, /\bMT\d{2}\b/, /\bMN\d{2}\b/,
  "Pikachu", "Bulbasaur", "Charmander", "Squirtle", "Eevee", "Mewtwo",
];

export function nelNero(t: string): string | null {
  for (const x of ELENCO_NERO) if (typeof x === "string" ? t.includes(x) : x.test(t)) return String(x);
  return null;
}

/** Tutti i testi di un caso che vanno in un riquadro, col posto da cui vengono. */
function testiCaso(c: CasoDef): [string, string][] {
  const out: [string, string][] = [];
  const add = (w: string, t?: string) => { if (t) out.push([w, t]); };
  add("frase", c.cliente.frase);
  add("indizio", c.cliente.indizio);
  add("frontifocometro", c.vecchi?.frase);
  c.domande.forEach(q => add(`risposta «${q.testo}»`, q.risposta));
  for (const [p, opts] of Object.entries(c.posti)) opts!.forEach(o => { add(`${p}/${o.id}`, o.perche); add(`${p}/${o.id} se scoperto`, o.seScoperto?.perche); });
  (c.dubbi || []).forEach(d => { add(`dubbio ${d.id}`, d.domanda); add(`risposta al dubbio ${d.id}`, d.risposta); });
  add("allarme", c.allarme?.perche);
  for (const [k, v] of Object.entries(c.aiuti)) {
    if (typeof v === "string") add(`aiuto ${k}`, v);
    else if (v) for (const [p, t] of Object.entries(v)) add(`aiuto ${k}/${p}`, t as string);
  }
  add("ci vedo", c.ciVedo);
  add("fine", c.fine);
  return out;
}

const SEMI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function checkCaso(c: CasoDef, out: Finding[]) {
  const f = (code: string, msg: string, sev: Finding["sev"] = "errore") => out.push({ lv: `${c.id} · ${c.titolo}`, code, sev, msg });

  // G1 · testi nel riquadro
  for (const [w, t] of testiCaso(c)) if (!stanno(t)) f("G1", `${w}: «${t}» non sta in tre righe da ${COLONNE}`);
  for (const q of c.domande) {
    if (q.testo.length > COLONNE) f("G1", `domanda «${q.testo}» più lunga di una riga`);
    const parole = q.testo.split(/\s+/).length;
    if (parole > 4) f("G1", `domanda «${q.testo}»: più di quattro parole`);
  }
  for (const [p, opts] of Object.entries(c.posti)) for (const o of opts!) if (o.nome.length > COLONNE) f("G1", `${p}/${o.id}: nome più lungo di una riga`);

  // G2 · il caso è ben fatto
  const qs = c.domande.length;
  if (qs < 4 || qs > 6) f("G2", `${qs} domande: ne servono da 4 a 6`);
  if (!c.domande.some(q => q.chiave)) f("G2", "nessuna domanda chiave");
  for (const b of c.bisogni) if (b.nascosto && !c.domande.some(q => q.rivela === b.tipo)) f("G2", `il bisogno nascosto «${b.nome}» non lo scopre nessuna domanda`);
  for (const d of c.dubbi || []) if (d.mostra.filter(m => m.esito === "risponde").length !== 1) f("G2", `dubbio ${d.id}: ci vuole una sola dimostrazione che risponde`);
  if (c.ricetta?.nascosta && !c.domande.some(q => q.rivela === "ricetta")) f("G2", "la ricetta non la scopre nessuna domanda");

  // G3 · la lente solo da una misura
  if (c.serveLente && !c.ricetta && !c.vecchi?.vedeBene) {
    for (const v of c.varianti || [c.occhio]) for (const o of ["od", "os"] as const) {
      const sol = soluzioneProva({ rx: v[o], age: c.cliente.eta });
      if (!Number.isFinite(sol)) f("G3", `la prova lenti non ha soluzione per ${o}`);
      const serve = lenteServe(sol);
      if (serve && !vassoioPrima(c.id).includes(serve)) f("G3", `la prova vuole ${serve}, che a questo punto non è nel vassoio`);
    }
  }

  // G4 · allarme: vince solo il medico, non si costruisce niente
  if (c.allarme) {
    if (c.serveLente) f("G4", "un caso d'allarme non consegna lenti");
    if (!c.domande.some(q => q.rivela === "allarme")) f("G4", "nessuna domanda scopre l'allarme");
  }

  // G5 · ogni posto ha una scelta giusta, con i Diottri del vassoio a quel punto
  const vassoio = vassoioPrima(c.id);
  for (const [p, opts] of Object.entries(c.posti)) {
    if (!opts!.some(o => o.esito === "bene" && (!o.serve || vassoio.includes(o.serve)))) f("G5", `${p}: nessuna scelta «Bene» disponibile con il vassoio di adesso`);
  }

  // G6 · il risolutore lo finisce con tre stelle, in ogni variante
  const semi = c.varianti ? SEMI : [1];
  for (const seed of semi) {
    const st = risolviCaso(c, seed, vassoio);
    if (!riuscito(st)) { f("G6", `seme ${seed}: il risolutore non lo finisce (${st.log.slice(-2).map(m => m.t).join(" / ")})`); break; }
    const stelle = Object.values(st.stelle).filter(Boolean).length;
    if (stelle < 3) { f("G6", `seme ${seed}: il risolutore prende ${stelle} stelle su 3 (${st.log.filter(m => m.esito && m.esito !== "bene").map(m => m.t).join(" / ")})`); break; }
    if (st.fiducia < 6) f("G6", `seme ${seed}: fiducia ${st.fiducia} alla fine`, "avviso");
  }

  // G7 · numeri come in negozio: il meno tipografico
  for (const [w, t] of testiCaso(c)) if (/(^|[\s(])-\d/.test(t)) f("G7", `${w}: il segno meno si scrive «−»`);

  // G8 · elenco nero
  for (const [w, t] of testiCaso(c)) { const x = nelNero(t); if (x) f("G8", `${w}: «${x}»`); }
}

function checkRic(r: RiconoscimentoDef, out: Finding[]) {
  const f = (code: string, msg: string, sev: Finding["sev"] = "errore") => out.push({ lv: `${r.id} · ${SPECIE[r.specie].nome}`, code, sev, msg });
  const testi: [string, string][] = [["dove", r.dove], ["aiuto", r.aiuto]];
  for (const [w, t] of testi) {
    if (!stanno(t)) f("G1", `${w}: «${t}» non sta in tre righe da ${COLONNE}`);
    const x = nelNero(t);
    if (x) f("G8", `${w}: «${x}»`);
  }
  for (const o of r.opzioni) if (o.nome.length > COLONNE) f("G1", `opzione «${o.nome}» più lunga di una riga`);
  if (!r.opzioni.some(o => o.id === r.specie)) f("G9", "tra le risposte manca la specie giusta");
  if (!Object.values(r.prove).includes("utile")) f("G9", "nessuna prova utile");
  if (r.opzioni.length < 2) f("G9", "servono almeno due risposte");
  // la seconda grandezza: ogni valore possibile ha la sua risposta
  const g = r.grandezza;
  if (g && (g.tipo === "sfera" || g.tipo === "cilindro")) {
    for (let seed = 1; seed <= 30; seed++) { const v = quarti(g.min, g.max, seed, r.id); if (v < g.min - 1e-9 || v > g.max + 1e-9) f("G9", `valore ${v} fuori dall'intervallo`); }
  }
  for (const seed of SEMI) {
    const st = risolviRic(r, seed);
    if (st.fine !== "preso") { f("G9", `seme ${seed}: il risolutore non lo riconosce`); break; }
  }
}

export function validateDiottri(): Finding[] {
  const out: Finding[] = [];
  for (const c of CASI) checkCaso(c, out);
  for (const r of RICONOSCIMENTI) checkRic(r, out);
  // G1 · le schede delle specie e le spiegazioni delle prove
  for (const sp of Object.values(SPECIE)) {
    const f = (code: string, msg: string) => out.push({ lv: `specie ${sp.nome}`, code, sev: "errore", msg });
    if (sp.nome.length > 10) f("G1", "nome più lungo di dieci lettere");
    for (const [w, t] of [["uso", sp.uso], ["forma", sp.forma], ["limite", sp.limite], ["prove", sp.prove]] as const) {
      if (!stanno(t)) f("G1", `${w}: «${t}» non sta in tre righe da ${COLONNE}`);
      const x = nelNero(t);
      if (x) f("G8", `${w}: «${x}»`);
    }
  }
  for (const [p, boxes] of Object.entries(INTRO_PROVE)) {
    if (boxes.length > 2) out.push({ lv: `prova ${p}`, code: "G1", sev: "errore", msg: "più di due riquadri di spiegazione" });
    for (const t of boxes) if (!stanno(t)) out.push({ lv: `prova ${p}`, code: "G1", sev: "errore", msg: `«${t}» non sta in tre righe da ${COLONNE}` });
  }
  // G1 e G8 · i testi del mondo: dialoghi, cartelli, porte chiuse; le scelte stanno in una riga corta
  const scelte = (ev: Evento): string[] => (ev as Comando[]).flatMap(c => ("scelta" in c ? [...c.voci.map(v => v.testo), ...c.voci.flatMap(v => scelte(v.fai))] : "se" in c ? [...scelte(c.allora), ...scelte(c.altrimenti ?? [])] : []));
  for (const m of Object.values(MAPPE)) {
    const f = (code: string, msg: string) => out.push({ lv: `mondo ${m.id}`, code, sev: "errore", msg });
    const eventi: Evento[] = [
      ...m.personaggi.flatMap(p => p.parla.map(b => b.fai)),
      ...m.cose.flatMap(c => c.tocca.map(b => b.fai)),
      ...m.timbri.flatMap(t => (t.tocca ?? []).map(b => b.fai)),
      ...(m.entrando ?? []).map(b => b.fai),
      ...m.porte.filter(p => p.chiusa).map(p => [{ dice: p.chiusa! }] as Evento),
    ];
    // l'ancora è una cella libera: da lì riparte chi ha un salvataggio fuori posto
    const [ax, ay] = m.ancora;
    const va = m.legenda[m.righe[ay]?.[ax] ?? ""];
    if (!va || va.solido) f("G2", `l'ancora ${ax},${ay} non è una cella dove si cammina`);
    for (const ev of eventi) {
      for (const t of testiEvento(ev)) {
        if (!stanno(t)) f("G1", `«${t}» non sta in tre righe da ${COLONNE}`);
        const x = nelNero(t);
        if (x) f("G8", `«${t}»: «${x}»`);
      }
      for (const v of scelte(ev)) if (v.length > 20) f("G1", `la scelta «${v}» è più lunga di 20 caratteri`);
      for (const id of apreEvento(ev)) if (!ORDINE.some(o => o.id === id)) f("G2", `l'evento apre «${id}», che non è nel percorso`);
    }
  }
  // ogni passo del percorso si apre da qualche parte nel mondo
  const aperti = new Set(Object.values(MAPPE).flatMap(m => [...m.personaggi.flatMap(p => p.parla.flatMap(b => apreEvento(b.fai))), ...m.cose.flatMap(c => c.tocca.flatMap(b => apreEvento(b.fai))), ...m.timbri.flatMap(t => (t.tocca ?? []).flatMap(b => apreEvento(b.fai)))]));
  for (const o of ORDINE) if (!aperti.has(o.id)) out.push({ lv: `mondo`, code: "G2", sev: "errore", msg: `nessuno nel mondo apre «${o.id}»` });

  // G10 · i mezzi che servono per andare avanti si pagano con le vendite fatte prima, giocando bene
  out.push(...checkMezzi());

  // l'ordine contiene tutto, una volta
  const ids = ORDINE.map(o => o.id);
  for (const c of CASI) if (!ids.includes(c.id)) out.push({ lv: c.id, code: "G2", sev: "errore", msg: "il caso non è nell'ordine" });
  for (const r of RICONOSCIMENTI) if (!ids.includes(r.id)) out.push({ lv: r.id, code: "G9", sev: "errore", msg: "il riconoscimento non è nell'ordine" });
  return out;
}

/**
 * G10: si gioca il percorso in fila, giocando bene ma senza vendere niente in più del necessario. Quando un passo
 * non si raggiunge a piedi dall'ancora del borgo, serve un mezzo: deve esistere, e la cassa deve bastare.
 */
function checkMezzi(): Finding[] {
  const out: Finding[] = [];
  const borgo = MAPPE.borgo;
  const segni = ["inizio", "misurato", "furto", "prologo"];
  const fatti: string[] = [];
  const ctx = (s: string[]): Contesto => ({ fatto: id => fatti.includes(id), segni: s });
  const CASO = Object.fromEntries(CASI.map(c => [c.id, c]));
  let cassa = 0;
  for (const o of ORDINE) {
    const c = ctx(segni);
    const chi = [...personaggiPresenti(borgo, c).map(p => ({ x: p.x, y: p.y, apre: p.parla.flatMap(b => apreEvento(b.fai)) })), ...cosePresenti(borgo, c).map(k => ({ x: k.x, y: k.y, apre: k.tocca.flatMap(b => apreEvento(b.fai)) }))]
      .find(p => p.apre.includes(o.id));
    if (chi) {
      const da: StatoMondo = { mappa: "borgo", x: borgo.ancora[0], y: borgo.ancora[1], dir: "su", segni };
      if (!strada(borgo, da, chi.x, chi.y, c)) {
        const mezzo = Object.values(ARTICOLI).find(a => a.mondo <= MONDO_ORA && !segni.includes(segnoDi(a.id)) && strada(borgo, da, chi.x, chi.y, ctx([...segni, segnoDi(a.id)])));
        if (!mezzo) out.push({ lv: o.id, code: "G10", sev: "errore", msg: "non si raggiunge, neanche con un mezzo" });
        else if (cassa < mezzo.prezzo) out.push({ lv: o.id, code: "G10", sev: "errore", msg: `serve ${mezzo.nome} (${mezzo.prezzo} €), ma giocando bene prima si guadagnano ${cassa} €` });
        else { cassa -= mezzo.prezzo; segni.push(segnoDi(mezzo.id)); }
      }
    }
    if (o.tipo === "caso") cassa += provvigioneMinima(CASO[o.id], 1, vassoioPrima(o.id));
    fatti.push(o.id);
  }
  return out;
}
