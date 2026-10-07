/* ====== DIOTTRI · DISEGNI (GRAFICA PROVVISORIA) ======
   Stringhe SVG: le persone al banco, le scene come le vede il cliente (le sfoca il modello dell'occhio,
   con le scene del corso), il lago al sole, i Diottri da davanti, il profilo delle lenti di lato e le prove.
   È la grafica della mandata 2: serve a provare i giri, lo stile vero arriva nella mandata 3. */
import type { Sight } from "../ottica/core/eye";
import { MATERIALI, type MaterialeId, spessore } from "../ottica/core/lente";
import { sceneSVG } from "../ottica/draw";
import type { SceneId } from "../ottica/core/types";
import type { Aspetto, Famiglia, SpecieId } from "./core/tipi";

let seq = 0;
const uid = (p: string) => `${p}${++seq}`;
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const INK = "#1f2b28";

/* ---------- le persone ---------- */

export function avatarSVG(a: Aspetto, size = 64): string {
  const hair = a.lunghi
    ? `<path d="M17 27 Q16 10 32 10 Q48 10 47 27 Q50 44 44 50 L42 30 Q32 18 22 30 L20 50 Q14 44 17 27 Z" fill="${a.capelli}"/>`
    : `<path d="M19 26 Q19 11 32 11 Q45 11 45 26 Q41 18 32 18 Q23 18 19 26 Z" fill="${a.capelli}"/>`;
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">` +
    `<rect width="64" height="64" rx="14" fill="#e9dfc4"/>` +
    `<path d="M9 64 Q13 46 32 46 Q51 46 55 64 Z" fill="${a.maglia}"/>` +
    `<rect x="27" y="37" width="10" height="11" fill="${a.pelle}"/>` +
    `<ellipse cx="32" cy="28" rx="13" ry="15" fill="${a.pelle}"/>` + hair +
    (a.barba ? `<path d="M20 31 Q32 50 44 31 Q41 41 32 42 Q23 41 20 31 Z" fill="${a.capelli}"/>` : "") +
    `<circle cx="27" cy="29" r="1.7" fill="${INK}"/><circle cx="37" cy="29" r="1.7" fill="${INK}"/>` +
    (a.occhiali ? `<g fill="none" stroke="${INK}" stroke-width="1.4"><circle cx="27" cy="29" r="4.6"/><circle cx="37" cy="29" r="4.6"/><path d="M31.6 29 H32.4 M22.4 28 L19 27 M41.6 28 L45 27"/></g>` : "") +
    `<path d="M28.5 36.5 Q32 39 35.5 36.5" stroke="${INK}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
    `</svg>`;
}

export const ASPETTO_TU: Record<"uomo" | "donna", Aspetto> = {
  uomo: { pelle: "#e2a985", capelli: "#2c2420", maglia: "#2f7d6d", occhiali: true },
  donna: { pelle: "#f0c19c", capelli: "#4a2c1c", maglia: "#2f7d6d", occhiali: true, lunghi: true },
};

export const ASPETTO_IRIDE: Aspetto = { pelle: "#e9bd98", capelli: "#9a6a3c", maglia: "#7a3b52", occhiali: true, lunghi: true };

/* ---------- le scene ---------- */

/** Riflessi della lente sulla scena di notte: aloni e immagini fantasma intorno alle luci. */
function riflessiNotte(intens: number): string {
  if (intens <= 0) return "";
  const o = (x: number) => f1(Math.min(1, x * intens));
  const ghost = (x: number, y: number, r: number) =>
    `<circle cx="${x}" cy="${y}" r="${r * 4}" fill="#fff3c4" opacity="${o(0.16)}"/><circle cx="${x + 9}" cy="${y - 14}" r="${r * 0.9}" fill="#fffbe6" opacity="${o(0.55)}"/>`;
  return `<g aria-hidden="true">${ghost(118, 128, 5)}${ghost(142, 128, 5)}${ghost(176, 108, 2.8)}${ghost(188, 108, 2.8)}<rect width="320" height="180" fill="#ffffff" opacity="${o(0.06)}"/></g>`;
}

/** La scena come la vede il cliente. Le scene del corso le sfoca il modello; sopra, i riflessi della lente. */
export function scenaSVG(id: SceneId, s: Sight | null, opts: { riflessi?: number } = {}): string {
  const base = sceneSVG(id, s);
  if (id !== "notte" || !opts.riflessi) return base;
  return base.replace(/<\/g><\/svg>$/, `${riflessiNotte(opts.riflessi)}</g></svg>`);
}

/** Il lago a mezzogiorno: il sole che sbianca tutto, il riflesso dell'acqua che nasconde il galleggiante.
    trasm: la luce che passa dal filtro; abbaglio: quanto resta del riflesso (1 = tutto); tinta del filtro. */
export function lagoSVG(o: { trasm: number; abbaglio: number; tinta?: string | null }): string {
  const clip = uid("lg");
  const sbianca = Math.max(0, Math.min(1, (o.trasm - 0.2) / 0.72)) * 0.5;
  const scuro = o.tinta ? (1 - o.trasm) * 0.55 : 0;
  const glare = Math.max(0.04, Math.min(0.95, o.abbaglio));
  let strisce = "";
  for (let i = 0; i < 9; i++) {
    const y = 108 + i * 8, x = 40 + ((i * 53) % 220);
    strisce += `<path d="M${x} ${y} q12 -4 24 0 t24 0 t24 0" stroke="#ffffff" stroke-width="${2.2 + (i % 3)}" fill="none" stroke-linecap="round" opacity="${f1(glare)}"/>`;
  }
  return `<svg class="scene" viewBox="0 0 320 180" role="img" aria-label="Il lago a mezzogiorno"><defs><clipPath id="${clip}"><rect width="320" height="180" rx="8"/></clipPath></defs><g clip-path="url(#${clip})">` +
    `<rect width="320" height="100" fill="#9fd0f0"/><circle cx="262" cy="30" r="17" fill="#fff6c8"/><circle cx="262" cy="30" r="30" fill="#fff6c8" opacity=".35"/>` +
    `<path d="M0 92 Q40 74 80 88 Q120 70 170 86 Q220 72 260 86 Q290 78 320 88 V100 H0 Z" fill="#5f8f4e"/>` +
    `<rect y="98" width="320" height="82" fill="#3f86b0"/>` +
    `<g><line x1="150" y1="136" x2="150" y2="124" stroke="#2b2b2b" stroke-width="1.2"/><circle cx="150" cy="138" r="5" fill="#e04a2f"/><rect x="145" y="138" width="10" height="5" fill="#ffffff"/></g>` +
    strisce +
    `<path d="M20 180 L70 120" stroke="#6b4a2b" stroke-width="3"/><path d="M70 120 Q110 112 150 124" stroke="#ffffff" stroke-width=".8" fill="none" opacity=".8"/>` +
    `<rect width="320" height="180" fill="#ffffff" opacity="${f1(sbianca)}"/>` +
    (o.tinta ? `<rect width="320" height="180" fill="${o.tinta}" opacity="${f1(scuro)}"/>` : "") +
    `</g></svg>`;
}

/* ---------- i Diottri ---------- */

const COLORE: Record<SpecieId, string> = { conca: "#3f7fbf", bombo: "#e08a2e", rullo: "#8a5cc2", verdino: "#3fae7a", polare: "#3d4a57", bruno: "#7a4b2a", cello: "#8a5a2b" };
export const coloreSpecie = (s: SpecieId) => COLORE[s];

const occhietti = (cx: number, cy: number, d = 9) =>
  `<g><ellipse cx="${cx - d}" cy="${cy}" rx="3.4" ry="4.4" fill="#ffffff"/><ellipse cx="${cx + d}" cy="${cy}" rx="3.4" ry="4.4" fill="#ffffff"/>` +
  `<circle cx="${cx - d + 0.8}" cy="${cy + 0.8}" r="2" fill="${INK}"/><circle cx="${cx + d + 0.8}" cy="${cy + 0.8}" r="2" fill="${INK}"/>` +
  `<path d="M${cx - 4} ${cy + 9} Q${cx} ${cy + 12} ${cx + 4} ${cy + 9}" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;

/** Un Diottro visto da davanti, prima di riconoscerlo: da davanti le lenti si somigliano tutte. */
export function diottroDavanti(fam: Famiglia | "sconosciuto", size = 120): string {
  const g = uid("dg");
  let body: string;
  if (fam === "montatura") {
    body = `<g fill="none" stroke="#6b4423" stroke-width="7"><rect x="10" y="40" width="42" height="34" rx="12"/><rect x="68" y="40" width="42" height="34" rx="12"/><path d="M52 50 Q60 44 68 50"/></g>` +
      `<g fill="#c08a4a" opacity=".55"><circle cx="16" cy="45" r="3"/><circle cx="100" cy="70" r="3"/><circle cx="62" cy="47" r="2"/></g>` + occhietti(60, 56, 29);
  } else {
    const sole = fam === "sole";
    body = `<defs><radialGradient id="${g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${sole ? "#6b5a4a" : "#f2fbff"}"/><stop offset="1" stop-color="${sole ? "#2f2a26" : "#bfe0ec"}"/></radialGradient></defs>` +
      `<circle cx="60" cy="58" r="44" fill="url(#${g})" stroke="${sole ? "#1f1b18" : "#4f8aa0"}" stroke-width="4"/>` +
      `<path d="M30 34 Q40 22 56 20" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>` + occhietti(60, 58);
  }
  return `<svg class="diottro" viewBox="0 0 120 116" width="${size}" height="${Math.round(size * 0.97)}" aria-hidden="true">${body}</svg>`;
}

/** Il ritratto del Diottro riconosciuto: la sua faccia, col suo colore e il suo segno. */
export function diottroRitratto(sp: SpecieId, size = 96): string {
  const c = COLORE[sp];
  let segno = "";
  if (sp === "polare") for (let x = 34; x <= 86; x += 9) segno += `<line x1="${x}" y1="22" x2="${x}" y2="94" stroke="#ffffff" stroke-width="1.6" opacity=".45"/>`;
  if (sp === "verdino") segno = `<ellipse cx="44" cy="34" rx="12" ry="5" fill="#9ff0c4" opacity=".8" transform="rotate(-25 44 34)"/>`;
  if (sp === "rullo") segno = `<line x1="60" y1="16" x2="60" y2="100" stroke="#ffffff" stroke-width="3" stroke-dasharray="5 4" opacity=".8"/>`;
  if (sp === "cello") {
    return `<svg class="diottro" viewBox="0 0 120 116" width="${size}" height="${Math.round(size * 0.97)}" aria-hidden="true">` +
      `<g fill="none" stroke="${c}" stroke-width="8"><rect x="10" y="40" width="42" height="34" rx="12"/><rect x="68" y="40" width="42" height="34" rx="12"/><path d="M52 50 Q60 43 68 50"/></g>` +
      `<g fill="#3a2410" opacity=".6"><circle cx="14" cy="44" r="3"/><circle cx="104" cy="70" r="3.4"/><circle cx="60" cy="46" r="2"/><circle cx="30" cy="74" r="2.4"/></g>` + occhietti(60, 56, 29) + `</svg>`;
  }
  const scuro = sp === "polare" || sp === "bruno";
  return `<svg class="diottro" viewBox="0 0 120 116" width="${size}" height="${Math.round(size * 0.97)}" aria-hidden="true">` +
    `<circle cx="60" cy="58" r="44" fill="${scuro ? c : "#e6f4fa"}" stroke="${c}" stroke-width="6"/>` + segno + occhietti(60, 58) + `</svg>`;
}

/* ---------- la lente di lato ---------- */

/** Il profilo di una lente di lato: spessa al bordo col meno, al centro col più. Lo spessore è esagerato e lo si dice. */
export function profiloSVG(F: number, opts: { mat?: MaterialeId; calibro?: number; ponte?: number; dp?: number; label?: string; colore?: string } = {}): string {
  const mat = opts.mat ?? "cr39";
  const sp = spessore(F, mat, { calibro: opts.calibro ?? 50, ponte: opts.ponte ?? 18 }, opts.dp ?? 68);
  const k = 7; // pixel per millimetro: esagerato apposta
  const tc = sp.centro * k, te = sp.bordo * k;
  const pts: string[] = [], back: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = -1 + i / 10, y = 60 + t * 44;
    const xf = 70 - 16 * (1 - t * t);
    pts.push(`${f1(xf)},${f1(y)}`);
    back.unshift(`${f1(xf + tc + (te - tc) * t * t)},${f1(y)}`);
  }
  const mm = (x: number) => x.toLocaleString("it-IT", { maximumFractionDigits: 1 });
  return `<svg class="profilo" viewBox="0 0 200 128" role="img" aria-label="La lente di lato: ${mm(sp.centro)} mm al centro, ${mm(sp.bordo)} mm al bordo">` +
    `<polygon points="${[...pts, ...back].join(" ")}" fill="#d7eef6" stroke="${opts.colore ?? "#4f8aa0"}" stroke-width="2"/>` +
    `<line x1="20" y1="60" x2="190" y2="60" stroke="${INK}" stroke-width=".8" stroke-dasharray="3 3" opacity=".5"/>` +
    `<text x="194" y="52" text-anchor="end" style="font:600 11px var(--f-body);fill:${INK}">centro ${mm(sp.centro)} mm</text>` +
    `<text x="194" y="22" text-anchor="end" style="font:600 11px var(--f-body);fill:${INK}">bordo ${mm(sp.bordo)} mm</text>` +
    `<text x="10" y="122" style="font:500 10px var(--f-body);fill:#5d6b66">${esc(opts.label ?? MATERIALI[mat].nome)} · spessore esagerato</text></svg>`;
}

/** Due profili accanto: la lente di adesso e quella in 1,67 nella stessa montatura. */
export function confrontoSVG(F: number, mat: MaterialeId, m: { calibro: number; ponte: number }, dp: number): string {
  return `<div class="confronto">${profiloSVG(F, { mat, ...m, dp })}${profiloSVG(F, { mat: "i167", ...m, dp, colore: "#2f7d6d" })}</div>`;
}

/* ---------- le prove al banco ---------- */

const VEL: Record<string, number> = { debole: 0.25, media: 0.5, forte: 0.85 };

/** La neutralizzazione: la lente va avanti e indietro davanti a una croce lontana. */
export function neutralizzaSVG(o: { moto: "con" | "contro" | "ferma"; fascia?: "debole" | "media" | "forte"; scala?: number }): string {
  const clip = uid("nz");
  const m = o.moto === "ferma" ? 0 : (o.moto === "con" ? 1 : -1) * VEL[o.fascia ?? "media"];
  const dur = "2.6s";
  const lens = `values="-34 0; 34 0; -34 0" dur="${dur}" repeatCount="indefinite"`;
  const inner = `values="${f1(-34 * m)} 0; ${f1(34 * m)} 0; ${f1(-34 * m)} 0" dur="${dur}" repeatCount="indefinite"`;
  const s = o.scala ?? 1;
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="La croce vista nella lente che si muove">` +
    `<rect width="200" height="120" rx="8" fill="#fbf7ea"/><g stroke="${INK}" stroke-width="2"><line x1="100" y1="6" x2="100" y2="114"/><line x1="6" y1="60" x2="194" y2="60"/></g>` +
    `<defs><clipPath id="${clip}"><circle cx="100" cy="60" r="30"><animateTransform attributeName="transform" type="translate" ${lens}/></circle></clipPath></defs>` +
    `<g clip-path="url(#${clip})"><rect width="200" height="120" fill="#e6f4fa"/><g><animateTransform attributeName="transform" type="translate" ${inner}/>` +
    `<g transform="translate(100 60) scale(${s}) translate(-100 -60)" stroke="#b5473a" stroke-width="2.4"><line x1="100" y1="-40" x2="100" y2="160"/><line x1="-60" y1="60" x2="260" y2="60"/></g></g></g>` +
    `<circle cx="100" cy="60" r="30" fill="none" stroke="#4f8aa0" stroke-width="3"><animateTransform attributeName="transform" type="translate" ${lens}/></circle></svg>`;
}

/** Girare la lente: col cilindro i bracci della croce si aprono a forbice. */
export function ruotaSVG(forbice: boolean): string {
  const clip = uid("rt");
  const dur = "3s";
  const a = forbice ? 18 : 0;
  const arm = (rot: number, x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><animateTransform attributeName="transform" type="rotate" values="0 100 60; ${rot} 100 60; 0 100 60" dur="${dur}" repeatCount="indefinite"/></line>`;
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="La croce vista nella lente che gira">` +
    `<rect width="200" height="120" rx="8" fill="#fbf7ea"/><g stroke="${INK}" stroke-width="2"><line x1="100" y1="6" x2="100" y2="114"/><line x1="6" y1="60" x2="194" y2="60"/></g>` +
    `<defs><clipPath id="${clip}"><circle cx="100" cy="60" r="34"/></clipPath></defs>` +
    `<g clip-path="url(#${clip})"><rect width="200" height="120" fill="#e6f4fa"/><g stroke="#b5473a" stroke-width="2.4">${arm(a, 100, 10, 100, 110)}${arm(-a, 40, 60, 160, 60)}</g></g>` +
    `<g><circle cx="100" cy="60" r="34" fill="none" stroke="#4f8aa0" stroke-width="3"/><line x1="100" y1="22" x2="100" y2="30" stroke="#4f8aa0" stroke-width="3"><animateTransform attributeName="transform" type="rotate" values="0 100 60; 40 100 60; 0 100 60" dur="${dur}" repeatCount="indefinite"/></line></g></svg>`;
}

/** Il riflesso di una luce sulla lente: bianco e forte, o debole e colorato. */
export function riflessoSVG(antiriflesso: boolean, sole = false): string {
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="${antiriflesso ? "Riflesso debole e verdino" : "Riflesso bianco e forte"}">` +
    `<rect width="200" height="120" rx="8" fill="#2b3633"/><g fill="#ffe9a8"><rect x="146" y="10" width="34" height="10" rx="3"/><path d="M150 20 L176 20 L170 32 L156 32 Z" opacity=".6"/></g>` +
    `<circle cx="96" cy="66" r="44" fill="${sole ? "#3a302a" : "#bfe0ec"}" opacity=".9" stroke="#8fb7c6" stroke-width="3"/>` +
    (antiriflesso
      ? `<ellipse cx="116" cy="44" rx="9" ry="5" fill="#7fe0a8" opacity=".55"/>`
      : `<ellipse cx="116" cy="44" rx="13" ry="8" fill="#ffffff"/><ellipse cx="116" cy="44" rx="22" ry="14" fill="#ffffff" opacity=".3"/>`) +
    `</svg>`;
}

/** Due polarizzate: girando la seconda, a 90° la parte che si sovrappone diventa scura. */
export function polarizzateSVG(polarizzata: boolean): string {
  const clip = uid("pz");
  const dur = "3.2s";
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="${polarizzata ? "A 90 gradi diventano scure" : "Girando non cambia niente"}">` +
    `<rect width="200" height="120" rx="8" fill="#f3ecd6"/>` +
    `<defs><clipPath id="${clip}"><circle cx="76" cy="60" r="36"/></clipPath></defs>` +
    `<circle cx="76" cy="60" r="36" fill="#6b7d8a" opacity=".55"/>` +
    `<g><animateTransform attributeName="transform" type="rotate" values="0 124 60; 90 124 60; 0 124 60" dur="${dur}" repeatCount="indefinite"/>` +
    `<circle cx="124" cy="60" r="36" fill="#6b7d8a" opacity=".55"/><g stroke="#ffffff" stroke-width="1.2" opacity=".6">${[0, 1, 2, 3, 4].map(i => `<line x1="${108 + i * 8}" y1="30" x2="${108 + i * 8}" y2="90"/>`).join("")}</g></g>` +
    `<g clip-path="url(#${clip})"><circle cx="124" cy="60" r="36" fill="#11161a" opacity="0">` +
    (polarizzata ? `<animate attributeName="opacity" values="0;.92;0" dur="${dur}" repeatCount="indefinite"/>` : "") +
    `</circle></g></svg>`;
}

/** Lo schermo del telefono dietro la lente che gira: con la polarizzata, a un certo angolo si scurisce. */
export function telefonoSVG(polarizzata: boolean): string {
  const dur = "3.2s";
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="Lo schermo del telefono dietro la lente">` +
    `<rect width="200" height="120" rx="8" fill="#f3ecd6"/><rect x="70" y="8" width="60" height="104" rx="10" fill="${INK}"/><rect x="76" y="18" width="48" height="84" rx="3" fill="#9fd3e8"/>` +
    `<circle cx="100" cy="60" r="30" fill="#11161a" opacity="0">${polarizzata ? `<animate attributeName="opacity" values="0;.9;0" dur="${dur}" repeatCount="indefinite"/>` : ""}</circle>` +
    `<circle cx="100" cy="60" r="30" fill="none" stroke="#6b7d8a" stroke-width="4"><animateTransform attributeName="transform" type="rotate" values="0 100 60; 90 100 60; 0 100 60" dur="${dur}" repeatCount="indefinite"/></circle>` +
    `<line x1="100" y1="30" x2="100" y2="38" stroke="#6b7d8a" stroke-width="4"><animateTransform attributeName="transform" type="rotate" values="0 100 60; 90 100 60; 0 100 60" dur="${dur}" repeatCount="indefinite"/></line></svg>`;
}

/** Il fotometro: quanta luce passa. */
export function luceSVG(trasm: number): string {
  const w = Math.round(160 * trasm);
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="Passa il ${Math.round(trasm * 100)}% della luce">` +
    `<rect width="200" height="120" rx="8" fill="#f3ecd6"/><rect x="20" y="48" width="160" height="22" rx="4" fill="#d8cfb5"/>` +
    `<rect x="20" y="48" width="${w}" height="22" rx="4" fill="#d9a441"/>` +
    `<text x="100" y="36" text-anchor="middle" style="font:400 24px var(--f-pixel);fill:${INK}">${Math.round(trasm * 100)}%</text>` +
    [18, 43, 80].map(p => `<line x1="${20 + p * 1.6}" y1="74" x2="${20 + p * 1.6}" y2="82" stroke="${INK}"/><text x="${20 + p * 1.6}" y="96" text-anchor="middle" style="font:500 10px var(--f-body);fill:#5d6b66">${p}%</text>`).join("") +
    `</svg>`;
}

/** Il caldo sull'asta: l'acetato si ammorbidisce e si piega. */
export function caldoSVG(acetato: boolean): string {
  const dur = "2.4s";
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="${acetato ? "L'asta si ammorbidisce" : "Il caldo sulla lente"}">` +
    `<rect width="200" height="120" rx="8" fill="#f3ecd6"/><g fill="#e0573a" opacity=".7"><path d="M40 112 q8 -18 0 -30 q14 12 8 30 Z"/><path d="M62 112 q8 -22 0 -36 q16 14 8 36 Z"/></g>` +
    (acetato
      ? `<path d="M20 50 H120 Q160 50 176 70" stroke="#8a5a2b" stroke-width="9" fill="none" stroke-linecap="round"><animate attributeName="d" values="M20 50 H120 Q160 50 176 70; M20 50 H120 Q156 50 168 82; M20 50 H120 Q160 50 176 70" dur="${dur}" repeatCount="indefinite"/></path>`
      : `<circle cx="120" cy="54" r="30" fill="#bfe0ec" stroke="#4f8aa0" stroke-width="3"/><path d="M104 46 l8 6 l-6 6 l10 4" stroke="#b5473a" stroke-width="2" fill="none"/>`) +
    `</svg>`;
}

/** Le scritte sull'asta interna. */
export function astaSVG(testo: string): string {
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="${esc(testo)}">` +
    `<rect width="200" height="120" rx="8" fill="#f3ecd6"/><path d="M8 56 H170 Q192 56 194 76" stroke="#8a5a2b" stroke-width="20" fill="none" stroke-linecap="round"/>` +
    `<text x="20" y="60" style="font:600 11px var(--f-mono);fill:#f3ecd6">${esc(testo)}</text></svg>`;
}

/** Quanto lavora l'occhio, senza e con la lente: due barre. */
export function lavoraSVG(senza: number, con: number, dove = ""): string {
  const a = dove ? `, ${dove}` : "";
  const titolo = dove ? `<text x="188" y="15" text-anchor="end" style="font:600 10px var(--f-body);fill:${INK}">${dove}</text>` : "";
  const bar = (y: number, v: number, label: string) =>
    `<text x="12" y="${y - 6}" style="font:600 11px var(--f-body);fill:${INK}">${label}</text><rect x="12" y="${y}" width="176" height="14" rx="4" fill="#d8cfb5"/><rect x="12" y="${y}" width="${f1(176 * Math.min(1, v))}" height="14" rx="4" fill="${v > 0.5 ? "#b5473a" : v > 0.13 ? "#d9a441" : "#3f8a4f"}"/>`;
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="Quanto lavora l'occhio${a}, senza e con la lente">` +
    `<rect width="200" height="120" rx="8" fill="#f3ecd6"/>` + titolo + bar(36, senza, `Senza lente: lavora ${Math.round(senza * 100)}%`) + bar(86, con, `Con la lente: lavora ${Math.round(con * 100)}%`) + `</svg>`;
}

/** Una goccia d'acqua sulla lente. */
export function gocciaSVG(): string {
  return `<svg class="prova-svg" viewBox="0 0 200 120" role="img" aria-label="Una goccia d'acqua sulla lente">` +
    `<rect width="200" height="120" rx="8" fill="#f3ecd6"/><circle cx="100" cy="60" r="44" fill="#bfe0ec" stroke="#4f8aa0" stroke-width="3"/>` +
    `<path d="M100 40 q14 18 0 26 q-14 -8 0 -26 Z" fill="#7fc0e0" opacity=".8"/></svg>`;
}

/* ---------- piccole icone ---------- */

export const ICON = {
  back: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: (on: boolean) => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="${on ? "#d9a441" : "none"}" stroke="${on ? "#a8761c" : "#9aa69f"}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  lock: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  luccica: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#d9a441"/><circle cx="19" cy="4" r="1.5" fill="#d9a441"/><circle cx="5" cy="19" r="1.2" fill="#d9a441"/></svg>',
  banco: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="2" y="12" width="20" height="8" rx="1.5" fill="#2f7d6d"/><circle cx="12" cy="7" r="3.4" fill="#e2a985"/><path d="M6 12 Q12 8 18 12" fill="#c9506a"/></svg>',
};
