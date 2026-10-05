/* Prontuario: le tabelle da tenere in tasca. */
import type { ProntuarioSection } from "../core/types";

export const PRONTUARIO: ProntuarioSection[] = [
  { t: "Colori", rows: [["Fase", "marrone (anche nero, grigio)"], ["Neutro", "blu, solo neutro"], ["Terra (PE)", "giallo-verde, solo terra"]] },
  { t: "Sezioni e protezioni", note: "Abitudine di mestiere, per gli impianti di casa. La terra ha la stessa sezione di fase e neutro.", rows: [["Luci", "1,5 mm² · C10"], ["Prese", "2,5 mm² · C16"], ["Carichi grossi dedicati", "4–6 mm², da progetto"]] },
  { t: "Morsetti", rows: [["A leva", "un filo per foro; i fori sono uniti dentro"], ["A vite (frutti)", "di solito fino a due fili"], ["Filo che non serve", "da solo in un morsetto, mai col rame scoperto"]] },
  { t: "Formule", rows: [["Corrente dai watt", "I = P ÷ 230"], ["Potenza", "P = V × I"], ["Legge di Ohm", "V = R × I"], ["Calore in un contatto", "P = R × I²"]] },
  { t: "Prima di toccare", rows: [["1", "Prova il tester su una presa viva"], ["2", "Stacca al quadro"], ["3", "Segnala: cartello o nastro"], ["4", "Misura F–N, F–T, N–T: 0 V"], ["5", "Lavora"]] },
  { t: "Il quadro", rows: [["Generale", "toglie tutto"], ["Differenziale", "30 mA, protegge le persone; tasto T ogni tanto"], ["Magnetotermico", "C10, C16…: protegge i cavi"], ["Tutto su e buio", "è il contatore"]] },
  { t: "Prese", rows: [["Fori stretti", "10 A"], ["Fori larghi", "16 A"], ["Bipasso", "10 e 16 A"], ["Universale", "italiane e schuko"]] },
  { t: "Contatore", rows: [["Contratto 3 kW", "3,3 kW senza limiti"], ["Sopra", "tollera per un po', poi stacca"]] },
  { t: "Corpo umano", note: "Ordini di grandezza.", rows: [["≈ 1 mA", "la senti"], ["≈ 10 mA", "potresti non riuscire a mollare"], ["decine di mA", "rischio per il cuore"]] },
];
