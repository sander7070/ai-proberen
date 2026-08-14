"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import GlassCard from "@/components/GlassCard";
import { contactLink, publicConfig } from "@/lib/config";
import { spring } from "@/lib/motion";
import {
  BASIS,
  DISCLAIMER,
  FOUTEN,
  GROOTTE,
  TIJD,
  berekenScan,
  getal,
  legeAntwoorden,
  type DomeinSleutel,
  type FoutSleutel,
  type GrootteSleutel,
  type ScanAntwoorden,
  type TijdSleutel,
} from "@/lib/scan";
import type { ScanContact } from "@/lib/scanAanvraag";
import { VRAGEN, type Vraag } from "@/lib/vragen";

type Fase = "vragen" | "resultaat" | "gegevens" | "klaar";

const LEEG_CONTACT: ScanContact = { naam: "", bedrijf: "", email: "", telefoon: "" };

/** Afdelingen en systemen zijn nuttig maar niet nodig om te kunnen rekenen. */
const VERPLICHT: Record<Vraag["id"], boolean> = {
  grootte: true,
  domeinen: true,
  afdelingen: false,
  systemen: false,
  fout: true,
  tijd: true,
};

function isGekozen(vraag: Vraag, a: ScanAntwoorden, waarde: string): boolean {
  switch (vraag.id) {
    case "grootte":
      return a.grootte === waarde;
    case "fout":
      return a.fout === waarde;
    case "tijd":
      return a.tijd === waarde;
    case "domeinen":
      return (a.domeinen as string[]).includes(waarde);
    case "afdelingen":
      return a.afdelingen.includes(waarde);
    case "systemen":
      return a.systemen.includes(waarde);
  }
}

function beantwoord(vraag: Vraag, a: ScanAntwoorden): boolean {
  switch (vraag.id) {
    case "grootte":
      return a.grootte !== null;
    case "fout":
      return a.fout !== null;
    case "tijd":
      return a.tijd !== null;
    case "domeinen":
      return a.domeinen.length > 0;
    case "afdelingen":
      return a.afdelingen.length > 0;
    case "systemen":
      return a.systemen.length > 0;
  }
}

function wissel<T extends string>(lijst: T[], waarde: T): T[] {
  return lijst.includes(waarde) ? lijst.filter((x) => x !== waarde) : [...lijst, waarde];
}

function pasToe(vraag: Vraag, a: ScanAntwoorden, waarde: string): ScanAntwoorden {
  switch (vraag.id) {
    case "grootte":
      return waarde in GROOTTE ? { ...a, grootte: waarde as GrootteSleutel } : a;
    case "fout":
      return waarde in FOUTEN ? { ...a, fout: waarde as FoutSleutel } : a;
    case "tijd":
      return waarde in TIJD ? { ...a, tijd: waarde as TijdSleutel } : a;
    case "domeinen":
      return waarde in BASIS
        ? { ...a, domeinen: wissel(a.domeinen, waarde as DomeinSleutel) }
        : a;
    case "afdelingen":
      return { ...a, afdelingen: wissel(a.afdelingen, waarde) };
    case "systemen":
      return { ...a, systemen: wissel(a.systemen, waarde) };
  }
}

export default function Scan() {
  const [fase, setFase] = useState<Fase>("vragen");
  const [index, setIndex] = useState(0);
  const [antwoorden, setAntwoorden] = useState<ScanAntwoorden>(legeAntwoorden);
  const [contact, setContact] = useState<ScanContact>(LEEG_CONTACT);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const kopRef = useRef<HTMLHeadingElement>(null);
  const vraag = VRAGEN[index];
  const resultaat = berekenScan(antwoorden);

  // Bij elke wissel gaat de focus naar de nieuwe kop, zodat wie met het
  // toetsenbord of een schermlezer werkt niet kwijtraakt waar hij staat.
  useEffect(() => {
    kopRef.current?.focus();
  }, [index, fase]);

  async function verstuur(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBezig(true);
    setFout(null);
    try {
      const antwoord = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ antwoorden, contact }),
      });
      if (!antwoord.ok) throw new Error("mislukt");
      setFase("klaar");
    } catch {
      setFout(
        `Het versturen lukte niet. Probeer het opnieuw of mail ons rechtstreeks op ${publicConfig.contactMail}.`,
      );
    } finally {
      setBezig(false);
    }
  }

  return (
    <GlassCard stil className="p-6 md:p-10">
      <AnimatePresence mode="wait">
        {/* ---------------------------------------------------------- vragen */}
        {fase === "vragen" && vraag ? (
          <motion.div
            key={`vraag-${vraag.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={spring}
          >
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
              <span>
                Vraag {index + 1} van {VRAGEN.length}
              </span>
              {!VERPLICHT[vraag.id] ? <span>Overslaan mag</span> : null}
            </div>

            <div
              className="mt-3 h-1 w-full overflow-hidden rounded-pill bg-ink/10"
              role="progressbar"
              aria-valuenow={index + 1}
              aria-valuemin={1}
              aria-valuemax={VRAGEN.length}
              aria-label="Voortgang van de scan"
            >
              <motion.div
                className="h-full bg-merk"
                initial={false}
                animate={{ width: `${((index + 1) / VRAGEN.length) * 100}%` }}
                transition={spring}
              />
            </div>

            <fieldset className="mt-8">
              <legend className="contents">
                <h2
                  ref={kopRef}
                  tabIndex={-1}
                  className="text-2xl font-semibold tracking-[-0.03em] outline-none md:text-3xl"
                >
                  {vraag.titel}
                </h2>
              </legend>
              <p className="mt-2.5 text-[0.95rem] text-ink/65">{vraag.hulp}</p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {vraag.keuzes.map((keuze) => {
                  const gekozen = isGekozen(vraag, antwoorden, keuze.waarde);
                  return (
                    <label key={keuze.waarde} className="cursor-pointer">
                      <input
                        type={vraag.type === "enkel" ? "radio" : "checkbox"}
                        name={vraag.id}
                        value={keuze.waarde}
                        checked={gekozen}
                        onChange={() =>
                          setAntwoorden((a) => pasToe(vraag, a, keuze.waarde))
                        }
                        className="peer sr-only"
                      />
                      <span
                        className={`flex h-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-[0.95rem] transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-grad-1 ${
                          gekozen
                            ? "border-grad-1/40 bg-glass/90 font-medium shadow-soft"
                            : "border-ink/10 bg-glass/50 hover:border-ink/20"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`grid h-5 w-5 shrink-0 place-items-center border transition-colors ${
                            vraag.type === "enkel" ? "rounded-full" : "rounded-md"
                          } ${gekozen ? "border-transparent bg-merk" : "border-ink/25"}`}
                        >
                          {gekozen ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-paper" />
                          ) : null}
                        </span>
                        {keuze.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8 flex items-center gap-3">
              {index > 0 ? (
                <button
                  type="button"
                  onClick={() => setIndex((i) => i - 1)}
                  className="rounded-pill px-4 py-3 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
                >
                  Terug
                </button>
              ) : null}

              <button
                type="button"
                disabled={VERPLICHT[vraag.id] && !beantwoord(vraag, antwoorden)}
                onClick={() =>
                  index + 1 < VRAGEN.length ? setIndex((i) => i + 1) : setFase("resultaat")
                }
                className="ml-auto rounded-pill bg-ink px-7 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {index + 1 < VRAGEN.length ? "Volgende" : "Toon mijn resultaat"}
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* ------------------------------------------------------- resultaat */}
        {fase === "resultaat" && resultaat ? (
          <motion.div
            key="resultaat"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={spring}
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
              Uw resultaat
            </p>
            <h2
              ref={kopRef}
              tabIndex={-1}
              className="mt-3 text-title font-semibold outline-none"
            >
              We zien{" "}
              <span className="tekst-merk">{getal(resultaat.aantalKansen)} kansen</span> in uw
              organisatie
            </h2>

            <p className="mt-5 text-lede text-ink/70">
              Samen goed voor naar schatting{" "}
              <strong className="font-semibold text-ink">
                {getal(resultaat.low)} tot {getal(resultaat.high)} uur per maand
              </strong>{" "}
              die vandaag naar terugkerend werk gaat.
            </p>

            <p className="mt-4 rounded-2xl border border-ink/10 bg-glass/50 p-4 text-[0.9rem] leading-relaxed text-ink/60">
              {DISCLAIMER}
            </p>

            <h3 className="mt-9 text-xs font-medium uppercase tracking-[0.18em] text-ink/65">
              Waar de winst zit
            </h3>
            <ul className="mt-4 space-y-2.5">
              {resultaat.top.map((d) => (
                <li
                  key={d.domein}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl border border-ink/10 bg-glass/50 px-4 py-3.5"
                >
                  <span className="text-[0.95rem] font-medium">{d.label}</span>
                  <span className="tabular-nums text-[0.9rem] text-ink/60">
                    {getal(d.low)}–{getal(d.high)} uur per maand
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setFase("gegevens")}
                className="rounded-pill bg-ink px-7 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                Stuur mij dit overzicht
              </button>
              <button
                type="button"
                onClick={() => {
                  setFase("vragen");
                  setIndex(0);
                }}
                className="rounded-pill px-4 py-3 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
              >
                Antwoorden aanpassen
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* -------------------------------------------------------- gegevens */}
        {fase === "gegevens" ? (
          <motion.div
            key="gegevens"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={spring}
          >
            <h2
              ref={kopRef}
              tabIndex={-1}
              className="text-title font-semibold outline-none"
            >
              Waar mogen we het naartoe sturen?
            </h2>
            <p className="mt-4 text-lede text-ink/70">
              We bezorgen u het overzicht en bellen u enkel als u dat wil.
            </p>

            <form onSubmit={verstuur} className="mt-8 grid gap-4 sm:grid-cols-2" noValidate={false}>
              {(
                [
                  { veld: "naam", label: "Naam", type: "text", auto: "name" },
                  { veld: "bedrijf", label: "Bedrijf", type: "text", auto: "organization" },
                  { veld: "email", label: "Zakelijke e-mail", type: "email", auto: "email" },
                  { veld: "telefoon", label: "Telefoon", type: "tel", auto: "tel" },
                ] as const
              ).map((f) => (
                <div key={f.veld}>
                  <label
                    htmlFor={`scan-${f.veld}`}
                    className="block text-[0.82rem] font-medium text-ink/70"
                  >
                    {f.label}
                  </label>
                  <input
                    id={`scan-${f.veld}`}
                    name={f.veld}
                    type={f.type}
                    autoComplete={f.auto}
                    required
                    value={contact[f.veld]}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, [f.veld]: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-2xl border border-ink/12 bg-glass/70 px-4 py-3 text-[0.95rem] outline-none transition-colors placeholder:text-ink/60 focus-visible:border-grad-1/50"
                  />
                </div>
              ))}

              {fout ? (
                <p role="alert" className="sm:col-span-2 text-[0.9rem] text-ink/80">
                  {fout}
                </p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={bezig}
                  className="rounded-pill bg-ink px-7 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {bezig ? "Bezig met versturen…" : "Stuur mij het overzicht"}
                </button>
                <button
                  type="button"
                  onClick={() => setFase("resultaat")}
                  className="rounded-pill px-4 py-3 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
                >
                  Terug naar het resultaat
                </button>
              </div>
            </form>
          </motion.div>
        ) : null}

        {/* ----------------------------------------------------------- klaar */}
        {fase === "klaar" ? (
          <motion.div
            key="klaar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
          >
            <h2
              ref={kopRef}
              tabIndex={-1}
              className="text-title font-semibold outline-none"
            >
              Dank u, <span className="tekst-merk">het is onderweg</span>
            </h2>
            <p className="mt-5 text-lede text-ink/70">
              U krijgt het overzicht in uw mailbox. Wil u er meteen over praten, dan plannen we
              een gesprek van een halfuur waarin we uw cijfer samen nakijken.
            </p>
            <p className="mt-4 text-[0.9rem] leading-relaxed text-ink/65">{DISCLAIMER}</p>

            <div className="mt-8">
              <a
                href={contactLink()}
                className="inline-block rounded-pill bg-ink px-7 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                Plan een gesprek
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GlassCard>
  );
}
