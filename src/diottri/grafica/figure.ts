/* ====== DIOTTRI · PERSONAGGI E LUCCICHIO (16×16) ======
   Segnaposto: una figura semplice fatta dal programma, uguale per tutti, con la tavolozza di ognuno,
   finché non arrivano i disegni a mano (docs/gioco/STILE.md). «.» trasparente; 1 pelle, 2 vestiti, 3 capelli e contorno. */
import type { Figura } from "./formato";

type Verso = "giu" | "su" | "lato";
const disegna = (f: (x: number, y: number) => string) => Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => f(x, y)).join(""));

function sagoma(v: Verso, passo: number, occhiali: boolean): string[] {
  return disegna((x, y) => {
    const testa = Math.hypot(x - 7.5, y - 5) < 4.6;
    const bordoTesta = Math.hypot(x - 7.5, y - 5) < 5.4;
    if (y <= 2 && bordoTesta) return "3"; // capelli
    if (testa) {
      if (v === "su") return "3";
      if (v === "lato" && x < 6 && y < 7) return "3";
      if (y === 5 && (v === "giu" ? x === 5 || x === 10 : x === 10)) return "3";
      if (occhiali && y === 5 && (v === "giu" ? x >= 4 && x <= 11 : x >= 9)) return "3";
      return "1";
    }
    if (bordoTesta) return "3";
    if (y >= 10 && y <= 13 && x >= 4 && x <= 11) return x === 4 || x === 11 ? "3" : "2";
    if (y >= 14) {
      const sx = passo === 0 ? 5 : 4, dx = passo === 0 ? 10 : 11;
      return x === sx || x === dx || x === sx + 1 || x === dx - 1 ? "3" : ".";
    }
    return ".";
  });
}

function figura(pal: string, occhiali = true): Figura {
  return {
    pal,
    giu: [sagoma("giu", 0, occhiali), sagoma("giu", 1, occhiali)],
    su: [sagoma("su", 0, occhiali), sagoma("su", 1, occhiali)],
    lato: [sagoma("lato", 0, occhiali), sagoma("lato", 1, occhiali)],
  };
}

export const FIGURE: Record<string, Figura> = {
  tu_uomo: figura("tu_uomo"),
  tu_donna: figura("tu_donna"),
  iride: figura("iride"),
  marco: figura("marco"),
  giulia: figura("giulia", false),
  davide: figura("davide"),
  paolo: figura("paolo"),
  luisa: figura("luisa"),
  passante: figura("passante", false),
};

/** Il luccichio: tre fotogrammi, tavolozza «oro» (1 chiaro, 2 medio, 3 scuro). */
export const LUCCICHIO: string[][] = [0, 1, 2].map(f => disegna((x, y) => {
  const dx = Math.abs(x - 7.5), dy = Math.abs(y - 7.5), r = 2 + f * 2;
  if (dx < 1 && dy < r + 2) return dy < 1.5 ? "1" : "2";
  if (dy < 1 && dx < r + 2) return dx < 1.5 ? "1" : "2";
  if (f > 0 && Math.abs(dx - dy) < 0.6 && dx < r) return "3";
  return ".";
}));
