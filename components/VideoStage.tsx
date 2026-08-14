"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Onthult, { OnthultItem } from "@/components/Onthult";
import { useSpeeltInBeeld } from "@/lib/useSpeeltInBeeld";
import { useVerminderdeBeweging } from "@/lib/useVerminderdeBeweging";

/** Momenten waarop een stap oplicht, in seconden. */
const STAPPEN = [
  { label: "Aanvraag komt binnen", start: 0, plaats: "md:left-[3%] md:top-[7%]" },
  { label: "CRM bijgewerkt", start: 2.6, plaats: "md:right-[3%] md:top-[24%]" },
  { label: "Antwoord voorbereid", start: 5.2, plaats: "md:left-[3%] md:bottom-[30%]" },
  { label: "Taak aangemaakt", start: 7.6, plaats: "md:right-[3%] md:bottom-[22%]" },
] as const;

const DUUR_ACTIEF = 2.2;
const CYCLUS = 10;

type Stand = "wacht" | "actief" | "klaar";

function standVan(tijd: number, start: number): Stand {
  if (tijd < start) return "wacht";
  return tijd < start + DUUR_ACTIEF ? "actief" : "klaar";
}

const STIJL: Record<Stand, string> = {
  // De opacity stapelt op de tekstkleur, dus die blijft hoog genoeg om
  // leesbaar te zijn. Het onderscheid komt van de ring en de schaduw.
  wacht: "opacity-80 text-ink/65",
  actief: "opacity-100 text-ink shadow-lift ring-2 ring-grad-1/35",
  klaar: "opacity-95 text-ink/75",
};

export default function VideoStage() {
  const verminderd = useVerminderdeBeweging();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tijd, setTijd] = useState(0);
  const [zonderVideo, setZonderVideo] = useState(false);

  // Bij verminderde beweging tonen we meteen de eindstand.
  const effectieveTijd = verminderd ? CYCLUS : tijd;

  const stap = STAPPEN.reduce(
    (hoogste, s, i) => (effectieveTijd >= s.start ? i + 1 : hoogste),
    1,
  );

  const meldFout = useCallback(() => setZonderVideo(true), []);
  useSpeeltInBeeld(videoRef, { uit: verminderd || zonderVideo, onFout: meldFout });

  /** Terugval wanneer het bestand ontbreekt of niet wil spelen. */
  useEffect(() => {
    if (!zonderVideo || verminderd) return;
    const begin = performance.now();
    const id = window.setInterval(() => {
      setTijd(((performance.now() - begin) / 1000) % CYCLUS);
    }, 200);
    return () => window.clearInterval(id);
  }, [zonderVideo, verminderd]);

  const volgTijd = useCallback(() => {
    const video = videoRef.current;
    if (video) setTijd(video.currentTime % CYCLUS);
  }, []);

  return (
    <Onthult gespreid className="relative">
      <OnthultItem className="glass-strong relative overflow-hidden rounded-card">
        <video
          ref={videoRef}
          className="aspect-[16/9] w-full object-cover"
          poster="/video/poster.jpg"
          preload="none"
          muted
          loop
          playsInline
          onTimeUpdate={volgTijd}
          onError={meldFout}
          aria-label="Otto en Nora verwerken een binnenkomende aanvraag"
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>

        {/* Labels zweven over het beeld op groot scherm. */}
        <ol className="pointer-events-none absolute inset-0 hidden md:block">
          {STAPPEN.map((s, i) => {
            const stand = verminderd ? "klaar" : standVan(effectieveTijd, s.start);
            return (
              <li
                key={s.label}
                className={`glass-strong absolute rounded-pill px-4 py-2.5 text-sm font-medium transition-all duration-500 ${s.plaats} ${STIJL[stand]}`}
                aria-current={stand === "actief" ? "step" : undefined}
              >
                <span className="mr-2 text-xs tabular-nums text-ink/65">0{i + 1}</span>
                {s.label}
              </li>
            );
          })}
        </ol>

        <div
          aria-hidden
          className="glass-strong absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-pill px-5 py-2 text-sm font-medium md:block"
        >
          Stap {stap} van {STAPPEN.length}
        </div>
      </OnthultItem>

      {/* Op klein scherm staan dezelfde stappen onder het beeld. */}
      <ol className="mt-3 grid grid-cols-2 gap-2 md:hidden">
        {STAPPEN.map((s, i) => {
          const stand = verminderd ? "klaar" : standVan(effectieveTijd, s.start);
          return (
            <li
              key={s.label}
              className={`glass rounded-2xl px-3 py-2.5 text-[0.8rem] font-medium leading-tight transition-all duration-500 ${STIJL[stand]}`}
              aria-current={stand === "actief" ? "step" : undefined}
            >
              <span className="mr-1.5 text-[0.7rem] tabular-nums text-ink/65">0{i + 1}</span>
              {s.label}
            </li>
          );
        })}
      </ol>
    </Onthult>
  );
}
