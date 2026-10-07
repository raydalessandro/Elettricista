/* Anteprime PNG della grafica di Diottri: le mappe intere, le mattonelle, gli oggetti, i personaggi.
   Uso:  npx tsx scripts/diottri-anteprima.ts mappa borgo [giorno|sera] [segni,separati,da,virgole] [fatti,…] [--out=nome]
         npx tsx scripts/diottri-anteprima.ts mattonelle | oggetti [id,id,…] | figure | mezzi | creature   [--out=nome]
   «mezzi» mostra ogni mezzo con chi gioca (lui e lei) nelle quattro direzioni, fermo e in movimento, come nel gioco.
   Le immagini vanno in dist/anteprime/, ingrandite 3 volte, a pixel netti. */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { MAPPE, nebbia } from "../src/diottri/content/borgo";
import { FIGURE, LUCCICHIO } from "../src/diottri/grafica/figure";
import { type Bitmap, CELLA, dipingi, incolla, nuovaBitmap, riempi } from "../src/diottri/grafica/formato";
import { CREATURE } from "../src/diottri/grafica/creature";
import { MATTONELLE } from "../src/diottri/grafica/mattonelle";
import { MEZZI } from "../src/diottri/grafica/mezzi";
import { OGGETTI } from "../src/diottri/grafica/oggetti";
import { FIGURE_PAL, type Luce } from "../src/diottri/grafica/tavolozze";
import { bitmapCreatura, bitmapFigura, bitmapMattonella, bitmapOggetto, conMezzo, componi, unisci } from "../src/diottri/mondo/disegno";
import { altezza, larghezza } from "../src/diottri/mondo/motore";

const OUT = join(process.cwd(), "dist", "anteprime");
mkdirSync(OUT, { recursive: true });

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b: Buffer) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(tipo: string, dati: Buffer) {
  const len = Buffer.alloc(4); len.writeUInt32BE(dati.length);
  const td = Buffer.concat([Buffer.from(tipo), dati]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, c]);
}
export function png(b: Bitmap, scala = 3): Buffer {
  const W = b.w * scala, H = b.h * scala;
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0;
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / scala) * b.w + Math.floor(x / scala)) * 4, o = y * (W * 4 + 1) + 1 + x * 4;
      raw[o] = b.data[i]; raw[o + 1] = b.data[i + 1]; raw[o + 2] = b.data[i + 2]; raw[o + 3] = b.data[i + 3] || 0;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

/** Un foglio a griglia, con un fondo a scacchi dove è trasparente. */
function foglio(pezzi: Bitmap[], colonne: number, cella: number): Bitmap {
  const righe = Math.ceil(pezzi.length / colonne);
  const out = nuovaBitmap(colonne * (cella + 4) + 4, righe * (cella + 4) + 4);
  riempi(out, "#d8d4c8");
  pezzi.forEach((p, i) => {
    const x = 4 + (i % colonne) * (cella + 4), y = 4 + Math.floor(i / colonne) * (cella + 4);
    const fondo = nuovaBitmap(p.w, p.h);
    for (let yy = 0; yy < p.h; yy++) for (let xx = 0; xx < p.w; xx++) { const o = (yy * p.w + xx) * 4, c = ((xx >> 2) + (yy >> 2)) % 2 ? 236 : 250; fondo.data[o] = c; fondo.data[o + 1] = c; fondo.data[o + 2] = c; fondo.data[o + 3] = 255; }
    incolla(out, fondo, x, y);
    incolla(out, p, x, y);
  });
  return out;
}

const argv = process.argv.slice(2);
const opz = Object.fromEntries(argv.filter(a => a.startsWith("--")).map(a => a.slice(2).split("=") as [string, string]));
const [cosa, a1, a2, a3, a4] = argv.filter(a => !a.startsWith("--"));
/** Il nome del file: si può cambiare con --out=nome, perché più persone possono lavorare insieme. */
const nomeFile = (base: string) => join(OUT, `${opz.out || base}.png`);
if (cosa === "mappa") {
  const m = MAPPE[a1 || "borgo"];
  const luce = (m.fuori ? (a2 || "giorno") : "interno") as Luce;
  const segni = (a3 || "prologo,furto,misurato,inizio").split(",").filter(Boolean);
  const fatti = (a4 || "").split(",").filter(Boolean);
  const ctx = { fatto: (id: string) => fatti.includes(id), segni };
  const W = larghezza(m) * CELLA, H = altezza(m) * CELLA;
  const f = componi({ m, luce, ctx, tu: { px: 14 * CELLA, py: 24 * CELLA, dir: "su", passo: 0, figura: "tu_uomo" }, t: 0 }, W, H, [0, 0]);
  const file = nomeFile(`mappa-${m.id}-${luce}`);
  writeFileSync(file, png(unisci(f), 2));
  console.log(`${file} (nebbia ${nebbia(ctx)})`);
} else if (cosa === "mattonelle") {
  const ids = Object.keys(MATTONELLE);
  const pezzi = ids.flatMap(id => [bitmapMattonella(id, "giorno"), bitmapMattonella(id, "sera")]);
  writeFileSync(nomeFile("mattonelle"), png(foglio(pezzi, 8, CELLA), 4));
  console.log("mattonelle (giorno, sera):", ids.join(" "));
} else if (cosa === "oggetti") {
  const ids = a1 ? a1.split(",") : Object.keys(OGGETTI);
  const max = Math.max(...ids.map(id => Math.max(OGGETTI[id].w, OGGETTI[id].h))) * CELLA;
  const pezzi = ids.flatMap(id => [bitmapOggetto(id, "giorno"), bitmapOggetto(id, "sera")]);
  writeFileSync(nomeFile("oggetti"), png(foglio(pezzi, 6, max), 3));
  console.log("oggetti (giorno, sera):", ids.join(" "));
} else if (cosa === "figure") {
  const ids = Object.keys(FIGURE);
  const pezzi = ids.flatMap(id => (["giu", "su", "sinistra", "destra"] as const).flatMap(d => [bitmapFigura(id, d, 0), bitmapFigura(id, d, 1)]));
  pezzi.push(...LUCCICHIO.map(l => dipingi(l, FIGURE_PAL.oro, CELLA, CELLA)));
  writeFileSync(nomeFile("figure"), png(foglio(pezzi, 8, CELLA), 5));
  console.log("figure (giù, su, sinistra, destra × 2 passi):", ids.join(" "), "+ luccichio");
} else if (cosa === "mezzi") {
  const ids = Object.keys(MEZZI);
  const pezzi = ids.flatMap(id => ["tu_uomo", "tu_donna"].flatMap(chi => (["giu", "su", "sinistra", "destra"] as const).flatMap(d => [0, 1].map(p => conMezzo(chi, id, d, p)))));
  writeFileSync(nomeFile("mezzi"), png(foglio(pezzi, 8, CELLA + 8), 5));
  console.log("mezzi (lui, poi lei; giù, su, sinistra, destra × fermo e in movimento):", ids.join(" "));
} else if (cosa === "creature") {
  const ids = Object.keys(CREATURE);
  const pezzi = ids.map(id => bitmapCreatura(id));
  writeFileSync(nomeFile("creature"), png(foglio(pezzi, 4, 2 * CELLA), 4));
  console.log("creature:", ids.join(" "));
} else {
  console.log("Uso: mappa <id> [giorno|sera] [segni] [fatti] · mattonelle · oggetti · figure · mezzi · creature");
}
