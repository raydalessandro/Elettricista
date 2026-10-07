/* Diottri da riga di comando, per le prove alla cieca: lo schermo del telefono scritto in testo, i tasti da stdin.
   È la stessa interfaccia del gioco (src/diottri/ui.ts) montata in jsdom: si vede quello che vede chi gioca.
   Uso:  npx tsx scripts/diottri.ts [seme] <<'FINE'
         1
         a
         su 3
         FINE
   Nel borgo (la console del Game Boy):
     su | giu | sinistra | destra [n]   cammina di n passi (uno se non dici n); contro un muro ci si ferma
     gira <direzione>                    si gira senza camminare
     a | b | menu                        i tasti: A parla, tocca e va avanti; B va avanti o chiude; il menu
     (nelle scelte e nel menu, su e giu spostano la freccia e A conferma)
   Negli schermi del banco (casi, riconoscimenti, vassoio, percorso):
     <numero>                            tocca il bottone con quel numero
   Sempre:  schermo (lo riscrive) · # una nota
   Il seme decide le varianti: la gradazione dei clienti e la forza dei Diottri.
   DIOTTRI_SALVA=file.json tiene i progressi tra una partita e l'altra (la chiave diottri.v1 del browser). */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const seme = Math.max(1, Math.floor(Number(process.argv[2]) || 1));
const SALVA = process.env.DIOTTRI_SALVA;

/* ---------- un telefono finto ---------- */
const dom = new JSDOM('<!doctype html><div id="app" class="dio"></div><div id="toast" hidden></div>', { url: "https://diottri.local/diottri", pretendToBeVisual: true });
const w = dom.window;
const glob = globalThis as unknown as Record<string, unknown>;
for (const k of ["window", "document", "localStorage", "HTMLElement", "Element", "Node", "HTMLCanvasElement", "KeyboardEvent"]) {
  const v = k === "window" ? w : (w as unknown as Record<string, unknown>)[k];
  if (v !== undefined) Object.defineProperty(glob, k, { value: v, configurable: true, writable: true });
}
Object.defineProperty(glob, "navigator", { value: w.navigator, configurable: true });
w.scrollTo = (() => {}) as typeof w.scrollTo;
let a = seme >>> 0;
Math.random = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
if (SALVA && existsSync(SALVA)) w.localStorage.setItem("diottri.v1", readFileSync(SALVA, "utf8"));

const { mountDiottri } = await import("../src/diottri/ui");
const { MAPPE } = await import("../src/diottri/content/borgo");
const { cosePresenti, personaggiPresenti, portaA, timbriPresenti, voce } = await import("../src/diottri/mondo/motore");
const { OGGETTI } = await import("../src/diottri/grafica/oggetti");
const app = w.document.getElementById("app")!;
mountDiottri(app, { home: "/" });

interface Guscio {
  stato: { mappa: string; x: number; y: number; dir: string; segni: string[] };
  premi(t: string): void;
  cammina(d: string): string;
  scorri(d: string): void;
  scelta: string[] | null;
  fase: "giorno" | "sera";
  nebbia: number;
  indiceScelta: number;
  riquadro: { chi: string; testo: string } | null;
  pieno: boolean;
  menu: { voce: string; testo: string; on: boolean }[] | null;
  velo: string;
  occupato: boolean;
}
interface Dio { S: { screen: string }; prog: { fatti: Record<string, { preso?: boolean; stelle?: number }> }; mondo: Guscio }
const D = () => (w as unknown as { __dio: Dio }).__dio;
const pausa = (ms: number) => new Promise(r => setTimeout(r, ms));
const nelBorgo = () => D().S.screen === "mondo" && !!app.querySelector(".gb");

/* ---------- gli schermi del banco, in testo ---------- */
let bottoni: HTMLElement[] = [];
const spazi = (s: string) => s.replace(/\s+/g, " ").trim();

/** Le parole dentro una frase (il grassetto) si attaccano al resto; gli altri pezzi si separano con uno spazio. */
const IN_RIGA = new Set(["b", "strong", "em", "i", "a", "code", "abbr", "sup", "sub"]);
function testo(el: Node): string {
  if (el.nodeType === 3) return el.textContent || "";
  if (el.nodeType !== 1) return "";
  const e = el as Element;
  const cls = e.getAttribute("class") || "";
  const tag = e.tagName.toLowerCase();
  if (tag === "svg") return "";
  if (/\bstella\b/.test(cls)) return ` ${/\bon\b/.test(cls) ? "★" : "☆"}${spazi(e.textContent || "")} `;
  if (/\b(tacche|fiducia|diff)\b/.test(cls) && e.getAttribute("aria-label")) return ` [${e.getAttribute("aria-label")}] `;
  if (/\besito\b/.test(cls)) return ` «${spazi(e.textContent || "")}» `;
  const dentro = [...e.childNodes].map(testo).join("");
  return IN_RIGA.has(tag) ? dentro : ` ${dentro} `;
}
function immagine(svg: Element): string {
  const l = svg.getAttribute("aria-label");
  if (!l) return "";
  const scritte = /\bscene\b/.test(svg.getAttribute("class") || "") ? [] : [...svg.querySelectorAll("text")].map(t => spazi(t.textContent || "")).filter(Boolean);
  return `(immagine: ${l}${scritte.length ? ` · scritte: ${scritte.join(" · ")}` : ""})`;
}
const BLOCCHI = new Set(["p", "h1", "h2", "h3", "li", "figcaption", "dt", "dd", "small", "th", "td", "span", "b", "em"]);
function righe(el: Element, out: string[]) {
  const tag = el.tagName.toLowerCase();
  if (el.hasAttribute("hidden")) return;
  if (tag === "svg") { const t = immagine(el); if (t) out.push(t); return; }
  if (tag === "button" || tag === "a") {
    const n = bottoni.push(el as HTMLElement);
    const lbl = el.getAttribute("aria-label") || spazi(testo(el));
    const extra = /\bcur\b|\bon\b/.test(el.getAttribute("class") || "") ? " (scelto)" : "";
    out.push(`[${n}] ${lbl}${extra}${el.hasAttribute("disabled") ? " (spento)" : ""}`);
    return;
  }
  const dentro = el.querySelector("button, a, svg");
  if (!dentro && (BLOCCHI.has(tag) || el.children.length === 0)) {
    const t = spazi(testo(el));
    if (t) out.push(tag.startsWith("h") ? `# ${t}` : t);
    return;
  }
  if (el.getAttribute("role") === "dialog") out.push(`=== ${el.getAttribute("aria-label") || "finestra"} ===`);
  for (const c of el.children) righe(c, out);
}
function schermoBanco(): string {
  bottoni = [];
  const out: string[] = [];
  const sopra = app.querySelector(".overlay:not([hidden]), .foglio:not([hidden])");
  if (sopra) {
    const sotto: string[] = [];
    righe(app, sotto);
    bottoni = [];
    out.push("(sotto, coperto: " + spazi(sotto.filter(r => !r.startsWith("[")).slice(0, 3).join(" · ")) + " …)");
    righe(sopra, out);
  } else righe(app, out);
  return out.join("\n");
}

/* ---------- il borgo, in testo: le 10×9 mattonelle che si vedono sullo schermo ---------- */
const PERSONE: Record<string, [string, string]> = {
  marco: ["M", "Marco"], giulia: ["G", "Giulia"], davide: ["D", "Davide"], paolo: ["P", "Paolo"], luisa: ["L", "Luisa"],
  iride: ["I", "la Maestra Iride"], passante: ["Q", "un passante"],
};
const COSE: Record<string, [string, string]> = {
  bottega: ["b", "la bottega dell'ottico"], casa_rossa: ["h", "una casa"], casa_blu: ["h", "una casa"], merceria: ["m", "la merceria"],
  edicola: ["e", "l'edicola"], tabellone: ["t", "il tabellone degli orari"], pensilina: ["s", "la pensilina della stazione"],
  fontana: ["f", "la fontana"], cancello_chiuso: ["c", "un cancello chiuso"], cancello_aperto: ["c", "un cancello aperto"],
  banco: ["k", "il banco (si parla da questa parte)"], scaffale: ["y", "uno scaffale"], specchio: ["j", "uno specchio"],
  vetrinetta: ["v", "una vetrinetta"], campionario: ["w", "il campionario"], cassetta: ["z", "una cassetta"], pianta: ["x", "una pianta"],
};
function schermoMondo(): string {
  const g = D().mondo;
  const st = g.stato;
  const m = MAPPE[st.mappa] ?? MAPPE.borgo;
  const ctx = { fatto: (id: string) => { const f = D().prog.fatti[id]; return !!f && (!!f.preso || !!f.stelle); }, segni: st.segni };
  const out: string[] = [];
  const n = m.fuori ? g.nebbia : 0;
  out.push(`# ${m.nome} · ${m.fuori ? (g.fase === "sera" ? "è sera" : "è giorno") : "dentro"}${n ? ` · lo sfondo è sfocato (${n} su 5)` : ""}`);
  // gli oggetti: ogni cella piena sa di quale oggetto è
  const ogg = new Map<string, string>();
  for (const t of timbriPresenti(m, ctx)) {
    const o = OGGETTI[t.ogg];
    if (!o) continue;
    for (let cy = 0; cy < o.h; cy++) for (let cx = 0; cx < o.w; cx++) if (o.solido ? o.solido[cy]?.[cx] === "x" : true) ogg.set(`${t.x + cx},${t.y + cy}`, t.ogg);
  }
  const W = Math.max(...m.righe.map(r => r.length)), H = m.righe.length;
  const x0 = Math.max(0, Math.min(W - 10, st.x - 4)), y0 = Math.max(0, Math.min(H - 9, st.y - 4));
  const legenda = new Map<string, string>();
  const righeMappa: string[] = [];
  for (let y = y0; y < Math.min(H, y0 + 9); y++) {
    let r = "";
    for (let x = x0; x < Math.min(W, x0 + 10); x++) {
      const p = personaggiPresenti(m, ctx).find(q => q.x === x && q.y === y);
      const c = cosePresenti(m, ctx).find(q => q.x === x && q.y === y);
      const v = voce(m, x, y);
      const o = ogg.get(`${x},${y}`);
      let ch: string;
      if (x === st.x && y === st.y) ch = "@";
      else if (p) { const [l, nome] = PERSONE[p.id] ?? ["?", p.id]; ch = l; legenda.set(l, nome); }
      else if (c?.tipo === "luccichio") { ch = "*"; legenda.set("*", "un luccichio"); }
      else if (c?.tipo === "cartello") { ch = "+"; legenda.set("+", "un cartello"); }
      else if (c) { ch = "o"; legenda.set("o", "qualcosa da guardare"); }
      else if (portaA(m, x, y)) { ch = "n"; legenda.set("n", "una porta"); }
      else if (o && COSE[o]) { const [l, nome] = COSE[o]; ch = l; legenda.set(l, nome); }
      else if (o) { ch = "x"; legenda.set("x", "alberi, panchine, lampioni e simili: non si passa"); }
      else if (v?.tile === "acqua" || v?.tile === "canne") { ch = "~"; legenda.set("~", "acqua"); }
      else if (v?.tile === "binari") { ch = "="; legenda.set("=", "i binari"); }
      else if (!v || v.solido) { ch = "#"; legenda.set("#", "muro, siepe o recinto: non si passa"); }
      else ch = ".";
      r += ch;
    }
    righeMappa.push(r);
  }
  out.push(...righeMappa.map(r => "   " + r.split("").join(" ")));
  out.push(`@ = tu, guardi ${st.dir === "giu" ? "giù" : st.dir === "su" ? "su" : `a ${st.dir}`} · . = si cammina · ` + [...legenda].map(([k, v]) => `${k} = ${v}`).join(" · "));
  if (cosePresenti(m, ctx).some(q => q.tipo === "luccichio" && q.x === st.x && q.y === st.y)) out.push("(sotto i tuoi piedi: un luccichio)");
  if (g.velo) out.push(`(schermo scuro) ${spazi(g.velo)}`);
  const rq = g.riquadro;
  if (rq) out.push(`RIQUADRO — ${rq.chi ? rq.chi + " " : ""}${rq.testo}`);
  if (g.scelta) out.push("SCELTE: " + g.scelta.map((t, i) => `${i === g.indiceScelta ? "▶ " : "  "}${t}`).join(" / ") + "   (su/giu, poi a)");
  if (g.menu) out.push("MENU: " + g.menu.map(v => `${v.on ? "▶ " : "  "}${v.testo}`).join(" / ") + "   (su/giu, a per scegliere, b per chiudere)");
  // il nome del posto compare un attimo, entrando: lo si scrive una volta
  const luogo = app.querySelector<HTMLElement>(".gb-luogo");
  if (luogo && !luogo.hidden && luogo.textContent) { out.push(`(in alto compare un attimo: ${luogo.textContent})`); luogo.hidden = true; }
  return out.join("\n");
}

/** Lascia finire quello che il gioco sta facendo; il testo che si scrive a macchina si completa, come premendo A. */
async function assesta(ms = 60) {
  await pausa(ms);
  for (let i = 0; i < 20 && nelBorgo(); i++) {
    const g = D().mondo;
    if (g.riquadro && !g.pieno && !g.scelta) { g.premi("a"); await pausa(10); } else break;
  }
}
async function schermo(): Promise<string> {
  const toast = w.document.getElementById("toast")!;
  let avviso = "";
  if (!toast.hidden && toast.textContent) { avviso = `\nAVVISO: ${spazi(toast.textContent)}`; toast.hidden = true; }
  return (nelBorgo() ? schermoMondo() : schermoBanco()) + avviso;
}

/* ---------- i comandi ---------- */
const DIR = new Set(["su", "giu", "sinistra", "destra"]);
console.log(`Diottri · seme ${seme}\n`);
await assesta(80);
console.log(await schermo());
const comandi = readFileSync(0, "utf8").split("\n").map(s => s.trim()).filter(Boolean);
for (const c of comandi) {
  if (c.startsWith("#")) { console.log(`\n${c}`); continue; }
  console.log(`\n> ${c}`);
  const [cmd, arg] = c.split(/\s+/);
  if (cmd === "schermo") { console.log(await schermo()); continue; }
  if (nelBorgo() && (DIR.has(cmd) || cmd === "gira" || cmd === "a" || cmd === "b" || cmd === "menu")) {
    const g = D().mondo;
    if (cmd === "gira") {
      if (!DIR.has(arg)) { console.log("gira su, giu, sinistra o destra."); continue; }
      if (!g.occupato) g.stato.dir = arg;
    } else if (DIR.has(cmd) && (g.scelta || g.menu)) {
      for (let i = 0; i < Math.max(1, Math.min(9, Number(arg) || 1)); i++) g.scorri(cmd);
    } else if (DIR.has(cmd)) {
      const n = Math.max(1, Math.min(30, Number(arg) || 1));
      let fatti = 0, esito = "";
      for (; fatti < n; fatti++) {
        esito = g.cammina(cmd);
        if (esito !== "mosso") break;
      }
      if (esito === "porta") await pausa(260);
      if (esito === "bloccato") console.log(fatti ? `(${fatti} pass${fatti === 1 ? "o" : "i"}, poi non si passa)` : "(non si passa)");
      else if (esito === "occupato") console.log("(c'è un riquadro aperto: prima premi a)");
      else if (n > 1) console.log(`(${fatti} pass${fatti === 1 ? "o" : "i"})`);
    } else g.premi(cmd);
    await assesta();
    console.log(await schermo());
    continue;
  }
  const n = Number(c);
  const b = bottoni[n - 1];
  if (nelBorgo() || !Number.isInteger(n) || !b) {
    console.log(nelBorgo() ? "Nel borgo: su, giu, sinistra, destra [n], gira <direzione>, a, b, menu, schermo." : "Scrivi il numero di un bottone, o «schermo».");
    continue;
  }
  if (b.tagName.toLowerCase() === "a") { console.log(`(un collegamento: esce dal gioco verso ${b.getAttribute("href")})`); continue; }
  if (b.hasAttribute("disabled")) { console.log("(spento: non succede niente)"); continue; }
  b.click();
  await assesta(90);
  console.log(await schermo());
}
if (SALVA) writeFileSync(SALVA, w.localStorage.getItem("diottri.v1") || "");
process.exit(0);
