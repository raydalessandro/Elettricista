import type { CDPSession, Page } from "@playwright/test";

export type Pt = { x: number; y: number };

/** Centro di un elemento sullo schermo. */
export async function center(page: Page, sel: string): Promise<Pt> {
  const b = await page.locator(sel).first().boundingBox();
  if (!b) throw new Error("non trovato: " + sel);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

/** Trascina col dito vero (eventi touch del browser). */
export async function touchDrag(page: Page, cdp: CDPSession, from: Pt, to: Pt, steps = 10) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from.x, y: from.y }] });
  for (let i = 1; i <= steps; i++) {
    const x = from.x + ((to.x - from.x) * i) / steps,
      y = from.y + ((to.y - from.y) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(100);
}

/** Apre il gioco e aspetta che sia montato. */
export async function openGame(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => {
    if (m.type() === "error") errors.push("console: " + m.text());
  });
  await page.goto("/elettricista");
  await page.waitForFunction(() => !!(window as unknown as { __fnt?: unknown }).__fnt);
  return errors;
}
