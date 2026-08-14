"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { contactLink } from "@/lib/config";
import { spring } from "@/lib/motion";
import { useVerminderdeBeweging } from "@/lib/useVerminderdeBeweging";

const COLLEGAS = {
  otto: { naam: "Otto", beeld: "/merk/otto.webp", rol: "brengt uw werk samen" },
  nora: { naam: "Nora", beeld: "/merk/nora.webp", rol: "houdt het overzicht" },
} as const;

type Wie = keyof typeof COLLEGAS;

/** Vijf vaste beurten. Het gesprek loopt altijd dezelfde weg. */
const BEURTEN = [
  {
    zegt: "Dag, ik ben {naam}, uw digitale collega bij upgrAIde. Mag ik u een paar korte vragen stellen?",
    keuzes: ["Ja, doe maar", "Wat gaat u vragen?"],
  },
  {
    zegt: "Kort en concreet. Waar gaat er bij u vandaag het meeste tijd naartoe?",
    keuzes: ["Mailverkeer en aanvragen", "Offertes en facturen", "Klanten opvolgen"],
  },
  {
    zegt: "Herkenbaar. En hoeveel verschillende systemen moet uw team daarvoor openen?",
    keuzes: ["Twee of drie", "Vier of meer"],
  },
  {
    zegt: "Daar zit het meestal. Niet in het werk zelf, maar in het overtypen ertussen. Elke overstap kost tijd en levert fouten op.",
    keuzes: ["Dat klopt", "Bij ons valt dat mee"],
  },
  {
    zegt: "Ik kan er een richtcijfer op plakken. De scan duurt twee minuten, of we nemen het samen door in een gesprek van een halfuur.",
    keuzes: [],
  },
] as const;

type Bericht = { van: "hen" | "u"; tekst: string; sleutel: string };

export default function Chat() {
  const verminderd = useVerminderdeBeweging();
  const [wie, setWie] = useState<Wie>("otto");
  const [beurt, setBeurt] = useState(0);
  const [typt, setTypt] = useState(false);
  const [gezegd, setGezegd] = useState<Bericht[]>([]);
  const LAATSTE = `hen-${BEURTEN.length - 1}`;

  // Pas na hydratatie kiezen, anders wijkt de server af van de browser.
  useEffect(() => {
    setWie(Math.random() < 0.5 ? "otto" : "nora");
  }, []);

  const collega = COLLEGAS[wie];
  const huidige = BEURTEN[beurt];

  // Elke beurt: even een tikindicator, dan de boodschap.
  useEffect(() => {
    if (!huidige) return;
    const tekst = huidige.zegt.replace("{naam}", collega.naam);
    const sleutel = `hen-${beurt}`;
    if (gezegd.some((b) => b.sleutel === sleutel)) return;

    if (verminderd) {
      setGezegd((lijst) => [...lijst, { van: "hen", tekst, sleutel }]);
      return;
    }

    setTypt(true);
    const id = window.setTimeout(() => {
      setTypt(false);
      setGezegd((lijst) => [...lijst, { van: "hen", tekst, sleutel }]);
    }, 700);
    return () => window.clearTimeout(id);
  }, [beurt, huidige, collega.naam, verminderd, gezegd]);

  function antwoord(keuze: string) {
    setGezegd((lijst) => [...lijst, { van: "u", tekst: keuze, sleutel: `u-${beurt}` }]);
    setBeurt((b) => b + 1);
  }

  const klaar = !typt && gezegd.some((b) => b.sleutel === LAATSTE);
  const keuzes = !typt && huidige ? huidige.keuzes : [];

  return (
    <GlassCard stil className="p-5 md:p-7">
      <div className="flex items-center gap-3 border-b border-ink/8 pb-4">
        <Image
          src={collega.beeld}
          alt=""
          width={256}
          height={256}
          className="h-11 w-11 rounded-full object-cover"
        />
        <div>
          <p className="text-[0.95rem] font-semibold leading-tight">{collega.naam}</p>
          <p className="text-[0.8rem] text-ink/65">{collega.rol}</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[0.75rem] text-ink/65">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-grad-1" />
          Beschikbaar
        </span>
      </div>

      <div
        aria-live="polite"
        aria-label={`Gesprek met ${collega.naam}`}
        className="mt-4 space-y-2.5"
      >
        <AnimatePresence initial={false}>
          {gezegd.map((b) => (
            <motion.p
              key={b.sleutel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className={
                b.van === "hen"
                  ? "max-w-[85%] rounded-2xl rounded-tl-md bg-glass/85 px-4 py-3 text-[0.92rem] leading-relaxed shadow-soft"
                  : "ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-ink px-4 py-3 text-[0.92rem] leading-relaxed text-paper"
              }
            >
              {b.tekst}
            </motion.p>
          ))}
        </AnimatePresence>

        {typt ? (
          <p className="flex w-fit gap-1 rounded-2xl rounded-tl-md bg-glass/85 px-4 py-3.5 shadow-soft">
            <span className="sr-only">{collega.naam} typt</span>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-ink/35"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </p>
        ) : null}
      </div>

      {keuzes.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {keuzes.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => antwoord(k)}
              className="rounded-pill border border-ink/12 bg-glass/60 px-4 py-2.5 text-[0.88rem] font-medium transition-colors hover:border-ink/25"
            >
              {k}
            </button>
          ))}
        </div>
      ) : null}

      {klaar ? (
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href="/automatisatiescan"
            className="rounded-pill bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Doe de scan
          </Link>
          <a
            href={contactLink()}
            className="rounded-pill border border-ink/15 px-6 py-3 text-sm font-medium transition-colors hover:border-ink/30"
          >
            Plan een gesprek
          </a>
        </div>
      ) : null}
    </GlassCard>
  );
}
