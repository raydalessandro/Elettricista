/* ====== DIOTTRI · I NEGOZI E I MEZZI ======
   Con quello che guadagni vendendo occhiali compri i mezzi: ogni mondo ne vende di migliori e più cari. Alcuni
   servono per andare avanti (la canoa per l'isolotto del lago, la bici per la strada della Valle): per proseguire
   bisogna anche vendere, non solo misurare. Chi ha un mezzo ha il segno «ha:<id>». */

export interface Articolo {
  id: string;
  nome: string;
  prezzo: number;
  /** il mondo dove si vende: prima di arrivarci si vede, ma non si compra */
  mondo: number;
  /** cosa dice chi te lo vende, appena l'hai comprato (un riquadro) */
  dopo: string;
}

/** I mondi, nell'ordine del progetto (docs/gioco/PROGETTO.md). */
export const MONDI = ["", "Borgo Diottria", "Valle delle Montature", "Laguna dei Riflessi", "Torre delle Distanze", "Città del Centro", "Il Grande Laboratorio", "Costa del Sole", "Mare delle Lacrime", "Torre dell'Ottotipo"];

/** Il mondo dove si gioca adesso. */
export const MONDO_ORA = 1;

export const ARTICOLI: Record<string, Articolo> = {
  bici: { id: "bici", nome: "Bici da città", prezzo: 70, mondo: 1, dopo: "Ecco la tua bici! Va più veloce. Dal menu: «Sali in bici»." },
  canoa: { id: "canoa", nome: "Canoa", prezzo: 120, mondo: 1, dopo: "Ecco la canoa: entra in acqua, e pagaia!" },
  mtb: { id: "mtb", nome: "Mountain bike", prezzo: 300, mondo: 2, dopo: "Per i sentieri in salita: tienila stretta." },
  motorino: { id: "motorino", nome: "Motorino", prezzo: 900, mondo: 2, dopo: "Casco in testa, sempre." },
  motoscafo: { id: "motoscafo", nome: "Motoscafo", prezzo: 1800, mondo: 3, dopo: "Piano vicino alle canne: ci sono i nidi." },
  moto: { id: "moto", nome: "Moto", prezzo: 2500, mondo: 4, dopo: "Con la moto, la Torre è a un passo." },
  auto: { id: "auto", nome: "Automobile", prezzo: 6000, mondo: 5, dopo: "Il pieno è fatto: buon viaggio!" },
  vela: { id: "vela", nome: "Barca a vela", prezzo: 8000, mondo: 7, dopo: "Il vento è buono: si salpa!" },
};

export interface Negozio {
  nome: string;
  /** chi ti accoglie, e come */
  chi: string;
  saluto: string;
  articoli: string[];
}

export const NEGOZI: Record<string, Negozio> = {
  cicli: { nome: "Cicli Raggio", chi: "Rita", saluto: "Cicli Raggio! Bici per il borgo, e per andare lontano.", articoli: ["bici", "mtb", "motorino", "moto", "auto"] },
  barche: { nome: "Barche del lago", chi: "Nando", saluto: "Barche del lago! Con una canoa, l'isolotto è tuo.", articoli: ["canoa", "motoscafo", "vela"] },
};

/** Il segno di chi ha un articolo. */
export const segnoDi = (id: string) => `ha:${id}`;
