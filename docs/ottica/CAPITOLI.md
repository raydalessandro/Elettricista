# Piano dei capitoli · Sfera Cilindro Asse

Il mestiere dell'ottico a 360 gradi, un capitolo alla settimana, per chi sa già vendere. Pochissima teoria, molto da vedere e toccare, poi i casi al banco. Il corso insegna a fare tutto, tranne la visita medica. A fine settimana si raccoglie dove ci si è bloccati, e quello entra nel capitolo dopo.

| N. | Capitolo | Cosa si impara | Pezzi nuovi nel motore | Stato |
|---|---|---|---|---|
| 1 | L'occhio e le lenti | Come mette a fuoco l'occhio; miopia, ipermetropia, presbiopia, astigmatismo; lente col meno, col più, addizione, cilindro e asse; monofocali e materiali (indice, policarbonato); antiriflesso; leggere la ricetta e la trasposizione; raddrizzare una montatura; quando serve il medico | modello dell'occhio, occhiale di prova (a ogni partita il cliente ha la sua ricetta), ricetta e quattro occhiali, dialoghi col cliente | uscito il 7 ottobre 2026 |
| 2 | Le montature | Materiali: acetato di cellulosa (il «cello»), iniettati (nylon, TR90), metalli (monel, acciaio, titanio, beta-titanio, alluminio), legno e corno. Costruzioni: cerchiata, nylor (a filo), glasant (a giorno, forata). Parti: frontale, ponte, naselli e placchette, cerniere (anche flex), aste, terminali. Misure sull'asta (calibro, ponte, lunghezza: 52□18 140). Forme (tonda, pantos, squadrata, rettangolare, goccia, cat-eye, browline, ottagonale) e viso. Che montatura per che lente: gradazioni forti, progressive, nylor e glasant | montatura vista da davanti e di lato, misure sull'asta, lente nella montatura | da fare |
| 3 | Materiali e trattamenti delle lenti | Indici e numero di Abbe; spessore al centro e al bordo; asferiche; organico, policarbonato, Trivex, minerale; indurente, antiriflesso, idrofobico, filtro luce blu, fotocromatiche, polarizzate, colorazioni e specchiature | spessore della lente con calibro e indice | da fare |
| 4 | Progressive, ufficio e bifocali | Disegno della progressiva (corridoio, campi, inset), livelli, lenti da ufficio e degressive, bifocali; adattamento e problemi tipici | mappa della progressiva con le zone | da fare |
| 5 | Misure e centratura | Distanza pupillare (mono), altezza di montaggio, angolo pantoscopico, avvolgimento, distanza apice-cornea; prismi indotti (regola di Prentice); centratura delle progressive | misure sul viso, prisma indotto | da fare |
| 6 | Il laboratorio | Frontifocometro, lettura e marcatura delle lenti, forma, molatura, bisello, scanalatura per il nylor, foratura per il glasant, montaggio e controllo finale; consegna, regolazioni e riparazioni | banco del laboratorio | da fare |
| 7 | Il sole | Categorie dei filtri 0–4, protezione UV, polarizzate, sole graduato, cosa non si usa alla guida | filtri e luce | da fare |
| 8 | Lenti a contatto | Tipi e materiali (idrogel, silicone-idrogel, rigide gas permeabili), ricambio, applicazione e prova, soluzioni e igiene, segnali d'allarme | — | da fare |
| 9 | Il controllo della vista | Acuità visiva e ottotipo, occhiale di prova, sfera e cilindro con i cilindri crociati, test bicromatico, visione binoculare di base; quando serve la visita | refrazione simulata | da fare |

## Come si chiude un capitolo

1. Contenuti scritti secondo `docs/ottica/STANDARD.md`: si insegna l'ottica, non la vendita.
2. `npm run check`: 0 errori.
3. Prova alla cieca con un revisore che non ha visto il progetto, e lettura di un esperto di ottica.
4. `npm run build && npm run test:e2e`.
5. Push su `main` (Vercel pubblica) e anteprima aggiornata con `npm run build:artifact`.
