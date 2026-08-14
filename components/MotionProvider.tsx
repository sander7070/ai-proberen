"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { spring } from "@/lib/motion";

/**
 * reducedMotion="user" laat Framer Motion alle transform- en layoutanimaties
 * overslaan zodra het systeem daarom vraagt. Componenten renderen dan meteen
 * hun eindstand.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      {children}
    </MotionConfig>
  );
}
