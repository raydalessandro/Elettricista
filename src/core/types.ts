/* Tipi del gioco: tavola, livelli, schede. Il formato è descritto in docs/STANDARD.md. */

export type WireColor = "marrone" | "nero" | "grigio" | "blu" | "gv";

export interface WireInfo {
  label: string;
  /** variabile CSS del colore */
  v: string;
  stripe?: string;
}

export type CompKind =
  | "sorgente"
  | "capo"
  | "morsetto"
  | "presa"
  | "lampada"
  | "interruttore"
  | "deviatore"
  | "invertitore";

/** Un pezzo sulla tavola. I campi dipendono dal tipo (kind). */
export interface Comp {
  id: string;
  kind: CompKind;
  x?: number;
  y?: number;
  zone?: string;
  /* capo: la punta di un filo che arriva da un cavo */
  color?: WireColor;
  sec?: number;
  /** da dove esce il filo (bordo del cavo) */
  fx?: number;
  fy?: number;
  /* morsetto a leva */
  slots?: number;
  /* lampada */
  classe1?: boolean;
  look?: "portalampada" | "lampadario" | "plafoniera";
  top?: boolean;
  tlabel?: Record<string, string>;
  /* pezzo già collegato, che il giocatore non tocca */
  locked?: boolean;
  lockedMsg?: string;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface Cable {
  x: number;
  y: number;
  w: number;
  h: number;
  /** origine: nome della linea («Luci C10») o provenienza («dall'interruttore») */
  label: string;
  /** id del pezzo già collegato da cui arriva il filo */
  from?: string;
}

export interface Tube {
  d: string;
  color: WireColor;
  label?: string;
  lx?: number;
  ly?: number;
  /** id del pezzo già collegato a cui porta */
  links?: string;
}

/** Collegamento che il giocatore non fa. */
export interface FixedWire {
  a: string;
  b: string;
  vis?: boolean;
  color?: WireColor;
  sec?: number;
  from?: { x: number; y: number };
  d?: string;
}

export interface Board {
  h: number;
  zones?: Zone[];
  cables?: Cable[];
  tubes?: Tube[];
  canalina?: { x: number; y: number; w: number; label: string };
  comps: Comp[];
  fixed?: FixedWire[];
}

/** Filo nella forma compatta dei dati: [da, a] per una punta, [da, a, colore, sezione] per un filo nuovo. */
export type WireSpec = [string, string] | [string, string, WireColor, number];

/** Filo sulla tavola. */
export interface Wire {
  a: string;
  b: string;
  capo: boolean;
  color: WireColor;
  sec: number;
}

export type Goal =
  | { type: "lamp"; lamp: string; mode: "sempre" | "segue" | "commuta"; sw?: string }
  | { type: "prese"; prese: string[] };

export type Conductor = "L" | "R" | "N" | "PE";

export interface Probe {
  label: string;
  a: Conductor;
  b: Conductor;
}

export interface Breaker {
  id: string;
  label: string;
  sub?: string;
  sub2?: string;
  w?: number;
  kind?: "gen" | "diff";
}

export type Safety =
  | { type: "spina" }
  | { type: "quadro"; breakers: Breaker[]; feed: string; probes: Probe[]; where: string; wall?: boolean };

export interface QuizItem {
  q: string;
  o: string[];
  ok: number;
  why: string;
}

export interface CheckItem {
  t: string;
  ok: boolean;
  why: string;
}

export type Outcome = "ok" | "nonregola" | "sbagliato" | "spento" | "corto" | "diff";

export interface Card {
  t: string;
  /** concetti che la scheda insegna: li usa il controllo automatico (S8) */
  teaches: string[];
  p?: string[];
  ol?: string[];
  f?: string[];
  lab?: string;
  /** lessico: [termine tecnico, come si dice in cantiere] */
  g?: [string, string][];
  capo?: string;
}

export interface Client {
  who: string;
  where: string;
  msg: string;
}

interface LevelBase {
  id: string;
  /** numero progressivo in tutto il gioco */
  n: number;
  /** capitolo (1, 2, …) */
  cap: number;
  part: string;
  title: string;
  short: string;
  note?: string;
  client: Client;
  learn: string[];
  cards: string[];
  requires?: string[];
  stars: string[];
  quiz: QuizItem[];
}

export interface ShopItem {
  t: string;
  ok: boolean;
  why: string;
}

export interface FiliLevel extends LevelBase {
  type: "fili";
  trap?: "etichette";
  safety: Safety;
  shop?: { q: string; opts: ShopItem[] };
  board: Board;
  palette: { sections?: boolean; defSec?: number } | null;
  minSec?: number;
  goal: Goal;
  check: CheckItem[];
  hints: string[];
  solution: WireSpec[];
  alternatives?: { name: string; w: WireSpec[] }[];
  mistakes?: { name: string; w: WireSpec[]; expect: Outcome }[];
}

export interface IndApp {
  id: string;
  label: string;
  a: string;
  line: string;
  leak: number;
  colpa?: boolean;
}

export interface IndagineLevel extends LevelBase {
  type: "indagine";
  ind: {
    sintomo: string;
    bet: { q: string; o: string[]; ok: number };
    soglia: number;
    breakers: Breaker[];
    apps: IndApp[];
    chi: { id: string; t: string; why: string }[];
    cosa: { t: string; ok: boolean; why: string }[];
  };
}

export interface SerApp {
  id: string;
  label: string;
  w: number;
  on?: boolean;
  ciab?: boolean;
}

export interface SerLine {
  id: string;
  label: string;
  mt: number;
  ciabatta?: number;
  apps: SerApp[];
}

export interface SerataLevel extends LevelBase {
  type: "serata";
  ser: {
    contratti: number[];
    tempi: { contatore: number; ciabatta: number; insieme: number };
    missioni: { cosa: "contatore" | "insieme" | "ciabatta"; app?: string[]; azione?: string }[];
    lines: SerLine[];
  };
}

/* ---------- capitolo 2: banco guasti ---------- */

/** Comportamento dell'impianto che il cliente vede. */
export type Symptom =
  | "spenta" // la luce non si accende mai
  | "parziale" // si accende solo in alcune posizioni dei comandi
  | "sempre-accesa" // non si spegne mai
  | "funziona" // funziona: il guasto si vede solo misurando
  | "presa-morta" // la presa non dà corrente
  | "salta"; // appena dai tensione scatta una protezione

/**
 * Un guasto: cosa cambia rispetto all'impianto sano.
 * open: collegamenti che non fanno contatto (si vedono collegati, ma la corrente non passa);
 * broken: pezzi rotti (lampadina bruciata, interruttore che non chiude);
 * rewire: collegamenti fatti male, visibili sulla tavola.
 */
export interface Fault {
  id: string;
  /** cosa dice la diagnosi giusta */
  label: string;
  /** dove sta il guasto, in parole */
  where: string;
  /** cosa ti racconta il cliente */
  msg: string;
  symptom: Symptom;
  open?: [string, string][];
  broken?: string[];
  rewire?: { from: [string, string]; to: [string, string] }[];
  /** concetti che servono per trovarlo (S8) */
  requires?: string[];
  /** spiegazione finale: quali misure lo dimostrano */
  proof: string;
  /** quante misure bastano a chi segue il metodo */
  minMeasures: number;
}

export interface GuastoLevel extends LevelBase {
  type: "guasto";
  /** l'impianto sano: tavola, comandi e collegamenti */
  board: Board;
  goal: Goal;
  /** collegamenti dell'impianto sano */
  wiring: WireSpec[];
  /** nome della linea al quadro */
  line: string;
  faults: Fault[];
  hints: string[];
}

export type Level = FiliLevel | IndagineLevel | SerataLevel | GuastoLevel;

/** Livelli con una tavola e un motore che li valuta. */
export type BoardLevel = FiliLevel | GuastoLevel;

export interface Chapter {
  n: number;
  title: string;
  short: string;
  /** data di uscita, AAAA-MM-GG */
  date: string;
}

export interface ProntuarioSection {
  t: string;
  note?: string;
  rows: [string, string][];
}
