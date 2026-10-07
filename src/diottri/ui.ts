/* ====== DIOTTRI · INTERFACCIA (MANDATA 2: GRAFICA PROVVISORIA) ======
   Come nei corsi: le schermate sono stringhe HTML, i tocchi passano da un solo ascoltatore.
   La logica sta in core/ e gira senza disegno; qui si legge lo stato e si chiamano le mosse.
   mountDiottri(app) la monta dentro un elemento. */
import { diop, PLANO, see, type Sight } from "../ottica/core/eye";
import { fascia, forbice, moto } from "../ottica/core/lente";
import { sharpWords, workWords } from "../ottica/draw";
import { CASI, INTRO_PROVE, ORDINE, RICONOSCIMENTI, SPECIE } from "./content";
import { VASSOIO_INIZIO } from "./content/specie";
import * as K from "./core/caso";
import * as R from "./core/riconosci";
import { semeNuovo } from "./core/rng";
import { abbagliamentoAttuale, bisogni, lenteAttuale, occhiale, opzioneDi, riflessoAttuale, taccheRiflessi, vista } from "./core/valuta";
import { ESITO, FAMIGLIA_NOME, type Momento, MOMENTI, MOMENTO_NOME, MOSTRA_NOME, type MostraId, type Motivo, MOTIVO_NOME, type Msg, POSTO_NOME, type PostoId, PROVA_NOME, type ProvaId, type RxCell, type SpecieId } from "./core/tipi";
import type { CasoDef, CasoState, RicState, RiconoscimentoDef } from "./core/tipi";
import * as D from "./draw";
import { INIZIO } from "./content/borgo";
import { creaGuscio, type Guscio } from "./mondo/guscio";
import type { StatoMondo } from "./mondo/tipi";

type Screen = "chi" | "mondo" | "home" | "caso" | "ric" | "vassoio";
interface Prog {
  v: 1;
  chi: "uomo" | "donna" | null;
  benvenuto: boolean;
  fatti: Record<string, { stelle?: Record<Momento, boolean>; preso?: boolean; esperto?: boolean }>;
  vassoio: SpecieId[];
  proveViste: ProvaId[];
  registro: Record<string, { ms: number; volte: number }>;
  /** il mondo: dove sei e i segni della storia (dalla mandata 3) */
  mondo?: StatoMondo;
}
interface State {
  screen: Screen;
  id: string | null;
  caso: CasoState | null;
  ric: RicState | null;
  sheet: string | null;
  logDa: number;
  ultima: ProvaId | null;
  intro: string[];
  scelta: { id: string | null; g: string | null };
  mostraVis: string;
  t0: number;
  conferma: boolean;
  /** dove si torna finito un caso o un riconoscimento: il mondo, o il percorso */
  ritorno: "mondo" | "home";
  /** l'evento del mondo che aspetta la fine del caso */
  risolvi: (() => void) | null;
}

export function mountDiottri(app: HTMLElement | null, opts: { home?: string } = {}) {
  if (!app || app.dataset.mounted) return;
  app.dataset.mounted = "1";
  const root: HTMLElement = app;
  const HOME = opts.home ?? "";

  const esc = (s: unknown) => String(s ?? "").replace(/(\d) (cm|mm|m|anni)\b/g, "$1 $2").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const CASO: Record<string, CasoDef> = Object.fromEntries(CASI.map(c => [c.id, c]));
  const RIC: Record<string, RiconoscimentoDef> = Object.fromEntries(RICONOSCIMENTI.map(r => [r.id, r]));

  /* ---------- progressi (solo su questo dispositivo) ---------- */
  const KEY = "diottri.v1";
  const fresh = (): Prog => ({ v: 1, chi: null, benvenuto: false, fatti: {}, vassoio: [...VASSOIO_INIZIO], proveViste: [], registro: {} });
  let prog = fresh();
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && s.v === 1) prog = Object.assign(fresh(), s);
  } catch { /* niente memoria: si gioca lo stesso */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch { /* ignora */ } };
  try {
    navigator.storage?.persist?.().catch(() => {});
  } catch { /* ignora */ }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") save(); });
  window.addEventListener("pagehide", save);

  let S: State = { screen: prog.chi ? "mondo" : "chi", id: null, caso: null, ric: null, sheet: null, logDa: 0, ultima: null, intro: [], scelta: { id: null, g: null }, mostraVis: "", t0: 0, conferma: false, ritorno: "mondo", risolvi: null };

  /* ---------- il mondo ---------- */
  if (!prog.mondo || !prog.mondo.mappa) prog.mondo = structuredClone(INIZIO);
  let guscio: Guscio | null = null;
  const apriDalMondo = (id: string) => new Promise<void>(res => {
    S.ritorno = "mondo";
    S.risolvi = res;
    ACTS.apri(id);
    render();
    window.scrollTo(0, 0);
  });
  function ilGuscio(): Guscio {
    if (!guscio) {
      guscio = creaGuscio({
        stato: prog.mondo!,
        fatto: id => fatto(id),
        chi: () => (prog.chi === "donna" ? "donna" : "uomo"),
        caso: apriDalMondo,
        ric: apriDalMondo,
        salva: () => { if (prog.mondo?.segni.includes("prologo")) prog.benvenuto = true; save(); },
        esci: v => { S.ritorno = "mondo"; if (v === "vassoio") ACTS.vassoio(""); else S.screen = "home"; render(); window.scrollTo(0, 0); },
      });
    }
    return guscio;
  }

  /* ---------- il percorso ---------- */
  const fatto = (id: string) => { const f = prog.fatti[id]; return !!f && (!!f.preso || !!f.stelle); };
  const aperto = (i: number) => i === 0 || fatto(ORDINE[i - 1].id);
  const nStelle = (st?: Record<Momento, boolean>) => (st ? MOMENTI.filter(m => st[m]).length : 0);

  /* ---------- pezzi di interfaccia ---------- */
  const stelle = (st: Record<Momento, boolean> | undefined, nomi = false) =>
    `<span class="stelle">${MOMENTI.map(m => `<span class="stella${st?.[m] ? " on" : ""}">${D.ICON.star(!!st?.[m])}${nomi ? `<small>${MOMENTO_NOME[m]}</small>` : ""}</span>`).join("")}</span>`;
  const tacche = (n: number) => `<span class="tacche" aria-label="${n} ${n === 1 ? "tacca" : "tacche"} su 3">${[0, 1, 2].map(i => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>`;
  const fiduciaBar = (f: number) => `<span class="fiducia" aria-label="Fiducia ${f} su 10"><span class="lbl">Fiducia</span>${Array.from({ length: 10 }, (_, i) => `<i class="${i < f ? (f >= 6 ? "ok" : f >= 3 ? "warn" : "bad") : ""}"></i>`).join("")}</span>`;

  function chiParla(m: Msg, def?: CasoDef) {
    if (m.chi === "cliente") return def ? def.cliente.nome : "Cliente";
    if (m.chi === "iride") return "Maestra Iride";
    if (m.chi === "tu") return "Tu";
    return "";
  }
  function riquadro(log: Msg[], da: number, def?: CasoDef) {
    let ms = log.slice(da);
    if (!ms.length) ms = log.slice(-2);
    ms = ms.slice(-5);
    if (!ms.length) return "";
    return `<div class="riquadro" aria-live="polite">${ms.map(m => `<p class="m da-${m.chi}">${m.esito ? `<span class="esito ${m.esito}">${ESITO[m.esito]}</span>` : ""}${chiParla(m, def) ? `<b>${esc(chiParla(m, def))}:</b> ` : ""}${esc(m.t)}</p>`).join("")}</div>`;
  }
  const bar = (title: string, right = "") =>
    `<header class="dbar"><button class="ib" data-act="home" aria-label="Indietro">${D.ICON.back}</button><h1>${esc(title)}</h1>${right}</header>`;

  /** Una riga sopra le scelte di un posto: le parole che servono per scegliere. */
  const NOTA_POSTO: Partial<Record<PostoId, string>> = {
    materiale: "1,5 · 1,6 · 1,67 · 1,74 è l'indice: più è alto, più la lente è sottile. Il policarbonato regge gli urti.",
    montatura: "52□18: la larghezza della lente (il calibro) e il ponte, in millimetri.",
    filtro: "La categoria va da 0 a 4: più è alta, più è scura. La 4 mai alla guida.",
  };

  /** Le stelle perse, e perché: una riga per momento. */
  function perse(st: CasoState) {
    const righe = MOMENTI.filter(m => !st.stelle[m] && st.perse[m]);
    if (!righe.length) return `<p class="nota">Tre stelle: occhio, spiegazione e soluzione.</p>`;
    return `<ul class="perse">${righe.map(m => `<li><b>${MOMENTO_NOME[m]}</b>: ${esc(st.perse[m])}</li>`).join("")}</ul>`;
  }

  /* ---------- schermate ---------- */

  function vChi() {
    return `<main class="schermo inizio"><h1 class="logo">Diottri</h1><p class="sotto">Il mestiere dell'ottico, giocando.</p>` +
      `<p class="dom">Chi sei?</p><div class="due">` +
      (["uomo", "donna"] as const).map(c => `<button class="scelta-chi" data-act="chi" data-arg="${c}">${D.avatarSVG(D.ASPETTO_TU[c], 96)}<span>${c === "uomo" ? "Uomo" : "Donna"}</span></button>`).join("") +
      `</div><p class="nota">Grafica provvisoria: qui si provano i due giri del gioco.</p></main>`;
  }

  function vHome() {
    const tu = prog.chi ? D.avatarSVG(D.ASPETTO_TU[prog.chi], 44) : "";
    const benv = prog.benvenuto || prog.mondo?.segni.includes("prologo") ? "" :
      `<section class="iride">${D.avatarSVG(D.ASPETTO_IRIDE, 56)}<div><p><b>Maestra Iride:</b> ${prog.chi === "donna" ? "Benvenuta" : "Benvenuto"} in bottega! Cinque clienti al banco, e cinque Diottri da ritrovare: le lenti e i pezzi del banco, scappati.</p>` +
      `<p>Due regole: la gradazione si misura, o si legge sulla ricetta. Con un allarme, niente misure: prima il medico.</p><button class="btn" data-act="ok">Cominciamo</button></div></section>`;
    const steps = ORDINE.map((p, i) => {
      const open = aperto(i), f = prog.fatti[p.id];
      if (p.tipo === "caso") {
        const c = CASO[p.id];
        return `<button class="passo caso${open ? "" : " chiuso"}" data-act="apri" data-arg="${p.id}" ${open ? "" : "disabled"}>${D.avatarSVG(c.cliente.aspetto, 44)}<span class="t"><small>Caso ${c.n} · al banco</small>${esc(c.titolo)}<em>${esc(c.cliente.nome)}, ${c.cliente.eta} anni</em></span>${open ? (f?.stelle ? stelle(f.stelle) : "") : D.ICON.lock}</button>`;
      }
      const r = RIC[p.id], sp = SPECIE[r.specie];
      return `<button class="passo ric${open ? "" : " chiuso"}" data-act="apri" data-arg="${p.id}" ${open ? "" : "disabled"}>${f?.preso ? D.diottroRitratto(r.specie, 44) : `<span class="luccica">${D.ICON.luccica}</span>`}<span class="t"><small>Riconosci un Diottro</small>${f?.preso ? esc(sp.nome) : "Qualcosa luccica…"}<em>${esc(r.dove)}</em></span>${open ? (f?.preso ? `<span class="preso">${f.esperto ? "Occhio esperto" : "Preso"}</span>` : "") : D.ICON.lock}</button>`;
    }).join("");
    const tutti = ORDINE.every(p => fatto(p.id));
    return `<main class="schermo home"><header class="hhead">${tu}<div><h1 class="logo">Diottri</h1><p class="sotto">Il percorso: rigioca un passo quando vuoi</p></div>${HOME ? `<a class="ib casa" href="${esc(HOME)}" aria-label="Tutti i corsi">${D.ICON.back}</a>` : ""}</header>` +
      `<button class="btn primaria" data-act="mondo">Torna al borgo</button>` +
      benv + `<nav class="percorso">${steps}</nav>` +
      (tutti ? `<section class="iride">${D.avatarSVG(D.ASPETTO_IRIDE, 56)}<div><p><b>Maestra Iride:</b> Fatto tutto! Rigioca quando vuoi: i clienti cambiano gradazione, i Diottri cambiano forza.</p></div></section>` : "") +
      `<div class="piede"><button class="btn sec" data-act="vassoio">Vassoio e Campionario</button></div></main>`;
  }

  /* ---------- il caso ---------- */

  function scenaCaso(def: CasoDef, st: CasoState): { svg: string; cap: string } {
    if (def.scena === "lago") {
      const o = occhiale(def, st);
      const tinta = o.filtro ? (o.filtro.polarizzata ? "#2f3e46" : "#5a3a1e") : null;
      return { svg: D.lagoSVG({ trasm: o.trasm, abbaglio: abbagliamentoAttuale(def, st), tinta }), cap: `Come vede ${def.cliente.nome}: il lago a mezzogiorno · passa il ${Math.round(o.trasm * 100)}% della luce` };
    }
    const vb = def.bisogni.find(b => b.tipo === "lontano" || b.tipo === "vicino");
    const d = vb?.tipo === "vicino" ? vb.d ?? 0.4 : Infinity;
    const v = vista(def, st, d);
    const s = v.od.B >= v.os.B ? v.od : v.os;
    const rifl = def.bisogni.some(b => b.tipo === "riflessi") ? taccheRiflessi(riflessoAttuale(def, st)) / 3 : 0;
    return {
      svg: D.scenaSVG(def.scena, s, { riflessi: rifl }),
      cap: `Come vede ${def.cliente.nome} · ${d === Infinity ? "lontano" : "da vicino"} · destro ${v.od.decimi}/10, sinistro ${v.os.decimi}/10 · ${sharpWords(s)}, ${workWords(s)}`,
    };
  }

  /** L'occhiale si mostra anche nei casi d'allarme: lo schermo non deve dire che è un allarme. */
  const conOcchiale = (def: CasoDef) => def.serveLente || !!def.allarme;

  function lenteTesto(def: CasoDef, st: CasoState) {
    if (!conOcchiale(def)) return "—";
    if (!st.lente) return "da misurare";
    return `OD ${diop(st.lente.od.sph)} · OS ${diop(st.lente.os.sph)}`;
  }

  /** Il primo caso, la prima volta: una riga della Maestra dice la mossa dopo. Niente da leggere prima. */
  function consiglio(def: CasoDef, st: CasoState) {
    if (def.id !== ORDINE[0].id || prog.fatti[def.id] || st.fine) return "";
    const t = !st.chieste.length ? "Prima chiedi: tocca Chiedi."
      : !st.lente ? (st.chieste.length < 2 ? "Chiedi ancora, poi tocca Misura." : "Ora la misura: tocca Misura.")
      : K.mancaPerConsegna(def, st) ? "Guarda le tacche dei bisogni: vanno a zero."
      : "Tacche a zero: tocca Consegna!";
    return `<p class="consiglio">${D.avatarSVG(D.ASPETTO_IRIDE, 32)}<span><b>Maestra Iride:</b> ${esc(t)}</span></p>`;
  }

  function vCaso() {
    const def = CASO[S.id!], st = S.caso!;
    const sc = scenaCaso(def, st);
    const bs = bisogni(def, st).filter(b => b.visibile);
    const dubbio = K.dubbioAperto(def, st);
    const posti = Object.keys(def.posti) as PostoId[];
    const cl = def.cliente;
    return `<main class="schermo caso">${bar(`Caso ${def.n} · ${def.titolo}`, fiduciaBar(st.fiducia))}` +
      `<section class="cliente">${D.avatarSVG(cl.aspetto, 64)}<div><p class="nome">${esc(cl.nome)}, ${cl.eta} anni · ${esc(cl.lavoro)}</p><p class="indizio">${esc(cl.indizio)}</p></div></section>` +
      `<figure class="scena">${sc.svg}<figcaption>${esc(sc.cap)}</figcaption></figure>` +
      (bs.length ? `<section class="bisogni"><h2>Bisogni</h2><ul>${bs.map(b => `<li class="${b.tacche === 0 && !b.vietato ? "ok" : ""}${b.vietato ? " vietato" : ""}"><span class="n">${esc(b.nome)}</span>${b.tipo === "guida" ? `<span class="g">${b.vietato ? "vietato" : "sì"}</span>` : tacche(b.tacche)}<small>${esc(b.nota)}</small></li>`).join("")}</ul></section>` : "") +
      (conOcchiale(def) ? `<section class="occhiale"><h2>L'occhiale</h2><div class="posti"><button class="posto" data-act="sheet" data-arg="misura"><small>Lente</small>${esc(lenteTesto(def, st))}</button>${posti.map(p => `<button class="posto" data-act="posto" data-arg="${p}"><small>${POSTO_NOME[p]}</small>${esc(opzioneDi(def, st, p).nome)}</button>`).join("")}</div></section>` : "") +
      (S.mostraVis ? `<div class="mostravis">${S.mostraVis}</div>` : "") +
      riquadro(st.log, S.logDa, def) + consiglio(def, st) +
      `<nav class="azioni"><button data-act="sheet" data-arg="chiedi">Chiedi</button><button data-act="sheet" data-arg="misura">Misura</button><button data-act="sheet" data-arg="costruisci" ${conOcchiale(def) ? "" : "disabled"}>Costruisci</button>` +
      `<button data-act="sheet" data-arg="mostra" class="${dubbio ? "accendi" : ""}" ${dubbio ? "" : "disabled"}>Mostra</button><button data-act="sheet" data-arg="medico">Medico</button><button data-act="consegna" class="primaria" ${conOcchiale(def) ? "" : "disabled"}>Consegna</button></nav>` +
      sheetCaso(def, st) + provaOverlay(def, st) + ricettaOverlay(def, st) + fineCaso(def, st) + `</main>`;
  }

  function sheet(title: string, body: string) {
    return `<div class="velo" data-act="chiudi"></div><section class="foglio" role="dialog" aria-label="${esc(title)}"><header><h2>${esc(title)}</h2><button class="ib" data-act="chiudi" aria-label="Chiudi">✕</button></header><div class="sbody">${body}</div></section>`;
  }

  function sheetCaso(def: CasoDef, st: CasoState) {
    const sh = S.sheet;
    if (!sh || st.fine || st.prova || st.ricetta) return "";
    if (sh === "chiedi") {
      return sheet("Chiedi", `<div class="lista">${def.domande.map(q => {
        const fatta = st.chieste.includes(q.id);
        return `<button class="opz" data-act="chiedi" data-arg="${q.id}" ${fatta ? "disabled" : ""}><b>${esc(q.testo)}</b>${fatta ? `<small>${esc(q.risposta)}</small>` : ""}</button>`;
      }).join("")}</div>`);
    }
    if (sh === "misura") {
      const r = def.ricetta && (!def.ricetta.nascosta || K.scoperto(st, "ricetta"));
      return sheet("Misura", `<div class="lista">` +
        (r ? `<button class="opz" data-act="ricetta"><b>La ricetta</b><small>dell'oculista, ${esc(def.ricetta!.quando)}</small></button>` : "") +
        `<button class="opz" data-act="prova"><b>Prova lenti</b><small>un occhio alla volta, con le lenti di prova</small></button>` +
        `<button class="opz" data-act="vecchi"><b>Frontifocometro</b><small>misura gli occhiali che porta</small></button>` +
        (st.vecchiLetti && def.vecchi ? `<button class="opz" data-act="uguali"><b>Rifalli uguali</b><small>OD ${diop(def.vecchi.od.sph)} · OS ${diop(def.vecchi.os.sph)}</small></button>` : "") +
        `</div>` + (S.logDa < st.log.length ? riquadro(st.log, S.logDa, def) : ""));
    }
    if (sh === "costruisci") {
      const posti = Object.keys(def.posti) as PostoId[];
      return sheet("Costruisci", `<div class="lista">${posti.map(p => `<button class="opz" data-act="posto" data-arg="${p}"><b>${POSTO_NOME[p]}</b><small>adesso: ${esc(opzioneDi(def, st, p).nome)}</small></button>`).join("")}</div>`);
    }
    if (sh.startsWith("posto:")) {
      const p = sh.slice(6) as PostoId;
      const cur = st.posti[p];
      return sheet(POSTO_NOME[p], (NOTA_POSTO[p] ? `<p class="nota">${esc(NOTA_POSTO[p])}</p>` : "") + `<div class="lista">${K.opzioniDisponibili(def, st, p).map(o => `<button class="opz${o.id === cur ? " cur" : ""}" data-act="metti" data-arg="${p}|${o.id}" ${o.id === cur ? "disabled" : ""}><b>${esc(o.nome)}</b>${o.serve ? `<small>col Diottro ${esc(SPECIE[o.serve].nome)}</small>` : ""}${o.id === cur ? "<small>adesso</small>" : ""}</button>`).join("")}</div>`);
    }
    if (sh === "mostra") {
      const d = K.dubbioAperto(def, st);
      if (!d) return "";
      const s = st.dubbi.find(x => x.id === d.id)!;
      return sheet("Mostra", `<p class="dubbio">«${esc(d.domanda)}»</p><div class="lista">${d.mostra.map(m => `<button class="opz" data-act="mostra" data-arg="${m.id}" ${s.tentati.includes(m.id) ? "disabled" : ""}><b>${esc(MOSTRA_NOME[m.id])}</b></button>`).join("")}</div>`);
    }
    if (sh === "medico") {
      return sheet("Medico", `<p class="nota">Con un allarme non si misura: si sceglie qui.</p><div class="lista">` +
        `<button class="opz" data-act="medico" data-arg="subito"><b>Medico, subito</b><small>pronto soccorso adesso, o il 112</small><small class="se">Se: vista calata o doppia all'improvviso, un prodotto chimico, una ferita.</small></button>` +
        `<button class="opz" data-act="medico" data-arg="oggi"><b>Medico, oggi</b><small>oculista o pronto soccorso, in giornata</small><small class="se">Se: dolore o occhio rosso, lampi o una tenda nuovi, righe storte, un colpo.</small></button>` +
        `<button class="opz" data-act="sheet" data-arg="visita"><b>Consiglia la visita</b><small>dall'oculista, senza urgenza: si misura lo stesso</small><small class="se">Se: un bambino, decimi che non arrivano, una gradazione che cambia in fretta.</small></button></div>`);
    }
    if (sh === "visita") {
      return sheet("Il motivo della visita", `<div class="lista">${(Object.keys(MOTIVO_NOME) as Motivo[]).map(m => `<button class="opz" data-act="visita" data-arg="${m}"><b>${esc(MOTIVO_NOME[m])}</b></button>`).join("")}</div>`);
    }
    return "";
  }

  function provaOverlay(def: CasoDef, st: CasoState) {
    const p = st.prova;
    if (!p || st.fine) return "";
    const o = p.occhio;
    const s = see({ rx: st.occhio[o], age: st.occhio.age }, { ...PLANO, sph: p.v }, Infinity);
    const serve = K.lenteServe(p.v);
    const tab = (x: "od" | "os") => `<button class="tab${x === o ? " on" : ""}" data-act="occhio" data-arg="${x}">${x === "od" ? "Destro" : "Sinistro"}${p.fatti[x] !== undefined ? ` ✓ ${diop(p.fatti[x]!)}` : ""}</button>`;
    return `<div class="velo pieno"></div><section class="overlay prova" role="dialog" aria-label="Prova lenti"><header><h2>Prova lenti</h2><button class="ib" data-act="chiudiProva" aria-label="Chiudi">✕</button></header>` +
      `<div class="occhi">${tab("od")}${tab("os")}</div><p class="coperto">${o === "od" ? "Il sinistro è coperto." : "Il destro è coperto."}</p>` +
      `<figure class="scena">${D.scenaSVG(def.scenaProva ?? "strada", s)}<figcaption>${s.decimi}/10 · ${sharpWords(s)} · l'occhio ${workWords(s)}${s.work === "poco" || s.work === "lavora" || s.work === "fatica" ? ` (${Math.round(s.effort * 100)}%)` : ""}</figcaption></figure>` +
      `<div class="valore"><b>${diop(p.v)}</b><small>${serve ? `${p.v < 0 ? "col meno" : "col più"}: ${esc(SPECIE[serve].nome)}` : "senza lente"}</small></div>` +
      `<div class="passi">${[-1, -0.25, 0.25, 1].map(d => `<button data-act="sposta" data-arg="${d}">${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(2).replace(".", ",")}</button>`).join("")}</div>` +
      `<button class="btn primaria" data-act="conferma">È questa</button>` + riquadro(st.log, S.logDa, def) + `</section>`;
  }

  function ricettaOverlay(def: CasoDef, st: CasoState) {
    const r = st.ricetta;
    if (!r || st.fine || !def.ricetta) return "";
    const cerca = r.caselle[r.passo];
    const cella = (c: RxCell, v: string) => `<td><button class="rx" data-act="tocca" data-arg="${c}">${esc(v)}</button></td>`;
    const riga = (o: "OD" | "OS") => {
      const l = o === "OD" ? def.ricetta!.od : def.ricetta!.os;
      return `<tr><th>${o}</th>${cella(`${o}.SF` as RxCell, diop(l.sph))}${cella(`${o}.CIL` as RxCell, l.cyl ? diop(l.cyl) : "—")}${cella(`${o}.AX` as RxCell, l.cyl ? `${l.axis}°` : "—")}</tr>`;
    };
    return `<div class="velo pieno"></div><section class="overlay ricetta" role="dialog" aria-label="La ricetta"><header><h2>La ricetta</h2><button class="ib" data-act="chiudiRicetta" aria-label="Chiudi">✕</button></header>` +
      `<p class="cerca">Tocca <b>${esc(K.RX_NOME[cerca])}</b>.</p>` +
      `<table class="rxtab"><thead><tr><th></th><th>SF</th><th>CIL</th><th>AX</th></tr></thead><tbody>${riga("OD")}${riga("OS")}</tbody></table><p class="nota">OD destro, OS sinistro · SF sfera, CIL cilindro, AX asse. Dell'oculista, ${esc(def.ricetta.quando)}.</p>` +
      riquadro(st.log, S.logDa, def) + `</section>`;
  }

  function fineCaso(def: CasoDef, st: CasoState) {
    if (!st.fine) return "";
    const fin = K.stelleFinali(st);
    const titolo = st.fine === "consegnato" ? "Ci vedo!" : st.fine === "medico" ? "Al medico" : st.fine === "chiuso" ? "Caso chiuso" : "Se n'è andato";
    const ok = K.riuscito(st);
    return `<div class="velo pieno"></div><section class="overlay fine" role="dialog" aria-label="${esc(titolo)}"><h2 class="logo">${esc(titolo)}</h2>` +
      (ok ? stelle(fin, true) + perse(st) : `<p>${st.fine === "chiuso" ? "Non era un caso da medico: si rigioca." : "Con troppi errori il cliente se ne va: si rigioca."}</p>`) +
      riquadro(st.log, Math.max(0, st.log.length - 3), def) +
      `<button class="btn primaria" data-act="fineCaso">${ok ? "Torna al percorso" : "Torna e riprova"}</button></section>`;
  }

  /* ---------- il riconoscimento ---------- */

  function visProva(def: RiconoscimentoDef, st: RicState, p: ProvaId): string {
    const sp = def.specie, l = R.lenteDi(sp, st.valore);
    switch (p) {
      case "neutralizza": {
        if (!l) return "";
        if (l.cyl) return D.neutralizzaSVG({ moto: "con", fascia: fascia(l.cyl) });
        const m = moto(l, 180);
        return D.neutralizzaSVG({ moto: m.moto, fascia: fascia(m.velocita || 0.1), scala: l.sph < -0.12 ? 0.85 : l.sph > 0.12 ? 1.15 : 1 });
      }
      case "ruota": return l ? D.ruotaSVG(forbice(l)) : "";
      case "dilato": return l ? D.profiloSVG(l.sph + Math.min(0, l.cyl), { label: "La lente di lato" }) : "";
      case "riflesso": return l ? D.riflessoSVG(sp === "verdino", sp === "polare" || sp === "bruno") : "";
      case "polarizzate": return l ? D.polarizzateSVG(sp === "polare") : "";
      case "telefono": return l ? D.telefonoSVG(sp === "polare") : "";
      case "luce": return l ? D.luceSVG(R.luceDi(sp, st.valore)) : "";
      case "caldo": return D.caldoSVG(sp === "cello");
      case "asta": return sp === "cello" ? D.astaSVG(`Acetate ${st.valore}□18 140`) : "";
    }
  }

  const famDavanti = (sp: SpecieId) => (SPECIE[sp].famiglia === "montatura" ? "montatura" : SPECIE[sp].famiglia === "sole" ? "sole" : "lente");

  /** Il primo riconoscimento, la prima volta: una riga della Maestra su come si gioca. */
  function consiglioRic(def: RiconoscimentoDef, st: RicState) {
    const primo = ORDINE.find(o => o.tipo === "ric")!.id;
    if (def.id !== primo || prog.fatti[def.id] || st.fine) return "";
    const t = !st.provate.length ? "Tocca una prova del banco. Le prove inutili lo spaventano." : "Hai visto abbastanza? Tocca Riconosci.";
    return `<p class="consiglio">${D.avatarSVG(D.ASPETTO_IRIDE, 32)}<span><b>Maestra Iride:</b> ${esc(t)}</span></p>`;
  }

  function vRic() {
    const def = RIC[S.id!], st = S.ric!;
    const provate = st.provate;
    const ultima = S.ultima;
    const diff = `<span class="diff" aria-label="Diffidenza ${st.diffidenza} su 6"><span class="lbl">Diffidenza</span>${Array.from({ length: 6 }, (_, i) => `<i class="${i < st.diffidenza ? "on" : ""}"></i>`).join("")}</span>`;
    const gs = R.sceltaGrandezza(def);
    return `<main class="schermo ric">${bar("Riconosci un Diottro", diff)}` +
      `<p class="dove">${D.ICON.luccica} ${esc(def.dove)}</p>` +
      `<div class="creatura">${D.diottroDavanti(famDavanti(def.specie), 132)}</div>` +
      (S.intro.length ? `<section class="iride intro">${D.avatarSVG(D.ASPETTO_IRIDE, 44)}<div>${S.intro.map(t => `<p>${esc(t)}</p>`).join("")}</div></section>` : "") +
      (consiglioRic(def, st) || (ultima ? "" : `<p class="nota centro">Prova: tocca uno strumento del banco.</p>`)) +
      (ultima ? `<figure class="risultato">${visProva(def, st, ultima)}<figcaption>${esc(R.osserva(def, st, ultima))}</figcaption></figure>` : "") +
      `<section class="prove"><h2>Le prove del banco</h2><div class="griglia">${(Object.keys(def.prove) as ProvaId[]).map(p => `<button class="pr${provate.includes(p) ? " fatta" : ""}${p === ultima ? " ultima" : ""}" data-act="provaRic" data-arg="${p}">${esc(PROVA_NOME[p])}${provate.includes(p) ? " ✓" : ""}</button>`).join("")}</div></section>` +
      // nel riquadro solo quello che non è già scritto sotto la prova
      riquadro(st.log.slice(S.logDa).filter(m => !(ultima && m.chi === "gioco" && m.t === R.osserva(def, st, ultima))), 0) +
      `<nav class="azioni una"><button class="primaria" data-act="sheet" data-arg="riconosci">Riconosci</button></nav>` +
      (S.sheet === "riconosci" && !st.fine ? sheet("Cos'è?", `<div class="lista">${def.opzioni.map(o => `<button class="opz${S.scelta.id === o.id ? " cur" : ""}" data-act="sceltaId" data-arg="${o.id}"><b>${esc(o.nome)}</b></button>`).join("")}</div>` +
        (gs ? `<h3>${esc(gs.nome)}</h3><div class="chips">${gs.opzioni.map(g => `<button class="chip${S.scelta.g === g ? " on" : ""}" data-act="sceltaG" data-arg="${g}">${esc(g)}</button>`).join("")}</div>` : "") +
        `<button class="btn primaria" data-act="riconosci" ${S.scelta.id && (!gs || S.scelta.g) ? "" : "disabled"}>Riconosci</button>`) : "") +
      fineRic(def, st) + `</main>`;
  }

  function scheda(sp: SpecieId) {
    const s = SPECIE[sp];
    const prof = sp === "conca" ? D.profiloSVG(-4, { label: "Una Conca da −4,00, di lato", colore: D.coloreSpecie(sp) }) : sp === "bombo" ? D.profiloSVG(4, { label: "Un Bombo da +4,00, di lato", colore: D.coloreSpecie(sp) }) : "";
    return `<article class="scheda"><header>${D.diottroRitratto(sp, 72)}<div><h3>${esc(s.nome)}</h3><small>${FAMIGLIA_NOME[s.famiglia]}</small></div></header>` +
      `<dl><dt>A cosa serve</dt><dd>${esc(s.uso)}</dd><dt>Com'è fatto</dt><dd>${esc(s.forma)}</dd><dt>Il suo limite</dt><dd>${esc(s.limite)}</dd><dt>Come si riconosce</dt><dd>${esc(s.prove)}</dd></dl>` +
      prof + `<ul class="lessico">${s.lessico.map(([a, b]) => `<li><b>${esc(a)}</b> · ${esc(b)}</li>`).join("")}</ul></article>`;
  }

  function fineRic(def: RiconoscimentoDef, st: RicState) {
    if (!st.fine) return "";
    if (st.fine === "scappato") {
      return `<div class="velo pieno"></div><section class="overlay fine" role="dialog" aria-label="Scappato"><h2 class="logo">Scappato!</h2><p>Lo ritrovi dopo: le prove le hai viste.</p>` +
        riquadro(st.log, Math.max(0, st.log.length - 3)) + `<button class="btn primaria" data-act="fineRic">Torna al percorso</button></section>`;
    }
    return `<div class="velo pieno"></div><section class="overlay fine" role="dialog" aria-label="Preso"><h2 class="logo">Preso!</h2>${st.occhioEsperto ? `<p class="badge">Occhio esperto: una prova sola</p>` : ""}${scheda(def.specie)}<button class="btn primaria" data-act="fineRic">Nel vassoio</button></section>`;
  }

  /* ---------- vassoio e Campionario ---------- */

  function vVassoio() {
    const tutte = Object.keys(SPECIE) as SpecieId[];
    const reg = ORDINE.filter(p => prog.registro[p.id]).map(p => {
      const r = prog.registro[p.id];
      const nome = p.tipo === "caso" ? `Caso ${CASO[p.id].n} · ${CASO[p.id].titolo}` : `Riconosci · ${RIC[p.id].dove}`;
      return `<li>${esc(nome)}: ${Math.max(1, Math.round(r.ms / 60000))} min, ${r.volte} ${r.volte === 1 ? "volta" : "volte"}</li>`;
    }).join("");
    return `<main class="schermo vassoio">${bar("Vassoio e Campionario")}` +
      `<section><h2>Il tuo vassoio</h2>${prog.vassoio.map(scheda).join("")}</section>` +
      `<section><h2>Il Campionario</h2><div class="campionario">${tutte.map(sp => prog.vassoio.includes(sp) ? `<div class="cs">${D.diottroRitratto(sp, 56)}<small>${esc(SPECIE[sp].nome)}</small></div>` : `<div class="cs ignoto">${D.diottroDavanti("sconosciuto", 56)}<small>???</small></div>`).join("")}</div></section>` +
      (reg ? `<section><h2>Registro</h2><ul class="registro">${reg}</ul></section>` : "") +
      `<section class="reset">${S.conferma ? `<p>Cancello tutto e si ricomincia da capo?</p><button class="btn pericolo" data-act="resetSi">Sì, da capo</button> <button class="btn sec" data-act="resetNo">No</button>` : `<button class="btn sec" data-act="reset">Ricomincia da capo</button>`}</section></main>`;
  }

  /* ---------- disegno ---------- */

  function view() {
    switch (S.screen) {
      case "chi": return vChi();
      case "mondo": return ilGuscio().html();
      case "home": return vHome();
      case "caso": return vCaso();
      case "ric": return vRic();
      case "vassoio": return vVassoio();
    }
  }
  function render() {
    // il mondo resta montato: il canvas, il riquadro e l'evento in corso non si ricreano a ogni tocco
    if (S.screen === "mondo" && root.querySelector(".gb")) return;
    guscio?.stacca();
    root.innerHTML = view();
    if (S.screen === "mondo") ilGuscio().attacca(root.querySelector<HTMLElement>(".gb")!);
  }

  /** Torna dove si era (il mondo o il percorso); se un evento del mondo aspettava, riparte. */
  function torna() {
    const r = S.risolvi;
    S = { ...S, screen: S.ritorno, id: null, caso: null, ric: null, sheet: null, ultima: null, intro: [], mostraVis: "", conferma: false, risolvi: null };
    render();
    if (r) setTimeout(r, 0);
  }

  let toastT = 0;
  function toast(t: string) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = t;
    el.hidden = false;
    clearTimeout(toastT);
    toastT = window.setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ---------- le mosse ---------- */

  const caso = () => ({ def: CASO[S.id!], st: S.caso! });
  /** prima di una mossa: il riquadro mostrerà quello che succede da qui */
  const segna = () => { if (S.caso) S.logDa = S.caso.log.length; if (S.ric) S.logDa = S.ric.log.length; S.mostraVis = ""; };

  function registra(id: string) {
    const r = prog.registro[id] || { ms: 0, volte: 0 };
    prog.registro[id] = { ms: r.ms + Math.max(0, Date.now() - S.t0), volte: r.volte + 1 };
  }

  function visMostra(def: CasoDef, st: CasoState, id: MostraId): string {
    const l = lenteAttuale(def, st), o = occhiale(def, st);
    const F = Math.abs(l.od.sph) >= Math.abs(l.os.sph) ? l.od.sph : l.os.sph;
    switch (id) {
      case "dilato": return D.profiloSVG(F, { mat: o.materiale, ...o.montatura, dp: def.dp, label: `La sua lente, ${diop(F)}` });
      case "confronto": return D.confrontoSVG(F, o.materiale === "i167" ? "cr39" : o.materiale, o.montatura, def.dp);
      case "goccia": return D.gocciaSVG();
      case "lavora": {
        const vb = def.bisogni.find(b => b.tipo === "vicino");
        const d = vb ? vb.d ?? 0.4 : Infinity;
        const eye = { rx: st.occhio.od, age: st.occhio.age };
        const senza: Sight = see(eye, PLANO, d), con: Sight = see(eye, l.od, d);
        return D.lavoraSVG(senza.effort, con.effort);
      }
      case "polarizzate": return D.polarizzateSVG(true);
      case "riflesso": return D.riflessoSVG(o.antiriflesso);
    }
  }

  const ACTS: Record<string, (a: string) => void> = {
    chi: a => { prog.chi = a === "donna" ? "donna" : "uomo"; save(); S.screen = "mondo"; },
    ok: () => { prog.benvenuto = true; save(); S.ritorno = "home"; ACTS.apri(ORDINE[0].id); },
    home: () => { torna(); },
    mondo: () => { S.ritorno = "mondo"; S.risolvi = null; S.screen = "mondo"; },
    vassoio: () => { S.screen = "vassoio"; S.conferma = false; },
    apri: id => {
      if (S.screen === "home") S.ritorno = "home";
      S.id = id; S.sheet = null; S.ultima = null; S.intro = []; S.mostraVis = ""; S.logDa = 0; S.t0 = Date.now();
      S.scelta = { id: null, g: null };
      if (CASO[id]) { S.caso = K.nuovoCaso(CASO[id], semeNuovo(), prog.vassoio); S.ric = null; S.screen = "caso"; }
      else { S.ric = R.nuovoRic(RIC[id], semeNuovo()); S.caso = null; S.screen = "ric"; }
    },
    sheet: a => { S.sheet = S.sheet === a ? null : a; },
    chiudi: () => { S.sheet = null; },
    chiedi: id => { const { def, st } = caso(); segna(); K.chiedi(def, st, id); S.sheet = null; },
    ricetta: () => { const { def, st } = caso(); segna(); K.apriRicetta(def, st); S.sheet = null; },
    tocca: c => { const { def, st } = caso(); segna(); K.toccaRicetta(def, st, c as RxCell); },
    chiudiRicetta: () => { S.caso!.ricetta = null; },
    prova: () => { const { def, st } = caso(); segna(); K.apriProva(def, st); S.sheet = null; },
    sposta: d => {
      const { st } = caso();
      if (!K.spostaProva(st, Number(d))) {
        const v = (st.prova?.v ?? 0) + Number(d);
        const serve = K.lenteServe(v);
        toast(serve && !st.vassoio.includes(serve) ? `Per ${v > 0 ? "il più" : "il meno"} ti serve ${SPECIE[serve].nome}: non è nel vassoio.` : "Più in là la cassetta non arriva.");
      }
    },
    occhio: o => { const { def, st } = caso(); K.occhioProva(def, st, o === "os" ? "os" : "od"); },
    conferma: () => { const { def, st } = caso(); segna(); K.confermaProva(def, st); },
    chiudiProva: () => { K.chiudiProva(S.caso!); },
    vecchi: () => { const { def, st } = caso(); segna(); K.leggiVecchi(def, st); },
    uguali: () => { const { def, st } = caso(); segna(); K.usaVecchi(def, st); S.sheet = null; },
    posto: p => { S.sheet = `posto:${p}`; },
    metti: a => { const [p, id] = a.split("|"); const { def, st } = caso(); segna(); K.metti(def, st, p as PostoId, id); S.sheet = null; },
    mostra: id => { const { def, st } = caso(); segna(); S.mostraVis = visMostra(def, st, id as MostraId); K.mostra(def, st, id as MostraId); S.sheet = null; },
    visita: m => { const { def, st } = caso(); segna(); K.consigliaVisita(def, st, m as Motivo); S.sheet = null; },
    medico: u => { const { def, st } = caso(); segna(); K.medico(def, st, u === "subito" ? "subito" : "oggi"); S.sheet = null; },
    consegna: () => { const { def, st } = caso(); segna(); K.consegna(def, st); },
    fineCaso: () => {
      const st = S.caso!;
      registra(st.id);
      if (K.riuscito(st)) {
        const prima = prog.fatti[st.id]?.stelle;
        const ora = K.stelleFinali(st);
        prog.fatti[st.id] = { stelle: nStelle(prima) > nStelle(ora) ? prima : ora };
      }
      save();
      ACTS.home("");
    },
    provaRic: p => {
      const def = RIC[S.id!], st = S.ric!;
      segna();
      const r = R.prova(def, st, p as ProvaId);
      S.ultima = p as ProvaId;
      S.intro = [];
      if (r && !prog.proveViste.includes(p as ProvaId)) {
        S.intro = INTRO_PROVE[p as ProvaId];
        prog.proveViste.push(p as ProvaId);
        save();
      }
    },
    sceltaId: id => { S.scelta.id = id; },
    sceltaG: g => { S.scelta.g = g; },
    riconosci: () => {
      const def = RIC[S.id!], st = S.ric!;
      segna();
      R.riconosci(def, st, S.scelta.id!, S.scelta.g);
      S.sheet = null;
      S.scelta = { id: null, g: null };
      if (st.fine === "preso") {
        if (!prog.vassoio.includes(def.specie)) prog.vassoio.push(def.specie);
        const f = prog.fatti[def.id];
        prog.fatti[def.id] = { preso: true, esperto: !!f?.esperto || st.occhioEsperto };
        save();
      }
    },
    fineRic: () => { registra(S.ric!.id); save(); ACTS.home(""); },
    reset: () => { S.conferma = true; },
    resetNo: () => { S.conferma = false; },
    resetSi: () => { const chi = prog.chi; prog = fresh(); prog.chi = chi; save(); S.conferma = false; S.screen = "home"; },
  };

  root.addEventListener("click", e => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
    if (!el || el.hasAttribute("disabled")) return;
    const act = el.dataset.act!;
    const fn = ACTS[act];
    if (!fn) return;
    fn(el.dataset.arg ?? "");
    render();
    if (["apri", "ok", "home", "vassoio", "chi", "fineCaso", "fineRic"].includes(act)) window.scrollTo(0, 0);
  });

  /* per i test e le prove alla cieca */
  const solProva = () => { const st = S.caso, o = st?.prova?.occhio; return st && o ? K.soluzioneProva({ rx: st.occhio[o], age: st.occhio.age }) : NaN; };
  (window as unknown as { __dio: unknown }).__dio = { get S() { return S; }, get prog() { return prog; }, get mondo() { return guscio; }, ACTS, CASO, RIC, render, solProva };

  render();
}
