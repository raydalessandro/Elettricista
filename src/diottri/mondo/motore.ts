/* ====== DIOTTRI · IL MONDO: IL MOTORE ======
   Gira senza disegno: dove si può andare, chi c'è davanti, le porte, gli eventi.
   L'interfaccia (mondo/guscio.ts) e il robot (mondo/robot.ts) chiamano queste funzioni. */
import { OGGETTI } from "../grafica/oggetti";
import { type Battuta, type Comando, type Condizione, type Contesto, DELTA, type Dir, type Evento, type MappaDef, type Personaggio, type Porta, type StatoMondo, type Cosa } from "./tipi";

/* ---------- le condizioni ---------- */

export function vale(c: Condizione | undefined, ctx: Contesto): boolean {
  if (!c) return true;
  if (c.fatti && !c.fatti.every(ctx.fatto)) return false;
  if (c.nonFatti && c.nonFatti.some(ctx.fatto)) return false;
  if (c.segni && !c.segni.every(s => ctx.segni.includes(s))) return false;
  if (c.nonSegni && c.nonSegni.some(s => ctx.segni.includes(s))) return false;
  return true;
}

/** La prima battuta che vale. */
export function battuta(bs: Battuta[], ctx: Contesto): Evento | null {
  for (const b of bs) if (vale(b.se, ctx)) return b.fai;
  return null;
}

/* ---------- la mappa ---------- */

export const larghezza = (m: MappaDef) => Math.max(...m.righe.map(r => r.length));
export const altezza = (m: MappaDef) => m.righe.length;

export function voce(m: MappaDef, x: number, y: number) {
  const ch = m.righe[y]?.[x];
  return ch === undefined ? null : m.legenda[ch] ?? null;
}

export const personaggiPresenti = (m: MappaDef, ctx: Contesto) => m.personaggi.filter(p => vale(p.se, ctx));
export const cosePresenti = (m: MappaDef, ctx: Contesto) => m.cose.filter(c => vale(c.se, ctx));
export const timbriPresenti = (m: MappaDef, ctx: Contesto) => m.timbri.filter(t => vale(t.se, ctx));

/** Le celle piene degli oggetti presenti. */
export function celleOggetti(m: MappaDef, ctx: Contesto): Set<string> {
  const out = new Set<string>();
  for (const t of timbriPresenti(m, ctx)) {
    const o = OGGETTI[t.ogg];
    if (!o) continue;
    for (let cy = 0; cy < o.h; cy++) for (let cx = 0; cx < o.w; cx++) {
      const pieno = o.solido ? o.solido[cy]?.[cx] === "x" : true;
      if (pieno) out.add(`${t.x + cx},${t.y + cy}`);
    }
  }
  return out;
}

export function solidoA(m: MappaDef, x: number, y: number, ctx: Contesto, oggetti = celleOggetti(m, ctx)): boolean {
  const v = voce(m, x, y);
  if (!v || v.solido) return true;
  if (oggetti.has(`${x},${y}`)) return true;
  if (personaggiPresenti(m, ctx).some(p => p.x === x && p.y === y)) return true;
  if (cosePresenti(m, ctx).some(c => c.solido && c.x === x && c.y === y)) return true;
  return false;
}

export const portaA = (m: MappaDef, x: number, y: number): Porta | undefined => m.porte.find(p => p.x === x && p.y === y);

export function davanti(s: StatoMondo): [number, number] {
  const [dx, dy] = DELTA[s.dir];
  return [s.x + dx, s.y + dy];
}

export type Davanti = { tipo: "personaggio"; p: Personaggio } | { tipo: "cosa"; c: Cosa } | null;

/** Chi o cosa c'è nella cella davanti. Un luccichio si tocca anche stando sopra. */
/** C'è un bancone in questa cella? */
function bancone(m: MappaDef, x: number, y: number, ctx: Contesto): boolean {
  return timbriPresenti(m, ctx).some(t => {
    const o = OGGETTI[t.ogg];
    return !!o?.bancone && x >= t.x && x < t.x + o.w && y >= t.y && y < t.y + o.h;
  });
}

export function chiDavanti(m: MappaDef, s: StatoMondo, ctx: Contesto): Davanti {
  const [x, y] = davanti(s);
  let p = personaggiPresenti(m, ctx).find(q => q.x === x && q.y === y);
  if (!p && bancone(m, x, y, ctx)) {
    // si parla anche da questa parte del banco
    const [dx, dy] = DELTA[s.dir];
    p = personaggiPresenti(m, ctx).find(q => q.x === x + dx && q.y === y + dy);
  }
  if (p) return { tipo: "personaggio", p };
  const c = cosePresenti(m, ctx).find(q => q.x === x && q.y === y) ?? cosePresenti(m, ctx).find(q => q.tipo === "luccichio" && q.x === s.x && q.y === s.y);
  if (c) return { tipo: "cosa", c };
  // una porta chiusa dice perché, anche col tasto A
  const porta = portaA(m, x, y);
  if (porta && !vale(porta.se, ctx)) return { tipo: "cosa", c: { id: `porta-${x}-${y}`, tipo: "oggetto", x, y, tocca: [{ fai: [{ dice: porta.chiusa ?? "È chiuso." }] }] } };
  // un oggetto che ha qualcosa da dire, da qualunque sua cella
  const t = timbriPresenti(m, ctx).find(q => {
    const o = OGGETTI[q.ogg];
    return !!q.tocca && !!o && x >= q.x && x < q.x + o.w && y >= q.y && y < q.y + o.h;
  });
  if (t) return { tipo: "cosa", c: { id: `timbro-${t.ogg}-${t.x}-${t.y}`, tipo: "oggetto", x, y, tocca: t.tocca! } };
  return null;
}

/** L'evento del tasto A: chi c'è davanti, o niente. */
export function eventoDavanti(m: MappaDef, s: StatoMondo, ctx: Contesto): { evento: Evento; personaggio?: Personaggio } | null {
  const d = chiDavanti(m, s, ctx);
  if (!d) return null;
  if (d.tipo === "personaggio") {
    const ev = battuta(d.p.parla, ctx);
    return ev ? { evento: ev, personaggio: d.p } : null;
  }
  const ev = battuta(d.c.tocca, ctx);
  return ev ? { evento: ev } : null;
}

export type Passo =
  | { esito: "girato" }
  | { esito: "mosso" }
  | { esito: "bloccato" }
  | { esito: "porta"; porta: Porta }
  | { esito: "chiusa"; testo: string };

/** Un passo verso `dir`: prima si gira, poi si cammina; le porte portano altrove (o dicono che sono chiuse). */
export function passo(m: MappaDef, s: StatoMondo, dir: Dir, ctx: Contesto, giraPrima = true): Passo {
  if (s.dir !== dir) {
    s.dir = dir;
    if (giraPrima) return { esito: "girato" };
  }
  const [x, y] = davanti(s);
  const porta = portaA(m, x, y);
  if (porta) {
    if (vale(porta.se, ctx)) return { esito: "porta", porta };
    return { esito: "chiusa", testo: porta.chiusa ?? "È chiuso." };
  }
  if (solidoA(m, x, y, ctx)) return { esito: "bloccato" };
  s.x = x;
  s.y = y;
  return { esito: "mosso" };
}

/** L'evento entrando in una mappa, se c'è. */
export const eventoArrivo = (m: MappaDef, ctx: Contesto): Evento | null => (m.entrando ? battuta(m.entrando, ctx) : null);

/** Una cella dove stare: (x, y) se è libera e ci si arriva; se no la libera più vicina, fra quelle raggiungibili
    dall'ancora della mappa. Serve coi salvataggi vecchi, o quando un cliente compare proprio dove sei. */
export function posizioneLibera(m: MappaDef, x: number, y: number, ctx: Contesto): [number, number] {
  const W = larghezza(m), H = altezza(m);
  const ogg = celleOggetti(m, ctx);
  const dentro = (cx: number, cy: number) => cx >= 0 && cy >= 0 && cx < W && cy < H;
  const libera = (cx: number, cy: number) => dentro(cx, cy) && !portaA(m, cx, cy) && !solidoA(m, cx, cy, ctx, ogg);
  // dove si arriva dall'ancora: contano i muri e gli oggetti, non chi sta in piedi (le persone si spostano)
  const [ax, ay] = m.ancora;
  const raggiunte = new Set<string>([`${ax},${ay}`]);
  const coda: [number, number][] = [[ax, ay]];
  while (coda.length) {
    const [cx, cy] = coda.shift()!;
    for (const [dx, dy] of Object.values(DELTA)) {
      const nx = cx + dx, ny = cy + dy, k = `${nx},${ny}`;
      if (raggiunte.has(k) || !dentro(nx, ny) || portaA(m, nx, ny)) continue;
      const v = voce(m, nx, ny);
      if (!v || v.solido || ogg.has(k)) continue;
      raggiunte.add(k);
      coda.push([nx, ny]);
    }
  }
  if (raggiunte.has(`${x},${y}`) && libera(x, y)) return [x, y];
  let meglio: [number, number] = [ax, ay], d0 = Infinity;
  for (const k of raggiunte) {
    const [cx, cy] = k.split(",").map(Number);
    const d = Math.abs(cx - x) + Math.abs(cy - y);
    if (d < d0 && libera(cx, cy)) { d0 = d; meglio = [cx, cy]; }
  }
  return meglio;
}

/* ---------- gli eventi ---------- */

/** Chi esegue gli eventi: l'interfaccia vera, o il robot. */
export interface Regista {
  dice(testo: string, chi?: string): Promise<void>;
  /** la scelta: le voci, quella su cui parte la freccia, e quella che sceglie il tasto B (se c'è) */
  scelta(testo: string, voci: string[], opzioni?: { predefinita?: number; annulla?: number }): Promise<number>;
  caso(id: string): Promise<void>;
  ric(id: string): Promise<void>;
  vai(dest: { mappa: string; x: number; y: number; dir: Dir }): Promise<void>;
  gira(d: Dir): void;
  buio(testo: string): Promise<void>;
  fine(testo: string, titolo: string, sotto?: string): Promise<void>;
  segna(s: string): void;
  togli(s: string): void;
}

export async function esegui(ev: Evento, ctx: Contesto, r: Regista): Promise<void> {
  for (const c of ev as Comando[]) {
    if ("dice" in c) await r.dice(c.dice, c.chi);
    else if ("scelta" in c) {
      const annulla = c.voci.findIndex(v => v.annulla);
      const i = await r.scelta(c.scelta, c.voci.map(v => v.testo), { predefinita: c.predefinita, annulla: annulla >= 0 ? annulla : undefined });
      await esegui(c.voci[i]?.fai ?? [], ctx, r);
    } else if ("caso" in c) await r.caso(c.caso);
    else if ("ric" in c) await r.ric(c.ric);
    else if ("segna" in c) r.segna(c.segna);
    else if ("togli" in c) r.togli(c.togli);
    else if ("se" in c) await esegui(vale(c.se, ctx) ? c.allora : c.altrimenti ?? [], ctx, r);
    else if ("vai" in c) await r.vai(c.vai);
    else if ("gira" in c) r.gira(c.gira);
    else if ("buio" in c) await r.buio(c.buio);
    else if ("fine" in c) await r.fine(c.fine, c.titolo, c.sotto);
  }
}

/** Tutti i testi di un evento (per il controllo del riquadro e dell'elenco nero). */
export function testiEvento(ev: Evento): string[] {
  const out: string[] = [];
  for (const c of ev as Comando[]) {
    if ("dice" in c) out.push(c.dice);
    else if ("scelta" in c) { out.push(c.scelta); for (const v of c.voci) { out.push(v.testo); out.push(...testiEvento(v.fai)); } }
    else if ("se" in c) { out.push(...testiEvento(c.allora)); out.push(...testiEvento(c.altrimenti ?? [])); }
    else if ("buio" in c) out.push(c.buio);
    else if ("fine" in c) out.push(c.titolo, c.fine, ...(c.sotto ? [c.sotto] : []));
  }
  return out;
}

/** I casi e i riconoscimenti che un evento può aprire. */
export function apreEvento(ev: Evento): string[] {
  const out: string[] = [];
  for (const c of ev as Comando[]) {
    if ("caso" in c) out.push(c.caso);
    else if ("ric" in c) out.push(c.ric);
    else if ("scelta" in c) for (const v of c.voci) out.push(...apreEvento(v.fai));
    else if ("se" in c) out.push(...apreEvento(c.allora), ...apreEvento(c.altrimenti ?? []));
  }
  return out;
}

/** La strada più corta fino a una cella vicina a (tx, ty) (o sopra, se `sopra`), coi passi da fare. Per il robot e i test. */
export function strada(m: MappaDef, s: StatoMondo, tx: number, ty: number, ctx: Contesto, sopra = false): Dir[] | null {
  const W = larghezza(m), H = altezza(m);
  const ogg = celleOggetti(m, ctx);
  const key = (x: number, y: number) => y * W + x;
  const prev = new Map<number, [number, Dir]>();
  const start = key(s.x, s.y);
  const coda: [number, number][] = [[s.x, s.y]];
  const visti = new Set([start]);
  const meta = (x: number, y: number) => (sopra ? x === tx && y === ty : Math.abs(x - tx) + Math.abs(y - ty) === 1);
  while (coda.length) {
    const [x, y] = coda.shift()!;
    if (meta(x, y)) {
      const dirs: Dir[] = [];
      let k = key(x, y);
      while (k !== start) { const [pk, d] = prev.get(k)!; dirs.unshift(d); k = pk; }
      return dirs;
    }
    for (const d of ["su", "giu", "sinistra", "destra"] as Dir[]) {
      const [dx, dy] = DELTA[d];
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const k = key(nx, ny);
      if (visti.has(k) || portaA(m, nx, ny)) continue;
      if (!(sopra && nx === tx && ny === ty) && solidoA(m, nx, ny, ctx, ogg)) continue;
      visti.add(k);
      prev.set(k, [key(x, y), d]);
      coda.push([nx, ny]);
    }
  }
  return null;
}
