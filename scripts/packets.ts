/* Prepara i "pacchetti" per la prova alla cieca: solo quello che il giocatore vede.
   Uso: npm run build:artifact && npm run packets -- [cartella] [id livelli separati da virgola]
   Gli aiuti finiscono in un file a parte (<id>-aiuti.md), da aprire solo se il revisore si blocca. */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/* eslint-disable @typescript-eslint/no-explicit-any */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] || join(root, "dist", "playtest");
const ONLY = process.argv[3] ? new Set(process.argv[3].split(",")) : null;

mkdirSync(OUT, { recursive: true });
const html = readFileSync(join(root, "dist", "fase-neutro-terra.html"), "utf8");
const file = join(OUT, "_page.html");
writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}</style></head><body>${html}</body></html>`);
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
// tsx dà un nome alle funzioni con un aiutante (__name) che nel browser non c'è
await page.addInitScript("window.__name = (f) => f;");
await page.goto("file://" + file);
await page.evaluate(() => (window as any).__fnt.ACTS.free());
const levels: string[] = await page.evaluate(() => (window as any).__fnt.LEVELS.map((l: any) => l.id));
const text = (sel: string) => page.evaluate(s => [...document.querySelectorAll(s)].map(e => (e as HTMLElement).innerText.trim()).filter(Boolean).join("\n"), sel);
const shot = async (name: string) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  return name;
};

for (const id of levels) {
  if (ONLY && !ONLY.has(id)) continue;
  const md: string[] = [];
  const info = await page.evaluate(id => {
    const F = (window as any).__fnt,
      l = F.LEVELS.find((x: any) => x.id === id),
      C = F.CARDS;
    const card = (c: any) =>
      [`### ${c.t}`, ...(c.ol || []).map((x: string, i: number) => `${i + 1}. ${x}`), ...(c.p || []), c.f ? "Formule: " + c.f.join(" · ") : "", c.g ? "Parole (tecnico → cantiere): " + c.g.map(([a, b]: string[]) => `${a} → ${b}`).join("; ") : "", c.capo ? `Il capo dice: ${c.capo}` : ""]
        .filter(Boolean)
        .join("\n");
    return { n: l.n, title: l.title, type: l.type, client: l.client, learn: l.learn, cards: l.cards.map((k: string) => card(C[k])), hints: l.hints || [], check: (l.check || []).map((c: any) => c.t), shop: l.shop ? l.shop.q + "\n" + l.shop.opts.map((o: any) => "- " + o.t).join("\n") : null, nFaults: (l.faults || []).length };
  }, id);
  md.push(`# Intervento ${info.n} · ${info.title}`, "", `**Chiamata** (${info.client.who}, ${info.client.where}): «${info.client.msg}»`, "", "**Cosa impari:** " + info.learn.join("; "), "", "## Schede di teoria (lette prima del lavoro)", "", info.cards.join("\n\n"), "");
  await page.evaluate(id => {
    const A = (window as any).__fnt.ACTS,
      l = (window as any).__fnt.LEVELS.find((x: any) => x.id === id);
    A.open(id);
    A.next();
    for (let i = 1; i < l.cards.length; i++) A.cardNext();
    A.next();
  }, id);
  if (info.type === "fili") {
    if (info.shop) {
      md.push("## Al negozio", "", info.shop, "");
      await page.evaluate(id => {
        const A = (window as any).__fnt.ACTS,
          l = (window as any).__fnt.LEVELS.find((x: any) => x.id === id);
        l.shop.opts.forEach((o: any, i: number) => {
          if (o.ok) A.shopSel(String(i));
        });
        A.shopDone();
        A.next();
      }, id);
    }
    md.push("## Sicurezza (schermata: " + (await shot(`${id}-1-sicurezza.png`)) + ")", "", await text("main .h1"), await text("main > .muted"), "");
    await page.evaluate(id => {
      const A = (window as any).__fnt.ACTS,
        l = (window as any).__fnt.LEVELS.find((x: any) => x.id === id);
      if (l.safety.type === "spina") {
        A.plug();
        A.work();
        return;
      }
      A.brk(l.safety.feed);
      A.tag();
      A.tprova();
      l.safety.probes.forEach((_: unknown, i: number) => A.probe(String(i)));
      A.work();
    }, id);
    md.push("## Il lavoro (schermata: " + (await shot(`${id}-2-tavola.png`)) + ")", "");
    md.push(await text("main .h1"), "", await text("main > p.muted"), await text("main > p.note-txt"), "", (await text(".nextw")) ? "Sopra la tavola, per i fili nuovi: colore e sezione (1,5 o 2,5 mm²)." : "", "");
    const nodes = await page.evaluate(() =>
      [...document.querySelectorAll("[data-t],[data-tip],[data-locked]")].map(e => {
        const d = (e as HTMLElement).dataset;
        return `- \`${d.t || (d.tip ? "punta:" + d.tip : "fisso:" + d.locked)}\` = ${e.getAttribute("aria-label")}`;
      }),
    );
    md.push("### Punti della tavola (le etichette che vedi)", "", ...nodes, "");
    const locked = await page.evaluate(id => (window as any).__fnt.LEVELS.find((x: any) => x.id === id).board.comps.filter((c: any) => c.locked && c.lockedMsg).map((c: any) => `- Se tocchi «${c.id}» il gioco dice: «${c.lockedMsg}»`), id);
    if (locked.length) md.push("### Pezzi già collegati", "", ...locked, "");
    md.push("### Controllo prima di ridare tensione (domande che il gioco ti fa dopo)", "", ...info.check.map((c: string) => "- " + c), "");
  } else if (info.type === "guasto") {
    md.push("## Il banco (schermata: " + (await shot(`${id}-1-banco.png`)) + ")", "", await text("main"), "");
    const nodes = await page.evaluate(() => [...document.querySelectorAll("[data-act=probeT]")].map(e => `- \`${(e as HTMLElement).dataset.arg}\` = ${e.getAttribute("aria-label")}`));
    md.push("### Punti dove appoggi i puntali", "", ...nodes, "");
    md.push(`Il gioco sceglie uno di ${info.nFaults} guasti possibili su questo impianto.`, "");
  } else if (info.type === "indagine") {
    md.push("## Indagine (schermata iniziale: " + (await shot(`${id}-1-sintomo.png`)) + ")", "", await text("main"), "");
    await page.evaluate(() => (window as any).__fnt.ACTS.indBet("2"));
    md.push("## Dopo la scommessa (schermata: " + (await shot(`${id}-2-quadro.png`)) + ")", "", await text("main"), "");
  } else {
    md.push("## Serata (schermata: " + (await shot(`${id}-1-serata.png`)) + ")", "", await text("main"), "");
  }
  if (info.hints.length) {
    writeFileSync(join(OUT, `${id}-aiuti.md`), ["# Suggerimenti (aprili solo se sei bloccato, e dillo nel rapporto)", "", ...info.hints.map((h: string, i: number) => `${i + 1}. ${h}`)].join("\n"));
    md.push("### Suggerimenti", "", `Sono nel file ${id}-aiuti.md: aprilo solo se sei bloccato, e dillo nel rapporto.`, "");
  }
  writeFileSync(join(OUT, `${id}.md`), md.join("\n"));
  console.log("pacchetto", id);
}
await browser.close();
