/* Banco guasti col dito: leva, comandi, puntali, diagnosi, riparazione fuori tensione. */
import { expect, test } from "@playwright/test";
import { openGame } from "./helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */
test("banco guasti col dito: il ritorno interrotto del ripostiglio", async ({ page }) => {
  const errors = await openGame(page);
  await page.evaluate(() => {
    const A = (window as any).__fnt.ACTS;
    A.open("g1");
    A.next();
    A.cardNext();
    A.next();
    A.setFault("1"); // ritorno interrotto
  });
  const lcd = page.locator("#sheet .lcd span");
  const tapTerm = async (id: string) => {
    const t = page.locator(`[data-act="probeT"][data-arg="${id}"]`);
    await t.scrollIntoViewIfNeeded();
    await t.tap();
  };

  await test.step("prima si prova il tester", async () => {
    await page.locator('[data-act="testerProva"]').tap();
    await expect(page.locator('[data-act="testerProva"]')).toHaveText("Tester provato");
  });

  await test.step("linea accesa e interruttore acceso, toccando", async () => {
    await page.locator('.bench-q [data-act="lineTog"]').tap();
    await page.locator('[data-act="toggleSw"][data-arg="I"]').tap();
    await expect(page.locator(".bench-q .status")).toHaveText(/Linea accesa\. Luce spenta\./);
  });

  await test.step("puntali sulla plafoniera: 0 V tra L e N", async () => {
    await tapTerm("LP.L");
    await tapTerm("LP.N");
    await expect(lcd).toHaveText("0");
  });

  await test.step("il nero si sposta sul morsetto 2 dell'interruttore: 230 V", async () => {
    await tapTerm("I.2");
    await expect(lcd).toHaveText("230");
    // nel registro: la prova del tester e le due misure
    expect(await page.evaluate(() => (window as any).__fnt.S.run.bench.log.length)).toBe(3);
  });

  await test.step("continuità a linea spenta tra i due capi del nero: aperto", async () => {
    await page.locator('[data-act="meterMode"][data-arg="ohm"]').tap();
    await expect(lcd).toHaveText("!"); // linea ancora accesa: la misura non vale
    // la linea si spegne anche dal pannello del tester, senza risalire alla leva
    await page.locator('#sheet [data-act="lineTog"]').tap();
    await expect(page.locator('#sheet [data-act="lineTog"]')).toHaveText("Linea spenta");
    await expect(lcd).toHaveText("OL");
  });

  await test.step("diagnosi, riparazione, collaudo", async () => {
    await page.locator('[data-act="diagOpen"]').tap();
    await page.locator('[data-act="diagPick"][data-arg="ritorno"]').tap();
    await expect(page.locator("#diagres")).toContainText("Il ritorno tra interruttore e plafoniera");
    await expect(page.locator("#diagres")).not.toContainText("non ancora dimostrato");
    await page.locator('[data-act="repair"]').tap();
    await page.locator('.bench-q [data-act="lineTog"]').tap();
    await expect(page.locator(".res.ok").last()).toContainText("Funziona");
    await expect(page.locator(".bench-q .status")).toHaveText(/Luce accesa/);
  });

  const st = await page.evaluate(() => {
    const A = (window as any).__fnt.ACTS;
    A.next();
    for (let i = 0; i < 3; i++) {
      const q = (window as any).__fnt.S.run.quiz;
      A.ans(String(q.items[q.i].q.ok));
      A.qnext();
    }
    return (window as any).__fnt.S.run.stars;
  });
  // continuità provata con la linea accesa: la stella della sicurezza non c'è
  expect(st).toEqual([false, true, true]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
