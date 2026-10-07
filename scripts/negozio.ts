/* Il corso di ottica da riga di comando, per le prove alla cieca: le stesse schermate e gli stessi giudizi del gioco.
   Uso:  npx tsx scripts/negozio.ts <livello> [seme] <<'FINE'
         cliente
         schede
         scommessa
         scommetti 2
         lente −1,75
         conferma
         banco
         di 1
         FINE
   Comandi (uno per riga):
     cliente · schede · scommessa · scommetti <n> · guarda <n> · lente <diottrie> · addizione <diottrie> · asse <gradi>
     conferma · aiuto · ricetta · tocca <cella, per esempio OD.SF o «OD SF»> · occhiale <lontano|vicino|progressive|ufficio>
     banco · di <n> · prossimo · domande · rispondi <n> · stelle
   Il seme decide la ricetta del cliente (nei livelli con varianti) e l'ordine delle opzioni, come una partita del gioco.
   Come nel gioco, si va avanti e non si torna indietro: prova → banco → domande. */
import { dialogOutcome, dialogStars, KIND_LABEL, newDialog, say, type DlgState } from "../src/ottica/core/banco";
import { clearRange, diop, normAxis, see, type Sight } from "../src/ottica/core/eye";
import { cellWhy, fill, GUARDA, isLensProva, lensAt, type Occhiale, OCCHIALI, occhialeLens, occhialeWords, startValue, values, verdict, withVariant } from "../src/ottica/core/prova";
import type { Dialog, RxCell } from "../src/ottica/core/types";
import { CARDS, LEVELS } from "../src/ottica/content";
import { focusWords, sceneLabel, sharpWords, workWords } from "../src/ottica/draw";
import { readFileSync } from "node:fs";

const [id, seedArg] = process.argv.slice(2);
const lv = LEVELS.find(l => l.id === id);
if (!lv) {
  console.log("Livelli: " + LEVELS.map(l => `${l.id} (${l.title})`).join(", "));
  process.exit(1);
}
// il seme si mescola col livello (fmix32 di MurmurHash3): semi vicini e livelli diversi danno partite scorrelate
const fmix = (h: number) => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); return h ^ (h >>> 16); };
let seed = fmix(fmix(Math.max(1, Math.floor(+seedArg || 1))) ^ [...id].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261));
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shuffle = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1");
const num = (s: string) => +s.replace("−", "-").replace(",", ".").replace("°", "");
const CELLS: RxCell[] = ["OD.SF", "OD.CIL", "OD.AX", "OS.SF", "OS.CIL", "OS.AX", "ADD"];

const LAB_TXT: Record<string, string> = {
  occhio: "occhio di lato con i raggi e la vista del cliente; si sceglie «Lontano» o «Telefono, 40 cm»",
  miope: "occhio miope di lato e la vista del cliente; «Lontano» o «Telefono, 30 cm»",
  lente: "lo stesso occhio miope che guarda lontano; un cursore mette una lente da −4,00 a +1,00",
  iper: "occhio ipermetrope di 33 anni; «Lontano» o «Computer, 60 cm»; si vede quanto lavora il cristallino",
  piu: "lo stesso occhio ipermetrope; un cursore mette una lente da −1,00 a +4,00; «Lontano» o «Computer»",
  eta: "cursore dell'età (20–70): il punto più vicino nitido su un righello in centimetri, il telefono a 35 cm",
  lettura: "Carla, 56 anni: «Senza occhiali» o «Da lettura +2,50»; «Telefono, 35 cm» o «Lontano»",
  progressiva: "lente progressiva vista da davanti; lo sguardo «In alto», «Al centro», «In basso», «In basso a lato»",
  quadrante: "un occhio con astigmatismo: «Senza occhiali» o «Con la lente giusta»; il quadrante a raggiera o la strada di notte",
  asse: "lente con cilindro −1,50, asse 90°, sullo schema TABO; errore d'asse 0°, 5°, 30°, 45° e il quadrante come si vede",
  storta: "cursore «Montatura storta (gradi)» da −30 a +30; occhiale «Con cilindro» o «Solo sfera, −1,00»",
  ricetta: "ricetta d'esempio: toccando un numero si legge cosa vuol dire",
};

/* la partita: la variante viene dal seme, come nel gioco viene dal caso */
const p0 = lv.prova;
const vi = p0 && p0.type !== "ricetta" && p0.variants?.length ? Math.floor(rnd() * p0.variants.length) : -1;
const variant = vi >= 0 && p0 && p0.type !== "ricetta" ? p0.variants![vi] : undefined;
const p = p0 ? withVariant(p0, variant) : undefined;
const F = (t: string) => fill(t, variant?.vars);
const age = variant ? variant.eye.age : lv.customer.age;

const r = {
  betOrder: p && "bet" in p ? shuffle(range(p.bet.o.length)) : [],
  bet: null as number | null,
  v: isLensProva(p) ? startValue(p) : 0,
  view: 0,
  firstOk: null as boolean | null,
  hint: -1,
  rt: { i: 0, wrong: 0 },
  dq: lv.pick ? shuffle(lv.dialogs.map(d => d.id)).slice(0, lv.pick) : lv.dialogs.map(d => d.id),
  di: 0,
  dlg: {} as Record<string, DlgState>,
  shown: {} as Record<string, number>,
  quiz: null as null | { items: { q: (typeof lv.quiz)[number]; order: number[] }[]; i: number; score: number },
  /** dove sei: come nel gioco, non si torna indietro */
  fase: "prova" as "prova" | "banco" | "domande",
};
const PROVA_CMD = new Set(["scommessa", "scommetti", "guarda", "lente", "addizione", "asse", "conferma", "aiuto", "ricetta", "tocca", "occhiale"]);
const DLG: Record<string, Dialog> = Object.fromEntries(lv.dialogs.map(d => [d.id, d]));

const sightTxt = (s: Sight, o: { work?: boolean; scene?: Parameters<typeof focusWords>[1] } = {}) => `${sharpWords(s)}, circa ${String(s.decimi).replace(".", ",")}/10${o.work === false ? "" : ` · cristallino: ${workWords(s)}`} · ${focusWords(s, o.scene).toLowerCase()}`;
const cm = (m: number) => (!Number.isFinite(m) ? "lontano" : m < 1 ? `${Math.round(m * 100)} cm` : `${(Math.round(m * 10) / 10).toLocaleString("it-IT")} m`);
function provaTxt(): string {
  if (!isLensProva(p)) return "";
  const l = lensAt(p, r.v), w = p.views[r.view], s = see(p.eye, l, w.d);
  const ctl = p.type === "asse" ? `asse ${normAxis(r.v)}°` : p.type === "vicino" ? `ADD ${diop(r.v)}` : Math.abs(r.v) < 1e-9 ? "nessuna lente" : `lente ${diop(r.v)}`;
  let out = `[${ctl}] ${w.label} (${sceneLabel(w.scene).toLowerCase()}): ${sightTxt(s, { work: p.type !== "asse", scene: w.scene })}`;
  if (p.type === "vicino" && r.view === 0) { const cr = clearRange(p.eye, l); out += ` · zona nitida da ${cm(cr.near)} a ${cm(cr.far)}`; }
  return out;
}
function dlg(): DlgState {
  const id = r.dq[r.di];
  if (!r.dlg[id]) r.dlg[id] = newDialog(DLG[id], n => shuffle(range(n)), lv!.pick ? undefined : variant?.vars);
  return r.dlg[id];
}
function bancoTxt(): string {
  const id = r.dq[r.di], d = DLG[id], st = dlg();
  const from = r.shown[id] || 0;
  const lines = st.log.slice(from).map(it => it.k === "c" ? `${it.who}: «${it.text}»` : it.k === "t" ? `Tu: «${it.text}»` : it.k === "n" ? `(${it.text})` : it.k === "rx" ? `(ricetta sul banco: OD ${diop(it.rx!.od.sph)}${it.rx!.od.cyl ? ` ${diop(it.rx!.od.cyl)} × ${it.rx!.od.axis}` : ""} · OS ${diop(it.rx!.os.sph)}${it.rx!.os.cyl ? ` ${diop(it.rx!.os.cyl)} × ${it.rx!.os.axis}` : ""}${it.rx!.add ? ` · ADD ${diop(it.rx!.add)}` : ""})` : `La titolare dice · ${KIND_LABEL[it.ok!]}\n   ${it.text}`);
  r.shown[id] = st.log.length;
  const who = !lv!.pick && d === lv!.dialogs[0] ? { ...d.who, age } : d.who;
  const head = from === 0 ? [`Al banco${r.dq.length > 1 ? ` · cliente ${r.di + 1} di ${r.dq.length}` : ""}: ${who.name}, ${who.age} anni, ${who.job}`] : [];
  if (st.done) {
    const oc = dialogOutcome(st);
    return [...head, ...lines, `(${st.end})`, `Esito: ${oc.title}. ${oc.text}`, r.di < r.dq.length - 1 ? "Comando «prossimo» per il cliente dopo." : "Comando «domande» per le domande dal laboratorio."].join("\n");
  }
  const s = d.steps[st.step];
  return [...head, ...lines, "Cosa dici?", ...st.order[st.step].map((ci, k) => `  ${k + 1}. ${st.tried.includes(ci) ? "(già provata) " : ""}${F(s.choices[ci].t)}`)].join("\n");
}
const cellOf = (a: string): RxCell | null => {
  const c = a.toUpperCase().replace(/[\s\-_]+/g, ".").replace(/\.+$/, "");
  return (CELLS as string[]).includes(c) ? (c as RxCell) : null;
};

console.log(`Livello ${lv.n}: ${lv.title}`);
const input = readFileSync(0, "utf8").split("\n").map(l => l.trim()).filter(Boolean);
for (const line of input) {
  const [cmd, ...rest] = line.split(/\s+/);
  const a = rest.join(" ");
  let out = "";
  if (PROVA_CMD.has(cmd) && r.fase !== "prova") out = "la prova è chiusa: sei già al banco (come nel gioco, non si torna indietro)";
  else if (cmd === "cliente") {
    const c = lv.customer;
    const intro = lv.pick ? `${c.name}, ${c.job}. ${F(c.msg)}` : `${c.name}, ${age} anni, ${c.job}: «${F(c.msg)}»`;
    out = `${intro}\nCosa impari:\n${lv.learn.map(x => "  - " + x).join("\n")}`;
  } else if (cmd === "schede") {
    out = lv.cards.map((cid, i) => {
      const c = CARDS[cid];
      return [`--- Scheda ${i + 1} di ${lv.cards.length}: ${c.t}`, ...(c.p || []).map(plain), ...(c.ol || []).map((x, k) => `${k + 1}. ${plain(x)}`), ...(c.after || []).map(plain), c.lab ? `[laboratorio da toccare: ${LAB_TXT[c.lab]}]` : "", ...(c.g || []).map(([x, y]) => `  lessico: ${x} = ${y}`), c.tutor ? `La titolare dice: ${c.tutor}` : ""].filter(Boolean).join("\n");
    }).join("\n\n");
  } else if (cmd === "scommessa") {
    if (!p || !("bet" in p)) out = "in questo livello non c'è scommessa";
    else out = `Prova lenti · ${lv.customer.name}, ${age} anni. L'occhiale di prova: metti le lenti e guardi come vede il cliente. È una simulazione semplificata, per capire cosa fa la lente.\nPrima, scommetti: ${F(p.bet.q)}\n${r.betOrder.map((i, k) => `  ${k + 1}. ${F(p.bet.o[i])}`).join("\n")}`;
  } else if (cmd === "scommetti") {
    if (!p || !("bet" in p)) out = "in questo livello non c'è scommessa";
    else if (r.bet != null) out = "hai già scommesso";
    else {
      const b = r.betOrder[+a - 1];
      if (b == null) out = "opzione sconosciuta";
      else {
        r.bet = b;
        out = `${r.bet === p.bet.ok ? "Scommessa vinta" : "Scommessa persa"}: ${F(p.bet.o[r.bet])}. ${F(p.bet.why)}`;
        if (isLensProva(p)) out += `\nAdesso: ${F(p.goal)}\nViste: ${p.views.map((w, k) => `${k + 1}. ${w.label}`).join(" · ")}. Comando: ${p.type === "asse" ? `asse <gradi>, a passi di ${p.step}` : p.type === "vicino" ? `addizione <diottrie>, da ${diop(p.min)} a ${diop(p.max)}` : `lente <diottrie>, da ${diop(p.min)} a ${diop(p.max)}`}.\n${provaTxt()}`;
      }
    }
  } else if (cmd === "guarda") {
    if (!isLensProva(p) || !p.views[+a - 1]) out = "vista sconosciuta";
    else { r.view = +a - 1; out = provaTxt(); }
  } else if (cmd === "lente" || cmd === "addizione" || cmd === "asse") {
    if (!isLensProva(p)) out = "in questo livello non c'è l'occhiale di prova";
    else if (r.bet == null) out = "prima scommetti";
    else {
      const v = num(a), vs = values(p);
      // l'asse si scrive da 0 a 180 (0 e 180 sono la stessa direzione)
      const ok = p.type === "asse" ? Number.isInteger(v) && v >= 0 && v <= 180 && v % p.step === 0 : vs.some(x => Math.abs(x - v) < 1e-9);
      if (!ok) out = `valore non disponibile (da ${p.type === "asse" ? "0°" : diop(vs[0])} a ${p.type === "asse" ? vs[vs.length - 1] + "°" : diop(vs[vs.length - 1])}${p.type === "asse" ? `, a passi di ${p.step}` : ", a quarti"})`;
      else { r.v = p.type === "asse" ? normAxis(v) : v; out = provaTxt(); }
    }
  } else if (cmd === "conferma") {
    if (!isLensProva(p)) out = "niente da confermare";
    else if (r.bet == null) out = "prima scommetti";
    else { const vd = verdict(p, r.v); if (r.firstOk == null) r.firstOk = vd.ok; out = `${vd.ok ? "GIUSTO" : "NON ANCORA"}: ${vd.msg}`; }
  } else if (cmd === "aiuto") {
    if (!p) out = "niente aiuti qui";
    else { r.hint = (r.hint + 1) % p.hints.length; out = `Aiuto ${r.hint + 1} di ${p.hints.length}: ${F(p.hints[r.hint])}`; }
  } else if (cmd === "ricetta") {
    if (!p || p.type !== "ricetta") out = "in questo livello non c'è la ricetta";
    else {
      const R = p.ricetta, c = (l: typeof R.od) => `SF ${diop(l.sph)} · CIL ${l.cyl ? diop(l.cyl) : "—"} · AX ${l.cyl ? l.axis + "°" : "—"}`;
      out = `${p.goal}\n${R.who || "Ricetta"} (${R.date || ""})\n  OD: ${c(R.od)}\n  OS: ${c(R.os)}\n  ADD: ${R.add ? diop(R.add) : "—"} (per vicino, tutti e due)\nCelle da toccare: ${CELLS.join(", ")}\n` + (r.rt.i < p.tasks.length ? `Domanda ${r.rt.i + 1} di ${p.tasks.length}: ${p.tasks[r.rt.i].q} (comando: tocca <cella>)` : "Ricetta letta.");
    }
  } else if (cmd === "tocca") {
    if (!p || p.type !== "ricetta") out = "in questo livello non c'è la ricetta";
    else if (r.rt.i >= p.tasks.length) out = "ricetta già letta";
    else {
      const t = p.tasks[r.rt.i], cell = cellOf(a);
      if (!cell) out = `cella sconosciuta (non conta come errore): scrivi una di ${CELLS.join(", ")}`;
      else if (t.ok.includes(cell)) { r.rt.i++; out = `GIUSTO: ${t.why}` + (r.rt.i < p.tasks.length ? `\nDomanda ${r.rt.i + 1} di ${p.tasks.length}: ${p.tasks[r.rt.i].q}` : `\nRicetta letta${r.rt.wrong ? `, con ${r.rt.wrong} ${r.rt.wrong === 1 ? "tocco sbagliato" : "tocchi sbagliati"}` : " senza errori"}. Ora puoi provare «occhiale ${OCCHIALI.map(o => o[0]).join("|")}».`); }
      else { r.rt.wrong++; out = `NO: ${cellWhy(p.ricetta, cell)} Non è quello che cerchi.`; }
    }
  } else if (cmd === "occhiale") {
    const kind = OCCHIALI.find(o => o[0] === a)?.[0] as Occhiale | undefined;
    if (!p || p.type !== "ricetta" || r.rt.i < p.tasks.length) out = "prima leggi la ricetta";
    else if (!kind) out = `occhiale sconosciuto: ${OCCHIALI.map(o => o[0]).join(", ")}`;
    else {
      const eye = { rx: p.ricetta.od, age: p.age }, add = p.ricetta.add || 0;
      out = `Occhio destro di ${lv.customer.name}, ${p.age} anni, occhiale «${OCCHIALI.find(o => o[0] === kind)![1]}»:\n` +
        GUARDA.map(g => `  ${g.label}: ${sightTxt(see(eye, occhialeLens(p.ricetta.od, add, kind, g.d), g.d), { scene: g.scene })}`).join("\n") + `\n${occhialeWords(kind, p.age)}`;
    }
  } else if (cmd === "banco") {
    if (r.fase === "domande") out = "il banco è chiuso: sei alle domande";
    else { r.fase = "banco"; out = bancoTxt(); }
  }
  else if (cmd === "di") {
    const id2 = r.dq[r.di], st = dlg(), d = DLG[id2];
    if (r.fase !== "banco") out = r.fase === "prova" ? "prima «banco»" : "il banco è chiuso: sei alle domande";
    else if (st.done) out = r.di < r.dq.length - 1 ? "dialogo finito: «prossimo» per il cliente dopo" : "dialogo finito: «domande» per le domande dal laboratorio";
    else {
      const ci = st.order[st.step][+a - 1];
      if (ci == null) out = "scelta sconosciuta";
      else if (st.tried.includes(ci)) out = "l'hai già provata";
      else { say(d, st, ci); out = bancoTxt(); }
    }
  } else if (cmd === "prossimo") {
    if (r.fase !== "banco") out = "prima «banco»";
    else if (!dlg().done) out = "prima finisci con questo cliente";
    else if (r.di >= r.dq.length - 1) out = "non ci sono altri clienti: «domande» per le domande dal laboratorio";
    else { r.di++; out = bancoTxt(); }
  } else if ((cmd === "domande" || cmd === "rispondi") && r.fase !== "domande" && !(cmd === "domande" && r.fase === "banco" && r.di === r.dq.length - 1 && dlg().done)) {
    out = cmd === "rispondi" ? "prima «domande»" : r.fase === "prova" ? "prima il banco: «banco»" : "prima finisci il banco";
  } else if (cmd === "domande" || cmd === "rispondi") {
    r.fase = "domande";
    if (!r.quiz) r.quiz = { items: shuffle(lv.quiz).slice(0, 3).map(q => ({ q, order: shuffle(range(q.o.length)) })), i: 0, score: 0 };
    const qz = r.quiz;
    if (cmd === "domande" && qz.i === 0) out = "Le domande non danno stelle: servono a ripassare.";
    if (cmd === "rispondi") {
      const it = qz.items[qz.i];
      if (!it) out = "domande finite";
      else {
        const pick = it.order[+a - 1];
        if (pick == null) out = "opzione sconosciuta";
        else { const ok = pick === it.q.ok; if (ok) qz.score++; qz.i++; out = `${ok ? "Giusto" : "Non proprio"}: ${it.q.why}`; }
      }
    }
    const it = qz.items[qz.i];
    out += (out ? "\n" : "") + (it ? `Domanda ${qz.i + 1} di ${qz.items.length}: ${it.q.q}\n${it.order.map((i, k) => `  ${k + 1}. ${it.q.o[i]}`).join("\n")}` : `Domande finite: ${qz.score} giuste su ${qz.items.length}.`);
  } else if (cmd === "stelle") {
    if (lv.pick) out = r.dq.map((x, i) => `${lv.stars[i]} (${DLG[x].who.name}): ${dialogStars(r.dlg[x], DLG[x]).clean ? "presa" : "non presa"}`).join("\n");
    else {
      const d = lv.dialogs[0], ds = dialogStars(r.dlg[d.id], d);
      const first = p && p.type === "ricetta" ? r.rt.i >= p.tasks.length && r.rt.wrong === 0 : !!p && "bet" in p && r.bet === p.bet.ok && r.firstOk === true;
      out = `${lv.stars[0]}: ${first ? "presa" : "non presa"}\n${lv.stars[1]}: ${ds.spiegazione ? "presa" : "non presa"}\n${lv.stars[2]}: ${ds.soluzione ? "presa" : "non presa"}`;
    }
  } else out = `comando sconosciuto: ${cmd}`;
  console.log(`> ${line}\n${out}\n`);
}
// per chi scrive i livelli: la soluzione non si stampa mai qui (sta negli aiuti)
