# Fase Neutro Terra

Il gioco per imparare l'impianto elettrico di casa: prima la fisica che serve, poi le mani sui fili, il collaudo e la ricerca dei guasti. Esce un capitolo alla settimana.

- **Capitolo 1 · Le basi** — nove interventi veri, dalla prima lampada al quadro che salta.
- **Capitolo 2 · Banco guasti** — l'impianto c'è, qualcosa non va: lo trovi col tester, e lo dimostri con le misure.

Il piano completo è in [`docs/CAPITOLI.md`](docs/CAPITOLI.md). Le regole con cui si scrivono gli esercizi sono in [`docs/STANDARD.md`](docs/STANDARD.md).

## Pubblicare

Il sito è un'app Next.js: su Vercel basta importare il repository, senza configurazione. Ogni push su `main` passa dai controlli (GitHub Actions) e Vercel pubblica.

## Sviluppo

Serve Node 22.12 o più recente.

```sh
npm install
npm run dev        # http://localhost:3000
npm run check      # tipi, lint, standard degli esercizi, test
npm run build && npm run test:e2e   # prove col dito su telefono (Playwright)
```

La prima volta, per le prove col dito: `npx playwright install chromium`.

## Struttura

| Percorso | Cosa c'è |
|---|---|
| `src/core/` | Motore del collaudo, regole della tavola, banco guasti, disegno dei fili, nomi, tipi |
| `src/content/` | Capitoli, livelli, schede di teoria, prontuario |
| `src/standard/` | Il controllo automatico dello standard (regole S1–S18) |
| `src/game/ui.js` | L'interfaccia del gioco |
| `src/app/`, `src/components/` | La pagina Next.js che monta il gioco |
| `tests/` | Test unitari (Vitest) e prove col dito (Playwright) |
| `scripts/` | Controllo dello standard, versione in un file solo, pacchetti e banco da riga di comando per la prova alla cieca |

È un simulatore didattico: nell'impianto vero si lavora fuori tensione, accanto a chi ne ha la responsabilità.
