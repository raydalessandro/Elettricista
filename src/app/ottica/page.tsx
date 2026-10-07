import type { Metadata } from "next";
import Ottica from "@/components/Ottica";
import "../ottica.css";

export const metadata: Metadata = {
  title: "Sfera Cilindro Asse",
  description: "Il mestiere dell'ottico, per chi sa già vendere: come vede l'occhio, cosa correggono le lenti, montature, misure e i casi al banco. Un capitolo alla settimana.",
  applicationName: "Sfera Cilindro Asse",
};

export default function Page() {
  return <Ottica />;
}
