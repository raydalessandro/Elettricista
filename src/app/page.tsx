import type { Metadata } from "next";
import CourseStars from "@/components/CourseStars";
import { CHAPTERS as CH_E, LEVELS as LV_E } from "@/content";
import { CHAPTERS as CH_O, LEVELS as LV_O } from "@/ottica/content";

export const metadata: Metadata = {
  title: "Fase Neutro Terra · Sfera Cilindro Asse",
  description: "Due corsi, un capitolo alla settimana: l'impianto elettrico di casa e il mestiere dell'ottico.",
};

/* La scelta del corso. I progressi di ogni corso restano dove sono: stesso sito, stesse chiavi. */
const COURSES = [
  {
    href: "/elettricista",
    name: "Fase Neutro Terra",
    what: "Impianto elettrico di casa",
    text: "Fili, quadro, collaudo e ricerca dei guasti, col tester in mano.",
    storageKey: "fase-neutro-terra.v1",
    total: LV_E.length * 3,
    ch: CH_E[CH_E.length - 1],
    art: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M6 22 C24 22 24 12 58 12" fill="none" stroke="var(--w-marrone)" strokeWidth="6" strokeLinecap="round" />
        <path d="M6 32 H58" fill="none" stroke="var(--w-blu)" strokeWidth="6" strokeLinecap="round" />
        <path d="M6 42 C24 42 24 52 58 52" fill="none" stroke="var(--w-gv-y)" strokeWidth="6" strokeLinecap="round" />
        <path d="M6 42 C24 42 24 52 58 52" fill="none" stroke="var(--w-gv-g)" strokeWidth="6" strokeLinecap="round" strokeDasharray="4 5" />
      </svg>
    ),
  },
  {
    href: "/ottica",
    name: "Sfera Cilindro Asse",
    what: "Il mestiere dell'ottico",
    text: "Occhio, lenti, montature, misure e laboratorio, con i casi veri al banco. Per chi sa già vendere.",
    storageKey: "sfera-cilindro-asse.v1",
    total: LV_O.length * 3,
    ch: CH_O[CH_O.length - 1],
    art: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M2 18 H22 L46 32" fill="none" stroke="#0b6b70" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 32 H46" fill="none" stroke="#b8730c" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M2 46 H22 L46 32" fill="none" stroke="#6a4fb0" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 8 Q30 32 22 56 Q14 32 22 8 Z" fill="rgba(120,170,200,.35)" stroke="#5d8fae" strokeWidth="2" />
        <circle cx="48" cy="32" r="4" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="shell home">
      <section className="hero">
        <p className="eyebrow">Due corsi · un capitolo alla settimana</p>
        <h1 className="h1">Scegli il corso</h1>
        <p className="lede">Prima quello che serve capire, poi le mani: sui fili, sulle lenti, con i clienti.</p>
      </section>
      <nav className="courses" aria-label="Corsi">
        {COURSES.map(c => (
          <a key={c.href} className="course" href={c.href}>
            <span className="course-art">{c.art}</span>
            <span className="course-t">
              <small className="eyebrow">{c.what}</small>
              <b>{c.name}</b>
              <span className="muted">{c.text}</span>
              <span className="course-s">
                <span className="stat">
                  Capitolo {c.ch.n} · {c.ch.title}
                </span>
                <CourseStars storageKey={c.storageKey} total={c.total} />
              </span>
            </span>
          </a>
        ))}
      </nav>
      <p className="fine">I progressi restano su questo dispositivo, corso per corso.</p>
    </main>
  );
}
