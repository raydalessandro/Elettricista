/* ====== DIOTTRI · IL MONDO: FORMATO DEI DATI ======
   Le mappe sono griglie di lettere (una per mattonella) con una legenda; sopra ci sono gli oggetti (case, alberi,
   il banco), i personaggi e le cose da toccare (cartelli, luccichii). Gli eventi sono liste di comandi.
   Tutto è dato: la storia non sta dentro il codice. */
import type { Luce } from "../grafica/tavolozze";

export type Dir = "giu" | "su" | "sinistra" | "destra";
export const DELTA: Record<Dir, [number, number]> = { giu: [0, 1], su: [0, -1], sinistra: [-1, 0], destra: [1, 0] };
export const DIRS: Dir[] = ["su", "giu", "sinistra", "destra"];

/** Una condizione sui progressi: tutte le voci devono valere. */
export interface Condizione {
  /** passi del percorso fatti (casi riusciti, Diottri presi): c1, r1, … */
  fatti?: string[];
  nonFatti?: string[];
  /** segni della storia */
  segni?: string[];
  nonSegni?: string[];
}

/** Un comando di un evento. Si eseguono in fila; quelli che aspettano chi gioca (dice, scelta, caso, ric) fermano la fila. */
export type Comando =
  | { dice: string; chi?: string }
  | { scelta: string; voci: { testo: string; fai: Comando[] }[] }
  | { caso: string }
  | { ric: string }
  | { segna: string }
  | { togli: string }
  | { se: Condizione; allora: Comando[]; altrimenti?: Comando[] }
  | { vai: { mappa: string; x: number; y: number; dir: Dir } }
  | { gira: Dir }
  | { buio: string }
  | { fine: string };

export type Evento = Comando[];

/** Una risposta di un personaggio o di una cosa: la prima che vale. */
export interface Battuta {
  se?: Condizione;
  fai: Evento;
}

export interface Personaggio {
  id: string;
  /** la figura in grafica/figure.ts */
  figura: string;
  x: number;
  y: number;
  dir: Dir;
  /** quando c'è sulla mappa */
  se?: Condizione;
  /** guarda verso chi gli parla */
  siGira?: boolean;
  parla: Battuta[];
}

export interface Cosa {
  id: string;
  tipo: "cartello" | "luccichio" | "oggetto";
  x: number;
  y: number;
  se?: Condizione;
  /** non si passa (un cartello, uno scaffale); i luccichii si toccano ma non bloccano */
  solido?: boolean;
  tocca: Battuta[];
}

export interface Timbro {
  /** l'oggetto in grafica/oggetti.ts */
  ogg: string;
  x: number;
  y: number;
  /** quando c'è (un cancello chiuso, poi aperto) */
  se?: Condizione;
}

export interface Porta {
  x: number;
  y: number;
  verso: { mappa: string; x: number; y: number; dir: Dir };
  /** se la condizione non vale, la porta è chiusa e dice `chiusa` */
  se?: Condizione;
  chiusa?: string;
}

export interface Voce {
  tile: string;
  solido?: boolean;
}

export interface MappaDef {
  id: string;
  nome: string;
  /** fuori (giorno e sera, e lo starato) o dentro */
  fuori: boolean;
  righe: string[];
  legenda: Record<string, Voce>;
  timbri: Timbro[];
  porte: Porta[];
  personaggi: Personaggio[];
  cose: Cosa[];
  /** cosa succede entrando (una volta per segno) */
  entrando?: Battuta[];
}

/** La posizione di chi gioca e i segni della storia: è quello che si salva. */
export interface StatoMondo {
  mappa: string;
  x: number;
  y: number;
  dir: Dir;
  segni: string[];
}

export interface Contesto {
  fatto: (id: string) => boolean;
  segni: string[];
}

export type { Luce };
