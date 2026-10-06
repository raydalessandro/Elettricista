/* Tutto il contenuto del corso di ottica: capitoli, livelli, schede, prontuario. */
import type { Card, Chapter, Level } from "../core/types";
import { CAP1, CARDS_CAP1 } from "./cap1";

export { PRONTUARIO } from "./prontuario";

export const CHAPTERS: Chapter[] = [{ n: 1, title: "L'occhio e le lenti", short: "Come vede l'occhio, cosa correggono le lenti, e i primi clienti al banco.", date: "2026-10-07" }];

export const LEVELS: Level[] = [...CAP1];

export const CARDS: Record<string, Card> = { ...CARDS_CAP1 };
