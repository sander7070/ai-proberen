"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useVerminderdeBeweging } from "@/lib/useVerminderdeBeweging";

const MAX_HOEK = 4.5;
const VEER = { stiffness: 120, damping: 18 } as const;

type Props = {
  children: ReactNode;
  className?: string;
  /** Zet de kanteling uit maar houdt het glaseffect. */
  stil?: boolean;
};

/**
 * Glazen paneel dat licht meekantelt met de cursor en een spotlight meedraagt.
 * Beide effecten zijn puur decoratief en draaien alleen op een fijne
 * aanwijzer — op touch en bij verminderde beweging blijft de kaart stil.
 */
export default function GlassCard({ children, className = "", stil = false }: Props) {
  const verminderd = useVerminderdeBeweging();
  const [fijneAanwijzer, setFijneAanwijzer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const lees = () => setFijneAanwijzer(mq.matches);
    lees();
    mq.addEventListener("change", lees);
    return () => mq.removeEventListener("change", lees);
  }, []);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const kantelX = useMotionValue(0);
  const kantelY = useMotionValue(0);
  const glansDoel = useMotionValue(0);

  const rotateX = useSpring(kantelX, VEER);
  const rotateY = useSpring(kantelY, VEER);
  const glans = useSpring(glansDoel, VEER);

  const xPct = useTransform(px, (v) => `${(v * 100).toFixed(2)}%`);
  const yPct = useTransform(py, (v) => `${(v * 100).toFixed(2)}%`);
  const spotlight = useMotionTemplate`radial-gradient(32rem 32rem at ${xPct} ${yPct}, rgb(var(--grad-2-rgb) / 0.18), transparent 60%)`;

  const actief = fijneAanwijzer && !verminderd && !stil;

  function beweeg(event: ReactPointerEvent<HTMLDivElement>) {
    if (!actief) return;
    const vak = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - vak.left) / vak.width;
    const ny = (event.clientY - vak.top) / vak.height;
    px.set(nx);
    py.set(ny);
    kantelY.set((nx - 0.5) * 2 * MAX_HOEK);
    kantelX.set((0.5 - ny) * 2 * MAX_HOEK);
    glansDoel.set(1);
  }

  function verlaat() {
    px.set(0.5);
    py.set(0.5);
    kantelX.set(0);
    kantelY.set(0);
    glansDoel.set(0);
  }

  return (
    <motion.div
      onPointerMove={beweeg}
      onPointerLeave={verlaat}
      style={
        actief
          ? { rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }
          : undefined
      }
      className={`glass relative overflow-hidden rounded-card ${className}`}
    >
      {actief ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: spotlight, opacity: glans }}
        />
      ) : null}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
