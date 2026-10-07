/* Il prontuario del banco: le tabelle da tenere a portata di mano. */
export interface ProntRow {
  t: string;
  note?: string;
  rows: [string, string][];
}

export const PRONTUARIO: ProntRow[] = [
  {
    t: "Prima il medico, oggi stesso",
    note: "L'oculista, o il pronto soccorso: quello oculistico, dove c'è. Prima di qualunque controllo della vista; niente colliri o farmaci consigliati.",
    rows: [
      ["Dolore", "all'occhio, o occhio rosso"],
      ["Lenti a contatto", "occhio rosso o dolente: le toglie, non le rimette, le porta al medico con l'astuccio"],
      ["Lampi, «mosche», una tenda", "comparsi da poco"],
      ["Vista calata all'improvviso", "o vista doppia improvvisa"],
      ["Righe storte, una macchia al centro", "comparse da poco: non è astigmatismo"],
      ["Mal di testa forte", "con la vista annebbiata, o aloni colorati intorno alle luci"],
      ["Un colpo all'occhio", "anche se sembra niente"],
      ["Un prodotto chimico nell'occhio", "subito acqua corrente, per almeno un quarto d'ora; intanto qualcuno chiama il 112"],
      ["Bambini", "prima la visita dall'oculista, poi gli occhiali"],
    ],
  },
  {
    t: "La ricetta in breve",
    rows: [
      ["OD / OS / OO", "occhio destro / occhio sinistro / tutti e due"],
      ["SF col meno", "senza cilindro: miopia, lente col meno, più spessa al bordo"],
      ["SF col più", "senza cilindro: ipermetropia, lente col più, più spessa al centro"],
      ["CIL e AX", "astigmatismo: il cilindro e la sua direzione in gradi d'angolo (0–180). A volte con la ×: −0,75 × 90"],
      ["ADD", "addizione per vicino, sempre col più"],
      ["—", "il trattino: lì non c'è niente"],
      ["Diottrie", "a quarti: 0,25 – 0,50 – 0,75 – 1,00…"],
      ["Trasposizione", "nuova sfera = sfera + cilindro; il cilindro cambia segno; l'asse gira di 90°"],
      ["Un numero strano", "si sente l'oculista che ha scritto la ricetta; mai dire al cliente «è sbagliata»"],
    ],
  },
  {
    t: "Il materiale della lente",
    note: "Più alto l'indice, più sottile la lente a parità di gradazione. Con poche diottrie toglie poco, intorno al millimetro al bordo. L'indice cambia lo spessore, non la nitidezza.",
    rows: [
      ["Organico 1,5 (CR-39)", "la lente standard: leggera, per gradazioni leggere e medie"],
      ["Policarbonato 1,59", "resiste agli urti: bambini, sport, montature forate"],
      ["1,6 · 1,67 · 1,74", "sempre più sottili: per gradazioni forti, o montature che lasciano vedere il bordo"],
      ["Calibro", "una lente forte in un calibro grande è spessa con qualunque indice: col meno al bordo, col più al centro"],
    ],
  },
  {
    t: "Il punto più vicino nitido, con l'età",
    note: "Valori indicativi, per un occhio senza difetti da lontano.",
    rows: [
      ["20 anni", "circa 10 cm"],
      ["40 anni", "circa 20 cm"],
      ["45 anni", "circa 25 cm"],
      ["50 anni", "circa 40 cm"],
      ["55 anni", "circa 80 cm"],
    ],
  },
  {
    t: "Anamnesi: le domande che servono",
    rows: [
      ["Distanze", "guida e TV (lontano), computer e cruscotto (intermedio), telefono e lettura (vicino)"],
      ["Da quando", "il disturbo è nuovo o vecchio? È comparso dopo un fatto preciso, come una caduta?"],
      ["Occhiali", "cosa porta adesso? Li ha con sé? Si misurano al frontifocometro"],
      ["Controllo e visita", "quando l'ultimo controllo della vista? E l'ultima visita dall'oculista?"],
      ["Segnali", "dolore, occhio rosso, lampi, calo improvviso: allora prima il medico"],
    ],
  },
];
