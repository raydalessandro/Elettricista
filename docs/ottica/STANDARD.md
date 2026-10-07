# Standard degli esercizi di ottica

Versione 1.1 · 7 ottobre 2026 · corso «Sfera Cilindro Asse»

Questo standard dice come si scrive un livello del corso. Il corso forma un ottico a 360 gradi partendo da chi sa già vendere: chi gioca conosce la PNL e lavora con i clienti da anni. Il corso non insegna a vendere: insegna l'ottica, e col tempo tutto il mestiere, tranne la visita medica. Il giocatore deve poter arrivare alla risposta giusta ragionando su quello che vede e su quello che ha già letto. Lo usano Ray, chi scrive i livelli e gli agenti che costruiscono il corso.

- **Codice e controlli:** repository `raydalessandro/Elettricista`, cartella `src/ottica/`. Modello dell'occhio in `core/eye.ts`, prova lenti e varianti in `core/prova.ts`, dialoghi in `core/banco.ts`, contenuti in `content/`, controllo in `standard/validate.ts`, test in `tests/unit/ottica-*.test.ts` e `tests/e2e/ottica.spec.ts`.
- **Sito:** `/ottica` (la home `/` fa scegliere il corso). I progressi stanno nel localStorage, chiave `sfera-cilindro-asse.v1`.

## Il principio

> Tutto quello che serve per decidere sta sullo schermo o nelle schede già lette.
> Tutto quello che il gioco giudica è stato insegnato prima.
> Le scelte giuste non indovinano gradazioni, non fanno diagnosi e non promettono salute.

La terza riga è propria dell'ottica. La gradazione si misura, non si dice a occhio. L'unica cosa che in negozio non si fa è la visita medica: quando serve, si manda dall'oculista. Il corso non divide il lavoro in ruoli («questo lo fa l'ottico, questo il commesso»): chi gioca imparerà a fare tutto il resto.

## Vendere lo sa già

- Al banco **tutte le scelte sono dette bene**: tono, ascolto, cortesia sono al livello di un venditore esperto. Le scelte si distinguono solo per l'ottica.
- Una scelta è sbagliata perché è **sbagliata sull'ottica**: una spiegazione falsa, una lente o un materiale sbagliati, una leggenda, una promessa sulla salute, un medico rimandato. Mai perché è insistente o detta male.
- Le **domande** contano quando sono tecniche: le distanze di lavoro, gli occhiali che porta, da quando, i segnali per il medico. È l'anamnesi.
- La **titolare** commenta il contenuto tecnico. Può usare il lessico della vendita e della PNL (ricalco, guida, ancoraggio, metafora) per dire come arriva una spiegazione: è la lingua che chi gioca conosce già. Non insegna tecniche di vendita.
- Niente schede sul metodo di vendita, niente stelle per l'ascolto.

## Un solo modello dell'occhio

Tutto quello che il gioco mostra viene da `core/eye.ts`: i raggi, il fuoco davanti o dietro la retina, quanto è sfocata la scena, quanto lavora il cristallino, i decimi. Niente stati disegnati a mano.

| Cosa | Come |
|---|---|
| Difetto dell'occhio | La lente che lo corregge da lontano, sul piano degli occhiali: sfera, cilindro col meno, asse TABO |
| Luce che arriva | Vergenza −1/d (0 per lontano) |
| Sfocatura nel meridiano θ | V + A + L(θ) − E(θ): positiva = fuoco davanti alla retina |
| Accomodazione | Quella disponibile a un'età: 15 − 0,25 × età, il valore minimo atteso (Hofstetter; la media è 18,5 − 0,3 × età), mai sotto 0,5. L'occhio accomoda da solo quanto serve, se può. Col minimo, punti prossimi e addizioni escono un po' più forti della media: per il banco va bene così |
| Cristallino | A riposo (sotto 0,13 diottrie), lavora poco (fino a un quarto di quello che ha), lavora (fino a metà), in fatica, non ce la fa (o «al limite, non basta», se manca meno di 0,30 diottrie). Da lontano l'occhio giusto sta a riposo; da vicino «comodo» vuol dire al massimo «lavora». La scala la insegna la prima scheda |
| Cilindri | Vettori di potenza (Thibos): M, J0, J45 |
| Decimi | 10 ÷ (1 + 1,5B + 0,5B²), arrotondati: −1,00 non corretto ≈ 3/10 |
| Nitido / quasi / sfocato / molto | Nitido sotto 0,10 diottrie di sfocatura; poi coi decimi: quasi 6–9/10, sfocato 3–5/10, molto sfocato sotto |
| Due fuochi | Sopra 0,06 diottrie di astigmatismo che resta: se uno dei due fuochi cade dietro la retina e l'occhio può, lo porta sulla retina (una direzione nitida, l'altra no). Vale per il disegno e per le parole; decimi e nitidezza vengono dalla sfocatura complessiva |
| Disegno | Il fuoco si sposta di 20 pixel per diottria: è esagerato apposta, per vederlo |
| Scena vista dal cliente | Sfocatura gaussiana 0,6 pixel più 2,6 pixel per diottria (niente sotto 0,10 diottrie), nella direzione del meridiano. L'asse TABO si legge da davanti; chi porta gli occhiali vede lo specchio. Sul quadrante le parole dicono quali righe restano nitide, come un orologio («dalle 2 alle 8») |

Se un caso del capitolo non torna con il modello, si cambia il caso, non il disegno.

## Com'è fatto un livello

1. **Il cliente**: chi entra e cosa dice, più «Cosa impari». Nella giornata in negozio, al posto del cliente c'è la scena.
2. **Teoria**: due-cinque schede corte, con un laboratorio da toccare e il lessico (tecnico ↔ come lo dice il cliente, o come si dice in negozio). In fondo alla scheda, il consiglio di mestiere della **titolare**.
3. **Prova**: prima una scommessa (cosa serve?), poi l'occhiale di prova (lente da trovare, addizione per leggere, asse del cilindro), oppure la ricetta da leggere toccando i numeri e i quattro occhiali da provare. Lo schermo dice che è una simulazione semplificata, per capire cosa fa la lente.
4. **Il banco**: il dialogo. A ogni mossa il giocatore sceglie cosa dire; il cliente reagisce e la titolare commenta subito. Con una scelta sbagliata si riprova la stessa mossa.
5. **Domande dal laboratorio**: tre domande per ripassare, una può tornare su un livello già fatto. Non danno stelle, e lo schermo lo dice.
6. **Esito**: tre stelle.

| Stella | Quando si prende |
|---|---|
| Occhio (Ricetta nel livello della ricetta) | Scommessa giusta e lente (o asse) giusta alla prima conferma; per la ricetta, tutti i numeri giusti al primo tocco |
| Spiegazione | Ogni mossa di anamnesi e di spiegazione con la scelta migliore al primo colpo |
| Soluzione | Ogni mossa di soluzione con la scelta migliore al primo colpo, e nessun errore grave |
| Giornata in negozio | Una stella per cliente servito senza risposte sbagliate |

Le regole delle stelle stanno anche sullo schermo, sotto la prova e sotto il banco. Le mosse del dialogo hanno una fase: `anamnesi` (le domande tecniche), `spiegazione` (il fenomeno ottico detto al cliente), `soluzione` (lente, materiale, trattamento, occhiale, o il medico).

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
| O4 | **Dialogo ben fatto** | Il dialogo comincia con una battuta del cliente. Ogni mossa ha almeno due scelte, almeno una migliore, ognuna con la reazione del cliente e il commento della titolare. Nei livelli normali ci sono mosse di anamnesi o spiegazione e mosse di soluzione. Solo una scelta `best` o `ok` può avere la sua fine (`end`): il dialogo si chiude lì, il cliente se ne va. |
| O5 | **Prova con una sola risposta, in ogni variante** | Il controllo prova tutti i valori del comando, variante per variante: una sola soluzione, la prova non parte già risolta, almeno due aiuti e l'ultimo (con i numeri della variante) dà la soluzione. Avviso se tutte le varianti hanno la stessa soluzione. Nella ricetta ogni risposta è una casella piena. |
| O6 | **Numeri plausibili** | Diottrie a quarti, cilindro col meno, asse tra 1 e 180, addizione tra +0,75 e +3,50 e adatta all'età (tabella sotto), in ogni variante. |
| O7 | **Numeri scritti come in negozio** | Diottrie con segno tipografico, virgola e due decimali: «−1,75», «+2,00». Si controlla con i numeri di ogni variante, e nessun `{segnaposto}` resta senza valore. |
| O8 | **Testi da telefono** | Il cliente si presenta in 170 caratteri; battute 220; scelte 260 (avviso sopra 220); risposte 200; commenti 260; paragrafi delle schede 460. |
| O9 | **Niente gradazioni a occhio** | Una scelta giusta non dice mai una gradazione, nemmeno con i numeri della variante: la gradazione si misura. Una scelta sbagliata non dice mai lo stesso numero che il dialogo rivela dopo (esito del controllo, ricetta), in nessuna variante: chi l'ha scelta penserebbe di averci preso. |
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

- **Le scelte sbagliate sono errori di ottica, detti bene**: la leggenda («l'occhio si impigrisce»), la spiegazione falsa ma convincente, la lente o il materiale sbagliati per quell'uso, la promessa sul trattamento. Stesso registro delle giuste: niente fretta, niente vendita in più, niente assoluti («obbligatorie», «indispensabile», «in assoluto»); anche le sbagliate dicono «di solito», e anche le giuste sanno essere decise. Nessuna scelta saluta: il saluto c'è già, prima.
- **La titolare loda l'ottica**, non la tecnica di vendita: il lessico della PNL può comparire, ma il commento dice cosa è giusto o sbagliato sull'occhio, sulla lente, sulla montatura.
- **Che cosa è grave** (`grave`). Una gradazione detta a occhio; una diagnosi; una promessa o una minaccia sulla salute (il filtro luce blu che «ferma la miopia», i premontati che «rovinano la vista»); un collirio o un farmaco consigliati, che vuol dire aver già deciso la causa; un pericolo (gli occhiali da lettura per guidare, le lenti di vetro a un bambino, le scale guardate dalla parte bassa della progressiva); far perdere tempo a chi ha bisogno del medico (occhio rosso, dolore, lampi, una tenda, calo improvviso); lenti a contatto senza prova.
- **Sbagliato ma non grave** (`no`): una spiegazione sbagliata senza pericolo, una lente o un trattamento che non servono, una domanda che non c'entra, una ricetta normale presa per sbagliata.
- **Giusto ma incompleto** (`ok`): la mossa regge, ma manca un pezzo tecnico (il controllo senza anamnesi, l'astuccio senza il consiglio delle due mani). Se fa andare via il cliente, ha la sua fine (`end`) e il dialogo si chiude lì.
- **I numeri delle scelte sbagliate** non coincidono mai con l'esito del controllo o con una variante (O9).
- **Lei e tu.** Si dà del Lei; si passa al tu se il cliente lo chiede.
- **Onestà.** Ogni trattamento si descrive per quello che fa davvero. L'antiriflesso riduce molto i riflessi. Il filtro luce blu si può offrire, ma non è dimostrato che tolga la stanchezza, e non ci sono prove che gli schermi rovinino la retina. Le fotocromatiche reagiscono agli ultravioletti del sole, e dietro il parabrezza si scuriscono poco. Le lenti per la miopia dei bambini la rallentano, non la fermano.
- **La visita.** Il controllo della vista misura il difetto; la visita dall'oculista controlla la salute dell'occhio. Bambini, segnali d'allarme, interventi e colliri passano dalla visita.

## Prova alla cieca

Prima di pubblicare un capitolo:

1. `npm run build:artifact && npm run packets:ottica` prepara i pacchetti: testi e foto delle schermate, livello per livello, con gli aiuti in un file a parte.
2. Un revisore che non ha visto il progetto, nei panni di un venditore esperto che non sa niente di ottica, gioca i livelli con `npx tsx scripts/negozio.ts <livello> <seme>` (prova, banco e domande da riga di comando, comandi da stdin). Il seme decide la ricetta del cliente e l'ordine delle opzioni: con semi diversi si giocano varianti diverse.
3. Un secondo revisore, esperto di ottica, legge schede, dialoghi e domande e segna ogni affermazione dubbia.
4. Ogni assunzione su qualcosa che non è sullo schermo è un difetto, e così ogni affermazione falsa o non verificabile, e ogni scelta che si riconosce dal tono invece che dall'ottica.

## Storia

- **1.1 · 7 ottobre 2026.** Il corso non insegna a vendere: chi gioca sa già farlo. Via la scheda delle «quattro mosse» e le stelle dell'ascolto; al banco le scelte si distinguono solo per l'ottica (stelle «Spiegazione» e «Soluzione»). Via «chi fa cosa»: resta solo la visita medica. Più mestiere nel capitolo 1: materiali e indici delle lenti, trasposizione, raddrizzare una montatura.
- **1.0 · 7 ottobre 2026.** Prima versione, con il capitolo 1 «L'occhio e le lenti»: varianti dei clienti, titolare al banco, fine anticipata dei dialoghi.
