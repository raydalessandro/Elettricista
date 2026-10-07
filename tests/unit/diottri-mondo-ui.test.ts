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

  it("l'introduzione: la copertina, Iride presenta il mondo, si sceglie chi sei; poi il borgo, sfocato", async () => {
    expect(F.S.screen).toBe("mondo");
    expect(F.mondo.stato.mappa).toBe("intro");
    expect(app().querySelector(".gb .gb-croce")).not.toBeNull();
    expect(app().querySelector(".gb .gb-a")).not.toBeNull();
    await pausa(60);
    expect(F.mondo.velo).toContain("DIOTTRI");
    const visti: string[] = [];
    for (let i = 0; i < 80 && !F.mondo.scelta; i++) { visti.push(F.mondo.testo); F.mondo.premi("a"); await pausa(35); }
    expect(visti.join(" ")).toContain("il 20% è tuo");
    expect(F.mondo.quadro).toBe("scelta");
    expect(F.mondo.scelta).toEqual(["Uomo", "Donna"]);
    F.mondo.premi("a"); // Uomo
    await aFinche(() => F.mondo.stato.mappa === "borgo");
    expect(F.prog.chi).toBe("uomo");
    await pausa(60);
    expect(F.mondo.testo).toContain("l'insegna è una macchia");
    await aFinche(() => !F.mondo.occupato);
    expect(F.mondo.stato.segni).toContain("inizio");
    expect(nebbia(ctx())).toBe(4); // la tua miopia, prima del controllo
  });

  it("il prologo: Iride ti misura, fuori la strada è nitida, la notte il furto, il mattino le regole", async () => {
    await porta(8, 8);
    expect(F.mondo.stato.mappa).toBe("bottega");
    await aFinche(() => F.mondo.stato.segni.includes("misurato") && !F.mondo.occupato);
    expect(F.mondo.stato.segni).not.toContain("furto");
    await porta(4, 8); // fuori, con gli occhiali nuovi
    expect(F.mondo.stato.mappa).toBe("borgo");
    await pausa(60);
    expect(nebbia(ctx())).toBe(0);
    expect(F.mondo.testo).toContain("Che nitido");
    await aFinche(() => F.mondo.stato.segni.includes("furto") && !F.mondo.occupato);
    expect(nebbia(ctx())).toBe(5); // senza i Diottri il borgo è starato
    await porta(8, 8);
    await aFinche(() => F.mondo.stato.segni.includes("prologo") && !F.mondo.occupato);
    expect(F.mondo.stato.mappa).toBe("bottega");
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

  it("il menu non manda avanti i dialoghi; B sceglie «Dopo.»", async () => {
    await vaiAccanto(18, 11); // Giulia
    F.mondo.premi("a");
    await pausa(40);
    const prima = F.mondo.testo;
    expect(prima).toContain("occhi stanchi");
    F.mondo.premi("a"); // finisce di scrivere
    F.mondo.premi("menu");
    await pausa(30);
    expect(F.mondo.testo).toBe(prima);
    expect(F.mondo.menu).toBeNull();
    F.mondo.premi("a");
    await pausa(30);
    expect(F.mondo.scelta).toEqual(["Sì, andiamo!", "Dopo."]);
    F.mondo.premi("b");
    await aFinche(() => !F.mondo.occupato);
    expect(F.S.screen).toBe("mondo");
  });

  it("al lago: Nando vende la canoa, se in cassa c'è abbastanza; poi si va sull'acqua", async () => {
    F.mondo.stato.segni.push("prova-negozio");
    F.prog.soldi = 100;
    await vaiAccanto(24, 19); // Nando, davanti al capanno
    F.mondo.premi("a");
    await aFinche(() => !!F.mondo.scelta);
    expect(F.mondo.scelta[0]).toBe("Canoa 120 €");
    F.mondo.premi("a"); // la canoa
    await aFinche(() => !!F.mondo.scelta);
    F.mondo.premi("a"); // sì
    await aFinche(() => F.mondo.testo.includes("Ti mancano"));
    expect(F.mondo.testo).toContain("Ti mancano 20 €");
    await aFinche(() => !!F.mondo.scelta);
    F.mondo.premi("b"); // esci
    await aFinche(() => !F.mondo.occupato);
    expect(F.mondo.stato.segni).not.toContain("ha:canoa");
    F.prog.soldi = 150;
    F.mondo.premi("a");
    await aFinche(() => !!F.mondo.scelta);
    F.mondo.premi("a");
    await aFinche(() => !!F.mondo.scelta);
    F.mondo.premi("a");
    await aFinche(() => F.mondo.testo.includes("Ecco la canoa"));
    await aFinche(() => !F.mondo.occupato);
    expect(F.mondo.stato.segni).toContain("ha:canoa");
    expect(F.prog.soldi).toBe(30);
    // in acqua: si va in canoa
    await vaiAccanto(23, 20);
    expect(F.mondo.cammina("giu")).toBe("mosso");
    expect(F.mondo.mezzo).toBe("canoa");
  });

  it("in bici: dal menu si sale, e si resta in bici anche riaprendo il gioco", async () => {
    F.mondo.stato.segni.push("ha:bici");
    await vaiAccanto(14, 12);
    F.mondo.premi("menu");
    const voce = [...app().querySelectorAll<HTMLElement>(".gb-menu [data-voce]")].find(v => v.dataset.voce === "bici")!;
    expect(voce.textContent).toBe("Sali in bici");
    voce.click();
    expect(F.mondo.mezzo).toBe("bici");
    expect(F.prog.mondo.mezzo).toBe("bici");
    expect(F.mondo.menu).toBeNull(); // il menu si è chiuso
  });

  it("chiudi e riapri: sei dove eri, coi segni della storia", async () => {
    const dove = { ...F.mondo.stato };
    await mount();
    expect(F.S.screen).toBe("mondo");
    expect(F.prog.mondo.mappa).toBe(dove.mappa);
    expect([F.prog.mondo.x, F.prog.mondo.y]).toEqual([dove.x, dove.y]);
    expect(F.prog.mondo.segni).toEqual(expect.arrayContaining(["prologo", "furto", "ha:canoa"]));
    expect(fattoUI("c1") && fattoUI("r1")).toBe(true);
    expect(F.mondo.mezzo).toBe("bici");
  });

  it("chiuso sul risultato di un caso: riaprendo, il cliente dice quello che mancava", async () => {
    await aFinche(() => !F.mondo.occupato);
    await vaiAccanto(18, 11); // Giulia
    F.mondo.premi("a");
    await aFinche(() => !!F.mondo.scelta);
    F.mondo.premi("a"); // sì, andiamo
    await aFinche(() => F.S.screen === "caso");
    expect(F.S.id).toBe("c2");
    expect(F.prog.mondo.sospeso).toBe("c2");
    // il caso, giocato bene
    const def = F.CASO.c2, st = F.S.caso;
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
    for (let i = 0; i < 3 && F.S.caso.dubbi.some((d: { aperto: boolean }) => d.aperto); i++) {
      const d = F.S.caso.dubbi.find((x: { aperto: boolean }) => x.aperto);
      act("mostra", def.dubbi.find((x: { id: string }) => x.id === d.id).mostra.find((m: { esito: string }) => m.esito === "risponde").id);
    }
    act("consegna");
    expect(app().textContent).toContain("Ci vedo!");
    expect(app().textContent).toContain("A te il 20%");
    // si chiude il gioco qui, senza toccare «Torna al borgo»
    await mount();
    expect(F.S.screen).toBe("mondo");
    await pausa(60);
    expect(F.mondo.testo).toContain("Che differenza");
    await aFinche(() => !F.mondo.occupato);
    expect(F.mondo.fase).toBe("sera"); // «Si fa sera.» è passato anche lui
    expect(F.prog.mondo.sospeso).toBeUndefined();
  });
});
