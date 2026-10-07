/* I modelli condivisi di lente e sole: numeri che il gioco Diottri usa per le tacche e le prove. */
import { describe, expect, it } from "vitest";
import { fascia, forbice, frange, freccia, moto, raggioBordo, riflesso, riflessoSuperficie, spessore } from "../../src/ottica/core/lente";
import { allaGuida, categoriaDa, diNotte, riflessoAcqua } from "../../src/ottica/core/sole";

describe("spessore", () => {
  it("la freccia cresce col quadrato della distanza e con la forza, cala con l'indice", () => {
    expect(freccia(-4, 1.5, 20)).toBeCloseTo(1.6, 5);
    expect(freccia(-4, 1.5, 40)).toBeCloseTo(6.4, 5);
    expect(freccia(-4, 1.665, 20)).toBeLessThan(freccia(-4, 1.5, 20));
  });
  it("i centri della montatura più larghi della distanza pupillare allontanano il bordo", () => {
    expect(raggioBordo({ calibro: 56, ponte: 18 }, 62)).toBe(34);
    expect(raggioBordo({ calibro: 50, ponte: 18 }, 68)).toBe(25);
  });
  it("una miopia forte in un calibro grande è spessa al bordo; 1,67 e calibro piccolo la assottigliano", () => {
    const grande = spessore(-5.75, "cr39", { calibro: 56, ponte: 18 }, 62);
    const sottile = spessore(-5.75, "i167", { calibro: 50, ponte: 18 }, 62);
    expect(grande.bordo).toBeGreaterThan(8);
    expect(sottile.bordo).toBeLessThan(5);
    expect(grande.centro).toBe(2);
  });
  it("col più lo spessore sta al centro", () => {
    const sp = spessore(4, "cr39", { calibro: 50, ponte: 18 }, 64);
    expect(sp.centro).toBeGreaterThan(sp.bordo);
  });
});

describe("riflessi e frange", () => {
  it("Fresnel: 4% con l'1,5, 7% con l'1,74; con l'antiriflesso resta poco", () => {
    expect(riflessoSuperficie(1.5)).toBeCloseTo(0.04, 3);
    expect(riflessoSuperficie(1.74)).toBeCloseTo(0.0729, 3);
    expect(riflesso("i167", true)).toBeLessThan(0.01);
    expect(riflesso("i167", false)).toBeGreaterThan(riflesso("cr39", false));
  });
  it("frange di colore: quasi uguali per policarbonato e 1,67, meno con l'organico 1,5", () => {
    expect(frange(-5.75, "pc")).toBeGreaterThan(0.18);
    expect(Math.abs(frange(-5.75, "pc") - frange(-5.75, "i167"))).toBeLessThan(0.02);
    expect(frange(-5.75, "cr39")).toBeLessThan(0.1);
  });
});

describe("neutralizzazione a mano", () => {
  it("col meno la croce va con la lente, col più contro, senza forza sta ferma", () => {
    expect(moto({ sph: -2, cyl: 0, axis: 180 }, 180).moto).toBe("con");
    expect(moto({ sph: 2, cyl: 0, axis: 180 }, 180).moto).toBe("contro");
    expect(moto({ sph: 0, cyl: 0, axis: 180 }, 180).moto).toBe("ferma");
  });
  it("un cilindro sposta la croce in una direzione sola, e girandolo si apre a forbice", () => {
    const rullo = { sph: 0, cyl: -2, axis: 90 };
    expect(moto(rullo, 180).moto).toBe("con");
    expect(moto(rullo, 90).moto).toBe("ferma");
    expect(forbice(rullo)).toBe(true);
    expect(forbice({ sph: -2, cyl: 0, axis: 180 })).toBe(false);
  });
  it("fasce di forza", () => {
    expect(fascia(-1.5)).toBe("debole");
    expect(fascia(2)).toBe("media");
    expect(fascia(-4)).toBe("forte");
  });
});

describe("sole", () => {
  it("categorie dalla luce che passa, e la guida", () => {
    expect(categoriaDa(0.12)).toBe(3);
    expect(categoriaDa(0.05)).toBe(4);
    expect(categoriaDa(0.3)).toBe(2);
    expect(allaGuida(4)).toBe(false);
    expect(allaGuida(3)).toBe(true);
    expect(diNotte(0.8)).toBe(true);
    expect(diNotte(0.6)).toBe(false);
  });
  it("la polarizzata spegne il riflesso dell'acqua molto più di una lente scura", () => {
    expect(riflessoAcqua(0.12, true)).toBeLessThan(riflessoAcqua(0.12, false) / 4);
  });
});
