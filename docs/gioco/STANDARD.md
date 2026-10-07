# Standard di Diottri

Versione 1.0 · 7 ottobre 2026 · gioco «Diottri», mandata 2 (i due giri, grafica provvisoria)

Questo standard dice come si scrivono i casi e i riconoscimenti del gioco. Il progetto intero (mondi, storia, specie, numeri) sta in `docs/gioco/PROGETTO.md`; qui ci sono le regole che un contenuto deve rispettare per uscire. Lo usano Ray, chi scrive i contenuti e gli agenti che costruiscono il gioco.

- **Codice:** `src/diottri/`. Motori in `core/` (`caso.ts`, `riconosci.ts`, `valuta.ts`, `risolutore.ts`), contenuti in `content/`, controllo in `standard/validate.ts`, interfaccia in `ui.ts` e `draw.ts`, stile in `src/app/diottri.css` (tutto sotto `.dio`).
- **Numeri dell'ottica:** solo da `src/ottica/core` (occhio, lente, sole), senza cambiare come si comporta il corso.
- **Sito:** `/diottri`, collegato dalla home `/`. Progressi nel localStorage, chiave `diottri.v1`. Anteprima in un file: `npm run build:artifact` → `dist/diottri.html`.
- **Controlli:** `npm run standard` (regole G1–G9), `tests/unit/diottri*.test.ts`, `tests/e2e/diottri.spec.ts`.

## Il principio

> Tutto quello che serve per decidere sta sullo schermo o in quello che il gioco ha già mostrato.
> Tutto quello che il gioco giudica è stato insegnato prima.
> La gradazione si misura: non si indovina, non si legge in faccia al cliente.

Valgono le regole fisse dell'ottica del repository: niente diagnosi, niente promesse sulla salute, niente «chi fa cosa» (chi gioca impara a fare tutto, tranne la visita medica). Le scelte si distinguono per l'ottica, mai per come sono dette.

## Il riquadro

Ogni testo che compare in un riquadro sta in **tre righe da 24 caratteri**, andando a capo sulle parole. È la misura del gioco: chi gioca legge una riga e agisce.

- Una domanda al cliente: al massimo 24 caratteri e quattro parole.
- Il nome di una scelta (un materiale, un filtro, una risposta): una riga.
- Il nome di una specie: al massimo dieci lettere.
- La spiegazione di una prova, la prima volta: al massimo due riquadri.
- Anche i messaggi del motore (giudizi della prova, della Maestra, del banco) stanno nel riquadro: lo verificano i test giocando bene e male.
- Il segno meno è quello tipografico: «−1,75», come in negozio.

## Il caso

- **4–6 domande**, almeno una **chiave** (serve alla stella Spiegazione). Una domanda «già detta» ripete quello che il cliente ha appena detto: costa fiducia ed è l'unica domanda punita.
- **I bisogni** hanno da 0 a 3 tacche calcolate dai modelli (vista, spessore, riflessi, sole, riflesso dell'acqua, guida). Nessuna tacca scritta a mano.
- **Un bisogno nascosto** si scopre solo con una domanda. Se non è scoperto e alla consegna ha tacche, salta fuori («Ah, dimenticavo una cosa…») e costa la Spiegazione.
- **La lente viene solo da una misura**: la ricetta letta toccando i numeri, la prova lenti un occhio alla volta, o il frontifocometro e «rifalli uguali» solo se con quegli occhiali vede bene. La prova vuole il Diottro giusto nel vassoio: Conca per il meno, Bombo per il più.
- **Ogni posto** (materiale, trattamenti, montatura, filtro) ha una scelta «Bene» disponibile con i Diottri che si hanno a quel punto. Ogni scelta ha il suo esito e una riga sul perché; un esito può cambiare con quello che si scopre (la categoria 4 diventa grave quando si sa che guida).
- **Un dubbio** del cliente si scioglie con una sola dimostrazione che risponde; le altre sono «vere ma non rispondono» o fuori tema.
- **Il caso d'allarme** non consegna lenti: vince solo «Medico», con l'urgenza giusta. Una domanda scopre l'allarme. Lo schermo è quello di un caso normale (scena, bisogni, occhiale): l'allarme si scopre chiedendo, non guardando lo schermo. Con un allarme la Maestra ferma ogni misura: le lenti di prova davanti all'occhio sono un errore grave, leggere gli occhiali o la ricetta è «Non così». Che con un allarme non si misura lo dicono la Maestra all'inizio del gioco e la finestra del medico, con i segnali di «subito», «oggi» e della visita.
- **Esiti** con la scala del corso: Bene, Va bene ma…, Non così, Errore grave. Stelle: Occhio, Spiegazione, Soluzione. A fine caso si legge perché una stella è persa (la prima ragione per ogni momento).

## Il riconoscimento

- Le risposte contengono la specie giusta, almeno due in tutto; c'è almeno una prova utile.
- La seconda grandezza (fascia di forza, categoria, calibro) si legge dalle prove: la velocità della croce dice la fascia, la luce che passa dice la categoria, l'asta dice il calibro. La spiegazione della prova lo insegna la prima volta che si usa.
- I valori cambiano a ogni incontro e stanno nell'intervallo dichiarato.

## Le regole del controllo automatico

| Regola | Cosa controlla |
|---|---|
| G1 | I testi stanno nel riquadro (tre righe da 24); domande, nomi e spiegazioni delle prove nelle loro misure |
| G2 | Il caso è ben fatto: 4–6 domande, almeno una chiave, ogni bisogno nascosto e la ricetta nascosta scoperti da una domanda, un dubbio con una sola dimostrazione che risponde; casi e riconoscimenti tutti nell'ordine |
| G3 | La lente solo da una misura: la prova lenti ha soluzione in ogni variante, e il Diottro che serve è nel vassoio a quel punto |
| G4 | Il caso d'allarme non consegna lenti, e una domanda scopre l'allarme |
| G5 | Ogni posto ha una scelta «Bene» col vassoio di quel momento |
| G6 | Il risolutore finisce il caso con tre stelle in ogni variante (semi 1–12); fiducia alla fine almeno 6 (avviso) |
| G7 | Il segno meno è «−» |
| G8 | Elenco nero: nessun nome e nessuna formula del mondo Pokémon (`ELENCO_NERO` in `standard/validate.ts`) |
| G9 | Il riconoscimento è ben fatto: la specie giusta tra le risposte, almeno una prova utile, valori nell'intervallo, e il risolutore lo riconosce in ogni seme |

## Come esce una mandata

1. `npm run check`: 0 errori. Gli avvisi si leggono uno per uno.
2. Prova alla cieca: un revisore che non ha visto il progetto gioca da riga di comando, `npx tsx scripts/diottri.ts <seme>`, con lo schermo scritto in testo e i tocchi da stdin. Ogni assunzione su qualcosa che non è sullo schermo è un difetto.
3. Un revisore esperto di ottica legge casi, specie e prove.
4. `npm run build && npm run test:e2e` (il dito vero su 390×844), poi push su `main` e l'anteprima `dist/diottri.html` come artifact.
5. Ray gioca e dà il suo parere: è la prova che conta.
