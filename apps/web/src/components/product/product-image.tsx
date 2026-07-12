"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03 }}
      className="relative aspect-square rounded-2xl bg-muted-bg overflow-hidden"
    >
      <Image src={src} alt={alt} fill className="object-cover" priority />
    </motion.div>
  );
}
