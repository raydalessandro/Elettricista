/* Banco guasti: prese vuote, la prova delle misure, il disegno dei fili. */
import { describe, expect, it } from "vitest";
import { LEVELS } from "../../src/content";
import { applyFault, checkProof, contradiction, readVoltage, stillPossible, type Observation } from "../../src/core/faults";
import { wireIssues } from "../../src/core/geometry";
import type { GuastoLevel } from "../../src/core/types";

const G = (id: string) => LEVELS.find(l => l.id === id) as GuastoLevel;
const F = (lv: GuastoLevel, id: string) => lv.faults.find(f => f.id === id)!;

describe("prese vuote", () => {
  it("con niente attaccato, il neutro interrotto di una presa segna 0 V verso terra", () => {
    const lv = G("g4"),
      s = applyFault(lv, F(lv, "neutro-derivazione"));
    expect(readVoltage(s, {}, "PB.A", "PB.PE")).toBe(230);
    expect(readVoltage(s, {}, "PB.B", "PB.PE")).toBe(0);
    expect(readVoltage(s, {}, "PB.A", "PB.B")).toBe(0);
  });
});

describe("la prova: le misure dimostrano la diagnosi", () => {
  it("due misure col metodo dimostrano il ritorno interrotto; una sola no", () => {
    const lv = G("g1");
    const obs: Observation[] = [
      { mode: "V", a: "LP.L", b: "LP.N", st: { I: 1 } },
      { mode: "V", a: "I.2", b: "LP.PE", st: { I: 1 } },
    ];
    expect(stillPossible(lv, F(lv, "ritorno"), obs)).toEqual([]);
    expect(stillPossible(lv, F(lv, "ritorno"), obs.slice(0, 1)).map(f => f.id).sort()).toEqual(["fase", "interruttore"]);
  });

  it("nella cantina i colori non provano niente: senza misure resta tutto aperto", () => {
    const lv = G("g3");
    expect(stillPossible(lv, F(lv, "terra"), []).map(f => f.id)).toEqual(["int-neutro", "polarita", "nessuno"]);
    const terra: Observation[] = [{ mode: "Ω", a: "LP.PE", b: "W3.s1", st: {} }];
    expect(stillPossible(lv, F(lv, "terra"), terra)).toEqual([]);
    // «nessun difetto» vuole tutte e tre le prove: la terra, la luce spenta, la luce accesa
    expect(stillPossible(lv, F(lv, "nessuno"), terra).map(f => f.id)).toEqual(["int-neutro", "polarita"]);
    const tutte: Observation[] = [...terra, { mode: "V", a: "LP.L", b: "W3.s1", st: { I: 0 } }, { mode: "V", a: "LP.L", b: "W3.s1", st: { I: 1 } }];
    expect(stillPossible(lv, F(lv, "nessuno"), tutte)).toEqual([]);
  });

  it("dimostrata vuol dire: niente altro torna, una misura conta, il tester è provato", () => {
    const g5 = G("g5");
    const seen = ["{\"D1\":0,\"D2\":0}", "{\"D1\":1,\"D2\":0}", "{\"D1\":0,\"D2\":1}", "{\"D1\":1,\"D2\":1}"];
    // la luce in tutte le posizioni non basta: «fase sul morsetto 1» fa la stessa luce, e i fili non contano
    const guess = checkProof(g5, F(g5, "scambio-grigio"), { obs: [], seen, tester: true });
    expect(guess.alt.map(f => f.id)).toEqual(["fase-uscita"]);
    expect(guess.noDefect).toBe(true);
    // tutti e due su 2: all'inizio del grigio 230 V, alla fine 0 V
    const obs: Observation[] = [
      { mode: "V", a: "D1.2", b: "LP.PE", st: { D1: 1, D2: 1 } },
      { mode: "V", a: "D2.2", b: "LP.PE", st: { D1: 1, D2: 1 } },
    ];
    expect(checkProof(g5, F(g5, "scambio-grigio"), { obs, seen, tester: true }).proven).toBe(true);
    // senza aver provato il tester non vale
    expect(checkProof(g5, F(g5, "scambio-grigio"), { obs, seen, tester: false })).toMatchObject({ proven: false, noTester: true });
    // senza aver guardato la luce, l'inizio del grigio a 230 V non esclude lo scambio nero
    expect(checkProof(g5, F(g5, "scambio-grigio"), { obs: obs.slice(0, 1), seen: [], tester: true }).alt.map(f => f.id)).toEqual(["scambio-nero"]);
  });

  it("la lampadina: 230 V tra L e N con la luce spenta è la misura che conta", () => {
    const g1 = G("g1");
    const obs: Observation[] = [{ mode: "V", a: "LP.L", b: "LP.N", st: { I: 1 } }];
    expect(checkProof(g1, F(g1, "lampadina"), { obs, seen: ["{\"I\":1}"], tester: true }).proven).toBe(true);
  });

  it("nella presa morta la fase che manca sulla linea si distingue solo risalendo alla presa esistente", () => {
    const lv = G("g4");
    const nuova: Observation[] = [
      { mode: "V", a: "PB.A", b: "PB.PE", st: {} },
      { mode: "V", a: "PB.B", b: "PB.PE", st: {} },
    ];
    expect(checkProof(lv, F(lv, "fase-derivazione"), { obs: nuova, tester: true }).alt.map(f => f.id)).toEqual(["fase-linea"]);
    const anche: Observation[] = [...nuova, { mode: "V", a: "PA.A", b: "PA.PE", st: {} }];
    expect(checkProof(lv, F(lv, "fase-derivazione"), { obs: anche, tester: true }).proven).toBe(true);
  });

  it("una diagnosi sbagliata dice cosa la smentisce", () => {
    const g1 = G("g1");
    const obs: Observation[] = [{ mode: "V", a: "LP.L", b: "LP.N", st: { I: 1 } }];
    expect(contradiction(g1, F(g1, "ritorno"), F(g1, "lampadina"), obs)).toMatchObject({ kind: "misura", got: "0", would: "230" });
    expect(contradiction(g1, F(g1, "ritorno"), F(g1, "fase"), obs)).toBeNull();
    const g3 = G("g3");
    expect(contradiction(g3, F(g3, "terra"), F(g3, "polarita"), [])).toEqual({ kind: "vista" });
    const g5 = G("g5");
    expect(contradiction(g5, F(g5, "ritorno"), F(g5, "scambio-nero"), [])).toEqual({ kind: "chiamata" });
    expect(contradiction(g5, F(g5, "scambio-grigio"), F(g5, "scambio-nero"), [])).toBeNull();
    expect(contradiction(g5, F(g5, "scambio-grigio"), F(g5, "scambio-nero"), [], ["{\"D1\":1,\"D2\":1}"])).toEqual({ kind: "luce" });
  });
});

describe("disegno dei fili", () => {
  it("nella deviata il marrone arriva al comune senza passare sopra gli altri morsetti", () => {
    const lv = G("g5");
    expect(wireIssues(lv, "W1.s2", "D1.C")).toEqual({ terms: [], labels: [], bodies: [] });
    expect(wireIssues(lv, "W1.s2", "D1.1").terms).toEqual([]);
  });
  it("nella camera nessun filo attraversa un pezzo", () => {
    const lv = G("g6");
    for (const f of [null, ...lv.faults])
      for (const w of applyFault(lv, f).visible) if (!w.capo) expect(wireIssues(lv, w.a, w.b).bodies).toEqual([]);
  });
});
