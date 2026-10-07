/* ====== DIOTTRI · GRAFICA: IL FORMATO ======
   Mattonelle, oggetti e personaggi sono disegni a griglia, come sul Game Boy Color: ogni cella di 16×16 pixel
   ha la sua tavolozza di quattro colori. Il disegno vive come dati (righe di caratteri) e il programma lo
   trasforma in pixel: nel browser per il canvas, in node per le anteprime PNG (scripts/diottri-anteprima.ts).
   La guida di stile è docs/gioco/STILE.md. */

export type Colore = string; // «#rrggbb»
/** Quattro colori, dal più chiaro (0) al più scuro (3). */
export type Tavolozza = [Colore, Colore, Colore, Colore];

export const CELLA = 16;

/** Una mattonella del terreno: 16 righe da 16 caratteri «0»–«3». Con `anim`, altri fotogrammi che si alternano. */
export interface Mattonella {
  pal: string;
  px: string[];
  anim?: string[][];
}

/**
 * Un oggetto sopra il terreno (una casa, un albero, il banco): w×h mattonelle, righe da w×16 caratteri.
 * «.» è trasparente, «0»–«3» i colori della tavolozza della sua cella.
 * - `pal`: una tavolozza per tutto, o una griglia h×w di nomi (una per cella, come il Game Boy Color).
 * - `solido`: h righe da w caratteri, «x» dove non si passa (di solito la base); senza, è tutto pieno.
 * - `sopra`: quante righe di celle, dall'alto, si disegnano sopra i personaggi (la chioma di un albero, una tettoia).
 * - `notte`: un'altra versione dei pixel per la sera (un lampione acceso, finestre illuminate).
 */
export interface Oggetto {
  w: number;
  h: number;
  pal: string | string[][];
  px: string[];
  solido?: string[];
  sopra?: number;
  notte?: string[];
  /** un bancone: si parla con chi sta dall'altra parte */
  bancone?: boolean;
}

/** Un personaggio: 16×16, quattro direzioni (destra = sinistra allo specchio), due passi. «.» trasparente, «1»–«3» i colori. */
export interface Figura {
  pal: string;
  giu: [string[], string[]];
  su: [string[], string[]];
  lato: [string[], string[]];
}

/** Un'immagine RGBA. */
export interface Bitmap {
  w: number;
  h: number;
  data: Uint8ClampedArray<ArrayBuffer>;
}

export const nuovaBitmap = (w: number, h: number): Bitmap => ({ w, h, data: new Uint8ClampedArray(w * h * 4) });

export function rgb(c: Colore): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Disegna righe di caratteri con una tavolozza (o una per cella) in una bitmap. «.» resta trasparente. */
export function dipingi(px: string[], pal: Tavolozza | ((cx: number, cy: number) => Tavolozza), w: number, h: number, specchia = false): Bitmap {
  const out = nuovaBitmap(w, h);
  const cache = new Map<Tavolozza, [number, number, number][]>();
  const colori = (t: Tavolozza) => { let c = cache.get(t); if (!c) { c = t.map(rgb); cache.set(t, c); } return c; };
  for (let y = 0; y < h; y++) {
    const riga = px[y] || "";
    for (let x = 0; x < w; x++) {
      const ch = riga[specchia ? w - 1 - x : x];
      if (ch === undefined || ch === "." || ch === " ") continue;
      const i = ch.charCodeAt(0) - 48;
      if (i < 0 || i > 3) continue;
      const t = typeof pal === "function" ? pal(Math.floor(x / CELLA), Math.floor(y / CELLA)) : pal;
      const [r, g, b] = colori(t)[i];
      const o = (y * w + x) * 4;
      out.data[o] = r;
      out.data[o + 1] = g;
      out.data[o + 2] = b;
      out.data[o + 3] = 255;
    }
  }
  return out;
}

/** Copia `src` in `dst` alla posizione (x, y), saltando i pixel trasparenti. Fuori dai bordi si taglia. */
export function incolla(dst: Bitmap, src: Bitmap, x: number, y: number, sx = 0, sy = 0, sw = src.w, sh = src.h) {
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(dst.w, x + sw), y1 = Math.min(dst.h, y + sh);
  for (let yy = y0; yy < y1; yy++) {
    const ry = sy + (yy - y);
    let o = (yy * dst.w + x0) * 4;
    let i = (ry * src.w + sx + (x0 - x)) * 4;
    for (let xx = x0; xx < x1; xx++, o += 4, i += 4) {
      if (src.data[i + 3] === 0) continue;
      dst.data[o] = src.data[i];
      dst.data[o + 1] = src.data[i + 1];
      dst.data[o + 2] = src.data[i + 2];
      dst.data[o + 3] = 255;
    }
  }
}

/** Riempie una bitmap di un colore. */
export function riempi(b: Bitmap, c: Colore) {
  const [r, g, bl] = rgb(c);
  for (let o = 0; o < b.data.length; o += 4) { b.data[o] = r; b.data[o + 1] = g; b.data[o + 2] = bl; b.data[o + 3] = 255; }
}

/** Controlla un disegno: righe della lunghezza giusta, solo caratteri ammessi. Ritorna gli errori. */
export function controllaPx(nome: string, px: string[], w: number, h: number, ammessi: string): string[] {
  const err: string[] = [];
  if (px.length !== h) err.push(`${nome}: ${px.length} righe invece di ${h}`);
  px.forEach((r, i) => {
    if (r.length !== w) err.push(`${nome}: la riga ${i} ha ${r.length} caratteri invece di ${w}`);
    for (const ch of r) if (!ammessi.includes(ch)) { err.push(`${nome}: carattere «${ch}» alla riga ${i}`); break; }
  });
  return err;
}
