/* ====== DIOTTRI · IL MONDO: IL DISEGNO ======
   Compone lo schermo 160×144 in due bitmap: lo sfondo (terreno e oggetti, che lo starato sfoca) e il primo piano
   (personaggi, luccichii, chiome e tettoie sopra i personaggi), che resta sempre nitido. Funzioni pure: le usano
   il canvas del browser e le anteprime PNG in node. */
import { CREATURE, TAVOLOZZE_CREATURE } from "../grafica/creature";
import { FIGURE, LUCCICHIO } from "../grafica/figure";
import { type Bitmap, CELLA, dipingi, incolla, nuovaBitmap, riempi, type Tavolozza } from "../grafica/formato";
import { MATTONELLE, TAVOLOZZE_MATTONELLE } from "../grafica/mattonelle";
import { MEZZI, PAL_MEZZI } from "../grafica/mezzi";
import { OGGETTI, TAVOLOZZE_OGGETTI } from "../grafica/oggetti";
import { FIGURE_PAL, FONDO, type Luce, TAVOLOZZE } from "../grafica/tavolozze";
import { altezza, cosePresenti, larghezza, personaggiPresenti, timbriPresenti } from "./motore";
import type { Contesto, Dir, MappaDef } from "./tipi";

export const SCHERMO_W = 160, SCHERMO_H = 144;
const MAGENTA: Tavolozza = ["#ff00ff", "#ff00ff", "#ff00ff", "#ff00ff"];

/** Una tavolozza per nome: quelle comuni (grafica/tavolozze.ts), poi quelle dei disegni (mattonelle e oggetti). */
export function tavolozza(nome: string, luce: Luce): Tavolozza {
  for (const t of [TAVOLOZZE, TAVOLOZZE_MATTONELLE, TAVOLOZZE_OGGETTI]) {
    const x = t[luce]?.[nome] ?? (luce === "sera" ? undefined : undefined);
    if (x) return x;
  }
  for (const t of [TAVOLOZZE, TAVOLOZZE_MATTONELLE, TAVOLOZZE_OGGETTI]) {
    const x = t.giorno?.[nome] ?? t.interno?.[nome];
    if (x) return x;
  }
  return FIGURE_PAL[nome] ?? MAGENTA;
}

/* ---------- le bitmap, una volta sola ---------- */

const cache = new Map<string, Bitmap>();
function memo(k: string, f: () => Bitmap): Bitmap {
  let b = cache.get(k);
  if (!b) { b = f(); cache.set(k, b); }
  return b;
}
/** Svuota le bitmap (dopo aver cambiato i disegni, nelle anteprime). */
export const dimentica = () => cache.clear();

export function bitmapMattonella(id: string, luce: Luce, frame = 0): Bitmap {
  return memo(`m|${id}|${luce}|${frame}`, () => {
    const t = MATTONELLE[id];
    if (!t) { const b = nuovaBitmap(CELLA, CELLA); riempi(b, "#ff00ff"); return b; }
    const px = frame && t.anim?.length ? t.anim[(frame - 1) % t.anim.length] : t.px;
    return dipingi(px, tavolozza(t.pal, luce), CELLA, CELLA);
  });
}

export function bitmapOggetto(id: string, luce: Luce): Bitmap {
  return memo(`o|${id}|${luce}`, () => {
    const o = OGGETTI[id];
    if (!o) { const b = nuovaBitmap(CELLA, CELLA); riempi(b, "#ff00ff"); return b; }
    const px = luce === "sera" && o.notte ? o.notte : o.px;
    const pal = typeof o.pal === "string" ? tavolozza(o.pal, luce) : (cx: number, cy: number) => tavolozza((o.pal as string[][])[cy]?.[cx] ?? "muro", luce);
    return dipingi(px, pal, o.w * CELLA, o.h * CELLA);
  });
}

/** Un fotogramma di una figura. Con `alterna`, di fronte e di spalle il passo è allo specchio: si alternano le gambe. */
export function bitmapFigura(id: string, dir: Dir, passo: number, alterna = false): Bitmap {
  const specchio = dir === "destra" || (alterna && passo % 2 === 1 && (dir === "giu" || dir === "su"));
  return memo(`f|${id}|${dir}|${passo}|${specchio}`, () => {
    const f = FIGURE[id] ?? FIGURE.passante;
    const verso = dir === "giu" ? f.giu : dir === "su" ? f.su : f.lato;
    return dipingi(verso[passo % 2], FIGURE_PAL[f.pal] ?? MAGENTA, CELLA, CELLA, specchio);
  });
}

/** Un fotogramma di un mezzo (la bici, la canoa), da disegnare sopra chi gioca. */
export function bitmapMezzo(id: string, dir: Dir, passo: number): Bitmap | null {
  const z = MEZZI[id];
  if (!z) return null;
  return memo(`z|${id}|${dir}|${passo}`, () => {
    const verso = dir === "giu" ? z.giu : dir === "su" ? z.su : z.lato;
    return dipingi(verso[passo % 2], PAL_MEZZI[z.pal] ?? MAGENTA, CELLA, CELLA, dir === "destra");
  });
}

/** Chi gioca sul suo mezzo, in una cella più alta di 8 pixel (per le anteprime): la figura spostata, poi il mezzo sopra. */
export function conMezzo(figura: string, mezzo: string, dir: Dir, passo: number): Bitmap {
  const out = nuovaBitmap(CELLA + 8, CELLA + 8);
  const z = MEZZI[mezzo];
  incolla(out, bitmapFigura(figura, dir, passo), 4, 4 + (z?.alza ?? 0));
  const b = bitmapMezzo(mezzo, dir, passo);
  if (b) incolla(out, b, 4, 4);
  return out;
}

/** Un Diottro in grande, 32×32 (l'introduzione). */
export function bitmapCreatura(id: string): Bitmap {
  return memo(`c|${id}`, () => {
    const o = CREATURE[id];
    if (!o) { const b = nuovaBitmap(2 * CELLA, 2 * CELLA); riempi(b, "#ff00ff"); return b; }
    const pal = typeof o.pal === "string" ? (TAVOLOZZE_CREATURE[o.pal] ?? MAGENTA) : (cx: number, cy: number) => TAVOLOZZE_CREATURE[(o.pal as string[][])[cy]?.[cx] ?? ""] ?? MAGENTA;
    return dipingi(o.px, pal, o.w * CELLA, o.h * CELLA);
  });
}

export function bitmapLuccichio(frame: number): Bitmap {
  return memo(`l|${frame % 3}`, () => dipingi(LUCCICHIO[frame % 3], FIGURE_PAL.oro, CELLA, CELLA));
}

/* ---------- la scena ---------- */

export interface Scena {
  m: MappaDef;
  luce: Luce;
  ctx: Contesto;
  /** chi gioca: posizione in pixel (angolo in alto a sinistra), direzione, passo, figura, e il mezzo se c'è */
  tu: { px: number; py: number; dir: Dir; passo: number; figura: string; alterna?: boolean; mezzo?: string };
  /** direzione dei personaggi che si sono girati a parlare */
  versi?: Record<string, Dir>;
  /** tempo in millisecondi, per l'acqua e i luccichii */
  t: number;
}

export interface Fotogramma {
  sfondo: Bitmap;
  primo: Bitmap;
  /** dove inizia lo schermo sulla mappa, in pixel */
  cam: [number, number];
}

/** La telecamera: centrata su chi gioca, ferma ai bordi; una mappa piccola sta al centro. */
export function telecamera(m: MappaDef, px: number, py: number, W = SCHERMO_W, H = SCHERMO_H): [number, number] {
  const mw = larghezza(m) * CELLA, mh = altezza(m) * CELLA;
  const asse = (p: number, dim: number, schermo: number) => (dim <= schermo ? -Math.floor((schermo - dim) / 2) : Math.max(0, Math.min(dim - schermo, p + CELLA / 2 - schermo / 2)));
  return [Math.round(asse(px, mw, W)), Math.round(asse(py, mh, H))];
}

export function componi(sc: Scena, W = SCHERMO_W, H = SCHERMO_H, cam?: [number, number]): Fotogramma {
  const { m, luce, ctx, t } = sc;
  const [cx, cy] = cam ?? telecamera(m, sc.tu.px, sc.tu.py, W, H);
  const sfondo = nuovaBitmap(W, H), primo = nuovaBitmap(W, H);
  riempi(sfondo, FONDO[luce]);
  const frameAcqua = Math.floor(t / 600) % 2;

  // il terreno
  const x0 = Math.floor(cx / CELLA), y0 = Math.floor(cy / CELLA);
  for (let ty = y0; ty <= y0 + Math.ceil(H / CELLA); ty++) {
    for (let tx = x0; tx <= x0 + Math.ceil(W / CELLA); tx++) {
      const ch = m.righe[ty]?.[tx];
      if (ch === undefined) continue;
      const v = m.legenda[ch];
      if (!v) continue;
      incolla(sfondo, bitmapMattonella(v.tile, luce, frameAcqua), tx * CELLA - cx, ty * CELLA - cy);
    }
  }
  // gli oggetti: interi sullo sfondo; le righe «sopra» di nuovo in primo piano, dopo i personaggi
  const timbri = timbriPresenti(m, ctx);
  for (const tb of timbri) {
    const o = OGGETTI[tb.ogg];
    if (!o) continue;
    incolla(sfondo, bitmapOggetto(tb.ogg, luce), tb.x * CELLA - cx, tb.y * CELLA - cy);
  }

  // i cartelli
  for (const c of cosePresenti(m, ctx)) if (c.tipo === "cartello") incolla(sfondo, bitmapOggetto("cartello", luce), c.x * CELLA - cx, c.y * CELLA - cy);

  // i luccichii
  const fl = Math.floor(t / 180);
  for (const c of cosePresenti(m, ctx)) {
    if (c.tipo !== "luccichio") continue;
    incolla(primo, bitmapLuccichio(fl + c.x + c.y), c.x * CELLA - cx, c.y * CELLA - cy - (Math.floor(t / 400) % 2));
  }

  // i personaggi e chi gioca, dall'alto in basso; chi gioca col suo mezzo: la figura spostata, poi il mezzo sopra
  const figure: { y: number; b: Bitmap; px: number; py: number; alza?: number; sopra?: Bitmap | null }[] = personaggiPresenti(m, ctx).map(p => ({
    y: p.y * CELLA, b: bitmapFigura(p.figura, sc.versi?.[p.id] ?? p.dir, 0), px: p.x * CELLA, py: p.y * CELLA,
  }));
  const z = sc.tu.mezzo ? MEZZI[sc.tu.mezzo] : undefined;
  figure.push({
    y: sc.tu.py, b: bitmapFigura(sc.tu.figura, sc.tu.dir, z ? 0 : sc.tu.passo, sc.tu.alterna), px: sc.tu.px, py: sc.tu.py,
    alza: z?.alza ?? 0, sopra: z ? bitmapMezzo(sc.tu.mezzo!, sc.tu.dir, sc.tu.passo) : null,
  });
  figure.sort((a, b) => a.y - b.y);
  for (const f of figure) {
    incolla(primo, f.b, Math.round(f.px - cx), Math.round(f.py - cy) - 2 + (f.alza ?? 0));
    if (f.sopra) incolla(primo, f.sopra, Math.round(f.px - cx), Math.round(f.py - cy) - 2);
  }

  // le chiome e le tettoie sopra
  for (const tb of timbri) {
    const o = OGGETTI[tb.ogg];
    if (!o?.sopra) continue;
    incolla(primo, bitmapOggetto(tb.ogg, luce), tb.x * CELLA - cx, tb.y * CELLA - cy, 0, 0, o.w * CELLA, o.sopra * CELLA);
  }
  return { sfondo, primo, cam: [cx, cy] };
}

/** Lo sfondo e il primo piano uniti (per le anteprime e i test). */
export function unisci(f: Fotogramma): Bitmap {
  const out = nuovaBitmap(f.sfondo.w, f.sfondo.h);
  out.data.set(f.sfondo.data);
  incolla(out, f.primo, 0, 0);
  return out;
}

/* ---------- l'introduzione ---------- */

/** Una bitmap ingrandita k volte, a pixel netti. */
export function ingrandisci(b: Bitmap, k: number): Bitmap {
  const out = nuovaBitmap(b.w * k, b.h * k);
  for (let y = 0; y < out.h; y++) for (let x = 0; x < out.w; x++) {
    const i = (Math.floor(y / k) * b.w + Math.floor(x / k)) * 4, o = (y * out.w + x) * 4;
    out.data[o] = b.data[i]; out.data[o + 1] = b.data[i + 1]; out.data[o + 2] = b.data[i + 2]; out.data[o + 3] = b.data[i + 3];
  }
  return out;
}

/** Una figura tutta scura: il Pressappoco nell'ombra. */
function ombra(id: string): Bitmap {
  return memo(`ombra|${id}`, () => dipingi((FIGURE[id] ?? FIGURE.passante).giu[0], ["#000000", "#3a2430", "#2a1820", "#140a0e"], CELLA, CELLA));
}

const SFONDI: Record<string, string> = { titolo: "#16263a", iride: "#f3ecd6", diottro: "#f3ecd6", diottri: "#e6f0ea", pressappoco: "#5a2c2c", scelta: "#f3ecd6", tu: "#f3ecd6", "tu-piccolo": "#f3ecd6" };

/**
 * Lo schermo dell'introduzione: il titolo coi Diottri, Iride in grande, un Diottro, il Pressappoco nell'ombra, la scelta
 * di chi gioca. Il riquadro dei dialoghi copre il fondo dello schermo: le figure stanno nella parte alta.
 */
export function componiIntro(quadro: string, t: number, chi: "uomo" | "donna"): Fotogramma {
  const W = SCHERMO_W, H = SCHERMO_H;
  const sfondo = nuovaBitmap(W, H), primo = nuovaBitmap(W, H);
  riempi(sfondo, SFONDI[quadro] ?? "#f3ecd6");
  // una striscia di pavimento sotto le figure, come in una bottega
  if (quadro !== "titolo" && quadro !== "pressappoco") for (let y = 74; y < 78; y++) for (let x = 0; x < W; x++) { const o = (y * W + x) * 4; sfondo.data[o] = 0xd8; sfondo.data[o + 1] = 0xcf; sfondo.data[o + 2] = 0xb5; sfondo.data[o + 3] = 255; }
  const salta = (fase: number) => (Math.floor(t / 300 + fase) % 2 ? -1 : 0);
  const tu = chi === "donna" ? "tu_donna" : "tu_uomo";
  const metti = (b: Bitmap, x: number, y: number) => incolla(primo, b, x, y);
  switch (quadro) {
    case "titolo":
      ["conca", "bombo", "verdino"].forEach((id, i) => metti(bitmapCreatura(id), 18 + i * 46, 96 + salta(i) * 2));
      break;
    case "iride":
      metti(ingrandisci(bitmapFigura("iride", "giu", 0), 3), 56, 26);
      break;
    case "diottro":
      metti(ingrandisci(bitmapFigura("iride", "giu", 0), 3), 18, 26);
      metti(ingrandisci(bitmapCreatura("conca"), 2), 84, 10 + salta(0) * 2);
      break;
    case "diottri":
      ["conca", "bombo", "verdino", "polare"].forEach((id, i) => metti(bitmapCreatura(id), 4 + i * 39, 34 + salta(i) * 2));
      break;
    case "pressappoco":
      metti(ingrandisci(ombra("pressappoco"), 3), 56, 26);
      break;
    case "scelta":
      // a sinistra, perché a destra c'è il riquadro della scelta
      metti(ingrandisci(bitmapFigura("tu_uomo", "giu", 0), 3), 4, 26);
      metti(ingrandisci(bitmapFigura("tu_donna", "giu", 0), 3), 52, 26);
      break;
    case "tu":
      metti(ingrandisci(bitmapFigura(tu, "giu", 0), 3), 56, 26);
      break;
    case "tu-piccolo":
      metti(bitmapFigura(tu, "giu", 0), 72, 54);
      break;
  }
  return { sfondo, primo, cam: [0, 0] };
}
