"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { inView, rijst, trap } from "@/lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Laat directe kinderen na elkaar binnenkomen. */
  gespreid?: boolean;
};

/** Onthult inhoud bij het in beeld komen, en daarna niet meer. */
export default function Onthult({ children, className, gespreid = false }: Props) {
  if (gespreid) {
    return (
      <motion.div
        variants={trap(0.08)}
        initial="rust"
        whileInView="actief"
        viewport={inView}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={rijst}
      initial="rust"
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
  return (
    <motion.div variants={rijst} className={className}>
      {children}
    </motion.div>
  );
}
