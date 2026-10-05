"use client";

import { useEffect, useRef } from "react";
import { mountGame } from "@/game/ui";

/** Monta il gioco nel browser. Il gioco disegna da solo le sue schermate dentro #app. */
export default function Game() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mountGame(ref.current);
  }, []);
  return (
    <>
      <div id="app" ref={ref}>
        <noscript>
          <p style={{ padding: 16 }}>Per giocare serve JavaScript.</p>
        </noscript>
      </div>
      <div id="toast" role="status" aria-live="polite" hidden />
    </>
  );
}
