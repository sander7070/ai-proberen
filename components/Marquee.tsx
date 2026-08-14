"use client";

import { motion, useAnimationFrame, useInView, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { useVerminderdeBeweging } from "@/lib/useVerminderdeBeweging";

/** Acht digitale collega's, elk met één duidelijke taak. */
const COLLEGAS = [
  { naam: "Otto", taak: "brengt binnenkomend werk samen" },
  { naam: "Nora", taak: "bereidt antwoorden voor" },
  { naam: "Lars", taak: "houdt uw CRM bij" },
  { naam: "Mila", taak: "volgt offertes op" },
  { naam: "Vic", taak: "controleert facturen" },
  { naam: "Juul", taak: "plant afspraken in" },
  { naam: "Sam", taak: "sorteert documenten" },
  { naam: "Ines", taak: "maakt uw rapport klaar" },
] as const;

const SNELHEID = 42; // pixels per seconde

/** De vervaging aan de randen moet de achtergrond eronder aannemen. */
const RAND = {
  paper: ["from-paper", "from-paper"],
  glass: ["from-glass", "from-glass"],
} as const;

export default function Marquee({ rand = "paper" }: { rand?: keyof typeof RAND }) {
  const verminderd = useVerminderdeBeweging();
  const houderRef = useRef<HTMLDivElement>(null);
  const groepRef = useRef<HTMLUListElement>(null);
  const inBeeld = useInView(houderRef, { amount: 0.1 });
  const [gepauzeerd, setGepauzeerd] = useState(false);
  const x = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    if (verminderd || gepauzeerd || !inBeeld) return;
    const groep = groepRef.current;
    if (!groep) return;

    const breedte = groep.scrollWidth;
    if (breedte === 0) return;

    let volgende = x.get() - (delta / 1000) * SNELHEID;
    if (volgende <= -breedte) volgende += breedte;
    x.set(volgende);
  });

  const rij = (verborgen: boolean) => (
    <ul
      ref={verborgen ? undefined : groepRef}
      aria-hidden={verborgen}
      className="flex shrink-0 items-center gap-3 pr-3"
    >
      {COLLEGAS.map((c) => (
        <li
          key={c.naam}
          className="glass flex shrink-0 items-center gap-2.5 rounded-pill py-2.5 pl-3 pr-5"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-merk text-[0.7rem] font-semibold text-paper">
            {c.naam.slice(0, 1)}
          </span>
          <span className="whitespace-nowrap text-sm">
            <span className="font-semibold">{c.naam}</span>
            <span className="text-ink/60"> {c.taak}</span>
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={houderRef}
      className="relative overflow-hidden"
      onPointerEnter={() => setGepauzeerd(true)}
      onPointerLeave={() => setGepauzeerd(false)}
      onFocusCapture={() => setGepauzeerd(true)}
      onBlurCapture={() => setGepauzeerd(false)}
    >
      {/* Geen w-max: de rij mag de breedte van haar ouder niet opdrijven.
          De kopieën lopen buiten beeld en worden hierboven afgesneden. */}
      <motion.div className="flex" style={verminderd ? undefined : { x }}>
        {rij(false)}
        {rij(true)}
      </motion.div>

      {/* Zachte randen zodat de rij niet hard afgesneden lijkt. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r to-transparent ${RAND[rand][0]}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l to-transparent ${RAND[rand][1]}`}
      />
    </div>
  );
}
