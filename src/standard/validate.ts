/* Controllo automatico dello standard degli esercizi (docs/STANDARD.md).
   Ogni regola ha un codice: S1…S17. Errori = il livello non si pubblica; avvisi = da guardare. */

import { collaudo, evaluate, switchesOf, termIds } from "../core/engine";
import { RULES } from "../core/rules";
import { checkFaults } from "../core/faults";
import type { Card, Comp, FiliLevel, GuastoLevel, Level } from "../core/types";

export interface Finding {
  lv: string;
  code: string;
  sev: "errore" | "avviso";
  msg: string;
}

type Rect = { x: number; y: number; w: number; h: number };
const inRect = (p: { x: number; y: number }, r: Rect, pad = 0) => p.x >= r.x - pad && p.x <= r.x + r.w + pad && p.y >= r.y - pad && p.y <= r.y + r.h + pad;
const rectIn = (a: Rect, r: Rect, pad = 2) => a.x >= r.x - pad && a.y >= r.y - pad && a.x + a.w <= r.x + r.w + pad && a.y + a.h <= r.y + r.h + pad;
/** nome di una linea del quadro: «Luci C10» */
export const LINE_RE = /^[A-Z][a-zà-ù]+( [a-zà-ù]+)? C\d+$/;
/** provenienza: «dall'interruttore», «dalla spina» */
export const ORIGIN_RE = /^(dal |dall'|dalla |dai |dagli )/i;
/** un tubo dice per dove passa un filo, non da dove arriva */
export const CONDUIT_RE = /^(dal |dall'|dalla )(tubo|canalina|cavo|corrugato)\b/i;

const startOfPath = (d?: string) => {
  const m = /^M\s*([\d.]+)[ ,]([\d.]+)/.exec(d || "");
  return m ? { x: +m[1], y: +m[2] } : null;
};

export function validate(levels: Level[], cards: Record<string, Card>): Finding[] {
  const out: Finding[] = [];
  const add = (lv: { id: string }, code: string, msg: string, sev: Finding["sev"] = "errore") => out.push({ lv: lv.id, code, sev, msg });

  const taughtUpTo = (n: number) => {
    const s = new Set<string>();
    for (const l of levels) if (l.n <= n) for (const id of l.cards) (cards[id]?.teaches || []).forEach(t => s.add(t));
    return s;
  };

  for (const cid of Object.keys(cards)) if (!(cards[cid].teaches || []).length) out.push({ lv: "schede", code: "S8", sev: "errore", msg: `la scheda «${cid}» non dichiara cosa insegna (teaches)` });
  const ids = new Set<string>();
  levels.forEach((l, i) => {
    if (ids.has(l.id)) add(l, "S0", "id ripetuto");
    ids.add(l.id);
    if (l.n !== i + 1) add(l, "S0", `numero ${l.n} fuori ordine: dovrebbe essere ${i + 1}`);
    for (const c of l.cards) if (!cards[c]) add(l, "S0", `la scheda «${c}» non esiste`);
  });

  for (const lv of levels) {
    const taught = taughtUpTo(lv.n);
    const need = new Set<string>(lv.requires || []);

    if (lv.type === "fili" || lv.type === "guasto") boardChecks(lv, add);
    if (lv.type === "fili") filiChecks(lv, add, need);
    if (lv.type === "guasto") {
      for (const f of checkFaults(lv)) add(lv, f.code, f.msg, f.sev);
      need.add("tester-misure");
      need.add("metodo-guasti");
      for (const f of lv.faults) (f.requires || []).forEach(t => need.add(t));
      if ((lv.hints || []).length < 2) add(lv, "S11", "servono almeno due suggerimenti");
    }

    if (lv.type === "serata") {
      /* S13 · ogni missione si completa dalla situazione iniziale con le azioni scritte */
      const sr = lv.ser;
      const apps = Object.fromEntries(sr.lines.flatMap(l => l.apps.map(a => [a.id, { ...a, line: l }])));
      const base = Object.values(apps)
        .filter(a => a.on)
        .reduce((t, a) => t + a.w, 0);
      const lim = (k: number) => k * 1100;
      const k0 = sr.contratti[0];
      const m3 = sr.missioni.find(m => m.cosa === "ciabatta");
      if (m3 && m3.app) {
        const extra = m3.app.reduce((t, id) => t + apps[id].w, 0),
          line = apps[m3.app[0]].line;
        const ciabA = extra / 230;
        if (ciabA <= (line.ciabatta || 0)) add(lv, "S13", "la missione della ciabatta non supera i suoi ampere");
        if (base + extra > lim(k0) && sr.tempi.ciabatta >= sr.tempi.contatore) add(lv, "S13", "la missione della ciabatta non si completa dall'inizio: il contatore stacca prima che la ciabatta scaldi");
      }
      const m2 = sr.missioni.find(m => m.cosa === "insieme");
      if (m2 && m2.app) {
        const tot = base + m2.app.reduce((t, id) => t + apps[id].w, 0);
        if (!sr.contratti.some(k => tot <= lim(k))) add(lv, "S13", "nessun contratto regge la missione «insieme»");
        if (tot > lim(k0) && m2.azione !== "contratto") add(lv, "S13", "la missione «insieme» richiede di cambiare contratto ma non lo dichiara");
      }
      need.add("contatore");
    }
    if (lv.type === "indagine") {
      /* S14 · l'indagine si risolve col metodo */
      const d = lv.ind,
        colpa = d.apps.find(a => a.colpa);
      const resto = d.apps.filter(a => !a.colpa).reduce((t, a) => t + a.leak, 0);
      if (!colpa) add(lv, "S14", "nessun colpevole dichiarato");
      else {
        if (resto >= d.soglia) add(lv, "S14", "senza il colpevole il differenziale scatta lo stesso: il metodo non funziona");
        if (colpa.leak < d.soglia) add(lv, "S14", "il colpevole da solo non fa scattare il differenziale");
      }
    }

    /* S8 · tutto quello che serve è stato insegnato in questo livello o prima */
    for (const t of need) if (!taught.has(t)) add(lv, "S8", `il livello usa «${t}», ma nessuna scheda fino a qui lo insegna`);
  }
  return out;
}

type Add = (lv: { id: string }, code: string, msg: string, sev?: Finding["sev"]) => void;

/** S9 · impaginazione, comune ai livelli con la tavola */
function boardChecks(lv: FiliLevel | GuastoLevel, add: Add) {
  const b = lv.board,
    comps = b.comps.filter(c => c.kind !== "sorgente");
  const zoneById = Object.fromEntries((b.zones || []).map(z => [z.id, z]));
  for (const z of b.zones || []) {
    if (!z.id) add(lv, "S9", `la zona «${z.label}» non ha un id`);
    if (z.label.length * 6.9 + 20 > z.w) add(lv, "S9", `il nome della zona «${z.label}» non ci sta (largo ${z.w})`);
    if (z.x < 0 || z.y < 0 || z.x + z.w > 360 || z.y + z.h > b.h) add(lv, "S9", `la zona «${z.label}» esce dalla tavola`);
  }
  for (const k of b.cables || []) if (k.label.length * 5.9 + 10 > k.w) add(lv, "S9", `il nome del cavo «${k.label}» non ci sta (largo ${k.w})`);
  for (const c of comps) {
    const z = zoneById[c.zone || ""];
    const bb = RULES.bbox(c);
    if (!z) {
      add(lv, "S9", `«${c.id}» non sta in nessuna zona (zone: ${c.zone})`);
      continue;
    }
    if (bb && !rectIn(bb, z)) add(lv, "S9", `«${c.id}» esce dalla zona «${z.label}»`);
    if (c.kind === "capo" && !inRect({ x: c.x || 0, y: c.y || 0 }, z)) add(lv, "S9", `la punta del filo ${c.color} è fuori dalla sua zona`);
    if (["interruttore", "deviatore", "invertitore"].includes(c.kind)) {
      const nm = c.locked ? "a muro" : c.kind,
        w = c.kind === "invertitore" ? 140 : 96;
      if (nm.length * 6.7 + 12 > w) add(lv, "S9", `la scritta «${nm}» non ci sta nel frutto «${c.id}»`);
    }
  }
  const pts: { id: string; x: number; y: number }[] = [];
  for (const c of comps) {
    if (c.locked) continue;
    if (c.kind === "capo") {
      if (lv.type === "fili") pts.push({ id: c.id, x: c.x || 0, y: c.y || 0 });
    } else for (const t of termIds(c)) pts.push({ id: `${c.id}.${t}`, ...RULES.tpos(lv, `${c.id}.${t}`) });
  }
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 28) add(lv, "S9", `${pts[i].id} e ${pts[j].id} sono troppo vicini (${d.toFixed(0)}): col dito si sbaglia`);
    }
}

function filiChecks(lv: FiliLevel, add: Add, need: Set<string>) {
  const b = lv.board,
    comps = b.comps.filter(c => c.kind !== "sorgente");
  const capi = comps.filter(c => c.kind === "capo");
  const cableOf = (c: Comp) => (b.cables || []).find(k => inRect({ x: c.fx || 0, y: c.fy || 0 }, k, 3));

  /* tipo di conduttore di un capo o di un filo fisso: L fase, R ritorno (cambia con i comandi), N, PE */
  const conductor = (term: string) => {
    const sw = switchesOf(lv),
      seen = new Set<string>();
    for (let m = 0; m < 1 << sw.length; m++) {
      const st: Record<string, number> = {};
      sw.forEach((id, i) => {
        st[id] = (m >> i) & 1;
      });
      seen.add(evaluate(lv, [], st).potOf(term) || "-");
    }
    if (seen.has("PE")) return "PE";
    if (seen.has("N")) return "N";
    if (seen.has("L") && seen.size > 1) return "R";
    if (seen.has("L")) return "L";
    return null;
  };

  /* S1 · ogni filo che arriva ha un'origine scritta */
  for (const c of capi) {
    const k = cableOf(c);
    if (!k) add(lv, "S1", `il filo ${c.color} (${c.id}) non esce da nessun cavo disegnato`);
    else if (CONDUIT_RE.test(k.label)) add(lv, "S1", `il cavo «${k.label}» dice per dove passa, non da dove arriva: nomina il pezzo o il posto (es. «dall'interruttore»)`);
    else if (!LINE_RE.test(k.label) && !ORIGIN_RE.test(k.label)) add(lv, "S1", `il cavo «${k.label}» non dice da dove arriva (serve il nome della linea, es. «Luci C10», o «dal…/dall'…»)`);
  }
  /* S2 · niente collegamenti invisibili */
  for (const f of (b.fixed || []).filter(x => !x.vis)) {
    const ends = [f.a, f.b].map(t => ({ t, c: RULES.compOf(lv, t) }));
    const src = ends.find(e => e.c.kind === "sorgente"),
      capo = ends.find(e => e.c.kind === "capo"),
      lk = ends.find(e => e.c.locked);
    if (src && capo) continue;
    if (src && lk) {
      if (!lk.c.lockedMsg) add(lv, "S2", `«${lk.c.id}» è già collegato ma non dice a cosa (lockedMsg)`);
      continue;
    }
    if (lk && capo) {
      const k = cableOf(capo.c),
        tube = (b.tubes || []).find(t => t.links === lk.c.id);
      if (!lk.c.lockedMsg) add(lv, "S2", `«${lk.c.id}» è già collegato ma non dice a cosa (lockedMsg)`);
      if (!k || k.from !== lk.c.id) add(lv, "S2", `il filo ${capo.c.color} arriva da «${lk.c.id}», ma il suo cavo non lo dice (from)`);
      if (!tube) add(lv, "S2", `nessun tubo disegnato collega «${lk.c.id}» al cavo del filo ${capo.c.color}`);
      continue;
    }
    add(lv, "S2", `collegamento invisibile ${f.a} → ${f.b}: va disegnato o tolto`);
  }
  /* S3 · i fili già posati partono da un cavo disegnato */
  for (const f of (b.fixed || []).filter(x => x.vis)) {
    const p = f.from || startOfPath(f.d);
    if (!p) {
      add(lv, "S3", `il filo fisso verso ${f.b} non ha un punto di partenza`);
      continue;
    }
    if (!(b.cables || []).some(k => inRect(p, k, 4))) add(lv, "S3", `il filo fisso verso ${f.b} non parte da un cavo con un nome`);
  }
  if ((b.fixed || []).some(x => x.vis) || comps.some(c => c.locked)) if (!lv.note) add(lv, "S10", "ci sono pezzi già collegati: la nota sopra la tavola deve dirlo");

  /* S4 · sicurezza coerente con la tavola */
  if (lv.safety.type === "quadro") {
    const present = new Set<string>();
    for (const c of capi) {
      const k = conductor(c.id + ".x");
      if (k) present.add(k);
    }
    for (const f of (b.fixed || []).filter(x => x.vis)) {
      const k = conductor(f.b);
      if (k) present.add(k);
    }
    const req: string[][] = [];
    for (const a of ["L", "R"])
      if (present.has(a)) {
        if (present.has("N")) req.push([a, "N"]);
        if (present.has("PE")) req.push([a, "PE"]);
      }
    if (present.has("N") && present.has("PE")) req.push(["N", "PE"]);
    const key = (p: string[]) => [p[0], p[1]].sort().join("-");
    const have = new Set(lv.safety.probes.map(p => key([p.a, p.b])));
    for (const r of req) if (!have.has(key(r))) add(lv, "S4", `manca la misura ${r.join("–")}: quei fili ci sono dove lavori`);
    for (const p of lv.safety.probes) for (const x of [p.a, p.b]) if (!present.has(x)) add(lv, "S4", `la misura «${p.label}» riguarda un filo (${x}) che sulla tavola non c'è`);
    const feed = lv.safety.breakers.find(x => x.id === (lv.safety as { feed: string }).feed)!;
    const lines = (b.cables || []).map(k => k.label).filter(l => LINE_RE.test(l));
    const feedName = `${feed.label} ${feed.sub || ""}`.trim();
    if (lv.trap !== "etichette" && !lines.includes(feedName)) add(lv, "S4", `la linea da staccare («${feedName}») non compare su nessun cavo della tavola`);
    if (lv.trap === "etichette" && lines.includes(feedName)) add(lv, "S4", "il livello dichiara la trappola delle etichette, ma il cavo dice il nome giusto della linea", "avviso");
  }

  /* S5 · la soluzione si mette con le regole del gioco e passa il collaudo */
  const rep = RULES.replay(lv, lv.solution);
  rep.errors.forEach(e => add(lv, "S5", "soluzione bloccata dal gioco: " + e));
  const sol = collaudo(lv, RULES.toWires(lv, lv.solution));
  if (sol.outcome !== "ok") add(lv, "S5", `la soluzione dà «${sol.outcome}» ${JSON.stringify(sol.issues)}`);

  /* S6 · le alternative corrette passano, comprese le simmetrie dei frutti */
  for (const alt of lv.alternatives || []) {
    const r = RULES.replay(lv, alt.w);
    r.errors.forEach(e => add(lv, "S6", `alternativa «${alt.name}» bloccata dal gioco: ${e}`));
    const c = collaudo(lv, RULES.toWires(lv, alt.w));
    if (c.outcome !== "ok") add(lv, "S6", `alternativa «${alt.name}» dà «${c.outcome}»`);
  }
  const SWAPS: Record<string, [string, string][]> = { presa: [["A", "B"]], interruttore: [["1", "2"]], deviatore: [["1", "2"]], invertitore: [["1", "2"], ["3", "4"]] };
  const prewired = new Set((b.fixed || []).filter(f => f.vis).map(f => f.b.split(".")[0]));
  for (const c of comps)
    for (const [x, y] of SWAPS[c.kind] || []) {
      if (c.locked || prewired.has(c.id)) continue;
      const map = (t: string) => (t === `${c.id}.${x}` ? `${c.id}.${y}` : t === `${c.id}.${y}` ? `${c.id}.${x}` : t);
      const v = lv.solution.map(([a, bb, ...r]) => [map(a), map(bb), ...r]) as typeof lv.solution;
      if (JSON.stringify(v) === JSON.stringify(lv.solution)) continue;
      const res = collaudo(lv, RULES.toWires(lv, v));
      if (res.outcome !== "ok") add(lv, "S6", `scambiando ${x} e ${y} su «${c.id}» (equivalenti) il collaudo dà «${res.outcome}»`);
      if (RULES.replay(lv, v).errors.length) add(lv, "S6", `scambiando ${x} e ${y} su «${c.id}» il gioco blocca un collegamento`);
    }

  /* S7 · gli errori tipici si possono fare e danno l'esito previsto */
  for (const m of lv.mistakes || []) {
    const r = RULES.replay(lv, m.w);
    r.errors.forEach(e => add(lv, "S7", `errore tipico «${m.name}» impossibile da fare nel gioco: ${e}`));
    const c = collaudo(lv, RULES.toWires(lv, m.w));
    if (c.outcome !== m.expect) add(lv, "S7", `errore tipico «${m.name}»: atteso «${m.expect}», esce «${c.outcome}»`);
  }

  /* S8 · requisiti ricavati dalla tavola */
  ["circuito", "corto", "colori"].forEach(t => need.add(t));
  if (comps.some(c => c.kind === "presa" || (c.kind === "lampada" && c.classe1))) need.add("terra");
  if (comps.some(c => c.kind === "lampada" && c.classe1)) need.add("classe1");
  if (comps.some(c => c.kind === "morsetto")) need.add("morsetto-leva");
  const slotUse: Record<string, string[]> = {};
  lv.solution.forEach(([a, bb]) =>
    [a, bb].forEach(t => {
      const c = RULES.compOf(lv, t);
      if (c.kind === "morsetto") (slotUse[c.id] = slotUse[c.id] || []).push(a.endsWith(".x") ? "capo" : "filo");
    }),
  );
  if (Object.values(slotUse).some(u => u.length === 1 && u[0] === "capo")) need.add("filo-non-usato");
  if (lv.palette) {
    need.add("blu-solo-neutro");
    need.add("gv-solo-terra");
  }
  if (lv.minSec) need.add("sezione");
  if ((lv.minSec || 0) >= 2.5) need.add("sezione-linea");
  if (lv.palette && lv.solution.some(([a, bb]) => !a.endsWith(".x") && (a.endsWith(".PE") || bb.endsWith(".PE")))) need.add("sezione-terra");
  if (comps.some(c => c.kind === "interruttore" && !c.locked)) need.add("interruttore-fase");
  if (comps.some(c => c.kind === "deviatore")) {
    need.add("deviatore");
    if (lv.palette) need.add("scambi-colore");
  }
  if (comps.some(c => c.kind === "invertitore")) need.add("invertitore-coppie");
  if (comps.some(c => c.kind === "interruttore" && c.locked)) need.add("ritorno");
  const fixedEnds = new Set((b.fixed || []).filter(x => x.vis).map(x => x.b));
  if (lv.solution.some(([a, bb]) => fixedEnds.has(a) || fixedEnds.has(bb))) need.add("morsetti-due-fili");
  if (lv.safety.type === "quadro") need.add("procedura");
  if (lv.trap === "etichette") need.add("etichette");

  /* S10 · istruzioni coerenti con cosa si può fare */
  const newWires = lv.solution.filter(([a]) => !a.endsWith(".x")).length;
  if (!lv.palette && newWires) add(lv, "S10", "la soluzione ha fili nuovi ma il livello non permette di tirarli");
  if (lv.palette && !newWires) add(lv, "S10", "il livello permette fili nuovi ma la soluzione non ne usa", "avviso");
  /* S11 · aiuti */
  if ((lv.hints || []).length < 2) add(lv, "S11", "servono almeno due suggerimenti");
}
