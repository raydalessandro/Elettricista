/* Diottri: il mondo. Il motore della mappa, le porte, il banco, lo starato, e il robot che gioca tutto il Borgo. */
import { describe, expect, it } from "vitest";
import { ORDINE } from "../../src/diottri/content";
import { fase, INIZIO, MAPPE, nebbia } from "../../src/diottri/content/borgo";
import { chiDavanti, eventoArrivo, passo, personaggiPresenti, solidoA, strada } from "../../src/diottri/mondo/motore";
import { giocaTutto } from "../../src/diottri/mondo/robot";
import type { Contesto, StatoMondo } from "../../src/diottri/mondo/tipi";

const contesto = (fatti: string[] = [], segni: string[] = []): Contesto => ({ fatto: id => fatti.includes(id), segni });
const DOPO_PROLOGO = ["inizio", "misurato", "furto", "prologo"];

describe("Diottri · il motore della mappa", () => {
  it("si comincia in fondo alla strada, e la prima riga dice dell'insegna sfocata", () => {
    const ctx = contesto();
    expect(MAPPE[INIZIO.mappa]).toBeDefined();
    expect(solidoA(MAPPE.borgo, INIZIO.x, INIZIO.y, ctx)).toBe(false);
    const ev = eventoArrivo(MAPPE.borgo, ctx)!;
    expect(JSON.stringify(ev)).toContain("macchia");
  });

  it("i muri bloccano, ci si gira prima di camminare, le porte portano dentro", () => {
    const ctx = contesto([], DOPO_PROLOGO);
    const s: StatoMondo = { mappa: "borgo", x: 8, y: 9, dir: "giu", segni: ctx.segni };
    expect(passo(MAPPE.borgo, s, "su", ctx)).toEqual({ esito: "girato" });
    const p = passo(MAPPE.borgo, s, "su", ctx);
    expect(p.esito).toBe("porta");
    if (p.esito === "porta") expect(p.porta.verso.mappa).toBe("bottega");
    const muro: StatoMondo = { mappa: "borgo", x: 1, y: 9, dir: "sinistra", segni: ctx.segni };
    expect(passo(MAPPE.borgo, muro, "sinistra", ctx).esito).toBe("bloccato");
    const casa: StatoMondo = { mappa: "borgo", x: 2, y: 8, dir: "su", segni: ctx.segni };
    const ch = passo(MAPPE.borgo, casa, "su", ctx);
    expect(ch.esito).toBe("chiusa");
  });

  it("con la Maestra si parla da questa parte del banco", () => {
    const ctx = contesto([], DOPO_PROLOGO);
    const s: StatoMondo = { mappa: "bottega", x: 5, y: 4, dir: "su", segni: ctx.segni };
    const d = chiDavanti(MAPPE.bottega, s, ctx);
    expect(d?.tipo).toBe("personaggio");
    if (d?.tipo === "personaggio") expect(d.p.id).toBe("iride");
  });

  it("i clienti arrivano uno alla volta, quando tocca a loro", () => {
    const chi = (fatti: string[]) => [...personaggiPresenti(MAPPE.borgo, contesto(fatti, DOPO_PROLOGO)), ...personaggiPresenti(MAPPE.bottega, contesto(fatti, DOPO_PROLOGO))].map(p => p.id);
    expect(chi([])).toContain("marco");
    expect(chi([])).not.toContain("giulia");
    expect(chi(["c1", "r1"])).toContain("giulia");
    expect(chi(["c1", "r1", "c2", "r2"])).toContain("davide");
    expect(chi(["c1", "r1", "c2", "r2", "c3", "r3"])).toContain("paolo");
    expect(chi(["c1", "r1", "c2", "r2", "c3", "r3", "c4", "r4", "r5"])).toContain("luisa");
    expect(personaggiPresenti(MAPPE.borgo, contesto([], [])).map(p => p.id)).not.toContain("marco"); // prima del prologo no
  });

  it("lo starato: prima del controllo la tua miopia, dopo il furto cala a ogni Diottro ritrovato", () => {
    expect(nebbia(contesto([], []))).toBe(4);
    expect(nebbia(contesto([], ["misurato"]))).toBe(0);
    expect(nebbia(contesto([], DOPO_PROLOGO))).toBe(5);
    expect(nebbia(contesto(["r1", "r2"], DOPO_PROLOGO))).toBe(3);
    expect(nebbia(contesto(["r1", "r2", "r3", "r4", "r5"], DOPO_PROLOGO))).toBe(0);
  });

  it("il prologo interrotto a metà riprende da dove era rimasto", () => {
    const resto = (segni: string[]) => JSON.stringify(eventoArrivo(MAPPE.bottega, contesto([], segni)));
    expect(resto(["inizio"])).toContain("Buongiorno");
    expect(resto(["inizio", "misurato"])).not.toContain("Buongiorno");
    expect(resto(["inizio", "misurato"])).toContain("Quella notte");
    expect(resto(["inizio", "misurato", "furto"])).not.toContain("Quella notte");
    expect(resto(["inizio", "misurato", "furto"])).toContain('"segna":"prologo"');
    expect(eventoArrivo(MAPPE.bottega, contesto([], DOPO_PROLOGO))).toBeNull();
  });

  it("la sera va da Giulia a Davide", () => {
    expect(fase(contesto(["c1", "r1"]))).toBe("giorno");
    expect(fase(contesto(["c1", "r1", "c2"]))).toBe("sera");
    expect(fase(contesto(["c1", "r1", "c2", "r2", "c3"]))).toBe("giorno");
  });

  it("dal centro della piazza si arriva a ogni zona del borgo", () => {
    const ctx = contesto([], DOPO_PROLOGO);
    const s: StatoMondo = { mappa: "borgo", x: 14, y: 10, dir: "giu", segni: ctx.segni };
    for (const [x, y] of [[10, 3], [22, 7], [6, 18], [4, 23], [26, 19], [22, 23], [3, 14]]) expect(strada(MAPPE.borgo, s, x, y, ctx), `${x},${y}`).not.toBeNull();
  });
});

describe("Diottri · il robot gioca tutto il Borgo", () => {
  it("dal prologo all'attestato: ogni passo si raggiunge, niente vicoli ciechi", async () => {
    const r = await giocaTutto({ seme: 3 });
    expect(r.bloccato).toBeNull();
    expect([...r.partita.fatti].sort()).toEqual(ORDINE.map(o => o.id).sort());
    expect(r.partita.stato.segni).toEqual(expect.arrayContaining(["prologo", "furto", "attestato"]));
    const ctx = contesto(r.partita.fatti, r.partita.stato.segni);
    expect(nebbia(ctx)).toBe(0);
    expect(fase(ctx)).toBe("giorno");
    expect(r.testi.some(t => t.includes("Valle delle Montature"))).toBe(true);
  });

  it("salvare e ricaricare è uguale a continuare", async () => {
    const meta = await giocaTutto({ seme: 5, fermaDopo: 4 });
    expect(meta.bloccato).toBeNull();
    expect(meta.partita.fatti.length).toBe(4);
    const ripresa = JSON.parse(JSON.stringify(meta.partita));
    const fine = await giocaTutto({ seme: 5, partita: ripresa });
    expect(fine.bloccato).toBeNull();
    expect(fine.partita.fatti.length).toBe(ORDINE.length);
    expect(fine.partita.stato.segni).toContain("attestato");
  });

  it("con tanti semi diversi il robot arriva sempre in fondo", async () => {
    for (const seme of [1, 2, 4, 7, 11]) {
      const r = await giocaTutto({ seme });
      expect(r.bloccato, `seme ${seme}`).toBeNull();
      expect(r.partita.fatti.length).toBe(ORDINE.length);
    }
  });
});
