# Fase Neutro Terra · Sfera Cilindro Asse — istruzioni per chi lavora sul repository

Due corsi di formazione per Ray (Milano), nello stesso sito. Esce **un capitolo alla settimana**: Ray ci si allena per tutta la settimana, sul telefono.

- **Fase Neutro Terra** (`/elettricista`): l'impianto elettrico di casa, in cantiere.
- **Sfera Cilindro Asse** (`/ottica`): il mestiere dell'ottico a 360 gradi, per chi sa già vendere (conosce la PNL, vende da anni). Il corso non insegna a vendere: insegna l'ottica. Pochissima teoria, molto da vedere, poi i casi al banco.
- **Diottri** (`/diottri`: il Borgo Diottria, un mondo da girare con i due giri dentro): un gioco di ruolo in stile Game Boy Color che insegna l'ottica giocando, accanto al corso di ottica. Progetto in `docs/gioco/PROGETTO.md`, regole in `docs/gioco/STANDARD.md`, stile dei disegni in `docs/gioco/STILE.md`. Sta in `src/diottri/`; i numeri dell'ottica li prende da `src/ottica/core`, senza cambiare come si comporta il corso.
- La home `/` fa scegliere il corso e mostra le stelle di ognuno; sotto, il collegamento al gioco.
- Sito: Next.js su Vercel, da questo repository (`main` si pubblica da solo).
- Anteprime in un file solo: `npm run build:artifact` → `dist/fase-neutro-terra.html`, `dist/sfera-cilindro-asse.html` e `dist/diottri.html` (si pubblicano come artifact su claude.ai).
- Regole per scrivere gli esercizi: `docs/STANDARD.md` (elettricista), `docs/ottica/STANDARD.md` (ottica) e `docs/gioco/STANDARD.md` (Diottri). Piani dei capitoli: `docs/CAPITOLI.md` e `docs/ottica/CAPITOLI.md`.

## Comandi

```sh
npm install
npm run dev          # sito in locale
npm run check        # tipi, lint, standard (S1–S18, O1–O10, G1–G9), test unitari e giri completi
npm run build        # build di produzione
npm run test:e2e     # prove col dito su telefono 390×844 (serve la build); in locale: PW_CHROMIUM=/percorso/chromium
npm run standard     # solo il controllo degli standard, livello per livello, i due corsi e il gioco
npm run packets      # elettricista: pacchetti per la prova alla cieca (dist/playtest)
npm run packets:ottica   # ottica: pacchetti per la prova alla cieca (dist/playtest-ottica; serve build:artifact)
npx tsx scripts/banco.ts g1 1      # elettricista: banco guasti da riga di comando (comandi da stdin)
npx tsx scripts/negozio.ts o1 7    # ottica: prova lenti e banco da riga di comando; il seme sceglie la ricetta del cliente
npx tsx scripts/diottri.ts 7       # Diottri: il borgo (mappa in caratteri: su/giu/sinistra/destra [n], a, b, menu) e il banco (bottoni numerati) in testo, da stdin; DIOTTRI_SALVA=file.json tiene i progressi
npx tsx scripts/diottri-anteprima.ts mappa borgo sera   # Diottri: i disegni in PNG (mappa, mattonelle, oggetti, figure) in dist/anteprime/
```

## Dove sta cosa

| Percorso | Cosa |
|---|---|
| `src/app/page.tsx` | La home che fa scegliere il corso (`src/components/CourseStars.tsx` legge le stelle) |
| `src/core/engine.ts` | Elettricista · motore: reti, potenziali, collaudo su tutte le combinazioni dei comandi |
| `src/core/rules.ts` | Elettricista · regole della tavola (cosa si collega a cosa). Le usano gioco e controlli |
| `src/core/faults.ts` | Elettricista · banco guasti: guasti, tester, sintomi, firme delle misure, la prova |
| `src/core/geometry.ts` | Elettricista · disegno dei fili (e il controllo S18) |
| `src/core/names.ts`, `src/core/types.ts` | Elettricista · nomi di pezzi e morsetti; formato dei dati |
| `src/content/` | Elettricista · contenuti: `capitoli/capN.ts`, schede, prontuario, `index.ts` |
| `src/standard/validate.ts` | Elettricista · controllo automatico dello standard |
| `src/game/ui.js` | Elettricista · interfaccia, montata da `src/components/Game.tsx` |
| `src/ottica/core/eye.ts` | Ottica · modello dell'occhio in diottrie: vergenze, accomodazione con l'età, cilindri (Thibos), decimi |
| `src/ottica/core/prova.ts` | Ottica · occhiale di prova: valori, soluzione, giudizio; varianti (`withVariant`, `fill`); i quattro occhiali della ricetta |
| `src/ottica/core/banco.ts` | Ottica · dialoghi al banco e stelle (gioco e riga di comando) |
| `src/ottica/draw.ts` | Ottica · disegni: occhio in sezione, scene sfocate dal modello, schema TABO, progressiva, ricetta |
| `src/ottica/content/` | Ottica · contenuti: `cap1.ts`, prontuario, `index.ts` |
| `src/ottica/standard/validate.ts` | Ottica · controllo automatico dello standard (O1–O10, con ogni variante) |
| `src/ottica/ui.ts` | Ottica · interfaccia (stringhe HTML + un ascoltatore), montata da `src/components/Ottica.tsx`; stile in `src/app/ottica.css`, tutto sotto `.ott` |
| `src/diottri/core/` | Diottri · motori senza disegno: il caso (`caso.ts`), le tacche dai modelli (`valuta.ts`), il riconoscimento (`riconosci.ts`), il risolutore, i semi |
| `src/diottri/content/` | Diottri · casi, riconoscimenti, specie, l'ordine dei passi; il mondo in `borgo.ts` (mappe, personaggi, prologo, finale) |
| `src/diottri/mondo/` | Diottri · il mondo: motore senza disegno (`motore.ts`: passi, porte, chi c'è davanti, eventi), disegno (`disegno.ts`), la console sul telefono (`guscio.ts`), il robot che gioca tutto il borgo (`robot.ts`) |
| `src/diottri/grafica/` | Diottri · i disegni come dati: mattonelle, oggetti, figure, tavolozze di giorno, sera e dentro |
| `src/diottri/standard/validate.ts` | Diottri · controllo automatico (G1–G9: riquadro 3×24, casi ben fatti, risolutore da tre stelle, elenco nero) |
| `src/diottri/ui.ts`, `src/diottri/draw.ts` | Diottri · interfaccia (stringhe HTML + un ascoltatore) e disegni; montata da `src/components/Diottri.tsx`, stile in `src/app/diottri.css`, tutto sotto `.dio` |
| `tests/unit/` | Vitest: motori, standard, giri completi in jsdom |
| `tests/e2e/` | Playwright: il dito vero sul telefono |

## Come si aggiunge un capitolo

1. Leggi lo standard e il piano del corso.
2. Elettricista: scrivi `src/content/capitoli/capN.ts` e aggiungilo a `src/content/index.ts` (`CHAPTERS`, `LEVELS`, `CARDS`). Ottica: scrivi `src/ottica/content/capN.ts` e aggiungilo a `src/ottica/content/index.ts`. I numeri `n` continuano quelli del capitolo prima.
3. Se servono pezzi nuovi, estendi il motore e i tipi, con test in `tests/unit/`.
4. `npm run check` deve dare 0 errori. Gli avvisi si leggono uno per uno.
5. Prova alla cieca: `npm run packets` o `npm run build:artifact && npm run packets:ottica`, poi un revisore che non ha visto il progetto gioca i pacchetti (aiuti in un file a parte; da riga di comando `scripts/banco.ts` o `scripts/negozio.ts`). Per l'ottica, anche un revisore esperto legge i contenuti. Ogni assunzione su qualcosa che non è sullo schermo è un difetto.
6. `npm run build && npm run test:e2e`, poi aggiorna il piano (stato e data) e fai push su `main`.

## Regole fisse

- Testi in italiano semplice, frasi corte, termini del mestiere con la versione «da cantiere» o «da negozio» nel lessico (`g` nelle schede).
- Elettricista, regole italiane: colori IEC (marrone/nero/grigio fase, blu neutro, giallo-verde terra), 230 V, CEI 64-8, magnetotermici C10/C16, differenziale 30 mA.
- Ottica: niente gradazioni a occhio, niente diagnosi, niente promesse sulla salute. Niente «chi fa cosa»: chi gioca imparerà a fare tutto, tranne la visita medica (l'oculista). Al banco tutte le scelte sono dette bene e si distinguono per l'ottica; la titolare può usare il lessico della vendita e della PNL per comunicare, non per insegnarla. Diottrie scritte come in negozio («−1,75», «+2,00»).
- Tutto quello che serve per decidere sta sullo schermo o nelle schede già lette. Tutto quello che il gioco giudica è stato insegnato prima.
- Codice copiato solo da licenze permissive (MIT, BSD, Apache, CC BY). Da GPL, CC BY-NC o progetti chiusi si prendono idee, non codice.
- Non rompere i capitoli già usciti: i progressi di Ray stanno nel localStorage (`fase-neutro-terra.v1`, `sfera-cilindro-asse.v1` e `diottri.v1`).
- Diottri: niente nomi, immagini o formule del mondo Pokémon (l'elenco nero G8). Le classi CSS del gioco non devono coincidere con quelle di `globals.css`, che vale anche lì.
