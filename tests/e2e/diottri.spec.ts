/* Diottri col dito, su un telefono 390×844: chi sei, il primo caso con la prova lenti, il primo Diottro,
   e la storia che resta quando si chiude e si riapre. */
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

test("dalla home dei corsi si arriva al gioco, e si torna", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("a.course")).toHaveCount(2);
  await page.getByRole("link", { name: /Diottri/ }).tap();
  await page.waitForFunction(() => !!(window as any).__dio);
  await expect(page.getByText("Chi sei?")).toBeVisible();
  await page.getByRole("button", { name: "Uomo" }).tap();
  await page.getByRole("link", { name: "Tutti i corsi" }).tap();
  await expect(page.getByRole("heading", { name: "Scegli il corso" })).toBeVisible();
});

test("primo caso e primo Diottro col dito; chiudi e riapri, la storia continua", async ({ page }) => {
  const errors = await openDiottri(page);
  await page.getByRole("button", { name: "Donna" }).tap();
  await expect(page.getByText("Benvenuta in bottega")).toBeVisible();
  await page.getByRole("button", { name: "Cominciamo" }).tap(); // apre il primo caso
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

  // consegna: tre stelle
  await page.getByRole("button", { name: "Consegna", exact: true }).tap();
  await expect(page.getByRole("heading", { name: "Ci vedo!" })).toBeVisible();
  await expect(page.locator(".overlay.fine .stella.on")).toHaveCount(3);
  await expect(page.getByText("Tre stelle: occhio, spiegazione e soluzione.")).toBeVisible();
  await page.getByRole("button", { name: "Torna al percorso" }).tap();

  // il primo Diottro: la croce va contro la lente
  await page.locator("[data-act=apri][data-arg=r1]").tap();
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

  // chiudi e riapri: il percorso è dove l'hai lasciato
  await page.reload();
  await page.waitForFunction(() => !!(window as any).__dio);
  await expect(page.locator("[data-act=apri][data-arg=c1] .stella.on")).toHaveCount(3);
  await expect(page.locator("[data-act=apri][data-arg=r1]")).toContainText("Bombo");
  await expect(page.locator("[data-act=apri][data-arg=c2]")).toBeEnabled();
  await expect(page.locator("[data-act=apri][data-arg=r2]")).toBeDisabled();
  expect(errors).toEqual([]);
});
