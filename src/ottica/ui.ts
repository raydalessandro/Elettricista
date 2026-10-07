/* ====== INTERFACCIA DEL CORSO DI OTTICA ======
   Come nel gioco dell'elettricista: le schermate sono stringhe HTML, i tocchi passano da un solo ascoltatore.
   La prova lenti si aggiorna sul posto mentre il dito trascina il cursore. mountOttica(app) la monta dentro un elemento. */
import { CARDS, CHAPTERS, LEVELS, PRONTUARIO } from "./content";
import { clearRange, diop, normAxis, PLANO, see, type Sight, sph, type SphCyl } from "./core/eye";
import { choiceText, dialogOutcome, dialogStars, type DlgState, KIND_LABEL, type LogItem, newDialog, say as sayChoice } from "./core/banco";
import { cellWhy, fill, GUARDA, type Guardo, isLensProva, lensAt, type Occhiale, OCCHIALI, occhialeLens, occhialeWords, sights, solutions, solved, startValue, values, verdict, withVariant, type ProvaLenti } from "./core/prova";
import type { Bet, Card, Customer, Dialog, LabId, Level, Prova, ProvaRicetta, QuizQ, Ricetta, RxCell, SceneId, Variant } from "./core/types";
import { eyeSVG, focusWords, type Gaze, HERO, progressiveSVG, ricettaHTML, sceneSVG, sharpWords, taboSVG, workWords } from "./draw";

type Dict = Record<string, unknown>;
interface QuizState { items: { q: QuizQ; order: number[]; from: string; review?: boolean }[]; i: number; ans: number | null; score: number }
interface Run {
  card: number;
  /** la variante del caso pescata per questa partita (−1: nessuna) */
  vi: number;
  betOrder: number[]; bet: number | null;
  v: number; view: number; confirms: number; firstOk: boolean | null; ok: boolean; msg: { ok: boolean; t: string } | null; hint: number;
  rt: { i: number; marks: Partial<Record<RxCell, "ok" | "bad">>; wrong: number; last: { ok: boolean; t: string } | null; pick: Occhiale | null; look: Guardo };
  dq: string[]; di: number; dlg: Record<string, DlgState>;
  quiz: QuizState | null;
  stars: boolean[] | null;
}
interface State { screen: "home" | "level" | "quaderno"; lv: string | null; step: string | null; run: Run | null; qtab: string; confirmReset: boolean }
interface Prog { v: 1; done: Record<string, { stars: boolean[] }>; cards: string[]; bets: { won: number; tot: number }; free: boolean }

export function mountOttica(app: HTMLElement | null, opts: { home?: string } = {}) {
  if (!app || app.dataset.mounted) return;
  app.dataset.mounted = "1";
  const root: HTMLElement = app;
  const HOME = opts.home || "";

  /* ---------- utilità ---------- */
  const LV: Record<string, Level> = {};
  LEVELS.forEach(l => { LV[l.id] = l; });
  /* il numero e la sua unità non vanno a capo: «40 cm», «24 anni» */
  const esc = (s: unknown) => String(s ?? "").replace(/(\d) (cm|m|anni|gradi)\b/g, "$1 $2").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const md = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const RM = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const shuffle = <T,>(a: T[]): T[] => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const range = (n: number) => Array.from({ length: n }, (_, i) => i);
  const cm = (m: number) => (!Number.isFinite(m) ? "lontano" : m < 1 ? `${Math.round(m * 100)} cm` : `${(Math.round(m * 10) / 10).toLocaleString("it-IT")} m`);

  const ICON = {
    back: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 4.5h9.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  };

  /* ---------- progressi (solo su questo dispositivo) ---------- */
  const KEY = "sfera-cilindro-asse.v1";
  const freshProg = (): Prog => ({ v: 1, done: {}, cards: [], bets: { won: 0, tot: 0 }, free: false });
  let prog = freshProg();
  try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.v === 1) prog = Object.assign(freshProg(), s); } catch { /* niente memoria: si gioca lo stesso */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch { /* ignora */ } };
  const unlockCard = (id: string) => { if (!prog.cards.includes(id)) { prog.cards.push(id); save(); } };

  /* ---------- stato ---------- */
  let S: State = { screen: "home", lv: null, step: null, run: null, qtab: "schede", confirmReset: false };
  const lvCur = () => LV[S.lv!];
  const R = () => S.run!;

  /* ---------- varianti: a ogni partita il cliente ha la sua ricetta ---------- */
  const lastVi: Record<string, number> = {};
  function pickVariant(lv: Level): number {
    const p = lv.prova;
    if (!p || p.type === "ricetta" || !p.variants || !p.variants.length) return -1;
    const n = p.variants.length;
    let i = Math.floor(Math.random() * n);
    if (n > 1 && i === lastVi[lv.id]) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
    lastVi[lv.id] = i;
    return i;
  }
  const variantAt = (lv: Level, vi: number): Variant | undefined => { const p = lv.prova; return p && p.type !== "ricetta" && p.variants && vi >= 0 ? p.variants[vi] : undefined; };
  const variantOf = (lv: Level) => (S.run ? variantAt(lv, S.run.vi) : undefined);
  /** la prova di questa partita, con l'occhio (e la lente) della variante */
  const provaOf = (lv: Level): Prova | undefined => (lv.prova ? withVariant(lv.prova, variantOf(lv)) : undefined);
  /** completa i {numeri} della variante */
  const F = (t: string) => (S.lv ? fill(t, variantOf(lvCur())?.vars) : t);
  const custOf = (lv: Level): Customer => { const v = variantOf(lv); return v ? { ...lv.customer, age: v.eye.age } : lv.customer; };
  const firstOfCap = (l: Level) => LEVELS.find(x => x.cap === l.cap)!;
  const unlocked = (l: Level) => prog.free || firstOfCap(l) === l || !!prog.done[LEVELS[l.n - 2].id];
  const lvNum = (l: Level) => (l.cap === 1 ? String(l.n) : `${l.cap}.${LEVELS.filter(x => x.cap === l.cap).indexOf(l) + 1}`);
  const nextLevel = () => LEVELS.find(l => !prog.done[l.id]) || null;

  const stepsOf = (lv: Level) => (lv.prova ? ["cliente", "teoria", "prova", "banco", "domande", "esito"] : ["cliente", "teoria", "banco", "domande", "esito"]);
  const GROUP: Record<string, string> = { cliente: "Cliente", teoria: "Teoria", prova: "Prova", banco: "Banco", domande: "Domande", esito: "Domande" };

  function newRun(lv: Level): Run {
    const vi = pickVariant(lv);
    const p = lv.prova ? withVariant(lv.prova, variantAt(lv, vi)) : undefined;
    const dq = lv.pick ? shuffle(lv.dialogs.map(d => d.id)).slice(0, lv.pick) : lv.dialogs.map(d => d.id);
    return {
      card: 0, vi,
      betOrder: p && "bet" in p ? shuffle(range(p.bet.o.length)) : [], bet: null,
      v: isLensProva(p) ? startValue(p) : 0, view: 0, confirms: 0, firstOk: null, ok: false, msg: null, hint: -1,
      rt: { i: 0, marks: {}, wrong: 0, last: null, pick: null, look: "strada" },
      dq, di: 0, dlg: {},
      quiz: null, stars: null,
    };
  }
  function openLevel(id: string) { S.screen = "level"; S.lv = id; S.step = "cliente"; S.run = newRun(LV[id]); render(true); }
  function goStep(step: string) { S.step = step; render(true); }
  function nextStep() { const st = stepsOf(lvCur()); const i = st.indexOf(S.step!); if (i < st.length - 1) goStep(st[i + 1]); }

  /* ---------- pezzi comuni ---------- */
  function vHeader() {
    if (S.screen === "home") return "";
    const lv = S.lv ? lvCur() : null;
    const inLevel = S.screen === "level";
    const title = S.screen === "quaderno" ? "Quaderno" : `${lvNum(lv!)} · ${lv!.title}`;
    const back = S.screen === "quaderno" && S.lv ? `<button class="btn-q icon" data-act="backLevel" aria-label="Torna al livello">${ICON.back}</button>` : `<button class="btn-q icon" data-act="home" aria-label="Torna alla mappa">${ICON.back}</button>`;
    return `<header class="bar"><div class="bar-in">${back}<span class="bar-t">${esc(title)}</span>${inLevel ? `<button class="btn-q icon" data-act="quaderno" aria-label="Apri il quaderno">${ICON.book}</button>` : `<span style="width:44px"></span>`}</div>${inLevel ? vSteps(lv!) : ""}</header>`;
  }
  function vSteps(lv: Level) {
    const groups = [...new Set(stepsOf(lv).map(s => GROUP[s]))];
    const ci = groups.indexOf(GROUP[S.step!]);
    return `<ol class="steps" aria-label="Fasi del livello">${groups.map((g, i) => `<li class="st${i < ci ? " done" : i === ci ? " cur" : ""}"${i === ci ? ' aria-current="step"' : ""}><span class="b"></span><span class="l${i === ci ? "" : " vh"}">${g}</span></li>`).join("")}</ol>`;
  }
  const whoLine = (c: { name: string; age: number; job: string }) => (c.age ? `${c.name}, ${c.age} anni · ${c.job}` : `${c.name} · ${c.job}`);

  /* ---------- casa ---------- */
  function vHome() {
    const stars = LEVELS.reduce((s, l) => s + (prog.done[l.id] ? prog.done[l.id].stars.filter(Boolean).length : 0), 0);
    const latest = CHAPTERS[CHAPTERS.length - 1];
    const nx = LEVELS.find(l => l.cap === latest.n && !prog.done[l.id]) || nextLevel();
    const started = nx && Object.keys(prog.done).some(id => LV[id] && LV[id].cap === nx.cap);
    return `${HOME ? `<a class="btn-q all-courses" href="${esc(HOME)}">${ICON.back} Tutti i corsi</a>` : ""}<section class="hero"><h1 class="vh">Sfera Cilindro Asse</h1>${HERO}
      <p class="lede">Il mestiere dell'ottico, un capitolo alla settimana, per chi con i clienti ci sa già fare. Come vede l'occhio, cosa fanno le lenti, e i casi veri al banco.</p>
      <div class="stats"><span class="stat"><b>${stars}</b>/${LEVELS.length * 3} stelle</span><span class="stat"><b>${prog.cards.length}</b> schede</span><span class="stat"><b>${prog.bets.won}</b>/${prog.bets.tot} scommesse vinte</span></div>
      <div class="row">${nx ? `<button class="btn btn-p" data-act="open" data-arg="${nx.id}">${started ? "Continua" : "Comincia"}: ${lvNum(nx)} · ${esc(nx.title)}</button>` : `<button class="btn btn-p" data-act="quaderno">Tutto fatto: apri il quaderno</button>`}<button class="btn btn-s" data-act="quaderno">${ICON.book} Quaderno</button></div>
    </section>
    <details class="how card"><summary>Come si gioca</summary>
      <ol class="olist">
        <li><strong>Il cliente</strong> entra e ti dice cosa gli succede.</li>
        <li><strong>La teoria</strong>: poche schede, con l'occhio e le lenti da toccare.</li>
        <li><strong>L'occhiale di prova</strong>: prima scommetti su cosa serve, poi provi le lenti e guardi come vede il cliente. È una simulazione semplificata, per capire cosa fa la lente. A ogni partita il cliente ha la sua ricetta.</li>
        <li><strong>Il banco</strong>: vendere lo sai già. Tutte le risposte sono dette bene; conta l'ottica: le domande tecniche, la spiegazione esatta, la soluzione giusta. La titolare commenta ogni risposta.</li>
        <li><strong>Le domande dal laboratorio</strong>: tre domande per ripassare; una può tornare su un livello vecchio.</li>
      </ol>
      <p class="muted">Ogni livello vale tre stelle: la prova e il banco. Le schede finiscono nel quaderno, insieme al prontuario e al lessico.</p>
    </details>
    ${CHAPTERS.slice().reverse().map(vChapter).join("")}
    <p class="fine">È un gioco di formazione, con casi semplificati. In negozio si impara a fare tutto, tranne una cosa: la visita medica. Quando serve, si manda dall'oculista.</p>
    ${S.confirmReset ? `<div class="card confirm"><p><strong>Azzerare tutto?</strong> Cancelli stelle, schede e scommesse di questo corso, su questo dispositivo.</p><div class="row"><button class="btn btn-s danger" data-act="resetYes">Azzera</button><button class="btn btn-s" data-act="resetNo">Annulla</button></div></div>` : ""}
    <div class="row"><button class="btn-q" data-act="free" aria-pressed="${prog.free}">${prog.free ? "Ordine libero attivo: tocca per tornare in ordine" : "Sblocca tutti i livelli"}</button><button class="btn-q" data-act="resetAsk">Azzera i progressi</button></div>`;
  }
  function vLvRow(l: Level) {
    const ok = unlocked(l), d = prog.done[l.id];
    const st = d ? d.stars : [false, false, false];
    return `<button class="lv${ok ? "" : " locked"}${d ? " done" : ""}" data-act="${ok ? "open" : "locked"}" data-arg="${l.id}">
      <span class="lv-n">${lvNum(l)}</span><span class="lv-t"><b>${esc(l.title)}</b><small>${esc(l.short)}</small></span>
      <span class="lv-s" aria-label="${ok ? st.filter(Boolean).length + " stelle su 3" : "bloccato"}">${ok ? st.map(s => `<i class="${s ? "on" : ""}"></i>`).join("") : ICON.lock}</span></button>`;
  }
  function vChapter(ch: (typeof CHAPTERS)[number]) {
    const lvs = LEVELS.filter(l => l.cap === ch.n);
    const done = lvs.filter(l => prog.done[l.id]).length;
    const date = new Date(ch.date + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long" });
    return `<section class="cap" aria-labelledby="cap-${ch.n}"><div class="cap-h"><p class="eyebrow">Capitolo ${ch.n} · dal ${esc(date)} · ${done}/${lvs.length}</p><h2 class="h2" id="cap-${ch.n}">${esc(ch.title)}</h2><p class="muted">${esc(ch.short)}</p></div>
      <div class="lvs">${lvs.map(vLvRow).join("")}</div></section>`;
  }

  /* ---------- cliente e teoria ---------- */
  function vCliente(lv: Level) {
    const c = custOf(lv);
    // la giornata in negozio non è un cliente: è la scena
    const intro = lv.pick
      ? `<div class="card"><p class="eyebrow">${esc(c.name)} · ${esc(c.job)}</p><p>${esc(F(c.msg))}</p></div>`
      : `<div class="msg"><span class="msg-who">${esc(whoLine(c))}</span><p>${esc(F(c.msg))}</p></div>`;
    return `<p class="eyebrow">Livello ${lvNum(lv)} · ${esc(CHAPTERS.find(x => x.n === lv.cap)!.title)}</p><h1 class="h1">${esc(lv.title)}</h1>
      ${intro}
      <div class="card"><h2 class="h3">Cosa impari</h2><ul class="list">${lv.learn.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="row"><button class="btn btn-p" data-act="next">Prima: la teoria</button></div>`;
  }
  function vCard(c: Card) {
    return `<article class="card tcard">${c.t ? `<h2 class="h2">${esc(c.t)}</h2>` : ""}
      ${(c.p || []).map(x => `<p>${md(x)}</p>`).join("")}
      ${c.ol ? `<ol class="olist">${c.ol.map(x => `<li>${md(x)}</li>`).join("")}</ol>` : ""}
      ${(c.after || []).map(x => `<p>${md(x)}</p>`).join("")}
      ${c.lab ? `<div class="lab" data-lab="${c.lab}"></div>` : ""}
      ${c.g ? `<table class="gergo"><thead><tr><th>Tecnico</th><th>In negozio</th></tr></thead><tbody>${c.g.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table>` : ""}
      ${c.tutor ? `<div class="capo"><span class="eyebrow">La titolare dice</span><p>${esc(c.tutor)}</p></div>` : ""}</article>`;
  }
  function vTeoria(lv: Level) {
    const i = R().card, id = lv.cards[i];
    unlockCard(id);
    const last = i === lv.cards.length - 1;
    const go = lv.prova ? (lv.prova.type === "ricetta" ? "Alla ricetta" : "Alla prova lenti") : "Al banco";
    return `<p class="eyebrow">Teoria · scheda ${i + 1} di ${lv.cards.length}</p>${vCard(CARDS[id])}
      <div class="row">${i > 0 ? `<button class="btn btn-s" data-act="cardPrev">Indietro</button>` : ""}${last ? `<button class="btn btn-p" data-act="next">${go}</button>` : `<button class="btn btn-p" data-act="cardNext">Avanti</button>`}</div>`;
  }

  /* ---------- prova lenti ---------- */
  function readout(s: Sight, o: { work?: boolean } = {}) {
    return `<div class="readout"><span class="pill s-${s.sharp}">${esc(sharpWords(s))} · circa ${String(s.decimi).replace(".", ",")}/10</span>${o.work === false ? "" : `<span class="pill w-${s.work}">cristallino: ${esc(workWords(s))}</span>`}</div>`;
  }
  /** righello in centimetri: la zona nitida (verde) e dove sta quello che si guarda */
  function ruler(near: number, far: number, marks: { d: number; t: string; cls?: string }[], label: string) {
    const X = (m: number) => 14 + Math.min(1, m) * 292;
    const x1 = X(near), x2 = X(Number.isFinite(far) ? far : 1.1), w = Math.max(2, Math.min(306, x2) - x1);
    const zx = Math.min(Math.max(x1 + w / 2, 40), 280);
    return `<svg class="ruler" viewBox="0 0 320 70" role="img" aria-label="${esc(label)}">
      <line class="rl" x1="14" y1="30" x2="306" y2="30"/>${[0, 0.25, 0.5, 0.75, 1].map(m => `<line class="rl" x1="${X(m)}" y1="25" x2="${X(m)}" y2="35"/><text class="tl" x="${X(m)}" y="50" text-anchor="middle">${m === 0 ? "0" : m === 1 ? "1 m" : Math.round(m * 100) + " cm"}</text>`).join("")}
      ${near < 1 ? `<rect class="rz" x="${x1.toFixed(1)}" y="22" width="${w.toFixed(1)}" height="16" rx="4"/><text class="tl rzt" x="${zx.toFixed(1)}" y="66" text-anchor="middle">zona nitida${Number.isFinite(far) && far <= 1 ? "" : " →"}</text>` : `<text class="tl rzt" x="160" y="66" text-anchor="middle">zona nitida: oltre 1 m</text>`}
      ${marks.map(k => `<path class="${k.cls || "rp"}" d="M${X(k.d).toFixed(1)},18 l-6,-9 h12 z"/><text class="tl" x="${(X(k.d) + 9).toFixed(1)}" y="15">${esc(k.t)}</text>`).join("")}</svg>`;
  }
  function simViews(p: ProvaLenti) {
    const r = R(), w = p.views[r.view], l = lensAt(p, r.v), s = see(p.eye, l, w.d);
    let extra = "";
    if (p.type === "asse") extra = taboSVG(r.v, { label: "La lente di prova vista da davanti", noVal: true });
    else extra = eyeSVG({ s, lens: Math.abs(l.sph) < 1e-9 ? null : l.sph, dist: w.d });
    const rangeRow = p.type === "vicino" && r.view === 0 ? (() => { const cr = clearRange(p.eye, l); return `<div class="rrow"><span class="muted">Zona nitida con questa lente: <b>da ${esc(cm(cr.near))} a ${esc(cm(cr.far))}</b></span>${ruler(cr.near, cr.far, [{ d: p.dist, t: "telefono" }], `Zona nitida da ${cm(cr.near)} a ${cm(cr.far)}`)}</div>`; })() : "";
    return `${sceneSVG(w.scene, s, `${w.label}, come la vede ${custOf(lvCur()).name}`)}${readout(s, { work: p.type !== "asse" })}<p class="focusw">${esc(focusWords(s, w.scene))}</p>${rangeRow}${extra}`;
  }
  const lensLabel = (p: ProvaLenti, v: number) => (p.type === "vicino" ? `ADD ${diop(v)}` : Math.abs(v) < 1e-9 ? "nessuna lente" : diop(v));
  function lensCtl(p: ProvaLenti) {
    const r = R(), vs = values(p);
    if (p.type === "asse") {
      return `<div class="lensctl"><button class="btn btn-s stp" data-act="vDown" aria-label="Gira di ${p.step} gradi in un senso">−${p.step}°</button><output class="lensval" id="lensval" aria-live="polite">asse ${normAxis(r.v)}°</output><button class="btn btn-s stp" data-act="vUp" aria-label="Gira di ${p.step} gradi nell'altro senso">+${p.step}°</button></div>
        <input type="range" id="lensr" data-in="lens" min="${vs[0]}" max="${vs[vs.length - 1]}" step="${p.step}" value="${r.v}" aria-label="Asse della lente di prova, in gradi">`;
    }
    return `<div class="lensctl"><button class="btn btn-s stp" data-act="vDown" aria-label="Un quarto di diottria in meno">−0,25</button><output class="lensval" id="lensval" aria-live="polite">${esc(lensLabel(p, r.v))}</output><button class="btn btn-s stp" data-act="vUp" aria-label="Un quarto di diottria in più">+0,25</button></div>
      <input type="range" id="lensr" data-in="lens" min="${p.min}" max="${p.max}" step="0.25" value="${r.v}" aria-label="Potenza della lente di prova, in diottrie">
      <div class="row ends"><span class="muted">${diop(p.min)}</span><span class="muted">${diop(p.max)}</span></div>`;
  }
  function vBet(b: Bet) {
    const r = R();
    if (r.bet == null) {
      return `<div class="card"><h2 class="h3">Prima, scommetti</h2><p>${esc(F(b.q))}</p><div class="opts">${r.betOrder.map(i => `<button class="opt" data-act="bet" data-arg="${i}">${esc(F(b.o[i]))}</button>`).join("")}</div></div>`;
    }
    const won = r.bet === b.ok;
    return `<p class="bet ${won ? "won" : "lost"}">${won ? "Scommessa vinta" : "Scommessa persa"}: ${esc(F(b.o[r.bet]))}.</p><p class="muted">${esc(F(b.why))}</p>`;
  }
  function vProva(lv: Level) {
    const p = provaOf(lv)!;
    if (p.type === "ricetta") return vRicetta(lv, p);
    const r = R(), c = custOf(lv);
    const head = `<p class="eyebrow">Prova lenti · ${esc(c.name)}, ${c.age} anni</p><h1 class="h1">${p.type === "asse" ? "Gira il cilindro" : p.type === "vicino" ? "La lente per leggere" : "Metti a fuoco"}</h1>
      <p class="muted">L'occhiale di prova: metti le lenti e guardi come vede il cliente. È una simulazione semplificata, per capire cosa fa la lente.</p>`;
    if (r.bet == null) return head + vBet(p.bet);
    const hint = r.hint >= 0 ? `<div class="capo"><span class="eyebrow">Aiuto ${r.hint + 1} di ${p.hints.length}</span><p>${esc(F(p.hints[r.hint]))}</p></div>` : "";
    return `${head}${vBet(p.bet)}
      <p class="goal"><strong>Adesso:</strong> ${esc(F(p.goal))}</p>
      <section class="card sim" aria-label="Occhiale di prova">
        ${p.views.length > 1 ? `<div class="seg views" role="group" aria-label="Cosa guarda">${p.views.map((w, i) => `<button data-act="view" data-arg="${i}" aria-pressed="${r.view === i}">${esc(w.label)}</button>`).join("")}</div>` : ""}
        <div id="simv">${simViews(p)}</div>
        ${lensCtl(p)}
      </section>
      <div class="row"><button class="btn btn-p" data-act="confirm">${p.type === "asse" ? "Questo è l'asse giusto" : "Questa è la lente giusta"}</button><button class="btn btn-s" data-act="hint">Aiuto</button></div>
      ${r.msg ? `<div class="res ${r.msg.ok ? "ok" : "warn"}" id="verdict" role="status"><h2>${r.msg.ok ? "Giusto" : "Non ancora"}</h2><p>${esc(r.msg.t)}</p></div>` : ""}
      ${hint}
      <div class="row"><button class="btn ${r.ok ? "btn-p" : "btn-s"}" data-act="next">${r.ok ? "Al banco" : "Vai al banco lo stesso"}</button></div>
      ${r.ok ? "" : `<p class="fine">La stella «${esc(lv.stars[0])}» la prendi con la scommessa giusta e ${p.type === "asse" ? "l'asse giusto" : "la lente giusta"} alla prima conferma.</p>`}`;
  }
  /** aggiorna solo la vista della prova (il cursore resta sotto il dito) */
  function updSim() {
    const lv = lvCur(), p = provaOf(lv);
    if (!isLensProva(p)) return;
    const el = root.querySelector("#simv"), out = root.querySelector("#lensval"), rg = root.querySelector<HTMLInputElement>("#lensr");
    if (el) el.innerHTML = simViews(p);
    if (out) out.textContent = p.type === "asse" ? `asse ${normAxis(R().v)}°` : lensLabel(p, R().v);
    if (rg && +rg.value !== R().v) rg.value = String(R().v);
  }

  /* la ricetta */

  function vRicetta(lv: Level, p: ProvaRicetta) {
    const r = R(), t = r.rt, done = t.i >= p.tasks.length, c = lv.customer;
    const hint = r.hint >= 0 ? `<div class="capo"><span class="eyebrow">Aiuto ${r.hint + 1} di ${p.hints.length}</span><p>${esc(p.hints[r.hint])}</p></div>` : "";
    let part2 = "";
    if (done) {
      const eye = { rx: p.ricetta.od, age: p.age }, add = p.ricetta.add || 0;
      const seen = (k: Occhiale, g: (typeof GUARDA)[number]) => see(eye, occhialeLens(p.ricetta.od, add, k, g.d), g.d);
      let view = "";
      if (t.pick) {
        const g = GUARDA.find(x => x.k === t.look)!, s = seen(t.pick, g);
        const part = t.pick === "progressive" ? (g.k === "strada" ? " · dalla parte alta" : g.k === "pc" ? " · dal centro" : " · dalla parte bassa") : "";
        view = `<div class="seg views" role="group" aria-label="Cosa guarda">${GUARDA.map(x => `<button data-act="rxLook" data-arg="${x.k}" aria-pressed="${t.look === x.k}">${esc(x.label)}</button>`).join("")}</div>
          ${sceneSVG(g.scene, s, `${g.label}, come la vede ${c.name}${part}`)}${readout(s)}
          <ul class="chips" aria-label="Con questo occhiale">${GUARDA.map(x => { const sx = seen(t.pick!, x); return `<li class="pill s-${sx.sharp}">${esc(x.short)}: ${esc(sharpWords(sx))}</li>`; }).join("")}</ul>
          <p>${esc(occhialeWords(t.pick, p.age))}</p>`;
      }
      part2 = `<section class="card"><h2 class="h3">Che occhiale fare?</h2><p class="muted">Stessa ricetta, quattro occhiali diversi. Guarda con l'occhio destro di ${esc(c.name)}, ${p.age} anni.</p>
        <div class="seg views grid2" role="group" aria-label="Tipo di occhiale">${OCCHIALI.map(([k, n]) => `<button data-act="rxPick" data-arg="${k}" aria-pressed="${t.pick === k}">${esc(n)}</button>`).join("")}</div>
        ${view}
        <p class="muted">La ricetta dice la forza; il tipo di occhiale lo decide l'uso. Ne parli con ${esc(c.name)} al banco.</p></section>`;
    }
    return `<p class="eyebrow">Prova · la ricetta di ${esc(c.name)}</p><h1 class="h1">Leggi la ricetta</h1><p>${esc(p.goal)}</p>
      ${ricettaHTML(p.ricetta, { act: done ? "rxInfo" : "cell", mark: t.marks })}
      <div class="card task" id="task">${done ? `<p class="bet ${t.wrong ? "lost" : "won"}">Ricetta letta${t.wrong ? `, con ${t.wrong} ${t.wrong === 1 ? "tocco sbagliato" : "tocchi sbagliati"}` : " senza errori"}.</p>` : `<p class="eyebrow">Domanda ${t.i + 1} di ${p.tasks.length}</p><p class="q">${esc(p.tasks[t.i].q)}</p>`}
        ${t.last ? `<p class="${t.last.ok ? "ok-txt" : "warn-txt"}">${esc(t.last.t)}</p>` : ""}</div>
      ${done ? "" : `<div class="row"><button class="btn btn-s" data-act="hint">Aiuto</button></div>${hint}`}
      ${part2}
      <div class="row"><button class="btn ${done ? "btn-p" : "btn-s"}" data-act="next">${done ? "Al banco" : "Vai al banco lo stesso"}</button></div>
      ${done ? "" : `<p class="fine">La stella «${esc(lv.stars[0])}» la prendi con tutti i numeri giusti al primo tocco.</p>`}`;
  }

  /* ---------- il banco: dialogo ---------- */
  const DLG: Record<string, Dialog> = {};
  LEVELS.forEach(l => l.dialogs.forEach(d => { DLG[d.id] = d; }));
  /** il cliente del livello ha l'età della variante; gli altri restano come sono scritti */
  function whoOf(d: Dialog): Customer {
    const lv = lvCur();
    return !lv.pick && d === lv.dialogs[0] ? { ...d.who, age: custOf(lv).age } : d.who;
  }
  function dlgState(id: string): DlgState {
    const r = R(), lv = lvCur();
    if (!r.dlg[id]) r.dlg[id] = newDialog(DLG[id], n => shuffle(range(n)), lv.pick ? undefined : variantOf(lv)?.vars);
    return r.dlg[id];
  }
  function vLog(it: LogItem, i: number, last: number) {
    const id = i === last ? ' id="lastsay"' : "";
    if (it.k === "c") return `<div class="say c"${id}><span class="who">${esc(it.who)}</span><p>${esc(it.text)}</p></div>`;
    if (it.k === "t") return `<div class="say t"${id}><span class="who">Tu</span><p>${esc(it.text)}</p></div>`;
    if (it.k === "n") return `<p class="say n"${id}>${esc(it.text)}</p>`;
    if (it.k === "rx") return `<div${id}>${ricettaHTML(it.rx!)}</div>`;
    const cls = it.ok === "best" ? "good" : it.ok === "ok" ? "fair" : it.ok === "grave" ? "grave" : "bad";
    const lab = KIND_LABEL[it.ok || "no"];
    return `<div class="coach ${cls}"${id}><span class="eyebrow">La titolare dice · ${lab}</span><p>${esc(it.text)}</p></div>`;
  }
  function vBanco() {
    const r = R(), lv = lvCur(), id = r.dq[r.di], d = DLG[id], st = dlgState(id);
    const multi = r.dq.length > 1;
    const lastT = st.log.map(x => x.k).lastIndexOf("t");
    const head = `<p class="eyebrow">Al banco${multi ? ` · cliente ${r.di + 1} di ${r.dq.length}` : ""}</p><h1 class="h2">${esc(whoLine(whoOf(d)))}</h1>`;
    const chat = `<div class="chat" aria-live="polite">${st.log.map((it, i) => vLog(it, i, lastT)).join("")}</div>`;
    if (st.done) {
      const more = r.di < r.dq.length - 1, oc = dialogOutcome(st);
      return `${head}${chat}<p class="say n end">${esc(st.end)}</p>
        <div class="res ${st.wrong || st.fair ? "warn" : "ok"}"><h2>${esc(oc.title)}</h2><p>${esc(oc.text)}</p></div>
        <div class="row"><button class="btn btn-p" data-act="${more ? "nextClient" : "next"}">${more ? "Prossimo cliente" : "Domande dal laboratorio"}</button></div>`;
    }
    const rule = lv.pick ? "Una stella per ogni cliente servito senza risposte sbagliate." : `Stelle: «${lv.stars[1]}» se domande tecniche e spiegazioni sono giuste al primo colpo; «${lv.stars[2]}» se la soluzione è giusta al primo colpo, senza errori gravi.`;
    return `${head}${chat}
      <p class="eyebrow">Cosa dici?</p><div class="opts choices" id="choices" role="group" aria-label="Cosa dici">${st.order[st.step].map(ci => { const tried = st.tried.includes(ci); return `<button class="opt${tried ? " bad" : ""}" data-act="say" data-arg="${ci}"${tried ? " disabled" : ""}>${esc(choiceText(d, st, ci))}</button>`; }).join("")}</div>
      <p class="fine">${esc(rule)}</p>`;
  }
  function choose(ci: number) {
    const r = R(), id = r.dq[r.di];
    if (!sayChoice(DLG[id], dlgState(id), ci)) return;
    render();
    const el = root.querySelector("#lastsay");
    if (el) el.scrollIntoView({ block: "start", behavior: RM() ? "auto" : "smooth" });
  }

  /* ---------- domande dal laboratorio ---------- */
  function makeQuiz(lv: Level): QuizState {
    const cur: QuizState["items"] = shuffle(lv.quiz).map(q => ({ q, order: shuffle(range(q.o.length)), from: lvNum(lv) }));
    const prev = LEVELS.filter(l => l.n < lv.n && prog.done[l.id]);
    let items = cur.slice(0, 3);
    if (prev.length) {
      const pl = prev[Math.floor(Math.random() * prev.length)];
      const q = pl.quiz[Math.floor(Math.random() * pl.quiz.length)];
      items = [cur[0], cur[1], { q, order: shuffle(range(q.o.length)), from: lvNum(pl), review: true }];
    }
    return { items, i: 0, ans: null, score: 0 };
  }
  function vDomande(lv: Level) {
    const r = R();
    if (!r.quiz) r.quiz = makeQuiz(lv);
    const q = r.quiz, it = q.items[q.i], Q = it.q, answered = q.ans != null;
    return `<p class="eyebrow">Domande dal laboratorio · ${q.i + 1} di ${q.items.length}${it.review ? ` · ripasso dal livello ${it.from}` : ""}</p>${q.i === 0 ? `<p class="muted">Le domande non danno stelle: servono a ripassare.</p>` : ""}<h1 class="h2">${esc(Q.q)}</h1>
      <div class="opts">${it.order.map(i => { let cls = ""; if (answered) cls = i === Q.ok ? "good" : i === q.ans ? "bad" : ""; return `<button class="opt ${cls}" data-act="ans" data-arg="${i}"${answered ? " disabled" : ""}>${esc(Q.o[i])}</button>`; }).join("")}</div>
      ${answered ? `<div class="capo"><span class="eyebrow">${q.ans === Q.ok ? "Giusto" : "Non proprio"}</span><p>${esc(Q.why)}</p></div><div class="row"><button class="btn btn-p" data-act="qnext">${q.i < q.items.length - 1 ? "Prossima domanda" : "Vedi il risultato"}</button></div>` : ""}`;
  }

  /* ---------- esito ---------- */
  function computeStars(lv: Level): boolean[] {
    const r = R();
    if (lv.pick) return r.dq.map(id => dialogStars(r.dlg[id], DLG[id]).clean);
    const d = lv.dialogs[0], ds = dialogStars(r.dlg[d.id], d);
    let first = false;
    const p = lv.prova!;
    if (p.type === "ricetta") first = r.rt.i >= p.tasks.length && r.rt.wrong === 0;
    else first = r.bet === p.bet.ok && r.firstOk === true;
    return [first, ds.spiegazione, ds.soluzione];
  }
  function starWhy(lv: Level, st: boolean[]): string[] {
    const r = R();
    if (lv.pick) return r.dq.map((id, i) => { const s = r.dlg[id]; return st[i] ? `${DLG[id].who.name}: servito bene.` : !s || !s.done ? `${DLG[id].who.name}: non concluso.` : `${DLG[id].who.name}: ${s.wrong} ${s.wrong === 1 ? "risposta sbagliata" : "risposte sbagliate"}${s.grave ? ", con un errore grave" : ""}.`; });
    const p = lv.prova!, d = r.dlg[lv.dialogs[0].id];
    const what = p.type === "asse" ? "l'asse" : "la lente";
    const w0 = p.type === "ricetta"
      ? (st[0] ? "Tutti i numeri giusti al primo tocco." : r.rt.i < p.tasks.length ? "Ricetta non finita." : `${r.rt.wrong} ${r.rt.wrong === 1 ? "tocco sbagliato" : "tocchi sbagliati"}.`)
      : (st[0] ? `Scommessa giusta e ${what} giust${p.type === "asse" ? "o" : "a"} alla prima conferma.` : r.bet !== p.bet.ok ? "La scommessa era sbagliata." : r.firstOk == null ? `Non hai confermato ${what}.` : `${p.type === "asse" ? "Il primo asse confermato non era quello giusto." : "La prima lente confermata non era quella giusta."}`);
    return [
      w0,
      st[1] ? "Domande tecniche e spiegazioni giuste al primo colpo." : !d || !d.done ? "Dialogo non concluso." : d.step < DLG[d.id].steps.length ? "Il cliente se n'è andato prima della fine: mancano le ultime mosse." : "Non tutte le domande e le spiegazioni erano giuste al primo colpo.",
      st[2] ? "La soluzione giusta, senza errori gravi." : !d || !d.done ? "Dialogo non concluso." : d.grave ? "C'è stato un errore grave: rileggi i commenti della titolare." : "La soluzione non era la migliore al primo colpo.",
    ];
  }
  function vEsito(lv: Level) {
    const r = R();
    if (!r.stars) {
      r.stars = computeStars(lv);
      const old = prog.done[lv.id] ? prog.done[lv.id].stars : [false, false, false];
      prog.done[lv.id] = { stars: r.stars.map((s, i) => s || old[i]) };
      save();
    }
    const why = starWhy(lv, r.stars);
    const names = lv.pick ? r.dq.map((id, i) => `${lv.stars[i]}: ${DLG[id].who.name}`) : lv.stars;
    const nx = LEVELS[lv.n];
    const words = lv.cards.flatMap(id => CARDS[id].g || []);
    return `<p class="eyebrow">Livello ${lvNum(lv)} concluso</p><h1 class="h1">${esc(lv.title)}</h1>
      <div class="stars">${names.map((name, i) => `<div class="star${r.stars![i] ? " on" : ""}"><span class="dot" aria-hidden="true"></span><b>${esc(name)}</b><span>${esc(why[i])}</span><span class="vh">${r.stars![i] ? "stella presa" : "stella non presa"}</span></div>`).join("")}</div>
      ${r.quiz ? `<p class="muted">Domande dal laboratorio: ${r.quiz.score} giuste su ${r.quiz.items.length}.</p>` : ""}
      ${words.length ? `<section class="card"><h2 class="h3">Parole nuove</h2><table class="gergo"><thead><tr><th>Tecnico</th><th>In negozio</th></tr></thead><tbody>${words.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table></section>` : ""}
      <div class="row">${nx ? `<button class="btn btn-p" data-act="open" data-arg="${nx.id}">Prossimo: ${lvNum(nx)} · ${esc(nx.title)}</button>` : `<button class="btn btn-p" data-act="quaderno">Apri il quaderno</button>`}<button class="btn btn-s" data-act="retry">${lv.pick ? "Altri clienti" : "Rigioca"}</button><button class="btn btn-s" data-act="home">Mappa</button></div>`;
  }

  /* ---------- quaderno ---------- */
  function vQuaderno() {
    const tabs: [string, string][] = [["schede", "Schede"], ["prontuario", "Prontuario"], ["lessico", "Lessico"]];
    let body: string;
    if (S.qtab === "prontuario") {
      body = PRONTUARIO.map(p => `<section class="card"><h2 class="h3">${esc(p.t)}</h2>${p.note ? `<p class="muted">${esc(p.note)}</p>` : ""}<table class="ptab"><tbody>${p.rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table></section>`).join("");
    } else if (S.qtab === "lessico") {
      const have: [string, string][] = [], miss: [string, string][] = [];
      LEVELS.forEach(l => l.cards.forEach(id => (CARDS[id].g || []).forEach(g => (prog.cards.includes(id) ? have : miss).push(g))));
      body = `<section class="card"><p class="muted">A sinistra il termine tecnico, a destra come lo dice il cliente, o come lo dici tu al cliente.</p>${have.length ? `<table class="gergo"><thead><tr><th>Tecnico</th><th>In negozio</th></tr></thead><tbody>${have.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table>` : ""}${miss.length ? `<p class="locked-note">${miss.length} ${miss.length === 1 ? "parola arriva" : "parole arrivano"} con i livelli che non hai ancora giocato.</p>` : ""}</section>`;
    } else {
      body = LEVELS.map(l => {
        const have = l.cards.filter(id => prog.cards.includes(id));
        return `<section class="parte"><h2 class="eyebrow">${lvNum(l)} · ${esc(l.title)}</h2>${have.length ? have.map(id => `<details class="acc"><summary>${esc(CARDS[id].t)}</summary>${vCard({ ...CARDS[id], t: "" })}</details>`).join("") : `<p class="locked-note">Le schede arrivano quando giochi il livello.</p>`}</section>`;
      }).join("");
    }
    return `<h1 class="h1">Quaderno</h1><div class="tabs" role="group" aria-label="Sezioni del quaderno">${tabs.map(([k, t]) => `<button data-act="qtab" data-arg="${k}" aria-pressed="${S.qtab === k}">${t}</button>`).join("")}</div>${body}`;
  }

  function vMain() {
    if (S.screen === "home") return vHome();
    if (S.screen === "quaderno") return vQuaderno();
    const lv = lvCur();
    switch (S.step) {
      case "cliente": return vCliente(lv);
      case "teoria": return vTeoria(lv);
      case "prova": return vProva(lv);
      case "banco": return vBanco();
      case "domande": return vDomande(lv);
      case "esito": return vEsito(lv);
    }
    return "";
  }

  /* ---------- laboratori delle schede ----------
     Occhi e numeri diversi da quelli dei clienti: le schede insegnano, la prova non si copia. */
  const seg = (name: string, items: [string, string][], cur: string) => `<div class="seg views" role="group" aria-label="${esc(name)}">${items.map(([k, t]) => `<button data-x="${k}" aria-pressed="${cur === k}">${esc(t)}</button>`).join("")}</div>`;
  function bindSeg(el: HTMLElement, fn: (k: string) => void) { el.querySelectorAll<HTMLButtonElement>("[data-x]").forEach(b => { b.onclick = () => fn(b.dataset.x!); }); }
  function slider(id: string, label: string, min: number, max: number, step: number, val: number, ends: [string, string]) {
    return `<label class="muted" for="${id}">${esc(label)}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><div class="row ends"><span class="muted">${esc(ends[0])}</span><span class="muted">${esc(ends[1])}</span></div>`;
  }
  /** vista + occhio di lato + parole: il pezzo base dei laboratori */
  function looking(scene: SceneId, s: Sight, lens: number | null, dist: number, o: { labels?: boolean; work?: boolean; who?: string } = {}) {
    return `${sceneSVG(scene, s, `Come vede ${o.who || "il cliente"}`)}${readout(s, { work: o.work })}<p class="focusw">${esc(focusWords(s, scene))}</p>${eyeSVG({ s, lens, dist, labels: o.labels })}`;
  }
  /* gli occhi dei laboratori */
  const MIOPE = { rx: sph(-2.75), age: 24 };
  const IPER = { rx: sph(3), age: 33 };
  const CARLA = { rx: PLANO, age: 56 }, CARLA_ADD = 2.5;
  const ASTIG: { rx: SphCyl; age: number } = { rx: { sph: 0, cyl: -1.5, axis: 90 }, age: 35 };
  /** il punto più vicino nitido, arrotondato come lo si dice: a 5 cm */
  const near5 = (m: number) => (m >= 1 ? `${(Math.round(m * 10) / 10).toLocaleString("it-IT")} m` : `${Math.round((m * 100) / 5) * 5} cm`);
  const LABS: Record<LabId, (el: HTMLElement) => void> = {
    occhio(el) {
      let d = "far";
      const draw = () => {
        const dist = d === "far" ? Infinity : 0.4, s = see({ rx: PLANO, age: 24 }, PLANO, dist);
        el.innerHTML = `<p class="muted">Un occhio senza difetti, a 24 anni. Guarda lontano, poi il telefono.</p>${seg("Cosa guarda", [["far", "Lontano"], ["near", "Telefono, 40 cm"]], d)}
          <div class="lv-out">${looking(d === "far" ? "tabellone" : "telefono", s, null, dist, { labels: true })}</div>
          <p class="labout">${d === "far" ? "Da lontano i raggi arrivano paralleli: il fuoco cade sulla retina senza sforzo." : "Da vicino i raggi arrivano aperti: il cristallino si fa più tondo e il fuoco torna sulla retina."}</p>`;
        bindSeg(el, k => { d = k; draw(); });
      };
      draw();
    },
    miope(el) {
      let d = "far";
      const draw = () => {
        const dist = d === "far" ? Infinity : 0.3, s = see(MIOPE, PLANO, dist);
        el.innerHTML = `<p class="muted">Un occhio miope di esempio, senza occhiali. Il telefono lo tiene a 30 cm.</p>${seg("Cosa guarda", [["far", "Lontano"], ["near", "Telefono, 30 cm"]], d)}
          <div class="lv-out">${looking(d === "far" ? "tabellone" : "telefono", s, null, dist)}</div>
          <p class="labout">${d === "far" ? "Il fuoco cade davanti alla retina: sulla retina arriva una macchia." : "Da vicino i raggi aperti spostano il fuoco indietro, sulla retina: il telefono, tenuto vicino, si legge senza occhiali."}</p>`;
        bindSeg(el, k => { d = k; draw(); });
      };
      draw();
    },
    lente(el) {
      el.innerHTML = `<p class="muted">Lo stesso occhio miope, che guarda lontano. Metti una lente davanti.</p>${slider("lab-lente", "Lente in prova", -4, 1, 0.25, 0, ["−4,00", "+1,00"])}<output class="lensval" id="lab-lente-v"></output><div class="lv-out" id="lab-lente-o"></div><p class="labout" id="lab-lente-t"></p>`;
      const inp = el.querySelector<HTMLInputElement>("#lab-lente")!;
      const upd = () => {
        const v = +inp.value, s = see(MIOPE, sph(v), Infinity);
        el.querySelector("#lab-lente-v")!.textContent = v === 0 ? "nessuna lente" : diop(v);
        el.querySelector("#lab-lente-o")!.innerHTML = looking("tabellone", s, v === 0 ? null : v, Infinity);
        el.querySelector("#lab-lente-t")!.textContent = v === 0 ? "Senza lente il fuoco cade davanti alla retina. Prova a scendere col meno." : v > 0 ? "Col più il fuoco va ancora più avanti: peggio." : s.sharp === "nitido" ? (s.work === "riposo" ? "Il fuoco è sulla retina e il cristallino riposa: è la lente giusta." : "Nitido, ma il cristallino lavora per compensare il meno di troppo.") : "Il fuoco si sposta indietro, ma non abbastanza.";
      };
      inp.oninput = upd;
      upd();
    },
    iper(el) {
      let d = "far";
      const draw = () => {
        const dist = d === "far" ? Infinity : 0.6, s = see(IPER, PLANO, dist);
        el.innerHTML = `<p class="muted">Un occhio ipermetrope di esempio, 33 anni, senza occhiali.</p>${seg("Cosa guarda", [["far", "Lontano"], ["near", "Computer, 60 cm"]], d)}
          <div class="lv-out">${looking(d === "far" ? "strada" : "pc", s, null, dist)}</div>
          <p class="labout">${d === "far" ? "Nitido, ma il cristallino lavora anche da lontano: senza di lui il fuoco cadrebbe dietro la retina." : "Al computer deve lavorare ancora di più: è la fatica che la sera si sente."}</p>`;
        bindSeg(el, k => { d = k; draw(); });
      };
      draw();
    },
    piu(el) {
      let d = "far";
      el.innerHTML = `<p class="muted">Lo stesso occhio ipermetrope. Metti una lente davanti e guarda il cristallino.</p><div id="lab-piu-s"></div>${slider("lab-piu", "Lente in prova", -1, 4, 0.25, 0, ["−1,00", "+4,00"])}<output class="lensval" id="lab-piu-v"></output><div class="lv-out" id="lab-piu-o"></div><p class="labout" id="lab-piu-t"></p>`;
      const inp = el.querySelector<HTMLInputElement>("#lab-piu")!;
      const upd = () => {
        const v = +inp.value, dist = d === "far" ? Infinity : 0.6, s = see(IPER, sph(v), dist);
        const sf = see(IPER, sph(v), Infinity);
        el.querySelector("#lab-piu-s")!.innerHTML = seg("Cosa guarda", [["far", "Lontano"], ["near", "Computer, 60 cm"]], d);
        bindSeg(el.querySelector("#lab-piu-s") as HTMLElement, k => { d = k; upd(); });
        el.querySelector("#lab-piu-v")!.textContent = v === 0 ? "nessuna lente" : diop(v);
        el.querySelector("#lab-piu-o")!.innerHTML = looking(d === "far" ? "strada" : "pc", s, v === 0 ? null : v, dist);
        el.querySelector("#lab-piu-t")!.textContent = v === 0 ? "Senza lente il cristallino lavora sempre. Sali col più e guarda il cristallino." : v < 0 ? "Col meno il cristallino deve lavorare ancora di più." : sf.sharp !== "nitido" ? "Troppo più: da lontano il fuoco passa davanti alla retina e sfoca." : sf.work === "riposo" ? "Da lontano il cristallino riposa e tutto resta nitido: è la lente giusta." : "Il cristallino lavora meno: si può salire ancora.";
      };
      inp.oninput = upd;
      upd();
    },
    eta(el) {
      el.innerHTML = `${slider("lab-eta", "Età", 20, 70, 5, 45, ["20 anni", "70 anni"])}<output class="lensval" id="lab-eta-v"></output><div id="lab-eta-r"></div><div class="lv-out" id="lab-eta-o"></div><p class="labout" id="lab-eta-t"></p>`;
      const inp = el.querySelector<HTMLInputElement>("#lab-eta")!;
      const upd = () => {
        const age = +inp.value, s = see({ rx: PLANO, age }, PLANO, 0.35), np = 1 / s.amp;
        el.querySelector("#lab-eta-v")!.textContent = `${age} anni`;
        el.querySelector("#lab-eta-r")!.innerHTML = ruler(np, Infinity, [{ d: 0.35, t: "telefono" }, { d: 0.6, t: "braccio teso", cls: "ra" }], `A ${age} anni si vede nitido da ${near5(np)} in là`);
        el.querySelector("#lab-eta-o")!.innerHTML = `${sceneSVG("telefono", s, "Il telefono a 35 cm")}${readout(s)}`;
        el.querySelector("#lab-eta-t")!.textContent = `A ${age} anni il punto più vicino nitido è a circa ${near5(np)}. ${np > 0.6 ? "Neanche col braccio teso." : np > 0.35 ? "Il telefono a 35 cm sfoca: si allunga il braccio." : s.work === "fatica" ? "Il telefono si legge, ma il cristallino è al limite: dopo un po' stanca. Spesso la presbiopia comincia così." : "Il telefono si legge senza fatica."}`;
      };
      inp.oninput = upd;
      upd();
    },
    lettura(el) {
      let g = "no", d = "near";
      const draw = () => {
        const dist = d === "near" ? 0.35 : Infinity, lens = g === "si" ? sph(CARLA_ADD) : PLANO, s = see(CARLA, lens, dist);
        el.innerHTML = `<p class="muted">Carla, ${CARLA.age} anni. Da lontano non ha difetti.</p>${seg("Occhiali", [["no", "Senza occhiali"], ["si", `Da lettura ${diop(CARLA_ADD)}`]], g)}${seg("Cosa guarda", [["near", "Telefono, 35 cm"], ["far", "Lontano"]], d)}
          <div class="lv-out">${looking(d === "near" ? "telefono" : "strada", s, g === "si" ? CARLA_ADD : null, dist, { who: "Carla" })}</div>
          <p class="labout">${g === "no" ? (d === "near" ? "Il cristallino non ce la fa più: il telefono sfoca." : "Da lontano tutto bene.") : d === "near" ? "Con la lente da lettura il telefono è nitido e comodo." : "Con la lente da lettura il lontano è sfocato: per guidare non va."}</p>`;
        el.querySelectorAll<HTMLElement>(".seg").forEach((sg, i) => bindSeg(sg, k => { if (i === 0) g = k; else d = k; draw(); }));
      };
      draw();
    },
    progressiva(el) {
      let gz: Gaze = "alto";
      const ADD = CARLA_ADD, eye = CARLA;
      const draw = () => {
        const cfg: Record<Gaze, { scene: SceneId; d: number; lens: SphCyl; txt: string }> = {
          alto: { scene: "strada", d: Infinity, lens: PLANO, txt: "In alto la lente è per lontano: la strada è nitida." },
          centro: { scene: "pc", d: 0.7, lens: sph(ADD / 2), txt: "Al centro c'è il corridoio: la forza sale piano, giusta per computer e cruscotto." },
          basso: { scene: "telefono", d: 0.35, lens: sph(ADD), txt: "In basso c'è tutta l'addizione: il telefono è nitido." },
          lato: { scene: "telefono", d: 0.35, lens: { sph: ADD + 0.5, cyl: -1, axis: 45 }, txt: "Ai lati la lente sfoca un po': per guardare di lato si gira la testa." },
        };
        const c = cfg[gz], s = see(eye, c.lens, c.d);
        el.innerHTML = `<p class="muted">Carla con una progressiva, addizione ${diop(ADD)}. Sposta lo sguardo.</p>${seg("Dove guarda", [["alto", "In alto"], ["centro", "Al centro"], ["basso", "In basso"], ["lato", "In basso a lato"]], gz)}
          ${progressiveSVG(gz)}${sceneSVG(c.scene, s, "Come vede Carla")}${readout(s)}<p class="labout">${esc(c.txt)}</p>`;
        bindSeg(el, k => { gz = k as Gaze; draw(); });
      };
      draw();
    },
    quadrante(el) {
      let g = "no", sc: "quadrante" | "notte" = "quadrante";
      const draw = () => {
        const lens = g === "si" ? ASTIG.rx : PLANO, s = see(ASTIG, lens, Infinity);
        el.innerHTML = `<p class="muted">Un occhio con astigmatismo. Guarda il quadrante e la strada di notte, senza occhiali e con la lente giusta.</p>${seg("Occhiali", [["no", "Senza occhiali"], ["si", "Con la lente giusta"]], g)}${seg("Cosa guarda", [["quadrante", "Quadrante"], ["notte", "Di notte"]], sc)}
          <div class="lv-out">${looking(sc, s, null, Infinity, { work: false })}</div>
          <p class="labout">${g === "si" ? "Con la lente giusta i due fuochi tornano uno: tutte le righe uguali, le luci tonde." : sc === "notte" ? "Due fuochi: le luci si allungano a striscia." : "Due fuochi: le righe in una direzione sono più nitide di quelle nell'altra."}</p>`;
        el.querySelectorAll<HTMLElement>(".seg").forEach((sg, i) => bindSeg(sg, k => { if (i === 0) g = k; else sc = k as "quadrante" | "notte"; draw(); }));
      };
      draw();
    },
    asse(el) {
      let e = "0";
      const ok = ASTIG.rx.axis;
      const draw = () => {
        const ax = normAxis(ok + +e), s = see(ASTIG, { ...ASTIG.rx, axis: ax }, Infinity);
        el.innerHTML = `<p class="muted">Una lente con cilindro ${diop(ASTIG.rx.cyl)}, asse ${ok}°. La linea tratteggiata è l'asse giusto. Quanto conta l'asse?</p>${seg("Errore d'asse", [["0", `Giusto, ${ok}°`], ["5", "5° di errore"], ["30", "30°"], ["45", "45°"]], e)}
          ${taboSVG(ax, { ghost: ok, label: "La lente vista da davanti" })}${sceneSVG("quadrante", s, "Come vede con questa lente")}${readout(s, { work: false })}
          <p class="labout">${e === "0" ? "Asse giusto: tutte le righe uguali." : e === "5" ? "Pochi gradi, ma già si vede: una direzione è meno nitida." : e === "30" ? "Con 30 gradi è come non avere il cilindro." : "Oltre i 30 gradi è peggio che senza cilindro."}</p>`;
        bindSeg(el, k => { e = k; draw(); });
      };
      draw();
    },
    storta(el) {
      let who = "cil";
      el.innerHTML = `<div id="lab-st-s"></div>${slider("lab-st", "Montatura storta (gradi)", -30, 30, 5, 15, ["30° da una parte", "30° dall'altra"])}<output class="lensval" id="lab-st-v"></output><div class="lv-out" id="lab-st-o"></div><p class="labout" id="lab-st-t"></p>`;
      const inp = el.querySelector<HTMLInputElement>("#lab-st")!;
      const upd = () => {
        const tilt = +inp.value;
        const rx: SphCyl = who === "cil" ? ASTIG.rx : sph(-1);
        const worn: SphCyl = rx.cyl ? { ...rx, axis: normAxis(rx.axis + tilt) } : rx;
        const s = see({ rx, age: 35 }, worn, Infinity);
        el.querySelector("#lab-st-s")!.innerHTML = seg("Che occhiale", [["cil", "Con cilindro"], ["sfera", "Solo sfera, −1,00"]], who);
        bindSeg(el.querySelector("#lab-st-s") as HTMLElement, k => { who = k; upd(); });
        el.querySelector("#lab-st-v")!.textContent = tilt === 0 ? "montatura dritta" : `storta di ${Math.abs(tilt)}°`;
        el.querySelector("#lab-st-o")!.innerHTML = `${who === "cil" ? taboSVG(worn.axis, { ghost: rx.axis, label: "La lente vista da davanti" }) : ""}${sceneSVG("quadrante", s, "Come vede con l'occhiale storto")}${readout(s, { work: false })}`;
        el.querySelector("#lab-st-t")!.textContent = who === "sfera" ? "Con una lente debole senza cilindro, storta o dritta, la vista quasi non cambia." : tilt === 0 ? `Dritta: l'asse è a ${rx.axis}°, la correzione funziona.` : `La lente gira con la montatura: l'asse va a ${worn.axis}°, e una direzione sfoca.`;
      };
      inp.oninput = upd;
      upd();
    },
    ricetta(el) {
      const r: Ricetta = { od: sph(-2), os: { sph: -1.5, cyl: -0.75, axis: 175 }, add: 1.75, who: "Prescrizione lenti · esempio" };
      let sel: RxCell | null = null;
      const draw = () => {
        el.innerHTML = `<p class="muted">Tocca un numero della ricetta.</p>${ricettaHTML(r, { act: "1", attr: "data-x", mark: sel ? { [sel]: "hl" } : {} })}<p class="labout">${sel ? esc(cellWhy(r, sel)) : "Ogni numero ha un posto preciso: riga dell'occhio, colonna della grandezza."}</p>`;
        el.querySelectorAll<HTMLButtonElement>("[data-x][data-arg]").forEach(b => { b.onclick = () => { sel = b.dataset.arg as RxCell; draw(); const nb = el.querySelector<HTMLButtonElement>(`[data-arg="${sel}"]`); if (nb) nb.focus(); }; });
      };
      draw();
    },
  };
  function mountLabs() { root.querySelectorAll<HTMLElement>("[data-lab]").forEach(el => { const f = LABS[el.dataset.lab as LabId]; if (f) f(el); }); }

  /* ---------- azioni ---------- */
  let toastT: ReturnType<typeof setTimeout> | undefined;
  function toast(msg: string) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.hidden = true; }, 3200);
  }
  function scrollToId(id: string) { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: "center", behavior: RM() ? "auto" : "smooth" }); }
  function setV(v: number) {
    const p = provaOf(lvCur());
    if (!isLensProva(p)) return;
    const vs = values(p);
    if (p.type === "asse") { let a = Math.round(v / p.step) * p.step; while (a <= 0) a += 180; while (a > 180) a -= 180; R().v = a; }
    else R().v = Math.min(vs[vs.length - 1], Math.max(vs[0], Math.round(v * 4) / 4));
    updSim();
  }

  const ACTS: Record<string, (arg?: string) => void> = {
    home() { S = { screen: "home", lv: null, step: null, run: null, qtab: S.qtab, confirmReset: false }; render(true); },
    quaderno() { S.screen = "quaderno"; render(true); },
    backLevel() { S.screen = "level"; render(true); },
    open(id) { openLevel(id!); },
    locked() { toast("Prima finisci il livello precedente, oppure sblocca tutti in fondo alla pagina."); },
    next() { nextStep(); },
    cardNext() { if (R().card < lvCur().cards.length - 1) R().card++; render(true); },
    cardPrev() { if (R().card > 0) R().card--; render(true); },
    bet(i) {
      const p = lvCur().prova!, r = R();
      if (r.bet != null || !("bet" in p)) return;
      r.bet = +i!;
      prog.bets.tot++;
      if (r.bet === p.bet.ok) prog.bets.won++;
      save();
      render();
    },
    view(i) { R().view = +i!; render(); },
    vUp() { const p = provaOf(lvCur()); if (isLensProva(p)) setV(R().v + (p.type === "asse" ? p.step : 0.25)); },
    vDown() { const p = provaOf(lvCur()); if (isLensProva(p)) setV(R().v - (p.type === "asse" ? p.step : 0.25)); },
    setV(v) { setV(+v!); },
    confirm() {
      const p = provaOf(lvCur()), r = R();
      if (!isLensProva(p)) return;
      const vd = verdict(p, r.v);
      r.confirms++;
      if (r.firstOk == null) r.firstOk = vd.ok;
      if (vd.ok) r.ok = true;
      r.msg = { ok: vd.ok, t: vd.msg };
      render();
      scrollToId("verdict");
    },
    hint() { const p = lvCur().prova!; R().hint = (R().hint + 1) % p.hints.length; render(); },
    cell(c) {
      const p = lvCur().prova, r = R();
      if (!p || p.type !== "ricetta" || r.rt.i >= p.tasks.length) return;
      const t = p.tasks[r.rt.i], cell = c as RxCell;
      if (t.ok.includes(cell)) {
        r.rt.marks = { ...r.rt.marks, [cell]: "ok" };
        r.rt.last = { ok: true, t: t.why };
        r.rt.i++;
      } else {
        r.rt.wrong++;
        r.rt.marks = { ...r.rt.marks, [cell]: "bad" };
        r.rt.last = { ok: false, t: `${cellWhy(p.ricetta, cell)} Non è quello che cerchi.` };
      }
      render();
      scrollToId("task");
    },
    rxInfo(c) { const p = lvCur().prova; if (p && p.type === "ricetta") { R().rt.last = { ok: true, t: cellWhy(p.ricetta, c as RxCell) }; render(); } },
    rxPick(k) { R().rt.pick = k as Occhiale; render(); },
    rxLook(k) { R().rt.look = k as Guardo; render(); },
    say(i) { choose(+i!); },
    nextClient() { const r = R(); if (r.di < r.dq.length - 1) { r.di++; render(true); } },
    ans(i) { const q = R().quiz!; if (q.ans != null) return; q.ans = +i!; if (q.ans === q.items[q.i].q.ok) q.score++; render(); },
    qnext() { const q = R().quiz!; if (q.i < q.items.length - 1) { q.i++; q.ans = null; render(true); } else nextStep(); },
    free() { prog.free = !prog.free; save(); render(); },
    resetAsk() { S.confirmReset = true; render(); },
    resetYes() { prog = freshProg(); save(); S.confirmReset = false; render(true); },
    resetNo() { S.confirmReset = false; render(); },
    qtab(k) { S.qtab = k!; render(); },
    retry() { openLevel(S.lv!); },
  };

  /* ---------- rendering ---------- */
  function focusKey(): [string, string | undefined] | null {
    const ae = document.activeElement as HTMLElement | null;
    if (!ae || !root.contains(ae) || !ae.dataset || ae.dataset.act == null) return null;
    return [ae.dataset.act, ae.dataset.arg];
  }
  function render(top?: boolean) {
    const key = focusKey();
    root.innerHTML = vHeader() + `<main class="shell">${vMain()}</main>`;
    const bar = root.querySelector<HTMLElement>(".bar");
    document.documentElement.style.setProperty("--barh", (bar ? bar.offsetHeight : 0) + "px");
    mountLabs();
    if (top) window.scrollTo(0, 0);
    else if (key) {
      const q = (s: string) => s.replace(/"/g, '\\"');
      let sel = `[data-act="${q(key[0])}"]`;
      if (key[1] != null) sel += `[data-arg="${q(key[1])}"]`;
      const el = root.querySelector<HTMLElement>(sel);
      if (el && !(el as HTMLButtonElement).disabled) { try { el.focus({ preventScroll: true }); } catch { el.focus(); } }
    }
  }

  root.addEventListener("click", e => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
    if (!el || !root.contains(el) || (el as HTMLButtonElement).disabled) return;
    const f = ACTS[el.dataset.act!];
    if (f) { e.preventDefault(); f(el.dataset.arg); }
  });
  /* il cursore della prova: si aggiorna mentre il dito trascina */
  root.addEventListener("input", e => {
    const t = e.target as HTMLInputElement;
    if (t.dataset && t.dataset.in === "lens") setV(+t.value);
  });

  /* ---------- avvio ---------- */
  render(false);
  /* per i test: la prova di questa partita e la sua soluzione */
  const prova = () => (S.lv ? provaOf(lvCur()) : undefined);
  const sol = () => { const p = prova(); return isLensProva(p) ? solutions(p) : []; };
  (window as unknown as Dict).__sca = { ACTS, get S() { return S; }, render, LEVELS, CARDS, DLG, solved, sights, prova, sol };
}
