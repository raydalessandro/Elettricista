import type { Metadata } from "next";
import Game from "@/components/Game";

export const metadata: Metadata = {
  title: "Fase Neutro Terra",
  description: "Il gioco per imparare l'impianto elettrico di casa: teoria, quadro, fili, collaudo e ricerca guasti. Un capitolo alla settimana.",
  applicationName: "Fase Neutro Terra",
};

export default function Page() {
  return <Game />;
}
