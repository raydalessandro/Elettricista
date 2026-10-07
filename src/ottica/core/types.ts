/* Formato dei contenuti del corso di ottica. Le regole sono in docs/ottica/STANDARD.md. */
import type { EyeState, SphCyl } from "./eye";

/** I laboratori che una scheda può mostrare (li disegna l'interfaccia). */
export const LAB_IDS = ["occhio", "miope", "lente", "iper", "piu", "eta", "lettura", "progressiva", "quadrante", "asse", "storta", "ricetta"] as const;
export type LabId = (typeof LAB_IDS)[number];

export interface Chapter {
  n: number;
  title: string;
  short: string;
  /** data di uscita (AAAA-MM-GG) */
  date: string;
}

/** Scheda di teoria: poche righe, un laboratorio da toccare, il lessico. */
export interface Card {
  t: string;
  p?: string[];
  ol?: string[];
  /** paragrafi dopo l'elenco */
  after?: string[];
  /** laboratorio interattivo */
  lab?: LabId;
  /** lessico: [termine tecnico, come lo dice il cliente o come lo dici al cliente] */
  g?: [string, string][];
  /** il consiglio della titolare del negozio */
  tutor?: string;
  /** concetti che la scheda insegna */
  teaches: string[];
}

export interface Customer {
  name: string;
  age: number;
  job: string;
  /** come si presenta al banco */
  msg: string;
}

export interface QuizQ {
  q: string;
  /** opzioni: la giusta è quella in posizione ok; il gioco le mescola */
  o: string[];
  ok: number;
  why: string;
  requires?: string[];
}

/** Scommessa prima della prova: cosa serve, secondo te? */
export interface Bet {
  q: string;
  o: string[];
  ok: number;
  why: string;
}

export type SceneId = "tabellone" | "telefono" | "strada" | "pc" | "quadrante" | "notte" | "ottotipo" | "giornale";

/** Una cosa che il cliente guarda, a una distanza (metri; Infinity = lontano). */
export interface ViewDef {
  scene: SceneId;
  d: number;
  label: string;
}

/** Una variante del caso: a ogni partita il cliente può avere una ricetta diversa.
    I testi del livello possono usare {chiave}: la sostituisce il valore in vars. */
export interface Variant {
  eye: EyeState;
  /** lente di partenza della prova dell'asse */
  lens?: SphCyl;
  vars: Record<string, string>;
}

interface ProvaBase {
  /** cosa devi ottenere, detto al giocatore (dopo la scommessa) */
  goal: string;
  bet: Bet;
  /** aiuti in ordine: l'ultimo risolve */
  hints: string[];
  eye: EyeState;
  views: ViewDef[];
  /** se ci sono, a ogni partita se ne pesca una (eye e lens sostituiscono quelli sopra) */
  variants?: Variant[];
  requires?: string[];
}

/** Lente sferica da trovare: lontano nitido con il cristallino a riposo (miope e ipermetrope). */
export interface ProvaSfera extends ProvaBase {
  type: "sfera";
  min: number;
  max: number;
  start: number;
}

/** Lente da lettura: la prima lente col più che fa vedere nitido e comodo alla distanza di lettura. */
export interface ProvaVicino extends ProvaBase {
  type: "vicino";
  min: number;
  max: number;
  start: number;
  /** distanza di lettura (metri) */
  dist: number;
}

/** Asse del cilindro da trovare girando la lente. */
export interface ProvaAsse extends ProvaBase {
  type: "asse";
  /** la lente di prova: sfera e cilindro giusti, asse di partenza */
  lens: SphCyl;
  step: number;
}

export type RxCell = "OD.SF" | "OD.CIL" | "OD.AX" | "OS.SF" | "OS.CIL" | "OS.AX" | "ADD";

export interface Ricetta {
  od: SphCyl;
  os: SphCyl;
  add?: number;
  who?: string;
  date?: string;
}

export interface RicettaTask {
  q: string;
  /** celle giuste (basta toccarne una) */
  ok: RxCell[];
  why: string;
}

/** Leggere la ricetta toccando i numeri giusti, poi vedere cosa fa ogni tipo di occhiale. */
export interface ProvaRicetta {
  type: "ricetta";
  goal: string;
  ricetta: Ricetta;
  tasks: RicettaTask[];
  /** per la seconda parte: età del cliente (per l'accomodazione) */
  age: number;
  hints: string[];
  requires?: string[];
}

export type Prova = ProvaSfera | ProvaVicino | ProvaAsse | ProvaRicetta;

/* ---------- il banco: dialogo col cliente ---------- */

/** anamnesi: le domande tecniche che servono · spiegazione: spiegare il fenomeno ottico · soluzione: lente, trattamento, occhiale, o il medico. */
export type Phase = "anamnesi" | "spiegazione" | "soluzione";

/** Chi gioca sa già vendere: tutte le scelte sono ben dette, e si distinguono per l'ottica.
    best: la mossa migliore · ok: giusta ma incompleta · no: sbagliata sull'ottica · grave: gradazione a occhio, diagnosi, promessa sulla salute, pericolo, medico rimandato. */
export type ChoiceKind = "best" | "ok" | "no" | "grave";

export interface Choice {
  /** quello che dici */
  t: string;
  ok: ChoiceKind;
  /** come reagisce il cliente */
  reply: string;
  /** il commento della titolare, subito dopo: sul contenuto tecnico */
  tip: string;
  /** solo per best e ok: se si sceglie questa, il dialogo finisce qui, con questa fine (il cliente se ne va) */
  end?: string;
  requires?: string[];
}

/** Una mossa del dialogo. Con best e ok si passa alla mossa dopo; con no e grave si sceglie ancora. */
export interface DStep {
  phase: Phase;
  /** narratore, prima della battuta (per esempio l'esito del controllo della vista) */
  note?: string;
  /** cosa mostrare insieme alla nota */
  show?: { ricetta?: Ricetta };
  /** la battuta del cliente; se manca, si continua dalla sua ultima risposta */
  say?: string;
  choices: Choice[];
}

export interface Dialog {
  id: string;
  who: Customer;
  steps: DStep[];
  /** come finisce (narratore) */
  end: string;
}

/* ---------- livelli ---------- */

export interface Level {
  id: string;
  /** numero progressivo nel corso */
  n: number;
  cap: number;
  title: string;
  short: string;
  customer: Customer;
  learn: string[];
  cards: string[];
  prova?: Prova;
  /** un dialogo (livelli normali) o più dialoghi da cui pescare (giornata in negozio) */
  dialogs: Dialog[];
  /** quanti dialoghi pescare (solo per la giornata in negozio) */
  pick?: number;
  quiz: QuizQ[];
  stars: [string, string, string];
}
