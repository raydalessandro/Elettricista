/* Capitolo 1 · L'occhio e le lenti
   Sei livelli: miopia, ipermetropia, presbiopia, astigmatismo, la ricetta, un sabato mattina al banco.
   Ogni livello: il cliente, poche schede da toccare, la prova lenti (al posto dell'optometrista, per capire),
   il dialogo al banco, le domande dal laboratorio. Nei livelli 1–4 la ricetta del cliente cambia a ogni partita. */
import { diop, sph } from "../core/eye";
import { minReadingAdd } from "../core/prova";
import type { Card, Level, Ricetta, Variant } from "../core/types";

export const CARDS_CAP1: Record<string, Card> = {
  /* ---------- 1 · miopia ---------- */
  occhio: {
    t: "L'occhio è una macchina fotografica",
    p: [
      "Davanti c'è l'obiettivo: la **cornea**, la cupola trasparente, e il **cristallino**, una piccola lente dentro l'occhio. In fondo c'è il sensore: la **retina**.",
      "Per vedere nitido, i raggi che partono da un punto devono incontrarsi **proprio sulla retina**. Se si incontrano prima o dopo, sulla retina arriva una macchia: l'immagine è sfocata.",
      "Da vicino l'occhio deve mettere a fuoco di più. Lo fa il cristallino, che si fa più tondo: si chiama **accomodazione**. Da giovani è automatica e non si sente.",
      "Quanto si vede si misura in **decimi**: 10/10 è la vista piena; con 3/10 si leggono solo le lettere grandi.",
      "Sotto le scene il gioco dice quanto lavora il cristallino: a riposo, lavora poco, lavora, in fatica, non ce la fa. Da lontano un occhio giusto sta a riposo; da vicino lavora, ma senza fatica.",
    ],
    lab: "occhio",
    g: [["cornea", "la parte trasparente davanti all'occhio"], ["cristallino", "la lente dentro l'occhio"], ["retina", "il fondo dell'occhio, dove si forma l'immagine"], ["accomodazione", "la messa a fuoco da vicino"], ["decimi", "quanto vedo («vedo 8 decimi»)"]],
    tutor: "Al cliente non serve la lezione: serve un'immagine. «L'occhio è come una macchina fotografica che non mette bene a fuoco.»",
    teaches: ["fuoco", "accomodazione", "decimi"],
  },
  miopia: {
    t: "La miopia: il fuoco cade prima",
    p: [
      "Nell'occhio miope il fuoco cade **davanti alla retina**: l'occhio è un po' troppo lungo, oppure cornea e cristallino sono un po' troppo forti.",
      "Da lontano vede sfocato. Da vicino no: i raggi che arrivano da vicino sono aperti e spostano il fuoco indietro, proprio sulla retina. Per questo chi ha una miopia leggera legge bene il telefono senza occhiali; con una miopia forte, il telefono va tenuto molto vicino.",
    ],
    lab: "miope",
    g: [["miopia", "non vedo da lontano"], ["miope", "chi vede bene da vicino e male da lontano"]],
    teaches: ["miopia"],
  },
  lentemeno: {
    t: "La lente col meno",
    p: [
      "La lente per la miopia apre i raggi: si chiama **divergente**. È più sottile al centro e più spessa al bordo. Sposta il fuoco indietro, fino alla retina.",
      "Sulla ricetta ha il segno **meno**: −3,00 vuol dire una lente col meno da 3 **diottrie**. Le diottrie si contano a quarti: 0,25 alla volta. Una lente col più o col meno, uguale in tutte le direzioni, si chiama **sfera**.",
      "Non serve la lente più forte: serve quella giusta. Con un meno di troppo il miope giovane vede nitido lo stesso, ma il cristallino deve lavorare per compensare, e a fine giornata gli occhi sono stanchi.",
      "Una leggenda che sentirai spesso: «gli occhiali fanno peggiorare la vista». Non è vero: gli occhiali giusti non fanno peggiorare la vista, fanno vedere bene.",
    ],
    lab: "lente",
    g: [["lente divergente", "la lente col meno"], ["diottria", "il «grado»: «ho due gradi» vuol dire due diottrie"], ["sfera (SF)", "la lente col più o col meno"], ["graduato", "con la correzione della vista"]],
    teaches: ["lente-meno", "diottria", "sfera", "leggende"],
  },
  banco: {
    t: "Al banco: quattro mosse",
    ol: [
      "**Accogli**: saluta e chiedi come puoi aiutare. Dai del Lei; passi al tu se il cliente te lo chiede.",
      "**Chiedi**: per cosa servono gli occhiali, da quando c'è il problema, che occhiali porta, quando ha fatto l'ultimo controllo della vista.",
      "**Spiega** con un'immagine semplice, senza parole difficili.",
      "**Proponi** quello che serve davvero, e di' cosa succede dopo.",
    ],
    after: ["Sulle lenti si aggiungono **trattamenti**. Il più utile quasi per tutti è l'**antiriflesso**: riduce molto i riflessi delle luci sulla lente, di sera alla guida e al computer."],
    g: [["antiriflesso", "il trattamento contro i riflessi"], ["lente monofocale", "lente per una sola distanza"], ["lenti ad alto indice", "lenti più sottili, per gradazioni forti"]],
    tutor: "Le domande vendono più delle risposte: chi si sente ascoltato si fida del consiglio.",
    teaches: ["metodo", "antiriflesso"],
  },
  medico: {
    t: "Chi fa cosa, e quando serve il medico",
    p: [
      "La vista non la misuri tu: la misura l'**ottico optometrista** in negozio, oppure l'**oculista**, il medico degli occhi. Tu non dici gradazioni e non fai diagnosi.",
      "Il **controllo della vista** in negozio misura il difetto, ma non è una visita medica: non cerca malattie. A chi non fa una visita da anni, soprattutto dopo i 40, consiglia anche l'oculista. È un buon consiglio, non un allarme.",
      "Niente promesse sulla salute: nessuna lente e nessun trattamento «fa guarire» un difetto.",
      "**Medico oggi stesso**, niente controllo e niente vendita, se il cliente ha:",
    ],
    ol: [
      "dolore all'occhio, o occhio rosso;",
      "occhio rosso o dolente con le lenti a contatto;",
      "lampi di luce, «mosche» nuove, una tenda nella vista;",
      "vista calata all'improvviso, o vista doppia improvvisa;",
      "righe storte o una macchia al centro, comparse da poco;",
      "mal di testa forte con la vista annebbiata, o aloni colorati intorno alle luci;",
      "un colpo all'occhio.",
    ],
    after: ["Un prodotto chimico nell'occhio: subito acqua corrente, per almeno un quarto d'ora; intanto qualcuno chiama il 112."],
    g: [["ottico optometrista", "chi misura la vista in negozio"], ["oculista", "il medico degli occhi"], ["controllo della vista", "la misura del difetto in negozio: non è una visita medica"]],
    tutor: "Dire «vada dal medico» non fa perdere un cliente: lo fa tornare.",
    teaches: ["ruoli", "medico", "onesta", "visita"],
  },

  /* ---------- 2 · ipermetropia ---------- */
  ipermetropia: {
    t: "L'ipermetropia: il fuoco cadrebbe dietro",
    p: [
      "Nell'occhio ipermetrope il fuoco cadrebbe **dietro la retina**: l'occhio è un po' corto, oppure cornea e cristallino sono un po' troppo deboli.",
      "Da giovani il cristallino compensa: accomoda sempre, anche da lontano. Così si vede nitido, ma l'occhio non riposa mai. Da vicino deve lavorare ancora di più.",
      "Per questo l'ipermetrope spesso dice «ci vedo benissimo», e intanto la sera ha gli occhi stanchi, a volte mal di testa. Se l'ipermetropia è forte il cristallino non ce la fa: nei bambini può portare all'occhio pigro, e serve l'oculista.",
    ],
    lab: "iper",
    g: [["ipermetropia", "da giovani: «ci vedo bene, ma mi stanco». Attenzione: tanti dicono «sono ipermetrope» per dire che, con l'età, non vedono da vicino"], ["occhio pigro (ambliopia)", "l'occhio che non ha imparato a vedere bene"]],
    teaches: ["ipermetropia", "fatica"],
  },
  lentepiu: {
    t: "La lente col più",
    p: [
      "La lente per l'ipermetropia chiude i raggi: si chiama **convergente**. È più spessa al centro e sottile al bordo. Sulla ricetta ha il segno **più**: +3,00.",
      "Fa lei il lavoro che faceva il cristallino: l'occhio si rilassa. Con il più giusto il lontano resta nitido; con troppo più il lontano sfoca.",
      "I primi giorni, col più, il lontano può sembrare meno nitido: l'occhio impara a rilassarsi. Se dopo qualche giorno non va, lo vede l'optometrista.",
    ],
    lab: "piu",
    g: [["lente convergente", "la lente col più"]],
    tutor: "Le lenti col più ingrandiscono un po' gli occhi visti da fuori, quelle col meno li rimpiccioliscono. Il cliente lo nota allo specchio: è normale.",
    teaches: ["lente-piu"],
  },
  schermi: {
    t: "Schermi, trattamenti e promesse",
    p: [
      "**Antiriflesso**: riduce molto i riflessi delle luci sulla lente. Al computer e di sera si sente.",
      "**Filtro luce blu**: alcuni lo trovano piacevole, ma non è dimostrato che tolga stanchezza o mal di testa, e non ci sono prove che la luce degli schermi rovini la retina. Se il cliente lo chiede lo offri, senza promesse.",
      "**Fotocromatiche**: si scuriscono al sole, con i raggi ultravioletti. Davanti allo schermo restano chiare. In macchina, dietro il parabrezza, di solito si scuriscono poco: per guidare al sole non sostituiscono l'occhiale da sole.",
      "Stanchezza e mal di testa possono dipendere dalla vista, ma hanno tante altre cause. Bruciore e «sabbia negli occhi» dopo ore allo schermo sono spesso **occhio secco**: si sbattono meno le palpebre. Non sei tu a deciderlo, e non consigli colliri: ne parla con l'optometrista o con il medico. Se l'occhio è rosso o fa male, vale l'elenco del medico.",
    ],
    g: [["filtro luce blu", "le «lenti anti luce blu» (attenzione: c'è chi chiama «lenti per il computer» anche gli occhiali per vedere bene lo schermo: chiedi cosa intende)"], ["lenti fotocromatiche", "quelle che si scuriscono al sole"], ["occhio secco", "occhi che bruciano, «sabbia negli occhi»"]],
    tutor: "Un consiglio onesto oggi vale tre vendite domani: il cliente si ricorda chi gli ha detto la verità.",
    teaches: ["luce-blu", "fotocromatiche", "occhio-secco"],
  },

  /* ---------- 3 · presbiopia ---------- */
  presbiopia: {
    t: "La presbiopia: il braccio non basta più",
    p: [
      "Con gli anni il cristallino diventa meno elastico e accomoda sempre meno. Il punto più vicino che si vede nitido si allontana: a 20 anni sta a circa 10 cm, a 45 a circa 25 cm, a 50 a circa 40 cm.",
      "Prima viene la fatica: leggere a lungo stanca, e serve più luce. Poi il punto vicino supera la distanza di lettura, e il cliente allontana il telefono. Succede a tutti, di solito dopo i 40-45 anni. Da lontano, se non ci sono altri difetti, si vede come prima.",
    ],
    lab: "eta",
    g: [["presbiopia", "la vista da vicino che cala dopo i 40 («vista stanca»)"], ["punto prossimo", "il punto più vicino che si vede nitido"]],
    teaches: ["presbiopia"],
  },
  lettura: {
    t: "Una lente in più per vicino",
    p: [
      "Per leggere si aggiunge una lente col più: fa il lavoro che il cristallino non riesce più a fare. Sulla ricetta è l'**addizione**, ADD: +1,00, +1,50, +2,00… Cresce con l'età, di solito fino a +2,50 o +3,00.",
      "Da vicino il cristallino può lavorare un po', purché comodo. La lente giusta è la più leggera con cui si legge comodi: con troppo più il telefono è nitido, ma la zona nitida si accorcia e già il tablet sul tavolo sfoca.",
      "Con la lente da lettura il lontano è sfocato: è fatta solo per vicino, e per guidare non va. Gli occhiali da lettura già pronti, quelli della farmacia, hanno la stessa lente per i due occhi: per leggere ogni tanto possono bastare, se i due occhi vedono uguale e non ci sono altri difetti.",
    ],
    lab: "lettura",
    g: [["addizione (ADD)", "quanto in più per vicino"], ["occhiali premontati", "quelli già pronti, della farmacia"]],
    teaches: ["addizione", "premontati"],
  },
  progressive: {
    t: "Lontano e vicino nella stessa lente",
    p: [
      "La **lente progressiva** cambia forza dall'alto in basso: in alto per lontano, al centro per il computer e il cruscotto, in basso per leggere. Il passaggio è graduale, senza righe. Va bene anche a chi da lontano non ha niente da correggere: in alto la lente resta senza forza.",
      "Ai lati c'è una zona un po' sfocata: per guardare di lato si gira la testa, non solo gli occhi. Sulle scale si abbassa la testa e si guarda dalla parte alta. Per abituarsi servono da qualche giorno a due settimane: si portano sempre, e ci si prende la mano a piedi prima di guidare.",
      "Si montano con misure precise, l'**altezza** e la **centratura**: le prende e le controlla l'ottico. Per questo la montatura deve essere abbastanza alta.",
      "Altre soluzioni: la lente **da ufficio**, per vicino e computer, comoda per tante ore alla scrivania, ma non per guidare né per camminare a lungo; la **bifocale**, lontano e vicino con la riga visibile.",
    ],
    lab: "progressiva",
    g: [["lente progressiva", "le multifocali"], ["lente da ufficio (occupazionale)", "quella per la scrivania"], ["bifocale", "quella con la riga"], ["centratura", "le misure che mettono la lente davanti alla pupilla"]],
    tutor: "Le progressive si vendono spiegando prima come ci si abitua: il cliente che sa cosa aspettarsi non torna arrabbiato.",
    teaches: ["progressive", "ufficio", "misure"],
  },

  /* ---------- 4 · astigmatismo ---------- */
  astigmatismo: {
    t: "L'astigmatismo: due fuochi",
    p: [
      "La cornea dovrebbe essere tonda come un pallone da calcio. Nell'occhio astigmatico è un po' ovale, come un pallone da rugby: in una direzione mette a fuoco più che nell'altra.",
      "Così l'occhio ha **due fuochi** invece di uno: le righe in una direzione sono più nitide, quelle nell'altra più sfocate. Le luci di notte si allungano a striscia, e alcune lettere si confondono.",
      "Il **quadrante** è un disegno a raggiera, con righe in tutte le direzioni: chi ha l'astigmatismo ne vede alcune più nitide di altre.",
      "Attenzione: righe **storte** o ondulate, o una macchia al centro, comparse da poco, non sono astigmatismo. Sono un segnale per il medico, oggi stesso.",
    ],
    lab: "quadrante",
    g: [["astigmatismo", "vedo le luci allungate, alcune righe più sfocate di altre"], ["quadrante", "il disegno a raggiera"]],
    teaches: ["astigmatismo", "quadrante"],
  },
  asse: {
    t: "Il cilindro e l'asse",
    p: [
      "L'astigmatismo si corregge con una lente che ha forza in una sola direzione: il **cilindro**, CIL. Va girata nel verso giusto: la direzione si chiama **asse** e si scrive in gradi d'angolo, da 0 a 180.",
      "I gradi si leggono sullo schema **TABO**, un semicerchio graduato, guardando il cliente in faccia come fa l'ottico: 0 a destra, 90 in alto, 180 a sinistra, per tutti e due gli occhi. 0 e 180 sono la stessa direzione: dopo 180 si riparte da 0, e sulla ricetta si scrive 180.",
      "Se la lente gira, la correzione non è più giusta: già 5 gradi si possono notare, con 30 gradi è come non avere il cilindro, oltre è peggio.",
    ],
    lab: "asse",
    g: [["cilindro (CIL)", "la correzione dell'astigmatismo"], ["asse", "la direzione del cilindro, in gradi d'angolo"], ["lente torica", "lente per l'astigmatismo, anche a contatto"], ["schema TABO", "il semicerchio dei gradi"]],
    teaches: ["cilindro", "asse"],
  },
  storta: {
    t: "La montatura storta",
    p: [
      "Se l'occhiale cade, o ci si siede sopra, la montatura può storcersi: le lenti non stanno più dove l'ottico le ha centrate. Con lenti deboli e senza cilindro spesso non si nota. Si nota con il cilindro, perché l'asse gira; con le lenti forti; con le progressive, perché la zona per leggere si sposta.",
      "Per questo, quando un cliente dice «da quando sono caduti vedo male», prima si guarda la montatura. Le piccole regolazioni, come viti e naselli, le fai tu se te le hanno insegnate; una montatura storta con lenti graduate la regola l'ottico. Lenti nuove dopo, solo se servono davvero. In molti negozi le piccole regolazioni sono gratis: chiedi come fate voi.",
    ],
    lab: "storta",
    g: [["regolazione", "sistemare l'occhiale sul viso"], ["frontifocometro", "lo strumento che legge la forza e l'asse di una lente"]],
    tutor: "Una regolazione fatta bene fa tornare il cliente, anche quando gli serviranno occhiali nuovi.",
    teaches: ["montatura"],
  },

  /* ---------- 5 · la ricetta ---------- */
  ricetta: {
    t: "Leggere la ricetta",
    p: ["Una riga per occhio: **OD** occhio destro, **OS** occhio sinistro; a volte **OO**, tutti e due. Se ci sono due righe per occhio, lontano e vicino, la riga del vicino porta già la forza totale per vicino."],
    ol: [
      "**SF**, sfera: il numero principale. Se non c'è cilindro, col meno è miopia, col più ipermetropia.",
      "**CIL**, cilindro: se c'è, c'è astigmatismo. Va sempre con l'**AX**, l'asse in gradi. A volte si scrive con la ×: −0,75 × 90.",
      "**ADD**, addizione: quanto si aggiunge per vicino. È sempre col più.",
      "Un trattino, «—», vuol dire che lì non c'è niente: niente cilindro, niente asse.",
    ],
    lab: "ricetta",
    g: [["OD / OS / OO", "occhio destro / sinistro / tutti e due"], ["SF, CIL, AX", "sfera, cilindro, asse"]],
    tutor: "Il cilindro si può scrivere col più o col meno: è la stessa lente scritta in due modi, e cambiano insieme anche sfera e asse. Molti oculisti scrivono il cilindro col più; la conversione la fa l'ottico. Se un numero ti sembra strano, chiedi a lui: mai al cliente «è sbagliata».",
    teaches: ["ricetta"],
  },
  soluzioni: {
    t: "Una ricetta, tanti occhiali",
    p: [
      "Spesso la ricetta dice solo la **forza** delle lenti. Con la stessa forza si fanno occhiali da lontano, da vicino, progressivi o da ufficio.",
      "Se l'oculista scrive anche il tipo, si parte da lì, e prima di proporre altro si chiede all'ottico. Se non lo scrive, decide l'uso: prima di proporre, chiedi cosa fa il cliente durante il giorno. Guida, computer, lettura, lavoro, sport.",
    ],
    tutor: "Chiedi sempre la data della ricetta e se porta già occhiali: falli appoggiare sul banco, sono la storia del cliente.",
    teaches: ["soluzioni"],
  },

  /* ---------- 6 · sabato mattina ---------- */
  sabato: {
    t: "Cose da sapere al banco",
    ol: [
      "**Medico oggi stesso**: dolore o occhio rosso; occhio rosso o dolente con le lenti a contatto (le toglie, non le rimette, le porta al medico con l'astuccio); lampi, «mosche» nuove, una tenda; vista calata all'improvviso o doppia; mal di testa forte con vista annebbiata; righe storte o una macchia al centro; un colpo all'occhio. Il medico è l'oculista, o il pronto soccorso: quello oculistico, dove c'è.",
      "**Bambini**: il primo passo è la visita dall'oculista, perché a volte servono gocce per misurare bene. Poi montature flessibili e lenti che resistono agli urti, come il **policarbonato**. Mai lenti di vetro. Per i bambini miopi ci sono lenti che rallentano il peggioramento, non lo fermano: se sono adatte, lo decide l'oculista.",
      "**Lenti a contatto**: le applica l'ottico abilitato, con una prova, meglio dopo una visita dall'oculista. Mai «da provare» al banco.",
    ],
    g: [["policarbonato", "un materiale che resiste agli urti"], ["pronto soccorso oculistico", "il pronto soccorso degli occhi"]],
    tutor: "Mandare un cliente dal medico non è perdere una vendita: è il motivo per cui tornerà da te.",
    teaches: ["bambini", "lac"],
  },
};

/* ---------- le varianti: a ogni partita il cliente ha la sua ricetta ---------- */
const MARCO: Variant[] = [-1, -1.25, -1.5, -1.75].map(s => ({ eye: { rx: sph(s), age: 24 }, vars: { od: diop(s), os: diop(s + 0.25) } }));
const GIULIA: Variant[] = [2, 2.25, 2.5].map(s => ({ eye: { rx: sph(s), age: 31 }, vars: { rx: diop(s) } }));
const FRANCO: Variant[] = [49, 50, 51, 52, 53, 54].map(age => {
  const eye = { rx: sph(0), age };
  return { eye, vars: { age: String(age), add: diop(minReadingAdd(eye, 0.35)) } };
});
const SARA: Variant[] = [160, 165, 170, 175, 180, 10, 15].map((axis, i) => ({
  eye: { rx: { sph: -0.5, cyl: -1.25, axis }, age: 35 },
  lens: { sph: -0.5, cyl: -1.25, axis: ((axis + (i % 2 ? 50 : 130) - 1) % 180) + 1 },
  vars: { axis: `${axis}°` },
}));

const ANNA_RX: Ricetta = { od: { sph: 1, cyl: -0.75, axis: 90 }, os: { sph: 1.25, cyl: 0, axis: 180 }, add: 2.25, who: "Prescrizione lenti · sig.ra Anna", date: "settimana scorsa" };

const marco = { name: "Marco", age: 24, job: "studente universitario", msg: "In stazione non leggo più il tabellone dei treni. Il telefono, invece, lo leggo benissimo." };
const giulia = { name: "Giulia", age: 31, job: "grafica", msg: "La sera ho gli occhi che bruciano e a volte mal di testa. Però ci vedo benissimo, eh." };
const franco = { name: "Franco", age: 49, job: "rappresentante", msg: "Per leggere il telefono devo allungare il braccio. Posso prendere gli occhiali della farmacia?" };
const sara = { name: "Sara", age: 35, job: "infermiera", msg: "Da quando mi sono caduti gli occhiali vedo peggio. Di notte le luci delle auto si allungano." };
const anna = { name: "Anna", age: 58, job: "bibliotecaria", msg: "L'oculista mi ha fatto questa ricetta. Io non ci capisco niente: mi fate gli occhiali?" };

export const CAP1: Level[] = [
  /* ===================== 1 · MIOPIA ===================== */
  {
    id: "o1", n: 1, cap: 1,
    title: "Il tabellone sfocato",
    short: "Miopia e lente col meno. Le prime domande al banco.",
    customer: marco,
    learn: ["Come mette a fuoco l'occhio", "Cos'è la miopia e cosa fa la lente col meno", "Le quattro mosse al banco, e cosa non fai tu"],
    cards: ["occhio", "miopia", "lentemeno", "banco", "medico"],
    prova: {
      type: "sfera",
      goal: "Metti in prova la lente che rende nitido il tabellone con il cristallino a riposo.",
      bet: { q: "Se il controllo conferma che Marco è miope, che lente servirà?", o: ["Col meno", "Col più", "Nessuna: da vicino vede bene"], ok: 0, why: "Nel miope il fuoco cade davanti alla retina: serve una lente che apra i raggi, cioè col meno." },
      eye: MARCO[2].eye,
      variants: MARCO,
      views: [{ scene: "tabellone", d: Infinity, label: "Lontano: il tabellone" }, { scene: "telefono", d: 0.4, label: "Vicino: il telefono, 40 cm" }],
      min: -4, max: 2, start: 0,
      hints: ["Col meno il fuoco si sposta indietro, verso la retina. Scendi un quarto alla volta.", "Fermati alla prima lente con cui il tabellone è nitido: se il cristallino lavora, hai messo troppo meno.", "La lente giusta è {od}: con un quarto di meno in più è ancora nitido, ma il cristallino lavora."],
      requires: ["miopia", "lente-meno"],
    },
    dialogs: [{
      id: "marco", who: marco,
      steps: [
        {
          phase: "ascolto",
          say: "Buongiorno. Da qualche settimana non leggo il tabellone dei treni. Mi sa che mi servono gli occhiali.",
          choices: [
            { t: "Buongiorno! Certo, vediamo insieme. Mi racconta un po' meglio? E da vicino, col telefono, come va?", ok: "best", reply: "Da vicino benissimo. È da lontano: il tabellone, i cartelli, la lavagna a lezione.", tip: "Prima di proporre, fai parlare il cliente. «Da vicino bene, da lontano no» è la frase tipica del miope." },
            { t: "Si accomodi pure: le facciamo subito il controllo della vista con l'optometrista, così non perde tempo.", ok: "ok", reply: "Va bene… comunque da vicino ci vedo benissimo, è da lontano il problema.", tip: "Il controllo serve, ma prima due domande: aiutano l'optometrista, e il cliente si sente ascoltato." },
            { t: "Se non legge il tabellone è miope di sicuro: alla sua età di solito servono lenti da −2,50, più o meno.", ok: "grave", reply: "Ah. E lei come fa a saperlo?", tip: "La gradazione non si indovina e non la dici tu: la misura l'optometrista o l'oculista. Tu raccogli le informazioni.", requires: ["ruoli"] },
            { t: "Abbiamo una promozione: due paia al prezzo di uno.", ok: "no", reply: "Sì, ma prima vorrei capire cosa mi serve.", tip: "La promozione viene dopo. Prima si capisce il bisogno." },
          ],
        },
        {
          phase: "ascolto",
          choices: [
            { t: "Ha mai portato occhiali? Quando ha fatto l'ultimo controllo della vista?", ok: "best", reply: "Mai portati. Un controllo l'ho fatto alle medie, credo.", tip: "Che occhiali porta e quando ha fatto l'ultimo controllo: con «per cosa» e «da quando», sono le quattro domande della scheda." },
            { t: "Capita a tanti ragazzi: a forza di stare sul telefono la vista da lontano si rovina, è normalissimo.", ok: "no", reply: "Ah, grazie… Quindi è colpa mia?", tip: "Niente colpe e niente cause: non le conosci. Il cliente si chiude e non torna." },
            { t: "Quando guarda il tabellone strizza gli occhi? Perché se li strizza, di solito è astigmatismo.", ok: "no", reply: "Non so, forse un po'.", tip: "Strizzare gli occhi lo fa quasi chiunque veda sfocato: non è una diagnosi. E le diagnosi non le fai tu.", requires: ["ruoli"] },
          ],
        },
        {
          phase: "spiegazione",
          note: "Marco fa il controllo con l'optometrista: occhio destro {od}, sinistro {os}. Torna al banco.",
          say: "Quindi sono miope? Ma perché da vicino vedo bene e da lontano no?",
          choices: [
            { t: "L'optometrista ha trovato un po' di miopia. Da lontano il fuoco cade un po' prima del fondo dell'occhio, da vicino cade giusto. La lente col meno lo sposta al posto giusto.", ok: "best", reply: "Ah, ecco. Come una macchina fotografica sfocata.", tip: "Riporti quello che ha trovato l'optometrista, con un'immagine semplice e una frase su cosa fa la lente: basta così.", requires: ["miopia", "lente-meno"] },
            { t: "È la vista stanca: con tante ore sui libri l'occhio si affatica, e da lontano non riesce più a mettere a fuoco come prima. Succede a molti studenti.", ok: "no", reply: "Vista stanca? Pensavo fosse una cosa da anziani.", tip: "«Vista stanca» è il modo comune di chiamare la presbiopia, che arriva dopo i 40. Marco è miope: vede male da lontano." },
            { t: "Di solito è un difetto della cornea che si sta deformando: le conviene fare presto una visita, per capire se è una cosa grave.", ok: "grave", reply: "Grave?! Mi sta spaventando.", tip: "Diagnosi e allarme insieme, e non lo sai. Una miopia leggera è comunissima. Una visita dall'oculista puoi sempre consigliarla, con calma, come buona abitudine.", requires: ["visita"] },
          ],
        },
        {
          phase: "spiegazione",
          say: "Devo portarli sempre? Ho letto che se li porti la miopia peggiora.",
          choices: [
            { t: "No, gli occhiali non fanno peggiorare la miopia. Li porta quando le servono da lontano: lezione, guida, cinema. L'uso glielo conferma l'optometrista.", ok: "best", reply: "Ok, chiaro.", tip: "Togli il dubbio con una frase vera, e per l'uso rimandi a chi ha misurato la vista.", requires: ["leggende"] },
            { t: "È vero, purtroppo: se li porta sempre l'occhio si impigrisce. Meglio metterli solo quando serve davvero, così continua ad allenarsi.", ok: "grave", reply: "Ah… quindi meglio niente occhiali?", tip: "È una leggenda: l'occhio miope non si «allena». Portarli o no non cambia la miopia, cambia quanto si vede bene.", requires: ["leggende"] },
            { t: "Deve portarli sempre, dalla mattina alla sera, anche per leggere e per il telefono: se li toglie e li rimette spesso, la miopia peggiora più in fretta.", ok: "grave", reply: "Anche per il telefono? Ma da vicino vedo benissimo.", tip: "Anche questa è una leggenda. L'uso lo indica chi ha misurato la vista, non la paura.", requires: ["leggende"] },
          ],
        },
        {
          phase: "proposta",
          say: "Che lenti mi consiglia? Studio, e la sera guido.",
          choices: [
            { t: "Lenti monofocali, per una sola distanza, con l'antiriflesso: alla guida di sera riduce i riflessi delle luci sulla lente, a lezione quelli dei neon.", ok: "best", reply: "Perfetto, mi sembra giusto.", tip: "Lente semplice per un difetto semplice, e un trattamento che risponde a quello che ti ha detto: la guida di sera.", requires: ["antiriflesso"] },
            { t: "Le progressive: costano un po' di più, ma così è già a posto per tutte le distanze, anche per quando sarà più grande.", ok: "no", reply: "Progressive? Ma a me serve solo da lontano.", tip: "Le progressive servono quando, dopo i 40-45 anni, non si mette più a fuoco da vicino. A Marco servono lenti per una sola distanza." },
            { t: "Le più sottili che abbiamo, ad alto indice: più leggere e più belle a vedersi. Per il primo paio di occhiali conviene partire dal meglio.", ok: "no", reply: "Costano tanto? Ho una miopia leggera…", tip: "Con una miopia leggera una lente normale è già sottile: le lenti assottigliate servono con gradazioni forti, o con certe montature, per esempio senza cerchio. Proponi quello che serve." },
            { t: "Con il filtro luce blu: gli schermi sono la prima causa della miopia nei giovani, e con il filtro la miopia si ferma. Lo consigliamo a tutti gli studenti.", ok: "grave", reply: "Davvero? Allora sì.", tip: "Promessa falsa: il filtro luce blu non ferma la miopia. Mai vendere con una promessa sulla salute.", requires: ["onesta"] },
          ],
        },
      ],
      end: "Marco sceglie la montatura. L'ottico prende le misure per centrare le lenti: tra qualche giorno gli occhiali sono pronti.",
    }],
    quiz: [
      { q: "Il cliente vede male da lontano e bene da vicino. Che difetto fa pensare?", o: ["Miopia", "Nessun difetto: da vicino vede bene", "Occhi stanchi per lo studio"], ok: 0, why: "«Da vicino bene, da lontano no» è la frase tipica del miope. La conferma la dà il controllo della vista." },
      { q: "Com'è fatta una lente col meno?", o: ["Sottile al centro, spessa al bordo", "Spessa al centro, sottile al bordo", "Uguale dappertutto"], ok: 0, why: "La lente divergente, col meno, è più spessa al bordo." },
      { q: "Chi misura la vista?", o: ["L'ottico optometrista o l'oculista", "Il commesso, con le lenti di prova", "Il cliente, provando gli occhiali in vetrina"], ok: 0, why: "Tu raccogli le informazioni e spieghi; la vista la misura l'optometrista o l'oculista." },
      { q: "Con una lente col meno troppo forte, un miope giovane…", o: ["Vede nitido, ma il cristallino lavora e si stanca", "Vede sfocato", "Vede meglio e basta"], ok: 0, why: "L'occhio giovane compensa accomodando: nitido sì, rilassato no." },
      { q: "«Ho due gradi», dice il cliente. Di cosa parla?", o: ["Delle diottrie della sua lente", "Dell'asse del cilindro", "Dei decimi che vede"], ok: 0, why: "Il «grado» dei clienti è la diottria. I decimi dicono quanto si vede: sono un'altra cosa.", requires: ["diottria", "decimi"] },
      { q: "Il controllo della vista in negozio…", o: ["Misura il difetto, ma non è una visita medica", "Sostituisce la visita dall'oculista", "Serve solo per le lenti a contatto"], ok: 0, why: "Misura quanto correggere. La salute dell'occhio la controlla l'oculista.", requires: ["visita"] },
    ],
    stars: ["Occhio", "Ascolto", "Consiglio"],
  },

  /* ===================== 2 · IPERMETROPIA ===================== */
  {
    id: "o2", n: 2, cap: 1,
    title: "Ci vedo benissimo, ma che fatica",
    short: "Ipermetropia e lente col più. Trattamenti senza promesse.",
    customer: giulia,
    learn: ["Perché l'ipermetrope vede nitido ma si stanca", "Cosa fa la lente col più", "Antiriflesso, luce blu, fotocromatiche: cosa dire davvero"],
    cards: ["ipermetropia", "lentepiu", "schermi"],
    prova: {
      type: "sfera",
      goal: "Metti in prova la lente con cui il lontano resta nitido e il cristallino riposa. Poi guarda il computer: il cristallino lavora molto meno.",
      bet: { q: "L'optometrista ha trovato che Giulia è ipermetrope, ma lei vede nitido da lontano e da vicino. A cosa serve allora la lente?", o: ["Col più: fa il lavoro al posto del cristallino, che così riposa", "A niente: vede già bene", "Col meno: per vedere ancora meglio"], ok: 0, why: "Vede nitido perché il cristallino lavora sempre. La lente col più lo fa riposare." },
      eye: GIULIA[0].eye,
      variants: GIULIA,
      views: [{ scene: "strada", d: Infinity, label: "Lontano: la strada" }, { scene: "pc", d: 0.6, label: "Computer, 60 cm" }],
      min: -1, max: 3.5, start: 0,
      hints: ["Guarda il cristallino: con la lente giusta smette di lavorare, e il lontano resta nitido.", "Sali col più un quarto alla volta: fermati prima che il lontano sfochi.", "La lente giusta è {rx}: con un quarto in più il lontano comincia a sfocare."],
      requires: ["ipermetropia", "lente-piu"],
    },
    dialogs: [{
      id: "giulia", who: giulia,
      steps: [
        {
          phase: "ascolto",
          say: "Ciao! La sera ho gli occhi che bruciano e a volte mal di testa. Però ci vedo benissimo, eh.",
          choices: [
            { t: "Buongiorno! Mi racconta com'è la sua giornata? Quante ore passa al computer, e a che distanza tiene lo schermo?", ok: "best", reply: "Otto, nove ore. Lo schermo a una sessantina di centimetri, più il telefono.", tip: "Fastidi che arrivano la sera, dopo ore da vicino: le domande sull'uso sono quelle giuste." },
            { t: "Se ci vede benissimo, gli occhi non c'entrano: sarà lo stress del lavoro. Provi a dormire di più e a fare qualche pausa.", ok: "no", reply: "Mmh. Dormo già otto ore.", tip: "Vedere nitido non vuol dire non avere difetti: l'ipermetrope vede bene facendo lavorare l'occhio. E non sei tu a dire che non è la vista." },
            { t: "È sicuramente la vista: le serve una lente col più.", ok: "grave", reply: "Sicuramente? Come fa a dirlo?", tip: "Può darsi, ma non lo sai: lo dice il controllo. Diagnosi e lenti non si decidono al banco.", requires: ["ruoli"] },
            { t: "Per chi lavora al computer ci sono le lenti con filtro luce blu: bloccano la luce che stanca gli occhi e tolgono il mal di testa da schermo.", ok: "grave", reply: "Ah sì? Funzionano?", tip: "Non è dimostrato che il filtro luce blu tolga stanchezza o mal di testa. Si offre se il cliente lo chiede, senza promesse.", requires: ["onesta"] },
          ],
        },
        {
          phase: "ascolto",
          choices: [
            { t: "Porta già occhiali? Quando ha fatto l'ultimo controllo della vista?", ok: "best", reply: "Mai portati. Il controllo… forse cinque anni fa, per la patente.", tip: "Nessun occhiale e un controllo lontano: il prossimo passo è chiaro." },
            { t: "Il mal di testa è forte? Le capita di vedere doppio o lampi di luce?", ok: "best", reply: "No, niente di strano. È un cerchio alla fronte, la sera.", tip: "Domanda utile: con segnali come questi la manderesti dal medico. Qui non ci sono.", requires: ["medico"] },
            { t: "Allora sono gli schermi: si riposi nel fine settimana.", ok: "no", reply: "Magari… ma il lunedì ricomincia uguale.", tip: "La causa non la stabilisci tu, e così non risolvi niente: prima si capisce, con le domande e il controllo della vista." },
            { t: "Allora facciamo un paio di occhiali da lettura per il computer: ingrandiscono un po' e gli occhi si rilassano subito.", ok: "no", reply: "Da lettura? Ho 31 anni…", tip: "Senza controllo non sai cosa serve, e gli occhiali già pronti sono pensati per chi, con l'età, non mette più a fuoco da vicino. Prima il controllo, poi le lenti giuste." },
          ],
        },
        {
          phase: "spiegazione",
          note: "Giulia fa il controllo con l'optometrista: ipermetropia, {rx} per occhio.",
          say: "Ipermetropia? Ma io ci vedo benissimo, anche da lontano!",
          choices: [
            { t: "Vede bene perché il cristallino lavora sempre per mettere a fuoco, e al computer ancora di più: per questo la sera può sentirsi stanca. La lente col più lavora al posto suo.", ok: "best", reply: "Ah, quindi gli occhi non riposano mai.", tip: "Spieghi perché vede bene, perché può stancarsi e cosa fa la lente, senza promettere che il mal di testa sparisca.", requires: ["ipermetropia", "fatica", "lente-piu"] },
            { t: "Vuol dire che da lontano in realtà vede male, solo che il cervello si è abituato e non se ne accorge: per questo le sembra di vedere bene.", ok: "no", reply: "Ma no, leggo le targhe da lontanissimo!", tip: "Falso: l'ipermetrope giovane da lontano vede nitido. Il problema è il lavoro continuo del cristallino, non la nitidezza." },
            { t: "È il contrario della miopia, e di solito con gli anni passa da sola: se non le dà troppo fastidio, può anche aspettare e vedere come va.", ok: "grave", reply: "Passa? Allora aspetto.", tip: "Da adulti non passa: anzi, con l'età il cristallino compensa sempre meno. Niente previsioni sulla vista.", requires: ["onesta"] },
          ],
        },
        {
          phase: "spiegazione",
          say: "Quindi li devo portare sempre? Per lavorare o per tutto?",
          choices: [
            { t: "Come usarli glielo spiega l'optometrista, che ha misurato la vista. Di solito la differenza si sente soprattutto al computer e leggendo.", ok: "best", reply: "Ok, chiedo a lui.", tip: "L'uso lo indica chi ha misurato. Tu dici cosa aspettarsi, senza decidere al posto suo.", requires: ["ruoli"] },
            { t: "Li metta solo quando ha mal di testa o gli occhi stanchi, come una medicina: negli altri momenti è meglio lasciar lavorare l'occhio da solo.", ok: "no", reply: "Tipo un'aspirina?", tip: "Gli occhiali non sono un farmaco al bisogno: servono a non affaticare l'occhio mentre lavora. L'uso lo indica chi ha misurato." },
            { t: "Sempre, dalla mattina alla sera, anche quando non le servono: se li toglie e li rimette l'occhio si vizia e poi non ne fa più a meno.", ok: "grave", reply: "Si vizia?", tip: "Leggenda: l'occhio non si «vizia». E l'uso non lo decidi tu.", requires: ["leggende"] },
          ],
        },
        {
          phase: "proposta",
          say: "Per lo schermo mi conviene qualche trattamento? E la sera gli occhi mi bruciano.",
          choices: [
            { t: "L'antiriflesso, che riduce molto i riflessi delle luci sulla lente. Il filtro luce blu c'è, se lo desidera, ma non è dimostrato che tolga la stanchezza. Per il bruciore ne parli con l'optometrista.", ok: "best", reply: "L'antiriflesso sì. Il filtro ci penso.", tip: "Consiglio onesto: dici cosa fa davvero ogni trattamento, e il bruciore lo lasci a chi può valutarlo.", requires: ["antiriflesso", "luce-blu", "occhio-secco"] },
            { t: "Il filtro luce blu è indispensabile per chi sta otto ore davanti allo schermo: senza, la luce blu col tempo le rovina la retina.", ok: "grave", reply: "Addirittura?", tip: "Paura senza prove: non è dimostrato che la luce degli schermi rovini la retina. Vendere con la paura brucia la fiducia.", requires: ["luce-blu"] },
            { t: "Le lenti fotocromatiche: si scuriscono da sole quando c'è troppa luce, anche davanti allo schermo, e così gli occhi riposano per tutta la giornata di lavoro.", ok: "no", reply: "Davanti allo schermo? Pensavo al sole.", tip: "Le fotocromatiche si scuriscono al sole, con i raggi ultravioletti: davanti allo schermo restano chiare.", requires: ["fotocromatiche"] },
            { t: "Per il bruciore le consiglio un collirio idratante: lo trova in farmacia, senza ricetta.", ok: "no", reply: "Quale?", tip: "Cosa mettere negli occhi non lo consigli tu: il bruciore può avere tante cause. Ne parla con l'optometrista o con il medico.", requires: ["occhio-secco"] },
          ],
        },
      ],
      end: "Giulia sceglie una montatura leggera, con lenti antiriflesso. L'ottico prende le misure.",
    }],
    quiz: [
      { q: "Un ipermetrope giovane, da lontano…", o: ["Spesso vede nitido, ma il cristallino lavora sempre", "Vede sempre sfocato", "Vede sfocato solo di sera"], ok: 0, why: "Il cristallino giovane compensa: nitido sì, ma l'occhio non riposa mai." },
      { q: "Com'è fatta una lente col più?", o: ["Spessa al centro, sottile al bordo", "Sottile al centro, spessa al bordo", "Piatta"], ok: 0, why: "La lente convergente, col più, è più spessa al centro." },
      { q: "Il filtro luce blu…", o: ["Si offre senza promesse: non è dimostrato che tolga la stanchezza", "Toglie il mal di testa da schermo", "Protegge la retina da danni sicuri"], ok: 0, why: "Puoi offrirlo, ma senza promettere effetti sulla salute che non sono dimostrati." },
      { q: "Le lenti fotocromatiche si scuriscono…", o: ["Al sole, con i raggi ultravioletti", "Davanti allo schermo", "Sempre allo stesso modo, anche in macchina"], ok: 0, why: "Reagiscono agli ultravioletti: davanti allo schermo restano chiare, e dietro il parabrezza di solito si scuriscono poco." },
    ],
    stars: ["Occhio", "Ascolto", "Consiglio"],
  },

  /* ===================== 3 · PRESBIOPIA ===================== */
  {
    id: "o3", n: 3, cap: 1,
    title: "Il braccio troppo corto",
    short: "Presbiopia, addizione, lettura e progressive.",
    customer: franco,
    learn: ["Perché dopo i 40-45 anni si allontana il telefono", "L'addizione per vicino, e perché più forte non è meglio", "Occhiali da lettura, progressive e lenti da ufficio: quando ognuno"],
    cards: ["presbiopia", "lettura", "progressive"],
    prova: {
      type: "vicino",
      goal: "Trova l'addizione per leggere il telefono a 35 cm: nitido, comodo, e non più forte del necessario.",
      bet: { q: "Il controllo conferma che Franco è presbite e che da lontano non ha difetti. Che lente serve per leggere?", o: ["Col più, solo per vicino", "Col meno, come per la miopia", "Nessuna: deve allenare gli occhi"], ok: 0, why: "Il cristallino non accomoda più abbastanza: una lente col più fa il lavoro che manca." },
      eye: FRANCO[0].eye,
      variants: FRANCO,
      views: [{ scene: "telefono", d: 0.35, label: "Il telefono, 35 cm" }, { scene: "strada", d: Infinity, label: "Lontano, con la stessa lente" }],
      min: 0, max: 3, start: 0, dist: 0.35,
      hints: ["Sali col più finché il telefono è nitido e il cristallino lavora comodo.", "Fermati alla prima lente comoda: una più forte accorcia la zona nitida.", "L'addizione giusta è {add}."],
      requires: ["presbiopia", "addizione"],
    },
    dialogs: [{
      id: "franco", who: franco,
      steps: [
        {
          phase: "ascolto",
          say: "Buongiorno. Per leggere il telefono devo allungare il braccio. Mi dicono che è la presbiopia: posso prendere quelli della farmacia?",
          choices: [
            { t: "Buongiorno! Per alcuni usi possono andare: mi aiuti a capire. Come passa la giornata? Guida tanto? Legge, usa il computer?", ok: "best", reply: "Guido tutto il giorno, dai clienti. Tablet per gli ordini, telefono, e la sera il giornale.", tip: "Rispondi alla domanda, poi capisci l'uso: cambia tutto." },
            { t: "Quelli della farmacia sono fatti male e alla lunga rovinano la vista: non li prenda, glieli facciamo noi su misura, come si deve.", ok: "grave", reply: "Ah sì? Mia moglie li usa da anni…", tip: "Falso, e screditi la scelta di chi li usa. I premontati vanno bene per alcuni usi: lo spieghi, senza paura.", requires: ["premontati", "onesta"] },
            { t: "Sì, vanno benissimo per la sua età: prenda un +2,00 in farmacia e risparmia.", ok: "grave", reply: "+2,00? Va bene, se lo dice lei.", tip: "La forza non la decidi tu, e senza controllo non sai se i due occhi sono uguali o se c'è altro.", requires: ["ruoli"] },
          ],
        },
        {
          phase: "ascolto",
          choices: [
            { t: "Da lontano come vede? Porta occhiali, o ha fatto un controllo di recente?", ok: "best", reply: "Da lontano benissimo. Occhiali mai, controllo… non ricordo.", tip: "Ti serve sapere se c'è anche un difetto da lontano e quanto è vecchio l'ultimo controllo." },
            { t: "Allora le prendo subito le misure per le progressive.", ok: "no", reply: "Già? Non mi deve controllare la vista prima?", tip: "Prima servono il controllo della vista e la scelta dell'occhiale. E le misure le prende l'ottico.", requires: ["ruoli"] },
            { t: "Con tutta quella guida, prima di tutto le servono degli occhiali da sole graduati: in macchina sono la cosa più importante.", ok: "no", reply: "Prima vorrei leggere il telefono…", tip: "Resta sul bisogno del cliente. Il sole graduato è un'idea per dopo, non adesso." },
          ],
        },
        {
          phase: "spiegazione",
          say: "Ma perché adesso? Fino all'anno scorso leggevo benissimo.",
          choices: [
            { t: "Quello che descrive è tipico dell'età: la lente dentro l'occhio diventa meno elastica e mette a fuoco da vicino sempre meno. Il controllo ci dirà quanto; e a questa età è utile anche una visita dall'oculista.", ok: "best", reply: "Ah, quindi è normale. Faccio il controllo, e prenoto anche l'oculista.", tip: "Spieghi senza fare diagnosi: «tipico dell'età», e il controllo dirà quanto. Dopo i 40 una visita dall'oculista è un buon consiglio.", requires: ["presbiopia", "visita"] },
            { t: "Perché sta diventando miope: capita spesso verso i cinquant'anni, la vista si sposta e da vicino si comincia a fare fatica.", ok: "no", reply: "Miope? Ma da lontano vedo bene.", tip: "La miopia è da lontano. La presbiopia è da vicino, e viene con l'età." },
            { t: "Colpa del telefono: a forza di usarlo tutto il giorno, da vicino la vista si è stancata. Se lo usa un po' meno, di solito migliora.", ok: "no", reply: "Quindi se lo uso meno passa?", tip: "No: il telefono non c'entra e non passa. È il cristallino che perde elasticità." },
          ],
        },
        {
          phase: "proposta",
          note: "Franco fa il controllo con l'optometrista: da lontano niente da correggere, per vicino {add}.",
          say: "Allora: occhiali da lettura, o le progressive di cui parlano tutti?",
          choices: [
            { t: "Per come usa la vista, le progressive: lontano, tablet e telefono con lo stesso occhiale. Se leggesse solo il giornale la sera, basterebbero quelli da lettura.", ok: "best", reply: "Sì, in macchina toglierli e metterli sarebbe un problema.", tip: "Proposta legata all'uso che ti ha raccontato, e onesta sull'alternativa più economica.", requires: ["progressive", "addizione"] },
            { t: "Quelli da lettura vanno benissimo e costano meno: li tiene sempre su, anche in macchina, così il telefono e il tablet li vede al volo.", ok: "grave", reply: "Con quelli da lettura vedo la strada?", tip: "No: con la lente da lettura il lontano è sfocato. Per guidare non vanno: è una questione di sicurezza.", requires: ["addizione"] },
            { t: "Le progressive più care che abbiamo: con tanta guida e tanto tablet sono le uniche che funzionano bene, quelle economiche danno solo problemi e si torna indietro.", ok: "no", reply: "Quanto costano?", tip: "Proponi la soluzione, non il prezzo più alto. Prima si sceglie il tipo di lente; poi, spiegando le differenze, il prezzo." },
          ],
        },
        {
          phase: "spiegazione",
          say: "Mi hanno detto che con le progressive ci si mette tanto ad abituarsi…",
          choices: [
            { t: "Di solito da qualche giorno a due settimane. All'inizio ai lati sfoca un po': si gira la testa, e sulle scale si guarda dalla parte alta. Prima di guidare, ci prenda la mano a piedi.", ok: "best", reply: "Ok, se so cosa aspettarmi va bene.", tip: "Spiegare l'abitudine prima evita il cliente arrabbiato dopo. Se dopo due settimane non va, torna e l'ottico controlla.", requires: ["progressive"] },
            { t: "Nessun problema: con le lenti di oggi ci si abitua subito, già in negozio. Se le mette domattina, a pranzo non si ricorda nemmeno di averle.", ok: "no", reply: "Meglio così!", tip: "Promessa troppo bella: se dopo un giorno vede sfocato ai lati, si sentirà preso in giro." },
            { t: "Ci si abitua solo se le porta sempre: se dopo qualche giorno non si trova, vuol dire che non le ha portate abbastanza. Deve insistere, le tolga solo per dormire.", ok: "no", reply: "Quindi sarebbe colpa mia?", tip: "Portarle con continuità i primi giorni aiuta davvero, e si può dire. Sbagliato è dare la colpa al cliente: se dopo due settimane non va, l'ottico controlla misure e montatura." },
          ],
        },
      ],
      end: "Franco sceglie una montatura abbastanza alta per la progressiva. L'ottico prende le misure: altezza e centratura.",
    }],
    quiz: [
      { q: "Verso che età arriva di solito la presbiopia?", o: ["Dopo i 40-45 anni", "Dopo i 20", "Dopo i 70"], ok: 0, why: "Il cristallino perde elasticità con gli anni: di solito ci si accorge dopo i 40-45." },
      { q: "Con gli occhiali da lettura, da lontano…", o: ["Si vede sfocato", "Si vede meglio", "Si vede uguale"], ok: 0, why: "La lente da lettura è fatta per vicino: da lontano sfoca. Per guidare non va." },
      { q: "Nella lente progressiva, la zona per leggere sta…", o: ["In basso", "In alto", "Ai lati"], ok: 0, why: "In alto lontano, al centro intermedio, in basso vicino." },
      { q: "Ai lati della progressiva si vede un po' sfocato. Cosa consigli?", o: ["Girare la testa, non solo gli occhi", "Guardare sempre dalla parte bassa", "Cambiare subito le lenti"], ok: 0, why: "Le zone laterali sono il prezzo della progressione: si gira la testa." },
      { q: "La lente da ufficio va bene per guidare?", o: ["No: il lontano è sfocato", "Sì, è la più comoda", "Solo di notte"], ok: 0, why: "È fatta per vicino e computer: alla guida il lontano è sfocato.", requires: ["ufficio"] },
    ],
    stars: ["Occhio", "Ascolto", "Consiglio"],
  },

  /* ===================== 4 · ASTIGMATISMO ===================== */
  {
    id: "o4", n: 4, cap: 1,
    title: "Le luci che si allungano",
    short: "Astigmatismo, cilindro e asse. La montatura storta.",
    customer: sara,
    learn: ["Cos'è l'astigmatismo: due fuochi", "Il cilindro e l'asse sullo schema TABO", "Perché una montatura storta fa vedere peggio"],
    cards: ["astigmatismo", "asse", "storta"],
    prova: {
      type: "asse",
      goal: "Gira la lente finché il quadrante è nitido in tutte le direzioni.",
      bet: { q: "Sara ha l'astigmatismo: sulla sua ricetta ci sono sfera, cilindro e asse. Nell'occhiale di prova sfera e cilindro sono già giusti. Cosa resta da trovare?", o: ["La direzione del cilindro, cioè l'asse", "Una sfera più forte", "Una lente col più"], ok: 0, why: "Il cilindro corregge solo se è girato nel verso giusto: resta da trovare l'asse." },
      eye: SARA[2].eye,
      variants: SARA,
      views: [{ scene: "quadrante", d: Infinity, label: "Il quadrante a raggiera" }, { scene: "notte", d: Infinity, label: "La strada di notte" }],
      lens: SARA[2].lens!,
      step: 5,
      hints: ["Gira la lente e guarda il quadrante: cerca la posizione in cui tutte le righe sono uguali.", "Quando le righe sfocate sono poche e leggere sei vicino: vai avanti piano, un passo alla volta.", "L'asse giusto è {axis}: già 5 gradi prima o dopo si vede la differenza."],
      requires: ["cilindro", "asse"],
    },
    dialogs: [{
      id: "sara", who: sara,
      steps: [
        {
          phase: "ascolto",
          say: "Ciao. Questi occhiali li ho da un anno. Da quando mi sono caduti vedo peggio, soprattutto le luci di notte: si allungano.",
          choices: [
            { t: "Buongiorno, me li fa vedere? E intanto mi racconta cosa vede di diverso rispetto a prima della caduta?", ok: "best", reply: "Eccoli. Prima vedevo bene. Ora alcune righe sono più sfocate di altre, e mi stanco.", tip: "Prima guardi l'occhiale e ascolti: il cliente ti ha già dato un indizio, sono caduti." },
            { t: "Dopo un anno è normale che la vista cambi: facciamo un controllo e rifacciamo le lenti, così torna a vedere bene.", ok: "no", reply: "Lenti nuove? Ma li ho da un anno.", tip: "Prima si guarda l'occhiale. Vendere lenti nuove senza guardare è il modo più rapido per perdere un cliente." },
            { t: "Le luci che si allungano sono un sintomo serio: meglio non rischiare, vada subito al pronto soccorso.", ok: "no", reply: "Oddio, al pronto soccorso?", tip: "Allarme inutile: dopo una caduta, prima si guarda l'occhiale. Se con l'occhiale dritto vede ancora male, allora controllo e, se serve, medico. Subito dal medico con dolore, occhio rosso, lampi, una tenda, un calo improvviso.", requires: ["medico"] },
          ],
        },
        {
          phase: "spiegazione",
          note: "Appoggi l'occhiale sul banco: la montatura è storta, una lente sta più in alto dell'altra.",
          say: "È grave? Sulla ricetta ho anche il cilindro, se ricordo bene.",
          choices: [
            { t: "La montatura si è storta, e con il cilindro la lente deve stare girata nel verso giusto: se gira, l'asse cambia e una direzione sfoca. La facciamo regolare all'ottico e la verifichiamo.", ok: "best", reply: "Ah, quindi forse non serve rifare le lenti.", tip: "Hai collegato il sintomo alla causa con un'immagine semplice, e la regolazione la fa chi può.", requires: ["cilindro", "asse", "montatura"] },
            { t: "Il cilindro con l'età tende a cambiare: è normale che dopo un anno le luci di notte si allunghino. Facciamo un controllo e vediamo.", ok: "no", reply: "Quindi devo rifare tutto?", tip: "Non c'entra l'età: qui c'è un occhiale storto. Niente previsioni sulla vista." },
            { t: "Con il cilindro le lenti sono delicatissime: una caduta basta a rovinarle. Purtroppo dovrà ricomprarle, ma le facciamo uno sconto.", ok: "no", reply: "Ma sono quasi nuove!", tip: "Una montatura storta si regola. Prima il servizio, poi la vendita, se serve davvero." },
          ],
        },
        {
          phase: "proposta",
          note: "L'ottico regola la montatura e controlla le lenti al frontifocometro: asse {axis}, come sulla ricetta. Era la montatura storta a girarle davanti all'occhio: ora sta dritta.",
          say: "Va molto meglio! Quanto le devo?",
          choices: [
            { t: "Niente, per noi la regolazione è un servizio. Se le ricapita, torni pure. E quando non li porta, li tenga in un astuccio rigido.", ok: "best", reply: "Grazie, siete gentilissimi. L'astuccio lo prendo.", tip: "Un servizio fatto bene vale più di una vendita, e il consiglio dell'astuccio è utile, non insistente." },
            { t: "Niente. Già che c'è, vuole dare un'occhiata alle montature nuove? Sono appena arrivate, e ce n'è una che le starebbe benissimo.", ok: "ok", reply: "Magari un'altra volta, oggi vado di corsa.", tip: "Proporre non è sbagliato, ma non adesso: è venuta per un problema, e l'avete risolto. Lascia un buon ricordo.", end: "Sara ringrazia e se ne va di corsa, con l'occhiale dritto." },
            { t: "Le consiglio comunque lenti nuove, non si sa mai.", ok: "no", reply: "Ma se adesso vedo bene…", tip: "Vendere quando il problema è risolto rovina la fiducia." },
          ],
        },
        {
          phase: "spiegazione",
          say: "Una curiosità: l'astigmatismo si può togliere?",
          choices: [
            { t: "Si corregge con le lenti, anche a contatto: si chiamano toriche. Per interventi o per la salute dell'occhio, ne parli con l'oculista.", ok: "best", reply: "Ok, glielo chiederò.", tip: "Dici cosa si fa in negozio, e per il resto rimandi al medico.", requires: ["cilindro", "ruoli"] },
            { t: "Sì, con il laser: ormai lo fanno tutti, dura dieci minuti ed è una cosa da niente. Se vuole le do il nome di un centro.", ok: "grave", reply: "Da niente?", tip: "Gli interventi li valuta il medico: non li consigli e non li sminuisci.", requires: ["ruoli"] },
            { t: "No, purtroppo l'astigmatismo è per sempre, e con gli anni di solito peggiora: l'importante è controllarlo spesso e cambiare le lenti appena serve.", ok: "no", reply: "Che tristezza.", tip: "Previsione senza basi, e scoraggiante. L'astigmatismo si corregge bene con le lenti." },
          ],
        },
      ],
      end: "Sara se ne va con l'occhiale dritto e un astuccio rigido.",
    }],
    quiz: [
      { q: "Il cilindro (CIL) sulla ricetta dice che c'è…", o: ["Astigmatismo", "Presbiopia", "Miopia"], ok: 0, why: "Il cilindro corregge l'astigmatismo, e va sempre con l'asse." },
      { q: "L'asse si scrive in…", o: ["Gradi d'angolo, da 0 a 180", "Diottrie", "Decimi"], ok: 0, why: "L'asse è una direzione. Quando il cliente dice «ho due gradi» parla di diottrie, non dell'asse." },
      { q: "A chi si nota di più una montatura storta?", o: ["A chi ha il cilindro, lenti forti o progressive", "A chi ha solo lenti deboli senza cilindro", "A nessuno: le lenti restano le stesse"], ok: 0, why: "Le lenti non stanno più dove sono state centrate: con il cilindro gira l'asse, con le progressive si sposta la zona per leggere." },
      { q: "Sullo schema TABO, guardando il cliente in faccia, il 90 sta…", o: ["In alto", "A destra", "A sinistra"], ok: 0, why: "0 a destra, 90 in alto, 180 a sinistra." },
      { q: "Un cliente vede righe storte o ondulate da qualche giorno. Cosa fai?", o: ["Lo mandi dal medico, oggi stesso", "Gli proponi un cilindro: è astigmatismo", "Gli dici di aspettare qualche settimana"], ok: 0, why: "Righe storte comparse da poco non sono astigmatismo: sono un segnale per il medico, oggi stesso.", requires: ["medico"] },
    ],
    stars: ["Occhio", "Ascolto", "Consiglio"],
  },

  /* ===================== 5 · LA RICETTA ===================== */
  {
    id: "o5", n: 5, cap: 1,
    title: "Il foglio dell'oculista",
    short: "OD, OS, SF, CIL, AX, ADD. E che occhiale fare.",
    customer: anna,
    learn: ["Leggere una ricetta numero per numero", "Che occhiale si può fare con una ricetta", "Scegliere con l'uso del cliente"],
    cards: ["ricetta", "soluzioni"],
    prova: {
      type: "ricetta",
      goal: "Leggi la ricetta di Anna: tocca il numero che risponde a ogni domanda.",
      ricetta: ANNA_RX,
      tasks: [
        { q: "Quale numero dice che l'occhio sinistro è ipermetrope?", ok: ["OS.SF"], why: "La sfera dell'occhio sinistro, OS, è col più, +1,25, e non c'è cilindro: ipermetropia." },
        { q: "Quale numero dice che c'è astigmatismo?", ok: ["OD.CIL"], why: "Il cilindro dell'occhio destro: −0,75. Il sinistro non ce l'ha." },
        { q: "Quale numero dice in che direzione va il cilindro?", ok: ["OD.AX"], why: "L'asse, 90°: il cilindro va girato in verticale, sullo schema TABO." },
        { q: "Quale numero si aggiunge per leggere?", ok: ["ADD"], why: "L'addizione, +2,25: si aggiunge per vicino, a tutti e due gli occhi." },
      ],
      age: 58,
      hints: ["SF è il numero principale; CIL e AX vanno sempre insieme; ADD è per vicino.", "OD è la riga dell'occhio destro, OS del sinistro.", "Risposte: SF di OS, CIL di OD, AX di OD, ADD."],
      requires: ["ricetta"],
    },
    dialogs: [{
      id: "anna", who: anna,
      steps: [
        {
          phase: "ascolto",
          say: "Buongiorno, l'oculista mi ha fatto questa ricetta. Io non ci capisco niente. Mi fate gli occhiali?",
          choices: [
            { t: "Buongiorno! Certo, la guardiamo insieme. Di quando è la ricetta? E porta già degli occhiali, anche solo per leggere?", ok: "best", reply: "È della settimana scorsa. Ho quelli da lettura della farmacia, ma da lontano niente.", tip: "Data della ricetta e occhiali attuali: due domande che servono sempre.", requires: ["soluzioni"] },
            { t: "Non si preoccupi, ci penso io a tutto: lei non deve capire niente, basta che scelga la montatura che le piace di più.", ok: "no", reply: "Beh, vorrei almeno sapere cosa compro.", tip: "Il cliente che capisce si fida. Due parole di spiegazione bastano." },
            { t: "Questa ricetta è strana: il cilindro c'è solo su un occhio, sarà un errore dell'oculista. Meglio chiamarlo.", ok: "grave", reply: "Un errore? Devo tornare dall'oculista?", tip: "Non dire al cliente che la ricetta è sbagliata: è normalissimo che i due occhi siano diversi. Se un numero ti sembra strano, chiedi all'ottico: sarà lui, se serve, a sentire l'oculista.", requires: ["ricetta"] },
          ],
        },
        {
          phase: "spiegazione",
          show: { ricetta: ANNA_RX },
          say: "Cosa vogliono dire tutti questi numeri?",
          choices: [
            { t: "La prima riga è l'occhio destro, la seconda il sinistro. Il più vuol dire ipermetropia; il destro ha anche un po' di astigmatismo, il cilindro. L'ADD è per leggere.", ok: "best", reply: "Ah, ecco. Quindi destro e sinistro sono diversi.", tip: "Poche parole, nell'ordine della ricetta. Niente lezione.", requires: ["ricetta"] },
            { t: "Che lei è miope, un po' di più dal lato destro: per quello nella ricetta c'è il segno meno, e il numero più grande è sempre quello dell'occhio che vede peggio.", ok: "no", reply: "Ma qui c'è scritto più…", tip: "Il più nella sfera è ipermetropia. Il meno del cilindro è solo il modo di scriverlo." },
            { t: "L'ADD è l'astigmatismo: è quanto si aggiunge per correggerlo, e serve soprattutto per guidare di sera, quando le luci si allungano.", ok: "no", reply: "Ah, pensavo fosse per leggere…", tip: "ADD è l'addizione per vicino. L'astigmatismo è il cilindro, CIL, con l'asse." },
          ],
        },
        {
          phase: "ascolto",
          say: "E quindi che occhiali mi servono? Uno o due paia?",
          choices: [
            { t: "Dipende da come passa la giornata: guida? Usa il computer? Legge tanto, e a che distanza?", ok: "best", reply: "Guido poco, in città. Leggo tanto, e lavoro tre giorni a settimana in biblioteca, al computer.", tip: "La ricetta dice la forza, l'uso decide l'occhiale.", requires: ["soluzioni"] },
            { t: "Due paia, uno da lontano e uno da vicino: è sempre la scelta più sicura, così ogni occhiale fa una cosa sola e la fa bene.", ok: "no", reply: "Sempre? Mia sorella ne ha un paio solo.", tip: "Non c'è una scelta migliore per tutti: dipende dall'uso. Prima chiedi." },
            { t: "Le progressive: con questa ricetta sono obbligatorie.", ok: "no", reply: "Obbligatorie?", tip: "L'oculista non ha scritto il tipo di occhiale: lo si sceglie con il cliente, in base all'uso.", requires: ["soluzioni"] },
          ],
        },
        {
          phase: "proposta",
          choices: [
            { t: "Progressive per tutti i giorni: lontano, computer e lettura con un solo occhiale. E, se vuole, un paio da ufficio per le ore in biblioteca: solo per la scrivania, non per guidare.", ok: "best", reply: "Mi piace l'idea delle progressive. Quelli da ufficio li vedo dopo.", tip: "Una soluzione principale chiara, più un secondo paio motivato dall'uso, con il suo limite detto chiaro.", requires: ["progressive", "ufficio"] },
            { t: "Due paia: uno da lontano per guidare in città e uno da vicino per leggere. Così ogni occhiale fa il suo lavoro, e lei sceglie quale mettere.", ok: "ok", reply: "E al computer quale metto?", tip: "Funziona, ma il computer resta scoperto e deve cambiare occhiale tutto il giorno. Con il suo uso le progressive sono più comode.", end: "Anna sceglie due montature, una da lontano e una da vicino. Per il computer, vedrà." },
            { t: "Quelli da lettura, come quelli che ha già: tanto guida poco, e per leggere e per il computer vanno benissimo. Risparmia ed è a posto.", ok: "grave", reply: "Ma quelli della farmacia non hanno l'astigmatismo…", tip: "Anna ha due occhi diversi e il cilindro: servono lenti fatte su misura. E se guida, il lontano va corretto come dice la ricetta.", requires: ["premontati"] },
          ],
        },
      ],
      end: "Anna sceglie una montatura abbastanza alta per la progressiva. L'ottico prende le misure.",
    }],
    quiz: [
      { q: "OS sulla ricetta vuol dire…", o: ["Occhio sinistro", "Occhio sano", "Ottico specialista"], ok: 0, why: "OD occhio destro, OS occhio sinistro, OO tutti e due." },
      { q: "L'ADD è sempre…", o: ["Col più", "Col meno", "In gradi"], ok: 0, why: "È quanto si aggiunge per vicino: sempre col più." },
      { q: "Senza cilindro, una sfera +1,25 vuol dire…", o: ["Ipermetropia", "Miopia", "Astigmatismo"], ok: 0, why: "Sfera col più, senza cilindro: ipermetropia." },
      { q: "La ricetta dice sempre che occhiale fare?", o: ["Non sempre: se non lo scrive, il tipo si sceglie con l'uso", "Sì, sempre", "Solo per le progressive"], ok: 0, why: "Spesso dice solo la forza. Se l'oculista scrive il tipo, si parte da lì." },
      { q: "Un trattino nella colonna CIL vuol dire…", o: ["Che non c'è cilindro", "Che il cilindro è da misurare", "Che quell'occhio non vede"], ok: 0, why: "Il trattino vuol dire «niente»: niente cilindro, quindi niente asse." },
    ],
    stars: ["Ricetta", "Ascolto", "Consiglio"],
  },

  /* ===================== 6 · SABATO MATTINA ===================== */
  {
    id: "o6", n: 6, cap: 1,
    title: "Sabato mattina",
    short: "Tre clienti di fila: decidi tu cosa fare.",
    customer: { name: "Sabato mattina", age: 0, job: "il negozio apre alle nove", msg: "Ogni sabato entrano clienti diversi. Oggi ne servi tre, uno dopo l'altro." },
    learn: ["Fare le domande giuste a clienti diversi", "Riconoscere quando non si vende e si manda dal medico", "Bambini e lenti a contatto: chi fa cosa"],
    cards: ["sabato"],
    pick: 3,
    dialogs: [
      {
        id: "luca", who: { name: "Luca", age: 19, job: "studente", msg: "Al cinema leggo i sottotitoli sfocati. Col telefono tutto a posto." },
        steps: [
          {
            phase: "ascolto",
            say: "Buongiorno, al cinema i sottotitoli li leggo sfocati. Col telefono invece tutto a posto.",
            choices: [
              { t: "Da quando succede? Porta occhiali? Ha mai fatto un controllo della vista?", ok: "best", reply: "Da quest'estate. Mai fatto controlli.", tip: "Quando, occhiali, ultimo controllo: le domande di sempre." },
              { t: "Al cinema si sieda nelle prime file, così i sottotitoli sono più grandi: è il trucco che usano tutti.", ok: "no", reply: "Ok… e poi?", tip: "Un consiglio pratico, ma non risolve: proponi il controllo." },
              { t: "Da come lo descrive è miope, e anche poco: di solito per i sottotitoli bastano lenti da −1,00.", ok: "grave", reply: "Come fa a saperlo?", tip: "La gradazione non la dici tu: la misura l'optometrista o l'oculista.", requires: ["ruoli"] },
            ],
          },
          {
            phase: "proposta",
            say: "E quindi?",
            choices: [
              { t: "Facciamo un controllo della vista con l'optometrista: dura una ventina di minuti e capiamo cosa serve.", ok: "best", reply: "Va bene, ho tempo.", tip: "Il prossimo passo giusto, detto in modo semplice.", requires: ["ruoli"] },
              { t: "Intanto provi questi occhiali da lettura dell'espositore: ingrandiscono, e con quelli di solito si vede meglio tutto, anche lo schermo.", ok: "no", reply: "Da lettura? Ma il telefono lo leggo bene…", tip: "Gli occhiali da lettura sono col più, per vicino: a un miope peggiorano il lontano.", requires: ["addizione"] },
              { t: "Le do delle lenti a contatto da provare, poi vediamo.", ok: "grave", reply: "Così, subito?", tip: "Le lenti a contatto le applica l'ottico abilitato, con una prova. Mai «da provare» al banco.", requires: ["lac"] },
            ],
          },
          {
            phase: "spiegazione",
            note: "Esito del controllo: −1,50 all'occhio destro, −1,25 al sinistro.",
            say: "Ma perché il telefono lo leggo e i sottotitoli no?",
            choices: [
              { t: "Da lontano il fuoco cade un po' prima del fondo dell'occhio; da vicino cade giusto. La lente col meno lo sposta al posto giusto.", ok: "best", reply: "Ah, ok. Ha senso.", tip: "La spiegazione della miopia in una frase.", requires: ["miopia"] },
              { t: "Perché lo schermo del telefono è luminoso e vicino, mentre al cinema è buio e l'occhio fa più fatica a mettere a fuoco le scritte.", ok: "no", reply: "Quindi se alzo la luminosità…?", tip: "La causa è dove cade il fuoco; il buio rende solo più evidente la sfocatura." },
              { t: "Perché è presbite.", ok: "no", reply: "A 19 anni?", tip: "La presbiopia arriva dopo i 40-45 anni, ed è da vicino.", requires: ["presbiopia"] },
            ],
          },
        ],
        end: "Luca sceglie la montatura: lenti monofocali con antiriflesso.",
      },
      {
        id: "paola", who: { name: "Paola", age: 46, job: "commerciante", msg: "Vorrei degli occhiali per leggere, quelli già pronti." },
        steps: [
          {
            phase: "ascolto",
            say: "Buongiorno, vorrei degli occhiali per leggere, quelli già pronti. Per il telefono e le etichette al supermercato.",
            choices: [
              { t: "Certo. Prima due domande: da lontano come vede? E quando ha fatto l'ultimo controllo della vista?", ok: "best", reply: "Da lontano bene. L'ultimo controllo, anni fa.", tip: "Prima di vendere anche un premontato, due domande: lontano e ultimo controllo." },
              { t: "Certo, ecco l'espositore: provi le varie gradazioni e prenda quelle con cui legge meglio, ci vuole un attimo.", ok: "ok", reply: "Questi +1,50 mi sembrano andare.", tip: "Puoi venderli, ma prima chiedi due cose: da lontano come vede, e quando ha fatto l'ultimo controllo. E se li prova, consiglia i più leggeri con cui legge bene, non i più forti." },
              { t: "Prenda i +3,00: più sono forti, meglio si legge.", ok: "grave", reply: "Così forti? Mi gira un po' la testa.", tip: "La forza non la decidi tu. E più forte non è meglio: la zona nitida si accorcia e ci si stanca.", requires: ["addizione", "ruoli"] },
            ],
          },
          {
            phase: "proposta",
            say: "Quindi prendo questi e basta?",
            choices: [
              { t: "Per leggere ogni tanto vanno bene. Le consiglio però un controllo: se i due occhi sono diversi, o c'è un po' di astigmatismo, quelli pronti non bastano.", ok: "best", reply: "Ha ragione, intanto prendo questi e prenoto il controllo.", tip: "Vendi quello che chiede, con onestà su cosa può e non può fare.", requires: ["premontati"] },
              { t: "Vanno bene per provare, ma la verità è che quelli già pronti, alla lunga, rovinano gli occhi: meglio farli su misura da noi, anche se costano un po' di più.", ok: "grave", reply: "Davvero? Li usano tutti…", tip: "Falso: i premontati non rovinano gli occhi. Hanno solo dei limiti, e quelli spieghi.", requires: ["premontati", "onesta"] },
              { t: "Sì, prenda questi e basta: sono comodi, e se vuole li può tenere su anche in macchina, così il navigatore lo legge senza toglierli.", ok: "grave", reply: "Anche in macchina?", tip: "Con la lente da lettura il lontano è sfocato: per guidare no, è pericoloso.", requires: ["addizione"] },
            ],
          },
          {
            phase: "spiegazione",
            say: "Ma perché a 46 anni? Ho sempre visto benissimo.",
            choices: [
              { t: "Quello che descrive è tipico dell'età: la lente dentro l'occhio perde elasticità e mette a fuoco da vicino sempre meno. Il controllo dirà quanto; e a questa età è utile anche una visita dall'oculista.", ok: "best", reply: "Allora sono in buona compagnia. Prenoto anche quella.", tip: "Rassicurante e giusto, senza fare diagnosi. E il consiglio della visita è un buon consiglio, non un allarme.", requires: ["presbiopia", "visita"] },
              { t: "Perché a una certa età si diventa ipermetropi: l'occhio si accorcia un po' e da vicino il fuoco va dietro. Succede quasi a tutti.", ok: "no", reply: "Iper… cosa?", tip: "Non lo sai: senza controllo non si dice. E quello che descrive somiglia alla presbiopia, che viene con l'età." },
              { t: "Perché legge spesso con poca luce, la sera: l'occhio si sforza, si stanca e col tempo la vista da vicino cala. Basta più luce.", ok: "no", reply: "Ma leggo sempre con la luce accesa.", tip: "La luce aiuta, ma la causa è il cristallino che perde elasticità." },
            ],
          },
        ],
        end: "Paola esce con i premontati e un appuntamento per il controllo della vista.",
      },
      {
        id: "giorgio", who: { name: "Giorgio", age: 63, job: "pensionato", msg: "Ho le progressive da un mese. Guardando di lato vedo sfocato, e sulle scale inciampo." },
        steps: [
          {
            phase: "ascolto",
            say: "Ho fatto le progressive un mese fa. Guardando di lato vedo sfocato, e scendendo le scale mi sembra di inciampare.",
            choices: [
              { t: "Me le fa vedere? Quando sfoca: girando gli occhi o la testa? E le scale, da che parte della lente le guarda?", ok: "best", reply: "Quando giro gli occhi. E le scale le guardo da sotto, dalla parte bassa.", tip: "Prima capisci come le usa: spesso è lì la risposta." },
              { t: "È normale, con le progressive succede a tutti nei primi mesi: se ne faccia una ragione, vedrà che piano piano passa da solo.", ok: "no", reply: "Bella risposta…", tip: "Il cliente va ascoltato, non liquidato." },
              { t: "Le lenti sono difettose: le cambiamo.", ok: "no", reply: "Difettose?", tip: "Non lo sai: prima capisci come le usa, poi l'ottico controlla misure e montatura." },
            ],
          },
          {
            phase: "spiegazione",
            say: "Quindi che devo fare?",
            choices: [
              { t: "Ai lati sfoca un po': si gira la testa, non solo gli occhi. Sulle scale si abbassa la testa e si guarda dalla parte alta, quella per lontano.", ok: "best", reply: "Ah, guardavo dalla parte per leggere! Proverò.", tip: "Spieghi l'uso giusto: la parte bassa è per vicino, sulle scale sfoca.", requires: ["progressive"] },
              { t: "Per le scale guardi dalla parte bassa della lente: è quella più forte, quindi i gradini li vede più grandi e nitidi.", ok: "grave", reply: "È proprio quello che faccio…", tip: "La parte bassa è per vicino: sulle scale sfoca. È un rischio di caduta.", requires: ["progressive"] },
              { t: "Le tolga quando cammina e le rimetta quando si siede: le progressive sono fatte per stare fermi a leggere, non per camminare o fare le scale.", ok: "no", reply: "Ma poi non vedo lontano.", tip: "Toglierle non risolve: si insegna a usarle." },
            ],
          },
          {
            phase: "proposta",
            say: "E se non mi abituo?",
            choices: [
              { t: "L'ottico controlla subito misure e montatura, e se sono giuste l'optometrista ricontrolla la gradazione.", ok: "best", reply: "Bene, così sono tranquillo.", tip: "Le misure le controlla l'ottico, la gradazione l'optometrista: tu organizzi e rassicuri.", requires: ["misure"] },
              { t: "Se non si abitua, le servono delle progressive più care: hanno le zone laterali più larghe e ci si abitua prima.", ok: "no", reply: "Ancora soldi?", tip: "È vero che le progressive di livello più alto hanno zone laterali più ampie, ma prima si controlla quello che c'è: misure e montatura." },
              { t: "Tranquillo, con le progressive ci vuole pazienza: dopo un anno ci si abitua a tutto. Intanto le porti sempre, anche se le danno fastidio.", ok: "no", reply: "Un anno?!", tip: "Di solito servono da qualche giorno a due settimane: se dopo due settimane non va, si torna e si controlla." },
            ],
          },
        ],
        end: "Giorgio prova le scale del negozio guardando dalla parte alta. Va meglio; l'ottico controlla comunque le misure.",
      },
      {
        id: "elena", who: { name: "Elena", age: 38, job: "mamma di Tommaso, 9 anni", msg: "La maestra dice che Tommaso strizza gli occhi per vedere la lavagna." },
        steps: [
          {
            phase: "ascolto",
            say: "Buongiorno. La maestra dice che mio figlio Tommaso strizza gli occhi per vedere la lavagna.",
            choices: [
              { t: "Avete già fatto una visita dall'oculista? E Tommaso si lamenta di qualcosa, a scuola o a casa?", ok: "best", reply: "Mai fatta. Lui dice che vede bene, ma si avvicina molto alla TV.", tip: "Per un bambino la prima domanda è sulla visita oculistica." },
              { t: "Facciamo subito gli occhiali, prima che peggiori: ai bambini la vista cambia in fretta, e prima si interviene meglio è.", ok: "grave", reply: "Subito? Senza visita?", tip: "Senza visita non si fanno occhiali, tanto meno a un bambino. E niente promesse su come andrà la vista.", requires: ["bambini"] },
              { t: "Alla sua età è normale, passa da solo.", ok: "grave", reply: "Quindi aspetto?", tip: "Rassicurare senza visita fa perdere tempo a un bambino: serve l'oculista.", requires: ["bambini"] },
            ],
          },
          {
            phase: "proposta",
            say: "E quindi?",
            choices: [
              { t: "Per i bambini il primo passo è la visita dall'oculista. Poi, con la ricetta, scegliamo insieme montatura e lenti.", ok: "best", reply: "Va bene, prenoto la visita.", tip: "Mandi dal medico giusto, e il dopo, montatura e lenti, lo fai tu.", requires: ["bambini"] },
              { t: "Non serve aspettare la visita: gli misuriamo noi la vista adesso, e se serve facciamo gli occhiali entro la settimana.", ok: "grave", reply: "Non serve una visita?", tip: "Nei bambini il primo passo è l'oculista: a volte servono gocce per misurare bene. Saltare la visita fa perdere tempo prezioso.", requires: ["bambini"] },
              { t: "Gli prenda direttamente le lenti a contatto: i bambini le preferiscono agli occhiali, non le rompono e giocano più tranquilli.", ok: "grave", reply: "A nove anni?", tip: "Le lenti a contatto le applica l'ottico abilitato, con una prova e dopo la visita: mai come primo passo.", requires: ["lac"] },
            ],
          },
          {
            phase: "proposta",
            note: "Dieci giorni dopo Elena torna con la ricetta dell'oculista.",
            say: "Che occhiali prendo per un bambino? Li rompe tutti. E ho sentito di lenti che fermano la miopia…",
            choices: [
              { t: "Montature flessibili e lenti che resistono agli urti, come il policarbonato. Le lenti per la miopia dei bambini la rallentano, non la fermano: se sono adatte, lo dice l'oculista.", ok: "best", reply: "Perfetto, chiedo all'oculista.", tip: "Sicurezza prima di tutto, e onestà su quello che le lenti possono fare.", requires: ["bambini"] },
              { t: "Lenti di vetro: sono le uniche che non si graffiano mai, e con un bambino che le butta dappertutto durano molto di più delle altre.", ok: "grave", reply: "Di vetro? E se cade?", tip: "Ai bambini mai lenti di vetro: in un urto si rompono. Policarbonato.", requires: ["bambini"] },
              { t: "Sì, con quelle lenti la miopia si ferma: gliele consiglio subito, così non ci pensa più.", ok: "grave", reply: "Si ferma davvero?", tip: "Promessa falsa: rallentano, non fermano. E se sono adatte lo decide l'oculista.", requires: ["bambini"] },
              { t: "Montature di metallo sottile: sono le più resistenti in assoluto e non si deformano, anche se ci si siede sopra.", ok: "no", reply: "Così sottili?", tip: "Ai bambini servono montature flessibili, che resistono ai colpi." },
            ],
          },
        ],
        end: "Tommaso sceglie una montatura blu, flessibile. Lenti in policarbonato.",
      },
      {
        id: "marta", who: { name: "Marta", age: 29, job: "impiegata", msg: "Da stamattina ho l'occhio destro rosso, mi fa male e vedo annebbiato." },
        steps: [
          {
            phase: "proposta",
            say: "Da stamattina ho l'occhio destro rosso, mi fa male e vedo un po' annebbiato. Porto le lenti a contatto: stamattina le ho tolte. Forse mi servono occhiali nuovi?",
            choices: [
              { t: "Con dolore, occhio rosso e vista annebbiata la deve vedere un medico oggi: l'oculista o il pronto soccorso, quello oculistico se c'è.", ok: "best", reply: "Addirittura oggi?", tip: "Segnali chiari: non si vende e non si misura. Medico subito.", requires: ["medico"] },
              { t: "Facciamo subito un controllo della vista con l'optometrista: se è un problema di gradazione lo vediamo in venti minuti, e poi decidiamo.", ok: "grave", reply: "Va bene, se serve…", tip: "Con dolore e occhio rosso il controllo della vista fa solo perdere tempo: medico oggi stesso.", requires: ["medico"] },
              { t: "Probabilmente è un po' di irritazione: le consiglio un collirio lenitivo, lo trova in farmacia senza ricetta. Se non passa, torni.", ok: "grave", reply: "Quale?", tip: "I farmaci non li consigli tu: è un caso per il medico.", requires: ["medico"] },
            ],
          },
          {
            phase: "spiegazione",
            say: "Ma sarà stanchezza…",
            choices: [
              { t: "Può darsi, ma dolore e vista annebbiata insieme vanno fatti vedere subito: è più sicuro. Gli occhiali li guardiamo dopo, con calma.", ok: "best", reply: "Ok, mi ha convinta.", tip: "Fermo e gentile: non spaventi, ma non lasci correre.", requires: ["medico"] },
              { t: "Può essere: allora aspetti qualche giorno e veda come va. Se tra una settimana è ancora rosso, torni e facciamo il controllo.", ok: "grave", reply: "Va bene, aspetto.", tip: "Con questi segnali aspettare può essere pericoloso.", requires: ["medico"] },
              { t: "Intanto rimetta le lenti a contatto, così almeno vede meglio mentre lavora; stasera le tolga presto e lasci riposare gli occhi per tutta la notte.", ok: "grave", reply: "Le ho tolte stamattina perché bruciava…", tip: "Con un occhio rosso e dolorante le lenti a contatto non si rimettono: si va dal medico.", requires: ["medico", "lac"] },
            ],
          },
          {
            phase: "proposta",
            say: "E dove vado, adesso?",
            choices: [
              { t: "Al pronto soccorso, quello oculistico se c'è, oppure chiami subito il suo oculista. Non rimetta le lenti a contatto: le porti con sé, con l'astuccio.", ok: "best", reply: "Vado adesso. Grazie.", tip: "Indicazione chiara e pratica, e le lenti al medico: possono servirgli.", requires: ["medico"] },
              { t: "Dal farmacista sotto casa: è più veloce del pronto soccorso, le dà qualcosa per il dolore e le dice lui se serve altro.", ok: "grave", reply: "Il farmacista?", tip: "Il farmacista non visita l'occhio: con dolore, occhio rosso e vista annebbiata serve il medico oggi.", requires: ["medico"] },
              { t: "Decida lei, non è grave.", ok: "grave", reply: "Non lo so…", tip: "«Non è grave» è una diagnosi, e qui può essere sbagliata. Serve il medico, oggi.", requires: ["medico"] },
            ],
          },
        ],
        end: "Marta va al pronto soccorso. Due giorni dopo passa a ringraziare.",
      },
    ],
    quiz: [
      { q: "Un cliente arriva con l'occhio rosso e dolore. Prima cosa?", o: ["Medico oggi stesso", "Controllo della vista", "Un collirio"], ok: 0, why: "Dolore e occhio rosso sono un caso per il medico, subito." },
      { q: "Per un bambino che strizza gli occhi, il primo passo è…", o: ["La visita dall'oculista", "Un paio di occhiali da lettura", "Le lenti a contatto"], ok: 0, why: "Nei bambini si parte dalla visita oculistica: a volte servono gocce per misurare bene." },
      { q: "Un cliente con le progressive nuove inciampa sulle scale. Cosa gli spieghi?", o: ["Abbassare la testa e guardare dalla parte alta", "Guardare dalla parte bassa", "Toglierle sempre per camminare"], ok: 0, why: "La parte bassa è per vicino: sulle scale si guarda dalla parte alta." },
      { q: "Quando si danno le lenti a contatto?", o: ["Dopo la prova con l'ottico abilitato", "Al banco, da provare", "A chi le chiede, senza altro"], ok: 0, why: "Le lenti a contatto le applica l'ottico abilitato, con una prova, meglio dopo una visita dall'oculista." },
      { q: "Le lenti per la miopia dei bambini…", o: ["La rallentano, non la fermano: decide l'oculista", "La fermano", "Non esistono"], ok: 0, why: "Rallentano il peggioramento. Se sono adatte, lo decide l'oculista.", requires: ["bambini"] },
    ],
    stars: ["Primo cliente", "Secondo cliente", "Terzo cliente"],
  },
];
