/* Il caso da cui è nato lo standard: il lampadario si collega col dito e passa il collaudo. */
import { expect, test } from "@playwright/test";
import { center, openGame, touchDrag } from "./helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */
test("lampadario col dito", async ({ page, context }) => {
  const errors = await openGame(page);
  const cdp = await context.newCDPSession(page);
  await page.evaluate(() => {
    const A = (window as any).__fnt.ACTS;
    A.free();
    A.open("i3");
    A.next();
    for (let i = 0; i < 4; i++) A.cardNext();
    A.next();
    A.brk("luci");
    A.tag();
    A.tprova();
    for (let i = 0; i < 5; i++) A.probe(String(i));
    A.work();
  });
  await page.locator(".board").scrollIntoViewIfNeeded();
  for (const [cap, term] of [
    ["cN", "LP.L"],
    ["cB", "LP.N"],
    ["cG", "LP.PE"],
    ["cM", "W.s1"],
  ]) {
    await touchDrag(page, cdp, await center(page, `[data-tip="${cap}"] .cu-end`), await center(page, `[data-t="${term}"] .t`));
  }
  const out = await page.evaluate(() => {
    const A = (window as any).__fnt.ACTS;
    A.next();
    [0, 1].forEach(i => A.chk(String(i)));
    A.next();
    A.bet("ok");
    A.power();
    return (window as any).__fnt.S.run.col.outcome;
  });
  expect(out).toBe("ok");
  expect(errors).toEqual([]);
});
