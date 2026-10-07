// @vitest-environment jsdom
/* Diottri, un giro completo nell'interfaccia: i dieci passi in fila, da bravi, poi si chiude e si riapre.
   La storia deve salvarsi e continuare (diottri.v1), senza toccare i progressi dei corsi. */
import { beforeAll, describe, expect, it } from "vitest";
import { ORDINE, vassoioPrima } from "../../src/diottri/content";
import { grandezzaGiusta } from "../../src/diottri/core/riconosci";
import { risolviCaso } from "../../src/diottri/core/risolutore";
import { soluzioneProva } from "../../src/diottri/core/caso";

/* eslint-disable @typescript-eslint/no-explicit-any */
let F: any;
const act = (a: string, arg = "") => {
  const fn = F.ACTS[a];
  if (!fn) throw new Error("mossa sconosciuta: " + a);
  fn(arg);
  F.render();
};
const app = () => document.getElementById("app")!;
const text = () => (app().textContent || "").replace(/\s+/g, " ");
const tap = (sel: string) => {
  const el = app().querySelector<HTMLElement>(sel);
  if (!el) throw new Error("non trovato: " + sel);
  el.click();
};

function mount() {
  document.body.innerHTML = '<div id="app" class="dio"></div><div id="toast" hidden></div>';
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  return import("../../src/diottri/ui").then(({ mountDiottri }) => {
    mountDiottri(app(), { home: "/" });
    F = (window as any).__dio;
  });
}

/** Gioca il caso aperto da bravo, coi tocchi dell'interfaccia. */
function giocaCaso(id: string) {
  const def = F.CASO[id], st = F.S.caso;
  expect(st.vassoio).toEqual(expect.arrayContaining(vassoioPrima(id)));
  // la stessa partita giocata dal risolutore: dice quali pezzi mettere
  const rif = risolviCaso(def, st.seed, st.vassoio);
  tap("[data-act=sheet][data-arg=chiedi]");
  expect(app().querySelector(".foglio")).not.toBeNull();
  for (const q of def.domande) if (!q.giaDetto && (q.chiave || q.rivela)) act("chiedi", q.id);
  if (def.allarme) {
    act("sheet", "medico");
    expect(text()).toContain("Medico, subito");
    act("medico", def.allarme.urgenza);
    return;
  }
  if (def.ricetta) {
    act("ricetta");
    expect(text()).toContain("La ricetta");
    for (const c of ["OD.SF", "OS.SF"]) tap(`[data-act=tocca][data-arg="${c}"]`);
  } else if (def.vecchi?.vedeBene) {
    act("vecchi");
    act("uguali");
  } else {
    act("prova");
    expect(text()).toContain("Prova lenti");
    for (const o of ["od", "os"]) {
      act("occhio", o);
      const target = soluzioneProva({ rx: st.occhio[o], age: st.occhio.age });
      for (let g = 0; g < 80 && Math.abs(F.S.caso.prova.v - target) > 1e-9; g++) {
        const d = target - F.S.caso.prova.v;
        act("sposta", String(Math.abs(d) >= 1 ? Math.sign(d) : Math.sign(d) * 0.25));
      }
      tap("[data-act=conferma]");
    }
  }
  expect(st.lente).not.toBeNull();
  for (const [p, idOpz] of Object.entries(rif.posti)) if (st.posti[p] !== idOpz) {
    act("posto", p);
    tap(`[data-act=metti][data-arg="${p}|${idOpz}"]`);
  }
  for (let i = 0; i < 4; i++) {
    const btn = app().querySelector<HTMLElement>("[data-act=sheet][data-arg=mostra]");
    if (!btn || btn.hasAttribute("disabled")) break;
    expect(btn.classList.contains("accendi")).toBe(true);
    btn.click();
    const d = F.S.caso.dubbi.find((x: any) => x.aperto);
    const giusta = def.dubbi.find((x: any) => x.id === d.id).mostra.find((m: any) => m.esito === "risponde").id;
    tap(`[data-act=mostra][data-arg=${giusta}]`);
  }
  tap("[data-act=consegna]");
}

function giocaRic(id: string) {
  const def = F.RIC[id], st = F.S.ric;
  for (const p of Object.keys(def.prove)) if (def.prove[p] === "utile" && !(p === "caldo" && def.specie === "cello")) {
    tap(`[data-act=provaRic][data-arg=${p}]`);
    expect(app().querySelector(".risultato")).not.toBeNull();
  }
  tap("[data-act=sheet][data-arg=riconosci]");
  expect(app().querySelector("[data-act=riconosci]")!.hasAttribute("disabled")).toBe(true);
  tap(`[data-act=sceltaId][data-arg=${def.specie}]`);
  const g = grandezzaGiusta(def, st);
  if (g) tap(`[data-act=sceltaG][data-arg="${g}"]`);
  tap("[data-act=riconosci]");
}

describe("Diottri · la partita intera nell'interfaccia", () => {
  beforeAll(async () => {
    localStorage.clear();
    localStorage.setItem("sfera-cilindro-asse.v1", '{"v":1,"done":{"x":{"stars":[true]}}}');
    localStorage.setItem("fase-neutro-terra.v1", '{"v":1,"done":{}}');
    await mount();
  });

  it("si comincia scegliendo chi sei, e la Maestra dà il benvenuto", () => {
    expect(text()).toContain("Chi sei?");
    tap("[data-act=chi][data-arg=donna]");
    expect(text()).toContain("Benvenuta in bottega");
    expect(text()).toContain("Con un allarme, niente misure: prima il medico.");
    tap("[data-act=ok]"); // «Cominciamo» apre il primo caso
    expect(F.S.screen).toBe("caso");
    expect(F.S.id).toBe("c1");
    act("home");
    expect(text()).not.toContain("Benvenuta in bottega");
    // solo il primo passo è aperto
    expect(app().querySelectorAll(".passo:not(.chiuso)").length).toBe(1);
  });

  it("il primo caso ha i consigli della Maestra, passo per passo", () => {
    tap("[data-act=apri][data-arg=c1]");
    expect(text()).toContain("Prima chiedi: tocca Chiedi.");
    act("chiedi", "quando");
    act("chiedi", "dove");
    expect(text()).toContain("Ora la misura: tocca Misura.");
    act("home");
  });

  it("i dieci passi in fila, da bravi: tre stelle e tutti i Diottri presi", () => {
    for (const p of ORDINE) {
      const btn = app().querySelector<HTMLElement>(`[data-act=apri][data-arg=${p.id}]`)!;
      expect(btn.hasAttribute("disabled"), p.id).toBe(false);
      btn.click();
      if (p.tipo === "caso") {
        giocaCaso(p.id);
        expect(F.S.caso.fine, p.id).not.toBeNull();
        expect(text()).toMatch(/Ci vedo!|Al medico/);
        expect(app().querySelectorAll(".overlay.fine .stella.on").length, p.id).toBe(3);
        expect(text()).toContain("Tre stelle: occhio, spiegazione e soluzione.");
        tap("[data-act=fineCaso]");
      } else {
        giocaRic(p.id);
        expect(F.S.ric.fine, p.id).toBe("preso");
        expect(text()).toContain("Preso!");
        tap("[data-act=fineRic]");
      }
      expect(F.S.screen).toBe("home");
    }
    expect(text()).toContain("Fatto tutto!");
    const prog = JSON.parse(localStorage.getItem("diottri.v1")!);
    expect(Object.keys(prog.fatti).sort()).toEqual(ORDINE.map(o => o.id).sort());
    expect(prog.vassoio).toEqual(expect.arrayContaining(["conca", "bombo", "rullo", "verdino", "polare", "bruno", "cello"]));
    expect(prog.chi).toBe("donna");
  });

  it("chiudi e riapri: la storia è salvata e continua", async () => {
    await mount();
    expect(F.S.screen).toBe("home");
    expect(text()).toContain("Fatto tutto!");
    expect(app().querySelectorAll(".passo.chiuso").length).toBe(0);
    expect(F.prog.chi).toBe("donna");
  });

  it("i progressi dei corsi non si toccano", () => {
    expect(localStorage.getItem("sfera-cilindro-asse.v1")).toBe('{"v":1,"done":{"x":{"stars":[true]}}}');
    expect(localStorage.getItem("fase-neutro-terra.v1")).toBe('{"v":1,"done":{}}');
  });

  it("a fine caso si legge perché una stella è persa", () => {
    tap("[data-act=apri][data-arg=c1]");
    act("chiedi", "occhiali"); // già detto
    act("chiedi", "quando");
    act("chiedi", "dove");
    act("sheet", "misura");
    act("vecchi");
    expect(app().querySelector(".foglio .riquadro")!.textContent).toContain("Frontifocometro"); // la lettura si vede nel foglio
    act("prova");
    for (const o of ["od", "os"]) {
      act("occhio", o);
      const target = F.solProva();
      for (let g = 0; g < 40 && Math.abs(F.S.caso.prova.v - target) > 1e-9; g++) act("sposta", String(Math.sign(target - F.S.caso.prova.v) * (Math.abs(target - F.S.caso.prova.v) >= 1 ? 1 : 0.25)));
      act("conferma");
    }
    act("consegna");
    expect(text()).toContain("Spiegazione: una domanda già detta: «Porta occhiali?»");
    tap("[data-act=fineCaso]");
  });

  it("una partita giocata male: meno stelle, ma le migliori restano", () => {
    tap("[data-act=apri][data-arg=c1]");
    act("chiedi", "occhiali"); // già detto
    act("medico", "oggi"); // non era un caso da medico
    expect(text()).toContain("Caso chiuso");
    tap("[data-act=fineCaso]");
    const prog = JSON.parse(localStorage.getItem("diottri.v1")!);
    expect(Object.values(prog.fatti.c1.stelle).filter(Boolean).length).toBe(3);
  });

  it("la prova lenti avvisa quando serve un Diottro che non hai", async () => {
    localStorage.removeItem("diottri.v1");
    await mount();
    tap("[data-act=chi][data-arg=uomo]");
    tap("[data-act=apri][data-arg=c1]");
    act("prova");
    act("sposta", "0.25");
    expect(document.getElementById("toast")!.textContent).toContain("Bombo");
    expect(F.S.caso.prova.v).toBe(0);
  });

  it("un riconoscimento sbagliato tre volte: la risposta si vede, poi scappa", async () => {
    localStorage.setItem("diottri.v1", JSON.stringify({ v: 1, chi: "uomo", benvenuto: true, fatti: { c1: { stelle: { occhio: true, spiegazione: true, soluzione: true } } }, vassoio: ["conca", "bruno"], proveViste: [], registro: {} }));
    await mount();
    tap("[data-act=apri][data-arg=r1]");
    tap("[data-act=provaRic][data-arg=neutralizza]");
    expect(text()).toContain("col meno va con, col più contro"); // la prima volta la Maestra spiega la prova
    expect(text()).toContain("piano è debole, svelta è media, corre è forte");
    for (const id of ["conca", "neutra", "conca"]) {
      act("sheet", "riconosci");
      act("sceltaId", id);
      act("sceltaG", "media");
      act("riconosci");
    }
    expect(F.S.ric.fine).toBe("scappato");
    expect(text()).toContain("Scappato!");
    expect(text()).toContain("La risposta: Lente col più");
    tap("[data-act=fineRic]");
    expect(JSON.parse(localStorage.getItem("diottri.v1")!).fatti.r1).toBeUndefined();
  });
});
