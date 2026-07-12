"use client";

import { useEffect, useRef, useState } from "react";

/** Pausa trabajo costoso (como el loop de render 3D) cuando el elemento no está
 * visible en pantalla — ahorra batería/CPU en móviles sin sacrificar el efecto.
 * Arranca asumiendo que SÍ está visible (el uso típico es un hero sobre el fold,
 * visible desde el primer render) para que un observer que no dispare a tiempo
 * nunca deje el contenido oculto de forma silenciosa. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}
