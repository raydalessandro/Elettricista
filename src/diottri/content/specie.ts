/* I Diottri della mandata 2: le lenti di prova, l'antiriflesso, il sole, una montatura.
   Ogni testo sta in un riquadro del gioco: tre righe da 24 caratteri. */
import type { ProvaId, Specie, SpecieId } from "../core/tipi";

export const SPECIE: Record<SpecieId, Specie> = {
  conca: {
    id: "conca", nome: "Conca", famiglia: "lente",
    uso: "Corregge la miopia: è la lente col meno.",
    forma: "Sottile al centro, spessa al bordo: rimpicciolisce.",
    limite: "Più è forte, più il bordo si vede.",
    prove: "La croce va con la lente.",
    lessico: [["lente negativa", "la lente col meno"], ["menisco", "lente a guscio: davanti bombata, dietro cava"]],
  },
  bombo: {
    id: "bombo", nome: "Bombo", famiglia: "lente",
    uso: "Lente col più: corregge l'ipermetropia, e da vicino la presbiopia.",
    forma: "Spessa al centro, sottile al bordo: ingrandisce.",
    limite: "Più è forte, più il centro è spesso.",
    prove: "La croce va contro la lente.",
    lessico: [["lente positiva", "la lente col più"]],
  },
  rullo: {
    id: "rullo", nome: "Rullo", famiglia: "lente",
    uso: "Corregge l'astigmatismo: forza in una direzione.",
    forma: "Come un pezzo di tubo: piatto lungo l'asse.",
    limite: "Serve l'asse giusto: fuori asse corregge male.",
    prove: "Girandolo, la croce si apre a forbice.",
    lessico: [["cilindro", "la correzione dell'astigmatismo"], ["asse", "la direzione senza forza"]],
  },
  verdino: {
    id: "verdino", nome: "Verdino", famiglia: "trattamento",
    uso: "Toglie i riflessi della lente: notte, schermi, foto.",
    forma: "Quasi invisibile: il riflesso resta debole e verdino.",
    limite: "Toglie i riflessi della lente, non dell'acqua.",
    prove: "Il riflesso di una luce è debole e colorato.",
    lessico: [["antiriflesso", "il trattamento contro i riflessi"]],
  },
  polare: {
    id: "polare", nome: "Polare", famiglia: "sole",
    uso: "Riduce il riflesso dell'acqua e della strada bagnata.",
    forma: "Dentro ha un filtro a righe: lascia passare solo la luce verticale.",
    limite: "Non è più scura delle altre; può scurire i display.",
    prove: "Due polarizzate incrociate a 90° diventano scure.",
    lessico: [["lente polarizzata", "la «polarizzata»"]],
  },
  bruno: {
    id: "bruno", nome: "Bruno", famiglia: "sole",
    uso: "Lente da sole: la categoria dice quanto scurisce.",
    forma: "Colore pieno, più scuro a ogni categoria.",
    limite: "La categoria 4 non va mai alla guida.",
    prove: "Il fotometro dice quanta luce passa.",
    lessico: [["categoria", "quanto è scura, da 0 a 4"]],
  },
  cello: {
    id: "cello", nome: "Cello", famiglia: "montatura",
    uso: "Montatura in acetato: colorata, si regola a caldo.",
    forma: "Lastra lucida, spesso avana o colorata.",
    limite: "Lasciata al sole in auto, si può deformare.",
    prove: "Sull'asta spesso c'è il materiale: «Acetate», «Titanium» o «Ti».",
    lessico: [["acetato", "per il cliente, «di plastica»"], ["52□18 140", "calibro, ponte, asta"]],
  },
};

/** Il vassoio all'inizio: Conca (la lente del tuo controllo) e Bruno (le lenti da sole del negozio). */
export const VASSOIO_INIZIO: SpecieId[] = ["conca", "bruno"];

/** La prima volta che si usa una prova, la Maestra la spiega: al massimo due riquadri. */
export const INTRO_PROVE: Record<ProvaId, string[]> = {
  neutralizza: ["Muovi la lente su una croce lontana: col meno va con, col più contro.", "La forza: piano è debole, svelta è media, corre è forte."],
  ruota: ["Gira la lente davanti alla croce.", "Se si apre a forbice, è un cilindro: forza in una sola direzione."],
  dilato: ["Guarda la lente di taglio.", "Col meno è spessa al bordo, col più al centro."],
  riflesso: ["Guarda il riflesso di una luce sulla lente.", "Bianco e forte: senza trattamento. Debole e colorato: antiriflesso."],
  polarizzate: ["Metti la polarizzata di prova davanti a questa, e girala.", "Se a 90° diventano scure, sono polarizzate tutte e due."],
  telefono: ["Guarda lo schermo del telefono nella lente, girandola.", "Con la polarizzata, a un certo angolo si scurisce."],
  luce: ["Il fotometro dice quanta luce passa: è la categoria.", "Cat. 2: dal 18 al 43%. Cat. 3: dall'8 al 18%. Cat. 4: dal 3 all'8%."],
  caldo: ["Lo scaldamontature ammorbidisce l'acetato.", "Prima si legge l'asta: non tutte le plastiche vogliono il caldo."],
  asta: ["Sull'asta spesso c'è il materiale: «Acetate», o «Ti» per il titanio.", "Poi le misure: 52□18 140 è calibro, ponte, asta."],
};
