// @vitest-environment jsdom
/* Un giro completo del corso di ottica: ogni livello, ogni schermata, una volta da bravi e una volta con errori. */
import { beforeAll, describe, expect, it } from "vitest";
import { CARDS, LEVELS } from "../../src/ottica/content";
import { isLensProva, solutions, withVariant } from "../../src/ottica/core/prova";
import { validateOttica } from "../../src/ottica/standard/validate";

/* eslint-disable @typescript-eslint/no-explicit-any */
let F: any, A: any;
const text = () => (document.getElementById("app")!.textContent || "").replace(/\s+/g, " ");

beforeAll(async () => {
  document.body.innerHTML = '<div id="app" class="ott"></div><div id="toast" hidden></div>';
  Element.prototype.scrollIntoView = function () {};
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  const { mountOttica } = await import("../../src/ottica/ui");
  mountOttica(document.getElementById("app"));
  F = (window as any).__sca;
  A = F.ACTS;
});

/** gioca il dialogo in corso: con bravo=true sempre la scelta migliore, altrimenti prima una sbagliata */
function playDialog(bravo: boolean) {
  const r = F.S.run, id = r.dq[r.di], d = F.DLG[id];
  for (let guard = 0; guard < 40; guard++) {
    const st = r.dlg[id];
    if (st.done) return st;
    const s = d.steps[st.step];
    const best = s.choices.findIndex((c: any) => c.ok === "best");
    const wrong = s.choices.findIndex((c: any, i: number) => (c.ok === "no" || c.ok === "grave") && !st.tried.includes(i));
    A.say(String(!bravo && wrong >= 0 && st.step === 0 ? wrong : best));
  }
  throw new Error("dialogo senza fine: " + id);
}

function playProva(lv: any, bravo: boolean) {
  const p = lv.prova;
  if (!p) return;
  if (p.type === "ricetta") {
    expect(text()).toContain("Leggi la ricetta");
    if (!bravo) A.cell("OD.SF"); // sbagliato: la prima domanda chiede dell'occhio sinistro
    for (const t of p.tasks) A.cell(t.ok[0]);
    expect(text()).toContain("Che occhiale fare?");
    for (const k of ["lontano", "vicino", "progressive", "ufficio"]) { A.rxPick(k); for (const g of ["strada", "pc", "giornale"]) A.rxLook(g); }
    expect(text()).toContain("Computer e giornale nitidi, la strada no");
    return;
  }
  A.bet(String(bravo ? p.bet.ok : (p.bet.ok + 1) % p.bet.o.length));
  expect(document.querySelector("#simv")).not.toBeNull();
  // la soluzione della partita: la ricetta del cliente cambia a ogni partita
  const sols = F.sol();
  expect(sols.length).toBe(1);
  const sol = sols[0];
  if (!bravo) { A.setV(String(sol + (p.type === "asse" ? 30 : 0.5))); A.confirm(); expect(F.S.run.firstOk).toBe(false); }
  A.view("1");
  A.vUp();
  A.vDown();
  A.setV(String(sol));
  A.confirm();
  expect(F.S.run.ok).toBe(true);
  A.hint();
}

describe("corso di ottica, giro completo", () => {
  it("lo standard è rispettato", () => {
    const errors = validateOttica(LEVELS, CARDS).filter(f => f.sev === "errore");
    expect(errors).toEqual([]);
  });

  it("casa e quaderno", () => {
    expect(document.querySelector(".hero-svg")).not.toBeNull();
    A.quaderno();
    A.qtab("prontuario");
    A.qtab("lessico");
    A.qtab("schede");
    A.home();
    A.free();
  });

  for (const bravo of [true, false]) {
    for (const lv of LEVELS) {
      it(`${lv.id} ${bravo ? "da bravi" : "con errori"}`, () => {
        A.open(lv.id);
        expect(text()).toContain(lv.customer.msg);
        A.next();
        for (let i = 1; i < lv.cards.length; i++) A.cardNext();
        A.cardPrev();
        A.cardNext();
        // ogni laboratorio disegna qualcosa
        document.querySelectorAll("[data-lab]").forEach(el => expect(el.innerHTML.length).toBeGreaterThan(50));
        A.next();
        if (lv.prova) {
          playProva(lv, bravo);
          A.next();
        }
        expect(F.S.step).toBe("banco");
        const n = F.S.run.dq.length;
        for (let k = 0; k < n; k++) {
          const st = playDialog(bravo);
          expect(st.done).toBe(true);
          if (k < n - 1) A.nextClient();
        }
        expect(text()).toContain(lv.pick ? "Domande dal laboratorio" : "Domande dal laboratorio");
        A.next();
        for (let i = 0; i < 3; i++) {
          const q = F.S.run.quiz;
          A.ans(String(q.items[q.i].q.ok));
          A.qnext();
        }
        expect(F.S.step).toBe("esito");
        const stars = F.S.run.stars;
        if (bravo) expect(stars).toEqual([true, true, true]);
        else expect(stars.filter(Boolean).length).toBeLessThan(3);
        expect(text()).toContain("concluso");
        // nessun {segnaposto} resta sullo schermo
        expect(text()).not.toMatch(/\{\w+\}/);
      });
    }
  }

  it("le prove lenti hanno una sola soluzione, in ogni variante, e le varianti non sono tutte uguali", () => {
    for (const lv of LEVELS) {
      const p = lv.prova;
      if (!isLensProva(p)) continue;
      const vs = p.variants || [undefined];
      const all = vs.map(v => { const s = solutions(withVariant(p, v)); expect(s.length).toBe(1); return s[0]; });
      if (vs.length > 1) expect(new Set(all).size).toBeGreaterThan(1);
    }
  });

  it("rigiocando, il cliente cambia ricetta e i numeri dei testi la seguono", () => {
    const seen = new Set<number>();
    for (let k = 0; k < 6; k++) {
      A.open("o1");
      seen.add(F.sol()[0]);
    }
    expect(seen.size).toBeGreaterThan(1);
    // il numero nella nota del banco è quello della variante
    A.open("o1");
    const od = F.prova().eye.rx.sph;
    A.next(); A.next(); A.next();
    expect(F.S.step).toBe("banco");
    const r = F.S.run, d = F.DLG.marco;
    for (let i = 0; i < 2; i++) A.say(String(d.steps[r.dlg.marco.step].choices.findIndex((c: any) => c.ok === "best")));
    const v = F.LEVELS[0].prova.variants[r.vi].vars.od;
    expect(text()).toContain(`occhio destro ${v}`);
    expect(v).toBe(od.toFixed(2).replace(".", ",").replace("-", "−"));
  });

  it("Franco ha l'età della sua variante, al banco e nella prova", () => {
    A.open("o3");
    const age = F.prova().eye.age;
    expect(text()).toContain(`Franco, ${age} anni`); // text() normalizza anche lo spazio che non va a capo
  });

  it("una scelta «va bene, ma…» con la sua fine chiude il dialogo: Sara se ne va", () => {
    A.open("o4");
    A.next(); A.next(); A.next();
    const r = F.S.run, d = F.DLG.sara;
    for (let k = 0; k < 2; k++) A.say(String(d.steps[r.dlg.sara.step].choices.findIndex((c: any) => c.ok === "best")));
    A.say(String(d.steps[2].choices.findIndex((c: any) => c.ok === "ok")));
    const st = r.dlg.sara;
    expect(st.done).toBe(true);
    expect(st.step).toBe(3);
    expect(text()).toContain("se ne va di corsa");
    expect(text()).toContain("si poteva fare meglio");
  });

  it("i laboratori si toccano senza errori", () => {
    A.open("o1");
    A.next();
    const seg = document.querySelector<HTMLButtonElement>("[data-lab] [data-x]");
    seg?.click();
    A.open("o4");
    A.next();
    A.cardNext();
    A.cardNext();
    const st = document.querySelector<HTMLInputElement>("#lab-st");
    st!.value = "0";
    st!.dispatchEvent(new Event("input", { bubbles: true }));
    expect(text()).toContain("montatura dritta");
    document.querySelectorAll<HTMLButtonElement>("[data-lab] .seg [data-x]")[1].click();
    expect(text()).toContain("Solo sfera, −1,00");
  });
});
