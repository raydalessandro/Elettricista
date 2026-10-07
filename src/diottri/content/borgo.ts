/* ====== DIOTTRI · MONDO 1: IL BORGO DIOTTRIA ======
   Il verbo del mondo è «far vedere lontano»: ogni abitante ha il suo difetto; trovata la sua lente, legge
   lontano e ti indica dove luccica il prossimo Diottro. Le mappe sono griglie di lettere; sopra, gli oggetti,
   i personaggi e le cose da toccare. Ogni testo sta in un riquadro: tre righe da 24 caratteri.
   «{o}» diventa «o» o «a» secondo chi gioca. */
import { vale } from "../mondo/motore";
import type { Battuta, Comando, Condizione, Contesto, Evento, MappaDef, StatoMondo } from "../mondo/tipi";

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

/** Un cliente del borgo. Prima: il suo problema e il caso. Subito dopo: ci vede, e indica dove luccica il prossimo
    Diottro. Le volte dopo: il grazie, di nuovo l'indicazione finché serve, e la prova da rifare (se si vuole). */
interface Cliente {
  id: string;
  nome: string;
  problema: string;
  ciVedo: string;
  /** il prossimo passo: detto subito dopo il caso, e ripetuto dopo se non è ancora fatto */
  indica: { passo: string; subito: string; poi: string };
  /** quello che succede dopo l'indicazione (la sera, la mattina) */
  poi?: Evento;
  grazie: string;
}

function cliente(c: Cliente): Battuta[] {
  return [
    {
      se: { nonFatti: [c.id] },
      fai: [
        { dice: c.problema, chi: c.nome },
        {
          scelta: "Andiamo in bottega?",
          voci: [
            {
              testo: "Sì, andiamo!",
              fai: [
                { caso: c.id },
                {
                  se: { fatti: [c.id] },
                  allora: [{ dice: c.ciVedo, chi: c.nome }, { se: { nonFatti: [c.indica.passo] }, allora: [{ dice: c.indica.subito, chi: c.nome }] }, ...(c.poi ?? [])],
                  altrimenti: [{ dice: "Riproviamo quando vuoi: non ho fretta.", chi: c.nome }],
                },
              ],
            },
            { testo: "Dopo.", fai: [], annulla: true },
          ],
        },
      ],
    },
    {
      fai: [
        { dice: c.grazie, chi: c.nome },
        { se: { nonFatti: [c.indica.passo] }, allora: [{ dice: c.indica.poi, chi: c.nome }] },
        { scelta: "Rifacciamo la prova?", voci: [{ testo: "Sì, rifacciamola.", fai: [{ caso: c.id }] }, { testo: "No, grazie.", fai: [], annulla: true }], predefinita: 1 },
      ],
    },
  ];
}

/** Un luccichio: il riconoscimento; preso, cosa torna a funzionare e dove andare. */
function luccichio(id: string, x: number, y: number, se: Condizione, preso: string[]): MappaDef["cose"][number] {
  return {
    id: `luccichio-${id}`, tipo: "luccichio", x, y,
    se: { ...se, nonFatti: [...(se.nonFatti ?? []), id] },
    tocca: [{
      fai: [
        { ric: id },
        { se: { fatti: [id] }, allora: preso.map(t => ({ dice: t })), altrimenti: [{ dice: "È scappato, ma non lontano: riprova quando vuoi." }] },
      ],
    }],
  };
}

/** La prima battuta che vale, scritta come un comando: per dire il consiglio giusto dentro un evento. */
function primaCheVale(bs: Battuta[]): Evento {
  const [b, ...resto] = bs;
  if (!b) return [];
  if (!b.se) return b.fai;
  return [{ se: b.se, allora: b.fai, altrimenti: primaCheVale(resto) } as Comando];
}

/* ---------- il finale: dopo Luisa, o dovunque si torni con il caso 5 fatto ---------- */

const FINALE: Evento = [
  { dice: "Con Luisa hai fatto bene: con un allarme, prima il medico.", chi: IRIDE },
  { dice: "Il borgo è tarato: ecco l'attestato di Borgo Diottria!", chi: IRIDE },
  { segna: "attestato" },
  { fine: "Sai misurare, scegliere le lenti e riconoscere un allarme.", titolo: "Attestato di Borgo Diottria", sotto: "Nella Valle delle Montature il Pressappoco ha aperto un banco…" },
];

/* ---------- i consigli di Iride: il prossimo passo, sempre ---------- */

const CONSIGLI: Battuta[] = [
  { se: { segni: ["misurato"], nonSegni: ["furto"] }, fai: [{ dice: "Esca a guardare la strada: adesso la vede bene!", chi: IRIDE }] },
  { se: { nonFatti: ["c1"] }, fai: [{ dice: "Marco, al binario, non legge il tabellone. Vai da lui!", chi: IRIDE }] },
  { se: { nonFatti: ["r1"] }, fai: [{ dice: "All'edicola luccica: tocca, prova col banco, poi Riconosci.", chi: IRIDE }] },
  { se: { nonFatti: ["c2"] }, fai: [{ dice: "In piazza c'è Giulia: si stanca gli occhi.", chi: IRIDE }] },
  { se: { nonFatti: ["r2"] }, fai: [{ dice: "Stasera, nel vicolo dei lampioni, cerca il verde.", chi: IRIDE }] },
  { se: { nonFatti: ["r5"] }, fai: [{ dice: "Alla nostra vetrina, fuori, c'è un luccichio!", chi: IRIDE }] },
  { se: { nonFatti: ["c3"] }, fai: [{ dice: "Davide è al parcheggio, in fondo al vicolo.", chi: IRIDE }] },
  { se: { nonFatti: ["r3"] }, fai: [{ dice: "Al lago brilla qualcosa: guarda sulla sabbia.", chi: IRIDE }] },
  { se: { nonFatti: ["c4"] }, fai: [{ dice: "Paolo pesca in fondo al pontile.", chi: IRIDE }] },
  { se: { nonFatti: ["r4"] }, fai: [{ dice: "Davanti alla merceria, sotto l'insegna a righe!", chi: IRIDE }] },
  { se: { nonFatti: ["c5"] }, fai: [{ dice: "C'è una cliente al banco: ascoltala bene.", chi: IRIDE }] },
  { se: { nonSegni: ["attestato"] }, fai: FINALE },
  { fai: [{ dice: "Il borgo è tarato! Torna quando vuoi: i clienti ripassano.", chi: IRIDE }] },
];

/* ---------- il prologo: la misura, la strada nitida, il furto, il mattino ---------- */

const PROLOGO_MISURA: Evento = [
  { dice: "Buongiorno! Da lontano sfocato, e da vicino bene?", chi: IRIDE },
  { scelta: "Rispondi", voci: [{ testo: "Sì, è così.", fai: [] }, { testo: "Come lo sa?", fai: [{ dice: "Strizzi gli occhi verso la strada.", chi: IRIDE }] }] },
  { dice: "Niente dolore, né lampi? La gradazione non si indovina: si misura.", chi: IRIDE },
];
const PROLOGO_LENTI: Evento = [
  { dice: "Con −1,25 la strada è nitida, e l'occhio riposa." },
  { dice: "Ecco Conca, la lente col meno: è la sua. E Bruno, le lenti da sole.", chi: IRIDE },
  { dice: "Coi clienti ci sa fare, si vede. Vuole imparare il mestiere?", chi: IRIDE },
  { scelta: "Rispondi", voci: [{ testo: "Sì!", fai: [] }, { testo: "Ci penso.", fai: [{ dice: "Ci pensi stanotte: domattina l'aspetto.", chi: IRIDE }] }] },
  { dice: "Esca a guardare la strada: adesso la vede bene!", chi: IRIDE },
];
const PROLOGO_NOTTE: Evento = [
  { dice: "Che nitido! Adesso si legge anche l'insegna." },
  { buio: "Quella notte…" },
  { dice: "Gli uomini del Pressappoco rubano il Campionario Madre." },
  { dice: "Nella fuga si apre, e i Diottri scappano nel borgo." },
  { segna: "furto" },
  { buio: "Il mattino dopo." },
  { dice: "Strano: anche con gli occhiali il borgo è sfocato. Corri da Iride!" },
];
const PROLOGO_MATTINO: Evento = [
  { dice: "Eccoti! Diamoci del tu: da oggi lavori con me.", chi: IRIDE },
  { dice: "Il Campionario è vuoto! E senza campioni gli strumenti si starano.", chi: IRIDE },
  { dice: "Lo vedi? Il borgo è starato. Ritroviamo i Diottri.", chi: IRIDE },
  { dice: "Due regole: la gradazione si misura, o si legge sulla ricetta.", chi: IRIDE },
  { dice: "Con un allarme, niente misure: prima il medico.", chi: IRIDE },
  { dice: "Allarme è dolore, lampi, o la vista che cala d'un tratto.", chi: IRIDE },
  { segna: "prologo" },
  ...primaCheVale(CONSIGLI.slice(1)),
];

/* ---------- il borgo, fuori ---------- */

const BORGO: MappaDef = {
  id: "borgo",
  nome: "Borgo Diottria",
  fuori: true,
  righe: BORGO_RIGHE,
  legenda: LEGENDA_FUORI,
  ancora: [14, 24],
  timbri: [
    { ogg: "casa_rossa", x: 1, y: 5 },
    { ogg: "bottega", x: 6, y: 5 },
    { ogg: "edicola", x: 21, y: 5 },
    { ogg: "casa_blu", x: 24, y: 5 },
    { ogg: "merceria", x: 1, y: 11 },
    { ogg: "fontana", x: 15, y: 7 },
    { ogg: "panchina", x: 16, y: 11 },
    {
      ogg: "tabellone", x: 8, y: 2,
      tocca: [
        { se: { fatti: ["c1"] }, fai: [{ dice: "Treno per Bergamo, binario 4. Marco ora lo legge." }] },
        { fai: [{ dice: "Il tabellone delle partenze. Marco non riesce a leggerlo." }] },
      ],
    },
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
      parla: cliente({
        id: "c1", nome: "Marco",
        problema: "Al binario non leggo più il tabellone!",
        ciVedo: "Ci vedo! Il treno per Bergamo è al binario 4.",
        indica: { passo: "r1", subito: "E guarda: sull'edicola, in piazza, luccica qualcosa!", poi: "Sull'edicola, in piazza, luccica qualcosa!" },
        grazie: "Leggo tutto il tabellone, anche l'ultima riga!",
      }),
    },
    {
      id: "giulia", figura: "giulia", x: 18, y: 11, dir: "sinistra", siGira: true,
      se: { fatti: ["r1"] },
      parla: cliente({
        id: "c2", nome: "Giulia",
        problema: "Ci vedo benissimo, ma la sera ho gli occhi stanchi.",
        ciVedo: "Che differenza! Da vicino è tutto più comodo.",
        indica: { passo: "r2", subito: "Stasera, nel vicolo dei lampioni, ho visto un luccichio verde.", poi: "Nel vicolo dei lampioni ho visto un luccichio verde." },
        poi: [{ buio: "Si fa sera." }],
        grazie: "Al computer adesso sto più comoda.",
      }),
    },
    {
      id: "davide", figura: "davide", x: 4, y: 23, dir: "sinistra", siGira: true,
      se: { fatti: ["r5"] },
      parla: cliente({
        id: "c3", nome: "Davide",
        problema: "I miei occhiali sono fondi di bottiglia!",
        ciVedo: "Sottili! E molti meno riflessi.",
        indica: { passo: "r3", subito: "Domattina passo dal lago: sulla sabbia brilla qualcosa.", poi: "Al lago, sulla sabbia, brilla qualcosa." },
        poi: [{ buio: "È mattina." }],
        grazie: "Stasera guido tranquillo.",
      }),
    },
    {
      id: "paolo", figura: "paolo", x: 22, y: 24, dir: "giu", siGira: true,
      se: { fatti: ["r3"] },
      parla: cliente({
        id: "c4", nome: "Paolo",
        problema: "Vorrei occhiali da sole da vista, per pescare a mezzogiorno.",
        ciVedo: "Vedo il galleggiante! E l'acqua non acceca più.",
        indica: { passo: "r4", subito: "Laggiù, sotto l'insegna a righe della merceria, luccica qualcosa.", poi: "Sotto l'insegna a righe della merceria luccica qualcosa." },
        grazie: "Abbocca! Grazie ancora.",
      }),
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
    luccichio("r1", 22, 7, { fatti: ["c1"] }, ["Bombo è tornato: la cassetta di prova ha di nuovo i più.", "Il borgo si vede meglio. In piazza, Giulia ha gli occhi stanchi."]),
    luccichio("r2", 6, 18, { fatti: ["c2"] }, ["Verdino è tornato: adesso si può fare l'antiriflesso.", "Il borgo si vede meglio. Alla vetrina di Iride luccica qualcosa."]),
    luccichio("r5", 10, 9, { fatti: ["r2"] }, ["Cello è tornato: sull'asta si leggono calibro e ponte.", "Il borgo si vede meglio. Davide è al parcheggio, in fondo al vicolo."]),
    luccichio("r3", 26, 19, { fatti: ["c3"] }, ["Polare è tornato: adesso si possono fare le polarizzate.", "Manca un Diottro solo. Paolo pesca in fondo al pontile."]),
    luccichio("r4", 3, 14, { fatti: ["c4"] }, ["Rullo è tornato: il cilindro, per l'astigmatismo.", "Il borgo è di nuovo nitido! In bottega ti aspetta una cliente."]),
    { id: "cartello-bottega", tipo: "cartello", x: 11, y: 8, solido: true, tocca: [{ fai: [{ dice: "Ottica Iride. Qui la vista si misura." }] }] },
    { id: "cartello-sud", tipo: "cartello", x: 16, y: 23, solido: true, tocca: [{ fai: [{ dice: "Su: la piazza, l'ottica e la stazione." }] }] },
    { id: "cartello-lago", tipo: "cartello", x: 20, y: 14, solido: true, tocca: [{ fai: [{ dice: "Giù: il lago. Vietato tuffarsi dal pontile." }] }] },
    { id: "cartello-vicolo", tipo: "cartello", x: 8, y: 14, solido: true, tocca: [{ fai: [{ dice: "Vicolo dei lampioni. Parcheggio in fondo." }] }] },
  ],
  entrando: [
    { se: { nonSegni: ["inizio"] }, fai: [{ dice: "Da vicino ci vedi bene. Ma in fondo alla strada, l'insegna è una macchia." }, { segna: "inizio" }] },
    // uscito dalla bottega con gli occhiali nuovi: la strada nitida, poi la notte del furto
    { se: { segni: ["misurato"], nonSegni: ["furto"] }, fai: PROLOGO_NOTTE },
  ],
};

/* ---------- la bottega di Iride, dentro ---------- */

const TUTTI_I_DIOTTRI: Condizione = { fatti: ["r1", "r2", "r3", "r4", "r5"] };

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
  ancora: [4, 7],
  timbri: [
    { ogg: "scaffale", x: 0, y: 0, tocca: [{ fai: [{ dice: "Astucci, panni e spray per pulire le lenti." }] }] },
    {
      ogg: "campionario", x: 2, y: 0,
      tocca: [
        { se: TUTTI_I_DIOTTRI, fai: [{ dice: "Il Campionario Madre: tutti i Diottri del borgo sono a casa." }] },
        { se: { segni: ["furto"] }, fai: [{ dice: "Il Campionario Madre: i posti vuoti aspettano i Diottri." }] },
        { fai: [{ dice: "Il Campionario Madre: i campioni di tutte le lenti." }] },
      ],
    },
    { ogg: "specchio", x: 6, y: 0, tocca: [{ fai: [{ dice: "Ti guardi allo specchio. Gli occhiali ti stanno bene." }] }] },
    { ogg: "scaffale", x: 8, y: 0, tocca: [{ fai: [{ dice: "Astucci, panni e spray per pulire le lenti." }] }] },
    { ogg: "banco", x: 3, y: 3 },
    {
      ogg: "cassetta", x: 8, y: 3,
      tocca: [
        { se: { segni: ["furto"], nonFatti: ["r1"] }, fai: [{ dice: "La cassetta di prova: i più sono scappati con Bombo." }] },
        { fai: [{ dice: "La cassetta di prova: tutte le forze, a quarti di diottria." }] },
      ],
    },
    {
      ogg: "vetrinetta", x: 0, y: 4,
      tocca: [
        { se: { fatti: ["r5"] }, fai: [{ dice: "Sulle aste: 52□18 140. Calibro, ponte e asta, in millimetri." }] },
        { fai: [{ dice: "Montature in vetrina. Sulle aste ci sono dei numeri." }] },
      ],
    },
    { ogg: "pianta", x: 9, y: 6 },
  ],
  porte: [{ x: 4, y: 8, verso: { mappa: "borgo", x: 8, y: 9, dir: "giu" } }],
  personaggi: [
    { id: "iride", figura: "iride", x: 5, y: 2, dir: "giu", parla: CONSIGLI },
    {
      id: "luisa", figura: "luisa", x: 4, y: 5, dir: "su", siGira: true,
      se: { fatti: ["r4"], nonFatti: ["c5"] },
      parla: [{
        fai: [
          { dice: "Da ieri vedo sfocato dall'occhio destro. Mi rifate gli occhiali?", chi: "Luisa" },
          { scelta: "Cosa fai?", voci: [{ testo: "Vediamo insieme.", fai: [{ caso: "c5" }] }, { testo: "Un momento.", fai: [], annulla: true }] },
          { se: { fatti: ["c5"] }, allora: FINALE },
        ],
      }],
    },
  ],
  cose: [],
  // il prologo, in pezzi: chi chiude il gioco a metà, rientrando riprende da dove era rimasto
  entrando: [
    { se: { nonSegni: ["misurato"] }, fai: [...PROLOGO_MISURA, { segna: "misurato" }, ...PROLOGO_LENTI] },
    { se: { segni: ["furto"], nonSegni: ["prologo"] }, fai: PROLOGO_MATTINO },
    // il caso 5 fatto dal percorso, o il finale interrotto: l'attestato si prende entrando
    { se: { fatti: ["c5"], segni: ["prologo"], nonSegni: ["attestato"] }, fai: FINALE },
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
  return DIOTTRI_DEL_BORGO.length - DIOTTRI_DEL_BORGO.filter(ctx.fatto).length;
}

/** Giorno o sera: la sera va da Giulia (la sera ho gli occhi stanchi) a Davide (di notte, che riflessi). */
export const fase = (ctx: Contesto): "giorno" | "sera" => (ctx.fatto("c2") && !ctx.fatto("c3") ? "sera" : "giorno");

/** Il prossimo passo, in una riga: per chi riprende dopo una pausa. */
export function obiettivo(ctx: Contesto): string {
  if (!ctx.segni.includes("misurato")) return "Entra nella bottega di Iride.";
  if (!ctx.segni.includes("furto")) return "Esci a guardare la strada.";
  if (!ctx.segni.includes("prologo")) return "Torna nella bottega di Iride.";
  if (ctx.fatto("c5") && !ctx.segni.includes("attestato")) return "Torna in bottega: Iride ti aspetta.";
  const c = CONSIGLI.find(b => vale(b.se, ctx))?.fai[0];
  return c && "dice" in c ? c.dice : "";
}
