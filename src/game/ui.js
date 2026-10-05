/* ====== INTERFACCIA ======
   Il gioco disegna le schermate come stringhe HTML e gestisce i tocchi con un solo ascoltatore.
   mountGame(app) lo monta dentro un elemento: lo usano la pagina Next.js e la versione in un file solo. */
import { CARDS, CHAPTERS, LEVELS, PRONTUARIO, WIRES } from "../content";
import { collaudo, evaluate, termIds } from "../core/engine";
import { routeAll, wgeom } from "../core/geometry";
import { benchTermName, compName, descTerm, shortName, swState, termLabel as tLabel, termShort } from "../core/names";
import { applyFault, checkProof, contradiction, healthyWires, powerCheck, probePoints, proofGaps, readContinuity, readVoltage, wrongText } from "../core/faults";
import { RULES } from "../core/rules";

export function mountGame(app) {
  "use strict";
  if (!app || app.dataset.mounted) return;
  app.dataset.mounted = "1";

  /* ---------- utilità ---------- */
  const LV = {};
  LEVELS.forEach(l => { LV[l.id] = l; });
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const fmt = (n, d = 1) => Number(n).toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtW = w => Number(w).toLocaleString("it-IT") + " W";
  const fmtA = a => fmt(a, a < 10 ? 2 : 1) + " A";
  const RM = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  const ICON = {
    back: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 4.5h9.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cross: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    dot: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  };

  const HERO = `<svg class="hero-svg" viewBox="0 0 360 176" role="img" aria-label="Un cavo spellato con i tre fili: fase marrone, neutro blu, terra giallo-verde">
    <defs><pattern id="gvp" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="9" height="9" style="fill:var(--w-gv-y)"/><rect width="3.8" height="9" style="fill:var(--w-gv-g)"/></pattern></defs>
    <path class="hw" d="M76,79 C112,79 108,40 146,40" style="stroke:var(--w-marrone)"/>
    <path class="hw" d="M76,88 C112,88 108,88 146,88" style="stroke:var(--w-blu)"/>
    <path class="hw" d="M76,97 C112,97 108,136 146,136" style="stroke:var(--w-gv-y)"/>
    <path class="hw hs" d="M76,97 C112,97 108,136 146,136"/>
    <rect class="h-sheath" x="-30" y="71" width="110" height="34" rx="17"/>
    <rect class="cu" x="144" y="36" width="16" height="8" rx="2"/>
    <rect class="cu" x="144" y="84" width="16" height="8" rx="2"/>
    <rect class="cu" x="144" y="132" width="16" height="8" rx="2"/>
    <text class="ht" x="170" y="58" style="fill:var(--w-marrone)">FASE</text>
    <text class="ht" x="170" y="106" style="fill:var(--w-blu)">NEUTRO</text>
    <text class="ht gv" x="170" y="154" style="fill:url(#gvp)">TERRA</text>
  </svg>`;

  /* ---------- progressi (solo su questo dispositivo) ---------- */
  const KEY = "fase-neutro-terra.v1";
  const freshProg = () => ({ v: 1, done: {}, cards: [], bets: { won: 0, tot: 0 }, free: false, lastFault: {} });
  let prog = freshProg();
  try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.v === 1) prog = Object.assign(freshProg(), s); } catch (e) { /* niente memoria: si gioca lo stesso */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) { /* ignora */ } }
  function unlockCard(id) { if (!prog.cards.includes(id)) { prog.cards.push(id); save(); } }

  /* ---------- stato ---------- */
  let S = { screen: "home", lv: null, step: null, run: null, qtab: "schede", confirmReset: false };
  const lvCur = () => LV[S.lv];
  /* ogni capitolo si apre dal suo primo intervento; dentro il capitolo si va in ordine */
  const firstOfCap = l => LEVELS.find(x => x.cap === l.cap);
  const unlocked = l => prog.free || firstOfCap(l) === l || !!prog.done[LEVELS[l.n - 2].id];
  /* numero da mostrare: 1…9 nel primo capitolo, poi 2.1, 2.2… */
  const lvNum = l => (l.cap === 1 ? String(l.n) : `${l.cap}.${LEVELS.filter(x => x.cap === l.cap).indexOf(l) + 1}`);
  const nextLevel = () => LEVELS.find(l => !prog.done[l.id]) || null;

  function stepsOf(lv) {
    if (lv.type === "fili") return ["chiamata", "teoria"].concat(lv.shop ? ["negozio"] : [], ["quadro", "fili", "controllo", "scommessa", "collaudo", "furgone", "esito"]);
    if (lv.type === "guasto") return ["chiamata", "teoria", "banco", "furgone", "esito"];
    return ["chiamata", "teoria", lv.type, "furgone", "esito"];
  }
  const GROUP = { chiamata: "Chiamata", teoria: "Teoria", quadro: "Sicurezza", negozio: "Negozio", fili: "Lavoro", controllo: "Collaudo", scommessa: "Collaudo", collaudo: "Collaudo", indagine: "Indagine", serata: "Serata", banco: "Banco", furgone: "Furgone", esito: "Furgone" };

  function newRun(lv) {
    const r = { card: 0, wires: [], sel: null, selWire: null, color: "marrone", sec: (lv.palette && lv.palette.defSec) || 1.5, hint: -1, checks: [], bet: null, attempts: 0, col: null, pst: {}, quiz: null, shocked: false, safeStar: false, safMiss: [], shop: null, stars: null, chkIss: [], hist: [], zoom: false, msg: null };
    if (lv.safety && lv.safety.type === "quadro") r.saf = { br: Object.fromEntries(lv.safety.breakers.map(b => [b.id, 1])), wall: 1, tag: false, tProv: false, meas: {}, reading: null, lastProbe: null, shock: false };
    if (lv.safety && lv.safety.type === "spina") r.saf = { plugged: true, shock: false };
    if (lv.type === "indagine") r.ind = { ph: "bet", bet: null, br: Object.fromEntries(lv.ind.breakers.map(b => [b.id, b.id === "diff" ? 0 : 1])), plug: Object.fromEntries(lv.ind.apps.map(a => [a.id, 1])), log: [], trips: 0, tripped: true, chi: null, cosa: null };
    if (lv.type === "serata") {
      const on = {};
      lv.ser.lines.forEach(l => l.apps.forEach(a => { on[a.id] = !!a.on; }));
      r.ser = { k: 3, on, black: false, overSince: null, bothSince: null, ciabSince: null, hot: false, m: [false, false, false], mi: [null, null, null] };
    }
    if (lv.type === "guasto") r.bench = newBench(lv, pickFault(lv));
    return r;
  }
  function openLevel(id) { S.screen = "level"; S.lv = id; S.step = "chiamata"; S.run = newRun(LV[id]); render(true); }
  function goStep(step) { S.step = step; render(true); }
  function nextStep() { const st = stepsOf(lvCur()); const i = st.indexOf(S.step); if (i < st.length - 1) goStep(st[i + 1]); }

  /* ---------- geometria della tavola ---------- */
  const compById = RULES.compById, compOf = RULES.compOf, capOf = RULES.capOf;
  const usedAt = (lv, t, skip) => RULES.usedAt(lv, S.run.wires, t, skip);
  const capoWire = cid => RULES.capoWire(S.run.wires, cid);
  const tpos = RULES.tpos;
  /* da che parte arriva un filo al morsetto: dal basso (1) o dall'alto (-1) */
  const tdir = RULES.tdir;
  /* geometria dei fili (src/core/geometry.ts): curve morbide che non coprono morsetti, scritte e pezzi altrui,
     posate una alla volta perché non si corrano sopra */
  const wireGeoms = (lv, wires) => routeAll(lv, wires.map(w => ({ a: w.a, b: w.b, capo: !!w.capo, color: w.color })));
  function wireSVG(g, color, sec, o) {
    const d = g.d;
    const w = sec >= 2.5 ? 5.2 : sec >= 1.5 ? 3.8 : 3;
    const live = o.live ? `<path class="g" d="${d}" style="stroke-width:${w + 9}px"/>` : "";
    const attrs = o.edit ? ` data-w="${o.idx}" role="button" tabindex="0" aria-label="${esc(o.label || "filo")}"` : "";
    const cap = o.capo ? ` data-capo="${o.capo}"` : "";
    return `<g class="wire${o.sel ? " sel" : ""}${o.fixed ? " fixed" : ""}"${attrs}${cap}>${live}
      <path class="c" d="${d}" style="stroke-width:${w + 3.4}px"/>
      <path class="k" d="${d}" style="stroke:var(${WIRES[color].v});stroke-width:${w}px"/>
      ${color === "gv" ? `<path class="s" d="${d}" style="stroke-width:${w}px"/>` : ""}
      ${o.edit ? `<path class="hit" d="${d}"/>` : ""}</g>`;
  }
  /* la punta di rame di un filo libero: gli ultimi millimetri spellati */
  function cuEnd(c, hot) {
    const dir = c.y >= c.fy ? 1 : -1;
    return `<line class="cu-edge${hot ? " hot" : ""}" x1="${c.x}" y1="${c.y - 11 * dir}" x2="${c.x}" y2="${c.y}"/><line class="cu-end" x1="${c.x}" y1="${c.y - 11 * dir}" x2="${c.x}" y2="${c.y}"/>`;
  }

  function compSVG(lv, c, o, ev, trip) {
    const x = c.x, y = c.y;
    if (c.kind === "morsetto") {
      const w = c.slots * 30;
      return `<g class="wago"><rect x="${x}" y="${y}" width="${w}" height="28" rx="5"/>${Array.from({ length: c.slots }, (_, i) => `<rect class="lever" x="${x + 8 + i * 30}" y="${y - 7}" width="14" height="10" rx="2"/>`).join("")}</g>`;
    }
    if (c.kind === "presa") {
      const info = ev && ev.sockets[c.id];
      const on = !!(info && info.ok && !trip);
      const txt = on ? (info.earth ? "bollitore acceso" : "acceso, senza ⏚") : "niente corrente";
      return `<g class="presa"><rect class="body" x="${x}" y="${y}" width="100" height="60" rx="10"/><rect class="face" x="${x + 12}" y="${y + 10}" width="76" height="40" rx="8"/>
        ${[30, 50, 70].map(dx => `<ellipse class="hole" cx="${x + dx}" cy="${y + 30}" rx="${dx === 50 ? 4 : 3}" ry="${dx === 50 ? 7 : 5.5}"/>`).join("")}
        ${o.mode === "power" ? `<text class="plug${on ? " on" : ""}" x="${x + 50}" y="${y + 58}" text-anchor="middle">${txt}</text>` : ""}</g>`;
    }
    if (c.kind === "lampada") {
      const info = ev && ev.lamps[c.id];
      const on = !!(info && info.on && !trip);
      const cx = x + 50, top = !!c.top;
      const sy = top ? y : y + 66, oy = top ? y + 30 : y;
      let shape;
      if (c.look === "lampadario") {
        const cy = oy + 26;
        shape = `<line class="arm" x1="${cx}" y1="${top ? y + 24 : oy}" x2="${cx}" y2="${cy}"/><path class="arm" d="M${cx - 34},${cy + 6} Q${cx},${cy - 16} ${cx + 34},${cy + 6}"/>` +
          [-34, 0, 34].map(d => { const by = cy + (d ? 16 : 20); return `${on ? `<circle class="glow" cx="${cx + d}" cy="${by}" r="17"/>` : ""}<circle class="bulb${on ? " on" : ""}" cx="${cx + d}" cy="${by}" r="9"/>`; }).join("");
      } else if (c.look === "plafoniera") {
        shape = `${top ? `<line class="arm" x1="${cx}" y1="${y + 24}" x2="${cx}" y2="${oy + 2}"/>` : ""}${on ? `<ellipse class="glow" cx="${cx}" cy="${oy + 22}" rx="54" ry="32"/>` : ""}<rect class="body" x="${cx - 42}" y="${oy + 2}" width="84" height="8" rx="2"/><path class="bulb${on ? " on" : ""}" d="M${cx - 36},${oy + 10} A36,26 0 0 0 ${cx + 36},${oy + 10} Z"/>`;
      } else {
        const cy = oy + 26;
        shape = `${on ? `<circle class="glow" cx="${cx}" cy="${cy}" r="34"/>` : ""}<circle class="bulb${on ? " on" : ""}" cx="${cx}" cy="${cy}" r="19"/><rect class="body" x="${cx - 10}" y="${cy + 18}" width="20" height="12" rx="2"/>`;
      }
      return `<g class="lamp">${shape}<rect class="mstrip" x="${x}" y="${sy}" width="100" height="24" rx="6"/></g>`;
    }
    // comandi
    const w = c.kind === "interruttore" ? 96 : c.kind === "deviatore" ? 96 : 140;
    const s = (o.st && o.st[c.id]) || 0;
    const pw = o.mode === "power" || o.mode === "bench";
    let inner = "";
    const yb = y + 56;
    if (c.kind === "interruttore") {
      const yy = y + 40;
      inner = `<line class="arm" x1="${x + 24}" y1="${yy}" x2="${x + 24}" y2="${yb}"/><line class="arm" x1="${x + 72}" y1="${yy}" x2="${x + 72}" y2="${yb}"/>
        <circle class="cpt" cx="${x + 24}" cy="${yy}" r="3"/><circle class="cpt" cx="${x + 72}" cy="${yy}" r="3"/>
        <line class="contact" x1="${x + 24}" y1="${yy}" x2="${s ? x + 72 : x + 62}" y2="${s ? yy : yy - 20}"/>`;
    } else if (c.kind === "deviatore") {
      const yc = y + 40, yo = y + 20;
      inner = `<line class="arm" x1="${x + 14}" y1="${yc}" x2="${x + 14}" y2="${yb}"/><line class="arm" x1="${x + 48}" y1="${yo}" x2="${x + 48}" y2="${yb}"/><line class="arm" x1="${x + 82}" y1="${yo}" x2="${x + 82}" y2="${yb}"/>
        <circle class="cpt" cx="${x + 14}" cy="${yc}" r="3"/><circle class="cpt" cx="${x + 48}" cy="${yo}" r="3"/><circle class="cpt" cx="${x + 82}" cy="${yo}" r="3"/>
        <line class="contact" x1="${x + 14}" y1="${yc}" x2="${s ? x + 82 : x + 48}" y2="${yo}"/>`;
    } else {
      const X = k => x + ({ 1: 14, 2: 48, 3: 82, 4: 116 })[k];
      const P = { 1: [x + 40, y + 24], 2: [x + 40, y + 42], 3: [x + 100, y + 24], 4: [x + 100, y + 42] };
      const ln = (a, b, cls) => `<line class="${cls}" x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}"/>`;
      inner = [1, 2, 3, 4].map(k => `<path class="arm" d="M${P[k][0]},${P[k][1]} L${X(k)},${yb}"/><circle class="cpt" cx="${P[k][0]}" cy="${P[k][1]}" r="3"/>`).join("") +
        (s ? ln(1, 4, "contact") + ln(2, 3, "contact") : ln(1, 3, "contact") + ln(2, 4, "contact")) +
        `<path class="pair" d="M${X(1)},${y + 92} v5 H${X(2)} v-5 M${X(3)},${y + 92} v5 H${X(4)} v-5"/>`;
    }
    const stTxt = swState(c, s);
    const nm = c.locked ? "a muro" : c.kind;
    const act = pw ? ` data-act="toggleSw" data-arg="${c.id}" role="button" tabindex="0" aria-label="${esc(compName(c))}: ${stTxt}. Tocca per girarlo"`
      : c.locked && o.mode === "edit" ? ` data-locked="${c.id}" role="button" tabindex="0" aria-label="${esc(compName(c))}: già collegato. Tocca per sapere a cosa"` : "";
    const sx = x + w / 2;
    /* capovolto: lo schema interno si specchia (morsetti in alto), le scritte vanno in basso e restano dritte */
    const fl = !!c.flip;
    const innerG = fl ? `<g transform="matrix(1 0 0 -1 0 ${2 * y + 56})">${inner}</g>` : inner;
    /* la posizione si scrive dove lo schema interno lascia spazio: tra i due bracci a destra nel deviatore,
       in alto a destra nell'invertitore, al centro nell'interruttore */
    const st = !pw ? "" : c.kind === "invertitore" || fl ? `<text class="swst${c.kind === "invertitore" ? " r" : ""}" x="${x + w - 6}" y="${fl ? y + 51 : y + 13}" text-anchor="end">${stTxt}</text>`
      : `<text class="swst" x="${c.kind === "deviatore" ? x + 65 : sx}" y="${y + 53}" text-anchor="middle">${stTxt}</text>`;
    const lab = `<text class="clab" x="${x + 6}" y="${fl ? y + 51 : y + 13}">${esc(nm)}</text>${st}`;
    return `<g class="swg"${act}><rect class="body" x="${x}" y="${y}" width="${w}" height="56" rx="8"/>${innerG}
      ${lab}
      ${c.locked ? `<text class="note" x="${x + w / 2}" y="${fl ? y - 34 : y + 74}" text-anchor="middle">già collegato</text>` : ""}</g>`;
  }

  function termSVG(lv, c, t, o, live) {
    const id = c.id + "." + t, p = tpos(lv, id), key = "t:" + id;
    const sel = o.sel === key, edit = o.mode === "edit", cand = !!(o.cand && o.cand.has(key));
    const slot = c.kind === "morsetto";
    const label = slot ? "" : tLabel(c, t);
    const shape = slot ? `<rect class="t" x="${p.x - 6}" y="${p.y - 6}" width="12" height="12" rx="2"/>`
      : `<circle class="t" cx="${p.x}" cy="${p.y}" r="6.5"/><path class="screw" d="M${p.x - 3.4},${p.y} H${p.x + 3.4} M${p.x},${p.y - 3.4} V${p.y + 3.4}"/>`;
    const bench = o.mode === "bench", pr = bench && o.probes ? o.probes.indexOf(id) : -1;
    const attrs = edit ? ` data-t="${id}" role="button" tabindex="0" aria-label="${esc(descTerm(lv, id))}"`
      : bench ? ` data-act="probeT" data-arg="${id}" role="button" tabindex="0" aria-label="${esc(benchTermName(lv, id, o.wires))}${pr === 0 ? ": puntale rosso" : pr === 1 ? ": puntale nero" : ": appoggia il puntale"}"` : "";
    let lab = "";
    if (label) {
      if (c.kind === "presa") lab = `<text class="tl" x="${p.x}" y="${p.y - 12}" text-anchor="middle">${esc(label)}</text>`;
      // sulle lampade la scritta sta a sinistra del morsetto: i fili arrivano dall'alto o dal basso e non la coprono
      else if (c.kind === "lampada") lab = `<text class="tl" x="${p.x - 9}" y="${p.y + 4}" text-anchor="end">${esc(label)}</text>`;
      else lab = `<text class="tl" x="${p.x + 10}" y="${p.y + 4}">${esc(label)}</text>`;
    }
    const probe = pr < 0 ? "" : `<circle class="probe p${pr + 1}" cx="${p.x}" cy="${p.y}" r="12.5"/>`;
    return `<g class="term${sel ? " sel" : ""}${cand ? " cand" : ""}${slot ? " slot" : ""}${live ? " live" : ""}${bench ? " probeable" : ""}"${attrs}>
      ${edit || bench ? `<circle class="hit" cx="${p.x}" cy="${p.y}" r="20"/>` : ""}
      ${sel ? `<circle class="ring" cx="${p.x}" cy="${p.y}" r="13"/>` : ""}${shape}${lab}${probe}</g>`;
  }
  function tipSVG(c, o) {
    const key = "c:" + c.id, sel = o.sel === key, cand = !!(o.cand && o.cand.has(key));
    return `<g class="tip${sel ? " sel" : ""}${cand ? " cand" : ""}" data-tip="${c.id}" role="button" tabindex="0" aria-label="Punta del filo ${esc(WIRES[c.color].label)}: trascinala fino al morsetto">
      <circle class="hit" cx="${c.x}" cy="${c.y}" r="21"/>${sel ? "" : `<circle class="pulse" cx="${c.x}" cy="${c.y}" r="10"/>`}
      ${sel ? `<circle class="ring" cx="${c.x}" cy="${c.y}" r="13"/>` : ""}${cuEnd(c)}</g>`;
  }
  function gripSVG(i, end, p, c) {
    const dx = c.x - p.x, dy = c.y - p.y, L = Math.hypot(dx, dy) || 1;
    const gx = p.x + dx / L * 18, gy = p.y + dy / L * 18;
    return `<g class="grip" data-grip="${i}:${end}"><circle class="hit" cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="17"/><circle class="gd" cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="7.5"/></g>`;
  }

  function boardSVG(lv, wires, o) {
    const b = lv.board, H = b.h;
    const comps = b.comps.filter(c => c.kind !== "sorgente");
    const bench = o.mode === "bench";
    const ev = bench ? o.ev || null : o.mode === "power" ? evaluate(lv, wires, o.st || {}) : null;
    const trip = !!(ev && (ev.corto || ev.dispersione));
    const livePot = t => !bench && !!(ev && !trip && (ev.potOf(t) || "")[0] === "L");
    const edit = o.mode === "edit";
    const capi = comps.filter(k => k.kind === "capo");
    const free = capi.filter(c => !wires.some(w => w.capo && w.a === c.id + ".x"));
    const out = [];
    for (const z of b.zones || []) out.push(`<g class="zone"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="10"/><text class="zl" x="${z.x + 10}" y="${z.y + 17}">${esc(z.label)}</text></g>`);
    if (b.canalina) {
      const k = b.canalina;
      out.push(`<g class="canal"><rect x="${k.x}" y="${k.y}" width="${k.w}" height="16" rx="3"/><line x1="${k.x + 2}" y1="${k.y + 5}" x2="${k.x + k.w - 2}" y2="${k.y + 5}"/><text class="zl" x="${k.x + k.w / 2}" y="${k.y + 34}" text-anchor="middle">${esc(k.label)}</text></g>`);
    }
    for (const c of free) out.push(wireSVG(wgeom(c.fx, c.fy, c.x, c.y, H, true), c.color, c.sec, { capo: c.id, live: livePot(c.id + ".x") }));
    for (const f of (b.fixed || []).filter(k => k.vis)) {
      const p2 = tpos(lv, f.b), p1 = f.from || tpos(lv, f.a);
      const g = f.d ? { d: f.d } : wgeom(p1.x, p1.y, p2.x, p2.y, H, !!f.from, 1, tdir(lv, f.b));
      out.push(wireSVG(g, f.color, f.sec, { fixed: true, live: livePot(f.b) }));
    }
    for (const t of b.tubes || []) out.push(`<g class="tube"><path class="tb" d="${t.d}"/><path class="tw" d="${t.d}" style="stroke:var(${WIRES[t.color].v})"/>${t.label ? `<text class="note" x="${t.lx}" y="${t.ly}">${esc(t.label)}</text>` : ""}</g>`);
    for (const k of b.cables || []) out.push(`<g class="sheath"><rect x="${k.x}" y="${k.y}" width="${k.w}" height="${k.h}" rx="${k.h / 2}"/><text x="${k.x + k.w / 2}" y="${k.y + k.h / 2 + 3.4}" text-anchor="middle">${esc(k.label)}</text></g>`);
    for (const c of comps) if (c.kind !== "capo") out.push(compSVG(lv, c, o, ev, trip));
    const geoms = wireGeoms(lv, wires);
    wires.forEach((w, i) => {
      const label = `Filo ${WIRES[w.color].label}${w.capo ? "" : " " + fmt(w.sec) + " mm²"} da ${descTerm(lv, w.a)} a ${descTerm(lv, w.b)}. Tocca per cambiarlo`;
      out.push(wireSVG(geoms[i], w.color, w.sec, { idx: i, sel: o.selWire === i, edit, live: livePot(w.a), label, capo: w.capo ? w.a.split(".")[0] : null }));
    });
    for (const c of comps) if (!c.locked && c.kind !== "capo") for (const t of termIds(c)) out.push(termSVG(lv, c, t, o, livePot(c.id + "." + t)));
    for (const c of free) out.push(edit ? tipSVG(c, o) : `<g>${cuEnd(c, livePot(c.id + ".x"))}</g>`);
    if (edit && o.selWire != null && wires[o.selWire]) {
      const w = wires[o.selWire], g = geoms[o.selWire];
      if (!w.capo) out.push(gripSVG(o.selWire, "a", g.p1, g.c1));
      out.push(gripSVG(o.selWire, "b", g.p2, g.c2));
    }
    if (edit) out.push(`<g id="live" class="livel"></g>`);
    if (trip) out.push(`<text class="tripped" x="180" y="${H - 10}" text-anchor="middle">${ev.corto ? "scattato il magnetotermico" : "scattato il differenziale"}</text>`);
    return `<svg viewBox="0 0 360 ${H}" role="group" aria-label="Tavola dei collegamenti">${out.join("")}</svg>`;
  }

  /* ---------- viste ---------- */
  function vHeader() {
    if (S.screen === "home") return "";
    const lv = S.lv ? lvCur() : null;
    const inLevel = S.screen === "level";
    const title = S.screen === "quaderno" ? "Quaderno" : `${lvNum(lv)} · ${lv.title}`;
    const back = S.screen === "quaderno" && S.lv ? `<button class="btn-q icon" data-act="backLevel" aria-label="Torna all'intervento">${ICON.back}</button>` : `<button class="btn-q icon" data-act="home" aria-label="Torna alla mappa">${ICON.back}</button>`;
    return `<header class="bar"><div class="bar-in">${back}<span class="bar-t">${esc(title)}</span>${inLevel ? `<button class="btn-q icon" data-act="quaderno" aria-label="Apri il quaderno">${ICON.book}</button>` : `<span style="width:44px"></span>`}</div>${inLevel ? vSteps(lv) : ""}</header>`;
  }
  function vSteps(lv) {
    const groups = [...new Set(stepsOf(lv).map(s => GROUP[s]))];
    const ci = groups.indexOf(GROUP[S.step]);
    return `<ol class="steps" aria-label="Fasi dell'intervento">${groups.map((g, i) => `<li class="st${i < ci ? " done" : i === ci ? " cur" : ""}"${i === ci ? ' aria-current="step"' : ""}><span class="b"></span><span class="l${i === ci ? "" : " vh"}">${g}</span></li>`).join("")}</ol>`;
  }

  function vHome() {
    const stars = LEVELS.reduce((s, l) => s + (prog.done[l.id] ? prog.done[l.id].stars.filter(Boolean).length : 0), 0);
    const latest = CHAPTERS[CHAPTERS.length - 1];
    /* il capitolo della settimana viene prima: si può giocare anche senza aver finito gli altri */
    const nx = LEVELS.find(l => l.cap === latest.n && !prog.done[l.id]) || nextLevel();
    return `<section class="hero"><h1 class="vh">Fase Neutro Terra</h1>${HERO}
      <p class="lede">Un capitolo alla settimana. Prima la fisica che serve, poi le mani sui fili, il collaudo e la ricerca dei guasti.</p>
      <div class="stats"><span class="stat"><b>${stars}</b>/${LEVELS.length * 3} stelle</span><span class="stat"><b>${prog.cards.length}</b> schede</span><span class="stat"><b>${prog.bets.won}</b>/${prog.bets.tot} scommesse vinte</span></div>
      <div class="row">${nx ? `<button class="btn btn-p" data-act="open" data-arg="${nx.id}">${prog.done[nx.id] || Object.keys(prog.done).some(id => LEVELS.find(l => l.id === id && l.cap === nx.cap)) ? "Continua" : "Comincia"}: ${lvNum(nx)} · ${esc(nx.title)}</button>` : `<button class="btn btn-p" data-act="quaderno">Tutto fatto: apri il quaderno</button>`}<button class="btn btn-s" data-act="quaderno">${ICON.book} Quaderno</button></div>
    </section>
    <details class="how card"><summary>Come si gioca</summary>
      <ol class="olist">
        <li><strong>La chiamata</strong>: il cliente ti scrive cosa gli serve.</li>
        <li><strong>La teoria</strong>: solo quella che serve per quel lavoro, con piccoli esperimenti da toccare.</li>
        <li><strong>La sicurezza</strong>: al quadro stacchi, segnali, provi il tester e misuri. Se tocchi un filo in tensione, prendi la scossa.</li>
        <li><strong>I fili</strong>: trascini la punta di rame fino al morsetto, oppure tiri un filo nuovo da un morsetto all'altro. Tocchi un filo per cambiargli colore, sezione o posizione.</li>
        <li><strong>Il collaudo</strong>: prima scommetti su cosa succede, poi ridai tensione. Il simulatore prova tutte le combinazioni.</li>
        <li><strong>Il banco guasti</strong> (dal capitolo 2): l'impianto è già fatto e c'è un guasto. Accendi e spegni la linea, giri i comandi, appoggi i puntali del tester su due morsetti. Poi dici dov'è il guasto e lo ripari, fuori tensione.</li>
        <li><strong>Il furgone</strong>: tre domande, e una ripassa un intervento vecchio.</li>
      </ol>
      <p class="muted">Ogni intervento vale tre stelle. Le schede di teoria finiscono nel quaderno, insieme al prontuario e al lessico.</p>
    </details>
    ${CHAPTERS.slice().reverse().map(vChapter).join("")}
    <p class="fine">È un simulatore. Nell'impianto vero si lavora fuori tensione, accanto a chi ne ha la responsabilità: nuovi punti, modifiche e ampliamenti li esegue un'impresa abilitata, che a fine lavori rilascia la dichiarazione di conformità (DM 37/2008).</p>
    ${S.confirmReset ? `<div class="card confirm"><p><strong>Azzerare tutto?</strong> Cancelli stelle, schede e scommesse su questo dispositivo.</p><div class="row"><button class="btn btn-s danger" data-act="resetYes">Azzera</button><button class="btn btn-s" data-act="resetNo">Annulla</button></div></div>` : ""}
    <div class="row"><button class="btn-q" data-act="free" aria-pressed="${prog.free}">${prog.free ? "Ordine libero attivo: tocca per tornare in ordine" : "Sblocca tutti gli interventi"}</button><button class="btn-q" data-act="resetAsk">Azzera i progressi</button></div>`;
  }
  function vLvRow(l) {
    const ok = unlocked(l), d = prog.done[l.id];
    const st = d ? d.stars : [false, false, false];
    return `<button class="lv${ok ? "" : " locked"}${d ? " done" : ""}" data-act="${ok ? "open" : "locked"}" data-arg="${l.id}">
      <span class="lv-n">${lvNum(l)}</span><span class="lv-t"><b>${esc(l.title)}</b><small>${esc(l.short)}</small></span>
      <span class="lv-s" aria-label="${ok ? st.filter(Boolean).length + " stelle su 3" : "bloccato"}">${ok ? st.map(s => `<i class="${s ? "on" : ""}"></i>`).join("") : ICON.lock}</span></button>`;
  }

  function vChapter(ch) {
    const lvs = LEVELS.filter(l => l.cap === ch.n);
    const parts = [...new Set(lvs.map(l => l.part))];
    const done = lvs.filter(l => prog.done[l.id]).length;
    const date = new Date(ch.date + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long" });
    return `<section class="cap" aria-labelledby="cap-${ch.n}"><div class="cap-h"><p class="eyebrow">Capitolo ${ch.n} · dal ${esc(date)} · ${done}/${lvs.length}</p><h2 class="h2" id="cap-${ch.n}">${esc(ch.title)}</h2><p class="muted">${esc(ch.short)}</p></div>
      ${parts.map(p => `<section class="parte">${parts.length > 1 || p !== ch.title ? `<h3 class="eyebrow">${esc(p)}</h3>` : ""}<div class="lvs">${lvs.filter(l => l.part === p).map(vLvRow).join("")}</div></section>`).join("")}</section>`;
  }

  function vChiamata(lv) {
    const msg = lv.type === "guasto" ? curFault().msg : lv.client.msg;
    return `<p class="eyebrow">${lv.type === "guasto" ? "Banco guasti" : "Intervento"} ${lvNum(lv)} · ${esc(lv.part)}</p><h1 class="h1">${esc(lv.title)}</h1>
      <div class="msg"><span class="msg-who">${esc(lv.client.who)} · ${esc(lv.client.where)}</span><p>${esc(msg)}</p></div>
      <div class="card"><h2 class="h3">Cosa impari</h2><ul class="list">${lv.learn.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="row"><button class="btn btn-p" data-act="next">Prima di toccare: la teoria</button></div>`;
  }

  function vCard(id, c) {
    return `<article class="card tcard">${c.t ? `<h2 class="h2">${esc(c.t)}</h2>` : ""}
      ${c.ol ? `<ol class="olist">${c.ol.map(x => `<li>${md(x)}</li>`).join("")}</ol>` : ""}
      ${(c.p || []).map(x => `<p>${md(x)}</p>`).join("")}
      ${c.f ? `<div class="formula">${c.f.map(x => `<span>${esc(x)}</span>`).join("")}</div>` : ""}
      ${c.lab ? `<div class="lab" data-lab="${c.lab}"></div>` : ""}
      ${c.g ? `<table class="gergo"><thead><tr><th>Tecnico</th><th>In cantiere</th></tr></thead><tbody>${c.g.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table>` : ""}
      ${c.capo ? `<div class="capo"><span class="eyebrow">Il capo dice</span><p>${esc(c.capo)}</p></div>` : ""}</article>`;
  }
  function vTeoria(lv) {
    const i = S.run.card, id = lv.cards[i];
    unlockCard(id);
    const last = i === lv.cards.length - 1;
    const go = lv.type === "fili" ? (lv.shop ? "Al negozio" : lv.safety.type === "spina" ? "Prima di toccare" : "Al quadro") : lv.type === "indagine" ? "Comincia l'indagine" : lv.type === "guasto" ? "Al banco" : "Comincia la serata";
    return `<p class="eyebrow">Teoria · scheda ${i + 1} di ${lv.cards.length}</p>${vCard(id, CARDS[id])}
      <div class="row">${i > 0 ? `<button class="btn btn-s" data-act="cardPrev">Indietro</button>` : ""}${last ? `<button class="btn btn-p" data-act="next">${go}</button>` : `<button class="btn btn-p" data-act="cardNext">Avanti</button>`}</div>`;
  }

  /* sicurezza */
  function condLive(lv, cond) {
    const s = S.run.saf, sf = lv.safety;
    const powered = s.br.gen && s.br.diff && s.br[sf.feed];
    if (cond === "L") return !!powered;
    if (cond === "R") return !!(powered && s.wall);
    return false;
  }
  const probeRead = (lv, p) => (condLive(lv, p.a) !== condLive(lv, p.b) ? 230 : 0);
  const shockHTML = `<div class="res err" role="alert" id="shock"><h2>Scossa</h2><p>Il punto dove lavoravi era ancora a 230 V. Se la corrente passa da te verso terra, il differenziale stacca in una frazione di secondo. Se tocchi fase e neutro insieme, invece, per lui sei solo un carico e non stacca. L'unica protezione vera è lavorare fuori tensione.</p><p class="muted">La stella della sicurezza, per questa volta, è persa. Torna indietro, togli tensione e misura.</p></div>`;
  function vRail(brs, st, act, trip) {
    return `<div class="rail">${brs.map(b => {
      const on = !!st[b.id];
      return `<button class="mod ${b.kind || ""} ${on ? "on" : "off"}${trip === b.id ? " trip" : ""}" style="--w:${b.w || 1}" data-act="${act}" data-arg="${b.id}" aria-pressed="${on}" aria-label="${esc(b.label)}${b.sub ? " " + esc(b.sub) : ""}: leva ${on ? "su" : "giù"}">
        <span class="lev" aria-hidden="true"><span class="knob"></span></span><span class="io" aria-hidden="true">${on ? "I · ON" : "O · OFF"}</span>
        <span class="mlabel">${esc(b.label)}</span>${b.sub ? `<span class="msub">${esc(b.sub)}</span>` : ""}${b.sub2 ? `<span class="msub">${esc(b.sub2)}</span>` : ""}</button>`;
    }).join("")}</div>`;
  }
  function vQuadro(lv) {
    const sf = lv.safety, s = S.run.saf;
    const anyOff = sf.breakers.some(b => !s.br[b.id]);
    const allMeas = sf.probes.every((p, i) => s.meas[i] != null);
    const proc = [
      ["Prova il tester su una presa viva", s.tProv],
      ["Stacca al quadro", anyOff],
      ["Metti il cartello sul quadro", s.tag],
      ["Misura tutte le coppie di fili", allMeas],
    ];
    const cab = (lv.board.cables || []).map(k => `«${k.label}»`);
    const arriva = cab.length ? ` Ci ${cab.length > 1 ? "arrivano i cavi" : "arriva il cavo"} ${cab.length > 1 ? cab.slice(0, -1).join(", ") + " e " + cab[cab.length - 1] : cab[0]}.` : "";
    return `<p class="eyebrow">Sicurezza · al quadro</p><h1 class="h1">Togli tensione ${esc(sf.where)}</h1>
      <p class="muted">Lavori ${esc(sf.where)}.${esc(arriva)} Prima prova il tester su una presa viva, poi abbassa la leva giusta, metti il cartello e misura.</p>
      ${s.shock ? shockHTML : ""}
      <div class="quadro">${vRail(sf.breakers, s.br, "brk")}${s.tag ? `<div class="tagq">Lavori in corso · non riarmare</div>` : ""}</div>
      <div class="row">${sf.wall ? `<button class="btn btn-s" data-act="wall" aria-pressed="${!!s.wall}">Interruttore a muro: ${s.wall ? "acceso" : "spento"}</button>` : ""}<button class="btn btn-s" data-act="tag" aria-pressed="${s.tag}">${s.tag ? "Cartello messo" : "Metti il cartello"}</button></div>
      <div class="card tester"><div class="lcd" aria-live="polite"><span>${s.reading == null ? "– – –" : s.reading}</span><small>${s.reading == null ? "tester a due puntali" : "V · " + esc(s.lastProbe)}</small></div>
        <button class="pbtn" data-act="tprova"><span>Prova su una presa viva</span><span class="r${s.tProv ? " z" : ""}">${s.tProv ? "230 V " + ICON.check : ""}</span></button>
        ${s.tmsg ? `<p class="status warn">${esc(s.tmsg)}</p>` : ""}
        <p class="muted">Misura ${esc(sf.where)}:</p>
        <div class="probes">${sf.probes.map((p, i) => { const m = s.meas[i]; return `<button class="pbtn" data-act="probe" data-arg="${i}"><span>${esc(p.label)}</span><span class="r ${m == null ? "" : m ? "v" : "z"}">${m == null ? "" : m + " V"}</span></button>`; }).join("")}</div></div>
      <ul class="proc">${proc.map(([t, ok]) => `<li class="${ok ? "ok" : ""}">${ok ? ICON.check : ICON.dot}<span>${esc(t)}</span></li>`).join("")}</ul>
      <div class="row"><button class="btn btn-p" data-act="work">Comincia il lavoro</button></div>
      <p class="fine">Il gioco non ti ferma: se manca un passo lo vedi nelle stelle, se c'è tensione prendi la scossa.</p>`;
  }
  function spinaSVG(plugged) {
    const dx = plugged ? 0 : 54;
    return `<svg viewBox="0 0 320 110" role="img" aria-label="${plugged ? "Spina inserita nella presa" : "Spina staccata dalla presa"}" style="display:block;width:100%;max-width:420px;height:auto;margin-inline:auto">
      <rect class="body" x="16" y="14" width="82" height="82" rx="12"/><rect class="face" x="28" y="26" width="58" height="58" rx="9"/>
      <ellipse class="hole" cx="45" cy="55" rx="3" ry="5.5"/><ellipse class="hole" cx="57" cy="55" rx="4" ry="7"/><ellipse class="hole" cx="69" cy="55" rx="3" ry="5.5"/>
      <g transform="translate(${dx},0)">${plugged ? "" : `<rect x="70" y="47" width="16" height="4" rx="1" style="fill:var(--w-grigio)"/><rect x="70" y="59" width="16" height="4" rx="1" style="fill:var(--w-grigio)"/>`}
      <rect x="84" y="36" width="40" height="38" rx="7" style="fill:var(--w-nero)"/><path d="M124,55 C170,55 186,86 304,86" style="fill:none;stroke:var(--w-grigio);stroke-width:7;stroke-linecap:round"/></g></svg>`;
  }
  function vSpina(lv) {
    const s = S.run.saf;
    return `<p class="eyebrow">Sicurezza</p><h1 class="h1">La lampada è ancora attaccata alla presa</h1>
      <p>Il portalampada è aperto e i fili sono scoperti. Con la spina inserita sono a 230 V.</p>
      ${s.shock ? shockHTML : ""}
      <div class="card">${spinaSVG(s.plugged)}<button class="btn btn-s" data-act="plug" aria-pressed="${!s.plugged}">${s.plugged ? "Stacca la spina" : "Spina staccata: rimettila"}</button></div>
      <div class="row"><button class="btn btn-p" data-act="work">Comincia il lavoro</button></div>
      <p class="fine">Il gioco non ti ferma: se c'è tensione, prendi la scossa.</p>`;
  }

  function vNegozio(lv) {
    const sh = lv.shop, r = S.run;
    if (!r.shop) r.shop = { sel: [], done: false, ok: false };
    const st = r.shop;
    return `<p class="eyebrow">Al banco del negozio</p><h1 class="h1">Gli accessori della canalina</h1><p>${esc(sh.q)}</p>
      <div class="opts">${sh.opts.map((o, i) => {
        const sel = st.sel.includes(i);
        let cls = "";
        if (st.done) cls = o.ok ? (sel ? "good" : "miss") : (sel ? "bad" : "");
        return `<button class="opt ${cls}" data-act="shopSel" data-arg="${i}" aria-pressed="${sel}"${st.done ? " disabled" : ""}>${esc(o.t)}${st.done && (sel || o.ok) ? `<small>${o.ok && !sel ? "Ti serviva. " : ""}${esc(o.why)}</small>` : ""}</button>`;
      }).join("")}</div>
      ${st.done ? `<div class="res ${st.ok ? "ok" : "warn"}"><h2>${st.ok ? "Tutto giusto." : "Qualcosa non torna."}</h2><p>${st.ok ? "Tre pezzi, tutti 30×10: si agganciano." : "Al cantiere te ne accorgeresti con il coperchio in mano. Conta per la stella della regola d'arte."}</p></div><div class="row"><button class="btn btn-p" data-act="next">Al quadro</button></div>`
        : `<div class="row"><button class="btn btn-p" data-act="shopDone"${st.sel.length ? "" : " disabled"}>Alla cassa</button></div>`}`;
  }

  /* fili: collegare trascinando (modello PhET), oppure toccando due punti (modello React Flow) */
  const srcFromKey = (lv, key) => RULES.srcFromKey(lv, S.run.wires, key);
  const sourceError = (lv, src) => RULES.sourceError(lv, S.run.wires, src);
  const checkTarget = (lv, src, key) => RULES.checkTarget(lv, S.run.wires, src, key);
  const allKeys = lv => RULES.allKeys(lv, S.run.wires);
  const candKeys = (lv, src) => RULES.candKeys(lv, S.run.wires, src);
  function keyPos(lv, key) {
    if (key[0] === "c") { const c = compById(lv, key.slice(2)); return { x: c.x, y: c.y }; }
    return tpos(lv, key.slice(2));
  }
  const keyName = (lv, key) => (key[0] === "c" ? `il filo ${WIRES[compById(lv, key.slice(2)).color].label}` : descTerm(lv, key.slice(2)));

  function snapshot() { const r = S.run; r.hist.push(JSON.stringify(r.wires)); if (r.hist.length > 60) r.hist.shift(); }
  function applyConnect(lv, src, key) {
    const r = S.run;
    snapshot();
    const res = RULES.connect(lv, r.wires, src, key, { color: r.color, sec: r.sec });
    if (res.kind === "capo") { r.selWire = null; const c = compById(lv, res.cid); return `Collegato: il filo ${WIRES[c.color].label} va a ${descTerm(lv, res.t)}.`; }
    if (res.kind === "move") { r.selWire = res.capo ? null : res.index; r.reveal = !res.capo; return `Spostato: ora va a ${descTerm(lv, res.t)}.`; }
    r.selWire = null;
    return `Filo ${WIRES[r.color].label} da ${fmt(r.sec)} mm² tirato. Se vuoi cambiarlo, toccalo.`;
  }
  function tapNode(lv, key) {
    const r = S.run;
    r.msg = null;
    if (r.sel === key) { r.sel = null; return render(); }
    if (!r.sel) {
      const err = sourceError(lv, srcFromKey(lv, key));
      if (err) { r.msg = { t: err[1], k: "warn" }; return render(); }
      r.sel = key; r.selWire = null;
      return render();
    }
    const src = srcFromKey(lv, r.sel);
    const err = checkTarget(lv, src, key);
    r.sel = null;
    r.msg = err ? { t: err[1], k: "warn" } : { t: applyConnect(lv, src, key), k: "ok" };
    render();
  }

  function idleStatus(lv) {
    const r = S.run;
    if (r.sel) return `Hai preso ${keyName(lv, r.sel)}. Ora tocca dove va: i punti tratteggiati. Per lasciarlo, toccalo di nuovo.`;
    if (!r.wires.length) return "Comincia: trascina la punta di rame di un filo fino a un morsetto.";
    const n = r.wires.length;
    return `${n} ${n === 1 ? "collegamento" : "collegamenti"} sulla tavola. Tocca un filo per cambiarlo.`;
  }
  /* le istruzioni nascono da quello che c'è sulla tavola, non da una frase fissa */
  function howText(lv) {
    const parts = [], capi = lv.board.comps.some(c => c.kind === "capo");
    if (capi) parts.push("Trascina fino al suo morsetto la punta di rame di ogni filo che arriva.");
    if (lv.palette) {
      if (capi) parts.push("Un filo che arriva raggiunge solo i morsetti della sua zona: per andare oltre, collegalo a un morsetto e da lì tira un filo nuovo.");
      parts.push("Per un filo nuovo trascina da un morsetto all'altro: colore e sezione li scegli qui sotto, prima di tirarlo.");
    } else parts.push("Qui non si tirano fili nuovi.");
    parts.push("Tocca un filo che hai messo tu per cambiarlo o staccarlo.");
    return parts.join(" ");
  }
  const swatches = (act, cur) => Object.keys(WIRES).map(k => `<button class="swc" data-act="${act}" data-arg="${k}" aria-pressed="${cur === k}" aria-label="${esc(WIRES[k].label)}" title="${esc(WIRES[k].label)}"><i class="sw-${k}"></i></button>`).join("");
  const secSeg = (act, cur) => `<div class="seg" role="group" aria-label="Sezione in millimetri quadrati">${[1.5, 2.5].map(v => `<button data-act="${act}" data-arg="${v}" aria-pressed="${cur === v}">${fmt(v)}</button>`).join("")}</div>`;
  const pickRow = (lv, ca, cc, sa, sc) => `<div class="pick"><div class="pal" role="group" aria-label="Colore">${swatches(ca, cc)}</div><span class="cname">${esc(WIRES[cc].label)}</span>${lv.palette && lv.palette.sections ? `<span class="secw">${secSeg(sa, sc)}<span class="unit">mm²</span></span>` : ""}</div>`;
  /* il riquadro in basso compare solo quando serve: filo selezionato, primo tocco fatto, o un messaggio */
  function vSheet(lv) {
    const r = S.run;
    const w = r.selWire != null ? r.wires[r.selWire] : null;
    const msg = r.msg ? `<p class="status ${r.msg.k}">${esc(r.msg.t)}</p>` : "";
    if (w) {
      const head = `<div class="wp-h"><i class="wdot sw-${w.color}"></i><b>Filo ${esc(WIRES[w.color].label)}${w.capo ? "" : " · " + fmt(w.sec) + " mm²"}</b><button class="btn-q danger" data-act="wdel">${w.capo ? "Stacca" : "Togli"}</button><button class="btn-q" data-act="wdone">Fatto</button></div>
        <p class="wp-d">Da ${esc(descTerm(lv, w.a))} a ${esc(descTerm(lv, w.b))}.${w.capo ? " Arriva dal cavo: colore e sezione sono quelli." : ""} Per spostarlo trascina il pallino blu.</p>`;
      return `<section id="sheet" class="sheet" aria-label="Filo selezionato">${msg}${head}${w.capo ? "" : pickRow(lv, "wcolor", w.color, "wsec", w.sec)}</section>`;
    }
    if (r.sel) return `<section id="sheet" class="sheet"><p class="status">${esc(idleStatus(lv))}</p><div class="row"><button class="btn-q" data-act="selCancel">Lascia</button></div></section>`;
    if (r.msg) return `<section id="sheet" class="sheet transient">${msg}</section>`;
    return "";
  }
  function legendHTML(lv) {
    const has = k => lv.board.comps.some(c => c.kind === k);
    const it = [];
    if (has("capo")) it.push(`<span><svg viewBox="0 0 20 20"><line x1="10" y1="0" x2="10" y2="9" class="lg-wire"/><line x1="10" y1="9" x2="10" y2="17" class="cu-edge"/><line x1="10" y1="9" x2="10" y2="17" class="cu-end"/></svg>punta da collegare</span>`);
    if (has("morsetto")) it.push(`<span><svg viewBox="0 0 30 20"><g class="wago"><rect x="2" y="7" width="26" height="12" rx="3"/><rect class="lever" x="5" y="2" width="8" height="6" rx="1.5"/><rect class="lever" x="17" y="2" width="8" height="6" rx="1.5"/></g></svg>morsetto a leva</span>`);
    it.push(`<span><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" class="lg-cand"/></svg>dove può andare</span>`);
    it.push(`<span><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6" class="lg-grip"/></svg>pallino per spostare</span>`);
    return `<div class="legend" aria-hidden="true">${it.join("")}</div>`;
  }
  function vFili(lv) {
    const r = S.run;
    const cand = r.sel ? candKeys(lv, srcFromKey(lv, r.sel)) : null;
    const live = r.msg ? r.msg.t : idleStatus(lv);
    return `<p class="eyebrow">Lavoro · ${lv.safety.type === "spina" ? "spina staccata" : "fuori tensione"}</p><h1 class="h1">${esc(lv.short)}</h1>
      <p class="muted">${esc(howText(lv))}</p>${lv.note ? `<p class="note-txt">${esc(lv.note)}</p>` : ""}${legendHTML(lv)}
      ${lv.palette ? `<div class="nextw"><span class="dl">Filo nuovo</span>${pickRow(lv, "color", r.color, "sec", r.sec)}</div>` : ""}
      <div class="board${r.zoom ? " zoom" : ""}">${boardSVG(lv, r.wires, { mode: "edit", sel: r.sel, selWire: r.selWire, cand })}</div>
      <p class="vh" aria-live="polite">${esc(live)}</p>
      <div class="row tools"><button class="btn btn-s" data-act="undo"${r.hist.length ? "" : " disabled"}>Annulla</button><button class="btn btn-s" data-act="clear"${r.wires.length ? "" : " disabled"}>Ricomincia</button><button class="btn btn-s" data-act="zoom" aria-pressed="${r.zoom}">${r.zoom ? "Riduci" : "Ingrandisci"}</button><button class="btn btn-s" data-act="hint">Suggerimento</button></div>
      ${r.hint >= 0 ? `<div class="capo"><span class="eyebrow">Il capo dice</span><p>${esc(lv.hints[r.hint])}</p></div>` : ""}
      <div class="row"><button class="btn btn-p" data-act="next"${r.wires.length ? "" : " disabled"}>Ho finito: prima di ridare tensione</button></div>
      ${vSheet(lv)}`;
  }

  /* trascinamento: il filo segue il dito e si aggancia al punto valido più vicino */
  let drag = null, lastUp = 0, sheetTimer = null;
  function svgPt(svg, e) {
    const m = svg.getScreenCTM && svg.getScreenCTM();
    if (!m) return null;
    const inv = m.inverse();
    return { x: inv.a * e.clientX + inv.c * e.clientY + inv.e, y: inv.b * e.clientX + inv.d * e.clientY + inv.f };
  }
  const nodeEl = (svg, key) => svg.querySelector(key[0] === "c" ? `[data-tip="${key.slice(2)}"]` : `[data-t="${key.slice(2)}"]`);
  function liveGeom(lv, src, end, tkey) {
    const r = S.run, H = lv.board.h;
    const ed = tkey && tkey[0] === "t" ? tdir(lv, tkey.slice(2)) : 1;
    if (src.kind === "tip") { const c = compById(lv, src.cid); return { g: wgeom(c.fx, c.fy, end.x, end.y, H, true), color: c.color, sec: c.sec }; }
    if (src.kind === "grip") {
      const w = r.wires[src.i];
      if (w.capo) { const c = compOf(lv, w.a); return { g: wgeom(c.fx, c.fy, end.x, end.y, H, true), color: w.color, sec: w.sec }; }
      const ot = src.end === "a" ? w.b : w.a, o = tpos(lv, ot);
      return { g: wgeom(o.x, o.y, end.x, end.y, H, false, tdir(lv, ot), ed), color: w.color, sec: w.sec };
    }
    const s = tpos(lv, src.t), g = wgeom(s.x, s.y, end.x, end.y, H, false, tdir(lv, src.t), ed);
    return lv.palette && !(tkey && tkey[0] === "c") ? { g, color: r.color, sec: r.sec } : { g, dashed: true };
  }
  function bubble(p, text, warn) {
    const w = Math.min(352, 16 + text.length * 6.3), h = 22;
    const x = Math.max(4, Math.min(356 - w, p.x - w / 2));
    const y = p.y - 46 < 4 ? p.y + 24 : p.y - 46;
    return `<g class="bub${warn ? " warn" : ""}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="6"/><text x="${(x + w / 2).toFixed(1)}" y="${(y + 15).toFixed(1)}" text-anchor="middle">${esc(text)}</text></g>`;
  }
  function startLive() {
    const lv = lvCur(), d = drag;
    d.cands = candKeys(lv, d.src);
    d.box = d.svg.closest(".board");
    if (d.box) d.box.classList.add("dragging");
    d.cands.forEach(k => { const n = nodeEl(d.svg, k); if (n) n.classList.add("cand"); });
    const hide = el => { if (el) el.classList.add("hide-drag"); };
    if (d.src.kind === "tip") { hide(d.svg.querySelector(`[data-capo="${d.src.cid}"]`)); hide(d.svg.querySelector(`[data-tip="${d.src.cid}"]`)); }
    if (d.src.kind === "grip") { hide(d.svg.querySelector(`[data-w="${d.src.i}"]`)); d.svg.querySelectorAll(".grip").forEach(hide); }
    d.live = d.svg.querySelector("#live");
    const sh = document.getElementById("sheet");
    if (sh) sh.classList.add("ghost");
    d.raf = requestAnimationFrame(edgeScroll);
  }
  function edgeScroll() {
    const d = drag;
    if (!d || !d.moved || d.err) return;
    const bar = app.querySelector(".bar"), top = (bar ? bar.getBoundingClientRect().bottom : 0) + 40, bot = window.innerHeight - 56;
    let v = 0;
    if (d.cy > bot) v = Math.min(12, (d.cy - bot) / 4);
    else if (d.cy < top) v = -Math.min(12, (top - d.cy) / 4);
    if (v) { const y0 = window.scrollY; window.scrollBy(0, v); if (window.scrollY !== y0) moveLive({ clientX: d.cx, clientY: d.cy }); }
    d.raf = requestAnimationFrame(edgeScroll);
  }
  /* dopo una selezione: se i pallini del filo finiscono sotto il riquadro o sotto la barra, scorri */
  function revealSel() {
    const r = S.run;
    if (!r || !r.reveal) return;
    r.reveal = false;
    const gs = [...app.querySelectorAll(".grip .gd")];
    if (!gs.length) return;
    const sheet = document.getElementById("sheet"), bar = app.querySelector(".bar");
    const top = (bar ? bar.getBoundingClientRect().bottom : 0) + 16;
    const bottom = (sheet ? sheet.getBoundingClientRect().top : window.innerHeight) - 16;
    const rs = gs.map(g => g.getBoundingClientRect());
    const minY = Math.min(...rs.map(b => b.top)), maxY = Math.max(...rs.map(b => b.bottom));
    let dy = maxY > bottom ? maxY - bottom : 0;
    if (minY - dy < top) dy = minY - top;
    if (Math.abs(dy) > 2) window.scrollBy({ top: dy, behavior: RM() ? "auto" : "smooth" });
  }
  /* un messaggio da solo sparisce dopo qualche secondo */
  function armSheetTimer() {
    clearTimeout(sheetTimer);
    const sh = document.getElementById("sheet");
    if (!sh || !sh.classList.contains("transient") || !S.run) return;
    const m = S.run.msg;
    sheetTimer = setTimeout(() => {
      if (!S.run || S.run.msg !== m || drag) return;
      S.run.msg = null;
      const el = document.getElementById("sheet");
      if (el) el.remove();
      const main = app.querySelector(".shell");
      if (main) main.classList.remove("has-sheet");
    }, 4500);
  }
  function moveLive(e) {
    const lv = lvCur(), d = drag, p = svgPt(d.svg, e);
    if (!p || !d.live) return;
    let best = null, bd = 34;
    d.cands.forEach(k => { const q = keyPos(lv, k), dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < bd) { bd = dd; best = k; } });
    d.target = best; d.hoverErr = null;
    let end = p, txt = null, warn = false;
    if (best) { end = keyPos(lv, best); txt = "→ " + keyName(lv, best); }
    else {
      let nk = null, nd = 22;
      for (const k of allKeys(lv)) { const q = keyPos(lv, k), dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < nd) { nd = dd; nk = k; } }
      const self = d.src.kind === "tip" ? "c:" + d.src.cid : d.src.kind === "term" ? "t:" + d.src.t : null;
      if (nk && nk !== self) { const err = checkTarget(lv, d.src, nk); if (err) { d.hoverErr = err; txt = err[0]; warn = true; } }
    }
    const lg = liveGeom(lv, d.src, end, best);
    d.live.innerHTML = (lg.dashed ? `<path class="ldash" d="${lg.g.d}"/>` : wireSVG(lg.g, lg.color, lg.sec, {})) +
      (best ? `<circle class="tgt" cx="${end.x}" cy="${end.y}" r="14"/>` : "") + (txt ? bubble(end, txt, warn) : "");
  }
  function endDrag(cancel) {
    const d = drag;
    drag = null; lastUp = Date.now();
    if (!d) return;
    if (d.raf) cancelAnimationFrame(d.raf);
    const lv = lvCur(), r = S.run;
    if (cancel) return render();
    if (!d.moved) {
      if (d.src.kind === "grip" && !d.key) return;
      return tapNode(lv, d.key);
    }
    r.sel = null;
    if (d.err) r.msg = { t: d.err[1], k: "warn" };
    else if (d.target) r.msg = { t: applyConnect(lv, d.src, d.target), k: "ok" };
    else if (d.hoverErr) r.msg = { t: d.hoverErr[1], k: "warn" };
    else r.msg = null;
    render();
  }

  function vControllo(lv) {
    const r = S.run;
    return `<p class="eyebrow">Collaudo · prima di ridare tensione</p><h1 class="h1">Cosa è giusto?</h1><p class="muted">Segna le frasi giuste, e solo quelle.</p>
      <div class="opts">${lv.check.map((c, i) => { const on = r.checks.includes(i); return `<button class="opt chk" data-act="chk" data-arg="${i}" aria-pressed="${on}"><span class="box">${on ? ICON.check : ""}</span><span>${esc(c.t)}</span></button>`; }).join("")}</div>
      <div class="row"><button class="btn btn-s" data-act="toFili">Torna ai fili</button><button class="btn btn-p" data-act="next">Avanti</button></div>`;
  }
  const BETS = [["ok", "Funziona, tutto a regola"], ["nonregola", "Funziona, ma qualcosa non è a regola"], ["sbagliato", "Funziona solo in parte"], ["spento", "Non arriva corrente"], ["corto", "Scatta il magnetotermico"], ["diff", "Scatta il differenziale"]];
  const betLabel = k => (BETS.find(b => b[0] === k) || ["", ""])[1];
  function vScommessa() {
    const r = S.run;
    return `<p class="eyebrow">Collaudo · scommetti prima di guardare</p><h1 class="h1">Ridai tensione. Cosa succede?</h1>
      <p class="muted">La differenza tra quello che ti aspetti e quello che succede è il punto in cui impari.</p>
      <div class="opts">${BETS.map(([k, t]) => `<button class="opt" data-act="bet" data-arg="${k}" aria-pressed="${r.bet === k}">${esc(t)}</button>`).join("")}</div>
      <div class="row"><button class="btn btn-p" data-act="power"${r.bet ? "" : " disabled"}>Ridai tensione</button></div>`;
  }
  function checkIssues(lv) {
    const r = S.run;
    return lv.check.map((c, i) => ({ c, on: r.checks.includes(i) })).filter(x => x.c.ok !== x.on)
      .map(x => ({ t: x.c.ok ? `Non l'hai segnato: «${x.c.t}»` : `Questo no: «${x.c.t}»`, why: x.c.why }));
  }
  function doPower(lv) {
    const r = S.run;
    r.attempts++;
    r.col = collaudo(lv, r.wires);
    r.chkIss = checkIssues(lv);
    if (r.attempts === 1) r.firstOk = r.col.funziona;
    r.betWon = r.bet === r.col.outcome;
    prog.bets.tot++;
    if (r.betWon) prog.bets.won++;
    save();
    r.lastBet = r.bet;
    r.bet = null;
    r.pst = {};
    goStep("collaudo");
  }
  const OUTCOME = {
    ok: ["ok", "Funziona, ed è a regola d'arte."],
    nonregola: ["warn", "Funziona, ma non è a regola."],
    sbagliato: ["warn", "Funziona solo in parte."],
    spento: ["err", "Non arriva corrente."],
    corto: ["err", "Scatta il magnetotermico."],
    diff: ["err", "Scatta il differenziale."],
  };
  function explain(lv, c) {
    const n = c.rows.length;
    switch (c.outcome) {
      case "corto": return "Fase e neutro si toccano senza niente in mezzo: la resistenza è quasi zero e la corrente sale a centinaia di ampere. Il magnetico stacca all'istante. Si chiama cortocircuito." + (c.sw.length && c.cortoRows.length < n ? ` Succede in ${c.cortoRows.length} combinazioni su ${n}: quando giri il comando sbagliato.` : "");
      case "diff": return c.dispWhy === "fase" ? "La fase tocca la terra: la corrente torna dal giallo-verde invece che dal neutro, e il differenziale vede la differenza."
        : c.dispWhy === "neutro" ? "Neutro e terra sono uniti dopo il differenziale: appena qualcosa consuma, una parte della corrente torna dalla terra e il differenziale stacca."
          : "Un carico è collegato tra fase e terra: la sua corrente torna dal giallo-verde, e il differenziale stacca.";
      case "spento": return lv.goal.type === "prese" ? "La presa non riceve fase e neutro insieme: il giro non si chiude." : "Il giro non si chiude: da qualche parte manca un collegamento, e la corrente non trova la strada per tornare.";
      case "sbagliato": {
        if (lv.goal.type === "prese") return "Una presa funziona, l'altra no.";
        if (c.lampOn && c.lampOn.every(Boolean)) return "La luce resta sempre accesa: la lampada prende la fase da un filo che l'interruttore non comanda.";
        return "In alcune combinazioni la luce non fa quello che deve. Guarda la tabella.";
      }
      case "nonregola": return "La luce o la presa funzionano, ma il capo ha trovato qualcosa da sistemare.";
      default: return lv.goal.type === "prese" ? "Fase e neutro arrivano, la terra c'è, colori e sezioni sono giusti." : c.sw.length ? "Tutte le combinazioni fanno quello che devono, i colori sono giusti e la terra c'è." : "Il giro è chiuso e la lampada si accende.";
    }
  }
  function issueText(lv, i) {
    const n = i.n > 1 ? ` (${i.n} fili)` : "";
    switch (i.key) {
      case "neutro": return ["La lampada resta in tensione a luce spenta", "Succede se l'interruttore interrompe il neutro invece della fase, o se il neutro non arriva alla lampada. Chi cambia la lampadina prende la scossa."];
      case "terraViva": return ["Terra in tensione", "Il morsetto di terra è collegato alla fase: la carcassa di quello che ci attacchi sarebbe a 230 V."];
      case "terra": return [`Manca la terra: ${compName(compById(lv, i.comp))}`, "Il morsetto ⏚ non è collegato al giallo-verde. Funziona, ma un guasto nell'apparecchio resterebbe sulla carcassa."];
      case "capoVivo": return [`Il filo ${WIRES[compById(lv, i.comp).color].label} è rimasto libero, ed è in tensione`, "Il rame di una fase non resta mai libero nella scatola: si chiude in un morsetto."];
      case "capoLibero": return [`Il filo ${WIRES[compById(lv, i.comp).color].label} è rimasto libero`, "Ogni filo nella scatola va collegato o chiuso in un morsetto."];
      case "gvAltro": return ["Giallo-verde usato per altro" + n, "Il giallo-verde è solo per la terra. Sempre, senza eccezioni."];
      case "terraColore": return ["La terra non è giallo-verde" + n, "Chi apre la scatola dopo di te si fida dei colori."];
      case "neutroColore": return ["Il neutro non è blu" + n, "Il neutro va in blu."];
      case "faseBlu": return ["Blu usato per una fase" + n, "Il blu è del neutro. Per fase, ritorno e scambi usa marrone, nero o grigio."];
      case "sezione": return ["Filo troppo sottile" + n, `Questa linea è protetta da un magnetotermico da 16 A: la derivazione si fa da ${fmt(lv.minSec)} mm².`];
    }
    return [i.key, ""];
  }
  function vIssues(lv, c, r) {
    const items = c.issues.map(i => { const [t, w] = issueText(lv, i); return `<li class="s${i.sev}"><div><b>${esc(t)}</b><span>${esc(w)}</span></div></li>`; });
    r.chkIss.forEach(k => items.push(`<li class="s2"><div><b>${esc(k.t)}</b><span>${esc(k.why)}</span></div></li>`));
    if (lv.shop && r.shop && !r.shop.ok) items.push(`<li class="s2"><div><b>Al negozio hai preso i pezzi sbagliati</b><span>Accessori e canale devono avere la stessa larghezza e la stessa altezza.</span></div></li>`);
    if (!items.length) return `<section class="card"><h2 class="h3">Il capo controlla</h2><p>Niente da dire. Si chiude la scatola.</p></section>`;
    return `<section class="card"><h2 class="h3">Il capo controlla</h2><ul class="iss">${items.join("")}</ul></section>`;
  }
  function vTruth(lv, c) {
    const sws = c.sw.map(id => compById(lv, id)), n = sws.length;
    const rows = c.rows.map((row, m) => {
      const on = c.lampOn[m];
      let good;
      if (lv.goal.mode === "segue") good = on === !!row.st[lv.goal.sw];
      else { good = true; for (let b = 0; b < n; b++) if (on === c.lampOn[m ^ (1 << b)]) good = false; }
      return `<tr>${sws.map(s => `<td>${swState(s, row.st[s.id])}</td>`).join("")}<td class="${on ? "on" : ""}">${on ? "accesa" : "spenta"}</td><td class="${good ? "y" : "n"}">${good ? "giusto" : "sbagliato"}</td></tr>`;
    });
    return `<section class="card"><h2 class="h3">Tutte le combinazioni</h2><p class="muted">${lv.goal.mode === "segue" ? "La luce deve seguire l'interruttore." : "Da ogni riga, girando un solo comando la luce deve cambiare."}</p>
      <div class="tt-wrap"><table class="tt"><thead><tr>${sws.map(s => `<th>${esc(shortName(s))}</th>`).join("")}<th>Luce</th><th></th></tr></thead><tbody>${rows.join("")}</tbody></table></div></section>`;
  }
  function powerStatus(lv) {
    const r = S.run, ev = evaluate(lv, r.wires, r.pst);
    if (ev.corto) return "In questa combinazione fase e neutro si toccano: scatta il magnetotermico.";
    if (ev.dispersione) return "In questa combinazione scatta il differenziale.";
    if (lv.goal.type === "lamp") { const L = ev.lamps[lv.goal.lamp]; return `Luce ${L.on ? "accesa" : "spenta"}${!L.on && L.live ? ", ma la lampada è in tensione" : ""}.`; }
    return lv.goal.prese.map(id => { const k = ev.sockets[id]; return `${compName(compById(lv, id))}: ${k.ok ? "230 V" + (k.earth ? "" : ", senza terra") : "niente corrente"}`; }).join(" · ") + ".";
  }
  function vCollaudo(lv) {
    const r = S.run, c = r.col, o = c.outcome, [cls, head] = OUTCOME[o];
    const showDetail = o === "ok" || o === "nonregola" || o === "sbagliato";
    return `<div class="res ${cls}"><span class="eyebrow">Collaudo</span><h1>${head}</h1><p>${esc(explain(lv, c))}</p></div>
      <p class="bet ${r.betWon ? "won" : "lost"}">${r.betWon ? ICON.check : ICON.cross}<span>${r.betWon ? "Scommessa vinta" : "Scommessa persa"}: avevi detto «${esc(betLabel(r.lastBet))}».</span></p>
      ${showDetail && c.sw.length ? vTruth(lv, c) : ""}
      ${showDetail ? vIssues(lv, c, r) : ""}
      <section class="card"><h2 class="h3">Prova tu</h2><p class="muted">${c.sw.length ? "Tocca i comandi sulla tavola per girarli." : "Il circuito è sotto tensione."} In rosso i fili e i morsetti a 230 V.</p>
        <div class="board">${boardSVG(lv, r.wires, { mode: "power", st: r.pst })}</div><p class="status" aria-live="polite">${esc(powerStatus(lv))}</p></section>
      <div class="row">${c.funziona ? `<button class="btn btn-p" data-act="next">Domande dal furgone</button><button class="btn btn-s" data-act="toFili">Torna ai fili${c.issues.length || r.chkIss.length ? " e sistema" : ""}</button>` : `<button class="btn btn-p" data-act="toFili">Torna ai fili</button>`}</div>`;
  }

  /* indagine */
  const indLeak = lv => { const s = S.run.ind; if (!s.br.gen) return 0; return lv.ind.apps.reduce((t, a) => t + (s.plug[a.id] && s.br[a.line] ? a.leak : 0), 0); };
  const lineName = (d, id) => (d.breakers.find(b => b.id === id) || { label: id }).label;
  const vLog = log => `<ol class="log">${log.map((l, i) => `<li><span>${i + 1}.</span><span class="${l.k}">${esc(l.t)}</span></li>`).join("")}</ol>`;
  function vIndagine(lv) {
    const d = lv.ind, s = S.run.ind;
    if (s.ph === "bet") {
      return `<p class="eyebrow">Indagine · il sintomo</p><h1 class="h1">${esc(d.sintomo)}</h1>
        <p class="muted">Poi segui il metodo: il registro tiene l'ordine delle tue verifiche.</p>
        <h2 class="h3">${esc(d.bet.q)}</h2><div class="opts">${d.bet.o.map((o, i) => `<button class="opt" data-act="indBet" data-arg="${i}">${esc(o)}</button>`).join("")}</div>`;
    }
    if (s.ph === "look") {
      const won = s.bet === d.bet.ok;
      return `<p class="bet ${won ? "won" : "lost"}">${won ? ICON.check : ICON.cross}<span>${won ? "Scommessa vinta" : "Scommessa persa"}: al quadro è giù il differenziale. I magnetotermici sono su.</span></p>
        <h1 class="h2">Trova chi lo fa scattare</h1>
        <p class="muted">Tocca le leve per abbassarle o riarmarle, e gli apparecchi per staccare o riattaccare la spina.</p>
        <div class="quadro">${vRail(d.breakers, s.br, "indBrk", s.tripped && !s.br.diff ? "diff" : null)}</div>
        <div class="apps">${d.apps.map(a => `<button class="app" data-act="indPlug" data-arg="${a.id}" aria-pressed="${!!s.plug[a.id]}"><b>${esc(a.label)}</b><span class="pill">${s.plug[a.id] ? "spina attaccata" : "spina staccata"}</span><small>linea ${esc(lineName(d, a.line))}</small></button>`).join("")}</div>
        <div class="row"><button class="btn btn-s" data-act="indT">Tasto T: prova del differenziale</button></div><p class="fine">Il tasto T non serve a trovare il guasto: controlla solo che il differenziale stacchi.</p>
        <section class="card"><h2 class="h3">Le tue verifiche, in ordine</h2><p class="muted">Scatti del differenziale finora: ${s.trips}. Con il metodo ne basta uno, al massimo due.</p>${s.log.length ? vLog(s.log) : `<p class="muted">Ancora niente.</p>`}</section>
        <div class="row"><button class="btn btn-p" data-act="indDone"${s.log.length ? "" : " disabled"}>Ho capito chi è</button></div>${s.log.length ? "" : `<p class="fine">Si attiva dopo la prima verifica.</p>`}`;
    }
    if (s.ph === "chi") {
      return `<p class="eyebrow">Indagine · diagnosi</p><h1 class="h2">Chi fa scattare il differenziale?</h1>
        <div class="opts">${d.chi.map(c => `<button class="opt" data-act="indChi" data-arg="${c.id}">${esc(c.t)}</button>`).join("")}</div>
        <div class="row"><button class="btn btn-s" data-act="indLook">Torna a guardare</button></div>`;
    }
    if (s.ph === "cosa") {
      const c = d.chi.find(x => x.id === s.chi), ok = s.chi === "lavat";
      return `<div class="res ${ok ? "ok" : "warn"}"><h2>${ok ? "È la lavatrice." : "Non torna."}</h2><p>${esc(c.why)}${ok ? "" : " Il colpevole è la lavatrice: il differenziale regge finché è staccata, e scatta appena la riattacchi."}</p></div>
        <h2 class="h3">E adesso cosa fai?</h2><div class="opts">${d.cosa.map((o, i) => `<button class="opt" data-act="indCosa" data-arg="${i}">${esc(o.t)}</button>`).join("")}</div>`;
    }
    const o = d.cosa[s.cosa];
    return `<div class="res ${o.ok ? "ok" : "err"}"><h2>${o.ok ? "Giusto." : "No."}</h2><p>${esc(o.why)}</p></div>
      <section class="card caso"><h2 class="h3">Il caso, come nel quaderno</h2><dl>
        <dt>Sintomo</dt><dd>${esc(d.sintomo)}</dd>
        <dt>Scommessa</dt><dd>${esc(d.bet.o[s.bet])}${s.bet === d.bet.ok ? " (giusta)" : " (sbagliata: era il differenziale)"}</dd>
        <dt>Verifiche, in ordine</dt><dd>${vLog(s.log)}</dd>
        <dt>Causa</dt><dd>Dispersione verso terra dentro la lavatrice, circa 42 mA: sopra la soglia di questo differenziale, che scatta a ${d.soglia} mA.</dd>
        <dt>Cosa si fa</dt><dd>${esc(d.cosa.find(x => x.ok).t)}.</dd></dl></section>
      <div class="row"><button class="btn btn-p" data-act="next">Domande dal furgone</button></div>`;
  }

  /* serata */
  function serCalc(lv) {
    const s = S.run.ser;
    const lines = lv.ser.lines.map(l => {
      const w = s.black ? 0 : l.apps.reduce((t, a) => t + (s.on[a.id] ? a.w : 0), 0);
      const ciab = s.black || !l.ciabatta ? 0 : l.apps.filter(a => a.ciab).reduce((t, a) => t + (s.on[a.id] ? a.w : 0), 0);
      return { l, w, a: w / 230, ciabA: ciab / 230 };
    });
    const tot = lines.reduce((t, x) => t + x.w, 0);
    return { lines, tot, lim: s.k * 1100 };
  }
  function meterRow(label, val, max, unit, id) {
    const ratio = max ? val / max : 0;
    const cls = ratio > 1 ? " e" : ratio > 0.8 ? " w" : "";
    return `<div class="meter"><span>${label}</span><span class="v">${fmt(val, 1)} / ${fmt(max, max % 1 ? 1 : 0)}${unit}</span><div class="tr"><div class="fl${cls}"${id ? ` id="${id}"` : ""} style="width:${Math.min(100, ratio * 100).toFixed(1)}%"></div></div></div>`;
  }
  const MIS = [
    ["Fai saltare il contatore", "Accendi abbastanza cose da superare il limite del contratto, e aspetta."],
    ["Forno e lavatrice insieme, senza buio", "Falli andare insieme per qualche secondo: scegli il contratto che li regge."],
    ["Trova il pericolo che il quadro non vede", "In camera phon e stufetta sono sulla stessa ciabatta da 10 A. Accendili tutti e due e aspetta qualche secondo."],
  ];
  function misDone(i, m) {
    const k = fmt(m.k, m.k % 1 ? 1 : 0), lim = fmt(m.lim / 1000, 2);
    if (i === 0) return `Con ${k} kW il limite è ${lim} kW, e avevi chiesto ${fmt(m.kw / 1000, 2)} kW. Al quadro era tutto su: ha staccato il contatore.`;
    if (i === 1) return `Con ${k} kW il limite è ${lim} kW: forno e lavatrice ci stanno. Costa di più in bolletta; l'alternativa gratis è farli partire in momenti diversi.`;
    if (m.kw > m.lim) return `Nella ciabatta da 10 A passano ${fmt(m.a, 1)} A e il magnetotermico da 16 A non scatta. Fra poco stacca il contatore, ma solo perché hai superato il contratto: con un contratto più alto la ciabatta resterebbe accesa a scaldare.`;
    return `Nella ciabatta da 10 A passano ${fmt(m.a, 1)} A. Il magnetotermico da 16 A non scatta, e con ${k} kW nemmeno il contatore: la ciabatta scalda e nessuno la ferma.`;
  }
  function vSerata(lv) {
    const s = S.run.ser, c = serCalc(lv);
    const appBtn = a => `<button class="app" data-act="serApp" data-arg="${a.id}" aria-pressed="${!!s.on[a.id]}"><b>${esc(a.label)}</b><span class="pill">${s.on[a.id] ? (s.black ? "senza corrente" : "ON") : "OFF"}</span><small>${fmtW(a.w)} · ${fmtA(a.w / 230)}</small></button>`;
    const lineHTML = x => {
      const l = x.l, normal = l.apps.filter(a => !a.ciab), ciab = l.apps.filter(a => a.ciab);
      return `<section class="card lineb"><div class="lineh"><b>${esc(l.label)}</b><span>magnetotermico C${l.mt}</span></div>
        ${meterRow("Corrente sulla linea", x.a, l.mt, " A")}
        ${x.a > l.mt ? `<p class="muted">Sopra i ${l.mt} A: il termico comincia a scaldarsi, ma ci mette tempo.</p>` : ""}
        <div class="apps">${normal.map(appBtn).join("")}</div>
        ${ciab.length ? `<div class="ciab${s.hot ? " hot" : ""}"><div class="lineh"><b>Ciabatta da ${l.ciabatta} A</b><span>max ${fmtW(l.ciabatta * 230)}</span></div>${meterRow("Corrente nella ciabatta", x.ciabA, l.ciabatta, " A")}<div class="apps">${ciab.map(appBtn).join("")}</div>${s.hot ? `<p><strong>La ciabatta scotta.</strong> Il magnetotermico da ${l.mt} A non è scattato.</p>` : ""}</div>` : ""}</section>`;
    };
    const over = c.tot > c.lim;
    return `<p class="eyebrow">Serata in casa</p><h1 class="h1">Accendi, spegni, guarda il contatore</h1>
      <p class="muted">Tocca gli apparecchi per accenderli o spegnerli, e cambia la potenza del contratto con i tasti sotto il contatore. Nel gioco il tempo è accelerato: il contatore vero aspetta di più.</p>
      <div class="kwbox"><div class="top"><span class="kw">${fmt(c.tot / 1000, 2)} kW</span><span class="lim">limite ${fmt(c.lim / 1000, 2)} kW</span></div>
        <div class="kwbar"><i class="${over ? "over" : ""}" style="width:${Math.min(100, c.tot / c.lim * 100).toFixed(1)}%"></i></div><div class="cd" id="cd" aria-live="polite"></div>
        <div class="secrow"><span class="lim">Contratto</span><div class="seg" role="group" aria-label="Potenza del contratto">${lv.ser.contratti.map(k => `<button data-act="serK" data-arg="${k}" aria-pressed="${s.k === k}">${fmt(k, k % 1 ? 1 : 0)} kW</button>`).join("")}</div></div></div>
      ${s.black ? `<div class="res err" role="alert"><h2>Casa al buio</h2><p>Al quadro è tutto su: ha staccato il contatore. Spegni qualcosa, poi riarma.</p><div class="row"><button class="btn btn-p" data-act="serReset">Riarma il contatore</button></div></div>` : ""}
      <section class="card"><h2 class="h3">Missioni</h2><ul class="mis">${MIS.map((m, i) => `<li class="${s.m[i] ? "done" : ""}"><span class="ic">${s.m[i] ? ICON.check : ICON.dot}</span><div><b>${esc(m[0])}</b><span>${esc(s.m[i] ? misDone(i, s.mi[i]) : m[1])}</span></div></li>`).join("")}</ul></section>
      ${c.lines.map(lineHTML).join("")}
      <div class="row"><button class="btn btn-p" data-act="next"${s.m.some(Boolean) ? "" : " disabled"}>Domande dal furgone</button></div>${s.m.some(Boolean) ? "" : `<p class="fine">Si attiva quando completi almeno una missione.</p>`}`;
  }
  let serTimer = null;
  function stopSerata() { if (serTimer) { clearInterval(serTimer); serTimer = null; } }
  function startSerata() { if (!serTimer) serTimer = setInterval(serTick, 250); }
  function serTick() {
    if (S.screen !== "level" || S.step !== "serata" || !S.run || !S.run.ser) return stopSerata();
    const lv = lvCur(), s = S.run.ser, now = Date.now(), c = serCalc(lv);
    const cd = document.getElementById("cd");
    let changed = false;
    if (!s.black) {
      if (c.tot > c.lim) {
        if (!s.overSince) s.overSince = now;
        const left = lv.ser.tempi.contatore - (now - s.overSince) / 1000;
        if (left <= 0) {
          s.black = true; s.overSince = null;
          if (!s.m[0]) { s.m[0] = true; s.mi[0] = { k: s.k, lim: c.lim, kw: c.tot }; toast("Missione fatta: " + MIS[0][0].toLowerCase()); }
          changed = true;
        } else if (cd) cd.textContent = `Oltre il limite: il contatore stacca tra ${Math.ceil(left)} s`;
      } else { s.overSince = null; if (cd && cd.textContent) cd.textContent = ""; }
      if (s.on.forno && s.on.lavat && c.tot <= c.lim) {
        if (!s.bothSince) s.bothSince = now;
        if (!s.m[1] && now - s.bothSince >= lv.ser.tempi.insieme * 1000) { s.m[1] = true; s.mi[1] = { k: s.k, lim: c.lim, kw: c.tot }; changed = true; toast("Missione fatta: " + MIS[1][0].toLowerCase()); }
      } else s.bothSince = null;
      const cam = c.lines.find(x => x.l.ciabatta);
      if (cam && cam.ciabA > cam.l.ciabatta) {
        if (!s.ciabSince) s.ciabSince = now;
        if (!s.hot && now - s.ciabSince >= lv.ser.tempi.ciabatta * 1000) { s.hot = true; if (!s.m[2]) { s.m[2] = true; s.mi[2] = { k: s.k, lim: c.lim, kw: c.tot, a: cam.ciabA }; toast("Missione fatta: " + MIS[2][0].toLowerCase()); } changed = true; }
      } else { s.ciabSince = null; if (s.hot) { s.hot = false; changed = true; } }
    }
    if (changed) render();
  }

  /* ---------- banco guasti: l'impianto c'è, qualcosa non va ---------- */
  function pickFault(lv) {
    const last = prog.lastFault ? prog.lastFault[lv.id] : null;
    const ids = lv.faults.map((f, i) => i).filter(i => lv.faults.length < 2 || i !== last);
    const fi = ids[Math.floor(Math.random() * ids.length)];
    prog.lastFault = Object.assign({}, prog.lastFault, { [lv.id]: fi });
    save();
    return fi;
  }
  function newBench(lv, fi) {
    return { fi, on: false, tripped: null, mode: "V", probes: [], log: [], obs: [], seen: [], tester: false, lastKey: null, measures: 0, unsafe: 0, diagOpen: false, diag: null, firstDiag: null, proven: false, gaps: [], why: null, repaired: false, shock: false, tested: false, order: shuffle(lv.faults.map(f => f.id)) };
  }
  const curFault = () => lvCur().faults[S.run.bench.fi];
  const benchSetup = lv => applyFault(lv, S.run.bench.repaired ? null : lv.faults[S.run.bench.fi]);
  function benchReading(lv) {
    const b = S.run.bench;
    if (b.probes.length < 2) return null;
    const s = benchSetup(lv), [p, q] = b.probes;
    if (b.mode === "V") return { v: b.on ? readVoltage(s, S.run.pst, p, q) : 0 };
    if (b.on) return { unsafe: true };
    return { o: readContinuity(s, S.run.pst, p, q) };
  }
  const OHM = { zero: ["0,0", "Ω · suona"], carico: ["38", "Ω · lampada in mezzo"], aperto: ["OL", "aperto: non passa"] };
  function readingText(rd) {
    if (rd.v != null) return `${rd.v} V`;
    return { zero: "suona, 0 Ω: collegati direttamente", carico: "38 Ω, c'è una lampada in mezzo", aperto: "OL, aperto" }[rd.o];
  }
  function swText(lv, st = S.run.pst) {
    const sw = lv.board.comps.filter(c => ["interruttore", "deviatore", "invertitore"].includes(c.kind));
    return sw.length ? " · " + sw.map(c => `${shortName(c).toLowerCase()} ${swState(c, st[c.id] || 0)}`).join(", ") : "";
  }
  /* ogni coppia di puntali con un risultato nuovo è una misura, e finisce nel registro */
  function logMeasure(lv) {
    const b = S.run.bench;
    if (b.probes.length < 2) return;
    const key = [b.mode, b.probes[0], b.probes[1], JSON.stringify(S.run.pst), b.on, b.repaired].join("|");
    if (key === b.lastKey) return;
    b.lastKey = key;
    const rd = benchReading(lv), wires = benchSetup(lv).visible;
    if (rd.unsafe) { b.unsafe++; b.log.push({ t: "Continuità con la linea accesa: la misura non vale, e il tester rischia. Prima spegni la linea.", k: "bad" }); return; }
    const blind = b.mode === "V" && !b.on;
    if (!(b.diag && b.diag.ok) && !blind) b.measures++;
    // le misure che contano per la prova: tensione a linea accesa, continuità a linea spenta, prima della riparazione
    if (!blind && !b.repaired) b.obs.push({ mode: b.mode === "V" ? "V" : "Ω", a: b.probes[0], b: b.probes[1], st: Object.assign({}, S.run.pst) });
    b.log.push({ t: `${b.mode === "V" ? "V~" : "Ω"} · ${termShort(lv, b.probes[0], wires)} – ${termShort(lv, b.probes[1], wires)}${swText(lv)}${b.mode === "V" && !b.on ? " · linea spenta" : ""} → ${readingText(rd)}`, k: "" });
  }
  /* la luce si vede solo a linea accesa: ogni posizione dei comandi vista accesa o spenta entra nella prova */
  function seeLight(b) { const k = JSON.stringify(S.run.pst); if (!b.repaired && !b.seen.includes(k)) b.seen.push(k); }
  function benchPower(lv, on) {
    const b = S.run.bench;
    if (!on) { b.on = false; return; }
    const t = powerCheck(benchSetup(lv), S.run.pst);
    if (t) { b.on = false; b.tripped = t; b.log.push({ t: `Ridai tensione: scatta ${t === "corto" ? "il magnetotermico, c'è un corto" : "il differenziale"}.`, k: "bad" }); return; }
    b.on = true; b.tripped = null;
    seeLight(b);
    if (b.repaired) b.tested = true;
  }
  const lineBreaker = lv => { const w = lv.line.split(" "); return { id: "line", label: w.slice(0, -1).join(" "), sub: w[w.length - 1] }; };
  function benchStatus(lv, ev) {
    const b = S.run.bench, g = lv.goal;
    const line = b.tripped ? "La protezione è scattata" : b.on ? "Linea accesa" : "Linea spenta";
    if (g.type !== "lamp") return `${line}. Una presa non ti dice niente da sola: misura.`;
    return `${line}. Luce ${ev && ev.lamps[g.lamp].on ? "accesa" : "spenta"}.`;
  }
  function vMeter(lv) {
    const b = S.run.bench, rd = benchReading(lv), wires = benchSetup(lv).visible;
    let big = "– – –", small = b.mode === "V" ? "V~ · tensione" : "Ω · continuità";
    if (rd) {
      if (rd.unsafe) { big = "!"; small = "linea accesa: spegnila prima"; }
      else if (rd.v != null) { big = String(rd.v); small = "V~"; }
      else [big, small] = OHM[rd.o];
    }
    const p1 = b.probes[0] ? termShort(lv, b.probes[0], wires) : "tocca un morsetto";
    const p2 = b.probes[1] ? termShort(lv, b.probes[1], wires) : b.probes[0] ? "tocca il secondo" : "–";
    return `<section id="sheet" class="sheet tester" aria-label="Tester">
      <div class="mrow"><div class="mleft"><div class="lcd sm" aria-live="polite"><span>${esc(big)}</span><small>${esc(small)}</small></div><button class="btn-q tprova" data-act="testerProva" aria-pressed="${b.tester}">${b.tester ? "Tester provato" : "Prova il tester"}</button><button class="btn-q tlinea" data-act="lineTog" aria-pressed="${b.on}">${b.tripped ? "Linea scattata" : b.on ? "Linea accesa" : "Linea spenta"}</button></div>
      <div class="mcol"><div class="seg" role="group" aria-label="Cosa misura il tester"><button data-act="meterMode" data-arg="V" aria-pressed="${b.mode === "V"}">Tensione</button><button data-act="meterMode" data-arg="ohm" aria-pressed="${b.mode === "ohm"}">Continuità</button></div>
      <p class="plab"><span><i class="pdot p1"></i>${esc(p1)}</span><span><i class="pdot p2"></i>${esc(p2)}${b.probes.length ? ` <button class="btn-q" data-act="probesOff">Togli</button>` : ""}</span></p></div></div></section>`;
  }
  const hasNone = lv => lv.faults.some(f => f.none);
  /* perché la diagnosi scelta non può essere: la prima cosa vista o misurata che la smentisce */
  function wrongWhy(lv, b) {
    const wires = benchSetup(lv).visible, pick = lv.faults.find(x => x.id === b.diag.id);
    return wrongText(b.why, pick, o => {
      const st = swText(lv, o.st).replace(/^ · /, "");
      return `${o.mode === "V" ? "in tensione" : "in continuità"} tra ${termShort(lv, o.a, wires)} e ${termShort(lv, o.b, wires)}${st ? ` (${st})` : ""}`;
    });
  }
  function vBanco(lv) {
    const r = S.run, b = r.bench, f = curFault(), s = benchSetup(lv);
    const ev = b.on ? evaluate(s.lv, s.actual, r.pst, { broken: s.broken }) : null;
    const found = !!(b.diag && b.diag.ok);
    const hasSw = lv.board.comps.some(c => ["interruttore", "deviatore", "invertitore"].includes(c.kind));
    let tail = "";
    const guessed = found && !b.proven ? `<p class="warn-txt"><strong>Giusto, ma non ancora dimostrato:</strong> ${esc(b.gaps.join("; "))}. In cantiere prima si dimostra, poi si ripara.</p>` : "";
    if (!found) {
      tail = `<section class="card" id="diag"><h2 class="h3">La diagnosi</h2>
        ${b.diag && !b.diag.ok ? `<div class="res warn" id="diagres"><h2>Non torna.</h2><p>${esc(wrongWhy(lv, b))}</p></div>` : ""}
        ${b.diagOpen ? `<p class="muted">${hasNone(lv) ? "Il risultato…" : "Il guasto è…"}</p><div class="opts">${b.order.map(id => { const x = lv.faults.find(k => k.id === id); const tried = b.diag && b.diag.id === id; return `<button class="opt${tried ? " bad" : ""}" data-act="diagPick" data-arg="${id}">${esc(x.label)}</button>`; }).join("")}</div>`
          : `<p class="muted">Quando le misure ti dicono cos'è, scegli la diagnosi. Se sbagli puoi riprovare, ma la stella della diagnosi va al primo colpo; quella del metodo vuole misure che la dimostrino.</p><div class="row"><button class="btn btn-p" data-act="diagOpen">Ho la diagnosi</button></div>`}</section>`;
    } else if (f.none) {
      tail = `<div class="res ok" id="diagres"><span class="eyebrow">Diagnosi</span><h2>${esc(f.label)}.</h2>${guessed}<p><strong>Un modo per dimostrarlo:</strong> ${esc(f.proof)}</p></div>
        <div class="row"><button class="btn btn-p" data-act="next">Niente da riparare: domande dal furgone</button></div>`;
    } else if (!b.repaired) {
      tail = `<div class="res ok" id="diagres"><span class="eyebrow">Diagnosi</span><h2>${esc(f.label)}.</h2>${guessed}<p><strong>Un modo per dimostrarlo:</strong> ${esc(f.proof)}</p></div>
        <section class="card"><h2 class="h3">Riparazione</h2><p>Si ripara ${esc(f.where)}. Prima di mettere le mani: linea spenta al quadro.</p><div class="row"><button class="btn btn-p" data-act="repair">Ripara</button></div></section>`;
    } else {
      const col = collaudo(lv, healthyWires(lv));
      tail = b.tested && b.on ? `<div class="res ok"><span class="eyebrow">Collaudo</span><h2>${col.funziona ? "Funziona." : "Ancora qualcosa non va."}</h2><p>${hasSw ? "Gira i comandi: ora la luce risponde in tutte le posizioni." : "Ora la presa dà 230 V tra i due laterali e la terra c'è."}</p></div><div class="row"><button class="btn btn-p" data-act="next">Domande dal furgone</button></div>`
        : `<div class="res ok"><span class="eyebrow">Riparato</span><h2>Fatto: ${esc(f.where)}.</h2><p>Ora ridai tensione e prova.</p></div>`;
    }
    return `<p class="eyebrow">Banco guasti · ${b.repaired ? "riparato" : found ? "trovato" : hasNone(lv) ? "verifica" : "trova il guasto"}</p><h1 class="h2">${esc(lv.short)}</h1>
      <div class="msg"><span class="msg-who">${esc(lv.client.who)} · ${esc(lv.client.where)}</span><p>${esc(f.msg)}</p></div>
      <p class="muted">La leva accende e spegne la linea${hasSw ? "; i comandi si girano toccandoli" : ""}. Prima prova il tester, col pulsante sotto il display. Per misurare tocca due morsetti: il primo è il puntale rosso, il secondo il nero; ogni altro tocco sposta il nero, e toccando il rosso li togli tutti e due. Per misurare tanti punti verso la terra, metti prima il rosso sulla terra: quella della scatola (il foro dove arriva il giallo-verde della linea) se c'è, se no il ⏚ del pezzo che misuri. I puntali arrivano dappertutto. ${hasNone(lv) ? "Può esserci un difetto, uno solo, oppure nessuno." : "C'è un guasto, uno solo."}</p>
      ${lv.note ? `<p class="note-txt">${esc(lv.note)}</p>` : ""}
      ${b.shock ? shockHTML : ""}
      <div class="quadro bench-q">${vRail([lineBreaker(lv)], { line: b.on ? 1 : 0 }, "lineTog", b.tripped ? "line" : null)}<p class="status" aria-live="polite">${esc(benchStatus(lv, ev))}</p></div>
      <div class="board">${boardSVG(lv, s.visible, { mode: "bench", st: r.pst, probes: b.probes, ev, wires: s.visible })}</div>
      <section class="card"><h2 class="h3">Registro delle misure</h2>${b.log.length ? vLog(b.log.slice(-12)) : `<p class="muted">Ancora nessuna misura.</p>`}
        <div class="row"><button class="btn-q" data-act="hint">Suggerimento</button></div>${r.hint >= 0 ? `<div class="capo"><span class="eyebrow">Il capo dice</span><p>${esc(lv.hints[r.hint])}</p></div>` : ""}</section>
      ${tail}${vMeter(lv)}`;
  }

  /* furgone ed esito */
  function makeQuiz(lv) {
    const cur = shuffle(lv.quiz).map(q => ({ q, from: lvNum(lv) }));
    const prev = LEVELS.filter(l => l.n < lv.n && prog.done[l.id]);
    let items = cur.slice(0, 3);
    if (prev.length) {
      const pl = prev[Math.floor(Math.random() * prev.length)];
      items = [cur[0], cur[1], { q: pl.quiz[Math.floor(Math.random() * pl.quiz.length)], from: lvNum(pl), review: true }];
    }
    return { items, i: 0, ans: null, score: 0 };
  }
  function vFurgone(lv) {
    const r = S.run;
    if (!r.quiz) r.quiz = makeQuiz(lv);
    const q = r.quiz, it = q.items[q.i], Q = it.q;
    const answered = q.ans != null;
    return `<p class="eyebrow">Domande dal furgone · ${q.i + 1} di ${q.items.length}${it.review ? ` · ripasso dall'intervento ${it.from}` : ""}</p><h1 class="h2">${esc(Q.q)}</h1>
      <div class="opts">${Q.o.map((o, i) => { let cls = ""; if (answered) cls = i === Q.ok ? "good" : i === q.ans ? "bad" : ""; return `<button class="opt ${cls}" data-act="ans" data-arg="${i}"${answered ? " disabled" : ""}>${esc(o)}</button>`; }).join("")}</div>
      ${answered ? `<div class="capo"><span class="eyebrow">${q.ans === Q.ok ? "Giusto" : "Non proprio"}</span><p>${esc(Q.why)}</p></div><div class="row"><button class="btn btn-p" data-act="qnext">${q.i < q.items.length - 1 ? "Prossima domanda" : "Vedi il risultato"}</button></div>` : ""}`;
  }
  function computeStars(lv) {
    const r = S.run;
    if (lv.type === "fili") {
      const c = r.col;
      const regola = !!(c && c.funziona && !c.issues.length && !r.chkIss.length && (!lv.shop || (r.shop && r.shop.ok)));
      return [!!r.safeStar, regola, !!r.firstOk];
    }
    if (lv.type === "indagine") { const s = r.ind; return [s.trips <= 3, s.chi === "lavat", !!(s.cosa != null && lv.ind.cosa[s.cosa].ok)]; }
    if (lv.type === "guasto") { const b = r.bench, f = lv.faults[b.fi]; return [!b.unsafe && !r.shocked, !!b.proven && b.measures <= f.minMeasures + 3, b.firstDiag === true]; }
    return r.ser.m.slice();
  }
  function starWhy(lv, st) {
    const r = S.run;
    if (lv.type === "fili") {
      return [
        st[0] ? (r.genOff ? "Fuori tensione e verificato. Col generale giù, però, hai lasciato al buio tutta la casa." : "Fuori tensione, segnalato e verificato.") : (r.safMiss.join(" ") || "La procedura non era completa."),
        st[1] ? "Colori, terra, giunzioni: tutto in ordine." : "Il capo ha trovato qualcosa da sistemare.",
        st[2] ? "Il primo collaudo è passato." : "Il primo collaudo non è passato.",
      ];
    }
    if (lv.type === "indagine") {
      const s = r.ind;
      return [st[0] ? `Ci sono voluti ${s.trips} scatti.` : `${s.trips} scatti: col metodo uno alla volta ne bastano due o tre.`, st[1] ? "Era la lavatrice." : "Il colpevole era la lavatrice.", st[2] ? "La protezione è rimasta al suo posto." : "La protezione non si tocca: si ripara l'apparecchio."];
    }
    if (lv.type === "guasto") {
      const b = r.bench, f = lv.faults[b.fi], n = b.measures;
      return [
        st[0] ? "Continuità a linea spenta, riparazione fuori tensione." : r.shocked ? "Hai messo le mani sui fili con la linea accesa." : "Hai misurato la continuità con la linea accesa.",
        st[1] ? `${n} ${n === 1 ? "misura" : "misure"}, e dimostrano la diagnosi.` : !b.proven ? `Diagnosi non dimostrata: ${({ alt: "poteva essere anche un'altra risposta", difetto: "nessuna misura faceva vedere il difetto", tester: "il tester non era stato provato" })[b.gapKind] || "mancava una misura"}.` : `${n} misure. Con il metodo ne bastano circa ${f.minMeasures + 1}.`,
        st[2] ? "Diagnosi giusta al primo colpo." : "La prima diagnosi era sbagliata: prima di dirlo, misura ai due capi.",
      ];
    }
    return MIS.map((m, i) => (st[i] ? "Fatto." : "Non completata: puoi rigiocare."));
  }
  function vEsito(lv) {
    const r = S.run;
    if (!r.stars) {
      r.stars = computeStars(lv);
      const old = prog.done[lv.id] ? prog.done[lv.id].stars : [false, false, false];
      prog.done[lv.id] = { stars: r.stars.map((s, i) => s || old[i]) };
      save();
    }
    const why = starWhy(lv, r.stars);
    const nx = LEVELS[lv.n];
    const words = lv.cards.flatMap(id => CARDS[id].g || []);
    return `<p class="eyebrow">${lv.type === "guasto" ? "Banco guasti" : "Intervento"} ${lvNum(lv)} concluso</p><h1 class="h1">${esc(lv.title)}</h1>
      <div class="stars">${lv.stars.map((name, i) => `<div class="star${r.stars[i] ? " on" : ""}"><span class="dot" aria-hidden="true"></span><b>${esc(name)}</b><span>${esc(why[i])}</span><span class="vh">${r.stars[i] ? "stella presa" : "stella non presa"}</span></div>`).join("")}</div>
      ${r.quiz ? `<p class="muted">Domande dal furgone: ${r.quiz.score} giuste su ${r.quiz.items.length}.</p>` : ""}
      ${words.length ? `<section class="card"><h2 class="h3">Parole nuove</h2><table class="gergo"><thead><tr><th>Tecnico</th><th>In cantiere</th></tr></thead><tbody>${words.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table></section>` : ""}
      <div class="row">${nx ? `<button class="btn btn-p" data-act="open" data-arg="${nx.id}">Prossimo: ${lvNum(nx)} · ${esc(nx.title)}</button>` : `<button class="btn btn-p" data-act="quaderno">Apri il quaderno</button>`}<button class="btn btn-s" data-act="retry">${lv.type === "guasto" ? "Un altro caso" : "Rigioca"}</button><button class="btn btn-s" data-act="home">Mappa</button></div>`;
  }

  /* quaderno */
  function vQuaderno() {
    const tabs = [["schede", "Schede"], ["prontuario", "Prontuario"], ["lessico", "Lessico"]];
    let body;
    if (S.qtab === "prontuario") {
      body = PRONTUARIO.map(p => `<section class="card"><h2 class="h3">${esc(p.t)}</h2>${p.note ? `<p class="muted">${esc(p.note)}</p>` : ""}<table class="ptab"><tbody>${p.rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table></section>`).join("");
    } else if (S.qtab === "lessico") {
      const have = [], miss = [];
      LEVELS.forEach(l => l.cards.forEach(id => (CARDS[id].g || []).forEach(g => (prog.cards.includes(id) ? have : miss).push(g))));
      body = `<section class="card"><p class="muted">A sinistra il termine tecnico, a destra come lo senti dire in cantiere.</p>${have.length ? `<table class="gergo"><thead><tr><th>Tecnico</th><th>In cantiere</th></tr></thead><tbody>${have.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table>` : ""}${miss.length ? `<p class="locked-note">${miss.length} ${miss.length === 1 ? "parola arriva" : "parole arrivano"} con gli interventi che non hai ancora giocato.</p>` : ""}</section>`;
    } else {
      body = LEVELS.map(l => {
        const have = l.cards.filter(id => prog.cards.includes(id));
        return `<section class="parte"><h2 class="eyebrow">${lvNum(l)} · ${esc(l.title)}</h2>${have.length ? have.map(id => `<details class="acc"><summary>${esc(CARDS[id].t)}</summary>${vCard(id, Object.assign({}, CARDS[id], { t: "" }))}</details>`).join("") : `<p class="locked-note">Le schede arrivano quando giochi l'intervento.</p>`}</section>`;
      }).join("");
    }
    return `<h1 class="h1">Quaderno</h1><div class="tabs" role="group" aria-label="Sezioni del quaderno">${tabs.map(([k, t]) => `<button data-act="qtab" data-arg="${k}" aria-pressed="${S.qtab === k}">${t}</button>`).join("")}</div>${body}`;
  }

  function vMain() {
    if (S.screen === "home") return vHome();
    if (S.screen === "quaderno") return vQuaderno();
    const lv = lvCur();
    switch (S.step) {
      case "chiamata": return vChiamata(lv);
      case "teoria": return vTeoria(lv);
      case "quadro": return lv.safety.type === "spina" ? vSpina(lv) : vQuadro(lv);
      case "negozio": return vNegozio(lv);
      case "fili": return vFili(lv);
      case "controllo": return vControllo(lv);
      case "scommessa": return vScommessa(lv);
      case "collaudo": return vCollaudo(lv);
      case "indagine": return vIndagine(lv);
      case "serata": return vSerata(lv);
      case "banco": return vBanco(lv);
      case "furgone": return vFurgone(lv);
      case "esito": return vEsito(lv);
    }
    return "";
  }

  /* ---------- laboratori ---------- */
  const labStops = [];
  function stopLabs() { while (labStops.length) { try { labStops.pop()(); } catch (e) { /* ignora */ } } }
  function keepFocus(el, sel, fn) { const had = el.contains(document.activeElement); fn(); if (had) { const b = el.querySelector(sel); if (b) b.focus(); } }
  const LABS = {
    giro(el) {
      let closed = false;
      function draw() {
        el.innerHTML = `<svg viewBox="0 0 320 150" role="img" aria-label="${closed ? "Giro chiuso: la lampadina è accesa" : "Giro aperto: la lampadina è spenta"}">
          <path class="loop" d="M40,60 V28 H128 M172,28 H278 V56 M278,94 V124 H40 V94"/>
          <rect class="body" x="14" y="60" width="52" height="34" rx="6"/><text class="lsvg-t" x="40" y="81" text-anchor="middle">230 V</text>
          <circle class="cpt" cx="128" cy="28" r="4"/><circle class="cpt" cx="172" cy="28" r="4"/>
          <line class="contact" x1="128" y1="28" x2="${closed ? 170 : 162}" y2="${closed ? 28 : 6}"/>
          ${closed ? `<circle class="glow" cx="278" cy="75" r="32"/>` : ""}<circle class="bulb${closed ? " on" : ""}" cx="278" cy="75" r="18"/>
          ${closed && !RM() ? `<path class="flow" d="M40,60 V28 H278 V124 H40 Z"/>` : ""}
          <text class="lsvg-tt" x="150" y="50" text-anchor="middle">interruttore</text><text class="lsvg-tt" x="278" y="144" text-anchor="middle">lampadina</text></svg>
          <button class="btn btn-s" data-x="t">${closed ? "Apri l'interruttore" : "Chiudi l'interruttore"}</button>
          <p class="labout">${closed ? "Giro chiuso: la corrente passa ovunque e la lampadina si accende. In alternata il verso cambia 50 volte al secondo, ma il giro è lo stesso." : "Giro aperto: la corrente si ferma in tutto il circuito, non solo dopo l'interruttore."}</p>`;
        el.querySelector("[data-x=t]").onclick = () => { closed = !closed; keepFocus(el, "[data-x=t]", draw); };
      }
      draw();
    },
    watt(el) {
      const APP = [["Lampadina LED", 9], ["Caricatore", 20], ["TV", 100], ["Frigorifero", 150], ["Phon", 1800], ["Forno", 2000], ["Stufetta", 2000], ["Bollitore", 2300]];
      const on = new Set([7]);
      function draw(fi) {
        const W = [...on].reduce((t, i) => t + APP[i][1], 0), A = W / 230;
        el.innerHTML = `<p class="muted">Accendi gli apparecchi che stanno sulla stessa linea.</p>
          <div class="chips">${APP.map(([n, w], i) => `<button class="chip" data-i="${i}" aria-pressed="${on.has(i)}">${esc(n)}<small>${fmtW(w)}</small></button>`).join("")}</div>
          <div><span class="big">${fmt(A, 1)} A</span> <span class="muted">= ${fmtW(W)} ÷ 230 V</span></div>
          <div class="meters">${meterRow("Linea luci, C10", A, 10, " A")}${meterRow("Linea prese, C16", A, 16, " A")}${meterRow("Contatore da 3 kW (3,3 kW)", W / 1000, 3.3, " kW")}</div>`;
        el.querySelectorAll("[data-i]").forEach(b => { b.onclick = () => { const i = +b.dataset.i; if (on.has(i)) on.delete(i); else on.add(i); draw(i); }; });
        if (fi != null) { const b = el.querySelector(`[data-i="${fi}"]`); if (b) b.focus(); }
      }
      draw();
    },
    joule(el) {
      const R = [0.002, 0.01, 0.05, 0.1, 0.2, 0.5];
      const D = ["Morsetto stretto bene: è appena tiepido.", "Si scalda appena.", "Dopo un'ora di bollitore scotta al tatto.", "Come una lampadina LED chiusa in un millimetro di plastica: la presa annerisce.", "La plastica intorno si deforma.", "Come un piccolo saldatore acceso dentro la presa: rischio d'incendio."];
      const I = 2000 / 230;
      el.innerHTML = `<label class="muted" for="lab-joule">Bollitore da 2000 W, circa ${fmt(I, 1)} A. Quanto è stretto il morsetto?</label>
        <input type="range" id="lab-joule" min="0" max="5" step="1" value="3">
        <div class="row" style="justify-content:space-between"><span class="muted">stretto</span><span class="muted">lento</span></div>
        <svg viewBox="0 0 320 84" role="img" aria-label="Il morsetto che si scalda">
          <circle id="jg" cx="160" cy="42" r="38" style="fill:var(--live);opacity:0"/>
          <rect class="body" x="112" y="18" width="96" height="48" rx="6" id="jb"/>
          <circle class="face" cx="160" cy="42" r="15"/><line class="screw" x1="150" y1="52" x2="170" y2="32" style="stroke:var(--ink);stroke-width:2"/>
          <path d="M20,42 H112" style="stroke:var(--w-marrone);stroke-width:7;stroke-linecap:round;fill:none"/><path d="M208,42 H300" style="stroke:var(--copper);stroke-width:5;stroke-linecap:round;fill:none"/></svg>
        <div><span class="big" id="jw"></span> <span class="muted" id="jf"></span></div><p class="labout" id="jt"></p>`;
      const inp = el.querySelector("#lab-joule");
      function upd() {
        const k = +inp.value, P = R[k] * I * I, heat = Math.min(1, P / 38);
        el.querySelector("#jw").textContent = `${fmt(P, P < 1 ? 2 : 1)} W`;
        el.querySelector("#jf").textContent = `= ${fmt(R[k], R[k] < 0.01 ? 3 : R[k] < 0.1 ? 2 : 1)} Ω × ${fmt(I, 1)}²`;
        el.querySelector("#jt").textContent = D[k];
        el.querySelector("#jg").style.opacity = (heat * 0.55).toFixed(2);
        el.querySelector("#jb").style.fill = `color-mix(in srgb, var(--live) ${Math.round(heat * 70)}%, var(--din))`;
      }
      inp.oninput = upd;
      upd();
    },
    alternata(el) {
      const x0 = 14, x1 = 306, mid = 80, amp = 58;
      let d = "";
      for (let i = 0; i <= 120; i++) { const x = x0 + (x1 - x0) * i / 120, y = mid - amp * Math.sin(4 * Math.PI * i / 120); d += (i ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1); }
      const still = RM();
      el.innerHTML = `<svg viewBox="0 0 320 162" role="img" aria-label="La fase oscilla tra più e meno 325 volt, il neutro resta vicino a zero">
          <line x1="14" y1="22" x2="306" y2="22" style="stroke:var(--line);stroke-dasharray:3 4"/><line x1="14" y1="138" x2="306" y2="138" style="stroke:var(--line);stroke-dasharray:3 4"/>
          <line x1="14" y1="80" x2="306" y2="80" style="stroke:var(--w-blu);stroke-width:2.5"/>
          <path d="${d}" style="fill:none;stroke:var(--w-marrone);stroke-width:2.6"/>
          <text class="lsvg-t" x="16" y="16">+325 V</text><text class="lsvg-t" x="16" y="154">−325 V</text><text class="lsvg-t" x="306" y="98" text-anchor="end">neutro ≈ 0 V</text><text class="lsvg-t" x="306" y="16" text-anchor="end">2 cicli = 40 ms</text>
          <line id="ac" x1="0" y1="14" x2="0" y2="146" style="stroke:var(--accent);stroke-width:1.5"/><circle id="ad" r="5" style="fill:var(--accent)"/></svg>
        <div><span class="big" id="av"></span> <span class="muted">la fase rispetto a terra, in questo istante</span></div>
        ${still ? "" : `<div class="row"><button class="btn btn-s" data-x="p">Pausa</button></div>`}
        <p class="labout">${still ? "Fermo sul picco." : "Rallentato circa 100 volte."} Nella realtà la fase fa questo giro 50 volte al secondo.</p>`;
      const ac = el.querySelector("#ac"), ad = el.querySelector("#ad"), av = el.querySelector("#av");
      function put(u) {
        const x = x0 + (x1 - x0) * u, s = Math.sin(4 * Math.PI * u), v = Math.round(325 * s);
        ac.setAttribute("x1", x); ac.setAttribute("x2", x); ad.setAttribute("cx", x); ad.setAttribute("cy", mid - amp * s);
        av.textContent = `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)} V`;
      }
      if (still) { put(0.125); return; }
      let paused = false, raf = 0, t0 = performance.now(), off = 0;
      function frame(now) {
        if (!el.isConnected) return;
        if (!paused) put(((now - t0 + off) / 4000) % 1);
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
      labStops.push(() => cancelAnimationFrame(raf));
      const pb = el.querySelector("[data-x=p]");
      pb.onclick = () => {
        if (paused) { t0 = performance.now(); paused = false; pb.textContent = "Pausa"; }
        else { off += performance.now() - t0; paused = true; pb.textContent = "Riprendi"; }
      };
    },
    diff(el) {
      const SOGLIA = 22, IL = 8.7;
      let leak = 0, tripped = false, msg = "";
      el.innerHTML = `<div class="row" style="align-items:center;gap:14px;flex-wrap:nowrap">
          <div class="mod diff on" id="dm" style="--w:2;cursor:default;flex:none"><span class="lev"><span class="knob"></span></span><span class="io" id="dio">I · ON</span><span class="tbtn">T</span><span class="mlabel">Differenziale</span><span class="msub">30 mA</span></div>
          <div style="min-width:0;display:flex;flex-direction:column;gap:4px;font-size:14.5px"><span>Esce sulla fase: <b id="dl"></b></span><span>Torna dal neutro: <b id="dn"></b></span><span>Differenza: <b id="dd"></b></span></div></div>
        <label class="muted" for="lab-diff">Dispersione verso terra (un apparecchio guasto, o una persona)</label>
        <input type="range" id="lab-diff" min="0" max="40" step="1" value="0">
        <div class="row"><button class="btn btn-s" data-x="t">Premi il tasto T</button><button class="btn btn-s" data-x="r">Riarma</button></div>
        <p class="labout" id="dt" aria-live="polite"></p>`;
      const inp = el.querySelector("#lab-diff");
      function upd() {
        if (!tripped && leak >= SOGLIA) { tripped = true; msg = `Scattato a ${leak} mA. Questo esemplare stacca a ${SOGLIA} mA: ogni differenziale da 30 mA scatta tra 15 e 30.`; }
        const out = tripped ? 0 : IL, back = tripped ? 0 : IL - leak / 1000;
        el.querySelector("#dl").textContent = `${fmt(out, 3)} A`;
        el.querySelector("#dn").textContent = `${fmt(back, 3)} A`;
        el.querySelector("#dd").textContent = tripped ? "0 mA, staccato" : `${leak} mA`;
        const dm = el.querySelector("#dm");
        dm.classList.toggle("on", !tripped); dm.classList.toggle("off", tripped); dm.classList.toggle("trip", tripped);
        el.querySelector("#dio").textContent = tripped ? "O · OFF" : "I · ON";
        el.querySelector("#dt").textContent = msg || (leak ? "Manca qualcosa al ritorno, ma non abbastanza per farlo scattare." : "Quello che esce dalla fase torna tutto dal neutro: nessuna differenza.");
      }
      inp.oninput = () => { leak = +inp.value; if (!tripped) msg = ""; upd(); };
      el.querySelector("[data-x=t]").onclick = () => { if (!tripped) { tripped = true; msg = "Il tasto T crea una piccola dispersione di prova: il differenziale ha staccato, quindi funziona."; } upd(); };
      el.querySelector("[data-x=r]").onclick = () => { if (leak >= SOGLIA) msg = "Non si riarma: la dispersione c'è ancora. Prima togli il guasto."; else { tripped = false; msg = "Riarmato."; } upd(); };
      upd();
    },
    mt(el) {
      const A = [10, 16, 20, 30, 60, 100, 200, 1000];
      const lx = a => 14 + (Math.log(a) - Math.log(8)) / (Math.log(1200) - Math.log(8)) * 292;
      const band = a => a <= 18 ? "Non scatta. È il suo lavoro normale."
        : a < 23.2 ? "Zona grigia: può reggere anche più di un'ora."
          : a < 40.8 ? "Scatta il termico: da qualche decina di secondi a qualche minuto."
            : a < 80 ? "Scatta il termico in pochi secondi."
              : a < 160 ? "Zona del magnetico, curva C (da 5 a 10 volte): può staccare all'istante, altrimenti stacca il termico in un attimo."
                : "Cortocircuito: il magnetico stacca all'istante, in meno di un decimo di secondo.";
      const Z = [[8, 18, "var(--ok)", .35], [18, 23.2, "var(--muted)", .25], [23.2, 80, "var(--warn)", .35], [80, 160, "var(--err)", .3], [160, 1200, "var(--err)", .55]];
      el.innerHTML = `<label class="muted" for="lab-mt">Corrente sulla linea, con un magnetotermico C16</label>
        <input type="range" id="lab-mt" min="0" max="7" step="1" value="1">
        <svg viewBox="0 0 320 76" role="img" aria-label="Scala delle correnti e zone di intervento">
          ${Z.map(([a, b, c, o]) => `<rect x="${lx(a).toFixed(1)}" y="20" width="${(lx(b) - lx(a)).toFixed(1)}" height="18" style="fill:${c};opacity:${o}"/>`).join("")}
          ${[16, 23, 80, 160].map(t => `<line x1="${lx(t).toFixed(1)}" y1="16" x2="${lx(t).toFixed(1)}" y2="42" style="stroke:var(--ink);stroke-width:1"/><text class="lsvg-t" x="${lx(t).toFixed(1)}" y="56" text-anchor="middle">${t} A</text>`).join("")}
          <text class="lsvg-tt" x="${lx(9).toFixed(1)}" y="12">termico</text><text class="lsvg-tt" x="${lx(85).toFixed(1)}" y="12">magnetico</text>
          <path id="mk" d="M0,0" style="fill:var(--ink)"/></svg>
        <div><span class="big" id="ma"></span> <span class="muted" id="mx"></span></div><p class="labout" id="mtt"></p>`;
      const inp = el.querySelector("#lab-mt");
      function upd() {
        const a = A[+inp.value], x = lx(a);
        el.querySelector("#mk").setAttribute("d", `M${x.toFixed(1)},62 l-6,10 h12 z`);
        el.querySelector("#ma").textContent = `${a.toLocaleString("it-IT")} A`;
        el.querySelector("#mx").textContent = `= ${fmt(a / 16, a / 16 < 10 ? 2 : 0)} volte 16 A`;
        el.querySelector("#mtt").textContent = band(a);
      }
      inp.oninput = upd;
      upd();
    },
  };
  function mountLabs() { app.querySelectorAll("[data-lab]").forEach(el => { const f = LABS[el.dataset.lab]; if (f) f(el); }); }

  /* ---------- azioni ---------- */
  let toastT = null;
  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.hidden = true; }, 3200);
  }
  function scrollToId(id) { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: "center", behavior: RM() ? "auto" : "smooth" }); }

  const ACTS = {
    home() { S.screen = "home"; S.lv = null; S.step = null; S.run = null; S.confirmReset = false; render(true); },
    quaderno() { S.screen = "quaderno"; render(true); },
    backLevel() { S.screen = "level"; render(true); },
    open(id) { openLevel(id); },
    locked() { toast("Prima finisci l'intervento precedente di questo capitolo, oppure sblocca tutti in fondo alla pagina."); },
    next() { nextStep(); },
    toFili() { const r = S.run; r.sel = null; r.selWire = null; r.msg = null; goStep("fili"); },
    cardNext() { if (S.run.card < lvCur().cards.length - 1) S.run.card++; render(true); },
    cardPrev() { if (S.run.card > 0) S.run.card--; render(true); },
    brk(id) { const s = S.run.saf; s.br[id] = s.br[id] ? 0 : 1; s.meas = {}; s.reading = null; s.lastProbe = null; render(); },
    wall() { const s = S.run.saf; s.wall = s.wall ? 0 : 1; s.meas = {}; s.reading = null; s.lastProbe = null; render(); },
    tag() { S.run.saf.tag = !S.run.saf.tag; render(); },
    tprova() {
      const s = S.run.saf;
      if (!s.br.gen) { s.tmsg = "Col generale giù non c'è nessuna presa viva: il tester si prova prima di staccare, oppure stacchi solo la linea giusta."; s.reading = null; s.lastProbe = null; }
      else { s.tmsg = null; s.tProv = true; s.reading = 230; s.lastProbe = "presa viva: il tester funziona"; }
      render();
    },
    probe(i) {
      const lv = lvCur(), s = S.run.saf, p = lv.safety.probes[+i], v = probeRead(lv, p);
      s.reading = v; s.lastProbe = p.label;
      if ((p.a === "R" || p.b === "R") && lv.safety.wall && !s.wall) { s.tmsg = "Con l'interruttore a muro spento il ritorno segna 0 V comunque: accendilo e rimisura."; delete s.meas[i]; }
      else { s.tmsg = null; s.meas[i] = v; }
      render();
    },
    plug() { const s = S.run.saf; s.plugged = !s.plugged; render(); },
    work() {
      const lv = lvCur(), r = S.run, s = r.saf;
      if (lv.safety.type === "spina") {
        if (s.plugged) { s.shock = true; r.shocked = true; render(); scrollToId("shock"); return; }
        r.safeStar = !r.shocked;
        r.safMiss = r.shocked ? ["Hai preso la scossa: la spina era ancora inserita."] : [];
        s.shock = false; nextStep(); return;
      }
      if (condLive(lv, "L")) { s.shock = true; r.shocked = true; render(); scrollToId("shock"); return; }
      const allZero = lv.safety.probes.every((p, i) => s.meas[i] === 0);
      const miss = [];
      if (r.shocked) miss.push("Hai preso la scossa prima di togliere tensione alla linea giusta.");
      if (!s.tag) miss.push("Non hai messo il cartello sul quadro.");
      if (!s.tProv) miss.push("Non hai provato il tester su una presa viva.");
      if (!allZero) miss.push("Non hai misurato tutte le coppie di fili dopo aver staccato.");
      r.safeStar = !miss.length; r.safMiss = miss; r.genOff = !s.br.gen;
      s.shock = false;
      nextStep();
    },
    shopSel(i) { const st = S.run.shop; i = +i; st.sel = st.sel.includes(i) ? st.sel.filter(x => x !== i) : st.sel.concat(i); render(); },
    shopDone() { const lv = lvCur(), st = S.run.shop; st.done = true; st.ok = lv.shop.opts.every((o, i) => o.ok === st.sel.includes(i)); render(); },
    tapT(id) { tapNode(lvCur(), "t:" + id); },
    tapC(cid) { tapNode(lvCur(), "c:" + cid); },
    selCancel() { const r = S.run; r.sel = null; r.msg = null; render(); },
    color(k) { S.run.color = k; render(); },
    sec(v) { S.run.sec = +v; render(); },
    wcolor(k) { const r = S.run, w = r.wires[r.selWire]; if (!w || w.capo || w.color === k) return; snapshot(); w.color = k; r.msg = { t: `Ora il filo è ${WIRES[k].label}.`, k: "ok" }; render(); },
    wsec(v) { const r = S.run, w = r.wires[r.selWire]; v = +v; if (!w || w.capo || w.sec === v) return; snapshot(); w.sec = v; r.msg = { t: `Ora il filo è da ${fmt(v)} mm².`, k: "ok" }; render(); },
    wdel() { const r = S.run; if (r.selWire == null || !r.wires[r.selWire]) return; const w = r.wires[r.selWire]; snapshot(); r.wires.splice(r.selWire, 1); r.selWire = null; r.msg = { t: w.capo ? `Staccato: il filo ${WIRES[w.color].label} è di nuovo libero.` : "Filo tolto.", k: "ok" }; render(); },
    wdone() { const r = S.run; r.selWire = null; r.msg = null; render(); },
    undo() { const r = S.run; if (!r.hist.length) return; r.wires = JSON.parse(r.hist.pop()); r.selWire = null; r.sel = null; r.msg = { t: "Annullato.", k: "ok" }; render(); },
    clear() { const r = S.run; if (!r.wires.length) return; snapshot(); r.wires = []; r.selWire = null; r.sel = null; r.msg = { t: "Tavola vuota. Con «Annulla» torna com'era.", k: "ok" }; render(); },
    zoom() { S.run.zoom = !S.run.zoom; render(); },
    hint() { const lv = lvCur(), r = S.run; r.hint = (r.hint + 1) % lv.hints.length; render(); },
    chk(i) { const r = S.run; i = +i; r.checks = r.checks.includes(i) ? r.checks.filter(x => x !== i) : r.checks.concat(i); render(); },
    bet(k) { S.run.bet = k; render(); },
    power() { doPower(lvCur()); },
    toggleSw(id) {
      const r = S.run;
      r.pst[id] = r.pst[id] ? 0 : 1;
      if (S.step === "banco") {
        const lv = lvCur(), b = r.bench;
        if (b.on) { const t = powerCheck(benchSetup(lv), r.pst); if (t) { b.on = false; b.tripped = t; b.log.push({ t: `Giri il comando: scatta ${t === "corto" ? "il magnetotermico" : "il differenziale"}.`, k: "bad" }); } else seeLight(b); }
        logMeasure(lv);
      }
      render();
    },
    /* banco guasti */
    setFault(i) { const lv = lvCur(); S.run.bench = newBench(lv, +i); S.run.pst = {}; render(); },
    lineTog() { const lv = lvCur(); benchPower(lv, !S.run.bench.on); logMeasure(lv); render(); },
    lineOn() { const lv = lvCur(); benchPower(lv, true); logMeasure(lv); render(); },
    lineOff() { const lv = lvCur(); benchPower(lv, false); logMeasure(lv); render(); },
    meterMode(m) { const lv = lvCur(); S.run.bench.mode = m === "ohm" ? "ohm" : "V"; logMeasure(lv); render(); },
    probesOff() { const b = S.run.bench; b.probes = []; b.lastKey = null; render(); },
    /* prova del tester su una presa che sai viva, prima di fidarti delle letture */
    testerProva() { const b = S.run.bench; b.tester = true; b.log.push({ t: "Prova del tester su una presa viva: 230 V. Puntali uniti: suona. Il tester funziona.", k: "good" }); render(); },
    probeT(id) {
      const lv = lvCur(), b = S.run.bench;
      if (b.probes[0] === id) b.probes = [];
      else if (b.probes[1] === id) b.probes = [b.probes[0]];
      else if (b.probes.length < 2) b.probes.push(id);
      else b.probes = [b.probes[0], id];
      logMeasure(lv);
      render();
    },
    diagOpen() { S.run.bench.diagOpen = true; render(); scrollToId("diag"); },
    diagPick(id) {
      const lv = lvCur(), b = S.run.bench, truth = curFault(), ok = id === truth.id;
      if (b.firstDiag == null) b.firstDiag = ok;
      if (ok) {
        // dimostrata: niente altro si accorda con chiamata, fili, luce vista e misure; una misura fa vedere il difetto; tester provato
        const c = checkProof(lv, truth, { obs: b.obs, seen: b.seen, tester: b.tester });
        b.proven = c.proven;
        b.gaps = proofGaps(c);
        b.gapKind = c.alt.length ? "alt" : c.noDefect ? "difetto" : "tester";
      } else b.why = contradiction(lv, truth, lv.faults.find(x => x.id === id), b.obs, b.seen);
      b.diag = { id, ok };
      b.diagOpen = !ok;
      render();
      scrollToId("diagres");
    },
    repair() {
      const r = S.run, b = r.bench;
      if (curFault().none) return;
      if (b.on) { b.shock = true; r.shocked = true; render(); scrollToId("shock"); return; }
      b.repaired = true; b.shock = false; b.probes = []; b.lastKey = null;
      b.log.push({ t: `Riparato: ${curFault().where}.`, k: "good" });
      render();
    },
    ans(i) { const q = S.run.quiz; if (q.ans != null) return; q.ans = +i; if (q.ans === q.items[q.i].q.ok) q.score++; render(); },
    qnext() { const q = S.run.quiz; if (q.i < q.items.length - 1) { q.i++; q.ans = null; render(true); } else nextStep(); },
    free() { prog.free = !prog.free; save(); render(); },
    resetAsk() { S.confirmReset = true; render(); },
    resetYes() { prog = freshProg(); save(); S.confirmReset = false; render(true); },
    resetNo() { S.confirmReset = false; render(); },
    qtab(k) { S.qtab = k; render(); },
    retry() { openLevel(S.lv); },
    indBet(i) { const lv = lvCur(), s = S.run.ind; s.bet = +i; s.ph = "look"; prog.bets.tot++; if (+i === lv.ind.bet.ok) prog.bets.won++; save(); render(true); },
    indLook() { S.run.ind.ph = "look"; render(true); },
    indT() {
      const s = S.run.ind;
      if (!s.br.diff || !s.br.gen) s.log.push({ t: "Premi il tasto T, ma il differenziale (o il generale) è già giù: prima riarma.", k: "" });
      else { s.br.diff = 0; s.tripped = true; s.log.push({ t: "Premi il tasto T: il differenziale stacca. Funziona.", k: "good" }); }
      render();
    },
    indDone() { S.run.ind.ph = "chi"; render(true); },
    indChi(id) { const s = S.run.ind; s.chi = id; s.ph = "cosa"; render(true); },
    indCosa(i) { const s = S.run.ind; s.cosa = +i; s.ph = "caso"; render(true); },
    indBrk(id) {
      const lv = lvCur(), d = lv.ind, s = S.run.ind, b = d.breakers.find(x => x.id === id);
      const name = b.kind === "diff" ? "il differenziale" : b.kind === "gen" ? "il generale" : `il magnetotermico ${b.label}`;
      if (s.br[id]) {
        s.br[id] = 0;
        if (id === "diff") s.tripped = false;
        s.log.push({ t: `Abbassi ${name}.`, k: "" });
      } else {
        s.br[id] = 1;
        const live = s.br.diff && s.br.gen;
        if (live && indLeak(lv) >= d.soglia) {
          s.br.diff = 0; s.tripped = true; s.trips++;
          s.log.push({ t: id === "diff" ? "Riarmi il differenziale: scatta subito." : `Rialzi ${name}: scatta il differenziale.`, k: "bad" });
        } else if (id === "diff") {
          s.tripped = false;
          s.log.push({ t: s.br.gen ? "Riarmi il differenziale: regge." : "Riarmi il differenziale (il generale è giù).", k: s.br.gen ? "good" : "" });
        } else s.log.push({ t: `Rialzi ${name}.`, k: "" });
      }
      render();
    },
    indPlug(id) {
      const lv = lvCur(), d = lv.ind, s = S.run.ind, a = d.apps.find(x => x.id === id);
      if (s.plug[id]) { s.plug[id] = 0; s.log.push({ t: `Stacchi ${a.a}.`, k: "" }); }
      else {
        s.plug[id] = 1;
        const live = s.br.diff && s.br.gen && s.br[a.line];
        if (live && indLeak(lv) >= d.soglia) { s.br.diff = 0; s.tripped = true; s.trips++; s.log.push({ t: `Riattacchi ${a.a}: scatta il differenziale.`, k: "bad" }); }
        else s.log.push({ t: `Riattacchi ${a.a}${live ? ": regge." : "."}`, k: live ? "good" : "" });
      }
      render();
    },
    serK(k) { const s = S.run.ser; s.k = +k; s.overSince = null; render(); },
    serApp(id) { const s = S.run.ser; s.on[id] = !s.on[id]; render(); },
    serReset() { const s = S.run.ser; s.black = false; s.overSince = null; render(); },
  };

  /* ---------- rendering ---------- */
  function focusKey() {
    const ae = document.activeElement;
    if (!ae || !app.contains(ae) || !ae.dataset) return null;
    for (const k of ["act", "t", "tip", "w"]) if (ae.dataset[k] != null) return [k, ae.dataset[k], ae.dataset.arg];
    return null;
  }
  function render(top) {
    const key = focusKey();
    stopLabs();
    app.innerHTML = vHeader() + `<main class="shell">${vMain()}</main>`;
    const bar = app.querySelector(".bar");
    document.documentElement.style.setProperty("--barh", (bar ? bar.offsetHeight : 0) + "px");
    if (document.getElementById("sheet")) app.querySelector(".shell").classList.add("has-sheet");
    mountLabs();
    if (S.screen === "level" && S.step === "serata") startSerata(); else stopSerata();
    if (S.screen === "level" && S.step === "fili") { revealSel(); armSheetTimer(); }
    if (top) window.scrollTo(0, 0);
    else if (key) {
      const [k, v, arg] = key, q = s => String(s).replace(/"/g, '\\"');
      let sel = `[data-${k}="${q(v)}"]`;
      if (k === "act" && arg != null) sel += `[data-arg="${q(arg)}"]`;
      const el = app.querySelector(sel);
      if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
    }
  }

  /* clic sui bottoni, sui fili e sullo sfondo della tavola */
  app.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (el && app.contains(el)) {
      if (el.disabled) return;
      const f = ACTS[el.dataset.act];
      if (f) { e.preventDefault(); f(el.dataset.arg); }
      return;
    }
    if (!S.run || S.screen !== "level" || S.step !== "fili" || Date.now() - lastUp < 450) return;
    const r = S.run, lk = e.target.closest("[data-locked]");
    if (lk && app.contains(lk)) { const c = compById(lvCur(), lk.dataset.locked); r.sel = null; r.selWire = null; r.msg = { t: c.lockedMsg || "Questo è già collegato.", k: "ok" }; render(); return; }
    const w = e.target.closest("[data-w]");
    if (w && app.contains(w)) { const i = +w.dataset.w; r.sel = null; r.msg = null; r.selWire = r.selWire === i ? null : i; r.reveal = r.selWire != null; render(); return; }
    if (e.target.closest(".board svg") && (r.sel || r.selWire != null || r.msg)) { r.sel = null; r.selWire = null; r.msg = null; render(); }
  });
  app.addEventListener("keydown", e => {
    const fili = S.run && S.screen === "level" && S.step === "fili";
    if (e.key === "Escape" && fili) { const r = S.run; if (r.sel || r.selWire != null) { r.sel = null; r.selWire = null; r.msg = null; render(); } return; }
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target;
    if (fili && t.dataset && (t.dataset.t || t.dataset.tip)) { e.preventDefault(); tapNode(lvCur(), t.dataset.t ? "t:" + t.dataset.t : "c:" + t.dataset.tip); return; }
    if (fili && t.dataset && t.dataset.locked) { e.preventDefault(); const r = S.run, c = compById(lvCur(), t.dataset.locked); r.sel = null; r.selWire = null; r.msg = { t: c.lockedMsg || "Questo è già collegato.", k: "ok" }; render(); return; }
    if (fili && t.dataset && t.dataset.w != null) { e.preventDefault(); const r = S.run, i = +t.dataset.w; r.sel = null; r.msg = null; r.selWire = r.selWire === i ? null : i; r.reveal = r.selWire != null; render(); return; }
    const el = t.closest && t.closest('[data-act][role="button"]');
    if (!el || el.tagName === "BUTTON") return;
    e.preventDefault();
    const f = ACTS[el.dataset.act];
    if (f) f(el.dataset.arg);
  });

  /* trascinamento con dito, mouse o penna */
  app.addEventListener("pointerdown", e => {
    if (!S.run || S.screen !== "level" || S.step !== "fili" || drag) return;
    const el = e.target.closest && e.target.closest("[data-t],[data-tip],[data-grip]");
    if (!el || !app.contains(el)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const lv = lvCur(), svg = el.ownerSVGElement;
    let key = null, src;
    if (el.dataset.grip) { const [i, end] = el.dataset.grip.split(":"); src = { kind: "grip", i: +i, end }; }
    else { key = el.dataset.t ? "t:" + el.dataset.t : "c:" + el.dataset.tip; src = srcFromKey(lv, key); }
    e.preventDefault();
    try { svg.setPointerCapture(e.pointerId); } catch (x) { /* ignora */ }
    drag = { pid: e.pointerId, svg, key, src, x0: e.clientX, y0: e.clientY, moved: false, err: sourceError(lv, src), target: null, hoverErr: null };
  });
  app.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.pid) return;
    drag.cx = e.clientX; drag.cy = e.clientY;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 7) return;
      drag.moved = true;
      if (!drag.err) startLive();
    }
    if (drag.err) return;
    e.preventDefault();
    moveLive(e);
  });
  app.addEventListener("pointerup", e => { if (drag && e.pointerId === drag.pid) endDrag(false); });
  app.addEventListener("pointercancel", e => { if (drag && e.pointerId === drag.pid) endDrag(true); });
  app.addEventListener("touchmove", e => { if (drag) e.preventDefault(); }, { passive: false });

  /* ---------- avvio (con ripresa dopo un aggiornamento della pagina) ---------- */
  function boot(data) {
    try {
      if (data && data.S && data.S.screen) {
        S = data.S;
        if (S.screen === "level" && S.step === "collaudo" && S.run && S.run.wires) S.run.col = collaudo(lvCur(), S.run.wires);
      }
    } catch (e) { S = { screen: "home", lv: null, step: null, run: null, qtab: "schede", confirmReset: false }; }
    render(false);
  }
  const hot = window.claude && window.claude.hot;
  try { if (hot && hot.snapshot) hot.snapshot(() => ({ S: JSON.parse(JSON.stringify(S, (k, v) => (typeof v === "function" ? undefined : v))) })); } catch (e) { /* ignora */ }
  if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {});
  window.__fnt = { ACTS, get S() { return S; }, render, LABS, LEVELS, CARDS, probePoints };
}
