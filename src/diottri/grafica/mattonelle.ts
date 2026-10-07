/* ====== DIOTTRI · MATTONELLE DEL TERRENO (16×16) ======
   Disegnate a mano, riga per riga (vedi docs/gioco/STILE.md). Ogni voce: la tavolozza (nome in grafica/tavolozze.ts
   o qui sotto in TAVOLOZZE_MATTONELLE) e 16 righe da 16 caratteri «0»–«3», dal più chiaro al più scuro.
   Luce dall'alto a sinistra. Il terreno si ripete senza cuciture: il bordo destro continua nel sinistro,
   quello in basso in quello in alto. */
import type { Mattonella, Tavolozza } from "./formato";
import type { Luce } from "./tavolozze";

export const MATTONELLE: Record<string, Mattonella> = {
  /* ---------- fuori ---------- */

  // prato: pochi ciuffi scuri e qualche filo al sole, sparsi senza righe
  erba: {
    pal: "erba",
    px: [
      "1111111111111111",
      "1111111111111212",
      "1111111111111121",
      "1212121111111111",
      "1122211111111111",
      "1111111111111111",
      "1111111111111111",
      "1111111111211211",
      "1111111111122111",
      "1110111111111111",
      "1101111111111111",
      "1111111111111110",
      "1111112121211101",
      "1111111222111111",
      "1111111111111111",
      "1111111111111111",
    ],
  },

  // erba alta: ventagli fitti di fili lunghi, la punta al sole, la radice in ombra; due file sfalsate
  erba_alta: {
    pal: "erba",
    px: [
      "3322222220222233",
      "0222220221202212",
      "1220221202121212",
      "1221212212121221",
      "2121212021121212",
      "2121122122121122",
      "2212121222111122",
      "2211112222333322",
      "2233302222022222",
      "2202212022120222",
      "2212021212121220",
      "2122121212211221",
      "2120211212122121",
      "1221221211222121",
      "1212221111222212",
      "1122223333222211",
    ],
  },

  // prato con fiorellini bianchi e rosa (tavolozza prato_fiori: 0 bianco, 1 rosa, 2 erba, 3 erba scura)
  fiori: {
    pal: "prato_fiori",
    px: [
      "2222222222222222",
      "2222222222222222",
      "2222022222223223",
      "2220102222222332",
      "2222032212222222",
      "2222222101222222",
      "2222222213222222",
      "2202222222222222",
      "2010222222222222",
      "2203222222222222",
      "2222222222221222",
      "2222222222210122",
      "2222232323221322",
      "2222223332222222",
      "2222222222222222",
      "2222222222222222",
    ],
  },

  // la piazza: ciottoli tondeggianti a file, giunte sfalsate senza scalini in diagonale; luce in alto a
  // sinistra di ogni pietra, la malta che si allarga un poco in basso a destra
  pietra: {
    pal: "pietra",
    px: [
      "2000112220001122",
      "0111111201111112",
      "1111112211111122",
      "2111222221112222",
      "2222222222222222",
      "1222000112220001",
      "1120111111201111",
      "1121111111211111",
      "1221111112211111",
      "2222111222221112",
      "2222222222222222",
      "1112220011222000",
      "1111201111120111",
      "1112211111221111",
      "1222221122222111",
      "2222222222222222",
    ],
  },

  // terra battuta: qualche sasso con la sua ombra, un paio di solchi
  sentiero: {
    pal: "sentiero",
    px: [
      "1111111111111111",
      "1111111111111111",
      "1111111111111111",
      "1111001111111111",
      "1110002111111111",
      "1111221112221111",
      "1111111111000111",
      "1111111111111111",
      "1111111111111111",
      "1111111111111111",
      "1111111111100111",
      "1011111111122111",
      "0011111111111111",
      "1111111111111111",
      "1111112211111111",
      "1111111001111111",
    ],
  },

  // i binari: due rotaie da sinistra a destra sulle traversine, la massicciata intorno (sopra c'è la siepe)
  binari: {
    pal: "massicciata",
    px: [
      "2222222222222222",
      "1111112211111111",
      "1222311112223111",
      "1222311112223111",
      "0000000000000000",
      "3333333333333333",
      "1222311112223111",
      "1222311112223221",
      "1222312212223111",
      "1222311112223111",
      "0000000000000000",
      "3333333333333333",
      "1222311112223111",
      "1333311113333111",
      "1122221111222211",
      "1111111111111111",
    ],
  },

  // la banchina: lastre chiare di larghezze diverse, a file sfalsate (lastricato, non mattoni);
  // tavolozza banchina: 0 lastra, 1 giallo, 2 fuga, 3 ciglio
  banchina: {
    pal: "banchina",
    px: [
      "0000020000000002",
      "0000020000000002",
      "0000020000000002",
      "0000020000000002",
      "0000020000000002",
      "0000020000000002",
      "0000020000000002",
      "2222222222222222",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "2222222222222222",
    ],
  },

  // il bordo della banchina: in alto il ciglio verso i binari (l'ombra del salto, la cordonata chiara),
  // poi la riga gialla di sicurezza e le lastre, che continuano in quelle della banchina sotto
  banchina_bordo: {
    pal: "banchina",
    px: [
      "3333333333333333",
      "0000000200000000",
      "0000000200000000",
      "2222222222222222",
      "1111111111111111",
      "1111111111111111",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "0200000000020000",
      "2222222222222222",
    ],
  },

  // il lago: riflessi chiari orizzontali, ciascuno con il suo incavo più scuro sotto a sinistra;
  // nel secondo fotogramma riflesso e incavo si allontanano di un pixel (un luccichio lento)
  acqua: {
    pal: "acqua",
    px: [
      "1111111111111111",
      "1111111111111111",
      "1110000111111111",
      "1222111111111111",
      "1111111111111111",
      "1111111111110011",
      "1111111111221111",
      "1111111111111111",
      "1111111111111111",
      "1111111111111111",
      "1111111000111111",
      "1111122211111111",
      "1111111111111111",
      "0111111111111110",
      "1111111111111221",
      "1111111111111111",
    ],
    anim: [[
      "1111111111111111",
      "1111111111111111",
      "1111000011111111",
      "2221111111111111",
      "1111111111111111",
      "1111111111111001",
      "1111111112211111",
      "1111111111111111",
      "1111111111111111",
      "1111111111111111",
      "1111111100011111",
      "1111222111111111",
      "1111111111111111",
      "0011111111111111",
      "1111111111112211",
      "1111111111111111",
    ]],
  },

  // la sabbia della spiaggetta: un sassolino con la sua ombra e qualche piccola buca (luce in alto a sinistra)
  riva: {
    pal: "sabbia",
    px: [
      "1111111111111111",
      "1111111111111111",
      "1111111111101111",
      "1111111111112211",
      "1111001111111111",
      "1111122111111111",
      "1111111111111111",
      "1111111111111111",
      "1011111111111111",
      "1122111111111111",
      "1111111111111111",
      "1111111110111111",
      "1111111111221111",
      "1111111111111111",
      "1111101111111111",
      "1111112211111111",
    ],
  },

  // il pontile: quattro assi che scendono verso il lago, giunte sfalsate con i chiodi, un riflesso chiaro
  // sul fianco di ogni asse; tutto legno, l'acqua resta fuori dalla mattonella
  pontile: {
    pal: "legno",
    px: [
      "1123112313230123",
      "1123112311230123",
      "1123012333330123",
      "1323012311231123",
      "1123012313231123",
      "3333112311231123",
      "1123112311231123",
      "1323112311231323",
      "1123112311231123",
      "0123112311233333",
      "0123132311231123",
      "0123112301231323",
      "1123333301231123",
      "1123112301231123",
      "1123132311231123",
      "1123112311231123",
    ],
  },

  // canne nell'acqua: due ciuffi ad altezze diverse, steli che si piegano in punta, pannocchie scure,
  // increspature chiare alla base (tavolozza canneto: l'acqua ha gli stessi azzurri del lago)
  canne: {
    pal: "canneto",
    px: [
      "1111111111111111",
      "1111211111111111",
      "1111331100011111",
      "1211331111111111",
      "1211331111111111",
      "1121331111112111",
      "1121211211113311",
      "1121211212113312",
      "1121212112113312",
      "1121212111213321",
      "1121212111212121",
      "1121212111212121",
      "1121212111212121",
      "1121212111212121",
      "0011111001212121",
      "1111111110111110",
    ],
    // come il lago: le increspature si spostano di un pixel, le canne restano ferme
    anim: [[
      "1111111111111111",
      "1111211111111111",
      "1111331110001111",
      "1211331111111111",
      "1211331111111111",
      "1121331111112111",
      "1121211211113311",
      "1121211212113312",
      "1121212112113312",
      "1121212111213321",
      "1121212111212121",
      "1121212111212121",
      "1121212111212121",
      "1121212111212121",
      "1001111100212121",
      "0111111111011111",
    ]],
  },

  // la siepe del bordo: un muro fitto di cespugli tondi, a file sfalsate (non in diagonale), foglie al sole
  // in alto a sinistra e ombra profonda tra un cespuglio e l'altro
  siepe: {
    pal: "chioma",
    px: [
      "3311312333313123",
      "3101111233101122",
      "1011211221011212",
      "1112112221121222",
      "1121122231212223",
      "2122223232222323",
      "2222323332223333",
      "3223333333223333",
      "1233331312333113",
      "1123310112231011",
      "1122101121210112",
      "1222112122211121",
      "2223121222311211",
      "2323222232321222",
      "2333222333322223",
      "3333322333332233",
    ],
  },

  // staccionata di legno sul prato (tavolozza staccionata: 0 legno, 1 erba, 2 erba in ombra, 3 legno scuro)
  recinto: {
    pal: "staccionata",
    px: [
      "1111111111111111",
      "1111113111111111",
      "1111130311111111",
      "1111130311111111",
      "0000030300000000",
      "3333330333333333",
      "2222230322222222",
      "1111130311111111",
      "1111130311111111",
      "0000030300000000",
      "3333330333333333",
      "2222230322222222",
      "1111130311111111",
      "1111133311121211",
      "1111111222112111",
      "1111111111111111",
    ],
  },

  /* ---------- dentro la bottega ---------- */

  // parquet: listoni orizzontali, giunte sfalsate, venature leggere
  parquet: {
    pal: "parquet",
    px: [
      "1111120111111111",
      "1111121111111111",
      "1111121111221111",
      "2222222222222222",
      "1111111111111201",
      "1100011111111211",
      "1111111111111211",
      "2222222222222222",
      "1120111111111111",
      "1121111111112211",
      "1121111111111111",
      "2222222222222222",
      "1111111112011111",
      "1111111112111111",
      "1111100012111111",
      "2222222222222222",
    ],
  },

  // tappeto verde petrolio: rombi intrecciati che continuano da una mattonella all'altra, senza bordo
  tappeto: {
    pal: "tappeto",
    px: [
      "0023222212222320",
      "0232222121222232",
      "2322221222122223",
      "3222212222212222",
      "2222122232221222",
      "2221222323222122",
      "2212223222322212",
      "2122232202232221",
      "1222322000223222",
      "2122232202232221",
      "2212223222322212",
      "2221222323222122",
      "2222122232221222",
      "3222212222212222",
      "2322221222122223",
      "0232222121222232",
    ],
  },

  // la parete di fondo vista di fronte: intonaco chiaro, zoccolo scuro in basso. La parete è alta due
  // mattonelle: nella riga di sopra la stessa fascia fa da cornice a metà parete, con l'ombra sotto
  // (la prima riga di pixel)
  muro_int: {
    pal: "muro_int",
    px: [
      "1111111111111111",
      "0000000000000000",
      "0000000000000000",
      "0001100000000000",
      "0000000000000000",
      "0000000000000000",
      "0000000000011000",
      "0000000000000000",
      "0000000000000000",
      "0000011000000000",
      "0000000000000000",
      "0000000000000000",
      "1111111111111111",
      "2222222222222222",
      "2222222222222222",
      "3333333333333333",
    ],
  },

  // il muro in basso, visto dall'alto: una fascia scura con il ciglio chiaro verso la stanza
  muro_basso: {
    pal: "muro_int",
    px: [
      "3333333333333333",
      "1111111111111111",
      "2222222222222222",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
      "3333333333333333",
    ],
  },

  // lo zerbino di cocco nel vano della porta, tra i due pezzi di muro: due righe chiare verso i bordi
  // e la trama intrecciata al centro (tavolozza zerbino: fibra chiara, fibra, bordo, muro)
  zerbino: {
    pal: "zerbino",
    px: [
      "3333333333333333",
      "3222222222222223",
      "3211111111111123",
      "3200000000000023",
      "3211111111111123",
      "3212121212121223",
      "3221212121212123",
      "3212121212121223",
      "3221212121212123",
      "3212121212121223",
      "3221212121212123",
      "3211111111111123",
      "3200000000000023",
      "3211111111111123",
      "3222222222222223",
      "3333333333333333",
    ],
  },
};

/** Tavolozze in più per questi disegni (oltre a quelle comuni di grafica/tavolozze.ts): per luce, poi per nome.
    La sera deve avere gli stessi nomi del giorno; se manca, si usa quella del giorno. */
export const TAVOLOZZE_MATTONELLE: Partial<Record<Luce, Record<string, Tavolozza>>> = {
  giorno: {
    // il prato coi fiori: bianco, rosa, l'erba e l'erba in ombra (gli stessi verdi di «erba»)
    prato_fiori: ["#fff6e8", "#f6a0b8", "#90c860", "#5a9840"],
    // binari: acciaio lucido, ghiaia, traversine, ombra
    massicciata: ["#e8e8f0", "#a8a098", "#7a6252", "#352c2e"],
    // banchina: lastra, riga gialla, fughe, ciglio
    banchina: ["#f0e6d0", "#f4d04c", "#d4c4a4", "#5a4a3e"],
    // canne: acqua chiara, acqua (gli stessi azzurri di «acqua»), steli, pannocchie
    canneto: ["#c8eef8", "#7cc8ec", "#5a9840", "#5a3c24"],
    // staccionata: legno, erba, erba in ombra, legno scuro
    staccionata: ["#ecc490", "#90c860", "#5a9840", "#50321c"],
  },
  sera: {
    prato_fiori: ["#a8a8c8", "#9a7898", "#4a6a88", "#34506c"],
    massicciata: ["#9a9cb4", "#626078", "#463e52", "#1a1828"],
    banchina: ["#8a90a8", "#a09048", "#6a7090", "#262a44"],
    canneto: ["#4a6a9c", "#34548a", "#2e4c58", "#141e34"],
    staccionata: ["#8c7c84", "#4a6a88", "#34506c", "#261e34"],
  },
  interno: {
    // zerbino: fibra chiara, fibra, bordo, muro
    zerbino: ["#e8c8a0", "#b88454", "#7a5030", "#5e4c3c"],
  },
};
