"use client";

import { useCallback, useRef, useState } from "react";
import { useSpeeltInBeeld } from "@/lib/useSpeeltInBeeld";
import { useVerminderdeBeweging } from "@/lib/useVerminderdeBeweging";

type Props = {
  bron: string;
  poster: string;
  omschrijving: string;
  className?: string;
};

/** Korte, geluidloze clip. Laadt lui en speelt enkel in beeld. */
export default function Clip({ bron, poster, omschrijving, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const verminderd = useVerminderdeBeweging();
  const [kapot, setKapot] = useState(false);

  const meldFout = useCallback(() => setKapot(true), []);
  useSpeeltInBeeld(ref, { uit: verminderd || kapot, onFout: meldFout });

  return (
    <video
      ref={ref}
      className={`h-full w-full object-cover ${className}`}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      onError={meldFout}
      aria-label={omschrijving}
    >
      <source src={bron} type="video/mp4" />
    </video>
  );
}
