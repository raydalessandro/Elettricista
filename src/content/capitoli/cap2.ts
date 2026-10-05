/* ====== CAPITOLO 2 · BANCO GUASTI ======
   L'impianto c'è ed è collegato. Qualcosa non va: lo trovi col tester, con metodo.
   Ogni livello ha più guasti possibili: il gioco ne sceglie uno, rigiocando ne trovi un altro.
   Gli impianti sono quelli del capitolo 1: li conosci, li hai fatti tu. */
import type { Card, FiliLevel, GuastoLevel } from "../../core/types";
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
const board = (l: FiliLevel) => structuredClone(l.board);

export const CARDS_CAP2: Record<string, Card> = {
  tester2: {
    t: "Il tester: tensione e continuità",
    teaches: ["tester-misure", "continuita"],
    p: [
      "Il tester misura **tra due punti**: un puntale su un morsetto, l'altro su un altro. Non misura «un filo»: misura la differenza tra due punti.",
      "**Tensione** (V~), con la linea accesa. Tra fase e neutro, o tra fase e terra, leggi **230 V**. Tra due punti dello stesso filo, o tra neutro e terra, leggi **0 V**. Se un punto non è collegato a niente, leggi 0 V anche lì.",
      "**Continuità** (Ω), con la linea spenta. Il tester manda una piccola corrente sua: se i due punti sono lo stesso filo **suona** (0 Ω). Se in mezzo c'è una lampadina leggi qualche decina di ohm. Se non c'è collegamento leggi **OL**: aperto.",
      "La continuità si misura solo a linea spenta: sotto tensione la misura non vale, e lo strumento si può rompere.",
    ],
    g: [
      ["multimetro", "tester"],
      ["prova di continuità", "il cicalino, il beep"],
      ["circuito aperto (OL)", "non passa"],
    ],
    capo: "Prima di fidarti di una misura, prova il tester su una presa che sai viva.",
  },
  metodo2: {
    t: "Il metodo: dal sintomo al punto",
    teaches: ["metodo-guasti", "lampada-guasta"],
    ol: [
      "**Ascolta il sintomo**: cosa non va, e in quali posizioni dei comandi.",
      "**Guarda**: colori, morsetti, un filo fuori posto a volte si vede.",
      "**Parti dalla lampada**: con il comando acceso, tra L e N ci sono 230 V?",
      "Se sì, è la lampada. Se no, **torna indietro** verso la scatola, un punto alla volta, misurando verso la terra.",
      "Quando trovi 230 V a un capo di un collegamento e 0 V all'altro, **il guasto è lì in mezzo**.",
      "Prima di riparare: **stacca la linea**, segnala, verifica.",
    ],
    p: ["Ogni misura deve rispondere a una domanda. Dieci misure a caso dicono meno di tre fatte con il metodo."],
    g: [["ricerca guasti", "trovare il guasto"]],
    capo: "Scrivi quello che misuri: a metà ricerca non ti ricordi più cosa avevi visto. Il registro qui sotto lo fa per te.",
  },
  neutrointerrotto: {
    t: "Neutro interrotto: 230 V dove non te li aspetti",
    teaches: ["neutro-interrotto"],
    p: [
      "Se il neutro si interrompe tra la lampada e la scatola, la lampada resta spenta. Ma il suo morsetto N non è a 0 V: attraverso il filamento è collegato alla fase.",
      "Con l'interruttore acceso misuri **230 V tra il morsetto N della lampada e la terra**, come se fosse una fase. Chi tocca quel neutro prende la scossa.",
      "Per trovare dove si interrompe, misura il neutro anche nella scatola: dove c'è ancora tensione sei dalla parte della lampada, dove leggi 0 V sei dalla parte del quadro. L'interruzione sta in mezzo.",
    ],
    g: [["neutro interrotto", "neutro aperto, neutro saltato"]],
    capo: "Neutro staccato, lampada spenta e morsetto N in tensione: le mani sui fili solo dopo aver staccato al quadro.",
  },
  interruttoreneutro: {
    t: "L'interruttore sul neutro",
    teaches: ["interruttore-neutro"],
    p: [
      "Se qualcuno ha messo l'interruttore sul neutro, la luce funziona: si accende e si spegne. Per questo nessuno se ne accorge.",
      "Ma a luce spenta la lampada resta collegata alla fase. Con l'interruttore spento misuri **230 V tra L della lampada e la terra**: chi cambia la lampadina «a luce spenta» può prendere la scossa.",
      "Spesso si vede anche guardando: all'interruttore arriva il blu.",
    ],
    capo: "La prova si fa a luce spenta. A luce accesa un interruttore sul neutro e uno sulla fase sembrano uguali.",
  },
  polarita: {
    t: "Fase e neutro al posto giusto, anche sulla lampada",
    teaches: ["polarita-lampada"],
    p: [
      "Sulla plafoniera il ritorno va al morsetto **L** e il neutro al morsetto **N**. Nel portalampada il morsetto L va al contatto centrale, quello che si tocca meno.",
      "Se li inverti la lampada si accende lo stesso. Ma a luce accesa la parte più esposta del portalampada è in tensione.",
      "Con l'interruttore acceso, tra L e terra devi leggere 230 V e tra N e terra 0 V. Se è al contrario, sono invertiti.",
    ],
    g: [["polarità", "fase e neutro al posto giusto"]],
  },
  terramancante: {
    t: "La terra che manca",
    teaches: ["terra-mancante"],
    p: [
      "Un apparecchio senza terra funziona lo stesso: tra fase e neutro ci sono 230 V e la lampada si accende.",
      "Ma tra fase e terra leggi **0 V** invece di 230: la terra non arriva. Se l'apparecchio di metallo ha un guasto verso la carcassa, il differenziale non lo vede finché qualcuno non la tocca.",
      "A linea spenta lo confermi con la continuità tra il morsetto di terra dell'apparecchio e quello della scatola: deve suonare.",
    ],
    capo: "La terra non si vede funzionare: si misura.",
  },
  presamorta: {
    t: "Presa morta: manca la fase o il neutro?",
    teaches: ["presa-morta"],
    p: [
      "Su una presa che non dà corrente, misura tra i due morsetti laterali e poi tra ciascuno e la terra.",
      "Se tra un morsetto e la terra trovi 230 V, la fase c'è. Se però tra i due laterali leggi 0 V, **manca il neutro**. Se non trovi 230 V da nessuna parte, **manca la fase**.",
      "Poi risali verso la presa da cui questa prende la linea: il guasto sta tra l'ultimo punto che va e il primo che non va.",
    ],
  },
  scambi2: {
    t: "Funziona solo a volte: gli scambi",
    teaches: ["scambio-interrotto"],
    p: [
      "In una deviata la luce si accende quando i due deviatori scelgono lo stesso filo di scambio. Se uno scambio è interrotto, resta buono solo l'altro: la luce si accende in **una sola posizione su quattro**.",
      "Prova tutte le posizioni e annota quando la luce va. Già questo ti dice su quale percorso cercare.",
      "Poi misura, nella posizione in cui la luce non va: all'inizio dello scambio trovi 230 V verso terra, alla fine 0 V. Il guasto è in mezzo.",
    ],
    capo: "Un comando che va «a volte» non è magia: è un percorso che manca.",
  },
  banco: {
    t: "Il banco libero",
    teaches: ["banco-libero"],
    p: [
      "Da qui il guasto lo sceglie il gioco, a caso, tra quelli possibili su quell'impianto: lampadina, scambi, ritorno, coppie dell'invertitore.",
      "L'ordine è sempre lo stesso: ascolta il sintomo, guarda i collegamenti, prova tutte le posizioni dei comandi, poi misura seguendo la fase dalla scatola alla lampada.",
      "Con tre punti le combinazioni sono otto: un guasto può nascondersi in due sole.",
    ],
    capo: "Il cliente ti racconta cosa vede. Le misure ti dicono dove guardare.",
  },
};

const STARS = ["Sicurezza", "Metodo", "Diagnosi"];

const MSG_SPENTA = "La luce non si accende più. Ieri andava.";

export const CAP2: GuastoLevel[] = [
  /* ---------- 2.1 ---------- */
  {
    id: "g1", n: 10, cap: 2, part: "Banco guasti", type: "guasto",
    title: "Non si accende", short: "Trova perché la plafoniera resta spenta",
    note: "È il ripostiglio dell'intervento 4: l'impianto è collegato come l'avevi lasciato. Qualcosa, però, non va.",
    client: { who: "Sig. Galli", where: "ripostiglio", msg: MSG_SPENTA },
    learn: ["Il tester: tensione con la linea accesa, continuità con la linea spenta", "Il metodo: dal sintomo al punto, una misura alla volta", "Lampada, interruttore o filo: come si distinguono"],
    cards: ["tester2", "metodo2"],
    board: board(ripostiglio), goal: ripostiglio.goal, wiring: ripostiglio.solution, line: "Luci C10",
    faults: [
      {
        id: "lampadina", label: "La lampadina della plafoniera è bruciata", where: "nella plafoniera", msg: MSG_SPENTA, symptom: "spenta",
        broken: ["LP"], requires: ["lampada-guasta"], minMeasures: 1,
        proof: "Con l'interruttore acceso, tra L e N della plafoniera ci sono 230 V: la tensione arriva fino alla lampada, quindi è lei a non accendersi.",
      },
      {
        id: "ritorno", label: "Il ritorno tra interruttore e plafoniera non fa contatto", where: "sul filo nero tra interruttore e plafoniera", msg: MSG_SPENTA, symptom: "spenta",
        open: [["I.2", "LP.L"]], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto 2 dell'interruttore ha 230 V verso terra, il morsetto L della plafoniera no: il filo nero in mezzo è interrotto.",
      },
      {
        id: "fase", label: "La fase non arriva all'interruttore", where: "sul filo marrone tra scatola e interruttore", msg: MSG_SPENTA, symptom: "spenta",
        open: [["W1.s2", "I.1"]], minMeasures: 2,
        proof: "Nella scatola il morsetto della fase ha 230 V verso terra, il morsetto 1 dell'interruttore no: il filo marrone in mezzo è interrotto.",
      },
      {
        id: "interruttore", label: "L'interruttore non chiude", where: "dentro l'interruttore", msg: MSG_SPENTA, symptom: "spenta",
        broken: ["I"], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto 1 ha 230 V verso terra e il morsetto 2 no: il contatto dentro non chiude.",
      },
    ],
    hints: [
      "Parti dalla plafoniera: accendi l'interruttore e misura tra L e N.",
      "Se alla plafoniera non arriva niente, torna indietro: con l'interruttore acceso misura i morsetti dell'interruttore verso la terra, uno alla volta.",
    ],
    stars: STARS,
    quiz: [
      { q: "Con il tester in tensione, tra due punti dello stesso filo leggi…", o: ["230 V", "0 V", "Dipende dal colore"], ok: 1, why: "Il tester misura una differenza: due punti dello stesso filo stanno allo stesso potenziale." },
      { q: "La continuità si misura…", o: ["Con la linea accesa, così si vede se passa corrente", "Con la linea spenta", "Solo sui fili di terra"], ok: 1, why: "In continuità il tester manda una corrente sua: sotto tensione la misura non vale e lo strumento si può rompere." },
      { q: "La luce non si accende. Con l'interruttore acceso, tra L e N della lampada misuri 230 V. Il guasto è…", o: ["Nella lampada", "Nell'interruttore", "Nel neutro"], ok: 0, why: "La tensione arriva fino alla lampada: è lei che non lavora." },
    ],
  },
  /* ---------- 2.2 ---------- */
  {
    id: "g2", n: 11, cap: 2, part: "Banco guasti", type: "guasto",
    title: "Il neutro che punge", short: "La luce è spenta, ma il neutro dà tensione",
    note: "Stesso schema del ripostiglio: linea in scatola, interruttore alla porta, plafoniera al soffitto.",
    client: { who: "Sig.ra Bassi", where: "lavanderia", msg: "La luce della lavanderia non si accende più." },
    learn: ["Perché un neutro interrotto dà 230 V", "Trovare dove si interrompe il neutro"],
    cards: ["neutrointerrotto"],
    board: board(ripostiglio), goal: ripostiglio.goal, wiring: ripostiglio.solution, line: "Luci C10",
    faults: [
      {
        id: "neutro-scatola", label: "Il neutro della linea non fa contatto nel morsetto della scatola", where: "nella scatola, dove arriva il blu della linea", msg: "La luce della lavanderia non si accende più.", symptom: "spenta",
        open: [["cB.x", "W2.s1"]], requires: ["neutro-interrotto"], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto N della plafoniera ha 230 V verso terra, e anche il morsetto del neutro nella scatola: l'interruzione è prima, dove il blu della linea entra nel morsetto.",
      },
      {
        id: "neutro-plafoniera", label: "Il neutro tra scatola e plafoniera è interrotto", where: "sul filo blu tra scatola e plafoniera", msg: "La luce della lavanderia non si accende più.", symptom: "spenta",
        open: [["W2.s2", "LP.N"]], requires: ["neutro-interrotto"], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto N della plafoniera ha 230 V verso terra, il morsetto del neutro nella scatola 0 V: il filo blu in mezzo è interrotto.",
      },
      {
        id: "lampadina", label: "La lampadina della plafoniera è bruciata", where: "nella plafoniera", msg: "La luce della lavanderia non si accende più.", symptom: "spenta",
        broken: ["LP"], requires: ["lampada-guasta"], minMeasures: 1,
        proof: "Con l'interruttore acceso, tra L e N della plafoniera ci sono 230 V: la tensione arriva, è la lampada a non accendersi.",
      },
      {
        id: "ritorno", label: "Il ritorno tra interruttore e plafoniera non fa contatto", where: "sul filo nero tra interruttore e plafoniera", msg: "La luce della lavanderia non si accende più.", symptom: "spenta",
        open: [["I.2", "LP.L"]], minMeasures: 2,
        proof: "Con l'interruttore acceso il morsetto 2 dell'interruttore ha 230 V verso terra, il morsetto L della plafoniera no: il filo nero in mezzo è interrotto.",
      },
    ],
    hints: [
      "Accendi l'interruttore e misura tra il morsetto N della plafoniera e la terra. Cosa ti aspetteresti?",
      "Se sul neutro trovi tensione, cerca dove si interrompe: misura anche il morsetto del neutro nella scatola.",
    ],
    stars: STARS,
    quiz: [
      { q: "Neutro interrotto tra lampada e scatola, interruttore acceso. Tra il morsetto N della lampada e la terra misuri…", o: ["0 V: è il neutro", "230 V: la fase arriva attraverso il filamento", "115 V"], ok: 1, why: "La lampada collega il suo morsetto N alla fase. Senza neutro, quel morsetto è in tensione." },
      { q: "Il cercafase si accende sul filo blu. Cosa pensi?", o: ["Il cercafase è rotto", "Il neutro potrebbe essere interrotto: misuro prima di toccare", "Va bene così: il blu è sempre in tensione"], ok: 1, why: "Un neutro sano sta a 0 V. Se è in tensione, da qualche parte si è interrotto." },
      { q: "A un capo di un filo misuri tensione verso terra, all'altro capo no. Il guasto è…", o: ["In mezzo, su quel filo", "Nel quadro", "Nella lampadina"], ok: 0, why: "Tensione da una parte e niente dall'altra: il collegamento in mezzo è interrotto." },
    ],
  },
  /* ---------- 2.3 ---------- */
  {
    id: "g3", n: 12, cap: 2, part: "Banco guasti", type: "guasto",
    title: "La cantina da comprare", short: "Verifica un impianto che funziona",
    note: "Schema classico: linea in scatola, interruttore alla porta, plafoniera al soffitto. L'ha collegato il vecchio proprietario.",
    client: { who: "Paolo", where: "cantina", msg: "Sto comprando questa casa. Il proprietario ha rifatto da solo la luce della cantina: si accende e si spegne. Prima del rogito mi dai un'occhiata?" },
    learn: ["Verificare un impianto che funziona", "L'interruttore sul neutro", "Fase e neutro al posto giusto, e la terra che manca"],
    cards: ["interruttoreneutro", "polarita", "terramancante"],
    board: board(ripostiglio), goal: ripostiglio.goal, wiring: ripostiglio.solution, line: "Luci C10",
    faults: [
      {
        id: "int-neutro", label: "L'interruttore è sul neutro", where: "tra scatola, interruttore e plafoniera", symptom: "funziona",
        msg: "Sto comprando questa casa. Il proprietario ha rifatto da solo la luce della cantina: si accende e si spegne. Prima del rogito mi dai un'occhiata?",
        rewire: [
          { from: ["W1.s2", "I.1"], to: ["W1.s2", "LP.L"] },
          { from: ["I.2", "LP.L"], to: ["I.2", "LP.N"] },
          { from: ["W2.s2", "LP.N"], to: ["W2.s2", "I.1"] },
        ],
        requires: ["interruttore-neutro"], minMeasures: 1,
        proof: "Con l'interruttore spento, tra L della plafoniera e la terra ci sono 230 V: la lampada resta in tensione anche a luce spenta. E all'interruttore arriva il blu.",
      },
      {
        id: "polarita", label: "Fase e neutro sono invertiti sulla plafoniera", where: "sui morsetti L e N della plafoniera", symptom: "funziona",
        msg: "Sto comprando questa casa. Il proprietario ha rifatto da solo la luce della cantina: si accende e si spegne. Prima del rogito mi dai un'occhiata?",
        rewire: [
          { from: ["I.2", "LP.L"], to: ["I.2", "LP.N"] },
          { from: ["W2.s2", "LP.N"], to: ["W2.s2", "LP.L"] },
        ],
        requires: ["polarita-lampada"], minMeasures: 1,
        proof: "Con l'interruttore acceso il morsetto L della plafoniera ha 0 V verso terra e il morsetto N ne ha 230: ritorno e neutro sono scambiati. Si vede anche dai colori: il nero arriva su N, il blu su L.",
      },
      {
        id: "terra", label: "La terra non arriva alla plafoniera", where: "sul giallo-verde tra scatola e plafoniera", symptom: "funziona",
        msg: "Sto comprando questa casa. Il proprietario ha rifatto da solo la luce della cantina: si accende e si spegne. Prima del rogito mi dai un'occhiata?",
        open: [["W3.s2", "LP.PE"]], requires: ["terra-mancante"], minMeasures: 1,
        proof: "Con l'interruttore acceso, tra L e N della plafoniera ci sono 230 V, ma tra L e terra 0 V: il giallo-verde non fa contatto. A linea spenta, tra la terra della scatola e quella della plafoniera non c'è continuità.",
      },
    ],
    hints: [
      "Prova a luce spenta: misura tra L della plafoniera e la terra.",
      "Poi a luce accesa: misura L–N, L–terra e N–terra sulla plafoniera. E guarda i colori che arrivano all'interruttore.",
    ],
    stars: STARS,
    quiz: [
      { q: "La luce si accende e si spegne. Basta per dire che l'impianto è a posto?", o: ["Sì, funziona", "No: va verificato con il tester, anche a luce spenta", "Sì, se i fili sono nuovi"], ok: 1, why: "Interruttore sul neutro, fase e neutro invertiti, terra staccata: la luce funziona lo stesso, ed è proprio per questo che si misura." },
      { q: "Con l'interruttore spento misuri 230 V tra L della lampada e la terra. Perché?", o: ["È normale", "L'interruttore è sul neutro", "Manca la terra"], ok: 1, why: "Se l'interruttore interrompe il neutro, la fase arriva sempre alla lampada." },
      { q: "Sulla plafoniera: tra fase e neutro 230 V, tra fase e terra 0 V. Cosa manca?", o: ["Il neutro", "La terra", "Niente, è normale"], ok: 1, why: "Tra fase e terra devono esserci 230 V. Se ne leggi 0, il giallo-verde non arriva." },
    ],
  },
  /* ---------- 2.4 ---------- */
  {
    id: "g4", n: 13, cap: 2, part: "Banco guasti", type: "guasto",
    title: "La presa morta", short: "La presa dietro la TV non dà corrente",
    note: "È la presa per la TV dell'intervento 5: la presa nuova prende la linea da quella esistente.",
    client: { who: "Marta", where: "soggiorno", msg: "La presa dietro la TV non dà più corrente." },
    learn: ["Presa morta: manca la fase o il neutro?", "Il guasto sta tra l'ultimo punto che va e il primo che non va"],
    cards: ["presamorta"],
    board: board(presaTV), goal: presaTV.goal, wiring: presaTV.solution, line: "Prese camere C16",
    faults: [
      {
        id: "fase-derivazione", label: "La fase tra le due prese è interrotta", where: "sul marrone tra presa esistente e presa nuova", msg: "La presa dietro la TV non dà più corrente.", symptom: "presa-morta",
        open: [["PA.A", "PB.A"]], requires: ["presa-morta"], minMeasures: 2,
        proof: "Sulla presa nuova non c'è tensione da nessuna parte, mentre sulla presa esistente tra fase e terra ci sono 230 V: il marrone tra le due prese è interrotto.",
      },
      {
        id: "neutro-derivazione", label: "Il neutro tra le due prese è interrotto", where: "sul blu tra presa esistente e presa nuova", msg: "La presa dietro la TV non dà più corrente.", symptom: "presa-morta",
        open: [["PA.B", "PB.B"]], requires: ["presa-morta"], minMeasures: 2,
        proof: "Sulla presa nuova tra fase e terra ci sono 230 V, ma tra i due laterali 0 V: manca il neutro. Sulla presa esistente il neutro c'è: il blu tra le due prese è interrotto.",
      },
      {
        id: "neutro-linea", label: "Il neutro della linea non fa contatto sulla presa esistente", where: "sul morsetto della presa esistente dove arriva il blu della linea", msg: "La presa dietro la TV non dà più corrente.", symptom: "presa-morta",
        open: [["S.N", "PA.B"]], requires: ["presa-morta"], minMeasures: 2,
        proof: "Neanche la presa esistente ha 230 V tra i due laterali, anche se la fase c'è: il neutro manca già lì, dove arriva il blu della linea.",
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
    ],
  },
  /* ---------- 2.5 ---------- */
  {
    id: "g5", n: 14, cap: 2, part: "Banco guasti", type: "guasto",
    title: "Funziona solo a volte", short: "La deviata del corridoio fa i capricci",
    note: "È la deviata dell'intervento 6. Neutro e terra vanno dalla scatola alla plafoniera.",
    client: { who: "Famiglia Conti", where: "corridoio", msg: "La luce del corridoio fa i capricci: a volte si accende, a volte no." },
    learn: ["Una deviata che funziona solo a volte", "Leggere le posizioni dei comandi prima di misurare"],
    cards: ["scambi2"],
    board: board(corridoio), goal: corridoio.goal, wiring: corridoio.solution, line: "Luci C10",
    faults: [
      {
        id: "scambio-nero", label: "Lo scambio nero tra i deviatori è interrotto", where: "sul nero tra le uscite 1 dei deviatori", msg: "La luce del corridoio fa i capricci: a volte si accende, a volte no.", symptom: "parziale",
        open: [["D1.1", "D2.1"]], requires: ["scambio-interrotto"], minMeasures: 1,
        proof: "La luce va solo con tutti e due i deviatori su 2. Con il primo su 1, l'uscita 1 del primo ha 230 V verso terra e l'uscita 1 del secondo no: il nero in mezzo è interrotto.",
      },
      {
        id: "scambio-grigio", label: "Lo scambio grigio tra i deviatori è interrotto", where: "sul grigio tra le uscite 2 dei deviatori", msg: "La luce del corridoio fa i capricci: a volte si accende, a volte no.", symptom: "parziale",
        open: [["D1.2", "D2.2"]], requires: ["scambio-interrotto"], minMeasures: 1,
        proof: "La luce va solo con tutti e due i deviatori su 1. Con il primo su 2, l'uscita 2 del primo ha 230 V verso terra e l'uscita 2 del secondo no: il grigio in mezzo è interrotto.",
      },
      {
        id: "fase-uscita", label: "La fase entra in un'uscita del primo deviatore, non nel comune", where: "sul primo deviatore", msg: "La luce del corridoio fa i capricci: a volte si accende, a volte no.", symptom: "parziale",
        rewire: [
          { from: ["W1.s2", "D1.C"], to: ["W1.s2", "D1.1"] },
          { from: ["D1.1", "D2.1"], to: ["D1.C", "D2.1"] },
        ],
        requires: ["deviatore"], minMeasures: 1,
        proof: "Il marrone arriva all'uscita 1 del primo deviatore invece che al comune C: la fase alimenta un solo percorso, e la luce va in una posizione su quattro. Si vede guardando i morsetti.",
      },
      {
        id: "ritorno", label: "Il ritorno tra secondo deviatore e plafoniera è interrotto", where: "sul nero tra il comune del secondo deviatore e la plafoniera", msg: "La luce del corridoio non si accende più, da nessuna delle due parti.", symptom: "spenta",
        open: [["D2.C", "LP.L"]], minMeasures: 1,
        proof: "In ogni posizione la luce resta spenta. Quando la fase arriva al comune del secondo deviatore (230 V verso terra), al morsetto L della plafoniera non arriva: il ritorno in mezzo è interrotto.",
      },
    ],
    hints: [
      "Prima prova tutte e quattro le posizioni dei deviatori e annota quando la luce si accende.",
      "Poi misura nella posizione in cui la luce non va: dove trovi 230 V da una parte di un filo e 0 V dall'altra, lì c'è il guasto.",
    ],
    stars: STARS,
    quiz: [
      { q: "Deviata: la luce si accende solo in una posizione su quattro. Cosa sospetti per primo?", o: ["La lampadina", "Uno scambio interrotto, o un deviatore collegato male", "Il neutro"], ok: 1, why: "Lampadina e neutro spegnerebbero tutto. Se va solo a volte, manca uno dei percorsi tra i deviatori." },
      { q: "Prima di misurare una deviata che fa i capricci…", o: ["Provi una posizione sola", "Provi tutte e quattro le posizioni e le annoti", "Cambi la lampadina"], ok: 1, why: "Quali posizioni funzionano ti dice già quale percorso è guasto." },
      { q: "Il marrone arriva a un'uscita del primo deviatore invece che al comune. Cosa succede?", o: ["Funziona normalmente", "La luce va solo in alcune posizioni", "Salta il differenziale"], ok: 1, why: "La fase deve entrare nel comune: da un'uscita alimenta un solo percorso." },
    ],
  },
  /* ---------- 2.6 ---------- */
  {
    id: "g6", n: 15, cap: 2, part: "Banco guasti", type: "guasto",
    title: "Banco libero: la camera", short: "Un guasto a caso sulla luce da tre punti",
    note: "È la camera dell'intervento 7: due deviatori e un invertitore. Il gioco sceglie un guasto a caso: rigiocando ne trovi un altro.",
    client: { who: "Luca e Sara", where: "camera da letto", msg: "La luce della camera non risponde sempre: da qualche punto a volte non si accende." },
    learn: ["Banco libero: un guasto a caso su una luce da tre punti", "Guardare, provare i comandi, poi misurare"],
    cards: ["banco"],
    board: board(camera), goal: camera.goal, wiring: camera.solution, line: "Luci C10",
    faults: [
      {
        id: "coppie", label: "L'invertitore è collegato con le coppie sbagliate", where: "sui morsetti dell'invertitore", msg: "La luce della camera non risponde sempre: da qualche punto a volte non si accende.", symptom: "parziale",
        rewire: [
          { from: ["D1.2", "INV.2"], to: ["D1.2", "INV.3"] },
          { from: ["INV.3", "D2.1"], to: ["INV.2", "D2.1"] },
        ],
        requires: ["invertitore-coppie"], minMeasures: 1,
        proof: "Gli scambi del primo deviatore entrano in 1 e 3 invece che nella coppia 1-2: in metà delle posizioni dell'invertitore i due percorsi si chiudono male. Si vede guardando i morsetti.",
      },
      {
        id: "scambio-inv-d2", label: "Uno scambio tra invertitore e secondo deviatore è interrotto", where: "sul nero tra il morsetto 3 dell'invertitore e il secondo deviatore", msg: "La luce della camera non risponde sempre: da qualche punto a volte non si accende.", symptom: "parziale",
        open: [["INV.3", "D2.1"]], requires: ["scambio-interrotto"], minMeasures: 2,
        proof: "In alcune posizioni il morsetto 3 dell'invertitore ha 230 V verso terra e l'uscita 1 del secondo deviatore no: il nero tra i due è interrotto.",
      },
      {
        id: "scambio-d1-inv", label: "Uno scambio tra primo deviatore e invertitore è interrotto", where: "sul grigio tra l'uscita 2 del primo deviatore e l'invertitore", msg: "La luce della camera non risponde sempre: da qualche punto a volte non si accende.", symptom: "parziale",
        open: [["D1.2", "INV.2"]], requires: ["scambio-interrotto"], minMeasures: 2,
        proof: "Con il primo deviatore su 2, la sua uscita 2 ha 230 V verso terra e il morsetto 2 dell'invertitore no: il grigio tra i due è interrotto.",
      },
      {
        id: "lampadina", label: "La lampadina della plafoniera è bruciata", where: "nella plafoniera", msg: "La luce della camera non si accende più, da nessun punto.", symptom: "spenta",
        broken: ["LP"], requires: ["lampada-guasta"], minMeasures: 1,
        proof: "In una delle posizioni, tra L e N della plafoniera arrivano 230 V: la tensione c'è, è la lampada a non accendersi.",
      },
      {
        id: "ritorno", label: "Il ritorno tra secondo deviatore e plafoniera è interrotto", where: "sul nero tra il comune del secondo deviatore e la plafoniera", msg: "La luce della camera non si accende più, da nessun punto.", symptom: "spenta",
        open: [["D2.C", "LP.L"]], minMeasures: 2,
        proof: "Quando il comune del secondo deviatore ha 230 V verso terra, il morsetto L della plafoniera resta a 0: il ritorno in mezzo è interrotto.",
      },
    ],
    hints: [
      "Guarda i collegamenti dell'invertitore: le coppie sono 1-2 e 3-4.",
      "Prova le 8 combinazioni, poi misura dove la luce non va: segui la fase dal primo deviatore alla lampada.",
    ],
    stars: STARS,
    quiz: [
      { q: "Luce da tre punti: quante combinazioni provi?", o: ["3", "6", "8"], ok: 2, why: "2 × 2 × 2 = 8." },
      { q: "Prima di misurare, cosa guardi?", o: ["Niente, si misura e basta", "I colori e i morsetti: un filo fuori posto a volte si vede", "Solo il quadro"], ok: 1, why: "Un collegamento sbagliato si vede: le coppie dell'invertitore, il comune dei deviatori." },
      { q: "Hai trovato il guasto. Prima di ripararlo…", o: ["Stacchi la linea al quadro, segnali e verifichi", "Lavori con attenzione sotto tensione", "Spegni il comando a muro"], ok: 0, why: "Le misure di tensione si fanno con la linea accesa; le mani sui fili, mai." },
    ],
  },
];
