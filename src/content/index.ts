/* Tutto il contenuto del gioco: capitoli, livelli, schede, prontuario. */
import type { Card, Chapter, Level } from "../core/types";
import { CARDS_CAP1 } from "./cards";
import { CAP1 } from "./capitoli/cap1";
import { CAP2, CARDS_CAP2 } from "./capitoli/cap2";

export { WIRES } from "./wires";
export { PRONTUARIO } from "./prontuario";

export const CHAPTERS: Chapter[] = [
  { n: 1, title: "Le basi", short: "Nove interventi veri, dalla prima lampada al quadro che salta.", date: "2026-10-04" },
  { n: 2, title: "Banco guasti", short: "L'impianto c'è, qualcosa non va: lo trovi col tester, con metodo.", date: "2026-10-05" },
];

export const LEVELS: Level[] = [...CAP1, ...CAP2];

export const CARDS: Record<string, Card> = { ...CARDS_CAP1, ...CARDS_CAP2 };
