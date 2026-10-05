/* Schede di teoria del capitolo 1. **testo** = grassetto.
   teaches = concetti che la scheda insegna: li usa il controllo automatico (S8). */
import type { Card } from "../core/types";

export const CARDS_CAP1: Record<string, Card> = {
  giro: {
    t: "Un giro chiuso",
    teaches: ["circuito", "corto"],
    p: [
      "La corrente elettrica sono cariche che si muovono dentro i fili. Si muovono solo se trovano un **giro chiuso**: dalla presa lungo un filo, dentro la lampada, e di nuovo alla presa lungo l'altro filo.",
      "Apri il giro in un punto qualsiasi e la corrente si ferma ovunque, non solo dopo il punto aperto. Un interruttore fa esattamente questo: apre e chiude il giro.",
      "Se fase e neutro si toccano direttamente, senza niente in mezzo, la corrente non trova freni e sale moltissimo: è un **cortocircuito**, e la protezione al quadro stacca.",
    ],
    lab: "giro",
    capo: "Quando una cosa non si accende, cerca dove si è aperto il giro: un filo staccato, un morsetto lento, una lampadina bruciata.",
  },
  ohm: {
    t: "Volt, ampere, ohm, watt",
    teaches: ["ohm"],
    p: [
      "Pensa a un tubo d'acqua. La **tensione** (volt, V) è la pressione che spinge: in casa sono 230 V. La **corrente** (ampere, A) è quanta acqua passa ogni secondo. La **resistenza** (ohm, Ω) è quanto il tubo frena.",
      "Le tre cose sono legate dalla legge di Ohm: a parità di tensione, meno resistenza vuol dire più corrente.",
      "La **potenza** (watt, W) è quanta energia usa un apparecchio ogni secondo. Sull'etichetta trovi i watt, e da lì ricavi gli ampere. Accendi più cose sulla stessa linea e gli ampere si sommano.",
    ],
    f: ["V = R × I", "P = V × I", "I = P ÷ 230"],
    lab: "watt",
    capo: "Dividi i watt per 230 e sai quanti ampere tira. Un bollitore da 2300 W tira 10 A.",
  },
  colori: {
    t: "I tre fili di casa",
    teaches: ["colori", "blu-solo-neutro", "gv-solo-terra", "LN-morsetti", "spellatura", "prova-trazione"],
    p: [
      "**Fase**: porta la tensione. Di solito marrone, a volte nero o grigio.",
      "**Neutro**: chiude il giro verso la cabina. Sempre blu, e il blu si usa solo per il neutro.",
      "**Terra** (conduttore di protezione, PE): non fa parte del giro e normalmente non ci passa corrente. C'è solo per sicurezza. Sempre giallo-verde, e il giallo-verde non si usa per nient'altro.",
      "Sui morsetti trovi spesso **L** per la fase e **N** per il neutro. Si spella solo il rame che entra nel morsetto; poi si stringe la vite e si tira il filo per prova.",
    ],
    g: [["conduttore", "filo"], ["conduttore di protezione (PE)", "terra"]],
    capo: "Il colore è un messaggio per chi aprirà la scatola dopo di te. Se lo sbagli, gli menti.",
  },
  joule: {
    t: "Perché le prese si anneriscono",
    teaches: ["joule", "rame-annerito"],
    p: [
      "Quando la corrente attraversa una resistenza produce calore. È l'**effetto Joule**, lo stesso che scalda la resistenza del bollitore.",
      "Un morsetto stretto male aggiunge un po' di resistenza proprio nel punto di contatto. Con un bollitore da 2000 W, che tira quasi 9 A, bastano 0,1 Ω di contatto lento per fare circa 8 W concentrati in pochi millimetri: la plastica intorno cuoce e diventa nera.",
      "Il rame annerito si taglia e si spella di nuovo: ossidato, fa contatto male anche nella presa nuova.",
    ],
    f: ["P = R × I²"],
    lab: "joule",
    capo: "Stringi il morsetto, poi tira il filo. Se si sfila, non era stretto.",
  },
  terra: {
    t: "A cosa serve la terra",
    teaches: ["terra"],
    p: [
      "Gli apparecchi con la carcassa di metallo (bollitore, lavatrice, forno) hanno il filo di terra collegato al metallo.",
      "Se dentro l'apparecchio un filo si spella e tocca la carcassa, la corrente prende la via del giallo-verde verso terra, il differenziale se ne accorge e stacca. Senza terra la carcassa resta a 230 V, e aspetta che qualcuno la tocchi.",
    ],
    capo: "Una presa senza terra funziona lo stesso. È per questo che è pericolosa: nessuno se ne accorge.",
  },
  presa: {
    t: "Le prese di casa",
    teaches: ["presa-tipi", "morsetti-due-fili"],
    p: [
      "La presa con i fori stretti è da **10 A**, quella con i fori larghi da **16 A**. La **bipasso** accetta tutte e due le spine. La **schuko** è quella tedesca, con la terra sui lati; la **universale** accetta sia le spine italiane sia le schuko.",
      "Dietro la bipasso ci sono tre morsetti: due laterali per fase e neutro, e quello della terra (⏚), che corrisponde al foro centrale.",
      "La spina italiana si può girare, quindi fase e neutro possono stare a destra o a sinistra. Conta che la terra sia al suo posto.",
      "I morsetti a vite dei frutti di solito accettano due fili: da una presa si può proseguire verso un'altra.",
    ],
    g: [["apparecchio modulare (presa, interruttore)", "frutto"], ["scatola portafrutti da 3 moduli", "la 503"], ["collegamento entra-esci", "entra-esci"]],
    capo: "Guarda i fori prima di comprare: per forno e lavatrice servono i 16 A.",
  },
  procedura: {
    t: "Prima di toccare",
    teaches: ["procedura", "tester"],
    ol: [
      "**Prova il tester** su una presa viva: deve segnare 230 V. Così sai che funziona.",
      "**Stacca** la linea giusta al quadro. Se stacchi il generale, il tester provalo prima.",
      "**Segnala**: un cartello o del nastro sull'interruttore, perché nessuno lo riattacchi.",
      "**Misura** dove lavori: per ogni filo di fase, fase–neutro e fase–terra; poi neutro–terra. Tutto deve segnare 0 V.",
      "Solo adesso metti le mani.",
    ],
    p: [
      "Sul quadro: il **generale** toglie tutto; il **differenziale** protegge le persone (il tasto T serve a provarlo, lo vedrai più avanti); i **magnetotermici**, con sigle come C10 o C16, proteggono ciascuno la sua linea.",
      "La norma CEI 11-27 distingue chi lavora sugli impianti: persona esperta (PES), avvertita (PAV) e persona comune (PEC). Finché non hai la formazione, lavori fuori tensione e con un PES o un PAV accanto.",
    ],
    g: [["interruttore generale", "il generale"]],
    capo: "Il cacciavite cercafase non basta: dipende da quanto sei isolato da terra, e a volte non si accende anche se c'è tensione. Usa il tester a due puntali.",
  },
  alternata: {
    t: "230 volt che cambiano verso",
    teaches: ["alternata", "neutro-non-sicuro"],
    p: [
      "In casa la tensione è **alternata**: la fase oscilla tra circa +325 V e −325 V rispetto a terra, 50 volte al secondo (50 Hz). I 230 V sono il valore efficace: scaldano e illuminano come 230 V fissi.",
      "Il neutro è collegato a terra in cabina, quindi di solito sta vicino a 0 V. Di solito non vuol dire sempre: con un neutro interrotto, un guasto o un impianto rifatto male, anche il blu dà la scossa. Si misura, non si presume.",
    ],
    f: ["230 × √2 ≈ 325 V di picco"],
    lab: "alternata",
    capo: "Il neutro non è sicuro per definizione. È sicuro solo quello che hai misurato a zero.",
  },
  ritorno: {
    t: "Il ritorno",
    teaches: ["ritorno", "fase-diretta"],
    p: [
      "Una luce si comanda così: la fase va all'interruttore, e dall'interruttore parte un filo verso la lampada. Si chiama **ritorno**: a luce spenta è a 0 V, a luce accesa porta la fase.",
      "Al soffitto trovi quindi ritorno, neutro e terra. A volte anche una **fase diretta**: arriva dal quadro senza passare dall'interruttore, quindi resta in tensione anche a luce spenta. Alla lampada non serve.",
      "Il colore del ritorno non è fissato: molti usano il nero o il grigio. In questa casa chi ha fatto l'impianto ha usato il nero. Alla lampada il ritorno va sul morsetto **L**, il neutro su **N**.",
    ],
    g: [["conduttore di ritorno", "ritorno lampada"]],
    capo: "Al soffitto non fidarti dei colori di chi è passato prima. Chi è formato riconosce il ritorno col tester, accendendo e spegnendo la luce prima di staccare. Tu, finché non hai la formazione, lavori fuori tensione e ti fai dire dal capo qual è.",
  },
  classe: {
    t: "Classe I e classe II",
    teaches: ["classe1"],
    p: [
      "Un apparecchio in **classe I** ha parti di metallo che si possono toccare e un morsetto di terra (⏚): va collegato al giallo-verde. Un lampadario di metallo è quasi sempre in classe I.",
      "Un apparecchio in **classe II** ha un doppio isolamento e non ha il morsetto di terra. Lo riconosci dal simbolo dei due quadrati, uno dentro l'altro.",
      "Il lampadario si appende al gancio del soffitto: i fili e i morsetti non reggono peso.",
    ],
    capo: "Se il lampadario ha il morsetto di terra, la terra si collega. Anche se monta lampadine LED.",
  },
  muro: {
    t: "L'interruttore a muro non toglie tensione",
    teaches: ["muro"],
    p: [
      "Spegnere dall'interruttore a muro toglie la fase solo al ritorno. Al soffitto restano le fasi che passano di lì, e basta che qualcuno accenda per ridare tensione proprio mentre hai le mani sui fili.",
      "Prima di lavorare a un punto luce si stacca al quadro, si segnala e si misura, come per una presa. Quando misuri il ritorno, lascia l'interruttore a muro acceso: a interruttore spento il ritorno segna 0 V comunque, e la misura non ti dice niente.",
    ],
    capo: "Il quadro, non il muro.",
  },
  morsetto: {
    t: "Il morsetto a leva",
    teaches: ["morsetto-leva", "filo-non-usato"],
    p: [
      "Il morsetto a leva unisce i fili: i suoi fori sono collegati tra loro, dentro. Un filo per foro.",
      "Alzi la leva, infili il filo spellato fino in fondo, abbassi la leva.",
      "Un filo che non usi non resta mai con il rame scoperto: lo chiudi da solo in un morsetto. Il foro libero resta vuoto.",
    ],
    g: [["morsetto a leva", "wago"]],
    capo: "Due fili nello stesso morsetto a leva sono collegati tra loro: fase e neutro non ci vanno mai insieme.",
  },
  sullafase: {
    t: "L'interruttore va sulla fase",
    teaches: ["interruttore-fase", "interruttore-simmetrico"],
    p: [
      "L'interruttore deve interrompere la **fase**, mai il neutro.",
      "Se interrompe il neutro la luce si spegne lo stesso, perché il giro si apre. Ma la lampada resta collegata alla fase: chi cambia la lampadina a luce spenta può prendere la scossa. È uno degli errori più pericolosi proprio perché funziona.",
      "Sull'interruttore semplice i due morsetti sono uguali: la fase su uno, il ritorno sull'altro. Il frutto è tutto isolato e non ha il morsetto di terra. Per il ritorno usi un colore da fase (nero, grigio o marrone), mai blu né giallo-verde.",
    ],
    capo: "Fase all'interruttore, ritorno alla lampada, neutro alla lampada.",
  },
  scatola: {
    t: "Le giunzioni stanno nella scatola",
    teaches: ["giunzioni"],
    p: [
      "I fili si uniscono solo dentro una scatola: quella di **derivazione**, con i morsetti a leva, oppure la scatola del frutto, sui suoi morsetti. Mai nel tubo, mai nel muro, mai attorcigliati e coperti col nastro.",
      "La scatola resta ispezionabile: chi la apre dopo deve trovare giunzioni ordinate e poterci rimettere mano.",
      "Un filo nuovo che va da un frutto all'altro senza giunzioni, per esempio il ritorno dall'interruttore alla lampada, può passare dritto nel tubo.",
    ],
    g: [["scatola di derivazione", "scatola, cassetta"]],
    capo: "Lascia un po' di filo in più nella scatola. Ti servirà il giorno che devi rifare una giunzione.",
  },
  sezione: {
    t: "La sezione del filo",
    teaches: ["sezione", "sezione-terra", "sigla-C"],
    p: [
      "La sezione è lo spessore del rame, in mm². Più è grande, meno il filo frena la corrente e meno scalda.",
      "Abitudine di mestiere: luci **1,5 mm²** con magnetotermico da 10 A, prese **2,5 mm²** con magnetotermico da 16 A, linee per carichi grossi 4 o 6 mm².",
      "Sul magnetotermico la sigla **C10** vuol dire 10 A (la C è la curva: la vedrai più avanti). La terra si tira della stessa sezione della fase e del neutro. Più grande della sezione minima va sempre bene; più piccola no.",
    ],
    capo: "Il filo si sceglie in base al magnetotermico che lo protegge, non in base a cosa ci attacchi oggi.",
  },
  parallelo: {
    t: "Le prese sono in parallelo",
    teaches: ["parallelo"],
    p: [
      "Le prese di una stanza sono collegate **in parallelo**: ognuna prende fase e neutro dalla stessa linea, quindi ognuna riceve 230 V.",
      "Le correnti invece si sommano. TV, console e lampada sulla stessa linea fanno la somma dei loro ampere, e quella somma passa nel tratto di filo che arriva dal quadro.",
    ],
    capo: "Derivare da una presa esistente va bene se i suoi morsetti accettano due fili. Altrimenti si deriva in scatola, con i morsetti.",
  },
  protegge: {
    t: "Il magnetotermico protegge il cavo",
    teaches: ["sezione-linea"],
    p: [
      "Il magnetotermico non sa cosa attacchi alla presa: guarda solo quanta corrente passa, e stacca prima che il cavo si scaldi troppo.",
      "Per questo il cavo si sceglie in base al magnetotermico. Sulla linea prese da 16 A la derivazione si fa da **2,5 mm²**: un tratto da 1,5 mm², a seconda di come è posato, potrebbe non reggere a lungo i 16 A che il magnetotermico lascia passare.",
    ],
    capo: "Ogni pezzo della linea deve reggere la corrente del magnetotermico a monte. Decide il punto più debole.",
  },
  canalina: {
    t: "La canalina: larghezza e altezza",
    teaches: ["canalina"],
    p: [
      "Quando non si vuole rompere il muro, il cavo corre in una canalina, per esempio lungo il battiscopa.",
      "Angoli, curve, coprigiunti e terminali devono essere della stessa serie e della stessa misura del canale: **larghezza × altezza**. Un accessorio 30×20 non si aggancia a un canale 30×10, anche se la larghezza è la stessa.",
      "Al negozio leggi la misura completa sull'etichetta, non solo la larghezza. Il coperchio deve chiudersi da solo: se schiaccia i fili, il canale è troppo piccolo.",
    ],
    g: [["minicanale, canale portacavi", "canalina"]],
    capo: "Prima di uscire dal negozio, prova ad agganciare un angolo al canale.",
  },
  etichette: {
    t: "Il quadro può sbagliare",
    teaches: ["etichette"],
    p: [
      "Le scritte sul quadro le ha fatte qualcuno, magari vent'anni fa, magari prima di un lavoro che ha spostato le linee. Capita spesso che siano sbagliate.",
      "L'unica cosa che conta è il tester sui fili dove lavori.",
    ],
    capo: "Stacca, poi misura. Se il tester segna ancora 230 V, il quadro ti ha mentito: abbassa le altre leve una alla volta, rimisurando ogni volta, oppure stacca il generale (il tester l'hai già provato prima).",
  },
  deviatore: {
    t: "Il deviatore",
    teaches: ["deviatore", "scambi-colore"],
    p: [
      "Il deviatore ha tre morsetti: il **comune** (C) e due uscite (1 e 2). Non apre il giro: manda la corrente su una delle due uscite.",
      "Con due deviatori si fa una **deviata**: la fase entra nel comune del primo, due fili di scambio collegano le uscite del primo a quelle del secondo, e dal comune del secondo parte il ritorno verso la lampada.",
      "Così la luce cambia stato ogni volta che giri uno dei due.",
      "Per gli scambi usi colori da fase (marrone, nero o grigio), mai il blu né il giallo-verde. I due scambi viaggiano nello stesso tubo, e se li incroci (l'1 di uno sul 2 dell'altro) funziona lo stesso.",
    ],
    g: [["punto luce deviato", "deviata"]],
    capo: "Sul frutto il comune è indicato. Guardalo prima di collegare: è l'errore più comune.",
  },
  verita: {
    t: "Provare tutte le combinazioni",
    teaches: ["verita"],
    p: [
      "Con due deviatori ci sono 2 × 2 = 4 combinazioni. In due la luce è accesa, nelle altre due spenta. Da qualsiasi combinazione, girare uno solo dei due deve cambiare lo stato della luce.",
      "Il collaudo le prova tutte, perché uno schema sbagliato a volte funziona in metà dei casi.",
    ],
    capo: "Collaudare vuol dire provare tutte le combinazioni, non vedere che una volta si accende.",
  },
  invertitore: {
    t: "L'invertitore",
    teaches: ["invertitore-coppie"],
    p: [
      "Per comandare una luce da tre punti si mette un **invertitore** tra i due deviatori. Ha quattro morsetti in due coppie, 1-2 e 3-4: sul frutto le vedi unite da una linea sotto i morsetti. Una coppia riceve i due scambi dal primo deviatore, l'altra li manda al secondo.",
      "Ogni volta che lo giri incrocia i due fili di scambio. Con tre comandi le combinazioni sono 2 × 2 × 2 = 8. Per quattro punti si mettono due invertitori in fila.",
    ],
    g: [["punto luce invertito", "invertita"]],
    capo: "Sull'invertitore guarda le coppie prima di collegare: è lì che si sbaglia.",
  },
  rele: {
    t: "Tanti punti: il relè",
    teaches: ["rele"],
    p: [
      "Con molti punti di comando si cambia sistema: **pulsanti**, che chiudono il contatto solo finché li premi, e un **relè passo-passo**, che a ogni impulso cambia stato: accende, poi spegne.",
      "I pulsanti sono tutti collegati in parallelo sulla bobina del relè. Aggiungere un punto vuol dire aggiungere un pulsante, senza rifare lo schema. Con più di tre punti di comando di solito conviene il relè.",
    ],
    capo: "Il relè va messo dove si raggiunge per la manutenzione: in una scatola di derivazione o nel quadro.",
  },
  leggi: {
    t: "Leggere il quadro quando salta",
    teaches: ["quadro-lettura"],
    p: [
      "Quando salta la luce, guarda quale leva è giù.",
      "**Differenziale giù**: c'è una dispersione verso terra. Un apparecchio guasto, umidità in una scatola esterna, un filo spellato che tocca il metallo.",
      "**Magnetotermico giù**: troppa corrente su quella linea, cioè un sovraccarico o un cortocircuito.",
      "**Tutto su, ma casa al buio**: guarda il contatore.",
    ],
    g: [["cortocircuito", "un corto"]],
    capo: "Prima di riarmare, chiediti perché è saltato.",
  },
  differenziale: {
    t: "Il differenziale",
    teaches: ["differenziale"],
    p: [
      "Il differenziale confronta la corrente che esce sulla fase con quella che torna sul neutro. Se ne torna meno, una parte sta andando a terra: attraverso un guasto, o attraverso una persona.",
      "Quando la differenza arriva alla sua soglia, **30 mA** nelle case (millesimi di ampere), stacca in una frazione di secondo. Ogni esemplare scatta tra 15 e 30 mA.",
      "Il magnetotermico invece lavora su correnti di 10 o 16 A e oltre, da 300 a 500 volte di più: protegge i cavi, non le persone. Il tasto **T** crea apposta una piccola dispersione: premilo ogni tanto per vedere se stacca.",
    ],
    g: [["interruttore differenziale", "salvavita (è un marchio BTicino diventato nome comune)"]],
    lab: "diff",
    capo: "Se tocchi fase e neutro insieme, isolato da terra, il differenziale non scatta: per lui sei un carico come un altro.",
  },
  corpo: {
    t: "Corrente e corpo umano",
    teaches: ["corpo"],
    p: [
      "Ordini di grandezza, che cambiano con il percorso nel corpo e con il tempo: circa 1 mA la senti; oltre i 10 mA circa i muscoli si contraggono e potresti non riuscire a mollare; da qualche decina di mA in su il cuore è a rischio.",
      "Per questo il differenziale di casa stacca entro 30 mA, in una frazione di secondo.",
    ],
    capo: "La tensione non si prova con le dita, nemmeno per scherzo.",
  },
  tipi: {
    t: "Puro o magnetotermico, e i tipi",
    teaches: ["tipi"],
    p: [
      "Il **differenziale puro** protegge solo dalle dispersioni. Il **magnetotermico differenziale** fa le due cose in un apparecchio solo: nei quadri italiani lo trovi spesso.",
      "Il tipo dice quali dispersioni riconosce. **AC**: solo quelle alternate classiche. **A**: anche quelle degli apparecchi elettronici. **F**: anche quelle di lavatrici e condizionatori con inverter. **B**: anche quelle in corrente continua, per colonnine auto e fotovoltaico.",
      "Un tipo diverso non fa sparire una dispersione vera: la vede meglio, o la vede dove il tipo AC non arrivava.",
    ],
    capo: "Leggi il frontale: soglia (30 mA), tipo e corrente. È la carta d'identità del quadro.",
  },
  metodo: {
    t: "Il metodo: uno alla volta",
    teaches: ["metodo"],
    ol: [
      "Stacca tutte le spine, oppure abbassa tutti i magnetotermici.",
      "Riarma il differenziale. Se non regge nemmeno così, il guasto è nell'impianto.",
      "Riattacca una cosa alla volta. Quando scatta, il colpevole è l'ultima cosa che hai riattaccato.",
    ],
    p: ["Mai escludere il differenziale per far funzionare un apparecchio."],
    capo: "L'ordine delle verifiche vale più delle verifiche. Scrivilo: dopo venti casi è il tuo metodo.",
  },
  potenza: {
    t: "Potenza: watt e kilowatt",
    teaches: ["potenza"],
    p: [
      "In casa la tensione è 230 V, quindi dai watt ricavi gli ampere: I = P ÷ 230. 1 kW sono 1000 W.",
      "Il forno da 2000 W tira circa 8,7 A, la lavatrice mentre scalda l'acqua più o meno lo stesso.",
    ],
    f: ["P = V × I", "I = P ÷ 230"],
    lab: "watt",
    capo: "Pesano gli apparecchi che scaldano: forno, phon, stufetta, bollitore, lavatrice. Il resto quasi non conta.",
  },
  contatore: {
    t: "Il contatore e il contratto",
    teaches: ["contatore"],
    p: [
      "Il contatore guarda la potenza totale della casa. Con il contratto più diffuso, **3 kW**, puoi stare fino a 3,3 kW senza limiti di tempo. Oltre ti tollera per un po', poi stacca.",
      "Il quadro può essere tutto su e la casa al buio: si riarma dal contatore.",
      "Le strade sono due: non accendere insieme i carichi grossi, oppure aumentare la potenza del contratto, che costa di più in bolletta.",
    ],
    capo: "Se salta il contatore, l'impianto non ha niente di rotto: hai chiesto più potenza di quella che paghi.",
  },
  mt: {
    t: "Il magnetotermico: due modi di scattare",
    teaches: ["mt"],
    p: [
      "Dentro ci sono due protezioni. Il **termico** è una lamina che si scalda e si piega: lento, per i sovraccarichi. Il **magnetico** è una bobina che strappa il contatto: istantaneo, per i cortocircuiti.",
      "Un C16 non scatta sotto i 18 A circa (1,13 volte 16 A). Tra 18 e 23 A può scattare, ma anche dopo ore. Sopra i 23 A circa (1,45 volte) scatta entro un'ora, più in fretta quanto più la corrente è alta. Da 80-160 A in su (da 5 a 10 volte: è la curva C) scatta all'istante.",
    ],
    lab: "mt",
    capo: "C16 sul frontale vuol dire curva C, 16 A. È la sigla che leggerai più spesso.",
  },
  ciabatta: {
    t: "La ciabatta che il quadro non vede",
    teaches: ["ciabatta"],
    p: [
      "Una ciabatta da 10 A regge circa 2300 W. Phon (1800 W) e stufetta (2000 W) insieme fanno 3800 W, cioè 16,5 A.",
      "Il magnetotermico da 16 A li lascia passare a lungo, perché è tarato per il cavo nel muro, non per la ciabatta. La ciabatta intanto scalda, e può prendere fuoco.",
      "Con il contratto da 3 kW phon e stufetta insieme fanno saltare anche il contatore, ma non è una protezione della ciabatta: è solo il contratto che finisce. Con un contratto più alto la ciabatta resterebbe accesa a scaldare.",
    ],
    capo: "Leggi gli ampere scritti sulla ciabatta, e non metterci insieme due cose che scaldano.",
  },
};
