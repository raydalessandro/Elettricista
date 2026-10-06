/* Il prontuario del banco: le tabelle da tenere a portata di mano. */
export interface ProntRow {
  t: string;
  note?: string;
  rows: [string, string][];
}

export const PRONTUARIO: ProntRow[] = [
  {
    t: "Niente vendita: medico oggi stesso",
    note: "L'oculista, o il pronto soccorso: quello oculistico, dove c'è. Niente controllo della vista e niente consigli su colliri o farmaci.",
    rows: [
      ["Dolore", "all'occhio, o occhio rosso"],
      ["Lenti a contatto", "occhio rosso o dolente: le toglie, non le rimette, le porta al medico con l'astuccio"],
      ["Lampi, «mosche», una tenda", "comparsi da poco"],
      ["Vista calata all'improvviso", "o vista doppia improvvisa"],
      ["Righe storte, una macchia al centro", "comparse da poco: non è astigmatismo"],
      ["Mal di testa forte", "con la vista annebbiata, o aloni colorati intorno alle luci"],
      ["Un colpo all'occhio", "anche se sembra niente"],
      ["Un prodotto chimico nell'occhio", "subito acqua corrente, per almeno un quarto d'ora; intanto qualcuno chiama il 112"],
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
      ["Cilindro col più", "è la stessa lente scritta in un altro modo: la conversione la fa l'ottico"],
      ["Un numero strano", "chiedi all'ottico; mai dire al cliente «è sbagliata»"],
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
    t: "Le domande al banco",
    rows: [
      ["Uso", "guida, computer, lettura, lavoro, sport"],
      ["Da quando", "il problema è nuovo o vecchio?"],
      ["Occhiali", "cosa porta adesso? Li ha con sé?"],
      ["Controllo", "quando ha fatto l'ultimo? Ha una ricetta, di quando?"],
    ],
  },
  {
    t: "Chi fa cosa",
    note: "Le regole: R.D. 1334/1928, art. 12, e Cassazione penale n. 27853/2001, come le riassume la Regione Friuli Venezia Giulia. In negozio si seguono le procedure del negozio: in dubbio, chiedi alla titolare.",
    rows: [
      ["Tu, al banco", "accogli, chiedi, spieghi, proponi; piccole regolazioni solo se te le hanno insegnate"],
      ["Ottico", "monta e vende gli occhiali; senza ricetta del medico, solo per miopia e presbiopia"],
      ["Ottico optometrista", "misura la vista e prepara le lenti, anche per ipermetropia e astigmatismo, senza diagnosi, cure, ricette o interventi sull'occhio"],
      ["Lenti a contatto", "le applica l'ottico abilitato, con una prova; meglio dopo una visita dall'oculista"],
      ["Oculista", "il medico: visite, malattie, bambini, interventi, colliri"],
    ],
  },
];
