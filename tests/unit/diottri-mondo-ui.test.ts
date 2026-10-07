// @vitest-environment jsdom
/* Diottri nel mondo, con l'interfaccia vera (senza canvas): il prologo nella bottega, Marco al binario che apre
   il primo caso, il primo luccichio, il menu, e la storia che resta dopo aver chiuso e riaperto. */
import { beforeAll, describe, expect, it } from "vitest";
import { MAPPE, nebbia } from "../../src/diottri/content/borgo";
import { soluzioneProva } from "../../src/diottri/core/caso";
import { grandezzaGiusta } from "../../src/diottri/core/riconosci";
import { risolviCaso } from "../../src/diottri/core/risolutore";
import { strada } from "../../src/diottri/mondo/motore";
import type { Contesto, Dir } from "../../src/diottri/mondo/tipi";

/* eslint-disable @typescript-eslint/no-explicit-any */
let F: any;
const app = () => document.getElementById("app")!;
const pausa = (ms = 30) => new Promise(r => setTimeout(r, ms));
const act = (a: string, arg = "") => { F.ACTS[a](arg); F.render(); };
const tap = (sel: string) => { const el = app().querySelector<HTMLElement>(sel); if (!el) throw new Error("non trovato: " + sel); el.click(); };
const fattoUI = (id: string) => { const f = F.prog.fatti[id]; return !!f && (!!f.preso || !!f.stelle); };
const ctx = (): Contesto => ({ fatto: fattoUI, segni: F.mondo.stato.segni });

function mount() {
  document.body.innerHTML = '<div id="app" class="dio"></div><div id="toast" hidden></div>';
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  return import("../../src/diottri/ui").then(({ mountDiottri }) => {
    mountDiottri(app(), { home: "/" });
    F = (window as any).__dio;
  });
}

/** Preme A finché la condizione non vale: i dialoghi, le scelte (la prima voce), il buio. */
async function aFinche(cond: () => boolean, max = 120) {
  for (let i = 0; i < max && !cond(); i++) { F.mondo.premi("a"); await pausa(35); }
  expect(cond()).toBe(true);
}

/** Cammina fino a stare accanto alla cella (x, y) e si gira verso di lei. */
async function vaiAccanto(x: number, y: number) {
  const st = F.mondo.stato;
  const dirs: Dir[] | null = strada(MAPPE[st.mappa], st, x, y, ctx());
  expect(dirs, `strada fino a ${x},${y}`).not.toBeNull();
  for (const d of dirs!) { expect(F.mondo.cammina(d)).toBe("mosso"); await pausa(2); }
  st.dir = x > st.x ? "destra" : x < st.x ? "sinistra" : y > st.y ? "giu" : "su";
}

/** Passa dalla porta che sta in (x, y). */
async function porta(x: number, y: number) {
  await vaiAccanto(x, y);
  expect(F.mondo.cammina(F.mondo.stato.dir)).toBe("porta");
  await pausa(260);
}

describe("Diottri · il mondo nell'interfaccia", () => {
  beforeAll(async () => {
    localStorage.clear();
    await mount();
  });

  it("dopo «chi sei» si entra nel borgo, sfocato, con la console", async () => {
    expect(app().textContent).toContain("Chi sei?");
    tap("[data-act=chi][data-arg=uomo]");
    expect(F.S.screen).toBe("mondo");
    expect(app().querySelector(".gb .gb-croce")).not.toBeNull();
    expect(app().querySelector(".gb .gb-a")).not.toBeNull();
    await pausa(60);
    expect(F.mondo.testo).toContain("l'insegna è una macchia");
    await aFinche(() => !F.mondo.occupato);
    expect(F.mondo.stato.segni).toContain("inizio");
    expect(nebbia(ctx())).toBe(4); // la tua miopia, prima del controllo
  });

  it("il prologo: nella bottega Iride ti misura, poi il furto, poi le due regole", async () => {
    await porta(8, 8);
    expect(F.mondo.stato.mappa).toBe("bottega");
    await aFinche(() => F.mondo.stato.segni.includes("prologo"));
    expect(F.mondo.stato.segni).toEqual(expect.arrayContaining(["misurato", "furto", "prologo"]));
    await aFinche(() => !F.mondo.occupato);
    expect(nebbia(ctx())).toBe(5); // senza i Diottri il borgo è starato
  });

  it("Marco al binario apre il primo caso; finito, legge il tabellone e indica l'edicola", async () => {
    await porta(4, 8);
    expect(F.mondo.stato.mappa).toBe("borgo");
    await aFinche(() => !F.mondo.occupato);
    await vaiAccanto(10, 3);
    F.mondo.premi("a");
    await aFinche(() => F.S.screen === "caso");
    expect(F.S.id).toBe("c1");
    // il caso, come lo giocherebbe un ottico bravo
    const def = F.CASO.c1, st = F.S.caso;
    const rif = risolviCaso(def, st.seed, st.vassoio);
    for (const q of def.domande) if (!q.giaDetto && (q.chiave || q.rivela)) act("chiedi", q.id);
    act("prova");
    for (const o of ["od", "os"]) {
      act("occhio", o);
      const t = soluzioneProva({ rx: st.occhio[o], age: st.occhio.age });
      for (let g = 0; g < 60 && Math.abs(F.S.caso.prova.v - t) > 1e-9; g++) act("sposta", String(Math.sign(t - F.S.caso.prova.v) * (Math.abs(t - F.S.caso.prova.v) >= 1 ? 1 : 0.25)));
      act("conferma");
    }
    for (const [p, id] of Object.entries(rif.posti)) if (st.posti[p] !== id) act("metti", `${p}|${id}`);
    act("consegna");
    expect(app().textContent).toContain("Ci vedo!");
    tap("[data-act=fineCaso]");
    expect(F.S.screen).toBe("mondo");
    expect(app().querySelector(".gb")).not.toBeNull();
    await pausa(40);
    await aFinche(() => F.mondo.testo.includes("edicola"));
    await aFinche(() => !F.mondo.occupato);
    expect(fattoUI("c1")).toBe(true);
  });

  it("il luccichio dell'edicola apre il riconoscimento; preso, il borgo si vede meglio", async () => {
    await vaiAccanto(22, 7);
    F.mondo.premi("a");
    await aFinche(() => F.S.screen === "ric");
    const def = F.RIC.r1, st = F.S.ric;
    act("provaRic", "neutralizza");
    act("sceltaId", def.specie);
    act("sceltaG", grandezzaGiusta(def, st) ?? "");
    act("riconosci");
    expect(st.fine).toBe("preso");
    tap("[data-act=fineRic]");
    expect(F.S.screen).toBe("mondo");
    await pausa(40);
    await aFinche(() => !F.mondo.occupato);
    expect(F.prog.vassoio).toContain("bombo");
    expect(nebbia(ctx())).toBe(4);
  });

  it("il menu porta al percorso e al vassoio, e si torna al borgo", async () => {
    F.mondo.premi("menu");
    expect(app().querySelector(".gb-menu:not([hidden])")).not.toBeNull();
    (app().querySelector("[data-voce=percorso]") as HTMLElement).click();
    expect(F.S.screen).toBe("home");
    tap("[data-act=mondo]");
    expect(F.S.screen).toBe("mondo");
    expect(app().querySelector(".gb")).not.toBeNull();
  });

  it("chiudi e riapri: sei dove eri, coi segni della storia", async () => {
    const dove = { ...F.mondo.stato };
    await mount();
    expect(F.S.screen).toBe("mondo");
    expect(F.prog.mondo.mappa).toBe(dove.mappa);
    expect([F.prog.mondo.x, F.prog.mondo.y]).toEqual([dove.x, dove.y]);
    expect(F.prog.mondo.segni).toEqual(expect.arrayContaining(["prologo", "furto"]));
    expect(fattoUI("c1") && fattoUI("r1")).toBe(true);
  });
});
