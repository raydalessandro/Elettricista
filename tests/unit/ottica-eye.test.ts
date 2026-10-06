/* Il modello dell'occhio: i casi del capitolo 1 di ottica devono comportarsi come in negozio. */
import { describe, expect, it } from "vitest";
import { amplitude, clearRange, decimiOf, diop, fromVec, meridian, nearPoint, PLANO, rxText, see, sph, toVec } from "../../src/ottica/core/eye";

describe("numeri da ottico", () => {
  it("diottrie scritte come sulla ricetta", () => {
    expect(diop(-1.75)).toBe("−1,75");
    expect(diop(2)).toBe("+2,00");
    expect(diop(0)).toBe("0,00");
    expect(rxText({ sph: -0.5, cyl: -1.25, axis: 170 })).toBe("−0,50 −1,25 × 170");
  });
  it("vettori di potenza: andata e ritorno", () => {
    for (const l of [{ sph: -0.5, cyl: -1.25, axis: 170 }, { sph: 1, cyl: -0.75, axis: 90 }, { sph: -3, cyl: -2, axis: 45 }]) {
      const b = fromVec(toVec(l));
      expect(b.sph).toBeCloseTo(l.sph, 6);
      expect(b.cyl).toBeCloseTo(l.cyl, 6);
      expect(b.axis).toBe(l.axis);
    }
    expect(meridian({ sph: 0, cyl: -1, axis: 180 }, 180)).toBeCloseTo(0);
    expect(meridian({ sph: 0, cyl: -1, axis: 180 }, 90)).toBeCloseTo(-1);
  });
  it("accomodazione e punto vicino con l'età", () => {
    expect(amplitude(20)).toBe(10);
    expect(nearPoint(20)).toBeCloseTo(0.1);
    expect(nearPoint(50)).toBeCloseTo(0.4);
    expect(amplitude(70)).toBe(0.5);
  });
  it("decimi plausibili", () => {
    expect(decimiOf(0)).toBe(10);
    expect(decimiOf(1)).toBe(3);
    expect(decimiOf(1.75)).toBe(2);
    expect(decimiOf(3)).toBe(1);
  });
});

describe("i clienti del capitolo 1", () => {
  const marco = { rx: sph(-1.75), age: 24 };
  it("Marco, miope: da lontano sfocato, da vicino nitido", () => {
    expect(see(marco, PLANO, Infinity).sharp).toBe("molto");
    expect(see(marco, PLANO, 0.4).sharp).toBe("nitido");
    expect(see(marco, PLANO, Infinity).m).toBeGreaterThan(0); // fuoco davanti alla retina
  });
  it("Marco: −1,75 giusta, −2,00 nitida ma con lavoro, −1,50 quasi", () => {
    const ok = see(marco, sph(-1.75), Infinity);
    expect(ok.sharp).toBe("nitido");
    expect(ok.work).toBe("riposo");
    const over = see(marco, sph(-2), Infinity);
    expect(over.sharp).toBe("nitido");
    expect(over.work).toBe("poco");
    expect(see(marco, sph(-1.5), Infinity).sharp).toBe("quasi");
  });
  const giulia = { rx: sph(2), age: 31 };
  it("Giulia, ipermetrope: nitido ovunque, ma al computer fatica", () => {
    const far = see(giulia, PLANO, Infinity), pc = see(giulia, PLANO, 0.6);
    expect(far.sharp).toBe("nitido");
    expect(far.work).toBe("lavora");
    expect(pc.sharp).toBe("nitido");
    expect(pc.work).toBe("fatica");
    expect(see(giulia, sph(2), 0.6).work).toBe("poco");
    expect(see(giulia, sph(2), Infinity).work).toBe("riposo");
    expect(see(giulia, sph(2.25), Infinity).sharp).toBe("quasi");
  });
  const franco = { rx: PLANO, age: 49 };
  it("Franco, presbite: telefono a 35 cm in fatica; +1,50 è la prima lente comoda", () => {
    expect(see(franco, PLANO, 0.35).work).not.toBe("lavora");
    expect(see(franco, sph(1.25), 0.35).work).toBe("fatica");
    const ok = see(franco, sph(1.5), 0.35);
    expect(ok.sharp).toBe("nitido");
    expect(ok.work).toBe("lavora");
    const r = clearRange(franco, sph(1.5));
    expect(Math.round(r.near * 100)).toBe(24);
    expect(Math.round(r.far * 100)).toBe(67);
    expect(see(franco, sph(1.5), Infinity).sharp).toBe("molto");
  });
  const sara = { rx: { sph: -0.5, cyl: -1.25, axis: 170 }, age: 35 };
  it("Sara, astigmatica: l'asse giusto è l'unico nitido; 30° di errore è come non avere il cilindro", () => {
    expect(see(sara, sara.rx, Infinity).sharp).toBe("nitido");
    expect(see(sara, { ...sara.rx, axis: 165 }, Infinity).sharp).toBe("quasi");
    const none = see(sara, sph(-0.5), Infinity).J;
    expect(see(sara, { ...sara.rx, axis: 140 }, Infinity).J).toBeCloseTo(none, 2);
    expect(see(sara, { ...sara.rx, axis: 125 }, Infinity).J).toBeGreaterThan(none);
  });
  it("asse sbagliato: due fuochi a cavallo della retina, l'occhio giovane ne porta uno a fuoco (una direzione nitida)", () => {
    const s = see(sara, { ...sara.rx, axis: 120 }, Infinity);
    expect(Math.abs(s.rMax)).toBeCloseTo(Math.abs(s.rMin), 2);
    expect(s.dMin).toBeCloseTo(0, 6);
    expect(s.dMax).toBeGreaterThan(1.5);
  });
  it("astigmatismo secondo regola: con −1,00 × 180 la sfocatura sta nel meridiano verticale", () => {
    const s = see({ rx: { sph: 0, cyl: -1, axis: 180 }, age: 60 }, PLANO, Infinity);
    expect(s.J).toBeCloseTo(0.5);
    // il meridiano che resta «da miope» è quello verticale: le righe orizzontali sfocano
    expect([s.phi, s.rMax > s.rMin]).toEqual([90, true]);
  });
});
