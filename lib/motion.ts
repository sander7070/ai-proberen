import type { Transition, Variants } from "framer-motion";

/** De veer uit de designspec. Overal dezelfde. */
export const spring: Transition = { type: "spring", stiffness: 120, damping: 18 };

/** Standaard in-view instelling: één keer, ruim voor de vouw. */
export const inView = { once: true, amount: 0.25 } as const;

export const rijst: Variants = {
  rust: { opacity: 0, y: 24 },
  actief: { opacity: 1, y: 0, transition: spring },
};

export const vervaagt: Variants = {
  rust: { opacity: 0 },
  actief: { opacity: 1, transition: { duration: 0.5 } },
};

export const schaalt: Variants = {
  rust: { opacity: 0, scale: 0.96 },
  actief: { opacity: 1, scale: 1, transition: spring },
};

/** Ouder die kinderen na elkaar laat binnenkomen. */
export function trap(stagger = 0.07, delay = 0): Variants {
  return {
    rust: {},
    actief: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
}
