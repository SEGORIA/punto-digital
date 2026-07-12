import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  open: () => void;
  close: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            const nextQty = Math.min(existing.quantity + quantity, existing.maxStock);
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: nextQty } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock) }],
            isOpen: true,
          };
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "punto-digital-cart",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
