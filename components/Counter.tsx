"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import { getal } from "@/lib/scan";
import { useVerminderdeBeweging } from "@/lib/useVerminderdeBeweging";

type Props = {
  waarde: number;
  /** Bijvoorbeeld "u" of "%". Blijft staan tijdens het tellen. */
  achtervoegsel?: string;
  duur?: number;
  className?: string;
};

/** useLayoutEffect draait niet op de server; dit voorkomt de waarschuwing. */
const useIsomorfLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Telt bij het in beeld komen op vanaf nul, en dan niet meer.
 * De eindwaarde staat al in de HTML, zodat ze zichtbaar is zonder JavaScript
 * en bij verminderde beweging meteen blijft staan.
 */
export default function Counter({ waarde, achtervoegsel = "", duur = 1.4, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inBeeld = useInView(ref, { once: true, amount: 0.5 });
  const verminderd = useVerminderdeBeweging();
  const gestart = useRef(false);

  // Vóór de eerste paint op nul zetten, zodat er niets flikkert.
  useIsomorfLayoutEffect(() => {
    if (verminderd || gestart.current || !ref.current) return;
    ref.current.textContent = `${getal(0)}${achtervoegsel}`;
  }, [verminderd, achtervoegsel]);

  useEffect(() => {
    if (!inBeeld || verminderd || gestart.current) return;
    gestart.current = true;

    const knoop = ref.current;
    if (!knoop) return;

    const besturing = animate(0, waarde, {
      duration: duur,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        knoop.textContent = `${getal(Math.round(v))}${achtervoegsel}`;
      },
    });

    return () => besturing.stop();
  }, [inBeeld, verminderd, waarde, duur, achtervoegsel]);

  return (
    <span ref={ref} className={className}>
      {getal(waarde)}
      {achtervoegsel}
    </span>
  );
}
