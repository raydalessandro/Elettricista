/* I cinque riconoscimenti della mandata 2. Il valore (forza, categoria, calibro) cambia a ogni incontro. */
import type { RiconoscimentoDef } from "../core/tipi";

export const RICONOSCIMENTI: RiconoscimentoDef[] = [
  {
    id: "r1", n: 1, specie: "bombo",
    dove: "Sopra un giornale, nella vetrina.",
    grandezza: { tipo: "sfera", min: 0.5, max: 6 },
    prove: { neutralizza: "utile", dilato: "utile", riflesso: "inutile" },
    opzioni: [{ id: "conca", nome: "Lente col meno" }, { id: "bombo", nome: "Lente col più" }, { id: "neutra", nome: "Lente neutra" }],
    aiuto: "Muovi la lente: con o contro? E quanto corre?",
  },
  {
    id: "r2", n: 2, specie: "verdino",
    dove: "Di notte, sotto un lampione.",
    prove: { riflesso: "utile", neutralizza: "inutile", dilato: "inutile" },
    opzioni: [{ id: "verdino", nome: "Antiriflesso" }, { id: "nessuno", nome: "Senza trattamento" }, { id: "conca", nome: "Lente col meno" }],
    aiuto: "Guarda il riflesso: bianco e forte, o debole e colorato?",
  },
  {
    id: "r3", n: 3, specie: "polare",
    dove: "In riva al lago, al sole.",
    grandezza: { tipo: "categoria", valori: [2, 3] },
    prove: { polarizzate: "utile", telefono: "utile", luce: "utile", neutralizza: "inutile", caldo: "dannosa" },
    opzioni: [{ id: "polare", nome: "Polarizzata" }, { id: "bruno", nome: "Da sole normale" }, { id: "verdino", nome: "Antiriflesso" }],
    aiuto: "Prova con la polarizzata, poi guarda quanta luce passa.",
  },
  {
    id: "r4", n: 4, specie: "rullo",
    dove: "Davanti a un'insegna a righe.",
    grandezza: { tipo: "cilindro", min: -3, max: -0.75 },
    prove: { neutralizza: "utile", ruota: "utile", dilato: "utile", riflesso: "inutile" },
    opzioni: [{ id: "rullo", nome: "Cilindro" }, { id: "conca", nome: "Lente col meno" }, { id: "bombo", nome: "Lente col più" }],
    aiuto: "Girala davanti alla croce: resta dritta o si apre?",
  },
  {
    id: "r5", n: 5, specie: "cello",
    dove: "Nella vetrina delle montature.",
    grandezza: { tipo: "calibro", valori: [50, 52, 54] },
    prove: { asta: "utile", caldo: "utile", neutralizza: "inutile", riflesso: "inutile" },
    opzioni: [{ id: "cello", nome: "Acetato" }, { id: "titanio", nome: "Titanio" }],
    aiuto: "Leggi l'asta: c'è il materiale, e c'è il calibro.",
  },
];
