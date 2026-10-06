# Piano dei capitoli · Sfera Cilindro Asse

Un capitolo alla settimana, per chi sta al banco di un negozio di ottica. Pochissima teoria, molto da vedere e toccare, poi i clienti. A fine settimana si raccoglie dove ci si è bloccati, e quello entra nel capitolo dopo.

| N. | Capitolo | Cosa si impara | Pezzi nuovi nel motore | Stato |
|---|---|---|---|---|
| 1 | L'occhio e le lenti | Come mette a fuoco l'occhio; miopia, ipermetropia, presbiopia, astigmatismo; lente col meno, col più, addizione, cilindro e asse; leggere la ricetta; le quattro mosse al banco; chi fa cosa; quando si manda dal medico | modello dell'occhio, occhiale di prova (a ogni partita il cliente ha la sua ricetta), ricetta e quattro occhiali, dialoghi col cliente | uscito il 7 ottobre 2026 |
| 2 | Le lenti | Monofocali, progressive (livelli, adattamento), da ufficio, bifocali; indice e spessore; antiriflesso, fotocromatiche, polarizzate, luce blu senza promesse; lenti per bambini | spessore della lente, mappa della progressiva con le zone | da fare |
| 3 | La montatura | Forma del viso, misure sull'asta (calibro, ponte, lunghezza), materiali, compatibilità con le lenti (gradazioni forti, altezza per le progressive), regolazione | misure e montaggio | da fare |
| 4 | Il sole | Categorie dei filtri 0–4, protezione UV, polarizzate, sole graduato, cosa non si usa alla guida | filtri e luce | da fare |
| 5 | Lenti a contatto | Chi le applica, tipi e ricambio, soluzioni e igiene, cosa si vende al banco e cosa no | — | da fare |
| 6 | Prezzo e obiezioni | Presentare il valore, «costa troppo», «su internet costa meno», promozioni, secondo paio, detrazione fiscale | preventivo al banco | da fare |
| 7 | Consegna e assistenza | Consegna, adattamento, pulizia, garanzia, reclami, riparazioni | — | da fare |
| 8 | Occhiali smart | Cosa sono, se si possono graduare, batteria, privacy, assistenza (per i negozi che li trattano) | — | da fare |

## Come si chiude un capitolo

1. Contenuti scritti secondo `docs/ottica/STANDARD.md`.
2. `npm run check`: 0 errori.
3. Prova alla cieca con un revisore che non ha visto il progetto, e lettura di un esperto di ottica.
4. `npm run build && npm run test:e2e`.
5. Push su `main` (Vercel pubblica) e anteprima aggiornata con `npm run build:artifact`.
