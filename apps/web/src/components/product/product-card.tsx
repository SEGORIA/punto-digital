"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { formatCOP } from "@/lib/utils";
import type { Product, ProductVariant } from "@punto-digital/db";

type ProductWithVariants = Product & { variants: ProductVariant[] };

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const lowestPrice = product.variants[0]?.priceOverride ?? product.basePrice;

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 25 });
  const rotateX = useTransform(springY, [0, 1], [6, -6]);
  const rotateY = useTransform(springX, [0, 1], [-6, 6]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function reset() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{ perspective: 600 }}
      className="h-full"
    >
      <motion.div style={{ rotateX, rotateY }} className="h-full">
        <Link
          href={`/producto/${product.slug}`}
          className="group flex h-full flex-col rounded-2xl border border-border p-3 transition-shadow hover:shadow-xl hover:shadow-black/5"
        >
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted-bg mb-3">
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )}
            {totalStock === 0 && (
              <span className="absolute top-2 left-2 rounded-full bg-danger px-2 py-1 text-[10px] font-semibold text-white">
                Agotado
              </span>
            )}
            {totalStock > 0 && totalStock <= 5 && (
              <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-1 text-[10px] font-semibold text-white">
                ¡Últimas unidades!
              </span>
            )}
          </div>
          {product.brand && (
            <span className="text-[11px] uppercase tracking-wide text-muted">{product.brand}</span>
          )}
          <h3 className="text-sm font-medium leading-snug line-clamp-2">{product.name}</h3>
          <p className="mt-1 text-base font-bold text-brand">{formatCOP(lowestPrice)}</p>
        </Link>
      </motion.div>
    </motion.div>
  );
}
