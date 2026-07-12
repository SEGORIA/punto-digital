"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroSceneLoader } from "./hero-scene-loader";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export function HeroSection() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const rotateX = useTransform(springY, [0, 1], [8, -8]);
  const rotateY = useTransform(springX, [0, 1], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function resetTilt() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <section className="relative overflow-hidden bg-brand-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-24 grid md:grid-cols-2 gap-8 items-center">
        <motion.div initial="hidden" animate="visible" variants={container} className="relative z-10">
          <motion.h1
            variants={item}
            className="text-3xl sm:text-5xl font-bold leading-tight text-foreground"
          >
            Tecnología que te acompaña <span className="text-brand">a donde vayas</span>
          </motion.h1>
          <motion.p variants={item} className="mt-4 text-muted text-lg">
            Audífonos, power banks, cargadores y más. Importador directo con envío a toda Colombia.
          </motion.p>
          <motion.div variants={item} className="mt-8 flex gap-3">
            <Link href="/tienda">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg">Explorar productos</Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 800 }}
          className="relative mx-auto aspect-square w-full max-w-[280px] md:max-w-none"
        >
          {/* Glow radial animado detrás del objeto 3D para reforzar el look premium */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-full bg-brand/30 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div style={{ rotateX, rotateY }} className="h-full w-full">
            <HeroSceneLoader />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
