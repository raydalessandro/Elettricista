/* ====== DIOTTRI · LE TACCHE DEI BISOGNI ======
   Ogni bisogno ha da 0 a 3 tacche, calcolate dai modelli dell'ottica con l'occhiale come è adesso:
   la vista dal modello dell'occhio, lo spessore e i riflessi dal modello della lente, sole e riflessi
   dell'acqua dal modello del sole. Niente tacche scritte a mano. */
import { COMFORT, PLANO, see, type Sight, type SphCyl } from "../../ottica/core/eye";
import { riflesso, spessore, spessoreMax } from "../../ottica/core/lente";
import { allaGuida, CATEGORIE, riflessoAcqua } from "../../ottica/core/sole";
import type { Bisogno, BisognoDef, CasoDef, CasoState, Occhi, Opzione, PostoId } from "./tipi";

/** luce che passa da una lente chiara senza filtro */
export const CHIARA = 0.92;

/** La lente davanti agli occhi adesso: quella misurata, o gli occhiali che porta, o niente. */
export function lenteAttuale(def: CasoDef, st: CasoState): Occhi {
  if (st.lente) return { od: st.lente.od, os: st.lente.os };
  if (def.vecchi) return { od: def.vecchi.od, os: def.vecchi.os };
  return { od: PLANO, os: PLANO };
}

/** L'opzione messa adesso in un posto. */
export function opzioneDi(def: CasoDef, st: CasoState, posto: PostoId): Opzione {
  const opts = def.posti[posto]!;
  return opts.find(o => o.id === st.posti[posto]) || opts[0];
}

/** Il materiale, l'antiriflesso, la montatura e il filtro dell'occhiale come è adesso. */
export function occhiale(def: CasoDef, st: CasoState) {
  const get = (p: PostoId) => (def.posti[p] ? opzioneDi(def, st, p) : undefined);
  const mat = get("materiale"), tr = get("trattamento"), mon = get("montatura"), fil = get("filtro");
  const filtro = fil?.filtro ?? null;
  return {
    materiale: mat?.materiale ?? "cr39",
    antiriflesso: !!tr?.antiriflesso,
    filtroBlu: !!tr?.filtroBlu,
    montatura: mon?.montatura ?? { calibro: 52, ponte: 18 },
    filtro,
    trasm: filtro ? CATEGORIE[filtro.categoria].tipico : CHIARA,
  };
}

/** Cosa vedono i due occhi a una distanza, con la lente di adesso. */
export function vista(def: CasoDef, st: CasoState, d: number): { od: Sight; os: Sight } {
  const l = lenteAttuale(def, st);
  return { od: see({ rx: st.occhio.od, age: st.occhio.age }, l.od, d), os: see({ rx: st.occhio.os, age: st.occhio.age }, l.os, d) };
}

/** Tacche di vista: da lontano si vuole nitido e a riposo; da vicino nitido e comodo. */
export function taccheVista(s: Sight, lontano: boolean): number {
  if (s.sharp === "molto" || s.work === "nonbasta") return 3;
  if (s.sharp === "sfocato" || s.work === "fatica") return 2;
  if (s.sharp === "quasi") return 1;
  if (lontano) return s.work === "riposo" ? 0 : 1;
  return s.effort <= COMFORT + 1e-9 ? 0 : 2;
}

const notaVista = (s: Sight, lontano: boolean) => {
  const n = taccheVista(s, lontano);
  if (n === 0) return lontano ? "nitido, a riposo" : "nitido e comodo";
  if (s.sharp === "nitido") return s.work === "fatica" ? "nitido, ma in fatica" : "nitido, ma l'occhio lavora";
  return { quasi: "quasi nitido", sfocato: "sfocato", molto: "molto sfocato", nitido: "" }[s.sharp];
};

/** Lo spessore più grande dei due occhi, mm, con l'occhiale di adesso. */
export function spessoreAttuale(def: CasoDef, st: CasoState): number {
  const l = lenteAttuale(def, st), o = occhiale(def, st);
  const sp = (x: SphCyl) => spessoreMax(spessore(x.sph + Math.min(0, x.cyl), o.materiale, o.montatura, def.dp));
  return Math.max(sp(l.od), sp(l.os));
}

export function taccheSpessore(mm: number): number {
  return mm <= 5 + 1e-9 ? 0 : mm <= 6 + 1e-9 ? 1 : mm <= 7 + 1e-9 ? 2 : 3;
}

/** Riflesso di una superficie, frazione, con l'occhiale di adesso. */
export function riflessoAttuale(def: CasoDef, st: CasoState): number {
  const o = occhiale(def, st);
  return riflesso(o.materiale, o.antiriflesso);
}

export function taccheRiflessi(r: number): number {
  return r <= 0.01 ? 0 : r < 0.05 ? 2 : 3;
}

export function taccheSole(trasm: number): number {
  return trasm <= 0.18 + 1e-9 ? 0 : trasm <= 0.43 + 1e-9 ? 1 : 3;
}

/** Quanto resta del riflesso dell'acqua rispetto a una lente chiara. */
export function abbagliamentoAttuale(def: CasoDef, st: CasoState): number {
  const o = occhiale(def, st);
  return riflessoAcqua(o.trasm, !!o.filtro?.polarizzata) / CHIARA;
}

export function taccheAbbagliamento(r: number): number {
  return r <= 0.06 ? 0 : r <= 0.2 ? 1 : r <= 0.5 ? 2 : 3;
}

/** I bisogni del cliente, con le tacche di adesso. */
export function bisogni(def: CasoDef, st: CasoState): Bisogno[] {
  const out: Bisogno[] = def.bisogni.map(b => valuta(def, st, b));
  for (const d of st.dubbi) if (d.aperto) {
    const dd = def.dubbi!.find(x => x.id === d.id)!;
    out.push({ tipo: "dubbio", nome: "Un dubbio", tacche: 1, visibile: true, nota: dd.domanda });
  }
  return out;
}

function valuta(def: CasoDef, st: CasoState, b: BisognoDef): Bisogno {
  const visibile = !b.nascosto || st.scoperti.includes(b.tipo);
  const base = { ...b, visibile };
  switch (b.tipo) {
    case "lontano":
    case "vicino": {
      const lontano = b.tipo === "lontano";
      const v = vista(def, st, lontano ? Infinity : b.d ?? 0.4);
      const n = Math.max(taccheVista(v.od, lontano), taccheVista(v.os, lontano));
      const peggio = taccheVista(v.od, lontano) >= taccheVista(v.os, lontano) ? v.od : v.os;
      return { ...base, tacche: n, nota: notaVista(peggio, lontano) };
    }
    case "spessore": {
      const mm = spessoreAttuale(def, st);
      return { ...base, tacche: taccheSpessore(mm), nota: `${mm.toLocaleString("it-IT", { maximumFractionDigits: 1 })} mm` };
    }
    case "riflessi": {
      const r = riflessoAttuale(def, st);
      return { ...base, tacche: taccheRiflessi(r), nota: `${(r * 100).toLocaleString("it-IT", { maximumFractionDigits: 1 })}% per superficie` };
    }
    case "sole": {
      const t = occhiale(def, st).trasm;
      return { ...base, tacche: taccheSole(t), nota: `passa il ${Math.round(t * 100)}% della luce` };
    }
    case "abbagliamento": {
      const r = abbagliamentoAttuale(def, st);
      const n = taccheAbbagliamento(r);
      return { ...base, tacche: n, nota: n === 0 ? "riflesso ridotto" : n === 1 ? "il riflesso disturba" : "il riflesso acceca" };
    }
    case "schermi": {
      // un uso, non un difetto: il difetto lo corregge la lente, il trattamento serve a come la usa
      const o = occhiale(def, st);
      const ok = o.filtroBlu || o.antiriflesso;
      return { ...base, tacche: ok ? 0 : 1, nota: ok ? "un trattamento per lo schermo" : "niente per lo schermo" };
    }
    case "guida": {
      const f = occhiale(def, st).filtro;
      const vietato = !!f && !allaGuida(f.categoria);
      return { ...base, tacche: 0, vietato, nota: vietato ? "la categoria 4 non va alla guida" : "va bene anche al volante" };
    }
    case "dubbio":
      return { ...base, tacche: 0, nota: "" };
  }
}

export const totaleTacche = (bs: Bisogno[]) => bs.reduce((s, b) => s + b.tacche + (b.vietato ? 3 : 0), 0);
