/* Stampa il controllo dello standard livello per livello, per i due corsi. Esce con errore se c'è anche un solo errore. */
import { CARDS, LEVELS } from "../src/content";
import { CARDS as CARDS_O, LEVELS as LEVELS_O } from "../src/ottica/content";
import { validateOttica } from "../src/ottica/standard/validate";
import { validate } from "../src/standard/validate";

type F = { lv: string; code: string; sev: "errore" | "avviso"; msg: string };
let errors = 0;
function report(title: string, out: F[], n: number) {
  console.log(`\n=== ${title} ===`);
  const byLv = new Map<string, F[]>();
  for (const o of out) byLv.set(o.lv, [...(byLv.get(o.lv) || []), o]);
  for (const [lv, list] of byLv) {
    console.log(`\n${lv}`);
    for (const o of list) console.log(`  ${o.sev === "errore" ? "✗" : "!"} ${o.code}  ${o.msg}`);
  }
  const e = out.filter(o => o.sev === "errore").length, w = out.filter(o => o.sev === "avviso").length;
  errors += e;
  console.log(`\n${title}: ${e} errori, ${w} avvisi su ${n} livelli.`);
}
report("Fase Neutro Terra (docs/STANDARD.md)", validate(LEVELS, CARDS), LEVELS.length);
report("Sfera Cilindro Asse (docs/ottica/STANDARD.md)", validateOttica(LEVELS_O, CARDS_O), LEVELS_O.length);
process.exit(errors ? 1 : 0);
