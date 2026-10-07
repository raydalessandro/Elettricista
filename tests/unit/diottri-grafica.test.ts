/* Diottri: i disegni sono fatti bene (misure, caratteri, tavolozze) e ci sono tutti quelli che le mappe usano. */
import { describe, expect, it } from "vitest";
import { MAPPE } from "../../src/diottri/content/borgo";
import { FIGURE, LUCCICHIO } from "../../src/diottri/grafica/figure";
import { controllaPx } from "../../src/diottri/grafica/formato";
import { MATTONELLE } from "../../src/diottri/grafica/mattonelle";
import { OGGETTI } from "../../src/diottri/grafica/oggetti";
import { FIGURE_PAL } from "../../src/diottri/grafica/tavolozze";
import { tavolozza } from "../../src/diottri/mondo/disegno";

const esiste = (nome: string) => tavolozza(nome, "giorno")[0] !== "#ff00ff" && tavolozza(nome, "sera")[0] !== "#ff00ff";

describe("Diottri · la grafica", () => {
  it("le mattonelle sono 16×16, coi caratteri 0–3 e una tavolozza che c'è", () => {
    const err: string[] = [];
    for (const [id, t] of Object.entries(MATTONELLE)) {
      err.push(...controllaPx(id, t.px, 16, 16, "0123"));
      (t.anim ?? []).forEach((f, i) => err.push(...controllaPx(`${id}#${i + 1}`, f, 16, 16, "0123")));
      if (!esiste(t.pal)) err.push(`${id}: la tavolozza «${t.pal}» non c'è`);
    }
    expect(err).toEqual([]);
  });

  it("gli oggetti hanno le misure giuste, il solido, il sopra e le tavolozze", () => {
    const err: string[] = [];
    for (const [id, o] of Object.entries(OGGETTI)) {
      err.push(...controllaPx(id, o.px, o.w * 16, o.h * 16, ".0123"));
      if (o.notte) err.push(...controllaPx(`${id} (notte)`, o.notte, o.w * 16, o.h * 16, ".0123"));
      if (o.solido) err.push(...controllaPx(`${id} (solido)`, o.solido, o.w, o.h, "x."));
      if ((o.sopra ?? 0) > o.h) err.push(`${id}: sopra più alto dell'oggetto`);
      const nomi = typeof o.pal === "string" ? [o.pal] : o.pal.flat();
      if (typeof o.pal !== "string" && (o.pal.length !== o.h || o.pal.some(r => r.length !== o.w))) err.push(`${id}: la griglia delle tavolozze non è ${o.h}×${o.w}`);
      for (const n of nomi) if (!esiste(n)) err.push(`${id}: la tavolozza «${n}» non c'è`);
    }
    expect(err).toEqual([]);
  });

  it("i personaggi hanno sei fotogrammi 16×16 coi caratteri . 1 2 3, e la loro tavolozza", () => {
    const err: string[] = [];
    for (const [id, f] of Object.entries(FIGURE)) {
      for (const v of ["giu", "su", "lato"] as const) f[v].forEach((px, i) => err.push(...controllaPx(`${id} ${v} ${i}`, px, 16, 16, ".123")));
      if (!FIGURE_PAL[f.pal]) err.push(`${id}: la tavolozza «${f.pal}» non c'è`);
    }
    expect(LUCCICHIO.length).toBe(3);
    LUCCICHIO.forEach((px, i) => err.push(...controllaPx(`luccichio ${i}`, px, 16, 16, ".123")));
    expect(err).toEqual([]);
  });

  it("le mappe usano solo disegni che esistono", () => {
    const err: string[] = [];
    for (const m of Object.values(MAPPE)) {
      for (const r of m.righe) for (const ch of r) if (!m.legenda[ch]) err.push(`${m.id}: la lettera «${ch}» non è nella legenda`);
      for (const v of Object.values(m.legenda)) if (!MATTONELLE[v.tile]) err.push(`${m.id}: manca la mattonella «${v.tile}»`);
      for (const t of m.timbri) if (!OGGETTI[t.ogg]) err.push(`${m.id}: manca l'oggetto «${t.ogg}»`);
      for (const p of m.personaggi) if (!FIGURE[p.figura]) err.push(`${m.id}: manca la figura «${p.figura}»`);
    }
    for (const f of ["tu_uomo", "tu_donna"]) if (!FIGURE[f]) err.push(`manca la figura «${f}»`);
    expect(err).toEqual([]);
  });
});
