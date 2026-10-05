# Standard degli esercizi sugli impianti

Versione 1 · 4 ottobre 2026 · gioco «Fase Neutro Terra»

Questo standard dice come si progetta un esercizio di cablaggio perché il giocatore possa sempre arrivare alla soluzione giusta ragionando su quello che vede. Vale per i nove interventi di oggi e per gli impianti completi di domani. Lo usano Ray, chi scrive i livelli e gli agenti che costruiscono il gioco.

- **Gioco:** https://claude.ai/artifact/G3B1DVWiLSYvHjvYYo2onC
- **Codice e controlli:** repository `raydalessandro/Elettricista` (Next.js + TypeScript, pubblicato su Vercel). Motore in `src/core/`, contenuti in `src/content/`, controllo in `src/standard/`, test in `tests/`.

## Da dove nasce

Nel livello del lampadario il ritorno arrivava già al soffitto (il filo nero), ma niente sulla tavola diceva che veniva dall'interruttore a muro. Ray ha letto correttamente quello che vedeva: mancava un filo da tirare. Il livello era risolvibile solo deducendo una cosa non mostrata.

Una prova alla cieca su tutti i livelli ha trovato lo stesso difetto in altre forme, in 9 livelli su 9:
- neutro e terra che arrivavano da un cavo senza origine;
- misure di sicurezza su fili che sul posto di lavoro non c'erano;
- coppie dell'invertitore non disegnate;
- regole controllate dal collaudo e mai insegnate (fori del morsetto a leva uniti, sezione della terra, colore degli scambi);
- una missione impossibile dalla situazione iniziale;
- un pannello che copriva metà della tavola.

Con gli impianti completi questi difetti si moltiplicano. Lo standard li ferma in quattro modi: regole di progetto, un formato dati che le rende verificabili, controlli automatici e una prova alla cieca prima di pubblicare.

## Il principio

> Tutto quello che serve per decidere sta sullo schermo o nelle schede già lette.
> Tutto quello che il collaudo giudica è stato insegnato prima.

## Due strati: grafo elettrico e grafo fisico

Ogni esercizio ha due strati.

- **Strato elettrico.** Cosa è collegato a cosa (le reti). Il motore lavora qui: prova tutte le combinazioni dei comandi e controlla la regola d'arte.
- **Strato fisico.** Dove stanno le cose e come arrivano: zone (scatole, pareti, soffitto), cavi con un nome, tubi, pezzi già collegati.

Regola madre: ogni collegamento elettrico che il giocatore non può toccare deve avere una traccia fisica che può vedere. Il lampadario violava proprio questa: nello strato elettrico l'interruttore era collegato al nero, nello strato fisico non c'era niente.

## Regole di progetto

I codici sono gli stessi che stampa il controllo automatico (`npm run standard`, codice in `src/standard/validate.ts`).

| Codice | Regola | Cosa vuol dire in pratica |
|---|---|---|
| S1 | **Origine dei fili** | Ogni filo che arriva esce da un cavo con un nome: la linea del quadro («Luci C10») o la provenienza, che nomina un pezzo o un posto («dall'interruttore», «dalla spina»). Non bastano «cavo» o «N·PE», e nemmeno «dal tubo»: il tubo dice per dove passa un filo, non da dove arriva. |
| S2 | **Niente collegamenti invisibili** | Un collegamento nascosto è ammesso solo in due casi. Primo: tra il quadro e un filo che arriva (lo spiega S1). Secondo: verso un pezzo «già collegato» che dice a cosa è collegato (`lockedMsg`). Se da quel pezzo un filo riemerge da un'altra parte, serve anche un tubo disegnato fino al cavo da cui esce (`tubes.links`), e quel cavo lo nomina (`cables.from`). |
| S3 | **Fili già posati** | I fili già collegati sono disegnati, partono da un cavo con un nome, e la nota sopra la tavola lo dice. |
| S4 | **Sicurezza coerente** | Le misure proposte coprono esattamente i conduttori presenti dove si lavora: ogni fase e ogni ritorno contro neutro e contro terra (se ci sono), più neutro–terra. Nessuna misura su fili assenti. La linea da staccare compare scritta su un cavo, salvo la trappola dichiarata `trap: "etichette"`. Il ritorno si misura con l'interruttore acceso: a interruttore spento la misura non vale. |
| S5 | **Soluzione giocabile** | La soluzione di riferimento si inserisce con le stesse regole dell'interfaccia (fin dove arriva un filo; un filo per foro nel morsetto a leva, due per morsetto a vite; fili nuovi permessi o no) e passa il collaudo senza rilievi. |
| S6 | **Tutte le soluzioni corrette passano** | Il collaudo giudica il comportamento, mai il confronto con la soluzione. Devono passare le simmetrie dei frutti (L/N sulla presa, morsetti dell'interruttore, uscite del deviatore, coppie dell'invertitore) e le varianti comuni, scritte in `alternatives`. Se una variante comune ha bisogno di un pezzo (per esempio un morsetto in più per far passare il ritorno dalla scatola), la tavola lo offre. |
| S7 | **Errori tipici** | Ogni livello elenca gli errori che un principiante fa davvero, con l'esito atteso. Devono essere possibili nel gioco: l'interfaccia lascia sbagliare e il collaudo spiega perché. Bloccare un errore è ammesso solo se è fisicamente impossibile (filo troppo corto, foro occupato), e allora si spiega subito. |
| S8 | **Regole insegnate prima** | Ogni scheda dichiara cosa insegna (`teaches`). Ogni concetto che serve per risolvere o che il collaudo controlla va insegnato in quel livello o prima. Il controllo ricava da solo i requisiti dalla tavola (vedi sotto) e li somma a quelli scritti in `requires`. |
| S9 | **Impaginazione da telefono** | Tavola larga 360. I nomi di zone e cavi ci stanno per intero (il controllo stima la larghezza delle lettere con margine). Ogni pezzo sta dentro la sua zona. I punti da toccare distano almeno 28 l'uno dall'altro. Le scritte dei frutti stanno dentro il frutto. Niente pannelli fissi che coprono la tavola a riposo. |
| S10 | **Istruzioni coerenti** | Le istruzioni nascono dalla tavola: punte da collegare sì o no, fili nuovi sì o no, quanto arriva un filo. Se ci sono pezzi già collegati, la nota lo dice. Se il livello permette fili nuovi, la soluzione li usa, e viceversa. |
| S11 | **Aiuti** | Almeno due suggerimenti. Con l'ultimo il livello si risolve. |
| S12 | **Storia fisica coerente** | Un filo con un capo libero non «prosegue» da un'altra parte. Se la chiamata nomina un pezzo che c'era (il vecchio interruttore), la tavola lo mostra oppure la nota dice che è stato tolto. Al negozio si va prima di staccare la corrente. |
| S13 | **Missioni raggiungibili** | Ogni missione si completa dalla situazione iniziale con le azioni scritte nella missione. I tempi del gioco (contatore 4 s, ciabatta 2 s) stanno nei dati, e li usano sia il gioco sia il controllo. |
| S14 | **Indagini risolvibili col metodo** | Senza il colpevole il differenziale regge. Il colpevole da solo lo fa scattare. |

Regole che il controllo non può verificare, ma che valgono lo stesso:
- **Domande del controllo.** Si scrivono come regole («Si spella solo il rame che entra nel morsetto»), non come dichiarazioni di cose che il gioco non fa fare («Ho tagliato il rame»).
- **Riquadro in basso.** Compare solo quando serve: filo selezionato, primo tocco fatto, messaggio. Un messaggio da solo sparisce dopo qualche secondo e non blocca i tocchi.
- **Lessico.** Ogni termine nuovo entra nel lessico come coppia tecnico → cantiere.

### Requisiti che il controllo ricava da solo (S8)

| Se sulla tavola c'è… | …serve aver insegnato |
|---|---|
| qualsiasi livello di cablaggio | circuito, cortocircuito, colori |
| una presa | terra |
| un apparecchio in classe I | terra e classe I |
| un morsetto a leva | morsetto a leva |
| un filo che la soluzione chiude da solo in un morsetto | filo che non serve |
| fili nuovi | blu solo neutro, giallo-verde solo terra |
| una sezione minima | sezione; da 2,5 mm² in su anche «il magnetotermico protegge il cavo» |
| un filo nuovo di terra | sezione della terra |
| un interruttore da collegare | interruttore sulla fase |
| un interruttore già collegato | ritorno |
| un deviatore | deviatore; con fili nuovi anche il colore degli scambi |
| un invertitore | coppie dell'invertitore |
| un collegamento su un morsetto dove arriva già un filo posato | morsetti a vite da due fili |
| sicurezza al quadro | procedura (tester, stacca, segnala, misura) |
| trappola delle etichette | il quadro può sbagliare |
| la serata (non ha tavola) | contatore |

## Formato dei dati di un esercizio

| Campo | Cosa contiene |
|---|---|
| `zones[]` | `id`, `label`, posizione. Ogni pezzo dichiara la sua zona: un filo che arriva raggiunge solo la sua zona. |
| `cables[]` | `label` (origine: linea del quadro o «dal…»), `from` (id del pezzo da cui arriva, se c'è). |
| `tubes[]` | `d` (percorso), `color` del filo dentro, `label`, `links` (id del pezzo già collegato). |
| `comps[]` | `id`, `kind`, `zone`, posizione. Poi `locked` e `lockedMsg` per i pezzi già collegati, `top` per le lampade a soffitto (morsettiera in cima) e `classe1` per gli apparecchi con la terra. |
| `fixed[]` | Collegamenti che il giocatore non fa. Con `vis: true` sono disegnati, con partenza in `from` o percorso in `d`. Quelli nascosti seguono S2. |
| `palette`, `minSec` | Se si tirano fili nuovi e con che sezione minima. |
| `goal` | Cosa deve fare l'impianto: lampada sempre accesa, che segue un comando, comandata da più punti, prese alimentate. |
| `solution`, `alternatives`, `mistakes` | Soluzione di riferimento, varianti corrette, errori tipici con esito atteso. |
| `cards`, `requires` | Schede del livello (ognuna con `teaches`) e concetti richiesti in più. |
| `safety` | Spina o quadro (`type`), leve del quadro (`breakers`), linea da staccare (`feed`), misure (`probes`, conduttori L, R, N, PE), dove si misura (`where`), interruttore a muro (`wall`). |
| `trap` | Trappola del livello, per esempio `"etichette"`: il quadro ha una scritta sbagliata. |
| `note`, `hints`, `check` | Nota sopra la tavola, suggerimenti, domande del controllo. |

## Controlli automatici

Le regole di collegamento stanno in un modulo solo (`src/core/rules.ts`). Lo usano il gioco, quando trascini o tocchi, e i controlli: non possono divergere. I tipi in `src/core/types.ts` fermano già in scrittura un livello con un campo sbagliato.

| Comando o file | Cosa controlla |
|---|---|
| `npm run standard` | Le regole dello standard su tutti i livelli, una per una. |
| `tests/unit/engine.test.ts` | Soluzioni ed errori tipici con il motore del collaudo. |
| `tests/unit/standard.test.ts` | Zero errori dello standard. |
| `tests/unit/smoke.test.ts` | Tutto il gioco dall'inizio alla fine, schermata per schermata. |
| `tests/e2e/touch.spec.ts` | Il dito vero su un telefono 390×844: trascinare, agganciare, toccare due punti, spostare un capo, cambiare colore, scorrere la pagina. |
| `tests/e2e/lampadario.spec.ts` | Il caso del lampadario giocato col dito. |
| `tests/e2e/serata.spec.ts` | Le missioni della serata dalla situazione iniziale, con il contatore sempre in vista. |
| `npm run packets` | Prepara i pacchetti per la prova alla cieca. |

Tutto gira a ogni push nell'integrazione continua (GitHub Actions). Un livello si pubblica solo con zero errori. Gli avvisi si guardano uno per uno.

## Prova alla cieca

Prima di pubblicare un livello nuovo o cambiato, un revisore che non ha visto il progetto lo gioca. Può essere una persona o un agente. Il revisore riceve solo quello che vede il giocatore:
- le schermate a larghezza telefono;
- i testi e le schede già lette;
- le etichette della tavola;
- i suggerimenti in un file a parte, da aprire solo se si blocca, dicendolo.

Nel rapporto scrive:
1. cosa vede e da dove arrivano i fili;
2. i collegamenti che farebbe;
3. le assunzioni che ha dovuto fare;
4. dove si blocca o crede che la soluzione sia impossibile;
5. le incoerenze tra chiamata, schede, sicurezza e tavola;
6. i problemi di lettura.

Ogni assunzione su qualcosa che non è sullo schermo è un difetto da correggere. I collegamenti proposti si fanno passare dal motore: se un ragionamento sensato porta a un collaudo fallito, il livello va rivisto.

## Verso gli impianti completi

Lo standard regge anche quando gli esercizi diventano impianti interi.

- **Più strati fisici.** Un impianto completo ha il quadro con più linee, più scatole di derivazione e tubi tra le scatole. Ogni tubo dichiara quali conduttori porta. Ogni collegamento nascosto passa da un tubo disegnato o da un pezzo «già collegato» che lo dice (S2).
- **Collaudo a sequenze.** Con relè passo-passo, temporizzati e pulsanti non bastano le combinazioni dei comandi: servono sequenze di impulsi nel tempo. Il formato è una tabella di passi (premo P1, lampada accesa; premo P2, lampada spenta…), sullo stesso modello dei test dentro i circuiti di Digital (simulatore open, GPL-3). Si copia l'idea, non il codice.
- **Ordine degli esercizi.** Si segue la sequenza dei pannelli didattici per impianti civili, per esempio i 44 esercizi del pannello SMART-CIVIL ([scheda tecnica SIAD](https://www.siadsrl.net/download/schede%20tecniche/SMART-CIVIL%20impianti%20elettrici%20civili-SIAD_web.pdf)):
  - luce da un punto, con presa, da due, tre e quattro punti;
  - relè interruttore, relè commutatore, relè a tempo;
  - luce avanzata: emergenza, regolatori, crepuscolare, timer;
  - segnalazione, citofoni e videocitofoni, chiamata per hotel e ospedali, antincendio, antintrusione.

  Oggi il gioco copre la luce da uno, due e tre punti e le prese. I prossimi passi naturali sono il quarto punto e i relè.
- **Tecnologia.**
  - Next.js e TypeScript. Motore, regole e controlli si portano così come sono: sono già separati dall'interfaccia.
  - Quando la tavola diventa più grande di uno schermo, React Flow (licenza MIT) fa da editor, con zoom e spostamento. Il modo di collegare resta lo stesso: trascini con aggancio, tocchi due punti, tocchi un filo per cambiarlo.
  - Quel modo di collegare è preso come idea da PhET Circuit Construction Kit e dagli editor a nodi. Da PhET non si copia codice: le simulazioni pubblicate dopo il 29 marzo 2026 sono CC BY-NC 4.0, cioè non commerciali (quelle precedenti restano CC BY 4.0).
  - Il controllo dello standard gira a ogni modifica, nell'integrazione continua.
- **Vista schema.** Per gli schemi unifilari e multifilari si usano i simboli di QElectroTech: la libreria è CC-BY 3.0 e si riusa citando la fonte.

## Riferimenti esterni

Regola sulle licenze: si copia codice solo da progetti con licenza permissiva (MIT, BSD, Apache, CC BY). Da progetti GPL, non commerciali (CC BY-NC) o chiusi si prendono idee, non codice: così il gioco resta libero da vincoli.

| Progetto | Licenza | Cosa prendiamo |
|---|---|---|
| [MechSimulator, House Wiring Simulator](https://mechsimulator.com/tools/electrical-wiring/) | Gratis; codice sorgente non trovato | Idee: tester con puntali (tensione, corrente, continuità), verifiche prima della consegna (continuità della terra, polarità, isolamento, differenziale), guasti segnalati (interruttore sul neutro, fase e neutro invertiti, terra mancante, neutro su terra, sovraccarico, caduta di tensione). Segue le regole inglesi (BS 7671): l'anello delle prese e le spine col fusibile da noi non si usano. |
| [House Planner](https://github.com/egmalt/house-planner) | MIT | Per l'impianto completo e il preventivo: planimetria in scala, rete elettrica con linee, magnetotermici e differenziali, controlli di carico e caduta di tensione, computo materiali da un listino JSON. I controlli seguono norme russe (ПУЭ e ГОСТ Р 50571; la seconda viene dalla IEC 60364, come la CEI 64-8). Progetto giovane: primo rilascio pubblico 1 ottobre 2026. |
| [CircuitJS](https://github.com/pfalstad/circuitjs1) | GPL-2 | Idee: simulatore di circuiti generico. |
| [Digital](https://github.com/hneemann/Digital) | GPL-3 | Idee: test scritti dentro il circuito, per il collaudo a sequenze. |
| [PhET](https://phet.colorado.edu/en/licensing) | CC BY-NC 4.0 (dopo il 29 marzo 2026) | Idee: il modo di collegare trascinando. |
| [React Flow](https://github.com/xyflow/xyflow) | MIT | Codice: editor della tavola grande, con zoom e spostamento. |
| [QElectroTech](https://qelectrotech.org) | Simboli CC-BY 3.0 | Simboli per la vista schema, citando la fonte. |

## Cronologia

- **v1 · 4 ottobre 2026.** Nasce dal caso del lampadario.
  - Prima prova alla cieca con 4 revisori: difetti in 9 livelli su 9.
  - Correzioni:
    - origini scritte su tutti i cavi;
    - tubo del ritorno al lampadario;
    - neutro e terra dalla scatola nei livelli 6 e 7;
    - coppie dell'invertitore disegnate;
    - nuova scheda sul morsetto a leva;
    - quarto morsetto nel ripostiglio per far passare il ritorno dalla scatola;
    - missioni della serata riviste;
    - riquadro in basso solo quando serve;
    - negozio prima della sicurezza.
  - Seconda prova alla cieca con altri 4 revisori: nessuno ha avuto bisogno degli aiuti. I dubbi rimasti sono stati corretti:
    - da dove prende la fase l'interruttore a muro;
    - fin dove arrivano i fili che escono dal tubo;
    - colore del ritorno;
    - tasto T del differenziale;
    - nomi dei colori e «mm²»;
    - domande del controllo scritte come regole;
    - ordine della procedura: prima si prova il tester.
  - Dopo le correzioni il controllo dà 0 errori su 9 livelli. Gli aiuti ora stanno in un file a parte: nelle prime due prove erano in fondo al pacchetto, e alcuni revisori li avevano visti.
- **v1.1 · 5 ottobre 2026.** Licenza di PhET precisata. Aggiunti i riferimenti esterni e la regola sulle licenze.
