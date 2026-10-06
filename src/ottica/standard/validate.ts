/* Controllo automatico dello standard del corso di ottica (docs/ottica/STANDARD.md, regole O1–O10).
   Lo usano npm run standard e i test: con un errore il capitolo non esce. */
import { diop, normAxis, type SphCyl } from "../core/eye";
import { fill, isLensProva, solutions, startValue, values, withVariant } from "../core/prova";
import type { Card, Dialog, Level, Ricetta } from "../core/types";

export interface Finding {
  lv: string;
  code: string;
  sev: "errore" | "avviso";
  msg: string;
}

/** Addizione plausibile per età (valori di negozio, larghi apposta). */
export const ADD_BY_AGE: [number, number, number][] = [
  [40, 0.75, 1.25],
  [45, 1.0, 1.75],
  [50, 1.5, 2.25],
  [55, 2.0, 2.75],
  [60, 2.25, 3.5],
];
export function addRange(age: number): [number, number] | null {
  let r: [number, number] | null = null;
  for (const [a, lo, hi] of ADD_BY_AGE) if (age >= a) r = [lo, hi];
  return r;
}

const LIM = { msg: 170, say: 220, choice: 260, choiceWarn: 220, reply: 200, tip: 260, para: 460, opt: 90, title: 40, short: 80 };

const quarter = (x: number) => Math.abs(x * 4 - Math.round(x * 4)) < 1e-9;

/** Tutti i testi di un livello, con il posto da cui vengono (per i messaggi). */
function texts(lv: Level, cards: Record<string, Card>): [string, string][] {
  const out: [string, string][] = [];
  const add = (where: string, t?: string) => { if (t) out.push([where, t]); };
  add("cliente", lv.customer.msg);
  lv.learn.forEach((t, i) => add(`impari ${i + 1}`, t));
  for (const id of lv.cards) {
    const c = cards[id];
    if (!c) continue;
    add(`scheda ${id}: titolo`, c.t);
    [...(c.p || []), ...(c.ol || []), ...(c.after || [])].forEach((t, i) => add(`scheda ${id} §${i + 1}`, t));
    add(`scheda ${id}: titolare`, c.tutor);
    (c.g || []).forEach(([a, b]) => { add(`scheda ${id}: lessico`, a); add(`scheda ${id}: lessico`, b); });
  }
  const p = lv.prova;
  if (p) {
    add("prova: obiettivo", p.goal);
    p.hints.forEach((h, i) => add(`aiuto ${i + 1}`, h));
    if ("bet" in p) { add("scommessa", p.bet.q); p.bet.o.forEach(o => add("scommessa: opzione", o)); add("scommessa: perché", p.bet.why); }
    if (p.type === "ricetta") p.tasks.forEach((t, i) => { add(`ricetta ${i + 1}`, t.q); add(`ricetta ${i + 1}: perché`, t.why); });
  }
  for (const d of lv.dialogs) {
    add(`${d.id}: entra`, d.who.msg);
    add(`${d.id}: fine`, d.end);
    d.steps.forEach((s, i) => {
      add(`${d.id} mossa ${i + 1}: nota`, s.note);
      add(`${d.id} mossa ${i + 1}: cliente`, s.say);
      s.choices.forEach((c, j) => { add(`${d.id} mossa ${i + 1}.${j + 1}`, c.t); add(`${d.id} mossa ${i + 1}.${j + 1}: risposta`, c.reply); add(`${d.id} mossa ${i + 1}.${j + 1}: titolare`, c.tip); add(`${d.id} mossa ${i + 1}.${j + 1}: fine`, c.end); });
    });
  }
  lv.quiz.forEach((q, i) => { add(`domanda ${i + 1}`, q.q); q.o.forEach(o => add(`domanda ${i + 1}: opzione`, o)); add(`domanda ${i + 1}: perché`, q.why); });
  return out;
}

/** O7: diottrie con segno scritte come in negozio: «−1,75», «+2,00». */
export function badNumbers(t: string): string[] {
  const bad: string[] = [];
  const re = /(^|[\s(«"'/])([+\-−])(\d[\d.,]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const sign = m[2], num = m[3].replace(/[.,]+$/, "");
    const tok = sign + num;
    if (sign === "-") bad.push(`«${tok}»: il meno si scrive −, non -`);
    else if (num.includes(".")) bad.push(`«${tok}»: i decimali vanno con la virgola`);
    else if (!/,\d\d$/.test(num)) bad.push(`«${tok}»: le diottrie si scrivono con due decimali`);
  }
  return bad;
}

function checkLens(lv: string, where: string, l: SphCyl, out: Finding[]) {
  if (!quarter(l.sph) || !quarter(l.cyl)) out.push({ lv, code: "O6", sev: "errore", msg: `${where}: le diottrie vanno a quarti (${l.sph}, ${l.cyl})` });
  if (l.cyl > 0) out.push({ lv, code: "O6", sev: "errore", msg: `${where}: il cilindro si scrive col meno` });
  if (!Number.isInteger(l.axis) || l.axis < 1 || l.axis > 180) out.push({ lv, code: "O6", sev: "errore", msg: `${where}: asse ${l.axis} fuori da 1–180` });
  if (Math.abs(l.sph) > 12) out.push({ lv, code: "O6", sev: "avviso", msg: `${where}: sfera ${diop(l.sph)} insolita per un primo capitolo` });
}

function checkRicetta(lv: string, where: string, r: Ricetta, age: number | null, out: Finding[]) {
  checkLens(lv, `${where} OD`, r.od, out);
  checkLens(lv, `${where} OS`, r.os, out);
  if (r.add != null) {
    if (!quarter(r.add) || r.add < 0.75 || r.add > 3.5) out.push({ lv, code: "O6", sev: "errore", msg: `${where}: ADD ${r.add} fuori da +0,75…+3,50 o non a quarti` });
    const rg = age != null ? addRange(age) : null;
    if (age != null && (!rg || r.add < rg[0] - 1e-9 || r.add > rg[1] + 1e-9)) out.push({ lv, code: "O6", sev: "errore", msg: `${where}: ADD ${diop(r.add)} non plausibile a ${age} anni${rg ? ` (di solito ${diop(rg[0])}…${diop(rg[1])})` : ""}` });
  }
}

function checkDialog(lv: string, d: Dialog, out: Finding[], pick: boolean, varsList: (Record<string, string> | undefined)[]) {
  const E = (msg: string, sev: Finding["sev"] = "errore", code = "O4") => out.push({ lv, code, sev, msg: `${d.id}: ${msg}` });
  if (!d.steps.length) E("dialogo vuoto");
  if (d.steps[0] && !d.steps[0].say) E("la prima mossa deve cominciare con una battuta del cliente");
  if (!d.end) E("manca la fine");
  if (!pick && !d.steps.some(s => s.phase === "ascolto")) E("nessuna mossa di ascolto: la stella dell'ascolto non si può prendere");
  if (!pick && !d.steps.some(s => s.phase !== "ascolto")) E("nessuna mossa di spiegazione o proposta");
  d.steps.forEach((s, i) => {
    const at = `mossa ${i + 1}`;
    if (s.choices.length < 2) E(`${at}: servono almeno due scelte`);
    if (!s.choices.some(c => c.ok === "best")) E(`${at}: nessuna scelta migliore`);
    if (!s.choices.some(c => c.ok === "no" || c.ok === "grave")) E(`${at}: nessuna scelta sbagliata: non c'è niente da decidere`, "avviso");
    const ts = s.choices.map(c => c.t.trim().toLowerCase());
    if (new Set(ts).size !== ts.length) E(`${at}: due scelte uguali`);
    s.choices.forEach((c, j) => {
      const cj = `${at}.${j + 1}`;
      if (!c.reply || !c.tip) E(`${cj}: mancano la risposta del cliente o il consiglio della titolare`);
      if (c.end && (c.ok === "no" || c.ok === "grave")) E(`${cj}: solo una scelta giusta (best o ok) può chiudere il dialogo con la sua fine`);
      if (c.t.length > LIM.choice) E(`${cj}: ${c.t.length} caratteri, troppo lunga per il telefono (max ${LIM.choice})`, "errore", "O8");
      else if (c.t.length > LIM.choiceWarn) E(`${cj}: ${c.t.length} caratteri, lunga`, "avviso", "O8");
      if (c.reply.length > LIM.reply) E(`${cj}: risposta di ${c.reply.length} caratteri (max ${LIM.reply})`, "errore", "O8");
      if (c.tip.length > LIM.tip) E(`${cj}: consiglio di ${c.tip.length} caratteri (max ${LIM.tip})`, "errore", "O8");
      // O9: chi sta al banco non dice gradazioni (anche dopo aver messo i numeri della variante)
      if ((c.ok === "best" || c.ok === "ok") && varsList.some(v => /[+−-]\d+[.,]\d/.test(fill(c.t, v)))) E(`${cj}: una scelta giusta non può dire una gradazione: la misura l'ottico optometrista o l'oculista`, "errore", "O9");
    });
    if (s.say && s.say.length > LIM.say) E(`${at}: battuta di ${s.say.length} caratteri (max ${LIM.say})`, "errore", "O8");
  });
}

export function validateOttica(levels: Level[], cards: Record<string, Card>): Finding[] {
  const out: Finding[] = [];
  const taught = new Set<string>();
  const ids = new Set<string>();
  levels.forEach((lv, k) => {
    const E = (code: string, msg: string, sev: Finding["sev"] = "errore") => out.push({ lv: lv.id, code, sev, msg });
    /* O1 livello completo */
    if (ids.has(lv.id)) E("O1", "id ripetuto");
    ids.add(lv.id);
    if (lv.n !== k + 1) E("O1", `numero ${lv.n}, atteso ${k + 1}`);
    if (!lv.title || lv.title.length > LIM.title) E("O1", `titolo vuoto o lungo (max ${LIM.title})`);
    if (!lv.short || lv.short.length > LIM.short) E("O1", `sottotitolo vuoto o lungo (max ${LIM.short})`);
    if (!lv.customer.msg || lv.customer.msg.length > LIM.msg) E("O8", `il cliente si presenta in più di ${LIM.msg} caratteri`);
    if (!lv.learn.length) E("O1", "manca «Cosa impari»");
    if (!lv.cards.length) E("O1", "nessuna scheda");
    if (lv.quiz.length < 3) E("O1", "servono almeno tre domande dal laboratorio");
    if (lv.pick) {
      if (lv.prova) E("O1", "la giornata in negozio non ha prova lenti");
      if (lv.pick > lv.dialogs.length) E("O1", "si pescano più clienti di quelli scritti");
      if (lv.stars.length !== lv.pick) E("O1", "una stella per cliente");
    } else {
      if (lv.dialogs.length !== 1) E("O1", "un livello normale ha un solo dialogo");
      if (!lv.prova) E("O1", "un livello normale ha la prova");
    }
    /* O2 schede */
    for (const id of lv.cards) {
      const c = cards[id];
      if (!c) { E("O2", `scheda ${id} inesistente`); continue; }
      if (!c.teaches.length) E("O2", `scheda ${id}: non dichiara cosa insegna`, "avviso");
      [...(c.p || []), ...(c.ol || []), ...(c.after || [])].forEach(t => { if (t.length > LIM.para) E("O8", `scheda ${id}: paragrafo di ${t.length} caratteri (max ${LIM.para})`, "avviso"); });
      c.teaches.forEach(t => taught.add(t));
    }
    /* O3 insegnato prima: le richieste di prova, dialoghi e domande */
    const need = new Map<string, string>();
    (lv.prova?.requires || []).forEach(r => need.set(r, "prova"));
    lv.dialogs.forEach(d => d.steps.forEach((s, i) => s.choices.forEach((c, j) => (c.requires || []).forEach(r => need.set(r, `${d.id} mossa ${i + 1}.${j + 1}`)))));
    lv.quiz.forEach((q, i) => (q.requires || []).forEach(r => need.set(r, `domanda ${i + 1}`)));
    for (const [r, where] of need) if (!taught.has(r)) E("O3", `${where} richiede «${r}», mai insegnato in questo livello o prima`);
    /* le varianti del caso: i testi si controllano con i numeri di ognuna */
    const lp = lv.prova;
    const variants = lp && lp.type !== "ricetta" && lp.variants ? lp.variants : [];
    const varsList: (Record<string, string> | undefined)[] = variants.length ? variants.map(v => v.vars) : [undefined];
    /* O4 dialoghi */
    lv.dialogs.forEach(d => checkDialog(lv.id, d, out, !!lv.pick, varsList));
    /* O5 prova risolvibile, con una sola risposta */
    const p = lv.prova;
    if (isLensProva(p)) {
      if (p.variants && !p.variants.length) E("O5", "elenco di varianti vuoto");
      const sols = new Set<number>();
      (p.variants?.length ? p.variants : [undefined]).forEach((v, vi) => {
        const pv = withVariant(p, v), tag = v ? ` (variante ${vi + 1})` : "";
        const sol = solutions(pv), vs = values(pv), st = startValue(pv);
        if (sol.length !== 1) E("O5", `la prova${tag} ha ${sol.length} soluzioni (${sol.join(", ")}): deve averne una`);
        if (!vs.includes(st)) E("O5", `il comando parte fuori scala (${st})${tag}`);
        if (sol.includes(st)) E("O5", `la prova parte già risolta${tag}`);
        const s0 = sol[0];
        if (s0 != null) {
          sols.add(s0);
          const txt = pv.type === "asse" ? `${normAxis(s0)}°` : diop(s0);
          if (!fill(pv.hints[pv.hints.length - 1], v?.vars).includes(txt)) E("O5", `l'ultimo aiuto deve dare la soluzione (${txt})${tag}`);
        }
        checkLens(lv.id, `occhio del cliente${tag}`, pv.eye.rx, out);
        if (pv.type === "asse") checkLens(lv.id, `lente di prova${tag}`, pv.lens, out);
        if (pv.type === "vicino" && s0 != null) {
          const rg = addRange(pv.eye.age);
          if (!rg || s0 < rg[0] - 1e-9 || s0 > rg[1] + 1e-9) E("O6", `addizione ${diop(s0)} non plausibile a ${pv.eye.age} anni${tag}`);
        }
      });
      if ((p.variants?.length || 0) > 1 && sols.size < 2) E("O5", "tutte le varianti hanno la stessa soluzione: la prova si impara a memoria", "avviso");
      if (p.bet.ok < 0 || p.bet.ok >= p.bet.o.length || p.bet.o.length < 2) E("O5", "scommessa senza risposta giusta");
      if (p.hints.length < 2) E("O5", "servono almeno due aiuti");
    } else if (p && p.type === "ricetta") {
      checkRicetta(lv.id, "ricetta", p.ricetta, p.age, out);
      if (!p.tasks.length) E("O5", "ricetta senza domande");
      p.tasks.forEach((t, i) => {
        if (!t.ok.length) E("O5", `domanda ${i + 1} sulla ricetta senza risposta`);
        for (const c of t.ok) {
          const empty = c === "ADD" ? !p.ricetta.add : (() => { const [eye, f] = c.split("."); const l = eye === "OD" ? p.ricetta.od : p.ricetta.os; return f !== "SF" && !l.cyl; })();
          if (empty) E("O5", `domanda ${i + 1}: la risposta ${c} è una casella vuota`);
        }
      });
      if (p.hints.length < 2) E("O5", "servono almeno due aiuti");
    }
    lv.dialogs.forEach(d => d.steps.forEach((s, i) => { if (s.show?.ricetta) checkRicetta(lv.id, `${d.id} mossa ${i + 1}`, s.show.ricetta, d.who.age || null, out); }));
    /* O7 numeri, con i numeri di ogni variante; nessun {segnaposto} senza valore */
    for (const [where, t] of texts(lv, cards)) {
      const found = new Set<string>();
      for (const v of varsList) {
        const ft = fill(t, v);
        for (const b of badNumbers(ft)) found.add(`${where}: ${b}`);
        const left = ft.match(/\{\w+\}/g);
        if (left) found.add(`${where}: ${left.join(", ")} senza valore${v ? " in una variante" : ": il livello non ha varianti"}`);
      }
      found.forEach(m => E("O7", m));
    }
    /* O10 domande ben fatte */
    lv.quiz.forEach((q, i) => {
      if (q.o.length < 3) E("O10", `domanda ${i + 1}: almeno tre opzioni`);
      if (q.ok < 0 || q.ok >= q.o.length) E("O10", `domanda ${i + 1}: risposta giusta fuori dalle opzioni`);
      if (new Set(q.o).size !== q.o.length) E("O10", `domanda ${i + 1}: opzioni ripetute`);
      if (q.o.some(o => o.length > LIM.opt)) E("O8", `domanda ${i + 1}: opzione lunga (max ${LIM.opt})`, "avviso");
      if (!q.why) E("O10", `domanda ${i + 1}: manca il perché`);
    });
  });
  /* O10 la risposta giusta non si riconosce dalla lunghezza */
  let steps = 0, longest = 0, shortest = 0;
  for (const lv of levels) for (const d of lv.dialogs) for (const s of d.steps) {
    steps++;
    const best = s.choices.filter(c => c.ok === "best").map(c => c.t.length), other = s.choices.filter(c => c.ok !== "best").map(c => c.t.length);
    if (Math.max(...best) > Math.max(...other)) longest++;
    if (Math.min(...best) < Math.min(...other)) shortest++;
  }
  if (steps && longest / steps > 0.4) out.push({ lv: "corso", code: "O10", sev: "avviso", msg: `la scelta migliore è la più lunga in ${longest} mosse su ${steps}: si indovina senza capire. Allunga qualche risposta sbagliata o accorcia le giuste.` });
  if (steps && shortest / steps > 0.4) out.push({ lv: "corso", code: "O10", sev: "avviso", msg: `la scelta migliore è la più corta in ${shortest} mosse su ${steps}: si indovina senza capire. Accorcia qualche risposta sbagliata o allunga le giuste.` });
  return out;
}
