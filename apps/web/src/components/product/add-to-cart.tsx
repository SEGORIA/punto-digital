"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import type { Product, ProductVariant } from "@punto-digital/db";
import { cn, formatCOP } from "@/lib/utils";

type ProductWithVariants = Product & { variants: ProductVariant[] };

export function AddToCart({ product }: { product: ProductWithVariants }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  if (!variant) return <p className="text-sm text-muted">Producto no disponible.</p>;

  const price = variant.priceOverride ?? product.basePrice;
  const outOfStock = variant.stock <= 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantLabel: variant.label,
      slug: product.slug,
      image: product.images[0] ?? null,
      unitPrice: price,
      maxStock: variant.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="space-y-4">
      <motion.p
        key={price}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-brand"
      >
        {formatCOP(price)}
      </motion.p>

      {product.variants.length > 1 && (
        <div>
          <p className="text-sm font-medium mb-2">Variante</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <motion.button
                key={v.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm",
                  v.id === variantId
                    ? "border-brand text-brand font-semibold"
                    : "border-border text-foreground/80"
                )}
              >
                {v.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-muted">
        {outOfStock
          ? "Agotado temporalmente"
          : variant.stock <= 5
            ? `¡Solo quedan ${variant.stock} unidades!`
            : "Disponible"}
      </p>

      <motion.div whileHover={{ scale: outOfStock ? 1 : 1.02 }} whileTap={{ scale: outOfStock ? 1 : 0.97 }}>
        <Button size="lg" className="w-full relative overflow-hidden" disabled={outOfStock} onClick={handleAdd}>
          <AnimatePresence mode="wait" initial={false}>
            {justAdded ? (
              <motion.span
                key="added"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Check size={18} /> Añadido
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {outOfStock ? "Agotado" : "Añadir al carrito"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
