/* Monta ogni corso in un solo file HTML: stessi sorgenti del sito, impacchettati con esbuild.
   dist/fase-neutro-terra.html (elettricista) e dist/sfera-cilindro-asse.html (ottica).
   Servono per l'anteprima su claude.ai e per le prove alla cieca. */
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fonts = "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

const COURSES = [
  {
    out: "fase-neutro-terra.html",
    entry: "src/game/standalone.ts",
    css: ["src/app/globals.css"],
    title: "Fase Neutro Terra",
    desc: "Il gioco per imparare l'impianto elettrico di casa: teoria, quadro, fili, collaudo e ricerca guasti.",
    appClass: "",
  },
  {
    out: "sfera-cilindro-asse.html",
    entry: "src/ottica/standalone.ts",
    css: ["src/app/globals.css", "src/app/ottica.css"],
    title: "Sfera Cilindro Asse",
    desc: "Il mestiere dell'ottico, per chi sa già vendere: come vede l'occhio, cosa correggono le lenti, e i casi al banco.",
    appClass: "ott",
  },
  {
    out: "diottri.html",
    entry: "src/diottri/standalone.ts",
    css: ["src/app/globals.css", "src/app/diottri.css"],
    title: "Diottri",
    desc: "Il mestiere dell'ottico, giocando: clienti al banco e Diottri da riconoscere. Prova dei due giri, grafica provvisoria.",
    appClass: "dio",
    fonts: "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Jersey+10&display=swap",
  },
];

for (const c of COURSES) {
  const js = await build({
    entryPoints: [join(root, c.entry)],
    bundle: true,
    format: "iife",
    target: "es2020",
    minify: true,
    legalComments: "none",
    write: false,
  });
  const css = c.css.map(f => readFileSync(join(root, f), "utf8")).join("\n");
  const html = `<title>${c.title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${c.desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${"fonts" in c && c.fonts ? c.fonts : fonts}">
<style>
${css}</style>
<div id="app"${c.appClass ? ` class="${c.appClass}"` : ""}></div>
<div id="toast" role="status" aria-live="polite" hidden></div>
<script>
${js.outputFiles[0].text}</script>
`;
  const out = join(root, "dist", c.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`${out}: ${(html.length / 1024).toFixed(1)} KB`);
}
