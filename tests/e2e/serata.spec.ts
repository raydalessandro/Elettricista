/* Serata: le missioni si completano dalla situazione iniziale, il contatore resta in vista. */
import { expect, test } from "@playwright/test";
import { openGame } from "./helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */
test("serata col tempo vero", async ({ page }) => {
  const errors = await openGame(page);
  await page.evaluate(() => {
    const A = (window as any).__fnt.ACTS;
    A.free();
    A.open("i9");
    A.next();
    for (let i = 0; i < 3; i++) A.cardNext();
    A.next();
  });
  await page.locator('[data-act="serApp"][data-arg="phon"]').tap();
  await page.locator('[data-act="serApp"][data-arg="stufa"]').tap();
  const kw = await page.evaluate(() => {
    const k = document.querySelector(".kwbox")!.getBoundingClientRect();
    return { top: k.top, bottom: k.bottom, h: innerHeight };
  });
  expect(kw.top).toBeGreaterThanOrEqual(0);
  expect(kw.bottom).toBeLessThanOrEqual(kw.h);
  // il gioco controlla ogni 250 ms: si aspetta l'evento, non un tempo fisso
  await page.waitForFunction(() => (window as any).__fnt.S.run.ser.m[2], null, { timeout: 4000 });
  expect(await page.evaluate(() => (window as any).__fnt.S.run.ser.black)).toBe(false);
  await page.waitForFunction(() => (window as any).__fnt.S.run.ser.black, null, { timeout: 5000 });
  const st = await page.evaluate(() => ({
    m: (window as any).__fnt.S.run.ser.m.slice(),
    txt: document.querySelector(".mis li:nth-child(3) span:last-child")!.textContent,
  }));
  expect(st.m[0]).toBe(true);
  expect(st.txt).toMatch(/solo perché hai superato il contratto/);
  await page.evaluate(() => {
    const A = (window as any).__fnt.ACTS;
    A.serApp("phon");
    A.serApp("stufa");
    A.serReset();
    A.serK("4.5");
    A.serApp("forno");
    A.serApp("lavat");
  });
  await page.waitForFunction(() => (window as any).__fnt.S.run.ser.m[1], null, { timeout: 5000 });
  expect(await page.evaluate(() => (window as any).__fnt.S.run.ser.black)).toBe(false);
  expect(errors).toEqual([]);
});
