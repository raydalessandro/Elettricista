# Fase Neutro Terra — istruzioni per chi lavora sul repository

Gioco per imparare l'impianto elettrico di casa, per Ray (Milano). Esce **un capitolo alla settimana**: Ray si allena su quel capitolo per tutta la settimana, in cantiere e sul telefono.

- Sito: Next.js su Vercel, da questo repository (`main` si pubblica da solo).
- Anteprima in un file solo: `npm run build:artifact` → `dist/fase-neutro-terra.html` (si pubblica come artifact su claude.ai).
- Regole per scrivere gli esercizi: `docs/STANDARD.md`. Piano dei capitoli: `docs/CAPITOLI.md`.

## Comandi

```sh
npm install
npm run dev          # sito in locale
npm run check        # tipi, lint, standard (S1–S17), test unitari e giro completo
npm run build        # build di produzione
npm run test:e2e     # prove col dito su telefono 390×844 (serve la build); in locale: PW_CHROMIUM=/percorso/chromium
npm run standard     # solo il controllo dello standard, livello per livello
npm run packets      # pacchetti per la prova alla cieca (dist/playtest)
```

## Dove sta cosa

| Percorso | Cosa |
|---|---|
| `src/core/engine.ts` | Motore: reti, potenziali, collaudo su tutte le combinazioni dei comandi |
| `src/core/rules.ts` | Regole della tavola (cosa si collega a cosa). Le usano gioco e controlli |
| `src/core/faults.ts` | Banco guasti: guasti, tester (tensione e continuità), sintomi, firme delle misure |
| `src/core/types.ts` | Formato dei dati: livelli, tavola, guasti |
| `src/content/` | Contenuti: `capitoli/capN.ts`, schede, prontuario, `index.ts` con l'elenco dei capitoli |
| `src/standard/validate.ts` | Controllo automatico dello standard |
| `src/game/ui.js` | Interfaccia (stringhe HTML + un ascoltatore), montata da `src/components/Game.tsx` |
| `tests/unit/` | Vitest: motore, standard, giro completo in jsdom |
| `tests/e2e/` | Playwright: il dito vero sul telefono |

## Come si aggiunge un capitolo

1. Leggi `docs/STANDARD.md` e `docs/CAPITOLI.md`.
2. Scrivi `src/content/capitoli/capN.ts` (livelli + schede del capitolo) e aggiungilo a `src/content/index.ts` (`CHAPTERS`, `LEVELS`, `CARDS`). I numeri `n` continuano quelli del capitolo prima.
3. Se servono pezzi nuovi (pulsanti, relè, timer…), estendi `engine.ts` e i tipi, con test in `tests/unit/`.
4. `npm run check` deve dare 0 errori. Gli avvisi si leggono uno per uno.
5. Prova alla cieca: `npm run packets`, poi un revisore che non ha visto il progetto gioca i pacchetti (aiuti in un file a parte). Ogni assunzione su qualcosa che non è sullo schermo è un difetto.
6. `npm run build && npm run test:e2e`, poi aggiorna `docs/CAPITOLI.md` (stato e data) e fai push su `main`.

## Regole fisse

- Testi in italiano semplice, frasi corte, termini del mestiere con la versione «da cantiere» nel lessico (`g` nelle schede).
- Regole italiane: colori IEC (marrone/nero/grigio fase, blu neutro, giallo-verde terra), 230 V, CEI 64-8, magnetotermici C10/C16, differenziale 30 mA.
- Tutto quello che serve per decidere sta sullo schermo o nelle schede già lette. Tutto quello che il collaudo giudica è stato insegnato prima.
- Codice copiato solo da licenze permissive (MIT, BSD, Apache, CC BY). Da GPL, CC BY-NC o progetti chiusi si prendono idee, non codice.
- Non rompere i capitoli già usciti: i progressi di Ray stanno nel localStorage (`fase-neutro-terra.v1`).
