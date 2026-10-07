/* ====== DIOTTRI · LE TAVOLOZZE ======
   Ogni tavolozza ha quattro colori, dal più chiaro (0) al più scuro (3), come le tavolozze del Game Boy Color.
   Il Borgo Diottria ha due luci: il giorno e la sera (gli stessi nomi, altri colori). Gli interni non cambiano.
   I personaggi hanno tre colori più il trasparente: 1 la pelle (o la parte chiara), 2 i vestiti, 3 i capelli e il contorno. */
import type { Tavolozza } from "./formato";
import { PAL_NUOVE } from "./figure_nuove";

export type Luce = "giorno" | "sera" | "interno";

const GIORNO: Record<string, Tavolozza> = {
  erba: ["#c8e890", "#90c860", "#5a9840", "#2c5a30"],
  chioma: ["#b0dc78", "#6cb048", "#3c7c34", "#1c3c24"],
  fiori: ["#fff6e8", "#f6a0b8", "#5a9840", "#2c5a30"],
  pietra: ["#f0e6d0", "#d4c4a4", "#a8927a", "#5a4a3e"],
  sentiero: ["#f0dca8", "#d8b878", "#b08850", "#6a4c30"],
  acqua: ["#c8eef8", "#7cc8ec", "#3c90c8", "#1c4c80"],
  sabbia: ["#fbf0c8", "#ecd898", "#c8ac6c", "#806a40"],
  legno: ["#f4d0a0", "#d09a60", "#9a6436", "#50321c"],
  muro: ["#fbf3dc", "#ecd8b0", "#c4a478", "#6a5040"],
  muro_rosa: ["#fbe6dc", "#f0c0a8", "#c88c74", "#6a4038"],
  tetto: ["#f8b890", "#e07850", "#a84a34", "#5a2820"],
  ardesia: ["#b8d0e8", "#7898c8", "#4a6498", "#283858"],
  vetro: ["#f0fbff", "#b0e0f0", "#6aa8cc", "#2a4a66"],
  ferro: ["#e4e4ea", "#a8a8b8", "#6a6a7c", "#2c2c38"],
  bottega: ["#f3ecd6", "#4aa592", "#2f7d6d", "#0f2a26"],
  insegna: ["#fbf6ee", "#e04848", "#3a6ccc", "#1f2438"],
  auto: ["#f8d0c8", "#e05a48", "#a03028", "#401818"],
  carta: ["#fffdf6", "#e8e2d0", "#9a9484", "#3a3630"],
  luce: ["#fffbe0", "#ffe88a", "#f0c050", "#6a4a30"],
  oro: ["#ffffff", "#fff0a0", "#f0b840", "#a06a10"],
  tabellone: ["#fff0a0", "#3a5cb0", "#20306c", "#10142c"],
};

/** La sera: tutto più scuro e blu; restano accese le luci (lampioni, finestre) e i luccichii. */
const SERA: Record<string, Tavolozza> = {
  erba: ["#6a8aa0", "#4a6a88", "#34506c", "#1a2a40"],
  chioma: ["#5c7a8c", "#42607a", "#2e4864", "#141e34"],
  fiori: ["#a8a8c8", "#9a7898", "#34506c", "#1a2a40"],
  pietra: ["#8a90a8", "#6a7090", "#4c5274", "#262a44"],
  sentiero: ["#8a8aa0", "#6c6c88", "#4e4e6c", "#2a2a44"],
  acqua: ["#4a6a9c", "#34548a", "#243c70", "#121e44"],
  sabbia: ["#9a98a8", "#7c7a90", "#5c5a74", "#2e2c44"],
  legno: ["#8c7c84", "#6c5c6c", "#4c3e54", "#261e34"],
  muro: ["#a8a4bc", "#8884a0", "#64607e", "#322e4a"],
  muro_rosa: ["#b09cb4", "#907c98", "#6a5876", "#352a44"],
  tetto: ["#a07c8c", "#805c70", "#5c3e54", "#2c1c30"],
  ardesia: ["#6a78a0", "#50608c", "#3a4a74", "#1c2444"],
  vetro: ["#fff4c0", "#f8d878", "#c8a050", "#4a3a40"],
  ferro: ["#9a9cb0", "#7a7c94", "#585a74", "#262838"],
  bottega: ["#b4b0c4", "#3c7c84", "#285c68", "#0c1c2c"],
  insegna: ["#b0aac0", "#a04868", "#34508c", "#121a30"],
  auto: ["#a08ca0", "#8a4a5c", "#5c2c40", "#24142a"],
  carta: ["#c8c4d0", "#a4a0b4", "#6c6884", "#262438"],
  luce: ["#fffbe0", "#ffe88a", "#f0c050", "#6a4a30"],
  oro: ["#ffffff", "#fff0a0", "#f0b840", "#a06a10"],
  tabellone: ["#fff0a0", "#3a5cb0", "#20306c", "#10142c"],
};

const INTERNO: Record<string, Tavolozza> = {
  parquet: ["#f4d8a8", "#dcb07c", "#b08454", "#6a4a2c"],
  muro_int: ["#f6efe0", "#e6d6bc", "#c0a888", "#5e4c3c"],
  tappeto: ["#e8f0e4", "#6ab4a0", "#2f7d6d", "#173c34"],
  banco: ["#e8c8a0", "#b88454", "#7a5030", "#3a2414"],
  vetro: GIORNO.vetro,
  ottone: ["#fff0c0", "#e8c060", "#b08830", "#5a4010"],
  chioma: GIORNO.chioma,
  velluto: ["#f0e0f0", "#b080c0", "#7a4890", "#3a1c48"],
  bottega: GIORNO.bottega,
  carta: GIORNO.carta,
  ferro: GIORNO.ferro,
  legno: GIORNO.legno,
  oro: GIORNO.oro,
};

/** I personaggi: «.» trasparente; 1 pelle, 2 vestiti, 3 capelli e contorno. Il colore 0 non si usa.
    Luisa fa eccezione, perché i capelli bianchi non si confondano col viso: 1 i capelli bianchi (e la camicetta),
    2 la pelle, 3 il golfino viola scuro e il contorno. */
export const FIGURE_PAL: Record<string, Tavolozza> = {
  tu_uomo: ["#000000", "#f0c8a0", "#3a8c7a", "#2a2420"],
  tu_donna: ["#000000", "#f6d0b0", "#3a8c7a", "#3a2418"],
  iride: ["#000000", "#f2c8a4", "#8a3c5c", "#4a2c1c"],
  marco: ["#000000", "#e8b48f", "#3f6fb5", "#2a1e16"],
  giulia: ["#000000", "#f4cba8", "#e86888", "#7a3418"],
  davide: ["#000000", "#d9a07a", "#5a6a80", "#1f1a17"],
  paolo: ["#000000", "#c98b62", "#5f7f3a", "#3a2c1c"],
  luisa: ["#000000", "#f4f0f8", "#f0c4a4", "#583878"],
  passante: ["#000000", "#e8b896", "#e07c28", "#3a2a20"],
  oro: GIORNO.oro,
  ...PAL_NUOVE,
};

export const TAVOLOZZE: Record<Luce, Record<string, Tavolozza>> = { giorno: GIORNO, sera: SERA, interno: INTERNO };

/** Il colore dello sfondo fuori dalla mappa, per luce. */
export const FONDO: Record<Luce, string> = { giorno: "#2c5a30", sera: "#1a2a40", interno: "#3a2414" };
