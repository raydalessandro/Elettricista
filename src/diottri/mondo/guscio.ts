/* ====== DIOTTRI · IL MONDO: IL GUSCIO ======
   Lo schermo 160×144 a pixel netti dentro una scocca da console, la croce e i tasti A e B sotto, come un
   Game Boy tenuto in verticale. Qui ci sono il ciclo dei fotogrammi, i tasti (dito e tastiera), il riquadro
   dei dialoghi, le scelte, il menu, le porte e gli eventi. La logica sta in motore.ts; il disegno in disegno.ts. */
import { fase, INIZIO, MAPPE, nebbia, obiettivo } from "../content/borgo";
import { CELLA } from "../grafica/formato";
import { componi, SCHERMO_H, SCHERMO_W } from "./disegno";
import { chiDavanti, esegui, eventoArrivo, eventoDavanti, passo, posizioneLibera, type Regista } from "./motore";
import { type Contesto, DELTA, type Dir, type Evento, type StatoMondo } from "./tipi";

export interface Collegamenti {
  /** lo stato salvato: posizione e segni (lo stesso oggetto, aggiornato qui) */
  stato: StatoMondo;
  fatto(id: string): boolean;
  chi(): "uomo" | "donna";
  caso(id: string): Promise<void>;
  ric(id: string): Promise<void>;
  salva(): void;
  /** una voce del menu che porta fuori dal mondo: il vassoio, il percorso */
  esci(voce: "vassoio" | "percorso"): void;
}

type Tasto = "a" | "b" | "menu";
const OPPOSTO: Record<Dir, Dir> = { su: "giu", giu: "su", sinistra: "destra", destra: "sinistra" };
const PASSO_MS = 190; // una mattonella
const GIRO_MS = 90; // girarsi senza muoversi
/** In jsdom (test e riga di comando) non c'è il canvas: la logica gira lo stesso, il disegno no. */
const SENZA_CANVAS = typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent);
const rAF = (f: (t: number) => void): number =>
  typeof requestAnimationFrame === "function" && !SENZA_CANVAS ? requestAnimationFrame(f) : (setTimeout(() => f(performance.now()), 50) as unknown as number);
const ferma = (id: number) => { if (typeof cancelAnimationFrame === "function" && !SENZA_CANVAS) cancelAnimationFrame(id); else clearTimeout(id); };
const esc = (s: string) => s.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

export function creaGuscio(c: Collegamenti) {
  const st = c.stato;
  const ctx: Contesto = { fatto: id => c.fatto(id), get segni() { return st.segni; } } as Contesto;
  const mappa = () => MAPPE[st.mappa] ?? MAPPE.borgo;
  const genere = (t: string) => t.replace(/\{o\}/g, c.chi() === "donna" ? "a" : "o");

  // ---------- lo stato del guscio (non si salva) ----------
  let el: HTMLElement | null = null;
  let raf = 0;
  let tenuto: Dir | null = null;
  let giratoA = 0;
  let mossa: { da: [number, number]; t0: number } | null = null;
  let passi = 0; // per alternare le gambe
  let occupato = false; // un evento in corso: niente passi
  let versi: Record<string, Dir> = {};
  let menuAperto = false;
  let attesa: ((t: Tasto | number) => void) | null = null; // chi aspetta un tasto (riquadro, scelta, buio)
  let scelta: { voci: string[]; i: number; annulla?: number } | null = null;
  /** il giorno o la sera che si vede: cambia sotto il velo nero, non a metà di un dialogo */
  let faseVista = fase(ctx);
  let testoPieno = true;
  let typer = 0;
  let avviato = false;

  // ---------- il DOM ----------
  function html(): string {
    const croce = (["su", "sinistra", "destra", "giu"] as Dir[]).map(d => `<span class="gb-${d}"></span>`).join("");
    return `<main class="gb" aria-label="Il Borgo Diottria">` +
      `<div class="gb-scocca"><div class="gb-vetro"><div class="gb-schermo">` +
      `<canvas class="gb-sfondo" width="${SCHERMO_W}" height="${SCHERMO_H}" aria-hidden="true"></canvas>` +
      `<canvas class="gb-primo" width="${SCHERMO_W}" height="${SCHERMO_H}" role="img" aria-label="Il borgo, dall'alto"></canvas>` +
      `<div class="gb-velo" hidden></div><div class="gb-luogo" hidden></div>` +
      `<div class="gb-riquadro" hidden aria-live="polite"><b class="gb-chi"></b><p class="gb-testo"></p><span class="gb-freccia" aria-hidden="true">▼</span></div>` +
      `<div class="gb-scelte" hidden role="listbox"></div>` +
      `<div class="gb-menu" hidden role="menu"></div>` +
      `</div></div><p class="gb-marchio">DIOTTRI <small>Borgo Diottria</small></p></div>` +
      `<div class="gb-comandi">` +
      `<div class="gb-croce" role="group" aria-label="Croce: tieni premuto per camminare">${croce}<i></i></div>` +
      `<div class="gb-ab"><button class="gb-b" data-tasto="b" aria-label="Tasto B: indietro">B</button><button class="gb-a" data-tasto="a" aria-label="Tasto A: parla, tocca, avanti">A</button></div>` +
      `<div class="gb-start"><button data-tasto="menu" aria-label="Menu">MENU</button></div>` +
      `</div></main>`;
  }

  const q = <T extends HTMLElement>(s: string) => el?.querySelector<T>(s) ?? null;

  function attacca(contenitore: HTMLElement) {
    if (el) stacca();
    el = contenitore;
    adatta();
    // la croce: si tiene premuto, e si può far scorrere il dito
    const croce = q<HTMLElement>(".gb-croce")!;
    const dirDa = (e: PointerEvent): Dir => {
      const r = croce.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "destra" : "sinistra") : dy > 0 ? "giu" : "su";
    };
    croce.addEventListener("pointerdown", e => { e.preventDefault(); croce.setPointerCapture?.(e.pointerId); premiDir(dirDa(e)); });
    croce.addEventListener("pointermove", e => { if (tenuto && e.buttons) { const d = dirDa(e); if (d !== tenuto) premiDir(d); } });
    const lascia = () => lasciaDir();
    croce.addEventListener("pointerup", lascia);
    croce.addEventListener("pointercancel", lascia);
    croce.addEventListener("lostpointercapture", lascia);
    for (const b of el.querySelectorAll<HTMLButtonElement>("[data-tasto]")) {
      b.addEventListener("pointerdown", e => { e.preventDefault(); premi(b.dataset.tasto as Tasto); });
      b.addEventListener("click", e => { if ((e as MouseEvent).detail === 0) premi(b.dataset.tasto as Tasto); }); // tastiera e lettori di schermo
    }
    q(".gb-scelte")!.addEventListener("click", e => {
      const v = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      if (v && attesa && scelta) { const i = Number(v.dataset.i); scelta = null; const r = attesa; attesa = null; r(i); }
    });
    q(".gb-menu")!.addEventListener("click", e => {
      const v = (e.target as HTMLElement).closest<HTMLElement>("[data-voce]");
      if (v) voceMenu(v.dataset.voce!);
    });
    window.addEventListener("keydown", tastiera);
    window.addEventListener("keyup", tastieraSu);
    window.addEventListener("resize", adatta);
    ferma(raf);
    raf = rAF(ciclo);
    if (!occupato) sistema();
    if (!avviato) {
      avviato = true;
      arrivo(true);
    } else if (!occupato && !attesa) {
      // di ritorno da un caso fatto dal percorso: se la storia ha un arrivo in sospeso (il finale), parte adesso
      const ev = eventoArrivo(mappa(), ctx);
      if (ev) void evento(ev);
    }
  }

  /** Dove sei deve essere un posto dove si sta: una mappa che c'è, una cella libera (anche se un cliente è appena comparso lì). */
  function sistema() {
    if (!MAPPE[st.mappa]) Object.assign(st, structuredClone(INIZIO), { segni: st.segni });
    const [x, y] = posizioneLibera(mappa(), st.x, st.y, ctx);
    if (x !== st.x || y !== st.y) { st.x = x; st.y = y; mossa = null; c.salva(); }
    faseVista = fase(ctx);
  }

  function stacca() {
    ferma(raf);
    window.removeEventListener("keydown", tastiera);
    window.removeEventListener("keyup", tastieraSu);
    window.removeEventListener("resize", adatta);
    tenuto = null;
    el = null;
  }

  /** Lo schermo ingrandito a numeri interi: sul telefono due volte. */
  function adatta() {
    const s = q<HTMLElement>(".gb-schermo");
    if (!s) return;
    const w = Math.min(window.innerWidth || 390, 560) - 56;
    const h = (window.innerHeight || 844) - 300;
    const k = Math.max(1, Math.min(Math.floor(w / SCHERMO_W), Math.max(1, Math.floor(h / SCHERMO_H)) || 2));
    s.style.setProperty("--k", String(Math.max(2, k)));
  }

  // ---------- i tasti ----------
  const TASTI: Record<string, Dir | Tasto> = {
    ArrowUp: "su", ArrowDown: "giu", ArrowLeft: "sinistra", ArrowRight: "destra", w: "su", s: "giu", a: "sinistra", d: "destra",
    z: "a", Enter: "a", " ": "a", x: "b", Escape: "b", Backspace: "b", m: "menu", Shift: "menu",
  };
  function tastiera(e: KeyboardEvent) {
    const t = TASTI[e.key] ?? TASTI[e.key.toLowerCase()];
    if (!t || e.repeat && (t === "a" || t === "b" || t === "menu")) return;
    e.preventDefault();
    if (t === "su" || t === "giu" || t === "sinistra" || t === "destra") premiDir(t);
    else premi(t);
  }
  function tastieraSu(e: KeyboardEvent) {
    const t = TASTI[e.key] ?? TASTI[e.key.toLowerCase()];
    if (t === tenuto) lasciaDir();
  }

  function premiDir(d: Dir) {
    if (scelta && attesa) {
      if (d === "su" || d === "giu") { scelta.i = (scelta.i + (d === "su" ? -1 : 1) + scelta.voci.length) % scelta.voci.length; disegnaScelte(); }
      return;
    }
    if (menuAperto) {
      const voci = [...(q(".gb-menu")?.querySelectorAll<HTMLElement>("[data-voce]") ?? [])];
      const i = voci.findIndex(v => v.classList.contains("on"));
      if (d === "su" || d === "giu") { voci.forEach(v => v.classList.remove("on")); voci[(i + (d === "su" ? -1 : 1) + voci.length) % voci.length]?.classList.add("on"); }
      return;
    }
    tenuto = d;
    // un tocco breve fa un passo subito; tenendo premuto si continua nel ciclo
    if (!mossa && !occupato && !attesa) prova(d, performance.now());
  }
  function lasciaDir() { tenuto = null; }

  function premi(t: Tasto) {
    if (attesa) {
      if (scelta) {
        const i = t === "a" ? scelta.i : t === "b" ? scelta.annulla : undefined;
        if (i !== undefined) { scelta = null; const r = attesa; attesa = null; r(i); }
        return;
      }
      if (t === "menu") return; // il menu non manda avanti i dialoghi
      if (!testoPieno) { finisciTesto(); return; }
      const r = attesa; attesa = null; r(t);
      return;
    }
    if (menuAperto) {
      if (t === "b" || t === "menu") chiudiMenu();
      else if (t === "a") { const v = q(".gb-menu .on") as HTMLElement | null; if (v) voceMenu(v.dataset.voce!); }
      return;
    }
    if (occupato || mossa) return;
    if (t === "menu") { apriMenu(); return; }
    if (t === "a") parla();
  }

  // ---------- il menu ----------
  function apriMenu() {
    menuAperto = true;
    const m = q<HTMLElement>(".gb-menu")!;
    m.innerHTML = [["passo", "Il prossimo passo"], ["vassoio", "Vassoio e Campionario"], ["percorso", "Il percorso"], ["chiudi", "Chiudi"]]
      .map(([v, t], i) => `<button role="menuitem" data-voce="${v}" class="${i === 0 ? "on" : ""}">${t}</button>`).join("");
    m.hidden = false;
  }
  function chiudiMenu() { menuAperto = false; const m = q<HTMLElement>(".gb-menu"); if (m) m.hidden = true; }
  function voceMenu(v: string) {
    chiudiMenu();
    if (v === "passo") void evento([{ dice: obiettivo(ctx) || "Esplora il borgo." }]);
    else if (v === "vassoio" || v === "percorso") { c.salva(); c.esci(v); }
  }

  // ---------- parlare ----------
  function parla() {
    const m = mappa();
    const e = eventoDavanti(m, st, ctx);
    if (!e) return;
    const d = chiDavanti(m, st, ctx);
    if (d?.tipo === "personaggio" && d.p.siGira) versi[d.p.id] = OPPOSTO[st.dir];
    void evento(e.evento);
  }

  async function evento(ev: Evento) {
    occupato = true;
    tenuto = null;
    try {
      await esegui(ev, ctx, regista);
    } finally {
      occupato = false;
      versi = {};
      nascondi(".gb-riquadro");
      faseVista = fase(ctx);
      c.salva();
    }
  }

  // ---------- il riquadro ----------
  function mostraTesto(testo: string, chi?: string) {
    const r = q<HTMLElement>(".gb-riquadro");
    const t = q<HTMLElement>(".gb-testo");
    const n = q<HTMLElement>(".gb-chi");
    if (!r || !t || !n) return;
    n.textContent = chi ? `${chi}:` : "";
    n.hidden = !chi;
    r.hidden = false;
    r.classList.remove("pieno");
    const pieno = genere(testo);
    clearInterval(typer);
    let i = 0;
    testoPieno = false;
    t.textContent = "";
    t.dataset.pieno = pieno;
    typer = window.setInterval(() => {
      i += 2;
      t.textContent = pieno.slice(0, i);
      if (i >= pieno.length) finisciTesto();
    }, 22);
  }
  function finisciTesto() {
    clearInterval(typer);
    const t = q<HTMLElement>(".gb-testo");
    if (t) t.textContent = t.dataset.pieno ?? "";
    testoPieno = true;
    q<HTMLElement>(".gb-riquadro")?.classList.add("pieno");
  }
  const nascondi = (s: string) => { const x = q<HTMLElement>(s); if (x) x.hidden = true; };
  const aspetta = () => new Promise<Tasto | number>(res => { attesa = res; });

  function disegnaScelte() {
    const s = q<HTMLElement>(".gb-scelte");
    if (!s || !scelta) return;
    s.innerHTML = scelta.voci.map((v, i) => `<button role="option" data-i="${i}" class="${i === scelta!.i ? "on" : ""}" aria-selected="${i === scelta!.i}">${esc(v)}</button>`).join("");
    s.hidden = false;
  }

  const regista: Regista = {
    async dice(testo, chi) {
      mostraTesto(testo, chi);
      await aspetta();
    },
    async scelta(testo, voci, opzioni) {
      mostraTesto(testo);
      finisciTesto();
      scelta = { voci, i: opzioni?.predefinita ?? 0, annulla: opzioni?.annulla };
      disegnaScelte();
      const i = await aspetta();
      nascondi(".gb-scelte");
      return typeof i === "number" ? i : 0;
    },
    async caso(id) {
      nascondi(".gb-riquadro");
      c.salva();
      await c.caso(id);
    },
    async ric(id) {
      nascondi(".gb-riquadro");
      c.salva();
      await c.ric(id);
    },
    async vai(dest) { await vai(dest); },
    gira(d) { st.dir = d; },
    async buio(testo) {
      nascondi(".gb-riquadro");
      const v = q<HTMLElement>(".gb-velo");
      if (v) { v.hidden = false; v.textContent = genere(testo); v.classList.add("su"); }
      faseVista = fase(ctx);
      await new Promise<void>(res => {
        const t = window.setTimeout(() => { if (attesa) { attesa = null; res(); } }, 1800);
        attesa = () => { clearTimeout(t); res(); };
      });
      if (v) { v.classList.remove("su"); v.hidden = true; v.textContent = ""; }
    },
    async fine(testo, titolo, sotto) {
      nascondi(".gb-riquadro");
      const v = q<HTMLElement>(".gb-velo");
      if (v) { v.hidden = false; v.classList.add("su", "fine"); v.innerHTML = `<b>${esc(genere(titolo))}</b><span>${esc(genere(testo))}</span>${sotto ? `<em>${esc(genere(sotto))}</em>` : ""}<small>A per continuare</small>`; }
      await aspetta();
      if (v) { v.classList.remove("su", "fine"); v.hidden = true; v.textContent = ""; }
    },
    segna(s) { if (!st.segni.includes(s)) st.segni.push(s); c.salva(); },
    togli(s) { st.segni = st.segni.filter(x => x !== s); c.salva(); },
  };

  // ---------- porte e arrivi ----------
  async function vai(dest: { mappa: string; x: number; y: number; dir: Dir }) {
    const v = q<HTMLElement>(".gb-velo");
    if (v) { v.hidden = false; v.classList.add("su"); }
    await new Promise(r => setTimeout(r, el ? 160 : 0));
    st.mappa = dest.mappa;
    st.x = dest.x;
    st.y = dest.y;
    st.dir = dest.dir;
    mossa = null;
    sistema();
    c.salva();
    if (v) { v.classList.remove("su"); v.hidden = true; }
    await arrivo(false);
  }

  async function arrivo(primo: boolean) {
    const m = mappa();
    const l = q<HTMLElement>(".gb-luogo");
    if (l && !primo) {
      l.textContent = m.nome;
      l.hidden = false;
      window.setTimeout(() => { l.hidden = true; }, 1400);
    }
    const ev = eventoArrivo(m, ctx);
    if (ev) await evento(ev);
  }

  // ---------- il passo ----------
  function prova(d: Dir, ora: number) {
    const m = mappa();
    const prima: [number, number] = [st.x, st.y];
    if (st.dir !== d) {
      // prima ci si gira; se si tiene premuto, poi si cammina
      st.dir = d;
      giratoA = ora;
      return;
    }
    if (ora - giratoA < GIRO_MS) return;
    const p = passo(m, st, d, ctx, false);
    if (p.esito === "mosso") { mossa = { da: prima, t0: ora }; passi++; c.salva(); }
    else if (p.esito === "porta") { tenuto = null; void (async () => { occupato = true; try { await vai(p.porta.verso); } finally { occupato = false; } })(); }
    else if (p.esito === "chiusa") { tenuto = null; void evento([{ dice: p.testo }]); }
  }

  /** Un passo intero, subito, senza animazione: per i test e il robot. */
  function cammina(d: Dir): string {
    if (occupato || attesa) return "occupato";
    st.dir = d;
    const p = passo(mappa(), st, d, ctx, false);
    if (p.esito === "porta") { void vai(p.porta.verso); return "porta"; }
    if (p.esito === "chiusa") { void evento([{ dice: p.testo }]); return "chiusa"; }
    if (p.esito === "mosso") c.salva();
    return p.esito;
  }

  // ---------- il ciclo ----------
  function ciclo(ora: number) {
    if (mossa && ora - mossa.t0 >= PASSO_MS) mossa = null;
    if (!mossa && tenuto && !occupato && !attesa && !menuAperto) prova(tenuto, ora);
    disegna(ora);
    raf = rAF(ciclo);
  }

  function disegna(ora: number) {
    if (SENZA_CANVAS) return;
    const sf = q<HTMLCanvasElement>(".gb-sfondo"), pr = q<HTMLCanvasElement>(".gb-primo");
    const g1 = sf?.getContext?.("2d"), g2 = pr?.getContext?.("2d");
    if (!sf || !pr || !g1 || !g2) return;
    const m = mappa();
    let px = st.x * CELLA, py = st.y * CELLA, passoN = 0;
    if (mossa) {
      const k = Math.min(1, (ora - mossa.t0) / PASSO_MS);
      px = (mossa.da[0] + (st.x - mossa.da[0]) * k) * CELLA;
      py = (mossa.da[1] + (st.y - mossa.da[1]) * k) * CELLA;
      passoN = k > 0.2 && k < 0.8 ? 1 : 0;
    }
    const luce = m.fuori ? faseVista : "interno";
    const f = componi({ m, luce, ctx, tu: { px, py, dir: st.dir, passo: passoN, figura: c.chi() === "donna" ? "tu_donna" : "tu_uomo", alterna: passi % 2 === 1 }, versi, t: ora });
    g1.putImageData(new ImageData(f.sfondo.data, SCHERMO_W, SCHERMO_H), 0, 0);
    g2.clearRect(0, 0, SCHERMO_W, SCHERMO_H);
    g2.putImageData(new ImageData(f.primo.data, SCHERMO_W, SCHERMO_H), 0, 0);
    const n = m.fuori ? nebbia(ctx) : 0;
    sf.style.filter = n ? `blur(${(n * 0.55).toFixed(2)}px) saturate(${1 - n * 0.06})` : "";
  }

  return {
    html,
    attacca,
    stacca,
    get occupato() { return occupato || !!attesa || menuAperto; },
    /** per i test: premi un tasto, cammina di un passo, guarda lo stato */
    premi,
    cammina,
    /** la croce nelle scelte e nel menu (fuori, tenerla premuta fa camminare: lì si usa cammina) */
    scorri(d: Dir) { if ((scelta && attesa) || menuAperto) premiDir(d); },
    get attesa() { return !!attesa; },
    get scelta() { return scelta ? [...scelta.voci] : null; },
    get testo() { return q<HTMLElement>(".gb-testo")?.dataset.pieno ?? ""; },
    /** il riquadro: chi parla e il testo intero, se è aperto; e se il testo è già scritto tutto */
    get riquadro() { const r = q<HTMLElement>(".gb-riquadro"); return r && !r.hidden ? { chi: q<HTMLElement>(".gb-chi")?.textContent ?? "", testo: q<HTMLElement>(".gb-testo")?.dataset.pieno ?? "" } : null; },
    get pieno() { return testoPieno; },
    get indiceScelta() { return scelta ? scelta.i : -1; },
    get menu() { return menuAperto ? [...(q(".gb-menu")?.querySelectorAll<HTMLElement>("[data-voce]") ?? [])].map(v => ({ voce: v.dataset.voce!, testo: v.textContent ?? "", on: v.classList.contains("on") })) : null; },
    get velo() { const v = q<HTMLElement>(".gb-velo"); return v && !v.hidden ? (v.children.length ? [...v.children].map(x => x.textContent ?? "").join(" · ") : v.textContent ?? "") : ""; },
    /** il giorno o la sera che si vede adesso */
    get fase() { return faseVista; },
    stato: st,
    DELTA,
  };
}

export type Guscio = ReturnType<typeof creaGuscio>;
