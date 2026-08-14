"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { spring } from "@/lib/motion";
import { getal } from "@/lib/scan";
import { useVerminderdeBeweging } from "@/lib/useVerminderdeBeweging";

const STAPPEN = ["Lezen", "Herkennen", "Beslissen", "Uitvoeren"] as const;

const WERK = [
  "Offerteaanvraag via het formulier",
  "Factuur 2026-1024",
  "Nieuwe lead uit de webshop",
  "Vraag over een levertermijn",
  "Bestelbon van een klant",
  "Aanvraag tot terugbetaling",
  "Wijziging van klantgegevens",
  "Weekrapport verkoop",
] as const;

const TIK = 1500;
const EERSTE_WERK = WERK[0];

type Taak = { id: number; titel: string };
type Sleuven = [Taak | null, Taak | null, Taak | null, Taak | null];

type Bord = {
  inkomend: Taak[];
  sleuven: Sleuven;
  afgewerkt: Taak[];
  aantal: number;
  volgendeId: number;
};

const START: Bord = {
  inkomend: [],
  sleuven: [null, null, null, null],
  afgewerkt: [],
  aantal: 0,
  volgendeId: 0,
};

const KAART = "glass-strong rounded-2xl px-3.5 py-2.5 text-[0.82rem] font-medium leading-snug";

const BEWEGING = {
  layout: true,
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
  transition: spring,
} as const;

/** Eén zuivere overgang per tik. Geen geneste setState, dus veilig onder StrictMode. */
function volgendeStand(bord: Bord): Bord {
  let { inkomend, afgewerkt, aantal, volgendeId } = bord;
  const { sleuven } = bord;

  if (inkomend.length < 3) {
    inkomend = [...inkomend, { id: volgendeId, titel: WERK[volgendeId % WERK.length] ?? EERSTE_WERK }];
    volgendeId += 1;
  }

  const klaar = sleuven[3];
  if (klaar) {
    afgewerkt = [klaar, ...afgewerkt].slice(0, 3);
    aantal += 1;
  }

  const nieuwe: Sleuven = [null, sleuven[0], sleuven[1], sleuven[2]];
  const eerste = inkomend[0];
  if (eerste) {
    nieuwe[0] = eerste;
    inkomend = inkomend.slice(1);
  }

  return { inkomend, sleuven: nieuwe, afgewerkt, aantal, volgendeId };
}

/** Vaste momentopname voor wie geen beweging wil zien. */
const STIL: Bord = {
  inkomend: [
    { id: -1, titel: WERK[3] ?? EERSTE_WERK },
    { id: -2, titel: WERK[4] ?? EERSTE_WERK },
  ],
  sleuven: [{ id: -3, titel: EERSTE_WERK }, null, { id: -4, titel: WERK[1] ?? EERSTE_WERK }, null],
  afgewerkt: [
    { id: -5, titel: WERK[2] ?? EERSTE_WERK },
    { id: -6, titel: WERK[5] ?? EERSTE_WERK },
  ],
  aantal: 12,
  volgendeId: 0,
};

export default function LiveBoard() {
  const verminderd = useVerminderdeBeweging();
  const houderRef = useRef<HTMLDivElement>(null);
  const inBeeld = useInView(houderRef, { amount: 0.3 });
  const [bord, setBord] = useState<Bord>(START);

  useEffect(() => {
    if (verminderd || !inBeeld) return;
    const id = window.setInterval(() => setBord(volgendeStand), TIK);
    return () => window.clearInterval(id);
  }, [verminderd, inBeeld]);

  const toon = verminderd ? STIL : bord;

  return (
    <div ref={houderRef}>
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        <section className="glass rounded-card p-5" aria-label="Binnenkomend werk">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink/45">
            Binnenkomend
          </h3>
          <ul className="mt-4 min-h-[10.5rem] space-y-2">
            <AnimatePresence initial={false} mode="popLayout">
              {toon.inkomend.map((t) => (
                <motion.li key={t.id} className={KAART} {...BEWEGING}>
                  {t.titel}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>

        <section className="glass rounded-card p-5" aria-label="Verwerking">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink/45">
            Verwerking
          </h3>
          <ol className="mt-4 space-y-2">
            {STAPPEN.map((stap, i) => {
              const bezet = toon.sleuven[i] ?? null;
              return (
                <li key={stap} className="flex items-center gap-3">
                  <span
                    className={`w-[5.4rem] shrink-0 text-[0.78rem] font-medium transition-colors duration-300 ${
                      bezet ? "text-ink" : "text-ink/35"
                    }`}
                  >
                    {stap}
                  </span>
                  <div
                    className={`h-[2.7rem] flex-1 overflow-hidden rounded-2xl ${
                      bezet ? "" : "border border-dashed border-ink/10"
                    }`}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {bezet ? (
                        <motion.div
                          key={bezet.id}
                          className={`${KAART} truncate ring-1 ring-grad-1/25`}
                          {...BEWEGING}
                        >
                          {bezet.titel}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="glass rounded-card p-5" aria-label="Afgewerkt">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink/45">
            Afgewerkt
          </h3>
          <ul className="mt-4 min-h-[10.5rem] space-y-2">
            <AnimatePresence initial={false} mode="popLayout">
              {toon.afgewerkt.map((t) => (
                <motion.li key={t.id} className={`${KAART} opacity-70`} {...BEWEGING}>
                  {t.titel}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </div>

      <p className="mt-4 text-center text-[0.9rem] text-ink/55">
        <span className="font-semibold tabular-nums text-ink">{getal(toon.aantal)}</span> taken
        afgehandeld sinds u deze pagina opende
      </p>
    </div>
  );
}
