/* Il dito vero: trascinare, agganciare, toccare due punti, spostare un capo, cambiare colore, scorrere. */
import { expect, test } from "@playwright/test";
import { center, openGame, touchDrag } from "./helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */
test("fili col dito, sul telefono", async ({ page, context }) => {
  const errors = await openGame(page);
  const cdp = await context.newCDPSession(page);
  const wires = () => page.evaluate(() => (window as any).__fnt.S.run.wires.map((w: any) => `${w.a}>${w.b}:${w.color}:${w.sec}`) as string[]);
  const status = () => page.evaluate(() => (document.querySelector("#sheet .status") || {}).textContent || "");

  await test.step("intervento 1: trascinando col dito", async () => {
    await page.evaluate(() => {
      const A = (window as any).__fnt.ACTS;
      A.open("i1");
      A.next();
      A.cardNext();
      A.cardNext();
      A.next();
      A.plug();
      A.work();
    });
    await page.locator('[data-tip="cM"]').scrollIntoViewIfNeeded();
    const y0 = await page.evaluate(() => window.scrollY);
    const a = await center(page, '[data-tip="cM"] .cu-end'),
      b = await center(page, '[data-t="LP.L"] .t');
    await touchDrag(page, cdp, a, { x: b.x + 9, y: b.y - 7 }); // rilascio un po' fuori: deve agganciarsi
    const w = await wires();
    expect(w.length).toBe(1);
    expect(w[0]).toMatch(/^cM\.x>LP\.L/);
    expect(await page.evaluate(() => window.scrollY)).toBe(y0);
    expect(await status()).toMatch(/Collegato/);
  });

  await test.step("blu col mouse, poi staccato e ricollegato toccando due punti", async () => {
    const a = await center(page, '[data-tip="cB"] .cu-end'),
      b = await center(page, '[data-t="LP.N"] .t');
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(a.x + ((b.x - a.x) * i) / 8, a.y + ((b.y - a.y) * i) / 8);
    await page.mouse.up();
    await page.waitForTimeout(100);
    expect((await wires())[1]).toMatch(/^cB\.x>LP\.N/);
    const bw = await page.locator('[data-w="1"] .k').boundingBox();
    await page.waitForTimeout(500);
    await page.touchscreen.tap(bw!.x + bw!.width * 0.5, bw!.y + bw!.height * 0.5);
    await page.waitForTimeout(100);
    await expect(page.locator('[data-act="wdel"]')).toHaveCount(1);
    await page.locator('[data-act="wdel"]').tap();
    expect((await wires()).length).toBe(1);
    await page.locator('[data-tip="cB"]').tap();
    await page.waitForTimeout(60);
    expect(await page.locator(".term.cand").count()).toBeGreaterThan(0);
    await page.locator('[data-t="LP.N"]').tap();
    await page.waitForTimeout(60);
    expect((await wires()).length).toBe(2);
  });

  await test.step("intervento 4: fuori portata, filo nuovo, colore, capo spostato", async () => {
    await page.evaluate(() => {
      const A = (window as any).__fnt.ACTS;
      A.free();
      A.open("i4");
      A.next();
      A.cardNext();
      A.cardNext();
      A.next();
      A.brk("luci");
      A.tag();
      A.tprova();
      A.probe("0");
      A.probe("1");
      A.probe("2");
      A.work();
    });
    await page.locator(".board").scrollIntoViewIfNeeded();
    let a = await center(page, '[data-tip="cM"] .cu-end'),
      b = await center(page, '[data-t="I.1"] .t');
    await touchDrag(page, cdp, a, b);
    expect((await wires()).length).toBe(0);
    expect(await status()).toMatch(/non ci arriva/);
    a = await center(page, '[data-tip="cM"] .cu-end');
    b = await center(page, '[data-t="W1.s1"] .t');
    await touchDrag(page, cdp, a, b);
    a = await center(page, '[data-t="W1.s2"] .t');
    b = await center(page, '[data-t="I.1"] .t');
    await touchDrag(page, cdp, a, { x: b.x - 6, y: b.y + 8 });
    let w = await wires();
    expect(w[1]).toBe("W1.s2>I.1:marrone:1.5");
    expect(await status()).toMatch(/toccalo/);
    await page.waitForTimeout(500);
    const nw = await page.evaluate(() => {
      const p = document.querySelector('[data-w="1"] .k') as SVGPathElement,
        L = p.getTotalLength(),
        q = p.getPointAtLength(L * 0.72),
        m = p.getScreenCTM()!;
      return { x: m.a * q.x + m.c * q.y + m.e, y: m.b * q.x + m.d * q.y + m.f };
    });
    await page.touchscreen.tap(nw.x, nw.y);
    await page.waitForTimeout(500);
    await expect(page.locator('.swc[data-act="wcolor"]')).toHaveCount(5);
    await page.locator('.swc[data-act="wcolor"][data-arg="nero"]').tap();
    expect((await wires())[1]).toBe("W1.s2>I.1:nero:1.5");
    await page.waitForTimeout(450);
    await expect(page.locator(".grip .gd")).toHaveCount(2);
    a = await center(page, '[data-grip="1:b"] .gd');
    b = await center(page, '[data-t="I.2"] .t');
    await touchDrag(page, cdp, a, b);
    w = await wires();
    expect(w[1]).toBe("W1.s2>I.2:nero:1.5");
  });

  await test.step("scorrere sulla tavola vuota muove la pagina, non i fili", async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    const nW = (await wires()).length;
    const bx = (await page.locator(".board").boundingBox())!;
    const s0 = await page.evaluate(() => window.scrollY);
    await touchDrag(page, cdp, { x: bx.x + bx.width - 12, y: bx.y + bx.height * 0.62 }, { x: bx.x + bx.width - 12, y: bx.y + bx.height * 0.62 - 220 }, 12);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(s0);
    expect((await wires()).length).toBe(nW);
  });

  await test.step("collaudo dopo i fili fatti a mano", async () => {
    const res = await page.evaluate(() => {
      const A = (window as any).__fnt.ACTS,
        r = (window as any).__fnt.S.run;
      r.wires = [];
      r.selWire = null;
      [
        ["cM", "W1.s1"],
        ["cB", "W2.s1"],
        ["cG", "W3.s1"],
      ].forEach(([x, y]) => {
        A.tapC(x);
        A.tapT(y);
      });
      A.color("marrone");
      A.tapT("W1.s2");
      A.tapT("I.1");
      A.color("nero");
      A.tapT("I.2");
      A.tapT("LP.L");
      A.color("blu");
      A.tapT("W2.s2");
      A.tapT("LP.N");
      A.color("gv");
      A.tapT("W3.s2");
      A.tapT("LP.PE");
      A.wdone();
      A.next();
      [0, 1].forEach(i => A.chk(String(i)));
      A.next();
      A.bet("ok");
      A.power();
      return (window as any).__fnt.S.run.col.outcome;
    });
    expect(res).toBe("ok");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  });

  expect(errors).toEqual([]);
});
