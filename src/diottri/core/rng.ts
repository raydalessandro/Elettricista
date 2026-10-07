/* Numeri casuali con un seme: la stessa partita si rigioca uguale (test, risolutore, riga di comando).
   Il seme si mescola col nome del caso (fmix32 di MurmurHash3 e FNV-1a): semi vicini danno partite scorrelate. */

const fmix = (h: number) => {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
};
const fnv = (s: string) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;

/** Un generatore (mulberry32) dal seme e da un nome. */
export function rng(seed: number, nome: string): () => number {
  let a = fmix(fmix(Math.max(1, Math.floor(seed))) ^ fnv(nome));
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Un elemento della lista, scelto dal seme. */
export function pick<T>(xs: T[], seed: number, nome: string): T {
  return xs[Math.floor(rng(seed, nome)() * xs.length)];
}

/** Un valore a quarti di diottria tra min e max, scelto dal seme. */
export function quarti(min: number, max: number, seed: number, nome: string): number {
  const n = Math.round((max - min) * 4);
  return Math.round((min + Math.floor(rng(seed, nome)() * (n + 1)) / 4) * 100) / 100;
}

/** Un seme nuovo, per le partite vere. */
export const semeNuovo = () => 1 + Math.floor(Math.random() * 2 ** 31);
