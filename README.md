# Fase Neutro Terra · Sfera Cilindro Asse

Due corsi in un sito, un capitolo alla settimana. La home (`/`) fa scegliere il corso.

## Fase Neutro Terra · `/elettricista`

Il gioco per imparare l'impianto elettrico di casa: prima la fisica che serve, poi le mani sui fili, il collaudo e la ricerca dei guasti.

- **Capitolo 1 · Le basi** — nove interventi veri, dalla prima lampada al quadro che salta.
- **Capitolo 2 · Banco guasti** — l'impianto c'è, qualcosa non va: lo trovi col tester, e lo dimostri con le misure.

Piano in [`docs/CAPITOLI.md`](docs/CAPITOLI.md), regole degli esercizi in [`docs/STANDARD.md`](docs/STANDARD.md).

## Sfera Cilindro Asse · `/ottica`

Il mestiere dell'ottico a 360 gradi, per chi sa già vendere: il corso non insegna a vendere, insegna l'ottica. Pochissima teoria, molto da vedere e toccare, poi i casi al banco. L'occhio in sezione con i raggi, la scena come la vede il cliente (sfocata dal modello, nella direzione giusta), l'occhiale di prova, la ricetta, e i dialoghi al banco: tutte le risposte sono dette bene, e la titolare commenta l'ottica.

- **Capitolo 1 · L'occhio e le lenti** — miopia, ipermetropia, presbiopia, astigmatismo, la ricetta e un sabato mattina al banco. A ogni partita il cliente ha la sua ricetta.

Piano in [`docs/ottica/CAPITOLI.md`](docs/ottica/CAPITOLI.md), regole degli esercizi in [`docs/ottica/STANDARD.md`](docs/ottica/STANDARD.md).

## Diottri · in progettazione

Un gioco di ruolo in stile Game Boy Color, accanto al corso di ottica: per imparare l'ottica giocando, anche un'ora di fila. Progetto in [`docs/gioco/PROGETTO.md`](docs/gioco/PROGETTO.md).

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
| `src/core/` | Elettricista: motore del collaudo, regole della tavola, banco guasti, disegno dei fili, nomi, tipi |
| `src/content/` | Elettricista: capitoli, livelli, schede di teoria, prontuario |
| `src/standard/` | Elettricista: il controllo automatico dello standard (regole S1–S18) |
| `src/game/ui.js` | Elettricista: l'interfaccia del gioco |
| `src/ottica/` | Ottica: modello dell'occhio (`core/eye.ts`), prova lenti e varianti, dialoghi, disegni, contenuti, controllo (O1–O10), interfaccia |
| `src/app/`, `src/components/` | Le pagine Next.js: la home, `/elettricista`, `/ottica` |
| `tests/` | Test unitari (Vitest) e prove col dito (Playwright) |
| `scripts/` | Controllo dello standard, versioni in un file solo, pacchetti e giochi da riga di comando per la prova alla cieca (`banco.ts`, `negozio.ts`) |

Sono simulatori didattici. Nell'impianto vero si lavora fuori tensione, accanto a chi ne ha la responsabilità. In negozio si impara a fare tutto tranne la visita medica: quando serve, si manda dall'oculista.
