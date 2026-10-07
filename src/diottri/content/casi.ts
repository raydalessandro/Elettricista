/* I cinque casi della mandata 2, nel Borgo Diottria. Ogni testo sta in un riquadro: tre righe da 24 caratteri.
   Le tacche dei bisogni le calcolano i modelli; qui si scrivono gli esiti dei pezzi e il perché, in una riga. */
import { PLANO } from "../../ottica/core/eye";
import type { CasoDef, Opzione } from "../core/tipi";

const s = (sph: number) => ({ ...PLANO, sph });

/* ---------- materiali e trattamenti che si ripetono ---------- */

const MAT_POCHE: Opzione[] = [
  { id: "cr39", nome: "Organico 1,5", esito: "bene", perche: "Con poche diottrie l'1,5 va benissimo.", materiale: "cr39" },
  { id: "i160", nome: "Organico 1,6", esito: "ok", perche: "Con poche diottrie l'indice alto toglie poco spessore.", materiale: "i160" },
  { id: "i167", nome: "Organico 1,67", esito: "ok", perche: "Con poche diottrie l'indice alto toglie poco spessore.", materiale: "i167" },
  { id: "pc", nome: "Policarbonato", esito: "ok", perche: "Regge gli urti, ma qui non serviva.", materiale: "pc" },
];

export const CASI: CasoDef[] = [
  /* ---------- 1 · la miopia, la prova lenti, il frontifocometro ---------- */
  {
    id: "c1", n: 1, titolo: "Il tabellone",
    cliente: {
      nome: "Marco", eta: 24, lavoro: "studente",
      frase: "Al binario non leggo più il tabellone. Ho gli occhiali vecchi.",
      indizio: "Strizza gli occhi verso la strada.",
      aspetto: { pelle: "#e8b48f", capelli: "#3b2a1e", maglia: "#3f6fb5", occhiali: true },
    },
    occhio: { od: s(-1.75), os: s(-2) },
    varianti: [{ od: s(-1.5), os: s(-1.75) }, { od: s(-1.75), os: s(-2) }, { od: s(-2), os: s(-2.25) }, { od: s(-2.25), os: s(-2.5) }],
    dp: 63,
    vecchi: { od: s(-1.25), os: s(-1.25), vedeBene: false, frase: "Con questi il tabellone è una nebbia." },
    scena: "tabellone", scenaProva: "tabellone",
    bisogni: [{ tipo: "lontano", nome: "Lontano" }],
    domande: [
      { id: "quando", testo: "Da quando?", risposta: "Da qualche mese, piano piano.", chiave: true },
      { id: "dove", testo: "Lontano o vicino?", risposta: "Lontano. Col telefono ci vedo bene.", chiave: true },
      { id: "segni", testo: "Dolore? Lampi?", risposta: "No, niente di strano." },
      { id: "occhiali", testo: "Porta occhiali?", risposta: "Gliel'ho detto: quelli vecchi.", giaDetto: true },
      { id: "guida", testo: "Guida?", risposta: "No, giro in treno e a piedi." },
    ],
    posti: {
      materiale: MAT_POCHE,
      trattamento: [
        { id: "no", nome: "Nessuno", esito: "bene", perche: "Qui non serve altro.", antiriflesso: false },
        { id: "blu", nome: "Filtro luce blu", esito: "bene", perche: "Si può offrire: per gli schermi è una comodità.", filtroBlu: true },
      ],
      montatura: [{ id: "sua", nome: "La sua, 50□18", esito: "bene", perche: "La sua montatura va bene.", montatura: { calibro: 50, ponte: 18 } }],
    },
    serveLente: true,
    aiuti: {
      prova: "Il meno più leggero con cui il tabellone è nitido.",
      posti: { materiale: "Con poche diottrie basta l'organico 1,5." },
    },
    ciVedo: "Ci vedo! Il treno per Bergamo è al binario 4.",
    fine: "La gradazione non si indovina: si misura.",
  },

  /* ---------- 2 · l'ipermetropia: chi ci vede bene e si stanca ---------- */
  {
    id: "c2", n: 2, titolo: "Gli occhi stanchi",
    cliente: {
      nome: "Giulia", eta: 28, lavoro: "grafica",
      frase: "Ci vedo benissimo, ma la sera ho gli occhi stanchi.",
      indizio: "Si strofina gli occhi, davanti al telefono.",
      aspetto: { pelle: "#f1c7a3", capelli: "#8a4b2a", maglia: "#c9506a", lunghi: true },
    },
    occhio: { od: s(2), os: s(2) },
    varianti: [{ od: s(1.75), os: s(1.75) }, { od: s(2), os: s(2) }, { od: s(2), os: s(2.25) }, { od: s(2.25), os: s(2.25) }],
    dp: 61,
    scena: "giornale", scenaProva: "strada",
    bisogni: [{ tipo: "vicino", nome: "Vicino", d: 0.4 }, { tipo: "lontano", nome: "Lontano" }, { tipo: "schermi", nome: "Al computer", nascosto: true }],
    domande: [
      { id: "segni", testo: "Mal di testa forte?", risposta: "No, leggero, la sera. Mai con la vista appannata.", chiave: true },
      { id: "dove", testo: "Lontano o vicino?", risposta: "Da vicino mi stanco. Lontano benissimo.", chiave: true },
      { id: "quando", testo: "Da quando?", risposta: "Da quando sto tanto al computer.", rivela: "schermi" },
      { id: "occhiali", testo: "Porta occhiali?", risposta: "No, mai portati." },
      { id: "vede", testo: "Ci vede bene?", risposta: "Gliel'ho detto: benissimo!", giaDetto: true },
    ],
    posti: {
      materiale: MAT_POCHE,
      trattamento: [
        {
          id: "no", nome: "Nessuno", esito: "bene", perche: "Il difetto lo corregge il più.", antiriflesso: false,
          seScoperto: { rivela: "schermi", esito: "ok", perche: "Sta tanto al computer: per lo schermo le serve un trattamento." },
        },
        { id: "blu", nome: "Filtro luce blu", esito: "bene", perche: "Al computer è una comodità; il difetto lo corregge il più.", filtroBlu: true },
      ],
      montatura: [{ id: "nuova", nome: "Nuova, 52□18", esito: "bene", perche: "Una montatura nuova: va bene.", montatura: { calibro: 52, ponte: 18 } }],
    },
    serveLente: true,
    dubbi: [{
      id: "perche", quando: "lentePiu",
      domanda: "Ma se ci vedo bene, perché gli occhiali?",
      mostra: [{ id: "lavora", esito: "risponde" }, { id: "dilato", esito: "vero" }, { id: "goccia", esito: "fuori" }],
      risposta: "Senza lente l'occhio lavora sempre; col più lavora meno.",
    }],
    aiuti: {
      prova: "Il più più forte con cui il lontano resta nitido.",
      posti: { trattamento: "Il più corregge l'occhio; il trattamento serve allo schermo." },
      mostra: "Fai vedere quanto lavora l'occhio, con e senza lente.",
    },
    ciVedo: "Che differenza! E il telefono è nitido.",
    fine: "Anche chi ci vede bene può avere bisogno del più.",
  },

  /* ---------- 3 · miopia forte: indice, calibro e antiriflesso si tengono insieme ---------- */
  {
    id: "c3", n: 3, titolo: "Fondi di bottiglia",
    cliente: {
      nome: "Davide", eta: 35, lavoro: "rappresentante",
      frase: "Li voglio più sottili: i miei sono fondi di bottiglia.",
      indizio: "Montatura grande, lenti spesse ai bordi.",
      aspetto: { pelle: "#d9a07a", capelli: "#1f1a17", maglia: "#2f3e4f", occhiali: true, barba: true },
    },
    occhio: { od: s(-5.5), os: s(-5.75) },
    dp: 62,
    vecchi: { od: s(-5), os: s(-5.25), vedeBene: false, frase: "Di giorno ancora ci vedo, di notte meno." },
    ricetta: { od: s(-5.5), os: s(-5.75), quando: "un mese fa", nascosta: true },
    scena: "notte", scenaProva: "notte",
    bisogni: [{ tipo: "lontano", nome: "Lontano" }, { tipo: "spessore", nome: "Spessore" }, { tipo: "riflessi", nome: "Riflessi", nascosto: true }],
    domande: [
      { id: "ricetta", testo: "Ha la ricetta?", risposta: "Sì, dell'oculista: è di un mese fa.", rivela: "ricetta", chiave: true },
      { id: "notte", testo: "Guida di notte?", risposta: "Tutte le sere, in autostrada. Che riflessi!", rivela: "riflessi", chiave: true },
      { id: "segni", testo: "Dolore? Lampi?", risposta: "No, niente." },
      { id: "vicino", testo: "E da vicino?", risposta: "Da vicino tolgo gli occhiali e leggo." },
      { id: "sottili", testo: "Li vuole sottili?", risposta: "Gliel'ho appena detto!", giaDetto: true },
    ],
    posti: {
      materiale: [
        { id: "cr39", nome: "Organico 1,5", esito: "no", perche: "Con una miopia forte l'1,5 resta spesso.", materiale: "cr39" },
        { id: "i160", nome: "Organico 1,6", esito: "ok", perche: "Meglio dell'1,5, ma resta un po' spesso.", materiale: "i160" },
        { id: "i167", nome: "Organico 1,67", esito: "bene", perche: "Più alto l'indice, più sottile la lente.", materiale: "i167" },
        { id: "i174", nome: "Organico 1,74", esito: "bene", perche: "Ancora più sottile, di poco: con l'antiriflesso va bene.", materiale: "i174" },
        { id: "pc", nome: "Policarbonato", esito: "ok", perche: "Più sottile dell'1,5, ma meno dell'1,67.", materiale: "pc" },
      ],
      trattamento: [
        { id: "no", nome: "Nessuno", esito: "no", perche: "Di notte, in autostrada, senza antiriflesso i riflessi restano.", antiriflesso: false },
        { id: "ar", nome: "Antiriflesso", esito: "bene", perche: "Di notte toglie quasi tutti i riflessi della lente.", antiriflesso: true, serve: "verdino" },
      ],
      montatura: [
        { id: "sua", nome: "La sua, 56□18", esito: "no", perche: "Calibro grande e centri lontani dagli occhi: bordo spesso.", montatura: { calibro: 56, ponte: 18 } },
        { id: "m50", nome: "Più piccola, 50□18", esito: "bene", perche: "Più piccolo il calibro, più sottile la lente.", montatura: { calibro: 50, ponte: 18 } },
      ],
    },
    serveLente: true,
    dubbi: [{
      id: "spessa", quando: "lenteForte",
      domanda: "Perché ai bordi è spessa e al centro no?",
      mostra: [{ id: "dilato", esito: "risponde" }, { id: "confronto", esito: "vero" }, { id: "goccia", esito: "fuori" }],
      risposta: "Col meno è spessa al bordo: più forte e più larga, più spessa.",
    }],
    aiuti: {
      ricetta: "Ogni riga è un occhio; la sfera è il primo numero.",
      posti: {
        materiale: "Più alto l'indice, più sottile la lente.",
        trattamento: "Di notte i riflessi della lente li toglie l'antiriflesso.",
        montatura: "Più piccolo il calibro, più sottile la lente.",
      },
      mostra: "Fai vedere la lente di lato.",
    },
    ciVedo: "Sottili! E di notte niente più riflessi.",
    fine: "Calibro piccolo e indice alto; con l'indice alto, l'antiriflesso.",
  },

  /* ---------- 4 · il sole: la polarizzata, la categoria, la guida ---------- */
  {
    id: "c4", n: 4, titolo: "Il lago",
    cliente: {
      nome: "Paolo", eta: 38, lavoro: "pesca la domenica",
      frase: "Vorrei occhiali da sole da vista, per pescare a mezzogiorno.",
      indizio: "Ha una canna da pesca sottobraccio.",
      aspetto: { pelle: "#c98b62", capelli: "#6b5a48", maglia: "#5f7f3a", occhiali: true },
    },
    occhio: { od: s(-2), os: s(-2.25) },
    dp: 64,
    vecchi: { od: s(-2), os: s(-2.25), vedeBene: true, frase: "Li ho fatti a marzo: ci vedo benissimo." },
    scena: "lago", scenaProva: "strada",
    bisogni: [{ tipo: "sole", nome: "Sole" }, { tipo: "abbagliamento", nome: "Riflesso dell'acqua", nascosto: true }, { tipo: "guida", nome: "Guida", nascosto: true }],
    domande: [
      { id: "disturba", testo: "Cosa la disturba?", risposta: "Il riflesso dell'acqua: non vedo il galleggiante.", rivela: "abbagliamento", chiave: true },
      { id: "guida", testo: "Torna in macchina?", risposta: "Sì, un'ora di strada, sotto il sole.", rivela: "guida", chiave: true },
      { id: "occhiali", testo: "Ha occhiali suoi?", risposta: "Sì, fatti a marzo: con quelli vedo bene." },
      { id: "segni", testo: "Dolore? Lampi?", risposta: "No, niente." },
      { id: "sole", testo: "Pesca al sole?", risposta: "Gliel'ho detto: a mezzogiorno!", giaDetto: true },
    ],
    posti: {
      materiale: [
        { id: "cr39", nome: "Organico 1,5", esito: "bene", perche: "Con poche diottrie l'1,5 va benissimo.", materiale: "cr39" },
        { id: "pc", nome: "Policarbonato", esito: "ok", perche: "Regge gli urti, ma qui non serviva.", materiale: "pc" },
      ],
      filtro: [
        { id: "no", nome: "Nessuno", esito: "no", perche: "Al lago a mezzogiorno serve una lente da sole.", filtro: null },
        { id: "b2", nome: "Bruno, categoria 2", esito: "no", perche: "Chiara per mezzogiorno, e il riflesso dell'acqua resta.", filtro: { categoria: 2, polarizzata: false }, serve: "bruno" },
        { id: "b3", nome: "Bruno, categoria 3", esito: "ok", perche: "Va bene, ma il riflesso dell'acqua resta.", filtro: { categoria: 3, polarizzata: false }, serve: "bruno" },
        {
          id: "b4", nome: "Bruno, categoria 4", esito: "no", perche: "Troppo scura per il lago: la 4 è da ghiacciaio.", filtro: { categoria: 4, polarizzata: false }, serve: "bruno",
          seScoperto: { rivela: "guida", esito: "grave", perche: "La categoria 4 non va mai alla guida." },
        },
        { id: "p2", nome: "Polare, categoria 2", esito: "ok", perche: "Riduce il riflesso, ma al sole forte è chiara.", filtro: { categoria: 2, polarizzata: true }, serve: "polare" },
        { id: "p3", nome: "Polare, categoria 3", esito: "bene", perche: "Riduce molto il riflesso dell'acqua, e si guida.", filtro: { categoria: 3, polarizzata: true }, serve: "polare" },
      ],
      montatura: [{ id: "sole", nome: "Da sole, 54□18", esito: "bene", perche: "Non avvolgente: per la vista va bene.", montatura: { calibro: 54, ponte: 18 } }],
    },
    serveLente: true,
    dubbi: [{
      id: "schermo", quando: "polarizzata",
      domanda: "Col telefono lo schermo diventa nero: è rotta?",
      mostra: [{ id: "polarizzate", esito: "risponde" }, { id: "dilato", esito: "fuori" }, { id: "goccia", esito: "fuori" }],
      risposta: "Non è rotta: lo schermo manda luce polarizzata, e lei la ferma.",
    }],
    aiuti: {
      posti: { filtro: "Sull'acqua serve la polarizzata; alla guida mai la 4." },
      mostra: "Fai vedere due polarizzate incrociate.",
    },
    ciVedo: "Vedo il galleggiante! E l'acqua non acceca più.",
    fine: "Sull'acqua la polarizzata. Alla guida, mai la categoria 4.",
  },

  /* ---------- 5 · l'allarme: un calo all'improvviso ---------- */
  {
    id: "c5", n: 5, titolo: "Da ieri",
    cliente: {
      nome: "Luisa", eta: 61, lavoro: "in pensione",
      frase: "Da ieri vedo sfocato dall'occhio destro. Mi rifate gli occhiali?",
      indizio: "Si copre l'occhio sinistro e guarda la strada.",
      aspetto: { pelle: "#f0c9a8", capelli: "#cfcfcf", maglia: "#7b5ea7", occhiali: true, lunghi: true },
    },
    // come dice di vedere: il destro sfocato con i suoi occhiali. Il perché non si simula e non si cerca: si chiede.
    occhio: { od: s(-0.5), os: s(1) },
    dp: 60,
    vecchi: { od: s(1), os: s(1), vedeBene: false, frase: "Fino a ieri ci vedevo bene." },
    scena: "strada",
    bisogni: [{ tipo: "lontano", nome: "Lontano" }],
    domande: [
      { id: "improvviso", testo: "All'improvviso?", risposta: "Sì, ieri sera, guardando la TV. Prima niente.", rivela: "allarme", chiave: true },
      { id: "dolore", testo: "Ha dolore?", risposta: "No, nessun dolore. Solo questa nebbia." },
      { id: "lampi", testo: "Lampi? Una tenda?", risposta: "No, solo sfocato." },
      { id: "occhiali", testo: "Porta occhiali?", risposta: "Le progressive di un anno fa." },
      { id: "quale", testo: "Quale occhio?", risposta: "Gliel'ho detto: il destro.", giaDetto: true },
    ],
    // l'occhiale c'è come negli altri casi: l'allarme si scopre chiedendo, non guardando lo schermo
    posti: {
      materiale: [{ id: "cr39", nome: "Organico 1,5", esito: "bene", perche: "Con poche diottrie l'1,5 va benissimo.", materiale: "cr39" }],
      trattamento: [{ id: "no", nome: "Nessuno", esito: "bene", perche: "Qui non serve altro.", antiriflesso: false }],
      montatura: [{ id: "sua", nome: "La sua, 52□18", esito: "bene", perche: "La sua montatura va bene.", montatura: { calibro: 52, ponte: 18 } }],
    },
    serveLente: false,
    allarme: { urgenza: "subito", perche: "Un calo improvviso non aspetta: pronto soccorso ora, e non guidi." },
    aiuti: { medico: "Da ieri, da un occhio solo: è un allarme. Non si misura." },
    ciVedo: "Chiamo mia figlia e andiamo subito. Grazie!",
    fine: "Con un allarme niente misure: prima il medico.",
  },
];

/** L'ordine della mandata: un caso, un riconoscimento. */
export const ORDINE: { tipo: "caso" | "ric"; id: string }[] = [
  { tipo: "caso", id: "c1" }, { tipo: "ric", id: "r1" },
  { tipo: "caso", id: "c2" }, { tipo: "ric", id: "r2" },
  { tipo: "caso", id: "c3" }, { tipo: "ric", id: "r3" },
  { tipo: "caso", id: "c4" }, { tipo: "ric", id: "r4" },
  { tipo: "ric", id: "r5" }, { tipo: "caso", id: "c5" },
];
