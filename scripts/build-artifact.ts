/* Monta il gioco in un solo file HTML (dist/fase-neutro-terra.html): stessi sorgenti del sito,
   impacchettati con esbuild. Serve per l'anteprima su claude.ai e per le prove alla cieca. */
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist", "fase-neutro-terra.html");

const js = await build({
  entryPoints: [join(root, "src/game/standalone.ts")],
  bundle: true,
  format: "iife",
  target: "es2020",
  minify: true,
  legalComments: "none",
  write: false,
});
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
const fonts = "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

const html = `<title>Fase Neutro Terra</title>
<meta name="description" content="Il gioco per imparare l'impianto elettrico di casa: teoria, quadro, fili, collaudo e ricerca guasti.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<style>
${css}</style>
<div id="app"></div>
<div id="toast" role="status" aria-live="polite" hidden></div>
<script>
${js.outputFiles[0].text}</script>
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`${out}: ${(html.length / 1024).toFixed(1)} KB`);
