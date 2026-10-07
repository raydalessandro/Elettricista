/* ====== DIOTTRI · IL RICONOSCIMENTO ======
   Il secondo giro: un Diottro scappato si riconosce con le prove vere del banco, poi torna nel vassoio.
   Le prove leggono i modelli dell'ottica: la croce che va con o contro la lente, il profilo di lato,
   il riflesso, la polarizzata, la luce che passa. Gira senza disegno. */
import { diop, PLANO, type SphCyl } from "../../ottica/core/eye";
import { type Fascia, fascia, forbice, moto, spessore } from "../../ottica/core/lente";
import { CATEGORIE, type Categoria } from "../../ottica/core/sole";
import { pick, quarti } from "./rng";
import type { Msg, ProvaId, RicState, RiconoscimentoDef, SpecieId, Utilita } from "./tipi";

/* ---------- avvio ---------- */

export function nuovoRic(def: RiconoscimentoDef, seed: number): RicState {
  const g = def.grandezza;
  let valore = 0;
  if (g?.tipo === "sfera" || g?.tipo === "cilindro") valore = quarti(g.min, g.max, seed, def.id);
  else if (g?.tipo === "categoria") valore = pick(g.valori, seed, def.id);
  else if (g?.tipo === "calibro") valore = pick(g.valori, seed, def.id);
  return { id: def.id, seed, valore, diffidenza: 3, provate: [], errori: 0, soluzioneMostrata: false, fine: null, occhioEsperto: false, log: [] };
}

const say = (st: RicState, chi: Msg["chi"], t: string, esito?: Msg["esito"]) => { st.log.push(esito ? { chi, t, esito } : { chi, t }); };

/* ---------- com'è fatto il Diottro di questo incontro ---------- */

/** La lente del Diottro (null: non è una lente). */
export function lenteDi(specie: SpecieId, valore: number): SphCyl | null {
  switch (specie) {
    case "conca":
    case "bombo":
      return { sph: valore, cyl: 0, axis: 180 };
    case "rullo":
      return { sph: 0, cyl: valore, axis: 90 };
    case "verdino":
    case "polare":
    case "bruno":
      return PLANO;
    case "cello":
      return null;
  }
}

const antiriflesso = (s: SpecieId) => s === "verdino";
const polarizzata = (s: SpecieId) => s === "polare";
const montatura = (s: SpecieId) => s === "cello";

/** La luce che passa (frazione). */
export function luceDi(specie: SpecieId, valore: number): number {
  if (specie === "polare") return CATEGORIE[valore as Categoria].tipico;
  return 0.92;
}

const passo: Record<Fascia, string> = { debole: "si muove piano", media: "si muove svelta", forte: "corre" };

/** Spessore del profilo di prova: lente in un calibro 50, mm. */
export function profiloMm(l: SphCyl): { centro: number; bordo: number } {
  const F = l.sph + Math.min(0, l.cyl);
  return spessore(F, "cr39", { calibro: 50, ponte: 18 }, 68);
}

export interface Risultato {
  prova: ProvaId;
  testo: string;
  utilita: Utilita;
}

/** Quello che si vede con una prova, in una riga. */
export function osserva(def: RiconoscimentoDef, st: RicState, prova: ProvaId): string {
  const sp = def.specie, l = lenteDi(sp, st.valore);
  switch (prova) {
    case "neutralizza": {
      if (!l) return "Ha le lenti demo: la croce sta ferma.";
      if (l.cyl) return `Destra e sinistra: va con la lente, e ${passo[fascia(l.cyl)]}. Su e giù: ferma.`;
      const m = moto(l, 180);
      if (m.moto === "ferma") return "La croce sta ferma: niente forza.";
      return `La croce va ${m.moto} la lente, e ${passo[fascia(m.velocita)]}.`;
    }
    case "ruota":
      if (!l) return "Lenti demo: la croce resta dritta.";
      return forbice(l) ? "Girandola, la croce si apre a forbice." : "Girandola, la croce resta dritta.";
    case "dilato": {
      if (!l) return "Di lato si vede l'asta, dritta.";
      if (l.cyl) return "Spessa ai lati, sottile sopra e sotto.";
      const p = profiloMm(l), mm = (x: number) => x.toLocaleString("it-IT", { maximumFractionDigits: 1 });
      if (l.sph < -0.12) return `Più spessa al bordo: ${mm(p.bordo)} mm.`;
      if (l.sph > 0.12) return `Più spessa al centro: ${mm(p.centro)} mm.`;
      return "Sottile e uguale dappertutto.";
    }
    case "riflesso":
      if (!l) return "Lenti demo: il riflesso non dice niente.";
      return antiriflesso(sp) ? "Il riflesso è debole e verdino." : "Il riflesso è bianco e forte.";
    case "polarizzate":
      if (!l) return "Lenti demo: girando non cambia niente.";
      return polarizzata(sp) ? "Girando, a 90° diventano scure." : "Girando, non cambia niente.";
    case "telefono":
      if (!l) return "Lenti demo: lo schermo resta uguale.";
      return polarizzata(sp) ? "A un certo angolo lo schermo si scurisce." : "Lo schermo si vede sempre uguale.";
    case "luce":
      if (!l) return "Lenti demo: passa quasi tutta la luce.";
      return `Passa il ${Math.round(luceDi(sp, st.valore) * 100)}% della luce.`;
    case "caldo":
      if (!montatura(sp)) return "Il caldo può crepare i trattamenti della lente.";
      return "Al caldo l'asta si ammorbidisce.";
    case "asta":
      if (!montatura(sp)) return "Non ha aste da leggere.";
      return `Sull'asta: «Acetate ${st.valore}□18 140».`;
  }
}

/** Quanto serve una prova adesso: il caldo su una montatura è dannoso prima di aver letto l'asta. */
export function utilita(def: RiconoscimentoDef, st: RicState, prova: ProvaId): Utilita {
  if (prova === "caldo" && montatura(def.specie) && !st.provate.includes("asta")) return "dannosa";
  return def.prove[prova] ?? "inutile";
}

function diffida(st: RicState, d: number) {
  st.diffidenza += d;
  if (!st.soluzioneMostrata && st.diffidenza > 5) {
    // prima della risposta non scappa: resta sul punto di farlo, e lo si dice una volta
    st.diffidenza = 5;
    if (!st.log.some(m => m.t === SUL_PUNTO)) say(st, "iride", SUL_PUNTO);
  }
  if (st.diffidenza >= 6) {
    st.fine = "scappato";
    say(st, "gioco", "Si spaventa e scappa. Lo ritrovi dopo.");
  }
}

const SUL_PUNTO = "È sul punto di scappare: niente più prove a caso.";

/** Fa una prova. */
export function prova(def: RiconoscimentoDef, st: RicState, p: ProvaId): Risultato | null {
  if (st.fine || !(p in def.prove) || st.provate.includes(p)) return null;
  const u = utilita(def, st, p);
  st.provate.push(p);
  const testo = osserva(def, st, p);
  say(st, "gioco", testo);
  if (u === "dannosa") {
    say(st, "iride", p === "caldo" && montatura(def.specie) ? "Prima si legge l'asta, poi si scalda." : "Questa prova lo può rovinare.", "no");
    diffida(st, 2);
  } else if (u === "inutile") diffida(st, 1);
  return { prova: p, testo, utilita: u };
}

/* ---------- la risposta ---------- */

/** La seconda grandezza giusta, come si sceglie: la fascia, la categoria, il calibro. */
export function grandezzaGiusta(def: RiconoscimentoDef, st: RicState): string | null {
  const g = def.grandezza;
  if (!g) return null;
  if (g.tipo === "sfera" || g.tipo === "cilindro") return fascia(st.valore);
  return String(st.valore);
}

/** Le scelte per la seconda grandezza. */
export function sceltaGrandezza(def: RiconoscimentoDef): { nome: string; opzioni: string[] } | null {
  const g = def.grandezza;
  if (!g) return null;
  if (g.tipo === "sfera" || g.tipo === "cilindro") return { nome: "Forza", opzioni: ["debole", "media", "forte"] };
  if (g.tipo === "categoria") return { nome: "Categoria", opzioni: ["2", "3", "4"] };
  return { nome: "Calibro", opzioni: g.valori.map(String) };
}

export function nomeSoluzione(def: RiconoscimentoDef, st: RicState): string {
  const o = def.opzioni.find(x => x.id === def.specie)!;
  const g = grandezzaGiusta(def, st), gs = sceltaGrandezza(def);
  if (!g || !gs) return o.nome;
  return gs.nome === "Forza" ? `${o.nome}, ${g}` : `${o.nome}, ${gs.nome.toLowerCase()} ${g}`;
}

/** Riconosci: cos'è, e la seconda grandezza dove c'è. */
export function riconosci(def: RiconoscimentoDef, st: RicState, id: string, grandezza: string | null) {
  if (st.fine) return;
  const giusta = grandezzaGiusta(def, st);
  if (id === def.specie && (giusta === null || grandezza === giusta)) {
    st.fine = "preso";
    st.occhioEsperto = st.errori === 0 && st.provate.length === 1;
    say(st, "iride", `Bene: ${nomeSoluzione(def, st)}. Torna nel vassoio.`, "bene");
    return;
  }
  st.errori++;
  const parziale = id === def.specie;
  const gs = sceltaGrandezza(def);
  const cosa = gs ? `${gs.nome === "Calibro" ? "il" : "la"} ${gs.nome.toLowerCase()}` : "il resto";
  say(st, "iride", parziale ? `Quasi: il tipo è giusto, ${cosa} no.` : "Non è questo. Riguarda le prove.", "no");
  if (st.errori === 2) say(st, "iride", def.aiuto);
  if (st.errori >= 3 && !st.soluzioneMostrata) {
    st.soluzioneMostrata = true;
    say(st, "iride", `La risposta: ${nomeSoluzione(def, st)}.`);
  }
  diffida(st, 2);
}

/** Per i test e il risolutore: la lente del Diottro scritta come in negozio. */
export const scritta = (def: RiconoscimentoDef, st: RicState) => {
  const l = lenteDi(def.specie, st.valore);
  return l ? diop(l.sph + l.cyl) : String(st.valore);
};
