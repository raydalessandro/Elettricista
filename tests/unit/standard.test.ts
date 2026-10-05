/* Lo standard degli esercizi (docs/STANDARD.md): zero errori, altrimenti non si pubblica. */
import { expect, it } from "vitest";
import { CARDS, LEVELS } from "../../src/content";
import { validate } from "../../src/standard/validate";

it("tutti i livelli rispettano lo standard", () => {
  const found = validate(LEVELS, CARDS);
  const errors = found.filter(f => f.sev === "errore").map(f => `${f.lv} ${f.code} ${f.msg}`);
  expect(errors).toEqual([]);
});
