# Standard degli esercizi di ottica

Versione 1.0 · 7 ottobre 2026 · corso «Sfera Cilindro Asse»

Questo standard dice come si scrive un livello del corso per chi sta al banco di un negozio di ottica: l'addetto vendite, non l'ottico. Il giocatore deve poter arrivare alla risposta giusta ragionando su quello che vede e su quello che ha già letto. Lo usano Ray, chi scrive i livelli e gli agenti che costruiscono il corso.

- **Codice e controlli:** repository `raydalessandro/Elettricista`, cartella `src/ottica/`. Modello dell'occhio in `core/eye.ts`, prova lenti e varianti in `core/prova.ts`, dialoghi in `core/banco.ts`, contenuti in `content/`, controllo in `standard/validate.ts`, test in `tests/unit/ottica-*.test.ts` e `tests/e2e/ottica.spec.ts`.
- **Sito:** `/ottica` (la home `/` fa scegliere il corso). I progressi stanno nel localStorage, chiave `sfera-cilindro-asse.v1`.

## Il principio

> Tutto quello che serve per decidere sta sullo schermo o nelle schede già lette.
> Tutto quello che il gioco giudica è stato insegnato prima.
> Le scelte giuste non misurano la vista, non fanno diagnosi e non promettono salute.

La terza riga è propria dell'ottica. In negozio la vista la misura l'ottico optometrista o l'oculista. Chi sta al banco accoglie, chiede, spiega, propone, fa le piccole regolazioni che gli hanno insegnato e manda dal medico quando serve.

## Un solo modello dell'occhio

Tutto quello che il gioco mostra viene da `core/eye.ts`: i raggi, il fuoco davanti o dietro la retina, quanto è sfocata la scena, quanto lavora il cristallino, i decimi. Niente stati disegnati a mano.

| Cosa | Come |
|---|---|
| Difetto dell'occhio | La lente che lo corregge da lontano, sul piano degli occhiali: sfera, cilindro col meno, asse TABO |
| Luce che arriva | Vergenza −1/d (0 per lontano) |
| Sfocatura nel meridiano θ | V + A + L(θ) − E(θ): positiva = fuoco davanti alla retina |
| Accomodazione | Quella disponibile a un'età: 15 − 0,25 × età, il valore minimo atteso (Hofstetter; la media è 18,5 − 0,3 × età), mai sotto 0,5. L'occhio accomoda da solo quanto serve, se può. Col minimo, punti prossimi e addizioni escono un po' più forti della media: per il banco va bene così |
| Cristallino | A riposo (sotto 0,13 diottrie), lavora poco (fino a un quarto di quello che ha), lavora (fino a metà), in fatica, non ce la fa. Da lontano l'occhio giusto sta a riposo; da vicino «comodo» vuol dire al massimo «lavora». La scala la insegna la prima scheda |
| Cilindri | Vettori di potenza (Thibos): M, J0, J45 |
| Decimi | 10 ÷ (1 + 1,5B + 0,5B²), arrotondati: −1,00 non corretto ≈ 3/10 |
| Nitido / quasi / sfocato / molto | Nitido sotto 0,10 diottrie di sfocatura; poi coi decimi: quasi 6–9/10, sfocato 3–5/10, molto sfocato sotto |
| Due fuochi | Sopra 0,06 diottrie di astigmatismo che resta: se uno dei due fuochi cade dietro la retina e l'occhio può, lo porta sulla retina (una direzione nitida, l'altra no). Vale per il disegno e per le parole; decimi e nitidezza vengono dalla sfocatura complessiva |
| Disegno | Il fuoco si sposta di 20 pixel per diottria: è esagerato apposta, per vederlo |
| Scena vista dal cliente | Sfocatura gaussiana 2,6 pixel per diottria, nella direzione del meridiano. L'asse TABO si legge da davanti; chi porta gli occhiali vede lo specchio |

Se un caso del capitolo non torna con il modello, si cambia il caso, non il disegno.

## Com'è fatto un livello

1. **Il cliente**: chi entra e cosa dice, più «Cosa impari». Nella giornata in negozio, al posto del cliente c'è la scena.
2. **Teoria**: due-cinque schede corte, con un laboratorio da toccare e il lessico (tecnico ↔ come lo dice il cliente, o come lo dici tu al cliente). Il consiglio in fondo alla scheda è della **titolare** del negozio.
3. **Prova**: prima una scommessa (cosa serve?), poi l'occhiale di prova: lente da trovare (sfera), addizione per leggere, asse del cilindro, oppure la ricetta da leggere toccando i numeri e i quattro occhiali da provare. Nell'occhiale di prova il giocatore è **al posto dell'optometrista, per capire**: lo schermo lo dice, e in negozio quella prova non la fa lui.
4. **Il banco**: il dialogo. A ogni mossa il giocatore sceglie cosa dire; il cliente reagisce e la titolare commenta subito. Con una scelta sbagliata si riprova la stessa mossa.
5. **Domande dal laboratorio**: tre domande per ripassare, una può tornare su un livello già fatto. Non danno stelle, e lo schermo lo dice.
6. **Esito**: tre stelle.

| Stella | Quando si prende |
|---|---|
| Occhio (Ricetta nel livello della ricetta) | Scommessa giusta e lente (o asse) giusta alla prima conferma; per la ricetta, tutti i numeri giusti al primo tocco |
| Ascolto | Ogni mossa di ascolto con la scelta migliore al primo colpo |
| Consiglio | Ogni mossa di spiegazione e di proposta con la scelta migliore al primo colpo, e nessun errore grave |
| Giornata in negozio | Una stella per cliente servito senza risposte sbagliate |

Le regole delle stelle stanno anche sullo schermo, sotto la prova e sotto il banco.

### Varianti: a ogni partita il cliente ha la sua ricetta

Nei livelli con l'occhiale di prova, `variants` elenca i casi possibili: a ogni partita se ne pesca uno (mai lo stesso due volte di fila). Una variante cambia l'occhio del cliente (ricetta ed età) e, per l'asse, la lente di partenza. I testi del livello (obiettivo, aiuti, note e battute del banco) usano `{chiave}`: il gioco, la riga di comando e il controllo la sostituiscono con `vars` della variante. Così la prova non si impara a memoria: si ragiona ogni volta.

I laboratori delle schede usano occhi e numeri diversi da quelli dei clienti: la scheda insegna, la prova non si copia.

## Regole

I codici sono quelli che stampa `npm run standard`.

| Codice | Regola | In pratica |
|---|---|---|
| O1 | **Livello completo** | Numeri in fila, titolo e sottotitolo corti, cliente, «Cosa impari», schede, almeno tre domande. Un livello normale ha una prova e un dialogo; la giornata in negozio pesca più clienti, una stella per cliente. |
| O2 | **Schede** | Ogni scheda dichiara cosa insegna (`teaches`). I laboratori hanno un nome tipizzato: contenuto e interfaccia non possono andare fuori sincrono. |
| O3 | **Insegnato prima** | Prova, scelte del dialogo e domande dichiarano cosa richiedono (`requires`); deve essere insegnato in quel livello o prima. |
| O4 | **Dialogo ben fatto** | Il dialogo comincia con una battuta del cliente. Ogni mossa ha almeno due scelte, almeno una migliore, ognuna con la reazione del cliente e il consiglio della titolare. Nei livelli normali ci sono mosse di ascolto e mosse di spiegazione o proposta. Solo una scelta `best` o `ok` può avere la sua fine (`end`): il dialogo si chiude lì, il cliente se ne va. |
| O5 | **Prova con una sola risposta, in ogni variante** | Il controllo prova tutti i valori del comando, variante per variante: una sola soluzione, la prova non parte già risolta, almeno due aiuti e l'ultimo (con i numeri della variante) dà la soluzione. Avviso se tutte le varianti hanno la stessa soluzione. Nella ricetta ogni risposta è una casella piena. |
| O6 | **Numeri plausibili** | Diottrie a quarti, cilindro col meno, asse tra 1 e 180, addizione tra +0,75 e +3,50 e adatta all'età (tabella sotto), in ogni variante. |
| O7 | **Numeri scritti come in negozio** | Diottrie con segno tipografico, virgola e due decimali: «−1,75», «+2,00». Si controlla con i numeri di ogni variante, e nessun `{segnaposto}` resta senza valore. |
| O8 | **Testi da telefono** | Il cliente si presenta in 170 caratteri; battute 220; scelte 260 (avviso sopra 220); risposte 200; consigli 260; paragrafi delle schede 460. |
| O9 | **Ruoli** | Una scelta giusta non dice mai una gradazione, nemmeno con i numeri della variante. Diagnosi, gradazioni, promesse sulla salute e pericoli sono scelte sbagliate, quasi sempre gravi. |
| O10 | **Domande e scelte ben fatte** | Domande con almeno tre opzioni diverse e il perché. Il gioco mescola le opzioni. La scelta migliore non si riconosce dalla lunghezza: è la più lunga al massimo nel 40% delle mosse, e la più corta al massimo nel 40%. |

### Addizione plausibile per età (O6)

| Età | Addizione |
|---|---|
| 40–44 | +0,75 … +1,25 |
| 45–49 | +1,00 … +1,75 |
| 50–54 | +1,50 … +2,25 |
| 55–59 | +2,00 … +2,75 |
| 60 e oltre | +2,25 … +3,50 |

Sono valori di negozio, larghi apposta: servono a fermare un errore di battitura, non a prescrivere.

## Come si scrive il dialogo

- **Le scelte sbagliate sono errori veri** dei commessi, scritti in modo convincente: la promozione prima del bisogno, la leggenda («l'occhio si impigrisce»), la diagnosi detta con sicurezza, il prodotto più caro «così non sbaglia».
- **Che cosa è grave** (`grave`). Dire una gradazione o una diagnosi; promettere effetti sulla salute (il filtro luce blu che «ferma la miopia»); un pericolo (gli occhiali da lettura per guidare, le lenti di vetro a un bambino, guardare le scale dalla parte bassa della progressiva); far perdere tempo a chi ha bisogno del medico (occhio rosso, dolore, lampi, una tenda, calo improvviso), anche con un collirio o un farmaco; lenti a contatto senza prova; screditare con falsità.
- **Sbagliato ma non grave** (`no`): una spiegazione sbagliata senza pericolo, una proposta fuori luogo, un consiglio che non risolve, un collirio consigliato a chi non ha segnali d'allarme (non è il tuo ruolo), chiudere il cliente invece di ascoltarlo.
- **I numeri delle scelte sbagliate** non coincidono mai con l'esito del controllo o con una variante: chi sceglie la gradazione «a occhio» non deve poter pensare di averci preso.
- **«Va bene, ma…»** (`ok`) è una scelta accettabile che non prende la stella: per esempio proporre il controllo della vista senza aver fatto nessuna domanda. Se la scelta `ok` fa andare via il cliente, ha la sua fine (`end`) e il dialogo si chiude lì.
- **Chi fa cosa.** Il commesso accoglie, chiede, spiega, propone; fa le piccole regolazioni (viti, naselli) solo se gliele hanno insegnate. L'ottico optometrista misura la vista, prende le misure, regola le montature con lenti graduate e monta le lenti. Le lenti a contatto le applica l'ottico abilitato, con una prova. L'oculista è il medico: visite, malattie, bambini, interventi, colliri. Per legge (R.D. 1334/1928, art. 12) l'ottico senza ricetta medica fa occhiali solo per miopia e presbiopia; l'optometrista misura la vista e prepara le lenti anche per ipermetropia e astigmatismo, senza fare diagnosi (Cassazione penale n. 27853/2001). In negozio valgono le procedure del negozio.
- **Lei e tu.** Il commesso dà del Lei; passa al tu se il cliente glielo chiede.
- **Onestà.** Ogni trattamento si descrive per quello che fa davvero. L'antiriflesso riduce molto i riflessi. Il filtro luce blu si può offrire, ma non è dimostrato che tolga la stanchezza, e non ci sono prove che gli schermi rovinino la retina. Le fotocromatiche reagiscono agli ultravioletti del sole, e dietro il parabrezza si scuriscono poco. Le lenti per la miopia dei bambini la rallentano, non la fermano.

## Prova alla cieca

Prima di pubblicare un capitolo:

1. `npm run build:artifact && npm run packets:ottica` prepara i pacchetti: testi e foto delle schermate, livello per livello, con gli aiuti in un file a parte.
2. Un revisore che non ha visto il progetto gioca i livelli con `npx tsx scripts/negozio.ts <livello> <seme>` (prova, banco e domande da riga di comando, comandi da stdin). Il seme decide la ricetta del cliente e l'ordine delle opzioni: con semi diversi si giocano varianti diverse.
3. Un secondo revisore, esperto di ottica, legge schede, dialoghi e domande e segna ogni affermazione dubbia.
4. Ogni assunzione su qualcosa che non è sullo schermo è un difetto, e così ogni affermazione falsa o non verificabile.

## Storia

- **1.0 · 7 ottobre 2026.** Prima versione, con il capitolo 1 «L'occhio e le lenti»: varianti dei clienti, titolare al banco, fine anticipata dei dialoghi, regole su chi fa cosa.
