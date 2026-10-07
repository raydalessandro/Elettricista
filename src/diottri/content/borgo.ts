/* ====== DIOTTRI · MONDO 1: IL BORGO DIOTTRIA ======
   Il verbo del mondo è «far vedere lontano»: ogni abitante ha il suo difetto; trovata la sua lente, legge
   lontano e ti indica dove luccica il prossimo Diottro. Le mappe sono griglie di lettere; sopra, gli oggetti,
   i personaggi e le cose da toccare. Ogni testo sta in un riquadro: tre righe da 24 caratteri.
   «{o}» diventa «o» o «a» secondo chi gioca. */
import type { Battuta, Condizione, Contesto, Evento, MappaDef, StatoMondo } from "../mondo/tipi";

const IRIDE = "Maestra Iride";

/* ---------- il borgo, fuori ---------- */

const BORGO_RIGHE = [
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "##############################",
  "------------------------------",
  "______________________________",
  "XXXXXXXXXXXX______XXXXXXXXXXXX",
  "X..........==========........X",
  "X..........==========........X",
  "X..........=============.....X",
  "X*...*.....================..X",
  "X==========================..X",
  "X==========================..X",
  "X.....==...============......X",
  "X.....==...============*.....X",
  "X.....==XXXXXX==XXXXX==XXXXXXX",
  "X**...==.X....==.X...==......X",
  "XXXXX.==.X....==.X...::......X",
  "XXXXX.==.X....==.X...::......X",
  "XXXXX.==.X....==.X...::......X",
  "XXXXX.==.X....==.XsssssssssssX",
  "XXXXX.==.X....==.XsssssssssssX",
  "XXXXX.==.X....==.Xss~~p~~~~~~X",
  "XXXXX.==.X....==.Xss~~p~~~~~~X",
  "X========X....==.X^s~~p~~~~~~X",
  "X========X....==.X^s~~p~~~~~~X",
  "X========X....==.X^s~~p~~~~~~X",
  "XXXXXXXXXXXXXX==XX^^~~~~~~~~~X",
];

const LEGENDA_FUORI: MappaDef["legenda"] = {
  ".": { tile: "erba" },
  "*": { tile: "fiori" },
  '"': { tile: "erba_alta" },
  "=": { tile: "pietra" },
  ":": { tile: "sentiero" },
  "#": { tile: "binari", solido: true },
  "-": { tile: "banchina_bordo" },
  _: { tile: "banchina" },
  "~": { tile: "acqua", solido: true },
  s: { tile: "riva" },
  p: { tile: "pontile" },
  "^": { tile: "canne", solido: true },
  X: { tile: "siepe", solido: true },
  "|": { tile: "recinto", solido: true },
};

/** Il cliente: prima il suo problema e il caso, dopo il grazie, quello che legge lontano, e la prova da rifare. */
function cliente(id: string, se: Condizione | undefined, prima: string, dopo: Evento, grazie: string): Battuta[] {
  const [nome, testo] = prima.split(": ");
  const [, grazieTesto] = grazie.split(": ");
  return [
    {
      se: { nonFatti: [id] },
      fai: [
        { dice: testo, chi: nome },
        {
          scelta: "Lo misuri in bottega?",
          voci: [
            { testo: "Sì, andiamo!", fai: [{ caso: id }, { se: { fatti: [id] }, allora: dopo, altrimenti: [{ dice: "Riproviamo quando vuoi: non ho fretta.", chi: nome }] }] },
            { testo: "Dopo.", fai: [] },
          ],
        },
      ],
    },
    {
      fai: [
        { dice: grazieTesto, chi: nome },
        { scelta: "Rifate la prova?", voci: [{ testo: "Sì, rifacciamola.", fai: [{ caso: id }] }, { testo: "No, grazie.", fai: [] }] },
      ],
    },
  ].map(b => ({ ...b, se: { ...(se ?? {}), ...(b.se ?? {}) } }));
}

/** Un luccichio: il riconoscimento, poi una riga se è tornato nel vassoio. */
function luccichio(id: string, x: number, y: number, se: Condizione, preso: string): MappaDef["cose"][number] {
  return {
    id: `luccichio-${id}`, tipo: "luccichio", x, y,
    se: { ...se, nonFatti: [...(se.nonFatti ?? []), id] },
    tocca: [{
      fai: [
        { ric: id },
        { se: { fatti: [id] }, allora: [{ dice: preso }], altrimenti: [{ dice: "È scappato, ma non lontano: riprova quando vuoi." }] },
      ],
    }],
  };
}

const BORGO: MappaDef = {
  id: "borgo",
  nome: "Borgo Diottria",
  fuori: true,
  righe: BORGO_RIGHE,
  legenda: LEGENDA_FUORI,
  timbri: [
    { ogg: "casa_rossa", x: 1, y: 5 },
    { ogg: "bottega", x: 6, y: 5 },
    { ogg: "edicola", x: 21, y: 5 },
    { ogg: "casa_blu", x: 24, y: 5 },
    { ogg: "merceria", x: 1, y: 11 },
    { ogg: "fontana", x: 15, y: 7 },
    { ogg: "panchina", x: 16, y: 11 },
    { ogg: "tabellone", x: 8, y: 2 },
    { ogg: "pensilina", x: 2, y: 2 },
    { ogg: "pensilina", x: 19, y: 2 },
    { ogg: "lampione", x: 11, y: 11 },
    { ogg: "lampione", x: 22, y: 11 },
    { ogg: "lampione", x: 5, y: 15 },
    { ogg: "lampione", x: 8, y: 17 },
    { ogg: "lampione", x: 5, y: 19 },
    { ogg: "lampione", x: 8, y: 20 },
    { ogg: "albero", x: 10, y: 15 },
    { ogg: "albero", x: 12, y: 18 },
    { ogg: "albero", x: 10, y: 21 },
    { ogg: "albero", x: 24, y: 15 },
    { ogg: "albero", x: 27, y: 15 },
    { ogg: "cespuglio", x: 16, y: 16 },
    { ogg: "cespuglio", x: 16, y: 20 },
    { ogg: "cespuglio", x: 18, y: 15 },
    { ogg: "auto", x: 2, y: 23 },
  ],
  porte: [
    { x: 8, y: 8, verso: { mappa: "bottega", x: 4, y: 7, dir: "su" } },
    { x: 2, y: 7, verso: { mappa: "borgo", x: 2, y: 8, dir: "giu" }, se: { segni: ["mai"] }, chiusa: "È chiuso. Non c'è nessuno." },
    { x: 26, y: 7, verso: { mappa: "borgo", x: 26, y: 8, dir: "giu" }, se: { segni: ["mai"] }, chiusa: "È chiuso. Non c'è nessuno." },
    { x: 2, y: 13, verso: { mappa: "borgo", x: 2, y: 14, dir: "giu" }, se: { segni: ["mai"] }, chiusa: "Merceria: «Torno subito»." },
  ],
  personaggi: [
    {
      id: "marco", figura: "marco", x: 10, y: 3, dir: "sinistra", siGira: true,
      se: { segni: ["prologo"] },
      parla: cliente("c1", undefined,
        "Marco: Al binario non leggo più il tabellone!",
        [
          { dice: "Ci vedo! Il treno per Bergamo è al binario 4.", chi: "Marco" },
          { dice: "E guarda: sull'edicola, in piazza, luccica qualcosa!", chi: "Marco" },
        ],
        "Marco: Leggo tutto il tabellone, anche l'ultima riga!"),
    },
    {
      id: "giulia", figura: "giulia", x: 18, y: 11, dir: "sinistra", siGira: true,
      se: { fatti: ["r1"] },
      parla: cliente("c2", undefined,
        "Giulia: Ci vedo benissimo, ma la sera ho gli occhi stanchi.",
        [
          { dice: "Che differenza! E il telefono è nitido.", chi: "Giulia" },
          { dice: "Stasera, nel vicolo dei lampioni, ho visto un luccichio verde.", chi: "Giulia" },
          { buio: "Si fa sera." },
        ],
        "Giulia: Al computer adesso lavoro tranquilla."),
    },
    {
      id: "davide", figura: "davide", x: 4, y: 23, dir: "sinistra", siGira: true,
      se: { fatti: ["r2"] },
      parla: cliente("c3", undefined,
        "Davide: I miei occhiali sono fondi di bottiglia. E di notte, che riflessi!",
        [
          { dice: "Sottili! E niente più riflessi.", chi: "Davide" },
          { dice: "Domattina passo dal lago: sulla sabbia brilla qualcosa.", chi: "Davide" },
          { buio: "È mattina." },
        ],
        "Davide: Stasera guido tranquillo."),
    },
    {
      id: "paolo", figura: "paolo", x: 22, y: 24, dir: "giu", siGira: true,
      se: { fatti: ["r3"] },
      parla: cliente("c4", undefined,
        "Paolo: Vorrei occhiali da sole da vista, per pescare a mezzogiorno.",
        [
          { dice: "Vedo il galleggiante! E l'acqua non acceca più.", chi: "Paolo" },
          { dice: "Laggiù, sotto l'insegna a righe della merceria, luccica qualcosa.", chi: "Paolo" },
        ],
        "Paolo: Abbocca! Grazie ancora."),
    },
    {
      id: "passante", figura: "passante", x: 13, y: 9, dir: "giu", siGira: true,
      se: { segni: ["prologo"] },
      parla: [
        { se: { nonFatti: ["c3"] }, fai: [{ dice: "Il Pressappoco vende occhiali senza misurare. Che fretta!" }] },
        { fai: [{ dice: "Il borgo si vede sempre meglio. Merito tuo!" }] },
      ],
    },
  ],
  cose: [
    luccichio("r1", 22, 7, { fatti: ["c1"] }, "Bombo torna nel vassoio. Il borgo si vede un po' meglio."),
    luccichio("r2", 6, 18, { fatti: ["c2"] }, "Verdino torna nel vassoio. Il borgo si vede meglio."),
    luccichio("r3", 26, 19, { fatti: ["c3"] }, "Polare torna nel vassoio. Il borgo si vede meglio."),
    luccichio("r4", 3, 14, { fatti: ["c4"] }, "Rullo torna nel vassoio. Manca poco!"),
    luccichio("r5", 10, 9, { fatti: ["r4"] }, "Cello torna nel vassoio. Il borgo è quasi nitido."),
    { id: "cartello-bottega", tipo: "cartello", x: 11, y: 8, solido: true, tocca: [{ fai: [{ dice: "Ottica Iride. Qui la vista si misura." }] }] },
    { id: "cartello-sud", tipo: "cartello", x: 16, y: 23, solido: true, tocca: [{ fai: [{ dice: "Su: la piazza e la stazione." }] }] },
    { id: "cartello-lago", tipo: "cartello", x: 20, y: 14, solido: true, tocca: [{ fai: [{ dice: "Giù: il lago. Vietato tuffarsi dal pontile." }] }] },
    { id: "cartello-vicolo", tipo: "cartello", x: 8, y: 14, solido: true, tocca: [{ fai: [{ dice: "Vicolo dei lampioni. Parcheggio in fondo." }] }] },
  ],
  entrando: [
    { se: { nonSegni: ["inizio"] }, fai: [{ dice: "Da vicino ci vedi bene. Ma in fondo alla strada, l'insegna è una macchia." }, { segna: "inizio" }] },
  ],
};

/* ---------- la bottega di Iride, dentro ---------- */

const BOTTEGA: MappaDef = {
  id: "bottega",
  nome: "La bottega di Iride",
  fuori: false,
  righe: [
    "WWWWWWWWWW",
    "WWWWWWWWWW",
    "pppppppppp",
    "pppppppppp",
    "pppppppppp",
    "pppTTTTppp",
    "pppTTTTppp",
    "pppppppppp",
    "BBBBzBBBBB",
  ],
  legenda: {
    W: { tile: "muro_int", solido: true },
    B: { tile: "muro_basso", solido: true },
    p: { tile: "parquet" },
    T: { tile: "tappeto" },
    z: { tile: "zerbino" },
  },
  timbri: [
    { ogg: "scaffale", x: 0, y: 0 },
    { ogg: "campionario", x: 2, y: 0 },
    { ogg: "specchio", x: 6, y: 0 },
    { ogg: "scaffale", x: 8, y: 0 },
    { ogg: "banco", x: 3, y: 3 },
    { ogg: "cassetta", x: 8, y: 3 },
    { ogg: "vetrinetta", x: 0, y: 4 },
    { ogg: "pianta", x: 9, y: 6 },
  ],
  porte: [{ x: 4, y: 8, verso: { mappa: "borgo", x: 8, y: 9, dir: "giu" } }],
  personaggi: [
    {
      id: "iride", figura: "iride", x: 5, y: 2, dir: "giu",
      parla: [
        { se: { nonFatti: ["c1"] }, fai: [{ dice: "Marco, al binario, non legge il tabellone. Vai da lui!", chi: IRIDE }] },
        { se: { nonFatti: ["r1"] }, fai: [{ dice: "Un luccichio all'edicola? Tocca, prova col banco, poi Riconosci.", chi: IRIDE }] },
        { se: { nonFatti: ["c2"] }, fai: [{ dice: "In piazza c'è Giulia: si stanca gli occhi.", chi: IRIDE }] },
        { se: { nonFatti: ["r2"] }, fai: [{ dice: "Stasera, nel vicolo dei lampioni, cerca il verde.", chi: IRIDE }] },
        { se: { nonFatti: ["c3"] }, fai: [{ dice: "Davide è al parcheggio, in fondo al vicolo.", chi: IRIDE }] },
        { se: { nonFatti: ["r3"] }, fai: [{ dice: "Al lago brilla qualcosa: guarda sulla sabbia.", chi: IRIDE }] },
        { se: { nonFatti: ["c4"] }, fai: [{ dice: "Paolo pesca in fondo al pontile.", chi: IRIDE }] },
        { se: { nonFatti: ["r4"] }, fai: [{ dice: "Davanti alla merceria, sotto l'insegna a righe!", chi: IRIDE }] },
        { se: { nonFatti: ["r5"] }, fai: [{ dice: "Nella nostra vetrina, fuori, c'è un luccichio!", chi: IRIDE }] },
        { se: { nonFatti: ["c5"] }, fai: [{ dice: "C'è una cliente al banco: ascoltala bene.", chi: IRIDE }] },
        { fai: [{ dice: "Il borgo è tarato! Torna quando vuoi: i clienti ripassano.", chi: IRIDE }] },
      ],
    },
    {
      id: "luisa", figura: "luisa", x: 4, y: 5, dir: "su", siGira: true,
      se: { fatti: ["r5"], nonFatti: ["c5"] },
      parla: [{
        fai: [
          { dice: "Da ieri vedo sfocato dall'occhio destro. Mi rifate gli occhiali?", chi: "Luisa" },
          { scelta: "Cosa fai?", voci: [{ testo: "Vediamo insieme.", fai: [{ caso: "c5" }] }, { testo: "Un momento.", fai: [] }] },
          {
            se: { fatti: ["c5"] },
            allora: [
              { dice: "Con un allarme, prima il medico. Brav{o}.", chi: IRIDE },
              { dice: "Il borgo è tarato: ecco l'attestato di Borgo Diottria!", chi: IRIDE },
              { segna: "attestato" },
              { fine: "Fine del primo mondo. Nella Valle delle Montature il Pressappoco ha aperto un banco…" },
            ],
          },
        ],
      }],
    },
  ],
  cose: [
    { id: "campionario", tipo: "oggetto", x: 2, y: 1, solido: false, tocca: [{ se: { segni: ["furto"] }, fai: [{ dice: "Il Campionario Madre: i posti vuoti aspettano i Diottri." }] }, { fai: [{ dice: "Il Campionario Madre: i campioni di tutte le lenti." }] }] },
    { id: "cassetta", tipo: "oggetto", x: 8, y: 3, solido: false, tocca: [{ fai: [{ dice: "La cassetta di prova: tutte le forze, a quarti di diottria." }] }] },
    { id: "specchio", tipo: "oggetto", x: 6, y: 1, solido: false, tocca: [{ fai: [{ dice: "Ti guardi allo specchio. Gli occhiali ti stanno bene." }] }] },
  ],
  entrando: [
    {
      se: { nonSegni: ["misurato"] },
      fai: [
        { dice: "Buongiorno! Da lontano sfocato, e da vicino bene?", chi: IRIDE },
        { scelta: "Rispondi", voci: [{ testo: "Sì, è così.", fai: [] }, { testo: "Come lo sa?", fai: [{ dice: "Strizza gli occhi verso la strada.", chi: IRIDE }] }] },
        { dice: "La gradazione non si indovina: si misura.", chi: IRIDE },
        { segna: "misurato" },
        { dice: "Con −1,25 la strada è nitida, e l'occhio riposa." },
        { dice: "Ecco Conca, la lente col meno: è la tua. E Bruno, le lenti da sole.", chi: IRIDE },
        { dice: "Coi clienti ci sai fare, ti ho visto. Vuoi imparare il mestiere?", chi: IRIDE },
        { scelta: "Rispondi", voci: [{ testo: "Sì!", fai: [] }, { testo: "Ci penso.", fai: [{ dice: "Ci pensi stanotte. Domattina ti aspetto.", chi: IRIDE }] }] },
        { buio: "Quella notte…" },
        { dice: "Gli uomini del Pressappoco rubano il Campionario Madre." },
        { dice: "Nella fuga si apre, e i Diottri scappano nel borgo." },
        { segna: "furto" },
        { buio: "Il mattino dopo." },
        { dice: "Il Campionario è vuoto! E senza campioni gli strumenti si starano.", chi: IRIDE },
        { dice: "Lo vedi? Fuori tutto è sfocato. Ritroviamo i Diottri.", chi: IRIDE },
        { dice: "Due regole: la gradazione si misura, o si legge sulla ricetta.", chi: IRIDE },
        { dice: "Con un allarme, niente misure: prima il medico.", chi: IRIDE },
        { dice: "Marco, al binario, non legge il tabellone. Vai da lui!", chi: IRIDE },
        { segna: "prologo" },
      ],
    },
  ],
};

export const MAPPE: Record<string, MappaDef> = { borgo: BORGO, bottega: BOTTEGA };

/** Dove si comincia: in fondo alla strada, guardando l'insegna. */
export const INIZIO: StatoMondo = { mappa: "borgo", x: 14, y: 24, dir: "su", segni: [] };

/** I Diottri del Borgo: ognuno ritrovato toglie un passo di starato. */
export const DIOTTRI_DEL_BORGO = ["r1", "r2", "r3", "r4", "r5"];

/** Quanto è sfocato il paesaggio fuori: prima del controllo la tua miopia, dopo il furto lo starato. */
export function nebbia(ctx: Contesto): number {
  if (!ctx.segni.includes("misurato")) return 4;
  if (!ctx.segni.includes("furto")) return 0;
  return DIOTTRI_DEL_BORGO.filter(ctx.fatto).length >= DIOTTRI_DEL_BORGO.length ? 0 : DIOTTRI_DEL_BORGO.length - DIOTTRI_DEL_BORGO.filter(ctx.fatto).length;
}

/** Giorno o sera: la sera va da Giulia (la sera ho gli occhi stanchi) a Davide (di notte, che riflessi). */
export const fase = (ctx: Contesto): "giorno" | "sera" => (ctx.fatto("c2") && !ctx.fatto("c3") ? "sera" : "giorno");

/** Il prossimo passo, in una riga: per chi riprende dopo una pausa. */
export function obiettivo(ctx: Contesto): string {
  const it = BOTTEGA.personaggi[0].parla.find(b => !b.se || (b.se.nonFatti ?? []).every(id => !ctx.fatto(id)));
  const c = it?.fai[0];
  if (!ctx.segni.includes("prologo")) return "Entra nella bottega di Iride.";
  return c && "dice" in c ? c.dice : "";
}
