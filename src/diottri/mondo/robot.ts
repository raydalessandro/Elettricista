/* ====== DIOTTRI · IL ROBOT ======
   Gioca tutto il mondo da capo a fondo, come farebbe chi gioca: cammina fino al prossimo cliente o luccichio,
   parla, risolve casi e riconoscimenti col risolutore, passa dalle porte, vende occhiali e compra i mezzi che
   servono (se i soldi non bastano, rifà un caso e vende ancora). Lo usano i test: ogni passo si raggiunge, non ci
   sono vicoli ciechi, salvare e ricaricare è uguale a continuare. */
import { CASI, ORDINE, RICONOSCIMENTI, VASSOIO_INIZIO } from "../content";
import { INIZIO, MAPPE } from "../content/borgo";
import { ARTICOLI, MONDO_ORA, NEGOZI, segnoDi } from "../content/negozi";
import { riuscito } from "../core/caso";
import { risolviCaso, risolviRic } from "../core/risolutore";
import { vendita } from "../core/vendita";
import type { SpecieId } from "../core/tipi";
import { apreEvento, chiDavanti, esegui, eventoArrivo, eventoDavanti, passo, personaggiPresenti, cosePresenti, type Regista, strada } from "./motore";
import { type Contesto, DELTA, type Dir, type MappaDef, type StatoMondo } from "./tipi";

export interface Partita {
  stato: StatoMondo;
  fatti: string[];
  /** la cassa */
  soldi?: number;
}

export interface Esito {
  partita: Partita;
  passi: number;
  testi: string[];
  bloccato: string | null;
}

const CASO = Object.fromEntries(CASI.map(c => [c.id, c]));
const RIC = Object.fromEntries(RICONOSCIMENTI.map(r => [r.id, r]));

/** Il vassoio di adesso: quello dell'inizio e i Diottri ritrovati. */
export const vassoioDa = (fatti: string[]): SpecieId[] => [...VASSOIO_INIZIO, ...RICONOSCIMENTI.filter(r => fatti.includes(r.id)).map(r => r.specie)].filter((x, i, a) => a.indexOf(x) === i);

/** Dove si trova chi (o cosa) apre un passo del percorso, se adesso c'è. */
function doveSi(id: string, ctx: Contesto): { m: MappaDef; x: number; y: number } | null {
  for (const m of Object.values(MAPPE)) {
    for (const p of personaggiPresenti(m, ctx)) if (p.parla.some(b => apreEvento(b.fai).includes(id))) return { m, x: p.x, y: p.y };
    for (const c of cosePresenti(m, ctx)) if (c.tocca.some(b => apreEvento(b.fai).includes(id))) return { m, x: c.x, y: c.y };
  }
  return null;
}

export async function giocaTutto(opts: { seme?: number; partita?: Partita; fermaDopo?: number } = {}): Promise<Esito> {
  const seme = opts.seme ?? 1;
  const st: StatoMondo = structuredClone(opts.partita?.stato ?? INIZIO);
  const fatti: string[] = [...(opts.partita?.fatti ?? [])];
  let soldi = opts.partita?.soldi ?? 0;
  /** il mezzo da comprare al prossimo negozio */
  let voglio: string | null = null;
  /** la vendita migliore per cliente: rifare un caso paga solo se si vende meglio */
  const migliori: Record<string, number> = {};
  const ctx: Contesto = { fatto: id => fatti.includes(id), get segni() { return st.segni; } } as Contesto;
  const testi: string[] = [];
  let passi = 0;
  const mappa = () => MAPPE[st.mappa];

  const regista: Regista = {
    async dice(t) { testi.push(t); },
    async scelta(t) { testi.push(t); return 0; },
    async caso(id) {
      const s = risolviCaso(CASO[id], seme, vassoioDa(fatti));
      if (riuscito(s) && !fatti.includes(id)) fatti.push(id);
      const v = vendita(CASO[id], s);
      if (v) { const prima = migliori[id] ?? 0; soldi += Math.max(0, v.provvigione - prima); migliori[id] = Math.max(prima, v.provvigione); }
    },
    async ric(id) {
      const s = risolviRic(RIC[id], seme);
      if (s.fine === "preso" && !fatti.includes(id)) fatti.push(id);
    },
    async vai(dest) { Object.assign(st, { mappa: dest.mappa, x: dest.x, y: dest.y, dir: dest.dir }); await arrivo(); },
    gira(d) { st.dir = d; },
    async buio(t) { testi.push(t); },
    async fine(t, titolo, sotto) { testi.push(titolo, t, ...(sotto ? [sotto] : [])); },
    segna(s) { if (!st.segni.includes(s)) st.segni.push(s); },
    togli(s) { st.segni = st.segni.filter(x => x !== s); },
    async negozio(id) {
      const a = voglio ? ARTICOLI[voglio] : null;
      if (!a || !NEGOZI[id]?.articoli.includes(a.id) || soldi < a.prezzo) return;
      soldi -= a.prezzo;
      regista.segna(segnoDi(a.id));
      testi.push(a.dopo);
      voglio = null;
    },
    async quadro() {},
    async copertina(t) { testi.push(t); },
    protagonista() {},
  };

  /** Il mezzo che apre la strada fino a (x, y), se a piedi non ci si arriva: la canoa per l'isolotto. */
  function mezzoPer(x: number, y: number): string | null {
    for (const a of Object.values(ARTICOLI)) {
      if (a.mondo > MONDO_ORA || st.segni.includes(segnoDi(a.id))) continue;
      const prova: Contesto = { fatto: ctx.fatto, segni: [...st.segni, segnoDi(a.id)] };
      if (strada(mappa(), st, x, y, prova)) return a.id;
    }
    return null;
  }

  /** Va dal negozio che vende `id` e lo compra. Il robot vende già bene: se i soldi non bastano, è un errore del mondo. */
  async function compra(id: string): Promise<string | null> {
    const a = ARTICOLI[id];
    const negozio = Object.entries(NEGOZI).find(([, n]) => n.articoli.includes(id))?.[0];
    if (!negozio) return `nessun negozio vende «${id}»`;
    if (soldi < a.prezzo) return `con ${soldi} € in cassa non si compra «${id}» (${a.prezzo} €)`;
    // dove sta chi lo vende
    for (const m of Object.values(MAPPE)) {
      const p = m.personaggi.find(q => q.parla.some(b => (b.fai as { negozio?: string }[]).some(c => c.negozio === negozio)));
      if (!p) continue;
      if (m.id !== st.mappa && !(await entraIn(m.id))) return `non so andare al negozio in ${m.id}`;
      if (!vaiAccanto(p.x, p.y)) return `non arrivo al negozio «${negozio}»`;
      const ev = eventoDavanti(mappa(), st, ctx);
      voglio = id;
      if (ev) await esegui(ev.evento, ctx, regista);
      if (st.mappa !== "borgo") { const u = mappa().porte[0]; if (u && !(await entraIn(u.verso.mappa))) return "non esco dal negozio"; }
      return st.segni.includes(segnoDi(id)) ? null : `«${id}» non si compra`;
    }
    return `nessuno vende «${id}»`;
  }
  async function arrivo() {
    const ev = eventoArrivo(mappa(), ctx);
    if (ev) await esegui(ev, ctx, regista);
  }

  /** Cammina fino a stare accanto a (x, y) sulla mappa di adesso, e si gira verso quella cella. */
  function vaiAccanto(x: number, y: number): boolean {
    const dirs = strada(mappa(), st, x, y, ctx);
    if (!dirs) return false;
    for (const d of dirs) {
      const p = passo(mappa(), st, d, ctx, false);
      passi++;
      if (p.esito !== "mosso") return false;
    }
    const verso: Dir = x > st.x ? "destra" : x < st.x ? "sinistra" : y > st.y ? "giu" : "su";
    st.dir = verso;
    return true;
  }

  /** Va nella mappa `id` passando da una porta. */
  async function entraIn(id: string): Promise<boolean> {
    const porta = mappa().porte.find(p => p.verso.mappa === id);
    if (!porta || !vaiAccanto(porta.x, porta.y)) return false;
    const [dx, dy] = DELTA[st.dir];
    if (st.x + dx !== porta.x || st.y + dy !== porta.y) return false;
    const p = passo(mappa(), st, st.dir, ctx, false);
    if (p.esito !== "porta") return false;
    await regista.vai(p.porta.verso);
    return true;
  }

  await arrivo();
  let rientri = 0;
  let bloccato: string | null = null;
  for (let giro = 0; giro < 200; giro++) {
    if (opts.fermaDopo !== undefined && fatti.length >= opts.fermaDopo) break;
    // il prologo: in bottega la misura, fuori la strada nitida e la notte del furto, poi di nuovo in bottega
    if (!st.segni.includes("prologo")) {
      const fuori = st.segni.includes("misurato") && !st.segni.includes("furto");
      const dove = fuori ? "borgo" : "bottega";
      // il prologo va avanti entrando: se si è già lì e non è successo niente, si esce per rientrare
      const verso = st.mappa === dove ? (dove === "bottega" ? "borgo" : "bottega") : dove;
      if ((st.mappa === dove && ++rientri > 3) || !(await entraIn(verso))) { bloccato = `il prologo non va avanti (${st.mappa} → ${verso})`; break; }
      continue;
    }
    const prossimo = ORDINE.find(o => !fatti.includes(o.id));
    if (!prossimo) break;
    const dove = doveSi(prossimo.id, ctx);
    if (!dove) { bloccato = `nessuno apre «${prossimo.id}»`; break; }
    if (dove.m.id !== st.mappa) {
      const uscita = mappa().porte.find(p => p.verso.mappa === dove.m.id);
      if (!uscita || !(await entraIn(dove.m.id))) { bloccato = `non so andare da ${st.mappa} a ${dove.m.id}`; break; }
      continue;
    }
    if (!vaiAccanto(dove.x, dove.y)) {
      // a piedi non si arriva: forse serve un mezzo, che si compra con le vendite
      const serve = mezzoPer(dove.x, dove.y);
      const errore = serve ? await compra(serve) : `non arrivo a «${prossimo.id}» in ${dove.x},${dove.y}`;
      if (errore) { bloccato = errore; break; }
      continue;
    }
    const ev = eventoDavanti(mappa(), st, ctx);
    if (!ev || !chiDavanti(mappa(), st, ctx)) { bloccato = `davanti a «${prossimo.id}» non c'è niente da fare`; break; }
    const prima = fatti.length;
    await esegui(ev.evento, ctx, regista);
    if (fatti.length === prima) { bloccato = `«${prossimo.id}» non si chiude`; break; }
  }
  return { partita: { stato: structuredClone(st), fatti: [...fatti], soldi }, passi, testi, bloccato };
}
