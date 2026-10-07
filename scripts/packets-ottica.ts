/* Pacchetti per la prova alla cieca del corso di ottica: solo quello che il giocatore vede.
   Uso: npm run build:artifact && npm run packets:ottica -- [cartella] [id livelli separati da virgola]
   Per ogni livello: <id>.md (testi dello schermo), foto del telefono, <id>-aiuti.md a parte.
   La prova e il banco si giocano con scripts/negozio.ts (comandi da stdin). */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CARDS, LEVELS } from "../src/ottica/content";

/* eslint-disable @typescript-eslint/no-explicit-any */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] || join(root, "dist", "playtest-ottica");
const ONLY = process.argv[3] ? new Set(process.argv[3].split(",")) : null;
mkdirSync(OUT, { recursive: true });

const html = readFileSync(join(root, "dist", "sfera-cilindro-asse.html"), "utf8");
const file = join(OUT, "_page.html");
writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}</style></head><body>${html}</body></html>`);
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await page.addInitScript("window.__name = (f) => f;");
await page.goto("file://" + file);
await page.evaluate(() => (window as any).__sca.ACTS.free());
const act = (code: string) => page.evaluate(c => { const A = (window as any).__sca.ACTS; new Function("A", c)(A); }, code);
const shot = async (name: string, hide = "") => {
  await page.evaluate(() => window.scrollTo(0, 0));
  const st = hide ? await page.addStyleTag({ content: `${hide}{display:none!important}` }) : null;
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  if (st) await st.evaluate(e => (e as Element).remove());
  return name;
};
const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1");

for (const lv of LEVELS) {
  if (ONLY && !ONLY.has(lv.id)) continue;
  const shots: string[] = [];
  await act(`A.open("${lv.id}")`);
  shots.push(await shot(`${lv.id}-1-cliente.png`));
  await act("A.next()");
  for (let i = 0; i < lv.cards.length; i++) {
    shots.push(await shot(`${lv.id}-2-scheda-${i + 1}.png`));
    if (i < lv.cards.length - 1) await act("A.cardNext()");
  }
  await act("A.next()");
  const p = lv.prova;
  if (p) {
    shots.push(await shot(`${lv.id}-3-prova.png`));
    if (p.type !== "ricetta") {
      // l'occhiale di prova all'inizio, senza l'esito della scommessa
      await page.evaluate(() => { const F = (window as any).__sca; F.S.run.bet = F.prova().bet.ok; F.render(); });
      shots.push(await shot(`${lv.id}-3-prova-occhiale.png`, ".bet, .bet + .muted"));
      await page.evaluate(() => { const S = (window as any).__sca.S; S.run.bet = null; (window as any).__sca.render(); });
    }
    await act("A.next()");
  }
  shots.push(await shot(`${lv.id}-4-banco.png`));

  const c0 = lv.customer;
  const ages = p && p.type !== "ricetta" && p.variants ? [...new Set(p.variants.map(v => v.eye.age))].sort((a, b) => a - b) : [c0.age];
  const age = ages.length > 1 ? `${ages[0]}–${ages[ages.length - 1]} anni (l'età cambia a ogni partita)` : `${ages[0]} anni`;
  const who = lv.pick ? `${c0.name}, ${c0.job}. ${c0.msg}` : `${c0.name}, ${age} (${c0.job}): «${c0.msg}»${p && p.type !== "ricetta" && p.variants ? " — a ogni partita la ricetta del cliente cambia" : ""}`;
  const md: string[] = [`# Livello ${lv.n} · ${lv.title}`, "", `_${lv.short}_`, "", lv.pick ? "## La giornata" : "## Il cliente", "", who, "", "Cosa impari:", ...lv.learn.map(x => `- ${x}`), "", "## Teoria"];
  lv.cards.forEach((id, i) => {
    const c = CARDS[id];
    md.push("", `### Scheda ${i + 1}: ${c.t}`, "", ...(c.p || []).map(x => plain(x) + "\n"), ...(c.ol || []).map((x, k) => `${k + 1}. ${plain(x)}`), "", ...(c.after || []).map(x => plain(x) + "\n"));
    if (c.lab) md.push(`_(laboratorio da toccare: vedi la foto ${lv.id}-2-scheda-${i + 1}.png)_`, "");
    if (c.g) md.push("| Tecnico | In negozio |", "|---|---|", ...c.g.map(([a, b]) => `| ${a} | ${b} |`), "");
    if (c.tutor) md.push(`> La titolare dice: ${c.tutor}`, "");
  });
  if (p) {
    md.push("## Prova", "");
    if ("bet" in p) md.push("L'occhiale di prova: metti le lenti e guardi come vede il cliente. È una simulazione semplificata, per capire cosa fa la lente.", "", `Prima, scommetti: ${p.bet.q}`, ...p.bet.o.map(o => `- ${o}`), "", `Dopo la scommessa: ${p.goal.replace(/\{\w+\}/g, "…")}`, "");
    else md.push(p.goal, "");
    md.push(`Si gioca con: \`npx tsx scripts/negozio.ts ${lv.id} <seme> <<'FINE' … FINE\` (comandi: ${p.type === "ricetta" ? "ricetta, tocca <cella>, occhiale <tipo>, aiuto" : "scommessa, scommetti <n>, guarda <n>, " + (p.type === "asse" ? "asse <gradi>" : p.type === "vicino" ? "addizione <diottrie>" : "lente <diottrie>") + ", conferma, aiuto"}).`, "");
  }
  md.push("## Il banco", "", `Si gioca con gli stessi comandi: \`banco\`, poi \`di <n>\` per scegliere cosa dire${lv.pick ? ", `prossimo` per il cliente dopo" : ""}. Poi \`domande\` e \`rispondi <n>\`, e \`stelle\` per l'esito.`, "", "## Foto", "", ...shots.map(s => `- ${s}`), "");
  writeFileSync(join(OUT, `${lv.id}.md`), md.join("\n"));
  if (p) writeFileSync(join(OUT, `${lv.id}-aiuti.md`), [`# Aiuti · livello ${lv.n}`, "", "Da aprire solo se ti blocchi. L'ultimo aiuto dà la soluzione.", ...(p.type !== "ricetta" && p.variants ? ["I numeri dipendono dalla ricetta del cliente, che cambia col seme: «[…]» lo dice il comando «aiuto» di negozio.ts."] : []), "", ...p.hints.map((h, i) => `${i + 1}. ${h.replace(/\{\w+\}/g, "[…]")}`), ""].join("\n"));
  console.log(`${lv.id}: ${shots.length} foto`);
}
writeFileSync(join(OUT, "quaderno.md"), [
  "# Prova alla cieca · Sfera Cilindro Asse",
  "",
  "Sei un venditore esperto (conosci la PNL e vendi da anni) appena entrato in un negozio di ottica: di occhi e lenti non sai niente. Il corso non insegna a vendere: insegna l'ottica. Giochi un livello alla volta.",
  "Per ogni livello leggi `<id>.md` e guarda le foto. Poi giochi la prova e il banco con `npx tsx scripts/negozio.ts <id> <seme>` (un numero qualsiasi come seme), mandando i comandi da stdin.",
  "Il seme decide la ricetta del cliente e l'ordine delle risposte: con semi diversi giochi casi diversi (qualche seme può dare la stessa ricetta). Come nel gioco, si va avanti e non si torna indietro: prova, banco, domande.",
  "Gli aiuti stanno in `<id>-aiuti.md`: aprili solo se ti blocchi, e dillo.",
  "",
  "Annota ogni volta che:",
  "- devi indovinare qualcosa che non è sullo schermo o nelle schede già lette;",
  "- una scelta giusta o sbagliata ti sembra discutibile, o il consiglio della titolare non ti convince;",
  "- un'immagine non corrisponde al testo, o non si capisce cosa mostra;",
  "- un testo è difficile, lungo, ambiguo, o usa parole non spiegate.",
  "",
].join("\n"));
rmSync(file);
await browser.close();
