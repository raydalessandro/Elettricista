/* ====== DISEGNO DEI FILI ======
   Un filo è una curva morbida tra due morsetti, che entra nel morsetto dalla parte giusta
   (dal basso; dall'alto per le lampade a soffitto). Tra le curve possibili si sceglie la più
   semplice che non passa sopra morsetti, scritte o pezzi che non sono suoi: guardando la tavola
   deve essere chiaro dove arriva ogni filo, perché nel banco guasti guardare è già una prova.
   Lo usano il gioco (disegno) e il controllo S18 dello standard. */

import { termIds } from "./engine";
import { RULES } from "./rules";
import type { Board, Comp } from "./types";

export interface Pt {
  x: number;
  y: number;
}

export interface WireGeom {
  d: string;
  p1: Pt;
  p2: Pt;
  c1: Pt;
  c2: Pt;
}

interface GeoLevel {
  board: Board;
}

const W = 360;
const f1 = (v: number) => v.toFixed(1);
const geom = (p1: Pt, c1: Pt, c2: Pt, p2: Pt): WireGeom => ({
  d: `M${f1(p1.x)},${f1(p1.y)} C${f1(c1.x)},${f1(c1.y)} ${f1(c2.x)},${f1(c2.y)} ${f1(p2.x)},${f1(p2.y)}`,
  p1,
  p2,
  c1,
  c2,
});
const sagOf = (x1: number, y1: number, x2: number, y2: number) => Math.min(56, 14 + Math.hypot(x2 - x1, y2 - y1) * 0.22);
const clampY = (y: number, H: number) => Math.max(6, Math.min(y, H - 6));
const clampX = (x: number) => Math.max(4, Math.min(x, W - 4));

/** La curva semplice: maniglie verticali verso dove il filo entra nel morsetto, o a «S» per i fili che escono da un cavo. */
export function wgeom(x1: number, y1: number, x2: number, y2: number, H: number, stub: boolean, d1 = 1, d2 = 1): WireGeom {
  if (stub) {
    const my = (y1 + y2) / 2;
    return geom({ x: x1, y: y1 }, { x: x1, y: my }, { x: x2, y: my }, { x: x2, y: y2 });
  }
  const sag = sagOf(x1, y1, x2, y2);
  return geom({ x: x1, y: y1 }, { x: x1, y: clampY(y1 + d1 * sag, H) }, { x: x2, y: clampY(y2 + d2 * sag, H) }, { x: x2, y: y2 });
}

/* ---------- ostacoli: cosa un filo non deve coprire ---------- */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface TermSpot {
  id: string;
  comp: string;
  x: number;
  y: number;
}
interface LabelBox extends Box {
  term: string;
}
interface BodyBox extends Box {
  comp: string;
  /** il corpo conta anche per i fili del pezzo stesso (la cupola della plafoniera) */
  always?: boolean;
}
interface Obstacles {
  terms: TermSpot[];
  labels: LabelBox[];
  bodies: BodyBox[];
  texts: Box[];
  /** segni sottili da non coprire se si può (le parentesi delle coppie dell'invertitore) */
  marks: Box[];
  /** i fili già posati (fissi e visibili), in una griglia: un filo nuovo non ci corre sopra */
  along: Map<string, Pt[]>;
}

const CELL = 8;
const cellOf = (x: number, y: number) => `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;

/** Punti lungo un percorso SVG semplice (M, L, H, V, C assoluti), come quelli dei fili fissi. */
export function pathPoints(d: string): Pt[] {
  const out: Pt[] = [];
  let cur: Pt = { x: 0, y: 0 };
  const lineTo = (q: Pt) => {
    const n = Math.max(1, Math.ceil(Math.hypot(q.x - cur.x, q.y - cur.y) / 5));
    for (let i = 1; i <= n; i++) out.push({ x: cur.x + ((q.x - cur.x) * i) / n, y: cur.y + ((q.y - cur.y) * i) / n });
    cur = q;
  };
  const re = /([MLHVC])([^MLHVC]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const n = (m[2].match(/-?\d*\.?\d+/g) || []).map(Number);
    if (m[1] === "M") {
      cur = { x: n[0], y: n[1] };
      out.push(cur);
    } else if (m[1] === "L") lineTo({ x: n[0], y: n[1] });
    else if (m[1] === "H") lineTo({ x: n[0], y: cur.y });
    else if (m[1] === "V") lineTo({ x: cur.x, y: n[0] });
    else if (m[1] === "C") {
      const g = geom(cur, { x: n[0], y: n[1] }, { x: n[2], y: n[3] }, { x: n[4], y: n[5] });
      out.push(...sample(g, 16), g.p2);
      cur = g.p2;
    }
  }
  return out;
}

/** etichetta di un morsetto come la disegna il gioco (vedi termSVG) */
function termLabelBox(c: Comp, t: string, p: Pt): Box | null {
  if (c.kind === "morsetto" || c.kind === "capo" || c.kind === "sorgente") return null;
  if (c.kind === "presa") return t === "PE" ? { x: p.x - 6, y: p.y - 22, w: 12, h: 12 } : { x: p.x - 12, y: p.y - 22, w: 24, h: 12 };
  // sulle lampade la scritta sta a sinistra del morsetto: i fili arrivano dall'alto o dal basso e non la coprono
  if (c.kind === "lampada") return { x: p.x - 18, y: p.y - 7, w: 10, h: 13 };
  const label = (c.tlabel && c.tlabel[t]) || t;
  return { x: p.x + 8, y: p.y - 7, w: 6.4 * label.length + 3, h: 13 };
}

function bodiesOf(c: Comp): BodyBox[] {
  const x = c.x || 0,
    y = c.y || 0;
  switch (c.kind) {
    // comandi e prese hanno i morsetti fuori dal corpo: nessun filo, nemmeno il loro, ci passa sopra
    case "interruttore":
    case "deviatore":
      return [{ comp: c.id, x, y, w: 96, h: 56, always: true }];
    case "invertitore":
      return [{ comp: c.id, x, y, w: 140, h: 56, always: true }];
    case "presa":
      return [{ comp: c.id, x, y, w: 100, h: 60, always: true }];
    case "morsetto":
      return [{ comp: c.id, x, y: y - 7, w: (c.slots || 0) * 30, h: 35 }];
    case "lampada": {
      const top = !!c.top,
        sy = top ? y : y + 66,
        oy = top ? y + 30 : y;
      return [
        { comp: c.id, x, y: sy, w: 100, h: 24 },
        { comp: c.id, x: x + 8, y: oy, w: 84, h: top ? 40 : 62, always: true },
      ];
    }
  }
  return [];
}

const obsCache = new WeakMap<Board, Obstacles>();
function obstaclesOf(lv: GeoLevel): Obstacles {
  const hit = obsCache.get(lv.board);
  if (hit) return hit;
  const o: Obstacles = { terms: [], labels: [], bodies: [], texts: [], marks: [], along: new Map() };
  for (const c of lv.board.comps) {
    if (c.kind === "sorgente" || c.kind === "capo") continue;
    o.bodies.push(...bodiesOf(c));
    if (c.locked) continue;
    for (const t of termIds(c)) {
      const id = c.id + "." + t,
        p = RULES.tpos(lv, id);
      o.terms.push({ id, comp: c.id, x: p.x, y: p.y });
      const lb = termLabelBox(c, t, p);
      if (lb) o.labels.push({ ...lb, term: id });
    }
    if (c.kind === "invertitore") {
      // le parentesi delle coppie 1-2 e 3-4, sotto i morsetti (sopra, se è capovolto): segni da lasciare leggibili
      const x = c.x || 0,
        by = c.flip ? (c.y || 0) - 43 : (c.y || 0) + 91;
      o.marks.push({ x: x + 19, y: by, w: 24, h: 8 }, { x: x + 87, y: by, w: 24, h: 8 });
    }
  }
  for (const z of lv.board.zones || []) o.texts.push({ x: z.x + 8, y: z.y + 6, w: z.label.length * 7.6 + 4, h: 14 });
  for (const k of lv.board.cables || []) o.texts.push({ x: k.x, y: k.y, w: k.w, h: k.h });
  for (const f of (lv.board.fixed || []).filter(k => k.vis)) {
    const p2 = RULES.tpos(lv, f.b),
      p1 = f.from || RULES.tpos(lv, f.a);
    const pts = f.d ? pathPoints(f.d) : sample(wgeom(p1.x, p1.y, p2.x, p2.y, lv.board.h, !!f.from, 1, RULES.tdir(lv, f.b)), 30);
    for (const p of pts) {
      const k = cellOf(p.x, p.y);
      const list = o.along.get(k);
      if (list) list.push(p);
      else o.along.set(k, [p]);
    }
  }
  obsCache.set(lv.board, o);
  return o;
}

const inBox = (p: Pt, b: Box, m = 0) => p.x >= b.x - m && p.x <= b.x + b.w + m && p.y >= b.y - m && p.y <= b.y + b.h + m;

function sample(g: WireGeom, n: number): Pt[] {
  const out: Pt[] = [];
  const { p1, c1, c2, p2 } = g;
  for (let i = 1; i < n; i++) {
    const t = i / n,
      u = 1 - t;
    const a = u * u * u,
      b = 3 * u * u * t,
      c = 3 * u * t * t,
      d = t * t * t;
    out.push({ x: a * p1.x + b * c1.x + c * c2.x + d * p2.x, y: a * p1.y + b * c1.y + c * c2.y + d * p2.y });
  }
  return out;
}

/** il punto corre sopra un filo già posato? */
function nearFixed(o: Obstacles, p: Pt): boolean {
  const cx = Math.floor(p.x / CELL),
    cy = Math.floor(p.y / CELL);
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) for (const q of o.along.get(`${cx + i},${cy + j}`) || []) if (Math.hypot(p.x - q.x, p.y - q.y) < 6) return true;
  return false;
}

/* ---------- i fili già disegnati, mentre si posano gli altri ---------- */

interface LaidPt {
  p: Pt;
  wire: number;
  color?: string;
}
/** I fili già posati sulla tavola: un filo nuovo li incrocia, ma non ci corre sopra e non passa dove già se ne incrociano due. */
interface Layer {
  grid: Map<string, LaidPt[]>;
  knots: Pt[];
}
const newLayer = (): Layer => ({ grid: new Map(), knots: [] });

function nearLaid(layer: Layer, p: Pt, r: number): LaidPt | null {
  const cx = Math.floor(p.x / CELL),
    cy = Math.floor(p.y / CELL);
  let best: LaidPt | null = null,
    bd = r;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (const q of layer.grid.get(`${cx + i},${cy + j}`) || []) {
        const d = Math.hypot(p.x - q.p.x, p.y - q.p.y);
        if (d < bd) {
          bd = d;
          best = q;
        }
      }
  return best;
}

function lay(layer: Layer, g: WireGeom, wire: number, color?: string) {
  const pts = sample(g, 40);
  for (const p of pts) {
    // dove questo filo ne incrocia uno già posato nasce un nodo: un terzo filo lì non si leggerebbe
    if (nearLaid(layer, p, 4) && !layer.knots.some(k => Math.hypot(k.x - p.x, k.y - p.y) < 8)) layer.knots.push(p);
  }
  for (const p of pts) {
    const k = cellOf(p.x, p.y);
    const list = layer.grid.get(k);
    const e = { p, wire, color };
    if (list) list.push(e);
    else layer.grid.set(k, [e]);
  }
}

/** quanto un filo «sporca» il disegno: morsetti altrui coperti, scritte, pezzi attraversati, fili seguiti da vicino */
const NEAR = 13;
interface Hits {
  terms: Set<string>;
  labels: Set<string>;
  bodies: Set<string>;
  score: number;
  /** per le prove: da dove viene il punteggio */
  why: Record<string, number>;
}
function hitsOf(lv: GeoLevel, a: string, b: string, g: WireGeom, H: number, layer?: Layer, color?: string): Hits {
  const o = obstaclesOf(lv);
  const own = new Set([a.split(".")[0], b.split(".")[0]]);
  const pts = sample(g, 40);
  const h: Hits = { terms: new Set(), labels: new Set(), bodies: new Set(), score: 0, why: {} };
  const pen = (k: string, v: number) => {
    h.score += v;
    h.why[k] = (h.why[k] || 0) + v;
  };
  let len = 0,
    prev = g.p1,
    run = 0,
    runL = 0,
    same = false;
  // incrociare un filo va bene; corrergli sopra no: conta solo un tratto lungo vicino a lui (più corto, se è dello stesso colore)
  const endRun = () => {
    if (run > 4) pen("fisso", (run - 4) * 25);
    run = 0;
  };
  const endRunL = () => {
    const lim = same ? 2 : 4;
    if (runL > lim) pen("filo", (runL - lim) * 12);
    runL = 0;
    same = false;
  };
  for (const p of pts) {
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
    for (const t of o.terms) {
      if (t.id === a || t.id === b) continue;
      const d = Math.hypot(p.x - t.x, p.y - t.y);
      if (d < NEAR) {
        h.terms.add(t.id);
        pen("morsetto", 400);
      } else if (d < NEAR + 5) pen("vicino", 15);
    }
    for (const l of o.labels)
      if (inBox(p, l, 4)) {
        h.labels.add(l.term);
        pen("scritta", 60);
      }
    for (const k of o.bodies)
      if ((k.always || !own.has(k.comp)) && inBox(p, k)) {
        h.bodies.add(k.comp);
        pen("pezzo", 30);
      }
    for (const t of o.texts) if (inBox(p, t, 4)) pen("zona", 25);
    for (const t of o.marks) if (inBox(p, t, 1)) pen("segno", 30);
    if (nearFixed(o, p)) run++;
    else endRun();
    if (layer) {
      const q = nearLaid(layer, p, 7);
      if (q) {
        runL++;
        if (color && q.color === color) same = true;
      } else endRunL();
      if (layer.knots.some(k => Math.hypot(k.x - p.x, k.y - p.y) < 11)) pen("nodo", 35);
    }
    if (p.x < 4 || p.x > W - 4 || p.y < 4 || p.y > H - 4) pen("bordo", 80);
  }
  endRun();
  endRunL();
  len += Math.hypot(g.p2.x - prev.x, g.p2.y - prev.y);
  pen("lunghezza", len * 0.25);
  // niente gomiti né serpentine: una curva che gira tanto, o di colpo, sembra un filo spezzato
  const fine = [g.p1, ...sample(g, 120), g.p2];
  let turn = 0;
  for (let i = 1; i < fine.length - 1; i++) {
    const a1 = Math.atan2(fine[i].y - fine[i - 1].y, fine[i].x - fine[i - 1].x),
      a2 = Math.atan2(fine[i + 1].y - fine[i].y, fine[i + 1].x - fine[i].x);
    let d = Math.abs(a2 - a1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    turn += d;
    if (d > 0.35) pen("gomito", (d - 0.35) * 80);
  }
  if (turn > 3.3) pen("giri", (turn - 3.3) * 40);
  return h;
}

const DX = [0, -25, 25, -50, 50, -90, 90, -130, 130];
const KS = [1, 0.6, 1.5, 2.2, 3];

/** Da dove parte un filo: dal morsetto, o dal bordo del cavo se è un filo che esce da un cavo. */
interface WireIn {
  a: string;
  b: string;
  capo?: boolean;
  color?: string;
}

interface Cand {
  g: WireGeom;
  s: number;
  why: Record<string, number>;
  k: number;
  dx1: number;
  dx2: number;
}

function routeOne(lv: GeoLevel, w: WireIn, layer: Layer, all?: Cand[]): WireGeom {
  const H = lv.board.h;
  const p2 = RULES.tpos(lv, w.b);
  let p1: Pt, d1: number, d2: number;
  if (w.capo) {
    const c = RULES.compOf(lv, w.a);
    p1 = { x: c.fx || 0, y: c.fy || 0 };
    d1 = 1;
    // dal cavo, che sta sopra, il filo scende nel morsetto dall'alto
    d2 = p2.y > p1.y ? -1 : 1;
  } else {
    p1 = RULES.tpos(lv, w.a);
    d1 = RULES.tdir(lv, w.a);
    d2 = RULES.tdir(lv, w.b);
  }
  const sag = w.capo ? Math.max(12, Math.abs(p2.y - p1.y) / 2) : sagOf(p1.x, p1.y, p2.x, p2.y);
  if (w.capo) {
    // il filo che esce dal cavo resta la sua «S» corta, se non copre niente
    const stub = wgeom(p1.x, p1.y, p2.x, p2.y, H, true);
    const h = hitsOf(lv, w.a, w.b, stub, H);
    if (!h.terms.size && !h.labels.size && !h.bodies.size) return stub;
  }
  let best: WireGeom | null = null,
    bestScore = Infinity;
  for (const k of KS)
    for (const dx1 of DX)
      for (const dx2 of DX) {
        const g = geom(p1, { x: clampX(p1.x + dx1), y: clampY(p1.y + d1 * sag * k, H) }, { x: clampX(p2.x + dx2), y: clampY(p2.y + d2 * sag * k, H) }, p2);
        const h = hitsOf(lv, w.a, w.b, g, H, layer, w.color);
        const s = h.score + 0.1 * (Math.abs(dx1) + Math.abs(dx2)) + 10 * Math.abs(Math.log(k));
        all?.push({ g, s, why: h.why, k, dx1, dx2 });
        if (s < bestScore) {
          bestScore = s;
          best = g;
        }
        // la curva semplice è pulita: inutile cercarne un'altra
        if (!all && k === 1 && dx1 === 0 && dx2 === 0 && h.score === (h.why.lunghezza || 0)) return g;
      }
  return best!;
}

const allCache = new WeakMap<Board, Map<string, WireGeom[]>>();

/**
 * Tutti i fili di una tavola, posati uno alla volta: ognuno evita morsetti, scritte e pezzi che non sono suoi,
 * e non corre sopra i fili già posati. Prima i fili che escono dai cavi, poi gli altri, nell'ordine dato.
 */
export function routeAll(lv: GeoLevel, wires: readonly WireIn[]): WireGeom[] {
  let m = allCache.get(lv.board);
  if (!m) allCache.set(lv.board, (m = new Map()));
  const key = wires.map(w => `${w.a}>${w.b}:${w.color || ""}`).join(",");
  const hit = m.get(key);
  if (hit) return hit;
  const layer = newLayer();
  const out: WireGeom[] = new Array(wires.length);
  const order = wires.map((w, i) => i).sort((i, j) => Number(!!wires[j].capo) - Number(!!wires[i].capo));
  for (const i of order) {
    out[i] = routeOne(lv, wires[i], layer);
    lay(layer, out[i], i, wires[i].color);
  }
  m.set(key, out);
  return out;
}

/** Per le prove: le curve candidate del filo i, con i fili prima di lui già posati, dalla migliore. */
export function explainRoute(lv: GeoLevel, wires: readonly WireIn[], i: number): Cand[] {
  const layer = newLayer();
  const order = wires.map((w, j) => j).sort((x, y) => Number(!!wires[y].capo) - Number(!!wires[x].capo));
  const gs: WireGeom[] = [];
  for (const j of order) {
    if (j === i) {
      const all: Cand[] = [];
      routeOne(lv, wires[j], layer, all);
      return all.sort((x, y) => x.s - y.s);
    }
    gs[j] = routeOne(lv, wires[j], layer);
    lay(layer, gs[j], j, wires[j].color);
  }
  return [];
}

/** Il filo tra due morsetti, da solo (senza gli altri fili): per le prove. */
export function routeWire(lv: GeoLevel, a: string, b: string): WireGeom {
  return routeAll(lv, [{ a, b }])[0];
}

/** Per le prove: il punteggio di una curva con maniglie date. */
export function scoreCurve(lv: GeoLevel, a: string, b: string, c1: Pt, c2: Pt): { score: number; why: Record<string, number> } {
  const h = hitsOf(lv, a, b, geom(RULES.tpos(lv, a), c1, c2, RULES.tpos(lv, b)), lv.board.h);
  return { score: h.score, why: h.why };
}

export interface WireIssues {
  a: string;
  b: string;
  terms: string[];
  labels: string[];
  bodies: string[];
}

/** Cosa copre ogni filo, una volta disegnati tutti: per il controllo S18. */
export function drawIssues(lv: GeoLevel, wires: readonly WireIn[]): WireIssues[] {
  const gs = routeAll(lv, wires);
  return wires.map((w, i) => {
    const h = hitsOf(lv, w.a, w.b, gs[i], lv.board.h);
    return { a: w.a, b: w.b, terms: [...h.terms], labels: [...h.labels], bodies: [...h.bodies] };
  });
}

/** Cosa copre un filo da solo. */
export function wireIssues(lv: GeoLevel, a: string, b: string): { terms: string[]; labels: string[]; bodies: string[] } {
  const { terms, labels, bodies } = drawIssues(lv, [{ a, b }])[0];
  return { terms, labels, bodies };
}
