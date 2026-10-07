# Diottri · guida di stile

Versione 1.0 · 7 ottobre 2026 · mondo 1, Borgo Diottria

Il gioco deve essere bello: è anche così che si impara. Questa guida la seguono tutti quelli che disegnano, persone e subagenti, così il borgo sembra fatto da una mano sola.

## Lo schermo

- **160×144 pixel**, come il Game Boy Color, ingranditi a numeri interi: sul telefono due volte, pixel netti.
- Visto **dall'alto, di tre quarti**, come i giochi di ruolo classici: degli edifici si vede il tetto in alto e la facciata in basso, con porte e finestre; dei personaggi la testa grande e il corpo piccolo.
- **Mattonelle 16×16.** Lo schermo ne mostra 10×9.
- Il riquadro dei dialoghi copre le ultime tre righe di mattonelle: niente di importante deve stare solo lì.

## I colori

- **Ogni cella 16×16 ha la sua tavolozza di quattro colori**, dal più chiaro (0) al più scuro (3), come le tavolozze del Game Boy Color. Un oggetto grande (una casa di 5×4 celle) può avere una tavolozza diversa per ogni cella: il tetto `tetto`, la facciata `muro`, una finestra `finestra`.
- Le tavolozze comuni stanno in `src/diottri/grafica/tavolozze.ts`. Chi ne vuole di nuove le aggiunge **nel suo file** (`TAVOLOZZE_MATTONELLE` in `mattonelle.ts`, `TAVOLOZZE_OGGETTI` in `oggetti.ts`), con gli stessi quattro colori in ordine dal chiaro allo scuro, e una versione per `sera` con lo stesso nome. Le tavolozze dei personaggi (`FIGURE_PAL`) le cambia solo chi disegna i personaggi.
- **Il borgo ha due luci, giorno e sera**: gli stessi pixel con altre tavolozze. Un disegno deve leggersi bene in tutte e due. La sera tutto diventa blu e scuro; restano accesi i lampioni (la versione `notte` dei pixel), le finestre e i luccichii.
- **I personaggi hanno tre colori più il trasparente**: 1 la pelle (o la parte chiara), 2 i vestiti, 3 i capelli e il contorno.
- Niente nero puro e niente bianco puro sul terreno: i colori 3 sono già scuri abbastanza.

## Il disegno

- **La luce viene dall'alto a sinistra.** Ombre a destra e in basso, riflessi in alto a sinistra.
- **Contorno** col colore 3 su oggetti e personaggi, non sul terreno. Il contorno può aprirsi dove la luce è forte.
- **Il terreno si ripete senza cuciture**: il bordo destro continua nel sinistro, quello in basso in quello in alto. Niente motivi che formano righe o scacchi quando si ripetono.
- **Gruppi, non rumore.** Pochi gruppi di pixel voluti (un ciuffo d'erba, una pietra con la sua ombra) leggono meglio di tanti puntini a caso. Niente retino a scacchi, se non per una sfumatura piccola e voluta.
- **Pixel puliti**: niente pixel orfani che non sembrano niente, niente scalette storte nelle linee (curve con passi regolari: 1-1-2-3, non 1-3-1).
- **Si legge a colpo d'occhio**: la porta della bottega si vede, la casa si distingue dalla siepe, il pontile dall'acqua, un personaggio dall'altro.
- **Nostro, non copiato.** Lo stile è quello dei giochi a 8 bit, ma i disegni sono nostri: niente mattonelle, sprite o loghi presi da altri giochi, e niente che ricordi il mondo Pokémon (elenco nero G8). Nessuna scritta, tranne «OTTICA» sull'insegna della bottega e le righe astratte del tabellone.

## Il Borgo Diottria

Un borgo italiano piccolo e luminoso, tra la stazione e il lago: tetti di cotto e d'ardesia, intonaci color crema e rosa, piazza in pietra con la fontana, l'edicola a righe, il vicolo dei lampioni, la merceria con la tenda a righe, la spiaggetta col pontile. Ordinato, caldo, un po' da cartolina.

La bottega di Iride è il cuore: facciata crema, tenda e insegna verde petrolio (la tavolozza `bottega`) con la scritta «OTTICA», una vetrina con le montature, la porta in legno al centro.

## Il formato

`src/diottri/grafica/formato.ts` dice tutto; in breve:

- **Mattonella** (`mattonelle.ts`): `{ pal, px: 16 righe da 16 caratteri "0"–"3", anim?: [altri fotogrammi] }`.
- **Oggetto** (`oggetti.ts`): `{ w, h, pal: nome o griglia h×w di nomi, px: h×16 righe da w×16 caratteri ("." trasparente, "0"–"3"), solido?: h righe da w caratteri ("x" pieno, "." si passa), sopra?: righe di celle disegnate sopra i personaggi, notte?: altri pixel per la sera }`.
- **Figura** (`figure.ts`): `{ pal, giu: [fermo, passo], su: [fermo, passo], lato: [fermo, passo] }`, 16 righe da 16 caratteri ("." trasparente, "1"–"3"). `lato` guarda a **sinistra**: a destra lo specchia il programma. Il fotogramma «passo» ha una gamba avanti e il corpo un pixel più giù o più su.
- **Luccichio**: tre fotogrammi 16×16 con la tavolozza `oro`.

I disegni si scrivono come dati, a mano, riga per riga. Le funzioni che li generavano sono solo segnaposto.

## Guardare quello che si disegna

```sh
npx tsx scripts/diottri-anteprima.ts mattonelle --out=mie-mattonelle
npx tsx scripts/diottri-anteprima.ts oggetti bottega,albero --out=miei-oggetti
npx tsx scripts/diottri-anteprima.ts figure --out=mie-figure
npx tsx scripts/diottri-anteprima.ts mappa borgo giorno --out=mio-borgo
npx tsx scripts/diottri-anteprima.ts mappa borgo sera --out=mio-borgo-sera
npx tsx scripts/diottri-anteprima.ts mappa bottega --out=mia-bottega
```

Le immagini vanno in `dist/anteprime/` e si guardano: ogni disegno si guarda, si corregge e si riguarda finché non è bello. Prima del lavoro finito: `npx tsc --noEmit -p .` senza errori e `npx vitest run tests/unit/diottri-grafica.test.ts` (righe della lunghezza giusta, solo caratteri ammessi, tavolozze che esistono).

## Il catalogo del mondo 1

**Mattonelle** (16×16): `erba`, `erba_alta`, `fiori`, `pietra` (la piazza), `sentiero` (terra battuta), `binari` (si vede la massicciata, i binari corrono da sinistra a destra), `banchina`, `banchina_bordo` (la riga gialla di sicurezza verso i binari, in alto), `acqua` (con un secondo fotogramma), `riva` (sabbia), `pontile` (assi di legno che vanno dall'alto in basso), `canne` (canne sull'acqua), `siepe` (bordo del borgo, non si passa), `recinto`; dentro: `parquet`, `tappeto` (copre un'area di 4×2 mattonelle: un motivo che si ripete, senza bordo per mattonella), `muro_int` (la parete in alto, con lo zoccolo in basso), `muro_basso` (il muro in basso, visto dall'alto: una fascia scura), `zerbino` (davanti alla porta, in basso).

**Oggetti fuori** (w×h celle): `bottega` 5×4 (porta al centro dell'ultima riga), `casa_rossa` 4×3 (tetto di cotto, muro rosa, porta nella seconda colonna), `casa_blu` 4×3 (tetto d'ardesia, muro crema, porta nella terza colonna), `merceria` 4×3 (tenda a righe rosse e blu nella seconda riga, porta nella seconda colonna), `edicola` 2×2 (chiosco con i giornali in vetrina), `tabellone` 2×2 (tabellone blu delle partenze su due pali: la riga alta passa sopra i personaggi), `pensilina` 3×2 (tettoia sui pali), `fontana` 2×2, `albero` 2×2 (la chioma sopra i personaggi), `cespuglio` 1×1, `lampione` 1×2 (con la versione `notte`, acceso), `panchina` 2×1, `cartello` 1×1, `auto` 2×1 (vista di lato, rossa), `cancello_chiuso` 2×1, `cancello_aperto` 2×1.

**Oggetti dentro**: `banco` 4×1 (il bancone della bottega), `scaffale` 2×2 (montature in fila), `specchio` 1×2, `pianta` 1×2, `vetrinetta` 2×1, `campionario` 2×2 (il mobile del Campionario Madre: velluto viola con i posti per i campioni), `cassetta` 2×1 (la cassetta delle lenti di prova).

**Personaggi** (16×16, tre colori): `tu_uomo` e `tu_donna` (chi gioca: maglia verde petrolio, occhiali); `iride` (la Maestra: capelli castani lunghi, vestito prugna, occhiali); `marco` (studente: felpa blu, capelli corti scuri, occhiali); `giulia` (capelli ramati lunghi, maglia rosa, senza occhiali); `davide` (capelli neri, barba, giacca grigio-azzurra, occhiali spessi); `paolo` (pescatore: gilet oliva, berretto, occhiali); `luisa` (signora anziana: chignon bianco, golfino viola, occhiali); `passante` (maglia arancio). Tutti diversi a colpo d'occhio, anche da dietro.

**Luccichio**: una scintilla dorata che brilla in tre fotogrammi.
