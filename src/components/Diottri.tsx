"use client";

import { useEffect, useRef } from "react";
import { mountDiottri } from "@/diottri/ui";

/** Monta il gioco Diottri nel browser: disegna da solo le sue schermate dentro #app. */
export default function Diottri() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mountDiottri(ref.current, { home: "/" });
  }, []);
  return (
    <>
      <div id="app" className="dio" ref={ref}>
        <noscript>
          <p style={{ padding: 16 }}>Per giocare serve JavaScript.</p>
        </noscript>
      </div>
      <div id="toast" role="status" aria-live="polite" hidden />
    </>
  );
}
