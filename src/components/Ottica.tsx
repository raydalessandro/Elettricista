"use client";

import { useEffect, useRef } from "react";
import { mountOttica } from "@/ottica/ui";

/** Monta il corso di ottica nel browser: disegna da solo le sue schermate dentro #app. */
export default function Ottica() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mountOttica(ref.current, { home: "/" });
  }, []);
  return (
    <>
      <div id="app" className="ott" ref={ref}>
        <noscript>
          <p style={{ padding: 16 }}>Per giocare serve JavaScript.</p>
        </noscript>
      </div>
      <div id="toast" role="status" aria-live="polite" hidden />
    </>
  );
}
