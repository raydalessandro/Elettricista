/* Diottri col dito, su un telefono 390×844: chi sei, il borgo con la croce e il tasto A, il prologo, Marco al binario
   e il primo caso al banco, il primo Diottro all'edicola, e la storia che resta quando si chiude e si riapre.
   Le strade lunghe si fanno col motore (gli stessi passi della croce, senza aspettare l'animazione). */
import { expect, test, type Page } from "@playwright/test";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function openDiottri(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await page.goto("/diottri");
  await page.waitForFunction(() => !!(window as any).__dio);
  return errors;
}

/** Il foglio in basso sta tutto dentro lo schermo del telefono. */
async function dentroLoSchermo(page: Page, sel: string) {
  const b = (await page.locator(sel).first().boundingBox())!;
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(390 + 0.5);
}

const mondo = (page: Page) => page.evaluate(() => { const g = (window as any).__dio.mondo; return { ...g.stato, occupato: g.occupato, testo: g.testo, scelta: g.scelta }; });
const tastoA = (page: Page) => page.getByRole("button", { name: /^Tasto A/ }).tap();

/** Tocca A finché la condizione sul mondo non vale (i dialoghi, il buio, le scelte sulla prima voce). */
async function aFinche(page: Page, cond: (m: Awaited<ReturnType<typeof mondo>>) => boolean, max = 80) {
  for (let i = 0; i < max; i++) {
    if (cond(await mondo(page))) return;
    await tastoA(page);
    await page.waitForTimeout(60);
  }
  expect(cond(await mondo(page))).toBe(true);
}

/** Cammina col motore, un passo alla volta: ogni passo deve riuscire. */
async function cammina(page: Page, passi: string) {
  for (const p of passi.split(" ")) {
    const [d, n] = p.split("*");
    for (let i = 0; i < Number(n ?? 1); i++) {
      const r = await page.evaluate(dir => (window as any).__dio.mondo.cammina(dir), d);
      expect(r, `${d} da ${JSON.stringify(await mondo(page))}`).toMatch(/mosso|porta/);
      if (r === "porta") await page.waitForTimeout(350);
    }
  }
}

/** Un tocco sulla croce, dal lato giusto. */
async function croce(page: Page, dir: "su" | "giu" | "sinistra" | "destra") {
  const b = (await page.locator(".gb-croce").boundingBox())!;
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2, r = b.width * 0.36;
  const [x, y] = dir === "su" ? [cx, cy - r] : dir === "giu" ? [cx, cy + r] : dir === "sinistra" ? [cx - r, cy] : [cx + r, cy];
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(260);
}

test("dalla home dei corsi si arriva al gioco, e si torna", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("a.course")).toHaveCount(2);
  await page.getByRole("link", { name: /Diottri/ }).tap();
  await page.waitForFunction(() => !!(window as any).__dio);
  await expect(page.getByText("Chi sei?")).toBeVisible();
  await page.getByRole("button", { name: "Uomo" }).tap();
  await expect(page.locator(".gb-schermo")).toBeVisible();
  await aFinche(page, m => !m.occupato); // durante un dialogo il menu non si apre
  await page.getByRole("button", { name: "Menu" }).tap();
  await page.getByRole("menuitem", { name: "Il percorso" }).tap();
  await expect(page.getByText("Il percorso si apre dopo la prima visita nella bottega di Iride.")).toBeVisible();
  await page.getByRole("link", { name: "Tutti i corsi" }).tap();
  await expect(page.getByRole("heading", { name: "Scegli il corso" })).toBeVisible();
});

test("il borgo col dito: il prologo, Marco e il primo caso, il primo Diottro; chiudi e riapri", async ({ page }) => {
  const errors = await openDiottri(page);
  await page.getByRole("button", { name: "Donna" }).tap();

  // la console: lo schermo intero dentro il telefono, la croce, A e B
  await expect(page.locator(".gb-schermo")).toBeVisible();
  await dentroLoSchermo(page, ".gb");
  await expect(page.locator(".gb-testo")).toContainText("l'insegna è una macchia", { timeout: 4000 });
  await aFinche(page, m => !m.occupato);

  // la croce: un tocco, un passo
  const prima = await mondo(page);
  await croce(page, "su");
  expect((await mondo(page)).y).toBe(prima.y - 1);
  await croce(page, "sinistra"); // il primo tocco gira soltanto
  expect((await mondo(page)).dir).toBe("sinistra");
  await croce(page, "destra");
  await croce(page, "destra");
  expect((await mondo(page)).x).toBe(prima.x + 1);

  // il prologo: in bottega la misura; fuori la strada nitida e la notte; il mattino in bottega
  await cammina(page, "sinistra su*14 sinistra*6");
  await croce(page, "su"); // ci si gira verso la porta della bottega…
  await croce(page, "su"); // …e si entra
  await expect(page.locator(".gb-testo")).toContainText("Buongiorno", { timeout: 4000 });
  await aFinche(page, m => m.segni.includes("misurato") && !m.occupato);
  await cammina(page, "giu"); // fuori
  await expect(page.locator(".gb-testo")).toContainText("Che nitido", { timeout: 4000 });
  await aFinche(page, m => m.segni.includes("furto") && !m.occupato);
  await cammina(page, "su"); // di nuovo dentro
  await aFinche(page, m => m.segni.includes("prologo") && !m.occupato);

  // il menu: il prossimo passo, e il percorso adesso è aperto
  await page.getByRole("button", { name: "Menu" }).tap();
  await page.getByRole("menuitem", { name: "Il prossimo passo" }).tap();
  await expect(page.locator(".gb-testo")).toContainText("Marco", { timeout: 4000 });
  await aFinche(page, m => !m.occupato);
  await page.getByRole("button", { name: "Menu" }).tap();
  await page.getByRole("menuitem", { name: "Il percorso" }).tap();
  await expect(page.locator("[data-act=apri][data-arg=c1]")).toBeEnabled();
  await page.getByRole("button", { name: "Torna al borgo" }).tap();
  await expect(page.locator(".gb-schermo")).toBeVisible();

  // Marco al binario: si parla col tasto A, si sceglie toccando
  await cammina(page, "giu destra*4 su*6 sinistra");
  expect((await mondo(page)).dir).toBe("sinistra"); // davanti c'è Marco
  await tastoA(page);
  await expect(page.locator(".gb-testo")).toContainText("tabellone", { timeout: 4000 });
  await aFinche(page, m => !!m.scelta);
  await page.locator(".gb-scelte").getByRole("option", { name: "Sì, andiamo!" }).tap();
  await expect(page.getByRole("heading", { name: /Il tabellone/ })).toBeVisible();
  await expect(page.getByText("Prima chiedi: tocca Chiedi.")).toBeVisible();

  // chiedi: due domande
  for (const q of ["Da quando?", "Lontano o vicino?"]) {
    await page.getByRole("button", { name: "Chiedi", exact: true }).tap();
    await dentroLoSchermo(page, ".foglio");
    await page.getByRole("button", { name: q }).tap();
  }
  await expect(page.locator(".riquadro")).toContainText("Lontano. Col telefono ci vedo bene.");

  // misura: la prova lenti, un occhio alla volta, coi bottoni
  await page.getByRole("button", { name: "Misura", exact: true }).tap();
  await page.getByRole("button", { name: /Prova lenti/ }).tap();
  await expect(page.getByRole("dialog", { name: "Prova lenti" })).toBeVisible();
  for (let occhio = 0; occhio < 2; occhio++) {
    const target: number = await page.evaluate(() => (window as any).__dio.solProva());
    expect(target).toBeLessThan(0);
    for (let g = 0; g < 40; g++) {
      const v: number = await page.evaluate(() => (window as any).__dio.S.caso.prova.v);
      if (Math.abs(v - target) < 1e-9) break;
      const d = target - v;
      const name = Math.abs(d) >= 1 ? (d < 0 ? "−1,00" : "+1,00") : d < 0 ? "−0,25" : "+0,25";
      await page.getByRole("button", { name, exact: true }).tap();
    }
    await page.getByRole("button", { name: "È questa" }).tap();
  }
  await expect(page.getByRole("dialog", { name: "Prova lenti" })).toHaveCount(0);
  await expect(page.locator(".posto").first()).toContainText(/OD −\d,\d\d · OS −\d,\d\d/);
  await expect(page.getByText("Tacche a zero: tocca Consegna!")).toBeVisible();

  // consegna: tre stelle, e si torna nel borgo dove Marco legge il tabellone
  await page.getByRole("button", { name: "Consegna", exact: true }).tap();
  await expect(page.getByRole("heading", { name: "Ci vedo!" })).toBeVisible();
  await expect(page.locator(".overlay.fine .stella.on")).toHaveCount(3);
  await page.getByRole("button", { name: "Torna al borgo" }).tap();
  await expect(page.locator(".gb-testo")).toContainText("binario 4", { timeout: 4000 });
  await aFinche(page, m => m.testo.includes("edicola"));
  await aFinche(page, m => !m.occupato);

  // il primo Diottro, all'edicola: la croce va contro la lente
  await cammina(page, "destra giu*7 destra*10 su*2");
  await page.evaluate(() => { (window as any).__dio.mondo.stato.dir = "su"; });
  await tastoA(page);
  await expect(page.getByRole("button", { name: "Neutralizza" })).toBeVisible();
  await page.getByRole("button", { name: "Neutralizza" }).tap();
  const cap = (await page.locator(".risultato figcaption").textContent()) || "";
  expect(cap).toMatch(/contro la lente/);
  const forza = /piano/.test(cap) ? "debole" : /svelta/.test(cap) ? "media" : "forte";
  await page.locator(".azioni").getByRole("button", { name: "Riconosci" }).tap();
  await dentroLoSchermo(page, ".foglio");
  await page.getByRole("button", { name: "Lente col più" }).tap();
  await page.getByRole("button", { name: forza, exact: true }).tap();
  await page.locator(".foglio").getByRole("button", { name: "Riconosci" }).tap();
  await expect(page.getByRole("heading", { name: "Preso!" })).toBeVisible();
  await expect(page.getByText("Occhio esperto: una prova sola")).toBeVisible();
  await page.getByRole("button", { name: "Nel vassoio" }).tap();
  await expect(page.locator(".gb-testo")).toContainText("Bombo è tornato", { timeout: 4000 });
  await aFinche(page, m => !m.occupato);

  // chiudi e riapri: sei nel borgo dove eri, coi passi fatti
  const dove = await mondo(page);
  await page.reload();
  await page.waitForFunction(() => !!(window as any).__dio?.mondo);
  const dopo = await mondo(page);
  expect([dopo.mappa, dopo.x, dopo.y]).toEqual([dove.mappa, dove.x, dove.y]);
  const fatti = await page.evaluate(() => (window as any).__dio.prog.fatti);
  expect(Object.values(fatti.c1.stelle).filter(Boolean)).toHaveLength(3);
  expect(fatti.r1.preso).toBe(true);
  await page.getByRole("button", { name: "Menu" }).tap();
  await page.getByRole("menuitem", { name: "Il percorso" }).tap();
  await expect(page.locator("[data-act=apri][data-arg=c1] .stella.on")).toHaveCount(3);
  await expect(page.locator("[data-act=apri][data-arg=r1]")).toContainText("Bombo");
  await expect(page.locator("[data-act=apri][data-arg=c2]")).toBeEnabled();
  await expect(page.locator("[data-act=apri][data-arg=r2]")).toBeDisabled();
  expect(errors).toEqual([]);
});
