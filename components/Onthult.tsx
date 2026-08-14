"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { inView, rijst, trap } from "@/lib/motion";
import { useVerminderdeBeweging } from "@/lib/useVerminderdeBeweging";

type Props = {
  children: ReactNode;
  className?: string;
  /** Laat directe kinderen na elkaar binnenkomen. */
  gespreid?: boolean;
};

/**
 * Onthult inhoud bij het in beeld komen, en daarna niet meer.
 *
 * Wie geen beweging wil, krijgt meteen de eindstand: initial={false} slaat de
 * verborgen begintoestand over, zodat er niets te wachten valt op scrollen.
 */
export default function Onthult({ children, className, gespreid = false }: Props) {
  const verminderd = useVerminderdeBeweging();

  return (
    <motion.div
      variants={gespreid ? trap(0.08) : rijst}
      initial={verminderd ? false : "rust"}
      whileInView="actief"
      viewport={inView}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Eén element binnen een gespreide groep. */
export function OnthultItem({ children, className }: { children: ReactNode; className?: string }) {
  const verminderd = useVerminderdeBeweging();

  return (
    <motion.div variants={verminderd ? undefined : rijst} className={className}>
      {children}
    </motion.div>
  );
}
