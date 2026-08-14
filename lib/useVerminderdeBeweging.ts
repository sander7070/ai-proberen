"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Eén ingang voor de vraag "mag dit bewegen?". Componenten die zelf een
 * tijdlijn aansturen (video, teller, marquee) gebruiken dit om meteen de
 * eindstand te tonen in plaats van te animeren.
 */
export function useVerminderdeBeweging(): boolean {
  return useReducedMotion() ?? false;
}
