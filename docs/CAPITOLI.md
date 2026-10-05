# Piano dei capitoli

Un capitolo alla settimana. Ray lo gioca durante la settimana e lo confronta con quello che vede in cantiere; a fine settimana dice dove si è bloccato, e quello entra nel capitolo dopo (e nelle correzioni).

L'ordine segue i pannelli didattici per impianti civili (per esempio i 44 esercizi del pannello SMART-CIVIL) e i lavori che capitano davvero.

| N. | Capitolo | Cosa si impara | Pezzi nuovi nel motore | Stato |
|---|---|---|---|---|
| 1 | Le basi | Circuito, colori, terra, procedura al quadro, punto luce, presa, deviata, invertitore, differenziale, contatore | — | uscito il 4 ottobre 2026 |
| 2 | Banco guasti | Tester: tensione e continuità, e la prova del tester. Metodo: dal sintomo al punto, e la diagnosi dimostrata dalle misure. Lampadina bruciata, contatto aperto, neutro interrotto, interruttore sul neutro, ritorno e neutro scambiati, terra mancante, presa morta, scambi, coppie dell'invertitore | tester, guasti, sintomi, prova delle misure, disegno dei fili | uscito il 5 ottobre 2026 |
| 3 | Quattro punti e relè | Luce da quattro punti, pulsanti, relè passo-passo | pulsanti, relè, collaudo a sequenze | da fare |
| 4 | Il quadro di casa | Generale, differenziale, magnetotermici per linea, morsettiere, etichette, selettività di base | cablaggio del quadro | da fare |
| 5 | Linee e prese | Dorsale, derivazioni in scatola, prese 10/16 A, linee dedicate, sezioni 1,5 / 2,5 / 4 mm² | carichi e sezioni | da fare |
| 6 | Comandi automatici | Relè luce scale, crepuscolare, sensore di movimento, timer | tempo | da fare |
| 7 | Verifiche e consegna | Continuità della terra, isolamento, prova del differenziale, misura di terra, dichiarazione di conformità | misure di verifica | da fare |
| 8 | Un bilocale completo | Dalla planimetria ai punti, alle linee, al quadro, al computo dei materiali col listino Tecnomat | planimetria (idee da House Planner, MIT) | da fare |

## Come si chiude un capitolo

1. Contenuti scritti secondo `docs/STANDARD.md`.
2. `npm run check`: 0 errori.
3. Prova alla cieca con revisori che non hanno visto il progetto.
4. `npm run build && npm run test:e2e`.
5. Push su `main` (Vercel pubblica) e anteprima aggiornata con `npm run build:artifact`.
