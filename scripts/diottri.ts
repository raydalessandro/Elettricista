/* Diottri da riga di comando, per le prove alla cieca: lo schermo del telefono scritto in testo, i tocchi da stdin.
   È la stessa interfaccia del gioco (src/diottri/ui.ts) montata in jsdom: si vede quello che vede chi gioca.
   Uso:  npx tsx scripts/diottri.ts [seme] <<'FINE'
         2
         4
         FINE
   Comandi (uno per riga):
     <numero>    tocca il bottone con quel numero, come sullo schermo
     schermo     scrive di nuovo lo schermo
     # …         una nota, non fa niente
   Le immagini si leggono dalla loro descrizione: (immagine: …). Le scritte dentro le scene non si leggono,
   perché sullo schermo sono sfocate come le vede il cliente: conta la riga sotto la scena.
   Il seme decide le varianti: la gradazione dei clienti e la forza dei Diottri.
   DIOTTRI_SALVA=file.json tiene i progressi tra una partita e l'altra (la chiave diottri.v1 del browser). */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const seme = Math.max(1, Math.floor(Number(process.argv[2]) || 1));
const SALVA = process.env.DIOTTRI_SALVA;

/* ---------- un telefono finto ---------- */
const dom = new JSDOM('<!doctype html><div id="app" class="dio"></div><div id="toast" hidden></div>', { url: "https://diottri.local/diottri" });
const w = dom.window;
const g = globalThis as unknown as Record<string, unknown>;
for (const k of ["window", "document", "localStorage", "HTMLElement", "Element", "Node"]) Object.defineProperty(g, k, { value: k === "window" ? w : (w as unknown as Record<string, unknown>)[k], configurable: true, writable: true });
Object.defineProperty(g, "navigator", { value: w.navigator, configurable: true });
w.scrollTo = (() => {}) as typeof w.scrollTo;
// i semi delle partite vengono da Math.random: qui li decide il seme, così la partita si ripete uguale
let a = seme >>> 0;
Math.random = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
if (SALVA && existsSync(SALVA)) w.localStorage.setItem("diottri.v1", readFileSync(SALVA, "utf8"));

const { mountDiottri } = await import("../src/diottri/ui");
const app = w.document.getElementById("app")!;
mountDiottri(app, { home: "/" });

/* ---------- lo schermo in testo ---------- */
let bottoni: HTMLElement[] = [];
const spazi = (s: string) => s.replace(/\s+/g, " ").trim();

/** Il testo di un pezzo di schermo: le stelle e le tacche dalle loro etichette, le immagini dalla descrizione. */
function testo(el: Node): string {
  if (el.nodeType === 3) return el.textContent || "";
  if (el.nodeType !== 1) return "";
  const e = el as Element;
  const cls = e.getAttribute("class") || "";
  if (e.tagName.toLowerCase() === "svg") return "";
  if (/\bstella\b/.test(cls)) return ` ${/\bon\b/.test(cls) ? "★" : "☆"}${spazi(e.textContent || "")} `;
  if (/\b(tacche|fiducia|diff)\b/.test(cls) && e.getAttribute("aria-label")) return ` [${e.getAttribute("aria-label")}] `;
  if (/\besito\b/.test(cls)) return ` «${spazi(e.textContent || "")}» `;
  return [...e.childNodes].map(testo).join(" ");
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
  if (/\bvelo\b/.test(el.getAttribute("class") || "")) return;
  if (el.getAttribute("role") === "dialog") out.push(`=== ${el.getAttribute("aria-label") || "finestra"} ===`);
  for (const c of el.children) righe(c, out);
}

function schermo(): string {
  bottoni = [];
  const out: string[] = [];
  // con un foglio o una finestra aperti, si tocca solo lì: come sul telefono, il velo copre il resto
  const sopra = app.querySelector(".overlay, .foglio");
  if (sopra) {
    const sotto: string[] = [];
    righe(app, sotto);
    bottoni = [];
    out.push("(sotto, coperto dal velo: " + spazi(sotto.filter(r => !r.startsWith("[")).slice(0, 3).join(" · ")) + " …)");
    righe(sopra, out);
  } else righe(app, out);
  const toast = w.document.getElementById("toast")!;
  if (!toast.hidden && toast.textContent) { out.push(`AVVISO: ${toast.textContent}`); toast.hidden = true; }
  return out.join("\n");
}

/* ---------- i tocchi ---------- */
console.log(`Diottri · seme ${seme}\n`);
console.log(schermo());
const comandi = readFileSync(0, "utf8").split("\n").map(s => s.trim()).filter(Boolean);
for (const c of comandi) {
  if (c.startsWith("#")) { console.log(`\n${c}`); continue; }
  console.log(`\n> ${c}`);
  if (c === "schermo") { console.log(schermo()); continue; }
  const n = Number(c);
  const b = bottoni[n - 1];
  if (!Number.isInteger(n) || !b) { console.log("Comando sconosciuto: scrivi il numero di un bottone, o «schermo»."); continue; }
  if (b.tagName.toLowerCase() === "a") { console.log(`(un collegamento: esce dal gioco verso ${b.getAttribute("href")})`); continue; }
  if (b.hasAttribute("disabled")) { console.log("(spento: non succede niente)"); continue; }
  b.click();
  console.log(schermo());
}
if (SALVA) writeFileSync(SALVA, w.localStorage.getItem("diottri.v1") || "");
