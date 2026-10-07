/* Il banco: lo stato di un dialogo col cliente, le scelte, le stelle.
   Una sola logica per il gioco e per la riga di comando delle prove alla cieca.
   I testi entrano nel registro già completati con i numeri della variante ({od}, {axis}…). */
import { fill } from "./prova";
import type { ChoiceKind, Dialog, Ricetta } from "./types";

export interface LogItem {
  k: "c" | "t" | "n" | "tip" | "rx";
  text?: string;
  who?: string;
  ok?: ChoiceKind;
  rx?: Ricetta;
}

export interface DlgState {
  id: string;
  step: number;
  log: LogItem[];
  /** scelte già provate (sbagliate) nella mossa in corso */
  tried: number[];
  /** per ogni mossa: presa la migliore al primo colpo? */
  firstBest: boolean[];
  wrong: number;
  grave: number;
  /** scelte «va bene, ma…» */
  fair: number;
  done: boolean;
  /** come è finita (la fine della scelta, se ne ha una, o quella del dialogo) */
  end: string;
  /** ordine in cui si mostrano le scelte, mossa per mossa */
  order: number[][];
  /** i numeri della variante, per completare i testi */
  vars?: Record<string, string>;
}

/** Apre la mossa in corso: nota del narratore, ricetta, battuta del cliente. */
function openStep(d: Dialog, st: DlgState) {
  const s = d.steps[st.step];
  if (s.note) st.log.push({ k: "n", text: fill(s.note, st.vars) });
  if (s.show?.ricetta) st.log.push({ k: "rx", rx: s.show.ricetta });
  if (s.say) st.log.push({ k: "c", who: d.who.name, text: fill(s.say, st.vars) });
  st.tried = [];
}

export function newDialog(d: Dialog, order: (n: number) => number[], vars?: Record<string, string>): DlgState {
  const st: DlgState = { id: d.id, step: 0, log: [], tried: [], firstBest: [], wrong: 0, grave: 0, fair: 0, done: false, end: "", order: d.steps.map(s => order(s.choices.length)), vars };
  openStep(d, st);
  return st;
}

/** Il testo di una scelta della mossa in corso, completato. */
export const choiceText = (d: Dialog, st: DlgState, ci: number): string => fill(d.steps[st.step].choices[ci].t, st.vars);

/** Il giocatore dice la scelta ci della mossa in corso. Con best e ok si va avanti; con no e grave si riprova. */
export function say(d: Dialog, st: DlgState, ci: number): ChoiceKind | null {
  if (st.done || st.tried.includes(ci)) return null;
  const ch = d.steps[st.step].choices[ci];
  if (!ch) return null;
  const F = (t: string) => fill(t, st.vars);
  const first = st.tried.length === 0;
  st.log.push({ k: "t", text: F(ch.t) });
  st.log.push({ k: "c", who: d.who.name, text: F(ch.reply) });
  st.log.push({ k: "tip", text: F(ch.tip), ok: ch.ok });
  if (ch.ok === "best" || ch.ok === "ok") {
    st.firstBest[st.step] = first && ch.ok === "best";
    if (ch.ok === "ok") st.fair++;
    st.step++;
    // una scelta con la sua fine chiude il dialogo lì (il cliente se ne va)
    if (ch.end || st.step >= d.steps.length) { st.done = true; st.end = F(ch.end || d.end); }
    else openStep(d, st);
  } else {
    if (first) st.firstBest[st.step] = false;
    st.tried.push(ci);
    st.wrong++;
    if (ch.ok === "grave") st.grave++;
  }
  return ch.ok;
}

/** Stelle del banco: spiegazione (anamnesi e spiegazioni giuste al primo colpo), soluzione (soluzioni giuste al primo colpo,
    nessun errore grave), e «servito senza errori» per la giornata in negozio. Una mossa mai raggiunta non conta come giusta. */
export function dialogStars(st: DlgState | undefined, d: Dialog) {
  if (!st || !st.done) return { spiegazione: false, soluzione: false, clean: false };
  const spiegazione = d.steps.every((s, i) => s.phase === "soluzione" || st.firstBest[i]);
  const soluzione = !st.grave && d.steps.every((s, i) => s.phase !== "soluzione" || st.firstBest[i]);
  return { spiegazione, soluzione, clean: st.wrong === 0 };
}

/** Come è andata, in una riga: per il gioco e per la riga di comando. */
export function dialogOutcome(st: DlgState): { title: string; text: string; ok: boolean } {
  const n = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;
  if (st.wrong) {
    return {
      ok: false,
      title: st.grave ? (st.grave === 1 ? "Con un errore grave" : "Con errori gravi") : "Con qualche inciampo",
      text: `${n(st.wrong, "risposta sbagliata", "risposte sbagliate")}${st.grave ? `, di cui ${n(st.grave, "grave", "gravi")}` : ""}. Rileggi i commenti della titolare qui sopra.`,
    };
  }
  if (st.fair) return { ok: true, title: "Servito, senza errori", text: `Nessuna risposta sbagliata, ma ${n(st.fair, "mossa era incompleta", "mosse erano incomplete")}: rileggi il commento della titolare.` };
  return { ok: true, title: "Servito bene", text: "Tutte le mosse giuste: le domande che servono, le spiegazioni esatte, la soluzione giusta." };
}

export const KIND_LABEL: Record<ChoiceKind, string> = { best: "Bene", ok: "Va bene, ma…", no: "Non così", grave: "Errore grave" };
