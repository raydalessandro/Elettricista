/* Banco guasti da riga di comando, per le prove alla cieca: le stesse misure del gioco, col guasto nascosto.
   Uso:  npx tsx scripts/banco.ts <livello> <numero del caso> <<'FINE'
         punti
         linea on
         comando I 1
         tensione LP.L LP.N
         FINE
   Comandi (uno per riga): punti · guarda · opzioni · prova · stato · linea on|off · comando <id> <0|1>
   tensione <a> <b> · continuita <a> <b> · diagnosi <numero dell'opzione>
   «prova» prova il tester su una presa viva; «stato» dice com'è la luce (come guardarla nel gioco).
   Il caso sceglie il guasto in modo fisso: stesso numero, stesso guasto. Non dice quale.
   Come nel gioco, l'ordine delle opzioni cambia da un caso all'altro: «diagnosi» ripete quella scelta. */
import { readFileSync } from "node:fs";
import { LEVELS, WIRES } from "../src/content";
import { evaluate } from "../src/core/engine";
import { applyFault, checkProof, contradiction, probePoints, proofGaps, readContinuity, readVoltage, wrongText, type Observation } from "../src/core/faults";
import { benchTermName, compName, swState } from "../src/core/names";
import type { GuastoLevel } from "../src/core/types";

const [id, seedArg] = process.argv.slice(2);
const lv = LEVELS.find((l): l is GuastoLevel => l.id === id && l.type === "guasto");
if (!lv) {
  console.log("Livelli del banco: " + LEVELS.filter(l => l.type === "guasto").map(l => l.id).join(", "));
  process.exit(1);
}
const hash = (t: string) => {
  let x = 2166136261;
  for (const ch of t) x = Math.imul(x ^ ch.charCodeAt(0), 16777619);
  return Math.abs(x);
};
// i casi 1…n del livello sono n guasti diversi, in un ordine fisso ma non dichiarato; poi si ricomincia
const perm = lv.faults.map((f, i) => i).sort((i, j) => hash(`${id}:${i}`) - hash(`${id}:${j}`));
const caso = Math.max(1, Math.floor(+seedArg || 1));
const fi = perm[(caso - 1) % lv.faults.length];
const h = hash(`${id}:${caso}`);
const fault = lv.faults[fi];
const setup = applyFault(lv, fault);
const order = lv.faults.map((f, i) => ({ f, k: Math.abs(Math.imul(h, i + 7)) % 997 })).sort((a, b) => a.k - b.k).map(x => x.f);

const name = (t: string) => {
  const c = lv.board.comps.find(k => k.id === t.split(".")[0]);
  if (c?.kind === "capo") return `filo ${WIRES[c.color!].label} che arriva dal cavo`;
  return benchTermName(lv, t, setup.visible);
};
const pts = new Set(probePoints(lv));
const sw = lv.board.comps.filter(c => ["interruttore", "deviatore", "invertitore"].includes(c.kind));
const pst: Record<string, number> = {};
let on = false;
const obs: Observation[] = [];
const seen: string[] = [];
let tester = false;
const stateTxt = () => sw.map(c => `${c.id} (${compName(c)}) = ${pst[c.id] || 0}, ${swState(c, pst[c.id] || 0)}`).join(" · ");
const ohm = { zero: "suona: 0 Ω, collegati direttamente", carico: "38 Ω: c'è una lampada in mezzo", aperto: "OL: aperto, non passa" };

console.log(`Banco: ${lv.title}. Cliente: «${fault.msg}»`);
const input = readFileSync(0, "utf8").split("\n").map(l => l.trim()).filter(Boolean);
for (const line of input) {
  const [cmd, a, b] = line.split(/\s+/);
  let out = "";
  if (cmd === "punti") out = [...pts].map(t => `  ${t} = ${name(t)}`).join("\n");
  else if (cmd === "guarda")
    out = setup.visible
      .map(w => `  filo ${WIRES[w.color].label}: ${name(w.a)} → ${name(w.b)}`)
      .concat((lv.board.fixed || []).filter(f => f.vis).map(f => `  filo ${WIRES[f.color!].label} già posato: arriva dal cavo → ${name(f.b)}`))
      .join("\n");
  else if (cmd === "opzioni") out = order.map((f, i) => `  ${i + 1}. ${f.label}`).join("\n");
  else if (cmd === "prova") {
    tester = true;
    out = "prova del tester su una presa viva: 230 V. Puntali uniti: suona. Il tester funziona.";
  }
  else if (cmd === "linea") {
    on = a === "on";
    out = `linea ${on ? "accesa" : "spenta"}`;
  } else if (cmd === "comando") {
    if (!sw.some(c => c.id === a)) out = `comando sconosciuto: ${a} (comandi: ${sw.map(c => c.id).join(", ")})`;
    else {
      pst[a] = +b ? 1 : 0;
      out = `comandi: ${stateTxt()}`;
    }
  } else if (cmd === "stato") {
    const ev = on ? evaluate(setup.lv, setup.actual, pst, { broken: setup.broken }) : null;
    const g = lv.goal;
    if (on && g.type === "lamp" && !seen.includes(JSON.stringify(pst))) seen.push(JSON.stringify(pst));
    out = `linea ${on ? "accesa" : "spenta"} · comandi: ${stateTxt() || "nessuno"} · ` + (g.type === "lamp" ? `luce ${ev && ev.lamps[g.lamp].on ? "accesa" : "spenta"}` : "le prese non si vedono: misura");
  } else if (cmd === "tensione" || cmd === "continuita") {
    if (!pts.has(a) || !pts.has(b)) out = `punto sconosciuto (usa «punti»)`;
    else if (cmd === "tensione") {
      out = on ? `${readVoltage(setup, pst, a, b)} V` : "0 V";
      if (on) obs.push({ mode: "V", a, b, st: { ...pst } });
    } else if (on) out = "non vale: la linea è accesa. Spegnila prima di misurare la continuità.";
    else {
      out = ohm[readContinuity(setup, pst, a, b)];
      obs.push({ mode: "Ω", a, b, st: { ...pst } });
    }
    out = `${cmd} ${name(a)} – ${name(b)} [${[...sw.map(c => `${c.id}=${pst[c.id] || 0}`), on ? "linea accesa" : "linea spenta"].join(" · ")}] → ${out}`;
  } else if (cmd === "diagnosi") {
    const pick = order[+a - 1];
    if (!pick) out = "opzione sconosciuta (usa «opzioni»)";
    else if (pick.id === fault.id) {
      const c = checkProof(lv, fault, { obs, seen, tester });
      out = `Hai scelto: «${pick.label}». GIUSTO. ` + (c.proven ? "Le tue misure lo dimostrano." : `Ma non ancora dimostrato: ${proofGaps(c).join("; ")}.`) + ` Un modo per dimostrarlo: ${fault.proof}`;
    } else {
      const why = wrongText(contradiction(lv, fault, pick, obs, seen), pick, o => `${o.mode === "V" ? "in tensione" : "in continuità"} tra ${name(o.a)} e ${name(o.b)} [${sw.map(c => `${c.id}=${o.st[c.id] || 0}`).join(" ") || "senza comandi"}]`);
      out = `Hai scelto: «${pick.label}». SBAGLIATO. ${why}`;
    }
  } else out = `comando sconosciuto: ${cmd}`;
  console.log(`> ${line}\n${out}`);
}
