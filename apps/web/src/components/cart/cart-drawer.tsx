"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";

export function CartDrawer() {
  const { items: storeItems, isOpen, close, removeItem, setQuantity, subtotal, hasHydrated } =
    useCartStore();
  // Antes de hidratar, se ignora lo persistido en localStorage para que el primer render
  // del cliente coincida exactamente con el del servidor (evita el warning de hidratación de React).
  const items = hasHydrated ? storeItems : [];
  const total = hasHydrated ? subtotal() : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold text-lg">Tu carrito</h2>
              <button onClick={close} aria-label="Cerrar carrito">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="text-muted text-sm mt-8 text-center">Tu carrito está vacío.</p>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 overflow-hidden"
                      >
                        <div className="relative h-16 w-16 shrink-0 rounded-md bg-muted-bg overflow-hidden">
                          {item.image && (
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted">{item.variantLabel}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                              className="rounded border border-border p-1"
                              aria-label="Reducir cantidad"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                              className="rounded border border-border p-1"
                              aria-label="Aumentar cantidad"
                              disabled={item.quantity >= item.maxStock}
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="ml-auto text-danger"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold shrink-0">
                          {formatCOP(item.unitPrice * item.quantity)}
                        </p>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold">{formatCOP(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="block w-full rounded-full bg-brand py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
                >
                  Finalizar compra
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
