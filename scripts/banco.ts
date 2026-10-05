/* Banco guasti da riga di comando, per le prove alla cieca: le stesse misure del gioco, col guasto nascosto.
   Uso:  npx tsx scripts/banco.ts <livello> <numero del caso> <<'FINE'
         punti
         linea on
         comando I 1
         tensione LP.L LP.N
         FINE
   Comandi (uno per riga): punti · guarda · opzioni · stato · linea on|off · comando <id> <0|1>
   tensione <a> <b> · continuita <a> <b> · diagnosi <numero dell'opzione>
   Il caso sceglie il guasto in modo fisso: stesso numero, stesso guasto. Non dice quale. */
import { readFileSync } from "node:fs";
import { LEVELS, WIRES } from "../src/content";
import { evaluate } from "../src/core/engine";
import { applyFault, probePoints, readContinuity, readVoltage } from "../src/core/faults";
import type { GuastoLevel, Wire } from "../src/core/types";

const [id, seedArg] = process.argv.slice(2);
const lv = LEVELS.find((l): l is GuastoLevel => l.id === id && l.type === "guasto");
if (!lv) {
  console.log("Livelli del banco: " + LEVELS.filter(l => l.type === "guasto").map(l => l.id).join(", "));
  process.exit(1);
}
let h = 2166136261;
for (const ch of `${id}:${seedArg || "0"}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
const fi = Math.abs(h) % lv.faults.length;
const fault = lv.faults[fi];
const setup = applyFault(lv, fault);
const order = lv.faults.map((f, i) => ({ f, k: Math.abs(Math.imul(h, i + 7)) % 997 })).sort((a, b) => a.k - b.k).map(x => x.f);

const comp = (cid: string) => lv.board.comps.find(c => c.id === cid)!;
const wagoName = (cid: string, wires: Wire[]) => {
  const ws = wires.filter(w => w.a.split(".")[0] === cid || w.b.split(".")[0] === cid);
  const w = ws.find(x => x.capo) || ws[0];
  return w ? `morsetto del ${WIRES[w.color].label}` : "morsetto libero";
};
function name(t: string): string {
  const [cid, tt] = t.split(".");
  const c = comp(cid);
  if (!c) return t;
  switch (c.kind) {
    case "morsetto":
      return `${wagoName(cid, setup.visible)}, foro ${tt.slice(1)}`;
    case "presa":
      return `${cid === "PA" ? "presa esistente" : "presa nuova"}, morsetto ${tt === "PE" ? "di terra" : tt === "A" ? "sinistro" : "destro"}`;
    case "lampada":
      return `${c.look || "lampada"}, morsetto ${tt === "PE" ? "di terra" : tt}`;
    case "interruttore":
      return `interruttore, morsetto ${tt}`;
    case "deviatore":
      return `${cid === "D1" ? "primo deviatore" : "secondo deviatore"}, morsetto ${tt}`;
    case "invertitore":
      return `invertitore, morsetto ${tt}`;
    case "capo":
      return `filo ${WIRES[c.color!].label} che arriva dal cavo`;
    case "sorgente":
      return `linea dal quadro (${tt})`;
  }
  return t;
}
const pts = new Set(probePoints(lv));
const sw = lv.board.comps.filter(c => ["interruttore", "deviatore", "invertitore"].includes(c.kind));
const pst: Record<string, number> = {};
let on = false;
const stateTxt = () => sw.map(c => `${c.id}=${pst[c.id] || 0}`).join(" ");

console.log(`Banco: ${lv.title}. Cliente: «${fault.msg}»`);
const input = readFileSync(0, "utf8").split("\n").map(l => l.trim()).filter(Boolean);
for (const line of input) {
  const [cmd, a, b] = line.split(/\s+/);
  let out = "";
  if (cmd === "punti") out = [...pts].map(t => `  ${t} = ${name(t)}`).join("\n");
  else if (cmd === "guarda") out = setup.visible.map(w => `  filo ${WIRES[w.color].label}: ${name(w.a)} → ${name(w.b)}`).concat((lv.board.fixed || []).filter(f => f.vis).map(f => `  filo ${WIRES[f.color!].label} già posato: arriva dal cavo → ${name(f.b)}`)).join("\n");
  else if (cmd === "opzioni") out = order.map((f, i) => `  ${i + 1}. ${f.label}`).join("\n");
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
    out = `linea ${on ? "accesa" : "spenta"} · comandi: ${stateTxt() || "nessuno"} · ` + (g.type === "lamp" ? `luce ${ev && ev.lamps[g.lamp].on ? "accesa" : "spenta"}` : "le prese non si vedono: misura");
  } else if (cmd === "tensione" || cmd === "continuita") {
    if (!pts.has(a) || !pts.has(b)) out = `punto sconosciuto (usa «punti»)`;
    else if (cmd === "tensione") out = on ? `${readVoltage(setup, pst, a, b)} V` : "0 V (la linea è spenta)";
    else if (on) out = "non vale: la linea è accesa. Spegnila prima di misurare la continuità.";
    else out = { zero: "suona: 0 Ω, stesso filo", carico: "38 Ω: c'è una lampada in mezzo", aperto: "OL: aperto, non passa" }[readContinuity(setup, pst, a, b)];
    out = `${cmd} ${name(a)} – ${name(b)} [${stateTxt() || "senza comandi"}] → ${out}`;
  } else if (cmd === "diagnosi") {
    const pick = order[+a - 1];
    out = !pick ? "opzione sconosciuta (usa «opzioni»)" : pick.id === fault.id ? `GIUSTO. ${fault.proof}` : "SBAGLIATO: le misure non dicono questo.";
  } else out = `comando sconosciuto: ${cmd}`;
  console.log(`> ${line}\n${out}`);
}
