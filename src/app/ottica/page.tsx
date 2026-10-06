import type { Metadata } from "next";
import Ottica from "@/components/Ottica";
import "../ottica.css";

export const metadata: Metadata = {
  title: "Sfera Cilindro Asse",
  description: "Il corso per stare al banco di un negozio di ottica: come vede l'occhio, cosa correggono le lenti, e i clienti. Un capitolo alla settimana.",
  applicationName: "Sfera Cilindro Asse",
};

export default function Page() {
  return <Ottica />;
}
