/* Il corso di ottica col dito vero, su un telefono 390×844: home, prova lenti, banco, esito. */
import { expect, test, type Page } from "@playwright/test";
import { touchDrag } from "./helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function openOttica(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await page.goto("/ottica");
  await page.waitForFunction(() => !!(window as any).__sca);
  return errors;
}

test("la home fa scegliere il corso, e si torna indietro", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Scegli il corso" })).toBeVisible();
  const corsi = page.locator("a.course");
  await expect(corsi).toHaveCount(2);
  await page.getByRole("link", { name: /Sfera Cilindro Asse/ }).tap();
  await page.waitForFunction(() => !!(window as any).__sca);
  await expect(page.locator(".hero-svg")).toBeVisible();
  await page.getByRole("link", { name: /Tutti i corsi/ }).tap();
  await expect(page.getByRole("heading", { name: "Scegli il corso" })).toBeVisible();
  await page.getByRole("link", { name: /Fase Neutro Terra/ }).tap();
  await page.waitForFunction(() => !!(window as any).__fnt);
  await expect(page.getByRole("link", { name: /Tutti i corsi/ })).toBeVisible();
});

test("livello 1 col dito: scommessa, lente, banco, domande, tre stelle", async ({ page, context }) => {
  const errors = await openOttica(page);
  const cdp = await context.newCDPSession(page);

  await page.getByRole("button", { name: /Comincia: 1/ }).tap();
  await page.getByRole("button", { name: "Prima: la teoria" }).tap();
  // laboratorio della prima scheda: da lontano a vicino
  await page.locator("[data-lab] [data-x='near']").tap();
  await expect(page.locator("[data-lab]")).toContainText("Da vicino i raggi arrivano aperti");
  const nSchede: number = await page.evaluate(() => (window as any).__sca.LEVELS[0].cards.length);
  for (let i = 1; i < nSchede; i++) await page.getByRole("button", { name: "Avanti" }).tap();
  await page.getByRole("button", { name: "Alla prova lenti" }).tap();

  await page.getByRole("button", { name: "Col meno", exact: true }).tap();
  await expect(page.getByText("Scommessa vinta")).toBeVisible();

  // il cursore si trascina col dito e la vista si aggiorna sotto il dito
  const range = page.locator("#lensr");
  await range.scrollIntoViewIfNeeded();
  const box = (await range.boundingBox())!;
  const xOf = (v: number) => box.x + 10 + ((v + 4) / 6) * (box.width - 20);
  await touchDrag(page, cdp, { x: xOf(0), y: box.y + box.height / 2 }, { x: xOf(-1), y: box.y + box.height / 2 }, 12);
  const v1 = await page.evaluate(() => (window as any).__sca.S.run.v);
  expect(v1).toBeLessThan(0);
  expect(v1).toBeGreaterThan(-2);
  await expect(page.locator("#lensval")).toHaveText(/−/);

  // poi, a quarti, fino alla lente giusta per la ricetta di questa partita
  const sol: number = await page.evaluate(() => (window as any).__sca.sol()[0]);
  expect(sol).toBeLessThan(0);
  while ((await page.evaluate(() => (window as any).__sca.S.run.v)) > sol) await page.getByRole("button", { name: "Un quarto di diottria in meno" }).tap();
  while ((await page.evaluate(() => (window as any).__sca.S.run.v)) < sol) await page.getByRole("button", { name: "Un quarto di diottria in più" }).tap();
  await expect(page.locator("#lensval")).toHaveText("−" + Math.abs(sol).toFixed(2).replace(".", ","));
  await expect(page.locator("#simv .pill").first()).toContainText("nitido");
  await page.getByRole("button", { name: "Questa è la lente giusta" }).tap();
  await expect(page.locator("#verdict")).toContainText("Giusto");
  await page.getByRole("button", { name: "Al banco" }).tap();

  // al banco: sempre la mossa migliore, toccando il testo
  for (let k = 0; k < 10; k++) {
    const t = await page.evaluate(() => {
      const F = (window as any).__sca, r = F.S.run, st = r.dlg[r.dq[r.di]];
      if (!st || st.done) return null;
      return F.DLG[r.dq[r.di]].steps[st.step].choices.find((c: any) => c.ok === "best").t as string;
    });
    if (!t) break;
    await page.locator("#choices .opt", { hasText: t.slice(0, 40) }).tap();
  }
  await expect(page.getByText("Servito bene")).toBeVisible();
  await page.getByRole("button", { name: "Domande dal laboratorio" }).tap();
  for (let i = 0; i < 3; i++) {
    const ok = await page.evaluate(() => { const q = (window as any).__sca.S.run.quiz; const it = q.items[q.i]; return it.q.o[it.q.ok] as string; });
    await page.locator(".opts .opt", { hasText: ok }).first().tap();
    await page.getByRole("button", { name: /Prossima domanda|Vedi il risultato/ }).tap();
  }
  await expect(page.locator(".star.on")).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("asse col dito e ricetta toccando i numeri", async ({ page }) => {
  const errors = await openOttica(page);
  await page.evaluate(() => { const A = (window as any).__sca.ACTS; A.free(); A.open("o4"); A.next(); A.cardNext(); A.cardNext(); A.next(); });
  await page.getByRole("button", { name: "È come non avere il cilindro" }).tap();
  // l'asse giusto cambia a ogni partita: si gira dal verso più corto
  const [start, axis]: number[] = await page.evaluate(() => { const F = (window as any).__sca; return [F.S.run.v, F.sol()[0]]; });
  const diff = (((axis - start) % 180) + 180) % 180;
  const up = diff <= 90, taps = (up ? diff : 180 - diff) / 5;
  expect(taps).toBeGreaterThan(0);
  for (let i = 0; i < taps; i++) await page.getByRole("button", { name: up ? /Gira di 5 gradi nell'altro senso/ : /Gira di 5 gradi in un senso/ }).tap();
  await expect(page.locator("#lensval")).toHaveText(`asse ${axis}°`);
  await page.getByRole("button", { name: "Questo è l'asse giusto" }).tap();
  await expect(page.locator("#verdict")).toContainText("Giusto");

  await page.evaluate(() => { const A = (window as any).__sca.ACTS; A.open("o5"); A.next(); A.cardNext(); A.next(); });
  for (const cell of ["OS SF", "OD CIL", "OD AX", "ADD"]) await page.getByRole("button", { name: new RegExp("^" + cell + ":") }).tap();
  await expect(page.getByText("Ricetta letta senza errori")).toBeVisible();
  await page.getByRole("button", { name: "Progressive" }).tap();
  await expect(page.getByText(/tutto nitido con lo stesso occhiale/)).toBeVisible();
  await page.getByRole("button", { name: "Computer, 60 cm" }).tap();
  await expect(page.locator(".chips")).toContainText("Computer: nitido");
  expect(errors).toEqual([]);
});
