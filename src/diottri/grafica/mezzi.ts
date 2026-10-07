/* ====== DIOTTRI · I MEZZI: LA BICI E LA CANOA ======
   Un mezzo si disegna SOPRA chi gioca: prima la figura di chi gioca, spostata in verticale di `alza` pixel
   (negativo: più su), poi il mezzo. Dove il mezzo è trasparente («.») si vede chi gioca. Quattro direzioni come le
   figure (il lato guarda a sinistra, a destra lo specchia il programma), due fotogrammi: fermo e in movimento. */
import type { Tavolozza } from "./formato";

export interface Mezzo {
  pal: string;
  /** di quanti pixel si sposta chi gioca, in su (negativo) o in giù (positivo), quando è sul mezzo */
  alza: number;
  giu: [string[], string[]];
  su: [string[], string[]];
  lato: [string[], string[]];
}

/** Divide un foglio (16 righe, sei fotogrammi da 16 caratteri separati da uno spazio) in un mezzo. */
function foglio(pal: string, alza: number, righe: string[]): Mezzo {
  const f = (i: number) => righe.map(r => r.split(" ")[i] ?? "");
  return { pal, alza, giu: [f(0), f(1)], su: [f(2), f(3)], lato: [f(4), f(5)] };
}

/** la bici: chi pedala sta tre pixel più su, sopra le ruote. Di fronte il manubrio con le manopole fuori dalle mani,
    il fanale, la forcella rossa e la ruota stretta tra le gambe; di spalle le manopole e il catarifrangente rosso;
    di lato le due ruote, la forcella e il telaio rosso sotto chi pedala. In movimento i pedali si alternano e i mozzi
    luccicano. 1 cromo, 2 telaio rosso, 3 gomme e contorno */
const BICI = foglio("bici", -3, [
  // giù fermo        giù in moto      su fermo         su in moto       lato fermo       lato in moto
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ..33............ ..33............",
  ".3..33333333..3. .3..33333333..3. .3............3. .3............3. ..333......333.. ..333......333..",
  ".33..........33. .33..........33. .33..........33. .33..........33. .3..23....3...3. .3..23....3...3.",
  "......3113...... ......3113...... ......3223...... ......3223...... 3..2.23..3.2...3 3..2.23..3.2...3",
  "......2332...... ......2332.1.... .......33....... .......33.1..... 3..3..3..3223..3 3..1..3..3221..3",
  ".....123321..... .....12332...... .....1.33.1..... .....1.33....... 3.....3323.....3 3....13323.....3",
  ".......33....... .......31....... .......33....... .......13....... .3...3.1..3...3. .3...3...13...3.",
  ".......33....... .......33....... .......33....... .......33....... ..333......333.. ..333......333..",
]);

/** la canoa: chi rema sta seduto dentro e se ne vedono la testa e le spalle. `alza` è 0 apposta: lo scafo copre la
    figura dalla cintola in giù dentro la sua cella; con chi gioca spostato in giù i piedi uscirebbero sotto lo scafo,
    perché il mezzo non disegna fuori dai suoi 16×16. Di fronte e di spalle la punta con l'onda bianca e la pagaia
    doppia di traverso, che in movimento si inclina e schizza; di lato lo scafo con le punte rialzate e la pagaia che
    scende dall'altra parte. 1 chiaro (asta e schiuma), 2 scafo rosso, 3 pale e contorno */
const CANOA = foglio("canoa", 0, [
  // giù fermo        giù in moto      su fermo         su in moto       lato fermo       lato in moto
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ ................ ................",
  "................ ................ ................ ................ .............33. ................",
  "................ ................ ................ ................ ............333. ..............33",
  "................ ................ ................ ................ ............33.. .............333",
  "................ 33.............. ................ 33.............. ...........1.... .............33.",
  "................ 33.............. ................ 33.............. .........11..... ............1...",
  "33............33 3311111......... 33............33 33.............. .......11....... ..........11....",
  "3311111111111133 .......111111133 33............33 ..............33 3....11........3 3.......11.....3",
  "3322222222222233 .322222222222333 3322222222222233 .322222222222333 3222222222222223 3222222222222223",
  "..113222222311.. ..11322222231111 ..113222222311.. ..11322222231111 .32222222222223. 132222222222223.",
  "....11322311.... ....11322311.111 ....11322311.... ....11322311.111 .13333333333331. 1133333333333311",
]);

export const MEZZI: Record<string, Mezzo> = { bici: BICI, canoa: CANOA };

/** Le tavolozze dei mezzi, come quelle delle figure: 0 non si usa, poi dal chiaro allo scuro. */
export const PAL_MEZZI: Record<string, Tavolozza> = {
  bici: ["#000000", "#e8e8f0", "#d64a3e", "#2a2630"],
  canoa: ["#000000", "#f6f2e8", "#e05a48", "#50321c"],
};
