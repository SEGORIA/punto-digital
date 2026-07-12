"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/puntos-aliados", label: "Puntos Aliados" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const openCart = useCartStore((s) => s.open);
  const pathname = usePathname();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 8);
    setHidden(latest > 120 && latest > previous);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-40 bg-foreground text-white transition-shadow ${
        scrolled ? "shadow-lg shadow-black/20 backdrop-blur-md bg-foreground/95" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button
          className="md:hidden p-2 -ml-2 text-white"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/brand/logo-blanco.png"
            alt="Punto Digital Store"
            width={160}
            height={67}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-white/80 hover:text-white transition-colors py-1"
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full bg-brand"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <form
          action="/tienda"
          className="hidden md:flex flex-1 max-w-md ml-4 items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 transition-colors focus-within:border-brand"
        >
          <Search size={16} className="text-white/60 mr-2 shrink-0" />
          <input
            name="q"
            placeholder="¿Qué estás buscando?"
            className="w-full bg-transparent text-sm outline-none text-white placeholder:text-white/50"
          />
        </form>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={openCart}
          className="ml-auto relative flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 hover:border-brand transition-colors"
          aria-label="Abrir carrito"
        >
          <ShoppingCart size={20} />
          <AnimatePresence>
            {hasHydrated && totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-white"
              >
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-foreground"
          >
            <div className="px-4 py-3 flex flex-col gap-3">
              <form action="/tienda" className="flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 mb-2">
                <Search size={16} className="text-white/60 mr-2 shrink-0" />
                <input
                  name="q"
                  placeholder="¿Qué estás buscando?"
                  className="w-full bg-transparent text-sm outline-none text-white placeholder:text-white/50"
                />
              </form>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-white/80 py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
