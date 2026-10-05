/* Stampa il controllo dello standard livello per livello. Esce con errore se c'è anche un solo errore. */
import { CARDS, LEVELS } from "../src/content";
import { validate } from "../src/standard/validate";

const out = validate(LEVELS, CARDS);
const err = out.filter(o => o.sev === "errore"),
  warn = out.filter(o => o.sev === "avviso");
const byLv = new Map<string, typeof out>();
for (const o of out) byLv.set(o.lv, [...(byLv.get(o.lv) || []), o]);
for (const [lv, list] of byLv) {
  console.log(`\n${lv}`);
  for (const o of list) console.log(`  ${o.sev === "errore" ? "✗" : "!"} ${o.code}  ${o.msg}`);
}
console.log(`\nStandard: ${err.length} errori, ${warn.length} avvisi su ${LEVELS.length} livelli.`);
process.exit(err.length ? 1 : 0);
