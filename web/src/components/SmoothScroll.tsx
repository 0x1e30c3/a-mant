"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import Snap from "lenis/snap";
import { useEffect, useRef } from "react";

// ─── Lenis smooth scroll + section snapping ───────────────────────────────────
//   `root` attaches Lenis to the document for eased, inertial scrolling.
//   Snap (proximity) gently aligns each `[data-snap]` section to the top as you
//   stop scrolling — so the page reads section-by-section without trapping you.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "30%",
      duration: 1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-snap]"));
    const removers = els.map((el) => snap.addElement(el, { align: ["start"] }));

    return () => {
      removers.forEach((remove) => remove());
      snap.destroy();
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}
