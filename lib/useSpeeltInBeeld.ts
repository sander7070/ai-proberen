"use client";

import { useEffect, type RefObject } from "react";

/**
 * Laat een video enkel spelen zolang ze in beeld staat. Daarbuiten pauzeert
 * ze, zodat er geen bandbreedte of rekenkracht weglekt aan wat niemand ziet.
 */
export function useSpeeltInBeeld(
  ref: RefObject<HTMLVideoElement | null>,
  { uit = false, onFout }: { uit?: boolean; onFout?: () => void } = {},
) {
  useEffect(() => {
    const video = ref.current;
    if (!video || uit) return;

    const waarnemer = new IntersectionObserver(
      ([item]) => {
        if (!item) return;
        if (item.isIntersecting) {
          void video.play().catch(() => onFout?.());
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    waarnemer.observe(video);
    return () => waarnemer.disconnect();
  }, [ref, uit, onFout]);
}
