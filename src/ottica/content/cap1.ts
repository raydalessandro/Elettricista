/* Capitolo 1 · L'occhio e le lenti
   Sei livelli: miopia, ipermetropia, presbiopia, astigmatismo, la ricetta, un sabato mattina al banco.
   Chi gioca sa già vendere: qui impara l'ottica. Al banco tutte le risposte sono ben dette; le sbagliate sbagliano sull'ottica.
   Ogni livello: il cliente, poche schede da toccare, l'occhiale di prova, il dialogo al banco, le domande dal laboratorio.
   Nei livelli 1–4 la ricetta del cliente cambia a ogni partita. */
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
    tutor: "Al cliente serve un'immagine, non la lezione: «l'occhio è una macchina fotografica che non mette bene a fuoco». Tutto il resto, fuoco, lente, sfocato, si aggancia a questa immagine.",
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
      "Non serve la lente più forte: serve quella giusta. E la gradazione giusta non si indovina dal sintomo né dai decimi: si **misura**, con il controllo della vista. Con un meno di troppo il miope giovane vede nitido lo stesso, ma il cristallino lavora per compensare, e a fine giornata gli occhi sono stanchi.",
      "Una leggenda che sentirai spesso: «gli occhiali fanno peggiorare la vista». Non è vero: gli occhiali giusti non fanno peggiorare la vista, fanno vedere bene.",
    ],
    lab: "lente",
    g: [["lente divergente", "la lente col meno"], ["diottria", "il «grado»: «ho due gradi» vuol dire due diottrie"], ["sfera (SF)", "la lente col più o col meno"], ["graduato", "con la correzione della vista"]],
    teaches: ["lente-meno", "diottria", "sfera", "leggende", "misura"],
  },
  lente: {
    t: "La lente: tipo, materiale, trattamento",
    p: [
      "Una lente per una sola distanza si chiama **monofocale**: per lontano, oppure per vicino. È la lente di chi, con la correzione giusta, mette ancora a fuoco da solo a tutte le distanze: come il miope giovane, anche con l'astigmatismo. Per chi con l'età fa fatica da vicino ci sono lenti con più zone, come le progressive.",
      "Il materiale decide spessore, peso e resistenza. Si confronta con l'**indice di rifrazione**: più è alto, più la lente è sottile a parità di gradazione. La lente organica standard ha indice 1,5; per le gradazioni forti si sale a 1,6, 1,67, 1,74. Il **policarbonato**, 1,59, resiste agli urti: bambini e sport.",
      "Con poche diottrie l'indice alto toglie poco, intorno al millimetro al bordo: in una montatura chiusa quasi non si vede. Serve con le gradazioni forti, o con le montature che lasciano vedere il bordo della lente. L'indice cambia lo spessore, non la nitidezza.",
      "Sulla lente si aggiungono **trattamenti**. Il più utile quasi per tutti è l'**antiriflesso**: riduce molto i riflessi delle luci sulla lente, di sera alla guida e al computer.",
    ],
    g: [["lente monofocale", "lente per una sola distanza"], ["indice di rifrazione", "il numero del materiale: 1,5 · 1,6 · 1,67 · 1,74"], ["lente ad alto indice", "le «assottigliate»"], ["organico 1,5 (CR-39)", "la lente standard, «la plastica normale»"], ["policarbonato", "l'«infrangibile» dei clienti: resiste molto agli urti, ma non è indistruttibile"], ["calibro", "la larghezza della lente nella montatura, in millimetri"], ["antiriflesso", "il trattamento contro i riflessi"]],
    tutor: "Il materiale si sceglie insieme alla montatura: una lente forte in un calibro grande è spessa con qualunque indice, col meno al bordo, col più al centro. Più piccolo il calibro, più sottile la lente.",
    teaches: ["monofocale", "indice", "policarbonato", "antiriflesso"],
  },
  medico: {
    t: "Quando serve il medico",
    p: [
      "Prima del controllo si fanno poche domande tecniche: è l'**anamnesi**. Lontano o vicino, da quando, in che condizioni, che occhiali porta, l'ultimo controllo, e i segnali per il medico.",
      "Il **controllo della vista** misura il difetto e dice che lenti servono. La **visita** dall'oculista, il medico degli occhi, controlla la salute dell'occhio: in negozio è l'unica cosa che non si fa. A chi non fa una visita da anni, soprattutto dopo i 40, si consiglia: è un buon consiglio, non un allarme.",
      "Niente diagnosi e niente promesse sulla salute: nessuna lente e nessun trattamento «fa guarire» un difetto.",
      "**Medico oggi stesso**, prima di qualunque controllo, se il cliente ha:",
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
    g: [["anamnesi", "le domande prima del controllo"], ["oculista", "il medico degli occhi"], ["visita oculistica", "il controllo della salute dell'occhio, dal medico"], ["controllo della vista", "la misura del difetto: non è una visita medica"]],
    tutor: "Dolore o occhio rosso: non si misura e non si consiglia niente, si manda dal medico, oggi. È la regola che non ha eccezioni.",
    teaches: ["anamnesi", "medico", "onesta", "visita"],
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
      "I primi giorni, col più, il lontano può sembrare meno nitido: l'occhio impara a rilassarsi. Se dopo qualche giorno non va, si ricontrolla la misura.",
    ],
    lab: "piu",
    g: [["lente convergente", "la lente col più"]],
    tutor: "Le lenti col più ingrandiscono un po' gli occhi visti da fuori, quelle col meno li rimpiccioliscono. Il cliente lo nota allo specchio: è normale.",
    teaches: ["lente-piu"],
  },
  schermi: {
    t: "Schermi e trattamenti: cosa fanno davvero",
    p: [
      "**Antiriflesso**: riduce molto i riflessi delle luci sulla lente. Al computer e di sera si sente.",
      "**Filtro luce blu**: alcuni lo trovano piacevole, ma non è dimostrato che tolga stanchezza o mal di testa, e non ci sono prove che la luce degli schermi rovini la retina. Se il cliente lo chiede si offre, senza promesse.",
      "**Fotocromatiche**: si scuriscono al sole, con i raggi ultravioletti. Davanti allo schermo restano chiare. In macchina, dietro il parabrezza, di solito si scuriscono poco: per guidare al sole non sostituiscono l'occhiale da sole.",
      "Stanchezza e mal di testa possono dipendere dalla vista, ma hanno tante altre cause. Bruciore e «sabbia negli occhi» dopo ore allo schermo sono spesso **occhio secco**: si sbattono meno le palpebre. I colliri li decide il medico. Se l'occhio è rosso o fa male, vale l'elenco del medico.",
    ],
    g: [["filtro luce blu", "le «lenti anti luce blu» (attenzione: c'è chi chiama «lenti per il computer» anche gli occhiali per vedere bene lo schermo: chiedi cosa intende)"], ["lenti fotocromatiche", "quelle che si scuriscono al sole"], ["occhio secco", "occhi che bruciano, «sabbia negli occhi»"]],
    tutor: "Per sapere se una lente ha l'antiriflesso, guarda il riflesso di una luce: con l'antiriflesso è debole e colorato, di solito verde o azzurro, a volte viola; senza, è bianco e forte.",
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
      "Da vicino il cristallino può lavorare, purché non in fatica: sotto la scena deve dire «lavora» o «lavora poco», mai «in fatica». La lente giusta è la più leggera con cui non è in fatica: con più forza il telefono è nitido lo stesso, ma la zona nitida si accorcia e già il tablet sul tavolo sfoca.",
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
      "Si montano con misure precise, l'**altezza** e la **centratura**, prese sulla montatura scelta, indossata. Per questo la montatura deve essere abbastanza alta.",
      "Altre soluzioni: la lente **da ufficio**, per vicino e computer, comoda per tante ore alla scrivania, ma non per guidare né per camminare a lungo; la **bifocale**, con due zone soltanto, lontano e vicino, e la riga visibile.",
    ],
    lab: "progressiva",
    g: [["lente progressiva", "le multifocali"], ["lente da ufficio (occupazionale)", "quella per la scrivania"], ["bifocale", "quella con la riga"], ["centratura", "le misure che mettono la lente davanti alla pupilla"]],
    tutor: "Se un cliente non si abitua alle progressive, la prima cosa da controllare sono le misure: altezza e centratura sbagliate di pochi millimetri si sentono.",
    teaches: ["progressive", "ufficio", "misure", "bifocale"],
  },

  /* ---------- 4 · astigmatismo ---------- */
  astigmatismo: {
    t: "L'astigmatismo: due fuochi",
    p: [
      "La cornea dovrebbe essere tonda come un pallone da calcio. Nell'occhio astigmatico è un po' ovale, come un pallone da rugby: in una direzione mette a fuoco più che nell'altra.",
      "Così l'occhio ha **due fuochi** invece di uno: le righe in una direzione sono più nitide, quelle nell'altra più sfocate. Le luci di notte si allungano a striscia, e alcune lettere si confondono.",
      "Il **quadrante** è un disegno a raggiera, con righe in tutte le direzioni: chi ha l'astigmatismo ne vede alcune più nitide di altre. Si legge come un orologio: per esempio, «le più nere vanno dalle 12 alle 6».",
      "Attenzione: righe **storte** o ondulate, o una macchia al centro, comparse da poco, non sono astigmatismo. Sono un segnale per il medico, oggi stesso.",
    ],
    lab: "quadrante",
    g: [["astigmatismo", "vedo le luci allungate, alcune righe più sfocate di altre"], ["quadrante", "il disegno a raggiera"]],
    teaches: ["astigmatismo", "quadrante"],
  },
  asse: {
    t: "Il cilindro e l'asse",
    p: [
      "L'astigmatismo si corregge con il **cilindro**, CIL: una lente che ha forza in una direzione e nessuna forza in quella perpendicolare. Va girato nel verso giusto: la direzione senza forza si chiama **asse**, e si scrive in gradi d'angolo, da 0 a 180.",
      "I gradi si leggono sullo schema **TABO**, un semicerchio graduato, guardando il cliente in faccia: 0 a destra, 90 in alto, 180 a sinistra, per tutti e due gli occhi. 0 e 180 sono la stessa direzione: dopo 180 si riparte da 0, e sulla ricetta si scrive 180.",
      "Se la lente gira, la correzione non è più giusta: già 5 gradi si possono notare, con 30 gradi è come non avere il cilindro, oltre è peggio.",
    ],
    lab: "asse",
    g: [["cilindro (CIL)", "la correzione dell'astigmatismo"], ["asse", "la direzione senza forza del cilindro, in gradi d'angolo"], ["lente torica", "lente per l'astigmatismo, anche a contatto"], ["schema TABO", "il semicerchio dei gradi"]],
    teaches: ["cilindro", "asse"],
  },
  storta: {
    t: "La montatura storta",
    p: [
      "Se l'occhiale cade, o ci si siede sopra, la montatura può storcersi: acetato, metallo, anche titanio. Le lenti non stanno più dove sono state centrate. Con lenti deboli e senza cilindro spesso non si nota. Si nota con il cilindro, perché l'asse gira; con le lenti forti; con le progressive, perché la zona per leggere si sposta.",
      "Quando un cliente dice «da quando sono caduti vedo male», prima si guarda l'occhiale. Si raddrizza la montatura: appoggiata capovolta sul banco deve toccare con tutte e due le aste; poi naselli e terminali. L'acetato si scalda prima di piegarlo, con le lenti lontane dal calore: col caldo l'antiriflesso si crepa. Il metallo si regola a freddo, con le pinze. Alla fine si ricontrolla la lente al **frontifocometro**.",
    ],
    lab: "storta",
    g: [["regolazione", "sistemare l'occhiale sul viso"], ["frontale", "la parte davanti, che tiene le lenti"], ["naselli", "i cuscinetti che poggiano sul naso"], ["terminali", "le punte delle aste, dietro le orecchie"], ["acetato (di cellulosa)", "il «cello»: la montatura in plastica che si scalda per regolarla"], ["frontifocometro", "lo strumento che legge la forza e l'asse di una lente"]],
    tutor: "Il consiglio che evita di rifare il lavoro: toglierli sempre con due mani, dalle aste, e tenerli nell'astuccio rigido quando non si portano.",
    teaches: ["montatura", "regolazione"],
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
    after: ["Il cilindro si può scrivere anche col più: è la stessa lente, scritta in un altro modo (**trasposizione**). Nuova sfera = sfera + cilindro; il cilindro cambia segno; l'asse gira di 90°. Esempio: +1,00 −0,75 × 90 diventa +0,25 +0,75 × 180."],
    lab: "ricetta",
    g: [["OD / OS / OO", "occhio destro / sinistro / tutti e due"], ["SF, CIL, AX", "sfera, cilindro, asse"], ["trasposizione", "riscrivere il cilindro col segno opposto"]],
    tutor: "Molti oculisti scrivono il cilindro col più, molti listini lo vogliono col meno: la trasposizione è un conto da fare a occhi chiusi. Se un numero sembra strano, si sente l'oculista che ha scritto la ricetta: mai dire al cliente «è sbagliata».",
    teaches: ["ricetta", "trasposizione"],
  },
  soluzioni: {
    t: "Una ricetta, tanti occhiali",
    p: [
      "Spesso la ricetta dice solo la **forza** delle lenti. Con la stessa forza si fanno occhiali da lontano, da vicino, progressivi o da ufficio.",
      "Se l'oculista scrive anche il tipo di occhiale, si parte da lì. Se non lo scrive, decide l'uso: cosa fa il cliente durante il giorno, e a che distanze. Guida, computer, lettura, lavoro, sport.",
    ],
    tutor: "Chiedi sempre la data della ricetta e gli occhiali che porta: misurali al frontifocometro. Dicono cosa portava prima, e quanto cambia.",
    teaches: ["soluzioni"],
  },

  /* ---------- 6 · sabato mattina ---------- */
  sabato: {
    t: "Cose da sapere al banco",
    ol: [
      "**Medico oggi stesso**, prima di qualunque controllo: dolore o occhio rosso; occhio rosso o dolente con le lenti a contatto (le toglie, non le rimette, le porta al medico con l'astuccio); lampi, «mosche» nuove, una tenda; vista calata all'improvviso o doppia; mal di testa forte con vista annebbiata; righe storte o una macchia al centro; un colpo all'occhio.",
      "**Bambini**: il primo passo è la visita dall'oculista, perché a volte servono gocce che rilassano il cristallino per misurare bene. Poi montature flessibili e lenti che resistono agli urti, come il **policarbonato**. Mai lenti di vetro. Per i bambini miopi ci sono lenti che rallentano il peggioramento, non lo fermano: se sono adatte, lo decide l'oculista.",
      "**Lenti a contatto**: si applicano con una prova vera e i controlli che servono, meglio dopo una visita dall'oculista. Mai «da provare» a casa.",
    ],
    after: ["Il medico è l'oculista, o il pronto soccorso: quello oculistico, dove c'è."],
    g: [["pronto soccorso oculistico", "il pronto soccorso degli occhi"], ["gocce (cicloplegico)", "le gocce che rilassano il cristallino per misurare la vista ai bambini"]],
    tutor: "Con un bambino la regola è una: prima la visita. Con un occhio rosso e dolente un'altra: prima il medico, oggi.",
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
    short: "Miopia e lente col meno. Monofocali, materiali, antiriflesso.",
    customer: marco,
    learn: ["Come mette a fuoco l'occhio", "Cos'è la miopia e cosa fa la lente col meno", "Monofocali, indice del materiale, antiriflesso; quando serve il medico"],
    cards: ["occhio", "miopia", "lentemeno", "lente", "medico"],
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
          phase: "anamnesi",
          say: "Buongiorno. Da qualche settimana non leggo il tabellone dei treni. Mi sa che mi servono gli occhiali.",
          choices: [
            { t: "Da vicino, col telefono o sui libri, come va? E le capita di più la sera, o anche di giorno?", ok: "best", reply: "Da vicino benissimo. È da lontano: il tabellone, i cartelli, la lavagna a lezione. La sera un po' di più.", tip: "«Da vicino bene, da lontano no» è il quadro tipico della miopia. E la sera la pupilla, il foro nero al centro dell'occhio, si allarga: una miopia leggera si sente di più.", requires: ["anamnesi"] },
            { t: "Allora partiamo dal controllo della vista: è lì che vediamo di quanto si tratta.", ok: "ok", reply: "Va bene… comunque da vicino ci vedo benissimo, è da lontano il problema.", tip: "Il controllo serve, ma prima l'anamnesi: lontano o vicino, da quando, in che condizioni. Orienta la misura.", requires: ["anamnesi"] },
            { t: "Dal tabellone, di solito è una miopia leggera, intorno a −2,50: alla sua età è il caso più frequente.", ok: "grave", reply: "Ah. E come fa a saperlo da qui?", tip: "La gradazione non si indovina dal sintomo né dall'età: si misura, con il controllo della vista.", requires: ["misura"] },
            { t: "Con molte ore sui libri, spesso gli occhi si affaticano e da lontano mettono a fuoco peggio: di solito è stanchezza.", ok: "no", reply: "Quindi passa da solo, se riposo?", tip: "Stanchezza e vista sfocata da lontano non sono la stessa cosa: un tabellone che non si legge più fa pensare a una miopia, e va misurato.", requires: ["miopia"] },
          ],
        },
        {
          phase: "anamnesi",
          choices: [
            { t: "Ha mai portato occhiali o lenti a contatto? E l'ultimo controllo della vista, quando l'ha fatto?", ok: "best", reply: "Mai portati. Un controllo l'ho fatto alle medie, credo.", tip: "Occhiali di prima e ultimo controllo dicono se il difetto è nuovo o se sta cambiando: è la storia visiva del cliente.", requires: ["anamnesi"] },
            { t: "Quanti decimi le sembra di vedere da lontano? Da quel numero si capisce già, più o meno, la gradazione.", ok: "no", reply: "Boh, sei? Sette?", tip: "I decimi dicono quanto si vede, non quanta lente serve: la gradazione si misura.", requires: ["decimi", "misura"] },
            { t: "Le capita di avere gli occhi stanchi, la sera? La miopia, di solito, viene dalla stanchezza degli occhi.", ok: "no", reply: "A volte. Quindi è stanchezza?", tip: "La miopia viene da un occhio un po' lungo, o da cornea e cristallino un po' forti: non dalla stanchezza.", requires: ["miopia"] },
          ],
        },
        {
          phase: "spiegazione",
          note: "Marco fa il controllo della vista: occhio destro {od}, sinistro {os}. Torna al banco.",
          say: "Quindi sono miope? Ma perché da vicino vedo bene e da lontano no?",
          choices: [
            { t: "Sì, un po' di miopia. Da lontano il fuoco cade un po' prima del fondo dell'occhio; da vicino i raggi arrivano aperti e cade giusto. La lente col meno lo sposta al posto giusto.", ok: "best", reply: "Ah, ecco. Come una macchina fotografica sfocata.", tip: "Il fuoco al centro, e la lente che lo sposta: è tutta l'ottica della miopia in una frase. L'immagine fa da ancoraggio: la ritroverà quando metterà gli occhiali.", requires: ["miopia", "lente-meno"] },
            { t: "È un po' di vista stanca: con tante ore sui libri il cristallino resta contratto, e da lontano non riesce più a rilassarsi del tutto.", ok: "no", reply: "Vista stanca? Pensavo fosse una cosa da anziani.", tip: "«Vista stanca» è il nome comune della presbiopia, che arriva dopo i 40 e riguarda il vicino. Qui la misura dice miopia: il fuoco cade davanti alla retina." },
            { t: "Spesso è la cornea che cambia forma: per sicurezza le consiglio una visita presto, a volte è l'inizio di qualcosa da seguire.", ok: "grave", reply: "Qualcosa da seguire? Mi preoccupa.", tip: "Diagnosi senza nessun segnale: una miopia leggera è comunissima. La visita si consiglia come buona abitudine, non come allarme.", requires: ["visita"] },
          ],
        },
        {
          phase: "spiegazione",
          say: "Devo portarli sempre? Ho letto che se li porti la miopia peggiora.",
          choices: [
            { t: "No, gli occhiali non fanno peggiorare la miopia. Li porti quando deve vedere bene da lontano; per leggere può toglierli.", ok: "best", reply: "Ok, chiaro.", tip: "Leggenda smontata con un fatto, poi un uso pratico. Con una miopia leggera da vicino si vede bene anche senza: l'hai visto nel laboratorio.", requires: ["leggende"] },
            { t: "In parte è vero: se li porta sempre, l'occhio tende ad abituarsi. Di solito conviene metterli solo quando servono davvero.", ok: "grave", reply: "Ah… quindi meglio usarli poco?", tip: "È una leggenda: l'occhio miope non si «abitua» né si «allena». Portarli o no non cambia la miopia di un adulto, cambia quanto vede bene.", requires: ["leggende"] },
            { t: "Di solito conviene portarli sempre, anche per leggere: toglierli e rimetterli spesso tende a far peggiorare la miopia.", ok: "grave", reply: "Anche per il telefono? Ma da vicino vedo benissimo.", tip: "Anche questa è una leggenda: toglierli e rimetterli non fa peggiorare niente.", requires: ["leggende"] },
          ],
        },
        {
          phase: "soluzione",
          say: "Che lenti mi consiglia? Studio, e la sera guido.",
          choices: [
            { t: "Monofocali per lontano, in materiale standard: con questa gradazione sono già sottili. E l'antiriflesso, che di sera alla guida riduce i riflessi delle luci.", ok: "best", reply: "Perfetto, mi sembra giusto.", tip: "Lente semplice per un difetto semplice, e un trattamento legato a quello che ti ha detto: la guida di sera. Con poche diottrie l'indice alto non serve.", requires: ["monofocale", "indice", "antiriflesso"] },
            { t: "Le progressive: con una lente sola copre tutte le distanze, e quando arriverà l'età per leggere sarà già a posto.", ok: "no", reply: "Progressive? Ma a me serve solo da lontano.", tip: "Le progressive servono quando, con l'età, il cristallino non mette più a fuoco da vicino. A 24 anni il vicino lo fa il cristallino: basta una monofocale.", requires: ["monofocale"] },
            { t: "Ad alto indice, 1,67: più sottili, e da lontano vede anche più nitido.", ok: "no", reply: "Più nitido? Pensavo cambiasse solo lo spessore.", tip: "L'indice cambia lo spessore, non la nitidezza. E con poche diottrie la lente standard è già sottile: l'indice alto toglie poco, intorno al millimetro al bordo.", requires: ["indice"] },
            { t: "Con il filtro luce blu: per chi studia sugli schermi rallenta la miopia, ed è una protezione in più.", ok: "grave", reply: "Davvero? Allora sì.", tip: "Promessa falsa sulla salute: il filtro luce blu non rallenta né ferma la miopia.", requires: ["onesta"] },
          ],
        },
      ],
      end: "Marco sceglie la montatura. Si prendono le misure per centrare le lenti: tra qualche giorno gli occhiali sono pronti.",
    }],
    quiz: [
      { q: "Il cliente vede male da lontano e bene da vicino. Che difetto fa pensare?", o: ["Miopia", "Nessun difetto: da vicino vede bene", "Occhi stanchi per lo studio"], ok: 0, why: "«Da vicino bene, da lontano no» è la frase tipica del miope. La conferma la dà il controllo della vista." },
      { q: "Com'è fatta una lente col meno?", o: ["Sottile al centro, spessa al bordo", "Spessa al centro, sottile al bordo", "Uguale dappertutto"], ok: 0, why: "La lente divergente, col meno, è più spessa al bordo." },
      { q: "La gradazione giusta…", o: ["Si misura con il controllo della vista", "Si capisce dal sintomo che racconta il cliente", "Si sceglie provando gli occhiali in vetrina"], ok: 0, why: "Il sintomo orienta, l'età pure: la gradazione si misura.", requires: ["misura"] },
      { q: "Con una lente col meno troppo forte, un miope giovane…", o: ["Vede nitido, ma il cristallino lavora e si stanca", "Vede sfocato", "Vede meglio e basta"], ok: 0, why: "L'occhio giovane compensa accomodando: nitido sì, rilassato no." },
      { q: "«Ho due gradi», dice il cliente. Di cosa parla?", o: ["Delle diottrie della sua lente", "Dell'asse del cilindro", "Dei decimi che vede"], ok: 0, why: "Il «grado» dei clienti è la diottria. I decimi dicono quanto si vede: sono un'altra cosa.", requires: ["diottria", "decimi"] },
      { q: "Il controllo della vista…", o: ["Misura il difetto, ma non è una visita medica", "Sostituisce la visita dall'oculista", "Serve solo per le lenti a contatto"], ok: 0, why: "Misura quanto correggere. La salute dell'occhio la controlla l'oculista.", requires: ["visita"] },
      { q: "Con una miopia leggera, conviene una lente ad alto indice?", o: ["Di solito no: la lente standard è già sottile", "Sì, sempre: è più leggera", "Sì, perché fa vedere più nitido"], ok: 0, why: "L'indice alto assottiglia le lenti forti; con poche diottrie toglie poco, intorno al millimetro al bordo. La nitidezza non cambia.", requires: ["indice"] },
    ],
    stars: ["Occhio", "Spiegazione", "Soluzione"],
  },

  /* ===================== 2 · IPERMETROPIA ===================== */
  {
    id: "o2", n: 2, cap: 1,
    title: "Ci vedo benissimo, ma che fatica",
    short: "Ipermetropia e lente col più. Trattamenti senza promesse.",
    customer: giulia,
    learn: ["Perché l'ipermetrope vede nitido ma si stanca", "Cosa fa la lente col più", "Antiriflesso, luce blu, fotocromatiche: cosa fanno davvero"],
    cards: ["ipermetropia", "lentepiu", "schermi"],
    prova: {
      type: "sfera",
      goal: "Metti in prova la lente con cui il lontano resta nitido e il cristallino riposa. Poi guarda il computer: il cristallino lavora molto meno.",
      bet: { q: "Il controllo dice che Giulia è ipermetrope, ma lei vede nitido da lontano e da vicino. A cosa serve allora la lente?", o: ["Col più: fa il lavoro al posto del cristallino, che così riposa", "A niente: vede già bene", "Col meno: per vedere ancora meglio"], ok: 0, why: "Vede nitido perché il cristallino lavora sempre. La lente col più lo fa riposare." },
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
          phase: "anamnesi",
          say: "Buonasera! La sera ho gli occhi che bruciano e a volte mal di testa. Però ci vedo benissimo, eh.",
          choices: [
            { t: "Mi racconta una sua giornata? Quante ore al computer, e a che distanza tiene lo schermo?", ok: "best", reply: "Otto, nove ore. Lo schermo a una sessantina di centimetri, più il telefono.", tip: "Fastidi che arrivano la sera, dopo ore da vicino: la domanda tecnica è quanto e a che distanza lavora l'occhio." },
            { t: "Se ci vede bene, spesso la vista non c'entra: di solito è la stanchezza del lavoro, e le pause aiutano.", ok: "no", reply: "Mmh. Le pause le faccio già.", tip: "Vedere nitido non vuol dire non avere difetti: l'ipermetrope giovane vede bene facendo lavorare il cristallino, e la fatica arriva la sera.", requires: ["ipermetropia"] },
            { t: "Dai sintomi sembra un'ipermetropia: di solito in questi casi si parte da +1,00, poi il controllo ci dirà.", ok: "grave", reply: "Da +1,00? Come fa a dirlo?", tip: "Il sospetto si può avere, il numero no: la gradazione si misura, non si indovina dal sintomo.", requires: ["misura"] },
            { t: "Per chi lavora al computer c'è il filtro luce blu: riduce la luce che stanca gli occhi, e spesso il mal di testa passa.", ok: "grave", reply: "Ah sì? Funziona?", tip: "Non è dimostrato che il filtro luce blu tolga stanchezza o mal di testa: offrirlo si può, prometterlo no.", requires: ["luce-blu"] },
          ],
        },
        {
          phase: "anamnesi",
          choices: [
            { t: "Il mal di testa è forte? Le capita di vedere doppio, lampi di luce, o la vista che si annebbia?", ok: "best", reply: "No, niente di strano. È un cerchio alla fronte, la sera.", tip: "Con il mal di testa la prima cosa da escludere sono i segnali per il medico. Qui non ci sono.", requires: ["medico"] },
            { t: "Porta già occhiali? E quando ha fatto l'ultimo controllo della vista?", ok: "ok", reply: "Mai portati. Il controllo… forse cinque anni fa, per la patente.", tip: "Domanda utile, ma con il mal di testa prima si escludono i segnali per il medico: è forte? Vista doppia, lampi, vista annebbiata?", requires: ["medico"] },
            { t: "Allora è la luce degli schermi, che a lungo affatica la retina: nel fine settimana è meglio staccare dal computer.", ok: "no", reply: "Magari… ma il lunedì ricomincia uguale.", tip: "Non ci sono prove che gli schermi danneggino la retina, e il riposo del fine settimana non risolve una fatica di tutti i giorni: prima si misura.", requires: ["luce-blu"] },
            { t: "Allora un paio di occhiali da lettura per il computer: ingrandiscono un po', e gli occhi si rilassano.", ok: "no", reply: "Da lettura? Ho 31 anni…", tip: "Senza controllo non sai cosa serve, e gli occhiali già pronti sono pensati per chi, con l'età, non mette più a fuoco da vicino." },
          ],
        },
        {
          phase: "spiegazione",
          note: "Giulia fa il controllo della vista: ipermetropia, {rx} per occhio.",
          say: "Ipermetropia? Ma io ci vedo benissimo, anche da lontano!",
          choices: [
            { t: "Ci vede bene perché il cristallino lavora sempre per mettere a fuoco, e al computer ancora di più: per questo la sera è stanca. La lente col più lavora al posto suo.", ok: "best", reply: "Ah, quindi gli occhi non riposano mai.", tip: "Le tre cose giuste, nell'ordine giusto: perché vede bene, perché si stanca, cosa fa la lente. È un ricalco del suo «ci vedo benissimo», e nessuna promessa sul mal di testa.", requires: ["ipermetropia", "fatica", "lente-piu"] },
            { t: "Vuol dire che da lontano vede un po' meno di quanto pensa: il cervello si è abituato, e non se ne accorge più.", ok: "no", reply: "Ma no, leggo le targhe da lontanissimo!", tip: "Falso: l'ipermetrope giovane da lontano vede davvero nitido. Il problema è il lavoro continuo del cristallino, non la nitidezza." },
            { t: "È il contrario della miopia, e da adulti spesso si riduce da sola: se non dà troppo fastidio, si può aspettare.", ok: "grave", reply: "Passa? Allora aspetto.", tip: "Da adulti non passa: con l'età il cristallino compensa sempre meno, e l'ipermetropia si sente di più. Niente previsioni false sulla vista.", requires: ["onesta"] },
          ],
        },
        {
          phase: "spiegazione",
          say: "Quindi li devo portare sempre? Per lavorare o per tutto?",
          choices: [
            { t: "Con questa ipermetropia di solito conviene portarli sempre, anche da lontano: così il cristallino si rilassa davvero. I primi giorni il lontano può sembrare meno nitido.", ok: "best", reply: "Ok, ci provo.", tip: "Indicazione chiara e un avviso sui primi giorni: chi sa cosa aspettarsi non si spaventa, e non li lascia nel cassetto.", requires: ["lente-piu"] },
            { t: "Li porti quando ha mal di testa o gli occhi stanchi: negli altri momenti l'occhio fa da solo.", ok: "no", reply: "Tipo un'aspirina?", tip: "Gli occhiali non sono un farmaco al bisogno: servono a non affaticare l'occhio mentre lavora, prima che arrivi il mal di testa.", requires: ["fatica"] },
            { t: "Meglio portarli sempre, dalla mattina alla sera: se li toglie e li rimette, l'occhio si vizia e poi non ne fa più a meno.", ok: "grave", reply: "Si vizia?", tip: "Leggenda: l'occhio non si «vizia». Abituato a riposare, senza occhiali sente la fatica che faceva prima: non è peggiorato.", requires: ["leggende"] },
          ],
        },
        {
          phase: "soluzione",
          say: "Per lo schermo mi conviene qualche trattamento? E la sera gli occhi mi bruciano.",
          choices: [
            { t: "L'antiriflesso, che riduce molto i riflessi delle luci sulla lente. Il filtro luce blu c'è, ma non è dimostrato che tolga la stanchezza. Per il bruciore, se continua, ne parli con l'oculista.", ok: "best", reply: "L'antiriflesso sì. Il filtro ci penso.", tip: "Ogni trattamento per quello che fa davvero, e il bruciore a chi lo può valutare: può essere occhio secco.", requires: ["antiriflesso", "luce-blu", "occhio-secco"] },
            { t: "Il filtro luce blu, con otto ore di schermo: col tempo la luce blu affatica la retina, e il filtro la protegge.", ok: "grave", reply: "Addirittura?", tip: "Paura senza prove: non è dimostrato che la luce degli schermi rovini la retina.", requires: ["luce-blu"] },
            { t: "Le fotocromatiche: si scuriscono da sole quando c'è più luce, anche davanti allo schermo, e gli occhi riposano.", ok: "no", reply: "Davanti allo schermo? Pensavo al sole.", tip: "Le fotocromatiche reagiscono agli ultravioletti del sole: davanti allo schermo restano chiare.", requires: ["fotocromatiche"] },
            { t: "Per il bruciore, di solito un collirio idratante aiuta: si trova in farmacia, senza ricetta.", ok: "grave", reply: "Quale?", tip: "Consigliare un collirio vuol dire aver già deciso la causa: il bruciore lo valuta il medico.", requires: ["occhio-secco"] },
          ],
        },
      ],
      end: "Giulia sceglie una montatura leggera, con lenti antiriflesso. Si prendono le misure.",
    }],
    quiz: [
      { q: "Un ipermetrope giovane, da lontano…", o: ["Spesso vede nitido, ma il cristallino lavora sempre", "Vede sempre sfocato", "Vede sfocato solo di sera"], ok: 0, why: "Il cristallino giovane compensa: nitido sì, ma l'occhio non riposa mai." },
      { q: "Com'è fatta una lente col più?", o: ["Spessa al centro, sottile al bordo", "Sottile al centro, spessa al bordo", "Piatta"], ok: 0, why: "La lente convergente, col più, è più spessa al centro." },
      { q: "Il filtro luce blu…", o: ["Si offre senza promesse: non è dimostrato che tolga la stanchezza", "Toglie il mal di testa da schermo", "Protegge la retina da danni sicuri"], ok: 0, why: "Si può offrire, ma senza promettere effetti sulla salute che non sono dimostrati." },
      { q: "Le lenti fotocromatiche si scuriscono…", o: ["Al sole, con i raggi ultravioletti", "Davanti allo schermo", "Sempre allo stesso modo, anche in macchina"], ok: 0, why: "Reagiscono agli ultravioletti: davanti allo schermo restano chiare, e dietro il parabrezza di solito si scuriscono poco." },
      { q: "Come riconosci a colpo d'occhio una lente con l'antiriflesso?", o: ["Il riflesso di una luce è debole e colorato", "La lente è leggermente gialla", "Il riflesso è bianco e forte"], ok: 0, why: "L'antiriflesso lascia un riflesso debole, di solito verde o azzurro.", requires: ["antiriflesso"] },
    ],
    stars: ["Occhio", "Spiegazione", "Soluzione"],
  },

  /* ===================== 3 · PRESBIOPIA ===================== */
  {
    id: "o3", n: 3, cap: 1,
    title: "Il braccio troppo corto",
    short: "Presbiopia, addizione, lettura e progressive.",
    customer: franco,
    learn: ["Perché dopo i 40-45 anni si allontana il telefono", "L'addizione per vicino, e perché più forte non è meglio", "Occhiali da lettura, progressive, lenti da ufficio e bifocali: quando ognuno"],
    cards: ["presbiopia", "lettura", "progressive"],
    prova: {
      type: "vicino",
      goal: "Trova l'addizione per leggere il telefono a 35 cm: nitido, comodo, e non più forte del necessario.",
      bet: { q: "Il controllo dice che Franco è presbite e che da lontano non ha difetti. Che lente serve per leggere?", o: ["Col più, solo per vicino", "Col meno, come per la miopia", "Nessuna: deve allenare gli occhi"], ok: 0, why: "Il cristallino non accomoda più abbastanza: una lente col più fa il lavoro che manca." },
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
          phase: "anamnesi",
          say: "Buongiorno. Per leggere il telefono devo allungare il braccio. Mi dicono che è la presbiopia: posso prendere quelli della farmacia?",
          choices: [
            { t: "Per alcuni usi possono andare: mi aiuti a capire. Come passa la giornata? Guida tanto? Legge, usa il computer?", ok: "best", reply: "Guido tutto il giorno, dai clienti. Tablet per gli ordini, telefono, e la sera il giornale.", tip: "Le distanze di lavoro decidono la lente: lontano per la guida, intermedio per tablet e cruscotto, vicino per telefono e giornale." },
            { t: "Quelli della farmacia, alla lunga, tendono a rovinare la vista, perché la forza non è precisa: per questo conviene farli su misura.", ok: "grave", reply: "Ah sì? Mia moglie li usa da anni…", tip: "Falso: i premontati non rovinano la vista. Hanno dei limiti, ed è quelli che si spiegano.", requires: ["premontati", "onesta"] },
            { t: "Per alcuni usi sì: alla sua età di solito va bene un +2,50, e in farmacia lo trova.", ok: "grave", reply: "+2,50? Va bene, se lo dice lei.", tip: "La forza non si indovina dall'età, e senza controllo non sai se i due occhi sono uguali o se c'è un difetto anche da lontano.", requires: ["misura"] },
          ],
        },
        {
          phase: "anamnesi",
          choices: [
            { t: "Da lontano come vede? Porta occhiali, e l'ultimo controllo quando l'ha fatto?", ok: "best", reply: "Da lontano benissimo. Occhiali mai, controllo… non ricordo.", tip: "Se c'è anche un difetto da lontano, la lente da lettura da sola non basta: serve saperlo prima." },
            { t: "Se vuole, intanto prendiamo le misure per le progressive; poi facciamo il controllo.", ok: "no", reply: "Già? Non serve prima il controllo?", tip: "Prima il controllo e la montatura: altezza e centratura si prendono sulla montatura scelta, indossata.", requires: ["misure"] },
            { t: "Le bruciano gli occhi, la sera? Spesso la presbiopia viene insieme all'occhio secco.", ok: "no", reply: "No, bruciare no.", tip: "La presbiopia viene dal cristallino che perde elasticità, non dall'occhio secco. Qui servono occhiali attuali e ultimo controllo.", requires: ["presbiopia"] },
          ],
        },
        {
          phase: "spiegazione",
          say: "Ma perché adesso? Fino all'anno scorso leggevo benissimo.",
          choices: [
            { t: "Quello che descrive è tipico dell'età: la lente dentro l'occhio diventa meno elastica e mette a fuoco da vicino sempre meno. Il controllo ci dirà quanto; e a questa età è utile anche una visita dall'oculista.", ok: "best", reply: "Ah, quindi è normale. Faccio il controllo, e prenoto anche l'oculista.", tip: "Spieghi senza fare diagnosi: «tipico dell'età», e il controllo dirà quanto. Dopo i 40 una visita è un buon consiglio.", requires: ["presbiopia", "visita"] },
            { t: "Di solito verso i cinquant'anni si diventa un po' miopi: la vista si sposta, e da vicino si comincia a fare fatica.", ok: "no", reply: "Miope? Ma da lontano vedo bene.", tip: "La miopia è da lontano. La presbiopia è da vicino, e viene con l'età." },
            { t: "Spesso dipende dal telefono: a forza di usarlo, da vicino la vista si stanca. Usandolo un po' meno, di solito migliora.", ok: "no", reply: "Quindi se lo uso meno passa?", tip: "No: il telefono non c'entra e non passa. È il cristallino che perde elasticità." },
          ],
        },
        {
          phase: "soluzione",
          note: "Franco fa il controllo della vista: da lontano niente da correggere, per vicino {add}.",
          say: "Allora: occhiali da lettura, o le progressive di cui parlano tutti?",
          choices: [
            { t: "Per come usa la vista, le progressive: lontano, tablet e telefono con lo stesso occhiale. Se leggesse solo il giornale la sera, basterebbero quelli da lettura.", ok: "best", reply: "Sì, in macchina toglierli e metterli sarebbe un problema.", tip: "Soluzione legata alle distanze che ti ha raccontato, e onesta sull'alternativa più semplice.", requires: ["progressive", "addizione"] },
            { t: "Quelli da lettura: li può tenere anche in macchina, così il telefono e il tablet li vede al volo.", ok: "grave", reply: "Con quelli da lettura vedo la strada?", tip: "No: con la lente da lettura il lontano è sfocato. Per guidare non vanno: è una questione di sicurezza.", requires: ["addizione"] },
            { t: "Una bifocale: lontano sopra e vicino sotto, e al centro una zona per il cruscotto, senza riga visibile.", ok: "no", reply: "Tre zone in una lente?", tip: "La bifocale ha due zone soltanto, lontano e vicino, e la riga si vede: la zona intermedia per tablet e cruscotto ce l'ha la progressiva.", requires: ["bifocale"] },
          ],
        },
        {
          phase: "spiegazione",
          say: "Mi hanno detto che con le progressive ci si mette tanto ad abituarsi…",
          choices: [
            { t: "Di solito da qualche giorno a due settimane. All'inizio ai lati sfoca un po': si gira la testa, e sulle scale si guarda dalla parte alta. Prima di guidare, ci prenda la mano a piedi.", ok: "best", reply: "Ok, se so cosa aspettarmi va bene.", tip: "Spiegare l'adattamento prima evita il ritorno arrabbiato dopo. Se dopo due settimane non va, si controllano misure e montatura.", requires: ["progressive"] },
            { t: "Con le progressive di oggi, di solito ci si abitua subito, già in negozio: le zone sfocate ai lati non ci sono più.", ok: "no", reply: "Meglio così!", tip: "Falso: ogni progressiva, anche la migliore, ha ai lati zone sfocate; per abituarsi servono da qualche giorno a due settimane.", requires: ["progressive"] },
            { t: "Ci si abitua solo portandole sempre: se dopo qualche giorno non si trova, di solito è perché non le ha portate abbastanza.", ok: "no", reply: "Quindi sarebbe colpa mia?", tip: "Portarle con continuità aiuta. Ma se dopo due settimane non va, si controllano misure e montatura: altezza e centratura sbagliate si sentono.", requires: ["misure"] },
          ],
        },
      ],
      end: "Franco sceglie una montatura abbastanza alta per la progressiva. Si prendono le misure: altezza e centratura.",
    }],
    quiz: [
      { q: "Verso che età arriva di solito la presbiopia?", o: ["Dopo i 40-45 anni", "Dopo i 20", "Dopo i 70"], ok: 0, why: "Il cristallino perde elasticità con gli anni: di solito ci si accorge dopo i 40-45." },
      { q: "Con gli occhiali da lettura, da lontano…", o: ["Si vede sfocato", "Si vede meglio", "Si vede uguale"], ok: 0, why: "La lente da lettura è fatta per vicino: da lontano sfoca. Per guidare non va." },
      { q: "Nella lente progressiva, la zona per leggere sta…", o: ["In basso", "In alto", "Ai lati"], ok: 0, why: "In alto lontano, al centro intermedio, in basso vicino." },
      { q: "Ai lati della progressiva si vede un po' sfocato. Cosa consigli?", o: ["Girare la testa, non solo gli occhi", "Guardare sempre dalla parte bassa", "Cambiare subito le lenti"], ok: 0, why: "Le zone laterali sono il prezzo della progressione: si gira la testa." },
      { q: "La lente da ufficio va bene per guidare?", o: ["No: il lontano è sfocato", "Sì, è la più comoda", "Solo di notte"], ok: 0, why: "È fatta per vicino e computer: alla guida il lontano è sfocato.", requires: ["ufficio"] },
    ],
    stars: ["Occhio", "Spiegazione", "Soluzione"],
  },

  /* ===================== 4 · ASTIGMATISMO ===================== */
  {
    id: "o4", n: 4, cap: 1,
    title: "Le luci che si allungano",
    short: "Astigmatismo, cilindro e asse. La montatura storta.",
    customer: sara,
    learn: ["Cos'è l'astigmatismo: due fuochi", "Il cilindro e l'asse sullo schema TABO", "Perché una montatura storta fa vedere peggio, e come si raddrizza"],
    cards: ["astigmatismo", "asse", "storta"],
    prova: {
      type: "asse",
      goal: "Gira la lente finché il quadrante è nitido in tutte le direzioni.",
      bet: { q: "Nell'occhiale di prova di Sara sfera e cilindro sono giusti. Se il cilindro è girato di 30 gradi rispetto all'asse giusto, cosa succede?", o: ["È come non avere il cilindro", "Niente: sfera e cilindro sono giusti", "Vede doppio da un occhio"], ok: 0, why: "Con 30 gradi di errore il cilindro non corregge più: è come non averlo. Per questo l'asse va trovato con precisione." },
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
          phase: "anamnesi",
          say: "Ciao. Questi occhiali li ho da un anno. Da quando mi sono caduti vedo peggio, soprattutto le luci di notte: si allungano.",
          choices: [
            { t: "Me li fa vedere? E intanto mi racconta cosa vede di diverso rispetto a prima della caduta?", ok: "best", reply: "Eccoli. Prima vedevo bene. Ora alcune righe sono più sfocate di altre, e mi stanco.", tip: "Il sintomo è arrivato con la caduta: la prima cosa da guardare è l'occhiale, non l'occhio.", requires: ["montatura"] },
            { t: "Dopo un anno è normale che la vista cambi un po': facciamo un controllo e, se serve, rifacciamo le lenti.", ok: "no", reply: "Lenti nuove? Ma li ho da un anno.", tip: "Il sintomo è arrivato con la caduta, non con il tempo: prima si guarda l'occhiale.", requires: ["montatura"] },
            { t: "Le luci che si allungano possono essere un segnale da non sottovalutare: meglio farsi vedere subito, al pronto soccorso.", ok: "no", reply: "Oddio, al pronto soccorso?", tip: "Allarme inutile: dopo una caduta, prima si guarda l'occhiale. Se con l'occhiale dritto vede ancora male, allora controllo e, se serve, medico. Subito dal medico con dolore, occhio rosso, lampi, una tenda, un calo improvviso.", requires: ["medico"] },
          ],
        },
        {
          phase: "spiegazione",
          note: "Appoggi l'occhiale sul banco: la montatura è storta, una lente sta più in alto dell'altra.",
          say: "È grave? Sulla ricetta ho anche il cilindro, se ricordo bene.",
          choices: [
            { t: "La montatura si è storta, e con il cilindro la lente deve stare girata nel verso giusto: se gira, cambia l'asse e una direzione sfoca. La raddrizzo e verifichiamo.", ok: "best", reply: "Ah, quindi forse non serve rifare le lenti.", tip: "Sintomo collegato alla causa, con un'immagine: la lente girata. E la soluzione più semplice prima di tutto.", requires: ["cilindro", "asse", "montatura"] },
            { t: "Il cilindro, con il tempo, tende a cambiare: di solito dopo un anno le luci di notte si allungano un po'.", ok: "no", reply: "Quindi devo rifare tutto?", tip: "Non c'entra l'età: qui c'è un occhiale storto, e con il cilindro basta questo." },
            { t: "Con il cilindro le lenti sono più delicate: una caduta spesso le rovina, e di solito vanno rifatte.", ok: "no", reply: "Ma sono quasi nuove!", tip: "Una caduta storce la montatura molto più spesso di quanto rovini le lenti: prima si raddrizza e si verifica.", requires: ["montatura"] },
          ],
        },
        {
          phase: "soluzione",
          note: "Raddrizzi la montatura e controlli le lenti al frontifocometro: asse {axis}, come sulla ricetta. Era la montatura storta a girarle davanti all'occhio: ora sta dritta.",
          say: "Va molto meglio! Come faccio a evitare che ricapiti?",
          choices: [
            { t: "Quando non li porta, li tenga nell'astuccio rigido; e li tolga sempre con due mani, dalle aste.", ok: "best", reply: "Due mani, ok. L'astuccio lo prendo.", tip: "I due consigli che evitano davvero il problema: l'astuccio contro gli urti, le due mani perché una sola, giorno dopo giorno, allarga e storce le aste.", requires: ["regolazione"] },
            { t: "Basta tenerli nell'astuccio rigido quando non li porta. E se le ricapita, li riporti: si raddrizzano in pochi minuti.", ok: "ok", reply: "Va bene, l'astuccio lo prendo.", tip: "Giusto, ma manca il consiglio che evita di storcerli ogni giorno: toglierli con due mani, dalle aste.", requires: ["regolazione"] },
            { t: "Un frontale in titanio: è un metallo molto resistente, e di solito non si storce nemmeno se cade.", ok: "no", reply: "Cambio occhiali, quindi?", tip: "Il titanio è leggero e resistente, ma una caduta storce anche lui. La prevenzione vera è l'astuccio, e toglierli con due mani.", requires: ["montatura"] },
          ],
        },
        {
          phase: "spiegazione",
          say: "Una curiosità: l'astigmatismo si può togliere?",
          choices: [
            { t: "Si corregge bene con le lenti, anche a contatto: le toriche. Gli interventi li valuta l'oculista.", ok: "best", reply: "Ok, glielo chiederò.", tip: "Cosa fanno le lenti, e per il resto la visita: interventi e salute dell'occhio sono del medico.", requires: ["cilindro", "visita"] },
            { t: "Sì, con il laser: oggi è un intervento molto diffuso e veloce, e di solito va benissimo.", ok: "grave", reply: "Quindi posso farlo?", tip: "Gli interventi li valuta il medico, dopo una visita: non si consigliano e non si sminuiscono al banco.", requires: ["visita"] },
            { t: "Purtroppo l'astigmatismo di solito aumenta con gli anni: conviene rifare le lenti spesso, almeno una volta all'anno.", ok: "no", reply: "Ogni anno?", tip: "In un adulto l'astigmatismo cambia poco e piano: le lenti si rifanno quando cambia la misura, non a calendario." },
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
      { q: "Una montatura in acetato storta si raddrizza…", o: ["Scaldandola prima di piegarla", "Piegandola a freddo con le pinze", "Non si può: va cambiata"], ok: 0, why: "L'acetato si scalda prima di piegarlo; il metallo si regola a freddo, con le pinze.", requires: ["regolazione"] },
    ],
    stars: ["Occhio", "Spiegazione", "Soluzione"],
  },

  /* ===================== 5 · LA RICETTA ===================== */
  {
    id: "o5", n: 5, cap: 1,
    title: "Il foglio dell'oculista",
    short: "OD, OS, SF, CIL, AX, ADD. Trasposizione e che occhiale fare.",
    customer: anna,
    learn: ["Leggere una ricetta numero per numero", "Scrivere il cilindro col più o col meno: la trasposizione", "Che occhiale si può fare con una ricetta"],
    cards: ["ricetta", "soluzioni"],
    prova: {
      type: "ricetta",
      goal: "Leggi la ricetta di Anna: tocca il numero che risponde a ogni domanda.",
      ricetta: ANNA_RX,
      tasks: [
        { q: "Quale numero dice che l'occhio sinistro è ipermetrope?", ok: ["OS.SF"], why: "La sfera dell'occhio sinistro, OS, è col più, +1,25, e non c'è cilindro: ipermetropia." },
        { q: "Quale numero dice che c'è astigmatismo?", ok: ["OD.CIL"], why: "Il cilindro dell'occhio destro: −0,75. Il sinistro non ce l'ha." },
        { q: "Quale numero dice in che direzione va il cilindro?", ok: ["OD.AX"], why: "L'asse, 90°: l'asse del cilindro sta in verticale, sullo schema TABO; la forza del cilindro lavora in orizzontale." },
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
          phase: "anamnesi",
          say: "Buongiorno, l'oculista mi ha fatto questa ricetta. Io non ci capisco niente. Mi fate gli occhiali?",
          choices: [
            { t: "Certo, la guardiamo insieme. Di quando è la ricetta? E porta già degli occhiali, anche solo per leggere?", ok: "best", reply: "È della settimana scorsa. Ho quelli da lettura della farmacia, ma da lontano niente.", tip: "Data della ricetta e occhiali attuali: dicono se la ricetta è fresca e cosa cambia rispetto a prima. Gli occhiali vecchi si misurano al frontifocometro.", requires: ["soluzioni"] },
            { t: "Certo: facciamo la stessa lente per tutti e due gli occhi, così vede uguale da una parte e dall'altra e si abitua prima.", ok: "no", reply: "Ma qui ci sono due righe diverse…", tip: "Ogni occhio ha la sua riga: OD e OS possono essere diversi, e qui lo sono. Le lenti seguono la ricetta, occhio per occhio.", requires: ["ricetta"] },
            { t: "Il cilindro c'è solo su un occhio: di solito è un errore di trascrizione, meglio sentire l'oculista.", ok: "no", reply: "Un errore? Devo tornare dall'oculista?", tip: "È normalissimo che i due occhi siano diversi, anche col cilindro su uno solo. Se un numero sembra davvero strano, si sente l'oculista, senza allarmare il cliente.", requires: ["ricetta"] },
          ],
        },
        {
          phase: "spiegazione",
          show: { ricetta: ANNA_RX },
          say: "Cosa vogliono dire tutti questi numeri?",
          choices: [
            { t: "Prima riga occhio destro, seconda sinistro. Il più è ipermetropia; il destro ha anche un po' di astigmatismo, il cilindro. L'ADD è per leggere.", ok: "best", reply: "Ah, ecco. Quindi destro e sinistro sono diversi.", tip: "Poche parole, nell'ordine della ricetta: la cliente segue con gli occhi mentre parli.", requires: ["ricetta"] },
            { t: "Che lei è un po' miope, di più dal lato destro: per questo nella ricetta c'è il segno meno, e il numero più grande è quello dell'occhio che vede peggio.", ok: "no", reply: "Ma qui c'è scritto più…", tip: "Il più nella sfera è ipermetropia. Il meno del cilindro è solo il modo di scriverlo." },
            { t: "L'ADD è la correzione dell'astigmatismo: si aggiunge alla sfera, e serve soprattutto per guidare di sera.", ok: "no", reply: "Ah, pensavo fosse per leggere…", tip: "ADD è l'addizione per vicino. L'astigmatismo è il cilindro, CIL, con l'asse." },
          ],
        },
        {
          phase: "anamnesi",
          say: "E quindi che occhiali mi servono? Uno o due paia?",
          choices: [
            { t: "Dipende da come passa la giornata: guida? Usa il computer? Legge tanto, e a che distanza?", ok: "best", reply: "Guido poco, in città. Leggo tanto, e lavoro tre giorni a settimana in biblioteca, al computer.", tip: "La ricetta dice la forza, l'uso decide l'occhiale.", requires: ["soluzioni"] },
            { t: "Di solito si fanno due paia, uno da lontano e uno da vicino: ogni occhiale fa una cosa sola, e la fa bene.", ok: "no", reply: "Sempre? Mia sorella ne ha un paio solo.", tip: "Non c'è una scelta migliore per tutti: dipende dalle distanze che usa. Prima l'uso.", requires: ["soluzioni"] },
            { t: "Con un'addizione così, di solito si fanno le progressive: è quello che la ricetta indica.", ok: "no", reply: "La ricetta dice così?", tip: "L'oculista non ha scritto il tipo di occhiale: lo decide l'uso.", requires: ["soluzioni"] },
          ],
        },
        {
          phase: "soluzione",
          choices: [
            { t: "Progressive per tutti i giorni: lontano, computer e lettura con un solo occhiale. E, se vuole, un paio da ufficio per le ore in biblioteca: solo per la scrivania, non per guidare.", ok: "best", reply: "Mi piace l'idea delle progressive. Quelli da ufficio li vedo dopo.", tip: "Una soluzione principale chiara, più un secondo paio motivato dall'uso, con il suo limite detto chiaro.", requires: ["progressive", "ufficio"] },
            { t: "Due paia: uno da lontano per guidare in città e uno da vicino per leggere. Così ogni occhiale fa il suo lavoro, e lei sceglie quale mettere.", ok: "ok", reply: "E al computer quale metto?", tip: "Funziona, ma il computer resta scoperto e deve cambiare occhiale tutto il giorno. Con il suo uso le progressive sono più comode.", end: "Anna sceglie due montature, una da lontano e una da vicino. Per il computer, vedrà." },
            { t: "Quelli da lettura, come quelli che ha già: guida poco, e per leggere e per il computer di solito bastano.", ok: "grave", reply: "Ma quelli della farmacia non hanno l'astigmatismo…", tip: "Anna ha due occhi diversi e il cilindro: servono lenti fatte su misura. E se guida, il lontano va corretto come dice la ricetta.", requires: ["premontati"] },
          ],
        },
      ],
      end: "Anna sceglie una montatura abbastanza alta per la progressiva. Si prendono le misure.",
    }],
    quiz: [
      { q: "OS sulla ricetta vuol dire…", o: ["Occhio sinistro", "Occhio sano", "Ottico specialista"], ok: 0, why: "OD occhio destro, OS occhio sinistro, OO tutti e due." },
      { q: "L'ADD è sempre…", o: ["Col più", "Col meno", "In gradi"], ok: 0, why: "È quanto si aggiunge per vicino: sempre col più." },
      { q: "Senza cilindro, una sfera +1,25 vuol dire…", o: ["Ipermetropia", "Miopia", "Astigmatismo"], ok: 0, why: "Sfera col più, senza cilindro: ipermetropia." },
      { q: "La ricetta dice sempre che occhiale fare?", o: ["Non sempre: se non lo scrive, il tipo si sceglie con l'uso", "Sì, sempre", "Solo per le progressive"], ok: 0, why: "Spesso dice solo la forza. Se l'oculista scrive il tipo, si parte da lì." },
      { q: "Un trattino nella colonna CIL vuol dire…", o: ["Che non c'è cilindro", "Che il cilindro è da misurare", "Che quell'occhio non vede"], ok: 0, why: "Il trattino vuol dire «niente»: niente cilindro, quindi niente asse." },
      { q: "−0,50 −1,00 × 30, col cilindro scritto col più, diventa…", o: ["−1,50 +1,00 × 120", "−0,50 +1,00 × 30", "+0,50 +1,00 × 120"], ok: 0, why: "Nuova sfera: −0,50 − 1,00 = −1,50. Il cilindro cambia segno, l'asse gira di 90°: da 30 a 120.", requires: ["trasposizione"] },
    ],
    stars: ["Ricetta", "Spiegazione", "Soluzione"],
  },

  /* ===================== 6 · SABATO MATTINA ===================== */
  {
    id: "o6", n: 6, cap: 1,
    title: "Sabato mattina",
    short: "Tre clienti di fila: riconosci il caso.",
    customer: { name: "Sabato mattina", age: 0, job: "il negozio apre alle nove", msg: "Ogni sabato entrano clienti diversi. Oggi ne servi tre, uno dopo l'altro." },
    learn: ["Riconoscere il caso tecnico, cliente dopo cliente", "Quando prima di tutto serve il medico", "Bambini e lenti a contatto"],
    cards: ["sabato"],
    pick: 3,
    dialogs: [
      {
        id: "luca", who: { name: "Luca", age: 19, job: "studente", msg: "Al cinema leggo i sottotitoli sfocati. Col telefono tutto a posto." },
        steps: [
          {
            phase: "anamnesi",
            say: "Buongiorno, al cinema i sottotitoli li leggo sfocati. Col telefono invece tutto a posto.",
            choices: [
              { t: "Da quando succede? Porta occhiali? Ha mai fatto un controllo della vista?", ok: "best", reply: "Da quest'estate. Mai fatto controlli.", tip: "Da quando, occhiali, ultimo controllo: con un lontano che cala, è l'anamnesi che serve." },
              { t: "Al cinema è buio, e con poca luce di solito si vede meno nitido: spesso non è un difetto.", ok: "no", reply: "Quindi non devo fare niente?", tip: "Il buio rende più evidente una miopia leggera, non la crea: sottotitoli sfocati da quest'estate vanno misurati.", requires: ["miopia"] },
              { t: "Da come lo descrive, di solito è una miopia leggera: per i sottotitoli bastano lenti da −1,00.", ok: "grave", reply: "Come fa a saperlo?", tip: "La gradazione non si indovina dal sintomo: si misura.", requires: ["misura"] },
            ],
          },
          {
            phase: "soluzione",
            say: "E quindi?",
            choices: [
              { t: "Facciamo un controllo della vista: dura una ventina di minuti e capiamo cosa serve.", ok: "best", reply: "Va bene, ho tempo.", tip: "Il passo giusto: prima la misura, poi la lente.", requires: ["misura"] },
              { t: "Intanto può provare degli occhiali da lettura: ingrandiscono, e spesso aiutano anche con lo schermo.", ok: "no", reply: "Da lettura? Ma il telefono lo leggo bene…", tip: "Gli occhiali da lettura sono col più, per vicino: a un miope peggiorano il lontano.", requires: ["addizione"] },
              { t: "Le preparo delle lenti a contatto da provare a casa per qualche giorno, poi vediamo come si trova.", ok: "grave", reply: "Così, subito?", tip: "Le lenti a contatto si applicano con una prova vera e i controlli, meglio dopo una visita: mai «da provare» a casa.", requires: ["lac"] },
            ],
          },
          {
            phase: "spiegazione",
            note: "Esito del controllo: −1,50 all'occhio destro, −1,25 al sinistro.",
            say: "Ma perché il telefono lo leggo e i sottotitoli no?",
            choices: [
              { t: "Da lontano il fuoco cade un po' prima del fondo dell'occhio; da vicino cade giusto. La lente col meno lo sposta al posto giusto.", ok: "best", reply: "Ah, ok. Ha senso.", tip: "La miopia in una frase, con il fuoco al centro.", requires: ["miopia"] },
              { t: "Perché lo schermo del telefono è luminoso e vicino, mentre al cinema è buio e l'occhio fa più fatica a mettere a fuoco le scritte.", ok: "no", reply: "Quindi se alzo la luminosità…?", tip: "La causa è dove cade il fuoco; il buio rende solo più evidente la sfocatura." },
              { t: "Di solito è un inizio di presbiopia: la vista da vicino va bene, da lontano comincia a calare.", ok: "no", reply: "A 19 anni?", tip: "La presbiopia arriva dopo i 40-45 anni, e riguarda il vicino.", requires: ["presbiopia"] },
            ],
          },
        ],
        end: "Luca sceglie la montatura: lenti monofocali con antiriflesso.",
      },
      {
        id: "paola", who: { name: "Paola", age: 46, job: "commerciante", msg: "Vorrei degli occhiali per leggere, quelli già pronti." },
        steps: [
          {
            phase: "anamnesi",
            say: "Buongiorno, vorrei degli occhiali per leggere, quelli già pronti. Per il telefono e le etichette al supermercato.",
            choices: [
              { t: "Certo. Prima due domande: da lontano come vede? E quando ha fatto l'ultimo controllo della vista?", ok: "best", reply: "Da lontano bene. L'ultimo controllo, anni fa.", tip: "Anche per un premontato due domande: un difetto da lontano, o due occhi diversi, cambiano tutto." },
              { t: "Certo, ecco l'espositore: provi le gradazioni con calma e prenda la più leggera con cui legge bene.", ok: "ok", reply: "Questi +1,50 mi sembrano andare.", tip: "Si può fare, e «la più leggera» è giusto. Ma prima due domande: se c'è un difetto da lontano o i due occhi sono diversi, i premontati non bastano." },
              { t: "Di solito conviene una gradazione più forte, +3,00: si legge meglio, e va bene per qualche anno.", ok: "grave", reply: "Così forti? Mi gira un po' la testa.", tip: "Più forte non è meglio: la zona nitida si accorcia e ci si stanca. E la forza non si indovina.", requires: ["addizione", "misura"] },
            ],
          },
          {
            phase: "soluzione",
            say: "Quindi prendo questi e basta?",
            choices: [
              { t: "Per leggere ogni tanto vanno bene. Un controllo però conviene: con due occhi diversi o un po' di astigmatismo, quelli pronti non bastano.", ok: "best", reply: "Ha ragione, intanto prendo questi e prenoto il controllo.", tip: "Il prodotto che chiede, con i suoi limiti detti chiari.", requires: ["premontati"] },
              { t: "Per provare vanno bene, ma alla lunga quelli già pronti tendono a rovinare la vista, perché i centri delle lenti non sono i suoi: meglio farli su misura.", ok: "grave", reply: "Davvero? Li usano tutti…", tip: "Falso: i premontati non rovinano gli occhi. Hanno dei limiti, e sono quelli che si spiegano.", requires: ["premontati", "onesta"] },
              { t: "Sì, e li può tenere anche in macchina, così il navigatore lo legge senza toglierli.", ok: "grave", reply: "Anche in macchina?", tip: "Con la lente da lettura il lontano è sfocato: per guidare no, è pericoloso.", requires: ["addizione"] },
            ],
          },
          {
            phase: "spiegazione",
            say: "Ma perché a 46 anni? Ho sempre visto benissimo.",
            choices: [
              { t: "Quello che descrive è tipico dell'età: la lente dentro l'occhio perde elasticità e mette a fuoco da vicino sempre meno. Il controllo dirà quanto; e a questa età è utile anche una visita dall'oculista.", ok: "best", reply: "Allora sono in buona compagnia. Prenoto anche quella.", tip: "Rassicurante e giusto, senza diagnosi. E la visita come buona abitudine, non come allarme.", requires: ["presbiopia", "visita"] },
              { t: "Con l'età l'occhio di solito si accorcia un po', e si diventa ipermetropi: da vicino il fuoco va dietro.", ok: "no", reply: "Iper… cosa?", tip: "L'occhio non si accorcia con l'età: è il cristallino che perde elasticità. Quello che descrive somiglia alla presbiopia." },
              { t: "Spesso dipende dalla luce: leggendo la sera con poca luce, col tempo la vista da vicino cala.", ok: "no", reply: "Ma leggo sempre con la luce accesa.", tip: "La luce aiuta, ma la causa è il cristallino che perde elasticità." },
            ],
          },
        ],
        end: "Paola esce con i premontati e un appuntamento per il controllo della vista.",
      },
      {
        id: "giorgio", who: { name: "Giorgio", age: 63, job: "pensionato", msg: "Ho le progressive da un mese. Guardando di lato vedo sfocato, e sulle scale inciampo." },
        steps: [
          {
            phase: "anamnesi",
            say: "Ho fatto le progressive un mese fa. Guardando di lato vedo sfocato, e scendendo le scale mi sembra di inciampare.",
            choices: [
              { t: "Me le fa vedere? Quando sfoca: girando gli occhi o la testa? E le scale, da che parte della lente le guarda?", ok: "best", reply: "Quando giro gli occhi. E le scale le guardo da sotto, dalla parte bassa.", tip: "Prima capisci come le usa: spesso la risposta è lì." },
              { t: "Con le progressive di solito ci vogliono alcuni mesi per abituarsi: piano piano passa da solo.", ok: "no", reply: "Alcuni mesi?", tip: "Di solito servono da qualche giorno a due settimane: dopo un mese, se sfoca ancora, si controlla.", requires: ["progressive"] },
              { t: "Se dopo un mese sfoca ancora, di solito le lenti hanno un difetto di lavorazione: le rimandiamo in laboratorio per un controllo.", ok: "no", reply: "Difettose?", tip: "Prima si capisce come le usa, poi si controllano misure e montatura: il difetto di fabbrica è l'ultima ipotesi.", requires: ["misure"] },
            ],
          },
          {
            phase: "spiegazione",
            say: "Quindi che devo fare?",
            choices: [
              { t: "Ai lati si gira la testa, non solo gli occhi. Sulle scale si abbassa la testa e si guarda dalla parte alta, quella per lontano.", ok: "best", reply: "Ah, guardavo dalla parte per leggere! Proverò.", tip: "L'uso giusto: la parte bassa è per vicino, e sulle scale sfoca.", requires: ["progressive"] },
              { t: "Per le scale guardi dalla parte bassa della lente: è la più forte, e i gradini li vede più grandi e nitidi.", ok: "grave", reply: "È proprio quello che faccio…", tip: "La parte bassa è per vicino: sulle scale sfoca. È un rischio di caduta.", requires: ["progressive"] },
              { t: "Le tolga quando cammina e le rimetta quando si siede: le progressive sono pensate soprattutto per stare fermi, a leggere o al computer.", ok: "no", reply: "Ma poi non vedo lontano.", tip: "Toglierle non risolve: in alto la progressiva è per lontano, e si cammina benissimo." },
            ],
          },
          {
            phase: "soluzione",
            say: "E se non mi abituo?",
            choices: [
              { t: "Controlliamo subito misure e montatura: altezza e centratura. Se sono giuste, si ricontrolla la gradazione.", ok: "best", reply: "Bene, così sono tranquillo.", tip: "Prima le misure, poi la gradazione: spesso il problema è lì.", requires: ["misure"] },
              { t: "Se non si abitua, si passa a una progressiva di livello più alto: le zone laterali sono più larghe.", ok: "no", reply: "E le misure? Non c'entrano?", tip: "È vero che le progressive di livello più alto hanno zone laterali più ampie, ma prima si controlla quello che c'è: misure e montatura.", requires: ["misure"] },
              { t: "Di solito con le progressive ci vuole pazienza: dopo qualche mese ci si abitua a tutto. Intanto le porti sempre.", ok: "no", reply: "Qualche mese?", tip: "Di solito servono da qualche giorno a due settimane: se dopo due settimane non va, si torna e si controlla.", requires: ["progressive"] },
            ],
          },
        ],
        end: "Giorgio prova le scale del negozio guardando dalla parte alta. Va meglio; le misure si controllano comunque.",
      },
      {
        id: "elena", who: { name: "Elena", age: 38, job: "mamma di Tommaso, 9 anni", msg: "La maestra dice che Tommaso strizza gli occhi per vedere la lavagna." },
        steps: [
          {
            phase: "anamnesi",
            say: "Buongiorno. La maestra dice che mio figlio Tommaso strizza gli occhi per vedere la lavagna.",
            choices: [
              { t: "Avete già fatto una visita dall'oculista? E Tommaso si lamenta di qualcosa, a scuola o a casa?", ok: "best", reply: "Mai fatta. Lui dice che vede bene, ma si avvicina molto alla TV.", tip: "Per un bambino la prima domanda è sulla visita oculistica.", requires: ["bambini"] },
              { t: "Meglio fare subito gli occhiali, prima che peggiori: ai bambini la vista cambia in fretta, e la lavagna va vista bene.", ok: "grave", reply: "Subito? Senza visita?", tip: "Senza visita non si fanno occhiali a un bambino. E niente previsioni su come andrà la vista.", requires: ["bambini"] },
              { t: "A quell'età succede spesso: di solito è una fase, e passa con la crescita.", ok: "grave", reply: "Quindi aspetto?", tip: "Rassicurare senza visita fa perdere tempo a un bambino: serve l'oculista.", requires: ["bambini"] },
            ],
          },
          {
            phase: "soluzione",
            say: "E quindi?",
            choices: [
              { t: "Per i bambini il primo passo è la visita dall'oculista. Poi, con la ricetta, scegliamo insieme montatura e lenti.", ok: "best", reply: "Va bene, prenoto la visita.", tip: "Prima la visita, poi montatura e lenti: l'ordine giusto con un bambino.", requires: ["bambini"] },
              { t: "Se vuole, gli misuriamo noi la vista adesso, e se serve facciamo gli occhiali entro la settimana.", ok: "grave", reply: "Non serve una visita?", tip: "Nei bambini il primo passo è la visita: a volte servono gocce che rilassano il cristallino per misurare bene, e le mette il medico.", requires: ["bambini"] },
              { t: "Si può partire anche dalle lenti a contatto: molti bambini le preferiscono agli occhiali, e giocano più tranquilli.", ok: "grave", reply: "A nove anni?", tip: "Le lenti a contatto vengono dopo la visita e con una prova vera: mai come primo passo.", requires: ["lac"] },
            ],
          },
          {
            phase: "soluzione",
            note: "Dieci giorni dopo Elena torna con la ricetta dell'oculista.",
            say: "Che occhiali prendo per un bambino? Li rompe tutti. E ho sentito di lenti che fermano la miopia…",
            choices: [
              { t: "Montature flessibili e lenti che resistono agli urti, come il policarbonato. Le lenti per la miopia dei bambini la rallentano, non la fermano: se sono adatte, lo dice l'oculista.", ok: "best", reply: "Perfetto, chiedo all'oculista.", tip: "Sicurezza prima di tutto, e onestà su quello che le lenti possono fare.", requires: ["bambini", "policarbonato"] },
              { t: "Lenti di vetro: si graffiano molto meno, e con un bambino durano di più.", ok: "grave", reply: "Di vetro? E se cade?", tip: "Ai bambini mai lenti di vetro: in un urto si rompono. Policarbonato.", requires: ["bambini"] },
              { t: "Sì, con quelle lenti di solito la miopia si ferma: conviene metterle subito.", ok: "grave", reply: "Si ferma davvero?", tip: "Promessa falsa: rallentano, non fermano. E se sono adatte lo decide l'oculista.", requires: ["bambini"] },
              { t: "Una montatura di metallo sottile: è leggera, e di solito resiste bene ai colpi.", ok: "no", reply: "Così sottili?", tip: "Ai bambini servono montature flessibili, che resistono ai colpi: il metallo sottile si storce.", requires: ["montatura"] },
            ],
          },
        ],
        end: "Tommaso sceglie una montatura blu, flessibile. Lenti in policarbonato.",
      },
      {
        id: "marta", who: { name: "Marta", age: 29, job: "impiegata", msg: "Da stamattina ho l'occhio destro rosso, mi fa male e vedo annebbiato." },
        steps: [
          {
            phase: "soluzione",
            say: "Da stamattina ho l'occhio destro rosso, mi fa male e vedo un po' annebbiato. Porto le lenti a contatto: stamattina le ho tolte. Forse mi servono occhiali nuovi?",
            choices: [
              { t: "Con dolore, occhio rosso e vista annebbiata la deve vedere un medico oggi: l'oculista o il pronto soccorso, quello oculistico se c'è.", ok: "best", reply: "Addirittura oggi?", tip: "Segnali chiari: niente controllo e niente occhiali. Medico subito.", requires: ["medico"] },
              { t: "Facciamo prima un controllo della vista: se è un problema di gradazione lo vediamo in venti minuti, e poi decidiamo insieme se serve il medico.", ok: "grave", reply: "Va bene, se serve…", tip: "Con dolore e occhio rosso il controllo della vista fa solo perdere tempo: medico oggi stesso.", requires: ["medico"] },
              { t: "Può essere un'irritazione: di solito un collirio lenitivo aiuta, e se non passa torni da noi.", ok: "grave", reply: "Quale?", tip: "Farmaci e colliri non si consigliano, tanto meno con questi segnali: è un caso per il medico, oggi.", requires: ["medico"] },
            ],
          },
          {
            phase: "spiegazione",
            say: "Ma sarà stanchezza…",
            choices: [
              { t: "Può darsi, ma dolore e vista annebbiata insieme vanno fatti vedere oggi. Gli occhiali li guardiamo dopo.", ok: "best", reply: "Ok, mi ha convinta.", tip: "Fermo e gentile: non spaventi, ma non lasci correre.", requires: ["medico"] },
              { t: "Può darsi: se tra qualche giorno è ancora rosso, torni e facciamo il controllo.", ok: "grave", reply: "Va bene, aspetto.", tip: "Con questi segnali aspettare può essere pericoloso.", requires: ["medico"] },
              { t: "Intanto può rimettere le lenti a contatto per vedere meglio al lavoro, e stasera le toglie presto e le lascia nella soluzione.", ok: "grave", reply: "Le ho tolte stamattina perché bruciava…", tip: "Con un occhio rosso e dolente le lenti a contatto non si rimettono: si va dal medico.", requires: ["medico", "lac"] },
            ],
          },
          {
            phase: "soluzione",
            say: "E dove vado, adesso?",
            choices: [
              { t: "Al pronto soccorso, quello oculistico se c'è, oppure chiami subito il suo oculista. Non rimetta le lenti a contatto: le porti con sé, con l'astuccio.", ok: "best", reply: "Vado adesso. Grazie.", tip: "Indicazione chiara e pratica, e le lenti al medico: possono servirgli.", requires: ["medico"] },
              { t: "Dal farmacista: è più veloce del pronto soccorso, le dà qualcosa per il dolore e le dice lui se serve altro.", ok: "grave", reply: "Il farmacista?", tip: "Il farmacista non visita l'occhio: con dolore, occhio rosso e vista annebbiata serve il medico oggi.", requires: ["medico"] },
              { t: "Se domani è ancora così, allora si fa vedere: spesso con un giorno di riposo passa.", ok: "grave", reply: "Non lo so…", tip: "«Non è grave» è una diagnosi, e qui può essere sbagliata. Serve il medico, oggi.", requires: ["medico"] },
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
      { q: "Le lenti a contatto si danno…", o: ["Dopo una prova vera e i controlli, meglio dopo una visita", "Da provare a casa, per qualche giorno", "A chi le chiede, senza altro"], ok: 0, why: "Si applicano con una prova vera e i controlli che servono, meglio dopo una visita dall'oculista." },
      { q: "Le lenti per la miopia dei bambini…", o: ["La rallentano, non la fermano: decide l'oculista", "La fermano", "Non esistono"], ok: 0, why: "Rallentano il peggioramento. Se sono adatte, lo decide l'oculista.", requires: ["bambini"] },
    ],
    stars: ["Primo cliente", "Secondo cliente", "Terzo cliente"],
  },
];
