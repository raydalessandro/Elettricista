/* ====== DIOTTRI · FORMATO DEI DATI ======
   I contenuti del gioco (casi, riconoscimenti, specie) e lo stato delle partite.
   Le regole stanno in docs/gioco/PROGETTO.md e docs/gioco/STANDARD.md. */
import type { SphCyl } from "../../ottica/core/eye";
import type { MaterialeId } from "../../ottica/core/lente";
import type { Categoria } from "../../ottica/core/sole";
import type { SceneId } from "../../ottica/core/types";

/* ---------- esiti e stelle: la scala del corso ---------- */

export type Esito = "bene" | "ok" | "no" | "grave";
export const ESITO: Record<Esito, string> = { bene: "Bene", ok: "Va bene, ma…", no: "Non così", grave: "Errore grave" };

export type Momento = "occhio" | "spiegazione" | "soluzione";
export const MOMENTI: Momento[] = ["occhio", "spiegazione", "soluzione"];
export const MOMENTO_NOME: Record<Momento, string> = { occhio: "Occhio", spiegazione: "Spiegazione", soluzione: "Soluzione" };

/** Una riga nel riquadro: chi parla, cosa dice, e l'esito se è un giudizio. */
export interface Msg {
  chi: "cliente" | "iride" | "tu" | "gioco";
  t: string;
  esito?: Esito;
}

/* ---------- i Diottri ---------- */

export type Famiglia = "lente" | "materiale" | "trattamento" | "montatura" | "sole" | "contatto";
export const FAMIGLIA_NOME: Record<Famiglia, string> = { lente: "Lente", materiale: "Materiale", trattamento: "Trattamento", montatura: "Montatura", sole: "Sole", contatto: "Contatto" };

export type SpecieId = "conca" | "bombo" | "rullo" | "verdino" | "polare" | "bruno" | "cello";

export interface Specie {
  id: SpecieId;
  nome: string;
  famiglia: Famiglia;
  /** a cosa serve */
  uso: string;
  /** com'è fatto: la forma che dice cosa fa */
  forma: string;
  /** il suo limite */
  limite: string;
  /** come si riconosce al banco */
  prove: string;
  /** lessico: [tecnico, come si dice in negozio] */
  lessico: [string, string][];
}

/* ---------- il caso ---------- */

export type PostoId = "materiale" | "trattamento" | "montatura" | "filtro";
export const POSTO_NOME: Record<PostoId, string> = { materiale: "Materiale", trattamento: "Trattamenti", montatura: "Montatura", filtro: "Filtro" };

export type Rivela = BisognoTipo | "allarme" | "ricetta" | "occhiali";

export interface Opzione {
  id: string;
  nome: string;
  esito: Esito;
  /** una riga: perché quell'esito */
  perche: string;
  materiale?: MaterialeId;
  antiriflesso?: boolean;
  filtroBlu?: boolean;
  montatura?: { calibro: number; ponte: number };
  /** null = niente filtro */
  filtro?: { categoria: Categoria; polarizzata: boolean } | null;
  /** il Diottro che serve nel vassoio */
  serve?: SpecieId;
  /** se si scopre qualcosa, l'esito cambia */
  seScoperto?: { rivela: Rivela; esito: Esito; perche: string };
}

export type BisognoTipo = "lontano" | "vicino" | "spessore" | "riflessi" | "sole" | "abbagliamento" | "guida" | "dubbio";

export interface BisognoDef {
  tipo: BisognoTipo;
  nome: string;
  /** si scopre solo con una domanda */
  nascosto?: boolean;
  /** distanza per i bisogni di vista, metri */
  d?: number;
}

export interface Domanda {
  id: string;
  /** due-quattro parole */
  testo: string;
  risposta: string;
  rivela?: Rivela;
  /** l'aveva già detto: costa fiducia */
  giaDetto?: boolean;
  /** serve per la stella Spiegazione */
  chiave?: boolean;
}

export type MostraId = "dilato" | "confronto" | "goccia" | "lavora" | "polarizzate" | "riflesso";
export const MOSTRA_NOME: Record<MostraId, string> = {
  dilato: "Di lato",
  confronto: "Accanto all'1,67",
  goccia: "La goccia d'acqua",
  lavora: "Quanto lavora l'occhio",
  polarizzate: "Due polarizzate",
  riflesso: "Il riflesso di una luce",
};

export interface Dubbio {
  id: string;
  /** cosa lo fa nascere */
  quando: "lenteForte" | "lentePiu" | "polarizzata";
  domanda: string;
  mostra: { id: MostraId; esito: "risponde" | "vero" | "fuori" }[];
  /** cosa dice la dimostrazione giusta */
  risposta: string;
}

export type Motivo = "bambino" | "decimi" | "cambia" | "anni40" | "doppia";
export const MOTIVO_NOME: Record<Motivo, string> = {
  bambino: "Bambino senza ricetta",
  decimi: "I decimi non arrivano",
  cambia: "Cambia in fretta",
  anni40: "Oltre i 40, senza visita",
  doppia: "Vista doppia da tempo",
};

export type Urgenza = "oggi" | "subito";

export interface Occhi {
  od: SphCyl;
  os: SphCyl;
}

export interface Aspetto {
  pelle: string;
  capelli: string;
  maglia: string;
  occhiali?: boolean;
  barba?: boolean;
  lunghi?: boolean;
}

export interface CasoDef {
  id: string;
  n: number;
  titolo: string;
  cliente: { nome: string; eta: number; lavoro: string; frase: string; indizio: string; aspetto: Aspetto };
  /** la vista vera del cliente (la lente che corregge, da lontano) */
  occhio: Occhi;
  /** a ogni partita si pesca una variante: cambia la vista vera */
  varianti?: Occhi[];
  /** distanza pupillare, mm */
  dp: number;
  /** gli occhiali che porta: li legge il frontifocometro */
  vecchi?: Occhi & { vedeBene: boolean; frase: string };
  /** la ricetta recente, se c'è */
  ricetta?: Occhi & { quando: string; nascosta?: boolean };
  /** la scena che si guarda nel riquadro in alto */
  scena: SceneId | "lago";
  /** la scena della prova lenti, da lontano (di solito la strada) */
  scenaProva?: SceneId;
  bisogni: BisognoDef[];
  domande: Domanda[];
  /** il primo valore di ogni posto è quello di partenza */
  posti: Partial<Record<PostoId, Opzione[]>>;
  /** serve la lente da occhiale (no nei casi d'allarme) */
  serveLente: boolean;
  dubbi?: Dubbio[];
  allarme?: { urgenza: Urgenza; perche: string };
  /** la visita da consigliare, col suo motivo */
  visita?: Motivo;
  aiuti: { prova?: string; ricetta?: string; posti?: Partial<Record<PostoId, string>>; mostra?: string; medico?: string };
  /** cosa dice il cliente alla consegna */
  ciVedo: string;
  /** l'ultima parola della Maestra */
  fine: string;
}

export type RxCell = "OD.SF" | "OD.CIL" | "OD.AX" | "OS.SF" | "OS.CIL" | "OS.AX";

export type Fine = "consegnato" | "medico" | "chiuso" | "andato";

export interface Bisogno extends BisognoDef {
  tacche: number;
  visibile: boolean;
  /** «guida» con un filtro vietato */
  vietato?: boolean;
  nota: string;
}

export interface CasoState {
  id: string;
  seed: number;
  occhio: Occhi & { age: number };
  fiducia: number;
  soluzioneMostrata: boolean;
  scoperti: Rivela[];
  chieste: string[];
  lente: (Occhi & { fonte: "ricetta" | "prova" | "vecchi" }) | null;
  vecchiLetti: boolean;
  /** lettura della ricetta: quale casella si cerca */
  ricetta: { passo: number; caselle: RxCell[] } | null;
  prova: { occhio: "od" | "os"; v: number; fatti: Partial<Record<"od" | "os", number>> } | null;
  posti: Partial<Record<PostoId, string>>;
  provati: Partial<Record<PostoId, string[]>>;
  dubbi: { id: string; aperto: boolean; tentati: MostraId[] }[];
  visita: Motivo | null;
  stelle: Record<Momento, boolean>;
  /** perché si è persa una stella: la prima ragione per ogni momento, per la schermata finale */
  perse: Partial<Record<Momento, string>>;
  errori: Record<string, number>;
  log: Msg[];
  fine: Fine | null;
  /** i Diottri nel vassoio, al momento del caso */
  vassoio: SpecieId[];
}

/* ---------- il riconoscimento ---------- */

export type ProvaId = "neutralizza" | "ruota" | "dilato" | "riflesso" | "polarizzate" | "telefono" | "luce" | "caldo" | "asta";
export const PROVA_NOME: Record<ProvaId, string> = {
  neutralizza: "Neutralizza",
  ruota: "Gira la lente",
  dilato: "Di lato",
  riflesso: "Riflesso di una luce",
  polarizzate: "Polarizzata di prova",
  telefono: "Schermo del telefono",
  luce: "Quanta luce passa",
  caldo: "Il caldo",
  asta: "Le scritte sull'asta",
};

export type Utilita = "utile" | "inutile" | "dannosa";

export type Grandezza = { tipo: "sfera"; min: number; max: number } | { tipo: "cilindro"; min: number; max: number } | { tipo: "categoria"; valori: Categoria[] } | { tipo: "calibro"; valori: number[] };

export interface RiconoscimentoDef {
  id: string;
  n: number;
  specie: SpecieId;
  /** dove l'hai trovato: il posto aiuta */
  dove: string;
  grandezza?: Grandezza;
  /** le prove che hai sul banco, con la loro utilità per questo Diottro */
  prove: Partial<Record<ProvaId, Utilita>>;
  /** le risposte possibili: la specie giusta e altre cose che potrebbe essere */
  opzioni: { id: string; nome: string }[];
  aiuto: string;
}

export interface RicState {
  id: string;
  seed: number;
  /** la forza (diottrie), la categoria o il calibro di questo incontro */
  valore: number;
  diffidenza: number;
  provate: ProvaId[];
  errori: number;
  soluzioneMostrata: boolean;
  fine: "preso" | "scappato" | null;
  occhioEsperto: boolean;
  log: Msg[];
}
