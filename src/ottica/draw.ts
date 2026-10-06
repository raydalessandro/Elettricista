/* ====== DISEGNI ======
   Stringhe SVG/HTML pure: l'occhio in sezione con i raggi, le scene viste dal cliente (sfocate dal modello),
   la lente vista da davanti con lo schema TABO, la lente progressiva, la ricetta.
   Le usano il gioco, i pacchetti per la prova alla cieca e i test. */
import { diop, normAxis, type Sight, TWO_FOCI, wearerAngle } from "./core/eye";
import type { Ricetta, RxCell, SceneId } from "./core/types";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
let seq = 0;
const uid = (p: string) => `${p}${++seq}`;
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

/* ---------- le scene ---------- */

const MONO = "font-family:var(--f-mono)";
const BODY = "font-family:var(--f-body)";
const DISP = "font-family:var(--f-display)";

interface SceneDef {
  /** sfondo fermo (non si sfoca: è il colore che arriva comunque all'occhio) */
  bg: string;
  /** quello che si sfoca */
  fg: string;
  label: string;
}

function tabellone(): SceneDef {
  const rows: [string, string, string, string][] = [
    ["10:35", "R 2617", "BERGAMO", "4"],
    ["10:42", "RE 2094", "BRESCIA", "7"],
    ["10:50", "FR 9531", "ROMA TERMINI", "12"],
    ["11:05", "R 2551", "LECCO", "2"],
  ];
  const t = (x: number, y: number, s: string, fill: string, size = 13.5, anchor = "start", w = 600) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" style="${MONO};font-size:${size}px;font-weight:${w};fill:${fill}">${esc(s)}</text>`;
  return {
    label: "Il tabellone delle partenze",
    bg: `<rect width="320" height="180" fill="#0d2a57"/>`,
    fg:
      t(12, 26, "PARTENZE", "#ffffff", 16, "start", 700) + t(308, 26, "10:31", "#ffd84a", 16, "end", 700) +
      t(12, 48, "ORA", "#9fb3d6", 10) + t(64, 48, "TRENO", "#9fb3d6", 10) + t(136, 48, "DESTINAZIONE", "#9fb3d6", 10) + t(308, 48, "BIN", "#9fb3d6", 10, "end") +
      `<line x1="10" y1="55" x2="310" y2="55" stroke="#2c4b80" stroke-width="1.5"/>` +
      rows.map(([o, tr, d, b], i) => { const y = 78 + i * 27; return t(12, y, o, "#ffd84a") + t(64, y, tr, "#ffffff", 12.5, "start", 500) + t(136, y, d, "#ffffff") + t(308, y, b, "#ffd84a", 14, "end", 700); }).join(""),
  };
}

function telefono(): SceneDef {
  const bub = (x: number, y: number, w: number, lines: string[], mine: boolean) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${10 + lines.length * 13}" rx="8" fill="${mine ? "#d6efc9" : "#ffffff"}"/>` +
    lines.map((l, i) => `<text x="${x + 8}" y="${y + 16 + i * 13}" style="${BODY};font-size:11px;fill:#1b1f24">${esc(l)}</text>`).join("");
  return {
    label: "Il telefono, in mano",
    bg: `<rect width="320" height="180" fill="#d9dde2"/><rect x="78" y="2" width="164" height="190" rx="18" fill="#1b1f24"/><rect x="86" y="10" width="148" height="176" rx="6" fill="#eef1f4"/>`,
    fg:
      `<text x="160" y="25" text-anchor="middle" style="${DISP};font-size:12px;font-weight:700;fill:#1b1f24">Chiara</text>` +
      bub(92, 32, 120, ["Domani alle 9 ci sei?"], false) +
      bub(118, 59, 110, ["Sì, porto io i", "documenti firmati"], true) +
      bub(92, 98, 126, ["Perfetto. Poi caffè", "al bar sotto, alle 8:30"], false) +
      bub(170, 137, 58, ["Ok!"], true),
  };
}

function strada(): SceneDef {
  return {
    label: "La strada, il cartello",
    bg: `<rect width="320" height="180" fill="#cfe3f5"/><path d="M0,112 C60,96 120,104 170,98 C230,92 280,100 320,96 V180 H0 Z" fill="#a8c39f"/><path d="M128,180 L152,110 H168 L192,180 Z" fill="#7b8188"/>`,
    fg:
      `<path d="M160,112 V118 M160,126 V136 M160,146 V162" stroke="#ffffff" stroke-width="2.4"/>` +
      `<rect x="236" y="66" width="4" height="70" fill="#5b6470"/><rect x="200" y="30" width="112" height="46" rx="4" fill="#1d5fc4" stroke="#ffffff" stroke-width="2"/>` +
      `<text x="210" y="49" style="${DISP};font-size:15px;font-weight:700;fill:#ffffff">MONZA</text><text x="302" y="49" text-anchor="end" style="${DISP};font-size:15px;font-weight:700;fill:#ffffff">8</text>` +
      `<text x="210" y="68" style="${DISP};font-size:15px;font-weight:700;fill:#ffffff">LECCO</text><text x="302" y="68" text-anchor="end" style="${DISP};font-size:15px;font-weight:700;fill:#ffffff">41</text>` +
      `<rect x="30" y="56" width="70" height="56" fill="#e8e0d0"/><path d="M26,58 L65,34 L104,58 Z" fill="#b0563b"/>` +
      [0, 1].map(i => `<rect x="${40 + i * 32}" y="68" width="16" height="16" fill="#5b7fa8"/>`).join("") +
      `<rect x="56" y="94" width="16" height="18" fill="#6d4c3a"/>`,
  };
}

function pc(): SceneDef {
  const lines = ["Ciao,", "ti mando le correzioni del logo:", "il blu un po' più scuro, la scritta", "più piccola e allineata a sinistra.", "Ci sentiamo dopo pranzo. Luisa"];
  return {
    label: "Lo schermo del computer",
    bg: `<rect width="320" height="180" fill="#d9dde2"/><rect x="24" y="6" width="272" height="164" rx="8" fill="#2b3036"/><rect x="32" y="14" width="256" height="148" fill="#ffffff"/><rect x="32" y="14" width="256" height="18" fill="#e3e6ea"/>`,
    fg:
      `<text x="40" y="27" style="${BODY};font-size:10px;fill:#5b6470">Posta · Correzioni logo</text>` +
      lines.map((l, i) => `<text x="44" y="${54 + i * 19}" style="${BODY};font-size:12.5px;fill:#1b1f24">${esc(l)}</text>`).join(""),
  };
}

function quadrante(): SceneDef {
  const cx = 160, cy = 92, R = 70;
  let fg = "";
  for (let a = 0; a < 180; a += 15) {
    const r = (a * Math.PI) / 180, dx = R * Math.cos(r), dy = R * Math.sin(r);
    fg += `<line x1="${f1(cx + dx)}" y1="${f1(cy - dy)}" x2="${f1(cx - dx)}" y2="${f1(cy + dy)}" stroke="#111" stroke-width="3.2" stroke-linecap="round"/>`;
  }
  for (let h = 1; h <= 12; h++) {
    const r = ((90 - h * 30) * Math.PI) / 180;
    fg += `<text x="${f1(cx + 82 * Math.cos(r))}" y="${f1(cy - 82 * Math.sin(r) + 4.5)}" text-anchor="middle" style="${MONO};font-size:12px;font-weight:600;fill:#5b6470">${h}</text>`;
  }
  return { label: "Il quadrante a raggiera", bg: `<rect width="320" height="180" fill="#ffffff"/>`, fg };
}

function notte(): SceneDef {
  const light = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="#ffd84a" opacity=".22"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fffbe6"/>`;
  return {
    label: "La strada di notte",
    bg: `<rect width="320" height="180" fill="#0b1020"/><path d="M60,180 L150,96 H170 L260,180 Z" fill="#1a1f2b"/>`,
    fg:
      `<path d="M160,100 V106 M160,114 V124 M160,134 V150 M160,162 V180" stroke="#8a8f99" stroke-width="2"/>` +
      light(118, 128, 5) + light(142, 128, 5) + light(176, 108, 2.8) + light(188, 108, 2.8) +
      [40, 96, 238, 284].map((x, i) => `<rect x="${x - 1}" y="${36 + (i % 2) * 8}" width="2" height="${70 - (i % 2) * 8}" fill="#3a3f4a"/><circle cx="${x}" cy="${36 + (i % 2) * 8}" r="3.6" fill="#ffb347"/>`).join("") +
      `<text x="250" y="160" style="${DISP};font-size:13px;font-weight:700;fill:#cfd6e2">USCITA 3</text>`,
  };
}

function ottotipo(): SceneDef {
  const rows: [string, number][] = [["E", 46], ["F P", 30], ["T O Z", 21], ["L P E D", 15], ["P E C F D", 11.5], ["E D F C Z P", 8.5]];
  let y = 8, fg = "";
  for (const [s, size] of rows) {
    y += size + 6;
    fg += `<text x="160" y="${f1(y)}" text-anchor="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:${size}px;font-weight:700;letter-spacing:${size * 0.35}px;fill:#111">${s}</text>`;
  }
  return { label: "Il cartellone delle lettere", bg: `<rect width="320" height="180" fill="#ffffff"/>`, fg };
}

function giornale(): SceneDef {
  const body = ["Da lunedì cambiano gli orari dei treni", "regionali. Le corse del mattino partono", "dieci minuti prima, quelle della sera", "restano uguali. I biglietti già comprati", "valgono fino alla fine del mese, anche", "sui treni con il nuovo orario."];
  return {
    label: "Il giornale, in mano",
    bg: `<rect width="320" height="180" fill="#f6f1e7"/>`,
    fg:
      `<text x="20" y="30" style="font-family:Georgia,serif;font-size:20px;font-weight:700;fill:#1b1f24">Treni, si cambia orario</text>` +
      `<line x1="20" y1="40" x2="300" y2="40" stroke="#1b1f24" stroke-width="1"/>` +
      body.map((l, i) => `<text x="20" y="${62 + i * 18}" style="font-family:Georgia,serif;font-size:12px;fill:#222">${esc(l)}</text>`).join(""),
  };
}

const SCENES: Record<SceneId, () => SceneDef> = { tabellone, telefono, strada, pc, quadrante, notte, ottotipo, giornale };
export const sceneLabel = (id: SceneId) => SCENES[id]().label;

/** Quanti pixel di sfocatura (deviazione standard, su 320 di larghezza) per ogni diottria che resta. */
export const BLUR_PX = 2.6;

/** La scena come la vede il cliente: sfocata nella direzione giusta, secondo il modello.
    Con due fuochi l'occhio giovane ne porta uno sulla retina (dMax, dMin): una direzione nitida, l'altra no.
    L'asse TABO si legge da davanti; chi porta gli occhiali vede lo specchio. */
export function sceneSVG(id: SceneId, s: Sight | null, label?: string): string {
  const sc = SCENES[id]();
  const sx = s ? BLUR_PX * Math.abs(s.dMax) : 0, sy = s ? BLUR_PX * Math.abs(s.dMin) : 0;
  const clip = uid("sc");
  let fg = sc.fg;
  if (sx > 0.06 || sy > 0.06) {
    const f = uid("bl");
    const a = wearerAngle(s!.phi);
    fg = `<filter id="${f}" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${f1(Math.max(sx, 0.01))} ${f1(Math.max(sy, 0.01))}"/></filter>` +
      `<g transform="rotate(${f1(-a)} 160 90)"><g filter="url(#${f})"><g transform="rotate(${f1(a)} 160 90)">${sc.fg}</g></g></g>`;
  }
  return `<svg class="scene" viewBox="0 0 320 180" role="img" aria-label="${esc(label || sc.label)}"><defs><clipPath id="${clip}"><rect width="320" height="180" rx="8"/></clipPath></defs><g clip-path="url(#${clip})">${sc.bg}${fg}</g></svg>`;
}

/* ---------- l'occhio in sezione ---------- */

export interface EyeDraw {
  /** cosa vede l'occhio (dal modello) */
  s: Sight;
  /** la lente davanti: potenza da disegnare (equivalente sferico); null = niente lente */
  lens: number | null;
  /** distanza dell'oggetto (Infinity = lontano) */
  dist: number;
  labels?: boolean;
  /** accomodazione massima per disegnare il cristallino (default 10) */
  ampVis?: number;
}

const AX = 96, XR = 316, XC = 142, XL = 78;
/** quanti pixel si sposta il fuoco per ogni diottria: esagerato apposta, per vederlo */
const KF = 20;
const nb = (s: string) => s.replace(/(\d) (cm|m)\b/g, "$1 $2");

function lensPath(x: number, P: number): string {
  const top = 56, bot = 136;
  const he = P < 0 ? 2.6 + Math.min(10, -P * 2.4) : 2.6, hc = P > 0 ? 2.6 + Math.min(10, P * 2.4) : 2.6;
  const k = 2 * hc - he;
  return `M${f1(x - he)},${top} Q${f1(x - k)},${AX} ${f1(x - he)},${bot} L${f1(x + he)},${bot} Q${f1(x + k)},${AX} ${f1(x + he)},${top} Z`;
}

/** Disegna l'occhio di lato: raggi, lente, cristallino che accomoda, fuoco davanti/sulla/dietro la retina. */
export function eyeSVG(o: EyeDraw): string {
  const { s, lens, dist } = o;
  const near = Number.isFinite(dist);
  const accom = Math.min(1, s.A / (o.ampVis || 10));
  const out: string[] = [];
  // occhio
  out.push(`<path class="eye-nerve" d="M310,${AX + 30} C324,${AX + 34} 336,${AX + 40} 354,${AX + 42} L354,${AX + 54} C334,${AX + 52} 322,${AX + 48} 304,${AX + 44}"/>`);
  out.push(`<ellipse class="eye-ball" cx="228" cy="${AX}" rx="90" ry="78"/>`);
  out.push(`<path class="eye-retina" d="M300.6,${AX - 45} A88,76 0 0 1 300.6,${AX + 45}"/>`);
  out.push(`<path class="eye-cornea" d="M150,${AX - 40} Q124,${AX} 150,${AX + 40}"/>`);
  out.push(`<line class="eye-iris" x1="156" y1="${AX - 44}" x2="156" y2="${AX - 21}"/><line class="eye-iris" x1="156" y1="${AX + 21}" x2="156" y2="${AX + 44}"/>`);
  out.push(`<ellipse class="eye-lens" cx="172" cy="${AX}" rx="${f1(7 + 7 * accom)}" ry="${f1(25 - 3 * accom)}"/>`);
  // oggetto
  if (near) out.push(`<rect class="obj" x="10" y="${AX - 13}" width="13" height="26" rx="3"/><text class="tl" x="16" y="${AX + 32}" text-anchor="middle">${esc(nb(dist < 1 ? Math.round(dist * 100) + " cm" : dist + " m"))}</text>`);
  else out.push(`<text class="tl" x="8" y="${AX - 48}">da lontano</text>`);
  // lente
  if (lens != null) out.push(`<path class="tlens" d="${lensPath(XL, lens)}"/><text class="tl" x="${XL}" y="152" text-anchor="middle">${esc(lens === 0 ? "0,00" : diop(lens))}</text>`);
  // raggi: due fasci se resta astigmatismo (dove li vede l'occhio, dopo aver accomodato)
  const bundles: { r: number; cls: string }[] = s.J > TWO_FOCI ? [{ r: s.dMax, cls: "ray" }, { r: s.dMin, cls: "ray ray2" }] : [{ r: s.m, cls: "ray" }];
  const P = lens ?? 0;
  let spot = 0;
  bundles.forEach((b, bi) => {
    const hs = bi === 0 ? [-12, -5, 5, 12] : [-15, 15];
    const xF = Math.max(196, Math.min(356, XR - KF * b.r));
    for (const h0 of hs) {
      const hL = near ? h0 * 0.9 : h0;
      const x0 = near ? 23 : 0, y0 = near ? AX : AX + h0;
      const slope = near ? hL / (XL - x0) : 0;
      const hC = hL + (slope - P * hL * 0.0021) * (XC - XL);
      // dalla cornea i raggi vanno verso il fuoco: se il fuoco è prima della retina si incrociano e si riaprono
      const yR = AX + (hC * (xF - XR)) / (xF - XC);
      spot = Math.max(spot, Math.abs(yR - AX));
      out.push(`<path class="${b.cls}" d="M${f1(x0)},${f1(y0)} L${XL},${f1(AX + hL)} L${XC},${f1(AX + hC)} L${XR},${f1(yR)}"/>`);
      if (xF > XR + 1) out.push(`<path class="${b.cls} virt" d="M${XR},${f1(yR)} L${f1(xF)},${AX}"/>`);
    }
    out.push(`<circle class="focus${bi ? " f2" : ""}" cx="${f1(xF)}" cy="${AX}" r="3.4"/>`);
  });
  // macchia sulla retina
  if (spot > 1.2) out.push(`<line class="spot" x1="${XR - 1}" y1="${f1(AX - spot)}" x2="${XR - 1}" y2="${f1(AX + spot)}"/>`);
  if (o.labels) {
    out.push(`<text class="tl" x="128" y="${AX - 50}" text-anchor="middle">cornea</text>`);
    out.push(`<text class="tl" x="182" y="${AX + 44}" text-anchor="middle">cristallino</text>`);
    out.push(`<text class="tl" x="300" y="${AX - 58}" text-anchor="middle">retina</text>`);
  }
  return `<svg class="eye" viewBox="0 0 360 180" role="img" aria-label="L'occhio di lato: ${esc(focusWords(s).toLowerCase())}">${out.join("")}</svg>`;
}

/** Dove cade il fuoco, a parole (con la scena: di notte si dice delle luci). */
export function focusWords(s: Sight, scene?: SceneId): string {
  const two = s.J > TWO_FOCI;
  if (s.sharp === "nitido") return two ? "Due fuochi quasi insieme, sulla retina" : "Fuoco sulla retina";
  const where = (r: number) => (Math.abs(r) < 0.06 ? 0 : r > 0 ? 1 : -1);
  if (two) {
    const a = where(s.dMax), b = where(s.dMin);
    const lead = s.J <= 0.25 ? "Due fuochi vicini" : "Due fuochi";
    const pos = a === b ? (a > 0 ? "tutti e due davanti alla retina" : "tutti e due dietro la retina")
      : a === 0 || b === 0 ? `uno sulla retina, l'altro ${(a || b) > 0 ? "davanti" : "dietro"}`
      : "uno davanti e uno dietro la retina";
    return `${lead}, ${pos}: ${scene === "notte" ? "le luci si allungano" : "le righe in una direzione sono più nitide"}`;
  }
  const bit = Math.abs(s.m) < 0.3 ? "un po' " : "";
  return s.m > 0 ? `Fuoco ${bit}davanti alla retina` : `Fuoco ${bit}dietro la retina`;
}

/** Lo sforzo del cristallino, a parole. */
export function workWords(s: Sight): string {
  return ({ riposo: "a riposo", poco: "lavora poco", lavora: "lavora", fatica: "in fatica", nonbasta: "non ce la fa" } as const)[s.work];
}

export function sharpWords(s: Sight): string {
  return ({ nitido: "nitido", quasi: "quasi nitido", sfocato: "sfocato", molto: "molto sfocato" } as const)[s.sharp];
}

/* ---------- la lente vista da davanti, con lo schema TABO ---------- */

/** Lente da davanti: semicerchio TABO (0 a destra, 90 in alto, 180 a sinistra) e la linea dell'asse. */
export function taboSVG(axis: number, opts: { label?: string; ghost?: number; noVal?: boolean } = {}): string {
  const cx = 160, cy = 104, R = 64;
  const out: string[] = [];
  out.push(`<circle class="tabo-lens" cx="${cx}" cy="${cy}" r="${R}"/>`);
  for (let a = 0; a <= 180; a += 10) {
    const r = (a * Math.PI) / 180, long = a % 30 === 0;
    const x1 = cx + (R + 4) * Math.cos(r), y1 = cy - (R + 4) * Math.sin(r), x2 = cx + (R + (long ? 13 : 9)) * Math.cos(r), y2 = cy - (R + (long ? 13 : 9)) * Math.sin(r);
    out.push(`<line class="tabo-tick" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}"/>`);
    if (long) out.push(`<text class="tl" x="${f1(cx + (R + 24) * Math.cos(r))}" y="${f1(cy - (R + 24) * Math.sin(r) + 4)}" text-anchor="middle">${a}</text>`);
  }
  const line = (deg: number, cls: string) => { const r = (deg * Math.PI) / 180, dx = (R - 4) * Math.cos(r), dy = (R - 4) * Math.sin(r); return `<line class="${cls}" x1="${f1(cx - dx)}" y1="${f1(cy + dy)}" x2="${f1(cx + dx)}" y2="${f1(cy - dy)}"/>`; };
  if (opts.ghost != null) out.push(line(opts.ghost, "tabo-ghost"));
  out.push(line(axis, "tabo-axis"));
  if (!opts.noVal) out.push(`<text class="tabo-val" x="${cx}" y="${cy + R + 22}" text-anchor="middle">asse ${normAxis(axis)}°</text>`);
  return `<svg class="tabo" viewBox="0 0 320 ${opts.noVal ? 178 : 200}" role="img" aria-label="${esc(opts.label || "Lente vista da davanti")}: asse ${normAxis(axis)} gradi">${out.join("")}</svg>`;
}

/* ---------- la lente progressiva ---------- */

export type Gaze = "alto" | "centro" | "basso" | "lato";
export const GAZE_POINT: Record<Gaze, [number, number]> = { alto: [160, 74], centro: [160, 128], basso: [160, 154], lato: [96, 150] };

/** Mappa della progressiva: lontano in alto, corridoio, vicino in basso, zone laterali sfocate. */
export function progressiveSVG(gaze: Gaze): string {
  const [gx, gy] = GAZE_POINT[gaze];
  return `<svg class="prog" viewBox="0 0 320 200" role="img" aria-label="Lente progressiva vista da davanti: lo sguardo passa ${gaze === "alto" ? "in alto, dalla zona per lontano" : gaze === "centro" ? "al centro, dal corridoio" : gaze === "basso" ? "in basso, dalla zona per vicino" : "in basso a lato, dalla zona sfocata"}">
    <defs><clipPath id="pg-clip"><path d="M52,40 Q160,10 268,40 Q292,110 250,172 Q160,196 70,172 Q28,110 52,40 Z"/></clipPath>
    <pattern id="pg-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" class="pg-side"/><line x1="0" y1="0" x2="0" y2="7" class="pg-hl"/></pattern></defs>
    <g clip-path="url(#pg-clip)">
      <rect x="0" y="0" width="320" height="200" class="pg-far"/>
      <path d="M0,104 C70,100 120,104 142,112 L142,200 L0,200 Z" fill="url(#pg-hatch)"/>
      <path d="M320,104 C250,100 200,104 178,112 L178,200 L320,200 Z" fill="url(#pg-hatch)"/>
      <path d="M142,112 C150,124 150,126 132,140 L188,140 C170,126 170,124 178,112 Z" class="pg-mid"/>
      <path d="M118,140 H202 Q214,170 196,196 H124 Q106,170 118,140 Z" class="pg-near"/>
    </g>
    <path d="M52,40 Q160,10 268,40 Q292,110 250,172 Q160,196 70,172 Q28,110 52,40 Z" class="pg-edge"/>
    <text class="pg-t" x="160" y="52" text-anchor="middle">lontano</text>
    <line class="pg-lead" x1="198" y1="116" x2="174" y2="126"/><text class="pg-t" x="201" y="119" text-anchor="start" style="font-size:9px">intermedio</text>
    <text class="pg-t" x="160" y="178" text-anchor="middle">vicino</text>
    <text class="pg-t s" x="86" y="126" text-anchor="middle">sfocato</text><text class="pg-t s" x="236" y="146" text-anchor="middle">sfocato</text>
    <circle class="gaze" cx="${gx}" cy="${gy}" r="9"/><circle class="gaze-d" cx="${gx}" cy="${gy}" r="3"/>
  </svg>`;
}

/* ---------- la ricetta ---------- */

const cellTxt = (r: Ricetta, c: RxCell): string => {
  if (c === "ADD") return r.add ? diop(r.add) : "";
  const [eye, f] = c.split(".") as ["OD" | "OS", "SF" | "CIL" | "AX"];
  const l = eye === "OD" ? r.od : r.os;
  if (f === "SF") return diop(l.sph);
  if (!l.cyl) return "";
  return f === "CIL" ? diop(l.cyl) : String(normAxis(l.axis)) + "°";
};

/** La ricetta come la scrive l'oculista: una riga per occhio, SF CIL AX, e l'ADD. Le celle si possono toccare. */
export function ricettaHTML(r: Ricetta, o: { act?: string; attr?: string; mark?: Partial<Record<RxCell, "ok" | "bad" | "hl">> } = {}): string {
  const cell = (c: RxCell) => {
    const t = cellTxt(r, c), m = o.mark?.[c];
    const cls = `rx-c${m ? " " + m : ""}${t ? "" : " empty"}`;
    return o.act ? `<td><button class="${cls}" ${o.attr || "data-act"}="${esc(o.act)}" data-arg="${c}" aria-label="${esc(c.replace(".", " "))}: ${esc(t || "vuoto")}">${esc(t || "—")}</button></td>` : `<td><span class="${cls}">${esc(t || "—")}</span></td>`;
  };
  return `<div class="ricetta" role="group" aria-label="Ricetta">
    <div class="rx-h"><b>${esc(r.who || "Prescrizione lenti")}</b><span>${esc(r.date || "")}</span></div>
    <table><thead><tr><th></th><th>SF</th><th>CIL</th><th>AX</th></tr></thead><tbody>
      <tr><th>OD</th>${cell("OD.SF")}${cell("OD.CIL")}${cell("OD.AX")}</tr>
      <tr><th>OS</th>${cell("OS.SF")}${cell("OS.CIL")}${cell("OS.AX")}</tr>
      ${r.add ? `<tr class="add"><th>ADD</th>${cell("ADD")}<td colspan="2" class="rx-note">per vicino, tutti e due</td></tr>` : ""}
    </tbody></table></div>`;
}

/* ---------- la copertina ---------- */

export const HERO = `<svg class="hero-svg" viewBox="0 0 360 176" role="img" aria-label="Tre raggi di luce attraversano una lente e si incontrano in un punto: sfera, cilindro, asse">
  <path class="hr r1" d="M0,52 H70 L150,88"/><path class="hr r2" d="M0,88 H150"/><path class="hr r3" d="M0,124 H70 L150,88"/>
  <path class="h-lens" d="M70,30 Q90,88 70,146 Q50,88 70,30 Z"/>
  <circle class="h-dot" cx="150" cy="88" r="5"/>
  <text class="ht" x="168" y="58" style="fill:var(--o1)">SFERA</text>
  <text class="ht" x="168" y="106" style="fill:var(--o2)">CILINDRO</text>
  <text class="ht" x="168" y="154" style="fill:var(--o3)">ASSE</text>
</svg>`;
