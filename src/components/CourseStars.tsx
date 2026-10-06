"use client";

import { useSyncExternalStore } from "react";

/** Le stelle di un corso, lette dai progressi salvati su questo dispositivo. */
function read(key: string): number | null {
  try {
    const s = JSON.parse(localStorage.getItem(key) || "null");
    if (!s || !s.done) return null;
    return Object.values(s.done as Record<string, { stars?: boolean[] }>).reduce((n, d) => n + (d.stars || []).filter(Boolean).length, 0);
  } catch {
    return null;
  }
}

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

export default function CourseStars({ storageKey, total }: { storageKey: string; total: number }) {
  const n = useSyncExternalStore(subscribe, () => read(storageKey), () => null);
  return <span className="stat">{n == null ? "da cominciare" : <><b>{n}</b>/{total} stelle</>}</span>;
}
