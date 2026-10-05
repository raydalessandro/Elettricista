/* Colori dei conduttori: etichetta e variabile CSS. */
import type { WireColor, WireInfo } from "../core/types";

export const WIRES: Record<WireColor, WireInfo> = {
  marrone: { label: "marrone", v: "--w-marrone" },
  nero: { label: "nero", v: "--w-nero" },
  grigio: { label: "grigio", v: "--w-grigio" },
  blu: { label: "blu", v: "--w-blu" },
  gv: { label: "giallo-verde", v: "--w-gv-y", stripe: "--w-gv-g" },
};
