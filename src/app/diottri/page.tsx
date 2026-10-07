import type { Metadata, Viewport } from "next";
import Diottri from "@/components/Diottri";
import "@fontsource/jersey-10/latin-400.css";
import "@fontsource/jersey-10/latin-ext-400.css";
import "../diottri.css";

export const metadata: Metadata = {
  title: "Diottri",
  description: "Il mestiere dell'ottico, giocando: clienti al banco e Diottri da riconoscere. Prova dei due giri, grafica provvisoria.",
  applicationName: "Diottri",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f2a26",
};

export default function Page() {
  return <Diottri />;
}
