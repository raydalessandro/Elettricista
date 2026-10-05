/* Il motore del collaudo: ogni soluzione passa, ogni errore tipico dà l'esito previsto. */
import { describe, expect, it } from "vitest";
import { collaudo, termIds } from "../../src/core/engine";
import { RULES } from "../../src/core/rules";
import { CARDS, LEVELS } from "../../src/content";
import type { FiliLevel } from "../../src/core/types";

const fili = LEVELS.filter((l): l is FiliLevel => l.type === "fili");

describe("contenuti", () => {
  it("ogni scheda citata esiste", () => {
    for (const lv of LEVELS) for (const id of lv.cards) expect(CARDS[id], `${lv.id}: scheda ${id}`).toBeDefined();
  });
  it.each(fili.map(l => [l.id, l] as const))("%s: i morsetti citati esistono", (_, lv) => {
    const terms = new Set<string>();
    for (const c of lv.board.comps) for (const t of termIds(c)) terms.add(c.id + "." + t);
    const all = [...lv.solution, ...(lv.mistakes || []).flatMap(m => m.w), ...(lv.alternatives || []).flatMap(a => a.w)];
    for (const [a, b] of all) for (const t of [a, b]) expect(terms.has(t), `${lv.id}: ${t}`).toBe(true);
    for (const f of lv.board.fixed || []) for (const t of [f.a, f.b]) expect(terms.has(t), `${lv.id}: fisso ${t}`).toBe(true);
  });
});

describe("collaudo", () => {
  for (const lv of fili) {
    it(`${lv.id}: la soluzione passa`, () => {
      const r = collaudo(lv, RULES.toWires(lv, lv.solution));
      expect(r.outcome, JSON.stringify(r.issues)).toBe("ok");
    });
    for (const m of lv.mistakes || []) {
      it(`${lv.id}: «${m.name}» dà ${m.expect}`, () => {
        expect(collaudo(lv, RULES.toWires(lv, m.w)).outcome).toBe(m.expect);
      });
    }
  }
});
