"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/lib/use-media-query";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useInView } from "@/lib/use-in-view";

const HeroScene = dynamic(() => import("./hero-scene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => null,
});

export function HeroSceneLoader() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  if (reducedMotion) return null;

  return (
    <div ref={ref} className="hero-3d-canvas absolute inset-0" aria-hidden="true">
      <HeroScene lowFidelity={isMobile} paused={!inView} />
    </div>
  );
}
