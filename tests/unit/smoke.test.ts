// @vitest-environment jsdom
/* Un giro di prova del gioco vero: ogni intervento dall'inizio alla fine, ogni schermata. */
import { beforeAll, describe, expect, it } from "vitest";
import { LEVELS } from "../../src/content";
import type { FiliLevel, GuastoLevel, IndagineLevel } from "../../src/core/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
let F: any, A: any;
const $ = (s: string) => document.querySelector(s);
const text = () => (document.getElementById("app")!.textContent || "").replace(/\s+/g, " ");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const until = async (cond: () => boolean, max: number) => {
  const t0 = Date.now();
  while (!cond() && Date.now() - t0 < max) await sleep(100);
};

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div><div id="toast" hidden></div>';
  Element.prototype.scrollIntoView = function () {};
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  window.scrollBy = (() => {}) as typeof window.scrollBy;
  const { mountGame } = await import("../../src/game/ui.js");
  mountGame(document.getElementById("app"));
  F = (window as any).__fnt;
  A = F.ACTS;
});

describe("giro completo", () => {
  it("casa e quaderno", () => {
    expect($(".hero-svg")).not.toBeNull();
    A.quaderno();
    A.qtab("prontuario");
    A.qtab("lessico");
    A.qtab("schede");
    A.home();
    A.free();
  });

  for (const lv of LEVELS) {
    if (lv.type === "serata") continue;
    it(lv.id, () => {
      A.open(lv.id);
      expect(text()).toContain(lv.client.who);
      A.next();
      for (let i = 1; i < lv.cards.length; i++) A.cardNext();
      A.cardPrev();
      A.cardNext();
      A.next();
      if (lv.type === "fili") playFili(lv);
      else if (lv.type === "indagine") playIndagine(lv);
      else if (lv.type === "guasto") playGuasto(lv);
      for (let i = 0; i < 3; i++) {
        const q = F.S.run.quiz;
        A.ans(String(q.items[q.i].q.ok));
        A.qnext();
      }
      expect(F.S.step).toBe("esito");
      expect(F.S.run.stars.some(Boolean)).toBe(true);
    });
  }

  it("serata, con il tempo vero", async () => {
    A.open("i9");
    A.next();
    for (let i = 1; i < 4; i++) A.cardNext();
    A.next();
    A.serApp("forno");
    A.serApp("lavat");
    await until(() => F.S.run.ser.black, 6000);
    expect(F.S.run.ser.black).toBe(true);
    A.serK("4.5");
    A.serReset();
    await until(() => F.S.run.ser.m[1], 6000);
    expect(F.S.run.ser.m[1]).toBe(true);
    A.serApp("forno");
    A.serApp("lavat");
    A.serApp("phon");
    A.serApp("stufa");
    await until(() => F.S.run.ser.m[2], 6000);
    expect(F.S.run.ser.m[2]).toBe(true);
    A.next();
    for (let i = 0; i < 3; i++) {
      const q = F.S.run.quiz;
      A.ans(String(q.items[q.i].q.ok));
      A.qnext();
    }
    expect(F.S.run.stars).toEqual([true, true, true]);
  });

  it("laboratori", () => {
    A.home();
    A.open("i2");
    A.next();
    const inp = document.getElementById("lab-joule") as HTMLInputElement;
    inp.value = "5";
    inp.dispatchEvent(new Event("input"));
    expect(document.getElementById("jw")!.textContent).toMatch(/W$/);
    A.open("i8");
    A.next();
    A.cardNext();
    const d = document.getElementById("lab-diff") as HTMLInputElement;
    d.value = "25";
    d.dispatchEvent(new Event("input"));
    expect(document.getElementById("dd")!.textContent).toContain("staccato");
  });
});

function playFili(lv: FiliLevel) {
  if (lv.shop) {
    lv.shop.opts.forEach((o, i) => {
      if (o.ok) A.shopSel(String(i));
    });
    A.shopDone();
    A.next();
  }
  if (lv.safety.type === "spina") {
    A.work();
    expect($("#shock")).not.toBeNull();
    A.plug();
    A.work();
  } else {
    A.work();
    expect($("#shock")).not.toBeNull();
    A.brk(lv.safety.feed);
    A.tag();
    A.tprova();
    lv.safety.probes.forEach((_, i) => A.probe(String(i)));
    A.work();
  }
  expect(F.S.step).toBe("fili");
  const tap = (t: string) => (t.endsWith(".x") ? A.tapC(t.split(".")[0]) : A.tapT(t));
  for (const [a, b, color, sec] of lv.solution) {
    if (color) A.color(color);
    if (sec) A.sec(String(sec));
    tap(a);
    tap(b);
    expect(F.S.run.msg?.k, `rifiutato ${a}→${b}: ${F.S.run.msg?.t}`).not.toBe("warn");
  }
  expect(F.S.run.wires.length).toBe(lv.solution.length);
  A.zoom();
  A.zoom();
  A.hint();
  A.next();
  lv.check.forEach((c, i) => {
    if (c.ok) A.chk(String(i));
  });
  A.next();
  A.bet("ok");
  A.power();
  const c = F.S.run.col;
  expect(c.outcome, JSON.stringify(c.issues)).toBe("ok");
  for (const id of c.sw) A.toggleSw(id);
  A.next();
}

function playIndagine(lv: IndagineLevel) {
  A.indBet("2");
  A.indBrk("diff");
  lv.ind.apps.forEach(a => A.indPlug(a.id));
  A.indBrk("diff");
  lv.ind.apps.forEach(a => A.indPlug(a.id));
  A.indDone();
  A.indChi("lavat");
  A.indCosa("0");
  expect(text()).toContain("Il caso");
  A.next();
}

function playGuasto(lv: GuastoLevel) {
  // ogni guasto del livello: misura, diagnosi giusta, riparazione a linea spenta, collaudo
  for (let fi = 0; fi < lv.faults.length; fi++) {
    if (fi > 0) {
      A.open(lv.id);
      A.next();
      for (let i = 1; i < lv.cards.length; i++) A.cardNext();
      A.next();
    }
    A.setFault(String(fi));
    expect(F.S.step).toBe("banco");
    A.lineOn();
    const pts = F.probePoints(lv);
    A.probeT(pts[0]);
    A.probeT(pts[1]);
    expect(F.S.run.bench.log.length).toBe(1);
    A.meterMode("ohm");
    A.lineOff();
    A.probeT(pts[0]);
    A.probeT(pts[2]);
    A.diagOpen();
    A.diagPick(lv.faults[fi].id);
    expect(F.S.run.bench.diag.ok).toBe(true);
    A.repair();
    expect(F.S.run.bench.repaired).toBe(true);
    A.lineOn();
    if (fi < lv.faults.length - 1) continue;
    A.next();
  }
}
