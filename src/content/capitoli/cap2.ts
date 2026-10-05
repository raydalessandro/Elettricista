/* ====== CAPITOLO 2 · BANCO GUASTI ======
   L'impianto c'è ed è collegato. Qualcosa non va: lo trovi col tester, con metodo.
   Ogni livello ha più guasti possibili: il gioco ne sceglie uno, rigiocando ne trovi un altro.
   Gli impianti sono quelli del capitolo 1: li conosci, li hai fatti tu. */
import type { Board, Card, FiliLevel, GuastoLevel } from "../../core/types";
import { CAP1 } from "./cap1";

const base = (id: string): FiliLevel => {
  const l = CAP1.find(x => x.id === id);
  if (!l || l.type !== "fili") throw new Error("manca il livello " + id);
  return l;
};
const ripostiglio = base("i4"),
  presaTV = base("i5"),
  corridoio = base("i6"),
  camera = base("i7");

/** La tavola del banco: quella dell'intervento, senza i morsetti a leva che l'impianto non usa. */
function board(l: FiliLevel, edit?: (b: Board) => void): Board {
  const b = structuredClone(l.board);
  const used = new Set(l.solution.flatMap(w => [w[0], w[1]]).map(t => t.split(".")[0]));
  b.comps = b.comps.filter(c => c.kind !== "morsetto" || used.has(c.id));
  edit?.(b);
  return b;
}
const comp = (b: Board, id: string) => b.comps.find(c => c.id === id)!;
const zone = (b: Board, id: string) => b.zones!.find(z => z.id === id)!;

export const CARDS_CAP2: Record<string, Card> = {
  tester2: {
    t: "Il tester: tensione e continuità",
    teaches: ["tester-misure", "continuita"],
    p: [
      "Il tester misura **tra due punti**: un puntale su un morsetto, l'altro su un altro. Non misura «un filo»: misura la differenza tra due punti.",
      "**Tensione** (V~), con la linea accesa. Tra fase e neutro, o tra fase e terra, leggi **230 V**. Tra neutro e terra **0 V**. Tra i due capi di un filo sano 0 V: se ne leggi 230, quel filo è interrotto.",
      "Un punto staccato da tutto, sul banco, dà 0 V. Un tester digitale vero, lì, può segnare qualche decina di volt «fantasma», che il filo staccato prende dai fili vicini. In cantiere si usa la funzione LoZ, a bassa impedenza, che li fa sparire.",
      "**Continuità** (Ω), con la linea spenta. Il tester manda una piccola corrente sua. Se tra i due punti c'è un collegamento diretto (un filo, un morsetto, un contatto chiuso) **suona**: 0 Ω. Attraverso una lampadina a filamento, come quelle del banco, leggi qualche decina di ohm; una lampadina LED ha dentro un'elettronica e non dà un valore sicuro. Se non c'è collegamento leggi **OL**: aperto.",
      "La continuità si misura solo a linea spenta: sotto tensione la misura non vale, e lo strumento si può rompere.",
      "Nella realtà le misure con la linea accesa le fa solo chi è formato secondo la norma CEI 11-27 (persona esperta o avvertita). Tu qui le impari; in cantiere le fai accanto a chi ne ha la responsabilità.",
    ],
    g: [
      ["multimetro", "tester"],
      ["persona esperta (PES) o avvertita (PAV)", "chi è formato per lavorare sugli impianti"],
      ["prova di continuità", "il cicalino, il beep"],
      ["circuito aperto (OL)", "non passa"],
      ["tensione indotta", "tensione fantasma"],
      ["bassa impedenza (LoZ)", "la funzione LoZ"],
    ],
    capo: "Prima di fidarti di una misura, prova il tester su una presa che sai viva. Un tester guasto dà 0 V e OL dappertutto, e ti fa cercare un guasto che non c'è.",
  },
  metodo2: {
    t: "Il metodo: dal sintomo al punto",
    teaches: ["metodo-guasti", "lampada-guasta"],
    ol: [
      "**Ascolta il sintomo**: cosa non va, e in quali posizioni dei comandi.",
      "**Guarda**: colori e morsetti. Un filo fuori posto a volte si vede.",
      "**Parti dalla lampada**: con il comando acceso, tra L e N ci sono 230 V?",
      "Se sì, è la lampada (se vuoi la conferma: a linea spenta, tra L e N una lampadina bruciata dà OL). Se no, **torna indietro** verso la scatola, un punto alla volta, misurando ogni punto **verso la terra**.",
      "Quando trovi 230 V a un capo di un collegamento e 0 V all'altro, **il guasto è lì in mezzo**.",
      "Prima di riparare: **stacca la linea**, segnala, verifica.",
    ],
    p: [
      "Ogni misura deve rispondere a una domanda. Dieci misure a caso dicono meno di tre fatte con il metodo.",
      "Una diagnosi vale quando le misure la **dimostrano**: escludono le altre risposte e fanno vedere il difetto. Se con quello che hai misurato poteva essere anche un altro guasto, misura ancora.",
      "Colori e morsetti ti dicono dove guardare, ma non provano niente: i colori possono mentire. Anche un difetto che si vede si conferma con il tester.",
    ],
    g: [["ricerca guasti", "trovare il guasto"]],
    capo: "Scrivi quello che misuri: a metà ricerca non ti ricordi più cosa avevi visto. Il registro sotto la tavola lo fa per te.",
  },
  neutrointerrotto: {
    t: "Neutro interrotto: 230 V dove non te li aspetti",
    teaches: ["neutro-interrotto"],
    p: [
      "Se il neutro si interrompe tra la lampada e la scatola, la lampada resta spenta. Ma il suo morsetto N non è a 0 V: attraverso il filamento è collegato alla fase.",
      "Con l'interruttore acceso misuri **230 V tra il morsetto N della lampada e la terra**, come se fosse una fase. Chi tocca quel neutro prende la scossa.",
      "Attento: tra fase e neutro, invece, leggi 0 V, anche se la fase c'è. Per questo si misura sempre **anche verso la terra**.",
      "Per trovare dove si interrompe, misura il neutro anche nella scatola, verso la terra. Dove c'è ancora tensione sei dalla parte della lampada, dove leggi 0 V sei dalla parte del quadro: l'interruzione sta in mezzo. Se è in tensione fino al morsetto della scatola, il neutro manca già lì: nel morsetto, o più su, verso il quadro.",
    ],
    g: [["neutro interrotto", "neutro aperto, neutro saltato"]],
    capo: "Neutro staccato, lampada spenta e morsetto N in tensione: le mani sui fili solo dopo aver staccato al quadro.",
  },
  terramancante: {
    t: "La terra che manca",
    teaches: ["terra-mancante"],
    p: [
      "Un apparecchio senza terra funziona lo stesso: tra fase e neutro ci sono 230 V e la lampada si accende.",
      "Ma se la terra non arriva e l'apparecchio di metallo ha un guasto verso la carcassa, la carcassa resta in tensione: il differenziale non lo vede finché qualcuno non la tocca.",
      "La terra si prova per prima, a linea spenta: **continuità** tra il morsetto di terra dell'apparecchio e quello della scatola. Deve suonare. Nelle verifiche vere (CEI 64-8, parte 6) è la prima prova.",
      "Con la linea accesa e la luce accesa la vedi anche così: tra L della lampada e la sua terra 0 V, tra L e la terra della scatola 230 V. Per questo, nelle altre misure, il riferimento è **la terra della scatola**: il foro dove arriva il giallo-verde della linea.",
    ],
    g: [["continuità del conduttore di protezione", "prova della terra"]],
    capo: "La terra non si vede funzionare: si misura. E si misura per prima.",
  },
  interruttoreneutro: {
    t: "L'interruttore sul neutro",
    teaches: ["interruttore-neutro"],
    p: [
      "Se qualcuno ha messo l'interruttore sul neutro, la luce funziona: si accende e si spegne. Per questo nessuno se ne accorge.",
      "Ma a luce spenta la lampada resta collegata alla fase. Con l'interruttore spento misuri **230 V tra L della lampada e la terra della scatola**: chi cambia la lampadina «a luce spenta» può prendere la scossa.",
      "Spesso si vede anche guardando: all'interruttore arriva il blu. Ma i colori possono mentire: la prova è la misura a luce spenta.",
    ],
    capo: "La prova si fa a luce spenta. A luce accesa un interruttore sul neutro e uno sulla fase sembrano uguali.",
  },
  polarita: {
    t: "Ritorno e neutro al posto giusto, anche sulla lampada",
    teaches: ["polarita-lampada"],
    p: [
      "Sulla plafoniera il ritorno va al morsetto **L** e il neutro al morsetto **N**. Nel portalampada il morsetto L va al contatto centrale, quello che si tocca meno.",
      "Se ritorno e neutro sono scambiati, la lampada si accende lo stesso. Ma a luce accesa la parte più esposta del portalampada è in tensione.",
      "Con l'interruttore acceso, verso la terra della scatola: su L devi leggere 230 V, su N 0 V. Se è al contrario, sono scambiati. Spesso si vede anche dai colori: il nero su N, il blu su L.",
    ],
    g: [["polarità", "fase e neutro al posto giusto"]],
  },
  presamorta: {
    t: "Presa morta: manca la fase o il neutro?",
    teaches: ["presa-morta"],
    p: [
      "Prima stacca quello che c'è attaccato: un apparecchio attaccato porta la fase sul neutro interrotto, come la lampada del 2.2, e la misura inganna. Sul banco le prese sono già libere.",
      "Misura tra i due morsetti laterali, poi tra ciascuno e la terra.",
      "Se tra un laterale e la terra trovi 230 V, la fase c'è. Se però tra i due laterali leggi 0 V, **manca il neutro**. Se non trovi 230 V da nessuna parte, **manca la fase**.",
      "Poi risali verso la presa da cui questa prende la linea: il guasto sta tra l'ultimo punto che va e il primo che non va.",
    ],
  },
  scambi2: {
    t: "Funziona solo a volte: gli scambi",
    teaches: ["scambio-interrotto"],
    p: [
      "In una deviata la luce si accende quando i due deviatori scelgono lo stesso filo di scambio. Se uno scambio è interrotto, resta buono solo l'altro: la luce si accende in **una sola posizione su quattro**.",
      "Prova tutte le posizioni e annota quando la luce va. Già questo ti dice su quale scambio cercare.",
      "Poi metti i deviatori nella posizione in cui la fase dovrebbe passare proprio da quello scambio: tutti e due su 1 per lo scambio tra i morsetti 1, tutti e due su 2 per quello tra i morsetti 2. All'inizio dello scambio trovi 230 V verso terra, alla fine 0 V: il guasto è in mezzo.",
      "Se già all'inizio dello scambio leggi 0 V, la fase non ci arriva: guarda il deviatore dove arriva il marrone. La fase deve entrare nel comune C, non in un morsetto di scambio.",
    ],
    capo: "Un comando che va «a volte» non è magia: è un percorso che manca.",
  },
  banco: {
    t: "Il banco libero",
    teaches: ["banco-libero"],
    p: [
      "Da qui il guasto lo sceglie il gioco, a caso, tra quelli possibili su quell'impianto: lampadina, scambi, ritorno, coppie dell'invertitore.",
      "L'ordine è sempre lo stesso: ascolta il sintomo, guarda i collegamenti, prova tutte le posizioni dei comandi, poi misura.",
      "Con tre punti le combinazioni sono otto, e la luce sana si accende in quattro: con l'invertitore dritto (1 con 3, 2 con 4) quando i due deviatori sono sullo stesso numero, con l'invertitore incrociato (1 con 4, 2 con 3) quando sono su numeri diversi.",
      "Se la luce non si accende mai, parti dalla lampada, come nel 2.1: con una posizione in cui dovrebbe accendersi, tra L e N ci sono 230 V? Se no, segui la fase all'indietro.",
      "Se si accende **solo in due posizioni**, guarda quale comando è nella stessa posizione in tutte e due. Se è un deviatore, lo scambio interrotto è dal suo lato, tra lui e l'invertitore: in una posizione in cui la luce dovrebbe accendersi e invece resta spenta, segui la fase dalla scatola e trova dove sparisce. Se è l'invertitore, guarda le coppie.",
      "Le coppie dell'invertitore si controllano guardando: i due fili che arrivano da un deviatore vanno nella coppia 1-2, i due dell'altro nella coppia 3-4. Poi lo confermi col tester: a linea spenta, ogni filo deve suonare tra il morsetto del suo deviatore e quello dell'invertitore dove deve arrivare.",
    ],
    capo: "Il cliente ti racconta cosa vede. Le misure ti dicono dove guardare.",
  },
};

const STARS = ["Sicurezza", "Metodo", "Diagnosi"];

const MSG_SPENTA = "La luce non si accende più. Ieri andava.";
const MSG_CANTINA = "Sto comprando questa casa. Il proprietario ha rifatto da solo la luce della cantina: si accende e si spegne. Prima del rogito mi dai un'occhiata?";

export const CAP2: GuastoLevel[] = [
  /* ---------- 2.1 ---------- */
  {
    id: "g1", n: 10, cap: 2, part: "Banco guasti", type: "guasto",
    title: "Non si accende", short: "Trova perché la plafoniera resta spenta",
    note: "È il ripostiglio dell'intervento 4, collegato come l'avevi lasciato. Qualcosa, però, non va.",
    client: { who: "Sig. Galli", where: "ripostiglio", msg: MSG_SPENTA },
    learn: ["Il tester: tensione con la linea accesa, continuità con la linea spenta", "Il metodo: dal sintomo al punto, una misura alla volta", "Lampada, interruttore o filo: come si distinguono"],
    cards: ["tester2", "metodo2"],
    board: board(ripostiglio), goal: ripostiglio.goal, wiring: ripostiglio.solution, line: "Luci C10",
    faults: [
      {
        id: "lampadina", label: "La lampadina della plafoniera è bruciata", where: "nella plafoniera", msg: MSG_SPENTA, symptom: "spenta",
        broken: ["LP"], requires: ["lampada-guasta"], minMeasures: 1,
        proof: "Con l'interruttore acceso, tra L e N della plafoniera ci sono 230 V e la luce resta spenta: la tensione arriva fino alla lampada, è lei a non accendersi. A linea spenta lo confermi: tra L e N la lampadina bruciata dà OL.",
      },
      {
        id: "ritorno", label: "Il ritorno tra interruttore e plafoniera non fa contatto", where: "sul filo nero tra interruttore e plafoniera", msg: MSG_SPENTA, symptom: "spenta",
        open: [["I.2", "LP.L"]], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto 2 dell'interruttore ha 230 V verso terra, il morsetto L della plafoniera no: il collegamento in mezzo è interrotto, nel filo nero o in uno dei suoi due morsetti.",
      },
      {
        id: "fase", label: "La fase non arriva all'interruttore", where: "sul filo marrone tra scatola e interruttore", msg: MSG_SPENTA, symptom: "spenta",
        open: [["W1.s2", "I.1"]], minMeasures: 2,
        proof: "Nella scatola il morsetto della fase ha 230 V verso terra, il morsetto 1 dell'interruttore no: il collegamento in mezzo è interrotto, nel filo marrone o in uno dei suoi due morsetti.",
      },
      {
        id: "interruttore", label: "L'interruttore non chiude", where: "dentro l'interruttore", msg: MSG_SPENTA, symptom: "spenta",
        broken: ["I"], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto 1 ha 230 V verso terra e il morsetto 2 no: il contatto dentro non chiude.",
      },
    ],
    hints: [
      "Parti dalla plafoniera: accendi l'interruttore e misura tra L e N.",
      "Se alla plafoniera non arriva niente, torna indietro: con l'interruttore acceso misura i morsetti dell'interruttore verso la terra (il morsetto giallo-verde), uno alla volta.",
    ],
    stars: STARS,
    quiz: [
      { q: "Con il tester in tensione, tra i due capi di un filo sano leggi…", o: ["230 V", "0 V", "Dipende dal colore"], ok: 1, why: "Il tester misura una differenza: i due capi di un filo sano stanno allo stesso potenziale. Se leggi 230 V, il filo è interrotto." },
      { q: "La continuità si misura…", o: ["Con la linea accesa, così si vede se passa corrente", "Con la linea spenta", "Solo sui fili di terra"], ok: 1, why: "In continuità il tester manda una corrente sua: sotto tensione la misura non vale e lo strumento si può rompere." },
      { q: "La luce non si accende. Con l'interruttore acceso, tra L e N della lampada misuri 230 V. Il guasto è…", o: ["Nella lampada", "Nell'interruttore", "Nel neutro"], ok: 0, why: "La tensione arriva fino alla lampada: è lei che non lavora." },
    ],
  },
  /* ---------- 2.2 ---------- */
  {
    id: "g2", n: 11, cap: 2, part: "Banco guasti", type: "guasto",
    title: "Il neutro che punge", short: "La luce è spenta: misura prima di toccare",
    note: "Stesso schema del ripostiglio: linea in scatola, interruttore alla porta, plafoniera al soffitto.",
    client: { who: "Sig.ra Bassi", where: "lavanderia", msg: "La luce della lavanderia non si accende più." },
    learn: ["Perché un neutro interrotto dà 230 V", "Trovare dove si interrompe il neutro"],
    cards: ["neutrointerrotto"],
    board: board(ripostiglio), goal: ripostiglio.goal, wiring: ripostiglio.solution, line: "Luci C10",
    faults: [
      {
        id: "neutro-scatola", label: "Il neutro della linea non arriva al morsetto della scatola", where: "nella scatola, dove arriva il blu della linea", msg: "La luce della lavanderia non si accende più.", symptom: "spenta",
        open: [["cB.x", "W2.s1"]], requires: ["neutro-interrotto"], minMeasures: 2,
        proof: "Con l'interruttore acceso il neutro è in tensione verso terra dappertutto: alla plafoniera e anche nel morsetto della scatola. Il neutro della linea non arriva: si controlla il morsetto dove entra il blu, poi si risale verso il quadro.",
      },
      {
        id: "neutro-plafoniera", label: "Il neutro tra scatola e plafoniera è interrotto", where: "sul filo blu tra scatola e plafoniera", msg: "La luce della lavanderia non si accende più.", symptom: "spenta",
        open: [["W2.s2", "LP.N"]], requires: ["neutro-interrotto"], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto N della plafoniera ha 230 V verso terra, il morsetto del neutro nella scatola 0 V: il collegamento in mezzo è interrotto, nel filo blu o in uno dei suoi due morsetti.",
      },
      {
        id: "lampadina", label: "La lampadina della plafoniera è bruciata", where: "nella plafoniera", msg: "La luce della lavanderia non si accende più.", symptom: "spenta",
        broken: ["LP"], requires: ["lampada-guasta"], minMeasures: 1,
        proof: "Con l'interruttore acceso, tra L e N della plafoniera ci sono 230 V e la luce resta spenta: la tensione arriva, è la lampada a non accendersi. A linea spenta lo confermi: tra L e N la lampadina bruciata dà OL.",
      },
      {
        id: "ritorno", label: "Il ritorno tra interruttore e plafoniera non fa contatto", where: "sul filo nero tra interruttore e plafoniera", msg: "La luce della lavanderia non si accende più.", symptom: "spenta",
        open: [["I.2", "LP.L"]], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto 2 dell'interruttore ha 230 V verso terra, il morsetto L della plafoniera no: il collegamento in mezzo è interrotto, nel filo nero o in uno dei suoi due morsetti.",
      },
    ],
    hints: [
      "Accendi l'interruttore e misura la plafoniera: tra L e N, poi ciascuno verso la terra.",
      "Se il neutro della plafoniera ha tensione verso terra, cerca dove si interrompe: misura verso terra anche il morsetto del neutro nella scatola.",
    ],
    stars: STARS,
    quiz: [
      { q: "Neutro interrotto tra lampada e scatola, interruttore acceso. Tra il morsetto N della lampada e la terra misuri…", o: ["0 V: è il neutro", "230 V: la fase arriva attraverso il filamento", "115 V"], ok: 1, why: "La lampada collega il suo morsetto N alla fase. Senza neutro, quel morsetto è in tensione." },
      { q: "Il cercafase si accende sul filo blu. Cosa pensi?", o: ["Il cercafase è rotto", "Il neutro potrebbe essere interrotto: misuro prima di toccare", "Va bene così: il blu è sempre in tensione"], ok: 1, why: "Un neutro sano sta a 0 V. Se è in tensione, da qualche parte si è interrotto." },
      { q: "Neutro interrotto: tra fase e neutro leggi 0 V. Vuol dire che la linea è spenta?", o: ["Sì, 0 V vuol dire niente tensione", "No: misuro anche fase–terra, la fase può esserci", "Sì, se anche la lampada è spenta"], ok: 1, why: "Senza neutro, tra fase e neutro non c'è differenza. Verso terra, la fase dà 230 V lo stesso." },
    ],
  },
  /* ---------- 2.3 ---------- */
  {
    id: "g3", n: 12, cap: 2, part: "Banco guasti", type: "guasto",
    title: "La cantina da comprare", short: "Verifica un impianto che funziona",
    note: "L'ha collegata il vecchio proprietario: linea in scatola, interruttore alla porta, plafoniera al soffitto.",
    client: { who: "Paolo", where: "cantina", msg: MSG_CANTINA },
    learn: ["Verificare un impianto che funziona: prima la terra", "L'interruttore sul neutro", "Ritorno e neutro al posto giusto"],
    cards: ["terramancante", "interruttoreneutro", "polarita"],
    board: board(ripostiglio), goal: ripostiglio.goal, wiring: ripostiglio.solution, line: "Luci C10",
    faults: [
      {
        id: "int-neutro", label: "L'interruttore è sul neutro", where: "tra scatola, interruttore e plafoniera", symptom: "funziona", msg: MSG_CANTINA,
        rewire: [
          { from: ["W1.s2", "I.1"], to: ["W1.s2", "LP.L"] },
          { from: ["I.2", "LP.L"], to: ["I.2", "LP.N"] },
          { from: ["W2.s2", "LP.N"], to: ["W2.s2", "I.1"] },
        ],
        requires: ["interruttore-neutro"], minMeasures: 1,
        proof: "Con l'interruttore spento, tra L della plafoniera e la terra della scatola ci sono 230 V: la lampada resta in tensione anche a luce spenta. E all'interruttore arriva il blu.",
      },
      {
        id: "polarita", label: "Ritorno e neutro sono scambiati sulla plafoniera", where: "sui morsetti L e N della plafoniera", symptom: "funziona", msg: MSG_CANTINA,
        rewire: [
          { from: ["I.2", "LP.L"], to: ["I.2", "LP.N"] },
          { from: ["W2.s2", "LP.N"], to: ["W2.s2", "LP.L"] },
        ],
        requires: ["polarita-lampada"], minMeasures: 1,
        proof: "Con l'interruttore acceso, verso la terra della scatola, il morsetto L della plafoniera ha 0 V e il morsetto N 230 V: ritorno e neutro sono scambiati. Si vede anche dai colori: il nero arriva su N, il blu su L.",
      },
      {
        id: "terra", label: "La terra non arriva alla plafoniera", where: "sul giallo-verde tra scatola e plafoniera", symptom: "funziona", msg: MSG_CANTINA,
        open: [["W3.s2", "LP.PE"]], requires: ["terra-mancante"], minMeasures: 1,
        proof: "A linea spenta, tra la terra della plafoniera e quella della scatola non c'è continuità: il giallo-verde non fa contatto. Con la linea accesa e la luce accesa, L della plafoniera ha 230 V verso la terra della scatola, ma 0 V verso la sua.",
      },
      {
        id: "nessuno", label: "Nessun difetto: la luce è fatta bene", where: "", symptom: "funziona", msg: MSG_CANTINA,
        none: true, minMeasures: 2,
        proof: "La terra della plafoniera suona con quella della scatola, i colori sono al loro posto, a luce spenta la lampada non è in tensione e a luce accesa, verso la terra della scatola, L ha 230 V e N 0 V.",
      },
    ],
    hints: [
      "Prima la terra: a linea spenta, continuità tra la terra della plafoniera e quella della scatola.",
      "Poi con la linea accesa, verso la terra della scatola: L della plafoniera a luce spenta, poi L e N a luce accesa. E guarda i colori che arrivano all'interruttore e alla plafoniera.",
    ],
    stars: STARS,
    quiz: [
      { q: "La luce si accende e si spegne. Basta per dire che l'impianto è a posto?", o: ["Sì, funziona", "No: va verificato con il tester, anche a luce spenta", "Sì, se i fili sono nuovi"], ok: 1, why: "Interruttore sul neutro, ritorno e neutro scambiati, terra staccata: la luce funziona lo stesso, ed è proprio per questo che si misura." },
      { q: "Con l'interruttore spento misuri 230 V tra L della lampada e la terra. Perché?", o: ["È normale", "L'interruttore è sul neutro", "Manca la terra"], ok: 1, why: "Se l'interruttore interrompe il neutro, la fase arriva sempre alla lampada." },
      { q: "Sulla plafoniera: tra fase e neutro 230 V, tra fase e la terra della plafoniera 0 V. Cosa manca?", o: ["Il neutro", "La terra", "Niente, è normale"], ok: 1, why: "Tra fase e terra devono esserci 230 V. Se ne leggi 0, il giallo-verde non arriva." },
      { q: "Verifichi un impianto. Qual è la prima prova?", o: ["La tensione tra fase e neutro", "La continuità della terra, a linea spenta", "Accendere e spegnere la luce"], ok: 1, why: "Prima la terra: se manca, anche le misure verso terra ingannano. E si fa a linea spenta." },
    ],
  },
  /* ---------- 2.4 ---------- */
  {
    id: "g4", n: 13, cap: 2, part: "Banco guasti", type: "guasto",
    title: "La presa morta", short: "La presa dietro la TV non dà corrente",
    note: "È la presa per la TV dell'intervento 5: la presa nuova prende la linea da quella esistente. Al quadro questa linea è la leva «Prese camere»: nell'intervento 5 avevi scoperto che le scritte del quadro erano sbagliate.",
    client: { who: "Marta", where: "soggiorno", msg: "La presa dietro la TV non dà più corrente." },
    learn: ["Presa morta: manca la fase o il neutro?", "Il guasto sta tra l'ultimo punto che va e il primo che non va"],
    cards: ["presamorta"],
    board: board(presaTV, b => {
      zone(b, "B").label = "presa nuova (TV)";
    }),
    goal: presaTV.goal, wiring: presaTV.solution, line: "Prese camere C16",
    faults: [
      {
        id: "fase-derivazione", label: "La fase tra le due prese è interrotta", where: "sul marrone tra presa esistente e presa nuova", msg: "La presa dietro la TV non dà più corrente.", symptom: "presa-morta",
        open: [["PA.A", "PB.A"]], requires: ["presa-morta"], minMeasures: 2,
        proof: "Sulla presa nuova non c'è tensione da nessuna parte, mentre sulla presa esistente la fase c'è (230 V verso terra): il collegamento tra le due prese è interrotto, nel marrone o in uno dei suoi due morsetti.",
      },
      {
        id: "neutro-derivazione", label: "Il neutro tra le due prese è interrotto", where: "sul blu tra presa esistente e presa nuova", msg: "La presa dietro la TV non dà più corrente.", symptom: "presa-morta",
        open: [["PA.B", "PB.B"]], requires: ["presa-morta"], minMeasures: 2,
        proof: "Sulla presa nuova la fase c'è (230 V verso terra), ma tra i due laterali leggi 0 V: manca il neutro. Sulla presa esistente il neutro c'è: il collegamento tra le due prese è interrotto, nel blu o in uno dei suoi due morsetti.",
      },
      {
        id: "fase-linea", label: "La fase della linea non arriva alla presa esistente", where: "sulla presa esistente, dove arriva il marrone della linea", msg: "La presa dietro la TV non dà più corrente.", symptom: "presa-morta",
        open: [["S.L", "PA.A"]], requires: ["presa-morta"], minMeasures: 2,
        proof: "Con il tester provato e la linea accesa, neanche sulla presa esistente c'è tensione da nessuna parte: la fase della linea non arriva. Si controlla il morsetto dove entra il marrone, poi si risale verso il quadro.",
      },
      {
        id: "neutro-linea", label: "Il neutro della linea non arriva alla presa esistente", where: "sulla presa esistente, dove arriva il blu della linea", msg: "La presa dietro la TV non dà più corrente.", symptom: "presa-morta",
        open: [["S.N", "PA.B"]], requires: ["presa-morta"], minMeasures: 2,
        proof: "Anche sulla presa esistente la fase c'è (230 V verso terra), ma tra i due laterali leggi 0 V: il neutro della linea non arriva. Si controlla il morsetto dove entra il blu, poi si risale verso il quadro.",
      },
    ],
    hints: [
      "Sulla presa nuova misura tra ciascun morsetto laterale e la terra, poi tra i due laterali.",
      "Poi risali: misura anche la presa esistente. Il guasto sta tra l'ultimo punto che va e il primo che non va.",
    ],
    stars: STARS,
    quiz: [
      { q: "Presa senza corrente: tra un morsetto laterale e la terra leggi 230 V, tra i due laterali 0 V. Manca…", o: ["La fase", "Il neutro", "La terra"], ok: 1, why: "La fase c'è (230 V verso terra), ma non trova il neutro per chiudere il giro." },
      { q: "Due prese in derivazione: la prima va, la seconda no. Dove cerchi?", o: ["Nel quadro", "Tra la prima e la seconda presa", "Nella presa che va"], ok: 1, why: "Il guasto è tra l'ultimo punto che va e il primo che non va." },
      { q: "Per sapere se un filo è interrotto, a linea spenta, misuri…", o: ["La tensione ai suoi capi", "La continuità tra i suoi capi", "La corrente"], ok: 1, why: "A linea spenta la tensione è sempre zero: serve la continuità." },
      { q: "Prima di misurare una presa morta…", o: ["Stacchi quello che c'è attaccato", "Lasci attaccata la TV, così vedi quando torna", "Togli il frutto dalla scatola"], ok: 0, why: "Ti servono i fori. E un apparecchio attaccato porta la fase sul neutro interrotto: la misura inganna." },
    ],
  },
  /* ---------- 2.5 ---------- */
  {
    id: "g5", n: 14, cap: 2, part: "Banco guasti", type: "guasto",
    title: "Il corridoio, di nuovo", short: "La deviata non va come dovrebbe",
    note: "È la deviata dell'intervento 6. Neutro e terra vanno dalla scatola alla plafoniera: la terra da usare è quella della plafoniera.",
    client: { who: "Famiglia Conti", where: "corridoio", msg: "La luce del corridoio fa i capricci: a volte si accende, a volte no." },
    learn: ["Una deviata che funziona solo a volte", "Leggere le posizioni dei comandi prima di misurare"],
    cards: ["scambi2"],
    board: board(corridoio, b => {
      zone(b, "z2").label = "fondo corridoio";
      Object.assign(comp(b, "D1"), { name: "deviatore all'inizio del corridoio", short: "dev. inizio" });
      Object.assign(comp(b, "D2"), { name: "deviatore in fondo al corridoio", short: "dev. fondo" });
    }),
    goal: corridoio.goal, wiring: corridoio.solution, line: "Luci C10",
    faults: [
      {
        id: "scambio-nero", label: "Lo scambio nero tra i due deviatori è interrotto", where: "sul nero tra i morsetti 1 dei due deviatori", msg: "La luce del corridoio fa i capricci: a volte si accende, a volte no.", symptom: "parziale",
        open: [["D1.1", "D2.1"]], requires: ["scambio-interrotto"], minMeasures: 1,
        proof: "La luce va solo con tutti e due i deviatori su 2. Con tutti e due su 1, il morsetto 1 del deviatore all'inizio ha 230 V verso terra e il morsetto 1 di quello in fondo no: il collegamento in mezzo è interrotto, nel nero o in uno dei suoi due morsetti.",
      },
      {
        id: "scambio-grigio", label: "Lo scambio grigio tra i due deviatori è interrotto", where: "sul grigio tra i morsetti 2 dei due deviatori", msg: "La luce del corridoio fa i capricci: a volte si accende, a volte no.", symptom: "parziale",
        open: [["D1.2", "D2.2"]], requires: ["scambio-interrotto"], minMeasures: 1,
        proof: "La luce va solo con tutti e due i deviatori su 1. Con tutti e due su 2, il morsetto 2 del deviatore all'inizio ha 230 V verso terra e il morsetto 2 di quello in fondo no: il collegamento in mezzo è interrotto, nel grigio o in uno dei suoi due morsetti.",
      },
      {
        id: "fase-uscita", label: "Al deviatore all'inizio la fase entra nel morsetto 1, non nel comune", where: "sul deviatore all'inizio del corridoio: marrone e nero vanno scambiati", msg: "La luce del corridoio fa i capricci: a volte si accende, a volte no.", symptom: "parziale",
        rewire: [
          { from: ["W1.s2", "D1.C"], to: ["W1.s2", "D1.1"] },
          { from: ["D1.1", "D2.1"], to: ["D1.C", "D2.1"] },
        ],
        requires: ["deviatore"], minMeasures: 1,
        proof: "Al deviatore all'inizio del corridoio il marrone arriva al morsetto 1 e il nero al comune C: la fase alimenta un solo scambio e la luce va in una posizione su quattro. Si vede guardando i morsetti. Misurando, con tutti e due i deviatori su 2, già all'inizio dello scambio grigio leggi 0 V.",
      },
      {
        id: "ritorno", label: "Il ritorno tra il deviatore in fondo e la plafoniera è interrotto", where: "sul nero tra il comune del deviatore in fondo e la plafoniera", msg: "La luce del corridoio non si accende più, da nessuna delle due parti.", symptom: "spenta",
        open: [["D2.C", "LP.L"]], minMeasures: 1,
        proof: "In ogni posizione la luce resta spenta. Quando la fase arriva al comune del deviatore in fondo (230 V verso terra), al morsetto L della plafoniera non arriva: il ritorno in mezzo è interrotto, nel filo o in uno dei suoi due morsetti.",
      },
    ],
    hints: [
      "Prima prova tutte e quattro le posizioni dei deviatori e annota quando la luce si accende.",
      "Poi metti i deviatori nella posizione in cui la fase dovrebbe passare dallo scambio sospetto, e misura verso terra i suoi due capi (la terra è sulla plafoniera).",
    ],
    stars: STARS,
    quiz: [
      { q: "Deviata: la luce si accende solo in una posizione su quattro. Cosa sospetti per primo?", o: ["La lampadina", "Uno scambio interrotto, o un deviatore collegato male", "Il neutro"], ok: 1, why: "Lampadina e neutro spegnerebbero tutto. Se va solo a volte, manca uno dei percorsi tra i deviatori." },
      { q: "Prima di misurare una deviata che fa i capricci…", o: ["Provi una posizione sola", "Provi tutte e quattro le posizioni e le annoti", "Cambi la lampadina"], ok: 1, why: "Quali posizioni funzionano ti dice già quale percorso è guasto." },
      { q: "Il marrone arriva a un morsetto di scambio del primo deviatore invece che al comune. Cosa succede?", o: ["Funziona normalmente", "La luce va solo in alcune posizioni", "Salta il differenziale"], ok: 1, why: "La fase deve entrare nel comune: da un morsetto di scambio alimenta un solo percorso." },
    ],
  },
  /* ---------- 2.6 ---------- */
  {
    id: "g6", n: 15, cap: 2, part: "Banco guasti", type: "guasto",
    title: "Banco libero: la camera", short: "Un guasto a caso sulla luce da tre punti",
    note: "È la camera dell'intervento 7: due deviatori e un invertitore. Il deviatore di Sara è montato capovolto, con i morsetti in alto: cambia solo il disegno. La terra da usare è quella della plafoniera. Il gioco sceglie un guasto a caso: rigiocando ne trovi un altro.",
    client: { who: "Luca e Sara", where: "camera da letto", msg: "La luce della camera non risponde sempre: da qualche punto a volte non si accende." },
    learn: ["Banco libero: un guasto a caso su una luce da tre punti", "Guardare, provare i comandi, poi misurare"],
    cards: ["banco"],
    board: board(camera, b => {
      zone(b, "zi").label = "comodino di Luca";
      zone(b, "z2").label = "comodino di Sara";
      Object.assign(comp(b, "D1"), { name: "deviatore della porta", short: "dev. porta" });
      Object.assign(comp(b, "D2"), { name: "deviatore di Sara", short: "dev. Sara" });
    }),
    goal: camera.goal, wiring: camera.solution, line: "Luci C10",
    faults: [
      {
        id: "coppie", label: "L'invertitore è collegato con le coppie sbagliate", where: "sui morsetti dell'invertitore", msg: "La luce della camera non risponde sempre: da qualche punto a volte non si accende.", symptom: "parziale",
        rewire: [
          { from: ["D1.2", "INV.2"], to: ["D1.2", "INV.3"] },
          { from: ["INV.3", "D2.1"], to: ["INV.2", "D2.1"] },
        ],
        requires: ["invertitore-coppie"], minMeasures: 1,
        proof: "I fili del deviatore della porta entrano nei morsetti 1 e 3 dell'invertitore invece che nella coppia 1-2, e quelli del deviatore di Sara in 2 e 4: con l'invertitore dritto la luce non si accende mai. Si vede guardando i morsetti, e lo conferma il tester: a linea spenta, il filo dal morsetto 2 della porta non suona con il morsetto 2 dell'invertitore, ma con il 3.",
      },
      {
        id: "scambio-inv-d2", label: "Uno scambio tra l'invertitore e il deviatore di Sara è interrotto", where: "sul nero tra il morsetto 3 dell'invertitore e il deviatore di Sara", msg: "La luce della camera non risponde sempre: da qualche punto a volte non si accende.", symptom: "parziale",
        open: [["INV.3", "D2.1"]], requires: ["scambio-interrotto"], minMeasures: 2,
        proof: "In una posizione in cui la fase arriva al morsetto 3 dell'invertitore (230 V verso terra), al morsetto 1 del deviatore di Sara non arriva: il collegamento tra i due è interrotto, nel nero o in uno dei suoi due morsetti.",
      },
      {
        id: "scambio-d1-inv", label: "Uno scambio tra il deviatore della porta e l'invertitore è interrotto", where: "sul grigio tra il morsetto 2 del deviatore della porta e l'invertitore", msg: "La luce della camera non risponde sempre: da qualche punto a volte non si accende.", symptom: "parziale",
        open: [["D1.2", "INV.2"]], requires: ["scambio-interrotto"], minMeasures: 2,
        proof: "Con il deviatore della porta su 2, il suo morsetto 2 ha 230 V verso terra e il morsetto 2 dell'invertitore no: il collegamento tra i due è interrotto, nel grigio o in uno dei suoi due morsetti.",
      },
      {
        id: "lampadina", label: "La lampadina della plafoniera è bruciata", where: "nella plafoniera", msg: "La luce della camera non si accende più, da nessun punto.", symptom: "spenta",
        broken: ["LP"], requires: ["lampada-guasta"], minMeasures: 1,
        proof: "In una posizione in cui la fase arriva fino alla plafoniera, tra L e N ci sono 230 V e la luce resta spenta: la tensione c'è, è la lampada a non accendersi. A linea spenta lo confermi: tra L e N la lampadina bruciata dà OL.",
      },
      {
        id: "ritorno", label: "Il ritorno tra il deviatore di Sara e la plafoniera è interrotto", where: "sul nero tra il comune del deviatore di Sara e la plafoniera", msg: "La luce della camera non si accende più, da nessun punto.", symptom: "spenta",
        open: [["D2.C", "LP.L"]], minMeasures: 2,
        proof: "Quando il comune del deviatore di Sara ha 230 V verso terra, il morsetto L della plafoniera resta a 0: il ritorno in mezzo è interrotto, nel filo o in uno dei suoi due morsetti.",
      },
    ],
    hints: [
      "Guarda i collegamenti dell'invertitore: i fili di un deviatore nella coppia 1-2, quelli dell'altro nella 3-4.",
      "Prova le 8 combinazioni e guarda quale comando sta fermo nelle posizioni in cui la luce va. Poi misura verso la terra della plafoniera, in una posizione in cui dovrebbe accendersi.",
    ],
    stars: STARS,
    quiz: [
      { q: "Luce da tre punti: quante combinazioni provi?", o: ["3", "6", "8"], ok: 2, why: "2 × 2 × 2 = 8." },
      { q: "Prima di misurare, cosa guardi?", o: ["Niente, si misura e basta", "I colori e i morsetti: un filo fuori posto a volte si vede", "Solo il quadro"], ok: 1, why: "Un collegamento sbagliato si vede: le coppie dell'invertitore, il comune dei deviatori." },
      { q: "Hai trovato il guasto. Prima di ripararlo…", o: ["Stacchi la linea al quadro, segnali e verifichi", "Lavori con attenzione sotto tensione", "Spegni il comando a muro"], ok: 0, why: "Le misure di tensione si fanno con la linea accesa; le mani sui fili, mai." },
    ],
  },
];
